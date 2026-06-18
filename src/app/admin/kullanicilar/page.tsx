import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminKullanicilar() {
  const kullanicilar = await prisma.kullanici.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { kisiler: true } }, firmaUyelikler: { include: { firma: { select: { ad: true } } } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Kullanıcılar</h1>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Ad Soyad</th>
              <th className="px-4 py-3 font-medium">E-posta</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Firma</th>
              <th className="px-4 py-3 font-medium">Aday</th>
              <th className="px-4 py-3 font-medium">Kayıt</th>
              <th className="px-4 py-3 text-right font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {kullanicilar.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{u.adSoyad}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3 text-slate-600">{u.rol}</td>
                <td className="px-4 py-3 text-slate-600">{u.firmaUyelikler[0]?.firma.ad ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{u._count.kisiler}</td>
                <td className="px-4 py-3 text-slate-400">{u.createdAt.toLocaleDateString("tr-TR")}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/kullanicilar/${u.id}`} title="Düzenle" className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600">
                    <Pencil size={15} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">Kullanıcıların kişisel aday notları ve PII verileri burada gösterilmez.</p>
    </div>
  );
}
