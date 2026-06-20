import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Native mobil uygulamanın tab bar rozetleri için sayılar:
// okunmamış bildirim, toplam aday, bekleyen randevu.
export async function GET() {
  const oturum = await getSession();
  if (!oturum) return NextResponse.json({ okunmamis: 0, aday: 0, bekleyenRandevu: 0 }, { status: 401 });

  const [okunmamis, aday, bekleyenRandevu] = await Promise.all([
    prisma.bildirim.count({ where: { kullaniciId: oturum.id, okundu: false } }),
    prisma.kisi.count({ where: { kullaniciId: oturum.id } }),
    prisma.randevuTalebi.count({ where: { kullaniciId: oturum.id, durum: "TALEP" } }),
  ]);
  return NextResponse.json({ okunmamis, aday, bekleyenRandevu });
}
