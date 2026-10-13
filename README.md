# Asri Catering — Website Profil, Pemesanan & Panel Admin

Website untuk usaha katering **Asri Catering** (milik Ibu Asri): nasi kotak,
bento, prasmanan, tumpeng, dan snack box.

**Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (DB + Auth) · QRIS · Leaflet/OpenStreetMap · Gemini API**

| Dokumen | Isi |
| --- | --- |
| [`docs/SETUP-BACKEND.md`](docs/SETUP-BACKEND.md) | Cara menyiapkan Supabase dan Gemini, langkah demi langkah |
| [`docs/SETUP-PEMBAYARAN.md`](docs/SETUP-PEMBAYARAN.md) | Akun pelanggan, Supabase Auth, QRIS, konfirmasi otomatis MacroDroid, env Vercel |
| [`docs/KEBUTUHAN-FOTO.md`](docs/KEBUTUHAN-FOTO.md) | Daftar foto yang perlu disiapkan klien + panduan memotret |
| [`docs/DATA-YANG-HARUS-DIGANTI.md`](docs/DATA-YANG-HARUS-DIGANTI.md) | Data contoh yang wajib diganti sebelum serah terima |

---

## 1. Dua mode

Aplikasi berjalan di salah satu dari dua mode, ditentukan otomatis dari isi
`.env.local`:

| | Mode data contoh | Mode Supabase |
| --- | --- | --- |
| Syarat | `.env.local` kosong | `NEXT_PUBLIC_SUPABASE_*` terisi |
| Penyimpanan | `localStorage` peramban | Supabase PostgreSQL |
| Data awal | `src/data/` | Hasil `03-seed.sql` |
| Analisis | Perhitungan aplikasi | Gemini, jatuh ke perhitungan aplikasi bila mati |
| Login admin | Akun demo `admin` / `asri2025` | Supabase Auth, akun terdaftar di tabel `users` |
| Akun pelanggan & pembayaran | Tidak tersedia | Supabase Auth + QRIS milik usaha |

Mode contoh berguna untuk melihat katalog dan panel admin tanpa membuat akun
apa pun. Checkout, **Pesanan Saya**, dan halaman akun hanya berjalan pada mode
Supabase, karena pesanan dibuat dan dibayar lewat server.
Panel admin menampilkan mode yang sedang aktif di kiri bawah sidebar.

---

## 2. Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

**Akun demo panel admin (mode contoh saja):** `admin` / `asri2025`
(didefinisikan pada `src/store/DataProvider.tsx`, fungsi `login`). Pada mode
Supabase akun demo ini tidak berlaku.

Untuk menyambungkan Supabase dan Gemini, ikuti
[`docs/SETUP-BACKEND.md`](docs/SETUP-BACKEND.md); untuk akun pelanggan dan
pembayaran, [`docs/SETUP-PEMBAYARAN.md`](docs/SETUP-PEMBAYARAN.md).

### Pengujian

```bash
npm run uji        # 17 uji logika: harga, radius, QRIS bernominal, pencocokan notifikasi
npx tsc --noEmit   # pemeriksaan tipe
npm run build
```

---

## 3. Pemenuhan kebutuhan fungsional

