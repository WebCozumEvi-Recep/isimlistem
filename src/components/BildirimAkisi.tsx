"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell, Eye, PlayCircle, ThumbsUp, CalendarClock, MessageCircle, Clock, BellOff,
  X, ChevronRight, MessageSquareText, Activity, Loader2, ExternalLink, UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { bildirimAc, type BildirimDetay } from "@/app/panel/davet-actions";

type Stil = { etiket: string; Icon: LucideIcon; renk: string };
const TIP_STILI: Record<string, Stil> = {
  LINK_ACILDI: { etiket: "Link Açıldı", Icon: Eye, renk: "bg-sky-100 text-sky-600" },
  VIDEO_IZLEDI: { etiket: "Video İzledi", Icon: PlayCircle, renk: "bg-violet-100 text-violet-600" },
  ILGILENIYOR: { etiket: "İlgileniyor", Icon: ThumbsUp, renk: "bg-emerald-100 text-emerald-600" },
  RANDEVU: { etiket: "Randevu", Icon: CalendarClock, renk: "bg-indigo-100 text-indigo-600" },
  WHATSAPP_DONUS: { etiket: "WhatsApp", Icon: MessageCircle, renk: "bg-green-100 text-green-600" },
  TAKIP_ZAMANI: { etiket: "Takip Zamanı", Icon: Clock, renk: "bg-amber-100 text-amber-600" },
  ACILMAYAN_DAVET: { etiket: "Açılmayan Davet", Icon: BellOff, renk: "bg-rose-100 text-rose-600" },
  YENI_ADAY: { etiket: "Yeni Aday", Icon: UserPlus, renk: "bg-emerald-100 text-emerald-600" },
};
const VARSAYILAN_STIL: Stil = { etiket: "Bildirim", Icon: Bell, renk: "bg-slate-100 text-slate-500" };

const DURUM_RENK: Record<string, string> = {
  YENI: "bg-slate-100 text-slate-600", ARANDI: "bg-sky-100 text-sky-700", RANDEVU: "bg-indigo-100 text-indigo-700",
  SUNUM_YAPILDI: "bg-violet-100 text-violet-700", TAKIP: "bg-amber-100 text-amber-700",
  KATILDI: "bg-emerald-100 text-emerald-700", KAYIP: "bg-rose-100 text-rose-700",
};

export type BildirimSatiri = {
  id: string;
  tip: string;
  mesaj: string;
  okundu: boolean;
  kisiId: string | null;
  zaman: string;
};

