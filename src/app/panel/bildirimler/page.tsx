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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Bell size={22} /> Bildirimler
        </h1>
        {okunmamisToplam > 0 && (
          <form action={tumBildirimleriOku}>
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <CheckCheck size={15} /> Tümünü okundu işaretle
            </button>
          </form>
        )}
      </div>

      {/* Tip filtresi */}
      <div className="flex flex-wrap gap-2">
        {tipChipleri.map((c) => {
          const sec = tip === c.key;
          return (
            <Link
              key={c.key}
              href={link({ tip: c.key })}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${sec ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
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
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${sec ? "bg-emerald-500 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {a.etiket}
              </Link>
            );
          })}
        </div>
        <span className="text-sm text-slate-400">{toplam} bildirim</span>
      </div>

      {bildirimler.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Bu filtreye uygun bildirim yok.</p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {bildirimler.map((b) => {
            const s = TIP_STILI[b.tip] ?? VARSAYILAN_STIL;
            const govde = (
              <div className={`flex items-start gap-3 px-4 py-3 ${b.okundu ? "" : "bg-emerald-50/40"}`}>
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.renk}`}>
                  <s.Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900">{b.mesaj}</div>
                  <div className="text-xs text-slate-400">{s.etiket} · {b.createdAt.toLocaleString("tr-TR")}</div>
                </div>
                {!b.okundu && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
              </div>
            );
            return (
              <li key={b.id}>
                {b.kisiId ? <Link href={`/panel/kisi/${b.kisiId}`} className="block hover:bg-slate-50">{govde}</Link> : govde}
              </li>
            );
          })}
        </ul>
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
