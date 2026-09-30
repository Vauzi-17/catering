"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { JudulHalaman } from "@/components/admin/AdminShell";
import { GrafikBatang, KartuStat, PanelAnalisis } from "@/components/admin/Bagian";
import {
  IconArrowRight,
  IconBox,
  IconClipboard,
  IconTrendUp,
  IconWallet,
} from "@/components/Icons";
import { StatusBadge } from "@/components/Ui";
import {
  insightLaporan,
  kebutuhanBahan,
  laporanHarian,
  performaMenu,
  type CatatanAnalisis,
} from "@/lib/analisis";
import { mintaInsightLaporan, susunKonteks } from "@/lib/ai-klien";
import { persen, rupiah, tanggalHariIni, tanggalPendek } from "@/lib/format";
import { STATUS_BERJALAN, STATUS_PERLU_PROSES } from "@/lib/status";
import { useData } from "@/store/DataProvider";

export default function DasborAdmin() {
  const { pesanan, menus, bahan, pengaturan } = useData();

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
    () => insightLaporan(laporan, performa, kebutuhan).slice(0, 3),
    [laporan, performa, kebutuhan],
  );

  // Angka pada kartu dan grafik di atas dihitung sistem. Bagian ini hanya
  // penjelasannya, ditulis Gemini bila tersedia — kalau tidak, dipakai
  // penjelasan hasil perhitungan sendiri supaya dasbor tidak pernah kosong.
  const [catatanAi, setCatatanAi] = useState<CatatanAnalisis[] | null>(null);
  const [memuatAi, setMemuatAi] = useState(false);

  useEffect(() => {
    if (pesanan.length === 0) return;
    let dibatalkan = false;

    setMemuatAi(true);
    setCatatanAi(null);

    void mintaInsightLaporan(
      susunKonteks({
        pesanan,
        menus,
        bahan,
        overheadPersen: pengaturan.overheadPersen,
        targetMargin: pengaturan.targetMargin,
        rentangHari: 7,
      }),
    )
      .then((hasil) => {
        if (!dibatalkan) setCatatanAi(hasil ? hasil.slice(0, 3) : null);
      })
      .finally(() => {
        if (!dibatalkan) setMemuatAi(false);
      });

    return () => {
      dibatalkan = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pesanan.length,
    menus.length,
    bahan.length,
    pengaturan.overheadPersen,
    pengaturan.targetMargin,
  ]);

  const catatan = catatanAi ?? catatanLokal;

  const hariIni = tanggalHariIni();
  const barisHariIni = laporan.find((l) => l.tanggal === hariIni);

  const pesananAktif = pesanan.filter((p) => STATUS_BERJALAN.includes(p.status));
  const perluKonfirmasi = pesanan.filter((p) => STATUS_PERLU_PROSES.includes(p.status));

  const tujuhHari = useMemo(() => {
    const hasil: { label: string; nilai: number; keterangan: string }[] = [];
    for (let i = 6; i >= 0; i--) {
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
  }, [laporan]);

  const marginRata =
    laporan.length > 0
      ? laporan.slice(0, 7).reduce((a, b) => a + b.margin, 0) /
        Math.min(laporan.length, 7)
      : 0;

  const stokMenipis = bahan.filter((b) => b.stok <= b.stokMinimum);
  const pesananTerbaru = [...pesanan]
    .sort((a, b) => (a.dibuatPada < b.dibuatPada ? 1 : -1))
    .slice(0, 6);

  return (
    <>
      <JudulHalaman
        judul="Dashboard"
        deskripsi="Ringkasan pesanan dan pendapatan hari ini."
        aksi={
          <Link href="/admin/pesanan" className="btn btn-primary btn-md">
            Kelola pesanan
            <IconArrowRight width={18} height={18} />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStat
          label="Pendapatan hari ini"
          nilai={rupiah(barisHariIni?.pendapatan ?? 0)}
          catatan={`${barisHariIni?.jumlahPorsi ?? 0} porsi dari ${
            barisHariIni?.jumlahPesanan ?? 0
          } pesanan`}
          ikon={<IconWallet width={20} height={20} />}
          nada="baik"
        />
        <KartuStat
          label="Laba hari ini"
          nilai={rupiah(barisHariIni?.laba ?? 0)}
          catatan={`Margin ${persen(barisHariIni?.margin ?? 0)}`}
          ikon={<IconTrendUp width={20} height={20} />}
        />
        <KartuStat
          label="Pesanan aktif"
          nilai={String(pesananAktif.length)}
          catatan={`${perluKonfirmasi.length} perlu diproses`}
          ikon={<IconClipboard width={20} height={20} />}
          nada={perluKonfirmasi.length > 0 ? "perhatian" : "netral"}
        />
        <KartuStat
          label="Bahan menipis"
          nilai={String(stokMenipis.length)}
          catatan={
            stokMenipis.length > 0
              ? `Terendah: ${stokMenipis[0].nama}`
              : "Semua stok di atas batas minimum"
          }
          ikon={<IconBox width={20} height={20} />}
          nada={stokMenipis.length > 0 ? "perhatian" : "baik"}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <section className="card p-5 sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg">Pendapatan tujuh hari terakhir</h2>
              <p className="mt-1 text-[13px] text-ink-muted">
                Dihitung dari pesanan yang sudah dibayar atau dikonfirmasi.
              </p>
            </div>
            <p className="text-right">
              <span className="block text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                Margin rata-rata
              </span>
              <span className="font-display text-xl text-brand-800">
                {persen(marginRata)}
              </span>
            </p>
          </div>
          <div className="mt-6">
            <GrafikBatang data={tujuhHari} />
          </div>
        </section>

        <PanelAnalisis
          judul="AI Insight"
          deskripsi="Ringkasan kondisi usaha hari ini."
          catatan={catatan}
          sumber={catatanAi ? "gemini" : "lokal"}
          memuat={memuatAi}
        />
      </div>

      <section className="card mt-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg">Pesanan terbaru</h2>
          <Link
            href="/admin/pesanan"
            className="text-[13px] font-semibold text-brand-700 hover:underline"
          >
            Lihat semua
          </Link>
        </div>

        <div className="table-wrap mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Pemesan</th>
                <th>Tanggal acara</th>
                <th className="text-right">Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pesananTerbaru.map((p) => (
                <tr key={p.id}>
                  <td className="font-semibold text-ink">{p.kode}</td>
                  <td>{p.nama}</td>
                  <td>{tanggalPendek(p.tanggalAcara)}</td>
                  <td className="text-right font-semibold text-ink">{rupiah(p.total)}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
