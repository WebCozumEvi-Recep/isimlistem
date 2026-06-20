import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { firmaGuncelle, kayitKoduYenile } from "@/app/admin/actions";
import { altAlanUrl, ANA_DOMAIN } from "@/lib/host";
import LogoSecici from "@/components/LogoSecici";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";

export default async function FirmaDuzenle({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const firma = await prisma.firma.findUnique({
    where: { id },
    include: { _count: { select: { uyeler: true } } },
  });
  if (!firma) notFound();

  const action = firmaGuncelle.bind(null, firma.id);

  return (
    <div className="space-y-6">
      <Link href="/admin/firmalar" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} /> Firmalar
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{firma.ad} — Düzenle</h1>
        <a href={altAlanUrl(firma.slug)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:underline">
          <ExternalLink size={14} /> {firma.slug}.{ANA_DOMAIN}
        </a>
      </div>

      <form id="kayitKoduForm" action={kayitKoduYenile.bind(null, firma.id)} className="hidden" />

      <form action={action} className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-600">Logo</span>
          <LogoSecici baslangic={firma.logoUrl} />
          <p className="mt-1.5 text-xs text-slate-400">Bu logo firmanın kayıt/giriş alt-alan sayfasında köşede gösterilir.</p>
        </div>
        <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <Alan label="Firma Adı *" name="ad" deger={firma.ad} />
          <Alan label="Slug (URL)" name="slug" deger={firma.slug} />
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-600">Paket</span>
            <select name="paket" defaultValue={firma.paket} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="FREE">FREE</option>
              <option value="BUSINESS">BUSINESS</option>
              <option value="BUSINESS_PLUS">BUSINESS_PLUS</option>
            </select>
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-600">Durum</span>
            <select name="durum" defaultValue={firma.durum} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="AKTIF">Aktif</option>
              <option value="PASIF">Pasif</option>
              <option value="ASKIDA">Askıda</option>
            </select>
          </div>
          <Alan label="Networker Limiti (boş = sınırsız)" name="networkerLimiti" deger={firma.networkerLimiti?.toString() ?? ""} type="number" />
          <Alan label="Web Sitesi" name="website" deger={firma.website ?? ""} />
          <Alan label="Telefon" name="telefon" deger={firma.telefon ?? ""} />
          <Alan label="WhatsApp" name="whatsapp" deger={firma.whatsapp ?? ""} />
        </div>
        <Alan label="Açıklama" name="aciklama" deger={firma.aciklama ?? ""} cokSatir />

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-xs text-slate-400">
          <span>Kayıt kodu: <code className="font-mono text-emerald-700">{firma.kayitKodu}</code></span>
          <button
            type="submit"
            form="kayitKoduForm"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={12} /> Yenile
          </button>
          <span>·</span>
          <span>{firma._count.uyeler} üye</span>
        </div>

        <div className="flex gap-2">
          <button className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Kaydet</button>
          <Link href="/admin/firmalar" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Vazgeç</Link>
        </div>
      </form>
    </div>
  );
}

function Alan({ label, name, deger, type, cokSatir }: { label: string; name: string; deger: string; type?: string; cokSatir?: boolean }) {
  return (
    <label className={cokSatir ? "block" : ""}>
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      {cokSatir ? (
        <textarea name={name} defaultValue={deger} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      ) : (
        <input name={name} type={type ?? "text"} defaultValue={deger} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      )}
    </label>
  );
}
