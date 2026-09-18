import type { Metadata } from "next";
import { FormPesanan } from "@/components/FormPesanan";
import { PageHeader } from "@/components/Ui";

export const metadata: Metadata = {
  title: "Pesan Online",
  description:
    "Formulir pemesanan online Asri Catering. Pilih menu, tentukan jumlah porsi dan tanggal acara, lalu terima kode pesanan untuk memantau statusnya.",
};

export default function HalamanPesan() {
  return (
    <>
      <PageHeader
        eyebrow="Pemesanan online"
        judul="Buat pesanan untuk acara Anda"
        deskripsi="Isi ketiga bagian di bawah ini. Setelah dikirim, Anda menerima kode pesanan untuk memantau statusnya."
      />
      <FormPesanan />
    </>
  );
}
