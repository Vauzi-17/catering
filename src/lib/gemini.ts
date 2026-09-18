import "server-only";

import type { KonteksAi, KonteksMenuAi } from "@/lib/ai-tipe";

/**
 * Pembungkus Gemini API.
 *
 * Berkas ini hanya boleh dipakai dari Route Handler (server). Impor
 * "server-only" di atas membuat build gagal bila tidak sengaja terbawa ke
 * komponen klien, sehingga GEMINI_API_KEY dipastikan tidak pernah dikirim
 * ke browser.
 */

const KUNCI = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/** true bila GEMINI_API_KEY sudah diisi di .env.local. */
export const geminiAktif = Boolean(KUNCI);

// Batas waktu per percobaan. Dibuat pendek karena halaman sudah menampilkan
// catatan hasil perhitungan sendiri sejak awal — menunggu lama tidak ada
// gunanya, lebih baik cepat menyerah dan memakai catatan itu.
const BATAS_WAKTU_MS = 8_000;
const MAKS_PERCOBAAN = 2;
const JEDA_ULANG_MS = 600;

interface BalasanGemini {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string; status?: string };
  promptFeedback?: { blockReason?: string };
}

/** Galat yang layak dicoba ulang: gangguan sesaat, bukan kesalahan konfigurasi. */
class GalatSesaat extends Error {}

const tidur = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Menerjemahkan kegagalan dari Google menjadi pesan yang langsung memberi tahu
 * apa yang harus diperbaiki, bukan sekadar meneruskan teks aslinya.
 */
function terjemahkanGalat(status: number, data: BalasanGemini): Error {
  const asli = data.error?.message ?? `HTTP ${status}`;

  if (status === 503 || status === 500) {
    return new GalatSesaat(
      `Model ${MODEL} sedang penuh permintaan di sisi Google. Sifatnya sementara. (${asli})`,
    );
  }
  if (status === 429) {
    return new GalatSesaat(
      `Kuota atau laju permintaan Gemini terlampaui. Tunggu sebentar, atau periksa pemakaian di Google AI Studio. (${asli})`,
    );
  }
  if (status === 400 && /api key/i.test(asli)) {
    return new Error(`GEMINI_API_KEY tidak diterima Google. Periksa isinya. (${asli})`);
  }
  if (status === 404) {
    return new Error(
      `Model "${MODEL}" tidak ditemukan. Periksa nilai GEMINI_MODEL di .env.local. (${asli})`,
    );
  }
  if (status === 401 || status === 403) {
    return new Error(
      `Gemini menolak kunci ini. Pastikan API key aktif dan Generative Language API menyala. (${asli})`,
    );
  }
  return new Error(`Gemini menolak permintaan: ${asli}`);
}

/** Satu kali permintaan ke Gemini. */
async function satuPercobaan(
  instruksi: string,
  pertanyaan: string,
  suhu: number,
): Promise<string> {
  const pembatal = new AbortController();
  const waktu = setTimeout(() => pembatal.abort(), BATAS_WAKTU_MS);

  try {
    const tanggapan = await fetch(`${ENDPOINT}/${MODEL}:generateContent`, {
      method: "POST",
      signal: pembatal.signal,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": KUNCI as string,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: instruksi }] },
        contents: [{ role: "user", parts: [{ text: pertanyaan }] }],
        generationConfig: {
          temperature: suhu,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
        },
      }),
    });

    const data = (await tanggapan.json()) as BalasanGemini;

    if (!tanggapan.ok) throw terjemahkanGalat(tanggapan.status, data);

    if (data.promptFeedback?.blockReason) {
      throw new Error(`Permintaan diblokir Gemini: ${data.promptFeedback.blockReason}`);
    }

    const teks = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!teks) throw new GalatSesaat("Gemini tidak mengembalikan jawaban.");
    return teks;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new GalatSesaat(
        `Gemini tidak merespons dalam ${BATAS_WAKTU_MS / 1000} detik.`,
      );
    }
    // Jaringan putus atau DNS gagal — layak dicoba ulang sekali.
    if (e instanceof TypeError) {
      throw new GalatSesaat(`Tidak bisa menghubungi Gemini: ${e.message}`);
    }
    throw e;
  } finally {
    clearTimeout(waktu);
  }
}

/**
 * Mengirim permintaan ke Gemini dan mengembalikan teks JSON mentahnya.
 *
 * Gangguan sesaat — model penuh, jaringan putus, kehabisan waktu — dicoba
 * ulang sekali. Kesalahan konfigurasi seperti API key salah atau nama model
 * keliru tidak diulang, karena mengulangnya pasti gagal lagi dan hanya
 * membuat halaman menunggu dua kali lebih lama.
 */
async function panggilGemini(
  instruksi: string,
  pertanyaan: string,
  suhu = 0.4,
): Promise<string> {
  if (!KUNCI) throw new Error("GEMINI_API_KEY belum diisi.");

  let terakhir: unknown;

  for (let percobaan = 1; percobaan <= MAKS_PERCOBAAN; percobaan++) {
    try {
      return await satuPercobaan(instruksi, pertanyaan, suhu);
    } catch (e) {
      terakhir = e;
      if (!(e instanceof GalatSesaat) || percobaan === MAKS_PERCOBAAN) throw e;
      await tidur(JEDA_ULANG_MS * percobaan);
    }
  }

  throw terakhir;
}

/** Mengurai teks JSON dari Gemini; melempar Error bila bentuknya tidak sesuai. */
function uraiJson<T>(teks: string): T {
  const bersih = teks.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "");
  try {
    return JSON.parse(bersih) as T;
  } catch {
    throw new Error("Jawaban Gemini bukan JSON yang sah.");
  }
}

