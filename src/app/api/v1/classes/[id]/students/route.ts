import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";


// GET /api/v1/classes/[id]/students - Lấy danh sách học viên của lớp
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const authUser = await getAuthUser(request);

    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, teacherId: true, name: true },
    });

    if (!targetClass) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học." }, { status: 404 });
    }

    if (authUser && authUser.role === "TEACHER" && targetClass.teacherId !== authUser.id) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền truy cập danh sách học sinh của lớp này." },
        { status: 403 }
      );
    }

    const classStudents = await prisma.classStudent.findMany({
      where: { classId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            avatar: true,
            status: true,
            totalXp: true,
            streakDays: true,
            _count: {
              select: { attempts: true, wrongQuestions: true },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      items: classStudents.map((cs) => ({
        id: cs.student.id,
        name: cs.student.name,
        username: cs.student.username,
        email: cs.student.email,
        avatar: cs.student.avatar,
        status: cs.student.status,
        totalXp: cs.student.totalXp,
        streakDays: cs.student.streakDays,
        attemptsCount: cs.student._count.attempts,
        wrongCount: cs.student._count.wrongQuestions,
        joinedAt: cs.joinedAt,
      })),
    });
  } catch (error) {
    console.error("GET /classes/[id]/students error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tải danh sách học sinh." }, { status: 500 });
  }
}

// POST /api/v1/classes/[id]/students - Cấp tài khoản mới hoặc gán học viên vào lớp
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const authUser = await getAuthUser(request);
    const body = await request.json();
    const { name, username, email, password } = body;

    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!targetClass) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học." }, { status: 404 });
    }

    // Bảo mật: Giáo viên chỉ được cấp học sinh vào lớp của chính mình
    if (authUser && authUser.role === "TEACHER" && targetClass.teacherId !== authUser.id) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền thêm học sinh vào lớp của giáo viên khác." },
        { status: 403 }
      );
    }

    if (!username || !username.trim()) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập tên đăng nhập." }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email?.trim().toLowerCase() || null;

    // Kiểm tra học viên đã tồn tại chưa
    let student = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ],
      },
    });

    if (student) {
      // Học viên đã có tài khoản: kiểm tra đã ở trong lớp này chưa
      const alreadyEnrolled = await prisma.classStudent.findUnique({
        where: {
          classId_studentId: {
            classId: targetClass.id,
            studentId: student.id,
          },
        },
      });

      if (alreadyEnrolled) {
        return NextResponse.json(
          { success: false, message: `Học sinh "${student.name}" (@${student.username}) đã có trong lớp này rồi.` },
          { status: 400 }
        );
      }

      // Gán học sinh vào lớp
      await prisma.classStudent.create({
        data: {
          classId: targetClass.id,
          studentId: student.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Đã thêm học viên "${student.name}" vào lớp thành công!`,
        student: {
          id: student.id,
          name: student.name,
          username: student.username,
          email: student.email,
          status: student.status,
          totalXp: student.totalXp,
          streakDays: student.streakDays,
        },
      });
    }

    // Nếu chưa có tài khoản: Tạo tài khoản học sinh mới
    const newStudent = await prisma.user.create({
      data: {
        name: (name || cleanUsername).trim(),
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: password || "123456",
        role: "STUDENT",
        status: "ACTIVE",
        currentHskLevel: targetClass.level,
        totalXp: 50,
        streakDays: 1,
      },
    });

    // Gán học sinh vào lớp này
    await prisma.classStudent.create({
      data: {
        classId: targetClass.id,
        studentId: newStudent.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Đã cấp tài khoản thành công cho em ${newStudent.name}!`,
        student: {
          id: newStudent.id,
          name: newStudent.name,
          username: newStudent.username,
          email: newStudent.email,
          password: password || "123456",
          totalXp: 50,
          streakDays: 1,
          status: newStudent.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /classes/[id]/students error:", error);
    return NextResponse.json({ success: false, message: "Lỗi cấp tài khoản học sinh." }, { status: 500 });
  }
}

// DELETE /api/v1/classes/[id]/students - Gỡ học viên khỏi lớp an toàn (không xóa tài khoản)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const authUser = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ success: false, message: "Thiếu ID học sinh cần gỡ." }, { status: 400 });
    }

    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!targetClass) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học." }, { status: 404 });
    }

    if (authUser && authUser.role === "TEACHER" && targetClass.teacherId !== authUser.id) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền quản lý học sinh của lớp này." },
        { status: 403 }
      );
    }

    await prisma.classStudent.deleteMany({
      where: {
        classId,
        studentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã gỡ học viên khỏi lớp thành công. Tài khoản học viên vẫn được giữ nguyên.",
    });
  } catch (error) {
    console.error("DELETE /classes/[id]/students error:", error);
    return NextResponse.json({ success: false, message: "Lỗi gỡ học viên khỏi lớp." }, { status: 500 });
  }
}
