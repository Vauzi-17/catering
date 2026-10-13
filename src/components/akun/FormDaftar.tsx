"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, MailCheck } from "lucide-react";
import { tujuanAman } from "@/components/akun/FormMasuk";
import { KerangkaAuth, PesanForm, TanpaSupabase } from "@/components/akun/KerangkaAuth";
import { pesanAuth, useAuth } from "@/store/AuthProvider";
import { useBahasa } from "@/store/BahasaProvider";

export function FormDaftar() {
  const auth = useAuth();
  const { bahasa, t } = useBahasa();
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
    if (f.nama.trim().length < 3) return setGalat(t("Nama minimal 3 huruf.", "Name must be at least 3 characters."));
    if (!/^[0-9+\-\s()]{9,}$/.test(f.telepon.trim())) return setGalat(t("Masukkan nomor WhatsApp yang aktif.", "Enter an active WhatsApp number."));
    if (f.sandi.length < 8) return setGalat(t("Kata sandi minimal 8 karakter.", "Password must be at least 8 characters."));
    if (f.sandi !== f.ulang) return setGalat(t("Konfirmasi kata sandi tidak sama.", "Passwords do not match."));

    setSibuk(true);
    try {
      await auth.daftar({ nama: f.nama, telepon: f.telepon, email: f.email, sandi: f.sandi });
      setTerkirim(true);
    } catch (err) {
      setGalat(pesanAuth(err, bahasa));
    } finally {
      setSibuk(false);
    }
  }

  if (terkirim) {
    return (
      <KerangkaAuth judul={t("Cek email Anda", "Check your email")}>
        <div className="flex flex-col items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zamrud-50 text-zamrud-700">
            <MailCheck size={26} strokeWidth={1.8} />
          </span>
          <p className="text-[15px] leading-relaxed text-ink-soft">
            {t("Tautan verifikasi sudah dikirim ke", "A verification link was sent to")}{" "}
            <span className="font-semibold text-ink">{f.email}</span>.{" "}
            {t(
              "Buka tautan itu untuk mengaktifkan akun, lalu masuk. Periksa juga folder spam.",
              "Open it to activate your account, then sign in. Check your spam folder too.",
            )}
          </p>
          <Link href={`/masuk/?lanjut=${encodeURIComponent(lanjut)}`} className="tombol tombol-md tombol-garis">
            {t("Ke halaman masuk", "Go to sign in")}
          </Link>
        </div>
      </KerangkaAuth>
    );
  }

  return (
    <KerangkaAuth
      judul={t("Buat akun", "Create an account")}
      deskripsi={t("Akun dipakai untuk memesan, membayar, dan memantau pesanan.", "Your account is used to order, pay, and track orders.")}
    >
      {!auth.aktif ? (
        <TanpaSupabase />
      ) : (
        <form onSubmit={kirim} className="space-y-4">
          {galat && <PesanForm jenis="galat">{galat}</PesanForm>}
          <div>
            <label className="isian-label" htmlFor="nama">{t("Nama lengkap", "Full name")}</label>
            <input id="nama" autoComplete="name" required className="isian" value={f.nama} onChange={ubah("nama")} />
          </div>
          <div>
            <label className="isian-label" htmlFor="telepon">{t("Nomor WhatsApp", "WhatsApp number")}</label>
            <input id="telepon" inputMode="tel" autoComplete="tel" required placeholder="0812-3456-7890" className="isian" value={f.telepon} onChange={ubah("telepon")} />
          </div>
          <div>
            <label className="isian-label" htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" required className="isian" value={f.email} onChange={ubah("email")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="isian-label" htmlFor="sandi">{t("Kata sandi", "Password")}</label>
              <input id="sandi" type="password" autoComplete="new-password" required minLength={8} className="isian" value={f.sandi} onChange={ubah("sandi")} />
            </div>
            <div>
              <label className="isian-label" htmlFor="ulang">{t("Ulangi kata sandi", "Repeat password")}</label>
              <input id="ulang" type="password" autoComplete="new-password" required className="isian" value={f.ulang} onChange={ubah("ulang")} />
            </div>
          </div>
          <p className="text-[12px] text-ink-muted">
            {t(
              "Minimal 8 karakter. Alamat pengantaran diisi setelah akun aktif.",
              "At least 8 characters. You can add your delivery address once the account is active.",
            )}
          </p>

          <button type="submit" disabled={sibuk} className="tombol tombol-blok tombol-jingga">
            {sibuk ? t("Mendaftarkan…", "Registering…") : t("Daftar", "Register")}
            {!sibuk && <ArrowRight size={18} />}
          </button>

          <p className="text-center text-[14px] text-ink-muted">
            {t("Sudah punya akun?", "Already have an account?")}{" "}
            <Link href={`/masuk/?lanjut=${encodeURIComponent(lanjut)}`} className="font-semibold text-zamrud-700 hover:underline">
              {t("Masuk", "Sign in")}
            </Link>
          </p>
        </form>
      )}
    </KerangkaAuth>
  );
}
