"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KeyRound, LogOut, Receipt } from "lucide-react";
import { IsianAlamat, type NilaiAlamat } from "@/components/akun/IsianAlamat";
import { PesanForm, TanpaSupabase } from "@/components/akun/KerangkaAuth";
import { jarakKm } from "@/lib/pembayaran";
import { useInfoPengantaran } from "@/lib/useInfoPengantaran";
import { useWajibMasuk } from "@/lib/useWajibMasuk";
import { pesanAuth } from "@/store/AuthProvider";
import { useBahasa } from "@/store/BahasaProvider";

export function HalamanAkun() {
  const auth = useWajibMasuk();
  const { bahasa, t } = useBahasa();
  const dapur = useInfoPengantaran();
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [alamat, setAlamat] = useState<NilaiAlamat>({ alamat: "", patokan: "", titik: null });
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [pesan, setPesan] = useState<{ jenis: "galat" | "sukses"; teks: string } | null>(null);
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    const p = auth.profil;
    if (!p) return;
    setNama(p.nama);
    setTelepon(p.telepon);
    setAlamat({
      alamat: p.alamat,
      patokan: p.patokan,
      titik: p.lat !== null && p.lng !== null ? { lat: p.lat, lng: p.lng } : null,
    });
  }, [auth.profil]);

  if (!auth.aktif) {
    return (
      <div className="container-page py-12">
        <TanpaSupabase />
      </div>
    );
  }
  if (!auth.siap || !auth.pengguna) {
    return <div className="container-page py-14 text-sm text-ink-muted">{t("Memuat akun…", "Loading account…")}</div>;
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setPesan(null);
    const g: Record<string, string> = {};
    if (nama.trim().length < 3) g.nama = t("Nama minimal 3 huruf.", "Name must be at least 3 characters.");
    if (!/^[0-9+\-\s()]{9,}$/.test(telepon.trim())) g.telepon = t("Masukkan nomor WhatsApp yang aktif.", "Enter an active WhatsApp number.");
    if (alamat.titik && jarakKm(dapur, alamat.titik) > dapur.radiusKm) {
      g.titik = t(
        "Lokasi di luar area layanan. Anda tetap bisa menyimpannya, tapi pesanan antar tidak dapat dibuat ke lokasi ini.",
        "This location is outside our service area. You can still save it, but delivery orders to it are not possible.",
      );
    }
    setGalat(g);
    if (g.nama || g.telepon) return;

    setSibuk(true);
    try {
      await auth.simpanProfil({
        nama: nama.trim(),
        telepon: telepon.trim(),
        alamat: alamat.alamat.trim(),
        patokan: alamat.patokan.trim(),
        lat: alamat.titik?.lat ?? null,
        lng: alamat.titik?.lng ?? null,
      });
      setPesan({ jenis: "sukses", teks: t("Profil dan alamat tersimpan.", "Profile and address saved.") });
    } catch (err) {
      setPesan({ jenis: "galat", teks: pesanAuth(err, bahasa) });
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="container-page grid gap-8 py-10 sm:py-12 lg:grid-cols-[1fr_300px]">
      <form onSubmit={simpan} className="kartu space-y-6 p-5 sm:p-8">
        <div>
          <h1 className="text-[30px] font-semibold leading-tight sm:text-[36px]">{t("Akun Saya", "My Account")}</h1>
          <p className="mt-1 text-[14px] text-ink-muted">{auth.pengguna.email}</p>
        </div>

        {pesan && <PesanForm jenis={pesan.jenis}>{pesan.teks}</PesanForm>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="isian-label" htmlFor="nama">{t("Nama lengkap", "Full name")}</label>
            <input id="nama" className="isian" value={nama} onChange={(e) => setNama(e.target.value)} />
            {galat.nama && <p className="mt-1.5 text-[12.5px] font-semibold text-red-700">{galat.nama}</p>}
          </div>
          <div>
            <label className="isian-label" htmlFor="telepon">{t("Nomor WhatsApp", "WhatsApp number")}</label>
            <input id="telepon" inputMode="tel" className="isian" value={telepon} onChange={(e) => setTelepon(e.target.value)} />
            {galat.telepon && <p className="mt-1.5 text-[12.5px] font-semibold text-red-700">{galat.telepon}</p>}
          </div>
        </div>

        <div className="border-t border-kabut-line pt-6">
          <h2 className="font-sans text-[18px] font-semibold">{t("Alamat pengantaran utama", "Main delivery address")}</h2>
          <p className="mt-1 text-[13px] text-ink-muted">
            {t("Otomatis terisi saat memesan dan masih bisa diubah per pesanan.", "Filled in automatically when ordering, and can still be changed per order.")}
          </p>
          <div className="mt-5">
            <IsianAlamat nilai={alamat} onUbah={setAlamat} galat={{ titik: galat.titik }} />
          </div>
        </div>

        <button type="submit" disabled={sibuk} className="tombol tombol-lg tombol-jingga w-full sm:w-auto">
          {sibuk ? t("Menyimpan…", "Saving…") : t("Simpan perubahan", "Save changes")}
        </button>
      </form>

      <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
        <Link href="/pesanan/" className="kartu flex items-center gap-3 p-4 hover:border-zamrud-200">
          <Receipt size={19} className="text-zamrud-700" />
          <span className="text-[14px] font-semibold">{t("Pesanan saya", "My orders")}</span>
        </Link>
        <Link href="/lupa-sandi/" className="kartu flex items-center gap-3 p-4 hover:border-zamrud-200">
          <KeyRound size={19} className="text-zamrud-700" />
          <span className="text-[14px] font-semibold">{t("Ganti kata sandi", "Change password")}</span>
        </Link>
        <button type="button" onClick={() => void auth.keluar()} className="kartu flex w-full items-center gap-3 p-4 text-left hover:border-red-200">
          <LogOut size={19} className="text-red-700" />
          <span className="text-[14px] font-semibold text-red-700">{t("Keluar", "Sign out")}</span>
        </button>
      </aside>
    </div>
  );
}
