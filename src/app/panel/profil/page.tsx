import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProfilFotoSecici from "@/components/ProfilFotoSecici";
import { profilGuncelle } from "./actions";

export default async function ProfilSayfasi() {
  const oturum = await requireUser();
  const user = await prisma.kullanici.findUnique({ where: { id: oturum.id } });
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Profilim</h1>

      <form action={profilGuncelle} className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-600">Profil Fotoğrafı</p>
          <ProfilFotoSecici baslangic={user.profilFoto} ad={user.adSoyad} />
          <p className="mt-2 text-xs text-slate-400">
            Bu fotoğraf kenar çubuğunda ve adaylara gönderdiğin davet sayfasının “Bu daveti gönderen” bölümünde görünür.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Alan label="Ad Soyad *" name="adSoyad" deger={user.adSoyad} />
          <Alan label="Telefon" name="telefon" deger={user.telefon ?? ""} />
          <Alan label="Şehir" name="sehir" deger={user.sehir ?? ""} />
          <div className="sm:col-span-2">
            <Alan label="Hakkımda (kısa tanıtım)" name="bio" deger={user.bio ?? ""} cokSatir />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            Kaydet
          </button>
          <span className="text-xs text-slate-400">{user.email}</span>
        </div>
      </form>
    </div>
  );
}

function Alan({ label, name, deger, cokSatir }: { label: string; name: string; deger: string; cokSatir?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      {cokSatir ? (
        <textarea name={name} defaultValue={deger} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      ) : (
        <input name={name} defaultValue={deger} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      )}
    </label>
  );
}
