"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { FotoMenu } from "@/components/Placeholder";
import { rupiah } from "@/lib/format";
import { satuan, teksMenu } from "@/lib/teks";
import type { Menu } from "@/lib/types";
import { useBahasa } from "@/store/BahasaProvider";

/** Deretan kartu foto kecil yang bisa digeser, untuk menambah paket ke keranjang. */
export function SaranPaket({
  judul,
  daftar,
  onTambah,
}: {
  judul: string;
  daftar: Menu[];
  onTambah: (menu: Menu) => void;
}) {
  const { bahasa, t } = useBahasa();
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-[17px] font-semibold">{judul}</h2>
        <Link href="/menu" className="text-[13px] font-semibold text-zamrud-700 hover:text-zamrud-800">
          {t("Semua menu", "All menu")}
        </Link>
      </div>

      <ul className="-mx-5 mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
        {daftar.map((m) => (
          <li
            key={m.id}
            className="flex w-44 shrink-0 snap-start flex-col rounded-2xl border border-kabut-line bg-white p-2.5"
          >
            <Link href={`/menu/${m.slug}`} tabIndex={-1} aria-hidden="true" className="overflow-hidden rounded-xl">
              <FotoMenu src={m.foto} nama={teksMenu(m, bahasa).nama} rasio="aspect-[4/3]" mini />
            </Link>
            <p className="mt-2.5 line-clamp-2 min-h-[2.5rem] px-0.5 text-[13px] font-semibold leading-snug">
              {teksMenu(m, bahasa).nama}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
              <span className="text-[13px] font-bold tabular-nums">{rupiah(m.hargaJual)}</span>
              <button
                type="button"
                onClick={() => onTambah(m)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-jingga-600 text-white transition-colors hover:bg-jingga-700"
                aria-label={t(
                  `Tambahkan ${m.minimalPesan} ${satuan(m, "id")} ${m.nama}`,
                  `Add ${m.minimalPesan} ${satuan(m, "en")} ${teksMenu(m, "en").nama}`,
                )}
              >
                <Plus size={16} strokeWidth={2.2} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
