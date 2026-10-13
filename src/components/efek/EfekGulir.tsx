"use client";

import { useEffect } from "react";

/**
 * Memunculkan elemen bertanda [data-muncul] saat masuk layar. Kelas
 * .gulir-siap baru dipasang di sini, jadi tanpa JavaScript atau dengan
 * "kurangi gerakan" semua isi langsung terlihat.
 */
export function EfekGulir() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    const akar = document.documentElement;
    akar.classList.add("gulir-siap");

    const pengamat = new IntersectionObserver(
      (entri) => {
        for (const e of entri) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-terlihat", "");
            pengamat.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    let antre = 0;
    const pindai = () => {
      antre = 0;
      document.querySelectorAll("[data-muncul]:not([data-terlihat])").forEach((el) => pengamat.observe(el));
    };
    pindai();
    const perubahan = new MutationObserver(() => {
      if (!antre) antre = window.requestAnimationFrame(pindai);
    });
    perubahan.observe(document.body, { childList: true, subtree: true });

    return () => {
      pengamat.disconnect();
      perubahan.disconnect();
      if (antre) window.cancelAnimationFrame(antre);
      akar.classList.remove("gulir-siap");
    };
  }, []);
  return null;
}
