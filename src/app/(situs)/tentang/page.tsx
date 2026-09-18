import type { Metadata } from "next";
import Link from "next/link";
import { GambarPlaceholder, PetaPlaceholder } from "@/components/Placeholder";
import { PageHeader, SectionHeading } from "@/components/Ui";
import {
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconInstagram,
  IconMail,
  IconMapPin,
  IconPhone,
  IconWhatsapp,
} from "@/components/Icons";
import { profil } from "@/data/profil";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Profil Asri Catering: sejarah singkat usaha, alamat dapur, jam operasional, area layanan, dan kontak yang bisa dihubungi.",
};

export default function HalamanTentang() {
  return (
    <>
      <PageHeader
        eyebrow="Profil usaha"
        judul="Tentang Asri Catering"
        deskripsi={profil.deskripsiSingkat}
      />

      {/* Sejarah singkat */}
      <section className="container-page py-12 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow="Sejarah singkat" judul="Perjalanan usaha" />
            <ol className="mt-8">
              {profil.sejarah.map((s, i) => (
                <li key={s.tahun} className="relative flex gap-5 pb-8 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 text-[13px] font-bold text-brand-700">
                      {s.tahun}
                    </span>
                    {i < profil.sejarah.length - 1 && (
                      <span className="mt-1 w-px flex-1 bg-line" aria-hidden="true" />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="text-[16px] font-semibold">{s.judul}</h3>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-muted">
                      {s.isi}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-5">
            <div className="card overflow-hidden">
              <GambarPlaceholder label="Foto Ibu Asri di dapur — 1200 × 900 px" />
              <div className="border-t border-line p-6">
                <p className="eyebrow">Pemilik usaha</p>
                <h3 className="mt-2 font-display text-xl">{profil.pemilik}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Memulai usaha dari dapur rumah pada {profil.berdiri} dan sampai
                  kini masih mengawasi langsung proses masak setiap hari.
                </p>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4">
              {profil.statistik.map((s) => (
                <div key={s.label} className="card p-5">
                  <dt className="font-display text-[22px] leading-none text-brand-800">
                    {s.angka}
                  </dt>
                  <dd className="mt-2 text-[13px] text-ink-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Keunggulan */}
      <section className="border-y border-line bg-white py-12 sm:py-14">
        <div className="container-page">
          <SectionHeading eyebrow="Kenapa Asri Catering" judul="Yang kami jaga" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {profil.keunggulan.map((k) => (
              <div key={k.judul} className="card p-5">
                <IconCheck className="text-brand-600" width={21} height={21} />
                <h3 className="mt-4 text-[15px] font-semibold">{k.judul}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  {k.isi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Informasi & lokasi */}
      <section className="container-page py-12 sm:py-14">
        <SectionHeading eyebrow="Informasi usaha" judul="Alamat, jam buka, dan kontak" />

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="card p-6">
            <IconMapPin className="text-brand-600" width={22} height={22} />
            <h3 className="mt-4 text-[15px] font-semibold">Alamat dapur</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{profil.alamat}</p>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[13px] font-semibold text-ink">Area layanan</p>
              <ul className="mt-2 space-y-1 text-[13px] text-ink-muted">
                {profil.areaLayanan.map((a) => (
                  <li key={a}>• {a}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card p-6">
            <IconClock className="text-brand-600" width={22} height={22} />
            <h3 className="mt-4 text-[15px] font-semibold">Jam operasional</h3>
            <dl className="mt-3 divide-y divide-line">
              {profil.jamOperasional.map((j) => (
                <div key={j.hari} className="flex justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-ink-muted">{j.hari}</dt>
                  <dd className="font-semibold text-ink">{j.jam}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-6">
            <IconPhone className="text-brand-600" width={22} height={22} />
            <h3 className="mt-4 text-[15px] font-semibold">Kontak</h3>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <IconPhone className="mt-0.5 shrink-0 text-ink-muted" width={17} height={17} />
                <a href={`tel:${profil.teleponRaw}`} className="hover:text-brand-700">
                  {profil.telepon}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <IconMail className="mt-0.5 shrink-0 text-ink-muted" width={17} height={17} />
                <a href={`mailto:${profil.email}`} className="hover:text-brand-700">
                  {profil.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <IconInstagram className="mt-0.5 shrink-0 text-ink-muted" width={17} height={17} />
                <span>{profil.instagram}</span>
              </li>
            </ul>
            <a
              href={`https://wa.me/${profil.teleponRaw}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-md mt-5 w-full"
            >
              <IconWhatsapp width={18} height={18} />
              Chat WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-card border border-line">
          <PetaPlaceholder label="Peta lokasi — sematkan Google Maps di sini" />
        </div>
      </section>

      {/* Testimoni */}
      <section className="border-y border-line bg-white py-12 sm:py-14">
        <div className="container-page">
          <SectionHeading eyebrow="Kata pelanggan" judul="Sudah dipercaya sejak 2016" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {profil.testimoni.map((t) => (
              <figure key={t.nama} className="card flex flex-col p-5">
                <blockquote className="flex-1 text-[14px] leading-relaxed text-ink-soft">
                  &ldquo;{t.isi}&rdquo;
                </blockquote>
                <figcaption className="mt-5 border-t border-line pt-3.5">
                  <p className="text-sm font-semibold">{t.nama}</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-muted">{t.peran}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page py-12 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Pertanyaan umum" judul="Sering ditanyakan" />
          </div>
          <div className="lg:col-span-8">
            <div className="card divide-y divide-line">
              {profil.faq.map((f) => (
                <details key={f.tanya} className="group px-5 py-4 sm:px-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink marker:hidden">
                    {f.tanya}
                    <IconChevronDown
                      className="shrink-0 text-ink-muted transition-transform group-open:rotate-180"
                      width={20}
                      height={20}
                    />
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
                    {f.jawab}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-brand-800 text-white">
        <div className="container-page flex flex-col items-start gap-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-[24px] leading-tight sm:text-[28px]">
            Siap memesan untuk acara Anda?
          </h2>
          <Link
            href="/menu"
            className="btn btn-md border-white bg-white text-brand-800 hover:bg-brand-50"
          >
            Lihat menu
            <IconArrowRight width={18} height={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
