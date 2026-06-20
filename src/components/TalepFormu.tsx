"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Tip = "DEMO" | "KURUMSAL";

export default function TalepFormu({
  tip,
  etiket,
  className,
}: {
  tip: Tip;
  etiket: string;
  className?: string;
}) {
  const [acik, setAcik] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [bitti, setBitti] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const baslik = tip === "KURUMSAL" ? "Kurumsal İletişim Talebi" : "Business Demo Talebi";

  async function gonder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGonderiliyor(true);
    setHata(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/public/talep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tip,
        adSoyad: fd.get("adSoyad"),
        firma: fd.get("firma"),
        email: fd.get("email"),
        telefon: fd.get("telefon"),
        mesaj: fd.get("mesaj"),
      }),
    });
    setGonderiliyor(false);
    if (res.ok) {
      setBitti(true);
    } else {
      const j = await res.json().catch(() => ({}));
      setHata(j?.hata ?? "Bir hata oluştu, lütfen tekrar deneyin.");
    }
  }

  function kapat() {
    setAcik(false);
    // Modal kapanış animasyonu yok; durumu sıfırla
    setTimeout(() => {
      setBitti(false);
      setHata(null);
    }, 200);
  }

  return (
    <>
      <button type="button" onClick={() => setAcik(true)} className={className}>
        {etiket}
      </button>

      {acik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={kapat} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-2xl">
            <button
              type="button"
              onClick={kapat}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            {bitti ? (
              <div className="py-6 text-center">
                <h3 className="text-xl font-bold text-[#0b1c30]">Teşekkürler! 🎉</h3>
                <p className="mt-2 text-slate-600">
                  Talebiniz bize ulaştı. Ekibimiz en kısa sürede sizinle iletişime geçecek.
                </p>
                <button
                  type="button"
                  onClick={kapat}
                  className="mt-6 rounded-lg bg-green-500 px-6 py-2.5 font-semibold text-white transition hover:bg-green-600"
                >
                  Kapat
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-[#0b1c30]">{baslik}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Bilgilerinizi bırakın, en kısa sürede size dönelim.
                </p>
                <form onSubmit={gonder} className="mt-5 space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">Ad Soyad *</span>
                    <input
                      name="adSoyad"
                      required
                      placeholder="Adınız Soyadınız"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">Firma / Ekip Adı</span>
                    <input
                      name="firma"
                      placeholder="Şirket veya ekip adı"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">E-posta *</span>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="ornek@firma.com"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">Telefon</span>
                    <input
                      name="telefon"
                      placeholder="05xx xxx xx xx"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">Mesajınız</span>
                    <textarea
                      name="mesaj"
                      rows={3}
                      placeholder="İhtiyacınızı kısaca yazabilirsiniz (opsiyonel)"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none"
                    />
                  </label>
                  {hata && <p className="text-sm text-rose-600">{hata}</p>}
                  <button
                    type="submit"
                    disabled={gonderiliyor}
                    className="w-full rounded-lg bg-green-500 py-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
                  >
                    {gonderiliyor ? "Gönderiliyor..." : "Talebi Gönder"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
