"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { KerangkaAuth, PesanForm, TanpaSupabase } from "@/components/akun/KerangkaAuth";
import { pesanAuth, useAuth } from "@/store/AuthProvider";

/** Hanya izinkan tujuan di situs sendiri, mis. "/pesan/". */
export function tujuanAman(lanjut: string | null, cadangan = "/"): string {
  return lanjut && lanjut.startsWith("/") && !lanjut.startsWith("//") ? lanjut : cadangan;
}

export function FormMasuk() {
  const auth = useAuth();
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
      const pesan = pesanAuth(err);
      setGalat(pesan);
      setBelumVerifikasi(/belum diverifikasi/.test(pesan));
    } finally {
      setSibuk(false);
    }
  }

  async function kirimUlang() {
    setGalat("");
    try {
      await auth.kirimUlangVerifikasi(email);
      setInfo(`Tautan verifikasi baru dikirim ke ${email}.`);
      setBelumVerifikasi(false);
    } catch (err) {
      setGalat(pesanAuth(err));
    }
  }

  return (
    <KerangkaAuth judul="Masuk" deskripsi="Masuk untuk memesan dan memantau pesanan Anda.">
      {!auth.aktif ? (
        <TanpaSupabase />
      ) : (
        <form onSubmit={kirim} className="space-y-4">
          {terverifikasi && (
            <PesanForm jenis="sukses">
              Email berhasil diverifikasi.{" "}
              {auth.pengguna ? (
                <Link href="/akun/" className="font-semibold underline">
                  Lengkapi alamat pengantaran
                </Link>
              ) : (
                "Silakan masuk."
              )}
            </PesanForm>
          )}
          {galat && <PesanForm jenis="galat">{galat}</PesanForm>}
          {info && <PesanForm jenis="sukses">{info}</PesanForm>}
          {belumVerifikasi && email && (
            <button type="button" onClick={kirimUlang} className="text-[13px] font-semibold text-zamrud-700 underline">
              Kirim ulang tautan verifikasi
            </button>
          )}

          <div>
            <label className="isian-label" htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" required className="isian" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="isian-label" htmlFor="sandi">Kata sandi</label>
              <Link href="/lupa-sandi/" className="mb-1.5 text-[12px] font-semibold text-zamrud-700 hover:underline">
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <input id="sandi" type={lihat ? "text" : "password"} autoComplete="current-password" required className="isian pr-11" value={sandi} onChange={(e) => setSandi(e.target.value)} />
              <button type="button" onClick={() => setLihat((v) => !v)} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-ink-muted hover:text-ink" aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>
                {lihat ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={sibuk} className="tombol tombol-blok tombol-jingga">
            {sibuk ? "Memproses…" : "Masuk"}
            {!sibuk && <ArrowRight size={18} />}
          </button>

          <p className="text-center text-[14px] text-ink-muted">
            Belum punya akun?{" "}
            <Link href={`/daftar/?lanjut=${encodeURIComponent(lanjut)}`} className="font-semibold text-zamrud-700 hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </form>
      )}
    </KerangkaAuth>
  );
}
