import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cikisYap } from "@/app/auth/actions";

export default async function AdminSayfasi() {
  await requireAdmin();

  const kullanicilar = await prisma.kullanici.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { kisiler: true } } },
  });

  // Üye başına katılan (KATILDI) kişi sayısı.
  const katilanlar = await prisma.kisi.groupBy({
    by: ["kullaniciId"],
    where: { durum: "KATILDI" },
    _count: true,
  });
  const katilanMap = new Map(katilanlar.map((k) => [k.kullaniciId, k._count]));

  const toplamKisi = kullanicilar.reduce((t, u) => t + u._count.kisiler, 0);
  const toplamKatilan = katilanlar.reduce((t, k) => t + k._count, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-indigo-600">İsim Listem · Yönetim</h1>
          <div className="flex items-center gap-3">
            <Link href="/panel" className="text-sm text-slate-600 hover:underline">
              Panele Dön
            </Link>
            <form action={cikisYap}>
              <button className="text-sm text-slate-500 hover:underline">Çıkış</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <div className="grid grid-cols-3 gap-3">
          <Kart baslik="Üye Sayısı" deger={kullanicilar.length} />
          <Kart baslik="Toplam Kişi" deger={toplamKisi} />
          <Kart baslik="Toplam Katılan" deger={toplamKatilan} />
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Üye</th>
                <th className="px-4 py-3">E-posta</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Kişi</th>
                <th className="px-4 py-3">Katılan</th>
                <th className="px-4 py-3">Dönüşüm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kullanicilar.map((u) => {
                const katilan = katilanMap.get(u.id) ?? 0;
                const oran = u._count.kisiler
                  ? Math.round((katilan / u._count.kisiler) * 100)
                  : 0;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{u.adSoyad}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-slate-600">{u.rol}</td>
                    <td className="px-4 py-3 text-slate-600">{u._count.kisiler}</td>
                    <td className="px-4 py-3 text-slate-600">{katilan}</td>
                    <td className="px-4 py-3 text-slate-600">%{oran}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400">
          Yönetim paneli üye performans özetini gösterir; üyelerin kişisel notları
          burada görüntülenmez.
        </p>
      </main>
    </div>
  );
}

function Kart({ baslik, deger }: { baslik: string; deger: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-500">{baslik}</div>
      <div className="mt-1 text-3xl font-bold text-slate-900">{deger}</div>
    </div>
  );
}
