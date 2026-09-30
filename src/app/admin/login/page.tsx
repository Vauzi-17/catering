"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { IconAlert, IconArrowRight } from "@/components/Icons";
import { supabase } from "@/lib/supabase";
import { pesanAuth, useAuth } from "@/store/AuthProvider";
import { useData } from "@/store/DataProvider";

export default function HalamanLogin() {
  const router = useRouter();
  const { login, masuk, siap } = useData();
  const auth = useAuth();

  const [pengguna, setPengguna] = useState("");
  const [sandi, setSandi] = useState("");
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    if (siap && masuk) router.replace("/admin");
  }, [siap, masuk, router]);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (!pengguna || !sandi) {
      setGalat(auth.aktif ? "Email dan kata sandi wajib diisi." : "Nama pengguna dan kata sandi wajib diisi.");
      return;
    }

    // Mode contoh tanpa Supabase: akun demo lokal.
    if (!auth.aktif) {
      if (login(pengguna, sandi)) router.push("/admin");
      else setGalat("Nama pengguna atau kata sandi tidak cocok.");
      return;
    }

    setSibuk(true);
    setGalat("");
    try {
      await auth.masuk(pengguna, sandi);
      const { data: sesi } = await supabase!.auth.getSession();
      const { data } = await supabase!.from("users").select("id").eq("id", sesi.session?.user.id ?? "").maybeSingle();
      if (!data) {
        setGalat("Akun ini bukan akun admin. Hubungi pemilik usaha untuk didaftarkan sebagai admin.");
        return;
      }
      // Tunggu status admin termuat supaya penjaga halaman tidak memantul.
      await auth.muatUlangProfil();
      router.push("/admin");
    } catch (err) {
      setGalat(pesanAuth(err));
    } finally {
      setSibuk(false);
    }
  }

  const bukanAdmin = auth.aktif && auth.siap && auth.pengguna && !auth.adalahAdmin;

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
      <div className="hidden flex-col justify-between bg-brand-900 p-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <span className="font-display text-lg font-semibold">Asri Catering</span>
        </Link>
        <p className="font-display text-[28px] leading-snug">Dashboard pengelolaan pesanan, pembayaran, menu, dan laporan usaha.</p>
        <p className="text-[13px] text-brand-300">&copy; {new Date().getFullYear()} Asri Catering</p>
      </div>

      <div className="flex items-center justify-center bg-cream px-5 py-14">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-display text-lg font-semibold">Asri Catering</span>
            </Link>
          </div>

          <div className="card mt-8 p-7 lg:mt-0">
            <h1 className="font-display text-[26px] leading-tight">Masuk Admin</h1>
            <p className="mt-2 text-sm text-ink-muted">Halaman khusus pemilik dan pengelola usaha.</p>

            {bukanAdmin && !galat && (
              <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-900">
                Anda sedang masuk sebagai {auth.pengguna?.email}, yang bukan akun admin.{" "}
                <button type="button" onClick={() => void auth.keluar()} className="font-semibold underline">
                  Keluar
                </button>
              </p>
            )}

            <form onSubmit={kirim} className="mt-6 space-y-4" noValidate>
              <div>
                <label className="field-label" htmlFor="pengguna">
                  {auth.aktif ? "Email" : "Nama pengguna"}
                </label>
                <input
                  id="pengguna"
                  type={auth.aktif ? "email" : "text"}
                  className="field"
                  value={pengguna}
                  onChange={(e) => {
                    setPengguna(e.target.value);
                    setGalat("");
                  }}
                  autoComplete={auth.aktif ? "email" : "username"}
                  placeholder={auth.aktif ? "admin@contoh.com" : "admin"}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="sandi">Kata sandi</label>
                <input
                  id="sandi"
                  type="password"
                  className="field"
                  value={sandi}
                  onChange={(e) => {
                    setSandi(e.target.value);
                    setGalat("");
                  }}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>

              {galat && (
                <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] font-semibold text-red-700">
                  <IconAlert width={16} height={16} className="mt-0.5 shrink-0" />
                  {galat}
                </p>
              )}

              <button type="submit" disabled={sibuk} className="btn btn-primary btn-md w-full">
                {sibuk ? "Memeriksa…" : "Masuk"}
                {!sibuk && <IconArrowRight width={18} height={18} />}
              </button>
            </form>

            {!auth.aktif && (
              <p className="mt-5 rounded-lg border border-line bg-cream px-4 py-3 text-[13px] text-ink-muted">
                Mode contoh — akun demo: <span className="font-semibold text-ink">admin</span> /{" "}
                <span className="font-semibold text-ink">asri2025</span>
              </p>
            )}
          </div>

          <Link href="/" className="mt-5 block text-center text-[13px] font-semibold text-ink-muted hover:text-brand-700">
            Kembali ke halaman utama
          </Link>
        </div>
      </div>
    </div>
  );
}
