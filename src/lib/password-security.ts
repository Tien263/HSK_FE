import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;

/**
 * Mã hóa mật khẩu bằng thuật toán scrypt với salt ngẫu nhiên 16 bytes
 * Chuẩn bảo mật mật khẩu cao cấp chống lại các cuộc tấn công dò từ điển (Rainbow table / GPU Brute Force)
 * Định dạng lưu trữ: scrypt:<salt_hex>:<hash_hex>
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

/**
 * Xác thực mật khẩu nhập vào với mật khẩu lưu trong CSDL
 * Tương thích ngược 100%: hỗ trợ cả mật khẩu scrypt và mật khẩu mẫu ban đầu (legacy plaintext)
 */
export function verifyPassword(password: string, storedHash?: string | null): boolean {
  if (!storedHash || !password) return false;

  // 1. Chuẩn bảo mật Scrypt với Salt
  if (storedHash.startsWith("scrypt:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 3) return false;
    const [, salt, expectedHashHex] = parts;
    try {
      const actualHash = scryptSync(password, salt, KEY_LEN);
      const expectedHash = Buffer.from(expectedHashHex, "hex");
      if (actualHash.length !== expectedHash.length) return false;
      return timingSafeEqual(actualHash, expectedHash);
    } catch {
      return false;
    }
  }

  // 2. Tương thích ngược tài khoản cũ (admin123, teacher123...)
  return storedHash === password;
}

/**
 * Kiểm tra xem mật khẩu của người dùng có phải là dạng chưa mã hóa cần nâng cấp hay không
 */
export function isLegacyPlaintextPassword(storedHash?: string | null): boolean {
  if (!storedHash) return false;
  return !storedHash.startsWith("scrypt:");
}
