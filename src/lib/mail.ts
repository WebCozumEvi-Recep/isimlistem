import "server-only";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

type MailGonder = {
  kime: string | string[];
  konu: string;
  html: string;
  yanitla?: string; // reply-to
};

/** Site ayarlarından SMTP transport oluşturur. Ayar eksikse null döner. */
async function transportOlustur() {
  const a = await prisma.siteAyar.findUnique({ where: { id: "default" } });
  if (!a?.smtpHost || !a.smtpKullanici || !a.smtpParola) return null;

  const port = a.smtpPort ?? (a.smtpGuvenli ? 465 : 587);
  const transport = nodemailer.createTransport({
    host: a.smtpHost,
    port,
    secure: a.smtpGuvenli ?? port === 465,
    auth: { user: a.smtpKullanici, pass: a.smtpParola },
  });

  const gonderen = a.smtpGonderen ?? a.smtpKullanici;
  const gonderenAd = a.smtpGonderenAd ?? a.siteAdi ?? "İsim Listem";
  return { transport, from: `"${gonderenAd}" <${gonderen}>`, ayar: a };
}

/** E-posta gönderir. SMTP yapılandırılmamışsa sessizce false döner (hata fırlatmaz). */
export async function mailGonder({ kime, konu, html, yanitla }: MailGonder): Promise<boolean> {
  try {
    const t = await transportOlustur();
    if (!t) {
      console.warn("[mail] SMTP yapılandırılmamış, e-posta gönderilemedi.");
      return false;
    }
    await t.transport.sendMail({
      from: t.from,
      to: Array.isArray(kime) ? kime.join(", ") : kime,
      subject: konu,
      html,
      replyTo: yanitla,
    });
    return true;
  } catch (e) {
    console.error("[mail] gönderim hatası:", e);
    return false;
  }
}

/** Kurumsal e-posta şablonu. İçerik satırlarını şık bir HTML çerçeveye sarar. */
export function mailSablon(opts: {
  siteAdi: string;
  logoUrl?: string | null;
  baslik: string;
  selamlama?: string;
  govde: string; // HTML
  butonMetni?: string;
  butonUrl?: string;
  altNot?: string;
}): string {
  const { siteAdi, logoUrl, baslik, selamlama, govde, butonMetni, butonUrl, altNot } = opts;
  const yil = new Date().getFullYear();
  const marka = "#0b1c30";
  const yesil = "#22c55e";

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:${marka};padding:28px 32px;text-align:center;">
          ${logoUrl
            ? `<img src="${logoUrl}" alt="${siteAdi}" style="max-height:40px;max-width:200px;height:auto;">`
            : `<span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">${siteAdi}</span>`}
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 32px;">
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${marka};font-weight:700;">${baslik}</h1>
          ${selamlama ? `<p style="margin:0 0 16px;font-size:15px;color:#334155;">${selamlama}</p>` : ""}
          <div style="font-size:15px;line-height:1.6;color:#475569;">${govde}</div>
          ${butonMetni && butonUrl
            ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;"><tr><td style="border-radius:10px;background:${yesil};">
                 <a href="${butonUrl}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${butonMetni}</a>
               </td></tr></table>`
            : ""}
          ${altNot ? `<p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">${altNot}</p>` : ""}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">© ${yil} ${siteAdi}. Tüm hakları saklıdır.</p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:#cbd5e1;">Bu e-posta isimlistem.com üzerinden gönderilmiştir.</p>
    </td></tr>
  </table>
</body>
</html>`;
}
