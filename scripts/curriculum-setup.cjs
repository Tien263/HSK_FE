const { loadEnvConfig } = require('@next/env'); loadEnvConfig(process.cwd());
const { spawnSync } = require('node:child_process');
const fs = require('node:fs'); const path = require('node:path'); const Module = require('node:module'); const ts = require('typescript');
const { PrismaClient } = require('../src/generated/prisma'); const db = new PrismaClient();
const filename = path.resolve('src/lib/curriculum-format.ts'); const loaded = new Module(filename, module);
loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
(async () => {
  try {
    const result = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'execute', '--file', 'prisma/sql/curriculum-content.sql', '--schema', 'prisma/schema.prisma'], { stdio: 'inherit', windowsHide: true });
    if (result.status !== 0) throw new Error('Curriculum table setup failed.');
    let imported = 0;
    for (let level = 1; level <= 9; level++) {
      const file = path.resolve('data/curriculum', `hsk_level_${level}.json`);
      if (!fs.existsSync(file) || await db.curriculumContent.findUnique({ where: { hskLevel: level } })) continue;
      const lessons = loaded.exports.normalizeLessons(JSON.parse(fs.readFileSync(file, 'utf8')), level);
      await db.curriculumContent.create({ data: { hskLevel: level, lessons, revision: 1 } }); imported++;
    }
    console.log(JSON.stringify({ ready: true, legacyLevelsImported: imported }));
  } finally { await db.$disconnect(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
