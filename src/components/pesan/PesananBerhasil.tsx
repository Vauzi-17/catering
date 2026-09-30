import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, Headset, Search } from "lucide-react";
import { IconWhatsapp } from "@/components/Icons";
import { profil } from "@/data/profil";
import { rupiah, tanggalPanjang } from "@/lib/format";
import type { Pesanan } from "@/lib/types";

const tahapan = [
  {
    judul: "Pesanan terkirim",
    isi: "Pesanan sudah tercatat di sistem kami.",
    status: "Selesai",
  },
  {
    judul: "Konfirmasi admin & uang muka",
    isi: "Admin menghubungi Anda lewat WhatsApp untuk memastikan jumlah porsi dan uang muka 50 persen.",
    status: "Berikutnya",
  },
  {
    judul: "Dimasak di dapur",
    isi: "Masakan diolah pagi hari di hari pengantaran.",
    status: "Hari acara",
  },
  {
    judul: "Diantar ke lokasi",
    isi: "Pesanan tiba sesuai jam yang Anda pilih.",
    status: "Sesuai jadwal",
  },
];

export function PesananBerhasil({ pesanan }: { pesanan: Pesanan }) {
  const totalPorsi = pesanan.items.reduce((a, it) => a + it.qty, 0);
  const pesanWa = encodeURIComponent(
    `Halo Asri Catering, saya baru membuat pesanan dengan kode ${pesanan.kode}.`,
  );

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="kartu px-5 py-8 sm:px-10 sm:py-10">
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zamrud-50">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-zamrud-700 text-white">
                <Check size={22} strokeWidth={2.5} />
              </span>
            </span>
            <h1 className="mt-5 text-[30px] font-semibold leading-tight sm:text-[36px]">
              Pesanan Berhasil Dibuat
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
              Terima kasih, pesanan{" "}
              <span className="font-semibold text-ink">{pesanan.kode}</span> sudah kami terima.
              Admin akan menghubungi {pesanan.telepon} untuk konfirmasi.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-kabut p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-sans text-[16px] font-semibold">Ringkasan pesanan</h2>
              <span className="rounded-full bg-jingga-100 px-2.5 py-0.5 text-[11px] font-bold text-jingga-800">
                Menunggu konfirmasi
              </span>
            </div>

            <dl className="mt-4 space-y-3 text-[14px]">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Kode pesanan</dt>
                <dd className="font-semibold tracking-wide">{pesanan.kode}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-muted">Paket</dt>
                <dd className="text-right">
                  <span className="font-semibold">{totalPorsi} porsi</span>
                  <span className="block text-[12px] text-ink-muted">
                    {pesanan.items.map((it) => `${it.qty}× ${it.nama}`).join(", ")}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Jadwal</dt>
                <dd className="inline-flex items-center gap-1.5 text-right font-semibold">
                  <CalendarDays size={15} className="shrink-0 text-ink-muted" />
                  {tanggalPanjang(pesanan.tanggalAcara)} · {pesanan.waktuAntar.replace(":", ".")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Metode</dt>
                <dd className="font-semibold">{pesanan.metode}</dd>
              </div>
              <div className="flex items-end justify-between gap-4 border-t border-kabut-line pt-3">
                <dt className="text-ink-muted">Total perkiraan</dt>
                <dd className="text-[22px] font-bold tabular-nums text-zamrud-800">
                  {rupiah(pesanan.total)}
                </dd>
              </div>
            </dl>
          </div>

          <h2 className="mt-9 font-sans text-[16px] font-semibold">Tahapan berikutnya</h2>
          <ol className="mt-4">
            {tahapan.map((t, i) => {
              const selesai = i === 0;
              const berikut = i === 1;
              return (
                <li key={t.judul} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < tahapan.length - 1 && (
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
                        : berikut
                          ? "border-2 border-zamrud-600 bg-white text-zamrud-700"
                          : "border border-kabut-line bg-white text-ink-muted"
                    }`}
                  >
                    {selesai ? <Check size={14} strokeWidth={2.5} /> : i + 1}
                  </span>
                  <div className="flex-1 pt-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p
                        className={`text-[15px] font-semibold ${
                          selesai || berikut ? "text-ink" : "text-ink-muted"
                        }`}
                      >
                        {t.judul}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          selesai
                            ? "bg-zamrud-50 text-zamrud-700"
                            : berikut
                              ? "bg-jingga-50 text-jingga-700"
                              : "text-ink-muted"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{t.isi}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`https://wa.me/${profil.teleponRaw}?text=${pesanWa}`}
              target="_blank"
              rel="noreferrer"
              className="tombol tombol-blok tombol-zamrud sm:flex-[3]"
            >
              <IconWhatsapp width={18} height={18} />
              Hubungi Admin via WhatsApp
            </a>
            <Link
              href={`/lacak?kode=${pesanan.kode}`}
              className="tombol tombol-blok tombol-garis sm:flex-[2]"
            >
              <Search size={17} />
              Lacak Pesanan
            </Link>
          </div>

          <Link
            href="/"
            className="mx-auto mt-5 flex w-fit items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-zamrud-700"
          >
            <ArrowLeft size={15} />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-kabut-line bg-kabut-deep p-4 sm:p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zamrud-700">
            <Headset size={19} strokeWidth={1.8} />
          </span>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            <span className="block font-semibold text-ink">Perlu mengubah jumlah porsi?</span>
            Hubungi {profil.telepon} paling lambat H-1 sebelum tanggal acara.
          </p>
        </div>
      </div>
    </div>
  );
}
