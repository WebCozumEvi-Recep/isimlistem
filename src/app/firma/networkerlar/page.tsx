import { requireFirmaYonetici } from "@/lib/firma";
import { prisma } from "@/lib/prisma";
import { networkerDurumDegistir } from "@/app/firma/actions";

export default async function FirmaNetworkerlar() {
  const { firma, uye } = await requireFirmaYonetici();
  const uyeler = await prisma.firmaUye.findMany({
    where: { firmaId: firma.id },
    orderBy: { createdAt: "desc" },
    include: { kullanici: { select: { id: true, adSoyad: true, email: true, telefon: true } } },
  });

  // Her networker için aday & davet sayıları (anonim — PII yok)
  const idler = uyeler.map((u) => u.kullaniciId);
  const adayGrup = await prisma.kisi.groupBy({ by: ["kullaniciId"], where: { kullaniciId: { in: idler } }, _count: true });
  const linkGrup = await prisma.davetLinki.groupBy({ by: ["kullaniciId"], where: { kullaniciId: { in: idler } }, _count: true });
  const adaySay = new Map(adayGrup.map((g) => [g.kullaniciId, g._count]));
  const linkSay = new Map(linkGrup.map((g) => [g.kullaniciId, g._count]));

  const adminMi = uye.rol === "FIRMA_ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Networker'lar</h1>
        <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
          Kayıt Kodu: <code className="font-mono text-emerald-700">{firma.kayitKodu}</code>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Ad Soyad</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Aday</th>
              <th className="px-4 py-3 font-medium">Davet</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              {adminMi && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {uyeler.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{u.kullanici.adSoyad}</td>
                <td className="px-4 py-3 text-slate-500">{u.rol === "FIRMA_ADMIN" ? "Yönetici" : u.rol === "ICERIK_YONETICI" ? "İçerik" : u.rol === "RAPOR_IZLEYICI" ? "Rapor" : "Networker"}</td>
                <td className="px-4 py-3">{adaySay.get(u.kullaniciId) ?? 0}</td>
                <td className="px-4 py-3">{linkSay.get(u.kullaniciId) ?? 0}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${u.durum === "AKTIF" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {u.durum === "AKTIF" ? "Aktif" : "Pasif"}
                  </span>
                </td>
                {adminMi && (
                  <td className="px-4 py-3 text-right">
                    {u.rol !== "FIRMA_ADMIN" && (
                      <form action={networkerDurumDegistir.bind(null, u.id, u.durum === "AKTIF" ? "PASIF" : "AKTIF")}>
                        <button className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                          {u.durum === "AKTIF" ? "Pasifleştir" : "Aktifleştir"}
                        </button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {uyeler.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Henüz networker yok. Kayıt kodunu paylaşın.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">
        Gizlilik gereği aday isim/telefon gibi kişisel bilgiler firmaya gösterilmez; yalnızca sayısal performans görünür.
      </p>
    </div>
  );
}
