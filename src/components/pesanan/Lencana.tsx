"use client";

import { WARNA_BAYAR, WARNA_STATUS } from "@/lib/status";
import { labelBayar, namaStatus } from "@/lib/teks";
import type { StatusBayar, StatusPesanan } from "@/lib/types";
import { useBahasa } from "@/store/BahasaProvider";

export function LencanaStatus({ status }: { status: StatusPesanan }) {
  const { bahasa } = useBahasa();
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${WARNA_STATUS[status]}`}>
      {namaStatus(status, bahasa)}
    </span>
  );
}

/** `bahasa` memaksa bahasa tertentu, mis. panel admin yang selalu bahasa Indonesia. */
export function LencanaBayar({ status, bahasa: paksa }: { status: StatusBayar | null | undefined; bahasa?: "id" | "en" }) {
  const { bahasa: aktif } = useBahasa();
  const bahasa = paksa ?? aktif;
  if (!status) return null;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${WARNA_BAYAR[status]}`}>
      {labelBayar(status, bahasa)}
    </span>
  );
}
