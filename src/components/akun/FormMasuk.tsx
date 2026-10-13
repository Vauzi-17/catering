"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { KerangkaAuth, PesanForm, TanpaSupabase } from "@/components/akun/KerangkaAuth";
import { belumVerifikasi as galatBelumVerifikasi, pesanAuth, useAuth } from "@/store/AuthProvider";
import { useBahasa } from "@/store/BahasaProvider";

/** Hanya izinkan tujuan di situs sendiri, mis. "/pesan/". */
export function tujuanAman(lanjut: string | null, cadangan = "/"): string {
  return lanjut && lanjut.startsWith("/") && !lanjut.startsWith("//") ? lanjut : cadangan;
}

export function FormMasuk() {
  const auth = useAuth();
  const { bahasa, t } = useBahasa();
  const router = useRouter();
  const params = useSearchParams();
  const lanjut = tujuanAman(params.get("lanjut"));
  const terverifikasi = params.get("terverifikasi") === "1";

  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [lihat, setLihat] = useState(false);
  const [galat, setGalat] = useState("");
  const [info, setInfo] = useState("");
  const [belumVerifikasi, setBelumVerifikasi] = useState(false);
  const [sibuk, setSibuk] = useState(false);

  // Sudah login (termasuk baru membuka tautan verifikasi): langsung lanjut.
  useEffect(() => {
    if (auth.siap && auth.pengguna && !terverifikasi) router.replace(lanjut);
  }, [auth.siap, auth.pengguna, terverifikasi, lanjut, router]);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");
    setInfo("");
    setBelumVerifikasi(false);
    setSibuk(true);
    try {
      await auth.masuk(email, sandi);
      router.replace(lanjut);
    } catch (err) {
      setGalat(pesanAuth(err, bahasa));
      setBelumVerifikasi(galatBelumVerifikasi(err));
    } finally {
      setSibuk(false);
    }
  }

  async function kirimUlang() {
    setGalat("");
    try {
      await auth.kirimUlangVerifikasi(email);
      setInfo(t(`Tautan verifikasi baru dikirim ke ${email}.`, `A new verification link was sent to ${email}.`));
      setBelumVerifikasi(false);
    } catch (err) {
      setGalat(pesanAuth(err, bahasa));
    }
  }

  return (
    <KerangkaAuth
      judul={t("Masuk", "Sign in")}
      deskripsi={t("Masuk untuk memesan dan memantau pesanan Anda.", "Sign in to order and track your orders.")}
    >
      {!auth.aktif ? (
        <TanpaSupabase />
      ) : (
        <form onSubmit={kirim} className="space-y-4">
          {terverifikasi && (
            <PesanForm jenis="sukses">
              {t("Email berhasil diverifikasi.", "Email verified.")}{" "}
              {auth.pengguna ? (
                <Link href="/akun/" className="font-semibold underline">
                  {t("Lengkapi alamat pengantaran", "Complete your delivery address")}
                </Link>
              ) : (
                t("Silakan masuk.", "Please sign in.")
              )}
            </PesanForm>
          )}
          {galat && <PesanForm jenis="galat">{galat}</PesanForm>}
          {info && <PesanForm jenis="sukses">{info}</PesanForm>}
          {belumVerifikasi && email && (
            <button type="button" onClick={kirimUlang} className="text-[13px] font-semibold text-zamrud-700 underline">
              {t("Kirim ulang tautan verifikasi", "Resend verification link")}
            </button>
          )}

          <div>
            <label className="isian-label" htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" required className="isian" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="isian-label" htmlFor="sandi">{t("Kata sandi", "Password")}</label>
              <Link href="/lupa-sandi/" className="mb-1.5 text-[12px] font-semibold text-zamrud-700 hover:underline">
                {t("Lupa kata sandi?", "Forgot password?")}
              </Link>
            </div>
            <div className="relative">
              <input id="sandi" type={lihat ? "text" : "password"} autoComplete="current-password" required className="isian pr-11" value={sandi} onChange={(e) => setSandi(e.target.value)} />
              <button type="button" onClick={() => setLihat((v) => !v)} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-ink-muted hover:text-ink" aria-label={lihat ? t("Sembunyikan kata sandi", "Hide password") : t("Tampilkan kata sandi", "Show password")}>
                {lihat ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={sibuk} className="tombol tombol-blok tombol-jingga">
            {sibuk ? t("Memproses…", "Signing in…") : t("Masuk", "Sign in")}
            {!sibuk && <ArrowRight size={18} />}
          </button>

          <p className="text-center text-[14px] text-ink-muted">
            {t("Belum punya akun?", "No account yet?")}{" "}
            <Link href={`/daftar/?lanjut=${encodeURIComponent(lanjut)}`} className="font-semibold text-zamrud-700 hover:underline">
              {t("Daftar sekarang", "Register now")}
            </Link>
          </p>
        </form>
      )}
    </KerangkaAuth>
  );
}
