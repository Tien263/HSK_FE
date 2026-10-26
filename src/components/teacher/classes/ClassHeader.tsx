"use client";

import React from "react";
import Image from "next/image";
import {
  ChevronLeft,
  Users,
  BookOpen,
  FileCheck2,
  FileSpreadsheet,
  Calendar,
  BarChart3,
  Settings,
  LayoutDashboard,
  Share2,
  Copy,
} from "lucide-react";
import { ClassDetailItem } from "./types";

interface ClassHeaderProps {
  currentClass: ClassDetailItem;
  activeSubTab: string;
  setActiveSubTab: (tab: any) => void;
  onBackToList: () => void;
  studentsCount: number;
  onOpenDiagnostics?: () => void;
}

export default function ClassHeader({
  currentClass,
  activeSubTab,
  setActiveSubTab,
  onBackToList,
  studentsCount,
  onOpenDiagnostics,
}: ClassHeaderProps) {
  const tabs = [
    { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
    { id: "curriculum", label: "Lộ trình bài học", icon: BookOpen },
    { id: "students", label: `Học sinh (${studentsCount})`, icon: Users },
    { id: "assignments", label: "Bài tập & Đề thi", icon: FileCheck2 },
    { id: "materials", label: "Tài liệu", icon: FileSpreadsheet },
    { id: "schedule", label: "Lịch học", icon: Calendar },
    { id: "reports", label: "Báo cáo", icon: BarChart3 },
    { id: "settings", label: "Cài đặt lớp", icon: Settings },
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar with Breadcrumb and Class Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToList}
            className="p-2 rounded-xl bg-white border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#17382F] transition cursor-pointer shadow-2xs"
            title="Quay lại danh sách lớp"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl overflow-hidden relative border border-[#E5DEC9] shrink-0 bg-[#F7F5EE]">
            <Image
              src={currentClass.artwork || "/theme/card-hsk-scroll.webp"}
              alt={currentClass.name}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-[#17382F]">
                {currentClass.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1F513F]/10 text-[#1F513F] border border-[#1F513F]/20">
                HSK {currentClass.level}
              </span>
            </div>
            <p className="text-xs text-[#6B766D] mt-0.5">
              Mã tham gia: <strong className="font-mono text-[#1F513F] font-bold">{currentClass.code}</strong> • Sĩ số: {studentsCount} học viên
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(currentClass.code);
                alert(`Đã sao chép mã mời lớp: ${currentClass.code}`);
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E5DEC9] hover:bg-[#FAF7F0] text-xs font-semibold text-[#17382F] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5 text-[#BC9B6B]" />
            <span>Mã: {currentClass.code}</span>
          </button>
        </div>
      </div>

      {/* Subtabs bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#E5DEC9]/60">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#1F513F] text-white shadow-xs"
                  : "bg-white text-[#6B766D] border border-[#E5DEC9] hover:bg-[#FAF7F0] hover:text-[#17382F]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
