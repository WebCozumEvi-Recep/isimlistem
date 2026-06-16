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

export default async function RandevularSayfasi() {
  const user = await requireUser();
  const randevular = await prisma.randevuTalebi.findMany({
    where: { kullaniciId: user.id },
    orderBy: [{ durum: "asc" }, { createdAt: "desc" }],
    include: { kisi: { select: { id: true, adSoyad: true, telefon: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Randevular</h1>
      {randevular.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Henüz randevu talebi yok. Adaylar davet sayfasından randevu istediğinde burada görünecek.
        </p>
      ) : (
        <div className="space-y-3">
          {randevular.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/panel/kisi/${r.kisi.id}`} className="font-semibold text-slate-900 hover:text-indigo-600">
                    {r.kisi.adSoyad}
                  </Link>
                  <div className="mt-1 text-sm text-slate-500">
                    {RANDEVU_TIP_ETIKET[r.tip]} {r.tarihMetni ? `· ${r.tarihMetni}` : ""}
                    {r.kisi.telefon ? ` · ${r.kisi.telefon}` : ""}
                  </div>
                  {r.mesaj && <p className="mt-1 text-sm text-slate-600">"{r.mesaj}"</p>}
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${DURUM_RENK[r.durum]}`}>
                  {DURUM_ETIKET[r.durum]}
                </span>
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
