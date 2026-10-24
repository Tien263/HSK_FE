import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const filterTeacherId = searchParams.get("teacherId") || (authUser?.role === "TEACHER" ? authUser.id : null);
    const filterStudentId = searchParams.get("studentId") || (authUser?.role === "STUDENT" ? authUser.id : null);
    const filterAssignmentId = searchParams.get("assignmentId");

    const where: any = {};
    if (filterAssignmentId) {
      where.assignmentId = filterAssignmentId;
    }
    if (filterStudentId) {
      where.studentId = filterStudentId;
    }
    if (filterTeacherId) {
      where.assignment = { class: { teacherId: filterTeacherId } };
    }

    const attempts = await prisma.attempt.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
        assignment: {
          include: {
            class: { select: { id: true, name: true } },
            quizSet: {
              select: {
                totalScore: true,
                questions: { select: { id: true, points: true } },
              },
            },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    const items = attempts.map((att: any) => {
      const nowStr = att.submittedAt
        ? new Date(att.submittedAt).toLocaleDateString("vi-VN") +
          " " +
          new Date(att.submittedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        : "Vừa xong";

      const answersObj: Record<string, any> = {};
      if (Array.isArray(att.answers)) {
        att.answers.forEach((ans: any) => {
          answersObj[ans.questionId] = ans.userAnswer;
        });
      }

      return {
        id: att.id,
        assignmentId: att.assignmentId,
        assignmentTitle: att.assignment?.title || "Bài kiểm tra",
        studentId: att.student?.id || att.studentId,
        studentName: att.student?.name || "Học viên",
        studentAvatar: att.student?.avatar || "/theme/avatar-student.jpg",
        classId: att.assignment?.class?.id || "",
        className: att.assignment?.class?.name || "Lớp học",
        submittedAt: nowStr,
        score: att.score,
        maxScore: att.maxScore || att.assignment?.quizSet?.totalScore || 100,
        submissionStatus: att.status === "IN_PROGRESS" ? "NOT_STARTED" : "SUBMITTED",
        gradingStatus: att.status === "GRADED" ? "GRADED" : "AUTO_GRADED",
        gradingStatusText: att.status === "GRADED" ? "Đã chấm điểm" : "Chờ duyệt",
        attemptNumber: 1,
        feedback: att.teacherNote || "",
        answers: answersObj,
      };
    });

    return NextResponse.json({
      success: true,
      items,
      totalCount: items.length,
    });
  } catch (error) {
    console.error("GET /api/v1/attempts error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tải danh sách bài nộp" }, { status: 500 });
  }
}
