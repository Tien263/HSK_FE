import { cleanChineseForSpeech } from "./chinese-speech";

let globalAudio: HTMLAudioElement | null = null;
let activePlayback: PlaySpeechOptions | null = null;

export interface PlaySpeechOptions {
  rate?: number;
  voice?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
  onCancel?: () => void;
}

export function stopChineseSpeech() {
  const playback = activePlayback;
  activePlayback = null;
  if (globalAudio) {
    globalAudio.onplaying = null;
    globalAudio.onended = null;
    globalAudio.onerror = null;
    globalAudio.pause();
    globalAudio.removeAttribute("src");
    globalAudio.load();
  }
  playback?.onCancel?.();
}

export async function playChineseSpeech(
  rawText: string,
  options: PlaySpeechOptions = {},
): Promise<void> {
  if (typeof window === "undefined") return;

  const text = cleanChineseForSpeech(rawText);
  if (!text) {
    options.onError?.(new Error("Không có nội dung để phát âm."));
    return;
  }

  stopChineseSpeech();
  const playback = { ...options };
  activePlayback = playback;

  const handleError = (error: unknown) => {
    if (activePlayback !== playback) return;
    activePlayback = null;
    stopChineseSpeech();
    options.onError?.(error);
  };

  try {
    const audio = (globalAudio ??= new Audio());
    const params = new URLSearchParams({ text, v: "2" });
    if (options.voice) params.set("voice", options.voice);

    const rate = options.rate && options.rate > 0 ? options.rate : 1;
    audio.src = `/api/v1/tts?${params}`;
    audio.defaultPlaybackRate = rate;
    audio.playbackRate = rate;
    audio.onplaying = () => {
      audio.onplaying = null;
      options.onStart?.();
    };
    audio.onended = () => {
      if (activePlayback !== playback) return;
      activePlayback = null;
      options.onEnd?.();
    };
    audio.onerror = () => handleError(audio.error);
    await audio.play();
  } catch (error) {
    handleError(error);
  }
}
