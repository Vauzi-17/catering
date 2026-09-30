# Menyiapkan Akun Pelanggan & Pembayaran Midtrans

Panduan ini melanjutkan [`SETUP-BACKEND.md`](SETUP-BACKEND.md). Kerjakan
**setelah** project Supabase dibuat dan `01-schema.sql` serta `03-seed.sql`
sudah dijalankan.

Setelah bagian ini selesai:

- Pelanggan wajib **daftar & verifikasi email** sebelum memesan.
- Alamat pengantaran dipilih lewat **peta**; pengantaran gratis di dalam radius
  layanan, di luar radius pesanan ditolak.
- Pembayaran **lunas di muka lewat Midtrans Snap** (VA bank, QRIS, e-wallet,
  dan lainnya). Tidak ada konfirmasi manual: begitu Midtrans mengabarkan dana
  masuk, status pesanan berubah sendiri menjadi **Dibayar**.
- Setiap notifikasi transaksi tercatat di **Panel Admin → Transaksi**.
- Pelanggan memantau pesanannya di **Pesanan Saya**:
  Menunggu Pembayaran → Dibayar → Diproses → Dikirim → Selesai.

---

## 1. Supabase

### 1.1 Jalankan migrasi

**SQL Editor → New query**, tempel isi `supabase/06-akun-pembayaran.sql`, **Run**.

| Urutan | Berkas | Keterangan |
| --- | --- | --- |
| 1 | `01-schema.sql` | Sudah dari tahap sebelumnya |
| 2 | `03-seed.sql` | Sudah dari tahap sebelumnya |
| 3 | **`06-akun-pembayaran.sql`** | Akun pelanggan, pembayaran, RLS produksi |
| opsional | `05-contoh-pesanan.sql` | Pesanan contoh untuk Dasbor |

`06` **menggantikan** seluruh aturan pada `02-rls.sql` dan `04-rls-produksi.sql`
(policy lama dihapus lebih dulu). Jangan jalankan `02` atau `04` lagi
sesudahnya — keduanya membuka kembali izin tulis untuk pengunjung anonim.

Berkas aman dijalankan ulang.

### 1.2 Pengaturan Auth

**Authentication → Sign In / Providers → Email**

- **Enable Email provider:** aktif
- **Confirm email:** aktif (pelanggan wajib verifikasi)

**Authentication → URL Configuration**

- **Site URL:** `https://catering-six-psi.vercel.app`
- **Redirect URLs**, tambahkan:
  - `https://catering-six-psi.vercel.app/**`
  - `http://localhost:3000/**` (untuk pengembangan)

Tanpa Redirect URLs, tautan verifikasi dan tautan atur ulang sandi akan
dialihkan ke Site URL biasa, bukan ke halaman `/masuk/` dan `/atur-sandi/`.

> Nama menu di dashboard Supabase kadang berubah. Bila tidak menemukan persis
> nama di atas, cari "Confirm email" dan "URL Configuration" di bagian
> Authentication.

### 1.3 Batas email bawaan Supabase

Server email bawaan Supabase hanya untuk uji coba dan jatah kirimnya per jam
sangat kecil [perlu diverifikasi di dokumentasi Supabase — angkanya berubah].
Untuk pemakaian sungguhan, pasang SMTP sendiri di **Authentication → Emails →
SMTP Settings** (misalnya Brevo atau Resend, keduanya punya paket gratis).
Tanpa itu, pendaftar bisa tidak menerima email verifikasi pada jam ramai.

Teks email bisa diterjemahkan ke Bahasa Indonesia di **Authentication → Emails →
Templates**. Pertahankan `{{ .ConfirmationURL }}` di dalamnya.

### 1.4 Jadikan akun Ibu Asri sebagai admin

1. Daftar lewat website di `/daftar/` memakai email Ibu Asri, lalu klik tautan
   verifikasinya. (Atau **Authentication → Users → Add user**.)
2. Jalankan di SQL Editor, ganti emailnya:

   ```sql
   insert into public.users (id, nama, peran)
   select id, 'Ibu Asri Wulandari', 'pemilik'
   from auth.users where email = 'email-admin@contoh.com'
   on conflict (id) do nothing;
   ```

3. Masuk di `/admin/login/` dengan email dan sandi tersebut.

Akun yang tidak ada di tabel `users` akan ditolak di halaman login admin,
walaupun email dan sandinya benar.

### 1.5 Titik dapur dan radius layanan

Nilai bawaan: titik di pusat Kota Bandung, radius 25 km. **Titik ini karangan**
— ganti dengan lokasi dapur sebenarnya. Ambil koordinat dari Google Maps (klik
kanan pada lokasi → angka pertama lintang, kedua bujur), lalu:

```sql
update public.settings
set dapur_lat = -6.917464,   -- lintang dapur
    dapur_lng = 107.619123,  -- bujur dapur
    radius_km = 25           -- jarak maksimal pengantaran gratis
where id = 1;
```

