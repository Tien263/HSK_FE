import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const body = await request.json();
    const { name, username, password } = body;

    if (!name || !username) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập họ tên và tên đăng nhập" }, { status: 400 });
    }

    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!targetClass) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học" }, { status: 404 });
    }

    // Kiểm tra tên đăng nhập đã có chưa
    const existingUser = await prisma.user.findFirst({
      where: { username },
    });
    if (existingUser) {
      return NextResponse.json({ success: false, message: `Tên đăng nhập "${username}" đã tồn tại. Vui lòng chọn tên khác.` }, { status: 400 });
    }

    // Tạo tài khoản học sinh mới
    const newStudent = await prisma.user.create({
      data: {
        name,
        username,
        passwordHash: password || "123456",
        role: "STUDENT",
        status: "ACTIVE",
        currentHskLevel: targetClass.level,
        totalXp: 0,
        streakDays: 1,
      },
    });

    // Gán học sinh vào lớp này
    await prisma.classStudent.create({
      data: {
        classId: targetClass.id,
        studentId: newStudent.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã cấp tài khoản thành công cho em ${newStudent.name}!`,
      student: {
        id: newStudent.id,
        name: newStudent.name,
        username: newStudent.username,
        password: password || "123456",
        totalXp: 0,
        streakDays: 1,
        status: newStudent.status,
        attemptsCount: 0,
        wrongCount: 0,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /classes/[id]/students error:", error);
    return NextResponse.json({ success: false, message: "Lỗi cấp tài khoản học sinh" }, { status: 500 });
  }
}
