import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import Kesfet from "@/components/Kesfet";

export default async function KesfetSayfasi() {
  const user = await requireUser();
  // Demo modunda Keşfet kapalı.
  if (user.demo) redirect("/panel");
  return <Kesfet />;
}
