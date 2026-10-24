import React from "react";
import { AssignmentKpiData } from "./types";

interface AssignmentKpiCardsProps {
  metrics: AssignmentKpiData;
  totalRepoPackages: number;
}

export default function AssignmentKpiCards({
  metrics,
  totalRepoPackages,
}: AssignmentKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Tổng đề trong kho */}
      <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] space-y-1 shadow-2xs">
        <span className="text-[11px] text-[#315E48] font-medium block">Tổng đề trong kho</span>
        <p className="text-2xl font-serif font-bold text-[#204434]">{totalRepoPackages}</p>
        <span className="text-[10px] text-[#315E48]/70">Kho đề giáo viên</span>
      </div>

      {/* 2. Đề đã giao lớp */}
      <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] space-y-1 shadow-2xs">
        <span className="text-[11px] text-[#315E48] font-medium block">Đề đã giao lớp</span>
        <p className="text-2xl font-serif font-bold text-[#204434]">{metrics.totalAssigned}</p>
        <span className="text-[10px] text-[#315E48]/70">Đã phân phối</span>
      </div>

      {/* 3. Đang mở nhận bài */}
      <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] space-y-1 shadow-2xs">
        <span className="text-[11px] text-[#315E48] font-medium block">Đang mở nhận bài</span>
        <p className="text-2xl font-serif font-bold text-emerald-700">{metrics.totalOpen}</p>
        <span className="text-[10px] text-emerald-700 font-medium">Học sinh làm bài</span>
      </div>

      {/* 4. Chờ chấm */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFFCF6] to-[#FFF9EE] border border-[#BC9B6B]/60 space-y-1 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#8F6D3B] font-bold block">Chờ chấm</span>
          <span className="w-2 h-2 rounded-full bg-[#BC9B6B] animate-pulse" />
        </div>
        <p className="text-2xl font-serif font-bold text-[#8F6D3B]">{metrics.totalWaitingGrade}</p>
        <span className="text-[10px] text-[#8F6D3B]">Lượt nộp cần xử lý</span>
      </div>

      {/* 5. Đề nháp kho */}
      <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-amber-200 space-y-1 shadow-2xs">
        <span className="text-[11px] text-amber-800 font-medium block">Đề nháp kho</span>
        <p className="text-2xl font-serif font-bold text-amber-700">{metrics.totalDrafts}</p>
        <span className="text-[10px] text-amber-700">Chưa công bố</span>
      </div>

      {/* 6. Đã chấm điểm */}
      <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-emerald-200 space-y-1 shadow-2xs">
        <span className="text-[11px] text-emerald-800 font-medium block">Đã chấm điểm</span>
        <p className="text-2xl font-serif font-bold text-emerald-700">{metrics.totalGraded}</p>
        <span className="text-[10px] text-emerald-700">Hoàn tất chấm</span>
      </div>
    </div>
  );
}
