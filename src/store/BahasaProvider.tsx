"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Bahasa = "id" | "en";

/** Teks satu bahasa, atau pasangan [Indonesia, Inggris]. */
export type Teks = string | readonly [string, string];

interface NilaiBahasa {
  bahasa: Bahasa;
  setBahasa: (b: Bahasa) => void;
  /** Memilih teks sesuai bahasa aktif: t("Keranjang", "Cart"). */
  t: (id: string, en: string) => string;
  /** Memilih dari Teks: string apa adanya, pasangan sesuai bahasa. */
  p: (teks: Teks) => string;
  /** Locale untuk Intl (tanggal, angka). */
  locale: string;
}

const KUNCI = "asri.bahasa";
const KonteksBahasa = createContext<NilaiBahasa | null>(null);

/**
 * Bahasa tampilan situs pelanggan (Indonesia/Inggris). Pilihan disimpan di
 * peramban; halaman dirender dalam bahasa Indonesia lalu berganti setelah
 * pilihan tersimpan terbaca.
 */
export function BahasaProvider({ children }: { children: ReactNode }) {
  const [bahasa, setState] = useState<Bahasa>("id");

  useEffect(() => {
    try {
      const simpan = localStorage.getItem(KUNCI);
      if (simpan === "en" || simpan === "id") setState(simpan);
    } catch {
      /* penyimpanan diblokir: tetap bahasa Indonesia */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = bahasa;
  }, [bahasa]);

  const setBahasa = useCallback((b: Bahasa) => {
    setState(b);
    try {
      localStorage.setItem(KUNCI, b);
    } catch {
      /* abaikan */
    }
  }, []);

  const nilai = useMemo<NilaiBahasa>(
    () => ({
      bahasa,
      setBahasa,
      t: (id, en) => (bahasa === "en" ? en : id),
      p: (teks) => (typeof teks === "string" ? teks : bahasa === "en" ? teks[1] : teks[0]),
      locale: bahasa === "en" ? "en-GB" : "id-ID",
    }),
    [bahasa, setBahasa],
  );

  return <KonteksBahasa.Provider value={nilai}>{children}</KonteksBahasa.Provider>;
}

export function useBahasa(): NilaiBahasa {
  const nilai = useContext(KonteksBahasa);
  if (!nilai) throw new Error("useBahasa harus dipakai di dalam BahasaProvider");
  return nilai;
}
