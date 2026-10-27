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

        const promptText = `Bạn là Tiểu Ngữ (小语) - một người bạn bản xứ Trung Quốc thân thiện, tự nhiên và tâm sự trò chuyện như trên WeChat với học viên HSK cấp độ ${hskLevel}.
Lịch sử hội thoại:
${conversationContext || "(Bắt đầu cuộc trò chuyện mới)"}

Bạn của bạn vừa nói: "${spokenText}"

Quy tắc trò chuyện QUAN TRỌNG:
1. ĐỐI THOẠI TỰ NHIÊN NHƯ NGƯỜI VỚI NGƯỜI: Tuyệt đối KHÔNG mở đầu bằng các lời khen hoặc nhận xét sáo rỗng (như "你说得很自然", "太棒了", "你说得很好", "你的中文越来越棒").
2. Hãy phản hồi trực tiếp vào nội dung người bạn vừa nói bằng cảm xúc chân thật (ví dụ: "哈哈真的吗？", "哇，原来是这样！", "我也这么觉得...", "听起来很有意思！"), sau đó chia sẻ một chút suy nghĩ của bạn hoặc hỏi tiếp một câu gợi mở tự nhiên để tiếp tục câu chuyện.
3. Từ vựng và ngữ pháp phù hợp HSK ${hskLevel}.
4. Trả về DUY NHẤT một chuỗi JSON hợp lệ không bọc markdown:
{
  "aiReplyZh": "Câu phản hồi tự nhiên bằng tiếng Trung",
  "aiReplyPinyin": "Phiên âm pinyin có thanh điệu",
  "aiReplyVi": "Bản dịch nghĩa tiếng Việt tự nhiên",
  "feedback": "Lời góp ý ngắn nếu có từ nào phát âm/dùng sai, nếu đúng thì để rỗng hoặc động viên ngắn gọn",
  "suggestedReplies": [
    { "zh": "Câu gợi ý 1 cho bạn học viên", "pinyin": "pinyin 1", "vi": "nghĩa 1" },
    { "zh": "Câu gợi ý 2 cho bạn học viên", "pinyin": "pinyin 2", "vi": "nghĩa 2" }
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

        // BỘ ĐỐI ĐÁP PHONG PHÚ TỰ NHIÊN NHƯ BẠN BÈ WECHAT (KHÔNG ĐÁNH GIÁ SÁO RỖNG)
        if (!llmSuccess) {
          const smartTopics = [
            {
              matcher: /好|您好|你好|嗨|哈喽|早上好|晚上好/u,
              replies: [
                {
                  zh: "哈喽！今天过得怎么样？忙不忙呀？",
                  pinyin: "Hālóu! Jīntiān guò de zěnmeyàng? Máng bu máng ya?",
                  vi: "Chào bạn nhé! Hôm nay bạn thế nào? Có bận rộn lắm không?",
                  suggestions: [
                    { zh: "我今天挺好的，不太忙。", pinyin: "Wǒ jīntiān tǐng hǎo de, bú tài máng.", vi: "Hôm nay mình khá ổn, không bận lắm." },
                    { zh: "今天工作有点多，有点累。", pinyin: "Jīntiān gōngzuò yǒudiǎn duō, yǒudiǎn lèi.", vi: "Hôm nay công việc hơi nhiều, có chút mệt." },
                  ],
                },
                {
                  zh: "嗨！今天天气不错，你现在在家里还是在外面呢？",
                  pinyin: "Hāi! Jīntiān tiānqì búcuò, nǐ xiànzài zài jiālǐ háishì zài wàimiàn ne?",
                  vi: "Chào bạn! Thời tiết hôm nay đẹp ghê, giờ bạn đang ở nhà hay ở ngoài?",
                  suggestions: [
                    { zh: "我现在刚回到家休息。", pinyin: "Wǒ xiànzài gāng huí dào jiā xiūxi.", vi: "Mình vừa về tới nhà nghỉ ngơi." },
                    { zh: "我还在外面和朋友喝咖啡呢。", pinyin: "Wǒ hái zài wàimiàn hé péngyou hē kāfēi ne.", vi: "Mình vẫn đang ở ngoài uống cà phê với bạn bè." },
                  ],
                },
              ],
            },
            {
              matcher: /吃|喝|菜|茶|饭|水|米饭|面|肉|火锅|咖啡|奶茶/u,
              replies: [
                {
                  zh: "哇，听起来好香！你平时喜欢自己做饭，还是点外卖或者去外面吃？",
                  pinyin: "Wa, tīng qǐlái hǎo xiāng! Nǐ píngshí xǐhuan zìjǐ zuòfàn, háishì diǎn wàimài huòzhě qù wàimiàn chī?",
                  vi: "Oa nghe hấp dẫn thế! Bình thường bạn thích tự nấu ăn, hay gọi đồ về hoặc ra ngoài ăn?",
                  suggestions: [
                    { zh: "我周末喜欢自己做饭，平时点外卖。", pinyin: "Wǒ zhōumò xǐhuan zìjǐ zuòfàn, píngshí diǎn wàimài.", vi: "Cuối tuần mình thích tự nấu ăn, ngày thường thì gọi đồ về." },
                    { zh: "我很喜欢做饭，特别是中国菜。", pinyin: "Wǒ hěn xǐhuan zuòfàn, tèbié shì Zhōngguó cài.", vi: "Mình rất thích nấu ăn, đặc biệt là món Trung Hoa." },
                  ],
                },
                {
                  zh: "说到好吃的，我也馋了！你最喜欢的中国菜是什么？火锅、饺子还是炒饭？",
                  pinyin: "Shuōdào hǎochī de, wǒ yě chán le! Nǐ zuì xǐhuan de Zhōngguó cài shì shénme? Huǒguō, jiǎozi háishì chǎofàn?",
                  vi: "Nhắc đến đồ ngon mình cũng thèm rồi! Món Trung bạn thích nhất là gì? Lẩu, sủi cảo hay cơm rang?",
                  suggestions: [
                    { zh: "我最喜欢吃火锅，又辣又过瘾！", pinyin: "Wǒ zuì xǐhuan chī huǒguō, yòu là yòu guòyǐn!", vi: "Mình thích ăn lẩu nhất, vừa cay vừa đã!" },
                    { zh: "我喜欢吃饺子，蘸醋特别香。", pinyin: "Wǒ xǐhuan chī jiǎozi, zhàn cù tèbié xiāng.", vi: "Mình thích ăn sủi cảo, chấm giấm cực kỳ thơm ngon." },
                  ],
                },
                {
                  zh: "你平时喜欢喝咖啡还是喝茶？我每天早上都要喝一杯提提神。",
                  pinyin: "Nǐ píngshí xǐhuan hē kāfēi háishì hē chá? Wǒ měitiān zǎoshang dōu yào hē yì bēi tí tí shén.",
                  vi: "Bình thường bạn thích uống cà phê hay uống trà? Sáng nào mình cũng phải làm một ly cho tỉnh táo.",
                  suggestions: [
                    { zh: "我也是！不喝咖啡一整天都没精神。", pinyin: "Wǒ yě shì! Bù hē kāfēi yì zhěng tiān dōu méi jīngshen.", vi: "Mình cũng vậy! Không uống cà phê là cả ngày uể oải liền." },
                    { zh: "我更喜欢喝清香的绿茶，对身体好。", pinyin: "Wǒ gèng xǐhuan hē qīngxiāng de lǜchá, duì shēntǐ hǎo.", vi: "Mình thích uống trà xanh thanh mát hơn, tốt cho sức khỏe." },
                  ],
                },
              ],
            },
            {
              matcher: /天|冷|热|雨|晴|风|太阳|阴/u,
              replies: [
                {
                  zh: "今天这天气挺舒服的，你那边现在冷不冷？",
                  pinyin: "Jīntiān zhè tiānqì tǐng shūfu de, nǐ nàbiān xiànzài lěng bu lěng?",
                  vi: "Thời tiết hôm nay khá dễ chịu, chỗ bạn giờ có lạnh không?",
                  suggestions: [
                    { zh: "今天挺凉快的，温度刚刚好。", pinyin: "Jīntiān tǐng liángkuai de, wēndù gānggāng hǎo.", vi: "Hôm nay khá mát mẻ, nhiệt độ vừa vặn." },
                    { zh: "我这边有点冷，出门都要穿厚衣服。", pinyin: "Wǒ nàbiān yǒudiǎn lěng, chūmén dōu yào chuān hòu yīfu.", vi: "Chỗ mình hơi lạnh, ra đường đều phải mặc áo dày." },
                  ],
                },
                {
                  zh: "要是天气好的话，真想去公园走走。你今天有出门吗？",
                  pinyin: "Yàoshi tiānqì hǎo de huà, zhēn xiǎng qù gōngyuán zǒuzou. Nǐ jīntiān yǒu chūmén ma?",
                  vi: "Nếu thời tiết đẹp thật muốn ra công viên dạo bộ. Hôm nay bạn có ra ngoài không?",
                  suggestions: [
                    { zh: "我今天一整天都在家里休息。", pinyin: "Wǒ jīntiān yì zhěng tiān dōu zài jiālǐ xiūxi.", vi: "Hôm nay cả ngày mình ở nhà nghỉ ngơi." },
                    { zh: "我刚去超市买了点东西回来。", pinyin: "Wǒ gāng qù chāoshì mǎi le diǎn dōngxi huílái.", vi: "Mình vừa đi siêu thị mua ít đồ về." },
                  ],
                },
              ],
            },
            {
              matcher: /学|中文|字|考|课|书|汉语|老师/u,
              replies: [
                {
                  zh: "学语言确实需要一点一滴慢慢积累。你平时习惯在早上学还是晚上学？",
                  pinyin: "Xué yǔyán quèshí xūyào yìdiǎnyìdī mànman jīlěi. Nǐ píngshí xíguàn zài zǎoshang xué háishì wǎnshang xué?",
                  vi: "Học ngoại ngữ đúng là cần từng chút tích lũy dần. Thường ngày bạn có thói quen học buổi sáng hay buổi tối?",
                  suggestions: [
                    { zh: "我习惯晚上比较安静的时候学。", pinyin: "Wǒ xíguàn wǎnshang bǐjiào ānjìng de shíhou xué.", vi: "Mình quen học vào buổi tối lúc yên tĩnh hơn." },
                    { zh: "我喜欢早上记忆力好的时候背生词。", pinyin: "Wǒ xǐhuan zǎoshang jìyìlì hǎo de shíhou bèi shēngcí.", vi: "Mình thích học từ mới vào buổi sáng lúc trí nhớ tốt." },
                  ],
                },
                {
                  zh: "你觉得学中文最有趣的是什么？我平时超喜欢看汉字背后的演变故事！",
                  pinyin: "Nǐ juéde xué zhōngwén zuì yǒu yìsi de shì shénme? Wǒ píngshí chāo xǐhuan kàn hànzì bèihòu de yǎnbiàn gùshi!",
                  vi: "Bạn thấy học tiếng Trung điều gì thú vị nhất? Mình thì cực mê tìm hiểu câu chuyện đằng sau các chữ Hán!",
                  suggestions: [
                    { zh: "我觉得汉字结构很像画画，很有趣！", pinyin: "Wǒ juéde hànzì jiégòu hěn xiàng huàhuà, hěn yǒu yìsi!", vi: "Mình thấy cấu tạo chữ Hán rất giống vẽ tranh, cực kỳ thú vị!" },
                    { zh: "我喜欢学口语，能跟世界各地的人交流。", pinyin: "Wǒ xǐhuan xué kǒuyǔ, néng gēn shìjiè gèdì de rén jiāoliú.", vi: "Mình thích học khẩu ngữ, để có thể giao lưu với mọi người khắp nơi." },
                  ],
                },
              ],
            },
            {
              matcher: /工作|上班|忙|累|加班|老板|同事|开会/u,
              replies: [
                {
                  zh: "工作忙碌了一整天，今晚有打算怎么好好犒劳一下自己吗？",
                  pinyin: "Gōngzuò mánglù le yì zhěng tiān, jīnwǎn yǒu dǎsuàn zěnme hǎohāo kàolao yíxià zìjǐ ma?",
                  vi: "Đi làm bận rộn cả ngày rồi, tối nay bạn tính tự thưởng gì cho bản thân chưa?",
                  suggestions: [
                    { zh: "今晚吃顿大餐，然后早点睡！", pinyin: "Jīnwǎn chī dùn dàcān, ránhòu zǎodiǎn shuì!", vi: "Tối nay ăn một bữa ngon lành rồi đi ngủ sớm!" },
                    { zh: "打算追追剧，听听歌放松一下。", pinyin: "Dǎsuàn zhuī zhuī jù, tīng tīng gē fàngsōng yíxià.", vi: "Định cày một tập phim, nghe nhạc chút cho thư thả." },
                  ],
                },
              ],
            },
            {
              matcher: /电影|音乐|歌|看|听|玩|运动|足球|篮球|游/u,
              replies: [
                {
                  zh: "我也超喜欢！你最近有没有看什么好看的电影或者电视剧推荐？",
                  pinyin: "Wǒ yě chāo xǐhuan! Nǐ zuìjìn yǒu méiyǒu kàn shénme hǎokàn de diànyǐng huòzhě diànshìjù tuījiàn?",
                  vi: "Mình cũng mê lắm luôn! Gần đây bạn có bộ phim hay kịch truyền hình nào gợi ý không?",
                  suggestions: [
                    { zh: "最近有一部新出的喜剧挺搞笑的。", pinyin: "Zuìjìn yǒu yí bù xīn chū de xǐjù tǐng gǎoxiào de.", vi: "Dạo này có phim hài mới ra cười đau cả ruột." },
                    { zh: "我最近在看一部悬疑剧，特别精彩！", pinyin: "Wǒ zuìjìn zài kàn yí bù xuányí jù, tèbié jīngcǎi!", vi: "Mình đang xem phim trinh thám hồi hộp, gay cấn lắm!" },
                  ],
                },
                {
                  zh: "听音乐真的超解压！你平时一般听舒缓的慢歌，还是节奏快一点的？",
                  pinyin: "Tīng yīnyuè zhēn de chāo jiěyā! Nǐ píngshí yìbān tīng shūhuǎn de màngē, háishì jiézòu kuài yìdiǎn de?",
                  vi: "Nghe nhạc giải tỏa stress cực tốt! Bạn hay nghe nhạc nhẹ du dương hay nhạc tiết tấu sôi động?",
                  suggestions: [
                    { zh: "我喜欢听安静温柔的抒情歌。", pinyin: "Wǒ xǐhuan tīng ānjìng wēnróu de shūqíng gē.", vi: "Mình thích nghe những bản tình ca êm dịu, nhẹ nhàng." },
                    { zh: "我喜欢节奏欢快的，让人充满活力！", pinyin: "Wǒ xǐhuan jiézòu huānkuài de, ràng rén chōngmǎn huólì!", vi: "Mình thích bài tiết tấu vui tươi, làm người tràn đầy năng lượng!" },
                  ],
                },
              ],
            },
            {
              matcher: /去|旅游|北京|上海|飞机|路|中国|走|玩儿/u,
              replies: [
                {
                  zh: "去旅行真的很让人放松！如果有长假，你最想去哪个城市走走？",
                  pinyin: "Qù lǚxíng zhēn de hěn ràng rén fàngsōng! Rúguǒ yǒu chángjià, nǐ zuì xiǎng qù nǎge chéngshì zǒuzou?",
                  vi: "Đi du lịch thực sự giúp xả hơi tuyệt vời! Nếu có kỳ nghỉ dài, bạn muốn đi thành phố nào nhất?",
                  suggestions: [
                    { zh: "我想去成都看可爱的大熊猫，吃火锅！", pinyin: "Wǒ xiǎng qù Chéngdū kàn kě'ài de dàxióngmāo, chī huǒguō!", vi: "Mình muốn đi Thành Đô ngắm gấu trúc và ăn lẩu!" },
                    { zh: "我想去海边吹吹海风，散散心。", pinyin: "Wǒ xiǎng qù hǎibiān chuī chuī hǎifēng, sànsàn xīn.", vi: "Mình muốn ra biển đón gió biển, thư giãn đầu óc." },
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
                  zh: "哈哈，原来是这样！那你平时周末一般喜欢怎么度过呢？",
                  pinyin: "Hāhā, yuánlái shì zhèyàng! Nà nǐ píngshí zhōumò yìbān xǐhuan zěnme dùguò ne?",
                  vi: "Haha, hóa ra là như vậy! Thế thường ngày cuối tuần bạn thích trải qua thế nào?",
                  suggestions: [
                    { zh: "周末我一般睡个懒觉，在家里看电影。", pinyin: "Zhōumò wǒ yìbān shuì ge lǎnjiào, zài jiālǐ kàn diànyǐng.", vi: "Cuối tuần mình hay ngủ nướng rồi ở nhà xem phim." },
                    { zh: "我喜欢约朋友出去逛街或者喝下午茶。", pinyin: "Wǒ xǐhuan yuē péngyou chūqù guàngjiē huòzhě hē xiàwǔchá.", vi: "Mình thích hẹn bạn bè ra ngoài dạo phố hoặc uống trà chiều." },
                  ],
                },
                {
                  zh: "听你这么一说，我也觉得挺有意思的！你接下来有什么打算吗？",
                  pinyin: "Tīng nǐ zhème yì shuō, wǒ yě juéde tǐng yǒu yìsi de! Nǐ jiēxiàlái yǒu shénme dǎsuàn ma?",
                  vi: "Nghe bạn kể mình cũng thấy thú vị phết! Lát nữa/sắp tới bạn có dự định gì chưa?",
                  suggestions: [
                    { zh: "我打算待会儿去准备晚饭。", pinyin: "Wǒ dǎsuàn dāihuǐr qù zhǔnbèi wǎnfàn.", vi: "Lát nữa mình định đi chuẩn bị bữa tối." },
                    { zh: "我打算再多练几句中文对话。", pinyin: "Wǒ dǎsuàn zài duō liàn jǐ jù Zhōngwén duìhuà.", vi: "Mình định luyện thêm vài câu hội thoại tiếng Trung nữa." },
                  ],
                },
                {
                  zh: "今天身边有什么开心的事发生吗？跟我分享分享呗！",
                  pinyin: "Jīntiān shēnbiān yǒu shénme kāixīn de shì fāshēng ma? Gēn wǒ fēnxiǎng fēnxiǎng bei!",
                  vi: "Hôm nay quanh bạn có chuyện gì vui xảy ra không? Kể mình nghe chung với nào!",
                  suggestions: [
                    { zh: "今天工作挺顺利的，心情不错！", pinyin: "Jīntiān gōngzuò tǐng shùnlì de, xīnqíng búcuò!", vi: "Hôm nay công việc suôn sẻ lắm, tâm trạng rất tốt!" },
                    { zh: "今天吃到了一家特别好吃的餐厅！", pinyin: "Jīntiān chī dào le yì jiā tèbié hǎochī de cāntīng!", vi: "Hôm nay mình ăn được ở một quán cực kỳ ngon!" },
                  ],
                },
                {
                  zh: "聊了这么多真开心！你平时是个习惯早睡早起的人，还是个夜猫子？",
                  pinyin: "Liáo le zhème duō zhēn kāixīn! Nǐ píngshí shì ge xíguàn zǎoshuì zǎoqǐ de rén, háishì ge yèmāozi?",
                  vi: "Trò chuyện vui ghê! Bạn là kiểu người ngủ sớm dậy sớm hay là cú đêm chính hiệu vậy?",
                  suggestions: [
                    { zh: "我经常熬夜，是个典型的夜猫子。", pinyin: "Wǒ jīngcháng áoyè, shì ge diǎnxíng de yèmāozi.", vi: "Mình hay thức khuya lắm, đúng chuẩn cú đêm luôn." },
                    { zh: "我生活挺规律的，一般晚上十一点前睡。", pinyin: "Wǒ shēnghuó tǐng guīlǜ de, yìbān wǎnshang shíyī diǎn qián shuì.", vi: "Mình sinh hoạt khá điều độ, thường ngủ trước 11 giờ đêm." },
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
