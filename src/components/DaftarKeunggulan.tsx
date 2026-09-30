import { ChefHat, ClipboardList, Receipt, Soup } from "lucide-react";
import { profil } from "@/data/profil";

// Urutan ikon mengikuti urutan profil.keunggulan.
const ikonKeunggulan = [ChefHat, Receipt, Soup, ClipboardList];

/** Baris datar tanpa kartu, dipisah garis tipis di layar lebar. */
export function DaftarKeunggulan() {
  return (
    <ul className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-kabut-line">
      {profil.keunggulan.map((k, i) => {
        const Ikon = ikonKeunggulan[i % ikonKeunggulan.length];
        return (
          <li key={k.judul} className="lg:px-8 lg:first:pl-0 lg:last:pr-0">
            <Ikon size={26} strokeWidth={1.6} className="text-jingga-600" />
            <p className="mt-4 text-[17px] font-semibold text-ink">{k.judul}</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{k.isi}</p>
          </li>
        );
      })}
    </ul>
  );
}
