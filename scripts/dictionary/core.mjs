import { convert } from "pinyin-pro";

export function normalizePinyin(value) {
  return value.toLowerCase().replace(/u:/g, "v").replace(/ü/g, "v")
    .normalize("NFD").replace(/u\u0308/g, "v").replace(/[\u0300-\u036f1-5\s'’]/g, "");
}

export function formatNumberedPinyin(value) {
  return convert(value.replace(/u:/g, "ü")).replace(/(\p{Script=Latin})5(?=\s|$)/gu, "$1");
}

export function parseCedict(text) {
  const entries = new Map();
  let version = null;
  for (const line of text.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (line.startsWith("#")) {
      const match = line.match(/^#! date=(.+)/);
      if (match) version = match[1];
      continue;
    }
    const match = line.match(/^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.*)\/$/);
    if (!match) throw new Error(`Malformed CC-CEDICT line: ${line.slice(0, 120)}`);
    const [, traditional, simplified, pinyinNumbered, definitions] = match;
    const key = JSON.stringify([traditional, simplified, pinyinNumbered]);
    const previous = entries.get(key);
    entries.set(key, {
      traditional, simplified, pinyinNumbered,
      pinyin: formatNumberedPinyin(pinyinNumbered),
      pinyinSearch: normalizePinyin(pinyinNumbered),
      definitionsEn: [...new Set([...(previous?.definitionsEn || []), ...definitions.split("/").filter(Boolean)])],
    });
  }
  return { entries: [...entries.values()], version };
}

export function parseUnihan(text) {
  const readings = new Map();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^U\+([0-9A-F]+)\tkVietnamese\t(.+)$/);
    if (match) readings.set(String.fromCodePoint(parseInt(match[1], 16)), match[2].trim());
  }
  return readings;
}

export const chunks = function* (items, size) {
  for (let index = 0; index < items.length; index += size) yield items.slice(index, index + size);
};
