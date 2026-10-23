import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      username,
      learningMode, // 'SELF' | 'CLASS'
      classCode,
      mainTrack,    // 'hsk' | 'topic' | 'major'
      major,        // 'kinhte' | 'ketoan' | 'cntt' | 'khac'
      currentLevel, // 'beginner' | 'intermediate' | 'advanced'
      dailyTime,    // 15 | 30 | 60
    } = body;

    const student = await prisma.user.findFirst({
      where: {
        OR: [
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
    if (classCode && classCode.trim()) {
      const code = classCode.trim();
      const normalizedCode = code.toUpperCase().replace(/\s+/g, "").replace(/-/g, "");

      let targetClass: any = null;

      if (normalizedCode === "HSK1A" || normalizedCode === "HSK1") {
        targetClass = await prisma.class.findFirst({
          where: {
            OR: [
              { name: { contains: "HSK 1A" } },
              { name: { contains: "HSK 1" } },
            ],
          },
          include: { teacher: true },
        });
      }

      if (!targetClass && (normalizedCode === "HANYU3A" || normalizedCode === "HSK3" || normalizedCode.includes("HANYU"))) {
        targetClass = await prisma.class.findFirst({
          where: {
            OR: [
              { name: { contains: "HANYU3A" } },
              { name: { contains: "HSK 3" } },
              { description: { contains: "HANYU3A" } },
            ],
          },
          include: { teacher: true },
        });
      }

      if (!targetClass) {
        targetClass = await prisma.class.findFirst({
          where: {
            OR: [
              { id: code },
              { id: { endsWith: code.toLowerCase() } },
              { name: { contains: code } },
              { description: { contains: code } },
            ],
          },
          include: { teacher: true },
        });
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
        }).catch(() => {});

        enrolledClassInfo = {
          id: targetClass.id,
          name: targetClass.name,
          level: targetClass.level,
          teacherName: targetClass.teacher?.name || "Cô Ning Ning",
        };
      }
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
