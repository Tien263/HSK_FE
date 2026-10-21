import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const authUser = await getAuthUser(request);

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: { select: { id: true, name: true, username: true, email: true, avatar: true } },
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
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học." }, { status: 404 });
    }

    // Kiểm tra quyền truy cập: Giáo viên chỉ được xem lớp của chính mình
    if (authUser) {
      if (authUser.role === "TEACHER" && classData.teacherId !== authUser.id) {
        return NextResponse.json(
          {
            success: false,
            message: "Bạn không có quyền truy cập dữ liệu của lớp học này (lớp thuộc giáo viên khác).",
          },
          { status: 403 }
        );
      }
      if (authUser.role === "STUDENT") {
        const isEnrolled = classData.students.some((cs) => cs.student.id === authUser.id);
        if (!isEnrolled) {
          return NextResponse.json(
            { success: false, message: "Bạn chưa tham gia lớp học này." },
            { status: 403 }
          );
        }
      }
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
        code: classData.id.slice(-6).toUpperCase(),
        teacherId: classData.teacherId,
        teacher: classData.teacher,
        students: classData.students.map((cs) => ({
          id: cs.student.id,
          name: cs.student.name,
          username: cs.student.username,
          email: cs.student.email,
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
    return NextResponse.json({ success: false, message: "Lỗi tải thông tin lớp." }, { status: 500 });
  }
}

// PATCH /api/v1/classes/[id] - Cập nhật thông tin hoặc trạng thái lớp
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const authUser = await getAuthUser(request);
    const body = await request.json();

    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!targetClass) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học." }, { status: 404 });
    }

    // Chỉ giáo viên phụ trách hoặc Admin mới được sửa
    if (authUser && authUser.role === "TEACHER" && targetClass.teacherId !== authUser.id) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền chỉnh sửa lớp học của giáo viên khác." },
        { status: 403 }
      );
    }

    const updated = await prisma.class.update({
      where: { id: classId },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description.trim() } : {}),
        ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật lớp thành công!",
      item: updated,
    });
  } catch (error) {
    console.error("PATCH /classes/[id] error:", error);
    return NextResponse.json({ success: false, message: "Lỗi cập nhật lớp học." }, { status: 500 });
  }
}
