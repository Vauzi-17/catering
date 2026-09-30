import { Suspense } from "react";
import type { Metadata } from "next";
import { FormDaftar } from "@/components/akun/FormDaftar";

export const metadata: Metadata = { title: "Daftar", robots: { index: false } };

export default function Halaman() {
  return (
    <Suspense>
      <FormDaftar />
    </Suspense>
  );
}
