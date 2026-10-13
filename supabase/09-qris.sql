-- ===========================================================================
-- Asri Catering — Pembayaran QRIS langsung (tanpa payment gateway)
--
-- Jalankan SETELAH 06-akun-pembayaran.sql. Aman dijalankan ulang.
--
-- Cara kerja:
--   1. Admin menyimpan QRIS statis milik usaha (dari GoBiz / bank) di
--      settings.qris_statis.
--   2. Setiap pesanan mendapat nominal unik = total + kode unik (1–999),
--      dan QRIS bernominal yang dibuat server dari QRIS statis tadi.
--   3. Aplikasi di HP pemilik meneruskan notifikasi "pembayaran diterima"
--      ke /api/qris/notifikasi/. Server mencocokkan nominalnya dengan
--      tagihan yang menunggu, lalu menandai pesanan lunas.
--   4. Notifikasi yang tidak cocok dicatat di qris_notifikasi supaya admin
--      bisa memeriksanya, dan admin selalu bisa mengonfirmasi manual.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. QRIS statis toko — hanya admin yang bisa membaca (policy settings 06)
-- ---------------------------------------------------------------------------
alter table public.settings
  add column if not exists qris_statis text not null default '';

-- ---------------------------------------------------------------------------
-- 2. Tagihan QRIS pada pesanan
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists kode_unik           integer,
  add column if not exists nominal_bayar       numeric(12,2),
  add column if not exists qris_dinamis        text,
  add column if not exists diklaim_bayar_pada  timestamptz;

alter table public.orders drop constraint if exists orders_kode_unik_check;
alter table public.orders add constraint orders_kode_unik_check
  check (kode_unik is null or kode_unik between 1 and 999);

-- Dua tagihan yang sedang menunggu tidak boleh punya nominal yang sama,
-- karena nominal itulah satu-satunya penanda pembayaran di notifikasi.
create unique index if not exists orders_nominal_menunggu_key
  on public.orders (nominal_bayar)
  where status_bayar = 'Menunggu' and nominal_bayar is not null;
create index if not exists orders_nominal_idx on public.orders (nominal_bayar);

-- Histori pembayaran sekarang juga untuk QRIS; kolom Midtrans boleh kosong.
alter table public.payments alter column midtrans_order_id drop not null;

-- ---------------------------------------------------------------------------
-- 3. Log notifikasi pembayaran yang diteruskan dari HP pemilik
-- ---------------------------------------------------------------------------
create table if not exists public.qris_notifikasi (
  id             uuid primary key default gen_random_uuid(),
  sidik          text          not null unique,   -- penangkal kiriman ganda
  teks           text          not null,
  aplikasi       text          not null default '',
  nominal        numeric(12,2),
  order_id       uuid          references public.orders (id) on delete set null,
  hasil          text          not null
                 check (hasil in ('cocok', 'ganda', 'tidak_cocok', 'tanpa_nominal')),
  diterima_pada  timestamptz   not null default now()
);
create index if not exists qris_notifikasi_waktu_idx on public.qris_notifikasi (diterima_pada desc);
alter table public.qris_notifikasi enable row level security;

drop policy if exists "admin membaca notifikasi qris" on public.qris_notifikasi;
create policy "admin membaca notifikasi qris"
  on public.qris_notifikasi for select using (public.adalah_admin());
-- Penulisan hanya lewat server (service role), tidak ada policy tulis.

-- ---------------------------------------------------------------------------
-- 4. Tagihan kedaluwarsa
-- ---------------------------------------------------------------------------
-- Tanpa gateway tidak ada yang mengabari bahwa tagihan habis waktu, jadi
-- fungsi ini dipanggil sebelum pesanan dibaca atau dicocokkan. Aman dipanggil
-- siapa saja: ia hanya menutup tagihan yang batas waktunya memang lewat.
create or replace function public.kedaluwarsakan_tagihan()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  jumlah integer;
begin
  update public.orders
     set status_bayar = 'Kedaluwarsa',
         status = case when status = 'Menunggu Pembayaran' then 'Dibatalkan' else status end
   where status_bayar = 'Menunggu'
     and batas_bayar is not null
     and batas_bayar < now();
  get diagnostics jumlah = row_count;
  return jumlah;
end;
$$;

revoke all on function public.kedaluwarsakan_tagihan() from public;
grant execute on function public.kedaluwarsakan_tagihan() to authenticated, service_role;
