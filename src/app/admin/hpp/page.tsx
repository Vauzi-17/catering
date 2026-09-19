"use client";

import { useEffect, useMemo, useState } from "react";
import { JudulHalaman } from "@/components/admin/AdminShell";
import { KartuStat, PanelAnalisis } from "@/components/admin/Bagian";
import { IconRefresh, IconSparkle } from "@/components/Icons";
import {
  analisisHpp,
  hitungHpp,
  rekomendasiHarga,
  type CatatanAnalisis,
} from "@/lib/analisis";
import { mintaInsightHpp, susunKonteks, susunKonteksMenu } from "@/lib/ai-klien";
import { angka, persen, rupiah } from "@/lib/format";
import { useData } from "@/store/DataProvider";

export default function HalamanHpp() {
  const { menus, bahan, pesanan, pengaturan, simpanPengaturan, simpanMenu } = useData();

  const [menuId, setMenuId] = useState("");
  const [overhead, setOverhead] = useState(pengaturan.overheadPersen);
  const [target, setTarget] = useState(pengaturan.targetMargin);
  const [menganalisis, setMenganalisis] = useState(false);
  const [sudahDianalisis, setSudahDianalisis] = useState(false);
  const [catatanAi, setCatatanAi] = useState<CatatanAnalisis[] | null>(null);

  useEffect(() => {
    if (!menuId && menus.length > 0) setMenuId(menus[0].id);
  }, [menus, menuId]);

  useEffect(() => {
    setOverhead(pengaturan.overheadPersen);
    setTarget(pengaturan.targetMargin);
  }, [pengaturan]);

  const menu = menus.find((m) => m.id === menuId) ?? menus[0];

  const hasil = useMemo(
    () => (menu ? hitungHpp(menu, bahan, overhead) : null),
    [menu, bahan, overhead],
  );

  const rekomendasi = hasil ? rekomendasiHarga(hasil.hpp, target) : null;

  const catatanLokal = useMemo(
    () => (menu && hasil ? analisisHpp(menu, hasil, target) : []),
    [menu, hasil, target],
  );

  const catatan = catatanAi ?? catatanLokal;

  const ringkasanSemua = useMemo(
    () =>
      menus
        .map((m) => ({ menu: m, hasil: hitungHpp(m, bahan, overhead) }))
        .sort((a, b) => a.hasil.marginPersen - b.hasil.marginPersen),
    [menus, bahan, overhead],
  );

  /**
   * HPP-nya sendiri sudah dihitung aplikasi dan selalu tampil. Tombol ini
   * meminta Gemini menuliskan catatan penjelasnya; bila Gemini tidak aktif,
   * catatan dari perhitungan aplikasi yang dipakai.
   */
  async function jalankanAnalisis() {
    if (!menu || !hasil) return;

    setMenganalisis(true);
    setSudahDianalisis(false);
    setCatatanAi(null);

    void simpanPengaturan({
      ...pengaturan,
      overheadPersen: overhead,
      targetMargin: target,
    });

    try {
      const dariGemini = await mintaInsightHpp(
        susunKonteksMenu(menu, hasil, target, bahan, overhead),
        susunKonteks({
          pesanan,
          menus,
          bahan,
          overheadPersen: overhead,
          targetMargin: target,
          rentangHari: 7,
        }),
      );
      setCatatanAi(dariGemini);
    } finally {
      setMenganalisis(false);
      setSudahDianalisis(true);
    }
  }

  function terapkanHarga() {
    if (!menu || !rekomendasi) return;
    void simpanMenu({ ...menu, hargaJual: rekomendasi.hargaBulat });
  }

  if (!menu || !hasil || !rekomendasi) {
    return (
      <>
        <JudulHalaman judul="Hitung HPP" />
        <p className="text-sm text-ink-muted">Belum ada menu yang dapat dihitung.</p>
      </>
    );
  }

  return (
    <>
      <JudulHalaman
        judul="Hitung HPP"
        deskripsi="Harga pokok produksi per porsi, dihitung dari resep dan harga bahan."
      />

      {/* Panel kendali */}
      <section className="card p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <label className="field-label" htmlFor="menuHpp">
              Menu yang dihitung
            </label>
            <select
              id="menuHpp"
              className="field"
              value={menuId}
              onChange={(e) => {
                setMenuId(e.target.value);
                setSudahDianalisis(false);
                setCatatanAi(null);
              }}
            >
              {menus.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama} — {m.kategori}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <label className="field-label" htmlFor="overhead">
              Overhead ({overhead}%)
            </label>
            <input
              id="overhead"
              type="range"
              min={0}
              max={25}
              step={1}
              value={overhead}
              onChange={(e) => setOverhead(Number(e.target.value))}
              className="h-11 w-full accent-brand-700"
            />
            <p className="text-[12px] text-ink-muted">
              Gas, listrik, air, dan penyusutan alat.
            </p>
          </div>

          <div className="lg:col-span-2">
            <label className="field-label" htmlFor="target">
              Target margin (%)
            </label>
            <input
              id="target"
              type="number"
              min={1}
              max={80}
              className="field"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value) || 1)}
            />
          </div>

          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={() => void jalankanAnalisis()}
              disabled={menganalisis}
              className="btn btn-primary btn-md w-full"
            >
              {menganalisis ? (
                <>
                  <IconRefresh width={17} height={17} className="animate-spin" />
                  Menghitung…
                </>
              ) : (
                <>
                  <IconSparkle width={17} height={17} />
                  Hitung ulang
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Ringkasan angka */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStat
          label="HPP per porsi"
          nilai={rupiah(hasil.hpp)}
          catatan={`Dari ${menu.resep.length} bahan + overhead ${overhead}%`}
        />
        <KartuStat
          label="Harga jual saat ini"
          nilai={rupiah(hasil.hargaJual)}
          catatan={menu.satuanJual}
        />
        <KartuStat
          label="Laba per porsi"
          nilai={rupiah(hasil.labaPerPorsi)}
          catatan={`Margin ${persen(hasil.marginPersen)}`}
          nada={hasil.marginPersen >= target ? "baik" : "perhatian"}
        />
        <KartuStat
          label="Usulan harga"
          nilai={rupiah(rekomendasi.hargaBulat)}
          catatan={`Untuk target margin ${persen(target, 0)} · tercapai ${persen(
            rekomendasi.marginTercapai,
          )}`}
          nada="baik"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {/* Rincian bahan */}
        <section className="card p-5 sm:p-6 xl:col-span-2">
          <h2 className="font-display text-lg">Rincian biaya {menu.nama}</h2>
          <p className="mt-1 text-[13px] text-ink-muted">
            Jumlah pada resep dikalikan harga satuan bahan.
          </p>

          <div className="table-wrap mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bahan</th>
                  <th className="text-right">Jumlah</th>
                  <th className="text-right">Harga satuan</th>
                  <th className="text-right">Subtotal</th>
                  <th className="text-right">Kontribusi</th>
                </tr>
              </thead>
              <tbody>
                {hasil.rincian.map((r) => (
                  <tr key={r.bahanId}>
                    <td className="font-medium text-ink">{r.nama}</td>
                    <td className="text-right">
                      {angka(r.jumlah, r.jumlah < 1 ? 3 : 1)} {r.satuan}
                    </td>
                    <td className="text-right">{rupiah(r.hargaSatuan)}</td>
                    <td className="text-right font-semibold text-ink">{rupiah(r.subtotal)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[12px] text-ink-muted">
                          {persen(r.kontribusiPersen, 0)}
                        </span>
                        <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-line sm:block">
                          <span
                            className="block h-full bg-brand-500"
                            style={{ width: `${Math.min(100, r.kontribusiPersen)}%` }}
                          />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Biaya bahan</dt>
              <dd className="font-semibold">{rupiah(hasil.biayaBahan)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Biaya kemasan</dt>
              <dd className="font-semibold">{rupiah(hasil.biayaKemasan)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Biaya tenaga kerja</dt>
              <dd className="font-semibold">{rupiah(hasil.biayaTenagaKerja)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Overhead ({overhead}%)</dt>
              <dd className="font-semibold">{rupiah(hasil.overhead)}</dd>
            </div>
            <div className="flex items-end justify-between border-t border-line pt-3">
              <dt className="font-semibold">HPP per porsi</dt>
              <dd className="font-display text-2xl font-semibold text-brand-800">
                {rupiah(hasil.hpp)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-col gap-3 rounded-lg border border-brand-200 bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-semibold text-brand-800">
                Usulan harga jual {rupiah(rekomendasi.hargaBulat)}
              </p>
              <p className="mt-0.5 text-[12.5px] text-brand-700">
                Dibulatkan dari {rupiah(rekomendasi.hargaIdeal)} agar mudah ditulis pada nota.
              </p>
            </div>
            <button
              type="button"
              onClick={terapkanHarga}
              disabled={menu.hargaJual === rekomendasi.hargaBulat}
              className="btn btn-primary btn-sm shrink-0"
            >
              Terapkan ke menu
            </button>
          </div>
        </section>

        {/* Analisis */}
        <div className="space-y-5">
          {menganalisis ? (
            <section className="card p-6">
              <div className="flex items-center gap-3">
                <IconRefresh className="animate-spin text-brand-600" width={20} height={20} />
                <p className="text-sm font-semibold">Menyusun catatan…</p>
              </div>
              <ul className="mt-4 space-y-2 text-[13px] text-ink-muted">
                <li>Membaca {menu.resep.length} baris resep</li>
                <li>Mengambil harga bahan terbaru</li>
                <li>Menghitung margin dan usulan harga</li>
              </ul>
            </section>
          ) : (
            <PanelAnalisis
              judul="AI Insight"
              deskripsi={`Dibaca dari resep ${menu.nama}, harga bahan terbaru, dan target margin ${persen(
                target,
                0,
              )}.`}
              catatan={catatan}
              sumber={catatanAi ? "gemini" : "lokal"}
            />
          )}

          <section className="card p-5">
            <h3 className="text-sm font-bold">Rumus yang dipakai</h3>
            <ol className="mt-3 space-y-2 text-[13px] leading-relaxed text-ink-muted">
              <li>1. Biaya bahan = jumlah pada resep × harga satuan bahan.</li>
              <li>2. Biaya langsung = biaya bahan + kemasan + tenaga kerja.</li>
              <li>3. Overhead = biaya langsung × persentase overhead.</li>
              <li>4. HPP = biaya langsung + overhead.</li>
              <li>5. Usulan harga = HPP ÷ (1 − target margin), lalu dibulatkan.</li>
            </ol>
          </section>
        </div>
      </div>

      {/* Ringkasan seluruh menu */}
      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="font-display text-lg">HPP seluruh menu</h2>
        <p className="mt-1 text-[13px] text-ink-muted">
          Diurutkan dari margin terendah agar menu yang perlu ditinjau muncul lebih dulu.
        </p>

        <div className="table-wrap mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Menu</th>
                <th className="text-right">HPP</th>
                <th className="text-right">Harga jual</th>
                <th className="text-right">Laba</th>
                <th className="text-right">Margin</th>
                <th className="text-right">Usulan harga</th>
              </tr>
            </thead>
            <tbody>
              {ringkasanSemua.map(({ menu: m, hasil: h }) => {
                const r = rekomendasiHarga(h.hpp, target);
                return (
                  <tr key={m.id}>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuId(m.id);
                          setSudahDianalisis(false);
                          setCatatanAi(null);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="font-semibold text-ink hover:text-brand-700"
                      >
                        {m.nama}
                      </button>
                      <span className="mt-0.5 block text-[12px] text-ink-muted">
                        {m.kategori}
                      </span>
                    </td>
                    <td className="text-right">{rupiah(h.hpp)}</td>
                    <td className="text-right">{rupiah(h.hargaJual)}</td>
                    <td className="text-right">{rupiah(h.labaPerPorsi)}</td>
                    <td className="text-right">
                      <span
                        className={`font-semibold ${
                          h.marginPersen < target ? "text-clay-600" : "text-brand-700"
                        }`}
                      >
                        {persen(h.marginPersen)}
                      </span>
                    </td>
                    <td className="text-right font-semibold text-brand-800">
                      {rupiah(r.hargaBulat)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
