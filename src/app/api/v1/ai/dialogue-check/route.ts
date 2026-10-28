import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      spokenText = "",
      targetText = "",
      mode = "DIALOGUE", // DIALOGUE, SCENARIO hoặc FREE_TALK
      speaker = "Học sinh",
      lessonNumber = 1,
      hskLevel = 1,
      studentId,
      history = [], // Lịch sử hội thoại: Array<{ sender: 'STUDENT' | 'AI', zh: string }>
      scenarioTitle = "",
      scenarioAiRole = "",
      scenarioStudentRole = "",
      scenarioMissions = [],
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
    let grammarCorrection = "";
    let grammarTip = "";
    let completedMissionId: number | null = null;
    let suggestedReplies: Array<{
      zh: string;
      pinyin: string;
      vi: string;
      grammarStructure?: string;
      explanation?: string;
    }> = [];

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
        const deepseekKey = process.env.DEEPSEEK_API_KEY;
        const zhipuKey = process.env.ZHIPU_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;
        const openAiKey = process.env.OPENAI_API_KEY;

        let llmSuccess = false;
        const isScenario = mode === "SCENARIO";

        const systemPrompt = isScenario
          ? `Bạn đang tham gia NHẬP VAI TÌNH HUỐNG THỰC TẾ với học viên HSK cấp độ ${hskLevel}.
TÌNH HUỐNG: ${scenarioTitle || "Tình huống giao tiếp thực tế đời thường"}
VAI CỦA BẠN (AI): ${scenarioAiRole || "Người bản xứ"}
VAI CỦA HỌC VIÊN: ${scenarioStudentRole || "Khách hàng / Du khách"}

DANH SÁCH NHIỆM VỤ HỌC VIÊN CẦN HOÀN THÀNH:
${
  Array.isArray(scenarioMissions) && scenarioMissions.length > 0
    ? scenarioMissions.map((m: any, idx: number) => `Nhiệm vụ ${idx + 1} (id: ${m.id}): ${m.title} - ${m.description} (Gợi ý câu: ${m.hintZh || ""})`).join("\n")
    : "Hoàn thành cuộc đối thoại tự nhiên."
}

QUY TẮC NHẬP VAI TÌNH HUỐNG:
1. ĐÓNG VAI CHÂN THỰC 100%: Bạn phải nhập tâm trọn vẹn vào nhân vật (${scenarioAiRole}), dùng ngữ điệu, cách xưng hô và phong thái của nhân vật ngoài đời thực ở Trung Quốc (vui vẻ, nhiệt tình, có thể pha chút hài hước hoặc lém lỉnh nếu là chủ quán/tài xế).
2. ĐÁNH GIÁ NHIỆM VỤ (BẮT BUỘC): Đối chiếu kỹ câu nói của học viên ("${spokenText}"). Nếu câu nói này đã thể hiện đúng mục tiêu của một trong các nhiệm vụ ở trên, trả về "completedMissionId": <id số của nhiệm vụ đó>. Nếu chưa đạt được nhiệm vụ nào mới, trả về null.
3. PHẢN HỒI THEO TÌNH HUỐNG: Trả lời 2-3 câu tự nhiên theo diễn biến tình huống, đưa ra câu hỏi hoặc lời đề nghị để học viên nói tiếp các nhiệm vụ tiếp theo.
4. SỬA LỖI & GỢI Ý ĐỐI THOẠI:
   - grammarCorrection: Sửa lỗi trật tự từ/thiếu chữ/dùng sai từ nếu học viên nói sai.
   - grammarTip: Nêu 1 cấu trúc khẩu ngữ hữu ích trong tình huống này.
   - suggestedReplies: Gợi ý 2-3 câu đối đáp tự nhiên học viên có thể dùng để đối đáp với bạn và hướng tới hoàn thành các nhiệm vụ còn lại (kèm grammarStructure và explanation).

ĐỊNH DẠNG JSON DUY NHẤT:
{
  "aiReplyZh": "Câu thoại tiếng Trung của nhân vật",
  "aiReplyPinyin": "Phiên âm pinyin chuẩn",
  "aiReplyVi": "Bản dịch tiếng Việt",
  "feedback": "Nhận xét ngắn về cách ứng biến của học viên trong vai",
  "grammarCorrection": "",
  "grammarTip": "",
  "completedMissionId": 1 hoặc null,
  "suggestedReplies": [
    {
      "zh": "Câu đối đáp gợi ý 1 cho học viên",
      "pinyin": "pinyin 1",
      "vi": "nghĩa 1",
      "grammarStructure": "Cấu trúc: ...",
      "explanation": "Giải thích ngữ cảnh..."
    }
  ]
}`
          : `Bạn là Tiểu Ngữ (小语) - một người bạn bản xứ Trung Quốc thân thiện, chân thành và vui tính, đang trò chuyện đối thoại hai chiều trực tiếp trên WeChat với học viên HSK cấp độ ${hskLevel}.

QUY TẮC ĐỐI THOẠI CỐT LÕI (BẮT BUỘC TUÂN THỦ NGHIÊM NGẶT ĐỂ ĐẠT ĐỘ TỰ NHIÊN NHƯ BẢN XỨ):
1. ĐỐI THOẠI HAI CHIỀU TỰ NHIÊN, SỐNG ĐỘNG NHƯ TRÒ CHUYỆN ĐỜI THƯỜNG:
   - Dùng văn phong khẩu ngữ tự nhiên của giới trẻ Trung Quốc hiện đại: khéo léo kết hợp các trợ từ ngữ khí bản xứ (语气助词: 呀, 呢, 吧, 哈, 对啊, 真的吗, 哎呀, 好呀).
   - NẾU HỌC VIÊN HỎI: Bắt buộc trả lời câu hỏi của học viên một cách chân thật, sinh động và chi tiết trước tiên (VD: hỏi tên, tuổi, ăn gì chưa, thời tiết, sở thích, cuộc sống ở Bắc Kinh/Thượng Hải...).
   - Sau đó chia sẻ cảm xúc/trải nghiệm cá nhân ngắn rồi hỏi ngược lại học viên 1 câu hỏi liên quan để duy trì nhịp trò chuyện thân mật.
   - Trả lời tự nhiên 2-4 câu đầy đủ, không cụt lủn, TUYỆT ĐỐI không mở đầu bằng câu khen sáo rỗng (như "你说得很自然").
2. PHÂN TÍCH NGỮ PHÁP & GỢI Ý CÂU ĐỐI THOẠI (BẮT BUỘC):
   - grammarCorrection: Nếu câu của học viên bị sai trật tự từ (như đặt trạng từ thời gian/nơi chốn sai vị trí, dùng sai 的/地/得, thiếu lượng từ), hãy chỉ ra cụ thể lỗi và sửa lại câu chuẩn xác. Nếu học viên nói đúng hoàn toàn thì để rỗng "".
   - grammarTip: Phân tích 1 cấu trúc ngữ pháp tiếng Trung quan trọng hoặc mẹo dùng từ tự nhiên liên quan đến lượt nói này (bằng tiếng Việt ngắn gọn, dễ hiểu).
   - suggestedReplies: Cung cấp 2-3 câu đối đáp tự nhiên học viên có thể dùng để trả lời câu hỏi mà bạn vừa hỏi ở cuối câu. Mỗi gợi ý BẮT BUỘC kèm theo "grammarStructure" (cấu trúc ngữ pháp áp dụng) và "explanation" (giải thích ngữ cảnh dùng chuẩn bản xứ).

ĐỊNH DẠNG JSON DUY NHẤT:
{
  "aiReplyZh": "Câu phản hồi của AI bằng tiếng Trung (tự nhiên 2-4 câu)",
  "aiReplyPinyin": "Phiên âm pinyin có thanh điệu chuẩn xác",
  "aiReplyVi": "Bản dịch nghĩa tiếng Việt tự nhiên",
  "feedback": "Nhận xét ngắn về độ tự nhiên của câu học viên",
  "grammarCorrection": "Chỉ ra lỗi sai trật tự từ/thiếu chữ và cách sửa đúng (để rỗng nếu học viên nói đúng)",
  "grammarTip": "Phân tích cấu trúc ngữ pháp quan trọng trong lượt đối thoại này",
  "suggestedReplies": [
    {
      "zh": "Câu đối đáp gợi ý 1 cho học viên",
      "pinyin": "pinyin 1",
      "vi": "nghĩa 1",
      "grammarStructure": "Cấu trúc: ...",
      "explanation": "Giải thích ngữ cảnh..."
    },
    {
      "zh": "Câu đối đáp gợi ý 2 cho học viên",
      "pinyin": "pinyin 2",
      "vi": "nghĩa 2",
      "grammarStructure": "Cấu trúc: ...",
      "explanation": "Giải thích ngữ cảnh..."
    }
  ]
}`;

        // Chuẩn bị chat messages cho multi-turn context
        const rawChatMessages: Array<{ role: string; content: string }> = [
          { role: "system", content: systemPrompt },
        ];

        // Đưa tối đa 10 lượt hội thoại gần nhất vào ngữ cảnh
        if (Array.isArray(history) && history.length > 0) {
          const recentHistory = history.slice(-10);
          for (const item of recentHistory) {
            if (item.sender === "STUDENT" && item.zh) {
              rawChatMessages.push({ role: "user", content: item.zh });
            } else if (item.sender === "AI" && item.zh) {
              rawChatMessages.push({ role: "assistant", content: JSON.stringify({ aiReplyZh: item.zh }) });
            }
          }
        }
        rawChatMessages.push({ role: "user", content: spokenText });

        const promptText = `${systemPrompt}

Lịch sử trò chuyện trước đó:
${history
  .slice(-8)
  .map((m: any) => `${m.sender === "STUDENT" ? "Học viên" : "Tiểu Ngữ (AI)"}: ${m.zh}`)
  .join("\n") || "(Bắt đầu cuộc trò chuyện)"}

Học viên vừa nói: "${spokenText}"`;

        const applyParsedResponse = (parsed: any) => {
          if (!parsed || !parsed.aiReplyZh) return false;
          aiReplyZh = parsed.aiReplyZh;
          aiReplyPinyin = parsed.aiReplyPinyin || "";
          aiReplyVi = parsed.aiReplyVi || "";
          if (parsed.feedback) feedback = parsed.feedback;
          if (parsed.grammarCorrection) grammarCorrection = parsed.grammarCorrection;
          if (parsed.grammarTip) grammarTip = parsed.grammarTip;
          if (Array.isArray(parsed.suggestedReplies)) suggestedReplies = parsed.suggestedReplies;
          if (parsed.completedMissionId !== undefined && parsed.completedMissionId !== null) {
            completedMissionId = Number(parsed.completedMissionId);
          }
          llmSuccess = true;
          return true;
        };

        // -------------------------------------------------------------
        // 1. ƯU TIÊN SỐ 1: ALIBABA CLOUD QWEN TRÊN GROQ LPUs (CỰC NHANH ~500ms)
        // HOẶC QWEN DASHSCOPE NẾU CÓ KEY
        // -------------------------------------------------------------
        if (!llmSuccess && groqKey) {
          try {
            const groqQwenRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${groqKey}`,
              },
              body: JSON.stringify({
                model: "qwen/qwen3.8-27b",
                messages: rawChatMessages,
                temperature: 0.7,
                response_format: { type: "json_object" },
              }),
            });

            if (groqQwenRes.ok) {
              const qwenData = await groqQwenRes.json();
              const raw = qwenData.choices?.[0]?.message?.content?.replace(/```json|```/g, "").trim();
              if (raw) {
                applyParsedResponse(JSON.parse(raw));
              }
            }
          } catch (gErr) {
            console.warn("Groq Qwen call error:", gErr);
          }
        }

        // Qwen DashScope chính hãng Alibaba Cloud
        if (!llmSuccess && qwenKey) {
          const qwenModels = ["qwen-plus", "qwen-turbo", "qwen-max"];
          for (const qModel of qwenModels) {
            try {
              const qwenRes = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${qwenKey}`,
                },
                body: JSON.stringify({
                  model: qModel,
                  messages: rawChatMessages,
                  temperature: 0.7,
                }),
              });

              if (qwenRes.ok) {
                const qwenData = await qwenRes.json();
                const raw = qwenData.choices?.[0]?.message?.content?.replace(/```json|```/g, "").trim();
                if (raw) {
                  if (applyParsedResponse(JSON.parse(raw))) break;
                }
              }
            } catch (qErr) {
              console.warn(`Qwen DashScope dialogue error on ${qModel}:`, qErr);
            }
          }
        }

        // -------------------------------------------------------------
        // DEEPSEEK AI BẢN XỨ (DEEPSEEK-CHAT / V3)
        // -------------------------------------------------------------
        if (!llmSuccess && deepseekKey) {
          try {
            const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${deepseekKey}`,
              },
              body: JSON.stringify({
                model: "deepseek-chat",
                messages: rawChatMessages,
                temperature: 0.7,
                response_format: { type: "json_object" },
              }),
            });
            if (dsRes.ok) {
              const dsData = await dsRes.json();
              const raw = dsData.choices?.[0]?.message?.content?.replace(/```json|```/g, "").trim();
              if (raw) {
                applyParsedResponse(JSON.parse(raw));
              }
            }
          } catch (dsErr) {
            console.warn("DeepSeek dialogue call error:", dsErr);
          }
        }

        // -------------------------------------------------------------
        // ZHIPU AI (GLM-4-FLASH - MIỄN PHÍ VĨNH VIỄN)
        // -------------------------------------------------------------
        if (!llmSuccess && zhipuKey) {
          try {
            const zpRes = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${zhipuKey}`,
              },
              body: JSON.stringify({
                model: "glm-4-flash",
                messages: rawChatMessages,
                temperature: 0.7,
              }),
            });
            if (zpRes.ok) {
              const zpData = await zpRes.json();
              const raw = zpData.choices?.[0]?.message?.content?.replace(/```json|```/g, "").trim();
              if (raw) {
                applyParsedResponse(JSON.parse(raw));
              }
            }
          } catch (zpErr) {
            console.warn("Zhipu GLM-4-Flash dialogue call error:", zpErr);
          }
        }

        // -------------------------------------------------------------
        // 2. DỰ PHÒNG 1: GOOGLE GEMINI (GEMINI 2.5 FLASH / LITE)
        // -------------------------------------------------------------
        if (!llmSuccess && geminiKey) {
          const geminiModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];
          for (const model of geminiModels) {
            try {
              const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }],
                    generationConfig: {
                      temperature: 0.7,
                      responseMimeType: "application/json",
                    },
                  }),
                }
              );
              if (res.ok) {
                const data = await res.json();
                const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json|```/g, "").trim();
                if (raw) {
                  if (applyParsedResponse(JSON.parse(raw))) break;
                }
              }
            } catch (e) {
              console.warn(`Gemini dialogue error on ${model}:`, e);
            }
          }
        }

        // -------------------------------------------------------------
        // 3. DỰ PHÒNG 2: GROQ OSS (OPENAI GPT-OSS / LLAMA)
        // -------------------------------------------------------------
        if (!llmSuccess && groqKey) {
          const groqFallbackModels = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
          for (const fModel of groqFallbackModels) {
            try {
              const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
                body: JSON.stringify({
                  model: fModel,
                  messages: rawChatMessages,
                  temperature: 0.7,
                  response_format: { type: "json_object" },
                }),
              });
              if (res.ok) {
                const data = await res.json();
                const raw = data.choices?.[0]?.message?.content?.replace(/```json|```/g, "").trim();
                if (raw) {
                  if (applyParsedResponse(JSON.parse(raw))) break;
                }
              }
            } catch (e) {
              console.warn(`Groq fallback model error on ${fModel}:`, e);
            }
          }
        }

        // -------------------------------------------------------------
        // 4. DỰ PHÒNG 3: OPENAI (GPT-4O-MINI)
        // -------------------------------------------------------------
        if (!llmSuccess && openAiKey) {
          try {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${openAiKey}` },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: rawChatMessages,
                temperature: 0.7,
                response_format: { type: "json_object" },
              }),
            });
            if (res.ok) {
              const data = await res.json();
              const raw = data.choices?.[0]?.message?.content?.replace(/```json|```/g, "").trim();
              if (raw) {
                applyParsedResponse(JSON.parse(raw));
              }
            }
          } catch (e) {
            console.warn("OpenAI dialogue call error:", e);
          }
        }

        // -------------------------------------------------------------
        // 5. BỘ ĐỐI THOẠI NGỮ CẢNH DỰ PHÒNG THÔNG MINH (KHI OFFLINE / KHÔNG CÓ MẠNG)
        // TRẢ LỜI ĐÍCH DANH VÀO CÂU HỎI THƯỜNG GẶP - CÓ HỎI CÓ ĐÁP RÕ RÀNG
        // -------------------------------------------------------------
        if (!llmSuccess) {
          const smartTopics = [
            // 1. Học sinh hỏi tên / giới thiệu
            {
              matcher: /叫什么|名字|谁是|你是谁|小语/u,
              replies: [
                {
                  zh: "你好呀！我是你的中文语伴，我叫小语。很高兴认识你！你叫什么名字呢？",
                  pinyin: "Nǐ hǎo ya! Wǒ shì nǐ de Zhōngwén yǔbàn, wǒ jiào Xiǎo Yǔ. Hěn gāoxìng rènshi nǐ! Nǐ jiào shénme míngzi ne?",
                  vi: "Chào bạn nhé! Mình là bạn luyện tiếng Trung của bạn, mình tên là Tiểu Ngữ. Rất vui được quen bạn! Bạn tên là gì thế?",
                  suggestions: [
                    { zh: "我叫明德，很高兴认识你！", pinyin: "Wǒ jiào Míngdé, hěn gāoxìng rènshi nǐ!", vi: "Mình tên là Minh Đức, rất vui được quen bạn!" },
                    { zh: "你可以叫我小芳。", pinyin: "Nǐ kěyǐ jiào wǒ Xiǎofāng.", vi: "Bạn có thể gọi mình là Tiểu Phương." },
                  ],
                },
              ],
            },
            // 2. Học sinh hỏi quốc tịch / nơi ở
            {
              matcher: /哪国人|哪里人|哪儿人|住在哪|什么地方|你在哪/u,
              replies: [
                {
                  zh: "我是中国人，现在住在北京。你现在生活在哪个国家或者城市呢？",
                  pinyin: "Wǒ shì Zhōngguó rén, xiànzài zhù zài Běijīng. Nǐ xiànzài shēnghuó zài nǎge guójiā huòzhě chéngshì ne?",
                  vi: "Mình là người Trung Quốc, hiện đang sống ở Bắc Kinh. Bạn đang sinh sống ở quốc gia hoặc thành phố nào vậy?",
                  suggestions: [
                    { zh: "我是越南人，我住在河内。", pinyin: "Wǒ shì Yuènán rén, wǒ zhù zài Hénèi.", vi: "Mình là người Việt Nam, mình sống ở Hà Nội." },
                    { zh: "我住在胡志明市，这里很热闹。", pinyin: "Wǒ zhù zài Húzhìmíng shì, zhèlǐ hěn rènào.", vi: "Mình sống ở TP. Hồ Chí Minh, ở đây rất nhộn nhịp." },
                  ],
                },
              ],
            },
            // 3. Học sinh hỏi đã ăn cơm chưa
            {
              matcher: /吃了吗|吃了没有|吃饭了吗|吃饱了吗/u,
              replies: [
                {
                  zh: "我已经吃过啦！今天中午吃了番茄炒蛋盖饭，特别香。你吃饱了吗？吃了什么呀？",
                  pinyin: "Wǒ yǐjīng chī guò la! Jīntiān zhōngwǔ chī le fānqié chǎodàn gàifàn, tèbié xiāng. Nǐ chī bǎo le ma? Chī le shénme ya?",
                  vi: "Mình ăn rồi nhé! Trưa nay mình ăn cơm trứng xào cà chua, thơm ngon lắm. Bạn ăn no chưa? Bạn đã ăn món gì thế?",
                  suggestions: [
                    { zh: "我刚刚吃了牛肉面，很好吃！", pinyin: "Wǒ gānggāng chī le niúròu miàn, hěn hǎochī!", vi: "Mình vừa ăn mì bò xong, ngon lắm!" },
                    { zh: "我还没吃呢，正准备去吃。", pinyin: "Wǒ hái méi chī ne, zhèng zhǔnbèi qù chī.", vi: "Mình vẫn chưa ăn, đang chuẩn bị đi ăn đây." },
                  ],
                },
              ],
            },
            // 4. Học sinh hỏi thích ăn món gì / món ngon
            {
              matcher: /喜欢吃|爱吃|想吃|什么好吃|好吃吗/u,
              replies: [
                {
                  zh: "说到好吃的，我最喜欢吃四川火锅和北方水饺！你平时最喜欢吃什么中国菜呢？",
                  pinyin: "Shuōdào hǎochī de, wǒ zuì xǐhuan chī Sìchuān huǒguō hé běifāng shuǐjiǎo! Nǐ píngshí zuì xǐhuan chī shénme Zhōngguó cài ne?",
                  vi: "Nói đến đồ ăn ngon thì mình thích ăn lẩu Tứ Xuyên và sủi cảo phương bắc nhất! Bình thường bạn thích ăn món Trung nào nhất?",
                  suggestions: [
                    { zh: "我也超喜欢吃火锅，特别是麻辣牛肉！", pinyin: "Wǒ yě chāo xǐhuan chī huǒguō, tèbié shì málà niúròu!", vi: "Mình cũng cực thích ăn lẩu, đặc biệt là thịt bò cay tê!" },
                    { zh: "我喜欢吃北京烤鸭，皮特别脆。", pinyin: "Wǒ xǐhuan chī Běijīng kǎoyā, pí tèbié cuì.", vi: "Mình thích ăn vịt quay Bắc Kinh, da cực kỳ giòn." },
                  ],
                },
              ],
            },
            // 5. Học sinh hỏi sở thích / rảnh rỗi làm gì
            {
              matcher: /喜欢做|爱好|喜欢玩|平时喜欢|周末喜欢/u,
              replies: [
                {
                  zh: "我平时最喜欢看书、听音乐，还有像现在这样和大家聊天练中文！你平时都有什么兴趣爱好呢？",
                  pinyin: "Wǒ píngshí zuì xǐhuan kànshū, tīng yīnyuè, hái yǒu xiàng xiànzài zhèyàng hé dàjiā liáotiān liàn Zhōngwén! Nǐ píngshí dōu yǒu shénme xìngqù àihào ne?",
                  vi: "Bình thường mình thích đọc sách, nghe nhạc, và thích trò chuyện luyện tiếng Trung cùng các bạn như thế này! Bạn có sở thích gì nào?",
                  suggestions: [
                    { zh: "我喜欢听中文歌和看电影。", pinyin: "Wǒ xǐhuan tīng Zhōngwén gē hé kàn diànyǐng.", vi: "Mình thích nghe nhạc Hoa và xem phim." },
                    { zh: "我喜欢去健身房运动，踢足球。", pinyin: "Wǒ xǐhuan qù jiànshēnfáng yùndòng, tī zúqiú.", vi: "Mình thích đi tập gym vận động, đá bóng." },
                  ],
                },
              ],
            },
            // 6. Học sinh hỏi thời tiết
            {
              matcher: /天气|冷不冷|热不热|下雨了吗|温度/u,
              replies: [
                {
                  zh: "今天我这边天气很晴朗，微风徐徐，感觉挺舒服的。你那里的天气怎么样？冷不冷呀？",
                  pinyin: "Jīntiān wǒ zhèbiān tiānqì hěn qínglǎng, wēifēng xúxú, gǎnjué tǐng shūfu de. Nǐ nàlǐ de tiānqì zěnmeyàng? Lěng bu lěng ya?",
                  vi: "Hôm nay chỗ mình trời rất quang đãng, gió thổi nhẹ nhàng, cảm giác dễ chịu lắm. Thời tiết chỗ bạn thế nào? Có lạnh không?",
                  suggestions: [
                    { zh: "今天挺凉快的，温度刚刚好。", pinyin: "Jīntiān tǐng liángkuai de, wēndù gānggāng hǎo.", vi: "Hôm nay khá mát mẻ, nhiệt độ vừa đẹp." },
                    { zh: "我这边下雨了，有点冷。", pinyin: "Wǒ zhèbiān xià yǔ le, yǒudiǎn lěng.", vi: "Chỗ mình đang mưa, hơi lạnh chút." },
                  ],
                },
              ],
            },
            // 7. Học sinh hỏi sức khỏe / ngày hôm nay thế nào
            {
              matcher: /你好吗|好不好|身体好|累不累|忙不忙|过得怎么样/u,
              replies: [
                {
                  zh: "我今天挺好的，心情也很不错！谢谢你的关心。你今天过得怎么样？工作学习顺利吗？",
                  pinyin: "Wǒ jīntiān tǐng hǎo de, xīnqíng yě hěn búcuò! Xièxie nǐ de guānxīn. Nǐ jīntiān guò de zěnmeyàng? Gōngzuò xuéxí shùnlì ma?",
                  vi: "Mình hôm nay ổn lắm, tâm trạng rất tốt! Cảm ơn bạn đã hỏi thăm. Hôm nay bạn thế nào? Công việc học tập suôn sẻ chứ?",
                  suggestions: [
                    { zh: "我今天一切都挺顺利的，很开心！", pinyin: "Wǒ jīntiān yíqiè dōu tǐng shùnlì de, hěn kāixīn!", vi: "Hôm nay mọi việc của mình đều suôn sẻ, rất vui vẻ!" },
                    { zh: "今天事情有点多，有点累。", pinyin: "Jīntiān shìqing yǒudiǎn duō, yǒudiǎn lèi.", vi: "Hôm nay việc hơi nhiều nên có chút mệt mỏi." },
                  ],
                },
              ],
            },
            // 8. Tâm sự mệt mỏi / áp lực / thi trượt
            {
              matcher: /累|烦|难过|伤心|不开心|没考好|考得不好|压力/u,
              replies: [
                {
                  zh: "听到你这么说，真想给你一个大大的拥抱！遇到挫折没关系的，深呼吸放松一下。愿意跟我说说发生什么事了吗？",
                  pinyin: "Tīngdào nǐ zhème shuō, zhēn xiǎng gěi nǐ yí ge dàdà de yōngbào! Yùdào cuòzhé méi guānxi de, shēnhūxī fàngsōng yíxià. Yuànyì gēn wǒ shuōshuo fāshēng shénme shì le ma?",
                  vi: "Nghe bạn kể mình thật sự muốn ôm bạn một cái! Gặp chút trắc trở không sao cả, hít thở sâu thư giãn nhé. Bạn có muốn kể cho mình nghe chuyện gì xảy ra không?",
                  suggestions: [
                    { zh: "就是考试没考好，有点失落。", pinyin: "Jiù shì kǎoshì méi kǎo hǎo, yǒudiǎn shīluò.", vi: "Chỉ là thi không tốt lắm, hơi hụt hẫng chút thôi." },
                    { zh: "工作遇到难题，有点烦心。", pinyin: "Gōngzuò yùdào nántí, yǒudiǎn fánxīn.", vi: "Công việc gặp chuyện nan giải nên hơi bận lòng." },
                  ],
                },
              ],
            },
            // 9. Vui mừng / thành công / khoe chuyện vui
            {
              matcher: /开心|高兴|太棒了|通过了|考得好|成功/u,
              replies: [
                {
                  zh: "太替你开心啦！这么棒的好消息，今晚一定要好好庆祝犒劳一下自己！快跟我分享分享具体的经过呗！",
                  pinyin: "Tài tì nǐ kāixīn la! Zhème bàng de hǎoxiāoxi, jīnwǎn yídìng yào hǎohāo qìngzhù kàolao yíxià zìjǐ! Kuài gēn wǒ fēnxiǎng fēnxiǎng jùtǐ de jīngguò bei!",
                  vi: "Quá vui mừng thay cho bạn! Tin tức tuyệt vời thế này tối nay nhớ ăn mừng tự thưởng bản thân nhé! Mau chia sẻ với mình chi tiết nào!",
                  suggestions: [
                    { zh: "我通过了HSK考试，太激动了！", pinyin: "Wǒ tōngguò le HSK kǎoshì, tài jīdòng le!", vi: "Mình đã thi đỗ kỳ thi HSK rồi, xúc động quá!" },
                    { zh: "今天受到了老师的表扬！", pinyin: "Jīntiān shòudào le lǎoshī de biǎoyáng!", vi: "Hôm nay mình được thầy cô khen ngợi!" },
                  ],
                },
              ],
            },
            // 10. Chào hỏi ban đầu
            {
              matcher: /好|您好|你好|嗨|哈喽|早上好|晚上好/u,
              replies: [
                {
                  zh: "哈喽！见到你真高兴。今天一切都顺利吗？想跟我聊点什么有意思的话题呢？",
                  pinyin: "Hālóu! Jiàndào nǐ zhēn gāoxìng. Jīntiān yíqiè dōu shùnlì ma? Xiǎng gēn wǒ liáo diǎn shénme yǒu yìsi de huàtí ne?",
                  vi: "Chào bạn nhé! Gặp bạn vui ghê. Hôm nay mọi chuyện ổn chứ? Bạn muốn cùng mình nói về chủ đề thú vị nào đây?",
                  suggestions: [
                    { zh: "我想聊聊今天的生活。", pinyin: "Wǒ xiǎng liáoliao jīntiān de shēnghuó.", vi: "Mình muốn kể về cuộc sống hôm nay." },
                    { zh: "我想练练日常买东西的对话。", pinyin: "Wǒ xiǎng liànlian rìcháng mǎi dōngxi de duìhuà.", vi: "Mình muốn luyện đối thoại đi mua đồ hàng ngày." },
                  ],
                },
              ],
            },
            // 11. Cảm ơn
            {
              matcher: /谢谢|多谢|感谢/u,
              replies: [
                {
                  zh: "不用客气呀！能陪你一起练习中文我也觉得超级开心。你今天还想再多聊聊什么吗？",
                  pinyin: "Búyòng kèqi ya! Néng péi nǐ yìqǐ liànxí Zhōngwén wǒ yě juéde chāojí kāixīn. Nǐ jīntiān hái xiǎng zài duō liáoliao shénme ma?",
                  vi: "Đừng khách sáo nhé! Được đồng hành cùng bạn luyện tiếng Trung mình cũng thấy vui lắm. Hôm nay bạn còn muốn nói chuyện tiếp về gì nữa không?",
                  suggestions: [
                    { zh: "今天就先聊到这里吧，下次再见！", pinyin: "Jīntiān jiù xiān liáo dào zhèlǐ ba, xià cì zàijiàn!", vi: "Hôm nay trò chuyện tới đây thôi nhé, hẹn lần sau gặp lại!" },
                    { zh: "我想再跟你聊会儿中国文化。", pinyin: "Wǒ xiǎng zài gēn nǐ liáo huìr Zhōngguó wénhuà.", vi: "Mình muốn nói thêm chút về văn hóa Trung Quốc với bạn." },
                  ],
                },
              ],
            },
            // 12. Tạm biệt
            {
              matcher: /再见|拜拜|下次聊|明天见/u,
              replies: [
                {
                  zh: "好的呀！今天聊得超级开心。记得经常来找我练习口语哦，祝你度过愉快的一天，再见啦！",
                  pinyin: "Hǎo de ya! Jīntiān liáo de chāojí kāixīn. Jìde jīngcháng lái zhǎo wǒ liànxí kǒuyǔ o, zhù nǐ dùguò yúkuài de yì tiān, zàijiàn la!",
                  vi: "Vâng ạ! Hôm nay trò chuyện vui vẻ lắm. Nhớ thường xuyên ghé qua cùng mình luyện khẩu ngữ nhé, chúc bạn một ngày tuyệt vời, tạm biệt bạn!",
                  suggestions: [
                    { zh: "好的，再见！祝你开心！", pinyin: "Hǎo de, zàijiàn! Zhù nǐ kāixīn!", vi: "Được rồi, tạm biệt! Chúc bạn vui vẻ!" },
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
                  zh: `听你这么一说，我也觉得挺有意思的！关于“${spokenClean.slice(0, 8)}”，你还有什么特别的想法吗？`,
                  pinyin: `Tīng nǐ zhème yì shuō, wǒ yě juéde tǐng yǒu yìsi de! Guānyú “${spokenClean.slice(0, 8)}”, nǐ hái yǒu shénme tèbié de xiǎngfǎ ma?`,
                  vi: `Nghe bạn chia sẻ mình thấy rất thú vị! Bạn có cảm nghĩ đặc biệt nào khác nữa không?`,
                  suggestions: [
                    { zh: "我想听听你的看法。", pinyin: "Wǒ xiǎng tīngting nǐ de kànfǎ.", vi: "Mình muốn lắng nghe góc nhìn của bạn." },
                    { zh: "我觉得这很有挑战性。", pinyin: "Wǒ juéde zhè hěn yǒu tiǎozhànxìng.", vi: "Mình thấy điều này khá là thử thách." },
                  ],
                },
              ],
            };
          }

          const randomReply = matchedTopic.replies[Math.floor(Math.random() * matchedTopic.replies.length)];
          aiReplyZh = randomReply.zh;
          aiReplyPinyin = randomReply.pinyin;
          aiReplyVi = randomReply.vi;
          suggestedReplies = randomReply.suggestions;
        }
      }
    }

    // Bổ trợ so khớp từ khóa nhiệm vụ tình huống nếu LLM chưa kịp đánh dấu
    if (mode === "SCENARIO" && completedMissionId === null && Array.isArray(scenarioMissions)) {
      for (const m of scenarioMissions) {
        if (m.hintZh) {
          const hintKeywords = m.hintZh.replace(/[.,?!，。？！\s]/g, "");
          const words = hintKeywords.match(/[\p{Script=Han}]{2,}/gu) || [];
          const hasKeyword = words.some((w: string) => spokenClean.includes(w));
          if (hasKeyword) {
            completedMissionId = m.id;
            break;
          }
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
      grammarCorrection,
      grammarTip,
      suggestedReplies,
      completedMissionId,
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
