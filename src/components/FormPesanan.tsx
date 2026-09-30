"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Headset,
  Landmark,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Wallet,
} from "lucide-react";
import { IconWhatsapp } from "@/components/Icons";
import { FotoMenu } from "@/components/Placeholder";
import { LangkahCheckout } from "@/components/pesan/LangkahCheckout";
import { PesananBerhasil } from "@/components/pesan/PesananBerhasil";
import { RingkasanPesanan, type BarisKeranjang } from "@/components/pesan/RingkasanPesanan";
import { profil } from "@/data/profil";
import { rupiah, satuanMenu, tanggalPlus } from "@/lib/format";
import type { Pesanan } from "@/lib/types";
import { useData } from "@/store/DataProvider";

type Metode = "Antar ke Alamat" | "Ambil di Tempat";

interface Formulir {
  nama: string;
  telepon: string;
  alamat: string;
  tanggalAcara: string;
  waktuAntar: string;
  metode: Metode;
  catatan: string;
}

const formAwal: Formulir = {
  nama: "",
  telepon: "",
  alamat: "",
  tanggalAcara: "",
  waktuAntar: "11:30",
  metode: "Antar ke Alamat",
  catatan: "",
};

const pilihanJam = [
  { label: "Pagi", jam: "09:30" },
  { label: "Siang", jam: "11:30" },
  { label: "Sore", jam: "16:30" },
];

