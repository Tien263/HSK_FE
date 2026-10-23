import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        assignment: {
          include: {
            quizSet: {
              include: {
                questions: {
                  include: { question: true },
                  orderBy: { orderIndex: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lượt làm bài" }, { status: 404 });
    }

    const sanitizedQuestions = attempt.assignment.quizSet.questions.map((q) => {
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
        audioUrl: q.question.audioUrl,
        imageUrl: q.question.imageUrl,
        options: parsedOptions,
        points: q.points,
      };
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      assignment: {
        id: attempt.assignment.id,
        title: attempt.assignment.title,
        durationMin: attempt.assignment.durationMin,
      },
      questions: sanitizedQuestions,
      status: attempt.status,
    });
  } catch (error) {
    console.error("GET /attempts/[id] error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tải lượt làm bài" }, { status: 500 });
  }
}
