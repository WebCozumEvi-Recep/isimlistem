"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { davetUrl } from "@/lib/site";
import { davetToken } from "@/server/token";
import { mesajDoldur, waMeUrl } from "@/server/mesaj";
import { sayfaDuzenleyebilir } from "@/lib/firma";
import { KALIP_KATEGORILERI } from "@/lib/sabitler";
import { MODUL_VARSAYILAN, SABLON_AKIS } from "@/lib/davet-sablon";

function metin(fd: FormData, key: string): string | null {
  const v = String(fd.get(key) ?? "").trim();
  return v === "" ? null : v;
}

// ---------- Mesaj kalıpları ----------

export async function kalipEkle(formData: FormData) {
  const user = await requireUser();
  const baslik = metin(formData, "baslik");
  const mesajMetni = metin(formData, "metin");
  if (!baslik || !mesajMetni) return;
  const kategori = String(formData.get("kategori") ?? "ilk_temas");
  await prisma.mesajKalibi.create({
    data: {
      sahiplik: "KISISEL",
      kullaniciId: user.id,
      baslik,
      metin: mesajMetni,
      kategori: (KALIP_KATEGORILERI as readonly string[]).includes(kategori) ? kategori : "ilk_temas",
    },
  });
  revalidatePath("/panel/kaliplar");
}

export async function kalipSil(kalipId: string) {
  const user = await requireUser();
  const k = await prisma.mesajKalibi.findUnique({ where: { id: kalipId } });
  if (!k || k.kullaniciId !== user.id) return;
  await prisma.mesajKalibi.delete({ where: { id: kalipId } });
  revalidatePath("/panel/kaliplar");
}

// ---------- Davet sayfaları ----------

export async function sayfaEkle(formData: FormData) {
  const user = await requireUser();
  const baslik = metin(formData, "baslik") ?? "Yeni Davet Sayfası";
  const sayfa = await prisma.davetSayfasi.create({
    data: {
      sahiplik: "KISISEL",
      kullaniciId: user.id,
      baslik,
      durum: "TASLAK",
      moduller: {
        create: [
          { tip: "KARSILAMA", sira: 0, icerik: { baslik: "Merhaba {ad} 👋", metin: "Sana özel hazırladığım bu kısa tanıtımı inceleyebilirsin." } },
          { tip: "BUTON", sira: 1, icerik: { butonlar: ["ilgileniyorum", "more_info", "appointment", "whatsapp"] } },
        ],
      },
    },
  });
  redirect(`/panel/sayfa/${sayfa.id}`);
}

export async function modulEkle(sayfaId: string, formData: FormData) {
  const user = await requireUser();
  if (!(await sayfaDuzenleyebilir(sayfaId, user.id))) return;
  const adet = await prisma.davetModulu.count({ where: { sayfaId } });
  const tip = String(formData.get("tip") ?? "METIN");
  const sira = adet;
  let icerik: Record<string, unknown> = {};
  if (tip === "METIN") icerik = { baslik: metin(formData, "baslik"), metin: metin(formData, "metin") };
  else if (tip === "GORSEL") icerik = { url: metin(formData, "url") };
  else if (tip === "VIDEO") icerik = { url: metin(formData, "url") };
  else if (tip === "BUTON") icerik = { butonlar: ["ilgileniyorum", "more_info", "appointment", "whatsapp"] };
  else if (tip === "RANDEVU") icerik = {};
  await prisma.davetModulu.create({
    data: { sayfaId, tip: tip as never, sira, icerik: icerik as never },
  });
  revalidatePath(`/panel/sayfa/${sayfaId}`);
}

export async function modulSil(modulId: string, sayfaId: string) {
  const user = await requireUser();
  if (!(await sayfaDuzenleyebilir(sayfaId, user.id))) return;
  await prisma.davetModulu.delete({ where: { id: modulId } });
  revalidatePath(`/panel/sayfa/${sayfaId}`);
}

/** Yeni modül ekler, oluşturulan kaydı döner (client builder için). */
export async function modulEkleTip(sayfaId: string, tip: string) {
  const user = await requireUser();
  if (!(await sayfaDuzenleyebilir(sayfaId, user.id))) return null;
  const adet = await prisma.davetModulu.count({ where: { sayfaId } });
  const m = await prisma.davetModulu.create({
    data: { sayfaId, tip: tip as never, sira: adet, icerik: (MODUL_VARSAYILAN[tip] ?? {}) as never },
  });
  revalidatePath(`/panel/sayfa/${sayfaId}`);
  return { id: m.id, tip: m.tip as string, sira: m.sira, icerik: m.icerik as Record<string, unknown> };
}

