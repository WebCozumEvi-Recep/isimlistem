"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  SUNUM_DURUMLARI,
  KAYNAK_TIPLERI,
  ADAY_TIPLERI,
  SICAKLIKLAR,
  type SunumDurum,
  type KaynakTip,
  type AdayTipi,
  type Sicaklik,
} from "@/lib/sabitler";

function metin(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

function tarih(formData: FormData, key: string): Date | null {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : new Date(v);
}

function durumDogrula(v: string | null): SunumDurum {
  return SUNUM_DURUMLARI.includes(v as SunumDurum) ? (v as SunumDurum) : "YENI";
}

function kaynakDogrula(v: string | null): KaynakTip {
  return KAYNAK_TIPLERI.includes(v as KaynakTip) ? (v as KaynakTip) : "DIGER";
}

function adayTipiDogrula(v: string | null): AdayTipi {
  return ADAY_TIPLERI.includes(v as AdayTipi) ? (v as AdayTipi) : "GENEL";
}

function sicaklikDogrula(v: string | null): Sicaklik {
  return SICAKLIKLAR.includes(v as Sicaklik) ? (v as Sicaklik) : "ILIK";
}

async function sahipKisi(kisiId: string, kullaniciId: string) {
  const kisi = await prisma.kisi.findUnique({ where: { id: kisiId } });
  if (!kisi || kisi.kullaniciId !== kullaniciId) redirect("/panel/liste");
  return kisi;
}

export async function kisiEkle(formData: FormData) {
  const user = await requireUser();
  const adSoyad = metin(formData, "adSoyad");
  const telefonZorunlu = metin(formData, "telefon");
  if (!adSoyad || !telefonZorunlu) return;

  const durum = durumDogrula(metin(formData, "durum"));
  const kisi = await prisma.kisi.create({
    data: {
      adSoyad,
      telefon: metin(formData, "telefon"),
      email: metin(formData, "email"),
      sehir: metin(formData, "sehir"),
      adayTipi: adayTipiDogrula(metin(formData, "adayTipi")),
      sicaklik: sicaklikDogrula(metin(formData, "sicaklik")),
      kaynakTip: kaynakDogrula(metin(formData, "kaynakTip")),
      kaynakNot: metin(formData, "kaynakNot"),
      durum,
      oncelik: Number(formData.get("oncelik") ?? 0) || 0,
      notlar: metin(formData, "notlar"),
      sonrakiTakip: tarih(formData, "sonrakiTakip"),
      kullaniciId: user.id,
      aktiviteler: { create: { durum, aciklama: "Listeye eklendi" } },
    },
  });
  redirect(`/panel/kisi/${kisi.id}`);
}

export async function kisiGuncelle(kisiId: string, formData: FormData) {
  const user = await requireUser();
  await sahipKisi(kisiId, user.id);

  await prisma.kisi.update({
    where: { id: kisiId },
    data: {
      adSoyad: metin(formData, "adSoyad") ?? "İsimsiz",
      telefon: metin(formData, "telefon"),
      email: metin(formData, "email"),
      sehir: metin(formData, "sehir"),
      adayTipi: adayTipiDogrula(metin(formData, "adayTipi")),
      sicaklik: sicaklikDogrula(metin(formData, "sicaklik")),
      kaynakTip: kaynakDogrula(metin(formData, "kaynakTip")),
      kaynakNot: metin(formData, "kaynakNot"),
      oncelik: Number(formData.get("oncelik") ?? 0) || 0,
      notlar: metin(formData, "notlar"),
      sonrakiTakip: tarih(formData, "sonrakiTakip"),
    },
  });
  revalidatePath(`/panel/kisi/${kisiId}`);
}

// Huni durumu değişimi — aynı transaction'da Aktivite kaydı yazılır.
export async function durumDegistir(kisiId: string, formData: FormData) {
  const user = await requireUser();
  await sahipKisi(kisiId, user.id);

  const yeniDurum = durumDogrula(metin(formData, "durum"));
  const aciklama = metin(formData, "aciklama");

  await prisma.$transaction([
    prisma.kisi.update({
      where: { id: kisiId },
      data: { durum: yeniDurum, sonTemas: new Date() },
    }),
    prisma.aktivite.create({
      data: { kisiId, durum: yeniDurum, aciklama },
    }),
  ]);
  revalidatePath(`/panel/kisi/${kisiId}`);
  revalidatePath("/panel");
}

export async function kisiSil(kisiId: string) {
  const user = await requireUser();
  const kisi = await sahipKisi(kisiId, user.id);

  // Eski davet token'larını iz olarak sakla (kişi geri dönerse yeniden kayıt için).
  const linkler = await prisma.davetLinki.findMany({
    where: { kisiId },
    select: { token: true, sayfaId: true },
  });

  await prisma.$transaction([
    ...linkler.map((l) =>
      prisma.silinmisDavet.upsert({
        where: { token: l.token },
        update: {},
        create: {
          token: l.token,
          kullaniciId: user.id,
          sayfaId: l.sayfaId,
          eskiAdSoyad: kisi.adSoyad,
          eskiTelefon: kisi.telefon,
        },
      })
    ),
    // Bildirim, adaya ilişki (relation) ile bağlı olmadığından elle temizlenir.
    prisma.bildirim.deleteMany({ where: { kullaniciId: user.id, kisiId } }),
    // Randevular, davet linkleri, mesaj logları ve aktiviteler onDelete: Cascade ile silinir.
    prisma.kisi.delete({ where: { id: kisiId } }),
  ]);

  redirect("/panel/liste");
}

// Excel/CSV içe aktarma — başlıklar: "Ad Soyad", "Telefon", "E-posta", "Bağ Notu".
export async function kisiIceAktar(formData: FormData) {
  const user = await requireUser();
  const dosya = formData.get("dosya");
  if (!(dosya instanceof File) || dosya.size === 0) redirect("/panel/liste?hata=dosya");

  const XLSX = await import("xlsx");
  const buf = Buffer.from(await dosya.arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const satirlar = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

  const al = (r: Record<string, unknown>, ...anahtarlar: string[]) => {
    for (const a of anahtarlar) {
      const v = r[a];
      if (v != null && String(v).trim() !== "") return String(v).trim();
    }
    return null;
  };

  const eklenecek = satirlar
    .map((r) => al(r, "Ad Soyad", "ad soyad", "Ad", "İsim", "Name"))
    .map((adSoyad, i) => ({ adSoyad, r: satirlar[i] }))
    .filter((x): x is { adSoyad: string; r: Record<string, unknown> } => !!x.adSoyad)
    .map(({ adSoyad, r }) => ({
      adSoyad,
      telefon: al(r, "Telefon", "telefon", "Phone"),
      email: al(r, "E-posta", "Email", "email", "eposta"),
      kaynakNot: al(r, "Bağ Notu", "Kaynak", "Not"),
      kullaniciId: user.id,
    }));

  if (eklenecek.length > 0) {
    await prisma.kisi.createMany({ data: eklenecek });
  }
  revalidatePath("/panel/liste");
  redirect("/panel/liste");
}
