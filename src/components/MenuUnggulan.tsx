"use client";

import { MenuCard } from "@/components/MenuCard";
import { useData } from "@/store/DataProvider";

export function MenuUnggulan({ jumlah = 4 }: { jumlah?: number }) {
  const { menus } = useData();
  const pilihan = menus.filter((m) => m.populer && m.tersedia).slice(0, jumlah);
  const tampil =
    pilihan.length >= jumlah
      ? pilihan
      : [...pilihan, ...menus.filter((m) => !m.populer && m.tersedia)].slice(0, jumlah);

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {tampil.map((menu) => (
        <MenuCard key={menu.id} menu={menu} />
      ))}
    </div>
  );
}
