import { config } from "dotenv";
config({ path: ".env" });

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const parolaHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.kullanici.upsert({
    where: { email: "admin@isimlistem.com" },
    update: {},
    create: {
      adSoyad: "Firma Yöneticisi",
      email: "admin@isimlistem.com",
      parolaHash,
      rol: "ADMIN",
    },
  });

  const uye = await prisma.kullanici.upsert({
    where: { email: "uye@isimlistem.com" },
    update: {},
    create: {
      adSoyad: "Ayşe Üye",
      email: "uye@isimlistem.com",
      parolaHash,
      rol: "UYE",
    },
  });

  const dun = new Date();
  dun.setDate(dun.getDate() - 1);

  await prisma.kisi.deleteMany({ where: { kullaniciId: uye.id } });
  await prisma.kisi.createMany({
    data: [
      {
        adSoyad: "Mehmet Demir",
        telefon: "0532 111 22 33",
        kaynakTip: "ARKADAS",
        kaynakNot: "Liseden arkadaşım",
        durum: "SUNUM_YAPILDI",
        oncelik: 4,
        sonrakiTakip: dun,
        kullaniciId: uye.id,
      },
      {
        adSoyad: "Fatma Yılmaz",
        telefon: "0533 444 55 66",
        kaynakTip: "AKRABA",
        kaynakNot: "Kuzenim",
        durum: "ARANDI",
        oncelik: 3,
        kullaniciId: uye.id,
      },
      {
        adSoyad: "Ali Kaya",
        email: "ali@example.com",
        kaynakTip: "IS",
        durum: "YENI",
        oncelik: 2,
        kullaniciId: uye.id,
      },
      {
        adSoyad: "Zeynep Şahin",
        telefon: "0534 777 88 99",
        kaynakTip: "KOMSU",
        durum: "KATILDI",
        oncelik: 5,
        kullaniciId: uye.id,
      },
    ],
  });

  console.log("Seed tamam:", { admin: admin.email, uye: uye.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
