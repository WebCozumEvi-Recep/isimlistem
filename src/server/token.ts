import "server-only";
import { randomBytes } from "crypto";

const ALFABE = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Tahmin edilemez, ~128-bit, URL-güvenli base62 token (≈22 karakter). */
export function davetToken(uzunluk = 22): string {
  const bytes = randomBytes(uzunluk);
  let s = "";
  for (let i = 0; i < uzunluk; i++) {
    s += ALFABE[bytes[i] % ALFABE.length];
  }
  return s;
}
