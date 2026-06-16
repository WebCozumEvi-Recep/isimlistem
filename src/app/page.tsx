import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AnaSayfa() {
  const session = await getSession();
  redirect(session ? "/panel" : "/auth/giris");
}
