"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { useBahasa } from "@/store/BahasaProvider";

export default function TidakDitemukan() {
  const { t } = useBahasa();
  return (
    <div className="flex min-h-screen items-center justify-center bg-kabut px-5">
      <div className="w-full max-w-lg text-center">
        <LogoMark className="mx-auto h-14 w-14" />
        <p className="mt-6 text-[14px] font-semibold text-jingga-700">{t("Halaman tidak ditemukan", "Page not found")}</p>
        <h1 className="mt-2 text-[34px] font-semibold leading-tight sm:text-[42px]">
          {t("Halaman yang Anda cari tidak ada", "The page you are looking for does not exist")}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
          {t(
            "Tautannya mungkin salah ketik atau menu tersebut sudah tidak tersedia.",
            "The link may be mistyped, or the menu is no longer available.",
          )}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/menu" className="tombol tombol-lg tombol-jingga">
            {t("Lihat Menu", "View Menu")}
            <ArrowRight size={18} />
          </Link>
          <Link href="/" className="tombol tombol-lg tombol-garis">
            {t("Kembali ke Beranda", "Back to Home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
