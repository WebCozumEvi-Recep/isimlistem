"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

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

function saat(fd: FormData, key: string): number {
  const n = Number(fd.get(key));
  return Number.isInteger(n) && n >= 0 && n <= 23 ? n : 0;
}

/** Push bildirim tercihlerini günceller. */
export async function pushAyarGuncelle(formData: FormData) {
  const user = await requireUser();
  const sessizKullan = formData.get("sessizKullan") === "on";
  await prisma.kullanici.update({
    where: { id: user.id },
    data: {
      pushAcik: formData.get("pushAcik") === "on",
      pushTumu: formData.get("kapsam") === "tumu",
      pushSessizBas: sessizKullan ? saat(formData, "sessizBas") : null,
      pushSessizBit: sessizKullan ? saat(formData, "sessizBit") : null,
    },
  });
  revalidatePath("/panel/profil");
}
