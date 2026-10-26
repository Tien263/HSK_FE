import { learningReport } from "@/lib/learning-reports";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";
import { decodeClassDescription, encodeClassDescription, normalizeDMY } from "@/lib/class-helper";


// GET /api/v1/classes - Lấy danh sách lớp theo quyền giáo viên hiện tại
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) return NextResponse.json({success:false,message:"Vui lòng đăng nhập."},{status:401});
    const { searchParams } = new URL(request.url);
    const filterTeacherId = searchParams.get("teacherId");
    const filterStudentId = searchParams.get("studentId");

    const where: any = authUser.role === "TEACHER" ? {teacherId:authUser.id} : authUser.role === "STUDENT" ? {students:{some:{studentId:authUser.id,status:{in:["APPROVED","PENDING"]}}}} : {};
    if(authUser.role==="ADMIN"){if(filterTeacherId)where.teacherId=filterTeacherId;if(filterStudentId)where.students={some:{studentId:filterStudentId}};}
    const classes = await prisma.class.findMany({
      where,
      include: {
        teacher: {
          select: { id: true, name: true, username: true, email: true, avatar: true },
        },
        _count: { select: { students: {where:{status:"APPROVED"}}, assignments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const studentIdForProgress = authUser.role === "STUDENT" ? authUser.id : authUser.role === "ADMIN" ? filterStudentId : null;
    const report=await learningReport(authUser);
    // Lấy trạng thái phê duyệt của học sinh trong từng lớp
    const studentEnrollments = studentIdForProgress
      ? await prisma.classStudent.findMany({
          where: { studentId: studentIdForProgress },
          select: { classId: true, status: true },
        })
      : [];

    const enrollmentStatusByClass: Record<string, string> = {};
    for (const e of studentEnrollments) {
      enrollmentStatusByClass[e.classId] = e.status;
    }

    return NextResponse.json({
      success: true,
      teacher: authUser ? { id: authUser.id, name: authUser.name, email: authUser.email } : null,
      items: classes.map((c) => {
        const meta = decodeClassDescription(c.description, c.createdAt, c.isActive, c.level);
        const classReport=report.classProgress.find(item=>item.id===c.id);
        const submittedCount=classReport?.completed??0;
        const totalAssignments = c._count.assignments;
        const myEnrollmentStatus = enrollmentStatusByClass[c.id] || "APPROVED";
        const isPending = myEnrollmentStatus === "PENDING";

        // CLASS-002: Chỉ tính % khi totalAssignments > 0, ngược lại là null ("Chưa có dữ liệu tiến độ")
        const progressPercent = classReport?.progress??null;

        return {
          id: c.id,
          name: c.name,
          level: c.level,
          description: meta.text,
          startDate: meta.startDate,
          endDate: meta.endDate,
          status: isPending ? "PAUSED" : meta.status,
          statusText: isPending ? "Chờ duyệt" : meta.statusText,
          enrollmentStatus: myEnrollmentStatus,
          isPendingApproval: isPending,
          track: meta.track,
          isArchived: !!meta.isArchived,
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
    if (!authUser) return NextResponse.json({success:false,message:"Vui lòng đăng nhập."},{status:401});
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
    const teacherUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: effectiveTeacherId }, { username: effectiveTeacherId }],
      },
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

// DELETE /api/v1/classes - Xóa hàng loạt lớp học (Bulk Delete Classes)
export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) return NextResponse.json({success:false,message:"Vui lòng đăng nhập."},{status:401});
    const body = await request.json().catch(() => ({}));
    const { classIds } = body;

    if (!Array.isArray(classIds) || classIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Danh sách classIds cần xóa không hợp lệ." },
        { status: 400 }
      );
    }

    // Lọc các lớp hợp lệ theo quyền
    const classesToDelete = await prisma.class.findMany({
      where: {
        id: { in: classIds },
        ...(authUser?.role === "TEACHER" ? { teacherId: authUser.id } : {}),
      },
      select: { id: true, name: true },
    });

    if (classesToDelete.length === 0) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy lớp học hợp lệ để xóa hoặc không có quyền." },
        { status: 404 }
      );
    }

    const validIds = classesToDelete.map((c) => c.id);

    // Xóa an toàn theo thứ tự cascade
    const assignments = await prisma.assignment.findMany({
      where: { classId: { in: validIds } },
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
          where: { id: { in: assignmentIds } },
        });
      }
      await tx.classLesson.deleteMany({
        where: { classId: { in: validIds } },
      });
      await tx.classStudent.deleteMany({
        where: { classId: { in: validIds } },
      });
      await tx.class.deleteMany({
        where: { id: { in: validIds } },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa thành công ${validIds.length} lớp học!`,
      deletedCount: validIds.length,
      deletedIds: validIds,
    });
  } catch (error) {
    console.error("DELETE /classes error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi xóa hàng loạt lớp học." },
      { status: 500 }
    );
  }
}
