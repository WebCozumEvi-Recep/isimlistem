import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DavetTracker from "@/components/DavetTracker";
import DavetVideo from "@/components/DavetVideo";
import { ButonGrubu, RandevuModulu } from "@/components/DavetAksiyonlar";
import { SSSListesi, HikayelerBolum, SecimBolum } from "@/components/DavetIcerik";
import { telefonNormalize } from "@/server/mesaj";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <DavetTracker token={token} />
      <div className="mx-auto max-w-lg space-y-5 px-4">
        {link.sayfa.moduller.map((m) => {
          const ic = m.icerik as Record<string, unknown>;
          const yaz = (s: unknown) => String(s ?? "").replace(/\{ad\}/g, ad).replace(/\{tam_ad\}/g, link.kisi.adSoyad);

          if (m.tip === "KARSILAMA" || m.tip === "METIN") {
            return (
              <div key={m.id} className="rounded-2xl bg-white p-6 shadow-sm">
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
                  {ogeler.map((o, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-4">
                      {o.baslik ? <p className="font-semibold text-slate-900">{o.baslik}</p> : null}
                      {o.metin ? <p className="mt-0.5 text-sm text-slate-600">{o.metin}</p> : null}
                    </div>
                  ))}
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
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="mt-0.5 text-emerald-500">✅</span> {o}
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
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">{i + 1}</span>
                        <span className="font-medium text-slate-800">{o}</span>
                      </div>
                      {i < ogeler.length - 1 && <div className="ml-4 h-4 w-px bg-slate-200" />}
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
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
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
            <a href="/yasal/kvkk" className="underline">KVKK</a> ·{" "}
            <a href="/yasal/gizlilik" className="underline">Gizlilik</a> ·{" "}
            <a href="/yasal/veri-silme" className="underline">Verilerimi sil</a>
          </p>
        </div>
      </div>
    </div>
  );
}
