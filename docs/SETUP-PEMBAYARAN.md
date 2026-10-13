# Menyiapkan Akun Pelanggan & Pembayaran QRIS

Panduan ini melanjutkan [`SETUP-BACKEND.md`](SETUP-BACKEND.md). Kerjakan
**setelah** project Supabase dibuat dan `01-schema.sql` serta `03-seed.sql`
sudah dijalankan.

Setelah bagian ini selesai:

- Pelanggan wajib **daftar & verifikasi email** sebelum memesan.
- Alamat pengantaran dipilih lewat **peta**; pengantaran gratis di dalam radius
  layanan, di luar radius pesanan ditolak.
- Pembayaran **lunas di muka dengan QRIS milik usaha sendiri**, tanpa payment
  gateway. Setiap pesanan mendapat QR bernominal unik (total + kode unik
  Rp 1–999), jadi pelanggan tidak perlu mengetik nominal.
- Konfirmasi pembayaran **otomatis** lewat notifikasi di HP Android pemilik
  yang diteruskan ke website, dengan **konfirmasi manual** oleh admin sebagai
  cadangan.
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
| 4 | **`07-foto-menu.sql`** | Bucket Storage `menu` untuk unggah foto dari panel admin |
| 5 | **`09-qris.sql`** | QRIS toko, nominal unik, log notifikasi, tagihan kedaluwarsa |
| opsional | `08-contoh-pesanan-lunas.sql` | 5 pesanan lunas (kode `ASR-UJI-`) untuk menguji laporan, margin, dan catatan AI |
| opsional | `05-contoh-pesanan.sql` | 23 pesanan contoh versi lama (kode `ASR-DEMO-`) |

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
- menerima notifikasi pembayaran dari HP pemilik yang tidak membawa sesi
  pengguna.

Kunci ini melewati seluruh RLS. **Jangan pernah** memberinya awalan
`NEXT_PUBLIC_`, dan jangan menempelnya di kode.

---

## 2. QRIS

### 2.1 Siapkan QRIS milik usaha

QRIS harus **atas nama usaha atau pemiliknya**, karena dana masuk ke rekening
pemilik QRIS. Pilihan yang umum untuk UMKM:

- **GoBiz** (aplikasi GoPay Merchant) — daftar usaha di aplikasi GoBiz,
  QRIS-nya bisa diunduh dari aplikasi.
- **QRIS dari bank** tempat usaha punya rekening (mis. lewat aplikasi bisnis
  bank tersebut).

Syarat pendaftaran dan biaya per transaksi (MDR QRIS) ditentukan penyedia dan
Bank Indonesia, dan bisa berubah — **perlu diverifikasi** langsung di aplikasi
atau situs penyedia. Pilih penyedia yang **memunculkan notifikasi di HP
setiap ada pembayaran masuk**; notifikasi itulah yang dibaca untuk konfirmasi
otomatis.

### 2.2 Simpan QRIS di panel admin

1. Masuk sebagai admin, buka **Pembayaran QRIS**.
2. Klik **Unggah gambar QR**, pilih foto atau tangkapan layar QRIS statis
   (QR yang biasa ditempel di kasir, tanpa nominal).
3. Pastikan tertulis *Terbaca: NAMA TOKO · QRIS statis*, lalu **Simpan QRIS ini**.
4. Scan gambar **Contoh Rp 10.000** dengan aplikasi pembayaran di HP lain.
   Bila nama toko dan nominal Rp 10.000 tampil, QRIS siap dipakai. Batalkan
   saja, tidak perlu dibayar.

Selama QRIS belum disimpan, pelanggan tidak bisa membuat pesanan baru dan akan
diminta menghubungi lewat WhatsApp.

**Cara kerja nominal otomatis.** QRIS statis berformat standar EMVCo. Server
menyisipkan nominal (tag `54`), menandainya sebagai QR bernominal (tag `01` =
`12`), membuang isian tip, lalu menghitung ulang kode pemeriksa CRC. Hasilnya
dibaca aplikasi pembayar sebagai QR dengan nominal terisi. Ini **bukan QR
dinamis resmi** dari penyedia QRIS; sebagian besar aplikasi menerimanya, tetapi
uji dulu dengan beberapa aplikasi yang biasa dipakai pelanggan.

### 2.3 Konfirmasi otomatis dari HP (MacroDroid)

Butuh HP **Android** yang terpasang aplikasi GoBiz atau bank tadi. iPhone tidak
bisa: iOS tidak mengizinkan aplikasi membaca notifikasi aplikasi lain.

