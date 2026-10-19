"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCw, Check, X, Sparkles, Volume2, Bookmark, Flame } from "lucide-react";

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
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    let username = "student";
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.username) username = u.username;
      }
    } catch {}

    fetch(`/api/v1/my/vocab-review/today?username=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setCards(data.items);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

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

    setReviewedCount((prev) => prev + 1);
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f7f3] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-[#dce8e0] flex items-center justify-center text-3xl mb-4 animate-bounce">
          🐼
        </div>
        <p className="text-sm font-semibold text-[#1e293b]">Đang chuẩn bị thẻ từ vựng Leitner cho em...</p>
        <p className="text-xs text-[#64748b] mt-1">Hệ thống tính toán chu kỳ 5 hộp lặp lại ngắt quãng</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progressPercent = cards.length > 0 ? Math.round(((currentIndex) / cards.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f2f7f3] text-[#1e293b] flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between py-3 px-4 rounded-2xl bg-white border border-[#dce8e0] shadow-sm">
        <Link
          href="/s/home"
          className="text-xs font-semibold text-[#64748b] hover:text-[#256f3a] transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về bàn học</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f9f3] border border-[#d2edd8] text-[11px] font-bold text-[#256f3a]">
            <span>🐼 Ôn từ Leitner</span>
          </div>
          <span className="text-xs font-mono font-bold text-[#256f3a]">
            {cards.length > 0 ? currentIndex + 1 : 0} / {cards.length}
          </span>
        </div>
      </header>

      {/* Main Flashcard Container */}
      <main className="max-w-xl mx-auto w-full my-6 flex-1 flex flex-col items-center justify-center">
        {finished || cards.length === 0 ? (
          <div className="w-full text-center p-8 sm:p-10 rounded-3xl bg-white border border-[#dce8e0] shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[#e8f5ec] text-[#256f3a] flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner">
              🎉
            </div>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Hoàn thành buổi ôn từ!</h2>
            <p className="text-sm text-[#64748b] max-w-md mx-auto mb-6 leading-relaxed">
              Em đã ôn tập xong toàn bộ từ vựng hôm nay theo đúng chu kỳ ngắt quãng Leitner 5 hộp. Các từ nhớ sẽ được chuyển lên hộp nhớ lâu hơn!
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/s/home"
                className="px-6 py-2.5 rounded-xl bg-[#256f3a] text-white font-bold text-xs hover:bg-[#1e5a2e] transition shadow-md shadow-[#256f3a]/20"
              >
                Về bàn học của em
              </Link>
              <Link
                href="/s/games"
                className="px-6 py-2.5 rounded-xl bg-[#f0f9f3] text-[#256f3a] font-bold text-xs hover:bg-[#e2f3e8] border border-[#d2edd8] transition"
              >
                Chơi game từ vựng 🎮
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Leitner Box Status Indicator */}
            <div className="w-full mb-4 px-2 flex items-center justify-between text-xs text-[#64748b]">
              <div className="flex items-center gap-1.5 font-semibold">
                <span>Hộp hiện tại:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((box) => (
                    <span
                      key={box}
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] transition-all ${
                        box === currentCard.leitnerBox
                          ? "bg-[#256f3a] text-white shadow-sm scale-110"
                          : box < currentCard.leitnerBox
                          ? "bg-[#e8f5ec] text-[#256f3a]"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {box}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-medium text-[#256f3a]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+5 XP / từ nhớ</span>
              </div>
            </div>

            {/* Flip Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[380px] bg-white rounded-3xl p-8 border border-[#dce8e0] shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between relative group select-none"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-[#f0f9f3] text-[#256f3a] text-[11px] font-bold uppercase tracking-wider">
                  {currentCard.wordType || "Từ vựng HSK"}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(currentCard.hanzi);
                  }}
                  className="w-9 h-9 rounded-full bg-[#f8fafc] hover:bg-[#e8f5ec] text-[#64748b] hover:text-[#256f3a] border border-[#e2e8f0] flex items-center justify-center transition shadow-sm"
                  title="Nghe phát âm chuẩn"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Card Center Content */}
              <div className="text-center py-6">
                <h1 className="text-6xl font-bold text-[#1e293b] tracking-wider mb-3 font-serif">
                  {currentCard.hanzi}
                </h1>
                <p className="text-xl font-mono text-[#256f3a] font-medium tracking-wide">
                  {currentCard.pinyin}
                </p>

                {/* Back side reveal */}
                <div
                  className={`mt-6 pt-6 border-t border-dashed border-[#e2ece5] transition-all duration-300 ${
                    isFlipped ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <p className="text-xl font-bold text-[#1e293b] mb-4">
                    {currentCard.meaningVi}
                  </p>

                  {currentCard.exampleHanzi && (
                    <div className="bg-[#f8faf9] rounded-xl p-3.5 text-left border border-[#e2ece5]">
                      <p className="text-xs text-[#256f3a] font-semibold mb-1">Ví dụ thực tế:</p>
                      <p className="text-sm font-medium text-[#1e293b]">{currentCard.exampleHanzi}</p>
                      {currentCard.examplePinyin && (
                        <p className="text-xs font-mono text-[#64748b] mt-0.5">{currentCard.examplePinyin}</p>
                      )}
                      {currentCard.exampleMeaning && (
                        <p className="text-xs text-[#475569] mt-0.5 italic">{currentCard.exampleMeaning}</p>
                      )}
                    </div>
                  )}
                </div>

                {!isFlipped && (
                  <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-[#94a3b8] group-hover:text-[#256f3a] transition">
                    <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>Chạm để lật thẻ xem nghĩa & ví dụ</span>
                  </div>
                )}
              </div>

              {/* Card Bottom Progress Bar */}
              <div className="w-full bg-[#f1f5f9] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#256f3a] h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Answer Control Buttons */}
            <div className="w-full grid grid-cols-2 gap-4 mt-6">
              <button
                type="button"
                onClick={() => handleAnswer(false)}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-white border border-[#fecdd3] text-[#e11d48] font-bold text-xs hover:bg-[#fff1f2] transition shadow-sm active:scale-98"
              >
                <X className="w-4 h-4" />
                <span>Chưa nhớ (Về Hộp 1)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAnswer(true)}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#256f3a] text-white font-bold text-xs hover:bg-[#1e5a2e] transition shadow-md shadow-[#256f3a]/20 active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>Đã nhớ (Lên hộp sau)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="max-w-2xl mx-auto w-full py-2 text-center text-[11px] text-[#64748b]">
        Hệ thống ôn từ ngắt quãng Leitner 5 Hộp · Lớp tiếng Trung cô Ning Ning
      </footer>
    </div>
  );
}
