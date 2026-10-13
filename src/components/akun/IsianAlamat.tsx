"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MapPinned } from "lucide-react";
import type { Titik } from "@/lib/pembayaran";
import { useInfoPengantaran } from "@/lib/useInfoPengantaran";
import { useBahasa } from "@/store/BahasaProvider";

// Peta hanya dirender di browser (Leaflet membutuhkan window).
const PetaLokasi = dynamic(() => import("@/components/akun/PetaLokasi").then((m) => m.PetaLokasi), {
  ssr: false,
  loading: () => <div className="mt-3 h-72 w-full animate-pulse rounded-xl bg-kabut-deep sm:h-80" />,
});

export interface NilaiAlamat {
  alamat: string;
  patokan: string;
  titik: Titik | null;
}

export function IsianAlamat({
  nilai,
  onUbah,
  galat,
}: {
  nilai: NilaiAlamat;
  onUbah: (n: NilaiAlamat) => void;
  galat?: { alamat?: string; titik?: string };
}) {
  const dapur = useInfoPengantaran();
  const { t } = useBahasa();
  const [mengisi, setMengisi] = useState(false);

  async function isiDariPeta() {
    if (!nilai.titik) return;
    setMengisi(true);
    try {
      const { alamatDariTitik } = await import("@/components/akun/PetaLokasi");
      const teks = await alamatDariTitik(nilai.titik);
      if (teks) onUbah({ ...nilai, alamat: teks });
    } finally {
      setMengisi(false);
    }
  }

  return (
    <div className="space-y-4">
      <div data-galat={Boolean(galat?.titik)}>
        <p className="isian-label">{t("Titik lokasi di peta", "Location pin on the map")}</p>
        <PetaLokasi nilai={nilai.titik} onUbah={(titik) => onUbah({ ...nilai, titik })} dapur={dapur} />
        {galat?.titik && <p className="mt-1.5 text-[12.5px] font-semibold text-red-700">{galat.titik}</p>}
      </div>

      <div data-galat={Boolean(galat?.alamat)}>
        <div className="flex items-center justify-between gap-3">
          <label className="isian-label" htmlFor="alamat">{t("Alamat lengkap", "Full address")}</label>
          {nilai.titik && (
            <button type="button" onClick={isiDariPeta} disabled={mengisi} className="mb-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-zamrud-700 hover:underline disabled:opacity-50">
              <MapPinned size={14} />
              {mengisi ? t("Mengambil…", "Fetching…") : t("Isi dari peta", "Fill from map")}
            </button>
          )}
        </div>
        <textarea
          id="alamat"
          rows={3}
          className="isian resize-y"
          value={nilai.alamat}
          onChange={(e) => onUbah({ ...nilai, alamat: e.target.value })}
          placeholder={t("Nama gedung, jalan, nomor, lantai atau ruang, kelurahan", "Building, street, number, floor or room, village")}
        />
        {galat?.alamat && <p className="mt-1.5 text-[12.5px] font-semibold text-red-700">{galat.alamat}</p>}
      </div>

      <div>
        <label className="isian-label" htmlFor="patokan">
          {t("Patokan", "Landmark")} <span className="font-normal text-ink-muted">({t("opsional", "optional")})</span>
        </label>
        <input
          id="patokan"
          className="isian"
          value={nilai.patokan}
          onChange={(e) => onUbah({ ...nilai, patokan: e.target.value })}
          placeholder={t("Contoh: pagar hijau depan masjid, masuk lewat pintu samping", "e.g. green gate opposite the mosque, use the side door")}
        />
      </div>
    </div>
  );
}
