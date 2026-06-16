import * as XLSX from "xlsx";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DURUM_ETIKET,
  KAYNAK_ETIKET,
  type SunumDurum,
  type KaynakTip,
} from "@/lib/sabitler";

export async function GET() {
  const user = await requireUser();
  const kisiler = await prisma.kisi.findMany({
    where: { kullaniciId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const satirlar = kisiler.map((k) => ({
    "Ad Soyad": k.adSoyad,
    Telefon: k.telefon ?? "",
    "E-posta": k.email ?? "",
    Kaynak: KAYNAK_ETIKET[k.kaynakTip as KaynakTip],
    "Bağ Notu": k.kaynakNot ?? "",
    Durum: DURUM_ETIKET[k.durum as SunumDurum],
    Öncelik: k.oncelik,
    "Sonraki Takip": k.sonrakiTakip
      ? k.sonrakiTakip.toLocaleDateString("tr-TR")
      : "",
    Notlar: k.notlar ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(satirlar);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "İsim Listesi");
  const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="isim-listesi.xlsx"`,
    },
  });
}
