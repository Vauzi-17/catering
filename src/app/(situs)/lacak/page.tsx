import { redirect } from "next/navigation";

// Pelacakan dengan kode diganti halaman Pesanan Saya (wajib login).
export default function HalamanLacak() {
  redirect("/pesanan/");
}
