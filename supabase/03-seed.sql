-- ===========================================================================
-- Asri Catering — Data Contoh
--
-- Dihasilkan otomatis oleh scripts/buat-seed-sql.mjs dari src/data/.
-- Jangan disunting langsung: ubah src/data lalu jalankan ulang skripnya.
--
-- Jalankan SETELAH 01-schema.sql dan 02-rls.sql.
-- Aman dijalankan berulang kali: memakai on conflict do update, jadi data
-- diperbarui dan tidak digandakan.
--
-- Setiap perintah berdiri sendiri — tidak ada tabel sementara dan tidak ada
-- blok transaksi — supaya tetap jalan di SQL Editor Supabase yang memakai
-- connection pooler.
--
-- ⚠️  Nama pemilik, alamat, nomor telepon, harga, dan resep di bawah ini masih
--     contoh. Ganti dengan data asli Asri Catering sebelum dipakai sungguhan.
-- ===========================================================================

-- ---------------------------------------------------------------- kategori
insert into public.categories (nama, urutan) values
  ('Nasi Box', 1),
  ('Prasmanan', 2),
  ('Tumpeng', 3),
  ('Snack Box', 4),
  ('Lauk Satuan', 5)
on conflict (nama) do update set urutan = excluded.urutan;

-- -------------------------------------------------------------- bahan baku
-- Pengaman: "on conflict (nama)" butuh kolom nama yang unik. Baris ini tidak
-- mengubah apa pun bila indeksnya sudah dibuat oleh 01-schema.sql.
create unique index if not exists ingredients_nama_unik on public.ingredients (nama);

insert into public.ingredients (nama, satuan, harga_satuan, kategori, stok, stok_minimum) values
  ('Beras Pandan Wangi', 'kg', 14000, 'Bahan Pokok', 75, 25),
  ('Ayam Broiler', 'kg', 38000, 'Protein', 24, 10),
  ('Daging Sapi', 'kg', 135000, 'Protein', 6, 5),
  ('Telur Ayam', 'butir', 2400, 'Protein', 180, 60),
  ('Tempe', 'pcs', 4500, 'Protein', 40, 15),
  ('Tahu Putih', 'pcs', 1000, 'Protein', 120, 50),
  ('Ikan Nila', 'kg', 42000, 'Protein', 8, 4),
  ('Kentang', 'kg', 16000, 'Sayuran', 18, 8),
  ('Buncis', 'kg', 14000, 'Sayuran', 9, 5),
  ('Wortel', 'kg', 12000, 'Sayuran', 11, 5),
  ('Kol', 'kg', 9000, 'Sayuran', 14, 6),
  ('Nangka Muda', 'kg', 11000, 'Sayuran', 7, 4),
  ('Mie Bihun', 'pack', 7000, 'Bahan Pokok', 22, 10),
  ('Kelapa Parut', 'kg', 13000, 'Bahan Pokok', 10, 4),
  ('Santan Kara', 'pack', 6500, 'Bumbu', 30, 12),
  ('Cabai Merah', 'kg', 52000, 'Bumbu', 4, 3),
  ('Bawang Merah', 'kg', 34000, 'Bumbu', 9, 5),
  ('Bawang Putih', 'kg', 30000, 'Bumbu', 7, 4),
  ('Minyak Goreng', 'liter', 17500, 'Bumbu', 26, 10),
  ('Kecap Manis', 'liter', 24000, 'Bumbu', 6, 3),
  ('Bumbu Dapur Racik', 'pack', 5000, 'Bumbu', 45, 20),
  ('Gula Merah', 'kg', 21000, 'Bumbu', 8, 4),
  ('Tepung Terigu', 'kg', 12000, 'Bahan Pokok', 15, 6),
  ('Box Nasi Kertas', 'pcs', 1800, 'Kemasan', 500, 200),
  ('Dus Snack Box', 'pcs', 1500, 'Kemasan', 350, 150),
  ('Daun Pisang', 'ikat', 6000, 'Kemasan', 12, 5)
on conflict (nama) do update set
  satuan       = excluded.satuan,
  harga_satuan = excluded.harga_satuan,
  kategori     = excluded.kategori,
  stok         = excluded.stok,
  stok_minimum = excluded.stok_minimum,
  diubah_pada  = now();

-- ------------------------------------------------------------ menu & resep

