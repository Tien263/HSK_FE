import test from "node:test";
import assert from "node:assert/strict";
import {
  checkLoginRateLimit,
  recordLoginFailure,
  recordLoginSuccess,
  checkRegisterRateLimit,
  recordRegisterSuccess,
  checkOtpSendRateLimit,
  recordOtpSendSuccess,
} from "../src/lib/auth-rate-limiter";

test("Login rate limiter counts failures and blocks after 5 attempts", () => {
  const testIp = `192.168.1.${Math.floor(Math.random() * 250)}`;
  const testUser = `student_test_${Date.now()}`;

  // Initially allowed
  assert.equal(checkLoginRateLimit(testIp, testUser).allowed, true);

  // Attempt 1
  const f1 = recordLoginFailure(testIp, testUser);
  assert.equal(f1.isBlocked, false);
  assert.equal(f1.attemptsLeft, 4);

  // Attempt 2
  const f2 = recordLoginFailure(testIp, testUser);
  assert.equal(f2.isBlocked, false);
  assert.equal(f2.attemptsLeft, 3);

  // Attempt 3
  const f3 = recordLoginFailure(testIp, testUser);
  assert.equal(f3.isBlocked, false);
  assert.equal(f3.attemptsLeft, 2);

  // Attempt 4
  const f4 = recordLoginFailure(testIp, testUser);
  assert.equal(f4.isBlocked, false);
  assert.equal(f4.attemptsLeft, 1);

  // Attempt 5 -> Blocked!
  const f5 = recordLoginFailure(testIp, testUser);
  assert.equal(f5.isBlocked, true);
  assert.equal(f5.attemptsLeft, 0);
  assert.ok(f5.message?.includes("15 phút"));

  // Next checkLoginRateLimit must reject
  const check = checkLoginRateLimit(testIp, testUser);
  assert.equal(check.allowed, false);
  assert.ok(check.retryAfterMinutes && check.retryAfterMinutes > 0);

  // Login success resets counter
  recordLoginSuccess(testIp, testUser);
  assert.equal(checkLoginRateLimit(testIp, testUser).allowed, true);
});

test("Register rate limiter blocks excessive registrations from same IP", () => {
  const testIp = `172.16.0.${Math.floor(Math.random() * 250)}`;

  for (let i = 0; i < 5; i++) {
    assert.equal(checkRegisterRateLimit(testIp).allowed, true);
    recordRegisterSuccess(testIp);
  }

  // 6th attempt should be blocked
  const r6 = checkRegisterRateLimit(testIp);
  assert.equal(r6.allowed, false);
  assert.ok(r6.message?.includes("quá nhiều tài khoản"));
});

test("OTP rate limiter blocks excessive sends to same email", () => {
  const testEmail = `spammer_${Date.now()}@example.com`;

  for (let i = 0; i < 3; i++) {
    assert.equal(checkOtpSendRateLimit(testEmail).allowed, true);
    recordOtpSendSuccess(testEmail);
  }

  // 4th send should be blocked
  const o4 = checkOtpSendRateLimit(testEmail);
  assert.equal(o4.allowed, false);
  assert.ok(o4.message?.includes("quá 3 lần"));
});
