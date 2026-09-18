import { NextResponse } from "next/server";
import { bersihkanKonteks, bersihkanKonteksMenu } from "@/lib/ai-sanitasi";
import { geminiAktif, insightHppGemini, insightLaporanGemini } from "@/lib/gemini";

/**
 * POST /api/ai/insight
 *
 * Menyusun catatan analisis memakai Gemini.
 *
 * Body:
 *   { jenis: "laporan", konteks: KonteksAi }
 *   { jenis: "hpp",     konteks: KonteksAi, menu: KonteksMenuAi }
 *
 * Balasan 200: { sumber: "gemini", catatan: [...] }
 * Balasan 503: { sumber: "lokal",  pesan: "..." }
 *   → halaman pemanggil beralih ke perhitungan lokal. Ini bukan kegagalan
 *     fatal: HPP dan laporan tetap tersaji.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(permintaan: Request) {
  if (!geminiAktif) {
    return NextResponse.json(
      {
        sumber: "lokal",
        pesan: "GEMINI_API_KEY belum diisi. Catatan disusun dari perhitungan aplikasi.",
      },
      { status: 503 },
    );
  }

  let badan: unknown;
  try {
    badan = await permintaan.json();
  } catch {
    return NextResponse.json(
      { sumber: "lokal", pesan: "Isi permintaan tidak sah." },
      { status: 400 },
    );
  }

  const isi = (badan ?? {}) as Record<string, unknown>;
  const jenis = isi.jenis === "hpp" ? "hpp" : "laporan";
  const konteks = bersihkanKonteks(isi.konteks);

  try {
    const catatan =
      jenis === "hpp"
        ? await insightHppGemini(bersihkanKonteksMenu(isi.menu), konteks)
        : await insightLaporanGemini(konteks);

    return NextResponse.json({ sumber: "gemini", catatan });
  } catch (e) {
    const pesan = e instanceof Error ? e.message : "Gemini tidak dapat dihubungi.";
    // Sengaja dicatat di server saja; halaman cukup tahu bahwa ia harus
    // memakai perhitungan lokal.
    console.error("[api/ai/insight]", pesan);
    return NextResponse.json({ sumber: "lokal", pesan }, { status: 503 });
  }
}
