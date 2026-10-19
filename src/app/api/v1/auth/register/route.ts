import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, email, password } = body;

    const trimmedName = (name || "").trim();
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanUsername = (username || cleanEmail.split("@")[0] || "").toLowerCase().trim();

    if (!trimmedName) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập họ và tên của bạn." },
        { status: 400 }
      );
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập địa chỉ email hợp lệ." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu phải có độ dài tối thiểu 6 ký tự." },
        { status: 400 }
      );
    }

    // Kiểm tra tài khoản hoặc email đã tồn tại chưa
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email hoặc tên tài khoản này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác." },
        { status: 409 }
      );
    }

    // Tài khoản đăng ký công khai mặc định luôn là STUDENT (Học viên)
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: password,
        role: "STUDENT",
        status: "ACTIVE",
        currentHskLevel: 1,
        totalXp: 50, // Thưởng 50 XP khởi đầu
        streakDays: 1,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đăng ký tài khoản thành công!",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        currentHskLevel: user.currentHskLevel,
        totalXp: user.totalXp,
        streakDays: user.streakDays,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/auth/register error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi đăng ký tài khoản. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
