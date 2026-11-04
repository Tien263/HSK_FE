"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Award,
  Sparkles,
  FileCheck2,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  TrendingUp,
  Flame,
  Volume2,
} from "lucide-react";

interface HskLevelMasteryWidgetProps {
  level: number;
  totalLessons: number;
  openCount: number;
  totalVocab: number;
  unlockedVocab: number;
  totalGrammar: number;
  unlockedGrammar: number;
  onOpenVocabModal: () => void;
  onOpenStudyRoomModal: () => void;
}

export default function HskLevelMasteryWidget({
  level,
  totalLessons,
  openCount,
  totalVocab,
  unlockedVocab,
  totalGrammar,
  unlockedGrammar,
  onOpenVocabModal,
  onOpenStudyRoomModal,
}: HskLevelMasteryWidgetProps) {
  const percentLessons = Math.min(100, Math.round((openCount / Math.max(1, totalLessons)) * 100));
  const isAllLessonsUnlocked = openCount >= totalLessons;

  return (
    <div className="w-full space-y-4 my-2">
      {/* TIÊU ĐỀ KHỐI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-serif uppercase tracking-widest text-[#8F6D3B] font-bold">
            HANYU · THƯ ĐỒNG ĐO LƯỜNG NĂNG LỰC HSK {level}
          </p>
          <h2 className="font-serif font-black text-xl text-[#204434] tracking-tight">
            Tiến Độ Thông Quan & Chỉ Số Cốt Lõi
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#FAF5E6] border border-[#BC9B6B]/40 text-[#8F6D3B] flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{openCount} / {totalLessons} bài đã mở ({percentLessons}%)</span>
          </span>
        </div>
      </div>

      {/* 3 THẺ CHỈ SỐ NĂNG LỰC THẬT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Thẻ 1: Tiến độ bài học */}
        <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/30 hover:border-[#8F6D3B] transition shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[#204434] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#8F6D3B]" />
              <span>Tiến Độ Giáo Trình</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {percentLessons}%
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-serif font-black text-[#204434]">{openCount}</span>
              <span className="text-xs font-serif text-stone-500">/ {totalLessons} bài học</span>
            </div>
            {/* Thanh tiến độ */}
            <div className="w-full h-2 rounded-full bg-[#EFE9D9] overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-[#204434] to-[#43773B] rounded-full transition-all duration-500"
                style={{ width: `${percentLessons}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-stone-600 leading-relaxed italic border-t border-[#BC9B6B]/15 pt-2">
            {isAllLessonsUnlocked
              ? "Đã hoàn thành toàn bộ bài học trong cấp độ!"
              : `Còn ${totalLessons - openCount} bài cần khổ luyện thông quan.`}
          </p>
        </div>

        {/* Thẻ 2: Kho từ vựng đã tiếp cận */}
        <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/30 hover:border-[#8F6D3B] transition shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[#204434] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-700" />
              <span>Từ Vựng HSK {level}</span>
            </span>
            <button
              type="button"
              onClick={onOpenVocabModal}
              className="text-[10px] text-[#8F6D3B] hover:text-[#204434] underline font-bold cursor-pointer"
            >
              Mở sổ SRS
            </button>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-serif font-black text-[#204434]">{unlockedVocab}</span>
              <span className="text-xs font-serif text-stone-500">/ {totalVocab} từ</span>
            </div>
            {/* Thanh tiến độ từ vựng */}
            <div className="w-full h-2 rounded-full bg-[#EFE9D9] overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((unlockedVocab / Math.max(1, totalVocab)) * 100)}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-stone-600 leading-relaxed italic border-t border-[#BC9B6B]/15 pt-2">
            Đã nạp qua các bài đã mở, sẵn sàng rèn luyện với 5 hộp nhớ Leitner.
          </p>
        </div>

        {/* Thẻ 3: Điểm ngữ pháp cốt lõi */}
        <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/30 hover:border-[#8F6D3B] transition shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[#204434] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-700" />
              <span>Ngữ Pháp Trọng Điểm</span>
            </span>
            <button
              type="button"
              onClick={onOpenStudyRoomModal}
              className="text-[10px] text-[#8F6D3B] hover:text-[#204434] underline font-bold cursor-pointer"
            >
              Vân Tự Tập Thất
            </button>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-serif font-black text-[#204434]">{unlockedGrammar}</span>
              <span className="text-xs font-serif text-stone-500">/ {totalGrammar} cấu trúc</span>
            </div>
            {/* Thanh tiến độ ngữ pháp */}
            <div className="w-full h-2 rounded-full bg-[#EFE9D9] overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-blue-700 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((unlockedGrammar / Math.max(1, totalGrammar)) * 100)}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-stone-600 leading-relaxed italic border-t border-[#BC9B6B]/15 pt-2">
            Gồm các mẫu câu then chốt, ngữ cảnh đối thoại và các lỗi sai hay gặp.
          </p>
        </div>
      </div>

      {/* BANNER ĐIỀU KIỆN THÔNG QUAN LÊN CẤP TIẾP THEO (PASSPORT GATE) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF6ED] via-[#F4EEDB] to-[#EAE0C8] border-2 border-[#BC9B6B]/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h3 className="font-serif font-black text-base text-[#204434]">
              Điều Kiện Thông Quan Lên Cấp HSK {Math.min(6, level + 1)}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#204434] text-[#FAF5E6] font-bold">
              Cổng Vượt Cấp
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#315E48]">
            <span className="flex items-center gap-1.5 font-semibold">
              {isAllLessonsUnlocked ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-amber-600 text-[10px] flex items-center justify-center font-bold text-amber-700">
                  1
                </span>
              )}
              <span>Hoàn thành 100% bài học ({openCount}/{totalLessons} bài)</span>
            </span>

            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-3.5 h-3.5 rounded-full border border-amber-600 text-[10px] flex items-center justify-center font-bold text-amber-700">
                2
              </span>
              <span>Thi thử HSK {level} đạt tối thiểu 180 / 300 điểm</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href={`/s/mock-exam?level=${level}`} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FAF5E6] text-xs font-serif font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Vào Thi Thử HSK {level}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
