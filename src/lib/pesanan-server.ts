import "server-only";
import { createHash, randomInt } from "node:crypto";
import {
  cocokkanNotifikasi,
  KODE_UNIK_MAKS,
  MASA_TELAT_HARI,
  nominalDariTeks,
  qrisBernominal,
  statusSesudahLunas,
  tanggalJakarta,
  type HasilCocok,
} from "@/lib/pembayaran";
import { GalatApi, supabaseServer } from "@/lib/supabase-server";

export const BATAS_BAYAR_JAM = 24;

export interface BarisPesananServer {
  id: string;
  kode: string;
  user_id: string | null;
  nama: string;
  total: number | string;
  status: string;
  status_bayar: string | null;
  nominal_bayar: number | string | null;
  kode_unik: number | null;
  qris_dinamis: string | null;
  batas_bayar: string | null;
  tanggal_acara: string;
}

const KOLOM =
  "id, kode, user_id, nama, total, status, status_bayar, nominal_bayar, kode_unik, qris_dinamis, batas_bayar, tanggal_acara";

export interface Tagihan {
  kode: string;
  nominal: number;
  kodeUnik: number;
  qris: string;
  batasBayar: string;
}

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

/** Menutup tagihan yang sudah lewat batas waktu (lihat 09-qris.sql). */
export async function kedaluwarsakanTagihan(): Promise<void> {
  const { error } = await supabaseServer().rpc("kedaluwarsakan_tagihan");
  if (error) console.error("Gagal menutup tagihan kedaluwarsa", error);
}

/** QRIS statis toko yang disimpan admin. Melempar 503 bila belum diisi. */
export async function qrisToko(): Promise<string> {
  const { data, error } = await supabaseServer().from("settings").select("qris_statis").eq("id", 1).maybeSingle();
  if (error) throw error;
  const qris = (data?.qris_statis as string | undefined)?.trim() ?? "";
  if (!qris) {
    throw new GalatApi(503, "Pembayaran QRIS belum disiapkan. Silakan hubungi Asri Catering lewat WhatsApp.");
  }
  return qris;
}

function tagihanDari(p: BarisPesananServer): Tagihan {
  return {
    kode: p.kode,
    nominal: Math.round(Number(p.nominal_bayar)),
    kodeUnik: p.kode_unik ?? 0,
    qris: p.qris_dinamis ?? "",
    batasBayar: p.batas_bayar ?? "",
  };
}

/**
 * Membuat tagihan QRIS: nominal = total + kode unik 1–999 yang belum dipakai
 * tagihan lain yang sedang menunggu. Keunikan dijaga index
 * orders_nominal_menunggu_key; bila bentrok, dicoba kode lain.
 */
export async function buatTagihan(pesanan: BarisPesananServer, statis?: string): Promise<Tagihan> {
  const qris = statis ?? (await qrisToko());
  const total = Math.round(Number(pesanan.total));
  await kedaluwarsakanTagihan();

  for (let coba = 0; coba < 25; coba++) {
    const kodeUnik = randomInt(1, KODE_UNIK_MAKS + 1);
    const nominal = total + kodeUnik;
    const batas = new Date(Date.now() + BATAS_BAYAR_JAM * 3600_000).toISOString();
    const { data, error } = await supabaseServer()
      .from("orders")
      .update({
        kode_unik: kodeUnik,
        nominal_bayar: nominal,
        qris_dinamis: qrisBernominal(qris, nominal),
        batas_bayar: batas,
        status_bayar: "Menunggu",
        metode_bayar: "QRIS",
        diklaim_bayar_pada: null,
        status: "Menunggu Pembayaran",
      })
      .eq("id", pesanan.id)
      .select(KOLOM)
      .single();
    if (!error) return tagihanDari(data as unknown as BarisPesananServer);
    if (error.code !== "23505") throw error;
  }
  throw new GalatApi(503, "Sedang banyak tagihan yang menunggu. Coba lagi beberapa menit lagi.");
}

/**
 * Tagihan untuk halaman pesanan: dipakai ulang selama masih berlaku, dibuat
 * baru bila pesanan batal karena kedaluwarsa dan jadwalnya masih H-1.
 */
export async function siapkanTagihan(pesanan: BarisPesananServer): Promise<Tagihan> {
  if (pesanan.status_bayar === "Lunas") throw new GalatApi(409, "Pesanan ini sudah lunas.");
  const masihBerlaku =
    pesanan.status_bayar === "Menunggu" &&
    pesanan.qris_dinamis &&
    pesanan.batas_bayar &&
    new Date(pesanan.batas_bayar).getTime() > Date.now();
  if (masihBerlaku) return tagihanDari(pesanan);

  if (pesanan.status !== "Menunggu Pembayaran" && pesanan.status !== "Dibatalkan") {
    throw new GalatApi(409, "Pesanan ini tidak menunggu pembayaran.");
  }
  if (pesanan.status === "Dibatalkan" && pesanan.status_bayar !== "Kedaluwarsa") {
    throw new GalatApi(409, "Pesanan ini sudah dibatalkan.");
  }
  if (pesanan.tanggal_acara < tanggalJakarta(new Date(), 1)) {
    throw new GalatApi(409, "Jadwal acara sudah terlalu dekat. Silakan buat pesanan baru.");
  }
  return buatTagihan(pesanan);
}

