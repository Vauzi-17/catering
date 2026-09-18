import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import {
  IconInstagram,
  IconMail,
  IconMapPin,
  IconPhone,
  IconWhatsapp,
} from "@/components/Icons";
import { profil } from "@/data/profil";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-display text-xl font-semibold">Asri Catering</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
            {profil.deskripsiSingkat}
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href={`https://wa.me/${profil.teleponRaw}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
            >
              <IconWhatsapp width={16} height={16} />
              WhatsApp
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
            >
              <IconInstagram width={16} height={16} />
              Instagram
            </a>
          </div>
        </div>

        <div className="md:col-span-3">
          <h3 className="text-sm font-bold text-ink">Navigasi</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            {[
              { label: "Beranda", href: "/" },
              { label: "Menu & Harga", href: "/menu" },
              { label: "Tentang Kami", href: "/tentang" },
              { label: "Pesan Online", href: "/pesan" },
              { label: "Lacak Pesanan", href: "/lacak" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-brand-700">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h3 className="text-sm font-bold text-ink">Hubungi Kami</h3>
          <ul className="mt-4 space-y-3.5 text-sm text-ink-muted">
            <li className="flex gap-2.5">
              <IconMapPin className="mt-0.5 shrink-0 text-brand-600" width={18} height={18} />
              <span>{profil.alamat}</span>
            </li>
            <li className="flex gap-2.5">
              <IconPhone className="mt-0.5 shrink-0 text-brand-600" width={18} height={18} />
              <a href={`tel:${profil.teleponRaw}`} className="hover:text-brand-700">
                {profil.telepon}
              </a>
            </li>
            <li className="flex gap-2.5">
              <IconMail className="mt-0.5 shrink-0 text-brand-600" width={18} height={18} />
              <a href={`mailto:${profil.email}`} className="hover:text-brand-700">
                {profil.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-5 text-[13px] text-ink-muted sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} Asri Catering. Seluruh hak cipta dilindungi.
          </p>
          <Link href="/admin/login" className="font-semibold hover:text-brand-700">
            Masuk Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
