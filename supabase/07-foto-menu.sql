-- ===========================================================================
-- Asri Catering — Penyimpanan foto menu (Supabase Storage)
--
-- Jalankan SETELAH 06-akun-pembayaran.sql. Aman dijalankan ulang.
--
-- Membuat bucket publik "menu". Siapa pun bisa MELIHAT foto lewat URL
-- publiknya (dibutuhkan katalog), tetapi hanya admin yang bisa mengunggah,
-- mengganti, dan menghapus.
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu', 'menu', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin melihat foto menu"  on storage.objects;
drop policy if exists "admin unggah foto menu"   on storage.objects;
drop policy if exists "admin ganti foto menu"    on storage.objects;
drop policy if exists "admin hapus foto menu"    on storage.objects;

-- Pengunjung tidak butuh policy select: bucket publik dibaca lewat URL
-- /storage/v1/object/public/... yang tidak melewati RLS. Policy di bawah
-- hanya untuk daftar berkas dan operasi tulis oleh admin.
create policy "admin melihat foto menu"
  on storage.objects for select to authenticated
  using (bucket_id = 'menu' and public.adalah_admin());

create policy "admin unggah foto menu"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'menu' and public.adalah_admin());

create policy "admin ganti foto menu"
  on storage.objects for update to authenticated
  using (bucket_id = 'menu' and public.adalah_admin())
  with check (bucket_id = 'menu' and public.adalah_admin());

create policy "admin hapus foto menu"
  on storage.objects for delete to authenticated
  using (bucket_id = 'menu' and public.adalah_admin());
