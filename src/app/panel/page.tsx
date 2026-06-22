import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  SUNUM_DURUMLARI,
  DURUM_ETIKET,
  SICAKLIK_ETIKET,
  skorSicaklik,
  type SunumDurum,
} from "@/lib/sabitler";
import {
  Users, Flame, CheckCircle2, Phone, Calendar,
  Presentation, Clock, XCircle, User, ChevronRight, FileText, MessageSquareText,
  type LucideIcon,
} from "lucide-react";

const AVATAR_RENK = ["#16B364", "#2563EB", "#9333EA", "#D97706", "#0EA5A0", "#E11D6B"];

function basHarf(ad: string) {
  return ad.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toLocaleUpperCase("tr");
}

const SICAKLIK_RENK: Record<string, string> = {
  COK_SICAK: "#E0492B", SICAK: "#EA7A1F", ILIK: "#C99213", SOGUK: "#6B7B8F",
};

const HUNI_STIL: Record<SunumDurum, { bg: string; renk: string; icon: LucideIcon }> = {
  YENI: { bg: "#F1F5F9", renk: "#475569", icon: User },
  ARANDI: { bg: "#EAF1FF", renk: "#2563EB", icon: Phone },
  RANDEVU: { bg: "#EEEDFF", renk: "#5D4EE0", icon: Calendar },
  SUNUM_YAPILDI: { bg: "#F6ECFE", renk: "#9333EA", icon: Presentation },
  TAKIP: { bg: "#FFF4E1", renk: "#D97706", icon: Clock },
  KATILDI: { bg: "#E7F8EE", renk: "#16A34A", icon: CheckCircle2 },
  KAYIP: { bg: "#FDECEC", renk: "#DC2626", icon: XCircle },
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
      take: 8,
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
  const adIlk = user.adSoyad.split(" ").slice(0, 2).join(" ");

  return (
    <div className="-mx-4 -mt-4">
      {/* Lacivert hero */}
      <div className="bg-gradient-to-b from-[#173666] via-[#102B54] to-[#0B1B3C] px-[18px] pb-16 pt-2">
        <div className="my-4 px-0.5 text-[22px] font-extrabold tracking-tight text-white">
          Merhaba, {adIlk} 👋
        </div>
        <div className="grid grid-cols-2 gap-3">
          <UstKart baslik="Toplam Aday" deger={toplam} icon={Users} gradient="from-[#1FB46A] to-[#0E8A4D]" />
          <UstKart baslik="Sıcak Aday" deger={sicakSayi} icon={Flame} gradient="from-[#FF8A3D] to-[#F0590E]" />
          <UstKart baslik="Randevu" deger={bekleyenRandevu} icon={Calendar} gradient="from-[#8B7DFF] to-[#5D4EE0]" href="/panel/randevular" />
          <UstKart baslik="Katıldı" deger={katildi} icon={CheckCircle2} gradient="from-[#1FB46A] to-[#0E8A4D]" />
        </div>
      </div>

      {/* Beyaz tabaka */}
      <div className="relative -mt-10 rounded-t-[28px] bg-[#EEF1F5] px-[18px] pb-6 pt-6">
        {/* En Sıcak Adaylar */}
        {sicakAdaylar.length > 0 && (
          <>
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[17px] font-extrabold text-[#0F1B2D]">
                <span>🔥</span> En Sıcak Adaylar
              </div>
              <Link href="/panel/liste" className="flex items-center gap-0.5 text-[13.5px] font-bold text-[#0E8A4D]">
                Tümünü Gör <ChevronRight size={16} />
              </Link>
            </div>
            <div className="-mx-[18px] mb-6 flex gap-3 overflow-x-auto px-[18px] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {sicakAdaylar.map((k, i) => {
                const sic = skorSicaklik(k.skor);
                return (
                  <Link
                    key={k.id}
                    href={`/panel/kisi/${k.id}`}
                    className="relative w-[228px] flex-none overflow-hidden rounded-[20px] border border-[#ECEFF3] bg-white p-4 shadow-[0_10px_26px_-14px_rgba(15,27,45,.22)]"
                  >
                    <span className="absolute left-0 top-0 h-full w-[5px] bg-gradient-to-b from-[#FF8A3D] to-[#F0590E]" />
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] text-[15px] font-extrabold text-white" style={{ background: AVATAR_RENK[i % AVATAR_RENK.length] }}>
                        {basHarf(k.adSoyad)}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-[14.5px] font-extrabold text-[#0F1B2D]">{k.adSoyad}</div>
                        <div className="text-[11.5px] font-semibold text-[#8493A8]">{k.telefon || "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-bold" style={{ color: SICAKLIK_RENK[sic] }}>{SICAKLIK_ETIKET[sic]}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-[#FFF1E6] to-[#FFE2CC] px-2.5 py-1 text-[12px] font-extrabold text-[#E0492B]">
                        🔥 Skor {k.skor}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Huni Dağılımı */}
        <div className="text-[17px] font-extrabold text-[#0F1B2D]">Huni Dağılımı</div>
        <div className="mb-3.5 mt-1 text-[12.5px] font-semibold text-[#8493A8]">Adaylarının süreç içindeki dağılımı</div>
        <div className="mb-6 grid grid-cols-2 gap-2.5">
          {SUNUM_DURUMLARI.map((d) => {
            const s = HUNI_STIL[d];
            const Icon = s.icon;
            const tam = d === "KAYIP";
            return (
              <Link
                key={d}
                href={`/panel/liste?durum=${d}`}
                className={`rounded-[18px] border border-dashed border-[#c7c7c7] p-[15px] ${tam ? "col-span-2" : ""}`}
                style={{ background: s.bg }}
              >
                <div className={`flex justify-between ${tam ? "items-center" : "items-start"}`}>
                  <div>
                    <div className="text-[26px] font-extrabold tabular-nums" style={{ color: s.renk }}>{sayac.get(d) ?? 0}</div>
                    <div className="mt-1 text-[13px] font-bold" style={{ color: s.renk }}>{DURUM_ETIKET[d]}</div>
                  </div>
                  <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] bg-white" style={{ color: s.renk }}>
                    <Icon size={17} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bugün / Geçmiş Takipler */}
        <div className="mb-3 text-[17px] font-extrabold text-[#0F1B2D]">Bugün / Geçmiş Takipler</div>
        {gecikmis.length === 0 ? (
          <p className="rounded-[18px] border border-[#ECEFF3] bg-white p-5 text-sm font-medium text-[#8493A8]">Bekleyen takip yok. 🎉</p>
        ) : (
          <div className="space-y-2.5">
            {gecikmis.map((k, i) => (
              <Link
                key={k.id}
                href={`/panel/kisi/${k.id}`}
                className="flex items-center justify-between gap-3 rounded-[18px] border border-[#ECEFF3] bg-white p-4 shadow-[0_8px_22px_-16px_rgba(15,27,45,.3)]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[14px] text-[14px] font-extrabold text-white" style={{ background: AVATAR_RENK[i % AVATAR_RENK.length] }}>
                    {basHarf(k.adSoyad)}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[14.5px] font-extrabold text-[#0F1B2D]">{k.adSoyad}</div>
                    <div className="truncate text-[12px] font-semibold text-[#8493A8]">
                      Takip: {k.sonrakiTakip?.toLocaleDateString("tr-TR")}{k.telefon ? ` · ${k.telefon}` : ""}
                    </div>
                  </div>
                </div>
                <span className="flex-none rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: HUNI_STIL[k.durum as SunumDurum].bg, color: HUNI_STIL[k.durum as SunumDurum].renk }}>
                  {DURUM_ETIKET[k.durum as SunumDurum]}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Davet kısayolları */}
        <div className="mt-6 flex flex-col gap-2.5">
          <DavetButon
            href="/panel/sayfalar"
            baslik="Davet Sayfaları"
            altBaslik="Sunum ve davet sayfalarını yönet"
            icon={FileText}
            iconBg="#EEEDFF"
            iconRenk="#5D4EE0"
          />
          <DavetButon
            href="/panel/kaliplar"
            baslik="Davet Mesajları"
            altBaslik="Hazır mesaj şablonlarını kullan"
            icon={MessageSquareText}
            iconBg="#E7F8EE"
            iconRenk="#16A34A"
          />
        </div>
      </div>
    </div>
  );
}

function UstKart({ baslik, deger, icon: Icon, gradient, href }: { baslik: string; deger: number | string; icon: LucideIcon; gradient: string; href?: string }) {
  const govde = (
    <div className="relative overflow-hidden rounded-[22px] border border-white/[0.13] bg-white/[0.07] p-4 pb-[18px]">
      <div className="text-[12.5px] font-semibold text-white/[0.62]">{baslik}</div>
      <div className="mt-1.5 text-[34px] font-extrabold leading-none tabular-nums text-white">{deger}</div>
      <span className={`absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-[13px] bg-gradient-to-br ${gradient} text-white shadow-lg`}>
        <Icon size={20} />
      </span>
    </div>
  );
  return href ? <Link href={href} className="block">{govde}</Link> : govde;
}

function DavetButon({ href, baslik, altBaslik, icon: Icon, iconBg, iconRenk }: { href: string; baslik: string; altBaslik: string; icon: LucideIcon; iconBg: string; iconRenk: string }) {
  return (
    <Link href={href} className="flex items-center gap-3.5 rounded-[18px] border border-[#ECEFF3] bg-white p-4 shadow-[0_8px_22px_-18px_rgba(15,27,45,.5)]">
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[14px]" style={{ background: iconBg, color: iconRenk }}>
        <Icon size={22} />
      </span>
      <div className="flex-1">
        <div className="text-[15px] font-extrabold text-[#0F1B2D]">{baslik}</div>
        <div className="text-[12px] font-semibold text-[#8493A8]">{altBaslik}</div>
      </div>
      <ChevronRight size={20} className="text-[#C2CCD8]" />
    </Link>
  );
}
