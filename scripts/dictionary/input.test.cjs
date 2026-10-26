const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const filename = path.resolve('src/lib/dictionary-input.ts');
const loaded = new Module(filename, module);
loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const { isDictionarySentence } = loaded.exports;

test('Short statements such as 我爱你 enter sentence translation', () => {
  for (const text of ['我爱你', '你是谁', '我们想去北京', '我今天下午想去图书馆学习中文。']) assert.equal(isDictionarySentence(text), true, text);
});

test('Ordinary words and pronouns remain dictionary searches', () => {
  for (const text of ['', '你好', '学习', '长春市', '我们', '中国人', 'xue2 xi2', 'cảm ơn']) assert.equal(isDictionarySentence(text), false, text);
});
