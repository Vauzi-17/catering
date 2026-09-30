/**
 * Logika murni untuk pemesanan dan pembayaran online.
 *
 * Berkas ini sengaja tidak mengimpor apa pun supaya bisa dipakai di server,
 * di browser, dan diuji langsung dengan Node (lihat scripts/uji-pembayaran.ts).
 * Semua keputusan penting — harga, jarak, dan perubahan status akibat
 * notifikasi Midtrans — dihitung di sini.
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

// -------------------------------------------------------------- Midtrans

/** order_id Midtrans = kode pesanan + nomor percobaan, mis. ASR-261003-123-2. */
export function orderIdMidtrans(kode: string, percobaan: number): string {
  return `${kode}-${percobaan}`;
}

export function kodeDariOrderId(orderId: string): { kode: string; percobaan: number } | null {
  const cocok = /^(.+)-(\d+)$/.exec(orderId);
  if (!cocok) return null;
  return { kode: cocok[1], percobaan: Number(cocok[2]) };
}

/** Teks yang di-hash SHA-512 untuk signature_key notifikasi Midtrans. */
export function teksSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
): string {
  return orderId + statusCode + grossAmount + serverKey;
}

export interface StatusMidtrans {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  va_numbers?: { bank?: string; va_number?: string }[];
  permata_va_number?: string;
  bill_key?: string;
  biller_code?: string;
  store?: string;
  issuer?: string;
  acquirer?: string;
  settlement_time?: string;
  transaction_time?: string;
}

/** Nama metode pembayaran yang mudah dibaca pelanggan dan admin. */
export function namaMetode(s: Pick<StatusMidtrans, "payment_type" | "va_numbers" | "permata_va_number" | "store" | "issuer">): string {
  const jenis = s.payment_type ?? "";
  if (jenis === "bank_transfer") {
    const bank = s.va_numbers?.[0]?.bank ?? (s.permata_va_number ? "permata" : "");
    return bank ? `${bank.toUpperCase()} Virtual Account` : "Transfer Bank";
  }
  if (jenis === "echannel") return "Mandiri Bill Payment";
  if (jenis === "qris") return s.issuer ? `QRIS (${s.issuer})` : "QRIS";
  if (jenis === "gopay") return "GoPay";
  if (jenis === "shopeepay") return "ShopeePay";
  if (jenis === "credit_card") return "Kartu Kredit/Debit";
  if (jenis === "cstore") return s.store ? s.store.charAt(0).toUpperCase() + s.store.slice(1) : "Gerai Retail";
  return jenis ? jenis.replace(/_/g, " ") : "";
}

export interface KeadaanPesanan {
  status: string;
  status_bayar: string | null;
  midtrans_order_id: string | null;
}

export interface PembaruanPesanan {
  status?: string;
  status_bayar?: string;
  metode_bayar?: string;
  dibayar_pada?: string;
}

/**
 * Menentukan perubahan pada baris orders akibat status transaksi Midtrans.
 *
 * Aturan yang dijaga:
 * - Pesanan yang sudah Lunas tidak pernah turun status karena notifikasi
 *   lain yang datang terlambat (mis. expire dari percobaan lama).
 * - Kedaluwarsa/gagal hanya berlaku bila datang dari percobaan pembayaran
 *   yang sedang aktif; percobaan lama yang kedaluwarsa diabaikan.
 * - Pesanan yang sudah diproses admin tidak diubah status alurnya.
 *
 * Mengembalikan null bila tidak ada yang perlu diubah.
 */
export function pembaruanDariMidtrans(
  pesanan: KeadaanPesanan,
  trx: StatusMidtrans,
  sekarang: Date = new Date(),
): PembaruanPesanan | null {
  const t = trx.transaction_status;
  const lunas = t === "settlement" || (t === "capture" && (trx.fraud_status ?? "accept") === "accept");
  const sudahLunas = pesanan.status_bayar === "Lunas";
  const percobaanAktif = !pesanan.midtrans_order_id || pesanan.midtrans_order_id === trx.order_id;
  const alurAwal = pesanan.status === "Menunggu Pembayaran" || pesanan.status === "Dibatalkan";

  if (lunas) {
    if (sudahLunas) return null;
    const patch: PembaruanPesanan = {
      status_bayar: "Lunas",
      metode_bayar: namaMetode(trx),
      dibayar_pada: trx.settlement_time ? keIsoWib(trx.settlement_time) : sekarang.toISOString(),
    };
    if (alurAwal) patch.status = "Dibayar";
    return patch;
  }

  if (t === "refund" || t === "partial_refund") {
    if (pesanan.status_bayar === "Dikembalikan") return null;
    return { status_bayar: "Dikembalikan", status: "Dibatalkan" };
  }

  if (sudahLunas || !percobaanAktif) return null;

  if (t === "pending") {
    return pesanan.status_bayar === "Menunggu" ? null : { status_bayar: "Menunggu", metode_bayar: namaMetode(trx) };
  }
  if (t === "expire") {
    const patch: PembaruanPesanan = { status_bayar: "Kedaluwarsa" };
    if (pesanan.status === "Menunggu Pembayaran") patch.status = "Dibatalkan";
    return patch;
  }
  if (t === "deny" || t === "cancel" || t === "failure" || (t === "capture" && trx.fraud_status === "deny")) {
    // Pesanan tetap bisa dibayar ulang dengan percobaan baru.
    return pesanan.status_bayar === "Gagal" ? null : { status_bayar: "Gagal" };
  }
  return null;
}

/** Waktu Midtrans ("2026-10-03 10:15:00", WIB) ke ISO UTC. */
export function keIsoWib(teks: string): string {
  const d = new Date(teks.replace(" ", "T") + "+07:00");
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
