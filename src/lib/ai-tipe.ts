import type { CatatanAnalisis } from "@/lib/analisis";

/**
 * Bentuk data yang boleh dikirim ke Gemini.
 *
 * Perhatikan: di sini TIDAK ADA nama pemesan, nomor telepon, maupun alamat.
 * Yang dikirim hanya angka hasil perhitungan aplikasi. Route handler di
 * src/app/api/ai/ menyusun ulang objek ini bidang demi bidang sebelum
 * meneruskannya, sehingga bidang tambahan apa pun dari browser akan dibuang.
 */
export interface KonteksAi {
  periodeHari: number;
  target: {
    marginPersen: number;
    overheadPersen: number;
  };
  ringkasan: {
    pendapatan: number;
    hpp: number;
    laba: number;
    marginPersen: number;
    porsi: number;
    pesanan: number;
  };
  harian: {
    tanggal: string;
    pendapatan: number;
    laba: number;
    marginPersen: number;
  }[];
  menu: {
    nama: string;
    kategori: string;
    porsi: number;
    pendapatan: number;
    laba: number;
    marginPersen: number;
  }[];
  bahanKurang: {
    nama: string;
    satuan: string;
    butuh: number;
    stok: number;
    kurang: number;
    biaya: number;
  }[];
  pesananAktif: {
    menunggu: number;
    diproses: number;
  };
}

/** Rincian satu menu untuk analisis HPP. */
export interface KonteksMenuAi {
  nama: string;
  satuanJual: string;
  hargaJual: number;
  hpp: number;
  biayaBahan: number;
  biayaKemasan: number;
  biayaTenagaKerja: number;
  overhead: number;
  marginPersen: number;
  labaPerPorsi: number;
  usulanHarga: number;
  bahan: {
    nama: string;
    jumlah: number;
    satuan: string;
    subtotal: number;
    kontribusiPersen: number;
  }[];
}

export type JenisInsight = "laporan" | "hpp";

export interface PermintaanInsight {
  jenis: JenisInsight;
  konteks: KonteksAi;
  menu?: KonteksMenuAi;
}

export interface BalasanInsight {
  sumber: "gemini";
  catatan: CatatanAnalisis[];
}

export interface JawabanAi {
  isi: string;
  rincian?: { label: string; nilai: string }[];
}

export interface PermintaanAsisten {
  pertanyaan: string;
  konteks: KonteksAi;
}

export interface BalasanAsisten {
  sumber: "gemini";
  jawaban: JawabanAi;
}

/** Bentuk balasan ketika Gemini tidak tersedia; aplikasi memakai hitungan lokal. */
export interface BalasanGagal {
  sumber: "lokal";
  pesan: string;
}
