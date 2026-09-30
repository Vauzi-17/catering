import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { GalatApi } from "@/lib/supabase-server";
import { teksSignature, type StatusMidtrans } from "@/lib/pembayaran";

/**
 * Pemanggil API Midtrans (Snap + status transaksi).
 *
 * Kunci sandbox Midtrans selalu diawali "SB-", jadi mode sandbox/produksi
 * ditentukan otomatis dari server key. MIDTRANS_IS_PRODUCTION=true/false
 * bisa dipakai untuk memaksa salah satunya.
 */
function kunciServer(): string {
  const kunci = process.env.MIDTRANS_SERVER_KEY;
  if (!kunci) throw new GalatApi(503, "Pembayaran belum dikonfigurasi: isi MIDTRANS_SERVER_KEY.");
  return kunci;
}

export function modeProduksi(): boolean {
  const paksa = process.env.MIDTRANS_IS_PRODUCTION;
  if (paksa === "true") return true;
  if (paksa === "false") return false;
  return !kunciServer().startsWith("SB-");
}

function alamat() {
  return modeProduksi()
    ? { snap: "https://app.midtrans.com/snap/v1/transactions", api: "https://api.midtrans.com/v2" }
    : { snap: "https://app.sandbox.midtrans.com/snap/v1/transactions", api: "https://api.sandbox.midtrans.com/v2" };
}

function headerAuth() {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Basic " + Buffer.from(kunciServer() + ":").toString("base64"),
  };
}

export interface DataTransaksi {
  orderId: string;
  total: number;
  items: { id: string; nama: string; harga: number; qty: number }[];
  pelanggan: { nama: string; email: string; telepon: string };
  kembaliKe: string;
  /** Lama batas bayar, dalam jam. */
  batasJam: number;
}

export async function buatTransaksiSnap(d: DataTransaksi): Promise<{ token: string; redirectUrl: string }> {
  const res = await fetch(alamat().snap, {
    method: "POST",
    headers: headerAuth(),
    body: JSON.stringify({
      transaction_details: { order_id: d.orderId, gross_amount: d.total },
      // Nama item di Midtrans dibatasi 50 karakter.
      item_details: d.items.map((it) => ({
        id: it.id.slice(0, 50),
        name: it.nama.slice(0, 50),
        price: it.harga,
        quantity: it.qty,
      })),
      customer_details: {
        first_name: d.pelanggan.nama.slice(0, 255),
        email: d.pelanggan.email,
        phone: d.pelanggan.telepon,
      },
      callbacks: { finish: d.kembaliKe },
      expiry: { unit: "hour", duration: d.batasJam },
    }),
    cache: "no-store",
  });
  const isi = (await res.json().catch(() => ({}))) as {
    token?: string;
    redirect_url?: string;
    error_messages?: string[];
  };
  if (!res.ok || !isi.token || !isi.redirect_url) {
    console.error("Midtrans Snap gagal", res.status, isi);
    throw new GalatApi(502, "Gagal membuat tagihan pembayaran. Coba lagi sebentar.");
  }
  return { token: isi.token, redirectUrl: isi.redirect_url };
}

/**
 * Status transaksi langsung dari Midtrans. Dipakai sebagai sumber kebenaran,
 * baik setelah notifikasi webhook maupun saat pelanggan menekan "cek status".
 * Mengembalikan null bila transaksi belum pernah dibuat di Midtrans
 * (pelanggan belum memilih metode di popup Snap).
 */
export async function ambilStatusTransaksi(orderId: string): Promise<(StatusMidtrans & { status_code?: string; gross_amount?: string; transaction_id?: string }) | null> {
  const res = await fetch(`${alamat().api}/${encodeURIComponent(orderId)}/status`, {
    headers: headerAuth(),
    cache: "no-store",
  });
  const isi = (await res.json().catch(() => ({}))) as StatusMidtrans & {
    status_code?: string;
    gross_amount?: string;
    transaction_id?: string;
  };
  if (isi.status_code === "404") return null;
  if (!res.ok || !isi.transaction_status) {
    console.error("Midtrans status gagal", res.status, isi);
    throw new GalatApi(502, "Gagal memeriksa status pembayaran.");
  }
  return isi;
}

/** Memastikan notifikasi benar-benar dikirim Midtrans (signature_key). */
export function signatureSah(n: {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
}): boolean {
  if (!n.order_id || !n.status_code || !n.gross_amount || !n.signature_key) return false;
  const harap = createHash("sha512")
    .update(teksSignature(n.order_id, n.status_code, n.gross_amount, kunciServer()))
    .digest("hex");
  const a = Buffer.from(harap);
  const b = Buffer.from(n.signature_key);
  return a.length === b.length && timingSafeEqual(a, b);
}
