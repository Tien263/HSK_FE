"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Clock, CheckCircle2, ArrowRight, ArrowLeft, Send, AlertCircle } from "lucide-react";

interface QuestionItem {
  id: string;
  orderIndex: number;
  type: string;
  content: string;
  pinyinPrompt: string | null;
  options: Array<{ id: string; text: string }>;
  points: number;
}

export default function AttemptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#061609] text-white flex items-center justify-center">Đang tải đề thi...</div>}>
      <AttemptInner />
    </Suspense>
  );
}

function AttemptInner() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [secondsRemaining, setSecondsRemaining] = useState(20 * 60);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Tải câu hỏi từ DB thông qua start API hoặc attempt info
    fetch(`/api/v1/assignments/cmve4x0x00003uc2scd0pos8b/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "student" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.questions) {
          setQuestions(data.questions);
          setAssignmentTitle(data.assignment?.title || "Bài tập kiểm tra");
          setSecondsRemaining((data.assignment?.durationMin || 20) * 60);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [attemptId]);

  // Countdown timer
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const selectAnswer = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (
      answeredCount < questions.length &&
      !confirm(`Em mới trả lời ${answeredCount}/${questions.length} câu. Em có chắc chắn muốn nộp bài sớm không?`)
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          durationSec: 20 * 60 - secondsRemaining,
        }),
      });

      const result = await res.json();
      if (result.success) {
        router.push(`/s/attempts/${attemptId}/result`);
      } else {
        alert("Lỗi nộp bài: " + (result.message || "Vui lòng thử lại"));
        setSubmitting(false);
      }
    } catch {
      alert("Không thể kết nối đến máy chủ.");
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#061609] text-white flex items-center justify-center text-sm font-medium">
        Đang nạp đề bài thi...
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#061609] text-white flex flex-col justify-between">
      {/* Header with Title and Countdown Timer */}
      <header className="border-b border-[#234a29] bg-[#0a2012] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#9cb396] block uppercase tracking-wider font-mono">
              ĐANG LÀM BÀI TẬP
            </span>
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md">
              {assignmentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className="flex items-center gap-2 bg-[#14331e] border border-[#2d5c39] px-4 py-2 rounded-xl text-sm font-mono font-bold text-[#c3dc4e]">
              <Clock className="w-4 h-4 text-[#c3dc4e]" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#c3dc4e] text-[#061609] font-bold text-xs hover:bg-[#b3cb40] transition shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{submitting ? "Đang nộp..." : "Nộp bài"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Question Interface */}
      <main className="max-w-5xl mx-auto px-6 py-8 w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Question Nav Drawer (Desktop 4 cols) */}
          <div className="md:col-span-4 bg-[#0a2012] border border-[#234a29] rounded-2xl p-5 order-2 md:order-1">
            <h3 className="text-xs font-bold text-[#9cb396] uppercase tracking-wider mb-4">
              Danh sách câu hỏi ({questions.length} câu)
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? "bg-[#c3dc4e] text-[#061609] shadow-md ring-2 ring-white/50"
                        : isAnswered
                        ? "bg-[#14331e] text-[#c3dc4e] border border-[#2d5c39]"
                        : "bg-[#061609] text-white/70 border border-[#234a29] hover:border-white/30"
                    }`}
                  >
                    <span>{idx + 1}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-[#1b3d24] text-[11px] text-[#9cb396] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#c3dc4e]" />
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#14331e] border border-[#2d5c39]" />
                <span>Đã trả lời</span>
              </div>
            </div>
          </div>

          {/* Question Body (Desktop 8 cols) */}
          <div className="md:col-span-8 bg-[#0a2012] border border-[#234a29] rounded-3xl p-6 sm:p-8 shadow-xl order-1 md:order-2">
            {currentQ && (
              <div>
                {/* Question Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#234a29]/80 mb-6">
                  <span className="text-xs font-mono font-bold text-[#c3dc4e]">
                    CÂU {currentIndex + 1} / {questions.length}
                  </span>
                  <span className="text-xs text-[#9cb396]">+{currentQ.points} điểm</span>
                </div>

                {/* Prompt */}
                <div className="mb-6">
                  {currentQ.pinyinPrompt && (
                    <div className="text-sm font-mono text-[#c3dc4e] mb-1 font-semibold">
                      {currentQ.pinyinPrompt}
                    </div>
                  )}
                  <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                    {currentQ.content}
                  </h2>
                </div>

                {/* Options List */}
                <div className="space-y-3 mb-8">
                  {currentQ.options.map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => selectAnswer(currentQ.id, opt.id)}
                        className={`w-full p-4 rounded-2xl border text-left text-sm transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-[#14331e] border-[#c3dc4e] text-white shadow-md"
                            : "bg-[#061609] border-[#234a29] text-white/90 hover:border-white/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-[#c3dc4e] text-[#061609]"
                                : "bg-white/10 text-white/80"
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="font-medium text-base">{opt.text}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-[#c3dc4e]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-[#234a29]/80">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-5 py-2.5 rounded-xl border border-white/20 text-xs font-semibold text-white hover:bg-white/5 disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Câu trước</span>
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="px-6 py-2.5 rounded-xl bg-[#c3dc4e] text-[#061609] text-xs font-bold hover:bg-[#b3cb40] transition flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>Câu tiếp theo</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2.5 rounded-xl bg-[#c3dc4e] text-[#061609] text-xs font-bold hover:bg-[#b3cb40] transition flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>Nộp bài ngay</span>
                      <Send className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
