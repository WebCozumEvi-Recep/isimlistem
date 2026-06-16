# 07 — Skorlama, Firma Görünürlüğü & KVKK

## A. Aday İlgi Skoru (sistematik)

### A.1 Puanlama tablosu
| Aksiyon (event) | Puan |
|---|---:|
| Linki açtı (`first_opened`) | +10 |
| İkinci kez açtı (`repeat_opened`) | +5 |
| Sayfada 60sn+ kaldı (`time_on_page≥60`) | +10 |
| Scroll %50 | +10 |
| Scroll %75 | +15 |
| Video başlattı | +15 |
| Video %50 | +20 |
| Video %90 | +30 |
| "İlgileniyorum" | +50 |
| "Daha detaylı bilgi istiyorum" | +40 |
| WhatsApp dönüş butonu | +40 |
| Randevu istedi | +70 |
| "İlgilenmiyorum" | −50 |
| 7 gün hiç açmadı | −20 |

### A.2 Hesaplama kuralları (belirsizliği gidermek için)
1. **Eşik bazlı tekillik:** her event türü skora **bir kez** katkı verir (idempotent).
   Scroll %75 alındıysa %50 ayrıca sayılmaz — **en yüksek eşik** kazanır (scroll için %50 *veya* %75, ikisi birden değil).
   - Scroll: max eşik puanı (%75 → +15, %50 → +10).
   - Video: max eşik puanı (%90 → +30, %50 → +20, başlatma +15 ayrı sayılabilir).
3. **`repeat_opened`** en fazla **bir kez** +5 (tekrar tekrar açma şişirmez).
4. **Negatifler:** "İlgilenmiyorum" skoru düşürür ama **0 altına inmez** (clamp ≥ 0).
5. **Zaman aşımı:** "7 gün açmadı" cron ile bir kez −20 uygulanır (tekrarlanmaz).
6. **Yeniden hesap:** skor her ilgili event sonrası `skorService.hesapla(kisiId)` ile
   **baştan** (event geçmişinden) hesaplanır → tutarlı, yarış koşulu yok.

### A.3 Sıcaklık etiketi
| Skor | Etiket |
|---|---|
| 0–20 | Soğuk |
| 21–60 | Ilık |
| 61–120 | Sıcak |
| 120+ | Çok sıcak |

Aday kartında: `"Aday Skoru: 95 — Sıcak Aday"`. Skor `Kisi.skor`, etiket türetilir.

### A.4 Otomatik durum eşlemesi (override edilebilir)
| Davranış | Otomatik durum |
|---|---|
| Networker mesaj hazırladı | DAVET_HAZIRLANDI |
| "Gönderdim" | DAVET_GONDERILDI |
| Link açıldı | DAVET_ACILDI |
| Video başladı | SUNUM_IZLIYOR |
| Video %50+ | SUNUM_IZLEDI |
| Scroll %75+ | DETAYLI_INCELEDI |
| "İlgileniyorum" | ILGILENIYOR |
| "Daha detaylı bilgi" | BILGI_TALEP_ETTI |
| Randevu oluşturdu | RANDEVU_TALEP_ETTI |
| WhatsApp'tan yaz | (geri dönüş — bildirim) |
| "İlgilenmiyorum" | OLUMSUZ |
| 3 gün açılmadı | SONRA_TAKIP |

> **Kural:** otomatik durum yalnızca **ileri** yönde ve networker manuel değiştirmediyse
> uygulanır. Manuel değişiklik "kilit" sayılır (`Aktivite.otomatik=false` sonrası oto geçişler durmaz
> ama networker'ın son manuel durumunu geri almaz — yalnızca daha ileri bir sinyalde önerilir).

---

## B. Kurumsal Firma Veri Görünürlüğü & İzin Modeli

### B.1 Varsayılan (Minimum Güvenli Model)
Firma **görür:**
- Networker bazlı: aday **sayısı**, davet gönderim sayısı, link açılma oranı, video izleme oranı,
  randevu talebi sayısı, "İlgileniyorum" sayısı.
- Kampanya/sayfa/mesaj performansı (agregat).

Firma **görmez (varsayılan):**
- Aday adı, telefonu, e-postası.
- Aday özel notları / networker'ın kişisel CRM notları (`Kisi.notlar` — **asla**).

### B.2 İzinli Paylaşım Modeli
Aday davet sayfasındaki **form modülünde** açık onay verirse:

> "Bilgilerimin ilgili firma ile paylaşılmasını ve firma tarafından benimle iletişime
> geçilmesini kabul ediyorum."

Onay (`form_consent = true`) varsa firma şunları görür: aday adı, telefon, ilgi alanı,
form notu, hangi networker üzerinden geldiği, incelediği sayfa, aldığı aksiyon.
**Networker'ın kişisel CRM notu yine görünmez.**

### B.3 Teknik zorlama
- Aday PII alanları rapor sorgularından **kolon düzeyinde** dışlanır (yalnız `form_consent` olanlarda açılır).
- `yetkiService` firma rollerinde PII erişimini bayrak + bağlam ile kontrol eder.
- İzinli paylaşım kaydı **denetlenebilir** olmalı (kim, ne zaman onayladı — log).

---

## C. KVKK & Gizlilik — Ekran & Metin Noktaları

### C.1 Zorunlu ekranlar/metinler
| Yer | İçerik |
|---|---|
| Aday ekleme ekranı | "Yalnızca iletişim hakkınız olan kişileri ekleyin. Sistem otomatik mesaj göndermez. Adaylar kişisel takip listenizde saklanır." |
| Public davet sayfası altı | Çerez/analitik bilgilendirme şeridi + Gizlilik · KVKK Aydınlatma · Verilerimi sil/iletişim linkleri |
| Davet sayfası (tracking bilgisi) | "Bu sayfa size özel hazırlanmış bir bilgilendirme bağlantısıdır. Ziyaretiniz, görüntüleme süreniz, video etkileşiminiz ve buton tıklamalarınız, daveti gönderen kullanıcıya geri bildirim sağlamak amacıyla kaydedilebilir." |
| Form modülü | Firma ile paylaşım onay kutusu (varsayılan **işaretsiz**) |
| Kayıt ekranı | Pazarlama/e-posta izinleri (opsiyonel, işaretsiz) |
| Profil/Ayarlar | İzin yönetimi + hesap/veri silme talebi |
| Süper Admin | KVKK/silme talepleri kuyruğu |

### C.2 Tasarım ilkeleri
- Networker'ın eklediği adaylar **networker'ın kişisel CRM datasıdır**; başka networker'a gösterilmez.
- Firma aday PII'sini **yalnız açık onayla** görür.
- Sistem adaylara networker adına **otomatik mesaj göndermez**; gönderim manuel `wa.me`.
- Aday davranış takibi **bilgilendirilir**; çerez/analitik metni gösterilir.
- Aday veri silme/iletişim talebi için **kanal sunulur** (`/yasal/veri-silme`).
- IP/UA **hashlenir**, ham saklanmaz; token'da PII yok.
- Açık rıza kayıtları **denetlenebilir** (zaman damgalı log).

### C.3 Veri saklama / silme
- Aday silme talebinde: `Kisi` + bağlı `DavetLinki`/`DavetOlayi`/`RandevuTalebi` anonimleştir/sil.
- Onay geri çekme: `form_consent=false` → firma PII görünürlüğü anında kapanır.
