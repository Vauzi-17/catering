import type { StatusBayar, StatusPesanan } from "@/lib/types";

/** Urutan tahap pesanan online, dari dibuat sampai selesai. */
export const ALUR_PESANAN: StatusPesanan[] = [
  "Menunggu Pembayaran",
  "Dibayar",
  "Diproses",
  "Dikirim",
  "Selesai",
];

export const KETERANGAN_STATUS: Record<StatusPesanan, string> = {
  "Menunggu Pembayaran": "Selesaikan pembayaran supaya pesanan masuk antrean dapur.",
  "Menunggu Konfirmasi": "Pesanan menunggu konfirmasi admin.",
  Dibayar: "Pembayaran diterima otomatis. Pesanan sudah masuk antrean dapur.",
  Diproses: "Pesanan sedang disiapkan dan dimasak di dapur.",
  Dikirim: "Pesanan dalam perjalanan ke lokasi Anda.",
  Selesai: "Pesanan sudah diterima. Terima kasih telah memesan di Asri Catering.",
  Dibatalkan: "Pesanan ini dibatalkan.",
};

export const LABEL_TAHAP: Record<StatusPesanan, string> = {
  "Menunggu Pembayaran": "Menunggu pembayaran",
  "Menunggu Konfirmasi": "Menunggu konfirmasi",
  Dibayar: "Pembayaran diterima",
  Diproses: "Dimasak di dapur",
  Dikirim: "Dalam pengantaran",
  Selesai: "Pesanan selesai",
  Dibatalkan: "Dibatalkan",
};

export const WARNA_STATUS: Record<StatusPesanan, string> = {
  "Menunggu Pembayaran": "bg-jingga-100 text-jingga-800",
  "Menunggu Konfirmasi": "bg-amber-100 text-amber-800",
  Dibayar: "bg-sky-100 text-sky-800",
  Diproses: "bg-indigo-100 text-indigo-800",
  Dikirim: "bg-violet-100 text-violet-800",
  Selesai: "bg-zamrud-700 text-white",
  Dibatalkan: "bg-red-100 text-red-700",
};

export const WARNA_BAYAR: Record<StatusBayar, string> = {
  Menunggu: "bg-jingga-100 text-jingga-800",
  Lunas: "bg-zamrud-100 text-zamrud-800",
  Kedaluwarsa: "bg-kabut-deep text-ink-muted",
  Gagal: "bg-red-100 text-red-700",
  Dikembalikan: "bg-kabut-deep text-ink-soft",
};

/** Label status transaksi mentah Midtrans untuk histori pembayaran. */
export const LABEL_TRANSAKSI: Record<string, string> = {
  pending: "Menunggu dibayar",
  settlement: "Lunas",
  capture: "Lunas (kartu)",
  expire: "Kedaluwarsa",
  cancel: "Dibatalkan",
  deny: "Ditolak",
  failure: "Gagal",
  refund: "Dikembalikan",
  partial_refund: "Dikembalikan sebagian",
};
