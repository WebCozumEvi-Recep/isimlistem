import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Native uygulama menüsünden çıkış için GET ucu (server action form'a alternatif).
export async function GET(req: Request) {
  await clearSession();
  return NextResponse.redirect(new URL("/auth/giris", req.url));
}
