import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDictionarySession, dictionaryCookieOptions, DICTIONARY_SESSION_COOKIE } from "@/lib/dictionary-session";
import {
  getClientIp,
  checkLoginRateLimit,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/lib/auth-rate-limiter";
import {
  verifyPassword,
  hashPassword,
  isLegacyPlaintextPassword,
} from "@/lib/password-security";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !username.trim()) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập email hoặc tên đăng nhập." },
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập mật khẩu." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();
    const clientIp = getClientIp(request);

    // Chống Brute-force & DDoS mật khẩu
    const rateLimitCheck = checkLoginRateLimit(clientIp, cleanUsername);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: rateLimitCheck.message,
          retryAfterMinutes: rateLimitCheck.retryAfterMinutes,
        },
        { status: 429 }
      );
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanUsername, mode: "insensitive" as const } },
          { email: { equals: cleanUsername, mode: "insensitive" as const } },
          ...(cleanUsername === "ningning" ? [{ username: "ning" }] : []),
        ],
      },
      include: {
        enrolledClasses: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      const failure = recordLoginFailure(clientIp, cleanUsername);
      return NextResponse.json(
        {
          success: false,
          message: failure.isBlocked
            ? failure.message
            : "Thông tin đăng nhập không hợp lệ hoặc tài khoản không tồn tại.",
        },
        { status: failure.isBlocked ? 429 : 401 }
      );
    }

    // Kiểm tra mật khẩu (hỗ trợ cả mật khẩu scrypt salted, mật khẩu mẫu, kiểm tra cả bản đã trim và bản gốc)
    const passwordValid =
      verifyPassword(cleanPassword, user.passwordHash) ||
      verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      const failure = recordLoginFailure(clientIp, cleanUsername);
      return NextResponse.json(
        { success: false, message: failure.message },
        { status: failure.isBlocked ? 429 : 401 }
      );
    }

    // Tự động nâng cấp mật khẩu cũ sang chuẩn mã hóa Scrypt với Salt bảo mật cao
    if (isLegacyPlaintextPassword(user.passwordHash)) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: hashPassword(cleanPassword) },
        });
      } catch {}
    }

    // Đăng nhập hợp lệ -> Xóa bộ đếm thất bại
    recordLoginSuccess(clientIp, cleanUsername);

    // Kiểm tra trạng thái tài khoản
    if (user.status === "LOCKED" || user.status === "INACTIVE") {
      return NextResponse.json(
        { success: false, message: "Tài khoản của bạn đang bị tạm khóa hoặc chưa được kích hoạt." },
        { status: 403 }
      );
    }

    // Tự động tính toán và cập nhật chuỗi Streak ngày học thực tế
    const now = new Date();
    const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(now);
    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(yesterdayDate);

    const createdDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(user.createdAt);
    const updatedDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(user.updatedAt);

    let activeStreak = user.streakDays || 1;
    if (createdDateStr < todayStr && activeStreak < 2) {
      activeStreak = 2;
    } else if (updatedDateStr === yesterdayStr) {
      activeStreak = (user.streakDays || 1) + 1;
    }

    if (activeStreak !== user.streakDays) {
      await prisma.user.update({
        where: { id: user.id },
        data: { streakDays: activeStreak, updatedAt: new Date() },
      });
      user.streakDays = activeStreak;
    }

    // Trả về thông tin user đã xác thực
    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công!",
      accessToken: "mock-jwt-token-" + user.id,
      refreshToken: "mock-refresh-token-" + user.id,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        mustChangePassword: Boolean(user.mustChangePassword),
        avatar: user.avatar,
        currentHskLevel: user.currentHskLevel,
        totalXp: user.totalXp,
        streakDays: user.streakDays,
        hasEnrolledClasses: user.enrolledClasses.length > 0,
        enrolledClasses: user.enrolledClasses.map((ec) => ({
          id: ec.class.id,
          name: ec.class.name,
          level: ec.class.level,
          teacherName: ec.class.teacher?.name || "Cô Ning Ning",
        })),
      },
    });
    const dictionarySession = createDictionarySession(user.id);
    if (dictionarySession) response.cookies.set(DICTIONARY_SESSION_COOKIE, dictionarySession, dictionaryCookieOptions(request));
    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    const errText = error?.message || String(error);
    const isDbErr = !process.env.DATABASE_URL || errText.includes("DATABASE_URL") || errText.includes("connect") || errText.includes("database");
    return NextResponse.json(
      {
        success: false,
        message: isDbErr
          ? "Lỗi kết nối cơ sở dữ liệu. Vui lòng kiểm tra biến DATABASE_URL trên Render."
          : (error?.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."),
      },
      { status: 500 }
    );
  }
}
