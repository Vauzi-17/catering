import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Aplikasi berjalan dalam dua mode:
 *
 * - Mode Supabase  — bila NEXT_PUBLIC_SUPABASE_URL dan ANON_KEY terisi di
 *   .env.local. Seluruh data menu, bahan baku, dan pesanan dibaca serta
 *   ditulis ke basis data.
 * - Mode contoh    — bila keduanya kosong. Data memakai berkas src/data/ dan
 *   disimpan di localStorage peramban, sehingga aplikasi tetap bisa dicoba
 *   tanpa perlu membuat project Supabase lebih dulu.
 *
 * Kedua kunci di atas memang boleh terbaca dari browser. Yang melindungi data
 * adalah Row Level Security di Supabase, bukan kerahasiaan anon key.
 */
export const supabaseAktif = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseAktif
  ? createClient(url as string, anonKey as string, {
      auth: {
        // Sesi login pelanggan & admin disimpan di browser dan diperbarui
        // otomatis. Alur "implicit" membuat tautan verifikasi email dan reset
        // kata sandi tetap berfungsi walau dibuka di perangkat lain.
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "implicit",
        storageKey: "asri.auth",
      },
    })
  : null;

/** Melempar galat yang mudah dibaca bila dipanggil saat mode contoh. */
export function wajibSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY pada .env.local.",
    );
  }
  return supabase;
}

const POLA_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Data contoh memakai id sederhana seperti "mn-01", sedangkan Supabase memakai
 * UUID. Fungsi ini membedakan keduanya supaya baris baru dibiarkan diberi id
 * oleh basis data.
 */
export function apakahUuid(nilai: string): boolean {
  return POLA_UUID.test(nilai);
}
