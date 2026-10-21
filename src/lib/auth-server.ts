import { prisma } from "@/lib/prisma";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: string;
  status: string;
  avatar: string | null;
}

/**
 * Extracts and verifies the authenticated user from the incoming HTTP request.
 * Supports:
 *  1. Header `x-user-id`
 *  2. Header `Authorization: Bearer mock-jwt-token-<userId>` or raw token
 *  3. Search query param `teacherId` / `userId` (fallback for test scripts)
 */
export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  try {
    let userId: string | null = null;

    // 1. Check custom header x-user-id
    const headerUserId = request.headers.get("x-user-id");
    if (headerUserId && headerUserId.trim()) {
      userId = headerUserId.trim();
    }

    // 2. Check Authorization header
    if (!userId) {
      const authHeader = request.headers.get("authorization");
      if (authHeader) {
        if (authHeader.startsWith("Bearer mock-jwt-token-")) {
          userId = authHeader.replace("Bearer mock-jwt-token-", "").trim();
        } else if (authHeader.startsWith("Bearer ")) {
          userId = authHeader.replace("Bearer ", "").trim();
        }
      }
    }

    // 3. Check query param fallback
    if (!userId) {
      try {
        const { searchParams } = new URL(request.url);
        userId = searchParams.get("teacherId") || searchParams.get("authUserId") || searchParams.get("userId");
      } catch {}
    }

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
      },
    });

    if (!user || user.status === "LOCKED" || user.status === "INACTIVE") {
      return null;
    }

    return user;
  } catch (error) {
    console.error("getAuthUser error:", error);
    return null;
  }
}
