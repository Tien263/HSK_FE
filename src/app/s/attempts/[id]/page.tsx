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
        <div className="min-h-screen bg-[#f2f7f3] text-[#1e2e22] flex items-center justify-center font-medium">
          Đang tải đề thi...
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
    fetch(`/api/v1/assignments/cmve587zg001ducdsxrqifbgn/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "student" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.questions) {
          setQuestions(data.questions);
          setAssignmentTitle(data.assignment?.title || "Bài tập kiểm tra HSK 1");
          setSecondsRemaining((data.assignment?.durationMin || 20) * 60);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [attemptId]);

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
        `Em mới trả lời ${answeredCount}/${questions.length} câu. Em có chắc chắn muốn nộp bài sớm không?`
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
      <div className="min-h-screen bg-[#f2f7f3] text-[#1e2e22] flex items-center justify-center text-sm font-medium">
        Đang nạp đề bài thi...
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#f2f7f3] text-[#1e2e22] flex flex-col justify-between font-sans">
      {/* Top Header matching Hanyu design */}
      <header className="h-20 bg-white border-b border-[#e3ece5] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/s/home" className="w-10 h-10 rounded-2xl bg-[#eaf4ed] flex items-center justify-center text-xl shadow-sm">
            🐼
          </Link>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#256f3a] uppercase block">
              PHÒNG LÀM BÀI HỌC SINH
            </span>
            <h1 className="text-sm sm:text-base font-bold text-[#154625] truncate max-w-sm sm:max-w-md">
              {assignmentTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#dcfce7] px-4 py-2 rounded-xl text-sm font-mono font-bold text-[#256f3a] shadow-xs">
            <Clock className="w-4 h-4 text-[#256f3a]" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-[#256f3a] text-white font-bold text-xs hover:bg-[#1a552b] transition shadow-md shadow-emerald-950/10 cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{submitting ? "Đang nộp..." : "Nộp bài"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-8 w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Question Nav Drawer */}
          <div className="md:col-span-4 bg-white border border-[#e3ece5] rounded-2xl p-5 order-2 md:order-1 shadow-xs">
            <h3 className="text-xs font-bold text-[#657d6b] uppercase tracking-wider mb-4">
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
                        ? "bg-[#256f3a] text-white shadow-md ring-2 ring-emerald-200"
                        : isAnswered
                        ? "bg-[#eaf7ee] text-[#256f3a] border border-[#bfe4ca]"
                        : "bg-[#f8faf8] text-[#526857] border border-[#e2ece4] hover:bg-[#ebf4ee]"
                    }`}
                  >
                    <span>{idx + 1}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-[#edf3ee] text-[11px] text-[#657d6b] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#256f3a]" />
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#eaf7ee] border border-[#bfe4ca]" />
                <span>Đã trả lời</span>
              </div>
            </div>
          </div>

          {/* Question Body */}
          <div className="md:col-span-8 bg-white border border-[#e3ece5] rounded-3xl p-6 sm:p-8 shadow-xs order-1 md:order-2">
            {currentQ && (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#edf3ee] mb-6">
                  <span className="text-xs font-mono font-bold text-[#256f3a] bg-[#eaf7ee] px-3 py-1 rounded-full">
                    CÂU {currentIndex + 1} / {questions.length}
                  </span>
                  <span className="text-xs text-[#657d6b]">+{currentQ.points} điểm</span>
                </div>

                <div className="mb-6">
                  {currentQ.pinyinPrompt && (
                    <div className="text-sm font-mono text-[#256f3a] mb-1 font-semibold">
                      {currentQ.pinyinPrompt}
                    </div>
                  )}
                  <h2 className="text-lg sm:text-xl font-bold text-[#154625] leading-relaxed">
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
                            ? "bg-[#eaf7ee] border-[#256f3a] text-[#154625] shadow-xs"
                            : "bg-[#fcfdfc] border-[#e2ece4] text-[#3e5644] hover:bg-[#f3f7f4] hover:border-[#b0c7b6]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-[#256f3a] text-white"
                                : "bg-[#edf3ee] text-[#556959]"
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="font-medium text-base text-[#154625]">{opt.text}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-[#256f3a]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-[#edf3ee]">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-5 py-2.5 rounded-xl border border-[#dae6dc] text-xs font-semibold text-[#48634f] hover:bg-[#f3f7f4] disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Câu trước</span>
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="px-6 py-2.5 rounded-xl bg-[#256f3a] text-white text-xs font-bold hover:bg-[#1a552b] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Câu tiếp theo</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2.5 rounded-xl bg-[#256f3a] text-white text-xs font-bold hover:bg-[#1a552b] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
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

      {/* Footer */}
      <footer className="text-center text-xs text-[#7b9381] py-4 bg-white border-t border-[#e3ece5]">
        Lớp tiếng Trung cô Ning Ning · Bài tập HSK 3.0 tự động chấm điểm
      </footer>
    </div>
  );
}
