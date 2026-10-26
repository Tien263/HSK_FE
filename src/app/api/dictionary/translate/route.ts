import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dictionarySameOrigin, getDictionaryUser } from "@/lib/dictionary-session";
import { DictionaryAiError, translateDictionarySentence } from "@/lib/dictionary-ai";

type Translation = { sourceText: string; translatedText: string; pinyin: string; targetLanguage: string };
const shared = globalThis as typeof globalThis & {
  dictionarySentenceQuota?: Map<string, { count: number; expires: number }>;
  dictionarySentencePending?: Map<string, Promise<Translation>>;
};
const quotas = shared.dictionarySentenceQuota ??= new Map();
const pending = shared.dictionarySentencePending ??= new Map();
const selection = { sourceText: true, translatedText: true, pinyin: true, targetLanguage: true } as const;

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  try {
    if (!dictionarySameOrigin(request)) return NextResponse.json({ message: "Nguồn yêu cầu không hợp lệ." }, { status: 403, headers });
    const user = await getDictionaryUser(request);
    if (!user) return NextResponse.json({ message: "Bạn cần đăng nhập để dùng dịch câu AI." }, { status: 401, headers });
    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ message: "Nội dung yêu cầu không hợp lệ." }, { status: 400, headers }); }
    if (typeof body?.text !== "string") return NextResponse.json({ message: "Vui lòng nhập câu cần dịch." }, { status: 400, headers });
    const sourceText = body.text.normalize("NFC").trim().replace(/\s+/g, " ");
    if (!sourceText || [...sourceText].length > 500) return NextResponse.json({ message: "Mỗi lần dịch tối đa 500 ký tự." }, { status: 400, headers });
    const targetLanguage = body.targetLanguage ?? (/\p{Script=Han}/u.test(sourceText) ? "vi" : "zh");
    if (targetLanguage !== "vi" && targetLanguage !== "zh") return NextResponse.json({ message: "Ngôn ngữ dịch không hợp lệ." }, { status: 400, headers });
    const key = createHash("sha256").update(`${targetLanguage}\0${sourceText}`).digest("hex");
    const cached = await prisma.dictionarySentenceTranslation.findUnique({ where: { key }, select: selection });
    if (cached) return NextResponse.json({ translation: cached }, { headers });
    if (pending.has(key)) return NextResponse.json({ translation: await pending.get(key) }, { headers });
    const now = Date.now();
    for (const [id, entry] of quotas) if (entry.expires <= now) quotas.delete(id);
    const quota = quotas.get(user.id) || { count: 0, expires: now + 60000 };
    if (quota.count >= 8) return NextResponse.json({ message: "Bạn đã dịch nhiều câu liên tiếp. Vui lòng đợi một phút." }, { status: 429, headers: { ...headers, "Retry-After": "60" } });
    if (quotas.size >= 2000 && !quotas.has(user.id)) return NextResponse.json({ message: "AI đang bận. Vui lòng thử lại sau." }, { status: 429, headers });
    quota.count++; quotas.set(user.id, quota);
    const task = (async () => {
      const result = await translateDictionarySentence(sourceText, targetLanguage);
      return prisma.dictionarySentenceTranslation.upsert({ where: { key }, create: { key, sourceText, targetLanguage, ...result }, update: {}, select: selection });
    })();
    pending.set(key, task);
    try { return NextResponse.json({ translation: await task }, { headers }); }
    finally { pending.delete(key); }
  } catch (error) {
    if (error instanceof DictionaryAiError) return NextResponse.json({ message: error.message }, { status: error.status, headers: { ...headers, ...(error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {}) } });
    console.error("Sentence translation failed", error instanceof Error ? error.name : "Unknown error");
    return NextResponse.json({ message: "Chưa dịch được câu này. Vui lòng thử lại sau." }, { status: 503, headers });
  }
}
