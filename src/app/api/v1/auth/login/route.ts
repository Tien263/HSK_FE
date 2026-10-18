import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập tên đăng nhập" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { email: username }],
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Tài khoản không tồn tại trên hệ thống" }, { status: 404 });
    }

    // Trả về thông tin user đã xác thực
    return NextResponse.json({
      success: true,
      accessToken: "mock-jwt-token-" + user.id,
      refreshToken: "mock-refresh-token-" + user.id,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi xử lý đăng nhập" }, { status: 500 });
  }
}
