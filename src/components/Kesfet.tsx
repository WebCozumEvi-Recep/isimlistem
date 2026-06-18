"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hizliAdayEkle } from "@/app/panel/kesfet-actions";
import {
  Users, Home, Phone, Briefcase, Dumbbell, Scissors, MoreHorizontal,
  Zap, Check, ArrowLeft, Crown, TrendingUp, ShoppingBag, Sparkles,
} from "lucide-react";

const KAYNAKLAR = [
  { key: "arkadas", etiket: "Arkadaş Çevrem", kaynakTip: "ARKADAS", icon: Users },
  { key: "mahalle", etiket: "Mahallem", kaynakTip: "KOMSU", icon: Home },
  { key: "rehber", etiket: "Telefon Rehberim", kaynakTip: "DIGER", icon: Phone },
  { key: "is", etiket: "İş Arkadaşlarım", kaynakTip: "IS", icon: Briefcase },
  { key: "spor", etiket: "Spor Salonu", kaynakTip: "DIGER", icon: Dumbbell },
  { key: "kuafor", etiket: "Kuaför / Berber", kaynakTip: "DIGER", icon: Scissors },
  { key: "diger", etiket: "Diğer", kaynakTip: "DIGER", icon: MoreHorizontal },
];

const SINIFLAR = [
  { key: "lider", etiket: "Lider olabilir", icon: Crown },
  { key: "satis", etiket: "Satış yapabilir", icon: TrendingUp },
  { key: "musteri", etiket: "Müşteri olabilir", icon: ShoppingBag },
];

type Kaynak = { etiket: string; kaynakTip: string };

export default function Kesfet({ baslangicSayi }: { baslangicSayi: number }) {
  const router = useRouter();
  const [kaynak, setKaynak] = useState<Kaynak | null>(null);
  const [eklenen, setEklenen] = useState(0);
  const toplam = baslangicSayi + eklenen;

  // Akıllı yönlendirme metni
  const ipucu =
    toplam === 0 ? "Başlamak için Telefon Rehberini dene 📱"
    : toplam < 3 ? "Harika gidiyorsun, birkaç kişi daha ekle 💪"
    : eklenen >= 5 ? "Günün hedefini tamamladın 🎉"
    : "Devam et, listen büyüyor 🚀";

  if (!kaynak) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Aday Keşfet</h1>
          <p className="mt-1 text-slate-500">{ipucu}</p>
        </div>

        <button
          onClick={() => setKaynak({ etiket: "Manuel", kaynakTip: "DIGER" })}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-semibold text-white transition hover:bg-slate-800"
        >
          <Zap size={18} /> Hemen Yeni Aday Ekle
        </button>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-500">Bir kaynak seç, aklına gelenleri ekle:</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {KAYNAKLAR.map((k) => (
              <button
                key={k.key}
                onClick={() => setKaynak({ etiket: k.etiket, kaynakTip: k.kaynakTip })}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                  <k.icon size={22} />
                </span>
                <span className="text-sm font-semibold text-slate-800">{k.etiket}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <HizliEkle
      kaynak={kaynak}
      ipucu={ipucu}
      onGeri={() => setKaynak(null)}
      onEklendi={() => setEklenen((s) => s + 1)}
      onListeyeGit={() => router.push("/panel/liste")}
    />
  );
}

function HizliEkle({
  kaynak, ipucu, onGeri, onEklendi, onListeyeGit,
}: {
  kaynak: Kaynak;
  ipucu: string;
  onGeri: () => void;
  onEklendi: () => void;
  onListeyeGit: () => void;
}) {
  const [ad, setAd] = useState("");
  const [telefon, setTelefon] = useState("");
  const [not, setNot] = useState("");
  const [sinif, setSinif] = useState("musteri");
  const [skor, setSkor] = useState(3);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [eklendi, setEklendi] = useState<string | null>(null);
  const adRef = useRef<HTMLInputElement>(null);
  const telefonRef = useRef<HTMLInputElement>(null);

  useEffect(() => { adRef.current?.focus(); }, [eklendi]);

  async function kaydet() {
    if (!ad.trim() || !telefon.trim() || kaydediliyor) return;
    setKaydediliyor(true);
    const sonuc = await hizliAdayEkle({ ad, telefon, not, kaynakTip: kaynak.kaynakTip, kaynakNot: kaynak.etiket, sinif, skor });
    setKaydediliyor(false);
    if (sonuc.ok) {
      setEklendi(ad.trim());
      onEklendi();
      setAd(""); setTelefon(""); setNot(""); setSinif("musteri"); setSkor(3);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <button onClick={onGeri} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} /> Kaynak seç
      </button>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
        <p className="text-sm font-semibold text-emerald-800">{kaynak.etiket}</p>
        <p className="text-sm text-emerald-700">Bu kaynaktan aklına gelen kişiyi yaz, saniyeler içinde ekle.</p>
      </div>

      {eklendi && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white">
          <Check size={16} /> {eklendi} başarıyla eklendi! Sıradakini yaz 👇
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">İsim *</span>
          <input
            ref={adRef}
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && telefonRef.current?.focus()}
            placeholder="Aklına gelen kişi…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">GSM Telefon *</span>
          <input
            ref={telefonRef}
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && kaydet()}
            type="tel"
            inputMode="tel"
            placeholder="05XX XXX XX XX"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500"
          />
          <span className="mt-1 block text-xs text-slate-400">Aksiyon (WhatsApp daveti) için gerekli.</span>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Not (opsiyonel)</span>
          <input
            value={not}
            onChange={(e) => setNot(e.target.value)}
            placeholder="ör: spordan tanışıyoruz"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500"
          />
        </label>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Bu kişi senin için…</span>
          <div className="grid grid-cols-3 gap-2">
            {SINIFLAR.map((s) => (
              <button
                key={s.key}
                onClick={() => setSinif(s.key)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition ${
                  sinif === s.key ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <s.icon size={18} /> {s.etiket}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">İlgi seviyesi</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setSkor(n)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition ${
                  skor === n ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={kaydet}
          disabled={!ad.trim() || !telefon.trim() || kaydediliyor}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
        >
          <Sparkles size={18} /> {kaydediliyor ? "Ekleniyor…" : "Adaya Ekle"}
        </button>
      </div>

      {eklendi && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={() => adRef.current?.focus()} className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Aynı kaynaktan yeni aday
          </button>
          <button onClick={onGeri} className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Farklı kaynak seç
          </button>
          <button onClick={onListeyeGit} className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            Adaylarım
          </button>
        </div>
      )}

      <p className="text-center text-xs text-slate-400">{ipucu}</p>
    </div>
  );
}
