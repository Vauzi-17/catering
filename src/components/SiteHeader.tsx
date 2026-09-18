"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { IconClose, IconMenu, IconPhone } from "@/components/Icons";
import { profil } from "@/data/profil";
import { useData } from "@/store/DataProvider";

const navigasi = [
  { label: "Beranda", href: "/" },
  { label: "Menu & Harga", href: "/menu" },
  { label: "Tentang Kami", href: "/tentang" },
  { label: "Lacak Pesanan", href: "/lacak" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [buka, setBuka] = useState(false);
  const { keranjang, siap } = useData();

  const jumlahKeranjang = keranjang.reduce((a, k) => a + k.qty, 0);

  useEffect(() => {
    setBuka(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = buka ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [buka]);

  const aktif = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur-[2px]">
      <div className="hidden border-b border-line/80 bg-brand-800 text-white md:block">
        <div className="container-page flex h-9 items-center justify-between text-[12px]">
          <p className="text-brand-100">
            Melayani Bandung &amp; sekitarnya · Pesanan H-1 masih bisa dikerjakan
          </p>
          <a
            href={`tel:${profil.teleponRaw}`}
            className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-brand-100"
          >
            <IconPhone width={14} height={14} />
            {profil.telepon}
          </a>
        </div>
      </div>

      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link href="/" aria-label="Asri Catering — beranda">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {navigasi.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                aktif(item.href)
                  ? "bg-brand-100 text-brand-800"
                  : "text-ink-soft hover:bg-brand-50 hover:text-brand-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/pesan" className="btn btn-primary btn-md hidden sm:inline-flex">
            Pesan Sekarang
            {siap && jumlahKeranjang > 0 && (
              <span className="ml-0.5 rounded-full bg-white px-1.5 py-0.5 text-[11px] font-bold text-brand-800">
                {jumlahKeranjang}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setBuka((v) => !v)}
            className="btn btn-outline h-11 w-11 p-0 lg:hidden"
            aria-expanded={buka}
            aria-label={buka ? "Tutup menu navigasi" : "Buka menu navigasi"}
          >
            {buka ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {buka && (
        <div className="border-t border-line bg-cream lg:hidden">
          <nav className="container-page flex flex-col py-3" aria-label="Navigasi seluler">
            {navigasi.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-3 text-[15px] font-semibold ${
                  aktif(item.href)
                    ? "bg-brand-100 text-brand-800"
                    : "text-ink-soft hover:bg-brand-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/pesan" className="btn btn-primary btn-md mt-2 w-full">
              Pesan Sekarang
              {siap && jumlahKeranjang > 0 && ` (${jumlahKeranjang})`}
            </Link>
            <a
              href={`tel:${profil.teleponRaw}`}
              className="mt-2 inline-flex items-center justify-center gap-2 py-2 text-sm font-semibold text-ink-muted"
            >
              <IconPhone width={16} height={16} />
              {profil.telepon}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
