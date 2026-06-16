import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { davetToken } from "@/server/token";

/** Türkçe karakterleri sadeleştirip URL-güvenli slug üretir. */
export function slugYap(ad: string): string {
  const tr: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };
  return ad
    .toLowerCase()
    .replace(/[çğıöşü]/g, (c) => tr[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function benzersizSlug(ad: string): Promise<string> {
  const taban = slugYap(ad) || "firma";
  let slug = taban;
  let i = 1;
  while (await prisma.firma.findUnique({ where: { slug } })) {
    slug = `${taban}-${i++}`;
  }
  return slug;
}

export function kayitKoduUret(): string {
  return davetToken(8);
}

/** Kullanıcının aktif firma üyeliğini döner (varsa). */
export async function firmaUyeligi(kullaniciId: string) {
  return prisma.firmaUye.findFirst({
    where: { kullaniciId, durum: "AKTIF" },
    include: { firma: true },
  });
}

/** Kullanıcının bir davet sayfasına erişim/düzenleme hakkı var mı?
 *  Kişisel sayfa → sahibi; firma sayfası → firmanın admin/içerik yöneticisi. */
export async function sayfaDuzenleyebilir(sayfaId: string, kullaniciId: string) {
  const sayfa = await prisma.davetSayfasi.findUnique({ where: { id: sayfaId } });
  if (!sayfa) return null;
  if (sayfa.sahiplik === "KISISEL" && sayfa.kullaniciId === kullaniciId) return sayfa;
  if (sayfa.sahiplik === "FIRMA" && sayfa.firmaId) {
    const uye = await prisma.firmaUye.findFirst({
      where: { firmaId: sayfa.firmaId, kullaniciId, durum: "AKTIF", rol: { in: ["FIRMA_ADMIN", "ICERIK_YONETICI"] } },
    });
    if (uye) return sayfa;
  }
  return null;
}

/** Firma paneline erişim: aktif üyelik + yönetim rolü gerekir. */
export async function requireFirmaYonetici() {
  const user = await requireUser();
  const uye = await firmaUyeligi(user.id);
  if (!uye || uye.firma.durum !== "AKTIF") redirect("/panel");
  const yonetici = uye.rol === "FIRMA_ADMIN" || uye.rol === "ICERIK_YONETICI" || uye.rol === "RAPOR_IZLEYICI";
  if (!yonetici) redirect("/panel");
  return { user, uye, firma: uye.firma };
}
