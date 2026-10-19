"use client";

import Image from "next/image";
import Link from "next/link";
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

  return (
    <section id="hsk-levels" className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="text-xs font-semibold text-[#c3dc4e] uppercase tracking-widest mb-3 font-mono">
            CHƯƠNG TRÌNH ĐÀO TẠO CHUẨN QUỐC TẾ
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Chọn cấp độ của bạn
          </h2>
          <p className="text-[#9cb396] text-sm sm:text-base mt-3 max-w-2xl font-normal leading-relaxed">
            HSK 3.0 gồm 3 giai đoạn, 9 cấp. Chọn cấp đang học để vào đúng khu vực ôn tập, luyện đề
            và rèn phản xạ từ vựng.
          </p>
        </div>

        {/* Stage Filter Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0a2012] border border-[#234a29] self-start md:self-auto">
          {[
            { id: "all", label: "Tất cả (9 cấp)" },
            { id: "Sơ cấp", label: "Sơ cấp (1-3)" },
            { id: "Trung cấp", label: "Trung cấp (4-6)" },
            { id: "Cao cấp", label: "Cao cấp (7-9)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#c3dc4e] text-[#061609] shadow-md"
                  : "text-[#9cb396] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Arched Dome Course Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredLevels.map((item) => {
          return (
            <div
              key={item.id}
              className="group relative flex flex-col bg-[#0a2012] border border-[#234a29] rounded-2xl p-4 transition-all duration-300 hover:border-[#c3dc4e]/60 hover:shadow-2xl hover:shadow-[#c3dc4e]/10"
            >
              {/* Arched Dome Visual Card with Generated Chinese Art Image */}
              <div
                className={`relative w-full aspect-[4/5] overflow-hidden ${item.archStyle} mb-5 bg-[#061609] shadow-inner`}
              >
                <Image
                  src={item.imageUrl}
                  alt={`Khóa học ${item.level}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Subtle Gradient Veil */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#061609] via-transparent to-transparent opacity-80" />

                {/* Top Badge: Stage indicator */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-black/60 text-[#c3dc4e] backdrop-blur-md border border-white/20">
                    {item.stage}
                  </span>
                </div>

                {/* Status Overlay if not open */}
                {!item.isOpen && (
                  <div className="absolute inset-0 bg-[#061609]/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4 z-20">
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#9cb396] mb-2">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-wider uppercase">
                      Sắp mở
                    </span>
                    <span className="text-[11px] text-[#9cb396] mt-1">Đang hoàn thiện đề thi</span>
                  </div>
                )}

                {/* Bottom Overlay Info on Arch */}
                <div className="absolute bottom-4 inset-x-4 z-10">
                  <span className="text-2xl font-black text-white font-sans tracking-tight block drop-shadow-md">
                    {item.level}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-[#c3dc4e] font-mono mt-0.5">
                    <span>{item.vocab}</span>
                    <span>•</span>
                    <span>{item.hanzi}</span>
                  </div>
                </div>
              </div>

              {/* 3 Action Buttons per card (Standardized according to Section A specs) */}
              <div className="mt-auto pt-3 border-t border-[#234a29] grid grid-cols-3 gap-1.5 text-center">
                {item.isOpen ? (
                  <>
                    <Link
                      href="/s/home"
                      className="py-2 px-1 rounded-lg bg-white/5 hover:bg-[#c3dc4e] hover:text-[#061609] text-[11px] font-semibold text-[#9cb396] transition flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Bài học</span>
                    </Link>

                    <Link
                      href="/s/home"
                      className="py-2 px-1 rounded-lg bg-white/5 hover:bg-[#c3dc4e] hover:text-[#061609] text-[11px] font-semibold text-[#9cb396] transition flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Luyện đề</span>
                    </Link>

                    <Link
                      href="/s/games"
                      className="py-2 px-1 rounded-lg bg-white/5 hover:bg-[#c3dc4e] hover:text-[#061609] text-[11px] font-semibold text-[#9cb396] transition flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <Gamepad2 className="w-3.5 h-3.5" />
                      <span>Game</span>
                    </Link>
                  </>
                ) : (
                  <div className="col-span-3 py-2 text-center text-xs text-[#64748b] bg-white/5 rounded-lg">
                    <span>Sắp mở · Theo tiến độ lớp</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
