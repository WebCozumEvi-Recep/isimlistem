"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const SORULAR = [
  { s: "İsim Listem ücretli mi?", c: "Bireysel networker kullanımı ücretsizdir. Kurumsal firmalar için Business versiyon ücretlidir." },
  { s: "WhatsApp mesajları otomatik mi gönderiliyor?", c: "Hayır. Sistem sadece mesajı hazırlar ve wa.me bağlantısı oluşturur. Mesaj WhatsApp ekranında açılır, gönderme işlemini siz manuel yaparsınız." },
  { s: "Bu sistem bir MLM yazılımı mı?", c: "Hayır. Komisyon, sponsor ağacı, binary, unilevel, prim veya kazanç planı takibi yoktur. Sistem aday takip ve davet linki yönetimi sağlar." },
  { s: "Adaylarımı başka kullanıcılar görebilir mi?", c: "Hayır. Aday listeniz size özeldir, başka kullanıcılara gösterilmez." },
  { s: "Kurumsal firma aday bilgilerimi görebilir mi?", c: "Varsayılan olarak firma aday kişisel bilgilerini göremez. Aday form üzerinden açık izin verirse ilgili bilgiler firma ile paylaşılabilir." },
  { s: "Aday davet sayfasında ne takip edilir?", c: "Link açılma, sayfada kalma süresi, scroll oranı, video izleme yüzdesi, buton tıklamaları ve randevu talepleri takip edilebilir." },
  { s: "Şirket olarak kendi mesaj ve sayfalarımızı hazırlayabilir miyiz?", c: "Evet. Business panel ile firma kendi mesaj kalıplarını, videolarını, davet sayfalarını ve kampanyalarını oluşturabilir." },
];

export default function SSS() {
  const [acik, setAcik] = useState<number | null>(0);
  return (
    <div className="mx-auto mt-10 max-w-3xl space-y-3">
      {SORULAR.map((q, i) => {
        const o = acik === i;
        return (
          <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <button onClick={() => setAcik(o ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
              <span className="font-semibold text-slate-900">{q.s}</span>
              <ChevronDown size={18} className={`shrink-0 text-slate-400 transition ${o ? "rotate-180" : ""}`} />
            </button>
            <div className={`grid transition-all duration-300 ${o ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm text-slate-600">{q.c}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
