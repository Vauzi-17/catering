-- ===========================================================================
-- Asri Catering — Akun pelanggan, pembayaran Midtrans, dan keamanan produksi
--
-- Jalankan SETELAH 01-schema.sql dan 03-seed.sql. Berkas ini MENGGANTIKAN
-- seluruh policy pada 02-rls.sql dan 04-rls-produksi.sql, jadi keduanya tidak
-- perlu (dan tidak boleh) dijalankan lagi sesudahnya.
--
-- Isi:
--   1. Tabel profiles untuk pelanggan (nama, telepon, alamat, titik peta)
--   2. Kolom baru pada orders: pemilik akun, lokasi, status pembayaran
--   3. Status pesanan baru: Menunggu Pembayaran, Dibayar, Dikirim
--   4. Tabel payments: histori setiap notifikasi transaksi dari Midtrans
--   5. Titik dapur dan radius layanan pada settings
--   6. Row Level Security tahap produksi (pelanggan + admin)
--
-- Aman dijalankan ulang.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Profil pelanggan
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nama        text          not null default '',
  telepon     text          not null default '',
  alamat      text          not null default '',
  patokan     text          not null default '',
  lat         numeric(9,6),
  lng         numeric(9,6),
  dibuat_pada timestamptz   not null default now(),
  diubah_pada timestamptz   not null default now()
);
alter table public.profiles enable row level security;

-- Profil dibuat otomatis saat akun didaftarkan. Nama dan telepon diambil dari
-- data yang dikirim formulir pendaftaran (options.data pada signUp).
create or replace function public.buat_profil_baru()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nama, telepon)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nama', ''),
    coalesce(new.raw_user_meta_data ->> 'telepon', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists auth_user_profil_trigger on auth.users;
create trigger auth_user_profil_trigger
  after insert on auth.users
  for each row execute function public.buat_profil_baru();

-- Akun yang sudah ada sebelum berkas ini dijalankan ikut dibuatkan profil.
insert into public.profiles (id, nama, telepon)
select u.id,
       coalesce(u.raw_user_meta_data ->> 'nama', ''),
       coalesce(u.raw_user_meta_data ->> 'telepon', '')
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2 & 3. Pesanan: pemilik akun, lokasi, pembayaran, status baru
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists user_id           uuid references auth.users (id) on delete set null,
  add column if not exists patokan           text          not null default '',
  add column if not exists lat               numeric(9,6),
  add column if not exists lng               numeric(9,6),
  add column if not exists email             text          not null default '',
  add column if not exists status_bayar      text,
  add column if not exists metode_bayar      text          not null default '',
  add column if not exists midtrans_order_id text,
  add column if not exists snap_token        text,
  add column if not exists snap_redirect_url text,
  add column if not exists batas_bayar       timestamptz,
  add column if not exists dibayar_pada      timestamptz;

create unique index if not exists orders_midtrans_order_id_key
  on public.orders (midtrans_order_id) where midtrans_order_id is not null;
create index if not exists orders_user_idx on public.orders (user_id, dibuat_pada desc);

-- status_bayar null berarti pesanan lama/manual (sebelum pembayaran online).
alter table public.orders drop constraint if exists orders_status_bayar_check;
alter table public.orders add constraint orders_status_bayar_check
  check (status_bayar is null
         or status_bayar in ('Menunggu', 'Lunas', 'Kedaluwarsa', 'Gagal', 'Dikembalikan'));

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in (
    'Menunggu Pembayaran',  -- pesanan online dibuat, belum dibayar
    'Menunggu Konfirmasi',  -- pesanan lama/manual
    'Dibayar',              -- pembayaran diterima otomatis dari Midtrans
    'Diproses',             -- sedang dimasak
    'Dikirim',              -- dalam perjalanan
    'Selesai',
    'Dibatalkan'
  ));

