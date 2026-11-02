import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, isLegacyPlaintextPassword } from "../src/lib/password-security";

test("Salted Scrypt password hashing produces unique hashes and verifies correctly", () => {
  const plain = "HanyuSecure2026!@#";

  const hash1 = hashPassword(plain);
  const hash2 = hashPassword(plain);

  // Hashes must be different because salts are random
  assert.notEqual(hash1, hash2);
  assert.ok(hash1.startsWith("scrypt:"));
  assert.ok(hash2.startsWith("scrypt:"));

  // Both must verify correctly
  assert.equal(verifyPassword(plain, hash1), true);
  assert.equal(verifyPassword(plain, hash2), true);

  // Wrong password must fail
  assert.equal(verifyPassword("WrongPassword123", hash1), false);
});

test("Backward compatibility with legacy plaintext passwords", () => {
  const legacyPass = "admin123";

  // Identifies as legacy
  assert.equal(isLegacyPlaintextPassword(legacyPass), true);

  // Successfully verifies against plaintext
  assert.equal(verifyPassword("admin123", legacyPass), true);
  assert.equal(verifyPassword("wrongpass", legacyPass), false);

  // New scrypt hash is not legacy
  const modernHash = hashPassword("admin123");
  assert.equal(isLegacyPlaintextPassword(modernHash), false);
});
