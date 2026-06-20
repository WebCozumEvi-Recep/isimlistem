"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
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

const PAKETLER = ["FREE", "BUSINESS", "BUSINESS_PLUS"];
const DURUMLAR = ["AKTIF", "PASIF", "ASKIDA"];
const FIRMA_ROLLERI = ["FIRMA_ADMIN", "ICERIK_YONETICI", "RAPOR_IZLEYICI", "NETWORKER"];

/** Admin: kullanıcının rolünü, firmasını ve (istenirse) parolasını günceller. */
export async function kullaniciGuncelle(kullaniciId: string, formData: FormData) {
  await requireAdmin();

  const rol = String(formData.get("rol") ?? "");
  const firmaId = String(formData.get("firmaId") ?? "");
  const firmaRol = String(formData.get("firmaRol") ?? "NETWORKER");
  const yeniParola = String(formData.get("yeniParola") ?? "");

  const veri: Record<string, unknown> = {
    telefon: al(formData, "telefon"),
    sehir: al(formData, "sehir"),
    bio: al(formData, "bio"),
  };
  const adSoyad = al(formData, "adSoyad");
  if (adSoyad) veri.adSoyad = adSoyad;
  const email = al(formData, "email");
  if (email) veri.email = email.toLowerCase();
  if (rol === "ADMIN" || rol === "UYE") veri.rol = rol;
  if (yeniParola) {
    if (yeniParola.length < 6) return; // çok kısa parola yok sayılır
    veri.parolaHash = await bcrypt.hash(yeniParola, 10);
  }

  if (firmaId) {
    // Tek firma modeli: diğer üyelikleri kaldır, seçilene NETWORKER/rol ile bağla.
    const rolDeg = (FIRMA_ROLLERI.includes(firmaRol) ? firmaRol : "NETWORKER") as never;
    await prisma.firmaUye.deleteMany({ where: { kullaniciId, firmaId: { not: firmaId } } });
    await prisma.firmaUye.upsert({
      where: { firmaId_kullaniciId: { firmaId, kullaniciId } },
      create: { firmaId, kullaniciId, rol: rolDeg },
      update: { rol: rolDeg },
    });
    veri.varsayilanFirmaId = firmaId;
  } else {
    // Firma kaldırıldı.
    await prisma.firmaUye.deleteMany({ where: { kullaniciId } });
    veri.varsayilanFirmaId = null;
  }

  if (Object.keys(veri).length > 0) {
    try {
      await prisma.kullanici.update({ where: { id: kullaniciId }, data: veri });
    } catch {
      // e-posta benzersiz olmalı vb. — sessizce çık
      return;
    }
  }
  revalidatePath("/admin/kullanicilar");
  redirect("/admin/kullanicilar");
}

function al(fd: FormData, k: string): string | null {
  const v = String(fd.get(k) ?? "").trim();
  return v === "" ? null : v;
}

