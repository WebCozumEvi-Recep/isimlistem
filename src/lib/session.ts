import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "isimlistem_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "gelistirme-gizli-anahtari-degistir"
);

export type SessionPayload = {
  id: string;
  adSoyad: string;
  email: string;
  rol: "UYE" | "ADMIN";
};

export async function setSession(payload: SessionPayload, kalici = true) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(kalici ? "30d" : "1d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // "Beni hatırla" işaretliyse 30 gün kalıcı; değilse oturum çerezi (tarayıcı kapanınca silinir).
    ...(kalici ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}
