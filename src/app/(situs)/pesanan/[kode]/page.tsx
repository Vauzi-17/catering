import { Suspense } from "react";
import type { Metadata } from "next";
import { DetailPesananSaya } from "@/components/pesanan/DetailPesananSaya";

export const metadata: Metadata = { title: "Detail Pesanan", robots: { index: false } };

export default async function Halaman({ params }: { params: Promise<{ kode: string }> }) {
  const { kode } = await params;
  return (
    <Suspense>
      <DetailPesananSaya kode={decodeURIComponent(kode)} />
    </Suspense>
  );
}
