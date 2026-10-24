import React from "react";
import { Search, Plus, Sparkles, Send } from "lucide-react";
import { AssignmentTabType, AssignmentKpiData } from "./types";

interface AssignmentFilterTabsProps {
  activeTab: AssignmentTabType;
  onTabChange: (tab: AssignmentTabType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  metrics: AssignmentKpiData;
  totalAssignments: number;
  totalArchived: number;
  onOpenCreateExam: () => void;
  onOpenAssignModal: () => void;
}

export default function AssignmentFilterTabs({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  metrics,
  totalAssignments,
  totalArchived,
  onOpenCreateExam,
  onOpenAssignModal,
}: AssignmentFilterTabsProps) {
  const tabs = [
    {
      id: "ALL" as AssignmentTabType,
      label: `Tất cả đề đã giao (${totalAssignments})`,
    },
    {
      id: "OPEN" as AssignmentTabType,
      label: `Đang mở (${metrics.totalOpen})`,
    },
    {
      id: "SUBMISSIONS" as AssignmentTabType,
      label: `Chờ chấm (${metrics.totalWaitingGrade})`,
      highlight: metrics.totalWaitingGrade > 0,
    },
    {
      id: "CLOSED" as AssignmentTabType,
      label: `Đã đóng (${metrics.totalClosed})`,
    },
    {
      id: "DRAFT_EXAMS" as AssignmentTabType,
      label: `Đề nháp kho (${metrics.totalDrafts})`,
    },
    {
      id: "READY_EXAMS" as AssignmentTabType,
      label: `Đề hoàn thiện kho (${metrics.totalReady})`,
    },
    {
      id: "ARCHIVED" as AssignmentTabType,
      label: `Lưu trữ (${totalArchived})`,
    },
  ];

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Subtabs list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                activeTab === t.id
                  ? "bg-[#204434] text-white shadow-xs"
                  : t.highlight
                  ? "bg-amber-100/80 text-amber-900 border border-amber-300 hover:bg-amber-200"
                  : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#F3EFE6]"
              }`}
            >
              {t.label}
              {t.highlight && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCreateExam}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#204434] border border-[#204434] hover:bg-[#F3EFE6] rounded-xl text-xs font-bold transition shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
            Ghép đề mới
          </button>
          <button
            onClick={onOpenAssignModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#204434] hover:bg-[#163024] text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            Giao bài cho lớp
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#315E48]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm đề bài, tên lớp học, mã đề..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#E5DEC9] rounded-xl focus:outline-none focus:border-[#204434] text-[#204434]"
        />
      </div>
    </div>
  );
}
