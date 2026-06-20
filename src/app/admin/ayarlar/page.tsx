import Image from "next/image";
import { getAyar } from "@/lib/ayarlar";
import { ayarGuncelle } from "@/app/admin/actions";

export default async function SistemAyarlari() {
  const a = await getAyar();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Sistem Ayarları</h1>

      <form action={ayarGuncelle} className="space-y-6">
        {/* Genel */}
        <Kart baslik="Genel">
          <Alan label="Site Adı" name="siteAdi" deger={a.siteAdi} />
          <Alan label="Slogan" name="slogan" deger={a.slogan ?? ""} />
          <Alan label="Meta Açıklama (SEO)" name="aciklama" deger={a.aciklama ?? ""} cokSatir />
          <Alan label="İletişim / Destek E-posta (sitede gösterilir, form bildirimleri buraya gelir)" name="destekEmail" deger={a.destekEmail ?? ""} />
        </Kart>

        {/* E-posta Gönderimi (SMTP) */}
        <Kart baslik="E-posta Gönderimi (SMTP)">
          <p className="text-xs text-slate-400">
            Talep formu bildirimleri ve otomatik yanıt e-postaları bu hesap üzerinden gönderilir. Boş bırakılırsa e-posta gönderilmez.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Alan label="SMTP Sunucu (host)" name="smtpHost" deger={a.smtpHost ?? ""} />
            <Alan label="Port (465 SSL / 587 TLS)" name="smtpPort" deger={a.smtpPort?.toString() ?? ""} />
            <Alan label="Kullanıcı Adı" name="smtpKullanici" deger={a.smtpKullanici ?? ""} />
            <Alan label="Parola" name="smtpParola" deger={a.smtpParola ?? ""} sifre />
            <Alan label="Gönderen Adı (ör. İsim Listem)" name="smtpGonderenAd" deger={a.smtpGonderenAd ?? ""} />
            <Alan label="Gönderen E-posta (from)" name="smtpGonderen" deger={a.smtpGonderen ?? ""} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="smtpGuvenli" defaultChecked={a.smtpGuvenli ?? false} className="h-4 w-4 rounded border-slate-300" />
            SSL kullan (port 465). İşaretsizse STARTTLS (port 587) kullanılır.
          </label>
        </Kart>

        {/* Logo / Favicon */}
        <Kart baslik="Logo & Favicon">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <span className="mb-2 block text-sm font-medium text-slate-700">Logo</span>
              {a.logoUrl && <Image src={a.logoUrl} alt="logo" width={180} height={48} className="mb-2 h-12 w-auto object-contain" unoptimized />}
              <input type="file" name="logoDosya" accept="image/*" className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium" />
              <input name="logoUrl" defaultValue={a.logoUrl ?? ""} placeholder="veya logo URL" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium text-slate-700">Favicon</span>
              {a.faviconUrl && <Image src={a.faviconUrl} alt="favicon" width={40} height={40} className="mb-2 h-10 w-10 object-contain" unoptimized />}
              <input type="file" name="faviconDosya" accept="image/*" className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium" />
              <input name="faviconUrl" defaultValue={a.faviconUrl ?? ""} placeholder="veya favicon URL" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
        </Kart>

        {/* Kodlar */}
        <Kart baslik="Doğrulama & Tanıtım Kodları">
          <Alan label="Google Site Doğrulama (content değeri)" name="googleDogrulama" deger={a.googleDogrulama ?? ""} />
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Analitik / Reklam Kodları (head içine eklenir — GA, GTM, Meta Pixel JS)</span>
            <textarea name="analitikKodu" defaultValue={a.analitikKodu ?? ""} rows={5} placeholder="<script>...</script>" className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs" />
            <p className="mt-1 text-xs text-slate-400">Yalnızca güvendiğiniz kodları ekleyin; bu kod tüm sayfaların head bölümüne yerleştirilir.</p>
          </div>
        </Kart>

        {/* Sözleşmeler */}
        <Kart baslik="Sözleşme / Yasal Sayfa İçerikleri">
          <p className="text-xs text-slate-400">Boş bırakılan alanlarda varsayılan metin gösterilir. Her satır ayrı paragraf olur.</p>
          <Alan label="KVKK Aydınlatma Metni" name="kvkkMetni" deger={a.kvkkMetni ?? ""} cokSatir buyuk />
          <Alan label="Gizlilik Politikası" name="gizlilikMetni" deger={a.gizlilikMetni ?? ""} cokSatir buyuk />
          <Alan label="Çerez Politikası" name="cerezMetni" deger={a.cerezMetni ?? ""} cokSatir buyuk />
          <Alan label="Kullanım Koşulları" name="kullanimMetni" deger={a.kullanimMetni ?? ""} cokSatir buyuk />
          <Alan label="Üyelik Sözleşmesi" name="uyelikMetni" deger={a.uyelikMetni ?? ""} cokSatir buyuk />
          <Alan label="Mesafeli Satış Sözleşmesi" name="mesafeliMetni" deger={a.mesafeliMetni ?? ""} cokSatir buyuk />
        </Kart>

        <button className="rounded-xl bg-emerald-500 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-emerald-600">
          Ayarları Kaydet
        </button>
      </form>
    </div>
  );
}

function Kart({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">{baslik}</h2>
      {children}
    </div>
  );
}

function Alan({ label, name, deger, cokSatir, buyuk, sifre }: { label: string; name: string; deger: string; cokSatir?: boolean; buyuk?: boolean; sifre?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {cokSatir ? (
        <textarea name={name} defaultValue={deger} rows={buyuk ? 5 : 2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      ) : (
        <input name={name} type={sifre ? "password" : "text"} defaultValue={deger} autoComplete={sifre ? "new-password" : undefined} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      )}
    </label>
  );
}
