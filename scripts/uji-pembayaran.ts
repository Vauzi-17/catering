/**
 * Uji logika pemesanan & pembayaran (src/lib/pembayaran.ts).
 * Jalankan: npm run uji
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cocokkanNotifikasi,
  crc16,
  hitungRincian,
  jarakKm,
  nominalDariTeks,
  periksaQris,
  qrisBernominal,
  statusSesudahLunas,
  tanggalJakarta,
  tanggalPalingCepat,
  titikSah,
  uraiTlv,
  type CalonPesanan,
} from "../src/lib/pembayaran.ts";

const menus = [
  { id: "a", nama: "Bento Royal", hargaJual: 38000, minimalPesan: 10, tersedia: true },
  { id: "b", nama: "Rendang VIP", hargaJual: 58000, minimalPesan: 10, tersedia: true },
  { id: "c", nama: "Tumpeng", hargaJual: 285000, minimalPesan: 1, tersedia: false },
];

test("total dihitung dari harga basis data, bukan dari browser", () => {
  const r = hitungRincian([{ menuId: "a", qty: 10 }, { menuId: "b", qty: 15 }], menus);
  assert.equal(r.total, 38000 * 10 + 58000 * 15);
  assert.deepEqual(r.baris.map((b) => b.harga), [38000, 58000]);
});

test("isi keranjang tidak sah ditolak", () => {
  assert.throws(() => hitungRincian([], menus), /kosong/);
  assert.throws(() => hitungRincian([{ menuId: "a", qty: 5 }], menus), /minimal 10/);
  assert.throws(() => hitungRincian([{ menuId: "a", qty: 10.5 }], menus), /minimal/);
  assert.throws(() => hitungRincian([{ menuId: "c", qty: 1 }], menus), /tidak tersedia/);
  assert.throws(() => hitungRincian([{ menuId: "zzz", qty: 10 }], menus), /tidak tersedia/);
  assert.throws(() => hitungRincian([{ menuId: "a", qty: 10 }, { menuId: "a", qty: 10 }], menus), /dua kali/);
  assert.throws(() => hitungRincian([{ menuId: "a", qty: 99999 }], menus), /maksimal/);
});

test("jarak dan validasi titik", () => {
  const bandung = { lat: -6.917464, lng: 107.619123 };
  const cimahi = { lat: -6.8722, lng: 107.5425 };
  const jakarta = { lat: -6.2088, lng: 106.8456 };
  assert.ok(jarakKm(bandung, cimahi) > 8 && jarakKm(bandung, cimahi) < 12);
  assert.ok(jarakKm(bandung, jakarta) > 110 && jarakKm(bandung, jakarta) < 130);
  assert.equal(jarakKm(bandung, bandung), 0);
  assert.ok(titikSah(-6.9, 107.6));
  assert.ok(!titikSah(null, 107.6));
  assert.ok(!titikSah(-100, 107.6));
  assert.ok(!titikSah(Number.NaN, 1));
});

test("tanggal memakai zona Asia/Jakarta", () => {
  // 30 Sep 2026 20:00 UTC = 1 Okt 2026 03:00 WIB
  const t = new Date("2026-09-30T20:00:00Z");
  assert.equal(tanggalJakarta(t), "2026-10-01");
  assert.equal(tanggalJakarta(t, 1), "2026-10-02");
  assert.equal(tanggalPalingCepat(t), "2026-10-03");
});

// ------------------------------------------------------------------ QRIS

/** QRIS statis tiruan dengan struktur seperti milik GoBiz/bank. */
function buatStatis(tambahan = ""): string {
  const tlv = (id: string, v: string) => id + String(v.length).padStart(2, "0") + v;
  const isi =
    tlv("00", "01") +
    tlv("01", "11") +
    tlv("26", tlv("00", "COM.GO-JEK.WWW") + tlv("01", "936009140123456789") + tlv("02", "G123456789") + tlv("03", "UMI")) +
    tlv("51", tlv("00", "ID.CO.QRIS.WWW") + tlv("02", "ID1023456789012") + tlv("03", "UMI")) +
    tlv("52", "5812") +
    tlv("53", "360") +
    tambahan +
    tlv("58", "ID") +
    tlv("59", "ASRI CATERING") +
    tlv("60", "BANDUNG") +
    tlv("61", "40115") +
    tlv("62", tlv("07", "A01")) +
    "6304";
  return isi + crc16(isi);
}

test("CRC16 sesuai vektor uji CCITT-FALSE", () => {
  assert.equal(crc16("123456789"), "29B1");
});

test("QRIS statis dikenali beserta nama toko", () => {
  const info = periksaQris(buatStatis());
  assert.deepEqual(info, { statis: true, nama: "ASRI CATERING", kota: "BANDUNG", nominal: null });
});

test("QRIS rusak atau bukan QRIS ditolak", () => {
  const sah = buatStatis();
  assert.throws(() => periksaQris(sah.slice(0, -1) + (sah.endsWith("0") ? "1" : "0")), /CRC/);
  assert.throws(() => periksaQris("https://contoh.id"), /bukan kode QRIS/);
  assert.throws(() => periksaQris("000201010211"), /tidak lengkap|tidak dikenali/);
});

