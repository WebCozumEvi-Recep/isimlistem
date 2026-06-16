import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tumBildirimleriOku } from "@/app/panel/davet-actions";
import { Bell, CheckCheck } from "lucide-react";

export default async function BildirimlerSayfasi() {
  const user = await requireUser();
  const bildirimler = await prisma.bildirim.findMany({
    where: { kullaniciId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const okunmamis = bildirimler.filter((b) => !b.okundu).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Bell size={22} /> Bildirimler
        </h1>
        {okunmamis > 0 && (
          <form action={tumBildirimleriOku}>
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <CheckCheck size={15} /> Tümünü okundu işaretle
            </button>
          </form>
        )}
      </div>

      {bildirimler.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Henüz bildirim yok.</p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {bildirimler.map((b) => {
            const govde = (
              <div className={`flex items-start justify-between gap-3 px-4 py-3 ${b.okundu ? "" : "bg-emerald-50/40"}`}>
                <div>
                  <div className="font-medium text-slate-900">{b.mesaj}</div>
                  <div className="text-xs text-slate-400">{b.createdAt.toLocaleString("tr-TR")}</div>
                </div>
                {!b.okundu && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
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
    </div>
  );
}
