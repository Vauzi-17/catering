"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { rupiah, satuanMenu } from "@/lib/format";
import { useData } from "@/store/DataProvider";

const MAKS_PORSI = 1000;

export function HitungCepat() {
  const { menus, tambahKeranjang, bukaKeranjang } = useData();
  const tersedia = useMemo(() => menus.filter((m) => m.tersedia), [menus]);

  const [menuId, setMenuId] = useState("");
  const [qty, setQty] = useState(0);

  const menu = tersedia.find((m) => m.id === menuId) ?? tersedia[0];
  const minimal = menu?.minimalPesan ?? 1;
  const satuan = menu ? satuanMenu(menu) : "porsi";

  // Porsi mengikuti batas minimal paket yang sedang dipilih.
  useEffect(() => {
    if (menu) setQty((q) => Math.max(q, menu.minimalPesan));
  }, [menu]);

  if (!menu) return null;

  const jumlah = Math.min(Math.max(qty, minimal), MAKS_PORSI);
  const subtotal = menu.hargaJual * jumlah;

  function lanjut() {
    tambahKeranjang(menu!.id, jumlah);
    bukaKeranjang();
  }

  return (
    <div
      id="hitung"
      className="scroll-mt-24 rounded-2xl border border-kabut-line bg-white p-5 shadow-lembut sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[24px] font-semibold leading-tight">Estimasi Cepat</h3>
          <p className="mt-1 text-[13px] text-ink-muted">
            Perkiraan biaya sebelum mengisi formulir pesanan.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-zamrud-50 px-3 py-1 text-[12px] font-semibold tabular-nums text-zamrud-700">
          {jumlah} {satuan}
        </span>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="hitung-paket" className="mb-1.5 block text-[13px] font-semibold text-ink-soft">
            Paket
          </label>
          <select
            id="hitung-paket"
            value={menu.id}
            onChange={(e) => setMenuId(e.target.value)}
            className="block h-11 w-full rounded-lg border border-kabut-line bg-kabut px-3 text-sm text-ink focus:border-zamrud-500 focus:outline-none focus:ring-2 focus:ring-zamrud-500/20"
          >
            {tersedia.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="hitung-qty" className="mb-1.5 block text-[13px] font-semibold text-ink-soft">
            Jumlah {satuan}
          </label>
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 items-center rounded-lg border border-kabut-line bg-kabut">
              <button
                type="button"
                onClick={() => setQty(Math.max(minimal, jumlah - 5))}
                disabled={jumlah <= minimal}
                className="flex h-full w-11 items-center justify-center text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
                aria-label="Kurangi 5"
              >
                <Minus size={16} />
              </button>
              <input
                id="hitung-qty"
                type="number"
                inputMode="numeric"
                min={minimal}
                max={MAKS_PORSI}
                value={qty === 0 ? "" : qty}
                onChange={(e) => setQty(Number(e.target.value) || 0)}
                onBlur={() => setQty(jumlah)}
                className="h-full w-16 border-x border-kabut-line bg-white text-center text-[15px] font-semibold tabular-nums text-ink focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setQty(Math.min(MAKS_PORSI, jumlah + 5))}
                className="flex h-full w-11 items-center justify-center text-ink-soft transition-colors hover:text-ink"
                aria-label="Tambah 5"
              >
                <Plus size={16} />
              </button>
            </div>
            <p className="text-[12px] leading-snug text-ink-muted">
              Minimal {minimal} {satuan}
            </p>
          </div>
        </div>
      </div>

      <dl className="mt-6 space-y-2.5 border-t border-kabut-line pt-5 text-[14px]">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Harga {menu.satuanJual}</dt>
          <dd className="tabular-nums text-ink">{rupiah(menu.hargaJual)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">
            Subtotal ({jumlah} {satuan})
          </dt>
          <dd className="font-semibold tabular-nums text-ink">{rupiah(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="inline-flex items-center gap-1.5 text-ink-soft">
            Ongkir
            <Truck size={15} strokeWidth={1.8} className="text-ink-muted" />
          </dt>
          <dd>
            <span className="rounded-md bg-zamrud-50 px-2 py-0.5 text-[12px] font-bold text-zamrud-700">
              GRATIS
            </span>
          </dd>
        </div>
      </dl>

      <div className="mt-5 rounded-xl bg-kabut px-4 py-4">
        <p className="text-[13px] font-medium text-ink-muted">
          Perkiraan total
        </p>
        <p className="mt-1 font-display text-[30px] font-semibold leading-none tabular-nums text-zamrud-800">
          {rupiah(subtotal)}
        </p>
        <p className="mt-2 text-[12px] text-ink-muted">Ongkir gratis dalam area layanan.</p>
      </div>

      <button
        type="button"
        onClick={lanjut}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-jingga-600 text-[15px] font-semibold text-white transition-colors hover:bg-jingga-700"
      >
        Masukkan ke Keranjang
        <ArrowRight size={18} />
      </button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-muted">
        <ShieldCheck size={14} className="shrink-0 text-zamrud-600" />
        Bayar saat checkout dengan QRIS dari aplikasi apa pun
      </p>
    </div>
  );
}
