const warnaMark = {
  brand: "bg-brand-700",
  zamrud: "bg-zamrud-700",
} as const;

export function LogoMark({
  className = "h-9 w-9",
  warna = "brand",
}: {
  className?: string;
  warna?: keyof typeof warnaMark;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg text-white ${warnaMark[warna]} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-[60%] w-[60%]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21c-4-1-7-4.3-7-8.6C5 7.5 8.4 4 12 3c3.6 1 7 4.5 7 9.4 0 4.3-3 7.6-7 8.6z" />
        <path d="M12 21V8" />
        <path d="M12 12.5l3-2.5M12 15.5l-3-2.5" />
      </svg>
    </span>
  );
}

export function Logo({
  compact = false,
  warna = "brand",
}: {
  compact?: boolean;
  warna?: keyof typeof warnaMark;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className={compact ? "h-8 w-8" : "h-9 w-9"} warna={warna} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[19px] font-semibold text-ink">
          Asri Catering
        </span>
        {!compact && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Nasi Kotak &amp; Bento
          </span>
        )}
      </span>
    </span>
  );
}
