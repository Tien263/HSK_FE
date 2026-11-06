import { getAuthUser } from "@/lib/auth-server";
import { examWriteOrigin } from "@/lib/exam-center-service";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerLessonsByHskLevel } from "@/lib/curriculum-server";

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || auth.status !== "ACTIVE") return NextResponse.json({ success: false, message: "Vui lòng đăng nhập." }, { status: 401 });
    if (!["ADMIN", "TEACHER"].includes(auth.role)) return NextResponse.json({ success: false, message: "Dùng phòng thi được bảo vệ tại /s/mock-exam." }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const levelStr = searchParams.get("level") || "1";
    const level = parseInt(levelStr, 10) || 1;
    const studentId = auth.id;

    // HSK 7, 8, 9 gộp chung thành HSK 7–9 (level >= 7)
    const levelCondition = level >= 7 ? { in: [7, 8, 9] } : level;

    // 1. Lấy danh sách các đề thi thử do Giáo viên hoặc Admin biên soạn từ CSDL (mode: MOCK_EXAM hoặc EXAM với status READY)
    const officialSets = await prisma.quizSet.findMany({
      where: {
        ...(auth.role === "TEACHER" ? { OR: [{ teacherId: auth.id }, { teacher: { role: "ADMIN" } }] } : {}),
        hskLevel: levelCondition,
        mode: { in: ["MOCK_EXAM", "EXAM"] },
        status: "READY",
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
        questions: {
          include: {
            question: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        assignments: {
          include: {
            attempts: {
              where: studentId ? { studentId } : undefined,
              orderBy: { score: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const officialMockExams = officialSets.map((quiz) => {
      let listeningCount = 0;
      let readingCount = 0;
      let writingCount = 0;

      const formattedQuestions = quiz.questions.map((qRow, idx) => {
        const q = qRow.question;
        const skill = (q.skill || "READING").toUpperCase();
        if (skill.includes("LISTEN")) listeningCount++;
        else if (skill.includes("WRITE") || skill.includes("GRAMMAR")) writingCount++;
        else readingCount++;

        let options: string[] = [];
        try {
          if (q.options) {
            const parsed = JSON.parse(q.options);
            options = Array.isArray(parsed)
              ? parsed.map((item: any) => (typeof item === "string" ? item : item.text || item.content || ""))
              : [];
          }
        } catch {}

        return {
          id: q.id || `Q_${idx + 1}`,
          section: (skill.includes("LISTEN")
            ? "LISTENING"
            : skill.includes("WRITE") || skill.includes("GRAMMAR")
            ? "WRITING"
            : "READING") as "LISTENING" | "READING" | "WRITING",
          prompt: q.content,
          subPrompt: q.pinyinPrompt || undefined,
          hanziToSpeak: q.audioUrl || q.content,
          options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || `Đáp án chính xác là: ${q.correctAnswer}`,
          points: qRow.points || 10,
        };
      });

      // Lịch sử thi của học sinh trên đề này (nếu có)
      const attempts = quiz.assignments.flatMap((a) => a.attempts);
      const bestAttempt = attempts[0];

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description || `Đề thi thử HSK cấp ${level} chuẩn hóa quốc tế`,
        hskLevel: quiz.hskLevel,
        teacherName: quiz.teacher?.name || "Tổ Khảo thí HSK",
        teacherRole: quiz.teacher?.role || "TEACHER",
        totalScore: quiz.totalScore || (level <= 2 ? 200 : 300),
        durationMin: level === 1 ? 35 : level === 2 ? 50 : level === 3 ? 85 : level === 4 ? 100 : 120,
        questionsCount: formattedQuestions.length,
        skillsCount: {
          listening: listeningCount,
          reading: readingCount,
          writing: writingCount,
        },
        questions: formattedQuestions,
        studentBestScore: bestAttempt ? bestAttempt.score : null,
        isPassed: bestAttempt ? (bestAttempt.score ?? 0) >= (level <= 2 ? 120 : 180) : null,
      };
    });

    return NextResponse.json({
      success: true,
      level,
      officialMockExams,
    });
  } catch (error: any) {
    console.error("GET /api/v1/mock-exams error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi tải danh sách đề thi thử" },
      { status: 500 }
    );
  }
}

// POST: Giáo viên hoặc Admin biên soạn hoặc tự động xuất bản đề thi thử HSK vào phòng thi
export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || auth.status !== "ACTIVE") return NextResponse.json({ success: false, message: "Vui lòng đăng nhập." }, { status: 401 });
    if (!["TEACHER", "ADMIN"].includes(auth.role) || !examWriteOrigin(request)) return NextResponse.json({ success: false, message: "Không có quyền xuất bản đề." }, { status: 403 });
    const body = await request.json();
    const {
      title,
      description,
      hskLevel = 1,
      totalScore = 200,
      autoGenerate = false,
      questions: customQuestions = [],
    } = body;

    const level = parseInt(hskLevel, 10) || 1;

    // Người xuất bản lấy từ phiên đăng nhập đã xác thực
    const authorId = auth.id;

    const examTitle = title || `Đề thi thử HSK ${level} Chuẩn CTI - Kỳ thi Mô phỏng Quốc tế`;
    const examDesc = description || `Đề thi thử chuẩn cấu trúc HSK 3.0 do Thầy Cô biên soạn gồm 3 phần: Nghe hiểu, Đọc hiểu và Viết.`;

    // Nếu tự động sinh câu hỏi từ giáo trình cho Giáo viên
    let questionsToInsert: Array<{
      content: string;
      pinyinPrompt?: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      skill: string;
      level: number;
    }> = [];

    if (autoGenerate || customQuestions.length === 0) {
      const lessons = await getServerLessonsByHskLevel(level);
      const shuffledVocabs = lessons.flatMap(lesson => lesson.vocabList ?? []).sort(() => Math.random() - 0.5);
      const meanings = shuffledVocabs.map(item => item.meaningVi || item.meaning || "");
      const readings = shuffledVocabs.map(item => item.pinyin);
      const choicesFor = (answer: string, pool: string[]) => {
        const others = [...new Set(pool.filter(item => item && item !== answer))];
        return [answer, ...others.slice(0, 3)].sort(() => Math.random() - 0.5);
      };

      // 1. Phần Nghe (10 câu)
      shuffledVocabs.slice(0, 10).forEach((v) => {
        const meaning = v.meaningVi || v.meaning || "";
        const opts = choicesFor(meaning, meanings);
        if (!meaning || !v.hanzi || opts.length < 2) return;

        questionsToInsert.push({
          content: `Nghe phát âm chữ Hán và chọn nghĩa tiếng Việt chính xác nhất:`,
          pinyinPrompt: v.hanzi,
          options: opts,
          correctAnswer: meaning,
          explanation: `Phát âm "${v.hanzi}" (${v.pinyin}) có nghĩa tiếng Việt là: "${meaning}".`,
          skill: "LISTENING",
          level,
        });
      });

      // 2. Phần Đọc (10 câu)
      shuffledVocabs.slice(10, 20).forEach((v) => {
        const correctPinyin = v.pinyin || "";
        const opts = choicesFor(correctPinyin, readings);
        if (!correctPinyin || !v.hanzi || opts.length < 2) return;

        questionsToInsert.push({
          content: `Chọn phiên âm Pinyin đúng cho chữ Hán sau:`,
          pinyinPrompt: v.hanzi,
          options: opts,
          correctAnswer: correctPinyin,
          explanation: `Chữ Hán "${v.hanzi}" đọc chuẩn là "${correctPinyin}", nghĩa là "${v.meaningVi || v.meaning}".`,
          skill: "READING",
          level,
        });
      });

      // 3. Phần Viết / Ngữ pháp (5 câu)
      const grammars = lessons.flatMap(lesson => lesson.grammarList ?? []);
      const examples = grammars.flatMap(grammar => {
        const example = grammar.examples?.find(item => item.zh)?.zh ||
          (grammar.example !== grammar.title ? grammar.example : "");
        return example ? [{ grammar, example }] : [];
      });
      examples.slice(0, 5).forEach(({ grammar: g, example: correctEx }) => {
        const opts = [
          correctEx,
          `不${correctEx}`,
          `${correctEx}吗不是`,
          `吗${correctEx}`,
        ].sort(() => 0.5 - Math.random());

        questionsToInsert.push({
          content: `Cấu trúc ngữ pháp '${g.title}' (${g.structure}) được dùng đúng trong câu nào?`,
          pinyinPrompt: g.structure,
          options: opts,
          correctAnswer: correctEx,
          explanation: `Cấu trúc: ${g.structure}. Ý nghĩa: ${g.explanation || g.usageExplanation || ""}.`,
          skill: "WRITING",
          level,
        });
      });
    } else {
      questionsToInsert = customQuestions;
    }

    if (questionsToInsert.length === 0) {
      return NextResponse.json({
        success: false,
        message: `HSK ${level} chưa có học liệu để tạo câu hỏi. Hãy thêm câu hỏi trước khi xuất bản.`,
      }, { status: 422 });
    }

    const score = totalScore || (level <= 2 ? 200 : 300);
    const createdQuizSet = await prisma.quizSet.create({
      data: {
        title: examTitle,
        description: examDesc,
        mode: "MOCK_EXAM",
        status: "READY",
        hskLevel: level,
        curriculum: "HSK 3.0",
        totalScore: score,
        teacherId: authorId,
        questions: {
          create: questionsToInsert.map((question, index) => ({
            orderIndex: index + 1,
            points: score / questionsToInsert.length,
            question: {
              create: {
                teacherId: authorId,
                content: question.content,
                pinyinPrompt: question.pinyinPrompt,
                type: "single_choice",
                skill: question.skill || "READING",
                level,
                options: JSON.stringify(question.options || []),
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
              },
            },
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xuất bản thành công đề thi thử '${examTitle}' vào Phòng thi thử HSK!`,
      examId: createdQuizSet.id,
    });
  } catch (error: any) {
    console.error("POST /api/v1/mock-exams error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi tạo đề thi thử" },
      { status: 500 }
    );
  }
}