export async function modulGuncelle(modulId: string, sayfaId: string, icerik: Record<string, unknown>) {
  const user = await requireUser();
  if (!(await sayfaDuzenleyebilir(sayfaId, user.id))) return { ok: false };
  await prisma.davetModulu.update({ where: { id: modulId }, data: { icerik: icerik as never } });
  revalidatePath(`/panel/sayfa/${sayfaId}`);
  return { ok: true };
}

export async function modulSiraGuncelle(sayfaId: string, siraliIdler: string[]) {
  const user = await requireUser();
  if (!(await sayfaDuzenleyebilir(sayfaId, user.id))) return { ok: false };
  await prisma.$transaction(
    siraliIdler.map((id, i) => prisma.davetModulu.update({ where: { id }, data: { sira: i } }))
  );
  revalidatePath(`/panel/sayfa/${sayfaId}`);
  return { ok: true };
}

/** Davet medyası (hikaye fotoğrafı vb.) yükler, /medya URL'i döner. */
export async function medyaYukle(formData: FormData): Promise<{ url: string | null }> {
  await requireUser();
  const dosya = formData.get("dosya");
  if (!(dosya instanceof File) || dosya.size === 0) return { url: null };
  if (dosya.size > 5 * 1024 * 1024) return { url: null }; // 5MB sınır
  const izinli = ["png", "jpg", "jpeg", "webp", "gif"];
  const uzanti = (dosya.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!izinli.includes(uzanti)) return { url: null };
  const adi = `davet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${uzanti}`;
  const dizin = path.join(process.cwd(), "public", "marka");
  await mkdir(dizin, { recursive: true });
  await writeFile(path.join(dizin, adi), Buffer.from(await dosya.arrayBuffer()));
  return { url: `/medya/${adi}` };
}

/** Hazır 8 modüllü şablonu sayfaya ekler (mevcut modüllerin sonuna). */
export async function sablonUygula(sayfaId: string) {
  const user = await requireUser();
  if (!(await sayfaDuzenleyebilir(sayfaId, user.id))) return [] as { id: string; tip: string; sira: number; icerik: Record<string, unknown> }[];
  const adet = await prisma.davetModulu.count({ where: { sayfaId } });
  const olusan: { id: string; tip: string; sira: number; icerik: Record<string, unknown> }[] = [];
  for (let i = 0; i < SABLON_AKIS.length; i++) {
    const { tip, icerik } = SABLON_AKIS[i];
    const m = await prisma.davetModulu.create({
      data: { sayfaId, tip: tip as never, sira: adet + i, icerik: icerik as never },
    });
    olusan.push({ id: m.id, tip: m.tip as string, sira: m.sira, icerik: m.icerik as Record<string, unknown> });
  }
  revalidatePath(`/panel/sayfa/${sayfaId}`);
  return olusan;
}

export async function sayfaYayinla(sayfaId: string) {
  const user = await requireUser();
  const sayfa = await sayfaDuzenleyebilir(sayfaId, user.id);
  if (!sayfa) return;
  await prisma.davetSayfasi.update({
    where: { id: sayfaId },
    data: { durum: sayfa.durum === "YAYINDA" ? "TASLAK" : "YAYINDA" },
  });
  revalidatePath(`/panel/sayfa/${sayfaId}`);
}

export async function sayfaSil(sayfaId: string) {
  const user = await requireUser();
  if (!(await sayfaDuzenleyebilir(sayfaId, user.id))) return;
  await prisma.davetSayfasi.delete({ where: { id: sayfaId } });
  redirect("/panel/sayfalar");
}

// ---------- WhatsApp mesaj hazırlama ----------

