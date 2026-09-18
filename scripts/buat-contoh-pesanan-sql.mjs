/**
 * Membuat supabase/05-contoh-pesanan.sql dari src/data/pesanan.ts.
 * Jalankan: node scripts/buat-contoh-pesanan-sql.mjs
 *
 * Tujuannya supaya pesanan contoh di Supabase sama persis dengan yang muncul
 * pada mode data contoh, sehingga angka di dasbor dan laporan tidak berubah
 * ketika aplikasi disambungkan ke basis data.
 *
 * Tanggal ditulis relatif terhadap current_date, bukan tanggal tetap, supaya
 * laporan selalu punya data berapa pun hari menjalankannya.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { muatData } from "./muat-data.mjs";

const akar = join(dirname(fileURLToPath(import.meta.url)), "..");

const { menuAwal } = muatData("menu.ts");
const { buatPesananAwal } = muatData("pesanan.ts", { "data/menu": { menuAwal } });

const pesanan = buatPesananAwal();

const hariIni = new Date();
hariIni.setHours(0, 0, 0, 0);

const HARI_MS = 86_400_000;
const selisihHari = (iso) => {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - hariIni.getTime()) / HARI_MS);
};
const selisihJam = (iso, dasarIso) =>
  Math.round((new Date(iso).getTime() - new Date(dasarIso).getTime()) / 3_600_000);

const q = (v) => `'${String(v).replace(/'/g, "''")}'`;
const hariSql = (n) =>
  n === 0 ? "current_date" : `current_date ${n > 0 ? "+" : "-"} ${Math.abs(n)}`;

const slugMenu = new Map(menuAwal.map((m) => [m.id, m.slug]));

const baris = [];

baris.push(`-- ===========================================================================
-- Asri Catering — Pesanan Contoh (OPSIONAL)
--
-- Dihasilkan otomatis oleh scripts/buat-contoh-pesanan-sql.mjs dari
-- src/data/pesanan.ts. Jangan disunting langsung.
--
-- Untuk apa berkas ini:
--   Setelah 03-seed.sql, tabel menu dan bahan baku sudah terisi tetapi tabel
--   pesanan masih kosong — sehingga Dasbor dan Laporan tidak punya angka apa
--   pun untuk ditampilkan. Berkas ini mengisi ${pesanan.length} pesanan contoh yang
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
`);

baris.push(`-- ---------------------------------------------------------------- pesanan`);
baris.push("");

pesanan.forEach((p, i) => {
  const kode = `ASR-DEMO-${String(i + 1).padStart(2, "0")}`;
  const offsetAcara = selisihHari(p.tanggalAcara);
  const offsetDibuat = selisihHari(p.dibuatPada);

  const daftarItem = p.items
    .map((it, idx) => {
      const slug = slugMenu.get(it.menuId);
      if (!slug) throw new Error(`Menu tidak dikenal pada pesanan ${kode}`);
      return `  (${q(slug)}${idx === 0 ? "::text" : ""}, ${it.qty})`;
    })
    .join(",\n");

  baris.push(`-- ${kode} · ${p.nama}`);
  baris.push(
    `insert into public.orders (\n` +
      `  kode, nama, telepon, alamat, tanggal_acara, waktu_antar,\n` +
      `  metode, catatan, total, status, dibuat_pada)\n` +
      `select\n` +
      `  ${q(kode)}, ${q(p.nama)}, ${q(p.telepon)},\n` +
      `  ${q(p.alamat)},\n` +
      `  ${hariSql(offsetAcara)}, ${q(p.waktuAntar)},\n` +
      `  ${q(p.metode)}, ${q(p.catatan)},\n` +
      `  (select sum(m.harga_jual * v.qty)\n` +
      `   from (values\n` +
      daftarItem.replace(/^/gm, "  ") +
      `\n   ) as v(slug, qty)\n` +
      `   join public.menus m on m.slug = v.slug),\n` +
      `  ${q(p.status)}, ${hariSql(offsetDibuat)} + time '08:00';`,
  );
  baris.push("");

  baris.push(
    `insert into public.order_details (order_id, menu_id, nama_menu, qty, harga)\n` +
      `select o.id, m.id, m.nama, v.qty, m.harga_jual\n` +
      `from public.orders o\n` +
      `cross join (values\n` +
      daftarItem +
      `\n) as v(slug, qty)\n` +
      `join public.menus m on m.slug = v.slug\n` +
      `where o.kode = ${q(kode)};`,
  );
  baris.push("");
});

// Trigger pada tabel orders sudah menulis satu baris riwayat saat pesanan
// dibuat. Untuk pesanan contoh, riwayatnya ditulis ulang supaya tahapannya
// lengkap dan urutan waktunya masuk akal di halaman lacak pesanan.
baris.push(`-- -------------------------------------------------------- riwayat status
-- Trigger menulis satu baris saat pesanan dibuat. Baris itu dibuang lalu
-- diganti riwayat lengkap supaya tahapannya terlihat utuh di halaman lacak.
delete from public.order_status_history
where order_id in (select id from public.orders where kode like 'ASR-DEMO-%');
`);

pesanan.forEach((p, i) => {
  const kode = `ASR-DEMO-${String(i + 1).padStart(2, "0")}`;
  const langkah = p.riwayat
    .map(
      (r, idx) =>
        `  (${q(r.status)}${idx === 0 ? "::text" : ""}, ${selisihJam(r.waktu, p.dibuatPada)})`,
    )
    .join(",\n");

  baris.push(
    `insert into public.order_status_history (order_id, status, waktu)\n` +
      `select o.id, v.status, o.dibuat_pada + make_interval(hours => v.jam)\n` +
      `from public.orders o\n` +
      `cross join (values\n` +
      langkah +
      `\n) as v(status, jam)\n` +
      `where o.kode = ${q(kode)};`,
  );
});
baris.push("");

baris.push(`-- ------------------------------------------------------------- snapshot HPP
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
`);

const dihitung = pesanan.filter(
  (p) => p.status === "Diproses" || p.status === "Selesai",
).length;

baris.push(`-- ------------------------------------------------------------------ periksa
-- Angka yang diharapkan: ${pesanan.length} pesanan, ${pesanan.reduce((a, p) => a + p.items.length, 0)} baris rincian.
-- ${dihitung} di antaranya berstatus Diproses/Selesai — hanya itu yang masuk laporan.

select 'pesanan' as tabel, count(*) as jumlah from public.orders where kode like 'ASR-DEMO-%'
union all
select 'rincian pesanan', count(*) from public.order_details d
  join public.orders o on o.id = d.order_id where o.kode like 'ASR-DEMO-%'
union all
select 'masuk laporan', count(*) from public.orders
  where kode like 'ASR-DEMO-%' and status in ('Diproses', 'Selesai');`);
baris.push("");

writeFileSync(join(akar, "supabase/05-contoh-pesanan.sql"), baris.join("\n"), "utf8");
console.log(
  `supabase/05-contoh-pesanan.sql dibuat — ${pesanan.length} pesanan, ` +
    `${pesanan.reduce((a, p) => a + p.items.length, 0)} baris rincian, ` +
    `${dihitung} masuk laporan.`,
);
