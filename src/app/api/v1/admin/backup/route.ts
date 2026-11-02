import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

// GET /api/v1/admin/backup - Tải bản sao lưu toàn bộ dữ liệu CSDL (Admin only)
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Chỉ Quản trị viên (Admin) mới có quyền xuất bản sao lưu CSDL." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "download"; // "download" hoặc "summary"

    // Thống kê số lượng trước khi sao lưu
    const [
      userCount,
      classCount,
      assignmentCount,
      attemptCount,
      questionCount,
      quizSetCount,
      materialCount,
      vocabProgressCount,
      gameSessionCount,
      xpLogCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.class.count(),
      prisma.assignment.count(),
      prisma.attempt.count(),
      prisma.question.count(),
      prisma.quizSet.count(),
      prisma.teachingMaterial.count(),
      prisma.vocabProgress.count(),
      prisma.gameSession.count(),
      prisma.xpLog.count(),
    ]);

    const summary = {
      userCount,
      classCount,
      assignmentCount,
      attemptCount,
      questionCount,
      quizSetCount,
      materialCount,
      vocabProgressCount,
      gameSessionCount,
      xpLogCount,
      totalRecords:
        userCount +
        classCount +
        assignmentCount +
        attemptCount +
        questionCount +
        quizSetCount +
        materialCount +
        vocabProgressCount +
        gameSessionCount +
        xpLogCount,
    };

    if (mode === "summary") {
      return NextResponse.json({
        success: true,
        summary,
        timestamp: new Date().toISOString(),
      });
    }

    // Xuất dữ liệu chi tiết
    const [
      users,
      classes,
      classStudents,
      assignments,
      assignmentTargets,
      attempts,
      questions,
      quizSets,
      quizSetQuestions,
      materials,
      vocabProgress,
      gameSessions,
      xpLogs,
    ] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          status: true,
          currentHskLevel: true,
          totalXp: true,
          streakDays: true,
          dailyAiQuota: true,
          aiUsageToday: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.class.findMany(),
      prisma.classStudent.findMany(),
      prisma.assignment.findMany(),
      prisma.assignmentTarget.findMany(),
      prisma.attempt.findMany({
        take: 5000,
        orderBy: { startedAt: "desc" },
      }),
      prisma.question.findMany({
        take: 5000,
        orderBy: { createdAt: "desc" },
      }),
      prisma.quizSet.findMany(),
      prisma.quizSetQuestion.findMany(),
      prisma.teachingMaterial.findMany({
        select: {
          id: true,
          teacherId: true,
          title: true,
          description: true,
          fileName: true,
          mimeType: true,
          byteSize: true,
          createdAt: true,
        },
      }),
      prisma.vocabProgress.findMany({
        take: 5000,
      }),
      prisma.gameSession.findMany({
        take: 2000,
        orderBy: { playedAt: "desc" },
      }),
      prisma.xpLog.findMany({
        take: 5000,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const backupPayload = {
      system: "Hanyu - Nền Tảng Học Tiếng Trung HSK",
      version: "1.0.0",
      backupDate: new Date().toISOString(),
      generatedBy: authUser.username,
      summary,
      data: {
        users,
        classes,
        classStudents,
        assignments,
        assignmentTargets,
        attempts,
        questions,
        quizSets,
        quizSetQuestions,
        materials,
        vocabProgress,
        gameSessions,
        xpLogs,
      },
    };

    const dateStr = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");
    const timeStr = new Date()
      .toTimeString()
      .slice(0, 5)
      .replace(/:/g, "");
    const fileName = `hanyu_backup_${dateStr}_${timeStr}.json`;

    return new NextResponse(JSON.stringify(backupPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("GET /api/v1/admin/backup error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi khi tạo bản sao lưu CSDL." },
      { status: 500 }
    );
  }
}
