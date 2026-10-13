import { ambilPesananKode, kedaluwarsakanTagihan, siapkanTagihan } from "@/lib/pesanan-server";
import { GalatApi, jawabGalat, penggunaDariRequest } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/** Mengambil tagihan QRIS yang masih berlaku, atau membuat yang baru bila sudah kedaluwarsa. */
export async function POST(req: Request, { params }: { params: Promise<{ kode: string }> }) {
  try {
    const pengguna = await penggunaDariRequest(req);
    const { kode } = await params;
    await kedaluwarsakanTagihan();
    const pesanan = await ambilPesananKode(decodeURIComponent(kode));
    if (pesanan.user_id !== pengguna.id) throw new GalatApi(404, "Pesanan tidak ditemukan.");
    return Response.json(await siapkanTagihan(pesanan));
  } catch (e) {
    return jawabGalat(e);
  }
}
