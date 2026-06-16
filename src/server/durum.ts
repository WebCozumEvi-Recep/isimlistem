// Otomatik durum değerlendirme — davranış sinyallerini mevcut huni durumuna eşler.
// Yalnız ileri yönde ilerletir; manuel olarak KATILDI/KAYIP yapılmışsa dokunmaz.
import { SUNUM_DURUMLARI, type SunumDurum } from "@/lib/sabitler";

// Huni sırası (ileri = daha yüksek index). KAYIP terminaldir.
const SIRA: Record<SunumDurum, number> = {
  YENI: 0,
  ARANDI: 1,
  SUNUM_YAPILDI: 2,
  RANDEVU: 3,
  TAKIP: 2, // ilgileniyor ama henüz randevu yok
  KATILDI: 5,
  KAYIP: 5,
};

export type DurumOlay = { olayTip: string; videoYuzde?: number | null; scrollYuzde?: number | null };

/**
 * Olaylara göre hedef durumu hesaplar. Mevcut durumdan daha ileri ise döner,
 * değilse null (değişiklik yok). Manuel terminal durumlar (KATILDI/KAYIP) korunur.
 */
export function otomatikDurum(mevcut: SunumDurum, olaylar: DurumOlay[]): SunumDurum | null {
  if (mevcut === "KATILDI") return null;

  let hedef: SunumDurum = "YENI";

  const acildi = olaylar.some((o) => /opened/.test(o.olayTip));
  if (acildi) hedef = "ARANDI";

  const sundu = olaylar.some(
    (o) =>
      (o.videoYuzde ?? 0) >= 50 ||
      (o.scrollYuzde ?? 0) >= 75 ||
      /^video_(50|75|90)$/.test(o.olayTip) ||
      /^scroll_(75|100)$/.test(o.olayTip) ||
      o.olayTip === "cta_more_info"
  );
  if (sundu) hedef = "SUNUM_YAPILDI";

  if (olaylar.some((o) => o.olayTip === "cta_interested")) hedef = "TAKIP";
  if (olaylar.some((o) => o.olayTip === "appointment_requested")) hedef = "RANDEVU";

  const ilgisiz = olaylar.some((o) => o.olayTip === "cta_not_interested");
  if (ilgisiz) return mevcut === "KAYIP" ? null : "KAYIP";

  if (!SUNUM_DURUMLARI.includes(hedef)) return null;
  return SIRA[hedef] > SIRA[mevcut] ? hedef : null;
}
