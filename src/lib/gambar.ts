"use client";

export const TIPE_FOTO = ["image/jpeg", "image/png", "image/webp"];
export const MAKS_FOTO_MB = 5;
const SISI_MAKS = 1600;

/**
 * Mengecilkan foto sebelum diunggah: sisi terpanjang paling besar 1600 px,
 * disimpan sebagai WebP (atau JPEG bila peramban tidak bisa membuat WebP).
 * Foto ponsel 4–8 MB biasanya menjadi 150–400 KB tanpa terlihat bedanya
 * di kartu menu.
 */
export async function kecilkanFoto(berkas: File): Promise<Blob> {
  const gambar = await createImageBitmap(berkas);
  const skala = Math.min(1, SISI_MAKS / Math.max(gambar.width, gambar.height));
  const kanvas = document.createElement("canvas");
  kanvas.width = Math.round(gambar.width * skala);
  kanvas.height = Math.round(gambar.height * skala);
  const ctx = kanvas.getContext("2d");
  if (!ctx) return berkas;
  ctx.drawImage(gambar, 0, 0, kanvas.width, kanvas.height);
  gambar.close();

  const jadi = (tipe: string) =>
    new Promise<Blob | null>((selesai) => kanvas.toBlob(selesai, tipe, 0.85));
  const webp = await jadi("image/webp");
  if (webp && webp.type === "image/webp") return webp;
  return (await jadi("image/jpeg")) ?? berkas;
}
