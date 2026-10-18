"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, RotateCcw } from "lucide-react";

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

  useEffect(() => {
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

  const handleSelect = (optId: string) => {
    if (isAnswered) return;
    setSelectedAnswer(optId);
    setIsAnswered(true);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#061609] text-white flex items-center justify-center text-sm font-medium">
        Đang nạp danh sách câu sai của em...
      </div>
    );
  }

  const currentQ = items[currentIndex];
  const isCorrect = selectedAnswer === currentQ?.correctAnswer;

  return (
    <div className="min-h-screen bg-[#061609] text-white flex flex-col justify-between p-6">
      {/* Top Header */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between py-2">
        <Link
          href="/s/home"
          className="text-xs text-[#9cb396] hover:text-white transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về phòng học</span>
        </Link>

        <span className="text-xs font-mono font-bold text-orange-400">
          CÂU SAI CẦN ÔN: {items.length > 0 ? currentIndex + 1 : 0} / {items.length}
        </span>
      </div>

      {/* Main Practice Container */}
      <main className="max-w-2xl mx-auto w-full my-6 flex-1 flex flex-col justify-center">
        {items.length === 0 ? (
          <div className="text-center p-10 rounded-3xl bg-[#0a2012] border border-[#234a29] shadow-2xl">
            <div className="text-5xl mb-4">🌟</div>
            <h2 className="text-2xl font-bold text-white mb-2">Không còn câu sai nào!</h2>
            <p className="text-sm text-[#9cb396] mb-6">
              Xuất sắc lắm! Em đã sửa hết tất cả các câu sai trong các bài tập vừa qua.
            </p>
            <Link
              href="/s/home"
              className="px-6 py-3 rounded-xl bg-[#c3dc4e] text-[#061609] font-bold text-xs inline-flex items-center gap-2 shadow-lg"
            >
              <span>Về phòng học của em</span>
            </Link>
          </div>
        ) : (
          <div className="bg-[#0a2012] border border-[#234a29] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#234a29] mb-5 text-xs text-[#9cb396]">
              <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Đã từng làm sai {currentQ.wrongCount} lần</span>
              </span>
              <span>Đúng liên tiếp: {currentQ.consecutiveRight}/3</span>
            </div>

            {/* Prompt */}
            {currentQ.pinyinPrompt && (
              <div className="text-xs font-mono text-[#c3dc4e] mb-1 font-semibold">
                {currentQ.pinyinPrompt}
              </div>
            )}
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6">
              {currentQ.content}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt) => {
                const isChosen = selectedAnswer === opt.id;
                let btnStyle = "bg-[#061609] border-[#234a29] text-white hover:border-white/30";

                if (isAnswered) {
                  if (opt.id === currentQ.correctAnswer) {
                    btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200";
                  } else if (isChosen) {
                    btnStyle = "bg-red-950/80 border-red-500 text-red-200";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left text-sm transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-white/10 font-bold text-xs flex items-center justify-center">
                        {opt.id}
                      </span>
                      <span className="font-medium text-base">{opt.text}</span>
                    </div>

                    {isAnswered && opt.id === currentQ.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                    {isAnswered && isChosen && opt.id !== currentQ.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback and Explanation */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-[#061609] border border-[#234a29] mb-6 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold">
                  {isCorrect ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Chính xác! Làm đúng thêm để gỡ câu này nhé!</span>
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      <span>Chưa đúng, hãy đọc lời giải phía dưới nhé!</span>
                    </span>
                  )}
                </div>

                {currentQ.explanation && (
                  <p className="text-xs text-white/90 leading-relaxed pt-1">
                    💡 <strong>Cô giải thích:</strong> {currentQ.explanation}
                  </p>
                )}
              </div>
            )}

            {/* Next Button */}
            {isAnswered && (
              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-xl bg-[#c3dc4e] text-[#061609] font-bold text-xs hover:bg-[#b3cb40] transition shadow-lg cursor-pointer"
              >
                {currentIndex < items.length - 1 ? "Câu tiếp theo →" : "Hoàn thành buổi luyện tập"}
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-[#9cb396]/50 py-2">
        Quy tắc BR-07: Làm đúng liên tiếp 3 lần sẽ tự động gỡ khỏi danh sách câu sai
      </footer>
    </div>
  );
}
