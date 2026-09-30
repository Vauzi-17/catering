"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { JudulHalaman } from "@/components/admin/AdminShell";
import { KartuStat } from "@/components/admin/Bagian";
import { Kosong } from "@/components/Ui";
import { ambilTransaksi, type TransaksiAdmin } from "@/lib/db";
import { rupiah, waktuRelatif } from "@/lib/format";
import { LABEL_TRANSAKSI } from "@/lib/status";
import { supabaseAktif } from "@/lib/supabase";

const LUNAS = ["settlement", "capture"];

const gayaStatus: Record<string, string> = {
  settlement: "bg-zamrud-100 text-zamrud-800",
  capture: "bg-zamrud-100 text-zamrud-800",
  pending: "bg-jingga-100 text-jingga-800",
  expire: "bg-kabut-deep text-ink-muted",
  cancel: "bg-red-100 text-red-700",
  deny: "bg-red-100 text-red-700",
  failure: "bg-red-100 text-red-700",
  refund: "bg-kabut-deep text-ink-soft",
  partial_refund: "bg-kabut-deep text-ink-soft",
};

export default function HalamanTransaksi() {
  const [daftar, setDaftar] = useState<TransaksiAdmin[] | null>(null);
  const [galat, setGalat] = useState("");
  const [saring, setSaring] = useState("semua");
  const [memuat, setMemuat] = useState(false);

  const muat = useCallback(async () => {
    if (!supabaseAktif) return;
    setMemuat(true);
    setGalat("");
    try {
      setDaftar(await ambilTransaksi());
    } catch {
      setGalat("Histori transaksi gagal dimuat.");
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  const tampil = useMemo(
    () =>
      (daftar ?? []).filter((t) =>
        saring === "semua" ? true : saring === "lunas" ? LUNAS.includes(t.statusTransaksi) : t.statusTransaksi === saring,
      ),
    [daftar, saring],
  );

  const hariIni = new Date().toISOString().slice(0, 10);
  const lunas = (daftar ?? []).filter((t) => LUNAS.includes(t.statusTransaksi));
  const totalLunas = lunas.reduce((a, t) => a + t.jumlah, 0);
  const lunasHariIni = lunas
    .filter((t) => (t.waktuTransaksi ?? t.dibuatPada).slice(0, 10) === hariIni)
    .reduce((a, t) => a + t.jumlah, 0);
  const menunggu = (daftar ?? []).filter((t) => t.statusTransaksi === "pending").length;

  return (
    <>
      <JudulHalaman
        judul="Transaksi"
        deskripsi="Setiap notifikasi pembayaran dari Midtrans tercatat di sini secara otomatis."
        aksi={
          supabaseAktif ? (
            <button type="button" onClick={() => void muat()} disabled={memuat} className="btn btn-outline btn-md">
              <RefreshCw size={16} className={memuat ? "animate-spin" : ""} />
              Muat ulang
            </button>
          ) : null
        }
      />

      {!supabaseAktif ? (
        <Kosong
          judul="Butuh Supabase & Midtrans"
          deskripsi="Histori transaksi hanya tersedia setelah Supabase dan Midtrans dikonfigurasi. Lihat docs/SETUP-PEMBAYARAN.md."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KartuStat label="Total diterima" nilai={rupiah(totalLunas, true)} catatan={`${lunas.length} transaksi lunas`} nada="baik" />
            <KartuStat label="Diterima hari ini" nilai={rupiah(lunasHariIni, true)} catatan="Berdasarkan waktu transaksi" />
            <KartuStat label="Menunggu dibayar" nilai={String(menunggu)} catatan="Tagihan yang belum dibayar" />
            <KartuStat label="Semua notifikasi" nilai={String(daftar?.length ?? 0)} catatan="500 terbaru" />
          </div>

          <section className="card mt-6 p-4 sm:p-5">
            <div className="flex flex-wrap gap-2">
              {[
                ["semua", "Semua"],
                ["lunas", "Lunas"],
                ["pending", "Menunggu"],
                ["expire", "Kedaluwarsa"],
                ["cancel", "Dibatalkan"],
                ["refund", "Dikembalikan"],
              ].map(([nilai, label]) => (
                <button
                  key={nilai}
                  type="button"
                  onClick={() => setSaring(nilai)}
                  aria-pressed={saring === nilai}
                  className={`chip transition-colors ${
                    saring === nilai
                      ? "border-brand-700 bg-brand-700 text-white"
                      : "border-line-strong bg-white text-ink-soft hover:border-brand-300 hover:bg-brand-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {galat ? (
            <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{galat}</p>
          ) : daftar === null ? (
            <p className="mt-6 text-sm text-ink-muted">Memuat transaksi…</p>
          ) : tampil.length === 0 ? (
            <div className="mt-6">
              <Kosong judul="Belum ada transaksi" deskripsi="Transaksi muncul setelah pelanggan membuka pembayaran Midtrans." />
            </div>
          ) : (
            <section className="card mt-6 p-4 sm:p-5">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Pesanan</th>
                      <th>Metode</th>
                      <th>Status</th>
                      <th className="text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tampil.map((t) => (
                      <tr key={t.id}>
                        <td>
                          {waktuRelatif(t.waktuTransaksi ?? t.dibuatPada)}
                          <span className="mt-0.5 block text-[12px] text-ink-muted">{t.midtransOrderId}</span>
                        </td>
                        <td>
                          <span className="font-semibold text-ink">{t.kodePesanan}</span>
                          <span className="mt-0.5 block text-[12px] text-ink-muted">{t.namaPemesan}</span>
                        </td>
                        <td>
                          {t.jenisPembayaran || "—"}
                          {t.keterangan && <span className="mt-0.5 block text-[12px] text-ink-muted">{t.keterangan}</span>}
                        </td>
                        <td>
                          <span className={`chip border-transparent ${gayaStatus[t.statusTransaksi] ?? "bg-kabut text-ink-soft"}`}>
                            {LABEL_TRANSAKSI[t.statusTransaksi] ?? t.statusTransaksi}
                          </span>
                        </td>
                        <td className="text-right font-semibold text-ink">{rupiah(t.jumlah)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