-- Nasi Rames Komplit
insert into public.menus (
  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,
  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,
  biaya_kemasan, biaya_tenaga_kerja)
select
  c.id, 'nasi-rames-komplit', 'Nasi Rames Komplit',
  'Menu andalan Asri Catering. Nasi pulen dengan ayam ungkep, mi goreng, sayur, sambal, dan kerupuk.',
  'Nasi Rames Komplit adalah menu yang paling sering dipesan untuk rapat kantor dan acara keluarga. Nasi pandan wangi disajikan bersama ayam ungkep bumbu kuning, mi goreng jawa, oseng buncis wortel, tempe orek, sambal goreng, dan kerupuk udang. Dikemas rapi dalam box kertas food grade lengkap dengan sendok dan tisu.',
  22000, 'per box', '',
  array['Nasi putih pandan wangi', 'Ayam ungkep bumbu kuning', 'Mi goreng jawa', 'Oseng buncis wortel', 'Tempe orek', 'Sambal & kerupuk']::text[],
  true, true, 10, 1800, 2000
from public.categories c
where c.nama = 'Nasi Box'
on conflict (slug) do update set
  category_id        = excluded.category_id,
  nama               = excluded.nama,
  deskripsi          = excluded.deskripsi,
  deskripsi_panjang  = excluded.deskripsi_panjang,
  harga_jual         = excluded.harga_jual,
  satuan_jual        = excluded.satuan_jual,
  isi                = excluded.isi,
  populer            = excluded.populer,
  tersedia           = excluded.tersedia,
  minimal_pesan      = excluded.minimal_pesan,
  biaya_kemasan      = excluded.biaya_kemasan,
  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,
  diubah_pada        = now();

insert into public.recipes (menu_id, ingredient_id, jumlah)
select m.id, i.id, v.jumlah
from public.menus m
cross join (values
  ('Beras Pandan Wangi', 0.1500),
  ('Ayam Broiler', 0.0800),
  ('Tempe', 0.3000),
  ('Tahu Putih', 1.0000),
  ('Mie Bihun', 0.1000),
  ('Buncis', 0.0300),
  ('Wortel', 0.0200),
  ('Cabai Merah', 0.0100),
  ('Bumbu Dapur Racik', 0.3000),
  ('Minyak Goreng', 0.0300)
) as v(nama_bahan, jumlah)
join public.ingredients i on i.nama = v.nama_bahan
where m.slug = 'nasi-rames-komplit'
on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;

-- Nasi Rames Hemat
insert into public.menus (
  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,
  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,
  biaya_kemasan, biaya_tenaga_kerja)
select
  c.id, 'nasi-rames-hemat', 'Nasi Rames Hemat',
  'Pilihan ekonomis untuk pesanan jumlah besar. Tetap lengkap dengan lauk, sayur, dan sambal.',
  'Dirancang untuk acara dengan jumlah peserta banyak namun tetap ingin menyajikan makanan lengkap. Berisi nasi putih, telur balado, tahu tempe bacem, oseng kol wortel, sambal, dan kerupuk. Cocok untuk pengajian, kerja bakti, dan acara sekolah.',
  16000, 'per box', '',
  array['Nasi putih', 'Telur balado', 'Tahu tempe bacem', 'Oseng kol wortel', 'Sambal & kerupuk']::text[],
  true, true, 15, 1800, 1500
from public.categories c
where c.nama = 'Nasi Box'
on conflict (slug) do update set
  category_id        = excluded.category_id,
  nama               = excluded.nama,
  deskripsi          = excluded.deskripsi,
  deskripsi_panjang  = excluded.deskripsi_panjang,
  harga_jual         = excluded.harga_jual,
  satuan_jual        = excluded.satuan_jual,
  isi                = excluded.isi,
  populer            = excluded.populer,
  tersedia           = excluded.tersedia,
  minimal_pesan      = excluded.minimal_pesan,
  biaya_kemasan      = excluded.biaya_kemasan,
  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,
  diubah_pada        = now();

insert into public.recipes (menu_id, ingredient_id, jumlah)
select m.id, i.id, v.jumlah
from public.menus m
cross join (values
  ('Beras Pandan Wangi', 0.1400),
  ('Telur Ayam', 1.0000),
  ('Tempe', 0.2500),
  ('Tahu Putih', 1.0000),
  ('Kol', 0.0500),
  ('Wortel', 0.0200),
  ('Bumbu Dapur Racik', 0.2500),
  ('Minyak Goreng', 0.0250)
) as v(nama_bahan, jumlah)
join public.ingredients i on i.nama = v.nama_bahan
where m.slug = 'nasi-rames-hemat'
on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;

