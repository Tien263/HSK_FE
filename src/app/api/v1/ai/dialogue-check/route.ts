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
      history = [], // Lịch sử hội thoại: Array<{ sender: 'STUDENT' | 'AI', zh: string }>
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
    let suggestedReplies: Array<{ zh: string; pinyin: string; vi: string }> = [];

    if (mode === "DIALOGUE") {
      // Chế độ luyện hội thoại theo bài học
      if (spokenClean === targetClean) {
        score = 100;
        feedback = "🌟 Hoàn hảo! Bạn đã phát âm cực kỳ chuẩn xác câu thoại cả về ngữ điệu lẫn thanh điệu.";
      } else if (spokenClean.includes(targetClean) || targetClean.includes(spokenClean)) {
        score = 90;
        feedback = "👍 Rất tốt! Bạn đã phát âm đúng cấu trúc chính của câu thoại.";
      } else {
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
      // Chế độ Trò chuyện tự do không giới hạn chủ đề (Free Talk với AI đa dạng)
      if (spokenClean.length === 0) {
        score = 20;
        feedback = "Chưa thu được âm thanh rõ ràng. Hãy bấm Micro hoặc gõ tiếng Trung để trò chuyện nhé!";
      } else {
        score = Math.min(100, Math.max(70, 80 + spokenClean.length * 2));
        feedback = `🌟 Phản xạ tự nhiên rất tốt! Câu gồm ${spokenClean.length} chữ Hán với ${vocabDetected.length} từ vựng từ kho chuẩn.`;

        // Kiểm tra các API Key AI khả dụng
        const groqKey = process.env.GROQ_API_KEY;
        const qwenKey = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;
        const openAiKey = process.env.OPENAI_API_KEY;

        let llmSuccess = false;

        const conversationContext = history
          .slice(-6)
          .map((m: any) => `${m.sender === "STUDENT" ? "Học sinh" : "AI Tiểu Ngữ"}: ${m.zh}`)
          .join("\n");

        const promptText = `Bạn là Tiểu Ngữ (小语) - trợ giảng khẩu ngữ tiếng Trung AI thân thiện, thông minh, kiên nhẫn dành cho học viên HSK cấp độ ${hskLevel}.
Lịch sử hội thoại vừa qua:
${conversationContext || "(Bắt đầu cuộc trò chuyện mới)"}

Học sinh vừa nói: "${spokenText}"

Yêu cầu bắt buộc:
1. Trả lời câu của học sinh bằng tiếng Trung thật tự nhiên, phong phú, từ vựng phù hợp HSK ${hskLevel}.
2. Đặt thêm 1 câu hỏi gợi mở tiếp theo để duy trì cuộc hội thoại liên tục, nhiều chủ đề đa dạng (thời tiết, sở thích, ẩm thực, cuộc sống, ước mơ, học tập...).
3. Đưa ra 2-3 câu trả lời mẫu gợi ý (suggestedReplies) để học sinh có thể chọn bấm vào để trả lời tiếp nếu chưa nghĩ ra.
4. Trả về DUY NHẤT một chuỗi JSON hợp lệ không bọc markdown:
{
  "aiReplyZh": "Câu phản hồi tiếng Trung",
  "aiReplyPinyin": "Phiên âm pinyin có thanh điệu",
  "aiReplyVi": "Bản dịch nghĩa tiếng Việt tự nhiên",
  "feedback": "Lời nhận xét sư phạm ngắn gọn (khen ngợi hoặc sửa nhẹ)",
  "suggestedReplies": [
    { "zh": "Câu gợi ý 1", "pinyin": "pinyin 1", "vi": "nghĩa 1" },
    { "zh": "Câu gợi ý 2", "pinyin": "pinyin 2", "vi": "nghĩa 2" }
  ]
}`;

        // Ưu tiên gọi GEMINI (Google AI Studio - Ổn định & Nhanh chóng)
        if (!llmSuccess && geminiKey) {
          const geminiModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
          for (const model of geminiModels) {
            try {
              const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }],
                    generationConfig: { temperature: 0.7 },
                  }),
                }
              );
              if (res.ok) {
                const data = await res.json();
                const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json|```/g, "").trim();
                const parsed = JSON.parse(raw);
                if (parsed.aiReplyZh) {
                  aiReplyZh = parsed.aiReplyZh;
                  aiReplyPinyin = parsed.aiReplyPinyin || "";
                  aiReplyVi = parsed.aiReplyVi || "";
                  if (parsed.feedback) feedback = parsed.feedback;
                  if (Array.isArray(parsed.suggestedReplies)) suggestedReplies = parsed.suggestedReplies;
                  llmSuccess = true;
                  break;
                }
              }
            } catch (e) {
              console.warn(`Gemini dialogue error on ${model}:`, e);
            }
          }
        }

        // Gọi GROQ nếu có và chưa thành công
        if (!llmSuccess && groqKey) {
          try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
              body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                  { role: "system", content: "You are an expert native Chinese conversation teacher. Respond ONLY in valid JSON." },
                  { role: "user", content: promptText },
                ],
                temperature: 0.7,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              const raw = data.choices?.[0]?.message?.content?.replace(/```json|```/g, "").trim();
              const parsed = JSON.parse(raw);
              if (parsed.aiReplyZh) {
                aiReplyZh = parsed.aiReplyZh;
                aiReplyPinyin = parsed.aiReplyPinyin || "";
                aiReplyVi = parsed.aiReplyVi || "";
                if (parsed.feedback) feedback = parsed.feedback;
                if (Array.isArray(parsed.suggestedReplies)) suggestedReplies = parsed.suggestedReplies;
                llmSuccess = true;
              }
            }
          } catch (e) {
            console.warn("Groq dialogue call error:", e);
          }
        }

        // Gọi OPENAI nếu có
        if (!llmSuccess && openAiKey) {
          try {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${openAiKey}` },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                  { role: "system", content: "You are a native Chinese dialogue tutor. Output only JSON." },
                  { role: "user", content: promptText },
                ],
                temperature: 0.7,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              const raw = data.choices?.[0]?.message?.content?.replace(/```json|```/g, "").trim();
              const parsed = JSON.parse(raw);
              if (parsed.aiReplyZh) {
                aiReplyZh = parsed.aiReplyZh;
                aiReplyPinyin = parsed.aiReplyPinyin || "";
                aiReplyVi = parsed.aiReplyVi || "";
                if (parsed.feedback) feedback = parsed.feedback;
                if (Array.isArray(parsed.suggestedReplies)) suggestedReplies = parsed.suggestedReplies;
                llmSuccess = true;
              }
            }
          } catch (e) {
            console.warn("OpenAI dialogue call error:", e);
          }
        }

        // BỘ DỰ PHÒNG PHONG PHÚ ĐA DẠNG NẾU CHƯA CÓ API KEY HOẶC OFFLINE
        if (!llmSuccess) {
          const smartTopics = [
            {
              matcher: /好|您好|你好|嗨/u,
              replies: [
                {
                  zh: "你好呀！很高兴认识你。今天过得开心吗？",
                  pinyin: "Nǐ hǎo ya! Hěn gāoxìng rènshi nǐ. Jīntiān guò de kāixīn ma?",
                  vi: "Chào bạn nhé! Rất vui được quen bạn. Hôm nay bạn thấy vui không?",
                  suggestions: [
                    { zh: "我今天很开心！", pinyin: "Wǒ jīntiān hěn kāixīn!", vi: "Hôm nay mình rất vui!" },
                    { zh: "我今天有点忙。", pinyin: "Wǒ jīntiān yǒudiǎn máng.", vi: "Hôm nay mình hơi bận một chút." },
                  ],
                },
                {
                  zh: "你好！你的中文听起来很亲切。你平时喜欢学中文吗？",
                  pinyin: "Nǐ hǎo! Nǐ de zhōngwén tīng qǐlái hěn qīnqiè. Nǐ píngshí xǐhuan xué zhōngwén ma?",
                  vi: "Xin chào! Tiếng Trung của bạn nghe rất gần gũi. Thường ngày bạn có thích học tiếng Trung không?",
                  suggestions: [
                    { zh: "我很喜欢学中文，很有意思。", pinyin: "Wǒ hěn xǐhuan xué zhōngwén, hěn yǒu yìsi.", vi: "Mình rất thích học tiếng Trung, rất thú vị." },
                    { zh: "中文有点难，但我一直在努力！", pinyin: "Zhōngwén yǒudiǎn nán, dàn wǒ yìzhí zài nǔlì!", vi: "Tiếng Trung hơi khó, nhưng mình luôn nỗ lực!" },
                  ],
                },
              ],
            },
            {
              matcher: /吃|喝|菜|茶|饭|水|米饭|面/u,
              replies: [
                {
                  zh: "中国的美食非常多！你最喜欢吃饺子、火锅还是炒饭？",
                  pinyin: "Zhōngguó de měishí fēicháng duō! Nǐ zuì xǐhuan chī jiǎozi, huǒguō háishì chǎofàn?",
                  vi: "Ẩm thực Trung Hoa phong phú lắm! Bạn thích ăn sủi cảo, lẩu hay cơm rang nhất?",
                  suggestions: [
                    { zh: "我特别喜欢吃中国火锅！", pinyin: "Wǒ tèbié xǐhuan chī Zhōngguó huǒguō!", vi: "Mình đặc biệt thích ăn lẩu Trung Quốc!" },
                    { zh: "我喜欢喝中国绿茶，很健康。", pinyin: "Wǒ xǐhuan hē Zhōngguó lǜchá, hěn jiànkāng.", vi: "Mình thích uống trà xanh Trung Quốc, rất tốt cho sức khỏe." },
                  ],
                },
                {
                  zh: "听起来很香呢！你平时喜欢自己做饭还是去餐厅吃？",
                  pinyin: "Tīng qǐlái hěn xiāng ne! Nǐ píngshí xǐhuan zìjǐ zuòfàn háishì qù cāntīng chī?",
                  vi: "Nghe hấp dẫn quá! Bạn thường thích tự nấu ăn hay đi ăn ở nhà hàng?",
                  suggestions: [
                    { zh: "我周末喜欢自己做饭。", pinyin: "Wǒ zhōumò xǐhuan zìjǐ zuòfàn.", vi: "Cuối tuần mình thích tự nấu ăn." },
                    { zh: "我平时工作忙，经常在外面吃。", pinyin: "Wǒ píngshí gōngzuò máng, jīngcháng zài wàimiàn chī.", vi: "Bình thường mình bận đi làm nên hay ăn ở ngoài." },
                  ],
                },
              ],
            },
            {
              matcher: /电影|音乐|歌|看|听|玩|运动|足球|篮球/u,
              replies: [
                {
                  zh: "你的业余爱好真丰富！休息的时候你最喜欢听歌还是看电影？",
                  pinyin: "Nǐ de yèyú àihào zhēn fēngfù! Xiūxi de shíhou nǐ zuì xǐhuan tīng gē háishì kàn diànyǐng?",
                  vi: "Sở thích lúc rảnh rỗi của bạn phong phú thật! Khi nghỉ ngơi bạn thích nghe nhạc hay xem phim hơn?",
                  suggestions: [
                    { zh: "我喜欢看中国电影，还能练听力。", pinyin: "Wǒ xǐhuan kàn Zhōngguó diànyǐng, hái néng liàn tīnglì.", vi: "Mình thích xem phim Trung Quốc, vừa hay vừa luyện được nghe." },
                    { zh: "我喜欢听中文流行歌。", pinyin: "Wǒ xǐhuan tīng Zhōngwén liúxíng gē.", vi: "Mình thích nghe các bài hát nhạc hoa thịnh hành." },
                  ],
                },
              ],
            },
            {
              matcher: /去|旅游|北京|上海|飞机|路|中国/u,
              replies: [
                {
                  zh: "旅行让人开阔眼界！你想去北京看故宫，还是想去上海看东方明珠？",
                  pinyin: "Lǚxíng ràng rén kāikuò yǎnjiè! Nǐ xiǎng qù Běijīng kàn Gùgōng, háishì xiǎng qù Shànghǎi kàn Dōngfāng Míngzhū?",
                  vi: "Đi du lịch mở mang tầm mắt lắm! Bạn muốn đi Bắc Kinh ngắm Cố Cung hay muốn đi Thượng Hải ngắm Tháp Đông Phương?",
                  suggestions: [
                    { zh: "我想去北京爬长城！", pinyin: "Wǒ xiǎng qù Běijīng pá Chángchéng!", vi: "Mình muốn đi Bắc Kinh leo Vạn Lý Trường Thành!" },
                    { zh: "我想去成都看可爱的大熊猫。", pinyin: "Wǒ xiǎng qù Chéngdū kàn kě'ài de dàxióngmāo.", vi: "Mình muốn đi Thành Đô ngắm gấu trúc đáng yêu." },
                  ],
                },
              ],
            },
          ];

          let matchedTopic = smartTopics.find((t) => t.matcher.test(spokenClean));
          if (!matchedTopic) {
            matchedTopic = {
              matcher: /.*/,
              replies: [
                {
                  zh: "你说得很自然！中文表达能力越来越棒了。你明天有什么计划吗？",
                  pinyin: "Nǐ shuō de hěn zìrán! Zhōngwén biǎodá nénglì yuèláiyuè bàng le. Nǐ míngtiān yǒu shénme jìhuà ma?",
                  vi: "Bạn nói rất tự nhiên! Khả năng diễn đạt tiếng Trung ngày càng đỉnh rồi. Ngày mai bạn có kế hoạch gì chưa?",
                  suggestions: [
                    { zh: "我明天要上班/上学。", pinyin: "Wǒ míngtiān yào shàngbān / shàngxué.", vi: "Ngày mai mình phải đi làm / đi học." },
                    { zh: "我打算在家里看书休息。", pinyin: "Wǒ dǎsuàn zài jiālǐ kànshū xiūxi.", vi: "Mình dự định ở nhà đọc sách nghỉ ngơi." },
                  ],
                },
                {
                  zh: "太棒了！我们多聊聊吧。你觉得学中文最难的是声调还是汉字？",
                  pinyin: "Tài bàng le! Wǒmen duō liáoliao ba. Nǐ juéde xué zhōngwén zuì nán de shì shēngdiào háishì hànzì?",
                  vi: "Tuyệt quá! Chúng mình cùng trò chuyện thêm nhé. Bạn thấy học tiếng Trung khó nhất là thanh điệu hay chữ Hán?",
                  suggestions: [
                    { zh: "我觉得汉字笔画有点难写。", pinyin: "Wǒ juéde hànzì bǐhuà yǒudiǎn nán xiě.", vi: "Mình thấy nét chữ Hán hơi khó viết." },
                    { zh: "我觉得声调需要多加练习。", pinyin: "Wǒ juéde shēngdiào xūyào duōjiā liànxí.", vi: "Mình thấy thanh điệu cần phải luyện tập nhiều hơn." },
                  ],
                },
              ],
            };
          }

          // Chọn ngẫu nhiên 1 câu đáp trong nhóm để câu trả lời luôn luôn mới lạ
          const randomReply = matchedTopic.replies[Math.floor(Math.random() * matchedTopic.replies.length)];
          aiReplyZh = randomReply.zh;
          aiReplyPinyin = randomReply.pinyin;
          aiReplyVi = randomReply.vi;
          suggestedReplies = randomReply.suggestions;
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
            source: "AI_SPEAKING",
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
      suggestedReplies,
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
