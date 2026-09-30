"use client";

import { MenuCard } from "@/components/MenuCard";
import type { Menu } from "@/lib/types";
import { useData } from "@/store/DataProvider";

/** Menu bertanda populer, ditambah menu lain bila jumlahnya kurang. */
export function pilihMenuLaris(menus: Menu[], jumlah: number) {
  const populer = menus.filter((m) => m.populer && m.tersedia);
  const cadangan = menus.filter((m) => !m.populer && m.tersedia);
  return [...populer, ...cadangan].slice(0, jumlah);
}

export function MenuLaris({ jumlah = 4 }: { jumlah?: number }) {
  const { menus } = useData();
  const tampil = pilihMenuLaris(menus, jumlah);

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {tampil.map((menu) => (
        <MenuCard key={menu.id} menu={menu} />
      ))}
    </div>
  );
}
