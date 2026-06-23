"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, Loader2 } from "lucide-react";
import { cikisYap } from "@/app/auth/actions";

/**
 * Çıkış tetikleyici + onay modalı. Tetikleyicinin görünümü `className`/`children`
 * ile dışarıdan verilir (header'da ikon, sidebar'da etiketli satır vb.).
 */
export default function CikisButonu({
  className,
  children,
  ariaLabel = "Çıkış",
}: {
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const [acik, setAcik] = useState(false);
  const [cikiliyor, setCikiliyor] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setAcik(true)} aria-label={ariaLabel} className={className}>
        {children}
      </button>

      {acik && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
          onClick={() => !cikiliyor && setAcik(false)}
        >
          <div
            className="w-full max-w-sm rounded-[24px] bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <LogOut size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[16px] font-extrabold text-[#0F1B2D]">Çıkış yap</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[#5A6678]">
                  Hesabından çıkış yapmak istediğine emin misin? Tekrar girmek için
                  e-posta ve şifrenle giriş yapman gerekir.
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setAcik(false)}
                disabled={cikiliyor}
                className="flex-1 rounded-xl border border-[#E4E9F0] bg-white py-3 text-[14px] font-bold text-[#3B4759] hover:bg-slate-50 disabled:opacity-50"
              >
                Vazgeç
              </button>
              <form action={cikisYap} onSubmit={() => setCikiliyor(true)} className="flex-1">
                <button
                  disabled={cikiliyor}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-3 text-[14px] font-bold text-white hover:bg-rose-700 disabled:opacity-70"
                >
                  {cikiliyor ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  {cikiliyor ? "Çıkılıyor…" : "Çıkış Yap"}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
