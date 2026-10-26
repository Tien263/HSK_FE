import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;

    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: {
          select: { id: true, name: true, username: true },
        },
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                totalXp: true,
                streakDays: true,
                currentHskLevel: true,
              },
            },
          },
        },
        assignments: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!classRecord) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy lớp học" },
        { status: 404 }
      );
    }

    const studentIds = classRecord.students.map((s) => s.studentId);
    const totalStudents = studentIds.length;

    // 1. Lấy tất cả bài làm của học sinh trong lớp
    const attempts = await prisma.attempt.findMany({
      where: {
        studentId: { in: studentIds },
        status: { in: ["SUBMITTED", "GRADED"] },
      },
      include: {
        student: {
          select: { id: true, name: true, username: true },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    // 2. Tính điểm trung bình và bảng điểm của từng học sinh
    const gradebookRows = classRecord.students.map((cs, idx) => {
      const s = cs.student;
      const sAttempts = attempts.filter((a) => a.studentId === s.id);
      const scores = sAttempts.map((a) => a.score ?? 0);
      const avgScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null;

      let classification = "Chưa làm bài";
      if (avgScore !== null) {
        if (avgScore >= 85) classification = "Xuất sắc";
        else if (avgScore >= 70) classification = "Giỏi";
        else if (avgScore >= 50) classification = "Khá";
        else classification = "Cần cố gắng";
      }

      return {
        stt: idx + 1,
        studentId: s.id,
        name: s.name || s.username,
        username: s.username,
        email: s.email || "—",
        hskLevel: s.currentHskLevel,
        streakDays: s.streakDays,
        totalXp: s.totalXp,
        completedAttempts: sAttempts.length,
        avgScore: avgScore !== null ? `${avgScore}đ` : "—",
        numericAvgScore: avgScore ?? 0,
        classification,
      };
    });

    // 3. Bản đồ nhiệt câu hỏi sai nhiều nhất (Error Heatmap)
    const questionStats: Record<
      string,
      {
        questionId: string;
        content: string;
        correctAnswer: string;
        explanation: string;
        wrongCount: number;
        totalAttempts: number;
      }
    > = {};

    attempts.forEach((a) => {
      a.answers.forEach((ans) => {
        const q = ans.question;
        if (!q) return;

        if (!questionStats[q.id]) {
          questionStats[q.id] = {
            questionId: q.id,
            content: q.content,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || "",
            wrongCount: 0,
            totalAttempts: 0,
          };
        }

        questionStats[q.id].totalAttempts += 1;
        if (!ans.isCorrect) {
          questionStats[q.id].wrongCount += 1;
        }
      });
    });

    // Tính tỷ lệ sai % và xếp theo thứ tự câu sai nhiều nhất
    const errorHeatmap = Object.values(questionStats)
      .map((item) => {
        const errorRate =
          item.totalAttempts > 0
            ? Math.round((item.wrongCount / item.totalAttempts) * 100)
            : 0;
        return {
          ...item,
          errorRate,
        };
      })
      .filter((item) => item.wrongCount > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      classInfo: {
        id: classRecord.id,
        name: classRecord.name,
        level: classRecord.level,
        teacherName: classRecord.teacher?.name || classRecord.teacher?.username,
        totalStudents,
      },
      gradebookRows,
      errorHeatmap,
    });
  } catch (error) {
    console.error("GET /api/v1/teacher/classes/[id]/diagnostics error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi tải dữ liệu chẩn đoán lớp học" },
      { status: 500 }
    );
  }
}
