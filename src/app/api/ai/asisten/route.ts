import { NextResponse } from "next/server";
import { bersihkanKonteks } from "@/lib/ai-sanitasi";
import { geminiAktif, jawabAsistenGemini } from "@/lib/gemini";

/**
 * POST /api/ai/asisten
 *
 * Menjawab pertanyaan bebas dari admin memakai Gemini.
 *
 * Body: { pertanyaan: string, konteks: KonteksAi }
 *
 * Balasan 200: { sumber: "gemini", jawaban: { isi, rincian } }
 * Balasan 503: { sumber: "lokal",  pesan: "..." }
 *   → halaman beralih ke jawaban dari perhitungan lokal.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PANJANG_MAKS = 400;

export async function POST(permintaan: Request) {
  if (!geminiAktif) {
    return NextResponse.json(
      {
        sumber: "lokal",
        pesan: "GEMINI_API_KEY belum diisi. Jawaban diambil dari perhitungan aplikasi.",
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
  const pertanyaan =
    typeof isi.pertanyaan === "string" ? isi.pertanyaan.trim().slice(0, PANJANG_MAKS) : "";

  if (pertanyaan.length < 3) {
    return NextResponse.json(
      { sumber: "lokal", pesan: "Pertanyaan terlalu pendek." },
      { status: 400 },
    );
  }

  try {
    const jawaban = await jawabAsistenGemini(pertanyaan, bersihkanKonteks(isi.konteks));
    return NextResponse.json({ sumber: "gemini", jawaban });
  } catch (e) {
    const pesan = e instanceof Error ? e.message : "Gemini tidak dapat dihubungi.";
    console.error("[api/ai/asisten]", pesan);
    return NextResponse.json({ sumber: "lokal", pesan }, { status: 503 });
  }
}
