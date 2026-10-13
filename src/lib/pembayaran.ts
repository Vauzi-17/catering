/**
 * Logika murni untuk pemesanan dan pembayaran online.
 *
 * Berkas ini sengaja tidak mengimpor apa pun supaya bisa dipakai di server,
 * di browser, dan diuji langsung dengan Node (lihat scripts/uji-pembayaran.ts).
 * Semua keputusan penting — harga, jarak, QRIS bernominal, dan pencocokan
 * notifikasi pembayaran — dihitung di sini.
 */

// ------------------------------------------------------------------ jarak

export interface Titik {
  lat: number;
  lng: number;
}

/** Jarak garis lurus dua titik di permukaan bumi, dalam kilometer. */
export function jarakKm(a: Titik, b: Titik): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function titikSah(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

// ---------------------------------------------------------------- tanggal

/** Tanggal (YYYY-MM-DD) di zona Asia/Jakarta, digeser sejumlah hari. */
export function tanggalJakarta(sekarang: Date, geserHari = 0): string {
  const wib = new Date(sekarang.getTime() + 7 * 3600_000 + geserHari * 86_400_000);
  return wib.toISOString().slice(0, 10);
}

/** Pesanan paling lambat dibuat H-2: acara hari ini dan besok ditolak. */
export const JEDA_PESAN_HARI = 2;

/** Tanggal acara paling awal yang masih boleh dipesan (WIB). */
export function tanggalPalingCepat(sekarang: Date): string {
  return tanggalJakarta(sekarang, JEDA_PESAN_HARI);
}

// ----------------------------------------------------------------- harga

export interface MenuHarga {
  id: string;
  nama: string;
  hargaJual: number;
  minimalPesan: number;
  tersedia: boolean;
}

export interface BarisDipesan {
  menuId: string;
  qty: number;
}

export interface RincianHarga {
  baris: { menuId: string; nama: string; qty: number; harga: number }[];
  total: number;
}

export const MAKS_PORSI_PER_PAKET = 5000;

/**
 * Menghitung rincian dan total dari daftar menu di basis data, bukan dari
 * harga yang dikirim browser. Melempar Error berisi pesan untuk pelanggan
 * bila ada isi keranjang yang tidak sah.
 */
export function hitungRincian(items: BarisDipesan[], menus: MenuHarga[]): RincianHarga {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Keranjang masih kosong.");
  }
  const sudah = new Set<string>();
  const baris = items.map((it) => {
    const menu = menus.find((m) => m.id === it.menuId);
    if (!menu || !menu.tersedia) throw new Error("Ada paket yang sudah tidak tersedia. Periksa keranjang Anda.");
    if (sudah.has(menu.id)) throw new Error(`${menu.nama} tercantum dua kali di keranjang.`);
    sudah.add(menu.id);
    if (!Number.isInteger(it.qty) || it.qty < menu.minimalPesan) {
      throw new Error(`${menu.nama} minimal ${menu.minimalPesan} porsi.`);
    }
    if (it.qty > MAKS_PORSI_PER_PAKET) {
      throw new Error(`${menu.nama} maksimal ${MAKS_PORSI_PER_PAKET} porsi per pesanan.`);
    }
    return { menuId: menu.id, nama: menu.nama, qty: it.qty, harga: Math.round(menu.hargaJual) };
  });
  const total = baris.reduce((a, b) => a + b.harga * b.qty, 0);
  return { baris, total };
}

// ------------------------------------------------------------------ QRIS

/**
 * QRIS memakai format EMVCo Merchant Presented Mode: deretan elemen
 * "ID (2 digit) + panjang (2 digit) + nilai", diakhiri tag 63 berisi CRC16.
 * QR statis toko (tag 01 = "11") tidak membawa nominal; pembeli mengetik
 * sendiri. Dengan menyisipkan tag 54 (nominal), mengganti tag 01 menjadi
 * "12", lalu menghitung ulang CRC, aplikasi pembayar langsung terisi nominal.
 */

export interface ElemenQris {
  id: string;
  nilai: string;
}

