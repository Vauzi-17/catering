import type { MetadataRoute } from "next";
import { menuAwal } from "@/data/menu";
import { ambilMenus } from "@/lib/db";
import { supabaseAktif } from "@/lib/supabase";

const asal = process.env.NEXT_PUBLIC_SITE_URL ?? "https://asricatering.id";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const halaman = ["", "/menu", "/tentang"].map((p) => ({
    url: `${asal}${p}/`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  let daftarMenu = menuAwal.map((m) => m.slug);
  if (supabaseAktif) {
    try {
      const dariDb = await ambilMenus();
      if (dariDb.length > 0) daftarMenu = dariDb.map((m) => m.slug);
    } catch {
      /* pakai data contoh */
    }
  }

  return [
    ...halaman,
    ...daftarMenu.map((slug) => ({
      url: `${asal}/menu/${slug}/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
