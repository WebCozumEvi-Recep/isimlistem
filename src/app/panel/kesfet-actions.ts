"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { KAYNAK_TIPLERI, type KaynakTip } from "@/lib/sabitler";

const SINIF_ADAYTIPI: Record<string, "LIDER" | "IS_FIRSATI" | "URUN_MUSTERISI"> = {
  lider: "LIDER",
  satis: "IS_FIRSATI",
  musteri: "URUN_MUSTERISI",
};

function skorSicaklik(skor: number): "SOGUK" | "ILIK" | "SICAK" | "COK_SICAK" {
  if (skor >= 5) return "COK_SICAK";
  if (skor === 4) return "SICAK";
  if (skor === 3) return "ILIK";
  return "SOGUK";
}

export type HizliAday = {
  ad: string;
  telefon: string;
  not?: string;
  kaynakTip: string;
  kaynakNot?: string;
  sinif: string;
  skor: number;
};

/** Keşfet akışından hızlı aday ekleme. GSM telefon zorunlu (aksiyon için gerekli). */
export async function hizliAdayEkle(veri: HizliAday): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const ad = veri.ad?.trim();
  const telefon = veri.telefon?.trim();
  if (!ad || !telefon) return { ok: false };

  const kaynakTip: KaynakTip = (KAYNAK_TIPLERI as readonly string[]).includes(veri.kaynakTip)
    ? (veri.kaynakTip as KaynakTip)
    : "DIGER";
  const adayTipi = SINIF_ADAYTIPI[veri.sinif] ?? "GENEL";
  const skor = Math.min(5, Math.max(1, Number(veri.skor) || 1));

  await prisma.kisi.create({
    data: {
      adSoyad: ad,
      telefon,
      notlar: veri.not?.trim() || null,
      kaynakTip,
      kaynakNot: veri.kaynakNot?.trim() || null,
      adayTipi,
      sicaklik: skorSicaklik(skor),
      oncelik: skor,
      durum: "YENI",
      kullaniciId: user.id,
      aktiviteler: { create: { durum: "YENI", aciklama: "Keşfet ile eklendi" } },
    },
  });

  revalidatePath("/panel/liste");
  revalidatePath("/panel");
  return { ok: true };
}
