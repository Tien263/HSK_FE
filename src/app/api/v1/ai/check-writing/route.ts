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

    // Rule F: Phủ định động từ '有' bằng '不' (Sai: 不有 -> Sửa: 没有)
    if (/不有/u.test(rawText)) {
      issues.push({
        type: "SPELLING",
        original: "不有",
        suggestion: "没有",
        reason: "Trong tiếng Trung, phủ định của động từ '有' bắt buộc phải dùng '没' (没有), không bao giờ dùng '不有'.",
      });
      correctedText = correctedText.replace(/不有/gu, "没有");
    }

    // Rule G: Nhầm lẫn tính từ với '是' (Sai: 我是好 -> Sửa: 我很好)
    if (/是(好|忙|高兴|大|小|累|冷|热)(?!的)/u.test(rawText)) {
      issues.push({
        type: "WORD_ORDER",
        original: "Dùng '是' trước tính từ đơn",
        suggestion: "Thay '是' bằng phó từ mức độ '很' (ví dụ: 很好, 很忙)",
        reason: "Trong câu vị ngữ hình dung từ, tiếng Trung không dùng hệ từ '是' trước tính từ mà dùng phó từ mức độ như '很'.",
      });
      correctedText = correctedText.replace(/是(好|忙|高兴|大|小|累|冷|热)/gu, "很$1");
    }

    // 4. Gọi LLM chuyên gia để chấm điểm thật, phát hiện lỗi ngữ pháp & diễn đạt tự nhiên
    let nativePolish = correctedText;
    let pedagogicalComment = "Bài viết cần chú ý rèn luyện thêm trật tự câu và cách kết hợp từ vựng chuẩn xác.";
    let llmScore: number | null = null;

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const qwenKey = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    const promptText = `Bạn là giám khảo chấm thi HSK và chuyên gia ngữ pháp tiếng Trung chuẩn mực.
Hãy đánh giá bài viết tiếng Trung sau đây của học sinh (HSK ${hskLevel}):
"${rawText}"

Yêu cầu chấm điểm và nhận xét cực kỳ nghiêm túc, chuẩn xác:
1. ĐÁNH GIÁ LỖI: Tìm TẤT CẢ các lỗi sai về: ngữ pháp, trật tự từ (Word Order), dùng sai từ (Wrong Word), nhầm thanh điệu/chính tả, thiếu lượng từ, thừa thiếu trợ từ.
2. CHẤM ĐIỂM (score từ 0 đến 100):
   - Nếu có lỗi sai ngữ pháp hoặc dùng từ sai: Chấm từ 40 đến 75 điểm (tùy mức độ nghiêm trọng). TUYỆT ĐỐI KHÔNG CHO 90-100 ĐIỂM KHI CÓ LỖI SAI!
   - Nếu câu hoàn toàn chuẩn xác, tự nhiên như người bản xứ: Mới cho 90-100 điểm.
3. TRẢ VỀ DUY NHẤT một chuỗi JSON thuần túy (không bọc markdown, không thêm chữ thừa):
{
  "score": 65,
  "correctedText": "Đoạn văn sau khi đã sửa toàn bộ các lỗi ngữ pháp",
  "nativePolish": "Câu văn viết lại mượt mà, tự nhiên nhất chuẩn người bản xứ",
  "pedagogicalComment": "Lời nhận xét sư phạm chi tiết bằng tiếng Việt chỉ rõ lỗi sai và cách khắc phục (2-3 câu)",
  "issues": [
    {
      "type": "WORD_ORDER",
      "original": "Cụm từ bị sai",
      "suggestion": "Cách sửa đúng",
      "reason": "Giải thích quy tắc ngữ pháp bằng tiếng Việt"
    }
  ]
}`;

    // A. Thử gọi GEMINI API nếu có key
    if (geminiKey) {
      try {
        const geminiModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
        for (const model of geminiModels) {
          try {
            const gRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: promptText }] }],
                  generationConfig: { temperature: 0.2 },
                }),
              }
            );
            if (gRes.ok) {
              const gData = await gRes.json();
              const raw = gData?.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json|```/g, "").trim();
              if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed.score === "number") llmScore = parsed.score;
                if (parsed.correctedText) correctedText = parsed.correctedText;
                if (parsed.nativePolish) nativePolish = parsed.nativePolish;
                if (parsed.pedagogicalComment) pedagogicalComment = parsed.pedagogicalComment;
                if (Array.isArray(parsed.issues) && parsed.issues.length > 0) {
                  // Hợp nhất lỗi từ LLM
                  parsed.issues.forEach((iss: any) => {
                    if (!issues.some((ex) => ex.original === iss.original)) {
                      issues.push(iss);
                    }
                  });
                }
                break;
              }
            }
          } catch (errInner) {
            continue;
          }
        }
      } catch (e) {
        console.warn("Gemini check-writing error:", e);
      }
    }

    // B. Thử gọi GROQ nếu có key và chưa xong
    if (llmScore === null && groqKey) {
      try {
        const grRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are an expert native Chinese teacher. Respond ONLY in valid JSON." },
              { role: "user", content: promptText },
            ],
            temperature: 0.2,
          }),
        });
        if (grRes.ok) {
          const grData = await grRes.json();
          const raw = grData.choices?.[0]?.message?.content?.replace(/```json|```/g, "").trim();
          if (raw) {
            const parsed = JSON.parse(raw);
            if (typeof parsed.score === "number") llmScore = parsed.score;
            if (parsed.correctedText) correctedText = parsed.correctedText;
            if (parsed.nativePolish) nativePolish = parsed.nativePolish;
            if (parsed.pedagogicalComment) pedagogicalComment = parsed.pedagogicalComment;
            if (Array.isArray(parsed.issues) && parsed.issues.length > 0) {
              parsed.issues.forEach((iss: any) => {
                if (!issues.some((ex) => ex.original === iss.original)) {
                  issues.push(iss);
                }
              });
            }
          }
        }
      } catch (e) {
        console.warn("Groq check-writing error:", e);
      }
    }

    // C. Thử gọi QWEN nếu có key và chưa xong
    if (llmScore === null && qwenKey) {
      try {
        const qRes = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${qwenKey}` },
          body: JSON.stringify({
            model: "qwen-turbo",
            messages: [
              { role: "system", content: "You are an expert Chinese teacher. Output only JSON." },
              { role: "user", content: promptText },
            ],
            temperature: 0.2,
          }),
        });
        if (qRes.ok) {
          const qData = await qRes.json();
          const contentStr = qData?.choices?.[0]?.message?.content || "";
          const parsed = JSON.parse(contentStr.replace(/```json|```/g, "").trim());
          if (typeof parsed.score === "number") llmScore = parsed.score;
          if (parsed.correctedText) correctedText = parsed.correctedText;
          if (parsed.nativePolish) nativePolish = parsed.nativePolish;
          if (parsed.pedagogicalComment) pedagogicalComment = parsed.pedagogicalComment;
          if (Array.isArray(parsed.issues) && parsed.issues.length > 0) {
            parsed.issues.forEach((iss: any) => {
              if (!issues.some((ex) => ex.original === iss.original)) {
                issues.push(iss);
              }
            });
          }
        }
      } catch (e) {
        console.warn("Qwen check-writing error:", e);
      }
    }

    // Tính điểm cuối cùng: Ưu tiên điểm số thực từ LLM, nếu không có thì tính từ bộ quy tắc
    let score = llmScore !== null ? llmScore : 100;
    if (llmScore === null) {
      if (issues.length === 1) score = 75;
      else if (issues.length === 2) score = 60;
      else if (issues.length === 3) score = 50;
      else if (issues.length >= 4) score = Math.max(30, 45 - issues.length * 5);
      else {
        // Kiểm tra độ dài câu nếu không có lỗi nào
        if (rawText.length < 4) score = 80;
        else score = 95;
      }
    }

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
