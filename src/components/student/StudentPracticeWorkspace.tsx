"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Dumbbell,
  BookOpen,
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Volume2,
  Gamepad2,
  Layers,
  GraduationCap,
  Play,
  Clock,
  PenTool,
  Mic,
  Zap,
  ChevronRight,
} from "lucide-react";
import HanziPracticeModal from "./HanziPracticeModal";
import { getLessonsByHskLevel } from "@/lib/hsk-lessons-resolver";

interface StudentPracticeWorkspaceProps {
  currentUser?: any;
  onNavigateToTab?: (tab: string) => void;
  classesCount?: number;
  myClasses?: any[];
  onOpenJoinModal?: () => void;
  activeHskLevel?: number;
}

export default function StudentPracticeWorkspace({
  currentUser,
  onNavigateToTab,
  classesCount = 0,
  myClasses = [],
  onOpenJoinModal,
  activeHskLevel,
}: StudentPracticeWorkspaceProps) {
  const activeClass = myClasses[0] || null;
  const currentHskLevel = activeHskLevel || activeClass?.level || 1;

  // DB published lessons for active class
  const [dbLessons, setDbLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPracticeLesson, setSelectedPracticeLesson] = useState<number>(1);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [showCardMeaning, setShowCardMeaning] = useState<boolean>(false);

  const fetchLessons = useCallback(async () => {
    if (!activeClass?.id) {
      setDbLessons([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/classes/${activeClass.id}/lessons`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.lessons)) {
          const published = data.lessons.filter(
            (l: any) => l.status === "PUBLISHED" || l.isPublished === true
          );
          setDbLessons(published);
          if (published.length > 0) {
            setSelectedPracticeLesson(published[0].lessonNumber);
          }
          return;
        }
      }
      setDbLessons([]);
    } catch (e) {
      console.warn("fetchLessons error:", e);
      setDbLessons([]);
    } finally {
      setLoading(false);
    }
  }, [activeClass?.id]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const streak = currentUser?.streakDays || 0;
  const xp = currentUser?.totalXp || 0;

  // Active lesson data
  const currentLessonData = dbLessons.find((l) => l.lessonNumber === selectedPracticeLesson) || dbLessons[0];
  const vocabList = currentLessonData?.selectedVocabs || [];
  const currentVocab = vocabList[activeCardIndex] || vocabList[0];

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 1. Empty state: student not in any class
  if (!activeClass || myClasses.length === 0) {
    return (
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-10 sm:p-14 text-center shadow-2xs space-y-4 max-w-2xl mx-auto my-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-[#FAF7F0] text-[#315E48] border border-[#E5DEC9] flex items-center justify-center mx-auto shadow-2xs">
          <Dumbbell className="w-8 h-8 text-[#204434]" />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-xl text-[#204434]">
            Phòng luyện tập phản xạ chưa mở khóa
          </h3>
          <p className="text-xs text-[#315E48] leading-relaxed max-w-md mx-auto">
            Phòng luyện tập phản xạ HSK sẽ tự động kích hoạt dựa trên các bài học được giáo viên phân phối cho lớp của bạn. Hãy tham gia lớp học để bắt đầu!
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

  // 2. Empty state: class has NO published lessons in DB
  if (!loading && dbLessons.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-10 sm:p-14 text-center shadow-2xs space-y-4 max-w-2xl mx-auto my-8 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-[#FAF7F0] text-[#315E48] border border-[#E5DEC9] flex items-center justify-center mx-auto shadow-2xs">
            <Dumbbell className="w-8 h-8 text-[#204434]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-xl text-[#204434]">
              Chưa có từ vựng để luyện tập
            </h3>
            <p className="text-xs text-[#315E48] leading-relaxed max-w-md mx-auto">
              Giáo viên phụ trách lớp <strong>{activeClass.name}</strong> chưa công bố bài học nào. Bạn sẽ có thể luyện phản xạ từ vựng ngay khi giáo viên mở khóa bài học!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DEC9]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#204434] flex items-center gap-2">
            <span>Phòng luyện tập phản xạ</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-semibold border border-[#BC9B6B]/40 font-sans">
              HSK {currentHskLevel} · {activeClass.name}
            </span>
          </h1>
          <p className="text-xs text-[#315E48] mt-1">
            Luyện phản xạ nhanh mặt chữ theo từng bài học đã được giáo viên phân phối.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs text-xs font-semibold text-[#8F6D3B]">
            <Flame className="w-4 h-4 text-[#9D493E] fill-[#9D493E]" />
            <span>{streak} ngày liên tục</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs text-xs font-semibold text-[#204434]">
            <Trophy className="w-4 h-4 text-[#BC9B6B]" />
            <span>+{xp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Module 1: Phản xạ từ vựng theo bài học đã mở */}
      {currentVocab ? (
        <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/50 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5DEC9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#204434] text-white flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#BC9B6B]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#204434]">
                  Luyện phản xạ từ vựng
                </h3>
                <p className="text-xs text-[#315E48]">
                  Chế độ lật thẻ phản xạ siêu tốc từ các bài học đã mở
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#315E48] font-medium">Chọn bài:</span>
              <select
                value={selectedPracticeLesson}
                onChange={(e) => {
                  setSelectedPracticeLesson(Number(e.target.value));
                  setActiveCardIndex(0);
                  setShowCardMeaning(false);
                }}
                className="bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#204434] focus:outline-hidden"
              >
                {dbLessons.map((ls) => (
                  <option key={ls.lessonNumber} value={ls.lessonNumber}>
                    Bài {String(ls.lessonNumber).padStart(2, "0")}: {ls.titleZh || `Bài ${ls.lessonNumber}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Khung luyện phản xạ thẻ */}
          <div className="p-6 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex items-center justify-between w-full max-w-md text-xs text-[#315E48]">
              <span className="font-mono font-bold text-[#8F6D3B]">
                Bài {String(currentLessonData.lessonNumber).padStart(2, "0")}
              </span>
              <span>
                Thẻ {activeCardIndex + 1} / {vocabList.length}
              </span>
            </div>

            {/* Flashcard Box */}
            <div
              onClick={() => setShowCardMeaning(!showCardMeaning)}
              className="w-full max-w-md min-h-[160px] p-6 rounded-3xl bg-white border-2 border-[#E5DEC9] hover:border-[#204434] transition shadow-md flex flex-col items-center justify-center cursor-pointer space-y-2 group"
            >
              <div className="font-serif font-bold text-4xl text-[#204434] group-hover:scale-105 transition-transform">
                {currentVocab.hanzi}
              </div>

              {showCardMeaning ? (
                <div className="space-y-1 animate-fadeIn">
                  <div className="text-base font-mono font-bold text-[#8F6D3B]">
                    {currentVocab.pinyin}
                  </div>
                  <div className="text-sm font-semibold text-[#204434]">
                    {currentVocab.meaningVi || currentVocab.meaning}
                  </div>
                </div>
              ) : (
                <span className="text-xs text-[#315E48]/70 italic flex items-center gap-1 pt-2">
                  <span>Chạm vào thẻ để xem Phiên âm & Ý nghĩa</span>
                </span>
              )}
            </div>

            {/* Flashcard Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSpeak(currentVocab.hanzi)}
                className="p-3 rounded-2xl bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#204434] hover:text-white transition cursor-pointer shadow-xs"
                title="Phát âm chữ này"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setShowCardMeaning(false);
                  setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : vocabList.length - 1));
                }}
                className="px-4 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] text-xs font-semibold text-[#204434] hover:bg-[#FAF7F0] transition cursor-pointer"
              >
                Từ trước
              </button>

              <button
                onClick={() => setShowCardMeaning(!showCardMeaning)}
                className="px-5 py-2.5 rounded-2xl bg-[#BC9B6B] hover:bg-[#a58656] text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                {showCardMeaning ? "Ẩn đáp án" : "Hiện đáp án"}
              </button>

              <button
                onClick={() => {
                  setShowCardMeaning(false);
                  setActiveCardIndex((prev) => (prev < vocabList.length - 1 ? prev + 1 : 0));
                }}
                className="px-4 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] text-xs font-semibold text-[#204434] hover:bg-[#FAF7F0] transition cursor-pointer"
              >
                Từ kế tiếp
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#E5DEC9]">
          <p className="text-xs text-[#315E48]">Bài học này chưa có danh sách từ vựng.</p>
        </div>
      )}
    </div>
  );
}
