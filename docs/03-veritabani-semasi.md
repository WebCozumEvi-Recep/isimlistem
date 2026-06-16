# 03 — Veritabanı Şeması

Mevcut Türkçe isimlendirme (`Kullanici`, `Kisi`, `Aktivite`) korunur ve genişletilir.
Hedef: PostgreSQL + Prisma. Aşağıdaki şema, planın İngilizce tablo taslağının Türkçe karşılığıdır.

## Mevcut → Hedef Migrasyon Özeti

| Mevcut | Değişiklik |
|--------|-----------|
| `Rol { UYE, ADMIN }` | `SUPER_ADMIN` eklenir → `{ UYE, ADMIN, SUPER_ADMIN }` |
| `Kullanici` | profil/firma/izin alanları eklenir |
| `Kisi` | `firmaId`, `aday tipi`, `sicaklik`, `skor`, `baglam` eklenir; `SunumDurum` genişler |
| `Aktivite` | korunur (durum geçmişi); event'ler ayrı `DavetOlayi` tablosunda |
| — | `Firma, FirmaUye, MesajKalibi, DavetSayfasi, DavetModulu, DavetLinki, DavetOlayi, HazirMesajLog, RandevuTalebi, Kampanya, FirmaMedya, Takip, Bildirim, Reklam` eklenir |

Migrasyon güvenli ve katmanlıdır: yeni tablolar/alanlar **nullable** veya **default**'lu
eklenir; mevcut veriyi bozmaz. Faz sırası için bkz. [09-sprint-task-breakdown.md](09-sprint-task-breakdown.md).

## Enum'lar

```prisma
enum Rol {
  UYE
  ADMIN          // mevcut: firma/genel admin anlamı — geriye dönük korunur
  SUPER_ADMIN
}

enum FirmaUyeRol {
  FIRMA_ADMIN
  ICERIK_YONETICI
  RAPOR_IZLEYICI
  NETWORKER
}

enum FirmaDurum { AKTIF, PASIF, ASKIDA }
enum Paket { FREE, BUSINESS, BUSINESS_PLUS }

enum AdayTipi {
  URUN_MUSTERISI
  IS_FIRSATI
  EKIP_ADAYI
  ESKI_MUSTERI
  TEKRAR_ARANACAK
  GENEL
}

enum Sicaklik { SOGUK, ILIK, SICAK, COK_SICAK }

enum KaynakTip {            // mevcut enum + plan kaynakları
  WHATSAPP INSTAGRAM FACEBOOK TAVSIYE TOPLANTI REKLAM
  ESKI_MUSTERI AILE ARKADAS AKRABA KOMSU OKUL SOSYAL_MEDYA REFERANS IS DIGER
}

// Mevcut SunumDurum genişletilir (plan §6 aday durumları):
enum SunumDurum {
  YENI
  DAVET_HAZIRLANACAK
  DAVET_HAZIRLANDI
  DAVET_GONDERILDI
  DAVET_ACILDI
  SUNUM_IZLIYOR
  SUNUM_IZLEDI
  DETAYLI_INCELEDI
  ILGILENIYOR
  BILGI_TALEP_ETTI
  RANDEVU_TALEP_ETTI
  RANDEVU_PLANLANDI
  GORUSME_YAPILDI
  KATILDI            // müşteri/üye oldu
  OLUMSUZ
  SONRA_TAKIP
}

enum SahiplikTipi { GLOBAL, KISISEL, FIRMA }
enum SayfaDurum { TASLAK, YAYINDA, PASIF }
enum LinkDurum { OLUSTURULDU, GONDERILDI, ACILDI, ETKILESTI, RANDEVU_ISTEDI, ILGISIZ, SURESI_DOLDU }
enum ModulTip { KARSILAMA, FIRMA, NETWORKER, METIN, GORSEL, VIDEO, BUTON, RANDEVU, SSS, PDF, FORM, WHATSAPP, REKLAM, YASAL }
enum HazirMesajDurum { HAZIRLANDI, WHATSAPP_ACILDI, GONDERILDI_ONAY, IPTAL }
enum RandevuTip { TELEFON, WHATSAPP, ZOOM, YUZ_YUZE, OFIS, DIGER }
enum RandevuDurum { TALEP, ONAYLANDI, REDDEDILDI, ERTELENDI, TAMAMLANDI, IPTAL }
enum BildirimTip { LINK_ACILDI, VIDEO_IZLEDI, ILGILENIYOR, RANDEVU, WHATSAPP_DONUS, TAKIP_ZAMANI, ACILMAYAN_DAVET }
enum ReklamYer { DAVET_ALT_BANNER, PANEL_BANNER, EGITIM, DASHBOARD, RANDEVU_SONRASI }
```

## Çekirdek Modeller

