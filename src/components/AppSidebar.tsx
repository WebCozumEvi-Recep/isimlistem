"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cikisYap } from "@/app/auth/actions";
import {
  LayoutGrid, List, FileText, MessageSquareText, CalendarClock,
  Bell, Building2, Users, LogOut, Plus, Menu, X, BarChart3, ArrowLeft, Settings, Compass, Inbox,
} from "lucide-react";

const IKONLAR = {
  LayoutGrid, List, FileText, MessageSquareText, CalendarClock,
  Bell, Building2, Users, BarChart3, ArrowLeft, Settings, Compass, Inbox,
} as const;

export type SidebarItem = {
  href: string;
  etiket: string;
  ikon: keyof typeof IKONLAR;
  rozet?: number;
  vurgu?: boolean;
  exact?: boolean;
};

export default function AppSidebar({
  brandTitle, brandBadge, items, adSoyad, email, ustAksiyon, logoUrl, profilFoto, profilHref, mobilGizle,
}: {
  brandTitle: string;
  brandBadge?: string;
  items: SidebarItem[];
  adSoyad: string;
  email: string;
  ustAksiyon?: { href: string; etiket: string };
  logoUrl?: string | null;
  profilFoto?: string | null;
  profilHref?: string;
  /** Mobil üst bar + drawer'ı gizle (MobilKabuk devraldığında). */
  mobilGizle?: boolean;
}) {
  const [acik, setAcik] = useState(false);
  const pathname = usePathname();
  const aktifMi = (i: SidebarItem) => (i.exact ? pathname === i.href : pathname.startsWith(i.href) && (i.href !== "/panel" || pathname === "/panel"));

  const NavLink = ({ i }: { i: SidebarItem }) => {
    const Icon = IKONLAR[i.ikon];
    const aktif = aktifMi(i);
    return (
      <Link
        href={i.href}
        onClick={() => setAcik(false)}
        className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          aktif ? "bg-emerald-500 text-white shadow-sm" : i.vurgu ? "text-emerald-700 hover:bg-emerald-50" : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        <span className="flex items-center gap-3"><Icon size={18} /> {i.etiket}</span>
        {i.rozet ? (
          <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${aktif ? "bg-white text-emerald-600" : "bg-rose-500 text-white"}`}>
            {i.rozet > 9 ? "9+" : i.rozet}
          </span>
        ) : null}
      </Link>
    );
  };

  const Icerik = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Link href={items[0]?.href ?? "/panel"} className="flex items-center gap-2.5" onClick={() => setAcik(false)}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={brandTitle} className="h-9 w-auto max-w-[150px] object-contain" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-sm font-bold text-white">İL</span>
          )}
          {!logoUrl && (
            <div className="leading-tight">
              <div className="font-bold text-slate-900">{brandTitle}</div>
              {brandBadge && <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{brandBadge}</span>}
            </div>
          )}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {items.map((i) => <NavLink key={i.href} i={i} />)}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <Link href={profilHref ?? "#"} onClick={() => setAcik(false)} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50">
          {profilFoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profilFoto} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">{adSoyad.charAt(0).toUpperCase()}</span>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-900">{adSoyad}</div>
            <div className="truncate text-xs text-slate-400">{email}</div>
          </div>
        </Link>
        <form action={cikisYap}>
          <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50">
            <LogOut size={18} /> Çıkış Yap
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">{Icerik}</aside>

      {!mobilGizle && (
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setAcik(true)} className="rounded-lg p-1.5 text-slate-700"><Menu size={22} /></button>
          <span className="font-bold text-slate-900">{brandTitle}</span>
          {ustAksiyon ? (
            <Link href={ustAksiyon.href} className="rounded-lg bg-emerald-500 p-1.5 text-white"><Plus size={18} /></Link>
          ) : <span className="w-8" />}
        </div>
      )}

      {!mobilGizle && acik && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setAcik(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <button onClick={() => setAcik(false)} className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500"><X size={20} /></button>
            {Icerik}
          </div>
        </div>
      )}
    </>
  );
}

export function UstAksiyonBar({ href, etiket }: { href: string; etiket: string }) {
  return (
    <div className="sticky top-0 z-20 hidden items-center justify-end border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur lg:flex">
      <Link href={href} className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600">
        <Plus size={16} /> {etiket}
      </Link>
    </div>
  );
}
