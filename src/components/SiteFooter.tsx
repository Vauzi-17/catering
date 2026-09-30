"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { IconInstagram, IconWhatsapp } from "@/components/Icons";
import { profil } from "@/data/profil";

const jelajahi = [
  { label: "Beranda", href: "/" },
  { label: "Menu & Harga", href: "/menu" },
  { label: "Tentang Kami", href: "/tentang" },
  { label: "Pesan Online", href: "/pesan" },
  { label: "Status Pesanan", href: "/lacak" },
];

export function SiteFooter() {
  // Beranda ditutup oleh blok ajakan penuh, jadi footer langsung menempel.
  const beranda = usePathname() === "/";

  return (
    <footer className={`border-t border-kabut-line bg-kabut-deep ${beranda ? "" : "mt-20"}`}>
      <div className="container-page grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <span className="font-display text-[22px] font-semibold">Asri Catering</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            {profil.deskripsiSingkat}
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href={`https://wa.me/${profil.teleponRaw}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-kabut-line bg-white px-3.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-zamrud-200 hover:text-zamrud-700"
            >
              <IconWhatsapp width={15} height={15} />
              WhatsApp
            </a>
            <a
              href={`https://instagram.com/${profil.instagram.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-kabut-line bg-white px-3.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-zamrud-200 hover:text-zamrud-700"
            >
              <IconInstagram width={15} height={15} />
              Instagram
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="font-sans text-sm font-bold text-ink">Jelajahi</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            {jelajahi.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-zamrud-700">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h3 className="font-sans text-sm font-bold text-ink">Kontak &amp; Reservasi</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-soft">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 shrink-0 text-zamrud-700" size={16} strokeWidth={1.8} />
              <span>{profil.alamatSingkat}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 shrink-0 text-zamrud-700" size={16} strokeWidth={1.8} />
              <a href={`tel:${profil.teleponRaw}`} className="hover:text-zamrud-700">
                {profil.telepon}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 shrink-0 text-zamrud-700" size={16} strokeWidth={1.8} />
              <a href={`mailto:${profil.email}`} className="hover:text-zamrud-700">
                {profil.email}
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h3 className="font-sans text-sm font-bold text-ink">Jam Layanan</h3>
          <dl className="mt-4 space-y-2 text-sm">
            {profil.jamOperasional.map((j) => (
              <div key={j.hari} className="flex justify-between gap-4">
                <dt className="text-ink-soft">{j.hari}</dt>
                <dd className="text-right font-medium tabular-nums text-ink">{j.jam}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t border-kabut-line">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-5 text-[12px] font-medium text-ink-muted sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Asri Catering. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <span>Dimasak di dapur sendiri, {profil.alamatSingkat.split(", ").pop()}</span>
            <span className="h-1 w-1 rounded-full bg-ink-muted/60" aria-hidden="true" />
            <Link href="/admin/login" className="hover:text-zamrud-700">
              Masuk Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
