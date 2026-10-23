"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  Trophy,
  Target,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Award,
} from "lucide-react";

interface StudentRoadmapWorkspaceProps {
  currentUser?: any;
  onNavigateToTab?: (tab: string) => void;
  classesCount?: number;
  onOpenJoinModal?: () => void;
}

export default function StudentRoadmapWorkspace({
  currentUser,
  onNavigateToTab,
  classesCount = 0,
  onOpenJoinModal,
}: StudentRoadmapWorkspaceProps) {
  const [selectedHskLevel, setSelectedHskLevel] = useState<number>(1);

  if (classesCount === 0) {
    return (
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-10 sm:p-14 text-center shadow-2xs space-y-4 max-w-2xl mx-auto my-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-[#FAF7F0] text-[#315E48] border border-[#E5DEC9] flex items-center justify-center mx-auto shadow-2xs">
          <Compass className="w-8 h-8 text-[#204434]" />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-xl text-[#204434]">
            Lộ trình học tập chưa được kích hoạt
          </h3>
          <p className="text-xs text-[#315E48] leading-relaxed max-w-md mx-auto">
            Lộ trình cá nhân hóa được mở khóa và đồng bộ trực tiếp theo giáo trình của lớp bạn theo học. Hãy tham gia lớp học để mở khóa toàn bộ các chặng học tập từ HSK 1 đến HSK 6!
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => (onOpenJoinModal ? onOpenJoinModal() : onNavigateToTab?.("classes"))}
            className="px-6 py-3 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-md shadow-[#204434]/15 inline-flex items-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
            <span>Tham gia lớp học ngay</span>
          </button>
        </div>
      </div>
    );
  }

  // Roadmap Stages for HSK 1
  const stages = [
    {
      id: "stage-1",
      title: "Chặng 1: Nền tảng Ngữ âm & 50 Hán tự đầu tiên",
      desc: "Làm chủ 21 Thanh mẫu, 36 Vận mẫu, 4 Thanh điệu và quy tắc biến âm. Nhận diện các nét bút cơ bản.",
      status: "COMPLETED",
      progress: 100,
      lessonsCount: 4,
      xpEarned: 450,
      badge: "Phát âm chuẩn xác",
    },
    {
      id: "stage-2",
      title: "Chặng 2: Giao tiếp chào hỏi & Bản thân",
      desc: "Học cách tự giới thiệu bản thân, quốc tịch, gia đình, nghề nghiệp và câu hỏi nghi vấn 吗, 呢.",
      status: "IN_PROGRESS",
      progress: 65,
      lessonsCount: 5,
      xpEarned: 280,
      badge: "Giao tiếp cơ bản",
    },
    {
      id: "stage-3",
      title: "Chặng 3: Mua sắm, Số đếm & Thời gian",
      desc: "Nói về giờ giấc, ngày tháng năm, giá cả hàng hóa, cấu trúc 太...了 và trợ từ ngữ khí 了.",
      status: "LOCKED",
      progress: 0,
      lessonsCount: 5,
      xpEarned: 0,
      badge: "Sinh hoạt thực tế",
    },
    {
      id: "stage-4",
      title: "Chặng 4: Vượt ải HSK 1 & Thi thử trực tuyến",
      desc: "Tổng hợp 150 từ vựng cốt lõi HSK 1, 15 chủ điểm ngữ pháp và luyện 3 bộ đề thi thử chuẩn format 2026.",
      status: "LOCKED",
      progress: 0,
      lessonsCount: 4,
      xpEarned: 0,
      badge: "Chứng chỉ HSK 1",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#204434]">
              Lộ trình chinh phục HSK 3.0
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] text-xs font-semibold border border-[#204434]/20">
              Cây tiến trình
            </span>
          </div>
          <p className="text-xs text-[#315E48] mt-1">
            Bản đồ học tập cá nhân hóa từng chặng từ HSK 1 đến HSK 6 theo tiêu chuẩn Khung năng lực tiếng Trung Quốc tế.
          </p>
        </div>

        {/* HSK Level Tabs */}
        <div className="flex items-center gap-1.5 bg-[#FFFCF6] border border-[#E5DEC9] p-1 rounded-2xl shadow-2xs overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedHskLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                selectedHskLevel === lvl
                  ? "bg-[#204434] text-white shadow-xs"
                  : "text-[#315E48] hover:text-[#204434] hover:bg-[#FAF7F0]"
              }`}
            >
              HSK {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Progress Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFFCF6] to-[#FFF9EE] border border-[#BC9B6B]/60 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#204434] text-[#FFFCF6] flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              HSK {selectedHskLevel}
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Tiến độ cấp độ HSK {selectedHskLevel} (Sơ cấp)
              </h3>
              <p className="text-xs text-[#315E48]">
                Đã hoàn thành 1 / 4 chặng học tập (41% toàn cấp độ)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#8F6D3B] bg-[#FFFBF0] px-3 py-1 rounded-full border border-[#BC9B6B]/40">
              🎯 Mục tiêu: Đạt 195/200 điểm
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-[#315E48]">
            <span>Tổng tiến độ</span>
            <span className="font-bold text-[#204434]">41%</span>
          </div>
          <div className="h-3 w-full bg-[#E5DEC9]/50 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#204434] to-[#315E48] rounded-full transition-all duration-700"
              style={{ width: "41%" }}
            />
          </div>
        </div>
      </div>

      {/* Roadmap Path Stages */}
      <div className="space-y-4 relative">
        {stages.map((stg, idx) => {
          const isCompleted = stg.status === "COMPLETED";
          const isInProgress = stg.status === "IN_PROGRESS";
          const isLocked = stg.status === "LOCKED";

          return (
            <div
              key={stg.id}
              className={`p-6 rounded-3xl border transition shadow-2xs relative ${
                isCompleted
                  ? "bg-[#FFFCF6] border-emerald-200"
                  : isInProgress
                  ? "bg-[#FFFCF6] border-[#BC9B6B] ring-2 ring-[#BC9B6B]/20"
                  : "bg-[#FAF7F0]/60 border-[#E5DEC9] opacity-75"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-800"
                        : isInProgress
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                    ) : isInProgress ? (
                      <Play className="w-5 h-5 text-amber-800 fill-amber-800" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Stage Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48]">
                        Bước {idx + 1}
                      </span>
                      {isInProgress && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          Đang học hiện tại
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Đã hoàn thành
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-base text-[#204434]">
                      {stg.title}
                    </h4>
                    <p className="text-xs text-[#315E48] leading-relaxed max-w-2xl">
                      {stg.desc}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-[#315E48] pt-2">
                      <span>{stg.lessonsCount} bài học</span>
                      <span>•</span>
                      <span className="text-[#8F6D3B] font-semibold">+{stg.xpEarned} XP</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#204434] font-medium">
                        <Award className="w-3.5 h-3.5 text-[#BC9B6B]" />
                        <span>Huy hiệu: {stg.badge}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="sm:self-center shrink-0">
                  {isInProgress ? (
                    <button
                      onClick={() => onNavigateToTab?.("lessons")}
                      className="px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <span>Vào học tiếp</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : isCompleted ? (
                    <button
                      onClick={() => onNavigateToTab?.("lessons")}
                      className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] cursor-pointer"
                    >
                      Xem lại bài học
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Cần hoàn thành chặng trước</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
