import "server-only";
import { prisma } from "@/lib/prisma";
import { pushGonder } from "./push";

// Açılmamış / yarım bırakılmış davetler için nazik takip hatırlatmaları.
// Networker'a bildirim üretir; spam değil, her aşama bir kez (marker olay ile tekilleştirme).

const SAAT = 60 * 60 * 1000;

type Asama = { anahtar: string; sonra: number; baslik: string; mesaj: (ad: string) => string; final?: boolean };

const ASAMALAR: Asama[] = [
  {
    anahtar: "reminder_24h",
    sonra: 24 * SAAT,
    baslik: "Nazik hatırlatma zamanı",
    mesaj: (ad) =>
      `Merhaba ${ad} 😊 Dün gönderdiğim kısa tanıtım sayfasına göz atma fırsatın oldu mu? Müsait olduğunda inceleyebilirsin, merak ettiğin bir konu olursa memnuniyetle yardımcı olurum. 🔗`,
  },
  {
    anahtar: "reminder_3d",
    sonra: 72 * SAAT,
    baslik: "3. gün hatırlatması",
    mesaj: (ad) =>
      `Selam ${ad} 👋 Yoğun olabileceğini düşündüm. Müsait olduğunda göz atman için bağlantıyı tekrar bırakıyorum. İlgini çekerse konuşuruz, çekmezse hiç sorun değil 😊 🔗`,
  },
  {
    anahtar: "reminder_7d",
    sonra: 168 * SAAT,
    final: true,
    baslik: "Son nazik dokunuş",
    mesaj: (ad) =>
      `Merhaba ${ad} 😊 Geçen gün paylaştığım konuyla ilgili düşünceni merak ettim. Şu an için ilgilenmiyorsan da sorun değil, ileride ihtiyaç duyarsan her zaman konuşabiliriz. 🌿`,
  },
];

// Bu durumlardaki linkler artık takip gerektirmez (dönüş yapılmış ya da olumsuz).
const BITMIS = new Set(["ETKILESTI", "RANDEVU_ISTEDI", "ILGISIZ"]);

export type TakipSonuc = { incelenen: number; bildirim: number; pasif: number };

/**
 * Gönderilmiş ama dönüş gelmemiş davetleri tarar, zamanı gelen aşama için
 * networker'a hatırlatma bildirimi üretir. 7. günde linki pasife alır.
 */
export async function takipTara(): Promise<TakipSonuc> {
  const simdi = Date.now();
  const sonuc: TakipSonuc = { incelenen: 0, bildirim: 0, pasif: 0 };

  const linkler = await prisma.davetLinki.findMany({
    where: {
      gonderildiAt: { not: null },
      durum: { notIn: ["OLUSTURULDU", "ILGISIZ"] },
    },
    include: { kisi: true },
  });

  for (const link of linkler) {
    if (!link.gonderildiAt) continue;
    if (BITMIS.has(link.durum)) continue;
    // Aday ilgisini göstermiş ya da terminal durumdaysa atla.
    if (["KATILDI", "KAYIP", "RANDEVU", "TAKIP"].includes(link.kisi.durum)) continue;
    sonuc.incelenen++;

    const gecen = simdi - link.gonderildiAt.getTime();
    const ad = link.kisi.adSoyad.trim().split(/\s+/)[0];

    for (const a of ASAMALAR) {
      if (gecen < a.sonra) continue;
      // Bu aşama daha önce işlendi mi?
      const var_ = await prisma.davetOlayi.findFirst({
        where: { linkId: link.id, olayTip: a.anahtar },
        select: { id: true },
      });
      if (var_) continue;

      await prisma.$transaction(async (tx) => {
        await tx.davetOlayi.create({
          data: {
            linkId: link.id,
            kullaniciId: link.kullaniciId,
            kisiId: link.kisiId,
            olayTip: a.anahtar,
            sessionId: "system",
          },
        });
        await tx.bildirim.create({
          data: {
            kullaniciId: link.kullaniciId,
            baslik: a.baslik,
            mesaj: `${ad} daveti henüz incelemedi. Önerilen mesaj: ${a.mesaj(ad)}`,
            tip: a.final ? "ACILMAYAN_DAVET" : "TAKIP_ZAMANI",
            kisiId: link.kisiId,
            linkId: link.id,
          },
        });
        if (a.final) {
          await tx.davetLinki.update({ where: { id: link.id }, data: { durum: "ILGISIZ" } });
        }
      });

      await pushGonder(
        link.kullaniciId,
        "İsim Listem",
        `${ad} için takip zamanı geldi.`,
        a.final ? "ACILMAYAN_DAVET" : "TAKIP_ZAMANI",
        { kisiId: link.kisiId },
      );

      sonuc.bildirim++;
      if (a.final) sonuc.pasif++;
    }
  }

  return sonuc;
}
