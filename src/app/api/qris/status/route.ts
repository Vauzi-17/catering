import { adalahAdmin, GalatApi, jawabGalat, penggunaDariRequest } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/** Untuk halaman admin: apakah token penerus notifikasi sudah dipasang di server. */
export async function GET(req: Request) {
  try {
    const pengguna = await penggunaDariRequest(req);
    if (!(await adalahAdmin(pengguna.id))) throw new GalatApi(403, "Khusus admin.");
    return Response.json({ tokenTerpasang: (process.env.QRIS_NOTIF_TOKEN ?? "").length >= 16 });
  } catch (e) {
    return jawabGalat(e);
  }
}
