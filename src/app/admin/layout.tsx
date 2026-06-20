import { requireAdmin } from "@/lib/auth";
import { getAyar } from "@/lib/ayarlar";
import AppSidebar, { type SidebarItem } from "@/components/AppSidebar";
import FlashToast from "@/components/FlashToast";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const ayar = await getAyar();

  const items: SidebarItem[] = [
    { href: "/admin", etiket: "Dashboard", ikon: "LayoutGrid", exact: true },
    { href: "/admin/firmalar", etiket: "Firmalar", ikon: "Building2" },
    { href: "/admin/kullanicilar", etiket: "Kullanıcılar", ikon: "Users" },
    { href: "/admin/kaliplar", etiket: "Davet Mesajları", ikon: "MessageSquareText" },
    { href: "/admin/talepler", etiket: "Talep Formları", ikon: "Inbox" },
    { href: "/admin/ayarlar", etiket: "Sistem Ayarları", ikon: "Settings" },
    { href: "/panel", etiket: "Panele Dön", ikon: "ArrowLeft" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar brandTitle={ayar.siteAdi} brandBadge="Yönetim" logoUrl={ayar.logoUrl} items={items} adSoyad={user.adSoyad} email={user.email} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
      <FlashToast />
    </div>
  );
}
