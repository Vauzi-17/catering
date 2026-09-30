export function rupiah(nilai: number, ringkas = false): string {
  if (ringkas) {
    if (Math.abs(nilai) >= 1_000_000)
      return `Rp ${(nilai / 1_000_000).toFixed(1).replace(".", ",")} jt`;
    if (Math.abs(nilai) >= 1_000)
      return `Rp ${(nilai / 1_000).toFixed(0)} rb`;
  }
  return `Rp ${Math.round(nilai).toLocaleString("id-ID")}`;
}

export function angka(nilai: number, desimal = 0): string {
  return nilai.toLocaleString("id-ID", {
    minimumFractionDigits: desimal,
    maximumFractionDigits: desimal,
  });
}

export function persen(nilai: number, desimal = 1): string {
  return `${nilai.toFixed(desimal).replace(".", ",")}%`;
}

const namaBulan = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function tanggalPanjang(iso: string): string {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${namaHari[d.getDay()]}, ${d.getDate()} ${namaBulan[d.getMonth()]} ${d.getFullYear()}`;
}

export function tanggalPendek(iso: string): string {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${namaBulan[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

export function waktuRelatif(iso: string): string {
  const d = new Date(iso);
  const selisih = Date.now() - d.getTime();
  const jam = Math.floor(selisih / 3_600_000);
  if (jam < 1) return "beberapa menit lalu";
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;
  return tanggalPendek(iso);
}

export function tanggalHariIni(): string {
  const d = new Date();
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function tanggalPlus(hari: number): string {
  const d = new Date();
  d.setDate(d.getDate() + hari);
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function slugify(teks: string): string {
  return teks
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** "per box" → "box", dipakai untuk teks seperti "Min. 10 box". */
export function satuanMenu(menu: { satuanJual: string }): string {
  return menu.satuanJual.replace(/^per\s+/i, "");
}
