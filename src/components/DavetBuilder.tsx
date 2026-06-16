"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  modulEkleTip, modulGuncelle, modulSil, modulSiraGuncelle, sayfaYayinla, sayfaSil,
} from "@/app/panel/davet-actions";
import {
  Plus, Trash2, ChevronUp, ChevronDown, Check, PlayCircle, MessageCircle,
  CalendarClock, ThumbsUp, Info, Eye, Pencil,
} from "lucide-react";

type Modul = { id: string; tip: string; sira: number; icerik: Record<string, unknown> };

const TIPLER = [
  { tip: "KARSILAMA", etiket: "Karşılama" },
  { tip: "METIN", etiket: "Metin" },
  { tip: "GORSEL", etiket: "Görsel" },
  { tip: "VIDEO", etiket: "Video" },
  { tip: "BUTON", etiket: "Buton Grubu" },
  { tip: "RANDEVU", etiket: "Randevu" },
];
const TIP_ETIKET: Record<string, string> = Object.fromEntries(TIPLER.map((t) => [t.tip, t.etiket]));

export default function DavetBuilder({
  sayfaId, baslik, durum, moduller: ilk,
}: {
  sayfaId: string;
  baslik: string;
  durum: string;
  moduller: Modul[];
}) {
  const router = useRouter();
  const [moduller, setModuller] = useState<Modul[]>([...ilk].sort((a, b) => a.sira - b.sira));
  const [yeniTip, setYeniTip] = useState("KARSILAMA");
  const [yayinda, setYayinda] = useState(durum === "YAYINDA");
  const [ekliyor, setEkliyor] = useState(false);

  async function ekle() {
    setEkliyor(true);
    const m = await modulEkleTip(sayfaId, yeniTip);
    setEkliyor(false);
    if (m) setModuller((s) => [...s, m]);
  }
  function guncelleLocal(id: string, icerik: Record<string, unknown>) {
    setModuller((s) => s.map((m) => (m.id === id ? { ...m, icerik } : m)));
  }
  async function kaydet(id: string) {
    const m = moduller.find((x) => x.id === id);
    if (m) await modulGuncelle(id, sayfaId, m.icerik);
  }
  async function sil(id: string) {
    setModuller((s) => s.filter((m) => m.id !== id));
    await modulSil(id, sayfaId);
  }
  async function tasi(id: string, yon: -1 | 1) {
    const i = moduller.findIndex((m) => m.id === id);
    const j = i + yon;
    if (j < 0 || j >= moduller.length) return;
    const yeni = [...moduller];
    [yeni[i], yeni[j]] = [yeni[j], yeni[i]];
    setModuller(yeni);
    await modulSiraGuncelle(sayfaId, yeni.map((m) => m.id));
  }
  async function yayinToggle() {
    setYayinda((v) => !v);
    await sayfaYayinla(sayfaId);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{baslik}</h1>
        <div className="flex items-center gap-2">
          <button onClick={yayinToggle} className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${yayinda ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
            {yayinda ? "● Yayında" : "Yayınla"}
          </button>
          <button onClick={() => { if (confirm("Sayfa silinsin mi?")) sayfaSil(sayfaId); }} className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50">
            <Trash2 size={15} /> Sil
          </button>
        </div>
      </div>

      {/* Modül ekle çubuğu */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <Pencil size={16} className="text-slate-400" />
        <span className="text-sm font-medium text-slate-600">Modül ekle:</span>
        <select value={yeniTip} onChange={(e) => setYeniTip(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          {TIPLER.map((t) => <option key={t.tip} value={t.tip}>{t.etiket}</option>)}
        </select>
        <button onClick={ekle} disabled={ekliyor} className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">
          <Plus size={15} /> Ekle
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editör */}
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Pencil size={15} /> Düzenle</h2>
          {moduller.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">Yukarıdan modül ekleyerek sayfanı oluştur.</p>
          )}
          {moduller.map((m, i) => (
            <ModulKart key={m.id} m={m} ilk={i === 0} son={i === moduller.length - 1}
              onChange={(ic) => guncelleLocal(m.id, ic)} onKaydet={() => kaydet(m.id)}
              onSil={() => sil(m.id)} onYukari={() => tasi(m.id, -1)} onAsagi={() => tasi(m.id, 1)} />
          ))}
        </div>

        {/* Önizleme */}
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Eye size={15} /> Önizleme</h2>
          <div className="sticky top-4 mx-auto w-full max-w-xs rounded-[2rem] border-8 border-slate-900 bg-white shadow-xl">
            <div className="max-h-[70vh] space-y-3 overflow-y-auto rounded-[1.5rem] bg-gradient-to-b from-slate-50 to-white p-4">
              {moduller.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">Önizleme burada görünecek</p>
              ) : moduller.map((m) => <Onizleme key={m.id} m={m} />)}
              <button onClick={() => router.refresh()} className="hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModulKart({
  m, ilk, son, onChange, onKaydet, onSil, onYukari, onAsagi,
}: {
  m: Modul; ilk: boolean; son: boolean;
  onChange: (ic: Record<string, unknown>) => void;
  onKaydet: () => void | Promise<void>;
  onSil: () => void; onYukari: () => void; onAsagi: () => void;
}) {
  const [kaydedildi, setKaydedildi] = useState(false);
  const ic = m.icerik;
  const set = (k: string, v: unknown) => onChange({ ...ic, [k]: v });
  async function kaydet() { await onKaydet(); setKaydedildi(true); setTimeout(() => setKaydedildi(false), 1500); }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{TIP_ETIKET[m.tip] ?? m.tip}</span>
        <div className="flex items-center gap-1">
          <button onClick={onYukari} disabled={ilk} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ChevronUp size={16} /></button>
          <button onClick={onAsagi} disabled={son} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ChevronDown size={16} /></button>
          <button onClick={onSil} className="rounded p-1 text-rose-500 hover:bg-rose-50"><Trash2 size={15} /></button>
        </div>
      </div>

      {(m.tip === "KARSILAMA" || m.tip === "METIN") && (
        <div className="space-y-2">
          <input value={String(ic.baslik ?? "")} onChange={(e) => set("baslik", e.target.value)} placeholder="Başlık" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <textarea value={String(ic.metin ?? "")} onChange={(e) => set("metin", e.target.value)} rows={3} placeholder="Metin" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <p className="text-xs text-slate-400">İpucu: {"{ad}"} yazarsan adayın adıyla değişir.</p>
        </div>
      )}
      {(m.tip === "GORSEL" || m.tip === "VIDEO") && (
        <input value={String(ic.url ?? "")} onChange={(e) => set("url", e.target.value)} placeholder={m.tip === "VIDEO" ? "YouTube/Vimeo linki" : "Görsel URL"} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      )}
      {m.tip === "BUTON" && <p className="text-xs text-slate-500">İlgileniyorum · Daha detaylı bilgi · Randevu · WhatsApp butonları gösterilir.</p>}
      {m.tip === "RANDEVU" && <p className="text-xs text-slate-500">Aday sayfadan randevu talep edebilir.</p>}

      <button onClick={kaydet} className="mt-3 flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800">
        {kaydedildi ? <><Check size={14} /> Kaydedildi</> : "Kaydet"}
      </button>
    </div>
  );
}

