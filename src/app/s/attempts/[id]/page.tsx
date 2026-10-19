"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Clock, CheckCircle2, ArrowRight, ArrowLeft, Send, AlertCircle, Sparkles } from "lucide-react";

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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f4ee] text-[#1a3d2f] flex items-center justify-center font-medium">
          Đang nạp đề kiểm tra...
        </div>
      }
    >
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
    if (!attemptId) return;

    fetch(`/api/v1/attempts/${attemptId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.questions) {
          setQuestions(data.questions);
          setAssignmentTitle(data.assignment?.title || "Bài tập kiểm tra HSK");
          setSecondsRemaining((data.assignment?.durationMin || 20) * 60);
          if (data.status === "GRADED" || data.status === "SUBMITTED") {
            router.push(`/s/attempts/${attemptId}/result`);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [attemptId, router]);

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
      !confirm(
        `Bạn mới trả lời ${answeredCount}/${questions.length} câu. Bạn có chắc chắn muốn nộp bài sớm không?`
      )
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
      <div className="min-h-screen bg-[#f7f4ee] text-[#1a3d2f] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-xl bg-[#991b1b] text-white flex items-center justify-center font-serif text-xl mb-3 animate-pulse">
          考
        </div>
        <p className="text-sm font-bold">Đang nạp đề bài thi...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1a3d2f] flex flex-col justify-between font-sans">
      {/* Top Header matching Hanyu design */}
      <header className="h-18 bg-[#fcfaf7] border-b border-[#e6decb] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/s/home" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#991b1b] text-white flex items-center justify-center font-serif text-sm font-bold shadow-xs">
              汉语
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8c9a8f] block">
                Phòng thi HSK 🍃
              </span>
              <h1 className="text-sm sm:text-base font-bold text-[#1a3d2f] truncate max-w-sm sm:max-w-md font-serif">
                {assignmentTitle}
              </h1>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-2 bg-[#f0eee6] border border-[#d8ceb9] px-3.5 py-1.5 rounded-xl text-sm font-mono font-bold text-[#1a3d2f]">
            <Clock className="w-4 h-4 text-[#3d7b56]" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-[#1a3d2f] text-white font-bold text-xs hover:bg-[#122b21] transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? "Đang nộp..." : "Nộp bài"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Question Nav Drawer */}
          <div className="md:col-span-4 bg-[#fcfaf7] border border-[#e6decb] rounded-2xl p-5 order-2 md:order-1 shadow-xs">
            <h3 className="text-xs font-bold text-[#8c9a8f] uppercase tracking-wider mb-4">
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
                    className={`h-10 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? "bg-[#1a3d2f] text-white shadow-xs"
                        : isAnswered
                        ? "bg-[#e2ebe4] text-[#1a3d2f] border border-[#a4c5ae]"
                        : "bg-[#f7f4ee] text-[#526056] border border-[#e6decb] hover:bg-[#ede7da]"
                    }`}
                  >
                    <span>{idx + 1}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-[#e6decb] text-[11px] text-[#526056] space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-[#1a3d2f]" />
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-[#e2ebe4] border border-[#a4c5ae]" />
                <span>Đã làm ({Object.keys(answers).length}/{questions.length})</span>
              </div>
            </div>
          </div>

          {/* Question Body */}
          <div className="md:col-span-8 bg-[#fcfaf7] border border-[#e6decb] rounded-3xl p-6 sm:p-8 shadow-xs order-1 md:order-2">
            {currentQ && (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#e6decb] mb-6">
                  <span className="text-xs font-bold text-[#1a3d2f] bg-[#f0eee6] px-3 py-1 rounded-full border border-[#d8ceb9]">
                    CÂU {currentIndex + 1} / {questions.length}
                  </span>
                  <span className="text-xs text-[#8c9a8f]">+{currentQ.points} điểm</span>
                </div>

                <div className="mb-6">
                  {currentQ.pinyinPrompt && (
                    <div className="text-sm font-mono text-[#3d7b56] mb-1 font-semibold">
                      {currentQ.pinyinPrompt}
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-[#1a3d2f] leading-relaxed font-serif">
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
                            ? "bg-[#e2ebe4] border-[#1a3d2f] text-[#1a3d2f] font-semibold shadow-xs"
                            : "bg-[#f7f4ee] border-[#e6decb] text-[#526056] hover:bg-[#ede7da]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-[#1a3d2f] text-white"
                                : "bg-[#f0eee6] text-[#1a3d2f] border border-[#d8ceb9]"
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="font-medium text-base">{opt.text}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-[#3d7b56]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-[#e6decb]">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 rounded-xl border border-[#e6decb] text-xs font-semibold text-[#526056] hover:bg-[#ede7da] disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Câu trước</span>
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="px-5 py-2 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Câu tiếp theo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="px-5 py-2 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Nộp bài ngay</span>
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#8c9a8f] py-4 bg-[#fcfaf7] border-t border-[#e6decb]">
        Hệ thống phòng thi HSK trực tuyến · HSK Hanyu 🍃
      </footer>
    </div>
  );
}
