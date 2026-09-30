import { ambilPesananKode, siapkanTagihan } from "@/lib/pesanan-server";
import { GalatApi, jawabGalat, penggunaDariRequest } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/** Mengambil tagihan aktif, atau membuat yang baru bila sudah kedaluwarsa. */
export async function POST(req: Request, { params }: { params: Promise<{ kode: string }> }) {
  try {
    const pengguna = await penggunaDariRequest(req);
    const { kode } = await params;
    const pesanan = await ambilPesananKode(decodeURIComponent(kode));
    if (pesanan.user_id !== pengguna.id) throw new GalatApi(404, "Pesanan tidak ditemukan.");

    const asal = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    return Response.json(await siapkanTagihan(pesanan, asal));
  } catch (e) {
    return jawabGalat(e);
  }
}
