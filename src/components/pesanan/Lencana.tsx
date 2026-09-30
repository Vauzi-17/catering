import { WARNA_BAYAR, WARNA_STATUS } from "@/lib/status";
import type { StatusBayar, StatusPesanan } from "@/lib/types";

export function LencanaStatus({ status }: { status: StatusPesanan }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${WARNA_STATUS[status]}`}>
      {status}
    </span>
  );
}

export function LencanaBayar({ status }: { status: StatusBayar | null | undefined }) {
  if (!status) return null;
  const label = status === "Menunggu" ? "Belum dibayar" : status;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${WARNA_BAYAR[status]}`}>
      {label}
    </span>
  );
}
