import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

// Fallback in-memory store for environments where Neon Postgres connection is not initialized
let inMemoryQuizSets: any[] = [];

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode"); // EXAM, PRACTICE
    const search = searchParams.get("q");
    const filterTeacherId = searchParams.get("teacherId") || (authUser?.role === "TEACHER" ? authUser.id : null);

    let items: any[] = [];

    try {
      const where: any = {};
      if (mode) where.mode = mode;
      if (search) {
        where.title = { contains: search, mode: "insensitive" };
      }
      if (filterTeacherId) {
        where.OR = [
          { teacherId: filterTeacherId },
          { teacherId: null },
        ];
      }

      const dbSets = await prisma.quizSet.findMany({
        where,
        include: {
          questions: {
            include: { question: true },
            orderBy: { orderIndex: "asc" },
          },
          assignments: {
            select: { id: true, title: true, status: true, class: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      items = dbSets.map((qs) => ({
        id: qs.id,
        title: qs.title,
        description: qs.description,
        mode: qs.mode,
        status: qs.status,
        hskLevel: qs.hskLevel,
        curriculum: qs.curriculum,
        totalScore: qs.totalScore,
        totalPoints: qs.totalScore,
        createdAt: qs.createdAt,
        teacherId: qs.teacherId,
        questionsCount: qs.questions.length,
        questionCount: qs.questions.length,
        questions: qs.questions.map((item) => ({
          id: item.question.id,
          content: item.question.content,
          type: item.question.type,
          points: item.points,
          orderIndex: item.orderIndex,
        })),
        assignmentsCount: qs.assignments.length,
      }));
    } catch (dbErr) {
      console.warn("Neon DB query fallback to in-memory/mock store:", dbErr);
      items = inMemoryQuizSets;
      if (search) {
        items = items.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));
      }
      if (filterTeacherId) {
        items = items.filter((s) => !s.teacherId || s.teacherId === filterTeacherId);
      }
    }

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("GET /api/v1/exams error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tải danh sách bộ đề" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const body = await request.json();
    const {
      id: customId,
      title,
      description = "Bộ đề thi biên soạn",
      mode = "EXAM",
      totalScore = 100,
      curriculum = "HSK 3.0",
      hskLevel = 1,
      status = "DRAFT",
      questions = [],
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Tên bộ đề không được để trống" },
        { status: 400 }
      );
    }

    let createdExam: any = null;
    const teacherId = authUser?.id || body.teacherId || null;

    try {
      let targetQuizSet: any = null;
      if (customId) {
        targetQuizSet = await prisma.quizSet.findUnique({ where: { id: customId } });
      }

      if (targetQuizSet) {
        targetQuizSet = await prisma.quizSet.update({
          where: { id: targetQuizSet.id },
          data: {
            title: title.trim(),
            description: description ? description.trim() : targetQuizSet.description,
            mode,
            status: status || targetQuizSet.status || "DRAFT",
            hskLevel: Number(hskLevel) || targetQuizSet.hskLevel,
            curriculum: curriculum || targetQuizSet.curriculum,
            totalScore: Number(totalScore) || targetQuizSet.totalScore,
          },
        });
      } else {
        targetQuizSet = await prisma.quizSet.create({
          data: {
            title: title.trim(),
            description: description ? description.trim() : null,
            mode,
            status: status || "DRAFT",
            hskLevel: Number(hskLevel) || 1,
            curriculum: curriculum || "HSK 3.0",
            totalScore: Number(totalScore) || 100,
            teacherId,
          },
        });
      }

      // Link questions if provided, ensuring every question exists in Question table
      const linkedQuestions: any[] = [];
      if (Array.isArray(questions) && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const qItem = questions[i];
          let qId = qItem.id;
          let questionExists = false;

          if (qId) {
            try {
              const existing = await prisma.question.findUnique({ where: { id: qId } });
              if (existing) questionExists = true;
            } catch {}
          }

          if (!questionExists) {
            try {
              let parsedOpts = qItem.options;
              if (parsedOpts && typeof parsedOpts !== "string") {
                parsedOpts = JSON.stringify(parsedOpts);
              }
              const createdQ = await prisma.question.create({
                data: {
                  content: qItem.content || qItem.title || "Câu hỏi kiểm tra",
                  pinyinPrompt: qItem.pinyin || qItem.pinyinPrompt || null,
                  type: qItem.type || "single_choice",
                  skill: (qItem as any).skill || "VOCABULARY",
                  difficulty: qItem.difficulty || "MEDIUM",
                  level: Number(qItem.hskLevel || qItem.level) || Number(hskLevel) || 1,
                  options: parsedOpts || null,
                  correctAnswer: typeof qItem.correctAnswer === "string" ? qItem.correctAnswer : JSON.stringify(qItem.correctAnswer || "A"),
                  explanation: qItem.explanation || null,
                  tags: (qItem as any).topic || "teacher_custom",
                  teacherId,
                },
              });
              qId = createdQ.id;
            } catch (createQErr) {
              console.warn("Could not create question in DB:", createQErr);
            }
          }

          if (qId) {
            try {
              await prisma.quizSetQuestion.upsert({
                where: {
                  quizSetId_questionId: {
                    quizSetId: targetQuizSet.id,
                    questionId: qId,
                  },
                },
                update: {
                  orderIndex: i + 1,
                  points: Number(qItem.points) || 10.0,
                },
                create: {
                  quizSetId: targetQuizSet.id,
                  questionId: qId,
                  orderIndex: i + 1,
                  points: Number(qItem.points) || 10.0,
                },
              });
              linkedQuestions.push({
                id: qId,
                content: qItem.content || qItem.title,
                points: Number(qItem.points) || 10.0,
              });
            } catch (linkErr) {
              console.warn("Could not link question id:", qId, linkErr);
            }
          }
        }
      }

      createdExam = {
        id: targetQuizSet.id,
        title: targetQuizSet.title,
        description: targetQuizSet.description,
        mode: targetQuizSet.mode,
        curriculum: targetQuizSet.curriculum,
        hskLevel: targetQuizSet.hskLevel,
        status: targetQuizSet.status,
        totalPoints: targetQuizSet.totalScore,
        questionsCount: linkedQuestions.length || questions.length,
        questions: linkedQuestions.length > 0 ? linkedQuestions : questions,
        createdAt: targetQuizSet.createdAt,
      };
    } catch (dbErr) {
      console.warn("Neon DB create fallback to in-memory store:", dbErr);
      const fallbackId = `exam-db-${Date.now()}`;
      createdExam = {
        id: fallbackId,
        title: title.trim(),
        description,
        mode,
        curriculum,
        hskLevel,
        status,
        totalPoints: totalScore,
        questionsCount: questions.length,
        questions,
        createdAt: new Date().toISOString(),
      };
      inMemoryQuizSets.unshift(createdExam);
    }

    return NextResponse.json(
      {
        success: true,
        message: status === "DRAFT" ? "Đã lưu vào Đề nháp kho thành công!" : "Đã tạo bộ đề thi hoàn thiện!",
        exam: createdExam,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/v1/exams error:", error);
    return NextResponse.json({ success: false, message: "Lỗi lưu bộ đề kiểm tra" }, { status: 500 });
  }
}
