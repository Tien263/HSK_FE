import { prisma } from "@/lib/prisma";

export interface AiQuotaResult {
  allowed: boolean;
  limit: number; // -1: không giới hạn, hoặc số lượt tối đa / ngày
  usedToday: number;
  remaining: number; // >= 0
  resetAt: string; // VD: "00:00 ngày mai (03/11)"
  isGuest: boolean;
  errorMessage?: string;
}

// In-memory cache cho Guest (IP) và chống Burst Spam (rapid clicks)
interface IpUsageRecord {
  count: number;
  dateKey: string; // "YYYY-MM-DD"
  lastRequestTime: number; // timestamp ms
}

const ipUsageMap = new Map<string, IpUsageRecord>();
const userBurstMap = new Map<string, number>(); // userId -> lastRequestTime

// Dọn dẹp cache IP định kỳ sau mỗi 60 phút
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipUsageMap.entries()) {
      // Xóa các IP không hoạt động trong hơn 24 giờ
      if (now - record.lastRequestTime > 24 * 60 * 60 * 1000) {
        ipUsageMap.delete(ip);
      }
    }
    for (const [uid, time] of userBurstMap.entries()) {
      if (now - time > 60 * 1000) {
        userBurstMap.delete(uid);
      }
    }
  }, 60 * 60 * 1000).unref?.();
}

/**
 * Lấy chuỗi ngày hiện tại theo múi giờ Việt Nam (GMT+7)
 * Định dạng "YYYY-MM-DD"
 */
export function getVnDateKey(date = new Date()): string {
  try {
    return date.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/**
 * Tạo mô tả thời gian reset (00:00 ngày hôm sau)
 */
export function getNextResetTimeString(): string {
  try {
    const now = new Date();
    // Tạo mốc 00:00 ngày hôm sau
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dateStr = tomorrow.toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
    });
    return `00:00 ngày mai (${dateStr})`;
  } catch {
    return "00:00 ngày mai";
  }
}

/**
 * Trích xuất IP của Client từ Request headers
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
 * Kiểm tra trạng thái Quota AI của người dùng hoặc khách (chỉ đọc, không trừ lượt)
 */
export async function getAiQuotaStatus(
  userId?: string | null,
  clientIp = "127.0.0.1"
): Promise<AiQuotaResult> {
  const todayKey = getVnDateKey();
  const resetAt = getNextResetTimeString();

  // 1. Nếu là người dùng đã đăng nhập
  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
          dailyAiQuota: true,
          aiUsageToday: true,
          aiUsageResetDate: true,
        },
      });

      if (user) {
        // Quản trị viên và Giáo viên có đặc quyền lớn hơn nếu chưa cấu hình riêng
        let limit = user.dailyAiQuota ?? 5;
        if (user.role === "ADMIN" && limit <= 5) limit = -1; // Admin không giới hạn mặc định
        else if (user.role === "TEACHER" && limit <= 5) limit = 50;

        const userResetDateKey = getVnDateKey(new Date(user.aiUsageResetDate));
        const usedToday = userResetDateKey === todayKey ? user.aiUsageToday : 0;
        const remaining = limit === -1 ? 9999 : Math.max(0, limit - usedToday);

        return {
          allowed: limit === -1 || remaining > 0,
          limit,
          usedToday,
          remaining,
          resetAt,
          isGuest: false,
        };
      }
    } catch (err) {
      console.error("Lỗi getAiQuotaStatus cho userId:", userId, err);
    }
  }

  // 2. Nếu là khách chưa đăng nhập (theo IP)
  const ipRecord = ipUsageMap.get(clientIp);
  const GUEST_LIMIT = 3;
  const usedToday = ipRecord && ipRecord.dateKey === todayKey ? ipRecord.count : 0;
  const remaining = Math.max(0, GUEST_LIMIT - usedToday);

  return {
    allowed: remaining > 0,
    limit: GUEST_LIMIT,
    usedToday,
    remaining,
    resetAt,
    isGuest: true,
  };
}

/**
 * Kiểm tra và tiêu thụ lượt gọi AI (Atomically check & consume)
 * Có cơ chế chống Burst click (spam < 2 giây/lần)
 */
