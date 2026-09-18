"use client";

export function DialogKonfirmasi({
  judul,
  isi,
  labelLanjut = "Ya, hapus",
  batal,
  lanjut,
}: {
  judul: string;
  isi: string;
  labelLanjut?: string;
  batal: () => void;
  lanjut: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-5"
      role="dialog"
      aria-modal="true"
      aria-label={judul}
      onClick={batal}
    >
      <div
        className="w-full max-w-md rounded-card border border-line bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl">{judul}</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{isi}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={batal} className="btn btn-outline btn-md">
            Batal
          </button>
          <button
            type="button"
            onClick={lanjut}
            className="btn btn-md border-red-600 bg-red-600 text-white hover:bg-red-700"
          >
            {labelLanjut}
          </button>
        </div>
      </div>
    </div>
  );
}
