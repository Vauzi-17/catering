"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { KerangkaAuth, PesanForm, TanpaSupabase } from "@/components/akun/KerangkaAuth";
import { pesanAuth, useAuth } from "@/store/AuthProvider";
import { useBahasa } from "@/store/BahasaProvider";

export function FormLupaSandi() {
  const auth = useAuth();
  const { bahasa, t } = useBahasa();
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
      setGalat(pesanAuth(err, bahasa));
    } finally {
      setSibuk(false);
    }
  }

  return (
    <KerangkaAuth
      judul={t("Lupa kata sandi", "Forgot password")}
      deskripsi={t("Kami kirimkan tautan untuk membuat kata sandi baru.", "We’ll send you a link to create a new password.")}
    >
      {!auth.aktif ? (
        <TanpaSupabase />
      ) : terkirim ? (
        <div className="space-y-4">
          <PesanForm jenis="sukses">
            {t(
              `Bila ${email} terdaftar, tautan atur ulang kata sandi sudah dikirim. Periksa juga folder spam.`,
              `If ${email} is registered, a password reset link has been sent. Check your spam folder too.`,
            )}
          </PesanForm>
          <Link href="/masuk/" className="tombol tombol-md tombol-garis">{t("Kembali ke halaman masuk", "Back to sign in")}</Link>
        </div>
      ) : (
        <form onSubmit={kirim} className="space-y-4">
          {galat && <PesanForm jenis="galat">{galat}</PesanForm>}
          <div>
            <label className="isian-label" htmlFor="email">{t("Email akun", "Account email")}</label>
            <input id="email" type="email" autoComplete="email" required className="isian" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={sibuk} className="tombol tombol-blok tombol-jingga">
            {sibuk ? t("Mengirim…", "Sending…") : t("Kirim tautan", "Send link")}
          </button>
          <p className="text-center text-[14px]">
            <Link href="/masuk/" className="font-semibold text-zamrud-700 hover:underline">{t("Kembali ke halaman masuk", "Back to sign in")}</Link>
          </p>
        </form>
      )}
    </KerangkaAuth>
  );
}

export function FormAturSandi() {
  const auth = useAuth();
  const { bahasa, t } = useBahasa();
  const router = useRouter();
  const [sandi, setSandi] = useState("");
  const [ulang, setUlang] = useState("");
  const [galat, setGalat] = useState("");
  const [selesai, setSelesai] = useState(false);
  const [sibuk, setSibuk] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");
    if (sandi.length < 8) return setGalat(t("Kata sandi minimal 8 karakter.", "Password must be at least 8 characters."));
    if (sandi !== ulang) return setGalat(t("Konfirmasi kata sandi tidak sama.", "Passwords do not match."));
    setSibuk(true);
    try {
      await auth.gantiSandi(sandi);
      setSelesai(true);
      window.setTimeout(() => router.replace("/akun/"), 1500);
    } catch (err) {
      setGalat(pesanAuth(err, bahasa));
    } finally {
      setSibuk(false);
    }
  }

  const bolehGanti = auth.pengguna !== null;

  return (
    <KerangkaAuth judul={t("Kata sandi baru", "New password")}>
      {!auth.aktif ? (
        <TanpaSupabase />
      ) : !auth.siap ? (
        <p className="text-sm text-ink-muted">{t("Memeriksa tautan…", "Checking link…")}</p>
      ) : !bolehGanti ? (
        <div className="space-y-4">
          <PesanForm jenis="galat">{t("Tautan tidak berlaku atau sudah kedaluwarsa. Minta tautan baru.", "This link is invalid or has expired. Request a new one.")}</PesanForm>
          <Link href="/lupa-sandi/" className="tombol tombol-md tombol-garis">{t("Minta tautan baru", "Request a new link")}</Link>
        </div>
      ) : selesai ? (
        <PesanForm jenis="sukses">{t("Kata sandi berhasil diganti. Mengalihkan ke akun Anda…", "Password changed. Taking you to your account…")}</PesanForm>
      ) : (
        <form onSubmit={kirim} className="space-y-4">
          {galat && <PesanForm jenis="galat">{galat}</PesanForm>}
          <div>
            <label className="isian-label" htmlFor="sandi">{t("Kata sandi baru", "New password")}</label>
            <input id="sandi" type="password" autoComplete="new-password" required minLength={8} className="isian" value={sandi} onChange={(e) => setSandi(e.target.value)} />
          </div>
          <div>
            <label className="isian-label" htmlFor="ulang">{t("Ulangi kata sandi baru", "Repeat new password")}</label>
            <input id="ulang" type="password" autoComplete="new-password" required className="isian" value={ulang} onChange={(e) => setUlang(e.target.value)} />
          </div>
          <button type="submit" disabled={sibuk} className="tombol tombol-blok tombol-jingga">
            {sibuk ? t("Menyimpan…", "Saving…") : t("Simpan kata sandi", "Save password")}
          </button>
        </form>
      )}
    </KerangkaAuth>
  );
}
