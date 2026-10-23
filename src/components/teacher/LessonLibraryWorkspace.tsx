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
  Folder,
  FileUp,
  Share2,
  Trash2,
  Lock,
  Globe,
  UploadCloud,
  FileSpreadsheet,
  FileCheck,
  RotateCcw,
} from "lucide-react";
import {
  LessonHeroBannerSvg,
  HeaderMistyMountainsSvg,
  LessonThumbnailArtwork,
} from "./LessonLibraryArtwork";
import {
  LESSON_5_DETAIL,
  HSK_LEVELS_META,
  HSK1_LESSONS,
  HSK2_LESSONS,
  HSK3_LESSONS,
  TOPIC_CATEGORIES,
  TOPIC_LESSONS,
  MAJOR_FIELDS,
  MAJOR_LESSONS,
  ALL_LESSONS_INDEX,
  getLessonDetailById,
  searchLessons,
  FullLessonDetail,
  LessonSummary,
  VocabularyItem,
  GrammarItem,
  INITIAL_SAVED_HANYU_LESSONS,
  INITIAL_CURATED_LESSONS,
  INITIAL_LECTURE_MATERIALS,
  SavedHanyuLesson,
  CustomCuratedLesson,
  LectureMaterialItem,
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
  // =========================================================================
  // TOP-LEVEL MAIN TABS: Tab 1 = Khám phá bài học | Tab 2 = Thư viện của tôi
  // =========================================================================
  const [mainTab, setMainTab] = useState<"EXPLORE" | "MY_LIBRARY">("EXPLORE");

  // =========================================================================
  // TAB 1: KHÁM PHÁ BÀI HỌC STATE & INDEPENDENT BRANCH NAVIGATION
  // =========================================================================
  const [activeTrack, setActiveTrack] = useState<"hsk" | "topic" | "major">("hsk");

  // HSK 3.0 Branch State
  const [hskSelectedLevel, setHskSelectedLevel] = useState<string>("hsk1");
  const [hskSelectedLessonId, setHskSelectedLessonId] = useState<string>("hsk1-b5");
  const [hskViewLevelList, setHskViewLevelList] = useState<boolean>(false);

  // Theo chủ đề Branch State
  const [topicSelectedCategory, setTopicSelectedCategory] = useState<string>("topic-comm");
  const [topicSelectedLessonId, setTopicSelectedLessonId] = useState<string>("top-comm-1");
  const [topicViewCategoryList, setTopicViewCategoryList] = useState<boolean>(false);

  // Đại học & Ngành Branch State
  const [majorSelectedField, setMajorSelectedField] = useState<string>("major-econ");
  const [majorSelectedSubject, setMajorSelectedSubject] = useState<string>("sub-trade-1");
  const [majorSelectedLessonId, setMajorSelectedLessonId] = useState<string>("maj-trade-1");
  const [majorViewFieldList, setMajorViewFieldList] = useState<boolean>(false);

  // Active Lesson ID strictly depends on activeTrack (Never mixed!)
  const currentActiveLessonId = useMemo(() => {
    if (activeTrack === "hsk") return hskSelectedLessonId;
    if (activeTrack === "topic") return topicSelectedLessonId;
    return majorSelectedLessonId;
  }, [activeTrack, hskSelectedLessonId, topicSelectedLessonId, majorSelectedLessonId]);

  // Current lesson detail strictly loaded from current branch
  const currentLesson: FullLessonDetail = useMemo(() => {
    return getLessonDetailById(currentActiveLessonId);
  }, [currentActiveLessonId]);

  // =========================================================================
  // SEARCH ENGINE STATE (Lỗi 2)
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState<"ALL" | "hsk" | "topic" | "major">("ALL");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchLessons(searchQuery, searchScope);
  }, [searchQuery, searchScope]);

  // =========================================================================
  // TAB 2: THƯ VIỆN CỦA TÔI STATE (Lỗi 3)
  // =========================================================================
  const [librarySubTab, setLibrarySubTab] = useState<
    "ALL" | "SAVED_HANYU" | "CURATED" | "MATERIALS"
  >("ALL");

  const [savedHanyuLessons, setSavedHanyuLessons] =
    useState<SavedHanyuLesson[]>(INITIAL_SAVED_HANYU_LESSONS);
  const [curatedLessons, setCuratedLessons] =
    useState<CustomCuratedLesson[]>(INITIAL_CURATED_LESSONS);
  const [lectureMaterials, setLectureMaterials] =
    useState<LectureMaterialItem[]>(INITIAL_LECTURE_MATERIALS);

  // Modal: Upload Material
  const [isUploadMaterialModalOpen, setIsUploadMaterialModalOpen] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState("");
  const [newMaterialType, setNewMaterialType] = useState<
    "PDF" | "PPTX" | "DOCX" | "IMAGE" | "AUDIO" | "VIDEO"
  >("PDF");
  const [newMaterialClassIds, setNewMaterialClassIds] = useState<string[]>([]);
  const [newMaterialClassification, setNewMaterialClassification] = useState("HSK 1");
  const [newMaterialAllowDownload, setNewMaterialAllowDownload] = useState(true);
  const [newMaterialOpenDate, setNewMaterialOpenDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newMaterialDueDate, setNewMaterialDueDate] = useState("");

  // Modal: Curate Custom Lesson Modal
  const [isCurateModalOpen, setIsCurateModalOpen] = useState(false);
  const [curatedTitle, setCuratedTitle] = useState("");
  const [curatedNotes, setCuratedNotes] = useState("");

  // =========================================================================
  // SELECTIONS BASKET STATE (Từ vựng, Ngữ pháp, Hội thoại...)
  // =========================================================================
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
  const [audioProgress, setAudioProgress] = useState(35);

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
  const [assignDueDate, setAssignDueDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [assignNote, setAssignNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Chinese TTS via Web Speech API
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

  // Selection count
  const totalSelectedCount =
    selectedVocabIds.length +
    selectedGrammarIds.length +
    (isDialogueSelected ? 1 : 0) +
    (isReadingSelected ? 1 : 0) +
    (isListeningSelected ? 1 : 0);

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

  // Check if current lesson is saved in Teacher's library
  const isCurrentLessonSaved = useMemo(() => {
    return savedHanyuLessons.some((s) => s.lessonId === currentLesson.id);
  }, [savedHanyuLessons, currentLesson.id]);

  // Handle Save Root Lesson to Teacher Library
  const handleToggleSaveRootLesson = () => {
    if (isCurrentLessonSaved) {
      setSavedHanyuLessons((prev) => prev.filter((s) => s.lessonId !== currentLesson.id));
      showToast(`Đã bỏ lưu bài học "${currentLesson.titleVi}" khỏi Thư viện của tôi`);
    } else {
      const newSavedItem: SavedHanyuLesson = {
        id: `saved-${Date.now()}`,
        lessonId: currentLesson.id,
        titleZh: currentLesson.titleZh,
        titleVi: currentLesson.titleVi,
        trackId: currentLesson.trackId,
        levelLabel: currentLesson.levelLabel,
        savedAt: new Date().toLocaleDateString("vi-VN"),
        readOnly: true,
      };
      setSavedHanyuLessons((prev) => [newSavedItem, ...prev]);
      showToast(`Đã lưu "${currentLesson.titleVi}" vào Thư viện của tôi!`);
    }
  };

  // Handle Save Curated Custom Lesson
  const handleConfirmCuratedSave = () => {
    if (!curatedTitle.trim()) {
      showToast("Vui lòng nhập tên cho bộ bài học tùy chỉnh!");
      return;
    }
    const chosenVocabs = currentLesson.vocabularies.filter((v) =>
      selectedVocabIds.includes(v.id)
    );
    const chosenGrammars = currentLesson.grammars.filter((g) =>
      selectedGrammarIds.includes(g.id)
    );

    const newCurated: CustomCuratedLesson = {
      id: `curated-${Date.now()}`,
      title: curatedTitle.trim(),
      sourceLessonId: currentLesson.id,
      sourceLessonTitle: `${currentLesson.levelLabel} - Bài ${currentLesson.orderNumber}: ${currentLesson.titleZh}`,
      selectedVocabCount: chosenVocabs.length,
      selectedGrammarCount: chosenGrammars.length,
      vocabs: chosenVocabs,
      grammars: chosenGrammars,
      createdAt: new Date().toLocaleDateString("vi-VN"),
      notes: curatedNotes.trim(),
    };

    setCuratedLessons((prev) => [newCurated, ...prev]);
    setIsCurateModalOpen(false);
    showToast(`Đã lưu bài học tùy chỉnh "${newCurated.title}" vào Thư viện của tôi!`);
  };

  // Handle Upload Lecture Material
  const handleConfirmUploadMaterial = () => {
    if (!newMaterialTitle.trim()) {
      showToast("Vui lòng nhập tên tài liệu bài giảng!");
      return;
    }

    const sharedNames = classesList
      .filter((c) => newMaterialClassIds.includes(c.id))
      .map((c) => c.name);

    const newMaterial: LectureMaterialItem = {
      id: `mat-${Date.now()}`,
      title: newMaterialTitle.trim(),
      fileType: newMaterialType,
      fileSize: "5.2 MB",
      fileUrl: "#",
      sharedClassIds: newMaterialClassIds,
      sharedClassNames: sharedNames.length > 0 ? sharedNames : ["Lớp mặc định"],
      classification: newMaterialClassification,
      allowDownload: newMaterialAllowDownload,
      openDate: newMaterialOpenDate,
      dueDate: newMaterialDueDate,
      uploadedAt: new Date().toLocaleDateString("vi-VN"),
      status: newMaterialClassIds.length > 0 ? "SHARED" : "PRIVATE",
    };

    setLectureMaterials((prev) => [newMaterial, ...prev]);
    setIsUploadMaterialModalOpen(false);
    setNewMaterialTitle("");
    showToast(`Đã tải lên và lưu tài liệu "${newMaterial.title}" vào thư viện!`);
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
        `Đã chuyển ${chosenVocabList.length} từ vựng và ${chosenGrammarList.length} điểm ngữ pháp sang module Bài tập!`
      );
    }
  };

  // Search Jump Handler
  const handleJumpToSearchResult = (lesson: LessonSummary) => {
    setActiveTrack(lesson.trackId);
    if (lesson.trackId === "hsk") {
      setHskSelectedLevel(lesson.levelId);
      setHskSelectedLessonId(lesson.id);
      setHskViewLevelList(false);
    } else if (lesson.trackId === "topic") {
      setTopicSelectedCategory(lesson.levelId);
      setTopicSelectedLessonId(lesson.id);
      setTopicViewCategoryList(false);
    } else {
      setMajorSelectedField("major-econ");
      setMajorSelectedLessonId(lesson.id);
      setMajorViewFieldList(false);
    }
    setSearchQuery("");
    window.scrollTo({ top: 120, behavior: "smooth" });
    showToast(`Đã chuyển tới bài: ${lesson.titleVi} (${lesson.titleZh})`);
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
        {/* TOP BAR: Header + Search Engine (Lỗi 2) */}
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
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] font-sans font-semibold border border-[#204434]/20">
                  Hanyu Teacher 2026
                </span>
              </h1>
              <p className="text-xs text-[#315E48]">
                Hệ thống giáo trình chuẩn HSK 3.0, Giao tiếp theo chủ đề và Chuyên ngành Đại học
              </p>
            </div>
          </div>

          {/* Connected Search Engine Bar with Live Scope and Dropdown (Lỗi 2) */}
          <div className="relative w-full md:w-96">
            <div className="flex items-center gap-1.5 bg-[#FFFCF6] border border-[#E5DEC9] rounded-xl px-3 py-1.5 shadow-2xs focus-within:ring-1 focus-within:ring-[#204434]">
              <Search className="w-4 h-4 text-[#315E48] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm chữ Hán, pinyin, tên bài, chủ đề..."
                className="w-full bg-transparent text-xs text-[#204434] placeholder-[#315E48]/60 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 hover:bg-[#E5DEC9]/50 rounded-md text-[#315E48]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFCF6] border border-[#E5DEC9] rounded-2xl shadow-xl z-50 p-3 space-y-2 max-h-80 overflow-y-auto">
                <div className="flex items-center justify-between text-[11px] text-[#315E48] border-b border-[#E5DEC9] pb-2">
                  <span>
                    Kết quả tìm kiếm cho: <strong>"{searchQuery}"</strong> ({searchResults.length})
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSearchScope("ALL")}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        searchScope === "ALL" ? "bg-[#204434] text-white" : "text-[#315E48]"
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setSearchScope("hsk")}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        searchScope === "hsk" ? "bg-[#204434] text-white" : "text-[#315E48]"
                      }`}
                    >
                      HSK
                    </button>
                    <button
                      onClick={() => setSearchScope("topic")}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        searchScope === "topic" ? "bg-[#204434] text-white" : "text-[#315E48]"
                      }`}
                    >
                      Chủ đề
                    </button>
                  </div>
                </div>

                {searchResults.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#315E48] space-y-1">
                    <p className="font-semibold">Không tìm thấy bài học nào phù hợp</p>
                    <p className="text-[11px] text-[#8F6D3B]">
                      Thử tìm theo chữ Hán (今天), Pinyin (jintian), hoặc tiếng Việt (nghỉ ngơi)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleJumpToSearchResult(item)}
                        className="p-2.5 rounded-xl hover:bg-[#FAF7F0] cursor-pointer flex items-center justify-between transition border border-transparent hover:border-[#E5DEC9]"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#204434]/10 text-[#204434]">
                              {item.levelLabel}
                            </span>
                            <span className="font-serif font-bold text-xs text-[#204434]">
                              Bài {item.orderNumber}: {item.titleZh}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#315E48]">{item.titleVi}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#BC9B6B]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2 MAIN TABS: 1. Khám phá bài học | 2. Thư viện của tôi (Lỗi 3) */}
        {/* =================================================================== */}
        <div className="flex items-center gap-3 border-b border-[#E5DEC9] pb-3">
          <button
            onClick={() => setMainTab("EXPLORE")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              mainTab === "EXPLORE"
                ? "bg-[#204434] text-white shadow-xs"
                : "bg-[#FFFCF6] text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#BC9B6B]" />
            <span>Khám phá bài học (Học liệu Admin)</span>
          </button>

          <button
            onClick={() => setMainTab("MY_LIBRARY")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              mainTab === "MY_LIBRARY"
                ? "bg-[#204434] text-white shadow-xs"
                : "bg-[#FFFCF6] text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Bookmark className="w-4 h-4 text-[#BC9B6B]" />
            <span>Thư viện của tôi ({savedHanyuLessons.length + curatedLessons.length + lectureMaterials.length})</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: KHÁM PHÁ BÀI HỌC (3 INDEPENDENT BRANCHES: HSK, TOPIC, MAJOR) */}
        {/* =================================================================== */}
        {mainTab === "EXPLORE" && (
          <div className="space-y-6">
            {/* 3 Categories / Tracks selector */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => {
                  setActiveTrack("hsk");
                  setHskViewLevelList(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeTrack === "hsk"
                    ? "bg-[#204434] text-white shadow-xs"
                    : "bg-[#FFFCF6] text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
                }`}
              >
                <span>HSK 3.0 Tiêu chuẩn</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTrack === "hsk" ? "bg-[#BC9B6B] text-white" : "bg-[#E5DEC9] text-[#204434]"
                  }`}
                >
                  HSK 1–6 & 7–9
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTrack("topic");
                  setTopicViewCategoryList(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeTrack === "topic"
                    ? "bg-[#204434] text-white shadow-xs"
                    : "bg-[#FFFCF6] text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
                }`}
              >
                <span>Theo chủ đề đời sống</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTrack === "topic" ? "bg-[#BC9B6B] text-white" : "bg-[#E5DEC9] text-[#204434]"
                  }`}
                >
                  6 nhóm chủ đề
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTrack("major");
                  setMajorViewFieldList(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeTrack === "major"
                    ? "bg-[#204434] text-white shadow-xs"
                    : "bg-[#FFFCF6] text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
                }`}
              >
                <span>Đại học & Ngành</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTrack === "major" ? "bg-[#BC9B6B] text-white" : "bg-[#E5DEC9] text-[#204434]"
                  }`}
                >
                  5 khối ngành
                </span>
              </button>
            </div>

            {/* Clickable Breadcrumbs for active branch */}
            <div className="flex items-center justify-between text-xs text-[#315E48] bg-[#FFFCF6] border border-[#E5DEC9] px-4 py-2.5 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-2 font-medium flex-wrap">
                <span
                  onClick={() => {
                    if (activeTrack === "hsk") setHskViewLevelList(true);
                    if (activeTrack === "topic") setTopicViewCategoryList(true);
                    if (activeTrack === "major") setMajorViewFieldList(true);
                  }}
                  className="hover:underline cursor-pointer"
                >
                  Trang chủ
                </span>
                <span>&gt;</span>

                {activeTrack === "hsk" && (
                  <>
                    <span
                      onClick={() => setHskViewLevelList(true)}
                      className="hover:underline cursor-pointer font-bold text-[#204434]"
                    >
                      HSK 3.0
                    </span>
                    <span>&gt;</span>
                    <span
                      onClick={() => setHskViewLevelList(false)}
                      className="hover:underline cursor-pointer"
                    >
                      {currentLesson.levelLabel}
                    </span>
                    <span>&gt;</span>
                    <span className="font-bold text-[#204434]">
                      Bài {currentLesson.orderNumber}: {currentLesson.titleZh}
                    </span>
                  </>
                )}

                {activeTrack === "topic" && (
                  <>
                    <span
                      onClick={() => setTopicViewCategoryList(true)}
                      className="hover:underline cursor-pointer font-bold text-[#204434]"
                    >
                      Theo chủ đề
                    </span>
                    <span>&gt;</span>
                    <span
                      onClick={() => setTopicViewCategoryList(false)}
                      className="hover:underline cursor-pointer"
                    >
                      {currentLesson.categoryLabel || "Nhóm chủ đề"}
                    </span>
                    <span>&gt;</span>
                    <span className="font-bold text-[#204434]">
                      Bài {currentLesson.orderNumber}: {currentLesson.titleZh}
                    </span>
                  </>
                )}

                {activeTrack === "major" && (
                  <>
                    <span
                      onClick={() => setMajorViewFieldList(true)}
                      className="hover:underline cursor-pointer font-bold text-[#204434]"
                    >
                      Đại học & Ngành
                    </span>
                    <span>&gt;</span>
                    <span
                      onClick={() => setMajorViewFieldList(false)}
                      className="hover:underline cursor-pointer"
                    >
                      {currentLesson.categoryLabel || "Khối ngành"}
                    </span>
                    <span>&gt;</span>
                    <span className="font-bold text-[#204434]">
                      Bài {currentLesson.orderNumber}: {currentLesson.titleZh}
                    </span>
                  </>
                )}
              </div>

              {/* Stepper buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-[#8F6D3B] font-bold">
                  {currentLesson.titleVi}
                </span>
              </div>
            </div>

            {/* BRANCH 1: HSK 3.0 LEVEL LIST VIEW (Khi bấm chọn cấp độ) */}
            {activeTrack === "hsk" && hskViewLevelList && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#204434]">
                    Danh sách 7 cấp độ HSK 3.0 Tiêu chuẩn mới
                  </h3>
                  <button
                    onClick={() => setHskViewLevelList(false)}
                    className="text-xs text-[#204434] hover:underline font-semibold"
                  >
                    Xem lại bài học gần nhất →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {HSK_LEVELS_META.map((lvl) => (
                    <div
                      key={lvl.id}
                      onClick={() => {
                        if (!lvl.isAvailable) {
                          showToast("Cấp độ HSK 7-9 đang được Admin biên soạn học liệu.");
                          return;
                        }
                        setHskSelectedLevel(lvl.id);
                        if (lvl.id === "hsk1") setHskSelectedLessonId("hsk1-b5");
                        if (lvl.id === "hsk2") setHskSelectedLessonId("hsk2-b1");
                        if (lvl.id === "hsk3") setHskSelectedLessonId("hsk3-b1");
                        setHskViewLevelList(false);
                      }}
                      className={`p-4 rounded-3xl border transition flex flex-col justify-between space-y-3 ${
                        lvl.isAvailable
                          ? "bg-[#FFFCF6] border-[#E5DEC9] hover:border-[#204434] cursor-pointer hover:shadow-xs"
                          : "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-lg text-[#204434]">
                            {lvl.title}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              lvl.isAvailable
                                ? "bg-[#204434]/10 text-[#204434]"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {lvl.tag}
                          </span>
                        </div>
                        <p className="text-xs text-[#315E48] leading-relaxed">{lvl.desc}</p>
                      </div>
                      <div className="pt-2 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#8F6D3B]">
                          {lvl.isAvailable ? "Khám phá bài học" : "Chưa có bài"}
                        </span>
                        {lvl.isAvailable && <ArrowRight className="w-3.5 h-3.5 text-[#204434]" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BRANCH 2: THEO CHỦ ĐỀ CATEGORY PICKER (Khi bấm xem nhóm chủ đề) */}
            {activeTrack === "topic" && topicViewCategoryList && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#204434]">
                    Chọn nhóm chủ đề giao tiếp
                  </h3>
                  <button
                    onClick={() => setTopicViewCategoryList(false)}
                    className="text-xs text-[#204434] hover:underline font-semibold"
                  >
                    Xem lại bài học gần nhất →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {TOPIC_CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setTopicSelectedCategory(cat.id);
                        const firstLesson = TOPIC_LESSONS[cat.id]?.[0];
                        if (firstLesson) {
                          setTopicSelectedLessonId(firstLesson.id);
                        }
                        setTopicViewCategoryList(false);
                      }}
                      className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] hover:border-[#204434] cursor-pointer shadow-xs space-y-3 hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#204434]">
                            {cat.title}
                          </h4>
                          <span className="text-[11px] text-[#8F6D3B]">
                            {cat.totalLessons} bài học
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[#315E48] leading-relaxed">{cat.desc}</p>
                      <div className="pt-2 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#204434]">Mở danh sách bài</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#204434]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BRANCH 3: ĐẠI HỌC & NGÀNH FIELD PICKER (Khi bấm xem khối ngành) */}
            {activeTrack === "major" && majorViewFieldList && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#204434]">
                    Chọn khối ngành Đại học & Kinh tế
                  </h3>
                  <button
                    onClick={() => setMajorViewFieldList(false)}
                    className="text-xs text-[#204434] hover:underline font-semibold"
                  >
                    Xem lại bài học gần nhất →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {MAJOR_FIELDS.map((fld) => (
                    <div
                      key={fld.id}
                      onClick={() => {
                        setMajorSelectedField(fld.id);
                        const sub = fld.subjects[0];
                        if (sub) {
                          setMajorSelectedSubject(sub.id);
                          const les = MAJOR_LESSONS[sub.id]?.[0];
                          if (les) setMajorSelectedLessonId(les.id);
                        }
                        setMajorViewFieldList(false);
                      }}
                      className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] hover:border-[#204434] cursor-pointer shadow-xs space-y-3 hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{fld.icon}</span>
                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#204434]">
                            {fld.title}
                          </h4>
                          <span className="text-[11px] text-[#8F6D3B]">
                            {fld.subjects.length} môn học
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[#315E48] leading-relaxed">{fld.desc}</p>
                      <div className="pt-2 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#204434]">Chọn khối ngành này</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#204434]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HERO PANORAMIC ARTWORK BANNER (Pure SVG/CSS) */}
            {(!hskViewLevelList && !topicViewCategoryList && !majorViewFieldList) && (
              <>
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
                        {currentLesson.levelLabel} • {currentLesson.categoryLabel || "HỌC LIỆU CHUẨN"}
                      </span>
                      <span className="text-xs text-white/80">
                        Bài {currentLesson.orderNumber}
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
                    </div>

                    {/* Action buttons on banner */}
                    <div className="pt-2 flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => setIsPreviewModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#204434] text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#204434]" />
                        <span>Xem trước góc nhìn học viên</span>
                      </button>

                      {/* SAVE TO MY LIBRARY BUTTON (Lỗi 3) */}
                      <button
                        onClick={handleToggleSaveRootLesson}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                          isCurrentLessonSaved
                            ? "bg-[#BC9B6B] text-white"
                            : "bg-black/30 hover:bg-black/40 text-white border border-white/20"
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{isCurrentLessonSaved ? "Đã lưu vào Thư viện ✓" : "Lưu vào thư viện của tôi"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* TWO-COLUMN LAYOUT: Content Modules (Left) + Basket (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* LEFT: 5 CONTENT GROUPS */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* SECTION 1: TỪ VỰNG */}
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
                              Tích chọn các từ mới để giao bài hoặc tạo bài tập
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

                    {/* SECTION 2: NGỮ PHÁP */}
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

                                <div className="bg-white/80 border border-[#E5DEC9] rounded-xl px-3.5 py-2 flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wide">
                                    Cấu trúc:
                                  </span>
                                  <code className="text-xs font-mono font-bold text-[#204434]">
                                    {g.structure}
                                  </code>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* SECTION 3: HỘI THOẠI */}
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
                              </h3>
                              <p className="text-[11px] text-[#315E48]">
                                {currentLesson.dialogue.situation}
                              </p>
                            </div>
                          </div>
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
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN: BỘ NỘI DUNG ĐÃ CHỌN (SELECTION BASKET) */}
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
                            <p className="text-[11px] text-[#315E48]">Đang chọn từ bài giảng này</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#204434] text-white">
                          {totalSelectedCount} mục
                        </span>
                      </div>

                      {/* 5 Counters */}
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
                      </div>

                      {/* Class Selector */}
                      <div className="space-y-1.5 pt-2 border-t border-[#E5DEC9]">
                        <label className="text-xs font-bold text-[#204434] block">
                          Chọn lớp áp dụng:
                        </label>
                        <select
                          value={selectedClassId}
                          onChange={(e) => setSelectedClassId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs text-[#204434]"
                        >
                          {classesList.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.studentCount || 0} học viên)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 3 Action Buttons */}
                      <div className="space-y-2.5 pt-2">
                        {/* 1. Lưu thành bài học tùy chỉnh */}
                        <button
                          onClick={() => {
                            setCuratedTitle(`Ôn tập: ${currentLesson.titleVi} (${totalSelectedCount} mục)`);
                            setIsCurateModalOpen(true);
                          }}
                          disabled={totalSelectedCount === 0}
                          className="w-full py-2.5 px-3 rounded-xl border border-[#BC9B6B] bg-[#FFFCF6] hover:bg-[#F3EEDD] disabled:opacity-40 text-[#8F6D3B] text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Lưu thành bài học tùy chỉnh</span>
                        </button>

                        {/* 2. Giao bài học cho lớp */}
                        <button
                          onClick={() => setIsAssignModalOpen(true)}
                          disabled={totalSelectedCount === 0}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#204434] hover:bg-[#183629] disabled:opacity-40 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5 text-[#BC9B6B]" />
                          <span>Giao bài học cho lớp</span>
                        </button>

                        {/* 3. Tạo bài tập từ nội dung đã chọn */}
                        <button
                          onClick={handleTransferToAssignment}
                          disabled={totalSelectedCount === 0}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] disabled:opacity-40 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#FEF3C7]" />
                          <span>Tạo bài tập từ nội dung này</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: THƯ VIỆN CỦA TÔI (Lỗi 3: QUẢN LÝ HỌC LIỆU CÁ NHÂN & TÀI LIỆU) */}
        {/* =================================================================== */}
        {mainTab === "MY_LIBRARY" && (
          <div className="space-y-6">
            {/* Sub-tabs inside Thư viện của tôi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "ALL", label: `Tất cả (${savedHanyuLessons.length + curatedLessons.length + lectureMaterials.length})` },
                  { id: "SAVED_HANYU", label: `Đã lưu từ Hanyu (${savedHanyuLessons.length})` },
                  { id: "CURATED", label: `Bài học tùy chỉnh (${curatedLessons.length})` },
                  { id: "MATERIALS", label: `Tài liệu bài giảng (${lectureMaterials.length})` },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setLibrarySubTab(sub.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      librarySubTab === sub.id
                        ? "bg-[#204434] text-white shadow-xs"
                        : "bg-[#FFFCF6] text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* Upload Material Button */}
              <button
                onClick={() => setIsUploadMaterialModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4 text-[#BC9B6B]" />
                <span>+ Tải lên tài liệu bài giảng</span>
              </button>
            </div>

            {/* A. SECTION: ĐÃ LƯU TỪ HANYU */}
            {(librarySubTab === "ALL" || librarySubTab === "SAVED_HANYU") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-[#BC9B6B]" />
                    <span>Đã lưu từ Hanyu (Học liệu Admin)</span>
                  </h3>
                  <span className="text-xs text-[#315E48]">Chỉ đọc · Có thể giao cho lớp</span>
                </div>

                {savedHanyuLessons.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-[#FFFCF6] border border-dashed border-[#E5DEC9] text-center text-xs text-[#315E48]">
                    Bạn chưa lưu bài học nào từ kho Admin. Hãy vào tab "Khám phá bài học" và bấm "Lưu vào thư viện của tôi".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {savedHanyuLessons.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] hover:border-[#BC9B6B] shadow-2xs space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#204434]/10 text-[#204434]">
                              {item.levelLabel}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                              Học liệu Hanyu – Chỉ đọc
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-base text-[#204434]">
                            {item.titleZh}
                          </h4>
                          <p className="text-xs text-[#315E48]">{item.titleVi}</p>
                          <p className="text-[10px] text-[#8F6D3B]">Đã lưu ngày: {item.savedAt}</p>
                        </div>

                        <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setActiveTrack(item.trackId);
                              if (item.trackId === "hsk") setHskSelectedLessonId(item.lessonId);
                              if (item.trackId === "topic") setTopicSelectedLessonId(item.lessonId);
                              setMainTab("EXPLORE");
                            }}
                            className="text-xs font-bold text-[#204434] hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Mở học liệu</span>
                          </button>
                          <button
                            onClick={() => {
                              setSavedHanyuLessons((prev) => prev.filter((s) => s.id !== item.id));
                              showToast(`Đã bỏ lưu bài học "${item.titleVi}"`);
                            }}
                            className="text-[11px] text-red-600 hover:underline"
                          >
                            Bỏ lưu
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* B. SECTION: BÀI HỌC TÙY CHỈNH */}
            {(librarySubTab === "ALL" || librarySubTab === "CURATED") && (
              <div className="space-y-3 pt-4 border-t border-[#E5DEC9]">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
                    <span>Bài học tùy chỉnh (Bộ nội dung giáo viên đã lọc)</span>
                  </h3>
                  <span className="text-xs text-[#315E48]">Được giáo viên chọn lọc từ bài gốc</span>
                </div>

                {curatedLessons.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-[#FFFCF6] border border-dashed border-[#E5DEC9] text-center text-xs text-[#315E48]">
                    Chưa có bộ nội dung tùy chỉnh nào. Tích chọn từ vựng & ngữ pháp rồi nhấn "Lưu thành bài học tùy chỉnh".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {curatedLessons.map((cur) => (
                      <div
                        key={cur.id}
                        className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/60 shadow-xs space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-bold">
                            Tùy chỉnh riêng của bạn
                          </span>
                          <h4 className="font-serif font-bold text-base text-[#204434]">
                            {cur.title}
                          </h4>
                          <p className="text-xs text-[#315E48]">
                            Nguồn: <strong>{cur.sourceLessonTitle}</strong>
                          </p>
                          <div className="flex items-center gap-3 text-xs text-[#8F6D3B]">
                            <span>📚 {cur.selectedVocabCount} từ vựng</span>
                            <span>📐 {cur.selectedGrammarCount} ngữ pháp</span>
                          </div>
                          {cur.notes && (
                            <p className="text-[11px] text-[#315E48] italic bg-[#FAF7F0] p-2 rounded-xl border border-[#E5DEC9]">
                              Ghi chú: {cur.notes}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                          <button
                            onClick={() => {
                              if (onNavigateToAssignments) {
                                onNavigateToAssignments({
                                  lessonTitle: cur.title,
                                  classId: selectedClassId,
                                  vocabList: cur.vocabs,
                                  grammarList: cur.grammars,
                                });
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#204434] text-white text-xs font-bold shadow-2xs hover:bg-[#183629]"
                          >
                            Tạo bài tập từ bộ này
                          </button>
                          <button
                            onClick={() => {
                              setCuratedLessons((prev) => prev.filter((c) => c.id !== cur.id));
                              showToast(`Đã xóa bộ tùy chỉnh "${cur.title}"`);
                            }}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Xóa bộ này
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* C. SECTION: TÀI LIỆU BÀI GIẢNG CỦA TÔI (UPLOAD & CHIA SẺ) */}
            {(librarySubTab === "ALL" || librarySubTab === "MATERIALS") && (
              <div className="space-y-3 pt-4 border-t border-[#E5DEC9]">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#BC9B6B]" />
                    <span>Tài liệu bài giảng của tôi (PDF, Slide, Tập viết)</span>
                  </h3>
                  <span className="text-xs text-[#315E48]">
                    Học viên xem trong mục "Tài liệu lớp học"
                  </span>
                </div>

                <div className="rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E5DEC9] bg-[#FAF7F0] text-[#315E48] font-bold text-[11px]">
                        <th className="py-3 px-4">Tên tài liệu bài giảng</th>
                        <th className="py-3 px-4">Định dạng</th>
                        <th className="py-3 px-4">Phân loại</th>
                        <th className="py-3 px-4">Lớp được chia sẻ</th>
                        <th className="py-3 px-4">Ngày tải lên</th>
                        <th className="py-3 px-4 text-right">Tác vụ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DEC9]/50">
                      {lectureMaterials.map((mat) => (
                        <tr key={mat.id} className="hover:bg-[#FAF7F0]/60 transition">
                          <td className="py-3.5 px-4 font-bold text-[#204434]">
                            {mat.title}
                            <span className="text-[10px] text-[#8F6D3B] block font-normal">
                              Dung lượng: {mat.fileSize}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#BC9B6B]/20 text-[#8F6D3B]">
                              {mat.fileType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#315E48]">{mat.classification}</td>
                          <td className="py-3.5 px-4 text-[#315E48]">
                            {mat.sharedClassNames.join(", ")}
                          </td>
                          <td className="py-3.5 px-4 text-[#315E48]">{mat.uploadedAt}</td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => showToast(`Đang mở xem trước: ${mat.title}`)}
                              className="px-2.5 py-1 rounded-lg border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] text-[11px] font-semibold"
                            >
                              Xem trước
                            </button>
                            <button
                              onClick={() => {
                                setLectureMaterials((prev) => prev.filter((m) => m.id !== mat.id));
                                showToast(`Đã xóa tài liệu: ${mat.title}`);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-semibold"
                            >
                              Thu hồi
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: LƯU THÀNH BÀI HỌC TÙY CHỈNH */}
      {/* =================================================================== */}
      {isCurateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#8F6D3B]" />
                <h3 className="font-serif font-bold text-base text-[#204434]">
                  Lưu bài học tùy chỉnh
                </h3>
              </div>
              <button
                onClick={() => setIsCurateModalOpen(false)}
                className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#204434] block mb-1">
                  Tên bài học tùy chỉnh: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={curatedTitle}
                  onChange={(e) => setCuratedTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-semibold"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1">
                <p className="text-[#315E48]">
                  Bài gốc: <strong>{currentLesson.titleVi}</strong>
                </p>
                <p className="text-[#8F6D3B]">
                  Nội dung đã chọn: {selectedVocabIds.length} từ vựng, {selectedGrammarIds.length} ngữ pháp
                </p>
              </div>

              <div>
                <label className="font-bold text-[#204434] block mb-1">Ghi chú mục đích:</label>
                <textarea
                  value={curatedNotes}
                  onChange={(e) => setCuratedNotes(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Ôn tập 15 phút đầu giờ cho lớp..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCurateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmCuratedSave}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs"
              >
                Lưu vào Thư viện của tôi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: TẢI LÊN TÀI LIỆU BÀI GIẢNG CỦA TÔI */}
      {/* =================================================================== */}
      {isUploadMaterialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#204434]" />
                <h3 className="font-serif font-bold text-base text-[#204434]">
                  Tải lên tài liệu bài giảng
                </h3>
              </div>
              <button
                onClick={() => setIsUploadMaterialModalOpen(false)}
                className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#204434] block mb-1">
                  Tên tài liệu bài giảng: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMaterialTitle}
                  onChange={(e) => setNewMaterialTitle(e.target.value)}
                  placeholder="Ví dụ: Slide HSK 1 - Bài 5 Ôn tập từ vựng.pptx"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#204434] block mb-1">Định dạng file:</label>
                  <select
                    value={newMaterialType}
                    onChange={(e) => setNewMaterialType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                  >
                    <option value="PDF">Tài liệu PDF</option>
                    <option value="PPTX">Bài trình chiếu PowerPoint (.pptx)</option>
                    <option value="DOCX">Văn bản Word (.docx)</option>
                    <option value="IMAGE">Ảnh tập viết / Sơ đồ (.jpg, .png)</option>
                    <option value="AUDIO">Audio nghe hiểu (.mp3)</option>
                    <option value="VIDEO">Video bài giảng (.mp4)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#204434] block mb-1">Phân loại học liệu:</label>
                  <input
                    type="text"
                    value={newMaterialClassification}
                    onChange={(e) => setNewMaterialClassification(e.target.value)}
                    placeholder="Ví dụ: HSK 1, Chủ đề ẩm thực..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                  />
                </div>
              </div>

              {/* Class Sharing */}
              <div>
                <label className="font-bold text-[#204434] block mb-1">
                  Chia sẻ cho lớp học nào (Học viên xem trong "Tài liệu lớp học"):
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-white border border-[#E5DEC9]">
                  {classesList.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 cursor-pointer font-medium text-[#204434]"
                    >
                      <input
                        type="checkbox"
                        checked={newMaterialClassIds.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewMaterialClassIds([...newMaterialClassIds, c.id]);
                          } else {
                            setNewMaterialClassIds(
                              newMaterialClassIds.filter((id) => id !== c.id)
                            );
                          }
                        }}
                        className="rounded text-[#204434] focus:ring-[#204434]"
                      />
                      <span>
                        {c.name} ({c.studentCount || 0} học viên)
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#204434]">
                <input
                  type="checkbox"
                  checked={newMaterialAllowDownload}
                  onChange={(e) => setNewMaterialAllowDownload(e.target.checked)}
                  className="rounded text-[#204434] focus:ring-[#204434]"
                />
                <span>Cho phép học viên tải file về máy</span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsUploadMaterialModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmUploadMaterial}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs"
              >
                Lưu & Chia sẻ tài liệu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: XEM TRƯỚC GÓC NHÌN HỌC VIÊN */}
      {/* =================================================================== */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-[#204434]" />
                <h3 className="font-serif font-bold text-base text-[#204434]">
                  Góc nhìn học viên: {currentLesson.titleZh}
                </h3>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#204434] text-white space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#BC9B6B]">
                  {currentLesson.levelLabel}
                </span>
                <h4 className="text-2xl font-serif font-bold">{currentLesson.titleZh}</h4>
                <p className="text-xs text-white/80">{currentLesson.titleVi}</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-[#204434]">Thẻ từ vựng Flashcard:</span>
                <div className="grid grid-cols-2 gap-3">
                  {currentLesson.vocabularies.slice(0, 4).map((v) => (
                    <div
                      key={v.id}
                      className="p-4 rounded-2xl border border-[#E5DEC9] bg-white text-center space-y-1 shadow-2xs"
                    >
                      <p className="text-2xl font-serif font-bold text-[#204434]">{v.hanzi}</p>
                      <p className="text-xs text-[#BC9B6B]">{v.pinyin}</p>
                      <p className="text-xs font-semibold text-[#315E48] pt-1">{v.meaningVi}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#204434] text-white text-xs font-bold"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
