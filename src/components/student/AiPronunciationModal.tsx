"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Volume2,
  Mic,
  Square,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Award,
  Flame,
} from "lucide-react";
import { playChineseSpeech } from "@/lib/chinese-speech-player";

interface AiPronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetText: string;
  pinyin?: string;
  meaning?: string;
  onSuccessXp?: (xp: number) => void;
}

export default function AiPronunciationModal({
  isOpen,
  onClose,
  targetText,
  pinyin,
  meaning,
  onSuccessXp,
}: AiPronunciationModalProps) {
  const [isPlayingNative, setIsPlayingNative] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [awardedXp, setAwardedXp] = useState<number | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setSpokenText("");
      setScore(null);
      setFeedback("");
      setAwardedXp(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setIsRecording(false);
      return;
    }

    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Nghe giọng phát thanh viên chuẩn Bắc Kinh
  const handlePlayNative = () => {
    setIsPlayingNative(true);
    playChineseSpeech(targetText, {
      onEnd: () => setIsPlayingNative(false),
      onError: () => setIsPlayingNative(false),
    });
  };

  // 2. Bắt đầu ghi âm và nhận diện giọng nói học sinh
  const handleStartRecording = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setFeedback("Trình duyệt chưa hỗ trợ ghi âm tiếng Trung. Hãy thử trên Google Chrome hoặc Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = "zh-CN";
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setSpokenText("");
        setScore(null);
        setFeedback("");
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join("");
        setSpokenText(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        if (event.error === "no-speech") {
          setFeedback("Chưa nhận được âm thanh. Hãy bấm nói to và rõ ràng hơn nhé.");
        } else if (event.error === "not-allowed") {
          setFeedback("Vui lòng cấp quyền truy cập Micro trên trình duyệt để luyện nói.");
        } else {
          setFeedback("Lỗi thu âm: " + event.error);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err: any) {
      setIsRecording(false);
      setFeedback("Lỗi khởi động micro: " + err.message);
    }
  };

  // 3. Dừng ghi âm và tính điểm AI
  const handleStopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsRecording(false);

      // Chấm điểm sau 300ms khi text đã ổn định
      setTimeout(() => {
        calculateScore(spokenText);
      }, 300);
    }
  };

  // 4. Thuật toán so khớp điểm phát âm AI
  const calculateScore = (spoken: string) => {
    const cleanTarget = targetText.replace(/[^\u4e00-\u9fa5]/g, "");
    const cleanSpoken = spoken.replace(/[^\u4e00-\u9fa5]/g, "");

    if (!cleanSpoken) {
      setScore(0);
      setFeedback("Chưa nghe rõ câu bạn vừa đọc. Hãy bấm ghi âm và đọc lại to hơn nhé!");
      return;
    }

    if (cleanSpoken === cleanTarget) {
      setScore(100);
      setFeedback("Xuất sắc! Bạn phát âm chuẩn xác 100% từng âm điệu bản xứ!");
      grantXp(20);
      return;
    }

    // Đếm số chữ Hán khớp nhau
    let matchedCount = 0;
    const targetChars = cleanTarget.split("");
    const spokenChars = cleanSpoken.split("");

    targetChars.forEach((char) => {
      if (spokenChars.includes(char)) {
        matchedCount++;
      }
    });

    const calculated = Math.min(
      95,
      Math.max(20, Math.round((matchedCount / targetChars.length) * 100))
    );

    setScore(calculated);

    if (calculated >= 80) {
      setFeedback("Rất tốt! Khẩu hình và phát âm của bạn rõ ràng, người bản xứ nghe rất dễ hiểu.");
      grantXp(15);
    } else if (calculated >= 50) {
      setFeedback("Khá tốt! Bạn cần chú ý thêm thanh điệu và các âm bật hơi (như ch, c, p, t).");
      grantXp(10);
    } else {
      setFeedback("Chưa chuẩn lắm. Hãy nghe lại phát âm mẫu ở trên và luyện tập thêm nhé!");
    }
  };

  const grantXp = (xp: number) => {
    setAwardedXp(xp);
    onSuccessXp?.(xp);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#204434]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFDF7] w-full max-w-md rounded-3xl border border-[#BC9B6B]/40 shadow-2xl p-6 space-y-5 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-[#315E48] hover:bg-[#204434]/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Mic className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Luyện phát âm &amp; Chấm điểm AI
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-xs text-[#315E48]">
              Đối chiếu giọng nói của bạn với phát thanh viên bản xứ
            </p>
          </div>
        </div>

        {/* Target Word Card */}
        <div className="bg-[#FAF7F0] p-5 rounded-2xl border border-[#BC9B6B]/30 text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <button
              type="button"
              onClick={handlePlayNative}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isPlayingNative
                  ? "bg-emerald-600 text-white animate-pulse"
                  : "bg-[#204434]/10 hover:bg-[#204434] text-[#204434] hover:text-[#FFFDF7]"
              }`}
              title="Nghe mẫu phát âm chuẩn"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="text-3xl font-serif font-bold text-[#204434] tracking-wide" lang="zh-CN">
            {targetText}
          </div>
          {pinyin && <div className="text-sm font-semibold text-amber-700">{pinyin}</div>}
          {meaning && <div className="text-xs text-[#315E48] italic">{meaning}</div>}

          <div className="pt-2">
            <button
              type="button"
              onClick={handlePlayNative}
              className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Bấm nghe giọng mẫu Bắc Kinh</span>
            </button>
          </div>
        </div>

        {/* Recording Section */}
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse transition hover:scale-105 cursor-pointer"
                title="Bấm để dừng ghi âm"
              >
                <Square className="w-6 h-6 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartRecording}
                className="w-16 h-16 rounded-full bg-[#204434] hover:bg-[#183629] text-[#FFFDF7] flex items-center justify-center shadow-lg shadow-[#204434]/25 transition hover:scale-105 cursor-pointer"
                title="Bấm để bắt đầu nói"
              >
                <Mic className="w-7 h-7 text-[#D9B472]" />
              </button>
            )}
          </div>

          <p className="text-xs font-medium text-[#315E48]">
            {isRecording
              ? "🔴 Đang lắng nghe... Bạn hãy đọc to câu tiếng Trung ở trên nhé!"
              : "Bấm vào Micro và đọc to câu tiếng Trung để AI chấm điểm"}
          </p>

          {/* Realtime Transcribed Text */}
          {spokenText && (
            <div className="bg-white border border-[#BC9B6B]/25 rounded-xl p-3 text-xs text-[#204434]">
              <span className="text-[#315E48] block text-[10px] uppercase font-bold mb-0.5">
                AI nghe được bạn nói:
              </span>
              <span className="font-serif font-bold text-base text-emerald-800">
                "{spokenText}"
              </span>
            </div>
          )}
        </div>

        {/* AI Score & Feedback */}
        {score !== null && (
          <div
            className={`p-4 rounded-2xl border space-y-2 animate-in zoom-in-95 ${
              score >= 80
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : score >= 50
                ? "bg-amber-50 border-amber-300 text-amber-900"
                : "bg-orange-50 border-orange-300 text-orange-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                Kết quả phát âm AI
              </span>
              <div className="flex items-center gap-1 font-bold text-lg">
                <span>{score}/100</span>
                <span className="text-sm">điểm</span>
              </div>
            </div>

            <p className="text-xs leading-relaxed">{feedback}</p>

            {awardedXp && (
              <div className="pt-1 flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Thưởng +{awardedXp} XP rèn luyện phát âm!</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#BC9B6B]/20">
          <button
            type="button"
            onClick={() => {
              setSpokenText("");
              setScore(null);
              setFeedback("");
            }}
            className="text-xs font-semibold text-[#315E48] hover:text-[#204434] inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFDF7] text-xs font-bold transition cursor-pointer"
          >
            Hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
}