Jarak dihitung garis lurus, bukan jarak tempuh jalan. Radius 25 km garis lurus
bisa berarti 30–40 km di jalan; sesuaikan dengan kesanggupan kurir.

### 1.6 Service role key

**Project Settings → API Keys → `service_role`** (atau "secret key"). Kunci ini
dipakai **hanya di server** (`src/lib/supabase-server.ts`, berkas itu
mengimpor `server-only`) untuk:

- menyimpan pesanan setelah harga dihitung ulang di server, dan
- menerima notifikasi Midtrans yang tidak membawa sesi pengguna.

Kunci ini melewati seluruh RLS. **Jangan pernah** memberinya awalan
`NEXT_PUBLIC_`, dan jangan menempelnya di kode.

---

## 2. Midtrans

### 2.1 Akun sandbox (gratis, untuk uji coba)

1. Daftar di <https://dashboard.midtrans.com>, lalu pindah ke lingkungan
   **Sandbox** (sakelar di pojok dashboard).
2. **Settings → Access Keys**, salin:
   - **Server Key** → `MIDTRANS_SERVER_KEY` (rahasia, server saja)
   - **Client Key** → `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` (boleh terbaca peramban)

   Kunci sandbox diawali `SB-`. Aplikasi memakai awalan itu untuk memilih
   alamat API sandbox atau produksi secara otomatis.

### 2.2 URL notifikasi (wajib)

**Settings → Payment → Notification URL** (di beberapa versi dashboard:
*Configuration*):

```
https://catering-six-psi.vercel.app/api/midtrans/notifikasi/
```

**Garis miring di akhir wajib ada.** Situs ini memakai `trailingSlash`, jadi
alamat tanpa garis miring dijawab dengan pengalihan 308, dan belum pasti
Midtrans mengikuti pengalihan untuk permintaan POST.

Finish / Unfinish / Error Redirect URL **tidak perlu diisi** — aplikasi sudah
mengirimkannya pada setiap transaksi (`/pesanan/<kode>/`).

### 2.3 Menguji pembayaran sandbox

