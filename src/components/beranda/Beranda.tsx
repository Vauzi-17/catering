"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Flame,
  ShoppingBag,
  Sparkles,
  Ticket,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { DaftarTestimoni } from "@/components/DaftarTestimoni";
import { HitungCepat } from "@/components/beranda/HitungCepat";
import { MenuLaris } from "@/components/beranda/MenuLaris";
import { PilihAcara } from "@/components/beranda/PilihAcara";
import { KartuFavorit, RingkasMenu, StikerHarga } from "@/components/beranda/SorotanHero";
import { IconWhatsapp } from "@/components/Icons";
import { FotoMenu } from "@/components/Placeholder";
import { SectionHeading } from "@/components/Ui";
import { useProfil } from "@/lib/useProfil";
import { useBahasa } from "@/store/BahasaProvider";
import { fotoMenu as foto } from "@/lib/foto";

const pitaPromo: [string, string][] = [
  ["Ongkir gratis dalam area layanan", "Free delivery within our service area"],
  ["Pesan paling lambat H-2 sebelum acara", "Order at least 2 days before your event"],
  ["Porsi cicip gratis untuk pesanan 100+ porsi", "Free tasting portion for orders of 100+"],
  ["Dimasak pagi di hari pengantaran", "Cooked on the morning of delivery"],
  ["Isi paket bisa disesuaikan", "Package contents can be customised"],
  ["Bayar dengan QRIS, nominal langsung terisi", "Pay with QRIS, amount filled in for you"],
  ["Status pesanan terpantau sampai diantar", "Track your order until it arrives"],
];

const ikonLangkah = [ShoppingBag, ClipboardList, Ticket, Truck];

