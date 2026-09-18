import type { ReactNode } from "react";
import { IconAlert, IconCheck, IconInfo, IconSparkle } from "@/components/Icons";
import type { CatatanAnalisis } from "@/lib/analisis";
import { rupiah } from "@/lib/format";

export function KartuStat({
  label,
  nilai,
  catatan,
  ikon,
  nada = "netral",
}: {
  label: string;
  nilai: string;
  catatan?: string;
  ikon?: ReactNode;
  nada?: "netral" | "baik" | "perhatian";
}) {
  const warnaNilai =
    nada === "baik" ? "text-brand-800" : nada === "perhatian" ? "text-clay-600" : "text-ink";

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">
          {label}
        </p>
        {ikon && <span className="shrink-0 text-brand-500">{ikon}</span>}
      </div>
      <p className={`mt-3 font-display text-[26px] leading-none ${warnaNilai}`}>{nilai}</p>
      {catatan && <p className="mt-2.5 text-[13px] leading-relaxed text-ink-muted">{catatan}</p>}
    </div>
  );
}

const gayaNada: Record<CatatanAnalisis["nada"], { kotak: string; ikon: ReactNode }> = {
  baik: {
    kotak: "border-brand-200 bg-brand-50",
    ikon: <IconCheck className="text-brand-700" width={18} height={18} />,
  },
  perhatian: {
    kotak: "border-amber-200 bg-amber-50",
    ikon: <IconAlert className="text-amber-700" width={18} height={18} />,
  },
  bahaya: {
    kotak: "border-red-200 bg-red-50",
    ikon: <IconAlert className="text-red-700" width={18} height={18} />,
  },
  info: {
    kotak: "border-line bg-cream",
    ikon: <IconInfo className="text-ink-muted" width={18} height={18} />,
  },
};

export function LencanaSumber({ sumber }: { sumber: "gemini" | "lokal" }) {
  return (
    <span
      className={`chip shrink-0 ${
        sumber === "gemini"
          ? "border-brand-200 bg-brand-50 text-brand-700"
          : "border-line-strong bg-white text-ink-muted"
      }`}
      title={
        sumber === "gemini"
          ? "Catatan ditulis Gemini dari angka hasil perhitungan aplikasi."
          : "Gemini tidak aktif. Catatan disusun dari aturan perhitungan aplikasi."
      }
    >
      {sumber === "gemini" ? "Gemini" : "Hitungan aplikasi"}
    </span>
  );
}

export function PanelAnalisis({
  judul = "Hasil analisis",
  deskripsi,
  catatan,
  sumber,
  memuat = false,
}: {
  judul?: string;
  deskripsi?: string;
  catatan: CatatanAnalisis[];
  sumber?: "gemini" | "lokal";
  memuat?: boolean;
}) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 text-brand-700">
          <IconSparkle width={18} height={18} />
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg leading-snug">{judul}</h2>
            {sumber && <LencanaSumber sumber={sumber} />}
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
            {memuat
              ? "Menyusun catatan…"
              : (deskripsi ?? "Disusun dari data yang tercatat di sistem.")}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {catatan.map((c) => {
          const gaya = gayaNada[c.nada];
          return (
            <li key={c.judul} className={`rounded-lg border p-4 ${gaya.kotak}`}>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0">{gaya.ikon}</span>
                <div>
                  <p className="text-[14px] font-semibold text-ink">{c.judul}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{c.isi}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function GrafikBatang({
  data,
  tinggi = 180,
}: {
  data: { label: string; nilai: number; keterangan?: string }[];
  tinggi?: number;
}) {
  const maksimum = Math.max(...data.map((d) => d.nilai), 1);

  return (
    <div className="table-wrap">
      <div className="flex min-w-[520px] items-end gap-2" style={{ height: tinggi }}>
        {data.map((d) => {
          const persen = Math.max(3, (d.nilai / maksimum) * 100);
          return (
            <div key={d.label} className="flex h-full flex-1 flex-col justify-end gap-2">
              <span className="text-center text-[11px] font-semibold text-ink-muted">
                {rupiah(d.nilai, true)}
              </span>
              <div
                className="rounded-t-md border border-brand-600 bg-brand-500"
                style={{ height: `${persen}%` }}
                title={d.keterangan ?? `${d.label}: ${rupiah(d.nilai)}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex min-w-[520px] gap-2 border-t border-line pt-2">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 text-center text-[11px] leading-tight text-ink-muted"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
