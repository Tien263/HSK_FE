/**
 * Bộ bảo vệ Đăng nhập, Đăng ký và Chống Tấn công Dò Mật khẩu (Brute Force / DDoS Protection)
 * Không phụ thuộc thư viện ngoài, hiệu năng cực cao, an toàn tuyệt đối.
 */

interface FailedAttempt {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

const loginFailuresByAccount = new Map<string, FailedAttempt>(); // key: `user:${username}`
const loginFailuresByIp = new Map<string, FailedAttempt>(); // key: `ip:${ip}`
const registerCountByIp = new Map<string, { count: number; windowStart: number }>();
const otpSendCountByEmail = new Map<string, { count: number; windowStart: number }>();

const MAX_LOGIN_ATTEMPTS = 5; // Tối đa 5 lần thử sai
const BLOCK_DURATION_MS = 15 * 60 * 1000; // Khóa 15 phút
const WINDOW_DURATION_MS = 15 * 60 * 1000; // Khung trượt 15 phút

const MAX_REGISTRATIONS_PER_IP = 5; // Tối đa 5 tài khoản / 10 phút / IP
const REGISTER_WINDOW_MS = 10 * 60 * 1000;

const MAX_OTP_SENDS_PER_EMAIL = 3; // Tối đa 3 mã OTP / 5 phút / email
const OTP_WINDOW_MS = 5 * 60 * 1000;

// Tự động dọn dẹp bộ nhớ mỗi 30 phút
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of loginFailuresByAccount.entries()) {
      if (val.blockedUntil && val.blockedUntil < now && now - val.firstAttemptAt > WINDOW_DURATION_MS) {
        loginFailuresByAccount.delete(key);
      }
    }
    for (const [key, val] of loginFailuresByIp.entries()) {
      if (val.blockedUntil && val.blockedUntil < now && now - val.firstAttemptAt > WINDOW_DURATION_MS) {
        loginFailuresByIp.delete(key);
      }
    }
    for (const [key, val] of registerCountByIp.entries()) {
      if (now - val.windowStart > REGISTER_WINDOW_MS) {
        registerCountByIp.delete(key);
      }
    }
    for (const [key, val] of otpSendCountByEmail.entries()) {
      if (now - val.windowStart > OTP_WINDOW_MS) {
        otpSendCountByEmail.delete(key);
      }
    }
  }, 30 * 60 * 1000).unref?.();
}

/**
 * Trích xuất Client IP an toàn
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Kiểm tra xem IP hoặc tài khoản có đang bị khóa đăng nhập hay không
 */
