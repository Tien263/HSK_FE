"use client";

import React from "react";
import {
  Users,
  BookOpen,
  FileCheck2,
  TrendingUp,
  Key,
  Calendar,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { ClassDetailItem } from "../types";

interface OverviewTabProps {
  currentClass: ClassDetailItem;
  studentsCount: number;
  publishedLessonsCount: number;
  assignmentsCount: number;
  onNavigateSubTab: (subTab: string) => void;
  onOpenManualStudentModal?: () => void;
}

export default function OverviewTab({
  currentClass,
  studentsCount,
  publishedLessonsCount,
  assignmentsCount,
  onNavigateSubTab,
  onOpenManualStudentModal,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* 4 Thẻ KPI Tổng quan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sĩ số */}
        <div
          onClick={() => onNavigateSubTab("students")}
          className="p-5 rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] shadow-2xs hover:border-[#1F513F] transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B766D]">Học sinh lớp</span>
            <div className="w-8 h-8 rounded-xl bg-[#1F513F]/10 text-[#1F513F] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#17382F]">
            {studentsCount}
          </div>
          <p className="text-[11px] text-[#6B766D]">
            Học viên đang học tích cực
          </p>
        </div>

        {/* Bài học đã mở */}
        <div
          onClick={() => onNavigateSubTab("curriculum")}
          className="p-5 rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] shadow-2xs hover:border-[#1F513F] transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B766D]">Bài học đã mở</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-emerald-700">
            {publishedLessonsCount} <span className="text-sm font-normal text-[#6B766D]">/ 15</span>
          </div>
          <p className="text-[11px] text-[#6B766D]">
            Đã công bố cho học sinh
          </p>
        </div>

        {/* Bài tập đã giao */}
        <div
          onClick={() => onNavigateSubTab("assignments")}
          className="p-5 rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] shadow-2xs hover:border-[#1F513F] transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B766D]">Bài tập & Đề thi</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#8F6D3B]">
            {assignmentsCount}
          </div>
          <p className="text-[11px] text-[#6B766D]">
            Đề thi phân phối riêng cho lớp
          </p>
        </div>

        {/* Tiến độ hoàn thành */}
        <div className="p-5 rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B766D]">Tỷ lệ hoàn thành</span>
            <div className="w-8 h-8 rounded-xl bg-[#BC9B6B]/20 text-[#8F6D3B] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#17382F]">
            {currentClass.progressPercent !== null ? `${currentClass.progressPercent}%` : "Chưa có"}
          </div>
          <p className="text-[11px] text-[#6B766D]">
            Tỷ lệ nộp bài của học sinh
          </p>
        </div>
      </div>

      {/* Thông tin lớp & Phím tắt nhanh */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin lớp học (2 cột) */}
        <div className="lg:col-span-2 rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-6 shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-base text-[#17382F]">
            Thông tin lớp học
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#F7F5EE]/60 border border-[#E5DFD0] space-y-1">
              <span className="text-[11px] text-[#6B766D] font-medium block">Mã tham gia lớp</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono font-bold text-[#1F513F] tracking-wider">
                  {currentClass.code}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(currentClass.code);
                      alert("Đã sao chép mã lớp!");
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#E5DFD0] text-[10px] font-semibold text-[#17382F] hover:bg-[#FAF7F0] cursor-pointer"
                >
                  Sao chép
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F5EE]/60 border border-[#E5DFD0] space-y-1">
              <span className="text-[11px] text-[#6B766D] font-medium block">Thời gian học</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#17382F] pt-1">
                <Calendar className="w-3.5 h-3.5 text-[#1F513F]" />
                <span>{currentClass.startDate} – {currentClass.endDate}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F5EE]/60 border border-[#E5DFD0] space-y-1">
              <span className="text-[11px] text-[#6B766D] font-medium block">Hệ đào tạo & Cấp độ</span>
              <span className="text-xs font-bold text-[#17382F] block pt-1">
                {currentClass.track === "HSK" ? `Khung HSK 3.0 (Cấp độ ${currentClass.level || 1})` : currentClass.track}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F5EE]/60 border border-[#E5DFD0] space-y-1">
              <span className="text-[11px] text-[#6B766D] font-medium block">Trạng thái lớp</span>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mt-1">
                {currentClass.statusText || "Đang hoạt động"}
              </span>
            </div>
          </div>

          {currentClass.description && (
            <div className="pt-2 text-xs text-[#6B766D] leading-relaxed border-t border-[#E5DFD0]/60">
              <strong className="text-[#17382F]">Mô tả lớp:</strong> {currentClass.description}
            </div>
          )}
        </div>

        {/* Lối tắt thao tác nhanh (1 cột) */}
        <div className="rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-6 shadow-2xs space-y-3">
          <h3 className="font-serif font-bold text-base text-[#17382F]">
            Thao tác nhanh
          </h3>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onNavigateSubTab("curriculum")}
              className="w-full p-3 rounded-2xl bg-white border border-[#E5DFD0] hover:border-[#1F513F] transition text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#17382F] group-hover:text-[#1F513F]">
                    Công bố bài học mới
                  </div>
                  <div className="text-[10px] text-[#6B766D]">
                    Mở khóa bài tiếp theo cho lớp
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1F513F]" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateSubTab("assignments")}
              className="w-full p-3 rounded-2xl bg-white border border-[#E5DFD0] hover:border-[#1F513F] transition text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#17382F] group-hover:text-[#1F513F]">
                    Giao bài tập & đề thi
                  </div>
                  <div className="text-[10px] text-[#6B766D]">
                    Chọn đề và đặt hạn nộp
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1F513F]" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenManualStudentModal) onOpenManualStudentModal();
                else onNavigateSubTab("students");
              }}
              className="w-full p-3 rounded-2xl bg-white border border-[#E5DFD0] hover:border-[#1F513F] transition text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#17382F] group-hover:text-[#1F513F]">
                    Cấp tài khoản học sinh
                  </div>
                  <div className="text-[10px] text-[#6B766D]">
                    Thêm trực tiếp vào lớp
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1F513F]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
