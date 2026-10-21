import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";
import { decodeClassDescription, encodeClassDescription, normalizeDMY } from "@/lib/class-helper";


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
        teacher: {
          select: { id: true, name: true, username: true, email: true, avatar: true },
        },
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                avatar: true,
                totalXp: true,
                streakDays: true,
                status: true,
                _count: {
                  select: { attempts: true, wrongQuestions: true },
                },
              },
            },
          },
          orderBy: { joinedAt: "desc" },
        },
        assignments: {
          include: {
            quizSet: true,
            _count: {
              select: { attempts: true },
            },
          },
          orderBy: { dueAt: "desc" },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học." }, { status: 404 });
    }

    // Bảo mật: Nếu là giáo viên, chỉ được xem lớp của chính mình
    if (authUser && authUser.role === "TEACHER" && classData.teacherId !== authUser.id) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền quản lý lớp học này." },
        { status: 403 }
      );
    }

    // Lấy danh sách bài học thuộc level của lớp này
    const lessons = await prisma.lesson.findMany({
      where: { level: { hskLevel: classData.level } },
      include: {
        _count: {
          select: { vocabularies: true, grammarPoints: true },
        },
      },
      orderBy: { lessonNumber: "asc" },
      take: 20,
    });

    const meta = decodeClassDescription(classData.description, classData.createdAt, classData.isActive, classData.level);

    return NextResponse.json({
      success: true,
      class: {
        id: classData.id,
        name: classData.name,
        level: classData.level,
        description: meta.text,
        startDate: meta.startDate,
        endDate: meta.endDate,
        status: meta.status,
        statusText: meta.statusText,
        track: meta.track,
        code: classData.id.slice(-6).toUpperCase(),
        teacherId: classData.teacherId,
        teacher: classData.teacher,
        totalStudents: classData.students.length,
        totalAssignments: classData.assignments.length,
        students: classData.students.map((cs) => ({
          id: cs.student.id,
          name: cs.student.name,
          username: cs.student.username,
          email: cs.student.email,
          avatar: cs.student.avatar,
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

    // Decode existing description to merge changes
    const currentMeta = decodeClassDescription(targetClass.description, targetClass.createdAt, targetClass.isActive, targetClass.level);

    const mergedText = body.description !== undefined ? body.description.trim() : currentMeta.text;
    const mergedStart = body.startDate ? normalizeDMY(body.startDate) : currentMeta.startDate;
    const mergedEnd = body.endDate ? normalizeDMY(body.endDate) : currentMeta.endDate;
    const mergedStatus = body.status !== undefined ? body.status : currentMeta.status;
    const mergedTrack = body.track !== undefined ? body.track : currentMeta.track;

    const newPackedDescription = encodeClassDescription({
      text: mergedText,
      startDate: mergedStart,
      endDate: mergedEnd,
      status: mergedStatus,
      track: mergedTrack,
    });

    const isEnded = mergedStatus === "ENDED" || (body.isActive !== undefined ? !body.isActive : false);

    const updated = await prisma.class.update({
      where: { id: classId },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        description: newPackedDescription,
        isActive: !isEnded,
      },
    });

    const updatedMeta = decodeClassDescription(updated.description, updated.createdAt, updated.isActive, updated.level);

    return NextResponse.json({
      success: true,
      message: "Cập nhật lớp thành công!",
      item: {
        id: updated.id,
        name: updated.name,
        level: updated.level,
        description: updatedMeta.text,
        startDate: updatedMeta.startDate,
        endDate: updatedMeta.endDate,
        status: updatedMeta.status,
        statusText: updatedMeta.statusText,
        track: updatedMeta.track,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    console.error("PATCH /classes/[id] error:", error);
    return NextResponse.json({ success: false, message: "Lỗi cập nhật lớp học." }, { status: 500 });
  }
}

// DELETE /api/v1/classes/[id] - Xóa lớp học và toàn bộ dữ liệu liên quan
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const authUser = await getAuthUser(request);

    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: { students: true, assignments: true },
        },
      },
    });

    if (!targetClass) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy lớp học cần xóa." },
        { status: 404 }
      );
    }

    // Quyền: Chỉ giáo viên phụ trách lớp học hoặc Admin mới được xóa lớp
    if (authUser && authUser.role === "TEACHER" && targetClass.teacherId !== authUser.id) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền xóa lớp học của giáo viên khác." },
        { status: 403 }
      );
    }

    // Xóa an toàn theo thứ tự cascade để đảm bảo hoạt động trơn tru trên cả SQLite & PostgreSQL
    const assignments = await prisma.assignment.findMany({
      where: { classId },
      select: { id: true },
    });
    const assignmentIds = assignments.map((a) => a.id);

    await prisma.$transaction(async (tx) => {
      if (assignmentIds.length > 0) {
        await tx.attemptAnswer.deleteMany({
          where: { attempt: { assignmentId: { in: assignmentIds } } },
        });
        await tx.attempt.deleteMany({
          where: { assignmentId: { in: assignmentIds } },
        });
        await tx.assignmentTarget.deleteMany({
          where: { assignmentId: { in: assignmentIds } },
        });
        await tx.assignment.deleteMany({
          where: { classId },
        });
      }
      await tx.classStudent.deleteMany({
        where: { classId },
      });
      await tx.class.delete({
        where: { id: classId },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa lớp học "${targetClass.name}" thành công!`,
      deletedClassId: classId,
    });
  } catch (error) {
    console.error("DELETE /classes/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi xóa lớp học." },
      { status: 500 }
    );
  }
}
