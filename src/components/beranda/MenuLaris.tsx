"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { FotoMenu } from "@/components/Placeholder";
import { rupiah } from "@/lib/format";
import type { Menu } from "@/lib/types";
import { useData } from "@/store/DataProvider";

/** Menu bertanda populer, ditambah menu lain bila jumlahnya kurang. */
export function pilihMenuLaris(menus: Menu[], jumlah: number) {
  const populer = menus.filter((m) => m.populer && m.tersedia);
  const cadangan = menus.filter((m) => !m.populer && m.tersedia);
  return [...populer, ...cadangan].slice(0, jumlah);
}

function satuan(menu: Menu) {
  return menu.satuanJual.replace(/^per\s+/i, "");
}

function KartuMenuLaris({ menu }: { menu: Menu }) {
  const { tambahKeranjang } = useData();
  const [ditambahkan, setDitambahkan] = useState(false);

  function tambah() {
    tambahKeranjang(menu.id, menu.minimalPesan);
    setDitambahkan(true);
    window.setTimeout(() => setDitambahkan(false), 1800);
  }

  return (
    <article className="group flex flex-col rounded-2xl border border-kabut-line bg-white p-3 shadow-lembut transition-colors hover:border-jingga-200">
      <Link
        href={`/menu/${menu.slug}`}
        className="relative block overflow-hidden rounded-xl"
        tabIndex={-1}
        aria-hidden="true"
      >
        <FotoMenu src={menu.foto} nama={menu.nama} rasio="aspect-square" className="rounded-xl" />
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-soft shadow-sm">
          Min. {menu.minimalPesan} {satuan(menu)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-4">
        <h3 className="text-[19px] font-semibold leading-snug">
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
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold text-white transition-colors ${
              ditambahkan ? "bg-zamrud-700" : "bg-jingga-600 hover:bg-jingga-700"
            }`}
            aria-label={`Tambahkan ${menu.minimalPesan} ${satuan(menu)} ${menu.nama} ke keranjang`}
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

export function MenuLaris({ jumlah = 4 }: { jumlah?: number }) {
  const { menus } = useData();
  const tampil = pilihMenuLaris(menus, jumlah);

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {tampil.map((menu) => (
        <KartuMenuLaris key={menu.id} menu={menu} />
      ))}
    </div>
  );
}
