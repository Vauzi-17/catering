"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Copy, ImageUp, LoaderCircle, TriangleAlert } from "lucide-react";
import QRCode from "qrcode";
import { JudulHalaman } from "@/components/admin/AdminShell";
import { Kosong } from "@/components/Ui";
import { panggilApi } from "@/lib/api-klien";
import { ambilQrisToko, simpanQrisToko } from "@/lib/db";
import { rupiah } from "@/lib/format";
import { nominalDariTeks, periksaQris, qrisBernominal, type InfoQris } from "@/lib/pembayaran";
import { supabaseAktif } from "@/lib/supabase";
import { useAuth } from "@/store/AuthProvider";
import { useData } from "@/store/DataProvider";

/** Membaca isi kode QR dari foto/tangkapan layar QRIS. */
async function bacaQrDariGambar(berkas: File): Promise<string> {
  const { default: jsQR } = await import("jsqr");
  const gambar = await createImageBitmap(berkas);
  const skala = Math.min(1, 1400 / Math.max(gambar.width, gambar.height));
  const kanvas = document.createElement("canvas");
  kanvas.width = Math.round(gambar.width * skala);
  kanvas.height = Math.round(gambar.height * skala);
  const ctx = kanvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(gambar, 0, 0, kanvas.width, kanvas.height);
  gambar.close();
  const data = ctx.getImageData(0, 0, kanvas.width, kanvas.height);
  const hasil = jsQR(data.data, data.width, data.height, { inversionAttempts: "attemptBoth" });
  if (!hasil?.data) throw new Error("Kode QR tidak terbaca. Pakai foto yang lebih jelas atau tangkapan layar dari aplikasi.");
  return hasil.data;
}

function PratinjauQr({ isi, judul, keterangan }: { isi: string; judul: string; keterangan?: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    void QRCode.toString(isi, { type: "svg", margin: 1 }).then(setSvg);
  }, [isi]);
  return (
    <figure className="w-full max-w-[220px] rounded-xl border border-line p-3">
      <figcaption className="text-center text-[12px] font-bold uppercase tracking-wide text-ink-soft">{judul}</figcaption>
      <div className="mt-2 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      {keterangan && <p className="mt-1 text-center text-[12px] text-ink-muted">{keterangan}</p>}
    </figure>
  );
}