```prisma
model Kullanici {
  id            String   @id @default(cuid())
  adSoyad       String
  email         String   @unique
  telefon       String?
  parolaHash    String
  rol           Rol      @default(UYE)
  sehir         String?
  sektor        String?
  firmaAdiMetni String?              // serbest metin (kayıt sırasında)
  kullanimAmaci String?
  profilFoto    String?
  bio           String?
  varsayilanFirmaId String?
  pazarlamaIzni Boolean  @default(false)
  epostaIzni    Boolean  @default(false)
  smsIzni       Boolean  @default(false)
  pushIzni      Boolean  @default(false)
  kisiler       Kisi[]
  firmaUyelikler FirmaUye[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Firma {
  id            String      @id @default(cuid())
  ad            String
  slug          String      @unique
  logoUrl       String?
  anaRenk       String?
  ikincilRenk   String?
  website       String?
  telefon       String?
  email         String?
  whatsapp      String?
  aciklama      String?
  footerMetni   String?
  paket         Paket       @default(BUSINESS)
  durum         FirmaDurum  @default(AKTIF)
  networkerLimiti Int?
  sayfaLimiti   Int?
  uyeler        FirmaUye[]
  kisiler       Kisi[]
  kalipla       MesajKalibi[]
  sayfalar      DavetSayfasi[]
  kampanyalar   Kampanya[]
  medya         FirmaMedya[]
  kayitKodu     String?     @unique
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model FirmaUye {
  id          String      @id @default(cuid())
  firma       Firma       @relation(fields: [firmaId], references: [id], onDelete: Cascade)
  firmaId     String
  kullanici   Kullanici   @relation(fields: [kullaniciId], references: [id], onDelete: Cascade)
  kullaniciId String
  rol         FirmaUyeRol @default(NETWORKER)
  durum       FirmaDurum  @default(AKTIF)
  createdAt   DateTime    @default(now())
  @@unique([firmaId, kullaniciId])
}

model Kisi {                          // = prospect / Aday
  id           String     @id @default(cuid())
  kullanici    Kullanici  @relation(fields: [kullaniciId], references: [id], onDelete: Cascade)
  kullaniciId  String
  firma        Firma?     @relation(fields: [firmaId], references: [id], onDelete: SetNull)
  firmaId      String?
  adSoyad      String
  telefon      String?
  email        String?
  sehir        String?
  adayTipi     AdayTipi   @default(GENEL)
  sicaklik     Sicaklik   @default(ILIK)
  kaynakTip    KaynakTip  @default(DIGER)
  kaynakNot    String?
  durum        SunumDurum @default(YENI)
  notlar       String?               // KİŞİSEL CRM notu — firmaya gösterilmez
  skor         Int        @default(0)
  baglam       SahiplikTipi @default(KISISEL) // KISISEL | FIRMA
  sonTemas     DateTime?
  sonrakiTakip DateTime?
  aktiviteler  Aktivite[]
  davetLinkleri DavetLinki[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  @@index([kullaniciId, durum])
  @@index([firmaId])
  @@index([kullaniciId, sonrakiTakip])
}

model Aktivite {                      // durum geçmişi (mevcut)
  id       String     @id @default(cuid())
  kisi     Kisi       @relation(fields: [kisiId], references: [id], onDelete: Cascade)
  kisiId   String
  durum    SunumDurum
  aciklama String?
  otomatik Boolean    @default(false) // sistem mi değiştirdi
  tarih    DateTime   @default(now())
}
```

## Mesaj & Sayfa Modelleri

```prisma
model MesajKalibi {
  id            String       @id @default(cuid())
  sahiplik      SahiplikTipi
  kullaniciId   String?                       // KISISEL ise
  firmaId       String?                       // FIRMA ise
  olusturanId   String
  baslik        String
  kategori      String                        // ilk_temas, sunum, takip, toplanti, itiraz, kapanis, musteri, hatirlatma
  adayTipi      AdayTipi?
  durum         SunumDurum?
  metin         String
  varsayilanSayfaId String?
  varsayilanTakipGun Int?
  aktif         Boolean      @default(true)
  premium       Boolean      @default(false)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  @@index([sahiplik, firmaId])
  @@index([kullaniciId])
}

model DavetSayfasi {
  id          String       @id @default(cuid())
  sahiplik    SahiplikTipi
  kullaniciId String?
  firmaId     String?
  olusturanId String
  baslik      String
  aciklama    String?
  amac        String                          // is_firsati, urun, network, egitim, toplanti, webinar, kampanya
  tema        String?
  durum       SayfaDurum   @default(TASLAK)
  varsayilan  Boolean      @default(false)
  profilGoster Boolean     @default(true)
  firmaGoster Boolean      @default(true)
  whatsappButon Boolean    @default(true)
  reklamGoster Boolean     @default(false)
  moduller    DavetModulu[]
  linkler     DavetLinki[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  @@index([sahiplik, firmaId])
}

model DavetModulu {
  id        String   @id @default(cuid())
  sayfa     DavetSayfasi @relation(fields: [sayfaId], references: [id], onDelete: Cascade)
  sayfaId   String
  tip       ModulTip
  sira      Int
  icerik    Json                              // metin/medya/video url/butonlar...
  ayarlar   Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([sayfaId, sira])
}
```

