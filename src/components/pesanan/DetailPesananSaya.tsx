"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ExternalLink,
  MapPin,
  QrCode,
  StickyNote,
} from "lucide-react";
import { PesanForm, TanpaSupabase } from "@/components/akun/KerangkaAuth";
import { IconWhatsapp } from "@/components/Icons";
import { FotoMenu } from "@/components/Placeholder";
import { KartuQris } from "@/components/pesanan/KartuQris";
import { LencanaBayar, LencanaStatus } from "@/components/pesanan/Lencana";
import { profil } from "@/data/profil";
import { ambilPesananDenganKode } from "@/lib/db";
import { rupiah } from "@/lib/format";
import { panggilApi } from "@/lib/api-klien";
import { ALUR_PESANAN } from "@/lib/status";
import { keteranganStatus, labelTahap, tanggalPanjangB, teksMenu, waktuPendekB } from "@/lib/teks";
import type { Pesanan } from "@/lib/types";
import { useWajibMasuk } from "@/lib/useWajibMasuk";
import { useBahasa } from "@/store/BahasaProvider";
import { useData } from "@/store/DataProvider";

export function DetailPesananSaya({ kode }: { kode: string }) {
  const auth = useWajibMasuk();
  const { menus } = useData();
  const { bahasa, t } = useBahasa();
  const waktuPendek = (iso: string) => waktuPendekB(iso, bahasa);
  const namaItem = (menuId: string, nama: string) => {
    const m = menus.find((x) => x.id === menuId);
    return m ? teksMenu(m, bahasa).nama : nama;
  };
  const params = useSearchParams();
  const baru = params.get("baru") === "1";
  const galatAwal = params.get("galat") ?? "";

  const [p, setP] = useState<Pesanan | null | undefined>(undefined);
  const [sibuk, setSibuk] = useState<"" | "bayar" | "klaim">("");
  const [pesan, setPesan] = useState<{ jenis: "galat" | "sukses" | "info"; teks: string } | null>(
    galatAwal ? { jenis: "galat", teks: galatAwal } : null,
  );

  const muat = useCallback(async () => {
    try {
      setP(await ambilPesananDenganKode(kode));
    } catch {
      setPesan({ jenis: "galat", teks: t("Pesanan gagal dimuat. Muat ulang halaman.", "Could not load the order. Please reload the page.") });
    }
  }, [kode]);

  useEffect(() => {
    if (auth.pengguna) void muat();
  }, [auth.pengguna, muat]);

  const menungguBayar = p?.status === "Menunggu Pembayaran";

  // Selama menunggu pembayaran, baca ulang status setiap 8 detik: notifikasi
  // pembayaran dari HP pemilik memperbarui basis data di belakang layar.
  useEffect(() => {
    if (!menungguBayar) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") void muat();
    }, 8000);
    return () => window.clearInterval(t);
  }, [menungguBayar, muat]);

  /** Menampilkan QRIS yang masih berlaku, atau membuat QRIS baru bila sudah kedaluwarsa. */
  async function bayar() {
    setSibuk("bayar");
    setPesan(null);
    try {
      const { ok, data } = await panggilApi(`/api/pesanan/${kode}/bayar/`, await auth.token());
      if (!ok) setPesan({ jenis: "galat", teks: data.galat ?? t("QRIS gagal dibuat. Coba lagi.", "Could not create the QRIS. Please try again.") });
      await muat();
    } catch {
      setPesan({ jenis: "galat", teks: t("Tidak dapat terhubung ke server.", "Cannot reach the server.") });
    } finally {
      setSibuk("");
    }
  }

  async function klaim() {
    setSibuk("klaim");
    try {
      await panggilApi(`/api/pesanan/${kode}/klaim/`, await auth.token());
      await muat();
    } catch {
      setPesan({ jenis: "galat", teks: t("Tidak dapat terhubung ke server.", "Cannot reach the server.") });
    } finally {
      setSibuk("");
    }
  }

  if (!auth.aktif) {
    return (
      <div className="container-page py-12">
        <TanpaSupabase />
      </div>
    );
  }
  if (p === undefined) return <div className="container-page py-14 text-sm text-ink-muted">{t("Memuat pesanan…", "Loading order…")}</div>;
  if (p === null) {
    return (
      <div className="container-page py-14">
        <div className="kartu mx-auto max-w-lg p-8 text-center">
          <p className="text-[18px] font-semibold">{t("Pesanan tidak ditemukan", "Order not found")}</p>
          <p className="mt-2 text-sm text-ink-muted">{t("Pesanan ini tidak ada atau bukan milik akun Anda.", "This order does not exist or does not belong to your account.")}</p>
          <Link href="/pesanan/" className="tombol tombol-md tombol-garis mt-6">
            {t("Ke Pesanan Saya", "Go to My Orders")}
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
        {t("Pesanan Saya", "My Orders")}
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-semibold tracking-wide sm:text-[36px]">{p.kode}</h1>
          <p className="mt-1 text-[13px] text-ink-muted">{t("Dibuat", "Created")} {waktuPendek(p.dibuatPada)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LencanaStatus status={p.status} />
          <LencanaBayar status={p.statusBayar} />
        </div>
      </div>

      {baru && lunas && (
        <div className="mt-5">
          <PesanForm jenis="sukses">
            {t("Pembayaran berhasil. Pesanan Anda sudah masuk antrean dapur.", "Payment successful. Your order is in the kitchen queue.")}
          </PesanForm>
        </div>
      )}
      {pesan && (
        <div className="mt-5">
          <PesanForm jenis={pesan.jenis}>{pesan.teks}</PesanForm>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          {menungguBayar && p.qrisDinamis && p.nominalBayar ? (
            <KartuQris
              kode={p.kode}
              payload={p.qrisDinamis}
              nominal={p.nominalBayar}
              kodeUnik={p.kodeUnik ?? 0}
              batasBayar={p.batasBayar ?? null}
              diklaim={Boolean(p.diklaimBayarPada)}
              onKlaim={() => void klaim()}
              sibuk={sibuk !== ""}
            />
          ) : menungguBayar ? (
            <button type="button" onClick={() => void bayar()} disabled={sibuk !== ""} className="tombol tombol-lg tombol-jingga">
              <QrCode size={18} />
              {sibuk === "bayar" ? t("Menyiapkan QRIS…", "Preparing QRIS…") : t("Tampilkan QRIS pembayaran", "Show payment QRIS")}
            </button>
          ) : null}

          {batal && (
            <PesanForm jenis="info">
              {p.statusBayar === "Kedaluwarsa"
                ? t(
                    "Pesanan dibatalkan karena pembayaran melewati batas waktu. Selama jadwal acara masih paling cepat besok, Anda bisa membuat QRIS baru.",
                    "This order was cancelled because the payment deadline passed. As long as the event is tomorrow or later, you can create a new QRIS.",
                  )
                : keteranganStatus("Dibatalkan", bahasa)}
            </PesanForm>
          )}
          {batal && p.statusBayar === "Kedaluwarsa" && (
            <button type="button" onClick={() => void bayar()} disabled={sibuk !== ""} className="tombol tombol-md tombol-jingga">
              <QrCode size={17} />
              {sibuk === "bayar" ? t("Menyiapkan QRIS…", "Preparing QRIS…") : t("Buat QRIS baru", "Create new QRIS")}
            </button>
          )}

          {!batal && (
            <section className="kartu p-5 sm:p-7">
              <h2 className="font-sans text-[17px] font-semibold">{t("Tahapan pesanan", "Order progress")}</h2>
              <p className="mt-1 text-[13px] text-ink-muted">{keteranganStatus(p.status, bahasa)}</p>
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
                          {labelTahap(tahap, bahasa)}
                        </p>
                        {waktu && (selesai || berjalan) ? (
                          <span className="text-[12px] text-ink-muted">{waktuPendek(waktu)}</span>
                        ) : berjalan ? (
                          <span className="rounded-full bg-jingga-50 px-2.5 py-0.5 text-[11px] font-semibold text-jingga-700">{t("Sedang berjalan", "In progress")}</span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          <section className="kartu p-5 sm:p-7">
            <h2 className="font-sans text-[17px] font-semibold">{t("Rincian pesanan", "Order details")}</h2>
            <ul className="mt-4 space-y-3">
              {p.items.map((it) => (
                <li key={it.menuId + it.nama} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 overflow-hidden rounded-lg">
                    <FotoMenu src={menus.find((m) => m.id === it.menuId)?.foto} nama={namaItem(it.menuId, it.nama)} rasio="aspect-square" mini />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold">{namaItem(it.menuId, it.nama)}</span>
                    <span className="text-[12px] text-ink-muted">
                      {it.qty} × {rupiah(it.harga)}
                    </span>
                  </span>
                  <span className="shrink-0 text-[14px] font-semibold tabular-nums">{rupiah(it.harga * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-end justify-between border-t border-kabut-line pt-4">
              <span className="text-[14px] text-ink-soft">{t("Total (ongkir gratis)", "Total (free delivery)")}</span>
              <span className="text-[22px] font-bold tabular-nums text-zamrud-800">{rupiah(p.total)}</span>
            </div>
            {p.kodeUnik ? (
              <p className="mt-1 flex justify-between text-[13px] text-ink-muted">
                <span>{t("Kode unik pembayaran", "Unique payment code")}</span>
                <span className="tabular-nums">+ {rupiah(p.kodeUnik)}</span>
              </p>
            ) : null}
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          <section className="kartu space-y-4 p-5 sm:p-6 text-[14px]">
            <h2 className="font-sans text-[17px] font-semibold">{t("Jadwal & lokasi", "Schedule & location")}</h2>
            <p className="flex gap-2.5">
              <CalendarDays size={17} className="mt-0.5 shrink-0 text-zamrud-700" />
              <span>
                {tanggalPanjangB(p.tanggalAcara, bahasa)}
                <span className="block text-ink-muted">
                  {t("Pukul", "At")} {p.waktuAntar.replace(":", ".")} WIB ·{" "}
                  {p.metode === "Ambil di Tempat" ? t("Ambil di Tempat", "Pick Up") : t("Antar ke Alamat", "Deliver to Address")}
                </span>
              </span>
            </p>
            <p className="flex gap-2.5">
              <MapPin size={17} className="mt-0.5 shrink-0 text-zamrud-700" />
              <span>
                {p.alamat}
                {p.patokan && <span className="block text-ink-muted">{t("Patokan", "Landmark")}: {p.patokan}</span>}
                {p.lat != null && p.lng != null && (
                  <a
                    href={`https://www.google.com/maps?q=${p.lat},${p.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-zamrud-700 hover:underline"
                  >
                    {t("Lihat di peta", "View on map")} <ExternalLink size={12} />
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
            <h2 className="font-sans text-[17px] font-semibold">{t("Pembayaran", "Payment")}</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Status</dt>
                <dd>{p.statusBayar ? <LencanaBayar status={p.statusBayar} /> : "—"}</dd>
              </div>
              {p.metodeBayar && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">{t("Metode", "Method")}</dt>
                  <dd className="text-right font-semibold">{p.metodeBayar}</dd>
                </div>
              )}
              {p.nominalBayar ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">{t("Nominal", "Amount")}</dt>
                  <dd className="text-right font-semibold tabular-nums">{rupiah(p.nominalBayar)}</dd>
                </div>
              ) : null}
              {p.dibayarPada && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">{t("Dibayar", "Paid")}</dt>
                  <dd className="text-right">{waktuPendek(p.dibayarPada)}</dd>
                </div>
              )}
            </dl>
            {p.pembayaran && p.pembayaran.length > 0 && (
              <>
                <h3 className="mt-5 font-sans text-[13px] font-semibold text-ink-soft">{t("Histori transaksi", "Transaction history")}</h3>
                <ul className="mt-2 divide-y divide-kabut-line rounded-xl bg-kabut px-3.5 text-[13px]">
                  {p.pembayaran.map((b) => (
                    <li key={b.id} className="flex justify-between gap-3 py-2.5">
                      <span>
                        <span className="block font-semibold">
                          {b.statusTransaksi === "manual" ? t("Konfirmasi admin", "Confirmed by admin") : t("Otomatis", "Automatic")}
                        </span>
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
            href={`https://wa.me/${profil.teleponRaw}?text=${encodeURIComponent(t(`Halo Asri Catering, saya ingin menanyakan pesanan ${p.kode}.`, `Hello Asri Catering, I have a question about order ${p.kode}.`))}`}
            target="_blank"
            rel="noreferrer"
            className="tombol tombol-blok tombol-zamrud"
          >
            <IconWhatsapp width={18} height={18} />
            {t("Tanya admin via WhatsApp", "Ask us on WhatsApp")}
          </a>
        </aside>
      </div>
    </div>
  );
}
