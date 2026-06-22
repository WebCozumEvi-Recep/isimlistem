import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randevuDurumGuncelle } from "@/app/panel/davet-actions";
import { Check } from "lucide-react";

const RANDEVU_TIP_ETIKET: Record<string, string> = {
  TELEFON: "Telefon", WHATSAPP: "WhatsApp", ZOOM: "Zoom", YUZ_YUZE: "Yüz yüze", OFIS: "Ofis", DIGER: "Diğer",
};
const DURUM_ETIKET: Record<string, string> = {
  TALEP: "Yeni talep", ONAYLANDI: "Onaylandı", REDDEDILDI: "Reddedildi", ERTELENDI: "Ertelendi", TAMAMLANDI: "Tamamlandı", IPTAL: "İptal",
};
const RANDEVU_DURUM_SECENEK = ["TALEP", "ONAYLANDI", "ERTELENDI", "TAMAMLANDI", "REDDEDILDI", "IPTAL"] as const;
const DURUM_RENK: Record<string, string> = {
  TALEP: "bg-amber-100 text-amber-700", ONAYLANDI: "bg-emerald-100 text-emerald-700",
  REDDEDILDI: "bg-rose-100 text-rose-700", ERTELENDI: "bg-sky-100 text-sky-700",
  TAMAMLANDI: "bg-slate-200 text-slate-700", IPTAL: "bg-slate-100 text-slate-500",
};
const AVATAR_RENK = ["#16B364", "#2563EB", "#9333EA", "#D97706", "#0EA5A0", "#E11D6B"];
function basHarf(ad: string) {
  return ad.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toLocaleUpperCase("tr");
}

const AY_ADI = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

/** "18 Haziran 2026 Çarşamba, 14:30 (30 dk)" → Date | null. */
function tarihAyikla(metin?: string | null): Date | null {
  if (!metin) return null;
  const m = /(\d{1,2})\s+([A-Za-zçğıöşüÇĞİÖŞÜ]+)\s+(\d{4}).*?(\d{1,2}):(\d{2})/.exec(metin);
  if (!m) return null;
  const ay = AY_ADI.findIndex((a) => a.toLocaleLowerCase("tr") === m[2].toLocaleLowerCase("tr"));
  if (ay < 0) return null;
  const d = new Date(Number(m[3]), ay, Number(m[1]), Number(m[4]), Number(m[5]));
  return isNaN(d.getTime()) ? null : d;
}

const FILTRELER = [
  { anahtar: "tumu", etiket: "Tümü", durumlar: null as string[] | null },
  { anahtar: "bekleyen", etiket: "Bekleyen", durumlar: ["TALEP", "ERTELENDI"] },
  { anahtar: "onayli", etiket: "Onaylı", durumlar: ["ONAYLANDI"] },
  { anahtar: "tamamlanan", etiket: "Tamamlanan", durumlar: ["TAMAMLANDI"] },
];

