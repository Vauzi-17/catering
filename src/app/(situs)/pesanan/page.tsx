import type { Metadata } from "next";
import { HeroHalaman } from "@/components/HeroHalaman";
import { DaftarPesananSaya } from "@/components/pesanan/DaftarPesananSaya";
import { fotoDekorasi } from "@/lib/foto";

export const metadata: Metadata = { title: "Pesanan Saya", robots: { index: false } };

export default function Halaman() {
  return (
    <>
      <HeroHalaman
        remah={[{ label: "Beranda", href: "/" }, { label: "Pesanan Saya" }]}
        judul="Pesanan Saya"
        deskripsi="Pantau pembayaran dan perjalanan pesanan Anda sampai tiba di lokasi."
        foto={fotoDekorasi.slice(0, 3)}
      />
      <DaftarPesananSaya />
    </>
  );
}
