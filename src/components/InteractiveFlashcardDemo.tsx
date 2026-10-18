"use client";

import { useState } from "react";
import { Volume2, RotateCcw, ChevronLeft, ChevronRight, Sparkles, Star } from "lucide-react";

interface Word {
  hanzi: string;
  pinyin: string;
  meaning: string;
  type: string;
  level: string;
  exampleHanzi: string;
  examplePinyin: string;
  exampleVi: string;
}

const demoWords: Word[] = [
  {
    hanzi: "学习",
    pinyin: "xué xí",
    meaning: "Học tập, rèn luyện",
    type: "Động từ",
    level: "HSK 1",
    exampleHanzi: "我们都在努力学习汉语。",
    examplePinyin: "Wǒmen dōu zài nǔlì xuéxí hànyǔ.",
    exampleVi: "Chúng tôi đều đang nỗ lực học tiếng Trung.",
  },
  {
    hanzi: "朋友",
    pinyin: "péng you",
    meaning: "Bạn bè, bạn hữu",
    type: "Danh từ",
    level: "HSK 1",
    exampleHanzi: "有朋自远方来，不亦乐乎？",
    examplePinyin: "Yǒu péng zì yuǎnfāng lái, bù yì yuè hū?",
    exampleVi: "Có bạn từ phương xa tới, chẳng vui lắm sao?",
  },
  {
    hanzi: "梦想",
    pinyin: "mèng xiǎng",
    meaning: "Ước mơ, khát vọng",
    type: "Danh từ / Động từ",
    level: "HSK 3",
    exampleHanzi: "每个人都有自己的梦想。",
    examplePinyin: "Měi gèrén dōu yǒu zìjǐ de mèngxiǎng.",
    exampleVi: "Mỗi người đều có ước mơ của riêng mình.",
  },
  {
    hanzi: "坚持",
    pinyin: "jiān chí",
    meaning: "Kiên trì, giữ vững",
    type: "Động từ",
    level: "HSK 4",
    exampleHanzi: "只要坚持，就一定会成功。",
    examplePinyin: "Zhǐyào jiānchí, jiù yídìng huì chénggōng.",
    exampleVi: "Chỉ cần kiên trì, nhất định sẽ thành công.",
  },
];

export default function InteractiveFlashcardDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const word = demoWords[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % demoWords.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + demoWords.length) % demoWords.length);
  };

  const playPronunciation = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85; // slightly slower for learners
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <section id="demo-flashcard" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Intro text */}
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Phương pháp Spaced Repetition
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-6">
            Thẻ Flashcard Hán Tự Thông Minh
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
            Ghi nhớ chữ Hán không còn là nỗi ám ảnh. Mỗi thẻ từ vựng đều tích hợp phiên âm chuẩn, giải
            nghĩa tiếng Việt, ví dụ thực tế và audio phát âm giọng bản xứ.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-slate-300">
              <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <span>Chạm hoặc click vào thẻ để lật xem nghĩa & câu ví dụ</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <span>Bấm biểu tượng loa để nghe phát âm chuẩn giọng Bắc Kinh</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <span>Thuật toán lặp lại ngắt quãng nhắc ôn tập đúng thời điểm</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Flipping Flashcard */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-md perspective">
            {/* The Flashcard Container with Flip Animation */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`relative w-full h-[400px] cursor-pointer rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] select-none ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* FRONT SIDE */}
              <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-[#192038] to-[#121629] border border-white/15 p-8 flex flex-col justify-between shadow-2xl [backface-visibility:hidden]">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {word.level} • {word.type}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFavorite(!isFavorite);
                    }}
                    className={`p-2 rounded-full transition ${
                      isFavorite ? "text-amber-400 fill-amber-400" : "text-white/40 hover:text-white"
                    }`}
                  >
                    <Star className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Big Chinese Character */}
                <div className="text-center my-auto">
                  <div className="text-7xl sm:text-8xl font-serif font-black text-white tracking-wide mb-3">
                    {word.hanzi}
                  </div>
                  <div className="text-xl sm:text-2xl font-mono text-amber-300 tracking-wider">
                    {word.pinyin}
                  </div>
                </div>

                {/* Footer of Front */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={(e) => playPronunciation(e, word.hanzi)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition font-medium text-sm"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Nghe đọc</span>
                  </button>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Chạm để lật mặt sau
                  </span>
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-[#1e2746] to-[#14192f] border border-amber-400/30 p-8 flex flex-col justify-between shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                {/* Header of Back */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
                    Nghĩa & Ngữ cảnh
                  </span>
                  <span className="text-sm font-serif font-bold text-white">{word.hanzi}</span>
                </div>

                {/* Meaning & Details */}
                <div className="my-auto space-y-4">
                  <div>
                    <span className="text-xs uppercase text-slate-400 font-mono">Giải nghĩa:</span>
                    <div className="text-2xl font-serif font-bold text-amber-300 mt-1">
                      {word.meaning}
                    </div>
                  </div>

                  {/* Example Sentence */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-400 font-mono">Ví dụ thực tế:</span>
                      <button
                        onClick={(e) => playPronunciation(e, word.exampleHanzi)}
                        className="text-amber-400 hover:text-amber-300 p-1"
                        title="Nghe câu ví dụ"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-lg font-serif text-white font-medium">
                      {word.exampleHanzi}
                    </div>
                    <div className="text-xs font-mono text-amber-300/90 mt-0.5">
                      {word.examplePinyin}
                    </div>
                    <div className="text-xs text-slate-300 mt-1">{word.exampleVi}</div>
                  </div>
                </div>

                {/* Footer of Back */}
                <div className="text-center pt-2 text-xs text-slate-400">
                  Chạm để quay lại mặt trước
                </div>
              </div>
            </div>
          </div>

          {/* Flashcard Navigation Controllers */}
          <div className="flex items-center gap-6 mt-6">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition border border-white/10"
              aria-label="Từ trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-mono text-slate-400">
              {currentIndex + 1} / {demoWords.length}
            </span>
            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition border border-white/10"
              aria-label="Từ tiếp theo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
