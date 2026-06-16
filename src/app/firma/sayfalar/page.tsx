import Link from "next/link";
import { requireFirmaYonetici } from "@/lib/firma";
import { prisma } from "@/lib/prisma";
import { firmaSayfaEkle, firmaSayfaSil } from "@/app/firma/actions";
import { Plus, FileText, Trash2 } from "lucide-react";

export default async function FirmaSayfalar() {
  const { firma, uye } = await requireFirmaYonetici();
  const sayfalar = await prisma.davetSayfasi.findMany({
    where: { firmaId: firma.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { moduller: true, linkler: true } } },
  });
  const duzenleyebilir = uye.rol === "FIRMA_ADMIN" || uye.rol === "ICERIK_YONETICI";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Firma Davet Sayfaları</h1>
        {duzenleyebilir && (
          <form action={firmaSayfaEkle}>
            <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600">
              <Plus size={16} /> Yeni Sayfa
            </button>
          </form>
        )}
      </div>
      <p className="text-sm text-slate-500">Bu sayfalar networker'larınızın adaylarına özel link üretirken seçebileceği hazır sayfalardır.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {sayfalar.map((s) => (
          <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <Link href={`/panel/sayfa/${s.id}`} className="flex items-center gap-2 text-slate-900 hover:text-emerald-600">
                <FileText size={18} className="text-emerald-500" />
                <h3 className="font-semibold">{s.baslik}</h3>
              </Link>
              {duzenleyebilir && (
                <form action={firmaSayfaSil.bind(null, s.id)}>
                  <button className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"><Trash2 size={15} /></button>
                </form>
              )}
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
              <span className={`rounded-full px-2 py-0.5 ${s.durum === "YAYINDA" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {s.durum === "YAYINDA" ? "Yayında" : "Taslak"}
              </span>
              <span>{s._count.moduller} modül</span>
              <span>{s._count.linkler} link</span>
            </div>
          </div>
        ))}
        {sayfalar.length === 0 && <p className="text-sm text-slate-400">Henüz firma sayfası yok.</p>}
      </div>
    </div>
  );
}
