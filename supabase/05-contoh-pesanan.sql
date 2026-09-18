-- ===========================================================================
-- Asri Catering — Pesanan Contoh (OPSIONAL)
--
-- Dihasilkan otomatis oleh scripts/buat-contoh-pesanan-sql.mjs dari
-- src/data/pesanan.ts. Jangan disunting langsung.
--
-- Untuk apa berkas ini:
--   Setelah 03-seed.sql, tabel menu dan bahan baku sudah terisi tetapi tabel
--   pesanan masih kosong — sehingga Dasbor dan Laporan tidak punya angka apa
--   pun untuk ditampilkan. Berkas ini mengisi 23 pesanan contoh yang
--   tersebar pada dua minggu terakhir dan dua minggu ke depan.
--
-- Jalankan SETELAH 03-seed.sql. Aman diulang: pesanan lama berkode
-- ASR-DEMO-% dihapus lebih dulu, jadi tidak pernah menumpuk.
--
-- ⚠️  Semua pesanan di bawah ini memakai kode berawalan ASR-DEMO- supaya mudah
--     dibedakan dari pesanan sungguhan. Hapus sebelum sistem dipakai usaha:
--
--       delete from public.orders where kode like 'ASR-DEMO-%';
--
--     Menghapus pesanan otomatis menghapus rincian dan riwayat statusnya.
--
-- Tanggal memakai current_date, jadi berkas ini tetap menghasilkan laporan
-- yang terisi kapan pun dijalankan.
-- ===========================================================================

-- --------------------------------------------------------------- bersihkan
delete from public.orders where kode like 'ASR-DEMO-%';

-- ---------------------------------------------------------------- pesanan

-- ASR-DEMO-01 · Rina Kusumawati
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-01', 'Rina Kusumawati', '0812-9087-1122',
  'Kantor Dinas Pendidikan, Jl. Radjiman No. 6, Bandung',
  current_date - 13, '07:30',
  'Ambil di Tempat', 'Mohon sambalnya dipisah ya.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('nasi-rames-komplit'::text, 45)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Selesai', current_date - 16 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('nasi-rames-komplit'::text, 45)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-01';

-- ASR-DEMO-02 · Hendra Saputra
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-02', 'Hendra Saputra', '0857-3311-2098',
  'Jl. Cigadung Raya Timur No. 14, Bandung',
  current_date - 12, '09:00',
  'Antar ke Alamat', 'Tolong tambahkan sendok dan tisu ekstra.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('snack-box-isi-3'::text, 60),
    ('nasi-rames-hemat', 60)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Selesai', current_date - 15 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('snack-box-isi-3'::text, 60),
  ('nasi-rames-hemat', 60)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-02';

-- ASR-DEMO-03 · Dewi Anggraeni
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-03', 'Dewi Anggraeni', '0813-2277-8890',
  'Perum Griya Asri Blok C2 No. 8, Cimahi',
  current_date - 11, '11:00',
  'Antar ke Alamat', 'Ada 3 porsi tanpa daging, untuk tamu vegetarian.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('tumpeng-mini'::text, 1),
    ('snack-box-premium', 20)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Selesai', current_date - 14 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('tumpeng-mini'::text, 1),
  ('snack-box-premium', 20)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-03';

-- ASR-DEMO-04 · SMP Negeri 12
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-04', 'SMP Negeri 12', '022-7301-448',
  'Jl. Setiabudi No. 112, Bandung',
  current_date - 10, '11:30',
  'Antar ke Alamat', '',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('nasi-box-ayam-bakar'::text, 30)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Selesai', current_date - 13 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('nasi-box-ayam-bakar'::text, 30)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-04';

-- ASR-DEMO-05 · Bapak Yusuf Maulana
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-05', 'Bapak Yusuf Maulana', '0878-5512-4433',
  'Jl. Cibaduyut Lama No. 45, Bandung',
  current_date - 9, '15:00',
  'Antar ke Alamat', 'Pengantaran lewat pintu samping gedung.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('prasmanan-paket-silver'::text, 80)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Dibatalkan', current_date - 12 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('prasmanan-paket-silver'::text, 80)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-05';

-- ASR-DEMO-06 · PT Sinar Mandiri
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-06', 'PT Sinar Mandiri', '0811-2299-3040',
  'Gedung Pasifik Lt. 3, Jl. Asia Afrika, Bandung',
  current_date - 8, '07:30',
  'Ambil di Tempat', '',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('nasi-rames-komplit'::text, 25),
    ('ayam-goreng-lengkuas', 25)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Selesai', current_date - 11 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('nasi-rames-komplit'::text, 25),
  ('ayam-goreng-lengkuas', 25)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-06';

