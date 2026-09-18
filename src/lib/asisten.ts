import {
  hitungHpp,
  kebutuhanBahan,
  laporanHarian,
  performaMenu,
  rekomendasiHarga,
} from "@/lib/analisis";
import { angka, persen, rupiah, tanggalHariIni, tanggalPendek } from "@/lib/format";
import type { Bahan, Menu, Pesanan } from "@/lib/types";

export interface JawabanAsisten {
  isi: string;
  rincian?: { label: string; nilai: string }[];
}

export interface DataAsisten {
  pesanan: Pesanan[];
  menus: Menu[];
  bahan: Bahan[];
  overheadPersen: number;
  targetMargin: number;
}

export const contohPertanyaan = [
  "Bagaimana penjualan hari ini?",
  "Menu apa yang paling banyak terjual minggu ini?",
  "Menu mana yang marginnya paling besar?",
  "Bahan apa yang perlu dibelanjakan?",
  "Berapa HPP nasi rames komplit?",
  "Ada berapa pesanan yang belum dikonfirmasi?",
];

function mengandung(teks: string, kata: string[]) {
  return kata.some((k) => teks.includes(k));
}

/**
 * Menjawab pertanyaan admin dari data yang tercatat di sistem.
 *
 * Versi ini mencocokkan kata kunci lalu membacakan angka hasil
 * perhitungan aplikasi. Saat backend siap, isi fungsi ini diganti
 * pemanggilan Gemini API dengan data yang sama sebagai konteks —
 * data pribadi pelanggan tidak ikut dikirim.
 */
