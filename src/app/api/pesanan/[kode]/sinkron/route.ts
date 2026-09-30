import { ambilPesananKode, sinkronkanPesanan } from "@/lib/pesanan-server";
import { adalahAdmin, GalatApi, jawabGalat, penggunaDariRequest } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Menarik status pembayaran langsung dari Midtrans. Cadangan bila webhook
 * belum dipasang atau terlambat: dipanggil setelah popup Snap ditutup dan
 * saat pelanggan menekan "Cek status pembayaran".
 */
export async function POST(req: Request, { params }: { params: Promise<{ kode: string }> }) {
  try {
    const pengguna = await penggunaDariRequest(req);
    const { kode } = await params;
    const pesanan = await ambilPesananKode(decodeURIComponent(kode));
    if (pesanan.user_id !== pengguna.id && !(await adalahAdmin(pengguna.id))) {
      throw new GalatApi(404, "Pesanan tidak ditemukan.");
    }
    return Response.json({ diubah: await sinkronkanPesanan(pesanan) });
  } catch (e) {
    return jawabGalat(e);
  }
}
