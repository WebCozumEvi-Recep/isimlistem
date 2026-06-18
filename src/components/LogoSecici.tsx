"use client";

import { useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { medyaYukle } from "@/app/panel/davet-actions";

/** Logo yükleme alanı: canlı önizleme + gizli input. */
export default function LogoSecici({ baslangic, name = "logoUrl" }: { baslangic?: string | null; name?: string }) {
  const [url, setUrl] = useState(baslangic ?? "");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function sec(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;
    setYukleniyor(true);
    const fd = new FormData();
    fd.append("dosya", dosya);
    const { url: yeni } = await medyaYukle(fd);
    setYukleniyor(false);
    if (yeni) setUrl(yeni);
    e.target.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      <input type="hidden" name={name} value={url} />
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-16 w-28 rounded-lg border border-slate-200 bg-white object-contain p-1" />
      ) : (
        <div className="flex h-16 w-28 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-300">
          <ImageIcon size={22} />
        </div>
      )}
      <div className="space-y-1.5">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Upload size={15} /> {yukleniyor ? "Yükleniyor…" : url ? "Logoyu değiştir" : "Logo yükle"}
          <input type="file" accept="image/*" onChange={sec} className="hidden" disabled={yukleniyor} />
        </label>
        {url && (
          <button type="button" onClick={() => setUrl("")} className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-rose-500 hover:text-rose-600">
            <X size={13} /> Kaldır
          </button>
        )}
        <p className="text-xs text-slate-400">PNG/JPG, şeffaf zemin önerilir.</p>
      </div>
    </div>
  );
}
