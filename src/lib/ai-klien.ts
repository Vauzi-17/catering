import { STATUS_PERLU_PROSES } from "@/lib/status";
import {
  hitungHpp,
  kebutuhanBahan,
  laporanHarian,
  performaMenu,
  rekomendasiHarga,
  type CatatanAnalisis,
} from "@/lib/analisis";
import type { JawabanAi, KonteksAi, KonteksMenuAi } from "@/lib/ai-tipe";
import type { Bahan, HasilHpp, Menu, Pesanan } from "@/lib/types";

/**
 * Jembatan antara halaman admin dan Route Handler /api/ai/*.
 *
 * Setiap fungsi mengembalikan null bila Gemini tidak tersedia, sehingga
 * halaman pemanggil dapat langsung memakai perhitungan lokal. Ini memenuhi
 * ketentuan PRD: perhitungan HPP dan laporan tetap berjalan meski API AI mati.
 */

export function susunKonteks({
  pesanan,
  menus,
  bahan,
  overheadPersen,
  targetMargin,
  rentangHari = 7,
}: {
  pesanan: Pesanan[];
  menus: Menu[];
  bahan: Bahan[];
  overheadPersen: number;
  targetMargin: number;
  rentangHari?: number;
}): KonteksAi {
  const laporan = laporanHarian(pesanan, menus, bahan, overheadPersen);
  const performa = performaMenu(pesanan, menus, bahan, overheadPersen);
  const kebutuhan = kebutuhanBahan(pesanan, menus, bahan);

  const batas = new Date();
  batas.setDate(batas.getDate() - (rentangHari - 1));
  const p = (v: number) => v.toString().padStart(2, "0");
  const awal = `${batas.getFullYear()}-${p(batas.getMonth() + 1)}-${p(batas.getDate())}`;
  const dalamPeriode = laporan.filter((l) => l.tanggal >= awal);

  const pendapatan = dalamPeriode.reduce((a, b) => a + b.pendapatan, 0);
  const hpp = dalamPeriode.reduce((a, b) => a + b.hpp, 0);

  return {
    periodeHari: rentangHari,
    target: { marginPersen: targetMargin, overheadPersen },
    ringkasan: {
      pendapatan,
      hpp,
      laba: pendapatan - hpp,
      marginPersen: pendapatan > 0 ? ((pendapatan - hpp) / pendapatan) * 100 : 0,
      porsi: dalamPeriode.reduce((a, b) => a + b.jumlahPorsi, 0),
      pesanan: dalamPeriode.reduce((a, b) => a + b.jumlahPesanan, 0),
    },
    harian: dalamPeriode.map((b) => ({
      tanggal: b.tanggal,
      pendapatan: b.pendapatan,
      laba: b.laba,
      marginPersen: b.margin,
    })),
    menu: performa.slice(0, 20).map((m) => ({
      nama: m.nama,
      kategori: m.kategori,
      porsi: m.porsi,
      pendapatan: m.pendapatan,
      laba: m.laba,
      marginPersen: m.margin,
    })),
    bahanKurang: kebutuhan
      .filter((k) => k.kurang > 0)
      .slice(0, 15)
      .map((k) => ({
        nama: k.nama,
        satuan: k.satuan,
        butuh: k.jumlah,
        stok: k.stok,
        kurang: k.kurang,
        biaya: k.kurang * k.hargaSatuan,
      })),
    pesananAktif: {
      menunggu: pesanan.filter((x) => STATUS_PERLU_PROSES.includes(x.status)).length,
      diproses: pesanan.filter((x) => x.status === "Diproses" || x.status === "Dikirim").length,
    },
  };
}

export function susunKonteksMenu(
  menu: Menu,
  hasil: HasilHpp,
  targetMargin: number,
  daftarBahan: Bahan[],
  overheadPersen: number,
): KonteksMenuAi {
  const dihitung = hasil ?? hitungHpp(menu, daftarBahan, overheadPersen);
  const usulan = rekomendasiHarga(dihitung.hpp, targetMargin);

  return {
    nama: menu.nama,
    satuanJual: menu.satuanJual,
    hargaJual: dihitung.hargaJual,
    hpp: dihitung.hpp,
    biayaBahan: dihitung.biayaBahan,
    biayaKemasan: dihitung.biayaKemasan,
    biayaTenagaKerja: dihitung.biayaTenagaKerja,
    overhead: dihitung.overhead,
    marginPersen: dihitung.marginPersen,
    labaPerPorsi: dihitung.labaPerPorsi,
    usulanHarga: usulan.hargaBulat,
    bahan: dihitung.rincian.map((r) => ({
      nama: r.nama,
      jumlah: r.jumlah,
      satuan: r.satuan,
      subtotal: r.subtotal,
      kontribusiPersen: r.kontribusiPersen,
    })),
  };
}

// Alamat ditulis lengkap dengan garis miring di akhir karena next.config.mjs
// memakai trailingSlash: true — tanpa itu setiap permintaan kena pengalihan 308.
async function kirim<T>(alamat: string, badan: unknown): Promise<T | null> {
  try {
    const tanggapan = await fetch(alamat, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(badan),
    });
    if (!tanggapan.ok) return null;
    return (await tanggapan.json()) as T;
  } catch {
    return null;
  }
}

export async function mintaInsightLaporan(
  konteks: KonteksAi,
): Promise<CatatanAnalisis[] | null> {
  const hasil = await kirim<{ catatan: CatatanAnalisis[] }>("/api/ai/insight/", {
    jenis: "laporan",
    konteks,
  });
  return hasil?.catatan?.length ? hasil.catatan : null;
}

export async function mintaInsightHpp(
  menu: KonteksMenuAi,
  konteks: KonteksAi,
): Promise<CatatanAnalisis[] | null> {
  const hasil = await kirim<{ catatan: CatatanAnalisis[] }>("/api/ai/insight/", {
    jenis: "hpp",
    konteks,
    menu,
  });
  return hasil?.catatan?.length ? hasil.catatan : null;
}

export async function tanyaAsistenAi(
  pertanyaan: string,
  konteks: KonteksAi,
): Promise<JawabanAi | null> {
  const hasil = await kirim<{ jawaban: JawabanAi }>("/api/ai/asisten/", {
    pertanyaan,
    konteks,
  });
  return hasil?.jawaban?.isi ? hasil.jawaban : null;
}
