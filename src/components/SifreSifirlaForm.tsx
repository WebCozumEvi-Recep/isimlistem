"use client";

import { useActionState } from "react";
import Link from "next/link";
import { sifreSifirla, type SifirlamaDurum } from "@/app/auth/actions";
import ParolaAlani from "@/components/ParolaAlani";

export default function SifreSifirlaForm({ token }: { token: string }) {
  const [durum, formAction, bekliyor] = useActionState<SifirlamaDurum, FormData>(sifreSifirla, undefined);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Yeni parola belirle</h1>
      <p className="mt-1 text-sm text-slate-500">Hesabın için yeni bir parola gir.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />
        <ParolaAlani label="Yeni parola" name="parola" autoComplete="new-password" />
        <ParolaAlani label="Yeni parola (tekrar)" name="parola2" autoComplete="new-password" />

        {durum?.hata && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{durum.hata}</p>}

        <button
          type="submit"
          disabled={bekliyor}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-xl disabled:opacity-60"
        >
          {bekliyor ? "Kaydediliyor…" : "Parolayı güncelle"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/auth/giris" className="font-medium text-emerald-600">← Giriş sayfasına dön</Link>
      </p>
    </div>
  );
}
