import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";


export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const filterClassId = searchParams.get("classId");
    const filterClassIds = searchParams.get("classIds");
    const filterTeacherId = searchParams.get("teacherId");
    const filterStudentId = searchParams.get("studentId") || (authUser?.role === "STUDENT" ? authUser.id : null);

    let where: any = {};

    if (filterClassId) {
      where.classId = filterClassId;
    } else if (filterClassIds) {
      const ids = filterClassIds.split(",").map((s) => s.trim()).filter(Boolean);
      where.classId = { in: ids };
    }

    if (authUser && authUser.role === "TEACHER") {
      // Chỉ lấy bài tập thuộc các lớp của giáo viên này
      where.class = { teacherId: authUser.id };
    } else if (filterTeacherId) {
      where.class = { teacherId: filterTeacherId };
    } else if (filterStudentId) {
      // 1. Chỉ lấy bài tập của các lớp học sinh này đã tham gia trong DB
      const enrolled = await prisma.classStudent.findMany({
        where: { studentId: filterStudentId },
        select: { classId: true },
      });
      let classIds = enrolled.map((e) => e.classId);

      // 2. Bổ sung các classIds được truyền từ client (học viên vào lớp qua mã mời / profile)
      const paramClassIds = searchParams.get("classIds");
      if (paramClassIds) {
        const extra = paramClassIds.split(",").map((s) => s.trim()).filter(Boolean);
        classIds = Array.from(new Set([...classIds, ...extra]));
      }

      // Chỉ lấy bài tập của các lớp học sinh thực tế đã tham gia
      if (classIds.length > 0) {
        where.classId = { in: classIds };
      } else {
        where.classId = "__NO_ENROLLED_CLASS__";
      }
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, level: true, teacherId: true } },
        quizSet: {
          select: {
            id: true,
            totalScore: true,
            questions: { select: { id: true, points: true } },
          },
        },
        _count: { select: { attempts: true } },
        attempts: filterStudentId
          ? {
              where: { studentId: filterStudentId },
              orderBy: { startedAt: "desc" },
              take: 1,
            }
          : false,
      },
      orderBy: { dueAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      items: assignments.map((a: any) => ({
        id: a.id,
        title: a.title,
        classId: a.classId,
        className: a.class?.name || "Lớp học",
        dueAt: a.dueAt,
        status: a.status,
        durationMin: a.durationMin,
        totalQuestions: a.quizSet?.questions?.length || 0,
        totalPoints: a.quizSet?.totalScore || 100,
        submittedCount: a._count?.attempts || 0,
        hasAttempted: a.attempts && a.attempts.length > 0,
        latestScore: a.attempts?.[0]?.score ?? null,
        attemptId: a.attempts?.[0]?.id || null,
      })),
      totalCount: assignments.length,
    });
  } catch (error) {
    console.error("GET /assignments error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tải bài tập." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const body = await request.json();
    const { title, classId, classIds, quizSetId, openAt, dueAt, durationMin, mode, questions, totalPoints } = body;

    const targetClassIds: string[] =
      Array.isArray(classIds) && classIds.length > 0
        ? classIds
        : classId
        ? [classId]
        : [];

    if (!title || targetClassIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin bắt buộc hoặc chưa chọn lớp học." },
        { status: 400 }
      );
    }

    let validQuizSetId = quizSetId;

    // Nếu có truyền danh sách câu hỏi cụ thể, tạo QuizSet riêng và lưu câu hỏi vào DB
    if (Array.isArray(questions) && questions.length > 0) {
      const calcScore =
        Number(totalPoints) ||
        questions.reduce((sum: number, q: any) => sum + (Number(q.points) || 5), 0);

      const createdQuiz = await prisma.quizSet.create({
        data: {
          title: title.trim(),
          mode: mode || "EXAM",
          totalScore: calcScore,
        },
      });
      validQuizSetId = createdQuiz.id;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        let optionsJson = "[]";
        if (q.options) {
          optionsJson = typeof q.options === "string" ? q.options : JSON.stringify(q.options);
        } else if (q.matchingPairs) {
          optionsJson = JSON.stringify({ pairs: q.matchingPairs });
        } else if (q.tokens) {
          optionsJson = JSON.stringify({ tokens: q.tokens });
        }

        try {
          const createdQ = await prisma.question.create({
            data: {
              type: (q.type || "MULTIPLE_CHOICE").toUpperCase(),
              content: q.content || q.title || `Câu hỏi ${i + 1}`,
              pinyinPrompt: q.pinyin || null,
              audioUrl: q.audioUrl || null,
              options: optionsJson,
              correctAnswer:
                typeof q.correctAnswer === "object"
                  ? JSON.stringify(q.correctAnswer)
                  : String(q.correctAnswer || "A"),
              explanation: q.explanation || null,
              skill: q.skill || "VOCABULARY",
              level: q.hskLevel || 1,
            },
          });

          await prisma.quizSetQuestion.create({
            data: {
              quizSetId: createdQuiz.id,
              questionId: createdQ.id,
              orderIndex: i + 1,
              points: Number(q.points) || 5,
            },
          });
        } catch (e) {
          console.error("Error creating question in DB:", e);
        }
      }
    }

    // Fallback: nếu không có quizSetId thì tìm hoặc tạo quizSet mặc định
    if (!validQuizSetId) {
      const defaultQuizSet = await prisma.quizSet.findFirst();
      validQuizSetId = defaultQuizSet?.id;
    }

    if (!validQuizSetId) {
      const createdQuiz = await prisma.quizSet.create({
        data: {
          title: title.trim(),
          mode: mode || "EXAM",
          totalScore: 100,
        },
      });
      validQuizSetId = createdQuiz.id;
    }

    const createdAssignments = [];
    const openDate = openAt ? new Date(openAt) : new Date();
    const dueDate = dueAt ? new Date(dueAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    for (const cId of targetClassIds) {
      let targetClass = await prisma.class.findUnique({
        where: { id: cId },
      });

      if (!targetClass) {
        // Fallback: Tìm lớp theo id kết thúc, theo code hoặc theo tên
        targetClass = await prisma.class.findFirst({
          where: {
            OR: [
              { id: { endsWith: cId.toLowerCase() } },
              { id: { endsWith: cId.toUpperCase() } },
              { name: { contains: cId } },
            ],
          },
        });
      }

      if (!targetClass) continue;

      // Bảo mật: Giáo viên chỉ được tạo bài tập cho lớp của mình (trừ admin)
      if (authUser && authUser.role === "TEACHER" && targetClass.teacherId !== authUser.id) {
        continue;
      }

      const newAssignment = await prisma.assignment.create({
        data: {
          title: title.trim(),
          classId: targetClass.id,
          quizSetId: validQuizSetId,
          openAt: openDate,
          dueAt: dueDate,
          durationMin: durationMin || 45,
          mode: mode || "EXAM",
          status: openDate > new Date() ? "SCHEDULED" : "OPEN",
        },
      });
      createdAssignments.push(newAssignment);
    }

    return NextResponse.json({
      success: true,
      count: createdAssignments.length,
      item: createdAssignments[0],
      items: createdAssignments,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /assignments error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tạo bài tập mới." }, { status: 500 });
  }
}
