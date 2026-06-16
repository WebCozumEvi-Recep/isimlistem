# 09 — Geliştirme Fazları, Sprint Planı & Task Breakdown

İki haftalık sprintler varsayılmıştır. Mevcut canlı sürüm **Sprint 0**'ı (aday CRUD + durum +
dashboard + dışa aktarım) büyük ölçüde karşılıyor; plan oradan ileriye gider.

## Faz 1 — Networker Free MVP'yi Tamamla

### Sprint 1 — Şema genişletme + Mesaj & WhatsApp
**Hedef:** kalıplar + `wa.me` manuel gönderim çalışır.
- [ ] Prisma şema genişletme: `Rol.SUPER_ADMIN`, `Kisi` alanları (adayTipi, sicaklik, skor, baglam), `SunumDurum` genişletme — **nullable/default**'lu migration.
- [ ] `MesajKalibi` modeli + global seed kalıpları.
- [ ] Kalıp CRUD (kişisel) ekranı + server actions.
- [ ] `messaging/` servisi: değişken doldurma (`{ad}`, `{ozel_davet_linki}`...), URL-encode, `wa.me` üretimi.
- [ ] "WhatsApp Hazırla" akışı + `HazirMesajLog` + "Gönderdim" → durum güncelleme.
- **Çıktı/DoD:** networker kalıp seçip aday için `wa.me` açabiliyor, gönderdim diyebiliyor; durum güncelleniyor.

### Sprint 2 — Davet Sayfası Builder + Kişiye özel link + Public sayfa
- [ ] `DavetSayfasi` + `DavetModulu` modelleri.
- [ ] Builder UI: modül ekle/sırala/düzenle (metin/görsel/video/buton/randevu).
- [ ] `linkService`: token üretimi + `davetLinkiOlustur`.
- [ ] Public `/d/[token]` render (modülleri çizer, kişiselleştirir).
- [ ] Mesaj akışına davet linki entegrasyonu.
- **DoD:** networker sayfa kurup adaya özel link üretiyor; aday linke girince kişisel sayfayı görüyor.

### Sprint 3 — Event Tracking + Skor + Otomatik Durum + Aday Analitiği
- [ ] `DavetOlayi` modeli + `POST /api/public/olay` (tekilleştirme, IP/UA hash, rate-limit).
- [ ] İstemci tracking: scroll eşik, video (YT/Vimeo SDK), süre, `sendBeacon`.
- [ ] `scoring/` saf fonksiyonlar + `skorService` + sıcaklık etiketi.
- [ ] `durumService` otomatik durum kuralları (override mantığı).
- [ ] Aday detay analitik paneli (açılma, süre, scroll, video, butonlar, skor).
- **DoD:** aday davranışı kaydediliyor, aday kartında metrikler + skor görünüyor, durum otomatik güncelleniyor.

### Sprint 4 — Randevu + Bildirimler + Dashboard cilası
- [ ] `RandevuTalebi` + public randevu talebi + networker onay/red/ertele/tamamla.
- [ ] `Bildirim` + uygulama içi bildirim üretimi (event tetikli) + cron bildirimler (takip zamanı, açılmayan davet).
- [ ] Networker dashboard: bugünkü takipler, sıcak adaylar, açılan davetler.
- [ ] `Takip` modeli + takip listesi.
- **DoD:** Networker Free MVP uçtan uca tamam.

## Faz 2 — Kurumsal Firma Business MVP

### Sprint 5 — Firma çekirdeği + Networker bağlama
- [ ] `Firma`, `FirmaUye` modelleri + paket/limit alanları.
- [ ] Firma kayıt kodu/linki + kayıt akışına firma bağlama.
- [ ] Firma profili (logo/renk/footer) + firma paneli iskeleti + layout/yetki.
- [ ] `yetkiService` policy katmanı (tenant izolasyonu + roller).

### Sprint 6 — Firma içerik + bağlı networker akışı
- [ ] Firma mesaj kalıpları + firma davet sayfaları (sahiplik=FIRMA).
- [ ] Bağlı networker firma şablonlarını seçip kullanır (kişiselleştirilmiş link).
- [ ] Medya kütüphanesi (URL bazlı) + kampanya modeli.
- [ ] Firma logolu public davet sayfası (`/[firmaSlug]/d/[token]`).

### Sprint 7 — Firma raporları + veri görünürlüğü + izin modeli
- [ ] Anonim agregat raporlar (networker/sayfa/kalıp/kampanya performansı).
- [ ] Form modülü + `form_consent` izinli PII paylaşımı + denetim logu.
- [ ] Firma dashboard metrikleri.
- **DoD:** firma networker davet edip içerik yönetiyor, anonim raporları görüyor, izinli adayları görebiliyor.

## Faz 3 — Süper Admin MVP

### Sprint 8 — Süper admin
- [ ] Firma oluştur/listele + paket/limit + aktif/pasif.
- [ ] Kullanıcı listeleme.
- [ ] Global mesaj kalıbı yönetimi + temel reklam/banner (`Reklam`).
- [ ] Genel kullanım istatistikleri dashboard.
- [ ] KVKK/silme talepleri kuyruğu + temel loglar.

## Faz 4+ — İkinci Faz (backlog)
AI mesaj/sayfa asistanı · Google Calendar · gelişmiş builder/tema · özel domain/white-label ·
A/B test · çoklu dil · PDF upload · Excel içe aktarma · gelişmiş raporlama · push notification ·
PWA offline · mobil uygulama · API entegrasyonları · Redis queue/cache · event partition.

---

## İlk Sürüm Teknik Görev Listesi (Faz 1 odak, atanabilir)

**Altyapı**
- T-01 Prisma şema genişletme + güvenli migration (nullable/default) · 03'e göre
- T-02 `src/server/` katman iskeleti (services/repos/policy)
- T-03 Seed: global mesaj kalıpları + örnek davet sayfası

**Mesaj/WhatsApp**
- T-10 `messaging`: değişken doldurma + URL-encode + `wa.me` (saf fn + test)
- T-11 Kalıp CRUD UI + actions
- T-12 WhatsApp Hazırla akışı + `HazirMesajLog` + "Gönderdim"

**Davet sayfası**
- T-20 `DavetSayfasi`/`DavetModulu` + builder UI (sürükle-sırala)
- T-21 `linkService` token + `davetLinkiOlustur`
- T-22 Public `/d/[token]` render + kişiselleştirme

**Tracking/Skor**
- T-30 `DavetOlayi` + `/api/public/olay` (tekilleştir, hash, rate-limit)
- T-31 İstemci tracking (scroll/video/süre/sendBeacon)
- T-32 `scoring` saf fn + `skorService` + sıcaklık
- T-33 `durumService` otomatik durum + Aktivite entegrasyonu
- T-34 Aday detay analitik UI

**Randevu/Bildirim**
- T-40 `RandevuTalebi` + public talep + networker yönetimi
- T-41 `Bildirim` + event tetikli + cron bildirimler
- T-42 Dashboard + `Takip`

**Çapraz**
- T-90 KVKK metinleri + yasal sayfalar + çerez şeridi
- T-91 Rate-limit + güvenlik sertleştirme (token, hash)
- T-92 Birim testler (scoring/messaging/durum) + temel e2e (kayıt→aday→link→event)

> Her görev için DoD: kod + birim test (mantık) + lint geçer + ilgili doküman güncel.
> Deploy: `git push` → sunucuda `./deploy.sh` (bkz. DEPLOY.md).
