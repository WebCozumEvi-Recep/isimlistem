import { prisma } from "@/lib/prisma";
import AuthKabuk from "@/components/AuthKabuk";
import SifreSifirlaForm from "@/components/SifreSifirlaForm";
import Link from "next/link";

export default async function SifreSifirlaSayfasi({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const kayit = await prisma.parolaSifirlama.findUnique({ where: { token } });
  const gecerli = kayit && kayit.sonKullanma > new Date();

  return (
    <AuthKabuk>
      {gecerli ? (
        <SifreSifirlaForm token={token} />
      ) : (
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Bağlantı geçersiz</h1>
          <p className="mt-2 text-sm text-slate-500">
            Bu parola sıfırlama bağlantısı geçersiz veya süresi dolmuş (bağlantılar 1 saat geçerlidir).
          </p>
          <Link href="/auth/sifremi-unuttum" className="mt-5 inline-block rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white">
            Yeni bağlantı iste
          </Link>
        </div>
      )}
    </AuthKabuk>
  );
}
