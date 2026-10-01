-- ===========================================================================
-- Asri Catering — 5 Pesanan Contoh yang Sudah Lunas (OPSIONAL)
--
-- Untuk menguji Dasbor, Laporan, HPP, margin, dan catatan AI tanpa harus
-- membayar lewat Midtrans. Kelima pesanan berstatus lunas, tersebar pada
-- enam hari terakhir sampai hari ini (dihitung dari current_date), lengkap
-- dengan rincian menu, histori transaksi, dan riwayat status.
--
-- Jalankan SETELAH 03-seed.sql dan 06-akun-pembayaran.sql. Aman diulang:
-- pesanan ASR-UJI-% lama dihapus lebih dulu.
--
-- Pesanan ditautkan ke akun vauzitriutomo5@gmail.com (bila ada) supaya juga
-- tampil di "Pesanan Saya". Ganti emailnya di bawah bila perlu.
--
-- Hapus sebelum dipakai usaha:
--   delete from public.orders where kode like 'ASR-UJI-%';
-- ===========================================================================

-- Pastikan menu yang dipakai ada; pesan galat lebih jelas daripada
-- "null value in column total".
do $$
declare
  hilang text;
begin
  select string_agg(s, ', ') into hilang
  from unnest(array['paket-bento-ayam-kremes', 'paket-nasi-kotak-acara-kantor', 'paket-nasi-kotak-rendang-vip', 'paket-nasi-kuning-bento-royal', 'prasmanan-paket-gold', 'snack-box-isi-3', 'snack-box-premium', 'tumpeng-komplit-nampan']) as s
  where not exists (select 1 from public.menus m where m.slug = s);
  if hilang is not null then
    raise exception 'Menu belum ada: %. Jalankan 03-seed.sql versi terbaru dulu.', hilang;
  end if;
end $$;

delete from public.orders where kode like 'ASR-UJI-%';

-- ASR-UJI-01 · Dinas Pendidikan Kota Bandung
with v(slug, qty) as (values
    ('paket-nasi-kotak-acara-kantor'::text, 80),
    ('snack-box-isi-3'::text, 80)
),
o as (
  insert into public.orders (
    kode, user_id, nama, telepon, email, alamat, tanggal_acara, waktu_antar, metode,
    catatan, total, status, status_bayar, metode_bayar, midtrans_order_id,
    dibayar_pada, dibuat_pada)
  select
    'ASR-UJI-01', (select id from auth.users where email = 'vauzitriutomo5@gmail.com'),
    'Dinas Pendidikan Kota Bandung', '0812-9087-1122', '', 'Jl. Ahmad Yani No. 239, Bandung', current_date - 6, '11:30', 'Antar ke Alamat',
    'Antar ke lobi, hubungi Bu Rina.',
    (select sum(m.harga_jual * v.qty) from v join public.menus m on m.slug = v.slug),
    'Selesai', 'Lunas', 'BCA Virtual Account', 'ASR-UJI-01-1',
    (current_date - 8 + time '09:21') at time zone 'Asia/Jakarta', (current_date - 8 + time '09:15') at time zone 'Asia/Jakarta'
  returning id, total, dibayar_pada
),
d as (
  insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
  select o.id, m.id, m.nama, v.qty, m.harga_jual
  from o cross join v join public.menus m on m.slug = v.slug
)
insert into public.payments (
  order_id, midtrans_order_id, transaction_id, status_transaksi, jenis_pembayaran,
  keterangan, jumlah, waktu_transaksi, waktu_lunas, mentah)
select o.id, 'ASR-UJI-01-1', 'contoh-asr-uji-01', 'settlement', 'BCA Virtual Account',
       '7012345678901', o.total, o.dibayar_pada - interval '6 minutes', o.dibayar_pada,
       jsonb_build_object('payment_type', 'bank_transfer', 'catatan', 'data contoh')
from o;

