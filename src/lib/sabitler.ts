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

// --- Aday tipi ---
export const ADAY_TIPLERI = [
  "URUN_MUSTERISI",
  "IS_FIRSATI",
  "EKIP_ADAYI",
  "ESKI_MUSTERI",
  "TEKRAR_ARANACAK",
  "GENEL",
] as const;

export type AdayTipi = (typeof ADAY_TIPLERI)[number];

export const ADAY_TIPI_ETIKET: Record<AdayTipi, string> = {
  URUN_MUSTERISI: "Ürün Müşterisi",
  IS_FIRSATI: "İş Fırsatı Adayı",
  EKIP_ADAYI: "Ekip Adayı",
  ESKI_MUSTERI: "Eski Müşteri",
  TEKRAR_ARANACAK: "Tekrar Aranacak",
  GENEL: "Genel Potansiyel",
};

// --- Sıcaklık ---
export const SICAKLIKLAR = ["SOGUK", "ILIK", "SICAK", "COK_SICAK"] as const;

export type Sicaklik = (typeof SICAKLIKLAR)[number];

export const SICAKLIK_ETIKET: Record<Sicaklik, string> = {
  SOGUK: "Soğuk",
  ILIK: "Ilık",
  SICAK: "Sıcak",
  COK_SICAK: "Çok Sıcak",
};

export const SICAKLIK_RENK: Record<Sicaklik, string> = {
  SOGUK: "bg-sky-100 text-sky-700 border-sky-200",
  ILIK: "bg-amber-100 text-amber-700 border-amber-200",
  SICAK: "bg-orange-100 text-orange-700 border-orange-200",
  COK_SICAK: "bg-rose-100 text-rose-700 border-rose-200",
};

// --- Mesaj kalıbı kategorileri ---
export const KALIP_KATEGORILERI = [
  "ilk_temas",
  "sunum",
  "takip",
  "toplanti",
  "itiraz",
  "kapanis",
  "musteri",
  "hatirlatma",
] as const;

export type KalipKategori = (typeof KALIP_KATEGORILERI)[number];

export const KALIP_KATEGORI_ETIKET: Record<KalipKategori, string> = {
  ilk_temas: "İlk Temas",
  sunum: "Sunum Gönderme",
  takip: "Takip",
  toplanti: "Toplantı Daveti",
  itiraz: "İtiraz Cevabı",
  kapanis: "Kapanış",
  musteri: "Müşteri Takip",
  hatirlatma: "Randevu Hatırlatma",
};

// Skordan sıcaklık etiketini türet (07-skorlama dokümanı)
export function skorSicaklik(skor: number): Sicaklik {
  if (skor >= 120) return "COK_SICAK";
  if (skor >= 61) return "SICAK";
  if (skor >= 21) return "ILIK";
  return "SOGUK";
}
