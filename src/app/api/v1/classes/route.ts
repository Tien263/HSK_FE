import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        _count: { select: { students: true, assignments: true } },
      },
      orderBy: { level: "asc" },
    });

    return NextResponse.json({
      success: true,
      items: classes.map((c) => ({
        id: c.id,
        name: c.name,
        level: c.level,
        description: c.description,
        totalStudents: c._count.students,
        totalAssignments: c._count.assignments,
        isActive: c.isActive,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi tải danh sách lớp" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, level, description } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập tên lớp học" }, { status: 400 });
    }

    // Tìm giáo viên phụ trách (Cô Ning Ning)
    const teacher = await prisma.user.findFirst({
      where: { role: "TEACHER" },
    });

    const newClass = await prisma.class.create({
      data: {
        name,
        level: Number(level) || 1,
        description: description || "Lớp tiếng Trung HSK chuẩn cô Ning Ning",
        teacherId: teacher?.id || "teacher-default-id",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        id: newClass.id,
        name: newClass.name,
        level: newClass.level,
        description: newClass.description,
        totalStudents: 0,
        totalAssignments: 0,
        isActive: newClass.isActive,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /classes error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tạo lớp học mới" }, { status: 500 });
  }
}
