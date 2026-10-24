import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

function formatQuestionForClient(q: any) {
  let parsedOptions: any = [];
  try {
    parsedOptions = typeof q.options === "string" ? JSON.parse(q.options) : q.options || [];
  } catch {
    parsedOptions = [];
  }

  return {
    id: q.id,
    source: "MINE" as const,
    sourceId: q.teacherId || "custom",
    sourceLesson: q.tags || "Ngân hàng cá nhân",
    subtitle:
      q.type === "multiple_choice"
        ? "Chọn 1 đáp án đúng"
        : q.type === "true_false"
        ? "Phán đoán Đúng / Sai"
        : q.type === "fill_blank"
        ? "Điền từ vào chỗ trống"
        : q.type === "sentence_ordering"
        ? "Sắp xếp từ thành câu"
        : "Luyện tập HSK",
    status: (q.tags?.includes("draft") ? "DRAFT" : "READY") as "DRAFT" | "READY",
    type: q.type || "multiple_choice",
    title: (q.content || "Câu hỏi").slice(0, 45),
    content: q.content,
    pinyinPrompt: q.pinyinPrompt,
    pinyin: q.pinyinPrompt || "",
    points: 5,
    difficulty: (q.difficulty || "MEDIUM") as "EASY" | "MEDIUM" | "HARD",
    hskLevel: q.level || 1,
    level: q.level || 1,
    curriculum: "HSK 3.0",
    skill: q.skill || "VOCABULARY",
    options: parsedOptions,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || "",
    createdAt: q.createdAt ? new Date(q.createdAt).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN"),
    usedInExamCount: q.quizSetQuestions?.length || 0,
    usedInExams: [],
  };
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");
    const filterTeacherId = searchParams.get("teacherId") || (authUser?.role === "TEACHER" ? authUser.id : null);

    const where: any = {};
    if (skill && skill !== "ALL") {
      where.skill = skill;
    }
    if (filterTeacherId) {
      where.OR = [
        { teacherId: filterTeacherId },
        { teacherId: null },
      ];
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        quizSetQuestions: {
          select: { quizSetId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const items = questions.map(formatQuestionForClient);

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("GET /api/v1/questions error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi tải ngân hàng câu hỏi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const body = await request.json();
    const teacherId = authUser?.id || body.teacherId || null;

    // Hỗ trợ BATCH IMPORT (nhiều câu hỏi cùng lúc từ CSV hoặc AI generator)
    if (Array.isArray(body.items) && body.items.length > 0) {
      const itemsToCreate = body.items.map((item: any) => {
        let opts = item.options;
        if (opts && typeof opts !== "string") {
          opts = JSON.stringify(opts);
        }
        let correctAns = item.correctAnswer;
        if (correctAns && typeof correctAns !== "string") {
          correctAns = JSON.stringify(correctAns);
        }

        return {
          content: (item.content || item.title || "Câu hỏi").trim(),
          pinyinPrompt: (item.pinyinPrompt || item.pinyin || "").trim() || null,
          type: item.type || "multiple_choice",
          skill: item.skill || "VOCABULARY",
          difficulty: item.difficulty || "MEDIUM",
          level: Number(item.level || item.hskLevel) || 1,
          options: opts || null,
          correctAnswer: correctAns || "A",
          explanation: (item.explanation || "").trim() || null,
          tags: item.tags || (item.status === "DRAFT" ? "draft" : "csv_import"),
          teacherId,
        };
      });

      const createdQuestions = await prisma.$transaction(
        itemsToCreate.map((data: any) => prisma.question.create({ data }))
      );

      return NextResponse.json(
        {
          success: true,
          message: `Đã lưu thành công ${createdQuestions.length} câu hỏi vào cơ sở dữ liệu!`,
          items: createdQuestions.map(formatQuestionForClient),
        },
        { status: 201 }
      );
    }

    // Đơn lẻ 1 câu hỏi
    const {
      content,
      pinyinPrompt,
      type = "multiple_choice",
      skill = "VOCABULARY",
      difficulty = "MEDIUM",
      level = 1,
      options,
      correctAnswer = "A",
      explanation,
      tags = "teacher_custom",
    } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, message: "Nội dung câu hỏi không được để trống" },
        { status: 400 }
      );
    }

    const newQuestion = await prisma.question.create({
      data: {
        content: content.trim(),
        pinyinPrompt: pinyinPrompt ? pinyinPrompt.trim() : null,
        type,
        skill,
        difficulty,
        level: Number(level) || 1,
        options: options ? (typeof options === "string" ? options : JSON.stringify(options)) : null,
        correctAnswer: typeof correctAnswer === "string" ? correctAnswer : JSON.stringify(correctAnswer),
        explanation: explanation ? explanation.trim() : null,
        tags,
        teacherId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Đã lưu câu hỏi vào kho cá nhân thành công!",
        item: formatQuestionForClient(newQuestion),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /questions error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi lưu câu hỏi vào cơ sở dữ liệu" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const isAll = searchParams.get("all") === "true";

    let bodyIds: string[] = [];
    try {
      const body = await request.json();
      if (Array.isArray(body?.ids)) bodyIds = body.ids;
    } catch {}

    const targetIds = id ? [id] : bodyIds;

    if (isAll) {
      // Xóa tất cả câu hỏi của giáo viên này (hoặc tất cả nếu không có teacherId)
      const where: any = {};
      if (authUser?.role === "TEACHER") {
        where.teacherId = authUser.id;
      }
      const deleted = await prisma.question.deleteMany({ where });
      return NextResponse.json({
        success: true,
        message: `Đã xóa toàn bộ ${deleted.count} câu hỏi thành công!`,
      });
    }

    if (targetIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Vui lòng cung cấp ID câu hỏi cần xóa." },
        { status: 400 }
      );
    }

    await prisma.question.deleteMany({
      where: { id: { in: targetIds } },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa ${targetIds.length} câu hỏi thành công!`,
    });
  } catch (error) {
    console.error("DELETE /questions error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi xóa câu hỏi khỏi cơ sở dữ liệu" },
      { status: 500 }
    );
  }
}
