import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, goal, level, dailyTime, classCode } = body;

    const student = await prisma.user.findFirst({
      where: { username: username || "student" },
    });

    if (!student) {
      return NextResponse.json({ success: false, message: "Không tìm thấy học sinh." }, { status: 404 });
    }

    let targetLevel = 1;
    if (level === "HSK 1-3") targetLevel = 2;
    if (level === "HSK 4 trở lên") targetLevel = 4;

    // Cập nhật cấp độ cho học viên
    await prisma.user.update({
      where: { id: student.id },
      data: {
        currentHskLevel: targetLevel,
      },
    });

    // Nếu có mã lớp, tìm lớp và ghi danh vào lớp
    if (classCode) {
      const targetClass = await prisma.class.findFirst({
        where: {
          OR: [
            { name: { contains: classCode.trim() } },
            { id: classCode.trim() },
          ],
        },
      });

      if (targetClass) {
        await prisma.classStudent.upsert({
          where: {
            classId_studentId: {
              classId: targetClass.id,
              studentId: student.id,
            },
          },
          update: {},
          create: {
            classId: targetClass.id,
            studentId: student.id,
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: "Lưu lộ trình học thành công!",
      hskLevel: targetLevel,
    });
  } catch (error) {
    console.error("POST /api/v1/auth/onboarding error:", error);
    return NextResponse.json({ success: false, message: "Lỗi lưu thông tin khảo sát." }, { status: 500 });
  }
}
