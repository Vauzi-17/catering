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
      className="group flex items-center gap-3 rounded-2xl bg-white py-2.5 pl-2.5 pr-5 shadow-[0_18px_40px_-16px_rgba(94,49,16,0.6)] transition-transform duration-300 hover:-translate-y-1"
    >
      <span className="w-14 shrink-0 overflow-hidden rounded-xl">
        <FotoMenu src={favorit.foto} nama={teksMenu(favorit, bahasa).nama} rasio="aspect-square" mini />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-jingga-700">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jingga-400 opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-jingga-500" />
          </span>
          {t("Rekomendasi Kami", "Our Pick")}
        </span>
        <span className="block text-[14px] font-semibold leading-snug text-ink group-hover:text-zamrud-700 sm:truncate sm:text-[15px]">{teksMenu(favorit, bahasa).nama}</span>
        <span className="block text-[12px] tabular-nums text-ink-muted">
          {rupiah(favorit.hargaJual)} {satuanJual(favorit, bahasa)}
        </span>
      </span>
    </Link>
  );
}

/** Harga nasi box termurah yang sedang tersedia, 0 bila tidak ada. */
function hargaMulai(menus: ReturnType<typeof useData>["menus"]) {
  const nasiBox = menus.filter((m) => m.tersedia && m.kategori === "Nasi Box");
  return nasiBox.length ? Math.min(...nasiBox.map((m) => m.hargaJual)) : 0;
}

/** Stiker bulat "Mulai Rp26rb per box" yang menempel di foto hero. */
export function StikerHarga() {
  const { menus } = useData();
  const { t } = useBahasa();
  const mulai = hargaMulai(menus);
  if (!mulai) return null;
  const ringkas = mulai >= 1000 ? `${Math.round(mulai / 1000)}${t("rb", "k")}` : String(mulai);
  return (
    <span className="hero-goyang flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full bg-zamrud-700 text-center text-white shadow-[0_14px_30px_-12px_rgba(8,59,42,0.8)] ring-4 ring-white/90 sm:h-[112px] sm:w-[112px]">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-jingga-200">{t("Mulai", "From")}</span>
      <span className="font-display text-[20px] font-semibold leading-none sm:text-[24px]">Rp{ringkas}</span>
      <span className="mt-0.5 text-[10px] font-medium text-white/80">per box</span>
    </span>
  );
}

/** Tumpukan foto menu, jumlah menu, dan harga mulai nasi box. */
export function RingkasMenu() {
  const { menus } = useData();
  const { t } = useBahasa();
  const tersedia = menus.filter((m) => m.tersedia);
  const berfoto = tersedia.filter((m) => m.foto).slice(0, 3);
  const mulai = hargaMulai(menus);

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
