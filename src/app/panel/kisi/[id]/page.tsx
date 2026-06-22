import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KisiForm from "@/components/KisiForm";
import AktiviteTimeline from "@/components/AktiviteTimeline";
import DurumRozeti from "@/components/DurumRozeti";
import AdayAnalitik from "@/components/AdayAnalitik";
import { kisiGuncelle, durumDegistir, kisiSil } from "@/app/panel/actions";
import { whatsappHazirla, gonderildiOnayla } from "@/app/panel/davet-actions";
import { firmaUyeligi } from "@/lib/firma";
import { SUNUM_DURUMLARI, DURUM_ETIKET, SICAKLIK_ETIKET, SICAKLIK_RENK, skorSicaklik, type SunumDurum } from "@/lib/sabitler";
import { Send, MessageCircle, Activity, History, ListChecks, UserPen, Eye, Clock, MousePointerClick, ExternalLink } from "lucide-react";
import KisiSilButonu from "@/components/KisiSilButonu";

const BOLUMLER = [
  { key: "davet", etiket: "WhatsApp Daveti", Icon: MessageCircle },
  { key: "mesajlar", etiket: "Gönderilen Mesajlar", Icon: Send },
  { key: "etkilesim", etiket: "Etkileşim", Icon: Activity },
  { key: "durum", etiket: "Durum Güncelle", Icon: ListChecks },
  { key: "aktivite", etiket: "Aktivite Geçmişi", Icon: History },
  { key: "bilgiler", etiket: "Bilgiler", Icon: UserPen },
] as const;

const CTA_ETIKET: Record<string, string> = {
  cta_interested: "İlgileniyorum",
  cta_more_info: "Daha detaylı bilgi",
  whatsapp_clicked: "WhatsApp'a tıkladı",
  appointment_requested: "Randevu istedi",
  cta_not_interested: "İlgilenmiyor",
};

type OlayLite = { olayTip: string; scrollYuzde: number | null; videoYuzde: number | null; sayfadaSure: number | null };

function sureMetin(sn: number): string {
  if (sn <= 0) return "—";
  const d = Math.floor(sn / 60);
  const s = sn % 60;
  return d > 0 ? `${d} dk ${s} sn` : `${s} sn`;
}

function linkOzet(olaylar: OlayLite[]) {
  const sure = Math.max(0, ...olaylar.map((o) => o.sayfadaSure ?? 0));
  const scroll = Math.max(0, ...olaylar.map((o) => o.scrollYuzde ?? scrollEsik(o.olayTip)));
  const video = Math.max(0, ...olaylar.map((o) => o.videoYuzde ?? videoEsik(o.olayTip)));
  const ctalar = [...new Set(olaylar.filter((o) => CTA_ETIKET[o.olayTip]).map((o) => o.olayTip))];
  return { sure, scroll, video, ctalar };
}
function scrollEsik(t: string) { const m = /^scroll_(\d+)$/.exec(t); return m ? Number(m[1]) : 0; }
function videoEsik(t: string) { const m = /^video_(\d+)$/.exec(t); return m ? Number(m[1]) : 0; }

