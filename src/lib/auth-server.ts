import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDictionaryUser } from "@/lib/dictionary-session";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: string;
  status: string;
  avatar: string | null;
  currentHskLevel?: number;
}

export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  const session = await getDictionaryUser(request);
  if (!session) return null;
  return prisma.user.findFirst({
    where: { id: session.id, status: "ACTIVE" },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatar: true,
      currentHskLevel: true,
    },
  });
}

/**
 * Kiểm tra bắt buộc quyền Quản Trị Viên (Admin)
 * Chặn đứng mọi hành vi truy cập trái phép vào các endpoint quản trị
 */
export async function requireAdmin(
  request: Request
): Promise<{ ok: true; user: AuthUser } | { ok: false; response: NextResponse }> {
  const user = await getAuthUser(request);
  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          message: "Quyền truy cập bị từ chối. Thao tác này yêu cầu tài khoản Quản trị viên (Admin).",
        },
        { status: 403 }
      ),
    };
  }
  return { ok: true, user };
}

/**
 * Kiểm tra bắt buộc đã đăng nhập (bất kể role STUDENT, TEACHER, ADMIN)
 */
export async function requireAuth(
  request: Request
): Promise<{ ok: true; user: AuthUser } | { ok: false; response: NextResponse; user: null }> {
  const user = await getAuthUser(request);
  if (!user || user.status !== "ACTIVE") {
    return {
      ok: false,
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: "Vui lòng đăng nhập để tiếp tục.",
        },
        { status: 401 }
      ),
    };
  }
  return { ok: true, user };
}
