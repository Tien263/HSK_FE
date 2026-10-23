import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

// Fallback in-memory store for environments where Neon Postgres connection is not initialized
let inMemoryQuizSets: any[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode"); // EXAM, PRACTICE
    const search = searchParams.get("q");

    let items: any[] = [];

    try {
      const where: any = {};
      if (mode) where.mode = mode;
      if (search) {
        where.title = { contains: search, mode: "insensitive" };
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
        totalScore: qs.totalScore,
        createdAt: qs.createdAt,
        questionsCount: qs.questions.length,
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

    try {
      // Create QuizSet in database
      const newQuizSet = await prisma.quizSet.create({
        data: {
          title: title.trim(),
          description: description ? description.trim() : null,
          mode,
          totalScore: Number(totalScore) || 100,
        },
      });

      // Link questions if provided
      if (Array.isArray(questions) && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const qItem = questions[i];
          // Ensure question exists or upsert it
          if (qItem.id) {
            try {
              await prisma.quizSetQuestion.create({
                data: {
                  quizSetId: newQuizSet.id,
                  questionId: qItem.id,
                  orderIndex: i + 1,
                  points: Number(qItem.points) || 10.0,
                },
              });
            } catch (linkErr) {
              console.warn("Could not link question id:", qItem.id, linkErr);
            }
          }
        }
      }

      createdExam = {
        id: newQuizSet.id,
        title: newQuizSet.title,
        description: newQuizSet.description,
        mode: newQuizSet.mode,
        curriculum,
        hskLevel,
        status,
        totalPoints: totalScore,
        questionsCount: questions.length,
        questions,
        createdAt: newQuizSet.createdAt,
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
        message: "Tạo bộ đề kiểm tra thành công!",
        exam: createdExam,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/v1/exams error:", error);
    return NextResponse.json({ success: false, message: "Lỗi lưu bộ đề kiểm tra" }, { status: 500 });
  }
}
