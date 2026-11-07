"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Award,
  Layers,
  HelpCircle,
  Flame,
  Volume2,
  Target,
  BarChart3,
  RefreshCw,
  Check,
} from "lucide-react";
import { playChineseSpeech } from "@/lib/chinese-speech-player";

interface WrongQuestionItem {
  id: string;
  questionId: string;
  content: string;
  pinyinPrompt: string | null;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation: string | null;
  wrongCount: number;
  consecutiveRight: number;
}

interface GrammarCategoryStat {
  category: string;
  nameVi: string;
  count: number;
  status: "CRITICAL" | "WARNING" | "GOOD";
  description: string;
  tip: string;
}

interface MistakeNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentUsername?: string;
  onQuestionMastered?: () => void;
}

// Phân loại ngữ pháp cho các câu sai
function categorizeGrammar(content: string = "", explanation: string = ""): string {
  const text = (content + " " + explanation).toLowerCase();
  if (text.includes("把") || text.includes("chữ 把") || text.includes("câu chữ ba")) {
    return "BA_STRUCTURE";
  }
  if (text.includes("被") || text.includes("chữ 被") || text.includes("bị/được")) {
    return "BEI_STRUCTURE";
  }
  if (
    text.includes("bổ ngữ kết quả") ||
    text.includes("bổ ngữ xu hướng") ||
    text.includes("trạng thái") ||
    text.includes("khả năng") ||
    text.includes("完") ||
    text.includes("懂") ||
    text.includes("见")
  ) {
    return "COMPLEMENTS";
  }
  if (
    text.includes("lượng từ") ||
    text.includes("cái") ||
    text.includes("chiếc") ||
    text.includes("con") ||
    text.includes("bản") ||
    text.includes("个") ||
    text.includes("本") ||
    text.includes("张") ||
    text.includes("条") ||
    text.includes("只")
  ) {
    return "CLASSIFIERS";
  }
  if (
    text.includes("liên từ") ||
    text.includes("tuy...nhưng") ||
    text.includes("vì...cho nên") ||
    text.includes("mặc dù") ||
    text.includes("不但") ||
    text.includes("而且") ||
    text.includes("虽然") ||
    text.includes("但是")
  ) {
    return "CONJUNCTIONS";
  }
  return "PARTICLES_OTHERS";
}

const GRAMMAR_CATEGORY_INFO: Record<string, { nameVi: string; description: string; tip: string }> = {
  BA_STRUCTURE: {
    nameVi: "Cấu trúc Câu chữ 把 (Xử lý đối tượng)",
    description: "Nhấn mạnh hành động tác động làm thay đổi trạng thái hoặc vị trí của tân ngữ.",
    tip: "Công thức: S + 把 + Tân ngữ + Động từ + Thành phần khác (了/bổ ngữ). Động từ không được đứng đơn độc!",
  },
  BEI_STRUCTURE: {
    nameVi: "Cấu trúc Câu chữ 被 (Bị động)",
    description: "Biểu thị chủ ngữ chịu tác động bất lợi hoặc không mong muốn từ đối tượng khác.",
    tip: "Công thức: Chủ ngữ (chịu tác động) + 被 + Tác nhân (có thể lược bỏ) + Động từ + Thành phần khác.",
  },
  COMPLEMENTS: {
    nameVi: "Bổ ngữ Kết quả & Bổ ngữ Xu hướng",
    description: "Chỉ rõ kết quả của hành động đã hoàn thành, nghe hiểu hay phương hướng di chuyển.",
    tip: "Động từ + Kết quả (ví dụ: 看见 - nhìn thấy, 做完 - làm xong, 听懂 - nghe hiểu).",
  },
  CLASSIFIERS: {
    nameVi: "Lượng từ & Số từ Thông dụng",
    description: "Sử dụng đúng lượng từ tương thích với từng danh từ (sách, bàn, áo, vé...).",
    tip: "Luôn nhớ: Số từ + Lượng từ + Danh từ (ví dụ: 一本书, 两张票, 一条裤子).",
  },
  CONJUNCTIONS: {
    nameVi: "Cặp liên từ phức hợp",
    description: "Kết nối 2 phân câu biểu thị nguyên nhân - kết quả, tương phản hay tăng tiến.",
    tip: "Học theo cặp cố định: 虽然...但是..., 因为...所以..., 不但...而且...",
  },
  PARTICLES_OTHERS: {
    nameVi: "Trợ từ ngữ khí & Cấu trúc bổ trợ",
    description: "Các trợ từ 了, 吗, 吧, 呢 và kết cấu nhấn mạnh 是...的.",
    tip: "Phân biệt '了' ở cuối câu (biểu thị thay đổi trạng thái) và '了' sau động từ (biểu thị hoàn thành).",
  },
};

