"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronRight, Receipt } from "lucide-react";
import { PesanForm, TanpaSupabase } from "@/components/akun/KerangkaAuth";
import { FotoMenu } from "@/components/Placeholder";
import { LencanaBayar, LencanaStatus } from "@/components/pesanan/Lencana";
import { ambilPesananSaya } from "@/lib/db";
import { rupiah, tanggalPanjang } from "@/lib/format";
import type { Pesanan } from "@/lib/types";
import { useWajibMasuk } from "@/lib/useWajibMasuk";
import { useData } from "@/store/DataProvider";

const saringan = [
  { nilai: "semua", label: "Semua" },
  { nilai: "bayar", label: "Belum dibayar" },
  { nilai: "berjalan", label: "Berjalan" },
  { nilai: "selesai", label: "Selesai & batal" },
] as const;

type Saringan = (typeof saringan)[number]["nilai"];

function cocok(p: Pesanan, s: Saringan) {
  if (s === "bayar") return p.status === "Menunggu Pembayaran";
  if (s === "berjalan") return ["Menunggu Konfirmasi", "Dibayar", "Diproses", "Dikirim"].includes(p.status);
  if (s === "selesai") return p.status === "Selesai" || p.status === "Dibatalkan";
  return true;
}

export function DaftarPesananSaya() {
  const auth = useWajibMasuk();
  const { menus } = useData();
  const [daftar, setDaftar] = useState<Pesanan[] | null>(null);
  const [galat, setGalat] = useState("");
  const [pilih, setPilih] = useState<Saringan>("semua");

  useEffect(() => {
    if (!auth.pengguna) return;
    ambilPesananSaya()
      .then(setDaftar)
      .catch(() => setGalat("Daftar pesanan gagal dimuat. Muat ulang halaman."));
  }, [auth.pengguna]);

  const tampil = useMemo(() => (daftar ?? []).filter((p) => cocok(p, pilih)), [daftar, pilih]);

  if (!auth.aktif) {
    return (
      <div className="container-page py-12">
        <TanpaSupabase />
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-12">
      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-1.5 rounded-full border border-kabut-line bg-white p-1">
          {saringan.map((s) => (
            <button
              key={s.nilai}
              type="button"
              onClick={() => setPilih(s.nilai)}
              aria-pressed={pilih === s.nilai}
              className={`h-9 whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors ${
                pilih === s.nilai ? "bg-zamrud-700 text-white" : "text-ink-soft hover:bg-kabut"
              }`}
            >
              {s.label}
              {daftar && (
                <span className={`ml-1.5 text-[11px] ${pilih === s.nilai ? "text-white/70" : "text-ink-muted"}`}>
                  {daftar.filter((p) => cocok(p, s.nilai)).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {galat ? (
          <PesanForm jenis="galat">{galat}</PesanForm>
        ) : daftar === null ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : tampil.length === 0 ? (
          <div className="kartu flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-kabut text-ink-muted">
              <Receipt size={22} strokeWidth={1.8} />
            </span>
            <p className="mt-4 font-semibold">{daftar.length === 0 ? "Belum ada pesanan" : "Tidak ada pesanan di kategori ini"}</p>
            {daftar.length === 0 && (
              <Link href="/menu/" className="tombol tombol-md tombol-jingga mt-5">
                Lihat Menu
              </Link>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {tampil.map((p) => {
              const foto = p.items
                .map((it) => menus.find((m) => m.id === it.menuId)?.foto)
                .filter(Boolean)
                .slice(0, 3) as string[];
              const porsi = p.items.reduce((a, it) => a + it.qty, 0);
              return (
                <li key={p.id}>
                  <Link
                    href={`/pesanan/${p.kode}/`}
                    className="kartu flex items-center gap-4 p-4 transition-colors hover:border-zamrud-200 sm:p-5"
                  >
                    <div className="flex shrink-0 -space-x-4">
                      {(foto.length ? foto : [""]).map((src, i) => (
                        <span key={i} className="w-14 overflow-hidden rounded-xl border-2 border-white sm:w-16">
                          <FotoMenu src={src} nama="" rasio="aspect-square" mini />
                        </span>
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-semibold tracking-wide">{p.kode}</span>
                        <LencanaStatus status={p.status} />
                        {p.status === "Menunggu Pembayaran" && <LencanaBayar status={p.statusBayar} />}
                      </div>
                      <p className="mt-1 truncate text-[13px] text-ink-muted">
                        {p.items.map((it) => it.nama).join(", ")} · {porsi} porsi
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-ink-muted">
                        <CalendarDays size={13} />
                        {tanggalPanjang(p.tanggalAcara)} · {p.waktuAntar.replace(":", ".")}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-[16px] font-bold tabular-nums text-zamrud-800">{rupiah(p.total)}</p>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-ink-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
