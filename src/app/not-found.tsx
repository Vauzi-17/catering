import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function TidakDitemukan() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5">
      <div className="w-full max-w-lg text-center">
        <LogoMark className="mx-auto h-12 w-12" />
        <p className="eyebrow mt-6">Halaman 404</p>
        <h1 className="mt-3 font-display text-[32px] leading-tight sm:text-[40px]">
          Halaman yang Anda cari tidak ada
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
          Tautannya mungkin salah ketik atau menu tersebut sudah tidak tersedia.
          Silakan kembali ke beranda atau lihat katalog menu kami.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary btn-md">
            Kembali ke beranda
          </Link>
          <Link href="/menu" className="btn btn-outline btn-md">
            Lihat menu
          </Link>
        </div>
      </div>
    </div>
  );
}
