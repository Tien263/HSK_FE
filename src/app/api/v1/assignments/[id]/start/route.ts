import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;
    const body = await request.json().catch(() => ({}));
    const username = body.username || "student";

    const student = await prisma.user.findFirst({
      where: { username },
    });

    if (!student) {
      return NextResponse.json({ success: false, message: "Không tìm thấy học sinh" }, { status: 404 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        quizSet: {
          include: {
            questions: {
              include: {
                question: true,
              },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ success: false, message: "Không tìm thấy bài tập" }, { status: 404 });
    }

    // Tạo lượt làm bài (Attempt) mới trong Database
    const attempt = await prisma.attempt.create({
      data: {
        assignmentId: assignment.id,
        studentId: student.id,
        status: "IN_PROGRESS",
        maxScore: assignment.quizSet.totalScore,
      },
    });

    // Trả về danh sách câu hỏi KHÔNG KÈM đáp án đúng (theo chuẩn bảo mật BR-06)
    const sanitizedQuestions = assignment.quizSet.questions.map((q) => {
      let parsedOptions = [];
      try {
        parsedOptions = typeof q.question.options === "string" ? JSON.parse(q.question.options) : q.question.options;
      } catch {
        parsedOptions = [];
      }

      return {
        id: q.question.id,
        orderIndex: q.orderIndex,
        type: q.question.type,
        content: q.question.content,
        pinyinPrompt: q.question.pinyinPrompt,
        options: parsedOptions,
        points: q.points,
      };
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      assignment: {
        id: assignment.id,
        title: assignment.title,
        durationMin: assignment.durationMin,
      },
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error("POST /assignments/[id]/start error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tạo lượt làm bài" }, { status: 500 });
  }
}
