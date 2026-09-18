-- ===========================================================================
-- Asri Catering — Row Level Security (TAHAP PENGEMBANGAN)
--
-- ⚠️  PERINGATAN PENTING
--
-- Berkas ini dipakai selama panel admin MASIH memakai login demo
-- (admin / asri2025 di localStorage). Karena aplikasi belum bisa membuktikan
-- siapa yang sedang login, policy tulis di bawah ini terpaksa menerima
-- pengunjung anonim.
--
-- Artinya: siapa pun yang mengetahui URL Supabase dan anon key Anda dapat
-- mengubah atau menghapus data menu, bahan baku, dan pesanan.
--
-- Selama proyek masih dikerjakan di komputer sendiri, hal ini tidak masalah.
-- SEBELUM domain dipublikasikan ke pelanggan, jalankan 04-rls-produksi.sql
-- dan pindahkan login ke Supabase Auth.
-- ===========================================================================

alter table public.users                enable row level security;
alter table public.categories           enable row level security;
alter table public.ingredients          enable row level security;
alter table public.menus                enable row level security;
alter table public.recipes              enable row level security;
alter table public.orders               enable row level security;
alter table public.order_details        enable row level security;
alter table public.order_status_history enable row level security;
alter table public.settings             enable row level security;
alter table public.daily_reports        enable row level security;

-- Bersihkan policy lama supaya berkas ini aman dijalankan ulang
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
-- Data katalog — boleh dibaca siapa saja (halaman menu publik)
-- ---------------------------------------------------------------------------
create policy "katalog boleh dibaca publik"
  on public.categories for select using (true);

create policy "menu boleh dibaca publik"
  on public.menus for select using (true);

-- Bahan baku dan resep TIDAK dibuka ke publik: itu rahasia dapur.
-- Selama tahap ini dibaca memakai anon key dari panel admin.
create policy "bahan dibaca aplikasi"
  on public.ingredients for select using (true);

create policy "resep dibaca aplikasi"
  on public.recipes for select using (true);

create policy "pengaturan dibaca aplikasi"
  on public.settings for select using (true);

-- ---------------------------------------------------------------------------
-- Pemesanan — tamu boleh membuat pesanan tanpa login
-- ---------------------------------------------------------------------------
create policy "tamu boleh membuat pesanan"
  on public.orders for insert with check (true);

create policy "rincian pesanan boleh dibuat"
  on public.order_details for insert with check (true);

-- Halaman lacak pesanan membaca berdasarkan kode pesanan.
-- Pada tahap ini pembacaan masih terbuka; 04-rls-produksi.sql menggantinya
-- dengan fungsi RPC yang hanya mengembalikan satu pesanan sesuai kode.
create policy "pesanan dibaca aplikasi"
  on public.orders for select using (true);

create policy "rincian pesanan dibaca aplikasi"
  on public.order_details for select using (true);

create policy "riwayat status dibaca aplikasi"
  on public.order_status_history for select using (true);

create policy "laporan dibaca aplikasi"
  on public.daily_reports for select using (true);

-- ---------------------------------------------------------------------------
-- Policy tulis SEMENTARA — lihat peringatan di bagian atas berkas
-- ---------------------------------------------------------------------------
create policy "SEMENTARA menu boleh ditulis"
  on public.menus for all using (true) with check (true);

create policy "SEMENTARA kategori boleh ditulis"
  on public.categories for all using (true) with check (true);

create policy "SEMENTARA bahan boleh ditulis"
  on public.ingredients for all using (true) with check (true);

create policy "SEMENTARA resep boleh ditulis"
  on public.recipes for all using (true) with check (true);

create policy "SEMENTARA status pesanan boleh diubah"
  on public.orders for update using (true) with check (true);

create policy "SEMENTARA pengaturan boleh diubah"
  on public.settings for all using (true) with check (true);

-- Tabel users tetap tertutup sejak sekarang: tidak ada policy apa pun,
-- sehingga hanya service role yang bisa menyentuhnya.
