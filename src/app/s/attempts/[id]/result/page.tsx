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
        <div className="min-h-screen bg-[#f2f7f3] text-[#1e2e22] flex items-center justify-center font-medium">
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
      <div className="min-h-screen bg-[#f2f7f3] text-[#1e2e22] flex items-center justify-center text-sm font-medium">
        Đang nạp bảng kết quả bài làm...
      </div>
    );
  }

  const correctCount = data?.answers.filter((a) => a.isCorrect).length || 0;
  const totalCount = data?.answers.length || 0;
  const isPassed = (data?.score || 0) >= 60;

  return (
    <div className="min-h-screen bg-[#f2f7f3] text-[#1e2e22] flex flex-col justify-between p-6 font-sans">
      <main className="max-w-4xl mx-auto w-full my-6 space-y-8">
        {/* Score Banner (Soft Mint theme) */}
        <div className="rounded-3xl bg-white border border-[#d6e8db] p-8 sm:p-10 text-center shadow-xs relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#eaf7ee] border border-[#bfe4ca] text-xs font-semibold text-[#256f3a] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KẾT QUẢ BÀI LÀM ĐÃ CHẤM TỰ ĐỘNG</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#154625] mb-2">
            {data?.assignmentTitle || "Bài tập kiểm tra"}
          </h1>

          {/* Big Score Display */}
          <div className="my-6">
            <div className="text-6xl sm:text-7xl font-black text-[#256f3a] tracking-tight">
              {data?.score ?? 0}
              <span className="text-2xl text-[#657d6b] font-normal">/{data?.maxScore ?? 100}</span>
            </div>
            <p className="text-sm text-[#48634f] mt-2 font-medium">
              Đúng {correctCount}/{totalCount} câu hỏi · {isPassed ? "Đạt chuẩn xuất sắc! 🎉" : "Cần ôn tập thêm một chút nhé!"}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-[#edf3ee]">
            <Link
              href="/s/home"
              className="px-6 py-3 rounded-xl bg-[#256f3a] text-white font-bold text-xs hover:bg-[#1a552b] transition shadow-md shadow-emerald-950/10 flex items-center gap-2"
            >
              <Home className="w-4 h-4 stroke-[2.5]" />
              <span>Về phòng học</span>
            </Link>

            {correctCount < totalCount && (
              <Link
                href="/s/practice/wrong"
                className="px-6 py-3 rounded-xl bg-[#fff7ed] border border-[#fed7aa] text-orange-700 font-bold text-xs hover:bg-orange-100 transition flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>Luyện lại các câu sai ngay</span>
              </Link>
            )}
          </div>
        </div>

        {/* Detailed Review for Each Question */}
        <div className="bg-white border border-[#e3ece5] rounded-3xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-[#154625] mb-6 pb-4 border-b border-[#edf3ee]">
            Chi tiết từng câu hỏi & Lời giải từ cô Ning Ning
          </h2>

          <div className="space-y-6">
            {data?.answers.map((item, idx) => (
              <div
                key={item.questionId}
                className={`p-5 rounded-2xl border transition ${
                  item.isCorrect
                    ? "bg-[#f8fcf9] border-[#c4e3cf]"
                    : "bg-[#fffaf8] border-[#fed7aa]"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#256f3a] bg-[#eaf7ee] px-2.5 py-0.5 rounded">
                      Câu {idx + 1}
                    </span>
                    {item.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đúng (+{item.scoreEarned}đ)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Chưa đúng (0đ)</span>
                      </span>
                    )}
                  </div>
                </div>

                {item.pinyinPrompt && (
                  <div className="text-xs font-mono text-[#256f3a] mb-1 font-semibold">
                    {item.pinyinPrompt}
                  </div>
                )}
                <h3 className="text-sm sm:text-base font-bold text-[#154625] mb-4">
                  {item.content}
                </h3>

                {/* Answers Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                  <div className="p-3 rounded-xl bg-white border border-[#e2ece4]">
                    <span className="text-[#657d6b] block mb-1">Đáp án em đã chọn:</span>
                    <strong className={item.isCorrect ? "text-emerald-700 font-mono" : "text-red-700 font-mono"}>
                      {item.userAnswer || "Chưa trả lời"}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#bfe4ca]">
                    <span className="text-[#657d6b] block mb-1">Đáp án đúng chuẩn:</span>
                    <strong className="text-emerald-700 font-mono">
                      {item.correctAnswer}
                    </strong>
                  </div>
                </div>

                {/* Explanation */}
                {item.explanation && (
                  <div className="p-3.5 rounded-xl bg-[#eaf7ee] border border-[#bfe4ca] text-xs text-[#1a552b] leading-relaxed">
                    <strong className="text-[#154625] font-semibold block mb-0.5">
                      💡 Cô Ning Ning giải thích:
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
      <footer className="text-center text-xs text-[#7b9381] py-4">
        © 2026 Lớp tiếng Trung cô Ning Ning · Hệ thống học tập nội bộ
      </footer>
    </div>
  );
}
