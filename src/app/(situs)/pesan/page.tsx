import type { Metadata } from "next";
import { FormPesanan } from "@/components/FormPesanan";

export const metadata: Metadata = {
  title: "Pesan Online",
  description:
    "Keranjang dan formulir pemesanan Asri Catering. Atur jumlah porsi, isi tanggal dan alamat acara, lalu terima kode pesanan untuk memantau statusnya.",
};

export default function HalamanPesan() {
  return <FormPesanan />;
}
