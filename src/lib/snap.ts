"use client";

/**
 * Popup pembayaran Midtrans Snap.
 *
 * Skrip snap.js dimuat sekali saat dibutuhkan. Kunci sandbox Midtrans selalu
 * diawali "SB-", jadi alamat skrip sandbox/produksi dipilih dari client key.
 */
interface SnapJs {
  pay: (
    token: string,
    opsi: {
      onSuccess?: (r: unknown) => void;
      onPending?: (r: unknown) => void;
      onError?: (r: unknown) => void;
      onClose?: () => void;
    },
  ) => void;
}

declare global {
  interface Window {
    snap?: SnapJs;
  }
}

const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";

let memuat: Promise<SnapJs | null> | null = null;

function muatSnap(): Promise<SnapJs | null> {
  if (typeof window === "undefined" || !CLIENT_KEY) return Promise.resolve(null);
  if (window.snap) return Promise.resolve(window.snap);
  memuat ??= new Promise((selesai) => {
    const skrip = document.createElement("script");
    skrip.src = CLIENT_KEY.startsWith("SB-")
      ? "https://app.sandbox.midtrans.com/snap/snap.js"
      : "https://app.midtrans.com/snap/snap.js";
    skrip.setAttribute("data-client-key", CLIENT_KEY);
    skrip.async = true;
    skrip.onload = () => selesai(window.snap ?? null);
    skrip.onerror = () => {
      memuat = null;
      selesai(null);
    };
    document.body.appendChild(skrip);
  });
  return memuat;
}

export type HasilSnap = "sukses" | "menunggu" | "ditutup" | "galat";

/**
 * Membuka popup Snap. Bila skrip tidak bisa dimuat (client key kosong atau
 * diblokir), pelanggan dialihkan ke halaman pembayaran Midtrans sebagai
 * cadangan dan fungsi ini tidak pernah selesai.
 */
export async function bayarDenganSnap(token: string, redirectUrl: string): Promise<HasilSnap> {
  const snap = await muatSnap();
  if (!snap) {
    window.location.href = redirectUrl;
    return new Promise(() => {});
  }
  return new Promise((selesai) => {
    snap.pay(token, {
      onSuccess: () => selesai("sukses"),
      onPending: () => selesai("menunggu"),
      onError: () => selesai("galat"),
      onClose: () => selesai("ditutup"),
    });
  });
}

/** Memanggil /api/* dengan token sesi pengguna. */
export async function panggilApi<T>(
  url: string,
  token: string | null,
  isi?: unknown,
): Promise<{ ok: boolean; status: number; data: T & { galat?: string } }> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: isi === undefined ? undefined : JSON.stringify(isi),
  });
  const data = (await res.json().catch(() => ({ galat: "Respons server tidak terbaca." }))) as T & {
    galat?: string;
  };
  return { ok: res.ok, status: res.status, data };
}