-- Riwayat status ASR-UJI-01: susun ulang supaya urut dari menunggu pembayaran.
delete from public.order_status_history
where order_id = (select id from public.orders where kode = 'ASR-UJI-01');
insert into public.order_status_history (order_id, status, waktu)
select o.id, s.status, s.waktu
from public.orders o
cross join (values
    ('Menunggu Pembayaran', (current_date - 8 + time '09:15') at time zone 'Asia/Jakarta'),
    ('Dibayar', (current_date - 8 + time '09:21') at time zone 'Asia/Jakarta'),
    ('Diproses', (current_date - 6 + time '06:00') at time zone 'Asia/Jakarta'),
    ('Dikirim', (current_date - 6 + time '11:30' - interval '45 minutes') at time zone 'Asia/Jakarta'),
    ('Selesai', (current_date - 6 + time '11:30' + interval '30 minutes') at time zone 'Asia/Jakarta')
) as s(status, waktu)
where o.kode = 'ASR-UJI-01';

-- ASR-UJI-02 · Keluarga Hendra Saputra
with v(slug, qty) as (values
    ('tumpeng-komplit-nampan'::text, 1),
    ('paket-nasi-kuning-bento-royal'::text, 40)
),
o as (
  insert into public.orders (
    kode, user_id, nama, telepon, email, alamat, tanggal_acara, waktu_antar, metode,
    catatan, total, status, status_bayar, metode_bayar, midtrans_order_id,
    dibayar_pada, dibuat_pada)
  select
    'ASR-UJI-02', (select id from auth.users where email = 'vauzitriutomo5@gmail.com'),
    'Keluarga Hendra Saputra', '0813-2201-7788', '', 'Jl. Sukajadi No. 112, Bandung', current_date - 4, '17:00', 'Antar ke Alamat',
    'Syukuran rumah baru.',
    (select sum(m.harga_jual * v.qty) from v join public.menus m on m.slug = v.slug),
    'Selesai', 'Lunas', 'QRIS', 'ASR-UJI-02-1',
    (current_date - 6 + time '09:21') at time zone 'Asia/Jakarta', (current_date - 6 + time '09:15') at time zone 'Asia/Jakarta'
  returning id, total, dibayar_pada
),
d as (
  insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
  select o.id, m.id, m.nama, v.qty, m.harga_jual
  from o cross join v join public.menus m on m.slug = v.slug
)
insert into public.payments (
  order_id, midtrans_order_id, transaction_id, status_transaksi, jenis_pembayaran,
  keterangan, jumlah, waktu_transaksi, waktu_lunas, mentah)
select o.id, 'ASR-UJI-02-1', 'contoh-asr-uji-02', 'settlement', 'QRIS',
       '', o.total, o.dibayar_pada - interval '6 minutes', o.dibayar_pada,
       jsonb_build_object('payment_type', 'qris', 'catatan', 'data contoh')
from o;

-- Riwayat status ASR-UJI-02: susun ulang supaya urut dari menunggu pembayaran.
delete from public.order_status_history
where order_id = (select id from public.orders where kode = 'ASR-UJI-02');
insert into public.order_status_history (order_id, status, waktu)
select o.id, s.status, s.waktu
from public.orders o
cross join (values
    ('Menunggu Pembayaran', (current_date - 6 + time '09:15') at time zone 'Asia/Jakarta'),
    ('Dibayar', (current_date - 6 + time '09:21') at time zone 'Asia/Jakarta'),
    ('Diproses', (current_date - 4 + time '06:00') at time zone 'Asia/Jakarta'),
    ('Dikirim', (current_date - 4 + time '17:00' - interval '45 minutes') at time zone 'Asia/Jakarta'),
    ('Selesai', (current_date - 4 + time '17:00' + interval '30 minutes') at time zone 'Asia/Jakarta')
) as s(status, waktu)
where o.kode = 'ASR-UJI-02';