export async function checkAndConsumeAiQuota(params: {
  userId?: string | null;
  clientIp?: string;
  cost?: number; // Số lượt cần trừ (mặc định 1)
}): Promise<AiQuotaResult> {
  const { userId, clientIp = "127.0.0.1", cost = 1 } = params;
  const todayKey = getVnDateKey();
  const resetAt = getNextResetTimeString();
  const now = Date.now();

  // === A. KIỂM TRA CHỐNG SPAM BURST (Spam Click liên tiếp) ===
  const burstKey = userId ? `user:${userId}` : `ip:${clientIp}`;
  const lastTime = userBurstMap.get(burstKey) || 0;
  if (now - lastTime < 1500) {
    // Chưa đầy 1.5 giây giữa 2 yêu cầu AI
    return {
      allowed: false,
      limit: 5,
      usedToday: 0,
      remaining: 0,
      resetAt,
      isGuest: !userId,
      errorMessage: "Bạn thao tác quá nhanh! Vui lòng chờ 2 giây trước khi gửi tiếp.",
    };
  }
  userBurstMap.set(burstKey, now);

  // === B. XỬ LÝ CHO NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP ===
  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          role: true,
          dailyAiQuota: true,
          aiUsageToday: true,
          aiUsageResetDate: true,
        },
      });

      if (user) {
        let limit = user.dailyAiQuota ?? 5;
        if (user.role === "ADMIN" && limit <= 5) limit = -1; // Admin không giới hạn
        else if (user.role === "TEACHER" && limit <= 5) limit = 50;

        const userResetDateKey = getVnDateKey(new Date(user.aiUsageResetDate));
        const isNewDay = userResetDateKey !== todayKey;
        const currentUsed = isNewDay ? 0 : user.aiUsageToday;

        // Nếu có giới hạn và đã dùng hết
        if (limit !== -1 && currentUsed + cost > limit) {
          const remaining = Math.max(0, limit - currentUsed);
          return {
            allowed: false,
            limit,
            usedToday: currentUsed,
            remaining,
            resetAt,
            isGuest: false,
            errorMessage: `Bạn đã sử dụng hết ${limit}/${limit} lượt AI hôm nay. Lượt hỏi sẽ được tự động làm mới vào ${resetAt}. Hãy liên hệ Quản trị viên để nâng hạn mức!`,
          };
        }

        // Đủ điều kiện -> Cập nhật số lượt vào Database
        const newUsed = currentUsed + cost;
        await prisma.user.update({
          where: { id: userId },
          data: {
            aiUsageToday: newUsed,
            aiUsageResetDate: isNewDay ? new Date() : undefined,
          },
        });

        const remaining = limit === -1 ? 9999 : Math.max(0, limit - newUsed);
        return {
          allowed: true,
          limit,
          usedToday: newUsed,
          remaining,
          resetAt,
          isGuest: false,
        };
      }
    } catch (err) {
      console.error("Lỗi cập nhật AI quota trong database:", err);
      // Fallback an toàn nếu DB bận
    }
  }

  // === C. XỬ LÝ CHO KHÁCH VÃNG LAI (THEO IP) ===
  const GUEST_LIMIT = 3;
  let ipRecord = ipUsageMap.get(clientIp);

  if (!ipRecord || ipRecord.dateKey !== todayKey) {
    ipRecord = { count: 0, dateKey: todayKey, lastRequestTime: now };
    ipUsageMap.set(clientIp, ipRecord);
  }

  if (ipRecord.count + cost > GUEST_LIMIT) {
    return {
      allowed: false,
      limit: GUEST_LIMIT,
      usedToday: ipRecord.count,
      remaining: 0,
      resetAt,
      isGuest: true,
      errorMessage: `Bạn đã dùng hết ${GUEST_LIMIT}/${GUEST_LIMIT} lượt trải nghiệm AI miễn phí hôm nay dành cho khách. Hãy đăng nhập để nhận thêm lượt học!`,
    };
  }

  ipRecord.count += cost;
  ipRecord.lastRequestTime = now;
  const remaining = Math.max(0, GUEST_LIMIT - ipRecord.count);

  return {
    allowed: true,
    limit: GUEST_LIMIT,
    usedToday: ipRecord.count,
    remaining,
    resetAt,
    isGuest: true,
  };
}
