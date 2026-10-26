export const canonicalReading = (value) => value.normalize("NFC").replace(/(\p{Script=Latin})5(?=\s|$)/gu, "$1").replace(/[\s\-'’]/g, "");
export const spellingKey = (words) => JSON.stringify([...new Set(words)].sort());
export const lexicalKey = (words, reading) => JSON.stringify([[...new Set(words)].sort(), canonicalReading(reading)]);

export function buildVietnameseIndex(groups) {
  const dictionary = new Map();
  const foldedKeys = new Map();
  const spellingKeys = new Map();
  for (const group of groups) {
    const key = lexicalKey(group.words, group.reading);
    const meanings = dictionary.get(key) || new Set();
    for (const meaning of group.meanings) meanings.add(meaning);
    dictionary.set(key, meanings);
    for (const [index, indexKey] of [[foldedKeys, lexicalKey(group.words, group.reading.toLowerCase())], [spellingKeys, spellingKey(group.words)]]) {
      const candidates = index.get(indexKey) || new Set();
      candidates.add(key);
      index.set(indexKey, candidates);
    }
  }
  return { dictionary, foldedKeys, spellingKeys };
}

export function targetAmbiguityCounts(entries) {
  const readings = new Map();
  const spellings = new Map();
  for (const entry of entries) {
    const words = [entry.traditional, entry.simplified];
    const key = lexicalKey(words, entry.pinyin.toLowerCase());
    readings.set(key, (readings.get(key) || 0) + 1);
    const key2 = spellingKey(words);
    spellings.set(key2, (spellings.get(key2) || 0) + 1);
  }
  return { readings, spellings };
}

export function resolveVietnamese(entry, indexes, targetCounts) {
  const words = [entry.traditional, entry.simplified];
  const exact = indexes.dictionary.get(lexicalKey(words, entry.pinyin));
  if (exact) return { meanings: exact, strategy: "exact" };
  const foldedKey = lexicalKey(words, entry.pinyin.toLowerCase());
  const candidates = indexes.foldedKeys.get(foldedKey);
  if (candidates?.size === 1 && targetCounts.readings.get(foldedKey) === 1) return { meanings: indexes.dictionary.get([...candidates][0]), strategy: "case" };
  const key = spellingKey(words);
  const spellingCandidates = indexes.spellingKeys.get(key);
  if (spellingCandidates?.size === 1 && targetCounts.spellings.get(key) === 1) return { meanings: indexes.dictionary.get([...spellingCandidates][0]), strategy: "unique-reading-variant" };
  return null;
}
