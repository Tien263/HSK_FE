import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username") || "student";

    const student = await prisma.user.findFirst({ where: { username } });
    if (!student) {
      return NextResponse.json({ success: false, message: "Không tìm thấy học sinh" }, { status: 404 });
    }

    const wrongList = await prisma.wrongQuestion.findMany({
      where: {
        studentId: student.id,
        consecutiveRight: { lt: 3 },
      },
      include: {
        question: true,
      },
      orderBy: { wrongCount: "desc" },
    });

    const items = wrongList.map((w) => {
      let parsedOptions = [];
      try {
        parsedOptions = typeof w.question.options === "string" ? JSON.parse(w.question.options) : w.question.options;
      } catch {
        parsedOptions = [];
      }

      return {
        id: w.id,
        questionId: w.question.id,
        content: w.question.content,
        pinyinPrompt: w.question.pinyinPrompt,
        options: parsedOptions,
        correctAnswer: w.question.correctAnswer,
        explanation: w.question.explanation,
        wrongCount: w.wrongCount,
        consecutiveRight: w.consecutiveRight,
      };
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi tải câu sai" }, { status: 500 });
  }
}
