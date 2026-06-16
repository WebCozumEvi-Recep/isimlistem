import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { olayKaydet } from "@/server/olay";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  let body: { tarihMetni?: string; tip?: string; mesaj?: string; sessionId?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* boş gövde olabilir */
  }

  const link = await prisma.davetLinki.findUnique({ where: { token } });
  if (!link) return new NextResponse(null, { status: 204 });

  await prisma.randevuTalebi.create({
    data: {
      kullaniciId: link.kullaniciId,
      kisiId: link.kisiId,
      linkId: link.id,
      tarihMetni: body.tarihMetni ?? null,
      tip: (["TELEFON", "WHATSAPP", "ZOOM", "YUZ_YUZE", "OFIS", "DIGER"].includes(String(body.tip)) ? body.tip : "WHATSAPP") as never,
      mesaj: body.mesaj ?? null,
    },
  });

  await prisma.davetLinki.update({ where: { id: link.id }, data: { durum: "RANDEVU_ISTEDI" } });

  // Skor/durum/bildirim için olay olarak da kaydet
  await olayKaydet(
    { token, sessionId: body.sessionId ?? "randevu", olayTip: "appointment_requested" },
    req.headers.get("x-forwarded-for")?.split(",")[0] ?? null,
    req.headers.get("user-agent")
  );

  return NextResponse.json({ ok: true });
}
