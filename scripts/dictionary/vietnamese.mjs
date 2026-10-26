import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
import { unzipSync, strFromU8 } from "fflate";
import { chunks, normalizePinyin } from "./core.mjs";
import { canonicalReading, buildVietnameseIndex, targetAmbiguityCounts, resolveVietnamese } from "./vietnamese-match.mjs";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());
const { PrismaClient } = require("../../src/generated/prisma");
const db = new PrismaClient();
const { values } = parseArgs({ options: { file: { type: "string", default: "data/dictionary/cedict-vi.zip" }, "dry-run": { type: "boolean", default: false } } });
const source = "CVDICT:Phong Phan; YomiLens mirror@86cc70dfa4aa83284771051da9c598c8efbd3c4a; CC BY-SA 4.0";
const archive = await readFile(values.file);
const sha256 = createHash("sha256").update(archive).digest("hex");
if (sha256 !== "22729304b414d21b162abd3df2c4fec30ffcb750f66cd1ea0bfffc3353671f0e") throw new Error("Vietnamese archive checksum differs from the verified CVDICT snapshot");
const files = unzipSync(new Uint8Array(archive), { filter: (file) => /^(index|term_bank_\d+)\.json$/.test(file.name) });
const metadata = JSON.parse(strFromU8(files["index.json"]));
if (metadata.title !== "CVDICT Chinese–Vietnamese" || metadata.attribution !== "CC BY-SA 4.0") throw new Error("Unexpected dictionary source or license");
const groups = new Map();
for (const [name, data] of Object.entries(files)) {
  if (!name.startsWith("term_bank_")) continue;
  for (const row of JSON.parse(strFromU8(data))) {
    if (!Array.isArray(row) || typeof row[0] !== "string" || typeof row[1] !== "string" || !Number.isInteger(row[6]) || !Array.isArray(row[5]) || row[5].some((meaning) => typeof meaning !== "string")) throw new Error("Invalid Vietnamese term bank");
    const key = `${row[6]}|${canonicalReading(row[1])}`;
    const group = groups.get(key) || { words: new Set(), reading: canonicalReading(row[1]), meanings: new Set() };
    group.words.add(row[0]);
    for (const value of row[5]) for (const meaning of value.split(/\n\s*·\s*|\n+/).map((part) => part.replace(/^\s*·\s*/, "").trim()).filter(Boolean)) group.meanings.add(meaning);
    groups.set(key, group);
  }
}

// Match the entire spelling set and tone/capitalization-sensitive reading.
// E.g. 后 (queen) must not borrow the meanings of 後/后 (after),
// and 安 An1 (surname) must remain separate from 安 an1 (peaceful).
const indexes = buildVietnameseIndex(groups.values());

try {
  const missing = await db.dictionaryEntry.findMany({ where: { meaningViStatus: "MISSING", definitionsVi: { isEmpty: true } }, select: { id: true, traditional: true, simplified: true, pinyin: true } });
  const allSpellings = await db.dictionaryEntry.findMany({ select: { id: true, traditional: true, simplified: true, pinyin: true } });
  const targetCounts = targetAmbiguityCounts(allSpellings);
  const updates = [];
  const unmatched = [];
  let caseNormalized = 0;
  let uniqueReadingVariant = 0;
  for (const entry of missing) {
    const match = resolveVietnamese(entry, indexes, targetCounts);
    const meanings = match?.meanings;
    if (match?.strategy === "case") caseNormalized++;
    if (match?.strategy === "unique-reading-variant") uniqueReadingVariant++;
    if (!meanings?.size) { unmatched.push(entry.id); continue; }
    const definitions = [...meanings];
    if (definitions.length > 40 || definitions.some((meaning) => meaning.length > 1500)) { unmatched.push(entry.id); continue; }
    updates.push({ id: entry.id, definitions, search: normalizePinyin(definitions.join(" | ")).replace(/đ/g, "d") });
  }
  let inserted = 0;
  let pinyinFixed = 0;
  if (!values["dry-run"]) for (const batch of chunks(allSpellings.filter((entry) => /(\p{Script=Latin})5(?=\s|$)/u.test(entry.pinyin)), 1000)) {
    pinyinFixed += await db.$executeRaw`
      WITH incoming AS (
        SELECT * FROM jsonb_to_recordset(${JSON.stringify(batch.map((entry) => ({ id: entry.id, pinyin: entry.pinyin.replace(/(\p{Script=Latin})5(?=\s|$)/gu, "$1") })))}::jsonb)
          AS data(id INTEGER, pinyin TEXT)
      )
      UPDATE "DictionaryEntry" AS entry SET "pinyin" = incoming.pinyin FROM incoming WHERE entry.id = incoming.id
    `;
  }
  if (!values["dry-run"]) for (const batch of chunks(updates, 750)) {
    inserted += await db.$executeRaw`
      WITH incoming AS (
        SELECT * FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS data(id INTEGER, definitions JSONB, search TEXT)
      )
      UPDATE "DictionaryEntry" AS entry SET
        "definitionsVi" = ARRAY(SELECT jsonb_array_elements_text(incoming.definitions)),
        "meaningViSearch" = incoming.search,
        "meaningViSource" = ${source},
        "meaningViStatus" = 'GENERATED'::"DictionaryMeaningViStatus",
        "meaningViUpdatedAt" = CURRENT_TIMESTAMP,
        "meaningViRevision" = entry."meaningViRevision" + 1
      FROM incoming WHERE entry.id = incoming.id
        AND entry."meaningViStatus" = 'MISSING'
        AND cardinality(entry."definitionsVi") = 0
    `;
    console.log(`Vietnamese entries imported: ${inserted}/${updates.length}`);
  }
  const report = { importedAt: new Date().toISOString(), dryRun: values["dry-run"], source, sha256, revision: metadata.revision, sourceLexicalEntries: indexes.dictionary.size, missingBefore: missing.length, matched: updates.length, caseNormalized, uniqueReadingVariant, inserted, pinyinFixed, unmatched: unmatched.length };
  await writeFile("data/dictionary/vietnamese-import-report.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally { await db.$disconnect(); }
