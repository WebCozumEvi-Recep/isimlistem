import Link from "next/link";
import { MessageCircle, Link2, Eye, ArrowLeft } from "lucide-react";
import { getAyar } from "@/lib/ayarlar";
import { hostFirma } from "@/lib/host";

/** Auth ekranları için markalı iki kolonlu kabuk (mobilde tek kolon). */
export default async function AuthKabuk({ children }: { children: React.ReactNode }) {
  const [ayar, firma] = await Promise.all([getAyar(), hostFirma()]);
  // Firma alt-alanındaysak firma markasını öne çıkar.
  const logoUrl = firma?.logoUrl ?? ayar.logoUrl;
  const marka = firma?.ad ?? ayar.siteAdi;
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Sol marka paneli */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="anim-blob absolute -left-10 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="anim-blob absolute bottom-10 right-0 h-80 w-80 rounded-full bg-white/10 blur-3xl [animation-delay:5s]" />
        </div>
        <Link href="/" className="relative flex items-center gap-2 text-xl font-bold">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={marka} className="h-10 w-auto max-w-[200px] rounded-lg bg-white/95 px-3 py-1.5 object-contain" />
          ) : (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">{marka.charAt(0)}</span>
              {marka}
            </>
          )}
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-snug">
            Adayını ekle, davet gönder,<br />ne yaptığını gör.
          </h2>
          <ul className="mt-8 space-y-4 text-slate-300">
            <li className="flex items-center gap-3"><MessageCircle size={20} /> WhatsApp&apos;tan kişiye özel davet</li>
            <li className="flex items-center gap-3"><Link2 size={20} /> Her adaya özel takip linki</li>
            <li className="flex items-center gap-3"><Eye size={20} /> Canlı davranış ve skor takibi</li>
          </ul>
        </div>
        <p className="relative text-sm text-slate-400">Bireysel kullanım tamamen ücretsiz.</p>
      </div>

      {/* Sağ form */}
      <div className="relative flex items-center justify-center bg-slate-50 px-4 py-12">
        <Link href="/" className="absolute left-4 top-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft size={16} /> Ana sayfa
        </Link>
        <div className="anim-fade-up w-full max-w-sm">
          {firma && (
            <div className="mb-6 flex flex-col items-center gap-2 text-center">
              {firma.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={firma.logoUrl} alt={firma.ad} className="h-12 w-auto max-w-[180px] object-contain" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700">{firma.ad.charAt(0)}</span>
              )}
              <p className="text-sm text-slate-500"><span className="font-semibold text-slate-700">{firma.ad}</span> ekibine katıl</p>
            </div>
          )}
          {children}
        </div>
      </div>
    </main>
  );
}
