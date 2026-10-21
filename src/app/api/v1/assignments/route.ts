import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

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
    const { title, classId, quizSetId, dueAt, durationMin, mode } = body;

    if (!title || !classId) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin bắt buộc." }, { status: 400 });
    }

    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!targetClass) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học." }, { status: 404 });
    }

    // Bảo mật: Giáo viên chỉ được tạo bài tập cho lớp của mình
    if (authUser && authUser.role === "TEACHER" && targetClass.teacherId !== authUser.id) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền giao bài cho lớp của giáo viên khác." },
        { status: 403 }
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

    const newAssignment = await prisma.assignment.create({
      data: {
        title: title.trim(),
        classId,
        quizSetId: validQuizSetId,
        dueAt: dueAt ? new Date(dueAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        durationMin: durationMin || 45,
        mode: mode || "EXAM",
        status: "OPEN",
      },
    });

    return NextResponse.json({ success: true, item: newAssignment }, { status: 201 });
  } catch (error) {
    console.error("POST /assignments error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tạo bài tập mới." }, { status: 500 });
  }
}
