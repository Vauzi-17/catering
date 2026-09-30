"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Flame, Plus } from "lucide-react";
import { FotoMenu } from "@/components/Placeholder";
import { rupiah, satuanMenu } from "@/lib/format";
import type { Menu } from "@/lib/types";
import { useData } from "@/store/DataProvider";

export function MenuCard({ menu }: { menu: Menu }) {
  const { tambahKeranjang } = useData();
  const [ditambahkan, setDitambahkan] = useState(false);
  const satuan = satuanMenu(menu);

  function tambah() {
    tambahKeranjang(menu.id, menu.minimalPesan);
    setDitambahkan(true);
    window.setTimeout(() => setDitambahkan(false), 1800);
  }

  return (
    <article className="flex flex-col rounded-2xl border border-kabut-line bg-white p-3 shadow-lembut transition-colors hover:border-jingga-200">
      <Link
        href={`/menu/${menu.slug}`}
        className="relative block overflow-hidden rounded-xl"
        tabIndex={-1}
        aria-hidden="true"
      >
        <FotoMenu src={menu.foto} nama={menu.nama} rasio="aspect-[4/3]" className="rounded-xl" />
        {menu.populer && menu.tersedia && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-jingga-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            <Flame size={12} strokeWidth={2.2} />
            Favorit
          </span>
        )}
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-soft shadow-sm">
          {menu.tersedia ? `Min. ${menu.minimalPesan} ${satuan}` : "Sedang kosong"}
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-4">
        <p className="text-[12px] font-medium text-jingga-700">{menu.kategori}</p>
        <h3 className="mt-1 text-[19px] font-semibold leading-snug">
          <Link href={`/menu/${menu.slug}`} className="hover:text-jingga-700">
            {menu.nama}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
          {menu.deskripsi}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-[11px] font-medium text-ink-muted">Mulai dari</p>
            <p className="text-[19px] font-bold tabular-nums tracking-tight text-ink">
              {rupiah(menu.hargaJual)}
            </p>
          </div>
          <button
            type="button"
            onClick={tambah}
            disabled={!menu.tersedia}
            className={`tombol tombol-sm shrink-0 gap-1.5 ${
              ditambahkan ? "tombol-zamrud" : "tombol-jingga"
            }`}
            aria-label={`Tambahkan ${menu.minimalPesan} ${satuan} ${menu.nama} ke keranjang`}
          >
            {ditambahkan ? (
              <>
                <Check size={15} strokeWidth={2.2} /> Ditambah
              </>
            ) : (
              <>
                <Plus size={15} strokeWidth={2.2} /> Tambah
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
