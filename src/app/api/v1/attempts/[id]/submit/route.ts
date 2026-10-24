import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params;
    const body = await request.json();
    const { answers, durationSec } = body; // answers: { [questionId]: "A" }

    let attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        student: true,
        assignment: {
          include: {
            quizSet: {
              include: {
                questions: {
                  include: { question: true },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      // Hỗ trợ trường hợp attemptId chính là assignmentId
      const assignment = await prisma.assignment.findUnique({
        where: { id: attemptId },
        include: {
          quizSet: {
            include: {
              questions: { include: { question: true } },
            },
          },
        },
      });

      if (assignment) {
        let student = await prisma.user.findFirst({ where: { role: "STUDENT" } });
        if (student) {
          attempt = await prisma.attempt.create({
            data: {
              assignmentId: assignment.id,
              studentId: student.id,
              status: "IN_PROGRESS",
            },
            include: {
              student: true,
              assignment: {
                include: {
                  quizSet: {
                    include: {
                      questions: { include: { question: true } },
                    },
                  },
                },
              },
            },
          });
        }
      }
    }

    if (!attempt) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lượt làm bài" }, { status: 404 });
    }

    let earnedScore = 0;
    let correctCount = 0;
    const totalQuestions = attempt.assignment.quizSet.questions.length;

    // Chấm điểm tự động từng câu từ Database thật
    for (const item of attempt.assignment.quizSet.questions) {
      const q = item.question;
      const studentAns = answers?.[q.id] || "";
      const isCorrect = studentAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase();
      const points = isCorrect ? item.points : 0;

      if (isCorrect) {
        earnedScore += points;
        correctCount++;
      } else {
        // Ghi nhận câu sai vào bảng wrong_questions (Quy tắc BR-07)
        await prisma.wrongQuestion.upsert({
          where: {
            studentId_questionId: {
              studentId: attempt.studentId,
              questionId: q.id,
            },
          },
          update: {
            wrongCount: { increment: 1 },
            consecutiveRight: 0,
            lastWrongAt: new Date(),
          },
          create: {
            studentId: attempt.studentId,
            questionId: q.id,
            wrongCount: 1,
            consecutiveRight: 0,
          },
        });
      }

      // Lưu chi tiết câu trả lời
      await prisma.attemptAnswer.create({
        data: {
          attemptId: attempt.id,
          questionId: q.id,
          userAnswer: studentAns,
          isCorrect,
          scoreEarned: points,
        },
      });
    }

    // Cập nhật lượt làm bài thành SUBMITTED & GRADED
    const updatedAttempt = await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        score: earnedScore,
        status: "GRADED",
        submittedAt: new Date(),
        durationSec: durationSec || 0,
      },
    });

    // Cộng XP cho học sinh (Quy tắc BR-09: Nộp bài +10 XP, mỗi câu đúng +1 XP, đạt từ 80% +5 XP)
    let xpEarned = 10 + correctCount;
    if (earnedScore >= 80) xpEarned += 5;

    await prisma.user.update({
      where: { id: attempt.studentId },
      data: {
        totalXp: { increment: xpEarned },
      },
    });

    await prisma.xpLog.create({
      data: {
        studentId: attempt.studentId,
        amount: xpEarned,
        source: "ASSIGNMENT_SUBMIT",
        reason: `Hoàn thành bài tập "${attempt.assignment.title}"`,
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: updatedAttempt.id,
      score: earnedScore,
      maxScore: attempt.maxScore,
      correctCount,
      totalQuestions,
      xpEarned,
    });
  } catch (error) {
    console.error("POST /attempts/[id]/submit error:", error);
    return NextResponse.json({ success: false, message: "Lỗi nộp bài" }, { status: 500 });
  }
}
