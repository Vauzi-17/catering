import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChefHat,
  ClipboardList,
  Quote,
  Receipt,
  Soup,
} from "lucide-react";
import { HitungCepat } from "@/components/beranda/HitungCepat";
import { MenuLaris } from "@/components/beranda/MenuLaris";
import { KartuFavorit, RingkasMenu } from "@/components/beranda/SorotanHero";
import { IconWhatsapp } from "@/components/Icons";
import { GambarPlaceholder } from "@/components/Placeholder";
import { kategoriMenu } from "@/data/menu";
import { profil } from "@/data/profil";

// Urutan ikon mengikuti urutan profil.keunggulan.
const ikonKeunggulan = [ChefHat, Receipt, Soup, ClipboardList];

function inisial(nama: string) {
  return nama
    .replace(/^(Bapak|Ibu)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0])
    .join("")
    .toUpperCase();
}

function JudulBagian({
  eyebrow,
  judul,
  deskripsi,
  className = "",
}: {
  eyebrow: string;
  judul: string;
  deskripsi?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-jingga-700">{eyebrow}</p>
      <h2 className="mt-2 text-[32px] font-semibold leading-[1.1] sm:text-[40px]">{judul}</h2>
      {deskripsi && (
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">{deskripsi}</p>
      )}
    </div>
  );
}

export default function Beranda() {
  return (
    <div className="bg-kabut">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-b-[50%_56px] bg-gradient-to-br from-jingga-700 via-jingga-600 to-jingga-400 text-white sm:rounded-b-[50%_88px]">
        <div className="container-page grid items-center gap-12 pb-24 pt-12 sm:pb-28 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:pb-32 lg:pt-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Katering Bandung sejak {profil.berdiri}
            </p>

            <h1 className="mt-5 text-[40px] font-medium leading-[1.05] sm:text-[56px] lg:text-[64px]">
              Pilih Hidangan untuk Acara Anda
            </h1>

            <p className="mt-5 max-w-[34rem] text-[16px] leading-relaxed text-white/85 sm:text-[17px]">
              Nasi kotak, bento, prasmanan, dan tumpeng dari dapur Ibu Asri. Dimasak pagi
              di hari pengantaran, dikemas rapi, dan tiba sebelum acara dimulai.
            </p>

            <div className="mt-7">
              <RingkasMenu />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-jingga-800 transition-colors hover:bg-jingga-50"
              >
                Pesan Sekarang
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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <JudulBagian
            eyebrow="Menu pilihan"
            judul="Paling Laris"
            deskripsi="Paket yang paling sering dipesan ulang untuk rapat, syukuran, dan acara keluarga."
          />
          <p className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-zamrud-100 bg-zamrud-50 px-3.5 py-1.5 text-[12px] font-semibold text-zamrud-800 sm:self-auto">
            <BadgeCheck size={16} strokeWidth={1.8} className="text-zamrud-600" />
            Dimasak di hari pengantaran
          </p>
        </div>

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
      <section className="border-y border-kabut-line bg-kabut-deep py-16 sm:py-20">
        <div className="container-page">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {profil.keunggulan.map((k, i) => {
              const Ikon = ikonKeunggulan[i % ikonKeunggulan.length];
              return (
                <li
                  key={k.judul}
                  className="flex gap-4 rounded-2xl border border-kabut-line bg-white p-5 sm:flex-col sm:gap-5 sm:p-6"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-jingga-50 text-jingga-600">
                    <Ikon size={22} strokeWidth={1.8} />
                  </span>
                  <span>
                    <span className="block font-sans text-[17px] font-semibold text-ink">
                      {k.judul}
                    </span>
                    <span className="mt-1.5 block text-[14px] leading-relaxed text-ink-muted">
                      {k.isi}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Cara pesan + estimasi */}
      <section className="container-page grid gap-12 py-20 sm:py-24 lg:grid-cols-[1fr_440px] lg:gap-16">
        <div>
          <JudulBagian
            eyebrow="Cara pesan"
            judul="Dari keranjang sampai meja acara"
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
          <JudulBagian eyebrow="Kata pelanggan" judul="Dipesan ulang, bukan sekali coba" />

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {profil.testimoni.map((t) => (
              <figure
                key={t.nama}
                className="flex flex-col rounded-2xl border border-kabut-line bg-kabut p-6"
              >
                <Quote size={22} className="text-jingga-400" strokeWidth={1.8} aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-soft">
                  {t.isi}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-kabut-line pt-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zamrud-50 text-[13px] font-bold text-zamrud-700">
                    {inisial(t.nama)}
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold text-ink">{t.nama}</span>
                    <span className="block text-[12px] text-ink-muted">{t.peran}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
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
    </div>
  );
}
