# Menyiapkan Supabase & Gemini

Panduan langkah demi langkah. Perkiraan waktu: 20–30 menit. Keduanya gratis
untuk skala usaha Asri Catering.

Selama kedua bagian ini belum diisi, aplikasi tetap berjalan dalam **mode data
contoh** — data tersimpan di peramban dan analisis memakai perhitungan
aplikasi. Jadi tidak ada yang rusak bila dikerjakan bertahap.

---

## Bagian A — Supabase (basis data)

### A1. Buat project

1. Daftar di <https://supabase.com> (bisa pakai akun Google).
2. **New project**, isi:
   - **Name:** `asri-catering`
   - **Database Password:** buat yang kuat, **simpan baik-baik** — tidak bisa
     dilihat lagi nanti.
   - **Region:** `Southeast Asia (Singapore)` — paling dekat ke Indonesia.
3. Tunggu sekitar dua menit sampai project selesai dibuat.

### A2. Jalankan berkas SQL

Buka **SQL Editor → New query**, lalu jalankan berkas-berkas ini **berurutan**.
Tempel isinya, klik **Run**, tunggu sampai muncul "Success".

| Urutan | Berkas | Isinya |
| --- | --- | --- |
| 1 | `supabase/01-schema.sql` | Tabel, indeks, trigger, fungsi bantu |
| 2 | `supabase/03-seed.sql` | 5 kategori, 26 bahan baku, 14 menu beserta resepnya |
| 3 | `supabase/06-akun-pembayaran.sql` | Akun pelanggan, pembayaran, keamanan baris produksi — lihat [`SETUP-PEMBAYARAN.md`](SETUP-PEMBAYARAN.md) |
| 4 (opsional) | `supabase/05-contoh-pesanan.sql` | 23 pesanan contoh, supaya Dasbor dan Laporan ada isinya |

Semua berkas aman dijalankan berulang kali — datanya diperbarui, bukan
digandakan. Jadi bila sebuah berkas gagal di tengah jalan, cukup perbaiki
penyebabnya lalu jalankan ulang dari awal; tidak perlu mengosongkan tabel.

Di bagian paling bawah `03-seed.sql` ada perintah pemeriksa. Jalankan bagian itu
untuk memastikan hasilnya: **5 kategori, 26 bahan baku, 14 menu, 109 baris
resep.**

> `02-rls.sql` dan `04-rls-produksi.sql` adalah aturan versi lama dan **tidak
> dipakai lagi** — `06-akun-pembayaran.sql` menggantikan keduanya. Menjalankan
> `02` sesudah `06` membuka kembali izin tulis untuk pengunjung anonim.

### A3. Mengisi Dasbor dan Laporan

Setelah `03-seed.sql`, menu dan bahan baku sudah ada tetapi **tabel pesanan
masih kosong** — jadi Dasbor dan Laporan wajar kalau nihil. Laporan dihitung
dari pesanan, bukan dari menu.

Ada dua cara mengisinya.

**Paling cepat — jalankan `supabase/08-contoh-pesanan-lunas.sql`**

Lima pesanan berstatus lunas (kode `ASR-UJI-01` … `05`) pada enam hari terakhir
sampai hari ini, lengkap dengan histori transaksi. Semuanya langsung terhitung
di Dasbor, Laporan, dan Hitung HPP. Hapus dengan
`delete from public.orders where kode like 'ASR-UJI-%';`

**Versi lama — `supabase/05-contoh-pesanan.sql`**

Berkas ini mengisi 23 pesanan contoh yang tersebar pada dua minggu terakhir dan
dua minggu ke depan, dengan campuran status. 17 di antaranya berstatus
Diproses/Selesai sehingga langsung terhitung di laporan. Tanggalnya memakai
`current_date`, jadi grafik tujuh hari selalu terisi kapan pun dijalankan.

Kodenya sengaja diawali `ASR-DEMO-` supaya mudah dibedakan dari pesanan
sungguhan. Berkasnya aman dijalankan berulang — pesanan `ASR-DEMO-%` lama
dihapus lebih dulu, jadi tidak menumpuk.

**Bersihkan sebelum sistem dipakai usaha:**

```sql
delete from public.orders where kode like 'ASR-DEMO-%';
```

Rincian dan riwayat statusnya ikut terhapus otomatis.

**Cara sungguhan — pesan lewat website sendiri**

1. Daftar dan masuk sebagai pelanggan, pilih menu, isi data acara, lalu bayar
   QRIS yang muncul (lihat `SETUP-PEMBAYARAN.md` bagian 2.4).
2. Begitu notifikasi cocok atau admin mengonfirmasi manual, pesanan berstatus
   **Dibayar** dan langsung terhitung di laporan.

Dua hal yang sering membingungkan di sini:

