"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  recordStudyTime,
  getTodayStudySeconds,
  getWeeklyStudySeconds,
  formatStudyTimeVi,
  formatTimerMMSS,
} from "@/lib/memory-review-service";
import {
  GraduationCap,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Check,
  FileQuestion,
  Sparkles,
  HelpCircle,
  Shuffle,
  Headphones,
  Edit3,
  Award,
  ChevronDown,
  ChevronUp,
  Play,
  Square,
  VolumeX,
  BookOpen,
  MinusCircle,
  ShieldAlert,
  BarChart2,
  Search,
  Filter,
  Lightbulb,
  Clock,
  Target,
  BookMarked,
  BookmarkCheck,
  Eye,
  CheckCircle,
} from "lucide-react";
import {
  normalizeGrammarList,
  NormalizedGrammarPoint,
} from "@/lib/chinese-grammar-helper";
import {
  saveGrammarItem,
  isGrammarSaved,
  saveQuestionItem,
  isQuestionSaved,
} from "@/lib/saved-knowledge-service";

export type GrammarExerciseMode =
  | "choose_correct" // 1. Chọn câu đúng ngữ pháp (10 câu)
  | "listen_dialogue" // 2. Nghe hiểu hội thoại ngắn (10 câu)
  | "fill_blank" // 3. Điền từ vào chỗ trống (10 câu)
  | "reorder" // 4. Sắp xếp từ thành câu (10 câu)
  | "correct_mistake"; // 5. Sửa câu sai thành đúng (10 câu)

export interface GrammarExerciseItem {
  id: string;
  mode: GrammarExerciseMode;
  grammarRule: string;
  prompt: string;
  meaningVi?: string;
  audioUrl?: string;
  options?: string[];
  correctAnswer: string;
  dialogueLines?: { speaker: string; zh: string; pinyin: string; vi: string }[];
  audioText?: string;
  sentence?: string;
  pinyin?: string;
  scrambledWords?: string[];
  wrongSentence?: string;
  wrongSentencePinyin?: string;
  explanation: string;
}

