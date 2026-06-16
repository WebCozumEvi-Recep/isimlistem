import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { sayfaDuzenleyebilir } from "@/lib/firma";
import { prisma } from "@/lib/prisma";
import DavetBuilder from "@/components/DavetBuilder";

export default async function SayfaBuilderSayfasi({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const erisim = await sayfaDuzenleyebilir(id, user.id);
  if (!erisim) notFound();
  const sayfa = await prisma.davetSayfasi.findUnique({
    where: { id },
    include: { moduller: { orderBy: { sira: "asc" } } },
  });
  if (!sayfa) notFound();

  return (
    <DavetBuilder
      sayfaId={sayfa.id}
      baslik={sayfa.baslik}
      durum={sayfa.durum}
      moduller={sayfa.moduller.map((m) => ({ id: m.id, tip: m.tip as string, sira: m.sira, icerik: m.icerik as Record<string, unknown> }))}
    />
  );
}
