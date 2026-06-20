import "server-only";
import { headers } from "next/headers";

// Native mobil uygulama (Expo WebView) user-agent'ına "IsimListemApp" imzası ekler.
// Bu imza varsa "uygulama modu": web sidebar/üst menü gizlenir, içerik tam ekran/mobil olur,
// navigasyon native tab bar'a bırakılır.
export async function isAppMode(): Promise<boolean> {
  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  return ua.includes("IsimListemApp");
}
