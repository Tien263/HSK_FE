import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");

    const where: any = {};
    if (skill && skill !== "ALL") {
      where.skill = skill;
    }

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const items = questions.map((q) => {
      let parsedOptions = [];
      try {
        parsedOptions = typeof q.options === "string" ? JSON.parse(q.options) : q.options;
      } catch {
        parsedOptions = [];
      }

      return {
        id: q.id,
        type: q.type,
        content: q.content,
        pinyinPrompt: q.pinyinPrompt,
        skill: q.skill,
        difficulty: q.difficulty,
        level: q.level,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: parsedOptions,
      };
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi tải ngân hàng câu hỏi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      content,
      pinyinPrompt,
      type = "single_choice",
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
        options: options ? JSON.stringify(options) : null,
        correctAnswer: typeof correctAnswer === "string" ? correctAnswer : JSON.stringify(correctAnswer),
        explanation: explanation ? explanation.trim() : null,
        tags,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Đã lưu câu hỏi vào kho cá nhân thành công!",
        item: newQuestion,
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
