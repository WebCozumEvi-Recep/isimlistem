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
