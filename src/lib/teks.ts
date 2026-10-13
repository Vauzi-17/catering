import type { Bahasa } from "@/store/BahasaProvider";
import { menuAwal } from "@/data/menu";
import type { KategoriMenu, Menu, StatusBayar, StatusPesanan } from "@/lib/types";

/**
 * Teks domain dalam dua bahasa: kategori, satuan, isi menu, status pesanan,
 * dan tanggal. Dipakai halaman pelanggan; panel admin tetap bahasa Indonesia.
 */

const KATEGORI_EN: Record<KategoriMenu, string> = {
  "Nasi Box": "Rice Box",
  Prasmanan: "Buffet",
  Tumpeng: "Tumpeng",
  "Snack Box": "Snack Box",
  "Lauk Satuan": "Side Dishes",
};

export function namaKategori(k: string, bahasa: Bahasa): string {
  if (k === "Semua") return bahasa === "en" ? "All" : "Semua";
  return bahasa === "en" ? (KATEGORI_EN[k as KategoriMenu] ?? k) : k;
}

const SATUAN_EN: Record<string, string> = { box: "box", porsi: "portion", paket: "package", pcs: "pcs", potong: "piece" };

/** "per box" → "box" / "box", "per porsi" → "porsi" / "portion". */
export function satuan(menu: { satuanJual: string }, bahasa: Bahasa): string {
  const dasar = menu.satuanJual.replace(/^per\s+/i, "").trim();
  return bahasa === "en" ? (SATUAN_EN[dasar.toLowerCase()] ?? dasar) : dasar;
}

/** "per box" / "per box", "per porsi" / "per portion". */
export function satuanJual(menu: { satuanJual: string }, bahasa: Bahasa): string {
  return `per ${satuan(menu, bahasa)}`;
}

export interface TeksMenu {
  nama: string;
  deskripsi: string;
  deskripsiPanjang: string;
  isi: string[];
}

// Terjemahan bawaan untuk menu dari src/data/menu.ts. Dipakai bila kolom *_en
// di basis data masih kosong, dan hanya selama teks Indonesianya belum
// disunting, supaya versi Inggris tidak menggambarkan isi yang berbeda.
const bawaanEn = new Map(menuAwal.map((m) => [m.slug, m]));
const isiBawaanEn = new Map(
  menuAwal.flatMap((m) => (m.isiEn ? m.isi.map((item, i) => [item, m.isiEn![i]] as const) : [])),
);

function sama(a: string, b: string) {
  return a.trim().replace(/\s+/g, " ") === b.trim().replace(/\s+/g, " ");
}

/** Nama, deskripsi, dan isi menu sesuai bahasa; tanpa terjemahan → versi Indonesia. */
export function teksMenu(menu: Menu, bahasa: Bahasa): TeksMenu {
  if (bahasa !== "en") {
    return { nama: menu.nama, deskripsi: menu.deskripsi, deskripsiPanjang: menu.deskripsiPanjang, isi: menu.isi };
  }
  const asal = bawaanEn.get(menu.slug);
  const dariBawaan = (idDb: string, idAsal?: string, en?: string) =>
    asal && en && idAsal !== undefined && sama(idDb, idAsal) ? en : "";
  const deskripsi =
    menu.deskripsiEn?.trim() || dariBawaan(menu.deskripsi, asal?.deskripsi, asal?.deskripsiEn) || menu.deskripsi;
  return {
    nama: menu.namaEn?.trim() || dariBawaan(menu.nama, asal?.nama, asal?.namaEn) || menu.nama,
    deskripsi,
    deskripsiPanjang:
      menu.deskripsiPanjangEn?.trim() ||
      dariBawaan(menu.deskripsiPanjang, asal?.deskripsiPanjang, asal?.deskripsiPanjangEn) ||
      menu.deskripsiEn?.trim() ||
      menu.deskripsiPanjang,
    isi:
      menu.isiEn && menu.isiEn.length > 0
        ? menu.isiEn
        : menu.isi.map((item) => isiBawaanEn.get(item.trim()) ?? item),
  };
}

