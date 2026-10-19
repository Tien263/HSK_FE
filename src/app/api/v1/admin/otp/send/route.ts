import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-memory OTP storage for MVP & testing
interface OtpRecord {
  id: string;
  email: string;
  otp: string;
  purpose: string;
  createdAt: string;
  expiresAt: string;
  status: "SENT" | "VERIFIED" | "EXPIRED";
}

const otpLogs: OtpRecord[] = [
  {
    id: "otp-demo-1",
    email: "student@hanyu.edu.vn",
    otp: "829401",
    purpose: "Kích hoạt tài khoản học viên",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: "VERIFIED",
  },
  {
    id: "otp-demo-2",
    email: "teacher@hanyu.edu.vn",
    otp: "452918",
    purpose: "Xác thực 2 bước đăng nhập",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    status: "SENT",
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    logs: otpLogs,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, length = 6, purpose = "Xác minh tài khoản", smtpConfig } = body;

    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập địa chỉ email hợp lệ để nhận OTP." },
        { status: 400 }
      );
    }

    // Sinh mã OTP ngẫu nhiên (4 hoặc 6 chữ số)
    const digits = length === 4 ? 4 : 6;
    let generatedOtp = "";
    for (let i = 0; i < digits; i++) {
      generatedOtp += Math.floor(Math.random() * 10).toString();
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 phút

    const newRecord: OtpRecord = {
      id: "otp-" + Date.now(),
      email: cleanEmail,
      otp: generatedOtp,
      purpose,
      createdAt: new Date().toISOString(),
      expiresAt,
      status: "SENT",
    };

    otpLogs.unshift(newRecord);

    // Ghi audit log vào cơ sở dữ liệu nếu có user liên kết
    const matchedUser = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    if (matchedUser) {
      await prisma.auditLog.create({
        data: {
          userId: matchedUser.id,
          action: "SEND_OTP",
          entity: "EmailOTP",
          details: JSON.stringify({
            otp: generatedOtp,
            purpose,
            expiresAt,
          }),
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Đã phát và gửi mã OTP thành công đến ${cleanEmail}!`,
      otpData: {
        email: cleanEmail,
        otp: generatedOtp,
        length: digits,
        expiresInSec: 300,
        purpose,
        simulatedDelivery: true,
        smtpConfigUsed: !!smtpConfig?.host,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/admin/otp/send error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi gửi mã OTP." },
      { status: 500 }
    );
  }
}
