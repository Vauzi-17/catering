export type Satuan = "kg" | "liter" | "butir" | "pcs" | "ikat" | "pack";

export type KategoriBahan =
  | "Bahan Pokok"
  | "Protein"
  | "Sayuran"
  | "Bumbu"
  | "Kemasan";

export interface Bahan {
  id: string;
  nama: string;
  satuan: Satuan;
  hargaSatuan: number; // Rupiah per 1 satuan
  kategori: KategoriBahan;
  stok: number;
  stokMinimum: number;
}

export interface ItemResep {
  bahanId: string;
  jumlah: number; // dalam satuan bahan
}

export type KategoriMenu =
  | "Nasi Box"
  | "Prasmanan"
  | "Tumpeng"
  | "Snack Box"
  | "Lauk Satuan";

export interface Menu {
  id: string;
  slug: string;
  nama: string;
  kategori: KategoriMenu;
  deskripsi: string;
  deskripsiPanjang: string;
  hargaJual: number;
  satuanJual: string; // "per box", "per porsi", "per paket"
  foto: string;
  isi: string[];
  populer: boolean;
  tersedia: boolean;
  minimalPesan: number;
  resep: ItemResep[];
  // Biaya operasional per porsi (di luar bahan baku)
  biayaKemasan: number;
  biayaTenagaKerja: number;
}

export type StatusPesanan =
  | "Menunggu Pembayaran"
  | "Menunggu Konfirmasi"
  | "Dibayar"
  | "Diproses"
  | "Dikirim"
  | "Selesai"
  | "Dibatalkan";

/** null = pesanan lama/manual yang tidak lewat pembayaran online. */
export type StatusBayar = "Menunggu" | "Lunas" | "Kedaluwarsa" | "Gagal" | "Dikembalikan";

export interface Pembayaran {
  id: string;
  transactionId: string | null;
  statusTransaksi: string;
  jenisPembayaran: string;
  keterangan: string;
  jumlah: number;
  waktuTransaksi: string | null;
  dibuatPada: string;
}

export interface Profil {
  id: string;
  nama: string;
  telepon: string;
  alamat: string;
  patokan: string;
  lat: number | null;
  lng: number | null;
}

export interface ItemPesanan {
  menuId: string;
  nama: string;
  qty: number;
  harga: number;
}

export interface Pesanan {
  id: string;
  kode: string;
  nama: string;
  telepon: string;
  alamat: string;
  tanggalAcara: string; // YYYY-MM-DD
  waktuAntar: string; // HH:mm
  metode: "Antar ke Alamat" | "Ambil di Tempat";
  catatan: string;
  items: ItemPesanan[];
  total: number;
  status: StatusPesanan;
  dibuatPada: string; // ISO date
  riwayat: { status: StatusPesanan; waktu: string }[];
  // Kolom pembayaran online; kosong pada pesanan lama dan mode contoh.
  patokan?: string;
  lat?: number | null;
  lng?: number | null;
  statusBayar?: StatusBayar | null;
  metodeBayar?: string;
  batasBayar?: string | null;
  dibayarPada?: string | null;
  // Tagihan QRIS: nominal = total + kode unik.
  nominalBayar?: number | null;
  kodeUnik?: number | null;
  qrisDinamis?: string | null;
  diklaimBayarPada?: string | null;
  pembayaran?: Pembayaran[];
}

export interface HasilHpp {
  menuId: string;
  biayaBahan: number;
  biayaKemasan: number;
  biayaTenagaKerja: number;
  overhead: number;
  hpp: number;
  hargaJual: number;
  labaPerPorsi: number;
  marginPersen: number;
  rincian: {
    bahanId: string;
    nama: string;
    jumlah: number;
    satuan: Satuan;
    hargaSatuan: number;
    subtotal: number;
    kontribusiPersen: number;
  }[];
}
