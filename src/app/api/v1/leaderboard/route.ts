import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const userIdHeader = request.headers.get("x-user-id");
    const userIdParam = searchParams.get("userId");
    const currentUserId = userIdParam || userIdHeader || "";
    const limit = Math.min(Number(searchParams.get("limit") || 50), 100);

    const whereClause: any = {
      role: "STUDENT",
      status: "ACTIVE",
    };

    if (classId && classId !== "all") {
      whereClause.enrolledClasses = {
        some: {
          classId,
          status: "ACTIVE",
        },
      };
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        totalXp: true,
        streakDays: true,
        currentHskLevel: true,
        _count: {
          select: {
            attempts: true,
          },
        },
      },
      orderBy: [{ totalXp: "desc" }, { streakDays: "desc" }],
      take: limit,
    });

    let currentRank: number | null = null;
    const items = students.map((s, idx) => {
      const rank = idx + 1;
      if (s.id === currentUserId) {
        currentRank = rank;
      }
      return {
        rank,
        id: s.id,
        username: s.username,
        name: s.name || s.username,
        avatar: s.avatar,
        totalXp: s.totalXp,
        streakDays: s.streakDays,
        currentHskLevel: s.currentHskLevel,
        completedCount: s._count.attempts,
      };
    });

    return NextResponse.json({
      success: true,
      items,
      totalStudents: items.length,
      currentUserRank: currentRank,
    });
  } catch (error) {
    console.error("GET /api/v1/leaderboard error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi tải bảng xếp hạng" },
      { status: 500 }
    );
  }
}
