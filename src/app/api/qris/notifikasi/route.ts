import { timingSafeEqual } from "node:crypto";
import { prosesNotifikasi } from "@/lib/pesanan-server";
import { GalatApi, jawabGalat } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function tokenSah(req: Request): boolean {
  const rahasia = process.env.QRIS_NOTIF_TOKEN ?? "";
  if (rahasia.length < 16) throw new GalatApi(503, "QRIS_NOTIF_TOKEN belum diisi (minimal 16 karakter).");
  const header = req.headers.get("authorization") ?? "";
  const dikirim = header.startsWith("Bearer ")
    ? header.slice(7).trim()
    : (new URL(req.url).searchParams.get("token") ?? "");
  const a = Buffer.from(dikirim);
  const b = Buffer.from(rahasia);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Menerima notifikasi "pembayaran diterima" yang diteruskan aplikasi otomasi
 * (mis. MacroDroid) dari HP pemilik usaha.
 *
 * Body boleh JSON { "teks": "...", "judul": "...", "aplikasi": "..." }
 * atau teks biasa berisi isi notifikasi.
 */
export async function POST(req: Request) {
  try {
    if (!tokenSah(req)) throw new GalatApi(401, "Token tidak sah.");

    const mentah = await req.text();
    let teks = mentah;
    let aplikasi = "";
    try {
      const j = JSON.parse(mentah) as Record<string, unknown>;
      const ambil = (k: string) => (typeof j[k] === "string" ? (j[k] as string) : "");
      teks = [ambil("judul"), ambil("teks")].filter(Boolean).join(" — ") || mentah;
      aplikasi = ambil("aplikasi");
    } catch {
      /* teks biasa */
    }
    teks = teks.trim();
    if (!teks) throw new GalatApi(400, "Isi notifikasi kosong.");

    const hasil = await prosesNotifikasi(teks, aplikasi);
    return Response.json({ ok: true, hasil: hasil.hasil, kode: hasil.kode ?? null });
  } catch (e) {
    return jawabGalat(e);
  }
}
