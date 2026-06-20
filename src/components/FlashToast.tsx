"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

function ToastIc() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [mesaj, setMesaj] = useState<string | null>(null);
  const [tip, setTip] = useState<"ok" | "err">("ok");

  useEffect(() => {
    const b = params.get("bildirim");
    if (!b) return;
    setMesaj(b);
    setTip(params.get("tip") === "err" ? "err" : "ok");
    // URL'den bildirim parametrelerini temizle
    const yeni = new URLSearchParams(params);
    yeni.delete("bildirim");
    yeni.delete("tip");
    const qs = yeni.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    const t = setTimeout(() => setMesaj(null), 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  if (!mesaj) return null;

  const ok = tip === "ok";
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 px-4">
      <div
        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-1 ${
          ok ? "bg-emerald-600 text-white ring-emerald-700/20" : "bg-rose-600 text-white ring-rose-700/20"
        }`}
        role="status"
      >
        {ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <span>{mesaj}</span>
        <button onClick={() => setMesaj(null)} className="ml-1 rounded p-0.5 hover:bg-white/20">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export default function FlashToast() {
  return (
    <Suspense fallback={null}>
      <ToastIc />
    </Suspense>
  );
}
