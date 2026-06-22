"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import {
  KAYNAK_TIPLERI,
  KAYNAK_ETIKET,
  SUNUM_DURUMLARI,
  DURUM_ETIKET,
  ADAY_TIPLERI,
  ADAY_TIPI_ETIKET,
  SICAKLIKLAR,
  SICAKLIK_ETIKET,
} from "@/lib/sabitler";

type Kisi = {
  adSoyad: string;
  telefon: string | null;
  email: string | null;
  sehir: string | null;
  adayTipi: string;
  sicaklik: string;
  kaynakTip: string;
  kaynakNot: string | null;
  durum: string;
  oncelik: number;
  notlar: string | null;
  sonrakiTakip: Date | null;
};

// Hızlı giriş: sadece isim + telefon. "Detay" ile geri kalanı aç.
export default function KisiForm({
  kisi,
  action,
  durumGoster = false,
  gonderEtiket = "Kaydet",
}: {
  kisi?: Partial<Kisi>;
  action: (formData: FormData) => void;
  durumGoster?: boolean;
  gonderEtiket?: string;
}) {
  // Düzenlemede (mevcut kişi) detay açık; yeni kayıtta kapalı.
  const [acik, setAcik] = useState<boolean>(!!kisi);
  const takipDeger = kisi?.sonrakiTakip ? new Date(kisi.sonrakiTakip).toISOString().slice(0, 10) : "";

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Alan label="Ad Soyad *" name="adSoyad" deger={kisi?.adSoyad} required />
        <Alan label="GSM Telefon *" name="telefon" deger={kisi?.telefon ?? ""} type="tel" required />
      </div>

      <button
        type="button"
        onClick={() => setAcik((v) => !v)}
        className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#0E8A4D] hover:text-emerald-800"
      >
        <ChevronDown size={16} className={`transition ${acik ? "rotate-180" : ""}`} />
        {acik ? "Detayı gizle" : "Detay ekle (opsiyonel)"}
      </button>

      <div className={acik ? "space-y-4" : "hidden"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Alan label="E-posta" name="email" deger={kisi?.email ?? ""} type="email" />
          <Secim label="Kaynak / Bağ" name="kaynakTip" deger={kisi?.kaynakTip ?? "DIGER"} secenekler={KAYNAK_TIPLERI} etiketler={KAYNAK_ETIKET} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Alan label="Şehir" name="sehir" deger={kisi?.sehir ?? ""} />
          <Secim label="Aday Tipi" name="adayTipi" deger={kisi?.adayTipi ?? "GENEL"} secenekler={ADAY_TIPLERI} etiketler={ADAY_TIPI_ETIKET} />
          <Secim label="Sıcaklık" name="sicaklik" deger={kisi?.sicaklik ?? "ILIK"} secenekler={SICAKLIKLAR} etiketler={SICAKLIK_ETIKET} />
        </div>

        <Alan label="Bağ açıklaması (ör: üniversiteden arkadaşım)" name="kaynakNot" deger={kisi?.kaynakNot ?? ""} />

        <div className="grid gap-4 sm:grid-cols-2">
          {durumGoster && (
            <Secim label="Durum" name="durum" deger={kisi?.durum ?? "YENI"} secenekler={SUNUM_DURUMLARI} etiketler={DURUM_ETIKET} />
          )}
          <div>
            <span className="mb-1.5 block text-[13px] font-bold text-[#3B4759]">Öncelik (0-5)</span>
            <input name="oncelik" type="number" min={0} max={5} defaultValue={kisi?.oncelik ?? 0} className="w-full rounded-xl border border-[#E4E9F0] bg-[#F7F9FB] px-3.5 py-3 text-[#0F1B2D] outline-none focus:border-emerald-500" />
          </div>
          <Alan label="Sonraki Takip Tarihi" name="sonrakiTakip" deger={takipDeger} type="date" />
        </div>

        <div>
          <span className="mb-1.5 block text-[13px] font-bold text-[#3B4759]">Notlar</span>
          <textarea name="notlar" defaultValue={kisi?.notlar ?? ""} rows={3} className="w-full rounded-xl border border-[#E4E9F0] bg-[#F7F9FB] px-3.5 py-3 text-[#0F1B2D] outline-none focus:border-emerald-500" />
        </div>
      </div>

      <button type="submit" className="flex items-center justify-center gap-2 rounded-[13px] bg-gradient-to-br from-[#1FB46A] to-[#0E8A4D] px-6 py-3.5 text-[14.5px] font-bold text-white shadow-[0_12px_24px_-10px_rgba(14,138,77,.7)] transition active:scale-[.98]">
        <Plus size={18} /> {gonderEtiket}
      </button>
    </form>
  );
}

function Secim({
  label, name, deger, secenekler, etiketler,
}: {
  label: string;
  name: string;
  deger: string;
  secenekler: readonly string[];
  etiketler: Record<string, string>;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-bold text-[#3B4759]">{label}</span>
      <select name={name} defaultValue={deger} className="w-full rounded-xl border border-[#E4E9F0] bg-[#F7F9FB] px-3.5 py-3 text-[#0F1B2D] outline-none focus:border-emerald-500">
        {secenekler.map((k) => (
          <option key={k} value={k}>{etiketler[k]}</option>
        ))}
      </select>
    </div>
  );
}

function Alan({
  label, name, deger, type = "text", required,
}: {
  label: string;
  name: string;
  deger?: string | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-[#3B4759]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={deger ?? ""}
        className="w-full rounded-xl border border-[#E4E9F0] bg-[#F7F9FB] px-3.5 py-3 text-[#0F1B2D] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}
