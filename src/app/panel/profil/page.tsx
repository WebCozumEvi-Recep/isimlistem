import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProfilFotoSecici from "@/components/ProfilFotoSecici";
import { profilGuncelle, pushAyarGuncelle } from "./actions";
import { Bell } from "lucide-react";

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

      {/* Bildirim Ayarları */}
      <form action={pushAyarGuncelle} className="max-w-2xl space-y-4 rounded-[22px] border border-[#ECEFF3] bg-white p-5 shadow-[0_12px_30px_-22px_rgba(15,27,45,.5)]">
        <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-[#0F1B2D]">
          <Bell size={18} className="text-[#16B364]" /> Telefon Bildirimleri
        </h2>
        <p className="-mt-2 text-[12px] font-medium leading-relaxed text-[#9AA7B8]">
          Aday hareketleri telefonuna bildirim olarak düşer. Rahatsız olmamak için yalnızca önemli olayları ve sessiz saatleri seçebilirsin.
        </p>

        <label className="flex items-center gap-3 rounded-xl bg-[#F7F9FB] px-4 py-3.5">
          <input type="checkbox" name="pushAcik" defaultChecked={user.pushAcik} className="h-5 w-5 accent-[#16B364]" />
          <span className="text-[14px] font-bold text-[#0F1B2D]">Telefon bildirimleri açık</span>
        </label>

        <div>
          <span className="mb-1 block text-[13px] font-bold text-[#3B4759]">Hangi durumlarda telefona bildirim gelsin?</span>
          <p className="mb-2.5 text-[11.5px] font-medium text-[#9AA7B8]">İşaretlemediğin durumlar yalnızca uygulama içinde görünür, telefonu rahatsız etmez.</p>
          <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#16B364]">Önemli</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {BILDIRIM_TIPLERI.filter((t) => t.onemli).map((t) => (
              <TipKutu key={t.deger} tip={t} secili={user.pushTipler.includes(t.deger)} />
            ))}
          </div>
          <p className="mb-1.5 mt-3 text-[11px] font-extrabold uppercase tracking-wide text-[#8493A8]">Diğer (düşük öncelikli)</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {BILDIRIM_TIPLERI.filter((t) => !t.onemli).map((t) => (
              <TipKutu key={t.deger} tip={t} secili={user.pushTipler.includes(t.deger)} />
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-[#F7F9FB] p-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" name="sessizKullan" defaultChecked={user.pushSessizBas != null} className="h-5 w-5 accent-[#16B364]" />
            <span className="text-[14px] font-bold text-[#0F1B2D]">Sessiz saatler</span>
          </label>
          <div className="mt-3 flex items-center gap-2.5">
            <SaatSecici name="sessizBas" deger={user.pushSessizBas ?? 23} />
            <span className="text-[13px] font-bold text-[#8493A8]">—</span>
            <SaatSecici name="sessizBit" deger={user.pushSessizBit ?? 8} />
            <span className="text-[12px] font-medium text-[#9AA7B8]">arası bildirim gelmez</span>
          </div>
        </div>

        <button className="rounded-[13px] bg-[#0B1B3C] px-7 py-3 text-[14px] font-bold text-white transition active:scale-[.97] hover:bg-[#16294e]">
          Bildirim Ayarlarını Kaydet
        </button>
      </form>
    </div>
  );
}

const BILDIRIM_TIPLERI: { deger: string; etiket: string; onemli: boolean }[] = [
  { deger: "RANDEVU", etiket: "Randevu talebi", onemli: true },
  { deger: "ILGILENIYOR", etiket: "İlgileniyor / detay istedi", onemli: true },
  { deger: "WHATSAPP_DONUS", etiket: "WhatsApp dönüşü", onemli: true },
  { deger: "YENI_ADAY", etiket: "Yeni aday (kendini ekledi)", onemli: true },
  { deger: "TAKIP_ZAMANI", etiket: "Takip zamanı geldi", onemli: true },
  { deger: "LINK_ACILDI", etiket: "Davet linki açıldı", onemli: false },
  { deger: "VIDEO_IZLEDI", etiket: "Tanıtım videosu izlendi", onemli: false },
  { deger: "ACILMAYAN_DAVET", etiket: "Davet açılmadı (hatırlatma)", onemli: false },
];

function TipKutu({ tip, secili }: { tip: { deger: string; etiket: string }; secili: boolean }) {
  return (
    <label className="flex items-center gap-2.5 rounded-xl bg-[#F7F9FB] px-3.5 py-2.5">
      <input type="checkbox" name="tip" value={tip.deger} defaultChecked={secili} className="h-[18px] w-[18px] accent-[#16B364]" />
      <span className="text-[13px] font-semibold text-[#0F1B2D]">{tip.etiket}</span>
    </label>
  );
}

function SaatSecici({ name, deger }: { name: string; deger: number }) {
  return (
    <select name={name} defaultValue={deger} className="rounded-xl border border-[#E4E9F0] bg-white px-3.5 py-2.5 text-sm font-bold text-[#0F1B2D] outline-none focus:border-emerald-500">
      {Array.from({ length: 24 }, (_, i) => (
        <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
      ))}
    </select>
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