export function jawabPertanyaan(
  pertanyaan: string,
  data: DataAsisten,
): JawabanAsisten {
  const t = pertanyaan.toLowerCase();
  const { pesanan, menus, bahan, overheadPersen, targetMargin } = data;

  const laporan = laporanHarian(pesanan, menus, bahan, overheadPersen);
  const performa = performaMenu(pesanan, menus, bahan, overheadPersen);

  // Penjualan / pendapatan hari ini
  if (mengandung(t, ["hari ini", "hari ni", "penjualan hari"])) {
    const baris = laporan.find((l) => l.tanggal === tanggalHariIni());
    if (!baris) {
      return {
        isi: "Hari ini belum ada pesanan yang tercatat sebagai pendapatan. Pesanan baru masuk ke laporan setelah Anda konfirmasi.",
      };
    }
    return {
      isi: `Hari ini tercatat ${baris.jumlahPesanan} pesanan dengan ${baris.jumlahPorsi} porsi.`,
      rincian: [
        { label: "Pendapatan", nilai: rupiah(baris.pendapatan) },
        { label: "HPP", nilai: rupiah(baris.hpp) },
        { label: "Laba", nilai: rupiah(baris.laba) },
        { label: "Margin", nilai: persen(baris.margin) },
      ],
    };
  }

  // Menu terlaris
  if (mengandung(t, ["terlaris", "paling banyak terjual", "paling laku", "terjual"])) {
    const urut = [...performa].sort((a, b) => b.porsi - a.porsi).slice(0, 3);
    if (urut.length === 0) return { isi: "Belum ada penjualan yang tercatat." };
    return {
      isi: `Menu paling banyak terjual adalah ${urut[0].nama} sebanyak ${urut[0].porsi} porsi.`,
      rincian: urut.map((m) => ({
        label: m.nama,
        nilai: `${m.porsi} porsi · ${rupiah(m.pendapatan)}`,
      })),
    };
  }

  // Margin terbesar / terkecil
  if (mengandung(t, ["margin"])) {
    const kecil = mengandung(t, ["kecil", "tipis", "rendah", "terendah"]);
    const urut = [...performa].sort((a, b) =>
      kecil ? a.margin - b.margin : b.margin - a.margin,
    );
    if (urut.length === 0) return { isi: "Belum ada penjualan yang bisa dihitung marginnya." };
    return {
      isi: kecil
        ? `Margin paling tipis ada pada ${urut[0].nama}, yaitu ${persen(urut[0].margin)}.`
        : `Margin paling besar ada pada ${urut[0].nama}, yaitu ${persen(urut[0].margin)}.`,
      rincian: urut.slice(0, 3).map((m) => ({
        label: m.nama,
        nilai: `${persen(m.margin)} · laba ${rupiah(m.laba)}`,
      })),
    };
  }

  // Kebutuhan bahan / belanja
  if (mengandung(t, ["bahan", "belanja", "stok"])) {
    const kebutuhan = kebutuhanBahan(pesanan, menus, bahan);
    const kurang = kebutuhan.filter((k) => k.kurang > 0);
    if (kurang.length === 0) {
      return {
        isi: "Stok bahan masih mencukupi untuk seluruh pesanan yang sedang berjalan.",
      };
    }
    const dana = kurang.reduce((a, k) => a + k.kurang * k.hargaSatuan, 0);
    return {
      isi: `Ada ${kurang.length} bahan yang perlu dibelanjakan. Perkiraan dana ${rupiah(dana)}.`,
      rincian: kurang.slice(0, 5).map((k) => ({
        label: k.nama,
        nilai: `kurang ${angka(k.kurang, 2)} ${k.satuan}`,
      })),
    };
  }

  // HPP menu tertentu
  if (mengandung(t, ["hpp", "modal", "biaya produksi"])) {
    const cocok = menus.find((m) => t.includes(m.nama.toLowerCase()));
    if (cocok) {
      const h = hitungHpp(cocok, bahan, overheadPersen);
      const r = rekomendasiHarga(h.hpp, targetMargin);
      return {
        isi: `HPP ${cocok.nama} adalah ${rupiah(h.hpp)} per porsi.`,
        rincian: [
          { label: "Biaya bahan", nilai: rupiah(h.biayaBahan) },
          { label: "Harga jual sekarang", nilai: rupiah(h.hargaJual) },
          { label: "Laba per porsi", nilai: `${rupiah(h.labaPerPorsi)} (${persen(h.marginPersen)})` },
          { label: `Usulan harga (margin ${persen(targetMargin, 0)})`, nilai: rupiah(r.hargaBulat) },
        ],
      };
    }
    const semua = menus
      .map((m) => ({ nama: m.nama, hpp: hitungHpp(m, bahan, overheadPersen).hpp }))
      .sort((a, b) => b.hpp - a.hpp)
      .slice(0, 5);
    return {
      isi: "Sebutkan nama menunya untuk melihat rincian HPP. Berikut lima menu dengan HPP tertinggi:",
      rincian: semua.map((m) => ({ label: m.nama, nilai: rupiah(m.hpp) })),
    };
  }

  // Pesanan belum dikonfirmasi
  if (mengandung(t, ["pesanan", "konfirmasi", "masuk"])) {
    const menunggu = pesanan.filter((p) => p.status === "Menunggu Konfirmasi");
    const diproses = pesanan.filter((p) => p.status === "Diproses");
    return {
      isi: `Ada ${menunggu.length} pesanan menunggu konfirmasi dan ${diproses.length} pesanan sedang diproses.`,
      rincian: menunggu.slice(0, 5).map((p) => ({
        label: `${p.kode} · ${p.nama}`,
        nilai: `${tanggalPendek(p.tanggalAcara)} · ${rupiah(p.total)}`,
      })),
    };
  }

  // Pendapatan minggu ini / periode
  if (mengandung(t, ["minggu", "pekan", "pendapatan", "penjualan", "omzet"])) {
    const tujuh = laporan.slice(0, 7);
    const total = tujuh.reduce((a, b) => a + b.pendapatan, 0);
    const laba = tujuh.reduce((a, b) => a + b.laba, 0);
    return {
      isi: `Tujuh hari terakhir tercatat pendapatan ${rupiah(total)}.`,
      rincian: [
        { label: "Laba", nilai: rupiah(laba) },
        { label: "Margin", nilai: persen(total > 0 ? (laba / total) * 100 : 0) },
        { label: "Rata-rata per hari", nilai: rupiah(total / 7) },
      ],
    };
  }

  return {
    isi: "Pertanyaan itu belum bisa saya jawab. Coba tanyakan tentang penjualan hari ini, menu terlaris, margin menu, HPP sebuah menu, kebutuhan bahan, atau pesanan yang belum dikonfirmasi.",
  };
}