export default function HalamanPembayaranQris() {
  const auth = useAuth();
  const { pesanan } = useData();
  const masukan = useRef<HTMLInputElement>(null);

  const [tersimpan, setTersimpan] = useState<string | null>(null);
  const [calon, setCalon] = useState("");
  const [teksManual, setTeksManual] = useState("");
  const [pesan, setPesan] = useState<{ jenis: "galat" | "sukses"; teks: string } | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [tokenTerpasang, setTokenTerpasang] = useState<boolean | null>(null);
  const [contoh, setContoh] = useState("Pembayaran QRIS Rp150.237 berhasil diterima");
  const [tersalin, setTersalin] = useState(false);

  const muat = useCallback(async () => {
    if (!supabaseAktif) return;
    try {
      setTersimpan(await ambilQrisToko());
    } catch {
      setTersimpan("");
    }
    try {
      const { ok, data } = await panggilApi<{ tokenTerpasang?: boolean }>("/api/qris/status/", await auth.token(), undefined, "GET");
      setTokenTerpasang(ok ? Boolean(data.tokenTerpasang) : null);
    } catch {
      setTokenTerpasang(null);
    }
  }, [auth]);

  useEffect(() => {
    void muat();
  }, [muat]);

  const info: InfoQris | null = useMemo(() => {
    if (!tersimpan) return null;
    try {
      return periksaQris(tersimpan);
    } catch {
      return null;
    }
  }, [tersimpan]);

  const infoCalon: InfoQris | { galat: string } | null = useMemo(() => {
    if (!calon) return null;
    try {
      return periksaQris(calon);
    } catch (e) {
      return { galat: (e as Error).message };
    }
  }, [calon]);

  async function pilihGambar(e: React.ChangeEvent<HTMLInputElement>) {
    const berkas = e.target.files?.[0];
    e.target.value = "";
    if (!berkas) return;
    setPesan(null);
    setSibuk(true);
    try {
      setCalon(await bacaQrDariGambar(berkas));
    } catch (err) {
      setPesan({ jenis: "galat", teks: (err as Error).message });
    } finally {
      setSibuk(false);
    }
  }

  async function simpan() {
    if (!calon || !infoCalon || "galat" in infoCalon) return;
    if (!infoCalon.statis) {
      setPesan({ jenis: "galat", teks: "QR ini sudah berisi nominal. Gunakan QRIS statis toko (yang biasa ditempel di kasir)." });
      return;
    }
    setSibuk(true);
    try {
      await simpanQrisToko(calon.trim());
      setTersimpan(calon.trim());
      setCalon("");
      setTeksManual("");
      setPesan({ jenis: "sukses", teks: `QRIS ${infoCalon.nama} tersimpan. Pesanan baru akan memakai QRIS ini.` });
    } catch {
      setPesan({ jenis: "galat", teks: "QRIS gagal disimpan. Pastikan 09-qris.sql sudah dijalankan." });
    } finally {
      setSibuk(false);
    }
  }

  const alamatNotif = typeof window === "undefined" ? "" : `${window.location.origin}/api/qris/notifikasi/`;
  const nominalContoh = nominalDariTeks(contoh);
  const cocokContoh = pesanan.filter(
    (p) => p.statusBayar === "Menunggu" && p.nominalBayar && nominalContoh.includes(Math.round(p.nominalBayar)),
  );

  if (!supabaseAktif) {
    return (
      <>
        <JudulHalaman judul="Pembayaran QRIS" deskripsi="QRIS toko dan konfirmasi pembayaran otomatis." />
        <Kosong judul="Butuh Supabase" deskripsi="Pembayaran QRIS hanya tersedia setelah Supabase dikonfigurasi." />
      </>
    );
  }

  return (
    <>
      <JudulHalaman
        judul="Pembayaran QRIS"
        deskripsi="QRIS milik usaha dipakai untuk membuat QR bernominal di setiap pesanan. Pembayaran dikonfirmasi otomatis dari notifikasi di HP pemilik."
      />

      {pesan && (
        <p
          className={`mb-5 flex items-start gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
            pesan.jenis === "galat" ? "bg-red-50 text-red-700" : "bg-brand-50 text-brand-800"
          }`}
        >
          {pesan.jenis === "galat" ? <TriangleAlert size={17} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={17} className="mt-0.5 shrink-0" />}
          {pesan.teks}
        </p>
      )}

      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-xl">1. QRIS toko</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Unggah foto atau tangkapan layar QRIS statis dari GoBiz, aplikasi bank, atau stiker kasir. QRIS harus atas nama usaha
          karena dana masuk ke rekening pemiliknya.
        </p>

        <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-start">
          {tersimpan === null ? (
            <p className="text-sm text-ink-muted">Memuat…</p>
          ) : info && tersimpan ? (
            <>
              <PratinjauQr isi={tersimpan} judul={info.nama} keterangan={info.kota} />
              <PratinjauQr isi={qrisBernominal(tersimpan, 10000)} judul="Contoh Rp 10.000" keterangan="Untuk uji scan, tidak perlu dibayar" />
              <div className="text-sm text-ink-soft md:max-w-xs">
                <p className="font-semibold text-ink">QRIS aktif: {info.nama}</p>
                <p className="mt-2">
                  Scan &ldquo;Contoh Rp 10.000&rdquo; dengan aplikasi pembayaran. Bila nama toko dan nominal Rp 10.000 tampil, QRIS siap dipakai.
                  Batalkan saja, tidak perlu dibayar.
                </p>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Belum ada QRIS tersimpan. Pelanggan belum bisa membayar sampai QRIS diunggah.
            </p>
          )}
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => masukan.current?.click()} disabled={sibuk} className="btn btn-outline btn-md">
              {sibuk ? <LoaderCircle size={16} className="animate-spin" /> : <ImageUp size={16} />}
              {tersimpan ? "Ganti dari gambar QR" : "Unggah gambar QR"}
            </button>
          </div>
          <input ref={masukan} type="file" accept="image/*" onChange={pilihGambar} className="hidden" aria-label="Pilih gambar QRIS" />
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-semibold text-ink-soft">Atau tempel isi kode QRIS</summary>
            <textarea
              rows={3}
              className="field mt-2 font-mono text-[12px]"
              value={teksManual}
              onChange={(e) => {
                setTeksManual(e.target.value);
                setCalon(e.target.value.trim());
              }}
              placeholder="000201010211…"
              aria-label="Isi kode QRIS"
            />
          </details>

          {infoCalon && (
            <div className="mt-4 rounded-lg border border-line bg-cream px-4 py-3 text-sm">
              {"galat" in infoCalon ? (
                <p className="font-semibold text-red-700">{infoCalon.galat}</p>
              ) : (
                <>
                  <p>
                    Terbaca: <span className="font-semibold text-ink">{infoCalon.nama}</span>
                    {infoCalon.kota && <> · {infoCalon.kota}</>} · {infoCalon.statis ? "QRIS statis" : "QR bernominal"}
                  </p>
                  {infoCalon.statis ? (
                    <button type="button" onClick={() => void simpan()} disabled={sibuk} className="btn btn-primary btn-sm mt-3">
                      Simpan QRIS ini
                    </button>
                  ) : (
                    <p className="mt-2 font-semibold text-red-700">
                      QR ini sudah berisi nominal. Gunakan QRIS statis toko (yang biasa ditempel di kasir).
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="font-display text-xl">2. Konfirmasi otomatis dari HP</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Aplikasi otomasi di HP Android pemilik (mis. MacroDroid) meneruskan notifikasi &ldquo;pembayaran diterima&rdquo; dari
          GoBiz atau bank ke alamat di bawah. Panduan lengkap ada di <code>docs/SETUP-PEMBAYARAN.md</code>.
        </p>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">Alamat penerima</dt>
            <dd className="mt-1 flex items-center gap-2">
              <code className="min-w-0 truncate rounded bg-cream px-2 py-1 text-[12px]">{alamatNotif}</code>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(alamatNotif);
                  setTersalin(true);
                  window.setTimeout(() => setTersalin(false), 1500);
                }}
                className="btn btn-ghost btn-sm"
                aria-label="Salin alamat penerima"
              >
                <Copy size={15} />
                {tersalin ? "Tersalin" : "Salin"}
              </button>
            </dd>
          </div>
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">Token rahasia di server</dt>
            <dd className="mt-1">
              {tokenTerpasang === null ? (
                <span className="text-ink-muted">Tidak dapat diperiksa</span>
              ) : tokenTerpasang ? (
                <span className="font-semibold text-brand-700">Terpasang (QRIS_NOTIF_TOKEN)</span>
              ) : (
                <span className="font-semibold text-red-700">Belum diisi. Tambahkan QRIS_NOTIF_TOKEN di Vercel lalu redeploy.</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-line pt-5">
          <label className="field-label" htmlFor="contoh-notif">
            Uji pembaca notifikasi
          </label>
          <textarea
            id="contoh-notif"
            rows={2}
            className="field"
            value={contoh}
            onChange={(e) => setContoh(e.target.value)}
          />
          <p className="mt-2 text-sm text-ink-soft">
            {nominalContoh.length === 0
              ? "Tidak ada nominal rupiah yang terbaca dari teks ini."
              : `Nominal terbaca: ${nominalContoh.map((n) => rupiah(n)).join(", ")}. `}
            {nominalContoh.length > 0 &&
              (cocokContoh.length === 1
                ? `Cocok dengan tagihan ${cocokContoh[0].kode} (${cocokContoh[0].nama}).`
                : "Belum ada tagihan menunggu dengan nominal ini.")}
          </p>
          <p className="mt-3 text-[13px] text-ink-muted">
            Notifikasi yang masuk dan hasil pencocokannya bisa dilihat di{" "}
            <Link href="/admin/transaksi/" className="font-semibold text-brand-700 hover:underline">
              Transaksi → Notifikasi masuk
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