-- Nasi Box Ayam Bakar Madu
insert into public.menus (
  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,
  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,
  biaya_kemasan, biaya_tenaga_kerja)
select
  c.id, 'nasi-box-ayam-bakar', 'Nasi Box Ayam Bakar Madu',
  'Ayam bakar bumbu madu kecap dengan lalapan segar dan sambal terasi buatan sendiri.',
  'Ayam dipanggang dengan olesan bumbu madu kecap khas Asri Catering, disajikan bersama nasi putih, lalapan segar, tahu goreng, dan sambal terasi. Menu favorit untuk jamuan tamu dan acara kantor menengah ke atas.',
  28000, 'per box', '',
  array['Nasi putih pandan wangi', 'Ayam bakar madu kecap', 'Tahu goreng', 'Lalapan segar', 'Sambal terasi', 'Kerupuk']::text[],
  true, true, 10, 1800, 2500
from public.categories c
where c.nama = 'Nasi Box'
on conflict (slug) do update set
  category_id        = excluded.category_id,
  nama               = excluded.nama,
  deskripsi          = excluded.deskripsi,
  deskripsi_panjang  = excluded.deskripsi_panjang,
  harga_jual         = excluded.harga_jual,
  satuan_jual        = excluded.satuan_jual,
  isi                = excluded.isi,
  populer            = excluded.populer,
  tersedia           = excluded.tersedia,
  minimal_pesan      = excluded.minimal_pesan,
  biaya_kemasan      = excluded.biaya_kemasan,
  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,
  diubah_pada        = now();

insert into public.recipes (menu_id, ingredient_id, jumlah)
select m.id, i.id, v.jumlah
from public.menus m
cross join (values
  ('Beras Pandan Wangi', 0.1500),
  ('Ayam Broiler', 0.1200),
  ('Tahu Putih', 1.0000),
  ('Kecap Manis', 0.0200),
  ('Cabai Merah', 0.0150),
  ('Bawang Merah', 0.0100),
  ('Bumbu Dapur Racik', 0.3500),
  ('Minyak Goreng', 0.0200)
) as v(nama_bahan, jumlah)
join public.ingredients i on i.nama = v.nama_bahan
where m.slug = 'nasi-box-ayam-bakar'
on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;

-- Nasi Box Rendang Sapi
insert into public.menus (
  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,
  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,
  biaya_kemasan, biaya_tenaga_kerja)
select
  c.id, 'nasi-box-rendang-sapi', 'Nasi Box Rendang Sapi',
  'Rendang sapi empuk yang dimasak perlahan selama empat jam dengan santan dan rempah pilihan.',
  'Rendang sapi dimasak perlahan selama kurang lebih empat jam sampai bumbu meresap dan daging empuk. Disajikan bersama nasi putih, sayur nangka santan, sambal ijo, dan kerupuk. Menu premium untuk acara pernikahan, syukuran, dan jamuan resmi.',
  38000, 'per box', '',
  array['Nasi putih pandan wangi', 'Rendang sapi', 'Sayur nangka santan', 'Sambal ijo', 'Kerupuk']::text[],
  false, true, 10, 1800, 3000
from public.categories c
where c.nama = 'Nasi Box'
on conflict (slug) do update set
  category_id        = excluded.category_id,
  nama               = excluded.nama,
  deskripsi          = excluded.deskripsi,
  deskripsi_panjang  = excluded.deskripsi_panjang,
  harga_jual         = excluded.harga_jual,
  satuan_jual        = excluded.satuan_jual,
  isi                = excluded.isi,
  populer            = excluded.populer,
  tersedia           = excluded.tersedia,
  minimal_pesan      = excluded.minimal_pesan,
  biaya_kemasan      = excluded.biaya_kemasan,
  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,
  diubah_pada        = now();

insert into public.recipes (menu_id, ingredient_id, jumlah)
select m.id, i.id, v.jumlah
from public.menus m
cross join (values
  ('Beras Pandan Wangi', 0.1500),
  ('Daging Sapi', 0.1000),
  ('Santan Kara', 0.4000),
  ('Nangka Muda', 0.0500),
  ('Cabai Merah', 0.0200),
  ('Bawang Merah', 0.0150),
  ('Bawang Putih', 0.0100),
  ('Bumbu Dapur Racik', 0.4000)
) as v(nama_bahan, jumlah)
join public.ingredients i on i.nama = v.nama_bahan
where m.slug = 'nasi-box-rendang-sapi'
on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;

