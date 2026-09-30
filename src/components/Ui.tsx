import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
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

export function PageHeader({
  judul,
  deskripsi,
  remah,
  children,
}: {
  judul: string;
  deskripsi?: string;
  /** Remah roti di atas judul, mis. Beranda / Menu. */
  remah?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-kabut-line bg-white">
      <div className="container-page py-10 sm:py-14">
        {remah && <div className="mb-5">{remah}</div>}
        <h1 className="max-w-3xl text-[34px] font-semibold leading-[1.08] sm:text-[46px]">
          {judul}
        </h1>
        {deskripsi && (
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft sm:text-base">
            {deskripsi}
          </p>
        )}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}

const gayaStatus: Record<StatusPesanan, string> = {
  "Menunggu Konfirmasi": "border-amber-200 bg-amber-50 text-amber-800",
  Diproses: "border-sky-200 bg-sky-50 text-sky-800",
  Selesai: "border-brand-700 bg-brand-700 text-white",
  Dibatalkan: "border-red-200 bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: StatusPesanan }) {
  return <span className={`chip ${gayaStatus[status]}`}>{status}</span>;
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
export function Remah({ jejak }: { jejak: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Remah roti" className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-muted">
      {jejak.map((j, i) => (
        <span key={j.label} className="inline-flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={14} aria-hidden="true" />}
          {j.href ? (
            <Link href={j.href} className="hover:text-zamrud-700">
              {j.label}
            </Link>
          ) : (
            <span className="font-semibold text-ink" aria-current="page">
              {j.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
