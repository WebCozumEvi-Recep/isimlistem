// Ana sayfa için kod ile çizilmiş (CSS/SVG) mockup'lar — dış görsel bağımlılığı yok.
import { Bell, Plus, Home, Users, FileText, BarChart3, Play, Check } from "lucide-react";

const NAVY = "#0b1c30";

function Istat({ etiket, deger, artis }: { etiket: string; deger: string; artis?: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="text-[10px] text-slate-400">{etiket}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-lg font-bold text-white">{deger}</span>
        {artis && <span className="text-[10px] font-semibold text-green-400">↑{artis}</span>}
      </div>
    </div>
  );
}

/** Hero: koyu dashboard telefonu + arkada ikinci telefon (grafik). */
export function HeroTelefon() {
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      {/* Arka telefon */}
      <div className="absolute -right-2 top-8 hidden w-[56%] rotate-6 rounded-[2rem] border border-white/10 bg-[#0e2238] p-3 shadow-2xl sm:block">
        <p className="text-[10px] font-semibold text-slate-300">Adaylar</p>
        <div className="mt-2 flex items-end gap-1.5">
          {[40, 70, 50, 90, 65, 100, 80].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-green-500/80" style={{ height: h }} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-400">
          <span>342</span><span>128</span>
        </div>
      </div>

      {/* Ön telefon */}
      <div className="anim-float relative rounded-[2.5rem] border-[6px] border-[#1b2a3d] bg-[#0b1c30] p-4 shadow-2xl">
        <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-white/15" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Merhaba, Ayşe! 👋</p>
            <p className="text-[10px] text-slate-400">Bugün adaylarını incele</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 p-1.5 text-slate-300"><Bell size={14} /></span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-200">Genel Bakış</p>
          <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-400">Bu Hafta</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Istat etiket="Link Açılma" deger="1.245" artis="%24" />
          <Istat etiket="Sayfada Kalma" deger="4:32" artis="%18" />
          <Istat etiket="Video İzleme" deger="%75" artis="%12" />
          <Istat etiket="Randevu Talebi" deger="18" artis="%30" />
        </div>

        <p className="mt-3 text-xs font-semibold text-slate-200">Aday Aktivitesi</p>
        <div className="mt-2 space-y-1.5">
          {[
            { a: "Yeni Çağrı açıldı", k: "ZNl Deniz", t: "2dk önce" },
            { a: "Video izledi %75", k: "Mehmet Kaya", t: "15dk önce" },
            { a: "Randevu talebi gönderdi", k: "Elif Demir", t: "1sa önce" },
          ].map((r) => (
            <div key={r.k} className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/20 text-[10px] font-bold text-green-300">
                {r.k.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-white">{r.a}</p>
                <p className="truncate text-[10px] text-slate-400">{r.k}</p>
              </div>
              <span className="text-[9px] text-slate-500">{r.t}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-around border-t border-white/10 pt-2 text-slate-500">
          <Home size={16} className="text-green-400" />
          <Users size={16} />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white"><Plus size={15} /></span>
          <FileText size={16} />
          <BarChart3 size={16} />
        </div>
      </div>
    </div>
  );
}

/** Davet sayfası önizleme telefonu (açık tema). */
export function DavetTelefon() {
  return (
    <div className="mx-auto w-full max-w-[260px] rounded-[2.2rem] border-[6px] border-white bg-white shadow-2xl">
      <div className="overflow-hidden rounded-[1.6rem]">
        <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-[#0b1c30] to-[#16324f]">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#0b1c30]"><Play size={22} className="ml-0.5" /></span>
          <span className="absolute bottom-2 right-2 rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-white">3:24</span>
        </div>
        <div className="p-3">
          <p className="text-sm font-bold text-[#0b1c30]">Merhaba Ayşe,</p>
          <p className="text-[11px] text-slate-500">sana özel bir fırsat hazırladım…</p>
          <div className="mt-3 space-y-1.5">
            {["Kendi işinin sahibi ol", "Esnek çalışma, ekstra gelir", "Destekleyici güçlü bir ekip"].map((x) => (
              <div key={x} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Check size={13} className="shrink-0 text-green-500" /> {x}
              </div>
            ))}
          </div>
          <button className="mt-3 w-full rounded-lg bg-green-500 py-2 text-[11px] font-semibold text-white">Daha Fazlasını Keşfet</button>
          <p className="mt-2 text-center text-[8px] text-slate-400">Güvenilir & Spam-Free Davet</p>
        </div>
      </div>
    </div>
  );
}

function MiniIstat({ etiket, deger, artis }: { etiket: string; deger: string; artis: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="text-[11px] text-slate-400">{etiket}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-white">{deger}</span>
        <span className="text-[11px] font-semibold text-green-400">↑ {artis}</span>
      </div>
    </div>
  );
}

/** Analitik kart içeriği: 4 istatistik + çizgi grafik + halka grafik (SVG). */
export function AnalitikGorsel() {
  // Çizgi grafik noktaları
  const noktalar = [12, 20, 16, 28, 24, 38, 34, 46];
  const maxv = 50;
  const w = 240, h = 90;
  const adim = w / (noktalar.length - 1);
  const cizgi = noktalar.map((v, i) => `${i * adim},${h - (v / maxv) * h}`).join(" ");
  const alan = `0,${h} ${cizgi} ${w},${h}`;
  // Halka %75
  const r = 34, cevre = 2 * Math.PI * r, dolu = cevre * 0.75;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <MiniIstat etiket="Link Açılma" deger="1.245" artis="%24" />
        <MiniIstat etiket="Sayfada Kalma" deger="4:32" artis="%18" />
        <MiniIstat etiket="Video İzleme" deger="%75" artis="%12" />
        <MiniIstat etiket="Scroll Oranı" deger="%90" artis="%16" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-5">
        {/* Çizgi grafik */}
        <div className="rounded-xl bg-white/5 p-3 sm:col-span-3">
          <p className="mb-2 text-[11px] text-slate-400">Günlük Link Açılma</p>
          <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" preserveAspectRatio="none">
            <polygon points={alan} fill="rgba(34,197,94,0.15)" />
            <polyline points={cizgi} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <div className="mt-1 flex justify-between text-[9px] text-slate-500">
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((g) => <span key={g}>{g}</span>)}
          </div>
        </div>
        {/* Halka grafik */}
        <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 p-3 sm:col-span-2">
          <p className="mb-2 text-[11px] text-slate-400">Video İzleme Oranı</p>
          <div className="relative">
            <svg width="92" height="92" viewBox="0 0 92 92">
              <circle cx="46" cy="46" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" />
              <circle cx="46" cy="46" r={r} fill="none" stroke="#22c55e" strokeWidth="9" strokeLinecap="round"
                strokeDasharray={`${dolu} ${cevre}`} transform="rotate(-90 46 46)" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">%75</span>
          </div>
          <div className="mt-2 flex gap-3 text-[9px] text-slate-400">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />İzleyen</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-white/20" />İzlemeyen</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const MARKA_NAVY = NAVY;
