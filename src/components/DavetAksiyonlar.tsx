"use client";

import { useMemo, useState } from "react";
import { MessageCircle, CalendarClock, ThumbsUp, Info, X, Check, Clock } from "lucide-react";

function sid() {
  return typeof window !== "undefined" ? sessionStorage.getItem("il_sid") ?? "anon" : "anon";
}

async function olay(token: string, olayTip: string) {
  try {
    await fetch("/api/public/olay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, sessionId: sid(), olayTip }),
      keepalive: true,
    });
  } catch {
    /* yut */
  }
}

export function ButonGrubu({ token, whatsapp }: { token: string; whatsapp?: string | null }) {
  const [secilen, setSecilen] = useState<string | null>(null);

  const bas = (tip: string) => {
    olay(token, tip);
    setSecilen(tip);
  };

  return (
    <div className="space-y-2">
      <Buton aktif={secilen === "cta_interested"} onClick={() => bas("cta_interested")} icon={ThumbsUp} renk="emerald">
        İlgileniyorum
      </Buton>
      <Buton aktif={secilen === "cta_more_info"} onClick={() => bas("cta_more_info")} icon={Info} renk="koyu">
        Daha detaylı bilgi istiyorum
      </Buton>
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => olay(token, "whatsapp_clicked")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-medium text-white hover:bg-green-700"
        >
          <MessageCircle size={18} /> WhatsApp&apos;tan yaz
        </a>
      )}
      <Buton aktif={secilen === "cta_not_interested"} onClick={() => bas("cta_not_interested")} icon={X} renk="slate">
        Şimdilik ilgilenmiyorum
      </Buton>
      {secilen && secilen !== "cta_not_interested" && (
        <p className="flex items-center justify-center gap-1 pt-1 text-sm text-emerald-700">
          <Check size={15} /> Teşekkürler, en kısa sürede dönüş yapılacak.
        </p>
      )}
    </div>
  );
}

const GUN_ADI = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const AY_ADI = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
// 10:00–18:30 arası 30 dakikalık dilimler
const SAATLER = Array.from({ length: 18 }, (_, i) => {
  const dk = 10 * 60 + i * 30;
  return `${String(Math.floor(dk / 60)).padStart(2, "0")}:${String(dk % 60).padStart(2, "0")}`;
});

export function RandevuModulu({ token }: { token: string }) {
  const [gonderildi, setGonderildi] = useState(false);
  const [aciklik, setAciklik] = useState(false);
  const [gun, setGun] = useState<Date | null>(null);
  const [saat, setSaat] = useState<string | null>(null);
  const [tip, setTip] = useState("WHATSAPP");
  const [not, setNot] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  // Önümüzdeki 14 gün (Pazar hariç) — istemcide üretilir.
  const gunler = useMemo(() => {
    const liste: Date[] = [];
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    for (let i = 1; liste.length < 12 && i <= 21; i++) {
      const d = new Date(bugun);
      d.setDate(bugun.getDate() + i);
      if (d.getDay() !== 0) liste.push(d);
    }
    return liste;
  }, []);

  async function gonder() {
    if (!gun || !saat) return;
    setYukleniyor(true);
    const tarihMetni = `${gun.getDate()} ${AY_ADI[gun.getMonth()]} ${gun.getFullYear()} ${GUN_ADI[gun.getDay()]}, ${saat} (30 dk)`;
    await fetch(`/api/public/davet/${token}/randevu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tarihMetni, tip, mesaj: not, sessionId: sid() }),
    });
    setYukleniyor(false);
    setGonderildi(true);
  }

  if (gonderildi) {
    return (
      <p className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-4 text-sm font-medium text-emerald-700">
        <Check size={16} /> Randevu talebiniz alındı, sizinle iletişime geçilecek.
      </p>
    );
  }

  if (!aciklik) {
    return (
      <button
        onClick={() => {
          setAciklik(true);
          olay(token, "appointment_opened");
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-medium text-white hover:bg-emerald-600"
      >
        <CalendarClock size={18} /> Görüşme planla
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
        <Clock size={15} className="text-emerald-500" /> 30 dakikalık görüşme
      </div>

      {/* Gün seçimi */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-slate-500">Uygun bir gün seç</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gunler.map((d) => {
            const secili = gun?.toDateString() === d.toDateString();
            return (
              <button
                key={d.toISOString()}
                onClick={() => { setGun(d); setSaat(null); }}
                className={`flex shrink-0 flex-col items-center rounded-xl border px-3 py-2 text-center ${secili ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                <span className="text-[11px]">{GUN_ADI[d.getDay()].slice(0, 3)}</span>
                <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
                <span className="text-[11px]">{AY_ADI[d.getMonth()].slice(0, 3)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Saat seçimi */}
      {gun && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-500">Uygun saati seç</p>
          <div className="grid grid-cols-4 gap-2">
            {SAATLER.map((s) => (
              <button
                key={s}
                onClick={() => setSaat(s)}
                className={`rounded-lg border py-2 text-sm font-medium ${saat === s ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Görüşme tipi + not */}
      {saat && (
        <div className="space-y-2">
          <select value={tip} onChange={(e) => setTip(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="WHATSAPP">WhatsApp görüşmesi</option>
            <option value="TELEFON">Telefon</option>
            <option value="ZOOM">Zoom</option>
            <option value="YUZ_YUZE">Yüz yüze</option>
          </select>
          <textarea value={not} onChange={(e) => setNot(e.target.value)} rows={2} placeholder="Kısa not (opsiyonel)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <button onClick={gonder} disabled={yukleniyor} className="w-full rounded-lg bg-emerald-500 py-2.5 font-medium text-white hover:bg-emerald-600 disabled:opacity-50">
            {yukleniyor ? "Gönderiliyor…" : "Randevu Oluştur"}
          </button>
        </div>
      )}
    </div>
  );
}

function Buton({
  children,
  onClick,
  icon: Icon,
  renk,
  aktif,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  renk: "emerald" | "koyu" | "slate";
  aktif: boolean;
}) {
  const renkler = {
    emerald: "bg-emerald-600 hover:bg-emerald-700 text-white",
    koyu: "bg-slate-900 hover:bg-slate-800 text-white",
    slate: "border border-slate-300 text-slate-600 hover:bg-slate-50",
  }[renk];
  return (
    <button
      onClick={onClick}
      disabled={aktif}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium disabled:opacity-70 ${renkler}`}
    >
      <Icon size={18} /> {children}
    </button>
  );
}
