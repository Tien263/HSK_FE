"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  Users,
  Award,
  BookOpen,
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { pinyin } from "pinyin-pro";

interface RealStudentPresence {
  id: string;
  name: string;
  hsk: string;
  minutes: number;
  streakDays: number;
  isCurrent?: boolean;
}

interface VirtualStudyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  currentLessonHanziList?: string[];
}

// Danh sách câu luyện Shadowing kinh điển phân theo cấp HSK
const SHADOWING_CURRICULUM = [
  {
    level: 1,
    zh: "你好，很高兴认识你。",
    py: "Nǐ hǎo, hěn gāoxìng rènshi nǐ.",
    vi: "Xin chào, rất vui được làm quen với bạn.",
    tip: "Chú ý biến điệu của 2 thanh 3 (nǐ hǎo -> ní hǎo), và thanh 4 dứt khoát của chữ 认识 (rènshi).",
  },
  {
    level: 1,
    zh: "我是学生，我学汉语。",
    py: "Wǒ shì xuésheng, wǒ xué Hànyǔ.",
    vi: "Tôi là học sinh, tôi học tiếng Hán.",
    tip: "Âm 'xué': chúm môi tròn âm 'ü', nâng giọng dứt khoát lên cao (Thanh 2).",
  },
  {
    level: 2,
    zh: "今天天气非常好，我们一起去运动吧。",
    py: "Jīntiān tiānqì fēicháng hǎo, wǒmen yìqǐ qù yùndòng ba.",
    vi: "Hôm nay thời tiết rất đẹp, chúng ta cùng đi vận động đi.",
    tip: "Thanh 1 kéo dài bằng phẳng (Jīntiān tiān-), chữ 运动 (yùndòng) có 2 thanh 4 liên tiếp cần đọc dứt khoát.",
  },
  {
    level: 3,
    zh: "千里之行，始于足下。",
    py: "Qiān lǐ zhī xíng, shǐ yú zú xià.",
    vi: "Hành trình ngàn dặm bắt đầu từ một bước chân.",
    tip: "Âm bật hơi 'q' trong Qiān (đẩy luồng hơi mạnh từ đầu lưỡi), chữ 'zhī' uốn nhẹ đầu lưỡi.",
  },
  {
    level: 4,
    zh: "只要坚持努力，就一定能实现梦想。",
    py: "Zhǐyào jiānchí nǔlì, jiù yídìng néng shíxiàn mèngxiǎng.",
    vi: "Chỉ cần kiên trì nỗ lực, nhất định sẽ thực hiện được ước mơ.",
    tip: "Phân biệt âm uốn lưỡi 'zh' (Zhǐ) và âm đầu lưỡi 'j' (jiān).",
  },
  {
    level: 5,
    zh: "温故而知新，可以为师矣。",
    py: "Wēn gù ér zhī xīn, kě yǐ wéi shī yǐ.",
    vi: "Ôn lại cái cũ để hiểu cái mới, thế là có thể làm thầy rồi.",
    tip: "Thư thái nhịp nhàng, ngắt hơi sau chữ 'xīn'.",
  },
];

