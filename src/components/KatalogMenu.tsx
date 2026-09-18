"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MenuCard } from "@/components/MenuCard";
import { IconSearch } from "@/components/Icons";
import { Kosong } from "@/components/Ui";
import { kategoriMenu } from "@/data/menu";
import { useData } from "@/store/DataProvider";

const urutan = [
  { nilai: "populer", label: "Paling dipesan" },
  { nilai: "murah", label: "Harga terendah" },
  { nilai: "mahal", label: "Harga tertinggi" },
  { nilai: "nama", label: "Nama A–Z" },
];

export function KatalogMenu() {
  const { menus } = useData();
  const params = useSearchParams();
  const kategoriAwal = params.get("kategori") ?? "Semua";

  const [kategori, setKategori] = useState(kategoriAwal);
  const [cari, setCari] = useState("");
  const [urut, setUrut] = useState("populer");

  const hasil = useMemo(() => {
    const kunci = cari.trim().toLowerCase();
    const daftar = menus.filter((m) => {
      const cocokKategori = kategori === "Semua" || m.kategori === kategori;
      const cocokCari =
        kunci === "" ||
        m.nama.toLowerCase().includes(kunci) ||
        m.deskripsi.toLowerCase().includes(kunci) ||
        m.isi.some((i) => i.toLowerCase().includes(kunci));
      return cocokKategori && cocokCari;
    });

    return [...daftar].sort((a, b) => {
      if (urut === "murah") return a.hargaJual - b.hargaJual;
      if (urut === "mahal") return b.hargaJual - a.hargaJual;
      if (urut === "nama") return a.nama.localeCompare(b.nama);
      return Number(b.populer) - Number(a.populer) || a.hargaJual - b.hargaJual;
    });
  }, [menus, kategori, cari, urut]);

  const daftarKategori = ["Semua", ...kategoriMenu];

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <IconSearch
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
              width={18}
              height={18}
            />
            <input
              type="search"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari menu, misalnya: ayam bakar"
              className="field pl-10"
              aria-label="Cari menu"
            />
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="urutan" className="shrink-0 text-[13px] font-semibold text-ink-muted">
              Urutkan
            </label>
            <select
              id="urutan"
              value={urut}
              onChange={(e) => setUrut(e.target.value)}
              className="field w-full lg:w-52"
            >
              {urutan.map((u) => (
                <option key={u.nilai} value={u.nilai}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
          {daftarKategori.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKategori(k)}
              aria-pressed={kategori === k}
              className={`chip transition-colors ${
                kategori === k
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-line-strong bg-white text-ink-soft hover:border-brand-300 hover:bg-brand-50"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-ink-muted">
        Menampilkan <span className="font-semibold text-ink">{hasil.length}</span> menu
        {kategori !== "Semua" && ` pada kategori ${kategori}`}.
      </p>

      {hasil.length === 0 ? (
        <div className="mt-6">
          <Kosong
            judul="Menu tidak ditemukan"
            deskripsi="Coba kata kunci lain atau pilih kategori Semua untuk melihat seluruh daftar menu."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hasil.map((menu) => (
            <MenuCard key={menu.id} menu={menu} />
          ))}
        </div>
      )}
    </div>
  );
}
