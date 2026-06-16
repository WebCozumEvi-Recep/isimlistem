import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cikisYap } from "@/app/auth/actions";
import { LayoutGrid, List, KanbanSquare, Users, LogOut, Plus, MessageSquareText, FileText, CalendarClock, Bell } from "lucide-react";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const okunmamis = await prisma.bildirim.count({
    where: { kullaniciId: user.id, okundu: false },
  });

  const linkler = [
    { href: "/panel", etiket: "Panel", icon: LayoutGrid },
    { href: "/panel/liste", etiket: "İsim Listesi", icon: List },
    { href: "/panel/pano", etiket: "Pano", icon: KanbanSquare },
    { href: "/panel/sayfalar", etiket: "Davet Sayfaları", icon: FileText },
    { href: "/panel/kaliplar", etiket: "Mesaj Kalıpları", icon: MessageSquareText },
    { href: "/panel/randevular", etiket: "Randevular", icon: CalendarClock },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/panel" className="text-lg font-bold text-indigo-600">
              İsim Listem
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {linkler.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <l.icon size={16} />
                  {l.etiket}
                </Link>
              ))}
              {user.rol === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <Users size={16} />
                  Yönetim
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/panel/bildirimler"
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              title="Bildirimler"
            >
              <Bell size={18} />
              {okunmamis > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {okunmamis > 9 ? "9+" : okunmamis}
                </span>
              )}
            </Link>
            <Link
              href="/panel/kisi/yeni"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus size={16} /> Kişi Ekle
            </Link>
            <span className="hidden text-sm text-slate-500 sm:inline">
              {user.adSoyad}
            </span>
            <form action={cikisYap}>
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                title="Çıkış"
              >
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
