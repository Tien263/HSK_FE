import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      username,
      learningMode, // 'SELF' | 'CLASS'
      classCode,
      classId,
      mainTrack,    // 'hsk' | 'topic' | 'major'
      major,        // 'kinhte' | 'ketoan' | 'cntt' | 'khac'
      currentLevel, // 'beginner' | 'intermediate' | 'advanced'
      dailyTime,    // 15 | 30 | 60
    } = body;

    const student = await prisma.user.findFirst({
      where: {
        OR: [
          ...(body.userId ? [{ id: body.userId }] : []),
          ...(body.studentId ? [{ id: body.studentId }] : []),
          { username: username || "student" },
          { email: username || "student" },
        ],
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy thông tin tài khoản học viên." },
        { status: 404 }
      );
    }

    let targetHskLevel = 1;
    if (currentLevel === "intermediate" || currentLevel === "HSK 1-3") targetHskLevel = 2;
    if (currentLevel === "advanced" || currentLevel === "HSK 4 trở lên") targetHskLevel = 4;

    // Cập nhật thông tin học viên
    await prisma.user.update({
      where: { id: student.id },
      data: {
        currentHskLevel: targetHskLevel,
      },
    });

    // Nếu học viên chọn tham gia lớp hoặc có mã lớp
    let enrolledClassInfo = null;
    let targetClass: any = null;

    if (classId) {
      targetClass = await prisma.class.findUnique({
        where: { id: classId },
        include: { teacher: true },
      });
    }

    if (!targetClass && classCode && classCode.trim()) {
      const code = classCode.trim();
      const normalizedCode = code.toUpperCase().replace(/\s+/g, "").replace(/-/g, "");

      // 1. Ưu tiên tìm chính xác theo ID, mã đuôi 6 ký tự hoặc tên lớp
      targetClass = await prisma.class.findFirst({
        where: {
          OR: [
            { id: code },
            { id: { endsWith: code.toLowerCase() } },
            { id: { endsWith: normalizedCode.toLowerCase() } },
            { name: { equals: code.trim(), mode: "insensitive" } },
          ],
        },
        include: { teacher: true },
      });

      // 2. Tìm theo tên lớp hoặc mô tả
      if (!targetClass) {
        targetClass = await prisma.class.findFirst({
          where: {
            OR: [
              { name: { contains: code.trim(), mode: "insensitive" } },
              { description: { contains: code.trim(), mode: "insensitive" } },
            ],
          },
          include: { teacher: true },
        });
      }

      // 3. Fallback: Quét danh sách lớp khớp 6 ký tự cuối của id (mã lớp tạo ra)
      if (!targetClass) {
        const allClasses = await prisma.class.findMany({
          include: { teacher: true },
        });
        targetClass = allClasses.find(
          (c) =>
            c.id.slice(-6).toUpperCase() === normalizedCode ||
            c.id.toUpperCase().endsWith(normalizedCode) ||
            c.name.trim().toUpperCase() === code.trim().toUpperCase()
        );
      }

      // Nếu là mã demo HANYU3A mà chưa có lớp, tìm hoặc tạo lớp
      if (!targetClass && (normalizedCode === "HANYU3A" || normalizedCode.includes("HANYU"))) {
        let teacher = await prisma.user.findFirst({
          where: { role: "TEACHER" },
        });

        if (!teacher) {
          teacher = await prisma.user.create({
            data: {
              username: "teacher",
              name: "Nguyễn Thảo (Cô Ning Ning)",
              email: "coningning@ningning.edu.vn",
              passwordHash: "teacher123",
              role: "TEACHER",
              status: "ACTIVE",
            },
          });
        }

        targetClass = await prisma.class.create({
          data: {
            name: "Lớp HSK 3 Chuẩn Quốc Tế (HANYU3A)",
            level: 3,
            teacherId: teacher.id,
            description: "Lớp học chuẩn HSK 3.0 với cô Ning Ning",
            isActive: true,
          },
          include: { teacher: true },
        });
      }
    }

    // Luôn ghi danh học sinh vào lớp nếu tìm thấy targetClass (bằng classId hoặc classCode)
    if (targetClass) {
      await prisma.classStudent.upsert({
        where: {
          classId_studentId: {
            classId: targetClass.id,
            studentId: student.id,
          },
        },
        update: {},
        create: {
          classId: targetClass.id,
          studentId: student.id,
        },
      }).catch((e) => {
        console.error("classStudent upsert error:", e);
      });

      enrolledClassInfo = {
        id: targetClass.id,
        name: targetClass.name,
        level: targetClass.level,
        teacherName: targetClass.teacher?.name || "Cô Ning Ning",
        teacherAvatar: targetClass.teacher?.avatar || "/theme/avatar-teacher.jpg",
        code: targetClass.name.includes("1A")
          ? "HSK1A"
          : targetClass.name.includes("HANYU3A")
          ? "HANYU3A"
          : targetClass.id.slice(-6).toUpperCase(),
      };
    }

    // Ghi audit log hoàn thành onboarding
    await prisma.auditLog.create({
      data: {
        userId: student.id,
        action: "COMPLETE_ONBOARDING",
        entity: "StudyProfile",
        details: JSON.stringify({
          learningMode: learningMode || "SELF",
          mainTrack: mainTrack || "hsk",
          major: major || null,
          currentLevel: currentLevel || "beginner",
          dailyTime: dailyTime || 30,
          classCode: classCode || null,
        }),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Thiết lập lộ trình học tập thành công!",
      profile: {
        hskLevel: targetHskLevel,
        learningMode: learningMode || "SELF",
        mainTrack: mainTrack || "hsk",
        major: major || null,
        currentLevel: currentLevel || "beginner",
        dailyTime: dailyTime || 30,
        enrolledClass: enrolledClassInfo,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/auth/onboarding error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi lưu thông tin thiết lập học tập." },
      { status: 500 }
    );
  }
}
