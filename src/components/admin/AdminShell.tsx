"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/Logo";
import {
  IconAlert,
  IconBox,
  IconCalculator,
  IconChart,
  IconClipboard,
  IconClose,
  IconGrid,
  IconLeaf,
  IconLogout,
  IconMenu,
  IconSparkle,
} from "@/components/Icons";
import { useData } from "@/store/DataProvider";

const menuAdmin = [
  { label: "Dashboard", href: "/admin", ikon: IconGrid },
  { label: "Pesanan", href: "/admin/pesanan", ikon: IconClipboard },
  { label: "Menu", href: "/admin/menu", ikon: IconBox },
  { label: "Bahan Baku", href: "/admin/bahan", ikon: IconLeaf },
  { label: "Hitung HPP", href: "/admin/hpp", ikon: IconCalculator },
  { label: "Laporan", href: "/admin/laporan", ikon: IconChart },
  { label: "AI Assistant", href: "/admin/asisten", ikon: IconSparkle },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { masuk, siap, logout, muatPesanan, galat, bersihkanGalat, daring } = useData();
  const [bukaNav, setBukaNav] = useState(false);

  const halamanLogin = pathname.startsWith("/admin/login");

  useEffect(() => {
    setBukaNav(false);
  }, [pathname]);

  useEffect(() => {
    if (siap && !masuk && !halamanLogin) {
      router.replace("/admin/login");
    }
  }, [siap, masuk, halamanLogin, router]);

  // Daftar pesanan baru diambil setelah admin masuk, bukan di halaman pelanggan.
  useEffect(() => {
    if (siap && masuk && !halamanLogin) void muatPesanan();
  }, [siap, masuk, halamanLogin, muatPesanan]);

  if (halamanLogin) return <>{children}</>;

  if (!siap) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-ink-muted">Memuat panel admin…</p>
      </div>
    );
  }

  if (!masuk) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-5">
        <div className="card max-w-sm p-7 text-center">
          <h1 className="font-display text-xl">Akses terbatas</h1>
          <p className="mt-3 text-sm text-ink-muted">
            Halaman ini hanya untuk admin. Silakan masuk terlebih dahulu.
          </p>
          <Link href="/admin/login" className="btn btn-primary btn-md mt-6 w-full">
            Ke halaman masuk
          </Link>
        </div>
      </div>
    );
  }

  const aktif = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const isiNav = (
    <nav className="flex flex-col gap-1" aria-label="Navigasi admin">
      {menuAdmin.map((m) => (
        <Link
          key={m.href}
          href={m.href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
            aktif(m.href)
              ? "bg-brand-700 text-white"
              : "text-brand-100 hover:bg-brand-700/60 hover:text-white"
          }`}
        >
          <m.ikon width={18} height={18} className="shrink-0" />
          {m.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-cream lg:flex">
      {/* Sidebar desktop */}
      <aside className="hidden w-[264px] shrink-0 flex-col justify-between bg-brand-900 p-5 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div>
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[17px] font-semibold text-white">
                Asri Catering
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-300">
                Panel Admin
              </span>
            </span>
          </Link>
          <div className="mt-7">{isiNav}</div>
        </div>

        <div className="border-t border-brand-800 pt-4">
          <p className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold text-brand-300">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                daring ? "bg-brand-300" : "bg-amber-400"
              }`}
            />
            {daring ? "Terhubung Supabase" : "Mode data contoh"}
          </p>
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-[13px] font-semibold text-brand-200 hover:bg-brand-800 hover:text-white"
          >
            Lihat situs pelanggan
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/admin/login");
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold text-brand-200 hover:bg-brand-800 hover:text-white"
          >
            <IconLogout width={16} height={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Topbar seluler */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-brand-800 bg-brand-900 px-5 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8" />
              <span className="font-display text-[16px] font-semibold text-white">
                Panel Admin
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setBukaNav((v) => !v)}
              className="btn h-10 w-10 border-brand-700 bg-brand-800 p-0 text-white hover:bg-brand-700"
              aria-expanded={bukaNav}
              aria-label={bukaNav ? "Tutup navigasi admin" : "Buka navigasi admin"}
            >
              {bukaNav ? <IconClose /> : <IconMenu />}
            </button>
          </div>
          {bukaNav && (
            <div className="mt-3 border-t border-brand-800 pt-3">
              {isiNav}
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/admin/login");
                }}
                className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-200 hover:bg-brand-800"
              >
                <IconLogout width={17} height={17} />
                Keluar
              </button>
            </div>
          )}
        </header>

        <main className="min-w-0 flex-1 px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
          {galat && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-card border border-red-200 bg-red-50 p-4"
            >
              <IconAlert className="mt-0.5 shrink-0 text-red-700" width={18} height={18} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">
                  Gagal menghubungi basis data
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-red-700">{galat}</p>
              </div>
              <button
                type="button"
                onClick={bersihkanGalat}
                className="btn btn-sm border-red-200 bg-white text-red-700 hover:bg-red-50"
              >
                Tutup
              </button>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export function JudulHalaman({
  judul,
  deskripsi,
  aksi,
}: {
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[26px] leading-tight sm:text-[30px]">{judul}</h1>
        {deskripsi && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
            {deskripsi}
          </p>
        )}
      </div>
      {aksi && <div className="shrink-0">{aksi}</div>}
    </div>
  );
}
