"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, MailCheck } from "lucide-react";
import { tujuanAman } from "@/components/akun/FormMasuk";
import { KerangkaAuth, PesanForm, TanpaSupabase } from "@/components/akun/KerangkaAuth";
import { pesanAuth, useAuth } from "@/store/AuthProvider";

export function FormDaftar() {
  const auth = useAuth();
  const params = useSearchParams();
  const lanjut = tujuanAman(params.get("lanjut"));

  const [f, setF] = useState({ nama: "", telepon: "", email: "", sandi: "", ulang: "" });
  const [galat, setGalat] = useState("");
  const [terkirim, setTerkirim] = useState(false);
  const [sibuk, setSibuk] = useState(false);

  const ubah = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((lama) => ({ ...lama, [k]: e.target.value }));

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");
    if (f.nama.trim().length < 3) return setGalat("Nama minimal 3 huruf.");
    if (!/^[0-9+\-\s()]{9,}$/.test(f.telepon.trim())) return setGalat("Masukkan nomor WhatsApp yang aktif.");
    if (f.sandi.length < 8) return setGalat("Kata sandi minimal 8 karakter.");
    if (f.sandi !== f.ulang) return setGalat("Konfirmasi kata sandi tidak sama.");

    setSibuk(true);
    try {
      await auth.daftar({ nama: f.nama, telepon: f.telepon, email: f.email, sandi: f.sandi });
      setTerkirim(true);
    } catch (err) {
      setGalat(pesanAuth(err));
    } finally {
      setSibuk(false);
    }
  }

  if (terkirim) {
    return (
      <KerangkaAuth judul="Cek email Anda">
        <div className="flex flex-col items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zamrud-50 text-zamrud-700">
            <MailCheck size={26} strokeWidth={1.8} />
          </span>
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Tautan verifikasi sudah dikirim ke <span className="font-semibold text-ink">{f.email}</span>.
            Buka tautan itu untuk mengaktifkan akun, lalu masuk. Periksa juga folder spam.
          </p>
          <Link href={`/masuk/?lanjut=${encodeURIComponent(lanjut)}`} className="tombol tombol-md tombol-garis">
            Ke halaman masuk
          </Link>
        </div>
      </KerangkaAuth>
    );
  }

  return (
    <KerangkaAuth judul="Buat akun" deskripsi="Akun dipakai untuk memesan, membayar, dan memantau pesanan.">
      {!auth.aktif ? (
        <TanpaSupabase />
      ) : (
        <form onSubmit={kirim} className="space-y-4">
          {galat && <PesanForm jenis="galat">{galat}</PesanForm>}
          <div>
            <label className="isian-label" htmlFor="nama">Nama lengkap</label>
            <input id="nama" autoComplete="name" required className="isian" value={f.nama} onChange={ubah("nama")} />
          </div>
          <div>
            <label className="isian-label" htmlFor="telepon">Nomor WhatsApp</label>
            <input id="telepon" inputMode="tel" autoComplete="tel" required placeholder="0812-3456-7890" className="isian" value={f.telepon} onChange={ubah("telepon")} />
          </div>
          <div>
            <label className="isian-label" htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" required className="isian" value={f.email} onChange={ubah("email")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="isian-label" htmlFor="sandi">Kata sandi</label>
              <input id="sandi" type="password" autoComplete="new-password" required minLength={8} className="isian" value={f.sandi} onChange={ubah("sandi")} />
            </div>
            <div>
              <label className="isian-label" htmlFor="ulang">Ulangi kata sandi</label>
              <input id="ulang" type="password" autoComplete="new-password" required className="isian" value={f.ulang} onChange={ubah("ulang")} />
            </div>
          </div>
          <p className="text-[12px] text-ink-muted">Minimal 8 karakter. Alamat pengantaran diisi setelah akun aktif.</p>

          <button type="submit" disabled={sibuk} className="tombol tombol-blok tombol-jingga">
            {sibuk ? "Mendaftarkan…" : "Daftar"}
            {!sibuk && <ArrowRight size={18} />}
          </button>

          <p className="text-center text-[14px] text-ink-muted">
            Sudah punya akun?{" "}
            <Link href={`/masuk/?lanjut=${encodeURIComponent(lanjut)}`} className="font-semibold text-zamrud-700 hover:underline">
              Masuk
            </Link>
          </p>
        </form>
      )}
    </KerangkaAuth>
  );
}
