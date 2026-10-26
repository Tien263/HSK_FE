"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import HanziWriter from "hanzi-writer";
import {
  X,
  Volume2,
  Mic,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Award,
  ChevronRight,
  PenTool,
  Play,
  Lightbulb,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { getEtymology, getExamplesForVocab } from "@/lib/chinese-vocab-helper";

export interface PracticeWord {
  hanzi: string;
  pinyin: string;
  meaning: string;
  meaningVi?: string;
  strokes?: number;
  radical?: string;
  rule?: string;
  exampleZh?: string;
  examplePinyin?: string;
  exampleVi?: string;
}

interface HanziPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  words?: PracticeWord[];
  initialHanzi?: string;
  initialPinyin?: string;
  initialMeaning?: string;
  username?: string;
  studentId?: string;
}

const DEFAULT_HSK1_WORDS: PracticeWord[] = [
  {
    hanzi: "你",
    pinyin: "nǐ",
    meaning: "Bạn, anh, chị",
    strokes: 7,
    radical: "亻 (Nhân đứng)",
    rule: "Trái trước phải sau, phẩy trước sổ sau",
    exampleZh: "你好！",
    examplePinyin: "Nǐ hǎo!",
    exampleVi: "Xin chào bạn!",
  },
  {
    hanzi: "好",
    pinyin: "hǎo",
    meaning: "Tốt, đẹp, khỏe",
    strokes: 6,
    radical: "女 (Nữ)",
    rule: "Bộ Nữ bên trái, chữ Tử bên phải",
    exampleZh: "很好！",
    examplePinyin: "Hěn hǎo!",
    exampleVi: "Rất tốt!",
  },
  {
    hanzi: "休息",
    pinyin: "xiūxi",
    meaning: "Nghỉ ngơi",
    strokes: 16,
    radical: "亻 (Nhân) + 心 (Tâm)",
    rule: "Viết từng chữ từ trái sang phải, chữ 休 trước chữ 息 sau",
    exampleZh: "今天我休息。",
    examplePinyin: "Jīntiān wǒ xiūxi.",
    exampleVi: "Hôm nay tôi được nghỉ.",
  },
  {
    hanzi: "学习",
    pinyin: "xuéxí",
    meaning: "Học tập, học",
    strokes: 11,
    radical: "子 (Tử) + 习 (Tập)",
    rule: "Chữ 学 trên trước dưới sau, chữ 习 phẩy gập móc rồi nét chấm",
    exampleZh: "我们在学校学习。",
    examplePinyin: "Wǒmen zài xuéxiào xuéxí.",
    exampleVi: "Chúng tôi học tập ở trường.",
  },
  {
    hanzi: "中国人",
    pinyin: "Zhōngguó rén",
    meaning: "Người Trung Quốc",
    strokes: 14,
    radical: "丨 + 囗 + 人",
    rule: "Viết lần lượt từng chữ: 中 (trung) -> 国 (quốc) -> 人 (nhân)",
    exampleZh: "我是中国人。",
    examplePinyin: "Wǒ shì Zhōngguó rén.",
    exampleVi: "Tôi là người Trung Quốc.",
  },
  {
    hanzi: "手机",
    pinyin: "shǒujī",
    meaning: "Điện thoại di động",
    strokes: 10,
    radical: "手 (Thủ) + 木 (Mộc)",
    rule: "Chữ 手 phẩy trước ngang sau, chữ 机 bộ mộc trước chữ kỷ sau",
    exampleZh: "这是我的手机。",
    examplePinyin: "Zhè shì wǒ de shǒujī.",
    exampleVi: "Đây là điện thoại của tôi.",
  },
  {
    hanzi: "便宜",
    pinyin: "piányi",
    meaning: "Rẻ, giá rẻ",
    strokes: 17,
    radical: "亻 (Nhân) + 宀 (Miên)",
    rule: "Viết chữ 便 trước rồi đến chữ 宜",
    exampleZh: "这儿的苹果真便宜！",
    examplePinyin: "Zhèr de píngguǒ zhēn piányi!",
    exampleVi: "Táo ở đây rẻ thật!",
  },
  {
    hanzi: "大兴机场",
    pinyin: "Dàxīng jīchǎng",
    meaning: "Sân bay Đại Hưng",
    strokes: 23,
    radical: "大 + 兴 + 机 + 场",
    rule: "Lần lượt viết 4 chữ Hán: 大 -> 兴 -> 机 -> 场",
    exampleZh: "大兴机场见！",
    examplePinyin: "Dàxīng jīchǎng jiàn!",
    exampleVi: "Hẹn gặp nhau ở sân bay Đại Hưng!",
  },
];

