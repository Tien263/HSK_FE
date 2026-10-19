import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, email, password, role } = body;

    if (!name || (!username && !email) || !password) {
      return NextResponse.json(
        { success: false, message: "Vui lòng điền đầy đủ họ tên, tài khoản và mật khẩu." },
        { status: 400 }
      );
    }

    const cleanUsername = (username || email || "").toLowerCase().trim();
    const cleanEmail = email ? email.toLowerCase().trim() : null;

    // Kiểm tra tài khoản đã tồn tại chưa
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          cleanEmail ? { email: cleanEmail } : { username: cleanUsername },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Tài khoản hoặc email này đã tồn tại trên hệ thống." },
        { status: 400 }
      );
    }

    const assignedRole = role === "TEACHER" ? "TEACHER" : "STUDENT";

    // Tạo người dùng mới trong SQLite
    const user = await prisma.user.create({
      data: {
        name,
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: password,
        role: assignedRole,
        status: "ACTIVE",
        currentHskLevel: 1,
        totalXp: 50, // Thưởng 50 XP cho thành viên mới
        streakDays: 1,
      },
    });

    // Nếu là học viên, tự động ghi danh vào lớp HSK 1A mặc định nếu có
    if (assignedRole === "STUDENT") {
      const defaultClass = await prisma.class.findFirst();
      if (defaultClass) {
        await prisma.classStudent.create({
          data: {
            classId: defaultClass.id,
            studentId: user.id,
          },
        }).catch(() => {});
      }
    }

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
      },
    });
  } catch (error) {
    console.error("POST /api/v1/auth/register error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi đăng ký tài khoản." },
      { status: 500 }
    );
  }
}
