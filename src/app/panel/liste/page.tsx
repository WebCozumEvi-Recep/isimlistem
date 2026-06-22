import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DurumRozeti from "@/components/DurumRozeti";
import type { Prisma } from "@/generated/prisma/client";
import {
  SUNUM_DURUMLARI,
  DURUM_ETIKET,
  KAYNAK_TIPLERI,
  KAYNAK_ETIKET,
  type SunumDurum,
  type KaynakTip,
} from "@/lib/sabitler";
import { Pencil, MessageCircle, Activity, ListChecks, History, Search, ChevronRight, Upload } from "lucide-react";
import IceAktarButton from "@/components/IceAktarButton";

const AVATAR_RENK = ["#16B364", "#2563EB", "#9333EA", "#D97706", "#0EA5A0", "#E11D6B"];
const DURUM_RENK: Record<SunumDurum, { bg: string; renk: string }> = {
  YENI: { bg: "#EEF2F7", renk: "#64748B" }, ARANDI: { bg: "#EAF1FF", renk: "#2563EB" },
  RANDEVU: { bg: "#EEEDFF", renk: "#5D4EE0" }, SUNUM_YAPILDI: { bg: "#F6ECFE", renk: "#9333EA" },
  TAKIP: { bg: "#FFF4E1", renk: "#D97706" }, KATILDI: { bg: "#E7F8EE", renk: "#16A34A" },
  KAYIP: { bg: "#FDECEC", renk: "#DC2626" },
};
function basHarf(ad: string) {
  return ad.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toLocaleUpperCase("tr");
}

type Arama = {
  q?: string;
  durum?: string;
  kaynak?: string;
};