- **Pesanan hanya masuk laporan setelah dibayar.** Status *Menunggu
  Pembayaran* belum diakui sebagai pendapatan — itu disengaja, karena tagihan
  bisa kedaluwarsa. Pesanan lama berstatus *Menunggu Konfirmasi* diperlakukan
  sama.
- **Laporan dikelompokkan menurut tanggal acara, bukan tanggal pesan.** Formulir
  hanya menerima acara paling cepat besok (H-1), jadi pesanan yang Anda buat
  sekarang akan muncul di kolom tanggal acaranya — bukan hari ini. Karena grafik
  menampilkan tujuh hari ke belakang, pesanan untuk minggu depan belum akan
  terlihat di sana. Ini cara hitung yang lazim untuk katering: pendapatan diakui
  saat pesanan benar-benar diantar.

Untuk menguji cepat tanpa menunggu, ubah saja tanggal acaranya lewat SQL Editor:

```sql
update public.orders
set tanggal_acara = current_date, status = 'Selesai'
where kode = 'ASR-260918-001';   -- ganti dengan kode pesanan Anda
```

### A4. Salin kunci ke aplikasi

1. Buka **Project Settings → Data API**.
2. Salin dua nilai: **Project URL** dan **anon public key**.
3. Di folder proyek, salin `.env.example` menjadi `.env.local`, lalu isi:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi....
```

Kedua nilai itu memang boleh terbaca dari peramban. Yang menjaga data adalah
aturan RLS di Supabase, bukan kerahasiaan kuncinya.

`service_role key` **tidak** diisi di sini — kunci itu melewati semua aturan
keamanan dan hanya dipakai di server lewat `SUPABASE_SERVICE_ROLE_KEY` (tanpa
awalan `NEXT_PUBLIC_`). Lihat `SETUP-PEMBAYARAN.md` bagian 1.6.

### A5. Pastikan berhasil

Jalankan `npm run dev`, buka panel admin. Di kiri bawah sidebar harus tertulis
**"Terhubung Supabase"** dengan titik hijau. Kalau masih "Mode data contoh",
berarti `.env.local` belum terbaca — hentikan server lalu jalankan ulang.

---

## Bagian B — Gemini (analisis & asisten)

### B1. Ambil API key

1. Buka <https://aistudio.google.com/apikey>, masuk dengan akun Google.
2. **Create API key** → pilih project Google Cloud, atau buat baru.
3. Salin kuncinya.

### B2. Masukkan ke aplikasi

Tambahkan pada `.env.local`:

```
GEMINI_API_KEY=AIza....
GEMINI_MODEL=gemini-2.0-flash
```

Perhatikan: **tanpa awalan `NEXT_PUBLIC_`**. Itu yang membuat kuncinya hanya
terbaca di server dan tidak pernah dikirim ke peramban.

### B3. Pastikan berhasil

Buka **Panel Admin → Laporan**. Pada kotak "Catatan" akan muncul lencana kecil:

- **Gemini** — catatan ditulis Gemini.
- **Hitungan aplikasi** — Gemini tidak aktif atau gagal dihubungi, catatan
  disusun aplikasi sendiri.

Bila selalu "Hitungan aplikasi", lihat terminal tempat `npm run dev` berjalan.
Pesan galatnya dicetak dengan awalan `[api/ai/insight]`.

### Kalau modelnya sedang penuh

Pesan seperti ini di terminal adalah hal biasa dan **tidak berbahaya**:

```
[api/ai/insight] Model gemini-2.0-flash sedang penuh permintaan di sisi Google.
POST /api/ai/insight/ 503
```

Itu datang dari Google, bukan dari kode kita — modelnya sedang ramai dipakai
seluruh dunia. Aplikasi otomatis mengulang sekali, lalu memakai catatan hasil
perhitungan sendiri. Angka di Laporan dan Dasbor tetap lengkap; yang berganti
hanya kalimat penjelasnya, dan lencananya berubah jadi **Hitungan aplikasi**.

Kalau terlalu sering, ganti modelnya — tidak perlu mengubah kode, cukup ubah
satu baris di `.env.local` lalu jalankan ulang server:

```
GEMINI_MODEL=gemini-2.5-flash
```

Daftar model yang tersedia untuk akun Anda bisa dilihat di Google AI Studio.
Nama model berubah dari waktu ke waktu, jadi pakai yang tertera di sana. Bila
nama modelnya salah ketik, aplikasi akan memberi tahu persis begitu:
*Model "..." tidak ditemukan. Periksa nilai GEMINI_MODEL di .env.local.*

### Batas pemakaian gratis

Model `gemini-2.0-flash` pada paket gratis dibatasi sekitar 15 permintaan per
menit dan 1.500 per hari. Pemakaian normal panel admin jauh di bawah itu.

### Yang dikirim dan tidak dikirim ke Google

**Dikirim:** angka hasil perhitungan — pendapatan, HPP, margin, jumlah porsi,
nama menu, nama bahan, dan jumlah stok.

**Tidak dikirim:** nama pemesan, nomor telepon, dan alamat pengantaran.

Penyaringnya ada di `src/lib/ai-sanitasi.ts`. Fungsi di sana menyusun ulang data
bidang demi bidang, sehingga seandainya peramban mengirim bidang lain, bidang
itu tidak akan pernah ikut diteruskan.

---

## Bagian C — Menjalankan & mengunggah

```bash
npm install
npm run dev     # pengembangan, http://localhost:3000
npm run build   # siapkan berkas produksi
npm start       # jalankan hasil build
```

Aplikasi ini **membutuhkan Node.js di server** karena Gemini dipanggil lewat
`/api/ai/*`. Shared hosting cPanel biasa (hanya Apache dan PHP) tidak bisa
menjalankannya.

Pilihan hosting:

| Pilihan | Catatan |
| --- | --- |
| **Vercel** | Paling mudah, ada paket gratis. Hubungkan repositori, isi Environment Variables yang sama dengan `.env.local`, selesai. Domain dari DomaiNesia tinggal diarahkan ke sana. |
| **VPS DomaiNesia** | Kendali penuh. Perlu memasang Node.js, menjalankan `npm run build && npm start`, lalu menaruh Nginx di depannya. |
| **cPanel + Node.js Selector** | Hanya pada paket yang menyediakan fitur ini. Startup file: `node_modules/next/dist/bin/next`, argumen `start`. |

Berkas `public/.htaccess` tersisa dari rencana hosting statis sebelumnya. Tidak
mengganggu, dan bisa dihapus bila deploy ke Vercel.

### Mengganti nama domain

Ubah alamat pada:

- `.env.local` → tambahkan `NEXT_PUBLIC_SITE_URL=https://domainanda.com`
- `src/app/layout.tsx` → `metadataBase`
- `public/robots.txt` → baris `Sitemap:`

---

## Bagian D — Akun, pembayaran, dan keamanan produksi

Login admin, akun pelanggan, dan pembayaran QRIS sekarang memakai Supabase
Auth. Langkahnya — termasuk menjalankan `supabase/06-akun-pembayaran.sql` yang
menggantikan `02-rls.sql` dan `04-rls-produksi.sql` — ada di
[`SETUP-PEMBAYARAN.md`](SETUP-PEMBAYARAN.md).

**Wajib dikerjakan sebelum alamat website diberikan ke pelanggan.** Selama
hanya `02-rls.sql` yang berjalan, pengunjung anonim masih bisa menulis data.

---

## Bila ada masalah

| Gejala | Penyebab biasanya |
| --- | --- |
| Sidebar masih "Mode data contoh" | `.env.local` belum ada, atau server belum dijalankan ulang setelah diisi |
| "permission denied for table ..." | `06-akun-pembayaran.sql` belum dijalankan, atau akun belum terdaftar sebagai admin |
| Menu kosong padahal Supabase terhubung | `03-seed.sql` belum dijalankan |
| Dasbor dan Laporan nol semua | Tabel pesanan masih kosong, atau semua pesanan masih Menunggu Pembayaran. Lihat bagian A3 |
| Pesanan sudah dibuat tapi laporan tetap nol | Belum dibayar, atau tanggal acaranya di luar rentang laporan. Lihat bagian A3 |
| `relation "peta_bahan" does not exist` | Anda memakai salinan lama `03-seed.sql`. Versi itu memakai tabel sementara yang tidak bertahan di connection pooler Supabase. Ambil berkas terbaru lalu jalankan ulang — isinya sudah tidak memakai tabel sementara |
| Lencana selalu "Hitungan aplikasi" | Lihat pesan di terminal — sudah diterjemahkan ke penyebab yang spesifik |
| `Model ... sedang penuh permintaan di sisi Google` | Normal dan sementara. Aplikasi sudah jatuh ke hitungan sendiri. Bila sering, ganti `GEMINI_MODEL` |
| `GEMINI_API_KEY tidak diterima Google` | Kunci salah ketik atau sudah dicabut. Ambil kunci baru di AI Studio |
| `Kuota atau laju permintaan Gemini terlampaui` | Lebih dari 15 permintaan per menit, atau jatah harian habis. Tunggu sebentar |
| Pesanan gagal dikirim | Lihat tabel masalah di `SETUP-PEMBAYARAN.md` bagian 6 |
| `npm run build` gagal saat mengambil font | Komputer sedang tanpa internet; `next/font` mengunduh font saat build |
