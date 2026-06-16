// Aday ilgi skoru — event geçmişinden baştan hesaplanır (idempotent, saf fonksiyon).
// Dokümana göre: docs/07-skorlama-gorunurluk-kvkk.md

export type SkorOlay = {
  olayTip: string;
  scrollYuzde?: number | null;
  videoYuzde?: number | null;
  sayfadaSure?: number | null;
};

/**
 * Olay listesinden skor hesaplar. Eşik bazlı tekillik:
 * - scroll ve video için EN YÜKSEK eşik bir kez sayılır.
 * - her sinyal türü bir kez katkı verir.
 * - sonuç 0 altına inmez.
 */
export function skorHesapla(olaylar: SkorOlay[]): number {
  let skor = 0;

  const acildi = olaylar.some((o) => o.olayTip === "page_opened" || o.olayTip === "first_opened");
  if (acildi) skor += 10;

  // İkinci kez açma — en fazla bir kez +5
  const acilmaSayisi = olaylar.filter(
    (o) => o.olayTip === "page_opened" || o.olayTip === "first_opened"
  ).length;
  if (acilmaSayisi >= 2) skor += 5;

  // Sayfada 60sn+
  const maxSure = Math.max(0, ...olaylar.map((o) => o.sayfadaSure ?? 0));
  if (maxSure >= 60) skor += 10;

  // Scroll — en yüksek eşik
  const maxScroll = Math.max(
    0,
    ...olaylar.map((o) => o.scrollYuzde ?? scrollEsik(o.olayTip))
  );
  if (maxScroll >= 75) skor += 15;
  else if (maxScroll >= 50) skor += 10;

  // Video — başlatma + en yüksek eşik
  const videoBasladi = olaylar.some((o) => o.olayTip === "video_started");
  if (videoBasladi) skor += 15;
  const maxVideo = Math.max(
    0,
    ...olaylar.map((o) => o.videoYuzde ?? videoEsik(o.olayTip))
  );
  if (maxVideo >= 90) skor += 30;
  else if (maxVideo >= 50) skor += 20;

  // CTA sinyalleri (her biri bir kez)
  if (olaylar.some((o) => o.olayTip === "cta_interested")) skor += 50;
  if (olaylar.some((o) => o.olayTip === "cta_more_info")) skor += 40;
  if (olaylar.some((o) => o.olayTip === "whatsapp_clicked")) skor += 40;
  if (olaylar.some((o) => o.olayTip === "appointment_requested")) skor += 70;
  if (olaylar.some((o) => o.olayTip === "cta_not_interested")) skor -= 50;

  return Math.max(0, skor);
}

function scrollEsik(olayTip: string): number {
  const m = /^scroll_(\d+)$/.exec(olayTip);
  return m ? Number(m[1]) : 0;
}

function videoEsik(olayTip: string): number {
  const m = /^video_(\d+)$/.exec(olayTip);
  return m ? Number(m[1]) : 0;
}
