import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type SiteAyarVeri = {
  id: string;
  siteAdi: string;
  slogan: string | null;
  logoUrl: string | null;
  logoBeyazUrl: string | null;
  faviconUrl: string | null;
  aciklama: string | null;
  googleDogrulama: string | null;
  analitikKodu: string | null;
  destekEmail: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpGuvenli: boolean | null;
  smtpKullanici: string | null;
  smtpParola: string | null;
  smtpGonderenAd: string | null;
  smtpGonderen: string | null;
  kvkkMetni: string | null;
  gizlilikMetni: string | null;
  cerezMetni: string | null;
  kullanimMetni: string | null;
  mesafeliMetni: string | null;
  uyelikMetni: string | null;
};

const VARSAYILAN: SiteAyarVeri = {
  id: "default",
  siteAdi: "İsim Listem",
  slogan: null, logoUrl: null, logoBeyazUrl: null, faviconUrl: null, aciklama: null,
  googleDogrulama: null, analitikKodu: null, destekEmail: null,
  smtpHost: null, smtpPort: null, smtpGuvenli: false, smtpKullanici: null, smtpParola: null, smtpGonderenAd: null, smtpGonderen: null,
  kvkkMetni: null, gizlilikMetni: null, cerezMetni: null, kullanimMetni: null, mesafeliMetni: null, uyelikMetni: null,
};

/** Singleton site ayarını döner (yoksa oluşturur). DB erişilemezse varsayılan döner. */
export const getAyar = cache(async (): Promise<SiteAyarVeri> => {
  try {
    const mevcut = await prisma.siteAyar.findUnique({ where: { id: "default" } });
    if (mevcut) return mevcut;
    return await prisma.siteAyar.create({ data: { id: "default" } });
  } catch {
    return VARSAYILAN;
  }
});
