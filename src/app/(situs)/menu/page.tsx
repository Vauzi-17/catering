import { Suspense } from "react";
import type { Metadata } from "next";
import { HeroHalaman } from "@/components/HeroHalaman";
import { KatalogMenu } from "@/components/KatalogMenu";
import { fotoDekorasi } from "@/lib/foto";

export const metadata: Metadata = {
  title: "Menu & Harga",
  description:
    "Katalog lengkap menu Asri Catering: nasi kotak, bento, tumpeng, dan snack box beserta isi paket dan harga per porsi.",
};

export default function HalamanMenu() {
  return (
    <>
      <HeroHalaman
        remah={[{ label: ["Beranda", "Home"], href: "/" }, { label: "Menu" }]}
        judul={["Menu & Harga", "Menu & Prices"]}
        deskripsi={["Harga sudah termasuk kemasan dan alat makan.", "Prices include packaging and cutlery."]}
        foto={fotoDekorasi}
      />
      <Suspense
        fallback={
          <div className="container-page min-h-[40vh] py-14" aria-busy="true" />
        }
      >
        <KatalogMenu />
      </Suspense>
    </>
  );
}
