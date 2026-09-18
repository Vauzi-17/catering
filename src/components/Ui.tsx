import type { ReactNode } from "react";
import type { StatusPesanan } from "@/lib/types";

export function SectionHeading({
  eyebrow,
  judul,
  deskripsi,
  align = "left",
  aksi,
}: {
  eyebrow?: string;
  judul: string;
  deskripsi?: string;
  align?: "left" | "center";
  aksi?: ReactNode;
}) {
  const tengah = align === "center";
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${
        tengah ? "sm:flex-col sm:items-center" : ""
      }`}
    >
      <div className={`max-w-2xl ${tengah ? "text-center" : ""}`}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2.5 font-display text-[26px] leading-tight sm:text-[32px]">
          {judul}
        </h2>
        {deskripsi && (
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{deskripsi}</p>
        )}
      </div>
      {aksi && <div className="shrink-0">{aksi}</div>}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  judul,
  deskripsi,
  children,
}: {
  eyebrow: string;
  judul: string;
  deskripsi?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-line bg-white">
      <div className="container-page py-12 sm:py-16">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-[32px] leading-[1.15] sm:text-[44px]">
          {judul}
        </h1>
        {deskripsi && (
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-muted sm:text-base">
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
