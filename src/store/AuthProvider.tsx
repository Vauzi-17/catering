"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase, supabaseAktif } from "@/lib/supabase";
import type { Profil } from "@/lib/types";

interface KonteksAuth {
  /** true setelah sesi awal selesai dibaca dari browser. */
  siap: boolean;
  aktif: boolean;
  pengguna: User | null;
  profil: Profil | null;
  adalahAdmin: boolean;
  /** true saat pengguna datang dari tautan reset kata sandi. */
  pemulihan: boolean;

  daftar: (d: { nama: string; telepon: string; email: string; sandi: string }) => Promise<void>;
  masuk: (email: string, sandi: string) => Promise<void>;
  keluar: () => Promise<void>;
  kirimUlangVerifikasi: (email: string) => Promise<void>;
  kirimResetSandi: (email: string) => Promise<void>;
  gantiSandi: (sandi: string) => Promise<void>;
  simpanProfil: (p: Omit<Profil, "id">) => Promise<void>;
  muatUlangProfil: () => Promise<void>;
  /** Access token untuk memanggil /api/*. */
  token: () => Promise<string | null>;
}

const Konteks = createContext<KonteksAuth | null>(null);

/** Menerjemahkan pesan galat Supabase Auth ke bahasa pelanggan. */
export function pesanAuth(e: unknown): string {
  const m = e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e);
  if (/invalid login credentials/i.test(m)) return "Email atau kata sandi salah.";
  if (/email not confirmed/i.test(m)) return "Email belum diverifikasi. Buka tautan verifikasi di kotak masuk Anda.";
  if (/already registered|already exists/i.test(m)) return "Email ini sudah terdaftar. Silakan masuk.";
  if (/password should be at least|weak password/i.test(m)) return "Kata sandi terlalu lemah. Gunakan minimal 8 karakter.";
  if (/rate limit|too many|security purposes/i.test(m)) return "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
  if (/same password|different from the old/i.test(m)) return "Kata sandi baru harus berbeda dari yang lama.";
  if (/invalid email|unable to validate email/i.test(m)) return "Format email tidak valid.";
  if (/fetch|network/i.test(m)) return "Tidak dapat terhubung. Periksa koneksi internet Anda.";
  return m || "Terjadi kesalahan. Coba lagi.";
}

function wajib() {
  if (!supabase) throw new Error("Akun pelanggan membutuhkan Supabase. Isi variabel lingkungan Supabase terlebih dahulu.");
  return supabase;
}

const asal = () => (typeof window === "undefined" ? "" : window.location.origin);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [siap, setSiap] = useState(!supabaseAktif);
  const [sesi, setSesi] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [adalahAdmin, setAdalahAdmin] = useState(false);
  const [pemulihan, setPemulihan] = useState(false);

  const pengguna = sesi?.user ?? null;

  const muatProfil = useCallback(async (uid: string | null) => {
    if (!supabase || !uid) {
      setProfil(null);
      setAdalahAdmin(false);
      return;
    }
    const [p, a] = await Promise.all([
      supabase.from("profiles").select("id, nama, telepon, alamat, patokan, lat, lng").eq("id", uid).maybeSingle(),
      supabase.from("users").select("id").eq("id", uid).maybeSingle(),
    ]);
    setProfil(
      p.data
        ? {
            id: p.data.id,
            nama: p.data.nama ?? "",
            telepon: p.data.telepon ?? "",
            alamat: p.data.alamat ?? "",
            patokan: p.data.patokan ?? "",
            lat: p.data.lat === null ? null : Number(p.data.lat),
            lng: p.data.lng === null ? null : Number(p.data.lng),
          }
        : null,
    );
    setAdalahAdmin(Boolean(a.data));
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let hidup = true;

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!hidup) return;
      setSesi(data.session);
      await muatProfil(data.session?.user.id ?? null);
      if (hidup) setSiap(true);
    });

    const { data: langganan } = supabase.auth.onAuthStateChange((kejadian, s) => {
      setSesi(s);
      if (kejadian === "PASSWORD_RECOVERY") setPemulihan(true);
      if (kejadian === "SIGNED_OUT") setPemulihan(false);
      // Profil dimuat di luar callback supaya tidak mengunci klien Supabase.
      if (kejadian === "SIGNED_IN" || kejadian === "SIGNED_OUT" || kejadian === "USER_UPDATED") {
        setTimeout(() => void muatProfil(s?.user.id ?? null), 0);
      }
    });

    return () => {
      hidup = false;
      langganan.subscription.unsubscribe();
    };
  }, [muatProfil]);

  const daftar: KonteksAuth["daftar"] = useCallback(async ({ nama, telepon, email, sandi }) => {
    const { data, error } = await wajib().auth.signUp({
      email: email.trim(),
      password: sandi,
      options: {
        data: { nama: nama.trim(), telepon: telepon.trim() },
        emailRedirectTo: `${asal()}/masuk/?terverifikasi=1`,
      },
    });
    if (error) throw error;
    // Supabase tidak memberi galat untuk email yang sudah terdaftar (supaya
    // daftar email tidak bisa ditebak), tetapi identities-nya kosong.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error("already registered");
    }
  }, []);

  const masuk = useCallback(async (email: string, sandi: string) => {
    const { error } = await wajib().auth.signInWithPassword({ email: email.trim(), password: sandi });
    if (error) throw error;
  }, []);

  const keluar = useCallback(async () => {
    await wajib().auth.signOut();
  }, []);

  const kirimUlangVerifikasi = useCallback(async (email: string) => {
    const { error } = await wajib().auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${asal()}/masuk/?terverifikasi=1` },
    });
    if (error) throw error;
  }, []);

  const kirimResetSandi = useCallback(async (email: string) => {
    const { error } = await wajib().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${asal()}/atur-sandi/`,
    });
    if (error) throw error;
  }, []);

  const gantiSandi = useCallback(async (sandi: string) => {
    const { error } = await wajib().auth.updateUser({ password: sandi });
    if (error) throw error;
    setPemulihan(false);
  }, []);

  const simpanProfil: KonteksAuth["simpanProfil"] = useCallback(
    async (p) => {
      const uid = sesi?.user.id;
      if (!uid) throw new Error("Silakan masuk terlebih dahulu.");
      const { error } = await wajib()
        .from("profiles")
        .update({ ...p, diubah_pada: new Date().toISOString() })
        .eq("id", uid);
      if (error) throw error;
      setProfil({ id: uid, ...p });
    },
    [sesi],
  );

  // Membaca sesi terbaru (bukan dari state) supaya bisa dipanggil tepat
  // setelah masuk, sebelum state sesi sempat diperbarui.
  const muatUlangProfil = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    await muatProfil(data.session?.user.id ?? null);
  }, [muatProfil]);

  const token = useCallback(async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  const nilai = useMemo<KonteksAuth>(
    () => ({
      siap,
      aktif: supabaseAktif,
      pengguna,
      profil,
      adalahAdmin,
      pemulihan,
      daftar,
      masuk,
      keluar,
      kirimUlangVerifikasi,
      kirimResetSandi,
      gantiSandi,
      simpanProfil,
      muatUlangProfil,
      token,
    }),
    [siap, pengguna, profil, adalahAdmin, pemulihan, daftar, masuk, keluar, kirimUlangVerifikasi, kirimResetSandi, gantiSandi, simpanProfil, muatUlangProfil, token],
  );

  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}

export function useAuth() {
  const k = useContext(Konteks);
  if (!k) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return k;
}
