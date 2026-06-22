import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Compass } from "lucide-react";
import { firmaUyeligi } from "@/lib/firma";
import { getAyar } from "@/lib/ayarlar";
import { isAppMode } from "@/lib/app-mode";
import AppSidebar, { type SidebarItem } from "@/components/AppSidebar";
import MobilKabuk from "@/components/MobilKabuk";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const [okunmamis, aday, bekleyenRandevu, uyelik, ayar, profil] = await Promise.all([
    prisma.bildirim.count({ where: { kullaniciId: user.id, okundu: false } }),
    prisma.kisi.count({ where: { kullaniciId: user.id } }),
    prisma.randevuTalebi.count({ where: { kullaniciId: user.id, durum: "TALEP" } }),
    firmaUyeligi(user.id),
    getAyar(),
    prisma.kullanici.findUnique({ where: { id: user.id }, select: { profilFoto: true } }),
  ]);

  // Native uygulama içinde: üst başlık + alt tab native App.tsx tarafından çizilir; web yalnızca içerik.
  if (await isAppMode()) {
    return (
      <div className="min-h-screen overflow-x-clip bg-[#EEF1F5]">
        <main className="mx-auto max-w-3xl overflow-x-clip px-4 pb-28 pt-4 sm:px-6">{children}</main>
      </div>
    );
  }

  const firmaYonetici = !!uyelik && ["FIRMA_ADMIN", "ICERIK_YONETICI", "RAPOR_IZLEYICI"].includes(uyelik.rol);

  const items: SidebarItem[] = [
    { href: "/panel", etiket: "Panel", ikon: "LayoutGrid", exact: true },
    { href: "/panel/liste", etiket: "Aday İsim Listem", ikon: "List" },
    { href: "/panel/sayfalar", etiket: "Davet Sayfaları", ikon: "FileText" },
    { href: "/panel/kaliplar", etiket: "Davet Mesajları", ikon: "MessageSquareText" },
    { href: "/panel/randevular", etiket: "Randevular", ikon: "CalendarClock" },
    { href: "/panel/bildirimler", etiket: "Bildirimler", ikon: "Bell", rozet: okunmamis },
  ];
  if (firmaYonetici) items.push({ href: "/firma", etiket: "Firma Paneli", ikon: "Building2", vurgu: true });
  if (user.rol === "ADMIN") items.push({ href: "/admin", etiket: "Yönetim", ikon: "Users" });

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50">
      {/* Mobil tarayıcı: tasarım üst başlık + alt tab (lg altında) */}
      <MobilKabuk baslik={ayar.siteAdi} okunmamis={okunmamis} aday={aday} bekleyenRandevu={bekleyenRandevu} />
      <AppSidebar
        mobilGizle
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
      <div className="pb-24 pt-[56px] lg:pb-0 lg:pl-64 lg:pt-0">
        <div className="sticky top-0 z-20 hidden items-center justify-end gap-2 border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur lg:flex">
          <Link href="/panel/kesfet" className="flex items-center gap-1.5 rounded-xl border border-emerald-300 px-3.5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
            <Compass size={16} /> Keşfet
          </Link>
          <Link href="/panel/kisi/yeni" className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600">
            <Plus size={16} /> Aday İsim Ekle
          </Link>
        </div>
        <main className="mx-auto max-w-6xl overflow-x-clip px-4 pb-6 pt-4 sm:px-6 lg:py-6">{children}</main>
      </div>
    </div>
  );
}
