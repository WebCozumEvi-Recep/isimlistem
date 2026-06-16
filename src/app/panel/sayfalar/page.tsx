import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sayfaEkle } from "@/app/panel/davet-actions";
import { Plus, FileText } from "lucide-react";

export default async function SayfalarSayfasi() {
  const user = await requireUser();
  const sayfalar = await prisma.davetSayfasi.findMany({
    where: { kullaniciId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { moduller: true, linkler: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Davet Sayfalarım</h1>
        <form action={sayfaEkle}>
          <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600">
            <Plus size={16} /> Yeni Sayfa
          </button>
        </form>
      </div>

      {sayfalar.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Henüz davet sayfanız yok. "Yeni Sayfa" ile başlayın — adaylarınıza özel link bu sayfadan üretilir.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {sayfalar.map((s) => (
          <Link
            key={s.id}
            href={`/panel/sayfa/${s.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300"
          >
            <div className="flex items-center gap-2 text-slate-900">
              <FileText size={18} className="text-emerald-500" />
              <h3 className="font-semibold">{s.baslik}</h3>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
              <span
                className={`rounded-full px-2 py-0.5 ${
                  s.durum === "YAYINDA"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {s.durum === "YAYINDA" ? "Yayında" : s.durum === "PASIF" ? "Pasif" : "Taslak"}
              </span>
              <span>{s._count.moduller} modül</span>
              <span>{s._count.linkler} link</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
