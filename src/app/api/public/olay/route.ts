import { NextRequest, NextResponse } from "next/server";
import { olayKaydet, type GelenOlay } from "@/server/olay";

export const runtime = "nodejs";

function ip(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function POST(req: NextRequest) {
  let body: Partial<GelenOlay>;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  if (!body.token || !body.sessionId || !body.olayTip) {
    return new NextResponse(null, { status: 204 });
  }

  const olay: GelenOlay = {
    token: String(body.token),
    sessionId: String(body.sessionId),
    olayTip: String(body.olayTip),
    olayDeger: body.olayDeger ?? null,
    modulId: body.modulId ?? null,
    videoYuzde: typeof body.videoYuzde === "number" ? body.videoYuzde : null,
    scrollYuzde: typeof body.scrollYuzde === "number" ? body.scrollYuzde : null,
    sayfadaSure: typeof body.sayfadaSure === "number" ? body.sayfadaSure : null,
  };

  try {
    await olayKaydet(olay, ip(req), req.headers.get("user-agent"));
  } catch (e) {
    console.error("olay kaydı hatası", e);
  }
  // Public uç: her durumda 204 (bilgi sızdırmaz, sendBeacon uyumlu)
  return new NextResponse(null, { status: 204 });
}