**a. Buat token rahasia** — teks acak minimal 16 karakter, misalnya hasil
`openssl rand -hex 24`. Isi di Vercel sebagai `QRIS_NOTIF_TOKEN`, lalu
**Redeploy**. Di halaman **Pembayaran QRIS** harus tertulis *Terpasang*.

**b. Pasang MacroDroid** dari Play Store, beri izin **akses notifikasi**, dan
keluarkan MacroDroid dari **penghemat baterai** (Setelan → Baterai) supaya
tidak dimatikan sistem.

**c. Buat macro baru:**

- **Pemicu (Trigger):** *Notification → Notification Received*, pilih aplikasi
  GoBiz (atau aplikasi bank). Bila ada pilihan filter teks, isi `Rp`.
- **Aksi (Action):** *HTTP Request* (di kelompok *Connectivity / Web
  Interactions*):
  - Method: `POST`
  - URL: `https://catering-six-psi.vercel.app/api/qris/notifikasi/`
    (garis miring di akhir wajib)
  - Header: `Authorization` = `Bearer <token dari langkah a>`
  - Content type: `application/json`
  - Body:

    ```json
    {"judul": "<judul notifikasi>", "teks": "<isi notifikasi>", "aplikasi": "<nama aplikasi>"}
    ```

    Ganti `<…>` dengan **Magic Text** MacroDroid untuk judul, isi, dan nama
    aplikasi notifikasi (tombol *Magic Text* / `{…}` di kolom body).

Nama menu MacroDroid bisa sedikit berbeda antar versi. Bila aplikasi tidak
menyediakan kolom header, token boleh ditaruh di URL:
`…/api/qris/notifikasi/?token=<token>` (kurang aman karena token ikut tercatat
di log).

Body juga boleh teks biasa berisi isi notifikasi; server mengambil semua
nominal `Rp…` di dalamnya.

### 2.4 Uji coba

1. Di **Pembayaran QRIS → Uji pembaca notifikasi**, tempel contoh isi
   notifikasi GoBiz/bank. Nominalnya harus terbaca.
2. Buat pesanan kecil dari akun pelanggan, bayar QRIS-nya dengan aplikasi
   pembayaran sungguhan.
3. Dalam beberapa detik halaman pesanan berubah menjadi **Dibayar**. Buka
   **Transaksi → Notifikasi masuk**: baris notifikasi harus berstatus *Cocok*.

Bila status tetap menunggu, lihat log *Notifikasi masuk*:

| Hasil | Arti |
| --- | --- |
| *(kosong)* | Notifikasi tidak sampai ke server — periksa macro, izin notifikasi, internet HP, dan token |
| Tanpa nominal | Isi notifikasi tidak memuat `Rp…`. Pastikan body memakai isi notifikasi, bukan hanya judul |
| Tidak cocok | Nominal tidak sama dengan tagihan yang menunggu (pelanggan membayar nominal lain, atau notifikasi bukan dari pembayaran QRIS) |
| Ganda | Notifikasi yang sama terkirim dua kali; aman diabaikan |

Pesanan yang tidak terkonfirmasi otomatis selalu bisa ditandai lunas dari
**Pesanan → Kelola → Konfirmasi lunas manual** setelah admin mengecek riwayat
GoBiz atau rekening. Pesanan yang pelanggannya menekan **Saya sudah bayar**
diberi tanda *Perlu dicek*.

### 2.5 Batasan yang perlu diketahui

- **Bergantung pada HP pemilik.** Bila HP mati, offline, atau MacroDroid
  dihentikan sistem, notifikasi terlewat dan pesanan harus dikonfirmasi manual.
- **Format notifikasi bisa berubah** saat aplikasi GoBiz/bank diperbarui.
  Selama masih memuat `Rp<nominal>`, pembacanya tetap bekerja.
- **Nominal unik adalah satu-satunya penanda.** Dua tagihan yang menunggu tidak
  pernah punya nominal sama (dijaga index di basis data), tetapi notifikasi
  pembayaran lain yang kebetulan bernominal sama dengan tagihan menunggu akan
  ikut dianggap lunas. Risiko ini kecil karena nominalnya berakhiran kode unik.
- **Kode unik masuk ke rekening, tetapi laporan memakai total pesanan** tanpa
  kode unik.
- Untuk volume besar atau kebutuhan konfirmasi yang sepenuhnya andal, pakai
  payment gateway resmi (Midtrans, Xendit, dan sejenisnya) yang memberi
  notifikasi langsung dari penyedia — dengan biaya per transaksi.

---

## 3. Environment variables

Isi di **Vercel → Project → Settings → Environment Variables** (dan di
`.env.local` untuk pengembangan):