type Langkah = "keranjang" | "data";

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

  const [langkah, setLangkah] = useState<Langkah>("keranjang");
  const [form, setForm] = useState<Formulir>(formAwal);
  const [jamLain, setJamLain] = useState(false);
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [pilihanTambah, setPilihanTambah] = useState("");
  const [berhasil, setBerhasil] = useState<Pesanan | null>(null);

  const baris = useMemo<BarisKeranjang[]>(
    () =>
      keranjang
        .map((k) => {
          const menu = menus.find((m) => m.id === k.menuId);
          return menu ? { menu, qty: k.qty } : null;
        })
        .filter((v): v is BarisKeranjang => v !== null),
    [keranjang, menus],
  );

  const diantar = form.metode === "Antar ke Alamat";

  function ubahField<K extends keyof Formulir>(kunci: K, nilai: Formulir[K]) {
    setForm((f) => ({ ...f, [kunci]: nilai }));
    setGalat((g) => {
      const { [kunci]: _, ...sisa } = g;
      return sisa;
    });
  }

  function gulirKeGalat() {
    window.setTimeout(() => {
      document
        .querySelector<HTMLElement>("[data-galat='true']")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  }

  function validasiKeranjang() {
    const g: Record<string, string> = {};
    if (baris.length === 0) g.menu = "Pilih minimal satu menu terlebih dahulu.";
    const kurang = baris.find(({ menu, qty }) => qty < menu.minimalPesan);
    if (kurang)
      g.menu = `${kurang.menu.nama} minimal ${kurang.menu.minimalPesan} ${satuanMenu(kurang.menu)}.`;
    setGalat(g);
    return Object.keys(g).length === 0;
  }

  function validasiData() {
    const g: Record<string, string> = {};
    if (form.nama.trim().length < 3) g.nama = "Nama pemesan minimal 3 huruf.";
    if (!/^[0-9+\-\s()]{9,}$/.test(form.telepon.trim()))
      g.telepon = "Masukkan nomor WhatsApp yang bisa dihubungi.";
    if (diantar && form.alamat.trim().length < 10)
      g.alamat = "Tuliskan alamat lengkap beserta patokan.";
    if (!form.tanggalAcara) g.tanggalAcara = "Pilih tanggal acara.";
    else if (form.tanggalAcara < tanggalPlus(1))
      g.tanggalAcara = "Pesanan paling cepat untuk besok (H-1).";
    if (!form.waktuAntar) g.waktuAntar = "Pilih jam pengantaran.";
    setGalat(g);
    return Object.keys(g).length === 0;
  }

  function lanjutKeData() {
    if (!validasiKeranjang()) {
      gulirKeGalat();
      return;
    }
    setLangkah("data");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function kembaliKeKeranjang() {
    setGalat({});
    setLangkah("keranjang");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (!validasiKeranjang()) {
      setLangkah("keranjang");
      gulirKeGalat();
      return;
    }
    if (!validasiData()) {
      gulirKeGalat();
      return;
    }

    let pesananBaru;
    try {
      pesananBaru = await buatPesanan({
        nama: form.nama.trim(),
        telepon: form.telepon.trim(),
        alamat: diantar ? form.alamat.trim() : "Diambil di dapur Asri Catering",
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
    setJamLain(false);
    setLangkah("keranjang");
    setBerhasil(pesananBaru);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (berhasil) {
    return (
      <>
        <LangkahCheckout aktif={2} />
        <PesananBerhasil pesanan={berhasil} />
      </>
    );
  }

  const menuTambahan = menus.filter(
    (m) => m.tersedia && !keranjang.some((k) => k.menuId === m.id),
  );

  return (
    <>
      <LangkahCheckout aktif={langkah === "keranjang" ? 0 : 1} />

      <form onSubmit={kirim} noValidate className="container-page py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-7 xl:col-span-8">
            {langkah === "keranjang" ? (
              <>
                <h1 className="text-[32px] font-semibold leading-tight sm:text-[40px]">
                  Rincian Pesanan
                </h1>
                <p className="mt-2 text-[15px] text-ink-soft">
                  Atur jumlah porsi tiap paket. Semua masakan diolah pagi di hari pengantaran.
                </p>

                <div className="mt-7 space-y-4" data-galat={Boolean(galat.menu)}>
                  {!siap ? (
                    <p className="kartu p-6 text-sm text-ink-muted">Memuat keranjang…</p>
                  ) : baris.length === 0 ? (
                    <div className="kartu flex flex-col items-center px-6 py-14 text-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-kabut text-ink-muted">
                        <ShoppingBag size={22} strokeWidth={1.8} />
                      </span>
                      <h2 className="mt-4 font-sans text-[17px] font-semibold">
                        Keranjang masih kosong
                      </h2>
                      <p className="mt-2 max-w-sm text-sm text-ink-muted">
                        Pilih paket dari katalog, atau tambahkan langsung lewat pilihan di bawah.
                      </p>
                      <Link href="/menu" className="tombol tombol-md tombol-jingga mt-6">
                        Lihat Menu
                        <ArrowRight size={17} />
                      </Link>
                    </div>
                  ) : (
                    baris.map(({ menu, qty }) => (
                      <ItemKeranjang
                        key={menu.id}
                        baris={{ menu, qty }}
                        onUbah={(n) => ubahQtyKeranjang(menu.id, n)}
                        onHapus={() => hapusKeranjang(menu.id)}
                      />
                    ))
                  )}

                  {galat.menu && (
                    <p className="flex items-center gap-2 text-[13px] font-semibold text-red-700">
                      <CircleAlert size={16} />
                      {galat.menu}
                    </p>
                  )}
                </div>

                {menuTambahan.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-kabut-line bg-kabut-deep p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="inline-flex items-center gap-2 font-sans text-[16px] font-semibold">
                        <Plus size={18} className="text-zamrud-700" />
                        Tambah paket lain
                      </h2>
                      <Link
                        href="/menu"
                        className="text-[13px] font-semibold text-zamrud-700 hover:text-zamrud-800"
                      >
                        Buka katalog
                      </Link>
                    </div>
                    <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                      <select
                        value={pilihanTambah}
                        onChange={(e) => setPilihanTambah(e.target.value)}
                        className="isian h-11 min-w-0 bg-white sm:flex-1"
                        aria-label="Pilih paket untuk ditambahkan"
                      >
                        <option value="">Pilih paket…</option>
                        {menuTambahan.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nama} — {rupiah(m.hargaJual)} {m.satuanJual}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="tombol tombol-md tombol-garis"
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
                        <Plus size={16} />
                        Tambahkan
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={kembaliKeKeranjang}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-zamrud-700"
                >
                  <ArrowLeft size={15} />
                  Kembali ke keranjang
                </button>

                <h1 className="sr-only">Data acara</h1>

                <Bagian
                  nomor="01"
                  judul="Data Pemesan"
                  deskripsi="Untuk konfirmasi pesanan dan koordinasi di lokasi."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2" data-galat={Boolean(galat.nama)}>
                      <label className="isian-label" htmlFor="nama">
                        Nama pemesan / instansi
                      </label>
                      <input
                        id="nama"
                        className="isian"
                        value={form.nama}
                        onChange={(e) => ubahField("nama", e.target.value)}
                        placeholder="Contoh: Ibu Rina / PT Sinar Mandiri"
                        autoComplete="name"
                      />
                      {galat.nama && <PesanGalat>{galat.nama}</PesanGalat>}
                    </div>

                    <div data-galat={Boolean(galat.telepon)}>
                      <label className="isian-label" htmlFor="telepon">
                        Nomor WhatsApp
                      </label>
                      <input
                        id="telepon"
                        inputMode="tel"
                        className="isian"
                        value={form.telepon}
                        onChange={(e) => ubahField("telepon", e.target.value)}
                        placeholder="0812-3456-7890"
                        autoComplete="tel"
                      />
                      {galat.telepon && <PesanGalat>{galat.telepon}</PesanGalat>}
                    </div>

                    <div data-galat={Boolean(galat.tanggalAcara)}>
                      <label className="isian-label" htmlFor="tanggal">
                        Tanggal acara
                      </label>
                      <input
                        id="tanggal"
                        type="date"
                        min={tanggalPlus(1)}
                        className="isian"
                        value={form.tanggalAcara}
                        onChange={(e) => ubahField("tanggalAcara", e.target.value)}
                      />
                      {galat.tanggalAcara && <PesanGalat>{galat.tanggalAcara}</PesanGalat>}
                    </div>
                  </div>

                  <fieldset className="mt-5" data-galat={Boolean(galat.waktuAntar)}>
                    <legend className="isian-label">Jam pengantaran</legend>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {pilihanJam.map((p) => {
                        const dipilih = !jamLain && form.waktuAntar === p.jam;
                        return (
                          <label
                            key={p.jam}
                            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[14px] transition-colors ${
                              dipilih
                                ? "border-zamrud-500 bg-zamrud-50 text-zamrud-800"
                                : "border-kabut-line bg-kabut text-ink-soft hover:border-zamrud-200"
                            }`}
                          >
                            <input
                              type="radio"
                              name="jam"
                              checked={dipilih}
                              onChange={() => {
                                setJamLain(false);
                                ubahField("waktuAntar", p.jam);
                              }}
                              className="h-4 w-4 accent-zamrud-700"
                            />
                            <span>
                              {p.label}{" "}
                              <span className="tabular-nums text-ink-muted">
                                {p.jam.replace(":", ".")}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                      <label
                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[14px] transition-colors ${
                          jamLain
                            ? "border-zamrud-500 bg-zamrud-50 text-zamrud-800"
                            : "border-kabut-line bg-kabut text-ink-soft hover:border-zamrud-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="jam"
                          checked={jamLain}
                          onChange={() => setJamLain(true)}
                          className="h-4 w-4 accent-zamrud-700"
                        />
                        Jam lain
                      </label>
                    </div>
                    {jamLain && (
                      <input
                        type="time"
                        aria-label="Jam pengantaran lain"
                        className="isian mt-2.5 sm:w-48"
                        value={form.waktuAntar}
                        onChange={(e) => ubahField("waktuAntar", e.target.value)}
                      />
                    )}
                    {galat.waktuAntar && <PesanGalat>{galat.waktuAntar}</PesanGalat>}
                  </fieldset>
                </Bagian>

                <Bagian
                  nomor="02"
                  judul="Pengantaran"
                  deskripsi="Diantar ke lokasi acara, atau diambil sendiri di dapur kami."
                >
                  <fieldset>
                    <legend className="sr-only">Metode penyerahan</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(
                        [
                          {
                            nilai: "Antar ke Alamat",
                            ikon: MapPin,
                            isi: `Gratis dalam Kota Bandung untuk minimal 25 porsi.`,
                          },
                          {
                            nilai: "Ambil di Tempat",
                            ikon: Store,
                            isi: `Diambil sendiri di ${profil.alamatSingkat}.`,
                          },
                        ] as const
                      ).map(({ nilai, ikon: Ikon, isi }) => {
                        const dipilih = form.metode === nilai;
                        return (
                          <label
                            key={nilai}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                              dipilih
                                ? "border-zamrud-500 bg-zamrud-50"
                                : "border-kabut-line bg-kabut hover:border-zamrud-200"
                            }`}
                          >
                            <input
                              type="radio"
                              name="metode"
                              checked={dipilih}
                              onChange={() => ubahField("metode", nilai)}
                              className="mt-1 h-4 w-4 accent-zamrud-700"
                            />
                            <span>
                              <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                                <Ikon size={16} strokeWidth={1.8} className="text-zamrud-700" />
                                {nilai}
                              </span>
                              <span className="mt-1 block text-[13px] leading-relaxed text-ink-muted">
                                {isi}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  {diantar && (
                    <div className="mt-5" data-galat={Boolean(galat.alamat)}>
                      <label className="isian-label" htmlFor="alamat">
                        Alamat lengkap lokasi acara
                      </label>
                      <textarea
                        id="alamat"
                        rows={3}
                        className="isian resize-y"
                        value={form.alamat}
                        onChange={(e) => ubahField("alamat", e.target.value)}
                        placeholder="Nama gedung, jalan, nomor, lantai atau ruang, dan patokan terdekat"
                      />
                      {galat.alamat && <PesanGalat>{galat.alamat}</PesanGalat>}
                    </div>
                  )}

                  <div className="mt-5">
                    <label className="isian-label" htmlFor="catatan">
                      Catatan <span className="font-normal text-ink-muted">(opsional)</span>
                    </label>
                    <textarea
                      id="catatan"
                      rows={3}
                      className="isian resize-y"
                      value={form.catatan}
                      onChange={(e) => ubahField("catatan", e.target.value)}
                      placeholder="Contoh: sambal dipisah, 3 porsi tanpa daging, masuk lewat pintu samping"
                    />
                  </div>
                </Bagian>

                <Bagian
                  nomor="03"
                  judul="Pembayaran"
                  deskripsi="Tidak ada pembayaran di halaman ini. Admin mengirimkan rincian setelah pesanan dikonfirmasi."
                >
                  <ul className="grid gap-3 sm:grid-cols-2">
                    <li className="flex gap-3 rounded-xl border border-kabut-line bg-kabut p-4">
                      <Wallet size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-zamrud-700" />
                      <span className="text-[13px] leading-relaxed text-ink-muted">
                        <span className="block text-[15px] font-semibold text-ink">Uang muka 50%</span>
                        Dibayar saat pesanan dikonfirmasi, sisanya paling lambat saat diantar.
                      </span>
                    </li>
                    <li className="flex gap-3 rounded-xl border border-kabut-line bg-kabut p-4">
                      <Landmark size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-zamrud-700" />
                      <span className="text-[13px] leading-relaxed text-ink-muted">
                        <span className="block text-[15px] font-semibold text-ink">Transfer atau tunai</span>
                        Keduanya diterima. Detailnya disampaikan admin saat konfirmasi.
                      </span>
                    </li>
                  </ul>
                </Bagian>
              </div>
            )}
          </div>

          {/* Kolom kanan: ringkasan */}
          <div className="min-w-0 lg:col-span-5 xl:col-span-4">
            <div className="space-y-4 lg:sticky lg:top-24">
              <RingkasanPesanan
                baris={baris}
                diantar={diantar}
                tampilkanItem={langkah === "data"}
              >
                {langkah === "keranjang" ? (
                  <button
                    key="lanjut"
                    type="button"
                    onClick={lanjutKeData}
                    disabled={!siap || baris.length === 0}
                    className="tombol tombol-blok tombol-jingga mt-5"
                  >
                    Lanjut ke Data Acara
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    key="kirim"
                    type="submit"
                    disabled={sibuk}
                    className="tombol tombol-blok tombol-jingga mt-5"
                  >
                    {sibuk ? "Mengirim…" : "Kirim Pesanan"}
                    {!sibuk && <ArrowRight size={18} />}
                  </button>
                )}

                {galat.kirim && (
                  <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-[13px] font-semibold text-red-700">
                    <CircleAlert size={15} className="mt-0.5 shrink-0" />
                    {galat.kirim}
                  </p>
                )}

                <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-muted">
                  <ShieldCheck size={14} className="shrink-0 text-zamrud-600" />
                  Belum ada pembayaran di tahap ini
                </p>
              </RingkasanPesanan>

              <a
                href={`https://wa.me/${profil.teleponRaw}?text=${encodeURIComponent(
                  "Halo Asri Catering, saya ingin bertanya soal pesanan untuk instansi.",
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-kabut-line bg-kabut-deep p-4 transition-colors hover:border-zamrud-200"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zamrud-700">
                  <Headset size={19} strokeWidth={1.8} />
                </span>
                <span className="flex-1 text-[13px] leading-snug text-ink-soft">
                  <span className="block font-semibold text-ink">Pesanan instansi atau lebih dari 100 porsi?</span>
                  Tanyakan dulu lewat WhatsApp.
                </span>
                <IconWhatsapp width={18} height={18} className="shrink-0 text-zamrud-700" />
              </a>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

function ItemKeranjang({
  baris: { menu, qty },
  onUbah,
  onHapus,
}: {
  baris: BarisKeranjang;
  onUbah: (qty: number) => void;
  onHapus: () => void;
}) {
  const satuan = satuanMenu(menu);
  const kurang = qty < menu.minimalPesan;

  return (
    <div className="kartu flex gap-4 p-4 sm:p-5">
      <div className="w-20 shrink-0 overflow-hidden rounded-xl sm:w-24">
        <FotoMenu src={menu.foto} nama={menu.nama} rasio="aspect-square" mini />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-jingga-700">{menu.kategori}</p>
          <h3 className="mt-0.5 text-[19px] font-semibold leading-snug sm:text-[21px]">
            {menu.nama}
          </h3>
          <p className="mt-1 text-[13px] text-ink-muted">
            {rupiah(menu.hargaJual)} / {satuan} · min. {menu.minimalPesan}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2.5 sm:items-end">
          <p className="whitespace-nowrap text-[18px] font-bold tabular-nums text-zamrud-800">
            {rupiah(menu.hargaJual * qty)}
          </p>
          <div className="flex items-center gap-2">
            <div className="inline-flex h-9 items-center rounded-lg border border-kabut-line bg-kabut">
              <button
                type="button"
                onClick={() => onUbah(qty - 5)}
                className="flex h-full w-9 items-center justify-center text-ink-soft hover:text-ink"
                aria-label={`Kurangi jumlah ${menu.nama}`}
              >
                <Minus size={15} />
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={qty}
                onChange={(e) => onUbah(Number(e.target.value) || 0)}
                className="h-full w-12 border-x border-kabut-line bg-white text-center text-[14px] font-semibold tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                aria-label={`Jumlah ${menu.nama}`}
              />
              <button
                type="button"
                onClick={() => onUbah(qty + 5)}
                className="flex h-full w-9 items-center justify-center text-ink-soft hover:text-ink"
                aria-label={`Tambah jumlah ${menu.nama}`}
              >
                <Plus size={15} />
              </button>
            </div>
            <button
              type="button"
              onClick={onHapus}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-red-50 hover:text-red-700"
              aria-label={`Hapus ${menu.nama}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
          {kurang && (
            <p className="text-[12px] font-semibold text-red-700 sm:text-right">
              Minimal {menu.minimalPesan} {satuan}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Bagian({
  nomor,
  judul,
  deskripsi,
  children,
}: {
  nomor: string;
  judul: string;
  deskripsi: string;
  children: React.ReactNode;
}) {
  return (
    <section className="kartu p-5 sm:p-7">
      <div className="flex gap-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zamrud-50 text-[12px] font-bold tabular-nums text-zamrud-700">
          {nomor}
        </span>
        <div>
          <h2 className="font-sans text-[19px] font-semibold text-ink">{judul}</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">{deskripsi}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function PesanGalat({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-red-700">
      <CircleAlert size={14} />
      {children}
    </p>
  );
}
