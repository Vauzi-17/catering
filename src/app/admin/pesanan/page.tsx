"use client";

import { useMemo, useState } from "react";
import { JudulHalaman } from "@/components/admin/AdminShell";
import { KartuStat } from "@/components/admin/Bagian";
import { IconClose, IconSearch } from "@/components/Icons";
import { Kosong, StatusBadge } from "@/components/Ui";
import { rupiah, tanggalPanjang, tanggalPendek, waktuRelatif } from "@/lib/format";
import type { Pesanan, StatusPesanan } from "@/lib/types";
import { useData } from "@/store/DataProvider";

const semuaStatus: StatusPesanan[] = [
  "Menunggu Konfirmasi",
  "Diproses",
  "Selesai",
  "Dibatalkan",
];

export default function HalamanPesananAdmin() {
  const { pesanan, ubahStatusPesanan } = useData();

  const [filter, setFilter] = useState<"Semua" | StatusPesanan>("Semua");
  const [cari, setCari] = useState("");
  const [dipilih, setDipilih] = useState<string | null>(null);

  const hasil = useMemo(() => {
    const kunci = cari.trim().toLowerCase();
    return [...pesanan]
      .filter((p) => filter === "Semua" || p.status === filter)
      .filter(
        (p) =>
          kunci === "" ||
          p.kode.toLowerCase().includes(kunci) ||
          p.nama.toLowerCase().includes(kunci) ||
          p.telepon.includes(kunci),
      )
      .sort((a, b) => (a.tanggalAcara < b.tanggalAcara ? 1 : -1));
  }, [pesanan, filter, cari]);

  const terpilih = pesanan.find((p) => p.id === dipilih) ?? null;

  const hitung = (s: StatusPesanan) => pesanan.filter((p) => p.status === s).length;
  const nilaiAktif = pesanan
    .filter((p) => p.status === "Menunggu Konfirmasi" || p.status === "Diproses")
    .reduce((a, p) => a + p.total, 0);

  return (
    <>
      <JudulHalaman
        judul="Pesanan"
        deskripsi="Konfirmasi pesanan baru dan perbarui statusnya."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStat
          label="Menunggu konfirmasi"
          nilai={String(hitung("Menunggu Konfirmasi"))}
          catatan="Perlu ditindaklanjuti hari ini"
          nada={hitung("Menunggu Konfirmasi") > 0 ? "perhatian" : "baik"}
        />
        <KartuStat
          label="Sedang diproses"
          nilai={String(hitung("Diproses"))}
          catatan="Dikerjakan di dapur"
        />
        <KartuStat
          label="Selesai"
          nilai={String(hitung("Selesai"))}
          catatan="Sudah diterima pelanggan"
        />
        <KartuStat
          label="Nilai pesanan berjalan"
          nilai={rupiah(nilaiAktif, true)}
          catatan="Menunggu konfirmasi + diproses"
          nada="baik"
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
              placeholder="Cari kode, nama, atau nomor telepon"
              aria-label="Cari pesanan"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["Semua", ...semuaStatus] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                aria-pressed={filter === s}
                className={`chip transition-colors ${
                  filter === s
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-line-strong bg-white text-ink-soft hover:border-brand-300 hover:bg-brand-50"
                }`}
              >
                {s}
                {s !== "Semua" && (
                  <span className="opacity-70">{hitung(s as StatusPesanan)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {hasil.length === 0 ? (
        <div className="mt-6">
          <Kosong
            judul="Tidak ada pesanan"
            deskripsi="Belum ada pesanan yang cocok dengan filter atau kata kunci pencarian Anda."
          />
        </div>
      ) : (
        <section className="card mt-6 p-4 sm:p-5">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Pemesan</th>
                  <th>Acara</th>
                  <th>Menu</th>
                  <th className="text-right">Total</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {hasil.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="font-semibold text-ink">{p.kode}</span>
                      <span className="mt-0.5 block text-[12px] text-ink-muted">
                        {waktuRelatif(p.dibuatPada)}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium text-ink">{p.nama}</span>
                      <span className="mt-0.5 block text-[12px] text-ink-muted">
                        {p.telepon}
                      </span>
                    </td>
                    <td>
                      {tanggalPendek(p.tanggalAcara)}
                      <span className="mt-0.5 block text-[12px] text-ink-muted">
                        {p.waktuAntar} · {p.metode}
                      </span>
                    </td>
                    <td className="max-w-[220px]">
                      {p.items.map((it) => (
                        <span key={it.menuId} className="block text-[13px]">
                          {it.nama} × {it.qty}
                        </span>
                      ))}
                    </td>
                    <td className="text-right font-semibold text-ink">{rupiah(p.total)}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => setDipilih(p.id)}
                        className="btn btn-outline btn-sm"
                      >
                        Kelola
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {terpilih && (
        <DialogPesanan
          pesanan={terpilih}
          tutup={() => setDipilih(null)}
          ubahStatus={(s) => void ubahStatusPesanan(terpilih.id, s)}
        />
      )}
    </>
  );
}

function DialogPesanan({
  pesanan,
  tutup,
  ubahStatus,
}: {
  pesanan: Pesanan;
  tutup: () => void;
  ubahStatus: (s: StatusPesanan) => void;
}) {
  const aksi: { label: string; status: StatusPesanan; gaya: string }[] = [
    { label: "Konfirmasi pesanan", status: "Diproses", gaya: "btn-primary" },
    { label: "Tandai selesai", status: "Selesai", gaya: "btn-outline" },
    { label: "Batalkan pesanan", status: "Dibatalkan", gaya: "btn-danger" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Detail pesanan ${pesanan.kode}`}
      onClick={tutup}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-card border border-line bg-white sm:rounded-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-line bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="eyebrow">Detail pesanan</p>
            <h2 className="mt-1 font-display text-xl">{pesanan.kode}</h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={pesanan.status} />
            <button
              type="button"
              onClick={tutup}
              className="btn btn-ghost h-9 w-9 p-0"
              aria-label="Tutup detail pesanan"
            >
              <IconClose />
            </button>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <dl className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
            {[
              { l: "Nama pemesan", v: pesanan.nama },
              { l: "Telepon", v: pesanan.telepon },
              { l: "Tanggal acara", v: tanggalPanjang(pesanan.tanggalAcara) },
              { l: "Jam", v: pesanan.waktuAntar },
              { l: "Metode", v: pesanan.metode },
              { l: "Dibuat", v: waktuRelatif(pesanan.dibuatPada) },
            ].map((d) => (
              <div key={d.l}>
                <dt className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                  {d.l}
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">{d.v}</dd>
              </div>
            ))}
            <div className="sm:col-span-2">
              <dt className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                Alamat
              </dt>
              <dd className="mt-1 text-sm text-ink-soft">{pesanan.alamat}</dd>
            </div>
            {pesanan.catatan && (
              <div className="sm:col-span-2">
                <dt className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                  Catatan pelanggan
                </dt>
                <dd className="mt-1 rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink-soft">
                  {pesanan.catatan}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-6 border-t border-line pt-5">
            <h3 className="text-sm font-bold">Rincian menu</h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              {pesanan.items.map((it) => (
                <li key={it.menuId} className="flex justify-between gap-4">
                  <span className="text-ink-muted">
                    {it.nama} × {it.qty} @ {rupiah(it.harga)}
                  </span>
                  <span className="font-semibold">{rupiah(it.harga * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
              <span className="font-semibold">Total</span>
              <span className="font-display text-xl font-semibold text-brand-800">
                {rupiah(pesanan.total)}
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <h3 className="text-sm font-bold">Riwayat status</h3>
            <ul className="mt-3 space-y-2">
              {pesanan.riwayat.map((r, i) => (
                <li key={`${r.status}-${i}`} className="flex justify-between gap-4 text-[13px]">
                  <span className="font-medium text-ink">{r.status}</span>
                  <span className="text-ink-muted">{waktuRelatif(r.waktu)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-line bg-white px-5 py-4 sm:px-6">
          {aksi
            .filter((a) => a.status !== pesanan.status)
            .map((a) => (
              <button
                key={a.status}
                type="button"
                onClick={() => {
                  ubahStatus(a.status);
                  if (a.status === "Dibatalkan" || a.status === "Selesai") tutup();
                }}
                className={`btn btn-sm ${a.gaya}`}
              >
                {a.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
