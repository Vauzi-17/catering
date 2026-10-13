import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/store/AuthProvider";
import { BahasaProvider } from "@/store/BahasaProvider";
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
    default: "Asri Catering — Katering Nasi Kotak, Bento & Tumpeng di Cilacap",
    template: "%s · Asri Catering",
  },
  description:
    "Asri Catering melayani nasi kotak, bento, tumpeng, dan snack box untuk acara kantor, sekolah, dan keluarga di Cilacap. Harga jelas, pesan online, pesanan tercatat rapi.",
  keywords: [
    "catering cilacap",
    "nasi kotak cilacap",
    "bento catering",
    "nasi box cilacap",
    "catering jeruklegi",
    "tumpeng cilacap",
    "snack box",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Asri Catering",
    title: "Asri Catering — Katering nasi kotak & bento untuk setiap acara",
    description:
      "Nasi kotak, bento, tumpeng, dan snack box untuk acara di Cilacap. Pesan online, harga tercantum jelas.",
  },
  robots: { index: true, follow: true },
  // Terjemahan otomatis peramban mengganti teks halaman diam-diam dan membuat
  // React gagal memperbarui halaman ("Application error"). Situs ini
  // berbahasa Indonesia untuk pelanggan lokal, jadi terjemahan dimatikan.
  other: { google: "notranslate" },
};

/**
 * Pengaman bila ada penerjemah atau ekstensi yang tetap mengubah teks: React
 * tidak lagi crash saat simpul yang ingin dihapus/disisipi sudah dipindah
 * pihak lain (lihat facebook/react#11538).
 */
const PENGAMAN_DOM = `(function(){if(typeof Node!=="function"||!Node.prototype)return;var r=Node.prototype.removeChild;Node.prototype.removeChild=function(c){if(c.parentNode!==this)return c;return r.apply(this,arguments)};var i=Node.prototype.insertBefore;Node.prototype.insertBefore=function(n,ref){if(ref&&ref.parentNode!==this)return n;return i.apply(this,arguments)}})();`;

export const viewport: Viewport = {
  themeColor: "#235337",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" translate="no" className={`${sans.variable} ${display.variable}`}>
      <body>
        <Script id="pengaman-dom" strategy="beforeInteractive">
          {PENGAMAN_DOM}
        </Script>
        <BahasaProvider>
          <AuthProvider>
            <DataProvider>{children}</DataProvider>
          </AuthProvider>
        </BahasaProvider>
      </body>
    </html>
  );
}
