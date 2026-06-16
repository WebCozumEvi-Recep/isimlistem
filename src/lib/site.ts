import "server-only";
import { headers } from "next/headers";

/** İstek başlıklarından mutlak site kökünü üretir (proxy arkasında doğru çalışır). */
export async function siteKoku(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function davetUrl(token: string): Promise<string> {
  return `${await siteKoku()}/d/${token}`;
}
