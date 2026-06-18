"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { medyaYukle } from "@/app/panel/davet-actions";

/** Profil fotoğrafı yükleme alanı: canlı önizleme + gizli input (name=profilFoto). */
export default function ProfilFotoSecici({ baslangic, ad }: { baslangic?: string | null; ad: string }) {
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
      <input type="hidden" name="profilFoto" value={url} />
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-emerald-200" />
      ) : (
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-2xl font-bold text-white">
          {ad.trim().charAt(0).toUpperCase() || "?"}
        </span>
      )}
      <div className="space-y-1.5">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Upload size={15} /> {yukleniyor ? "Yükleniyor…" : url ? "Fotoğrafı değiştir" : "Fotoğraf yükle"}
          <input type="file" accept="image/*" onChange={sec} className="hidden" disabled={yukleniyor} />
        </label>
        {url && (
          <button type="button" onClick={() => setUrl("")} className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-rose-500 hover:text-rose-600">
            <X size={13} /> Kaldır
          </button>
        )}
        <p className="text-xs text-slate-400">PNG/JPG, en fazla 5MB.</p>
      </div>
    </div>
  );
}
