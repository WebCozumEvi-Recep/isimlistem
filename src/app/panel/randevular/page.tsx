import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randevuDurumGuncelle } from "@/app/panel/davet-actions";
import { Check, X, Clock, CalendarCheck } from "lucide-react";

const RANDEVU_TIP_ETIKET: Record<string, string> = {
  TELEFON: "Telefon", WHATSAPP: "WhatsApp", ZOOM: "Zoom", YUZ_YUZE: "Yüz yüze", OFIS: "Ofis", DIGER: "Diğer",
};
const DURUM_ETIKET: Record<string, string> = {
  TALEP: "Yeni talep", ONAYLANDI: "Onaylandı", REDDEDILDI: "Reddedildi", ERTELENDI: "Ertelendi", TAMAMLANDI: "Tamamlandı", IPTAL: "İptal",
};
const DURUM_RENK: Record<string, string> = {
  TALEP: "bg-amber-100 text-amber-700", ONAYLANDI: "bg-emerald-100 text-emerald-700",
  REDDEDILDI: "bg-rose-100 text-rose-700", ERTELENDI: "bg-sky-100 text-sky-700",
  TAMAMLANDI: "bg-slate-200 text-slate-700", IPTAL: "bg-slate-100 text-slate-500",
};

const AY_ADI = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

/** "18 Haziran 2026 Çarşamba, 14:30 (30 dk)" → Date | null. */
function tarihAyikla(metin?: string | null): Date | null {
  if (!metin) return null;
  const m = /(\d{1,2})\s+([A-Za-zçğıöşüÇĞİÖŞÜ]+)\s+(\d{4}).*?(\d{1,2}):(\d{2})/.exec(metin);
  if (!m) return null;
  const ay = AY_ADI.findIndex((a) => a.toLocaleLowerCase("tr") === m[2].toLocaleLowerCase("tr"));
  if (ay < 0) return null;
  const d = new Date(Number(m[3]), ay, Number(m[1]), Number(m[4]), Number(m[5]));
  return isNaN(d.getTime()) ? null : d;
}

const FILTRELER = [
  { anahtar: "tumu", etiket: "Tümü", durumlar: null as string[] | null },
  { anahtar: "bekleyen", etiket: "Bekleyen", durumlar: ["TALEP", "ERTELENDI"] },
  { anahtar: "onayli", etiket: "Onaylı", durumlar: ["ONAYLANDI"] },
  { anahtar: "tamamlanan", etiket: "Tamamlanan", durumlar: ["TAMAMLANDI"] },
];

export default async function RandevularSayfasi({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const user = await requireUser();
  const { f } = await searchParams;
  const aktif = FILTRELER.find((x) => x.anahtar === f) ?? FILTRELER[0];

  const randevular = await prisma.randevuTalebi.findMany({
    where: {
      kullaniciId: user.id,
      ...(aktif.durumlar ? { durum: { in: aktif.durumlar as never } } : {}),
    },
    include: { kisi: { select: { id: true, adSoyad: true, telefon: true } } },
  });

  // Görüşme tarihine göre sırala: yaklaşan/gelecek önce, tarihsizler ve geçmişler sona.
  const simdi = new Date().getTime();
  const sirali = randevular
    .map((r) => ({ r, gorusme: tarihAyikla(r.tarihMetni) }))
    .sort((a, b) => {
      const ta = a.gorusme?.getTime() ?? null;
      const tb = b.gorusme?.getTime() ?? null;
      const ga = ta !== null && ta >= simdi;
      const gb = tb !== null && tb >= simdi;
      if (ga && gb) return ta! - tb!;            // ikisi de gelecek → en yakın önce
      if (ga !== gb) return ga ? -1 : 1;          // gelecek olan önce
      // ikisi de geçmiş/tarihsiz → talep zamanı yeni önce
      return b.r.createdAt.getTime() - a.r.createdAt.getTime();
    });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Randevular</h1>

      <div className="flex flex-wrap gap-2">
        {FILTRELER.map((x) => (
          <Link
            key={x.anahtar}
            href={x.anahtar === "tumu" ? "/panel/randevular" : `/panel/randevular?f=${x.anahtar}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${aktif.anahtar === x.anahtar ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            {x.etiket}
          </Link>
        ))}
      </div>

      {sirali.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          {aktif.anahtar === "tumu"
            ? "Henüz randevu talebi yok. Adaylar davet sayfasından randevu istediğinde burada görünecek."
            : "Bu filtreye uygun randevu yok."}
        </p>
      ) : (
        <div className="space-y-3">
          {sirali.map(({ r, gorusme }) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/panel/kisi/${r.kisi.id}`} className="font-semibold text-slate-900 hover:text-emerald-600">
                    {r.kisi.adSoyad}
                  </Link>
                  <div className="mt-1 text-sm text-slate-500">
                    {RANDEVU_TIP_ETIKET[r.tip]} {r.tarihMetni ? `· ${r.tarihMetni}` : ""}
                    {r.kisi.telefon ? ` · ${r.kisi.telefon}` : ""}
                  </div>
                  {r.mesaj && <p className="mt-1 text-sm text-slate-600">&ldquo;{r.mesaj}&rdquo;</p>}
                </div>
                <div className="flex items-center gap-2">
                  {gorusme && gorusme.getTime() >= simdi && (
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">Yaklaşan</span>
                  )}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${DURUM_RENK[r.durum]}`}>
                    {DURUM_ETIKET[r.durum]}
                  </span>
                </div>
              </div>
              {(r.durum === "TALEP" || r.durum === "ERTELENDI") && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <DurumButon id={r.id} durum="ONAYLANDI" icon={Check} renk="emerald">Onayla</DurumButon>
                  <DurumButon id={r.id} durum="ERTELENDI" icon={Clock} renk="sky">Ertele</DurumButon>
                  <DurumButon id={r.id} durum="REDDEDILDI" icon={X} renk="rose">Reddet</DurumButon>
                </div>
              )}
              {r.durum === "ONAYLANDI" && (
                <div className="mt-3">
                  <DurumButon id={r.id} durum="TAMAMLANDI" icon={CalendarCheck} renk="slate">Tamamlandı</DurumButon>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DurumButon({
  id, durum, icon: Icon, renk, children,
}: {
  id: string;
  durum: "ONAYLANDI" | "REDDEDILDI" | "ERTELENDI" | "TAMAMLANDI" | "IPTAL";
  icon: React.ComponentType<{ size?: number }>;
  renk: "emerald" | "rose" | "sky" | "slate";
  children: React.ReactNode;
}) {
  const renkler = {
    emerald: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    rose: "border-rose-200 text-rose-700 hover:bg-rose-50",
    sky: "border-sky-200 text-sky-700 hover:bg-sky-50",
    slate: "border-slate-300 text-slate-700 hover:bg-slate-50",
  }[renk];
  return (
    <form action={randevuDurumGuncelle.bind(null, id, durum)}>
      <button className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${renkler}`}>
        <Icon size={15} /> {children}
      </button>
    </form>
  );
}
