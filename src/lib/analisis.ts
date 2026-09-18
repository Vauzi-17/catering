import type { Bahan, HasilHpp, Menu, Pesanan } from "@/lib/types";
import { persen, rupiah } from "@/lib/format";

/**
 * Mesin analisis Asri Catering.
 *
 * HPP, margin, dan laporan dihitung oleh aplikasi memakai rumus
 * akuntansi biaya yang baku — bukan oleh AI. Fungsi `analisisHpp` dan
 * `insightLaporan` menyusun catatan penjelasnya dengan aturan
 * heuristik sederhana; keduanya adalah titik yang nanti disambungkan
 * ke Gemini API tanpa mengubah tampilan. Bila API tidak tersedia,
 * perhitungan utama tetap berjalan.
 */

export const OVERHEAD_DEFAULT = 8; // persen dari biaya produksi langsung
export const TARGET_MARGIN_DEFAULT = 30; // persen

export function hitungHpp(
  menu: Menu,
  daftarBahan: Bahan[],
  overheadPersen: number = OVERHEAD_DEFAULT,
): HasilHpp {
  const rincianMentah = menu.resep.map((item) => {
    const bahan = daftarBahan.find((b) => b.id === item.bahanId);
    const hargaSatuan = bahan?.hargaSatuan ?? 0;
    return {
      bahanId: item.bahanId,
      nama: bahan?.nama ?? "Bahan tidak ditemukan",
      jumlah: item.jumlah,
      satuan: bahan?.satuan ?? "pcs",
      hargaSatuan,
      subtotal: hargaSatuan * item.jumlah,
    };
  });

  const biayaBahan = rincianMentah.reduce((a, r) => a + r.subtotal, 0);
  const langsung = biayaBahan + menu.biayaKemasan + menu.biayaTenagaKerja;
  const overhead = (langsung * overheadPersen) / 100;
  const hpp = langsung + overhead;
  const labaPerPorsi = menu.hargaJual - hpp;
  const marginPersen = menu.hargaJual > 0 ? (labaPerPorsi / menu.hargaJual) * 100 : 0;

  const rincian = rincianMentah
    .map((r) => ({
      ...r,
      kontribusiPersen: biayaBahan > 0 ? (r.subtotal / biayaBahan) * 100 : 0,
    }))
    .sort((a, b) => b.subtotal - a.subtotal);

  return {
    menuId: menu.id,
    biayaBahan,
    biayaKemasan: menu.biayaKemasan,
    biayaTenagaKerja: menu.biayaTenagaKerja,
    overhead,
    hpp,
    hargaJual: menu.hargaJual,
    labaPerPorsi,
    marginPersen,
    rincian,
  };
}

export function bulatkanHarga(nilai: number): number {
  if (nilai >= 100_000) return Math.ceil(nilai / 5_000) * 5_000;
  if (nilai >= 20_000) return Math.ceil(nilai / 1_000) * 1_000;
  return Math.ceil(nilai / 500) * 500;
}

export function rekomendasiHarga(hpp: number, targetMargin: number) {
  const aman = Math.min(Math.max(targetMargin, 1), 90);
  const hargaIdeal = hpp / (1 - aman / 100);
  const hargaBulat = bulatkanHarga(hargaIdeal);
  const marginTercapai = hargaBulat > 0 ? ((hargaBulat - hpp) / hargaBulat) * 100 : 0;
  return { hargaIdeal, hargaBulat, marginTercapai };
}

export interface CatatanAnalisis {
  nada: "baik" | "perhatian" | "bahaya" | "info";
  judul: string;
  isi: string;
}

/**
 * Menyusun catatan analisis untuk satu menu: status margin, bahan
 * yang paling menentukan biaya, dan usulan harga jual.
 */
