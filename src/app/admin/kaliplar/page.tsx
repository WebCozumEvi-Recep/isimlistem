import { prisma } from "@/lib/prisma";
import { globalKalipEkle, globalKalipSil } from "@/app/admin/actions";
import { KALIP_KATEGORILERI, KALIP_KATEGORI_ETIKET, type KalipKategori } from "@/lib/sabitler";
import { Trash2 } from "lucide-react";

export default async function AdminGlobalKaliplar() {
  const kaliplar = await prisma.mesajKalibi.findMany({ where: { sahiplik: "GLOBAL" }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Davet Mesajları</h1>
      <p className="text-sm text-slate-500">Bu kalıpları tüm bağımsız networker'lar kullanabilir.</p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {kaliplar.map((k) => (
            <div key={k.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{k.baslik}</h3>
                  <span className="text-xs text-emerald-600">{KALIP_KATEGORI_ETIKET[k.kategori as KalipKategori] ?? k.kategori}</span>
                </div>
                <form action={globalKalipSil.bind(null, k.id)}>
                  <button className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></button>
                </form>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{k.metin}</p>
            </div>
          ))}
          {kaliplar.length === 0 && <p className="text-sm text-slate-400">Henüz global kalıp yok.</p>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Yeni Mesaj</h2>
          <form action={globalKalipEkle} className="space-y-3">
            <input name="baslik" placeholder="Kalıp adı" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <select name="kategori" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {KALIP_KATEGORILERI.map((c) => <option key={c} value={c}>{KALIP_KATEGORI_ETIKET[c]}</option>)}
            </select>
            <textarea name="metin" rows={6} required placeholder="Merhaba {ad}, ... {ozel_davet_linki}" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white hover:bg-emerald-600">Kaydet</button>
          </form>
        </div>
      </div>
    </div>
  );
}
