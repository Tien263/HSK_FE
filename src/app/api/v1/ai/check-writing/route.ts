import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeDictionaryPinyin } from "@/lib/dictionary-search";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, lessonNumber = 1, hskLevel = 1 } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập câu hoặc đoạn văn tiếng Trung." },
        { status: 400 }
      );
    }

    const rawText = text.trim();

    // 1. Phân tích các chữ Hán và từ vựng trong văn bản
    // Tách các từ đơn và từ ghép 2-4 ký tự
    const hanziMatches = rawText.match(/[\p{Script=Han}]+/gu) || [];
    const detectedWords: string[] = [];

    for (const segment of hanziMatches) {
      if (segment.length <= 4) {
        detectedWords.push(segment);
      } else {
        // Tách thành các từ 2 chữ hoặc 1 chữ
        for (let i = 0; i < segment.length; i += 2) {
          detectedWords.push(segment.slice(i, Math.min(i + 2, segment.length)));
        }
      }
    }

    // 2. Tra cứu trực tiếp vào Kho Từ Điển CSDL (Prisma DictionaryEntry)
    const uniqueWords = Array.from(new Set(detectedWords));
    const dictionaryRecords = await prisma.dictionaryEntry.findMany({
      where: {
        simplified: { in: uniqueWords },
      },
      select: {
        id: true,
        simplified: true,
        pinyin: true,
        definitionsVi: true,
      },
      take: 50,
    });

    const dictMap = new Map<string, { pinyin: string; meaning: string }>();
    dictionaryRecords.forEach((item) => {
      dictMap.set(item.simplified, {
        pinyin: item.pinyin,
        meaning: item.definitionsVi?.[0] || "Từ vựng tiếng Trung",
      });
    });

    // 3. Phân tích ngữ pháp chuyên sâu (Grammar & Syntax Rules Engine)
    const issues: Array<{
      type: "WORD_ORDER" | "MEASURE_WORD" | "PARTICLE" | "SPELLING";
      original: string;
      suggestion: string;
      reason: string;
    }> = [];

    let correctedText = rawText;

    // Rule A: Kiểm tra vị trí trạng từ chỉ thời gian / nơi chốn
    // Trong tiếng Trung, thời gian / nơi chốn đứng trước động từ (Subject + Time + Verb)
    // Ví dụ sai: 我去学校明天 -> Sửa: 我明天去学校
    if (/去.*(明天|今天|昨天|晚上|早上)/u.test(rawText)) {
      issues.push({
        type: "WORD_ORDER",
        original: "Trạng từ chỉ thời gian đặt sau động từ",
        suggestion: "Đưa từ chỉ thời gian (今天, 明天, 晚上...) lên trước động từ",
        reason: "Quy tắc ngữ pháp tiếng Trung: Trạng từ chỉ thời gian luôn đứng trước động từ (Chủ ngữ + Thời gian + Động từ).",
      });
      correctedText = correctedText
        .replace(/(去[^\s,。！？]+)(明天|今天|昨天|晚上|早上)/u, "$2$1");
    }

    // Rule B: Kiểm tra lượng từ 个, 杯, 本, 张
    // Ví dụ sai: 我买两苹果 -> Sửa: 我买两个苹果
    if (/(一|两|三|四|五|六|七|八|九|十)(苹果|手机|电影|学生|老师|人)(?!个)/u.test(rawText)) {
      issues.push({
        type: "MEASURE_WORD",
        original: "Thiếu lượng từ '个' giữa số từ và danh từ",
        suggestion: "Thêm lượng từ '个' (ví dụ: 两个苹果, 一个手机)",
        reason: "Trong tiếng Trung, giữa số từ và danh từ bắt buộc phải có lượng từ thích hợp.",
      });
      correctedText = correctedText.replace(
        /(一|两|三|四|五|六|七|八|九|十)(苹果|手机|电影|学生|老师|人)/gu,
        "$1个$2"
      );
    }

    // Rule C: Nhầm lẫn giữa 两 và 二
    // Trước lượng từ dùng 两, không dùng 二 (Ví dụ sai: 二个 -> Sửa: 两个)
    if (/二个/u.test(rawText)) {
      issues.push({
        type: "MEASURE_WORD",
        original: "二个",
        suggestion: "两个",
        reason: "Khi đứng trước lượng từ để đếm số lượng sự vật, phải dùng '两' (liǎng) thay vì '二' (èr).",
      });
      correctedText = correctedText.replace(/二个/gu, "两个");
    }

    // Rule D: Câu hỏi với 吗 không đi kèm đại từ nghi vấn 什么, 谁, 哪儿
    // Ví dụ sai: 你叫什么名字吗？ -> Sửa: 你叫什么名字？
    if (/(什么|谁|哪儿|几|多少).*吗/u.test(rawText)) {
      issues.push({
        type: "PARTICLE",
        original: "...吗 trong câu có từ để hỏi",
        suggestion: "Bỏ trợ từ nghi vấn '吗'",
        reason: "Khi câu đã có đại từ nghi vấn (什么, 谁, 哪儿, 多少) thì không dùng thêm trợ từ '吗' ở cuối câu nữa.",
      });
      correctedText = correctedText.replace(/([^\s,。！？]+)(什么|谁|哪儿|几|多少)([^?？]*)[吗|嗎][?？]?/u, "$1$2$3？");
    }

    // Rule E: Phó từ 也, 都 phải đứng trước động từ/tính từ
    if (/(很|是|在).*(也|都)/u.test(rawText)) {
      issues.push({
        type: "WORD_ORDER",
        original: "Vị trí phó từ 也 / 都",
        suggestion: "Đặt 也 hoặc 都 trước động từ (也去, 也是, 都好)",
        reason: "Phó từ chỉ sự đồng nhất '也' (cũng) và '都' (đều) luôn phải đứng trước động từ hoặc tính từ.",
      });
    }

    // 4. Gọi LLM bổ trợ nếu có API key để nâng cấp văn phong bản xứ (Native Polish)
    let nativePolish = correctedText;
    let pedagogicalComment = "Bài viết có cấu trúc rõ ràng. Hãy chú ý trật tự từ và vị trí lượng từ để câu văn tự nhiên hơn.";

    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const qwenKey = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;

    if (qwenKey || geminiKey || openAiKey) {
      try {
        const prompt = `Bạn là chuyên gia ngôn ngữ tiếng Trung HSK. Hãy kiểm tra đoạn văn sau:
"${rawText}"
Trả về định dạng JSON thuần túy:
{
  "nativePolish": "Câu văn viết lại trau chuốt, tự nhiên nhất chuẩn người bản xứ",
  "pedagogicalComment": "Lời nhận xét sư phạm khuyến khích và hướng dẫn học sinh bằng tiếng Việt (2-3 câu)"
}`;
        if (qwenKey) {
          const qRes = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${qwenKey}` },
            body: JSON.stringify({
              model: "qwen-turbo",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.3,
            }),
          });
          const qData = await qRes.json();
          const contentStr = qData?.choices?.[0]?.message?.content || "";
          const parsed = JSON.parse(contentStr.replace(/```json|```/g, "").trim());
          if (parsed.nativePolish) nativePolish = parsed.nativePolish;
          if (parsed.pedagogicalComment) pedagogicalComment = parsed.pedagogicalComment;
        }
      } catch (e) {
        console.warn("LLM polish fallback:", e);
      }
    }

    // Tính điểm dựa trên số lỗi
    let score = 100;
    if (issues.length === 1) score = 88;
    else if (issues.length === 2) score = 76;
    else if (issues.length === 3) score = 65;
    else if (issues.length >= 4) score = Math.max(40, 60 - issues.length * 6);

    // Chuẩn bị danh sách từ vựng tra cứu từ điển
    const vocabBreakdown = uniqueWords.slice(0, 15).map((w) => {
      const info = dictMap.get(w);
      return {
        hanzi: w,
        pinyin: info?.pinyin || "",
        meaning: info?.meaning || "Từ vựng tiếng Trung",
      };
    });

    return NextResponse.json({
      success: true,
      originalText: rawText,
      score,
      correctedText,
      nativePolish,
      pedagogicalComment,
      issuesCount: issues.length,
      issues,
      vocabBreakdown,
    });
  } catch (error: any) {
    console.error("POST /api/v1/ai/check-writing error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi kiểm tra bài viết" },
      { status: 500 }
    );
  }
}
