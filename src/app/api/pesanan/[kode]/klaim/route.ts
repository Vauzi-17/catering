import { ambilPesananKode } from "@/lib/pesanan-server";
import { GalatApi, jawabGalat, penggunaDariRequest, supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Pelanggan menyatakan sudah membayar. Tidak mengubah status bayar — hanya
 * menandai pesanan supaya admin memeriksanya bila notifikasi tidak masuk.
 */
export async function POST(req: Request, { params }: { params: Promise<{ kode: string }> }) {
  try {
    const pengguna = await penggunaDariRequest(req);
    const { kode } = await params;
    const pesanan = await ambilPesananKode(decodeURIComponent(kode));
    if (pesanan.user_id !== pengguna.id) throw new GalatApi(404, "Pesanan tidak ditemukan.");
    if (pesanan.status_bayar !== "Menunggu") return Response.json({ ok: true });

    const { error } = await supabaseServer()
      .from("orders")
      .update({ diklaim_bayar_pada: new Date().toISOString() })
      .eq("id", pesanan.id)
      .eq("status_bayar", "Menunggu");
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    return jawabGalat(e);
  }
}