| Kode | Kebutuhan | Halaman |
| --- | --- | --- |
| KF-01 | Profil usaha (sejarah, alamat, jam operasional, kontak) | `/tentang` |
| KF-02 | Katalog menu + foto, deskripsi, harga | `/menu`, `/menu/[slug]` |
| KF-03 | Pemesanan online: keranjang (laci samping), data acara, alamat di peta, bayar | `/pesan` |
| KF-04 | Riwayat & status pesanan pelanggan | `/pesanan`, `/pesanan/[kode]` (`/lacak` dialihkan ke sini) |
| KF-05 | Login & logout administrator (Supabase Auth) | `/admin/login` |
| KF-06 | Kelola data menu (tambah, ubah, hapus) | `/admin/menu` |
| KF-07 | Kelola bahan baku, satuan, harga satuan | `/admin/bahan` |
| KF-08 | Kelola pesanan masuk | `/admin/pesanan` |
| KF-09 | Hitung HPP otomatis dari resep & harga bahan | `/admin/hpp` |
| KF-10 | Laporan pendapatan harian, margin, rekomendasi | `/admin/laporan`, `/admin` |
| — | AI Assistant (tanya jawab kondisi usaha) | `/admin/asisten` |
| — | Daftar, masuk, verifikasi email, lupa & atur ulang sandi | `/daftar`, `/masuk`, `/lupa-sandi`, `/atur-sandi` |
| — | Profil & alamat utama pelanggan | `/akun` |
| — | Pembayaran QRIS bernominal unik + konfirmasi otomatis dari notifikasi HP | `/api/pesanan`, `/api/qris/notifikasi` |
| — | Pengaturan QRIS toko & penerus notifikasi | `/admin/pembayaran` |
| — | Histori transaksi pembayaran | `/admin/transaksi` |

---

## 4. Struktur proyek

```
src/
├─ app/
│  ├─ (situs)/              Halaman publik (header + footer pelanggan)
│  │  ├─ page.tsx           Beranda
│  │  ├─ menu/              Katalog & detail menu
│  │  ├─ tentang/           Profil usaha
│  │  ├─ pesan/             Checkout (wajib masuk)
│  │  ├─ pesanan/           Pesanan Saya & detail/status pesanan
│  │  ├─ masuk/ daftar/ lupa-sandi/ atur-sandi/ akun/
│  │  └─ lacak/             Pengalihan lama ke /pesanan
│  ├─ admin/                Panel admin (sidebar sendiri)
│  │  ├─ login/ page.tsx pesanan/ transaksi/ pembayaran/ menu/ bahan/ hpp/ laporan/ asisten/
│  ├─ api/
│  │  ├─ ai/insight/route.ts            Catatan analisis laporan & HPP (Gemini)
│  │  ├─ ai/asisten/route.ts            Tanya jawab admin              (Gemini)
│  │  ├─ pesanan/route.ts               Buat pesanan + tagihan QRIS
│  │  ├─ pesanan/[kode]/bayar/route.ts  QRIS aktif / QRIS baru bila kedaluwarsa
│  │  ├─ pesanan/[kode]/klaim/route.ts  Pelanggan menandai "sudah bayar"
│  │  ├─ pesanan/[kode]/konfirmasi/route.ts Admin konfirmasi lunas manual
│  │  ├─ qris/notifikasi/route.ts       Penerima notifikasi dari HP pemilik
│  │  └─ qris/status/route.ts           Status token untuk halaman admin
│  ├─ layout.tsx            Font, metadata, penyedia data
│  └─ globals.css           Token warna & komponen dasar
├─ components/              Komponen antarmuka bersama
│  ├─ KeranjangLaci.tsx     Keranjang berupa laci samping
│  ├─ akun/                 Formulir auth, peta alamat (Leaflet)
│  └─ pesanan/              Daftar & detail pesanan pelanggan
├─ data/                    Data contoh: menu, bahan, pesanan, profil (+ profil-en.ts)
├─ lib/
│  ├─ types.ts              Tipe data domain
│  ├─ format.ts             Format rupiah, tanggal, persen
│  ├─ analisis.ts           Mesin HPP, laporan, rekomendasi
│  ├─ asisten.ts            Jawaban cadangan AI Assistant
│  ├─ supabase.ts           Klien Supabase (peramban) + penanda mode
│  ├─ supabase-server.ts    Klien service role (server saja)
│  ├─ pesanan-server.ts     Tagihan QRIS, pencocokan notifikasi (server saja)
│  ├─ pembayaran.ts         Logika murni: harga, radius, QRIS, nominal (diuji)
│  ├─ api-klien.ts          Pemanggil /api/* dengan token sesi
│  ├─ status.ts             Alur, label, dan warna status
│  ├─ db.ts                 Baca/tulis tabel Supabase
│  ├─ teks.ts               Teks menu, status, dan tanggal per bahasa
│  ├─ gemini.ts             Pemanggil Gemini (server saja)
│  ├─ ai-tipe.ts            Bentuk data yang boleh dikirim ke Gemini
│  ├─ ai-sanitasi.ts        Penyaring data sebelum dikirim keluar
│  └─ ai-klien.ts           Jembatan halaman admin ke /api/ai/*
├─ store/BahasaProvider.tsx Pilihan bahasa ID/EN situs pelanggan
├─ store/AuthProvider.tsx   Sesi, profil, dan status admin (Supabase Auth)
├─ store/DataProvider.tsx   Sumber data tunggal + keranjang
supabase/
├─ 01-schema.sql            Tabel, trigger, fungsi
├─ 02-rls.sql               Keamanan baris lama — tidak dipakai lagi
├─ 03-seed.sql              Menu, bahan baku, resep (dihasilkan skrip)
├─ 04-rls-produksi.sql      Keamanan baris lama — tidak dipakai lagi
├─ 05-contoh-pesanan.sql    Pesanan contoh, opsional (dihasilkan skrip)
├─ 07-foto-menu.sql         Bucket Storage untuk foto menu
├─ 08-contoh-pesanan-lunas.sql  5 pesanan lunas untuk menguji laporan, opsional
├─ 09-qris.sql              QRIS toko, nominal unik, log notifikasi
├─ 10-menu-bahasa-inggris.sql  Kolom & isi menu versi bahasa Inggris
└─ 06-akun-pembayaran.sql   Akun pelanggan, pembayaran, RLS produksi
scripts/
├─ muat-data.mjs                 Memuat src/data/*.ts untuk kedua skrip di bawah
├─ buat-seed-sql.mjs             Membuat ulang 03-seed.sql
├─ buat-contoh-pesanan-sql.mjs   Membuat ulang 05-contoh-pesanan.sql
└─ uji-pembayaran.ts             Uji logika pembayaran (npm run uji)
```

