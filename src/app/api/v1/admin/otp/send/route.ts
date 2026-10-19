import { NextResponse } from "next/server";
import { generateAndSendOtp, getOtpLogs } from "@/lib/otp-store";

// GET /api/v1/admin/otp/send - Lấy danh sách OTP logs
export async function GET() {
  const logs = getOtpLogs();
  return NextResponse.json({
    success: true,
    logs,
  });
}

// POST /api/v1/admin/otp/send - Phát & gửi OTP
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

    const newRecord = await generateAndSendOtp(cleanEmail, purpose, length);

    return NextResponse.json({
      success: true,
      message: `Đã phát và gửi mã OTP thành công đến ${cleanEmail}!`,
      otpData: {
        email: cleanEmail,
        otp: newRecord.otp,
        length: newRecord.otp.length,
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