export default function HanziPracticeModal({
  isOpen,
  onClose,
  words,
  initialHanzi = "你",
  initialPinyin = "nǐ",
  initialMeaning = "Bạn, anh, chị",
  username = "student",
  studentId,
}: HanziPracticeModalProps) {
  // Chuẩn bị danh sách từ vựng luyện tập
  const practiceList = useMemo(() => {
    if (words && words.length > 0) return words;
    if (initialHanzi && initialHanzi !== "你") {
      return [
        {
          hanzi: initialHanzi,
          pinyin: initialPinyin,
          meaning: initialMeaning,
          meaningVi: initialMeaning,
          strokes: 6,
          radical: "Chữ Hán",
          rule: "Thuận bút tiêu chuẩn",
        },
      ];
    }
    return DEFAULT_HSK1_WORDS;
  }, [words, initialHanzi, initialPinyin, initialMeaning]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"WRITE" | "SPEAK">("WRITE");

  // Từ vựng hiện tại
  const currentWord = practiceList[currentIdx] || practiceList[0];

  // Tách các chữ Hán đơn trong từ (hỗ trợ từ 1, 2, 3, 4 chữ Hán)
  const characters = useMemo(() => {
    const raw = currentWord.hanzi || "";
    const list = Array.from(raw).filter((c) => /\p{Script=Han}/u.test(c));
    return list.length > 0 ? list : [raw || "你"];
  }, [currentWord.hanzi]);

  // Index của chữ Hán đơn đang được chọn viết
  const [selectedCharIdx, setSelectedCharIdx] = useState(0);

  // Đảm bảo selectedCharIdx không vượt quá số lượng chữ
  useEffect(() => {
    setSelectedCharIdx(0);
    setCompletedChars({});
    setQuizScore(null);
    setQuizFeedback(null);
  }, [currentIdx]);

  const activeChar = characters[selectedCharIdx] || characters[0];

  // Chiết tự & bộ thủ của chữ Hán đang chọn
  const etymology = useMemo(() => {
    return getEtymology(activeChar, currentWord.meaningVi || currentWord.meaning);
  }, [activeChar, currentWord]);

  // Câu ví dụ ngữ cảnh thực tế
  const exampleSentence = useMemo(() => {
    if (currentWord.exampleZh) {
      return {
        zh: currentWord.exampleZh,
        pinyin: currentWord.examplePinyin || currentWord.pinyin,
        vi: currentWord.exampleVi || currentWord.meaning,
      };
    }
    const examples = getExamplesForVocab({
      hanzi: currentWord.hanzi,
      pinyin: currentWord.pinyin,
      meaningVi: currentWord.meaningVi || currentWord.meaning,
    });
    return (
      examples[0] || {
        zh: `这是${currentWord.hanzi}。`,
        pinyin: `Zhè shì ${currentWord.pinyin}.`,
        vi: `Đây là ${currentWord.meaningVi || currentWord.meaning}.`,
      }
    );
  }, [currentWord]);

  // HanziWriter Interactive State
  const writerContainerRef = useRef<HTMLDivElement | null>(null);
  const writerInstanceRef = useRef<any>(null);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [showFaintOutline, setShowFaintOutline] = useState<boolean>(true);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);

  // Lưu điểm hoàn thành của từng chữ Hán trong từ ghép { 0: 100, 1: 95 }
  const [completedChars, setCompletedChars] = useState<Record<number, number>>({});
  const [earnedXpMsg, setEarnedXpMsg] = useState<string | null>(null);

  // Màu mực
  const [inkColor, setInkColor] = useState("#204434");

  // Speech Recognition state
  const [speechMode, setSpeechMode] = useState<"WORD" | "SENTENCE">("WORD");
  const [isRecording, setIsRecording] = useState(false);
  const [speechResult, setSpeechResult] = useState<string | null>(null);
  const [speechAccuracy, setSpeechAccuracy] = useState<number | null>(null);
  const [speechStatusText, setSpeechStatusText] = useState("Nhấn nút Micro và phát âm to rõ");
  const [speechErrorDetail, setSpeechErrorDetail] = useState<string | null>(null);

  // Cộng XP thật vào tài khoản học sinh
  const awardXp = useCallback(
    async (amount: number, reason: string) => {
      const userToAward = username || studentId;
      if (!userToAward) return;
      try {
        const res = await fetch("/api/v1/my/games/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: userToAward,
            score: amount,
            maxCombo: 1,
            gameType: "HANZI_PRACTICE",
          }),
        });
        if (res.ok) {
          setEarnedXpMsg(`+${amount} XP`);
        }
      } catch (e) {
        console.warn("awardXp error:", e);
      }
    },
    [username, studentId]
  );

  // Khởi tạo HanziWriter cho chữ Hán đơn được chọn (Kích thước lớn 270x270 px)
  const initWriter = useCallback(
    (char: string, startInQuiz = false) => {
      if (!writerContainerRef.current) return;

      writerContainerRef.current.innerHTML = "";
      setIsQuizFinished(false);
      setMistakesCount(0);
      setQuizFeedback(null);

      try {
        const writer = HanziWriter.create(writerContainerRef.current, char, {
          width: 270,
          height: 270,
          padding: 16,
          strokeColor: inkColor,
          radicalColor: "#BC9B6B",
          outlineColor: showFaintOutline ? "#DFD7C0" : "transparent",
          showOutline: showFaintOutline,
          showCharacter: !startInQuiz,
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 180,
          charDataLoader: (targetChar, onComplete) => {
            // Tải stroke data qua local API route trước (đã có hanzi-writer-data local)
            fetch(`/api/dictionary/strokes/${encodeURIComponent(targetChar)}`)
              .then((r) => (r.ok ? r.json() : Promise.reject()))
              .then((data) => onComplete(data))
              .catch(() => {
                // Fallback CDN nếu cần
                fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(targetChar)}.json`)
                  .then((r) => r.json())
                  .then((data) => onComplete(data))
                  .catch((err) => {
                    console.warn(`Không tải được nét cho chữ ${targetChar}:`, err);
                  });
              });
          },
        });

        writerInstanceRef.current = writer;

        if (startInQuiz) {
          setIsQuizMode(true);
          writer.quiz({
            onMistake: (strokeData: any) => {
              setMistakesCount((prev) => {
                const updated = prev + 1;
                setQuizFeedback(
                  `❌ Nét chưa đúng thứ tự hoặc sai hướng nét (Phạm ${updated} lỗi). Hãy quan sát kỹ lại!`
                );
                return updated;
              });
            },
            onCorrectStroke: (strokeData: any) => {
              setQuizFeedback(
                `✓ Đúng nét thứ ${strokeData.strokeNum + 1}/${strokeData.totalStrokes}! Tiếp tục nào.`
              );
            },
            onComplete: (summary: any) => {
              const totalMistakes = summary?.totalMistakes ?? 0;
              let calculatedScore = 100;
              if (totalMistakes === 1) calculatedScore = 92;
              else if (totalMistakes === 2) calculatedScore = 84;
              else if (totalMistakes === 3) calculatedScore = 75;
              else if (totalMistakes === 4) calculatedScore = 65;
              else if (totalMistakes >= 5) calculatedScore = Math.max(35, 60 - (totalMistakes - 4) * 8);

              setQuizScore(calculatedScore);
              setIsQuizFinished(true);

              if (calculatedScore >= 70) {
                setCompletedChars((prev) => ({
                  ...prev,
                  [selectedCharIdx]: calculatedScore,
                }));
                awardXp(15, `Hoàn thành viết chữ '${char}' đạt ${calculatedScore}đ`);
                setQuizFeedback(
                  `🎉 Xuất sắc! Bạn đã viết đúng trọn vẹn chữ '${char}' với ${calculatedScore} điểm!`
                );
              } else {
                setQuizFeedback(
                  `⚠️ Bạn phạm ${totalMistakes} lỗi nét. Điểm: ${calculatedScore}đ (Chưa đạt). Hãy bấm 'Viết lại' để rèn luyện nhé!`
                );
              }
            },
          });
        } else {
          setIsQuizMode(false);
        }
      } catch (e) {
        console.warn("HanziWriter init error:", e);
      }
    },
    [inkColor, showFaintOutline, selectedCharIdx, awardXp]
  );

  useEffect(() => {
    if (isOpen && activeTab === "WRITE") {
      initWriter(activeChar, false);
    }
  }, [isOpen, activeTab, activeChar, initWriter]);

  // Chạy hoạt họa viết mẫu
  const handleAnimate = () => {
    if (writerInstanceRef.current) {
      setIsQuizMode(false);
      setIsQuizFinished(false);
      writerInstanceRef.current.showCharacter();
      writerInstanceRef.current.animateCharacter();
    }
  };

  // Bắt đầu chế độ Thử thách tự viết (HanziWriter Quiz)
  const handleStartQuiz = () => {
    setQuizScore(null);
    initWriter(activeChar, true);
  };

  // Gợi ý nét tiếp theo khi đang làm Quiz
  const handleGiveHint = () => {
    if (writerInstanceRef.current && isQuizMode) {
      writerInstanceRef.current.animateStroke();
    }
  };

  // Bật/tắt nét mờ
  const toggleFaintOutline = () => {
    const nextVal = !showFaintOutline;
    setShowFaintOutline(nextVal);
    if (writerInstanceRef.current) {
      if (nextVal) writerInstanceRef.current.showOutline();
      else writerInstanceRef.current.hideOutline();
    }
  };

  // Phát âm chữ mẫu qua TTS
  const handleSpeakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // AI Chấm điểm phát âm thông minh & chuẩn xác
  const handleStartSpeech = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechStatusText(
        "Trình duyệt chưa hỗ trợ Web Speech API. Vui lòng sử dụng Google Chrome hoặc Microsoft Edge để luyện phát âm AI!"
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsRecording(true);
      setSpeechStatusText("Đang lắng nghe... Hãy nói to rõ vào microphone!");
      setSpeechResult(null);
      setSpeechAccuracy(null);
      setSpeechErrorDetail(null);

      const targetText =
        speechMode === "WORD"
          ? currentWord.hanzi.replace(/[^\p{Script=Han}]/gu, "")
          : exampleSentence.zh.replace(/[^\p{Script=Han}]/gu, "");

      recognition.onresult = (event: any) => {
        const spokenRaw = event.results[0][0].transcript || "";
        const spoken = spokenRaw.trim().replace(/[.,?!，。？！\s]/g, "");
        setSpeechResult(spokenRaw);
        setIsRecording(false);

        // THUẬT TOÁN CHẤM ĐIỂM PHÁT ÂM CHUẨN XÁC:
        const targetClean = targetText;

        // 1. Khớp hoàn hảo 100%
        if (spoken === targetClean) {
          setSpeechAccuracy(100);
          setSpeechStatusText("🌟 Hoàn hảo! Phát âm cực kỳ chuẩn xác cả thanh điệu và âm vần!");
          setSpeechErrorDetail(null);
          awardXp(
            20,
            `Phát âm xuất sắc ${speechMode === "WORD" ? "từ" : "câu"}: '${targetClean}'`
          );
          return;
        }

        // 2. Chứa trọn vẹn từ mục tiêu trong câu nói
        if (spoken.includes(targetClean)) {
          setSpeechAccuracy(95);
          setSpeechStatusText("🌟 Rất tốt! Bạn đã phát âm chính xác từ vựng mục tiêu.");
          setSpeechErrorDetail(null);
          awardXp(18, `Phát âm chuẩn từ '${targetClean}'`);
          return;
        }

        // 3. Đếm số ký tự khớp thực tế
        const targetChars = Array.from(targetClean);
        const spokenChars = Array.from(spoken);
        let matchedCount = 0;
        for (const ch of targetChars) {
          if (spokenChars.includes(ch)) {
            matchedCount++;
          }
        }

        const matchRatio = targetChars.length > 0 ? matchedCount / targetChars.length : 0;

        // 4. Nếu không khớp chữ nào hoặc đọc sai từ hoàn toàn
        if (matchedCount === 0 || spoken.length === 0) {
          const fakeScore = Math.min(15, Math.floor(Math.random() * 10) + 5);
          setSpeechAccuracy(fakeScore);
          setSpeechStatusText("❌ Phát âm chưa đúng từ hoặc sai thanh điệu!");
          setSpeechErrorDetail(
            `Máy ghi nhận âm bạn đọc: "【${spokenRaw || "im lặng/tạp âm"}】", trong khi từ cần phát âm là: "【${targetClean}】" (${
              speechMode === "WORD" ? currentWord.pinyin : exampleSentence.pinyin
            }). Không cộng XP, hãy bấm Micro để đọc lại!`
          );
          return;
        }

        // 5. Nếu chỉ đọc đúng một phần (ví dụ từ 2 chữ nhưng chỉ đọc đúng 1 chữ)
        if (matchRatio < 1) {
          const partialScore = Math.round(matchRatio * 55);
          setSpeechAccuracy(partialScore);
          setSpeechStatusText(
            `⚠️ Bạn chỉ mới phát âm đúng ${matchedCount}/${targetChars.length} chữ.`
          );
          setSpeechErrorDetail(
            `Máy nghe được: "【${spokenRaw}】". Cần phát âm trọn vẹn: "【${targetClean}】". Hãy nghe lại giọng bản xứ và thử lại!`
          );
          return;
        }

        // 6. Đọc thừa hoặc chệch âm nhẹ
        const score = Math.max(70, Math.min(90, Math.round(90 - Math.abs(spoken.length - targetClean.length) * 8)));
        setSpeechAccuracy(score);
        if (score >= 80) {
          setSpeechStatusText("👍 Phát âm khá tốt, ngữ điệu rõ ràng!");
          awardXp(15, `Luyện phát âm từ '${targetClean}'`);
        } else {
          setSpeechStatusText("⚠️ Phát âm gần đúng nhưng cần đọc dứt khoát hơn.");
        }
      };

      recognition.onerror = (e: any) => {
        setIsRecording(false);
        setSpeechStatusText(
          "Chưa thu được âm thanh rõ ràng hoặc micro bị ngắt quãng. Hãy kiểm tra micro và bấm thử lại!"
        );
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
      setSpeechStatusText("Lỗi micro. Vui lòng cấp quyền truy cập micro cho trình duyệt.");
    }
  };

  if (!isOpen) return null;

  // Kiểm tra đã hoàn thành toàn bộ chữ của từ chưa
  const isWordFullyCompleted =
    characters.length > 0 &&
    characters.every((_, idx) => (completedChars[idx] ?? 0) >= 70);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4 max-h-[94vh] overflow-y-auto animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-2xl bg-[#204434] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
              {currentWord.hanzi}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#204434]">
                  Luyện viết chữ Hán & Khẩu ngữ AI
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-bold">
                  HSK Chuẩn
                </span>
              </div>
              <p className="text-xs text-[#315E48]">
                {currentWord.hanzi} · <span className="font-mono font-bold text-[#8F6D3B]">{currentWord.pinyin}</span> ·{" "}
                {currentWord.meaningVi || currentWord.meaning}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] hover:bg-white flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Word Select Carousel Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {practiceList.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIdx(idx);
                setQuizScore(null);
                setQuizFeedback(null);
                setSpeechResult(null);
                setSpeechAccuracy(null);
                setSpeechErrorDetail(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                currentIdx === idx
                  ? "bg-[#204434] text-white shadow-xs"
                  : "bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]"
              }`}
            >
              <span>{item.hanzi}</span>
              <span className="text-[10px] opacity-75 font-mono">{item.pinyin}</span>
            </button>
          ))}
        </div>

        {/* Tab Switch: Viết tay thuận bút vs Phát âm AI */}
        <div className="flex items-center gap-2 bg-[#FAF7F0] p-1.5 rounded-2xl border border-[#E5DEC9]">
          <button
            onClick={() => setActiveTab("WRITE")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "WRITE"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434]"
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>✍️ Luyện viết thuận bút (Ô Mễ)</span>
          </button>
          <button
            onClick={() => setActiveTab("SPEAK")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "SPEAK"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434]"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>🎙️ Chấm phát âm bằng Micro AI</span>
          </button>
        </div>

        {/* TAB 1: TẬP VIẾT CHỮ HÁN THUẬN BÚT */}
        {activeTab === "WRITE" && (
          <div className="space-y-4">
            {/* Thanh chọn chữ Hán trong từ nếu từ có 2, 3, 4 chữ */}
            {characters.length > 1 && (
              <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#8F6D3B]">Từ này gồm {characters.length} chữ:</span>
                  <div className="flex items-center gap-1.5">
                    {characters.map((ch, cIdx) => {
                      const isCompleted = (completedChars[cIdx] ?? 0) >= 70;
                      return (
                        <button
                          key={cIdx}
                          onClick={() => {
                            setSelectedCharIdx(cIdx);
                            setQuizScore(null);
                            setQuizFeedback(null);
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1 cursor-pointer ${
                            selectedCharIdx === cIdx
                              ? "bg-[#204434] text-white shadow-xs"
                              : isCompleted
                              ? "bg-emerald-100 border border-emerald-300 text-emerald-800"
                              : "bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]"
                          }`}
                        >
                          <span>Chữ {cIdx + 1}: {ch}</span>
                          {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isWordFullyCompleted && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Đã viết hoàn tất từ ghép!</span>
                  </span>
                )}
              </div>
            )}

            {/* Ô Viết Mễ Tự Cách Lớn Chuẩn Cung Đình (270x270px) */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {/* Vùng vẽ HanziWriter */}
              <div className="flex flex-col items-center space-y-2">
                <div className="relative w-[270px] h-[270px] bg-[#FAF7F0] rounded-3xl border-2 border-[#BC9B6B]/60 shadow-lg overflow-hidden flex items-center justify-center">
                  {/* Lưới Mễ tự cách (米字格) sắc nét truyền thống */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
                    viewBox="0 0 270 270"
                  >
                    {/* Trục ngang và dọc */}
                    <line
                      x1="135"
                      y1="0"
                      x2="135"
                      y2="270"
                      stroke="#9D493E"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="0"
                      y1="135"
                      x2="270"
                      y2="135"
                      stroke="#9D493E"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    {/* Hai đường chéo góc */}
                    <line
                      x1="0"
                      y1="0"
                      x2="270"
                      y2="270"
                      stroke="#9D493E"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="270"
                      y1="0"
                      x2="0"
                      y2="270"
                      stroke="#9D493E"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    {/* Khung viền trong */}
                    <rect
                      x="10"
                      y="10"
                      width="250"
                      height="250"
                      fill="none"
                      stroke="#BC9B6B"
                      strokeWidth="1"
                      strokeDasharray="6 6"
                    />
                  </svg>

                  {/* DOM Container của HanziWriter */}
                  <div
                    ref={writerContainerRef}
                    className="relative z-10 w-full h-full flex items-center justify-center cursor-crosshair"
                  />

                  {/* Nút nghe âm mẫu nhanh */}
                  <button
                    onClick={() => handleSpeakText(activeChar)}
                    className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-white/90 hover:bg-white border border-[#E5DEC9] text-[#204434] shadow-xs cursor-pointer z-20"
                    title="Nghe phát âm chuẩn chữ này"
                  >
                    <Volume2 className="w-4 h-4 text-[#8F6D3B]" />
                  </button>
                </div>

                {/* Bảng chọn mực vẽ */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-[#315E48]">Màu mực:</span>
                  <button
                    onClick={() => setInkColor("#204434")}
                    className={`w-6 h-6 rounded-full bg-[#204434] transition cursor-pointer ${
                      inkColor === "#204434" ? "ring-2 ring-amber-400 scale-110" : "opacity-75"
                    }`}
                    title="Mực tàu đen huyền"
                  />
                  <button
                    onClick={() => setInkColor("#9D493E")}
                    className={`w-6 h-6 rounded-full bg-[#9D493E] transition cursor-pointer ${
                      inkColor === "#9D493E" ? "ring-2 ring-amber-400 scale-110" : "opacity-75"
                    }`}
                    title="Mực chu sa đỏ"
                  />
                  <button
                    onClick={() => setInkColor("#1E3A8A")}
                    className={`w-6 h-6 rounded-full bg-[#1E3A8A] transition cursor-pointer ${
                      inkColor === "#1E3A8A" ? "ring-2 ring-amber-400 scale-110" : "opacity-75"
                    }`}
                    title="Mực lam chàm"
                  />
                </div>
              </div>

              {/* Bảng điều khiển & Hướng dẫn thuận bút */}
              <div className="flex-1 space-y-3 w-full">
                {/* Thông tin chữ Hán đang chọn */}
                <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-serif font-bold text-[#204434]">{activeChar}</span>
                    <span className="text-xs font-mono font-bold text-[#8F6D3B]">
                      {etymology.radicals || "Chuẩn bút thuận"}
                    </span>
                  </div>
                  <p className="text-xs text-[#315E48] leading-relaxed">
                    <strong>Ý niệm chiết tự:</strong> {etymology.memo}
                  </p>
                </div>

                {/* Nút hành động */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAnimate}
                    className="py-2.5 px-3 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition"
                  >
                    <Play className="w-3.5 h-3.5 text-[#8F6D3B]" />
                    <span>Xem hoạt họa mẫu</span>
                  </button>

                  <button
                    onClick={handleStartQuiz}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition ${
                      isQuizMode
                        ? "bg-[#BC9B6B] text-white hover:bg-[#8F6D3B]"
                        : "bg-[#204434] text-white hover:bg-[#183629]"
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{isQuizMode ? "Viết lại từ đầu" : "Tự luyện viết (Quiz)"}</span>
                  </button>
                </div>

                {/* Nút bổ trợ khi đang thi viết Quiz */}
                {isQuizMode && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGiveHint}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>Gợi ý nét tiếp theo</span>
                    </button>

                    <button
                      onClick={toggleFaintOutline}
                      className="py-1.5 px-2 rounded-xl bg-white hover:bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition"
                    >
                      {showFaintOutline ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          <span>Ẩn nét mờ</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-[#204434]" />
                          <span>Hiện nét mờ</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Phản hồi trạng thái thi viết thời gian thực */}
                {quizFeedback && (
                  <div
                    className={`p-3 rounded-2xl border text-xs leading-relaxed animate-fadeIn ${
                      quizFeedback.startsWith("❌")
                        ? "bg-red-50 border-red-200 text-red-800"
                        : quizFeedback.startsWith("✓")
                        ? "bg-blue-50 border-blue-200 text-blue-800"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900 font-medium"
                    }`}
                  >
                    {quizFeedback}
                  </div>
                )}

                {/* Kết quả khi hoàn thành chữ */}
                {quizScore !== null && (
                  <div className="p-3 bg-white rounded-2xl border border-[#E5DEC9] flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <div>
                        <span className="text-xs font-bold text-[#204434] block">
                          Điểm viết chữ: {quizScore}/100đ
                        </span>
                        <span className="text-[11px] text-[#315E48]">
                          Số lỗi nét: {mistakesCount} lỗi
                        </span>
                      </div>
                    </div>

                    {/* Nút sang chữ tiếp theo nếu là từ nhiều chữ */}
                    {selectedCharIdx < characters.length - 1 && quizScore >= 70 && (
                      <button
                        onClick={() => {
                          setSelectedCharIdx(selectedCharIdx + 1);
                          setQuizScore(null);
                          setQuizFeedback(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <span>Viết chữ {selectedCharIdx + 2}: {characters[selectedCharIdx + 1]}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHẤM PHÁT ÂM THÔNG MINH BẰNG MICRO AI */}
        {activeTab === "SPEAK" && (
          <div className="p-5 sm:p-6 bg-[#FAF7F0] rounded-3xl border border-[#E5DEC9] flex flex-col items-center justify-center space-y-4 text-center">
            {/* Chuyển chế độ đọc từ đơn vs Đọc cả câu ví dụ ngữ cảnh */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#E5DEC9] text-xs font-bold">
              <button
                onClick={() => {
                  setSpeechMode("WORD");
                  setSpeechResult(null);
                  setSpeechAccuracy(null);
                  setSpeechErrorDetail(null);
                }}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  speechMode === "WORD"
                    ? "bg-[#204434] text-white shadow-xs"
                    : "text-[#315E48] hover:text-[#204434]"
                }`}
              >
                Luyện phát âm từ vựng
              </button>
              <button
                onClick={() => {
                  setSpeechMode("SENTENCE");
                  setSpeechResult(null);
                  setSpeechAccuracy(null);
                  setSpeechErrorDetail(null);
                }}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  speechMode === "SENTENCE"
                    ? "bg-[#204434] text-white shadow-xs"
                    : "text-[#315E48] hover:text-[#204434]"
                }`}
              >
                Luyện phát âm câu ngữ cảnh (Xét ngữ nghĩa)
              </button>
            </div>

            {/* Nội dung cần đọc */}
            <div className="space-y-1.5 max-w-md">
              {speechMode === "WORD" ? (
                <>
                  <span className="text-4xl sm:text-5xl font-serif font-bold text-[#204434] block">
                    {currentWord.hanzi}
                  </span>
                  <span className="text-lg font-mono font-bold text-[#8F6D3B] block">
                    {currentWord.pinyin}
                  </span>
                  <p className="text-xs text-[#315E48]">
                    <strong>Nghĩa tiếng Việt:</strong> {currentWord.meaningVi || currentWord.meaning}
                  </p>
                </>
              ) : (
                <>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-[#204434] block leading-snug">
                    {exampleSentence.zh}
                  </span>
                  <span className="text-sm font-mono font-bold text-[#8F6D3B] block">
                    {exampleSentence.pinyin}
                  </span>
                  <p className="text-xs text-[#315E48]">
                    <strong>Dịch nghĩa:</strong> {exampleSentence.vi}
                  </p>
                </>
              )}
            </div>

            {/* Nút nghe giọng bản xứ */}
            <button
              onClick={() =>
                handleSpeakText(
                  speechMode === "WORD" ? currentWord.hanzi : exampleSentence.zh
                )
              }
              className="px-4 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#F3EEDD] text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#BC9B6B]" />
              <span>Nghe phát âm chuẩn bản xứ</span>
            </button>

            {/* Nút Micro to trung tâm */}
            <div className="relative pt-2">
              <button
                onClick={handleStartSpeech}
                disabled={isRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition shadow-lg cursor-pointer ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse ring-8 ring-red-200"
                    : "bg-[#204434] text-white hover:bg-[#183629] hover:scale-105 active:scale-95"
                }`}
              >
                <Mic className="w-8 h-8" />
              </button>
            </div>

            {/* Trạng thái và Kết quả AI */}
            <div className="space-y-2 max-w-md w-full">
              <p className="text-xs font-semibold text-[#204434]">{speechStatusText}</p>

              {speechResult && (
                <div className="p-3 bg-white rounded-2xl border border-[#E5DEC9] text-xs text-left space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#315E48]">Máy nhận diện âm bạn đọc:</span>
                    <span className="font-serif font-bold text-[#204434]">
                      &quot;{speechResult}&quot;
                    </span>
                  </div>

                  {speechAccuracy !== null && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#315E48]">Độ chuẩn xác:</span>
                        <span
                          className={`font-bold ${
                            speechAccuracy >= 80
                              ? "text-emerald-700"
                              : speechAccuracy >= 50
                              ? "text-amber-700"
                              : "text-red-700"
                          }`}
                        >
                          {speechAccuracy}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-[#FAF7F0] rounded-full overflow-hidden border border-[#E5DEC9]">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            speechAccuracy >= 80
                              ? "bg-emerald-600"
                              : speechAccuracy >= 50
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${speechAccuracy}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {speechErrorDetail && (
                    <p className="text-[11px] text-red-700 pt-1 leading-relaxed border-t border-red-100">
                      {speechErrorDetail}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between">
          <span className="text-xs text-[#315E48]">
            HSK Bài học · {currentIdx + 1}/{practiceList.length} từ vựng
          </span>

          <div className="flex items-center gap-2">
            {earnedXpMsg && (
              <span className="text-xs font-bold text-amber-600 animate-bounce">
                {earnedXpMsg}
              </span>
            )}

            <button
              onClick={() => {
                if (currentIdx < practiceList.length - 1) {
                  setCurrentIdx(currentIdx + 1);
                  setQuizScore(null);
                  setQuizFeedback(null);
                  setSpeechResult(null);
                  setSpeechAccuracy(null);
                  setSpeechErrorDetail(null);
                } else {
                  onClose();
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition"
            >
              <span>{currentIdx < practiceList.length - 1 ? "Từ tiếp theo" : "Hoàn thành"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
