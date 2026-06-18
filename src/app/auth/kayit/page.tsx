import AuthForm from "@/components/AuthForm";
import AuthKabuk from "@/components/AuthKabuk";
import { hostFirma } from "@/lib/host";

export default async function KayitSayfasi() {
  const firma = await hostFirma();
  return (
    <AuthKabuk>
      <AuthForm mod="kayit" firmaModu={!!firma} />
    </AuthKabuk>
  );
}
