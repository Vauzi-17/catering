-- ===========================================================================
-- Asri Catering — Skema Basis Data (Supabase / PostgreSQL)
--
-- Cara menjalankan:
--   Supabase Dashboard > SQL Editor > New query > tempel isi berkas ini > Run
--
-- Urutan berkas:
--   01-schema.sql   <- struktur tabel (berkas ini)
--   02-rls.sql      <- keamanan baris (Row Level Security)
--   03-seed.sql     <- data contoh: kategori, bahan baku, menu, resep
-- ===========================================================================

-- Dipakai untuk gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users — data admin. Baris di sini terhubung ke akun Supabase Auth.
-- Selama login masih memakai mode demo, tabel ini boleh dibiarkan kosong.
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  nama        text        not null,
  peran       text        not null default 'admin' check (peran in ('admin', 'pemilik')),
  dibuat_pada timestamptz not null default now()
);

comment on table public.users is 'Admin yang boleh mengelola data. id mengikuti auth.users.';

-- ---------------------------------------------------------------------------
-- categories — kategori menu (Nasi Box, Prasmanan, Tumpeng, ...)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  nama        text        not null unique,
  urutan      integer     not null default 0,
  dibuat_pada timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ingredients — bahan baku beserta satuan, harga satuan, dan stok
-- ---------------------------------------------------------------------------
create table if not exists public.ingredients (
  id            uuid primary key default gen_random_uuid(),
  nama          text          not null unique,
  satuan        text          not null
                check (satuan in ('kg', 'liter', 'butir', 'pcs', 'ikat', 'pack')),
  harga_satuan  numeric(12,2) not null check (harga_satuan >= 0),
  kategori      text          not null
                check (kategori in ('Bahan Pokok', 'Protein', 'Sayuran', 'Bumbu', 'Kemasan')),
  stok          numeric(12,3) not null default 0 check (stok >= 0),
  stok_minimum  numeric(12,3) not null default 0 check (stok_minimum >= 0),
  dibuat_pada   timestamptz   not null default now(),
  diubah_pada   timestamptz   not null default now()
);

create index if not exists ingredients_kategori_idx on public.ingredients (kategori);

comment on column public.ingredients.harga_satuan is
  'Harga per 1 satuan. Menjadi dasar perhitungan HPP seluruh menu.';

-- ---------------------------------------------------------------------------
-- menus — data menu yang dijual
-- ---------------------------------------------------------------------------
create table if not exists public.menus (
  id                 uuid primary key default gen_random_uuid(),
  category_id        uuid          references public.categories (id) on delete set null,
  slug               text          not null unique,
  nama               text          not null,
  deskripsi          text          not null default '',
  deskripsi_panjang  text          not null default '',
  harga_jual         numeric(12,2) not null check (harga_jual >= 0),
  satuan_jual        text          not null default 'per porsi',
  foto               text          not null default '',
  isi                text[]        not null default '{}',
  populer            boolean       not null default false,
  tersedia           boolean       not null default true,
  minimal_pesan      integer       not null default 1 check (minimal_pesan >= 1),
  biaya_kemasan      numeric(12,2) not null default 0 check (biaya_kemasan >= 0),
  biaya_tenaga_kerja numeric(12,2) not null default 0 check (biaya_tenaga_kerja >= 0),
  dibuat_pada        timestamptz   not null default now(),
  diubah_pada        timestamptz   not null default now()
);

create index if not exists menus_category_idx  on public.menus (category_id);
create index if not exists menus_tersedia_idx  on public.menus (tersedia);

comment on column public.menus.foto is
  'Path foto, contoh /images/menu/nasi-rames-komplit.jpg. Kosong = tampil kotak placeholder.';

-- ---------------------------------------------------------------------------
-- recipes — relasi menu dengan bahan baku beserta takarannya
-- ---------------------------------------------------------------------------
create table if not exists public.recipes (
  id            uuid primary key default gen_random_uuid(),
  menu_id       uuid          not null references public.menus (id)       on delete cascade,
  ingredient_id uuid          not null references public.ingredients (id) on delete restrict,
  jumlah        numeric(12,4) not null check (jumlah > 0),
  unique (menu_id, ingredient_id)
);

create index if not exists recipes_menu_idx on public.recipes (menu_id);

comment on table public.recipes is
  'Jumlah dinyatakan dalam satuan bahan. Contoh: beras 0.15 kg untuk satu porsi.';

-- ---------------------------------------------------------------------------
-- orders — pesanan pelanggan
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  kode          text          not null unique,
  nama          text          not null,
  telepon       text          not null,
  alamat        text          not null default '',
  tanggal_acara date          not null,
  waktu_antar   text          not null default '11:00',
  metode        text          not null default 'Antar ke Alamat'
                check (metode in ('Antar ke Alamat', 'Ambil di Tempat')),
  catatan       text          not null default '',
  total         numeric(12,2) not null check (total >= 0),
  status        text          not null default 'Menunggu Konfirmasi'
                check (status in ('Menunggu Konfirmasi', 'Diproses', 'Selesai', 'Dibatalkan')),
  dibuat_pada   timestamptz   not null default now(),
  diubah_pada   timestamptz   not null default now()
);

