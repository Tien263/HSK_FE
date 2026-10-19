"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Sparkles, BookOpen } from "lucide-react";

interface WrongItem {
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

export default function WrongQuestionsPracticePage() {
  const [items, setItems] = useState<WrongItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [earnedXpTotal, setEarnedXpTotal] = useState(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; isMastered?: boolean; earnedXp?: number } | null>(null);
  const [studentUsername, setStudentUsername] = useState("student");

  useEffect(() => {
    // Đọc thông tin user đăng nhập
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.username) setStudentUsername(u.username);
      }
    } catch {}

    fetch("/api/v1/my/wrong-questions?username=student")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setItems(data.items);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = async (optId: string) => {
    if (isAnswered) return;
    const currentQ = items[currentIndex];
    if (!currentQ) return;

    setSelectedAnswer(optId);
    setIsAnswered(true);

    const isCorrect = optId === currentQ.correctAnswer;

    // Gửi cập nhật trực tiếp lên SQLite Database (Chuẩn BR-07)
    try {
      const res = await fetch("/api/v1/my/wrong-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wrongQuestionId: currentQ.id,
          isCorrect,
          username: studentUsername,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({
          isCorrect,
          isMastered: json.isMastered,
          earnedXp: json.earnedXp,
        });
        if (json.earnedXp) {
          setEarnedXpTotal((prev) => prev + json.earnedXp);
        }

        // Cập nhật state item cục bộ
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === currentIndex
              ? {
                  ...item,
                  consecutiveRight: json.item.consecutiveRight,
                  wrongCount: json.item.wrongCount,
                }
              : item
          )
        );
      }
    } catch (e) {
      console.error("Lỗi cập nhật câu sai:", e);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setFeedback(null);
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f7f3] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-[#dce8e0] flex items-center justify-center text-3xl mb-4 animate-bounce">
          🐼
        </div>
        <p className="text-sm font-semibold text-[#1e293b]">Đang nạp sổ tay câu sai của em...</p>
        <p className="text-xs text-[#64748b] mt-1">Luyện lại câu sai giúp nhớ sâu và khắc phục lỗ hổng kiến thức</p>
      </div>
    );
  }

  const currentQ = items[currentIndex];
  const isCorrect = selectedAnswer === currentQ?.correctAnswer;

  return (
    <div className="min-h-screen bg-[#f2f7f3] text-[#1e293b] flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between py-3 px-4 rounded-2xl bg-white border border-[#dce8e0] shadow-sm">
        <Link
          href="/s/home"
          className="text-xs font-semibold text-[#64748b] hover:text-[#256f3a] transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về bàn học</span>
        </Link>

        <div className="flex items-center gap-3">
          {earnedXpTotal > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#256f3a] bg-[#f0f9f3] px-2.5 py-1 rounded-full border border-[#d2edd8]">
              <Sparkles className="w-3.5 h-3.5 text-[#256f3a]" />
              <span>+{earnedXpTotal} XP</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff7ed] border border-[#ffedd5] text-[11px] font-bold text-[#c2410c]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sổ tay câu sai</span>
          </div>
          <span className="text-xs font-mono font-bold text-[#c2410c]">
            {items.length > 0 ? currentIndex + 1 : 0} / {items.length}
          </span>
        </div>
      </header>

      {/* Main Practice Container */}
      <main className="max-w-2xl mx-auto w-full my-6 flex-1 flex flex-col justify-center">
        {items.length === 0 ? (
          <div className="text-center p-8 sm:p-10 rounded-3xl bg-white border border-[#dce8e0] shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[#fef3c7] text-[#d97706] flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner">
              🌟
            </div>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Không còn câu sai nào!</h2>
            <p className="text-sm text-[#64748b] max-w-md mx-auto mb-6 leading-relaxed">
              Tuyệt vời lắm! Em đã giải quyết xong toàn bộ các câu sai trong sổ tay. Hãy tiếp tục làm bài tập để duy trì phong độ nhé!
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/s/home"
                className="px-6 py-2.5 rounded-xl bg-[#256f3a] text-white font-bold text-xs hover:bg-[#1e5a2e] transition shadow-md shadow-[#256f3a]/20"
              >
                Về bàn học của em
              </Link>
              <Link
                href="/s/review"
                className="px-6 py-2.5 rounded-xl bg-[#f0f9f3] text-[#256f3a] font-bold text-xs hover:bg-[#e2f3e8] border border-[#d2edd8] transition"
              >
                Ôn từ vựng hôm nay
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#dce8e0] rounded-3xl p-6 sm:p-8 shadow-sm">
            {/* Header badges */}
            <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9] mb-5 text-xs text-[#64748b]">
              <span className="flex items-center gap-1.5 text-[#c2410c] font-bold">
                <AlertTriangle className="w-4 h-4" />
                Đã làm sai {currentQ.wrongCount} lần
              </span>
              <span className="text-[11px] bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1 rounded-md font-medium text-[#475569]">
                Đúng liên tiếp: <strong className="text-[#256f3a]">{currentQ.consecutiveRight}/3</strong> lần để gỡ khỏi sổ
              </span>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#256f3a] bg-[#f0f9f3] px-2.5 py-0.5 rounded-md mb-2">
                Câu {currentIndex + 1}
              </span>
              <h2 className="text-xl font-bold text-[#1e293b] mb-1">
                {currentQ.content}
              </h2>
              {currentQ.pinyinPrompt && (
                <p className="text-sm font-mono text-[#64748b]">{currentQ.pinyinPrompt}</p>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt) => {
                let btnStyle = "bg-[#f8faf9] border-[#e2ece5] text-[#1e293b] hover:bg-[#e8f5ec] hover:border-[#bbf0cb]";

                if (isAnswered) {
                  if (opt.id === currentQ.correctAnswer) {
                    btnStyle = "bg-[#ecfdf5] border-[#10b981] text-[#047857] font-semibold";
                  } else if (opt.id === selectedAnswer) {
                    btnStyle = "bg-[#fff1f2] border-[#f43f5e] text-[#e11d48]";
                  } else {
                    btnStyle = "bg-[#f8fafc] border-[#f1f5f9] text-[#94a3b8] opacity-60";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between text-sm transition-all duration-200 ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-white border border-[#dce8e0] text-xs font-bold text-[#475569] flex items-center justify-center shrink-0 shadow-2xs">
                        {opt.id}
                      </span>
                      <span className="font-medium">{opt.text}</span>
                    </div>

                    {isAnswered && opt.id === currentQ.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
                    )}
                    {isAnswered && opt.id === selectedAnswer && opt.id !== currentQ.correctAnswer && (
                      <XCircle className="w-5 h-5 text-[#f43f5e] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Teacher Explanation & Next Action */}
            {isAnswered && (
              <div className="pt-4 border-t border-[#f1f5f9] space-y-4 animate-in fade-in duration-300">
                <div
                  className={`p-4 rounded-2xl text-xs ${
                    isCorrect
                      ? "bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46]"
                      : "bg-[#fff1f2] border border-[#fecdd3] text-[#9f1239]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold flex items-center gap-1.5 text-sm">
                      {isCorrect ? "🎉 Giỏi lắm, em làm đúng rồi!" : "💡 Chưa chính xác rồi em ơi!"}
                    </p>
                    {feedback?.earnedXp && (
                      <span className="font-bold text-xs bg-white/70 px-2 py-0.5 rounded-full">
                        +{feedback.earnedXp} XP đã cộng
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed">
                    {currentQ.explanation ||
                      (isCorrect
                        ? "Em làm đúng câu này rồi. Tiếp tục luyện thêm để tích lũy 3 lần đúng liên tiếp nhé."
                        : `Đáp án đúng là ${currentQ.correctAnswer}. Hãy chú ý cấu trúc và ngữ cảnh của câu nhé!`)}
                  </p>
                  {feedback?.isMastered && (
                    <div className="mt-2 pt-2 border-t border-emerald-300 font-bold text-[#065f46] flex items-center gap-1.5">
                      <span>🏆 Chúc mừng em! Đã đạt 3 lần đúng liên tiếp, câu này được giải quyết thành công!</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  {currentIndex < items.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 rounded-xl bg-[#256f3a] text-white font-bold text-xs hover:bg-[#1e5a2e] transition shadow-md shadow-[#256f3a]/20"
                    >
                      Câu tiếp theo →
                    </button>
                  ) : (
                    <Link
                      href="/s/home"
                      className="px-6 py-2.5 rounded-xl bg-[#256f3a] text-white font-bold text-xs hover:bg-[#1e5a2e] transition shadow-md shadow-[#256f3a]/20"
                    >
                      Hoàn thành buổi luyện tập ✓
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto w-full py-2 text-center text-[11px] text-[#64748b]">
        Sổ tay câu sai thông minh · Tự động gỡ bỏ sau 3 lần trả lời đúng liên tiếp (Chuẩn BR-07)
      </footer>
    </div>
  );
}
