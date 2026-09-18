/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aplikasi dijalankan sebagai Next.js server (bukan export statis) karena
  // Gemini API dipanggil lewat Route Handler di /api/ai/* supaya API key
  // tidak pernah sampai ke browser.
  //
  // Hosting yang cocok: Vercel, VPS, atau paket DomaiNesia yang menyediakan
  // Node.js Selector. Shared hosting biasa (hanya Apache/PHP) tidak bisa.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