export default async function ListeSayfasi({
  searchParams,
}: {
  searchParams: Promise<Arama>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const where: Prisma.KisiWhereInput = { kullaniciId: user.id };
  if (sp.q) {
    where.OR = [
      { adSoyad: { contains: sp.q, mode: "insensitive" } },
      { telefon: { contains: sp.q, mode: "insensitive" } },
      { email: { contains: sp.q, mode: "insensitive" } },
    ];
  }
  if (sp.durum && SUNUM_DURUMLARI.includes(sp.durum as SunumDurum)) {
    where.durum = sp.durum as SunumDurum;
  }
  if (sp.kaynak && KAYNAK_TIPLERI.includes(sp.kaynak as KaynakTip)) {
    where.kaynakTip = sp.kaynak as KaynakTip;
  }

  const kisiler = await prisma.kisi.findMany({
    where,
    orderBy: [{ oncelik: "desc" }, { updatedAt: "desc" }],
    include: {
      // İlk temas = ilk "Yeni" olmayan aktivite (arama/mesaj/durum ilerlemesi)
      aktiviteler: { where: { durum: { not: "YENI" } }, orderBy: { tarih: "asc" }, take: 1, select: { tarih: true } },
    },
  });

  const tarihYaz = (d: Date | null | undefined) => (d ? d.toLocaleDateString("tr-TR") : "—");

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-[21px] font-extrabold leading-tight text-[#0F1B2D]">
          Aday İsim Listesi{" "}
          <span className="text-[#16B364]">({kisiler.length})</span>
        </h1>
        <div className="flex items-center gap-2">
          <IceAktarButton />
          <a
            href="/api/disa-aktar"
            className="flex flex-col items-center gap-1 rounded-[13px] border border-[#DDE3EA] bg-white px-3 py-2 text-[12px] font-bold text-[#3B4759] hover:bg-slate-50"
          >
            <Upload size={18} className="text-[#16A34A]" /> Excel&apos;e
          </a>
        </div>
      </div>

      <form className="space-y-2.5" method="get">
        <label className="flex items-center gap-2.5 rounded-2xl border border-[#E4E9F0] bg-white px-3.5 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="İsim, telefon, e-posta ara…"
            className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>
        <div className="flex flex-wrap gap-2.5">
          <select
            name="durum"
            defaultValue={sp.durum ?? ""}
            className="rounded-xl border border-[#E4E9F0] bg-white px-3.5 py-2.5 text-[13px] font-bold text-[#3B4759]"
          >
            <option value="">Tüm Durumlar</option>
            {SUNUM_DURUMLARI.map((d) => (
              <option key={d} value={d}>{DURUM_ETIKET[d]}</option>
            ))}
          </select>
          <select
            name="kaynak"
            defaultValue={sp.kaynak ?? ""}
            className="rounded-xl border border-[#E4E9F0] bg-white px-3.5 py-2.5 text-[13px] font-bold text-[#3B4759]"
          >
            <option value="">Tüm Kaynaklar</option>
            {KAYNAK_TIPLERI.map((k) => (
              <option key={k} value={k}>{KAYNAK_ETIKET[k]}</option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-[#0B1B3C] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#16294e]"
          >
            Filtrele
          </button>
        </div>
      </form>

      {kisiler.length === 0 ? (
        <p className="rounded-2xl border border-[#ECEFF3] bg-white p-8 text-center text-slate-500">
          Kayıt bulunamadı.{" "}
          <Link href="/panel/kisi/yeni" className="text-emerald-600">
            İlk kişini ekle
          </Link>
          .
        </p>
      ) : (
        <>
        {/* Mobil kart düzeni */}
        <div className="flex flex-col gap-2.5 lg:hidden">
          {kisiler.map((k, i) => {
            const d = DURUM_RENK[k.durum as SunumDurum];
            return (
              <Link
                key={k.id}
                href={`/panel/kisi/${k.id}`}
                className="flex items-center gap-3 rounded-[18px] border border-[#ECEFF3] bg-white p-3.5 shadow-[0_8px_22px_-18px_rgba(15,27,45,.4)]"
              >
                <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[15px] text-[15px] font-extrabold text-white" style={{ background: AVATAR_RENK[i % AVATAR_RENK.length] }}>
                  {basHarf(k.adSoyad)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-extrabold text-[#0F1B2D]">{k.adSoyad}</div>
                  <div className="mt-0.5 truncate text-[12px] font-semibold text-[#8493A8]">
                    {KAYNAK_ETIKET[k.kaynakTip as KaynakTip]}{k.telefon ? ` · ${k.telefon}` : ""}
                  </div>
                  <div className="mt-2">
                    <span className="rounded-full px-2.5 py-1 text-[11.5px] font-bold" style={{ background: d.bg, color: d.renk }}>
                      {DURUM_ETIKET[k.durum as SunumDurum]}
                    </span>
                  </div>
                </div>
                <div className="flex-none text-right">
                  {k.oncelik > 0 && <div className="text-[12.5px] font-extrabold text-[#E0492B]">🔥 {k.oncelik}</div>}
                  <ChevronRight size={20} className="ml-auto mt-2 text-[#C2CCD8]" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Geniş ekran tablosu */}
        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white lg:block">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Ad Soyad</th>
                <th className="px-4 py-3">İletişim</th>
                <th className="px-4 py-3">Kaynak</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Öncelik</th>
                <th className="px-4 py-3">İlk Eklenme</th>
                <th className="px-4 py-3">İlk Temas</th>
                <th className="px-4 py-3">Takip</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kisiler.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/panel/kisi/${k.id}`}
                      className="font-medium text-emerald-600 hover:underline"
                    >
                      {k.adSoyad}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {k.telefon ?? k.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {KAYNAK_ETIKET[k.kaynakTip as KaynakTip]}
                  </td>
                  <td className="px-4 py-3">
                    <DurumRozeti durum={k.durum as SunumDurum} />
                  </td>
                  <td className="px-4 py-3 text-amber-500">
                    {"★".repeat(k.oncelik) || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {tarihYaz(k.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {tarihYaz(k.aktiviteler[0]?.tarih)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {k.sonrakiTakip?.toLocaleDateString("tr-TR") ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <SatirAksiyon href={`/panel/kisi/${k.id}?bolum=davet`} title="WhatsApp Daveti" icon={MessageCircle} />
                      <SatirAksiyon href={`/panel/kisi/${k.id}?bolum=etkilesim`} title="Etkileşim" icon={Activity} />
                      <SatirAksiyon href={`/panel/kisi/${k.id}?bolum=durum`} title="Durum Güncelle" icon={ListChecks} />
                      <SatirAksiyon href={`/panel/kisi/${k.id}?bolum=aktivite`} title="Aktivite Geçmişi" icon={History} />
                      <SatirAksiyon href={`/panel/kisi/${k.id}?bolum=bilgiler`} title="Düzenle" icon={Pencil} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}

function SatirAksiyon({ href, title, icon: Icon }: { href: string; title: string; icon: React.ComponentType<{ size?: number }> }) {
  return (
    <Link
      href={href}
      title={title}
      className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
    >
      <Icon size={15} />
    </Link>
  );
}
