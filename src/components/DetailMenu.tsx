"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, CircleCheck, Minus, Plus } from "lucide-react";
import { IconWhatsapp } from "@/components/Icons";
import { MenuCard } from "@/components/MenuCard";
import { FotoMenu } from "@/components/Placeholder";
import { Remah } from "@/components/Ui";
import { profil } from "@/data/profil";
import { rupiah, satuanMenu } from "@/lib/format";
import type { Menu } from "@/lib/types";
import { useData } from "@/store/DataProvider";

export function DetailMenu({ menuAwalan }: { menuAwalan: Menu }) {
  const { menus, tambahKeranjang } = useData();
  const router = useRouter();

  const menu = menus.find((m) => m.slug === menuAwalan.slug) ?? menuAwalan;
  const satuan = satuanMenu(menu);
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
    setPesan(`${qty} ${satuan} masuk ke keranjang.`);
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
          { label: "Beranda", href: "/" },
          { label: "Menu", href: "/menu" },
          { label: menu.nama },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="kartu p-3">
            <FotoMenu src={menu.foto} nama={menu.nama} className="rounded-xl" />
          </div>

          <div className="kartu mt-6 p-6 sm:p-7">
            <h2 className="text-[22px] font-semibold">Isi paket</h2>
            <ul className="mt-5 grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
              {menu.isi.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] text-ink-soft">
                  <CircleCheck size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-zamrud-600" />
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-9 border-t border-kabut-line pt-7 text-[22px] font-semibold">
              Tentang menu ini
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              {menu.deskripsiPanjang}
            </p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="kartu p-6 sm:p-7 lg:sticky lg:top-24">
            <p className="text-[13px] font-medium text-jingga-700">{menu.kategori}</p>
            <h1 className="mt-1.5 text-[30px] font-semibold leading-[1.1] sm:text-[36px]">
              {menu.nama}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{menu.deskripsi}</p>

            <p className="mt-6 flex items-baseline gap-2">
              <span className="text-[30px] font-bold tabular-nums tracking-tight text-ink">
                {rupiah(menu.hargaJual)}
              </span>
              <span className="text-sm text-ink-muted">{menu.satuanJual}</span>
            </p>

            <dl className="mt-5 space-y-2.5 border-y border-kabut-line py-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Minimal pemesanan</dt>
                <dd className="font-semibold">
                  {menu.minimalPesan} {satuan}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Ketersediaan</dt>
                <dd className={`font-semibold ${menu.tersedia ? "text-zamrud-700" : "text-red-700"}`}>
                  {menu.tersedia ? "Tersedia" : "Sedang kosong"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Pesan paling lambat</dt>
                <dd className="font-semibold">H-1 sebelum acara</dd>
              </div>
            </dl>

            <div className="mt-5">
              <label className="isian-label" htmlFor="jumlah">
                Jumlah {satuan}
              </label>
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex h-11 items-center rounded-lg border border-kabut-line bg-kabut">
                  <button
                    type="button"
                    onClick={() => ubah(-5)}
                    disabled={qty <= menu.minimalPesan}
                    className="flex h-full w-11 items-center justify-center text-ink-soft hover:text-ink disabled:opacity-40"
                    aria-label="Kurangi 5"
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
                    aria-label="Tambah 5"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-ink-muted">Perkiraan total</p>
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
                Pesan Menu Ini
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                onClick={tambah}
                disabled={!menu.tersedia}
                className="tombol tombol-blok tombol-garis"
              >
                Tambah ke Keranjang
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
                `Halo Asri Catering, saya ingin bertanya tentang ${menu.nama}.`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex items-center justify-center gap-2 text-[13px] font-semibold text-ink-muted hover:text-zamrud-700"
            >
              <IconWhatsapp width={16} height={16} />
              Tanya dulu lewat WhatsApp
            </a>
          </div>
        </div>
      </div>

      {serupa.length > 0 && (
        <section className="mt-16">
          <h2 className="text-[26px] font-semibold sm:text-[30px]">
            Menu lain di {menu.kategori}
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
