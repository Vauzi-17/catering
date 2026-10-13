import { profil } from "@/data/profil";

/**
 * Versi bahasa Inggris dari src/data/profil.ts. Bentuknya sama persis;
 * nama, alamat, dan kontak tidak diterjemahkan.
 */
export const profilEn: typeof profil = {
  ...profil,
  berdiri: "28 August 2026",
  tagline: "Rice box & bento catering for every occasion",
  deskripsiSingkat:
    "Asri Catering takes orders for rice boxes, bento, mini tumpeng, and snack boxes for office events, schools, religious gatherings, and family occasions. Everything is cooked in our own kitchen on the day of delivery.",
  sejarah: [
    {
      tahun: "Aug 2026",
      judul: "Opening a rice stall",
      isi: "On 28 August 2026 Asri opened a nasi rames (mixed rice) stall in Jambusari, Jeruklegi. The stall is still open today for walk-in customers.",
    },
    {
      tahun: "Now",
      judul: "Starting catering packages",
      isi: "From the same kitchen, Asri has started taking catering orders for events: rice boxes, bento, mini tumpeng, and snack boxes. The menu is still small because the service is new, and it will grow as orders come in.",
    },
  ],
  alamat: "Jl. Nata Bangsa RT 01 RW 10, Jambusari Village, Jeruklegi District, Cilacap Regency, Central Java",
  jamOperasional: [
    { hari: "Every day", jam: "07.00 - 18.00" },
    { hari: "Catering orders", jam: "At least 2 days ahead" },
  ],
  areaLayanan: ["Jeruklegi and surroundings", "Cilacap city", "Cilacap Regency"],
  statistik: [
    { angka: "2026", label: "Rice stall open since 28 August" },
    { angka: "6", label: "Catering packages" },
    { angka: "7 days", label: "Orders taken every day" },
    { angka: "2 days", label: "Minimum order notice" },
  ],
  keunggulan: [
    { judul: "Cooked the same day", isi: "Prepared in the early hours before delivery, never yesterday's stock." },
    { judul: "Clear prices", isi: "Package contents and per-portion prices are open, with no hidden fees." },
    { judul: "Taste first", isi: "Orders above 100 portions can request a free tasting portion." },
    { judul: "Every order tracked", isi: "Each order has a code so you can follow its status." },
  ],
  testimoni: [],
  langkahPesan: [
    {
      judul: "Choose a menu",
      ringkas: "Pick a package and the number of portions.",
      isi: "Browse the menu and choose the package that suits your event and number of guests.",
    },
    {
      judul: "Set date & location",
      ringkas: "Sign in, pick a date (2+ days ahead), pin the location.",
      isi: "Sign in to your account, choose an event date at least two days from today and the time, then pin the delivery location on the map.",
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
        "At least two days before the event (H-2). Orders for today or tomorrow cannot be placed. We take orders every day, and large orders are best placed earlier.",
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
