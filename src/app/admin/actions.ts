"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { benzersizSlug, kayitKoduUret } from "@/lib/firma";

function metin(fd: FormData, key: string): string | null {
  const v = String(fd.get(key) ?? "").trim();
  return v === "" ? null : v;
}

/** Süper admin: firma oluştur + (varsa) bir kullanıcıyı firma yöneticisi yap. */
export async function firmaOlustur(formData: FormData) {
  await requireAdmin();
  const ad = metin(formData, "ad");
  if (!ad) return;
  const yoneticiEmail = metin(formData, "yoneticiEmail")?.toLowerCase();

  const firma = await prisma.firma.create({
    data: {
      ad,
      slug: await benzersizSlug(ad),
      kayitKodu: kayitKoduUret(),
      paket: "BUSINESS",
      durum: "AKTIF",
    },
  });

  if (yoneticiEmail) {
    const yonetici = await prisma.kullanici.findUnique({ where: { email: yoneticiEmail } });
    if (yonetici) {
      await prisma.firmaUye.upsert({
        where: { firmaId_kullaniciId: { firmaId: firma.id, kullaniciId: yonetici.id } },
        update: { rol: "FIRMA_ADMIN", durum: "AKTIF" },
        create: { firmaId: firma.id, kullaniciId: yonetici.id, rol: "FIRMA_ADMIN" },
      });
      await prisma.kullanici.update({ where: { id: yonetici.id }, data: { varsayilanFirmaId: firma.id } });
    }
  }
  revalidatePath("/admin");
}

export async function firmaDurumDegistir(firmaId: string, durum: "AKTIF" | "PASIF" | "ASKIDA") {
  await requireAdmin();
  await prisma.firma.update({ where: { id: firmaId }, data: { durum } });
  revalidatePath("/admin");
}

export async function firmaPaketDegistir(firmaId: string, paket: "FREE" | "BUSINESS" | "BUSINESS_PLUS") {
  await requireAdmin();
  await prisma.firma.update({ where: { id: firmaId }, data: { paket } });
  revalidatePath("/admin");
}

// ---------- Global mesaj kalıpları ----------

export async function globalKalipEkle(formData: FormData) {
  await requireAdmin();
  const baslik = metin(formData, "baslik");
  const metinIcerik = metin(formData, "metin");
  if (!baslik || !metinIcerik) return;
  await prisma.mesajKalibi.create({
    data: { sahiplik: "GLOBAL", baslik, metin: metinIcerik, kategori: String(formData.get("kategori") ?? "ilk_temas") },
  });
  revalidatePath("/admin/kaliplar");
}

export async function globalKalipSil(kalipId: string) {
  await requireAdmin();
  const k = await prisma.mesajKalibi.findUnique({ where: { id: kalipId } });
  if (!k || k.sahiplik !== "GLOBAL") return;
  await prisma.mesajKalibi.delete({ where: { id: kalipId } });
  revalidatePath("/admin/kaliplar");
}
