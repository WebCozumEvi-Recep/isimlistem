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
import { Download, Pencil, MessageCircle, Activity, ListChecks, History } from "lucide-react";
import IceAktarButton from "@/components/IceAktarButton";

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
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Aday İsim Listesi{" "}
          <span className="text-base font-normal text-slate-400">
            ({kisiler.length})
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <IceAktarButton />
          <a
            href="/api/disa-aktar"
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download size={16} /> Excel&apos;e Aktar
          </a>
        </div>
      </div>

      <form className="flex flex-wrap gap-2" method="get">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="İsim, telefon, e-posta ara…"
          className="min-w-48 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <select
          name="durum"
          defaultValue={sp.durum ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Tüm Durumlar</option>
          {SUNUM_DURUMLARI.map((d) => (
            <option key={d} value={d}>
              {DURUM_ETIKET[d]}
            </option>
          ))}
        </select>
        <select
          name="kaynak"
          defaultValue={sp.kaynak ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Tüm Kaynaklar</option>
          {KAYNAK_TIPLERI.map((k) => (
            <option key={k} value={k}>
              {KAYNAK_ETIKET[k]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Filtrele
        </button>
      </form>

      {kisiler.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Kayıt bulunamadı.{" "}
          <Link href="/panel/kisi/yeni" className="text-emerald-600">
            İlk kişini ekle
          </Link>
          .
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Ad Soyad</th>
                <th className="px-4 py-3">İletişim</th>
                <th className="px-4 py-3">Kaynak</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Öncelik</th>
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
