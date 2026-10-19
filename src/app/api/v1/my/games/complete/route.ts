import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, score, maxCombo, gameType } = body;

    const student = await prisma.user.findFirst({
      where: { username: username || "student" },
    });
    if (!student) {
      return NextResponse.json({ success: false, message: "Không tìm thấy học sinh" }, { status: 404 });
    }

    const earnedXp = Math.min(Math.max(Number(score) || 10, 5), 100);

    // Lưu phiên chơi
    await prisma.gameSession.create({
      data: {
        studentId: student.id,
        gameType: gameType || "PINYIN_MATCH",
        score: Number(score) || 0,
        xpEarned: earnedXp,
      },
    });

    // Cộng XP cho học sinh
    const updatedUser = await prisma.user.update({
      where: { id: student.id },
      data: { totalXp: { increment: earnedXp } },
    });

    // Ghi nhật ký XP
    await prisma.xpLog.create({
      data: {
        studentId: student.id,
        amount: earnedXp,
        source: "GAME_PLAY",
        reason: `Hoàn thành trò chơi Ghép Chữ Hán - Pinyin (Combo x${maxCombo || 1})`,
      },
    });

    return NextResponse.json({
      success: true,
      earnedXp,
      totalXp: updatedUser.totalXp,
      message: `Đã cộng ${earnedXp} XP vào tài khoản!`,
    });
  } catch (error) {
    console.error("POST /my/games/complete error:", error);
    return NextResponse.json({ success: false, message: "Lỗi lưu kết quả game" }, { status: 500 });
  }
}
