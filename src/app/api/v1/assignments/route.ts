import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";


export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const filterClassId = searchParams.get("classId");
    const filterTeacherId = searchParams.get("teacherId");

    let where: any = {};

    if (filterClassId) {
      where.classId = filterClassId;
    }

    if (authUser && authUser.role === "TEACHER") {
      // Chỉ lấy bài tập thuộc các lớp của giáo viên này
      where.class = { teacherId: authUser.id };
    } else if (filterTeacherId) {
      where.class = { teacherId: filterTeacherId };
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, level: true, teacherId: true } },
        _count: { select: { attempts: true } },
      },
      orderBy: { dueAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      items: assignments.map((a) => ({
        id: a.id,
        title: a.title,
        classId: a.classId,
        className: a.class?.name || "Lớp học",
        dueAt: a.dueAt,
        status: a.status,
        durationMin: a.durationMin,
        submittedCount: a._count.attempts,
      })),
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
    const { title, classId, classIds, quizSetId, openAt, dueAt, durationMin, mode } = body;

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

    // Nếu không truyền quizSetId thì lấy hoặc tạo một quizSet mặc định
    let validQuizSetId = quizSetId;
    if (!validQuizSetId) {
      const defaultQuizSet = await prisma.quizSet.findFirst();
      validQuizSetId = defaultQuizSet?.id;
    }

    if (!validQuizSetId) {
      return NextResponse.json({ success: false, message: "Chưa có bộ câu hỏi phù hợp." }, { status: 400 });
    }

    const createdAssignments = [];
    const openDate = openAt ? new Date(openAt) : new Date();
    const dueDate = dueAt ? new Date(dueAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    for (const cId of targetClassIds) {
      const targetClass = await prisma.class.findUnique({
        where: { id: cId },
      });

      if (!targetClass) continue;

      // Bảo mật: Giáo viên chỉ được tạo bài tập cho lớp của mình (trừ admin)
      if (authUser && authUser.role === "TEACHER" && targetClass.teacherId !== authUser.id) {
        continue;
      }

      const newAssignment = await prisma.assignment.create({
        data: {
          title: title.trim(),
          classId: cId,
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
