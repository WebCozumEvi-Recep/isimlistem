"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireFirmaYonetici } from "@/lib/firma";
import { KALIP_KATEGORILERI } from "@/lib/sabitler";

function metin(fd: FormData, key: string): string | null {
  const v = String(fd.get(key) ?? "").trim();
  return v === "" ? null : v;
}

async function yetkiliMi(rol: string, izinli: string[]) {
  return izinli.includes(rol);
}

// ---------- Firma profili ----------

export async function firmaProfilGuncelle(formData: FormData) {
  const { firma, uye } = await requireFirmaYonetici();
  if (!(await yetkiliMi(uye.rol, ["FIRMA_ADMIN", "ICERIK_YONETICI"]))) return;
  await prisma.firma.update({
    where: { id: firma.id },
    data: {
      ad: metin(formData, "ad") ?? firma.ad,
      logoUrl: metin(formData, "logoUrl"),
      anaRenk: metin(formData, "anaRenk"),
      aciklama: metin(formData, "aciklama"),
      website: metin(formData, "website"),
      telefon: metin(formData, "telefon"),
      whatsapp: metin(formData, "whatsapp"),
      footerMetni: metin(formData, "footerMetni"),
    },
  });
  revalidatePath("/firma/profil");
}

// ---------- Networker yönetimi ----------

export async function networkerDurumDegistir(uyeId: string, durum: "AKTIF" | "PASIF") {
  const { firma, uye } = await requireFirmaYonetici();
  if (uye.rol !== "FIRMA_ADMIN") return;
  const hedef = await prisma.firmaUye.findUnique({ where: { id: uyeId } });
  if (!hedef || hedef.firmaId !== firma.id) return;
  await prisma.firmaUye.update({ where: { id: uyeId }, data: { durum } });
  revalidatePath("/firma/networkerlar");
}

// ---------- Firma mesaj kalıpları ----------

export async function firmaKalipEkle(formData: FormData) {
  const { firma, uye } = await requireFirmaYonetici();
  if (!(await yetkiliMi(uye.rol, ["FIRMA_ADMIN", "ICERIK_YONETICI"]))) return;
  const baslik = metin(formData, "baslik");
  const metinIcerik = metin(formData, "metin");
  if (!baslik || !metinIcerik) return;
  const kategori = String(formData.get("kategori") ?? "ilk_temas");
  await prisma.mesajKalibi.create({
    data: {
      sahiplik: "FIRMA",
      firmaId: firma.id,
      baslik,
      metin: metinIcerik,
      kategori: (KALIP_KATEGORILERI as readonly string[]).includes(kategori) ? kategori : "ilk_temas",
    },
  });
  revalidatePath("/firma/kaliplar");
}

export async function firmaKalipSil(kalipId: string) {
  const { firma, uye } = await requireFirmaYonetici();
  if (!(await yetkiliMi(uye.rol, ["FIRMA_ADMIN", "ICERIK_YONETICI"]))) return;
  const k = await prisma.mesajKalibi.findUnique({ where: { id: kalipId } });
  if (!k || k.firmaId !== firma.id) return;
  await prisma.mesajKalibi.delete({ where: { id: kalipId } });
  revalidatePath("/firma/kaliplar");
}

// ---------- Firma davet sayfaları ----------

export async function firmaSayfaEkle(formData: FormData) {
  const { firma, uye } = await requireFirmaYonetici();
  if (!(await yetkiliMi(uye.rol, ["FIRMA_ADMIN", "ICERIK_YONETICI"]))) return;
  const baslik = metin(formData, "baslik") ?? "Firma Davet Sayfası";
  await prisma.davetSayfasi.create({
    data: {
      sahiplik: "FIRMA",
      firmaId: firma.id,
      baslik,
      durum: "YAYINDA",
      moduller: {
        create: [
          { tip: "KARSILAMA", sira: 0, icerik: { baslik: `Merhaba {ad} 👋`, metin: `${firma.ad} hakkında sana özel hazırladığım tanıtımı inceleyebilirsin.` } },
          { tip: "BUTON", sira: 1, icerik: { butonlar: ["ilgileniyorum", "more_info", "appointment", "whatsapp"] } },
        ],
      },
    },
  });
  revalidatePath("/firma/sayfalar");
}

export async function firmaSayfaSil(sayfaId: string) {
  const { firma, uye } = await requireFirmaYonetici();
  if (!(await yetkiliMi(uye.rol, ["FIRMA_ADMIN", "ICERIK_YONETICI"]))) return;
  const s = await prisma.davetSayfasi.findUnique({ where: { id: sayfaId } });
  if (!s || s.firmaId !== firma.id) return;
  await prisma.davetSayfasi.delete({ where: { id: sayfaId } });
  revalidatePath("/firma/sayfalar");
}
