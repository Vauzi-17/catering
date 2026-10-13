"use client";

/** Memanggil /api/* dengan token sesi pengguna. */
export async function panggilApi<T>(
  url: string,
  token: string | null,
  isi?: unknown,
  metode: "GET" | "POST" = "POST",
): Promise<{ ok: boolean; status: number; data: T & { galat?: string } }> {
  const res = await fetch(url, {
    method: metode,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: isi === undefined || metode === "GET" ? undefined : JSON.stringify(isi),
  });
  const data = (await res.json().catch(() => ({ galat: "Respons server tidak terbaca." }))) as T & {
    galat?: string;
  };
  return { ok: res.ok, status: res.status, data };
}