export default async function RandevularSayfasi({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const user = await requireUser();
  const { f } = await searchParams;
  const aktif = FILTRELER.find((x) => x.anahtar === f) ?? FILTRELER[0];

  const randevular = await prisma.randevuTalebi.findMany({
    where: {
      kullaniciId: user.id,
      ...(aktif.durumlar ? { durum: { in: aktif.durumlar as never } } : {}),
    },
    include: { kisi: { select: { id: true, adSoyad: true, telefon: true } } },
  });

  // Görüşme tarihine göre sırala: yaklaşan/gelecek önce, tarihsizler ve geçmişler sona.
  const simdi = new Date().getTime();
  const sirali = randevular
    .map((r) => ({ r, gorusme: tarihAyikla(r.tarihMetni) }))
    .sort((a, b) => {
      const ta = a.gorusme?.getTime() ?? null;
      const tb = b.gorusme?.getTime() ?? null;
      const ga = ta !== null && ta >= simdi;
      const gb = tb !== null && tb >= simdi;
      if (ga && gb) return ta! - tb!;            // ikisi de gelecek → en yakın önce
      if (ga !== gb) return ga ? -1 : 1;          // gelecek olan önce
      // ikisi de geçmiş/tarihsiz → talep zamanı yeni önce
      return b.r.createdAt.getTime() - a.r.createdAt.getTime();
    });

  return (
    <div className="space-y-4">
      <h1 className="text-[21px] font-extrabold text-[#0F1B2D]">Randevular</h1>

      <div className="-mx-[18px] flex gap-2 overflow-x-auto px-[18px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTRELER.map((x) => (
          <Link
            key={x.anahtar}
            href={x.anahtar === "tumu" ? "/panel/randevular" : `/panel/randevular?f=${x.anahtar}`}
            className={`flex-none rounded-full px-4 py-2 text-[13px] font-bold ${aktif.anahtar === x.anahtar ? "bg-[#0B1B3C] text-white" : "border border-[#E4E9F0] bg-white text-[#3B4759] hover:bg-slate-50"}`}
          >
            {x.etiket}
          </Link>
        ))}
      </div>

      {sirali.length === 0 ? (
        <p className="rounded-2xl border border-[#ECEFF3] bg-white p-6 text-sm text-slate-500">
          {aktif.anahtar === "tumu"
            ? "Henüz randevu talebi yok. Adaylar davet sayfasından randevu istediğinde burada görünecek."
            : "Bu filtreye uygun randevu yok."}
        </p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {sirali.map(({ r, gorusme }, i) => (
            <div key={r.id} className="rounded-[20px] border border-[#ECEFF3] bg-white p-[17px] shadow-[0_10px_26px_-20px_rgba(15,27,45,.5)]">
              <div className="mb-2 flex items-center gap-3">
                <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[14px] text-[14px] font-extrabold text-white" style={{ background: AVATAR_RENK[i % AVATAR_RENK.length] }}>
                  {basHarf(r.kisi.adSoyad)}
                </span>
                <Link href={`/panel/kisi/${r.kisi.id}`} className="text-[15.5px] font-extrabold text-[#0F1B2D]">
                  {r.kisi.adSoyad}
                </Link>
              </div>
              <div className="mb-2.5 text-[12.5px] font-semibold leading-relaxed text-[#7A8799]">
                {RANDEVU_TIP_ETIKET[r.tip]} {r.tarihMetni ? `· ${r.tarihMetni}` : ""}
                {r.kisi.telefon ? ` · ${r.kisi.telefon}` : ""}
              </div>
              <div className="mb-3.5 flex flex-wrap gap-2">
                {gorusme && gorusme.getTime() >= simdi && (
                  <span className="rounded-full bg-[#EAF1FF] px-3 py-1 text-[11.5px] font-bold text-[#2563EB]">Yaklaşan</span>
                )}
                <span className={`rounded-full px-3 py-1 text-[11.5px] font-bold ${DURUM_RENK[r.durum]}`}>
                  {DURUM_ETIKET[r.durum]}
                </span>
              </div>
              {r.mesaj && <p className="mb-2.5 text-[13px] text-[#5A6678]">&ldquo;{r.mesaj}&rdquo;</p>}
              {r.sonucNotu && (
                <p className="mb-2.5 rounded-xl bg-[#F4F6F9] px-3.5 py-2.5 text-[13px] text-[#5A6678]">
                  <span className="font-bold text-[#7A8799]">Sonuç notu:</span> {r.sonucNotu}
                </p>
              )}
              <form action={randevuDurumGuncelle.bind(null, r.id)} className="flex flex-col gap-2.5">
                <select name="durum" defaultValue={r.durum} className="rounded-xl border border-[#E4E9F0] bg-[#F4F6F9] px-3.5 py-3 text-[13.5px] font-bold text-[#3B4759]">
                  {RANDEVU_DURUM_SECENEK.map((d) => <option key={d} value={d}>{DURUM_ETIKET[d]}</option>)}
                </select>
                <input
                  name="sonucNotu"
                  defaultValue={r.sonucNotu ?? ""}
                  placeholder="Kapatma / sonuç notu (opsiyonel)"
                  className="rounded-xl border border-[#E4E9F0] bg-[#F4F6F9] px-3.5 py-3 text-[13px] outline-none placeholder:text-[#9AA7B8]"
                />
                <button className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0B1B3C] px-4 py-3 text-[14px] font-bold text-white hover:bg-[#16294e]">
                  <Check size={16} /> Güncelle
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
