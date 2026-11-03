import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

// GET /api/v1/proctor/violation - Lấy danh sách vi phạm thi cử cho Giáo viên & Admin
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || !["TEACHER", "ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Chỉ giáo viên và quản trị viên mới có quyền xem nhật ký giám thị." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const take = Math.min(60, Number(searchParams.get("take") || 40));

    // Lấy danh sách auditLog giám thị
    const logs = await prisma.auditLog.findMany({
      where: {
        entity: "EXAM_PROCTOR",
      },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    const parsedViolations = logs.map((log) => {
      let parsedDetails: any = {};
      try {
        parsedDetails = log.details ? JSON.parse(log.details) : {};
      } catch {
        parsedDetails = { details: log.details };
      }

      return {
        id: log.id,
        createdAt: log.createdAt,
        studentId: log.userId,
        studentName: parsedDetails.studentName || log.user?.name || log.user?.username || "Thí sinh",
        examTitle: parsedDetails.examTitle || "Bài thi trực tuyến",
        classId: parsedDetails.classId || null,
        violationType: parsedDetails.violationType || log.action.replace("EXAM_PROCTOR_VIOLATION_", ""),
        details: parsedDetails.details || "Phát hiện hành vi bất thường",
        count: parsedDetails.count || 1,
        snapshot: parsedDetails.snapshot || null, // Ảnh chụp webcam tại thời điểm vi phạm
      };
    });

    // Lọc theo classId nếu giáo viên yêu cầu lớp cụ thể
    const filtered = classId
      ? parsedViolations.filter((v) => !v.classId || v.classId === classId)
      : parsedViolations;

    return NextResponse.json({
      success: true,
      total: filtered.length,
      violations: filtered,
    });
  } catch (error: any) {
    console.error("Lỗi lấy danh sách vi phạm thi cử:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy dữ liệu giám sát thi." },
      { status: 500 }
    );
  }
}

// POST /api/v1/proctor/violation - Ghi nhận vi phạm từ máy thí sinh và báo ngay cho giáo viên
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const body = await request.json();
    const {
      examTitle = "Bài thi trực tuyến",
      classId,
      violationType = "TAB_SWITCH",
      details = "Học sinh rời khỏi giao diện bài thi",
      count = 1,
      snapshot = null, // Ảnh chụp bằng chứng từ webcam (base64)
    } = body;

    // 1. Xác định giáo viên cần nhận thông báo
    const teacherIds = new Set<string>();

    if (classId) {
      const cls = await prisma.class.findUnique({
        where: { id: classId },
        select: { teacherId: true, name: true },
      });
      if (cls?.teacherId) teacherIds.add(cls.teacherId);
    }

    // Nếu không có classId hoặc chưa tìm thấy, tìm qua các lớp học sinh đã tham gia
    if (teacherIds.size === 0) {
      const enrolled = await prisma.classStudent.findMany({
        where: { studentId: user.id, status: "APPROVED" },
        include: { class: { select: { teacherId: true } } },
      });
      for (const e of enrolled) {
        if (e.class?.teacherId) teacherIds.add(e.class.teacherId);
      }
    }

    // Nếu học sinh tự luyện thi HSK ngoài lớp, gửi thông báo cho Ban giám thị / Admin
    if (teacherIds.size === 0) {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", status: "ACTIVE" },
        select: { id: true },
        take: 3,
      });
      admins.forEach((a) => teacherIds.add(a.id));
    }

    const violationNameMap: Record<string, string> = {
      TAB_SWITCH: "Chuyển tab / Mở cửa sổ khác",
      APP_SWITCH: "Rời khỏi trình duyệt ra ứng dụng ngoài",
      FULLSCREEN_EXIT: "Thoát chế độ toàn màn hình",
      AUDIO_SUSPICIOUS: "Phát hiện tiếng nói chuyện / Tiếng ồn",
      COPY_PASTE: "Cố tình sao chép / dán đề bài",
      CELL_PHONE_DETECTED: "📱 Phát hiện cầm điện thoại di động trước camera",
      MULTIPLE_PEOPLE_DETECTED: "👥 Phát hiện thêm người thứ 2 trong phòng thi",
      NO_FACE_DETECTED: "👤 Thí sinh vắng mặt / Không thấy khuôn mặt",
      SUSPICIOUS_MOVEMENT: "👀 Cử động bất thường / Ngó nghiêng liên tục",
    };

    const violationLabel = violationNameMap[violationType] || violationType;
    const studentName = user.name || user.username;

    // 2. Gửi thông báo đến danh sách giáo viên phụ trách
    const notificationsToCreate = Array.from(teacherIds).map((tId) => ({
      userId: tId,
      title: `🚨 Cảnh báo AI Giám Thị: ${studentName} (${violationLabel})`,
      message: `Học sinh ${studentName} vừa vi phạm: "${details}" trong bài "${examTitle}" (Lần ${count}/3). Đã lưu ảnh chụp webcam bằng chứng vào hệ thống giám thị.`,
      type: "WARNING",
      linkUrl: classId ? `/t/classes/${classId}` : "/t/dashboard#proctor",
    }));

    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate,
      });
    }

    // 3. Ghi vết kiểm toán (AuditLog) kèm ảnh chụp Snapshot webcam
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        entity: "EXAM_PROCTOR",
        action: `EXAM_PROCTOR_VIOLATION_${violationType}`,
        details: JSON.stringify({
          studentId: user.id,
          studentName,
          examTitle,
          classId,
          violationType,
          violationLabel,
          details,
          count,
          snapshot: snapshot ? String(snapshot).slice(0, 150000) : null, // Giới hạn kích thước ảnh base64
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã ghi nhận vi phạm và gửi cảnh báo thời gian thực tới giáo viên.",
      violationCount: count,
    });
  } catch (error: any) {
    console.error("Proctor violation error:", error);
    return NextResponse.json({ success: false, message: "Lỗi ghi nhận vi phạm." }, { status: 500 });
  }
}

// DELETE /api/v1/proctor/violation - Xóa một hoặc dọn dẹp toàn bộ ảnh bằng chứng vi phạm
export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || !["TEACHER", "ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Chỉ giáo viên và quản trị viên mới có quyền xóa dữ liệu giám thị." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action"); // "CLEAR_ALL"

    if (id) {
      await prisma.auditLog.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Đã xóa bản ghi vi phạm thành công." });
    }

    if (action === "CLEAR_ALL") {
      const deleted = await prisma.auditLog.deleteMany({
        where: { entity: "EXAM_PROCTOR" },
      });
      return NextResponse.json({
        success: true,
        message: `Đã dọn dẹp thành công toàn bộ ${deleted.count} bản ghi bằng chứng vi phạm để tiết kiệm dung lượng.`,
      });
    }

    return NextResponse.json({ success: false, message: "Thiếu ID hoặc hành động cần xóa." }, { status: 400 });
  } catch (error: any) {
    console.error("Delete proctor violation error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi dọn dẹp dữ liệu giám thị." },
      { status: 500 }
    );
  }
}
