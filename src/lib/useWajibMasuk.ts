"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/store/AuthProvider";

/**
 * Mengarahkan pengunjung yang belum login ke /masuk, lalu kembali ke
 * halaman ini setelah berhasil masuk.
 */
export function useWajibMasuk() {
  const auth = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (auth.aktif && auth.siap && !auth.pengguna) {
      router.replace(`/masuk/?lanjut=${encodeURIComponent(path)}`);
    }
  }, [auth.aktif, auth.siap, auth.pengguna, router, path]);

  return auth;
}
