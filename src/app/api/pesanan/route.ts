import { hitungRincian, jarakKm, tanggalJakarta, titikSah, type BarisDipesan } from "@/lib/pembayaran";
import { ambilPesananKode, buatTagihan, infoPengantaran, qrisToko } from "@/lib/pesanan-server";
import { GalatApi, jawabGalat, penggunaDariRequest, supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

interface Masukan {
  items: BarisDipesan[];
  nama: string;
  telepon: string;
  tanggalAcara: string;
  waktuAntar: string;
  metode: "Antar ke Alamat" | "Ambil di Tempat";
  alamat: string;
  patokan: string;
  lat: number | null;
  lng: number | null;
  catatan: string;
}

const teks = (v: unknown, maks: number) => (typeof v === "string" ? v.trim().slice(0, maks) : "");

/**
 * Membuat pesanan baru milik pengguna yang sedang login, lalu membuat
 * tagihan QRIS bernominal unik. Harga selalu diambil dari tabel menus.
 */
export async function POST(req: Request) {
  try {
    const pengguna = await penggunaDariRequest(req);
    const m = (await req.json().catch(() => null)) as Partial<Masukan> | null;
    if (!m) throw new GalatApi(400, "Data pesanan tidak terbaca.");

    const nama = teks(m.nama, 120);
    const telepon = teks(m.telepon, 30);
    const alamat = teks(m.alamat, 500);
    const patokan = teks(m.patokan, 300);
    const catatan = teks(m.catatan, 1000);
    const metode = m.metode === "Ambil di Tempat" ? "Ambil di Tempat" : "Antar ke Alamat";
    const waktuAntar = /^\d{2}:\d{2}$/.test(m.waktuAntar ?? "") ? m.waktuAntar! : "";
    const tanggalAcara = /^\d{4}-\d{2}-\d{2}$/.test(m.tanggalAcara ?? "") ? m.tanggalAcara! : "";

    if (nama.length < 3) throw new GalatApi(400, "Nama pemesan minimal 3 huruf.");
    if (!/^[0-9+\-\s()]{9,}$/.test(telepon)) throw new GalatApi(400, "Nomor WhatsApp tidak valid.");
    if (!waktuAntar) throw new GalatApi(400, "Pilih jam pengantaran.");
    if (!tanggalAcara || tanggalAcara < tanggalJakarta(new Date(), 1)) {
      throw new GalatApi(400, "Tanggal acara paling cepat besok (H-1).");
    }

    if (metode === "Antar ke Alamat") {
      if (alamat.length < 10) throw new GalatApi(400, "Tuliskan alamat lengkap lokasi acara.");
      if (!titikSah(m.lat, m.lng)) throw new GalatApi(400, "Tandai lokasi acara di peta.");
      const dapur = await infoPengantaran();
      const jarak = jarakKm(dapur, { lat: m.lat as number, lng: m.lng as number });
      if (jarak > dapur.radiusKm) {
        throw new GalatApi(
          400,
          `Lokasi berjarak ${jarak.toFixed(1)} km dari dapur, di luar area layanan (${dapur.radiusKm} km).`,
        );
      }
    }

    // Pastikan QRIS toko sudah disiapkan sebelum pesanan disimpan.
    const statis = await qrisToko();

    const db = supabaseServer();
    const ids = (m.items ?? []).map((it) => String(it.menuId));
    const { data: menus, error: galatMenu } = await db
      .from("menus")
      .select("id, nama, harga_jual, minimal_pesan, tersedia")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    if (galatMenu) throw galatMenu;

    let rincian;
    try {
      rincian = hitungRincian(
        (m.items ?? []).map((it) => ({ menuId: String(it.menuId), qty: Number(it.qty) })),
        (menus ?? []).map((x) => ({
          id: x.id as string,
          nama: x.nama as string,
          hargaJual: Number(x.harga_jual),
          minimalPesan: Number(x.minimal_pesan),
          tersedia: Boolean(x.tersedia),
        })),
      );
    } catch (e) {
      throw new GalatApi(400, (e as Error).message);
    }

    // Kode pesanan dibentuk trigger di basis data.
    const { data: baru, error } = await db
      .from("orders")
      .insert({
        kode: "",
        user_id: pengguna.id,
        email: pengguna.email ?? "",
        nama,
        telepon,
        alamat: metode === "Ambil di Tempat" ? "Diambil di dapur Asri Catering" : alamat,
        patokan: metode === "Ambil di Tempat" ? "" : patokan,
        lat: metode === "Ambil di Tempat" ? null : m.lat,
        lng: metode === "Ambil di Tempat" ? null : m.lng,
        tanggal_acara: tanggalAcara,
        waktu_antar: waktuAntar,
        metode,
        catatan,
        total: rincian.total,
        status: "Menunggu Pembayaran",
        status_bayar: "Menunggu",
        metode_bayar: "QRIS",
      })
      .select("id, kode")
      .single();
    if (error) throw error;

    const { error: galatRincian } = await db.from("order_details").insert(
      rincian.baris.map((b) => ({
        order_id: baru.id,
        menu_id: b.menuId,
        nama_menu: b.nama,
        qty: b.qty,
        harga: b.harga,
      })),
    );
    if (galatRincian) {
      await db.from("orders").delete().eq("id", baru.id);
      throw galatRincian;
    }

    const pesanan = await ambilPesananKode(baru.kode as string);
    try {
      return Response.json(await buatTagihan(pesanan, statis));
    } catch (e) {
      // Pesanan tetap tersimpan; pelanggan bisa mencoba bayar lagi dari
      // halaman pesanannya.
      if (e instanceof GalatApi) {
        return Response.json({ kode: pesanan.kode, galat: e.message }, { status: e.status });
      }
      throw e;
    }
  } catch (e) {
    return jawabGalat(e);
  }
}
