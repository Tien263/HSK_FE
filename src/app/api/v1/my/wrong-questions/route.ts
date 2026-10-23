import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdHeader = request.headers.get("x-user-id");
    const studentIdParam = searchParams.get("studentId");
    const username = searchParams.get("username");

    let student = null;
    if (studentIdParam || userIdHeader) {
      student = await prisma.user.findUnique({
        where: { id: studentIdParam || userIdHeader || "" },
      });
    }

    if (!student && username) {
      student = await prisma.user.findFirst({ where: { username } });
    }

    if (!student) {
      return NextResponse.json({ success: true, items: [] });
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wrongQuestionId, isCorrect, username } = body;

    const student = await prisma.user.findFirst({
      where: { username: username || "student" },
    });
    if (!student) {
      return NextResponse.json({ success: false, message: "Không tìm thấy học sinh" }, { status: 404 });
    }

    const wrongItem = await prisma.wrongQuestion.findUnique({
      where: { id: wrongQuestionId },
    });
    if (!wrongItem) {
      return NextResponse.json({ success: false, message: "Không tìm thấy bản ghi câu sai" }, { status: 404 });
    }

    let updatedConsecutive = isCorrect ? wrongItem.consecutiveRight + 1 : 0;
    let updatedWrongCount = isCorrect ? wrongItem.wrongCount : wrongItem.wrongCount + 1;
    let earnedXp = 0;

    if (isCorrect) {
      earnedXp = 5;
      if (updatedConsecutive >= 3) {
        earnedXp += 15; // Thưởng đặc biệt khi khắc phục xong câu sai
      }

      await prisma.user.update({
        where: { id: student.id },
        data: { totalXp: { increment: earnedXp } },
      });

      await prisma.xpLog.create({
        data: {
          studentId: student.id,
          amount: earnedXp,
          source: "PRACTICE",
          reason: `Ôn lại câu sai: đúng liên tiếp ${updatedConsecutive}/3 lần (+${earnedXp} XP)`,
        },
      });
    }

    const updated = await prisma.wrongQuestion.update({
      where: { id: wrongQuestionId },
      data: {
        consecutiveRight: updatedConsecutive,
        wrongCount: updatedWrongCount,
        lastWrongAt: isCorrect ? wrongItem.lastWrongAt : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      item: updated,
      earnedXp,
      isMastered: updatedConsecutive >= 3,
    });
  } catch (error) {
    console.error("POST /my/wrong-questions error:", error);
    return NextResponse.json({ success: false, message: "Lỗi cập nhật câu sai" }, { status: 500 });
  }
}
