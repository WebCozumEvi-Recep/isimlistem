import "server-only";
import { headers } from "next/headers";
import { prisma } from "./prisma";

// Ana domain (alt-alanlar bunun altında: <slug>.isimlistem.com)
export const ANA_DOMAIN = (process.env.ANA_DOMAIN ?? "isimlistem.com").toLowerCase();

/** Firma slug'ından tam alt-alan adresi üretir. */
export function altAlanUrl(slug: string): string {
  return `https://${slug}.${ANA_DOMAIN}`;
}

/** İstek host'undan alt-alanı çıkarır (yoksa null). www ve apex hariç. */
export async function hostAltAlan(): Promise<string | null> {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(":")[0].toLowerCase();
  const sonek = "." + ANA_DOMAIN;
  if (!host.endsWith(sonek)) return null;
  const sub = host.slice(0, -sonek.length);
  if (!sub || sub === "www") return null;
  return sub;
}

/** Geçerli host bir firma alt-alanına aitse o firmayı döner (yoksa null). */
export async function hostFirma() {
  const sub = await hostAltAlan();
  if (!sub) return null;
  const firma = await prisma.firma.findUnique({ where: { slug: sub } });
  if (!firma || firma.durum !== "AKTIF") return null;
  return firma;
}