function Onizleme({ m }: { m: Modul }) {
  const ic = m.icerik;
  const yaz = (s: unknown) => String(s ?? "").replace(/\{ad\}/g, "Örnek Aday").replace(/\{tam_ad\}/g, "Örnek Aday");

  if (m.tip === "KARSILAMA" || m.tip === "METIN") {
    return (
      <div className="rounded-xl bg-white p-3 shadow-sm">
        {ic.baslik ? <p className="text-sm font-bold text-slate-900">{yaz(ic.baslik)}</p> : null}
        {ic.metin ? <p className="mt-1 text-xs text-slate-600">{yaz(ic.metin)}</p> : null}
      </div>
    );
  }
  if (m.tip === "GORSEL") {
    return ic.url
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={String(ic.url)} alt="" className="w-full rounded-xl" />
      : <div className="flex h-24 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">Görsel</div>;
  }
  if (m.tip === "VIDEO") {
    return <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-900 text-white"><PlayCircle size={28} /></div>;
  }
  if (m.tip === "BUTON") {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-white"><ThumbsUp size={13} /> İlgileniyorum</div>
        <div className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white"><Info size={13} /> Daha detaylı bilgi</div>
        <div className="flex items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white"><MessageCircle size={13} /> WhatsApp'tan yaz</div>
      </div>
    );
  }
  if (m.tip === "RANDEVU") {
    return <div className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white"><CalendarClock size={13} /> Randevu oluştur</div>;
  }
  return null;
}
