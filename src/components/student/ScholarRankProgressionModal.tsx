"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GraduationCap,
  Lock,
  Sparkles,
  Trophy,
  X,
  ChevronRight,
} from "lucide-react";
import {
  SCHOLAR_RANKS,
  evaluateLevelAdvancement,
  promoteToNextHskLevel,
  type LevelAdvancementStatus,
} from "@/lib/self-study-progression";

interface ScholarRankProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  hskLevel: number;
  unlockedLessons: number[];
  totalLessons: number;
  currentUser?: any;
  targetLockedLevel?: number;
  onPromoted?: (newLevel: number) => void;
}

export default function ScholarRankProgressionModal({
  isOpen,
  onClose,
  hskLevel,
  unlockedLessons,
  totalLessons,
  currentUser,
  targetLockedLevel,
  onPromoted,
}: ScholarRankProgressionModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const status: LevelAdvancementStatus = evaluateLevelAdvancement(
    hskLevel,
    unlockedLessons,
    totalLessons,
    currentUser
  );

  const { currentRank, nextRank, canAdvance } = status;

  async function handlePromote() {
    if (!canAdvance) return;
    const res = await promoteToNextHskLevel(hskLevel, currentUser);
    if (res.success) {
      onPromoted?.(res.newLevel);
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scholar-progression-title"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className="relative z-10 w-full max-w-xl bg-[#FAF4E6] border-2 border-[#BC9B6B] rounded-3xl shadow-2xl overflow-hidden text-[#2B4837]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(188, 155, 107, 0.15) 0%, transparent 65%),
            linear-gradient(to bottom, #FAF4E6 0%, #F5ECDA 100%)
          `,
        }}
      >
        {/* Ancient Header Bar */}
        <div className="h-5 bg-gradient-to-r from-[#5B3E1F] via-[#A88755] to-[#5B3E1F] flex items-center justify-between px-4 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-[#E8D49E]" />
          <span className="text-[10px] tracking-[0.25em] text-[#FAF4E6]/90 font-serif font-bold uppercase">
            HANYU · BẢNG VÀNG KHOA CỬ · QUAN LỘ THĂNG TIẾN
          </span>
          <div className="w-2 h-2 rounded-full bg-[#E8D49E]" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-7 right-5 p-1.5 rounded-full text-[#8C7A5B] hover:text-[#2B4837] hover:bg-[#EAE0CA] transition cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Locked Level Banner (if student clicked a locked HSK tab) */}
          {targetLockedLevel && targetLockedLevel > status.maxUnlockedLevel && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#943E30]/10 border border-[#943E30]/30 text-[#943E30]">
              <Lock className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">HSK {targetLockedLevel} đang bị khóa.</span>
                <p className="opacity-90">
                  Bạn cần hoàn thành điều kiện khoa cử của HSK {targetLockedLevel - 1} để được mở ải thăng cấp!
                </p>
              </div>
            </div>
          )}

          {/* Current Scholar Rank Display */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-[#EFE4D0]/80 border border-[#BC9B6B]/40 shadow-xs">
            <div className="relative w-18 h-18 rounded-2xl bg-[#2B4837] text-[#FAF4E6] flex flex-col items-center justify-center p-2 shadow-md shrink-0 border-2 border-[#BC9B6B]">
              <span className="text-2xl font-serif font-black">{currentRank.titleZh}</span>
              <span className="text-[9px] tracking-wider uppercase font-bold text-[#EADBC3]">
                HSK {hskLevel}
              </span>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#943E30] text-white text-[9px] font-bold flex items-center justify-center shadow">
                印
              </div>
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#6B5A40] text-[10px] font-bold tracking-wide">
                <GraduationCap className="w-3 h-3 text-[#A87930]" />
                <span>CẤP BẬC HỌC VỊ HIỆN TẠI</span>
              </div>
              <h3 id="scholar-progression-title" className="text-xl font-serif font-bold text-[#2B4837]">
                {currentRank.titleVi} ({currentRank.titleZh}) · HSK {hskLevel}
              </h3>
              <p className="text-xs text-[#6B5A40] leading-relaxed">
                {currentRank.description}
              </p>
            </div>
          </div>

          {/* 3 Điều Kiện Qua Cấp HSK (The 3 Level Clearance Requirements) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[#7A613E] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#BC9B6B]" />
                <span>3 Điều kiện thông quan để thăng cấp HSK {hskLevel + 1}</span>
              </h4>
              <span className="text-[11px] font-bold text-[#8C7A5B]">
                {canAdvance ? "Đủ điều kiện!" : "Đang tích lũy"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Điều kiện 1: Bài học */}
              <div
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  status.isLessonsQualified
                    ? "bg-[#E6EFE9] border-[#5A876B]/40 text-[#245238]"
                    : "bg-[#F3EBD8] border-[#BC9B6B]/30 text-[#543E1B]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      status.isLessonsQualified ? "bg-[#2E7A4A] text-white" : "bg-[#BC9B6B]/20 text-[#7A613E]"
                    }`}
                  >
                    {status.isLessonsQualified ? <CheckCircle2 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold">1. Hoàn thành toàn bộ bài học HSK {hskLevel}</div>
                    <div className="text-[11px] opacity-80">
                      Tiến độ: {status.lessonsCompleted} / {status.totalLessons} bài đã mở khóa
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      status.isLessonsQualified
                        ? "bg-[#2E7A4A]/20 text-[#2E7A4A]"
                        : "bg-[#BC9B6B]/20 text-[#7A613E]"
                    }`}
                  >
                    {status.isLessonsQualified ? "Đạt chuẩn" : `${status.lessonsCompleted}/${status.totalLessons}`}
                  </span>
                </div>
              </div>

              {/* Điều kiện 2: Thời gian học & luyện tập */}
              <div
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  status.isTimeQualified
                    ? "bg-[#E6EFE9] border-[#5A876B]/40 text-[#245238]"
                    : "bg-[#F3EBD8] border-[#BC9B6B]/30 text-[#543E1B]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      status.isTimeQualified ? "bg-[#2E7A4A] text-white" : "bg-[#BC9B6B]/20 text-[#7A613E]"
                    }`}
                  >
                    {status.isTimeQualified ? <CheckCircle2 className="w-4 h-4" /> : <Clock3 className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold">2. Tích lũy thời gian học & luyện tập</div>
                    <div className="text-[11px] opacity-80">
                      Đã rèn luyện: {status.studyMinutes} phút / Mục tiêu {status.targetMinutes} phút
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      status.isTimeQualified
                        ? "bg-[#2E7A4A]/20 text-[#2E7A4A]"
                        : "bg-[#BC9B6B]/20 text-[#7A613E]"
                    }`}
                  >
                    {status.isTimeQualified ? "Đạt chuẩn" : `${status.studyMinutes}/${status.targetMinutes}p`}
                  </span>
                </div>
              </div>

              {/* Điều kiện 3: Thi thử HSK đạt >= 60% */}
              <div
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  status.isExamQualified
                    ? "bg-[#E6EFE9] border-[#5A876B]/40 text-[#245238]"
                    : "bg-[#F3EBD8] border-[#BC9B6B]/30 text-[#543E1B]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      status.isExamQualified ? "bg-[#2E7A4A] text-white" : "bg-[#BC9B6B]/20 text-[#7A613E]"
                    }`}
                  >
                    {status.isExamQualified ? <CheckCircle2 className="w-4 h-4" /> : <FileCheck2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold">3. Khảo thí Thi thử chuẩn HSK {hskLevel}</div>
                    <div className="text-[11px] opacity-80">
                      Điểm cao nhất: {status.examScore !== null ? `${status.examScore}/100 điểm` : "Chưa thi"} (Yêu cầu ≥ 60)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {status.isExamQualified ? (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#2E7A4A]/20 text-[#2E7A4A]">
                      {status.examScore} điểm
                    </span>
                  ) : (
                    <Link
                      href={`/s/mock-exam?level=${hskLevel}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#A87930] hover:underline"
                    >
                      <span>Vào thi</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action / Promotion CTA */}
          <div className="pt-2">
            {canAdvance ? (
              <button
                type="button"
                onClick={handlePromote}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2B4837] via-[#3E5F48] to-[#2B4837] hover:brightness-110 text-[#FAF4E6] font-serif font-bold text-base shadow-lg transition flex items-center justify-center gap-2.5 border border-[#BC9B6B] cursor-pointer animate-pulse"
              >
                <Sparkles className="w-5 h-5 text-[#E8D49E]" />
                <span>SẮC PHONG THĂNG CẤP LÊN {nextRank?.titleVi.toUpperCase()} (HSK {hskLevel + 1})</span>
                <Trophy className="w-5 h-5 text-[#E8D49E]" />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/s/mock-exam?level=${hskLevel}`}
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-[#BC9B6B] hover:bg-[#a88755] text-white text-xs font-bold text-center shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Làm Đề Thi Thử HSK {hskLevel} (Điều kiện 3)</span>
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-[#EBE0CD] hover:bg-[#DFD3BE] text-[#4A3D28] text-xs font-bold transition cursor-pointer border border-[#BC9B6B]/40"
                >
                  Tiếp tục rèn luyện
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Ancient Bottom Roller Bar Decoration */}
        <div className="h-3 bg-gradient-to-r from-[#5B3E1F] via-[#A88755] to-[#5B3E1F] shadow-inner" />
      </div>
    </div>
  );
}
