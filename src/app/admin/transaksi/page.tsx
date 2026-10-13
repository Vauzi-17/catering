"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { JudulHalaman } from "@/components/admin/AdminShell";
import { KartuStat } from "@/components/admin/Bagian";
import { Kosong } from "@/components/Ui";
import { ambilNotifikasiQris, ambilTransaksi, type NotifikasiQris, type TransaksiAdmin } from "@/lib/db";
import { rupiah, waktuRelatif } from "@/lib/format";
import { LABEL_TRANSAKSI } from "@/lib/status";
import { supabaseAktif } from "@/lib/supabase";

const LABEL_HASIL: Record<NotifikasiQris["hasil"], { teks: string; gaya: string }> = {
  cocok: { teks: "Cocok", gaya: "bg-zamrud-100 text-zamrud-800" },
  ganda: { teks: "Ganda", gaya: "bg-kabut-deep text-ink-muted" },
  tidak_cocok: { teks: "Tidak cocok", gaya: "bg-amber-100 text-amber-900" },
  tanpa_nominal: { teks: "Tanpa nominal", gaya: "bg-kabut-deep text-ink-muted" },
};

export default function HalamanTransaksi() {
  const [tab, setTab] = useState<"bayar" | "notif">("bayar");
  const [daftar, setDaftar] = useState<TransaksiAdmin[] | null>(null);
  const [notif, setNotif] = useState<NotifikasiQris[] | null>(null);
  const [galat, setGalat] = useState("");
  const [memuat, setMemuat] = useState(false);

  const muat = useCallback(async () => {
    if (!supabaseAktif) return;
    setMemuat(true);
    setGalat("");
    try {
      const [t, n] = await Promise.all([ambilTransaksi(), ambilNotifikasiQris().catch(() => [])]);
      setDaftar(t);
      setNotif(n);
    } catch {
      setGalat("Histori transaksi gagal dimuat.");
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  const hariIni = new Date().toISOString().slice(0, 10);
  const semua = daftar ?? [];
  const total = semua.reduce((a, t) => a + t.jumlah, 0);
  const hariIniTotal = semua
    .filter((t) => (t.waktuTransaksi ?? t.dibuatPada).slice(0, 10) === hariIni)
    .reduce((a, t) => a + t.jumlah, 0);
  const otomatis = semua.filter((t) => t.statusTransaksi === "settlement").length;
  const perluCek = useMemo(() => (notif ?? []).filter((n) => n.hasil === "tidak_cocok").length, [notif]);

  return (
    <>
      <JudulHalaman
        judul="Transaksi"
        deskripsi="Pembayaran QRIS yang sudah diterima, otomatis dari notifikasi maupun konfirmasi admin."
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
          judul="Butuh Supabase"
          deskripsi="Histori transaksi hanya tersedia setelah Supabase dikonfigurasi. Lihat docs/SETUP-PEMBAYARAN.md."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KartuStat label="Total diterima" nilai={rupiah(total, true)} catatan={`${semua.length} transaksi`} nada="baik" />
            <KartuStat label="Diterima hari ini" nilai={rupiah(hariIniTotal, true)} catatan="Berdasarkan waktu lunas" />
            <KartuStat
              label="Terkonfirmasi otomatis"
              nilai={semua.length ? `${Math.round((otomatis / semua.length) * 100)}%` : "—"}
              catatan="Sisanya dikonfirmasi admin"
            />
            <KartuStat label="Notifikasi tidak cocok" nilai={String(perluCek)} catatan="Perlu dicek manual" />
          </div>

          <div className="mt-6 flex gap-2" role="tablist">
            {(
              [
                ["bayar", "Pembayaran diterima"],
                ["notif", "Notifikasi masuk"],
              ] as const
            ).map(([nilai, label]) => (
              <button
                key={nilai}
                type="button"
                role="tab"
                aria-selected={tab === nilai}
                onClick={() => setTab(nilai)}
                className={`chip transition-colors ${
                  tab === nilai
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-line-strong bg-white text-ink-soft hover:border-brand-300 hover:bg-brand-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {galat ? (
            <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{galat}</p>
          ) : daftar === null ? (
            <p className="mt-6 text-sm text-ink-muted">Memuat transaksi…</p>
          ) : tab === "bayar" ? (
            semua.length === 0 ? (
              <div className="mt-6">
                <Kosong judul="Belum ada pembayaran" deskripsi="Pembayaran muncul di sini begitu pesanan pertama lunas." />
              </div>
            ) : (
              <section className="card mt-4 p-4 sm:p-5">
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Waktu</th>
                        <th>Pesanan</th>
                        <th>Sumber</th>
                        <th>Keterangan</th>
                        <th className="text-right">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semua.map((t) => (
                        <tr key={t.id}>
                          <td>{waktuRelatif(t.waktuTransaksi ?? t.dibuatPada)}</td>
                          <td>
                            <span className="font-semibold text-ink">{t.kodePesanan}</span>
                            <span className="mt-0.5 block text-[12px] text-ink-muted">{t.namaPemesan}</span>
                          </td>
                          <td>
                            <span
                              className={`chip border-transparent ${
                                t.statusTransaksi === "manual" ? "bg-kabut-deep text-ink-soft" : "bg-zamrud-100 text-zamrud-800"
                              }`}
                            >
                              {LABEL_TRANSAKSI[t.statusTransaksi] ?? t.statusTransaksi}
                            </span>
                            <span className="mt-0.5 block text-[12px] text-ink-muted">{t.jenisPembayaran || "QRIS"}</span>
                          </td>
                          <td className="max-w-[320px] text-[13px] text-ink-soft">{t.keterangan || "—"}</td>
                          <td className="text-right font-semibold text-ink">{rupiah(t.jumlah)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )
          ) : (notif ?? []).length === 0 ? (
            <div className="mt-6">
              <Kosong
                judul="Belum ada notifikasi"
                deskripsi="Notifikasi dari HP pemilik muncul di sini. Atur penerusnya di menu Pembayaran QRIS."
              />
            </div>
          ) : (
            <section className="card mt-4 p-4 sm:p-5">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Diterima</th>
                      <th>Isi notifikasi</th>
                      <th className="text-right">Nominal</th>
                      <th>Hasil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(notif ?? []).map((n) => (
                      <tr key={n.id}>
                        <td>
                          {waktuRelatif(n.diterimaPada)}
                          {n.aplikasi && <span className="mt-0.5 block text-[12px] text-ink-muted">{n.aplikasi}</span>}
                        </td>
                        <td className="max-w-[380px] text-[13px] text-ink-soft">{n.teks}</td>
                        <td className="text-right font-semibold text-ink">{n.nominal ? rupiah(n.nominal) : "—"}</td>
                        <td>
                          <span className={`chip border-transparent ${LABEL_HASIL[n.hasil].gaya}`}>{LABEL_HASIL[n.hasil].teks}</span>
                          {n.kodePesanan && (
                            <span className="mt-0.5 block text-[12px] font-semibold text-ink">{n.kodePesanan}</span>
                          )}
                          {n.hasil === "tidak_cocok" && (
                            <Link href="/admin/pesanan/" className="mt-0.5 block text-[12px] font-semibold text-brand-700 hover:underline">
                              Konfirmasi manual
                            </Link>
                          )}
                        </td>
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
