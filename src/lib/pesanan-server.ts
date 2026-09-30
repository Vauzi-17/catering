import "server-only";
import { ambilStatusTransaksi, buatTransaksiSnap } from "@/lib/midtrans";
import {
  kodeDariOrderId,
  namaMetode,
  orderIdMidtrans,
  pembaruanDariMidtrans,
  keIsoWib,
  type StatusMidtrans,
} from "@/lib/pembayaran";
import { GalatApi, supabaseServer } from "@/lib/supabase-server";

export const BATAS_BAYAR_JAM = 24;

export interface BarisPesananServer {
  id: string;
  kode: string;
  user_id: string | null;
  nama: string;
  telepon: string;
  email: string;
  total: number | string;
  status: string;
  status_bayar: string | null;
  midtrans_order_id: string | null;
  snap_token: string | null;
  snap_redirect_url: string | null;
  batas_bayar: string | null;
  order_details: { menu_id: string | null; nama_menu: string; qty: number; harga: number | string }[];
}

const KOLOM =
  "id, kode, user_id, nama, telepon, email, total, status, status_bayar, midtrans_order_id, snap_token, snap_redirect_url, batas_bayar, order_details(menu_id, nama_menu, qty, harga)";

export async function ambilPesananKode(kode: string): Promise<BarisPesananServer> {
  const { data, error } = await supabaseServer().from("orders").select(KOLOM).eq("kode", kode).maybeSingle();
  if (error) throw error;
  if (!data) throw new GalatApi(404, "Pesanan tidak ditemukan.");
  return data as unknown as BarisPesananServer;
}

export async function infoPengantaran(): Promise<{ lat: number; lng: number; radiusKm: number }> {
  const { data, error } = await supabaseServer()
    .from("settings")
    .select("dapur_lat, dapur_lng, radius_km")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return {
    lat: Number(data?.dapur_lat ?? -6.917464),
    lng: Number(data?.dapur_lng ?? 107.619123),
    radiusKm: Number(data?.radius_km ?? 25),
  };
}

/**
 * Membuat (atau memakai ulang) tagihan Snap untuk sebuah pesanan.
 * Tagihan lama dipakai ulang selama belum lewat batas bayar; bila sudah,
 * dibuat percobaan baru dengan order_id Midtrans yang berbeda.
 */
export async function siapkanTagihan(
  pesanan: BarisPesananServer,
  asal: string,
): Promise<{ token: string; redirectUrl: string }> {
  if (pesanan.status_bayar === "Lunas") throw new GalatApi(409, "Pesanan ini sudah lunas.");
  if (pesanan.status !== "Menunggu Pembayaran" && pesanan.status !== "Dibatalkan") {
    throw new GalatApi(409, "Pesanan ini tidak menunggu pembayaran.");
  }

  const masihBerlaku =
    pesanan.snap_token &&
    pesanan.snap_redirect_url &&
    pesanan.status_bayar !== "Kedaluwarsa" &&
    pesanan.status_bayar !== "Gagal" &&
    pesanan.batas_bayar &&
    new Date(pesanan.batas_bayar).getTime() > Date.now() + 5 * 60_000;
  if (masihBerlaku) return { token: pesanan.snap_token!, redirectUrl: pesanan.snap_redirect_url! };

  const sebelumnya = pesanan.midtrans_order_id ? kodeDariOrderId(pesanan.midtrans_order_id)?.percobaan ?? 0 : 0;
  const orderId = orderIdMidtrans(pesanan.kode, sebelumnya + 1);
  const total = Math.round(Number(pesanan.total));

  const tagihan = await buatTransaksiSnap({
    orderId,
    total,
    items: pesanan.order_details.map((d) => ({
      id: d.menu_id ?? d.nama_menu,
      nama: d.nama_menu,
      harga: Math.round(Number(d.harga)),
      qty: d.qty,
    })),
    pelanggan: { nama: pesanan.nama, email: pesanan.email, telepon: pesanan.telepon },
    kembaliKe: `${asal}/pesanan/${pesanan.kode}/`,
    batasJam: BATAS_BAYAR_JAM,
  });

  const { error } = await supabaseServer()
    .from("orders")
    .update({
      midtrans_order_id: orderId,
      snap_token: tagihan.token,
      snap_redirect_url: tagihan.redirectUrl,
      batas_bayar: new Date(Date.now() + BATAS_BAYAR_JAM * 3600_000).toISOString(),
      status_bayar: "Menunggu",
      // Pesanan yang batal karena kedaluwarsa dibuka lagi saat dibayar ulang.
      ...(pesanan.status === "Dibatalkan" ? { status: "Menunggu Pembayaran" } : {}),
    })
    .eq("id", pesanan.id);
  if (error) throw error;

  return tagihan;
}

type TransaksiLengkap = StatusMidtrans & {
  transaction_id?: string;
  gross_amount?: string;
  status_code?: string;
};

/**
 * Mencatat satu status transaksi Midtrans ke histori pembayaran lalu
 * memperbarui pesanan. Aman dipanggil berulang untuk status yang sama.
 */
export async function catatTransaksi(trx: TransaksiLengkap): Promise<{ kode: string; diubah: boolean }> {
  const asal = kodeDariOrderId(trx.order_id);
  if (!asal) throw new GalatApi(404, "order_id bukan milik Asri Catering.");
  const pesanan = await ambilPesananKode(asal.kode);
  const db = supabaseServer();

  const { error: galatCatat } = await db.from("payments").upsert(
    {
      order_id: pesanan.id,
      midtrans_order_id: trx.order_id,
      transaction_id: trx.transaction_id ?? null,
      status_transaksi: trx.transaction_status,
      status_fraud: trx.fraud_status ?? null,
      jenis_pembayaran: namaMetode(trx),
      keterangan: trx.va_numbers?.[0]?.va_number ?? trx.permata_va_number ?? trx.bill_key ?? "",
      jumlah: Number(trx.gross_amount ?? pesanan.total),
      waktu_transaksi: trx.transaction_time ? keIsoWib(trx.transaction_time) : null,
      waktu_lunas: trx.settlement_time ? keIsoWib(trx.settlement_time) : null,
      mentah: trx,
    },
    { onConflict: "transaction_id,status_transaksi", ignoreDuplicates: true },
  );
  if (galatCatat) console.error("Gagal mencatat histori pembayaran", galatCatat);

  // Nominal harus sama persis dengan total pesanan sebelum dianggap lunas.
  if (trx.gross_amount && Math.round(Number(trx.gross_amount)) !== Math.round(Number(pesanan.total))) {
    console.error("Nominal pembayaran tidak cocok", trx.order_id, trx.gross_amount, pesanan.total);
    throw new GalatApi(400, "Nominal pembayaran tidak cocok dengan total pesanan.");
  }

  const patch = pembaruanDariMidtrans(pesanan, trx);
  if (!patch) return { kode: pesanan.kode, diubah: false };

  const { error } = await db.from("orders").update(patch).eq("id", pesanan.id);
  if (error) throw error;
  return { kode: pesanan.kode, diubah: true };
}

/** Menarik status terbaru dari Midtrans untuk percobaan aktif sebuah pesanan. */
export async function sinkronkanPesanan(pesanan: BarisPesananServer): Promise<boolean> {
  if (!pesanan.midtrans_order_id) return false;
  const trx = await ambilStatusTransaksi(pesanan.midtrans_order_id);
  if (!trx) return false;
  return (await catatTransaksi(trx)).diubah;
}
