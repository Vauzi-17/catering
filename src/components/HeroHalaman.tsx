"use client";

import type { ReactNode } from "react";
import { Remah } from "@/components/Ui";
import { useBahasa, type Teks } from "@/store/BahasaProvider";

// Posisi dan kemiringan tiap foto kolase, dari kiri ke kanan.
const posisiFoto = [
  "left-0 top-8 -rotate-6",
  "left-[30%] top-0 z-10 rotate-3",
  "left-[60%] top-10 rotate-[8deg]",
];

/**
 * Kepala halaman publik: pita oranye melengkung seperti hero beranda,
 * dengan kolase foto miring di sisi kanan pada layar lebar.
 */
export function HeroHalaman({
  judul,
  deskripsi,
  remah,
  foto = [],
  children,
}: {
  judul: Teks;
  deskripsi?: Teks;
  remah: { label: Teks; href?: string }[];
  /** Sampai tiga alamat foto; yang kosong dilewati. */
  foto?: string[];
  children?: ReactNode;
}) {
  const { p } = useBahasa();
  const kolase = foto.filter(Boolean).slice(0, 3);

  return (
    <section className="relative overflow-hidden rounded-b-[50%_28px] bg-gradient-to-br from-jingga-700 via-jingga-600 to-jingga-400 text-white sm:rounded-b-[50%_48px]">
      <div className="container-page grid items-center gap-8 pb-14 pt-8 sm:pb-16 sm:pt-10 lg:grid-cols-[1fr_380px]">
        <div>
          <Remah jejak={remah.map((r) => ({ label: p(r.label), href: r.href }))} terang />
          <h1 className="mt-4 text-[38px] font-medium leading-[1.05] sm:text-[52px]">{p(judul)}</h1>
          {deskripsi && (
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/85 sm:text-[16px]">
              {p(deskripsi)}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>

        {kolase.length > 0 && (
          <div className="relative hidden h-52 lg:block" aria-hidden="true">
            {kolase.map((src, i) => (
              <span
                key={src}
                className={`absolute w-36 overflow-hidden rounded-2xl border-4 border-white shadow-xl ${posisiFoto[i]}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-square w-full object-cover" />
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
