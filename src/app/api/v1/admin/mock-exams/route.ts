import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDictionaryAdmin } from "@/lib/dictionary-session";
import { getAuthUser } from "@/lib/auth-server";
import { seedAuthenticHsk1 } from "@/lib/mock-exam-seeder";

const headers = { "Cache-Control": "no-store, max-age=0" };

async function resolveAdmin(request: Request) {
  const dictAdmin = await getDictionaryAdmin(request);
  if (dictAdmin && (dictAdmin.role === "ADMIN" || dictAdmin.role === "TEACHER")) return dictAdmin;

  const authUser = await getAuthUser(request);
  if (authUser && (authUser.role === "ADMIN" || authUser.role === "TEACHER")) return authUser;

  const xUserId = request.headers.get("x-user-id");
  if (xUserId) {
    const user = await prisma.user.findFirst({
      where: { id: xUserId, status: "ACTIVE" },
      select: { id: true, name: true, username: true, role: true, email: true },
    });
    if (user && (user.role === "ADMIN" || user.role === "TEACHER")) return user;
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const admin = await resolveAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Yêu cầu quyền Quản trị viên." }, { status: 401, headers });
    }

    // 1. Fetch all Mock Exams
    const [quizSets, publicationLogs, attemptLogs] = await Promise.all([
      prisma.quizSet.findMany({
        where: { mode: { in: ["MOCK_EXAM", "EXAM"] } },
        include: {
          teacher: { select: { id: true, name: true, role: true } },
          questions: {
            include: {
              question: {
                select: {
                  id: true,
                  type: true,
                  skill: true,
                  level: true,
                  content: true,
                  audioUrl: true,
                  imageUrl: true,
                  options: true,
                  correctAnswer: true,
                },
              },
            },
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: [{ hskLevel: "asc" }, { createdAt: "desc" }],
      }),
      prisma.auditLog.findMany({
        where: { action: "EXAM_CENTER_PUBLICATION" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.findMany({
        where: { action: "EXAM_CENTER_ATTEMPT" },
        take: 50,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Parse publication configs
    const pubMap = new Map<string, { approved: boolean; durationMin: number; passScore: number }>();
    for (const log of publicationLogs) {
      if (log.details && !pubMap.has(log.entity)) {
        try {
          pubMap.set(log.entity, JSON.parse(log.details));
        } catch {}
      }
    }

    // Format exams list
    const exams = quizSets.map((qs) => {
      const pub = pubMap.get(qs.id);
      const listeningCount = qs.questions.filter((q) => q.question.skill === "LISTENING").length;
      const readingCount = qs.questions.filter((q) => q.question.skill === "READING").length;
      const writingCount = qs.questions.filter((q) => q.question.skill === "WRITING").length;
      const sampleAudio = qs.questions.find((q) => q.question.audioUrl)?.question.audioUrl || `/audio/hsk${qs.hskLevel <= 6 ? qs.hskLevel : 7}_exam.mp3`;

      return {
        id: qs.id,
        title: qs.title,
        description: qs.description,
        hskLevel: qs.hskLevel,
        status: qs.status,
        mode: qs.mode,
        totalScore: qs.totalScore,
        createdAt: qs.createdAt,
        totalQuestions: qs.questions.length,
        listeningCount,
        readingCount,
        writingCount,
        sampleAudio,
        durationMin: pub?.durationMin || (qs.hskLevel === 1 ? 40 : qs.hskLevel === 2 ? 55 : qs.hskLevel === 3 ? 90 : 100),
        passScore: pub?.passScore || (qs.hskLevel <= 2 ? 120 : 180),
        approved: pub ? pub.approved : true,
        proctorEnabled: qs.proctorEnabled !== false,
      };
    });

    // Parse recent attempts
    const userIds = [...new Set(attemptLogs.map((a) => a.userId).filter(Boolean))] as string[];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, username: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const recentAttempts = attemptLogs.map((log) => {
      let state: any = {};
      if (log.details) {
        try {
          state = JSON.parse(log.details);
        } catch {}
      }
      const user = log.userId ? userMap.get(log.userId) : null;
      return {
        id: log.id,
        userId: log.userId,
        userName: user?.name || user?.username || "Thí sinh ẩn danh",
        userEmail: user?.email,
        paperTitle: state.paper?.title || "Bài thi HSK",
        level: state.paper?.level || 1,
        status: state.status || "IN_PROGRESS",
        score: state.score,
        maxScore: state.paper?.maxScore || 200,
        startedAt: state.startedAt || log.createdAt,
        submittedAt: state.submittedAt,
        timedOut: !!state.timedOut,
      };
    });

    return NextResponse.json(
      {
        success: true,
        exams,
        recentAttempts,
        stats: {
          totalExams: exams.length,
          totalAttempts: attemptLogs.length,
          levelsCount: [...new Set(exams.map((e) => e.hskLevel))].length,
        },
      },
      { headers }
    );
  } catch (error: any) {
    console.error("Failed to load admin mock exams:", error);
    return NextResponse.json({ success: false, message: error.message || "Lỗi máy chủ" }, { status: 500, headers });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await resolveAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Yêu cầu quyền Quản trị viên." }, { status: 401, headers });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action;

    // 1. Seed Official HSK 1 CTI
    if (action === "seedHsk1") {
      const res = await seedAuthenticHsk1(admin.id);
      return NextResponse.json(
        {
          success: true,
          message: "Đã nạp thành công Đề thi Chuẩn HSK 1 CTI (40 câu hỏi, âm thanh gốc & hình ảnh minh họa đầy đủ).",
          res,
        },
        { headers }
      );
    }

    // 2. Delete Exam
    if (action === "deleteExam") {
      const examId = String(body.id || "");
      if (!examId) {
        return NextResponse.json({ success: false, message: "Thiếu ID đề thi cần xóa." }, { status: 400, headers });
      }

      await prisma.quizSetQuestion.deleteMany({ where: { quizSetId: examId } });
      await prisma.auditLog.deleteMany({ where: { entity: examId } });
      await prisma.quizSet.delete({ where: { id: examId } });

      return NextResponse.json({ success: true, message: "Đã xóa đề thi thành công." }, { headers });
    }

    // 3. Toggle Status (READY / DRAFT)
    if (action === "toggleStatus") {
      const examId = String(body.id || "");
      const newStatus = body.status === "READY" ? "READY" : "DRAFT";
      await prisma.quizSet.update({
        where: { id: examId },
        data: { status: newStatus },
      });
      return NextResponse.json({ success: true, message: `Đã đổi trạng thái đề thi sang ${newStatus}.` }, { headers });
    }

    // 4. Toggle AI Proctor (Bật / Tắt Giám thị AI)
    if (action === "toggleProctor") {
      const examId = String(body.id || "");
      const current = await prisma.quizSet.findUnique({ where: { id: examId }, select: { proctorEnabled: true } });
      if (!current) {
        return NextResponse.json({ success: false, message: "Không tìm thấy đề thi." }, { status: 404, headers });
      }
      const nextVal = current.proctorEnabled === false ? true : false;
      await prisma.quizSet.update({
        where: { id: examId },
        data: { proctorEnabled: nextVal },
      });
      return NextResponse.json(
        {
          success: true,
          message: `Đã ${nextVal ? "BẬT" : "TẮT"} Giám thị AI cho đề thi.`,
          proctorEnabled: nextVal,
        },
        { headers }
      );
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ." }, { status: 400, headers });
  } catch (error: any) {
    console.error("Failed in admin mock exams POST:", error);
    return NextResponse.json({ success: false, message: error.message || "Lỗi máy chủ" }, { status: 500, headers });
  }
}
