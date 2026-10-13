"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Download, LoaderCircle } from "lucide-react";
import QRCode from "qrcode";
import { rupiah } from "@/lib/format";
import { periksaQris } from "@/lib/pembayaran";

function sisaWaktu(iso: string, sekarang: number) {
  const ms = new Date(iso).getTime() - sekarang;
  if (ms <= 0) return "lewat batas";
  const jam = Math.floor(ms / 3600_000);
  const menit = Math.floor((ms % 3600_000) / 60_000);
  return jam > 0 ? `${jam} jam ${menit} menit lagi` : `${menit} menit lagi`;
}

function waktuPendek(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

/** Gambar PNG berisi QR, nama toko, nominal, dan kode pesanan untuk disimpan ke galeri. */
async function gambarUntukDisimpan(payload: string, nama: string, nominal: string, kode: string): Promise<string> {
  const qr = new Image();
  qr.src = await QRCode.toDataURL(payload, { width: 640, margin: 2, errorCorrectionLevel: "M" });
  await new Promise((selesai) => (qr.onload = selesai));
  const kanvas = document.createElement("canvas");
  kanvas.width = 720;
  kanvas.height = 940;
  const ctx = kanvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, kanvas.width, kanvas.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#1f2a24";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText(nama, 360, 70);
  ctx.drawImage(qr, 40, 100, 640, 640);
  ctx.font = "bold 52px sans-serif";
  ctx.fillText(nominal, 360, 815);
  ctx.fillStyle = "#5b6660";
  ctx.font = "26px sans-serif";
  ctx.fillText(`Pesanan ${kode} · bayar persis sesuai nominal`, 360, 870);
  return kanvas.toDataURL("image/png");
}

export function KartuQris({
  kode,
  payload,
  nominal,
  kodeUnik,
  batasBayar,
  diklaim,
  onKlaim,
  sibuk,
}: {
  kode: string;
  payload: string;
  nominal: number;
  kodeUnik: number;
  batasBayar: string | null;
  diklaim: boolean;
  onKlaim: () => void;
  sibuk: boolean;
}) {
  const [svg, setSvg] = useState("");
  const [sekarang, setSekarang] = useState(() => Date.now());
  const [menyimpan, setMenyimpan] = useState(false);
  const nama = useMemo(() => {
    try {
      return periksaQris(payload).nama;
    } catch {
      return "Asri Catering";
    }
  }, [payload]);

  useEffect(() => {
    let batal = false;
    void QRCode.toString(payload, { type: "svg", margin: 1, errorCorrectionLevel: "M" }).then((s) => {
      if (!batal) setSvg(s);
    });
    return () => {
      batal = true;
    };
  }, [payload]);

  useEffect(() => {
    const t = window.setInterval(() => setSekarang(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const teksNominal = rupiah(nominal);
  const depan = teksNominal.slice(0, -3);
  const belakang = teksNominal.slice(-3);

  async function simpan() {
    setMenyimpan(true);
    try {
      const a = document.createElement("a");
      a.href = await gambarUntukDisimpan(payload, nama, teksNominal, kode);
      a.download = `QRIS-${kode}.png`;
      a.click();
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-kabut-line bg-white" aria-label="Pembayaran QRIS">
      <div className="bg-gradient-to-br from-jingga-700 to-jingga-500 px-6 py-5 text-white sm:px-7">
        <p className="text-[14px] font-medium text-white/85">Total yang harus dibayar</p>
        <p className="mt-1 font-display text-[38px] font-semibold leading-none tabular-nums" data-nominal={nominal}>
          {depan}
          <span className="rounded-md bg-white/20 px-1">{belakang}</span>
        </p>
        <p className="mt-2 text-[13px] text-white/85">
          Termasuk kode unik {rupiah(kodeUnik)}. Bayar persis sampai tiga digit terakhir supaya pembayaran terdeteksi otomatis.
        </p>
        {batasBayar && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-white/85">
            <Clock size={14} />
            Bayar sebelum {waktuPendek(batasBayar)} ({sisaWaktu(batasBayar, sekarang)})
          </p>
        )}
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-[240px_1fr] sm:p-7">
        <div className="mx-auto w-full max-w-[260px]">
          <div className="rounded-xl border border-kabut-line p-3">
            <p className="text-center text-[12px] font-bold uppercase tracking-wide text-ink-soft">{nama}</p>
            {svg ? (
              <div className="mt-2 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
            ) : (
              <div className="mt-2 flex aspect-square items-center justify-center bg-kabut">
                <LoaderCircle size={22} className="animate-spin text-ink-muted" />
              </div>
            )}
            <p className="mt-1 text-center text-[11px] font-semibold tracking-[0.2em] text-ink-muted">QRIS</p>
          </div>
        </div>

        <div className="min-w-0">
          <ol className="space-y-3 text-[14px] text-ink-soft">
            {[
              "Buka aplikasi m-banking atau e-wallet apa pun, lalu pilih Scan / QRIS.",
              "Membuka halaman ini di HP? Simpan gambar QR, lalu pilih dari galeri di menu scan aplikasi pembayaran.",
              "Nominal sudah terisi otomatis. Status pesanan berubah sendiri begitu pembayaran kami terima.",
            ].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zamrud-50 text-[12px] font-bold text-zamrud-700">
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap [&>button]:whitespace-nowrap">
            <button type="button" onClick={() => void simpan()} disabled={menyimpan} className="tombol tombol-md tombol-jingga">
              <Download size={17} />
              {menyimpan ? "Menyiapkan…" : "Simpan gambar QR"}
            </button>
            {!diklaim && (
              <button type="button" onClick={onKlaim} disabled={sibuk} className="tombol tombol-md tombol-garis">
                <CheckCircle2 size={17} />
                Saya sudah bayar
              </button>
            )}
          </div>
          {diklaim && (
            <p className="mt-4 rounded-xl bg-zamrud-50 px-4 py-3 text-[13px] text-zamrud-800">
              Terima kasih. Kami sedang memastikan pembayaran Anda; halaman ini akan berubah sendiri begitu terkonfirmasi.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
