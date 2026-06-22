"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hizliAdayEkle } from "@/app/panel/kesfet-actions";
import {
  Users, Briefcase, Share2, AtSign, Phone, Coffee, Store, ShoppingBag, Sparkles,
  Zap, Search, ChevronRight, ChevronLeft, AlertTriangle, Lightbulb, Check, Plus, AlertCircle,
  type LucideIcon,
} from "lucide-react";

type Grup = {
  key: string;
  baslik: string;
  altBaslik: string;
  renk: string;
  arkaplan: string;
  icon: LucideIcon;
  kaynakTip: string;
  subs: string[];
  hints: string[];
  not?: string;
};

const GRUPLAR: Grup[] = [
  {
    key: "yakin", baslik: "Yakın Çevrem", altBaslik: "Sıcak pazar — en kolay ulaşacağın kişiler",
    renk: "#16B364", arkaplan: "#E7F8EE", icon: Users, kaynakTip: "ARKADAS",
    subs: ["Ailem", "Akrabalarım", "Yakın arkadaşlarım", "Eski arkadaşlarım", "Komşularım", "Mahallem", "Çocukluk arkadaşlarım", "Okul arkadaşlarım", "Askerlik arkadaşlarım", "Düğün/nişan çevrem", "Site/apartman çevrem"],
    hints: ["Son bir ayda telefonla kiminle konuştun?", "Bayram, düğün veya cenazede kimleri gördün?", "Çocukluğundan beri tanıdığın kim var?"],
  },
  {
    key: "is", baslik: "İş ve Profesyonel Çevrem", altBaslik: "En hızlı aday çıkaran alanlardan biri",
    renk: "#2563EB", arkaplan: "#EAF1FF", icon: Briefcase, kaynakTip: "IS",
    subs: ["İş arkadaşlarım", "Eski iş arkadaşlarım", "Eski çalıştığım firma", "Yöneticilerim", "Eski yöneticilerim", "Patron / işveren çevrem", "Müşterilerim", "Eski müşterilerim", "Tedarikçilerim", "Bayiler / esnaflar", "Hizmet aldığım kişiler", "Muhasebeci / avukat / danışman"],
    hints: ["Birlikte çalıştığın ekipten kimler aklına geliyor?", "İş için düzenli görüştüğün kişiler kim?", "Kartvizit kutunda / LinkedIn'de kimler var?"],
  },
  {
    key: "network", baslik: "Eski Network Bağlantılarım", altBaslik: "Daha önce yolun kesişen kişiler",
    renk: "#9333EA", arkaplan: "#F6ECFE", icon: Share2, kaynakTip: "REFERANS",
    subs: ["Eski ekip arkadaşlarım", "Eski sponsor / mentor", "Eski liderlerim", "Eski alt ekip bağlantılarım", "Eski müşteri listem", "Daha önce iş konuştuğum kişiler", "Kayıt olup aktif olmayanlar", "İlgilenip vazgeçenler", "Eski satış / temsilci çevrem", "Önceki iş fırsatı adaylarım"],
    hints: ["Daha önce bu işi konuştuğun ama o an olmayan kim vardı?", "Bir dönem aktifken sonra ara verenler kim?", "Sana “şimdi değil” diyenler kim?"],
    not: "Bu kategoriye yalnızca iletişim kurma hakkınız olan ve kişisel olarak tanıdığınız kişileri ekleyin.",
  },
  {
    key: "sosyal", baslik: "Sosyal Medya Çevrem", altBaslik: "Online tanıdığın, ulaşabildiğin kişiler",
    renk: "#E11D6B", arkaplan: "#FFE7F0", icon: AtSign, kaynakTip: "SOSYAL_MEDYA",
    subs: ["Instagram takipçilerim", "Instagram'da sık konuştuklarım", "Facebook arkadaşlarım", "Facebook gruplarım", "WhatsApp gruplarım", "Telegram gruplarım", "LinkedIn bağlantılarım", "TikTok takipçilerim", "YouTube yorum yapanlar", "DM'den soru soranlar", "Beğeni / yorum yapanlar", "Hikayelerime bakanlar"],
    hints: ["DM'den sana soru soran son kişiler kim?", "Paylaşımlarına en çok kim yorum/beğeni yapıyor?", "Hangi gruplarda aktif tanıdıkların var?"],
    not: "Sosyal medyadan tanıdıklarını elle ekle; numarasını bildiklerinle başla.",
  },
  {
    key: "rehber", baslik: "Telefon Rehberim", altBaslik: "Rehberindeki kişileri numarasıyla ekle",
    renk: "#0EA5A0", arkaplan: "#E2F7F6", icon: Phone, kaynakTip: "DIGER",
    subs: ["Telefon rehberim", "Uzun zamandır konuşmadıklarım", "Sık görüştüklerim", "Son aradıklarım", "WhatsApp favorilerim", "Grup sohbetlerindeki kişiler", "Eski kayıtlı kişiler"],
    hints: ["Rehberinde uzun süredir konuşmadığın kim var?", "Son aradığın kişiler kim?", "WhatsApp'ta favorilerinde kim var?"],
    not: "Rehberinden aklına gelen kişiyi numarasıyla birlikte ekle.",
  },
  {
    key: "gunluk", baslik: "Günlük Hayat Çevrem", altBaslik: "Her gün karşılaştığın, çok aday çıkaran çevre",
    renk: "#D97706", arkaplan: "#FFF4E1", icon: Coffee, kaynakTip: "DIGER",
    subs: ["Spor salonu", "Kuaför / Berber", "Eczane", "Market / Bakkal", "Kafe / Restoran", "Çay ocağı", "Taksi / ulaşım çevrem", "Kargo / kurye çevrem", "Site görevlisi", "Çocuğumun okul çevresi", "Kurs / eğitim çevrem", "Cami / dernek / vakıf", "Hobi kulübü", "Spor takımı / halı saha", "Doktor / klinik çevresi"],
    hints: ["Her gün/hafta düzenli gördüğün esnaf kim?", "Selamlaştığın, numarasını yeni alabileceğin kişiler?", "Hobi / spor ortamından tanıdıkların kim?"],
  },
  {
    key: "ticaret", baslik: "Ticaret / Esnaf Çevrem", altBaslik: "İşletme sahipleri — güçlü bir segment",
    renk: "#4F46E5", arkaplan: "#ECECFE", icon: Store, kaynakTip: "DIGER",
    subs: ["Esnaflar", "Kuaförler / berberler", "Güzellik salonları", "Butikler", "Emlakçılar", "Sigortacılar", "Oto galeriler", "Kafeler", "Restoranlar", "Spor salonları", "Diyetisyen / klinikler", "Eczaneler", "Aktarlar", "Eğitim kurumları", "Kargo şubeleri", "Telefoncular", "Petshoplar"],
    hints: ["Mahallendeki esnaflardan kimlerle selamlaşırsın?", "Düzenli alışveriş yaptığın dükkân sahipleri kim?", "Sana hizmet veren işletme sahipleri kim?"],
  },
  {
    key: "musteri", baslik: "Müşteri ve Ürün Adayları", altBaslik: "Ürün satışı yapıyorsan birebir",
    renk: "#0891B2", arkaplan: "#E0F7FB", icon: ShoppingBag, kaynakTip: "DIGER",
    subs: ["Daha önce ürün alanlar", "Ürünü sorup almayanlar", "Kampanya bekleyenler", "Tavsiye isteyenler", "Fiyat soranlar", "Numune isteyenler", "Tekrar sipariş zamanı gelenler", "Memnun müşteri çevresi", "Referans veren müşteriler"],
    hints: ["Daha önce senden ürün alan kim vardı?", "Fiyat sorup almayanlar kim?", "Tekrar sipariş zamanı gelen müşterilerin kim?"],
  },
  {
    key: "soguk", baslik: "Soğuk Pazar / Yeni Tanıştıklarım", altBaslik: "Yeni tanıştığın, henüz işlemediğin kişiler",
    renk: "#65A30D", arkaplan: "#F0F9E8", icon: Sparkles, kaynakTip: "DIGER",
    subs: ["Yeni tanıştığım kişiler", "Etkinlikte tanıştıklarım", "Fuarda tanıştıklarım", "Seminer / webinar katılımcıları", "Ortak arkadaş üzerinden tanıştıklarım", "Kartvizit aldıklarım", "Form dolduranlar", "Bilgi isteyenler", "Reklamdan gelenler"],
    hints: ["Son bir ayda yeni tanıştığın kim var?", "Kartvizit / numara aldığın ama aramadığın kişiler?", "Etkinlik veya seminerde tanıştıkların kim?"],
    not: "Yeni tanıştıkların için önce kısa bir tanışma mesajı iyi olur.",
  },
];

