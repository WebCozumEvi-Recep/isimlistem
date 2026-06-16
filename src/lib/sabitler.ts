// Enum etiketleri ve huni sırası — UI genelinde tek kaynak.

export const SUNUM_DURUMLARI = [
  "YENI",
  "ARANDI",
  "RANDEVU",
  "SUNUM_YAPILDI",
  "TAKIP",
  "KATILDI",
  "KAYIP",
] as const;

export type SunumDurum = (typeof SUNUM_DURUMLARI)[number];

export const DURUM_ETIKET: Record<SunumDurum, string> = {
  YENI: "Yeni",
  ARANDI: "Arandı",
  RANDEVU: "Randevu",
  SUNUM_YAPILDI: "Sunum Yapıldı",
  TAKIP: "Takip",
  KATILDI: "Katıldı",
  KAYIP: "Kayıp",
};

// Tailwind sınıfları (rozet renkleri)
export const DURUM_RENK: Record<SunumDurum, string> = {
  YENI: "bg-slate-100 text-slate-700 border-slate-200",
  ARANDI: "bg-blue-100 text-blue-700 border-blue-200",
  RANDEVU: "bg-indigo-100 text-indigo-700 border-indigo-200",
  SUNUM_YAPILDI: "bg-purple-100 text-purple-700 border-purple-200",
  TAKIP: "bg-amber-100 text-amber-700 border-amber-200",
  KATILDI: "bg-emerald-100 text-emerald-700 border-emerald-200",
  KAYIP: "bg-rose-100 text-rose-700 border-rose-200",
};

export const KAYNAK_TIPLERI = [
  "AILE",
  "AKRABA",
  "ARKADAS",
  "IS",
  "KOMSU",
  "OKUL",
  "SOSYAL_MEDYA",
  "REFERANS",
  "DIGER",
] as const;

export type KaynakTip = (typeof KAYNAK_TIPLERI)[number];

export const KAYNAK_ETIKET: Record<KaynakTip, string> = {
  AILE: "Aile",
  AKRABA: "Akraba",
  ARKADAS: "Arkadaş",
  IS: "İş",
  KOMSU: "Komşu",
  OKUL: "Okul",
  SOSYAL_MEDYA: "Sosyal Medya",
  REFERANS: "Referans",
  DIGER: "Diğer",
};
