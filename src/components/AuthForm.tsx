"use client";

import { useActionState } from "react";
import Link from "next/link";
import { girisYap, kayitOl, type FormDurum } from "@/app/auth/actions";

export default function AuthForm({ mod }: { mod: "giris" | "kayit" }) {
  const action = mod === "giris" ? girisYap : kayitOl;
  const [durum, formAction, bekliyor] = useActionState<FormDurum, FormData>(
    action,
    undefined
  );

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">
        {mod === "giris" ? "Giriş Yap" : "Hesap Oluştur"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        İsim Listem — iş sunum takip paneli
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        {mod === "kayit" && (
          <Alan label="Ad Soyad" name="adSoyad" type="text" />
        )}
        <Alan label="E-posta" name="email" type="email" />
        <Alan label="Parola" name="parola" type="password" />
        {mod === "kayit" && (
          <Alan label="Firma Kayıt Kodu (opsiyonel)" name="kayitKodu" type="text" zorunlu={false} />
        )}

        {durum?.hata && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {durum.hata}
          </p>
        )}

        <button
          type="submit"
          disabled={bekliyor}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {bekliyor ? "Lütfen bekleyin…" : mod === "giris" ? "Giriş Yap" : "Kayıt Ol"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {mod === "giris" ? (
          <>
            Hesabın yok mu?{" "}
            <Link href="/auth/kayit" className="font-medium text-indigo-600">
              Kayıt ol
            </Link>
          </>
        ) : (
          <>
            Zaten hesabın var mı?{" "}
            <Link href="/auth/giris" className="font-medium text-indigo-600">
              Giriş yap
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function Alan({ label, name, type, zorunlu = true }: { label: string; name: string; type: string; zorunlu?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required={zorunlu}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}
