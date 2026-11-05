"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
  Trophy,
  ArrowRight,
  BookOpen,
  Award,
  HelpCircle,
  Layers,
  Headphones,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { recordStudyTime, getTodayStudySeconds } from "@/lib/memory-review-service";
import type { GrammarExerciseItem } from "@/lib/hsk1-full-lessons";

interface ComprehensivePracticeSuiteProps {
  vocabList?: any[];
  grammarList?: any[];
  lessonTitleZh?: string;
  lessonNumber?: number;
  handleSpeak: (text: string) => void;
  studentId?: string;
  customExercises?: GrammarExerciseItem[];
  isLoading?: boolean;
}

interface ComprehensiveQuestion {
  id: string;
  type: string;
  typeLabel: string;
  grammarRule?: string;
  prompt: string;
  subPrompt?: string;
  hanziToSpeak?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  dialogueLines?: { speaker: string; zh: string; pinyin: string; vi: string }[];
}

function isOptionCorrect(selectedOption: string, correctAnswer: string): boolean {
  if (!selectedOption || !correctAnswer) return false;
  const s = selectedOption.trim();
  const a = correctAnswer.trim();

  // 1. Khớp chính xác
  if (s === a) return true;

  // 2. Khớp theo ký tự chữ cái (A, B, C, D)
  const sLetter = s.match(/^([A-D])[\.\:\s]/)?.[1] || (s.length === 1 && /^[A-D]$/i.test(s) ? s : null);
  const aLetter = a.match(/^([A-D])[\.\:\s]/)?.[1] || (a.length === 1 && /^[A-D]$/i.test(a) ? a : null);

  if (sLetter && aLetter && sLetter.toUpperCase() === aLetter.toUpperCase()) return true;
  if (sLetter && sLetter.toUpperCase() === a.toUpperCase()) return true;
  if (aLetter && aLetter.toUpperCase() === s.toUpperCase()) return true;

  // 3. Khớp phần nội dung sau tiền tố A. B. C. D.
  const sText = s.replace(/^[A-D][\.\:\s]+/, "").trim();
  const aText = a.replace(/^[A-D][\.\:\s]+/, "").trim();
  if (sText && aText && sText === aText) return true;

  return false;
}

function mapExerciseToComprehensive(ex: GrammarExerciseItem, index: number): ComprehensiveQuestion {
  let typeLabel = "Trắc nghiệm ngữ pháp";
  if (ex.mode === "choose_correct") typeLabel = "Chọn câu đúng";
  else if (ex.mode === "fill_blank") typeLabel = "Điền từ vào câu";
  else if (ex.mode === "reorder") typeLabel = "Sắp xếp câu";
  else if (ex.mode === "correct_mistake") typeLabel = "Sửa câu sai";
  else if (ex.mode === "listen_dialogue") typeLabel = "Nghe hiểu hội thoại";

  let subPrompt: string | undefined = undefined;
  if (ex.wrongSentence) {
    subPrompt = `Câu sai cần sửa: ${ex.wrongSentence}`;
  } else if (ex.sentence) {
    subPrompt = ex.sentence;
  }

  let hanziToSpeak: string | undefined = undefined;
  if (ex.audioText) {
    hanziToSpeak = ex.audioText;
  } else if (ex.dialogueLines && ex.dialogueLines.length > 0) {
    hanziToSpeak = ex.dialogueLines.map((d) => d.zh).join(" ");
  } else if (ex.wrongSentence) {
    hanziToSpeak = ex.wrongSentence;
  } else if (ex.sentence) {
    hanziToSpeak = ex.sentence;
  }

  let options: string[] = [];
  let correctAnswer = ex.correctAnswer || "";

  if (Array.isArray(ex.options) && ex.options.length > 0) {
    options = [...ex.options];
  } else if (ex.mode === "reorder" && Array.isArray(ex.scrambledWords) && ex.scrambledWords.length > 0) {
    const correctStr = (ex.correctAnswer || ex.scrambledWords.join("")).trim();
    const words = [...ex.scrambledWords];
    const distractors = new Set<string>();

    for (let attempt = 0; attempt < 30 && distractors.size < 3; attempt++) {
      const shuffled = [...words].sort(() => 0.5 - Math.random()).join("");
      if (shuffled !== correctStr && shuffled.length > 0) {
        distractors.add(shuffled);
      }
    }
    if (distractors.size < 3) {
      const rev = [...words].reverse().join("");
      if (rev !== correctStr) distractors.add(rev);
    }
    if (distractors.size < 3 && words.length > 1) {
      const rot = [...words.slice(1), words[0]].join("");
      if (rot !== correctStr) distractors.add(rot);
    }
    const distractorList = Array.from(distractors).slice(0, 3);
    const all = [correctStr, ...distractorList].sort(() => 0.5 - Math.random());
    options = all.map((str, i) => `${String.fromCharCode(65 + i)}. ${str}`);
    const correctIdx = all.indexOf(correctStr);
    correctAnswer = String.fromCharCode(65 + correctIdx);
  }

  return {
    id: ex.id || `admin-ex-${index}`,
    type: ex.mode,
    typeLabel,
    grammarRule: ex.grammarRule,
    prompt: ex.prompt,
    subPrompt,
    hanziToSpeak,
    options,
    correctAnswer,
    explanation:
      ex.explanation ||
      (ex.grammarRule
        ? `Điểm ngữ pháp liên quan: ${ex.grammarRule}`
        : "Xem lại cấu trúc bài học để chọn đáp án chính xác."),
    dialogueLines: ex.dialogueLines,
  };
}