export function analisisHpp(
  menu: Menu,
  hasil: HasilHpp,
  targetMargin: number,
): CatatanAnalisis[] {
  const catatan: CatatanAnalisis[] = [];
  const rek = rekomendasiHarga(hasil.hpp, targetMargin);

  if (hasil.marginPersen < 0) {
    catatan.push({
      nada: "bahaya",
      judul: "Harga jual di bawah biaya produksi",
      isi: `Setiap ${menu.satuanJual.replace("per ", "")} yang terjual justru menimbulkan kerugian ${rupiah(
        Math.abs(hasil.labaPerPorsi),
      )}. Harga jual perlu dinaikkan minimal menjadi ${rupiah(rek.hargaBulat)} untuk mencapai margin ${persen(targetMargin, 0)}.`,
    });
  } else if (hasil.marginPersen < targetMargin - 3) {
    catatan.push({
      nada: "perhatian",
      judul: "Margin masih di bawah target",
      isi: `Margin saat ini ${persen(hasil.marginPersen)}, sedangkan target Anda ${persen(
        targetMargin,
        0,
      )}. Menaikkan harga menjadi ${rupiah(rek.hargaBulat)} akan menutup selisih tersebut, atau tekan biaya bahan sebesar ${rupiah(
        hasil.hpp - menu.hargaJual * (1 - targetMargin / 100),
      )} per porsi.`,
    });
  } else if (hasil.marginPersen > targetMargin + 15) {
    catatan.push({
      nada: "info",
      judul: "Margin jauh di atas target",
      isi: `Margin ${persen(hasil.marginPersen)} tergolong tinggi untuk menu ini. Ruang ini bisa dipakai untuk menambah porsi lauk agar menu lebih bersaing, atau memberi potongan pada pesanan besar tanpa menggerus keuntungan.`,
    });
  } else {
    catatan.push({
      nada: "baik",
      judul: "Margin sudah sehat",
      isi: `Margin ${persen(hasil.marginPersen)} sudah berada di sekitar target ${persen(
        targetMargin,
        0,
      )}. Harga jual ${rupiah(menu.hargaJual)} dapat dipertahankan selama harga bahan tidak berubah lebih dari 10 persen.`,
    });
  }

  const dominan = hasil.rincian[0];
  if (dominan && dominan.kontribusiPersen >= 30) {
    catatan.push({
      nada: "perhatian",
      judul: `${dominan.nama} menentukan ${persen(dominan.kontribusiPersen, 0)} biaya bahan`,
      isi: `Kenaikan harga ${dominan.nama.toLowerCase()} sebesar 10 persen akan menambah HPP sekitar ${rupiah(
        dominan.subtotal * 0.1,
      )} per porsi. Sebaiknya kunci harga bahan ini dengan pemasok tetap atau beli dalam jumlah besar.`,
    });
  }

  const porsiOperasional =
    hasil.hpp > 0
      ? ((hasil.biayaKemasan + hasil.biayaTenagaKerja + hasil.overhead) / hasil.hpp) * 100
      : 0;
  if (porsiOperasional > 35) {
    catatan.push({
      nada: "perhatian",
      judul: "Biaya di luar bahan cukup besar",
      isi: `Kemasan, tenaga kerja, dan overhead menyumbang ${persen(
        porsiOperasional,
        0,
      )} dari HPP. Untuk pesanan di atas 100 porsi, biaya ini biasanya dapat ditekan karena pengerjaannya sekaligus.`,
    });
  }

  return catatan;
}

export interface BarisLaporan {
  tanggal: string;
  jumlahPesanan: number;
  jumlahPorsi: number;
  pendapatan: number;
  hpp: number;
  laba: number;
  margin: number;
}

const STATUS_DIHITUNG = ["Diproses", "Selesai"];

export function laporanHarian(
  pesanan: Pesanan[],
  menus: Menu[],
  daftarBahan: Bahan[],
  overheadPersen = OVERHEAD_DEFAULT,
): BarisLaporan[] {
  const petaHpp = new Map<string, number>();
  menus.forEach((m) => {
    petaHpp.set(m.id, hitungHpp(m, daftarBahan, overheadPersen).hpp);
  });

  const peta = new Map<string, BarisLaporan>();

  pesanan
    .filter((p) => STATUS_DIHITUNG.includes(p.status))
    .forEach((p) => {
      const baris =
        peta.get(p.tanggalAcara) ??
        {
          tanggal: p.tanggalAcara,
          jumlahPesanan: 0,
          jumlahPorsi: 0,
          pendapatan: 0,
          hpp: 0,
          laba: 0,
          margin: 0,
        };

      baris.jumlahPesanan += 1;
      p.items.forEach((it) => {
        baris.jumlahPorsi += it.qty;
        baris.pendapatan += it.harga * it.qty;
        baris.hpp += (petaHpp.get(it.menuId) ?? 0) * it.qty;
      });
      peta.set(p.tanggalAcara, baris);
    });

  return Array.from(peta.values())
    .map((b) => ({
      ...b,
      laba: b.pendapatan - b.hpp,
      margin: b.pendapatan > 0 ? ((b.pendapatan - b.hpp) / b.pendapatan) * 100 : 0,
    }))
    .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
}

