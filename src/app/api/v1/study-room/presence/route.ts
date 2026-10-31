import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request);

    // Lấy danh sách học sinh thật có hoạt động từ User table
    const realStudents = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        username: true,
        currentHskLevel: true,
        totalXp: true,
        streakDays: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 12,
    });

    // Lấy log presence mới nhất trong 24h
    const presenceLogs = await prisma.auditLog.findMany({
      where: {
        action: "STUDY_ROOM_PRESENCE",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const activeMinutesMap = new Map<string, number>();
    for (const log of presenceLogs) {
      if (log.userId && !activeMinutesMap.has(log.userId)) {
        try {
          const details = JSON.parse(log.details || "{}");
          if (details.minutes) {
            activeMinutesMap.set(log.userId, Number(details.minutes));
          }
        } catch {}
      }
    }

    const students = realStudents.map((s) => {
      // Thời gian học thật: từ log presence hoặc ước tính từ totalXp
      const recordedMin = activeMinutesMap.get(s.id);
      const minutes = recordedMin !== undefined ? recordedMin : Math.max(15, Math.min(180, Math.floor(s.totalXp / 10)));
      return {
        id: s.id,
        name: s.name || s.username || "Đồng môn",
        hsk: `HSK ${s.currentHskLevel || 1}`,
        minutes,
        streakDays: s.streakDays || 1,
        isCurrent: auth?.id === s.id,
      };
    });

    return NextResponse.json({
      success: true,
      students,
    });
  } catch (error: any) {
    console.error("Study room presence GET error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tải phòng học." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập." }, { status: 401 });
    }

    const body = await request.json();
    const minutes = Math.max(1, Number(body.minutes) || 1);

    await prisma.auditLog.create({
      data: {
        userId: auth.id,
        action: "STUDY_ROOM_PRESENCE",
        entity: `StudyRoom:${auth.id}`,
        details: JSON.stringify({ minutes, timestamp: new Date().toISOString() }),
      },
    });

    return NextResponse.json({ success: true, minutes });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Lỗi cập nhật hiện diện." }, { status: 500 });
  }
}
