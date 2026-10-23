"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, RotateCcw, Sparkles, CheckCircle2, Flame, Volume2, Award } from "lucide-react";

interface PairItem {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
}

const defaultPairs: PairItem[] = [
  { id: "1", hanzi: "苹果", pinyin: "píngguǒ", meaning: "Quả táo" },
  { id: "2", hanzi: "多少钱", pinyin: "duōshǎo qián", meaning: "Bao nhiêu tiền" },
  { id: "3", hanzi: "买", pinyin: "mǎi", meaning: "Mua" },
  { id: "4", hanzi: "块", pinyin: "kuài", meaning: "Đồng (tệ)" },
  { id: "5", hanzi: "太...了", pinyin: "tài...le", meaning: "Quá... rồi" },
  { id: "6", hanzi: "妈妈", pinyin: "māma", meaning: "Mẹ" },
];

export default function GameCenterPage() {
  const [vocabPairs, setVocabPairs] = useState<PairItem[]>(defaultPairs);
  const [selectedHanzi, setSelectedHanzi] = useState<string | null>(null);
  const [selectedPinyin, setSelectedPinyin] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [shuffledPinyins, setShuffledPinyins] = useState<PairItem[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [studentUsername, setStudentUsername] = useState("");

  useEffect(() => {
    let query = "";
    let headers: Record<string, string> = {};

    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.username) setStudentUsername(u.username);
        if (u.id) {
          query = `studentId=${encodeURIComponent(u.id)}`;
          headers = { "x-user-id": u.id };
        } else if (u.username) {
          query = `username=${encodeURIComponent(u.username)}`;
        }
      }
    } catch {}

    const url = query ? `/api/v1/my/vocab-review/today?${query}` : null;

    if (!url) {
      setShuffledPinyins([...defaultPairs].sort(() => Math.random() - 0.5));
      return;
    }

    fetch(url, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items && data.items.length >= 4) {
          const formatted: PairItem[] = data.items.map((it: any) => ({
            id: it.vocabId || it.progressId,
            hanzi: it.hanzi,
            pinyin: it.pinyin,
            meaning: it.meaningVi,
          }));
          setVocabPairs(formatted);
          setShuffledPinyins([...formatted].sort(() => Math.random() - 0.5));
        } else {
          setShuffledPinyins([...defaultPairs].sort(() => Math.random() - 0.5));
        }
      })
      .catch(() => {
        setShuffledPinyins([...defaultPairs].sort(() => Math.random() - 0.5));
      });
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
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      const points = 10 + newCombo * 5;
      setScore((prev) => prev + points);
      setMatchedIds((prev) => [...prev, hId]);
      setSelectedHanzi(null);
      setSelectedPinyin(null);
    } else {
      setCombo(0);
      setTimeout(() => {
        setSelectedHanzi(null);
        setSelectedPinyin(null);
      }, 400);
    }
  };

  const handleReset = () => {
    setMatchedIds([]);
    setSelectedHanzi(null);
    setSelectedPinyin(null);
    setScore(0);
    setCombo(0);
    setIsSaved(false);
    setShuffledPinyins([...vocabPairs].sort(() => Math.random() - 0.5));
  };

  const isCompleted = matchedIds.length > 0 && matchedIds.length === vocabPairs.length;

  useEffect(() => {
    if (isCompleted && !isSaved) {
      setIsSaved(true);
      fetch("/api/v1/my/games/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          combo: maxCombo,
          username: studentUsername,
        }),
      }).catch((e) => console.error(e));
    }
  }, [isCompleted, isSaved, score, maxCombo, studentUsername]);

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1a3d2f] flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-3 px-4 rounded-2xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs">
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
          <span className="text-xs font-bold text-[#1a3d2f] hidden sm:inline">Đấu trường ghép từ HSK</span>
        </div>

        {/* Stats on top right */}
        <div className="flex items-center gap-3">
          {combo > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fef2f2] border border-[#fecaca] text-[11px] font-bold text-[#991b1b] animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-[#991b1b]" />
              <span>{combo}x Combo!</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs font-bold text-[#1a3d2f] bg-[#f0eee6] px-3 py-1 rounded-full border border-[#d8ceb9]">
            <Trophy className="w-3.5 h-3.5 text-[#d97706]" />
            <span>{score} Điểm</span>
          </div>
        </div>
      </header>

      {/* Main Game Board */}
      <main className="max-w-4xl mx-auto w-full my-6 flex-1 flex flex-col justify-center">
        {isCompleted ? (
          <div className="w-full max-w-md mx-auto text-center p-8 sm:p-10 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#991b1b] text-white flex items-center justify-center text-2xl font-serif mx-auto mb-4 shadow-sm">
              胜
            </div>
            <h2 className="text-2xl font-bold text-[#1a3d2f] mb-1 font-serif">Chiến thắng xuất sắc!</h2>
            <p className="text-sm text-[#526056] mb-6">
              Bạn đã ghép chính xác toàn bộ các cặp từ HSK hôm nay!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-[#f7f4ee] rounded-xl border border-[#e6decb]">
                <p className="text-[11px] text-[#8c9a8f]">Tổng điểm</p>
                <p className="text-xl font-bold text-[#1a3d2f]">+{score}</p>
              </div>
              <div className="p-3 bg-[#f7f4ee] rounded-xl border border-[#e6decb]">
                <p className="text-[11px] text-[#8c9a8f]">Chuỗi combo</p>
                <p className="text-xl font-bold text-[#991b1b]">{maxCombo} liên tiếp</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-[#1a3d2f] text-white font-bold text-xs hover:bg-[#122b21] transition shadow-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi lại ván mới</span>
              </button>
              <Link
                href="/s/home"
                className="px-5 py-2.5 rounded-xl bg-[#f0eee6] text-[#1a3d2f] font-bold text-xs hover:bg-[#e4ded0] border border-[#d8ceb9] transition"
              >
                Về bàn học 🍃
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Guide hint */}
            <div className="text-center">
              <p className="text-xs text-[#526056]">
                Chạm vào thẻ chữ Hán bên trái và ghép với phiên âm Pinyin / nghĩa tương ứng bên phải
              </p>
            </div>

            {/* Two columns: Left = Hanzi, Right = Pinyin / Meaning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Hanzi Column */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#8c9a8f] px-2 flex items-center justify-between">
                  <span>Cột chữ Hán (汉字)</span>
                  <span className="text-[11px]">{matchedIds.length}/{vocabPairs.length} đã ghép</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {vocabPairs.map((item) => {
                    const isMatched = matchedIds.includes(item.id);
                    const isSelected = selectedHanzi === item.id;

                    let tileStyle =
                      "bg-[#fcfaf7] border-[#e6decb] text-[#1a3d2f] hover:border-[#1a3d2f] hover:shadow-xs";

                    if (isMatched) {
                      tileStyle =
                        "bg-[#e2ebe4] border-[#a4c5ae] text-[#1a3d2f] opacity-60 cursor-default pointer-events-none";
                    } else if (isSelected) {
                      tileStyle =
                        "bg-[#1a3d2f] border-[#1a3d2f] text-white shadow-md scale-102";
                    }

                    return (
                      <button
                        key={`hanzi-${item.id}`}
                        type="button"
                        onClick={() => handleSelectHanzi(item)}
                        disabled={isMatched}
                        className={`h-28 rounded-2xl border-2 p-3 flex flex-col items-center justify-center transition-all duration-200 ${tileStyle}`}
                      >
                        <span className="text-3xl font-bold font-serif tracking-widest mb-1">
                          {item.hanzi}
                        </span>
                        {isMatched && (
                          <span className="text-[10px] text-[#3d7b56] font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã ghép
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pinyin / Meaning Column */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#8c9a8f] px-2 flex items-center justify-between">
                  <span>Cột phiên âm & Ý nghĩa (拼音)</span>
                  <span className="text-[11px]">{matchedIds.length}/{vocabPairs.length}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {shuffledPinyins.map((item) => {
                    const isMatched = matchedIds.includes(item.id);
                    const isSelected = selectedPinyin === item.id;

                    let tileStyle =
                      "bg-[#fcfaf7] border-[#e6decb] text-[#1a3d2f] hover:border-[#1a3d2f] hover:shadow-xs";

                    if (isMatched) {
                      tileStyle =
                        "bg-[#e2ebe4] border-[#a4c5ae] text-[#1a3d2f] opacity-60 cursor-default pointer-events-none";
                    } else if (isSelected) {
                      tileStyle =
                        "bg-[#3d7b56] border-[#3d7b56] text-white shadow-md scale-102";
                    }

                    return (
                      <button
                        key={`pinyin-${item.id}`}
                        type="button"
                        onClick={() => handleSelectPinyin(item)}
                        disabled={isMatched}
                        className={`h-28 rounded-2xl border-2 p-3 flex flex-col items-center justify-center text-center transition-all duration-200 ${tileStyle}`}
                      >
                        <span className="text-base font-bold font-mono tracking-wide mb-1">
                          {item.pinyin}
                        </span>
                        <span className="text-xs opacity-90 line-clamp-1">
                          {item.meaning}
                        </span>
                        {isMatched && (
                          <span className="text-[10px] text-[#3d7b56] font-medium mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Chuẩn xác
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="max-w-4xl mx-auto w-full py-2 text-center text-[11px] text-[#8c9a8f]">
        Trò chơi trí tuệ phản xạ từ vựng HSK · HSK Hanyu 🍃
      </footer>
    </div>
  );
}
