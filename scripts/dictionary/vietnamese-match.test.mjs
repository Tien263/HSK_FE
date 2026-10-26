import test from "node:test";
import assert from "node:assert/strict";
import { buildVietnameseIndex, targetAmbiguityCounts, resolveVietnamese } from "./vietnamese-match.mjs";

const source = [
  { words: ["後", "后"], reading: "hòu", meanings: ["sau"] },
  { words: ["后"], reading: "hòu", meanings: ["hoàng hậu"] },
  { words: ["安"], reading: "Ān", meanings: ["họ An"] },
  { words: ["安"], reading: "ān", meanings: ["yên ổn"] },
  { words: ["行"], reading: "háng", meanings: ["hàng"] },
  { words: ["行"], reading: "xíng", meanings: ["đi"] },
  { words: ["一個半", "一个半"], reading: "yī ge bàn", meanings: ["một cái rưỡi"] },
];
const index = buildVietnameseIndex(source);
const entry = (traditional, simplified, pinyin) => ({ traditional, simplified, pinyin });

test("Traditional spelling prevents merging queen 后 with after 後/后", () => {
  const entries = [entry("后", "后", "hòu"), entry("後", "后", "hòu")];
  const counts = targetAmbiguityCounts(entries);
  assert.deepEqual([...resolveVietnamese(entries[0], index, counts).meanings], ["hoàng hậu"]);
  assert.deepEqual([...resolveVietnamese(entries[1], index, counts).meanings], ["sau"]);
});
test("Surname and ordinary word remain separate; ambiguous polyphones cannot borrow another reading", () => {
  const entries = [entry("安", "安", "Ān"), entry("安", "安", "ān"), entry("行", "行", "hàng"), entry("行", "行", "xíng")];
  const counts = targetAmbiguityCounts(entries);
  assert.deepEqual([...resolveVietnamese(entries[0], index, counts).meanings], ["họ An"]);
  assert.deepEqual([...resolveVietnamese(entries[1], index, counts).meanings], ["yên ổn"]);
  assert.equal(resolveVietnamese(entries[2], index, counts), null);
});
test("Neutral-tone number 5 is equivalent to an unmarked neutral syllable", () => {
  const value = entry("一個半", "一个半", "yī ge5 bàn");
  assert.deepEqual([...resolveVietnamese(value, index, targetAmbiguityCounts([value])).meanings], ["một cái rưỡi"]);
});

test("Case normalization accepts a unique name but rejects ambiguous surname/ordinary-word matches", () => {
  const names = buildVietnameseIndex([{ words: ["重慶", "重庆"], reading: "Chóng qìng", meanings: ["Trùng Khánh"] }]);
  const name = entry("重慶", "重庆", "Chóng Qìng");
  assert.equal(resolveVietnamese(name, names, targetAmbiguityCounts([name])).strategy, "case");
  const ambiguous = entry("安", "安", "ĀN");
  assert.equal(resolveVietnamese(ambiguous, index, targetAmbiguityCounts([ambiguous])), null);
});

test("A changed pronunciation may match only when both dictionaries contain one lexical entry", () => {
  const old = buildVietnameseIndex([{ words: ["一字不差"], reading: "yī zì bù chā", meanings: ["nguyên văn"] }]);
  const value = entry("一字不差", "一字不差", "yī zì bù chà");
  assert.equal(resolveVietnamese(value, old, targetAmbiguityCounts([value])).strategy, "unique-reading-variant");
  assert.equal(resolveVietnamese(value, old, targetAmbiguityCounts([value, entry("一字不差", "一字不差", "yī zì bù chā")])), null);
});
