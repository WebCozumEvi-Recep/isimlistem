import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: {
    tip?: string;
    adSoyad?: string;
    firma?: string;
    email?: string;
    telefon?: string;
    mesaj?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, hata: "Geçersiz istek." }, { status: 400 });
  }

  const adSoyad = String(body.adSoyad ?? "").trim();
  const email = String(body.email ?? "").trim();
  if (!adSoyad || !email) {
    return NextResponse.json({ ok: false, hata: "Ad soyad ve e-posta zorunludur." }, { status: 400 });
  }

  const tip = body.tip === "KURUMSAL" ? "KURUMSAL" : "DEMO";

  await prisma.talepFormu.create({
    data: {
      tip,
      adSoyad,
      email,
      firma: body.firma?.trim() || null,
      telefon: body.telefon?.trim() || null,
      mesaj: body.mesaj?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true });
}
