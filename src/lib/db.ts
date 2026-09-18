import { apakahUuid, wajibSupabase } from "@/lib/supabase";
import type {
  Bahan,
  KategoriBahan,
  KategoriMenu,
  Menu,
  Pesanan,
  Satuan,
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
  order_details:
    | { menu_id: string | null; nama_menu: string; qty: number; harga: number | string }[]
    | null;
  order_status_history: { status: string; waktu: string }[] | null;
}

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
  };
}

const KOLOM_PESANAN =
  "id, kode, nama, telepon, alamat, tanggal_acara, waktu_antar, metode, catatan, total, status, dibuat_pada, order_details(menu_id, nama_menu, qty, harga), order_status_history(status, waktu)";

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

export async function ambilPesanan(): Promise<Pesanan[]> {
  const { data, error } = await wajibSupabase()
    .from("orders")
    .select(KOLOM_PESANAN)
    .order("tanggal_acara", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data as unknown as BarisPesanan[]).map(kePesanan);
}

export async function cariPesananKode(kode: string): Promise<Pesanan | null> {
  const { data, error } = await wajibSupabase()
    .from("orders")
    .select(KOLOM_PESANAN)
    .ilike("kode", kode.trim())
    .maybeSingle();
  if (error) throw error;
  return data ? kePesanan(data as unknown as BarisPesanan) : null;
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

export async function buatPesananDb(
  data: Omit<Pesanan, "id" | "kode" | "status" | "dibuatPada" | "riwayat" | "total">,
): Promise<Pesanan> {
  const db = wajibSupabase();
  const total = data.items.reduce((a, it) => a + it.harga * it.qty, 0);

  // Kode pesanan dibentuk oleh trigger di basis data supaya tidak bentrok
  // ketika dua pelanggan memesan pada saat bersamaan.
  const { data: pesananBaru, error } = await db
    .from("orders")
    .insert({
      kode: "",
      nama: data.nama,
      telepon: data.telepon,
      alamat: data.alamat,
      tanggal_acara: data.tanggalAcara,
      waktu_antar: data.waktuAntar,
      metode: data.metode,
      catatan: data.catatan,
      total,
    })
    .select("id, kode, dibuat_pada")
    .single();
  if (error) throw error;

  const { error: galatRincian } = await db.from("order_details").insert(
    data.items.map((it) => ({
      order_id: pesananBaru.id,
      menu_id: apakahUuid(it.menuId) ? it.menuId : null,
      nama_menu: it.nama,
      qty: it.qty,
      harga: it.harga,
    })),
  );
  if (galatRincian) throw galatRincian;

  return {
    ...data,
    id: pesananBaru.id as string,
    kode: pesananBaru.kode as string,
    total,
    status: "Menunggu Konfirmasi",
    dibuatPada: pesananBaru.dibuat_pada as string,
    riwayat: [
      { status: "Menunggu Konfirmasi", waktu: pesananBaru.dibuat_pada as string },
    ],
  };
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
