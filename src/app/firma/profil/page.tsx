import { requireFirmaYonetici } from "@/lib/firma";
import { firmaProfilGuncelle } from "@/app/firma/actions";

export default async function FirmaProfil() {
  const { firma } = await requireFirmaYonetici();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Firma Profili</h1>
      <form action={firmaProfilGuncelle} className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <Alan label="Firma Adı" name="ad" deger={firma.ad} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Alan label="Logo URL" name="logoUrl" deger={firma.logoUrl ?? ""} />
          <Alan label="Ana Renk (ör: #4f46e5)" name="anaRenk" deger={firma.anaRenk ?? ""} />
          <Alan label="Web Sitesi" name="website" deger={firma.website ?? ""} />
          <Alan label="Telefon" name="telefon" deger={firma.telefon ?? ""} />
          <Alan label="WhatsApp Destek No" name="whatsapp" deger={firma.whatsapp ?? ""} />
        </div>
        <Alan label="Kısa Açıklama" name="aciklama" deger={firma.aciklama ?? ""} cokSatir />
        <Alan label="Footer Metni" name="footerMetni" deger={firma.footerMetni ?? ""} />
        <button className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700">
          Kaydet
        </button>
      </form>
    </div>
  );
}

function Alan({ label, name, deger, cokSatir }: { label: string; name: string; deger: string; cokSatir?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {cokSatir ? (
        <textarea name={name} defaultValue={deger} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      ) : (
        <input name={name} defaultValue={deger} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      )}
    </label>
  );
}