export default async function KisiDetaySayfasi({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bolum?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { bolum } = await searchParams;
  const aktif = BOLUMLER.some((b) => b.key === bolum) ? bolum! : "davet";

  const kisi = await prisma.kisi.findUnique({
    where: { id },
    include: {
      aktiviteler: { orderBy: { tarih: "desc" } },
      davetLinkleri: { include: { olaylar: true } },
      hazirMesajlar: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!kisi || kisi.kullaniciId !== user.id) notFound();

  const uyelik = await firmaUyeligi(user.id);
  const firmaId = uyelik?.firmaId;
  const [kaliplar, sayfalar] = await Promise.all([
    prisma.mesajKalibi.findMany({
      where: {
        aktif: true,
        OR: [{ sahiplik: "GLOBAL" }, { kullaniciId: user.id }, ...(firmaId ? [{ firmaId }] : [])],
      },
      orderBy: [{ sahiplik: "asc" }, { baslik: "asc" }],
    }),
    prisma.davetSayfasi.findMany({
      where: { OR: [{ kullaniciId: user.id }, ...(firmaId ? [{ firmaId, durum: "YAYINDA" as const }] : [])] },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  // Analitik agregasyon
  const olaylar = kisi.davetLinkleri.flatMap((l) => l.olaylar);
  const acilmaSayisi = kisi.davetLinkleri.reduce((a, l) => a + l.acilmaSayisi, 0);
  const ilkler = kisi.davetLinkleri.map((l) => l.ilkAcilmaAt).filter((d): d is Date => !!d);
  const sonlar = kisi.davetLinkleri.map((l) => l.sonAcilmaAt).filter((d): d is Date => !!d);
  const ilkAcilma = ilkler.sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
  const sonAcilma = sonlar.sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
  const maxSure = Math.max(0, ...olaylar.map((o) => o.sayfadaSure ?? 0));
  const maxScroll = Math.max(0, ...olaylar.map((o) => o.scrollYuzde ?? 0));
  const maxVideo = Math.max(0, ...olaylar.map((o) => o.videoYuzde ?? 0));
  const butonlar = [...new Set(olaylar.filter((o) => o.olayTip.startsWith("cta_") || o.olayTip === "whatsapp_clicked" || o.olayTip === "appointment_requested").map((o) => o.olayTip))];
  const sicaklik = skorSicaklik(kisi.skor);
  // Linki silinmiş (ölü) eski mesajları gösterme; yalnızca canlı linke bağlı
  // (ya da linksiz) en güncel mesajı sun.
  const canliLinkIdleri = new Set(kisi.davetLinkleri.map((l) => l.id));
  const sonMesaj = kisi.hazirMesajlar.find((m) => !m.linkId || canliLinkIdleri.has(m.linkId));

  // Mesaj geçmişi için: link ve kalıp eşlemeleri
  const linkMap = new Map(kisi.davetLinkleri.map((l) => [l.id, l]));
  const kalipMap = new Map(kaliplar.map((k) => [k.id, k.baslik]));

  const guncelleAction = kisiGuncelle.bind(null, kisi.id);
  const durumAction = durumDegistir.bind(null, kisi.id);
  const silAction = kisiSil.bind(null, kisi.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{kisi.adSoyad}</h1>
        <DurumRozeti durum={kisi.durum as SunumDurum} />
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${SICAKLIK_RENK[sicaklik]}`}>
          Skor {kisi.skor} · {SICAKLIK_ETIKET[sicaklik]}
        </span>
      </div>

      {/* Sekmeler */}
      <div className="flex flex-wrap gap-1 overflow-x-auto border-b border-slate-200">
        {BOLUMLER.map((b) => (
          <Link
            key={b.key}
            href={`/panel/kisi/${kisi.id}?bolum=${b.key}`}
            scroll={false}
            className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-3.5 py-2.5 text-sm font-medium transition ${aktif === b.key ? "border-b-2 border-emerald-500 text-emerald-700" : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <b.Icon size={15} /> {b.etiket}
          </Link>
        ))}
      </div>

      {/* WhatsApp Daveti */}
      {aktif === "davet" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <MessageCircle size={20} className="text-emerald-600" /> WhatsApp Daveti Hazırla
          </h2>
          {sayfalar.length === 0 ? (
            <p className="text-sm text-slate-600">
              Önce bir <Link href="/panel/sayfalar" className="font-medium text-emerald-600 underline">davet sayfası</Link> oluşturun.
            </p>
          ) : (
            <form action={whatsappHazirla.bind(null, kisi.id)} className="grid gap-3 sm:grid-cols-2">
              <select name="kalipId" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Mesaj kalıbı seç…</option>
                {kaliplar.map((k) => (
                  <option key={k.id} value={k.id}>{k.baslik}</option>
                ))}
              </select>
              <select name="sayfaId" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Davet sayfası seç…</option>
                {sayfalar.map((s) => (
                  <option key={s.id} value={s.id}>{s.baslik}</option>
                ))}
              </select>
              <button className="sm:col-span-2 rounded-lg bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700">
                Mesajı Hazırla
              </button>
            </form>
          )}

          {sonMesaj && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <p className="whitespace-pre-wrap text-sm text-slate-700">{sonMesaj.mesajMetni}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={sonMesaj.waMeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <MessageCircle size={15} /> WhatsApp&apos;ta Aç
                </a>
                {sonMesaj.durum !== "GONDERILDI_ONAY" ? (
                  <form action={gonderildiOnayla.bind(null, sonMesaj.id, kisi.id)}>
                    <button className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <Send size={15} /> Gönderdim
                    </button>
                  </form>
                ) : (
                  <span className="text-xs font-medium text-emerald-700">✓ Gönderildi olarak işaretlendi</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gönderilen Mesajlar — her mesaj + linkinin etkileşimi ayrı ayrı */}
      {aktif === "mesajlar" && (
        kisi.hazirMesajlar.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Henüz mesaj hazırlanmadı. &ldquo;WhatsApp Daveti&rdquo; sekmesinden mesaj hazırlayabilirsin.
          </p>
        ) : (
          <div className="space-y-3">
            {kisi.hazirMesajlar.map((msg) => {
              const link = msg.linkId ? linkMap.get(msg.linkId) : undefined;
              const ozet = link ? linkOzet(link.olaylar) : null;
              const kalipAd = (msg.kalipId && kalipMap.get(msg.kalipId)) || "Mesaj";
              const gonderildi = msg.durum === "GONDERILDI_ONAY";
              return (
                <div key={msg.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Send size={16} className="text-emerald-500" />
                      <span className="font-semibold text-slate-900">{kalipAd}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${gonderildi ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {gonderildi ? "Gönderildi" : "Hazırlandı"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {(msg.gonderildiOnayAt ?? msg.createdAt).toLocaleString("tr-TR")}
                    </span>
                  </div>

                  {!link ? (
                    <p className="mt-3 text-sm text-slate-400">Bu mesajın daveti artık geçerli değil (sayfa silinmiş).</p>
                  ) : link.acilmaSayisi === 0 ? (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                      <Eye size={15} className="text-slate-400" /> Henüz açılmadı
                    </p>
                  ) : (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Istatistik etiket="Açılma" deger={`${link.acilmaSayisi} kez`} Icon={Eye} />
                      <Istatistik etiket="İnceleme süresi" deger={sureMetin(ozet!.sure)} Icon={Clock} />
                      <Istatistik etiket="Sayfa kaydırma" deger={ozet!.scroll > 0 ? `%${ozet!.scroll}` : "—"} Icon={MousePointerClick} />
                      <Istatistik etiket="Video izleme" deger={ozet!.video > 0 ? `%${ozet!.video}` : "—"} Icon={Activity} />
                    </div>
                  )}

                  {link && link.ilkAcilmaAt && (
                    <p className="mt-2 text-xs text-slate-400">
                      İlk açılış: {link.ilkAcilmaAt.toLocaleString("tr-TR")}
                      {link.sonAcilmaAt && ` · Son açılış: ${link.sonAcilmaAt.toLocaleString("tr-TR")}`}
                    </p>
                  )}

                  {ozet && ozet.ctalar.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {ozet.ctalar.map((c) => (
                        <span key={c} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{CTA_ETIKET[c]}</span>
                      ))}
                    </div>
                  )}

                  <a href={msg.waMeUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    <ExternalLink size={14} /> WhatsApp&apos;ta aç
                  </a>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Etkileşim */}
      {aktif === "etkilesim" && (
        <AdayAnalitik
          acilmaSayisi={acilmaSayisi}
          ilkAcilma={ilkAcilma}
          sonAcilma={sonAcilma}
          maxSure={maxSure}
          maxScroll={maxScroll}
          maxVideo={maxVideo}
          butonlar={butonlar}
          skor={kisi.skor}
        />
      )}

      {/* Durum Güncelle */}
      {aktif === "durum" && (
        <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Durum Güncelle</h2>
          <form action={durumAction} className="space-y-3">
            <select name="durum" defaultValue={kisi.durum} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {SUNUM_DURUMLARI.map((d) => (
                <option key={d} value={d}>{DURUM_ETIKET[d]}</option>
              ))}
            </select>
            <input name="aciklama" placeholder="Not (ör: telefonda görüştük)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white hover:bg-emerald-600">
              Durumu Kaydet
            </button>
          </form>
        </div>
      )}

      {/* Aktivite Geçmişi */}
      {aktif === "aktivite" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Aktivite Geçmişi</h2>
          <AktiviteTimeline aktiviteler={kisi.aktiviteler} />
        </div>
      )}

      {/* Bilgiler */}
      {aktif === "bilgiler" && (
        <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Bilgiler</h2>
          <KisiForm kisi={kisi} action={guncelleAction} gonderEtiket="Bilgileri Güncelle" />
        </div>
      )}

      <KisiSilButonu adSoyad={kisi.adSoyad} action={silAction} />
    </div>
  );
}

function Istatistik({ etiket, deger, Icon }: { etiket: string; deger: string; Icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Icon size={13} /> {etiket}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-slate-800">{deger}</div>
    </div>
  );
}
