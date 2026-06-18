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
    include: {
      _count: { select: { moduller: true, linkler: true } },
      linkler: { orderBy: { createdAt: "desc" }, include: { kisi: { select: { adSoyad: true } } } },
    },
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
          Henüz davet sayfanız yok. &ldquo;Yeni Sayfa&rdquo; ile başlayın — adaylarınıza özel link bu sayfadan üretilir.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {sayfalar.map((s) => (
          <Link
            key={s.id}
            href={`/panel/sayfa/${s.id}`}
            className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300"
          >
            {s.kapakGorsel ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.kapakGorsel} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <FileText size={22} className="text-emerald-500" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900">{s.baslik}</h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
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
                <span>{s._count.linkler} davet</span>
              </div>
              {s.linkler.length > 0 && (
                <p className="mt-2 truncate text-xs text-slate-500">
                  <span className="font-medium text-slate-400">Davet edilenler: </span>
                  {s.linkler.slice(0, 4).map((l) => l.kisi.adSoyad).join(", ")}
                  {s.linkler.length > 4 ? ` +${s.linkler.length - 4}` : ""}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
