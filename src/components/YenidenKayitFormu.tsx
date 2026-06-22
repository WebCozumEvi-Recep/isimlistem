"use client";

import { useState } from "react";
import { Info, UserPlus, Loader2 } from "lucide-react";
import { silinmisDavetKayit } from "@/app/d/actions";

export default function YenidenKayitFormu({
  token,
  eskiAdSoyad,
  eskiTelefon,
  hata,
}: {
  token: string;
  eskiAdSoyad?: string | null;
  eskiTelefon?: string | null;
  hata?: boolean;
}) {
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const action = silinmisDavetKayit.bind(null, token);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-teal-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg shadow-emerald-100 sm:p-7">
        {/* Üst bilgilendirme */}
        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
          <Info size={20} className="mt-0.5 flex-none text-emerald-600" />
          <p className="text-sm leading-relaxed">
            Bu davet bağlantısı güncellenmiş. Tekrar iletişime geçilebilmesi için lütfen
            <b> adınızı ve telefon numaranızı</b> bırakın; daveti gönderen kişi sizinle
            yeniden iletişime geçecektir.
          </p>
        </div>

        <h1 className="text-xl font-bold text-slate-900">Bilgilerinizi bırakın</h1>
        <p className="mt-1 text-sm text-slate-500">İletişim bilgileriniz yalnızca daveti gönderen kişiyle paylaşılır.</p>

        {hata && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            Lütfen ad soyad ve telefon alanlarını doldurun.
          </p>
        )}

        <form action={action} onSubmit={() => setGonderiliyor(true)} className="mt-5 space-y-3">
          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-[#3B4759]">Ad Soyad</label>
            <input
              name="adSoyad"
              required
              defaultValue={eskiAdSoyad ?? ""}
              placeholder="Adınız Soyadınız"
              className="w-full rounded-xl border border-[#E4E9F0] bg-[#F7F9FB] px-4 py-3 text-sm outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-[#3B4759]">Telefon</label>
            <input
              name="telefon"
              required
              type="tel"
              defaultValue={eskiTelefon ?? ""}
              placeholder="05XX XXX XX XX"
              className="w-full rounded-xl border border-[#E4E9F0] bg-[#F7F9FB] px-4 py-3 text-sm outline-none focus:border-emerald-400"
            />
          </div>
          <button
            disabled={gonderiliyor}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1FB46A] to-[#0E8A4D] py-3.5 text-[15px] font-bold text-white shadow-md disabled:opacity-70"
          >
            {gonderiliyor ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            {gonderiliyor ? "Gönderiliyor…" : "Bilgilerimi gönder"}
          </button>
        </form>
      </div>
    </div>
  );
}
