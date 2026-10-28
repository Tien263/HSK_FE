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

    // Rule A: Kiểm tra vị trí trạng từ chỉ thời gian / nơi chốn / người đồng hành
    // Trong tiếng Trung: Thời gian, nơi chốn, đồng hành ĐỨNG TRƯỚC ĐỘNG TỪ (Subject + Time/Place/With + Verb)
    // Ví dụ sai: 我去学校明天, 他看书在图书馆, 我吃饭和朋友一起
    if (/(?:去|来|看|吃|喝|买|学|写|读|做|听|说|玩)[^\s,。！？]*(?:明天|今天|昨天|晚上|早上|中午|现在|去年|明年)/u.test(rawText)) {
      issues.push({
        type: "WORD_ORDER",
        original: "Trạng từ chỉ thời gian đặt sau động từ",
        suggestion: "Đưa từ chỉ thời gian (今天, 明天, 昨天, 晚上...) lên trước động từ",
        reason: "Quy tắc ngữ pháp tiếng Trung: Trạng từ chỉ thời gian luôn đứng trước động từ (Chủ ngữ + Thời gian + Động từ).",
      });
    }

    if (/(?:去|来|看|吃|喝|买|学|写|读|做|听|说|玩)[^\s,。！？]*在[\p{Script=Han}]{2,6}/u.test(rawText)) {
      issues.push({
        type: "WORD_ORDER",
        original: "Trạng ngữ chỉ nơi chốn (在...) đặt sau động từ",
        suggestion: "Đưa cụm '在 + địa điểm' lên trước động từ chính",
        reason: "Trong tiếng Trung, địa điểm diễn ra hành động phải đặt trước động từ (Chủ ngữ + 在 Địa điểm + Động từ).",
      });
    }

    if (/(?:去|来|看|吃|喝|买|学|写|读|做|听|说|玩)[^\s,。！？]*(?:和|跟)[\p{Script=Han}]+(?:一起)?/u.test(rawText)) {
      issues.push({
        type: "WORD_ORDER",
        original: "Cụm chỉ người đồng hành (和/跟...一起) đặt sau động từ",
        suggestion: "Đưa '和...一起' lên trước động từ",
        reason: "Trong tiếng Trung, cụm đồng hành cùng ai phải đứng trước động từ (Chủ ngữ + 和 Ai + 一起 + Động từ).",
      });
    }

    // Rule B: Kiểm tra lượng từ bắt buộc giữa số từ và danh từ
    // Ví dụ sai: 一水, 两苹果, 三书, 这人
    if (/(?:一|两|三|四|五|六|七|八|九|十|几)(?!个|本|杯|瓶|张|只|条|双|位|件|门|把|棵|支|节|台|部|碗)(?:人|书|水|苹果|手机|老师|学生|朋友|电影|衣服|车|笔|茶|咖啡|钱|汉语|中文)/u.test(rawText)) {
      issues.push({
        type: "MEASURE_WORD",
        original: "Thiếu lượng từ giữa số từ và danh từ",
        suggestion: "Thêm lượng từ thích hợp (như 个, 本, 杯, 瓶, 张, 件...)",
        reason: "Trong tiếng Trung, giữa số từ và danh từ bắt buộc phải có lượng từ thích hợp.",
      });
    }

    // Rule J: Kiểm tra câu cụt lửng lơ / thiếu chữ / dở dang
    if (/(?:在|和|跟|比|从|向|往|给|想|要|能|可以)$/u.test(rawText.replace(/[.,?!，。？！\s]/g, ""))) {
      issues.push({
        type: "WORD_ORDER",
        original: "Câu kết thúc lửng lơ, thiếu thành phần chính",
        suggestion: "Bổ sung tân ngữ hoặc vị ngữ hoàn chỉnh",
        reason: "Câu bị viết dở dang, giới từ hoặc trợ động từ không thể đứng cụt lủn ở cuối câu.",
      });
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

    // Rule H: So sánh với 比 không đi cùng phó từ 很, 非常, 太 (Sai: 我比他很大 -> Sửa: 我比他大)
    if (/比.+?(很|非常|太|十分)(高|大|小|多|少|长|短|快|慢|漂亮|帅|胖|瘦)/u.test(rawText)) {
      issues.push({
        type: "WORD_ORDER",
        original: "Dùng '很/非常/太' trong câu so sánh chữ '比'",
        suggestion: "Bỏ phó từ mức độ (ví dụ: 我比他大, không dùng 我比他很大)",
        reason: "Trong câu so sánh chữ '比', tính từ sau không được kết hợp với các phó từ chỉ mức độ tuyệt đối như '很', '非常', '太'.",
      });
      correctedText = correctedText.replace(/(比.+?)(很|非常|太|十分)(高|大|小|多|少|长|短|快|慢|漂亮|帅|胖|瘦)/gu, "$1$3");
    }

    // Rule I: Dùng thừa chữ '吗' trong câu có đại từ nghi vấn (Sai: 你叫什么名字吗？ -> Sửa: 你叫什么名字？)
    if (/(什么|谁|哪儿|哪里|怎么|怎么样|几|多少).+?吗/u.test(rawText)) {
      issues.push({
        type: "PARTICLE",
        original: "Thừa trợ từ nghi vấn '吗'",
        suggestion: "Bỏ '吗' ở cuối câu (ví dụ: 你叫什么名字？)",
        reason: "Câu đã chứa đại từ nghi vấn (什么, 谁, 哪儿...) thì cuối câu không được dùng thêm trợ từ nghi vấn '吗'.",
      });
      correctedText = correctedText.replace(/吗([？?]?)$/gu, "$1");
    }

    // 4. Gọi LLM chuyên gia để chấm điểm thật, phát hiện lỗi ngữ pháp & diễn đạt tự nhiên
    let nativePolish = correctedText;
    let pedagogicalComment = "Bài viết cần chú ý rèn luyện thêm trật tự câu và cách kết hợp từ vựng chuẩn xác.";
    let llmScore: number | null = null;

    const qwenKey = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    const promptText = `Bạn là giám khảo chấm thi HSK và chuyên gia ngôn ngữ tiếng Trung bản xứ cực kỳ nghiêm khắc và chuẩn mực.
Hãy kiểm tra và chấm điểm bài viết tiếng Trung sau đây của học sinh (HSK ${hskLevel}):
"${rawText}"

QUY TẮC BẮT LỖI VÀ CHẤM ĐIỂM NGHIÊM NGẶT (TUYỆT ĐỐI TUÂN THỦ):
1. BẮT LỖI TRẬT TỰ TỪ (WORD ORDER):
   - Trong tiếng Trung, trạng từ chỉ thời gian (今天, 明天, 昨天, 晚上...), trạng ngữ chỉ nơi chốn (在...), cụm đồng hành (和...一起), phương thức PHẢI ĐỨNG TRƯỚC ĐỘNG TỪ CHÍNH.
   - Nếu học sinh đặt thời gian, nơi chốn hoặc cụm đồng hành ở sau động từ (Ví dụ: "我去学校明天", "他看书在图书馆", "我吃饭和朋友"): BẮT BUỘC COI LÀ LỖI NGHIÊM TRỌNG, chấm từ 40-60 điểm!
2. BẮT LỖI VIẾT THIẾU CHỮ / TỪ CỤT / THIẾU THÀNH PHẦN CÂU (MISSING WORDS / INCOMPLETE SENTENCES):
   - Nếu học sinh viết dở dang, viết thiếu chữ trong từ vựng (ví dụ "图馆" thay vì "图书馆"), thiếu lượng từ bắt buộc (ví dụ "两苹果", "一水"), thiếu vị ngữ hoặc tân ngữ (ví dụ "我去学", "他是好"): BẮT BUỘC BẮT LỖI, chấm từ 35-50 điểm, KHÔNG ĐƯỢC khen hay bỏ qua!
3. THANG ĐIỂM (score từ 0 đến 100):
   - Nếu có bất kỳ lỗi nào về trật tự từ, thiếu chữ, dùng sai từ: TỐI ĐA 65 ĐIỂM. TUYỆT ĐỐI KHÔNG CHO 85-100 ĐIỂM KHI CÓ LỖI!
   - Nếu câu quá ngắn (< 5 chữ) hoặc cụt lủn: Tối đa 60 điểm.
   - Chỉ khi câu hoàn chỉnh, đúng trật tự từ, đúng lượng từ và diễn đạt chuẩn xác: Mới cho từ 88-100 điểm.

Trả về DUY NHẤT một chuỗi JSON hợp lệ không bọc markdown:
{
  "score": 50,
  "correctedText": "Đoạn văn sau khi đã sửa toàn bộ các lỗi ngữ pháp",
  "nativePolish": "Câu văn viết lại mượt mà, tự nhiên nhất chuẩn người bản xứ",
  "pedagogicalComment": "Lời nhận xét sư phạm chi tiết bằng tiếng Việt chỉ rõ cụ thể lỗi sai trật tự từ hoặc thiếu chữ và cách khắc phục (2-3 câu)",
  "issues": [
    {
      "type": "WORD_ORDER",
      "original": "Cụm từ bị sai",
      "suggestion": "Cách sửa đúng",
      "reason": "Giải thích rõ ràng quy tắc ngữ pháp bằng tiếng Việt"
    }
  ]
}`;

    // A. ƯU TIÊN SỐ 1: ALIBABA CLOUD QWEN (DASHSCOPE HOẶC GROQ)
    if (qwenKey) {
      const qwenModels = ["qwen-plus", "qwen-turbo", "qwen-max"];
      for (const qModel of qwenModels) {
        try {
          const qRes = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${qwenKey}` },
            body: JSON.stringify({
              model: qModel,
              messages: [
                { role: "system", content: "You are an expert native Chinese HSK grading teacher. Output ONLY valid JSON." },
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
            break;
          }
        } catch (qErr) {
          console.warn(`Qwen DashScope check-writing error on ${qModel}:`, qErr);
        }
      }
    }

    // A2. ALIBABA QWEN 2.5/3.8 TRÊN GROQ LPUs (SIÊU NHANH)
    if (llmScore === null && groqKey) {
      try {
        const grRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: "qwen/qwen3.8-27b",
            messages: [
              { role: "system", content: "You are an expert native Chinese HSK grading teacher. Output ONLY valid JSON." },
              { role: "user", content: promptText },
            ],
            temperature: 0.2,
            response_format: { type: "json_object" },
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
      } catch (gErr) {
        console.warn("Groq Qwen check-writing error:", gErr);
      }
    }

    // B. DỰ PHÒNG 1: GOOGLE GEMINI (GEMINI 2.5 FLASH / LITE)
    if (llmScore === null && geminiKey) {
      try {
        const geminiModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];
        for (const model of geminiModels) {
          try {
            const gRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: promptText }] }],
                  generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json",
                  },
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

    // C. DỰ PHÒNG 2: GROQ OSS
    if (llmScore === null && groqKey) {
      try {
        const grRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [
              { role: "system", content: "You are an expert native Chinese teacher. Respond ONLY in valid JSON." },
              { role: "user", content: promptText },
            ],
            temperature: 0.2,
            response_format: { type: "json_object" },
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

    // Tính điểm cuối cùng: Ưu tiên điểm số thực từ LLM, nếu không có thì tính từ bộ quy tắc sư phạm
    let score = llmScore !== null ? llmScore : 100;
    if (llmScore === null) {
      if (issues.length === 1) {
        score = 65;
        pedagogicalComment = "Bài viết có 1 lỗi cấu trúc ngữ pháp cần khắc phục. Thầy/Cô và AI khuyên bạn xem chi tiết cách sửa ở bảng bên dưới.";
      } else if (issues.length === 2) {
        score = 50;
        pedagogicalComment = "Bài viết xuất hiện 2 lỗi sai ngữ pháp. Bạn cần chú ý thứ tự trạng từ và lượng từ thích hợp.";
      } else if (issues.length >= 3) {
        score = Math.max(30, 45 - issues.length * 5);
        pedagogicalComment = "Bài viết có nhiều lỗi ngữ pháp cơ bản. Hãy xem kỹ phần gợi ý viết lại tự nhiên để nâng cao kỹ năng.";
      } else {
        // Kiểm tra độ dài câu nếu không có lỗi nào
        if (rawText.length < 5) {
          score = 75;
          pedagogicalComment = "Câu đúng ngữ pháp nhưng còn quá ngắn. Hãy mở rộng thêm trạng từ chỉ thời gian hoặc nơi chốn nhé!";
        } else if (rawText.length < 12) {
          score = 85;
          pedagogicalComment = "Diễn đạt tốt và chuẩn ngữ pháp HSK. Bạn có thể thêm liên từ nối để câu văn thêm uyển chuyển.";
        } else {
          score = 95;
          pedagogicalComment = "🌟 Xuất sắc! Đoạn văn đạt chuẩn ngữ pháp HSK, cấu trúc mạch lạc và từ vựng phong phú.";
        }
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