-- Nasi Box Nila Bakar
insert into public.menus (
  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,
  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,
  biaya_kemasan, biaya_tenaga_kerja)
select
  c.id, 'nasi-box-nila-bakar', 'Nasi Box Nila Bakar',
  'Ikan nila segar dibakar dengan bumbu kuning, disajikan bersama lalapan dan sambal matah.',
  'Ikan nila segar ukuran sedang dibakar dengan bumbu kuning hingga harum. Disajikan bersama nasi putih, lalapan, tempe goreng, dan sambal matah. Pilihan sehat untuk tamu yang menghindari daging merah.',
  30000, 'per box', '',
  array['Nasi putih', 'Nila bakar bumbu kuning', 'Tempe goreng', 'Lalapan segar', 'Sambal matah']::text[],
  false, true, 10, 1800, 2500
from public.categories c
where c.nama = 'Nasi Box'
on conflict (slug) do update set
  category_id        = excluded.category_id,
  nama               = excluded.nama,
  deskripsi          = excluded.deskripsi,
  deskripsi_panjang  = excluded.deskripsi_panjang,
  harga_jual         = excluded.harga_jual,
  satuan_jual        = excluded.satuan_jual,
  isi                = excluded.isi,
  populer            = excluded.populer,
  tersedia           = excluded.tersedia,
  minimal_pesan      = excluded.minimal_pesan,
  biaya_kemasan      = excluded.biaya_kemasan,
  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,
  diubah_pada        = now();

insert into public.recipes (menu_id, ingredient_id, jumlah)
select m.id, i.id, v.jumlah
from public.menus m
cross join (values
  ('Beras Pandan Wangi', 0.1500),
  ('Ikan Nila', 0.1800),
  ('Tempe', 0.2500),
  ('Cabai Merah', 0.0200),
  ('Bawang Merah', 0.0150),
  ('Bumbu Dapur Racik', 0.3000),
  ('Minyak Goreng', 0.0200)
) as v(nama_bahan, jumlah)
join public.ingredients i on i.nama = v.nama_bahan
where m.slug = 'nasi-box-nila-bakar'
on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;

-- Prasmanan Paket Silver
insert into public.menus (
  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,
  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,
  biaya_kemasan, biaya_tenaga_kerja)
select
  c.id, 'prasmanan-paket-silver', 'Prasmanan Paket Silver',
  'Empat pilihan hidangan dengan peralatan saji lengkap dan satu petugas. Minimal 50 porsi.',
  'Paket prasmanan dengan nasi putih, dua lauk utama, satu sayur, sambal, kerupuk, dan buah potong. Sudah termasuk peralatan saji, pemanas makanan, taplak meja, dan satu petugas penyaji selama acara berlangsung.',
  34000, 'per porsi', '',
  array['Nasi putih', '2 lauk utama pilihan', '1 sayur', 'Sambal & kerupuk', 'Buah potong', 'Peralatan saji + 1 petugas']::text[],
  true, true, 50, 900, 3500
from public.categories c
where c.nama = 'Prasmanan'
on conflict (slug) do update set
  category_id        = excluded.category_id,
  nama               = excluded.nama,
  deskripsi          = excluded.deskripsi,
  deskripsi_panjang  = excluded.deskripsi_panjang,
  harga_jual         = excluded.harga_jual,
  satuan_jual        = excluded.satuan_jual,
  isi                = excluded.isi,
  populer            = excluded.populer,
  tersedia           = excluded.tersedia,
  minimal_pesan      = excluded.minimal_pesan,
  biaya_kemasan      = excluded.biaya_kemasan,
  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,
  diubah_pada        = now();

insert into public.recipes (menu_id, ingredient_id, jumlah)
select m.id, i.id, v.jumlah
from public.menus m
cross join (values
  ('Beras Pandan Wangi', 0.1600),
  ('Ayam Broiler', 0.1000),
  ('Tempe', 0.3000),
  ('Buncis', 0.0400),
  ('Wortel', 0.0300),
  ('Kentang', 0.0400),
  ('Bumbu Dapur Racik', 0.3500),
  ('Minyak Goreng', 0.0300)
) as v(nama_bahan, jumlah)
join public.ingredients i on i.nama = v.nama_bahan
where m.slug = 'prasmanan-paket-silver'
on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;

