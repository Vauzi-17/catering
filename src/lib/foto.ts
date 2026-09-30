import { menuAwal } from "@/data/menu";

/**
 * Foto dekorasi (hero, kolase) diambil dari data contoh menurut slug menu.
 * Hasilnya string kosong bila menu belum punya foto, dan pemanggil
 * cukup melewatinya.
 */
export function fotoMenu(slug: string): string {
  return menuAwal.find((m) => m.slug === slug)?.foto ?? "";
}

export const fotoDekorasi = [
  fotoMenu("paket-nasi-kotak-acara-kantor"),
  fotoMenu("paket-nasi-kuning-bento-royal"),
  fotoMenu("paket-nasi-kotak-rendang-vip"),
  fotoMenu("paket-nasi-kotak-nila-bakar"),
].filter(Boolean);