-- ASR-DEMO-07 · Ibu Siti Rahayu
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-07', 'Ibu Siti Rahayu', '0819-4455-6677',
  'Jl. Kopo Permai II No. 23, Bandung',
  current_date - 7, '09:00',
  'Antar ke Alamat', 'Tolong nasi jangan terlalu pedas.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('nasi-box-rendang-sapi'::text, 20)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Selesai', current_date - 10 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('nasi-box-rendang-sapi'::text, 20)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-07';

-- ASR-DEMO-08 · Panitia Pengajian RW 04
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-08', 'Panitia Pengajian RW 04', '0852-1188-7766',
  'Masjid Al-Ikhlas, Jl. Melati Raya, Bandung',
  current_date - 6, '11:00',
  'Antar ke Alamat', '',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('snack-box-premium'::text, 40)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Selesai', current_date - 9 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('snack-box-premium'::text, 40)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-08';

-- ASR-DEMO-09 · Klinik Sehat Bersama
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-09', 'Klinik Sehat Bersama', '0821-3344-5566',
  'Jl. Buah Batu No. 201, Bandung',
  current_date - 5, '11:30',
  'Antar ke Alamat', 'Mohon sambalnya dipisah ya.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('nasi-rames-hemat'::text, 100)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Selesai', current_date - 8 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('nasi-rames-hemat'::text, 100)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-09';

-- ASR-DEMO-10 · Bapak Agus Priyanto
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-10', 'Bapak Agus Priyanto', '0896-2211-9900',
  'Jl. Sukajadi No. 76, Bandung',
  current_date - 4, '15:00',
  'Antar ke Alamat', 'Tolong tambahkan sendok dan tisu ekstra.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('prasmanan-paket-gold'::text, 120)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Selesai', current_date - 7 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('prasmanan-paket-gold'::text, 120)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-10';

-- ASR-DEMO-11 · Rina Kusumawati
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-11', 'Rina Kusumawati', '0812-9087-1122',
  'Kantor Dinas Pendidikan, Jl. Radjiman No. 6, Bandung',
  current_date - 3, '07:30',
  'Ambil di Tempat', 'Ada 3 porsi tanpa daging, untuk tamu vegetarian.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('nasi-box-nila-bakar'::text, 35),
    ('gudeg-nangka', 35)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Selesai', current_date - 6 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('nasi-box-nila-bakar'::text, 35),
  ('gudeg-nangka', 35)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-11';

-- ASR-DEMO-12 · Hendra Saputra
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-12', 'Hendra Saputra', '0857-3311-2098',
  'Jl. Cigadung Raya Timur No. 14, Bandung',
  current_date - 2, '09:00',
  'Antar ke Alamat', '',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('tumpeng-komplit-nampan'::text, 1)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Selesai', current_date - 5 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('tumpeng-komplit-nampan'::text, 1)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-12';

-- ASR-DEMO-13 · Dewi Anggraeni
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-13', 'Dewi Anggraeni', '0813-2277-8890',
  'Perum Griya Asri Blok C2 No. 8, Cimahi',
  current_date - 1, '11:00',
  'Antar ke Alamat', 'Pengantaran lewat pintu samping gedung.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('nasi-rames-komplit'::text, 55),
    ('snack-box-isi-3', 55)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Selesai', current_date - 4 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('nasi-rames-komplit'::text, 55),
  ('snack-box-isi-3', 55)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-13';

-- ASR-DEMO-14 · SMP Negeri 12
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-14', 'SMP Negeri 12', '022-7301-448',
  'Jl. Setiabudi No. 112, Bandung',
  current_date, '11:30',
  'Antar ke Alamat', '',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('nasi-box-ayam-bakar'::text, 18),
    ('tahu-tempe-bacem', 18)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Diproses', current_date - 3 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('nasi-box-ayam-bakar'::text, 18),
  ('tahu-tempe-bacem', 18)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-14';

-- ASR-DEMO-15 · Bapak Yusuf Maulana
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-15', 'Bapak Yusuf Maulana', '0878-5512-4433',
  'Jl. Cibaduyut Lama No. 45, Bandung',
  current_date, '15:00',
  'Antar ke Alamat', 'Tolong nasi jangan terlalu pedas.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('snack-box-isi-3'::text, 30)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Diproses', current_date - 3 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('snack-box-isi-3'::text, 30)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-15';

