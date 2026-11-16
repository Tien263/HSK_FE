import { convert } from "pinyin-pro";
import { DICTIONARY_ENTRIES } from "./dictionary-data";
import { normalizeDictionaryPinyin } from "./dictionary-search";
import { prisma } from "./prisma";

let ready: Promise<void> | undefined;

export function prepareStarterDictionary() {
  ready ??= (async () => {
    if (await prisma.dictionaryEntry.findFirst({ select: { id: true } })) return;
    await prisma.dictionaryEntry.createMany({
      data: DICTIONARY_ENTRIES.filter(entry => entry.hanzi && entry.pinyin && entry.meaningVi).map(entry => ({
        simplified: entry.hanzi,
        traditional: entry.hanzi,
        pinyinNumbered: convert(entry.pinyin, { format: "symbolToNum" }),
        pinyin: entry.pinyin,
        pinyinSearch: normalizeDictionaryPinyin(entry.pinyin),
        definitionsVi: [entry.meaningVi],
        meaningViSearch: normalizeDictionaryPinyin(entry.meaningVi),
        meaningViSource: "Hanyu curriculum",
        meaningViStatus: "GENERATED",
        source: "Hanyu curriculum",
      })),
      skipDuplicates: true,
    });
  })().catch(error => {
    ready = undefined;
    throw error;
  });
  return ready;
}
