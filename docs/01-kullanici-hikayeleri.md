# 01 — Kullanıcı Hikayeleri

Format: *Bir [rol] olarak, [istek], böylece [fayda].* Her epik altında kabul kriterleri.
Öncelik: **P0** = MVP zorunlu, **P1** = MVP sonrası yakın, **P2** = ikinci faz.

---

## Epik 1 — Kimlik & Profil

- **(P0)** Bir networker olarak e-posta/parola ile kayıt olmak istiyorum, böylece kendi aday listemi tutabilirim.
  - Kabul: 6+ karakter parola; e-posta tekil; ilk kullanıcı ADMIN; kayıt sonrası `/panel`.
- **(P0)** Bir networker olarak firma kayıt linki/koduyla kayıt olmak istiyorum, böylece otomatik o firmaya bağlanırım.
  - Kabul: geçerli kod → `FirmaUye` kaydı `networker` rolüyle; geçersiz/dolmuş kod reddedilir.
- **(P0)** Bir kullanıcı olarak profilimi (ad, telefon, foto, kısa açıklama) düzenlemek istiyorum, böylece davet sayfamda görünür.
- **(P1)** Bir kullanıcı olarak pazarlama/e-posta izinlerimi yönetmek istiyorum.

## Epik 2 — Aday Yönetimi

- **(P0)** Bir networker olarak aday eklemek istiyorum (ad, telefon, tip, sıcaklık, kaynak, not).
  - Kabul: telefon E.164 normalize; aday yalnızca ekleyen networker'a görünür; ekleme uyarı metni gösterilir.
- **(P0)** Bir networker olarak adaylarımı durum/sıcaklık/takip tarihine göre filtreleyip listelemek istiyorum.
- **(P0)** Bir networker olarak aday detayında durumu manuel değiştirip not eklemek istiyorum.
  - Kabul: her durum değişimi `Aktivite` zaman çizelgesine yazılır.
- **(P1)** Bir networker olarak takip tarihi gelen adaylar için hatırlatma görmek istiyorum.

## Epik 3 — Mesaj Kalıpları & WhatsApp

- **(P0)** Bir networker olarak hazır (global) mesaj kalıplarını kullanmak istiyorum.
- **(P0)** Bir networker olarak kendi kişisel kalıbımı oluşturmak istiyorum.
- **(P0)** Bir networker olarak aday + kalıp + davet sayfası seçip `wa.me` linki üretmek istiyorum, böylece WhatsApp'ta mesaj hazır gelsin.
  - Kabul: `{ad}`, `{ozel_davet_linki}` vb. değişkenler doldurulur; metin URL-encode; `HazirMesajLog` oluşur.
- **(P0)** Bir networker olarak mesajı gönderdikten sonra "Gönderdim" demek istiyorum, böylece aday durumu "Davet gönderildi" olsun.
- **(P0)** Bir firmaya bağlı networker olarak firmanın kalıplarını kullanmak istiyorum.

## Epik 4 — Davet Sayfası Builder

- **(P0)** Bir networker olarak modüler bir davet sayfası oluşturmak istiyorum (metin/görsel/video/buton/randevu).
  - Kabul: modüller sıralanabilir; taslak/yayında durumu; en az 1 sayfa varsayılan olabilir.
- **(P1)** Bir networker olarak SSS, form, PDF, WhatsApp-dönüş modüllerini eklemek istiyorum.
- **(P0)** Bir firma olarak logolu/temalı davet sayfaları hazırlamak istiyorum, böylece networker'larım kullansın.

## Epik 5 — Kişiye Özel Link & Public Sayfa

- **(P0)** Bir networker olarak her aday için tahmin edilemez token'lı özel link üretmek istiyorum.
  - Kabul: URL'de aday PII'si yok; link `Kisi`+`DavetSayfasi`(+`Firma`/`Kampanya`) bağlar.
