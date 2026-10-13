import { apakahUuid, wajibSupabase } from "@/lib/supabase";
import type {
  Bahan,
  KategoriBahan,
  KategoriMenu,
  Menu,
  Pesanan,
  Pembayaran,
  Satuan,
  StatusBayar,
  StatusPesanan,
} from "@/lib/types";

/**
 * Lapisan akses data Supabase.
 *
 * Bentuk baris di basis data memakai snake_case (menus.harga_jual), sedangkan
 * antarmuka memakai camelCase (menu.hargaJual). Semua penerjemahan dikumpulkan
 * di berkas ini supaya komponen tidak perlu tahu struktur tabelnya.
 */

// ---------------------------------------------------------------- pemetaan

interface BarisMenu {
  id: string;
  slug: string;
  nama: string;
  deskripsi: string;
  deskripsi_panjang: string;
  harga_jual: number | string;
  satuan_jual: string;
  foto: string;
  isi: string[] | null;
  populer: boolean;
  tersedia: boolean;
  minimal_pesan: number;
  biaya_kemasan: number | string;
  biaya_tenaga_kerja: number | string;
  categories: { nama: string } | { nama: string }[] | null;
  recipes: { ingredient_id: string; jumlah: number | string }[] | null;
}

const angka = (v: number | string | null | undefined) => Number(v ?? 0);

function keMenu(baris: BarisMenu): Menu {
  const kategori = Array.isArray(baris.categories)
    ? baris.categories[0]?.nama
    : baris.categories?.nama;

  return {
    id: baris.id,
    slug: baris.slug,
    nama: baris.nama,
    kategori: (kategori ?? "Nasi Box") as KategoriMenu,
    deskripsi: baris.deskripsi,
    deskripsiPanjang: baris.deskripsi_panjang,
    hargaJual: angka(baris.harga_jual),
    satuanJual: baris.satuan_jual,
    foto: baris.foto ?? "",
    isi: baris.isi ?? [],
    populer: baris.populer,
    tersedia: baris.tersedia,
    minimalPesan: baris.minimal_pesan,
    biayaKemasan: angka(baris.biaya_kemasan),
    biayaTenagaKerja: angka(baris.biaya_tenaga_kerja),
    resep: (baris.recipes ?? []).map((r) => ({
      bahanId: r.ingredient_id,
      jumlah: angka(r.jumlah),
    })),
  };
}

const KOLOM_MENU =
  "id, slug, nama, deskripsi, deskripsi_panjang, harga_jual, satuan_jual, foto, isi, populer, tersedia, minimal_pesan, biaya_kemasan, biaya_tenaga_kerja, categories(nama), recipes(ingredient_id, jumlah)";

interface BarisBahan {
  id: string;
  nama: string;
  satuan: string;
  harga_satuan: number | string;
  kategori: string;
  stok: number | string;
  stok_minimum: number | string;
}

function keBahan(baris: BarisBahan): Bahan {
  return {
    id: baris.id,
    nama: baris.nama,
    satuan: baris.satuan as Satuan,
    hargaSatuan: angka(baris.harga_satuan),
    kategori: baris.kategori as KategoriBahan,
    stok: angka(baris.stok),
    stokMinimum: angka(baris.stok_minimum),
  };
}

interface BarisPesanan {
  id: string;
  kode: string;
  nama: string;
  telepon: string;
  alamat: string;
  tanggal_acara: string;
  waktu_antar: string;
  metode: string;
  catatan: string;
  total: number | string;
  status: string;
  dibuat_pada: string;
  patokan?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  status_bayar?: string | null;
  metode_bayar?: string | null;
  batas_bayar?: string | null;
  dibayar_pada?: string | null;
  nominal_bayar?: number | string | null;
  kode_unik?: number | null;
  qris_dinamis?: string | null;
  diklaim_bayar_pada?: string | null;
  payments?: BarisPembayaran[] | null;
  order_details:
    | { menu_id: string | null; nama_menu: string; qty: number; harga: number | string }[]
    | null;
  order_status_history: { status: string; waktu: string }[] | null;
}

interface BarisPembayaran {
  id: string;
  transaction_id: string | null;
  status_transaksi: string;
  jenis_pembayaran: string;
  keterangan: string;
  jumlah: number | string;
  waktu_transaksi: string | null;
  dibuat_pada: string;
}

function kePembayaran(b: BarisPembayaran): Pembayaran {
  return {
    id: b.id,
    transactionId: b.transaction_id,
    statusTransaksi: b.status_transaksi,
    jenisPembayaran: b.jenis_pembayaran,
    keterangan: b.keterangan,
    jumlah: angka(b.jumlah),
    waktuTransaksi: b.waktu_transaksi,
    dibuatPada: b.dibuat_pada,
  };
}

