import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TURLER: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  gif: "image/gif", svg: "image/svg+xml", ico: "image/x-icon",
};

// Yüklenen marka görsellerini diskten sunar (build'den bağımsız, kalıcı).
export async function GET(_req: NextRequest, ctx: { params: Promise<{ ad: string }> }) {
  const { ad } = await ctx.params;
  const guvenli = path.basename(ad); // path traversal koruması
  const uzanti = guvenli.split(".").pop()?.toLowerCase() ?? "";
  if (!TURLER[uzanti]) return new NextResponse("Bulunamadı", { status: 404 });

  try {
    const dosya = await readFile(path.join(process.cwd(), "public", "marka", guvenli));
    return new NextResponse(new Uint8Array(dosya), {
      headers: { "Content-Type": TURLER[uzanti], "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new NextResponse("Bulunamadı", { status: 404 });
  }
}