/** CRC-16/CCITT-FALSE (poly 0x1021, awal 0xFFFF) atas byte UTF-8 teks. */
export function crc16(teks: string): string {
  let crc = 0xffff;
  for (const b of new TextEncoder().encode(teks)) {
    crc ^= b << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function uraiTlv(teks: string): ElemenQris[] {
  const hasil: ElemenQris[] = [];
  let i = 0;
  while (i < teks.length) {
    const id = teks.slice(i, i + 2);
    const panjang = Number(teks.slice(i + 2, i + 4));
    if (!/^\d{2}$/.test(id) || !/^\d{2}$/.test(teks.slice(i + 2, i + 4)) || i + 4 + panjang > teks.length) {
      throw new Error("Format QRIS tidak dikenali.");
    }
    hasil.push({ id, nilai: teks.slice(i + 4, i + 4 + panjang) });
    i += 4 + panjang;
  }
  return hasil;
}

function susunTlv(elemen: ElemenQris[]): string {
  return elemen.map((e) => e.id + String(e.nilai.length).padStart(2, "0") + e.nilai).join("");
}

export interface InfoQris {
  statis: boolean;
  nama: string;
  kota: string;
  nominal: number | null;
}

/** Memeriksa teks QRIS (format, CRC, negara) dan mengambil nama toko. */
export function periksaQris(teks: string): InfoQris {
  const bersih = teks.trim();
  if (!bersih.startsWith("000201")) throw new Error("Ini bukan kode QRIS.");
  const elemen = uraiTlv(bersih);
  const akhir = elemen[elemen.length - 1];
  if (!akhir || akhir.id !== "63" || akhir.nilai.length !== 4) throw new Error("Kode QRIS tidak lengkap.");
  if (crc16(bersih.slice(0, -4)) !== akhir.nilai.toUpperCase()) {
    throw new Error("Kode QRIS rusak (CRC tidak cocok). Pindai ulang gambarnya.");
  }
  const ambil = (id: string) => elemen.find((e) => e.id === id)?.nilai ?? "";
  if (ambil("58") !== "ID") throw new Error("QRIS harus diterbitkan di Indonesia.");
  if (!ambil("59")) throw new Error("Nama toko pada QRIS tidak ditemukan.");
  const nominal = ambil("54");
  return {
    statis: ambil("01") !== "12",
    nama: ambil("59"),
    kota: ambil("60"),
    nominal: nominal ? Number(nominal) : null,
  };
}

/**
 * Membuat QRIS bernominal dari QRIS toko. Tag tip (55–57) dan nominal lama
 * dibuang supaya pembayar tidak bisa menambah atau mengubah jumlah.
 */
export function qrisBernominal(statis: string, nominal: number): string {
  if (!Number.isInteger(nominal) || nominal <= 0 || nominal > 9_999_999_999) {
    throw new Error("Nominal QRIS tidak sah.");
  }
  periksaQris(statis);
  const elemen = uraiTlv(statis.trim())
    .filter((e) => !["54", "55", "56", "57", "63"].includes(e.id))
    .map((e) => (e.id === "01" ? { id: "01", nilai: "12" } : e));
  const posisi = elemen.findIndex((e) => Number(e.id) > 54);
  const baru = { id: "54", nilai: String(nominal) };
  if (posisi === -1) elemen.push(baru);
  else elemen.splice(posisi, 0, baru);
  const tanpaCrc = susunTlv(elemen) + "6304";
  return tanpaCrc + crc16(tanpaCrc);
}

/**
 * Mengambil semua nominal rupiah dari teks notifikasi, mis.
 * "Pembayaran QRIS Rp150.237 diterima" atau "IDR 150,237.00 masuk".
 */
export function nominalDariTeks(teks: string): number[] {
  const hasil = new Set<number>();
  const pola = /(?:Rp|IDR)\.?\s*([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]+)(?:[.,]([0-9]{1,2}))?(?![0-9])/gi;
  for (const m of teks.matchAll(pola)) {
    if (m[2] && Number(m[2]) !== 0) continue; // ada sen, bukan nominal QRIS kita
    const angka = Number(m[1].replace(/[.,]/g, ""));
    if (Number.isInteger(angka) && angka > 0) hasil.add(angka);
  }
  return [...hasil];
}

export const KODE_UNIK_MAKS = 999;
export const MASA_TELAT_HARI = 3;
export const JEDA_GANDA_MENIT = 15;

export interface CalonPesanan {
  id: string;
  nominal: number;
  status_bayar: string | null;
  batas_bayar: string | null;
  dibayar_pada: string | null;
}

export type HasilCocok =
  | { hasil: "cocok"; id: string; telat: boolean }
  | { hasil: "ganda"; id: string }
  | { hasil: "tidak_cocok" | "tanpa_nominal" };

/**
 * Menentukan pesanan mana yang dibayar oleh satu notifikasi.
 *
 * - Tagihan aktif dengan nominal persis sama → cocok.
 * - Tidak ada tagihan aktif, tapi ada tepat satu yang baru kedaluwarsa
 *   (paling lama 3 hari) → tetap cocok; uangnya sudah masuk.
 * - Pesanan dengan nominal itu baru saja lunas → notifikasi ganda.
 * - Selain itu tidak dicocokkan otomatis; admin memeriksanya.
 */
export function cocokkanNotifikasi(nominal: number[], calon: CalonPesanan[], sekarang = new Date()): HasilCocok {
  if (nominal.length === 0) return { hasil: "tanpa_nominal" };
  const t = sekarang.getTime();
  const sesuai = calon.filter((c) => nominal.includes(Math.round(c.nominal)));
  const batas = (c: CalonPesanan) => (c.batas_bayar ? new Date(c.batas_bayar).getTime() : 0);

  const aktif = sesuai.filter((c) => c.status_bayar === "Menunggu" && batas(c) > t);
  if (aktif.length === 1) return { hasil: "cocok", id: aktif[0].id, telat: false };
  if (aktif.length > 1) return { hasil: "tidak_cocok" };

  const baruLunas = sesuai.filter(
    (c) => c.status_bayar === "Lunas" && c.dibayar_pada && t - new Date(c.dibayar_pada).getTime() < JEDA_GANDA_MENIT * 60_000,
  );
  if (baruLunas.length > 0) return { hasil: "ganda", id: baruLunas[0].id };

  const telat = sesuai.filter(
    (c) =>
      (c.status_bayar === "Kedaluwarsa" || c.status_bayar === "Menunggu") &&
      batas(c) <= t &&
      t - batas(c) < MASA_TELAT_HARI * 86_400_000,
  );
  if (telat.length === 1) return { hasil: "cocok", id: telat[0].id, telat: true };
  return { hasil: "tidak_cocok" };
}

/** Status alur sesudah lunas: hanya pesanan yang belum berjalan yang digeser. */
export function statusSesudahLunas(status: string): string {
  return status === "Menunggu Pembayaran" || status === "Dibatalkan" ? "Dibayar" : status;
}
