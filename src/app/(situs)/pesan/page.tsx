import type { Metadata } from "next";
import { FormPesanan } from "@/components/FormPesanan";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Isi jadwal dan lokasi acara, lalu bayar pesanan Asri Catering secara online.",
  robots: { index: false },
};

export default function HalamanPesan() {
  return <FormPesanan />;
}