-- Prasmanan Paket Gold
insert into public.menus (
  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,
  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,
  biaya_kemasan, biaya_tenaga_kerja)
select
  c.id, 'prasmanan-paket-gold', 'Prasmanan Paket Gold',
  'Enam hidangan termasuk olahan daging sapi, dessert, dan dua petugas penyaji.',
  'Paket prasmanan lengkap untuk acara besar. Berisi nasi putih dan nasi goreng, tiga lauk utama termasuk olahan daging sapi, dua sayur, sambal, kerupuk, buah potong, dan dessert. Termasuk dekorasi meja saji sederhana dan dua petugas penyaji.',
  48000, 'per porsi', '',
  array['Nasi putih & nasi goreng', '3 lauk utama (termasuk sapi)', '2 sayur', 'Sambal & kerupuk', 'Buah potong & dessert', 'Dekorasi meja + 2 petugas']::text[],
  false, true, 50, 1200, 5000
from public.categories c
where c.nama = 'Prasmanan'
on conflict (slug) do update set
  category_id        = excluded.category_id,
  nama               = excluded.nama,
  deskripsi          = excluded.deskripsi,
  deskripsi_panjang  = excluded.deskripsi_panjang,
  harga_jual         = excluded.harga_jual,
  satuan_jual        = excluded.satuan_jual,
  isi                = excluded.isi,
  populer            = excluded.populer,
  tersedia           = excluded.tersedia,
  minimal_pesan      = excluded.minimal_pesan,
  biaya_kemasan      = excluded.biaya_kemasan,
  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,
  diubah_pada        = now();

insert into public.recipes (menu_id, ingredient_id, jumlah)
select m.id, i.id, v.jumlah
from public.menus m
cross join (values
  ('Beras Pandan Wangi', 0.1800),
  ('Ayam Broiler', 0.1000),
  ('Daging Sapi', 0.0600),
  ('Telur Ayam', 0.5000),
  ('Kentang', 0.0500),
  ('Buncis', 0.0400),
  ('Wortel', 0.0300),
  ('Santan Kara', 0.3000),
  ('Bumbu Dapur Racik', 0.4500),
  ('Minyak Goreng', 0.0400)
) as v(nama_bahan, jumlah)
join public.ingredients i on i.nama = v.nama_bahan
where m.slug = 'prasmanan-paket-gold'
on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;

-- Tumpeng Mini
insert into public.menus (
  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,
  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,
  biaya_kemasan, biaya_tenaga_kerja)
select
  c.id, 'tumpeng-mini', 'Tumpeng Mini',
  'Tumpeng nasi kuning ukuran kecil untuk 5-7 orang. Cocok untuk syukuran sederhana.',
  'Tumpeng nasi kuning setinggi kurang lebih 20 cm di atas tampah bambu berhias daun pisang. Dilengkapi tujuh lauk pendamping: ayam ungkep, telur balado, tempe orek, mi goreng, urap sayur, perkedel kentang, dan sambal goreng. Cukup untuk 5 sampai 7 orang.',
  285000, 'per paket', '',
  array['Nasi kuning tampah bambu', 'Ayam ungkep', 'Telur balado', 'Tempe orek', 'Mi goreng', 'Urap sayur', 'Perkedel kentang']::text[],
  true, true, 1, 22000, 35000
from public.categories c
where c.nama = 'Tumpeng'
on conflict (slug) do update set
  category_id        = excluded.category_id,
  nama               = excluded.nama,
  deskripsi          = excluded.deskripsi,
  deskripsi_panjang  = excluded.deskripsi_panjang,
  harga_jual         = excluded.harga_jual,
  satuan_jual        = excluded.satuan_jual,
  isi                = excluded.isi,
  populer            = excluded.populer,
  tersedia           = excluded.tersedia,
  minimal_pesan      = excluded.minimal_pesan,
  biaya_kemasan      = excluded.biaya_kemasan,
  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,
  diubah_pada        = now();

