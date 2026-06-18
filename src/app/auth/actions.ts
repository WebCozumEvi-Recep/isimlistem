"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSession, clearSession } from "@/lib/session";
import { hostFirma } from "@/lib/host";

export type FormDurum = { hata?: string } | undefined;

export async function kayitOl(_prev: FormDurum, formData: FormData): Promise<FormDurum> {
  const adSoyad = String(formData.get("adSoyad") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const parola = String(formData.get("parola") ?? "");

  if (!adSoyad || !email || parola.length < 6) {
    return { hata: "Ad soyad, e-posta ve en az 6 karakterli parola gerekli." };
  }

  const mevcut = await prisma.kullanici.findUnique({ where: { email } });
  if (mevcut) return { hata: "Bu e-posta zaten kayıtlı." };

  // Firma alt-alanından kayıt olunuyorsa o firmaya otomatik bağlanır;
  // değilse opsiyonel kayıt kodu kontrol edilir.
  let firma = await hostFirma();
  if (!firma) {
    const kayitKodu = String(formData.get("kayitKodu") ?? "").trim();
    if (kayitKodu) {
      firma = await prisma.firma.findUnique({ where: { kayitKodu } });
      if (!firma) return { hata: "Firma kayıt kodu geçersiz." };
      if (firma.durum !== "AKTIF") return { hata: "Bu firma hesabı şu an aktif değil." };
    }
  }

  const parolaHash = await bcrypt.hash(parola, 10);
  // İlk kayıt olan kullanıcı ADMIN olur (platform yöneticisi).
  const kullaniciSayisi = await prisma.kullanici.count();
  const kullanici = await prisma.kullanici.create({
    data: {
      adSoyad,
      email,
      parolaHash,
      rol: kullaniciSayisi === 0 ? "ADMIN" : "UYE",
      varsayilanFirmaId: firma?.id ?? null,
      ...(firma ? { firmaUyelikler: { create: { firmaId: firma.id, rol: "NETWORKER" } } } : {}),
    },
  });

  await setSession({
    id: kullanici.id,
    adSoyad: kullanici.adSoyad,
    email: kullanici.email,
    rol: kullanici.rol,
  });
  redirect("/panel");
}

export async function girisYap(_prev: FormDurum, formData: FormData): Promise<FormDurum> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const parola = String(formData.get("parola") ?? "");

  const kullanici = await prisma.kullanici.findUnique({ where: { email } });
  if (!kullanici || !(await bcrypt.compare(parola, kullanici.parolaHash))) {
    return { hata: "E-posta veya parola hatalı." };
  }

  await setSession({
    id: kullanici.id,
    adSoyad: kullanici.adSoyad,
    email: kullanici.email,
    rol: kullanici.rol,
  });
  redirect("/panel");
}

export async function cikisYap() {
  await clearSession();
  redirect("/auth/giris");
}
