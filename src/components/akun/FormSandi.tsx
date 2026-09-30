"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { KerangkaAuth, PesanForm, TanpaSupabase } from "@/components/akun/KerangkaAuth";
import { pesanAuth, useAuth } from "@/store/AuthProvider";

export function FormLupaSandi() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [galat, setGalat] = useState("");
  const [terkirim, setTerkirim] = useState(false);
  const [sibuk, setSibuk] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");
    setSibuk(true);
    try {
      await auth.kirimResetSandi(email);
      setTerkirim(true);
    } catch (err) {
      setGalat(pesanAuth(err));
    } finally {
      setSibuk(false);
    }
  }

  return (
    <KerangkaAuth judul="Lupa kata sandi" deskripsi="Kami kirimkan tautan untuk membuat kata sandi baru.">
      {!auth.aktif ? (
        <TanpaSupabase />
      ) : terkirim ? (
        <div className="space-y-4">
          <PesanForm jenis="sukses">
            Bila {email} terdaftar, tautan atur ulang kata sandi sudah dikirim. Periksa juga folder spam.
          </PesanForm>
          <Link href="/masuk/" className="tombol tombol-md tombol-garis">Kembali ke halaman masuk</Link>
        </div>
      ) : (
        <form onSubmit={kirim} className="space-y-4">
          {galat && <PesanForm jenis="galat">{galat}</PesanForm>}
          <div>
            <label className="isian-label" htmlFor="email">Email akun</label>
            <input id="email" type="email" autoComplete="email" required className="isian" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={sibuk} className="tombol tombol-blok tombol-jingga">
            {sibuk ? "Mengirim…" : "Kirim tautan"}
          </button>
          <p className="text-center text-[14px]">
            <Link href="/masuk/" className="font-semibold text-zamrud-700 hover:underline">Kembali ke halaman masuk</Link>
          </p>
        </form>
      )}
    </KerangkaAuth>
  );
}

export function FormAturSandi() {
  const auth = useAuth();
  const router = useRouter();
  const [sandi, setSandi] = useState("");
  const [ulang, setUlang] = useState("");
  const [galat, setGalat] = useState("");
  const [selesai, setSelesai] = useState(false);
  const [sibuk, setSibuk] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");
    if (sandi.length < 8) return setGalat("Kata sandi minimal 8 karakter.");
    if (sandi !== ulang) return setGalat("Konfirmasi kata sandi tidak sama.");
    setSibuk(true);
    try {
      await auth.gantiSandi(sandi);
      setSelesai(true);
      window.setTimeout(() => router.replace("/akun/"), 1500);
    } catch (err) {
      setGalat(pesanAuth(err));
    } finally {
      setSibuk(false);
    }
  }

  const bolehGanti = auth.pengguna !== null;

  return (
    <KerangkaAuth judul="Kata sandi baru">
      {!auth.aktif ? (
        <TanpaSupabase />
      ) : !auth.siap ? (
        <p className="text-sm text-ink-muted">Memeriksa tautan…</p>
      ) : !bolehGanti ? (
        <div className="space-y-4">
          <PesanForm jenis="galat">Tautan tidak berlaku atau sudah kedaluwarsa. Minta tautan baru.</PesanForm>
          <Link href="/lupa-sandi/" className="tombol tombol-md tombol-garis">Minta tautan baru</Link>
        </div>
      ) : selesai ? (
        <PesanForm jenis="sukses">Kata sandi berhasil diganti. Mengalihkan ke akun Anda…</PesanForm>
      ) : (
        <form onSubmit={kirim} className="space-y-4">
          {galat && <PesanForm jenis="galat">{galat}</PesanForm>}
          <div>
            <label className="isian-label" htmlFor="sandi">Kata sandi baru</label>
            <input id="sandi" type="password" autoComplete="new-password" required minLength={8} className="isian" value={sandi} onChange={(e) => setSandi(e.target.value)} />
          </div>
          <div>
            <label className="isian-label" htmlFor="ulang">Ulangi kata sandi baru</label>
            <input id="ulang" type="password" autoComplete="new-password" required className="isian" value={ulang} onChange={(e) => setUlang(e.target.value)} />
          </div>
          <button type="submit" disabled={sibuk} className="tombol tombol-blok tombol-jingga">
            {sibuk ? "Menyimpan…" : "Simpan kata sandi"}
          </button>
        </form>
      )}
    </KerangkaAuth>
  );
}
