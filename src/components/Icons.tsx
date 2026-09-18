import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={20}
      height={20}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconArrowRight = (p: Props) => (
  <Base {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Base>
);

export const IconChevronDown = (p: Props) => (
  <Base {...p}>
    <path d="M6 9l6 6 6-6" />
  </Base>
);

export const IconChevronRight = (p: Props) => (
  <Base {...p}>
    <path d="M9 5l7 7-7 7" />
  </Base>
);

export const IconMenu = (p: Props) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);

export const IconClose = (p: Props) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
);

export const IconPhone = (p: Props) => (
  <Base {...p}>
    <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 006.5 6.5L17 13l4 1.5v3a2 2 0 01-2.2 2A16.5 16.5 0 013.5 5.2 2 2 0 015.5 3z" />
  </Base>
);

export const IconMapPin = (p: Props) => (
  <Base {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.6" />
  </Base>
);

export const IconClock = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Base>
);

export const IconMail = (p: Props) => (
  <Base {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M3.5 7l8.5 6 8.5-6" />
  </Base>
);

export const IconCheck = (p: Props) => (
  <Base {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </Base>
);

export const IconPlus = (p: Props) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const IconMinus = (p: Props) => (
  <Base {...p}>
    <path d="M5 12h14" />
  </Base>
);

export const IconTrash = (p: Props) => (
  <Base {...p}>
    <path d="M4 7h16M9.5 7V5h5v2M6.5 7l.8 12a1.5 1.5 0 001.5 1.4h6.4a1.5 1.5 0 001.5-1.4L17.5 7" />
  </Base>
);

export const IconEdit = (p: Props) => (
  <Base {...p}>
    <path d="M4 20h4L19 9a2.1 2.1 0 00-3-3L5 17v3z" />
    <path d="M14.5 6.5l3 3" />
  </Base>
);

export const IconSearch = (p: Props) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Base>
);

export const IconSparkle = (p: Props) => (
  <Base {...p}>
    <path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z" />
    <path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
  </Base>
);

export const IconBox = (p: Props) => (
  <Base {...p}>
    <path d="M3.5 7.5L12 4l8.5 3.5v9L12 20l-8.5-3.5z" />
    <path d="M3.5 7.5L12 11l8.5-3.5M12 11v9" />
  </Base>
);

export const IconUsers = (p: Props) => (
  <Base {...p}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3.5 19.5c.6-3.2 3-5 5.5-5s4.9 1.8 5.5 5" />
    <path d="M16 6.2a3.2 3.2 0 010 6M17.5 19.5c-.3-2-1-3.5-2-4.5" />
  </Base>
);

export const IconWallet = (p: Props) => (
  <Base {...p}>
    <path d="M3.5 7.5A2 2 0 015.5 5.5h11a2 2 0 012 2v1" />
    <rect x="3.5" y="7.5" width="17" height="11" rx="2" />
    <circle cx="16.5" cy="13" r="1.3" />
  </Base>
);

export const IconTrendUp = (p: Props) => (
  <Base {...p}>
    <path d="M3.5 16.5l5.5-5.5 3.5 3.5 6-6.5" />
    <path d="M14.5 8h4v4" />
  </Base>
);

export const IconAlert = (p: Props) => (
  <Base {...p}>
    <path d="M12 4.5l8.5 15h-17z" />
    <path d="M12 10v4M12 17h.01" />
  </Base>
);

export const IconInfo = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8h.01" />
  </Base>
);

export const IconLogout = (p: Props) => (
  <Base {...p}>
    <path d="M14 7V5.5a1.5 1.5 0 00-1.5-1.5h-6A1.5 1.5 0 005 5.5v13A1.5 1.5 0 006.5 20h6a1.5 1.5 0 001.5-1.5V17" />
    <path d="M10 12h10M17 8.5l3.5 3.5-3.5 3.5" />
  </Base>
);

export const IconGrid = (p: Props) => (
  <Base {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </Base>
);

export const IconClipboard = (p: Props) => (
  <Base {...p}>
    <rect x="5" y="5" width="14" height="16" rx="2" />
    <path d="M9 5V3.8A.8.8 0 019.8 3h4.4a.8.8 0 01.8.8V5" />
    <path d="M8.5 11h7M8.5 15h4.5" />
  </Base>
);

export const IconCalculator = (p: Props) => (
  <Base {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M8.5 7.5h7M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" />
  </Base>
);

export const IconChart = (p: Props) => (
  <Base {...p}>
    <path d="M4 20V4M4 20h16" />
    <rect x="7.5" y="12" width="3" height="5" rx="0.8" />
    <rect x="13" y="8" width="3" height="9" rx="0.8" />
    <rect x="18" y="14" width="3" height="3" rx="0.8" fill="none" />
  </Base>
);

export const IconLeaf = (p: Props) => (
  <Base {...p}>
    <path d="M5 19c0-8 5.5-13 15-13 0 9.5-5 14-11 14a4 4 0 01-4-1z" />
    <path d="M5.5 18.5C9 15 12.5 12.5 16.5 10.5" />
  </Base>
);

export const IconWhatsapp = (p: Props) => (
  <Base {...p}>
    <path d="M3.8 20.2l1.3-4a8 8 0 113.1 3l-4.4 1z" />
    <path d="M9 9.2c0 3 2.4 5.2 5 5.4.6 0 1.3-.4 1.4-1l.1-.8-2-.9-.8.9a4.4 4.4 0 01-1.9-1.9l.9-.8-.9-2-.8.1c-.6.1-1 .7-1 1.3z" />
  </Base>
);

export const IconInstagram = (p: Props) => (
  <Base {...p}>
    <rect x="4" y="4" width="16" height="16" rx="4.5" />
    <circle cx="12" cy="12" r="3.4" />
    <path d="M16.8 7.4h.01" />
  </Base>
);

export const IconRefresh = (p: Props) => (
  <Base {...p}>
    <path d="M4.5 11a7.5 7.5 0 0113-4.6" />
    <path d="M19.5 13a7.5 7.5 0 01-13 4.6" />
    <path d="M17.5 3v3.5H14M6.5 21v-3.5H10" />
  </Base>
);

export const IconFilter = (p: Props) => (
  <Base {...p}>
    <path d="M4 6h16l-6.2 7.2V19l-3.6-2v-3.8z" />
  </Base>
);

export const IconImage = (p: Props) => (
  <Base {...p}>
    <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M4 16.5l4.2-3.6a1.6 1.6 0 012.1 0L14 16m1.5-1.3a1.6 1.6 0 012.1 0l2.4 2" />
  </Base>
);

export const IconMapArea = (p: Props) => (
  <Base {...p}>
    <path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" />
    <path d="M9 4.5v13M15 6.5v13" />
  </Base>
);

export const IconSend = (p: Props) => (
  <Base {...p}>
    <path d="M4.5 12L20 4.5 13.5 20l-2.4-6.1z" />
    <path d="M11.1 13.9L20 4.5" />
  </Base>
);