/** Firma detaylarını günceller (admin). */
export async function firmaGuncelle(firmaId: string, formData: FormData) {
  await requireAdmin();
  const ad = al(formData, "ad");
  if (!ad) return;

  let slug = al(formData, "slug");
  if (slug) slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const paket = String(formData.get("paket") ?? "");
  const durum = String(formData.get("durum") ?? "");
  const limitRaw = al(formData, "networkerLimiti");
  const networkerLimiti = limitRaw ? Math.max(0, Number(limitRaw) || 0) : null;

  try {
    await prisma.firma.update({
      where: { id: firmaId },
      data: {
        ad,
        ...(slug ? { slug } : {}),
        ...(PAKETLER.includes(paket) ? { paket: paket as never } : {}),
        ...(DURUMLAR.includes(durum) ? { durum: durum as never } : {}),
        networkerLimiti,
        logoUrl: al(formData, "logoUrl"),
        aciklama: al(formData, "aciklama"),
        website: al(formData, "website"),
        telefon: al(formData, "telefon"),
        whatsapp: al(formData, "whatsapp"),
      },
    });
  } catch {
    // slug çakışması vb. — sessizce çık (form aynı sayfada kalır)
    return;
  }
  revalidatePath("/admin/firmalar");
  redirect("/admin/firmalar");
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

// ---------- Sistem ayarları ----------

async function dosyaKaydet(dosya: FormDataEntryValue | null, onek: string): Promise<string | null> {
  if (!(dosya instanceof File) || dosya.size === 0) return null;
  const uzanti = (dosya.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const adi = `${onek}-${Date.now()}.${uzanti}`;
  const dizin = path.join(process.cwd(), "public", "marka");
  await mkdir(dizin, { recursive: true });
  await writeFile(path.join(dizin, adi), Buffer.from(await dosya.arrayBuffer()));
  // /public statik servisi build sonrası dosyaları sunmadığından route handler ile sunulur.
  return `/medya/${adi}`;
}

export async function ayarGuncelle(formData: FormData) {
  await requireAdmin();

  const logoUrl = (await dosyaKaydet(formData.get("logoDosya"), "logo")) ?? metin(formData, "logoUrl");
  const faviconUrl = (await dosyaKaydet(formData.get("faviconDosya"), "favicon")) ?? metin(formData, "faviconUrl");

  const veri = {
    siteAdi: metin(formData, "siteAdi") ?? "İsim Listem",
    slogan: metin(formData, "slogan"),
    aciklama: metin(formData, "aciklama"),
    googleDogrulama: metin(formData, "googleDogrulama"),
    analitikKodu: metin(formData, "analitikKodu"),
    destekEmail: metin(formData, "destekEmail"),
    smtpHost: metin(formData, "smtpHost"),
    smtpPort: metin(formData, "smtpPort") ? Number(metin(formData, "smtpPort")) : null,
    smtpGuvenli: formData.get("smtpGuvenli") === "on",
    smtpKullanici: metin(formData, "smtpKullanici"),
    smtpParola: metin(formData, "smtpParola"),
    smtpGonderenAd: metin(formData, "smtpGonderenAd"),
    smtpGonderen: metin(formData, "smtpGonderen"),
    kvkkMetni: metin(formData, "kvkkMetni"),
    gizlilikMetni: metin(formData, "gizlilikMetni"),
    cerezMetni: metin(formData, "cerezMetni"),
    kullanimMetni: metin(formData, "kullanimMetni"),
    mesafeliMetni: metin(formData, "mesafeliMetni"),
    uyelikMetni: metin(formData, "uyelikMetni"),
    ...(logoUrl ? { logoUrl } : {}),
    ...(faviconUrl ? { faviconUrl } : {}),
  };

  await prisma.siteAyar.upsert({
    where: { id: "default" },
    update: veri,
    create: { id: "default", ...veri },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/ayarlar");
}

/** Talep formu durumu / notu güncelle. */
export async function talepGuncelle(id: string, formData: FormData) {
  await requireAdmin();
  const durum = String(formData.get("durum") ?? "");
  const not = metin(formData, "not");
  const gecerli = ["YENI", "GORUSULDU", "ISTEMIYOR", "KURULUM_YAPILDI"];
  await prisma.talepFormu.update({
    where: { id },
    data: {
      ...(gecerli.includes(durum) ? { durum: durum as never } : {}),
      not,
    },
  });
  revalidatePath("/admin/talepler");
}

/** Talep formu sil. */
export async function talepSil(id: string) {
  await requireAdmin();
  await prisma.talepFormu.delete({ where: { id } });
  revalidatePath("/admin/talepler");
}

/** Firmanın kayıt kodunu yeniden üret (benzersiz). */
export async function kayitKoduYenile(firmaId: string) {
  await requireAdmin();
  let kod = kayitKoduUret();
  // Benzersiz olana kadar dene
  while (await prisma.firma.findUnique({ where: { kayitKodu: kod } })) {
    kod = kayitKoduUret();
  }
  await prisma.firma.update({ where: { id: firmaId }, data: { kayitKodu: kod } });
  revalidatePath(`/admin/firmalar/${firmaId}`);
}
