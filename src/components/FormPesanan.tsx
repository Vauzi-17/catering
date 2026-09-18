"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconMinus,
  IconPlus,
  IconTrash,
} from "@/components/Icons";
import { FotoMenu } from "@/components/Placeholder";
import { Kosong } from "@/components/Ui";
import { profil } from "@/data/profil";
import { rupiah, tanggalPanjang, tanggalPlus } from "@/lib/format";
import type { Pesanan } from "@/lib/types";
import { useData } from "@/store/DataProvider";

interface Formulir {
  nama: string;
  telepon: string;
  alamat: string;
  tanggalAcara: string;
  waktuAntar: string;
  metode: "Antar ke Alamat" | "Ambil di Tempat";
  catatan: string;
}

const formAwal: Formulir = {
  nama: "",
  telepon: "",
  alamat: "",
  tanggalAcara: "",
  waktuAntar: "11:00",
  metode: "Antar ke Alamat",
  catatan: "",
};

export function FormPesanan() {
  const {
    menus,
    keranjang,
    ubahQtyKeranjang,
    hapusKeranjang,
    tambahKeranjang,
    kosongkanKeranjang,
    buatPesanan,
    siap,
    sibuk,
  } = useData();

  const [form, setForm] = useState<Formulir>(formAwal);
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [pilihanTambah, setPilihanTambah] = useState("");
  const [berhasil, setBerhasil] = useState<Pesanan | null>(null);

  const baris = useMemo(
    () =>
      keranjang
        .map((k) => {
          const menu = menus.find((m) => m.id === k.menuId);
          return menu ? { menu, qty: k.qty } : null;
        })
        .filter((v): v is { menu: (typeof menus)[number]; qty: number } => v !== null),
    [keranjang, menus],
  );

  const total = baris.reduce((a, b) => a + b.menu.hargaJual * b.qty, 0);
  const totalPorsi = baris.reduce((a, b) => a + b.qty, 0);

  function ubahField<K extends keyof Formulir>(kunci: K, nilai: Formulir[K]) {
    setForm((f) => ({ ...f, [kunci]: nilai }));
    setGalat((g) => {
      const { [kunci]: _, ...sisa } = g;
      return sisa;
    });
  }

  function validasi() {
    const g: Record<string, string> = {};
    if (form.nama.trim().length < 3) g.nama = "Nama pemesan minimal 3 huruf.";
    if (!/^[0-9+\-\s()]{9,}$/.test(form.telepon.trim()))
      g.telepon = "Masukkan nomor telepon yang bisa dihubungi.";
    if (form.metode === "Antar ke Alamat" && form.alamat.trim().length < 10)
      g.alamat = "Tuliskan alamat lengkap beserta patokan.";
    if (!form.tanggalAcara) g.tanggalAcara = "Pilih tanggal acara.";
    else if (form.tanggalAcara < tanggalPlus(1))
      g.tanggalAcara = "Pesanan paling cepat untuk besok (H-1).";
    if (!form.waktuAntar) g.waktuAntar = "Pilih jam pengantaran.";
    if (baris.length === 0) g.menu = "Pilih minimal satu menu terlebih dahulu.";

    baris.forEach(({ menu, qty }) => {
      if (qty < menu.minimalPesan)
        g.menu = `${menu.nama} minimal ${menu.minimalPesan} ${menu.satuanJual.replace(
          "per ",
          "",
        )}.`;
    });

    setGalat(g);
    return Object.keys(g).length === 0;
  }

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (!validasi()) {
      const pertama = document.querySelector<HTMLElement>("[data-galat='true']");
      pertama?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    let pesananBaru;
    try {
      pesananBaru = await buatPesanan({
        nama: form.nama.trim(),
        telepon: form.telepon.trim(),
        alamat:
          form.metode === "Ambil di Tempat"
            ? "Diambil di dapur Asri Catering"
            : form.alamat.trim(),
        tanggalAcara: form.tanggalAcara,
        waktuAntar: form.waktuAntar,
        metode: form.metode,
        catatan: form.catatan.trim(),
        items: baris.map((b) => ({
          menuId: b.menu.id,
          nama: b.menu.nama,
          qty: b.qty,
          harga: b.menu.hargaJual,
        })),
      });
    } catch {
      setGalat({
        kirim:
          "Pesanan gagal dikirim. Periksa koneksi internet Anda lalu coba lagi, atau hubungi kami lewat WhatsApp.",
      });
      return;
    }

    kosongkanKeranjang();
    setForm(formAwal);
    setBerhasil(pesananBaru);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (berhasil) {
    return (
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="card p-7 sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-brand-700">
              <IconCheck width={24} height={24} />
            </span>
            <h1 className="mt-5 font-display text-[28px] leading-tight sm:text-[32px]">
              Pesanan Anda sudah kami terima
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              Simpan kode di bawah ini. Admin akan menghubungi {berhasil.telepon}
              untuk konfirmasi.
            </p>

            <div className="mt-6 rounded-card border border-brand-200 bg-brand-50 p-5 text-center">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-brand-700">
                Kode pesanan
              </p>
              <p className="mt-1.5 font-display text-[30px] font-semibold tracking-wide text-brand-800">
                {berhasil.kode}
              </p>
            </div>

            <dl className="mt-6 divide-y divide-line border-y border-line">
              <div className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-ink-muted">Nama pemesan</dt>
                <dd className="text-right font-semibold">{berhasil.nama}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-ink-muted">Tanggal acara</dt>
                <dd className="text-right font-semibold">
                  {tanggalPanjang(berhasil.tanggalAcara)}, {berhasil.waktuAntar}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-ink-muted">Metode</dt>
                <dd className="text-right font-semibold">{berhasil.metode}</dd>
              </div>
              {berhasil.items.map((it) => (
                <div key={it.menuId} className="flex justify-between gap-4 py-3 text-sm">
                  <dt className="text-ink-muted">
                    {it.nama} × {it.qty}
                  </dt>
                  <dd className="text-right font-semibold">{rupiah(it.harga * it.qty)}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 py-3">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-xl font-semibold text-brand-800">
                  {rupiah(berhasil.total)}
                </dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={`/lacak?kode=${berhasil.kode}`} className="btn btn-primary btn-md">
                Lacak pesanan ini
                <IconArrowRight width={18} height={18} />
              </Link>
              <button
                type="button"
                onClick={() => setBerhasil(null)}
                className="btn btn-outline btn-md"
              >
                Buat pesanan lain
              </button>
            </div>

            <p className="mt-6 text-[13px] leading-relaxed text-ink-muted">
              Butuh perubahan mendadak? Hubungi {profil.telepon} paling lambat H-1
              sebelum tanggal acara.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={kirim} noValidate className="container-page py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Kolom kiri: menu dipilih + data pemesan */}
        <div className="space-y-6 lg:col-span-7">
          <section className="card p-5 sm:p-6" data-galat={Boolean(galat.menu)}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-xl">1. Menu yang dipesan</h2>
              {baris.length > 0 && (
                <button
                  type="button"
                  onClick={kosongkanKeranjang}
                  className="text-[13px] font-semibold text-ink-muted hover:text-red-700"
                >
                  Kosongkan
                </button>
              )}
            </div>

            {!siap ? (
              <p className="mt-5 text-sm text-ink-muted">Memuat daftar pesanan…</p>
            ) : baris.length === 0 ? (
              <div className="mt-5">
                <Kosong
                  judul="Belum ada menu dipilih"
                  deskripsi="Pilih menu dari katalog, atau tambahkan langsung lewat kotak pilihan di bawah."
                  aksi={
                    <Link href="/menu" className="btn btn-outline btn-md">
                      Buka katalog menu
                    </Link>
                  }
                />
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-line border-y border-line">
                {baris.map(({ menu, qty }) => (
                  <li key={menu.id} className="flex flex-wrap items-center gap-4 py-4">
                    <div className="w-16 shrink-0 overflow-hidden rounded-lg border border-line">
                      <FotoMenu src={menu.foto} nama={menu.nama} rasio="aspect-square" mini />
                    </div>

                    <div className="min-w-[140px] flex-1">
                      <p className="text-[15px] font-semibold leading-snug">{menu.nama}</p>
                      <p className="mt-0.5 text-[13px] text-ink-muted">
                        {rupiah(menu.hargaJual)} {menu.satuanJual} · min.{" "}
                        {menu.minimalPesan}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => ubahQtyKeranjang(menu.id, qty - 5)}
                        className="btn btn-outline h-9 w-9 p-0"
                        aria-label={`Kurangi jumlah ${menu.nama}`}
                      >
                        <IconMinus width={16} height={16} />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={qty}
                        onChange={(e) =>
                          ubahQtyKeranjang(menu.id, Number(e.target.value) || 0)
                        }
                        className="field-sm h-9 w-16 text-center"
                        aria-label={`Jumlah ${menu.nama}`}
                      />
                      <button
                        type="button"
                        onClick={() => ubahQtyKeranjang(menu.id, qty + 5)}
                        className="btn btn-outline h-9 w-9 p-0"
                        aria-label={`Tambah jumlah ${menu.nama}`}
                      >
                        <IconPlus width={16} height={16} />
                      </button>
                    </div>

                    <div className="w-24 text-right">
                      <p className="text-sm font-semibold">
                        {rupiah(menu.hargaJual * qty)}
                      </p>
                      {qty < menu.minimalPesan && (
                        <p className="mt-0.5 text-[11px] font-semibold text-red-700">
                          min. {menu.minimalPesan}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => hapusKeranjang(menu.id)}
                      className="btn btn-ghost h-9 w-9 p-0 text-ink-muted hover:text-red-700"
                      aria-label={`Hapus ${menu.nama}`}
                    >
                      <IconTrash width={17} height={17} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <select
                value={pilihanTambah}
                onChange={(e) => setPilihanTambah(e.target.value)}
                className="field sm:flex-1"
                aria-label="Pilih menu untuk ditambahkan"
              >
                <option value="">Tambah menu lain…</option>
                {menus
                  .filter((m) => m.tersedia && !keranjang.some((k) => k.menuId === m.id))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama} — {rupiah(m.hargaJual)} {m.satuanJual}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="btn btn-outline btn-md"
                disabled={!pilihanTambah}
                onClick={() => {
                  const menu = menus.find((m) => m.id === pilihanTambah);
                  if (!menu) return;
                  tambahKeranjang(menu.id, menu.minimalPesan);
                  setPilihanTambah("");
                  setGalat((g) => {
                    const { menu: _, ...sisa } = g;
                    return sisa;
                  });
                }}
              >
                <IconPlus width={17} height={17} />
                Tambahkan
              </button>
            </div>

            {galat.menu && (
              <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-red-700">
                <IconAlert width={16} height={16} />
                {galat.menu}
              </p>
            )}
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-xl">2. Data pemesan</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div data-galat={Boolean(galat.nama)}>
                <label className="field-label" htmlFor="nama">
                  Nama pemesan / instansi *
                </label>
                <input
                  id="nama"
                  className="field"
                  value={form.nama}
                  onChange={(e) => ubahField("nama", e.target.value)}
                  placeholder="Contoh: Ibu Rina / PT Sinar Mandiri"
                />
                {galat.nama && <PesanGalat>{galat.nama}</PesanGalat>}
              </div>

              <div data-galat={Boolean(galat.telepon)}>
                <label className="field-label" htmlFor="telepon">
                  Nomor telepon / WhatsApp *
                </label>
                <input
                  id="telepon"
                  inputMode="tel"
                  className="field"
                  value={form.telepon}
                  onChange={(e) => ubahField("telepon", e.target.value)}
                  placeholder="0812-3456-7890"
                />
                {galat.telepon && <PesanGalat>{galat.telepon}</PesanGalat>}
              </div>

              <div data-galat={Boolean(galat.tanggalAcara)}>
                <label className="field-label" htmlFor="tanggal">
                  Tanggal acara *
                </label>
                <input
                  id="tanggal"
                  type="date"
                  min={tanggalPlus(1)}
                  className="field"
                  value={form.tanggalAcara}
                  onChange={(e) => ubahField("tanggalAcara", e.target.value)}
                />
                {galat.tanggalAcara && <PesanGalat>{galat.tanggalAcara}</PesanGalat>}
              </div>

              <div data-galat={Boolean(galat.waktuAntar)}>
                <label className="field-label" htmlFor="waktu">
                  Jam pengantaran *
                </label>
                <input
                  id="waktu"
                  type="time"
                  className="field"
                  value={form.waktuAntar}
                  onChange={(e) => ubahField("waktuAntar", e.target.value)}
                />
                {galat.waktuAntar && <PesanGalat>{galat.waktuAntar}</PesanGalat>}
              </div>
            </div>

            <fieldset className="mt-5">
              <legend className="field-label">Metode penyerahan</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["Antar ke Alamat", "Ambil di Tempat"] as const).map((m) => (
                  <label
                    key={m}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-sm transition-colors ${
                      form.metode === m
                        ? "border-brand-500 bg-brand-50"
                        : "border-line-strong bg-white hover:border-brand-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="metode"
                      value={m}
                      checked={form.metode === m}
                      onChange={() => ubahField("metode", m)}
                      className="mt-0.5 h-4 w-4 accent-brand-700"
                    />
                    <span>
                      <span className="block font-semibold text-ink">{m}</span>
                      <span className="mt-0.5 block text-[13px] text-ink-muted">
                        {m === "Antar ke Alamat"
                          ? "Gratis dalam Kota Bandung, minimal 25 porsi."
                          : "Diambil sendiri di dapur kami sesuai jam yang dipilih."}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {form.metode === "Antar ke Alamat" && (
              <div className="mt-5" data-galat={Boolean(galat.alamat)}>
                <label className="field-label" htmlFor="alamat">
                  Alamat pengantaran *
                </label>
                <textarea
                  id="alamat"
                  rows={3}
                  className="field resize-y"
                  value={form.alamat}
                  onChange={(e) => ubahField("alamat", e.target.value)}
                  placeholder="Nama gedung, jalan, nomor, kelurahan, dan patokan terdekat"
                />
                {galat.alamat && <PesanGalat>{galat.alamat}</PesanGalat>}
              </div>
            )}

            <div className="mt-5">
              <label className="field-label" htmlFor="catatan">
                Catatan tambahan
              </label>
              <textarea
                id="catatan"
                rows={3}
                className="field resize-y"
                value={form.catatan}
                onChange={(e) => ubahField("catatan", e.target.value)}
                placeholder="Contoh: sambal dipisah, 3 porsi tanpa daging, tolong sertakan sendok ekstra"
              />
            </div>
          </section>
        </div>

        {/* Kolom kanan: ringkasan */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <div className="card p-5 sm:p-6">
              <h2 className="font-display text-xl">3. Ringkasan pesanan</h2>

              {baris.length === 0 ? (
                <p className="mt-4 text-sm text-ink-muted">
                  Ringkasan akan muncul setelah Anda memilih menu.
                </p>
              ) : (
                <ul className="mt-4 space-y-2.5 border-b border-line pb-4 text-sm">
                  {baris.map(({ menu, qty }) => (
                    <li key={menu.id} className="flex justify-between gap-4">
                      <span className="text-ink-muted">
                        {menu.nama} <span className="text-ink-muted/80">× {qty}</span>
                      </span>
                      <span className="shrink-0 font-semibold">
                        {rupiah(menu.hargaJual * qty)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Jumlah porsi</dt>
                  <dd className="font-semibold">{totalPorsi}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Ongkos antar dalam kota</dt>
                  <dd className="font-semibold">Gratis</dd>
                </div>
                <div className="flex items-end justify-between border-t border-line pt-3">
                  <dt className="font-semibold">Total perkiraan</dt>
                  <dd className="font-display text-2xl font-semibold text-brand-800">
                    {rupiah(total)}
                  </dd>
                </div>
              </dl>

              <button
                type="submit"
                className="btn btn-primary btn-md mt-6 w-full"
                disabled={sibuk}
              >
                {sibuk ? "Mengirim…" : "Kirim Pesanan"}
                {!sibuk && <IconArrowRight width={18} height={18} />}
              </button>

              {galat.kirim && (
                <p className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] font-semibold text-red-700">
                  <IconAlert className="mt-0.5 shrink-0" width={15} height={15} />
                  {galat.kirim}
                </p>
              )}

              <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
                Belum ada pembayaran di tahap ini. Admin akan menghubungi Anda untuk
                konfirmasi.
              </p>
            </div>

            <div className="card mt-5 p-5">
              <h3 className="text-sm font-bold">Perlu diketahui</h3>
              <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-ink-muted">
                <li className="flex gap-2">
                  <IconCheck className="mt-0.5 shrink-0 text-brand-600" width={15} height={15} />
                  Pesanan di atas 100 porsi sebaiknya dibuat tiga hari sebelum acara.
                </li>
                <li className="flex gap-2">
                  <IconCheck className="mt-0.5 shrink-0 text-brand-600" width={15} height={15} />
                  Jumlah porsi masih bisa diubah paling lambat H-1.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function PesanGalat({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-red-700">
      <IconAlert width={14} height={14} />
      {children}
    </p>
  );
}
