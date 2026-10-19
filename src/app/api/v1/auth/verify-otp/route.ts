import { NextResponse } from "next/server";
import { verifyOtpCode, getLastOtpForEmail, generateAndSendOtp } from "@/lib/otp-store";
import { prisma } from "@/lib/prisma";

// GET /api/v1/auth/verify-otp?email=... - Lấy thông tin OTP hiện hành cho email (phục vụ test local)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Thiếu tham số email." },
        { status: 400 }
      );
    }

    const record = getLastOtpForEmail(email);
    if (!record) {
      return NextResponse.json({
        success: false,
        message: "Không tìm thấy mã OTP nào đang chờ cho email này.",
      });
    }

    return NextResponse.json({
      success: true,
      record: {
        email: record.email,
        otp: record.otp,
        purpose: record.purpose,
        expiresAt: record.expiresAt,
        status: record.status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi kiểm tra OTP." },
      { status: 500 }
    );
  }
}

// POST /api/v1/auth/verify-otp - Xác nhận mã OTP
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, action } = body;

    // Trường hợp gửi lại mã OTP
    if (action === "RESEND") {
      if (!email) {
        return NextResponse.json(
          { success: false, message: "Vui lòng cung cấp email để gửi lại mã OTP." },
          { status: 400 }
        );
      }

      const newRecord = await generateAndSendOtp(
        email,
        "Gửi lại mã xác minh tài khoản",
        6
      );

      return NextResponse.json({
        success: true,
        message: `Đã gửi mã OTP mới đến email ${email}!`,
        otp: newRecord.otp,
        expiresAt: newRecord.expiresAt,
      });
    }

    // Trường hợp xác thực mã OTP thông thường
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ email và mã OTP." },
        { status: 400 }
      );
    }

    const verificationResult = await verifyOtpCode(email, otp);

    if (!verificationResult.success) {
      return NextResponse.json(
        { success: false, message: verificationResult.message },
        { status: 400 }
      );
    }

    // Lấy thông tin user đã kích hoạt
    const user = await prisma.user.findFirst({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        currentHskLevel: true,
        totalXp: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Xác thực email thành công! Bạn có thể tiếp tục thiết lập học tập.",
      user,
    });
  } catch (error) {
    console.error("POST /api/v1/auth/verify-otp error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi xác thực OTP." },
      { status: 500 }
    );
  }
}
