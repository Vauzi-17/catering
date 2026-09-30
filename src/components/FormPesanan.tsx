"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CircleAlert,
  CreditCard,
  Landmark,
  MapPin,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import { IsianAlamat, type NilaiAlamat } from "@/components/akun/IsianAlamat";
import { PesanForm, TanpaSupabase } from "@/components/akun/KerangkaAuth";
import { FotoMenu } from "@/components/Placeholder";
import { LangkahCheckout } from "@/components/pesan/LangkahCheckout";
import { profil as profilUsaha } from "@/data/profil";
import { rupiah, satuanMenu } from "@/lib/format";
import { jarakKm, tanggalJakarta } from "@/lib/pembayaran";
import { bayarDenganSnap, panggilApi } from "@/lib/snap";
import type { Menu } from "@/lib/types";
import { useInfoPengantaran } from "@/lib/useInfoPengantaran";
import { useWajibMasuk } from "@/lib/useWajibMasuk";
import { useData } from "@/store/DataProvider";

type Metode = "Antar ke Alamat" | "Ambil di Tempat";

const pilihanJam = [
  { label: "Pagi", jam: "09:30" },
  { label: "Siang", jam: "11:30" },
  { label: "Sore", jam: "16:30" },
];

export function FormPesanan() {
  const auth = useWajibMasuk();
  const router = useRouter();
  const dapur = useInfoPengantaran();
  const { menus, keranjang, kosongkanKeranjang, bukaKeranjang, siap } = useData();

  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("11:30");
  const [jamLain, setJamLain] = useState(false);
  const [metode, setMetode] = useState<Metode>("Antar ke Alamat");
  const [alamat, setAlamat] = useState<NilaiAlamat>({ alamat: "", patokan: "", titik: null });
  const [simpanAlamat, setSimpanAlamat] = useState(true);
  const [catatan, setCatatan] = useState("");
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [galatKirim, setGalatKirim] = useState("");
  const [tahap, setTahap] = useState<"isi" | "bayar">("isi");

  // Pesan galat sebuah kolom hilang begitu kolom itu diubah.
  const hapusGalat = (...kunci: string[]) =>
    setGalat((g) => {
      if (!kunci.some((k) => k in g)) return g;
      const baru = { ...g };
      kunci.forEach((k) => delete baru[k]);
      return baru;
    });

  // Isian awal dari profil akun, sekali saja supaya ketikan tidak tertimpa.
  const [terisi, setTerisi] = useState(false);
  useEffect(() => {
    const p = auth.profil;
    if (!p || terisi) return;
    setNama(p.nama);
    setTelepon(p.telepon);
    setAlamat({
      alamat: p.alamat,
      patokan: p.patokan,
      titik: p.lat !== null && p.lng !== null ? { lat: p.lat, lng: p.lng } : null,
    });
    setTerisi(true);
  }, [auth.profil, terisi]);

  // Salinan isi keranjang saat tombol bayar ditekan: keranjang dikosongkan
  // sebelum popup pembayaran muncul, tetapi ringkasan tetap harus tampil.
  const [barisBeku, setBarisBeku] = useState<{ menu: Menu; qty: number }[] | null>(null);

  const barisKeranjang = useMemo(
    () =>
      keranjang
        .map((k) => {
          const menu = menus.find((m) => m.id === k.menuId);
          return menu ? { menu, qty: k.qty } : null;
        })
        .filter((v): v is { menu: Menu; qty: number } => v !== null),
    [keranjang, menus],
  );
  const baris = barisBeku ?? barisKeranjang;
  const total = baris.reduce((a, b) => a + b.menu.hargaJual * b.qty, 0);
  const porsi = baris.reduce((a, b) => a + b.qty, 0);
  const diantar = metode === "Antar ke Alamat";

  if (!auth.aktif) {
    return (
      <div className="container-page py-12">
        <TanpaSupabase />
      </div>
    );
  }
  if (!auth.siap || !auth.pengguna || !siap) {
    return <div className="container-page py-14 text-sm text-ink-muted">Memuat…</div>;
  }

  if (baris.length === 0) {
    return (
      <>
        <LangkahCheckout aktif={0} />
        <div className="container-page py-14">
          <div className="kartu mx-auto flex max-w-lg flex-col items-center px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-kabut text-ink-muted">
              <ShoppingBag size={24} strokeWidth={1.8} />
            </span>
            <h1 className="mt-4 text-[26px] font-semibold">Keranjang masih kosong</h1>
            <p className="mt-2 text-sm text-ink-muted">Pilih paket dulu, lalu kembali ke halaman ini.</p>
            <div className="mt-6 flex gap-2">
              <Link href="/menu/" className="tombol tombol-md tombol-jingga">
                Lihat Menu
                <ArrowRight size={17} />
              </Link>
              <button type="button" onClick={bukaKeranjang} className="tombol tombol-md tombol-garis">
                Buka keranjang
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  function validasi() {
    const g: Record<string, string> = {};
    if (nama.trim().length < 3) g.nama = "Nama pemesan minimal 3 huruf.";
    if (!/^[0-9+\-\s()]{9,}$/.test(telepon.trim())) g.telepon = "Masukkan nomor WhatsApp yang aktif.";
    if (!tanggal) g.tanggal = "Pilih tanggal acara.";
    else if (tanggal < tanggalJakarta(new Date(), 1)) g.tanggal = "Tanggal acara paling cepat besok (H-1).";
    if (!/^\d{2}:\d{2}$/.test(jam)) g.jam = "Pilih jam pengantaran.";
    if (diantar) {
      if (!alamat.titik) g.titik = "Tandai lokasi acara di peta.";
      else if (jarakKm(dapur, alamat.titik) > dapur.radiusKm) {
        g.titik = "Lokasi di luar area layanan. Pilih lokasi lain atau ambil di tempat.";
      }
      if (alamat.alamat.trim().length < 10) g.alamat = "Tuliskan alamat lengkap lokasi acara.";
    }
    const kurang = baris.find((b) => b.qty < b.menu.minimalPesan);
    if (kurang) g.menu = `${kurang.menu.nama} minimal ${kurang.menu.minimalPesan} ${satuanMenu(kurang.menu)}.`;
    setGalat(g);
    if (Object.keys(g).length) {
      window.setTimeout(() => {
        document
          .querySelector<HTMLElement>("[data-galat='true']")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
    }
    return Object.keys(g).length === 0;
  }

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalatKirim("");
    if (!validasi()) return;

    setTahap("bayar");
    setBarisBeku(baris);
    try {
      const { ok, data } = await panggilApi<{ kode?: string; token?: string; redirectUrl?: string }>(
        "/api/pesanan/",
        await auth.token(),
        {
          items: baris.map((b) => ({ menuId: b.menu.id, qty: b.qty })),
          nama: nama.trim(),
          telepon: telepon.trim(),
          tanggalAcara: tanggal,
          waktuAntar: jam,
          metode,
          alamat: alamat.alamat.trim(),
          patokan: alamat.patokan.trim(),
          lat: alamat.titik?.lat ?? null,
          lng: alamat.titik?.lng ?? null,
          catatan: catatan.trim(),
        },
      );

      if (!ok && !data.kode) {
        setGalatKirim(data.galat ?? "Pesanan gagal dibuat. Coba lagi.");
        setTahap("isi");
        setBarisBeku(null);
        return;
      }

      // Pesanan sudah tersimpan: keranjang dikosongkan, alamat disimpan bila diminta.
      kosongkanKeranjang();
      if (diantar && simpanAlamat) {
        void auth
          .simpanProfil({
            nama: nama.trim(),
            telepon: telepon.trim(),
            alamat: alamat.alamat.trim(),
            patokan: alamat.patokan.trim(),
            lat: alamat.titik?.lat ?? null,
            lng: alamat.titik?.lng ?? null,
          })
          .catch(() => {});
      }

      const tujuan = `/pesanan/${data.kode}/`;
      if (!data.token || !data.redirectUrl) {
        router.push(`${tujuan}?galat=${encodeURIComponent(data.galat ?? "")}`);
        return;
      }

      await bayarDenganSnap(data.token, data.redirectUrl);
      // Apa pun hasil popup, status sebenarnya dibaca ulang di halaman pesanan.
      await panggilApi(`/api/pesanan/${data.kode}/sinkron/`, await auth.token()).catch(() => null);
      router.push(`${tujuan}?baru=1`);
    } catch {
      setGalatKirim("Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.");
      setTahap("isi");
      setBarisBeku(null);
    }
  }

  return (
    <>
      <LangkahCheckout aktif={tahap === "isi" ? 1 : 2} />

      <form onSubmit={kirim} noValidate className="container-page py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 space-y-5 lg:col-span-7 xl:col-span-8">
            <h1 className="text-[32px] font-semibold leading-tight sm:text-[40px]">Data Acara</h1>

            <Bagian nomor="01" judul="Pemesan & jadwal" deskripsi="Untuk konfirmasi pesanan dan koordinasi di lokasi.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Isian id="nama" label="Nama pemesan / instansi" galat={galat.nama}>
                  <input id="nama" className="isian" value={nama} onChange={(e) => { setNama(e.target.value); hapusGalat("nama"); }} autoComplete="name" />
                </Isian>
                <Isian id="telepon" label="Nomor WhatsApp" galat={galat.telepon}>
                  <input id="telepon" inputMode="tel" className="isian" value={telepon} onChange={(e) => { setTelepon(e.target.value); hapusGalat("telepon"); }} autoComplete="tel" />
                </Isian>
                <Isian id="tanggal" label="Tanggal acara" galat={galat.tanggal}>
                  <input id="tanggal" type="date" min={tanggalJakarta(new Date(), 1)} className="isian" value={tanggal} onChange={(e) => { setTanggal(e.target.value); hapusGalat("tanggal"); }} />
                </Isian>
              </div>

              <fieldset className="mt-5" data-galat={Boolean(galat.jam)}>
                <legend className="isian-label">Jam pengantaran</legend>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {pilihanJam.map((p) => (
                    <PilihanRadio
                      key={p.jam}
                      nama="jam"
                      dipilih={!jamLain && jam === p.jam}
                      onPilih={() => {
                        setJamLain(false);
                        setJam(p.jam);
                      }}
                    >
                      {p.label} <span className="tabular-nums text-ink-muted">{p.jam.replace(":", ".")}</span>
                    </PilihanRadio>
                  ))}
                  <PilihanRadio nama="jam" dipilih={jamLain} onPilih={() => setJamLain(true)}>
                    Jam lain
                  </PilihanRadio>
                </div>
                {jamLain && (
                  <input type="time" aria-label="Jam pengantaran lain" className="isian mt-2.5 sm:w-48" value={jam} onChange={(e) => setJam(e.target.value)} />
                )}
                {galat.jam && <p className="mt-1.5 text-[12.5px] font-semibold text-red-700">{galat.jam}</p>}
              </fieldset>
            </Bagian>

            <Bagian nomor="02" judul="Pengantaran" deskripsi="Ongkir gratis untuk lokasi di dalam area layanan.">
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { nilai: "Antar ke Alamat", ikon: MapPin, isi: "Diantar kurir ke lokasi acara." },
                    { nilai: "Ambil di Tempat", ikon: Store, isi: `Diambil di ${profilUsaha.alamatSingkat}.` },
                  ] as const
                ).map(({ nilai, ikon: Ikon, isi }) => (
                  <label
                    key={nilai}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                      metode === nilai ? "border-zamrud-500 bg-zamrud-50" : "border-kabut-line bg-kabut hover:border-zamrud-200"
                    }`}
                  >
                    <input type="radio" name="metode" checked={metode === nilai} onChange={() => setMetode(nilai)} className="mt-1 h-4 w-4 accent-zamrud-700" />
                    <span>
                      <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                        <Ikon size={16} strokeWidth={1.8} className="text-zamrud-700" />
                        {nilai}
                      </span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-ink-muted">{isi}</span>
                    </span>
                  </label>
                ))}
              </div>

              {diantar && (
                <div className="mt-6">
                  <IsianAlamat
                    nilai={alamat}
                    onUbah={(n) => {
                      if (n.alamat !== alamat.alamat) hapusGalat("alamat");
                      if (n.titik !== alamat.titik) hapusGalat("titik");
                      setAlamat(n);
                    }}
                    galat={{ alamat: galat.alamat, titik: galat.titik }}
                  />
                  <label className="mt-4 flex items-center gap-2.5 text-[14px] text-ink-soft">
                    <input type="checkbox" checked={simpanAlamat} onChange={(e) => setSimpanAlamat(e.target.checked)} className="h-4 w-4 accent-zamrud-700" />
                    Simpan sebagai alamat utama di akun saya
                  </label>
                </div>
              )}

              <div className="mt-5">
                <label className="isian-label" htmlFor="catatan">
                  Catatan <span className="font-normal text-ink-muted">(opsional)</span>
                </label>
                <textarea id="catatan" rows={3} className="isian resize-y" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Contoh: sambal dipisah, 3 porsi tanpa daging" />
              </div>
            </Bagian>

            <Bagian
              nomor="03"
              judul="Pembayaran"
              deskripsi="Dibayar penuh sekarang lewat Midtrans. Status pesanan berubah otomatis begitu pembayaran masuk."
            >
              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  { ikon: QrCode, teks: "QRIS" },
                  { ikon: Landmark, teks: "Virtual Account" },
                  { ikon: Wallet, teks: "GoPay / ShopeePay" },
                  { ikon: CreditCard, teks: "Kartu" },
                ].map(({ ikon: Ikon, teks }) => (
                  <li key={teks} className="flex items-center gap-2.5 rounded-xl border border-kabut-line bg-kabut px-3.5 py-3 text-[13px] font-semibold text-ink-soft">
                    <Ikon size={17} strokeWidth={1.8} className="shrink-0 text-zamrud-700" />
                    {teks}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[12px] text-ink-muted">
                Metode yang muncul di popup mengikuti yang diaktifkan pada akun Midtrans.
              </p>
            </Bagian>
          </div>

          <div className="min-w-0 lg:col-span-5 xl:col-span-4">
            <div className="kartu p-5 sm:p-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[22px] font-semibold">Ringkasan</h2>
                <button type="button" onClick={bukaKeranjang} className="text-[13px] font-semibold text-zamrud-700 hover:underline">
                  Ubah keranjang
                </button>
              </div>

              <ul className="mt-4 divide-y divide-kabut-line border-b border-kabut-line" data-galat={Boolean(galat.menu)}>
                {baris.map(({ menu, qty }) => (
                  <li key={menu.id} className="flex items-center gap-3 py-3 first:pt-0">
                    <div className="w-14 shrink-0 overflow-hidden rounded-lg">
                      <FotoMenu src={menu.foto} nama={menu.nama} rasio="aspect-square" mini />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold">{menu.nama}</p>
                      <p className="text-[12px] text-ink-muted">
                        {qty} {satuanMenu(menu)} × {rupiah(menu.hargaJual)}
                      </p>
                    </div>
                    <p className="shrink-0 text-[14px] font-semibold tabular-nums">{rupiah(menu.hargaJual * qty)}</p>
                  </li>
                ))}
              </ul>
              {galat.menu && <p className="mt-2 text-[12.5px] font-semibold text-red-700">{galat.menu}</p>}

              <dl className="mt-4 space-y-2 text-[14px]">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Subtotal ({porsi} porsi)</dt>
                  <dd className="tabular-nums">{rupiah(total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="inline-flex items-center gap-1.5 text-ink-soft">
                    Ongkir <Truck size={14} className="text-ink-muted" />
                  </dt>
                  <dd>
                    <span className="rounded-md bg-zamrud-50 px-2 py-0.5 text-[12px] font-bold text-zamrud-700">GRATIS</span>
                  </dd>
                </div>
              </dl>

              <div className="mt-4 rounded-xl bg-kabut px-4 py-4">
                <p className="text-[13px] font-medium text-ink-muted">Total bayar</p>
                <p className="mt-1 font-display text-[32px] font-semibold leading-none tabular-nums text-zamrud-800">
                  {rupiah(total)}
                </p>
              </div>

              {galatKirim && (
                <div className="mt-4">
                  <PesanForm jenis="galat">
                    <CircleAlert size={14} className="mr-1 inline" />
                    {galatKirim}
                  </PesanForm>
                </div>
              )}

              <button type="submit" disabled={tahap === "bayar"} className="tombol tombol-blok tombol-jingga mt-5">
                {tahap === "bayar" ? "Menyiapkan pembayaran…" : "Bayar Sekarang"}
                {tahap === "isi" && <ArrowRight size={18} />}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-muted">
                <ShieldCheck size={14} className="shrink-0 text-zamrud-600" />
                Pembayaran diproses aman oleh Midtrans
              </p>
            </div>
          </div>
        </div>
      </form>
    </>
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

function Isian({ id, label, galat, children }: { id: string; label: string; galat?: string; children: React.ReactNode }) {
  return (
    <div data-galat={Boolean(galat)}>
      <label className="isian-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {galat && <p className="mt-1.5 text-[12.5px] font-semibold text-red-700">{galat}</p>}
    </div>
  );
}

function PilihanRadio({
  nama,
  dipilih,
  onPilih,
  children,
}: {
  nama: string;
  dipilih: boolean;
  onPilih: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[14px] transition-colors ${
        dipilih ? "border-zamrud-500 bg-zamrud-50 text-zamrud-800" : "border-kabut-line bg-kabut text-ink-soft hover:border-zamrud-200"
      }`}
    >
      <input type="radio" name={nama} checked={dipilih} onChange={onPilih} className="h-4 w-4 accent-zamrud-700" />
      <span>{children}</span>
    </label>
  );
}
