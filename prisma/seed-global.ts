// Global (tüm networker'ların kullanabileceği) mesaj kalıpları — idempotent.
// Canlıda çalıştır: npm run db:seed-global
import { config } from "dotenv";
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const KALIPLAR = [
  {
    baslik: "İlk Temas — Kısa Tanıtım",
    kategori: "ilk_temas",
    metin:
      "Merhaba {ad}, sana bahsettiğim konuyu daha kolay inceleyebilmen için kısa bir tanıtım sayfası hazırladım.\n\nBuradan sana özel sayfaya bakabilirsin:\n{ozel_davet_linki}\n\nUygun olduğunda inceledikten sonra görüşelim.",
  },
  {
    baslik: "Sunum Gönderme",
    kategori: "sunum",
    metin:
      "Merhaba {ad}, konuştuğumuz sunumu sana özel hazırladım. 5 dakikanı ayırıp şu linkten izleyebilirsin:\n{ozel_davet_linki}\n\nİzledikten sonra fikrini merak ediyorum 🙂",
  },
  {
    baslik: "Takip Mesajı",
    kategori: "takip",
    metin:
      "Selam {ad}, geçen gün paylaştığım sayfaya göz atabildin mi? Aklına takılan olursa çekinme, buradayım:\n{ozel_davet_linki}",
  },
  {
    baslik: "Toplantı Daveti",
    kategori: "toplanti",
    metin:
      "Merhaba {ad}, bu konuyu birlikte değerlendirmek için kısa bir görüşme yapalım mı? Detaylar ve randevu için:\n{ozel_davet_linki}",
  },
];

async function main() {
  for (const k of KALIPLAR) {
    const var_ = await prisma.mesajKalibi.findFirst({
      where: { sahiplik: "GLOBAL", baslik: k.baslik },
    });
    if (var_) {
      await prisma.mesajKalibi.update({ where: { id: var_.id }, data: { metin: k.metin, kategori: k.kategori } });
    } else {
      await prisma.mesajKalibi.create({
        data: { sahiplik: "GLOBAL", kullaniciId: null, baslik: k.baslik, kategori: k.kategori, metin: k.metin },
      });
    }
  }
  console.log(`Global kalıplar hazır: ${KALIPLAR.length} kayıt.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