insert into public.recipes (menu_id, ingredient_id, jumlah)
select m.id, i.id, v.jumlah
from public.menus m
cross join (values
  ('Beras Pandan Wangi', 1.2000),
  ('Ayam Broiler', 0.8000),
  ('Telur Ayam', 7.0000),
  ('Tempe', 2.0000),
  ('Mie Bihun', 1.0000),
  ('Kentang', 0.4000),
  ('Kol', 0.3000),
  ('Kelapa Parut', 0.3000),
  ('Bumbu Dapur Racik', 3.0000),
  ('Daun Pisang', 1.0000),
  ('Minyak Goreng', 0.3000)
) as v(nama_bahan, jumlah)
join public.ingredients i on i.nama = v.nama_bahan
where m.slug = 'tumpeng-mini'
on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;

-- Tumpeng Komplit Nampan
insert into public.menus (
  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,
  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,
  biaya_kemasan, biaya_tenaga_kerja)
select
  c.id, 'tumpeng-komplit-nampan', 'Tumpeng Komplit Nampan',
  'Tumpeng besar untuk 15-20 orang dengan sembilan lauk pendamping dan hiasan lengkap.',
  'Tumpeng nasi kuning ukuran besar di atas nampan bambu 60 cm, dihias daun pisang, cabai merah, dan telur rebus. Dilengkapi sembilan lauk pendamping serta kartu ucapan sesuai tema acara. Cukup untuk 15 sampai 20 orang.',
  620000, 'per paket', '',
  array['Nasi kuning nampan 60 cm', 'Ayam ungkep & ayam bakar', 'Telur balado', 'Rendang sapi', 'Urap sayur', 'Perkedel kentang', 'Mi goreng', 'Sambal goreng', 'Kartu ucapan']::text[],
  false, true, 1, 45000, 75000
from public.categories c
where c.nama = 'Tumpeng'
on conflict (slug) do update set
  category_id        = excluded.category_id,
  nama               = excluded.nama,
  deskripsi          = excluded.deskripsi,
  deskripsi_panjang  = excluded.deskripsi_panjang,
  harga_jual         = excluded.harga_jual,
  satuan_jual        = excluded.satuan_jual,
  isi                = excluded.isi,
  populer            = excluded.populer,
  tersedia           = excluded.tersedia,
  minimal_pesan      = excluded.minimal_pesan,
  biaya_kemasan      = excluded.biaya_kemasan,
  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,
  diubah_pada        = now();

insert into public.recipes (menu_id, ingredient_id, jumlah)
select m.id, i.id, v.jumlah
from public.menus m
cross join (values
  ('Beras Pandan Wangi', 3.0000),
  ('Ayam Broiler', 2.0000),
  ('Daging Sapi', 0.5000),
  ('Telur Ayam', 15.0000),
  ('Tempe', 4.0000),
  ('Mie Bihun', 2.0000),
  ('Kentang', 1.0000),
  ('Kol', 0.6000),
  ('Kelapa Parut', 0.6000),
  ('Santan Kara', 3.0000),
  ('Bumbu Dapur Racik', 6.0000),
  ('Daun Pisang', 2.0000),
  ('Minyak Goreng', 0.6000)
) as v(nama_bahan, jumlah)
join public.ingredients i on i.nama = v.nama_bahan
where m.slug = 'tumpeng-komplit-nampan'
on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;

-- Snack Box Isi 3
insert into public.menus (
  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,
  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,
  biaya_kemasan, biaya_tenaga_kerja)
select
  c.id, 'snack-box-isi-3', 'Snack Box Isi 3',
  'Tiga jajanan pasar rumahan dalam satu dus, ditambah air mineral gelas.',
  'Berisi tiga jenis kue pilihan hari itu, misalnya risoles, lemper, dan bolu kukus, ditambah satu air mineral gelas. Semua kue dibuat pagi hari sebelum dikirim sehingga tekstur tetap lembut.',
  12000, 'per box', '',
  array['3 jenis kue pilihan', 'Air mineral gelas', 'Dus snack + tisu']::text[],
  true, true, 20, 1500, 1500
from public.categories c
where c.nama = 'Snack Box'
on conflict (slug) do update set
  category_id        = excluded.category_id,
  nama               = excluded.nama,
  deskripsi          = excluded.deskripsi,
  deskripsi_panjang  = excluded.deskripsi_panjang,
  harga_jual         = excluded.harga_jual,
  satuan_jual        = excluded.satuan_jual,
  isi                = excluded.isi,
  populer            = excluded.populer,
  tersedia           = excluded.tersedia,
  minimal_pesan      = excluded.minimal_pesan,
  biaya_kemasan      = excluded.biaya_kemasan,
  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,
  diubah_pada        = now();

