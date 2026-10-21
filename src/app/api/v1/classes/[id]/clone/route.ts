import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";
import {
  decodeClassDescription,
  encodeClassDescription,
  normalizeDMY,
  parseDMY,
} from "@/lib/class-helper";

// POST /api/v1/classes/[id]/clone - Nhân bản lớp học sang khóa mới
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const authUser = await getAuthUser(request);
    const body = await request.json();

    const sourceClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        assignments: true,
      },
    });

    if (!sourceClass) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy lớp học gốc cần nhân bản." },
        { status: 404 }
      );
    }

    // Kiểm tra quyền
    if (authUser && authUser.role === "TEACHER" && sourceClass.teacherId !== authUser.id) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền nhân bản lớp học của giáo viên khác." },
        { status: 403 }
      );
    }

    const sourceMeta = decodeClassDescription(
      sourceClass.description,
      sourceClass.createdAt,
      sourceClass.isActive,
      sourceClass.level
    );

    const newClassName = (body.name || `${sourceClass.name} (Khóa mới)`).trim();
    const newStartDate = normalizeDMY(body.startDate || new Date());
    const newEndDate = normalizeDMY(
      body.endDate || new Date(Date.now() + 180 * 86400000)
    );
    const cloneAssignments = body.cloneAssignments !== false;

    // Validation
    const startObj = parseDMY(newStartDate);
    const endObj = parseDMY(newEndDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (endObj && endObj < today) {
      return NextResponse.json(
        { success: false, message: "Ngày kết thúc của lớp mới không được ở trong quá khứ." },
        { status: 400 }
      );
    }

    if (startObj && endObj && endObj <= startObj) {
      return NextResponse.json(
        { success: false, message: "Ngày kết thúc phải sau ngày bắt đầu." },
        { status: 400 }
      );
    }

    const newStatus = startObj && startObj > today ? "UPCOMING" : "ACTIVE";

    const newPackedDescription = encodeClassDescription({
      text: body.description ? body.description.trim() : sourceMeta.text,
      startDate: newStartDate,
      endDate: newEndDate,
      status: newStatus,
      track: sourceMeta.track,
      isArchived: false,
    });

    const teacherId = authUser?.id || sourceClass.teacherId;

    // Tạo lớp mới hoàn toàn cách ly với lớp cũ (0 học viên)
    const newClass = await prisma.class.create({
      data: {
        name: newClassName,
        level: sourceClass.level,
        teacherId,
        description: newPackedDescription,
        isActive: true,
      },
    });

    // Nếu chọn sao chép bài tập
    if (cloneAssignments && sourceClass.assignments.length > 0) {
      const assignmentCreates = sourceClass.assignments.map((a) => {
        // Gán thời hạn mới theo tương lai
        const newDue = new Date(Date.now() + 14 * 86400000);
        return {
          quizSetId: a.quizSetId,
          classId: newClass.id,
          title: a.title,
          openAt: new Date(),
          dueAt: newDue,
          durationMin: a.durationMin,
          maxAttempts: a.maxAttempts,
          mode: a.mode,
          latePolicy: a.latePolicy,
          scoreRule: a.scoreRule,
          status: "OPEN",
        };
      });

      await prisma.assignment.createMany({
        data: assignmentCreates,
      });
    }

    const createdMeta = decodeClassDescription(
      newClass.description,
      newClass.createdAt,
      newClass.isActive,
      newClass.level
    );

    return NextResponse.json({
      success: true,
      message: `Đã nhân bản thành công lớp "${newClass.name}"!`,
      item: {
        id: newClass.id,
        name: newClass.name,
        level: newClass.level,
        description: createdMeta.text,
        startDate: createdMeta.startDate,
        endDate: createdMeta.endDate,
        status: createdMeta.status,
        statusText: createdMeta.statusText,
        track: createdMeta.track,
        totalStudents: 0,
        totalAssignments: cloneAssignments ? sourceClass.assignments.length : 0,
        code: newClass.id.slice(-6).toUpperCase(),
        teacherId: newClass.teacherId,
        isActive: newClass.isActive,
      },
    });
  } catch (error) {
    console.error("POST /classes/[id]/clone error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi nhân bản lớp học." },
      { status: 500 }
    );
  }
}
