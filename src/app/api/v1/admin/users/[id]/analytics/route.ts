import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        currentHskLevel: true,
        totalXp: true,
        streakDays: true,
        dailyAiQuota: true,
        aiUsageToday: true,
        createdAt: true,
        updatedAt: true,
        enrolledClasses: {
          select: {
            id: true,
            joinedAt: true,
            class: {
              select: {
                id: true,
                name: true,
                level: true,
                teacher: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        attempts: {
          orderBy: { submittedAt: "desc" },
          take: 30,
          select: {
            id: true,
            score: true,
            status: true,
            teacherNote: true,
            startedAt: true,
            submittedAt: true,
            assignment: {
              select: {
                id: true,
                title: true,
                mode: true,
                dueAt: true,
              },
            },
          },
        },
        xpLogs: {
          orderBy: { createdAt: "desc" },
          take: 40,
          select: {
            id: true,
            amount: true,
            reason: true,
            createdAt: true,
          },
        },
        gameSessions: {
          orderBy: { playedAt: "desc" },
          take: 15,
          select: {
            id: true,
            gameType: true,
            score: true,
            durationSec: true,
            playedAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy học viên." },
        { status: 404 }
      );
    }

    // Thống kê nhanh từ vựng (Leitner Box 5 = thuộc làu, 1-4 = đang học)
    const masteredVocabCount = await prisma.vocabProgress.count({
      where: { studentId: id, leitnerBox: { gte: 4 } },
    });
    const totalVocabCount = await prisma.vocabProgress.count({
      where: { studentId: id },
    });

    // Lấy 15 từ vựng gần nhất
    const recentVocab = await prisma.vocabProgress.findMany({
      where: { studentId: id },
      orderBy: { lastReviewedAt: "desc" },
      take: 15,
      select: {
        id: true,
        leitnerBox: true,
        correctStreak: true,
        lastReviewedAt: true,
        vocabulary: {
          select: {
            id: true,
            hanzi: true,
            pinyin: true,
            meaningVi: true,
          },
        },
      },
    });

    const attemptsCount = await prisma.attempt.count({
      where: { studentId: id },
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...user,
          _count: {
            attempts: attemptsCount,
            vocabProgress: totalVocabCount,
          },
        },
        vocabStats: {
          mastered: masteredVocabCount,
          learning: Math.max(0, totalVocabCount - masteredVocabCount),
          total: totalVocabCount,
          recent: recentVocab,
        },
      },
    });
  } catch (error: any) {
    console.error("Lỗi lấy chi tiết học tập học sinh:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi máy chủ khi lấy dữ liệu học viên." },
      { status: 500 }
    );
  }
}
