"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LINKLER = [
  { href: "#nasil", etiket: "Nasıl Çalışır" },
  { href: "#ozellikler", etiket: "Özellikler" },
  { href: "#networker", etiket: "Networker" },
  { href: "#kurumsal", etiket: "Kurumsal Firmalar" },
  { href: "#sss", etiket: "SSS" },
];

export default function LandingNav({ session, logoUrl, siteAdi = "İsim Listem", slogan }: { session: boolean; logoUrl?: string | null; siteAdi?: string; slogan?: string | null }) {
  const [acik, setAcik] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteAdi} className="h-9 w-auto max-w-[180px] object-contain" />
          ) : (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1c30] text-sm font-bold text-white">İL</span>
              <span className="leading-tight">
                <span className="block text-lg font-black text-[#0b1c30]">{siteAdi}</span>
                {slogan && <span className="hidden text-[11px] text-slate-500 sm:block">{slogan}</span>}
              </span>
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          {LINKLER.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-green-600">{l.etiket}</a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link href={session ? "/panel" : "/auth/giris"} className="text-sm font-medium text-slate-600 transition hover:text-green-600">
            {session ? "Panele Git" : "Giriş Yap"}
          </Link>
          {!session && (
            <Link href="/auth/kayit" className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600">
              Ücretsiz Başla
            </Link>
          )}
        </div>

        <button onClick={() => setAcik((v) => !v)} className="rounded-lg p-2 text-[#0b1c30] lg:hidden" aria-label="Menü">
          {acik ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {acik && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {LINKLER.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setAcik(false)} className="rounded-lg px-2 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                {l.etiket}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Link href={session ? "/panel" : "/auth/giris"} className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700">
                {session ? "Panele Git" : "Giriş Yap"}
              </Link>
              {!session && (
                <Link href="/auth/kayit" className="rounded-xl bg-green-500 px-4 py-2.5 text-center text-sm font-semibold text-white">
                  Ücretsiz Başla
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
