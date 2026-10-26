"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";

interface ComprehensivePracticeSuiteProps {
  vocabList: any[];
  grammarList: any[];
  lessonTitleZh?: string;
  lessonNumber?: number;
  handleSpeak: (text: string) => void;
}

interface ComprehensiveQuestion {
  id: string;
  type: "VOCAB_MEANING" | "FILL_BLANK" | "GRAMMAR_CHECK";
  prompt: string;
  subPrompt?: string;
  hanziToSpeak?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function ComprehensivePracticeSuite({
  vocabList,
  grammarList,
  lessonTitleZh = "Bài học HSK",
  lessonNumber = 1,
  handleSpeak,
}: ComprehensivePracticeSuiteProps) {
  // Tạo bộ câu hỏi tổng hợp từ từ vựng và ngữ pháp
  const questions: ComprehensiveQuestion[] = useMemo(() => {
    const list: ComprehensiveQuestion[] = [];

    // 1. Tạo câu hỏi từ vựng (Chọn nghĩa đúng)
    vocabList.slice(0, 5).forEach((v, idx) => {
      const correct = v.meaningVi || v.meaning || "";
      const others = vocabList
        .filter((item) => (item.meaningVi || item.meaning) !== correct)
        .map((item) => item.meaningVi || item.meaning);
      const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
      const allOptions = [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());

      list.push({
        id: `vocab-${idx}-${v.hanzi}`,
        type: "VOCAB_MEANING",
        prompt: `Nghĩa chính xác của từ vựng "${v.hanzi}" (${v.pinyin}) là gì?`,
        hanziToSpeak: v.hanzi,
        options: allOptions,
        correctAnswer: correct,
        explanation: `Từ "${v.hanzi}" (${v.pinyin}) có nghĩa là "${correct}". ${
          v.exampleZh ? `Ví dụ: ${v.exampleZh} (${v.exampleVi})` : ""
        }`,
      });
    });

    // 2. Tạo câu hỏi điền từ vào chỗ trống
    vocabList.slice(0, 4).forEach((v, idx) => {
      if (v.exampleZh && v.exampleZh.includes(v.hanzi)) {
        const sentenceWithBlank = v.exampleZh.replace(v.hanzi, "______");
        const correct = v.hanzi;
        const others = vocabList.filter((item) => item.hanzi !== correct).map((item) => item.hanzi);
        const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
        const allOptions = [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());

        list.push({
          id: `fill-${idx}-${v.hanzi}`,
          type: "FILL_BLANK",
          prompt: "Chọn từ thích hợp nhất để điền vào chỗ trống:",
          subPrompt: sentenceWithBlank,
          hanziToSpeak: v.exampleZh,
          options: allOptions,
          correctAnswer: correct,
          explanation: `Câu hoàn chỉnh: "${v.exampleZh}" - Dịch: ${v.exampleVi || ""}`,
        });
      }
    });

    // 3. Tạo câu hỏi ngữ pháp
    grammarList.slice(0, 3).forEach((g, idx) => {
      const gTitle = g.titleZh || g.title || g.name || `Ngữ pháp #${idx + 1}`;
      const gMeaning = g.meaningVi || g.explanation || g.usage || "";
      const distractor1 = "Chỉ dùng để biểu thị thì quá khứ phủ định hoàn thành";
      const distractor2 = "Chỉ đứng cuối câu cảm thán biểu thị sự ngạc nhiên";
      const distractor3 = "Đứng trước danh từ làm lượng từ đo lường";

      const allOptions = [
        gMeaning || "Dùng để biểu đạt ý nghĩa theo cấu trúc bài học",
        distractor1,
        distractor2,
        distractor3,
      ].sort(() => 0.5 - Math.random());

      list.push({
        id: `grammar-${idx}`,
        type: "GRAMMAR_CHECK",
        prompt: `Cấu trúc điểm ngữ pháp "${gTitle}" được sử dụng như thế nào?`,
        subPrompt: g.structure ? `Cấu trúc: ${g.structure}` : undefined,
        hanziToSpeak: gTitle,
        options: allOptions,
        correctAnswer: gMeaning || allOptions[0],
        explanation: `Điểm ngữ pháp "${gTitle}": ${gMeaning}. ${
          g.exampleZh ? `Ví dụ minh họa: ${g.exampleZh}` : ""
        }`,
      });
    });

    return list.slice(0, 10);
  }, [vocabList, grammarList]);

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

    if (opt === currentQ.correctAnswer) {
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

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (questions.length === 0) {
    return (
      <div className="py-12 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#E5DEC9] space-y-2">
        <p className="text-xs text-[#315E48]">Bài học này chưa đủ dữ liệu để tạo bài ôn tập tổng hợp.</p>
        <p className="text-[11px] text-[#8F6D3B]">Vui lòng luyện tập trước ở tab Luyện từ vựng hoặc Luyện ngữ pháp.</p>
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
              ? "Xuất sắc! Bạn đã nắm rất vững cả từ vựng và ngữ pháp của bài học này!"
              : "Khá tốt! Hãy ôn lại các từ chưa nhớ hoặc câu hỏi sai để đạt điểm tối đa nhé."}
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={handleRestart}
            className="px-6 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-xs shadow-xs inline-flex items-center gap-2 cursor-pointer transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Luyện tập lại</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DEC9] shadow-sm space-y-6 max-w-2xl mx-auto animate-fadeIn">
      {/* Header Tiến độ & Điểm số */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-[#8F6D3B]">
            Bài {String(lessonNumber).padStart(2, "0")} · {lessonTitleZh}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] font-bold text-[#204434]">
            Câu {currentIdx + 1} / {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-[#8F6D3B]">
          <Award className="w-4 h-4 text-[#BC9B6B]" />
          <span>{score} điểm</span>
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
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#8F6D3B] border border-[#E5DEC9]">
            {currentQ.type === "VOCAB_MEANING"
              ? "Trắc nghiệm từ vựng"
              : currentQ.type === "FILL_BLANK"
              ? "Điền từ vào câu"
              : "Cấu trúc ngữ pháp"}
          </span>

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

        <h4 className="font-serif font-bold text-base sm:text-lg text-[#204434]">
          {currentQ.prompt}
        </h4>

        {currentQ.subPrompt && (
          <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 font-serif text-lg text-[#204434] font-medium tracking-wide">
            {currentQ.subPrompt}
          </div>
        )}
      </div>

      {/* 4 Lựa chọn trả lời */}
      <div className="grid grid-cols-1 gap-2.5">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOpt === opt;
          const isCorrect = opt === currentQ.correctAnswer;
          let btnStyle =
            "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] hover:border-[#BC9B6B]";

          if (isAnswered) {
            if (isCorrect) {
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
              {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
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
