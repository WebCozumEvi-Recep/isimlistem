import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DurumRozeti from "@/components/DurumRozeti";
import {
  SUNUM_DURUMLARI,
  DURUM_ETIKET,
  DURUM_RENK,
  type SunumDurum,
} from "@/lib/sabitler";

export default async function PanelAnaSayfa() {
  const user = await requireUser();
  const simdi = new Date();

  const [kisiler, gecikmis] = await Promise.all([
    prisma.kisi.groupBy({
      by: ["durum"],
      where: { kullaniciId: user.id },
      _count: true,
    }),
    prisma.kisi.findMany({
      where: {
        kullaniciId: user.id,
        sonrakiTakip: { lte: simdi },
        durum: { notIn: ["KATILDI", "KAYIP"] },
      },
      orderBy: { sonrakiTakip: "asc" },
      take: 10,
    }),
  ]);

  const sayac = new Map<SunumDurum, number>();
  let toplam = 0;
  for (const g of kisiler) {
    sayac.set(g.durum as SunumDurum, g._count);
    toplam += g._count;
  }
  const katildi = sayac.get("KATILDI") ?? 0;
  const donusum = toplam ? Math.round((katildi / toplam) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Merhaba, {user.adSoyad} 👋</h1>
        <p className="text-slate-500">İsim listenin iş sunum hunisi özeti.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <OzetKart baslik="Toplam Kişi" deger={toplam} vurgu />
        <OzetKart baslik="Katılan" deger={katildi} />
        <OzetKart baslik="Dönüşüm" deger={`%${donusum}`} />
        <OzetKart
          baslik="Gecikmiş Takip"
          deger={gecikmis.length}
          uyari={gecikmis.length > 0}
        />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Huni Dağılımı</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {SUNUM_DURUMLARI.map((d) => (
            <Link
              key={d}
              href={`/panel/liste?durum=${d}`}
              className={`rounded-xl border p-4 transition hover:shadow-sm ${DURUM_RENK[d]}`}
            >
              <div className="text-2xl font-bold">{sayac.get(d) ?? 0}</div>
              <div className="text-xs font-medium">{DURUM_ETIKET[d]}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Bugün/Gecikmiş Takipler
        </h2>
        {gecikmis.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Bekleyen takip yok. 🎉
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {gecikmis.map((k) => (
              <li key={k.id}>
                <Link
                  href={`/panel/kisi/${k.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                >
                  <div>
                    <div className="font-medium text-slate-900">{k.adSoyad}</div>
                    <div className="text-xs text-slate-500">
                      Takip: {k.sonrakiTakip?.toLocaleDateString("tr-TR")}
                      {k.telefon ? ` · ${k.telefon}` : ""}
                    </div>
                  </div>
                  <DurumRozeti durum={k.durum as SunumDurum} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function OzetKart({
  baslik,
  deger,
  vurgu,
  uyari,
}: {
  baslik: string;
  deger: number | string;
  vurgu?: boolean;
  uyari?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        uyari
          ? "border-rose-200 bg-rose-50"
          : vurgu
            ? "border-indigo-200 bg-indigo-50"
            : "border-slate-200 bg-white"
      }`}
    >
      <div className="text-sm text-slate-500">{baslik}</div>
      <div
        className={`mt-1 text-3xl font-bold ${
          uyari ? "text-rose-600" : vurgu ? "text-indigo-600" : "text-slate-900"
        }`}
      >
        {deger}
      </div>
    </div>
  );
}
