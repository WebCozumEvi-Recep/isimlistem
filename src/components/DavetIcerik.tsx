"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, MessageCircle, CalendarClock, Package, Info } from "lucide-react";

function sid() {
  return typeof window !== "undefined" ? sessionStorage.getItem("il_sid") ?? "anon" : "anon";
}

function olay(token: string, olayTip: string, olayDeger?: string) {
  try {
    fetch("/api/public/olay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, sessionId: sid(), olayTip, olayDeger: olayDeger ?? null }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* yut */
  }
}

/** SSS — her soru açılışında sss_<index> olayı (skorlama bir/üç soru). */
export function SSSListesi({
  token,
  baslik,
  ogeler,
}: {
  token: string;
  baslik?: string;
  ogeler: { soru: string; cevap: string }[];
}) {
  const [acik, setAcik] = useState<number | null>(null);
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {baslik ? <h2 className="mb-3 text-xl font-bold text-slate-900">{baslik}</h2> : null}
      <div className="divide-y divide-slate-100">
        {ogeler.map((o, i) => {
          const open = acik === i;
          return (
            <div key={i} className="py-1">
              <button
                onClick={() => {
                  const yeni = open ? null : i;
                  setAcik(yeni);
                  if (!open) olay(token, `sss_${i}`, o.soru);
                }}
                className="flex w-full items-center justify-between gap-2 py-3 text-left font-medium text-slate-800"
              >
                {o.soru}
                <ChevronDown size={18} className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
              </button>
              {open && <p className="pb-3 text-sm leading-relaxed text-slate-600">{o.cevap}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Başarı hikayeleri — görünür olunca stories_viewed olayı (+10). */
export function HikayelerBolum({
  token,
  baslik,
  ogeler,
}: {
  token: string;
  baslik?: string;
  ogeler: { ad?: string; foto?: string; metin?: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const gonderildi = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (girisler) => {
        for (const g of girisler) {
          if (g.isIntersecting && !gonderildi.current) {
            gonderildi.current = true;
            olay(token, "stories_viewed");
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [token]);

  return (
    <div ref={ref} className="rounded-2xl bg-white p-6 shadow-sm">
      {baslik ? <h2 className="mb-4 text-xl font-bold text-slate-900">{baslik}</h2> : null}
      <div className="space-y-3">
        {ogeler.map((o, i) => (
          <div key={i} className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
            {o.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={o.foto} alt={o.ad ?? ""} className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-emerald-200" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-base font-bold text-white">
                {(o.ad ?? "?").trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              {o.ad ? <p className="font-semibold text-slate-900">{o.ad}</p> : null}
              {o.metin ? <p className="text-sm text-slate-600">&ldquo;{o.metin}&rdquo;</p> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** İlgi seçimi — seçime göre WhatsApp / randevu / ürün yönlendirmesi. */
export function SecimBolum({
  token,
  baslik,
  secenekler,
  whatsapp,
}: {
  token: string;
  baslik?: string;
  secenekler: { etiket: string; hedef: string }[];
  whatsapp?: string | null;
}) {
  const [secilen, setSecilen] = useState<{ etiket: string; hedef: string } | null>(null);

  function sec(s: { etiket: string; hedef: string }) {
    setSecilen(s);
    olay(token, `secim_${s.hedef}`, s.etiket);
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {baslik ? <h2 className="mb-4 text-xl font-bold text-slate-900">{baslik}</h2> : null}
      {!secilen ? (
        <div className="space-y-2">
          {secenekler.map((s, i) => (
            <button
              key={i}
              onClick={() => sec(s)}
              className="group flex w-full items-center justify-between gap-2 rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3.5 text-left font-medium text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {s.etiket}
              <ChevronDown size={18} className="-rotate-90 text-slate-300 transition group-hover:text-emerald-500" />
            </button>
          ))}
        </div>
      ) : (
        <SonrakiAdim hedef={secilen.hedef} whatsapp={whatsapp} />
      )}
    </div>
  );
}

function SonrakiAdim({ hedef, whatsapp }: { hedef: string; whatsapp?: string | null }) {
  if (hedef === "whatsapp" || hedef === "bilgi") {
    return whatsapp ? (
      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-medium text-white hover:bg-green-700"
      >
        <MessageCircle size={18} /> WhatsApp&apos;tan yaz
      </a>
    ) : (
      <p className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-4 text-sm font-medium text-emerald-700">
        <Info size={16} /> Teşekkürler, en kısa sürede iletişime geçilecek.
      </p>
    );
  }
  if (hedef === "urun") {
    return (
      <p className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-4 text-center text-sm font-medium text-emerald-700">
        <Package size={16} /> Ürün bilgileri için en kısa sürede iletişime geçilecek.
      </p>
    );
  }
  // randevu
  return (
    <p className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-4 text-center text-sm font-medium text-emerald-700">
      <CalendarClock size={16} /> Görüşme planlamak için aşağıdaki butonları kullanabilirsin.
    </p>
  );
}