insert into public.recipes (menu_id, ingredient_id, jumlah)
select m.id, i.id, v.jumlah
from public.menus m
cross join (values
  ('Tepung Terigu', 0.1200),
  ('Telur Ayam', 0.5000),
  ('Gula Merah', 0.0300),
  ('Kelapa Parut', 0.0500),
  ('Minyak Goreng', 0.0500),
  ('Bumbu Dapur Racik', 0.1000)
) as v(nama_bahan, jumlah)
join public.ingredients i on i.nama = v.nama_bahan
where m.slug = 'snack-box-isi-3'
on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;

-- Snack Box Premium Isi 4
insert into public.menus (
  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,
  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,
  biaya_kemasan, biaya_tenaga_kerja)
select
  c.id, 'snack-box-premium', 'Snack Box Premium Isi 4',
  'Empat kue termasuk satu kue basah premium, cocok untuk rapat dan seminar.',
  'Berisi empat jenis kue termasuk satu kue basah premium seperti pastel isi ayam atau bolu gulung, ditambah air mineral botol 330 ml. Dikemas dalam dus putih polos yang bisa ditambahkan stiker logo instansi.',
  17000, 'per box', '',
  array['4 jenis kue', '1 kue basah premium', 'Air mineral botol 330 ml', 'Dus putih + tisu']::text[],
  false, true, 20, 1500, 2000
from public.categories c
where c.nama = 'Snack Box'
on conflict (slug) do update set
  category_id        = excluded.category_id,
  nama               = excluded.nama,
  deskripsi          = excluded.deskripsi,
  deskripsi_panjang  = excluded.deskripsi_panjang,
  harga_jual         = excluded.harga_jual,
  satuan_jual        = excluded.satuan_jual,
  isi                = excluded.isi,
  populer            = excluded.populer,
  tersedia           = excluded.tersedia,
  minimal_pesan      = excluded.minimal_pesan,
  biaya_kemasan      = excluded.biaya_kemasan,
  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,
  diubah_pada        = now();

insert into public.recipes (menu_id, ingredient_id, jumlah)
select m.id, i.id, v.jumlah
from public.menus m
cross join (values
  ('Tepung Terigu', 0.1600),
  ('Telur Ayam', 0.8000),
  ('Ayam Broiler', 0.0300),
  ('Gula Merah', 0.0400),
  ('Kelapa Parut', 0.0600),
  ('Minyak Goreng', 0.0600),
  ('Bumbu Dapur Racik', 0.1500)
) as v(nama_bahan, jumlah)
join public.ingredients i on i.nama = v.nama_bahan
where m.slug = 'snack-box-premium'
on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;

-- Ayam Goreng Lengkuas
insert into public.menus (
  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,
  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,
  biaya_kemasan, biaya_tenaga_kerja)
select
  c.id, 'ayam-goreng-lengkuas', 'Ayam Goreng Lengkuas',
  'Ayam ungkep bumbu lengkuas, digoreng garing dengan serundeng melimpah.',
  'Ayam diungkep dengan bumbu lengkuas selama satu jam, kemudian digoreng hingga garing dan ditaburi serundeng lengkuas. Dijual per potong, cocok untuk menambah lauk pada pesanan nasi box.',
  11000, 'per potong', '',
  array['1 potong ayam', 'Serundeng lengkuas']::text[],
  false, true, 10, 500, 1200
from public.categories c
where c.nama = 'Lauk Satuan'
on conflict (slug) do update set
  category_id        = excluded.category_id,
  nama               = excluded.nama,
  deskripsi          = excluded.deskripsi,
  deskripsi_panjang  = excluded.deskripsi_panjang,
  harga_jual         = excluded.harga_jual,
  satuan_jual        = excluded.satuan_jual,
  isi                = excluded.isi,
  populer            = excluded.populer,
  tersedia           = excluded.tersedia,
  minimal_pesan      = excluded.minimal_pesan,
  biaya_kemasan      = excluded.biaya_kemasan,
  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,
  diubah_pada        = now();

insert into public.recipes (menu_id, ingredient_id, jumlah)
select m.id, i.id, v.jumlah
from public.menus m
cross join (values
  ('Ayam Broiler', 0.1200),
  ('Kelapa Parut', 0.0400),
  ('Bumbu Dapur Racik', 0.2500),
  ('Minyak Goreng', 0.0400)
) as v(nama_bahan, jumlah)
join public.ingredients i on i.nama = v.nama_bahan
where m.slug = 'ayam-goreng-lengkuas'
on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;

