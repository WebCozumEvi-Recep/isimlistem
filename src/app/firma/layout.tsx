import Link from "next/link";
import { requireFirmaYonetici } from "@/lib/firma";
import { cikisYap } from "@/app/auth/actions";
import { LayoutGrid, Building2, Users, MessageSquareText, FileText, BarChart3, LogOut, ArrowLeft } from "lucide-react";

export default async function FirmaLayout({ children }: { children: React.ReactNode }) {
  const { firma } = await requireFirmaYonetici();

  const linkler = [
    { href: "/firma", etiket: "Dashboard", icon: LayoutGrid },
    { href: "/firma/profil", etiket: "Firma Profili", icon: Building2 },
    { href: "/firma/networkerlar", etiket: "Networker'lar", icon: Users },
    { href: "/firma/kaliplar", etiket: "Mesaj Kalıpları", icon: MessageSquareText },
    { href: "/firma/sayfalar", etiket: "Davet Sayfaları", icon: FileText },
    { href: "/firma/raporlar", etiket: "Raporlar", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-indigo-600">{firma.ad}</span>
            <nav className="hidden items-center gap-1 lg:flex">
              {linkler.map((l) => (
                <Link key={l.href} href={l.href} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
                  <l.icon size={16} /> {l.etiket}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/panel" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
              <ArrowLeft size={15} /> Networker Paneli
            </Link>
            <form action={cikisYap}>
              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Çıkış">
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
