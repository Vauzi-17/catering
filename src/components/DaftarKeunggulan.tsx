import { ChefHat, ClipboardList, Receipt, Soup } from "lucide-react";
import { profil } from "@/data/profil";

// Urutan ikon mengikuti urutan profil.keunggulan.
const ikonKeunggulan = [ChefHat, Receipt, Soup, ClipboardList];

export function DaftarKeunggulan() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {profil.keunggulan.map((k, i) => {
        const Ikon = ikonKeunggulan[i % ikonKeunggulan.length];
        return (
          <li
            key={k.judul}
            className="flex gap-4 rounded-2xl border border-kabut-line bg-white p-5 sm:flex-col sm:gap-5 sm:p-6"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-jingga-50 text-jingga-600">
              <Ikon size={22} strokeWidth={1.8} />
            </span>
            <span>
              <span className="block font-sans text-[17px] font-semibold text-ink">{k.judul}</span>
              <span className="mt-1.5 block text-[14px] leading-relaxed text-ink-muted">
                {k.isi}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
