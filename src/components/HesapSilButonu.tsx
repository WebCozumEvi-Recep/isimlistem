"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { hesabiSil } from "@/app/panel/profil/actions";

export default function HesapSilButonu() {
  const [acik, setAcik] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="rounded-[13px] border border-rose-200 bg-rose-50 px-5 py-2.5 text-[13.5px] font-bold text-rose-600 transition active:scale-[.97] hover:bg-rose-100"
      >
        Hesabımı Sil
      </button>

      {acik &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => !gonderiliyor && setAcik(false)}>
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-[17px] font-extrabold text-[#0F1B2D]">Hesabını silmek istediğine emin misin?</h3>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-[#6B7688]">
                Hesabın silinecek ve bir daha giriş yapamayacaksın. Bu işlem geri alınamaz.
              </p>
              <form
                action={hesabiSil}
                onSubmit={() => setGonderiliyor(true)}
                className="mt-5 flex items-center justify-end gap-2.5"
              >
                <button
                  type="button"
                  onClick={() => setAcik(false)}
                  disabled={gonderiliyor}
                  className="rounded-xl px-4 py-2.5 text-[13.5px] font-bold text-[#6B7688] transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={gonderiliyor}
                  className="rounded-xl bg-rose-600 px-5 py-2.5 text-[13.5px] font-bold text-white transition active:scale-[.97] hover:bg-rose-700 disabled:opacity-60"
                >
                  {gonderiliyor ? "Siliniyor…" : "Evet, hesabımı sil"}
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
