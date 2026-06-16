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