---

## 5. Basis data

Tabel mengikuti rancangan pada PRD:

| Tabel | Isi |
| --- | --- |
| `users` | Admin, terhubung ke `auth.users` |
| `profiles` | Pelanggan: nama, telepon, alamat utama, titik peta |
| `categories` | Kategori menu |
| `menus` | Data menu |
| `ingredients` | Bahan baku, satuan, harga satuan, stok |
| `recipes` | Relasi menu ↔ bahan beserta takarannya |
| `orders` | Pesanan |
| `order_details` | Rincian menu tiap pesanan |
| `daily_reports` | Arsip rekap harian |

Ditambah dua tabel pendukung yang dibutuhkan antarmuka:

- `order_status_history` — jejak perubahan status untuk halaman lacak pesanan
- `settings` — asumsi overhead, target margin, titik dapur, radius layanan
- `payments` — setiap pelunasan, otomatis maupun manual (histori transaksi)
- `qris_notifikasi` — log notifikasi pembayaran dari HP pemilik beserta hasil pencocokannya

Catatan rancangan:

- **Kode pesanan dibuat oleh trigger** `buat_kode_pesanan()`, bukan oleh
  peramban, supaya tidak bentrok bila dua pelanggan memesan bersamaan.
- **`order_details` menyimpan salinan nama dan harga menu.** Ini disengaja:
  ketika harga menu dinaikkan, nota pesanan lama tetap menunjukkan harga saat
  pesanan itu dibuat.
- **Dasbor menghitung laporan langsung dari `orders`**, bukan dari
  `daily_reports`, supaya angkanya selalu mutakhir. `daily_reports` dipakai
  untuk arsip; isi lewat `select public.tutup_laporan_harian(current_date - 1);`

