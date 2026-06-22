import "server-only";
import { prisma } from "@/lib/prisma";
import type { BildirimTip } from "@/generated/prisma/enums";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/** Europe/Istanbul'a göre şu anki saat (0-23). */
function trSaat(): number {
  const s = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", hour12: false }).format(new Date());
  return Number(s) % 24;
}

/** Sessiz saat aralığında mıyız? (bas..bit, gece sarması desteklenir) */
function sessizMi(bas: number | null, bit: number | null): boolean {
  if (bas == null || bit == null) return false;
  const s = trSaat();
  return bas < bit ? s >= bas && s < bit : s >= bas || s < bit;
}

/**
 * Kullanıcının mobil cihazlarına push bildirim gönderir.
 * Tercihlere göre filtreler: ana anahtar, önemli/tüm, sessiz saatler.
 * Hata fırlatmaz (best-effort) — bildirim akışını bozmaz.
 */
export async function pushGonder(
  kullaniciId: string,
  baslik: string,
  govde: string,
  tip: BildirimTip,
  veri?: Record<string, unknown>,
): Promise<void> {
  try {
    const kullanici = await prisma.kullanici.findUnique({
      where: { id: kullaniciId },
      select: { pushAcik: true, pushTipler: true, pushSessizBas: true, pushSessizBit: true, pushTokenlar: { select: { token: true } } },
    });
    if (!kullanici || !kullanici.pushAcik) return;
    if (!kullanici.pushTipler.includes(tip)) return;
    if (sessizMi(kullanici.pushSessizBas, kullanici.pushSessizBit)) return;

    const tokenlar = kullanici.pushTokenlar.map((t) => t.token).filter((t) => t.startsWith("ExponentPushToken"));
    if (tokenlar.length === 0) return;

    const mesajlar = tokenlar.map((to) => ({
      to,
      title: baslik,
      body: govde,
      sound: "default",
      priority: "high",
      ...(veri ? { data: veri } : {}),
    }));

    const r = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(mesajlar),
    });

    // Geçersiz (kayıtsız) cihaz token'larını temizle.
    if (r.ok) {
      const j = await r.json().catch(() => null);
      const data = j?.data;
      if (Array.isArray(data)) {
        const silinecek: string[] = [];
        data.forEach((d: { status?: string; details?: { error?: string } }, i: number) => {
          if (d?.status === "error" && d?.details?.error === "DeviceNotRegistered") silinecek.push(tokenlar[i]);
        });
        if (silinecek.length) await prisma.pushToken.deleteMany({ where: { token: { in: silinecek } } });
      }
    }
  } catch {
    /* sessiz — push başarısızlığı uygulama akışını etkilemesin */
  }
}
