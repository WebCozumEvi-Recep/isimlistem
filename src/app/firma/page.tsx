import { requireFirmaYonetici } from "@/lib/firma";
import { prisma } from "@/lib/prisma";

export default async function FirmaDashboard() {
  const { firma } = await requireFirmaYonetici();

  const uyeIdler = (await prisma.firmaUye.findMany({ where: { firmaId: firma.id }, select: { kullaniciId: true } })).map((u) => u.kullaniciId);

  const [networkerSayisi, adaySayisi, linkler, randevuSayisi] = await Promise.all([
    prisma.firmaUye.count({ where: { firmaId: firma.id, rol: "NETWORKER" } }),
    prisma.kisi.count({ where: { kullaniciId: { in: uyeIdler } } }),
    prisma.davetLinki.findMany({ where: { kullaniciId: { in: uyeIdler } }, select: { acilmaSayisi: true } }),
    prisma.randevuTalebi.count({ where: { kullaniciId: { in: uyeIdler } } }),
  ]);

  const gonderilen = linkler.length;
  const acilan = linkler.filter((l) => l.acilmaSayisi > 0).length;
  const acilmaOrani = gonderilen ? Math.round((acilan / gonderilen) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{firma.ad} — Dashboard</h1>
        <p className="text-slate-500">Networker ve davet performansı özeti.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kart baslik="Networker" deger={networkerSayisi} vurgu />
        <Kart baslik="Toplam Aday" deger={adaySayisi} />
        <Kart baslik="Davet / Açılma" deger={`${gonderilen} / %${acilmaOrani}`} />
        <Kart baslik="Randevu Talebi" deger={randevuSayisi} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-2 font-semibold text-slate-900">Kayıt Kodu</h2>
        <p className="text-sm text-slate-500">Networker'larını davet etmek için bu kodu paylaş:</p>
        <code className="mt-2 inline-block rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-lg text-indigo-700">{firma.kayitKodu}</code>
        <p className="mt-3 text-xs text-slate-400">
          Networker, kayıt ekranındaki "Firma Kayıt Kodu" alanına bu kodu girerek firmanıza bağlanır.
        </p>
      </div>
    </div>
  );
}

function Kart({ baslik, deger, vurgu }: { baslik: string; deger: number | string; vurgu?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${vurgu ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white"}`}>
      <div className="text-sm text-slate-500">{baslik}</div>
      <div className={`mt-1 text-2xl font-bold ${vurgu ? "text-indigo-600" : "text-slate-900"}`}>{deger}</div>
    </div>
  );
}
