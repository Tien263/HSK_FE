import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";
import { decodeClassDescription, encodeClassDescription, normalizeDMY } from "@/lib/class-helper";


// GET /api/v1/classes - Lấy danh sách lớp theo quyền giáo viên hiện tại
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const filterTeacherId = searchParams.get("teacherId");
    const filterStudentId = searchParams.get("studentId");

    let where: any = {};

    if (filterStudentId) {
      where.students = {
        some: { studentId: filterStudentId },
      };
    } else if (authUser) {
      if (authUser.role === "TEACHER") {
        // Giáo viên chỉ xem được lớp của chính mình
        where.teacherId = authUser.id;
      } else if (authUser.role === "ADMIN") {
        // Admin xem được tất cả hoặc lọc theo teacherId
        if (filterTeacherId) {
          where.teacherId = filterTeacherId;
        }
      } else if (authUser.role === "STUDENT") {
        // Học sinh chỉ xem được lớp mình đang học
        where.students = {
          some: { studentId: authUser.id },
        };
      }
    } else if (filterTeacherId) {
      where.teacherId = filterTeacherId;
    } else {
      // Nếu không có thông tin xác thực, từ chối để tránh rò rỉ dữ liệu giữa các giáo viên
      return NextResponse.json(
        { success: false, message: "Yêu cầu đăng nhập để truy cập danh sách lớp." },
        { status: 401 }
      );
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        teacher: {
          select: { id: true, name: true, username: true, email: true, avatar: true },
        },
        _count: { select: { students: true, assignments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Lấy tiến độ làm bài nếu là học viên (CLASS-002)
    const studentIdForProgress = filterStudentId || (authUser?.role === "STUDENT" ? authUser.id : null);
    const studentAttempts = studentIdForProgress
      ? await prisma.attempt.findMany({
          where: {
            studentId: studentIdForProgress,
            status: { in: ["SUBMITTED", "GRADED"] },
          },
          select: { assignment: { select: { classId: true } } },
        })
      : [];

    const attemptsByClass: Record<string, number> = {};
    for (const att of studentAttempts) {
      const cid = att.assignment?.classId;
      if (cid) {
        attemptsByClass[cid] = (attemptsByClass[cid] || 0) + 1;
      }
    }

    return NextResponse.json({
      success: true,
      teacher: authUser ? { id: authUser.id, name: authUser.name, email: authUser.email } : null,
      items: classes.map((c) => {
        const meta = decodeClassDescription(c.description, c.createdAt, c.isActive, c.level);
        const submittedCount = attemptsByClass[c.id] || 0;
        const totalAssignments = c._count.assignments;

        // CLASS-002: Chỉ tính % khi totalAssignments > 0, ngược lại là null ("Chưa có dữ liệu tiến độ")
        const progressPercent = totalAssignments > 0
          ? Math.min(100, Math.round((submittedCount / totalAssignments) * 100))
          : null;

        return {
          id: c.id,
          name: c.name,
          level: c.level,
          description: meta.text,
          startDate: meta.startDate,
          endDate: meta.endDate,
          status: meta.status,
          statusText: meta.statusText,
          track: meta.track,
          totalStudents: c._count.students,
          totalAssignments,
          submittedAssignments: submittedCount,
          progressPercent,
          isActive: c.isActive,
          code: c.id.slice(-6).toUpperCase(),
          teacherId: c.teacherId,
          teacherName: c.teacher?.name || "Giáo viên",
          teacherEmail: c.teacher?.email,
          teacherAvatar: c.teacher?.avatar,
          createdAt: c.createdAt,
        };
      }),
    });
  } catch (error) {
    console.error("GET /classes error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tải danh sách lớp." }, { status: 500 });
  }
}

// POST /api/v1/classes - Tạo lớp học mới (chỉ giáo viên sở hữu hoặc admin)
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const body = await request.json();
    const {
      name,
      level,
      description,
      startDate,
      endDate,
      status,
      track,
      teacherId: bodyTeacherId,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập tên lớp học." }, { status: 400 });
    }

    // Xác định ID giáo viên phụ trách
    let effectiveTeacherId = authUser?.id || bodyTeacherId;

    if (authUser && authUser.role === "TEACHER") {
      // Giáo viên chỉ được tạo lớp cho chính mình
      effectiveTeacherId = authUser.id;
    } else if (authUser && authUser.role === "ADMIN" && bodyTeacherId) {
      // Admin có thể chỉ định giáo viên
      effectiveTeacherId = bodyTeacherId;
    }

    if (!effectiveTeacherId) {
      return NextResponse.json(
        { success: false, message: "Không xác định được danh tính giáo viên tạo lớp." },
        { status: 401 }
      );
    }

    // Kiểm tra giáo viên có tồn tại trong DB không
    const teacherUser = await prisma.user.findUnique({
      where: { id: effectiveTeacherId },
    });

    if (!teacherUser || (teacherUser.role !== "TEACHER" && teacherUser.role !== "ADMIN")) {
      return NextResponse.json(
        { success: false, message: "Tài khoản giáo viên không hợp lệ." },
        { status: 403 }
      );
    }

    // Đóng gói mô tả cùng startDate, endDate, status, track dạng JSON
    const packedDescription = encodeClassDescription({
      text: description?.trim() || `Lớp học do ${teacherUser.name} phụ trách.`,
      startDate: startDate ? normalizeDMY(startDate) : normalizeDMY(new Date()),
      endDate: endDate ? normalizeDMY(endDate) : normalizeDMY(new Date(Date.now() + 180 * 86400000)),
      status: status || undefined,
      track: track || (Number(level) <= 3 ? "HSK" : Number(level) === 4 ? "TOPIC" : "MAJOR"),
    });

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        level: Number(level) || 1,
        description: packedDescription,
        teacherId: teacherUser.id,
        isActive: status === "ENDED" ? false : true,
      },
      include: {
        teacher: {
          select: { id: true, name: true, username: true, email: true, avatar: true },
        },
      },
    });

    const formattedCode = newClass.id.slice(-6).toUpperCase();
    const meta = decodeClassDescription(newClass.description, newClass.createdAt, newClass.isActive, newClass.level);

    return NextResponse.json(
      {
        success: true,
        message: `Đã tạo lớp "${newClass.name}" thành công!`,
        item: {
          id: newClass.id,
          name: newClass.name,
          level: newClass.level,
          description: meta.text,
          startDate: meta.startDate,
          endDate: meta.endDate,
          status: meta.status,
          statusText: meta.statusText,
          track: meta.track,
          totalStudents: 0,
          totalAssignments: 0,
          isActive: newClass.isActive,
          code: formattedCode,
          teacherId: newClass.teacherId,
          teacherName: newClass.teacher?.name,
          createdAt: newClass.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /classes error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tạo lớp học." }, { status: 500 });
  }
}
