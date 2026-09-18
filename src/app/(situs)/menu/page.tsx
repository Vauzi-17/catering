import { Suspense } from "react";
import type { Metadata } from "next";
import { KatalogMenu } from "@/components/KatalogMenu";
import { PageHeader } from "@/components/Ui";

export const metadata: Metadata = {
  title: "Menu & Harga",
  description:
    "Katalog lengkap menu Asri Catering: nasi box, prasmanan, tumpeng, snack box, dan lauk satuan beserta isi paket dan harga per porsi.",
};

export default function HalamanMenu() {
  return (
    <>
      <PageHeader
        eyebrow="Katalog"
        judul="Menu & harga Asri Catering"
        deskripsi="Harga sudah termasuk kemasan dan peralatan makan."
      />
      <Suspense
        fallback={
          <div className="container-page py-14 text-sm text-ink-muted">Memuat menu…</div>
        }
      >
        <KatalogMenu />
      </Suspense>
    </>
  );
}