const STATUS_EN: Record<StatusPesanan, string> = {
  "Menunggu Pembayaran": "Awaiting Payment",
  "Menunggu Konfirmasi": "Awaiting Confirmation",
  Dibayar: "Paid",
  Diproses: "Being Prepared",
  Dikirim: "On Delivery",
  Selesai: "Completed",
  Dibatalkan: "Cancelled",
};

export function namaStatus(s: StatusPesanan, bahasa: Bahasa): string {
  return bahasa === "en" ? STATUS_EN[s] : s;
}

const TAHAP: Record<StatusPesanan, [string, string]> = {
  "Menunggu Pembayaran": ["Menunggu pembayaran", "Awaiting payment"],
  "Menunggu Konfirmasi": ["Menunggu konfirmasi", "Awaiting confirmation"],
  Dibayar: ["Pembayaran diterima", "Payment received"],
  Diproses: ["Dimasak di dapur", "Cooking in the kitchen"],
  Dikirim: ["Dalam pengantaran", "Out for delivery"],
  Selesai: ["Pesanan selesai", "Order completed"],
  Dibatalkan: ["Dibatalkan", "Cancelled"],
};

export function labelTahap(s: StatusPesanan, bahasa: Bahasa): string {
  return TAHAP[s][bahasa === "en" ? 1 : 0];
}

const KETERANGAN: Record<StatusPesanan, [string, string]> = {
  "Menunggu Pembayaran": [
    "Selesaikan pembayaran supaya pesanan masuk antrean dapur.",
    "Complete the payment so your order joins the kitchen queue.",
  ],
  "Menunggu Konfirmasi": ["Pesanan menunggu konfirmasi admin.", "Your order is awaiting confirmation."],
  Dibayar: [
    "Pembayaran sudah kami terima. Pesanan masuk antrean dapur.",
    "We have received your payment. Your order is in the kitchen queue.",
  ],
  Diproses: ["Pesanan sedang disiapkan dan dimasak di dapur.", "Your order is being prepared and cooked."],
  Dikirim: ["Pesanan dalam perjalanan ke lokasi Anda.", "Your order is on its way to you."],
  Selesai: [
    "Pesanan sudah diterima. Terima kasih telah memesan di Asri Catering.",
    "Your order has been delivered. Thank you for ordering from Asri Catering.",
  ],
  Dibatalkan: ["Pesanan ini dibatalkan.", "This order was cancelled."],
};

export function keteranganStatus(s: StatusPesanan, bahasa: Bahasa): string {
  return KETERANGAN[s][bahasa === "en" ? 1 : 0];
}

const BAYAR: Record<StatusBayar, [string, string]> = {
  Menunggu: ["Belum dibayar", "Unpaid"],
  Lunas: ["Lunas", "Paid"],
  Kedaluwarsa: ["Kedaluwarsa", "Expired"],
  Gagal: ["Gagal", "Failed"],
  Dikembalikan: ["Dikembalikan", "Refunded"],
};

export function labelBayar(s: StatusBayar, bahasa: Bahasa): string {
  return BAYAR[s][bahasa === "en" ? 1 : 0];
}

function keTanggal(iso: string): Date {
  return new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
}

/** "Jumat, 16 Oktober 2026" / "Friday, 16 October 2026". */
export function tanggalPanjangB(iso: string, bahasa: Bahasa): string {
  const d = keTanggal(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(bahasa === "en" ? "en-GB" : "id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "16 Okt 2026" / "16 Oct 2026". */
export function tanggalPendekB(iso: string, bahasa: Bahasa): string {
  const d = keTanggal(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(bahasa === "en" ? "en-GB" : "id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/** "13 Okt, 08.16" / "13 Oct, 08:16" (WIB). */
export function waktuPendekB(iso: string, bahasa: Bahasa): string {
  return new Date(iso).toLocaleString(bahasa === "en" ? "en-GB" : "id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}