-- ASR-UJI-03 · PT Sinar Mandiri Abadi
with v(slug, qty) as (values
    ('paket-nasi-kotak-rendang-vip'::text, 60),
    ('snack-box-premium'::text, 60)
),
o as (
  insert into public.orders (
    kode, user_id, nama, telepon, email, alamat, tanggal_acara, waktu_antar, metode,
    catatan, total, status, status_bayar, metode_bayar, midtrans_order_id,
    dibayar_pada, dibuat_pada)
  select
    'ASR-UJI-03', (select id from auth.users where email = 'vauzitriutomo5@gmail.com'),
    'PT Sinar Mandiri Abadi', '0811-2299-3040', '', 'Gedung Pasifik Lt. 3, Jl. Asia Afrika No. 8, Bandung', current_date - 2, '11:30', 'Antar ke Alamat',
    '',
    (select sum(m.harga_jual * v.qty) from v join public.menus m on m.slug = v.slug),
    'Selesai', 'Lunas', 'Mandiri Bill Payment', 'ASR-UJI-03-1',
    (current_date - 4 + time '09:21') at time zone 'Asia/Jakarta', (current_date - 4 + time '09:15') at time zone 'Asia/Jakarta'
  returning id, total, dibayar_pada
),
d as (
  insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
  select o.id, m.id, m.nama, v.qty, m.harga_jual
  from o cross join v join public.menus m on m.slug = v.slug
)
insert into public.payments (
  order_id, midtrans_order_id, transaction_id, status_transaksi, jenis_pembayaran,
  keterangan, jumlah, waktu_transaksi, waktu_lunas, mentah)
select o.id, 'ASR-UJI-03-1', 'contoh-asr-uji-03', 'settlement', 'Mandiri Bill Payment',
       '88908-123456789', o.total, o.dibayar_pada - interval '6 minutes', o.dibayar_pada,
       jsonb_build_object('payment_type', 'echannel', 'catatan', 'data contoh')
from o;

-- Riwayat status ASR-UJI-03: susun ulang supaya urut dari menunggu pembayaran.
delete from public.order_status_history
where order_id = (select id from public.orders where kode = 'ASR-UJI-03');
insert into public.order_status_history (order_id, status, waktu)
select o.id, s.status, s.waktu
from public.orders o
cross join (values
    ('Menunggu Pembayaran', (current_date - 4 + time '09:15') at time zone 'Asia/Jakarta'),
    ('Dibayar', (current_date - 4 + time '09:21') at time zone 'Asia/Jakarta'),
    ('Diproses', (current_date - 2 + time '06:00') at time zone 'Asia/Jakarta'),
    ('Dikirim', (current_date - 2 + time '11:30' - interval '45 minutes') at time zone 'Asia/Jakarta'),
    ('Selesai', (current_date - 2 + time '11:30' + interval '30 minutes') at time zone 'Asia/Jakarta')
) as s(status, waktu)
where o.kode = 'ASR-UJI-03';

-- ASR-UJI-04 · Rina Kusumawati
with v(slug, qty) as (values
    ('paket-bento-ayam-kremes'::text, 35)
),
o as (
  insert into public.orders (
    kode, user_id, nama, telepon, email, alamat, tanggal_acara, waktu_antar, metode,
    catatan, total, status, status_bayar, metode_bayar, midtrans_order_id,
    dibayar_pada, dibuat_pada)
  select
    'ASR-UJI-04', (select id from auth.users where email = 'vauzitriutomo5@gmail.com'),
    'Rina Kusumawati', '0812-7766-5544', '', 'Ambil di dapur Asri Catering', current_date - 1, '09:00', 'Ambil di Tempat',
    'Diambil jam 9 pagi.',
    (select sum(m.harga_jual * v.qty) from v join public.menus m on m.slug = v.slug),
    'Selesai', 'Lunas', 'GoPay', 'ASR-UJI-04-1',
    (current_date - 3 + time '09:21') at time zone 'Asia/Jakarta', (current_date - 3 + time '09:15') at time zone 'Asia/Jakarta'
  returning id, total, dibayar_pada
),
d as (
  insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
  select o.id, m.id, m.nama, v.qty, m.harga_jual
  from o cross join v join public.menus m on m.slug = v.slug
)
insert into public.payments (
  order_id, midtrans_order_id, transaction_id, status_transaksi, jenis_pembayaran,
  keterangan, jumlah, waktu_transaksi, waktu_lunas, mentah)
select o.id, 'ASR-UJI-04-1', 'contoh-asr-uji-04', 'settlement', 'GoPay',
       '', o.total, o.dibayar_pada - interval '6 minutes', o.dibayar_pada,
       jsonb_build_object('payment_type', 'gopay', 'catatan', 'data contoh')
