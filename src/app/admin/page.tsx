import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [kullaniciSayisi, firmaSayisi, aktifFirma, kisiSayisi, linkSayisi, randevuSayisi] = await Promise.all([
    prisma.kullanici.count(),
    prisma.firma.count(),
    prisma.firma.count({ where: { durum: "AKTIF" } }),
    prisma.kisi.count(),
    prisma.davetLinki.count(),
    prisma.randevuTalebi.count(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Dashboard</h1>
        <p className="text-slate-500">Genel kullanım istatistikleri.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kart baslik="Kullanıcı" deger={kullaniciSayisi} vurgu />
        <Kart baslik="Firma" deger={firmaSayisi} />
        <Kart baslik="Aktif Firma" deger={aktifFirma} />
        <Kart baslik="Toplam Aday" deger={kisiSayisi} />
        <Kart baslik="Davet Linki" deger={linkSayisi} />
        <Kart baslik="Randevu" deger={randevuSayisi} />
      </div>
      <p className="text-xs text-slate-400">
        Yönetim paneli yalnızca toplu/sayısal istatistik gösterir; kullanıcıların kişisel aday notları burada görüntülenmez.
      </p>
    </div>
  );
}

function Kart({ baslik, deger, vurgu }: { baslik: string; deger: number; vurgu?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${vurgu ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
      <div className="text-sm text-slate-500">{baslik}</div>
      <div className={`mt-1 text-2xl font-bold ${vurgu ? "text-emerald-600" : "text-slate-900"}`}>{deger}</div>
    </div>
  );
}
