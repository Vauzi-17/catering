import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DaftarKeunggulan } from "@/components/DaftarKeunggulan";
import { DaftarTestimoni } from "@/components/DaftarTestimoni";
import { HitungCepat } from "@/components/beranda/HitungCepat";
import { MenuLaris } from "@/components/beranda/MenuLaris";
import { KartuFavorit } from "@/components/beranda/SorotanHero";
import { IconWhatsapp } from "@/components/Icons";
import { GambarPlaceholder } from "@/components/Placeholder";
import { SectionHeading } from "@/components/Ui";
import { kategoriMenu } from "@/data/menu";
import { profil } from "@/data/profil";

export default function Beranda() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-b-[50%_56px] bg-gradient-to-br from-jingga-700 via-jingga-600 to-jingga-400 text-white sm:rounded-b-[50%_88px]">
        <div className="container-page grid items-center gap-12 pb-24 pt-12 sm:pb-28 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:pb-32 lg:pt-16">
          <div>
            <h1 className="text-[40px] font-medium leading-[1.05] sm:text-[56px] lg:text-[64px]">
              Pilih Hidangan untuk Acara Anda
            </h1>

            <p className="mt-5 max-w-[34rem] text-[16px] leading-relaxed text-white/85 sm:text-[17px]">
              Nasi kotak, bento, prasmanan, dan tumpeng dari dapur Ibu Asri di Bandung sejak{" "}
              {profil.berdiri}. Dimasak pagi di hari pengantaran dan tiba sebelum acara dimulai.
            </p>

            <dl className="mt-8 flex max-w-md divide-x divide-white/25">
              {[profil.statistik[0], profil.statistik[1], profil.statistik[3]].map((s) => (
                <div key={s.label} className="flex-1 px-4 first:pl-0 last:pr-0 sm:px-6">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block text-[26px] font-bold leading-none tabular-nums sm:text-[30px]">
                      {s.angka}
                    </span>
                    <span className="mt-1.5 block text-[12px] font-medium text-white/80 sm:text-[13px]">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-jingga-800 transition-colors hover:bg-jingga-50"
              >
                Lihat Menu
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#hitung"
                className="inline-flex h-12 items-center justify-center rounded-full bg-jingga-800/45 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-jingga-800/65"
              >
                Hitung Estimasi
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[420px] lg:mr-0">
            <div className="rounded-full bg-jingga-200/35 p-3 sm:p-4">
              <GambarPlaceholder
                label="Foto hidangan utama — 1000 × 1000 px"
                rasio="aspect-square"
                className="rounded-full border-0"
              />
            </div>
            <div className="absolute -bottom-4 left-0 max-w-[calc(100%-1rem)] sm:-left-6">
              <KartuFavorit />
            </div>
          </div>
        </div>
      </section>

      {/* Menu paling laris */}
      <section className="container-page py-20 sm:py-24">
        <SectionHeading
          judul="Paling Laris"
          deskripsi="Paket yang paling sering dipesan untuk rapat, syukuran, dan acara keluarga."
        />

        <nav aria-label="Kategori menu" className="mt-8 flex flex-wrap gap-2">
          {kategoriMenu.map((k) => (
            <Link
              key={k}
              href={`/menu?kategori=${encodeURIComponent(k)}`}
              className="rounded-full border border-kabut-line bg-white px-4 py-2 text-[13px] font-semibold text-ink-soft transition-colors hover:border-jingga-200 hover:text-jingga-700"
            >
              {k}
            </Link>
          ))}
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-jingga-700 hover:text-jingga-800"
          >
            Semua menu
            <ArrowRight size={15} />
          </Link>
        </nav>

        <div className="mt-8">
          <MenuLaris />
        </div>
      </section>

      {/* Keunggulan */}
      <section className="border-y border-kabut-line bg-white py-14 sm:py-16">
        <div className="container-page">
          <DaftarKeunggulan />
        </div>
      </section>

      {/* Cara pesan + estimasi */}
      <section className="container-page grid gap-12 py-20 sm:py-24 lg:grid-cols-[1fr_440px] lg:gap-16">
        <div>
          <SectionHeading
            judul="Cara Pesan"
            deskripsi={`Pesan kurang dari 100 porsi bisa H-1. Setiap pesanan mendapat kode untuk memantau statusnya sampai diantar.`}
          />

          <ol className="mt-10">
            {profil.langkahPesan.map((langkah, i) => {
              const terakhir = i === profil.langkahPesan.length - 1;
              return (
                <li key={langkah.judul} className="relative flex gap-5 pb-8 last:pb-0">
                  {!terakhir && (
                    <span
                      className="absolute left-[17px] top-10 h-[calc(100%-2.75rem)] w-px bg-zamrud-200"
                      aria-hidden="true"
                    />
                  )}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zamrud-700 text-[14px] font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <h3 className="font-sans text-[17px] font-semibold text-ink">{langkah.judul}</h3>
                    <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-ink-muted">
                      {langkah.isi}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <HitungCepat />
      </section>

      {/* Testimoni */}
      <section className="border-t border-kabut-line bg-white py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading judul="Kata Pelanggan" />

          <div className="mt-10">
            <DaftarTestimoni />
          </div>
        </div>
      </section>

      {/* Ajakan */}
      <section className="bg-white pb-16 sm:pb-20">
        <div className="container-page">
          <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-zamrud-800 px-6 py-10 text-white sm:px-10 lg:grid-cols-[1fr_auto] lg:py-12">
            <div>
              <h2 className="text-[28px] font-semibold leading-tight sm:text-[36px]">
                Punya acara dalam waktu dekat?
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/75">
                Ceritakan jumlah tamu dan tanggalnya. Admin membantu memilih paket dan
                mengonfirmasi jadwal antar di hari yang sama.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-jingga-500 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-jingga-600"
              >
                Lihat Menu
                <ArrowRight size={18} />
              </Link>
              <a
                href={`https://wa.me/${profil.teleponRaw}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                <IconWhatsapp width={18} height={18} />
                Tanya via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