// Hàm chuẩn hóa chuỗi phục vụ so sánh câu ghép xáo trộn chính xác tuyệt đối
function normalizeForComparison(str: string): string {
  if (!str) return "";
  return str
    // Loại bỏ phần pinyin hoặc tiếng Việt trong ngoặc đơn nếu có (vd: (Wǒ míngtiān qù) hoặc (Tôi ngày mai đi))
    .replace(/\s*[(（\[][^()（）\[\]]*?[)）\]]\s*/g, "")
    // Loại bỏ toàn bộ khoảng trắng
    .replace(/[\s\u3000\u00A0]+/g, "")
    // Chuẩn hóa dấu câu tiếng Trung và tiếng Anh
    .replace(/[！!]/g, "!")
    .replace(/[？?]/g, "?")
    .replace(/[，,、]/g, ",")
    .replace(/[。.：:;；—~\-_"“”'‘’]/g, "")
    .toLowerCase()
    .trim();
}

// Trích xuất chỉ các ký tự chữ Hán để so sánh thứ tự từ chuẩn xác nhất
function extractHanziOnly(str: string): string {
  if (!str) return "";
  // Loại bỏ phần dịch hoặc pinyin trong ngoặc trước
  const clean = str.replace(/\s*[(（\[][^()（）\[\]]*?[)）\]]\s*/g, "");
  const matches = clean.match(/[\p{Script=Han}]+/gu);
  return matches ? matches.join("") : "";
}

interface GrammarPracticeSuiteProps {
  customExercises?: GrammarExerciseItem[];
  grammarList: any[];
  vocabList?: any[];
  dialogueList?: any[];
  lessonTitleZh?: string;
  lessonNumber?: number;
  hskLevel?: number;
  studentId?: string;
  handleSpeak: (text: string) => void;
}

// =========================================================================
// HÀM SINH BÀI TẬP ĐỘNG: 10 CÂU MỖI DẠNG DỰA TRÊN NGỮ PHÁP BÀI HỌC
// =========================================================================
function generateLessonGrammarExercises(
  normalizedGrammars: NormalizedGrammarPoint[],
  vocabList: any[],
  dialogueList: any[],
  hskLevel: number,
  lessonNumber: number
): GrammarExerciseItem[] {
  // Đã xóa toàn bộ câu hỏi mock theo yêu cầu người dùng.
  // Hệ thống chỉ hiển thị câu hỏi thực tế do Admin tạo/nhập cho bài học.
  return [];
}

export default function GrammarPracticeSuite({
  customExercises,
  grammarList,
  vocabList = [],
  dialogueList = [],
  lessonTitleZh = "Bài học HSK",
  lessonNumber = 1,
  hskLevel = 1,
  studentId = "guest",
  handleSpeak,
}: GrammarPracticeSuiteProps) {
  // Thời gian học thực tế hôm nay & trong tuần (ĐỘNG 100%)
  const [isMounted, setIsMounted] = useState(false);
  const [todayStudySec, setTodayStudySec] = useState(0);
  const [weeklyStudySec, setWeeklyStudySec] = useState(0);

  // State Quản lý Trạng thái Ngữ pháp do Học sinh tự đánh dấu (Lưu LocalStorage theo User)
  const [, setSavedTick] = useState(0);
  const [userGrammarStatuses, setUserGrammarStatuses] = useState<Record<string, "MASTERED" | "REVIEW_NEEDED" | "NOT_LEARNED">>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`hanyu_grammar_status_${studentId || "default"}`);
        if (stored) {
          setUserGrammarStatuses(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("load grammar status error", e);
      }
    }
  }, [studentId]);

  const handleToggleGrammarStatus = (grammarId: string, currentStatus: "MASTERED" | "REVIEW_NEEDED" | "NOT_LEARNED", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextStatusMap: Record<string, "MASTERED" | "REVIEW_NEEDED" | "NOT_LEARNED"> = {
      NOT_LEARNED: "REVIEW_NEEDED",
      REVIEW_NEEDED: "MASTERED",
      MASTERED: "NOT_LEARNED",
    };
    const nextStatus = nextStatusMap[currentStatus] || "REVIEW_NEEDED";

    setUserGrammarStatuses((prev) => {
      const next = { ...prev, [grammarId]: nextStatus };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`hanyu_grammar_status_${studentId || "default"}`, JSON.stringify(next));
        } catch (err) {}
      }
      return next;
    });
  };

  useEffect(() => {
    setIsMounted(true);
    setTodayStudySec(getTodayStudySeconds(studentId));
    setWeeklyStudySec(getWeeklyStudySeconds(studentId));

    const timer = setInterval(() => {
      recordStudyTime(3, studentId);
      setTodayStudySec(getTodayStudySeconds(studentId));
      setWeeklyStudySec(getWeeklyStudySeconds(studentId));
    }, 3000);
    return () => clearInterval(timer);
  }, [studentId]);

  // Chuẩn hóa danh sách cấu trúc ngữ pháp động kèm trạng thái thực của học sinh
  const normalizedGrammars: NormalizedGrammarPoint[] = useMemo(() => {
    const list = normalizeGrammarList(grammarList, lessonNumber);
    return list.map((g) => ({
      ...g,
      status: userGrammarStatuses[g.id] || g.status,
    }));
  }, [grammarList, lessonNumber, userGrammarStatuses]);

  // Vị trí cấu trúc ngữ pháp đang chọn bên cột trái
  const [selectedGrammarIdx, setSelectedGrammarIdx] = useState(0);

  // Chế độ bài tập đang chọn (5 dạng)
  const [activeExerciseMode, setActiveExerciseMode] =
    useState<GrammarExerciseMode>("choose_correct");

  // Vị trí câu hỏi hiện tại trong 10 câu
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // State trả lời trắc nghiệm
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // State sắp xếp câu
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [assembledTokens, setAssembledTokens] = useState<string[]>([]);
  const [orderChecked, setOrderChecked] = useState(false);
  const [orderCorrect, setOrderCorrect] = useState(false);

  // State tìm kiếm & sắp xếp cột trái
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"DEFAULT" | "STATUS">("DEFAULT");

  // State các tab con bên cột phải (Nội dung ngữ pháp hiện tại)
  const [subTabRight, setSubTabRight] = useState<"GIẢI THÍCH" | "CẤU TRÚC" | "VÍ DỤ" | "LƯU Ý">("GIẢI THÍCH");

  // State các tab con ở Vùng 6 (Giải thích mở rộng đáy)
  const [subTabBottom, setSubTabBottom] = useState<"TÓM TẮT" | "CÁCH DÙNG" | "VÍ DỤ" | "LƯU Ý" | "LỖI THƯỜNG GẶP">("TÓM TẮT");

  // Điểm số & Số câu đúng
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Điểm ngữ pháp hiện tại
  const currentGrammar = normalizedGrammars[selectedGrammarIdx] || normalizedGrammars[0];

  // Ưu tiên câu hỏi bài tập ngữ pháp do Admin thiết lập cho bài học này
  const allExercises = useMemo(() => {
    const generated = generateLessonGrammarExercises(
      normalizedGrammars,
      vocabList,
      dialogueList,
      hskLevel,
      lessonNumber
    );

    if (Array.isArray(customExercises) && customExercises.length > 0) {
      // Kết hợp câu hỏi của Admin theo từng dạng bài
      const customModes = new Set(customExercises.map((e) => e.mode));
      // Giữ câu hỏi admin, các dạng còn lại lấy từ bộ sinh chuẩn
      const otherModeItems = generated.filter((g) => !customModes.has(g.mode));
      return [...customExercises, ...otherModeItems];
    }

    return generated;
  }, [customExercises, normalizedGrammars, vocabList, dialogueList, hskLevel, lessonNumber]);

  // Danh sách câu hỏi của dạng bài đang chọn theo điểm ngữ pháp hiện tại
  const currentModeExercises = useMemo(() => {
    const byMode = allExercises.filter((ex) => ex.mode === activeExerciseMode);
    if (!currentGrammar) return byMode;

    // 1. Tìm câu hỏi khớp với ngữ pháp hiện tại (grammarRule, grammarId hoặc tiêu đề)
    const matched = byMode.filter((ex) => {
      if ((ex as any).grammarId && (ex as any).grammarId === currentGrammar.id) return true;
      if (ex.grammarRule) {
        const ruleClean = ex.grammarRule.toLowerCase().trim();
        const titleClean = (currentGrammar.title || "").toLowerCase().trim();
        const zhClean = (currentGrammar.titleZh || "").toLowerCase().trim();
        if (ruleClean === titleClean) return true;
        if (titleClean && (ruleClean.includes(titleClean) || titleClean.includes(ruleClean))) return true;
        if (zhClean && ruleClean.includes(zhClean)) return true;
      }
      return false;
    });

    if (matched.length > 0) return matched;

    // 2. Nếu câu hỏi chưa phân rule cụ thể, chia đều số câu hỏi cho các điểm ngữ pháp
    if (normalizedGrammars.length > 1 && byMode.length > 0) {
      const idx = selectedGrammarIdx >= 0 ? selectedGrammarIdx : 0;
      const countPerGrammar = Math.max(1, Math.ceil(byMode.length / normalizedGrammars.length));
      const start = idx * countPerGrammar;
      const sliced = byMode.slice(start, start + countPerGrammar);
      if (sliced.length > 0) return sliced;
    }

    return byMode;
  }, [allExercises, activeExerciseMode, currentGrammar, normalizedGrammars, selectedGrammarIdx]);

  const currentExercise = currentModeExercises[currentQuestionIdx] || currentModeExercises[0];

  // Khi chuyển điểm ngữ pháp hoặc dạng bài, reset về câu đầu tiên
  useEffect(() => {
    setCurrentQuestionIdx(0);
  }, [selectedGrammarIdx, activeExerciseMode]);

  // Lọc danh sách ngữ pháp bên cột trái theo tìm kiếm
  const filteredGrammars = useMemo(() => {
    if (!searchQuery.trim()) return normalizedGrammars;
    const q = searchQuery.toLowerCase().trim();
    return normalizedGrammars.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.structure.toLowerCase().includes(q) ||
        g.meaningVi.toLowerCase().includes(q)
    );
  }, [normalizedGrammars, searchQuery]);

  // Reset trạng thái khi chuyển câu hoặc chuyển dạng bài
  useEffect(() => {
    setSelectedOpt(null);
    setIsAnswered(false);
    setOrderChecked(false);
    setOrderCorrect(false);

    if (currentExercise && currentExercise.mode === "reorder" && currentExercise.scrambledWords) {
      setAvailableTokens([...currentExercise.scrambledWords]);
      setAssembledTokens([]);
    }
  }, [currentExercise, activeExerciseMode, currentQuestionIdx]);

  // Xử lý nộp trắc nghiệm
  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOpt(opt);
    setIsAnswered(true);

    const letter = opt.trim().charAt(0);
    const isCorrect = letter === currentExercise.correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
    }
  };

  // Xử lý sắp xếp từ
  const handlePickToken = (word: string, index: number) => {
    if (orderChecked) return;
    setAssembledTokens((prev) => [...prev, word]);
    setAvailableTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveToken = (word: string, index: number) => {
    if (orderChecked) return;
    setAvailableTokens((prev) => [...prev, word]);
    setAssembledTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckReorder = () => {
    if (assembledTokens.length === 0) return;
    const joinedRaw = assembledTokens.join("").trim();
    const joinedNorm = normalizeForComparison(joinedRaw);
    const joinedHanzi = extractHanziOnly(joinedRaw);

    const targetSentenceNorm = normalizeForComparison(currentExercise.sentence || "");
    const targetAnswerNorm = normalizeForComparison(currentExercise.correctAnswer || "");
    const targetSentenceHanzi = extractHanziOnly(currentExercise.sentence || "");
    const targetAnswerHanzi = extractHanziOnly(currentExercise.correctAnswer || "");

    const stripPunct = (s: string) => s.replace(/[!?,]/g, "");
    const joinedNoPunct = stripPunct(joinedNorm);

    // 1. So sánh chuẩn trực tiếp
    let isMatch =
      (targetSentenceNorm && joinedNorm === targetSentenceNorm) ||
      (targetAnswerNorm && joinedNorm === targetAnswerNorm) ||
      (targetSentenceNorm && joinedNoPunct === stripPunct(targetSentenceNorm)) ||
      (targetAnswerNorm && joinedNoPunct === stripPunct(targetAnswerNorm)) ||
      (targetSentenceHanzi && joinedHanzi === targetSentenceHanzi) ||
      (targetAnswerHanzi && joinedHanzi === targetAnswerHanzi);

    // 2. Kiểm tra hoán vị hợp lệ của Trạng từ chỉ thời gian trong tiếng Trung (Subject + Time <=> Time + Subject)
    if (!isMatch && joinedHanzi) {
      const timeWords = ["今天", "明天", "昨天", "现在", "早上", "晚上", "中午", "下午", "去年", "今年", "明年", "星期一", "星期天", "周一", "周日"];
      for (const tw of timeWords) {
        if (targetSentenceHanzi.includes(tw) && joinedHanzi.includes(tw)) {
          // Hoán vị dạng 1: Chủ ngữ + Thời gian + Vị ngữ (vd: 我明天去学校)
          // Hoán vị dạng 2: Thời gian + Chủ ngữ + Vị ngữ (vd: 明天我去学校)
          const perm1 = targetSentenceHanzi.replace(new RegExp(`^(.*?)${tw}(.*)$`), `${tw}$1$2`);
          const perm2 = targetSentenceHanzi.replace(new RegExp(`^${tw}(.*?)(去|吃|喝|看|买|学|是|在|有|做|来)(.*)$`), `$1${tw}$2$3`);
          if (joinedHanzi === perm1 || joinedHanzi === perm2) {
            isMatch = true;
            break;
          }
        }
      }
    }

    setOrderCorrect(Boolean(isMatch));
    setOrderChecked(true);

    if (isMatch) {
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
      handleSpeak(currentExercise.sentence || joinedRaw);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < currentModeExercises.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setCurrentQuestionIdx(0);
    }
  };

  // Thống kê nhanh
  const masteredCount = normalizedGrammars.filter((g) => g.status === "MASTERED").length;
  const reviewCount = normalizedGrammars.filter((g) => g.status === "REVIEW_NEEDED").length;
  const notLearnedCount = normalizedGrammars.filter((g) => g.status === "NOT_LEARNED").length;
  const accuracyPercentage =
    currentQuestionIdx > 0 ? Math.round((correctCount / (currentQuestionIdx + 1)) * 100) : 80;

  if (!grammarList || grammarList.length === 0 || !normalizedGrammars || normalizedGrammars.length === 0 || !currentGrammar) {
    return (
      <div className="py-16 px-6 text-center bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-lg mx-auto shadow-sm space-y-4 my-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-3xl border border-amber-200">
          📖
        </div>
        <h3 className="font-serif font-bold text-lg text-[#204434]">Chưa có dữ liệu ngữ pháp cho bài học này</h3>
        <p className="text-xs text-[#315E48]">Vui lòng chọn bài học khác hoặc bổ sung điểm ngữ pháp trong phần biên soạn giáo trình.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. VÙNG 1: BANNER TIÊU ĐỀ BÀI LUYỆN NGỮ PHÁP & 5 THẺ THỐNG KÊ        */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FAF7F0] via-[#F4EFE6] to-[#EAE3D2] border border-[#E5DEC9] p-6 shadow-2xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F3EE] text-[#17382F] border border-[#BC9B6B]/40 flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-7 h-7 text-[#204434]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#17382F] flex items-center gap-2.5">
                <span>Luyện ngữ pháp</span>
                <span className="text-xl sm:text-2xl font-serif text-[#8F6D3B]">语法训练</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#315E48] mt-1 font-medium">
                Hiểu – Luyện – Vận dụng | Ghi nhớ cấu trúc qua nhiều dạng bài thực hành
              </p>
            </div>
          </div>

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

      {/* 5 Thẻ thống kê ngữ pháp */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Thẻ 1: Cấu trúc trong bài */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F3EE] text-[#204434] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-[#204434]">
              {normalizedGrammars.length} / {normalizedGrammars.length}
            </div>
            <p className="text-[10px] text-[#6B766D] font-medium truncate max-w-[120px]">
              Cấu trúc trong bài
            </p>
            <p className="text-[9px] text-[#8F6D3B] truncate max-w-[120px]">
              Bài {String(lessonNumber).padStart(2, "0")}: {lessonTitleZh}
            </p>
          </div>
        </div>

        {/* Thẻ 2: Đã nắm vững */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-600 bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0">
            75%
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-emerald-800">
              75%
            </div>
            <p className="text-[10px] text-emerald-900/80 font-bold">
              Đã nắm vững
            </p>
          </div>
        </div>

        {/* Thẻ 3: Cần ôn */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-amber-800">
              {reviewCount}
            </div>
            <p className="text-[10px] text-amber-900/80 font-bold">
              Cần ôn
            </p>
          </div>
        </div>

        {/* Thẻ 4: Chưa nắm */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-rose-800">
              {notLearnedCount}
            </div>
            <p className="text-[10px] text-rose-900/80 font-bold">
              Chưa nắm
            </p>
          </div>
        </div>

        {/* Thẻ 5: Thời gian luyện hôm nay */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#204434] flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5 text-[#8F6D3B]" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-[#204434]">
              {isMounted ? formatStudyTimeVi(todayStudySec) : "0 phút"}
            </div>
            <p className="text-[10px] text-[#6B766D] font-medium">
              Thời gian luyện Hôm nay
            </p>
            <p className="text-[9px] text-[#8F6D3B] truncate" title={`Tuần này: ${isMounted ? formatStudyTimeVi(weeklyStudySec) : "0 phút"}`}>
              Tuần này: {isMounted ? formatStudyTimeVi(weeklyStudySec) : "0 phút"}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. VÙNG 2: CHỌN DẠNG BÀI LUYỆN TẬP (5 DẠNG)                        */}
      {/* =================================================================== */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[#204434]">
          Chọn dạng bài luyện tập (5 dạng)
        </h4>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          {/* Dạng 1: Chọn câu đúng */}
          <button
            onClick={() => {
              setActiveExerciseMode("choose_correct");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "choose_correct"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>1. Chọn câu đúng (10 câu)</span>
          </button>

          {/* Dạng 2: Nghe hội thoại */}
          <button
            onClick={() => {
              setActiveExerciseMode("listen_dialogue");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "listen_dialogue"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>2. Nghe hội thoại (10 câu)</span>
          </button>

          {/* Dạng 3: Điền từ */}
          <button
            onClick={() => {
              setActiveExerciseMode("fill_blank");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "fill_blank"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>3. Điền từ (10 câu)</span>
          </button>

          {/* Dạng 4: Sắp xếp câu */}
          <button
            onClick={() => {
              setActiveExerciseMode("reorder");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "reorder"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>4. Sắp xếp câu (10 câu)</span>
          </button>

          {/* Dạng 5: Sửa câu sai */}
          <button
            onClick={() => {
              setActiveExerciseMode("correct_mistake");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "correct_mistake"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>5. Sửa câu sai (10 câu)</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. VÙNG 3, 4, 5: HÀNG GIỮA (3 CỘT: DANH SÁCH + LÀM BÀI + TIẾN ĐỘ)   */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================================================================= */}
        {/* CỘT TRÁI (VÙNG 3): DANH SÁCH CẤU TRÚC NGỮ PHÁP (3.5 COLS)         */}
        {/* ================================================================= */}
        <div className="lg:col-span-4 xl:col-span-3.5 bg-white border border-[#E5DEC9] rounded-3xl p-4 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-serif font-bold text-xs text-[#204434]">
              Danh sách cấu trúc ngữ pháp ({filteredGrammars.length})
            </h3>
            <select
              value={sortOrder}
              onChange={(e: any) => setSortOrder(e.target.value)}
              className="text-[10px] font-semibold text-[#204434] bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-2 py-1 focus:outline-hidden cursor-pointer"
            >
              <option value="DEFAULT">Theo thứ tự bài học</option>
              <option value="STATUS">Theo trạng thái</option>
            </select>
          </div>

          {/* Ô Tìm kiếm cấu trúc */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F6D3B]" />
            <input
              type="text"
              placeholder="Tìm cấu trúc ngữ pháp (ví dụ: 你好, 是, ...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] text-xs text-[#204434] placeholder-[#6B766D] focus:outline-hidden focus:border-[#204434]"
            />
          </div>

          {/* Danh sách các card cấu trúc ngữ pháp */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-0.5">
            {filteredGrammars.map((item, idx) => {
              const isSelected = selectedGrammarIdx === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedGrammarIdx(idx)}
                  className={`p-3 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? "bg-[#E8F3EE] border-[#17382F] shadow-2xs ring-1 ring-[#17382F]"
                      : "bg-[#FFFCF6] border-[#E5DEC9] hover:bg-[#FAF7F0]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[10px] font-bold text-[#8F6D3B] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-serif font-bold text-xs text-[#17382F] leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#6B766D] mt-0.5 font-medium">
                          {item.structure}
                        </p>
                      </div>
                    </div>

                    {/* Nút chuyển đổi trạng thái ngữ pháp linh hoạt (Học sinh tự điền/chọn) */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleGrammarStatus(item.id, item.status, e)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 transition cursor-pointer hover:scale-105 active:scale-95 shadow-2xs ${
                        item.status === "MASTERED"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : item.status === "REVIEW_NEEDED"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                      }`}
                      title="Bấm để thay đổi trạng thái học: Chưa học ➔ Đang ôn ➔ Đã hiểu"
                    >
                      {item.status === "MASTERED" ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          <span>Đã hiểu</span>
                        </>
                      ) : item.status === "REVIEW_NEEDED" ? (
                        <>
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Đang ôn</span>
                        </>
                      ) : (
                        <span>Chưa học</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* CỘT GIỮA (VÙNG 4): KHUNG LÀM BÀI TẬP LUYỆN NGỮ PHÁP (5 COLS)       */}
        {/* ================================================================= */}
        <div className="lg:col-span-8 xl:col-span-5 bg-white border border-[#E5DEC9] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          {/* Header câu hỏi */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#17382F]">
                Ngữ pháp {selectedGrammarIdx + 1}/{normalizedGrammars.length}
              </span>
              <span className="text-[#8F6D3B] font-medium hidden sm:inline">
                {currentGrammar.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-[#FAF7F0] overflow-hidden border border-[#E5DEC9]">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / 10) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-[#8F6D3B]">
                {currentQuestionIdx + 1}/10
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#315E48] border border-[#E5DEC9] font-bold">
                HSK {hskLevel} · Bài {String(lessonNumber).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Nội dung câu hỏi */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#17382F]">
              {currentExercise?.prompt}
            </h3>

            {/* Dạng Sắp Xếp Câu */}
            {activeExerciseMode === "reorder" && (
              <div className="space-y-3 py-2">
                <div className="min-h-[50px] p-3 rounded-2xl bg-[#FAF7F0] border-2 border-dashed border-[#BC9B6B] flex flex-wrap gap-2 items-center justify-center">
                  {assembledTokens.map((tok, i) => (
                    <button
                      key={i}
                      onClick={() => handleRemoveToken(tok, i)}
                      className="px-3 py-1.5 rounded-xl bg-[#17382F] text-white text-sm font-serif font-bold shadow-xs cursor-pointer hover:bg-rose-700 transition"
                    >
                      {tok}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {availableTokens.map((tok, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePickToken(tok, idx)}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-sm font-serif font-bold shadow-2xs hover:bg-[#FAF7F0] cursor-pointer transition"
                    >
                      {tok}
                    </button>
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleCheckReorder}
                    className="px-6 py-2 rounded-xl bg-[#17382F] text-white text-xs font-bold hover:bg-[#0f241e] transition cursor-pointer shadow-xs"
                  >
                    Kiểm tra câu
                  </button>
                </div>
              </div>
            )}

            {/* Dạng Điền Từ / Sửa Câu Sai: Hiển thị câu mẫu */}
            {(activeExerciseMode === "fill_blank" || activeExerciseMode === "correct_mistake") && (
              <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-1 text-center">
                <p className="font-serif font-bold text-lg text-[#17382F]">
                  {currentExercise.sentence || currentExercise.wrongSentence}
                </p>
                <p className="text-xs text-[#8F6D3B] font-mono">
                  {currentExercise.pinyin || currentExercise.wrongSentencePinyin}
                </p>
              </div>
            )}

            {/* Dạng Nghe Hội Thoại: Audio Player hoặc Nút phát âm thanh */}
            {activeExerciseMode === "listen_dialogue" && (
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 text-center space-y-3">
                {currentExercise.audioUrl ? (
                  <div className="space-y-2">
                    <audio
                      controls
                      src={currentExercise.audioUrl}
                      className="w-full max-w-md mx-auto h-10 rounded-xl"
                    />
                    <span className="text-[11px] text-[#8F6D3B] font-semibold block">
                      Phát file nghe của bài tập
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleSpeak(currentExercise.audioText || currentExercise.prompt || "")}
                      className="w-14 h-14 mx-auto rounded-full bg-[#17382F] text-white hover:bg-[#0f241e] flex items-center justify-center shadow-md cursor-pointer transition"
                      title="Nghe hội thoại"
                    >
                      <Volume2 className="w-6 h-6" />
                    </button>
                    <span className="text-[11px] text-[#8F6D3B] font-semibold block">
                      Bấm loa để nghe đoạn hội thoại (5 - 10 giây)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 4 Lựa chọn A, B, C, D (cho choose_correct, listen_dialogue, fill_blank, correct_mistake) */}
            {activeExerciseMode !== "reorder" && currentExercise?.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                {currentExercise.options.map((opt, idx) => {
                  const letter = opt.trim().charAt(0);
                  const isSelected = selectedOpt === opt;
                  const isCorrect = letter === currentExercise.correctAnswer;
                  let style =
                    "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]";

                  if (isAnswered) {
                    if (isCorrect) {
                      style = "bg-emerald-50 text-emerald-800 border-emerald-500 font-bold ring-2 ring-emerald-200";
                    } else if (isSelected) {
                      style = "bg-rose-50 text-rose-800 border-rose-500 font-bold ring-2 ring-rose-200";
                    } else {
                      style = "bg-gray-50 border-gray-200 text-gray-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between shadow-2xs ${style}`}
                    >
                      <span className="font-medium">{opt}</span>
                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Khối Giải Thích Sau Khi Trả Lời */}
            {(isAnswered || orderChecked) && (
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-2 text-xs text-[#204434] animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold">
                  {selectedOpt?.trim().charAt(0) === currentExercise.correctAnswer || orderCorrect ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đúng!</span>
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      <span>Chưa chính xác!</span>
                    </span>
                  )}
                </div>
                <p className="leading-relaxed text-[#315E48]">
                  {currentExercise.explanation}
                </p>
              </div>
            )}

            {/* Hàng nút hành động dưới câu hỏi */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5DEC9]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!currentExercise) return;
                    saveQuestionItem(studentId, {
                      id: currentExercise.id,
                      mode: currentExercise.mode,
                      grammarRule: currentExercise.grammarRule,
                      prompt: currentExercise.prompt,
                      options: currentExercise.options,
                      correctAnswer: currentExercise.correctAnswer,
                      explanation: currentExercise.explanation,
                      scrambledWords: currentExercise.scrambledWords,
                      wrongSentence: currentExercise.wrongSentence,
                      hskLevel,
                      lessonNumber,
                      lessonTitleZh,
                    });
                    setSavedTick((t) => t + 1);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition ${
                    currentExercise && isQuestionSaved(studentId, currentExercise.id)
                      ? "bg-amber-100 border-amber-300 text-amber-900"
                      : "border-[#E5DEC9] bg-white text-[#204434] hover:bg-[#FAF7F0]"
                  }`}
                  title="Lưu câu hỏi này để ôn tập sau"
                >
                  <BookmarkCheck className={`w-3.5 h-3.5 ${currentExercise && isQuestionSaved(studentId, currentExercise.id) ? "text-amber-700" : ""}`} />
                  <span>{currentExercise && isQuestionSaved(studentId, currentExercise.id) ? "Đã lưu câu hỏi" : "Lưu câu hỏi"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnswered(true)}
                  className="px-3 py-1.5 rounded-xl border border-[#E5DEC9] bg-white text-[11px] font-bold text-[#8F6D3B] hover:bg-[#FAF7F0] flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Xem giải thích chi tiết</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIdx === 0}
                  className="px-4 py-2 rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-[#204434] transition flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Câu trước</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-xl bg-[#17382F] hover:bg-[#0f241e] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CỘT PHẢI (VÙNG 5): TIẾN ĐỘ NGỮ PHÁP & NỘI DUNG HIỆN TẠI (3.5 COLS) */}
        {/* ================================================================= */}
        <div className="lg:col-span-12 xl:col-span-3.5 space-y-4">
          {/* 1. Tiến độ ngữ pháp */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-sm text-[#17382F]">
                Tiến độ ngữ pháp
              </span>
              <span className="text-[11px] text-[#8F6D3B] font-bold hover:underline cursor-pointer">
                Xem chi tiết &gt;
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Donut progress chart */}
              <div className="w-16 h-16 rounded-full border-4 border-emerald-600 bg-emerald-50 text-emerald-800 flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                <span>{masteredCount}/{normalizedGrammars.length}</span>
                <span className="text-[9px] font-normal text-emerald-900">cấu trúc</span>
              </div>

              {/* Thông số chi tiết */}
              <div className="space-y-1.5 text-xs text-[#315E48] flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px]">
                    <BookMarked className="w-3.5 h-3.5 text-[#8F6D3B]" />
                    Đã luyện:
                  </span>
                  <strong className="text-[#17382F]">3</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    Độ chính xác:
                  </span>
                  <strong className="text-emerald-700">{accuracyPercentage}%</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#8F6D3B]" />
                    Thời gian:
                  </span>
                  <strong className="text-[#17382F] font-mono">{isMounted ? formatTimerMMSS(todayStudySec) : "00:00"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Nội dung ngữ pháp hiện tại */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-sm space-y-3">
            <span className="font-serif font-bold text-xs text-[#17382F] block">
              Nội dung ngữ pháp hiện tại
            </span>

            {/* 4 Tab con: Giải thích | Cấu trúc | Ví dụ | Lưu ý */}
            <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-[#E5DEC9] text-[10px] font-bold">
              {(["GIẢI THÍCH", "CẤU TRÚC", "VÍ DỤ", "LƯU Ý"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSubTabRight(tab)}
                  className={`flex-1 py-1 rounded-lg transition cursor-pointer text-center ${
                    subTabRight === tab
                      ? "bg-[#17382F] text-white shadow-2xs"
                      : "text-[#315E48] hover:text-[#17382F]"
                  }`}
                >
                  {tab === "GIẢI THÍCH"
                    ? "Giải thích"
                    : tab === "CẤU TRÚC"
                    ? "Cấu trúc"
                    : tab === "VÍ DỤ"
                    ? "Ví dụ"
                    : "Lưu ý"}
                </button>
              ))}
            </div>

            {/* Chi tiết nội dung tab con */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-[#17382F]">
                  {currentGrammar.titleZh || currentGrammar.title}
                </h4>
                <button
                  type="button"
                  onClick={() => handleSpeak(currentGrammar.titleZh || currentGrammar.title)}
                  className="p-1 rounded-full text-[#8F6D3B] hover:text-[#17382F] cursor-pointer"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-[#6B766D] font-medium">
                {currentGrammar.meaningVi}
              </p>

              {/* Mẫu cấu trúc */}
              <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-1 text-[11px] font-mono">
                <span className="text-[#8F6D3B] font-bold block font-sans text-[10px]">Cấu trúc:</span>
                <p className="text-[#17382F] font-bold">{currentGrammar.structure}</p>
                <p className="text-[#315E48] font-sans text-[10px]">{currentGrammar.summary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. VÙNG 6: HÀNG DƯỚI CÙNG (3 KHỐI: GIẢI THÍCH / VÍ DỤ / MẸO GHI NHỚ) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
        {/* Khối 1 (Trái): Giải thích ngữ pháp (5 tab con) */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-[#17382F]">
              Giải thích ngữ pháp
            </span>
          </div>

          {/* 5 Tab con: Tóm tắt | Cách dùng | Ví dụ | Lưu ý | Lỗi thường gặp */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px] font-bold border-b border-[#E5DEC9]/80">
            {(["TÓM TẮT", "CÁCH DÙNG", "VÍ DỤ", "LƯU Ý", "LỖI THƯỜNG GẶP"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setSubTabBottom(tab)}
                  className={`px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer ${
                    subTabBottom === tab
                      ? "bg-[#17382F] text-white shadow-2xs"
                      : "text-[#315E48] hover:bg-[#FAF7F0]"
                  }`}
                >
                  {tab === "TÓM TẮT"
                    ? "Tóm tắt"
                    : tab === "CÁCH DÙNG"
                    ? "Cách dùng"
                    : tab === "VÍ DỤ"
                    ? "Ví dụ"
                    : tab === "LƯU Ý"
                    ? "Lưu ý"
                    : "Lỗi thường gặp"}
                </button>
              )
            )}
          </div>

          {/* Nội dung tương ứng của tab con */}
          <div className="space-y-2 text-xs">
            {subTabBottom === "TÓM TẮT" && (
              <div className="space-y-1.5">
                <p>
                  <strong className="text-[#17382F]">Cấu trúc:</strong>{" "}
                  <span className="text-[#8F6D3B] font-mono">{currentGrammar.structure}</span>
                </p>
                <p>
                  <strong className="text-[#17382F]">Ý nghĩa:</strong>{" "}
                  <span className="text-[#315E48]">{currentGrammar.meaningVi}</span>
                </p>
                <div className="pt-1 space-y-1">
                  <strong className="text-[#17382F] block">Ví dụ:</strong>
                  {currentGrammar.examples.slice(0, 3).map((ex, i) => (
                    <p key={i} className="text-[11px] text-[#315E48]">
                      <span className="font-serif font-bold text-[#17382F]">{ex.zh}</span> ({ex.vi})
                    </p>
                  ))}
                </div>
              </div>
            )}

            {subTabBottom === "CÁCH DÙNG" && (
              <div className="text-[11px] text-[#315E48] leading-relaxed">
                {currentGrammar.usage}
              </div>
            )}

            {subTabBottom === "VÍ DỤ" && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {currentGrammar.examples.map((ex, i) => (
                  <div key={i} className="p-1.5 rounded-lg bg-[#FAF7F0] text-[11px]">
                    <span className="font-serif font-bold text-[#17382F]">{ex.zh}</span>
                    <span className="text-[#8F6D3B] font-mono block">{ex.pinyin}</span>
                    <span className="text-[#315E48]">{ex.vi}</span>
                  </div>
                ))}
              </div>
            )}

            {subTabBottom === "LƯU Ý" && (
              <div className="text-[11px] text-[#315E48] leading-relaxed">
                {currentGrammar.notes}
              </div>
            )}

            {subTabBottom === "LỖI THƯỜNG GẶP" && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900 leading-relaxed">
                {currentGrammar.commonMistakes}
              </div>
            )}
          </div>
        </div>

        {/* Khối 2 (Giữa): Ví dụ câu (có phát âm từng câu) */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3">
          <span className="font-serif font-bold text-sm text-[#17382F] block">
            Ví dụ câu
          </span>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {currentGrammar.examples.map((ex, i) => (
              <div
                key={i}
                className="p-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9]/80 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSpeak(ex.zh)}
                    className="p-1.5 rounded-full bg-white text-[#8F6D3B] hover:text-[#17382F] shadow-2xs cursor-pointer"
                    title="Nghe câu này"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <span className="font-serif font-bold text-[#17382F] mr-2">
                      {ex.zh}
                    </span>
                    <span className="text-[10px] text-[#8F6D3B] font-mono mr-2">
                      {ex.pinyin}
                    </span>
                    <span className="text-[10px] text-[#315E48]">
                      {ex.vi}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Khối 3 (Phải): Mẹo ghi nhớ 💡 */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-2xs space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="font-serif font-bold text-sm text-[#17382F] flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Mẹo ghi nhớ</span>
            </span>
            <p className="text-xs text-[#315E48] leading-relaxed">
              {currentGrammar.memo}
            </p>
          </div>

          <div className="p-2 rounded-2xl bg-[#FAF7F0] border border-dashed border-[#E5DEC9] text-center text-[10px] text-[#8F6D3B] italic">
            Áp dụng mẹo trên khi làm bài tập phản xạ để ghi nhớ cấu trúc vĩnh viễn!
          </div>
        </div>
      </div>
    </div>
  );
}
