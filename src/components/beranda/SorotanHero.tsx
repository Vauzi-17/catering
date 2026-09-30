"use client";

import Link from "next/link";
import { Award, ImageIcon } from "lucide-react";
import { pilihMenuLaris } from "@/components/beranda/MenuLaris";
import { rupiah } from "@/lib/format";
import { useData } from "@/store/DataProvider";

/** Kartu kecil di atas foto hero: menu teratas dari daftar paling laris. */
export function KartuFavorit() {
  const { menus } = useData();
  const [favorit] = pilihMenuLaris(menus, 1);
  if (!favorit) return null;

  return (
    <Link
      href={`/menu/${favorit.slug}`}
      className="flex items-center gap-3 rounded-2xl bg-white py-3 pl-3 pr-5 shadow-[0_12px_32px_-16px_rgba(94,49,16,0.45)]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-jingga-50 text-jingga-600">
        <Award size={20} strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold text-jingga-700">Paling Favorit</span>
        <span className="block truncate text-[14px] font-semibold text-ink">{favorit.nama}</span>
        <span className="block text-[12px] tabular-nums text-ink-muted">
          {rupiah(favorit.hargaJual)} {favorit.satuanJual}
        </span>
      </span>
    </Link>
  );
}

/** Tumpukan tiga foto kecil + jumlah menu yang tersedia. */
export function RingkasMenu() {
  const { menus } = useData();
  const tersedia = menus.filter((m) => m.tersedia);

  return (
    <div className="flex items-center gap-4">
      <div className="flex -space-x-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-jingga-100 bg-abu"
          >
            <ImageIcon size={15} className="text-abu-ikon" />
          </span>
        ))}
      </div>
      <div>
        <p className="text-[15px] font-semibold text-white">
          {tersedia.length} pilihan menu
        </p>
        <p className="text-[12px] font-medium text-white/75">
          Nasi kotak, prasmanan, tumpeng &amp; snack box
        </p>
      </div>
    </div>
  );
}
