"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, Menu as IconMenu, Phone, ShoppingBag, X } from "lucide-react";
import { IconWhatsapp } from "@/components/Icons";
import { Logo } from "@/components/Logo";
import { profil } from "@/data/profil";
import { useAuth } from "@/store/AuthProvider";
import { useBahasa, type Bahasa } from "@/store/BahasaProvider";
import { useData } from "@/store/DataProvider";

const navigasi = [
  { label: ["Beranda", "Home"], href: "/" },
  { label: ["Menu", "Menu"], href: "/menu" },
  { label: ["Tentang", "About"], href: "/tentang" },
  { label: ["Pesanan Saya", "My Orders"], href: "/pesanan" },
] as const;

/**
 * Pengganti bahasa di samping tombol keranjang. Di layar sempit cukup satu
 * tombol yang menampilkan bahasa tujuan; di layar lebar dua pilihan ID | EN.
 */
function PilihBahasa() {
  const { bahasa, setBahasa, t } = useBahasa();
  const tujuan: Bahasa = bahasa === "id" ? "en" : "id";
  return (
    <>
      <button
        type="button"
        onClick={() => setBahasa(tujuan)}
        lang={tujuan}
        aria-label={tujuan === "en" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-kabut-line text-[12px] font-bold tracking-wide text-ink-soft transition-colors hover:bg-kabut-deep sm:hidden"
      >
        {tujuan.toUpperCase()}
      </button>
      <div
        role="group"
        aria-label={t("Pilih bahasa", "Choose language")}
        className="hidden h-10 items-center rounded-full border border-kabut-line p-1 sm:inline-flex"
      >
        {(["id", "en"] as Bahasa[]).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBahasa(b)}
            aria-pressed={bahasa === b}
            lang={b}
            title={b === "id" ? "Bahasa Indonesia" : "English"}
            className={`h-8 min-w-[34px] rounded-full px-2 text-[12px] font-bold tracking-wide transition-colors ${
              bahasa === b ? "bg-zamrud-700 text-white" : "text-ink-soft hover:bg-kabut-deep"
            }`}
          >
            {b.toUpperCase()}
          </button>
        ))}
      </div>
    </>
  );
}

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
  const { bahasa, t } = useBahasa();
  const label = (l: readonly [string, string]) => (bahasa === "en" ? l[1] : l[0]);

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
      className="inline-flex h-9 items-center gap-2 rounded-full border border-kabut-line pl-1 pr-1 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-kabut-deep sm:h-10 sm:pr-3.5"
      aria-label={t("Akun saya", "My account")}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zamrud-700 text-[12px] font-bold text-white sm:h-8 sm:w-8">
        {inisial(auth.profil?.nama ?? "", auth.pengguna.email ?? "")}
      </span>
      <span className="hidden max-w-[110px] truncate sm:inline">{auth.profil?.nama?.split(" ")[0] || t("Akun", "Account")}</span>
    </Link>
  ) : (
    <Link
      href={`/masuk/?lanjut=${encodeURIComponent(pathname)}`}
      className="tombol h-9 w-9 bg-zamrud-700 text-[13px] text-white hover:bg-zamrud-800 sm:h-10 sm:w-auto sm:px-4"
    >
      <LogIn size={16} />
      <span className="hidden sm:inline">{t("Masuk", "Sign in")}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-kabut-line bg-white/95 backdrop-blur-sm">
      <div className="container-page flex h-16 items-center justify-between gap-2 sm:gap-3 lg:h-[72px]">
        <Link href="/" className="min-w-0" aria-label={t("Asri Catering — beranda", "Asri Catering — home")}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("Navigasi utama", "Main navigation")}>
          {navigasi.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={aktif(item.href) ? "page" : undefined}
              className={`inline-flex items-center rounded-lg px-3.5 py-2 text-[13px] font-semibold tracking-wide transition-colors ${
                aktif(item.href) ? "bg-zamrud-700 text-white" : "text-ink-soft hover:bg-kabut-deep hover:text-ink"
              }`}
            >
              {label(item.label)}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <PilihBahasa />
          <button
            type="button"
            onClick={bukaKeranjang}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-kabut-line text-ink-soft transition-colors hover:bg-kabut-deep sm:h-10 sm:w-10"
            aria-label={t(`Buka keranjang, ${jumlahPaket} paket`, `Open cart, ${jumlahPaket} items`)}
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-kabut-line text-ink-soft transition-colors hover:bg-kabut-deep sm:h-10 sm:w-10 lg:hidden"
            aria-expanded={buka}
            aria-label={buka ? t("Tutup menu navigasi", "Close navigation menu") : t("Buka menu navigasi", "Open navigation menu")}
          >
            {buka ? <X size={18} /> : <IconMenu size={18} />}
          </button>
        </div>
      </div>

      {buka && (
        <div className="border-t border-kabut-line bg-white lg:hidden">
          <nav className="container-page flex flex-col py-3" aria-label={t("Navigasi seluler", "Mobile navigation")}>
            {navigasi.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktif(item.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-3 text-[15px] font-semibold ${
                  aktif(item.href) ? "bg-zamrud-50 text-zamrud-800" : "text-ink-soft hover:bg-kabut"
                }`}
              >
                {label(item.label)}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-kabut-line pt-4">
              <a href={`https://wa.me/${profil.teleponRaw}`} target="_blank" rel="noreferrer" className="tombol tombol-md tombol-zamrud">
                <IconWhatsapp width={16} height={16} />
                WhatsApp
              </a>
              <a href={`tel:${profil.teleponRaw}`} className="tombol tombol-md tombol-garis">
                <Phone size={16} strokeWidth={1.8} />
                {t("Telepon", "Call")}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
