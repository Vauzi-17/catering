"use client";

import { useMemo, useState } from "react";
import { JudulHalaman } from "@/components/admin/AdminShell";
import { KartuStat } from "@/components/admin/Bagian";
import { DialogKonfirmasi } from "@/components/admin/DialogKonfirmasi";
import { IconClose, IconEdit, IconPlus, IconSearch, IconTrash } from "@/components/Icons";
import { Kosong } from "@/components/Ui";
import { angka, rupiah } from "@/lib/format";
import type { Bahan, KategoriBahan, Satuan } from "@/lib/types";
import { useData } from "@/store/DataProvider";

const daftarSatuan: Satuan[] = ["kg", "liter", "butir", "pcs", "ikat", "pack"];
const daftarKategori: KategoriBahan[] = [
  "Bahan Pokok",
  "Protein",
  "Sayuran",
  "Bumbu",
  "Kemasan",
];

function bahanKosong(): Bahan {
  return {
    id: `bh-${Date.now()}`,
    nama: "",
    satuan: "kg",
    hargaSatuan: 0,
    kategori: "Bahan Pokok",
    stok: 0,
    stokMinimum: 0,
  };
}

export default function HalamanBahanAdmin() {
  const { bahan, menus, simpanBahan, hapusBahan } = useData();

  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState<"Semua" | KategoriBahan>("Semua");
  const [sedangEdit, setSedangEdit] = useState<Bahan | null>(null);
  const [konfirmasiHapus, setKonfirmasiHapus] = useState<Bahan | null>(null);

  const daftar = useMemo(() => {
    const kunci = cari.trim().toLowerCase();
    return bahan
      .filter((b) => kategori === "Semua" || b.kategori === kategori)
      .filter((b) => kunci === "" || b.nama.toLowerCase().includes(kunci));
  }, [bahan, cari, kategori]);

  const nilaiStok = bahan.reduce((a, b) => a + b.stok * b.hargaSatuan, 0);
  const menipis = bahan.filter((b) => b.stok <= b.stokMinimum);

  const dipakaiOleh = (id: string) =>
    menus.filter((m) => m.resep.some((r) => r.bahanId === id)).length;

  return (
    <>
      <JudulHalaman
        judul="Bahan Baku"
        deskripsi="Harga bahan di halaman ini dipakai untuk menghitung HPP semua menu."
        aksi={
          <button
            type="button"
            onClick={() => setSedangEdit(bahanKosong())}
            className="btn btn-primary btn-md"
          >
            <IconPlus width={18} height={18} />
            Tambah bahan
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KartuStat label="Jumlah bahan" nilai={String(bahan.length)} catatan={`${daftarKategori.length} kategori`} />
        <KartuStat label="Nilai stok" nilai={rupiah(nilaiStok, true)} catatan="Perkiraan nilai bahan di gudang" nada="baik" />
        <KartuStat
          label="Stok menipis"
          nilai={String(menipis.length)}
          catatan={menipis.length ? `Segera belanja: ${menipis[0].nama}` : "Semua di atas batas minimum"}
          nada={menipis.length ? "perhatian" : "baik"}
        />
      </div>

      <section className="card mt-6 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <IconSearch
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
              width={18}
              height={18}
            />
            <input
              className="field pl-10"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari nama bahan"
              aria-label="Cari bahan baku"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["Semua", ...daftarKategori] as const).map((k) => (
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
      </section>

      {daftar.length === 0 ? (
        <div className="mt-6">
          <Kosong
            judul="Bahan tidak ditemukan"
            deskripsi="Ubah kata kunci pencarian atau tambahkan bahan baru ke daftar."
          />
        </div>
      ) : (
        <section className="card mt-6 p-4 sm:p-5">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bahan</th>
                  <th>Kategori</th>
                  <th className="text-right">Harga satuan</th>
                  <th className="text-right">Stok</th>
                  <th className="text-right">Nilai stok</th>
                  <th>Dipakai</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {daftar.map((b) => {
                  const kritis = b.stok <= b.stokMinimum;
                  return (
                    <tr key={b.id}>
                      <td>
                        <span className="font-semibold text-ink">{b.nama}</span>
                        <span className="mt-0.5 block text-[12px] text-ink-muted">
                          satuan {b.satuan} · minimum {angka(b.stokMinimum, 1)}
                        </span>
                      </td>
                      <td>{b.kategori}</td>
                      <td className="text-right font-semibold text-ink">
                        {rupiah(b.hargaSatuan)}
                        <span className="text-[12px] font-normal text-ink-muted">/{b.satuan}</span>
                      </td>
                      <td className="text-right">
                        <span className={kritis ? "font-semibold text-clay-600" : ""}>
                          {angka(b.stok, 1)} {b.satuan}
                        </span>
                        {kritis && (
                          <span className="mt-0.5 block text-[11px] font-semibold text-clay-600">
                            perlu dibelanjakan
                          </span>
                        )}
                      </td>
                      <td className="text-right">{rupiah(b.stok * b.hargaSatuan)}</td>
                      <td>{dipakaiOleh(b.id)} menu</td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSedangEdit(b)}
                            className="btn btn-outline btn-sm"
                            aria-label={`Ubah ${b.nama}`}
                          >
                            <IconEdit width={15} height={15} />
                            Ubah
                          </button>
                          <button
                            type="button"
                            onClick={() => setKonfirmasiHapus(b)}
                            className="btn btn-danger btn-sm"
                            aria-label={`Hapus ${b.nama}`}
                          >
                            <IconTrash width={15} height={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {sedangEdit && (
        <FormulirBahan
          awal={sedangEdit}
          tutup={() => setSedangEdit(null)}
          simpan={async (b) => {
            try {
              await simpanBahan(b);
              setSedangEdit(null);
            } catch {
              /* pesan galat sudah ditampilkan panel admin */
            }
          }}
        />
      )}

      {konfirmasiHapus && (
        <DialogKonfirmasi
          judul={`Hapus ${konfirmasiHapus.nama}?`}
          isi={
            dipakaiOleh(konfirmasiHapus.id) > 0
              ? `Bahan ini dipakai pada ${dipakaiOleh(
                  konfirmasiHapus.id,
                )} menu. Menghapusnya membuat HPP menu tersebut berkurang dan perlu diperbarui.`
              : "Bahan ini belum dipakai pada menu mana pun, sehingga aman untuk dihapus."
          }
          batal={() => setKonfirmasiHapus(null)}
          lanjut={async () => {
            try {
              await hapusBahan(konfirmasiHapus.id);
            } finally {
              setKonfirmasiHapus(null);
            }
          }}
        />
      )}
    </>
  );
}

function FormulirBahan({
  awal,
  tutup,
  simpan,
}: {
  awal: Bahan;
  tutup: () => void;
  simpan: (b: Bahan) => Promise<void>;
}) {
  const { sibuk } = useData();
  const [form, setForm] = useState<Bahan>({ ...awal });
  const [galat, setGalat] = useState<Record<string, string>>({});

  function ubah<K extends keyof Bahan>(kunci: K, nilai: Bahan[K]) {
    setForm((f) => ({ ...f, [kunci]: nilai }));
  }

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    const g: Record<string, string> = {};
    if (form.nama.trim().length < 3) g.nama = "Nama bahan minimal 3 huruf.";
    if (form.hargaSatuan <= 0) g.hargaSatuan = "Harga satuan harus lebih besar dari nol.";
    setGalat(g);
    if (Object.keys(g).length > 0) return;
    void simpan({ ...form, nama: form.nama.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Formulir bahan baku"
      onClick={tutup}
    >
      <form
        onSubmit={kirim}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-card border border-line bg-white sm:rounded-card"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <p className="eyebrow">{awal.nama ? "Ubah bahan" : "Bahan baru"}</p>
            <h2 className="mt-1 font-display text-xl">{awal.nama || "Tambah bahan baku"}</h2>
          </div>
          <button
            type="button"
            onClick={tutup}
            className="btn btn-ghost h-9 w-9 p-0"
            aria-label="Tutup formulir"
          >
            <IconClose />
          </button>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="namaBahan">
              Nama bahan *
            </label>
            <input
              id="namaBahan"
              className="field"
              value={form.nama}
              onChange={(e) => ubah("nama", e.target.value)}
            />
            {galat.nama && (
              <p className="mt-1.5 text-[12.5px] font-semibold text-red-700">{galat.nama}</p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="kategoriBahan">
              Kategori
            </label>
            <select
              id="kategoriBahan"
              className="field"
              value={form.kategori}
              onChange={(e) => ubah("kategori", e.target.value as KategoriBahan)}
            >
              {daftarKategori.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="satuanBahan">
              Satuan
            </label>
            <select
              id="satuanBahan"
              className="field"
              value={form.satuan}
              onChange={(e) => ubah("satuan", e.target.value as Satuan)}
            >
              {daftarSatuan.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="hargaBahan">
              Harga per {form.satuan} (Rp) *
            </label>
            <input
              id="hargaBahan"
              type="number"
              min={0}
              step={100}
              className="field"
              value={form.hargaSatuan}
              onChange={(e) => ubah("hargaSatuan", Number(e.target.value) || 0)}
            />
            {galat.hargaSatuan && (
              <p className="mt-1.5 text-[12.5px] font-semibold text-red-700">
                {galat.hargaSatuan}
              </p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="stokBahan">
              Stok saat ini ({form.satuan})
            </label>
            <input
              id="stokBahan"
              type="number"
              min={0}
              step={0.5}
              className="field"
              value={form.stok}
              onChange={(e) => ubah("stok", Number(e.target.value) || 0)}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="stokMin">
              Batas minimum ({form.satuan})
            </label>
            <input
              id="stokMin"
              type="number"
              min={0}
              step={0.5}
              className="field"
              value={form.stokMinimum}
              onChange={(e) => ubah("stokMinimum", Number(e.target.value) || 0)}
            />
          </div>

          <p className="sm:col-span-2 rounded-lg border border-line bg-cream px-4 py-3 text-[13px] leading-relaxed text-ink-muted">
            Bahan ditandai menipis bila stoknya sama dengan atau di bawah batas minimum.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">
          <button type="button" onClick={tutup} className="btn btn-outline btn-md">
            Batal
          </button>
          <button type="submit" className="btn btn-primary btn-md" disabled={sibuk}>
            {sibuk ? "Menyimpan…" : "Simpan bahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
