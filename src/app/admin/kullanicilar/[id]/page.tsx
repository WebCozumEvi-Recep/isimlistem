import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kullaniciGuncelle } from "@/app/admin/actions";
import { ArrowLeft } from "lucide-react";

const FIRMA_ROL_ETIKET: Record<string, string> = {
  FIRMA_ADMIN: "Firma Admin",
  ICERIK_YONETICI: "İçerik Yöneticisi",
  RAPOR_IZLEYICI: "Rapor İzleyici",
  NETWORKER: "Networker",
};

export default async function KullaniciDuzenle({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [kullanici, firmalar] = await Promise.all([
    prisma.kullanici.findUnique({ where: { id }, include: { firmaUyelikler: true } }),
    prisma.firma.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } }),
  ]);
  if (!kullanici) notFound();

  const uyelik = kullanici.firmaUyelikler[0];
  const action = kullaniciGuncelle.bind(null, kullanici.id);

  return (
    <div className="space-y-6">
      <Link href="/admin/kullanicilar" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} /> Kullanıcılar
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{kullanici.adSoyad}</h1>
        <p className="text-sm text-slate-500">{kullanici.email}</p>
      </div>

      <form action={action} className="max-w-xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-600">Sistem Rolü</span>
            <select name="rol" defaultValue={kullanici.rol} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="UYE">Üye</option>
              <option value="ADMIN">Yönetici (Admin)</option>
            </select>
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-600">Firma</span>
            <select name="firmaId" defaultValue={uyelik?.firmaId ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">— Firmasız —</option>
              {firmalar.map((f) => <option key={f.id} value={f.id}>{f.ad}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-600">Firma İçi Rol</span>
            <select name="firmaRol" defaultValue={uyelik?.rol ?? "NETWORKER"} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {Object.entries(FIRMA_ROL_ETIKET).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <p className="mt-1 text-xs text-slate-400">Firma seçilirse geçerlidir. Firmasız bırakılırsa üyelik kaldırılır.</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <span className="mb-1 block text-sm font-medium text-slate-600">Parola Sıfırla</span>
          <input name="yeniParola" type="text" autoComplete="off" placeholder="Yeni parola (en az 6 karakter) — boş bırakılırsa değişmez" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <p className="mt-1 text-xs text-slate-400">Yeni parolayı kullanıcıya güvenli bir kanaldan ilet. Boş bırakırsan mevcut parola korunur.</p>
        </div>

        <div className="flex gap-2">
          <button className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Kaydet</button>
          <Link href="/admin/kullanicilar" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Vazgeç</Link>
        </div>
      </form>
    </div>
  );
}
