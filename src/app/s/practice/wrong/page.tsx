"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Sparkles, BookOpen, ArrowRight, RotateCcw } from "lucide-react";

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
      <div className="min-h-screen bg-[#f7f4ee] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#991b1b] text-white shadow-md flex items-center justify-center text-2xl font-serif mb-4 animate-bounce">
          错
        </div>
        <p className="text-sm font-bold text-[#1a3d2f]">Đang nạp sổ tay câu sai của bạn...</p>
        <p className="text-xs text-[#526056] mt-1">Luyện lại câu sai giúp nhớ sâu và khắc phục lỗ hổng kiến thức</p>
      </div>
    );
  }

  const currentQ = items[currentIndex];
  const isCorrect = selectedAnswer === currentQ?.correctAnswer;

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1a3d2f] flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between py-3 px-4 rounded-2xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs">
        <Link
          href="/s/home"
          className="text-xs font-semibold text-[#526056] hover:text-[#1a3d2f] transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về bàn học</span>
        </Link>

        {/* Center Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#991b1b] text-white flex items-center justify-center font-serif text-xs font-bold shadow-xs">
            汉语
          </div>
          <span className="text-xs font-bold text-[#1a3d2f] hidden sm:inline">Sổ tay khắc phục câu sai</span>
        </div>

        <div className="flex items-center gap-2.5">
          {earnedXpTotal > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#3d7b56] bg-[#e8f1ec] px-2.5 py-0.5 rounded-full border border-[#cbdcd0]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{earnedXpTotal} XP</span>
            </div>
          )}
          <span className="text-xs font-mono font-bold text-[#991b1b] px-2.5 py-1 rounded-full bg-[#fef2f2] border border-[#fecaca]">
            {items.length > 0 ? currentIndex + 1 : 0} / {items.length}
          </span>
        </div>
      </header>

      {/* Main Practice Container */}
      <main className="max-w-2xl mx-auto w-full my-6 flex-1 flex flex-col justify-center">
        {items.length === 0 ? (
          <div className="text-center p-8 sm:p-10 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#1a3d2f] text-white flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
              ✨
            </div>
            <h2 className="text-2xl font-bold text-[#1a3d2f] mb-2 font-serif">Không còn câu sai nào!</h2>
            <p className="text-sm text-[#526056] max-w-md mx-auto mb-6 leading-relaxed">
              Tuyệt vời lắm! Bạn đã giải quyết xong toàn bộ các câu sai trong sổ tay. Hãy tiếp tục làm bài tập để nâng cao trình độ HSK nhé!
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/s/home"
                className="px-6 py-2.5 rounded-xl bg-[#1a3d2f] text-white font-bold text-xs hover:bg-[#122b21] transition shadow-xs"
              >
                Về bàn học của bạn
              </Link>
              <Link
                href="/s/review"
                className="px-6 py-2.5 rounded-xl bg-[#f0eee6] text-[#1a3d2f] font-bold text-xs hover:bg-[#e4ded0] border border-[#d8ceb9] transition"
              >
                Ôn từ vựng hôm nay
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#fcfaf7] border border-[#e6decb] rounded-3xl p-6 sm:p-8 shadow-xs">
            {/* Header badges */}
            <div className="flex items-center justify-between pb-4 border-b border-[#e6decb] mb-5 text-xs text-[#526056]">
              <span className="flex items-center gap-1.5 text-[#991b1b] font-bold">
                <AlertTriangle className="w-4 h-4" />
                Đã làm sai {currentQ.wrongCount} lần
              </span>
              <span className="text-[11px] bg-[#f0eee6] border border-[#d8ceb9] px-2.5 py-1 rounded-lg font-medium text-[#1a3d2f]">
                Đúng liên tiếp: <strong className="text-[#3d7b56]">{currentQ.consecutiveRight}/3</strong> lần để hoàn thành
              </span>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#1a3d2f] bg-[#f0eee6] px-2.5 py-0.5 rounded-md mb-2 border border-[#d8ceb9]">
                Câu {currentIndex + 1}
              </span>
              <h2 className="text-xl font-bold text-[#1a3d2f] mb-1 font-serif">
                {currentQ.content}
              </h2>
              {currentQ.pinyinPrompt && (
                <p className="text-xs font-mono text-[#3d7b56]">{currentQ.pinyinPrompt}</p>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt) => {
                const isSelected = selectedAnswer === opt.id;
                const isThisCorrect = opt.id === currentQ.correctAnswer;

                let optStyle = "bg-[#f7f4ee] border-[#e6decb] text-[#1a3d2f] hover:bg-[#ede7da]";

                if (isAnswered) {
                  if (isThisCorrect) {
                    optStyle = "bg-[#e2ebe4] border-[#a4c5ae] text-[#1a3d2f] font-semibold";
                  } else if (isSelected && !isThisCorrect) {
                    optStyle = "bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]";
                  } else {
                    optStyle = "bg-[#f7f4ee] border-[#e6decb] text-[#8c9a8f] opacity-60";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${optStyle}`}
                  >
                    <span className="text-sm">{opt.text}</span>
                    {isAnswered && isThisCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-[#3d7b56] shrink-0" />
                    )}
                    {isAnswered && isSelected && !isThisCorrect && (
                      <XCircle className="w-5 h-5 text-[#b91c1c] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box on answered */}
            {isAnswered && (
              <div
                className={`p-4 rounded-2xl mb-6 border transition-all ${
                  isCorrect
                    ? "bg-[#e2ebe4] border-[#a4c5ae]"
                    : "bg-[#fef2f2] border-[#fecaca]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5 font-bold text-xs">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#3d7b56]" />
                      <span className="text-[#1a3d2f]">
                        Chính xác! {feedback?.isMastered ? "🎉 Em đã ghi nhớ xuất sắc!" : "Cố gắng đạt 3 lần đúng liên tiếp nhé."}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-[#b91c1c]" />
                      <span className="text-[#991b1c]">Chưa chính xác! Hãy đọc kỹ giải thích dưới đây:</span>
                    </>
                  )}
                </div>

                {currentQ.explanation && (
                  <p className="text-xs text-[#526056] leading-relaxed mt-2 border-t border-dashed border-[#d8ceb9] pt-2">
                    {currentQ.explanation}
                  </p>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#8c9a8f]">
                {currentIndex + 1} / {items.length} câu trong sổ
              </span>

              {isAnswered && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-[#1a3d2f] text-white font-bold text-xs hover:bg-[#122b21] transition shadow-xs flex items-center gap-1.5"
                >
                  <span>{currentIndex < items.length - 1 ? "Câu tiếp theo" : "Hoàn thành"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="max-w-3xl mx-auto w-full py-2 text-center text-[11px] text-[#8c9a8f]">
        Sổ tay sửa câu sai thông minh · HSK Hanyu 🍃
      </footer>
    </div>
  );
}
