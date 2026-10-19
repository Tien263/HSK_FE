import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username") || "student";

    let student = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username },
          ...(username === "ningning" ? [{ username: "ning" }] : []),
        ],
      },
    });

    if (!student) {
      student = await prisma.user.findFirst({ where: { role: "STUDENT" } });
    }

    if (!student) {
      return NextResponse.json({ success: false, message: "Không tìm thấy học sinh" }, { status: 404 });
    }

    // Lấy bài tập được giao từ DB
    const assignments = await prisma.assignment.findMany({
      include: {
        quizSet: {
          select: {
            title: true,
            totalScore: true,
            _count: { select: { questions: true } },
          },
        },
        class: { select: { name: true } },
        attempts: {
          where: { studentId: student.id },
          orderBy: { startedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { dueAt: "asc" },
    });

    // Lấy số từ cần ôn hôm nay từ DB
    const dueVocabsCount = await prisma.vocabProgress.count({
      where: {
        studentId: student.id,
        nextReviewAt: { lte: new Date() },
      },
    });

    // Lấy số câu sai cần luyện lại từ DB
    const wrongQuestionsCount = await prisma.wrongQuestion.count({
      where: {
        studentId: student.id,
        consecutiveRight: { lt: 3 },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          username: student.username,
          currentHskLevel: student.currentHskLevel,
          totalXp: student.totalXp,
          streakDays: student.streakDays,
        },
        counts: {
          pendingAssignments: assignments.filter((a) => a.attempts.length === 0).length,
          dueVocabs: dueVocabsCount,
          wrongQuestions: wrongQuestionsCount,
        },
        assignments: assignments.map((a) => ({
          id: a.id,
          title: a.title,
          className: a.class.name,
          durationMin: a.durationMin,
          dueAt: a.dueAt,
          totalQuestions: a.quizSet._count.questions,
          hasAttempted: a.attempts.length > 0,
          latestScore: a.attempts[0]?.score ?? null,
        })),
      },
    });
  } catch (error) {
    console.error("GET /my/summary error:", error);
    return NextResponse.json({ success: false, message: "Lỗi nạp dữ liệu học sinh" }, { status: 500 });
  }
}
