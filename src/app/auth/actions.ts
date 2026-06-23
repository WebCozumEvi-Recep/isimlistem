"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSession, clearSession } from "@/lib/session";
import { hostFirma } from "@/lib/host";
import { getAyar } from "@/lib/ayarlar";
import { siteKoku } from "@/lib/site";
import { mailGonder, mailSablon } from "@/lib/mail";

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

  const hatirla = formData.get("hatirla") === "on";
  await setSession({
    id: kullanici.id,
    adSoyad: kullanici.adSoyad,
    email: kullanici.email,
    rol: kullanici.rol,
  }, hatirla);
  redirect("/panel");
}

export async function cikisYap() {
  await clearSession();
  redirect("/auth/giris");
}

// ---------- Parola sıfırlama ----------

export type SifirlamaDurum = { hata?: string; basari?: string } | undefined;

/** Şifremi unuttum: e-postaya sıfırlama linki gönderir. (E-posta var/yok bilgisini sızdırmaz.) */
export async function sifreSifirlamaIste(_prev: SifirlamaDurum, formData: FormData): Promise<SifirlamaDurum> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { hata: "E-posta adresi gerekli." };

  const basariMesaji = "Eğer bu e-posta kayıtlıysa, parola sıfırlama bağlantısı gönderildi. Gelen kutunu (ve spam klasörünü) kontrol et.";
  const kullanici = await prisma.kullanici.findUnique({ where: { email } });
  if (!kullanici) return { basari: basariMesaji };

  const token = randomBytes(32).toString("hex");
  const sonKullanma = new Date(Date.now() + 60 * 60 * 1000); // 1 saat
  // Eski talepleri temizle, yenisini oluştur.
  await prisma.parolaSifirlama.deleteMany({ where: { kullaniciId: kullanici.id } });
  await prisma.parolaSifirlama.create({ data: { kullaniciId: kullanici.id, token, sonKullanma } });

  const ayar = await getAyar();
  const url = `${await siteKoku()}/auth/sifre-sifirla/${token}`;
  await mailGonder({
    kime: kullanici.email,
    konu: `${ayar.siteAdi} — Parola sıfırlama`,
    html: mailSablon({
      siteAdi: ayar.siteAdi,
      logoUrl: ayar.logoUrl,
      logoBeyazUrl: ayar.logoBeyazUrl,
      baslik: "Parola sıfırlama isteği",
      selamlama: `Merhaba ${kullanici.adSoyad},`,
      govde: "Hesabın için bir parola sıfırlama isteği aldık. Yeni parola belirlemek için aşağıdaki butona tıkla. Bu bağlantı <b>1 saat</b> geçerlidir.",
      butonMetni: "Parolamı sıfırla",
      butonUrl: url,
      altNot: "Bu isteği sen yapmadıysan bu e-postayı görmezden gelebilirsin; parolan değişmez.",
    }),
  });

  return { basari: basariMesaji };
}

/** Sıfırlama linkindeki token ile yeni parola belirler. */
export async function sifreSifirla(_prev: SifirlamaDurum, formData: FormData): Promise<SifirlamaDurum> {
  const token = String(formData.get("token") ?? "");
  const parola = String(formData.get("parola") ?? "");
  const parola2 = String(formData.get("parola2") ?? "");

  if (parola.length < 6) return { hata: "Parola en az 6 karakter olmalı." };
  if (parola !== parola2) return { hata: "Parolalar eşleşmiyor." };

  const kayit = await prisma.parolaSifirlama.findUnique({ where: { token } });
  if (!kayit || kayit.sonKullanma < new Date()) {
    return { hata: "Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir sıfırlama isteği oluştur." };
  }

  const parolaHash = await bcrypt.hash(parola, 10);
  await prisma.$transaction([
    prisma.kullanici.update({ where: { id: kayit.kullaniciId }, data: { parolaHash } }),
    prisma.parolaSifirlama.deleteMany({ where: { kullaniciId: kayit.kullaniciId } }),
  ]);

  redirect("/auth/giris?sifirlandi=1");
}
