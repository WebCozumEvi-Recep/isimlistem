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
    <div className="space-y-4">
      <h1 className="text-[21px] font-extrabold text-[#0F1B2D]">Profilim</h1>

      <form action={profilGuncelle} className="max-w-2xl space-y-4 rounded-[22px] border border-[#ECEFF3] bg-white p-5 shadow-[0_12px_30px_-22px_rgba(15,27,45,.5)]">
        <div>
          <p className="mb-3 text-[13px] font-bold text-[#3B4759]">Profil Fotoğrafı</p>
          <ProfilFotoSecici baslangic={user.profilFoto} ad={user.adSoyad} />
          <p className="mt-2 text-[11.5px] font-medium leading-relaxed text-[#9AA7B8]">
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
          <button className="rounded-[13px] bg-gradient-to-br from-[#1FB46A] to-[#0E8A4D] px-7 py-3 text-[14px] font-bold text-white shadow-[0_10px_22px_-10px_rgba(14,138,77,.7)] transition active:scale-[.97]">
            Kaydet
          </button>
          <span className="text-[12px] font-medium text-[#9AA7B8]">{user.email}</span>
        </div>
      </form>
    </div>
  );
}

function Alan({ label, name, deger, cokSatir }: { label: string; name: string; deger: string; cokSatir?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-[#3B4759]">{label}</span>
      {cokSatir ? (
        <textarea name={name} defaultValue={deger} rows={3} className="w-full rounded-xl border border-[#E4E9F0] bg-[#F7F9FB] px-3.5 py-3 text-sm font-medium text-[#0F1B2D] outline-none focus:border-emerald-500" />
      ) : (
        <input name={name} defaultValue={deger} className="w-full rounded-xl border border-[#E4E9F0] bg-[#F7F9FB] px-3.5 py-3 text-sm font-semibold text-[#0F1B2D] outline-none focus:border-emerald-500" />
      )}
    </label>
  );
}