- **(P0)** Bir aday olarak linke girince bana özel (adımın geçtiği) sayfayı görmek istiyorum, kayıt olmadan.
- **(P0)** Bir aday olarak butonlara basıp ("İlgileniyorum", "Randevu", "WhatsApp'tan yaz") aksiyon almak istiyorum.

## Epik 6 — Davranış Takibi, Durum & Skor

- **(P0)** Bir sistem olarak adayın sayfa/video/scroll/buton event'lerini kaydetmek istiyorum.
  - Kabul: session bazlı; scroll/video eşik bazlı tek kayıt; tekrar engellenir.
- **(P0)** Bir networker olarak aday detayında açılma sayısı, süre, scroll %, video %, tıklanan butonları görmek istiyorum.
- **(P0)** Bir sistem olarak davranışa göre aday durumunu otomatik güncellemek istiyorum (networker override edebilir).
- **(P0)** Bir networker olarak aday skorunu ve sıcaklık etiketini görmek istiyorum.

## Epik 7 — Randevu

- **(P0)** Bir aday olarak davet sayfasından randevu talep etmek istiyorum (tip, tarih, saat, not).
- **(P0)** Bir networker olarak randevu taleplerini onaylamak/reddetmek/ertelemek/tamamlamak istiyorum.
- **(P1)** Bir networker olarak müsaitlik (gün/saat/süre/tip) tanımlamak istiyorum.
- **(P2)** Bir networker olarak Google Calendar ile senkron istiyorum.

## Epik 8 — Bildirimler

- **(P0)** Bir networker olarak adayım linki açınca/izleyince/randevu isteyince uygulama içi bildirim almak istiyorum.
- **(P0)** Bir networker olarak "bugün takip zamanı gelen adaylar" ve "3 gündür açılmayan davetler" bildirimi istiyorum.
- **(P2)** Push notification.

## Epik 9 — Kurumsal Firma Paneli

- **(P0)** Bir firma admini olarak firma profilini (logo, renk, açıklama, footer) tanımlamak istiyorum.
- **(P0)** Bir firma admini olarak kayıt linki/kod ile networker davet etmek ve listelemek istiyorum.
- **(P0)** Bir firma admini olarak networker bazlı **anonim** performans (aday sayısı, davet, açılma, video, randevu) görmek istiyorum.
- **(P0)** Bir firma admini olarak sayfa/mesaj/kampanya performans raporlarını görmek istiyorum.
- **(P1)** Bir firma admini olarak medya kütüphanesi ve kampanya yönetmek istiyorum.

## Epik 10 — Kurumsal Veri Görünürlüğü & İzin

- **(P0)** Bir aday olarak formda açıkça onay verirsem bilgilerimin firma ile paylaşılmasını isterim.
- **(P0)** Bir firma olarak yalnızca izin veren adayların PII'sini görmek istiyorum.
- **(P0)** Bir networker olarak adayımın kişisel notlarımın firmaya **görünmemesini** isterim.

## Epik 11 — Süper Admin

- **(P0)** Bir süper admin olarak firma oluşturmak, paket/limit belirlemek, aktif/pasif yapmak istiyorum.
- **(P0)** Bir süper admin olarak tüm kullanıcıları ve firmaları listelemek istiyorum.
- **(P0)** Bir süper admin olarak global mesaj kalıplarını ve reklam/banner alanlarını yönetmek istiyorum.
- **(P1)** Bir süper admin olarak KVKK/silme taleplerini ve logları takip etmek istiyorum.

## Epik 12 — KVKK & Gizlilik

- **(P0)** Bir aday olarak sayfada davranış takibi yapıldığı konusunda bilgilendirilmek istiyorum.
- **(P0)** Bir aday olarak veri silme/iletişim talebi için bir kanal istiyorum.
- **(P0)** Bir kullanıcı olarak gizlilik/KVKK/çerez metinlerine her sayfadan erişmek istiyorum.