create index if not exists orders_tanggal_idx on public.orders (tanggal_acara desc);
create index if not exists orders_status_idx  on public.orders (status);

-- ---------------------------------------------------------------------------
-- order_details — rincian menu pada satu pesanan.
-- nama_menu dan harga sengaja disalin (snapshot) supaya nota lama tidak ikut
-- berubah ketika harga menu dinaikkan di kemudian hari.
-- ---------------------------------------------------------------------------
create table if not exists public.order_details (
  id        uuid primary key default gen_random_uuid(),
  order_id  uuid          not null references public.orders (id) on delete cascade,
  menu_id   uuid          references public.menus (id) on delete set null,
  nama_menu text          not null,
  qty       integer       not null check (qty > 0),
  harga     numeric(12,2) not null check (harga >= 0),
  hpp       numeric(12,2)
);

create index if not exists order_details_order_idx on public.order_details (order_id);

comment on column public.order_details.hpp is
  'HPP per porsi saat pesanan dibuat. Diisi opsional untuk arsip laporan.';

-- ---------------------------------------------------------------------------
-- order_status_history — jejak perubahan status, dipakai halaman lacak pesanan
-- ---------------------------------------------------------------------------
create table if not exists public.order_status_history (
  id        uuid primary key default gen_random_uuid(),
  order_id  uuid        not null references public.orders (id) on delete cascade,
  status    text        not null,
  waktu     timestamptz not null default now()
);

create index if not exists order_status_history_order_idx
  on public.order_status_history (order_id, waktu);

-- ---------------------------------------------------------------------------
-- settings — satu baris berisi asumsi perhitungan milik usaha
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  id                        integer primary key default 1 check (id = 1),
  overhead_persen           numeric(5,2)  not null default 8,
  target_margin             numeric(5,2)  not null default 30,
  biaya_operasional_harian  numeric(12,2) not null default 150000,
  diubah_pada               timestamptz   not null default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- daily_reports — arsip rekap harian.
-- Dasbor tetap menghitung laporan langsung dari orders supaya selalu mutakhir;
-- tabel ini dipakai untuk menyimpan rekap yang sudah ditutup.
-- ---------------------------------------------------------------------------
create table if not exists public.daily_reports (
  tanggal       date primary key,
  jumlah_pesanan integer       not null default 0,
  jumlah_porsi   integer       not null default 0,
  pendapatan     numeric(14,2) not null default 0,
  hpp            numeric(14,2) not null default 0,
  laba           numeric(14,2) not null default 0,
  margin         numeric(6,2)  not null default 0,
  dibuat_pada    timestamptz   not null default now()
);

-- ===========================================================================
-- Fungsi bantu
-- ===========================================================================

-- Nomor urut pesanan harian, dipakai untuk membentuk kode ASR-YYMMDD-NNN
create sequence if not exists public.order_code_seq;

create or replace function public.buat_kode_pesanan()
returns trigger
language plpgsql
as $$
begin
  if new.kode is null or new.kode = '' then
    new.kode :=
      'ASR-'
      || to_char(coalesce(new.tanggal_acara, current_date), 'YYMMDD')
      || '-'
      || lpad((nextval('public.order_code_seq') % 1000)::text, 3, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists orders_kode_trigger on public.orders;
create trigger orders_kode_trigger
  before insert on public.orders
  for each row execute function public.buat_kode_pesanan();

-- Catat setiap perubahan status ke order_status_history
create or replace function public.catat_status_pesanan()
returns trigger
language plpgsql
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

drop trigger if exists orders_status_insert_trigger on public.orders;
create trigger orders_status_insert_trigger
  after insert on public.orders
  for each row execute function public.catat_status_pesanan();

drop trigger if exists orders_status_update_trigger on public.orders;
create trigger orders_status_update_trigger
  before update on public.orders
  for each row execute function public.catat_status_pesanan();

-- Penanda apakah pengguna yang sedang login terdaftar sebagai admin.
-- Dipakai oleh policy pada 02-rls.sql.
create or replace function public.adalah_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.users where id = auth.uid());
$$;

-- Menutup rekap satu tanggal ke daily_reports.
-- Panggil dari SQL Editor atau jadwalkan dengan pg_cron:
--   select public.tutup_laporan_harian(current_date - 1);
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
    and o.status in ('Diproses', 'Selesai')
  on conflict (tanggal) do update set
    jumlah_pesanan = excluded.jumlah_pesanan,
    jumlah_porsi   = excluded.jumlah_porsi,
    pendapatan     = excluded.pendapatan,
    hpp            = excluded.hpp,
    laba           = excluded.laba,
    margin         = excluded.margin,
    dibuat_pada    = now();
$$;
