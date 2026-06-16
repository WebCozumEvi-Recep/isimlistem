# 04 — API Endpointleri

Proje **Next.js App Router** üzerinde. İki tür uç:
- **Server Actions** (panel içi mutasyonlar — form/buton; kimlik oturumdan).
- **Route Handlers (`/api/*`)** (public event toplama, dışa aktarım, ileride entegrasyon API).

Aşağıdaki liste planın REST taslağını bu mimariye uyarlar. Mutasyonların çoğu MVP'de
Server Action olarak, public/uçtan uca olanlar Route Handler olarak gerçeklenir.

Lejant: 🔓 public (token/anonim) · 🔒 oturum gerekli · 🏢 firma yetkisi · 👑 süper admin

## Auth & Profil
| Yöntem | Uç | Açıklama |
|---|---|---|
| Action | `kayitOl(formData)` | 🔓 networker kayıt (firma kodu opsiyonel) |
| Action | `girisYap(formData)` | 🔓 giriş |
| Action | `cikisYap()` | 🔒 çıkış |
| Action | `profilGuncelle(formData)` | 🔒 profil/izinler |
| GET | `/api/me` | 🔒 oturum + aktif bağlam bilgisi |

## Adaylar (Kisi)
| Yöntem | Uç | Açıklama |
|---|---|---|
| GET | `/panel/liste` (sayfa) | 🔒 filtreli aday listesi |
| Action | `kisiEkle / kisiGuncelle / kisiSil` | 🔒 CRUD |
| Action | `durumGuncelle(kisiId, durum, not)` | 🔒 manuel durum + Aktivite kaydı |
| GET | `/panel/kisi/[id]` (sayfa) | 🔒 aday detay + analitik |

## Mesaj Kalıpları
| Yöntem | Uç | Açıklama |
|---|---|---|
| GET | `/api/mesaj-kaliplari` | 🔒 global + kişisel (+ firma) birleşik liste |
| Action | `kalipEkle / kalipGuncelle / kalipSil` | 🔒 kişisel; 🏢 firma kalıbı |

## WhatsApp Mesaj Hazırlama
| Yöntem | Uç | İstek → Yanıt |
|---|---|---|
| Action | `whatsappHazirla(kisiId, {kalipId, sayfaId, ozelMetin?})` | 🔒 → `{ mesajMetni, davetUrl, waMeUrl, hazirMesajLogId }` |
| Action | `gonderildiOnayla(hazirMesajLogId)` | 🔒 → durum `GONDERILDI_ONAY`, aday `DAVET_GONDERILDI` |

`waMeUrl` formatı: `https://wa.me/<telefon>?text=<URL_ENCODE(mesaj)>`.

## Davet Sayfaları & Modüller
| Yöntem | Uç | Açıklama |
|---|---|---|
| GET/Action | `/api/davet-sayfalari` + `sayfaEkle/Guncelle/Sil` | 🔒/🏢 CRUD |
| Action | `modulEkle(sayfaId, tip, icerik)` | 🔒/🏢 |
| Action | `modulGuncelle(modulId, icerik)` / `modulSil(modulId)` | 🔒/🏢 |
| Action | `modulleriSirala(sayfaId, siraListesi)` | 🔒/🏢 |

## Davet Linkleri (kişiye özel)
| Yöntem | Uç | Açıklama |
|---|---|---|
| Action | `davetLinkiOlustur(kisiId, {sayfaId, kampanyaId?})` | 🔒 → `{ token, url }` |
| GET | `/panel/kisi/[id]` içinde | 🔒 adaya ait linkler |
| GET | `/d/[token]` (public sayfa) | 🔓 davet sayfasını render eder |
| GET | `/[firmaSlug]/d/[token]` | 🔓 kurumsal bağlamlı render |

## Public Event Toplama
| Yöntem | Uç | İstek |
|---|---|---|
| POST | `/api/public/olay` | 🔓 `{ token, sessionId, olayTip, olayDeger?, modulId?, videoSaglayici?, videoSaniye?, videoYuzde?, scrollYuzde?, sayfadaSure? }` |

- Yanıt minimal (`204`). `sendBeacon` uyumlu. Rate-limit + eşik bazlı tekilleştirme uygulanır.

## Randevu
| Yöntem | Uç | Açıklama |
|---|---|---|
| POST | `/api/public/davet/[token]/randevu` | 🔓 aday randevu talebi |
| Action | `randevuOnayla / randevuReddet / randevuErtele / randevuTamamla` | 🔒 |
| GET | `/panel/randevular` | 🔒 |

## Kurumsal Firma (🏢)
| Yöntem | Uç | Açıklama |
|---|---|---|
| GET | `/firma/dashboard` | firma özet metrikleri |
| Action | `firmaProfilGuncelle` | logo/renk/footer... |
| GET/Action | `/firma/networkerlar` + `networkerDavet`, `networkerDurum` | networker yönetimi |
| GET/Action | firma `mesaj-kaliplari`, `davet-sayfalari`, `kampanyalar` | içerik yönetimi |
| GET | `/api/firma/rapor/{ozet|networkerlar|sayfalar|kaliplar|kampanyalar}` | anonim agregat raporlar |

## Süper Admin (👑)
| Yöntem | Uç | Açıklama |
|---|---|---|
| GET | `/admin/dashboard` | platform metrikleri |
| GET | `/admin/kullanicilar`, `/admin/firmalar` | listeleme |
| Action | `firmaOlustur / firmaGuncelle / firmaDurum` | firma + paket + limit |
| Action | `globalKalipYonet`, `reklamYonet` | global içerik/reklam |
| GET | `/admin/kvkk`, `/admin/loglar` | talepler & log |

## Dışa Aktarım (mevcut)
| Yöntem | Uç | Açıklama |
|---|---|---|
| GET | `/api/disa-aktar` | 🔒 aday listesi Excel (mevcut) |

## Genel Sözleşmeler
- **Kimlik:** oturum çerezi (httpOnly+secure, `jose` JWT). Server Action'lar oturumdan `kullaniciId` + aktif bağlam alır.
- **Hata biçimi:** `{ hata: "mesaj" }` (form action) / `{ error, code }` (route handler).
- **Tenant izolasyonu:** firma uçları `firmaId` zorunlu filtre; yetki `yetki.ts` ile.
- **Rate limit:** `/api/public/*` IP+token bazlı; event spam koruması.
- **Idempotency:** event'ler `(linkId, sessionId, olayTip[, eşik])` ile tekilleştirilir.
