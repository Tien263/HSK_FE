import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const DICTIONARY_SESSION_COOKIE = "hsk_dictionary_session";
// 30 days lifetime so teachers and admins aren't logged out unexpectedly
const lifetime = 30 * 24 * 60 * 60;

function signingSecret(): string {
  const explicit = process.env.DICTIONARY_SESSION_SECRET || process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
  if (explicit) return explicit;
  if (process.env.DATABASE_URL) {
    return createHash("sha256").update(`hsk-dictionary-session:v1:${process.env.DATABASE_URL}`).digest("hex");
  }
  // Rock-solid fallback secret ensuring session validation never fails across server restarts
  return "hsk-edu-permanent-secure-session-secret-key-2026";
}

export function dictionaryCookieOptions(request: Request) {
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || new URL(request.url).protocol.replace(":", "");
  return { httpOnly: true, secure: protocol === "https", sameSite: "lax" as const, path: "/", maxAge: lifetime };
}

export function dictionarySameOrigin(request: Request) {
  try {
    const originHeader = request.headers.get("origin");
    if (!originHeader) return true;
    const origin = new URL(originHeader);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const rawHost = forwardedHost || request.headers.get("host") || new URL(request.url).host;
    const originHost = origin.host.split(":")[0].toLowerCase();
    const serverHost = rawHost.split(":")[0].toLowerCase();
    if (originHost === serverHost) return true;
    if (origin.hostname === "localhost" || origin.hostname === "127.0.0.1") return true;
    if (origin.hostname.endsWith(".onrender.com") || origin.hostname.endsWith(".vercel.app")) return true;
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(origin.hostname)) return true;
    return false;
  } catch { return false; }
}

export function createDictionarySession(userId: string) {
  const secret = signingSecret();
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
  try {
    const expected = createHmac("sha256", secret).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.userId !== "string" || typeof data.expires !== "number" || data.expires <= Date.now() / 1000) return null;
    return prisma.user.findFirst({
      where: { id: data.userId, status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        currentHskLevel: true,
        mustChangePassword: true,
      },
    });
  } catch {
    return null;
  }
}

export async function getDictionaryAdmin(request: Request) {
  const user = await getDictionaryUser(request);
  return user?.role === "ADMIN" ? user : null;
}
