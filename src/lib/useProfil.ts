"use client";

import { profil } from "@/data/profil";
import { profilEn } from "@/data/profil-en";
import { useBahasa } from "@/store/BahasaProvider";

/** Profil usaha sesuai bahasa yang dipilih pengunjung. */
export function useProfil(): typeof profil {
  return useBahasa().bahasa === "en" ? profilEn : profil;
}