export function Beranda() {
  const profil = useProfil();
  const { bahasa, t } = useBahasa();
  const promo = pitaPromo.map((p) => (bahasa === "en" ? p[1] : p[0]));
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
        <div className="container-page grid items-center gap-16 pb-24 pt-12 sm:pb-28 lg:grid-cols-[1fr_1.1fr] lg:gap-8 lg:pb-32 lg:pt-16">
          <div>
            <h1 className="text-[42px] font-medium leading-[1.03] sm:text-[58px] lg:text-[66px]">
              {t("Nasi Kotak & Bento untuk Setiap Acara", "Rice Boxes & Bento for Every Occasion")}
            </h1>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/85 sm:text-[17px]">
              {t(
                "Dimasak pagi di hari pengantaran, dari dapur Asri di Jeruklegi, Cilacap.",
                "Cooked on the morning of delivery in Asri's kitchen in Jeruklegi, Cilacap.",
              )}
            </p>

            <div className="mt-8">
              <RingkasMenu />
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/menu" className="tombol tombol-lg bg-white text-jingga-800 hover:bg-jingga-50">
                {t("Lihat Menu", "View Menu")}
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#hitung"
                className="tombol tombol-lg bg-jingga-800/45 text-white hover:bg-jingga-800/65"
              >
                {t("Hitung Estimasi", "Estimate Cost")}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-4 w-full max-w-[320px] sm:max-w-[440px] lg:mt-0 lg:max-w-[520px]">
            {/* Cahaya hangat di belakang piring */}
            <span
              className="hero-denyut pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(255,236,200,0.75)_0%,rgba(255,214,150,0.35)_40%,transparent_70%)] blur-2xl"
              aria-hidden="true"
            />
            {/* Cincin putus-putus yang berputar pelan */}
            <span
              className="hero-putar pointer-events-none absolute -inset-3 rounded-full border-2 border-dashed border-white/45 sm:-inset-5"
              aria-hidden="true"
            />

            {/* Piring utama */}
            <div className="hero-muncul group relative rounded-full bg-white/25 p-3 shadow-[0_45px_90px_-30px_rgba(80,30,0,0.75)] ring-1 ring-white/40 backdrop-blur-sm sm:p-4">
              <div className="overflow-hidden rounded-full ring-4 ring-white/70">
                {fotoUtama ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fotoUtama}
                    alt={t("Paket Nasi Kuning Bento Royal", "Royal Yellow Rice Bento")}
                    className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <FotoMenu src={fotoUtama} nama="Paket Nasi Kuning Bento Royal" rasio="aspect-square" className="rounded-full" />
                )}
              </div>
            </div>

            {/* Kilau kecil */}
            <Sparkles
              className="hero-kerlip absolute -left-2 top-[18%] h-6 w-6 text-jingga-100 sm:h-7 sm:w-7"
              aria-hidden="true"
            />
            <Sparkles
              className="hero-kerlip absolute right-[8%] top-[46%] h-5 w-5 text-white [animation-delay:1.1s]"
              aria-hidden="true"
            />
            <Sparkles
              className="hero-kerlip absolute bottom-[22%] left-[30%] h-4 w-4 text-jingga-100 [animation-delay:2s]"
              aria-hidden="true"
            />

            {/* Stiker harga */}
            <div className="hero-muncul absolute -left-3 -top-3 [animation-delay:0.25s] sm:-left-6 sm:-top-2">
              <StikerHarga />
            </div>

            {/* Foto kecil yang mengapung di sekitar piring */}
            {fotoOrbit[0] && (
              <span className="hero-muncul absolute -right-2 top-0 [animation-delay:0.35s] sm:-right-8 sm:top-2">
                <span className="hero-apung block h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-[0_18px_36px_-14px_rgba(80,30,0,0.7)] sm:h-32 sm:w-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fotoOrbit[0]} alt="" className="h-full w-full object-cover" />
                </span>
              </span>
            )}
            {fotoOrbit[1] && (
              <span className="hero-muncul absolute -right-1 bottom-[18%] [animation-delay:0.5s] sm:-right-10">
                <span className="hero-apung block h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-[0_18px_36px_-14px_rgba(80,30,0,0.7)] [animation-delay:1.5s] sm:h-28 sm:w-28">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fotoOrbit[1]} alt="" className="h-full w-full object-cover" />
                </span>
              </span>
            )}

            {/* Label segar */}
            <span className="hero-muncul absolute -left-8 top-[52%] hidden [animation-delay:0.6s] sm:block">
              <span className="hero-apung flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold text-ink shadow-[0_14px_30px_-14px_rgba(80,30,0,0.6)] [animation-delay:0.8s]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-jingga-100 text-jingga-600">
                  <Flame size={14} strokeWidth={2.2} />
                </span>
                {t("Dimasak pagi ini", "Cooked this morning")}
              </span>
            </span>

            <div className="hero-muncul absolute -bottom-6 left-1 max-w-[calc(100%-1rem)] [animation-delay:0.7s] sm:-left-6">
              <KartuFavorit />
            </div>
          </div>
        </div>
      </section>

      {/* Pita promo berjalan */}
      <section
        className="mt-10 overflow-hidden border-y border-zamrud-900 bg-zamrud-800 py-3.5 text-white"
        aria-label={t("Keunggulan layanan", "Why choose us")}
      >
        <ul className="pita-jalan flex w-max">
          {[...promo, ...promo].map((teks, i) => (
            <li
              key={i}
              aria-hidden={i >= promo.length}
              className="flex items-center gap-6 whitespace-nowrap pr-6 text-[14px] font-semibold sm:text-[15px]"
            >
              {teks}
              <UtensilsCrossed size={15} className="text-jingga-300" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </section>

      {/* Menu pilihan */}
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          judul={t("Menu Pilihan", "Featured Menu")}
          aksi={
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-jingga-700 hover:text-jingga-800"
            >
              {t("Semua menu", "All menu")}
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
        <SectionHeading judul={t("Pesan untuk Acara Apa?", "What’s the Occasion?")} />
        <div className="mt-8">
          <PilihAcara />
        </div>
      </section>

      {/* Angka usaha */}
      <section className="bg-zamrud-800 text-white">
        <div className="container-page grid gap-8 py-12 sm:py-14 lg:grid-cols-[1fr_2fr] lg:items-center">
          <h2 className="text-[28px] font-semibold leading-tight sm:text-[34px]">
            {t("Dari warung rames ke katering", "From a rice stall to catering")}
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
          <SectionHeading
            judul={t("Cara Pesan", "How to Order")}
            deskripsi={t("Pesanan diterima setiap hari, paling lambat H-2 sebelum acara.", "We take orders every day, at least 2 days before your event.")}
          />

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

      {/* Testimoni — tampil hanya bila sudah ada ulasan asli */}
      {profil.testimoni.length > 0 && (
        <section className="border-t border-kabut-line bg-white py-16 sm:py-20">
          <div className="container-page">
            <SectionHeading judul={t("Kata Pelanggan", "What Customers Say")} />
            <div className="mt-9">
              <DaftarTestimoni />
            </div>
          </div>
        </section>
      )}

      {/* Ajakan dengan kolase foto */}
      <section className={`pb-16 sm:pb-20 ${profil.testimoni.length > 0 ? "bg-white" : ""}`}>
        <div className="container-page">
          <div className="relative grid items-center gap-10 overflow-hidden rounded-3xl bg-zamrud-800 px-6 py-10 text-white sm:px-10 lg:grid-cols-[1.2fr_1fr] lg:py-14">
            <div>
              <h2 className="text-[30px] font-semibold leading-tight sm:text-[40px]">
                {t("Punya acara dalam waktu dekat?", "Have an event coming up?")}
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/75">
                {t(
                  "Kirim jumlah tamu dan tanggalnya, admin bantu pilihkan paket.",
                  "Send us the guest count and date, and we’ll help you choose a package.",
                )}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/menu" className="tombol tombol-lg bg-jingga-500 text-white hover:bg-jingga-600">
                  {t("Lihat Menu", "View Menu")}
                  <ArrowRight size={18} />
                </Link>
                <a
                  href={`https://wa.me/${profil.teleponRaw}`}
                  target="_blank"
                  rel="noreferrer"
                  className="tombol tombol-lg border border-white/25 text-white hover:bg-white/10"
                >
                  <IconWhatsapp width={18} height={18} />
                  {t("Tanya via WhatsApp", "Ask on WhatsApp")}
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
