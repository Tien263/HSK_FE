import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdHeader = request.headers.get("x-user-id");
    const studentIdParam = searchParams.get("studentId");
    const username = searchParams.get("username");

    let student = null;
    if (studentIdParam || userIdHeader) {
      student = await prisma.user.findUnique({
        where: { id: studentIdParam || userIdHeader || "" },
      });
    }

    if (!student && username) {
      student = await prisma.user.findFirst({ where: { username } });
    }

    if (!student) {
      return NextResponse.json({ success: false, message: "Không tìm thấy học sinh" }, { status: 404 });
    }

    // Thời điểm bắt đầu của ngày hôm nay (00:00:00)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Lấy tất cả XpLog trong ngày hôm nay của học sinh
    const todayLogs = await prisma.xpLog.findMany({
      where: {
        studentId: student.id,
        createdAt: { gte: todayStart },
      },
    });

    // Kiểm tra xem đã hoàn thành các hoạt động nào hôm nay
    const hasSpeaking = todayLogs.some((l) => l.source === "AI_SPEAKING" || l.reason.includes("khẩu ngữ") || l.reason.includes("phát âm"));
    const hasWriting = todayLogs.some((l) => l.source === "AI_WRITING" || l.reason.includes("viết") || l.reason.includes("ngữ pháp"));
    const hasHanzi = todayLogs.some((l) => l.source === "HANZI_WRITING" || l.reason.includes("chữ Hán") || l.reason.includes("thuận bút"));
    const hasVocabSrs = todayLogs.some((l) => l.source === "PRACTICE" || l.reason.includes("từ vựng") || l.reason.includes("câu sai"));
    const hasMockExam = todayLogs.some((l) => l.source === "EXAM" || l.reason.includes("thi") || l.reason.includes("Attempt"));

    // Kiểm tra các quest đã được nhận thưởng chưa
    const isClaimedSpeaking = todayLogs.some((l) => l.source === "QUEST_CLAIM" && l.reason.includes("QUEST_SPEAKING"));
    const isClaimedWriting = todayLogs.some((l) => l.source === "QUEST_CLAIM" && l.reason.includes("QUEST_WRITING"));
    const isClaimedHanzi = todayLogs.some((l) => l.source === "QUEST_CLAIM" && l.reason.includes("QUEST_HANZI"));
    const isClaimedVocab = todayLogs.some((l) => l.source === "QUEST_CLAIM" && l.reason.includes("QUEST_VOCAB"));
    const isClaimedExam = todayLogs.some((l) => l.source === "QUEST_CLAIM" && l.reason.includes("QUEST_EXAM"));

    const quests = [
      {
        id: "QUEST_SPEAKING",
        title: "🎙️ Luyện Khẩu ngữ AI",
        description: "Hoàn thành 1 lượt luyện nói đối thoại hoặc phát âm câu với AI",
        rewardXp: 30,
        isCompleted: hasSpeaking,
        isClaimed: isClaimedSpeaking,
      },
      {
        id: "QUEST_WRITING",
        title: "✍️ Viết & Sửa lỗi câu AI",
        description: "Tự viết câu tiếng Trung và dùng AI phân tích ngữ pháp",
        rewardXp: 25,
        isCompleted: hasWriting,
        isClaimed: isClaimedWriting,
      },
      {
        id: "QUEST_HANZI",
        title: "🖋️ Luyện chữ Hán thuận bút",
        description: "Luyện viết chữ Hán đúng thứ tự nét trong phòng luyện tập",
        rewardXp: 20,
        isCompleted: hasHanzi,
        isClaimed: isClaimedHanzi,
      },
      {
        id: "QUEST_VOCAB",
        title: "🗂️ Ôn tập từ vựng SRS",
        description: "Ôn tập thẻ nhớ trong Sổ tay từ vựng hoặc khắc phục câu sai",
        rewardXp: 25,
        isCompleted: hasVocabSrs,
        isClaimed: isClaimedVocab,
      },
      {
        id: "QUEST_EXAM",
        title: "🏆 Chiến binh Thi thử HSK",
        description: "Nộp ít nhất 1 bài tập hoặc 1 đề thi mô phỏng HSK",
        rewardXp: 50,
        isCompleted: hasMockExam,
        isClaimed: isClaimedExam,
      },
    ];

    const completedCount = quests.filter((q) => q.isCompleted).length;
    const totalBonusXp = quests.filter((q) => q.isClaimed).reduce((sum, q) => sum + q.rewardXp, 0);

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          username: student.username,
          totalXp: student.totalXp,
          streakDays: student.streakDays,
        },
        quests,
        progress: {
          completedCount,
          totalQuests: quests.length,
          allFinished: completedCount === quests.length,
          totalBonusXp,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/v1/my/daily-quests error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tải nhiệm vụ hàng ngày" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, username, questId } = body;

    let student = null;
    if (studentId) {
      student = await prisma.user.findUnique({ where: { id: studentId } });
    }
    if (!student && username) {
      student = await prisma.user.findFirst({ where: { username } });
    }

    if (!student) {
      return NextResponse.json({ success: false, message: "Không tìm thấy học sinh" }, { status: 404 });
    }

    const questRewards: Record<string, number> = {
      QUEST_SPEAKING: 30,
      QUEST_WRITING: 25,
      QUEST_HANZI: 20,
      QUEST_VOCAB: 25,
      QUEST_EXAM: 50,
    };

    const rewardXp = questRewards[questId] || 20;

    // Kiểm tra xem đã nhận quest này hôm nay chưa
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const alreadyClaimed = await prisma.xpLog.findFirst({
      where: {
        studentId: student.id,
        source: "QUEST_CLAIM",
        reason: { contains: questId },
        createdAt: { gte: todayStart },
      },
    });

    if (alreadyClaimed) {
      return NextResponse.json({ success: false, message: "Bạn đã nhận phần thưởng nhiệm vụ này hôm nay rồi!" }, { status: 400 });
    }

    // Cộng XP và ghi log
    const updatedUser = await prisma.user.update({
      where: { id: student.id },
      data: { totalXp: { increment: rewardXp } },
    });

    await prisma.xpLog.create({
      data: {
        studentId: student.id,
        amount: rewardXp,
        source: "QUEST_CLAIM",
        reason: `Nhận thưởng nhiệm vụ hàng ngày: ${questId} (+${rewardXp} XP)`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Chúc mừng bạn đã nhận +${rewardXp} XP!`,
      totalXp: updatedUser.totalXp,
      rewardXp,
    });
  } catch (error) {
    console.error("POST /api/v1/my/daily-quests error:", error);
    return NextResponse.json({ success: false, message: "Lỗi nhận thưởng nhiệm vụ" }, { status: 500 });
  }
}
