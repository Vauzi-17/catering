"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { FotoMenu } from "@/components/Placeholder";
import { unggahFotoMenu } from "@/lib/db";
import { kecilkanFoto, MAKS_FOTO_MB, TIPE_FOTO } from "@/lib/gambar";
import { supabaseAktif } from "@/lib/supabase";

/**
 * Isian foto menu pada formulir admin: pilih berkas, dikecilkan di peramban,
 * diunggah ke Supabase Storage, lalu URL publiknya disimpan ke form.
 */
export function IsianFoto({
  nilai,
  nama,
  slug,
  onUbah,
  onSibuk,
}: {
  nilai: string;
  nama: string;
  slug: string;
  onUbah: (url: string) => void;
  onSibuk?: (sibuk: boolean) => void;
}) {
  const masukan = useRef<HTMLInputElement>(null);
  const [mengunggah, setMengunggah] = useState(false);
  const [galat, setGalat] = useState("");

  async function pilih(e: React.ChangeEvent<HTMLInputElement>) {
    const berkas = e.target.files?.[0];
    e.target.value = "";
    if (!berkas) return;
    if (!TIPE_FOTO.includes(berkas.type)) {
      setGalat("Format foto harus JPG, PNG, atau WebP.");
      return;
    }
    if (berkas.size > 20 * 1024 * 1024) {
      setGalat("Ukuran foto terlalu besar. Pilih foto di bawah 20 MB.");
      return;
    }

    setGalat("");
    setMengunggah(true);
    onSibuk?.(true);
    try {
      const kecil = await kecilkanFoto(berkas);
      if (kecil.size > MAKS_FOTO_MB * 1024 * 1024) {
        throw new Error(`Foto masih di atas ${MAKS_FOTO_MB} MB setelah dikecilkan.`);
      }
      onUbah(await unggahFotoMenu(kecil, slug));
    } catch (err) {
      const pesan = err instanceof Error ? err.message : "";
      setGalat(
        /bucket not found/i.test(pesan)
          ? "Penyimpanan foto belum disiapkan. Jalankan supabase/07-foto-menu.sql."
          : /row-level security|unauthorized|403/i.test(pesan)
            ? "Akun ini tidak diizinkan mengunggah foto."
            : pesan || "Foto gagal diunggah. Coba lagi.",
      );
    } finally {
      setMengunggah(false);
      onSibuk?.(false);
    }
  }

  return (
    <div>
      <span className="field-label">Foto menu</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative w-full overflow-hidden rounded-lg border border-line sm:w-44">
          <FotoMenu src={nilai} nama={nama || "menu"} mini />
          {mengunggah && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <LoaderCircle size={22} className="animate-spin text-brand-700" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {supabaseAktif ? (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => masukan.current?.click()}
                  disabled={mengunggah}
                  className="btn btn-outline btn-sm"
                >
                  <ImagePlus size={16} />
                  {mengunggah ? "Mengunggah…" : nilai ? "Ganti foto" : "Unggah foto"}
                </button>
                {nilai && !mengunggah && (
                  <button type="button" onClick={() => onUbah("")} className="btn btn-ghost btn-sm text-red-700">
                    <Trash2 size={16} />
                    Hapus
                  </button>
                )}
              </div>
              <input
                ref={masukan}
                type="file"
                accept={TIPE_FOTO.join(",")}
                onChange={pilih}
                className="hidden"
                aria-label="Pilih foto menu"
              />
              <p className="mt-2 text-[12px] text-ink-muted">
                JPG, PNG, atau WebP. Foto dikecilkan otomatis sebelum diunggah. Rasio 4:3 tampil paling rapi.
              </p>
            </>
          ) : (
            <input
              id="foto"
              className="field"
              value={nilai}
              onChange={(e) => onUbah(e.target.value)}
              placeholder="/images/menu/nama-file.jpg"
              aria-label="Alamat foto menu"
            />
          )}
          {galat && <p className="mt-2 text-[12.5px] font-semibold text-red-700">{galat}</p>}
        </div>
      </div>
    </div>
  );
}
