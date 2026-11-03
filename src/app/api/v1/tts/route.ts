import { NextRequest, NextResponse } from "next/server";

/**
 * API Stream phát âm tiếng Trung chuẩn Bắc Kinh cho cả điện thoại (iOS, Android) và máy tính.
 * Khắc phục triệt để lỗi điện thoại không có gói giọng đọc tiếng Trung hoặc bị trình duyệt mobile chặn.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text")?.trim();

  if (!text) {
    return new NextResponse("Text parameter is required", { status: 400 });
  }

  // Giới hạn độ dài tối đa 200 ký tự để tránh lạm dụng
  const safeText = text.slice(0, 200);

  // 1. Thử nguồn Doubao TTS (ByteDance Volcano Engine Speech Synthesis nếu có token)
  const doubaoToken = process.env.DOUBAO_TTS_TOKEN || process.env.VOLCANO_TTS_TOKEN;
  if (doubaoToken) {
    try {
      const doubaoRes = await fetch("https://openspeech.bytedance.com/api/v1/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer;${doubaoToken}`,
        },
        body: JSON.stringify({
          app: {
            appid: process.env.DOUBAO_TTS_APPID || "default",
            token: doubaoToken,
            cluster: "volcano_tts",
          },
          user: { uid: "hsk_user" },
          audio: {
            voice_type: "zh_female_shuangkuai",
            encoding: "mp3",
            speed_ratio: 0.9,
          },
          request: {
            reqid: `hsk_${Date.now()}`,
            text: safeText,
            operation: "query",
          },
        }),
      });

      if (doubaoRes.ok) {
        const dJson = await doubaoRes.json();
        if (dJson.data) {
          const audioBuf = Buffer.from(dJson.data, "base64");
          return new NextResponse(audioBuf, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
              "Content-Length": audioBuf.byteLength.toString(),
            },
          });
        }
      }
    } catch (err) {
      console.warn("[TTS] Doubao Volcano TTS failed, fallbacking:", err);
    }
  }

  // 2. Thử nguồn Youdao Mandarin (giọng chuẩn Bắc Kinh chuyên cho phát âm tiếng Trung)
  try {
    const youdaoUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(safeText)}&le=zh`;
    const res = await fetch(youdaoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
      },
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength > 200) {
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
            "Content-Length": buffer.byteLength.toString(),
            "Accept-Ranges": "bytes",
          },
        });
      }
    }
  } catch (err) {
    console.warn("[TTS] Youdao audio stream failed:", err);
  }

  // 2. Dự phòng qua nguồn Google Translate TTS
  try {
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=${encodeURIComponent(safeText)}`;
    const res = await fetch(googleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength > 200) {
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
            "Content-Length": buffer.byteLength.toString(),
            "Accept-Ranges": "bytes",
          },
        });
      }
    }
  } catch (err) {
    console.warn("[TTS] Google audio stream failed:", err);
  }

  return new NextResponse("TTS audio stream unavailable", { status: 502 });
}