export default function Kesfet() {
  const router = useRouter();
  const [grupKey, setGrupKey] = useState<string | null>(null);
  const [sub, setSub] = useState<string | null>(null);
  const [arama, setArama] = useState("");

  const grup = GRUPLAR.find((g) => g.key === grupKey) ?? null;
  const ara = arama.trim().toLocaleLowerCase("tr");

  function gruptanCik() { setGrupKey(null); setSub(null); }
  function altKaynaktanCik() { setSub(null); }

  // ---- Detay (alt kaynak seçili) ----
  if (grup && sub) {
    return (
      <DetayEkle
        grup={grup}
        sub={sub}
        onGeri={altKaynaktanCik}
        onListeyeGit={() => router.push("/panel/liste")}
      />
    );
  }

  // ---- Grup görünümü (alt kaynak listesi) ----
  if (grup) {
    return (
      <div className="space-y-4">
        <button onClick={gruptanCik} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
          <ChevronLeft size={17} /> Kaynaklar
        </button>

        <div className="flex items-center gap-3 rounded-3xl p-5" style={{ background: grup.arkaplan }}>
          <span className="flex h-[50px] w-[50px] flex-none items-center justify-center rounded-2xl bg-white shadow-sm" style={{ color: grup.renk }}>
            <grup.icon size={24} />
          </span>
          <div>
            <div className="text-lg font-extrabold text-slate-900">{grup.baslik}</div>
            <div className="mt-0.5 text-[12.5px] font-semibold text-slate-500">{grup.altBaslik}</div>
          </div>
        </div>

        {grup.not && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3">
            <AlertTriangle size={18} className="mt-0.5 flex-none text-amber-600" />
            <div className="text-xs font-semibold leading-relaxed text-amber-800">{grup.not}</div>
          </div>
        )}

        <div className="text-[13px] font-bold text-slate-500">Bir alt kaynak seç:</div>
        <div className="flex flex-col gap-2.5">
          {grup.subs.map((s) => (
            <button
              key={s}
              onClick={() => setSub(s)}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition hover:bg-slate-50"
            >
              <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: grup.renk }} />
              <span className="flex-1 text-[14.5px] font-bold text-slate-900">{s}</span>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---- Arama sonuçları ----
  if (ara) {
    const rows: { name: string; grupBaslik: string; renk: string; grupKey: string }[] = [];
    GRUPLAR.forEach((g) => g.subs.forEach((s) => {
      if (s.toLocaleLowerCase("tr").includes(ara) || g.baslik.toLocaleLowerCase("tr").includes(ara))
        rows.push({ name: s, grupBaslik: g.baslik, renk: g.renk, grupKey: g.key });
    }));
    return (
      <div className="space-y-4">
        <Baslik arama={arama} setArama={setArama} onYeniAday={() => router.push("/panel/kisi/yeni")} />
        <div className="text-[13px] font-bold text-slate-500">Sonuçlar</div>
        <div className="flex flex-col gap-2.5">
          {rows.slice(0, 30).map((r, i) => (
            <button
              key={r.grupKey + i}
              onClick={() => { setGrupKey(r.grupKey); setSub(r.name); }}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-left shadow-sm transition hover:bg-slate-50"
            >
              <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: r.renk }} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900">{r.name}</div>
                <div className="text-[11.5px] font-semibold text-slate-400">{r.grupBaslik}</div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          ))}
          {rows.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm font-medium text-slate-400">
              Eşleşen kaynak bulunamadı.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- Grup kartları (Keşfet ana sayfa) ----
  return (
    <div className="space-y-4">
      <Baslik arama={arama} setArama={setArama} onYeniAday={() => router.push("/panel/kisi/yeni")} />
      <div className="text-[13px] font-bold text-slate-500">Bir kaynak seç, aklına gelenleri ekle:</div>
      <div className="flex flex-col gap-2.5">
        {GRUPLAR.map((g) => (
          <button
            key={g.key}
            onClick={() => setGrupKey(g.key)}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl" style={{ background: g.arkaplan, color: g.renk }}>
              <g.icon size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-extrabold text-slate-900">{g.baslik}</div>
              <div className="mt-0.5 text-xs font-semibold leading-snug text-slate-500">{g.altBaslik}</div>
            </div>
            <div className="flex flex-none flex-col items-end gap-1.5">
              <span className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold" style={{ background: g.arkaplan, color: g.renk }}>
                {g.subs.length} kaynak
              </span>
              <ChevronRight size={20} className="text-slate-300" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Baslik({ arama, setArama, onYeniAday }: { arama: string; setArama: (v: string) => void; onYeniAday: () => void }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Aday İsmi Keşfet</h1>
      <p className="mb-4 mt-1.5 text-[13.5px] font-semibold text-slate-500">
        Aklına gelen kişileri kategorilere göre listele. Her kaynak sana yeni aday fikirleri verir.
      </p>
      <button
        onClick={onYeniAday}
        className="mb-3.5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-br from-[#142C57] to-[#0B1B3C] py-4 text-[15px] font-bold text-white shadow-lg transition active:scale-[.985]"
      >
        <Zap size={20} className="fill-amber-300 text-amber-300" /> Hemen Yeni Aday Ekle
      </button>
      <label className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-3">
        <Search size={18} className="text-slate-400" />
        <input
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Kaynak ara: aile, esnaf, instagram…"
          className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
        />
      </label>
    </div>
  );
}

function DetayEkle({
  grup, sub, onGeri, onListeyeGit,
}: {
  grup: Grup;
  sub: string;
  onGeri: () => void;
  onListeyeGit: () => void;
}) {
  const [ad, setAd] = useState("");
  const [telefon, setTelefon] = useState("");
  const [hata, setHata] = useState("");
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [eklenenler, setEklenenler] = useState<string[]>([]);
  const adRef = useRef<HTMLInputElement>(null);
  const telefonRef = useRef<HTMLInputElement>(null);

  useEffect(() => { adRef.current?.focus(); }, [sub]);

  const ipuclari = [`« ${sub} » deyince aklına ilk gelen 3 kişi kim?`, ...grup.hints];

  async function ekle() {
    if (kaydediliyor) return;
    const isim = ad.trim();
    const tel = telefon.trim();
    if (!isim) { setHata("İsim gerekli."); return; }
    if (tel.replace(/\D/g, "").length < 10) { setHata("Telefon numarası zorunlu — sadece isim yeterli değil."); return; }
    setKaydediliyor(true);
    const sonuc = await hizliAdayEkle({
      ad: isim, telefon: tel, kaynakTip: grup.kaynakTip, kaynakNot: sub, sinif: "musteri", skor: 3,
    });
    setKaydediliyor(false);
    if (sonuc.ok) {
      setEklenenler((p) => [isim, ...p]);
      setAd(""); setTelefon(""); setHata("");
      adRef.current?.focus();
    } else {
      setHata("Eklenemedi, tekrar dene.");
    }
  }

  return (
    <div className="space-y-3.5">
      <button onClick={onGeri} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
        <ChevronLeft size={17} /> {grup.baslik}
      </button>
      <h1 className="text-xl font-extrabold text-slate-900">{sub}</h1>

      {/* İpuçları */}
      <div className="rounded-3xl border border-slate-200 bg-white p-[18px] shadow-sm">
        <div className="mb-3.5 flex items-center gap-2.5">
          <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Lightbulb size={19} />
          </span>
          <div className="text-[14.5px] font-extrabold text-slate-900">Aklına getirecek ipuçları</div>
        </div>
        <div className="flex flex-col gap-3">
          {ipuclari.map((h, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-emerald-50 text-xs font-extrabold text-emerald-700">{i + 1}</span>
              <div className="pt-0.5 text-sm font-semibold leading-snug text-slate-600">{h}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hızlı ekle */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-extrabold text-slate-900">Aklına geleni hemen ekle</div>
        <div className="mb-3 mt-0.5 text-xs font-semibold text-slate-500">İsim + telefon birlikte gerekli — sadece isim işine yaramaz.</div>

        <div className="mb-1.5 text-[12.5px] font-bold text-slate-600">Ad Soyad *</div>
        <input
          ref={adRef}
          value={ad}
          onChange={(e) => setAd(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && telefonRef.current?.focus()}
          placeholder="Örn. Mehmet Yılmaz"
          className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
        />
        <div className="mb-1.5 text-[12.5px] font-bold text-slate-600">GSM Telefon *</div>
        <input
          ref={telefonRef}
          value={telefon}
          onChange={(e) => setTelefon(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ekle()}
          type="tel"
          inputMode="tel"
          placeholder="05XX XXX XX XX"
          className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
        />

        {hata && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
            <AlertCircle size={16} className="flex-none text-red-600" />
            <span className="text-[12.5px] font-bold text-red-600">{hata}</span>
          </div>
        )}

        <button
          onClick={ekle}
          disabled={kaydediliyor}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#1FB46A] to-[#0E8A4D] py-3.5 text-[14.5px] font-bold text-white shadow-md transition active:scale-[.99] disabled:opacity-50"
        >
          <Plus size={18} /> {kaydediliyor ? "Ekleniyor…" : "Listeye Ekle"}
        </button>
      </div>

      {/* Bu oturumda eklenenler */}
      {eklenenler.length > 0 && (
        <div>
          <div className="mb-2.5 text-[12.5px] font-extrabold text-emerald-700">Bu kaynaktan eklediklerin ({eklenenler.length})</div>
          <div className="mb-3.5 flex flex-wrap gap-2">
            {eklenenler.map((nm, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[12.5px] font-bold text-emerald-700">
                <Check size={13} /> {nm}
              </span>
            ))}
          </div>
          <button
            onClick={onListeyeGit}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#0B1B3C] bg-white py-3 text-sm font-bold text-[#0B1B3C] transition hover:bg-slate-50"
          >
            Adaylar listesine git <ChevronRight size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
