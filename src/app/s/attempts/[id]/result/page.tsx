"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Award, ArrowRight, RotateCcw, Home, Sparkles } from "lucide-react";

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
    <Suspense fallback={<div className="min-h-screen bg-[#061609] text-white flex items-center justify-center">Đang nạp kết quả...</div>}>
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
      <div className="min-h-screen bg-[#061609] text-white flex items-center justify-center text-sm font-medium">
        Đang nạp bảng kết quả bài làm...
      </div>
    );
  }

  const correctCount = data?.answers.filter((a) => a.isCorrect).length || 0;
  const totalCount = data?.answers.length || 0;
  const isPassed = (data?.score || 0) >= 60;

  return (
    <div className="min-h-screen bg-[#061609] text-white flex flex-col justify-between p-6">
      <main className="max-w-4xl mx-auto w-full my-6 space-y-8">
        {/* Score Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0d2816] via-[#0a2012] to-[#07190c] border border-[#234a29] p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c3dc4e]/10 border border-[#c3dc4e]/30 text-xs font-semibold text-[#c3dc4e] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KẾT QUẢ BÀI LÀM ĐÃ CHẤM TỰ ĐỘNG</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {data?.assignmentTitle || "Bài kiểm tra"}
          </h1>

          {/* Big Score Display */}
          <div className="my-6">
            <div className="text-6xl sm:text-7xl font-black text-[#c3dc4e] tracking-tight">
              {data?.score ?? 0}
              <span className="text-2xl text-white/50 font-normal">/{data?.maxScore ?? 100}</span>
            </div>
            <p className="text-sm text-[#9cb396] mt-2">
              Đúng {correctCount}/{totalCount} câu hỏi · {isPassed ? "Đạt chuẩn xuất sắc! 🎉" : "Cần ôn tập thêm một chút nhé!"}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-[#1b3d24]">
            <Link
              href="/s/home"
              className="px-6 py-3 rounded-xl bg-[#c3dc4e] text-[#061609] font-bold text-xs hover:bg-[#b3cb40] transition shadow-lg flex items-center gap-2"
            >
              <Home className="w-4 h-4 stroke-[2.5]" />
              <span>Về phòng học</span>
            </Link>

            {correctCount < totalCount && (
              <Link
                href="/s/practice/wrong"
                className="px-6 py-3 rounded-xl bg-orange-600/20 border border-orange-500/50 text-orange-300 font-bold text-xs hover:bg-orange-600/30 transition flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>Luyện lại các câu sai ngay</span>
              </Link>
            )}
          </div>
        </div>

        {/* Detailed Review for Each Question */}
        <div className="bg-[#0a2012] border border-[#234a29] rounded-3xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6 pb-3 border-b border-[#234a29]">
            Chi tiết từng câu hỏi & Lời giải từ cô Ning Ning
          </h2>

          <div className="space-y-6">
            {data?.answers.map((item, idx) => (
              <div
                key={item.questionId}
                className={`p-5 rounded-2xl border transition ${
                  item.isCorrect
                    ? "bg-[#0d2816]/70 border-emerald-800/60"
                    : "bg-red-950/20 border-red-800/60"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#c3dc4e]">
                      Câu {idx + 1}
                    </span>
                    {item.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đúng (+{item.scoreEarned}đ)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-800">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Chưa đúng (0đ)</span>
                      </span>
                    )}
                  </div>
                </div>

                {item.pinyinPrompt && (
                  <div className="text-xs font-mono text-[#c3dc4e] mb-1 font-semibold">
                    {item.pinyinPrompt}
                  </div>
                )}
                <h3 className="text-sm sm:text-base font-bold text-white mb-4">
                  {item.content}
                </h3>

                {/* Answers Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[#9cb396] block mb-1">Đáp án em đã chọn:</span>
                    <strong className={item.isCorrect ? "text-emerald-300 font-mono" : "text-red-300 font-mono"}>
                      {item.userAnswer || "Chưa trả lời"}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-emerald-800/60">
                    <span className="text-[#9cb396] block mb-1">Đáp án đúng chuẩn:</span>
                    <strong className="text-emerald-300 font-mono">
                      {item.correctAnswer}
                    </strong>
                  </div>
                </div>

                {/* Explanation */}
                {item.explanation && (
                  <div className="p-3.5 rounded-xl bg-[#14331e]/70 border border-[#2d5c39] text-xs text-emerald-100 leading-relaxed">
                    <strong className="text-[#c3dc4e] font-semibold block mb-0.5">
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
    </div>
  );
}
