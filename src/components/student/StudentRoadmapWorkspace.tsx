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
  Clock,
  Zap,
} from "lucide-react";
import { OFFICIAL_HSK1_15_LESSONS } from "@/lib/hsk1-full-lessons";

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
            Lộ trình học tập 15 bài học HSK 1 được đồng bộ trực tiếp theo giáo trình của lớp bạn theo học. Hãy tham gia lớp học để mở khóa toàn bộ các chặng học tập từ HSK 1 đến HSK 6!
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

  // Danh sách bài học đã hoàn thành thực tế của học sinh
  const [completedLessonIds] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_student_completed_lessons");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Tính số bài đã học trong từng chặng
  const s1Done = completedLessonIds.filter((id) => [1, 2, 3, 4].includes(id)).length;
  const s2Done = completedLessonIds.filter((id) => [5, 6, 7, 8].includes(id)).length;
  const s3Done = completedLessonIds.filter((id) => [9, 10, 11, 12].includes(id)).length;
  const s4Done = completedLessonIds.filter((id) => [13, 14, 15].includes(id)).length;

  const totalDoneCount = s1Done + s2Done + s3Done + s4Done;
  const totalPercent = Math.min(100, Math.round((totalDoneCount / 15) * 100));

  // 4 Stages covering all 15 official HSK 1 lessons
  const stages = [
    {
      id: "stage-1",
      stageNumber: 1,
      title: "Chặng 1: Nền tảng Ngữ âm & Chào hỏi ban đầu",
      desc: "Làm chủ 21 Thanh mẫu, 36 Vận mẫu, 4 Thanh điệu và các mẫu câu chào hỏi, giới thiệu tên tuổi, gia đình.",
      status: s1Done === 4 ? "COMPLETED" : "IN_PROGRESS",
      progress: Math.round((s1Done / 4) * 100),
      xpEarned: s1Done * 100,
      badge: "Ngữ âm chuẩn xác",
      lessonIds: [1, 2, 3, 4],
      lessons: OFFICIAL_HSK1_15_LESSONS.slice(0, 4),
    },
    {
      id: "stage-2",
      stageNumber: 2,
      title: "Chặng 2: Sinh hoạt, Thời gian & Nghỉ ngơi",
      desc: "Học cách nói về ngày nghỉ, trao đổi số điện thoại, thời gian biểu tan làm và nghề nghiệp của các thành viên gia đình.",
      status: s1Done === 4 ? (s2Done === 4 ? "COMPLETED" : "IN_PROGRESS") : "LOCKED",
      progress: Math.round((s2Done / 4) * 100),
      xpEarned: s2Done * 100,
      badge: "Giao tiếp sinh hoạt",
      lessonIds: [5, 6, 7, 8],
      lessons: OFFICIAL_HSK1_15_LESSONS.slice(4, 8),
    },
    {
      id: "stage-3",
      stageNumber: 3,
      title: "Chặng 3: Học tập, Mua sắm & Đời sống",
      desc: "Nói về trường học, hỏi giá cả mua sắm đồ ăn thức uống, đời sống sinh viên đại học và dự báo thời tiết.",
      status: s2Done === 4 ? (s3Done === 4 ? "COMPLETED" : "IN_PROGRESS") : "LOCKED",
      progress: Math.round((s3Done / 4) * 100),
      xpEarned: s3Done * 100,
      badge: "Đời sống thực tế",
      lessonIds: [9, 10, 11, 12],
      lessons: OFFICIAL_HSK1_15_LESSONS.slice(8, 12),
    },
    {
      id: "stage-4",
      stageNumber: 4,
      title: "Chặng 4: Giao tiếp mở rộng & Vượt ải HSK 1",
      desc: "Mẫu câu gọi món/uống trà, xem phim giải trí, hẹn gặp tại sân bay và tổng kết 150 từ vựng cốt lõi chuẩn bị thi.",
      status: s3Done === 4 ? (s4Done === 3 ? "COMPLETED" : "IN_PROGRESS") : "LOCKED",
      progress: Math.round((s4Done / 3) * 100),
      xpEarned: s4Done * 100,
      badge: "Chiến binh HSK 1",
      lessonIds: [13, 14, 15],
      lessons: OFFICIAL_HSK1_15_LESSONS.slice(12, 15),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#204434]">
              Lộ trình 15 Bài học HSK 1
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] text-xs font-semibold border border-[#204434]/20">
              4 Chặng bứt phá
            </span>
          </div>
          <p className="text-xs text-[#315E48] mt-1">
            Bản đồ tiến trình theo sát 15 bài học chính thức. Giáo viên mở bài học theo lịch và kết quả kiểm tra từng chặng.
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
                Tiến độ cấp độ HSK {selectedHskLevel} (Sơ cấp 15 bài)
              </h3>
              <p className="text-xs text-[#315E48]">
                Đã hoàn thành {stages.filter((s) => s.status === "COMPLETED").length} / 4 chặng học tập ({totalDoneCount}/15 bài học)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#8F6D3B] bg-[#FFFBF0] px-3 py-1 rounded-full border border-[#BC9B6B]/40">
              🎯 Mục tiêu: Đạt 190+/200 điểm HSK 1
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-[#315E48]">
            <span>Tổng tiến độ toàn khóa</span>
            <span className="font-bold text-[#204434]">{totalPercent}%</span>
          </div>
          <div className="h-3 w-full bg-[#E5DEC9]/50 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#204434] to-[#315E48] rounded-full transition-all duration-700"
              style={{ width: `${totalPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Roadmap Path Stages */}
      <div className="space-y-5 relative">
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
                  : "bg-[#FAF7F0]/60 border-[#E5DEC9] opacity-80"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#E5DEC9]/70">
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
                        Chặng {idx + 1}
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

                    <div className="flex items-center gap-4 text-xs text-[#315E48] pt-1">
                      <span>{stg.lessons.length} bài học</span>
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
                      <span>Vào học chặng này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : isCompleted ? (
                    <button
                      onClick={() => onNavigateToTab?.("lessons")}
                      className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] cursor-pointer"
                    >
                      Xem lại các bài
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Chờ giáo viên mở khóa</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Danh sách các bài học thuộc chặng */}
              <div className="pt-4 space-y-2">
                <span className="text-[11px] font-bold text-[#204434] block">Các bài học trong chặng:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {stg.lessons.map((ls) => (
                    <div
                      key={ls.id}
                      onClick={() => onNavigateToTab?.("lessons")}
                      className="p-3 rounded-2xl bg-white/80 border border-[#E5DEC9] hover:border-[#204434] hover:shadow-xs transition cursor-pointer flex flex-col justify-between space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#8F6D3B]">
                          Bài {String(ls.number).padStart(2, "0")}
                        </span>
                        <span className="text-[10px] text-[#315E48] font-medium">{ls.durationMin}p</span>
                      </div>
                      <div>
                        <div className="font-serif font-bold text-sm text-[#204434] truncate">
                          {ls.titleZh}
                        </div>
                        <div className="text-[11px] text-[#315E48] truncate">
                          {ls.titleVi}
                        </div>
                      </div>
                      <div className="text-[10px] text-[#315E48]/70 flex items-center justify-between pt-1 border-t border-[#E5DEC9]/40">
                        <span>{ls.vocabCount} từ mới</span>
                        <ChevronRight className="w-3 h-3 text-[#204434]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
