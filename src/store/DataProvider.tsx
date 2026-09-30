"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { bahanAwal } from "@/data/bahan";
import { menuAwal } from "@/data/menu";
import { buatPesananAwal } from "@/data/pesanan";
import * as db from "@/lib/db";
import { supabaseAktif } from "@/lib/supabase";
import type { Bahan, Menu, Pesanan, StatusPesanan } from "@/lib/types";

const KUNCI = {
  menu: "asri.menu.v2",
  bahan: "asri.bahan.v2",
  pesanan: "asri.pesanan.v2",
  keranjang: "asri.keranjang.v1",
  sesi: "asri.sesi.v1",
  pengaturan: "asri.pengaturan.v1",
};

export interface ItemKeranjang {
  menuId: string;
  qty: number;
}

export interface Pengaturan {
  overheadPersen: number;
  targetMargin: number;
  biayaOperasionalHarian: number;
}

const pengaturanAwal: Pengaturan = {
  overheadPersen: 8,
  targetMargin: 30,
  biayaOperasionalHarian: 150000,
};

interface KonteksData {
  /** true setelah pemuatan awal selesai. */
  siap: boolean;
  /** true saat ada permintaan ke Supabase yang sedang berjalan. */
  sibuk: boolean;
  /** Pesan galat terakhir dari basis data, null bila tidak ada. */
  galat: string | null;
  bersihkanGalat: () => void;
  /** true bila aplikasi terhubung ke Supabase, false bila memakai data contoh. */
  daring: boolean;

  menus: Menu[];
  bahan: Bahan[];
  pesanan: Pesanan[];
  keranjang: ItemKeranjang[];
  pengaturan: Pengaturan;
  masuk: boolean;

  /** Memuat daftar pesanan. Dipanggil panel admin saat pertama dibuka. */
  muatPesanan: () => Promise<void>;

  simpanMenu: (menu: Menu) => Promise<void>;
  hapusMenu: (id: string) => Promise<void>;
  simpanBahan: (bahan: Bahan) => Promise<void>;
  hapusBahan: (id: string) => Promise<void>;

  tambahKeranjang: (menuId: string, qty: number) => void;
  ubahQtyKeranjang: (menuId: string, qty: number) => void;
  hapusKeranjang: (menuId: string) => void;
  kosongkanKeranjang: () => void;

  buatPesanan: (
    data: Omit<Pesanan, "id" | "kode" | "status" | "dibuatPada" | "riwayat" | "total">,
  ) => Promise<Pesanan>;
  ubahStatusPesanan: (id: string, status: StatusPesanan) => Promise<void>;
  cariPesanan: (kode: string) => Promise<Pesanan | null>;

  simpanPengaturan: (p: Pengaturan) => Promise<void>;
  login: (pengguna: string, sandi: string) => boolean;
  logout: () => void;
  resetData: () => void;
}

const Konteks = createContext<KonteksData | null>(null);

function baca<T>(kunci: string, cadangan: T): T {
  if (typeof window === "undefined") return cadangan;
  try {
    const mentah = window.localStorage.getItem(kunci);
    return mentah ? (JSON.parse(mentah) as T) : cadangan;
  } catch {
    return cadangan;
  }
}

function tulis(kunci: string, nilai: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(kunci, JSON.stringify(nilai));
  } catch {
    /* penyimpanan penuh atau diblokir — abaikan */
  }
}

const STATUS_SAH: StatusPesanan[] = [
  "Menunggu Konfirmasi",
  "Diproses",
  "Selesai",
  "Dibatalkan",
];

/**
 * Menyesuaikan data lama yang tersimpan di peramban. Status "Siap Diantar"
 * pernah dipakai pada versi sebelumnya dan kini digabung ke "Diproses".
 */
