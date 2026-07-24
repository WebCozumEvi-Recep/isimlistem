"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, demoModuMu } from "@/lib/auth";
import { clearSession } from "@/lib/session";

function metin(fd: FormData, key: string): string | null {
  const v = String(fd.get(key) ?? "").trim();
  return v === "" ? null : v;
}

/** Kullanıcı profilini günceller (ad, telefon, şehir, bio, profil fotoğrafı). */
export async function profilGuncelle(formData: FormData) {
  const user = await requireUser();
  const adSoyad = metin(formData, "adSoyad");
  if (!adSoyad) return;

  await prisma.kullanici.update({
    where: { id: user.id },
    data: {
      adSoyad,
      telefon: metin(formData, "telefon"),
      sehir: metin(formData, "sehir"),
      bio: metin(formData, "bio"),
      // Boş gelirse fotoğrafı kaldır; dolu gelirse güncelle.
      profilFoto: metin(formData, "profilFoto"),
    },
  });

  revalidatePath("/panel/profil");
  revalidatePath("/panel", "layout");
}

/**
 * Hesabı siler (soft-delete): veriyi silmeden hesabı pasife alır — kullanıcı
 * bir daha giriş yapamaz, sistemde "silinmiş" sayılır. E-posta çakışmasını
 * önlemek için benzersiz e-posta serbest bırakılır (silindi:<zaman>:<eski>).
 * Demo hesabında çalışmaz.
 */
export async function hesabiSil() {
  const user = await requireUser();
  if (await demoModuMu()) return; // demo hesabı silinemez

  const now = new Date();
  const mevcut = await prisma.kullanici.findUnique({ where: { id: user.id }, select: { email: true, silindi: true } });
  if (!mevcut || mevcut.silindi) {
    await clearSession();
    redirect("/auth/giris");
  }

  await prisma.kullanici.update({
    where: { id: user.id },
    data: {
      silindi: true,
      silindiTarih: now,
      // E-postayı serbest bırak ki kullanıcı ileride yeni hesap açabilsin.
      email: `silindi:${now.getTime()}:${mevcut!.email}`,
    },
  });

  await clearSession();
  redirect("/auth/giris?silindi=1");
}

function saat(fd: FormData, key: string): number {
  const n = Number(fd.get(key));
  return Number.isInteger(n) && n >= 0 && n <= 23 ? n : 0;
}

const GECERLI_TIPLER = [
  "LINK_ACILDI", "VIDEO_IZLEDI", "ILGILENIYOR", "RANDEVU",
  "WHATSAPP_DONUS", "TAKIP_ZAMANI", "ACILMAYAN_DAVET", "YENI_ADAY",
];

/** Push bildirim tercihlerini günceller. */
export async function pushAyarGuncelle(formData: FormData) {
  const user = await requireUser();
  const sessizKullan = formData.get("sessizKullan") === "on";
  const secilenTipler = formData.getAll("tip").map(String).filter((t) => GECERLI_TIPLER.includes(t));
  await prisma.kullanici.update({
    where: { id: user.id },
    data: {
      pushAcik: formData.get("pushAcik") === "on",
      pushTipler: secilenTipler,
      pushSessizBas: sessizKullan ? saat(formData, "sessizBas") : null,
      pushSessizBit: sessizKullan ? saat(formData, "sessizBit") : null,
    },
  });
  revalidatePath("/panel/profil");
}
