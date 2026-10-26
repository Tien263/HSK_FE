import {unstable_rethrow} from "next/navigation";
import { getAuthUser } from "@/lib/auth-server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const auth=await getAuthUser(request);if(!auth||auth.role!=="STUDENT")return NextResponse.json({success:false,message:"Vui lòng đăng nhập học sinh."},{status:401}); const student=await prisma.user.findUniqueOrThrow({where:{id:auth.id}});
    // 1. Lấy danh sách lớp mà học sinh này thực sự tham gia
    const enrolledClasses = await prisma.classStudent.findMany({
      where: { studentId: student.id, status:"APPROVED" },
      select: { classId: true },
    });
    const enrolledClassIds = enrolledClasses.map((c) => c.classId);

    // 2. Chỉ lấy bài tập của các lớp học sinh này đã tham gia
    const assignments =
      enrolledClassIds.length > 0
        ? await prisma.assignment.findMany({
            where: {
              classId: { in: enrolledClassIds },
              status:{notIn:["DRAFT","ARCHIVED"]},AND:[{OR:[{targets:{none:{}}},{targets:{some:{studentId:student.id}}}]}],
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
    unstable_rethrow(error);
    console.error("GET /my/summary error:", error);
    return NextResponse.json({ success: false, message: "Lỗi nạp dữ liệu học sinh" }, { status: 500 });
  }
}
