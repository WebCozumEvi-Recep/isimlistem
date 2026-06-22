import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mobil uygulama açılışta Expo push token'ını buraya kaydeder.
export async function POST(req: Request) {
  const oturum = await getSession();
  if (!oturum) return NextResponse.json({ ok: false }, { status: 401 });

  const govde = await req.json().catch(() => null);
  const token = String(govde?.token ?? "").trim();
  const platform = govde?.platform ? String(govde.platform).slice(0, 16) : null;
  if (!token.startsWith("ExponentPushToken")) return NextResponse.json({ ok: false }, { status: 400 });

  // Aynı token başka kullanıcıdaysa bu kullanıcıya taşı (cihaz devri).
  await prisma.pushToken.upsert({
    where: { token },
    update: { kullaniciId: oturum.id, platform },
    create: { token, platform, kullaniciId: oturum.id },
  });

  return NextResponse.json({ ok: true });
}

// Çıkışta / kapatınca token'ı kaldırır.
export async function DELETE(req: Request) {
  const oturum = await getSession();
  if (!oturum) return NextResponse.json({ ok: false }, { status: 401 });
  const govde = await req.json().catch(() => null);
  const token = String(govde?.token ?? "").trim();
  if (token) await prisma.pushToken.deleteMany({ where: { token, kullaniciId: oturum.id } });
  return NextResponse.json({ ok: true });
}