const angkaAtauNull = (v: number | string | null | undefined) =>
  v === null || v === undefined ? null : Number(v);

function kePesanan(baris: BarisPesanan): Pesanan {
  return {
    id: baris.id,
    kode: baris.kode,
    nama: baris.nama,
    telepon: baris.telepon,
    alamat: baris.alamat,
    tanggalAcara: baris.tanggal_acara,
    waktuAntar: baris.waktu_antar,
    metode: baris.metode as Pesanan["metode"],
    catatan: baris.catatan ?? "",
    total: angka(baris.total),
    status: baris.status as StatusPesanan,
    dibuatPada: baris.dibuat_pada,
    items: (baris.order_details ?? []).map((d) => ({
      menuId: d.menu_id ?? "",
      nama: d.nama_menu,
      qty: d.qty,
      harga: angka(d.harga),
    })),
    riwayat: (baris.order_status_history ?? [])
      .map((h) => ({ status: h.status as StatusPesanan, waktu: h.waktu }))
      .sort((a, b) => (a.waktu < b.waktu ? -1 : 1)),
    patokan: baris.patokan ?? "",
    lat: angkaAtauNull(baris.lat),
    lng: angkaAtauNull(baris.lng),
    statusBayar: (baris.status_bayar ?? null) as StatusBayar | null,
    metodeBayar: baris.metode_bayar ?? "",
    batasBayar: baris.batas_bayar ?? null,
    dibayarPada: baris.dibayar_pada ?? null,
    nominalBayar: angkaAtauNull(baris.nominal_bayar),
    kodeUnik: baris.kode_unik ?? null,
    qrisDinamis: baris.qris_dinamis ?? null,
    diklaimBayarPada: baris.diklaim_bayar_pada ?? null,
    pembayaran: (baris.payments ?? [])
      .map(kePembayaran)
      .sort((a, b) => (a.dibuatPada < b.dibuatPada ? 1 : -1)),
  };
}

const KOLOM_PESANAN =
  "id, kode, nama, telepon, alamat, tanggal_acara, waktu_antar, metode, catatan, total, status, dibuat_pada, patokan, lat, lng, status_bayar, metode_bayar, batas_bayar, dibayar_pada, nominal_bayar, kode_unik, diklaim_bayar_pada, order_details(menu_id, nama_menu, qty, harga), order_status_history(status, waktu)";

const KOLOM_PEMBAYARAN =
  "id, transaction_id, status_transaksi, jenis_pembayaran, keterangan, jumlah, waktu_transaksi, dibuat_pada";

// ------------------------------------------------------------------ baca

export async function ambilMenus(): Promise<Menu[]> {
  const { data, error } = await wajibSupabase()
    .from("menus")
    .select(KOLOM_MENU)
    .order("nama");
  if (error) throw error;
  return (data as unknown as BarisMenu[]).map(keMenu);
}

export async function ambilMenuSlug(slug: string): Promise<Menu | null> {
  const { data, error } = await wajibSupabase()
    .from("menus")
    .select(KOLOM_MENU)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? keMenu(data as unknown as BarisMenu) : null;
}

export async function ambilBahan(): Promise<Bahan[]> {
  const { data, error } = await wajibSupabase()
    .from("ingredients")
    .select("id, nama, satuan, harga_satuan, kategori, stok, stok_minimum")
    .order("nama");
  if (error) throw error;
  return (data as BarisBahan[]).map(keBahan);
}

/**
 * Menutup tagihan QRIS yang sudah lewat batas (fungsi di 09-qris.sql).
 * Dipanggil sebelum membaca pesanan; galat diabaikan karena pembacaan
 * tetap boleh jalan.
 */
async function kedaluwarsakanTagihan(): Promise<void> {
  try {
    await wajibSupabase().rpc("kedaluwarsakan_tagihan");
  } catch {
    /* abaikan */
  }
}

export async function ambilPesanan(): Promise<Pesanan[]> {
  await kedaluwarsakanTagihan();
  const { data, error } = await wajibSupabase()
    .from("orders")
    .select(KOLOM_PESANAN)
    .order("tanggal_acara", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data as unknown as BarisPesanan[]).map(kePesanan);
}

/** Pesanan milik akun yang sedang login (dibatasi RLS), terbaru di atas. */
export async function ambilPesananSaya(): Promise<Pesanan[]> {
  await kedaluwarsakanTagihan();
  const { data, error } = await wajibSupabase()
    .from("orders")
    .select(KOLOM_PESANAN)
    .order("dibuat_pada", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data as unknown as BarisPesanan[]).map(kePesanan);
}

