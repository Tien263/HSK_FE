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
        assignment: { select: { title: true } },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ success: false, message: "Không tìm thấy kết quả bài làm" }, { status: 404 });
    }

    const details = attempt.answers.map((a) => {
      let parsedOptions = [];
      try {
        parsedOptions = typeof a.question.options === "string" ? JSON.parse(a.question.options) : a.question.options;
      } catch {
        parsedOptions = [];
      }

      return {
        questionId: a.question.id,
        content: a.question.content,
        pinyinPrompt: a.question.pinyinPrompt,
        options: parsedOptions,
        userAnswer: a.userAnswer,
        correctAnswer: a.question.correctAnswer,
        isCorrect: a.isCorrect,
        scoreEarned: a.scoreEarned,
        explanation: a.question.explanation,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        attemptId: attempt.id,
        assignmentTitle: attempt.assignment.title,
        score: attempt.score,
        maxScore: attempt.maxScore,
        submittedAt: attempt.submittedAt,
        durationSec: attempt.durationSec,
        answers: details,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi tải kết quả" }, { status: 500 });
  }
}
