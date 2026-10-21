"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Send,
  Bookmark,
  Sparkles,
  Search,
  Filter,
  CheckSquare,
  Square,
  HelpCircle,
  FileText,
  Headphones,
  MessageSquare,
  Layers,
  Calendar,
  Clock,
  X,
  ArrowRight,
  GraduationCap,
  Sparkle,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  LessonHeroBannerSvg,
  HeaderMistyMountainsSvg,
  LessonThumbnailArtwork,
} from "./LessonLibraryArtwork";
import {
  LESSON_5_DETAIL,
  HSK1_LESSONS,
  getLessonDetailById,
  FullLessonDetail,
  VocabularyItem,
  GrammarItem,
} from "@/lib/lesson-data";

interface ClassOption {
  id: string;
  name: string;
  code?: string;
  studentCount?: number;
}

interface LessonLibraryWorkspaceProps {
  currentUser?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  classesList?: ClassOption[];
  onNavigateToAssignments?: (payload: {
    lessonTitle: string;
    classId: string;
    vocabList: VocabularyItem[];
    grammarList: GrammarItem[];
  }) => void;
  onBackToDashboard?: () => void;
}

export function LessonLibraryWorkspace({
  currentUser,
  classesList = [],
  onNavigateToAssignments,
  onBackToDashboard,
}: LessonLibraryWorkspaceProps) {
  // Navigation & Track state
  const [activeTrack, setActiveTrack] = useState<"hsk" | "topic" | "major">("hsk");
  const [currentLessonId, setCurrentLessonId] = useState<string>("hsk1-b5");
  const [searchQuery, setSearchQuery] = useState("");

  // Current lesson detail
  const currentLesson: FullLessonDetail = useMemo(() => {
    return getLessonDetailById(currentLessonId);
  }, [currentLessonId]);

  // Selections state (default to mockup: 4 vocabularies & 2 grammars selected)
  const [selectedVocabIds, setSelectedVocabIds] = useState<string[]>([
    "v-jintian",
    "v-mingtian",
    "v-xiuxi",
    "v-shengbing",
  ]);
  const [selectedGrammarIds, setSelectedGrammarIds] = useState<string[]>([
    "g-le",
    "g-bu",
  ]);
  const [isDialogueSelected, setIsDialogueSelected] = useState<boolean>(false);
  const [isReadingSelected, setIsReadingSelected] = useState<boolean>(false);
  const [isListeningSelected, setIsListeningSelected] = useState<boolean>(false);

  // Target class for assignment
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classesList.length > 0 ? classesList[0].id : ""
  );

  // Audio / Speech State
  const [activeSpeakingText, setActiveSpeakingText] = useState<string | null>(null);
  const [isPlayingDialogueAudio, setIsPlayingDialogueAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35); // simulated 35%

  // Accordion & Toggle states
  const [isVocabExpanded, setIsVocabExpanded] = useState(true);
  const [isGrammarExpanded, setIsGrammarExpanded] = useState(true);
  const [isDialogueExpanded, setIsDialogueExpanded] = useState(true);
  const [isReadingExpanded, setIsReadingExpanded] = useState(true);
  const [isListeningExpanded, setIsListeningExpanded] = useState(true);

  // Reading options
  const [showPinyinInReading, setShowPinyinInReading] = useState(true);
  const [showViInReading, setShowViInReading] = useState(false);

  // Modals
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [assignDueDate, setAssignDueDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [assignNote, setAssignNote] = useState<string>("");
  const [collectionName, setCollectionName] = useState<string>("Giáo trình HSK 1 - Tuần 3");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Web Speech API for authentic Chinese pronunciation
  const speakChinese = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (activeSpeakingText === text) {
      setActiveSpeakingText(null);
      return;
    }
    const cleanText = text.replace(/[\n\r]+/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "zh-CN";
    utterance.rate = 0.88;
    utterance.onstart = () => setActiveSpeakingText(text);
    utterance.onend = () => setActiveSpeakingText(null);
    utterance.onerror = () => setActiveSpeakingText(null);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle selection helpers
  const toggleVocab = (id: string) => {
    setSelectedVocabIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllVocabs = () => {
    const allIds = currentLesson.vocabularies.map((v) => v.id);
    if (selectedVocabIds.length === allIds.length) {
      setSelectedVocabIds([]);
    } else {
      setSelectedVocabIds(allIds);
    }
  };

  const toggleGrammar = (id: string) => {
    setSelectedGrammarIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllGrammars = () => {
    const allIds = currentLesson.grammars.map((g) => g.id);
    if (selectedGrammarIds.length === allIds.length) {
      setSelectedGrammarIds([]);
    } else {
      setSelectedGrammarIds(allIds);
    }
  };

  const totalSelectedCount =
    selectedVocabIds.length +
    selectedGrammarIds.length +
    (isDialogueSelected ? 1 : 0) +
    (isReadingSelected ? 1 : 0) +
    (isListeningSelected ? 1 : 0);

  // Stepper handlers
  const currentIndex = HSK1_LESSONS.findIndex((l) => l.id === currentLessonId);
  const handlePrevLesson = () => {
    if (currentIndex > 0) {
      setCurrentLessonId(HSK1_LESSONS[currentIndex - 1].id);
    }
  };
  const handleNextLesson = () => {
    if (currentIndex < HSK1_LESSONS.length - 1) {
      setCurrentLessonId(HSK1_LESSONS[currentIndex + 1].id);
    }
  };

  // API Call: Giao cho lớp
  const handleConfirmAssign = async () => {
    if (!selectedClassId) {
      showToast("Vui lòng chọn một lớp học để giao bài");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/teacher/lessons/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          lessonId: currentLesson.id,
          lessonTitle: `${currentLesson.levelLabel} - ${currentLesson.titleZh} (${currentLesson.titleVi})`,
          selectedItems: {
            vocabIds: selectedVocabIds,
            grammarIds: selectedGrammarIds,
            dialogue: isDialogueSelected,
            reading: isReadingSelected,
            listening: isListeningSelected,
          },
          dueDate: assignDueDate,
          note: assignNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Đã giao bài học thành công cho lớp!");
        setIsAssignModalOpen(false);
      } else {
        showToast(data.message || "Không thể giao bài học");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ khi giao bài");
    } finally {
      setIsSubmitting(false);
    }
  };

  // API Call: Lưu vào thư viện của tôi
  const handleConfirmSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/teacher/lessons/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          title: currentLesson.titleVi,
          selectedItems: {
            vocabIds: selectedVocabIds,
            grammarIds: selectedGrammarIds,
            dialogue: isDialogueSelected,
            reading: isReadingSelected,
            listening: isListeningSelected,
          },
          collectionName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Đã lưu vào thư viện cá nhân thành công!");
        setIsSaveModalOpen(false);
      } else {
        showToast(data.message || "Không thể lưu bài học");
      }
    } catch {
      showToast("Lỗi kết nối khi lưu bài");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Transfer to Quiz / Assignment Module (per Spec: do not embed quiz inside)
  const handleTransferToAssignment = () => {
    if (totalSelectedCount === 0) {
      showToast("Vui lòng tích chọn ít nhất 1 mục nội dung để tạo bài tập!");
      return;
    }
    const chosenVocabList = currentLesson.vocabularies.filter((v) =>
      selectedVocabIds.includes(v.id)
    );
    const chosenGrammarList = currentLesson.grammars.filter((g) =>
      selectedGrammarIds.includes(g.id)
    );

    if (onNavigateToAssignments) {
      onNavigateToAssignments({
        lessonTitle: `${currentLesson.levelLabel} - ${currentLesson.titleZh} (${currentLesson.titleVi})`,
        classId: selectedClassId,
        vocabList: chosenVocabList,
        grammarList: chosenGrammarList,
      });
    } else {
      showToast(
        `Đã tạo nháp bài tập từ ${chosenVocabList.length} từ vựng và ${chosenGrammarList.length} điểm ngữ pháp!`
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] text-[#204434] pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#204434] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-[#BC9B6B]/40 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#BC9B6B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Decorative top background SVG landscape */}
      <div className="absolute top-0 right-0 w-full max-w-[900px] h-32 pointer-events-none opacity-40 overflow-hidden">
        <HeaderMistyMountainsSvg />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-6 relative z-10">
        {/* =================================================================== */}
        {/* TOP BAR: Breadcrumb / Back button & Search */}
        {/* =================================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5DEC9]/80 pb-4">
          <div className="flex items-center gap-3">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="p-2 rounded-xl border border-[#E5DEC9] bg-[#FFFCF6] hover:bg-[#F3EEDD] text-[#204434] transition flex items-center gap-1 text-xs font-semibold shadow-2xs"
                title="Quay lại Tổng quan"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#204434] flex items-center gap-2">
                <span>Kho bài học</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] font-sans font-semibold border border-[#204434]/20">
                  Chuẩn 2026
                </span>
              </h1>
              <p className="text-xs text-[#315E48]">
                Hệ thống giáo trình chuẩn HSK 3.0, Giao tiếp theo chủ đề và Chuyên ngành Đại học
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#315E48]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm từ vựng, ngữ pháp, bài đọc..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FFFCF6] border border-[#E5DEC9] text-xs text-[#204434] placeholder-[#315E48]/60 focus:outline-none focus:ring-1 focus:ring-[#204434] shadow-2xs"
            />
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3 CATEGORY PILLS (HSK 3.0, Theo chủ đề, Đại học & Ngành) */}
        {/* =================================================================== */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTrack("hsk")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTrack === "hsk"
                ? "bg-[#204434] text-white shadow-xs"
                : "bg-[#FFFCF6] text-[#204434] border border-[#E5DEC9] hover:bg-[#F8F5ED]"
            }`}
          >
            <span>HSK 3.0</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTrack === "hsk"
                  ? "bg-[#BC9B6B] text-white"
                  : "bg-[#E5DEC9] text-[#204434]"
              }`}
            >
              20 bài
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTrack("topic");
              showToast("Đang tải danh mục: Giao tiếp theo chủ đề");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTrack === "topic"
                ? "bg-[#204434] text-white shadow-xs"
                : "bg-[#FFFCF6] text-[#204434] border border-[#E5DEC9] hover:bg-[#F8F5ED]"
            }`}
          >
            <span>Theo chủ đề</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTrack === "topic"
                  ? "bg-[#BC9B6B] text-white"
                  : "bg-[#E5DEC9] text-[#204434]"
              }`}
            >
              15 bài
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTrack("major");
              showToast("Đang tải danh mục: Đại học & Ngành");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTrack === "major"
                ? "bg-[#204434] text-white shadow-xs"
                : "bg-[#FFFCF6] text-[#204434] border border-[#E5DEC9] hover:bg-[#F8F5ED]"
            }`}
          >
            <span>Đại học & Ngành</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTrack === "major"
                  ? "bg-[#BC9B6B] text-white"
                  : "bg-[#E5DEC9] text-[#204434]"
              }`}
            >
              12 bài
            </span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* BREADCRUMB & STEPPER NAVIGATION */}
        {/* =================================================================== */}
        <div className="flex items-center justify-between text-xs text-[#315E48] bg-[#FFFCF6] border border-[#E5DEC9] px-4 py-2.5 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2 font-medium flex-wrap">
            <span className="hover:underline cursor-pointer">Trang chủ</span>
            <span>&gt;</span>
            <span className="hover:underline cursor-pointer">
              {activeTrack === "hsk"
                ? "HSK 3.0"
                : activeTrack === "topic"
                ? "Theo chủ đề"
                : "Đại học & Ngành"}
            </span>
            <span>&gt;</span>
            <span className="hover:underline cursor-pointer">{currentLesson.levelLabel}</span>
            <span>&gt;</span>
            <span className="font-bold text-[#204434]">
              Bài {currentLesson.orderNumber}: {currentLesson.titleZh}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrevLesson}
              disabled={currentIndex <= 0}
              className="p-1 rounded-lg border border-[#E5DEC9] bg-white hover:bg-[#F3EEDD] disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Bài học trước"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#204434]" />
            </button>
            <span className="font-bold text-[#204434] text-xs">
              Bài {currentLesson.orderNumber} / {HSK1_LESSONS.length}
            </span>
            <button
              onClick={handleNextLesson}
              disabled={currentIndex >= HSK1_LESSONS.length - 1}
              className="p-1 rounded-lg border border-[#E5DEC9] bg-white hover:bg-[#F3EEDD] disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Bài học kế tiếp"
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#204434]" />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* HERO PANORAMIC ARTWORK BANNER (Pure Scalable Vector / SVG) */}
        {/* =================================================================== */}
        <div className="relative rounded-3xl overflow-hidden border border-[#E5DEC9] shadow-sm min-h-[200px] flex items-center bg-[#F4EFE6]">
          {/* Vector SVG Background */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <LessonHeroBannerSvg />
          </div>

          {/* Gradient readability overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#183428]/90 via-[#183428]/70 to-transparent pointer-events-none" />

          {/* Banner Content */}
          <div className="relative z-10 p-6 sm:p-8 max-w-2xl text-white space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#BC9B6B] text-[#1E3B2B] shadow-2xs">
                {currentLesson.levelLabel} • TIÊU CHUẨN
              </span>
              <span className="text-xs text-white/80">
                Bài {currentLesson.orderNumber} / {HSK1_LESSONS.length}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-wide">
                  {currentLesson.titleZh}
                </h2>
                <button
                  onClick={() => speakChinese(currentLesson.titleZh)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition backdrop-blur-xs"
                  title="Phát âm tiêu đề"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm sm:text-base text-[#F5EEDB] font-serif italic">
                {currentLesson.titleVi} ({currentLesson.titlePy})
              </p>
            </div>

            {/* Content counts meta badges */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs text-white/90">
              <span className="px-2 py-0.5 rounded-lg bg-black/25 backdrop-blur-xs border border-white/10">
                📚 {currentLesson.stats.vocabCount} từ mới
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-black/25 backdrop-blur-xs border border-white/10">
                📐 {currentLesson.stats.grammarCount} điểm ngữ pháp
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-black/25 backdrop-blur-xs border border-white/10">
                💬 {currentLesson.stats.dialogueCount} bài hội thoại
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-black/25 backdrop-blur-xs border border-white/10">
                📖 {currentLesson.stats.readingCount} bài đọc
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-black/25 backdrop-blur-xs border border-white/10">
                🎧 {currentLesson.stats.listeningCount} luyện nghe
              </span>
            </div>

            {/* Quick Action Buttons on Banner */}
            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setIsPreviewModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#204434] text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Eye className="w-3.5 h-3.5 text-[#204434]" />
                <span>Xem trước góc nhìn học viên</span>
              </button>
              <button
                onClick={() => {
                  const allV = currentLesson.vocabularies.map((v) => v.id);
                  const allG = currentLesson.grammars.map((g) => g.id);
                  if (
                    selectedVocabIds.length === allV.length &&
                    selectedGrammarIds.length === allG.length
                  ) {
                    setSelectedVocabIds([]);
                    setSelectedGrammarIds([]);
                    setIsDialogueSelected(false);
                    setIsReadingSelected(false);
                    setIsListeningSelected(false);
                    showToast("Đã bỏ chọn toàn bộ nội dung bài học");
                  } else {
                    setSelectedVocabIds(allV);
                    setSelectedGrammarIds(allG);
                    setIsDialogueSelected(true);
                    setIsReadingSelected(true);
                    setIsListeningSelected(true);
                    showToast("Đã chọn toàn bộ nội dung bài học");
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-black/30 hover:bg-black/40 text-white text-xs font-semibold transition border border-white/20 flex items-center gap-1.5"
              >
                <CheckSquare className="w-3.5 h-3.5 text-[#BC9B6B]" />
                <span>Chọn toàn bộ bài học</span>
              </button>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* TWO-COLUMN LAYOUT: Content Modules (Left) + Basket (Right) */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================================================================= */}
          {/* LEFT COLUMN: 5 LESSON CONTENT SECTIONS */}
          {/* ================================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* ------------------------------------------------------------- */}
            {/* SECTION 1: TỪ VỰNG (VOCABULARY) */}
            {/* ------------------------------------------------------------- */}
            <div className="rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#E5DEC9]/80 bg-[#FAF7F0]">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold text-xs">
                    01
                  </span>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                      <span>Từ vựng trọng tâm</span>
                      <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] border border-[#BC9B6B]/30">
                        {selectedVocabIds.length}/{currentLesson.vocabularies.length} đã chọn
                      </span>
                    </h3>
                    <p className="text-[11px] text-[#315E48]">
                      Tích chọn các từ mới bạn muốn giao cho học viên luyện tập
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleAllVocabs}
                    className="text-xs text-[#204434] hover:underline font-semibold px-2 py-1"
                  >
                    {selectedVocabIds.length === currentLesson.vocabularies.length
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </button>
                  <button
                    onClick={() => setIsVocabExpanded(!isVocabExpanded)}
                    className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white text-[#204434] hover:bg-[#F3EEDD]"
                  >
                    {isVocabExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {isVocabExpanded && (
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {currentLesson.vocabularies.map((v) => {
                      const isSelected = selectedVocabIds.includes(v.id);
                      return (
                        <div
                          key={v.id}
                          onClick={() => toggleVocab(v.id)}
                          className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                            isSelected
                              ? "bg-[#F3EEDD]/70 border-[#204434] shadow-xs"
                              : "bg-[#FFFCF6] border-[#E5DEC9] hover:border-[#BC9B6B]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                                  isSelected
                                    ? "bg-[#204434] border-[#204434] text-white"
                                    : "border-[#BC9B6B] bg-white"
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <div>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-xl font-serif font-bold text-[#204434]">
                                    {v.hanzi}
                                  </span>
                                  <span className="text-xs font-medium text-[#BC9B6B]">
                                    {v.pinyin}
                                  </span>
                                </div>
                                <span className="text-[10px] text-[#315E48] italic">
                                  [{v.partOfSpeech}]
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakChinese(v.hanzi);
                              }}
                              className={`p-1.5 rounded-lg border transition ${
                                activeSpeakingText === v.hanzi
                                  ? "bg-[#204434] text-white border-[#204434]"
                                  : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#F3EEDD]"
                              }`}
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="pt-1 border-t border-[#E5DEC9]/60">
                            <p className="text-xs font-bold text-[#204434]">{v.meaningVi}</p>
                            <div className="mt-1 text-[11px] bg-white/70 p-2 rounded-xl border border-[#E5DEC9]/60 space-y-0.5">
                              <p className="font-medium text-[#204434]">{v.exampleZh}</p>
                              <p className="text-[10px] text-[#8F6D3B]">{v.examplePy}</p>
                              <p className="text-[10px] text-[#315E48]">{v.exampleVi}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 2: NGỮ PHÁP (GRAMMAR) */}
            {/* ------------------------------------------------------------- */}
            <div className="rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#E5DEC9]/80 bg-[#FAF7F0]">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold text-xs">
                    02
                  </span>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                      <span>Điểm ngữ pháp</span>
                      <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] border border-[#BC9B6B]/30">
                        {selectedGrammarIds.length}/{currentLesson.grammars.length} đã chọn
                      </span>
                    </h3>
                    <p className="text-[11px] text-[#315E48]">
                      Cấu trúc ngữ pháp trọng điểm kèm giải thích và câu mẫu
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleAllGrammars}
                    className="text-xs text-[#204434] hover:underline font-semibold px-2 py-1"
                  >
                    {selectedGrammarIds.length === currentLesson.grammars.length
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </button>
                  <button
                    onClick={() => setIsGrammarExpanded(!isGrammarExpanded)}
                    className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white text-[#204434] hover:bg-[#F3EEDD]"
                  >
                    {isGrammarExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {isGrammarExpanded && (
                <div className="p-4 sm:p-5 space-y-4">
                  {currentLesson.grammars.map((g, idx) => {
                    const isSelected = selectedGrammarIds.includes(g.id);
                    return (
                      <div
                        key={g.id}
                        onClick={() => toggleGrammar(g.id)}
                        className={`p-4 rounded-2xl border transition cursor-pointer select-none space-y-3 ${
                          isSelected
                            ? "bg-[#F3EEDD]/60 border-[#204434] shadow-xs"
                            : "bg-[#FFFCF6] border-[#E5DEC9] hover:border-[#BC9B6B]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition ${
                                isSelected
                                  ? "bg-[#204434] border-[#204434] text-white"
                                  : "border-[#BC9B6B] bg-white"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div>
                              <h4 className="font-serif font-bold text-sm text-[#204434]">
                                {idx + 1}. {g.title}
                              </h4>
                              <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                                {g.explanation}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Formula Structure Box */}
                        <div className="bg-white/80 border border-[#E5DEC9] rounded-xl px-3.5 py-2 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wide">
                            Cấu trúc:
                          </span>
                          <code className="text-xs font-mono font-bold text-[#204434]">
                            {g.structure}
                          </code>
                        </div>

                        {/* Examples */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[10px] font-bold text-[#315E48] uppercase tracking-wider">
                            Ví dụ thực hành:
                          </span>
                          {g.examples.map((ex, eIdx) => (
                            <div
                              key={eIdx}
                              className="bg-white/90 p-2.5 rounded-xl border border-[#E5DEC9]/70 flex items-center justify-between gap-3"
                            >
                              <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-[#204434]">{ex.zh}</p>
                                <p className="text-[10px] text-[#8F6D3B]">{ex.py}</p>
                                <p className="text-[11px] text-[#315E48]">{ex.vi}</p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakChinese(ex.zh);
                                }}
                                className="p-1.5 rounded-lg border border-[#E5DEC9] bg-[#FAF7F0] text-[#204434] hover:bg-[#F3EEDD] shrink-0"
                                title="Phát âm câu ví dụ"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 3: HỘI THOẠI (DIALOGUE) */}
            {/* ------------------------------------------------------------- */}
            {currentLesson.dialogue && (
              <div className="rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] shadow-2xs overflow-hidden">
                <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#E5DEC9]/80 bg-[#FAF7F0]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold text-xs">
                      03
                    </span>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                        <span>Hội thoại thực tế</span>
                        <span
                          className={`text-xs font-sans font-semibold px-2 py-0.5 rounded-full border ${
                            isDialogueSelected
                              ? "bg-[#204434] text-white border-[#204434]"
                              : "bg-[#BC9B6B]/20 text-[#8F6D3B] border-[#BC9B6B]/30"
                          }`}
                        >
                          {isDialogueSelected ? "1 đã chọn" : "Chưa chọn"}
                        </span>
                      </h3>
                      <p className="text-[11px] text-[#315E48]">
                        {currentLesson.dialogue.situation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsDialogueSelected(!isDialogueSelected)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                        isDialogueSelected
                          ? "bg-[#204434] text-white border-[#204434]"
                          : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#F3EEDD]"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isDialogueSelected ? "Đã chọn" : "Chọn hội thoại"}</span>
                    </button>
                    <button
                      onClick={() => setIsDialogueExpanded(!isDialogueExpanded)}
                      className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white text-[#204434] hover:bg-[#F3EEDD]"
                    >
                      {isDialogueExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isDialogueExpanded && (
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Simulated Audio Player Bar */}
                    <div className="bg-[#FAF7F0] border border-[#E5DEC9] p-3.5 rounded-2xl flex items-center gap-3">
                      <button
                        onClick={() => {
                          setIsPlayingDialogueAudio(!isPlayingDialogueAudio);
                          if (!isPlayingDialogueAudio) {
                            speakChinese(
                              currentLesson.dialogue?.lines.map((l) => l.zh).join(" ") || ""
                            );
                          } else {
                            if (typeof window !== "undefined" && window.speechSynthesis) {
                              window.speechSynthesis.cancel();
                            }
                          }
                        }}
                        className="w-9 h-9 rounded-full bg-[#204434] text-white flex items-center justify-center hover:bg-[#183629] transition shadow-xs shrink-0"
                      >
                        {isPlayingDialogueAudio ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-medium text-[#315E48]">
                          <span>{currentLesson.dialogue.title}</span>
                          <span>{currentLesson.dialogue.audioDuration}</span>
                        </div>
                        <div className="w-full bg-[#E5DEC9] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#204434] h-full rounded-full transition-all duration-300"
                            style={{ width: `${audioProgress}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          speakChinese(
                            currentLesson.dialogue?.lines.map((l) => l.zh).join(" ") || ""
                          )
                        }
                        className="p-2 rounded-xl border border-[#E5DEC9] bg-white text-[#204434] hover:bg-[#F3EEDD]"
                        title="Đọc toàn bộ hội thoại"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Dialogue Lines */}
                    <div className="space-y-2.5">
                      {currentLesson.dialogue.lines.map((line, lIdx) => (
                        <div
                          key={lIdx}
                          className="p-3 rounded-2xl bg-white border border-[#E5DEC9]/80 flex items-start justify-between gap-3 hover:border-[#BC9B6B] transition"
                        >
                          <div className="flex items-start gap-3">
                            <span className="px-2 py-1 rounded-lg bg-[#FAF7F0] border border-[#E5DEC9] text-xs font-bold text-[#204434] shrink-0 min-w-[60px] text-center">
                              {line.speaker}
                            </span>
                            <div className="space-y-0.5">
                              <p className="text-sm font-serif font-bold text-[#204434]">
                                {line.zh}
                              </p>
                              <p className="text-xs text-[#8F6D3B]">{line.py}</p>
                              <p className="text-xs text-[#315E48]">{line.vi}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => speakChinese(line.zh)}
                            className="p-1.5 rounded-lg border border-[#E5DEC9] bg-[#FAF7F0] text-[#204434] hover:bg-[#F3EEDD] shrink-0"
                            title="Nghe câu này"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION 4: BÀI ĐỌC (READING) */}
            {/* ------------------------------------------------------------- */}
            {currentLesson.reading && (
              <div className="rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] shadow-2xs overflow-hidden">
                <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#E5DEC9]/80 bg-[#FAF7F0]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold text-xs">
                      04
                    </span>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                        <span>Bài đọc ứng dụng</span>
                        <span
                          className={`text-xs font-sans font-semibold px-2 py-0.5 rounded-full border ${
                            isReadingSelected
                              ? "bg-[#204434] text-white border-[#204434]"
                              : "bg-[#BC9B6B]/20 text-[#8F6D3B] border-[#BC9B6B]/30"
                          }`}
                        >
                          {isReadingSelected ? "1 đã chọn" : "Chưa chọn"}
                        </span>
                      </h3>
                      <p className="text-[11px] text-[#315E48]">
                        Đoạn văn ngắn củng cố từ mới & ngữ pháp ({currentLesson.reading.wordCount} chữ)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsReadingSelected(!isReadingSelected)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                        isReadingSelected
                          ? "bg-[#204434] text-white border-[#204434]"
                          : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#F3EEDD]"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isReadingSelected ? "Đã chọn" : "Chọn bài đọc"}</span>
                    </button>
                    <button
                      onClick={() => setIsReadingExpanded(!isReadingExpanded)}
                      className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white text-[#204434] hover:bg-[#F3EEDD]"
                    >
                      {isReadingExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isReadingExpanded && (
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Reading controls */}
                    <div className="flex items-center justify-between gap-3 flex-wrap bg-[#FAF7F0] p-3 rounded-2xl border border-[#E5DEC9]">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => speakChinese(currentLesson.reading?.contentZh || "")}
                          className="px-3 py-1.5 rounded-xl bg-[#204434] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#183629]"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Đọc mẫu toàn bài</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[#315E48] font-medium">
                          <input
                            type="checkbox"
                            checked={showPinyinInReading}
                            onChange={(e) => setShowPinyinInReading(e.target.checked)}
                            className="rounded border-[#E5DEC9] text-[#204434] focus:ring-[#204434]"
                          />
                          <span>Hiện Pinyin</span>
                        </label>
                        <span className="text-[#E5DEC9]">|</span>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[#315E48] font-medium">
                          <input
                            type="checkbox"
                            checked={showViInReading}
                            onChange={(e) => setShowViInReading(e.target.checked)}
                            className="rounded border-[#E5DEC9] text-[#204434] focus:ring-[#204434]"
                          />
                          <span>Hiện Dịch tiếng Việt</span>
                        </label>
                      </div>
                    </div>

                    {/* Reading Content */}
                    <div className="bg-white p-5 rounded-2xl border border-[#E5DEC9] space-y-4">
                      <div className="border-b border-[#E5DEC9]/60 pb-3">
                        <h4 className="text-lg font-serif font-bold text-[#204434]">
                          {currentLesson.reading.titleZh}
                        </h4>
                        <p className="text-xs text-[#8F6D3B]">{currentLesson.reading.titleVi}</p>
                      </div>

                      <div className="space-y-3 leading-relaxed">
                        {currentLesson.reading.contentZh.split("\n").map((paragraph, pIdx) => {
                          const pyParagraph = currentLesson.reading?.contentPy.split("\n")[pIdx];
                          const viParagraph = currentLesson.reading?.contentVi.split("\n")[pIdx];
                          return (
                            <div key={pIdx} className="space-y-1">
                              <p className="text-base font-serif text-[#204434]">{paragraph}</p>
                              {showPinyinInReading && pyParagraph && (
                                <p className="text-xs text-[#8F6D3B]">{pyParagraph}</p>
                              )}
                              {showViInReading && viParagraph && (
                                <p className="text-xs text-[#315E48] italic">{viParagraph}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION 5: LUYỆN NGHE PHẢN XẠ (LISTENING) */}
            {/* ------------------------------------------------------------- */}
            {currentLesson.listening && (
              <div className="rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] shadow-2xs overflow-hidden">
                <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#E5DEC9]/80 bg-[#FAF7F0]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold text-xs">
                      05
                    </span>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                        <span>Luyện nghe phản xạ</span>
                        <span
                          className={`text-xs font-sans font-semibold px-2 py-0.5 rounded-full border ${
                            isListeningSelected
                              ? "bg-[#204434] text-white border-[#204434]"
                              : "bg-[#BC9B6B]/20 text-[#8F6D3B] border-[#BC9B6B]/30"
                          }`}
                        >
                          {isListeningSelected ? "1 đã chọn" : "Chưa chọn"}
                        </span>
                      </h3>
                      <p className="text-[11px] text-[#315E48]">
                        Đoạn băng hội thoại mẫu kèm câu hỏi kiểm tra độ hiểu
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsListeningSelected(!isListeningSelected)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                        isListeningSelected
                          ? "bg-[#204434] text-white border-[#204434]"
                          : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#F3EEDD]"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isListeningSelected ? "Đã chọn" : "Chọn luyện nghe"}</span>
                    </button>
                    <button
                      onClick={() => setIsListeningExpanded(!isListeningExpanded)}
                      className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white text-[#204434] hover:bg-[#F3EEDD]"
                    >
                      {isListeningExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isListeningExpanded && (
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Listening Audio Box */}
                    <div className="bg-[#FAF7F0] border border-[#E5DEC9] p-4 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => speakChinese(currentLesson.listening?.scriptZh || "")}
                          className="w-10 h-10 rounded-full bg-[#204434] text-white flex items-center justify-center hover:bg-[#183629] transition shadow-xs"
                        >
                          <Play className="w-4 h-4 ml-0.5" />
                        </button>
                        <div>
                          <p className="text-xs font-bold text-[#204434]">
                            {currentLesson.listening.title}
                          </p>
                          <p className="text-[11px] text-[#315E48]">
                            Thời lượng: {currentLesson.listening.audioDuration}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Comprehension Questions */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-[#204434] uppercase tracking-wider">
                        Câu hỏi kiểm tra nhanh:
                      </p>
                      {currentLesson.listening.questions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="bg-white p-3.5 rounded-2xl border border-[#E5DEC9] space-y-2"
                        >
                          <p className="text-xs font-bold text-[#204434]">
                            {qIdx + 1}. {q.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${
                                  optIdx === q.correctIndex
                                    ? "bg-[#204434]/10 border-[#204434] text-[#204434] font-semibold"
                                    : "border-[#E5DEC9] text-[#315E48]"
                                }`}
                              >
                                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: "BỘ NỘI DUNG ĐÃ CHỌN" (SELECTION BASKET) */}
          {/* ================================================================= */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            <div className="rounded-3xl border border-[#204434]/20 bg-[#FFFCF6] shadow-md p-5 space-y-5">
              {/* Basket Header */}
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#204434] text-[#BC9B6B] flex items-center justify-center shadow-2xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#204434]">
                      Bộ nội dung đã chọn
                    </h3>
                    <p className="text-[11px] text-[#315E48]">Đang chọn cho bài giảng</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#204434] text-white">
                  {totalSelectedCount} mục
                </span>
              </div>

              {/* 5 Counter Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-between">
                  <span className="text-[#315E48]">Từ vựng:</span>
                  <span className="font-bold text-[#204434]">
                    {selectedVocabIds.length} / {currentLesson.vocabularies.length}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-between">
                  <span className="text-[#315E48]">Ngữ pháp:</span>
                  <span className="font-bold text-[#204434]">
                    {selectedGrammarIds.length} / {currentLesson.grammars.length}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-between">
                  <span className="text-[#315E48]">Hội thoại:</span>
                  <span className="font-bold text-[#204434]">
                    {isDialogueSelected ? "1 bài" : "0"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-between">
                  <span className="text-[#315E48]">Bài đọc:</span>
                  <span className="font-bold text-[#204434]">
                    {isReadingSelected ? "1 bài" : "0"}
                  </span>
                </div>
                <div className="col-span-2 p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-between">
                  <span className="text-[#315E48]">Luyện nghe:</span>
                  <span className="font-bold text-[#204434]">
                    {isListeningSelected ? "1 bài" : "0"}
                  </span>
                </div>
              </div>

              {/* Quick Selected Chips List */}
              {totalSelectedCount > 0 ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-[#315E48]">
                    <span>Danh sách đã chọn:</span>
                    <button
                      onClick={() => {
                        setSelectedVocabIds([]);
                        setSelectedGrammarIds([]);
                        setIsDialogueSelected(false);
                        setIsReadingSelected(false);
                        setIsListeningSelected(false);
                      }}
                      className="text-[#991B1B] hover:underline"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {currentLesson.vocabularies
                      .filter((v) => selectedVocabIds.includes(v.id))
                      .map((v) => (
                        <span
                          key={v.id}
                          className="px-2 py-0.5 rounded-lg bg-white border border-[#E5DEC9] text-[11px] text-[#204434] flex items-center gap-1 shadow-2xs"
                        >
                          <span>{v.hanzi}</span>
                          <button
                            onClick={() => toggleVocab(v.id)}
                            className="text-[#315E48] hover:text-[#991B1B]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    {currentLesson.grammars
                      .filter((g) => selectedGrammarIds.includes(g.id))
                      .map((g, idx) => (
                        <span
                          key={g.id}
                          className="px-2 py-0.5 rounded-lg bg-white border border-[#E5DEC9] text-[11px] text-[#204434] flex items-center gap-1 shadow-2xs"
                        >
                          <span className="truncate max-w-[130px]">Ngữ pháp {idx + 1}</span>
                          <button
                            onClick={() => toggleGrammar(g.id)}
                            className="text-[#315E48] hover:text-[#991B1B]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    {isDialogueSelected && (
                      <span className="px-2 py-0.5 rounded-lg bg-white border border-[#E5DEC9] text-[11px] text-[#204434] flex items-center gap-1 shadow-2xs">
                        <span>Hội thoại</span>
                        <button
                          onClick={() => setIsDialogueSelected(false)}
                          className="text-[#315E48] hover:text-[#991B1B]"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {isReadingSelected && (
                      <span className="px-2 py-0.5 rounded-lg bg-white border border-[#E5DEC9] text-[11px] text-[#204434] flex items-center gap-1 shadow-2xs">
                        <span>Bài đọc</span>
                        <button
                          onClick={() => setIsReadingSelected(false)}
                          className="text-[#315E48] hover:text-[#991B1B]"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {isListeningSelected && (
                      <span className="px-2 py-0.5 rounded-lg bg-white border border-[#E5DEC9] text-[11px] text-[#204434] flex items-center gap-1 shadow-2xs">
                        <span>Luyện nghe</span>
                        <button
                          onClick={() => setIsListeningSelected(false)}
                          className="text-[#315E48] hover:text-[#991B1B]"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FAF7F0] border border-dashed border-[#E5DEC9] text-center text-xs text-[#315E48]">
                  Chưa có mục nào được chọn. Hãy tích chọn từ vựng hoặc ngữ pháp ở bên trái.
                </div>
              )}

              {/* Class Selector */}
              <div className="space-y-1.5 pt-2 border-t border-[#E5DEC9]">
                <label className="text-xs font-bold text-[#204434] flex items-center justify-between">
                  <span>Chọn lớp áp dụng:</span>
                  <span className="text-[10px] text-[#BC9B6B] font-normal">
                    {classesList.length} lớp học
                  </span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs text-[#204434] focus:outline-none focus:ring-1 focus:ring-[#204434]"
                >
                  {classesList.length > 0 ? (
                    classesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.code ? `(${c.code})` : ""}
                      </option>
                    ))
                  ) : (
                    <option value="class-default">HSK1-K24 Sơ cấp (Mặc định)</option>
                  )}
                </select>
              </div>

              {/* 3 ACTION BUTTONS (Aligned with Spec Section 5) */}
              <div className="space-y-2.5 pt-2">
                {/* 1. Lưu vào thư viện của tôi */}
                <button
                  onClick={() => setIsSaveModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-[#BC9B6B] bg-[#FFFCF6] hover:bg-[#F3EEDD] text-[#8F6D3B] text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Lưu vào thư viện của tôi</span>
                </button>

                {/* 2. Giao bài học cho lớp */}
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  disabled={totalSelectedCount === 0}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#204434] hover:bg-[#183629] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-[#BC9B6B]" />
                  <span>Giao bài học cho lớp</span>
                </button>

                {/* 3. Tạo bài tập từ nội dung này (Transfers to Assignments module) */}
                <button
                  onClick={handleTransferToAssignment}
                  disabled={totalSelectedCount === 0}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FEF3C7]" />
                  <span>Tạo bài tập từ nội dung này</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* BOTTOM SECTION: CÁC BÀI HỌC LIÊN QUAN (CAROUSEL) */}
        {/* =================================================================== */}
        <div className="pt-8 border-t border-[#E5DEC9] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#204434]">
                Các bài học liên quan trong lộ trình {currentLesson.levelLabel}
              </h3>
              <p className="text-xs text-[#315E48]">
                Bấm vào một bài học để chuyển ngay nội dung giảng dạy
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevLesson}
                disabled={currentIndex <= 0}
                className="p-2 rounded-xl border border-[#E5DEC9] bg-[#FFFCF6] hover:bg-[#F3EEDD] disabled:opacity-30 disabled:cursor-not-allowed text-[#204434]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextLesson}
                disabled={currentIndex >= HSK1_LESSONS.length - 1}
                className="p-2 rounded-xl border border-[#E5DEC9] bg-[#FFFCF6] hover:bg-[#F3EEDD] disabled:opacity-30 disabled:cursor-not-allowed text-[#204434]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {HSK1_LESSONS.map((lesson) => {
              const isCurrent = lesson.id === currentLessonId;
              return (
                <div
                  key={lesson.id}
                  onClick={() => {
                    setCurrentLessonId(lesson.id);
                    window.scrollTo({ top: 180, behavior: "smooth" });
                  }}
                  className={`rounded-2xl border transition overflow-hidden cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? "border-[#204434] ring-2 ring-[#204434]/20 shadow-md bg-[#FAF7F0]"
                      : "border-[#E5DEC9] bg-[#FFFCF6] hover:border-[#BC9B6B] hover:shadow-xs"
                  }`}
                >
                  {/* Thumbnail Artwork (Pure SVG generator) */}
                  <div className="w-full h-24 overflow-hidden relative">
                    <LessonThumbnailArtwork lessonNumber={lesson.orderNumber} />
                    {isCurrent && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#204434] text-white">
                        Đang xem
                      </span>
                    )}
                  </div>

                  <div className="p-3 space-y-1">
                    <span className="text-[10px] font-bold text-[#BC9B6B] uppercase">
                      Bài {lesson.orderNumber}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#204434] line-clamp-1">
                      {lesson.titleZh}
                    </h4>
                    <p className="text-[11px] text-[#315E48] line-clamp-1">{lesson.titleVi}</p>
                    <p className="text-[10px] text-[#8F6D3B] pt-1">
                      {lesson.stats.vocabCount} từ • {lesson.stats.grammarCount} ngữ pháp
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: XEM TRƯỚC GÓC NHÌN HỌC VIÊN */}
      {/* =================================================================== */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#204434] text-white">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#204434]">
                    Góc nhìn học viên: {currentLesson.titleZh}
                  </h3>
                  <p className="text-xs text-[#315E48]">
                    Giao diện hiển thị trực tiếp trên app học viên
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#F3EEDD] text-[#315E48]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#204434] text-white space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#BC9B6B]">
                  Bài học hôm nay
                </span>
                <h4 className="text-2xl font-serif font-bold">{currentLesson.titleZh}</h4>
                <p className="text-xs text-white/80">{currentLesson.titleVi}</p>
              </div>

              {/* Flashcard preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#204434]">
                  Thẻ từ vựng (Flashcard lật thẻ):
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {currentLesson.vocabularies.slice(0, 4).map((v) => (
                    <div
                      key={v.id}
                      className="p-4 rounded-2xl border border-[#E5DEC9] bg-white text-center space-y-1 hover:border-[#204434] transition shadow-2xs"
                    >
                      <p className="text-2xl font-serif font-bold text-[#204434]">{v.hanzi}</p>
                      <p className="text-xs text-[#BC9B6B]">{v.pinyin}</p>
                      <p className="text-xs font-semibold text-[#315E48] pt-1">{v.meaningVi}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reading mode */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-2">
                <span className="text-xs font-bold text-[#204434]">Bài đọc mẫu:</span>
                <p className="text-sm font-serif text-[#204434] leading-relaxed whitespace-pre-line">
                  {currentLesson.reading?.contentZh}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#183629]"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: GIAO BÀI HỌC CHO LỚP */}
      {/* =================================================================== */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#204434] text-[#BC9B6B]">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#204434]">
                    Giao bài học cho lớp
                  </h3>
                  <p className="text-xs text-[#315E48]">
                    Học viên sẽ nhận thông báo và nội dung học phần lý thuyết
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#F3EEDD] text-[#315E48]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#204434] block mb-1">Bài học đang chọn:</label>
                <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1">
                  <p className="font-serif font-bold text-[#204434] text-sm">
                    {currentLesson.levelLabel} - Bài {currentLesson.orderNumber}:{" "}
                    {currentLesson.titleZh} ({currentLesson.titleVi})
                  </p>
                  <p className="text-[#8F6D3B]">
                    Gồm {selectedVocabIds.length} từ vựng, {selectedGrammarIds.length} ngữ pháp
                    {isDialogueSelected ? ", 1 hội thoại" : ""}
                    {isReadingSelected ? ", 1 bài đọc" : ""}
                    {isListeningSelected ? ", 1 luyện nghe" : ""}
                  </p>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#204434] block mb-1">Lớp học tiếp nhận:</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] focus:ring-1 focus:ring-[#204434]"
                >
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#204434] block mb-1">
                  Hạn hoàn thành lý thuyết:
                </label>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] focus:ring-1 focus:ring-[#204434]"
                />
              </div>

              <div>
                <label className="font-bold text-[#204434] block mb-1">
                  Lời nhắn / Hướng dẫn của giáo viên:
                </label>
                <textarea
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: Các em học thuộc từ mới và nghe lại bài hội thoại ít nhất 2 lần..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] focus:ring-1 focus:ring-[#204434]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] hover:bg-[#F3EEDD] text-[#315E48] text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận giao bài"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: LƯU VÀO THƯ VIỆN CÁ NHÂN */}
      {/* =================================================================== */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#BC9B6B]/20 text-[#8F6D3B]">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#204434]">
                    Lưu vào thư viện cá nhân
                  </h3>
                  <p className="text-xs text-[#315E48]">
                    Lưu cấu hình các mục đã chọn thành bộ bài giảng riêng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#F3EEDD] text-[#315E48]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#204434] block mb-1">Tên bộ bài giảng:</label>
                <input
                  type="text"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] focus:ring-1 focus:ring-[#204434]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1">
                <p className="text-[#315E48]">
                  Số lượng nội dung lưu: <strong>{totalSelectedCount} mục</strong>
                </p>
                <p className="text-[11px] text-[#8F6D3B]">
                  Bộ này sẽ xuất hiện trong Thư viện cá nhân để bạn tái sử dụng cho các lớp sau mà
                  không cần chọn lại.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] hover:bg-[#F3EEDD] text-[#315E48] text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu bài học"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
