"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { OFFICIAL_HSK1_15_LESSONS, Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
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
  const currentHskLevel = activeHskLevel || myClasses[0]?.level || 1;
  const practiceLessons = useMemo(() => getLessonsByHskLevel(currentHskLevel), [currentHskLevel]);
  const [dueVocabCount, setDueVocabCount] = useState(0);
  const [wrongQuestionCount, setWrongQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHanziModalOpen, setIsHanziModalOpen] = useState(false);
  const [selectedPracticeLesson, setSelectedPracticeLesson] = useState<number>(1);
  const [quickReflectionActive, setQuickReflectionActive] = useState<boolean>(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [showCardMeaning, setShowCardMeaning] = useState<boolean>(false);

  // Check if a target lesson was saved from Lesson Workspace
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("hanyu_practice_target_lesson");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.number) {
            setSelectedPracticeLesson(parsed.number);
            setQuickReflectionActive(true);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (classesCount === 0) {
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
            Phòng luyện tập phản xạ HSK, thuật toán Spaced Repetition và sổ lỗi sai sẽ tự động kích hoạt dựa trên các bài học và bài kiểm tra trong lớp học của bạn. Hãy tham gia lớp học để bắt đầu luyện tập!
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

  useEffect(() => {
    async function loadPracticeStats() {
      if (!currentUser?.id && !currentUser?.username) {
        setDueVocabCount(0);
        setWrongQuestionCount(0);
        setLoading(false);
        return;
      }

      try {
        const query = currentUser?.id
          ? `studentId=${encodeURIComponent(currentUser.id)}`
          : `username=${encodeURIComponent(currentUser.username)}`;
        const headers: Record<string, string> = currentUser?.id ? { "x-user-id": currentUser.id } : {};

        const [resVocab, resWrong] = await Promise.all([
          fetch(`/api/v1/my/vocab-review/today?${query}`, { headers }),
          fetch(`/api/v1/my/wrong-questions?${query}`, { headers }),
        ]);

        if (resVocab.ok) {
          const vocabData = await resVocab.json();
          if (vocabData.success && vocabData.items) {
            setDueVocabCount(vocabData.items.length);
          } else {
            setDueVocabCount(0);
          }
        }

        if (resWrong.ok) {
          const wrongData = await resWrong.json();
          if (wrongData.success && wrongData.items) {
            setWrongQuestionCount(wrongData.items.length);
          } else {
            setWrongQuestionCount(0);
          }
        }
      } catch (err) {
        console.error("Error loading practice stats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPracticeStats();
  }, [currentUser]);

  const streak = currentUser?.streakDays || 0;
  const xp = currentUser?.totalXp || 0;

  const currentLessonData = practiceLessons.find(
    (l) => l.number === selectedPracticeLesson
  ) || practiceLessons[0];

  const effectiveVocabList = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_assigned_lessons");
        if (saved) {
          const assignedList = JSON.parse(saved);
          const match = assignedList.find(
            (a: any) =>
              a.id !== "assign-sample-1" &&
              (a.lessonId === selectedPracticeLesson ||
                a.lessonId === String(selectedPracticeLesson) ||
                a.lessonId === `hsk1-b${String(selectedPracticeLesson).padStart(2, "0")}` ||
                a.lessonId === `hsk1-b${selectedPracticeLesson}` ||
                a.lessonId === `hsk1-l${selectedPracticeLesson}` ||
                a.lessonId === `hsk1-${String(selectedPracticeLesson).padStart(2, "0")}` ||
                (a.titleZh && a.titleZh.trim() === currentLessonData.titleZh.trim()))
          );
          if (match && Array.isArray(match.selectedVocabs) && match.selectedVocabs.length > 0) {
            const filtered = currentLessonData.vocabList.filter((v) =>
              match.selectedVocabs.some((sv: any) => sv.hanzi === v.hanzi)
            );
            if (filtered.length > 0) return filtered;
          }
        }
      } catch {}
    }
    return currentLessonData.vocabList;
  }, [currentLessonData, selectedPracticeLesson]);

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentVocab = effectiveVocabList[activeCardIndex] || effectiveVocabList[0];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Thông báo nếu chưa tham gia lớp học (Đặc tả V2) */}
      {classesCount === 0 && myClasses.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
            <p className="text-xs font-semibold text-amber-900">
              Bạn chưa tham gia lớp học nào. Hãy nhập mã lớp để bắt đầu học.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenJoinModal}
            className="px-4 py-1.5 rounded-xl bg-[#204434] text-white text-xs font-bold shadow-xs hover:bg-[#183629] cursor-pointer shrink-0"
          >
            Nhập mã tham gia lớp
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DEC9]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#204434] flex items-center gap-2">
            <span>Phòng luyện tập phản xạ</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-semibold border border-[#BC9B6B]/40 font-sans">
              Theo 15 Bài HSK {currentHskLevel}
            </span>
          </h1>
          <p className="text-xs text-[#315E48] mt-1">
            Luyện phản xạ nhanh mặt chữ theo từng bài học, ôn tập lặp lại ngắt quãng (SRS) và giải quyết sổ câu hỏi sai.
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

      {/* Module 1: Phản xạ từ vựng theo từng bài học (15 Bài HSK 1) */}
      <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/50 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#204434] text-white flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#BC9B6B]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Phòng phản xạ từ vựng theo bài học (HSK 1)
              </h3>
              <p className="text-xs text-[#315E48]">
                Chọn một bài học từ Bài 01 – 15 để kích hoạt chế độ lật thẻ phản xạ siêu tốc
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
              {practiceLessons.map((ls) => (
                <option key={ls.id} value={ls.number}>
                  Bài {String(ls.number).padStart(2, "0")}: {ls.titleZh} - {ls.titleVi}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Khung luyện phản xạ thẻ */}
        <div className="p-6 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex items-center justify-between w-full max-w-md text-xs text-[#315E48]">
            <span className="font-mono font-bold text-[#8F6D3B]">
              Bài {String(currentLessonData.number).padStart(2, "0")}: {currentLessonData.titleVi}
            </span>
            <span>
              Thẻ {activeCardIndex + 1} / {effectiveVocabList.length}
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
                  {currentVocab.meaning}
                </div>
                {currentVocab.exampleZh && (
                  <p className="text-xs text-[#315E48] pt-1">
                    {currentVocab.exampleZh} ({currentVocab.exampleVi})
                  </p>
                )}
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
                setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : effectiveVocabList.length - 1));
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
                setActiveCardIndex((prev) => (prev < effectiveVocabList.length - 1 ? prev + 1 : 0));
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#204434] text-white hover:bg-[#183629] text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Từ kế tiếp
            </button>
          </div>
        </div>
      </div>

      {/* 4 Trạm rèn luyện chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Trạm 1: Ôn tập từ vựng ngắt quãng */}
        <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#204434] transition flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                dueVocabCount > 0 ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}>
                {dueVocabCount > 0 ? `${dueVocabCount} từ cần ôn hôm nay` : "Đã hoàn thành ôn tập"}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-[#204434] group-hover:text-emerald-900 transition">
                Ôn từ vựng Flashcard (Spaced Repetition)
              </h3>
              <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                Hệ thống tự động tính toán chu kỳ quên và đưa ra những từ vựng bạn chuẩn bị quên theo thuật toán hộp Leitner thông minh.
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9]/70 flex items-center justify-between text-xs text-[#315E48]">
              <span>Từ vựng cần ôn trong ngày:</span>
              <span className="font-bold text-[#204434]">
                {dueVocabCount > 0 ? `${dueVocabCount} từ đang chờ` : "0 từ cần ôn"}
              </span>
            </div>
          </div>

          <Link
            href="/s/review"
            className="w-full py-3 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Play className="w-4 h-4 text-[#BC9B6B] fill-[#BC9B6B]" />
            <span>Bắt đầu ôn flashcard toàn diện</span>
          </Link>
        </div>

        {/* Trạm 2: Đấu trí ghép từ (Game Center) */}
        <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#8F6D3B] transition flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                Tốc độ & Phản xạ
              </span>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-[#204434] group-hover:text-[#8F6D3B] transition">
                Game ghép cặp Hán tự - Pinyin - Nghĩa
              </h3>
              <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                Trò chơi ghép chữ Hán với phiên âm Pinyin và ngữ nghĩa tiếng Việt. Rèn luyện khả năng nhận mặt chữ và gặt hái Combo XP cực lớn!
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9]/70 flex items-center justify-between text-xs text-[#315E48]">
              <span>Chế độ luyện tập:</span>
              <span className="font-bold text-[#8F6D3B]">Tự do & Bảng xếp hạng</span>
            </div>
          </div>

          <Link
            href="/s/games"
            className="w-full py-3 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B] hover:bg-[#FAF7F0] text-[#8F6D3B] text-xs font-bold shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
            <span>Chơi game ghép thẻ phản xạ</span>
          </Link>
        </div>

        {/* Trạm 3: Sổ câu hỏi sai (Mistake Notebook) */}
        <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-red-400 transition flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                wrongQuestionCount > 0 ? "bg-red-100 text-red-800 border-red-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}>
                {wrongQuestionCount > 0 ? `${wrongQuestionCount} câu cần làm lại` : "Không có câu sai"}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-[#204434] group-hover:text-red-800 transition">
                Sổ tay câu hỏi làm sai (Luyện đến khi đúng)
              </h3>
              <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                Tất cả câu trắc nghiệm và bài tập bạn làm sai trong các bài kiểm tra được gom tự động về đây để bạn làm lại cho tới khi nhuần nhuyễn.
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9]/70 flex items-center justify-between text-xs text-[#315E48]">
              <span>Tình trạng sổ câu sai:</span>
              <span className={`font-bold ${wrongQuestionCount > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                {wrongQuestionCount > 0 ? `${wrongQuestionCount} câu cần khắc phục` : "Chưa có câu sai nào"}
              </span>
            </div>
          </div>

          <Link
            href="/s/practice/wrong"
            className="w-full py-3 rounded-2xl bg-white border border-[#E5DEC9] hover:bg-red-50 hover:border-red-300 text-red-700 text-xs font-bold shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Mở sổ câu sai & làm lại</span>
          </Link>
        </div>

        {/* Trạm 4: Luyện viết chữ Hán & Chấm khẩu ngữ Micro AI */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFFCF6] to-[#FFF9EE] border-2 border-[#BC9B6B]/70 shadow-2xs hover:border-[#204434] transition flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#204434] text-white flex items-center justify-center">
                <PenTool className="w-6 h-6 text-[#BC9B6B]" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#BC9B6B]/20 text-[#8F6D3B] border border-[#BC9B6B]/40 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Viết ô Mễ & Micro AI</span>
              </span>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-[#204434] group-hover:text-[#183629] transition">
                Tập viết nét chữ & Khẩu ngữ Micro AI
              </h3>
              <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                Tập viết chữ Hán trên ô Mễ tự cách (米), học quy tắc thuận bút và luyện nói trực tiếp vào Micro để AI nhận diện giọng đọc chuẩn Bắc Kinh.
              </p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-[#E5DEC9] flex items-center justify-between text-xs text-[#315E48]">
              <span>Kho chữ Hán luyện tập:</span>
              <span className="font-bold text-[#204434]">150 chữ cốt lõi 15 bài HSK 1</span>
            </div>
          </div>

          <button
            onClick={() => setIsHanziModalOpen(true)}
            className="w-full py-3 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-md shadow-[#204434]/15 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <PenTool className="w-4 h-4 text-[#BC9B6B]" />
            <span>Mở bàn tập viết & Micro ngay</span>
          </button>
        </div>
      </div>

      {/* Modal Tập viết chữ Hán & Micro AI */}
      <HanziPracticeModal
        isOpen={isHanziModalOpen}
        onClose={() => setIsHanziModalOpen(false)}
      />
    </div>
  );
}
