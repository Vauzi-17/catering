"use client";

import { useMemo, useState } from "react";
import { JudulHalaman } from "@/components/admin/AdminShell";
import { KartuStat } from "@/components/admin/Bagian";
import { IconClose, IconSearch } from "@/components/Icons";
import { LencanaBayar } from "@/components/pesanan/Lencana";
import { Kosong, StatusBadge } from "@/components/Ui";
import { rupiah, tanggalPanjang, tanggalPendek, waktuRelatif } from "@/lib/format";
import type { Pesanan, StatusPesanan } from "@/lib/types";
import { panggilApi } from "@/lib/api-klien";
import { STATUS_PERLU_PROSES } from "@/lib/status";
import { useAuth } from "@/store/AuthProvider";
import { useData } from "@/store/DataProvider";

const semuaStatus: StatusPesanan[] = [
  "Menunggu Pembayaran",
  "Dibayar",
  "Diproses",
  "Dikirim",
  "Selesai",
  "Dibatalkan",
  "Menunggu Konfirmasi",
];

// Tombol lanjut per status. Pesanan online menjadi "Dibayar" otomatis saat
// notifikasi QRIS cocok, atau lewat tombol "Konfirmasi lunas manual".
const langkahBerikut: Partial<Record<StatusPesanan, { label: string; status: StatusPesanan }>> = {
  "Menunggu Konfirmasi": { label: "Konfirmasi & proses", status: "Diproses" },
  Dibayar: { label: "Mulai masak", status: "Diproses" },
  Diproses: { label: "Tandai dikirim / siap diambil", status: "Dikirim" },
  Dikirim: { label: "Tandai selesai", status: "Selesai" },
};

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
  const perluDiproses = pesanan.filter((p) => STATUS_PERLU_PROSES.includes(p.status)).length;
  const nilaiLunas = pesanan
    .filter((p) => p.statusBayar === "Lunas" && p.status !== "Selesai" && p.status !== "Dibatalkan")
    .reduce((a, p) => a + p.total, 0);

  return (
    <>
      <JudulHalaman
        judul="Pesanan"
        deskripsi="Pesanan online otomatis berstatus Dibayar setelah pembayaran masuk. Lanjutkan ke masak, kirim, dan selesai."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStat
          label="Perlu diproses"
          nilai={String(perluDiproses)}
          catatan="Sudah dibayar, belum dimasak"
          nada={perluDiproses > 0 ? "perhatian" : "baik"}
        />
        <KartuStat
          label="Dimasak / dikirim"
          nilai={`${hitung("Diproses")} / ${hitung("Dikirim")}`}
          catatan="Di dapur / dalam perjalanan"
        />
        <KartuStat
          label="Menunggu pembayaran"
          nilai={String(hitung("Menunggu Pembayaran"))}
          catatan="Belum dibayar pelanggan"
        />
        <KartuStat
          label="Lunas, belum selesai"
          nilai={rupiah(nilaiLunas, true)}
          catatan="Uang sudah masuk lewat QRIS"
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
            {(["Semua", ...semuaStatus.filter((x) => x !== "Menunggu Konfirmasi" || hitung(x) > 0)] as const).map((s) => (
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
                    <td className="text-right font-semibold text-ink">
                      {rupiah(p.total)}
                      {p.nominalBayar && p.statusBayar !== "Lunas" ? (
                        <span className="mt-0.5 block text-[12px] font-normal text-ink-muted">QRIS {rupiah(p.nominalBayar)}</span>
                      ) : null}
                    </td>
                    <td>
                      <span className="flex flex-col items-start gap-1">
                        <StatusBadge status={p.status} />
                        <LencanaBayar status={p.statusBayar} />
                        {p.diklaimBayarPada && p.statusBayar === "Menunggu" && (
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                            Perlu dicek
                          </span>
                        )}
                      </span>
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
  const auth = useAuth();
  const { muatPesanan } = useData();
  const [cek, setCek] = useState("");
  const berikut = langkahBerikut[pesanan.status];
  const bisaBatal = pesanan.status !== "Selesai" && pesanan.status !== "Dibatalkan";
  const bisaKonfirmasi =
    (pesanan.statusBayar === "Menunggu" || pesanan.statusBayar === "Kedaluwarsa") &&
    (pesanan.status === "Menunggu Pembayaran" || pesanan.status === "Dibatalkan");
  const nominal = pesanan.nominalBayar ?? pesanan.total;

  async function konfirmasiLunas() {
    const yakin = window.confirm(
      `Pastikan dana ${rupiah(nominal)} untuk ${pesanan.kode} sudah masuk di GoBiz atau rekening. Tandai pesanan ini lunas?`,
    );
    if (!yakin) return;
    setCek("Menyimpan…");
    try {
      const { ok, data } = await panggilApi(`/api/pesanan/${pesanan.kode}/konfirmasi/`, await auth.token(), {});
      if (!ok) {
        setCek(data.galat ?? "Gagal mengonfirmasi.");
        return;
      }
      setCek("Pembayaran dikonfirmasi.");
      await muatPesanan(true);
    } catch {
      setCek("Gagal mengonfirmasi.");
    }
  }

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
              {
                l: "Pembayaran",
                v: pesanan.statusBayar
                  ? `${pesanan.statusBayar === "Menunggu" ? "Belum dibayar" : pesanan.statusBayar}${pesanan.metodeBayar ? ` · ${pesanan.metodeBayar}` : ""}`
                  : "Manual",
              },
              ...(pesanan.nominalBayar
                ? [{ l: "Nominal QRIS", v: `${rupiah(pesanan.nominalBayar)} (kode unik ${pesanan.kodeUnik ?? 0})` }]
                : []),
              ...(pesanan.dibayarPada ? [{ l: "Dibayar", v: waktuRelatif(pesanan.dibayarPada) }] : []),
            ].map((d) => (
              <div key={d.l}>
                <dt className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                  {d.l}
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">{d.v}</dd>
              </div>
            ))}
            {pesanan.diklaimBayarPada && pesanan.statusBayar === "Menunggu" && (
              <p className="sm:col-span-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-900">
                Pelanggan menyatakan sudah membayar {waktuRelatif(pesanan.diklaimBayarPada)}, tapi notifikasi
                pembayaran belum cocok. Cek riwayat GoBiz atau rekening untuk nominal {rupiah(nominal)}.
              </p>
            )}
            <div className="sm:col-span-2">
              <dt className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                Alamat
              </dt>
              <dd className="mt-1 text-sm text-ink-soft">
                {pesanan.alamat}
                {pesanan.patokan && <span className="block text-ink-muted">Patokan: {pesanan.patokan}</span>}
                {pesanan.lat != null && pesanan.lng != null && (
                  <a
                    href={`https://www.google.com/maps?q=${pesanan.lat},${pesanan.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block font-semibold text-brand-700 hover:underline"
                  >
                    Buka lokasi di Google Maps
                  </a>
                )}
              </dd>
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
          {berikut && (
            <button
              type="button"
              onClick={() => {
                ubahStatus(berikut.status);
                if (berikut.status === "Selesai") tutup();
              }}
              className="btn btn-sm btn-primary"
            >
              {berikut.label}
            </button>
          )}
          {bisaKonfirmasi && (
            <button type="button" onClick={() => void konfirmasiLunas()} className="btn btn-sm btn-outline">
              Konfirmasi lunas manual
            </button>
          )}
          {bisaBatal && (
            <button
              type="button"
              onClick={() => {
                const pesanKonfirmasi =
                  pesanan.statusBayar === "Lunas"
                    ? "Pesanan ini sudah dibayar. Membatalkan di sini TIDAK mengembalikan dana; kembalikan dana ke pelanggan secara manual. Tetap batalkan?"
                    : "Batalkan pesanan ini?";
                if (window.confirm(pesanKonfirmasi)) {
                  ubahStatus("Dibatalkan");
                  tutup();
                }
              }}
              className="btn btn-sm btn-danger"
            >
              Batalkan pesanan
            </button>
          )}
          {cek && <span className="self-center text-[13px] text-ink-muted">{cek}</span>}
        </div>
      </div>
    </div>
  );
}
