"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, RotateCcw, Sparkles, CheckCircle2 } from "lucide-react";

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
    // Xáo trộn danh sách pinyin
    setShuffledPinyins([...vocabPairs].sort(() => Math.random() - 0.5));
  }, []);

  const handleSelectHanzi = (item: PairItem) => {
    if (matchedIds.includes(item.id)) return;
    setSelectedHanzi(item.id);

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
      // Ghép đúng
      const newCombo = combo + 1;
      setCombo(newCombo);
      const points = 10 + (newCombo > 1 ? (newCombo - 1) * 2 : 0);
      setScore((prev) => prev + points);
      setMatchedIds((prev) => [...prev, hId]);
      setSelectedHanzi(null);
      setSelectedPinyin(null);
    } else {
      // Ghép sai
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
    <div className="min-h-screen bg-[#061609] text-white flex flex-col justify-between p-6">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <Link
          href="/s/home"
          className="text-xs text-[#9cb396] hover:text-white transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về phòng học</span>
        </Link>

        {/* Score & Combo */}
        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          {combo > 1 && (
            <span className="text-orange-400 bg-orange-950/60 border border-orange-800 px-3 py-1 rounded-full animate-bounce">
              🔥 Combo x{combo}!
            </span>
          )}
          <span className="bg-[#14331e] border border-[#2d5c39] text-[#c3dc4e] px-4 py-1.5 rounded-full">
            🏆 Điểm: {score}
          </span>
        </div>
      </div>

      {/* Main Game Arena */}
      <main className="max-w-4xl mx-auto w-full my-6 flex-1 flex flex-col justify-center">
        <div className="bg-[#0a2012] border border-[#234a29] rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-8">
            <span className="text-xs font-mono font-bold text-[#c3dc4e] uppercase tracking-widest block mb-1">
              TRÒ CHƠI NỐI TỪ VỰNG HSK 1
            </span>
            <h1 className="text-2xl font-bold text-white mb-2">
              Ghép Chữ Hán với Pinyin
            </h1>
            <p className="text-xs text-[#9cb396]">
              Chọn một ô Chữ Hán ở cột trái và nối với ô Pinyin tương ứng ở cột phải!
            </p>
          </div>

          {isCompleted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">👑</div>
              <h2 className="text-2xl font-bold text-white mb-2">Xuất sắc! Hoàn thành ván chơi!</h2>
              <p className="text-sm text-[#9cb396] mb-6">
                Tổng điểm đạt được: <strong className="text-[#c3dc4e]">{score} điểm</strong> (+{Math.round(score / 2)} XP cộng vào hồ sơ học sinh).
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-[#c3dc4e] text-[#061609] font-bold text-xs inline-flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi lại ván mới</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:gap-10">
              {/* Cột Trái: Chữ Hán */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#9cb396] uppercase text-center mb-2 font-mono">
                  CHỮ HÁN
                </div>
                {vocabPairs.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  const isSelected = selectedHanzi === item.id;

                  return (
                    <button
                      key={item.id}
                      disabled={isMatched}
                      onClick={() => handleSelectHanzi(item)}
                      className={`w-full p-4 rounded-2xl border text-center transition cursor-pointer select-none ${
                        isMatched
                          ? "bg-[#0d2816]/30 border-emerald-900/40 text-emerald-600 opacity-40 line-through"
                          : isSelected
                          ? "bg-[#14331e] border-[#c3dc4e] text-white shadow-lg ring-2 ring-[#c3dc4e]/40"
                          : "bg-[#061609] border-[#234a29] text-white hover:border-white/40"
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl font-bold block font-serif">
                        {item.hanzi}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Cột Phải: Pinyin & Nghĩa */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#9cb396] uppercase text-center mb-2 font-mono">
                  PINYIN & NGHĨA
                </div>
                {shuffledPinyins.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  const isSelected = selectedPinyin === item.id;

                  return (
                    <button
                      key={item.id}
                      disabled={isMatched}
                      onClick={() => handleSelectPinyin(item)}
                      className={`w-full p-4 rounded-2xl border text-center transition cursor-pointer select-none ${
                        isMatched
                          ? "bg-[#0d2816]/30 border-emerald-900/40 text-emerald-600 opacity-40 line-through"
                          : isSelected
                          ? "bg-[#14331e] border-[#c3dc4e] text-white shadow-lg ring-2 ring-[#c3dc4e]/40"
                          : "bg-[#061609] border-[#234a29] text-white hover:border-white/40"
                      }`}
                    >
                      <span className="text-base sm:text-lg font-mono font-bold text-[#c3dc4e] block">
                        {item.pinyin}
                      </span>
                      <span className="text-xs text-[#9cb396] block mt-0.5">
                        {item.meaning}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center text-xs text-[#9cb396]/50 py-2">
        Game Center Lớp Cô Ning Ning · Ghép Chữ Hán – Pinyin (Match Game S-10)
      </footer>
    </div>
  );
}
