import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type SiteAyarVeri = {
  id: string;
  siteAdi: string;
  slogan: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  aciklama: string | null;
  googleDogrulama: string | null;
  analitikKodu: string | null;
  destekEmail: string | null;
  kvkkMetni: string | null;
  gizlilikMetni: string | null;
  cerezMetni: string | null;
  kullanimMetni: string | null;
  mesafeliMetni: string | null;
};

const VARSAYILAN: SiteAyarVeri = {
  id: "default",
  siteAdi: "İsim Listem",
  slogan: null, logoUrl: null, faviconUrl: null, aciklama: null,
  googleDogrulama: null, analitikKodu: null, destekEmail: null,
  kvkkMetni: null, gizlilikMetni: null, cerezMetni: null, kullanimMetni: null, mesafeliMetni: null,
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
