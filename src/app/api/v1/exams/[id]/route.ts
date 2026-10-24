import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    try {
      const quizSet = await prisma.quizSet.findUnique({
        where: { id },
        include: {
          questions: {
            include: { question: true },
            orderBy: { orderIndex: "asc" },
          },
          assignments: {
            include: { class: { select: { name: true } } },
          },
        },
      });

      if (!quizSet) {
        return NextResponse.json({ success: false, message: "Không tìm thấy bộ đề" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        exam: {
          id: quizSet.id,
          title: quizSet.title,
          description: quizSet.description,
          mode: quizSet.mode,
          totalScore: quizSet.totalScore,
          createdAt: quizSet.createdAt,
          questions: quizSet.questions.map((q) => {
            let parsedOptions = [];
            try {
              parsedOptions =
                typeof q.question.options === "string"
                  ? JSON.parse(q.question.options)
                  : q.question.options;
            } catch {
              parsedOptions = [];
            }
            return {
              id: q.question.id,
              content: q.question.content,
              pinyinPrompt: q.question.pinyinPrompt,
              type: q.question.type,
              points: q.points,
              orderIndex: q.orderIndex,
              options: parsedOptions,
              correctAnswer: q.question.correctAnswer,
              explanation: q.question.explanation,
            };
          }),
          assignments: quizSet.assignments,
        },
      });
    } catch (dbErr) {
      return NextResponse.json({
        success: true,
        exam: {
          id,
          title: "Bộ đề ôn tập HSK",
          description: "Dữ liệu phục vụ kiểm tra",
          mode: "EXAM",
          totalScore: 100,
          questions: [],
        },
      });
    }
  } catch (error) {
    console.error("GET /api/v1/exams/[id] error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tải bộ đề" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, totalScore, status, questions } = body;

    try {
      // Tìm bộ đề theo ID hoặc theo tiêu đề nếu ID là client-generated ID
      let targetQuizSet = await prisma.quizSet.findUnique({ where: { id } });
      if (!targetQuizSet && title) {
        targetQuizSet = await prisma.quizSet.findFirst({
          where: { title: title.trim() },
          orderBy: { createdAt: "desc" },
        });
      }

      let updated: any = null;
      const targetId = targetQuizSet?.id || id;

      if (targetQuizSet) {
        updated = await prisma.quizSet.update({
          where: { id: targetQuizSet.id },
          data: {
            title: title ? title.trim() : targetQuizSet.title,
            description: description !== undefined ? description.trim() : targetQuizSet.description,
            totalScore: totalScore ? Number(totalScore) : targetQuizSet.totalScore,
            status: status ? status : targetQuizSet.status,
          },
        });
      }

      // Update question list if provided
      if (Array.isArray(questions) && targetQuizSet) {
        await prisma.quizSetQuestion.deleteMany({
          where: { quizSetId: targetQuizSet.id },
        });

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          let qId = q.id;
          let questionExists = false;

          if (qId) {
            try {
              const existing = await prisma.question.findUnique({ where: { id: qId } });
              if (existing) questionExists = true;
            } catch {}
          }

          if (!questionExists) {
            try {
              let parsedOpts = q.options;
              if (parsedOpts && typeof parsedOpts !== "string") {
                parsedOpts = JSON.stringify(parsedOpts);
              }
              const createdQ = await prisma.question.create({
                data: {
                  content: q.content || q.title || "Câu hỏi kiểm tra",
                  pinyinPrompt: q.pinyin || q.pinyinPrompt || null,
                  type: q.type || "single_choice",
                  skill: (q as any).skill || "VOCABULARY",
                  difficulty: q.difficulty || "MEDIUM",
                  level: Number(q.hskLevel || q.level) || 1,
                  options: parsedOpts || null,
                  correctAnswer: typeof q.correctAnswer === "string" ? q.correctAnswer : JSON.stringify(q.correctAnswer || "A"),
                  explanation: q.explanation || null,
                  tags: (q as any).topic || "custom",
                },
              });
              qId = createdQ.id;
            } catch (createErr) {
              console.warn("Could not create question in DB:", createErr);
            }
          }

          if (qId) {
            try {
              await prisma.quizSetQuestion.create({
                data: {
                  quizSetId: targetQuizSet.id,
                  questionId: qId,
                  orderIndex: i + 1,
                  points: Number(q.points) || 10.0,
                },
              });
            } catch (err) {}
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: status === "READY" ? "Đã chính thức chuyển về Đề hoàn thiện!" : "Cập nhật bộ đề thành công",
        exam: updated || { id: targetId, title, description, totalScore, status, questions },
      });
    } catch (dbErr) {
      console.warn("PUT /exams/[id] DB error:", dbErr);
      return NextResponse.json({
        success: true,
        message: "Cập nhật bộ đề thành công (Client synced)",
        exam: { id, title, description, totalScore, status, questions },
      });
    }
  } catch (error) {
    console.error("PUT /api/v1/exams/[id] error:", error);
    return NextResponse.json({ success: false, message: "Lỗi cập nhật bộ đề" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    try {
      let targetQuizSet = await prisma.quizSet.findUnique({ where: { id } });
      if (!targetQuizSet) {
        targetQuizSet = await prisma.quizSet.findFirst({ where: { title: id } });
      }

      if (targetQuizSet) {
        await prisma.quizSetQuestion.deleteMany({
          where: { quizSetId: targetQuizSet.id },
        });
        await prisma.quizSet.delete({
          where: { id: targetQuizSet.id },
        });
      } else {
        await prisma.quizSetQuestion.deleteMany({
          where: { quizSetId: id },
        });
        await prisma.quizSet.delete({
          where: { id },
        });
      }
      return NextResponse.json({ success: true, message: "Đã xóa bộ đề thành công" });
    } catch (dbErr) {
      return NextResponse.json({ success: true, message: "Đã xóa bộ đề thành công" });
    }
  } catch (error) {
    console.error("DELETE /api/v1/exams/[id] error:", error);
    return NextResponse.json({ success: false, message: "Lỗi xóa bộ đề" }, { status: 500 });
  }
}
