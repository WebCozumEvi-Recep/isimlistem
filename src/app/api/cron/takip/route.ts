import { NextRequest, NextResponse } from "next/server";
import { takipTara } from "@/server/takip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Davet takip hatırlatmalarını işler. Günde bir çalışacak şekilde planlanır
 * (vercel.json cron). CRON_SECRET tanımlıysa Authorization: Bearer ile korunur.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new NextResponse("Yetkisiz", { status: 401 });
    }
  }
  try {
    const sonuc = await takipTara();
    return NextResponse.json({ ok: true, ...sonuc });
  } catch (e) {
    console.error("takip cron hatası", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
