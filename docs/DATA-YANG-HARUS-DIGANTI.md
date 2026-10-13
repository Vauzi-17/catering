# Data Contoh yang Harus Diganti

Seluruh data yang tampil sekarang — nama pemilik, nomor telepon,
harga menu, resep, testimoni — masih **karangan untuk keperluan pengembangan**.
Angkanya dibuat masuk akal supaya perhitungan HPP dan laporan bisa diuji, tetapi
tidak satu pun berasal dari Asri Catering yang sebenarnya.

Daftar ini dipakai sebagai penutup sebelum serah terima: gantilah dengan hasil
wawancara dan laporan Anda.

---

## Penting: di mana datanya diganti

Tergantung mode yang sedang aktif (lihat kiri bawah sidebar admin):

| Mode | Tempat mengganti |
| --- | --- |
| **Mode data contoh** (`.env.local` kosong) | Sunting berkas di `src/data/` |
| **Terhubung Supabase** | Lewat **panel admin**, atau SQL Editor. Menyunting `src/data/` **tidak lagi berpengaruh** pada yang tampil |

Ini sering membingungkan: setelah Supabase tersambung, `src/data/` hanya menjadi
sumber untuk membuat ulang berkas seed — bukan lagi isi website.

---

## 1. Profil usaha — `src/data/profil.ts`

Tidak tersimpan di basis data, jadi selalu disunting di berkas ini.

| Kolom | Isi sekarang (karangan) |
| --- | --- |
| `pemilik` | Ibu Asri Wulandari |
| `berdiri` | 2016 |
| `alamat` | Jl. Nata Bangsa RT 01 RW 10, Jambusari, Jeruklegi, Cilacap (sudah alamat asli) |
| `telepon` / `teleponRaw` | 0812-2345-6789 |
| `email` | halo@asricatering.id |
| `instagram` | @asricatering.id |
| `jamOperasional` | Senin–Jumat 07.00–18.00, dst. |
| `areaLayanan` | Jeruklegi dan sekitarnya, Kota Cilacap, Kabupaten Cilacap — sesuaikan dengan jangkauan kurir |
| `statistik` | 9 tahun, 1.200+ acara, 150 box/hari, ulasan 4,8 |
| `sejarah` | Empat tonggak 2016 – 2025 |
| `keunggulan` | Empat poin |
| `testimoni` | **Tiga testimoni fiktif — wajib diganti atau dihapus** |
| `faq` | Tanya jawab, termasuk pengantaran gratis dan pembayaran online |

> Testimoni paling perlu diperhatikan. Menampilkan ulasan karangan seolah dari
> pelanggan nyata itu menyesatkan. Ganti dengan ulasan asli (seizin orangnya)
> atau hapus seksinya dari halaman Tentang Kami.

`teleponRaw` dipakai untuk tautan WhatsApp, formatnya tanpa tanda baca dan
diawali 62 — contoh `6281223456789`.

## 2. Menu, harga, dan resep

6 menu contoh beserta takaran resepnya. Harga dan takaran inilah yang
menentukan HPP, jadi **ini yang paling memengaruhi kebenaran laporan.**

- Mode contoh: `src/data/menu.ts`
- Supabase: **Panel Admin → Menu → Ubah** (termasuk resep dan biaya produksi)

Yang perlu dipastikan bersama Ibu Asri: nama menu, harga jual, isi paket,
minimal pemesanan, biaya kemasan, biaya tenaga kerja, dan takaran tiap bahan.

## 3. Bahan baku dan harganya

31 bahan contoh dengan harga pasaran perkiraan.

- Mode contoh: `src/data/bahan.ts`
- Supabase: **Panel Admin → Bahan Baku**

Harga satuan di sini menjadi dasar seluruh perhitungan HPP. Kalau harganya
meleset, HPP dan margin ikut meleset.

## 4. Pesanan contoh

23 pesanan berkode `ASR-DEMO-01` … `ASR-DEMO-23`, lengkap dengan nama dan nomor
telepon pemesan karangan. Hapus sebelum sistem dipakai:

```sql
delete from public.orders where kode like 'ASR-DEMO-%';
```

Rincian dan riwayat statusnya ikut terhapus.

## 5. Foto

Semua gambar masih kotak abu-abu placeholder. Daftar kebutuhan, ukuran,
penamaan berkas, dan panduan memotret ada di
[`KEBUTUHAN-FOTO.md`](KEBUTUHAN-FOTO.md).

## 6. Alamat website

Tiga tempat menyebut `asricatering.id` sebagai domain sementara:

- `src/app/layout.tsx` → `metadataBase`
- `public/robots.txt` → baris `Sitemap:`
- `.env.local` → tambahkan `NEXT_PUBLIC_SITE_URL=https://domainanda.com`

## 7. Akun admin

Pada mode Supabase, login admin memakai Supabase Auth — akun demo `admin` /
`asri2025` hanya berlaku pada mode data contoh. Daftarkan email Ibu Asri
sebagai admin mengikuti `SETUP-PEMBAYARAN.md` bagian 1.4, dan pastikan
`supabase/06-akun-pembayaran.sql` sudah dijalankan.

## 8. Titik dapur dan radius layanan

Titik dapur bawaan (`-7.560572, 109.01547`, Jl. Nata Bangsa, Jambusari, Jeruklegi — titik jalan dari OpenStreetMap, belum titik rumah persis) dan radius
25 km perlu dicek ulang. Keduanya menentukan alamat mana yang boleh memesan
dengan pengantaran gratis. Ganti lewat SQL mengikuti `SETUP-PEMBAYARAN.md`
bagian 1.5. Nilai cadangan di `src/lib/useInfoPengantaran.ts` hanya dipakai
bila Supabase belum tersambung.

## 9. Pembayaran

Pembayaran memakai QRIS milik usaha. Sebelum menerima pesanan nyata: simpan
QRIS **atas nama Asri Catering** (bukan milik pengembang) di panel admin,
pasang penerus notifikasi di HP pemilik, dan uji satu pembayaran sungguhan
(`SETUP-PEMBAYARAN.md` bagian 2). Periksa juga biaya QRIS (MDR) dari
penyedia karena memengaruhi margin.

---

## Daftar periksa serah terima

- [ ] Profil usaha diisi data asli hasil wawancara
- [ ] Testimoni diganti ulasan asli, atau seksinya dihapus
- [ ] Menu, harga, isi paket, dan resep dikonfirmasi Ibu Asri
- [ ] Harga bahan baku disesuaikan harga pasar setempat
- [ ] Pesanan `ASR-DEMO-%` dan `ASR-UJI-%` dihapus
- [ ] Foto asli dipasang
- [ ] Domain diperbarui di tiga tempat
- [ ] `06-akun-pembayaran.sql` dijalankan, akun Ibu Asri terdaftar sebagai admin
- [ ] Titik dapur dan radius layanan diganti
- [ ] Email verifikasi memakai SMTP sendiri dan teks Bahasa Indonesia
- [ ] QRIS atas nama usaha tersimpan, `QRIS_NOTIF_TOKEN` dan MacroDroid terpasang, satu pembayaran uji berhasil