## Link, Olay & Etkileşim Modelleri

```prisma
model DavetLinki {
  id           String     @id @default(cuid())
  token        String     @unique                 // ≥128-bit, base62
  kisi         Kisi       @relation(fields: [kisiId], references: [id], onDelete: Cascade)
  kisiId       String
  kullaniciId  String
  firmaId      String?
  sayfa        DavetSayfasi @relation(fields: [sayfaId], references: [id])
  sayfaId      String
  kampanyaId   String?
  durum        LinkDurum  @default(OLUSTURULDU)
  gonderildiAt DateTime?
  ilkAcilmaAt  DateTime?
  sonAcilmaAt  DateTime?
  acilmaSayisi Int        @default(0)
  olaylar      DavetOlayi[]
  randevular   RandevuTalebi[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  @@index([kullaniciId])
  @@index([firmaId])
}

model DavetOlayi {                      // yüksek hacimli — index + ileride partition
  id          String   @id @default(cuid())
  link        DavetLinki @relation(fields: [linkId], references: [id], onDelete: Cascade)
  linkId      String
  kullaniciId String
  firmaId     String?
  kisiId      String
  olayTip     String                    // page_opened, scroll_50, video_50, cta_clicked...
  olayDeger   String?
  modulId     String?
  videoSaglayici String?
  videoSaniye Int?
  videoYuzde  Int?
  scrollYuzde Int?
  sayfadaSure Int?                       // saniye
  sessionId   String
  ipHash      String?
  uaHash      String?
  createdAt   DateTime @default(now())
  @@index([linkId, sessionId])
  @@index([kisiId, olayTip])
  @@index([firmaId, createdAt])
}

model HazirMesajLog {
  id            String          @id @default(cuid())
  kullaniciId   String
  firmaId       String?
  kisiId        String
  kalipId       String?
  linkId        String?
  mesajMetni    String
  waMeUrl       String
  durum         HazirMesajDurum @default(HAZIRLANDI)
  whatsappAcildiAt DateTime?
  gonderildiOnayAt DateTime?
  createdAt     DateTime        @default(now())
  @@index([kullaniciId])
  @@index([kisiId])
}

model RandevuTalebi {
  id          String       @id @default(cuid())
  kullaniciId String
  firmaId     String?
  kisiId      String
  link        DavetLinki?  @relation(fields: [linkId], references: [id], onDelete: SetNull)
  linkId      String?
  tarih       DateTime?
  saatMetni   String?
  tip         RandevuTip   @default(WHATSAPP)
  mesaj       String?
  durum       RandevuDurum @default(TALEP)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  @@index([kullaniciId, durum])
}
```

## Yardımcı Modeller

```prisma
model Kampanya {
  id        String   @id @default(cuid())
  firma     Firma    @relation(fields: [firmaId], references: [id], onDelete: Cascade)
  firmaId   String
  baslik    String
  aciklama  String?
  durum     SayfaDurum @default(TASLAK)
  baslangic DateTime?
  bitis     DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model FirmaMedya {
  id        String   @id @default(cuid())
  firma     Firma    @relation(fields: [firmaId], references: [id], onDelete: Cascade)
  firmaId   String
  tip       String                  // image, video, pdf
  url       String
  baslik    String?
  aciklama  String?
  createdAt DateTime @default(now())
}

model Takip {
  id          String   @id @default(cuid())
  kullaniciId String
  firmaId     String?
  kisiId      String
  baslik      String
  vadeTarihi  DateTime
  durum       String   @default("bekliyor")  // bekliyor, tamamlandi
  tamamlandiAt DateTime?
  createdAt   DateTime @default(now())
  @@index([kullaniciId, vadeTarihi])
}

model Bildirim {
  id          String      @id @default(cuid())
  kullaniciId String
  baslik      String
  mesaj       String
  tip         BildirimTip
  kisiId      String?
  linkId      String?
  okundu      Boolean     @default(false)
  createdAt   DateTime    @default(now())
  @@index([kullaniciId, okundu])
}

model Reklam {
  id        String     @id @default(cuid())
  baslik    String
  gorselUrl String
  hedefUrl  String
  yer       ReklamYer
  durum     SayfaDurum @default(TASLAK)
  baslangic DateTime?
  bitis     DateTime?
  createdAt DateTime   @default(now())
}
```

## İndeksleme & Performans Notları

- `DavetOlayi` en hızlı büyüyen tablo: `(linkId, sessionId)`, `(kisiId, olayTip)`,
  `(firmaId, createdAt)` indeksleri zorunlu. Hacim artınca `createdAt` ile aylık partition.
- Tüm firma-kapsamlı tablolarda `firmaId` indeksli — tenant filtreleme.
- `DavetLinki.token` unique + tahmin edilemez (kriptografik rastgele, base62 ~22 karakter).
- Skor (`Kisi.skor`) event'lerden türetilir; senkron yazımdan kaçınmak için event işleyici güncelleyebilir.