-- Riwayat status ditulis oleh trigger. Dijalankan dengan hak pemilik fungsi
-- supaya perubahan status oleh admin maupun webhook tidak tertahan RLS pada
-- tabel order_status_history.
create or replace function public.catat_status_pesanan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_history (order_id, status, waktu)
    values (new.id, new.status, coalesce(new.dibuat_pada, now()));
  elsif new.status is distinct from old.status then
    insert into public.order_status_history (order_id, status)
    values (new.id, new.status);
    new.diubah_pada := now();
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Histori transaksi pembayaran
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid          references public.orders (id) on delete cascade,
  midtrans_order_id  text          not null,
  transaction_id     text,
  status_transaksi   text          not null,
  status_fraud       text,
  jenis_pembayaran   text          not null default '',
  keterangan         text          not null default '',
  jumlah             numeric(12,2) not null default 0,
  waktu_transaksi    timestamptz,
  waktu_lunas        timestamptz,
  mentah             jsonb         not null default '{}'::jsonb,
  dibuat_pada        timestamptz   not null default now()
);
alter table public.payments enable row level security;

-- Notifikasi yang sama bisa dikirim ulang oleh Midtrans; cukup dicatat sekali.
-- Index penuh (bukan bersyarat) supaya bisa dipakai upsert dari aplikasi;
-- baris dengan transaction_id kosong tetap boleh lebih dari satu karena
-- NULL selalu dianggap berbeda.
drop index if exists public.payments_transaksi_status_key;
create unique index payments_transaksi_status_key
  on public.payments (transaction_id, status_transaksi);
create index if not exists payments_order_idx on public.payments (order_id, dibuat_pada desc);

-- ---------------------------------------------------------------------------
-- 5. Titik dapur dan radius layanan
-- ---------------------------------------------------------------------------
alter table public.settings
  add column if not exists dapur_lat numeric(9,6) not null default -6.917464,
  add column if not exists dapur_lng numeric(9,6) not null default 107.619123,
  add column if not exists radius_km numeric(5,1) not null default 25;

-- Info pengantaran untuk peta pelanggan. Kolom settings lain (overhead,
-- target margin) tetap tertutup untuk umum.
create or replace function public.info_pengantaran()
returns table (dapur_lat numeric, dapur_lng numeric, radius_km numeric)
language sql
stable
security definer
set search_path = public
as $$
  select s.dapur_lat, s.dapur_lng, s.radius_km from public.settings s where s.id = 1;
$$;

revoke all on function public.info_pengantaran() from public;
grant execute on function public.info_pengantaran() to anon, authenticated;

-- Laporan harian ikut menghitung pesanan yang sudah dibayar dan dikirim.
create or replace function public.tutup_laporan_harian(p_tanggal date)
returns void
language sql
as $$
  insert into public.daily_reports
    (tanggal, jumlah_pesanan, jumlah_porsi, pendapatan, hpp, laba, margin)
  select
    p_tanggal,
    count(distinct o.id),
    coalesce(sum(d.qty), 0),
    coalesce(sum(d.harga * d.qty), 0),
    coalesce(sum(coalesce(d.hpp, 0) * d.qty), 0),
    coalesce(sum(d.harga * d.qty), 0) - coalesce(sum(coalesce(d.hpp, 0) * d.qty), 0),
    case
      when coalesce(sum(d.harga * d.qty), 0) > 0
      then round(
        (coalesce(sum(d.harga * d.qty), 0) - coalesce(sum(coalesce(d.hpp, 0) * d.qty), 0))
        / sum(d.harga * d.qty) * 100, 2)
      else 0
    end
  from public.orders o
  join public.order_details d on d.order_id = o.id
  where o.tanggal_acara = p_tanggal
    and o.status in ('Dibayar', 'Diproses', 'Dikirim', 'Selesai')
  on conflict (tanggal) do update set
    jumlah_pesanan = excluded.jumlah_pesanan,
    jumlah_porsi   = excluded.jumlah_porsi,
    pendapatan     = excluded.pendapatan,
    hpp            = excluded.hpp,
    laba           = excluded.laba,
    margin         = excluded.margin,
    dibuat_pada    = now();
$$;