-- ASR-DEMO-16 · PT Sinar Mandiri
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-16', 'PT Sinar Mandiri', '0811-2299-3040',
  'Gedung Pasifik Lt. 3, Jl. Asia Afrika, Bandung',
  current_date, '07:30',
  'Ambil di Tempat', '',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('nasi-rames-hemat'::text, 70)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Diproses', current_date - 3 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('nasi-rames-hemat'::text, 70)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-16';

-- ASR-DEMO-17 · Ibu Siti Rahayu
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-17', 'Ibu Siti Rahayu', '0819-4455-6677',
  'Jl. Kopo Permai II No. 23, Bandung',
  current_date + 1, '09:00',
  'Antar ke Alamat', 'Mohon sambalnya dipisah ya.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('prasmanan-paket-silver'::text, 60)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Diproses', current_date - 2 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('prasmanan-paket-silver'::text, 60)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-17';

-- ASR-DEMO-18 · Panitia Pengajian RW 04
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-18', 'Panitia Pengajian RW 04', '0852-1188-7766',
  'Masjid Al-Ikhlas, Jl. Melati Raya, Bandung',
  current_date + 1, '11:00',
  'Antar ke Alamat', 'Tolong tambahkan sendok dan tisu ekstra.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('nasi-rames-komplit'::text, 40)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Menunggu Konfirmasi', current_date - 2 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('nasi-rames-komplit'::text, 40)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-18';

-- ASR-DEMO-19 · Klinik Sehat Bersama
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-19', 'Klinik Sehat Bersama', '0821-3344-5566',
  'Jl. Buah Batu No. 201, Bandung',
  current_date + 2, '11:30',
  'Antar ke Alamat', 'Ada 3 porsi tanpa daging, untuk tamu vegetarian.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('tumpeng-mini'::text, 2)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Diproses', current_date - 1 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('tumpeng-mini'::text, 2)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-19';

-- ASR-DEMO-20 · Bapak Agus Priyanto
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-20', 'Bapak Agus Priyanto', '0896-2211-9900',
  'Jl. Sukajadi No. 76, Bandung',
  current_date + 3, '15:00',
  'Antar ke Alamat', '',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('nasi-box-rendang-sapi'::text, 24),
    ('snack-box-premium', 24)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Menunggu Konfirmasi', current_date + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('nasi-box-rendang-sapi'::text, 24),
  ('snack-box-premium', 24)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-20';

-- ASR-DEMO-21 · Rina Kusumawati
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-21', 'Rina Kusumawati', '0812-9087-1122',
  'Kantor Dinas Pendidikan, Jl. Radjiman No. 6, Bandung',
  current_date + 4, '07:30',
  'Ambil di Tempat', 'Pengantaran lewat pintu samping gedung.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('nasi-rames-komplit'::text, 32)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Menunggu Konfirmasi', current_date + 1 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('nasi-rames-komplit'::text, 32)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-21';

-- ASR-DEMO-22 · Hendra Saputra
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-22', 'Hendra Saputra', '0857-3311-2098',
  'Jl. Cigadung Raya Timur No. 14, Bandung',
  current_date + 6, '09:00',
  'Antar ke Alamat', '',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('snack-box-premium'::text, 50)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Menunggu Konfirmasi', current_date + 3 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('snack-box-premium'::text, 50)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-22';

-- ASR-DEMO-23 · Dewi Anggraeni
insert into public.orders (
  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,
  metode, catatan, total, status, dibuat_pada)
select
  'ASR-DEMO-23', 'Dewi Anggraeni', '0813-2277-8890',
  'Perum Griya Asri Blok C2 No. 8, Cimahi',
  current_date + 8, '11:00',
  'Antar ke Alamat', 'Tolong nasi jangan terlalu pedas.',
  (select sum(m.harga_jual * v.qty)
   from (values
    ('nasi-rames-komplit'::text, 45)
   ) as v(slug, qty)
   join public.menus m on m.slug = v.slug),
  'Menunggu Konfirmasi', current_date + 5 + time '08:00';

insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
select o.id, m.id, m.nama, v.qty, m.harga_jual
from public.orders o
cross join (values
  ('nasi-rames-komplit'::text, 45)
) as v(slug, qty)
join public.menus m on m.slug = v.slug
where o.kode = 'ASR-DEMO-23';

