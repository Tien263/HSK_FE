import { readFile, writeFile } from "node:fs/promises";
import fs from "node:fs";
import { createRequire } from "node:module";
import { unzipSync, strFromU8 } from "fflate";
import { parseArgs } from "node:util";
import { parseCedict, parseUnihan, chunks, normalizePinyin } from "./core.mjs";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());
const { PrismaClient } = require("../../src/generated/prisma");
const db = new PrismaClient();
const { values } = parseArgs({ options: {
  cedict: { type: "string", default: "data/dictionary/cedict.zip" },
  unihan: { type: "string", default: "data/dictionary/Unihan.zip" },
  translations: { type: "string" },
} });

function archiveText(bytes, pattern) {
  const files = unzipSync(new Uint8Array(bytes), { filter: (file) => pattern.test(file.name) });
  const name = Object.keys(files).find((name) => pattern.test(name));
  if (!name) throw new Error(`Missing archive member: ${pattern}`);
  return strFromU8(files[name]);
}

try {
  const parsed = parseCedict(archiveText(await readFile(values.cedict), /(?:^|\/)cedict_ts\.u8$/));
  const readings = parseUnihan(archiveText(await readFile(values.unihan), /(?:^|\/)Unihan_Readings\.txt$/));
  if (!parsed.entries.length || !readings.size) throw new Error("Empty source dictionary; import stopped.");
  const characters = new Set(readings.keys());
  for (const entry of parsed.entries) for (const character of entry.traditional) characters.add(character);
  for (const batch of chunks([...characters], 1500)) {
    await db.dictionaryCharacter.createMany({ data: batch.map((character) => ({ character, hanViet: readings.get(character) || null, sourceVersion: "Unihan imported archive" })), skipDuplicates: true });
  }
  console.log(`Prepared ${characters.size} character records`);
  let inserted = 0;
  for (const batch of chunks(parsed.entries, 500)) {
    const result = await db.dictionaryEntry.createMany({ data: batch.map((entry) => ({ ...entry, sourceVersion: parsed.version })), skipDuplicates: true });
    inserted += result.count;
  }
  const all = await db.dictionaryEntry.findMany({ select: { id: true, traditional: true, simplified: true, pinyinSearch: true, definitionsVi: true, meaningViStatus: true } });
  for (const batch of chunks(all, 500)) {
    await db.dictionaryEntryCharacter.createMany({ data: batch.flatMap((entry) => {
      const traditional = [...entry.traditional];
      const simplified = [...entry.simplified];
      return traditional.map((traditionalCharacter, position) => ({ entryId: entry.id, position, traditionalCharacter, simplifiedCharacter: simplified.length === traditional.length ? simplified[position] : null }));
    }), skipDuplicates: true });
  }

  // Reuse existing Vietnamese course content without overriding admin edits.
  const ts = require("typescript");
  require.extensions[".ts"] = (module, filename) => {
    module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
  };
  const { DICTIONARY_ENTRIES } = require("../../src/lib/dictionary-data.ts");
  const lessonIndex = new Map(DICTIONARY_ENTRIES.map((entry) => [`${entry.hanzi}|${normalizePinyin(entry.pinyin)}`, entry]));
  let vietnamese = 0;
  for (const entry of all) {
    const lesson = lessonIndex.get(`${entry.simplified}|${entry.pinyinSearch}`);
    if (!lesson || entry.meaningViStatus !== "MISSING" || entry.definitionsVi.length) continue;
    const result = await db.dictionaryEntry.updateMany({ where: { id: entry.id, meaningViStatus: "MISSING", definitionsVi: { isEmpty: true } }, data: {
      definitionsVi: [lesson.meaningVi], meaningViSearch: normalizePinyin(lesson.meaningVi).replace(/đ/g, "d"), meaningViSource: "HSK course vocabulary", meaningViStatus: "GENERATED", meaningViUpdatedAt: new Date(), meaningViRevision: { increment: 1 },
    } });
    vietnamese += result.count;
  }
  if (values.translations) {
    for (const line of (await readFile(values.translations, "utf8")).split(/\r?\n/).filter(Boolean)) {
      const item = JSON.parse(line);
      if (typeof item.traditional !== "string" || typeof item.simplified !== "string" || typeof item.pinyinNumbered !== "string" || !Array.isArray(item.definitionsVi) || !item.definitionsVi.length || !item.definitionsVi.every((v) => typeof v === "string" && v.trim())) throw new Error("Invalid Vietnamese translation record");
      const result = await db.dictionaryEntry.updateMany({ where: { traditional: item.traditional, simplified: item.simplified, pinyinNumbered: item.pinyinNumbered, meaningViStatus: "MISSING", definitionsVi: { isEmpty: true } }, data: {
        definitionsVi: item.definitionsVi, meaningViSearch: normalizePinyin(item.definitionsVi.join(" | ")).replace(/đ/g, "d"), meaningViSource: item.source || "Offline translation file", meaningViStatus: "GENERATED", meaningViUpdatedAt: new Date(), meaningViRevision: { increment: 1 },
      } });
      vietnamese += result.count;
    }
  }
  const report = { importedAt: new Date().toISOString(), sourceVersion: parsed.version, sourceEntries: parsed.entries.length, newEntries: inserted, totalEntries: all.length, characters: characters.size, vietnameseAdded: vietnamese };
  await writeFile("data/dictionary/import-report.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally { await db.$disconnect(); }
