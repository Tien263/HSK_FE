import test from "node:test";
import assert from "node:assert/strict";
import {
  getVnDateKey,
  getNextResetTimeString,
  checkAndConsumeAiQuota,
  getAiQuotaStatus,
} from "../src/lib/ai-rate-limiter";

test("getVnDateKey returns YYYY-MM-DD in Vietnam timezone", () => {
  const d = new Date("2026-11-02T02:00:00Z"); // 09:00 in VN
  const key = getVnDateKey(d);
  assert.match(key, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(key, "2026-11-02");
});

test("getNextResetTimeString provides clear 00:00 guidance", () => {
  const str = getNextResetTimeString();
  assert.ok(str.includes("00:00"));
  assert.ok(str.includes("ngày mai"));
});

test("Guest IP rate limiter allows up to 3 calls and then blocks", async () => {
  const testIp = `192.168.100.${Date.now() % 250}`;

  // Call 1
  const r1 = await checkAndConsumeAiQuota({ clientIp: testIp, cost: 1 });
  assert.equal(r1.allowed, true);
  assert.equal(r1.isGuest, true);
  assert.equal(r1.usedToday, 1);
  assert.equal(r1.remaining, 2);

  // Wait 1.6s to bypass anti-burst protection
  await new Promise((resolve) => setTimeout(resolve, 1600));

  // Call 2
  const r2 = await checkAndConsumeAiQuota({ clientIp: testIp, cost: 1 });
  assert.equal(r2.allowed, true);
  assert.equal(r2.usedToday, 2);
  assert.equal(r2.remaining, 1);

  // Wait 1.6s
  await new Promise((resolve) => setTimeout(resolve, 1600));

  // Call 3
  const r3 = await checkAndConsumeAiQuota({ clientIp: testIp, cost: 1 });
  assert.equal(r3.allowed, true);
  assert.equal(r3.usedToday, 3);
  assert.equal(r3.remaining, 0);

  // Wait 1.6s
  await new Promise((resolve) => setTimeout(resolve, 1600));

  // Call 4: Exceeded!
  const r4 = await checkAndConsumeAiQuota({ clientIp: testIp, cost: 1 });
  assert.equal(r4.allowed, false);
  assert.equal(r4.remaining, 0);
  assert.ok(r4.errorMessage?.includes("hết 3/3 lượt"));
});

test("Burst protection blocks requests within 1.5s", async () => {
  const testIp = `10.0.0.${Date.now() % 250}`;
  const r1 = await checkAndConsumeAiQuota({ clientIp: testIp, cost: 1 });
  assert.equal(r1.allowed, true);

  // Immediate second call
  const r2 = await checkAndConsumeAiQuota({ clientIp: testIp, cost: 1 });
  assert.equal(r2.allowed, false);
  assert.ok(r2.errorMessage?.includes("quá nhanh"));
});
