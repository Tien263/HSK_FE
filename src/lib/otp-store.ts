import { prisma } from "@/lib/prisma";

export interface OtpRecord {
  id: string;
  email: string;
  otp: string;
  purpose: string;
  createdAt: string;
  expiresAt: string;
  status: "SENT" | "VERIFIED" | "EXPIRED";
}

// Global variable to persist across HMR reloads in Next.js Turbopack dev & prod
const globalForOtp = globalThis as unknown as {
  __hanyuOtpRecords?: OtpRecord[];
};

if (!globalForOtp.__hanyuOtpRecords) {
  globalForOtp.__hanyuOtpRecords = [
    {
      id: "otp-seed-1",
      email: "student@ningning.edu.vn",
      otp: "829401",
      purpose: "Kích hoạt tài khoản học viên",
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      status: "VERIFIED",
    },
  ];
}

const otpRecords = globalForOtp.__hanyuOtpRecords;

export function getOtpLogs(): OtpRecord[] {
  return [...otpRecords];
}

export function getLastOtpForEmail(email: string): OtpRecord | null {
  const cleanEmail = email.trim().toLowerCase();
  const match = otpRecords.find((r) => r.email === cleanEmail && r.status !== "EXPIRED");
  return match || null;
}

export async function generateAndSendOtp(
  email: string,
  purpose = "Xác minh tài khoản học viên",
  length = 6
): Promise<OtpRecord> {
  const cleanEmail = email.trim().toLowerCase();

  // Sinh mã số ngẫu nhiên
  const digits = length === 4 ? 4 : 6;
  let code = "";
  for (let i = 0; i < digits; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 phút hiệu lực

  const newRecord: OtpRecord = {
    id: "otp-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    email: cleanEmail,
    otp: code,
    purpose,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: "SENT",
  };

  // Thêm vào đầu danh sách
  otpRecords.unshift(newRecord);

  // Giới hạn danh sách 100 bản ghi
  if (otpRecords.length > 100) {
    otpRecords.pop();
  }

  // Ghi Audit Log vào CSDL nếu người dùng đã tồn tại
  try {
    const user = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });
    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "SEND_OTP",
          entity: "EmailOTP",
          details: JSON.stringify({
            otp: code,
            purpose,
            expiresAt: expiresAt.toISOString(),
          }),
        },
      });
    }
  } catch (err) {
    console.error("Lỗi ghi audit log OTP:", err);
  }

  return newRecord;
}

export async function verifyOtpCode(
  email: string,
  inputOtp: string
): Promise<{ success: boolean; message: string; record?: OtpRecord }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = inputOtp.trim();

  const record = otpRecords.find(
    (r) => r.email === cleanEmail && r.status === "SENT"
  );

  if (!record) {
    return {
      success: false,
      message: "Không tìm thấy mã OTP còn hiệu lực cho email này. Vui lòng nhấn gửi lại mã.",
    };
  }

  // Kiểm tra hạn sử dụng
  if (new Date(record.expiresAt) < new Date()) {
    record.status = "EXPIRED";
    return {
      success: false,
      message: "Mã OTP đã hết hạn (quá 5 phút). Vui lòng nhấn gửi lại mã mới.",
    };
  }

  if (record.otp !== cleanCode) {
    return {
      success: false,
      message: "Mã OTP không chính xác. Vui lòng kiểm tra lại.",
    };
  }

  // Đánh dấu đã xác thực thành công
  record.status = "VERIFIED";

  // Cập nhật trạng thái người dùng trong DB sang ACTIVE
  try {
    const user = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: "ACTIVE" },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "VERIFY_OTP_SUCCESS",
          entity: "EmailOTP",
          details: JSON.stringify({ otp: cleanCode, verifiedAt: new Date().toISOString() }),
        },
      });
    }
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái user sau khi xác minh OTP:", err);
  }

  return {
    success: true,
    message: "Xác thực mã OTP thành công!",
    record,
  };
}
