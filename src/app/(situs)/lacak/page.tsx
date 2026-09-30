import { Suspense } from "react";
import type { Metadata } from "next";
import { HeroHalaman } from "@/components/HeroHalaman";
import { LacakPesanan } from "@/components/LacakPesanan";
import { fotoDekorasi } from "@/lib/foto";

export const metadata: Metadata = {
  title: "Status Pesanan",
  description:
    "Cek status pesanan Asri Catering menggunakan kode pesanan, mulai dari konfirmasi sampai pesanan selesai diantar.",
};

export default function HalamanLacak() {
  return (
    <>
      <HeroHalaman
        remah={[{ label: "Beranda", href: "/" }, { label: "Status Pesanan" }]}
        judul="Status Pesanan"
        deskripsi="Masukkan kode pesanan untuk melihat status terbarunya."
        foto={fotoDekorasi.slice(0, 3)}
      />
      <Suspense
        fallback={
          <div className="container-page py-14 text-sm text-ink-muted">Memuat…</div>
        }
      >
        <LacakPesanan />
      </Suspense>
    </>
  );
}
