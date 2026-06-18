import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DavetTracker from "@/components/DavetTracker";
import DavetVideo from "@/components/DavetVideo";
import { ButonGrubu, RandevuModulu } from "@/components/DavetAksiyonlar";
import { SSSListesi, HikayelerBolum, SecimBolum } from "@/components/DavetIcerik";
import { telefonNormalize } from "@/server/mesaj";
import {
  TrendingUp, Briefcase, Clock3, Users, Sparkles, Target, CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// "Neden tercih ediliyor" kartları için dönüşümlü ikon + renk paleti.
const NEDEN_STILI = [
  { ring: "bg-emerald-100 text-emerald-600", bar: "from-emerald-400 to-teal-500", Icon: TrendingUp },
  { ring: "bg-sky-100 text-sky-600", bar: "from-sky-400 to-indigo-500", Icon: Briefcase },
  { ring: "bg-amber-100 text-amber-600", bar: "from-amber-400 to-orange-500", Icon: Clock3 },
  { ring: "bg-violet-100 text-violet-600", bar: "from-violet-400 to-fuchsia-500", Icon: Users },
  { ring: "bg-rose-100 text-rose-600", bar: "from-rose-400 to-pink-500", Icon: Sparkles },
  { ring: "bg-teal-100 text-teal-600", bar: "from-teal-400 to-cyan-500", Icon: Target },
];

function ytEmbed(url: string): string | null {
  const yt = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/.exec(url);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = /vimeo\.com\/(\d+)/.exec(url);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url.includes("/embed/") || url.includes("player.") ? url : null;
}

export default async function DavetSayfasi({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = await prisma.davetLinki.findUnique({
    where: { token },
    include: {
      kisi: true,
      sayfa: { include: { moduller: { orderBy: { sira: "asc" } }, kullanici: true } },
    },
  });
  if (!link) notFound();

  const ad = link.kisi.adSoyad.trim().split(/\s+/)[0];
  const networker = link.sayfa.kullanici;
  const waNumara = telefonNormalize(networker?.telefon);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 py-8">
      <DavetTracker token={token} />
      <div className="mx-auto max-w-lg space-y-5 px-4">
        {link.sayfa.moduller.map((m) => {
          const ic = m.icerik as Record<string, unknown>;
          const yaz = (s: unknown) => String(s ?? "").replace(/\{ad\}/g, ad).replace(/\{tam_ad\}/g, link.kisi.adSoyad);

          if (m.tip === "KARSILAMA") {
            return (
              <div key={m.id} className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-7 text-white shadow-lg shadow-emerald-200">
                {ic.baslik ? <h2 className="text-2xl font-bold leading-tight">{yaz(ic.baslik)}</h2> : null}
                {ic.metin ? <p className="mt-3 whitespace-pre-wrap text-emerald-50/90">{yaz(ic.metin)}</p> : null}
              </div>
            );
          }
          if (m.tip === "METIN") {
            return (
              <div key={m.id} className="rounded-2xl border-l-4 border-emerald-400 bg-white p-6 shadow-sm">
                {ic.baslik ? <h2 className="text-xl font-bold text-slate-900">{yaz(ic.baslik)}</h2> : null}
                {ic.metin ? <p className="mt-2 whitespace-pre-wrap text-slate-600">{yaz(ic.metin)}</p> : null}
              </div>
            );
          }
          if (m.tip === "NEDENLER") {
            const ogeler = Array.isArray(ic.ogeler) ? (ic.ogeler as { baslik?: string; metin?: string }[]) : [];
            return (
              <div key={m.id} className="rounded-2xl bg-white p-6 shadow-sm">
                {ic.baslik ? <h2 className="mb-4 text-xl font-bold text-slate-900">{yaz(ic.baslik)}</h2> : null}
                <div className="space-y-3">
                  {ogeler.map((o, i) => {
                    const s = NEDEN_STILI[i % NEDEN_STILI.length];
                    return (
                      <div key={i} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.ring}`}>
                          <s.Icon size={22} />
                        </span>
                        <div>
                          {o.baslik ? <p className="font-semibold text-slate-900">{o.baslik}</p> : null}
                          {o.metin ? <p className="mt-0.5 text-sm text-slate-600">{o.metin}</p> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          if (m.tip === "LISTE") {
            const ogeler = Array.isArray(ic.ogeler) ? (ic.ogeler as string[]) : [];
            return (
              <div key={m.id} className="rounded-2xl bg-white p-6 shadow-sm">
                {ic.baslik ? <h2 className="mb-4 text-xl font-bold text-slate-900">{yaz(ic.baslik)}</h2> : null}
                <ul className="space-y-2.5">
                  {ogeler.map((o, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 font-medium text-slate-700">
                      <CheckCircle2 size={20} className="shrink-0 text-emerald-500" /> {o}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          if (m.tip === "ADIMLAR") {
            const ogeler = Array.isArray(ic.ogeler) ? (ic.ogeler as string[]) : [];
            return (
              <div key={m.id} className="rounded-2xl bg-white p-6 shadow-sm">
                {ic.baslik ? <h2 className="mb-4 text-xl font-bold text-slate-900">{yaz(ic.baslik)}</h2> : null}
                <ol className="space-y-1">
                  {ogeler.map((o, i) => (
                    <li key={i}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-sm">{i + 1}</span>
                        <span className="font-medium text-slate-800">{o}</span>
                      </div>
                      {i < ogeler.length - 1 && <div className="ml-[18px] h-5 w-0.5 bg-gradient-to-b from-emerald-300 to-teal-200" />}
                    </li>
                  ))}
                </ol>
              </div>
            );
          }
          if (m.tip === "HIKAYELER") {
            const ogeler = Array.isArray(ic.ogeler) ? (ic.ogeler as { ad?: string; foto?: string; metin?: string }[]) : [];
            return <HikayelerBolum key={m.id} token={token} baslik={ic.baslik ? yaz(ic.baslik) : undefined} ogeler={ogeler} />;
          }
          if (m.tip === "SSS") {
            const ogeler = Array.isArray(ic.ogeler) ? (ic.ogeler as { soru: string; cevap: string }[]) : [];
            return <SSSListesi key={m.id} token={token} baslik={ic.baslik ? yaz(ic.baslik) : undefined} ogeler={ogeler} />;
          }
          if (m.tip === "SECIM") {
            const secenekler = Array.isArray(ic.secenekler) ? (ic.secenekler as { etiket: string; hedef: string }[]) : [];
            return <SecimBolum key={m.id} token={token} baslik={ic.baslik ? yaz(ic.baslik) : undefined} secenekler={secenekler} whatsapp={waNumara} />;
          }
          if (m.tip === "GORSEL" && ic.url) {
            // eslint-disable-next-line @next/next/no-img-element
            return <img key={m.id} src={String(ic.url)} alt="" className="w-full rounded-2xl shadow-sm" />;
          }
          if (m.tip === "VIDEO" && ic.url) {
            const embed = ytEmbed(String(ic.url));
            return embed ? <DavetVideo key={m.id} token={token} embedUrl={embed} /> : null;
          }
          if (m.tip === "BUTON") {
            return (
              <div key={m.id} className="rounded-2xl bg-white p-6 shadow-sm">
                <ButonGrubu token={token} whatsapp={waNumara} />
              </div>
            );
          }
          if (m.tip === "RANDEVU") {
            return (
              <div key={m.id} className="rounded-2xl bg-white p-6 shadow-sm">
                <RandevuModulu token={token} />
              </div>
            );
          }
          return null;
        })}

        {networker && (
          <div className="flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-sm">
            <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xl font-bold text-white shadow-sm">
              {networker.adSoyad.trim().charAt(0).toUpperCase()}
            </span>
            <p className="text-sm text-slate-500">Bu daveti gönderen</p>
            <p className="font-semibold text-slate-900">{networker.adSoyad}</p>
            {networker.bio && <p className="mt-1 text-sm text-slate-500">{networker.bio}</p>}
          </div>
        )}

        <div className="space-y-2 px-2 pb-6 text-center text-xs text-slate-400">
          <p>
            Bu sayfa size özel hazırlanmış bir bilgilendirme bağlantısıdır. Ziyaretiniz,
            görüntüleme süreniz ve buton tıklamalarınız, daveti gönderen kullanıcıya geri
            bildirim sağlamak amacıyla kaydedilebilir.
          </p>
          <p>
            <Link href="/yasal/kvkk" className="underline">KVKK</Link> ·{" "}
            <Link href="/yasal/gizlilik" className="underline">Gizlilik</Link> ·{" "}
            <Link href="/yasal/veri-silme" className="underline">Verilerimi sil</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
