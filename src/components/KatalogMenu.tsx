"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { MenuCard } from "@/components/MenuCard";
import { kategoriMenu } from "@/data/menu";
import { namaKategori, teksMenu } from "@/lib/teks";
import { useBahasa } from "@/store/BahasaProvider";
import { useData } from "@/store/DataProvider";

const urutan = [
  { nilai: "populer", label: ["Paling dipesan", "Most ordered"] },
  { nilai: "murah", label: ["Harga terendah", "Lowest price"] },
  { nilai: "mahal", label: ["Harga tertinggi", "Highest price"] },
  { nilai: "nama", label: ["Nama A–Z", "Name A–Z"] },
] as const;

export function KatalogMenu() {
  const { menus } = useData();
  const { bahasa, t, p } = useBahasa();
  const params = useSearchParams();
  const kategoriAwal = params.get("kategori") ?? "Semua";

  const [kategori, setKategori] = useState(kategoriAwal);
  const [cari, setCari] = useState("");
  const [urut, setUrut] = useState("populer");

  const hasil = useMemo(() => {
    const kunci = cari.trim().toLowerCase();
    const daftar = menus.filter((m) => {
      const cocokKategori = kategori === "Semua" || m.kategori === kategori;
      const tx = teksMenu(m, bahasa);
      // Cari di kedua bahasa supaya "rendang" atau "chicken" sama-sama ketemu.
      const sumber = [m.nama, m.deskripsi, ...m.isi, tx.nama, tx.deskripsi, ...tx.isi];
      const cocokCari = kunci === "" || sumber.some((x) => x.toLowerCase().includes(kunci));
      return cocokKategori && cocokCari;
    });

    return [...daftar].sort((a, b) => {
      if (urut === "murah") return a.hargaJual - b.hargaJual;
      if (urut === "mahal") return b.hargaJual - a.hargaJual;
      if (urut === "nama") return teksMenu(a, bahasa).nama.localeCompare(teksMenu(b, bahasa).nama);
      // Paling dipesan: populer dulu, lalu yang sudah berfoto, lalu termurah.
      return (
        Number(b.populer) - Number(a.populer) ||
        Number(Boolean(b.foto)) - Number(Boolean(a.foto)) ||
        a.hargaJual - b.hargaJual
      );
    });
  }, [menus, kategori, cari, urut, bahasa]);

  const jumlahPerKategori = useMemo(() => {
    const hitung: Record<string, number> = { Semua: menus.length };
    for (const m of menus) hitung[m.kategori] = (hitung[m.kategori] ?? 0) + 1;
    return hitung;
  }, [menus]);

  // Kategori tanpa menu tidak ditampilkan supaya pelanggan tidak menemui daftar kosong.
  const daftarKategori = ["Semua", ...kategoriMenu.filter((k) => (jumlahPerKategori[k] ?? 0) > 0)];

  return (
    <div className="container-page py-10 sm:py-12">
      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-1.5 rounded-full border border-kabut-line bg-white p-1">
          {daftarKategori.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKategori(k)}
              aria-pressed={kategori === k}
              className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors ${
                kategori === k
                  ? "bg-zamrud-700 text-white"
                  : "text-ink-soft hover:bg-kabut hover:text-ink"
              }`}
            >
              {namaKategori(k, bahasa)}
              <span
                className={`text-[11px] tabular-nums ${
                  kategori === k ? "text-white/70" : "text-ink-muted"
                }`}
              >
                {jumlahPerKategori[k] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-ink-muted" aria-live="polite">
          {hasil.length} menu
          {kategori !== "Semua" && t(` di kategori ${kategori}`, ` in ${namaKategori(kategori, bahasa)}`)}
          {cari.trim() && t(` untuk “${cari.trim()}”`, ` for “${cari.trim()}”`)}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative sm:w-72">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder={t("Cari menu, misalnya rendang", "Search menu, e.g. rendang")}
              className="isian h-11 bg-white pl-10"
              aria-label={t("Cari menu", "Search menu")}
            />
          </div>
          <select
            value={urut}
            onChange={(e) => setUrut(e.target.value)}
            className="isian h-11 bg-white sm:w-48"
            aria-label={t("Urutkan menu", "Sort menu")}
          >
            {urutan.map((u) => (
              <option key={u.nilai} value={u.nilai}>
                {p(u.label)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasil.length === 0 ? (
        <div className="kartu mt-6 flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-kabut text-ink-muted">
            <SearchX size={22} strokeWidth={1.8} />
          </span>
          <h2 className="mt-4 font-sans text-[17px] font-semibold">{t("Menu tidak ditemukan", "No menu found")}</h2>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            {t("Coba kata kunci lain, atau pilih kategori Semua.", "Try another keyword, or choose All.")}
          </p>
          <button
            type="button"
            onClick={() => {
              setCari("");
              setKategori("Semua");
            }}
            className="tombol tombol-md tombol-garis mt-6"
          >
            {t("Tampilkan semua menu", "Show all menu")}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hasil.map((menu) => (
            <MenuCard key={menu.id} menu={menu} />
          ))}
        </div>
      )}
    </div>
  );
}
