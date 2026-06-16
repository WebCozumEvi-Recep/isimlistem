import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KisiForm from "@/components/KisiForm";
import AktiviteTimeline from "@/components/AktiviteTimeline";
import DurumRozeti from "@/components/DurumRozeti";
import { kisiGuncelle, durumDegistir, kisiSil } from "@/app/panel/actions";
import { SUNUM_DURUMLARI, DURUM_ETIKET, type SunumDurum } from "@/lib/sabitler";
import { Trash2 } from "lucide-react";

export default async function KisiDetaySayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const kisi = await prisma.kisi.findUnique({
    where: { id },
    include: { aktiviteler: { orderBy: { tarih: "desc" } } },
  });
  if (!kisi || kisi.kullaniciId !== user.id) notFound();

  const guncelleAction = kisiGuncelle.bind(null, kisi.id);
  const durumAction = durumDegistir.bind(null, kisi.id);
  const silAction = kisiSil.bind(null, kisi.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{kisi.adSoyad}</h1>
          <DurumRozeti durum={kisi.durum as SunumDurum} />
        </div>
        <form action={silAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={16} /> Sil
          </button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Bilgiler</h2>
            <KisiForm
              kisi={kisi}
              action={guncelleAction}
              gonderEtiket="Bilgileri Güncelle"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Durum Güncelle
            </h2>
            <form action={durumAction} className="space-y-3">
              <select
                name="durum"
                defaultValue={kisi.durum}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {SUNUM_DURUMLARI.map((d) => (
                  <option key={d} value={d}>
                    {DURUM_ETIKET[d]}
                  </option>
                ))}
              </select>
              <input
                name="aciklama"
                placeholder="Not (ör: telefonda görüştük)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Durumu Kaydet
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Aktivite Geçmişi
            </h2>
            <AktiviteTimeline aktiviteler={kisi.aktiviteler} />
          </div>
        </div>
      </div>
    </div>
  );
}
