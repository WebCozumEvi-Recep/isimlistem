"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LINKLER = [
  { href: "#nasil", etiket: "Nasıl Çalışır" },
  { href: "#ozellikler", etiket: "Özellikler" },
  { href: "#networker", etiket: "Networker" },
  { href: "#kurumsal", etiket: "Kurumsal" },
  { href: "#sss", etiket: "SSS" },
];

export default function LandingNav({ session }: { session: boolean }) {
  const [acik, setAcik] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-sm font-bold text-white">İL</span>
          <span className="leading-tight">
            <span className="block text-base font-bold text-slate-900">İsim Listem</span>
            <span className="hidden text-[11px] text-slate-500 sm:block">Networker’lar için aday takip sistemi</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
          {LINKLER.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-slate-900">{l.etiket}</a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href={session ? "/panel" : "/auth/giris"} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            {session ? "Panele Git" : "Giriş Yap"}
          </Link>
          {!session && (
            <Link href="/auth/kayit" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600">
              Ücretsiz Başla
            </Link>
          )}
        </div>

        <button onClick={() => setAcik((v) => !v)} className="rounded-lg p-2 text-slate-700 lg:hidden" aria-label="Menü">
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
                <Link href="/auth/kayit" className="rounded-xl bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-white">
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
