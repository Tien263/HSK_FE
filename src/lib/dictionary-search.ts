import { convert } from "pinyin-pro";
import type { Prisma } from "@/generated/prisma";

export function normalizeDictionaryPinyin(value: string) {
  return value.toLowerCase().replace(/u:/g, "v").replace(/ü/g, "v").replace(/đ/g, "d").normalize("NFD").replace(/u\u0308/g, "v").replace(/[\u0300-\u036f1-5\s'’]/g, "");
}

export function dictionaryWhere(query: string): Prisma.DictionaryEntryWhereInput {
  if (!query) return { simplified: { in: ["你好", "学习", "朋友", "谢谢", "中国", "汉语"] } };
  if (/\p{Script=Han}/u.test(query)) return { OR: [{ simplified: { startsWith: query } }, { traditional: { startsWith: query } }] };
  const pinyin = normalizeDictionaryPinyin(convert(query, { format: "toneNone" }));
  return { OR: [{ pinyinSearch: { startsWith: pinyin } }, { meaningViSearch: { contains: pinyin } }] };
}

// Explicit allowlist: review status, revision and generation metadata never enter student JSON.
export const publicDictionarySelect = {
  id: true, simplified: true, traditional: true, pinyin: true, definitionsVi: true, definitionsEn: true,
  characters: { orderBy: { position: "asc" }, select: { position: true, traditionalCharacter: true, simplifiedCharacter: true, character: { select: { hanViet: true } } } },
} satisfies Prisma.DictionaryEntrySelect;
