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
  ChevronLeft,
  ChevronRight,
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
  Star,
  MinusCircle,
  Search,
  BookA,
  Clock,
  BarChart2,
  Lightbulb,
  Link2,
  Image as ImageIcon,
} from "lucide-react";
import {
  saveMemoryRecord,
  getMemoryRecords,
  MemoryStatus,
  recordStudyTime,
  getTodayStudySeconds,
  getWeeklyStudySeconds,
  formatStudyTimeVi,
} from "@/lib/memory-review-service";
import {
  getEtymology,
  getRelatedWords,
  getExamplesForVocab,
} from "@/lib/chinese-vocab-helper";

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

// Chuẩn hóa so sánh nghĩa tiếng Việt
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
  studentId = "guest",
  handleSpeak,
  onMemoryUpdated,
}: VocabPracticeSuiteProps) {
  // Chế độ luyện tập từ vựng hiện tại (6-7 chế độ)
  const [subType, setSubType] = useState<VocabPracticeSubtype>("flashcard");

  // Vị trí từ hiện tại trong danh sách
  const [currentIndex, setCurrentIndex] = useState(0);

  // Điểm số & Streak
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // State Flashcard
  const [showCardMeaning, setShowCardMeaning] = useState(false);

  // State Trắc nghiệm
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // State Điền từ
  const [typedInput, setTypedInput] = useState("");
  const [typedResult, setTypedResult] = useState<"CORRECT" | "INCORRECT" | null>(null);

  // State Sắp xếp câu
  const [assembledTokens, setAssembledTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<{ id: string; text: string }[]>([]);
  const [orderResult, setOrderResult] = useState<"CORRECT" | "INCORRECT" | null>(null);

  // Memory Records & Sync
  const [memoryRecords, setMemoryRecords] = useState<any[]>([]);
  const [ratingFeedback, setRatingFeedback] = useState<string | null>(null);
  
  // Thời gian học thực tế hôm nay & trong tuần (ĐỘNG 100%)
  const [todayStudySec, setTodayStudySec] = useState(() => getTodayStudySeconds(studentId));
  const [weeklyStudySec, setWeeklyStudySec] = useState(() => getWeeklyStudySeconds(studentId));

  useEffect(() => {
    const timer = setInterval(() => {
      recordStudyTime(5, studentId);
      setTodayStudySec(getTodayStudySeconds(studentId));
      setWeeklyStudySec(getWeeklyStudySeconds(studentId));
    }, 5000);
    return () => clearInterval(timer);
  }, [studentId]);

  // Tìm kiếm & Sắp xếp danh sách từ vựng bên trái
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"DEFAULT" | "NOT_REMEMBERED" | "REVIEW_NEEDED" | "PINYIN">("DEFAULT");
  const [statusFilter, setStatusFilter] = useState<"ALL" | MemoryStatus>("ALL");

  // Từ yêu thích (Star Favorite)
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Ghi chú cá nhân cho từng từ
  const [vocabNotes, setVocabNotes] = useState<Record<string, string>>({});
  const [currentNote, setCurrentNote] = useState("");

  // Load Memory Records từ localStorage
  const refreshMemory = useCallback(() => {
    const records = getMemoryRecords(studentId);
    setMemoryRecords(records);
  }, [studentId]);

  useEffect(() => {
    refreshMemory();
  }, [refreshMemory]);

  // Load Favorites & Notes từ localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const favRaw = localStorage.getItem(`hsk_fav_${studentId}`);
        if (favRaw) setFavorites(JSON.parse(favRaw));
        const notesRaw = localStorage.getItem(`hsk_notes_${studentId}`);
        if (notesRaw) setVocabNotes(JSON.parse(notesRaw));
      } catch (e) {
        console.warn("Error loading student notes/favorites:", e);
      }
    }
  }, [studentId]);

  // Map trạng thái ghi nhớ
  const memoryMap = useMemo(() => {
    const map = new Map<string, MemoryStatus>();
    memoryRecords.forEach((r) => {
      map.set(r.hanzi, r.status);
    });
    return map;
  }, [memoryRecords]);

  // Thống kê nhanh trong bài này
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

  const totalInLesson = vocabList.length;
  const masteryPercentage = totalInLesson > 0 ? Math.round((countsInLesson.mastered / totalInLesson) * 100) : 0;

  // Lọc và sắp xếp danh sách từ vựng bên trái
  const filteredVocabList = useMemo(() => {
    let list = [...vocabList];

    // Lọc theo tìm kiếm
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((v: any) => {
        const hz = (v.hanzi || "").toLowerCase();
        const py = (v.pinyin || "").toLowerCase();
        const mn = (v.meaningVi || v.meaning || "").toLowerCase();
        return hz.includes(q) || py.includes(q) || mn.includes(q);
      });
    }

    // Lọc theo trạng thái
    if (statusFilter !== "ALL") {
      list = list.filter((v: any) => memoryMap.get(v.hanzi) === statusFilter);
    }

    // Sắp xếp
    if (sortOrder === "NOT_REMEMBERED") {
      list.sort((a, b) => {
        const stA = memoryMap.get(a.hanzi) === "NOT_REMEMBERED" ? -1 : 1;
        const stB = memoryMap.get(b.hanzi) === "NOT_REMEMBERED" ? -1 : 1;
        return stA - stB;
      });
    } else if (sortOrder === "REVIEW_NEEDED") {
      list.sort((a, b) => {
        const stA = memoryMap.get(a.hanzi) === "REVIEW_NEEDED" ? -1 : 1;
        const stB = memoryMap.get(b.hanzi) === "REVIEW_NEEDED" ? -1 : 1;
        return stA - stB;
      });
    } else if (sortOrder === "PINYIN") {
      list.sort((a, b) => (a.pinyin || "").localeCompare(b.pinyin || ""));
    }

    return list;
  }, [vocabList, searchQuery, statusFilter, sortOrder, memoryMap]);

  // Từ vựng hiện tại đang được chọn
  const currentVocab = filteredVocabList[currentIndex] || vocabList[0];
  const currentMemoryStatus = currentVocab ? memoryMap.get(currentVocab.hanzi) : undefined;
  const targetMeaning = currentVocab ? currentVocab.meaningVi || currentVocab.meaning : "";
  const isCurrentFavorite = currentVocab ? !!favorites[currentVocab.hanzi] : false;

  // Cập nhật note hiện tại khi đổi từ
  useEffect(() => {
    if (currentVocab) {
      setCurrentNote(vocabNotes[currentVocab.hanzi] || "");
    }
  }, [currentVocab, vocabNotes]);

  // Lưu note cho từ hiện tại
  const handleSaveNote = (noteText: string) => {
    if (!currentVocab) return;
    setCurrentNote(noteText);
    const updated = { ...vocabNotes, [currentVocab.hanzi]: noteText };
    setVocabNotes(updated);
    try {
      localStorage.setItem(`hsk_notes_${studentId}`, JSON.stringify(updated));
    } catch {}
  };

  // Đảo trạng thái Favorite ⭐
  const toggleFavorite = () => {
    if (!currentVocab) return;
    const hz = currentVocab.hanzi;
    const nextState = !favorites[hz];
    const updated = { ...favorites, [hz]: nextState };
    setFavorites(updated);
    try {
      localStorage.setItem(`hsk_fav_${studentId}`, JSON.stringify(updated));
    } catch {}
  };

  // Reset trạng thái câu hỏi khi chuyển từ hoặc dạng bài
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

  // Đánh giá 3 mức độ nhớ: Chưa nhớ / Cần ôn / Đã nhớ
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
        ? "✓ Đã đánh dấu: Đã nhớ (Ôn ngắt quãng sau 3-7 ngày)"
        : status === "REVIEW_NEEDED"
        ? "⏳ Đã đánh dấu: Cần ôn (Nhắc lại vào ngày mai)"
        : "✖ Đã đánh dấu: Chưa nhớ (Lưu vào kiến thức cần luyện gấp)";

    setRatingFeedback(msg);
    setTimeout(() => setRatingFeedback(null), 2200);

    // Chuyển sang từ tiếp theo
    if (filteredVocabList.length > 1) {
      setTimeout(() => {
        handleNextWord();
      }, 400);
    }
  };

  const handleNextWord = () => {
    setCurrentIndex((prev) => (prev < filteredVocabList.length - 1 ? prev + 1 : 0));
  };

  const handlePrevWord = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredVocabList.length - 1));
  };

  // Dữ liệu mở rộng động
  const etymologyInfo = useMemo(() => {
    return getEtymology(currentVocab?.hanzi || "", targetMeaning);
  }, [currentVocab, targetMeaning]);

  const relatedWords = useMemo(() => {
    return getRelatedWords(currentVocab?.hanzi || "", vocabList);
  }, [currentVocab, vocabList]);

  const exampleList = useMemo(() => {
    return getExamplesForVocab(currentVocab);
  }, [currentVocab]);

  // Chuẩn bị options cho các bài tập trắc nghiệm & điền từ
  const meaningOptions = useMemo(() => {
    if (!currentVocab || vocabList.length < 2) return [];
    const correct = targetMeaning;
    const others = vocabList
      .filter((v) => (v.meaningVi || v.meaning) !== correct)
      .map((v) => v.meaningVi || v.meaning);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    return [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());
  }, [currentVocab, vocabList, targetMeaning]);

  const fillBlankOptions = useMemo(() => {
    if (!currentVocab || vocabList.length < 2) return [];
    const correct = currentVocab.hanzi;
    const others = vocabList.filter((v) => v.hanzi !== correct).map((v) => v.hanzi);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    return [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());
  }, [currentVocab, vocabList]);

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

  // Sắp xếp câu
  useEffect(() => {
    if (subType === "sentence_order" && currentVocab) {
      const sentence = currentVocab.exampleZh || `${currentVocab.hanzi}很好。`;
      const punctuation = ["，", "。", "！", "？", "、"];
      const chunks: string[] = [];
      let temp = "";
      for (const char of sentence) {
        if (punctuation.includes(char)) {
          if (temp) chunks.push(temp);
          chunks.push(char);
          temp = "";
        } else {
          temp += char;
        }
      }
      if (temp) chunks.push(temp);

      const tokens: string[] = [];
      for (const chunk of chunks) {
        if (punctuation.includes(chunk)) {
          tokens.push(chunk);
        } else if (chunk === currentVocab.hanzi) {
          tokens.push(chunk);
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

      setAvailableTokens([...mappedTokens].sort(() => 0.5 - Math.random()));
      setAssembledTokens([]);
      setOrderResult(null);
    }
  }, [subType, currentVocab]);

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

  if (!vocabList || vocabList.length === 0) {
    return (
      <div className="py-12 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#E5DEC9]">
        <p className="text-xs text-[#315E48]">Bài học này chưa có danh sách từ vựng.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. BANNER TIÊU ĐỀ BÀI LUYỆN TỪ VỰNG KÈM TRANH THỦY MẶC Á ĐÔNG      */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FAF7F0] via-[#F4EFE6] to-[#EAE3D2] border border-[#E5DEC9] p-6 shadow-2xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Bên trái: Icon & Tiêu đề */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F3EE] text-[#17382F] border border-[#BC9B6B]/40 flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-7 h-7 text-[#204434]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#17382F] flex items-center gap-2.5">
                <span>Luyện từ vựng</span>
                <span className="text-xl sm:text-2xl font-serif text-[#8F6D3B]">词汇训练</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#315E48] mt-1 font-medium">
                Nhìn – Nghe – Nhớ – Dùng từ | Ghi nhớ lâu với nhiều dạng bài luyện tập
              </p>
            </div>
          </div>

          {/* Bên phải: Card châm ngôn văn hóa */}
          <div className="p-3.5 px-5 rounded-2xl bg-white/80 backdrop-blur-xs border border-[#E5DEC9] shadow-2xs max-w-xs text-right hidden sm:block">
            <p className="font-serif font-bold text-sm text-[#204434] tracking-wide">
              “积少成多，学无止境。”
            </p>
            <p className="text-[11px] text-[#8F6D3B] mt-0.5">
              Tích tiểu thành đa, học không có giới hạn.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. THANH THỐNG KÊ TIẾN ĐỘ GHI NHỚ (5 THẺ THỐNG KÊ)                  */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Thẻ 1: Tổng số từ trong bài */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F3EE] text-[#204434] flex items-center justify-center shrink-0">
            <BookA className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-[#204434]">
              {totalInLesson} / {totalInLesson}
            </div>
            <p className="text-[10px] text-[#6B766D] font-medium truncate max-w-[120px]">
              Từ vựng trong bài
            </p>
            <p className="text-[9px] text-[#8F6D3B] truncate max-w-[120px]">
              Bài {String(lessonNumber).padStart(2, "0")}: {lessonTitleZh}
            </p>
          </div>
        </div>

        {/* Thẻ 2: Đã nhớ (%) kèm Donut Chart */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-600 bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0">
            {countsInLesson.mastered}/{totalInLesson}
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-emerald-800">
              {masteryPercentage}%
            </div>
            <p className="text-[10px] text-emerald-900/80 font-bold">
              Đã nhớ
            </p>
          </div>
        </div>

        {/* Thẻ 3: Cần ôn */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <MinusCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-amber-800">
              {countsInLesson.review}
            </div>
            <p className="text-[10px] text-amber-900/80 font-bold">
              Cần ôn
            </p>
          </div>
        </div>

        {/* Thẻ 4: Chưa nhớ */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-rose-800">
              {countsInLesson.notRemembered}
            </div>
            <p className="text-[10px] text-rose-900/80 font-bold">
              Chưa nhớ
            </p>
          </div>
        </div>

        {/* Thẻ 5: Thời gian luyện tập hôm nay */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#204434] flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5 text-[#8F6D3B]" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-[#204434]">
              {formatStudyTimeVi(todayStudySec)}
            </div>
            <p className="text-[10px] text-[#6B766D] font-medium">
              Thời gian luyện Hôm nay
            </p>
            <p className="text-[9px] text-[#8F6D3B] truncate" title={`Tuần này: ${formatStudyTimeVi(weeklyStudySec)}`}>
              Tuần này: {formatStudyTimeVi(weeklyStudySec)}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. THANH CHỌN CHẾ ĐỘ LUYỆN TẬP (7 CHẾ ĐỘ)                          */}
      {/* =================================================================== */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[#204434]">
          Chọn chế độ luyện tập (6-7 chế độ)
        </h4>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setSubType("flashcard")}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              subType === "flashcard"
                ? "bg-[#17382F] text-white shadow-xs"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Thẻ Flashcard</span>
          </button>

          <button
            onClick={() => setSubType("listen_meaning")}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              subType === "listen_meaning"
                ? "bg-[#17382F] text-white shadow-xs"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>2. Nghe chọn nghĩa</span>
          </button>

          <button
            onClick={() => setSubType("listen_fill")}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              subType === "listen_fill"
                ? "bg-[#17382F] text-white shadow-xs"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>3. Nghe điền từ</span>
          </button>

          <button
            onClick={() => setSubType("quiz_meaning")}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              subType === "quiz_meaning"
                ? "bg-[#17382F] text-white shadow-xs"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>4. Chọn nghĩa đúng</span>
          </button>

          <button
            onClick={() => setSubType("quiz_fill_blank")}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              subType === "quiz_fill_blank"
                ? "bg-[#17382F] text-white shadow-xs"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>5. Điền từ vào câu</span>
          </button>

          <button
            onClick={() => setSubType("sentence_order")}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              subType === "sentence_order"
                ? "bg-[#17382F] text-white shadow-xs"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>6. Sắp xếp câu</span>
          </button>

          <button
            onClick={() => setSubType("type_meaning")}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              subType === "type_meaning"
                ? "bg-[#17382F] text-white shadow-xs"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
            <span>7. Nhìn Hán tự viết nghĩa</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. GIAO DIỆN CHÍNH KHI Ở CHẾ ĐỘ 1: THẺ FLASHCARD (SPLIT VIEW 2 CỘT) */}
      {/* =================================================================== */}
      {subType === "flashcard" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* =============================================================== */}
          {/* CỘT TRÁI (4 COLS): BẢNG DANH SÁCH TỪ VỰNG TRONG BÀI             */}
          {/* =============================================================== */}
          <div className="lg:col-span-5 xl:col-span-5 bg-white border border-[#E5DEC9] rounded-3xl p-4 shadow-sm space-y-3.5">
            {/* Header Danh sách từ & Sắp xếp */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif font-bold text-sm text-[#204434]">
                Danh sách từ vựng ({filteredVocabList.length}/{totalInLesson})
              </h3>
              <select
                value={sortOrder}
                onChange={(e: any) => setSortOrder(e.target.value)}
                className="text-[11px] font-semibold text-[#204434] bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-2.5 py-1 focus:outline-hidden cursor-pointer"
              >
                <option value="DEFAULT">Theo thứ tự bài học</option>
                <option value="NOT_REMEMBERED">Ưu tiên từ Chưa nhớ</option>
                <option value="REVIEW_NEEDED">Ưu tiên từ Cần ôn</option>
                <option value="PINYIN">Theo Pinyin A-Z</option>
              </select>
            </div>

            {/* Ô Tìm Kiếm Từ Vựng & Nút Lọc Phễu */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F6D3B]" />
                <input
                  type="text"
                  placeholder="Tìm từ vựng (Hán tự, Pinyin hoặc nghĩa)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentIndex(0);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] text-xs text-[#204434] placeholder-[#6B766D] focus:outline-hidden focus:border-[#204434]"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  // Toggle tuần tự status filter
                  if (statusFilter === "ALL") setStatusFilter("NOT_REMEMBERED");
                  else if (statusFilter === "NOT_REMEMBERED") setStatusFilter("REVIEW_NEEDED");
                  else if (statusFilter === "REVIEW_NEEDED") setStatusFilter("MASTERED");
                  else setStatusFilter("ALL");
                  setCurrentIndex(0);
                }}
                className={`p-2 rounded-xl border transition cursor-pointer text-xs ${
                  statusFilter !== "ALL"
                    ? "bg-[#204434] text-white border-[#204434]"
                    : "bg-[#FAF7F0] border-[#E5DEC9] text-[#204434] hover:bg-white"
                }`}
                title={`Bộ lọc hiện tại: ${statusFilter}`}
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bảng Danh Sách Từ Vựng */}
            <div className="overflow-x-auto max-h-[560px] overflow-y-auto pr-0.5 rounded-2xl border border-[#E5DEC9]/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF7F0] text-[#315E48] font-bold sticky top-0 z-10 border-b border-[#E5DEC9]">
                  <tr>
                    <th className="py-2.5 px-2.5 text-center w-8">#</th>
                    <th className="py-2.5 px-3">Từ vựng</th>
                    <th className="py-2.5 px-3">Pinyin</th>
                    <th className="py-2.5 px-3">Nghĩa</th>
                    <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DEC9]/60">
                  {filteredVocabList.map((item: any, idx: number) => {
                    const isSelected = item.hanzi === currentVocab?.hanzi;
                    const st = memoryMap.get(item.hanzi);

                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setShowCardMeaning(false);
                        }}
                        className={`transition cursor-pointer ${
                          isSelected
                            ? "bg-[#E8F3EE] font-bold text-[#17382F]"
                            : "hover:bg-[#FAF7F0] text-[#204434]"
                        }`}
                      >
                        <td className="py-2 px-2 text-center text-[#8F6D3B] text-[11px] font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-serif font-bold text-base text-[#17382F]">
                          {item.hanzi}
                        </td>
                        <td className="py-2 px-3 text-xs text-[#8F6D3B] font-mono">
                          {item.pinyin}
                        </td>
                        <td className="py-2 px-3 text-xs truncate max-w-[110px]" title={item.meaningVi || item.meaning}>
                          {item.meaningVi || item.meaning}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {st === "MASTERED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Check className="w-2.5 h-2.5" />
                              <span>Đã nhớ</span>
                            </span>
                          ) : st === "REVIEW_NEEDED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <MinusCircle className="w-2.5 h-2.5" />
                              <span>Cần ôn</span>
                            </span>
                          ) : st === "NOT_REMEMBERED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <XCircle className="w-2.5 h-2.5" />
                              <span>Chưa nhớ</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                              <span>Chưa học</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* =============================================================== */}
          {/* CỘT PHẢI (7 COLS): THẺ FLASHCARD & THÔNG TIN CHI TIẾT TỪ VỰNG  */}
          {/* =============================================================== */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-4">
            {/* Header thông tin vị trí từ */}
            <div className="flex items-center justify-between text-xs text-[#315E48] px-1">
              <span className="font-serif font-bold text-[#8F6D3B]">
                Bài {String(lessonNumber).padStart(2, "0")} · {lessonTitleZh}
              </span>
              <span className="font-mono font-bold">
                Từ vựng {currentIndex + 1}/{filteredVocabList.length}
              </span>
            </div>

            {/* 1. THẺ FLASHCARD LỚN PHONG CÁCH THƯ HỌA Á ĐÔNG */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#FFFFFF] to-[#FAF7F0] border-2 border-[#E5DEC9] shadow-md p-8 sm:p-12 text-center min-h-[250px] flex flex-col items-center justify-center space-y-3 group transition-all">
              {/* Nút Star Favorite góc trên trái */}
              <button
                type="button"
                onClick={toggleFavorite}
                className="absolute top-4 left-4 p-2 rounded-xl text-amber-500 hover:scale-110 transition cursor-pointer"
                title={isCurrentFavorite ? "Bỏ đánh dấu từ yêu thích" : "Đánh dấu từ yêu thích"}
              >
                <Star
                  className={`w-5 h-5 ${
                    isCurrentFavorite ? "fill-amber-400 text-amber-500" : "text-[#BC9B6B]"
                  }`}
                />
              </button>

              {/* Mũi tên trái */}
              <button
                type="button"
                onClick={handlePrevWord}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 border border-[#E5DEC9] text-[#204434] hover:bg-white shadow-xs hover:scale-110 transition cursor-pointer"
                title="Từ trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Mũi tên phải */}
              <button
                type="button"
                onClick={handleNextWord}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 border border-[#E5DEC9] text-[#204434] hover:bg-white shadow-xs hover:scale-110 transition cursor-pointer"
                title="Từ kế tiếp"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Chữ Hán Khổng Lồ */}
              <div
                onClick={() => setShowCardMeaning(!showCardMeaning)}
                className="font-serif font-bold text-5xl sm:text-6xl text-[#17382F] tracking-wide cursor-pointer select-none group-hover:scale-105 transition-transform"
              >
                {currentVocab.hanzi}
              </div>

              {/* Pinyin kèm nút Loa nhỏ */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-xl sm:text-2xl font-mono font-bold text-[#8F6D3B]">
                  {currentVocab.pinyin}
                </span>
                <button
                  type="button"
                  onClick={() => handleSpeak(currentVocab.hanzi)}
                  className="p-1 rounded-full text-[#8F6D3B] hover:text-[#204434] hover:scale-110 transition cursor-pointer"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Nghĩa Tiếng Việt */}
              {showCardMeaning ? (
                <div className="text-lg sm:text-xl font-bold text-[#204434] pt-1 animate-fadeIn">
                  {targetMeaning}
                </div>
              ) : (
                <div
                  onClick={() => setShowCardMeaning(true)}
                  className="text-xs text-[#6B766D] italic pt-1 cursor-pointer hover:text-[#204434]"
                >
                  (Chạm để hiển thị nghĩa tiếng Việt)
                </div>
              )}
            </div>

            {/* Hàng Nút Điều Khiển Thẻ Flashcard */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleSpeak(currentVocab.hanzi)}
                className="p-3 rounded-2xl bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] shadow-2xs transition cursor-pointer"
                title="Phát âm chữ này"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handlePrevWord}
                className="px-5 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] text-xs font-bold text-[#204434] hover:bg-[#FAF7F0] shadow-2xs transition cursor-pointer"
              >
                Từ trước
              </button>
              <button
                type="button"
                onClick={() => setShowCardMeaning(!showCardMeaning)}
                className="px-6 py-2.5 rounded-2xl bg-[#A58656] hover:bg-[#8F6D3B] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                {showCardMeaning ? "Ẩn đáp án" : "Lật thẻ xem nghĩa"}
              </button>
              <button
                type="button"
                onClick={handleNextWord}
                className="px-6 py-2.5 rounded-2xl bg-[#17382F] hover:bg-[#0f241e] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                Từ kế tiếp
              </button>
            </div>

            {/* Thông báo Feedback khi đánh giá nhớ */}
            {ratingFeedback && (
              <div className="text-xs py-2 px-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B] text-[#204434] font-bold text-center animate-bounce shadow-2xs">
                {ratingFeedback}
              </div>
            )}

            {/* 2. HÀNG BỔ TRỢ 1: VÍ DỤ CÂU (BÊN TRÁI) & TRẠNG THÁI + GHI CHÚ (BÊN PHẢI) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Cột trái: Ví dụ câu */}
              <div className="p-4 rounded-3xl bg-white border border-[#E5DEC9] shadow-2xs space-y-2.5">
                <span className="text-xs font-bold text-[#204434] block">
                  Ví dụ câu
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {exampleList.map((ex, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9]/80 flex items-start gap-2 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => handleSpeak(ex.zh)}
                        className="p-1 rounded-full text-[#8F6D3B] hover:text-[#204434] shrink-0 mt-0.5 cursor-pointer"
                        title="Nghe câu này"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="space-y-0.5">
                        <p className="font-serif font-bold text-[#17382F]">{ex.zh}</p>
                        <p className="text-[11px] text-[#8F6D3B] font-mono">{ex.pinyin}</p>
                        <p className="text-[11px] text-[#315E48]">{ex.vi}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cột phải: Trạng thái từ này & Ghi chú cá nhân */}
              <div className="p-4 rounded-3xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#204434] block mb-2">
                    Trạng thái từ này
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRateMemory("MASTERED")}
                      className={`py-2 px-2 rounded-2xl border text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        currentMemoryStatus === "MASTERED"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>Đã nhớ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRateMemory("REVIEW_NEEDED")}
                      className={`py-2 px-2 rounded-2xl border text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        currentMemoryStatus === "REVIEW_NEEDED"
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                          : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      <MinusCircle className="w-3 h-3" />
                      <span>Cần ôn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRateMemory("NOT_REMEMBERED")}
                      className={`py-2 px-2 rounded-2xl border text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        currentMemoryStatus === "NOT_REMEMBERED"
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                      }`}
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Chưa nhớ</span>
                    </button>
                  </div>
                </div>

                {/* Ghi chú cá nhân */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#315E48]">Ghi chú cá nhân</span>
                    <Edit3 className="w-3 h-3 text-[#8F6D3B]" />
                  </div>
                  <input
                    type="text"
                    value={currentNote}
                    onChange={(e) => handleSaveNote(e.target.value)}
                    placeholder="Viết ghi chú của bạn cho từ này..."
                    className="w-full p-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] text-xs text-[#204434] focus:outline-hidden focus:border-[#204434]"
                  />
                </div>
              </div>
            </div>

            {/* 3. HÀNG BỔ TRỢ 2: 3 KHỐI ĐÁY (MẸO GHI NHỚ / TỪ LIÊN QUAN / HÌNH MINH HỌA) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              {/* Khối 1: Mẹo ghi nhớ */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-1.5">
                <span className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mẹo ghi nhớ</span>
                </span>
                <p className="text-[11px] font-bold text-[#8F6D3B]">
                  {etymologyInfo.radicals}
                </p>
                <p className="text-[11px] text-[#315E48] leading-relaxed line-clamp-3">
                  {etymologyInfo.memo}
                </p>
              </div>

              {/* Khối 2: Từ liên quan */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-1.5">
                <span className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-[#8F6D3B]" />
                  <span>Từ liên quan</span>
                </span>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {relatedWords.map((rw, i) => (
                    <div
                      key={i}
                      onClick={() => handleSpeak(rw.hanzi)}
                      className="flex items-center justify-between text-[11px] p-1 rounded-lg hover:bg-[#FAF7F0] cursor-pointer"
                      title="Bấm để nghe phát âm"
                    >
                      <span className="font-serif font-bold text-[#204434]">
                        {rw.hanzi}
                      </span>
                      <span className="text-[10px] text-[#8F6D3B] font-mono">
                        {rw.pinyin}
                      </span>
                      <span className="text-[10px] text-[#6B766D] truncate max-w-[70px]">
                        {rw.meaningVi}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Khối 3: Hình ảnh minh họa */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-1.5 flex flex-col justify-between text-center">
                <span className="text-xs font-bold text-[#204434] flex items-center justify-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#315E48]" />
                  <span>Hình ảnh minh họa</span>
                </span>
                <div className="w-full h-16 rounded-xl bg-[#FAF7F0] border border-dashed border-[#E5DEC9] flex items-center justify-center">
                  <span className="font-serif font-bold text-2xl text-[#204434]/70">
                    {currentVocab.hanzi}！
                  </span>
                </div>
                <p className="text-[10px] text-[#8F6D3B] italic">
                  Hình ảnh trực quan ngữ cảnh
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =================================================================== */
        /* CÁC CHẾ ĐỘ LUYỆN TẬP TỪ VỰNG CÒN LẠI (2, 3, 4, 5, 6, 7)             */
        /* =================================================================== */
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DEC9] shadow-sm flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto">
          {/* Header câu hỏi */}
          <div className="flex items-center justify-between w-full text-xs text-[#315E48] pb-3 border-b border-[#E5DEC9]/60">
            <span className="font-mono font-bold text-[#8F6D3B]">
              Bài {String(lessonNumber).padStart(2, "0")} · {lessonTitleZh}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#204434]">
                Từ vựng <strong>{currentIndex + 1}</strong> / {filteredVocabList.length}
              </span>
              <span className="text-xs font-bold text-[#8F6D3B]">
                {score} XP
              </span>
            </div>
          </div>

          {/* CHẾ ĐỘ 2: NGHE CHỌN NGHĨA */}
          {subType === "listen_meaning" && (
            <div className="w-full space-y-5 animate-fadeIn">
              <p className="text-xs font-bold text-[#315E48]">
                Bấm vào loa để nghe phát âm, sau đó chọn nghĩa tiếng Việt chính xác:
              </p>
              <button
                type="button"
                onClick={() => handleSpeak(currentVocab.hanzi)}
                className="w-20 h-20 mx-auto rounded-3xl bg-[#FAF7F0] border-2 border-[#BC9B6B] hover:scale-105 hover:bg-[#204434] hover:text-white text-[#204434] transition shadow-md flex items-center justify-center cursor-pointer group"
              >
                <Volume2 className="w-8 h-8 group-hover:animate-pulse" />
              </button>

              {isAnswered && (
                <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9]">
                  <span className="font-serif font-bold text-2xl text-[#204434] mr-2">
                    {currentVocab.hanzi}
                  </span>
                  <span className="font-mono text-sm font-bold text-[#8F6D3B]">
                    ({currentVocab.pinyin})
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-semibold">
                {meaningOptions.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === targetMeaning;
                  let style = "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]";
                  if (isAnswered) {
                    if (isCorrect) style = "bg-emerald-50 text-emerald-800 border-emerald-500 font-bold";
                    else if (isSelected) style = "bg-rose-50 text-rose-800 border-rose-500 font-bold";
                    else style = "bg-gray-50 border-gray-200 text-gray-400";
                  }
                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleOptionClick(opt, targetMeaning)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer text-center ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextWord}
                    className="px-6 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#163024] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Từ tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CHẾ ĐỘ 3: NGHE ĐIỀN TỪ */}
          {subType === "listen_fill" && (
            <div className="w-full space-y-5 animate-fadeIn">
              <p className="text-xs font-bold text-[#315E48]">
                Bấm loa nghe phát âm và gõ lại chữ Hán hoặc Pinyin chuẩn xác:
              </p>
              <button
                type="button"
                onClick={() => handleSpeak(currentVocab.hanzi)}
                className="w-16 h-16 mx-auto rounded-3xl bg-[#FAF7F0] border border-[#BC9B6B] text-[#204434] hover:bg-[#204434] hover:text-white transition flex items-center justify-center cursor-pointer shadow-xs"
              >
                <Volume2 className="w-6 h-6" />
              </button>

              <div className="max-w-md mx-auto space-y-3">
                <input
                  type="text"
                  placeholder="Gõ Hán tự hoặc Pinyin..."
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCheckTyped()}
                  className="w-full p-3.5 rounded-2xl border border-[#E5DEC9] bg-[#FAF7F0] text-center font-bold text-base text-[#204434] focus:outline-hidden focus:border-[#204434]"
                />
                <button
                  type="button"
                  onClick={handleCheckTyped}
                  className="w-full py-2.5 rounded-2xl bg-[#204434] text-white text-xs font-bold hover:bg-[#163024] transition cursor-pointer shadow-xs"
                >
                  Kiểm tra kết quả
                </button>
              </div>

              {typedResult && (
                <div className={`p-4 rounded-2xl border text-xs font-semibold ${
                  typedResult === "CORRECT" ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-rose-50 text-rose-800 border-rose-300"
                }`}>
                  {typedResult === "CORRECT" ? "🎉 Chính xác tuyệt đối!" : `Chưa đúng! Đáp án: ${currentVocab.hanzi} (${currentVocab.pinyin})`}
                </div>
              )}

              {typedResult && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextWord}
                    className="px-6 py-2.5 rounded-2xl bg-[#204434] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Từ tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CHẾ ĐỘ 4: CHỌN NGHĨA ĐÚNG */}
          {subType === "quiz_meaning" && (
            <div className="w-full space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <div className="font-serif font-bold text-5xl text-[#204434]">
                  {currentVocab.hanzi}
                </div>
                <div className="text-sm font-mono font-bold text-[#8F6D3B]">
                  {currentVocab.pinyin}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-semibold">
                {meaningOptions.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === targetMeaning;
                  let style = "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]";
                  if (isAnswered) {
                    if (isCorrect) style = "bg-emerald-50 text-emerald-800 border-emerald-500 font-bold";
                    else if (isSelected) style = "bg-rose-50 text-rose-800 border-rose-500 font-bold";
                    else style = "bg-gray-50 border-gray-200 text-gray-400";
                  }
                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleOptionClick(opt, targetMeaning)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer text-center ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextWord}
                    className="px-6 py-2.5 rounded-2xl bg-[#204434] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Từ tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CHẾ ĐỘ 5: ĐIỀN TỪ VÀO CÂU */}
          {subType === "quiz_fill_blank" && (
            <div className="w-full space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-2">
                <p className="font-serif font-bold text-xl text-[#204434]">
                  {fillBlankSentence.blankSentence}
                </p>
                <p className="text-xs text-[#315E48] italic">
                  {fillBlankSentence.meaning}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-bold">
                {fillBlankOptions.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentVocab.hanzi;
                  let style = "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]";
                  if (isAnswered) {
                    if (isCorrect) style = "bg-emerald-600 text-white border-emerald-600";
                    else if (isSelected) style = "bg-rose-500 text-white border-rose-500";
                    else style = "bg-gray-50 border-gray-200 text-gray-400";
                  }
                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleOptionClick(opt, currentVocab.hanzi)}
                      className={`p-3 rounded-2xl border transition cursor-pointer text-center font-serif text-base ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextWord}
                    className="px-6 py-2.5 rounded-2xl bg-[#204434] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Từ tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CHẾ ĐỘ 6: SẮP XẾP CÂU */}
          {subType === "sentence_order" && (
            <div className="w-full space-y-5 animate-fadeIn">
              <p className="text-xs font-bold text-[#315E48]">
                Bấm vào các từ bên dưới để sắp xếp thành câu hoàn chỉnh có chứa từ vựng "{currentVocab.hanzi}":
              </p>

              <div className="min-h-[60px] p-4 rounded-2xl bg-[#FAF7F0] border-2 border-dashed border-[#BC9B6B] flex flex-wrap gap-2 items-center justify-center">
                {assembledTokens.map((tok, i) => (
                  <button
                    key={i}
                    onClick={() => handleRemoveToken(i)}
                    className="px-3 py-1.5 rounded-xl bg-[#204434] text-white text-sm font-serif font-bold shadow-xs cursor-pointer hover:bg-rose-700 transition"
                  >
                    {tok}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {availableTokens.map((tok) => (
                  <button
                    key={tok.id}
                    onClick={() => handlePickToken(tok)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-sm font-serif font-bold shadow-2xs hover:bg-[#FAF7F0] cursor-pointer transition"
                  >
                    {tok.text}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCheckSentenceOrder}
                className="px-6 py-2.5 rounded-2xl bg-[#204434] text-white text-xs font-bold hover:bg-[#163024] transition cursor-pointer shadow-xs"
              >
                Kiểm tra câu
              </button>

              {orderResult && (
                <div className={`p-3 rounded-2xl border text-xs font-bold ${
                  orderResult === "CORRECT" ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-rose-50 text-rose-800 border-rose-300"
                }`}>
                  {orderResult === "CORRECT" ? "🎉 Sắp xếp câu hoàn toàn chính xác!" : "Chưa chính xác, hãy thử đổi vị trí các từ nhé!"}
                </div>
              )}

              {orderResult === "CORRECT" && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextWord}
                    className="px-6 py-2.5 rounded-2xl bg-[#204434] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Từ tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CHẾ ĐỘ 7: NHÌN HÁN TỰ VIẾT NGHĨA */}
          {subType === "type_meaning" && (
            <div className="w-full space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <div className="font-serif font-bold text-5xl text-[#204434]">
                  {currentVocab.hanzi}
                </div>
                <div className="text-sm font-mono font-bold text-[#8F6D3B]">
                  {currentVocab.pinyin}
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-3">
                <input
                  type="text"
                  placeholder="Gõ nghĩa tiếng Việt của từ này..."
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCheckTyped()}
                  className="w-full p-3.5 rounded-2xl border border-[#E5DEC9] bg-[#FAF7F0] text-center font-bold text-base text-[#204434] focus:outline-hidden focus:border-[#204434]"
                />
                <button
                  type="button"
                  onClick={handleCheckTyped}
                  className="w-full py-2.5 rounded-2xl bg-[#204434] text-white text-xs font-bold hover:bg-[#163024] transition cursor-pointer shadow-xs"
                >
                  Kiểm tra nghĩa
                </button>
              </div>

              {typedResult && (
                <div className={`p-4 rounded-2xl border text-xs font-semibold ${
                  typedResult === "CORRECT" ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-rose-50 text-rose-800 border-rose-300"
                }`}>
                  {typedResult === "CORRECT" ? "🎉 Bạn đã nhớ nghĩa rất chính xác!" : `Chưa đúng! Nghĩa của từ là: "${targetMeaning}"`}
                </div>
              )}

              {typedResult && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextWord}
                    className="px-6 py-2.5 rounded-2xl bg-[#204434] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Từ tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
