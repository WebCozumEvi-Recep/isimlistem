import { Eye, Clock, MousePointerClick, Film, MoveVertical } from "lucide-react";

type Props = {
  acilmaSayisi: number;
  ilkAcilma: Date | null;
  sonAcilma: Date | null;
  maxSure: number; // saniye
  maxScroll: number;
  maxVideo: number;
  butonlar: string[];
  skor: number;
};

const CTA_ETIKET: Record<string, string> = {
  cta_interested: "İlgileniyorum",
  cta_more_info: "Daha detaylı bilgi",
  whatsapp_clicked: "WhatsApp'tan yaz",
  appointment_requested: "Randevu",
  cta_not_interested: "İlgilenmiyorum",
};

function sure(sn: number): string {
  if (sn <= 0) return "—";
  const d = Math.floor(sn / 60);
  const s = sn % 60;
  return d > 0 ? `${d} dk ${s} sn` : `${s} sn`;
}

function tarih(d: Date | null): string {
  return d ? new Date(d).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" }) : "—";
}

export default function AdayAnalitik(p: Props) {
  const acildiMi = p.acilmaSayisi > 0;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Etkileşim</h2>
      {!acildiMi ? (
        <p className="text-sm text-slate-500">
          Aday henüz davet linkini açmadı. Açıldığında davranışlar burada görünecek.
        </p>
      ) : (
        <div className="space-y-3 text-sm">
          <Satir icon={Eye} etiket="Açılma sayısı" deger={String(p.acilmaSayisi)} />
          <Satir icon={Clock} etiket="İlk açma" deger={tarih(p.ilkAcilma)} />
          <Satir icon={Clock} etiket="Son açma" deger={tarih(p.sonAcilma)} />
          <Satir icon={Clock} etiket="Sayfada süre" deger={sure(p.maxSure)} />
          <Satir icon={MoveVertical} etiket="Scroll" deger={`%${p.maxScroll}`} />
          <Satir icon={Film} etiket="Video izleme" deger={`%${p.maxVideo}`} />
          {p.butonlar.length > 0 && (
            <div className="flex items-start gap-2 text-slate-600">
              <MousePointerClick size={15} className="mt-0.5 text-slate-400" />
              <div className="flex flex-wrap gap-1">
                {p.butonlar.map((b) => (
                  <span key={b} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                    {CTA_ETIKET[b] ?? b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Satir({
  icon: Icon,
  etiket,
  deger,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  etiket: string;
  deger: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-500">
        <Icon size={15} className="text-slate-400" />
        {etiket}
      </span>
      <span className="font-medium text-slate-900">{deger}</span>
    </div>
  );
}
