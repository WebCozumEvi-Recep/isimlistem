import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { modulEkle, modulSil, sayfaYayinla, sayfaSil } from "@/app/panel/davet-actions";
import { Trash2 } from "lucide-react";

const MODUL_ETIKET: Record<string, string> = {
  KARSILAMA: "Karşılama",
  METIN: "Metin",
  GORSEL: "Görsel",
  VIDEO: "Video",
  BUTON: "Buton Grubu",
  RANDEVU: "Randevu",
};

export default async function SayfaBuilder({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const sayfa = await prisma.davetSayfasi.findUnique({
    where: { id },
    include: { moduller: { orderBy: { sira: "asc" } } },
  });
  if (!sayfa || sayfa.kullaniciId !== user.id) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{sayfa.baslik}</h1>
        <div className="flex items-center gap-2">
          <form action={sayfaYayinla.bind(null, sayfa.id)}>
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              {sayfa.durum === "YAYINDA" ? "Taslağa Al" : "Yayınla"}
            </button>
          </form>
          <form action={sayfaSil.bind(null, sayfa.id)}>
            <button className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50">
              <Trash2 size={15} /> Sil
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Modüller</h2>
          {sayfa.moduller.map((m) => {
            const ic = m.icerik as Record<string, unknown>;
            return (
              <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-indigo-600">
                    {MODUL_ETIKET[m.tip] ?? m.tip}
                  </span>
                  <form action={modulSil.bind(null, m.id, sayfa.id)}>
                    <button className="rounded p-1 text-rose-500 hover:bg-rose-50" title="Sil">
                      <Trash2 size={15} />
                    </button>
                  </form>
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {ic.baslik ? <p className="font-medium">{String(ic.baslik)}</p> : null}
                  {ic.metin ? <p className="whitespace-pre-wrap">{String(ic.metin)}</p> : null}
                  {ic.url ? <p className="break-all text-xs text-slate-400">{String(ic.url)}</p> : null}
                  {ic.butonlar ? <p className="text-xs text-slate-400">Butonlar: İlgileniyorum · Detay · Randevu · WhatsApp</p> : null}
                  {m.tip === "RANDEVU" && <p className="text-xs text-slate-400">Aday randevu talep edebilir</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Modül Ekle</h2>
          <ModulEkle sayfaId={sayfa.id} tip="METIN" baslikAlani metinAlani />
          <ModulEkle sayfaId={sayfa.id} tip="VIDEO" urlAlani placeholder="YouTube/Vimeo embed linki" />
          <ModulEkle sayfaId={sayfa.id} tip="GORSEL" urlAlani placeholder="Görsel URL" />
          <ModulEkle sayfaId={sayfa.id} tip="BUTON" />
          <ModulEkle sayfaId={sayfa.id} tip="RANDEVU" />
        </div>
      </div>
    </div>
  );
}

function ModulEkle({
  sayfaId,
  tip,
  baslikAlani,
  metinAlani,
  urlAlani,
  placeholder,
}: {
  sayfaId: string;
  tip: string;
  baslikAlani?: boolean;
  metinAlani?: boolean;
  urlAlani?: boolean;
  placeholder?: string;
}) {
  return (
    <form action={modulEkle.bind(null, sayfaId)} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
      <input type="hidden" name="tip" value={tip} />
      <p className="text-sm font-medium text-slate-700">{MODUL_ETIKET[tip] ?? tip}</p>
      {baslikAlani && <input name="baslik" placeholder="Başlık" className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />}
      {metinAlani && <textarea name="metin" rows={2} placeholder="Metin" className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />}
      {urlAlani && <input name="url" placeholder={placeholder} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />}
      <button className="w-full rounded-lg bg-slate-100 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
        + Ekle
      </button>
    </form>
  );
}
