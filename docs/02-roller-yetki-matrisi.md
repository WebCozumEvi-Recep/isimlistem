# 02 — Roller & Yetki Matrisi

## Roller

| Rol | Tanım | Modeldeki karşılığı |
|-----|-------|---------------------|
| **Süper Admin** | Platform yöneticisi | `Kullanici.rol = SUPER_ADMIN` |
| **Firma Admini** | Firmanın yöneticisi | `FirmaUye.rol = FIRMA_ADMIN` |
| **Firma İçerik Yöneticisi** | Şablon/sayfa/medya yönetir | `FirmaUye.rol = ICERIK_YONETICI` |
| **Firma Rapor İzleyici** | Sadece rapor görür | `FirmaUye.rol = RAPOR_IZLEYICI` |
| **Firmaya Bağlı Networker** | Firma içeriğini kullanır | `FirmaUye.rol = NETWORKER` |
| **Bağımsız Networker** | Firmasız networker | `Kullanici.rol = UYE`, `FirmaUye` yok |
| **Aday** | Kayıtsız, token'lı ziyaretçi | Kullanıcı değil — `DavetLinki.token` |

> Bir `Kullanici` aynı anda hem bağımsız networker olabilir hem de bir firmaya `FirmaUye`
> olarak bağlı olabilir. Yetki, aktif **bağlam** (kişisel vs firma workspace) + `FirmaUye.rol`
> kombinasyonundan hesaplanır.

## Kaynak × Aksiyon Matrisi

Lejant: ✅ tam · 🟡 koşullu/kısıtlı · ❌ yok · 👁 sadece okuma

| Kaynak / Aksiyon | Bağımsız Networker | Firma Networker | İçerik Yön. | Rapor İzl. | Firma Admin | Süper Admin |
|---|---|---|---|---|---|---|
| Kendi adayları (CRUD) | ✅ | ✅ | ❌ | ❌ | ❌ | 👁 (destek) |
| Başka networker'ın adayları | ❌ | ❌ | ❌ | ❌ | 🟡 (yalnız anonim metrik / izinli PII) | 🟡 |
| Kişisel mesaj kalıbı | ✅ | ✅ | — | — | — | — |
| Global mesaj kalıbı | 👁 | 👁 | ❌ | ❌ | ❌ | ✅ |
| Firma mesaj kalıbı | — | 👁 | ✅ | 👁 | ✅ | 👁 |
| Kişisel davet sayfası | ✅ | ✅ | — | — | — | — |
| Firma davet sayfası | — | 👁 | ✅ | 👁 | ✅ | 👁 |
| Global şablon/sayfa | 👁 | 👁 | ❌ | ❌ | ❌ | ✅ |
| Davet linki üretme | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Aday davranış event'leri | 👁 (kendi) | 👁 (kendi) | ❌ | 👁 (anonim agregat) | 👁 (anonim agregat) | 👁 |
| Randevu yönetimi | ✅ (kendi) | ✅ (kendi) | ❌ | 👁 | 👁 | ❌ |
| Firma profili | ❌ | ❌ | 🟡 (içerik alanları) | ❌ | ✅ | 👁 |
| Networker davet/yönetim | ❌ | ❌ | ❌ | ❌ | ✅ | 👁 |
| Kampanya | ❌ | 👁 | ✅ | 👁 | ✅ | 👁 |
| Firma raporları | ❌ | 🟡 (kendi performansı) | 👁 | 👁 | ✅ | ✅ |
| Firma oluştur/paket/limit | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Tüm kullanıcılar/firmalar | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Global reklam/banner | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| KVKK/silme talepleri | 🟡 (kendi) | 🟡 (kendi) | ❌ | ❌ | 🟡 (firma kapsamı) | ✅ |
| Sistem logları | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## Kritik Gizlilik Kuralları (yetki katmanında zorlanmalı)

1. **Aday PII izolasyonu:** Bir adayın `name/phone/email/note` alanları yalnızca **ekleyen networker**'a
   görünür. Firma bu alanları **yalnızca** aday açık onay verdiyse (`form_consent = true`) görür.
2. **Networker CRM notu** (`Kisi.notlar`) firmaya **hiçbir koşulda** gösterilmez.
3. **Firma agregat metrikleri** networker bazlı anonim/sayısaldır (PII içermez).
4. Süper adminin aday PII'sine erişimi yalnızca **denetlenebilir destek bağlamında** (loglanır).

## Uygulama Notu

- Yetki kontrolü tek bir `yetki.ts` (policy) katmanında toplanmalı: `can(kullanici, aksiyon, kaynak, baglam)`.
- Her firma-kapsamlı sorgu `company_id` (firma_id) ile filtrelenmeli — **tenant izolasyonu**.
- Public davet uçları kimlik gerektirmez ama yalnızca `token` üzerinden erişir; rate-limit uygulanır.
