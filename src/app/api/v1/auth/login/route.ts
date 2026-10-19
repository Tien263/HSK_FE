import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { email: cleanUsername },
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
      return NextResponse.json(
        { success: false, message: "Thông tin đăng nhập không hợp lệ hoặc tài khoản không tồn tại." },
        { status: 401 }
      );
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === "LOCKED" || user.status === "INACTIVE") {
      return NextResponse.json(
        { success: false, message: "Tài khoản của bạn đang bị tạm khóa hoặc chưa được kích hoạt." },
        { status: 403 }
      );
    }

    // Trả về thông tin user đã xác thực
    return NextResponse.json({
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
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
