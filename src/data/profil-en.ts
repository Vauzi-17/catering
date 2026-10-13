import { profil } from "@/data/profil";

/**
 * Versi bahasa Inggris dari src/data/profil.ts. Bentuknya sama persis;
 * nama, alamat, dan kontak tidak diterjemahkan.
 */
export const profilEn: typeof profil = {
  ...profil,
  tagline: "Rice box & bento catering for every occasion",
  deskripsiSingkat:
    "Asri Catering serves rice boxes, bento, tumpeng, and snack boxes for office events, schools, religious gatherings, and family occasions. Everything is cooked in our own kitchen on the day of delivery.",
  sejarah: [
    {
      tahun: "2016",
      judul: "Started in a home kitchen",
      isi: "Ibu Asri began taking orders for mixed rice plates from neighbours and the nearby village office. On an average day she cooked 20 to 30 boxes herself with one kitchen helper.",
    },
    {
      tahun: "2019",
      judul: "Serving office orders",
      isi: "Orders started coming in from government offices and schools. The kitchen was expanded, more serving equipment was added, and the team grew to four people.",
    },
    {
      tahun: "2022",
      judul: "Adding tumpeng & buffet service",
      isi: "Demand for thanksgiving events and weddings grew. Asri Catering began offering complete tumpeng packages and buffet service with serving staff.",
    },
    {
      tahun: "2025",
      judul: "Digital order records",
      isi: "Orders that used to be written in a notebook moved to a digital system, complete with cost-of-goods calculations and daily revenue reports.",
    },
  ],
  alamat: "Jl. Nata Bangsa RT 01 RW 10, Jambusari Village, Jeruklegi District, Cilacap Regency, Central Java",
  jamOperasional: [
    { hari: "Monday - Friday", jam: "07.00 - 18.00" },
    { hari: "Saturday", jam: "07.00 - 16.00" },
    { hari: "Sunday", jam: "08.00 - 14.00" },
    { hari: "Public holidays", jam: "By appointment" },
  ],
  areaLayanan: ["Jeruklegi and surroundings", "Cilacap city", "Cilacap Regency"],
  statistik: [
    { angka: "9", label: "Years of service" },
    { angka: "1,200+", label: "Events served" },
    { angka: "150", label: "Boxes per day" },
    { angka: "4.8", label: "Average rating" },
  ],
  keunggulan: [
    { judul: "Cooked the same day", isi: "Prepared in the early hours before delivery, never yesterday's stock." },
    { judul: "Clear prices", isi: "Package contents and per-portion prices are open, with no hidden fees." },
    { judul: "Taste first", isi: "Orders above 100 portions can request a free tasting portion." },
    { judul: "Every order tracked", isi: "Each order has a code so you can follow its status." },
  ],
  testimoni: [
    {
      nama: "Rina Kusumawati",
      peran: "General Affairs, Education Office",
      isi: "We have ordered rice boxes for our monthly meetings for three years. Always on time and the taste is consistent. The office event package is the participants' favourite.",
    },
    {
      nama: "Bapak Hendra",
      peran: "Community Thanksgiving Committee",
      isi: "We ordered a 150-portion buffet only two days ahead and were still served well. The serving staff were neat and quick to clean up after the event.",
    },
    {
      nama: "Dewi Anggraeni",
      peran: "Individual customer",
      isi: "The mini tumpeng looks lovely and the portion is just right for a small family. Plenty of side dishes, and it tastes like home cooking rather than mass catering.",
    },
  ],
  langkahPesan: [
    {
      judul: "Choose a menu",
      ringkas: "Pick a package and the number of portions.",
      isi: "Browse the menu and choose the package that suits your event and number of guests.",
    },
    {
      judul: "Set date & location",
      ringkas: "Sign in, pick a date, pin the location.",
      isi: "Sign in to your account, choose the event date and time, then pin the delivery location on the map.",
    },
    {
      judul: "Pay online",
      ringkas: "QRIS from any mobile banking or e-wallet app.",
      isi: "Pay with QRIS from any mobile banking or e-wallet app. The amount is filled in, and payment is confirmed without sending a transfer receipt.",
    },
    {
      judul: "Track & receive",
      ringkas: "Follow the status until your order arrives.",
      isi: "Follow your order on the My Orders page: paid, cooking, on delivery, and completed.",
    },
  ],
  faq: [
    {
      tanya: "What is the minimum order?",
      jawab:
        "It depends on the package. Rice boxes start from 10 boxes, snack boxes from 20 boxes, and tumpeng can be ordered individually.",
    },
    {
      tanya: "How far in advance should I order?",
      jawab:
        "For orders under 100 portions we accept orders one day ahead. For more than 100 portions, please order at least three days before the event.",
    },
    {
      tanya: "Is there a delivery fee?",
      jawab:
        "No. Delivery is free within our service area. When ordering, pin the location on the map and the site tells you right away whether it is within reach.",
    },
    {
      tanya: "How do I pay?",
      jawab:
        "Full payment is made at checkout with QRIS: scan it from any mobile banking or e-wallet app and the amount is already filled in. Once the payment arrives, the order status updates without a transfer receipt.",
    },
    {
      tanya: "Can the menu be customised?",
      jawab:
        "Yes. Side dishes in rice box and tumpeng packages can be swapped on request. Write your request in the notes field when ordering.",
    },
  ],
};
