import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());
const { PrismaClient } = require("../../src/generated/prisma");
const db = new PrismaClient();
try {
  const tables = await db.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = current_schema() AND tablename IN ('DictionaryEntry', 'DictionaryCharacter', 'DictionaryEntryCharacter')`;
  if (tables.length === 3) {
    const columns = await db.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'DictionaryEntry' AND column_name IN ('meaningViStatus', 'meaningViRevision', 'meaningViSearch')`;
    if (columns.length !== 3) throw new Error("Dictionary tables use an older schema; apply an additive migration before importing.");
    const sentenceCache = await db.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = current_schema() AND tablename = 'DictionarySentenceTranslation'`;
    if (!sentenceCache.length) {
      const result = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "db", "execute", "--file", "prisma/sql/dictionary-sentences.sql", "--schema", "prisma/schema.prisma"], { stdio: "inherit", windowsHide: true });
      if (result.status !== 0) throw new Error("Sentence cache setup failed.");
    }
    console.log("Dictionary schema is ready.");
  }
  else if (tables.length !== 0) throw new Error("Partial dictionary schema found. Inspect it before applying schema SQL.");
  else {
    const result = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "db", "execute", "--file", "prisma/sql/dictionary-schema.sql", "--schema", "prisma/schema.prisma"], { stdio: "inherit", windowsHide: true });
    if (result.status !== 0) throw new Error("Dictionary schema setup failed.");
  }
} finally { await db.$disconnect(); }
