"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { davetToken } from "@/server/token";
import { pushGonder } from "@/server/push";

/**
 * Silinmiş bir adayın eski davet token'ı ile geri dönmesi: kendini yeniden aday
 * olarak ekler. Sahibe "Yeni Aday" bildirimi düşülür ve yeni davet linkine yönlendirilir.
 */
export async function silinmisDavetKayit(token: string, formData: FormData) {
  const adSoyad = String(formData.get("adSoyad") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  if (!adSoyad || !telefon) redirect(`/d/${token}?hata=eksik`);

  const iz = await prisma.silinmisDavet.findUnique({ where: { token } });
  if (!iz) redirect(`/d/${token}`);

  // Sahip ve sayfa hâlâ duruyor mu?
  const [sahip, sayfa] = await Promise.all([
    prisma.kullanici.findUnique({ where: { id: iz.kullaniciId }, select: { id: true } }),
    prisma.davetSayfasi.findUnique({ where: { id: iz.sayfaId }, select: { id: true } }),
  ]);

  if (!sahip) {
    // Sahip yoksa iz anlamsız: temizle.
    await prisma.silinmisDavet.delete({ where: { token } }).catch(() => {});
    redirect(`/d/${token}/tesekkurler`);
  }

  const yeniToken = davetToken();
  await prisma.$transaction(async (tx) => {
    const kisi = await tx.kisi.create({
      data: {
        adSoyad,
        telefon,
        kaynakTip: "DIGER",
        kaynakNot: "Davet linkinden kendini yeniden ekledi",
        durum: "YENI",
        kullaniciId: iz.kullaniciId,
        aktiviteler: { create: { durum: "YENI", aciklama: "Davet linkinden kendini ekledi", otomatik: true } },
      },
    });

    if (sayfa) {
      await tx.davetLinki.create({
        data: { token: yeniToken, kisiId: kisi.id, kullaniciId: iz.kullaniciId, sayfaId: iz.sayfaId },
      });
    }

    await tx.bildirim.create({
      data: {
        kullaniciId: iz.kullaniciId,
        baslik: "Yeni aday",
        mesaj: `${adSoyad} davet linkinden kendini aday olarak ekledi.`,
        tip: "YENI_ADAY",
        kisiId: kisi.id,
      },
    });

    // Aynı kişiye ait diğer izleri de temizle (birden fazla davet linki olabilirdi).
    await tx.silinmisDavet.deleteMany({
      where: { kullaniciId: iz.kullaniciId, eskiTelefon: iz.eskiTelefon },
    });
    await tx.silinmisDavet.deleteMany({ where: { token } });
  });

  await pushGonder(iz.kullaniciId, "İsim Listem", `${adSoyad} davet linkinden kendini aday olarak ekledi.`, "YENI_ADAY");

  // Sayfa duruyorsa yeni davet sayfasını göster; yoksa teşekkür.
  redirect(sayfa ? `/d/${yeniToken}` : `/d/${token}/tesekkurler`);
}
