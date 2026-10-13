"use client";

import { useRef, type ReactNode } from "react";

/**
 * Lapisan foto hero yang bergeser mengikuti kursor. Anak-anaknya memakai
 * variabel --px dan --py (-1 … 1) lewat properti CSS `translate`, jadi tidak
 * bentrok dengan animasi `transform` yang sudah ada. Mati di layar sentuh
 * dan bila pengunjung memilih "kurangi gerakan".
 */
export function ParalaksHero({ className = "", children }: { className?: string; children: ReactNode }) {
  const wadah = useRef<HTMLDivElement>(null);
  const bingkai = useRef(0);

  function gerak(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = wadah.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    cancelAnimationFrame(bingkai.current);
    bingkai.current = requestAnimationFrame(() => {
      el.style.setProperty("--px", Math.max(-1, Math.min(1, x)).toFixed(3));
      el.style.setProperty("--py", Math.max(-1, Math.min(1, y)).toFixed(3));
    });
  }

  function lepas() {
    cancelAnimationFrame(bingkai.current);
    wadah.current?.style.setProperty("--px", "0");
    wadah.current?.style.setProperty("--py", "0");
  }

  return (
    <div ref={wadah} onPointerMove={gerak} onPointerLeave={lepas} className={className}>
      {children}
    </div>
  );
}
