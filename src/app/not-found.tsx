import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/Logo";

export default function TidakDitemukan() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-kabut px-5">
      <div className="w-full max-w-lg text-center">
        <LogoMark warna="zamrud" className="mx-auto h-12 w-12" />
        <p className="mt-6 text-[14px] font-semibold text-jingga-700">Halaman tidak ditemukan</p>
        <h1 className="mt-2 text-[34px] font-semibold leading-tight sm:text-[42px]">
          Halaman yang Anda cari tidak ada
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
          Tautannya mungkin salah ketik atau menu tersebut sudah tidak tersedia.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/menu" className="tombol tombol-lg tombol-jingga">
            Lihat Menu
            <ArrowRight size={18} />
          </Link>
          <Link href="/" className="tombol tombol-lg tombol-garis">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
