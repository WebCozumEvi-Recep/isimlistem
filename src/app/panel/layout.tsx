import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Compass } from "lucide-react";
import { firmaUyeligi } from "@/lib/firma";
import { getAyar } from "@/lib/ayarlar";
import AppSidebar, { type SidebarItem } from "@/components/AppSidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const [okunmamis, uyelik, ayar, profil] = await Promise.all([
    prisma.bildirim.count({ where: { kullaniciId: user.id, okundu: false } }),
    firmaUyeligi(user.id),
    getAyar(),
    prisma.kullanici.findUnique({ where: { id: user.id }, select: { profilFoto: true } }),
  ]);
  const firmaYonetici = !!uyelik && ["FIRMA_ADMIN", "ICERIK_YONETICI", "RAPOR_IZLEYICI"].includes(uyelik.rol);

  const items: SidebarItem[] = [
    { href: "/panel", etiket: "Panel", ikon: "LayoutGrid", exact: true },
    { href: "/panel/liste", etiket: "Aday İsim Listem", ikon: "List" },
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
        profilFoto={profil?.profilFoto}
        profilHref="/panel/profil"
        ustAksiyon={{ href: "/panel/kisi/yeni", etiket: "Kişi Ekle" }}
      />
      <div className="lg:pl-64">
        <div className="sticky top-0 z-20 hidden items-center justify-end gap-2 border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur lg:flex">
          <Link href="/panel/kesfet" className="flex items-center gap-1.5 rounded-xl border border-emerald-300 px-3.5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
            <Compass size={16} /> Keşfet
          </Link>
          <Link href="/panel/kisi/yeni" className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600">
            <Plus size={16} /> Aday İsim Ekle
          </Link>
        </div>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
