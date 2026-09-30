import { IconImage, IconMapArea } from "@/components/Icons";

/**
 * Kotak abu-abu penampung gambar.
 *
 * Dipakai selama foto asli Asri Catering belum tersedia. Begitu fotonya ada,
 * cukup isi properti `src` (atau kolom `foto` pada data menu) dan kotak ini
 * otomatis digantikan gambar tersebut.
 */
export function GambarPlaceholder({
  label,
  rasio = "aspect-[4/3]",
  className = "",
}: {
  label?: string;
  rasio?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex ${rasio} w-full flex-col items-center justify-center gap-2 border border-abu-kuat bg-abu ${className}`}
    >
      <IconImage className="text-abu-ikon" width={28} height={28} />
      {label && (
        <span className="px-4 text-center text-[12px] font-medium leading-snug text-abu-teks">
          {label}
        </span>
      )}
    </div>
  );
}

/** Kotak abu-abu untuk peta lokasi, menunggu penyematan Google Maps. */
export function PetaPlaceholder({
  label,
  rasio = "aspect-[16/9]",
}: {
  label: string;
  rasio?: string;
}) {
  return (
    <div className={`flex ${rasio} w-full flex-col items-center justify-center gap-2 border border-abu-kuat bg-abu`}>
      <IconMapArea className="text-abu-ikon" width={28} height={28} />
      <span className="px-4 text-center text-[12px] font-medium leading-snug text-abu-teks">
        {label}
      </span>
    </div>
  );
}

/** Menampilkan foto menu bila sudah ada, atau kotak placeholder bila belum. */
export function FotoMenu({
  src,
  nama,
  rasio = "aspect-[4/3]",
  className = "",
  mini = false,
}: {
  src?: string;
  nama: string;
  rasio?: string;
  className?: string;
  /** Ukuran kecil (mis. daftar pesanan) — keterangan teks disembunyikan. */
  mini?: boolean;
}) {
  if (!src) {
    return (
      <GambarPlaceholder
        label={mini ? undefined : `Foto ${nama}`}
        rasio={rasio}
        className={className}
      />
    );
  }
  return (
    <div className={`${rasio} w-full overflow-hidden bg-abu ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={nama} loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}
