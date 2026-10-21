import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

// GET /api/v1/classes - Lấy danh sách lớp theo quyền giáo viên hiện tại
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const filterTeacherId = searchParams.get("teacherId");

    let where: any = {};

    if (authUser) {
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

    return NextResponse.json({
      success: true,
      teacher: authUser ? { id: authUser.id, name: authUser.name, email: authUser.email } : null,
      items: classes.map((c) => ({
        id: c.id,
        name: c.name,
        level: c.level,
        description: c.description,
        totalStudents: c._count.students,
        totalAssignments: c._count.assignments,
        isActive: c.isActive,
        code: c.id.slice(-6).toUpperCase(),
        teacherId: c.teacherId,
        teacherName: c.teacher?.name || "Giáo viên",
        teacherEmail: c.teacher?.email,
        teacherAvatar: c.teacher?.avatar,
        createdAt: c.createdAt,
      })),
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
    const { name, level, description, teacherId: bodyTeacherId } = body;

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

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        level: Number(level) || 1,
        description: description?.trim() || `Lớp học do ${teacherUser.name} phụ trách.`,
        teacherId: teacherUser.id,
        isActive: true,
      },
      include: {
        teacher: {
          select: { id: true, name: true, username: true, email: true, avatar: true },
        },
      },
    });

    const formattedCode = newClass.id.slice(-6).toUpperCase();

    return NextResponse.json(
      {
        success: true,
        message: `Đã tạo lớp "${newClass.name}" thành công!`,
        item: {
          id: newClass.id,
          name: newClass.name,
          level: newClass.level,
          description: newClass.description,
          totalStudents: 0,
          totalAssignments: 0,
          isActive: newClass.isActive,
          code: formattedCode,
          teacherId: newClass.teacherId,
          teacherName: newClass.teacher?.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /classes error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tạo lớp học mới." }, { status: 500 });
  }
}
