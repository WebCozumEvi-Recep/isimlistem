# 06 — Backend Servis Mimarisi & Event Tracking

## 1. Mimari Yaklaşım

MVP, mevcut **Next.js (App Router) monolit** üzerinde kalır — ayrı NestJS/Laravel servisi
MVP için gereksiz. Katmanlı yapı:

```
UI (Server/Client Components)
      │
Server Actions / Route Handlers   ← giriş noktası, doğrulama, yetki
      │
Servis katmanı (src/server/services)  ← iş kuralları (saf, test edilebilir)
      │
Repository / Prisma                ← veri erişimi (tenant filtreli)
      │
PostgreSQL
```

Yan bileşenler:
- **Queue (event işleme):** MVP'de hafif — event'ler DB'ye yazılır, skor/durum güncelleme
  bir **arka plan işleyici** (Route Handler + cron, ya da DB tetikli) ile asenkron. Hacim
  artınca Redis + BullMQ'ya taşınır (ikinci faz).
- **Cache (Redis):** ikinci faz — public sayfa render + rate-limit sayaçları.
- **Storage (S3 uyumlu):** medya/logo/görsel (ikinci faz; MVP'de URL embed yeterli).

## 2. Servis Katmanı (öneri modülleri)

| Servis | Sorumluluk |
|--------|-----------|
| `authService` | kayıt/giriş/oturum, firma kodu çözümleme |
| `kisiService` | aday CRUD, durum geçişi → Aktivite |
| `mesajService` | kalıp seçimi, değişken doldurma, `wa.me` üretimi, log |
| `sayfaService` | davet sayfası + modül CRUD, render modeli |
| `linkService` | token üretimi, link oluşturma, açılma sayacı |
| `olayService` | event al/tekilleştir/yaz, türev metrik üret |
| `skorService` | event'lerden skor + sıcaklık hesabı |
| `durumService` | otomatik durum kuralları (override edilebilir) |
| `randevuService` | talep/onay/red/ertele/tamamla |
| `bildirimService` | uygulama içi bildirim üretimi |
| `firmaService` | firma profili, networker davet, raporlar |
| `raporService` | anonim agregat sorgular |
| `yetkiService` | `can(kullanici, aksiyon, kaynak, baglam)` policy |

İş kuralları (skor, durum, değişken doldurma) **saf fonksiyon** olarak yazılmalı → birim test kolay.

## 3. Event Tracking Mimarisi

### 3.1 Toplanan event tipleri
- **Sayfa:** `page_opened, first_opened, repeat_opened, time_on_page, scroll_25/50/75/100,
  section_viewed, cta_clicked, whatsapp_clicked, appointment_opened, appointment_requested,
  not_interested_clicked, form_submitted, page_closed`
- **Video:** `video_started, video_paused, video_25/50/75/90, video_completed, video_replayed`
- **Randevu:** `appointment_opened, appointment_slot_selected, appointment_requested,
  appointment_confirmed, appointment_cancelled`

### 3.2 İstemci tarafı (public davet sayfası)
- Sayfa açılışında `sessionId` üretilir (uuid, sessionStorage'da tutulur).
- **Scroll:** IntersectionObserver/scroll dinleyici → her eşik (%25/50/75/100) **bir kez** gönderilir.
- **Süre:** `time_on_page` periyodik (örn. 15 sn) + sayfa kapanışta `sendBeacon`.
- **Video:** YouTube IFrame API / Vimeo Player SDK → eşik bazlı (%25/50/75/90/100) bir kez.
- **Buton/CTA:** tıklamada anında POST.
- Tüm gönderimler `POST /api/public/olay` (sendBeacon uyumlu, yanıt `204`).

### 3.3 Sunucu tarafı işleme
```
POST /api/public/olay
  → token doğrula → DavetLinki bul (yoksa 204, sessizce yut)
  → rate-limit (IP+token)
  → tekilleştir: (linkId, sessionId, olayTip[, eşik]) zaten varsa atla
  → IP/UA hashle (SHA-256 + salt) → ipHash, uaHash
  → DavetOlayi insert
  → türev güncelle: ilkAcilmaAt/sonAcilmaAt/acilmaSayisi, link.durum
  → asenkron: skorService.hesapla(kisiId), durumService.degerlendir(kisiId)
  → koşullu: bildirimService.uret(...)
```

### 3.4 Teknik kurallar (plandan)
- Event'ler `sessionId` ile gruplanır.
- Scroll & video event'leri **eşik bazlı tek kayıt** (idempotent).
- `time_on_page` belirli aralıklarla gönderilir; kapanışta `sendBeacon`.
- IP/UA **hashlenerek** saklanır (ham tutulmaz) — KVKK.
- Event tekrarları engellenir.
- Video izleme **kesin sonuç değil, davranış sinyali** olarak değerlendirilir.

### 3.5 Ölçeklenme
- `DavetOlayi` tablosu yüksek hacimli → indexler (bkz. şema) + ileride `createdAt` partition.
- Skor güncelleme senkron yazımdan kaçınmalı; event işleyici batch/debounce edebilir.
- Hacim büyürse: event'ler önce Redis stream/queue'ya, oradan toplu insert.

## 4. Güvenlik
- Public uçlar yalnızca `token` ile; token tahmin edilemez (≥128-bit).
- Rate-limit: `/api/public/*` IP+token; davet linki brute-force koruması.
- Oturum: httpOnly + secure çerez, `jose` imzalı (mevcut yapı korunur).
- Tenant izolasyonu: tüm firma sorguları `firmaId` ile zorunlu filtreli.

## 5. Bildirim Üretimi (MVP: uygulama içi)
Event işleyici, anlamlı sinyallerde `Bildirim` üretir: link açıldı, video %75+, "İlgileniyorum",
randevu talebi, WhatsApp dönüş. Ayrıca zamanlanmış (cron) bildirimler: "bugün takip zamanı",
"3 gündür açılmayan davetler". Push notification ikinci faz.
