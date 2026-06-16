// Demo veri — örnek firma, yönetici, networker, adaylar, davet sayfası ve davranış.
// Çalıştır: npm run db:seed-demo   (idempotent)
import { config } from "dotenv";
config({ path: ".env" });

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function token(n = 22) {
  const a = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const b = randomBytes(n);
  return Array.from(b, (x) => a[x % a.length]).join("");
}

async function kullanici(email: string, adSoyad: string, telefon?: string) {
  const parolaHash = await bcrypt.hash("123456", 10);
  return prisma.kullanici.upsert({
    where: { email },
    update: { adSoyad },
    create: { email, adSoyad, parolaHash, telefon: telefon ?? null },
  });
}

async function main() {
  // Firma + kayıt kodu sabit
  let firma = await prisma.firma.findUnique({ where: { kayitKodu: "DEMO1234" } });
  if (!firma) {
    firma = await prisma.firma.create({
      data: { ad: "Demo Firma", slug: "demo-firma", kayitKodu: "DEMO1234", paket: "BUSINESS", durum: "AKTIF", aciklama: "Tanıtım amaçlı örnek firma." },
    });
  }

  const admin = await kullanici("demo-firma@isimlistem.com", "Demo Firma Yöneticisi", "0532 000 00 01");
  const networker = await kullanici("demo-networker@isimlistem.com", "Demo Networker", "0532 000 00 02");

  await prisma.firmaUye.upsert({
    where: { firmaId_kullaniciId: { firmaId: firma.id, kullaniciId: admin.id } },
    update: { rol: "FIRMA_ADMIN" },
    create: { firmaId: firma.id, kullaniciId: admin.id, rol: "FIRMA_ADMIN" },
  });
  await prisma.firmaUye.upsert({
    where: { firmaId_kullaniciId: { firmaId: firma.id, kullaniciId: networker.id } },
    update: { rol: "NETWORKER" },
    create: { firmaId: firma.id, kullaniciId: networker.id, rol: "NETWORKER" },
  });
  await prisma.kullanici.update({ where: { id: networker.id }, data: { varsayilanFirmaId: firma.id } });

  // Firma davet sayfası
  let sayfa = await prisma.davetSayfasi.findFirst({ where: { firmaId: firma.id } });
  if (!sayfa) {
    sayfa = await prisma.davetSayfasi.create({
      data: {
        sahiplik: "FIRMA", firmaId: firma.id, baslik: "Demo İş Fırsatı", durum: "YAYINDA",
        moduller: {
          create: [
            { tip: "KARSILAMA", sira: 0, icerik: { baslik: "Merhaba {ad} 👋", metin: "Demo Firma fırsatını sana özel hazırladım." } },
            { tip: "VIDEO", sira: 1, icerik: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" } },
            { tip: "BUTON", sira: 2, icerik: { butonlar: ["ilgileniyorum", "more_info", "appointment", "whatsapp"] } },
            { tip: "RANDEVU", sira: 3, icerik: {} },
          ],
        },
      },
    });
  }

  // Networker adayları
  const adaylar = [
    { adSoyad: "Ahmet Yılmaz", telefon: "0532 111 11 11", sicaklik: "SICAK" as const, adayTipi: "IS_FIRSATI" as const },
    { adSoyad: "Elif Demir", telefon: "0533 222 22 22", sicaklik: "ILIK" as const, adayTipi: "URUN_MUSTERISI" as const },
    { adSoyad: "Mehmet Kaya", telefon: "0534 333 33 33", sicaklik: "SOGUK" as const, adayTipi: "GENEL" as const },
  ];
  for (const a of adaylar) {
    const var_ = await prisma.kisi.findFirst({ where: { kullaniciId: networker.id, adSoyad: a.adSoyad } });
    if (!var_) {
      await prisma.kisi.create({
        data: { ...a, kullaniciId: networker.id, firmaId: firma.id, durum: "YENI", aktiviteler: { create: { durum: "YENI", aciklama: "Listeye eklendi" } } },
      });
    }
  }

  // İlk aday için davet linki + örnek davranış (skor görünsün)
  const ahmet = await prisma.kisi.findFirst({ where: { kullaniciId: networker.id, adSoyad: "Ahmet Yılmaz" } });
  if (ahmet) {
    let link = await prisma.davetLinki.findFirst({ where: { kisiId: ahmet.id } });
    if (!link) {
      link = await prisma.davetLinki.create({
        data: { token: token(), kisiId: ahmet.id, kullaniciId: networker.id, sayfaId: sayfa.id, durum: "ACILDI", acilmaSayisi: 3, ilkAcilmaAt: new Date(), sonAcilmaAt: new Date() },
      });
      const olaylar = [
        { olayTip: "first_opened" }, { olayTip: "scroll_75", scrollYuzde: 75 },
        { olayTip: "video_started", videoYuzde: 0 }, { olayTip: "video_50", videoYuzde: 50 },
        { olayTip: "cta_more_info" }, { olayTip: "time_on_page", sayfadaSure: 95 },
      ];
      for (const o of olaylar) {
        await prisma.davetOlayi.create({
          data: { linkId: link.id, kullaniciId: networker.id, kisiId: ahmet.id, sessionId: "demo", olayTip: o.olayTip, scrollYuzde: o.scrollYuzde ?? null, videoYuzde: o.videoYuzde ?? null, sayfadaSure: o.sayfadaSure ?? null },
        });
      }
      await prisma.kisi.update({ where: { id: ahmet.id }, data: { skor: 95, durum: "SUNUM_YAPILDI" } });
    }
  }

  console.log("Demo veri hazır:");
  console.log("  Firma yöneticisi: demo-firma@isimlistem.com / 123456");
  console.log("  Networker:        demo-networker@isimlistem.com / 123456");
  console.log("  Firma kayıt kodu: DEMO1234");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
