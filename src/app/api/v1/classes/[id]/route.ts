import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: { select: { id: true, name: true, username: true } },
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                totalXp: true,
                streakDays: true,
                status: true,
                _count: {
                  select: { attempts: true, wrongQuestions: true },
                },
              },
            },
          },
        },
        assignments: {
          include: {
            quizSet: { select: { id: true, title: true } },
            _count: { select: { attempts: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học" }, { status: 404 });
    }

    // Lấy bài học tương ứng với cấp độ HSK của lớp để hiển thị kho tài liệu
    const lessons = await prisma.lesson.findMany({
      where: { level: { hskLevel: classData.level } },
      include: {
        _count: { select: { vocabularies: true, grammarPoints: true } },
      },
      orderBy: { lessonNumber: "asc" },
    });

    return NextResponse.json({
      success: true,
      class: {
        id: classData.id,
        name: classData.name,
        level: classData.level,
        description: classData.description,
        teacher: classData.teacher,
        students: classData.students.map((cs) => ({
          id: cs.student.id,
          name: cs.student.name,
          username: cs.student.username,
          totalXp: cs.student.totalXp,
          streakDays: cs.student.streakDays,
          status: cs.student.status,
          attemptsCount: cs.student._count.attempts,
          wrongCount: cs.student._count.wrongQuestions,
          joinedAt: cs.joinedAt,
        })),
        assignments: classData.assignments.map((a) => ({
          id: a.id,
          title: a.title,
          quizSetTitle: a.quizSet?.title || "Bộ câu hỏi trắc nghiệm",
          dueAt: a.dueAt,
          durationMin: a.durationMin,
          status: a.status,
          submittedCount: a._count.attempts,
        })),
        lessons: lessons.map((l) => ({
          id: l.id,
          lessonNumber: l.lessonNumber,
          title: l.title,
          vocabCount: l._count.vocabularies,
          grammarCount: l._count.grammarPoints,
          status: l.status,
        })),
      },
    });
  } catch (error) {
    console.error("GET /classes/[id] error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tải thông tin lớp" }, { status: 500 });
  }
}