const NADA_SAH = ["baik", "perhatian", "bahaya", "info"] as const;

export interface CatatanMentah {
  nada?: string;
  judul?: string;
  isi?: string;
}

function rapikanCatatan(mentah: CatatanMentah[]) {
  return mentah
    .filter((c) => c?.judul && c?.isi)
    .slice(0, 5)
    .map((c) => ({
      nada: (NADA_SAH as readonly string[]).includes(c.nada ?? "")
        ? (c.nada as (typeof NADA_SAH)[number])
        : ("info" as const),
      judul: String(c.judul).slice(0, 120),
      isi: String(c.isi).slice(0, 600),
    }));
}

const GAYA_BAHASA = `
Kamu adalah asisten analisis usaha untuk Asri Catering, sebuah UMKM katering
nasi rames di Bandung. Pembacanya adalah Ibu Asri, pemilik usaha, yang bukan
orang keuangan maupun orang teknologi.

Aturan menulis:
- Bahasa Indonesia sehari-hari yang sopan, kalimat pendek.
- Hindari istilah asing. Tulis "harga pokok produksi" bukan "COGS",
  "keuntungan" bukan "profit".
- Nominal rupiah ditulis lengkap, contoh: Rp 1.250.000.
- Selalu bersandar pada angka yang diberikan. Dilarang mengarang angka baru.
- Bila data tidak cukup untuk menyimpulkan sesuatu, katakan apa adanya.
- Jangan memberi nasihat investasi, pinjaman, atau pajak.
`.trim();

/** Menyusun catatan analisis laporan usaha. */
export async function insightLaporanGemini(konteks: KonteksAi) {
  const instruksi = `${GAYA_BAHASA}

Tugasmu: membaca ringkasan penjualan lalu menulis 3 sampai 4 catatan singkat
yang membantu pemilik mengambil keputusan.

Balas HANYA dengan JSON berbentuk:
{"catatan":[{"nada":"baik|perhatian|bahaya|info","judul":"...","isi":"..."}]}

"judul" maksimal 10 kata. "isi" maksimal 3 kalimat.
Gunakan nada "bahaya" hanya bila ada yang benar-benar merugikan usaha,
misalnya menu yang dijual di bawah biaya produksi atau bahan yang habis
padahal pesanannya sudah masuk.`;

  const teks = await panggilGemini(
    instruksi,
    `Ringkasan ${konteks.periodeHari} hari terakhir:\n${JSON.stringify(konteks)}`,
  );
  const hasil = uraiJson<{ catatan?: CatatanMentah[] }>(teks);
  const catatan = rapikanCatatan(hasil.catatan ?? []);
  if (catatan.length === 0) throw new Error("Gemini tidak memberi catatan apa pun.");
  return catatan;
}

/** Menyusun catatan analisis HPP untuk satu menu. */
export async function insightHppGemini(menu: KonteksMenuAi, konteks: KonteksAi) {
  const instruksi = `${GAYA_BAHASA}

Tugasmu: menilai struktur biaya satu menu, lalu menulis 2 sampai 4 catatan.
Perhitungan HPP sudah dikerjakan aplikasi — jangan menghitung ulang, cukup
jelaskan artinya dan beri saran yang bisa langsung dikerjakan di dapur.

Balas HANYA dengan JSON berbentuk:
{"catatan":[{"nada":"baik|perhatian|bahaya|info","judul":"...","isi":"..."}]}

Sebutkan bahan yang paling menentukan biaya bila kontribusinya di atas 30 persen.
Bila margin di bawah target, sebutkan usulan harga yang sudah dihitung aplikasi.`;

  const teks = await panggilGemini(
    instruksi,
    `Menu: ${JSON.stringify(menu)}\n\nTarget margin usaha: ${konteks.target.marginPersen}%`,
  );
  const hasil = uraiJson<{ catatan?: CatatanMentah[] }>(teks);
  const catatan = rapikanCatatan(hasil.catatan ?? []);
  if (catatan.length === 0) throw new Error("Gemini tidak memberi catatan apa pun.");
  return catatan;
}

/** Menjawab pertanyaan bebas dari admin. */
export async function jawabAsistenGemini(pertanyaan: string, konteks: KonteksAi) {
  const instruksi = `${GAYA_BAHASA}

Tugasmu: menjawab satu pertanyaan pemilik usaha berdasarkan data yang
diberikan. Jawab langsung ke pokok pertanyaan, dua sampai empat kalimat.

Balas HANYA dengan JSON berbentuk:
{"isi":"jawaban naratif","rincian":[{"label":"...","nilai":"..."}]}

"rincian" bersifat opsional, maksimal 5 baris, dipakai untuk menampilkan angka
pendukung. Isi "nilai" sudah dalam bentuk siap baca, contoh "230 porsi" atau
"Rp 3.680.000".

Bila pertanyaannya di luar data yang tersedia, jawab bahwa datanya belum ada
dan sebutkan apa yang bisa ditanyakan. Jangan menebak.`;

  const teks = await panggilGemini(
    instruksi,
    `Pertanyaan: ${pertanyaan}\n\nData usaha:\n${JSON.stringify(konteks)}`,
    0.3,
  );
  const hasil = uraiJson<{ isi?: string; rincian?: { label?: string; nilai?: string }[] }>(
    teks,
  );
  if (!hasil.isi) throw new Error("Gemini tidak memberi jawaban.");

  return {
    isi: String(hasil.isi).slice(0, 900),
    rincian: (hasil.rincian ?? [])
      .filter((r) => r?.label && r?.nilai)
      .slice(0, 5)
      .map((r) => ({
        label: String(r.label).slice(0, 80),
        nilai: String(r.nilai).slice(0, 80),
      })),
  };
}
