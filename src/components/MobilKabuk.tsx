"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cikisYap } from "@/app/auth/actions";
import { Home, Users, Bell, Calendar, User, Plus, Compass, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Sekme = { href: string; etiket: string; icon: LucideIcon; rozet?: number; rozetRenk?: string };

export default function MobilKabuk({
  baslik = "İsim Listem",
  okunmamis = 0,
  aday = 0,
  bekleyenRandevu = 0,
}: {
  baslik?: string;
  okunmamis?: number;
  aday?: number;
  bekleyenRandevu?: number;
}) {
  const pathname = usePathname();

  const sekmeler: Sekme[] = [
    { href: "/panel", etiket: "Anasayfa", icon: Home },
    { href: "/panel/liste", etiket: "Adaylar", icon: Users, rozet: aday, rozetRenk: "#16B364" },
    { href: "/panel/bildirimler", etiket: "Bildirimler", icon: Bell, rozet: okunmamis, rozetRenk: "#EF4444" },
    { href: "/panel/randevular", etiket: "Randevular", icon: Calendar, rozet: bekleyenRandevu, rozetRenk: "#EF4444" },
    { href: "/panel/profil", etiket: "Profil", icon: User },
  ];

  const aktifMi = (href: string) => (href === "/panel" ? pathname === "/panel" : pathname.startsWith(href));

  return (
    <>
      {/* Üst başlık */}
      <header
        className="fixed inset-x-0 top-0 z-40 bg-gradient-to-br from-[#0B1B3C] via-[#122A54] to-[#173666] lg:hidden"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex h-14 items-center gap-2 px-3">
          <form action={cikisYap} className="flex">
            <button aria-label="Çıkış" className="flex h-10 w-10 items-center justify-center rounded-xl text-white active:bg-white/10">
              <LogOut size={22} />
            </button>
          </form>
          <div className="flex-1 text-center text-[17px] font-bold tracking-[.2px] text-white">{baslik}</div>
          <Link href="/panel/kisi/yeni" aria-label="Aday Ekle" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white active:bg-white/20">
            <Plus size={22} />
          </Link>
          <Link href="/panel/kesfet" aria-label="Keşfet" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white active:bg-white/20">
            <Compass size={22} />
          </Link>
        </div>
      </header>

      {/* Alt sekme çubuğu */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-[#E4E9F0] bg-white/95 px-2.5 pt-2 backdrop-blur lg:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 14px)" }}
      >
        {sekmeler.map((s) => {
          const aktif = aktifMi(s.href);
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="flex w-[62px] flex-col items-center gap-1 py-1.5" style={{ color: aktif ? "#16B364" : "#94A3B8" }}>
              <span className="relative flex h-[30px] w-[46px] items-center justify-center rounded-xl transition-colors" style={{ background: aktif ? "rgba(22,179,100,.12)" : "transparent" }}>
                <Icon size={23} />
                {s.rozet && s.rozet > 0 ? (
                  <span className="absolute -top-px right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-[1.5px] border-white px-1 text-[9.5px] font-extrabold text-white" style={{ background: s.rozetRenk }}>
                    {s.rozet > 99 ? "99+" : s.rozet}
                  </span>
                ) : null}
              </span>
              <span className="text-[10.5px] font-bold">{s.etiket}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
