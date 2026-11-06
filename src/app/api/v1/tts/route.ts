import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural";
const VOICES = new Set([
  DEFAULT_VOICE,
  "zh-CN-XiaoyiNeural",
  "zh-CN-YunxiNeural",
  "zh-CN-YunjianNeural",
  "zh-CN-XiaochenNeural",
]);

function errorResponse(message: string, status: number) {
  return new Response(message, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text")?.trim();
  if (!text || [...text].length > 500 || /[\x00-\x08\x0B\x0C\x0E-\x1F]/u.test(text)) {
    return errorResponse("Text must contain 1 to 500 valid characters", 400);
  }

  const requestedVoice = searchParams.get("voice") || "female";
  const voice = requestedVoice === "female" ? DEFAULT_VOICE
    : requestedVoice === "male" ? "zh-CN-YunxiNeural"
    : requestedVoice;
  if (!VOICES.has(voice)) return errorResponse("Unsupported Mandarin voice", 400);

  // The library accepts SSML markup. Escape user text before passing it in.
  const escapedText = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const tts = new MsEdgeTTS({ connectionTimeoutMs: 5000, synthesisTimeoutMs: 8000 });
  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(escapedText, { rate: "-5%" });
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) chunks.push(chunk);
    const audio = Uint8Array.from(Buffer.concat(chunks));
    if (!audio.length) return errorResponse("Mandarin audio unavailable", 502);

    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.length),
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.warn("[TTS] Edge synthesis failed:", error instanceof Error ? error.message : "unknown error");
    return errorResponse("Mandarin audio unavailable", 502);
  } finally {
    tts.close();
  }
}
