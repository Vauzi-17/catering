import type { Metadata } from "next";
import { FormAturSandi } from "@/components/akun/FormSandi";

export const metadata: Metadata = { title: "Atur Kata Sandi", robots: { index: false } };

export default function Halaman() {
  return <FormAturSandi />;
}