export interface KebutuhanBahan {
  bahanId: string;
  nama: string;
  satuan: string;
  jumlah: number;
  hargaSatuan: number;
  biaya: number;
  stok: number;
  kurang: number;
}

/**
 * Menghitung estimasi kebutuhan bahan baku dari seluruh pesanan yang
 * belum selesai, lalu membandingkannya dengan stok yang tercatat.
 */
export function kebutuhanBahan(
  pesanan: Pesanan[],
  menus: Menu[],
  daftarBahan: Bahan[],
): KebutuhanBahan[] {
  const peta = new Map<string, number>();

  pesanan
    .filter((p) => p.status === "Menunggu Konfirmasi" || p.status === "Diproses")
    .forEach((p) => {
      p.items.forEach((it) => {
        const menu = menus.find((m) => m.id === it.menuId);
        if (!menu) return;
        menu.resep.forEach((r) => {
          peta.set(r.bahanId, (peta.get(r.bahanId) ?? 0) + r.jumlah * it.qty);
        });
      });
    });

  return Array.from(peta.entries())
    .map(([bahanId, jumlah]) => {
      const bahan = daftarBahan.find((b) => b.id === bahanId);
      const hargaSatuan = bahan?.hargaSatuan ?? 0;
      const stok = bahan?.stok ?? 0;
      return {
        bahanId,
        nama: bahan?.nama ?? bahanId,
        satuan: bahan?.satuan ?? "pcs",
        jumlah,
        hargaSatuan,
        biaya: hargaSatuan * jumlah,
        stok,
        kurang: Math.max(0, jumlah - stok),
      };
    })
    .sort((a, b) => b.biaya - a.biaya);
}

export interface PerformaMenu {
  menuId: string;
  nama: string;
  kategori: string;
  porsi: number;
  pendapatan: number;
  laba: number;
  margin: number;
}

export function performaMenu(
  pesanan: Pesanan[],
  menus: Menu[],
  daftarBahan: Bahan[],
  overheadPersen = OVERHEAD_DEFAULT,
): PerformaMenu[] {
  const peta = new Map<string, PerformaMenu>();

  pesanan
    .filter((p) => STATUS_DIHITUNG.includes(p.status))
    .forEach((p) => {
      p.items.forEach((it) => {
        const menu = menus.find((m) => m.id === it.menuId);
        if (!menu) return;
        const hpp = hitungHpp(menu, daftarBahan, overheadPersen).hpp;
        const baris =
          peta.get(menu.id) ??
          {
            menuId: menu.id,
            nama: menu.nama,
            kategori: menu.kategori,
            porsi: 0,
            pendapatan: 0,
            laba: 0,
            margin: 0,
          };
        baris.porsi += it.qty;
        baris.pendapatan += it.harga * it.qty;
        baris.laba += (it.harga - hpp) * it.qty;
        peta.set(menu.id, baris);
      });
    });

  return Array.from(peta.values())
    .map((b) => ({
      ...b,
      margin: b.pendapatan > 0 ? (b.laba / b.pendapatan) * 100 : 0,
    }))
    .sort((a, b) => b.pendapatan - a.pendapatan);
}

/**
 * Menyusun ringkasan naratif dari laporan: tren pendapatan, menu
 * penyumbang laba terbesar, menu bermargin tipis, dan peringatan stok.
 */
