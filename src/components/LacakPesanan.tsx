"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Check, CircleAlert, Search } from "lucide-react";
import { IconWhatsapp } from "@/components/Icons";
import { FotoMenu } from "@/components/Placeholder";
import { profil } from "@/data/profil";
import { rupiah, tanggalPanjang, waktuRelatif } from "@/lib/format";
import type { Pesanan, StatusPesanan } from "@/lib/types";
import { useData } from "@/store/DataProvider";

const alur: StatusPesanan[] = ["Menunggu Konfirmasi", "Diproses", "Selesai"];

const penjelasan: Record<StatusPesanan, string> = {
  "Menunggu Konfirmasi":
    "Pesanan sudah masuk. Admin akan menghubungi Anda untuk memastikan jumlah porsi dan uang muka.",
  Diproses: "Pesanan sudah dikonfirmasi dan sedang disiapkan sesuai jadwal acara Anda.",
  Selesai: "Pesanan sudah diterima. Terima kasih telah memesan di Asri Catering.",
  Dibatalkan: "Pesanan ini dibatalkan. Bila menurut Anda ini keliru, silakan hubungi admin kami.",
};

const gayaStatus: Record<StatusPesanan, string> = {
  "Menunggu Konfirmasi": "bg-jingga-100 text-jingga-800",
  Diproses: "bg-sky-100 text-sky-800",
  Selesai: "bg-zamrud-700 text-white",
  Dibatalkan: "bg-red-100 text-red-700",
};

