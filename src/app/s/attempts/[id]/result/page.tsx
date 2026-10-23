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

  const loadFallbackResult = () => {
    setData({
      attemptId: attemptId || "preview",
      assignmentTitle: "Bài thi Chuẩn mực 12 dạng câu hỏi HSK (Bản làm thử)",
      score: 85,
      maxScore: 100,
      durationSec: 540,
      answers: [
        {
          questionId: "bm-01",
          content: "“休息” (xiūxi) có nghĩa là gì?",
          pinyinPrompt: "xiūxi",
          options: [
            { id: "A", text: "Hôm nay" },
            { id: "B", text: "Nghỉ ngơi" },
            { id: "C", text: "Ngày mai" },
          ],
          userAnswer: "B",
          correctAnswer: "B. Nghỉ ngơi",
          isCorrect: true,
          scoreEarned: 5,
          explanation: "“休息” (xiūxi) nghĩa là nghỉ ngơi, thư giãn sau giờ làm việc hoặc học tập.",
        },
        {
          questionId: "bm-02",
          content: "Nối từ tiếng Trung tương ứng với ý nghĩa tiếng Việt:",
          pinyinPrompt: null,
          options: [],
          userAnswer: "今天 ➔ Hôm nay; 明天 ➔ Ngày mai",
          correctAnswer: "今天: Hôm nay; 明天: Ngày mai; 昨天: Hôm qua",
          isCorrect: true,
          scoreEarned: 10,
          explanation: "Các mốc thời gian cơ bản trong tiếng Trung HSK 1.",
        },
        {
          questionId: "bm-03",
          content: "医院 (yīyuàn)",
          pinyinPrompt: "yīyuàn",
          options: [],
          userAnswer: "Đã ghi nhớ",
          correctAnswer: "Bệnh viện",
          isCorrect: true,
          scoreEarned: 0,
          explanation: "Ví dụ: 他去医院看病了。(Anh ấy đi bệnh viện khám bệnh.)",
        },
        {
          questionId: "bm-04",
          content: "我想 [_____] 一杯热咖啡。",
          pinyinPrompt: "Wǒ xiǎng [_____] yì bēi rè kāfēi.",
          options: [],
          userAnswer: "喝",
          correctAnswer: "喝 (hē - uống)",
          isCorrect: true,
          scoreEarned: 5,
          explanation: "Động từ '喝' (uống) đi cùng thức uống như cà phê, trà, nước ngọt.",
        },
        {
          questionId: "bm-05",
          content: "Sắp xếp các thẻ từ sau thành câu hoàn chỉnh:",
          pinyinPrompt: "Wǒ jīntiān zài jiā xiūxi.",
          options: [],
          userAnswer: "我 今天 在家 休息",
          correctAnswer: "我 今天 在家 休息 (Wǒ jīntiān zài jiā xiūxi)",
          isCorrect: true,
          scoreEarned: 10,
          explanation: "Trật tự câu: Chủ ngữ (我) + Thời gian (今天) + Trạng ngữ nơi chốn (在家) + Động từ (休息).",
        },
        {
          questionId: "bm-06",
          content: "“明天下雨，所以我们不去公园。”",
          pinyinPrompt: "Míngtiān xiàyǔ, suǒyǐ wǒmen bù qù gōngyuán.",
          options: [],
          userAnswer: "TRUE",
          correctAnswer: "ĐÚNG (True / 对)",
          isCorrect: true,
          scoreEarned: 5,
          explanation: "Cặp liên từ '因为...所以...' biểu thị quan hệ nguyên nhân - kết quả.",
        },
        {
          questionId: "bm-07",
          content: "Tập viết chữ “汉字” (hànzì) ra vở 5 lần và chụp ảnh bài làm gửi lên:",
          pinyinPrompt: "hànzì (Hán tự)",
          options: [],
          userAnswer: "[Đã đính kèm ảnh bài viết tay]",
          correctAnswer: "Giáo viên đã nhận bài nộp ảnh viết tay",
          isCorrect: true,
          scoreEarned: 10,
          explanation: "Chữ viết ngay ngắn, đúng thứ tự nét bút thuận.",
        },
        {
          questionId: "bm-08",
          content: "请写一段话介绍你的家庭 (约50-80字)。",
          pinyinPrompt: "Qǐng xiě yí duàn huà jièshào nǐ de jiātíng.",
          options: [],
          userAnswer: "我家有四口人：爸爸、妈妈、弟弟和我...",
          correctAnswer: "Đạt chuẩn tự luận HSK (Đủ số lượng từ & đúng ngữ pháp)",
          isCorrect: true,
          scoreEarned: 15,
          explanation: "Bài viết mạch lạc, diễn đạt tự nhiên theo chủ đề gia đình.",
        },
      ],
    });
  };

  useEffect(() => {
    if (attemptId === "preview" || attemptId?.startsWith("demo")) {
      loadFallbackResult();
      setLoading(false);
      return;
    }

    fetch(`/api/v1/attempts/${attemptId}/result`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
        } else {
          loadFallbackResult();
        }
        setLoading(false);
      })
      .catch(() => {
        loadFallbackResult();
        setLoading(false);
      });
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
