import type { Metadata } from "next";
import { FormLupaSandi } from "@/components/akun/FormSandi";

export const metadata: Metadata = { title: "Lupa Kata Sandi", robots: { index: false } };

export default function Halaman() {
  return <FormLupaSandi />;
}
