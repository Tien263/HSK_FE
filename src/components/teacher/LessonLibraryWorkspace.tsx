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
  LayoutGrid,
  List,
  Building2,
  Library,
  Compass,
  Award,
  AlertTriangle,
  Lightbulb,
  Info,
} from "lucide-react";
import {
  LessonHeroBannerSvg,
  HeaderMistyMountainsSvg,
  LessonThumbnailArtwork,
} from "./LessonLibraryArtwork";
import {
  LESSON_5_DETAIL,
  UNIVERSITY_LESSON_DETAIL,
  HSK_LEVELS_META,
  HSK1_LESSONS,
  HSK2_LESSONS,
  HSK3_LESSONS,
  HSK_LESSONS_MAP,
  OFFICIAL_9_TOPICS,
  SUBTOPIC_LESSONS_MAP,
  OFFICIAL_12_FACULTIES,
  ALL_LESSONS_INDEX,
  getLessonDetailById,
  searchLessons,
  FullLessonDetail,
  LessonSummary,
  VocabularyItem,
  GrammarItem,
  CulturalNoteItem,
  AcademicContentItem,
  TopicDifficultyLevel,
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

  // HSK 3.0 Branch Screen Flow: LEVELS -> LESSONS_LIST -> LESSON_DETAIL
  const [hskScreen, setHskScreen] = useState<"LEVELS" | "LESSONS_LIST" | "LESSON_DETAIL">("LEVELS");
  const [hskSelectedLevel, setHskSelectedLevel] = useState<string>("hsk1");
  const [hskSelectedLessonId, setHskSelectedLessonId] = useState<string>("hsk1-b5");
  const [hskSearchFilter, setHskSearchFilter] = useState<string>("");
  const [hskViewMode, setHskViewMode] = useState<"grid" | "list">("grid");

  // Theo chủ đề Branch Screen Flow: MAJOR_TOPICS -> SUBTOPICS -> LESSONS_LIST -> LESSON_DETAIL
  const [topicScreen, setTopicScreen] = useState<"MAJOR_TOPICS" | "SUBTOPICS" | "LESSONS_LIST" | "LESSON_DETAIL">("MAJOR_TOPICS");
  const [topicSelectedMajorId, setTopicSelectedMajorId] = useState<string>("top-1-life");
  const [topicSelectedSubtopicId, setTopicSelectedSubtopicId] = useState<string>("sub-1-1");
  const [topicSelectedLessonId, setTopicSelectedLessonId] = useState<string>("top-comm-1");
  const [topicDifficultyFilter, setTopicDifficultyFilter] = useState<"ALL" | TopicDifficultyLevel>("ALL");
  const [topicSearchFilter, setTopicSearchFilter] = useState<string>("");
  const [topicViewMode, setTopicViewMode] = useState<"grid" | "list">("grid");

  // Đại học & Ngành Screen Flow: FACULTIES -> MAJORS -> COURSES -> CHAPTERS -> LESSONS_LIST -> LESSON_DETAIL
  const [majorScreen, setMajorScreen] = useState<"FACULTIES" | "MAJORS" | "COURSES" | "CHAPTERS" | "LESSONS_LIST" | "LESSON_DETAIL">("FACULTIES");
  const [majorSelectedFacultyId, setMajorSelectedFacultyId] = useState<string>("fac-business");
  const [majorSelectedMajorId, setMajorSelectedMajorId] = useState<string>("maj-ba");
  const [majorSelectedCourseId, setMajorSelectedCourseId] = useState<string>("crs-poliecon");
  const [majorSelectedChapterId, setMajorSelectedChapterId] = useState<string>("ch-poliecon-2");
  const [majorSelectedLessonId, setMajorSelectedLessonId] = useState<string>("uni-econ-ch2-sec1");
  const [majorSearchFilter, setMajorSearchFilter] = useState<string>("");

  // Active Lesson ID strictly depends on activeTrack
  const currentActiveLessonId = useMemo(() => {
    if (activeTrack === "hsk") return hskSelectedLessonId;
    if (activeTrack === "topic") return topicSelectedLessonId;
    return majorSelectedLessonId;
  }, [activeTrack, hskSelectedLessonId, topicSelectedLessonId, majorSelectedLessonId]);

  // Current lesson detail strictly loaded from current branch
  const currentLesson: FullLessonDetail = useMemo(() => {
    return getLessonDetailById(currentActiveLessonId);
  }, [currentActiveLessonId]);

  // Active Major Topic & Subtopic metadata
  const currentMajorTopic = useMemo(() => {
    return OFFICIAL_9_TOPICS.find((t) => t.id === topicSelectedMajorId) || OFFICIAL_9_TOPICS[0];
  }, [topicSelectedMajorId]);

  const currentSubtopic = useMemo(() => {
    return currentMajorTopic.subtopics.find((s) => s.id === topicSelectedSubtopicId) || currentMajorTopic.subtopics[0];
  }, [currentMajorTopic, topicSelectedSubtopicId]);

  // Active Faculty & Major & Course & Chapter metadata
  const currentFaculty = useMemo(() => {
    return OFFICIAL_12_FACULTIES.find((f) => f.id === majorSelectedFacultyId) || OFFICIAL_12_FACULTIES[0];
  }, [majorSelectedFacultyId]);

  const currentMajor = useMemo(() => {
    return currentFaculty.majors.find((m) => m.id === majorSelectedMajorId) || currentFaculty.majors[0];
  }, [currentFaculty, majorSelectedMajorId]);

  const currentCourse = useMemo(() => {
    return currentMajor?.courses.find((c) => c.id === majorSelectedCourseId) || currentMajor?.courses[0];
  }, [currentMajor, majorSelectedCourseId]);

  const currentChapter = useMemo(() => {
    return currentCourse?.chapters.find((ch) => ch.id === majorSelectedChapterId) || currentCourse?.chapters[0];
  }, [currentCourse, majorSelectedChapterId]);

  // =========================================================================
  // SEARCH ENGINE STATE
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState<"ALL" | "hsk" | "topic" | "major">("ALL");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchLessons(searchQuery, searchScope);
  }, [searchQuery, searchScope]);

  // =========================================================================
  // TAB 2: THƯ VIỆN CỦA TÔI STATE
  // =========================================================================
  const [librarySubTab, setLibrarySubTab] = useState<"ALL" | "SAVED_HANYU" | "CURATED" | "MATERIALS">("ALL");
  const [savedHanyuLessons, setSavedHanyuLessons] = useState<SavedHanyuLesson[]>(INITIAL_SAVED_HANYU_LESSONS);
  const [curatedLessons, setCuratedLessons] = useState<CustomCuratedLesson[]>(INITIAL_CURATED_LESSONS);
  const [lectureMaterials, setLectureMaterials] = useState<LectureMaterialItem[]>(INITIAL_LECTURE_MATERIALS);

  // Modal: Upload Material
  const [isUploadMaterialModalOpen, setIsUploadMaterialModalOpen] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState("");
  const [newMaterialType, setNewMaterialType] = useState<"PDF" | "PPTX" | "DOCX" | "IMAGE" | "AUDIO" | "VIDEO">("PDF");
  const [newMaterialClassIds, setNewMaterialClassIds] = useState<string[]>([]);
  const [newMaterialClassification, setNewMaterialClassification] = useState("HSK 1");
  const [newMaterialAllowDownload, setNewMaterialAllowDownload] = useState(true);
  const [newMaterialOpenDate, setNewMaterialOpenDate] = useState(new Date().toISOString().split("T")[0]);
  const [newMaterialDueDate, setNewMaterialDueDate] = useState("");

  // Modal: Curate Custom Lesson Modal
  const [isCurateModalOpen, setIsCurateModalOpen] = useState(false);
  const [curatedTitle, setCuratedTitle] = useState("");
  const [curatedNotes, setCuratedNotes] = useState("");

  // =========================================================================
  // SELECTIONS BASKET STATE
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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.85;
    utterance.onend = () => setActiveSpeakingText(null);
    utterance.onerror = () => setActiveSpeakingText(null);
    setActiveSpeakingText(text);
    window.speechSynthesis.speak(utterance);
  };

  // Selection basket totals
  const totalSelectedCount = useMemo(() => {
    return (
      selectedVocabIds.length +
      selectedGrammarIds.length +
      (isDialogueSelected ? 1 : 0) +
      (isReadingSelected ? 1 : 0) +
      (isListeningSelected ? 1 : 0)
    );
  }, [selectedVocabIds, selectedGrammarIds, isDialogueSelected, isReadingSelected, isListeningSelected]);

  // Selection handlers
  const toggleVocab = (id: string) => {
    setSelectedVocabIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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

  // Handle Save Custom Lesson
  const handleSaveCuratedLesson = () => {
    if (!curatedTitle.trim()) {
      showToast("Vui lòng nhập tên bài học tùy chỉnh");
      return;
    }
    const chosenVocabs = currentLesson.vocabularies.filter((v) =>
      selectedVocabIds.includes(v.id)
    );
    const chosenGrammars = currentLesson.grammars.filter((g) =>
      selectedGrammarIds.includes(g.id)
    );

    const newCurated: CustomCuratedLesson = {
      id: "curated-" + Date.now(),
      title: curatedTitle.trim(),
      sourceLessonId: currentLesson.id,
      sourceLessonTitle: currentLesson.titleVi,
      selectedVocabCount: chosenVocabs.length,
      selectedGrammarCount: chosenGrammars.length,
      vocabs: chosenVocabs,
      grammars: chosenGrammars,
      notes: curatedNotes.trim(),
      createdAt: new Date().toISOString().split("T")[0],
    };

    setCuratedLessons((prev) => [newCurated, ...prev]);
    setIsCurateModalOpen(false);
    setCuratedTitle("");
    setCuratedNotes("");
    showToast(`Đã lưu "${newCurated.title}" vào Thư viện của tôi!`);
  };

  // Handle Assign Lesson to Class
  const handleAssignToClass = () => {
    if (!selectedClassId) {
      showToast("Vui lòng chọn lớp học để giao bài");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsAssignModalOpen(false);
      const targetClass = classesList.find((c) => c.id === selectedClassId);
      showToast(
        `Đã giao bài "${currentLesson.titleVi}" cho lớp ${targetClass?.name || "được chọn"} (Hạn nộp: ${assignDueDate})!`
      );
    }, 600);
  };

  // Handle Transfer Selection to Assignment Module
  const handleTransferToAssignment = () => {
    const chosenVocabList = currentLesson.vocabularies.filter((v) =>
      selectedVocabIds.includes(v.id)
    );
    const chosenGrammarList = currentLesson.grammars.filter((g) =>
      selectedGrammarIds.includes(g.id)
    );

    if (chosenVocabList.length === 0 && chosenGrammarList.length === 0) {
      showToast("Vui lòng chọn ít nhất 1 từ vựng hoặc 1 điểm ngữ pháp để tạo bài tập!");
      return;
    }

    if (onNavigateToAssignments) {
      onNavigateToAssignments({
        lessonTitle: currentLesson.titleVi,
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
      setHskScreen("LESSON_DETAIL");
    } else if (lesson.trackId === "topic") {
      setTopicSelectedLessonId(lesson.id);
      setTopicScreen("LESSON_DETAIL");
    } else {
      setMajorSelectedLessonId(lesson.id);
      setMajorScreen("LESSON_DETAIL");
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
        {/* TOP BAR: Header + Global Search Engine */}
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

          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F6D3B]" />
              <input
                type="text"
                placeholder="Tìm bài học (Hán tự, Pinyin, Tiếng Việt)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] text-xs focus:outline-none focus:border-[#204434] text-[#204434] placeholder-[#8F6D3B]/60 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Results Popup */}
            {searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFCF6] border border-[#E5DEC9] rounded-2xl shadow-xl z-50 p-2 max-h-72 overflow-y-auto space-y-1 text-xs">
                <div className="px-2 py-1 text-[11px] font-bold text-[#8F6D3B] border-b border-[#E5DEC9] flex items-center justify-between">
                  <span>Kết quả ({searchResults.length})</span>
                  <span className="text-[10px] text-[#315E48]">Nhấp để mở bài học</span>
                </div>
                {searchResults.length === 0 ? (
                  <p className="p-3 text-center text-[#315E48]">Không tìm thấy bài học phù hợp</p>
                ) : (
                  searchResults.map((item) => (
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
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2 MAIN TABS: 1. Khám phá bài học | 2. Thư viện của tôi */}
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
        {/* TAB 1: KHÁM PHÁ BÀI HỌC (3 INDEPENDENT BRANCHES) */}
        {/* =================================================================== */}
        {mainTab === "EXPLORE" && (
          <div className="space-y-6">
            {/* 3 Categories / Tracks selector */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => {
                  setActiveTrack("hsk");
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
                  7 cấp độ
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTrack("topic");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeTrack === "topic"
                    ? "bg-[#204434] text-white shadow-xs"
                    : "bg-[#FFFCF6] text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
                }`}
              >
                <span>Theo chủ đề</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTrack === "topic" ? "bg-[#BC9B6B] text-white" : "bg-[#E5DEC9] text-[#204434]"
                  }`}
                >
                  9 chủ đề lớn (72 chủ đề con)
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTrack("major");
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
                  12 Viện/Khoa · ĐH Trịnh Châu
                </span>
              </button>
            </div>

            {/* Clickable Breadcrumbs for active branch */}
            <div className="flex items-center justify-between text-xs text-[#315E48] bg-[#FFFCF6] border border-[#E5DEC9] px-4 py-2.5 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-2 font-medium flex-wrap">
                <span
                  onClick={() => {
                    if (activeTrack === "hsk") setHskScreen("LEVELS");
                    if (activeTrack === "topic") setTopicScreen("MAJOR_TOPICS");
                    if (activeTrack === "major") setMajorScreen("FACULTIES");
                  }}
                  className="hover:underline cursor-pointer"
                >
                  Trang chủ
                </span>
                <span>&gt;</span>

                {/* HSK Breadcrumbs */}
                {activeTrack === "hsk" && (
                  <>
                    <span
                      onClick={() => setHskScreen("LEVELS")}
                      className={`hover:underline cursor-pointer ${
                        hskScreen === "LEVELS" ? "font-bold text-[#204434]" : ""
                      }`}
                    >
                      HSK 3.0
                    </span>
                    {hskScreen !== "LEVELS" && (
                      <>
                        <span>&gt;</span>
                        <span
                          onClick={() => setHskScreen("LESSONS_LIST")}
                          className={`hover:underline cursor-pointer ${
                            hskScreen === "LESSONS_LIST" ? "font-bold text-[#204434]" : ""
                          }`}
                        >
                          {HSK_LEVELS_META.find((l) => l.id === hskSelectedLevel)?.title || "HSK"}
                        </span>
                      </>
                    )}
                    {hskScreen === "LESSON_DETAIL" && (
                      <>
                        <span>&gt;</span>
                        <span className="font-bold text-[#204434]">
                          Bài {currentLesson.orderNumber}: {currentLesson.titleZh}
                        </span>
                      </>
                    )}
                  </>
                )}

                {/* Theo chủ đề Breadcrumbs */}
                {activeTrack === "topic" && (
                  <>
                    <span
                      onClick={() => setTopicScreen("MAJOR_TOPICS")}
                      className={`hover:underline cursor-pointer ${
                        topicScreen === "MAJOR_TOPICS" ? "font-bold text-[#204434]" : ""
                      }`}
                    >
                      Theo chủ đề
                    </span>
                    {topicScreen !== "MAJOR_TOPICS" && (
                      <>
                        <span>&gt;</span>
                        <span
                          onClick={() => setTopicScreen("SUBTOPICS")}
                          className={`hover:underline cursor-pointer ${
                            topicScreen === "SUBTOPICS" ? "font-bold text-[#204434]" : ""
                          }`}
                        >
                          {currentMajorTopic.title}
                        </span>
                      </>
                    )}
                    {(topicScreen === "LESSONS_LIST" || topicScreen === "LESSON_DETAIL") && (
                      <>
                        <span>&gt;</span>
                        <span
                          onClick={() => setTopicScreen("LESSONS_LIST")}
                          className={`hover:underline cursor-pointer ${
                            topicScreen === "LESSONS_LIST" ? "font-bold text-[#204434]" : ""
                          }`}
                        >
                          {currentSubtopic?.title || "Chủ đề con"}
                        </span>
                      </>
                    )}
                    {topicScreen === "LESSON_DETAIL" && (
                      <>
                        <span>&gt;</span>
                        <span className="font-bold text-[#204434]">
                          Bài {currentLesson.orderNumber}: {currentLesson.titleZh}
                        </span>
                      </>
                    )}
                  </>
                )}

                {/* Đại học & Ngành Breadcrumbs */}
                {activeTrack === "major" && (
                  <>
                    <span
                      onClick={() => setMajorScreen("FACULTIES")}
                      className={`hover:underline cursor-pointer ${
                        majorScreen === "FACULTIES" ? "font-bold text-[#204434]" : ""
                      }`}
                    >
                      ĐH Trịnh Châu (郑州大学)
                    </span>
                    {majorScreen !== "FACULTIES" && (
                      <>
                        <span>&gt;</span>
                        <span
                          onClick={() => setMajorScreen("MAJORS")}
                          className={`hover:underline cursor-pointer ${
                            majorScreen === "MAJORS" ? "font-bold text-[#204434]" : ""
                          }`}
                        >
                          {currentFaculty.nameZh} ({currentFaculty.nameVi})
                        </span>
                      </>
                    )}
                    {(majorScreen === "COURSES" || majorScreen === "CHAPTERS" || majorScreen === "LESSONS_LIST" || majorScreen === "LESSON_DETAIL") && (
                      <>
                        <span>&gt;</span>
                        <span
                          onClick={() => setMajorScreen("COURSES")}
                          className={`hover:underline cursor-pointer ${
                            majorScreen === "COURSES" ? "font-bold text-[#204434]" : ""
                          }`}
                        >
                          {currentMajor?.nameZh}
                        </span>
                      </>
                    )}
                    {(majorScreen === "CHAPTERS" || majorScreen === "LESSONS_LIST" || majorScreen === "LESSON_DETAIL") && (
                      <>
                        <span>&gt;</span>
                        <span
                          onClick={() => setMajorScreen("CHAPTERS")}
                          className={`hover:underline cursor-pointer ${
                            majorScreen === "CHAPTERS" ? "font-bold text-[#204434]" : ""
                          }`}
                        >
                          {currentCourse?.titleZh}
                        </span>
                      </>
                    )}
                    {(majorScreen === "LESSONS_LIST" || majorScreen === "LESSON_DETAIL") && (
                      <>
                        <span>&gt;</span>
                        <span
                          onClick={() => setMajorScreen("LESSONS_LIST")}
                          className={`hover:underline cursor-pointer ${
                            majorScreen === "LESSONS_LIST" ? "font-bold text-[#204434]" : ""
                          }`}
                        >
                          {currentChapter?.titleZh}
                        </span>
                      </>
                    )}
                    {majorScreen === "LESSON_DETAIL" && (
                      <>
                        <span>&gt;</span>
                        <span className="font-bold text-[#204434]">
                          {currentLesson.titleZh}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Stepper info */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-[#8F6D3B] font-bold hidden sm:inline">
                  {activeTrack === "hsk" && `Cấp độ ${HSK_LEVELS_META.find((l) => l.id === hskSelectedLevel)?.title || ""}`}
                  {activeTrack === "topic" && currentMajorTopic.title}
                  {activeTrack === "major" && currentFaculty.nameZh}
                </span>
              </div>
            </div>

            {/* =============================================================== */}
            {/* 1. HSK 3.0 BRANCH FLOW */}
            {/* =============================================================== */}
            {activeTrack === "hsk" && (
              <>
                {/* 1.1 HSK LEVEL SELECTION SCREEN */}
                {hskScreen === "LEVELS" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#204434]">
                          Danh sách 7 cấp độ HSK 3.0 Tiêu chuẩn mới
                        </h3>
                        <p className="text-xs text-[#315E48]">
                          Chọn cấp độ để xem toàn bộ danh mục bài học. Nhấp vào bài học để xem chi tiết học liệu.
                        </p>
                      </div>
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
                            setHskScreen("LESSONS_LIST");
                          }}
                          className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
                            lvl.isAvailable
                              ? "bg-[#FFFCF6] border-[#E5DEC9] hover:border-[#204434] cursor-pointer hover:shadow-md"
                              : "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-bold text-xl text-[#204434]">
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
                            <div className="flex items-center gap-2 text-[11px] text-[#8F6D3B]">
                              <span>📚 {HSK_LESSONS_MAP[lvl.id]?.length || 0} bài học</span>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#204434]">
                              {lvl.isAvailable ? "Xem danh sách bài →" : "Chưa mở"}
                            </span>
                            {lvl.isAvailable && <ArrowRight className="w-4 h-4 text-[#204434]" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1.2 HSK LESSONS LIST SCREEN FOR SELECTED LEVEL */}
                {hskScreen === "LESSONS_LIST" && (
                  <div className="space-y-5 animate-fade-in">
                    {/* Header Banner */}
                    <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setHskScreen("LEVELS")}
                            className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] flex items-center gap-1 transition"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Đổi cấp độ</span>
                          </button>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#204434] text-white">
                            {HSK_LEVELS_META.find((l) => l.id === hskSelectedLevel)?.title}
                          </span>
                        </div>
                        <h2 className="font-serif font-bold text-xl text-[#204434]">
                          Danh sách bài học {HSK_LEVELS_META.find((l) => l.id === hskSelectedLevel)?.title}
                        </h2>
                        <p className="text-xs text-[#315E48]">
                          {HSK_LEVELS_META.find((l) => l.id === hskSelectedLevel)?.desc}
                        </p>
                      </div>

                      {/* Controls: Search & Grid/List view */}
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F6D3B]" />
                          <input
                            type="text"
                            placeholder="Lọc bài trong cấp độ..."
                            value={hskSearchFilter}
                            onChange={(e) => setHskSearchFilter(e.target.value)}
                            className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-xs text-[#204434] focus:outline-none focus:border-[#204434]"
                          />
                        </div>
                        <div className="flex items-center rounded-xl border border-[#E5DEC9] bg-white p-0.5">
                          <button
                            onClick={() => setHskViewMode("grid")}
                            className={`p-1.5 rounded-lg transition ${
                              hskViewMode === "grid" ? "bg-[#204434] text-white" : "text-[#204434] hover:bg-[#FAF7F0]"
                            }`}
                            title="Xem dạng lưới"
                          >
                            <LayoutGrid className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setHskViewMode("list")}
                            className={`p-1.5 rounded-lg transition ${
                              hskViewMode === "list" ? "bg-[#204434] text-white" : "text-[#204434] hover:bg-[#FAF7F0]"
                            }`}
                            title="Xem dạng danh sách"
                          >
                            <List className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Lessons Grid or List */}
                    {(() => {
                      const levelLessons = (HSK_LESSONS_MAP[hskSelectedLevel] || []).filter((l) => {
                        if (!hskSearchFilter.trim()) return true;
                        const q = hskSearchFilter.toLowerCase();
                        return (
                          l.titleZh.toLowerCase().includes(q) ||
                          l.titleVi.toLowerCase().includes(q) ||
                          l.titlePy.toLowerCase().includes(q)
                        );
                      });

                      if (levelLessons.length === 0) {
                        return (
                          <div className="p-12 text-center rounded-3xl bg-[#FFFCF6] border border-dashed border-[#E5DEC9] space-y-2">
                            <p className="text-sm font-bold text-[#204434]">Không tìm thấy bài học nào phù hợp</p>
                            <p className="text-xs text-[#315E48]">Thử xóa bộ lọc tìm kiếm để xem toàn bộ danh mục bài học.</p>
                          </div>
                        );
                      }

                      if (hskViewMode === "grid") {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {levelLessons.map((les) => (
                              <div
                                key={les.id}
                                onClick={() => {
                                  setHskSelectedLessonId(les.id);
                                  setHskScreen("LESSON_DETAIL");
                                }}
                                className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] hover:border-[#204434] cursor-pointer shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#204434]/10 text-[#204434]">
                                      Bài {les.orderNumber}
                                    </span>
                                    <span className="text-[10px] text-[#8F6D3B] font-bold">
                                      {les.levelLabel}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-serif font-bold text-lg text-[#204434]">
                                      {les.titleZh}
                                    </h4>
                                    <p className="text-xs text-[#8F6D3B] italic">{les.titlePy}</p>
                                    <p className="text-xs text-[#315E48] font-medium mt-1">{les.titleVi}</p>
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                                  <span className="text-[11px] text-[#8F6D3B]">
                                    📚 {les.stats.vocabCount} từ vựng · {les.stats.grammarCount} ngữ pháp
                                  </span>
                                  <span className="text-xs font-bold text-[#204434] flex items-center gap-1 group-hover:translate-x-1 transition">
                                    Xem chi tiết →
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      return (
                        <div className="rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-xs overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-[#E5DEC9] bg-[#FAF7F0] text-[#315E48] font-bold text-[11px]">
                                <th className="py-3 px-4">Bài số</th>
                                <th className="py-3 px-4">Tiêu đề tiếng Trung</th>
                                <th className="py-3 px-4">Pinyin & Nghĩa tiếng Việt</th>
                                <th className="py-3 px-4">Học phần</th>
                                <th className="py-3 px-4 text-right">Tác vụ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5DEC9]/50">
                              {levelLessons.map((les) => (
                                <tr
                                  key={les.id}
                                  onClick={() => {
                                    setHskSelectedLessonId(les.id);
                                    setHskScreen("LESSON_DETAIL");
                                  }}
                                  className="hover:bg-[#FAF7F0]/60 cursor-pointer transition"
                                >
                                  <td className="py-3 px-4 font-bold text-[#204434]">Bài {les.orderNumber}</td>
                                  <td className="py-3 px-4 font-serif font-bold text-sm text-[#204434]">
                                    {les.titleZh}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="text-xs text-[#8F6D3B]">{les.titlePy}</div>
                                    <div className="text-xs font-medium text-[#315E48]">{les.titleVi}</div>
                                  </td>
                                  <td className="py-3 px-4 text-[11px] text-[#8F6D3B]">
                                    {les.stats.vocabCount} từ vựng · {les.stats.grammarCount} điểm ngữ pháp
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <button className="px-3 py-1 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#183629]">
                                      Xem chi tiết
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}

            {/* =============================================================== */}
            {/* 2. THEO CHỦ ĐỀ BRANCH FLOW (9 CHỦ ĐỀ LỚN & 72 CHỦ ĐỀ CON) */}
            {/* =============================================================== */}
            {activeTrack === "topic" && (
              <>
                {/* 2.1 9 MAJOR TOPICS GRID */}
                {topicScreen === "MAJOR_TOPICS" && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#204434]">
                        9 Chủ đề Giao tiếp Tiêu chuẩn HSK 3.0 & Ứng dụng thực tế
                      </h3>
                      <p className="text-xs text-[#315E48]">
                        Hệ thống gồm 72 chủ đề con chuyên sâu. Chọn chủ đề lớn để khám phá các nhóm tình huống.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {OFFICIAL_9_TOPICS.map((top) => (
                        <div
                          key={top.id}
                          onClick={() => {
                            setTopicSelectedMajorId(top.id);
                            setTopicSelectedSubtopicId(top.subtopics[0].id);
                            setTopicScreen("SUBTOPICS");
                          }}
                          className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] hover:border-[#204434] cursor-pointer shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-3xl">{top.icon}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#BC9B6B]/20 text-[#8F6D3B]">
                                Chủ đề {top.orderNumber}
                              </span>
                            </div>
                            <h4 className="font-serif font-bold text-base text-[#204434]">
                              {top.title}
                            </h4>
                            <p className="text-xs text-[#315E48] leading-relaxed">{top.desc}</p>
                            <div className="p-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9]/80 text-[11px] text-[#8F6D3B]">
                              <strong>Trọng tâm:</strong> {top.priorityFocus}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#8F6D3B]">
                              {top.subtopics.length} chủ đề con
                            </span>
                            <span className="text-xs font-bold text-[#204434] flex items-center gap-1">
                              Khám phá →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2.2 SUBTOPICS GRID FOR SELECTED MAJOR TOPIC */}
                {topicScreen === "SUBTOPICS" && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setTopicScreen("MAJOR_TOPICS")}
                            className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] flex items-center gap-1 transition"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>9 chủ đề lớn</span>
                          </button>
                          <span className="text-xl">{currentMajorTopic.icon}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#204434] text-white">
                            Chủ đề {currentMajorTopic.orderNumber}
                          </span>
                        </div>
                        <h2 className="font-serif font-bold text-xl text-[#204434]">
                          {currentMajorTopic.title}
                        </h2>
                        <p className="text-xs text-[#315E48]">
                          {currentMajorTopic.priorityFocus}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {currentMajorTopic.subtopics.map((sub, idx) => (
                        <div
                          key={sub.id}
                          onClick={() => {
                            setTopicSelectedSubtopicId(sub.id);
                            setTopicScreen("LESSONS_LIST");
                          }}
                          className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] hover:border-[#204434] cursor-pointer shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-[#8F6D3B]">
                              Mục {currentMajorTopic.orderNumber}.{idx + 1}
                            </span>
                            <h4 className="font-serif font-bold text-sm text-[#204434]">
                              {sub.title}
                            </h4>
                            <p className="text-[11px] text-[#315E48]">
                              Gồm {sub.totalLessons} bài học phân theo cấp độ
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#204434]">Xem danh sách bài</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#204434]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2.3 SUBTOPIC LESSONS LIST SCREEN */}
                {topicScreen === "LESSONS_LIST" && (
                  <div className="space-y-5 animate-fade-in">
                    {/* Header Banner */}
                    <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setTopicScreen("SUBTOPICS")}
                            className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] flex items-center gap-1 transition"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Đổi chủ đề con</span>
                          </button>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#BC9B6B] text-white">
                            {currentMajorTopic.title}
                          </span>
                        </div>
                        <h2 className="font-serif font-bold text-xl text-[#204434]">
                          {currentSubtopic?.title}
                        </h2>
                        <p className="text-xs text-[#315E48]">
                          Danh sách bài học giao tiếp tình huống thực tế kèm mục Văn hóa giao tiếp
                        </p>
                      </div>

                      {/* Filter by Difficulty & Search */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 bg-white border border-[#E5DEC9] p-1 rounded-xl text-xs font-bold">
                          {[
                            { id: "ALL", label: "Tất cả" },
                            { id: "BEGINNER", label: "Sơ cấp" },
                            { id: "INTERMEDIATE", label: "Trung cấp" },
                            { id: "ADVANCED", label: "Nâng cao" },
                          ].map((df) => (
                            <button
                              key={df.id}
                              onClick={() => setTopicDifficultyFilter(df.id as any)}
                              className={`px-2.5 py-1 rounded-lg transition ${
                                topicDifficultyFilter === df.id
                                  ? "bg-[#204434] text-white"
                                  : "text-[#204434] hover:bg-[#FAF7F0]"
                              }`}
                            >
                              {df.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Lessons Grid */}
                    {(() => {
                      const rawLessons = SUBTOPIC_LESSONS_MAP[topicSelectedSubtopicId] || [
                        {
                          id: "top-sub-demo-1",
                          titleZh: "今天我休息",
                          titlePy: "Jīntiān wǒ xiūxi",
                          titleVi: "Hôm nay tôi nghỉ ngơi",
                          levelId: "top-1-life",
                          levelLabel: "Theo chủ đề",
                          categoryLabel: currentSubtopic?.title,
                          trackId: "topic" as const,
                          orderNumber: 1,
                          topicDifficulty: "BEGINNER" as TopicDifficultyLevel,
                          thumbnailArt: "lesson5" as const,
                          stats: {
                            vocabCount: 12,
                            grammarCount: 2,
                            dialogueCount: 1,
                            readingCount: 1,
                            listeningCount: 1,
                          },
                        },
                      ];

                      const filteredLessons = rawLessons.filter((l) => {
                        if (topicDifficultyFilter !== "ALL" && l.topicDifficulty !== topicDifficultyFilter) {
                          return false;
                        }
                        if (topicSearchFilter.trim()) {
                          const q = topicSearchFilter.toLowerCase();
                          return (
                            l.titleZh.toLowerCase().includes(q) ||
                            l.titleVi.toLowerCase().includes(q) ||
                            l.titlePy.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      });

                      if (filteredLessons.length === 0) {
                        return (
                          <div className="p-12 text-center rounded-3xl bg-[#FFFCF6] border border-dashed border-[#E5DEC9]">
                            <p className="text-sm font-bold text-[#204434]">Không có bài học trong cấp độ lọc này</p>
                            <p className="text-xs text-[#315E48] mt-1">Chọn lại "Tất cả" để xem danh sách bài học.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredLessons.map((les) => (
                            <div
                              key={les.id}
                              onClick={() => {
                                setTopicSelectedLessonId(les.id);
                                setTopicScreen("LESSON_DETAIL");
                              }}
                              className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] hover:border-[#204434] cursor-pointer shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#204434]/10 text-[#204434]">
                                    Bài {les.orderNumber}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#BC9B6B]/20 text-[#8F6D3B]">
                                    {les.topicDifficulty === "BEGINNER" ? "Sơ cấp" : les.topicDifficulty === "INTERMEDIATE" ? "Trung cấp" : "Nâng cao"}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-serif font-bold text-lg text-[#204434]">
                                    {les.titleZh}
                                  </h4>
                                  <p className="text-xs text-[#8F6D3B] italic">{les.titlePy}</p>
                                  <p className="text-xs text-[#315E48] font-medium mt-1">{les.titleVi}</p>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                                <span className="text-[11px] text-[#8F6D3B]">
                                  🏮 Có mục Văn hóa giao tiếp
                                </span>
                                <span className="text-xs font-bold text-[#204434]">
                                  Xem chi tiết →
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}

            {/* =============================================================== */}
            {/* 3. ĐẠI HỌC & NGÀNH BRANCH FLOW (12 VIỆN/KHOA · ĐH TRỊNH CHÂU) */}
            {/* =============================================================== */}
            {activeTrack === "major" && (
              <>
                {/* 3.1 12 FACULTIES SCREEN */}
                {majorScreen === "FACULTIES" && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#204434]">
                        Hệ thống Đào tạo Học thuật Đại học Trịnh Châu (郑州大学) - 12 Viện/Khoa
                      </h3>
                      <p className="text-xs text-[#315E48]">
                        Khám phá bài giảng chuyên ngành đại học từ thuật ngữ chuyên ngành đến lý luận học thuật.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {OFFICIAL_12_FACULTIES.map((fac) => (
                        <div
                          key={fac.id}
                          onClick={() => {
                            setMajorSelectedFacultyId(fac.id);
                            setMajorSelectedMajorId(fac.majors[0]?.id || "maj-ba");
                            setMajorScreen("MAJORS");
                          }}
                          className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] hover:border-[#204434] cursor-pointer shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl">{fac.icon}</span>
                              <span className="text-[11px] font-bold text-[#8F6D3B]">
                                {fac.majors.length} ngành
                              </span>
                            </div>
                            <h4 className="font-serif font-bold text-base text-[#204434]">
                              {fac.nameZh}
                            </h4>
                            <p className="text-xs font-semibold text-[#8F6D3B]">{fac.nameVi}</p>
                            <p className="text-xs text-[#315E48] leading-relaxed line-clamp-2">{fac.desc}</p>
                          </div>

                          <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#204434]">Xem các ngành →</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#204434]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3.2 MAJORS SCREEN */}
                {majorScreen === "MAJORS" && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setMajorScreen("FACULTIES")}
                            className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] flex items-center gap-1 transition"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>12 Viện/Khoa</span>
                          </button>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#204434] text-white">
                            {currentFaculty.nameZh}
                          </span>
                        </div>
                        <h2 className="font-serif font-bold text-xl text-[#204434]">
                          {currentFaculty.nameZh} ({currentFaculty.nameVi})
                        </h2>
                        <p className="text-xs text-[#315E48]">
                          {currentFaculty.desc}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {currentFaculty.majors.map((maj) => (
                        <div
                          key={maj.id}
                          onClick={() => {
                            setMajorSelectedMajorId(maj.id);
                            setMajorSelectedCourseId(maj.courses[0]?.id || "crs-poliecon");
                            setMajorScreen("COURSES");
                          }}
                          className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] hover:border-[#204434] cursor-pointer shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <h4 className="font-serif font-bold text-base text-[#204434]">
                              {maj.nameZh}
                            </h4>
                            <p className="text-xs font-semibold text-[#8F6D3B]">{maj.nameVi}</p>
                          </div>

                          <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                            <span className="text-[11px] text-[#8F6D3B]">
                              📚 {maj.courses.length} môn học đào tạo
                            </span>
                            <span className="text-xs font-bold text-[#204434]">Xem môn học →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3.3 COURSES SCREEN */}
                {majorScreen === "COURSES" && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setMajorScreen("MAJORS")}
                            className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] flex items-center gap-1 transition"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Đổi ngành đào tạo</span>
                          </button>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#204434] text-white">
                            {currentMajor?.nameZh}
                          </span>
                        </div>
                        <h2 className="font-serif font-bold text-xl text-[#204434]">
                          {currentMajor?.nameZh} ({currentMajor?.nameVi})
                        </h2>
                        <p className="text-xs text-[#315E48]">Danh sách môn học chuyên sâu thuộc chương trình đại học</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {currentMajor?.courses.map((crs) => (
                        <div
                          key={crs.id}
                          onClick={() => {
                            setMajorSelectedCourseId(crs.id);
                            setMajorSelectedChapterId(crs.chapters[1]?.id || crs.chapters[0]?.id);
                            setMajorScreen("CHAPTERS");
                          }}
                          className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] hover:border-[#204434] cursor-pointer shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <h4 className="font-serif font-bold text-base text-[#204434]">
                              {crs.titleZh}
                            </h4>
                            <p className="text-xs font-semibold text-[#8F6D3B]">{crs.titleVi}</p>
                          </div>

                          <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                            <span className="text-[11px] text-[#8F6D3B]">
                              📖 {crs.chapters.length} chương bài giảng
                            </span>
                            <span className="text-xs font-bold text-[#204434]">Xem các chương →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3.4 CHAPTERS SCREEN */}
                {majorScreen === "CHAPTERS" && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setMajorScreen("COURSES")}
                            className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] flex items-center gap-1 transition"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Đổi môn học</span>
                          </button>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#204434] text-white">
                            {currentCourse?.titleZh}
                          </span>
                        </div>
                        <h2 className="font-serif font-bold text-xl text-[#204434]">
                          {currentCourse?.titleZh} ({currentCourse?.titleVi})
                        </h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {currentCourse?.chapters.map((ch) => (
                        <div
                          key={ch.id}
                          onClick={() => {
                            setMajorSelectedChapterId(ch.id);
                            setMajorScreen("LESSONS_LIST");
                          }}
                          className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] hover:border-[#204434] cursor-pointer shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <h4 className="font-serif font-bold text-base text-[#204434]">
                              {ch.titleZh}
                            </h4>
                            <p className="text-xs font-semibold text-[#8F6D3B]">{ch.titleVi}</p>
                          </div>

                          <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                            <span className="text-[11px] text-[#8F6D3B]">
                              📄 {ch.lessons.length} tiết / bài học
                            </span>
                            <span className="text-xs font-bold text-[#204434]">Xem các tiết →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3.5 CHAPTER LESSONS LIST SCREEN */}
                {majorScreen === "LESSONS_LIST" && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setMajorScreen("CHAPTERS")}
                            className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] flex items-center gap-1 transition"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Đổi chương</span>
                          </button>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#BC9B6B] text-white">
                            {currentCourse?.titleZh}
                          </span>
                        </div>
                        <h2 className="font-serif font-bold text-xl text-[#204434]">
                          {currentChapter?.titleZh} ({currentChapter?.titleVi})
                        </h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentChapter?.lessons.map((les) => (
                        <div
                          key={les.id}
                          onClick={() => {
                            setMajorSelectedLessonId(les.id);
                            setMajorScreen("LESSON_DETAIL");
                          }}
                          className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] hover:border-[#204434] cursor-pointer shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#204434]/10 text-[#204434]">
                                Tiết {les.orderNumber}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#BC9B6B]/20 text-[#8F6D3B]">
                                Học thuật chuyên ngành
                              </span>
                            </div>
                            <h4 className="font-serif font-bold text-lg text-[#204434]">
                              {les.titleZh}
                            </h4>
                            <p className="text-xs text-[#8F6D3B] italic">{les.titlePy}</p>
                            <p className="text-xs text-[#315E48] font-medium">{les.titleVi}</p>
                          </div>

                          <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                            <span className="text-[11px] text-[#8F6D3B]">
                              📊 Thuật ngữ · Lý thuyết · Bảng ma trận
                            </span>
                            <span className="text-xs font-bold text-[#204434]">
                              Xem chi tiết học phần →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* =============================================================== */}
            {/* 4. LESSON DETAIL VIEW (When in LESSON_DETAIL screen) */}
            {/* =============================================================== */}
            {((activeTrack === "hsk" && hskScreen === "LESSON_DETAIL") ||
              (activeTrack === "topic" && topicScreen === "LESSON_DETAIL") ||
              (activeTrack === "major" && majorScreen === "LESSON_DETAIL")) && (
              <div className="space-y-6 animate-fade-in">
                {/* Back button row */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (activeTrack === "hsk") setHskScreen("LESSONS_LIST");
                      if (activeTrack === "topic") setTopicScreen("LESSONS_LIST");
                      if (activeTrack === "major") setMajorScreen("LESSONS_LIST");
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-[#E5DEC9] bg-[#FFFCF6] hover:bg-[#F3EEDD] text-[#204434] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>
                      {activeTrack === "hsk" && `Quay lại danh sách bài ${currentLesson.levelLabel}`}
                      {activeTrack === "topic" && `Quay lại danh sách bài ${currentSubtopic?.title || "chủ đề con"}`}
                      {activeTrack === "major" && `Quay lại ${currentChapter?.titleZh || "danh sách chương"}`}
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const isSaved = savedHanyuLessons.some((l) => l.lessonId === currentLesson.id);
                        if (isSaved) {
                          setSavedHanyuLessons((prev) => prev.filter((l) => l.lessonId !== currentLesson.id));
                          showToast(`Đã bỏ lưu bài học "${currentLesson.titleVi}"`);
                        } else {
                          const newSaved: SavedHanyuLesson = {
                            id: "saved-" + Date.now(),
                            lessonId: currentLesson.id,
                            titleZh: currentLesson.titleZh,
                            titleVi: currentLesson.titleVi,
                            trackId: currentLesson.trackId,
                            levelLabel: currentLesson.levelLabel,
                            savedAt: new Date().toISOString().split("T")[0],
                            readOnly: true,
                          };
                          setSavedHanyuLessons((prev) => [newSaved, ...prev]);
                          showToast(`Đã lưu bài học "${currentLesson.titleVi}" vào Thư viện của tôi!`);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#E5DEC9] bg-[#FFFCF6] hover:bg-[#F3EEDD] text-[#8F6D3B] text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>
                        {savedHanyuLessons.some((l) => l.lessonId === currentLesson.id)
                          ? "Đã lưu vào thư viện"
                          : "Lưu vào thư viện"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* HERO PANORAMIC ARTWORK BANNER (Pure SVG/CSS) */}
                <div className="relative rounded-3xl overflow-hidden border border-[#E5DEC9] shadow-sm min-h-[200px] flex items-center bg-[#F4EFE6]">
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    <LessonHeroBannerSvg />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#183428]/90 via-[#183428]/70 to-transparent pointer-events-none" />

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

                    <p className="text-xs text-white/85 leading-relaxed pt-1">
                      {currentLesson.description}
                    </p>
                  </div>
                </div>

                {/* MAIN DETAIL GRID: 2 COLUMNS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* LEFT COLUMN: 5 SECTIONS / ACADEMIC MODULES */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* A. SPECIAL UNIVERSITY ACADEMIC MODULE */}
                    {currentLesson.academicContent ? (
                      <div className="space-y-6">
                        {/* 1. Academic Terms */}
                        <div className="rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] shadow-2xs overflow-hidden">
                          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#E5DEC9]/80 bg-[#FAF7F0]">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold text-xs">
                                01
                              </span>
                              <div>
                                <h3 className="font-serif font-bold text-base text-[#204434]">
                                  Thuật ngữ chuyên ngành cốt lõi (专业术语)
                                </h3>
                                <p className="text-[11px] text-[#315E48]">
                                  Khái niệm nền tảng trong học phần Kinh tế Chính trị
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {currentLesson.academicContent.terms.map((t, idx) => (
                              <div
                                key={idx}
                                className="p-3.5 rounded-2xl border border-[#E5DEC9] bg-white hover:border-[#204434] transition space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-serif font-bold text-base text-[#204434]">
                                      {t.zh}
                                    </h4>
                                    <span className="text-[11px] text-[#8F6D3B] italic">{t.py}</span>
                                  </div>
                                  <button
                                    onClick={() => speakChinese(t.zh)}
                                    className="p-1.5 rounded-lg border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#204434]"
                                    title="Nghe phát âm"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="pt-1 border-t border-[#E5DEC9]/60">
                                  <p className="text-xs font-bold text-[#204434]">{t.vi}</p>
                                  <p className="text-[11px] text-[#315E48] mt-1 italic">{t.definition}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2. Core Theory */}
                        <div className="rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] shadow-2xs overflow-hidden">
                          <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-[#E5DEC9]/80 bg-[#FAF7F0]">
                            <span className="w-8 h-8 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold text-xs">
                              02
                            </span>
                            <div>
                              <h3 className="font-serif font-bold text-base text-[#204434]">
                                Lý thuyết cốt lõi (核心理论)
                              </h3>
                              <p className="text-[11px] text-[#315E48]">
                                {currentLesson.academicContent.theoryTitle}
                              </p>
                            </div>
                          </div>

                          <div className="p-5 space-y-4 text-xs leading-relaxed text-[#204434]">
                            <p className="whitespace-pre-line bg-white p-4 rounded-2xl border border-[#E5DEC9]">
                              {currentLesson.academicContent.theoryContent}
                            </p>
                          </div>
                        </div>

                        {/* 3. Comparison Matrix */}
                        {currentLesson.academicContent.tableOrFormula && (
                          <div className="rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] shadow-2xs overflow-hidden">
                            <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-[#E5DEC9]/80 bg-[#FAF7F0]">
                              <span className="w-8 h-8 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold text-xs">
                                03
                              </span>
                              <div>
                                <h3 className="font-serif font-bold text-base text-[#204434]">
                                  {currentLesson.academicContent.tableOrFormula.title}
                                </h3>
                                <p className="text-[11px] text-[#315E48]">Bảng ma trận đối chiếu học thuật</p>
                              </div>
                            </div>

                            <div className="p-4 overflow-x-auto">
                              <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-[#E5DEC9] bg-[#FAF7F0] text-[#315E48] font-bold">
                                    {currentLesson.academicContent.tableOrFormula.headers.map((h, i) => (
                                      <th key={i} className="py-2.5 px-3">
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5DEC9]/50">
                                  {currentLesson.academicContent.tableOrFormula.rows.map((rowCells, i) => (
                                    <tr key={i} className="hover:bg-[#FAF7F0]/60">
                                      {rowCells.map((cell, cIdx) => (
                                        <td
                                          key={cIdx}
                                          className={`py-2.5 px-3 ${cIdx === 0 ? "font-bold text-[#204434]" : "text-[#315E48]"}`}
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 4. Practical Case */}
                        {currentLesson.academicContent.practicalCase && (
                          <div className="rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] shadow-2xs overflow-hidden">
                            <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-[#E5DEC9]/80 bg-[#FAF7F0]">
                              <span className="w-8 h-8 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold text-xs">
                                04
                              </span>
                              <div>
                                <h3 className="font-serif font-bold text-base text-[#204434]">
                                  Tình huống & Ứng dụng thực tế (实际案例分析)
                                </h3>
                                <p className="text-[11px] text-[#315E48]">
                                  {currentLesson.academicContent.practicalCase.title}
                                </p>
                              </div>
                            </div>

                            <div className="p-5 space-y-3 text-xs leading-relaxed">
                              <p className="text-[#204434] bg-white p-4 rounded-2xl border border-[#E5DEC9]">
                                {currentLesson.academicContent.practicalCase.scenario}
                              </p>
                              <div className="p-3.5 rounded-2xl bg-[#204434]/10 border border-[#204434]/20 text-[#204434]">
                                <strong>Phân tích lý luận:</strong>{" "}
                                {currentLesson.academicContent.practicalCase.analysis}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 5. Academic Language Note */}
                        {currentLesson.academicContent.academicLanguageNote && (
                          <div className="rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] shadow-2xs overflow-hidden">
                            <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-[#E5DEC9]/80 bg-[#FAF7F0]">
                              <span className="w-8 h-8 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold text-xs">
                                05
                              </span>
                              <div>
                                <h3 className="font-serif font-bold text-base text-[#204434]">
                                  Ngôn ngữ học thuật & Cách diễn đạt chuyên ngành (学术表达与写作)
                                </h3>
                                <p className="text-[11px] text-[#315E48]">Lưu ý về văn phong và thuật ngữ học thuật</p>
                              </div>
                            </div>

                            <div className="p-4 sm:p-5">
                              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] text-xs text-[#204434] leading-relaxed">
                                {currentLesson.academicContent.academicLanguageNote}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* B. STANDARD 5 SECTIONS FOR HSK & THEO CHỦ ĐỀ */
                      <div className="space-y-6">
                        {/* SECTION 1: TỪ VỰNG TRỌNG ĐIỂM */}
                        <div className="rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] shadow-2xs overflow-hidden">
                          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#E5DEC9]/80 bg-[#FAF7F0]">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold text-xs">
                                01
                              </span>
                              <div>
                                <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                                  <span>Từ vựng trọng điểm</span>
                                  <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-[#204434]/10 text-[#204434]">
                                    {selectedVocabIds.length}/{currentLesson.vocabularies.length} đã chọn
                                  </span>
                                </h3>
                                <p className="text-[11px] text-[#315E48]">
                                  Bấm vào từ vựng để chọn vào bài học tùy chỉnh hoặc bài tập
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
                            <div className="p-4 sm:p-5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {currentLesson.vocabularies.map((v) => {
                                  const isSelected = selectedVocabIds.includes(v.id);
                                  return (
                                    <div
                                      key={v.id}
                                      onClick={() => toggleVocab(v.id)}
                                      className={`p-3.5 rounded-2xl border transition cursor-pointer select-none space-y-2 ${
                                        isSelected
                                          ? "bg-[#F3EEDD]/60 border-[#204434] shadow-xs"
                                          : "bg-[#FFFCF6] border-[#E5DEC9] hover:border-[#BC9B6B]"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                          <div
                                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                                              isSelected
                                                ? "bg-[#204434] border-[#204434] text-white"
                                                : "border-[#BC9B6B] bg-white"
                                            }`}
                                          >
                                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                          </div>
                                          <div>
                                            <span className="font-serif font-bold text-lg text-[#204434]">
                                              {v.hanzi}
                                            </span>
                                            <span className="text-xs text-[#8F6D3B] ml-2 italic">
                                              {v.pinyin}
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

                        {/* SECTION 2: ĐIỂM NGỮ PHÁP */}
                        <div className="rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] shadow-2xs overflow-hidden">
                          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#E5DEC9]/80 bg-[#FAF7F0]">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold text-xs">
                                02
                              </span>
                              <div>
                                <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                                  <span>Điểm ngữ pháp</span>
                                  <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B]">
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

                        {/* SECTION 3: HỘI THOẠI THỰC TẾ */}
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

                            <div className="p-5 space-y-4">
                              {/* Audio Player Bar */}
                              <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => setIsPlayingDialogueAudio(!isPlayingDialogueAudio)}
                                    className="w-8 h-8 rounded-full bg-[#204434] text-white flex items-center justify-center shadow-2xs hover:bg-[#183629]"
                                  >
                                    {isPlayingDialogueAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                  </button>
                                  <span className="text-xs font-bold text-[#204434]">Phát âm thanh hội thoại chuẩn</span>
                                </div>
                                <span className="text-[11px] text-[#8F6D3B]">Thời lượng: {currentLesson.dialogue.audioDuration}</span>
                              </div>

                              {/* Dialogue lines */}
                              <div className="space-y-3">
                                {currentLesson.dialogue.lines.map((line, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                                      line.speaker === "A"
                                        ? "bg-white border-[#E5DEC9]"
                                        : "bg-[#FAF7F0]/60 border-[#BC9B6B]/40"
                                    }`}
                                  >
                                    <span className="w-6 h-6 rounded-full bg-[#204434] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                      {line.speaker}
                                    </span>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <p className="font-serif font-bold text-base text-[#204434]">{line.zh}</p>
                                        <button
                                          onClick={() => speakChinese(line.zh)}
                                          className="p-1 rounded text-gray-400 hover:text-[#204434]"
                                        >
                                          <Volume2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                      <p className="text-xs text-[#8F6D3B] italic">{line.py}</p>
                                      <p className="text-xs text-[#315E48]">{line.vi}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SECTION 4: LUYỆN ĐỌC HIỂU */}
                        {currentLesson.reading && (
                          <div className="rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] shadow-2xs overflow-hidden">
                            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#E5DEC9]/80 bg-[#FAF7F0]">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold text-xs">
                                  04
                                </span>
                                <div>
                                  <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                                    <span>Luyện đọc hiểu & Ngữ cảnh</span>
                                  </h3>
                                  <p className="text-[11px] text-[#315E48]">
                                    Đoạn văn ngắn củng cố từ vựng và cấu trúc đã học
                                  </p>
                                </div>
                              </div>
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
                            </div>

                            <div className="p-5 space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-serif font-bold text-base text-[#204434]">
                                  {currentLesson.reading.titleZh} ({currentLesson.reading.titleVi})
                                </h4>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setShowPinyinInReading(!showPinyinInReading)}
                                    className="text-[11px] px-2.5 py-1 rounded-lg border border-[#E5DEC9] bg-white font-semibold text-[#8F6D3B]"
                                  >
                                    {showPinyinInReading ? "Ẩn Pinyin" : "Hiện Pinyin"}
                                  </button>
                                  <button
                                    onClick={() => setShowViInReading(!showViInReading)}
                                    className="text-[11px] px-2.5 py-1 rounded-lg border border-[#E5DEC9] bg-white font-semibold text-[#315E48]"
                                  >
                                    {showViInReading ? "Ẩn bản dịch" : "Hiện bản dịch"}
                                  </button>
                                </div>
                              </div>

                              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-2">
                                <p className="font-serif text-base text-[#204434] leading-relaxed">
                                  {currentLesson.reading.contentZh}
                                </p>
                                {showPinyinInReading && (
                                  <p className="text-xs text-[#8F6D3B] italic leading-relaxed pt-1 border-t border-[#E5DEC9]/40">
                                    {currentLesson.reading.contentPy}
                                  </p>
                                )}
                                {showViInReading && (
                                  <p className="text-xs text-[#315E48] leading-relaxed pt-1 border-t border-[#E5DEC9]/40">
                                    {currentLesson.reading.contentVi}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SECTION 5: VĂN HÓA GIAO TIẾP & CÁCH SỬ DỤNG THỰC TẾ (ĐẶC TẢ HOÀN CHỈNH) */}
                        {currentLesson.culturalNote && (
                          <div className="rounded-3xl border border-[#BC9B6B]/60 bg-[#FFFCF6] shadow-2xs overflow-hidden">
                            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#BC9B6B]/40 bg-gradient-to-r from-[#FAF7F0] to-[#F5EEDB]">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#BC9B6B] to-[#8F6D3B] text-white flex items-center justify-center font-bold text-base shadow-2xs">
                                  🏮
                                </span>
                                <div>
                                  <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                                    <span>Phần 5: Văn hóa giao tiếp & Cách sử dụng thực tế</span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] border border-[#BC9B6B]/30">
                                      Tiêu chuẩn giao tiếp
                                    </span>
                                  </h3>
                                  <p className="text-[11px] text-[#315E48]">
                                    Ứng dụng ngôn ngữ tự nhiên, phép lịch sự và tránh cấm kỵ văn hóa
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="p-5 space-y-4 text-xs">
                              {/* 1. Bối cảnh & Đối tượng */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] space-y-1">
                                  <span className="text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wide">
                                    🏛️ Bối cảnh sử dụng
                                  </span>
                                  <p className="text-[#204434] leading-relaxed">
                                    {currentLesson.culturalNote.context}
                                  </p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] space-y-1">
                                  <span className="text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wide">
                                    👥 Đối tượng phù hợp
                                  </span>
                                  <p className="text-[#204434] leading-relaxed">
                                    {currentLesson.culturalNote.targetAudience}
                                  </p>
                                </div>
                              </div>

                              {/* 2. Mẫu câu nên dùng */}
                              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] space-y-2">
                                <span className="text-[10px] font-bold text-[#204434] uppercase tracking-wide">
                                  ✨ Mẫu câu vàng khuyên dùng
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {currentLesson.culturalNote.naturalExpressions.map((phrase, i) => (
                                    <div
                                      key={i}
                                      className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9]/80 flex items-center justify-between"
                                    >
                                      <div>
                                        <span className="font-serif font-bold text-sm text-[#204434]">
                                          {phrase.zh}
                                        </span>
                                        <p className="text-[10px] text-[#8F6D3B]">{phrase.py}</p>
                                        <p className="text-[10px] text-[#315E48]">{phrase.vi}</p>
                                      </div>
                                      <button
                                        onClick={() => speakChinese(phrase.zh)}
                                        className="p-1 text-gray-400 hover:text-[#204434]"
                                        title="Phát âm mẫu câu"
                                      >
                                        <Volume2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 3. Cách nói lịch sự & Lưu ý cấm kỵ */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="p-3.5 rounded-2xl bg-[#204434]/5 border border-[#204434]/20 space-y-1.5">
                                  <span className="text-[10px] font-bold text-[#204434] uppercase tracking-wide">
                                    🤝 Cách nói lịch sự & Tôn trọng
                                  </span>
                                  <div className="space-y-1">
                                    {currentLesson.culturalNote.politeExpressions.map((pe, idx) => (
                                      <div key={idx} className="text-[#204434]">
                                        <span className="font-serif font-bold">{pe.zh}</span> ({pe.py}) - {pe.vi}
                                        {pe.note && <span className="text-[10px] text-[#8F6D3B] block italic">{pe.note}</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200 space-y-1.5">
                                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide">
                                    ⚠️ Lưu ý & Cấm kỵ văn hóa
                                  </span>
                                  <ul className="list-disc pl-4 space-y-1 text-red-900">
                                    {currentLesson.culturalNote.cautionNotes.map((note, idx) => (
                                      <li key={idx}>{note}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* 4. Tình huống thực tế */}
                              <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-1.5">
                                <span className="text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wide">
                                  📍 Tình huống áp dụng thực tế
                                </span>
                                <p className="text-[#204434] leading-relaxed">
                                  {currentLesson.culturalNote.practiceScenario}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
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

                      {/* Counters */}
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
                          <span className="text-[#315E48]">Đọc hiểu:</span>
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
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: THƯ VIỆN CỦA TÔI */}
        {/* =================================================================== */}
        {mainTab === "MY_LIBRARY" && (
          <div className="space-y-6 animate-fade-in">
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
                    Bạn chưa lưu bài học nào từ kho Admin. Hãy vào tab "Khám phá bài học" và bấm "Lưu vào thư viện".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedHanyuLessons.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-3 hover:border-[#204434] transition flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#204434]/10 text-[#204434]">
                              {item.levelLabel}
                            </span>
                            <span className="text-[10px] text-[#315E48]">Lưu ngày: {item.savedAt}</span>
                          </div>
                          <h4 className="font-serif font-bold text-base text-[#204434]">
                            {item.titleZh}
                          </h4>
                          <p className="text-xs text-[#8F6D3B] font-medium">{item.titleVi}</p>
                          <div className="flex items-center gap-3 text-xs text-[#315E48] pt-1">
                            <span className="text-[10px] bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-[#E5DEC9]">
                              {item.trackId === "hsk" ? "HSK 3.0" : item.trackId === "topic" ? "Theo chủ đề" : "Đại học"}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setActiveTrack(item.trackId);
                              if (item.trackId === "hsk") {
                                setHskSelectedLessonId(item.lessonId);
                                setHskScreen("LESSON_DETAIL");
                              } else if (item.trackId === "topic") {
                                setTopicSelectedLessonId(item.lessonId);
                                setTopicScreen("LESSON_DETAIL");
                              } else {
                                setMajorSelectedLessonId(item.lessonId);
                                setMajorScreen("LESSON_DETAIL");
                              }
                              setMainTab("EXPLORE");
                            }}
                            className="text-xs text-[#204434] font-bold hover:underline"
                          >
                            Mở bài học này →
                          </button>
                          <button
                            onClick={() => {
                              setSavedHanyuLessons((prev) => prev.filter((l) => l.id !== item.id));
                              showToast(`Đã xóa "${item.titleVi}" khỏi danh sách đã lưu`);
                            }}
                            className="text-xs text-red-600 hover:underline"
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
                    <span>Bài học tùy chỉnh của tôi (Giáo viên tự chọn lọc)</span>
                  </h3>
                  <span className="text-xs text-[#315E48]">Có thể chỉnh sửa và tạo bài tập</span>
                </div>

                {curatedLessons.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-[#FFFCF6] border border-dashed border-[#E5DEC9] text-center text-xs text-[#315E48]">
                    Bạn chưa tạo bài học tùy chỉnh nào. Khi xem bài học, hãy chọn các từ vựng/ngữ pháp và bấm "Lưu thành bài học tùy chỉnh".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {curatedLessons.map((cur) => (
                      <div
                        key={cur.id}
                        className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-2xs space-y-3 hover:border-[#204434] transition flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B]">
                            Tùy chỉnh · {cur.createdAt}
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

            {/* C. SECTION: TÀI LIỆU BÀI GIẢNG */}
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
                  placeholder="Ví dụ: Ôn tập từ vựng ngày nghỉ..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5DEC9] text-xs focus:outline-none focus:border-[#204434]"
                />
              </div>

              <div>
                <label className="font-bold text-[#204434] block mb-1">Ghi chú cho học viên:</label>
                <textarea
                  value={curatedNotes}
                  onChange={(e) => setCuratedNotes(e.target.value)}
                  placeholder="Ví dụ: Chú ý cách dùng trợ từ 'le'..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs focus:outline-none focus:border-[#204434]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1">
                <span className="font-bold text-[#8F6D3B] block">Nội dung sẽ được đóng gói:</span>
                <p className="text-[#315E48]">
                  • <strong>{selectedVocabIds.length}</strong> từ vựng đã chọn
                </p>
                <p className="text-[#315E48]">
                  • <strong>{selectedGrammarIds.length}</strong> điểm ngữ pháp đã chọn
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsCurateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0]"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCuratedLesson}
                className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#183629]"
              >
                Lưu vào thư viện
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
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#8F6D3B]" />
                <h3 className="font-serif font-bold text-base text-[#204434]">
                  Giao bài học cho lớp
                </h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#204434] block mb-1">Bài học:</label>
                <div className="p-3 rounded-xl bg-white border border-[#E5DEC9] font-serif font-bold text-sm text-[#204434]">
                  {currentLesson.titleZh} - {currentLesson.titleVi}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#204434] block mb-1">
                  Chọn lớp học: <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5DEC9] text-xs text-[#204434]"
                >
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.studentCount || 0} học viên)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#204434] block mb-1">
                  Hạn hoàn thành: <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs text-[#204434]"
                />
              </div>

              <div>
                <label className="font-bold text-[#204434] block mb-1">Lời nhắn của giáo viên:</label>
                <textarea
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  placeholder="Yêu cầu học viên học thuộc từ vựng và xem kỹ phần Hội thoại..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0]"
              >
                Hủy
              </button>
              <button
                onClick={handleAssignToClass}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#183629] flex items-center gap-1.5"
              >
                {isSubmitting && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác nhận giao bài</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: TẢI LÊN TÀI LIỆU BÀI GIẢNG */}
      {/* =================================================================== */}
      {isUploadMaterialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#8F6D3B]" />
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

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#204434] block mb-1">
                  Tên tài liệu: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMaterialTitle}
                  onChange={(e) => setNewMaterialTitle(e.target.value)}
                  placeholder="Ví dụ: Slide bài giảng HSK 1 - Bài 5..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5DEC9] text-xs focus:outline-none focus:border-[#204434]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#204434] block mb-1">Định dạng file:</label>
                  <select
                    value={newMaterialType}
                    onChange={(e) => setNewMaterialType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs"
                  >
                    <option value="PDF">PDF</option>
                    <option value="PPTX">PowerPoint (.pptx)</option>
                    <option value="DOCX">Word (.docx)</option>
                    <option value="IMAGE">Hình ảnh (.png, .jpg)</option>
                    <option value="AUDIO">Audio (.mp3)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">Phân loại cấp độ:</label>
                  <select
                    value={newMaterialClassification}
                    onChange={(e) => setNewMaterialClassification(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs"
                  >
                    <option value="HSK 1">HSK 1</option>
                    <option value="HSK 2">HSK 2</option>
                    <option value="HSK 3">HSK 3</option>
                    <option value="Giao tiếp">Giao tiếp</option>
                    <option value="Chuyên ngành">Chuyên ngành</option>
                  </select>
                </div>
              </div>

              <div className="p-5 border-2 border-dashed border-[#E5DEC9] rounded-2xl bg-[#FAF7F0] text-center space-y-2 cursor-pointer hover:border-[#204434] transition">
                <FileUp className="w-8 h-8 text-[#8F6D3B] mx-auto" />
                <p className="font-bold text-[#204434]">Kéo thả file tài liệu vào đây hoặc nhấp để chọn</p>
                <p className="text-[11px] text-[#315E48]">Hỗ trợ PDF, PPTX, DOCX, MP3, PNG tối đa 50MB</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsUploadMaterialModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0]"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!newMaterialTitle.trim()) {
                    showToast("Vui lòng nhập tên tài liệu");
                    return;
                  }
                  const newMat: LectureMaterialItem = {
                    id: "mat-" + Date.now(),
                    title: newMaterialTitle.trim(),
                    fileType: newMaterialType,
                    fileSize: "3.2 MB",
                    fileUrl: "#",
                    uploadedAt: new Date().toISOString().split("T")[0],
                    classification: newMaterialClassification,
                    sharedClassIds: [selectedClassId],
                    sharedClassNames: [classesList.find((c) => c.id === selectedClassId)?.name || "Lớp chọn"],
                    allowDownload: newMaterialAllowDownload,
                    status: "SHARED",
                  };
                  setLectureMaterials((prev) => [newMat, ...prev]);
                  setIsUploadMaterialModalOpen(false);
                  setNewMaterialTitle("");
                  showToast(`Đã tải lên tài liệu: "${newMat.title}"!`);
                }}
                className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#183629]"
              >
                Tải lên & Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