export default function BildirimAkisi({ bildirimler }: { bildirimler: BildirimSatiri[] }) {
  const [liste, setListe] = useState(bildirimler);
  const [detay, setDetay] = useState<BildirimDetay | null>(null);
  const [acikId, setAcikId] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function ac(b: BildirimSatiri) {
    setAcikId(b.id);
    setDetay(null);
    // İyimser: listede okundu işaretle
    setListe((l) => l.map((x) => (x.id === b.id ? { ...x, okundu: true } : x)));
    basla(async () => {
      const d = await bildirimAc(b.id);
      setDetay(d);
    });
  }

  function kapat() {
    setAcikId(null);
    setDetay(null);
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {liste.map((b) => {
          const s = TIP_STILI[b.tip] ?? VARSAYILAN_STIL;
          return (
            <button
              key={b.id}
              onClick={() => ac(b)}
              className="flex w-full items-center gap-3 rounded-2xl border border-[#ECEFF3] bg-white px-3.5 py-3 text-left shadow-[0_6px_18px_-16px_rgba(15,27,45,.5)] transition hover:border-[#D6DEE8] hover:bg-slate-50/60"
            >
              <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-[13px] ${s.renk}`}>
                <s.Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold leading-snug text-[#0F1B2D]">{b.mesaj}</div>
                <div className="mt-0.5 text-[11.5px] font-semibold text-[#9AA7B8]">{s.etiket} · {b.zaman}</div>
              </div>
              {!b.okundu && <span className="h-2.5 w-2.5 flex-none rounded-full bg-[#16B364]" />}
              <ChevronRight size={16} className="flex-none text-[#C2CBD6]" />
            </button>
          );
        })}
      </div>

      {acikId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={kapat}>
          <div
            className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[24px] bg-white shadow-2xl sm:rounded-[24px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Başlık */}
            <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-[#EEF1F5] bg-white px-5 py-4">
              <h2 className="text-[16px] font-extrabold text-[#0F1B2D]">Bildirim Detayı</h2>
              <button onClick={kapat} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F6F9] text-[#5A6678] hover:bg-[#E9EDF2]">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              {bekliyor && !detay ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#8493A8]">
                  <Loader2 size={18} className="animate-spin" /> Yükleniyor…
                </div>
              ) : !detay ? (
                <p className="py-8 text-center text-sm text-[#8493A8]">Detay yüklenemedi.</p>
              ) : (
                <>
                  {/* Bildirim özeti */}
                  <div className="rounded-2xl bg-[#F7F9FB] p-3.5">
                    <div className="text-[14px] font-bold text-[#0F1B2D]">{detay.bildirim.mesaj}</div>
                    <div className="mt-1 text-[11.5px] font-semibold text-[#9AA7B8]">
                      {(TIP_STILI[detay.bildirim.tip]?.etiket) ?? "Bildirim"} · {detay.bildirim.zaman}
                    </div>
                  </div>

                  {/* Aday kartı */}
                  {detay.kisi && (
                    <div className="rounded-2xl border border-[#ECEFF3] p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[15px] font-extrabold text-[#0F1B2D]">{detay.kisi.adSoyad}</div>
                          {detay.kisi.telefon && <div className="text-[12.5px] font-semibold text-[#7A8799]">{detay.kisi.telefon}</div>}
                        </div>
                        <span className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-bold ${DURUM_RENK[detay.kisi.durum] ?? "bg-slate-100 text-slate-600"}`}>
                          {detay.kisi.durumEtiket}
                        </span>
                      </div>
                      <Link
                        href={`/panel/kisi/${detay.kisi.id}`}
                        className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#0B1B3C] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#16294e]"
                      >
                        Aday profilini aç <ExternalLink size={14} />
                      </Link>
                    </div>
                  )}

                  {/* Link özeti */}
                  {detay.link && (
                    <div className="flex items-center gap-3 rounded-2xl border border-[#ECEFF3] p-3.5">
                      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                        <Eye size={17} />
                      </span>
                      <div className="text-[12.5px] font-semibold text-[#5A6678]">
                        Davet <b className="text-[#0F1B2D]">{detay.link.acilmaSayisi}</b> kez açıldı
                        {detay.link.sonAcilma && <span className="text-[#9AA7B8]"> · son: {detay.link.sonAcilma}</span>}
                      </div>
                    </div>
                  )}

                  {/* Gönderilen mesaj */}
                  {detay.sonMesaj && (
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wide text-[#8493A8]">
                        <MessageSquareText size={14} /> Gönderilen davet mesajı
                      </div>
                      <div className="rounded-2xl border border-[#ECEFF3] bg-[#F7F9FB] p-3.5">
                        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#3B4759]">{detay.sonMesaj.metin}</p>
                        <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-[#9AA7B8]">
                          <span className="rounded-full bg-white px-2 py-0.5 text-[#0E8A4D]">{detay.sonMesaj.durumEtiket}</span>
                          <span>{detay.sonMesaj.zaman}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* İşlem akışı */}
                  {detay.akis.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wide text-[#8493A8]">
                        <Activity size={14} /> İşlem akışı
                      </div>
                      <ol className="relative ml-1.5 space-y-3 border-l-2 border-[#EEF1F5] pl-4">
                        {detay.akis.map((o, i) => (
                          <li key={i} className="relative">
                            <span className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white ${o.tip === "olay" ? "bg-[#16B364]" : "bg-[#2563EB]"}`} />
                            <div className="text-[13px] font-bold text-[#0F1B2D]">{o.etiket}</div>
                            <div className="text-[11px] font-semibold text-[#9AA7B8]">{o.zaman}</div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {!detay.kisi && (
                    <p className="py-4 text-center text-[13px] text-[#8493A8]">Bu bildirim bir adaya bağlı değil.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
