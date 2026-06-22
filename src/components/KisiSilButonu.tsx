"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

export default function KisiSilButonu({
  adSoyad,
  action,
}: {
  adSoyad: string;
  action: () => void | Promise<void>;
}) {
  const [acik, setAcik] = useState(false);
  const [siliniyor, setSiliniyor] = useState(false);

  return (
    <div className="mt-10 border-t border-[#EEF1F5] pt-6">
      <button
        onClick={() => setAcik(true)}
        className="flex items-center gap-1.5 text-[13px] font-bold text-rose-500 hover:text-rose-600"
      >
        <Trash2 size={15} /> Bu adayı sil
      </button>

      {acik && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={() => !siliniyor && setAcik(false)}>
          <div
            className="w-full max-w-sm rounded-t-[24px] bg-white p-5 shadow-2xl sm:rounded-[24px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[16px] font-extrabold text-[#0F1B2D]">Adayı sil</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[#5A6678]">
                  <b className="text-[#0F1B2D]">{adSoyad}</b> adlı aday; tüm mesajları, davet linkleri,
                  randevuları ve aktivite geçmişi ile birlikte kalıcı olarak silinecek.
                  Bu işlem geri alınamaz.
                </p>
              </div>
              <button onClick={() => setAcik(false)} disabled={siliniyor} className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#F4F6F9] text-[#5A6678] hover:bg-[#E9EDF2] disabled:opacity-50">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setAcik(false)}
                disabled={siliniyor}
                className="flex-1 rounded-xl border border-[#E4E9F0] bg-white py-3 text-[14px] font-bold text-[#3B4759] hover:bg-slate-50 disabled:opacity-50"
              >
                Vazgeç
              </button>
              <form
                action={action}
                onSubmit={() => setSiliniyor(true)}
                className="flex-1"
              >
                <button
                  disabled={siliniyor}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-3 text-[14px] font-bold text-white hover:bg-rose-700 disabled:opacity-70"
                >
                  {siliniyor ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  {siliniyor ? "Siliniyor…" : "Evet, sil"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
