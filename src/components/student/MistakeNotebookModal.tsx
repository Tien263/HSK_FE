"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Volume2,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Award,
  Layers,
  HelpCircle,
} from "lucide-react";

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

interface MistakeNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentUsername?: string;
  onQuestionMastered?: () => void;
}

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
  const [viewMode, setViewMode] = useState<"practice" | "list">("practice");

  // State hỗ trợ dạng câu hỏi Sắp xếp từ thành câu (Reorder / Sentence Scramble)
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [assembledTokens, setAssembledTokens] = useState<string[]>([]);

  const extractScrambledTokens = useCallback((content: string): string[] => {
    // 1. Tìm các từ trong ngoặc đơn: (大家好) (一起) (吃) (我们) (吧) (饭)
    const matches = content.match(/\(([^)]+)\)/g);
    if (matches && matches.length >= 2) {
      return matches.map((m) => m.replace(/[()（）]/g, "").trim()).filter(Boolean);
    }
    // 2. Tìm phân cách bởi dấu gạch chéo: 大家好 / 一起 / 吃 / 我们 / 吧 / 饭
    if (content.includes(" / ") || content.includes("/")) {
      const parts = content.split(/\s*\/\s*/).map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) return parts;
    }
    return [];
  }, []);

  const fetchWrongQuestions = useCallback(async () => {
    setLoading(true);
    try {
      let query = "";
      if (studentId) query = `studentId=${encodeURIComponent(studentId)}`;
      else if (studentUsername) query = `username=${encodeURIComponent(studentUsername)}`;

      const res = await fetch(`/api/v1/my/wrong-questions?${query}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        if (currentIndex >= (data.items || []).length) {
          setCurrentIndex(0);
        }
      }
    } catch (e) {
      console.error(e);
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

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentQ = items[currentIndex];

  // Khởi tạo các tokens sắp xếp khi chuyển câu hỏi
  useEffect(() => {
    if (currentQ) {
      const extracted = extractScrambledTokens(currentQ.content);
      if (extracted.length >= 2) {
        setAvailableTokens([...extracted]);
      } else {
        setAvailableTokens([]);
      }
      setAssembledTokens([]);
    }
  }, [currentIndex, currentQ, extractScrambledTokens]);

  const handlePickToken = (word: string, index: number) => {
    if (isAnswered) return;
    setAssembledTokens((prev) => [...prev, word]);
    setAvailableTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveToken = (word: string, index: number) => {
    if (isAnswered) return;
    setAvailableTokens((prev) => [...prev, word]);
    setAssembledTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetTokens = () => {
    if (isAnswered || !currentQ) return;
    const extracted = extractScrambledTokens(currentQ.content);
    setAvailableTokens([...extracted]);
    setAssembledTokens([]);
  };

  const handleSelectAnswer = async (optId: string, forcedIsCorrect?: boolean) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(optId);
    setIsAnswered(true);

    const isCorrect = typeof forcedIsCorrect === "boolean" ? forcedIsCorrect : optId === currentQ.correctAnswer;

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

        // Update local item
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
      console.error(e);
    }
  };

  const handleCheckReorder = () => {
    if (isAnswered || !currentQ || assembledTokens.length === 0) return;
    const cleanStr = (s: string) => s.replace(/[\s\t\r\n,，.。!?！？'’"”]/g, "").trim();
    const assembledRaw = assembledTokens.join("");
    const assembledClean = cleanStr(assembledRaw);
    const targetClean = cleanStr(currentQ.correctAnswer || "");
    const explanationClean = cleanStr(currentQ.explanation || "");

    let isMatch = false;
    if (targetClean && assembledClean === targetClean) {
      isMatch = true;
    } else if (explanationClean.includes(assembledClean) && assembledClean.length >= 4) {
      isMatch = true;
    } else if (assembledClean.includes(targetClean) && targetClean.length >= 4) {
      isMatch = true;
    }

    handleSelectAnswer(assembledRaw, isMatch);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setFeedback(null);
    setAssembledTokens([]);
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl shadow-inner">
              🎯
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Sổ tay Câu sai & Khắc phục Điểm yếu
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                  {items.length} câu
                </span>
              </h2>
              <p className="text-xs text-rose-100">
                Làm đúng 3 lần liên tiếp để chính thức khắc phục và nhận thưởng +20 XP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-black/20 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setViewMode("practice")}
                className={`px-3 py-1 rounded-lg transition ${
                  viewMode === "practice" ? "bg-white text-rose-700 shadow" : "text-white/80 hover:text-white"
                }`}
              >
                Luyện câu
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded-lg transition ${
                  viewMode === "list" ? "bg-white text-rose-700 shadow" : "text-white/80 hover:text-white"
                }`}
              >
                Danh sách
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
          {loading ? (
            <div className="py-20 text-center text-slate-500">
              <div className="animate-spin text-3xl mb-2">⏳</div>
              <p className="text-sm font-medium">Đang tải sổ tay câu sai...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-base font-bold text-slate-800">
                Chúc mừng! Bạn không có câu sai nào cần ôn tập!
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Khi làm bài tập hoặc thi thử HSK, bất kỳ câu nào bạn làm chưa đúng sẽ tự động được hệ thống lưu vào Sổ tay này để bạn luyện lại.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Tiếp tục học bài mới
              </button>
            </div>
          ) : viewMode === "practice" && currentQ ? (
            <div className="max-w-2xl mx-auto flex flex-col">
              {/* Question Header & Indicators */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-700">
                    Câu {currentIndex + 1} / {items.length}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-200 text-[11px]">
                    Đã sai: {currentQ.wrongCount} lần
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                  <span>Tiến độ gỡ:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          currentQ.consecutiveRight >= step
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {currentQ.consecutiveRight >= step ? "✓" : step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md mb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-lg font-bold text-slate-900 font-serif leading-relaxed">
                      {currentQ.content}
                    </div>
                    {currentQ.pinyinPrompt && (
                      <div className="text-xs text-rose-600 font-medium mt-1">
                        {currentQ.pinyinPrompt}
                      </div>
                    )}
                  </div>
                </div>

                {/* Khu vực trả lời: Phân biệt dạng Sắp xếp câu (Reorder) hoặc Trắc nghiệm */}
                {(() => {
                  const extracted = extractScrambledTokens(currentQ.content);
                  const validOptions = currentQ.options.filter((o) => o.text && o.text.trim());
                  const isReorder = extracted.length >= 2 || (validOptions.length === 0 && currentQ.content.includes("Sắp xếp"));

                  if (isReorder) {
                    return (
                      <div className="mt-5 space-y-4">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-bold text-[#204434]">
                            👉 Bấm chọn các từ bên dưới để ghép thành câu hoàn chỉnh:
                          </span>
                          {!isAnswered && (
                            <button
                              type="button"
                              onClick={handleResetTokens}
                              className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                            >
                              Làm lại
                            </button>
                          )}
                        </div>

                        {/* Ô chứa các từ đã ghép */}
                        <div className="min-h-[58px] p-3 rounded-2xl bg-[#FAF7F0] border-2 border-dashed border-[#BC9B6B] flex flex-wrap gap-2 items-center justify-center">
                          {assembledTokens.length === 0 ? (
                            <span className="text-xs text-slate-400 italic">
                              (Chưa có từ nào được chọn. Bấm các từ bên dưới để ghép câu)
                            </span>
                          ) : (
                            assembledTokens.map((tok, i) => (
                              <button
                                key={i}
                                disabled={isAnswered}
                                onClick={() => handleRemoveToken(tok, i)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#204434] text-white text-sm font-serif font-bold shadow-xs cursor-pointer hover:bg-rose-700 transition"
                                title="Bấm để gỡ từ này"
                              >
                                {tok}
                              </button>
                            ))
                          )}
                        </div>

                        {/* Danh sách các từ có sẵn */}
                        <div className="flex flex-wrap gap-2 justify-center py-2">
                          {availableTokens.map((tok, i) => (
                            <button
                              key={i}
                              disabled={isAnswered}
                              onClick={() => handlePickToken(tok, i)}
                              className="px-3.5 py-2 rounded-xl bg-white border-2 border-[#E5DEC9] text-[#204434] text-sm font-serif font-bold shadow-xs hover:border-[#204434] hover:bg-[#FAF7F0] transition cursor-pointer"
                            >
                              {tok}
                            </button>
                          ))}
                        </div>

                        {/* Nút kiểm tra câu sắp xếp */}
                        {!isAnswered && (
                          <div className="flex justify-end pt-1">
                            <button
                              disabled={assembledTokens.length === 0}
                              onClick={handleCheckReorder}
                              className="px-6 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              Kiểm tra câu ghép
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Dạng trắc nghiệm nhiều lựa chọn
                  return (
                    <div className="mt-5 space-y-2.5">
                      {validOptions.map((opt) => {
                        const isSelected = selectedOption === opt.id || selectedOption === opt.text;
                        const isCorrectAnswer = opt.id === currentQ.correctAnswer || opt.text === currentQ.correctAnswer;

                        let btnStyle = "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700";
                        if (isAnswered) {
                          if (isCorrectAnswer) {
                            btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold ring-2 ring-emerald-300";
                          } else if (isSelected) {
                            btnStyle = "bg-rose-50 border-rose-400 text-rose-800 font-bold ring-2 ring-rose-300";
                          } else {
                            btnStyle = "bg-slate-50/50 border-slate-200 text-slate-400 opacity-60";
                          }
                        } else if (isSelected) {
                          btnStyle = "bg-rose-50 border-rose-400 text-rose-800 font-bold";
                        }

                        return (
                          <button
                            key={opt.id}
                            disabled={isAnswered}
                            onClick={() => handleSelectAnswer(opt.id)}
                            className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${btnStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-xs font-bold shadow-sm">
                                {opt.id}
                              </span>
                              <span className="text-sm font-medium">{opt.text}</span>
                            </div>
                            {isAnswered && (
                              <div>
                                {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                                {isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-rose-600" />}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Explanation feedback */}
                {isAnswered && (
                  <div
                    className={`mt-4 p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                      feedback?.isCorrect
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-rose-50 border-rose-200 text-rose-900"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                      {feedback?.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Chính xác! (+{feedback.earnedXp || 5} XP)</span>
                          {feedback?.isMastered && (
                            <span className="ml-2 text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                              🏆 Đã khắc phục thành công!
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Chưa chính xác! Cùng xem giải thích nhé:</span>
                        </>
                      )}
                    </div>

                    <div className="mt-1 font-medium text-slate-700">
                      {currentQ.explanation || `Đáp án đúng là ${currentQ.correctAnswer}. Hãy chú ý ngữ pháp và trật tự từ nhé.`}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setSelectedOption(null);
                    setIsAnswered(false);
                    setFeedback(null);
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Câu trước
                </button>

                {isAnswered ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm"
                  >
                    <span>Câu tiếp theo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic">Chọn 1 đáp án để kiểm tra</span>
                )}
              </div>
            </div>
          ) : (
            /* TAB 2: VIEW ALL WRONG QUESTIONS LIST */
            <div className="space-y-3">
              {items.map((it, idx) => (
                <div
                  key={it.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setViewMode("practice");
                    setSelectedOption(null);
                    setIsAnswered(false);
                    setFeedback(null);
                  }}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md cursor-pointer transition flex items-center justify-between gap-4 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                        Sai {it.wrongCount} lần
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                        Đúng liên tiếp: {it.consecutiveRight}/3
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-800 font-serif group-hover:text-rose-700 transition">
                      {it.content}
                    </div>
                  </div>

                  <button className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-rose-600 group-hover:text-white text-xs font-bold transition flex items-center gap-1 flex-shrink-0">
                    Luyện câu này <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
