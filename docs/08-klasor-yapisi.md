# 08 — Önerilen Klasör Yapısı

Mevcut Next.js App Router yapısını korur, servis/policy katmanı ekler.

```
isimlistem/
├── prisma/
│   ├── schema.prisma            # Türkçe modeller (bkz. 03)
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                 # landing
│   │   │   ├── auth/{giris,kayit}/page.tsx
│   │   │   ├── d/[token]/page.tsx        # aday davet sayfası
│   │   │   ├── [firmaSlug]/d/[token]/page.tsx
│   │   │   └── yasal/{gizlilik,kvkk,cerez,veri-silme}/page.tsx
│   │   ├── panel/                        # networker
│   │   │   ├── page.tsx                  # dashboard
│   │   │   ├── liste/ · kisi/[id]/ · kisi/yeni/
│   │   │   ├── sayfalar/ · sayfa/[id]/   # davet sayfası builder
│   │   │   ├── kaliplar/ · takipler/ · randevular/ · raporlar/
│   │   │   ├── actions/                  # server actions (kisi, mesaj, link...)
│   │   │   └── layout.tsx
│   │   ├── firma/                        # kurumsal panel
│   │   │   ├── dashboard/ · profil/ · networkerlar/
│   │   │   ├── kaliplar/ · sayfalar/ · medya/ · kampanyalar/ · raporlar/
│   │   │   └── layout.tsx
│   │   ├── admin/                        # süper admin
│   │   │   ├── dashboard/ · kullanicilar/ · firmalar/ · paketler/
│   │   │   ├── sablonlar/ · reklamlar/ · kvkk/ · loglar/
│   │   │   └── layout.tsx
│   │   └── api/
│   │       ├── public/olay/route.ts      # event toplama
│   │       ├── public/davet/[token]/randevu/route.ts
│   │       ├── disa-aktar/route.ts       # (mevcut)
│   │       └── firma/rapor/[tip]/route.ts
│   ├── server/                           # ★ yeni: iş mantığı
│   │   ├── services/                     # kisiService, skorService, olayService...
│   │   ├── repos/                        # prisma erişimi (tenant filtreli)
│   │   ├── policy/yetki.ts               # can(kullanici, aksiyon, kaynak, baglam)
│   │   ├── tracking/                     # event tekilleştirme, türev metrik
│   │   ├── scoring/                      # saf skor/durum fonksiyonları
│   │   └── messaging/                    # değişken doldurma, wa.me üretimi
│   ├── components/                       # UI (DurumRozeti, KisiForm, builder modülleri...)
│   ├── lib/                              # prisma, session, auth, sabitler (mevcut)
│   └── generated/prisma/                 # prisma client çıktısı
├── docs/                                 # bu dokümanlar
├── public/
├── ecosystem.config.js · DEPLOY.md · deploy.sh
└── ...
```

## İlkeler
- **İş mantığı `src/server/` altında**, UI'dan ayrık → test edilebilir, yeniden kullanılabilir.
- **Saf fonksiyonlar** (`scoring/`, `messaging/`) yan etkisiz → birim test kolay.
- **Repo katmanı** tenant (`firmaId`) filtresini tek yerde uygular.
- Route gruplaması `(public)` ile auth gerektirmeyen sayfaları ayırır.
- Mevcut dosyalar (`auth/actions.ts`, `panel/`, `components/`) kademeli olarak bu yapıya taşınır.
