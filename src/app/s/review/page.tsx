"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCw, Check, X, Sparkles, Volume2 } from "lucide-react";

interface VocabCard {
  progressId: string;
  vocabId: string;
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  wordType: string | null;
  exampleHanzi: string | null;
  examplePinyin: string | null;
  exampleMeaning: string | null;
  leitnerBox: number;
}

export default function VocabReviewPage() {
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    fetch("/api/v1/my/vocab-review/today?username=student")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setCards(data.items);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAnswer = async (remembered: boolean) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    try {
      await fetch("/api/v1/my/vocab-review/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressId: currentCard.progressId,
          remembered,
        }),
      });
    } catch (e) {
      console.error(e);
    }

    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const currentCard = cards[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#061609] text-white flex items-center justify-center text-sm font-medium">
        Đang nạp thẻ từ vựng Leitner...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#061609] text-white flex flex-col justify-between p-6">
      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between py-2">
        <Link
          href="/s/home"
          className="text-xs text-[#9cb396] hover:text-white transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về phòng học</span>
        </Link>

        <span className="text-xs font-mono font-bold text-[#c3dc4e]">
          THẺ {cards.length > 0 ? currentIndex + 1 : 0} / {cards.length}
        </span>
      </div>

      {/* Main Flashcard Container */}
      <main className="max-w-xl mx-auto w-full my-6 flex-1 flex flex-col items-center justify-center">
        {finished || cards.length === 0 ? (
          <div className="w-full text-center p-10 rounded-3xl bg-[#0a2012] border border-[#234a29] shadow-2xl">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Hoàn thành buổi ôn từ!</h2>
            <p className="text-sm text-[#9cb396] mb-6">
              Em đã ôn tập xong các từ vựng hôm nay theo đúng chu kỳ Leitner. Tiến độ đã được lưu vào hệ thống!
            </p>
            <Link
              href="/s/home"
              className="px-6 py-3 rounded-xl bg-[#c3dc4e] text-[#061609] font-bold text-xs inline-flex items-center gap-2 shadow-lg"
            >
              <span>Về phòng học của em</span>
            </Link>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Flashcard (Click to Flip) */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[340px] rounded-3xl bg-gradient-to-br from-[#0d2816] to-[#081a0e] border-2 border-[#234a29] hover:border-[#c3dc4e]/60 transition-all duration-300 p-8 flex flex-col justify-between cursor-pointer shadow-2xl relative select-none"
            >
              <div className="flex items-center justify-between text-xs text-[#9cb396]">
                <span className="px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 font-mono text-[10px]">
                  Hộp Leitner: Cấp {currentCard?.leitnerBox || 1}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[#c3dc4e]">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Bấm vào thẻ để lật</span>
                </span>
              </div>

              {/* Card Face */}
              {!isFlipped ? (
                /* Mặt trước: Chữ Hán to bản */
                <div className="my-auto text-center py-6">
                  <div className="text-6xl sm:text-7xl font-bold text-white tracking-wider mb-4 font-serif">
                    {currentCard?.hanzi}
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#14331e] border border-[#2d5c39] text-xs text-[#c3dc4e] font-medium">
                    {currentCard?.wordType || "Từ vựng HSK 1"}
                  </span>
                </div>
              ) : (
                /* Mặt sau: Pinyin + Nghĩa + Câu ví dụ */
                <div className="my-auto text-center py-4 space-y-3">
                  <div className="text-2xl font-mono font-bold text-[#c3dc4e]">
                    {currentCard?.pinyin}
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    {currentCard?.meaningVi}
                  </div>
                  {currentCard?.exampleHanzi && (
                    <div className="pt-4 border-t border-[#1b3d24] text-xs text-emerald-100 max-w-sm mx-auto">
                      <div className="font-semibold text-white mb-0.5">{currentCard.exampleHanzi}</div>
                      <div className="text-[#9cb396] font-mono text-[11px] mb-0.5">{currentCard.examplePinyin}</div>
                      <div className="text-white/80">{currentCard.exampleMeaning}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center text-[11px] text-[#9cb396]/60">
                Lớp tiếng Trung cô Ning Ning · Ôn tập đều đặn mỗi ngày
              </div>
            </div>

            {/* Bottom 2 Answer Buttons */}
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <button
                onClick={() => handleAnswer(false)}
                className="py-3.5 rounded-2xl bg-red-950/60 border border-red-800 text-red-300 font-bold text-xs hover:bg-red-900/60 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <X className="w-4 h-4 stroke-[3]" />
                <span>Chưa nhớ (Ôn lại)</span>
              </button>

              <button
                onClick={() => handleAnswer(true)}
                className="py-3.5 rounded-2xl bg-[#c3dc4e] text-[#061609] font-bold text-xs hover:bg-[#b3cb40] transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Đã nhớ (Lên hộp)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#9cb396]/50 py-2">
        Chu kỳ lặp lại ngắt quãng Leitner 5 hộp · HSK 3.0
      </footer>
    </div>
  );
}
