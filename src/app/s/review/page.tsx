"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCw, Check, X, Sparkles, Volume2, BookOpen, Trophy } from "lucide-react";

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
  const [masteredCount, setMasteredCount] = useState(0);

  useEffect(() => {
    let query = "";
    let headers: Record<string, string> = {};

    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.id) {
          query = `studentId=${encodeURIComponent(u.id)}`;
          headers = { "x-user-id": u.id };
        } else if (u.username) {
          query = `username=${encodeURIComponent(u.username)}`;
        }
      }
    } catch {}

    if (!query) {
      setCards([]);
      setLoading(false);
      return;
    }

    fetch(`/api/v1/my/vocab-review/today?${query}`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setCards(data.items);
        } else {
          setCards([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setCards([]);
        setLoading(false);
      });
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
    if (remembered) setMasteredCount((prev) => prev + 1);
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#991b1b] text-white shadow-md flex items-center justify-center text-2xl font-serif mb-4 animate-bounce">
          词
        </div>
        <p className="text-sm font-bold text-[#1a3d2f]">Đang nạp thẻ từ vựng Leitner của bạn...</p>
        <p className="text-xs text-[#526056] mt-1">Hệ thống thuật toán ngắt quãng 5 Hộp ghi nhớ sâu</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1a3d2f] flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between py-3 px-4 rounded-2xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs">
        <Link
          href="/s/home"
          className="text-xs font-semibold text-[#526056] hover:text-[#1a3d2f] transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về bàn học</span>
        </Link>

        {/* Brand center seal */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#991b1b] text-white flex items-center justify-center font-serif text-xs font-bold shadow-xs">
            汉语
          </div>
          <span className="text-xs font-bold text-[#1a3d2f] hidden sm:inline">Ôn tập từ vựng Leitner</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#f0eee6] border border-[#d8ceb9] text-[11px] font-mono font-bold text-[#1a3d2f]">
            {cards.length > 0 ? currentIndex + 1 : 0} / {cards.length}
          </span>
        </div>
      </header>

      {/* Main Flashcard Container */}
      <main className="max-w-xl mx-auto w-full my-6 flex-1 flex flex-col items-center justify-center">
        {finished || cards.length === 0 ? (
          <div className="w-full text-center p-8 sm:p-10 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#991b1b] text-white flex items-center justify-center text-2xl font-serif mx-auto mb-4 shadow-md">
              恭喜
            </div>
            <h2 className="text-2xl font-bold text-[#1a3d2f] mb-2 font-serif">Hoàn thành buổi ôn từ!</h2>
            <p className="text-sm text-[#526056] max-w-md mx-auto mb-6 leading-relaxed">
              Tuyệt vời lắm! Bạn đã hoàn thành đợt ôn từ theo thuật toán ngắt quãng Leitner hôm nay. Các từ đã nhớ sẽ được chuyển lên hộp nhớ lâu hơn!
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6 text-center">
              <div className="p-3 bg-[#f7f4ee] rounded-xl border border-[#e6decb]">
                <p className="text-[11px] text-[#8c9a8f]">Đã ôn tập</p>
                <p className="text-lg font-bold text-[#1a3d2f]">{reviewedCount} từ</p>
              </div>
              <div className="p-3 bg-[#f7f4ee] rounded-xl border border-[#e6decb]">
                <p className="text-[11px] text-[#8c9a8f]">Nhớ tốt</p>
                <p className="text-lg font-bold text-[#3d7b56]">{masteredCount} từ</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Link
                href="/s/home"
                className="px-6 py-2.5 rounded-xl bg-[#1a3d2f] text-white font-bold text-xs hover:bg-[#122b21] transition shadow-xs"
              >
                Về bàn học 🍃
              </Link>
              <Link
                href="/s/games"
                className="px-6 py-2.5 rounded-xl bg-[#f0eee6] text-[#1a3d2f] font-bold text-xs hover:bg-[#e4ded0] border border-[#d8ceb9] transition"
              >
                Đấu trường từ vựng 🎮
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Leitner Box Status Indicator */}
            <div className="w-full mb-3 px-2 flex items-center justify-between text-xs text-[#526056]">
              <div className="flex items-center gap-2 font-semibold">
                <span className="text-[11px] uppercase tracking-wider text-[#8c9a8f]">Hộp hiện tại:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((box) => (
                    <span
                      key={box}
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] transition-all ${
                        box === currentCard.leitnerBox
                          ? "bg-[#1a3d2f] text-white shadow-xs scale-105"
                          : box < currentCard.leitnerBox
                          ? "bg-[#e2ebe4] text-[#1a3d2f]"
                          : "bg-[#f0eee6] text-[#8c9a8f]"
                      }`}
                    >
                      {box}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-medium text-[#3d7b56]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+5 XP / từ nhớ</span>
              </div>
            </div>

            {/* Flip Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[380px] bg-[#fcfaf7] rounded-3xl p-8 border border-[#e6decb] shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between relative group select-none"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#f0eee6] text-[#1a3d2f] text-[11px] font-bold uppercase tracking-wider border border-[#d8ceb9]">
                  {currentCard.wordType || "Từ vựng HSK"}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(currentCard.hanzi);
                  }}
                  className="w-9 h-9 rounded-full bg-[#f7f4ee] hover:bg-[#ede7da] text-[#526056] hover:text-[#1a3d2f] border border-[#e6decb] flex items-center justify-center transition shadow-xs"
                  title="Nghe phát âm chuẩn"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Card Center Content */}
              <div className="text-center py-6">
                <h1 className="text-6xl font-bold text-[#1a3d2f] tracking-widest mb-3 font-serif">
                  {currentCard.hanzi}
                </h1>
                <p className="text-xl font-mono text-[#3d7b56] font-medium tracking-wide">
                  {currentCard.pinyin}
                </p>

                {/* Back side reveal */}
                <div
                  className={`mt-6 pt-6 border-t border-dashed border-[#e6decb] transition-all duration-300 ${
                    isFlipped ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <p className="text-2xl font-bold text-[#1a3d2f] mb-4 font-serif">
                    {currentCard.meaningVi}
                  </p>

                  {currentCard.exampleHanzi && (
                    <div className="bg-[#f7f4ee] rounded-xl p-3.5 text-left border border-[#e6decb]">
                      <p className="text-[11px] font-bold uppercase text-[#3d7b56] mb-1">Ví dụ thực tế:</p>
                      <p className="text-sm font-medium text-[#1a3d2f]">{currentCard.exampleHanzi}</p>
                      {currentCard.examplePinyin && (
                        <p className="text-xs font-mono text-[#526056] mt-0.5">{currentCard.examplePinyin}</p>
                      )}
                      {currentCard.exampleMeaning && (
                        <p className="text-xs text-[#526056] mt-0.5 italic">{currentCard.exampleMeaning}</p>
                      )}
                    </div>
                  )}
                </div>

                {!isFlipped && (
                  <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-[#8c9a8f] group-hover:text-[#1a3d2f] transition">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Chạm để lật thẻ xem nghĩa tiếng Việt & ví dụ</span>
                  </div>
                )}
              </div>

              {/* Card Bottom Progress Bar */}
              <div className="w-full bg-[#f0eee6] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#1a3d2f] h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Answer Control Buttons */}
            <div className="w-full grid grid-cols-2 gap-3.5 mt-5">
              <button
                type="button"
                onClick={() => handleAnswer(false)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#fcfaf7] border border-[#fecdd3] text-[#b91c1c] font-bold text-xs hover:bg-[#fef2f2] transition shadow-xs active:scale-98"
              >
                <X className="w-4 h-4" />
                <span>Chưa nhớ (Về Hộp 1)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAnswer(true)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1a3d2f] text-white font-bold text-xs hover:bg-[#122b21] transition shadow-xs shadow-[#1a3d2f]/10 active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>Đã nhớ (Lên hộp sau)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="max-w-2xl mx-auto w-full py-2 text-center text-[11px] text-[#8c9a8f]">
        Hệ thống ôn từ Leitner 5 Hộp ngắt quãng · HSK Hanyu 🍃
      </footer>
    </div>
  );
}
