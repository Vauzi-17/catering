import { Suspense } from "react";
import type { Metadata } from "next";
import { LacakPesanan } from "@/components/LacakPesanan";
import { PageHeader } from "@/components/Ui";

export const metadata: Metadata = {
  title: "Lacak Pesanan",
  description:
    "Cek status pesanan Asri Catering menggunakan kode pesanan, mulai dari konfirmasi sampai pesanan selesai diantar.",
};

export default function HalamanLacak() {
  return (
    <>
      <PageHeader
        eyebrow="Status pesanan"
        judul="Lacak pesanan Anda"
        deskripsi="Masukkan kode pesanan Anda untuk melihat status terbarunya."
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
