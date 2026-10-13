"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, CircleCheck, Minus, Plus } from "lucide-react";
import { IconWhatsapp } from "@/components/Icons";
import { MenuCard } from "@/components/MenuCard";
import { FotoMenu } from "@/components/Placeholder";
import { Remah } from "@/components/Ui";
import { profil } from "@/data/profil";
import { rupiah } from "@/lib/format";
import { namaKategori, satuan as satuanB, satuanJual, teksMenu } from "@/lib/teks";
import type { Menu } from "@/lib/types";
import { useBahasa } from "@/store/BahasaProvider";
import { useData } from "@/store/DataProvider";

export function DetailMenu({ menuAwalan }: { menuAwalan: Menu }) {
  const { menus, tambahKeranjang, bukaKeranjang } = useData();
  const router = useRouter();

  const { bahasa, t } = useBahasa();
  const menu = menus.find((m) => m.slug === menuAwalan.slug) ?? menuAwalan;
  const satuan = satuanB(menu, bahasa);
  const teks = teksMenu(menu, bahasa);
  const [qty, setQty] = useState(menu.minimalPesan);
  const [pesan, setPesan] = useState("");

  const serupa = menus
    .filter((m) => m.kategori === menu.kategori && m.id !== menu.id && m.tersedia)
    .slice(0, 4);

  function ubah(delta: number) {
    setQty((v) => Math.max(menu.minimalPesan, v + delta));
  }

  function tambah() {
    tambahKeranjang(menu.id, qty);
    bukaKeranjang();
    setPesan(t(`${qty} ${satuan} masuk ke keranjang.`, `${qty} ${satuan} added to your cart.`));
    window.setTimeout(() => setPesan(""), 2500);
  }

  function pesanSekarang() {
    tambahKeranjang(menu.id, qty);
    router.push("/pesan");
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <Remah
        jejak={[
          { label: t("Beranda", "Home"), href: "/" },
          { label: "Menu", href: "/menu" },
          { label: teks.nama },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="kartu p-3">
            {menu.foto ? (
              <PanggungFoto src={menu.foto} nama={teks.nama} />
            ) : (
              <FotoMenu src={menu.foto} nama={teks.nama} className="rounded-xl" />
            )}
          </div>

          <div className="kartu mt-6 p-6 sm:p-7">
            <h2 className="text-[22px] font-semibold">{t("Isi paket", "What’s included")}</h2>
            <ul className="mt-5 grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
              {teks.isi.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] text-ink-soft">
                  <CircleCheck size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-zamrud-600" />
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-9 border-t border-kabut-line pt-7 text-[22px] font-semibold">
              {t("Tentang menu ini", "About this menu")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              {teks.deskripsiPanjang}
            </p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="kartu p-6 sm:p-7 lg:sticky lg:top-24">
            <p className="text-[13px] font-medium text-jingga-700">{namaKategori(menu.kategori, bahasa)}</p>
            <h1 className="mt-1.5 text-[30px] font-semibold leading-[1.1] sm:text-[36px]">
              {teks.nama}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{teks.deskripsi}</p>

            <p className="mt-6 flex items-baseline gap-2">
              <span className="text-[30px] font-bold tabular-nums tracking-tight text-ink">
                {rupiah(menu.hargaJual)}
              </span>
              <span className="text-sm text-ink-muted">{satuanJual(menu, bahasa)}</span>
            </p>

            <dl className="mt-5 space-y-2.5 border-y border-kabut-line py-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">{t("Minimal pemesanan", "Minimum order")}</dt>
                <dd className="font-semibold">
                  {menu.minimalPesan} {satuan}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">{t("Ketersediaan", "Availability")}</dt>
                <dd className={`font-semibold ${menu.tersedia ? "text-zamrud-700" : "text-red-700"}`}>
                  {menu.tersedia ? t("Tersedia", "Available") : t("Sedang kosong", "Sold out")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">{t("Pesan paling lambat", "Order no later than")}</dt>
                <dd className="font-semibold">{t("H-1 sebelum acara", "1 day before the event")}</dd>
              </div>
            </dl>

            <div className="mt-5">
              <label className="isian-label" htmlFor="jumlah">
                {t("Jumlah", "Number of")} {satuan}
              </label>
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex h-11 items-center rounded-lg border border-kabut-line bg-kabut">
                  <button
                    type="button"
                    onClick={() => ubah(-5)}
                    disabled={qty <= menu.minimalPesan}
                    className="flex h-full w-11 items-center justify-center text-ink-soft hover:text-ink disabled:opacity-40"
                    aria-label={t("Kurangi 5", "Decrease by 5")}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    id="jumlah"
                    type="number"
                    inputMode="numeric"
                    min={menu.minimalPesan}
                    value={qty}
                    onChange={(e) =>
                      setQty(Math.max(menu.minimalPesan, Number(e.target.value) || 0))
                    }
                    className="h-full w-16 border-x border-kabut-line bg-white text-center text-[15px] font-semibold tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => ubah(5)}
                    className="flex h-full w-11 items-center justify-center text-ink-soft hover:text-ink"
                    aria-label={t("Tambah 5", "Increase by 5")}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-ink-muted">{t("Perkiraan total", "Estimated total")}</p>
                  <p className="text-[20px] font-bold tabular-nums text-zamrud-800">
                    {rupiah(menu.hargaJual * qty)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={pesanSekarang}
                disabled={!menu.tersedia}
                className="tombol tombol-blok tombol-jingga"
              >
                {t("Pesan Menu Ini", "Order This Menu")}
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                onClick={tambah}
                disabled={!menu.tersedia}
                className="tombol tombol-blok tombol-garis"
              >
                {t("Tambah ke Keranjang", "Add to Cart")}
              </button>
            </div>

            {pesan && (
              <p
                role="status"
                className="mt-3 flex items-center gap-2 rounded-lg bg-zamrud-50 px-3.5 py-2.5 text-[13px] font-medium text-zamrud-800"
              >
                <Check size={15} />
                {pesan}
              </p>
            )}

            <a
              href={`https://wa.me/${profil.teleponRaw}?text=${encodeURIComponent(
                t(`Halo Asri Catering, saya ingin bertanya tentang ${menu.nama}.`, `Hello Asri Catering, I have a question about ${teks.nama}.`),
              )}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex items-center justify-center gap-2 text-[13px] font-semibold text-ink-muted hover:text-zamrud-700"
            >
              <IconWhatsapp width={16} height={16} />
              {t("Tanya dulu lewat WhatsApp", "Ask us first on WhatsApp")}
            </a>
          </div>
        </div>
      </div>

      {serupa.length > 0 && (
        <section className="mt-16">
          <h2 className="text-[26px] font-semibold sm:text-[30px]">
            {t("Menu lain di", "More in")} {namaKategori(menu.kategori, bahasa)}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {serupa.map((m) => (
              <MenuCard key={m.id} menu={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Foto di tengah dengan latar versi buram dari foto yang sama, supaya foto
 * beresolusi kecil tidak perlu direntangkan memenuhi kotak besar.
 */
function PanggungFoto({ src, nama }: { src: string; nama: string }) {
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-jingga-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-125 object-cover opacity-70 blur-2xl"
      />
      <span className="absolute inset-0 bg-gradient-to-br from-jingga-600/25 to-transparent" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={nama}
        className="relative aspect-square h-[78%] rounded-2xl object-cover shadow-[0_24px_48px_-20px_rgba(60,30,5,0.55)] ring-4 ring-white/80"
      />
    </div>
  );
}
