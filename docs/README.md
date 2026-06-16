# İsim Listem — Ürün & Teknik Dokümantasyon

Bu klasör, İsim Listem'in ürün gereksinimlerini ve teknik mimarisini içerir.
Plandaki **bireysel networker (ücretsiz)** + **kurumsal firma (Business)** + **süper admin**
yapısını esas alır. İsimlendirme mevcut koddaki Türkçe modellerle (`Kullanici`, `Kisi`,
`Aktivite`) uyumludur ve onları genişletir.

> **Ne değildir:** MLM ağı, sponsor ağacı, komisyon/prim/binary takip sistemi değildir.
> **Nedir:** Networker'lar için aday takip + kişiye özel WhatsApp davet linki + aday davranış analizi aracı.

## İçindekiler

| # | Doküman | İçerik |
|---|---------|--------|
| 00 | [PRD & MVP Kapsamı](00-prd-mvp.md) | Ürün gereksinimleri, hedefler, MVP/faz dışı kapsam |
| 01 | [Kullanıcı Hikayeleri](01-kullanici-hikayeleri.md) | Rol bazlı user stories + kabul kriterleri |
| 02 | [Roller & Yetki Matrisi](02-roller-yetki-matrisi.md) | Kim neyi görür/yapar |
| 03 | [Veritabanı Şeması](03-veritabani-semasi.md) | Türkçe Prisma modelleri + mevcut şemadan migrasyon |
| 04 | [API Endpointleri](04-api-endpointleri.md) | REST/Server Action uçları, istek/yanıt |
| 05 | [Frontend Ekranlar & Wireframe](05-frontend-ekranlar.md) | Ekran listesi + metinsel wireframe |
| 06 | [Backend Mimari & Event Tracking](06-backend-mimari-tracking.md) | Servis katmanları + olay toplama mimarisi |
| 07 | [Skorlama, Firma Görünürlüğü & KVKK](07-skorlama-gorunurluk-kvkk.md) | Aday skoru, veri izin modeli, gizlilik metinleri |
| 08 | [Klasör Yapısı](08-klasor-yapisi.md) | Önerilen dizin düzeni |
| 09 | [Sprint Planı & Task Breakdown](09-sprint-task-breakdown.md) | Faz/sprint planı + geliştirici görevleri |

## Mevcut Durum (2026-06-16)

Canlı sürüm (`isimlistem.com`) şu an **A. Networker Free MVP**'nin çekirdeğini içeriyor:
`Kullanici` → `Kisi` → `Aktivite` zinciri, kayıt/giriş, aday listesi/detayı, durum takibi,
Excel dışa aktarım. Bu dokümanlar mevcut tabandan tam ürüne giden yolu tarif eder.

## Terminoloji Eşlemesi (plan İngilizce ↔ kod Türkçe)

| Plan (İngilizce) | Bu projedeki model |
|------------------|--------------------|
| users | `Kullanici` |
| companies | `Firma` |
| company_users | `FirmaUye` |
| prospects | `Kisi` (alan adı: *Aday*) |
| message_templates | `MesajKalibi` |
| invite_pages | `DavetSayfasi` |
| invite_page_modules | `DavetModulu` |
| prospect_invite_links | `DavetLinki` |
| invite_events | `DavetOlayi` |
| prepared_message_logs | `HazirMesajLog` |
| appointment_requests | `RandevuTalebi` |
| campaigns | `Kampanya` |
| company_media | `FirmaMedya` |
| followups | `Takip` |
| notifications | `Bildirim` |
| ads | `Reklam` |
