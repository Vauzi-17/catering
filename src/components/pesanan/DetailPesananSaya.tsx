"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  CreditCard,
  ExternalLink,
  MapPin,
  RefreshCw,
  StickyNote,
} from "lucide-react";
import { PesanForm, TanpaSupabase } from "@/components/akun/KerangkaAuth";
import { IconWhatsapp } from "@/components/Icons";
import { FotoMenu } from "@/components/Placeholder";
import { LencanaBayar, LencanaStatus } from "@/components/pesanan/Lencana";
import { profil } from "@/data/profil";
import { ambilPesananDenganKode } from "@/lib/db";
import { rupiah, tanggalPanjang } from "@/lib/format";
import { bayarDenganSnap, panggilApi } from "@/lib/snap";
import { ALUR_PESANAN, KETERANGAN_STATUS, LABEL_TAHAP, LABEL_TRANSAKSI } from "@/lib/status";
import type { Pesanan } from "@/lib/types";
import { useWajibMasuk } from "@/lib/useWajibMasuk";
import { useData } from "@/store/DataProvider";

function waktuPendek(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

function sisaWaktu(iso: string, sekarang: number) {
  const ms = new Date(iso).getTime() - sekarang;
  if (ms <= 0) return "lewat batas";
  const jam = Math.floor(ms / 3600_000);
  const menit = Math.floor((ms % 3600_000) / 60_000);
  return jam > 0 ? `${jam} jam ${menit} menit lagi` : `${menit} menit lagi`;
}

export function DetailPesananSaya({ kode }: { kode: string }) {
  const auth = useWajibMasuk();
  const { menus } = useData();
  const params = useSearchParams();
  const baru = params.get("baru") === "1";
  const galatAwal = params.get("galat") ?? "";

  const [p, setP] = useState<Pesanan | null | undefined>(undefined);
  const [sibuk, setSibuk] = useState<"" | "bayar" | "cek">("");
  const [pesan, setPesan] = useState<{ jenis: "galat" | "sukses" | "info"; teks: string } | null>(
    galatAwal ? { jenis: "galat", teks: galatAwal } : null,
  );
  const [sekarang, setSekarang] = useState(() => Date.now());

  const muat = useCallback(async () => {
    try {
      setP(await ambilPesananDenganKode(kode));
    } catch {
      setPesan({ jenis: "galat", teks: "Pesanan gagal dimuat. Muat ulang halaman." });
    }
  }, [kode]);

  useEffect(() => {
    if (auth.pengguna) void muat();
  }, [auth.pengguna, muat]);

  const menungguBayar = p?.status === "Menunggu Pembayaran";

  // Selama menunggu pembayaran, baca ulang status setiap 8 detik (webhook
  // Midtrans memperbarui basis data di belakang layar).
  useEffect(() => {
    if (!menungguBayar) return;
    const t = window.setInterval(() => {
      setSekarang(Date.now());
      if (document.visibilityState === "visible") void muat();
    }, 8000);
    return () => window.clearInterval(t);
  }, [menungguBayar, muat]);

  async function bayar() {
    setSibuk("bayar");
    setPesan(null);
    try {
      const { ok, data } = await panggilApi<{ token?: string; redirectUrl?: string }>(
        `/api/pesanan/${kode}/bayar/`,
        await auth.token(),
      );
      if (!ok || !data.token || !data.redirectUrl) {
        setPesan({ jenis: "galat", teks: data.galat ?? "Tagihan gagal dibuat. Coba lagi." });
        return;
      }
      await bayarDenganSnap(data.token, data.redirectUrl);
      await cek(true);
    } catch {
      setPesan({ jenis: "galat", teks: "Tidak dapat terhubung ke server." });
    } finally {
      setSibuk("");
    }
  }

  async function cek(diam = false) {
    if (!diam) setSibuk("cek");
    try {
      await panggilApi(`/api/pesanan/${kode}/sinkron/`, await auth.token());
      await muat();
      if (!diam) setPesan({ jenis: "info", teks: "Status pembayaran sudah diperbarui." });
    } catch {
      if (!diam) setPesan({ jenis: "galat", teks: "Gagal memeriksa status pembayaran." });
    } finally {
      if (!diam) setSibuk("");
    }
  }

  if (!auth.aktif) {
    return (
      <div className="container-page py-12">
        <TanpaSupabase />
      </div>
    );
  }
  if (p === undefined) return <div className="container-page py-14 text-sm text-ink-muted">Memuat pesanan…</div>;
  if (p === null) {
    return (
      <div className="container-page py-14">
        <div className="kartu mx-auto max-w-lg p-8 text-center">
          <p className="text-[18px] font-semibold">Pesanan tidak ditemukan</p>
          <p className="mt-2 text-sm text-ink-muted">Pesanan ini tidak ada atau bukan milik akun Anda.</p>
          <Link href="/pesanan/" className="tombol tombol-md tombol-garis mt-6">
            Ke Pesanan Saya
          </Link>
        </div>
      </div>
    );
  }

  const batal = p.status === "Dibatalkan";
  const indeks = ALUR_PESANAN.indexOf(p.status);
  const waktuTahap = (s: string) => p.riwayat.find((r) => r.status === s)?.waktu;
  const lunas = p.statusBayar === "Lunas";

  return (
    <div className="container-page py-8 sm:py-10">
      <Link href="/pesanan/" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-zamrud-700">
        <ArrowLeft size={15} />
        Pesanan Saya
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-semibold tracking-wide sm:text-[36px]">{p.kode}</h1>
          <p className="mt-1 text-[13px] text-ink-muted">Dibuat {waktuPendek(p.dibuatPada)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LencanaStatus status={p.status} />
          <LencanaBayar status={p.statusBayar} />
        </div>
      </div>

      {baru && lunas && (
        <div className="mt-5">
          <PesanForm jenis="sukses">Pembayaran berhasil. Pesanan Anda sudah masuk antrean dapur.</PesanForm>
        </div>
      )}
      {pesan && (
        <div className="mt-5">
          <PesanForm jenis={pesan.jenis}>{pesan.teks}</PesanForm>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          {menungguBayar && (
            <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-jingga-700 to-jingga-500 p-6 text-white sm:p-7">
              <p className="text-[14px] font-medium text-white/85">Total yang harus dibayar</p>
              <p className="mt-1 font-display text-[38px] font-semibold leading-none tabular-nums">{rupiah(p.total)}</p>
              {p.batasBayar && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-white/85">
                  <Clock size={14} />
                  Bayar sebelum {waktuPendek(p.batasBayar)} ({sisaWaktu(p.batasBayar, sekarang)})
                </p>
              )}
              {p.statusBayar === "Gagal" && (
                <p className="mt-2 text-[13px] font-semibold">Pembayaran sebelumnya gagal. Silakan coba lagi.</p>
              )}
              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <button type="button" onClick={bayar} disabled={sibuk !== ""} className="tombol tombol-lg bg-white text-jingga-800 hover:bg-jingga-50">
                  <CreditCard size={18} />
                  {sibuk === "bayar" ? "Membuka pembayaran…" : "Bayar Sekarang"}
                </button>
                <button type="button" onClick={() => void cek()} disabled={sibuk !== ""} className="tombol tombol-lg border border-white/40 text-white hover:bg-white/10">
                  <RefreshCw size={17} className={sibuk === "cek" ? "animate-spin" : ""} />
                  Sudah bayar? Cek status
                </button>
              </div>
            </section>
          )}

          {batal && (
            <PesanForm jenis="info">
              {p.statusBayar === "Kedaluwarsa"
                ? "Pesanan dibatalkan karena pembayaran melewati batas waktu. Anda masih bisa membayar ulang bila jadwal acara belum lewat."
                : KETERANGAN_STATUS.Dibatalkan}
            </PesanForm>
          )}
          {batal && p.statusBayar === "Kedaluwarsa" && (
            <button type="button" onClick={bayar} disabled={sibuk !== ""} className="tombol tombol-md tombol-jingga">
              <CreditCard size={17} />
              Bayar ulang
            </button>
          )}

          {!batal && (
            <section className="kartu p-5 sm:p-7">
              <h2 className="font-sans text-[17px] font-semibold">Tahapan pesanan</h2>
              <p className="mt-1 text-[13px] text-ink-muted">{KETERANGAN_STATUS[p.status]}</p>
              <ol className="mt-6">
                {ALUR_PESANAN.map((tahap, i) => {
                  const selesai = i < indeks || p.status === "Selesai";
                  const berjalan = i === indeks && p.status !== "Selesai";
                  const waktu = waktuTahap(tahap);
                  return (
                    <li key={tahap} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < ALUR_PESANAN.length - 1 && (
                        <span className={`absolute left-[13px] top-8 h-[calc(100%-2rem)] w-px ${selesai ? "bg-zamrud-200" : "bg-kabut-line"}`} aria-hidden="true" />
                      )}
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                          selesai
                            ? "bg-zamrud-700 text-white"
                            : berjalan
                              ? "border-2 border-zamrud-600 bg-white text-zamrud-700"
                              : "border border-kabut-line bg-white text-ink-muted"
                        }`}
                      >
                        {selesai ? <Check size={14} strokeWidth={2.5} /> : i + 1}
                      </span>
                      <div className="flex flex-1 flex-wrap items-start justify-between gap-2 pt-0.5">
                        <p className={`text-[15px] font-semibold ${selesai || berjalan ? "text-ink" : "text-ink-muted"}`}>
                          {LABEL_TAHAP[tahap]}
                        </p>
                        {waktu && (selesai || berjalan) ? (
                          <span className="text-[12px] text-ink-muted">{waktuPendek(waktu)}</span>
                        ) : berjalan ? (
                          <span className="rounded-full bg-jingga-50 px-2.5 py-0.5 text-[11px] font-semibold text-jingga-700">Sedang berjalan</span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          <section className="kartu p-5 sm:p-7">
            <h2 className="font-sans text-[17px] font-semibold">Rincian pesanan</h2>
            <ul className="mt-4 space-y-3">
              {p.items.map((it) => (
                <li key={it.menuId + it.nama} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 overflow-hidden rounded-lg">
                    <FotoMenu src={menus.find((m) => m.id === it.menuId)?.foto} nama={it.nama} rasio="aspect-square" mini />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold">{it.nama}</span>
                    <span className="text-[12px] text-ink-muted">
                      {it.qty} × {rupiah(it.harga)}
                    </span>
                  </span>
                  <span className="shrink-0 text-[14px] font-semibold tabular-nums">{rupiah(it.harga * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-end justify-between border-t border-kabut-line pt-4">
              <span className="text-[14px] text-ink-soft">Total (ongkir gratis)</span>
              <span className="text-[22px] font-bold tabular-nums text-zamrud-800">{rupiah(p.total)}</span>
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          <section className="kartu space-y-4 p-5 sm:p-6 text-[14px]">
            <h2 className="font-sans text-[17px] font-semibold">Jadwal & lokasi</h2>
            <p className="flex gap-2.5">
              <CalendarDays size={17} className="mt-0.5 shrink-0 text-zamrud-700" />
              <span>
                {tanggalPanjang(p.tanggalAcara)}
                <span className="block text-ink-muted">Pukul {p.waktuAntar.replace(":", ".")} WIB · {p.metode}</span>
              </span>
            </p>
            <p className="flex gap-2.5">
              <MapPin size={17} className="mt-0.5 shrink-0 text-zamrud-700" />
              <span>
                {p.alamat}
                {p.patokan && <span className="block text-ink-muted">Patokan: {p.patokan}</span>}
                {p.lat != null && p.lng != null && (
                  <a
                    href={`https://www.google.com/maps?q=${p.lat},${p.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-zamrud-700 hover:underline"
                  >
                    Lihat di peta <ExternalLink size={12} />
                  </a>
                )}
              </span>
            </p>
            {p.catatan && (
              <p className="flex gap-2.5">
                <StickyNote size={17} className="mt-0.5 shrink-0 text-zamrud-700" />
                <span className="text-ink-soft">{p.catatan}</span>
              </p>
            )}
          </section>

          <section className="kartu p-5 sm:p-6 text-[14px]">
            <h2 className="font-sans text-[17px] font-semibold">Pembayaran</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Status</dt>
                <dd>{p.statusBayar ? <LencanaBayar status={p.statusBayar} /> : "Manual"}</dd>
              </div>
              {p.metodeBayar && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Metode</dt>
                  <dd className="text-right font-semibold">{p.metodeBayar}</dd>
                </div>
              )}
              {p.dibayarPada && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Dibayar</dt>
                  <dd className="text-right">{waktuPendek(p.dibayarPada)}</dd>
                </div>
              )}
            </dl>
            {p.pembayaran && p.pembayaran.length > 0 && (
              <>
                <h3 className="mt-5 font-sans text-[13px] font-semibold text-ink-soft">Histori transaksi</h3>
                <ul className="mt-2 divide-y divide-kabut-line rounded-xl bg-kabut px-3.5 text-[13px]">
                  {p.pembayaran.map((b) => (
                    <li key={b.id} className="flex justify-between gap-3 py-2.5">
                      <span>
                        <span className="block font-semibold">{LABEL_TRANSAKSI[b.statusTransaksi] ?? b.statusTransaksi}</span>
                        <span className="text-ink-muted">{b.jenisPembayaran || "—"}</span>
                      </span>
                      <span className="shrink-0 text-right text-ink-muted">{waktuPendek(b.waktuTransaksi ?? b.dibuatPada)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <a
            href={`https://wa.me/${profil.teleponRaw}?text=${encodeURIComponent(`Halo Asri Catering, saya ingin menanyakan pesanan ${p.kode}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="tombol tombol-blok tombol-zamrud"
          >
            <IconWhatsapp width={18} height={18} />
            Tanya admin via WhatsApp
          </a>
        </aside>
      </div>
    </div>
  );
}
