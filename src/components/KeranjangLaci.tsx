"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { FotoMenu } from "@/components/Placeholder";
import { SaranPaket } from "@/components/pesan/SaranPaket";
import { rupiah, satuanMenu } from "@/lib/format";
import type { Menu } from "@/lib/types";
import { useAuth } from "@/store/AuthProvider";
import { useData } from "@/store/DataProvider";

export function KeranjangLaci() {
  const {
    menus,
    keranjang,
    laciKeranjang: buka,
    tutupKeranjang,
    ubahQtyKeranjang,
    hapusKeranjang,
    tambahKeranjang,
  } = useData();
  const auth = useAuth();
  const tombolTutup = useRef<HTMLButtonElement>(null);

  const baris = useMemo(
    () =>
      keranjang
        .map((k) => {
          const menu = menus.find((m) => m.id === k.menuId);
          return menu ? { menu, qty: k.qty } : null;
        })
        .filter((v): v is { menu: Menu; qty: number } => v !== null),
    [keranjang, menus],
  );
  const subtotal = baris.reduce((a, b) => a + b.menu.hargaJual * b.qty, 0);
  const porsi = baris.reduce((a, b) => a + b.qty, 0);
  const kurang = baris.find((b) => b.qty < b.menu.minimalPesan);

  const saran = menus
    .filter((m) => m.tersedia && !keranjang.some((k) => k.menuId === m.id))
    .sort((a, b) => Number(b.populer) - Number(a.populer) || Number(!!b.foto) - Number(!!a.foto))
    .slice(0, 6);

  useEffect(() => {
    if (!buka) return;
    const lama = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    tombolTutup.current?.focus();
    const tekan = (e: KeyboardEvent) => {
      if (e.key === "Escape") tutupKeranjang();
    };
    window.addEventListener("keydown", tekan);
    return () => {
      document.body.style.overflow = lama;
      window.removeEventListener("keydown", tekan);
    };
  }, [buka, tutupKeranjang]);

  const tujuanCheckout = auth.aktif && !auth.pengguna ? `/masuk/?lanjut=${encodeURIComponent("/pesan/")}` : "/pesan/";

  // inert saat tertutup: isi laci tidak bisa dijangkau Tab atau pembaca layar.
  return (
    <div className={`fixed inset-0 z-50 ${buka ? "" : "pointer-events-none"}`} inert={!buka}>
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${buka ? "opacity-100" : "opacity-0"}`}
        onClick={tutupKeranjang}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-kabut shadow-2xl transition-transform duration-300 ease-out ${
          buka ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-kabut-line bg-white px-5 py-4">
          <div>
            <h2 className="text-[22px] font-semibold leading-none">Keranjang</h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              {baris.length ? `${baris.length} paket · ${porsi} porsi` : "Belum ada paket"}
            </p>
          </div>
          <button
            ref={tombolTutup}
            type="button"
            onClick={tutupKeranjang}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-kabut-deep"
            aria-label="Tutup keranjang"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {baris.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink-muted">
                <ShoppingBag size={24} strokeWidth={1.8} />
              </span>
              <p className="mt-4 font-semibold">Keranjang masih kosong</p>
              <p className="mt-1 text-[13px] text-ink-muted">Tambahkan paket dari menu, atau mulai dari pilihan di bawah.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {baris.map(({ menu, qty }) => (
                <li key={menu.id} className="flex gap-3 rounded-2xl bg-white p-3">
                  <div className="w-20 shrink-0 overflow-hidden rounded-xl">
                    <FotoMenu src={menu.foto} nama={menu.nama} rasio="aspect-square" mini />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-[14px] font-semibold leading-snug">{menu.nama}</p>
                      <button
                        type="button"
                        onClick={() => hapusKeranjang(menu.id)}
                        className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-red-50 hover:text-red-700"
                        aria-label={`Hapus ${menu.nama}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="text-[12px] text-ink-muted">
                      {rupiah(menu.hargaJual)} / {satuanMenu(menu)}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="inline-flex h-8 items-center rounded-lg border border-kabut-line bg-kabut">
                        <button type="button" onClick={() => ubahQtyKeranjang(menu.id, qty - 5)} className="flex h-full w-8 items-center justify-center text-ink-soft" aria-label={`Kurangi ${menu.nama}`}>
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={qty}
                          min={0}
                          onChange={(e) => ubahQtyKeranjang(menu.id, Number(e.target.value) || 0)}
                          className="h-full w-11 border-x border-kabut-line bg-white text-center text-[13px] font-semibold tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label={`Jumlah ${menu.nama}`}
                        />
                        <button type="button" onClick={() => ubahQtyKeranjang(menu.id, qty + 5)} className="flex h-full w-8 items-center justify-center text-ink-soft" aria-label={`Tambah ${menu.nama}`}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-[14px] font-bold tabular-nums text-zamrud-800">{rupiah(menu.hargaJual * qty)}</p>
                    </div>
                    {qty < menu.minimalPesan && (
                      <p className="mt-1 text-[12px] font-semibold text-red-700">
                        Minimal {menu.minimalPesan} {satuanMenu(menu)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {saran.length > 0 && (
            <div className="mt-2">
              <SaranPaket
                judul={baris.length ? "Tambah paket lain" : "Paket favorit"}
                daftar={saran}
                onTambah={(m) => tambahKeranjang(m.id, m.minimalPesan)}
              />
            </div>
          )}
        </div>

        {baris.length > 0 && (
          <footer className="border-t border-kabut-line bg-white px-5 py-4">
            <dl className="space-y-1.5 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="font-semibold tabular-nums">{rupiah(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="inline-flex items-center gap-1.5 text-ink-soft">
                  Ongkir <Truck size={14} className="text-ink-muted" />
                </dt>
                <dd>
                  <span className="rounded-md bg-zamrud-50 px-2 py-0.5 text-[12px] font-bold text-zamrud-700">GRATIS</span>
                </dd>
              </div>
            </dl>
            {kurang ? (
              <p className="mt-3 text-[13px] font-semibold text-red-700">
                {kurang.menu.nama} minimal {kurang.menu.minimalPesan} {satuanMenu(kurang.menu)}.
              </p>
            ) : null}
            <Link
              href={tujuanCheckout}
              onClick={(e) => {
                if (kurang) e.preventDefault();
                else tutupKeranjang();
              }}
              aria-disabled={Boolean(kurang)}
              className={`tombol tombol-blok tombol-jingga mt-4 ${kurang ? "pointer-events-none opacity-50" : ""}`}
            >
              {auth.aktif && !auth.pengguna ? "Masuk untuk checkout" : "Lanjut ke checkout"}
              <ArrowRight size={18} />
            </Link>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-ink-muted">
              <ShieldCheck size={14} className="text-zamrud-600" />
              Pembayaran online aman lewat Midtrans
            </p>
          </footer>
        )}
      </aside>
    </div>
  );
}
