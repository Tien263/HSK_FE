import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";
import { hashPassword, verifyPassword } from "@/lib/password-security";
import { createDictionarySession, dictionaryCookieOptions, DICTIONARY_SESSION_COOKIE } from "@/lib/dictionary-session";

export async function POST(request: Request) {
  try {
    const authCheck = await requireAuth(request);
    if (!authCheck.ok || !authCheck.user) {
      return authCheck.response;
    }

    const body = await request.json();
    const { oldPassword, newPassword, confirmPassword } = body;

    const cleanNew = (newPassword || "").trim();
    const cleanConfirm = (confirmPassword || "").trim();
    const cleanOld = (oldPassword || "").trim();

    if (!cleanNew || cleanNew.length < 6) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu mới phải có tối thiểu 6 ký tự." },
        { status: 400 }
      );
    }

    if (cleanNew !== cleanConfirm) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu xác nhận không khớp với mật khẩu mới." },
        { status: 400 }
      );
    }

    // Lấy thông tin user đầy đủ từ DB kèm passwordHash
    const dbUser = await prisma.user.findUnique({
      where: { id: authCheck.user.id },
      select: { id: true, username: true, role: true, passwordHash: true, mustChangePassword: true },
    });

    if (!dbUser) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tài khoản." }, { status: 404 });
    }

    // Nếu có mật khẩu cũ hoặc không phải là trường hợp bắt buộc đổi lần đầu, kiểm tra mật khẩu cũ
    if (cleanOld) {
      const isOldValid = verifyPassword(cleanOld, dbUser.passwordHash) || verifyPassword(oldPassword, dbUser.passwordHash);
      if (!isOldValid) {
        return NextResponse.json(
          { success: false, message: "Mật khẩu hiện tại (hoặc mật khẩu do Admin cấp) không chính xác." },
          { status: 400 }
        );
      }
    } else if (!dbUser.mustChangePassword) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập mật khẩu hiện tại của bạn." },
        { status: 400 }
      );
    }

    // Cập nhật mật khẩu mới và hủy cờ mustChangePassword
    const newHash = hashPassword(cleanNew);
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "Đổi mật khẩu thành công! Mật khẩu mới này là của riêng bạn, hãy ghi nhớ để đăng nhập các lần sau.",
    });

    // Làm mới phiên đăng nhập an toàn
    const sessionToken = createDictionarySession(dbUser.id);
    if (sessionToken) {
      response.cookies.set(DICTIONARY_SESSION_COOKIE, sessionToken, dictionaryCookieOptions(request));
    }

    return response;
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi cập nhật mật khẩu." },
      { status: 500 }
    );
  }
}
