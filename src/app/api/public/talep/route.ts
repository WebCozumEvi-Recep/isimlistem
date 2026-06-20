import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mailGonder, mailSablon } from "@/lib/mail";

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
  const firma = body.firma?.trim() || null;
  const telefon = body.telefon?.trim() || null;
  const mesaj = body.mesaj?.trim() || null;

  await prisma.talepFormu.create({
    data: { tip, adSoyad, email, firma, telefon, mesaj },
  });

  // E-postaları gönder (SMTP yapılandırılmışsa). Gönderim hatası talebi engellemez.
  const ayar = await prisma.siteAyar.findUnique({ where: { id: "default" } });
  const siteAdi = ayar?.siteAdi ?? "İsim Listem";
  // E-posta başlığı koyu zeminli; varsa beyaz logoyu kullan, yoksa normal logoya düş.
  const logoUrl = ayar?.logoBeyazUrl ?? ayar?.logoUrl ?? null;
  const tipEtiket = tip === "KURUMSAL" ? "Kurumsal İletişim" : "Business Demo";

  // 1) Başvurana otomatik onay
  void mailGonder({
    kime: email,
    konu: `${siteAdi} — Talebiniz alındı`,
    html: mailSablon({
      siteAdi,
      logoUrl,
      baslik: "Talebiniz bize ulaştı 🎉",
      selamlama: `Merhaba ${adSoyad},`,
      govde: `<p style="margin:0 0 12px;"><strong>${tipEtiket}</strong> talebiniz başarıyla alındı. Ekibimiz en kısa sürede sizinle iletişime geçecek.</p>
              <p style="margin:0;">Bu süreçte herhangi bir sorunuz olursa bu e-postayı yanıtlamanız yeterli.</p>`,
      altNot: "Bu talebi siz oluşturmadıysanız bu e-postayı dikkate almayabilirsiniz.",
    }),
  });

  // 2) Yöneticiye bildirim
  const bildirimAdres = ayar?.destekEmail;
  if (bildirimAdres) {
    const satir = (etiket: string, deger: string) =>
      `<tr><td style="padding:6px 0;color:#94a3b8;width:120px;">${etiket}</td><td style="padding:6px 0;color:#334155;font-weight:600;">${deger}</td></tr>`;
    void mailGonder({
      kime: bildirimAdres,
      yanitla: email,
      konu: `Yeni ${tipEtiket} talebi — ${adSoyad}`,
      html: mailSablon({
        siteAdi,
        logoUrl,
        baslik: `Yeni ${tipEtiket} talebi`,
        govde: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;">
                  ${satir("Ad Soyad", adSoyad)}
                  ${firma ? satir("Firma", firma) : ""}
                  ${satir("E-posta", email)}
                  ${telefon ? satir("Telefon", telefon) : ""}
                  ${mesaj ? satir("Mesaj", mesaj) : ""}
                </table>`,
        butonMetni: "Panelde Görüntüle",
        butonUrl: "https://isimlistem.com/admin/talepler",
        altNot: "Bu bildirim talep formundan otomatik oluşturuldu.",
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
