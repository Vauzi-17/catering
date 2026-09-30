import { Check } from "lucide-react";

const daftarLangkah = ["Keranjang", "Data Acara", "Pembayaran", "Selesai"];

/** Penanda posisi pada alur pesan: 0 keranjang, 1 data acara, 2 pembayaran, 3 selesai. */
export function LangkahCheckout({ aktif }: { aktif: number }) {
  return (
    <div className="border-b border-kabut-line bg-white">
      <ol className="container-page flex items-center justify-center gap-2 py-4 sm:gap-4 sm:py-5">
        {daftarLangkah.map((label, i) => {
          const lewat = i < aktif || aktif === daftarLangkah.length - 1;
          const sekarang = i === aktif && !lewat;
          return (
            <li key={label} className="flex items-center gap-2 sm:gap-4">
              {i > 0 && (
                <span
                  className={`h-px w-5 sm:w-12 lg:w-20 ${i <= aktif ? "bg-zamrud-600" : "bg-kabut-line"}`}
                  aria-hidden="true"
                />
              )}
              <span
                className="flex items-center gap-2"
                aria-current={sekarang ? "step" : undefined}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                    lewat
                      ? "bg-zamrud-700 text-white"
                      : sekarang
                        ? "bg-zamrud-700 text-white"
                        : "border border-kabut-line bg-white text-ink-muted"
                  }`}
                >
                  {lewat ? <Check size={14} strokeWidth={2.5} /> : i + 1}
                </span>
                <span
                  className={`text-[13px] font-semibold ${
                    sekarang || lewat ? "text-zamrud-800" : "text-ink-muted"
                  } ${sekarang ? "" : "hidden sm:inline"}`}
                >
                  {label}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
