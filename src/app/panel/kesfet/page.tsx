import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Kesfet from "@/components/Kesfet";

export default async function KesfetSayfasi() {
  const user = await requireUser();
  const sayi = await prisma.kisi.count({ where: { kullaniciId: user.id } });
  return <Kesfet baslangicSayi={sayi} />;
}
