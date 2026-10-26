import test from "node:test";
import assert from "node:assert/strict";
import { parseCedict, parseUnihan, normalizePinyin, formatNumberedPinyin } from "./core.mjs";

test("CC-CEDICT merges only identical spellings/readings and preserves polyphones", () => {
  const { entries, version } = parseCedict("#! date=2026-10-25\n學習 学习 [xue2 xi2] /to learn/\n學習 学习 [xue2 xi2] /to study/\n行 行 [xing2] /to walk/\n行 行 [hang2] /row/\n");
  assert.equal(version, "2026-10-25");
  assert.equal(entries.length, 3);
  assert.deepEqual(entries[0].definitionsEn, ["to learn", "to study"]);
  assert.equal(entries[0].pinyin, "xué xí");
  assert.equal(entries[0].pinyinSearch, "xuexi");
});
test("Unihan handles non-BMP characters, preserves multiple readings, and ignores unrelated fields", () => {
  const readings = parseUnihan("U+5B78\tkVietnamese\thọc\nU+20000\tkVietnamese\tha\nU+5B78\tkMandarin\txue2\nU+884C\tkVietnamese\thành hành\n");
  assert.equal(readings.get("學"), "học");
  assert.equal(readings.get(String.fromCodePoint(0x20000)), "ha");
  assert.equal(readings.get("行"), "hành hành");
});
test("Pinyin tone marks, numbered tones and umlaut spellings have the same search key", () => {
  for (const word of ["nü3", "nu:3", "nǚ", "nv3"]) assert.equal(normalizePinyin(word), "nv");
  assert.throws(() => parseCedict("not valid cedict"), /Malformed/);
});

test("Numbered pinyin drops neutral tone 5, including erhua, while keeping other tones", () => {
  assert.equal(formatNumberedPinyin("yi1 ge5 ban4"), "yī ge bàn");
  assert.equal(formatNumberedPinyin("yi1 kuai4 r5"), "yī kuài r");
  assert.equal(formatNumberedPinyin("nu:3"), "nǚ");
});
