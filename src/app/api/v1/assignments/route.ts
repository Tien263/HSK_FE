import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        class: { select: { id: true, name: true, level: true } },
        _count: { select: { attempts: true } },
      },
      orderBy: { dueAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      items: assignments.map((a) => ({
        id: a.id,
        title: a.title,
        classId: a.classId,
        className: a.class.name,
        dueAt: a.dueAt,
        status: a.status,
        durationMin: a.durationMin,
        submittedCount: a._count.attempts,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi tải bài tập" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, classId, quizSetId, dueAt, durationMin, mode } = body;

    if (!title || !classId) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Nếu không truyền quizSetId thì lấy hoặc tạo một quizSet mặc định
    let validQuizSetId = quizSetId;
    if (!validQuizSetId) {
      const defaultQuizSet = await prisma.quizSet.findFirst();
      validQuizSetId = defaultQuizSet?.id;
    }

    if (!validQuizSetId) {
      return NextResponse.json({ success: false, message: "Chưa có bộ câu hỏi phù hợp" }, { status: 400 });
    }

    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        classId,
        quizSetId: validQuizSetId,
        dueAt: dueAt ? new Date(dueAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        durationMin: durationMin || 45,
        mode: mode || "EXAM",
        status: "OPEN",
      },
    });

    return NextResponse.json({ success: true, item: newAssignment }, { status: 201 });
  } catch (error) {
    console.error("POST /assignments error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tạo bài tập mới" }, { status: 500 });
  }
}