test("QRIS bernominal: tag 01 jadi 12, tag 54 disisipkan sebelum 58, CRC baru sah", () => {
  const dinamis = qrisBernominal(buatStatis(), 150237);
  const info = periksaQris(dinamis);
  assert.equal(info.statis, false);
  assert.equal(info.nominal, 150237);
  assert.equal(info.nama, "ASRI CATERING");
  const id = uraiTlv(dinamis).map((e) => e.id);
  assert.ok(id.indexOf("54") === id.indexOf("58") - 1);
  assert.equal(id.at(-1), "63");
});

test("tip dan nominal lama dibuang supaya jumlah tidak bisa diubah", () => {
  const denganTip = buatStatis("540550000" + "550202" + "57041000");
  const dinamis = qrisBernominal(denganTip, 75500);
  const id = uraiTlv(dinamis).map((e) => e.id);
  assert.ok(!id.includes("55") && !id.includes("57"));
  assert.equal(periksaQris(dinamis).nominal, 75500);
});

test("nominal QRIS harus bilangan bulat positif", () => {
  assert.throws(() => qrisBernominal(buatStatis(), 0), /tidak sah/);
  assert.throws(() => qrisBernominal(buatStatis(), 1500.5), /tidak sah/);
});

test("nominal diambil dari berbagai format notifikasi", () => {
  assert.deepEqual(nominalDariTeks("Pembayaran QRIS Rp150.237 berhasil diterima"), [150237]);
  assert.deepEqual(nominalDariTeks("Kamu terima Rp 1.250.000,00 dari QRIS"), [1250000]);
  assert.deepEqual(nominalDariTeks("IDR 150,237.00 masuk"), [150237]);
  assert.deepEqual(nominalDariTeks("Rp150237 masuk ke GoPay Merchant"), [150237]);
  assert.deepEqual(nominalDariTeks("Saldo Rp2.500.000 · masuk Rp45.120"), [2500000, 45120]);
  assert.deepEqual(nominalDariTeks("Cashback Rp1.234,50"), []);
  assert.deepEqual(nominalDariTeks("Pesanan baru masuk"), []);
});

const jam = (n: number) => new Date(Date.parse("2026-10-13T05:00:00Z") + n * 3600_000).toISOString();
const SEKARANG = new Date("2026-10-13T05:00:00Z");
const calon = (c: Partial<CalonPesanan> & { id: string; nominal: number }): CalonPesanan => ({
  status_bayar: "Menunggu",
  batas_bayar: jam(5),
  dibayar_pada: null,
  ...c,
});

test("notifikasi cocok dengan tagihan aktif yang nominalnya persis", () => {
  const r = cocokkanNotifikasi([150237], [calon({ id: "a", nominal: 150237 }), calon({ id: "b", nominal: 150238 })], SEKARANG);
  assert.deepEqual(r, { hasil: "cocok", id: "a", telat: false });
});

test("notifikasi tanpa nominal atau tanpa pesanan cocok tidak mengubah apa pun", () => {
  assert.deepEqual(cocokkanNotifikasi([], [calon({ id: "a", nominal: 1 })], SEKARANG), { hasil: "tanpa_nominal" });
  assert.deepEqual(cocokkanNotifikasi([99], [calon({ id: "a", nominal: 150237 })], SEKARANG), { hasil: "tidak_cocok" });
});

test("pembayaran telat setelah kedaluwarsa tetap dicocokkan bila hanya satu calon", () => {
  const lewat = calon({ id: "a", nominal: 150237, status_bayar: "Kedaluwarsa", batas_bayar: jam(-2) });
  assert.deepEqual(cocokkanNotifikasi([150237], [lewat], SEKARANG), { hasil: "cocok", id: "a", telat: true });
  const duaLewat = [lewat, calon({ id: "b", nominal: 150237, status_bayar: "Kedaluwarsa", batas_bayar: jam(-10) })];
  assert.deepEqual(cocokkanNotifikasi([150237], duaLewat, SEKARANG), { hasil: "tidak_cocok" });
  const terlaluLama = calon({ id: "c", nominal: 150237, status_bayar: "Kedaluwarsa", batas_bayar: jam(-24 * 4) });
  assert.deepEqual(cocokkanNotifikasi([150237], [terlaluLama], SEKARANG), { hasil: "tidak_cocok" });
});

test("notifikasi kedua untuk pesanan yang baru lunas dianggap ganda", () => {
  const lunas = calon({ id: "a", nominal: 150237, status_bayar: "Lunas", dibayar_pada: jam(-0.1) });
  assert.deepEqual(cocokkanNotifikasi([150237], [lunas], SEKARANG), { hasil: "ganda", id: "a" });
});

test("tagihan aktif didahulukan daripada yang sudah lunas lama dengan nominal sama", () => {
  const r = cocokkanNotifikasi(
    [150237],
    [calon({ id: "lama", nominal: 150237, status_bayar: "Lunas", dibayar_pada: jam(-48) }), calon({ id: "baru", nominal: 150237 })],
    SEKARANG,
  );
  assert.deepEqual(r, { hasil: "cocok", id: "baru", telat: false });
});

test("lunas hanya menggeser pesanan yang belum berjalan", () => {
  assert.equal(statusSesudahLunas("Menunggu Pembayaran"), "Dibayar");
  assert.equal(statusSesudahLunas("Dibatalkan"), "Dibayar");
  assert.equal(statusSesudahLunas("Diproses"), "Diproses");
});