export function insightLaporan(
  laporan: BarisLaporan[],
  performa: PerformaMenu[],
  kebutuhan: KebutuhanBahan[],
): CatatanAnalisis[] {
  const catatan: CatatanAnalisis[] = [];
  const tujuhTerakhir = laporan.slice(0, 7);
  const tujuhSebelumnya = laporan.slice(7, 14);

  if (tujuhTerakhir.length > 0) {
    const kini = tujuhTerakhir.reduce((a, b) => a + b.pendapatan, 0);
    const lalu = tujuhSebelumnya.reduce((a, b) => a + b.pendapatan, 0);
    const rata = kini / tujuhTerakhir.length;

    if (lalu > 0) {
      const selisih = ((kini - lalu) / lalu) * 100;
      catatan.push({
        nada: selisih >= 0 ? "baik" : "perhatian",
        judul:
          selisih >= 0
            ? `Pendapatan naik ${persen(Math.abs(selisih), 0)} dibanding periode sebelumnya`
            : `Pendapatan turun ${persen(Math.abs(selisih), 0)} dibanding periode sebelumnya`,
        isi: `Tujuh hari terakhir mencatat ${rupiah(kini)} dari ${rupiah(
          lalu,
        )} pada tujuh hari sebelumnya. Rata-rata harian berada di angka ${rupiah(rata)}.`,
      });
    } else {
      catatan.push({
        nada: "info",
        judul: "Ringkasan tujuh hari terakhir",
        isi: `Total pendapatan ${rupiah(kini)} dengan rata-rata harian ${rupiah(rata)}.`,
      });
    }

    const hariTerbaik = [...tujuhTerakhir].sort((a, b) => b.pendapatan - a.pendapatan)[0];
    if (hariTerbaik) {
      catatan.push({
        nada: "info",
        judul: "Hari dengan pendapatan tertinggi",
        isi: `Pendapatan tertinggi tercatat ${rupiah(hariTerbaik.pendapatan)} dari ${hariTerbaik.jumlahPorsi} porsi. Pola seperti ini biasanya muncul pada hari kerja awal pekan, sehingga persiapan bahan sebaiknya ditambah pada hari tersebut.`,
      });
    }
  }

  const terbaik = performa[0];
  if (terbaik) {
    catatan.push({
      nada: "baik",
      judul: `${terbaik.nama} menyumbang laba terbesar`,
      isi: `Menu ini menghasilkan laba ${rupiah(terbaik.laba)} dari ${terbaik.porsi} porsi dengan margin ${persen(
        terbaik.margin,
      )}. Menjadikannya menu utama pada penawaran paket akan menjaga laba tetap stabil.`,
    });
  }

  const tipis = performa.filter((p) => p.margin < 20).sort((a, b) => a.margin - b.margin)[0];
  if (tipis) {
    catatan.push({
      nada: "perhatian",
      judul: `Margin ${tipis.nama} hanya ${persen(tipis.margin)}`,
      isi: `Menu ini terjual ${tipis.porsi} porsi namun labanya tipis. Pertimbangkan menaikkan harga sekitar ${rupiah(
        Math.max(500, bulatkanHarga((tipis.pendapatan / Math.max(tipis.porsi, 1)) * 0.08) - 0),
      )} per porsi atau mengganti salah satu bahan dengan alternatif yang lebih murah.`,
    });
  }

  const kurangStok = kebutuhan.filter((k) => k.kurang > 0);
  if (kurangStok.length > 0) {
    const biayaBelanja = kurangStok.reduce((a, k) => a + k.kurang * k.hargaSatuan, 0);
    catatan.push({
      nada: "bahaya",
      judul: `${kurangStok.length} bahan perlu segera dibelanjakan`,
      isi: `Pesanan yang sedang berjalan membutuhkan tambahan ${kurangStok
        .slice(0, 3)
        .map((k) => `${k.nama} ${k.kurang.toFixed(1).replace(".", ",")} ${k.satuan}`)
        .join(", ")}${kurangStok.length > 3 ? ", dan lainnya" : ""}. Perkiraan dana belanja yang dibutuhkan ${rupiah(
        biayaBelanja,
      )}.`,
    });
  } else if (kebutuhan.length > 0) {
    catatan.push({
      nada: "baik",
      judul: "Stok bahan mencukupi",
      isi: `Seluruh pesanan yang sedang berjalan dapat dikerjakan dengan stok yang ada. Nilai bahan yang akan terpakai sekitar ${rupiah(
        kebutuhan.reduce((a, k) => a + k.biaya, 0),
      )}.`,
    });
  }

  return catatan;
}
