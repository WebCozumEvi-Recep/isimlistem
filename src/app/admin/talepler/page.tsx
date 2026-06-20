import { prisma } from "@/lib/prisma";
import { talepGuncelle, talepSil } from "@/app/admin/actions";
import {
  TALEP_DURUMLARI,
  TALEP_DURUM_ETIKET,
  TALEP_DURUM_RENK,
  TALEP_TIP_ETIKET,
  type TalepDurum,
} from "@/lib/sabitler";
import { Trash2, Mail, Phone, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

function tarihFormat(d: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function AdminTalepler() {
  const talepler = await prisma.talepFormu.findMany({ orderBy: { createdAt: "desc" } });
  const yeniSayi = talepler.filter((t) => t.durum === "YENI").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Talep Formları</h1>
        <p className="text-sm text-slate-500">
          Ana sayfadaki “Business Demo” ve “Kurumsal İletişim” formlarından gelen talepler.
          {yeniSayi > 0 && <span className="ml-1 font-medium text-blue-600">{yeniSayi} yeni</span>}
        </p>
      </div>

      <div className="space-y-3">
        {talepler.map((t) => (
          <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{t.adSoyad}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {TALEP_TIP_ETIKET[t.tip]}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TALEP_DURUM_RENK[t.durum as TalepDurum]}`}>
                    {TALEP_DURUM_ETIKET[t.durum as TalepDurum]}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  {t.firma && (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={14} /> {t.firma}
                    </span>
                  )}
                  <a href={`mailto:${t.email}`} className="inline-flex items-center gap-1.5 hover:text-emerald-600">
                    <Mail size={14} /> {t.email}
                  </a>
                  {t.telefon && (
                    <a href={`tel:${t.telefon}`} className="inline-flex items-center gap-1.5 hover:text-emerald-600">
                      <Phone size={14} /> {t.telefon}
                    </a>
                  )}
                </div>
                {t.mesaj && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{t.mesaj}</p>}
                <p className="mt-2 text-xs text-slate-400">{tarihFormat(t.createdAt)}</p>
              </div>

              <form action={talepSil.bind(null, t.id)}>
                <button className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50">
                  <Trash2 size={16} />
                </button>
              </form>
            </div>

            <form action={talepGuncelle.bind(null, t.id)} className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
              <label className="text-sm">
                <span className="mb-1 block text-xs font-medium text-slate-500">Durum</span>
                <select name="durum" defaultValue={t.durum} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  {TALEP_DURUMLARI.map((d) => (
                    <option key={d} value={d}>
                      {TALEP_DURUM_ETIKET[d]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex-1 text-sm">
                <span className="mb-1 block text-xs font-medium text-slate-500">Not</span>
                <input
                  name="not"
                  defaultValue={t.not ?? ""}
                  placeholder="Görüşme notu..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                Kaydet
              </button>
            </form>
          </div>
        ))}
        {talepler.length === 0 && <p className="text-sm text-slate-400">Henüz talep yok.</p>}
      </div>
    </div>
  );
}
