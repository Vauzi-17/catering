import { profil } from "@/data/profil";

function inisial(nama: string) {
  return nama
    .replace(/^(Bapak|Ibu)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0])
    .join("")
    .toUpperCase();
}

export function DaftarTestimoni() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {profil.testimoni.map((t) => (
        <figure
          key={t.nama}
          className="flex flex-col rounded-2xl border border-kabut-line bg-kabut p-6"
        >
          <blockquote className="flex-1 text-[15px] leading-relaxed text-ink-soft">
            {t.isi}
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3 border-t border-kabut-line pt-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zamrud-50 text-[13px] font-bold text-zamrud-700">
              {inisial(t.nama)}
            </span>
            <span>
              <span className="block text-[14px] font-semibold text-ink">{t.nama}</span>
              <span className="block text-[12px] text-ink-muted">{t.peran}</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
