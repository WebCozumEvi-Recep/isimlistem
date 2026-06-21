import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DurumRozeti from "@/components/DurumRozeti";
import {
  SUNUM_DURUMLARI,
  DURUM_ETIKET,
  SICAKLIK_ETIKET,
  skorSicaklik,
  type SunumDurum,
} from "@/lib/sabitler";
import {
  Users, Flame, CalendarClock, CheckCircle2, Phone, Calendar,
  Presentation, Clock, XCircle, User, ChevronRight, type LucideIcon,
} from "lucide-react";

const HUNI_STIL: Record<SunumDurum, { bg: string; text: string; iconBg: string; iconText: string; icon: LucideIcon }> = {
  YENI: { bg: "bg-slate-50", text: "text-slate-800", iconBg: "bg-slate-200/70", iconText: "text-slate-500", icon: User },
  ARANDI: { bg: "bg-blue-50", text: "text-blue-700", iconBg: "bg-blue-100", iconText: "text-blue-500", icon: Phone },
  RANDEVU: { bg: "bg-indigo-50", text: "text-indigo-700", iconBg: "bg-indigo-100", iconText: "text-indigo-500", icon: Calendar },
  SUNUM_YAPILDI: { bg: "bg-purple-50", text: "text-purple-700", iconBg: "bg-purple-100", iconText: "text-purple-500", icon: Presentation },
  TAKIP: { bg: "bg-amber-50", text: "text-amber-700", iconBg: "bg-amber-100", iconText: "text-amber-600", icon: Clock },
  KATILDI: { bg: "bg-emerald-50", text: "text-emerald-700", iconBg: "bg-emerald-100", iconText: "text-emerald-600", icon: CheckCircle2 },
  KAYIP: { bg: "bg-rose-50", text: "text-rose-700", iconBg: "bg-rose-100", iconText: "text-rose-500", icon: XCircle },
};

export default async function PanelAnaSayfa() {
  const user = await requireUser();
  const simdi = new Date();

  const [kisiler, gecikmis, sicakAdaylar, bekleyenRandevu, sicakSayi] = await Promise.all([
    prisma.kisi.groupBy({ by: ["durum"], where: { kullaniciId: user.id }, _count: true }),
    prisma.kisi.findMany({
      where: { kullaniciId: user.id, sonrakiTakip: { lte: simdi }, durum: { notIn: ["KATILDI", "KAYIP"] } },
      orderBy: { sonrakiTakip: "asc" },
      take: 10,
    }),
    prisma.kisi.findMany({
      where: { kullaniciId: user.id, skor: { gt: 0 }, durum: { notIn: ["KATILDI", "KAYIP"] } },
      orderBy: { skor: "desc" },
      take: 5,
    }),
    prisma.randevuTalebi.count({ where: { kullaniciId: user.id, durum: "TALEP" } }),
    prisma.kisi.count({ where: { kullaniciId: user.id, skor: { gte: 61 }, durum: { notIn: ["KATILDI", "KAYIP"] } } }),
  ]);

  const sayac = new Map<SunumDurum, number>();
  let toplam = 0;
  for (const g of kisiler) {
    sayac.set(g.durum as SunumDurum, g._count);
    toplam += g._count;
  }
  const katildi = sayac.get("KATILDI") ?? 0;

  return (
    <div className="space-y-7">
      {/* Üst lacivert bant + istatistikler */}
      <section className="-mx-4 -mt-4 rounded-b-3xl bg-gradient-to-br from-[#0b1c30] to-[#16324f] px-4 pb-6 pt-5 sm:mx-0 sm:mt-0 sm:rounded-3xl sm:px-6">
        <p className="text-sm font-medium text-slate-300">Merhaba, {user.adSoyad} 👋</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <UstKart baslik="Toplam Aday" deger={toplam} icon={Users} renk="bg-emerald-500" />
          <UstKart baslik="Sıcak Aday" deger={sicakSayi} icon={Flame} renk="bg-orange-500" />
          <Link href="/panel/randevular" className="block"><UstKart baslik="Randevu" deger={bekleyenRandevu} icon={CalendarClock} renk="bg-violet-500" /></Link>
          <UstKart baslik="Katıldı" deger={katildi} icon={CheckCircle2} renk="bg-green-500" />
        </div>
      </section>

      {/* En Sıcak Adaylar */}
      {sicakAdaylar.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">🔥 En Sıcak Adaylar</h2>
            <Link href="/panel/liste" className="flex items-center gap-0.5 text-sm font-semibold text-emerald-600">
              Tümünü Gör <ChevronRight size={16} />
            </Link>
          </div>
          <div className="space-y-2">
            {sicakAdaylar.map((k) => (
              <Link key={k.id} href={`/panel/kisi/${k.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-900">{k.adSoyad}</div>
                  <div className="truncate text-sm text-slate-500">
                    {SICAKLIK_ETIKET[skorSicaklik(k.skor)]}{k.telefon ? ` · ${k.telefon}` : ""}
                  </div>
                </div>
                <span className="ml-3 shrink-0 rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                  Skor {k.skor}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Huni Dağılımı */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Huni Dağılımı</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {SUNUM_DURUMLARI.map((d) => {
            const s = HUNI_STIL[d];
            const Icon = s.icon;
            return (
              <Link key={d} href={`/panel/liste?durum=${d}`} className={`flex items-center justify-between rounded-2xl p-4 transition hover:shadow-sm ${s.bg}`}>
                <div>
                  <div className={`text-3xl font-bold ${s.text}`}>{sayac.get(d) ?? 0}</div>
                  <div className={`mt-0.5 text-sm font-medium ${s.text}`}>{DURUM_ETIKET[d]}</div>
                </div>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${s.iconBg} ${s.iconText}`}>
                  <Icon size={18} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bugün/Geçmiş Takipler */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Bugün/Geçmiş Takipler</h2>
        {gecikmis.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Bekleyen takip yok. 🎉</p>
        ) : (
          <div className="space-y-2">
            {gecikmis.map((k) => (
              <Link key={k.id} href={`/panel/kisi/${k.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-900">{k.adSoyad}</div>
                  <div className="truncate text-sm text-slate-500">
                    Takip: {k.sonrakiTakip?.toLocaleDateString("tr-TR")}{k.telefon ? ` · ${k.telefon}` : ""}
                  </div>
                </div>
                <DurumRozeti durum={k.durum as SunumDurum} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function UstKart({ baslik, deger, icon: Icon, renk }: { baslik: string; deger: number | string; icon: LucideIcon; renk: string }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-3">
      <div>
        <div className="text-xs text-slate-300">{baslik}</div>
        <div className="mt-1 text-2xl font-bold text-white">{deger}</div>
      </div>
      <span className={`mt-3 flex h-8 w-8 items-center justify-center self-end rounded-full ${renk} text-white`}>
        <Icon size={16} />
      </span>
    </div>
  );
}