-- -------------------------------------------------------- riwayat status
-- Trigger menulis satu baris saat pesanan dibuat. Baris itu dibuang lalu
-- diganti riwayat lengkap supaya tahapannya terlihat utuh di halaman lacak.
delete from public.order_status_history
where order_id in (select id from public.orders where kode like 'ASR-DEMO-%');

insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26),
  ('Selesai', 52)
) as v(status, jam)
where o.kode = 'ASR-DEMO-01';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26),
  ('Selesai', 52)
) as v(status, jam)
where o.kode = 'ASR-DEMO-02';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26),
  ('Selesai', 52)
) as v(status, jam)
where o.kode = 'ASR-DEMO-03';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26),
  ('Selesai', 52)
) as v(status, jam)
where o.kode = 'ASR-DEMO-04';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Dibatalkan', 20)
) as v(status, jam)
where o.kode = 'ASR-DEMO-05';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26),
  ('Selesai', 52)
) as v(status, jam)
where o.kode = 'ASR-DEMO-06';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26),
  ('Selesai', 52)
) as v(status, jam)
where o.kode = 'ASR-DEMO-07';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26),
  ('Selesai', 52)
) as v(status, jam)
where o.kode = 'ASR-DEMO-08';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26),
  ('Selesai', 52)
) as v(status, jam)
where o.kode = 'ASR-DEMO-09';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26),
  ('Selesai', 52)
) as v(status, jam)
where o.kode = 'ASR-DEMO-10';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26),
  ('Selesai', 52)
) as v(status, jam)
where o.kode = 'ASR-DEMO-11';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26),
  ('Selesai', 52)
) as v(status, jam)
where o.kode = 'ASR-DEMO-12';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26),
  ('Selesai', 52)
) as v(status, jam)
where o.kode = 'ASR-DEMO-13';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26)
) as v(status, jam)
where o.kode = 'ASR-DEMO-14';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26)
) as v(status, jam)
where o.kode = 'ASR-DEMO-15';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26)
) as v(status, jam)
where o.kode = 'ASR-DEMO-16';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26)
) as v(status, jam)
where o.kode = 'ASR-DEMO-17';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0)
) as v(status, jam)
where o.kode = 'ASR-DEMO-18';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0),
  ('Diproses', 26)
) as v(status, jam)
where o.kode = 'ASR-DEMO-19';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0)
) as v(status, jam)
where o.kode = 'ASR-DEMO-20';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0)
) as v(status, jam)
where o.kode = 'ASR-DEMO-21';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0)
) as v(status, jam)
where o.kode = 'ASR-DEMO-22';
insert into public.order_status_history (order_id, status, waktu)
select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)
from public.orders o
cross join (values
  ('Menunggu Konfirmasi'::text, 0)
) as v(status, jam)
where o.kode = 'ASR-DEMO-23';

-- ------------------------------------------------------------- snapshot HPP
-- Mengisi kolom hpp pada rincian pesanan memakai resep dan harga bahan saat
-- ini. Dipakai fungsi tutup_laporan_harian(); dasbor tetap menghitung sendiri.
update public.order_details d
set hpp = sub.hpp
from (
  select
    m.id as menu_id,
    round(
      (coalesce(sum(r.jumlah * i.harga_satuan), 0) + m.biaya_kemasan + m.biaya_tenaga_kerja)
      * (1 + (select overhead_persen from public.settings where id = 1) / 100),
      2) as hpp
  from public.menus m
  left join public.recipes r    on r.menu_id = m.id
  left join public.ingredients i on i.id = r.ingredient_id
  group by m.id, m.biaya_kemasan, m.biaya_tenaga_kerja
) sub
where d.menu_id = sub.menu_id
  and d.hpp is null;

-- ------------------------------------------------------------------ periksa
-- Angka yang diharapkan: 23 pesanan, 30 baris rincian.
-- 17 di antaranya berstatus Diproses/Selesai — hanya itu yang masuk laporan.

select 'pesanan' as tabel, count(*) as jumlah from public.orders where kode like 'ASR-DEMO-%'
union all
select 'rincian pesanan', count(*) from public.order_details d
  join public.orders o on o.id = d.order_id where o.kode like 'ASR-DEMO-%'
union all
select 'masuk laporan', count(*) from public.orders
  where kode like 'ASR-DEMO-%' and status in ('Diproses', 'Selesai');
