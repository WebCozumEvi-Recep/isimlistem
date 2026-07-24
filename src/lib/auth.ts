import "server-only";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/auth/giris");
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireUser();
  if (session.rol !== "ADMIN") redirect("/panel");
  return session;
}

/** Demo/misafir oturumunda kişi ekleme üst sınırı. */
export const DEMO_KISI_LIMIT = 3;

/** Oturum demo (misafir) modu mu? Write action'larını kısıtlamak için kullanılır. */
export async function demoModuMu(): Promise<boolean> {
  const session = await getSession();
  return session?.demo === true;
}
