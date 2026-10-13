import type { Metadata } from "next";
import { HeroHalaman } from "@/components/HeroHalaman";
import { DaftarPesananSaya } from "@/components/pesanan/DaftarPesananSaya";
import { fotoDekorasi } from "@/lib/foto";

export const metadata: Metadata = { title: "Pesanan Saya", robots: { index: false } };

export default function Halaman() {
  return (
    <>
      <HeroHalaman
        remah={[{ label: ["Beranda", "Home"], href: "/" }, { label: ["Pesanan Saya", "My Orders"] }]}
        judul={["Pesanan Saya", "My Orders"]}
        deskripsi={[
          "Pantau pembayaran dan perjalanan pesanan Anda sampai tiba di lokasi.",
          "Follow your payment and your order all the way to your location.",
        ]}
        foto={fotoDekorasi.slice(0, 3)}
      />
      <DaftarPesananSaya />
    </>
  );
}
