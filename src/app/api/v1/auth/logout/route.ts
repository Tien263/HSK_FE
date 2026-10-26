import { NextResponse } from "next/server";
import { dictionaryCookieOptions, DICTIONARY_SESSION_COOKIE } from "@/lib/dictionary-session";

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });
  response.cookies.set(DICTIONARY_SESSION_COOKIE, "", { ...dictionaryCookieOptions(request), maxAge: 0 });
  return response;
}