function rapikanPesanan(daftar: Pesanan[]): Pesanan[] {
  return daftar.map((p) => ({
    ...p,
    status: STATUS_SAH.includes(p.status) ? p.status : "Diproses",
    riwayat: p.riwayat.filter((r) => STATUS_SAH.includes(r.status)),
  }));
}

function pesanGalat(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e && "message" in e) return String(e.message);
  return "Terjadi kesalahan saat menghubungi basis data.";
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [siap, setSiap] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const [menus, setMenus] = useState<Menu[]>(menuAwal);
  const [bahan, setBahan] = useState<Bahan[]>(bahanAwal);
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [keranjang, setKeranjang] = useState<ItemKeranjang[]>([]);
  const [pengaturan, setPengaturan] = useState<Pengaturan>(pengaturanAwal);
  const [masuk, setMasuk] = useState(false);

  const pesananTermuat = useRef(false);

  // ------------------------------------------------------------ pemuatan
  useEffect(() => {
    let dibatalkan = false;

    async function muat() {
      // Keranjang dan sesi selalu lokal, tidak ikut disimpan ke basis data.
      setKeranjang(baca(KUNCI.keranjang, []));
      setMasuk(baca(KUNCI.sesi, false));

      if (!supabaseAktif) {
        setMenus(baca(KUNCI.menu, menuAwal));
        setBahan(baca(KUNCI.bahan, bahanAwal));
        const tersimpan = baca<Pesanan[] | null>(KUNCI.pesanan, null);
        setPesanan(tersimpan ? rapikanPesanan(tersimpan) : buatPesananAwal());
        setPengaturan(baca(KUNCI.pengaturan, pengaturanAwal));
        pesananTermuat.current = true;
        setSiap(true);
        return;
      }

      try {
        const [daftarMenu, daftarBahan, setelan] = await Promise.all([
          db.ambilMenus(),
          db.ambilBahan(),
          db.ambilPengaturan(),
        ]);
        if (dibatalkan) return;
        setMenus(daftarMenu);
        setBahan(daftarBahan);
        if (setelan) setPengaturan(setelan);
      } catch (e) {
        if (!dibatalkan) setGalat(pesanGalat(e));
      } finally {
        if (!dibatalkan) setSiap(true);
      }
    }

    void muat();
    return () => {
      dibatalkan = true;
    };
  }, []);

  // Penyimpanan lokal hanya dipakai pada mode contoh.
  useEffect(() => {
    if (siap && !supabaseAktif) tulis(KUNCI.menu, menus);
  }, [menus, siap]);
  useEffect(() => {
    if (siap && !supabaseAktif) tulis(KUNCI.bahan, bahan);
  }, [bahan, siap]);
  useEffect(() => {
    if (siap && !supabaseAktif) tulis(KUNCI.pesanan, pesanan);
  }, [pesanan, siap]);
  useEffect(() => {
    if (siap && !supabaseAktif) tulis(KUNCI.pengaturan, pengaturan);
  }, [pengaturan, siap]);

  useEffect(() => {
    if (siap) tulis(KUNCI.keranjang, keranjang);
  }, [keranjang, siap]);
  useEffect(() => {
    if (siap) tulis(KUNCI.sesi, masuk);
  }, [masuk, siap]);

  /**
   * Daftar pesanan tidak ikut dimuat di halaman pelanggan supaya data pemesan
   * tidak diambil tanpa perlu. Panel admin memanggil fungsi ini sekali.
   */
  const muatPesanan = useCallback(async () => {
    if (pesananTermuat.current || !supabaseAktif) return;
    pesananTermuat.current = true;
    setSibuk(true);
    try {
      setPesanan(await db.ambilPesanan());
    } catch (e) {
      pesananTermuat.current = false;
      setGalat(pesanGalat(e));
    } finally {
      setSibuk(false);
    }
  }, []);

  // ------------------------------------------------------------- mutasi

  /** Membungkus operasi tulis: menyalakan indikator sibuk dan menangkap galat. */
  const jalankan = useCallback(async (aksi: () => Promise<void>) => {
    setSibuk(true);
    setGalat(null);
    try {
      await aksi();
    } catch (e) {
      setGalat(pesanGalat(e));
      throw e;
    } finally {
      setSibuk(false);
    }
  }, []);

  const gantiDaftar = <T extends { id: string }>(lama: T[], baru: T, idLama: string) => {
    const ada = lama.some((x) => x.id === idLama);
    return ada ? lama.map((x) => (x.id === idLama ? baru : x)) : [...lama, baru];
  };

  const simpanMenu = useCallback(
    async (menu: Menu) => {
      if (!supabaseAktif) {
        setMenus((lama) => gantiDaftar(lama, menu, menu.id));
        return;
      }
      await jalankan(async () => {
        const tersimpan = await db.simpanMenuDb(menu);
        setMenus((lama) => gantiDaftar(lama, tersimpan, menu.id));
      });
    },
    [jalankan],
  );

  const hapusMenu = useCallback(
    async (id: string) => {
      if (supabaseAktif) await jalankan(() => db.hapusMenuDb(id));
      setMenus((lama) => lama.filter((m) => m.id !== id));
    },
    [jalankan],
  );

  const simpanBahan = useCallback(
    async (item: Bahan) => {
      if (!supabaseAktif) {
        setBahan((lama) => gantiDaftar(lama, item, item.id));
        return;
      }
      await jalankan(async () => {
        const tersimpan = await db.simpanBahanDb(item);
        setBahan((lama) => gantiDaftar(lama, tersimpan, item.id));
      });
    },
    [jalankan],
  );

  const hapusBahan = useCallback(
    async (id: string) => {
      if (supabaseAktif) await jalankan(() => db.hapusBahanDb(id));
      setBahan((lama) => lama.filter((b) => b.id !== id));
    },
    [jalankan],
  );

  // ---------------------------------------------------------- keranjang

  const tambahKeranjang = useCallback((menuId: string, qty: number) => {
    setKeranjang((lama) => {
      const ada = lama.find((k) => k.menuId === menuId);
      if (ada) {
        return lama.map((k) => (k.menuId === menuId ? { ...k, qty: k.qty + qty } : k));
      }
      return [...lama, { menuId, qty }];
    });
  }, []);

  const ubahQtyKeranjang = useCallback((menuId: string, qty: number) => {
    setKeranjang((lama) =>
      qty <= 0
        ? lama.filter((k) => k.menuId !== menuId)
        : lama.map((k) => (k.menuId === menuId ? { ...k, qty } : k)),
    );
  }, []);

  const hapusKeranjang = useCallback((menuId: string) => {
    setKeranjang((lama) => lama.filter((k) => k.menuId !== menuId));
  }, []);

  const kosongkanKeranjang = useCallback(() => setKeranjang([]), []);

  // ------------------------------------------------------------ pesanan

  const buatPesanan: KonteksData["buatPesanan"] = useCallback(
    async (data) => {
      if (supabaseAktif) {
        setSibuk(true);
        setGalat(null);
        try {
          const baru = await db.buatPesananDb(data);
          setPesanan((lama) => [baru, ...lama]);
          return baru;
        } catch (e) {
          setGalat(pesanGalat(e));
          throw e;
        } finally {
          setSibuk(false);
        }
      }

      const sekarang = new Date();
      const p = (n: number) => n.toString().padStart(2, "0");
      const urut = Math.floor(Math.random() * 900 + 100);
      const kode = `ASR-${sekarang.getFullYear().toString().slice(2)}${p(
        sekarang.getMonth() + 1,
      )}${p(sekarang.getDate())}-${urut}`;
      const total = data.items.reduce((a, it) => a + it.harga * it.qty, 0);

      const baru: Pesanan = {
        ...data,
        id: `ps-${sekarang.getTime()}`,
        kode,
        total,
        status: "Menunggu Konfirmasi",
        dibuatPada: sekarang.toISOString(),
        riwayat: [{ status: "Menunggu Konfirmasi", waktu: sekarang.toISOString() }],
      };
      setPesanan((lama) => [baru, ...lama]);
      return baru;
    },
    [],
  );

  const ubahStatusPesanan = useCallback(
    async (id: string, status: StatusPesanan) => {
      if (supabaseAktif) await jalankan(() => db.ubahStatusPesananDb(id, status));
      setPesanan((lama) =>
        lama.map((p) =>
          p.id === id
            ? {
                ...p,
                status,
                riwayat: [...p.riwayat, { status, waktu: new Date().toISOString() }],
              }
            : p,
        ),
      );
    },
    [jalankan],
  );

  const cariPesanan = useCallback(
    async (kode: string): Promise<Pesanan | null> => {
      const bersih = kode.trim();
      if (!bersih) return null;

      const lokal = pesanan.find(
        (p) => p.kode.toLowerCase() === bersih.toLowerCase(),
      );
      if (lokal) return lokal;
      if (!supabaseAktif) return null;

      setSibuk(true);
      try {
        return await db.cariPesananKode(bersih);
      } catch (e) {
        setGalat(pesanGalat(e));
        return null;
      } finally {
        setSibuk(false);
      }
    },
    [pesanan],
  );

  // --------------------------------------------------------- pengaturan

  const simpanPengaturan = useCallback(
    async (p: Pengaturan) => {
      setPengaturan(p);
      if (supabaseAktif) await jalankan(() => db.simpanPengaturanDb(p));
    },
    [jalankan],
  );

  // Autentikasi demo tanpa backend. Diganti Supabase Auth pada tahap berikutnya
  // (lihat supabase/04-rls-produksi.sql).
  const login = useCallback((pengguna: string, sandi: string) => {
    const valid = pengguna.trim().toLowerCase() === "admin" && sandi === "asri2025";
    if (valid) setMasuk(true);
    return valid;
  }, []);

  const logout = useCallback(() => setMasuk(false), []);

  const resetData = useCallback(() => {
    if (supabaseAktif) return; // data sungguhan tidak boleh dihapus dari sini
    setMenus(menuAwal);
    setBahan(bahanAwal);
    setPesanan(buatPesananAwal());
    setKeranjang([]);
    setPengaturan(pengaturanAwal);
  }, []);

  const bersihkanGalat = useCallback(() => setGalat(null), []);

  const nilai = useMemo<KonteksData>(
    () => ({
      siap,
      sibuk,
      galat,
      bersihkanGalat,
      daring: supabaseAktif,
      menus,
      bahan,
      pesanan,
      keranjang,
      pengaturan,
      masuk,
      muatPesanan,
      simpanMenu,
      hapusMenu,
      simpanBahan,
      hapusBahan,
      tambahKeranjang,
      ubahQtyKeranjang,
      hapusKeranjang,
      kosongkanKeranjang,
      buatPesanan,
      ubahStatusPesanan,
      cariPesanan,
      simpanPengaturan,
      login,
      logout,
      resetData,
    }),
    [
      siap,
      sibuk,
      galat,
      bersihkanGalat,
      menus,
      bahan,
      pesanan,
      keranjang,
      pengaturan,
      masuk,
      muatPesanan,
      simpanMenu,
      hapusMenu,
      simpanBahan,
      hapusBahan,
      tambahKeranjang,
      ubahQtyKeranjang,
      hapusKeranjang,
      kosongkanKeranjang,
      buatPesanan,
      ubahStatusPesanan,
      cariPesanan,
      simpanPengaturan,
      login,
      logout,
      resetData,
    ],
  );

  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}

export function useData() {
  const konteks = useContext(Konteks);
  if (!konteks) throw new Error("useData harus dipakai di dalam DataProvider");
  return konteks;
}
