import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { progressId, remembered } = await request.json();

    const progress = await prisma.vocabProgress.findUnique({
      where: { id: progressId },
    });

    if (!progress) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tiến trình từ vựng" }, { status: 404 });
    }

    // Quy tắc Leitner (BR-08): 5 hộp, khoảng ôn 1, 2, 4, 7, 15 ngày. Đúng thì lên hộp, sai về hộp 1.
    const intervals = [1, 2, 4, 7, 15];
    let newBox = progress.leitnerBox;
    let nextDays = 1;

    if (remembered) {
      newBox = Math.min(5, newBox + 1);
      nextDays = intervals[newBox - 1] || 15;
    } else {
      newBox = 1;
      nextDays = 1;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextDays);

    const updated = await prisma.vocabProgress.update({
      where: { id: progressId },
      data: {
        leitnerBox: newBox,
        nextReviewAt: nextReviewDate,
        correctStreak: remembered ? { increment: 1 } : 0,
        lastReviewedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi cập nhật thẻ nhớ" }, { status: 500 });
  }
}