-- Gudeg Nangka
insert into public.menus (
  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,
  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,
  biaya_kemasan, biaya_tenaga_kerja)
select
  c.id, 'gudeg-nangka', 'Gudeg Nangka',
  'Nangka muda dimasak santan dan gula merah selama lima jam.',
  'Nangka muda dimasak dengan santan, gula merah, dan daun jati selama kurang lebih lima jam hingga berwarna cokelat pekat dan manis gurih. Dijual per porsi cup, bisa ditambahkan pada paket nasi box mana pun.',
  9000, 'per porsi', '',
  array['1 cup gudeg nangka', 'Areh santan']::text[],
  false, true, 10, 700, 900
from public.categories c
where c.nama = 'Lauk Satuan'
on conflict (slug) do update set
  category_id        = excluded.category_id,
  nama               = excluded.nama,
  deskripsi          = excluded.deskripsi,
  deskripsi_panjang  = excluded.deskripsi_panjang,
  harga_jual         = excluded.harga_jual,
  satuan_jual        = excluded.satuan_jual,
  isi                = excluded.isi,
  populer            = excluded.populer,
  tersedia           = excluded.tersedia,
  minimal_pesan      = excluded.minimal_pesan,
  biaya_kemasan      = excluded.biaya_kemasan,
  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,
  diubah_pada        = now();

insert into public.recipes (menu_id, ingredient_id, jumlah)
select m.id, i.id, v.jumlah
from public.menus m
cross join (values
  ('Nangka Muda', 0.1200),
  ('Santan Kara', 0.3000),
  ('Gula Merah', 0.0400),
  ('Bumbu Dapur Racik', 0.2000)
) as v(nama_bahan, jumlah)
join public.ingredients i on i.nama = v.nama_bahan
where m.slug = 'gudeg-nangka'
on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;

-- Tahu Tempe Bacem
insert into public.menus (
  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,
  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,
  biaya_kemasan, biaya_tenaga_kerja)
select
  c.id, 'tahu-tempe-bacem', 'Tahu Tempe Bacem',
  'Tahu dan tempe bacem manis gurih, dimasak dengan gula merah asli.',
  'Tahu dan tempe direbus dalam bumbu bacem berisi gula merah, ketumbar, dan lengkuas, kemudian digoreng sebentar agar permukaannya karamel. Satu porsi berisi dua potong tahu dan dua potong tempe.',
  6000, 'per porsi', '',
  array['2 potong tahu bacem', '2 potong tempe bacem']::text[],
  false, true, 10, 500, 700
from public.categories c
where c.nama = 'Lauk Satuan'
on conflict (slug) do update set
  category_id        = excluded.category_id,
  nama               = excluded.nama,
  deskripsi          = excluded.deskripsi,
  deskripsi_panjang  = excluded.deskripsi_panjang,
  harga_jual         = excluded.harga_jual,
  satuan_jual        = excluded.satuan_jual,
  isi                = excluded.isi,
  populer            = excluded.populer,
  tersedia           = excluded.tersedia,
  minimal_pesan      = excluded.minimal_pesan,
  biaya_kemasan      = excluded.biaya_kemasan,
  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,
  diubah_pada        = now();

insert into public.recipes (menu_id, ingredient_id, jumlah)
select m.id, i.id, v.jumlah
from public.menus m
cross join (values
  ('Tempe', 0.4000),
  ('Tahu Putih', 2.0000),
  ('Gula Merah', 0.0300),
  ('Bumbu Dapur Racik', 0.1500),
  ('Minyak Goreng', 0.0200)
) as v(nama_bahan, jumlah)
join public.ingredients i on i.nama = v.nama_bahan
where m.slug = 'tahu-tempe-bacem'
on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;

-- ------------------------------------------------------------------ periksa
-- Jalankan bagian ini untuk memastikan datanya masuk.
-- Angka yang diharapkan: 5 kategori, 26 bahan, 14 menu, 109 baris resep.

select 'kategori' as tabel, count(*) as jumlah from public.categories
union all
select 'bahan baku', count(*) from public.ingredients
union all
select 'menu', count(*) from public.menus
union all
select 'baris resep', count(*) from public.recipes;
