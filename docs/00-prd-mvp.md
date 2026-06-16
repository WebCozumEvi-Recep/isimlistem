# 00 — Ürün Gereksinim Dokümanı (PRD) & MVP Kapsamı

## 1. Ürün Özeti

**İsim Listem**, network marketing / doğrudan satış / referanslı satış yapan bağımsız
kullanıcılar (networker) için **ücretsiz aday takip + kişiye özel davet sistemi**dir.

Çekirdek değer önerisi:
> "Adayını ekle, kişiye özel davet linkini oluştur, WhatsApp'tan manuel gönder,
> adayın sayfada ne yaptığını gör ve doğru zamanda takip et."

Gelir bireysel kullanıcıdan değil, **Kurumsal Firma (Business)** aboneliğinden gelir.

### Kapsam dışı (kesin sınırlar)
- MLM ağı, sponsor/alt-üst ekip yapısı, binary/unilevel, kariyer/prim/komisyon takibi **yok**.
- Kullanıcılar arası aday paylaşımı / ortak havuz **yok**.
- WhatsApp'tan otomatik/toplu mesaj **yok** — yalnızca `wa.me` ile manuel gönderim.

## 2. Hedefler & Başarı Metrikleri

| Hedef | Metrik |
|-------|--------|
| Networker büyümesi (ücretsiz) | Kayıtlı aktif networker sayısı, eklenen aday sayısı |
| Davet etkinliği | Gönderilen davet / açılan davet oranı |
| Aday etkileşimi | Ortalama sayfada kalma, video izleme %, CTA tıklama oranı |
| Gelir (Business) | Aktif firma aboneliği, firma başına networker sayısı |
| Dönüşüm | Randevu talebi / davet oranı, "müşteri oldu" geçişleri |

## 3. Persona Özeti

- **Bağımsız Networker** — kendi adaylarını yönetir, içeriğini kendi üretir, ücretsiz.
- **Firmaya Bağlı Networker** — firmanın hazır içeriğini kullanır, içerik üretmez.
- **Kurumsal Firma (Business)** — içerik/marka merkezi yönetir, networker davet eder, rapor görür.
- **Süper Admin** — platform/firma/paket/global şablon/reklam/KVKK yönetimi.
- **Aday** — kayıt olmaz; token'lı özel davet linkiyle tanınır, sayfada aksiyon alır.

(Detaylı yetkiler için [02-roller-yetki-matrisi.md](02-roller-yetki-matrisi.md).)

## 4. Fonksiyonel Gereksinim Başlıkları

1. **Kimlik & Profil** — kayıt/giriş, profil, firma kayıt kodu/linkiyle katılım.
2. **Aday Yönetimi** — CRUD, tip/sıcaklık/kaynak/durum, not, takip tarihi.
3. **Mesaj Kalıpları** — global / kişisel / kurumsal; değişken doldurma; `wa.me` üretimi.
4. **WhatsApp Hazırlama** — kalıp + aday + davet linki → `wa.me` URL → "Gönderdim" onayı.
5. **Davet Sayfası Builder** — modüler landing (metin/görsel/video/buton/randevu/SSS/form...).
6. **Kişiye Özel Davet Linki** — tahmin edilemez token, kişisel veri içermez.
7. **Aday Davranış Takibi** — sayfa/video/randevu event'leri, session bazlı.
8. **Otomatik Durum + Skor** — davranışa göre durum güncelleme ve aday skoru.
9. **Randevu** — networker müsaitliği + aday talebi + onay/red/erteleme.
10. **Bildirimler** — uygulama içi (aday açtı/izledi/randevu istedi/takip zamanı).
11. **Kurumsal Panel** — firma profili, networker yönetimi, kampanya, raporlar.
12. **Süper Admin** — firma/paket/global şablon/reklam/KVKK/log yönetimi.
13. **KVKK/Gizlilik** — bilgilendirme, izinli paylaşım, veri silme kanalı.

## 5. Non-Fonksiyonel Gereksinimler

- **Mobil öncelikli PWA**, hızlı, büyük butonlu, WhatsApp odaklı UX.
- **Performans:** public davet sayfası < 2 sn TTFB hedefi; event yazımı asenkron/queue.
- **Güvenlik:** token'lar tahmin edilemez (≥128-bit), IP/UA hashlenir, oturum httpOnly+secure.
- **Gizlilik:** firma varsayılan olarak aday PII'sini görmez (bkz. izin modeli).
- **Ölçeklenebilirlik:** event tablosu yüksek hacimli; indexleme + ileride partition.

## 6. MVP Kapsamı

### A. Networker Free MVP
Kayıt/giriş • profil • aday CRUD & liste & detay • durum/takip tarihi/not •
hazır + kişisel mesaj kalıpları • `wa.me` manuel gönderim • basit davet sayfası
(metin/görsel/video/buton/randevu modülleri) • aday başına özel davet linki •
aday davranışlarını görme • temel aday skoru • temel dashboard.

> Mevcut canlı sürüm bu kümenin **aday CRUD + durum + dashboard + dışa aktarım**
> kısmını zaten karşılıyor. MVP'yi tamamlamak için eksik olanlar: mesaj kalıpları &
> `wa.me`, davet sayfası builder, davet linki + public sayfa, event tracking, skor.

### B. Kurumsal Firma Business MVP
Firma oluşturma & profil • firma logolu davet sayfası • firma mesaj kalıpları •
networker kayıt linki • firmaya bağlı networker akışı • firma şablonlarını kullanma •
firma dashboard • sayfa/mesaj performans raporu • networker aktivite raporu.

### C. Süper Admin MVP
Firma oluşturma/listeleme • kullanıcı listeleme • firma aktif/pasif •
global mesaj kalıbı yönetimi • temel reklam/banner • genel kullanım istatistikleri.

## 7. Faz Dışı (İkinci Faz)

AI mesaj/sayfa asistanı • Google Calendar • gelişmiş sayfa builder & tema editörü •
özel domain / white-label • A/B test • çoklu dil • PDF upload • Excel içe aktarma •
gelişmiş raporlama • push notification • PWA offline • mobil uygulama • API entegrasyonları.

## 8. Varsayımlar & Riskler

- **Varsayım:** networker mesajı kendi telefonundan gönderir; biz API kullanmayız → WhatsApp ToS riski düşük.
- **Risk:** event tracking hacmi büyürse maliyet/performans → queue + eşik bazlı kayıt + partition.
- **Risk:** KVKK — aday PII'si yanlış paylaşılırsa hukuki risk → izin modeli baştan doğru kurulmalı.
- **Risk:** kapsam şişmesi → MVP sınırı net tutulmalı, ikinci faz ertelenmeli.
