import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAndSendOtp } from "@/lib/otp-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, email, password } = body;

    const trimmedName = (name || "").trim();
    const cleanEmail = (email || "").toLowerCase().trim();

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

    // Kiểm tra xem email này đã đăng ký chưa
    const existingEmail = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "Địa chỉ email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác." },
        { status: 409 }
      );
    }

    // Tự động sinh username duy nhất nếu username bị trùng hoặc không nhập
    const baseUsername = (username || cleanEmail.split("@")[0] || "user")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, "");

    let finalUsername = baseUsername || "user";
    const existingUsername = await prisma.user.findFirst({
      where: { username: finalUsername },
    });

    if (existingUsername) {
      // Thêm hậu tố ngẫu nhiên để tránh xung đột
      finalUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Tài khoản đăng ký công khai mặc định luôn là STUDENT (Học viên)
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        username: finalUsername,
        email: cleanEmail,
        passwordHash: password,
        role: "STUDENT",
        status: "ACTIVE",
        currentHskLevel: 1,
        totalXp: 50, // Thưởng 50 XP khởi đầu
        streakDays: 1,
      },
    });

    // Tự động sinh và gửi mã OTP cho học viên vừa đăng ký
    const otpRecord = await generateAndSendOtp(
      cleanEmail,
      "Kích hoạt tài khoản học viên mới",
      6
    );

    return NextResponse.json({
      success: true,
      message: `Đăng ký tài khoản thành công! Mã OTP xác thực đã được gửi đến email ${cleanEmail}. Vui lòng kiểm tra hộp thư của bạn.`,
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
      email: cleanEmail,
    });
  } catch (error) {
    console.error("POST /api/v1/auth/register error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi đăng ký tài khoản. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
