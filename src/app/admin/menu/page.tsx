"use client";

import { useMemo, useState } from "react";
import { JudulHalaman } from "@/components/admin/AdminShell";
import { KartuStat } from "@/components/admin/Bagian";
import { DialogKonfirmasi } from "@/components/admin/DialogKonfirmasi";
import { IsianFoto } from "@/components/admin/IsianFoto";
import { FotoMenu } from "@/components/Placeholder";
import {
  IconClose,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@/components/Icons";
import { Kosong } from "@/components/Ui";
import { kategoriMenu } from "@/data/menu";
import { hitungHpp } from "@/lib/analisis";
import { persen, rupiah, slugify } from "@/lib/format";
import type { KategoriMenu, Menu } from "@/lib/types";
import { useData } from "@/store/DataProvider";

function menuKosong(): Menu {
  return {
    id: `mn-${Date.now()}`,
    slug: "",
    nama: "",
    kategori: "Nasi Box",
    deskripsi: "",
    deskripsiPanjang: "",
    hargaJual: 0,
    satuanJual: "per box",
    foto: "",
    isi: [],
    populer: false,
    tersedia: true,
    minimalPesan: 10,
    biayaKemasan: 0,
    biayaTenagaKerja: 0,
    resep: [],
  };
}

export default function HalamanMenuAdmin() {
  const { menus, bahan, simpanMenu, hapusMenu, pengaturan } = useData();

  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState<"Semua" | KategoriMenu>("Semua");
  const [sedangEdit, setSedangEdit] = useState<Menu | null>(null);
  const [konfirmasiHapus, setKonfirmasiHapus] = useState<Menu | null>(null);

  const daftar = useMemo(() => {
    const kunci = cari.trim().toLowerCase();
    return menus
      .filter((m) => kategori === "Semua" || m.kategori === kategori)
      .filter((m) => kunci === "" || m.nama.toLowerCase().includes(kunci))
      .map((m) => ({ menu: m, hpp: hitungHpp(m, bahan, pengaturan.overheadPersen) }));
  }, [menus, bahan, cari, kategori, pengaturan.overheadPersen]);

  const marginRata =
    daftar.length > 0
      ? daftar.reduce((a, d) => a + d.hpp.marginPersen, 0) / daftar.length
      : 0;
  const bermasalah = daftar.filter((d) => d.hpp.marginPersen < 20).length;

  return (
    <>
      <JudulHalaman
        judul="Menu"
        deskripsi="Kelola daftar menu beserta resep dan biaya produksinya."
        aksi={
          <button
            type="button"
            onClick={() => setSedangEdit(menuKosong())}
            className="btn btn-primary btn-md"
          >
            <IconPlus width={18} height={18} />
            Tambah menu
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KartuStat label="Jumlah menu" nilai={String(menus.length)} catatan={`${kategoriMenu.length} kategori`} />
        <KartuStat
          label="Margin rata-rata"
          nilai={persen(marginRata)}
          catatan={`Target usaha ${persen(pengaturan.targetMargin, 0)}`}
          nada={marginRata >= pengaturan.targetMargin ? "baik" : "perhatian"}
        />
        <KartuStat
          label="Menu bermargin tipis"
          nilai={String(bermasalah)}
          catatan="Margin di bawah 20 persen"
          nada={bermasalah > 0 ? "perhatian" : "baik"}
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
              placeholder="Cari nama menu"
              aria-label="Cari menu"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["Semua", ...kategoriMenu] as const).map((k) => (
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
            judul="Menu tidak ditemukan"
            deskripsi="Ubah kata kunci pencarian atau tambahkan menu baru."
            aksi={
              <button
                type="button"
                onClick={() => setSedangEdit(menuKosong())}
                className="btn btn-primary btn-md"
              >
                Tambah menu
              </button>
            }
          />
        </div>
      ) : (
        <section className="card mt-6 p-4 sm:p-5">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Menu</th>
                  <th>Kategori</th>
                  <th className="text-right">Harga jual</th>
                  <th className="text-right">HPP</th>
                  <th className="text-right">Margin</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {daftar.map(({ menu, hpp }) => (
                  <tr key={menu.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 shrink-0 overflow-hidden rounded-lg border border-line">
                          <FotoMenu
                            src={menu.foto}
                            nama={menu.nama}
                            rasio="aspect-square"
                            mini
                          />
                        </div>
                        <div>
                          <span className="font-semibold text-ink">{menu.nama}</span>
                          <span className="mt-0.5 block text-[12px] text-ink-muted">
                            {menu.resep.length} bahan · min. {menu.minimalPesan}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{menu.kategori}</td>
                    <td className="text-right font-semibold text-ink">
                      {rupiah(menu.hargaJual)}
                    </td>
                    <td className="text-right">{rupiah(hpp.hpp)}</td>
                    <td className="text-right">
                      <span
                        className={`font-semibold ${
                          hpp.marginPersen < 20 ? "text-clay-600" : "text-brand-700"
                        }`}
                      >
                        {persen(hpp.marginPersen)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`chip ${
                          menu.tersedia
                            ? "border-brand-200 bg-brand-50 text-brand-800"
                            : "border-line-strong bg-white text-ink-muted"
                        }`}
                      >
                        {menu.tersedia ? "Tersedia" : "Kosong"}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSedangEdit(menu)}
                          className="btn btn-outline btn-sm"
                          aria-label={`Ubah ${menu.nama}`}
                        >
                          <IconEdit width={15} height={15} />
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => setKonfirmasiHapus(menu)}
                          className="btn btn-danger btn-sm"
                          aria-label={`Hapus ${menu.nama}`}
                        >
                          <IconTrash width={15} height={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {sedangEdit && (
        <FormulirMenu
          awal={sedangEdit}
          tutup={() => setSedangEdit(null)}
          simpan={async (m) => {
            try {
              await simpanMenu(m);
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
          isi="Menu akan hilang dari katalog pelanggan dan tidak dapat dipilih pada pesanan baru. Pesanan lama tetap tersimpan."
          batal={() => setKonfirmasiHapus(null)}
          lanjut={async () => {
            try {
              await hapusMenu(konfirmasiHapus.id);
            } finally {
              setKonfirmasiHapus(null);
            }
          }}
        />
      )}
    </>
  );
}

function FormulirMenu({
  awal,
  tutup,
  simpan,
}: {
  awal: Menu;
  tutup: () => void;
  simpan: (m: Menu) => Promise<void>;
}) {
  const { bahan, pengaturan, sibuk } = useData();
  const [form, setForm] = useState<Menu>({ ...awal });
  const [isiTeks, setIsiTeks] = useState(awal.isi.join("\n"));
  const [isiEnTeks, setIsiEnTeks] = useState((awal.isiEn ?? []).join("\n"));
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [unggahFoto, setUnggahFoto] = useState(false);

  const pratinjau = hitungHpp(
    { ...form, isi: isiTeks.split("\n").filter(Boolean) },
    bahan,
    pengaturan.overheadPersen,
  );

  function ubah<K extends keyof Menu>(kunci: K, nilai: Menu[K]) {
    setForm((f) => ({ ...f, [kunci]: nilai }));
  }

  function ubahResep(indeks: number, bahanId: string, jumlah: number) {
    setForm((f) => ({
      ...f,
      resep: f.resep.map((r, i) => (i === indeks ? { bahanId, jumlah } : r)),
    }));
  }

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    const g: Record<string, string> = {};
    if (form.nama.trim().length < 3) g.nama = "Nama menu minimal 3 huruf.";
    if (form.hargaJual <= 0) g.hargaJual = "Harga jual harus lebih besar dari nol.";
    if (form.minimalPesan < 1) g.minimalPesan = "Minimal pemesanan sekurangnya 1.";
    if (form.deskripsi.trim().length < 10) g.deskripsi = "Deskripsi singkat terlalu pendek.";
    setGalat(g);
    if (Object.keys(g).length > 0) return;

    void simpan({
      ...form,
      nama: form.nama.trim(),
      slug: form.slug || slugify(form.nama),
      isi: isiTeks
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      deskripsiPanjang: form.deskripsiPanjang.trim() || form.deskripsi.trim(),
      isiEn: isiEnTeks
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      resep: form.resep.filter((r) => r.bahanId && r.jumlah > 0),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Formulir menu"
      onClick={tutup}
    >
      <form
        onSubmit={kirim}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-card border border-line bg-white sm:rounded-card"
      >
        <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-line bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="eyebrow">{awal.nama ? "Ubah menu" : "Menu baru"}</p>
            <h2 className="mt-1 font-display text-xl">
              {awal.nama || "Tambah menu baru"}
            </h2>
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

        <div className="space-y-6 px-5 py-5 sm:px-6">
          {/* Informasi dasar */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="nama">
                Nama menu *
              </label>
              <input
                id="nama"
                className="field"
                value={form.nama}
                onChange={(e) => ubah("nama", e.target.value)}
              />
              {galat.nama && <p className="mt-1.5 text-[12.5px] font-semibold text-red-700">{galat.nama}</p>}
            </div>

            <div className="sm:col-span-2">
              <IsianFoto
                nilai={form.foto}
                nama={form.nama}
                slug={form.slug || slugify(form.nama)}
                onUbah={(url) => ubah("foto", url)}
                onSibuk={setUnggahFoto}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="kategori">
                Kategori
              </label>
              <select
                id="kategori"
                className="field"
                value={form.kategori}
                onChange={(e) => ubah("kategori", e.target.value as KategoriMenu)}
              >
                {kategoriMenu.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="harga">
                Harga jual (Rp) *
              </label>
              <input
                id="harga"
                type="number"
                min={0}
                step={1}
                className="field"
                value={form.hargaJual}
                onChange={(e) => ubah("hargaJual", Number(e.target.value) || 0)}
              />
              {galat.hargaJual && (
                <p className="mt-1.5 text-[12.5px] font-semibold text-red-700">{galat.hargaJual}</p>
              )}
            </div>

            <div>
              <label className="field-label" htmlFor="satuan">
                Satuan jual
              </label>
              <input
                id="satuan"
                className="field"
                value={form.satuanJual}
                onChange={(e) => ubah("satuanJual", e.target.value)}
                placeholder="per box / per porsi / per paket"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="minimal">
                Minimal pemesanan
              </label>
              <input
                id="minimal"
                type="number"
                min={1}
                className="field"
                value={form.minimalPesan}
                onChange={(e) => ubah("minimalPesan", Number(e.target.value) || 1)}
              />
              {galat.minimalPesan && (
                <p className="mt-1.5 text-[12.5px] font-semibold text-red-700">
                  {galat.minimalPesan}
                </p>
              )}
            </div>

            <div className="flex items-end gap-5">
              <label className="flex items-center gap-2.5 text-sm font-semibold text-ink-soft">
                <input
                  type="checkbox"
                  checked={form.tersedia}
                  onChange={(e) => ubah("tersedia", e.target.checked)}
                  className="h-4 w-4 accent-brand-700"
                />
                Tersedia
              </label>
              <label className="flex items-center gap-2.5 text-sm font-semibold text-ink-soft">
                <input
                  type="checkbox"
                  checked={form.populer}
                  onChange={(e) => ubah("populer", e.target.checked)}
                  className="h-4 w-4 accent-brand-700"
                />
                Tandai populer
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="deskripsi">
                Deskripsi singkat *
              </label>
              <textarea
                id="deskripsi"
                rows={2}
                className="field resize-y"
                value={form.deskripsi}
                onChange={(e) => ubah("deskripsi", e.target.value)}
              />
              {galat.deskripsi && (
                <p className="mt-1.5 text-[12.5px] font-semibold text-red-700">{galat.deskripsi}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="deskripsiPanjang">
                Deskripsi lengkap
              </label>
              <textarea
                id="deskripsiPanjang"
                rows={3}
                className="field resize-y"
                value={form.deskripsiPanjang}
                onChange={(e) => ubah("deskripsiPanjang", e.target.value)}
                placeholder="Penjelasan lengkap yang tampil di halaman detail menu"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="isi">
                Isi paket (satu baris satu item)
              </label>
              <textarea
                id="isi"
                rows={4}
                className="field resize-y"
                value={isiTeks}
                onChange={(e) => setIsiTeks(e.target.value)}
                placeholder={"Nasi putih\nAyam ungkep\nSambal & kerupuk"}
              />
            </div>

            <details className="rounded-card border border-line p-4 sm:col-span-2" open={Boolean(awal.namaEn)}>
              <summary className="cursor-pointer text-sm font-bold">Versi bahasa Inggris (opsional)</summary>
              <p className="mt-1 text-[13px] text-ink-muted">
                Tampil saat pengunjung memilih EN di situs. Kolom yang kosong memakai teks bahasa Indonesia.
              </p>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="field-label" htmlFor="namaEn">Nama menu (EN)</label>
                  <input
                    id="namaEn"
                    className="field"
                    value={form.namaEn ?? ""}
                    onChange={(e) => ubah("namaEn", e.target.value)}
                    placeholder="Royal Yellow Rice Bento"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="deskripsiEn">Deskripsi singkat (EN)</label>
                  <textarea
                    id="deskripsiEn"
                    rows={2}
                    className="field resize-y"
                    value={form.deskripsiEn ?? ""}
                    onChange={(e) => ubah("deskripsiEn", e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="deskripsiPanjangEn">Deskripsi lengkap (EN)</label>
                  <textarea
                    id="deskripsiPanjangEn"
                    rows={3}
                    className="field resize-y"
                    value={form.deskripsiPanjangEn ?? ""}
                    onChange={(e) => ubah("deskripsiPanjangEn", e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="isiEn">Isi paket (EN, satu baris satu item)</label>
                  <textarea
                    id="isiEn"
                    rows={4}
                    className="field resize-y"
                    value={isiEnTeks}
                    onChange={(e) => setIsiEnTeks(e.target.value)}
                    placeholder={"White rice\nBraised chicken\nChilli sauce & crackers"}
                  />
                </div>
              </div>
            </details>
          </div>

          {/* Biaya & resep */}
          <div className="rounded-card border border-line p-5">
            <h3 className="text-sm font-bold">Biaya produksi & resep</h3>
            <p className="mt-1 text-[13px] text-ink-muted">
              Resep di bawah ini dipakai untuk menghitung HPP secara otomatis.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="kemasan">
                  Biaya kemasan per porsi (Rp)
                </label>
                <input
                  id="kemasan"
                  type="number"
                  min={0}
                  step={1}
                  className="field"
                  value={form.biayaKemasan}
                  onChange={(e) => ubah("biayaKemasan", Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="tenaga">
                  Biaya tenaga kerja per porsi (Rp)
                </label>
                <input
                  id="tenaga"
                  type="number"
                  min={0}
                  step={1}
                  className="field"
                  value={form.biayaTenagaKerja}
                  onChange={(e) => ubah("biayaTenagaKerja", Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <ul className="mt-5 space-y-2.5">
              {form.resep.map((r, i) => (
                <li key={`${r.bahanId}-${i}`} className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[180px] flex-1">
                    <select
                      className="field-sm"
                      value={r.bahanId}
                      onChange={(e) => ubahResep(i, e.target.value, r.jumlah)}
                      aria-label={`Bahan baris ${i + 1}`}
                    >
                      <option value="">Pilih bahan…</option>
                      {bahan.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nama} ({rupiah(b.hargaSatuan)}/{b.satuan})
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    className="field-sm w-28"
                    value={r.jumlah}
                    onChange={(e) => ubahResep(i, r.bahanId, Number(e.target.value) || 0)}
                    aria-label={`Jumlah baris ${i + 1}`}
                  />
                  <span className="w-14 pb-2 text-[13px] text-ink-muted">
                    {bahan.find((b) => b.id === r.bahanId)?.satuan ?? "—"}
                  </span>
                  <span className="w-24 pb-2 text-right text-[13px] font-semibold text-ink">
                    {rupiah(
                      (bahan.find((b) => b.id === r.bahanId)?.hargaSatuan ?? 0) * r.jumlah,
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        resep: f.resep.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="btn btn-ghost h-9 w-9 p-0 text-ink-muted hover:text-red-700"
                    aria-label={`Hapus bahan baris ${i + 1}`}
                  >
                    <IconTrash width={16} height={16} />
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, resep: [...f.resep, { bahanId: "", jumlah: 0 }] }))
              }
              className="btn btn-outline btn-sm mt-4"
            >
              <IconPlus width={15} height={15} />
              Tambah bahan
            </button>

            <dl className="mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-4">
              {[
                { l: "Biaya bahan", v: rupiah(pratinjau.biayaBahan) },
                { l: "Overhead", v: rupiah(pratinjau.overhead) },
                { l: "HPP per porsi", v: rupiah(pratinjau.hpp) },
                { l: "Margin", v: persen(pratinjau.marginPersen) },
              ].map((d) => (
                <div key={d.l}>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                    {d.l}
                  </dt>
                  <dd className="mt-1 font-display text-[17px] text-brand-800">{d.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-line bg-white px-5 py-4 sm:px-6">
          <button type="button" onClick={tutup} className="btn btn-outline btn-md">
            Batal
          </button>
          <button type="submit" className="btn btn-primary btn-md" disabled={sibuk || unggahFoto}>
            {sibuk ? "Menyimpan…" : unggahFoto ? "Menunggu foto…" : "Simpan menu"}
          </button>
        </div>
      </form>
    </div>
  );
}
