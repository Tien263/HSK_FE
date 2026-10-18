"use client";

import Image from "next/image";
import { useState } from "react";
import { BookOpen, Trophy, Gamepad2, Lock } from "lucide-react";

interface LevelItem {
  id: string;
  stage: "Sơ cấp" | "Trung cấp" | "Cao cấp";
  level: string;
  vocab: string;
  hanzi: string;
  isOpen: boolean;
  imageUrl: string;
  archStyle: string;
}

const levels: LevelItem[] = [
  {
    id: "hsk-1",
    stage: "Sơ cấp",
    level: "HSK 1",
    vocab: "500 từ",
    hanzi: "300 chữ",
    isOpen: true,
    imageUrl: "/hsk-images/hsk1.jpg",
    archStyle: "rounded-t-[70px] rounded-b-md",
  },
  {
    id: "hsk-2",
    stage: "Sơ cấp",
    level: "HSK 2",
    vocab: "1.272 từ",
    hanzi: "600 chữ",
    isOpen: true,
    imageUrl: "/hsk-images/hsk2.jpg",
    archStyle: "rounded-t-[80px] rounded-b-md",
  },
  {
    id: "hsk-3",
    stage: "Sơ cấp",
    level: "HSK 3",
    vocab: "2.245 từ",
    hanzi: "900 chữ",
    isOpen: true,
    imageUrl: "/hsk-images/hsk3.jpg",
    archStyle: "rounded-t-[70px] rounded-b-md",
  },
  {
    id: "hsk-4",
    stage: "Trung cấp",
    level: "HSK 4",
    vocab: "3.245 từ",
    hanzi: "1.200 chữ",
    isOpen: true,
    imageUrl: "/hsk-images/hsk4.jpg",
    archStyle: "rounded-t-[70px] rounded-b-md",
  },
  {
    id: "hsk-5",
    stage: "Trung cấp",
    level: "HSK 5",
    vocab: "4.316 từ",
    hanzi: "1.500 chữ",
    isOpen: false,
    imageUrl: "/hsk-images/guide-hanzi.jpg",
    archStyle: "rounded-t-[70px] rounded-b-md",
  },
  {
    id: "hsk-6",
    stage: "Trung cấp",
    level: "HSK 6",
    vocab: "5.456 từ",
    hanzi: "1.800 chữ",
    isOpen: false,
    imageUrl: "/hsk-images/guide-listening.jpg",
    archStyle: "rounded-t-[70px] rounded-b-md",
  },
  {
    id: "hsk-7-9",
    stage: "Cao cấp",
    level: "HSK 7–9",
    vocab: "11.092 từ",
    hanzi: "3.000 chữ",
    isOpen: false,
    imageUrl: "/hsk-images/exam-banner.jpg",
    archStyle: "rounded-t-[70px] rounded-b-md",
  },
];

