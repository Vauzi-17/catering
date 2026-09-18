"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MenuCard } from "@/components/MenuCard";
import {
  IconArrowRight,
  IconCheck,
  IconChevronRight,
  IconMinus,
  IconPlus,
  IconWhatsapp,
} from "@/components/Icons";
import { FotoMenu } from "@/components/Placeholder";
import { profil } from "@/data/profil";
import { rupiah } from "@/lib/format";
import type { Menu } from "@/lib/types";
import { useData } from "@/store/DataProvider";

export function DetailMenu({ menuAwalan }: { menuAwalan: Menu }) {
  const { menus, tambahKeranjang } = useData();
  const router = useRouter();

  const menu = menus.find((m) => m.slug === menuAwalan.slug) ?? menuAwalan;
  const [qty, setQty] = useState(menu.minimalPesan);
  const [pesan, setPesan] = useState("");

  const serupa = menus
    .filter((m) => m.kategori === menu.kategori && m.id !== menu.id)
    .slice(0, 3);

  function ubah(delta: number) {
    setQty((v) => Math.max(menu.minimalPesan, v + delta));
  }

  function tambah() {
    tambahKeranjang(menu.id, qty);
    setPesan(`${qty} ${menu.satuanJual.replace("per ", "")} ditambahkan ke daftar pesanan.`);
    window.setTimeout(() => setPesan(""), 2500);
  }

  function pesanSekarang() {
    tambahKeranjang(menu.id, qty);
    router.push("/pesan");
  }

  return (
    <>
      <div className="border-b border-line bg-white">
        <div className="container-page py-4">
          <nav
            aria-label="Remah roti"
            className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-muted"
          >
            <Link href="/" className="hover:text-brand-700">
              Beranda
            </Link>
            <IconChevronRight width={14} height={14} />
            <Link href="/menu" className="hover:text-brand-700">
              Menu
            </Link>
            <IconChevronRight width={14} height={14} />
            <span className="font-semibold text-ink">{menu.nama}</span>
          </nav>
        </div>
      </div>

      <div className="container-page py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-card border border-line">
              <FotoMenu src={menu.foto} nama={menu.nama} />
            </div>

            <div className="mt-8">
              <h2 className="font-display text-xl">Tentang menu ini</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                {menu.deskripsiPanjang}
              </p>
            </div>

            <div className="mt-8 card p-6">
              <h2 className="font-display text-xl">Isi paket</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {menu.isi.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <IconCheck className="mt-0.5 shrink-0 text-brand-600" width={17} height={17} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="card p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">
                  {menu.kategori}
                </p>
                <h1 className="mt-2 font-display text-[28px] leading-tight sm:text-[32px]">
                  {menu.nama}
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                  {menu.deskripsi}
                </p>

                <div className="mt-6 flex items-end gap-2 border-t border-line pt-6">
                  <span className="font-display text-[32px] leading-none text-brand-800">
                    {rupiah(menu.hargaJual)}
                  </span>
                  <span className="pb-1 text-sm text-ink-muted">{menu.satuanJual}</span>
                </div>

                <dl className="mt-5 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Minimal pemesanan</dt>
                    <dd className="font-semibold">
                      {menu.minimalPesan} {menu.satuanJual.replace("per ", "")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Ketersediaan</dt>
                    <dd className="font-semibold">
                      {menu.tersedia ? "Tersedia" : "Sedang kosong"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Pemesanan terakhir</dt>
                    <dd className="font-semibold">H-1 sebelum acara</dd>
                  </div>
                </dl>

                <div className="mt-6 border-t border-line pt-6">
                  <label className="field-label" htmlFor="jumlah">
                    Jumlah pesanan
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => ubah(-5)}
                      className="btn btn-outline h-11 w-11 p-0"
                      aria-label="Kurangi jumlah"
                    >
                      <IconMinus />
                    </button>
                    <input
                      id="jumlah"
                      type="number"
                      min={menu.minimalPesan}
                      value={qty}
                      onChange={(e) =>
                        setQty(Math.max(menu.minimalPesan, Number(e.target.value) || 0))
                      }
                      className="field h-11 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => ubah(5)}
                      className="btn btn-outline h-11 w-11 p-0"
                      aria-label="Tambah jumlah"
                    >
                      <IconPlus />
                    </button>
                  </div>

                  <p className="mt-3 flex justify-between text-sm">
                    <span className="text-ink-muted">Perkiraan total</span>
                    <span className="font-display text-lg font-semibold text-brand-800">
                      {rupiah(menu.hargaJual * qty)}
                    </span>
                  </p>

                  <div className="mt-5 flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={pesanSekarang}
                      disabled={!menu.tersedia}
                      className="btn btn-primary btn-md w-full"
                    >
                      Pesan menu ini
                      <IconArrowRight width={18} height={18} />
                    </button>
                    <button
                      type="button"
                      onClick={tambah}
                      disabled={!menu.tersedia}
                      className="btn btn-outline btn-md w-full"
                    >
                      Tambah ke daftar pesanan
                    </button>
                  </div>

                  {pesan && (
                    <p
                      role="status"
                      className="mt-3 rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-[13px] text-brand-800"
                    >
                      {pesan}
                    </p>
                  )}

                  <a
                    href={`https://wa.me/${profil.teleponRaw}?text=${encodeURIComponent(
                      `Halo Asri Catering, saya ingin bertanya tentang ${menu.nama}.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 text-[13px] font-semibold text-ink-muted hover:text-brand-700"
                  >
                    <IconWhatsapp width={16} height={16} />
                    Tanya dulu lewat WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {serupa.length > 0 && (
          <section className="mt-16 border-t border-line pt-12">
            <h2 className="font-display text-2xl">Menu lain di kategori {menu.kategori}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {serupa.map((m) => (
                <MenuCard key={m.id} menu={m} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
