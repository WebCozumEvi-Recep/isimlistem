import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { firmaOlustur, firmaDurumDegistir, firmaPaketDegistir } from "@/app/admin/actions";

export default async function AdminFirmalar() {
  const firmalar = await prisma.firma.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { uyeler: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Firmalar</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Firma</th>
                <th className="px-4 py-3 font-medium">Kod</th>
                <th className="px-4 py-3 font-medium">Üye</th>
                <th className="px-4 py-3 font-medium">Paket</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 text-right font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {firmalar.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{f.ad}<div className="text-xs text-slate-400">/{f.slug}</div></td>
                  <td className="px-4 py-3"><code className="font-mono text-emerald-700">{f.kayitKodu}</code></td>
                  <td className="px-4 py-3">{f._count.uyeler}</td>
                  <td className="px-4 py-3">
                    <form action={firmaPaketDegistir.bind(null, f.id, f.paket === "BUSINESS" ? "BUSINESS_PLUS" : f.paket === "BUSINESS_PLUS" ? "FREE" : "BUSINESS")}>
                      <button className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-200">{f.paket}</button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={firmaDurumDegistir.bind(null, f.id, f.durum === "AKTIF" ? "PASIF" : "AKTIF")}>
                      <button className={`rounded-full px-2 py-0.5 text-xs ${f.durum === "AKTIF" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {f.durum === "AKTIF" ? "Aktif" : f.durum === "PASIF" ? "Pasif" : "Askıda"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/firmalar/${f.id}`} title="Düzenle" className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600">
                      <Pencil size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
              {firmalar.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Henüz firma yok.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Yeni Firma</h2>
          <form action={firmaOlustur} className="space-y-3">
            <input name="ad" placeholder="Firma adı" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input name="yoneticiEmail" type="email" placeholder="Firma yöneticisi e-postası (kayıtlı kullanıcı)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <p className="text-xs text-slate-400">Yönetici e-postası kayıtlı bir kullanıcıya aitse o kişi firma admini yapılır. Boş bırakılabilir.</p>
            <button className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white hover:bg-emerald-600">Firma Oluştur</button>
          </form>
        </div>
      </div>
    </div>
  );
}
