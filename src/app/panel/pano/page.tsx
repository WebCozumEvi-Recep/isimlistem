import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  SUNUM_DURUMLARI,
  DURUM_ETIKET,
  DURUM_RENK,
  type SunumDurum,
} from "@/lib/sabitler";

export default async function PanoSayfasi() {
  const user = await requireUser();
  const kisiler = await prisma.kisi.findMany({
    where: { kullaniciId: user.id },
    orderBy: [{ oncelik: "desc" }, { updatedAt: "desc" }],
    select: { id: true, adSoyad: true, durum: true, telefon: true, oncelik: true },
  });

  const kolonlar = new Map<SunumDurum, typeof kisiler>();
  for (const d of SUNUM_DURUMLARI) kolonlar.set(d, []);
  for (const k of kisiler) kolonlar.get(k.durum as SunumDurum)?.push(k);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Pano</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {SUNUM_DURUMLARI.map((d) => {
          const liste = kolonlar.get(d) ?? [];
          return (
            <div key={d} className="w-64 shrink-0">
              <div
                className={`mb-2 flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold ${DURUM_RENK[d]}`}
              >
                <span>{DURUM_ETIKET[d]}</span>
                <span>{liste.length}</span>
              </div>
              <div className="space-y-2">
                {liste.map((k) => (
                  <Link
                    key={k.id}
                    href={`/panel/kisi/${k.id}`}
                    className="block rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm hover:border-indigo-300"
                  >
                    <div className="font-medium text-slate-900">{k.adSoyad}</div>
                    {k.telefon && (
                      <div className="text-xs text-slate-500">{k.telefon}</div>
                    )}
                    {k.oncelik > 0 && (
                      <div className="text-xs text-amber-500">
                        {"★".repeat(k.oncelik)}
                      </div>
                    )}
                  </Link>
                ))}
                {liste.length === 0 && (
                  <p className="px-1 text-xs text-slate-400">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