export default function VirtualStudyRoomModal({
  isOpen,
  onClose,
  studentName = "Bạn",
  currentLessonHanziList,
}: VirtualStudyRoomModalProps) {
  // 1. Pomodoro 25 phút (1500 giây)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"pomodoro" | "shadowing">("pomodoro");

  // 2. Dữ liệu học sinh thật từ API /api/v1/study-room/presence
  const [students, setStudents] = useState<RealStudentPresence[]>([]);
  const [loadingPresence, setLoadingPresence] = useState(false);
  const [myAccumulatedMinutes, setMyAccumulatedMinutes] = useState(25);

  // 3. Audio Synthesizer (Tiếng mưa trúc / thiền định)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // 4. AI Speech Shadowing State
  const [selectedCurriculumIdx, setSelectedCurriculumIdx] = useState(0);
  const [customSentence, setCustomSentence] = useState("");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.85);

  // Speech Recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Evaluation state
  const [evaluation, setEvaluation] = useState<{
    score: number;
    matchDetails: {
      char: string;
      expectedPy: string;
      userPy?: string;
      status: "CORRECT" | "CLOSE" | "MISMATCH" | "MISSING";
      toneMatch: boolean;
      initialMatch: boolean;
      finalMatch: boolean;
    }[];
    tips: string[];
    isEvaluated: boolean;
  } | null>(null);

  // Câu mục tiêu hiện tại
  const targetSentence = useMemo(() => {
    if (customSentence.trim()) {
      const trimmed = customSentence.trim();
      let py = "";
      try {
        py = pinyin(trimmed);
      } catch {
        py = "";
      }
      return {
        zh: trimmed,
        py,
        vi: "Câu tự luyện tùy biến của bạn",
        tip: "Hãy chú ý phát âm tròn vành rõ chữ và đúng cao độ thanh điệu.",
      };
    }
    return SHADOWING_CURRICULUM[selectedCurriculumIdx] || SHADOWING_CURRICULUM[0];
  }, [customSentence, selectedCurriculumIdx]);

  // Tải dữ liệu sĩ tử đang cùng học từ API thật
  const fetchRealPresence = useCallback(async () => {
    try {
      setLoadingPresence(true);
      const res = await fetch("/api/v1/study-room/presence");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.students)) {
          setStudents(json.students);
          const me = json.students.find((s: any) => s.isCurrent);
          if (me) setMyAccumulatedMinutes(me.minutes);
        }
      }
    } catch (e) {
      console.warn("fetchRealPresence error:", e);
    } finally {
      setLoadingPresence(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchRealPresence();
      const interval = setInterval(fetchRealPresence, 45000); // 45s làm mới danh sách sĩ tử thật
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchRealPresence]);

  // Pomodoro countdown & gửi Heartbeat thời gian học thật lên DB mỗi 60s
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          // Cứ mỗi 60 giây trôi qua, gửi 1 phút học thật lên DB
          if ((1500 - prev) % 60 === 0 && prev < 1500) {
            fetch("/api/v1/study-room/presence", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ minutes: 1 }),
            }).catch(() => {});
            setMyAccumulatedMinutes((m) => m + 1);
          }
          return prev - 1;
        });
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  // Âm thanh mưa trúc thiền định (Pink Noise)
  const toggleSound = () => {
    if (isAudioPlaying) {
      if (audioCtxRef.current) {
        audioCtxRef.current.suspend();
      }
      setIsAudioPlaying(false);
    } else {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }

        const bufferSize = audioCtxRef.current.sampleRate * 2;
        const noiseBuffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0,
          b1 = 0,
          b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.153852;
          output[i] = (b0 + b1 + b2) * 0.035;
        }

        const whiteNoise = audioCtxRef.current.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.connect(audioCtxRef.current.destination);
        whiteNoise.start(0);
        noiseNodeRef.current = whiteNoise;
        setIsAudioPlaying(true);
      } catch (e) {
        setIsAudioPlaying(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // 5. AI Đọc mẫu câu tiếng Trung
  const handleAiSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = speechRate;
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // 6. Ghi âm học sinh đọc theo (Web Speech Recognition)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setRecognitionSupported(false);
      }
    }
  }, []);

  const startVoiceRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn chưa hỗ trợ Web Speech Recognition. Vui lòng mở bằng Google Chrome hoặc Microsoft Edge để luyện đọc AI!");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      setUserTranscript("");
      setEvaluation(null);
      setIsRecording(true);

      recognition.onresult = (event: any) => {
        let currentText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setUserTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Recognition start failed:", e);
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  // 7. Chấm điểm phát âm chi tiết bằng pinyin-pro & Đưa ra hướng dẫn đạt 100 điểm
  const evaluatePronunciation = useCallback(() => {
    if (!userTranscript.trim()) return;

    const targetZh = targetSentence.zh.replace(/[^\u4e00-\u9fa5]/g, "");
    const userZh = userTranscript.replace(/[^\u4e00-\u9fa5]/g, "");

    const targetChars = targetZh.split("");
    const userChars = userZh.split("");

    const targetTones: string[] = pinyin(targetZh, { toneType: "num", type: "array" });
    const targetInitials: string[] = pinyin(targetZh, { pattern: "initial", type: "array" });
    const targetFinals: string[] = pinyin(targetZh, { pattern: "final", type: "array" });

    const userTones: string[] = pinyin(userZh, { toneType: "num", type: "array" });
    const userInitials: string[] = pinyin(userZh, { pattern: "initial", type: "array" });
    const userFinals: string[] = pinyin(userZh, { pattern: "final", type: "array" });

    let matchPoints = 0;
    const tips: string[] = [];

    const matchDetails = targetChars.map((char, idx) => {
      const expectedPy = pinyin(char);
      const expectedTone = targetTones[idx] || "";
      const expectedInit = targetInitials[idx] || "";
      const expectedFin = targetFinals[idx] || "";

      const userChar = userChars[idx];
      const userTone = userTones[idx] || "";
      const userInit = userInitials[idx] || "";
      const userFin = userFinals[idx] || "";

      if (!userChar) {
        return {
          char,
          expectedPy,
          status: "MISSING" as const,
          toneMatch: false,
          initialMatch: false,
          finalMatch: false,
        };
      }

      const isExactChar = char === userChar;
      const toneMatch = expectedTone.slice(-1) === userTone.slice(-1);
      const initialMatch = expectedInit.toLowerCase() === userInit.toLowerCase();
      const finalMatch = expectedFin.toLowerCase() === userFin.toLowerCase();

      let charPoints = 0;
      if (isExactChar) {
        charPoints = 100;
      } else if (toneMatch && finalMatch) {
        charPoints = 75;
      } else if (initialMatch || finalMatch) {
        charPoints = 50;
      } else {
        charPoints = 20;
      }

      matchPoints += charPoints;

      let status: "CORRECT" | "CLOSE" | "MISMATCH" = "MISMATCH";
      if (isExactChar && toneMatch) {
        status = "CORRECT";
      } else if (isExactChar || (initialMatch && finalMatch)) {
        status = "CLOSE";
        if (!toneMatch) {
          tips.push(`Chữ "${char}" (${expectedPy}): Bạn đọc lệch thanh điệu. Cần chú ý đúng cao độ thanh ${expectedTone.slice(-1) || "chuẩn"}.`);
        }
      } else {
        status = "MISMATCH";
        tips.push(`Chữ "${char}" (${expectedPy}): Nghe lại AI phát âm và chú ý khẩu hình âm "${expectedInit}" và vần "${expectedFin}".`);
      }

      return {
        char,
        expectedPy,
        userPy: pinyin(userChar),
        status,
        toneMatch,
        initialMatch,
        finalMatch,
      };
    });

    const rawScore = targetChars.length > 0 ? Math.round(matchPoints / targetChars.length) : 0;
    const finalScore = Math.max(0, Math.min(100, rawScore));

    if (finalScore >= 90) {
      tips.unshift("🌟 Xuất sắc! Ngữ điệu rất tự nhiên, chuẩn âm bản xứ.");
    } else if (finalScore >= 70) {
      tips.unshift("👍 Rất tốt! Đa số âm tiết đã chuẩn, chỉ cần gọt giũa thêm một vài thanh điệu.");
    } else {
      tips.unshift("💪 Cần chú ý nghe lại câu mẫu của AI, ngắt nghỉ đúng chỗ và đọc chậm từng chữ.");
    }

    setEvaluation({
      score: finalScore,
      matchDetails,
      tips,
      isEvaluated: true,
    });
  }, [userTranscript, targetSentence]);

  // Tự động chấm điểm khi dừng ghi âm và có transcript
  useEffect(() => {
    if (!isRecording && userTranscript.trim()) {
      evaluatePronunciation();
    }
  }, [isRecording, userTranscript, evaluatePronunciation]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070B09]/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Khung Thư Phòng Thủy Mặc */}
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-[#111815] text-[#F3EFE6] rounded-3xl shadow-2xl border-2 border-[#BC9B6B]/40 overflow-hidden">
        
        {/* Nền Thủy Mặc Sơn Thủy (Ink Wash Landscape Silhouette) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen"
          style={{
            backgroundImage: `radial-gradient(ellipse at 80% 20%, rgba(212,175,55,0.15) 0%, transparent 60%),
              radial-gradient(ellipse at 20% 80%, rgba(32,68,52,0.3) 0%, transparent 70%)`,
          }}
        />

        {/* Header Cổ Phong Thư Phòng */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-[#0A100E]/90 border-b border-[#BC9B6B]/25">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center font-serif text-2xl font-bold shadow-inner">
              斋
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-serif font-bold text-[#EADBC3] flex items-center gap-2">
                  <span>Vân Tự Tập Thất · Thư Phòng Thủy Mặc</span>
                </h2>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{students.length || 1} sĩ tử thật đang thắp đèn</span>
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Thư phòng tĩnh tại, dữ liệu thật từ đồng môn khắp cả nước & Trợ lý luyện âm AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab chuyển đổi giữa Đồng hồ Pomodoro & AI Shadowing */}
            <div className="hidden sm:flex items-center p-1 bg-[#1A2420] border border-[#BC9B6B]/30 rounded-2xl text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("pomodoro")}
                className={`px-3 py-1.5 rounded-xl font-serif font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "pomodoro"
                    ? "bg-[#D4AF37] text-[#0A100E] shadow-sm"
                    : "text-stone-300 hover:text-white"
                }`}
              >
                <span>Đồng Hồ Pomodoro</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("shadowing")}
                className={`px-3 py-1.5 rounded-xl font-serif font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "shadowing"
                    ? "bg-[#D4AF37] text-[#0A100E] shadow-sm"
                    : "text-stone-300 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Shadowing Luyện Âm</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (audioCtxRef.current) audioCtxRef.current.suspend();
                setIsAudioPlaying(false);
                if (recognitionRef.current) recognitionRef.current.abort();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch on Mobile */}
        <div className="sm:hidden px-4 pt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("pomodoro")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
              activeTab === "pomodoro"
                ? "bg-[#D4AF37] text-[#0A100E] border-[#D4AF37]"
                : "bg-white/5 border-white/10 text-stone-300"
            }`}
          >
            Đồng Hồ Pomodoro
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("shadowing")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
              activeTab === "shadowing"
                ? "bg-[#D4AF37] text-[#0A100E] border-[#D4AF37]"
                : "bg-white/5 border-white/10 text-stone-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Shadowing</span>
          </button>
        </div>

        {/* Nội dung Thư Phòng */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CỘT TRÁI (8/12): KHÔNG GIAN HỌC CHÍNH HOẶC PHÒNG LUYỆN ÂM AI */}
          <div className="lg:col-span-8 space-y-6">
            
            {activeTab === "pomodoro" ? (
              /* ================= POMODORO VÀ HIỆU ỨNG THỦY MẶC ================= */
              <div className="p-8 rounded-3xl bg-[#151F1B]/90 border border-[#BC9B6B]/30 relative overflow-hidden flex flex-col items-center justify-center text-center space-y-6 shadow-inner">
                {/* Trăng khuyết và mây mờ thủy mặc */}
                <div className="absolute top-4 right-6 text-4xl opacity-15 select-none pointer-events-none">
                  🌙
                </div>
                <div className="absolute bottom-2 left-6 text-2xl opacity-10 select-none pointer-events-none">
                  🎋
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-serif uppercase tracking-widest text-[#BC9B6B]">
                    Thời Gian Tĩnh Tâm Khổ Luyện (Pomodoro)
                  </span>
                  <div className="font-mono font-black text-6xl sm:text-7xl text-[#EADBC3] tracking-widest py-3 drop-shadow">
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                  </div>
                  <p className="text-xs text-stone-400 italic">
                    {isActive
                      ? "Đèn thư phòng đang sáng... Mỗi phút bạn học đều được ghi nhận vào CSDL thật!"
                      : "Bấm nút bắt đầu để cùng đồng môn thắp đèn khổ luyện thi đỗ HSK"}
                  </p>
                </div>

                {/* Các nút bấm điều khiển */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className="px-6 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#c49f2b] text-[#111815] font-bold text-xs transition shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isActive ? "Tạm dừng" : "Bắt đầu 25 phút"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsActive(false);
                      setSecondsLeft(25 * 60);
                    }}
                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-300 transition cursor-pointer"
                    title="Làm mới lại đồng hồ 25 phút"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleSound}
                    className={`px-4 py-3 rounded-2xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      isAudioPlaying
                        ? "bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm"
                        : "bg-white/5 border-white/15 text-stone-300 hover:bg-white/10"
                    }`}
                    title="Bật/tắt âm thanh mưa hiên trúc thiền định"
                  >
                    {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span>{isAudioPlaying ? "Đang bật mưa hiên trúc" : "Bật tiếng mưa trúc"}</span>
                  </button>
                </div>

                {/* Bàn học của chính bạn */}
                <div className="w-full pt-6 border-t border-[#BC9B6B]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-300">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏮</span>
                    <div className="text-left">
                      <div className="font-serif font-bold text-[#EADBC3]">{studentName} (Bàn của bạn)</div>
                      <div className="text-[11px] text-emerald-400">Đã tích lũy {myAccumulatedMinutes} phút học thật trên CSDL</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider">Mục tiêu hôm nay</div>
                    <div className="font-bold text-[#D4AF37]">4 hiệp Pomodoro (100 phút)</div>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= AI SHADOWING & CHẨN ĐOÁN PHÁT ÂM ================= */
              <div className="p-6 sm:p-7 rounded-3xl bg-[#151F1B]/95 border border-[#BC9B6B]/30 space-y-6">
                
                {/* Header phần Shadowing */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#BC9B6B]/20">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#EADBC3] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span>Thiền Luyện Âm Khẩu Tự · AI Shadowing Chẩn Đoán</span>
                    </h3>
                    <p className="text-xs text-stone-400">
                      Nghe AI bản xứ đọc mẫu, lặp lại theo nhịp và nhận phân tích khẩu hình, thanh điệu để đạt 100 điểm
                    </p>
                  </div>

                  {/* Tốc độ đọc AI */}
                  <div className="flex items-center gap-2 text-xs bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
                    <span className="text-stone-400">Tốc độ AI:</span>
                    {[0.7, 0.85, 1.0].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setSpeechRate(rate)}
                        className={`px-2 py-0.5 rounded-lg font-mono font-bold transition ${
                          speechRate === rate ? "bg-[#D4AF37] text-black" : "text-stone-300 hover:text-white"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chọn câu mẫu hoặc nhập câu tự do */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#BC9B6B]">
                      Chọn câu luyện âm hoặc tự nhập câu tiếng Trung:
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomSentence("")}
                      className="text-[11px] text-stone-400 hover:text-stone-200 underline"
                    >
                      Dùng kho câu chuẩn
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SHADOWING_CURRICULUM.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCustomSentence("");
                          setSelectedCurriculumIdx(idx);
                          setUserTranscript("");
                          setEvaluation(null);
                        }}
                        className={`p-2.5 rounded-xl text-left border transition text-xs ${
                          selectedCurriculumIdx === idx && !customSentence
                            ? "bg-[#204434] border-[#D4AF37] text-white font-bold"
                            : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-[10px] text-[#D4AF37] font-mono">HSK {item.level}</div>
                        <div className="font-serif line-clamp-1">{item.zh}</div>
                      </button>
                    ))}
                  </div>

                  {/* Input nhập câu bất kỳ */}
                  <div className="pt-1">
                    <input
                      type="text"
                      value={customSentence}
                      onChange={(e) => {
                        setCustomSentence(e.target.value);
                        setUserTranscript("");
                        setEvaluation(null);
                      }}
                      placeholder="Hoặc gõ/dán bất kỳ câu tiếng Trung nào vào đây để AI đọc & chấm điểm..."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[#BC9B6B]/30 text-xs text-[#F3EFE6] placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* Thẻ hiển thị câu mẫu mục tiêu */}
                <div className="p-6 rounded-2xl bg-[#0E1512] border border-[#BC9B6B]/40 space-y-3 text-center relative">
                  <div className="text-xs font-mono text-[#D4AF37] tracking-wider">
                    {targetSentence.py}
                  </div>
                  <div className="font-serif font-black text-2xl sm:text-3xl text-white tracking-wide">
                    {targetSentence.zh}
                  </div>
                  <div className="text-xs text-stone-300">
                    &quot;{targetSentence.vi}&quot;
                  </div>

                  {/* Nút bấm Nghe AI Đọc & Bắt đầu thu âm */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => handleAiSpeak(targetSentence.zh)}
                      disabled={isAiSpeaking}
                      className="px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold border border-emerald-500/40 transition flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-300" />
                      <span>{isAiSpeaking ? "AI Đang đọc..." : "1. Nghe AI đọc mẫu"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm ${
                        isRecording
                          ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                          : "bg-[#D4AF37] hover:bg-[#c49f2b] text-[#111815]"
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      <span>{isRecording ? "Đang thu âm... Bấm để dừng" : "2. Bấm mic & Đọc theo"}</span>
                    </button>
                  </div>
                </div>

                {/* Kết quả nhận diện giọng nói & Đánh giá thời gian thực */}
                {userTranscript && (
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400">Giọng đọc nhận diện từ bạn:</span>
                      <button
                        type="button"
                        onClick={evaluatePronunciation}
                        className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Chấm điểm lại</span>
                      </button>
                    </div>
                    <div className="font-serif text-lg text-emerald-300 font-bold">
                      {userTranscript}
                    </div>
                  </div>
                )}

                {/* BẢNG CHẨN ĐOÁN CHI TIẾT & BÍ QUYẾT ĐẠT 100 ĐIỂM */}
                {evaluation && evaluation.isEvaluated && (
                  <div className="p-5 rounded-2xl bg-[#1A2621] border border-emerald-500/40 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#D4AF37]" />
                        <span className="font-serif font-bold text-sm text-[#EADBC3]">
                          Điểm Khớp Phát Âm Thực Tế
                        </span>
                      </div>
                      <div className="font-mono font-black text-2xl text-[#D4AF37]">
                        {evaluation.score} / 100 đ
                      </div>
                    </div>

                    {/* Từng âm tiết đối chiếu chi tiết */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-stone-400">So khớp từng chữ Hán & Thanh điệu:</div>
                      <div className="flex flex-wrap gap-2">
                        {evaluation.matchDetails.map((detail, i) => (
                          <div
                            key={i}
                            className={`px-3 py-2 rounded-xl border text-center ${
                              detail.status === "CORRECT"
                                ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                                : detail.status === "CLOSE"
                                ? "bg-amber-950/80 border-amber-500 text-amber-200"
                                : "bg-red-950/80 border-red-500 text-red-200"
                            }`}
                          >
                            <div className="font-serif font-bold text-base">{detail.char}</div>
                            <div className="text-[10px] font-mono">{detail.expectedPy}</div>
                            <div className="text-[9px] mt-0.5">
                              {detail.status === "CORRECT" ? "✓ Chuẩn" : detail.status === "CLOSE" ? "~ Lệch thanh" : "✕ Chưa khớp"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lời khuyên cụ thể để đạt 100 điểm */}
                    {evaluation.tips.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-black/40 border border-[#BC9B6B]/20 text-xs space-y-1.5">
                        <div className="font-bold text-[#D4AF37] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Chỉ dẫn để đạt 100 điểm tuyệt đối:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-stone-300 text-[11px] leading-relaxed">
                          {evaluation.tips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CỘT PHẢI (4/12): DANH SÁCH ĐỒNG MÔN THẬT TỪ CSDL ĐANG CÙNG THẮP ĐÈN */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between p-5 rounded-3xl bg-[#151F1B]/95 border border-[#BC9B6B]/30">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
                <h4 className="font-serif font-bold text-xs text-[#EADBC3] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                  <span>Đồng Môn Đang Cùng Thắp Đèn</span>
                </h4>
                <button
                  type="button"
                  onClick={fetchRealPresence}
                  className="text-[10px] text-stone-400 hover:text-stone-200 cursor-pointer flex items-center gap-1"
                  title="Cập nhật danh sách mới nhất"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingPresence ? "animate-spin" : ""}`} />
                  <span>Làm mới</span>
                </button>
              </div>

              <div className="space-y-2.5 mt-3 max-h-[420px] overflow-y-auto pr-1">
                {students.length > 0 ? (
                  students.map((st, i) => (
                    <div
                      key={st.id || i}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs transition ${
                        st.isCurrent
                          ? "bg-[#204434]/60 border-[#D4AF37]/60"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🏮</span>
                        <div>
                          <div className="font-serif font-bold text-white line-clamp-1">
                            {st.name} {st.isCurrent && "(Bạn)"}
                          </div>
                          <div className="text-[10px] text-[#BC9B6B] flex items-center gap-1">
                            <span>{st.hsk}</span>
                            <span>·</span>
                            <span className="text-amber-300">🔥 {st.streakDays} ngày</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-emerald-400 font-mono font-bold">
                          {st.minutes} phút
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 ml-auto mt-1 animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-stone-400">
                    Đang kết nối sĩ tử thư phòng...
                  </div>
                )}
              </div>
            </div>

            {/* Châm ngôn thư phòng */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-[#BC9B6B]/20 text-[11px] text-stone-400 leading-relaxed text-center">
              💡 <em>&quot;Ngồi giữa muôn vàn đốm đèn học, bạn sẽ không còn thấy cô đơn một mình giữa đêm khuya nữa.&quot;</em>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
