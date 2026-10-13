import { randomUUID } from "node:crypto";
import { ambilPesananKode, tandaiLunas } from "@/lib/pesanan-server";
import { adalahAdmin, GalatApi, jawabGalat, penggunaDariRequest } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/** Admin menandai pesanan lunas setelah mengecek mutasi di GoBiz atau bank. */
export async function POST(req: Request, { params }: { params: Promise<{ kode: string }> }) {
  try {
    const pengguna = await penggunaDariRequest(req);
    if (!(await adalahAdmin(pengguna.id))) throw new GalatApi(403, "Hanya admin yang dapat mengonfirmasi pembayaran.");
    const { kode } = await params;
    const pesanan = await ambilPesananKode(decodeURIComponent(kode));
    if (pesanan.status_bayar === "Lunas") throw new GalatApi(409, "Pesanan ini sudah lunas.");

    const isi = (await req.json().catch(() => ({}))) as { catatan?: unknown };
    const catatan = typeof isi.catatan === "string" ? isi.catatan.trim().slice(0, 300) : "";
    const diubah = await tandaiLunas(pesanan, {
      jenis: "manual",
      keterangan: catatan || `Dikonfirmasi manual oleh ${pengguna.email ?? "admin"}`,
      jumlah: Math.round(Number(pesanan.nominal_bayar ?? pesanan.total)),
      rujukan: `manual-${randomUUID()}`,
      mentah: { admin: pengguna.id },
    });
    return Response.json({ ok: true, diubah });
  } catch (e) {
    return jawabGalat(e);
  }
}
