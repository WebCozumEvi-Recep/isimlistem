"use client";

import { useActionState } from "react";
import Link from "next/link";
import { sifreSifirlamaIste, type SifirlamaDurum } from "@/app/auth/actions";

export default function SifremiUnuttumForm() {
  const [durum, formAction, bekliyor] = useActionState<SifirlamaDurum, FormData>(sifreSifirlamaIste, undefined);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Şifremi unuttum</h1>
      <p className="mt-1 text-sm text-slate-500">
        Kayıtlı e-posta adresini gir; sana parola sıfırlama bağlantısı gönderelim.
      </p>

      {durum?.basari ? (
        <div className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{durum.basari}</div>
      ) : (
        <form action={formAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">E-posta</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          {durum?.hata && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{durum.hata}</p>}

          <button
            type="submit"
            disabled={bekliyor}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-xl disabled:opacity-60"
          >
            {bekliyor ? "Gönderiliyor…" : "Sıfırlama bağlantısı gönder"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/auth/giris" className="font-medium text-emerald-600">← Giriş sayfasına dön</Link>
      </p>
    </div>
  );
}