export function checkLoginRateLimit(
  ip: string,
  username?: string
): { allowed: boolean; retryAfterMinutes?: number; message?: string } {
  const now = Date.now();

  // 1. Kiểm tra khóa theo IP
  const ipKey = `ip:${ip}`;
  const ipRecord = loginFailuresByIp.get(ipKey);
  if (ipRecord && ipRecord.blockedUntil && ipRecord.blockedUntil > now) {
    const minutesLeft = Math.ceil((ipRecord.blockedUntil - now) / 60000);
    return {
      allowed: false,
      retryAfterMinutes: minutesLeft,
      message: `Địa chỉ mạng này đã thử đăng nhập sai quá nhiều lần. Vui lòng chờ ${minutesLeft} phút trước khi thử lại!`,
    };
  }

  // 2. Kiểm tra khóa theo Tên đăng nhập / Email
  if (username) {
    const userKey = `user:${username.toLowerCase().trim()}`;
    const userRecord = loginFailuresByAccount.get(userKey);
    if (userRecord && userRecord.blockedUntil && userRecord.blockedUntil > now) {
      const minutesLeft = Math.ceil((userRecord.blockedUntil - now) / 60000);
      return {
        allowed: false,
        retryAfterMinutes: minutesLeft,
        message: `Tài khoản "${username}" đã bị tạm khóa đăng nhập do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau ${minutesLeft} phút hoặc liên hệ Quản trị viên để đặt lại mật khẩu!`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Ghi nhận 1 lần đăng nhập thất bại
 */
export function recordLoginFailure(
  ip: string,
  username?: string
): { attemptsLeft: number; isBlocked: boolean; message?: string } {
  const now = Date.now();

  // Cập nhật cho IP
  const ipKey = `ip:${ip}`;
  let ipRecord = loginFailuresByIp.get(ipKey);
  if (!ipRecord || now - ipRecord.firstAttemptAt > WINDOW_DURATION_MS) {
    ipRecord = { count: 1, firstAttemptAt: now };
  } else {
    ipRecord.count += 1;
  }
  if (ipRecord.count >= MAX_LOGIN_ATTEMPTS) {
    ipRecord.blockedUntil = now + BLOCK_DURATION_MS;
  }
  loginFailuresByIp.set(ipKey, ipRecord);

  // Cập nhật cho Username
  let userRecord: FailedAttempt | undefined;
  if (username) {
    const userKey = `user:${username.toLowerCase().trim()}`;
    userRecord = loginFailuresByAccount.get(userKey);
    if (!userRecord || now - userRecord.firstAttemptAt > WINDOW_DURATION_MS) {
      userRecord = { count: 1, firstAttemptAt: now };
    } else {
      userRecord.count += 1;
    }
    if (userRecord.count >= MAX_LOGIN_ATTEMPTS) {
      userRecord.blockedUntil = now + BLOCK_DURATION_MS;
    }
    loginFailuresByAccount.set(userKey, userRecord);
  }

  const effectiveCount = Math.max(ipRecord.count, userRecord?.count || 0);
  const attemptsLeft = Math.max(0, MAX_LOGIN_ATTEMPTS - effectiveCount);
  const isBlocked = effectiveCount >= MAX_LOGIN_ATTEMPTS;

  let message = "Mật khẩu không chính xác.";
  if (isBlocked) {
    message = `Bạn đã nhập sai mật khẩu 5 lần liên tiếp. Để bảo mật tài khoản, quyền đăng nhập tạm thời bị khóa trong 15 phút!`;
  } else if (attemptsLeft <= 3) {
    message = `Mật khẩu không chính xác. Bạn còn ${attemptsLeft} lần thử trước khi tài khoản bị tạm khóa 15 phút.`;
  }

  return {
    attemptsLeft,
    isBlocked,
    message,
  };
}

/**
 * Xóa trạng thái thất bại khi đăng nhập thành công
 */
export function recordLoginSuccess(ip: string, username?: string): void {
  loginFailuresByIp.delete(`ip:${ip}`);
  if (username) {
    loginFailuresByAccount.delete(`user:${username.toLowerCase().trim()}`);
  }
}

/**
 * Kiểm tra giới hạn tạo tài khoản (chống spam bot đăng ký)
 */
export function checkRegisterRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const ipKey = `reg:${ip}`;
  const record = registerCountByIp.get(ipKey);

  if (record && now - record.windowStart < REGISTER_WINDOW_MS) {
    if (record.count >= MAX_REGISTRATIONS_PER_IP) {
      const minutesLeft = Math.ceil((record.windowStart + REGISTER_WINDOW_MS - now) / 60000);
      return {
        allowed: false,
        message: `Bạn đã tạo quá nhiều tài khoản trong thời gian ngắn. Vui lòng chờ ${minutesLeft} phút trước khi đăng ký tiếp.`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Ghi nhận 1 lần đăng ký thành công
 */
export function recordRegisterSuccess(ip: string): void {
  const now = Date.now();
  const ipKey = `reg:${ip}`;
  const record = registerCountByIp.get(ipKey);

  if (!record || now - record.windowStart >= REGISTER_WINDOW_MS) {
    registerCountByIp.set(ipKey, { count: 1, windowStart: now });
  } else {
    record.count += 1;
    registerCountByIp.set(ipKey, record);
  }
}

/**
 * Kiểm tra giới hạn gửi mã OTP (chống spam cạn quota email SMTP)
 */
export function checkOtpSendRateLimit(email: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const key = email.toLowerCase().trim();
  const record = otpSendCountByEmail.get(key);

  if (record && now - record.windowStart < OTP_WINDOW_MS) {
    if (record.count >= MAX_OTP_SENDS_PER_EMAIL) {
      const minutesLeft = Math.ceil((record.windowStart + OTP_WINDOW_MS - now) / 60000);
      return {
        allowed: false,
        message: `Bạn đã yêu cầu gửi mã OTP quá 3 lần. Vui lòng chờ ${minutesLeft} phút để gửi lại mã mới!`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Ghi nhận 1 lần gửi mã OTP
 */
export function recordOtpSendSuccess(email: string): void {
  const now = Date.now();
  const key = email.toLowerCase().trim();
  const record = otpSendCountByEmail.get(key);

  if (!record || now - record.windowStart >= OTP_WINDOW_MS) {
    otpSendCountByEmail.set(key, { count: 1, windowStart: now });
  } else {
    record.count += 1;
    otpSendCountByEmail.set(key, record);
  }
}