Untuk mengubah data contoh: sunting `src/data/`, lalu jalankan

```bash
node scripts/buat-seed-sql.mjs
node scripts/buat-contoh-pesanan-sql.mjs
```

**Mengisi Dasbor dan Laporan.** Laporan dihitung dari tabel `orders`, jadi
setelah `03-seed.sql` saja halaman itu masih kosong — menu sudah ada, pesanan
belum. Jalankan `05-contoh-pesanan.sql` untuk mengisinya dengan 23 pesanan
contoh berkode `ASR-DEMO-`, atau buat pesanan sungguhan lewat `/pesan` lalu
bayar QRIS-nya. Perinciannya ada di `docs/SETUP-BACKEND.md` bagian A3.

---

## 6. Perhitungan HPP (KF-09)

Sesuai PRD, **HPP dan laporan dihitung oleh aplikasi, bukan oleh AI.** Rumusnya
ada di `src/lib/analisis.ts`:

```
biaya bahan     = Σ (jumlah pada resep × harga satuan bahan)
biaya langsung  = biaya bahan + biaya kemasan + biaya tenaga kerja
overhead        = biaya langsung × persentase overhead   (baku 8%)
HPP per porsi   = biaya langsung + overhead

laba per porsi  = harga jual − HPP
margin          = laba per porsi ÷ harga jual × 100%
usulan harga    = HPP ÷ (1 − target margin), lalu dibulatkan
```

Pembulatan usulan harga mengikuti kebiasaan penulisan nota: kelipatan Rp 500
untuk harga di bawah Rp 20.000, Rp 1.000 sampai Rp 100.000, dan Rp 5.000 di
atasnya.

Alur status pesanan: **Menunggu Pembayaran → Dibayar → Diproses → Dikirim →
Selesai**, ditambah **Dibatalkan**. *Dibayar* diisi otomatis saat notifikasi
QRIS cocok, atau oleh admin lewat konfirmasi manual; tahap berikutnya digeser
admin. Laporan harian menghitung pesanan
berstatus *Dibayar*, *Diproses*, *Dikirim*, dan *Selesai*; pesanan yang belum
dibayar belum diakui sebagai pendapatan. Status lama *Menunggu Konfirmasi*
masih dikenali untuk pesanan dari versi sebelumnya.

---

## 7. Gemini

Gemini dipakai sebagai **lapisan penjelas**, bukan kalkulator. Ia menerima angka
yang sudah dihitung aplikasi lalu menuliskannya sebagai catatan dan jawaban.

Tiga tempat pemakaian:

| Halaman | Route | Bila Gemini mati |
| --- | --- | --- |
| Dashboard | `POST /api/ai/insight` (`jenis: "laporan"`) | Catatan dari `insightLaporan()` |
| Laporan | `POST /api/ai/insight` (`jenis: "laporan"`) | Catatan dari `insightLaporan()` |
| Hitung HPP | `POST /api/ai/insight` (`jenis: "hpp"`) | Catatan dari `analisisHpp()` |
| AI Assistant | `POST /api/ai/asisten` | Jawaban dari `jawabPertanyaan()` |

Setiap balasan menampilkan lencana **Gemini** atau **Hitungan aplikasi**,
sehingga selalu jelas dari mana kalimatnya berasal. Bila API mati, angka HPP dan
laporan tetap tersaji lengkap — hanya kalimat penjelasnya yang berganti.

### Kunci API dan data pribadi

`GEMINI_API_KEY` ditulis **tanpa** awalan `NEXT_PUBLIC_`, dan `src/lib/gemini.ts`
mengimpor `server-only` sehingga build akan gagal bila berkas itu tidak sengaja
terbawa ke komponen klien. Kuncinya tidak pernah sampai ke peramban.

