import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DetailMenu } from "@/components/DetailMenu";
import { menuAwal } from "@/data/menu";
import { ambilMenuSlug, ambilMenus } from "@/lib/db";
import { supabaseAktif } from "@/lib/supabase";
import type { Menu } from "@/lib/types";

// Halaman dibuat ulang paling cepat setiap 5 menit supaya perubahan menu dari
// panel admin ikut terlihat tanpa perlu build ulang.
export const revalidate = 300;

/**
 * Mengambil satu menu untuk dirender di server.
 *
 * Bila Supabase belum dikonfigurasi — atau sedang tidak bisa dihubungi saat
 * build — halaman jatuh ke data contoh di src/data/menu.ts sehingga situs
 * tetap tampil.
 */
async function ambilMenu(slug: string): Promise<Menu | null> {
  if (supabaseAktif) {
    try {
      const dariDb = await ambilMenuSlug(slug);
      if (dariDb) return dariDb;
    } catch {
      /* lanjut ke data contoh di bawah */
    }
  }
  return menuAwal.find((m) => m.slug === slug) ?? null;
}

export async function generateStaticParams() {
  if (supabaseAktif) {
    try {
      const daftar = await ambilMenus();
      if (daftar.length > 0) return daftar.map((m) => ({ slug: m.slug }));
    } catch {
      /* lanjut ke data contoh di bawah */
    }
  }
  return menuAwal.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const menu = await ambilMenu(slug);
  if (!menu) return { title: "Menu tidak ditemukan" };
  return {
    title: menu.nama,
    description: menu.deskripsi,
  };
}

export default async function HalamanDetailMenu({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const menu = await ambilMenu(slug);
  if (!menu) notFound();

  return <DetailMenu menuAwalan={menu} />;
}
