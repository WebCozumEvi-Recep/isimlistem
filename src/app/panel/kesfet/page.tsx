import { requireUser } from "@/lib/auth";
import Kesfet from "@/components/Kesfet";

export default async function KesfetSayfasi() {
  await requireUser();
  return <Kesfet />;
}
