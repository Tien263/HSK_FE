import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || auth.role !== "STUDENT") {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập học sinh." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const levelParam = searchParams.get("level");
    const requestedLevel = levelParam ? Math.max(1, Math.min(9, Number(levelParam) || 1)) : null;

    // Lấy log tiến trình tự học từ AuditLog
    const logs = await prisma.auditLog.findMany({
      where: {
        userId: auth.id,
        action: "SELF_STUDY_PROGRESS_SYNC",
        entity: { startsWith: "SelfStudyProgress:" },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const progressByLevel: Record<number, number[]> = {};
    for (const log of logs) {
      const match = log.entity.match(/SelfStudyProgress:(\d+)/);
      if (match) {
        const lvl = Number(match[1]);
        if (!progressByLevel[lvl]) {
          try {
            const data = JSON.parse(log.details || "{}");
            if (Array.isArray(data.unlockedLessons) && data.unlockedLessons.length > 0) {
              progressByLevel[lvl] = data.unlockedLessons;
            }
          } catch {}
        }
      }
    }

    // Đảm bảo các cấp độ tối thiểu có [1, 2]
    for (let l = 1; l <= 6; l++) {
      if (!progressByLevel[l]) {
        progressByLevel[l] = [1, 2];
      }
    }

    if (requestedLevel) {
      return NextResponse.json({
        success: true,
        level: requestedLevel,
        unlockedLessons: progressByLevel[requestedLevel] || [1, 2],
      });
    }

    return NextResponse.json({
      success: true,
      progressByLevel,
    });
  } catch (error: any) {
    console.error("Self study progress GET error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ khi tải tiến trình tự học." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth || auth.role !== "STUDENT") {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập học sinh." }, { status: 401 });
    }

    const body = await request.json();
    const level = Math.max(1, Math.min(9, Number(body.level) || 1));
    const nextLessonNumber = Number(body.nextLessonNumber);
    const completedLessonNumber = Number(body.completedLessonNumber);
    const existingUnlocked: number[] = Array.isArray(body.unlockedLessons) ? body.unlockedLessons : [1, 2];

    const updatedUnlocked = Array.from(new Set([
      ...existingUnlocked,
      ...(nextLessonNumber ? [nextLessonNumber] : []),
      ...(completedLessonNumber ? [completedLessonNumber, completedLessonNumber + 1] : []),
    ])).sort((a, b) => a - b);

    // Tặng XP thưởng khi vượt ải thành công
    const xpReward = Number(body.xpReward) || 50;
    let newTotalXp = 0;

    await prisma.$transaction(async (tx) => {
      // 1. Cập nhật User XP
      const updatedUser = await tx.user.update({
        where: { id: auth.id },
        data: {
          totalXp: { increment: xpReward },
          currentHskLevel: level,
          updatedAt: new Date(),
        },
        select: { totalXp: true },
      });
      newTotalXp = updatedUser.totalXp;

      // 2. Ghi nhận XpLog
      await tx.xpLog.create({
        data: {
          studentId: auth.id,
          amount: xpReward,
          source: "PRACTICE",
          reason: completedLessonNumber
            ? `Vượt ải thông quan Bài ${completedLessonNumber} (HSK ${level})`
            : `Mở khóa tiến trình HSK ${level}`,
        },
      });

      // 3. Ghi vết tiến trình tự học lên AuditLog
      await tx.auditLog.create({
        data: {
          userId: auth.id,
          action: "SELF_STUDY_PROGRESS_SYNC",
          entity: `SelfStudyProgress:${level}`,
          details: JSON.stringify({
            level,
            unlockedLessons: updatedUnlocked,
            completedLesson: completedLessonNumber || null,
            unlockedNext: nextLessonNumber || null,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: completedLessonNumber
        ? `🎉 Chúc mừng bạn đã thông quan Bài ${completedLessonNumber}! Đã mở khóa Bài ${completedLessonNumber + 1} (+${xpReward} XP).`
        : `Đã lưu tiến trình tự học HSK ${level}.`,
      level,
      unlockedLessons: updatedUnlocked,
      totalXp: newTotalXp,
      xpGained: xpReward,
    });
  } catch (error: any) {
    console.error("Self study progress POST error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ khi lưu tiến trình tự học." }, { status: 500 });
  }
}
