import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { classId, lessonId, lessonTitle, selectedItems, startDate, dueDate, note } = body;

    if (!classId) {
      return NextResponse.json(
        { success: false, message: "Vui lòng chọn lớp học cần giao bài" },
        { status: 400 }
      );
    }

    // Check if class exists
    let targetClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!targetClass) {
      targetClass = await prisma.class.findFirst({
        where: {
          OR: [
            { id: { endsWith: classId.toLowerCase() } },
            { id: { endsWith: classId.toUpperCase() } },
            { name: { contains: classId } },
          ],
        },
      });
    }

    if (!targetClass) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy lớp học yêu cầu" },
        { status: 404 }
      );
    }

    // Ensure a QuizSet exists for assignment link
    let quizSet = await prisma.quizSet.findFirst();
    if (!quizSet) {
      quizSet = await prisma.quizSet.create({
        data: {
          title: `Lý thuyết bài học: ${lessonTitle || "Bài mới"}`,
          mode: "PRACTICE",
          totalScore: 100,
        },
      });
    }

    const assignmentTitle = `Học phần lý thuyết: ${lessonTitle || "Bài học mới"}`;

    const newAssignment = await prisma.assignment.create({
      data: {
        quizSetId: quizSet.id,
        classId: targetClass.id,
        title: assignmentTitle,
        openAt: startDate ? new Date(startDate) : new Date(),
        dueAt: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        durationMin: 45,
        status: "OPEN",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã giao bài học "${lessonTitle}" thành công cho lớp ${targetClass.name}!`,
      assignmentId: newAssignment.id,
    });
  } catch (error: any) {
    console.error("Assign lesson error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi giao bài học cho lớp" },
      { status: 500 }
    );
  }
}