/** Aday + kalıp + sayfa → davet linki + doldurulmuş mesaj + wa.me URL. */
export async function whatsappHazirla(kisiId: string, formData: FormData) {
  const user = await requireUser();
  const kisi = await prisma.kisi.findUnique({ where: { id: kisiId } });
  if (!kisi || kisi.kullaniciId !== user.id) redirect("/panel/liste");

  const sayfaId = metin(formData, "sayfaId");
  const kalipId = metin(formData, "kalipId");
  if (!sayfaId || !kalipId) return;

  const [sayfa, kalip, kullanici] = await Promise.all([
    prisma.davetSayfasi.findUnique({ where: { id: sayfaId } }),
    prisma.mesajKalibi.findUnique({ where: { id: kalipId } }),
    prisma.kullanici.findUnique({ where: { id: user.id } }),
  ]);
  if (!sayfa || !kalip) return;

  // Bu aday+sayfa için mevcut link var mı, yoksa oluştur.
  let link = await prisma.davetLinki.findFirst({ where: { kisiId, sayfaId } });
  if (!link) {
    link = await prisma.davetLinki.create({
      data: { token: davetToken(), kisiId, kullaniciId: user.id, sayfaId },
    });
  }

  const url = await davetUrl(link.token);
  const adParcalar = kisi.adSoyad.trim().split(/\s+/);
  const mesajMetni = mesajDoldur(kalip.metin, {
    ad: adParcalar[0],
    soyad: adParcalar.slice(1).join(" ") || null,
    tam_ad: kisi.adSoyad,
    networker_ad: kullanici?.adSoyad,
    networker_telefon: kullanici?.telefon,
    ozel_davet_linki: url,
  });

  await prisma.hazirMesajLog.create({
    data: {
      kullaniciId: user.id,
      kisiId,
      kalipId,
      linkId: link.id,
      mesajMetni,
      waMeUrl: waMeUrl(kisi.telefon, mesajMetni),
    },
  });
  revalidatePath(`/panel/kisi/${kisiId}`);
}

// ---------- Randevu yönetimi ----------

async function sahipRandevu(randevuId: string, kullaniciId: string) {
  const r = await prisma.randevuTalebi.findUnique({ where: { id: randevuId } });
  if (!r || r.kullaniciId !== kullaniciId) return null;
  return r;
}

export async function randevuDurumGuncelle(
  randevuId: string,
  durum: "ONAYLANDI" | "REDDEDILDI" | "ERTELENDI" | "TAMAMLANDI" | "IPTAL"
) {
  const user = await requireUser();
  const r = await sahipRandevu(randevuId, user.id);
  if (!r) return;
  await prisma.randevuTalebi.update({ where: { id: randevuId }, data: { durum } });
  if (durum === "ONAYLANDI") {
    const kisi = await prisma.kisi.findUnique({ where: { id: r.kisiId } });
    if (kisi && kisi.durum !== "KATILDI" && kisi.durum !== "KAYIP") {
      await prisma.$transaction([
        prisma.kisi.update({ where: { id: r.kisiId }, data: { durum: "RANDEVU" } }),
        prisma.aktivite.create({ data: { kisiId: r.kisiId, durum: "RANDEVU", aciklama: "Randevu onaylandı", otomatik: true } }),
      ]);
    }
  }
  revalidatePath("/panel/randevular");
}

// ---------- Bildirimler ----------

export async function bildirimOkundu(bildirimId: string) {
  const user = await requireUser();
  const b = await prisma.bildirim.findUnique({ where: { id: bildirimId } });
  if (!b || b.kullaniciId !== user.id) return;
  await prisma.bildirim.update({ where: { id: bildirimId }, data: { okundu: true } });
  revalidatePath("/panel/bildirimler");
}

export async function tumBildirimleriOku() {
  const user = await requireUser();
  await prisma.bildirim.updateMany({ where: { kullaniciId: user.id, okundu: false }, data: { okundu: true } });
  revalidatePath("/panel/bildirimler");
}

/** "Gönderdim" — log + link durumu + huni durumu güncellenir. */
export async function gonderildiOnayla(logId: string, kisiId: string) {
  const user = await requireUser();
  const log = await prisma.hazirMesajLog.findUnique({ where: { id: logId } });
  if (!log || log.kullaniciId !== user.id) return;

  await prisma.$transaction(async (tx) => {
    await tx.hazirMesajLog.update({
      where: { id: logId },
      data: { durum: "GONDERILDI_ONAY", gonderildiOnayAt: new Date() },
    });
    if (log.linkId) {
      await tx.davetLinki.update({
        where: { id: log.linkId },
        data: { durum: "GONDERILDI", gonderildiAt: new Date() },
      });
    }
    const kisi = await tx.kisi.findUnique({ where: { id: kisiId } });
    if (kisi && kisi.durum === "YENI") {
      await tx.kisi.update({ where: { id: kisiId }, data: { durum: "ARANDI", sonTemas: new Date() } });
      await tx.aktivite.create({
        data: { kisiId, durum: "ARANDI", aciklama: "Davet mesajı gönderildi", otomatik: true },
      });
    }
  });
  revalidatePath(`/panel/kisi/${kisiId}`);
}
