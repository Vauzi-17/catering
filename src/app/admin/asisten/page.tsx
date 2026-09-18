"use client";

import { useState } from "react";
import { JudulHalaman } from "@/components/admin/AdminShell";
import { IconInfo, IconRefresh, IconSend, IconSparkle } from "@/components/Icons";
import { susunKonteks, tanyaAsistenAi } from "@/lib/ai-klien";
import { contohPertanyaan, jawabPertanyaan, type JawabanAsisten } from "@/lib/asisten";
import { LencanaSumber } from "@/components/admin/Bagian";
import { useData } from "@/store/DataProvider";

interface Percakapan {
  id: number;
  tanya: string;
  jawab: JawabanAsisten;
  sumber: "gemini" | "lokal";
}

export default function HalamanAsisten() {
  const { pesanan, menus, bahan, pengaturan } = useData();

  const [teks, setTeks] = useState("");
  const [memproses, setMemproses] = useState(false);
  const [riwayat, setRiwayat] = useState<Percakapan[]>([]);

  async function tanya(pertanyaan: string) {
    const bersih = pertanyaan.trim();
    if (!bersih || memproses) return;

    setTeks("");
    setMemproses(true);

    try {
      // Coba Gemini lebih dulu. Bila tidak tersedia atau gagal, pertanyaan
      // dijawab dari perhitungan aplikasi sendiri.
      const dariGemini = await tanyaAsistenAi(
        bersih,
        susunKonteks({
          pesanan,
          menus,
          bahan,
          overheadPersen: pengaturan.overheadPersen,
          targetMargin: pengaturan.targetMargin,
          rentangHari: 7,
        }),
      );

      const jawab: JawabanAsisten =
        dariGemini ??
        jawabPertanyaan(bersih, {
          pesanan,
          menus,
          bahan,
          overheadPersen: pengaturan.overheadPersen,
          targetMargin: pengaturan.targetMargin,
        });

      setRiwayat((lama) => [
        ...lama,
        {
          id: Date.now(),
          tanya: bersih,
          jawab,
          sumber: dariGemini ? "gemini" : "lokal",
        },
      ]);
    } finally {
      setMemproses(false);
    }
  }

  return (
    <>
      <JudulHalaman
        judul="AI Assistant"
        deskripsi="Tanyakan kondisi usaha dengan bahasa sehari-hari."
        aksi={
          riwayat.length > 0 ? (
            <button
              type="button"
              onClick={() => setRiwayat([])}
              className="btn btn-outline btn-md"
            >
              <IconRefresh width={17} height={17} />
              Mulai baru
            </button>
          ) : undefined
        }
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <section className="card flex min-h-[460px] flex-col p-5 sm:p-6 xl:col-span-2">
          <div className="flex-1 space-y-5">
            {riwayat.length === 0 && !memproses && (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 text-brand-700">
                  <IconSparkle width={20} height={20} />
                </span>
                <p className="mt-4 text-[15px] font-semibold">Ada yang ingin ditanyakan?</p>
                <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-muted">
                  Pilih salah satu contoh pertanyaan di samping, atau tulis sendiri di
                  kotak bawah.
                </p>
              </div>
            )}

            {riwayat.map((p) => (
              <div key={p.id} className="space-y-3">
                <p className="ml-auto max-w-[85%] rounded-lg rounded-br-sm bg-brand-700 px-4 py-2.5 text-[14px] text-white">
                  {p.tanya}
                </p>

                <div className="max-w-[92%] rounded-lg rounded-bl-sm border border-line bg-cream px-4 py-3.5">
                  <div className="mb-2 flex justify-start">
                    <LencanaSumber sumber={p.sumber} />
                  </div>
                  <p className="text-[14px] leading-relaxed text-ink">{p.jawab.isi}</p>
                  {p.jawab.rincian && (
                    <dl className="mt-3 divide-y divide-line border-t border-line pt-1">
                      {p.jawab.rincian.map((r) => (
                        <div
                          key={r.label}
                          className="flex justify-between gap-4 py-2 text-[13px]"
                        >
                          <dt className="text-ink-muted">{r.label}</dt>
                          <dd className="text-right font-semibold text-ink">{r.nilai}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </div>
            ))}

            {memproses && (
              <p className="flex items-center gap-2 text-[13px] text-ink-muted">
                <IconRefresh className="animate-spin" width={16} height={16} />
                Membaca data…
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void tanya(teks);
            }}
            className="mt-5 flex gap-2 border-t border-line pt-4"
          >
            <input
              className="field flex-1"
              value={teks}
              onChange={(e) => setTeks(e.target.value)}
              placeholder="Contoh: bagaimana penjualan hari ini?"
              aria-label="Tulis pertanyaan"
            />
            <button
              type="submit"
              className="btn btn-primary btn-md"
              disabled={!teks.trim() || memproses}
            >
              <IconSend width={17} height={17} />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
        </section>

        <div className="space-y-5">
          <section className="card p-5">
            <h2 className="text-sm font-bold">Contoh pertanyaan</h2>
            <div className="mt-3 flex flex-col gap-2">
              {contohPertanyaan.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => void tanya(c)}
                  disabled={memproses}
                  className="rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-left text-[13px] font-medium text-ink-soft transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 disabled:opacity-50"
                >
                  {c}
                </button>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex gap-2.5">
              <IconInfo className="mt-0.5 shrink-0 text-ink-muted" width={18} height={18} />
              <div>
                <h2 className="text-sm font-bold">Cara kerjanya</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                  Angka dihitung aplikasi dari data pesanan, menu, dan bahan baku,
                  lalu Gemini menyusun kalimat jawabannya. Nama, nomor telepon, dan
                  alamat pelanggan tidak ikut dikirim. Bila Gemini sedang tidak
                  aktif, jawaban tetap muncul dari perhitungan aplikasi.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
