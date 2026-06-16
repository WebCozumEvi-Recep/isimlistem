import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { firmaUyeligi } from "@/lib/firma";
import { getAyar } from "@/lib/ayarlar";
import AppSidebar, { UstAksiyonBar, type SidebarItem } from "@/components/AppSidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const [okunmamis, uyelik, ayar] = await Promise.all([
    prisma.bildirim.count({ where: { kullaniciId: user.id, okundu: false } }),
    firmaUyeligi(user.id),
    getAyar(),
  ]);
  const firmaYonetici = !!uyelik && ["FIRMA_ADMIN", "ICERIK_YONETICI", "RAPOR_IZLEYICI"].includes(uyelik.rol);

  const items: SidebarItem[] = [
    { href: "/panel", etiket: "Panel", ikon: "LayoutGrid", exact: true },
    { href: "/panel/liste", etiket: "İsim Listesi", ikon: "List" },
    { href: "/panel/pano", etiket: "Pano", ikon: "KanbanSquare" },
    { href: "/panel/sayfalar", etiket: "Davet Sayfaları", ikon: "FileText" },
    { href: "/panel/kaliplar", etiket: "Mesaj Kalıpları", ikon: "MessageSquareText" },
    { href: "/panel/randevular", etiket: "Randevular", ikon: "CalendarClock" },
    { href: "/panel/bildirimler", etiket: "Bildirimler", ikon: "Bell", rozet: okunmamis },
  ];
  if (firmaYonetici) items.push({ href: "/firma", etiket: "Firma Paneli", ikon: "Building2", vurgu: true });
  if (user.rol === "ADMIN") items.push({ href: "/admin", etiket: "Yönetim", ikon: "Users" });

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar
        brandTitle={ayar.siteAdi}
        brandBadge={user.rol === "ADMIN" ? "Yönetici" : "Üye"}
        logoUrl={ayar.logoUrl}
        items={items}
        adSoyad={user.adSoyad}
        email={user.email}
        ustAksiyon={{ href: "/panel/kisi/yeni", etiket: "Kişi Ekle" }}
      />
      <div className="lg:pl-64">
        <UstAksiyonBar href="/panel/kisi/yeni" etiket="Kişi Ekle" />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
