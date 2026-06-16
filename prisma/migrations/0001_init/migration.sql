-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('UYE', 'ADMIN');

-- CreateEnum
CREATE TYPE "SunumDurum" AS ENUM ('YENI', 'ARANDI', 'RANDEVU', 'SUNUM_YAPILDI', 'TAKIP', 'KATILDI', 'KAYIP');

-- CreateEnum
CREATE TYPE "KaynakTip" AS ENUM ('AILE', 'AKRABA', 'ARKADAS', 'IS', 'KOMSU', 'OKUL', 'SOSYAL_MEDYA', 'REFERANS', 'DIGER');

-- CreateTable
CREATE TABLE "Kullanici" (
    "id" TEXT NOT NULL,
    "adSoyad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "parolaHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'UYE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kullanici_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kisi" (
    "id" TEXT NOT NULL,
    "adSoyad" TEXT NOT NULL,
    "telefon" TEXT,
    "email" TEXT,
    "kaynakTip" "KaynakTip" NOT NULL DEFAULT 'DIGER',
    "kaynakNot" TEXT,
    "durum" "SunumDurum" NOT NULL DEFAULT 'YENI',
    "oncelik" INTEGER NOT NULL DEFAULT 0,
    "notlar" TEXT,
    "sonTemas" TIMESTAMP(3),
    "sonrakiTakip" TIMESTAMP(3),
    "kullaniciId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aktivite" (
    "id" TEXT NOT NULL,
    "kisiId" TEXT NOT NULL,
    "durum" "SunumDurum" NOT NULL,
    "aciklama" TEXT,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aktivite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kullanici_email_key" ON "Kullanici"("email");

-- CreateIndex
CREATE INDEX "Kisi_kullaniciId_durum_idx" ON "Kisi"("kullaniciId", "durum");

-- AddForeignKey
ALTER TABLE "Kisi" ADD CONSTRAINT "Kisi_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "Kullanici"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aktivite" ADD CONSTRAINT "Aktivite_kisiId_fkey" FOREIGN KEY ("kisiId") REFERENCES "Kisi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

