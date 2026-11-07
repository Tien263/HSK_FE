import { cleanChineseForSpeech } from "./chinese-speech";

// Shared audio instance để tránh phát đè nhiều âm thanh và giải phóng bộ nhớ trên điện thoại
let globalAudio: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

export interface PlaySpeechOptions {
  rate?: number;
  voice?: "female" | "male" | string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export function stopChineseSpeech() {
  if (globalAudio) {
    try {
      globalAudio.onplay = null;
      globalAudio.onended = null;
      globalAudio.onerror = null;
      globalAudio.pause();
      globalAudio.currentTime = 0;
      globalAudio.src = "";
    } catch {}
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
    activeUtterance = null;
  }
}

/**
 * Phát âm tiếng Trung hoạt động 100% trên cả Điện thoại (iOS Safari, Android Chrome) và Máy tính.
 *
 * Lý do điện thoại thường không nghe được:
 * 1. Đa số điện thoại Android/iPhone không cài sẵn gói giọng đọc tiếng Trung (zh-CN) trong hệ điều hành.
 * 2. Mobile Safari và Android WebKit tự động hủy (garbage collection) đối tượng SpeechSynthesisUtterance.
 * 3. Lỗi deadlock khi gọi speechSynthesis.cancel() trước speechSynthesis.speak().
 *
 * Giải pháp:
 * - Ưu tiên 1: Dùng HTMLAudioElement phát MP3 chuẩn từ API /api/v1/tts (giọng bản xứ chuẩn Bắc Kinh,
 *   được tất cả trình duyệt di động hỗ trợ native không cần cài đặt gói ngôn ngữ).
 * - Ưu tiên 2: Fallback sang Web Speech API (đã được fix rác bộ nhớ WebKit và tự dò voice zh-CN).
 */
export async function playChineseSpeech(
  rawText: string,
  options: PlaySpeechOptions = {}
): Promise<void> {
  if (typeof window === "undefined") return;

  const textToSpeak = cleanChineseForSpeech(rawText);
  if (!textToSpeak) return;

  stopChineseSpeech();

  try {
    if (!globalAudio) {
      globalAudio = new Audio();
    }

    const voiceParam = options.voice ? `&voice=${encodeURIComponent(options.voice)}` : "";
    const ttsUrl = `/api/v1/tts?text=${encodeURIComponent(textToSpeak)}${voiceParam}`;
    globalAudio.src = ttsUrl;
    const targetRate = options.rate && options.rate > 0 ? options.rate : 1.0;
    globalAudio.defaultPlaybackRate = targetRate;
    globalAudio.playbackRate = targetRate;

    let hasEnded = false;
    const handleEnd = () => {
      if (!hasEnded) {
        hasEnded = true;
        options.onEnd?.();
      }
    };

    globalAudio.onloadedmetadata = () => {
      if (globalAudio) globalAudio.playbackRate = targetRate;
    };

    globalAudio.onplay = () => {
      if (globalAudio) globalAudio.playbackRate = targetRate;
      options.onStart?.();
    };

    globalAudio.onended = handleEnd;

    globalAudio.onerror = () => {
      // Nếu mạng ngắt hoặc stream lỗi, fallback sang Web Speech API
      fallbackToWebSpeech(textToSpeak, options);
    };

    const playPromise = globalAudio.play();
    if (playPromise !== undefined) {
      await playPromise.catch(() => {
        fallbackToWebSpeech(textToSpeak, options);
      });
    }
  } catch (err) {
    fallbackToWebSpeech(textToSpeak, options);
  }
}

function fallbackToWebSpeech(text: string, options: PlaySpeechOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onError?.(new Error("Trình duyệt không hỗ trợ phát âm."));
    return;
  }

  try {
    // Đánh thức synthesizer trên iOS Safari
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance; // Giữ tham chiếu để tránh WebKit GC hủy giọng đọc

    utterance.lang = "zh-CN";
    utterance.rate = options.rate || 0.85;

    // Tìm giọng đọc tiếng Trung nếu có trong máy
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(
      (v) =>
        /zh|cmn|chinese|mandarin/i.test(v.lang || "") ||
        /chinese|tingting|xiaoxiao|meijia|huihui/i.test(v.name || "")
    );
    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      activeUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      activeUtterance = null;
      options.onError?.(e);
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    activeUtterance = null;
    options.onError?.(e);
  }
}