1. Pesan di website, pilih metode (misalnya BCA Virtual Account).
2. Buka simulator sandbox Midtrans (<https://simulator.sandbox.midtrans.com>),
   pilih bank yang sama, tempel nomor VA, bayar.
3. Dalam beberapa detik halaman pesanan berubah menjadi **Dibayar**, dan baris
   transaksi muncul di **Panel Admin → Transaksi**.

Tidak ada uang sungguhan yang berpindah di sandbox.

### 2.4 Pindah ke produksi (uang sungguhan)

- Midtrans mewajibkan **verifikasi usaha** (data pemilik, rekening, dan
  dokumen) sebelum akun produksi aktif. Syaratnya ditentukan Midtrans dan bisa
  berubah — periksa langsung di dashboard.
- **Pembayaran online tidak gratis.** Pendaftaran Midtrans tidak dipungut
  biaya, tetapi setiap transaksi yang berhasil dikenai biaya per metode
  (VA, QRIS, e-wallet berbeda-beda). Tarif terbaru ada di halaman harga
  Midtrans — **perlu diverifikasi sebelum menentukan harga jual.**
- Ganti kedua kunci dengan kunci **Production** (tanpa awalan `SB-`), lalu isi
  Notification URL yang sama di dashboard produksi.
- Bila kunci produksi Anda kebetulan tidak dikenali, paksa dengan
  `MIDTRANS_IS_PRODUCTION=true`.

---

## 3. Environment variables

Isi di **Vercel → Project → Settings → Environment Variables** (dan di
`.env.local` untuk pengembangan):

| Nama | Wajib | Sisi | Dari mana |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ya | peramban | Supabase → Project Settings → Data API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ya | peramban | Supabase → API Keys → anon / publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | ya | **server** | Supabase → API Keys → service_role / secret |
| `MIDTRANS_SERVER_KEY` | ya | **server** | Midtrans → Access Keys |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | ya | peramban | Midtrans → Access Keys |
| `NEXT_PUBLIC_SITE_URL` | disarankan | keduanya | `https://catering-six-psi.vercel.app` |
| `MIDTRANS_IS_PRODUCTION` | tidak | server | `true` / `false`, hanya bila deteksi otomatis keliru |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | tidak | server | Lihat `SETUP-BACKEND.md` bagian B |

Variabel berawalan `NEXT_PUBLIC_` ditanam ke kode saat **build**. Setelah
mengubahnya di Vercel, lakukan **Redeploy** — menyimpan saja tidak cukup.

`NEXT_PUBLIC_SITE_URL` menentukan ke mana pelanggan dikembalikan setelah
membayar. Bila kosong, aplikasi memakai alamat permintaan yang masuk, yang
pada Vercel bisa berupa alamat pratinjau (`*-git-*.vercel.app`).

---

## 4. Alur pesanan

```
Pelanggan                      Server                          Midtrans
─────────                      ──────                          ────────
Isi keranjang & data acara
Klik "Bayar"  ───────────────▶ POST /api/pesanan/
                               · cek login (sesi hanya ada setelah
                                  email terverifikasi)
                               · cek H-1 dan radius
                               · hitung ulang harga dari tabel menus
                               · simpan: Menunggu Pembayaran
                               · minta token Snap  ───────────▶
Popup Snap terbuka ◀───────── token
Bayar  ─────────────────────────────────────────────────────▶
                               POST /api/midtrans/notifikasi/ ◀── notifikasi
                               · cek signature
                               · ambil ulang status ke Midtrans
                               · cocokkan nominal
                               · catat di payments
                               · pesanan → Dibayar
Halaman pesanan berganti ◀──── (halaman memeriksa tiap 8 detik)
                                                   Admin: Mulai masak → Diproses
                                                          Tandai dikirim → Dikirim
                                                          Tandai selesai → Selesai
```

Aturan yang dijaga server:

- **Harga tidak pernah diambil dari peramban.** Total dihitung ulang dari tabel
  `menus`; mengubah harga lewat DevTools tidak berpengaruh.
- **Peramban tidak bisa menulis pesanan.** RLS hanya mengizinkan pelanggan
  *membaca* pesanannya sendiri. Semua penulisan lewat route server.
- **Notifikasi palsu ditolak** — signature SHA-512 diperiksa, lalu status
  diambil ulang langsung dari API Midtrans sebelum dipercaya.
- **Pesanan Lunas tidak pernah turun status** karena notifikasi yang datang
  terlambat atau dari percobaan bayar sebelumnya.
- **Batas bayar 24 jam.** Setelah itu Midtrans mengirim `expire` dan pesanan
  dibatalkan otomatis. Pelanggan yang menutup popup bisa membayar lagi dari
  halaman pesanan selama batas belum lewat.
- **Pembatalan oleh admin tidak mengembalikan dana secara otomatis.** Refund
  dilakukan dari dashboard Midtrans; notifikasi refund-nya akan tercatat dan
  mengubah status bayar menjadi *Dikembalikan*.

Bila notifikasi sempat gagal terkirim (misalnya URL salah), pesanan tetap bisa
disinkronkan: pelanggan menekan **Sudah bayar? Cek status** di halaman pesanannya, atau
admin menekan **Cek status pembayaran** pada dialog pesanan.

---

## 5. Peta (OpenStreetMap)

Peta memakai Leaflet dengan ubin OpenStreetMap dan pencarian alamat Nominatim.
Keduanya **gratis tanpa API key**, dengan syarat pemakaian wajar:

- Nominatim dibatasi sekitar **1 permintaan per detik** dan melarang pencarian
  otomatis per ketikan. Di aplikasi ini pencarian hanya berjalan saat tombol
  **Cari** atau Enter ditekan, jadi aman untuk skala katering.
- Atribusi "© OpenStreetMap" wajib tampil dan sudah terpasang di pojok peta.

Kebijakan lengkapnya: <https://operations.osmfoundation.org/policies/>.
Bila kelak pesanan sangat ramai, pindah ke penyedia berbayar (Mapbox, MapTiler)
cukup dengan mengganti alamat ubin di `src/components/akun/PetaLokasi.tsx`.

---

## 6. Bila ada masalah

| Gejala | Penyebab biasanya |
| --- | --- |
| "Server belum dikonfigurasi" atau "Pembayaran belum dikonfigurasi" (503) | `SUPABASE_SERVICE_ROLE_KEY` atau `MIDTRANS_SERVER_KEY` belum diisi di Vercel, atau belum redeploy |
| Popup pembayaran tidak muncul, halaman langsung pindah ke Midtrans | `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` kosong. Pembayaran tetap jalan lewat halaman Midtrans, tetapi isi kuncinya lalu redeploy |
| Sudah bayar di simulator, status tetap Menunggu Pembayaran | Notification URL belum diisi atau tanpa garis miring akhir. Tekan **Sudah bayar? Cek status** untuk sinkron manual, lalu perbaiki URL-nya |
| Tautan verifikasi membuka halaman utama, bukan `/masuk/` | Redirect URLs di Supabase belum ditambahkan (1.2) |
| Email verifikasi tidak sampai | Jatah email bawaan Supabase habis, atau masuk folder spam. Pasang SMTP sendiri (1.3) |
| Login admin: "Akun ini bukan akun admin" | Akun belum dimasukkan ke tabel `users` (1.4) |
| Alamat ditolak "di luar area layanan" padahal dekat | Titik dapur masih nilai bawaan, atau radius terlalu kecil (1.5) |
| "permission denied" setelah menjalankan `02-rls.sql` lagi | Jalankan ulang `06-akun-pembayaran.sql` |
| Peta abu-abu tanpa gambar | Jaringan memblokir `tile.openstreetmap.org`. Titik tetap bisa dipilih |
