import { requireFirmaYonetici } from "@/lib/firma";
import { prisma } from "@/lib/prisma";

export default async function FirmaRaporlar() {
  const { firma } = await requireFirmaYonetici();
  const uyeler = await prisma.firmaUye.findMany({
    where: { firmaId: firma.id, rol: "NETWORKER" },
    include: { kullanici: { select: { id: true, adSoyad: true } } },
  });
  const idler = uyeler.map((u) => u.kullaniciId);

  const [adayGrup, linkler, randevuGrup, firmaSayfalar] = await Promise.all([
    prisma.kisi.groupBy({ by: ["kullaniciId"], where: { kullaniciId: { in: idler } }, _count: true }),
    prisma.davetLinki.findMany({ where: { kullaniciId: { in: idler } }, select: { kullaniciId: true, acilmaSayisi: true, sayfaId: true } }),
    prisma.randevuTalebi.groupBy({ by: ["kullaniciId"], where: { kullaniciId: { in: idler } }, _count: true }),
    prisma.davetSayfasi.findMany({ where: { firmaId: firma.id }, select: { id: true, baslik: true } }),
  ]);

  const adaySay = new Map(adayGrup.map((g) => [g.kullaniciId, g._count]));
  const randevuSay = new Map(randevuGrup.map((g) => [g.kullaniciId, g._count]));
  const linkSay = new Map<string, { toplam: number; acilan: number }>();
  const sayfaPerf = new Map<string, { toplam: number; acilan: number }>();
  for (const l of linkler) {
    const k = linkSay.get(l.kullaniciId) ?? { toplam: 0, acilan: 0 };
    k.toplam++; if (l.acilmaSayisi > 0) k.acilan++;
    linkSay.set(l.kullaniciId, k);
    const s = sayfaPerf.get(l.sayfaId) ?? { toplam: 0, acilan: 0 };
    s.toplam++; if (l.acilmaSayisi > 0) s.acilan++;
    sayfaPerf.set(l.sayfaId, s);
  }
  const oran = (a: number, t: number) => (t ? Math.round((a / t) * 100) : 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Raporlar</h1>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Networker Performansı</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Networker</th>
                <th className="px-4 py-3 font-medium">Aday</th>
                <th className="px-4 py-3 font-medium">Davet</th>
                <th className="px-4 py-3 font-medium">Açılma Oranı</th>
                <th className="px-4 py-3 font-medium">Randevu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {uyeler.map((u) => {
                const l = linkSay.get(u.kullaniciId) ?? { toplam: 0, acilan: 0 };
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{u.kullanici.adSoyad}</td>
                    <td className="px-4 py-3">{adaySay.get(u.kullaniciId) ?? 0}</td>
                    <td className="px-4 py-3">{l.toplam}</td>
                    <td className="px-4 py-3">%{oran(l.acilan, l.toplam)}</td>
                    <td className="px-4 py-3">{randevuSay.get(u.kullaniciId) ?? 0}</td>
                  </tr>
                );
              })}
              {uyeler.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Veri yok.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Sayfa Performansı</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {firmaSayfalar.map((s) => {
            const p = sayfaPerf.get(s.id) ?? { toplam: 0, acilan: 0 };
            return (
              <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-slate-900">{s.baslik}</h3>
                <div className="mt-2 text-sm text-slate-500">{p.toplam} davet · %{oran(p.acilan, p.toplam)} açılma</div>
              </div>
            );
          })}
          {firmaSayfalar.length === 0 && <p className="text-sm text-slate-400">Firma sayfası yok.</p>}
        </div>
      </section>

      <p className="text-xs text-slate-400">
        Gizlilik: Raporlar yalnızca sayısal/anonim performans içerir. Aday kişisel verileri firmaya gösterilmez.
      </p>
    </div>
  );
}
