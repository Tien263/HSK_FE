import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdHeader = request.headers.get("x-user-id");
    const studentIdParam = searchParams.get("studentId");
    const username = searchParams.get("username");

    let student = null;
    if (studentIdParam || userIdHeader) {
      student = await prisma.user.findUnique({
        where: { id: studentIdParam || userIdHeader || "" },
      });
    }

    if (!student && username) {
      student = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email: username },
            ...(username === "ningning" ? [{ username: "ning" }] : []),
          ],
        },
      });
    }

    if (!student) {
      return NextResponse.json({
        success: true,
        data: {
          student: null,
          counts: { pendingAssignments: 0, dueVocabs: 0, wrongQuestions: 0 },
          assignments: [],
        },
      });
    }

    // 1. Lấy danh sách lớp mà học sinh này thực sự tham gia
    const enrolledClasses = await prisma.classStudent.findMany({
      where: { studentId: student.id },
      select: { classId: true },
    });
    const enrolledClassIds = enrolledClasses.map((c) => c.classId);

    // 2. Chỉ lấy bài tập của các lớp học sinh này đã tham gia
    const assignments =
      enrolledClassIds.length > 0
        ? await prisma.assignment.findMany({
            where: {
              classId: { in: enrolledClassIds },
            },
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
          })
        : [];

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
