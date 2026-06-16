import "server-only";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { skorHesapla } from "./skor";
import { otomatikDurum } from "./durum";
import type { BildirimTip } from "@/generated/prisma/enums";

function hash(deger: string | null | undefined): string | null {
  if (!deger) return null;
  const salt = process.env.AUTH_SECRET ?? "salt";
  return createHash("sha256").update(salt + deger).digest("hex").slice(0, 32);
}

export type GelenOlay = {
  token: string;
  sessionId: string;
  olayTip: string;
  olayDeger?: string | null;
  modulId?: string | null;
  videoYuzde?: number | null;
  scrollYuzde?: number | null;
  sayfadaSure?: number | null;
};

// Bu olay tipleri için bildirim üretilir.
const BILDIRIM_ESLEME: Record<string, { tip: BildirimTip; metin: (ad: string) => string }> = {
  first_opened: { tip: "LINK_ACILDI", metin: (a) => `${a} davet linkini açtı.` },
  video_75: { tip: "VIDEO_IZLEDI", metin: (a) => `${a} videonun %75'ini izledi.` },
  cta_interested: { tip: "ILGILENIYOR", metin: (a) => `${a} "İlgileniyorum" dedi.` },
  cta_more_info: { tip: "ILGILENIYOR", metin: (a) => `${a} daha detaylı bilgi istedi.` },
  appointment_requested: { tip: "RANDEVU", metin: (a) => `${a} randevu talep etti.` },
  whatsapp_clicked: { tip: "WHATSAPP_DONUS", metin: (a) => `${a} WhatsApp'tan yazmak için tıkladı.` },
};

/**
 * Public davet sayfasından gelen olayı işler: doğrula → tekilleştir → kaydet →
 * link sayaçlarını, skoru ve otomatik durumu güncelle → bildirim üret.
 * Geçersiz token sessizce yutulur (true/false döner).
 */
export async function olayKaydet(
  g: GelenOlay,
  ip?: string | null,
  ua?: string | null
): Promise<boolean> {
  const link = await prisma.davetLinki.findUnique({
    where: { token: g.token },
    include: { kisi: true },
  });
  if (!link) return false;

  // Tekilleştirme: time_on_page hariç tüm olaylar (linkId, sessionId, olayTip) bazında tek.
  if (g.olayTip !== "time_on_page") {
    const var_ = await prisma.davetOlayi.findFirst({
      where: { linkId: link.id, sessionId: g.sessionId, olayTip: g.olayTip },
      select: { id: true },
    });
    if (var_) return true; // zaten kayıtlı, sessizce başarı
  }

  await prisma.davetOlayi.create({
    data: {
      linkId: link.id,
      kullaniciId: link.kullaniciId,
      kisiId: link.kisiId,
      olayTip: g.olayTip,
      olayDeger: g.olayDeger ?? null,
      modulId: g.modulId ?? null,
      videoYuzde: g.videoYuzde ?? null,
      scrollYuzde: g.scrollYuzde ?? null,
      sayfadaSure: g.sayfadaSure ?? null,
      sessionId: g.sessionId,
      ipHash: hash(ip),
      uaHash: hash(ua),
    },
  });

  // Açılma sayaçları
  const acilma = g.olayTip === "page_opened" || g.olayTip === "first_opened";
  if (acilma) {
    await prisma.davetLinki.update({
      where: { id: link.id },
      data: {
        acilmaSayisi: { increment: 1 },
        ilkAcilmaAt: link.ilkAcilmaAt ?? new Date(),
        sonAcilmaAt: new Date(),
        durum: link.durum === "OLUSTURULDU" || link.durum === "GONDERILDI" ? "ACILDI" : link.durum,
      },
    });
  }

  // Skor + otomatik durum (tüm olay geçmişinden baştan)
  const olaylar = await prisma.davetOlayi.findMany({
    where: { kisiId: link.kisiId },
    select: { olayTip: true, scrollYuzde: true, videoYuzde: true, sayfadaSure: true },
  });
  const yeniSkor = skorHesapla(olaylar);
  const hedefDurum = otomatikDurum(link.kisi.durum, olaylar);

  await prisma.$transaction(async (tx) => {
    await tx.kisi.update({
      where: { id: link.kisiId },
      data: { skor: yeniSkor, ...(hedefDurum ? { durum: hedefDurum } : {}) },
    });
    if (hedefDurum) {
      await tx.aktivite.create({
        data: {
          kisiId: link.kisiId,
          durum: hedefDurum,
          aciklama: "Davranışa göre otomatik güncellendi",
          otomatik: true,
        },
      });
    }
  });

  // Bildirim
  const b = BILDIRIM_ESLEME[g.olayTip];
  if (b) {
    await prisma.bildirim.create({
      data: {
        kullaniciId: link.kullaniciId,
        baslik: "Aday hareketi",
        mesaj: b.metin(link.kisi.adSoyad),
        tip: b.tip,
        kisiId: link.kisiId,
        linkId: link.id,
      },
    });
  }

  return true;
}
