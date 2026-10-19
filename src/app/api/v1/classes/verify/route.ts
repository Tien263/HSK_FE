import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = (searchParams.get("code") || "").trim();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập mã lớp học." },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase();

    // 1. Tìm lớp trong DB khớp mã hoặc tên
    let foundClass = await prisma.class.findFirst({
      where: {
        OR: [
          { id: code },
          { name: { contains: code } },
          { description: { contains: code } },
        ],
      },
      include: {
        teacher: true,
        _count: { select: { students: true } },
      },
    });

    // 2. Nếu là mã demo HANYU3A mà chưa có lớp trong DB, tự động khởi tạo lớp mẫu HSK 3
    if (!foundClass && (normalizedCode === "HANYU3A" || normalizedCode.includes("HANYU"))) {
      let teacher = await prisma.user.findFirst({
        where: { role: "TEACHER" },
      });

      if (!teacher) {
        teacher = await prisma.user.create({
          data: {
            username: "teacher",
            name: "Nguyễn Thảo (Cô Ning Ning)",
            email: "coningning@ningning.edu.vn",
            passwordHash: "teacher123",
            role: "TEACHER",
            status: "ACTIVE",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
          },
        });
      }

      foundClass = await prisma.class.create({
        data: {
          name: "Lớp HSK 3 Chuẩn Quốc Tế (HANYU3A)",
          level: 3,
          teacherId: teacher.id,
          description: "Lớp học chuẩn HSK 3.0 với cô Ning Ning: nhận bài tập hàng tuần, chấm bài và theo dõi tiến độ.",
          isActive: true,
        },
        include: {
          teacher: true,
          _count: { select: { students: true } },
        },
      });
    }

    if (!foundClass) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy lớp học với mã "${code}". Vui lòng kiểm tra lại.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      classInfo: {
        id: foundClass.id,
        name: foundClass.name,
        level: foundClass.level,
        description: foundClass.description,
        code: normalizedCode === "HANYU3A" ? "HANYU3A" : foundClass.id.slice(-6).toUpperCase(),
        teacherName: foundClass.teacher?.name || "Cô Ning Ning",
        teacherAvatar: foundClass.teacher?.avatar || "/theme/avatar-teacher.jpg",
        teacherEmail: foundClass.teacher?.email || "coningning@ningning.edu.vn",
        studentCount: foundClass._count.students,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi kiểm tra mã lớp." },
      { status: 500 }
    );
  }
}
