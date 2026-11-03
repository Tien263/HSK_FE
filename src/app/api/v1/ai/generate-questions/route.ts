import {portalUser,teacherOnly,PortalError} from "@/lib/portal-auth";
import { NextResponse } from "next/server";
import { checkAndConsumeAiQuota, getClientIp } from "@/lib/ai-rate-limiter";

export async function POST(request: Request) {
  try {
    const user = await portalUser(request);
    teacherOnly(user);

    const clientIp = getClientIp(request);
    const quotaCheck = await checkAndConsumeAiQuota({
      userId: user.id,
      clientIp,
      cost: 1,
    });

    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "QUOTA_EXCEEDED",
          message: quotaCheck.errorMessage || "Bạn đã dùng hết hạn mức AI hôm nay.",
          aiQuota: quotaCheck,
        },
        { status: 429 }
      );
    }
    const body = await request.json();
    const {
      topic = "Gia đình và Đời sống hàng ngày",
      hskLevel = 1,
      count = 3,
      type = "multiple_choice",
      contextText = "",
    } = body;

    // Đọc các khóa API: Doubao (ByteDance) -> Qwen (Alibaba) -> Groq (Qwen) -> OpenRouter -> Gemini -> OpenAI
    const doubaoKey = process.env.DOUBAO_API_KEY || process.env.VOLCANO_API_KEY;
    const doubaoEndpoint = process.env.DOUBAO_ENDPOINT_ID || process.env.DOUBAO_MODEL || "doubao-pro-4k";
    const qwenKey = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    const promptText = `Bạn là chuyên gia sư phạm tiếng Trung HSK hàng đầu. Hãy tạo ${count} câu hỏi HSK cấp độ ${hskLevel} về chủ đề "${topic}".
Dạng câu hỏi: ${type}.
Ngữ cảnh/Tài liệu tham khảo: ${contextText || "Không có ngữ cảnh bổ sung"}.
Yêu cầu bắt buộc: Trả về duy nhất định dạng JSON thuần túy (không kèm markdown \`\`\`json) với mảng các object như sau:
[
  {
    "type": "${type}",
    "content": "Nội dung câu hỏi tiếng Trung và tiếng Việt",
    "pinyinPrompt": "phiên âm pinyin nếu có",
    "options": [{"id": "A", "text": "đáp án A"}, {"id": "B", "text": "đáp án B"}, {"id": "C", "text": "đáp án C"}, {"id": "D", "text": "đáp án D"}],
    "correctAnswer": "A",
    "points": 5,
    "explanation": "giải thích sư phạm chi tiết"
  }
]`;

    // -------------------------------------------------------------
    // 0. BYTEDANCE DOUBAO (豆包 - VOLCANO ENGINE ARK)
    // -------------------------------------------------------------
    if (doubaoKey) {
      try {
        const doubaoRes = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${doubaoKey}`,
          },
          body: JSON.stringify({
            model: doubaoEndpoint,
            messages: [
              { role: "system", content: "You are an expert Chinese HSK test creator. Respond only with raw JSON array." },
              { role: "user", content: promptText },
            ],
            temperature: 0.7,
          }),
        });

        const doubaoData = await doubaoRes.json();
        if (doubaoRes.ok) {
          const raw = doubaoData.choices?.[0]?.message?.content || "[]";
          const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            return NextResponse.json({
              success: true,
              count: parsed.length,
              questions: parsed,
              provider: `ByteDance Doubao (${doubaoEndpoint})`,
            });
          }
        }
      } catch (doubaoErr) {
        console.warn("Doubao Volcano Ark call failed:", doubaoErr);
      }
    }

    // -------------------------------------------------------------
    // 1. QWEN (ALIBABA CLOUD DASHSCOPE)
    // -------------------------------------------------------------
    if (qwenKey) {
      try {
        const qwenRes = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${qwenKey}`,
          },
          body: JSON.stringify({
            model: "qwen-turbo",
            messages: [
              { role: "system", content: "You are an expert Chinese HSK test creator. Respond only with raw JSON array." },
              { role: "user", content: promptText },
            ],
            temperature: 0.7,
          }),
        });

        const qwenData = await qwenRes.json();
        if (qwenRes.ok) {
          const raw = qwenData.choices?.[0]?.message?.content || "[]";
          const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
          return NextResponse.json({
            success: true,
            isMock: false,
            provider: "Alibaba Qwen (Tongyi Qianwen)",
            items: parsed,
          });
        }
      } catch (qwenErr) {
        console.warn("Qwen DashScope call failed:", qwenErr);
      }
    }

    // -------------------------------------------------------------
    // 2. GROQ CLOUD (MIỄN PHÍ, HỖ TRỢ QWEN TIẾNG TRUNG)
    // -------------------------------------------------------------
    if (groqKey) {
      try {
        // Model Qwen tiếng Trung chính thức trên Groq: qwen/qwen3.8-27b
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "qwen/qwen3.8-27b",
            messages: [
              { role: "system", content: "You are an expert Chinese HSK test creator. Respond only with raw JSON array." },
              { role: "user", content: promptText },
            ],
            temperature: 0.7,
          }),
        }).catch(() => null);

        let groqData: any = null;
        if (groqRes && groqRes.ok) {
          groqData = await groqRes.json();
        } else {
          // Fallback sang openai/gpt-oss-120b trên Groq
          const fallbackRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: "openai/gpt-oss-120b",
              messages: [
                { role: "system", content: "You are an expert Chinese HSK test creator. Respond only with raw JSON array." },
                { role: "user", content: promptText },
              ],
              temperature: 0.7,
            }),
          });
          if (fallbackRes.ok) {
            groqData = await fallbackRes.json();
          }
        }

        if (groqData) {
          const raw = groqData.choices?.[0]?.message?.content || "[]";
          const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
          return NextResponse.json({
            success: true,
            isMock: false,
            provider: "Groq Cloud (Qwen/Llama)",
            items: parsed,
          });
        }
      } catch (groqErr) {
        console.warn("Groq call failed:", groqErr);
      }
    }

    // -------------------------------------------------------------
    // 3. OPENROUTER (FREE QWEN 2.5 72B)
    // -------------------------------------------------------------
    if (openRouterKey) {
      try {
        const routerRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openRouterKey}`,
          },
          body: JSON.stringify({
            model: "qwen/qwen-2.5-72b-instruct:free",
            messages: [
              { role: "system", content: "You are an expert Chinese HSK test creator. Respond only with raw JSON array." },
              { role: "user", content: promptText },
            ],
            temperature: 0.7,
          }),
        });

        const routerData = await routerRes.json();
        if (routerRes.ok) {
          const raw = routerData.choices?.[0]?.message?.content || "[]";
          const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
          return NextResponse.json({
            success: true,
            isMock: false,
            provider: "OpenRouter (Qwen 2.5 72B Free)",
            items: parsed,
          });
        }
      } catch (routerErr) {
        console.warn("OpenRouter call failed:", routerErr);
      }
    }

    // -------------------------------------------------------------
    // 4. GOOGLE GEMINI (FREE)
    // -------------------------------------------------------------
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
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

        const geminiData = await geminiRes.json();
        if (geminiRes.ok) {
          const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
          const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
          return NextResponse.json({
            success: true,
            isMock: false,
            provider: "Google Gemini (Free)",
            items: parsed,
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini call failed:", geminiErr);
      }
    }

    // -------------------------------------------------------------
    // 5. OPENAI (NẾU CÓ)
    // -------------------------------------------------------------
    if (openAiKey) {
      try {
        const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are an expert Chinese HSK test creator. Respond only with raw JSON array." },
              { role: "user", content: promptText },
            ],
            temperature: 0.7,
          }),
        });

        const aiData = await openAiResponse.json();
        if (openAiResponse.ok) {
          const contentText = aiData.choices?.[0]?.message?.content || "[]";
          const parsed = JSON.parse(contentText.replace(/```json|```/g, "").trim());
          return NextResponse.json({
            success: true,
            isMock: false,
            provider: "OpenAI",
            items: parsed,
          });
        }
      } catch (openAiErr) {
        console.warn("OpenAI call error:", openAiErr);
      }
    }

    return NextResponse.json({success:false,message:"Chưa tạo được câu hỏi từ AI. Dịch vụ đang hết hạn mức hoặc chưa được cấu hình. Vui lòng thử lại sau."},{status:503});
  } catch (error) {
    if(error instanceof PortalError)return NextResponse.json({success:false,message:error.message},{status:error.status});
    console.error("POST /api/v1/ai/generate-questions error:", error);
    return NextResponse.json({ success: false, message: "Lỗi xử lý tạo câu hỏi" }, { status: 500 });
  }
}