export default function ComprehensivePracticeSuite({
  lessonTitleZh = "Bài học HSK",
  lessonNumber = 1,
  handleSpeak,
  studentId,
  customExercises,
  isLoading = false,
}: ComprehensivePracticeSuiteProps) {
  // Ghi nhận thời gian luyện tập thực tế
  const [studySeconds, setStudySeconds] = useState(0);

  useEffect(() => {
    setStudySeconds(getTodayStudySeconds(studentId));
    const timer = setInterval(() => {
      recordStudyTime(3, studentId);
      setStudySeconds((prev) => prev + 3);
    }, 3000);
    return () => clearInterval(timer);
  }, [studentId]);

  // Seed ngẫu nhiên: mỗi lần F5 hoặc người dùng bấm "Đổi 10 câu" / "Làm lại" sẽ rút 10 câu mới
  const [randomSeed, setRandomSeed] = useState(0);

  // Tạo bộ 10 câu hỏi ngẫu nhiên từ kho bài tập của Admin
  const questions: ComprehensiveQuestion[] = useMemo(() => {
    if (!Array.isArray(customExercises) || customExercises.length === 0) {
      // Nếu bài học chưa có câu hỏi trong kho admin: KHÔNG hiển thị câu hỏi mặc định nào
      return [];
    }

    // Xáo trộn ngẫu nhiên toàn bộ kho câu hỏi của bài từ admin
    const pool = [...customExercises];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Lấy tối đa 10 câu ngẫu nhiên từ kho
    const selected = pool.slice(0, 10);
    return selected.map((ex, idx) => mapExerciseToComprehensive(ex, idx));
  }, [customExercises, randomSeed]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIdx];

  const handleSelectOption = (opt: string) => {
    if (isAnswered || !currentQ) return;
    setSelectedOpt(opt);
    setIsAnswered(true);

    if (isOptionCorrect(opt, currentQ.correctAnswer)) {
      setScore((s) => s + 10);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = useCallback(() => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setRandomSeed((s) => s + 1); // Rút 10 câu hỏi ngẫu nhiên mới từ kho
  }, []);

  const handleShuffleNew = useCallback(() => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setRandomSeed((s) => s + 1); // Rút 10 câu hỏi ngẫu nhiên mới từ kho
  }, []);

  // Trạng thái đang tải kho giáo trình từ server
  if (isLoading) {
    return (
      <div className="py-14 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#E5DEC9] space-y-3 max-w-xl mx-auto animate-fadeIn">
        <Loader2 className="w-6 h-6 animate-spin text-[#204434] mx-auto" />
        <p className="text-xs text-[#315E48] font-medium">Đang tải câu hỏi từ kho giáo trình của Quản trị viên...</p>
      </div>
    );
  }

  // Nếu kho giáo trình của bài này không có câu hỏi: Bỏ hoàn toàn các câu mặc định
  if (questions.length === 0) {
    return (
      <div className="py-14 px-6 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#E5DEC9] space-y-4 max-w-xl mx-auto animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#8F6D3B] flex items-center justify-center mx-auto shadow-xs">
          <Layers className="w-7 h-7 text-[#BC9B6B]" />
        </div>
        <div className="space-y-1.5">
          <h4 className="font-serif font-bold text-lg text-[#204434]">
            Chưa có câu hỏi ôn tập trong kho giáo trình
          </h4>
          <p className="text-xs text-[#6B766D] leading-relaxed max-w-md mx-auto">
            Bài {String(lessonNumber).padStart(2, "0")} ({lessonTitleZh}) hiện chưa có câu hỏi trong ngân hàng bài tập của Quản trị viên.
          </p>
          <p className="text-[11px] text-[#8F6D3B]">
            Vui lòng chọn bài học khác đã có bài tập hoặc liên hệ Giáo viên / Quản trị viên để cập nhật đề.
          </p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const maxScore = questions.length * 10;
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/60 shadow-sm text-center space-y-5 max-w-xl mx-auto animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-md">
          <Trophy className="w-8 h-8 text-emerald-700" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B]">
            Hoàn thành Ôn tập Tổng hợp
          </span>
          <h3 className="font-serif font-bold text-2xl text-[#204434]">
            Kết quả: {score} / {maxScore} điểm ({percentage}%)
          </h3>
          <p className="text-xs text-[#315E48] leading-relaxed">
            {percentage >= 80
              ? "Xuất sắc! Bạn đã vượt qua xuất sắc các câu hỏi từ kho giáo trình!"
              : "Khá tốt! Hãy ôn lại các câu hỏi chưa đúng và thử làm lại với 10 câu ngẫu nhiên mới nhé."}
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={handleRestart}
            className="px-6 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-xs shadow-xs inline-flex items-center gap-2 cursor-pointer transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Luyện 10 câu mới</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DEC9] shadow-sm space-y-6 max-w-2xl mx-auto animate-fadeIn">
      {/* Header Tiến độ & Điểm số */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/80 text-xs gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-serif font-bold text-[#8F6D3B]">
            Bài {String(lessonNumber).padStart(2, "0")} · {lessonTitleZh}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] font-bold text-[#204434]">
            Câu {currentIdx + 1} / {questions.length}
          </span>
          {customExercises && customExercises.length > 10 && (
            <span className="text-[10px] text-[#6B766D] hidden sm:inline">
              (Rút ngẫu nhiên từ kho {customExercises.length} câu)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {customExercises && customExercises.length > 10 && (
            <button
              type="button"
              onClick={handleShuffleNew}
              className="px-2.5 py-1 rounded-xl border border-[#BC9B6B]/50 hover:bg-[#FAF7F0] text-[#8F6D3B] text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              title="Rút ngẫu nhiên 10 câu hỏi khác trong kho đề"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Đổi 10 câu</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 font-bold text-[#8F6D3B] ml-1">
            <Award className="w-4 h-4 text-[#BC9B6B]" />
            <span>{score} điểm</span>
          </div>
        </div>
      </div>

      {/* Thanh tiến độ */}
      <div className="w-full h-1.5 rounded-full bg-[#FAF7F0] overflow-hidden border border-[#E5DEC9]">
        <div
          className="h-full bg-[#204434] transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Câu hỏi */}
      <div className="space-y-3 py-2 text-left">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#8F6D3B] border border-[#E5DEC9]">
              {currentQ.typeLabel}
            </span>
            {currentQ.grammarRule && (
              <span className="text-[10px] text-[#6B766D] px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9]/80 truncate max-w-xs">
                {currentQ.grammarRule}
              </span>
            )}
          </div>

          {currentQ.hanziToSpeak && (
            <button
              type="button"
              onClick={() => handleSpeak(currentQ.hanziToSpeak!)}
              className="p-1.5 rounded-xl border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] transition cursor-pointer"
              title="Nghe phát âm"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <h4 className="font-serif font-bold text-base sm:text-lg text-[#204434] leading-relaxed">
          {currentQ.prompt}
        </h4>

        {/* Đoạn hội thoại nếu là dạng nghe hiểu */}
        {currentQ.dialogueLines && currentQ.dialogueLines.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E5DEC9]">
              <span className="text-[11px] font-bold text-[#8F6D3B] flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5" /> Đoạn hội thoại:
              </span>
              {currentQ.hanziToSpeak && (
                <button
                  type="button"
                  onClick={() => handleSpeak(currentQ.hanziToSpeak!)}
                  className="px-2.5 py-1 rounded-xl bg-[#204434] text-white hover:bg-[#183629] text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Nghe phát âm toàn bộ hội thoại"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe hội thoại</span>
                </button>
              )}
            </div>
            <div className="space-y-1.5 text-xs text-[#204434]">
              {currentQ.dialogueLines.map((d, dIdx) => (
                <div key={dIdx} className="flex items-start gap-2">
                  <strong className="text-[#8F6D3B] shrink-0">{d.speaker}:</strong>
                  <div>
                    <span className="font-serif font-medium">{d.zh}</span>
                    {d.pinyin && <span className="text-[#6B766D] text-[11px] ml-1.5 font-sans">({d.pinyin})</span>}
                    {d.vi && <p className="text-[11px] text-[#6B766D]">{d.vi}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Câu sai cần sửa hoặc câu mẫu */}
        {currentQ.subPrompt && !currentQ.dialogueLines && (
          <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 font-serif text-base text-[#204434] font-medium tracking-wide">
            {currentQ.subPrompt}
          </div>
        )}
      </div>

      {/* 4 Lựa chọn trả lời */}
      <div className="grid grid-cols-1 gap-2.5">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOpt === opt;
          const isThisOptionCorrect = isOptionCorrect(opt, currentQ.correctAnswer);
          let btnStyle =
            "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] hover:border-[#BC9B6B]";

          if (isAnswered) {
            if (isThisOptionCorrect) {
              btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-200";
            } else if (isSelected) {
              btnStyle = "bg-rose-50 border-rose-500 text-rose-900 font-bold ring-2 ring-rose-200";
            } else {
              btnStyle = "bg-gray-50 border-[#E5DEC9] text-gray-400 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt)}
              className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition cursor-pointer flex items-center justify-between shadow-2xs ${btnStyle}`}
            >
              <span>{opt}</span>
              {isAnswered && isThisOptionCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
              )}
              {isAnswered && isSelected && !isThisOptionCorrect && (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Giải thích sau khi trả lời */}
      {isAnswered && (
        <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/50 text-xs text-[#204434] space-y-1.5 text-left animate-fadeIn">
          <span className="font-bold text-[#8F6D3B] flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Giải thích chi tiết:
          </span>
          <p className="leading-relaxed">{currentQ.explanation}</p>
        </div>
      )}

      {/* Nút Chuyển câu tiếp theo */}
      {isAnswered && (
        <div className="pt-2 flex justify-end animate-fadeIn">
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>{currentIdx + 1 === questions.length ? "Xem tổng kết" : "Câu tiếp theo"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
