import { requireUser } from "@/lib/auth";
import { firmaUyeligi } from "@/lib/firma";
import { prisma } from "@/lib/prisma";
import { kalipEkle, kalipSil } from "@/app/panel/davet-actions";
import { KALIP_KATEGORILERI, KALIP_KATEGORI_ETIKET, type KalipKategori } from "@/lib/sabitler";
import { Trash2, Globe } from "lucide-react";

export default async function KaliplarSayfasi() {
  const user = await requireUser();
  const uyelik = await firmaUyeligi(user.id);
  const firmaId = uyelik?.firmaId;
  const kaliplar = await prisma.mesajKalibi.findMany({
    where: {
      aktif: true,
      OR: [{ sahiplik: "GLOBAL" }, { kullaniciId: user.id }, ...(firmaId ? [{ firmaId }] : [])],
    },
    orderBy: [{ sahiplik: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-4">
      <h1 className="text-[22px] font-extrabold text-[#0F1B2D]">Davet Mesajları</h1>
      <p className="text-[13.5px] font-semibold text-[#7A8799]">
        Hazır şablonu seç, tek dokunuşla adayına gönder. Değişkenler: <code>{"{ad}"}</code>, <code>{"{tam_ad}"}</code>,{" "}
        <code>{"{networker_ad}"}</code>, <code>{"{ozel_davet_linki}"}</code>
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-3">
          {kaliplar.length === 0 && (
            <p className="text-sm text-slate-500">Henüz kalıp yok. Sağdan yeni kalıp ekleyin.</p>
          )}
          {kaliplar.map((k) => (
            <div key={k.id} className="rounded-[18px] border border-[#ECEFF3] bg-white p-4 shadow-[0_8px_22px_-18px_rgba(15,27,45,.5)]">
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-extrabold text-[#0F1B2D]">{k.baslik}</h3>
                  {k.sahiplik === "GLOBAL" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                      <Globe size={11} /> Hazır
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#E7F8EE] px-2.5 py-1 text-[11px] font-bold text-[#16A34A]">
                    {KALIP_KATEGORI_ETIKET[k.kategori as KalipKategori] ?? k.kategori}
                  </span>
                  {k.sahiplik === "KISISEL" && (
                    <form action={kalipSil.bind(null, k.id)}>
                      <button className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" title="Sil">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <p className="whitespace-pre-wrap rounded-xl border border-[#EEF2F6] bg-[#F7F9FB] px-3.5 py-3 text-[13px] font-medium leading-relaxed text-[#5A6678]">{k.metin}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[18px] border border-[#ECEFF3] bg-white p-4 shadow-[0_8px_22px_-18px_rgba(15,27,45,.5)]">
          <h2 className="mb-3 text-[15px] font-extrabold text-[#0F1B2D]">Yeni Kalıp</h2>
          <form action={kalipEkle} className="space-y-2.5">
            <input
              name="baslik"
              placeholder="Kalıp adı"
              required
              className="w-full rounded-xl border border-[#E4E9F0] bg-[#F7F9FB] px-3.5 py-3 text-sm outline-none focus:border-emerald-500"
            />
            <select name="kategori" className="w-full rounded-xl border border-[#E4E9F0] bg-[#F7F9FB] px-3.5 py-3 text-sm font-semibold text-[#3B4759]">
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
              className="w-full rounded-xl border border-[#E4E9F0] bg-[#F7F9FB] px-3.5 py-3 text-sm outline-none focus:border-emerald-500"
            />
            <button className="w-full rounded-xl bg-gradient-to-br from-[#1FB46A] to-[#0E8A4D] py-3 text-sm font-bold text-white shadow-[0_10px_22px_-12px_rgba(14,138,77,.7)]">
              Kalıbı Kaydet
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
