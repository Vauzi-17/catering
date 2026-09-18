"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IconAlert, IconCheck, IconSearch } from "@/components/Icons";
import { StatusBadge } from "@/components/Ui";
import { profil } from "@/data/profil";
import { rupiah, tanggalPanjang, waktuRelatif } from "@/lib/format";
import type { Pesanan, StatusPesanan } from "@/lib/types";
import { useData } from "@/store/DataProvider";

const alur: StatusPesanan[] = ["Menunggu Konfirmasi", "Diproses", "Selesai"];

const penjelasan: Record<StatusPesanan, string> = {
  "Menunggu Konfirmasi":
    "Pesanan sudah masuk ke sistem. Admin akan menghubungi Anda untuk memastikan jumlah porsi dan pembayaran uang muka.",
  Diproses:
    "Pesanan sudah dikonfirmasi dan sedang kami siapkan sesuai jadwal acara Anda.",
  Selesai: "Pesanan sudah diterima. Terima kasih telah memesan di Asri Catering.",
  Dibatalkan:
    "Pesanan ini dibatalkan. Bila menurut Anda ini keliru, silakan hubungi admin kami.",
};

export function LacakPesanan() {
  const params = useSearchParams();
  const { cariPesanan, siap } = useData();

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
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={cari} className="card p-5 sm:p-6">
          <label className="field-label" htmlFor="kode">
            Kode pesanan
          </label>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <IconSearch
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                width={18}
                height={18}
              />
              <input
                id="kode"
                className="field pl-10 uppercase"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                placeholder="Contoh: ASR-260918-01"
                autoComplete="off"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-md" disabled={mencari}>
              {mencari ? "Mencari…" : "Cek Status"}
            </button>
          </div>
          <p className="mt-3 text-[13px] text-ink-muted">
            Kode ini Anda terima setelah mengirim formulir pemesanan.
          </p>
        </form>

        {dicari && !hasil && !mencari && (
          <div className="card mt-6 p-6">
            <div className="flex gap-3">
              <IconAlert className="mt-0.5 shrink-0 text-amber-600" width={20} height={20} />
              <div>
                <h2 className="text-[16px] font-semibold">Kode pesanan tidak ditemukan</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Periksa kembali penulisan kodenya, atau hubungi admin di{" "}
                  <a
                    href={`tel:${profil.teleponRaw}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    {profil.telepon}
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {hasil && (
          <div className="mt-6 space-y-5">
            <div className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Kode pesanan</p>
                  <h2 className="mt-1.5 font-display text-2xl">{hasil.kode}</h2>
                  <p className="mt-1.5 text-[13px] text-ink-muted">
                    Dibuat {waktuRelatif(hasil.dibuatPada)}
                  </p>
                </div>
                <StatusBadge status={hasil.status} />
              </div>

              <p className="mt-5 rounded-lg border border-line bg-cream px-4 py-3.5 text-sm leading-relaxed text-ink-soft">
                {penjelasan[hasil.status]}
              </p>

              {hasil.status !== "Dibatalkan" && (
                <ol className="mt-7 space-y-0">
                  {alur.map((langkah, i) => {
                    const lewat = i <= indeksAktif;
                    const catatan = hasil.riwayat.find((r) => r.status === langkah);
                    return (
                      <li key={langkah} className="flex gap-4 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold ${
                              lewat
                                ? "border-brand-700 bg-brand-700 text-white"
                                : "border-line-strong bg-white text-ink-muted"
                            }`}
                          >
                            {lewat ? <IconCheck width={16} height={16} /> : i + 1}
                          </span>
                          {i < alur.length - 1 && (
                            <span
                              className={`mt-1 w-px flex-1 ${
                                i < indeksAktif ? "bg-brand-400" : "bg-line"
                              }`}
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div className="pt-0.5">
                          <p
                            className={`text-[15px] font-semibold ${
                              lewat ? "text-ink" : "text-ink-muted"
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
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            <div className="card p-5 sm:p-6">
              <h3 className="font-display text-lg">Rincian pesanan</h3>
              <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-muted">Nama pemesan</dt>
                  <dd className="text-right font-semibold">{hasil.nama}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-muted">Tanggal acara</dt>
                  <dd className="text-right font-semibold">
                    {tanggalPanjang(hasil.tanggalAcara)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-muted">Jam</dt>
                  <dd className="text-right font-semibold">{hasil.waktuAntar}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-muted">Metode</dt>
                  <dd className="text-right font-semibold">{hasil.metode}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-muted">Alamat</dt>
                  <dd className="max-w-xs text-right font-semibold">{hasil.alamat}</dd>
                </div>
                {hasil.catatan && (
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-ink-muted">Catatan</dt>
                    <dd className="max-w-xs text-right font-semibold">{hasil.catatan}</dd>
                  </div>
                )}
              </dl>

              <ul className="mt-4 space-y-2.5 text-sm">
                {hasil.items.map((it) => (
                  <li key={it.menuId} className="flex justify-between gap-4">
                    <span className="text-ink-muted">
                      {it.nama} × {it.qty}
                    </span>
                    <span className="font-semibold">{rupiah(it.harga * it.qty)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
                <span className="font-semibold">Total</span>
                <span className="font-display text-2xl font-semibold text-brand-800">
                  {rupiah(hasil.total)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://wa.me/${profil.teleponRaw}?text=${encodeURIComponent(
                  `Halo Asri Catering, saya ingin menanyakan pesanan dengan kode ${hasil.kode}.`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-md"
              >
                Tanyakan ke admin
              </a>
              <Link href="/menu" className="btn btn-ghost btn-md">
                Pesan lagi
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
