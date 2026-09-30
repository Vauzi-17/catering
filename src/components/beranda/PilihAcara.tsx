"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FotoMenu } from "@/components/Placeholder";
import { rupiah } from "@/lib/format";
import { useData } from "@/store/DataProvider";

// Tiap jenis acara diarahkan ke satu paket yang paling cocok.
const acara = [
  { judul: "Rapat & Acara Kantor", slug: "paket-nasi-kotak-acara-kantor" },
  { judul: "Syukuran & Ulang Tahun", slug: "paket-nasi-kuning-bento-royal" },
  { judul: "Jamuan Tamu Penting", slug: "paket-nasi-kotak-rendang-vip" },
  { judul: "Tanpa Daging Merah", slug: "paket-nasi-kotak-nila-bakar" },
];

export function PilihAcara() {
  const { menus } = useData();

  const ubin = acara
    .map((a) => ({ ...a, menu: menus.find((m) => m.slug === a.slug && m.tersedia) }))
    .filter((a) => a.menu);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {ubin.map(({ judul, menu }) => (
        <Link
          key={judul}
          href={`/menu/${menu!.slug}`}
          className="group relative block overflow-hidden rounded-2xl"
        >
          <FotoMenu
            src={menu!.foto}
            nama={menu!.nama}
            rasio="aspect-square"
            mini
            className="transition-transform duration-500 group-hover:scale-105"
          />
          <span
            className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent"
            aria-hidden="true"
          />
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink transition-colors group-hover:bg-jingga-500 group-hover:text-white">
            <ArrowUpRight size={16} />
          </span>
          <span className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-5">
            <span className="block font-display text-[17px] font-semibold leading-tight sm:text-[22px]">
              {judul}
            </span>
            <span className="mt-1 block text-[12px] text-white/80 sm:text-[13px]">
              Mulai {rupiah(menu!.hargaJual)} / box
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
