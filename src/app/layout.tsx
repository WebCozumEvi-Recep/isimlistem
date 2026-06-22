import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist } from "next/font/google";
import "./globals.css";
import { getAyar } from "@/lib/ayarlar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const a = await getAyar();
  return {
    title: { default: `${a.siteAdi}${a.slogan ? " — " + a.slogan : ""}`, template: `%s · ${a.siteAdi}` },
    description: a.aciklama ?? "Networker’lar için aday takip ve kişiye özel davet sistemi.",
    icons: a.faviconUrl ? { icon: a.faviconUrl } : undefined,
    verification: a.googleDogrulama ? { google: a.googleDogrulama } : undefined,
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const a = await getAyar();
  // Analitik/tanıtım kodundaki <script> sarmalını kaldırıp içeriği çalıştır.
  const analitik = a.analitikKodu?.replace(/<\/?script[^>]*>/gi, "").trim();

  return (
    <html lang="tr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        {analitik ? (
          <Script id="site-analitik" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: analitik }} />
        ) : null}
      </body>
    </html>
  );
}
