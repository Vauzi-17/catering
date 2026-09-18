/**
 * Membuat supabase/03-seed.sql dari data contoh di src/data/.
 * Jalankan: node scripts/buat-seed-sql.mjs
 *
 * Dipakai supaya isi basis data selalu sama persis dengan data contoh yang
 * dipakai aplikasi saat berjalan tanpa Supabase.
 *
 * Catatan penting soal bentuk SQL yang dihasilkan:
 * setiap perintah berdiri sendiri, tanpa tabel sementara dan tanpa blok
 * transaksi. SQL Editor Supabase berjalan lewat connection pooler, sehingga
 * tabel sementara tidak dijamin bertahan antar perintah. Kaitan antara menu,
 * bahan, dan kategori karena itu dicari lewat kolom unik masing-masing
 * (menus.slug, ingredients.nama, categories.nama).
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { muatData } from "./muat-data.mjs";

const akar = join(dirname(fileURLToPath(import.meta.url)), "..");

const { bahanAwal } = muatData("bahan.ts");
const { menuAwal, kategoriMenu } = muatData("menu.ts");

// Resep mengacu ke bahan lewat namanya, jadi nama wajib unik.
const namaBahan = new Map();
for (const b of bahanAwal) {
  if ([...namaBahan.values()].includes(b.nama)) {
    throw new Error(`Nama bahan ganda: ${b.nama}. Nama bahan harus unik.`);
  }
  namaBahan.set(b.id, b.nama);
}

const q = (v) => `'${String(v).replace(/'/g, "''")}'`;
const arr = (list) =>
  list.length ? `array[${list.map(q).join(", ")}]::text[]` : `'{}'::text[]`;
// Semua angka ditulis dengan desimal supaya tipe kolom pada daftar VALUES
// selalu terbaca numeric, bukan integer.
const num = (v) => Number(v).toFixed(4);

const baris = [];

baris.push(`-- ===========================================================================
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
`);

// ------------------------------------------------------------------ kategori
baris.push(`-- ---------------------------------------------------------------- kategori`);
baris.push(
  `insert into public.categories (nama, urutan) values\n` +
    kategoriMenu.map((nama, i) => `  (${q(nama)}, ${i + 1})`).join(",\n") +
    `\non conflict (nama) do update set urutan = excluded.urutan;`,
);
baris.push("");

// --------------------------------------------------------------- bahan baku
baris.push(`-- -------------------------------------------------------------- bahan baku`);
baris.push(
  `-- Pengaman: "on conflict (nama)" butuh kolom nama yang unik. Baris ini tidak\n` +
    `-- mengubah apa pun bila indeksnya sudah dibuat oleh 01-schema.sql.\n` +
    `create unique index if not exists ingredients_nama_unik on public.ingredients (nama);`,
);
baris.push("");
baris.push(
  `insert into public.ingredients (nama, satuan, harga_satuan, kategori, stok, stok_minimum) values\n` +
    bahanAwal
      .map(
        (b) =>
          `  (${q(b.nama)}, ${q(b.satuan)}, ${b.hargaSatuan}, ${q(b.kategori)}, ${b.stok}, ${b.stokMinimum})`,
      )
      .join(",\n") +
    `\non conflict (nama) do update set\n` +
    `  satuan       = excluded.satuan,\n` +
    `  harga_satuan = excluded.harga_satuan,\n` +
    `  kategori     = excluded.kategori,\n` +
    `  stok         = excluded.stok,\n` +
    `  stok_minimum = excluded.stok_minimum,\n` +
    `  diubah_pada  = now();`,
);
baris.push("");

// --------------------------------------------------------------- menu & resep
baris.push(`-- ------------------------------------------------------------ menu & resep`);
baris.push("");

for (const m of menuAwal) {
  baris.push(`-- ${m.nama}`);

  baris.push(
    `insert into public.menus (\n` +
      `  category_id, slug, nama, deskripsi, deskripsi_panjang, harga_jual,\n` +
      `  satuan_jual, foto, isi, populer, tersedia, minimal_pesan,\n` +
      `  biaya_kemasan, biaya_tenaga_kerja)\n` +
      `select\n` +
      `  c.id, ${q(m.slug)}, ${q(m.nama)},\n` +
      `  ${q(m.deskripsi)},\n` +
      `  ${q(m.deskripsiPanjang)},\n` +
      `  ${m.hargaJual}, ${q(m.satuanJual)}, ${q(m.foto)},\n` +
      `  ${arr(m.isi)},\n` +
      `  ${m.populer}, ${m.tersedia}, ${m.minimalPesan}, ${m.biayaKemasan}, ${m.biayaTenagaKerja}\n` +
      `from public.categories c\n` +
      `where c.nama = ${q(m.kategori)}\n` +
      `on conflict (slug) do update set\n` +
      `  category_id        = excluded.category_id,\n` +
      `  nama               = excluded.nama,\n` +
      `  deskripsi          = excluded.deskripsi,\n` +
      `  deskripsi_panjang  = excluded.deskripsi_panjang,\n` +
      `  harga_jual         = excluded.harga_jual,\n` +
      `  satuan_jual        = excluded.satuan_jual,\n` +
      `  isi                = excluded.isi,\n` +
      `  populer            = excluded.populer,\n` +
      `  tersedia           = excluded.tersedia,\n` +
      `  minimal_pesan      = excluded.minimal_pesan,\n` +
      `  biaya_kemasan      = excluded.biaya_kemasan,\n` +
      `  biaya_tenaga_kerja = excluded.biaya_tenaga_kerja,\n` +
      `  diubah_pada        = now();`,
  );
  baris.push("");

  const resep = m.resep.filter((r) => namaBahan.has(r.bahanId));
  if (resep.length !== m.resep.length) {
    throw new Error(`Menu ${m.nama} memakai bahan yang tidak ada di bahan.ts.`);
  }

  baris.push(
    `insert into public.recipes (menu_id, ingredient_id, jumlah)\n` +
      `select m.id, i.id, v.jumlah\n` +
      `from public.menus m\n` +
      `cross join (values\n` +
      resep
        .map((r) => `  (${q(namaBahan.get(r.bahanId))}, ${num(r.jumlah)})`)
        .join(",\n") +
      `\n) as v(nama_bahan, jumlah)\n` +
      `join public.ingredients i on i.nama = v.nama_bahan\n` +
      `where m.slug = ${q(m.slug)}\n` +
      `on conflict (menu_id, ingredient_id) do update set jumlah = excluded.jumlah;`,
  );
  baris.push("");
}

// ------------------------------------------------------------------ periksa
baris.push(`-- ------------------------------------------------------------------ periksa
-- Jalankan bagian ini untuk memastikan datanya masuk.
-- Angka yang diharapkan: ${kategoriMenu.length} kategori, ${bahanAwal.length} bahan, ${menuAwal.length} menu, ${menuAwal.reduce((a, m) => a + m.resep.length, 0)} baris resep.

select 'kategori' as tabel, count(*) as jumlah from public.categories
union all
select 'bahan baku', count(*) from public.ingredients
union all
select 'menu', count(*) from public.menus
union all
select 'baris resep', count(*) from public.recipes;`);
baris.push("");

writeFileSync(join(akar, "supabase/03-seed.sql"), baris.join("\n"), "utf8");
console.log(
  `supabase/03-seed.sql dibuat — ${kategoriMenu.length} kategori, ${bahanAwal.length} bahan, ` +
    `${menuAwal.length} menu, ${menuAwal.reduce((a, m) => a + m.resep.length, 0)} baris resep.`,
);
