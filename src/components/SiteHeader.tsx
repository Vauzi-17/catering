"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu as IconMenu, Phone, ShoppingBag, UserRound, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { profil } from "@/data/profil";
import { useData } from "@/store/DataProvider";

const navigasi = [
  { label: "Beranda", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Tentang", href: "/tentang" },
  { label: "Keranjang", href: "/pesan", keranjang: true },
  { label: "Status Pesanan", href: "/lacak" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [buka, setBuka] = useState(false);
  const { keranjang, siap } = useData();

  const jumlahKeranjang = siap ? keranjang.reduce((a, k) => a + k.qty, 0) : 0;
  const jumlahPaket = siap ? keranjang.length : 0;

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

  const label = (item: (typeof navigasi)[number]) =>
    item.keranjang ? `${item.label} (${jumlahPaket})` : item.label;

  return (
    <header className="sticky top-0 z-50 border-b border-kabut-line bg-white/95 backdrop-blur-sm">
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link href="/" aria-label="Asri Catering — beranda">
          <Logo warna="zamrud" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {navigasi.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={aktif(item.href) ? "page" : undefined}
              className={`rounded-lg px-3.5 py-2 text-[13px] font-semibold tracking-wide transition-colors ${
                aktif(item.href)
                  ? "bg-zamrud-700 text-white"
                  : "text-ink-soft hover:bg-kabut-deep hover:text-ink"
              }`}
            >
              {label(item)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/pesan"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-kabut-line text-ink-soft transition-colors hover:bg-kabut-deep lg:hidden"
            aria-label={`Keranjang, ${jumlahKeranjang} porsi`}
          >
            <ShoppingBag size={18} strokeWidth={1.8} />
            {jumlahPaket > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-jingga-600 px-1 text-[10px] font-bold text-white">
                {jumlahPaket}
              </span>
            )}
          </Link>

          <Link
            href="/admin/login"
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-zamrud-700 text-white transition-colors hover:bg-zamrud-800 lg:inline-flex"
            aria-label="Masuk admin"
            title="Masuk admin"
          >
            <UserRound size={18} strokeWidth={1.8} />
          </Link>

          <button
            type="button"
            onClick={() => setBuka((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-kabut-line text-ink-soft transition-colors hover:bg-kabut-deep lg:hidden"
            aria-expanded={buka}
            aria-label={buka ? "Tutup menu navigasi" : "Buka menu navigasi"}
          >
            {buka ? <X size={18} /> : <IconMenu size={18} />}
          </button>
        </div>
      </div>

      {buka && (
        <div className="border-t border-kabut-line bg-white lg:hidden">
          <nav className="container-page flex flex-col py-3" aria-label="Navigasi seluler">
            {navigasi.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktif(item.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-3 text-[15px] font-semibold ${
                  aktif(item.href)
                    ? "bg-zamrud-50 text-zamrud-800"
                    : "text-ink-soft hover:bg-kabut"
                }`}
              >
                {label(item)}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-kabut-line px-3 pt-4">
              <a
                href={`tel:${profil.teleponRaw}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted"
              >
                <Phone size={16} strokeWidth={1.8} />
                {profil.telepon}
              </a>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-zamrud-700"
              >
                <UserRound size={16} strokeWidth={1.8} />
                Masuk admin
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
