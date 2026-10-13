"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, Clock, Mail, MapPin, Phone } from "lucide-react";
import { DaftarKeunggulan } from "@/components/DaftarKeunggulan";
import { HeroHalaman } from "@/components/HeroHalaman";
import { IconInstagram, IconWhatsapp } from "@/components/Icons";
import { GambarPlaceholder, PetaPlaceholder } from "@/components/Placeholder";
import { SectionHeading } from "@/components/Ui";
import { useProfil } from "@/lib/useProfil";
import { useBahasa } from "@/store/BahasaProvider";
import { fotoDekorasi } from "@/lib/foto";

export function Tentang() {
  const profil = useProfil();
  const { t } = useBahasa();
  return (
    <>
      <HeroHalaman
        remah={[{ label: ["Beranda", "Home"], href: "/" }, { label: ["Tentang", "About"] }]}
        judul={["Tentang Asri Catering", "About Asri Catering"]}
        deskripsi={[
          `Dari dapur rumah Ibu Asri sejak ${profil.berdiri}, kini melayani kantor, sekolah, dan acara keluarga di Cilacap.`,
          `From Ibu Asri's home kitchen since ${profil.berdiri}, now serving offices, schools, and family events across Cilacap.`,
        ]}
        foto={fotoDekorasi.slice(1)}
      />

      {/* Sejarah & pemilik */}
      <section className="container-page py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <SectionHeading judul={t("Perjalanan Usaha", "Our Story")} />
            <ol className="mt-9">
              {profil.sejarah.map((s, i) => (
                <li key={s.tahun} className="relative flex gap-5 pb-9 last:pb-0">
                  {i < profil.sejarah.length - 1 && (
                    <span
                      className="absolute left-[27px] top-9 h-[calc(100%-2.25rem)] w-px bg-zamrud-200"
                      aria-hidden="true"
                    />
                  )}
                  <span className="flex h-9 w-14 shrink-0 items-center justify-center rounded-full bg-zamrud-700 text-[13px] font-bold tabular-nums text-white">
                    {s.tahun}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="font-sans text-[17px] font-semibold text-ink">{s.judul}</h3>
                    <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-ink-muted">
                      {s.isi}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-5">
            <div className="kartu p-3">
              <GambarPlaceholder
                label={t("Foto Ibu Asri di dapur — 1200 × 900 px", "Photo of Ibu Asri in the kitchen — 1200 × 900 px")}
                className="rounded-xl border-0"
              />
              <div className="px-3 pb-3 pt-5">
                <p className="text-[13px] text-ink-muted">{t("Pemilik usaha", "Owner")}</p>
                <h3 className="mt-0.5 text-[24px] font-semibold">{profil.pemilik}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                  {t(
                    `Memulai usaha dari dapur rumah pada ${profil.berdiri} dan sampai kini masih mengawasi langsung proses masak setiap hari.`,
                    `Started the business from her home kitchen in ${profil.berdiri} and still oversees the cooking every day.`,
                  )}
                </p>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4">
              {profil.statistik.map((s) => (
                <div key={s.label} className="kartu p-5">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block text-[28px] font-bold leading-none tabular-nums tracking-tight text-zamrud-800">
                      {s.angka}
                    </span>
                    <span className="mt-2 block text-[13px] text-ink-muted">{s.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Yang kami jaga, dengan mozaik foto */}
      <section className="container-page pb-14 sm:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {fotoDekorasi.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4" aria-hidden="true">
              {fotoDekorasi.slice(0, 4).map((src, i) => (
                <span
                  key={src}
                  className={`overflow-hidden rounded-2xl ${i % 2 === 1 ? "translate-y-6" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="aspect-square w-full object-cover" />
                </span>
              ))}
            </div>
          )}
          <div>
            <SectionHeading judul={t("Yang Kami Jaga", "What We Stand For")} />
            <div className="mt-8">
              <DaftarKeunggulan susunan="kolom" />
            </div>
          </div>
        </div>
      </section>

      {/* Informasi & lokasi */}
      <section className="border-y border-kabut-line bg-white">
        <div className="container-page py-14 sm:py-20">
          <SectionHeading judul={t("Alamat, Jam Buka, dan Kontak", "Address, Hours, and Contact")} />

          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl bg-kabut p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-zamrud-700">
                <MapPin size={20} strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 font-sans text-[17px] font-semibold">{t("Alamat dapur", "Kitchen address")}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{profil.alamat}</p>
              <div className="mt-5 border-t border-kabut-line pt-4">
                <p className="text-[13px] font-semibold text-ink">{t("Area layanan", "Service area")}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {profil.areaLayanan.map((a) => (
                    <li
                      key={a}
                      className="rounded-full bg-white px-2.5 py-1 text-[12px] text-ink-soft"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-kabut p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-zamrud-700">
                <Clock size={20} strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 font-sans text-[17px] font-semibold">{t("Jam operasional", "Opening hours")}</h3>
              <dl className="mt-3 divide-y divide-kabut-line">
                {profil.jamOperasional.map((j) => (
                  <div key={j.hari} className="flex justify-between gap-4 py-2.5 text-[14px]">
                    <dt className="text-ink-muted">{j.hari}</dt>
                    <dd className="font-semibold tabular-nums text-ink">{j.jam}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex flex-col rounded-2xl bg-kabut p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-zamrud-700">
                <Phone size={20} strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 font-sans text-[17px] font-semibold">{t("Kontak", "Contact")}</h3>
              <ul className="mt-3 space-y-3 text-[14px] text-ink-soft">
                <li className="flex items-center gap-2.5">
                  <Phone size={16} strokeWidth={1.8} className="shrink-0 text-ink-muted" />
                  <a href={`tel:${profil.teleponRaw}`} className="hover:text-zamrud-700">
                    {profil.telepon}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail size={16} strokeWidth={1.8} className="shrink-0 text-ink-muted" />
                  <a href={`mailto:${profil.email}`} className="hover:text-zamrud-700">
                    {profil.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <IconInstagram width={16} height={16} className="shrink-0 text-ink-muted" />
                  <span>{profil.instagram}</span>
                </li>
              </ul>
              <a
                href={`https://wa.me/${profil.teleponRaw}`}
                target="_blank"
                rel="noreferrer"
                className="tombol tombol-blok tombol-zamrud mt-auto"
              >
                <IconWhatsapp width={18} height={18} />
                {t("Chat WhatsApp", "Chat on WhatsApp")}
              </a>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl">
            <PetaPlaceholder
              label={t("Peta lokasi — sematkan Google Maps di sini", "Location map — embed Google Maps here")}
              rasio="aspect-[4/3] sm:aspect-[3/1]"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              judul={t("Pertanyaan Umum", "Frequently Asked Questions")}
              deskripsi={t(
                "Belum menemukan jawabannya? Tanyakan langsung lewat WhatsApp.",
                "Can’t find your answer? Ask us directly on WhatsApp.",
              )}
            />
          </div>
          <div className="lg:col-span-8">
            <div className="kartu divide-y divide-kabut-line">
              {profil.faq.map((f) => (
                <details key={f.tanya} className="group px-5 py-4 sm:px-6 sm:py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                    {f.tanya}
                    <ChevronDown
                      size={20}
                      className="shrink-0 text-ink-muted transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
                    {f.jawab}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ajakan */}
      <section className="container-page">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-zamrud-800 px-6 py-10 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <h2 className="text-[26px] font-semibold leading-tight sm:text-[32px]">
            {t("Siap memesan untuk acara Anda?", "Ready to order for your event?")}
          </h2>
          <Link href="/menu" className="tombol tombol-lg bg-jingga-500 text-white hover:bg-jingga-600">
            {t("Lihat Menu", "View Menu")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
