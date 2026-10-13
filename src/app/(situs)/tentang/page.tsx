import type { Metadata } from "next";
import { Tentang } from "@/components/tentang/Tentang";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Profil Asri Catering: sejarah singkat usaha, alamat dapur, jam operasional, area layanan, dan kontak yang bisa dihubungi.",
};

export default function HalamanTentang() {
  return <Tentang />;
}
