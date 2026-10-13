import { EfekGulir } from "@/components/efek/EfekGulir";
import { KeranjangLaci } from "@/components/KeranjangLaci";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function SitusLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-kabut">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <KeranjangLaci />
      <EfekGulir />
    </div>
  );
}