/** Satu pesanan lengkap dengan histori pembayarannya. */
export async function ambilPesananDenganKode(kode: string): Promise<Pesanan | null> {
  await kedaluwarsakanTagihan();
  const { data, error } = await wajibSupabase()
    .from("orders")
    .select(`${KOLOM_PESANAN}, qris_dinamis, payments(${KOLOM_PEMBAYARAN})`)
    .eq("kode", kode)
    .maybeSingle();
  if (error) throw error;
  return data ? kePesanan(data as unknown as BarisPesanan) : null;
}

export interface TransaksiAdmin extends Pembayaran {
  kodePesanan: string;
  namaPemesan: string;
}

/** Histori transaksi untuk panel admin, terbaru di atas. */
export async function ambilTransaksi(): Promise<TransaksiAdmin[]> {
  const { data, error } = await wajibSupabase()
    .from("payments")
    .select(`${KOLOM_PEMBAYARAN}, orders(kode, nama)`)
    .order("dibuat_pada", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data as unknown as (BarisPembayaran & { orders: { kode: string; nama: string } | null })[]).map(
    (b) => ({
      ...kePembayaran(b),
      kodePesanan: b.orders?.kode ?? "",
      namaPemesan: b.orders?.nama ?? "",
    }),
  );
}

export interface NotifikasiQris {
  id: string;
  teks: string;
  aplikasi: string;
  nominal: number | null;
  hasil: "cocok" | "ganda" | "tidak_cocok" | "tanpa_nominal";
  diterimaPada: string;
  kodePesanan: string;
}

/** Log notifikasi pembayaran yang diteruskan dari HP pemilik (khusus admin). */
export async function ambilNotifikasiQris(): Promise<NotifikasiQris[]> {
  const { data, error } = await wajibSupabase()
    .from("qris_notifikasi")
    .select("id, teks, aplikasi, nominal, hasil, diterima_pada, orders(kode)")
    .order("diterima_pada", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (
    data as unknown as {
      id: string;
      teks: string;
      aplikasi: string;
      nominal: number | string | null;
      hasil: NotifikasiQris["hasil"];
      diterima_pada: string;
      orders: { kode: string } | null;
    }[]
  ).map((b) => ({
    id: b.id,
    teks: b.teks,
    aplikasi: b.aplikasi,
    nominal: angkaAtauNull(b.nominal),
    hasil: b.hasil,
    diterimaPada: b.diterima_pada,
    kodePesanan: b.orders?.kode ?? "",
  }));
}

/** QRIS statis toko (khusus admin, dibatasi RLS settings). */
export async function ambilQrisToko(): Promise<string> {
  const { data, error } = await wajibSupabase().from("settings").select("qris_statis").eq("id", 1).maybeSingle();
  if (error) throw error;
  return (data?.qris_statis as string | undefined) ?? "";
}

export async function simpanQrisToko(qris: string): Promise<void> {
  const { error } = await wajibSupabase().from("settings").upsert({ id: 1, qris_statis: qris });
  if (error) throw error;
}

export interface InfoPengantaran {
  lat: number;
  lng: number;
  radiusKm: number;
}

/** Titik dapur dan radius layanan, boleh dibaca siapa saja. */
export async function ambilInfoPengantaran(): Promise<InfoPengantaran | null> {
  const { data, error } = await wajibSupabase().rpc("info_pengantaran");
  if (error) throw error;
  const baris = (Array.isArray(data) ? data[0] : data) as
    | { dapur_lat: number | string; dapur_lng: number | string; radius_km: number | string }
    | undefined;
  if (!baris) return null;
  return { lat: Number(baris.dapur_lat), lng: Number(baris.dapur_lng), radiusKm: Number(baris.radius_km) };
}

export async function ambilPengaturan(): Promise<{
  overheadPersen: number;
  targetMargin: number;
  biayaOperasionalHarian: number;
} | null> {
  const { data, error } = await wajibSupabase()
    .from("settings")
    .select("overhead_persen, target_margin, biaya_operasional_harian")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    overheadPersen: angka(data.overhead_persen),
    targetMargin: angka(data.target_margin),
    biayaOperasionalHarian: angka(data.biaya_operasional_harian),
  };
}

// ----------------------------------------------------------------- tulis

async function idKategori(nama: string): Promise<string | null> {
  const db = wajibSupabase();
  const { data } = await db
    .from("categories")
    .select("id")
    .eq("nama", nama)
    .maybeSingle();
  if (data?.id) return data.id as string;

  const { data: baru, error } = await db
    .from("categories")
    .insert({ nama })
    .select("id")
    .single();
  if (error) throw error;
  return baru.id as string;
}

