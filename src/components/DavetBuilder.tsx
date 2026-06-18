"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  modulEkleTip, modulGuncelle, modulSil, modulSiraGuncelle, sayfaYayinla, sayfaSil, sablonUygula, medyaYukle, sayfaBilgiGuncelle,
} from "@/app/panel/davet-actions";
import { MODUL_TIPLERI, MODUL_ETIKET, SECIM_HEDEFLERI } from "@/lib/davet-sablon";
import {
  Plus, Trash2, ChevronUp, ChevronDown, Check, PlayCircle, MessageCircle,
  CalendarClock, ThumbsUp, Info, Eye, Pencil, Sparkles, X, Upload, GripVertical,
  TrendingUp, Briefcase, Clock3, Users, Target, CheckCircle2, AlertTriangle,
} from "lucide-react";

type Modul = { id: string; tip: string; sira: number; icerik: Record<string, unknown> };

// Önizlemede "Neden tercih ediliyor" kartları için ikon + renk paleti (public sayfayla aynı).
const NEDEN_STILI = [
  { ring: "bg-emerald-100 text-emerald-600", Icon: TrendingUp },
  { ring: "bg-sky-100 text-sky-600", Icon: Briefcase },
  { ring: "bg-amber-100 text-amber-600", Icon: Clock3 },
  { ring: "bg-violet-100 text-violet-600", Icon: Users },
  { ring: "bg-rose-100 text-rose-600", Icon: Sparkles },
  { ring: "bg-teal-100 text-teal-600", Icon: Target },
];

