import type { KonteksAi, KonteksMenuAi } from "@/lib/ai-tipe";

/**
 * Menyusun ulang data dari browser bidang demi bidang sebelum dikirim ke
 * Gemini.
 *
 * Tujuannya dua: memastikan bentuk datanya benar, dan menjamin tidak ada
 * bidang lain yang ikut terbawa. Seandainya browser mengirimkan nama atau
 * nomor telepon pemesan, bidang itu tidak akan pernah disalin ke hasil fungsi
 * ini sehingga tidak ikut dikirim keluar.
 */

const n = (v: unknown, batas = 1e12): number => {
  const angka = Number(v);
  if (!Number.isFinite(angka)) return 0;
  return Math.max(-batas, Math.min(batas, Math.round(angka * 100) / 100));
};

const t = (v: unknown, panjang = 80): string =>
  typeof v === "string" ? v.slice(0, panjang) : "";

const larik = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

export function bersihkanKonteks(mentah: unknown): KonteksAi {
  const k = (mentah ?? {}) as Record<string, never>;
  const ringkasan = (k.ringkasan ?? {}) as Record<string, unknown>;
  const target = (k.target ?? {}) as Record<string, unknown>;
  const aktif = (k.pesananAktif ?? {}) as Record<string, unknown>;

  return {
    periodeHari: Math.max(1, Math.min(365, n(k.periodeHari) || 7)),
    target: {
      marginPersen: n(target.marginPersen, 100),
      overheadPersen: n(target.overheadPersen, 100),
    },
    ringkasan: {
      pendapatan: n(ringkasan.pendapatan),
      hpp: n(ringkasan.hpp),
      laba: n(ringkasan.laba),
      marginPersen: n(ringkasan.marginPersen, 1000),
      porsi: n(ringkasan.porsi),
      pesanan: n(ringkasan.pesanan),
    },
    harian: larik(k.harian)
      .slice(0, 31)
      .map((baris) => {
        const b = baris as Record<string, unknown>;
        return {
          tanggal: t(b.tanggal, 10),
          pendapatan: n(b.pendapatan),
          laba: n(b.laba),
          marginPersen: n(b.marginPersen, 1000),
        };
      }),
    menu: larik(k.menu)
      .slice(0, 25)
      .map((baris) => {
        const b = baris as Record<string, unknown>;
        return {
          nama: t(b.nama, 100),
          kategori: t(b.kategori, 40),
          porsi: n(b.porsi),
          pendapatan: n(b.pendapatan),
          laba: n(b.laba),
          marginPersen: n(b.marginPersen, 1000),
        };
      }),
    bahanKurang: larik(k.bahanKurang)
      .slice(0, 20)
      .map((baris) => {
        const b = baris as Record<string, unknown>;
        return {
          nama: t(b.nama, 100),
          satuan: t(b.satuan, 10),
          butuh: n(b.butuh),
          stok: n(b.stok),
          kurang: n(b.kurang),
          biaya: n(b.biaya),
        };
      }),
    pesananAktif: {
      menunggu: n(aktif.menunggu),
      diproses: n(aktif.diproses),
    },
  };
}

export function bersihkanKonteksMenu(mentah: unknown): KonteksMenuAi {
  const m = (mentah ?? {}) as Record<string, unknown>;
  return {
    nama: t(m.nama, 100),
    satuanJual: t(m.satuanJual, 30),
    hargaJual: n(m.hargaJual),
    hpp: n(m.hpp),
    biayaBahan: n(m.biayaBahan),
    biayaKemasan: n(m.biayaKemasan),
    biayaTenagaKerja: n(m.biayaTenagaKerja),
    overhead: n(m.overhead),
    marginPersen: n(m.marginPersen, 1000),
    labaPerPorsi: n(m.labaPerPorsi),
    usulanHarga: n(m.usulanHarga),
    bahan: larik(m.bahan)
      .slice(0, 30)
      .map((baris) => {
        const b = baris as Record<string, unknown>;
        return {
          nama: t(b.nama, 100),
          jumlah: n(b.jumlah),
          satuan: t(b.satuan, 10),
          subtotal: n(b.subtotal),
          kontribusiPersen: n(b.kontribusiPersen, 100),
        };
      }),
  };
}
