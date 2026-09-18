"use client";

import { useEffect, useMemo, useState } from "react";
import { JudulHalaman } from "@/components/admin/AdminShell";
import { GrafikBatang, KartuStat, PanelAnalisis } from "@/components/admin/Bagian";
import { IconTrendUp, IconWallet } from "@/components/Icons";
import { Kosong } from "@/components/Ui";
import {
  insightLaporan,
  kebutuhanBahan,
  laporanHarian,
  performaMenu,
  type CatatanAnalisis,
} from "@/lib/analisis";
import { mintaInsightLaporan, susunKonteks } from "@/lib/ai-klien";
import { angka, persen, rupiah, tanggalPendek } from "@/lib/format";
import { useData } from "@/store/DataProvider";

const periode = [
  { nilai: 7, label: "7 hari" },
  { nilai: 14, label: "14 hari" },
  { nilai: 30, label: "30 hari" },
];

export default function HalamanLaporan() {
  const { pesanan, menus, bahan, pengaturan } = useData();
  const [rentang, setRentang] = useState(7);

  const laporan = useMemo(
    () => laporanHarian(pesanan, menus, bahan, pengaturan.overheadPersen),
    [pesanan, menus, bahan, pengaturan.overheadPersen],
  );

  const performa = useMemo(
    () => performaMenu(pesanan, menus, bahan, pengaturan.overheadPersen),
    [pesanan, menus, bahan, pengaturan.overheadPersen],
  );

  const kebutuhan = useMemo(
    () => kebutuhanBahan(pesanan, menus, bahan),
    [pesanan, menus, bahan],
  );

  const catatanLokal = useMemo(
    () => insightLaporan(laporan, performa, kebutuhan),
    [laporan, performa, kebutuhan],
  );

  // Catatan ditulis Gemini bila tersedia. Bila tidak, aplikasi memakai
  // catatan hasil perhitungan sendiri sehingga laporan tetap lengkap.
  const [catatanAi, setCatatanAi] = useState<CatatanAnalisis[] | null>(null);
  const [memuatAi, setMemuatAi] = useState(false);

  useEffect(() => {
    if (pesanan.length === 0) return;
    let dibatalkan = false;

    setMemuatAi(true);
    setCatatanAi(null);

    const konteks = susunKonteks({
      pesanan,
      menus,
      bahan,
      overheadPersen: pengaturan.overheadPersen,
      targetMargin: pengaturan.targetMargin,
      rentangHari: rentang,
    });

    void mintaInsightLaporan(konteks)
      .then((hasil) => {
        if (!dibatalkan) setCatatanAi(hasil);
      })
      .finally(() => {
        if (!dibatalkan) setMemuatAi(false);
      });

    return () => {
      dibatalkan = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rentang,
    pesanan.length,
    menus.length,
    bahan.length,
    pengaturan.overheadPersen,
    pengaturan.targetMargin,
  ]);

  const catatan = catatanAi ?? catatanLokal;

  // Deret tanggal berurutan untuk grafik, termasuk hari tanpa pesanan.
  const deret = useMemo(() => {
    const hasil: { label: string; nilai: number; keterangan: string }[] = [];
    for (let i = rentang - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const p = (n: number) => n.toString().padStart(2, "0");
      const kunci = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
      const baris = laporan.find((l) => l.tanggal === kunci);
      hasil.push({
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        nilai: baris?.pendapatan ?? 0,
        keterangan: `${tanggalPendek(kunci)}: ${rupiah(baris?.pendapatan ?? 0)}`,
      });
    }
    return hasil;
  }, [laporan, rentang]);

  const barisPeriode = useMemo(() => {
    const batas = new Date();
    batas.setDate(batas.getDate() - (rentang - 1));
    const p = (n: number) => n.toString().padStart(2, "0");
    const awal = `${batas.getFullYear()}-${p(batas.getMonth() + 1)}-${p(batas.getDate())}`;
    return laporan.filter((l) => l.tanggal >= awal);
  }, [laporan, rentang]);

  const totalPendapatan = barisPeriode.reduce((a, b) => a + b.pendapatan, 0);
  const totalHpp = barisPeriode.reduce((a, b) => a + b.hpp, 0);
  const totalLaba = totalPendapatan - totalHpp;
  const totalPorsi = barisPeriode.reduce((a, b) => a + b.jumlahPorsi, 0);
  const marginPeriode = totalPendapatan > 0 ? (totalLaba / totalPendapatan) * 100 : 0;

  const belanja = kebutuhan.filter((k) => k.kurang > 0);
  const totalBelanja = belanja.reduce((a, k) => a + k.kurang * k.hargaSatuan, 0);

  return (
    <>
      <JudulHalaman
        judul="Laporan"
        deskripsi="Pendapatan, laba, dan performa menu."
        aksi={
          <div className="flex gap-2">
            {periode.map((p) => (
              <button
                key={p.nilai}
                type="button"
                onClick={() => setRentang(p.nilai)}
                aria-pressed={rentang === p.nilai}
                className={`btn btn-sm ${
                  rentang === p.nilai ? "btn-primary" : "btn-outline"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStat
          label={`Pendapatan ${rentang} hari`}
          nilai={rupiah(totalPendapatan)}
          catatan={`${totalPorsi} porsi terjual`}
          ikon={<IconWallet width={20} height={20} />}
          nada="baik"
        />
        <KartuStat
          label="Harga pokok produksi"
          nilai={rupiah(totalHpp)}
          catatan="Bahan, kemasan, tenaga kerja, overhead"
        />
        <KartuStat
          label="Laba kotor"
          nilai={rupiah(totalLaba)}
          catatan={`Margin ${persen(marginPeriode)}`}
          ikon={<IconTrendUp width={20} height={20} />}
          nada={marginPeriode >= pengaturan.targetMargin ? "baik" : "perhatian"}
        />
        <KartuStat
          label="Rata-rata per hari"
          nilai={rupiah(totalPendapatan / rentang)}
          catatan={`Dari ${barisPeriode.length} hari yang ada pesanannya`}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <section className="card p-5 sm:p-6 xl:col-span-2">
          <h2 className="font-display text-lg">Pendapatan harian</h2>
          <p className="mt-1 text-[13px] text-ink-muted">
            Batang kosong berarti tidak ada pesanan yang tercatat pada hari tersebut.
          </p>
          <div className="mt-6">
            <GrafikBatang data={deret} tinggi={200} />
          </div>
        </section>

        <PanelAnalisis
          judul="Catatan"
          deskripsi="Dari tren pendapatan, margin menu, dan stok bahan."
          catatan={catatan}
          sumber={catatanAi ? "gemini" : "lokal"}
          memuat={memuatAi}
        />
      </div>

      {/* Tabel harian */}
      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="font-display text-lg">Rincian pendapatan harian</h2>
        {barisPeriode.length === 0 ? (
          <div className="mt-4">
            <Kosong
              judul="Belum ada data pada periode ini"
              deskripsi="Pesanan yang sudah dikonfirmasi akan otomatis masuk ke laporan harian."
            />
          </div>
        ) : (
          <div className="table-wrap mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th className="text-right">Pesanan</th>
                  <th className="text-right">Porsi</th>
                  <th className="text-right">Pendapatan</th>
                  <th className="text-right">HPP</th>
                  <th className="text-right">Laba</th>
                  <th className="text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {barisPeriode.map((b) => (
                  <tr key={b.tanggal}>
                    <td className="font-semibold text-ink">{tanggalPendek(b.tanggal)}</td>
                    <td className="text-right">{b.jumlahPesanan}</td>
                    <td className="text-right">{b.jumlahPorsi}</td>
                    <td className="text-right font-semibold text-ink">
                      {rupiah(b.pendapatan)}
                    </td>
                    <td className="text-right">{rupiah(b.hpp)}</td>
                    <td className="text-right">{rupiah(b.laba)}</td>
                    <td className="text-right">
                      <span
                        className={`font-semibold ${
                          b.margin < pengaturan.targetMargin
                            ? "text-clay-600"
                            : "text-brand-700"
                        }`}
                      >
                        {persen(b.margin)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="font-bold text-ink">Total</td>
                  <td className="text-right font-bold text-ink">
                    {barisPeriode.reduce((a, b) => a + b.jumlahPesanan, 0)}
                  </td>
                  <td className="text-right font-bold text-ink">{totalPorsi}</td>
                  <td className="text-right font-bold text-ink">{rupiah(totalPendapatan)}</td>
                  <td className="text-right font-bold text-ink">{rupiah(totalHpp)}</td>
                  <td className="text-right font-bold text-ink">{rupiah(totalLaba)}</td>
                  <td className="text-right font-bold text-brand-700">
                    {persen(marginPeriode)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {/* Performa menu */}
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-lg">Performa menu</h2>
          <p className="mt-1 text-[13px] text-ink-muted">
            Diurutkan dari pendapatan terbesar.
          </p>
          <div className="table-wrap mt-4">
            <table className="data-table min-w-[520px]">
              <thead>
                <tr>
                  <th>Menu</th>
                  <th className="text-right">Porsi</th>
                  <th className="text-right">Pendapatan</th>
                  <th className="text-right">Laba</th>
                  <th className="text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {performa.map((p) => (
                  <tr key={p.menuId}>
                    <td>
                      <span className="font-semibold text-ink">{p.nama}</span>
                      <span className="mt-0.5 block text-[12px] text-ink-muted">
                        {p.kategori}
                      </span>
                    </td>
                    <td className="text-right">{p.porsi}</td>
                    <td className="text-right font-semibold text-ink">
                      {rupiah(p.pendapatan)}
                    </td>
                    <td className="text-right">{rupiah(p.laba)}</td>
                    <td className="text-right">
                      <span
                        className={`font-semibold ${
                          p.margin < 20 ? "text-clay-600" : "text-brand-700"
                        }`}
                      >
                        {persen(p.margin)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Kebutuhan bahan */}
        <section className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg">Estimasi kebutuhan bahan</h2>
              <p className="mt-1 text-[13px] text-ink-muted">
                Dari pesanan yang belum selesai.
              </p>
            </div>
            {belanja.length > 0 && (
              <p className="text-right">
                <span className="block text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                  Dana belanja
                </span>
                <span className="font-display text-xl text-clay-600">
                  {rupiah(totalBelanja)}
                </span>
              </p>
            )}
          </div>

          {kebutuhan.length === 0 ? (
            <div className="mt-4">
              <Kosong
                judul="Tidak ada pesanan berjalan"
                deskripsi="Estimasi kebutuhan bahan muncul setelah ada pesanan yang menunggu konfirmasi atau sedang diproses."
              />
            </div>
          ) : (
            <div className="table-wrap mt-4">
              <table className="data-table min-w-[520px]">
                <thead>
                  <tr>
                    <th>Bahan</th>
                    <th className="text-right">Dibutuhkan</th>
                    <th className="text-right">Stok</th>
                    <th className="text-right">Kurang</th>
                    <th className="text-right">Perkiraan biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {kebutuhan.map((k) => (
                    <tr key={k.bahanId}>
                      <td className="font-medium text-ink">{k.nama}</td>
                      <td className="text-right">
                        {angka(k.jumlah, k.jumlah < 10 ? 2 : 0)} {k.satuan}
                      </td>
                      <td className="text-right">
                        {angka(k.stok, 1)} {k.satuan}
                      </td>
                      <td className="text-right">
                        {k.kurang > 0 ? (
                          <span className="font-semibold text-clay-600">
                            {angka(k.kurang, 2)} {k.satuan}
                          </span>
                        ) : (
                          <span className="text-ink-muted">cukup</span>
                        )}
                      </td>
                      <td className="text-right font-semibold text-ink">{rupiah(k.biaya)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
