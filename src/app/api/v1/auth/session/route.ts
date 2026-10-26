import {getAuthUser} from "@/lib/auth-server";
import { NextResponse } from "next/server";
import { createDictionarySession, dictionaryCookieOptions, DICTIONARY_SESSION_COOKIE, getDictionaryUser } from "@/lib/dictionary-session";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ authenticated: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const response = NextResponse.json({ authenticated: true, user }, { headers: { "Cache-Control": "no-store" } });
    const token = createDictionarySession(user.id);
    if (token) response.cookies.set(DICTIONARY_SESSION_COOKIE, token, dictionaryCookieOptions(request));
    return response;
  } catch {
    return NextResponse.json({ authenticated: false, message: "Chưa kiểm tra được phiên đăng nhập. Vui lòng thử lại." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
