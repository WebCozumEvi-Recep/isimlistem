import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { firmaUyeligi } from "@/lib/firma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Native mobil uygulamanın tab bar rozetleri + menüsü için:
// okunmamış bildirim, toplam aday, bekleyen randevu sayıları ve rol bilgisi.
export async function GET() {
  const oturum = await getSession();
  if (!oturum) {
    return NextResponse.json(
      { okunmamis: 0, aday: 0, bekleyenRandevu: 0, firmaYonetici: false, admin: false },
      { status: 401 }
    );
  }

  const [okunmamis, aday, bekleyenRandevu, uyelik] = await Promise.all([
    prisma.bildirim.count({ where: { kullaniciId: oturum.id, okundu: false } }),
    prisma.kisi.count({ where: { kullaniciId: oturum.id } }),
    prisma.randevuTalebi.count({ where: { kullaniciId: oturum.id, durum: "TALEP" } }),
    firmaUyeligi(oturum.id),
  ]);
  const firmaYonetici = !!uyelik && ["FIRMA_ADMIN", "ICERIK_YONETICI", "RAPOR_IZLEYICI"].includes(uyelik.rol);

  return NextResponse.json({
    okunmamis,
    aday,
    bekleyenRandevu,
    firmaYonetici,
    admin: oturum.rol === "ADMIN",
  });
}
