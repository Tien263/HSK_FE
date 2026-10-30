import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isMockAnswerCorrect } from "@/lib/mock-exam-matcher";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      quizSetId,
      studentId: providedStudentId,
      hskLevel = 1,
      totalScore = 200,
      score = 0,
      listeningScore = 0,
      readingScore = 0,
      writingScore = 0,
      timeSpentSec = 0,
      answers = {},
      questions = [],
    } = body;

    const level = parseInt(String(hskLevel), 10) || 1;
    const finalTotalScore = Number(totalScore) || (level <= 2 ? 200 : 300);
    const finalScore = Number(score) || 0;

    // Xác định học sinh
    let studentId = providedStudentId;
    if (!studentId) {
      const firstStudent = await prisma.user.findFirst({
        where: { role: "STUDENT" },
      });
      studentId = firstStudent?.id;
    }

    if (!studentId) {
      const anyUser = await prisma.user.findFirst();
      studentId = anyUser?.id || "student_guest";
    }

    const passThreshold = finalTotalScore <= 200 ? 120 : 180;
    const isPassed = finalScore >= passThreshold;

    // Tìm xem đề thi này có assignment nào hoặc tạo/gắn vào assignment mặc định
    let assignmentId: string | null = null;
    if (quizSetId) {
      const assignment = await prisma.assignment.findFirst({
        where: { quizSetId },
      });
      assignmentId = assignment?.id || null;
    }

    // Nếu không có assignment riêng (ví dụ đề thi công khai toàn trường), tìm hoặc tạo 1 assignment công khai
    if (!assignmentId) {
      // Tìm giáo viên phụ trách
      const teacher = await prisma.user.findFirst({
        where: { role: { in: ["TEACHER", "ADMIN"] } },
      });
      const teacherId = teacher?.id || studentId;

      let defaultClass = await prisma.class.findFirst();
      if (!defaultClass) {
        defaultClass = await prisma.class.create({
          data: {
            name: "Lớp Ôn Luyện HSK Toàn Trường",
            level,
            teacherId,
          },
        });
      }

      // Tạo hoặc tìm QuizSet
      let currentQuizSetId = quizSetId;
      if (!currentQuizSetId) {
        const dummySet = await prisma.quizSet.findFirst({
          where: { hskLevel: level },
        });
        currentQuizSetId = dummySet?.id;
      }

      if (!currentQuizSetId) {
        const newSet = await prisma.quizSet.create({
          data: {
            title: `Bộ đề thi thử HSK ${level} Quốc tế`,
            hskLevel: level,
            mode: "MOCK_EXAM",
            status: "READY",
            totalScore: finalTotalScore,
            teacherId,
          },
        });
        currentQuizSetId = newSet.id;
      }

      const publicAssignment = await prisma.assignment.create({
        data: {
          quizSetId: currentQuizSetId,
          classId: defaultClass.id,
          title: `Kỳ thi thử HSK ${level} Chuẩn Quốc Tế`,
          dueAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 năm
          durationMin: level <= 2 ? 40 : 90,
          status: "OPEN",
          mode: "EXAM",
        },
      });
      assignmentId = publicAssignment.id;
    }

    // Lưu lượt thi Attempt
    const attempt = await prisma.attempt.create({
      data: {
        assignmentId,
        studentId,
        score: finalScore,
        maxScore: finalTotalScore,
        durationSec: timeSpentSec || 1800,
        status: "GRADED",
        submittedAt: new Date(),
        teacherNote: isPassed
          ? `Đạt chuẩn HSK ${level} (${finalScore}/${finalTotalScore}đ)`
          : `Chưa đạt điểm đỗ HSK ${level} (${finalScore}/${finalTotalScore}đ)`,
      },
    });

    // Lưu chi tiết từng câu trả lời AttemptAnswer để Giáo viên có thể xem Bản đồ nhiệt lỗi sai (Class Error Heatmap)
    if (Array.isArray(questions) && questions.length > 0) {
      for (const q of questions) {
        const userAns = answers[q.id];
        const isCorrect = isMockAnswerCorrect(userAns, q.correctAnswer, q.options);
        const qPoints = q.points || 10;

        let validQuestionId = q.id;
        // Kiểm tra xem q.id có phải là ID thật trong bảng Question không
        const exists = await prisma.question.findUnique({
          where: { id: q.id },
          select: { id: true },
        });

        if (!exists) {
          // Tạo một Question đại diện để liên kết khóa ngoại
          const createdQ = await prisma.question.create({
            data: {
              content: q.prompt || "Câu hỏi trắc nghiệm HSK",
              pinyinPrompt: q.subPrompt,
              type: "single_choice",
              skill: q.section || "READING",
              level,
              correctAnswer: q.correctAnswer || "A",
              explanation: q.explanation,
            },
          });
          validQuestionId = createdQ.id;
        }

        await prisma.attemptAnswer.create({
          data: {
            attemptId: attempt.id,
            questionId: validQuestionId,
            userAnswer: typeof userAns === "string" ? userAns : JSON.stringify(userAns || ""),
            isCorrect,
            scoreEarned: isCorrect ? qPoints : 0,
            teacherNote: isCorrect
              ? "Chính xác!"
              : `Chưa đúng. Đáp án chuẩn: ${q.correctAnswer}. ${q.explanation || ""}`,
          },
        }).catch(() => {});
      }
    }

    // Cộng XP thật vào tài khoản học sinh
    const xpEarned = isPassed ? 50 : 25;
    try {
      await prisma.user.update({
        where: { id: studentId },
        data: {
          totalXp: { increment: xpEarned },
        },
      });

      await prisma.xpLog.create({
        data: {
          studentId,
          amount: xpEarned,
          source: "ASSIGNMENT_SUBMIT",
          reason: `Hoàn thành bài thi thử HSK ${level}: ${finalScore}/${finalTotalScore}đ (${isPassed ? "ĐẠT CHUẨN" : "CẦN CỐ GẮNG"})`,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: finalScore,
      totalScore: finalTotalScore,
      isPassed,
      xpEarned,
      listeningScore,
      readingScore,
      writingScore,
      message: isPassed
        ? `Chúc mừng bạn đã ĐẠT CHUẨN bài thi thử HSK ${level}! (+${xpEarned} XP)`
        : `Bạn đã hoàn thành bài thi thử HSK ${level}. Cố gắng thêm nhé! (+${xpEarned} XP)`,
    });
  } catch (error: any) {
    console.error("POST /api/v1/mock-exams/submit error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi lưu kết quả bài thi" },
      { status: 500 }
    );
  }
}
