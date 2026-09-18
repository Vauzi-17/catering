import Link from "next/link";
import { MenuUnggulan } from "@/components/MenuUnggulan";
import { GambarPlaceholder } from "@/components/Placeholder";
import { SectionHeading } from "@/components/Ui";
import {
  IconArrowRight,
  IconBox,
  IconClock,
  IconLeaf,
  IconMapPin,
  IconUsers,
  IconWallet,
} from "@/components/Icons";
import { menuAwal } from "@/data/menu";
import { profil } from "@/data/profil";
import { rupiah } from "@/lib/format";

const kategori = [
  { nama: "Nasi Box", ikon: IconBox },
  { nama: "Prasmanan", ikon: IconUsers },
  { nama: "Tumpeng", ikon: IconLeaf },
  { nama: "Snack Box", ikon: IconWallet },
];

function hargaTerendah(namaKategori: string) {
  const daftar = menuAwal.filter((m) => m.kategori === namaKategori);
  return daftar.length ? Math.min(...daftar.map((m) => m.hargaJual)) : 0;
}

export default function Beranda() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-white">
        <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-14 lg:py-16">
          <div>
            <p className="chip border-brand-200 bg-brand-50 text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Katering rames di Bandung sejak {profil.berdiri}
            </p>

            <h1 className="mt-5 font-display text-[34px] leading-[1.12] sm:text-[46px]">
              Masakan rames rumahan untuk acara Anda.
            </h1>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
              Nasi box, prasmanan, tumpeng, dan snack box. Harga tercantum jelas,
              pesan langsung dari halaman ini.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/pesan" className="btn btn-primary btn-md">
                Pesan Sekarang
                <IconArrowRight width={18} height={18} />
              </Link>
              <Link href="/menu" className="btn btn-outline btn-md">
                Lihat Menu
              </Link>
            </div>

            <dl className="mt-9 grid grid-cols-3 gap-4 border-t border-line pt-6">
              {profil.statistik.slice(0, 3).map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-[24px] leading-none text-brand-800">
                    {s.angka}
                  </dt>
                  <dd className="mt-1.5 text-[13px] text-ink-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <GambarPlaceholder
            label="Foto hidangan utama — 1200 × 900 px"
            rasio="aspect-[4/3]"
            className="rounded-card"
          />
        </div>
      </section>

      {/* Pita informasi singkat */}
      <section className="border-b border-line bg-brand-800 text-white">
        <div className="container-page grid gap-5 py-6 sm:grid-cols-3">
          {[
            { ikon: IconMapPin, isi: "Bandung, Cimahi, dan sekitarnya" },
            { ikon: IconClock, isi: "Senin–Jumat 07.00–18.00" },
            { ikon: IconBox, isi: "Gratis antar dalam kota, min. 25 porsi" },
          ].map((item) => (
            <p key={item.isi} className="flex items-center gap-2.5 text-[14px]">
              <item.ikon className="shrink-0 text-brand-300" width={19} height={19} />
              {item.isi}
            </p>
          ))}
        </div>
      </section>

      {/* Kategori */}
      <section className="container-page py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kategori.map((k) => (
            <Link
              key={k.nama}
              href={`/menu?kategori=${encodeURIComponent(k.nama)}`}
              className="card flex items-center gap-4 p-5 transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              <k.ikon className="shrink-0 text-brand-600" width={24} height={24} />
              <span>
                <span className="block text-[15px] font-semibold">{k.nama}</span>
                <span className="mt-0.5 block text-[13px] text-ink-muted">
                  Mulai {rupiah(hargaTerendah(k.nama))}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Menu unggulan */}
      <section className="border-y border-line bg-white py-14 sm:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Menu unggulan"
            judul="Paling sering dipesan"
            aksi={
              <Link href="/menu" className="btn btn-outline btn-md">
                Lihat semua menu
                <IconArrowRight width={18} height={18} />
              </Link>
            }
          />
          <div className="mt-8">
            <MenuUnggulan />
          </div>
        </div>
      </section>

      {/* Cara pesan */}
      <section className="container-page py-14 sm:py-16">
        <SectionHeading eyebrow="Cara pesan" judul="Empat langkah saja" />

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {profil.langkahPesan.map((langkah, i) => (
            <li key={langkah.judul} className="card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 font-display text-[15px] font-semibold text-brand-700">
                {i + 1}
              </span>
              <h3 className="mt-4 text-[16px] font-semibold">{langkah.judul}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                {langkah.ringkas}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Ajakan */}
      <section className="border-t border-line bg-brand-800 text-white">
        <div className="container-page flex flex-col items-start gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="max-w-lg font-display text-[26px] leading-tight sm:text-[32px]">
            Punya acara dalam waktu dekat?
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pesan"
              className="btn btn-md border-white bg-white text-brand-800 hover:bg-brand-50"
            >
              Pesan Sekarang
              <IconArrowRight width={18} height={18} />
            </Link>
            <a
              href={`https://wa.me/${profil.teleponRaw}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-md border-brand-300 bg-transparent text-white hover:bg-brand-700"
            >
              Tanya via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
