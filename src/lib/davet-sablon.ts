// Davet sayfası modül tipleri, etiketleri ve hazır şablon içerikleri — tek kaynak.
// Builder, server action ve public render bu dosyayı paylaşır.

export type ModulIcerik = Record<string, unknown>;

export const MODUL_TIPLERI = [
  { tip: "KARSILAMA", etiket: "Karşılama" },
  { tip: "NEDENLER", etiket: "Neden Tercih Ediliyor" },
  { tip: "LISTE", etiket: "Kimler İçin (Liste)" },
  { tip: "ADIMLAR", etiket: "Nasıl Başlanıyor (Adımlar)" },
  { tip: "VIDEO", etiket: "Video" },
  { tip: "HIKAYELER", etiket: "Başarı Hikayeleri" },
  { tip: "SSS", etiket: "Sık Sorulan Sorular" },
  { tip: "SECIM", etiket: "İlgi Seçimi" },
  { tip: "BUTON", etiket: "Son Çağrı (Butonlar)" },
  { tip: "METIN", etiket: "Metin" },
  { tip: "GORSEL", etiket: "Görsel" },
  { tip: "RANDEVU", etiket: "Randevu" },
] as const;

export type ModulTip = (typeof MODUL_TIPLERI)[number]["tip"];

export const MODUL_ETIKET: Record<string, string> = Object.fromEntries(
  MODUL_TIPLERI.map((t) => [t.tip, t.etiket])
);

// Yeni eklenen tek modül için varsayılan içerik.
export const MODUL_VARSAYILAN: Record<string, ModulIcerik> = {
  KARSILAMA: {
    baslik: "Merhaba {ad} 👋",
    metin: "Sana özel hazırladığım bu kısa tanıtım sayfasına hoş geldin.\n\nBurada projenin ne olduğunu, kimlere uygun olduğunu ve nasıl gelir elde edildiğini 2 dakikada inceleyebilirsin.",
  },
  METIN: { baslik: "Başlık", metin: "Açıklama metni…" },
  GORSEL: { url: "" },
  VIDEO: { url: "", baslik: "Kısa Video", metin: "1-3 dakikalık tanıtım videosu" },
  BUTON: { butonlar: ["ilgileniyorum", "more_info", "appointment", "whatsapp"] },
  RANDEVU: {},
  NEDENLER: {
    baslik: "İnsanlar Neden Bu Sistemi Tercih Ediyor?",
    ogeler: [
      { baslik: "Ek gelir oluşturmak", metin: "Gelir kaynaklarını çeşitlendirmek isteyenler için." },
      { baslik: "Kendi işini kurmak", metin: "Düşük sermaye ile başlanabilir." },
      { baslik: "Esnek çalışma", metin: "Zamanını kendin yönetebilirsin." },
      { baslik: "Eğitim ve ekip desteği", metin: "Tek başına bırakılmazsın." },
    ],
  },
  LISTE: {
    baslik: "Bu Sistem Kimler İçin Uygun?",
    ogeler: ["Ek gelir arayanlar", "Girişimci ruhlu kişiler", "Sosyal çevresi olanlar", "Öğrenmeye açık olanlar"],
  },
  ADIMLAR: {
    baslik: "Nasıl Başlanıyor?",
    ogeler: ["Tanışma görüşmesi", "Bilgilendirme", "Başlangıç", "Ekip desteği", "Birlikte büyüme"],
  },
  HIKAYELER: {
    baslik: "Gerçek Başarı Hikayeleri",
    ogeler: [
      { ad: "Ayşe K.", foto: "", metin: "6 ayda ek gelirini ana gelirine çevirdi." },
      { ad: "Mehmet T.", foto: "", metin: "Kendi ekibini kurarak büyümeye devam ediyor." },
      { ad: "Zeynep A.", foto: "", metin: "Esnek çalışma ile aile hayatını dengeledi." },
    ],
  },
  SSS: {
    baslik: "Sık Sorulan Sorular",
    ogeler: [
      { soru: "Network marketing yapmak zor mu?", cevap: "Hayır. Eğitim ve destek sistemiyle adım adım ilerlenir." },
      { soru: "Çok zaman ayırmak gerekir mi?", cevap: "Hayır. Kendi programına göre ilerleyebilirsin." },
      { soru: "Daha önce tecrübem yok.", cevap: "Tecrübe şart değildir." },
    ],
  },
  SECIM: {
    baslik: "Sence bu fırsat senin için hangisi?",
    secenekler: [
      { etiket: "Ek gelir için", hedef: "randevu" },
      { etiket: "Tam zamanlı gelir için", hedef: "randevu" },
      { etiket: "Ürünler için", hedef: "urun" },
      { etiket: "Sadece bilgi almak için", hedef: "whatsapp" },
    ],
  },
  WHATSAPP: {},
  YASAL: {},
};

// "Şablon Uygula" — sırayla eklenecek 8 modüllü hazır akış.
export const SABLON_AKIS: { tip: ModulTip; icerik: ModulIcerik }[] = [
  { tip: "KARSILAMA", icerik: MODUL_VARSAYILAN.KARSILAMA },
  { tip: "NEDENLER", icerik: MODUL_VARSAYILAN.NEDENLER },
  { tip: "LISTE", icerik: MODUL_VARSAYILAN.LISTE },
  { tip: "ADIMLAR", icerik: MODUL_VARSAYILAN.ADIMLAR },
  { tip: "VIDEO", icerik: MODUL_VARSAYILAN.VIDEO },
  { tip: "HIKAYELER", icerik: MODUL_VARSAYILAN.HIKAYELER },
  { tip: "SSS", icerik: MODUL_VARSAYILAN.SSS },
  { tip: "SECIM", icerik: MODUL_VARSAYILAN.SECIM },
  { tip: "BUTON", icerik: MODUL_VARSAYILAN.BUTON },
];

export const SECIM_HEDEFLERI = [
  { hedef: "whatsapp", etiket: "WhatsApp" },
  { hedef: "urun", etiket: "Ürün sunumu" },
  { hedef: "randevu", etiket: "Randevu / Takvim" },
  { hedef: "bilgi", etiket: "Bilgi (WhatsApp)" },
] as const;
