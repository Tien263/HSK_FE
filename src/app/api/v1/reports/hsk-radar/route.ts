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

    // 1. Lấy tất cả câu trả lời của học sinh từ các bài làm
    const answers = await prisma.attemptAnswer.findMany({
      where: {
        attempt: { studentId: student.id },
      },
      include: {
        question: true,
      },
    });

    // 2. Thống kê từ vựng SRS
    const vocabCount = await prisma.vocabProgress.count({
      where: { studentId: student.id },
    });
    const vocabMasteredCount = await prisma.vocabProgress.count({
      where: { studentId: student.id, leitnerBox: { gte: 3 } },
    });

    // 3. Thống kê điểm hoạt động khẩu ngữ và viết từ XpLog
    const xpLogs = await prisma.xpLog.findMany({
      where: { studentId: student.id },
    });

    const speakingLogs = xpLogs.filter(
      (l) => l.source === "AI_SPEAKING" || l.reason.includes("khẩu ngữ") || l.reason.includes("phát âm")
    );
    const writingLogs = xpLogs.filter(
      (l) => l.source === "AI_WRITING" || l.reason.includes("viết") || l.reason.includes("ngữ pháp")
    );

    // 4. Phân bổ điểm cho 5 kỹ năng
    let listeningTotal = 0;
    let listeningCorrect = 0;
    let readingTotal = 0;
    let readingCorrect = 0;
    let writingTotal = 0;
    let writingCorrect = 0;

    for (const ans of answers) {
      const skill = (ans.question.skill || "READING").toUpperCase();
      if (skill.includes("LISTEN")) {
        listeningTotal++;
        if (ans.isCorrect) listeningCorrect++;
      } else if (skill.includes("WRITE") || skill.includes("GRAMMAR")) {
        writingTotal++;
        if (ans.isCorrect) writingCorrect++;
      } else {
        readingTotal++;
        if (ans.isCorrect) readingCorrect++;
      }
    }

    // Tính điểm % (Mặc định baseline 60% nếu mới bắt đầu, cộng dần theo kết quả thực tế)
    const listeningScore =
      listeningTotal > 0
        ? Math.round((listeningCorrect / listeningTotal) * 100)
        : Math.min(85, 50 + speakingLogs.length * 5);

    const readingScore =
      readingTotal > 0
        ? Math.round((readingCorrect / readingTotal) * 100)
        : Math.min(80, 55 + (vocabMasteredCount > 0 ? 15 : 5));

    const writingScore =
      writingTotal > 0
        ? Math.round((writingCorrect / writingTotal) * 100)
        : Math.min(90, 50 + writingLogs.length * 8);

    const speakingScore = Math.min(95, 60 + speakingLogs.length * 6);

    const vocabScore =
      vocabCount > 0 ? Math.min(100, Math.round((vocabMasteredCount / vocabCount) * 100) || 65) : 55;

    // Điểm tổng hợp và dự đoán đỗ HSK
    const averageScore = Math.round(
      (listeningScore + readingScore + writingScore + speakingScore + vocabScore) / 5
    );

    // Tính xác suất đỗ HSK (chuẩn Hanban yêu cầu >= 60% tổng điểm)
    const passProbability = Math.min(98, Math.max(30, Math.round(averageScore * 0.95 + 5)));

    // Chẩn đoán điểm mạnh & điểm cần cải thiện
    const skills = [
      { name: "Nghe hiểu", key: "listening", score: listeningScore, total: listeningTotal, correct: listeningCorrect },
      { name: "Đọc hiểu", key: "reading", score: readingScore, total: readingTotal, correct: readingCorrect },
      { name: "Viết & Ngữ pháp", key: "writing", score: writingScore, total: writingTotal, correct: writingCorrect },
      { name: "Khẩu ngữ & Phát âm", key: "speaking", score: speakingScore, count: speakingLogs.length },
      { name: "Từ vựng & Chữ Hán", key: "vocab", score: vocabScore, count: vocabCount, mastered: vocabMasteredCount },
    ];

    const sortedByScore = [...skills].sort((a, b) => b.score - a.score);
    const strongestSkill = sortedByScore[0];
    const weakestSkill = sortedByScore[sortedByScore.length - 1];

    let recommendation = "";
    if (weakestSkill.key === "listening") {
      recommendation = "Hãy luyện thêm phần Nghe trong đề thi thử và nghe đoạn hội thoại bài học thường xuyên.";
    } else if (weakestSkill.key === "speaking") {
      recommendation = "Nên dành 10 phút mỗi ngày luyện tính năng Khẩu ngữ AI và chỉnh thanh điệu 4 thanh.";
    } else if (weakestSkill.key === "writing") {
      recommendation = "Tập đặt câu ngắn mỗi ngày với tính năng Sửa viết AI để củng cố trật tự từ và lượng từ.";
    } else if (weakestSkill.key === "vocab") {
      recommendation = "Mỗi ngày mở Sổ tay từ vựng lật 10 thẻ Flashcard để đưa từ lên Hộp Leitner 4 & 5.";
    } else {
      recommendation = "Luyện thêm các bài đọc hiểu và hoàn thành các bài tập về nhà đúng hạn.";
    }

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          username: student.username,
          currentHskLevel: student.currentHskLevel,
        },
        skills: {
          listening: listeningScore,
          reading: readingScore,
          writing: writingScore,
          speaking: speakingScore,
          vocab: vocabScore,
        },
        averageScore,
        passProbability,
        strongestSkill: strongestSkill.name,
        weakestSkill: weakestSkill.name,
        recommendation,
      },
    });
  } catch (error) {
    console.error("GET /api/v1/reports/hsk-radar error:", error);
    return NextResponse.json({ success: false, message: "Lỗi tính toán chỉ số năng lực" }, { status: 500 });
  }
}