| Nama | Wajib | Sisi | Dari mana |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ya | peramban | Supabase → Project Settings → Data API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ya | peramban | Supabase → API Keys → anon / publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | ya | **server** | Supabase → API Keys → service_role / secret |
| `QRIS_NOTIF_TOKEN` | ya, untuk konfirmasi otomatis | **server** | Teks acak minimal 16 karakter (2.3) |
| `NEXT_PUBLIC_SITE_URL` | disarankan | keduanya | `https://catering-six-psi.vercel.app` |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | tidak | server | Lihat `SETUP-BACKEND.md` bagian B |

Variabel berawalan `NEXT_PUBLIC_` ditanam ke kode saat **build**. Setelah
mengubah variabel apa pun di Vercel, lakukan **Redeploy** — menyimpan saja tidak
cukup.

Variabel `MIDTRANS_*` dari versi sebelumnya tidak dipakai lagi di branch ini
dan boleh dihapus.

---

## 4. Alur pesanan

```
Pelanggan                      Server                          HP pemilik
─────────                      ──────                          ──────────
Isi keranjang & data acara
"Buat Pesanan & Bayar" ──────▶ POST /api/pesanan/
                               · cek login, H-1, radius
                               · hitung ulang harga dari tabel menus
                               · nominal = total + kode unik 1–999
                               · QRIS bernominal dari QRIS toko
                               · simpan: Menunggu Pembayaran (24 jam)
Halaman pesanan: QR + nominal ◀
Scan & bayar di m-banking/e-wallet ─────────────────────────▶ notifikasi
                                                               "Rp150.237 diterima"
                               POST /api/qris/notifikasi/ ◀─── MacroDroid
                               · cek token
                               · ambil nominal dari teks
                               · cocokkan dengan tagihan menunggu
                               · catat di payments & qris_notifikasi
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
- **Notifikasi tanpa token yang benar ditolak** (401). Token dibandingkan
  dengan perbandingan waktu-konstan.
- **Notifikasi ganda tidak dicatat dua kali**, dan pesanan yang sudah Lunas
  tidak berubah lagi.
- **Klik "Saya sudah bayar" tidak membuat pesanan lunas** — hanya menandai
  pesanan untuk dicek admin. Bukti transfer dari pelanggan mudah dipalsukan.
- **Batas bayar 24 jam.** Lewat dari itu pesanan dibatalkan otomatis saat
  halaman dibuka berikutnya. Pelanggan bisa membuat **QRIS baru** selama jadwal
  acara masih H-1. Pembayaran yang masuk paling lama 3 hari setelah tagihan
  kedaluwarsa tetap dicocokkan (selama pelanggan belum membuat QRIS baru),
  karena uangnya sudah diterima.
- **Pembatalan oleh admin tidak mengembalikan dana.** Pengembalian dilakukan
  manual oleh pemilik.

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
| "Server belum dikonfigurasi" (503) | `SUPABASE_SERVICE_ROLE_KEY` belum diisi di Vercel, atau belum redeploy |
| "Pembayaran QRIS belum disiapkan" saat pesan | QRIS toko belum disimpan di **Pembayaran QRIS** (2.2), atau `09-qris.sql` belum dijalankan |
| Aplikasi pembayar menolak QR atau nominal tidak terisi | Aplikasi itu tidak menerima QR bernominal hasil modifikasi. Pelanggan tetap bisa scan QRIS toko dan mengetik nominal persis, lalu admin mengonfirmasi manual |
| Sudah bayar, status tetap Menunggu Pembayaran | Lihat **Transaksi → Notifikasi masuk** dan tabel di 2.4 |
| Halaman Pembayaran QRIS: token "Belum diisi" | `QRIS_NOTIF_TOKEN` belum diisi atau kurang dari 16 karakter; isi lalu redeploy |
| Notifikasi dijawab 401 | Token di MacroDroid tidak sama dengan `QRIS_NOTIF_TOKEN`, atau tanpa awalan `Bearer ` |
| Tautan verifikasi membuka halaman utama, bukan `/masuk/` | Redirect URLs di Supabase belum ditambahkan (1.2) |
| Email verifikasi tidak sampai | Jatah email bawaan Supabase habis, atau masuk folder spam. Pasang SMTP sendiri (1.3) |
| Login admin: "Akun ini bukan akun admin" | Akun belum dimasukkan ke tabel `users` (1.4) |
| Alamat ditolak "di luar area layanan" padahal dekat | Titik dapur masih nilai bawaan, atau radius terlalu kecil (1.5) |
| "permission denied" setelah menjalankan `02-rls.sql` lagi | Jalankan ulang `06-akun-pembayaran.sql` |
| Peta abu-abu tanpa gambar | Jaringan memblokir `tile.openstreetmap.org`. Titik tetap bisa dipilih |
