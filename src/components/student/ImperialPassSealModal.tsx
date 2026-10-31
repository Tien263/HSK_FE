"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, BookOpen, CheckCircle, Dumbbell, Feather, Sparkles, Trophy, X } from "lucide-react";

interface ImperialPassSealModalProps {
  isOpen: boolean;
  onClose: () => void;
  hskLevel: number;
  completedLessonNumber: number;
  nextLessonNumber?: number;
  xpReward?: number;
  onNextLesson?: (nextNumber: number) => void;
  onPractice?: () => void;
  onWriteNotes?: () => void;
}

export default function ImperialPassSealModal({
  isOpen,
  onClose,
  hskLevel,
  completedLessonNumber,
  nextLessonNumber,
  xpReward = 50,
  onNextLesson,
  onPractice,
  onWriteNotes,
}: ImperialPassSealModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKeyDown);
      prev?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const targetNext = nextLessonNumber || completedLessonNumber + 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="imperial-pass-title"
    >
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Royal Scroll Imperial Edict Container */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-lg bg-[#FAF4E6] border-2 border-[#BC9B6B] rounded-3xl shadow-2xl overflow-hidden text-[#2B4837]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(188, 155, 107, 0.15) 0%, transparent 60%),
            linear-gradient(to bottom, #FAF4E6 0%, #F3EBD8 100%)
          `,
        }}
      >
        {/* Ancient Scroll Top Roller Bar Decoration */}
        <div className="h-4 bg-gradient-to-r from-[#5B3E1F] via-[#A88755] to-[#5B3E1F] flex items-center justify-between px-3 shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E8D49E] shadow" />
          <div className="text-[9px] tracking-[0.25em] text-[#FAF4E6]/90 font-serif uppercase">
            HANYU · THÔNG QUAN VĂN ĐIỆP
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#E8D49E] shadow" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-5 p-1.5 rounded-full text-[#8C7A5B] hover:text-[#2B4837] hover:bg-[#EAE0CA] transition cursor-pointer"
          aria-label="Đóng thông báo"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-7 sm:p-9 text-center space-y-6">
          {/* Header Seal Banner */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EADBC3] border border-[#BC9B6B]/40 text-[#7A613E] text-xs font-serif font-bold tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
            <span>KHẢO THÍ VIÊN MÃN · THI CỬ ĐỖ ĐẠT</span>
          </div>

          {/* Imperial Vermilion Seal Stamp Graphic */}
          <div className="relative py-2 flex justify-center items-center">
            {/* Pulsing Aura */}
            <div className="absolute w-32 h-32 rounded-full bg-[#BC9B6B]/20 animate-ping opacity-30" />

            {/* Stamp Body */}
            <div
              className="relative w-28 h-28 border-4 border-[#943E30] rounded-2xl flex flex-col items-center justify-center p-2 text-[#943E30] font-serif shadow-lg transform -rotate-3 transition-transform hover:scale-105"
              style={{
                boxShadow: "0 0 24px rgba(148, 62, 48, 0.25), inset 0 0 12px rgba(148, 62, 48, 0.15)",
                background: "rgba(148, 62, 48, 0.04)",
              }}
            >
              <div className="text-3xl font-black tracking-widest leading-tight">通关</div>
              <div className="text-[10px] font-bold tracking-widest uppercase border-t border-[#943E30]/50 pt-1 mt-0.5">
                ĐÃ THÔNG QUAN
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-[#943E30] text-[#FAF4E6] flex items-center justify-center text-[10px] font-bold shadow">
                印
              </div>
            </div>
          </div>

          {/* Title and Congratulations */}
          <div className="space-y-2">
            <h3 id="imperial-pass-title" className="text-2xl sm:text-3xl font-serif font-bold text-[#2B4837]">
              Thông Quan HSK {hskLevel} · Bài {completedLessonNumber}
            </h3>
            <p className="text-sm text-[#6B5A40] max-w-sm mx-auto leading-relaxed">
              Bút nghiên không phụ người có chí. Bạn đã chinh phục trọn vẹn kiến thức và chính thức được khai mở cửa ải tiếp theo!
            </p>
          </div>

          {/* XP & Rewards Badge */}
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#EEDEB9] to-[#E5CF9E] border border-[#BC9B6B] text-[#543E1B] font-bold text-sm shadow-sm">
              <Trophy className="w-4 h-4 text-[#A87930]" />
              <span>+{xpReward} XP Danh vọng</span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#E6EFE9] border border-[#5A876B]/40 text-[#245238] font-bold text-sm shadow-sm">
              <CheckCircle className="w-4 h-4 text-[#2E7A4A]" />
              <span>Đã mở Bài {targetNext}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            {onNextLesson && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNextLesson(targetNext);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#2B4837] hover:bg-[#1E3326] text-[#FAF4E6] text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Học tiếp Bài {targetNext}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {onPractice && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPractice();
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#BC9B6B] hover:bg-[#A88755] text-white text-sm font-bold shadow transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Luyện tập củng cố</span>
              </button>
            )}

            {onWriteNotes && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onWriteNotes();
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#EBE0CD] hover:bg-[#DFD3BE] text-[#4A3D28] text-sm font-bold transition flex items-center justify-center gap-2 border border-[#BC9B6B]/40 cursor-pointer"
              >
                <Feather className="w-4 h-4" />
                <span>Ghi bút ký</span>
              </button>
            )}
          </div>
        </div>

        {/* Ancient Bottom Roller Bar Decoration */}
        <div className="h-3 bg-gradient-to-r from-[#5B3E1F] via-[#A88755] to-[#5B3E1F] shadow-inner" />
      </div>
    </div>
  );
}
