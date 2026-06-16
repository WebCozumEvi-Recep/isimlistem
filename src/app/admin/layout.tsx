import { requireAdmin } from "@/lib/auth";
import AppSidebar, { type SidebarItem } from "@/components/AppSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  const items: SidebarItem[] = [
    { href: "/admin", etiket: "Dashboard", ikon: "LayoutGrid", exact: true },
    { href: "/admin/firmalar", etiket: "Firmalar", ikon: "Building2" },
    { href: "/admin/kullanicilar", etiket: "Kullanıcılar", ikon: "Users" },
    { href: "/admin/kaliplar", etiket: "Global Kalıplar", ikon: "MessageSquareText" },
    { href: "/panel", etiket: "Panele Dön", ikon: "ArrowLeft" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar brandTitle="İsim Listem" brandBadge="Yönetim" items={items} adSoyad={user.adSoyad} email={user.email} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
