"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Check,
  Headphones,
  FileQuestion,
  Layers,
  BookOpen,
  Shuffle,
  Eye,
  EyeOff,
  Flame,
  Award,
  HelpCircle,
  RefreshCw,
  Edit3,
  BookmarkCheck,
  Filter,
} from "lucide-react";
import {
  saveMemoryRecord,
  getMemoryRecords,
  MemoryStatus,
} from "@/lib/memory-review-service";

export type VocabPracticeSubtype =
  | "flashcard"
  | "listen_meaning"
  | "listen_fill"
  | "quiz_meaning"
  | "quiz_fill_blank"
  | "sentence_order"
  | "type_meaning";

interface VocabPracticeSuiteProps {
  vocabList: any[];
  lessonTitleZh?: string;
  lessonNumber?: number;
  hskLevel?: number;
  studentId?: string;
  handleSpeak: (text: string) => void;
  onMemoryUpdated?: () => void;
}

// Hàm chuẩn hóa chuỗi tiếng Việt để so sánh nghĩa linh hoạt
function normalizeVi(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]/g, "");
}

function checkMeaningMatch(userInput: string, targetMeaning: string): boolean {
  const u = normalizeVi(userInput);
  const t = normalizeVi(targetMeaning);
  if (!u) return false;
  if (u === t) return true;
  if (t.includes(u) || u.includes(t)) return true;
  if (t.includes("camon") && (u.includes("camon") || u.includes("thanks"))) return true;
  if (t.includes("xinchao") && (u.includes("xinchao") || u.includes("chao"))) return true;
  return false;
}

function checkFillMatch(userInput: string, targetHanzi: string, targetPinyin: string): boolean {
  const clean = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "");
  const u = clean(userInput);
  if (!u) return false;
  if (u === clean(targetHanzi)) return true;
  if (u === clean(targetPinyin)) return true;
  const noTone = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, "");
  if (noTone(userInput) === noTone(targetPinyin)) return true;
  return false;
}

