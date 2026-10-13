"use client";

import { useEffect, useState } from "react";
import type { Dapur } from "@/components/akun/PetaLokasi";
import { ambilInfoPengantaran } from "@/lib/db";
import { supabaseAktif } from "@/lib/supabase";

// Cadangan bila Supabase belum aktif atau gagal dihubungi.
// Ganti titik ini dengan lokasi dapur sebenarnya lewat tabel settings.
export const DAPUR_CADANGAN: Dapur = { lat: -7.560572, lng: 109.01547, radiusKm: 25 };

export function useInfoPengantaran(): Dapur {
  const [dapur, setDapur] = useState<Dapur>(DAPUR_CADANGAN);
  useEffect(() => {
    if (!supabaseAktif) return;
    let hidup = true;
    ambilInfoPengantaran()
      .then((d) => {
        if (hidup && d) setDapur(d);
      })
      .catch(() => {
        /* tetap pakai cadangan */
      });
    return () => {
      hidup = false;
    };
  }, []);
  return dapur;
}
