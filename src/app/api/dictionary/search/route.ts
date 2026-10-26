import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dictionaryWhere, normalizeDictionaryPinyin, publicDictionarySelect } from "@/lib/dictionary-search";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = (params.get("q") || "").trim().normalize("NFC");
  const ids = params.get("ids");
  const parsedIds = ids ? ids.split(",").map(Number) : [];
  if (ids !== null && (!parsedIds.length || parsedIds.length > 100 || parsedIds.some((id) => !Number.isSafeInteger(id) || id <= 0))) return NextResponse.json({ message: "Danh sách từ không hợp lệ." }, { status: 400 });
  if ([...q].length > 80) return NextResponse.json({ message: "Từ khóa tối đa 80 ký tự." }, { status: 400 });
  try {
    const options = { select: publicDictionarySelect, take: ids ? 100 : 51, orderBy: [{ simplified: "asc" as const }, { pinyinNumbered: "asc" as const }] };
    const [exact, suggestions] = await Promise.all([
      q && !ids ? prisma.dictionaryEntry.findMany({ ...options, where: /\p{Script=Han}/u.test(q)
        ? { OR: [{ simplified: q }, { traditional: q }] }
        : { OR: [{ pinyinSearch: normalizeDictionaryPinyin(q) }, { meaningViSearch: { startsWith: normalizeDictionaryPinyin(q) } }] } }) : Promise.resolve([]),
      prisma.dictionaryEntry.findMany({ ...options, where: ids ? { id: { in: parsedIds } } : dictionaryWhere(q) }),
    ]);
    const rows = [...new Map([...exact, ...suggestions].map((entry) => [entry.id, entry])).values()];
    const normalizedQuery = normalizeDictionaryPinyin(q);
    if (q) rows.sort((a, b) => {
      const score = (entry: typeof a) => Number(entry.simplified === q || entry.traditional === q) * 4
        + Number(normalizeDictionaryPinyin(entry.pinyin) === normalizedQuery) * 2
        + Number(entry.definitionsVi.some((meaning) => normalizeDictionaryPinyin(meaning) === normalizedQuery));
      return score(b) - score(a);
    });
    return NextResponse.json({ items: ids ? rows : rows.slice(0, 50), hasMore: !ids && rows.length > 50, limit: ids ? 100 : 50, sources: ["CC-CEDICT", "CVDICT", "Unihan"] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Dictionary search failed", error instanceof Error ? error.name : "Unknown error");
    return NextResponse.json({ message: "Chưa tải được từ điển. Vui lòng thử lại sau." }, { status: 503 });
  }
}
