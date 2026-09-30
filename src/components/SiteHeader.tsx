"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, Menu as IconMenu, Phone, ShoppingBag, X } from "lucide-react";
import { IconWhatsapp } from "@/components/Icons";
import { Logo } from "@/components/Logo";
import { profil } from "@/data/profil";
import { useAuth } from "@/store/AuthProvider";
import { useData } from "@/store/DataProvider";

const navigasi = [
  { label: "Beranda", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Tentang", href: "/tentang" },
  { label: "Pesanan Saya", href: "/pesanan" },
];

function inisial(nama: string, email: string) {
  const sumber = nama.trim() || email;
  return sumber
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0])
    .join("")
    .toUpperCase();
}

export function SiteHeader() {
  const pathname = usePathname();
  const [buka, setBuka] = useState(false);
  const { keranjang, siap, bukaKeranjang } = useData();
  const auth = useAuth();

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

  const aktif = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const tombolAkun = auth.pengguna ? (
    <Link
      href="/akun/"
      className="inline-flex h-10 items-center gap-2 rounded-full border border-kabut-line pl-1 pr-3.5 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-kabut-deep"
      aria-label="Akun saya"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zamrud-700 text-[12px] font-bold text-white">
        {inisial(auth.profil?.nama ?? "", auth.pengguna.email ?? "")}
      </span>
      <span className="hidden max-w-[110px] truncate sm:inline">{auth.profil?.nama?.split(" ")[0] || "Akun"}</span>
    </Link>
  ) : (
    <Link
      href={`/masuk/?lanjut=${encodeURIComponent(pathname)}`}
      className="tombol h-10 bg-zamrud-700 px-4 text-[13px] text-white hover:bg-zamrud-800"
    >
      <LogIn size={16} />
      <span className="hidden sm:inline">Masuk</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-kabut-line bg-white/95 backdrop-blur-sm">
      <div className="container-page flex h-16 items-center justify-between gap-3 lg:h-[72px]">
        <Link href="/" aria-label="Asri Catering — beranda">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {navigasi.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={aktif(item.href) ? "page" : undefined}
              className={`inline-flex items-center rounded-lg px-3.5 py-2 text-[13px] font-semibold tracking-wide transition-colors ${
                aktif(item.href) ? "bg-zamrud-700 text-white" : "text-ink-soft hover:bg-kabut-deep hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={bukaKeranjang}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-kabut-line text-ink-soft transition-colors hover:bg-kabut-deep"
            aria-label={`Buka keranjang, ${jumlahPaket} paket`}
          >
            <ShoppingBag size={18} strokeWidth={1.8} />
            {jumlahPaket > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-jingga-600 px-1 text-[10px] font-bold text-white">
                {jumlahPaket}
              </span>
            )}
          </button>

          {auth.aktif && auth.siap && tombolAkun}

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
                  aktif(item.href) ? "bg-zamrud-50 text-zamrud-800" : "text-ink-soft hover:bg-kabut"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-kabut-line pt-4">
              <a href={`https://wa.me/${profil.teleponRaw}`} target="_blank" rel="noreferrer" className="tombol tombol-md tombol-zamrud">
                <IconWhatsapp width={16} height={16} />
                WhatsApp
              </a>
              <a href={`tel:${profil.teleponRaw}`} className="tombol tombol-md tombol-garis">
                <Phone size={16} strokeWidth={1.8} />
                Telepon
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
