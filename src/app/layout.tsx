import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/store/DataProvider";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://asricatering.id"),
  title: {
    default: "Asri Catering — Nasi Rames, Prasmanan & Tumpeng di Bandung",
    template: "%s · Asri Catering",
  },
  description:
    "Asri Catering melayani nasi rames, nasi box, prasmanan, tumpeng, dan snack box untuk acara kantor, sekolah, dan keluarga di Bandung. Harga jelas, pesan online, pesanan tercatat rapi.",
  keywords: [
    "catering bandung",
    "nasi rames",
    "nasi box bandung",
    "catering prasmanan",
    "tumpeng bandung",
    "snack box",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Asri Catering",
    title: "Asri Catering — Masakan rames rumahan untuk acara Anda",
    description:
      "Nasi rames, prasmanan, tumpeng, dan snack box untuk acara di Bandung. Pesan online, harga tercantum jelas.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#235337",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${sans.variable} ${display.variable}`}>
      <body>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
