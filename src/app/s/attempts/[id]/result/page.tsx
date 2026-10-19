"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Award, ArrowRight, RotateCcw, Home, Sparkles, BookOpen } from "lucide-react";

interface AnswerDetail {
  questionId: string;
  content: string;
  pinyinPrompt: string | null;
  options: Array<{ id: string; text: string }>;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  scoreEarned: number;
  explanation: string | null;
}

interface ResultData {
  attemptId: string;
  assignmentTitle: string;
  score: number;
  maxScore: number;
  durationSec: number;
  answers: AnswerDetail[];
}

export default function AttemptResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f4ee] text-[#1a3d2f] flex items-center justify-center font-medium">
          Đang nạp kết quả bài làm...
        </div>
      }
    >
      <AttemptResultInner />
    </Suspense>
  );
}

function AttemptResultInner() {
  const params = useParams();
  const attemptId = params?.id as string;
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/attempts/${attemptId}/result`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] text-[#1a3d2f] flex items-center justify-center text-sm font-medium">
        Đang nạp bảng kết quả bài làm...
      </div>
    );
  }

  const correctCount = data?.answers.filter((a) => a.isCorrect).length || 0;
  const totalCount = data?.answers.length || 0;
  const isPassed = (data?.score || 0) >= 60;

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1a3d2f] flex flex-col justify-between p-4 sm:p-6 font-sans">
      <main className="max-w-4xl mx-auto w-full my-6 space-y-6">
        {/* Score Banner (Oriental Ink & Paper theme) */}
        <div className="rounded-3xl bg-[#fcfaf7] border border-[#e6decb] p-8 sm:p-10 text-center shadow-xs relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f0eee6] border border-[#d8ceb9] text-xs font-semibold text-[#1a3d2f] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#3d7b56]" />
            <span>KẾT QUẢ BÀI LÀM ĐÃ CHẤM TỰ ĐỘNG</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a3d2f] mb-2 font-serif">
            {data?.assignmentTitle || "Bài tập kiểm tra HSK"}
          </h1>

          {/* Big Score Display */}
          <div className="my-6">
            <div className="text-6xl sm:text-7xl font-black text-[#1a3d2f] tracking-tight font-serif">
              {data?.score ?? 0}
              <span className="text-2xl text-[#8c9a8f] font-normal">/{data?.maxScore ?? 100}</span>
            </div>
            <p className="text-sm text-[#526056] mt-2 font-medium">
              Đúng {correctCount}/{totalCount} câu hỏi · {isPassed ? "Đạt chuẩn xuất sắc! 🍃" : "Cần ôn tập thêm một chút nhé!"}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-[#e6decb]">
            <Link
              href="/s/home"
              className="px-6 py-2.5 rounded-xl bg-[#1a3d2f] text-white font-bold text-xs hover:bg-[#122b21] transition shadow-xs flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Về bàn học của bạn</span>
            </Link>

            {correctCount < totalCount && (
              <Link
                href="/s/practice/wrong"
                className="px-6 py-2.5 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] font-bold text-xs hover:bg-[#fee2e2] transition flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Luyện lại câu sai trong sổ tay</span>
              </Link>
            )}
          </div>
        </div>

        {/* Detailed Review for Each Question */}
        <div className="bg-[#fcfaf7] border border-[#e6decb] rounded-3xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-[#1a3d2f] mb-6 pb-4 border-b border-[#e6decb] font-serif">
            Chi tiết từng câu hỏi & Lời giải
          </h2>

          <div className="space-y-5">
            {data?.answers.map((item, idx) => (
              <div
                key={item.questionId}
                className={`p-5 rounded-2xl border transition ${
                  item.isCorrect
                    ? "bg-[#f7f9f7] border-[#c2dcd0]"
                    : "bg-[#fffaf9] border-[#fecaca]"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#1a3d2f] bg-[#f0eee6] px-2.5 py-0.5 rounded border border-[#d8ceb9]">
                      Câu {idx + 1}
                    </span>
                    {item.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3d7b56] bg-[#e2ebe4] px-2.5 py-0.5 rounded-full border border-[#a4c5ae]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đúng (+{item.scoreEarned}đ)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#991b1b] bg-[#fef2f2] px-2.5 py-0.5 rounded-full border border-[#fecaca]">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Chưa đúng (0đ)</span>
                      </span>
                    )}
                  </div>
                </div>

                {item.pinyinPrompt && (
                  <div className="text-xs font-mono text-[#3d7b56] mb-1 font-semibold">
                    {item.pinyinPrompt}
                  </div>
                )}
                <h3 className="text-base font-bold text-[#1a3d2f] mb-4 font-serif">
                  {item.content}
                </h3>

                {/* Answers Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                  <div className="p-3 rounded-xl bg-[#fcfaf7] border border-[#e6decb]">
                    <span className="text-[#8c9a8f] block mb-1">Đáp án bạn đã chọn:</span>
                    <strong className={item.isCorrect ? "text-[#3d7b56] font-mono text-sm" : "text-[#991b1b] font-mono text-sm"}>
                      {item.userAnswer || "Chưa trả lời"}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-[#fcfaf7] border border-[#e6decb]">
                    <span className="text-[#8c9a8f] block mb-1">Đáp án chuẩn xác:</span>
                    <strong className="text-[#3d7b56] font-mono text-sm">
                      {item.correctAnswer}
                    </strong>
                  </div>
                </div>

                {/* Explanation */}
                {item.explanation && (
                  <div className="p-3.5 rounded-xl bg-[#f7f4ee] border border-[#e6decb] text-xs text-[#526056] leading-relaxed">
                    <strong className="text-[#1a3d2f] font-semibold block mb-0.5">
                      💡 Giải thích chi tiết:
                    </strong>
                    {item.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#8c9a8f] py-4">
        Hệ thống ôn luyện HSK thông minh · HSK Hanyu 🍃
      </footer>
    </div>
  );
}
