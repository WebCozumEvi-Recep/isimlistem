import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kalipEkle, kalipSil } from "@/app/panel/davet-actions";
import { KALIP_KATEGORILERI, KALIP_KATEGORI_ETIKET, type KalipKategori } from "@/lib/sabitler";
import { Trash2, Globe } from "lucide-react";

export default async function KaliplarSayfasi() {
  const user = await requireUser();
  const kaliplar = await prisma.mesajKalibi.findMany({
    where: { OR: [{ sahiplik: "GLOBAL" }, { kullaniciId: user.id }], aktif: true },
    orderBy: [{ sahiplik: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Mesaj Kalıplarım</h1>
      <p className="text-sm text-slate-500">
        Değişkenler: <code>{"{ad}"}</code>, <code>{"{tam_ad}"}</code>,{" "}
        <code>{"{networker_ad}"}</code>, <code>{"{ozel_davet_linki}"}</code>
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {kaliplar.length === 0 && (
            <p className="text-sm text-slate-500">Henüz kalıp yok. Sağdan yeni kalıp ekleyin.</p>
          )}
          {kaliplar.map((k) => (
            <div key={k.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{k.baslik}</h3>
                    {k.sahiplik === "GLOBAL" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        <Globe size={11} /> Hazır
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-indigo-600">
                    {KALIP_KATEGORI_ETIKET[k.kategori as KalipKategori] ?? k.kategori}
                  </span>
                </div>
                {k.sahiplik === "KISISEL" && (
                  <form action={kalipSil.bind(null, k.id)}>
                    <button className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" title="Sil">
                      <Trash2 size={16} />
                    </button>
                  </form>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{k.metin}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Yeni Kalıp</h2>
          <form action={kalipEkle} className="space-y-3">
            <input
              name="baslik"
              placeholder="Kalıp adı"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select name="kategori" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {KALIP_KATEGORILERI.map((c) => (
                <option key={c} value={c}>
                  {KALIP_KATEGORI_ETIKET[c]}
                </option>
              ))}
            </select>
            <textarea
              name="metin"
              rows={6}
              required
              placeholder="Merhaba {ad}, sana özel bir sayfa hazırladım: {ozel_davet_linki}"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Kalıbı Kaydet
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
