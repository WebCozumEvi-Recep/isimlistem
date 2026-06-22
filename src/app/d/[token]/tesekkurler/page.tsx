import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function TesekkurlerSayfasi() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-teal-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg shadow-emerald-100">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={34} />
        </span>
        <h1 className="text-xl font-bold text-slate-900">Teşekkürler!</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Bilgileriniz alındı. Daveti gönderen kişi en kısa sürede sizinle iletişime geçecek.
        </p>
      </div>
    </div>
  );
}
