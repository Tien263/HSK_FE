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
    return NextResponse.json({ success: false, message: "Lỗi tải ngân hàng câu hỏi" }, { status: 500 });
  }
}
