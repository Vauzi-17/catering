import { Suspense } from "react";
import type { Metadata } from "next";
import { FormMasuk } from "@/components/akun/FormMasuk";

export const metadata: Metadata = { title: "Masuk", robots: { index: false } };

export default function Halaman() {
  return (
    <Suspense>
      <FormMasuk />
    </Suspense>
  );
}
