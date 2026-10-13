export const profil = {
  nama: "Asri Catering",
  tagline: "Katering nasi kotak & bento untuk setiap acara",
  pemilik: "Asri",
  berdiri: "28 Agustus 2026",
  deskripsiSingkat:
    "Asri Catering menerima pesanan nasi kotak, bento, tumpeng mini, dan snack box untuk acara kantor, sekolah, pengajian, dan keluarga. Semua masakan diolah pada hari pengantaran di dapur sendiri.",
  sejarah: [
    {
      tahun: "Agt 2026",
      judul: "Membuka warung nasi rames",
      isi: "Pada 28 Agustus 2026 Asri membuka warung nasi rames di Jambusari, Jeruklegi. Sampai sekarang warung ini tetap buka untuk pembeli yang datang langsung.",
    },
    {
      tahun: "Kini",
      judul: "Merintis paket katering",
      isi: "Dari dapur yang sama, Asri mulai menerima pesanan katering untuk acara: nasi kotak, bento, tumpeng mini, dan snack box. Pilihan menunya masih sedikit karena baru dirintis, dan akan bertambah seiring pesanan yang masuk.",
    },
  ],
  alamat: "Jl. Nata Bangsa RT 01 RW 10, Desa Jambusari, Kecamatan Jeruklegi, Kabupaten Cilacap, Jawa Tengah",
  alamatSingkat: "Jl. Nata Bangsa, Jambusari, Jeruklegi, Cilacap",
  telepon: "0851-3375-0156",
  teleponRaw: "6285133750156",
  email: "halo@asricatering.id",
  instagram: "@asricatering.id",
  jamOperasional: [
    { hari: "Setiap hari", jam: "07.00 - 18.00" },
    { hari: "Pesanan katering", jam: "Paling lambat H-2" },
  ],
  areaLayanan: [
    "Jeruklegi dan sekitarnya",
    "Kota Cilacap",
    "Kabupaten Cilacap",
  ],
  statistik: [
    { angka: "2026", label: "Warung rames buka sejak 28 Agustus" },
    { angka: "6", label: "Paket katering" },
    { angka: "7 hari", label: "Terima pesanan setiap hari" },
    { angka: "H-2", label: "Batas paling lambat memesan" },
  ],
  keunggulan: [
    {
      judul: "Dimasak hari itu juga",
      isi: "Diolah dini hari menjelang pengantaran, bukan stok kemarin.",
    },
    {
      judul: "Harga tercantum jelas",
      isi: "Isi paket dan harga per porsi terbuka, tanpa biaya tersembunyi.",
    },
    {
      judul: "Bisa cicip dulu",
      isi: "Pesanan di atas 100 porsi bisa minta porsi cicip tanpa biaya.",
    },
    {
      judul: "Pesanan tercatat rapi",
      isi: "Tiap pesanan punya kode untuk memantau statusnya.",
    },
  ],
  // Usaha katering baru dirintis, belum ada ulasan pelanggan. Isi dengan
  // ulasan asli (nama, peran, isi); seksi testimoni muncul begitu ada isinya.
  testimoni: [] as { nama: string; peran: string; isi: string }[],
  langkahPesan: [
    {
      judul: "Pilih menu",
      ringkas: "Tentukan paket dan jumlah porsi.",
      isi: "Telusuri katalog menu dan pilih paket yang sesuai dengan acara serta jumlah tamu Anda.",
    },
    {
      judul: "Isi jadwal & lokasi",
      ringkas: "Masuk, pilih tanggal (min. H-2), tandai lokasi.",
      isi: "Masuk ke akun Anda, pilih tanggal acara paling cepat lusa (H-2) beserta jamnya, lalu tandai lokasi pengantaran di peta.",
    },
    {
      judul: "Bayar online",
      ringkas: "QRIS dari m-banking atau e-wallet apa pun.",
      isi: "Bayar dengan QRIS dari aplikasi m-banking atau e-wallet apa pun. Nominal sudah terisi, dan pembayaran terkonfirmasi tanpa perlu kirim bukti transfer.",
    },
    {
      judul: "Pantau & terima",
      ringkas: "Lihat status sampai pesanan tiba.",
      isi: "Pantau pesanan di halaman Pesanan Saya: dibayar, dimasak, dikirim, sampai selesai.",
    },
  ],
  faq: [
    {
      tanya: "Berapa minimal pemesanan?",
      jawab:
        "Minimal pemesanan berbeda tiap paket. Nasi box mulai 10 box, snack box mulai 20 box, sedangkan tumpeng bisa dipesan satuan.",
    },
    {
      tanya: "Berapa hari sebelumnya pesanan harus dibuat?",
      jawab:
        "Paling lambat H-2, artinya dua hari sebelum acara. Pesanan untuk hari ini dan besok tidak bisa dibuat. Pesanan diterima setiap hari, dan untuk jumlah besar sebaiknya dipesan lebih awal.",
    },
    {
      tanya: "Apakah ada biaya antar?",
      jawab:
        "Tidak ada. Ongkir gratis untuk lokasi di dalam area layanan kami. Saat memesan, tandai lokasi di peta dan sistem langsung memberi tahu apakah lokasi tersebut terjangkau.",
    },
    {
      tanya: "Bagaimana cara pembayaran?",
      jawab:
        "Pembayaran penuh dilakukan saat checkout dengan QRIS: scan dari aplikasi m-banking atau e-wallet apa pun, nominal sudah terisi. Begitu pembayaran masuk, status pesanan berubah tanpa perlu mengirim bukti transfer.",
    },
    {
      tanya: "Apakah menu bisa disesuaikan?",
      jawab:
        "Bisa. Isi lauk pada paket nasi kotak dan tumpeng dapat diganti sesuai permintaan. Silakan tuliskan permintaan Anda pada kolom catatan saat memesan.",
    },
  ],
};
