/**
 * Uji logika pemesanan & pembayaran (src/lib/pembayaran.ts).
 * Jalankan: npm run uji
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  hitungRincian,
  jarakKm,
  kodeDariOrderId,
  keIsoWib,
  namaMetode,
  orderIdMidtrans,
  pembaruanDariMidtrans,
  tanggalJakarta,
  teksSignature,
  titikSah,
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
});

test("order_id Midtrans bolak-balik ke kode pesanan", () => {
  const id = orderIdMidtrans("ASR-261003-123", 2);
  assert.equal(id, "ASR-261003-123-2");
  assert.deepEqual(kodeDariOrderId(id), { kode: "ASR-261003-123", percobaan: 2 });
  assert.equal(kodeDariOrderId("tanpa-angka-x"), null);
});

test("signature sesuai rumus Midtrans: sha512(order_id + status_code + gross_amount + server_key)", () => {
  const teks = teksSignature("ASR-1-1", "200", "960000.00", "SB-Mid-server-rahasia");
  assert.equal(teks, "ASR-1-1200960000.00SB-Mid-server-rahasia");
  assert.equal(createHash("sha512").update(teks).digest("hex").length, 128);
});

test("nama metode pembayaran", () => {
  assert.equal(namaMetode({ payment_type: "bank_transfer", va_numbers: [{ bank: "bca" }] }), "BCA Virtual Account");
  assert.equal(namaMetode({ payment_type: "bank_transfer", permata_va_number: "123" }), "PERMATA Virtual Account");
  assert.equal(namaMetode({ payment_type: "qris", issuer: "gopay" }), "QRIS (gopay)");
  assert.equal(namaMetode({ payment_type: "gopay" }), "GoPay");
  assert.equal(namaMetode({ payment_type: "echannel" }), "Mandiri Bill Payment");
});

const menunggu = { status: "Menunggu Pembayaran", status_bayar: "Menunggu", midtrans_order_id: "K-1" };
const sekarang = new Date("2026-10-01T03:00:00Z");

test("settlement → Lunas dan status Dibayar", () => {
  const p = pembaruanDariMidtrans(menunggu, {
    order_id: "K-1",
    transaction_status: "settlement",
    payment_type: "qris",
    settlement_time: "2026-10-01 10:15:00",
  }, sekarang);
  assert.deepEqual(p, {
    status_bayar: "Lunas",
    metode_bayar: "QRIS",
    dibayar_pada: "2026-10-01T03:15:00.000Z",
    status: "Dibayar",
  });
});

test("capture kartu: accept lunas, deny gagal", () => {
  assert.equal(pembaruanDariMidtrans(menunggu, { order_id: "K-1", transaction_status: "capture", fraud_status: "accept" })?.status_bayar, "Lunas");
  assert.equal(pembaruanDariMidtrans(menunggu, { order_id: "K-1", transaction_status: "capture", fraud_status: "deny" })?.status_bayar, "Gagal");
});

test("notifikasi lunas berulang tidak mengubah apa pun", () => {
  const lunas = { status: "Dibayar", status_bayar: "Lunas", midtrans_order_id: "K-1" };
  assert.equal(pembaruanDariMidtrans(lunas, { order_id: "K-1", transaction_status: "settlement" }), null);
});

test("pesanan lunas tidak turun status karena expire yang terlambat", () => {
  const lunas = { status: "Diproses", status_bayar: "Lunas", midtrans_order_id: "K-2" };
  assert.equal(pembaruanDariMidtrans(lunas, { order_id: "K-1", transaction_status: "expire" }), null);
  assert.equal(pembaruanDariMidtrans(lunas, { order_id: "K-2", transaction_status: "expire" }), null);
});

test("expire dari percobaan lama diabaikan, dari percobaan aktif membatalkan", () => {
  const aktif2 = { ...menunggu, midtrans_order_id: "K-2" };
  assert.equal(pembaruanDariMidtrans(aktif2, { order_id: "K-1", transaction_status: "expire" }), null);
  assert.deepEqual(pembaruanDariMidtrans(aktif2, { order_id: "K-2", transaction_status: "expire" }), {
    status_bayar: "Kedaluwarsa",
    status: "Dibatalkan",
  });
});

test("pembayaran telat setelah kedaluwarsa tetap tercatat lunas", () => {
  const batal = { status: "Dibatalkan", status_bayar: "Kedaluwarsa", midtrans_order_id: "K-1" };
  const p = pembaruanDariMidtrans(batal, { order_id: "K-1", transaction_status: "settlement" }, sekarang);
  assert.equal(p?.status_bayar, "Lunas");
  assert.equal(p?.status, "Dibayar");
});

test("lunas tidak mengubah alur yang sudah diproses admin", () => {
  const diproses = { status: "Diproses", status_bayar: "Menunggu", midtrans_order_id: "K-1" };
  const p = pembaruanDariMidtrans(diproses, { order_id: "K-1", transaction_status: "settlement" }, sekarang);
  assert.equal(p?.status_bayar, "Lunas");
  assert.equal(p?.status, undefined);
});

test("cancel/deny menandai gagal tanpa membatalkan pesanan", () => {
  assert.deepEqual(pembaruanDariMidtrans(menunggu, { order_id: "K-1", transaction_status: "cancel" }), { status_bayar: "Gagal" });
});

test("refund mengembalikan dana dan membatalkan pesanan", () => {
  const lunas = { status: "Dibayar", status_bayar: "Lunas", midtrans_order_id: "K-1" };
  assert.deepEqual(pembaruanDariMidtrans(lunas, { order_id: "K-1", transaction_status: "refund" }), {
    status_bayar: "Dikembalikan",
    status: "Dibatalkan",
  });
});

test("waktu Midtrans (WIB) dikonversi ke UTC", () => {
  assert.equal(keIsoWib("2026-10-01 00:30:00"), "2026-09-30T17:30:00.000Z");
});