export default function CoursesSection() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredLevels = levels.filter((item) => {
    if (activeTab === "all") return true;
    return item.stage === activeTab;
  });

  const handleAction = (level: string, action: string) => {
    alert(`Em đã chọn ${action} của ${level}. Hãy đăng nhập để hệ thống lưu kết quả học tập nhé!`);
  };

  return (
    <section id="hsk-levels" className="py-24 sm:py-28 border-t border-[#234a29]/60 max-w-7xl mx-auto px-6 lg:px-12 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="text-xs font-semibold text-[#c3dc4e] uppercase tracking-widest mb-3 font-mono">
          CHUẨN KHẢO THÍ HSK 3.0 MỚI NHẤT
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
          Chọn cấp độ của bạn
        </h2>
        <p className="text-[#9cb396] text-sm sm:text-base leading-relaxed">
          HSK 3.0 gồm 3 giai đoạn, 9 cấp. Chọn cấp đang học để vào đúng khu vực ôn tập.
        </p>

        {/* Stage Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {[
            { id: "all", label: "Tất cả cấp độ" },
            { id: "Sơ cấp", label: "Sơ cấp (HSK 1 - 3)" },
            { id: "Trung cấp", label: "Trung cấp (HSK 4 - 6)" },
            { id: "Cao cấp", label: "Cao cấp (HSK 7 - 9)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#c3dc4e] text-[#061609] shadow-md"
                  : "bg-[#0a2012] border border-[#234a29] text-[#9cb396] hover:text-white hover:border-[#c3dc4e]/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Arched Dome Level Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {filteredLevels.map((item) => (
          <div
            key={item.id}
            className={`bg-[#0a2012]/95 border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 group shadow-xl ${
              item.isOpen
                ? "border-[#234a29] hover:border-[#c3dc4e]/60"
                : "border-[#1a3320]/60 opacity-85"
            }`}
          >
            <div>
              {/* Arched Dome Image Header */}
              <div
                className={`relative h-44 w-full mb-4 overflow-hidden border border-white/20 bg-[#061609] shadow-inner ${item.archStyle}`}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.level}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Stage Badge on Top Right */}
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] text-white font-medium">
                  {item.stage}
                </div>
              </div>

              {/* Card Title (Centered, bold white like reference) */}
              <h3 className="text-center text-lg font-bold text-white mb-3 tracking-wide">
                {item.level}
              </h3>

              {/* Specifications Bullet List */}
              <ul className="space-y-2 text-xs text-[#9cb396] mb-6 px-1">
                <li className="flex items-start gap-2">
                  <span className="text-[#c3dc4e] text-sm leading-none">•</span>
                  <span>
                    <span className="text-white/85 font-medium">Giai đoạn:</span> {item.stage}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c3dc4e] text-sm leading-none">•</span>
                  <span>
                    <span className="text-white/85 font-medium">Từ vựng tích lũy:</span>{" "}
                    <span className="text-[#c3dc4e] font-semibold">{item.vocab}</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c3dc4e] text-sm leading-none">•</span>
                  <span>
                    <span className="text-white/85 font-medium">Chữ Hán tích lũy:</span>{" "}
                    <span className="text-white font-semibold">{item.hanzi}</span>
                  </span>
                </li>
              </ul>
            </div>

            {/* Bottom 3 Action Buttons: Bài đã học · Luyện đề · Game (hoặc Sắp mở) */}
            <div className="pt-3 border-t border-[#234a29]">
              {item.isOpen ? (
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleAction(item.level, "Bài đã học")}
                    className="py-1.5 px-1 rounded border border-white/20 text-[11px] text-[#9cb396] hover:text-white hover:border-[#c3dc4e] hover:bg-white/5 transition flex items-center justify-center gap-1 cursor-pointer"
                    title="Bài đã học"
                  >
                    <BookOpen className="w-3 h-3 text-[#c3dc4e]" />
                    <span>Bài học</span>
                  </button>

                  <button
                    onClick={() => handleAction(item.level, "Luyện đề")}
                    className="py-1.5 px-1 rounded border border-white/20 text-[11px] text-[#9cb396] hover:text-white hover:border-[#c3dc4e] hover:bg-white/5 transition flex items-center justify-center gap-1 cursor-pointer"
                    title="Luyện đề"
                  >
                    <Trophy className="w-3 h-3 text-[#c3dc4e]" />
                    <span>Luyện đề</span>
                  </button>

                  <button
                    onClick={() => handleAction(item.level, "Game")}
                    className="py-1.5 px-1 rounded border border-[#c3dc4e]/40 bg-[#c3dc4e]/10 text-[11px] text-[#c3dc4e] hover:bg-[#c3dc4e] hover:text-[#061609] transition flex items-center justify-center gap-1 cursor-pointer font-medium"
                    title="Game Center"
                  >
                    <Gamepad2 className="w-3 h-3" />
                    <span>Game</span>
                  </button>
                </div>
              ) : (
                <div className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-center text-xs text-[#9cb396] flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#9cb396]/60" />
                  <span>Sắp mở</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
