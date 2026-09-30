import { ambilStatusTransaksi, signatureSah } from "@/lib/midtrans";
import { catatTransaksi } from "@/lib/pesanan-server";
import { GalatApi, jawabGalat } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Webhook "Payment Notification URL" Midtrans.
 *
 * 1. signature_key diperiksa supaya hanya Midtrans yang bisa memanggil.
 * 2. Status tidak diambil dari isi notifikasi, melainkan ditanyakan ulang
 *    ke API Midtrans, sehingga notifikasi palsu atau basi tidak berpengaruh.
 * 3. Hasilnya dicatat ke histori pembayaran dan pesanan diperbarui.
 */
export async function POST(req: Request) {
  try {
    const notif = (await req.json().catch(() => null)) as Record<string, string> | null;
    if (!notif || !signatureSah(notif)) throw new GalatApi(401, "Signature tidak sah.");

    const trx = await ambilStatusTransaksi(notif.order_id);
    if (!trx) return Response.json({ ok: true, catatan: "Transaksi belum ada di Midtrans." });

    const hasil = await catatTransaksi(trx);
    return Response.json({ ok: true, ...hasil });
  } catch (e) {
    // Pesanan uji dari tombol "Test notification", atau transaksi aplikasi lain
    // yang memakai akun Midtrans yang sama, tidak ada di basis data; jawab 200
    // supaya tidak dikirim ulang terus.
    if (e instanceof GalatApi && e.status === 404) {
      return Response.json({ ok: true, catatan: e.message });
    }
    return jawabGalat(e);
  }
}
