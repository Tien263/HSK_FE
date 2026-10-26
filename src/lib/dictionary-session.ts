import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const DICTIONARY_SESSION_COOKIE = "hsk_dictionary_session";
const lifetime = 12 * 60 * 60;

function signingSecret() {
  const explicit = process.env.DICTIONARY_SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (explicit) return explicit;
  // Stable across restarts/replicas even when a deployment has no auth-secret setting.
  // DATABASE_URL is already a server-only credential required by this application.
  return process.env.DATABASE_URL ? createHash("sha256").update(`hsk-dictionary-session:v1:${process.env.DATABASE_URL}`).digest("hex") : null;
}

export function dictionaryCookieOptions(request: Request) {
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || new URL(request.url).protocol.replace(":", "");
  return { httpOnly: true, secure: protocol === "https", sameSite: "lax" as const, path: "/", maxAge: lifetime };
}

export function dictionarySameOrigin(request: Request) {
  try {
    const origin = new URL(request.headers.get("origin") || "");
    const host = request.headers.get("host") || new URL(request.url).host;
    const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || new URL(request.url).protocol.replace(":", "");
    return origin.host === host && origin.protocol === `${protocol}:`;
  } catch { return false; }
}

export function createDictionarySession(userId: string) {
  const secret = signingSecret();
  if (!secret) return null;
  const payload = Buffer.from(JSON.stringify({ userId, expires: Math.floor(Date.now() / 1000) + lifetime })).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
}

export async function getDictionaryUser(request: Request) {
  const secret = signingSecret();
  if (!secret) return null;
  const token = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${DICTIONARY_SESSION_COOKIE}=`))?.slice(DICTIONARY_SESSION_COOKIE.length + 1);
  if (!token) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  let userId: string;
  try {
    const expected = createHmac("sha256", secret).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.userId !== "string" || typeof data.expires !== "number" || data.expires <= Date.now() / 1000) return null;
    userId = data.userId;
  } catch { return null; }
  return prisma.user.findFirst({ where: { id: userId, status: "ACTIVE" }, select: { id: true, name: true, username: true, role: true } });
}

export async function getDictionaryAdmin(request: Request) {
  const user = await getDictionaryUser(request);
  return user?.role === "ADMIN" ? user : null;
}
