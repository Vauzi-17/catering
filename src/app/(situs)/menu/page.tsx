import { Suspense } from "react";
import type { Metadata } from "next";
import { KatalogMenu } from "@/components/KatalogMenu";
import { PageHeader, Remah } from "@/components/Ui";

export const metadata: Metadata = {
  title: "Menu & Harga",
  description:
    "Katalog lengkap menu Asri Catering: nasi kotak, bento, prasmanan, tumpeng, snack box, dan lauk satuan beserta isi paket dan harga per porsi.",
};

export default function HalamanMenu() {
  return (
    <>
      <PageHeader
        remah={<Remah jejak={[{ label: "Beranda", href: "/" }, { label: "Menu" }]} />}
        judul="Menu & Harga"
        deskripsi="Harga sudah termasuk kemasan dan alat makan. Tambahkan paket ke keranjang, lalu atur jumlah porsinya saat checkout."
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
