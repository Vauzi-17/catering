import { menuAwal } from "@/data/menu";
import type { ItemPesanan, Pesanan, StatusPesanan } from "@/lib/types";

const pelanggan = [
  { nama: "Rina Kusumawati", telepon: "0812-9087-1122", alamat: "Kantor Dinas Pendidikan, Jl. Radjiman No. 6, Bandung" },
  { nama: "Hendra Saputra", telepon: "0857-3311-2098", alamat: "Jl. Cigadung Raya Timur No. 14, Bandung" },
  { nama: "Dewi Anggraeni", telepon: "0813-2277-8890", alamat: "Perum Griya Asri Blok C2 No. 8, Cimahi" },
  { nama: "SMP Negeri 12", telepon: "022-7301-448", alamat: "Jl. Setiabudi No. 112, Bandung" },
  { nama: "Bapak Yusuf Maulana", telepon: "0878-5512-4433", alamat: "Jl. Cibaduyut Lama No. 45, Bandung" },
  { nama: "PT Sinar Mandiri", telepon: "0811-2299-3040", alamat: "Gedung Pasifik Lt. 3, Jl. Asia Afrika, Bandung" },
  { nama: "Ibu Siti Rahayu", telepon: "0819-4455-6677", alamat: "Jl. Kopo Permai II No. 23, Bandung" },
  { nama: "Panitia Pengajian RW 04", telepon: "0852-1188-7766", alamat: "Masjid Al-Ikhlas, Jl. Melati Raya, Bandung" },
  { nama: "Klinik Sehat Bersama", telepon: "0821-3344-5566", alamat: "Jl. Buah Batu No. 201, Bandung" },
  { nama: "Bapak Agus Priyanto", telepon: "0896-2211-9900", alamat: "Jl. Sukajadi No. 76, Bandung" },
];

const komposisi: { menuSlug: string; qty: number }[][] = [
  [{ menuSlug: "paket-nasi-kotak-acara-kantor", qty: 45 }],
  [{ menuSlug: "snack-box-isi-3", qty: 60 }, { menuSlug: "paket-bento-ayam-kremes", qty: 60 }],
  [{ menuSlug: "tumpeng-mini", qty: 1 }, { menuSlug: "snack-box-premium", qty: 20 }],
  [{ menuSlug: "paket-nasi-kuning-bento-royal", qty: 30 }],
  [{ menuSlug: "prasmanan-paket-silver", qty: 80 }],
  [{ menuSlug: "paket-nasi-kotak-acara-kantor", qty: 25 }, { menuSlug: "ayam-goreng-lengkuas", qty: 25 }],
  [{ menuSlug: "paket-nasi-kotak-rendang-vip", qty: 20 }],
  [{ menuSlug: "snack-box-premium", qty: 40 }],
  [{ menuSlug: "paket-bento-ayam-kremes", qty: 100 }],
  [{ menuSlug: "prasmanan-paket-gold", qty: 120 }],
  [{ menuSlug: "paket-nasi-kotak-nila-bakar", qty: 35 }, { menuSlug: "gudeg-nangka", qty: 35 }],
  [{ menuSlug: "tumpeng-komplit-nampan", qty: 1 }],
  [{ menuSlug: "paket-nasi-kotak-acara-kantor", qty: 55 }, { menuSlug: "snack-box-isi-3", qty: 55 }],
  [{ menuSlug: "paket-nasi-kuning-bento-royal", qty: 18 }, { menuSlug: "tahu-tempe-bacem", qty: 18 }],
  [{ menuSlug: "snack-box-isi-3", qty: 30 }],
  [{ menuSlug: "paket-bento-ayam-kremes", qty: 70 }],
  [{ menuSlug: "prasmanan-paket-silver", qty: 60 }],
  [{ menuSlug: "paket-nasi-kotak-acara-kantor", qty: 40 }],
  [{ menuSlug: "tumpeng-mini", qty: 2 }],
  [{ menuSlug: "paket-nasi-kotak-rendang-vip", qty: 24 }, { menuSlug: "snack-box-premium", qty: 24 }],
  [{ menuSlug: "paket-nasi-kotak-acara-kantor", qty: 32 }],
  [{ menuSlug: "snack-box-premium", qty: 50 }],
];

const catatanContoh = [
  "Mohon sambalnya dipisah ya.",
  "Tolong tambahkan sendok dan tisu ekstra.",
  "Ada 3 porsi tanpa daging, untuk tamu vegetarian.",
  "",
  "Pengantaran lewat pintu samping gedung.",
  "",
  "Tolong nasi jangan terlalu pedas.",
  "",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function tanggalKe(offsetHari: number) {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() + offsetHari);
  return d;
}

function formatTanggal(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function kodePesanan(d: Date, urutan: number) {
  const yy = d.getFullYear().toString().slice(2);
  return `ASR-${yy}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(urutan)}`;
}

/**
 * Data contoh pesanan yang dipakai saat sistem pertama kali dijalankan.
 * Tanggal dihitung relatif terhadap hari ini supaya laporan harian
 * selalu memiliki data untuk ditampilkan.
 */
export function buatPesananAwal(): Pesanan[] {
  // Offset hari: negatif = sudah lewat, positif = acara mendatang
  const offsets = [
    -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 0, 0, 1, 1, 2, 3, 4, 6, 8,
  ];

  return offsets.map((offset, i) => {
    const tanggal = tanggalKe(offset);
    const dibuat = tanggalKe(offset - 3);
    const pel = pelanggan[i % pelanggan.length];
    const komp = komposisi[i % komposisi.length];

    const items: ItemPesanan[] = komp.map((k) => {
      const menu = menuAwal.find((m) => m.slug === k.menuSlug)!;
      return {
        menuId: menu.id,
        nama: menu.nama,
        qty: k.qty,
        harga: menu.hargaJual,
      };
    });

    const total = items.reduce((acc, it) => acc + it.harga * it.qty, 0);

    let status: StatusPesanan;
    if (offset < -1) status = i === 4 ? "Dibatalkan" : "Selesai";
    else if (offset === -1) status = "Selesai";
    else if (offset === 0) status = "Diproses";
    else if (offset <= 2) status = i % 2 === 0 ? "Diproses" : "Menunggu Konfirmasi";
    else status = "Menunggu Konfirmasi";

    const alurStatus: StatusPesanan[] = [
      "Menunggu Konfirmasi",
      "Diproses",
      "Selesai",
    ];
    const batasIndex =
      status === "Dibatalkan" ? 0 : alurStatus.indexOf(status);
    const riwayat = alurStatus.slice(0, batasIndex + 1).map((s, idx) => ({
      status: s,
      waktu: new Date(dibuat.getTime() + idx * 26 * 3600 * 1000).toISOString(),
    }));
    if (status === "Dibatalkan") {
      riwayat.push({
        status: "Dibatalkan",
        waktu: new Date(dibuat.getTime() + 20 * 3600 * 1000).toISOString(),
      });
    }

    return {
      id: `ps-${pad(i + 1)}`,
      kode: kodePesanan(tanggal, i + 1),
      nama: pel.nama,
      telepon: pel.telepon,
      alamat: pel.alamat,
      tanggalAcara: formatTanggal(tanggal),
      waktuAntar: ["07.30", "09.00", "11.00", "11.30", "15.00"][i % 5].replace(".", ":"),
      metode: i % 5 === 0 ? "Ambil di Tempat" : "Antar ke Alamat",
      catatan: catatanContoh[i % catatanContoh.length],
      items,
      total,
      status,
      dibuatPada: dibuat.toISOString(),
      riwayat,
    };
  });
}
