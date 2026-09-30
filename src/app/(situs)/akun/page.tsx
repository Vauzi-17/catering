import type { Metadata } from "next";
import { HalamanAkun } from "@/components/akun/HalamanAkun";

export const metadata: Metadata = { title: "Akun Saya", robots: { index: false } };

export default function Halaman() {
  return <HalamanAkun />;
}
