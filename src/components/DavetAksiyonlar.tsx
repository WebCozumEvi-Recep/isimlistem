"use client";

import { useState } from "react";
import { MessageCircle, CalendarClock, ThumbsUp, Info, X, Check } from "lucide-react";

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
          <MessageCircle size={18} /> WhatsApp'tan yaz
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

export function RandevuModulu({ token }: { token: string }) {
  const [gonderildi, setGonderildi] = useState(false);
  const [aciklik, setAciklik] = useState(false);

  async function gonder(formData: FormData) {
    await fetch(`/api/public/davet/${token}/randevu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tarihMetni: String(formData.get("tarih") ?? ""),
        tip: String(formData.get("tip") ?? "WHATSAPP"),
        mesaj: String(formData.get("mesaj") ?? ""),
        sessionId: sid(),
      }),
    });
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
        <CalendarClock size={18} /> Randevu oluştur
      </button>
    );
  }

  return (
    <form action={gonder} className="space-y-2 rounded-xl border border-slate-200 p-4">
      <input name="tarih" placeholder="Ne zaman uygunsun? (ör: yarın akşam)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <select name="tip" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
        <option value="WHATSAPP">WhatsApp</option>
        <option value="TELEFON">Telefon</option>
        <option value="ZOOM">Zoom</option>
        <option value="YUZ_YUZE">Yüz yüze</option>
      </select>
      <textarea name="mesaj" rows={2} placeholder="Kısa not (opsiyonel)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <button className="w-full rounded-lg bg-emerald-500 py-2.5 font-medium text-white hover:bg-emerald-600">
        Randevu Talebi Gönder
      </button>
    </form>
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
