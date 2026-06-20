import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Native mobil uygulamanın tab bar rozeti için okunmamış bildirim sayısı.
export async function GET() {
  const oturum = await getSession();
  if (!oturum) return NextResponse.json({ okunmamis: 0 }, { status: 401 });

  const okunmamis = await prisma.bildirim.count({
    where: { kullaniciId: oturum.id, okundu: false },
  });
  return NextResponse.json({ okunmamis });
}
