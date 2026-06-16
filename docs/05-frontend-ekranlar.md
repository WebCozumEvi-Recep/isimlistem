# 05 — Frontend Ekran Listesi & Wireframe (metinsel)

Mobil öncelikli PWA. Büyük butonlu, WhatsApp odaklı, sade. Mevcut ekranlar ⚑ ile işaretli.

## Ekran Haritası

### Public
- `/` — landing / yönlendirme ⚑
- `/auth/giris` ⚑, `/auth/kayit` ⚑ (firma kodu opsiyonel)
- `/d/[token]` — aday davet sayfası (render edilen modüller)
- `/[firmaSlug]/d/[token]` — kurumsal davet sayfası
- `/yasal/gizlilik`, `/yasal/kvkk`, `/yasal/cerez`, `/yasal/veri-silme`

### Networker Paneli (`/panel`)
1. **Anasayfa/Dashboard** ⚑ — bugünkü takipler, açılan davetler, sıcak adaylar, bildirimler
2. **Adaylarım** ⚑ — filtreli liste (durum/sıcaklık/takip)
3. **Aday Detay** ⚑ — bilgiler + analitik + zaman çizelgesi + "WhatsApp hazırla"
4. **Aday Ekle/Düzenle** ⚑
5. **Davet Sayfalarım** — liste + builder
6. **Davet Sayfası Builder** — modül ekle/sırala/düzenle
7. **Mesaj Kalıplarım** — global/kişisel/firma sekmeleri
8. **WhatsApp Hazırla (modal/sayfa)** — aday+kalıp+sayfa → önizleme → "WhatsApp'ta Aç" → "Gönderdim"
9. **Takiplerim** — vade tarihli liste
10. **Randevularım** — talepler + onay/red/ertele/tamamla
11. **Raporlarım** — kişisel özet
12. **Profil & Ayarlar** ⚑

### Kurumsal Firma Paneli (`/firma`)
Dashboard · Firma Profili · Networker'lar · Mesaj Kalıpları · Davet Sayfaları ·
Medya Kütüphanesi · Kampanyalar · Randevu Ayarları · Raporlar · Ayarlar

### Süper Admin (`/admin`)
Dashboard ⚑ · Kullanıcılar · Firmalar · Paketler · Global Şablonlar · Reklamlar ·
KVKK Talepleri · Loglar · Ayarlar

---

## Wireframe Tarifleri (metinsel)

### Aday Detay (en kritik ekran)
```
┌─────────────────────────────────────────┐
│ ← Adaylarım          [● Sıcak]  [Skor 95]│
│ Ahmet Yılmaz                              │
│ 0532 ... · İş Fırsatı Adayı · WhatsApp    │
│ Durum: [Randevu talep etti ▾] (otomatik)  │
├─────────────────────────────────────────┤
│ 📊 ETKİLEŞİM                              │
│  Açılma: 3  · İlk: 14:20 · Son: 18:45     │
│  Sayfada: 4dk32sn · Scroll %75 · Video %62│
│  Tıklanan: "Daha detaylı bilgi istiyorum" │
│  Randevu: VAR                             │
├─────────────────────────────────────────┤
│ [ 🟢 WhatsApp Mesajı Hazırla ]  (büyük)   │
│ [ 🔗 Davet Linki Oluştur/Kopyala ]        │
├─────────────────────────────────────────┤
│ 🕓 ZAMAN ÇİZELGESİ (Aktivite)             │
│  • 18:45 Randevu talep etti (oto)         │
│  • 14:20 Davet linki açıldı (oto)         │
│  • 12:00 Davet gönderildi                 │
├─────────────────────────────────────────┤
│ 📝 Notlar (yalnız sana özel)              │
└─────────────────────────────────────────┘
```

### WhatsApp Hazırla akışı
```
[1] Kalıp seç ▾   [2] Davet sayfası seç ▾
─ Önizleme ─────────────────────────────
"Merhaba Ahmet, sana özel bir tanıtım
 sayfası hazırladım: https://.../d/8xK92pA"
─────────────────────────────────────────
[ WhatsApp'ta Aç ]   →  wa.me açılır
        ↓ (kullanıcı manuel gönderir)
[ ✓ Gönderdim ]      →  durum güncellenir
```

### Davet Sayfası Builder
```
Sol: Modül paleti        Orta: Canlı önizleme (mobil)
[+ Metin]                ┌── Karşılama ──┐
[+ Görsel]               │ Merhaba {ad}  │
[+ Video]                ├── Video ──────┤
[+ Buton]                │ ▶ tanıtım     │
[+ Randevu]              ├── Butonlar ───┤
[+ SSS] [+ Form]         │ [İlgileniyorum]│
(sürükle-bırak sırala)   └───────────────┘
Üst: [Taslak/Yayında] [Tema] [Kaydet]
```

### Public Davet Sayfası (`/d/[token]`)
```
[Firma/Networker logo]   (ayara göre)
Merhaba Ahmet 👋
[ Video oynatıcı ]   ← event: video_25/50/75/90
[ Açıklama metni ]   ← scroll event'leri
[ İlgileniyorum ] [ Detay istiyorum ]
[ Randevu oluştur ] [ WhatsApp'tan yaz ]
─────────────────────────
ℹ️ Çerez/analitik bilgilendirme şeridi
Gizlilik · KVKK · Verilerimi sil
```

### Firma Dashboard
```
Networker: 24  · Aday: 1.230 · Davet: 980
Açılma oranı %63 · Video izleme %41 · Randevu 87
[En iyi sayfalar] [En iyi kalıplar] [Networker tablosu (anonim metrik)]
```

## UI/UX İlkeleri
- Mobilde tek kolon, alt sabit navigasyon (Anasayfa/Adaylar/Hazırla/Randevu/Profil).
- Birincil aksiyon her zaman büyük yeşil "WhatsApp" butonu.
- Durum/sıcaklık/skor renkli rozetlerle (mevcut `DurumRozeti` genişletilir).
- Karmaşık CRM hissi yok; "ekle → gönder → izle → takip et" akışı öne çıkar.