export function LacakPesanan() {
  const params = useSearchParams();
  const { cariPesanan, siap, menus } = useData();

  const [kode, setKode] = useState(params.get("kode") ?? "");
  const [hasil, setHasil] = useState<Pesanan | null>(null);
  const [dicari, setDicari] = useState(false);
  const [mencari, setMencari] = useState(false);

  // Cari otomatis bila kode dibawa dari halaman pemesanan.
  useEffect(() => {
    const dariUrl = params.get("kode");
    if (!siap || !dariUrl) return;

    let dibatalkan = false;
    setMencari(true);
    void cariPesanan(dariUrl)
      .then((p) => {
        if (dibatalkan) return;
        setHasil(p);
        setDicari(true);
      })
      .finally(() => {
        if (!dibatalkan) setMencari(false);
      });

    return () => {
      dibatalkan = true;
    };
  }, [siap, params, cariPesanan]);

  async function cari(e: React.FormEvent) {
    e.preventDefault();
    setMencari(true);
    try {
      setHasil(await cariPesanan(kode));
      setDicari(true);
    } finally {
      setMencari(false);
    }
  }

  const indeksAktif = hasil ? alur.indexOf(hasil.status) : -1;

  return (
    <div className="container-page py-10 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <form onSubmit={cari} className="kartu p-5 sm:p-6">
          <label className="isian-label" htmlFor="kode">
            Kode pesanan
          </label>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
              />
              <input
                id="kode"
                className="isian h-11 pl-10 uppercase placeholder:normal-case"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                placeholder="Contoh: ASR-260918-01"
                autoComplete="off"
              />
            </div>
            <button type="submit" className="tombol tombol-md tombol-zamrud" disabled={mencari}>
              {mencari ? "Mencari…" : "Cek Status"}
            </button>
          </div>
        </form>

        {!dicari && !mencari && <AjakanPesan fotos={menus.filter((m) => m.foto).slice(0, 3).map((m) => m.foto)} />}

        {dicari && !hasil && !mencari && (
          <div className="kartu mt-5 flex gap-3 p-5 sm:p-6">
            <CircleAlert size={20} className="mt-0.5 shrink-0 text-jingga-600" />
            <div>
              <h2 className="font-sans text-[16px] font-semibold">Kode pesanan tidak ditemukan</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                Periksa kembali penulisan kodenya, atau hubungi admin di{" "}
                <a
                  href={`tel:${profil.teleponRaw}`}
                  className="font-semibold text-zamrud-700 hover:underline"
                >
                  {profil.telepon}
                </a>
                .
              </p>
            </div>
          </div>
        )}

        {hasil && (
          <div className="mt-5 space-y-5">
            <div className="kartu p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] text-ink-muted">Kode pesanan</p>
                  <h2 className="mt-0.5 text-[28px] font-semibold tracking-wide">{hasil.kode}</h2>
                  <p className="mt-1 text-[13px] text-ink-muted">
                    Dibuat {waktuRelatif(hasil.dibuatPada)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold ${gayaStatus[hasil.status]}`}
                >
                  {hasil.status}
                </span>
              </div>

              <p className="mt-5 rounded-xl bg-kabut px-4 py-3.5 text-sm leading-relaxed text-ink-soft">
                {penjelasan[hasil.status]}
              </p>

              {hasil.status !== "Dibatalkan" && (
                <>
                  <h3 className="mt-7 font-sans text-[15px] font-semibold">Tahapan pesanan</h3>
                  <ol className="mt-4">
                    {alur.map((langkah, i) => {
                      const selesai = i < indeksAktif || hasil.status === "Selesai";
                      const berjalan = i === indeksAktif && hasil.status !== "Selesai";
                      const catatan = hasil.riwayat.find((r) => r.status === langkah);
                      return (
                        <li key={langkah} className="relative flex gap-4 pb-6 last:pb-0">
                          {i < alur.length - 1 && (
                            <span
                              className={`absolute left-[13px] top-8 h-[calc(100%-2rem)] w-px ${
                                selesai ? "bg-zamrud-200" : "bg-kabut-line"
                              }`}
                              aria-hidden="true"
                            />
                          )}
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                              selesai
                                ? "bg-zamrud-700 text-white"
                                : berjalan
                                  ? "border-2 border-zamrud-600 bg-white text-zamrud-700"
                                  : "border border-kabut-line bg-white text-ink-muted"
                            }`}
                          >
                            {selesai ? <Check size={14} strokeWidth={2.5} /> : i + 1}
                          </span>
                          <div className="flex flex-1 flex-wrap items-start justify-between gap-2 pt-0.5">
                            <div>
                              <p
                                className={`text-[15px] font-semibold ${
                                  selesai || berjalan ? "text-ink" : "text-ink-muted"
                                }`}
                              >
                                {langkah}
                              </p>
                              {catatan && (
                                <p className="mt-0.5 text-[13px] text-ink-muted">
                                  {waktuRelatif(catatan.waktu)}
                                </p>
                              )}
                            </div>
                            {(selesai || berjalan) && (
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                  selesai ? "bg-zamrud-50 text-zamrud-700" : "bg-jingga-50 text-jingga-700"
                                }`}
                              >
                                {selesai ? "Selesai" : "Sedang berjalan"}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}
            </div>

            <div className="kartu p-5 sm:p-7">
              <h3 className="font-sans text-[16px] font-semibold">Rincian pesanan</h3>
              <dl className="mt-4 divide-y divide-kabut-line text-sm">
                <div className="flex justify-between gap-4 py-3 first:pt-0">
                  <dt className="text-ink-muted">Nama pemesan</dt>
                  <dd className="text-right font-semibold">{hasil.nama}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-muted">Jadwal</dt>
                  <dd className="inline-flex items-center gap-1.5 text-right font-semibold">
                    <CalendarDays size={15} className="shrink-0 text-ink-muted" />
                    {tanggalPanjang(hasil.tanggalAcara)} · {hasil.waktuAntar.replace(":", ".")}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-muted">Metode</dt>
                  <dd className="text-right font-semibold">{hasil.metode}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="shrink-0 text-ink-muted">Alamat</dt>
                  <dd className="max-w-xs text-right font-semibold">{hasil.alamat}</dd>
                </div>
                {hasil.catatan && (
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="shrink-0 text-ink-muted">Catatan</dt>
                    <dd className="max-w-xs text-right font-semibold">{hasil.catatan}</dd>
                  </div>
                )}
              </dl>

              <ul className="mt-2 space-y-2.5 rounded-xl bg-kabut p-4 text-sm">
                {hasil.items.map((it) => (
                  <li key={it.menuId} className="flex items-center gap-3">
                    <span className="w-11 shrink-0 overflow-hidden rounded-lg">
                      <FotoMenu
                        src={menus.find((m) => m.id === it.menuId)?.foto}
                        nama={it.nama}
                        rasio="aspect-square"
                        mini
                      />
                    </span>
                    <span className="min-w-0 flex-1 text-ink-soft">
                      <span className="block truncate font-semibold text-ink">{it.nama}</span>
                      <span className="text-[12px] text-ink-muted">
                        {it.qty} × {rupiah(it.harga)}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {rupiah(it.harga * it.qty)}
                    </span>
                  </li>
                ))}
                <li className="flex items-end justify-between gap-4 border-t border-kabut-line pt-3">
                  <span className="font-semibold">Total</span>
                  <span className="text-[22px] font-bold tabular-nums text-zamrud-800">
                    {rupiah(hasil.total)}
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://wa.me/${profil.teleponRaw}?text=${encodeURIComponent(
                  `Halo Asri Catering, saya ingin menanyakan pesanan dengan kode ${hasil.kode}.`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="tombol tombol-blok tombol-zamrud sm:flex-[3]"
              >
                <IconWhatsapp width={18} height={18} />
                Tanyakan ke Admin
              </a>
              <Link href="/menu" className="tombol tombol-blok tombol-garis sm:flex-[2]">
                Pesan Lagi
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Ditampilkan sebelum pencarian: ajakan memesan bagi yang belum punya kode. */
function AjakanPesan({ fotos }: { fotos: string[] }) {
  return (
    <div className="mt-5 flex flex-col items-start gap-5 overflow-hidden rounded-2xl bg-zamrud-800 p-6 text-white sm:flex-row sm:items-center sm:p-7">
      {fotos.length > 0 && (
        <div className="flex -space-x-4" aria-hidden="true">
          {fotos.map((src) => (
            <span key={src} className="h-16 w-16 overflow-hidden rounded-full border-[3px] border-zamrud-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </span>
          ))}
        </div>
      )}
      <div className="flex-1">
        <p className="text-[17px] font-semibold">Belum punya kode pesanan?</p>
        <p className="mt-1 text-[14px] text-white/75">Kode muncul setelah Anda mengirim pesanan.</p>
      </div>
      <Link href="/menu" className="tombol tombol-md shrink-0 bg-jingga-500 text-white hover:bg-jingga-600">
        Lihat Menu
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