Sesuai PRD, **data pribadi pelanggan tidak dikirim ke Gemini.** Yang dikirim
hanya angka: pendapatan, HPP, margin, jumlah porsi, nama menu, nama bahan, dan
stok. Nama pemesan, nomor telepon, dan alamat tidak ikut.

Penjaminnya `src/lib/ai-sanitasi.ts`: route handler menyusun ulang data bidang
demi bidang, jadi bidang apa pun di luar daftar itu tidak akan pernah
diteruskan, bahkan seandainya peramban mengirimkannya.

---

## 8. Mengisi foto

Daftar lengkap kebutuhan foto, ukuran, penamaan berkas, dan panduan memotret ada
di [`docs/KEBUTUHAN-FOTO.md`](docs/KEBUTUHAN-FOTO.md) — dokumen itu bisa langsung
diteruskan ke klien.

Ringkasnya: semua gambar sekarang berupa kotak abu-abu placeholder
(`src/components/Placeholder.tsx`). Untuk foto menu, buka **Panel Admin → Menu → Ubah**, lalu klik **Unggah
foto**. Foto dikecilkan di peramban (sisi terpanjang 1600 px, WebP) lalu
disimpan di Supabase Storage — jalankan `supabase/07-foto-menu.sql` sekali
sebelumnya. Pada mode data contoh, kolom itu berupa isian alamat gambar. Kolom yang dikosongkan tetap menampilkan kotak abu-abu, jadi foto
boleh dilengkapi bertahap.

Foto sampul beranda dan foto pemilik diganti di kode: ganti
`<GambarPlaceholder />` pada `src/app/(situs)/page.tsx` dan
`src/app/(situs)/tentang/page.tsx` dengan tag `<img>`. Peta lokasi: ganti
`<PetaPlaceholder />` dengan `<iframe>` sematan Google Maps.

---

## 9. Hosting

Aplikasi ini **membutuhkan Node.js di server** karena Gemini, pembuatan
pesanan, dan penerima notifikasi QRIS berjalan di route `/api/*`. Shared hosting cPanel
biasa tidak bisa menjalankannya. Saat ini dideploy di Vercel:
<https://catering-six-psi.vercel.app>. Pilihan
hosting dan langkah deploy ada di `docs/SETUP-BACKEND.md` bagian C.

```bash
npm run build
npm start
```

---

## 10. Catatan desain

- Palet hijau (`brand-50` … `brand-900`) dan netral hangat ada di
  `tailwind.config.ts`.
- Tanpa gradient dan tanpa efek glow; kedalaman dibentuk garis 1 px, bidang
  warna datar, dan bayangan sangat tipis.
- Tipografi: **Fraunces** (judul) dan **Plus Jakarta Sans** (isi), diunduh
  `next/font` saat build — komputer perlu terhubung internet saat build pertama.
- Gambar yang belum ada diwakili kotak abu-abu netral (`abu` pada
  `tailwind.config.ts`).
- Responsif mulai lebar 360 px. Tabel panel admin dapat digeser mendatar di
  layar kecil.
- Situs pelanggan tersedia dalam **Bahasa Indonesia dan Inggris**. Tombol
  **ID | EN** ada di samping keranjang (di HP: satu tombol yang menampilkan
  bahasa tujuan). Pilihan disimpan di peramban (`asri.bahasa`). Teks antarmuka
  ditulis berpasangan lewat `t("…", "…")` dari `useBahasa()`; isi menu memakai
  kolom `*_en` dan jatuh ke bahasa Indonesia bila kosong. Panel admin, pesan
  galat dari server, dan metadata SEO tetap berbahasa Indonesia.

---

## 11. Mengatur ulang data contoh

Hanya berlaku pada mode data contoh. Jalankan di konsol peramban:

```js
Object.keys(localStorage)
  .filter((k) => k.startsWith("asri."))
  .forEach((k) => localStorage.removeItem(k));
location.reload();
```
