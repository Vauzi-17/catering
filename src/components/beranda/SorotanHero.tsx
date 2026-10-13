"use client";

import Link from "next/link";
import { pilihMenuLaris } from "@/components/beranda/MenuLaris";
import { FotoMenu } from "@/components/Placeholder";
import { rupiah } from "@/lib/format";
import { satuanJual, teksMenu } from "@/lib/teks";
import { useBahasa } from "@/store/BahasaProvider";
import { useData } from "@/store/DataProvider";

/** Kartu kecil di atas foto hero: menu teratas dari daftar paling laris. */
export function KartuFavorit() {
  const { menus } = useData();
  const { bahasa, t } = useBahasa();
  const [favorit] = pilihMenuLaris(menus, 1);
  if (!favorit) return null;

  return (
    <Link
      href={`/menu/${favorit.slug}`}
      className="flex items-center gap-3 rounded-2xl bg-white py-2.5 pl-2.5 pr-5 shadow-[0_12px_32px_-16px_rgba(94,49,16,0.45)]"
    >
      <span className="w-12 shrink-0 overflow-hidden rounded-xl">
        <FotoMenu src={favorit.foto} nama={teksMenu(favorit, bahasa).nama} rasio="aspect-square" mini />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold text-jingga-700">{t("Paling Favorit", "Customer Favourite")}</span>
        <span className="block truncate text-[14px] font-semibold text-ink">{teksMenu(favorit, bahasa).nama}</span>
        <span className="block text-[12px] tabular-nums text-ink-muted">
          {rupiah(favorit.hargaJual)} {satuanJual(favorit, bahasa)}
        </span>
      </span>
    </Link>
  );
}

/** Tumpukan foto menu, jumlah menu, dan harga mulai nasi box. */
export function RingkasMenu() {
  const { menus } = useData();
  const { t } = useBahasa();
  const tersedia = menus.filter((m) => m.tersedia);
  const berfoto = tersedia.filter((m) => m.foto).slice(0, 3);
  const nasiBox = tersedia.filter((m) => m.kategori === "Nasi Box");
  const mulai = nasiBox.length ? Math.min(...nasiBox.map((m) => m.hargaJual)) : 0;

  return (
    <div className="flex items-center gap-4">
      {berfoto.length > 0 && (
        <div className="flex -space-x-3" aria-hidden="true">
          {berfoto.map((m) => (
            <span
              key={m.id}
              className="h-12 w-12 overflow-hidden rounded-full border-2 border-white/90"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.foto} alt="" className="h-full w-full object-cover" />
            </span>
          ))}
        </div>
      )}
      <div>
        <p className="text-[15px] font-semibold text-white">{tersedia.length} {t("pilihan menu", "menu choices")}</p>
        {mulai > 0 && (
          <p className="text-[13px] font-medium text-white/80">{t("Nasi box mulai", "Rice boxes from")} {rupiah(mulai)}</p>
        )}
      </div>
    </div>
  );
}
