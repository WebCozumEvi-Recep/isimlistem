import AuthForm from "@/components/AuthForm";
import AuthKabuk from "@/components/AuthKabuk";

export default function GirisSayfasi() {
  return (
    <AuthKabuk>
      <AuthForm mod="giris" />
    </AuthKabuk>
  );
}
