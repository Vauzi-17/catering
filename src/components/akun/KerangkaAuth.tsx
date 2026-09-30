import type { ReactNode } from "react";
import { LogoMark } from "@/components/Logo";
import { fotoDekorasi } from "@/lib/foto";

/** Kartu dua kolom untuk halaman masuk, daftar, dan kata sandi. */
export function KerangkaAuth({
  judul,
  deskripsi,
  children,
}: {
  judul: string;
  deskripsi?: string;
  children: ReactNode;
}) {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-kabut-line bg-white shadow-lembut lg:grid-cols-[1fr_1.1fr]">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-jingga-700 via-jingga-600 to-jingga-400 p-8 text-white lg:flex">
          <div>
            <LogoMark className="h-11 w-11" />
            <p className="mt-6 font-display text-[28px] font-medium leading-tight">
              Pesan katering, bayar online, pantau sampai diantar.
            </p>
          </div>
          <div className="relative mt-10 h-44" aria-hidden="true">
            {fotoDekorasi.slice(0, 3).map((src, i) => (
              <span
                key={src}
                className={`absolute w-28 overflow-hidden rounded-2xl border-4 border-white shadow-xl ${
                  ["left-0 top-6 -rotate-6", "left-[30%] top-0 z-10 rotate-3", "left-[60%] top-8 rotate-[8deg]"][i]
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-square w-full object-cover" />
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <h1 className="text-[30px] font-semibold leading-tight sm:text-[34px]">{judul}</h1>
          {deskripsi && <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{deskripsi}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function PesanForm({ jenis, children }: { jenis: "galat" | "info" | "sukses"; children: ReactNode }) {
  const gaya = {
    galat: "bg-red-50 text-red-700",
    info: "bg-kabut text-ink-soft",
    sukses: "bg-zamrud-50 text-zamrud-800",
  }[jenis];
  return (
    <p role={jenis === "galat" ? "alert" : "status"} className={`rounded-lg px-3.5 py-2.5 text-[13px] font-medium leading-relaxed ${gaya}`}>
      {children}
    </p>
  );
}

/** Pemberitahuan untuk mode contoh tanpa Supabase. */
export function TanpaSupabase() {
  return (
    <PesanForm jenis="info">
      Akun pelanggan dan pembayaran online membutuhkan Supabase. Isi variabel lingkungan
      Supabase lalu jalankan <code>supabase/06-akun-pembayaran.sql</code> (lihat
      docs/SETUP-PEMBAYARAN.md).
    </PesanForm>
  );
}
