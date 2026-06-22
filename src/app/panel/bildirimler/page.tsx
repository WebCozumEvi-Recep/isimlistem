import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tumBildirimleriOku } from "@/app/panel/davet-actions";
import {
  Bell, CheckCheck, Eye, PlayCircle, ThumbsUp, CalendarClock, MessageCircle,
  Clock, BellOff, ChevronLeft, ChevronRight, Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SAYFA_BOYU = 25;

type Stil = { etiket: string; Icon: LucideIcon; renk: string };
const TIP_STILI: Record<string, Stil> = {
  LINK_ACILDI: { etiket: "Link Açıldı", Icon: Eye, renk: "bg-sky-100 text-sky-600" },
  VIDEO_IZLEDI: { etiket: "Video İzledi", Icon: PlayCircle, renk: "bg-violet-100 text-violet-600" },
  ILGILENIYOR: { etiket: "İlgileniyor", Icon: ThumbsUp, renk: "bg-emerald-100 text-emerald-600" },
  RANDEVU: { etiket: "Randevu", Icon: CalendarClock, renk: "bg-indigo-100 text-indigo-600" },
  WHATSAPP_DONUS: { etiket: "WhatsApp", Icon: MessageCircle, renk: "bg-green-100 text-green-600" },
  TAKIP_ZAMANI: { etiket: "Takip Zamanı", Icon: Clock, renk: "bg-amber-100 text-amber-600" },
  ACILMAYAN_DAVET: { etiket: "Açılmayan Davet", Icon: BellOff, renk: "bg-rose-100 text-rose-600" },
};
const VARSAYILAN_STIL: Stil = { etiket: "Bildirim", Icon: Bell, renk: "bg-slate-100 text-slate-500" };

// "Önemli" filtresinde gösterilecek yüksek değerli aksiyonlar.
const ONEMLI_TIPLER = ["ILGILENIYOR", "RANDEVU", "WHATSAPP_DONUS"];

const ARALIKLAR = [
  { key: "tumu", etiket: "Tüm zamanlar" },
  { key: "bugun", etiket: "Bugün" },
  { key: "7g", etiket: "Son 7 gün" },
  { key: "30g", etiket: "Son 30 gün" },
];

function aralikBaslangic(key: string): Date | null {
  const now = new Date();
  if (key === "bugun") { const d = new Date(now); d.setHours(0, 0, 0, 0); return d; }
  if (key === "7g") return new Date(now.getTime() - 7 * 864e5);
  if (key === "30g") return new Date(now.getTime() - 30 * 864e5);
  return null;
}

export default async function BildirimlerSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ tip?: string; aralik?: string; sayfa?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const tip = sp.tip ?? "tumu";
  const aralik = ARALIKLAR.some((a) => a.key === sp.aralik) ? sp.aralik! : "tumu";
  const sayfa = Math.max(1, Number(sp.sayfa) || 1);

  const baslangic = aralikBaslangic(aralik);
  const where = {
    kullaniciId: user.id,
    ...(tip === "onemli" ? { tip: { in: ONEMLI_TIPLER as never } } : tip !== "tumu" ? { tip: tip as never } : {}),
    ...(baslangic ? { createdAt: { gte: baslangic } } : {}),
  };

  const [toplam, okunmamisToplam, bildirimler] = await Promise.all([
    prisma.bildirim.count({ where }),
    prisma.bildirim.count({ where: { kullaniciId: user.id, okundu: false } }),
    prisma.bildirim.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (sayfa - 1) * SAYFA_BOYU,
      take: SAYFA_BOYU,
    }),
  ]);
  const sayfaSayisi = Math.max(1, Math.ceil(toplam / SAYFA_BOYU));

  // Filtre linki üretici (tip/aralık değişince sayfa 1'e döner)
  const link = (yeni: { tip?: string; aralik?: string; sayfa?: number }) => {
    const p = new URLSearchParams();
    const t = yeni.tip ?? tip; if (t !== "tumu") p.set("tip", t);
    const a = yeni.aralik ?? aralik; if (a !== "tumu") p.set("aralik", a);
    const s = yeni.sayfa ?? 1; if (s > 1) p.set("sayfa", String(s));
    const qs = p.toString();
    return `/panel/bildirimler${qs ? `?${qs}` : ""}`;
  };

  const tipChipleri = [
    { key: "tumu", etiket: "Tümü", Icon: Bell },
    { key: "onemli", etiket: "Önemli", Icon: Star },
    ...Object.entries(TIP_STILI).map(([k, v]) => ({ key: k, etiket: v.etiket, Icon: v.Icon })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-[21px] font-extrabold text-[#0F1B2D]">
          <Bell size={22} /> Bildirimler
        </h1>
        {okunmamisToplam > 0 && (
          <form action={tumBildirimleriOku}>
            <button className="flex items-center gap-1.5 rounded-xl border border-[#DDE3EA] bg-white px-3 py-2 text-[11.5px] font-bold text-[#0E8A4D] hover:bg-slate-50">
              <CheckCheck size={15} className="text-[#16A34A]" /> Tümünü okundu
            </button>
          </form>
        )}
      </div>

      {/* Tip filtresi */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tipChipleri.map((c) => {
          const sec = tip === c.key;
          return (
            <Link
              key={c.key}
              href={link({ tip: c.key })}
              className={`flex flex-none items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-bold transition ${sec ? "bg-[#0B1B3C] text-white" : "border border-[#E4E9F0] bg-white text-[#3B4759] hover:bg-slate-50"}`}
            >
              <c.Icon size={14} /> {c.etiket}
            </Link>
          );
        })}
      </div>

      {/* Tarih filtresi + sayaç */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {ARALIKLAR.map((a) => {
            const sec = aralik === a.key;
            return (
              <Link
                key={a.key}
                href={link({ aralik: a.key })}
                className={`rounded-full px-3.5 py-2 text-[12.5px] font-bold transition ${sec ? "bg-[#16B364] text-white" : "border border-[#E4E9F0] bg-white text-[#3B4759] hover:bg-slate-50"}`}
              >
                {a.etiket}
              </Link>
            );
          })}
        </div>
        <span className="text-[12px] font-bold text-[#8493A8]">{toplam} bildirim</span>
      </div>

      {bildirimler.length === 0 ? (
        <p className="rounded-2xl border border-[#ECEFF3] bg-white p-6 text-sm text-slate-500">Bu filtreye uygun bildirim yok.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {bildirimler.map((b) => {
            const s = TIP_STILI[b.tip] ?? VARSAYILAN_STIL;
            const govde = (
              <div className="flex items-center gap-3 rounded-2xl border border-[#ECEFF3] bg-white px-3.5 py-3 shadow-[0_6px_18px_-16px_rgba(15,27,45,.5)]">
                <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-[13px] ${s.renk}`}>
                  <s.Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold leading-snug text-[#0F1B2D]">{b.mesaj}</div>
                  <div className="mt-0.5 text-[11.5px] font-semibold text-[#9AA7B8]">{s.etiket} · {b.createdAt.toLocaleString("tr-TR")}</div>
                </div>
                {!b.okundu && <span className="h-2.5 w-2.5 flex-none rounded-full bg-[#16B364]" />}
              </div>
            );
            return b.kisiId
              ? <Link key={b.id} href={`/panel/kisi/${b.kisiId}`} className="block">{govde}</Link>
              : <div key={b.id}>{govde}</div>;
          })}
        </div>
      )}

      {/* Sayfalama */}
      {sayfaSayisi > 1 && (
        <div className="flex items-center justify-center gap-2">
          {sayfa > 1 ? (
            <Link href={link({ sayfa: sayfa - 1 })} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <ChevronLeft size={15} /> Önceki
            </Link>
          ) : (
            <span className="flex items-center gap-1 rounded-lg border border-slate-100 px-3 py-1.5 text-sm font-medium text-slate-300">
              <ChevronLeft size={15} /> Önceki
            </span>
          )}
          <span className="text-sm text-slate-500">{sayfa} / {sayfaSayisi}</span>
          {sayfa < sayfaSayisi ? (
            <Link href={link({ sayfa: sayfa + 1 })} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Sonraki <ChevronRight size={15} />
            </Link>
          ) : (
            <span className="flex items-center gap-1 rounded-lg border border-slate-100 px-3 py-1.5 text-sm font-medium text-slate-300">
              Sonraki <ChevronRight size={15} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