export default function DavetBuilder({
  sayfaId, baslik, kapakGorsel, durum, moduller: ilk,
}: {
  sayfaId: string;
  baslik: string;
  kapakGorsel?: string | null;
  durum: string;
  moduller: Modul[];
}) {
  const router = useRouter();
  const [moduller, setModuller] = useState<Modul[]>([...ilk].sort((a, b) => a.sira - b.sira));
  const [ad, setAd] = useState(baslik);
  const [kapak, setKapak] = useState(kapakGorsel ?? "");
  const [kapakYukleniyor, setKapakYukleniyor] = useState(false);

  async function adKaydet() {
    if (ad.trim() && ad.trim() !== baslik) await sayfaBilgiGuncelle(sayfaId, { baslik: ad });
  }
  async function kapakSec(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;
    setKapakYukleniyor(true);
    const fd = new FormData();
    fd.append("dosya", dosya);
    const { url } = await medyaYukle(fd);
    setKapakYukleniyor(false);
    if (url) { setKapak(url); await sayfaBilgiGuncelle(sayfaId, { kapakGorsel: url }); }
    e.target.value = "";
  }
  async function kapakKaldir() { setKapak(""); await sayfaBilgiGuncelle(sayfaId, { kapakGorsel: null }); }
  const [yeniTip, setYeniTip] = useState<string>("KARSILAMA");
  const [yayinda, setYayinda] = useState(durum === "YAYINDA");
  const [ekliyor, setEkliyor] = useState(false);
  const [sablonYukleniyor, setSablonYukleniyor] = useState(false);
  const [sablonOnay, setSablonOnay] = useState(false);
  const [acikId, setAcikId] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  async function ekle() {
    setEkliyor(true);
    const m = await modulEkleTip(sayfaId, yeniTip);
    setEkliyor(false);
    if (m) { setModuller((s) => [...s, m]); setAcikId(m.id); }
  }
  async function sablonOnayla() {
    setSablonYukleniyor(true);
    const yeniler = await sablonUygula(sayfaId);
    setSablonYukleniyor(false);
    setSablonOnay(false);
    if (yeniler.length) { setModuller(yeniler); setAcikId(null); }
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

  // Sürükle-bırak sıralama
  function dragEnter(i: number) {
    const from = dragIndex.current;
    if (from === null || from === i) return;
    setModuller((prev) => {
      const a = [...prev];
      const [x] = a.splice(from, 1);
      a.splice(i, 0, x);
      return a;
    });
    dragIndex.current = i;
  }
  function dragBitti() {
    dragIndex.current = null;
    modulSiraGuncelle(sayfaId, moduller.map((m) => m.id));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Kapak görseli */}
          <div className="shrink-0">
            {kapak ? (
              <div className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={kapak} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <button onClick={kapakKaldir} title="Kapağı kaldır" className="absolute -right-1.5 -top-1.5 rounded-full bg-rose-500 p-0.5 text-white opacity-0 transition group-hover:opacity-100">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="flex h-14 w-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:bg-slate-50" title="Kapak görseli yükle">
                {kapakYukleniyor ? <span className="text-[10px]">…</span> : <Upload size={16} />}
                <input type="file" accept="image/*" onChange={kapakSec} className="hidden" disabled={kapakYukleniyor} />
              </label>
            )}
          </div>
          {/* Düzenlenebilir başlık */}
          <input
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            onBlur={adKaydet}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-2xl font-bold text-slate-900 outline-none hover:border-slate-200 focus:border-emerald-400 focus:bg-white"
            placeholder="Sayfa adı"
          />
        </div>
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
          {MODUL_TIPLERI.map((t) => <option key={t.tip} value={t.tip}>{t.etiket}</option>)}
        </select>
        <button onClick={ekle} disabled={ekliyor} className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">
          <Plus size={15} /> Ekle
        </button>
        <div className="ml-auto">
          <button onClick={() => setSablonOnay(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-600">
            <Sparkles size={15} /> Şablon Uygula (8 modül)
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editör */}
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Pencil size={15} /> Düzenle <span className="font-normal text-slate-400">· sürükleyerek sırala</span></h2>
          {moduller.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">Yukarıdan modül ekleyerek ya da “Şablon Uygula” ile sayfanı oluştur.</p>
          )}
          {moduller.map((m, i) => (
            <div
              key={m.id}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => dragEnter(i)}
              onDrop={dragBitti}
            >
              <ModulKart
                m={m} ilk={i === 0} son={i === moduller.length - 1} acik={acikId === m.id}
                onToggle={() => setAcikId((cur) => (cur === m.id ? null : m.id))}
                onChange={(ic) => guncelleLocal(m.id, ic)} onKaydet={() => kaydet(m.id)}
                onSil={() => sil(m.id)} onYukari={() => tasi(m.id, -1)} onAsagi={() => tasi(m.id, 1)}
                dragBaslat={() => { dragIndex.current = i; }} dragBitir={dragBitti}
              />
            </div>
          ))}
        </div>

        {/* Önizleme */}
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Eye size={15} /> Önizleme</h2>
          <div className="sticky top-4 mx-auto w-full max-w-xs rounded-[2rem] border-8 border-slate-900 bg-white shadow-xl">
            <div className="max-h-[70vh] space-y-3 overflow-y-auto rounded-[1.5rem] bg-gradient-to-b from-emerald-50 via-white to-teal-50 p-4">
              {moduller.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">Önizleme burada görünecek</p>
              ) : moduller.map((m) => <Onizleme key={m.id} m={m} />)}
              <button onClick={() => router.refresh()} className="hidden" />
            </div>
          </div>
        </div>
      </div>

      {/* Şablon onay modalı */}
      {sablonOnay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setSablonOnay(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center gap-2 text-amber-600">
              <AlertTriangle size={22} />
              <h3 className="text-lg font-bold text-slate-900">Şablonu uygula?</h3>
            </div>
            <p className="text-sm text-slate-600">
              Bu sayfadaki <b>tüm mevcut modüller silinecek</b> ve hazır 8 modüllü şablon sıfırdan kurulacak.
              Bu işlem geri alınamaz.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setSablonOnay(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Vazgeç
              </button>
              <button onClick={sablonOnayla} disabled={sablonYukleniyor} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50">
                {sablonYukleniyor ? "Uygulanıyor…" : "Evet, uygula"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Liste editör yardımcıları ---------------- */

function ListeAlani<T>({
  ogeler, bos, render, onChange, ekleEtiket,
}: {
  ogeler: T[];
  bos: T;
  render: (o: T, set: (yeni: T) => void) => React.ReactNode;
  onChange: (yeni: T[]) => void;
  ekleEtiket: string;
}) {
  return (
    <div className="space-y-2">
      {ogeler.map((o, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-slate-200 p-2">
          <div className="flex-1 space-y-1.5">{render(o, (yeni) => onChange(ogeler.map((x, j) => (j === i ? yeni : x))))}</div>
          <button onClick={() => onChange(ogeler.filter((_, j) => j !== i))} className="rounded p-1 text-rose-400 hover:bg-rose-50"><X size={15} /></button>
        </div>
      ))}
      <button onClick={() => onChange([...ogeler, bos])} className="flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50">
        <Plus size={13} /> {ekleEtiket}
      </button>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

function FotoYukle({ url, onUrl }: { url?: string; onUrl: (u: string) => void }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  async function sec(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;
    setYukleniyor(true);
    const fd = new FormData();
    fd.append("dosya", dosya);
    const { url: yeni } = await medyaYukle(fd);
    setYukleniyor(false);
    if (yeni) onUrl(yeni);
    e.target.value = "";
  }
  return (
    <div className="flex items-center gap-2">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Upload size={15} /></div>
      )}
      <label className="cursor-pointer rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
        {yukleniyor ? "Yükleniyor…" : url ? "Değiştir" : "Fotoğraf yükle"}
        <input type="file" accept="image/*" onChange={sec} className="hidden" disabled={yukleniyor} />
      </label>
      {url && <button onClick={() => onUrl("")} className="rounded p-1 text-rose-400 hover:bg-rose-50"><X size={14} /></button>}
    </div>
  );
}

function ModulKart({
  m, ilk, son, acik, onToggle, onChange, onKaydet, onSil, onYukari, onAsagi, dragBaslat, dragBitir,
}: {
  m: Modul; ilk: boolean; son: boolean; acik: boolean;
  onToggle: () => void;
  onChange: (ic: Record<string, unknown>) => void;
  onKaydet: () => void | Promise<void>;
  onSil: () => void; onYukari: () => void; onAsagi: () => void;
  dragBaslat: () => void; dragBitir: () => void;
}) {
  const [kaydedildi, setKaydedildi] = useState(false);
  const ic = m.icerik;
  const set = (k: string, v: unknown) => onChange({ ...ic, [k]: v });
  async function kaydet() { await onKaydet(); setKaydedildi(true); setTimeout(() => setKaydedildi(false), 1500); }

  const baslikGirisi = (
    <input value={String(ic.baslik ?? "")} onChange={(e) => set("baslik", e.target.value)} placeholder="Başlık" className={inputCls} />
  );
  const ozet = String(ic.baslik ?? MODUL_ETIKET[m.tip] ?? m.tip);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      {/* Akordiyon başlığı */}
      <div className="flex items-center gap-2 p-3">
        <span
          draggable
          onDragStart={dragBaslat}
          onDragEnd={dragBitir}
          className="cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing"
          title="Sürükle"
        >
          <GripVertical size={18} />
        </span>
        <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{MODUL_ETIKET[m.tip] ?? m.tip}</span>
          <span className="truncate text-sm text-slate-500">{ozet}</span>
        </button>
        <div className="flex items-center gap-1">
          <button onClick={onYukari} disabled={ilk} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ChevronUp size={16} /></button>
          <button onClick={onAsagi} disabled={son} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ChevronDown size={16} /></button>
          <button onClick={onSil} className="rounded p-1 text-rose-500 hover:bg-rose-50"><Trash2 size={15} /></button>
          <button onClick={onToggle} className="rounded p-1 text-slate-400 hover:bg-slate-100">
            <ChevronDown size={18} className={`transition ${acik ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Akordiyon gövdesi */}
      {acik && (
        <div className="border-t border-slate-100 p-4">
          {(m.tip === "KARSILAMA" || m.tip === "METIN") && (
            <div className="space-y-2">
              {baslikGirisi}
              <textarea value={String(ic.metin ?? "")} onChange={(e) => set("metin", e.target.value)} rows={3} placeholder="Metin" className={inputCls} />
              <p className="text-xs text-slate-400">İpucu: {"{ad}"} yazarsan adayın adıyla değişir.</p>
            </div>
          )}

          {m.tip === "VIDEO" && (
            <div className="space-y-2">
              {baslikGirisi}
              <input value={String(ic.url ?? "")} onChange={(e) => set("url", e.target.value)} placeholder="YouTube/Vimeo linki" className={inputCls} />
            </div>
          )}
          {m.tip === "GORSEL" && (
            <input value={String(ic.url ?? "")} onChange={(e) => set("url", e.target.value)} placeholder="Görsel URL" className={inputCls} />
          )}

          {m.tip === "LISTE" && (
            <div className="space-y-2">
              {baslikGirisi}
              <ListeAlani<string>
                ogeler={(Array.isArray(ic.ogeler) ? ic.ogeler : []) as string[]} bos="" ekleEtiket="Madde ekle"
                onChange={(y) => set("ogeler", y)}
                render={(o, st) => <input value={o} onChange={(e) => st(e.target.value)} placeholder="Madde" className={inputCls} />}
              />
            </div>
          )}
          {m.tip === "ADIMLAR" && (
            <div className="space-y-2">
              {baslikGirisi}
              <ListeAlani<string>
                ogeler={(Array.isArray(ic.ogeler) ? ic.ogeler : []) as string[]} bos="" ekleEtiket="Adım ekle"
                onChange={(y) => set("ogeler", y)}
                render={(o, st) => <input value={o} onChange={(e) => st(e.target.value)} placeholder="Adım" className={inputCls} />}
              />
            </div>
          )}
          {m.tip === "NEDENLER" && (
            <div className="space-y-2">
              {baslikGirisi}
              <ListeAlani<{ baslik?: string; metin?: string }>
                ogeler={(Array.isArray(ic.ogeler) ? ic.ogeler : []) as { baslik?: string; metin?: string }[]} bos={{ baslik: "", metin: "" }} ekleEtiket="Neden ekle"
                onChange={(y) => set("ogeler", y)}
                render={(o, st) => (<>
                  <input value={o.baslik ?? ""} onChange={(e) => st({ ...o, baslik: e.target.value })} placeholder="Başlık" className={inputCls} />
                  <input value={o.metin ?? ""} onChange={(e) => st({ ...o, metin: e.target.value })} placeholder="Açıklama" className={inputCls} />
                </>)}
              />
            </div>
          )}
          {m.tip === "HIKAYELER" && (
            <div className="space-y-2">
              {baslikGirisi}
              <ListeAlani<{ ad?: string; foto?: string; metin?: string }>
                ogeler={(Array.isArray(ic.ogeler) ? ic.ogeler : []) as { ad?: string; foto?: string; metin?: string }[]} bos={{ ad: "", foto: "", metin: "" }} ekleEtiket="Hikaye ekle"
                onChange={(y) => set("ogeler", y)}
                render={(o, st) => (<>
                  <input value={o.ad ?? ""} onChange={(e) => st({ ...o, ad: e.target.value })} placeholder="İsim" className={inputCls} />
                  <FotoYukle url={o.foto} onUrl={(u) => st({ ...o, foto: u })} />
                  <textarea value={o.metin ?? ""} onChange={(e) => st({ ...o, metin: e.target.value })} rows={2} placeholder="Kısa hikaye" className={inputCls} />
                </>)}
              />
            </div>
          )}
          {m.tip === "SSS" && (
            <div className="space-y-2">
              {baslikGirisi}
              <ListeAlani<{ soru?: string; cevap?: string }>
                ogeler={(Array.isArray(ic.ogeler) ? ic.ogeler : []) as { soru?: string; cevap?: string }[]} bos={{ soru: "", cevap: "" }} ekleEtiket="Soru ekle"
                onChange={(y) => set("ogeler", y)}
                render={(o, st) => (<>
                  <input value={o.soru ?? ""} onChange={(e) => st({ ...o, soru: e.target.value })} placeholder="Soru" className={inputCls} />
                  <textarea value={o.cevap ?? ""} onChange={(e) => st({ ...o, cevap: e.target.value })} rows={2} placeholder="Cevap" className={inputCls} />
                </>)}
              />
            </div>
          )}
          {m.tip === "SECIM" && (
            <div className="space-y-2">
              {baslikGirisi}
              <ListeAlani<{ etiket?: string; hedef?: string }>
                ogeler={(Array.isArray(ic.secenekler) ? ic.secenekler : []) as { etiket?: string; hedef?: string }[]} bos={{ etiket: "", hedef: "whatsapp" }} ekleEtiket="Seçenek ekle"
                onChange={(y) => set("secenekler", y)}
                render={(o, st) => (<>
                  <input value={o.etiket ?? ""} onChange={(e) => st({ ...o, etiket: e.target.value })} placeholder="Seçenek metni" className={inputCls} />
                  <select value={o.hedef ?? "whatsapp"} onChange={(e) => st({ ...o, hedef: e.target.value })} className={inputCls}>
                    {SECIM_HEDEFLERI.map((h) => <option key={h.hedef} value={h.hedef}>{h.etiket}</option>)}
                  </select>
                </>)}
              />
            </div>
          )}

          {m.tip === "BUTON" && <p className="text-xs text-slate-500">İlgileniyorum · Daha detaylı bilgi · WhatsApp · İlgilenmiyorum butonları gösterilir.</p>}
          {m.tip === "RANDEVU" && <p className="text-xs text-slate-500">Aday sayfadan randevu talep edebilir.</p>}

          <button onClick={kaydet} className="mt-3 flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800">
            {kaydedildi ? <><Check size={14} /> Kaydedildi</> : "Kaydet"}
          </button>
        </div>
      )}
    </div>
  );
}

function Onizleme({ m }: { m: Modul }) {
  const ic = m.icerik;
  const yaz = (s: unknown) => String(s ?? "").replace(/\{ad\}/g, "Örnek Aday").replace(/\{tam_ad\}/g, "Örnek Aday");
  const arr = <T,>(k: string): T[] => (Array.isArray(ic[k]) ? (ic[k] as T[]) : []);

  if (m.tip === "KARSILAMA") {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow">
        {ic.baslik ? <p className="text-base font-bold leading-tight">{yaz(ic.baslik)}</p> : null}
        {ic.metin ? <p className="mt-1.5 whitespace-pre-wrap text-xs text-emerald-50/90">{yaz(ic.metin)}</p> : null}
      </div>
    );
  }
  if (m.tip === "METIN") {
    return (
      <div className="rounded-xl border-l-4 border-emerald-400 bg-white p-3 shadow-sm">
        {ic.baslik ? <p className="text-sm font-bold text-slate-900">{yaz(ic.baslik)}</p> : null}
        {ic.metin ? <p className="mt-1 whitespace-pre-wrap text-xs text-slate-600">{yaz(ic.metin)}</p> : null}
      </div>
    );
  }
  if (m.tip === "NEDENLER") {
    return (
      <div className="rounded-xl bg-white p-3 shadow-sm">
        {ic.baslik ? <p className="mb-2 text-sm font-bold text-slate-900">{yaz(ic.baslik)}</p> : null}
        <div className="space-y-1.5">
          {arr<{ baslik?: string; metin?: string }>("ogeler").map((o, i) => {
            const s = NEDEN_STILI[i % NEDEN_STILI.length];
            return (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 p-2">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${s.ring}`}><s.Icon size={15} /></span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{o.baslik}</p>
                  {o.metin ? <p className="text-[11px] text-slate-500">{o.metin}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (m.tip === "LISTE") {
    return (
      <div className="rounded-xl bg-white p-3 shadow-sm">
        {ic.baslik ? <p className="mb-1.5 text-sm font-bold text-slate-900">{yaz(ic.baslik)}</p> : null}
        <ul className="space-y-1">
          {arr<string>("ogeler").map((o, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs text-slate-700">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-500" /> {o}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (m.tip === "ADIMLAR") {
    return (
      <div className="rounded-xl bg-white p-3 shadow-sm">
        {ic.baslik ? <p className="mb-1.5 text-sm font-bold text-slate-900">{yaz(ic.baslik)}</p> : null}
        <div className="space-y-1">
          {arr<string>("ogeler").map((o, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white">{i + 1}</span>{o}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (m.tip === "HIKAYELER") {
    return (
      <div className="rounded-xl bg-white p-3 shadow-sm">
        {ic.baslik ? <p className="mb-2 text-sm font-bold text-slate-900">{yaz(ic.baslik)}</p> : null}
        <div className="space-y-2">
          {arr<{ ad?: string; foto?: string; metin?: string }>("ogeler").map((o, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 p-2">
              {o.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={o.foto} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-[10px] font-bold text-white">{(o.ad ?? "?").charAt(0)}</div>
              )}
              <div><p className="text-xs font-semibold text-slate-800">{o.ad}</p><p className="text-[11px] text-slate-500">{o.metin}</p></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (m.tip === "SSS") {
    return (
      <div className="rounded-xl bg-white p-3 shadow-sm">
        {ic.baslik ? <p className="mb-1.5 text-sm font-bold text-slate-900">{yaz(ic.baslik)}</p> : null}
        <div className="space-y-1">
          {arr<{ soru?: string }>("ogeler").map((o, i) => (
            <p key={i} className="flex items-center justify-between text-xs font-medium text-slate-700">{o.soru} <ChevronDown size={13} className="text-slate-400" /></p>
          ))}
        </div>
      </div>
    );
  }
  if (m.tip === "SECIM") {
    return (
      <div className="rounded-xl bg-white p-3 shadow-sm">
        {ic.baslik ? <p className="mb-1.5 text-sm font-bold text-slate-900">{yaz(ic.baslik)}</p> : null}
        <div className="space-y-1">
          {arr<{ etiket?: string }>("secenekler").map((o, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border-2 border-slate-100 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-700">{o.etiket} <ChevronDown size={13} className="-rotate-90 text-slate-300" /></div>
          ))}
        </div>
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
        <div className="flex items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white"><MessageCircle size={13} /> WhatsApp&apos;tan yaz</div>
      </div>
    );
  }
  if (m.tip === "RANDEVU") {
    return <div className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white"><CalendarClock size={13} /> Görüşme planla</div>;
  }
  return null;
}
