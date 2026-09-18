"use client";

import Link from "next/link";
import { useState } from "react";
import { IconCheck, IconPlus } from "@/components/Icons";
import { FotoMenu } from "@/components/Placeholder";
import { rupiah } from "@/lib/format";
import type { Menu } from "@/lib/types";
import { useData } from "@/store/DataProvider";

export function MenuCard({ menu }: { menu: Menu }) {
  const { tambahKeranjang } = useData();
  const [ditambahkan, setDitambahkan] = useState(false);

  function tambah() {
    tambahKeranjang(menu.id, menu.minimalPesan);
    setDitambahkan(true);
    window.setTimeout(() => setDitambahkan(false), 1800);
  }

  return (
    <article className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-pop">
      <Link href={`/menu/${menu.slug}`} className="block" tabIndex={-1} aria-hidden="true">
        <div className="relative border-b border-line">
          <FotoMenu src={menu.foto} nama={menu.nama} />
          {menu.populer && (
            <span className="absolute left-3 top-3 chip border-brand-700 bg-brand-700 text-white">
              Paling dipesan
            </span>
          )}
          {!menu.tersedia && (
            <span className="absolute right-3 top-3 chip border-line-strong bg-white text-ink-muted">
              Kosong
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">
          {menu.kategori}
        </p>
        <h3 className="mt-1.5 text-[17px] font-semibold leading-snug">
          <Link href={`/menu/${menu.slug}`} className="hover:text-brand-700">
            {menu.nama}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
          {menu.deskripsi}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className="font-display text-xl font-semibold text-brand-800">
              {rupiah(menu.hargaJual)}
            </p>
            <p className="text-[12px] text-ink-muted">
              {menu.satuanJual} · min. {menu.minimalPesan}
            </p>
          </div>
          <button
            type="button"
            onClick={tambah}
            disabled={!menu.tersedia}
            className={`btn btn-sm ${ditambahkan ? "btn-primary" : "btn-outline"}`}
            aria-label={`Tambahkan ${menu.nama} ke daftar pesanan`}
          >
            {ditambahkan ? (
              <>
                <IconCheck width={15} height={15} /> Ditambah
              </>
            ) : (
              <>
                <IconPlus width={15} height={15} /> Tambah
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
