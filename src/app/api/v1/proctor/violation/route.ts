import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

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
      violationType = "TAB_SWITCH", // TAB_SWITCH, APP_SWITCH, FULLSCREEN_EXIT, AUDIO_SUSPICIOUS, COPY_PASTE
      details = "Học sinh rời khỏi giao diện bài thi",
      count = 1,
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

    // Nếu học sinh không thuộc lớp nào, thông báo cho quản trị viên (Admin)
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
      APP_SWITCH: "Rời khỏi trình duyệt",
      FULLSCREEN_EXIT: "Thoát chế độ toàn màn hình",
      AUDIO_SUSPICIOUS: "Phát hiện âm thanh trao đổi",
      COPY_PASTE: "Cố tình sao chép / dán đề bài",
    };

    const violationLabel = violationNameMap[violationType] || violationType;
    const studentName = user.name || user.username;

    // 2. Gửi thông báo đến danh sách giáo viên phụ trách
    const notificationsToCreate = Array.from(teacherIds).map((tId) => ({
      userId: tId,
      title: `🚨 Cảnh báo thi cử: ${studentName} (${violationLabel})`,
      message: `Học sinh ${studentName} vừa vi phạm: "${details}" trong bài thi "${examTitle}" (Lần ${count}/3). Thời gian: ${new Date().toLocaleTimeString("vi-VN")}.`,
      type: "WARNING",
      linkUrl: classId ? `/t/classes/${classId}` : "/t/dashboard",
    }));

    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate,
      });
    }

    // 3. Ghi vết kiểm toán (AuditLog)
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
          details,
          count,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã ghi nhận vi phạm và gửi thông báo tới giáo viên.",
      violationCount: count,
    });
  } catch (error: any) {
    console.error("Proctor violation error:", error);
    return NextResponse.json({ success: false, message: "Lỗi ghi nhận vi phạm." }, { status: 500 });
  }
}
