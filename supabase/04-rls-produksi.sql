-- ===========================================================================
-- Asri Catering — Row Level Security (TAHAP PRODUKSI)
--
-- Jalankan berkas ini SETELAH panel admin dipindahkan ke Supabase Auth.
-- Berkas ini menggantikan seluruh policy pada 02-rls.sql.
--
-- Langkah sebelum menjalankan:
--   1. Dashboard > Authentication > Users > Add user
--      Buat akun untuk Ibu Asri, catat UUID-nya.
--   2. insert into public.users (id, nama) values ('<uuid-tadi>', 'Asri Wulandari');
--   3. Ganti fungsi login pada src/store/DataProvider.tsx menjadi
--      supabase.auth.signInWithPassword({ email, password }).
--   4. Baru jalankan berkas ini.
--
-- Setelah ini, anon key hanya bisa: membaca katalog menu, membuat pesanan,
-- dan melacak satu pesanan lewat kodenya. Selebihnya wajib login admin.
-- ===========================================================================

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

-- ---------------------------------------------------------------------------
-- Katalog publik
-- ---------------------------------------------------------------------------
create policy "kategori dibaca publik"
  on public.categories for select using (true);

create policy "menu tersedia dibaca publik"
  on public.menus for select using (tersedia or public.adalah_admin());

-- ---------------------------------------------------------------------------
-- Rahasia dapur — hanya admin
-- ---------------------------------------------------------------------------
create policy "bahan hanya admin"
  on public.ingredients for select using (public.adalah_admin());

create policy "resep hanya admin"
  on public.recipes for select using (public.adalah_admin());

create policy "pengaturan hanya admin"
  on public.settings for select using (public.adalah_admin());

-- ---------------------------------------------------------------------------
-- Pemesanan
-- ---------------------------------------------------------------------------
create policy "tamu boleh membuat pesanan"
  on public.orders for insert with check (true);

create policy "rincian pesanan boleh dibuat"
  on public.order_details for insert with check (true);

-- Data pesanan tidak lagi bisa dibaca massal oleh anon.
-- Pelacakan memakai fungsi lacak_pesanan() di bawah.
create policy "pesanan hanya admin"
  on public.orders for select using (public.adalah_admin());

create policy "rincian pesanan hanya admin"
  on public.order_details for select using (public.adalah_admin());

create policy "riwayat status hanya admin"
  on public.order_status_history for select using (public.adalah_admin());

create policy "laporan hanya admin"
  on public.daily_reports for select using (public.adalah_admin());

-- ---------------------------------------------------------------------------
-- Hak tulis admin
-- ---------------------------------------------------------------------------
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
  on public.users for select using (public.adalah_admin());

-- ---------------------------------------------------------------------------
-- Pelacakan pesanan untuk tamu.
--
-- Fungsi ini menerima satu kode pesanan dan hanya mengembalikan pesanan itu.
-- Nomor telepon dipotong sebagian supaya tidak bisa dipanen bila ada yang
-- mencoba menebak kode secara acak.
--
-- Pemakaian dari aplikasi:
--   supabase.rpc('lacak_pesanan', { p_kode: 'ASR-260918-001' })
-- ---------------------------------------------------------------------------
create or replace function public.lacak_pesanan(p_kode text)
returns table (
  kode          text,
  nama          text,
  telepon       text,
  alamat        text,
  tanggal_acara date,
  waktu_antar   text,
  metode        text,
  catatan       text,
  total         numeric,
  status        text,
  dibuat_pada   timestamptz,
  items         jsonb,
  riwayat       jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.kode,
    o.nama,
    regexp_replace(o.telepon, '\d(?=\d{3})', '*', 'g') as telepon,
    o.alamat,
    o.tanggal_acara,
    o.waktu_antar,
    o.metode,
    o.catatan,
    o.total,
    o.status,
    o.dibuat_pada,
    coalesce(
      (select jsonb_agg(jsonb_build_object(
          'menuId', d.menu_id, 'nama', d.nama_menu,
          'qty', d.qty, 'harga', d.harga) order by d.nama_menu)
       from public.order_details d where d.order_id = o.id),
      '[]'::jsonb) as items,
    coalesce(
      (select jsonb_agg(jsonb_build_object('status', h.status, 'waktu', h.waktu)
          order by h.waktu)
       from public.order_status_history h where h.order_id = o.id),
      '[]'::jsonb) as riwayat
  from public.orders o
  where upper(o.kode) = upper(trim(p_kode))
  limit 1;
$$;

revoke all on function public.lacak_pesanan(text) from public;
grant execute on function public.lacak_pesanan(text) to anon, authenticated;