-- ---------------------------------------------------------------------------
-- 6. Row Level Security tahap produksi
--
-- Pesanan dan pembayaran TIDAK bisa ditulis langsung dari browser. Keduanya
-- dibuat oleh server (route handler Next.js memakai service role key) supaya
-- harga dihitung ulang dari tabel menus dan tidak bisa diubah pelanggan.
-- ---------------------------------------------------------------------------
alter table public.users                enable row level security;
alter table public.profiles             enable row level security;
alter table public.categories           enable row level security;
alter table public.ingredients          enable row level security;
alter table public.menus                enable row level security;
alter table public.recipes              enable row level security;
alter table public.orders               enable row level security;
alter table public.order_details        enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments             enable row level security;
alter table public.settings             enable row level security;
alter table public.daily_reports        enable row level security;

do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I',
                   r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- Pelacakan tamu lewat kode tidak dipakai lagi: pesanan kini milik akun.
drop function if exists public.lacak_pesanan(text);

-- Katalog publik
create policy "kategori dibaca publik"
  on public.categories for select using (true);

create policy "menu tersedia dibaca publik"
  on public.menus for select using (tersedia or public.adalah_admin());

-- Profil: pelanggan hanya melihat dan mengubah miliknya sendiri
create policy "profil milik sendiri dibaca"
  on public.profiles for select using (id = auth.uid() or public.adalah_admin());

create policy "profil milik sendiri diubah"
  on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Pesanan: pelanggan membaca miliknya, admin membaca semua
create policy "pesanan dibaca pemilik atau admin"
  on public.orders for select
  using (user_id = auth.uid() or public.adalah_admin());

create policy "rincian dibaca pemilik atau admin"
  on public.order_details for select
  using (
    public.adalah_admin()
    or exists (select 1 from public.orders o
               where o.id = order_id and o.user_id = auth.uid())
  );

create policy "riwayat dibaca pemilik atau admin"
  on public.order_status_history for select
  using (
    public.adalah_admin()
    or exists (select 1 from public.orders o
               where o.id = order_id and o.user_id = auth.uid())
  );

create policy "pembayaran dibaca pemilik atau admin"
  on public.payments for select
  using (
    public.adalah_admin()
    or exists (select 1 from public.orders o
               where o.id = order_id and o.user_id = auth.uid())
  );

-- Rahasia dapur — hanya admin
create policy "bahan hanya admin"
  on public.ingredients for select using (public.adalah_admin());

create policy "resep hanya admin"
  on public.recipes for select using (public.adalah_admin());

create policy "pengaturan hanya admin"
  on public.settings for select using (public.adalah_admin());

create policy "laporan hanya admin"
  on public.daily_reports for select using (public.adalah_admin());

-- Hak tulis admin
create policy "admin kelola kategori"
  on public.categories for all
  using (public.adalah_admin()) with check (public.adalah_admin());

create policy "admin kelola menu"
  on public.menus for all
  using (public.adalah_admin()) with check (public.adalah_admin());

create policy "admin kelola bahan"
  on public.ingredients for all
  using (public.adalah_admin()) with check (public.adalah_admin());

create policy "admin kelola resep"
  on public.recipes for all
  using (public.adalah_admin()) with check (public.adalah_admin());

create policy "admin ubah pesanan"
  on public.orders for update
  using (public.adalah_admin()) with check (public.adalah_admin());

create policy "admin hapus pesanan"
  on public.orders for delete using (public.adalah_admin());

create policy "admin kelola pengaturan"
  on public.settings for all
  using (public.adalah_admin()) with check (public.adalah_admin());

create policy "admin kelola laporan"
  on public.daily_reports for all
  using (public.adalah_admin()) with check (public.adalah_admin());

create policy "admin melihat daftar admin"
  on public.users for select using (public.adalah_admin() or id = auth.uid());

-- ---------------------------------------------------------------------------
-- Menjadikan sebuah akun sebagai admin (jalankan sekali, ganti emailnya):
--
--   insert into public.users (id, nama, peran)
--   select id, 'Ibu Asri Wulandari', 'pemilik'
--   from auth.users where email = 'email-admin@contoh.com'
--   on conflict (id) do nothing;
-- ---------------------------------------------------------------------------
