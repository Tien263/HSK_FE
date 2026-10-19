"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, RotateCcw, Sparkles, CheckCircle2, Flame, Volume2 } from "lucide-react";

interface PairItem {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
}

const vocabPairs: PairItem[] = [
  { id: "1", hanzi: "苹果", pinyin: "píngguǒ", meaning: "Quả táo" },
  { id: "2", hanzi: "多少钱", pinyin: "duōshǎo qián", meaning: "Bao nhiêu tiền" },
  { id: "3", hanzi: "买", pinyin: "mǎi", meaning: "Mua" },
  { id: "4", hanzi: "块", pinyin: "kuài", meaning: "Đồng (tệ)" },
  { id: "5", hanzi: "爸爸", pinyin: "bàba", meaning: "Bố" },
  { id: "6", hanzi: "妈妈", pinyin: "māma", meaning: "Mẹ" },
];

export default function GameCenterPage() {
  const [selectedHanzi, setSelectedHanzi] = useState<string | null>(null);
  const [selectedPinyin, setSelectedPinyin] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [shuffledPinyins, setShuffledPinyins] = useState<PairItem[]>([]);

  useEffect(() => {
    setShuffledPinyins([...vocabPairs].sort(() => Math.random() - 0.5));
  }, []);

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectHanzi = (item: PairItem) => {
    if (matchedIds.includes(item.id)) return;
    setSelectedHanzi(item.id);
    handleSpeak(item.hanzi);

    if (selectedPinyin) {
      checkMatch(item.id, selectedPinyin);
    }
  };

  const handleSelectPinyin = (item: PairItem) => {
    if (matchedIds.includes(item.id)) return;
    setSelectedPinyin(item.id);

    if (selectedHanzi) {
      checkMatch(selectedHanzi, item.id);
    }
  };

  const checkMatch = (hId: string, pId: string) => {
    if (hId === pId) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const points = 10 + (newCombo > 1 ? (newCombo - 1) * 2 : 0);
      setScore((prev) => prev + points);
      setMatchedIds((prev) => [...prev, hId]);
      setSelectedHanzi(null);
      setSelectedPinyin(null);
    } else {
      setCombo(0);
      setTimeout(() => {
        setSelectedHanzi(null);
        setSelectedPinyin(null);
      }, 500);
    }
  };

  const handleReset = () => {
    setMatchedIds([]);
    setSelectedHanzi(null);
    setSelectedPinyin(null);
    setScore(0);
    setCombo(0);
    setShuffledPinyins([...vocabPairs].sort(() => Math.random() - 0.5));
  };

  const isCompleted = matchedIds.length === vocabPairs.length;

  return (
    <div className="min-h-screen bg-[#f2f7f3] text-[#1e293b] flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-3 px-4 rounded-2xl bg-white border border-[#dce8e0] shadow-sm">
        <Link
          href="/s/home"
          className="text-xs font-semibold text-[#64748b] hover:text-[#256f3a] transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về bàn học</span>
        </Link>

        {/* Score & Combo */}
        <div className="flex items-center gap-3 text-xs font-bold">
          {combo > 1 && (
            <span className="flex items-center gap-1 text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>Chuỗi x{combo}!</span>
            </span>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f9f3] border border-[#d2edd8] text-[#256f3a]">
            <Trophy className="w-3.5 h-3.5" />
            <span>{score} XP</span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-[#64748b] transition"
            title="Chơi lại ván mới"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Game Arena */}
      <main className="max-w-4xl mx-auto w-full my-6 flex-1 flex flex-col items-center justify-center">
        {/* Intro Banner */}
        <div className="w-full text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#dce8e0] text-xs font-bold text-[#256f3a] mb-2 shadow-2xs">
            <span>🎮 Game Center · Ghép Chữ Hán & Pinyin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b]">
            Nối Chữ Hán Với Cách Đọc Đúng
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Chọn 1 ô Chữ Hán bên trái và 1 ô Pinyin bên phải tương ứng để ghi điểm thưởng
          </p>
        </div>

        {isCompleted ? (
          <div className="w-full max-w-md text-center p-8 sm:p-10 rounded-3xl bg-white border border-[#dce8e0] shadow-sm animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-[#e8f5ec] text-[#256f3a] flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner">
              🏆
            </div>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-1">Xuất sắc quá em ơi!</h2>
            <p className="text-sm text-[#256f3a] font-bold mb-3 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" />
              Tổng điểm thưởng: +{score} XP
            </p>
            <p className="text-xs text-[#64748b] mb-6 leading-relaxed">
              Em đã ghép nối chính xác toàn bộ chữ Hán và Pinyin của bài học. Hãy chơi lại để rèn luyện phản xạ nhanh hơn nữa nhé!
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-[#256f3a] text-white font-bold text-xs hover:bg-[#1e5a2e] transition shadow-md shadow-[#256f3a]/20"
              >
                Chơi lại ván mới
              </button>
              <Link
                href="/s/home"
                className="px-6 py-2.5 rounded-xl bg-[#f0f9f3] text-[#256f3a] font-bold text-xs hover:bg-[#e2f3e8] border border-[#d2edd8] transition"
              >
                Về bàn học
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Hanzi Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2 text-xs font-bold text-[#475569]">
                <span>CỘT CHỮ HÁN</span>
                <span className="text-[#256f3a]">
                  Đã ghép: {matchedIds.length}/{vocabPairs.length}
                </span>
              </div>

              {vocabPairs.map((item) => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedHanzi === item.id;

                let cardStyle =
                  "bg-white border-[#dce8e0] text-[#1e293b] hover:border-[#256f3a] hover:shadow-sm";

                if (isMatched) {
                  cardStyle =
                    "bg-[#ecfdf5] border-[#10b981] text-[#047857] opacity-60 cursor-default scale-98";
                } else if (isSelected) {
                  cardStyle =
                    "bg-[#f0f9f3] border-[#256f3a] ring-2 ring-[#256f3a] text-[#256f3a] shadow-sm";
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => handleSelectHanzi(item)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${cardStyle}`}
                  >
                    <div>
                      <span className="text-2xl font-bold font-serif tracking-wider">
                        {item.hanzi}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMatched ? (
                        <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                      ) : (
                        <span className="text-xs text-[#94a3b8] font-medium">Chọn</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Column 2: Pinyin Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2 text-xs font-bold text-[#475569]">
                <span>CỘT PINYIN & NGHĨA</span>
                <span className="text-[#64748b]">Bấm để nối</span>
              </div>

              {shuffledPinyins.map((item) => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedPinyin === item.id;

                let cardStyle =
                  "bg-white border-[#dce8e0] text-[#1e293b] hover:border-[#256f3a] hover:shadow-sm";

                if (isMatched) {
                  cardStyle =
                    "bg-[#ecfdf5] border-[#10b981] text-[#047857] opacity-60 cursor-default scale-98";
                } else if (isSelected) {
                  cardStyle =
                    "bg-[#f0f9f3] border-[#256f3a] ring-2 ring-[#256f3a] text-[#256f3a] shadow-sm";
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => handleSelectPinyin(item)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${cardStyle}`}
                  >
                    <div>
                      <div className="text-base font-bold font-mono text-[#256f3a]">
                        {item.pinyin}
                      </div>
                      <div className="text-xs text-[#64748b] mt-0.5">{item.meaning}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMatched ? (
                        <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                      ) : (
                        <span className="text-xs text-[#94a3b8] font-medium">Chọn</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full py-2 text-center text-[11px] text-[#64748b]">
        Game Center Lớp cô Ning Ning · Luyện chữ Hán & Pinyin phản xạ nhanh
      </footer>
    </div>
  );
}
