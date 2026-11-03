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
import CurriculumSentencePickerModal from "./CurriculumSentencePickerModal";
import roomStyles from "./VirtualStudyRoom.module.css";
import {
  LessonSentenceItem,
  getSentencesByHskAndLesson,
} from "@/lib/lesson-sentence-extractor";
import { playChineseSpeech } from "@/lib/chinese-speech-player";

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
  initialHskLevel?: number;
  initialLessonNumber?: number;
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
  initialHskLevel = 1,
  initialLessonNumber = 1,
}: VirtualStudyRoomModalProps) {
  // 1. Pomodoro 25 phút (1500 giây)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"pomodoro" | "shadowing">("pomodoro");

  // 2. Dữ liệu học sinh thật từ API /api/v1/study-room/presence
  const [students, setStudents] = useState<RealStudentPresence[]>([]);
  const [loadingPresence, setLoadingPresence] = useState(false);
  const [myAccumulatedMinutes, setMyAccumulatedMinutes] = useState(0);
  const roomRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // 3. Audio Synthesizer (Tiếng mưa trúc / thiền định)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // 4. AI Speech Shadowing & Giáo trình HSK State
  const [activeHskLevel, setActiveHskLevel] = useState<number>(initialHskLevel || 1);
  const [activeLessonNumber, setActiveLessonNumber] = useState<number>(initialLessonNumber || 1);
  const [showCurriculumPicker, setShowCurriculumPicker] = useState<boolean>(false);
  useEffect(() => {
    if (!isOpen || showCurriculumPicker) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current?.click(); return; }
      if (event.key !== "Tab") return;
      const focusable = Array.from(roomRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select, textarea, [tabindex="0"]') || []).filter(el => el.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", handleKey); previous?.focus(); };
  }, [isOpen, showCurriculumPicker]);
  const [lessonSentences, setLessonSentences] = useState<LessonSentenceItem[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [selectedCurriculumSentence, setSelectedCurriculumSentence] = useState<LessonSentenceItem | null>(null);

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

  // Tải danh sách câu của HSK & Bài học đang chọn
  useEffect(() => {
    const list = getSentencesByHskAndLesson(activeHskLevel, activeLessonNumber);
    setLessonSentences(list);
    if (list.length > 0) {
      if (!selectedCurriculumSentence || selectedCurriculumSentence.hskLevel !== activeHskLevel || selectedCurriculumSentence.lessonNumber !== activeLessonNumber) {
        setSelectedCurriculumSentence(list[0]);
        setCurrentSentenceIndex(0);
      }
    }
  }, [activeHskLevel, activeLessonNumber]);

  // Đồng bộ props initialHskLevel và initialLessonNumber khi modal mở
  useEffect(() => {
    if (isOpen) {
      if (initialHskLevel) setActiveHskLevel(initialHskLevel);
      if (initialLessonNumber) setActiveLessonNumber(initialLessonNumber);
    }
  }, [isOpen, initialHskLevel, initialLessonNumber]);

  // Điều hướng câu trước / câu sau trong bài
  const handlePrevSentence = () => {
    if (lessonSentences.length === 0) return;
    const prevIdx = Math.max(0, currentSentenceIndex - 1);
    setCurrentSentenceIndex(prevIdx);
    setSelectedCurriculumSentence(lessonSentences[prevIdx]);
    setCustomSentence("");
    setUserTranscript("");
    setEvaluation(null);
  };

  const handleNextSentence = () => {
    if (lessonSentences.length === 0) return;
    const nextIdx = Math.min(lessonSentences.length - 1, currentSentenceIndex + 1);
    setCurrentSentenceIndex(nextIdx);
    setSelectedCurriculumSentence(lessonSentences[nextIdx]);
    setCustomSentence("");
    setUserTranscript("");
    setEvaluation(null);
  };

  const handleSelectCurriculumSentence = (sentence: LessonSentenceItem) => {
    setActiveHskLevel(sentence.hskLevel);
    setActiveLessonNumber(sentence.lessonNumber);
    setSelectedCurriculumSentence(sentence);
    const list = getSentencesByHskAndLesson(sentence.hskLevel, sentence.lessonNumber);
    setLessonSentences(list);
    const foundIdx = list.findIndex((s) => s.id === sentence.id || s.zh === sentence.zh);
    setCurrentSentenceIndex(foundIdx >= 0 ? foundIdx : 0);
    setCustomSentence("");
    setUserTranscript("");
    setEvaluation(null);
    setShowCurriculumPicker(false);
  };

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
        sourceTag: "Tự nhập tự do",
        sourceCategory: "custom",
        hskLevel: activeHskLevel,
        lessonNumber: activeLessonNumber,
      };
    }
    if (selectedCurriculumSentence) {
      return {
        zh: selectedCurriculumSentence.zh,
        py: selectedCurriculumSentence.pinyin || pinyin(selectedCurriculumSentence.zh),
        vi: selectedCurriculumSentence.vi,
        tip: selectedCurriculumSentence.tip || "Hãy chú ý phát âm tròn vành rõ chữ và đúng cao độ thanh điệu.",
        sourceTag: `${selectedCurriculumSentence.categoryLabel} · ${selectedCurriculumSentence.detailTag}`,
        sourceCategory: selectedCurriculumSentence.sourceCategory,
        hskLevel: selectedCurriculumSentence.hskLevel,
        lessonNumber: selectedCurriculumSentence.lessonNumber,
        lessonTitleZh: selectedCurriculumSentence.lessonTitleZh,
      };
    }
    const def = SHADOWING_CURRICULUM[selectedCurriculumIdx] || SHADOWING_CURRICULUM[0];
    return {
      zh: def.zh,
      py: def.py,
      vi: def.vi,
      tip: def.tip,
      sourceTag: `HSK ${def.level} Kinh Điển`,
      sourceCategory: "preset",
      hskLevel: def.level,
      lessonNumber: 1,
    };
  }, [customSentence, selectedCurriculumSentence, selectedCurriculumIdx, activeHskLevel, activeLessonNumber]);

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

  // 5. AI Đọc mẫu câu tiếng Trung (hỗ trợ toàn diện mobile & desktop)
  const handleAiSpeak = (text: string) => {
    setIsAiSpeaking(true);
    playChineseSpeech(text, {
      rate: speechRate,
      onEnd: () => setIsAiSpeaking(false),
      onError: () => setIsAiSpeaking(false),
    });
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
    <div className={roomStyles.overlay}>
      {/* Khung Thư Phòng Thủy Mặc */}
      <div ref={roomRef} className={roomStyles.room} role="dialog" aria-modal="true" aria-labelledby="ink-study-room-title">
        
        <div className={roomStyles.landscape} aria-hidden="true"/>

        {/* Header Cổ Phong Thư Phòng */}
        <div className={`${roomStyles.header} relative z-10 flex items-center justify-between px-6 py-4 bg-[#F8F4E8]/95 border-b border-[#BC9B6B]/25`}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#94713B] flex items-center justify-center font-serif text-2xl font-bold shadow-inner">
              斋
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 id="ink-study-room-title" className="text-base font-serif font-bold text-[#2F533A] flex items-center gap-2">
                  <span>Thư phòng bên hồ · Vân Tự Tập Thất</span>
                </h2>
                <span className="text-[10px] bg-emerald-50 text-emerald-300 border border-emerald-600/40 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{loadingPresence ? "Đang kết nối thư phòng…" : `${students.length} học viên trong danh sách`}</span>
                </span>
              </div>
              <p className="text-xs text-[#7B826C]">
                Một khoảng yên bình để học cùng nhau và luyện âm theo bài.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab chuyển đổi giữa Đồng hồ Pomodoro & AI Shadowing */}
            <div className="hidden sm:flex items-center p-1 bg-[#EEE9DB] border border-[#BC9B6B]/30 rounded-2xl text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("pomodoro")}
                className={`px-3 py-1.5 rounded-xl font-serif font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "pomodoro"
                    ? "bg-[#D4AF37] text-[#0A100E] shadow-sm"
                    : "text-[#65765A] hover:text-[#23452F]"
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
                    : "text-[#65765A] hover:text-[#23452F]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Shadowing Luyện Âm</span>
              </button>
            </div>

            <button
              ref={closeRef}
              aria-label="Đóng thư phòng"
              onClick={() => {
                if (audioCtxRef.current) audioCtxRef.current.suspend();
                setIsAudioPlaying(false);
                if (recognitionRef.current) recognitionRef.current.abort();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-[#E9E2CD] hover:bg-[#DFE7CB] flex items-center justify-center text-[#65765A] hover:text-[#23452F] transition cursor-pointer"
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
                : "bg-[#F8F3E7] border-[#D8CFBA] text-[#65765A]"
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
                : "bg-[#F8F3E7] border-[#D8CFBA] text-[#65765A]"
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
              <div className={`${roomStyles.timerScene} p-8 rounded-3xl bg-[#FFFCF5]/90 border border-[#BC9B6B]/30 relative overflow-hidden flex flex-col items-center justify-center text-center space-y-6 shadow-inner`}>
                {/* Trăng khuyết và mây mờ thủy mặc */}
                <div className="absolute top-4 right-6 text-4xl opacity-15 select-none pointer-events-none">
                  🌙
                </div>
                <div className="absolute bottom-2 left-6 text-2xl opacity-10 select-none pointer-events-none">
                  🎋
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-serif uppercase tracking-widest text-[#93804E]">
                    Tĩnh tâm bên trang sách · Pomodoro
                  </span>
                  <div className="font-serif font-semibold text-6xl sm:text-7xl text-[#2F533A] tracking-widest py-3">
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                  </div>
                  <p className="text-xs text-[#7B826C] italic">
                    {isActive
                      ? "Thả lỏng, tập trung vào từng trang sách. Bạn đang làm rất tốt."
                      : "Một khoảng lặng để đọc, hiểu và ghi nhớ. Bắt đầu khi bạn sẵn sàng."}
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
                    className="p-3 rounded-2xl bg-[#E9E2CD] hover:bg-[#DFE7CB] text-[#65765A] transition cursor-pointer"
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
                        : "bg-[#F8F3E7] border-[#D8CFBA] text-[#65765A] hover:bg-[#E9E2CD]"
                    }`}
                    title="Bật/tắt âm thanh mưa hiên trúc thiền định"
                  >
                    {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span>{isAudioPlaying ? "Đang bật mưa hiên trúc" : "Bật tiếng mưa trúc"}</span>
                  </button>
                </div>

                {/* Bàn học của chính bạn */}
                <div className="w-full pt-6 border-t border-[#BC9B6B]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#65765A]">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏮</span>
                    <div className="text-left">
                      <div className="font-serif font-bold text-[#2F533A]">{studentName} (Bàn của bạn)</div>
                      <div className="text-[11px] text-[#527A48]">Đã ghi nhận {myAccumulatedMinutes} phút trong phòng học</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#7B826C] uppercase tracking-wider">Phiên học hiện tại</div>
                    <div className="font-bold text-[#94713B]">25 phút tập trung</div>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= AI SHADOWING & CHẨN ĐOÁN PHÁT ÂM ================= */
              <div className="p-6 sm:p-7 rounded-3xl bg-[#FFFCF5]/95 border border-[#BC9B6B]/30 space-y-6">
                
                {/* Header phần Shadowing */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#BC9B6B]/20">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#2F533A] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#94713B]" />
                      <span>Thiền Luyện Âm Khẩu Tự · AI Shadowing Chẩn Đoán</span>
                    </h3>
                    <p className="text-xs text-[#7B826C]">
                      Nghe AI bản xứ đọc mẫu, lặp lại theo nhịp và nhận phân tích khẩu hình, thanh điệu để đạt 100 điểm
                    </p>
                  </div>

                  {/* Tốc độ đọc AI */}
                  <div className="flex items-center gap-2 text-xs bg-[#EFE6D1]/70 px-3 py-1.5 rounded-xl border border-[#D8CFBA] self-start sm:self-auto">
                    <span className="text-[#7B826C]">Tốc độ AI:</span>
                    {[0.7, 0.85, 1.0].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setSpeechRate(rate)}
                        className={`px-2 py-0.5 rounded-lg font-mono font-bold transition ${
                          speechRate === rate ? "bg-[#D4AF37] text-black" : "text-[#65765A] hover:text-[#23452F]"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chọn câu mẫu hoặc nhập câu tự do */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-serif font-bold text-[#93804E]">
                        Kho câu đang chọn:
                      </span>
                      <span className="text-xs font-bold text-[#14472A] bg-[#E8F3EB] px-2.5 py-0.5 rounded-lg border border-[#A2D4B6] flex items-center gap-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>HSK {activeHskLevel} · Bài {activeLessonNumber} ({lessonSentences.length} câu)</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCurriculumPicker(true)}
                        className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 hover:bg-[#D4AF37]/30 text-[#94713B] hover:text-[#FFF8E7] text-xs font-serif font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Dùng kho câu chuẩn giáo trình</span>
                      </button>
                    </div>
                  </div>

                  {/* Danh sách các câu nổi bật trong bài học đang chọn */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {(lessonSentences.length > 0 ? lessonSentences.slice(0, 6) : SHADOWING_CURRICULUM).map((item: any, idx) => {
                      const isCurriculum = "sourceCategory" in item;
                      const isSelected = isCurriculum
                        ? selectedCurriculumSentence?.id === item.id && !customSentence
                        : selectedCurriculumIdx === idx && !customSentence && !selectedCurriculumSentence;

                      return (
                        <button
                          key={item.id || idx}
                          type="button"
                          onClick={() => {
                            setCustomSentence("");
                            if (isCurriculum) {
                              setSelectedCurriculumSentence(item);
                              setCurrentSentenceIndex(idx);
                            } else {
                              setSelectedCurriculumSentence(null);
                              setSelectedCurriculumIdx(idx);
                            }
                            setUserTranscript("");
                            setEvaluation(null);
                          }}
                          className={`p-2.5 rounded-xl text-left border transition text-xs cursor-pointer ${
                            isSelected
                              ? "bg-[#FFF9E6] border-2 border-[#C99738] text-[#1D3E2B] font-bold shadow-md ring-2 ring-[#C99738]/20"
                              : "bg-[#F8F3E7] border-[#D8CFBA] text-[#55694C] hover:bg-[#EFE7D4] hover:border-[#BC9B6B]"
                          }`}
                        >
                          <div className={`flex items-center justify-between text-[10px] font-mono mb-0.5 ${
                            isSelected ? "text-[#875D1E] font-semibold" : "text-[#94713B]"
                          }`}>
                            <span>{isCurriculum ? item.categoryLabel : `HSK ${item.level}`}</span>
                            {isCurriculum && <span className={`truncate max-w-[100px] ${isSelected ? "text-[#5C7053] font-sans" : "text-[#7B826C]"}`}>{item.detailTag}</span>}
                          </div>
                          <div className={`font-serif line-clamp-1 ${isSelected ? "text-[#1B3A26] font-extrabold text-sm" : "text-[#3D4C3A]"}`}>{item.zh}</div>
                        </button>
                      );
                    })}
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
                      className="w-full px-4 py-2.5 rounded-xl bg-[#EFE6D1]/70 border border-[#BC9B6B]/30 text-xs text-[#284A39] placeholder:text-[#8C9278] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* Thẻ hiển thị câu mẫu mục tiêu */}
                <div className="p-6 rounded-2xl bg-[#F3EDDD] border border-[#BC9B6B]/40 space-y-3 text-center relative shadow-inner">
                  {/* Thanh điều hướng câu trước / sau trong bài */}
                  {selectedCurriculumSentence && lessonSentences.length > 1 && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#E8DEC5]/70 border border-[#BC9B6B]/30 text-xs mb-2">
                      <button
                        type="button"
                        disabled={currentSentenceIndex <= 0}
                        onClick={handlePrevSentence}
                        className="text-[#65765A] hover:text-[#23452F] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer font-serif"
                      >
                        ◀ Câu trước
                      </button>

                      <div className="flex items-center gap-1.5 text-[#7B826C] font-mono text-[11px]">
                        <span className="text-[#94713B] font-bold">
                          Câu {currentSentenceIndex + 1}/{lessonSentences.length}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[180px] text-[#284A39]">
                          {targetSentence.sourceTag}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={currentSentenceIndex >= lessonSentences.length - 1}
                        onClick={handleNextSentence}
                        className="text-[#94713B] hover:text-[#FFF8E7] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer font-serif font-bold"
                      >
                        Câu tiếp ▶
                      </button>
                    </div>
                  )}

                  <div className="text-xs font-mono text-[#94713B] tracking-wider">
                    {targetSentence.py}
                  </div>
                  <div className="font-serif font-black text-2xl sm:text-3xl text-[#2E5138] tracking-wide">
                    {targetSentence.zh}
                  </div>
                  <div className="text-xs text-[#65765A]">
                    &quot;{targetSentence.vi}&quot;
                  </div>

                  {targetSentence.tip && (
                    <div className="text-[11px] text-[#7B826C] bg-[#E8DEC5]/60 px-3 py-1.5 rounded-xl border border-[#E2D8C0] inline-block mx-auto max-w-xl">
                      💡 <span className="italic">{targetSentence.tip}</span>
                    </div>
                  )}

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
                  <div className="p-4 rounded-2xl bg-[#EFE6D1]/70 border border-[#D8CFBA] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7B826C]">Giọng đọc nhận diện từ bạn:</span>
                      <button
                        type="button"
                        onClick={evaluatePronunciation}
                        className="text-[11px] text-[#94713B] hover:underline flex items-center gap-1"
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
                  <div className="p-5 rounded-2xl bg-[#EFF2E5] border border-emerald-500/40 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#94713B]" />
                        <span className="font-serif font-bold text-sm text-[#2F533A]">
                          Điểm Khớp Phát Âm Thực Tế
                        </span>
                      </div>
                      <div className="font-mono font-black text-2xl text-[#94713B]">
                        {evaluation.score} / 100 đ
                      </div>
                    </div>

                    {/* Từng âm tiết đối chiếu chi tiết */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-[#7B826C]">So khớp từng chữ Hán & Thanh điệu:</div>
                      <div className="flex flex-wrap gap-2">
                        {evaluation.matchDetails.map((detail, i) => (
                          <div
                            key={i}
                            className={`px-3 py-2 rounded-xl border text-center ${
                              detail.status === "CORRECT"
                                ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                                : detail.status === "CLOSE"
                                ? "bg-amber-50 border-amber-500 text-amber-900"
                                : "bg-red-50 border-red-500 text-red-900"
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
                      <div className="p-3.5 rounded-xl bg-[#EFE6D1]/70 border border-[#BC9B6B]/20 text-xs space-y-1.5">
                        <div className="font-bold text-[#94713B] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Chỉ dẫn để đạt 100 điểm tuyệt đối:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-[#65765A] text-[11px] leading-relaxed">
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
          <div className={`${roomStyles.presence} lg:col-span-4 space-y-4 flex flex-col justify-between p-5 rounded-3xl bg-[#FFFCF5]/95 border border-[#BC9B6B]/30`}>
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
                <h4 className="font-serif font-bold text-xs text-[#2F533A] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#94713B]" />
                  <span>Đồng Môn Đang Cùng Thắp Đèn</span>
                </h4>
                <button
                  type="button"
                  onClick={fetchRealPresence}
                  className="text-[10px] text-[#7B826C] hover:text-stone-200 cursor-pointer flex items-center gap-1"
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
                          ? "bg-[#FFF8E7] border-2 border-[#C99738] shadow-sm ring-1 ring-[#C99738]/20"
                          : "bg-[#F8F3E7] border-[#D8CFBA]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🏮</span>
                        <div>
                          <div className={`font-serif font-bold line-clamp-1 ${st.isCurrent ? "text-[#1F432B]" : "text-[#2E5138]"}`}>
                            {st.name} {st.isCurrent && <span className="text-[#A26E17] font-sans text-[11px] font-black ml-0.5">(Bạn)</span>}
                          </div>
                          <div className={`text-[10px] flex items-center gap-1 font-medium ${st.isCurrent ? "text-[#7A6A3E]" : "text-[#93804E]"}`}>
                            <span>{st.hsk}</span>
                            <span>·</span>
                            <span className="text-amber-600 font-semibold">🔥 {st.streakDays} ngày</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-[#527A48] font-mono font-bold">
                          {st.minutes} phút
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 ml-auto mt-1 animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-[#F8F3E7] text-center text-xs text-[#7B826C]">
                    {loadingPresence ? "Đang kết nối thư phòng…" : "Chưa có học viên trong danh sách. Một phiên học yên tĩnh đang chờ bạn."}
                  </div>
                )}
              </div>
            </div>

            {/* Châm ngôn thư phòng */}
            <div className="p-3.5 rounded-xl bg-[#EFE6D1]/70 border border-[#BC9B6B]/20 text-[11px] text-[#7B826C] leading-relaxed text-center">
              💡 <em>&quot;Ngồi giữa muôn vàn đốm đèn học, bạn sẽ không còn thấy cô đơn một mình giữa đêm khuya nữa.&quot;</em>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Chọn Câu Chuẩn Giáo Trình HSK */}
      <CurriculumSentencePickerModal
        isOpen={showCurriculumPicker}
        onClose={() => setShowCurriculumPicker(false)}
        currentHskLevel={activeHskLevel}
        currentLessonNumber={activeLessonNumber}
        onSelectSentence={handleSelectCurriculumSentence}
        onPreviewSpeak={handleAiSpeak}
      />
    </div>
  );
}
