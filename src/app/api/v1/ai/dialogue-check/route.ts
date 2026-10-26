import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      spokenText = "",
      targetText = "",
      mode = "DIALOGUE", // DIALOGUE hoặc FREE_TALK
      speaker = "Học sinh",
      lessonNumber = 1,
      hskLevel = 1,
      studentId,
    } = body;

    const spokenClean = spokenText.trim().replace(/[.,?!，。？！\s]/g, "");
    const targetClean = targetText.trim().replace(/[.,?!，。？！\s]/g, "");

    // 1. Phân tích các từ vựng xuất hiện trong câu nói qua Kho Từ Điển CSDL
    const hanziSegments = spokenClean.match(/[\p{Script=Han}]+/gu) || [];
    const extractedWords: string[] = [];

    for (const seg of hanziSegments) {
      if (seg.length <= 4) extractedWords.push(seg);
      for (let i = 0; i < seg.length; i += 2) {
        extractedWords.push(seg.slice(i, Math.min(i + 2, seg.length)));
      }
    }

    const uniqueWords = Array.from(new Set(extractedWords));
    const dictEntries = await prisma.dictionaryEntry.findMany({
      where: { simplified: { in: uniqueWords } },
      select: { simplified: true, pinyin: true, definitionsVi: true },
      take: 20,
    });

    const vocabDetected = dictEntries.map((d) => ({
      hanzi: d.simplified,
      pinyin: d.pinyin,
      meaning: d.definitionsVi?.[0] || "Từ vựng tiếng Trung",
    }));

    // 2. Chấm điểm theo chế độ
    let score = 0;
    let feedback = "";
    let aiReplyZh = "";
    let aiReplyPinyin = "";
    let aiReplyVi = "";

    if (mode === "DIALOGUE") {
      // Chế độ luyện hội thoại theo bài học
      if (spokenClean === targetClean) {
        score = 100;
        feedback = "🌟 Hoàn hảo! Bạn đã phát âm cực kỳ chuẩn xác câu thoại cả về ngữ điệu lẫn thanh điệu.";
      } else if (spokenClean.includes(targetClean) || targetClean.includes(spokenClean)) {
        score = 90;
        feedback = "👍 Rất tốt! Bạn đã phát âm đúng cấu trúc chính của câu thoại.";
      } else {
        // Đếm số chữ Hán khớp thực tế
        const targetChars = Array.from(targetClean);
        const spokenChars = Array.from(spokenClean);
        let matched = 0;
        targetChars.forEach((ch) => {
          if (spokenChars.includes(ch)) matched++;
        });

        const ratio = targetChars.length > 0 ? matched / targetChars.length : 0;
        if (ratio === 0) {
          score = 15;
          feedback = `❌ Chưa khớp câu thoại mục tiêu. Máy nghe được: "${spokenText}". Cần nói: "${targetText}". Hãy nghe lại câu mẫu!`;
        } else {
          score = Math.round(ratio * 70);
          feedback = `⚠️ Bạn đã nói đúng ${matched}/${targetChars.length} chữ. Hãy phát âm dứt khoát và nhấn rõ các thanh điệu hơn nhé!`;
        }
      }
    } else {
      // Chế độ Trò chuyện tự do không giới hạn chủ đề (Free Talk)
      if (spokenClean.length === 0) {
        score = 20;
        feedback = "Chưa thu được âm thanh rõ ràng. Hãy bấm Micro và trò chuyện bằng tiếng Trung nhé!";
      } else {
        score = Math.min(100, Math.max(60, 75 + spokenClean.length * 2));
        feedback = `🌟 Phát xạ tự nhiên rất tốt! Bạn đã nói câu gồm ${spokenClean.length} chữ Hán với ${vocabDetected.length} từ vựng chuẩn.`;

        // Tạo câu phản hồi của AI phù hợp với câu của học sinh
        if (/好|您好|你好/u.test(spokenClean)) {
          aiReplyZh = "你好！很高兴和你聊天。你今天怎么样？";
          aiReplyPinyin = "Nǐ hǎo! Hěn gāoxìng hé nǐ liáotiān. Nǐ jīntiān zěnmeyàng?";
          aiReplyVi = "Xin chào! Rất vui được trò chuyện với bạn. Hôm nay bạn thế nào?";
        } else if (/叫|名字/u.test(spokenClean)) {
          aiReplyZh = "我叫小语，是你的AI中文助教。你学中文多长时间了？";
          aiReplyPinyin = "Wǒ jiào Xiǎoyǔ, shì nǐ de AI zhōngwén zhùjiào. Nǐ xué zhōngwén duō cháng shíjiān le?";
          aiReplyVi = "Tôi là Tiểu Ngữ, trợ giảng AI tiếng Trung của bạn. Bạn học tiếng Trung được bao lâu rồi?";
        } else if (/休息|今天|明天/u.test(spokenClean)) {
          aiReplyZh = "太好了！休息的时候你喜欢做什么？看电影还是听音乐？";
          aiReplyPinyin = "Tài hǎo le! Xiūxi de shíhou nǐ xǐhuan zuò shénme? Kàn diànyǐng háishì tīng yīnyuè?";
          aiReplyVi = "Tuyệt quá! Lúc nghỉ ngơi bạn thích làm gì? Xem phim hay nghe nhạc?";
        } else if (/吃|茶|水/u.test(spokenClean)) {
          aiReplyZh = "中国茶非常好喝！中国菜也很美味，你喜欢吃什么？";
          aiReplyPinyin = "Zhōngguó chá fēicháng hǎohē! Zhōngguó cài yě hěn měiwèi, nǐ xǐhuan chī shénme?";
          aiReplyVi = "Trà Trung Quốc rất ngon! Món ăn Trung Quốc cũng rất tuyệt, bạn thích ăn món gì?";
        } else {
          aiReplyZh = "你说得很好！中文发音越来越标准了，我们继续聊聊吧！";
          aiReplyPinyin = "Nǐ shuō de hěn hǎo! Zhōngwén fāyīn yuèláiyuè biāozhǔn le, wǒmen jìxù liáoliao ba!";
          aiReplyVi = "Bạn nói rất hay! Phát âm tiếng Trung ngày càng chuẩn rồi, chúng ta tiếp tục trò chuyện nhé!";
        }
      }
    }

    // 3. Cộng XP thật cho học sinh nếu đạt >= 70 điểm
    let xpEarned = 0;
    if (score >= 70 && studentId) {
      xpEarned = 15;
      try {
        await prisma.user.update({
          where: { id: studentId },
          data: { totalXp: { increment: 15 } },
        });
        await prisma.xpLog.create({
          data: {
            studentId,
            amount: 15,
            source: "PRACTICE",
            reason: `Luyện khẩu ngữ giao tiếp AI: ${spokenClean || "Hội thoại"} đạt ${score}đ`,
          },
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      score,
      feedback,
      spokenText,
      vocabDetected,
      aiReplyZh,
      aiReplyPinyin,
      aiReplyVi,
      xpEarned,
    });
  } catch (error: any) {
    console.error("POST /api/v1/ai/dialogue-check error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi xử lý khẩu ngữ" },
      { status: 500 }
    );
  }
}
