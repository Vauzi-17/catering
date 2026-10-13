import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { WARNA_STATUS } from "@/lib/status";
import type { StatusPesanan } from "@/lib/types";

export function SectionHeading({
  judul,
  deskripsi,
  align = "left",
  aksi,
}: {
  judul: string;
  deskripsi?: string;
  align?: "left" | "center";
  aksi?: ReactNode;
}) {
  const tengah = align === "center";
  return (
    <div
      data-muncul
      className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ${
        tengah ? "sm:flex-col sm:items-center" : ""
      }`}
    >
      <div className={`max-w-2xl ${tengah ? "text-center" : ""}`}>
        <h2 className="text-[30px] font-semibold leading-[1.1] sm:text-[38px]">{judul}</h2>
        {deskripsi && (
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{deskripsi}</p>
        )}
      </div>
      {aksi && <div className="shrink-0">{aksi}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: StatusPesanan }) {
  return <span className={`chip border-transparent ${WARNA_STATUS[status]}`}>{status}</span>;
}

export function Kosong({
  judul,
  deskripsi,
  aksi,
}: {
  judul: string;
  deskripsi: string;
  aksi?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-cream">
        <span className="h-2 w-2 rounded-full bg-brand-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{judul}</h3>
      <p className="mt-2 max-w-md text-sm text-ink-muted">{deskripsi}</p>
      {aksi && <div className="mt-6">{aksi}</div>}
    </div>
  );
}

/** Remah roti untuk halaman publik. Item terakhir dianggap halaman aktif. */
export function Remah({
  jejak,
  terang = false,
}: {
  jejak: { label: string; href?: string }[];
  /** Warna putih untuk dipasang di atas latar gelap/oranye. */
  terang?: boolean;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center gap-1.5 text-[13px] ${terang ? "text-white/75" : "text-ink-muted"}`}
    >
      {jejak.map((j, i) => (
        <span key={j.label} className="inline-flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={14} aria-hidden="true" />}
          {j.href ? (
            <Link href={j.href} className={terang ? "hover:text-white" : "hover:text-zamrud-700"}>
              {j.label}
            </Link>
          ) : (
            <span className={`font-semibold ${terang ? "text-white" : "text-ink"}`} aria-current="page">
              {j.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
