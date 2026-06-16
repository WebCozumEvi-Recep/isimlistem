import { requireFirmaYonetici } from "@/lib/firma";
import AppSidebar, { type SidebarItem } from "@/components/AppSidebar";

export default async function FirmaLayout({ children }: { children: React.ReactNode }) {
  const { user, firma } = await requireFirmaYonetici();

  const items: SidebarItem[] = [
    { href: "/firma", etiket: "Dashboard", ikon: "LayoutGrid", exact: true },
    { href: "/firma/profil", etiket: "Firma Profili", ikon: "Building2" },
    { href: "/firma/networkerlar", etiket: "Networker'lar", ikon: "Users" },
    { href: "/firma/kaliplar", etiket: "Mesaj Kalıpları", ikon: "MessageSquareText" },
    { href: "/firma/sayfalar", etiket: "Davet Sayfaları", ikon: "FileText" },
    { href: "/firma/raporlar", etiket: "Raporlar", ikon: "BarChart3" },
    { href: "/panel", etiket: "Networker Paneli", ikon: "ArrowLeft" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar brandTitle={firma.ad} brandBadge="Business" items={items} adSoyad={user.adSoyad} email={user.email} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