from o;

-- Riwayat status ASR-UJI-04: susun ulang supaya urut dari menunggu pembayaran.
delete from public.order_status_history
where order_id = (select id from public.orders where kode = 'ASR-UJI-04');
insert into public.order_status_history (order_id, status, waktu)
select o.id, s.status, s.waktu
from public.orders o
cross join (values
    ('Menunggu Pembayaran', (current_date - 3 + time '09:15') at time zone 'Asia/Jakarta'),
    ('Dibayar', (current_date - 3 + time '09:21') at time zone 'Asia/Jakarta'),
    ('Diproses', (current_date - 1 + time '06:00') at time zone 'Asia/Jakarta'),
    ('Dikirim', (current_date - 1 + time '09:00' - interval '45 minutes') at time zone 'Asia/Jakarta'),
    ('Selesai', (current_date - 1 + time '09:00' + interval '30 minutes') at time zone 'Asia/Jakarta')
) as s(status, waktu)
where o.kode = 'ASR-UJI-04';

-- ASR-UJI-05 · SMA Negeri 3 Bandung
with v(slug, qty) as (values
    ('prasmanan-paket-gold'::text, 100)
),
o as (
  insert into public.orders (
    kode, user_id, nama, telepon, email, alamat, tanggal_acara, waktu_antar, metode,
    catatan, total, status, status_bayar, metode_bayar, midtrans_order_id,
    dibayar_pada, dibuat_pada)
  select
    'ASR-UJI-05', (select id from auth.users where email = 'vauzitriutomo5@gmail.com'),
    'SMA Negeri 3 Bandung', '0821-4455-6677', '', 'Jl. Belitung No. 8, Bandung', current_date, '12:00', 'Antar ke Alamat',
    'Untuk rapat komite sekolah.',
    (select sum(m.harga_jual * v.qty) from v join public.menus m on m.slug = v.slug),
    'Dikirim', 'Lunas', 'BRI Virtual Account', 'ASR-UJI-05-1',
    (current_date - 2 + time '09:21') at time zone 'Asia/Jakarta', (current_date - 2 + time '09:15') at time zone 'Asia/Jakarta'
  returning id, total, dibayar_pada
),
d as (
  insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)
  select o.id, m.id, m.nama, v.qty, m.harga_jual
  from o cross join v join public.menus m on m.slug = v.slug
)
insert into public.payments (
  order_id, midtrans_order_id, transaction_id, status_transaksi, jenis_pembayaran,
  keterangan, jumlah, waktu_transaksi, waktu_lunas, mentah)
select o.id, 'ASR-UJI-05-1', 'contoh-asr-uji-05', 'settlement', 'BRI Virtual Account',
       '8880123456789012', o.total, o.dibayar_pada - interval '6 minutes', o.dibayar_pada,
       jsonb_build_object('payment_type', 'bank_transfer', 'catatan', 'data contoh')
from o;

-- Riwayat status ASR-UJI-05: susun ulang supaya urut dari menunggu pembayaran.
delete from public.order_status_history
where order_id = (select id from public.orders where kode = 'ASR-UJI-05');
insert into public.order_status_history (order_id, status, waktu)
select o.id, s.status, s.waktu
from public.orders o
cross join (values
    ('Menunggu Pembayaran', (current_date - 2 + time '09:15') at time zone 'Asia/Jakarta'),
    ('Dibayar', (current_date - 2 + time '09:21') at time zone 'Asia/Jakarta'),
    ('Diproses', (current_date + time '06:00') at time zone 'Asia/Jakarta'),
    ('Dikirim', (current_date + time '12:00' - interval '45 minutes') at time zone 'Asia/Jakarta')
) as s(status, waktu)
where o.kode = 'ASR-UJI-05';

-- Pemeriksa: harus 5 pesanan lunas dan 5 baris transaksi.
select o.kode, o.tanggal_acara, o.status, o.status_bayar, o.total,
       (select count(*) from public.order_details d where d.order_id = o.id) as baris_menu,
       (select count(*) from public.payments p where p.order_id = o.id)     as transaksi
from public.orders o
where o.kode like 'ASR-UJI-%'
order by o.tanggal_acara;
