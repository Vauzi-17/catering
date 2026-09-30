"use client";

import "leaflet/dist/leaflet.css";
import type { Circle, Map as PetaLeaflet, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { Crosshair, LoaderCircle, Search } from "lucide-react";
import { jarakKm, type Titik } from "@/lib/pembayaran";

export interface Dapur extends Titik {
  radiusKm: number;
}

// Pencarian & alamat memakai Nominatim (OpenStreetMap), gratis dengan batas
// wajar 1 permintaan per detik, jadi hanya dipanggil saat pengguna meminta.
const NOMINATIM = "https://nominatim.openstreetmap.org";

async function cariAlamat(kueri: string): Promise<{ lat: number; lng: number; label: string }[]> {
  const url = `${NOMINATIM}/search?format=jsonv2&limit=5&countrycodes=id&accept-language=id&q=${encodeURIComponent(kueri)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Pencarian alamat sedang tidak tersedia.");
  const data = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  return data.map((d) => ({ lat: Number(d.lat), lng: Number(d.lon), label: d.display_name }));
}

export async function alamatDariTitik(t: Titik): Promise<string> {
  const url = `${NOMINATIM}/reverse?format=jsonv2&accept-language=id&lat=${t.lat}&lon=${t.lng}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return "";
  const data = (await res.json()) as { display_name?: string };
  return data.display_name ?? "";
}

const IKON_PIN = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44"><path d="M17 43s15-14.2 15-26A15 15 0 1 0 2 17c0 11.8 15 26 15 26z" fill="#C96C0A" stroke="#fff" stroke-width="2.5"/><circle cx="17" cy="17" r="5.5" fill="#fff"/></svg>`;

export function PetaLokasi({
  nilai,
  onUbah,
  dapur,
}: {
  nilai: Titik | null;
  onUbah: (t: Titik) => void;
  dapur: Dapur;
}) {
  const wadah = useRef<HTMLDivElement>(null);
  const peta = useRef<PetaLeaflet | null>(null);
  const pin = useRef<Marker | null>(null);
  const lingkaran = useRef<Circle | null>(null);
  const onUbahRef = useRef(onUbah);
  onUbahRef.current = onUbah;

  const [kueri, setKueri] = useState("");
  const [hasil, setHasil] = useState<{ lat: number; lng: number; label: string }[]>([]);
  const [mencari, setMencari] = useState(false);
  const [pesan, setPesan] = useState("");

  // Peta dibuat sekali; Leaflet dimuat dinamis karena butuh window.
  useEffect(() => {
    let hidup = true;
    void import("leaflet").then((L) => {
      if (!hidup || !wadah.current || peta.current) return;
      const awal = nilai ?? dapur;
      const p = L.map(wadah.current, { scrollWheelZoom: false }).setView([awal.lat, awal.lng], nilai ? 16 : 12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(p);

      lingkaran.current = L.circle([dapur.lat, dapur.lng], {
        radius: dapur.radiusKm * 1000,
        color: "#0B6344",
        weight: 1.5,
        fillColor: "#12875B",
        fillOpacity: 0.06,
        dashArray: "6 6",
        interactive: false,
      }).addTo(p);

      const ikon = L.divIcon({ html: IKON_PIN, className: "", iconSize: [34, 44], iconAnchor: [17, 43] });
      const m = L.marker([awal.lat, awal.lng], { draggable: true, icon: ikon, opacity: nilai ? 1 : 0 }).addTo(p);
      m.on("dragend", () => {
        const { lat, lng } = m.getLatLng();
        onUbahRef.current({ lat, lng });
      });
      p.on("click", (e) => {
        m.setLatLng(e.latlng).setOpacity(1);
        onUbahRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      peta.current = p;
      pin.current = m;
    });
    return () => {
      hidup = false;
      peta.current?.remove();
      peta.current = null;
    };
    // Sengaja hanya saat pertama: posisi berikutnya diatur efek di bawah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sinkronkan pin bila nilai berubah dari luar (pencarian, GPS, profil).
  useEffect(() => {
    if (!nilai || !pin.current) return;
    const kini = pin.current.getLatLng();
    if (Math.abs(kini.lat - nilai.lat) > 1e-7 || Math.abs(kini.lng - nilai.lng) > 1e-7) {
      pin.current.setLatLng([nilai.lat, nilai.lng]);
    }
    pin.current.setOpacity(1);
  }, [nilai]);

  useEffect(() => {
    lingkaran.current?.setLatLng([dapur.lat, dapur.lng]).setRadius(dapur.radiusKm * 1000);
  }, [dapur]);

  function pilih(t: Titik) {
    onUbah(t);
    peta.current?.setView([t.lat, t.lng], 16);
  }

  async function cari(e?: React.FormEvent) {
    e?.preventDefault();
    if (kueri.trim().length < 3) return;
    setMencari(true);
    setPesan("");
    try {
      const r = await cariAlamat(kueri.trim());
      setHasil(r);
      if (r.length === 0) setPesan("Alamat tidak ditemukan. Coba nama jalan atau gedung yang lebih umum, lalu geser pin.");
    } catch (err) {
      setPesan((err as Error).message);
    } finally {
      setMencari(false);
    }
  }

  function lokasiSaya() {
    if (!navigator.geolocation) return setPesan("Browser tidak mendukung lokasi.");
    setPesan("Mencari lokasi Anda…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPesan("");
        pilih({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setPesan("Izin lokasi ditolak. Cari alamat atau ketuk peta untuk menandai lokasi."),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  const jarak = nilai ? jarakKm(dapur, nilai) : null;
  const diLuar = jarak !== null && jarak > dapur.radiusKm;

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* Bukan <form> karena komponen ini dipakai di dalam formulir lain. */}
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={kueri}
            onChange={(e) => setKueri(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void cari();
              }
            }}
            placeholder="Cari nama jalan, gedung, atau daerah"
            className="isian h-11 pl-9"
            aria-label="Cari alamat di peta"
          />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void cari()} disabled={mencari} className="tombol tombol-md tombol-garis flex-1 sm:flex-none">
            {mencari ? <LoaderCircle size={16} className="animate-spin" /> : "Cari"}
          </button>
          <button type="button" onClick={lokasiSaya} className="tombol tombol-md tombol-garis flex-1 sm:flex-none">
            <Crosshair size={16} />
            Lokasi saya
          </button>
        </div>
      </div>

      {hasil.length > 0 && (
        <ul className="mt-2 divide-y divide-kabut-line overflow-hidden rounded-lg border border-kabut-line bg-white text-[13px]">
          {hasil.map((h) => (
            <li key={`${h.lat},${h.lng}`}>
              <button
                type="button"
                onClick={() => {
                  pilih(h);
                  setHasil([]);
                }}
                className="w-full px-3.5 py-2.5 text-left text-ink-soft hover:bg-kabut"
              >
                {h.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {pesan && <p className="mt-2 text-[13px] text-ink-muted">{pesan}</p>}

      <div
        ref={wadah}
        className="relative z-0 mt-3 h-72 w-full overflow-hidden rounded-xl border border-kabut-line bg-kabut sm:h-80"
        aria-label="Peta lokasi pengantaran. Ketuk peta atau geser pin untuk menandai lokasi."
      />

      <p className={`mt-2 text-[13px] ${diLuar ? "font-semibold text-red-700" : "text-ink-muted"}`}>
        {jarak === null
          ? "Ketuk peta atau geser pin ke lokasi acara. Garis putus-putus menandai area layanan."
          : diLuar
            ? `Lokasi berjarak ${jarak.toFixed(1)} km dari dapur, di luar area layanan (${dapur.radiusKm} km).`
            : `Lokasi berjarak ${jarak.toFixed(1)} km dari dapur. Termasuk area layanan, ongkir gratis.`}
      </p>
    </div>
  );
}
