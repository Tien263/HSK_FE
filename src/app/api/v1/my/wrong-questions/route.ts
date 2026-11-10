import { getAuthUser } from "@/lib/auth-server";
import { examWriteOrigin } from "@/lib/exam-center-service";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const auth = await getAuthUser(request);
    const studentIdParam = searchParams.get("studentId");
    const usernameParam = searchParams.get("username");

    const targetUserId = auth?.id || studentIdParam;

    let student = null;
    if (targetUserId) {
      student = await prisma.user.findUnique({
        where: { id: targetUserId },
      });
    }

    if (!student && (usernameParam || auth?.username)) {
      student = await prisma.user.findFirst({
        where: { username: usernameParam || auth?.username || "" },
      });
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
      let rawOptions: any = [];
      try {
        rawOptions = typeof w.question.options === "string" ? JSON.parse(w.question.options) : w.question.options;
      } catch {
        rawOptions = [];
      }

      let parsedOptions: Array<{ id: string; text: string }> = [];
      if (Array.isArray(rawOptions)) {
        parsedOptions = rawOptions.map((item: any, idx: number) => {
          if (typeof item === "string") {
            return {
              id: String.fromCharCode(65 + idx),
              text: item,
            };
          }
          return {
            id: String(item?.id || item?.label || String.fromCharCode(65 + idx)),
            text: String(item?.text ?? item?.content ?? item?.value ?? ""),
          };
        });
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
    console.error("GET /my/wrong-questions error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tải câu sai" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request);
    const body = await request.json();
    const { action, wrongQuestionId, isCorrect, studentId, question } = body;

    const targetUserId = auth?.id || studentId;
    let student = null;
    if (targetUserId) {
      student = await prisma.user.findUnique({
        where: { id: targetUserId },
      });
    }

    if (!student) {
      return NextResponse.json({ success: false, message: "Không tìm thấy học sinh" }, { status: 404 });
    }

    // 1. TRƯỜNG HỢP GHI NHẬN CÂU SAI MỚI KHI LUYỆN TẬP
    if (action === "record_wrong" && question) {
      const {
        content,
        pinyinPrompt,
        options,
        correctAnswer,
        explanation,
        skill = "GRAMMAR",
        level = 1,
      } = question;

      if (!content || !correctAnswer) {
        return NextResponse.json({ success: false, message: "Thiếu dữ liệu câu hỏi" }, { status: 400 });
      }

      // Tìm câu hỏi trong cơ sở dữ liệu hoặc tạo mới
      const cleanContent = String(content).trim();
      let dbQuestion = await prisma.question.findFirst({
        where: { content: cleanContent },
      });

      const optionsJson = typeof options === "string" ? options : JSON.stringify(options || []);

      if (!dbQuestion) {
        dbQuestion = await prisma.question.create({
          data: {
            content: cleanContent,
            pinyinPrompt: pinyinPrompt ? String(pinyinPrompt).trim() : null,
            options: optionsJson,
            correctAnswer: String(correctAnswer).trim(),
            explanation: explanation ? String(explanation).trim() : null,
            skill: String(skill).toUpperCase(),
            level: Number(level) || 1,
            type: "single_choice",
          },
        });
      }

      // Ghi nhận vào WrongQuestion
      const existingWrong = await prisma.wrongQuestion.findUnique({
        where: {
          studentId_questionId: {
            studentId: student.id,
            questionId: dbQuestion.id,
          },
        },
      });

      let savedWrong;
      if (existingWrong) {
        savedWrong = await prisma.wrongQuestion.update({
          where: { id: existingWrong.id },
          data: {
            wrongCount: { increment: 1 },
            consecutiveRight: 0,
            lastWrongAt: new Date(),
          },
        });
      } else {
        savedWrong = await prisma.wrongQuestion.create({
          data: {
            studentId: student.id,
            questionId: dbQuestion.id,
            wrongCount: 1,
            consecutiveRight: 0,
            lastWrongAt: new Date(),
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Đã lưu câu sai vào Sổ câu sai & Bộ đề giải độc!",
        wrongQuestionId: savedWrong.id,
      });
    }

    // 2. TRƯỜNG HỢP ÔN LẠI CÂU SAI TRONG SỔ CÂU SAI (ĐÁNH GIÁ ĐÚNG/SAI)
    if (!wrongQuestionId) {
      return NextResponse.json({ success: false, message: "Thiếu wrongQuestionId" }, { status: 400 });
    }

    const wrongItem = await prisma.wrongQuestion.findFirst({
      where: { id: wrongQuestionId, studentId: student.id },
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
        earnedXp += 15; // Thưởng đặc biệt khi giải độc thành công câu sai
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
