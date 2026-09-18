import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#16211B",
          soft: "#3C4A42",
          muted: "#6B7A71",
        },
        line: {
          DEFAULT: "#E4E8E3",
          strong: "#CBD3C9",
        },
        cream: {
          DEFAULT: "#FBFAF6",
          deep: "#F4F2EA",
        },
        brand: {
          50: "#F0F6F1",
          100: "#DDEBE0",
          200: "#BBD7C2",
          300: "#8FBC9C",
          400: "#5E9C72",
          500: "#3B8055",
          600: "#2C6742",
          700: "#235337",
          800: "#1C422C",
          900: "#132D1E",
        },
        // Warna netral untuk kotak placeholder gambar
        abu: {
          DEFAULT: "#ECECE8",
          kuat: "#DCDDD7",
          ikon: "#A7ACA3",
          teks: "#878D84",
        },
        clay: {
          50: "#FBF3EC",
          100: "#F3E2D2",
          500: "#B5673A",
          600: "#97522C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(19, 45, 30, 0.04)",
        pop: "0 8px 24px -12px rgba(19, 45, 30, 0.18)",
      },
      maxWidth: {
        content: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;
