import { DURUM_ETIKET, DURUM_RENK, type SunumDurum } from "@/lib/sabitler";

type Aktivite = {
  id: string;
  durum: string;
  aciklama: string | null;
  tarih: Date;
};

export default function AktiviteTimeline({ aktiviteler }: { aktiviteler: Aktivite[] }) {
  if (aktiviteler.length === 0) {
    return <p className="text-sm text-slate-500">Henüz aktivite yok.</p>;
  }
  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-5">
      {aktiviteler.map((a) => {
        const d = a.durum as SunumDurum;
        return (
          <li key={a.id} className="relative">
            <span
              className={`absolute -left-[1.45rem] top-1 h-3 w-3 rounded-full border ${DURUM_RENK[d]}`}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">
                {DURUM_ETIKET[d]}
              </span>
              <span className="text-xs text-slate-400">
                {a.tarih.toLocaleString("tr-TR")}
              </span>
            </div>
            {a.aciklama && <p className="text-sm text-slate-600">{a.aciklama}</p>}
          </li>
        );
      })}
    </ol>
  );
}
