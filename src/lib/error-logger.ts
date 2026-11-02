import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/auth-rate-limiter";

export interface LogErrorParams {
  request?: Request;
  error: any;
  context?: string;
  userId?: string | null;
}

let cachedAdminId: string | null = null;

async function getFallbackAdminId(): Promise<string | null> {
  if (cachedAdminId) return cachedAdminId;
  try {
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    if (admin) cachedAdminId = admin.id;
    return cachedAdminId;
  } catch {
    return null;
  }
}

/**
 * Ghi nhận lỗi hệ thống hoặc cảnh báo bảo mật tập trung vào CSDL
 * Giúp Quản trị viên nắm bắt sự cố ngay lập tức mà không cần hỏi học viên
 */
export async function logSystemError(params: LogErrorParams): Promise<void> {
  const { request, error, context = "API_REQUEST", userId } = params;
  const errMsg = error?.message || String(error);
  const errStack = typeof error?.stack === "string" ? error.stack.split("\n").slice(0, 4).join(" | ") : "";

  let method = "INTERNAL";
  let path = "system";
  let clientIp = "127.0.0.1";

  if (request) {
    try {
      method = request.method;
      path = new URL(request.url).pathname;
      clientIp = getClientIp(request);
    } catch {}
  }

  console.error(`[SYSTEM_ERROR] [${method} ${path}] Context: ${context} | Error: ${errMsg}`);

  try {
    const effectiveUserId = userId || (await getFallbackAdminId());
    if (effectiveUserId) {
      await prisma.auditLog.create({
        data: {
          userId: effectiveUserId,
          action: "API_ERROR",
          entity: `${method} ${path}`,
          details: JSON.stringify({
            context,
            message: errMsg,
            stack: errStack,
            clientIp,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    }
  } catch (logDbErr) {
    console.error("Không thể ghi log lỗi vào CSDL:", logDbErr);
  }
}
