// Mesaj değişken doldurma + wa.me URL üretimi — saf fonksiyonlar (test edilebilir).

export type MesajDegiskenleri = {
  ad?: string | null;
  soyad?: string | null;
  tam_ad?: string | null;
  networker_ad?: string | null;
  networker_telefon?: string | null;
  ozel_davet_linki?: string | null;
};

const DESTEKLENEN = [
  "ad",
  "soyad",
  "tam_ad",
  "networker_ad",
  "networker_telefon",
  "ozel_davet_linki",
] as const;

/** {ad}, {ozel_davet_linki} gibi değişkenleri doldurur. Bilinmeyen değişkenleri olduğu gibi bırakır. */
export function mesajDoldur(sablon: string, d: MesajDegiskenleri): string {
  return sablon.replace(/\{(\w+)\}/g, (eslesme, anahtar: string) => {
    if (!(DESTEKLENEN as readonly string[]).includes(anahtar)) return eslesme;
    const deger = (d as Record<string, string | null | undefined>)[anahtar];
    return deger != null && deger !== "" ? String(deger) : "";
  });
}

/** Telefonu wa.me biçimine indirger: yalnız rakamlar, baştaki 0 → 90 (TR varsayımı). */
export function telefonNormalize(telefon: string | null | undefined): string | null {
  if (!telefon) return null;
  let s = telefon.replace(/\D/g, "");
  if (s.length === 0) return null;
  if (s.startsWith("90")) {
    // hazır
  } else if (s.startsWith("0")) {
    s = "90" + s.slice(1);
  } else if (s.length === 10) {
    s = "90" + s;
  }
  return s;
}

/** wa.me linki üretir. Telefon yoksa numarasız (kullanıcı kişi seçer) link döner. */
export function waMeUrl(telefon: string | null | undefined, mesaj: string): string {
  const num = telefonNormalize(telefon);
  const metin = encodeURIComponent(mesaj);
  return num ? `https://wa.me/${num}?text=${metin}` : `https://wa.me/?text=${metin}`;
}