export default function VocabPracticeSuite({
  vocabList,
  lessonTitleZh = "Bài học HSK",
  lessonNumber = 1,
  hskLevel = 1,
  studentId,
  handleSpeak,
  onMemoryUpdated,
}: VocabPracticeSuiteProps) {
  // Bộ lọc ghi nhớ: "ALL" | "NOT_REMEMBERED" | "REVIEW_NEEDED" | "MASTERED"
  const [memoryFilter, setMemoryFilter] = useState<"ALL" | MemoryStatus>("ALL");
  const [memoryRecords, setMemoryRecords] = useState<any[]>([]);
  const [ratingFeedback, setRatingFeedback] = useState<string | null>(null);

  const refreshMemory = useCallback(() => {
    const records = getMemoryRecords(studentId);
    setMemoryRecords(records);
  }, [studentId]);

  useEffect(() => {
    refreshMemory();
  }, [refreshMemory]);

  const memoryMap = useMemo(() => {
    const map = new Map<string, MemoryStatus>();
    memoryRecords.forEach((r) => {
      map.set(r.hanzi, r.status);
    });
    return map;
  }, [memoryRecords]);

  const countsInLesson = useMemo(() => {
    let mastered = 0;
    let review = 0;
    let notRemembered = 0;
    vocabList.forEach((v: any) => {
      const st = memoryMap.get(v.hanzi);
      if (st === "MASTERED") mastered++;
      else if (st === "REVIEW_NEEDED") review++;
      else if (st === "NOT_REMEMBERED") notRemembered++;
    });
    return { mastered, review, notRemembered };
  }, [vocabList, memoryMap]);

  const activeVocabList = useMemo(() => {
    if (memoryFilter === "ALL") return vocabList;
    return vocabList.filter((v: any) => memoryMap.get(v.hanzi) === memoryFilter);
  }, [vocabList, memoryFilter, memoryMap]);
  // Chế độ luyện tập từ vựng hiện tại
  const [subType, setSubType] = useState<VocabPracticeSubtype>("flashcard");

  // Vị trí từ hiện tại
  const [currentIndex, setCurrentIndex] = useState(0);

  // Điểm số & Streak
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // 1. STATE FLASHCARD
  const [showCardMeaning, setShowCardMeaning] = useState(false);

  // 2. STATE TRẮC NGHIỆM / CHỌN NGHĨA (dùng cho listen_meaning, quiz_meaning, quiz_fill_blank)
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // 3. STATE ĐIỀN TỪ (listen_fill & type_meaning)
  const [typedInput, setTypedInput] = useState("");
  const [typedResult, setTypedResult] = useState<"CORRECT" | "INCORRECT" | null>(null);

  // 4. STATE SẮP XẾP CÂU (sentence_order)
  const [assembledTokens, setAssembledTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<{ id: string; text: string }[]>([]);
  const [orderResult, setOrderResult] = useState<"CORRECT" | "INCORRECT" | null>(null);

  const currentVocab = activeVocabList[currentIndex] || activeVocabList[0];
  const currentMemoryStatus = currentVocab ? memoryMap.get(currentVocab.hanzi) : undefined;
  const targetMeaning = currentVocab ? currentVocab.meaningVi || currentVocab.meaning : "";

  // Reset trạng thái khi chuyển từ hoặc chuyển dạng bài
  const resetQuestionState = useCallback(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setTypedInput("");
    setTypedResult(null);
    setOrderResult(null);
    setShowCardMeaning(false);
  }, []);

  useEffect(() => {
    resetQuestionState();
  }, [currentIndex, subType, resetQuestionState]);

  // Tự động phát âm khi vào dạng luyện nghe
  useEffect(() => {
    if (currentVocab && (subType === "listen_meaning" || subType === "listen_fill")) {
      handleSpeak(currentVocab.hanzi);
    }
  }, [currentIndex, subType, currentVocab, handleSpeak]);

  // Tạo 4 lựa chọn cho Trắc nghiệm Nghĩa (quiz_meaning & listen_meaning)
  const meaningOptions = useMemo(() => {
    if (!currentVocab || vocabList.length < 2) return [];
    const correct = targetMeaning;
    const others = vocabList
      .filter((v) => (v.meaningVi || v.meaning) !== correct)
      .map((v) => v.meaningVi || v.meaning);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    return [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());
  }, [currentVocab, vocabList, targetMeaning]);

  // Tạo 4 lựa chọn cho Trắc nghiệm Điền từ vào câu (quiz_fill_blank)
  const fillBlankOptions = useMemo(() => {
    if (!currentVocab || vocabList.length < 2) return [];
    const correct = currentVocab.hanzi;
    const others = vocabList.filter((v) => v.hanzi !== correct).map((v) => v.hanzi);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    return [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());
  }, [currentVocab, vocabList]);

  // Tạo câu khuyết và câu ví dụ cho dạng Điền từ vào câu (quiz_fill_blank)
  const fillBlankSentence = useMemo(() => {
    if (!currentVocab) return { blankSentence: "", rawSentence: "", meaning: "" };
    const raw = currentVocab.exampleZh || `${currentVocab.hanzi}。`;
    const blank = raw.replace(new RegExp(currentVocab.hanzi, "g"), " ______ ");
    return {
      blankSentence: blank,
      rawSentence: raw,
      meaning: currentVocab.exampleVi || `(Nghĩa câu ví dụ của từ: ${targetMeaning})`,
    };
  }, [currentVocab, targetMeaning]);

  // Khởi tạo các token cho dạng Sắp xếp câu (sentence_order)
  useEffect(() => {
    if (subType === "sentence_order" && currentVocab) {
      const sentence = currentVocab.exampleZh || `${currentVocab.hanzi}很好。`;
      // Tách các từ/cụm từ theo ký tự hoặc cụm từ
      // Nếu câu có chứa currentVocab.hanzi, tách nó ra và các từ còn lại
      const rawTokens: string[] = [];
      const hanziWord = currentVocab.hanzi;
      let remaining = sentence;

      // Chia nhỏ câu thành các từ có nghĩa
      const punctuation = ["，", "。", "！", "？", "、"];
      const chunks: string[] = [];
      let temp = "";
      for (const ch of sentence) {
        if (punctuation.includes(ch)) {
          if (temp) chunks.push(temp);
          chunks.push(ch);
          temp = "";
        } else {
          temp += ch;
        }
      }
      if (temp) chunks.push(temp);

      const tokens: string[] = [];
      for (const chunk of chunks) {
        if (punctuation.includes(chunk)) {
          tokens.push(chunk);
        } else if (chunk.includes(hanziWord)) {
          const parts = chunk.split(hanziWord);
          if (parts[0]) tokens.push(parts[0]);
          tokens.push(hanziWord);
          if (parts[1]) tokens.push(parts[1]);
        } else if (chunk.length > 2) {
          tokens.push(chunk.slice(0, 2));
          tokens.push(chunk.slice(2));
        } else {
          tokens.push(chunk);
        }
      }

      const finalTokens = tokens.filter(Boolean);
      const mappedTokens = finalTokens.map((t, idx) => ({
        id: `${t}-${idx}-${Math.random()}`,
        text: t,
      }));

      // Xáo trộn
      setAvailableTokens([...mappedTokens].sort(() => 0.5 - Math.random()));
      setAssembledTokens([]);
      setOrderResult(null);
    }
  }, [subType, currentVocab]);

  // Xử lý nạp token trong dạng Sắp xếp câu
  const handlePickToken = (tok: { id: string; text: string }) => {
    if (orderResult !== null) return;
    setAssembledTokens((prev) => [...prev, tok.text]);
    setAvailableTokens((prev) => prev.filter((t) => t.id !== tok.id));
  };

  const handleRemoveToken = (index: number) => {
    if (orderResult !== null) return;
    const removedText = assembledTokens[index];
    const newAssembled = assembledTokens.filter((_, idx) => idx !== index);
    setAssembledTokens(newAssembled);
    setAvailableTokens((prev) => [...prev, { id: `${removedText}-${Date.now()}`, text: removedText }]);
  };

  const handleCheckSentenceOrder = () => {
    const rawSentence = (currentVocab?.exampleZh || `${currentVocab?.hanzi}很好。`).replace(/\s+/g, "");
    const studentSentence = assembledTokens.join("").replace(/\s+/g, "");
    const isCorrect = studentSentence === rawSentence;
    setOrderResult(isCorrect ? "CORRECT" : "INCORRECT");
    if (isCorrect) {
      setScore((s) => s + 15);
      setStreak((st) => st + 1);
      handleSpeak(rawSentence);
    } else {
      setStreak(0);
    }
  };

  // Xử lý nộp Trắc nghiệm (Nghĩa hoặc Điền câu)
  const handleOptionClick = (opt: string, correct: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);
    const isCorrect = opt === correct;
    if (isCorrect) {
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      handleSpeak(currentVocab.hanzi);
    } else {
      setStreak(0);
    }
  };

  // Xử lý nộp bài Điền từ (listen_fill & type_meaning)
  const handleCheckTyped = () => {
    if (!typedInput.trim()) return;
    let isCorrect = false;

    if (subType === "listen_fill") {
      isCorrect = checkFillMatch(typedInput, currentVocab.hanzi, currentVocab.pinyin);
    } else if (subType === "type_meaning") {
      isCorrect = checkMeaningMatch(typedInput, targetMeaning);
    }

    setTypedResult(isCorrect ? "CORRECT" : "INCORRECT");
    if (isCorrect) {
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      handleSpeak(currentVocab.hanzi);
    } else {
      setStreak(0);
    }
  };

  const handleRateMemory = (status: MemoryStatus) => {
    if (!currentVocab) return;
    saveMemoryRecord(
      {
        id: currentVocab.id || currentVocab.hanzi,
        hanzi: currentVocab.hanzi,
        pinyin: currentVocab.pinyin || "",
        meaningVi: currentVocab.meaningVi || currentVocab.meaning || "",
        hskLevel,
        lessonNumber,
      },
      status,
      studentId
    );
    refreshMemory();
    onMemoryUpdated?.();

    const msg =
      status === "MASTERED"
        ? "✓ Đã đánh dấu: Đã nhớ! (Ôn ngắt quãng sau 3-7 ngày)"
        : status === "REVIEW_NEEDED"
        ? "⏳ Đã đánh dấu: Cần ôn! (Sẽ nhắc ôn lại vào ngày mai)"
        : "⚠️ Đã đánh dấu: Chưa nhớ! (Lưu vào danh sách luyện kiến thức yếu)";
    setRatingFeedback(msg);
    setTimeout(() => setRatingFeedback(null), 2500);

    if (activeVocabList.length > 1) {
      setTimeout(() => {
        handleNextWord();
      }, 500);
    }
  };

  const handleNextWord = () => {
    setCurrentIndex((prev) => (prev < activeVocabList.length - 1 ? prev + 1 : 0));
  };

  const handlePrevWord = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : activeVocabList.length - 1));
  };

  if (!vocabList || vocabList.length === 0) {
    return (
      <div className="py-12 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#E5DEC9]">
        <p className="text-xs text-[#315E48]">Bài học này chưa có danh sách từ vựng.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Header Chọn Chế độ Luyện Từ Vựng */}
      <div className="bg-[#FAF7F0] p-3 rounded-2xl border border-[#E5DEC9] space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#204434] px-1">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#8F6D3B]" />
            <span>Phân hệ luyện tập từ vựng chuyên sâu (6 chế độ)</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#8F6D3B]">
              <Award className="w-3.5 h-3.5 text-[#BC9B6B]" />
              <span>{score} XP</span>
            </span>
            {streak > 1 && (
              <span className="flex items-center gap-1 text-orange-600 font-extrabold animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                <span>x{streak} Streak!</span>
              </span>
            )}
          </div>
        </div>

        {/* Thanh Bộ Lọc Trạng Thái Ghi Nhớ */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5DEC9]/60 flex-wrap text-xs">
          <span className="text-[#315E48] font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#8F6D3B]" />
            Lọc từ để ôn:
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => {
                setMemoryFilter("ALL");
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition ${
                memoryFilter === "ALL"
                  ? "bg-[#204434] text-white"
                  : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
              }`}
            >
              Tất cả ({vocabList.length})
            </button>
            <button
              onClick={() => {
                setMemoryFilter("NOT_REMEMBERED");
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition flex items-center gap-1 ${
                memoryFilter === "NOT_REMEMBERED"
                  ? "bg-rose-600 text-white"
                  : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
              }`}
            >
              <span>⚠️ Chưa nhớ</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">
                {countsInLesson.notRemembered}
              </span>
            </button>
            <button
              onClick={() => {
                setMemoryFilter("REVIEW_NEEDED");
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition flex items-center gap-1 ${
                memoryFilter === "REVIEW_NEEDED"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <span>⏳ Cần ôn</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">
                {countsInLesson.review}
              </span>
            </button>
            <button
              onClick={() => {
                setMemoryFilter("MASTERED");
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition flex items-center gap-1 ${
                memoryFilter === "MASTERED"
                  ? "bg-emerald-700 text-white"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <span>✓ Đã nhớ</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">
                {countsInLesson.mastered}
              </span>
            </button>
          </div>
        </div>

        {/* Thanh chuyển chế độ mượt mà */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold">
          <button
            onClick={() => setSubType("flashcard")}
            className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              subType === "flashcard"
                ? "bg-[#204434] text-white shadow-xs"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Thẻ Flashcard</span>
          </button>

          <button
            onClick={() => setSubType("listen_meaning")}
            className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              subType === "listen_meaning"
                ? "bg-[#204434] text-white shadow-xs"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>2. Nghe chọn nghĩa</span>
          </button>

          <button
            onClick={() => setSubType("listen_fill")}
            className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              subType === "listen_fill"
                ? "bg-[#204434] text-white shadow-xs"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>3. Nghe điền từ</span>
          </button>

          <button
            onClick={() => setSubType("quiz_meaning")}
            className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              subType === "quiz_meaning"
                ? "bg-[#204434] text-white shadow-xs"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>4. Chọn nghĩa đúng</span>
          </button>

          <button
            onClick={() => setSubType("quiz_fill_blank")}
            className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              subType === "quiz_fill_blank"
                ? "bg-[#204434] text-white shadow-xs"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <FileQuestion className="w-3.5 h-3.5" />
            <span>5. Điền từ vào câu</span>
          </button>

          <button
            onClick={() => setSubType("sentence_order")}
            className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              subType === "sentence_order"
                ? "bg-[#204434] text-white shadow-xs"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>6. Sắp xếp câu</span>
          </button>

          <button
            onClick={() => setSubType("type_meaning")}
            className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              subType === "type_meaning"
                ? "bg-[#204434] text-white shadow-xs"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
            <span>7. Nhìn Hán tự viết nghĩa</span>
          </button>
        </div>
      </div>

      {/* 2. Thẻ Khung Luyện tập Chính */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DEC9] shadow-sm flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto">
        {/* Header thông tin bài học & vị trí */}
        <div className="flex items-center justify-between w-full text-xs text-[#315E48] pb-3 border-b border-[#E5DEC9]/60">
          <span className="font-mono font-bold text-[#8F6D3B]">
            Bài {String(lessonNumber).padStart(2, "0")} · {lessonTitleZh}
          </span>
          <span>
            Từ vựng <strong>{activeVocabList.length > 0 ? currentIndex + 1 : 0}</strong> / {activeVocabList.length}
          </span>
        </div>

        {/* ================================================================= */}
        {/* CHẾ ĐỘ 1: THẺ FLASHCARD TƯƠNG TÁC                                */}
        {/* ================================================================= */}
        {subType === "flashcard" && (
          <div className="w-full space-y-5 animate-fadeIn">
            <div
              onClick={() => setShowCardMeaning(!showCardMeaning)}
              className="w-full min-h-[220px] p-8 rounded-3xl bg-[#FAF7F0] border-2 border-[#E5DEC9] hover:border-[#204434] transition shadow-md flex flex-col items-center justify-center cursor-pointer space-y-3 group"
            >
              <div className="font-serif font-bold text-5xl text-[#204434] group-hover:scale-105 transition-transform tracking-wide">
                {currentVocab.hanzi}
              </div>

              {showCardMeaning ? (
                <div className="space-y-1.5 animate-fadeIn">
                  <div className="text-lg font-mono font-bold text-[#8F6D3B]">
                    {currentVocab.pinyin}
                  </div>
                  <div className="text-base font-bold text-[#204434]">
                    {targetMeaning}
                  </div>
                  {currentVocab.exampleZh && (
                    <div className="pt-2 text-xs text-[#6B766D] border-t border-[#E5DEC9]/60 italic max-w-sm">
                      <p className="font-medium text-[#204434]">{currentVocab.exampleZh}</p>
                      <p>{currentVocab.exampleVi}</p>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-xs text-[#315E48]/70 italic flex items-center gap-1 pt-2">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Chạm vào thẻ để lật xem Phiên âm & Ý nghĩa</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleSpeak(currentVocab.hanzi)}
                className="p-3 rounded-2xl bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#204434] hover:text-white transition cursor-pointer shadow-xs"
                title="Phát âm chữ này"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handlePrevWord}
                className="px-4 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] text-xs font-semibold text-[#204434] hover:bg-[#FAF7F0] transition cursor-pointer"
              >
                Từ trước
              </button>
              <button
                type="button"
                onClick={() => setShowCardMeaning(!showCardMeaning)}
                className="px-5 py-2.5 rounded-2xl bg-[#BC9B6B] hover:bg-[#a58656] text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                {showCardMeaning ? "Ẩn đáp án" : "Lật thẻ xem nghĩa"}
              </button>
              <button
                type="button"
                onClick={handleNextWord}
                className="px-4 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#163024] text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Từ kế tiếp
              </button>
            </div>

            {/* 3 Nút Đánh giá Mức độ Ghi nhớ: Chưa nhớ / Cần ôn / Đã nhớ */}
            <div className="w-full pt-4 mt-2 border-t border-[#E5DEC9]/80 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#204434] flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4 text-[#8F6D3B]" />
                  <span>Đánh giá mức độ ghi nhớ từ này:</span>
                </span>
                {currentMemoryStatus ? (
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      currentMemoryStatus === "MASTERED"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : currentMemoryStatus === "REVIEW_NEEDED"
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-rose-100 text-rose-800 border-rose-300"
                    }`}
                  >
                    {currentMemoryStatus === "MASTERED"
                      ? "✓ Đã nhớ"
                      : currentMemoryStatus === "REVIEW_NEEDED"
                      ? "⏳ Cần ôn"
                      : "⚠️ Chưa nhớ"}
                  </span>
                ) : (
                  <span className="text-[11px] text-[#6B766D] italic">Chưa đánh giá</span>
                )}
              </div>

              {ratingFeedback && (
                <div className="text-xs py-1.5 px-3 rounded-xl bg-[#FAF7F0] border border-[#BC9B6B]/40 text-[#204434] font-semibold animate-bounce text-center">
                  {ratingFeedback}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleRateMemory("NOT_REMEMBERED")}
                  className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                    currentMemoryStatus === "NOT_REMEMBERED"
                      ? "bg-rose-600 text-white border-rose-600 ring-2 ring-rose-300 shadow-sm"
                      : "bg-rose-50/80 text-rose-700 border-rose-200 hover:bg-rose-100"
                  }`}
                >
                  <span>⚠️ Chưa nhớ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRateMemory("REVIEW_NEEDED")}
                  className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                    currentMemoryStatus === "REVIEW_NEEDED"
                      ? "bg-amber-600 text-white border-amber-600 ring-2 ring-amber-300 shadow-sm"
                      : "bg-amber-50/80 text-amber-800 border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  <span>⏳ Cần ôn</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRateMemory("MASTERED")}
                  className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                    currentMemoryStatus === "MASTERED"
                      ? "bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-300 shadow-sm"
                      : "bg-emerald-50/80 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <span>✓ Đã nhớ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* CHẾ ĐỘ 2: LUYỆN NGHE - LOẠI 1: NGHE CHỌN NGHĨA                    */}
        {/* ================================================================= */}
        {subType === "listen_meaning" && (
          <div className="w-full space-y-5 animate-fadeIn">
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#315E48]">
                Bấm vào loa để nghe phát âm, sau đó chọn nghĩa tiếng Việt chính xác:
              </p>
              <button
                type="button"
                onClick={() => handleSpeak(currentVocab.hanzi)}
                className="w-20 h-20 mx-auto rounded-3xl bg-[#FAF7F0] border-2 border-[#BC9B6B] hover:scale-105 hover:bg-[#204434] hover:text-white text-[#204434] transition shadow-md flex items-center justify-center cursor-pointer group"
                title="Nghe lại phát âm"
              >
                <Volume2 className="w-8 h-8 group-hover:animate-pulse" />
              </button>
              <span className="text-[11px] text-[#8F6D3B] font-semibold block">
                Bấm loa để nghe lại âm thanh
              </span>
            </div>

            {/* Nếu đã trả lời thì hiện chữ Hán & Pinyin để đối chiếu */}
            {isAnswered && (
              <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] animate-fadeIn">
                <span className="font-serif font-bold text-2xl text-[#204434] mr-2">
                  {currentVocab.hanzi}
                </span>
                <span className="font-mono font-bold text-sm text-[#8F6D3B]">
                  ({currentVocab.pinyin})
                </span>
              </div>
            )}

            {/* 4 Lựa chọn trắc nghiệm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold w-full">
              {meaningOptions.map((opt, idx) => {
                const isCorrect = opt === targetMeaning;
                const isSelected = selectedOption === opt;
                let btnStyle = "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]";
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-600 text-white border-emerald-600 font-bold";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-500 text-white border-rose-500 line-through";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleOptionClick(opt, targetMeaning)}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between shadow-2xs ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <button
                type="button"
                onClick={handleNextWord}
                className="px-6 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#163024] text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-2 mx-auto"
              >
                <span>Câu kế tiếp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* CHẾ ĐỘ 3: LUYỆN NGHE - LOẠI 2: NGHE ĐIỀN TỪ                      */}
        {/* ================================================================= */}
        {subType === "listen_fill" && (
          <div className="w-full space-y-5 animate-fadeIn">
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#315E48]">
                Nghe phát âm và gõ Chữ Hán hoặc Pinyin tương ứng:
              </p>
              <button
                type="button"
                onClick={() => handleSpeak(currentVocab.hanzi)}
                className="w-20 h-20 mx-auto rounded-3xl bg-[#FAF7F0] border-2 border-[#BC9B6B] hover:scale-105 hover:bg-[#204434] hover:text-white text-[#204434] transition shadow-md flex items-center justify-center cursor-pointer group"
                title="Nghe lại phát âm"
              >
                <Volume2 className="w-8 h-8 group-hover:animate-pulse" />
              </button>
              <span className="text-[11px] text-[#8F6D3B] font-semibold block">
                Gợi ý nghĩa tiếng Việt: <strong>{targetMeaning}</strong>
              </span>
            </div>

            <div className="w-full max-w-md mx-auto space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCheckTyped()}
                  disabled={typedResult !== null}
                  placeholder="Gõ chữ Hán hoặc Pinyin (ví dụ: ni hao)..."
                  className="w-full px-4 py-3 bg-white border border-[#E5DEC9] rounded-2xl text-center font-bold text-sm text-[#204434] focus:outline-none focus:border-[#204434]"
                />
                {typedResult === null ? (
                  <button
                    type="button"
                    onClick={handleCheckTyped}
                    disabled={!typedInput.trim()}
                    className="px-5 py-3 rounded-2xl bg-[#204434] hover:bg-[#163024] text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
                  >
                    Kiểm tra
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextWord}
                    className="px-5 py-3 rounded-2xl bg-[#204434] hover:bg-[#163024] text-white text-xs font-bold transition cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
                  >
                    <span>Kế tiếp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {typedResult !== null && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-bold animate-fadeIn flex items-center justify-between ${
                    typedResult === "CORRECT"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                      : "bg-rose-50 text-rose-800 border border-rose-300"
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <p className="flex items-center gap-1.5">
                      {typedResult === "CORRECT" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      <span>
                        {typedResult === "CORRECT" ? "Chính xác! Xuất sắc!" : "Chưa chính xác!"}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#315E48]">
                      Đáp án chuẩn: <strong>{currentVocab.hanzi}</strong> ({currentVocab.pinyin})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSpeak(currentVocab.hanzi)}
                    className="p-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#204434] hover:text-white"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* CHẾ ĐỘ 4: TRẮC NGHIỆM - DẠNG 1: CHỌN NGHĨA ĐÚNG                   */}
        {/* ================================================================= */}
        {subType === "quiz_meaning" && (
          <div className="w-full space-y-5 animate-fadeIn">
            <div className="p-6 rounded-3xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-2">
              <div className="font-serif font-bold text-4xl text-[#204434]">
                {currentVocab.hanzi}
              </div>
              <div className="font-mono font-bold text-base text-[#8F6D3B]">
                {currentVocab.pinyin}
              </div>
              <button
                type="button"
                onClick={() => handleSpeak(currentVocab.hanzi)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#315E48] hover:text-[#204434]"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe phát âm</span>
              </button>
            </div>

            <p className="text-xs font-bold text-[#315E48] text-left">
              Chọn nghĩa tiếng Việt chính xác của từ trên:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold w-full">
              {meaningOptions.map((opt, idx) => {
                const isCorrect = opt === targetMeaning;
                const isSelected = selectedOption === opt;
                let btnStyle = "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]";
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-600 text-white border-emerald-600 font-bold";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-500 text-white border-rose-500 line-through";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleOptionClick(opt, targetMeaning)}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between shadow-2xs ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <button
                type="button"
                onClick={handleNextWord}
                className="px-6 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#163024] text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-2 mx-auto"
              >
                <span>Từ kế tiếp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* CHẾ ĐỘ 5: TRẮC NGHIỆM - DẠNG 2: ĐIỀN TỪ CÒN THIẾU VÀO CÂU        */}
        {/* ================================================================= */}
        {subType === "quiz_fill_blank" && (
          <div className="w-full space-y-5 animate-fadeIn">
            <div className="p-6 rounded-3xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-2 text-center">
              <span className="text-[11px] font-bold text-[#8F6D3B] uppercase tracking-wider block">
                Điền từ thích hợp vào chỗ trống
              </span>
              <div className="font-serif font-bold text-2xl sm:text-3xl text-[#204434] leading-relaxed">
                {fillBlankSentence.blankSentence}
              </div>
              <p className="text-xs text-[#315E48] italic pt-1">
                {fillBlankSentence.meaning}
              </p>
              <button
                type="button"
                onClick={() => handleSpeak(fillBlankSentence.rawSentence)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#315E48] hover:text-[#204434] pt-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe câu hoàn chỉnh</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold w-full">
              {fillBlankOptions.map((word, idx) => {
                const isCorrect = word === currentVocab.hanzi;
                const isSelected = selectedOption === word;
                let btnStyle = "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]";
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-600 text-white border-emerald-600 font-bold";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-500 text-white border-rose-500 line-through";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleOptionClick(word, currentVocab.hanzi)}
                    className={`p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 shadow-2xs ${btnStyle}`}
                  >
                    <span className="text-lg font-serif">{word}</span>
                    {isAnswered && isCorrect && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <button
                type="button"
                onClick={handleNextWord}
                className="px-6 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#163024] text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-2 mx-auto"
              >
                <span>Câu kế tiếp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* CHẾ ĐỘ 6: SẮP XẾP TỪ THÀNH CÂU HOÀN CHỈNH                         */}
        {/* ================================================================= */}
        {subType === "sentence_order" && (
          <div className="w-full space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#315E48]">
                Bấm vào các thẻ từ bên dưới để ghép thành câu đúng nghĩa:
              </span>
              <p className="text-xs text-[#8F6D3B] italic">
                Nghĩa câu: <strong>{currentVocab.exampleVi || `(Câu ví dụ chứa từ: ${targetMeaning})`}</strong>
              </p>
            </div>

            {/* Khung chứa các từ học sinh đã chọn */}
            <div className="min-h-[70px] p-4 rounded-2xl bg-[#FAF7F0] border-2 border-dashed border-[#E5DEC9] flex flex-wrap items-center justify-center gap-2">
              {assembledTokens.length === 0 ? (
                <span className="text-xs text-gray-400 italic">
                  Chạm vào các thẻ từ bên dưới để xếp vào đây...
                </span>
              ) : (
                assembledTokens.map((word, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleRemoveToken(idx)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#204434] text-[#204434] font-serif font-bold text-base shadow-xs hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 transition cursor-pointer"
                    title="Chạm để gỡ thẻ từ này"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Khung thẻ từ khả dụng để chọn */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {availableTokens.map((tok) => (
                <button
                  key={tok.id}
                  type="button"
                  onClick={() => handlePickToken(tok)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif font-bold text-base shadow-2xs hover:bg-[#204434] hover:text-white transition cursor-pointer"
                >
                  {tok.text}
                </button>
              ))}
            </div>

            {/* Phản hồi sau khi kiểm tra */}
            {orderResult !== null && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-bold animate-fadeIn flex items-center justify-between ${
                  orderResult === "CORRECT"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                    : "bg-rose-50 text-rose-800 border border-rose-300"
                }`}
              >
                <div className="space-y-0.5 text-left">
                  <p className="flex items-center gap-1.5">
                    {orderResult === "CORRECT" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>
                      {orderResult === "CORRECT" ? "Chính xác! Câu chuẩn xác!" : "Thứ tự chưa đúng!"}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#315E48]">
                    Câu chuẩn: <strong>{currentVocab.exampleZh || `${currentVocab.hanzi}很好。`}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSpeak(currentVocab.exampleZh || currentVocab.hanzi)}
                  className="p-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#204434] hover:text-white"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Nút hành động */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const sentence = currentVocab.exampleZh || `${currentVocab.hanzi}很好。`;
                  const allToks: string[] = sentence.split("");
                  setAvailableTokens(allToks.map((t: string, i: number) => ({ id: `${t}-${i}`, text: t })));
                  setAssembledTokens([]);
                  setOrderResult(null);
                }}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-xs font-semibold text-[#315E48] hover:bg-[#FAF7F0] transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại câu này</span>
              </button>

              {orderResult === null ? (
                <button
                  type="button"
                  onClick={handleCheckSentenceOrder}
                  disabled={assembledTokens.length === 0}
                  className="px-6 py-2 rounded-xl bg-[#204434] hover:bg-[#163024] text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Kiểm tra câu
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextWord}
                  className="px-6 py-2 rounded-xl bg-[#204434] hover:bg-[#163024] text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>Câu kế tiếp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* CHẾ ĐỘ 7: NHÌN CHỮ HÁN VIẾT NGHĨA TIẾNG VIỆT                       */}
        {/* ================================================================= */}
        {subType === "type_meaning" && (
          <div className="w-full space-y-5 animate-fadeIn">
            <div className="p-6 rounded-3xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-2">
              <div className="font-serif font-bold text-5xl text-[#204434]">
                {currentVocab.hanzi}
              </div>
              <div className="font-mono font-bold text-base text-[#8F6D3B]">
                {currentVocab.pinyin}
              </div>
              <button
                type="button"
                onClick={() => handleSpeak(currentVocab.hanzi)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#315E48] hover:text-[#204434]"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe phát âm</span>
              </button>
            </div>

            <p className="text-xs font-bold text-[#315E48]">
              Nhìn chữ Hán và gõ nghĩa tiếng Việt tương ứng:
            </p>

            <div className="w-full max-w-md mx-auto space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCheckTyped()}
                  disabled={typedResult !== null}
                  placeholder="Gõ nghĩa tiếng Việt (ví dụ: xin chào)..."
                  className="w-full px-4 py-3 bg-white border border-[#E5DEC9] rounded-2xl text-center font-bold text-sm text-[#204434] focus:outline-none focus:border-[#204434]"
                />
                {typedResult === null ? (
                  <button
                    type="button"
                    onClick={handleCheckTyped}
                    disabled={!typedInput.trim()}
                    className="px-5 py-3 rounded-2xl bg-[#204434] hover:bg-[#163024] text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
                  >
                    Kiểm tra
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextWord}
                    className="px-5 py-3 rounded-2xl bg-[#204434] hover:bg-[#163024] text-white text-xs font-bold transition cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
                  >
                    <span>Kế tiếp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {typedResult !== null && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-bold animate-fadeIn flex items-center justify-between ${
                    typedResult === "CORRECT"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                      : "bg-rose-50 text-rose-800 border border-rose-300"
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <p className="flex items-center gap-1.5">
                      {typedResult === "CORRECT" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      <span>
                        {typedResult === "CORRECT" ? "Chính xác! Bạn nhớ bài rất tốt!" : "Chưa chính xác!"}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#315E48]">
                      Nghĩa chuẩn xác: <strong>{targetMeaning}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