export default function MistakeNotebookModal({
  isOpen,
  onClose,
  studentId,
  studentUsername,
  onQuestionMastered,
}: MistakeNotebookModalProps) {
  const [items, setItems] = useState<WrongQuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    earnedXp?: number;
    isMastered?: boolean;
  } | null>(null);

  // Chế độ xem: "practice" (luyện từng câu), "heatmap" (bản đồ nhiệt điểm yếu), "detox" (bộ đề giải độc 10 câu), "list" (danh sách)
  const [viewMode, setViewMode] = useState<"heatmap" | "detox" | "practice" | "list">("heatmap");

  // State riêng cho Bộ Đề Giải Độc 10 Câu (Detox Quiz)
  const [detoxQuestions, setDetoxQuestions] = useState<WrongQuestionItem[]>([]);
  const [detoxIndex, setDetoxIndex] = useState(0);
  const [detoxUserAnswers, setDetoxUserAnswers] = useState<Record<string, string>>({});
  const [detoxSubmitted, setDetoxSubmitted] = useState(false);
  const [detoxScore, setDetoxScore] = useState<number | null>(null);

  const fetchWrongQuestions = useCallback(async () => {
    setLoading(true);
    try {
      let query = "";
      if (studentId) query = `studentId=${encodeURIComponent(studentId)}`;
      else if (studentUsername) query = `username=${encodeURIComponent(studentUsername)}`;

      const res = await fetch(`/api/v1/my/wrong-questions?${query}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
        if (currentIndex >= data.items.length) {
          setCurrentIndex(0);
        }
      }
    } catch (e) {
      console.error("fetchWrongQuestions error:", e);
    } finally {
      setLoading(false);
    }
  }, [studentId, studentUsername, currentIndex]);

  useEffect(() => {
    if (isOpen) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      fetchWrongQuestions();
      setSelectedOption(null);
      setIsAnswered(false);
      setFeedback(null);
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen, fetchWrongQuestions]);

  // Tính toán Bản đồ nhiệt điểm yếu ngữ pháp (Grammar Heatmap Statistics)
  const grammarStats = useMemo<GrammarCategoryStat[]>(() => {
    const counts: Record<string, number> = {
      BA_STRUCTURE: 0,
      BEI_STRUCTURE: 0,
      COMPLEMENTS: 0,
      CLASSIFIERS: 0,
      CONJUNCTIONS: 0,
      PARTICLES_OTHERS: 0,
    };

    items.forEach((item) => {
      const cat = categorizeGrammar(item.content, item.explanation || "");
      counts[cat] = (counts[cat] || 0) + item.wrongCount;
    });

    return Object.entries(counts).map(([cat, count]) => {
      const info = GRAMMAR_CATEGORY_INFO[cat] || GRAMMAR_CATEGORY_INFO.PARTICLES_OTHERS;
      let status: "CRITICAL" | "WARNING" | "GOOD" = "GOOD";
      if (count >= 3) status = "CRITICAL";
      else if (count >= 1) status = "WARNING";

      return {
        category: cat,
        nameVi: info.nameVi,
        count,
        status,
        description: info.description,
        tip: info.tip,
      };
    }).sort((a, b) => b.count - a.count);
  }, [items]);

  // Khởi tạo Bộ Đề Giải Độc 10 Câu (Detox Quiz)
  const startDetoxQuiz = (targetCategory?: string) => {
    let pool = [...items];
    if (targetCategory) {
      const filtered = pool.filter((it) => categorizeGrammar(it.content, it.explanation || "") === targetCategory);
      if (filtered.length > 0) pool = filtered;
    }

    // Xáo trộn và lấy tối đa 10 câu
    const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, 10);
    setDetoxQuestions(shuffled);
    setDetoxIndex(0);
    setDetoxUserAnswers({});
    setDetoxSubmitted(false);
    setDetoxScore(null);
    setViewMode("detox");
  };

  const handleDetoxSelect = (qId: string, optText: string) => {
    if (detoxSubmitted) return;
    setDetoxUserAnswers((prev) => ({ ...prev, [qId]: optText }));
  };

  const submitDetoxQuiz = () => {
    let correctCount = 0;
    detoxQuestions.forEach((q) => {
      const userAns = detoxUserAnswers[q.id];
      if (userAns && isOptionMatching(userAns, q.correctAnswer, q.options)) {
        correctCount++;
      }
    });

    setDetoxScore(correctCount);
    setDetoxSubmitted(true);
  };

  // Helper kiểm tra đáp án
  function isOptionMatching(selected: string, correct: string, options: Array<{ id: string; text: string }>): boolean {
    const s = String(selected || "").trim().toLowerCase();
    const c = String(correct || "").trim().toLowerCase();
    if (s === c) return true;

    const matched = options.find((o) => o.text.trim().toLowerCase() === s || o.id.trim().toLowerCase() === s);
    if (matched) {
      if (matched.id.trim().toLowerCase() === c || matched.text.trim().toLowerCase() === c) return true;
    }
    return false;
  }

  const currentQ = items[currentIndex];

  const handleSelectAnswer = async (optIdOrText: string) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(optIdOrText);
    setIsAnswered(true);

    const isCorrect = isOptionMatching(optIdOrText, currentQ.correctAnswer, currentQ.options);

    try {
      const res = await fetch("/api/v1/my/wrong-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wrongQuestionId: currentQ.id,
          isCorrect,
          username: studentUsername || "student",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          isCorrect,
          earnedXp: data.earnedXp,
          isMastered: data.isMastered,
        });

        setItems((prev) =>
          prev.map((it, idx) =>
            idx === currentIndex
              ? {
                  ...it,
                  consecutiveRight: isCorrect ? it.consecutiveRight + 1 : 0,
                  wrongCount: isCorrect ? it.wrongCount : it.wrongCount + 1,
                }
              : it
          )
        );

        if (data.isMastered && onQuestionMastered) {
          onQuestionMastered();
        }
      }
    } catch (e) {
      console.warn("Update wrong question progress error:", e);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setFeedback(null);
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setFeedback(null);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const playVoice = (text: string) => {
    playChineseSpeech(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#FFFCF6] text-[#204434] rounded-3xl shadow-2xl border border-[#E5DEC9] overflow-hidden">
        
        {/* Header Cổ Phong */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#204434] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center font-bold text-lg shadow-inner">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold">
                  Bản Đồ Nhiệt Điểm Yếu & Bộ Đề Giải Độc Ngữ Pháp
                </h2>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                  {items.length} câu cần củng cố
                </span>
              </div>
              <p className="text-xs text-[#EADBC3]">
                Phân tích lỗ hổng ngữ pháp, trực quan hóa mức độ nguy cấp & sinh đề giải độc tức thì
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Tabs Điều Khiển */}
        <div className="px-6 py-2.5 bg-[#FAF7F0] border-b border-[#E5DEC9] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setViewMode("heatmap")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "heatmap"
                  ? "bg-[#204434] text-white shadow-xs"
                  : "bg-white text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bản Đồ Nhiệt Điểm Yếu</span>
            </button>

            <button
              onClick={() => startDetoxQuiz()}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "detox"
                  ? "bg-[#D4AF37] text-black shadow-xs"
                  : "bg-amber-100/70 text-amber-900 border border-amber-300 hover:bg-amber-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span>Bộ Đề Giải Độc (10 Câu)</span>
            </button>

            <button
              onClick={() => setViewMode("practice")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "practice"
                  ? "bg-[#204434] text-white shadow-xs"
                  : "bg-white text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Luyện Từng Câu ({items.length})</span>
            </button>
          </div>

          <button
            onClick={fetchWrongQuestions}
            className="text-[11px] text-[#8F6D3B] hover:text-[#204434] flex items-center gap-1 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Nội Dung Chính */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-stone-500 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#204434]" />
              <p className="text-xs">Đang rà soát bản đồ nhiệt lỗi sai...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
              <span className="text-4xl">🎉</span>
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Chúc mừng bạn! Không còn câu sai nào cần giải độc.
              </h3>
              <p className="text-xs text-stone-500 max-w-sm">
                Toàn bộ các điểm ngữ pháp và từ vựng của bạn đều đang ở trạng thái vững vàng. Hãy tự tin làm bài thi thử HSK nhé!
              </p>
            </div>
          ) : (
            <>
              {/* ================= TAB 1: BẢN ĐỒ NHIỆT ĐIỂM YẾU NGỮ PHÁP ================= */}
              {viewMode === "heatmap" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
                    <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold">Chẩn đoán thông minh từ kết quả luyện thi:</span>
                      <p className="leading-relaxed">
                        Hệ thống tổng hợp tất cả các câu bạn từng trả lời sai, phân tích cú pháp để phát hiện chính xác lỗ hổng ngữ pháp. Bạn chỉ cần bấm <strong>&quot;Giải độc ngay&quot;</strong> để luyện trúng đích 10 câu khắc phục điểm yếu đó.
                      </p>
                    </div>
                  </div>

                  {/* Danh sách các nhóm ngữ pháp & Thanh biểu đồ nhiệt */}
                  <div className="space-y-4">
                    {grammarStats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3 transition hover:border-[#BC9B6B]"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3 h-3 rounded-full shrink-0 ${
                                stat.status === "CRITICAL"
                                  ? "bg-red-500 animate-pulse"
                                  : stat.status === "WARNING"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                            />
                            <h4 className="font-serif font-bold text-sm text-[#204434]">
                              {stat.nameVi}
                            </h4>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                                stat.status === "CRITICAL"
                                  ? "bg-red-100 text-red-800 border border-red-300"
                                  : stat.status === "WARNING"
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              }`}
                            >
                              {stat.count} lượt sai · {stat.status === "CRITICAL" ? "Nguy cấp" : stat.status === "WARNING" ? "Cần ôn" : "Tạm ổn"}
                            </span>

                            <button
                              type="button"
                              onClick={() => startDetoxQuiz(stat.category)}
                              className="px-3 py-1 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
                            >
                              <span>Giải độc ngay</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Thanh nhiệt trực quan */}
                        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              stat.status === "CRITICAL"
                                ? "bg-red-500"
                                : stat.status === "WARNING"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(10, stat.count * 25))}%` }}
                          />
                        </div>

                        {/* Lời khuyên và bí quyết nhớ */}
                        <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-xs space-y-1">
                          <div className="text-[11px] text-[#8F6D3B] font-semibold">
                            💡 {stat.description}
                          </div>
                          <div className="text-[11px] text-stone-600 font-mono">
                            ⚡ Bí quyết: {stat.tip}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= TAB 2: BỘ ĐỀ GIẢI ĐỘC 10 CÂU (DETOX QUIZ) ================= */}
              {viewMode === "detox" && (
                <div className="space-y-6">
                  {detoxQuestions.length === 0 ? (
                    <div className="text-center p-8 space-y-3">
                      <p className="text-xs text-stone-500">Chưa có câu hỏi nào trong bộ đề giải độc.</p>
                      <button
                        onClick={() => startDetoxQuiz()}
                        className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold"
                      >
                        Bắt đầu tạo đề 10 câu
                      </button>
                    </div>
                  ) : !detoxSubmitted ? (
                    /* Giao diện làm 10 câu giải độc */
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
                        <span className="font-serif font-bold text-sm text-[#204434] flex items-center gap-2">
                          <Target className="w-4 h-4 text-[#D4AF37]" />
                          <span>Câu {detoxIndex + 1} / {detoxQuestions.length}</span>
                        </span>
                        <span className="text-xs text-[#8F6D3B] font-mono">
                          Đã làm: {Object.keys(detoxUserAnswers).length} / {detoxQuestions.length} câu
                        </span>
                      </div>

                      {/* Câu hỏi hiện tại của đề giải độc */}
                      {detoxQuestions[detoxIndex] && (
                        <div className="p-6 rounded-3xl bg-white border border-[#E5DEC9] space-y-5 shadow-xs">
                          <div className="space-y-2">
                            <h4 className="font-serif font-bold text-base text-[#204434]">
                              {detoxQuestions[detoxIndex].content}
                            </h4>
                            {detoxQuestions[detoxIndex].pinyinPrompt && (
                              <p className="text-xs text-[#8F6D3B] font-mono">
                                {detoxQuestions[detoxIndex].pinyinPrompt}
                              </p>
                            )}
                          </div>

                          {/* Phương án trắc nghiệm */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {detoxQuestions[detoxIndex].options.map((opt, i) => {
                              const letters = ["A", "B", "C", "D"];
                              const badge = letters[i] || String(i + 1);
                              const isSelected = detoxUserAnswers[detoxQuestions[detoxIndex].id] === opt.text;

                              return (
                                <button
                                  key={opt.id || i}
                                  onClick={() => handleDetoxSelect(detoxQuestions[detoxIndex].id, opt.text)}
                                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between text-xs font-semibold shadow-2xs ${
                                    isSelected
                                      ? "bg-[#204434] text-white border-[#204434] font-bold"
                                      : "bg-[#FFFCF6] border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`w-6 h-6 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                                        isSelected
                                          ? "bg-white text-[#204434]"
                                          : "bg-[#204434]/10 text-[#204434]"
                                      }`}
                                    >
                                      {badge}
                                    </span>
                                    <span>{opt.text}</span>
                                  </div>
                                  {isSelected && <Check className="w-4 h-4 text-white" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Nút Previous / Next & Nộp bài */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          disabled={detoxIndex === 0}
                          onClick={() => setDetoxIndex((p) => Math.max(0, p - 1))}
                          className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs font-bold disabled:opacity-40"
                        >
                          Câu trước
                        </button>

                        {detoxIndex < detoxQuestions.length - 1 ? (
                          <button
                            onClick={() => setDetoxIndex((p) => Math.min(detoxQuestions.length - 1, p + 1))}
                            className="px-5 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold"
                          >
                            Câu kế tiếp
                          </button>
                        ) : (
                          <button
                            onClick={submitDetoxQuiz}
                            className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2b] text-black text-xs font-bold shadow-md cursor-pointer"
                          >
                            Hoàn thành & Chấm điểm giải độc
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Kết quả giải độc */
                    <div className="p-8 rounded-3xl bg-white border border-[#E5DEC9] text-center space-y-6">
                      <div className="space-y-2">
                        <div className="text-4xl">🎉</div>
                        <h3 className="font-serif font-bold text-lg text-[#204434]">
                          Kết Quả Bài Giải Độc Ngữ Pháp
                        </h3>
                        <div className="font-mono font-black text-4xl text-[#204434]">
                          {detoxScore} / {detoxQuestions.length} câu đúng
                        </div>
                        <p className="text-xs text-stone-500">
                          {detoxScore && detoxScore >= 8
                            ? "Tuyệt vời! Lỗ hổng ngữ pháp đã được phục hồi xuất sắc."
                            : "Khá tốt! Hãy đọc lại lời giải chi tiết bên dưới để hoàn thiện hoàn toàn."}
                        </p>
                      </div>

                      {/* Chi tiết từng câu trong bài giải độc */}
                      <div className="space-y-3 text-left">
                        {detoxQuestions.map((q, idx) => {
                          const userAns = detoxUserAnswers[q.id];
                          const isRight = userAns && isOptionMatching(userAns, q.correctAnswer, q.options);

                          return (
                            <div
                              key={q.id}
                              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                                isRight ? "bg-emerald-50/50 border-emerald-300" : "bg-red-50/50 border-red-300"
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span>Câu {idx + 1}: {q.content}</span>
                                <span className={isRight ? "text-emerald-700" : "text-red-700"}>
                                  {isRight ? "✓ Đúng" : "✕ Chưa đúng"}
                                </span>
                              </div>
                              <div className="text-[11px] text-stone-600">
                                <strong>Đáp án đúng:</strong> {q.correctAnswer}
                              </div>
                              {q.explanation && (
                                <div className="text-[11px] text-[#8F6D3B] italic">
                                  💡 {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => startDetoxQuiz()}
                        className="px-6 py-2.5 rounded-xl bg-[#204434] text-white text-xs font-bold"
                      >
                        Luyện lại bộ đề giải độc khác
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 3: LUYỆN TỪNG CÂU TUẦN TỰ ================= */}
              {viewMode === "practice" && currentQ && (
                <div className="space-y-6">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E5DEC9]">
                    <span className="font-serif font-bold text-[#204434]">
                      Câu {currentIndex + 1} / {items.length}
                    </span>
                    <span className="text-[11px] text-[#9D493E] font-medium">
                      Đã sai {currentQ.wrongCount} lần · Cần đúng liên tiếp 2 lần để khắc cốt
                    </span>
                  </div>

                  {/* Nội dung câu hỏi */}
                  <div className="p-6 rounded-3xl bg-white border border-[#E5DEC9] space-y-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-serif font-bold text-base text-[#204434]">
                          {currentQ.content}
                        </h3>
                        {currentQ.pinyinPrompt && (
                          <p className="text-xs text-[#8F6D3B] font-mono">
                            {currentQ.pinyinPrompt}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => playVoice(currentQ.content)}
                        className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3EFE6] text-[#204434] transition cursor-pointer shrink-0"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4 text-[#8F6D3B]" />
                      </button>
                    </div>

                    {/* Danh sách lựa chọn */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {currentQ.options.map((opt, i) => {
                        const isSelected = selectedOption === opt.id || selectedOption === opt.text;
                        const isCorrectOption = isOptionMatching(opt.text, currentQ.correctAnswer, currentQ.options);

                        let style = "bg-[#FFFCF6] border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]";
                        if (isAnswered) {
                          if (isCorrectOption) {
                            style = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold";
                          } else if (isSelected) {
                            style = "bg-red-50 border-red-300 text-red-900";
                          } else {
                            style = "bg-[#FAF7F0] border-[#E5DEC9] text-stone-400 opacity-60";
                          }
                        } else if (isSelected) {
                          style = "bg-[#204434] text-white border-[#204434] font-bold";
                        }

                        return (
                          <button
                            key={opt.id || i}
                            disabled={isAnswered}
                            onClick={() => handleSelectAnswer(opt.text)}
                            className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between text-xs font-semibold shadow-2xs ${style}`}
                          >
                            <span>{opt.text}</span>
                            {isAnswered && isCorrectOption && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                            {isAnswered && isSelected && !isCorrectOption && <X className="w-4 h-4 text-red-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lời giải & Phản hồi khi đã trả lời */}
                  {isAnswered && (
                    <div
                      className={`p-5 rounded-2xl border text-xs space-y-2 animate-in fade-in ${
                        feedback?.isCorrect ? "bg-emerald-50/70 border-emerald-300" : "bg-red-50/70 border-red-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className={feedback?.isCorrect ? "text-emerald-800" : "text-red-800"}>
                          {feedback?.isCorrect ? "🎉 Chính xác! Bạn đã ghi nhớ đúng." : "Chưa chính xác. Hãy đọc kỹ lời giải bên dưới:"}
                        </span>
                        {feedback?.earnedXp && feedback.earnedXp > 0 && (
                          <span className="text-amber-700 font-mono font-bold">+{feedback.earnedXp} XP</span>
                        )}
                      </div>

                      <div className="text-stone-700 leading-relaxed">
                        <strong>Đáp án chuẩn:</strong> {currentQ.correctAnswer}
                      </div>

                      {currentQ.explanation && (
                        <div className="text-stone-600 italic">
                          💡 {currentQ.explanation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Thanh chuyển câu Previous / Next */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      disabled={currentIndex === 0}
                      onClick={handlePrev}
                      className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs font-bold disabled:opacity-40"
                    >
                      Câu trước
                    </button>
                    <button
                      onClick={handleNext}
                      className="px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition shadow-xs"
                    >
                      {currentIndex < items.length - 1 ? "Câu kế tiếp" : "Về câu đầu tiên"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