export async function simpanMenuDb(menu: Menu): Promise<Menu> {
  const db = wajibSupabase();

  const isi = {
    category_id: await idKategori(menu.kategori),
    slug: menu.slug,
    nama: menu.nama,
    deskripsi: menu.deskripsi,
    deskripsi_panjang: menu.deskripsiPanjang,
    harga_jual: menu.hargaJual,
    satuan_jual: menu.satuanJual,
    foto: menu.foto,
    isi: menu.isi,
    populer: menu.populer,
    tersedia: menu.tersedia,
    minimal_pesan: menu.minimalPesan,
    biaya_kemasan: menu.biayaKemasan,
    biaya_tenaga_kerja: menu.biayaTenagaKerja,
    diubah_pada: new Date().toISOString(),
  };

  // Menu baru dari panel admin memakai id sementara, biarkan basis data
  // yang memberi UUID-nya.
  const { data, error } = apakahUuid(menu.id)
    ? await db.from("menus").upsert({ id: menu.id, ...isi }).select("id").single()
    : await db.from("menus").insert(isi).select("id").single();
  if (error) throw error;

  const menuId = data.id as string;

  // Resep ditulis ulang seluruhnya supaya bahan yang dihapus ikut hilang.
  const { error: galatHapus } = await db
    .from("recipes")
    .delete()
    .eq("menu_id", menuId);
  if (galatHapus) throw galatHapus;

  const resep = menu.resep.filter((r) => r.bahanId && r.jumlah > 0);
  if (resep.length > 0) {
    const { error: galatResep } = await db.from("recipes").insert(
      resep.map((r) => ({
        menu_id: menuId,
        ingredient_id: r.bahanId,
        jumlah: r.jumlah,
      })),
    );
    if (galatResep) throw galatResep;
  }

  return { ...menu, id: menuId };
}

export async function hapusMenuDb(id: string): Promise<void> {
  const { error } = await wajibSupabase().from("menus").delete().eq("id", id);
  if (error) throw error;
}

export async function simpanBahanDb(bahan: Bahan): Promise<Bahan> {
  const db = wajibSupabase();
  const isi = {
    nama: bahan.nama,
    satuan: bahan.satuan,
    harga_satuan: bahan.hargaSatuan,
    kategori: bahan.kategori,
    stok: bahan.stok,
    stok_minimum: bahan.stokMinimum,
    diubah_pada: new Date().toISOString(),
  };

  const { data, error } = apakahUuid(bahan.id)
    ? await db.from("ingredients").upsert({ id: bahan.id, ...isi }).select("id").single()
    : await db.from("ingredients").insert(isi).select("id").single();
  if (error) throw error;

  return { ...bahan, id: data.id as string };
}

export async function hapusBahanDb(id: string): Promise<void> {
  const { error } = await wajibSupabase().from("ingredients").delete().eq("id", id);
  if (error) throw error;
}

export async function ubahStatusPesananDb(
  id: string,
  status: StatusPesanan,
): Promise<void> {
  const { error } = await wajibSupabase()
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function simpanPengaturanDb(p: {
  overheadPersen: number;
  targetMargin: number;
  biayaOperasionalHarian: number;
}): Promise<void> {
  const { error } = await wajibSupabase().from("settings").upsert({
    id: 1,
    overhead_persen: p.overheadPersen,
    target_margin: p.targetMargin,
    biaya_operasional_harian: p.biayaOperasionalHarian,
    diubah_pada: new Date().toISOString(),
  });
  if (error) throw error;
}

// ------------------------------------------------------------ foto menu

const BUCKET_FOTO = "menu";

/**
 * Mengunggah foto menu ke Supabase Storage (bucket "menu", lihat
 * supabase/07-foto-menu.sql) lalu mengembalikan URL publiknya untuk
 * disimpan di kolom menus.foto. Nama berkas selalu baru supaya cache
 * peramban dan CDN tidak menampilkan foto lama.
 */
export async function unggahFotoMenu(berkas: Blob, slug: string): Promise<string> {
  const ekstensi = berkas.type === "image/webp" ? "webp" : berkas.type === "image/png" ? "png" : "jpg";
  const dasar = (slug || "menu").replace(/[^a-z0-9-]/g, "").slice(0, 60) || "menu";
  const jalur = `${dasar}-${Date.now().toString(36)}.${ekstensi}`;
  const penyimpanan = wajibSupabase().storage.from(BUCKET_FOTO);
  const { error } = await penyimpanan.upload(jalur, berkas, {
    contentType: berkas.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  return penyimpanan.getPublicUrl(jalur).data.publicUrl;
}
