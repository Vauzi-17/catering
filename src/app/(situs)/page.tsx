import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  ShoppingBag,
  Ticket,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { DaftarTestimoni } from "@/components/DaftarTestimoni";
import { HitungCepat } from "@/components/beranda/HitungCepat";
import { MenuLaris } from "@/components/beranda/MenuLaris";
import { PilihAcara } from "@/components/beranda/PilihAcara";
import { KartuFavorit, RingkasMenu } from "@/components/beranda/SorotanHero";
import { IconWhatsapp } from "@/components/Icons";
import { FotoMenu } from "@/components/Placeholder";
import { SectionHeading } from "@/components/Ui";
import { profil } from "@/data/profil";
import { fotoMenu as foto } from "@/lib/foto";

const pitaPromo = [
  "Antar gratis dalam Kota Bandung, min. 25 porsi",
  "Bisa pesan H-1 untuk di bawah 100 porsi",
  "Porsi cicip gratis untuk pesanan 100+ porsi",
  "Dimasak pagi di hari pengantaran",
  "Isi paket bisa disesuaikan",
  "Bayar transfer atau tunai",
];

const ikonLangkah = [ShoppingBag, ClipboardList, Ticket, Truck];

export default function Beranda() {
  const fotoUtama = foto("paket-nasi-kuning-bento-royal");
  const fotoOrbit = [foto("paket-nasi-kotak-rendang-vip"), foto("paket-nasi-kotak-acara-kantor")];
  const fotoKolase = [
    foto("paket-nasi-kotak-acara-kantor"),
    foto("paket-nasi-kuning-bento-royal"),
    foto("paket-nasi-kotak-nila-bakar"),
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-b-[50%_56px] bg-gradient-to-br from-jingga-700 via-jingga-600 to-jingga-400 text-white sm:rounded-b-[50%_88px]">
        <div className="container-page grid items-center gap-14 pb-24 pt-12 sm:pb-28 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pb-32 lg:pt-16">
          <div>
            <h1 className="text-[42px] font-medium leading-[1.03] sm:text-[58px] lg:text-[66px]">
              Nasi Kotak &amp; Bento untuk Setiap Acara
            </h1>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/85 sm:text-[17px]">
              Dimasak pagi di hari pengantaran, dari dapur Ibu Asri di Bandung.
            </p>

            <div className="mt-8">
              <RingkasMenu />
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/menu" className="tombol tombol-lg bg-white text-jingga-800 hover:bg-jingga-50">
                Lihat Menu
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#hitung"
                className="tombol tombol-lg bg-jingga-800/45 text-white hover:bg-jingga-800/65"
              >
                Hitung Estimasi
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[370px] lg:mr-6">
            <div className="rounded-full bg-jingga-200/35 p-3 sm:p-4">
              <FotoMenu
                src={fotoUtama}
                nama="Paket Nasi Kuning Bento Royal"
                rasio="aspect-square"
                className="rounded-full"
              />
            </div>

            {/* Foto kecil yang mengorbit piring utama */}
            {fotoOrbit[0] && (
              <span className="absolute -right-3 top-2 h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg sm:-right-8 sm:h-28 sm:w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fotoOrbit[0]} alt="" className="h-full w-full object-cover" />
              </span>
            )}
            {fotoOrbit[1] && (
              <span className="absolute -left-4 top-[38%] hidden h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg sm:-left-12 sm:block sm:h-24 sm:w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fotoOrbit[1]} alt="" className="h-full w-full object-cover" />
              </span>
            )}

            <div className="absolute -bottom-5 left-0 max-w-[calc(100%-1rem)] sm:-left-8">
              <KartuFavorit />
            </div>
          </div>
        </div>
      </section>

      {/* Pita promo berjalan */}
      <section
        className="mt-10 overflow-hidden border-y border-zamrud-900 bg-zamrud-800 py-3.5 text-white"
        aria-label="Keunggulan layanan"
      >
        <ul className="pita-jalan flex w-max">
          {[...pitaPromo, ...pitaPromo].map((teks, i) => (
            <li
              key={i}
              aria-hidden={i >= pitaPromo.length}
              className="flex items-center gap-6 whitespace-nowrap pr-6 text-[14px] font-semibold sm:text-[15px]"
            >
              {teks}
              <UtensilsCrossed size={15} className="text-jingga-300" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </section>

      {/* Menu paling laris */}
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          judul="Paling Laris"
          aksi={
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-jingga-700 hover:text-jingga-800"
            >
              Semua menu
              <ArrowRight size={16} />
            </Link>
          }
        />
        <div className="mt-8">
          <MenuLaris />
        </div>
      </section>

      {/* Pilih berdasarkan acara */}
      <section className="container-page pb-16 sm:pb-20">
        <SectionHeading judul="Pesan untuk Acara Apa?" />
        <div className="mt-8">
          <PilihAcara />
        </div>
      </section>

      {/* Angka usaha */}
      <section className="bg-zamrud-800 text-white">
        <div className="container-page grid gap-8 py-12 sm:py-14 lg:grid-cols-[1fr_2fr] lg:items-center">
          <h2 className="text-[28px] font-semibold leading-tight sm:text-[34px]">
            Dipercaya sejak {profil.berdiri}
          </h2>
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {profil.statistik.map((s) => (
              <div key={s.label} className="border-l border-white/20 pl-4">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block text-[32px] font-bold leading-none tabular-nums text-jingga-300 sm:text-[38px]">
                    {s.angka}
                  </span>
                  <span className="mt-2 block text-[13px] text-white/75">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Cara pesan + estimasi */}
      <section className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_440px] lg:items-start lg:gap-16">
        <div>
          <SectionHeading judul="Cara Pesan" deskripsi="Kurang dari 100 porsi bisa dipesan H-1." />

          <ol className="mt-9 grid gap-4 sm:grid-cols-2">
            {profil.langkahPesan.map((langkah, i) => {
              const Ikon = ikonLangkah[i % ikonLangkah.length];
              return (
                <li key={langkah.judul} className="rounded-2xl bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-jingga-50 text-jingga-600">
                      <Ikon size={20} strokeWidth={1.8} />
                    </span>
                    <span
                      className="font-display text-[28px] font-semibold leading-none text-kabut-line"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 font-sans text-[17px] font-semibold text-ink">
                    {langkah.judul}
                  </h3>
                  <p className="mt-1 text-[14px] text-ink-muted">{langkah.ringkas}</p>
                </li>
              );
            })}
          </ol>
        </div>

        <HitungCepat />
      </section>

      {/* Testimoni */}
      <section className="border-t border-kabut-line bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading judul="Kata Pelanggan" />
          <div className="mt-9">
            <DaftarTestimoni />
          </div>
        </div>
      </section>

      {/* Ajakan dengan kolase foto */}
      <section className="bg-white pb-16 sm:pb-20">
        <div className="container-page">
          <div className="relative grid items-center gap-10 overflow-hidden rounded-3xl bg-zamrud-800 px-6 py-10 text-white sm:px-10 lg:grid-cols-[1.2fr_1fr] lg:py-14">
            <div>
              <h2 className="text-[30px] font-semibold leading-tight sm:text-[40px]">
                Punya acara dalam waktu dekat?
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/75">
                Kirim jumlah tamu dan tanggalnya, admin bantu pilihkan paket.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/menu" className="tombol tombol-lg bg-jingga-500 text-white hover:bg-jingga-600">
                  Lihat Menu
                  <ArrowRight size={18} />
                </Link>
                <a
                  href={`https://wa.me/${profil.teleponRaw}`}
                  target="_blank"
                  rel="noreferrer"
                  className="tombol tombol-lg border border-white/25 text-white hover:bg-white/10"
                >
                  <IconWhatsapp width={18} height={18} />
                  Tanya via WhatsApp
                </a>
              </div>
            </div>

            <div className="relative hidden h-64 sm:block" aria-hidden="true">
              {fotoKolase.map((src, i) =>
                src ? (
                  <span
                    key={src}
                    className={`absolute w-40 overflow-hidden rounded-2xl border-4 border-white shadow-xl lg:w-44 ${
                      [
                        "left-[4%] top-6 -rotate-6",
                        "left-[34%] top-0 z-10 rotate-2",
                        "left-[62%] top-10 rotate-6",
                      ][i]
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="aspect-square w-full object-cover" />
                  </span>
                ) : null,
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