export interface SumberLunas {
  jenis: "notifikasi" | "manual";
  keterangan: string;
  jumlah: number;
  rujukan: string;
  mentah?: Record<string, unknown>;
}

/**
 * Menandai pesanan lunas dan mencatatnya di histori pembayaran.
 * Pembaruan bersyarat (status_bayar belum Lunas) mencegah dua notifikasi
 * yang datang bersamaan menulis ganda.
 */
export async function tandaiLunas(pesanan: BarisPesananServer, sumber: SumberLunas): Promise<boolean> {
  const db = supabaseServer();
  const kini = new Date().toISOString();
  const { data, error } = await db
    .from("orders")
    .update({
      status_bayar: "Lunas",
      status: statusSesudahLunas(pesanan.status),
      metode_bayar: "QRIS",
      dibayar_pada: kini,
    })
    .eq("id", pesanan.id)
    .neq("status_bayar", "Lunas")
    .select("id");
  if (error) throw error;
  if (!data || data.length === 0) return false;

  const { error: galatCatat } = await db.from("payments").insert({
    order_id: pesanan.id,
    transaction_id: sumber.rujukan,
    status_transaksi: sumber.jenis === "manual" ? "manual" : "settlement",
    jenis_pembayaran: "QRIS",
    keterangan: sumber.keterangan.slice(0, 500),
    jumlah: sumber.jumlah,
    waktu_transaksi: kini,
    waktu_lunas: kini,
    mentah: sumber.mentah ?? {},
  });
  if (galatCatat) console.error("Gagal mencatat histori pembayaran", galatCatat);
  return true;
}

/**
 * Memproses satu notifikasi "pembayaran diterima" dari HP pemilik:
 * dicatat di qris_notifikasi, dicocokkan dengan tagihan, lalu pesanan yang
 * cocok ditandai lunas.
 */
export async function prosesNotifikasi(teks: string, aplikasi: string): Promise<HasilCocok & { kode?: string }> {
  const db = supabaseServer();
  // Kiriman ganda dari aplikasi otomasi biasanya hanya terpaut detik.
  const jendela = Math.floor(Date.now() / 120_000);
  const sidik = createHash("sha256").update(`${aplikasi}\n${teks}\n${jendela}`).digest("hex");
  const nominal = nominalDariTeks(teks);

  const { data: log, error: galatLog } = await db
    .from("qris_notifikasi")
    .insert({ sidik, teks: teks.slice(0, 1000), aplikasi: aplikasi.slice(0, 120), nominal: nominal[0] ?? null, hasil: "tidak_cocok" })
    .select("id")
    .single();
  if (galatLog) {
    if (galatLog.code === "23505") return { hasil: "ganda", id: "" };
    throw galatLog;
  }

  let hasil: HasilCocok = { hasil: "tanpa_nominal" };
  let kode: string | undefined;
  if (nominal.length > 0) {
    await kedaluwarsakanTagihan();
    const sejak = new Date(Date.now() - MASA_TELAT_HARI * 86_400_000).toISOString();
    const { data: calon, error } = await db
      .from("orders")
      .select("id, nominal_bayar, status_bayar, batas_bayar, dibayar_pada")
      .in("nominal_bayar", nominal)
      .gte("batas_bayar", sejak);
    if (error) throw error;
    hasil = cocokkanNotifikasi(
      nominal,
      (calon ?? []).map((c) => ({
        id: c.id as string,
        nominal: Number(c.nominal_bayar),
        status_bayar: c.status_bayar as string | null,
        batas_bayar: c.batas_bayar as string | null,
        dibayar_pada: c.dibayar_pada as string | null,
      })),
    );

    if (hasil.hasil === "cocok") {
      const { data: baris } = await db.from("orders").select(KOLOM).eq("id", hasil.id).single();
      const pesanan = baris as unknown as BarisPesananServer;
      kode = pesanan.kode;
      const diubah = await tandaiLunas(pesanan, {
        jenis: "notifikasi",
        keterangan: teks,
        jumlah: Math.round(Number(pesanan.nominal_bayar)),
        rujukan: `qris-${sidik.slice(0, 24)}`,
        mentah: { aplikasi, teks, telat: hasil.telat },
      });
      if (!diubah) hasil = { hasil: "ganda", id: pesanan.id };
    }
  }

  await db
    .from("qris_notifikasi")
    .update({ hasil: hasil.hasil, order_id: "id" in hasil && hasil.id ? hasil.id : null })
    .eq("id", log.id);
  return { ...hasil, kode };
}
