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

Buka **SQL Editor → New query**, lalu jalankan tiga berkas ini **berurutan**.
Tempel isinya, klik **Run**, tunggu sampai muncul "Success".

| Urutan | Berkas | Isinya |
| --- | --- | --- |
| 1 | `supabase/01-schema.sql` | Tabel, indeks, trigger, fungsi bantu |
| 2 | `supabase/02-rls.sql` | Aturan keamanan baris tahap pengembangan |
| 3 | `supabase/03-seed.sql` | 5 kategori, 26 bahan baku, 14 menu beserta resepnya |
| 4 (opsional) | `supabase/05-contoh-pesanan.sql` | 23 pesanan contoh, supaya Dasbor dan Laporan ada isinya |

Berkas ketiga aman dijalankan berulang kali — datanya diperbarui, bukan
digandakan. Jadi bila sebuah berkas gagal di tengah jalan, cukup perbaiki
penyebabnya lalu jalankan ulang dari awal; tidak perlu mengosongkan tabel.

Di bagian paling bawah `03-seed.sql` ada perintah pemeriksa. Jalankan bagian itu
untuk memastikan hasilnya: **5 kategori, 26 bahan baku, 14 menu, 109 baris
resep.**

> `supabase/04-rls-produksi.sql` **belum dijalankan sekarang.** Berkas itu untuk
> nanti, setelah login admin dipindah ke Supabase Auth. Penjelasannya ada di
> bagian D.

### A3. Mengisi Dasbor dan Laporan

Setelah `03-seed.sql`, menu dan bahan baku sudah ada tetapi **tabel pesanan
masih kosong** — jadi Dasbor dan Laporan wajar kalau nihil. Laporan dihitung
dari pesanan, bukan dari menu.

Ada dua cara mengisinya.

**Cara cepat — jalankan `supabase/05-contoh-pesanan.sql`**

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

1. Buka `/pesan`, pilih menu, isi formulir, kirim.
2. Buka **Panel Admin → Pesanan**, klik **Kelola** pada pesanan itu, lalu
   **Konfirmasi pesanan**.

Dua hal yang sering membingungkan di sini:

- **Pesanan hanya masuk laporan setelah dikonfirmasi.** Status *Menunggu
  Konfirmasi* belum diakui sebagai pendapatan — itu disengaja, karena pesanan
  bisa saja batal. Tetapi tetap ikut dihitung pada estimasi kebutuhan bahan.
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

**Jangan** memakai `service_role key` di aplikasi ini. Kunci itu melewati semua
aturan keamanan dan tidak boleh sampai ke peramban.

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

## Bagian D — Mengamankan sebelum dipublikasikan

> Selama login admin masih memakai `admin` / `asri2025`, aturan pada
> `02-rls.sql` terpaksa mengizinkan penulisan data oleh pengunjung anonim.
> Artinya siapa pun yang mengetahui URL Supabase dan anon key Anda bisa
> mengubah data menu, bahan baku, dan pesanan.
>
> Aman selama dikerjakan di komputer sendiri. **Wajib diperbaiki sebelum
> alamat website diberikan ke pelanggan.**

Langkahnya:

1. **Authentication → Users → Add user.** Buat akun untuk Ibu Asri dengan email
   dan kata sandi. Salin UUID yang muncul.
2. **SQL Editor**, jalankan:

   ```sql
   insert into public.users (id, nama)
   values ('<uuid-yang-tadi-disalin>', 'Asri Wulandari');
   ```

3. Ubah fungsi `login` pada `src/store/DataProvider.tsx` menjadi:

   ```ts
   const login = useCallback(async (email: string, sandi: string) => {
     const { error } = await wajibSupabase().auth.signInWithPassword({
       email,
       password: sandi,
     });
     if (!error) setMasuk(true);
     return !error;
   }, []);
   ```

   Ubah juga `createClient` pada `src/lib/supabase.ts` menjadi
   `auth: { persistSession: true }` supaya sesi bertahan setelah halaman
   dimuat ulang.

4. Jalankan `supabase/04-rls-produksi.sql` di SQL Editor.

Setelah itu anon key hanya bisa: membaca katalog menu, membuat pesanan, dan
melacak satu pesanan lewat kodenya. Selebihnya wajib login.

---

## Bila ada masalah

| Gejala | Penyebab biasanya |
| --- | --- |
| Sidebar masih "Mode data contoh" | `.env.local` belum ada, atau server belum dijalankan ulang setelah diisi |
| "permission denied for table ..." | `02-rls.sql` belum dijalankan |
| Menu kosong padahal Supabase terhubung | `03-seed.sql` belum dijalankan |
| Dasbor dan Laporan nol semua | Tabel pesanan masih kosong, atau semua pesanan masih berstatus Menunggu Konfirmasi. Lihat bagian A3 |
| Pesanan sudah dibuat tapi laporan tetap nol | Belum dikonfirmasi, atau tanggal acaranya di luar rentang laporan. Lihat bagian A3 |
| `relation "peta_bahan" does not exist` | Anda memakai salinan lama `03-seed.sql`. Versi itu memakai tabel sementara yang tidak bertahan di connection pooler Supabase. Ambil berkas terbaru lalu jalankan ulang — isinya sudah tidak memakai tabel sementara |
| Lencana selalu "Hitungan aplikasi" | Lihat pesan di terminal — sudah diterjemahkan ke penyebab yang spesifik |
| `Model ... sedang penuh permintaan di sisi Google` | Normal dan sementara. Aplikasi sudah jatuh ke hitungan sendiri. Bila sering, ganti `GEMINI_MODEL` |
| `GEMINI_API_KEY tidak diterima Google` | Kunci salah ketik atau sudah dicabut. Ambil kunci baru di AI Studio |
| `Kuota atau laju permintaan Gemini terlampaui` | Lebih dari 15 permintaan per menit, atau jatah harian habis. Tunggu sebentar |
| Pesanan gagal dikirim | Policy insert pada tabel `orders` belum ada — jalankan ulang `02-rls.sql` |
| `npm run build` gagal saat mengambil font | Komputer sedang tanpa internet; `next/font` mengunduh font saat build |
