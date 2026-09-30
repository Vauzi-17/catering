import type { ReactNode } from "react";
import { Truck } from "lucide-react";
import { FotoMenu } from "@/components/Placeholder";
import { rupiah, satuanMenu } from "@/lib/format";
import type { Menu } from "@/lib/types";

export interface BarisKeranjang {
  menu: Menu;
  qty: number;
}

// Ketentuan FAQ: antar gratis dalam Kota Bandung untuk minimal 25 porsi.
export const MIN_GRATIS_ANTAR = 25;

export function RingkasanPesanan({
  baris,
  diantar,
  tampilkanItem = false,
  children,
}: {
  baris: BarisKeranjang[];
  /** false bila pelanggan mengambil sendiri di dapur. */
  diantar: boolean;
  /** Tampilkan daftar paket dengan foto kecil (dipakai di langkah data acara). */
  tampilkanItem?: boolean;
  /** Tombol aksi dan catatan di bawah total. */
  children?: ReactNode;
}) {
  const subtotal = baris.reduce((a, b) => a + b.menu.hargaJual * b.qty, 0);
  const totalPorsi = baris.reduce((a, b) => a + b.qty, 0);
  const gratisAntar = totalPorsi >= MIN_GRATIS_ANTAR;

  return (
    <div className="kartu p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[22px] font-semibold">Ringkasan Pesanan</h2>
        <span className="rounded-full bg-zamrud-50 px-3 py-1 text-[12px] font-semibold tabular-nums text-zamrud-700">
          {totalPorsi} porsi
        </span>
      </div>

      {tampilkanItem && baris.length > 0 && (
        <ul className="mt-5 divide-y divide-kabut-line border-b border-kabut-line">
          {baris.map(({ menu, qty }) => (
            <li key={menu.id} className="flex items-center gap-3 py-3 first:pt-0">
              <div className="w-14 shrink-0 overflow-hidden rounded-lg">
                <FotoMenu src={menu.foto} nama={menu.nama} rasio="aspect-square" mini />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold">{menu.nama}</p>
                <p className="text-[12px] text-ink-muted">
                  {qty} {satuanMenu(menu)} × {rupiah(menu.hargaJual)}
                </p>
              </div>
              <p className="shrink-0 text-[14px] font-semibold tabular-nums">
                {rupiah(menu.hargaJual * qty)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-5 space-y-2.5 text-[14px]">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Jumlah paket</dt>
          <dd className="tabular-nums">{baris.length}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Subtotal menu</dt>
          <dd className="font-semibold tabular-nums">{rupiah(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="inline-flex items-center gap-1.5 text-ink-soft">
            {diantar ? "Antar dalam kota" : "Ambil di dapur"}
            {diantar && <Truck size={15} strokeWidth={1.8} className="text-ink-muted" />}
          </dt>
          <dd>
            {!diantar ? (
              <span className="text-[13px] text-ink-muted">Tanpa ongkos</span>
            ) : gratisAntar ? (
              <span className="rounded-md bg-zamrud-50 px-2 py-0.5 text-[12px] font-bold text-zamrud-700">
                GRATIS
              </span>
            ) : (
              <span className="text-[13px] text-ink-muted">Sesuai jarak</span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-5 rounded-xl bg-kabut px-4 py-4">
        <p className="text-[13px] font-medium text-ink-muted">Total perkiraan</p>
        <p className="mt-1 font-display text-[32px] font-semibold leading-none tabular-nums text-zamrud-800">
          {rupiah(subtotal)}
        </p>
        {diantar && !gratisAntar && totalPorsi > 0 && (
          <p className="mt-2 text-[12px] text-ink-muted">
            Tambah {MIN_GRATIS_ANTAR - totalPorsi} porsi lagi untuk antar gratis.
          </p>
        )}
      </div>

      {children}
    </div>
  );
}
