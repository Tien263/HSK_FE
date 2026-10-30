"use client";

import React, { useState } from "react";
import { Sparkles, Check, Lock, ChevronRight, Award, Flame } from "lucide-react";

interface AncientScrollPathwayProps {
  lessons: Array<{
    number: number;
    titleZh: string;
    titleVi?: string;
    pinyin?: string;
  }>;
  selectedLesson: number;
  unlockedLessons: number[];
  onSelectLesson: (lessonNumber: number) => void;
  hskLevel: number;
}

export default function AncientScrollPathway({
  lessons,
  selectedLesson,
  unlockedLessons,
  onSelectLesson,
  hskLevel,
}: AncientScrollPathwayProps) {
  const [scrollExpanded, setScrollExpanded] = useState(true);

  // Lấy danh sách 15 bài học đầu tiên (hoặc toàn bộ)
  const safeLessons = Array.isArray(lessons) ? lessons : [];
  const safeUnlocked = Array.isArray(unlockedLessons) ? unlockedLessons : [1];
  const displayLessons = safeLessons.slice(0, 15);

  return (
    <div className="relative my-5 overflow-hidden rounded-3xl border-2 border-[#BC9B6B] shadow-md bg-gradient-to-b from-[#F5EEDC] via-[#FAF6ED] to-[#EFE5CD]">
      {/* 2 Trục Gỗ Hoàng Gia ở 2 bên mép cuộn chiếu chỉ */}
      <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-[#593418] via-[#8B5A2B] to-[#3E2310] shadow-md z-20 flex flex-col justify-between py-1">
        <div className="w-4 h-2 -ml-0.5 rounded-full bg-[#D4AF37] shadow-xs" />
        <div className="w-4 h-2 -ml-0.5 rounded-full bg-[#D4AF37] shadow-xs" />
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-3.5 bg-gradient-to-l from-[#593418] via-[#8B5A2B] to-[#3E2310] shadow-md z-20 flex flex-col justify-between py-1">
        <div className="w-4 h-2 -mr-0.5 rounded-full bg-[#D4AF37] shadow-xs" />
        <div className="w-4 h-2 -mr-0.5 rounded-full bg-[#D4AF37] shadow-xs" />
      </div>

      {/* Hoa văn mây cuộn chiếu chỉ Thủy Mặc viền trên & dưới */}
      <div className="px-6 pt-3.5 pb-2 flex items-center justify-between border-b border-[#BC9B6B]/40 bg-[#FAF7F0]/80">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-[#204434] text-[#D4AF37] flex items-center justify-center font-serif text-sm font-bold shadow-xs">
            圣
          </span>
          <div>
            <h3 className="font-serif font-bold text-sm text-[#204434] flex items-center gap-2">
              <span>Băng Thư Cuộn Chiếu Chỉ · Sơn Hà HSK {hskLevel}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-mono font-bold">
                {safeUnlocked.length} / {safeLessons.length} Trạm thông quan
              </span>
            </h3>
            <p className="text-[11px] text-[#315E48]">
              Chặng đường vượt ải thư pháp: Hoàn thành từng trạm để mở tiếp phong ấn tiếp theo
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setScrollExpanded(!scrollExpanded)}
          className="text-xs font-bold text-[#8F6D3B] hover:text-[#204434] hover:underline cursor-pointer transition"
        >
          {scrollExpanded ? "Thu gọn cuộn thư ▲" : "Trải chiếu chỉ ▼"}
        </button>
      </div>

      {/* Thân Chiếu Chỉ (Băng Thư Cuộn) có thể cuộn ngang mượt mà */}
      {scrollExpanded && (
        <div className="p-4 sm:p-6 overflow-x-auto scrollbar-thin scrollbar-thumb-[#BC9B6B] scrollbar-track-transparent">
          <div className="min-w-max flex items-center gap-3 py-2 px-3">
            {displayLessons.map((ls, idx) => {
              const isUnlocked = safeUnlocked.includes(ls.number);
              const isCurrent = selectedLesson === ls.number;
              const isPassed = safeUnlocked.includes(ls.number + 1);

              return (
                <React.Fragment key={ls.number}>
                  {/* Trạm Bài Học Chiếu Chỉ */}
                  <div
                    onClick={() => {
                      if (isUnlocked) onSelectLesson(ls.number);
                    }}
                    className={`relative group flex flex-col items-center p-3.5 rounded-2xl border-2 transition-all duration-300 w-32 cursor-pointer select-none ${
                      isCurrent
                        ? "bg-[#204434] border-[#D4AF37] text-white shadow-lg scale-105 ring-4 ring-[#D4AF37]/30"
                        : isUnlocked
                        ? "bg-white/95 border-[#BC9B6B] hover:border-[#204434] text-[#204434] shadow-xs hover:shadow-md hover:scale-102"
                        : "bg-[#EAE4D3]/70 border-dashed border-[#BC9B6B]/50 text-slate-400 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {/* Dấu Triện Son Thông Quan (Hợp cách) khi đã hoàn thành */}
                    {isPassed && (
                      <div className="absolute -top-2.5 -right-2 w-6 h-6 rounded-full bg-rose-700 text-white flex items-center justify-center text-[10px] font-serif font-bold shadow-xs border border-white rotate-12">
                        印
                      </div>
                    )}

                    {/* Vòng tròn số trạm */}
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-serif text-sm font-bold shadow-inner mb-2 transition ${
                        isCurrent
                          ? "bg-[#D4AF37] text-[#204434] shadow-md"
                          : isUnlocked
                          ? "bg-[#FAF7F0] text-[#204434] border border-[#BC9B6B]"
                          : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {isUnlocked ? (
                        <span>第{ls.number}</span>
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Tiêu đề chữ Hán */}
                    <div
                      className={`font-serif font-bold text-sm text-center line-clamp-1 ${
                        isCurrent ? "text-amber-100" : "text-[#204434]"
                      }`}
                    >
                      {ls.titleZh}
                    </div>

                    {/* Tiêu đề tiếng Việt */}
                    <div
                      className={`text-[10px] text-center line-clamp-1 mt-0.5 ${
                        isCurrent ? "text-[#FAF7F0]/80" : "text-[#5A7365]"
                      }`}
                    >
                      {ls.titleVi || `Bài ${ls.number}`}
                    </div>

                    {/* Trạng thái ải */}
                    <div className="mt-2 text-[9px] font-bold uppercase tracking-wider">
                      {isCurrent ? (
                        <span className="text-[#D4AF37] flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-[#D4AF37]" /> Đang luyện
                        </span>
                      ) : isPassed ? (
                        <span className="text-emerald-700">✓ Đã vượt ải</span>
                      ) : isUnlocked ? (
                        <span className="text-[#8F6D3B]">Đã mở</span>
                      ) : (
                        <span className="text-slate-400">🔒 Phong ấn</span>
                      )}
                    </div>
                  </div>

                  {/* Nét mực thư pháp nối 2 trạm chiếu chỉ */}
                  {idx < displayLessons.length - 1 && (
                    <div className="flex items-center justify-center w-6">
                      <div
                        className={`h-1 w-full rounded-full transition-all duration-300 ${
                          unlockedLessons.includes(ls.number + 1)
                            ? "bg-[#204434]"
                            : "bg-[#BC9B6B]/40"
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
