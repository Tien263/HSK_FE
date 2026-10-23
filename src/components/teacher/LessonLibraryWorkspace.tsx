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
  Edit3,
  Plus,
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
  INITIAL_ASSIGNED_LESSONS,
  SavedHanyuLesson,
  CustomCuratedLesson,
  LectureMaterialItem,
  CulturalSelectionItem,
  AssignedLessonToClass,
  getCulturalSelectionItems,
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
    culturalList?: CulturalSelectionItem[];
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
  const [hskSelectedLessonId, setHskSelectedLessonId] = useState<string>("hsk1-b01");
  const [hskSearchFilter, setHskSearchFilter] = useState<string>("");
  const [hskViewMode, setHskViewMode] = useState<"grid" | "list">("grid");

  // Dynamic Lesson Overrides from Teacher Edits
  const [lessonOverrides, setLessonOverrides] = useState<Record<string, Partial<FullLessonDetail>>>({});

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("hanyu_teacher_lesson_overrides");
        if (saved) {
          setLessonOverrides(JSON.parse(saved));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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

  // Current lesson detail strictly loaded from current branch + any saved overrides
  const currentLesson: FullLessonDetail = useMemo(() => {
    const base = getLessonDetailById(currentActiveLessonId);
    const override = lessonOverrides[currentActiveLessonId] || lessonOverrides[base.id];
    if (override) {
      return { ...base, ...override };
    }
    return base;
  }, [currentActiveLessonId, lessonOverrides]);

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
  // TAB 2: THƯ VIỆN CỦA TÔI STATE & PERSISTENCE
  // =========================================================================
  const [librarySubTab, setLibrarySubTab] = useState<"ALL" | "SAVED_HANYU" | "CURATED" | "MATERIALS" | "ASSIGNED">("ALL");
  const [savedHanyuLessons, setSavedHanyuLessons] = useState<SavedHanyuLesson[]>(INITIAL_SAVED_HANYU_LESSONS);
  const [curatedLessons, setCuratedLessons] = useState<CustomCuratedLesson[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_curated_lessons");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_CURATED_LESSONS;
  });

  const [assignedLessons, setAssignedLessons] = useState<AssignedLessonToClass[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_assigned_lessons");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hanyu_curated_lessons", JSON.stringify(curatedLessons));
      } catch (e) {}
    }
  }, [curatedLessons]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hanyu_assigned_lessons", JSON.stringify(assignedLessons));
      } catch (e) {}
    }
  }, [assignedLessons]);

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
    "v-hsk1-1-1",
    "v-hsk1-1-2",
    "v-hsk1-1-3",
    "v-hsk1-1-4",
    "v-hsk1-1-5",
    "v-hsk1-1-6",
    "v-hsk1-1-7",
    "v-hsk1-1-8",
    "v-hsk1-1-9",
    "v-hsk1-1-10",
    "v-hsk1-1-11",
    "v-hsk1-1-12",
  ]);
  const [selectedGrammarIds, setSelectedGrammarIds] = useState<string[]>([
    "g-hsk1-1-1",
    "g-hsk1-1-2",
    "g-hsk1-1-3",
  ]);
  const [selectedCulturalIds, setSelectedCulturalIds] = useState<string[]>([
    "cult-hsk1-b01-phrase-0",
    "cult-hsk1-b01-phrase-1",
    "cult-hsk1-b01-polite-0",
    "cult-hsk1-b01-polite-1",
    "cult-hsk1-b01-polite-2",
    "cult-hsk1-b01-caution-0",
    "cult-hsk1-b01-caution-1",
    "cult-hsk1-b01-caution-2",
  ]);
  const [isDialogueSelected, setIsDialogueSelected] = useState<boolean>(true);
  const [isReadingSelected, setIsReadingSelected] = useState<boolean>(true);
  const [isListeningSelected, setIsListeningSelected] = useState<boolean>(false);
  const [isPreviewBasketModalOpen, setIsPreviewBasketModalOpen] = useState<boolean>(false);

  // Lesson Edit Modal State
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState<boolean>(false);
  const [editingLessonDraft, setEditingLessonDraft] = useState<FullLessonDetail | null>(null);
  const [editLessonActiveTab, setEditLessonActiveTab] = useState<"vocab" | "grammar" | "dialogue" | "reading" | "culture">("vocab");

  // Dialogue Display Controls
  const [showPinyinInDialogue, setShowPinyinInDialogue] = useState<boolean>(true);
  const [showViInDialogue, setShowViInDialogue] = useState<boolean>(true);

  // Target class for assignment
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classesList.length > 0 ? classesList[0].id : "c1"
  );
  const [assignSelectedClassIds, setAssignSelectedClassIds] = useState<string[]>(
    classesList.length > 0 ? [classesList[0].id] : ["c1"]
  );
  const [assignOpenDate, setAssignOpenDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [assignStep, setAssignStep] = useState<1 | 2>(1);

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
  const [isCulturalExpanded, setIsCulturalExpanded] = useState(true);

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

  // Sync selection IDs when current active lesson changes to ensure selections belong to this lesson
  useEffect(() => {
    if (currentLesson) {
      const vocabIds = currentLesson.vocabularies.map((v) => v.id);
      const grammarIds = currentLesson.grammars.map((g) => g.id);
      const cultIds = getCulturalSelectionItems(currentLesson).map((c) => c.id);
      setSelectedVocabIds(vocabIds);
      setSelectedGrammarIds(grammarIds);
      setSelectedCulturalIds(cultIds);
      setIsDialogueSelected(true);
      setIsReadingSelected(true);
    }
  }, [currentLesson.id]);

  const openEditLessonModal = () => {
    setEditingLessonDraft(JSON.parse(JSON.stringify(currentLesson)));
    setIsEditLessonModalOpen(true);
  };

  const handleSaveLessonDraft = () => {
    if (!editingLessonDraft) return;
    const updated = {
      ...lessonOverrides,
      [editingLessonDraft.id]: editingLessonDraft,
    };
    setLessonOverrides(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("hanyu_teacher_lesson_overrides", JSON.stringify(updated));
    }
    setIsEditLessonModalOpen(false);
    showToast(`Đã lưu thay đổi học liệu "${editingLessonDraft.titleVi}" vào hệ thống!`);
  };

  const handleResetLessonDraft = () => {
    if (!currentLesson) return;
    const updated = { ...lessonOverrides };
    delete updated[currentLesson.id];
    setLessonOverrides(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("hanyu_teacher_lesson_overrides", JSON.stringify(updated));
    }
    setIsEditLessonModalOpen(false);
    showToast(`Đã khôi phục học liệu gốc bài học!`);
  };

  // Sequential speech synthesis for full dialogue playback
  useEffect(() => {
    if (!isPlayingDialogueAudio) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (!currentLesson.dialogue?.lines || currentLesson.dialogue.lines.length === 0) {
      setIsPlayingDialogueAudio(false);
      return;
    }

    let currentIndex = 0;
    const lines = currentLesson.dialogue.lines;

    function playLine(index: number) {
      if (index >= lines.length) {
        setIsPlayingDialogueAudio(false);
        setActiveSpeakingText(null);
        return;
      }
      const line = lines[index];
      setActiveSpeakingText(line.zh);
      const utter = new SpeechSynthesisUtterance(line.zh);
      utter.lang = "zh-CN";
      utter.rate = 0.85;
      utter.onend = () => {
        setTimeout(() => playLine(index + 1), 600);
      };
      utter.onerror = () => {
        setIsPlayingDialogueAudio(false);
        setActiveSpeakingText(null);
      };
      window.speechSynthesis.speak(utter);
    }

    playLine(0);

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlayingDialogueAudio, currentLesson]);

  // Cultural items in current lesson
  const availableCulturalItems = useMemo(() => {
    return getCulturalSelectionItems(currentLesson);
  }, [currentLesson]);

  const selectedCulturalItems = useMemo(() => {
    return availableCulturalItems.filter((item) => selectedCulturalIds.includes(item.id));
  }, [availableCulturalItems, selectedCulturalIds]);

  const isAllCulturalSelected = useMemo(() => {
    if (availableCulturalItems.length === 0) return false;
    return availableCulturalItems.every((item) => selectedCulturalIds.includes(item.id));
  }, [availableCulturalItems, selectedCulturalIds]);

  const isSomeCulturalSelected = useMemo(() => {
    return availableCulturalItems.some((item) => selectedCulturalIds.includes(item.id));
  }, [availableCulturalItems, selectedCulturalIds]);

  const toggleCulturalItem = (id: string) => {
    setSelectedCulturalIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAllCultural = () => {
    const currentIds = availableCulturalItems.map((c) => c.id);
    if (isAllCulturalSelected) {
      setSelectedCulturalIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedCulturalIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const toggleCulturalSubgroup = (type: "PHRASE" | "POLITE" | "CAUTION") => {
    const groupItems = availableCulturalItems.filter((c) => c.type === type);
    const groupIds = groupItems.map((c) => c.id);
    const isAllGroupSelected = groupIds.length > 0 && groupIds.every((id) => selectedCulturalIds.includes(id));
    if (isAllGroupSelected) {
      setSelectedCulturalIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedCulturalIds((prev) => Array.from(new Set([...prev, ...groupIds])));
    }
  };

  // Selection basket totals
  const totalSelectedCount = useMemo(() => {
    return (
      selectedVocabIds.length +
      selectedGrammarIds.length +
      (isDialogueSelected ? 1 : 0) +
      (isReadingSelected ? 1 : 0) +
      (isListeningSelected ? 1 : 0) +
      selectedCulturalIds.length
    );
  }, [selectedVocabIds, selectedGrammarIds, isDialogueSelected, isReadingSelected, isListeningSelected, selectedCulturalIds]);

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
    const chosenCultural = availableCulturalItems.filter((c) =>
      selectedCulturalIds.includes(c.id)
    );

    const newCurated: CustomCuratedLesson = {
      id: "curated-" + Date.now(),
      title: curatedTitle.trim(),
      sourceLessonId: currentLesson.id,
      sourceLessonTitle: currentLesson.titleVi,
      selectedVocabCount: chosenVocabs.length,
      selectedGrammarCount: chosenGrammars.length,
      selectedCulturalCount: chosenCultural.length,
      vocabs: chosenVocabs,
      grammars: chosenGrammars,
      culturalItems: chosenCultural,
      notes: curatedNotes.trim(),
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };

    setCuratedLessons((prev) => [newCurated, ...prev]);
    setIsCurateModalOpen(false);
    setCuratedTitle("");
    setCuratedNotes("");
    showToast(`Đã lưu "${newCurated.title}" (kèm ${chosenCultural.length} mục văn hóa) vào Thư viện của tôi!`);
  };

  // Handle Assign Lesson to Class (Supports multi-class & preview)
  const handleAssignToClass = () => {
    if (assignSelectedClassIds.length === 0) {
      showToast("Vui lòng chọn ít nhất 1 lớp học để giao bài");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsAssignModalOpen(false);
      setAssignStep(1);

      const targetClassNames = classesList
        .filter((c) => assignSelectedClassIds.includes(c.id))
        .map((c) => c.name);

      const chosenVocabs = currentLesson.vocabularies.filter((v) =>
        selectedVocabIds.includes(v.id)
      );
      const chosenGrammars = currentLesson.grammars.filter((g) =>
        selectedGrammarIds.includes(g.id)
      );
      const chosenCultural = availableCulturalItems.filter((c) =>
        selectedCulturalIds.includes(c.id)
      );

      const newAssignment: AssignedLessonToClass = {
        id: "assign-" + Date.now(),
        lessonId: currentLesson.id,
        titleZh: currentLesson.titleZh,
        titleVi: currentLesson.titleVi,
        sourceTrackId: activeTrack,
        classIds: assignSelectedClassIds,
        classNames: targetClassNames.length > 0 ? targetClassNames : ["Lớp học đã chọn"],
        vocabCount: chosenVocabs.length,
        grammarCount: chosenGrammars.length,
        hasDialogue: isDialogueSelected,
        hasReading: isReadingSelected,
        culturalCount: chosenCultural.length,
        selectedVocabs: chosenVocabs,
        selectedGrammars: chosenGrammars,
        selectedDialogue: isDialogueSelected ? currentLesson.dialogue : undefined,
        selectedCulturalItems: chosenCultural,
        assignedAt: new Date().toLocaleDateString("vi-VN"),
        dueDate: assignDueDate,
        teacherNote: assignNote.trim() || undefined,
      };

      setAssignedLessons((prev) => [newAssignment, ...prev]);

      showToast(
        `Đã giao bài "${currentLesson.titleVi}" cho ${targetClassNames.length} lớp học (kèm ${chosenCultural.length} mục văn hóa giao tiếp)!`
      );
    }, 500);
  };

  // Handle Transfer Selection to Assignment Module
  const handleTransferToAssignment = () => {
    const chosenVocabList = currentLesson.vocabularies.filter((v) =>
      selectedVocabIds.includes(v.id)
    );
    const chosenGrammarList = currentLesson.grammars.filter((g) =>
      selectedGrammarIds.includes(g.id)
    );
    const chosenCulturalList = availableCulturalItems.filter((c) =>
      selectedCulturalIds.includes(c.id)
    );

    if (chosenVocabList.length === 0 && chosenGrammarList.length === 0 && chosenCulturalList.length === 0) {
      showToast("Vui lòng chọn ít nhất 1 từ vựng, ngữ pháp hoặc mục văn hóa để tạo bài tập!");
      return;
    }

    if (onNavigateToAssignments) {
      onNavigateToAssignments({
        lessonTitle: currentLesson.titleVi,
        classId: selectedClassId || (classesList[0]?.id ?? "c1"),
        vocabList: chosenVocabList,
        grammarList: chosenGrammarList,
        culturalList: chosenCulturalList,
      });
    } else {
      showToast(
        `Đã chuyển ${chosenVocabList.length} từ vựng, ${chosenGrammarList.length} ngữ pháp và ${chosenCulturalList.length} mục văn hóa sang module Bài tập!`
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
                      type="button"
                      onClick={openEditLessonModal}
                      className="px-3 py-1.5 rounded-xl border border-[#204434] bg-[#204434] text-white hover:bg-[#183629] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                      title="Chỉnh sửa nội dung học liệu bài học"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa học liệu</span>
                    </button>

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
                                  Bấm vào từ vựng để chọn vào bài học tùy chỉnh. Mỗi từ bao gồm chữ Hán, pinyin, nghĩa tiếng Việt, giải thích cách dùng và câu ví dụ.
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

                                      <div className="pt-1 border-t border-[#E5DEC9]/60 space-y-1.5">
                                        <p className="text-xs font-bold text-[#204434]">{v.meaningVi}</p>
                                        {v.usageNote && (
                                          <div className="text-[11px] text-[#8F6D3B] bg-[#FAF7F0] p-2 rounded-xl border border-[#E5DEC9]/50 leading-relaxed">
                                            <span className="font-semibold text-[#204434]">Giải thích: </span>
                                            <span>{v.usageNote}</span>
                                          </div>
                                        )}
                                        <div className="text-[11px] bg-white/70 p-2 rounded-xl border border-[#E5DEC9]/60 space-y-0.5">
                                          <div className="flex items-center justify-between">
                                            <p className="font-medium text-[#204434]">{v.exampleZh}</p>
                                            {v.exampleZh && (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  speakChinese(v.exampleZh);
                                                }}
                                                className="p-1 rounded text-gray-400 hover:text-[#204434]"
                                                title="Nghe câu ví dụ"
                                              >
                                                <Volume2 className="w-3 h-3" />
                                              </button>
                                            )}
                                          </div>
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
                                  Cấu trúc ngữ pháp trọng điểm kèm giải thích rõ ràng và câu mẫu giao tiếp.
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

                                    {g.examples && g.examples.length > 0 && (
                                      <div className="space-y-1.5 pt-2 border-t border-[#E5DEC9]/60">
                                        <p className="text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wide">
                                          Ví dụ & Câu mẫu giao tiếp:
                                        </p>
                                        <div className="grid grid-cols-1 gap-1.5">
                                          {g.examples.map((ex, exIdx) => (
                                            <div
                                              key={exIdx}
                                              className="bg-white/80 p-2.5 rounded-xl border border-[#E5DEC9]/60 flex items-center justify-between gap-2"
                                            >
                                              <div className="space-y-0.5">
                                                <span className="font-serif font-bold text-sm text-[#204434]">{ex.zh}</span>
                                                <span className="text-xs text-[#8F6D3B] ml-2 italic">{ex.py}</span>
                                                <span className="text-xs text-[#315E48] ml-2 font-medium">— {ex.vi}</span>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  speakChinese(ex.zh);
                                                }}
                                                className="p-1.5 rounded-lg border border-[#E5DEC9] bg-[#FAF7F0] hover:bg-[#F3EEDD] text-[#204434] transition shrink-0"
                                                title="Nghe câu mẫu"
                                              >
                                                <Volume2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
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
                                    Tình huống giao tiếp thực tế với audio chuẩn, hỗ trợ bật tắt pinyin và nghĩa tiếng Việt.
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
                              {/* Situation Description Box */}
                              <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] text-xs text-[#204434] flex items-start gap-2 leading-relaxed">
                                <span className="font-bold text-[#8F6D3B] shrink-0">Tình huống:</span>
                                <span>{currentLesson.dialogue.situation}</span>
                              </div>

                              {/* Audio Player & Toggle Bar */}
                              <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => setIsPlayingDialogueAudio(!isPlayingDialogueAudio)}
                                    className="w-8 h-8 rounded-full bg-[#204434] text-white flex items-center justify-center shadow-2xs hover:bg-[#183629] transition"
                                    title={isPlayingDialogueAudio ? "Tạm dừng phát" : "Phát toàn bộ hội thoại lần lượt"}
                                  >
                                    {isPlayingDialogueAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                  </button>
                                  <span className="text-xs font-bold text-[#204434]">
                                    {isPlayingDialogueAudio ? "Đang phát hội thoại..." : "Phát toàn bộ hội thoại lần lượt"}
                                  </span>
                                  {currentLesson.dialogue.audioDuration && (
                                    <span className="text-[11px] text-[#8F6D3B]">({currentLesson.dialogue.audioDuration})</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setShowPinyinInDialogue(!showPinyinInDialogue)}
                                    className="text-[11px] px-2.5 py-1 rounded-lg border border-[#E5DEC9] bg-white font-semibold text-[#8F6D3B] hover:bg-[#F3EEDD] transition"
                                  >
                                    {showPinyinInDialogue ? "Ẩn Pinyin" : "Hiện Pinyin"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowViInDialogue(!showViInDialogue)}
                                    className="text-[11px] px-2.5 py-1 rounded-lg border border-[#E5DEC9] bg-white font-semibold text-[#315E48] hover:bg-[#F3EEDD] transition"
                                  >
                                    {showViInDialogue ? "Ẩn bản dịch" : "Hiện bản dịch"}
                                  </button>
                                </div>
                              </div>

                              {/* Dialogue lines */}
                              <div className="space-y-3">
                                {currentLesson.dialogue.lines.map((line, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                                      activeSpeakingText === line.zh
                                        ? "bg-[#F3EEDD]/90 border-[#204434] shadow-xs"
                                        : idx % 2 === 0
                                        ? "bg-white border-[#E5DEC9]"
                                        : "bg-[#FAF7F0]/60 border-[#BC9B6B]/40"
                                    }`}
                                  >
                                    <span className="px-2.5 py-1 rounded-xl bg-[#204434] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                      {line.speaker}
                                    </span>
                                    <div className="space-y-1 flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="font-serif font-bold text-base text-[#204434]">{line.zh}</p>
                                        <button
                                          type="button"
                                          onClick={() => speakChinese(line.zh)}
                                          className={`p-1 rounded transition ${
                                            activeSpeakingText === line.zh
                                              ? "bg-[#204434] text-white"
                                              : "text-gray-400 hover:text-[#204434]"
                                          }`}
                                          title="Nghe câu này"
                                        >
                                          <Volume2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                      {showPinyinInDialogue && (
                                        <p className="text-xs text-[#8F6D3B] italic">{line.py}</p>
                                      )}
                                      {showViInDialogue && (
                                        <p className="text-xs text-[#315E48]">{line.vi}</p>
                                      )}
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
                                    Đoạn văn ngắn củng cố từ vựng và cấu trúc đã học trong ngữ cảnh thực tế.
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
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-serif font-bold text-base text-[#204434]">
                                    {currentLesson.reading.titleZh} ({currentLesson.reading.titleVi})
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => currentLesson.reading?.contentZh && speakChinese(currentLesson.reading.contentZh)}
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition ${
                                      activeSpeakingText === currentLesson.reading?.contentZh
                                        ? "bg-[#204434] text-white border-[#204434]"
                                        : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#F3EEDD]"
                                    }`}
                                    title="Phát toàn bộ bài đọc"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                    <span>Phát âm thanh toàn bài đọc</span>
                                  </button>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setShowPinyinInReading(!showPinyinInReading)}
                                    className="text-[11px] px-2.5 py-1 rounded-lg border border-[#E5DEC9] bg-white font-semibold text-[#8F6D3B] hover:bg-[#F3EEDD] transition"
                                  >
                                    {showPinyinInReading ? "Ẩn Pinyin" : "Hiện Pinyin"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowViInReading(!showViInReading)}
                                    className="text-[11px] px-2.5 py-1 rounded-lg border border-[#E5DEC9] bg-white font-semibold text-[#315E48] hover:bg-[#F3EEDD] transition"
                                  >
                                    {showViInReading ? "Ẩn bản dịch" : "Hiện bản dịch"}
                                  </button>
                                </div>
                              </div>

                              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3">
                                <p className="font-serif text-base text-[#204434] leading-relaxed">
                                  {currentLesson.reading.contentZh}
                                </p>
                                {showPinyinInReading && (
                                  <p className="text-xs text-[#8F6D3B] italic leading-relaxed pt-2 border-t border-[#E5DEC9]/40">
                                    {currentLesson.reading.contentPy}
                                  </p>
                                )}
                                {showViInReading && (
                                  <p className="text-xs text-[#315E48] leading-relaxed pt-2 border-t border-[#E5DEC9]/40">
                                    {currentLesson.reading.contentVi}
                                  </p>
                                )}
                              </div>

                              {/* TỪ VỰNG MỞ RỘNG TRONG BÀI ĐỌC */}
                              {currentLesson.reading.extraVocabs && currentLesson.reading.extraVocabs.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-[#E5DEC9]/60">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wide">
                                      Từ vựng mở rộng ({currentLesson.reading.extraVocabs.length} từ):
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] font-semibold">
                                      Từ vựng mở rộng
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                    {currentLesson.reading.extraVocabs.map((ev, evIdx) => (
                                      <div
                                        key={evIdx}
                                        className="p-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] flex items-center justify-between gap-2 shadow-2xs"
                                      >
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-serif font-bold text-sm text-[#204434]">{ev.hanzi}</span>
                                            <span className="text-[11px] text-[#8F6D3B] italic">{ev.pinyin}</span>
                                          </div>
                                          <p className="text-[11px] text-[#315E48] font-medium">{ev.meaningVi}</p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => speakChinese(ev.hanzi)}
                                          className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white hover:bg-[#F3EEDD] text-[#204434] transition shrink-0"
                                          title="Nghe phát âm"
                                        >
                                          <Volume2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* SECTION 5: VĂN HÓA GIAO TIẾP & CÁCH SỬ DỤNG THỰC TẾ (ĐẶC TẢ HOÀN CHỈNH) */}
                        {currentLesson.culturalNote && (
                          <div className="rounded-3xl border border-[#BC9B6B]/60 bg-[#FFFCF6] shadow-2xs overflow-hidden">
                            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#BC9B6B]/40 bg-gradient-to-r from-[#FAF7F0] via-[#FDFBF7] to-[#F5EEDB]">
                              <div className="flex items-center gap-3">
                                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#BC9B6B] to-[#8F6D3B] text-white flex items-center justify-center font-bold text-lg shadow-2xs">
                                  🏮
                                </span>
                                <div>
                                  <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                                    <span>Văn hóa giao tiếp & Cách sử dụng thực tế</span>
                                    <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] border border-[#BC9B6B]/30">
                                      {selectedCulturalItems.length}/{availableCulturalItems.length} đã chọn
                                    </span>
                                  </h3>
                                  <p className="text-[11px] text-[#315E48]">
                                    Các quy tắc văn hóa quan trọng, lưu ý giao tiếp và mẫu câu thường dùng trong đời sống.
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={toggleAllCultural}
                                  className="px-3 py-1.5 rounded-xl border border-[#BC9B6B]/50 bg-white hover:bg-[#F3EEDD] text-[#8F6D3B] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
                                >
                                  <div
                                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                                      isAllCulturalSelected
                                        ? "bg-[#204434] border-[#204434] text-white"
                                        : isSomeCulturalSelected
                                        ? "bg-[#BC9B6B]/30 border-[#BC9B6B] text-[#204434]"
                                        : "border-[#BC9B6B] bg-white"
                                    }`}
                                  >
                                    {isAllCulturalSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                    {!isAllCulturalSelected && isSomeCulturalSelected && (
                                      <span className="w-2 h-0.5 bg-[#204434] rounded-full" />
                                    )}
                                  </div>
                                  <span>{isAllCulturalSelected ? "Bỏ chọn tất cả Phần 5" : "Chọn toàn bộ Phần 5"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setIsCulturalExpanded(!isCulturalExpanded)}
                                  className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white text-[#204434] hover:bg-[#F3EEDD]"
                                >
                                  {isCulturalExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            {isCulturalExpanded && (
                              <div className="p-5 space-y-4 text-xs">
                                {/* 1. Bối cảnh & Đối tượng (2 Subsections with individual checkboxes) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                  {/* Subsection 1: Context */}
                                  {currentLesson.culturalNote.context && (() => {
                                    const contextId = `cult-${currentLesson.id}-context`;
                                    const isContextSelected = selectedCulturalIds.includes(contextId);
                                    return (
                                      <div
                                        onClick={() => toggleCulturalItem(contextId)}
                                        className={`p-3.5 rounded-2xl border transition cursor-pointer select-none space-y-2 ${
                                          isContextSelected
                                            ? "bg-[#F3EEDD]/70 border-[#204434] shadow-xs"
                                            : "bg-white border-[#E5DEC9] hover:border-[#BC9B6B]"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wide flex items-center gap-1.5">
                                            <span>🏛️</span>
                                            <span>Bối cảnh sử dụng</span>
                                          </span>
                                          <div
                                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                                              isContextSelected
                                                ? "bg-[#204434] border-[#204434] text-white"
                                                : "border-[#BC9B6B] bg-white"
                                            }`}
                                          >
                                            {isContextSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                          </div>
                                        </div>
                                        <p className="text-[#204434] leading-relaxed">
                                          {currentLesson.culturalNote.context}
                                        </p>
                                      </div>
                                    );
                                  })()}

                                  {/* Subsection 2: Target Audience */}
                                  {currentLesson.culturalNote.targetAudience && (() => {
                                    const audienceId = `cult-${currentLesson.id}-audience`;
                                    const isAudienceSelected = selectedCulturalIds.includes(audienceId);
                                    return (
                                      <div
                                        onClick={() => toggleCulturalItem(audienceId)}
                                        className={`p-3.5 rounded-2xl border transition cursor-pointer select-none space-y-2 ${
                                          isAudienceSelected
                                            ? "bg-[#F3EEDD]/70 border-[#204434] shadow-xs"
                                            : "bg-white border-[#E5DEC9] hover:border-[#BC9B6B]"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wide flex items-center gap-1.5">
                                            <span>👥</span>
                                            <span>Đối tượng phù hợp</span>
                                          </span>
                                          <div
                                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                                              isAudienceSelected
                                                ? "bg-[#204434] border-[#204434] text-white"
                                                : "border-[#BC9B6B] bg-white"
                                            }`}
                                          >
                                            {isAudienceSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                          </div>
                                        </div>
                                        <p className="text-[#204434] leading-relaxed">
                                          {currentLesson.culturalNote.targetAudience}
                                        </p>
                                      </div>
                                    );
                                  })()}
                                </div>

                                {/* 2. Subsection 3: Mẫu câu nên dùng (Group toggle + Individual phrase toggles) */}
                                {currentLesson.culturalNote.naturalExpressions && currentLesson.culturalNote.naturalExpressions.length > 0 && (() => {
                                  const phraseItems = availableCulturalItems.filter((c) => c.type === "PHRASE");
                                  const selectedPhraseCount = phraseItems.filter((c) => selectedCulturalIds.includes(c.id)).length;
                                  const isAllPhrasesSelected = phraseItems.length > 0 && selectedPhraseCount === phraseItems.length;

                                  return (
                                    <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3">
                                      <div className="flex items-center justify-between border-b border-[#E5DEC9]/70 pb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-bold text-[#204434] uppercase tracking-wide flex items-center gap-1">
                                            <span>✨</span>
                                            <span>Nhóm 1: Mẫu câu vàng khuyên dùng</span>
                                          </span>
                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#8F6D3B] font-semibold">
                                            {selectedPhraseCount}/{phraseItems.length} đã chọn
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => toggleCulturalSubgroup("PHRASE")}
                                          className="text-xs text-[#204434] hover:underline font-semibold flex items-center gap-1.5"
                                        >
                                          <div
                                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition ${
                                              isAllPhrasesSelected
                                                ? "bg-[#204434] border-[#204434] text-white"
                                                : "border-[#BC9B6B] bg-white"
                                            }`}
                                          >
                                            {isAllPhrasesSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                          </div>
                                          <span>{isAllPhrasesSelected ? "Bỏ chọn tất cả mẫu câu" : "Chọn tất cả mẫu câu"}</span>
                                        </button>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {currentLesson.culturalNote.naturalExpressions.map((phrase, i) => {
                                          const phraseId = `cult-${currentLesson.id}-phrase-${i}`;
                                          const isSelected = selectedCulturalIds.includes(phraseId);

                                          return (
                                            <div
                                              key={phraseId}
                                              onClick={() => toggleCulturalItem(phraseId)}
                                              className={`p-3 rounded-xl border transition cursor-pointer select-none flex items-start justify-between gap-2 ${
                                                isSelected
                                                  ? "bg-[#F3EEDD]/80 border-[#204434] shadow-xs"
                                                  : "bg-[#FAF7F0] border-[#E5DEC9]/80 hover:border-[#BC9B6B]"
                                              }`}
                                            >
                                              <div className="flex items-start gap-2.5">
                                                <div
                                                  className={`w-4 h-4 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition ${
                                                    isSelected
                                                      ? "bg-[#204434] border-[#204434] text-white"
                                                      : "border-[#BC9B6B] bg-white"
                                                  }`}
                                                >
                                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <div>
                                                  <span className="font-serif font-bold text-sm text-[#204434]">
                                                    {phrase.zh}
                                                  </span>
                                                  <p className="text-[11px] text-[#8F6D3B]">{phrase.py}</p>
                                                  <p className="text-[11px] text-[#315E48] font-medium">{phrase.vi}</p>
                                                </div>
                                              </div>

                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  speakChinese(phrase.zh);
                                                }}
                                                className={`p-1.5 rounded-lg border transition shrink-0 ${
                                                  activeSpeakingText === phrase.zh
                                                    ? "bg-[#204434] text-white border-[#204434]"
                                                    : "bg-white text-gray-500 border-[#E5DEC9] hover:text-[#204434] hover:bg-[#F3EEDD]"
                                                }`}
                                                title="Phát âm mẫu câu"
                                              >
                                                <Volume2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* 3. Subsection 4 & 5: Cách nói lịch sự & Lưu ý cấm kỵ */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                  {/* Polite Expressions */}
                                  {currentLesson.culturalNote.politeExpressions && currentLesson.culturalNote.politeExpressions.length > 0 && (() => {
                                    const politeItems = availableCulturalItems.filter((c) => c.type === "POLITE");
                                    const selectedPoliteCount = politeItems.filter((c) => selectedCulturalIds.includes(c.id)).length;
                                    const isAllPoliteSelected = politeItems.length > 0 && selectedPoliteCount === politeItems.length;

                                    return (
                                      <div className="p-3.5 rounded-2xl bg-[#204434]/5 border border-[#204434]/20 space-y-2.5">
                                        <div className="flex items-center justify-between border-b border-[#204434]/15 pb-1.5">
                                          <span className="text-[10px] font-bold text-[#204434] uppercase tracking-wide flex items-center gap-1">
                                            <span>🤝</span>
                                            <span>Nhóm 2: Cách nói lịch sự & Tôn trọng</span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => toggleCulturalSubgroup("POLITE")}
                                            className="text-[11px] text-[#204434] hover:underline font-semibold"
                                          >
                                            {isAllPoliteSelected ? "Bỏ chọn" : `Chọn tất cả (${politeItems.length})`}
                                          </button>
                                        </div>

                                        <div className="space-y-2">
                                          {currentLesson.culturalNote.politeExpressions.map((pe, idx) => {
                                            const politeId = `cult-${currentLesson.id}-polite-${idx}`;
                                            const isSelected = selectedCulturalIds.includes(politeId);

                                            return (
                                              <div
                                                key={politeId}
                                                onClick={() => toggleCulturalItem(politeId)}
                                                className={`p-2.5 rounded-xl border transition cursor-pointer select-none flex items-start justify-between gap-2 ${
                                                  isSelected
                                                    ? "bg-[#F3EEDD] border-[#204434] shadow-xs"
                                                    : "bg-white/80 border-[#204434]/15 hover:border-[#204434]"
                                                }`}
                                              >
                                                <div className="flex items-start gap-2">
                                                  <div
                                                    className={`w-4 h-4 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition ${
                                                      isSelected
                                                        ? "bg-[#204434] border-[#204434] text-white"
                                                        : "border-[#BC9B6B] bg-white"
                                                    }`}
                                                  >
                                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                  </div>
                                                  <div className="text-[#204434] text-xs">
                                                    <span className="font-serif font-bold text-sm">{pe.zh}</span>{" "}
                                                    <span className="text-[11px] text-[#8F6D3B]">({pe.py})</span> - {pe.vi}
                                                    {pe.note && (
                                                      <span className="text-[10px] text-[#8F6D3B] block italic mt-0.5">
                                                        • {pe.note}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>

                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    speakChinese(pe.zh);
                                                  }}
                                                  className={`p-1 rounded-md border transition shrink-0 ${
                                                    activeSpeakingText === pe.zh
                                                      ? "bg-[#204434] text-white border-[#204434]"
                                                      : "bg-white text-gray-500 border-[#E5DEC9] hover:text-[#204434]"
                                                  }`}
                                                  title="Phát âm"
                                                >
                                                  <Volume2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* Caution Notes */}
                                  {currentLesson.culturalNote.cautionNotes && currentLesson.culturalNote.cautionNotes.length > 0 && (() => {
                                    const cautionItemList = availableCulturalItems.filter((c) => c.type === "CAUTION");
                                    const selectedCautionCount = cautionItemList.filter((c) => selectedCulturalIds.includes(c.id)).length;
                                    const isAllCautionSelected = cautionItemList.length > 0 && selectedCautionCount === cautionItemList.length;

                                    return (
                                      <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200 space-y-2.5">
                                        <div className="flex items-center justify-between border-b border-red-200/80 pb-1.5">
                                          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide flex items-center gap-1">
                                            <span>⚠️</span>
                                            <span>Nhóm 3: Lưu ý & Cấm kỵ văn hóa</span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => toggleCulturalSubgroup("CAUTION")}
                                            className="text-[11px] text-red-800 hover:underline font-semibold"
                                          >
                                            {isAllCautionSelected ? "Bỏ chọn" : `Chọn tất cả (${cautionItemList.length})`}
                                          </button>
                                        </div>

                                        <div className="space-y-2">
                                          {currentLesson.culturalNote.cautionNotes.map((note, idx) => {
                                            const cautionId = `cult-${currentLesson.id}-caution-${idx}`;
                                            const isSelected = selectedCulturalIds.includes(cautionId);

                                            return (
                                              <div
                                                key={cautionId}
                                                onClick={() => toggleCulturalItem(cautionId)}
                                                className={`p-2.5 rounded-xl border transition cursor-pointer select-none flex items-start gap-2 ${
                                                  isSelected
                                                    ? "bg-red-100/90 border-red-600 shadow-xs"
                                                    : "bg-white/80 border-red-200 hover:border-red-400"
                                                }`}
                                              >
                                                <div
                                                  className={`w-4 h-4 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition ${
                                                    isSelected
                                                      ? "bg-red-700 border-red-700 text-white"
                                                      : "border-red-300 bg-white"
                                                  }`}
                                                >
                                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <p className="text-red-900 text-xs leading-relaxed flex-1">{note}</p>
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    const match = note.match(/[\u4e00-\u9fa5]+/g);
                                                    if (match && match.length > 0) {
                                                      speakChinese(match.join("，"));
                                                    } else {
                                                      speakChinese(note);
                                                    }
                                                  }}
                                                  className="p-1 rounded-md border border-red-200 bg-white hover:bg-red-100 text-red-700 transition shrink-0"
                                                  title="Phát âm tiếng Trung trong lưu ý"
                                                >
                                                  <Volume2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>

                                {/* 4. Subsection 6: Tình huống áp dụng thực tế */}
                                {currentLesson.culturalNote.practiceScenario && (() => {
                                  const scenarioId = `cult-${currentLesson.id}-scenario`;
                                  const isScenarioSelected = selectedCulturalIds.includes(scenarioId);

                                  return (
                                    <div
                                      onClick={() => toggleCulturalItem(scenarioId)}
                                      className={`p-3.5 rounded-2xl border transition cursor-pointer select-none space-y-2 ${
                                        isScenarioSelected
                                          ? "bg-[#F3EEDD]/80 border-[#204434] shadow-xs"
                                          : "bg-[#FAF7F0] border-[#BC9B6B]/40 hover:border-[#BC9B6B]"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wide flex items-center gap-1.5">
                                          <span>📍</span>
                                          <span>Tình huống áp dụng thực tế</span>
                                        </span>
                                        <div
                                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                                            isScenarioSelected
                                              ? "bg-[#204434] border-[#204434] text-white"
                                              : "border-[#BC9B6B] bg-white"
                                          }`}
                                        >
                                          {isScenarioSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                      </div>
                                      <p className="text-[#204434] leading-relaxed">
                                        {currentLesson.culturalNote.practiceScenario}
                                      </p>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
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
                        {/* Văn hóa giao tiếp row */}
                        <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#FAF7F0] to-[#F5EEDB] border border-[#BC9B6B]/60 flex items-center justify-between col-span-2">
                          <span className="text-[#8F6D3B] font-bold flex items-center gap-1.5">
                            <span>🏮</span>
                            <span>Văn hóa giao tiếp:</span>
                          </span>
                          <span className="font-bold text-[#204434]">
                            {selectedCulturalIds.length} / {availableCulturalItems.length} mục
                          </span>
                        </div>
                      </div>

                      {/* Preview Detailed Basket Button */}
                      <button
                        type="button"
                        onClick={() => setIsPreviewBasketModalOpen(true)}
                        disabled={totalSelectedCount === 0}
                        className="w-full py-2 px-3 rounded-xl border border-[#204434]/20 bg-[#FAF7F0] hover:bg-[#F3EEDD] disabled:opacity-40 text-[#204434] text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#BC9B6B]" />
                        <span>Xem trước & quản lý giỏ ({totalSelectedCount})</span>
                      </button>

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
                          onClick={() => {
                            setAssignSelectedClassIds(selectedClassId ? [selectedClassId] : classesList.slice(0, 1).map((c) => c.id));
                            setAssignStep(1);
                            setIsAssignModalOpen(true);
                          }}
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
                  { id: "ALL", label: `Tất cả (${savedHanyuLessons.length + curatedLessons.length + lectureMaterials.length + assignedLessons.length})` },
                  { id: "SAVED_HANYU", label: `Đã lưu từ Hanyu (${savedHanyuLessons.length})` },
                  { id: "CURATED", label: `Bài học tùy chỉnh (${curatedLessons.length})` },
                  { id: "ASSIGNED", label: `Bài học đã giao (${assignedLessons.length})` },
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
                          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#8F6D3B]">
                            <span>📚 {cur.selectedVocabCount} từ vựng</span>
                            <span>•</span>
                            <span>📐 {cur.selectedGrammarCount} ngữ pháp</span>
                            {(cur.selectedCulturalCount || cur.culturalItems?.length || 0) > 0 && (
                              <>
                                <span>•</span>
                                <span className="font-bold text-[#8F6D3B]">
                                  🏮 {cur.selectedCulturalCount || cur.culturalItems?.length} văn hóa
                                </span>
                              </>
                            )}
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
                                  culturalList: cur.culturalItems,
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

            {/* D. SECTION: BÀI HỌC ĐÃ GIAO CHO LỚP */}
            {(librarySubTab === "ALL" || librarySubTab === "ASSIGNED") && (
              <div className="space-y-3 pt-4 border-t border-[#E5DEC9]">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#BC9B6B]" />
                    <span>Bài học đã giao cho lớp ({assignedLessons.length})</span>
                  </h3>
                  <span className="text-xs text-[#315E48]">Học viên mở trong mục "Lớp học của tôi"</span>
                </div>

                {assignedLessons.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-[#FFFCF6] border border-dashed border-[#E5DEC9] text-center text-xs text-[#315E48]">
                    Chưa có bài học nào được giao. Hãy chọn bài học từ tab "Khám phá bài học" và bấm "Giao bài học cho lớp".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignedLessons.map((asg) => (
                      <div
                        key={asg.id}
                        className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-2xs space-y-3 hover:border-[#204434] transition flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#204434]/10 text-[#204434]">
                              Đã giao: {asg.assignedAt}
                            </span>
                            <span className="text-[10px] text-red-700 font-semibold">
                              Hạn: {asg.dueDate}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-serif font-bold text-base text-[#204434]">
                              {asg.titleZh}
                            </h4>
                            <p className="text-xs text-[#8F6D3B] font-medium">{asg.titleVi}</p>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {asg.classNames.map((cName, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[10px] text-[#315E48] font-medium"
                              >
                                {cName}
                              </span>
                            ))}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#315E48] pt-1">
                            <span>📚 {asg.vocabCount} từ</span>
                            <span>•</span>
                            <span>📐 {asg.grammarCount} ngữ pháp</span>
                            <span>•</span>
                            <span className="font-bold text-[#8F6D3B]">
                              🏮 {asg.culturalCount || asg.selectedCulturalItems?.length || 0} mục văn hóa
                            </span>
                          </div>

                          {asg.teacherNote && (
                            <p className="text-[11px] text-[#204434] italic bg-[#FAF7F0] p-2 rounded-xl border border-[#E5DEC9]">
                              Lời dặn: {asg.teacherNote}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                          <span className="text-[11px] text-[#315E48]">
                            Học viên đang học
                          </span>
                          <button
                            onClick={() => {
                              setAssignedLessons((prev) => prev.filter((a) => a.id !== asg.id));
                              showToast(`Đã hủy giao bài "${asg.titleVi}"`);
                            }}
                            className="text-xs text-red-600 hover:underline font-medium"
                          >
                            Hủy giao bài
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1.5">
                <span className="font-bold text-[#8F6D3B] block">Nội dung sẽ được đóng gói:</span>
                <p className="text-[#315E48]">
                  • <strong>{selectedVocabIds.length}</strong> từ vựng đã chọn
                </p>
                <p className="text-[#315E48]">
                  • <strong>{selectedGrammarIds.length}</strong> điểm ngữ pháp đã chọn
                </p>
                {isDialogueSelected && (
                  <p className="text-[#315E48]">
                    • <strong>1</strong> bài hội thoại thực tế
                  </p>
                )}
                {isReadingSelected && (
                  <p className="text-[#315E48]">
                    • <strong>1</strong> bài đọc hiểu ngữ cảnh
                  </p>
                )}
                <p className="text-[#8F6D3B] font-bold">
                  • <strong>{selectedCulturalItems.length}</strong> mục văn hóa giao tiếp đã chọn
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
      {/* MODAL 2: GIAO BÀI HỌC CHO LỚP (MULTI-CLASS + PREVIEW CONFIRMATION) */}
      {/* =================================================================== */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#8F6D3B]" />
                <h3 className="font-serif font-bold text-base text-[#204434]">
                  {assignStep === 1 ? "Giao bài học cho lớp" : "Xem trước trước khi giao bài"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setAssignStep(1);
                }}
                className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: CẤU HÌNH GIAO BÀI */}
            {assignStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#204434] block mb-1">Bài học:</label>
                  <div className="p-3 rounded-xl bg-white border border-[#E5DEC9] font-serif font-bold text-sm text-[#204434]">
                    {currentLesson.titleZh} - {currentLesson.titleVi}
                  </div>
                </div>

                {/* Multi-class selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#204434] block">
                      Chọn lớp nhận bài học (có thể chọn nhiều lớp): <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (assignSelectedClassIds.length === classesList.length) {
                          setAssignSelectedClassIds(classesList.slice(0, 1).map((c) => c.id));
                        } else {
                          setAssignSelectedClassIds(classesList.map((c) => c.id));
                        }
                      }}
                      className="text-[11px] text-[#204434] font-semibold hover:underline"
                    >
                      {assignSelectedClassIds.length === classesList.length
                        ? "Bỏ chọn bớt"
                        : "Chọn tất cả các lớp"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 bg-white rounded-xl border border-[#E5DEC9]">
                    {classesList.map((c) => {
                      const isChecked = assignSelectedClassIds.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            setAssignSelectedClassIds((prev) =>
                              isChecked
                                ? prev.length > 1
                                  ? prev.filter((x) => x !== c.id)
                                  : prev
                                : [...prev, c.id]
                            );
                          }}
                          className={`p-2 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                            isChecked
                              ? "bg-[#F3EEDD]/70 border-[#204434]"
                              : "bg-[#FAF7F0] border-[#E5DEC9] hover:border-[#BC9B6B]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                isChecked
                                  ? "bg-[#204434] border-[#204434] text-white"
                                  : "border-[#BC9B6B] bg-white"
                              }`}
                            >
                              {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span className="font-semibold text-[#204434] truncate max-w-[170px]">{c.name}</span>
                          </div>
                          <span className="text-[10px] text-[#315E48]">
                            {c.studentCount || 0} học viên
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#204434] block mb-1">Thời gian mở bài:</label>
                    <input
                      type="date"
                      value={assignOpenDate}
                      onChange={(e) => setAssignOpenDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs text-[#204434]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#204434] block mb-1">
                      Hạn hoàn thành: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={assignDueDate}
                      onChange={(e) => setAssignDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs text-[#204434]"
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="font-bold text-[#204434] block mb-1">Lời nhắn của giáo viên:</label>
                  <textarea
                    value={assignNote}
                    onChange={(e) => setAssignNote(e.target.value)}
                    placeholder="Yêu cầu học viên học thuộc từ vựng và xem kỹ phần Hội thoại & Văn hóa giao tiếp..."
                    rows={2}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs"
                  />
                </div>

                {/* Summary Info Box */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-1">
                  <span className="font-bold text-[#8F6D3B] block">Tóm tắt nội dung sẽ giao:</span>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-[#315E48]">
                    <span>• {selectedVocabIds.length} từ vựng</span>
                    <span>• {selectedGrammarIds.length} điểm ngữ pháp</span>
                    <span>• {isDialogueSelected ? "1 hội thoại" : "Không có hội thoại"}</span>
                    <span>• {isReadingSelected ? "1 bài đọc" : "Không có bài đọc"}</span>
                    <span className="col-span-2 font-bold text-[#8F6D3B]">
                      • 🏮 {selectedCulturalItems.length} mục văn hóa giao tiếp
                    </span>
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
                    onClick={() => setAssignStep(2)}
                    className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#183629] flex items-center gap-1.5"
                  >
                    <span>Xem trước nội dung giao →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PREVIEW MODAL TRƯỚC KHI GIAO */}
            {assignStep === 2 && (
              <div className="space-y-4 text-xs">
                {/* Meta Summary Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF7F0] to-[#F5EEDB] border border-[#BC9B6B]/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F6D3B] bg-white px-2 py-0.5 rounded-full border border-[#BC9B6B]/30">
                      Bản xem trước giao bài
                    </span>
                    <span className="text-[11px] text-[#315E48]">
                      Thời gian: {assignOpenDate} – {assignDueDate}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#204434]">
                    {currentLesson.titleZh} - {currentLesson.titleVi}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-[#315E48] font-bold">Lớp nhận bài:</span>
                    {classesList
                      .filter((c) => assignSelectedClassIds.includes(c.id))
                      .map((c) => (
                        <span
                          key={c.id}
                          className="px-2 py-0.5 rounded-lg bg-[#204434]/10 text-[#204434] font-semibold text-[10px]"
                        >
                          {c.name}
                        </span>
                      ))}
                  </div>
                  {assignNote && (
                    <p className="text-[11px] text-[#204434] bg-white/80 p-2 rounded-xl border border-[#E5DEC9] italic">
                      Dặn dò: {assignNote}
                    </p>
                  )}
                </div>

                {/* Counters Matrix */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-white border border-[#E5DEC9]">
                    <span className="text-[10px] text-[#315E48] block">Từ vựng</span>
                    <span className="font-bold text-sm text-[#204434]">{selectedVocabIds.length}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#E5DEC9]">
                    <span className="text-[10px] text-[#315E48] block">Ngữ pháp</span>
                    <span className="font-bold text-sm text-[#204434]">{selectedGrammarIds.length}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#E5DEC9]">
                    <span className="text-[10px] text-[#315E48] block">Hội thoại</span>
                    <span className="font-bold text-sm text-[#204434]">{isDialogueSelected ? "1" : "0"}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#E5DEC9]">
                    <span className="text-[10px] text-[#315E48] block">Đọc hiểu</span>
                    <span className="font-bold text-sm text-[#204434]">{isReadingSelected ? "1" : "0"}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FAF7F0] border border-[#BC9B6B]/60 col-span-3 sm:col-span-1">
                    <span className="text-[10px] text-[#8F6D3B] block font-bold">🏮 Văn hóa</span>
                    <span className="font-bold text-sm text-[#8F6D3B]">{selectedCulturalItems.length}</span>
                  </div>
                </div>

                {/* Chi tiết nội dung văn hóa được giao */}
                <div className="space-y-2">
                  <h5 className="font-bold text-[#204434] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>🏮</span>
                      <span>Chi tiết các mục Văn hóa giao tiếp sẽ hiển thị cho học viên:</span>
                    </span>
                    <span className="text-[10px] text-[#8F6D3B]">
                      {selectedCulturalItems.length} mục đã chọn
                    </span>
                  </h5>

                  {selectedCulturalItems.length === 0 ? (
                    <div className="p-3 text-center text-[#315E48] bg-white rounded-xl border border-dashed border-[#E5DEC9]">
                      Chưa chọn mục Văn hóa giao tiếp nào. Học viên sẽ chỉ nhận các mục từ vựng/ngữ pháp đã chọn.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedCulturalItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-white border border-[#E5DEC9] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#BC9B6B]/20 text-[#8F6D3B]">
                              {item.categoryLabel}
                            </span>
                            {item.zh && (
                              <button
                                type="button"
                                onClick={() => speakChinese(item.zh!)}
                                className="p-1 rounded text-gray-400 hover:text-[#204434]"
                                title="Phát âm"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          {item.zh ? (
                            <div>
                              <p className="font-serif font-bold text-sm text-[#204434]">{item.zh}</p>
                              <p className="text-[10px] text-[#8F6D3B] italic">{item.py}</p>
                              <p className="text-[11px] text-[#315E48]">{item.vi}</p>
                              {item.note && (
                                <p className="text-[10px] text-[#8F6D3B] italic">Lưu ý: {item.note}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-[#204434] leading-relaxed">{item.content}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 2 Actions */}
                <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between">
                  <button
                    onClick={() => setAssignStep(1)}
                    className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0]"
                  >
                    ← Quay lại chỉnh sửa
                  </button>
                  <button
                    onClick={handleAssignToClass}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#183629] flex items-center gap-1.5 shadow-md"
                  >
                    {isSubmitting ? (
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-[#BC9B6B]" />
                    )}
                    <span>Xác nhận & Giao bài ngay</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: XEM TRƯỚC & QUẢN LÝ CHI TIẾT GIỎ HÀNG (PREVIEW BASKET MODAL) */}
      {/* =================================================================== */}
      {isPreviewBasketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#8F6D3B]" />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#204434]">
                    Chi tiết bộ nội dung đã chọn
                  </h3>
                  <p className="text-[11px] text-[#315E48]">
                    Tổng cộng {totalSelectedCount} mục học liệu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewBasketModalOpen(false)}
                className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Category 1: Từ vựng */}
              {selectedVocabIds.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#204434]">
                      📚 Từ vựng ({selectedVocabIds.length})
                    </span>
                    <button
                      onClick={() => setSelectedVocabIds([])}
                      className="text-[10px] text-red-600 hover:underline"
                    >
                      Xóa tất cả từ vựng
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentLesson.vocabularies
                      .filter((v) => selectedVocabIds.includes(v.id))
                      .map((v) => (
                        <div
                          key={v.id}
                          className="p-2.5 rounded-xl bg-white border border-[#E5DEC9] flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-serif font-bold text-[#204434]">{v.hanzi}</span>
                            <span className="text-[10px] text-[#8F6D3B] ml-1.5">({v.pinyin})</span>
                            <p className="text-[11px] text-[#315E48]">{v.meaningVi}</p>
                          </div>
                          <button
                            onClick={() => toggleVocab(v.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                            title="Xóa khỏi giỏ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Category 2: Ngữ pháp */}
              {selectedGrammarIds.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#204434]">
                      📐 Điểm ngữ pháp ({selectedGrammarIds.length})
                    </span>
                    <button
                      onClick={() => setSelectedGrammarIds([])}
                      className="text-[10px] text-red-600 hover:underline"
                    >
                      Xóa tất cả ngữ pháp
                    </button>
                  </div>
                  <div className="space-y-2">
                    {currentLesson.grammars
                      .filter((g) => selectedGrammarIds.includes(g.id))
                      .map((g) => (
                        <div
                          key={g.id}
                          className="p-2.5 rounded-xl bg-white border border-[#E5DEC9] flex items-center justify-between gap-2"
                        >
                          <div>
                            <p className="font-serif font-bold text-[#204434]">{g.title}</p>
                            <code className="text-[11px] font-mono text-[#8F6D3B]">{g.structure}</code>
                          </div>
                          <button
                            onClick={() => toggleGrammar(g.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                            title="Xóa khỏi giỏ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Category 3: Văn hóa giao tiếp */}
              {selectedCulturalIds.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#8F6D3B] flex items-center gap-1.5">
                      <span>🏮</span>
                      <span>Văn hóa giao tiếp & Sử dụng thực tế ({selectedCulturalIds.length})</span>
                    </span>
                    <button
                      onClick={() => setSelectedCulturalIds([])}
                      className="text-[10px] text-red-600 hover:underline"
                    >
                      Xóa tất cả mục văn hóa
                    </button>
                  </div>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {selectedCulturalItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-white border border-[#BC9B6B]/40 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#BC9B6B]/20 text-[#8F6D3B]">
                            {item.categoryLabel}
                          </span>
                          {item.zh ? (
                            <div>
                              <span className="font-serif font-bold text-[#204434]">{item.zh}</span>
                              <span className="text-[10px] text-[#8F6D3B] ml-1.5 italic">({item.py})</span>
                              <p className="text-[11px] text-[#315E48]">{item.vi}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-[#204434]">{item.content}</p>
                          )}
                        </div>
                        <button
                          onClick={() => toggleCulturalItem(item.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                          title="Xóa mục này khỏi giỏ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalSelectedCount === 0 && (
                <div className="p-8 text-center text-xs text-[#315E48] bg-white rounded-2xl border border-dashed border-[#E5DEC9]">
                  Giỏ nội dung hiện đang trống. Hãy chọn từ vựng, ngữ pháp hoặc các mục văn hóa giao tiếp bên ngoài bài học.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedVocabIds([]);
                  setSelectedGrammarIds([]);
                  setSelectedCulturalIds([]);
                  setIsDialogueSelected(false);
                  setIsReadingSelected(false);
                  showToast("Đã xóa toàn bộ nội dung trong giỏ");
                }}
                disabled={totalSelectedCount === 0}
                className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 text-xs font-semibold"
              >
                Xóa tất cả trong giỏ
              </button>
              <button
                onClick={() => setIsPreviewBasketModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#183629]"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: CHỈNH SỬA HỌC LIỆU BÀI HỌC (TEACHER LESSON EDITOR) */}
      {/* =================================================================== */}
      {isEditLessonModalOpen && editingLessonDraft && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-4xl w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold shadow-2xs">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#204434]">
                    Chỉnh sửa học liệu bài học: {editingLessonDraft.titleVi}
                  </h3>
                  <p className="text-xs text-[#315E48]">
                    Thay đổi được lưu vào hệ thống dữ liệu thực tế (LocalStorage) và áp dụng ngay lập tức
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditLessonModalOpen(false)}
                className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Lesson Info Fields */}
            <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#204434] block mb-1">
                    Tiêu đề tiếng Trung (Hán tự):
                  </label>
                  <input
                    type="text"
                    value={editingLessonDraft.titleZh}
                    onChange={(e) =>
                      setEditingLessonDraft({ ...editingLessonDraft, titleZh: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs font-serif font-bold focus:outline-none focus:border-[#204434]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#8F6D3B] block mb-1">
                    Pinyin tiêu đề:
                  </label>
                  <input
                    type="text"
                    value={editingLessonDraft.titlePy}
                    onChange={(e) =>
                      setEditingLessonDraft({ ...editingLessonDraft, titlePy: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs italic focus:outline-none focus:border-[#204434]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#315E48] block mb-1">
                    Tên hiển thị tiếng Việt:
                  </label>
                  <input
                    type="text"
                    value={editingLessonDraft.titleVi}
                    onChange={(e) =>
                      setEditingLessonDraft({ ...editingLessonDraft, titleVi: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs focus:outline-none focus:border-[#204434]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#204434] block mb-1">
                  Mô tả bài học:
                </label>
                <input
                  type="text"
                  value={editingLessonDraft.description || ""}
                  onChange={(e) =>
                    setEditingLessonDraft({ ...editingLessonDraft, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs focus:outline-none focus:border-[#204434]"
                />
              </div>
            </div>

            {/* Navigation Tabs for 5 Sections */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E5DEC9] pb-2">
              <button
                type="button"
                onClick={() => setEditLessonActiveTab("vocab")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  editLessonActiveTab === "vocab"
                    ? "bg-[#204434] text-white shadow-2xs"
                    : "bg-white text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
                }`}
              >
                <span>01. Từ vựng ({editingLessonDraft.vocabularies.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setEditLessonActiveTab("grammar")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  editLessonActiveTab === "grammar"
                    ? "bg-[#204434] text-white shadow-2xs"
                    : "bg-white text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
                }`}
              >
                <span>02. Ngữ pháp ({editingLessonDraft.grammars.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setEditLessonActiveTab("dialogue")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  editLessonActiveTab === "dialogue"
                    ? "bg-[#204434] text-white shadow-2xs"
                    : "bg-white text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
                }`}
              >
                <span>03. Hội thoại ({editingLessonDraft.dialogue?.lines.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setEditLessonActiveTab("reading")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  editLessonActiveTab === "reading"
                    ? "bg-[#204434] text-white shadow-2xs"
                    : "bg-white text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
                }`}
              >
                <span>04. Bài đọc & Từ mở rộng</span>
              </button>
              <button
                type="button"
                onClick={() => setEditLessonActiveTab("culture")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  editLessonActiveTab === "culture"
                    ? "bg-[#204434] text-white shadow-2xs"
                    : "bg-white text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
                }`}
              >
                <span>05. Văn hóa giao tiếp (8)</span>
              </button>
            </div>

            {/* TAB CONTENT: 01. TỪ VỰNG */}
            {editLessonActiveTab === "vocab" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#315E48] font-medium">
                    Danh sách các từ vựng trọng điểm trong bài. Bạn có thể sửa trực tiếp hoặc thêm/bớt từ.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `v-${editingLessonDraft.id}-${Date.now()}`;
                      const newVocab = {
                        id: newId,
                        hanzi: "新词",
                        pinyin: "xīncí",
                        partOfSpeech: "danh từ",
                        meaningVi: "Từ mới",
                        usageNote: "Giải thích cách sử dụng từ mới.",
                        exampleZh: "这是一个新词。",
                        examplePy: "Zhè shì yí gè xīncí.",
                        exampleVi: "Đây là một từ mới.",
                      };
                      setEditingLessonDraft({
                        ...editingLessonDraft,
                        vocabularies: [...editingLessonDraft.vocabularies, newVocab],
                      });
                    }}
                    className="px-2.5 py-1 rounded-xl bg-[#204434] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#183629]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm từ vựng mới</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {editingLessonDraft.vocabularies.map((v, vIdx) => (
                    <div
                      key={v.id || vIdx}
                      className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#8F6D3B]">
                          Từ vựng #{vIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLessonDraft({
                              ...editingLessonDraft,
                              vocabularies: editingLessonDraft.vocabularies.filter((_, idx) => idx !== vIdx),
                            });
                          }}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="text-[10px] font-bold text-[#204434] block">Hán tự:</label>
                          <input
                            type="text"
                            value={v.hanzi}
                            onChange={(e) => {
                              const updated = [...editingLessonDraft.vocabularies];
                              updated[vIdx].hanzi = e.target.value;
                              setEditingLessonDraft({ ...editingLessonDraft, vocabularies: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] text-xs font-bold font-serif"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#8F6D3B] block">Pinyin:</label>
                          <input
                            type="text"
                            value={v.pinyin}
                            onChange={(e) => {
                              const updated = [...editingLessonDraft.vocabularies];
                              updated[vIdx].pinyin = e.target.value;
                              setEditingLessonDraft({ ...editingLessonDraft, vocabularies: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] text-xs italic"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#315E48] block">Nghĩa tiếng Việt:</label>
                          <input
                            type="text"
                            value={v.meaningVi}
                            onChange={(e) => {
                              const updated = [...editingLessonDraft.vocabularies];
                              updated[vIdx].meaningVi = e.target.value;
                              setEditingLessonDraft({ ...editingLessonDraft, vocabularies: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#8F6D3B] block">Giải thích cách dùng & Lưu ý:</label>
                        <input
                          type="text"
                          value={v.usageNote || ""}
                          onChange={(e) => {
                            const updated = [...editingLessonDraft.vocabularies];
                            updated[vIdx].usageNote = e.target.value;
                            setEditingLessonDraft({ ...editingLessonDraft, vocabularies: updated });
                          }}
                          placeholder="Ví dụ: Lời chào cơ bản khi gặp mặt một người..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#FAF7F0] p-2 rounded-xl">
                        <div>
                          <label className="text-[10px] font-bold text-[#204434] block">Câu ví dụ (Trung):</label>
                          <input
                            type="text"
                            value={v.exampleZh || ""}
                            onChange={(e) => {
                              const updated = [...editingLessonDraft.vocabularies];
                              updated[vIdx].exampleZh = e.target.value;
                              setEditingLessonDraft({ ...editingLessonDraft, vocabularies: updated });
                            }}
                            className="w-full px-2.5 py-1 rounded-lg border border-[#E5DEC9] text-xs font-serif"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#8F6D3B] block">Pinyin ví dụ:</label>
                          <input
                            type="text"
                            value={v.examplePy || ""}
                            onChange={(e) => {
                              const updated = [...editingLessonDraft.vocabularies];
                              updated[vIdx].examplePy = e.target.value;
                              setEditingLessonDraft({ ...editingLessonDraft, vocabularies: updated });
                            }}
                            className="w-full px-2.5 py-1 rounded-lg border border-[#E5DEC9] text-xs italic"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#315E48] block">Dịch ví dụ:</label>
                          <input
                            type="text"
                            value={v.exampleVi || ""}
                            onChange={(e) => {
                              const updated = [...editingLessonDraft.vocabularies];
                              updated[vIdx].exampleVi = e.target.value;
                              setEditingLessonDraft({ ...editingLessonDraft, vocabularies: updated });
                            }}
                            className="w-full px-2.5 py-1 rounded-lg border border-[#E5DEC9] text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 02. NGỮ PHÁP */}
            {editLessonActiveTab === "grammar" && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {editingLessonDraft.grammars.map((g, gIdx) => (
                  <div key={g.id || gIdx} className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] space-y-2.5">
                    <span className="text-xs font-bold text-[#204434]">Điểm ngữ pháp #{gIdx + 1}</span>
                    <div>
                      <label className="text-[10px] font-bold text-[#204434] block">Tiêu đề ngữ pháp:</label>
                      <input
                        type="text"
                        value={g.title}
                        onChange={(e) => {
                          const updated = [...editingLessonDraft.grammars];
                          updated[gIdx].title = e.target.value;
                          setEditingLessonDraft({ ...editingLessonDraft, grammars: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#8F6D3B] block">Cấu trúc:</label>
                      <input
                        type="text"
                        value={g.structure}
                        onChange={(e) => {
                          const updated = [...editingLessonDraft.grammars];
                          updated[gIdx].structure = e.target.value;
                          setEditingLessonDraft({ ...editingLessonDraft, grammars: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] text-xs font-mono font-bold text-[#204434]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#315E48] block">Giải thích chi tiết:</label>
                      <textarea
                        rows={2}
                        value={g.explanation}
                        onChange={(e) => {
                          const updated = [...editingLessonDraft.grammars];
                          updated[gIdx].explanation = e.target.value;
                          setEditingLessonDraft({ ...editingLessonDraft, grammars: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: 03. HỘI THOẠI */}
            {editLessonActiveTab === "dialogue" && editingLessonDraft.dialogue && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                <div>
                  <label className="text-[10px] font-bold text-[#8F6D3B] block mb-1">
                    Mô tả tình huống hội thoại:
                  </label>
                  <input
                    type="text"
                    value={editingLessonDraft.dialogue.situation}
                    onChange={(e) => {
                      if (!editingLessonDraft.dialogue) return;
                      setEditingLessonDraft({
                        ...editingLessonDraft,
                        dialogue: { ...editingLessonDraft.dialogue, situation: e.target.value },
                      });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#204434]">Các câu thoại trong bài:</p>
                  {editingLessonDraft.dialogue.lines.map((line, lIdx) => (
                    <div
                      key={lIdx}
                      className="p-2.5 rounded-xl bg-white border border-[#E5DEC9] grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                    >
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 block">Người nói:</label>
                        <input
                          type="text"
                          value={line.speaker}
                          onChange={(e) => {
                            if (!editingLessonDraft.dialogue) return;
                            const updated = [...editingLessonDraft.dialogue.lines];
                            updated[lIdx].speaker = e.target.value;
                            setEditingLessonDraft({
                              ...editingLessonDraft,
                              dialogue: { ...editingLessonDraft.dialogue, lines: updated },
                            });
                          }}
                          className="w-full px-2 py-1 rounded border border-[#E5DEC9] text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-[#204434] block">Tiếng Trung:</label>
                        <input
                          type="text"
                          value={line.zh}
                          onChange={(e) => {
                            if (!editingLessonDraft.dialogue) return;
                            const updated = [...editingLessonDraft.dialogue.lines];
                            updated[lIdx].zh = e.target.value;
                            setEditingLessonDraft({
                              ...editingLessonDraft,
                              dialogue: { ...editingLessonDraft.dialogue, lines: updated },
                            });
                          }}
                          className="w-full px-2 py-1 rounded border border-[#E5DEC9] text-xs font-serif font-bold text-[#204434]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-[#8F6D3B] block">Pinyin:</label>
                        <input
                          type="text"
                          value={line.py}
                          onChange={(e) => {
                            if (!editingLessonDraft.dialogue) return;
                            const updated = [...editingLessonDraft.dialogue.lines];
                            updated[lIdx].py = e.target.value;
                            setEditingLessonDraft({
                              ...editingLessonDraft,
                              dialogue: { ...editingLessonDraft.dialogue, lines: updated },
                            });
                          }}
                          className="w-full px-2 py-1 rounded border border-[#E5DEC9] text-xs italic"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-[#315E48] block">Dịch tiếng Việt:</label>
                        <input
                          type="text"
                          value={line.vi}
                          onChange={(e) => {
                            if (!editingLessonDraft.dialogue) return;
                            const updated = [...editingLessonDraft.dialogue.lines];
                            updated[lIdx].vi = e.target.value;
                            setEditingLessonDraft({
                              ...editingLessonDraft,
                              dialogue: { ...editingLessonDraft.dialogue, lines: updated },
                            });
                          }}
                          className="w-full px-2 py-1 rounded border border-[#E5DEC9] text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 04. BÀI ĐỌC & TỪ MỞ RỘNG */}
            {editLessonActiveTab === "reading" && editingLessonDraft.reading && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#204434] block">Tiêu đề đoạn văn (Hán tự):</label>
                    <input
                      type="text"
                      value={editingLessonDraft.reading.titleZh}
                      onChange={(e) => {
                        if (!editingLessonDraft.reading) return;
                        setEditingLessonDraft({
                          ...editingLessonDraft,
                          reading: { ...editingLessonDraft.reading, titleZh: e.target.value },
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] text-xs font-bold font-serif"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#315E48] block">Tiêu đề tiếng Việt:</label>
                    <input
                      type="text"
                      value={editingLessonDraft.reading.titleVi}
                      onChange={(e) => {
                        if (!editingLessonDraft.reading) return;
                        setEditingLessonDraft({
                          ...editingLessonDraft,
                          reading: { ...editingLessonDraft.reading, titleVi: e.target.value },
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#204434] block">Nội dung chữ Hán:</label>
                  <textarea
                    rows={3}
                    value={editingLessonDraft.reading.contentZh}
                    onChange={(e) => {
                      if (!editingLessonDraft.reading) return;
                      setEditingLessonDraft({
                        ...editingLessonDraft,
                        reading: { ...editingLessonDraft.reading, contentZh: e.target.value },
                      });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] text-xs font-serif leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#8F6D3B] block">Pinyin đoạn văn:</label>
                  <textarea
                    rows={2}
                    value={editingLessonDraft.reading.contentPy}
                    onChange={(e) => {
                      if (!editingLessonDraft.reading) return;
                      setEditingLessonDraft({
                        ...editingLessonDraft,
                        reading: { ...editingLessonDraft.reading, contentPy: e.target.value },
                      });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] text-xs italic leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#315E48] block">Dịch tiếng Việt:</label>
                  <textarea
                    rows={2}
                    value={editingLessonDraft.reading.contentVi}
                    onChange={(e) => {
                      if (!editingLessonDraft.reading) return;
                      setEditingLessonDraft({
                        ...editingLessonDraft,
                        reading: { ...editingLessonDraft.reading, contentVi: e.target.value },
                      });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] text-xs leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: 05. VĂN HÓA GIAO TIẾP */}
            {editLessonActiveTab === "culture" && editingLessonDraft.culturalNote && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                <div className="p-3 rounded-xl bg-white border border-[#E5DEC9] space-y-2">
                  <p className="text-xs font-bold text-[#204434]">Nhóm 1: Mẫu câu vàng khuyên dùng (2 mẫu)</p>
                  {editingLessonDraft.culturalNote.naturalExpressions?.map((ne, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#FAF7F0] p-2 rounded-lg">
                      <input
                        type="text"
                        value={ne.zh}
                        onChange={(e) => {
                          if (!editingLessonDraft.culturalNote?.naturalExpressions) return;
                          const updated = [...editingLessonDraft.culturalNote.naturalExpressions];
                          updated[idx].zh = e.target.value;
                          setEditingLessonDraft({
                            ...editingLessonDraft,
                            culturalNote: { ...editingLessonDraft.culturalNote, naturalExpressions: updated },
                          });
                        }}
                        className="px-2 py-1 rounded border border-[#E5DEC9] text-xs font-bold font-serif"
                      />
                      <input
                        type="text"
                        value={ne.py}
                        onChange={(e) => {
                          if (!editingLessonDraft.culturalNote?.naturalExpressions) return;
                          const updated = [...editingLessonDraft.culturalNote.naturalExpressions];
                          updated[idx].py = e.target.value;
                          setEditingLessonDraft({
                            ...editingLessonDraft,
                            culturalNote: { ...editingLessonDraft.culturalNote, naturalExpressions: updated },
                          });
                        }}
                        className="px-2 py-1 rounded border border-[#E5DEC9] text-xs italic"
                      />
                      <input
                        type="text"
                        value={ne.vi}
                        onChange={(e) => {
                          if (!editingLessonDraft.culturalNote?.naturalExpressions) return;
                          const updated = [...editingLessonDraft.culturalNote.naturalExpressions];
                          updated[idx].vi = e.target.value;
                          setEditingLessonDraft({
                            ...editingLessonDraft,
                            culturalNote: { ...editingLessonDraft.culturalNote, naturalExpressions: updated },
                          });
                        }}
                        className="px-2 py-1 rounded border border-[#E5DEC9] text-xs"
                      />
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E5DEC9] space-y-2">
                  <p className="text-xs font-bold text-[#204434]">Nhóm 2: Cách nói lịch sự & Tôn trọng (3 mẫu)</p>
                  {editingLessonDraft.culturalNote.politeExpressions?.map((pe, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#FAF7F0] p-2 rounded-lg">
                      <input
                        type="text"
                        value={pe.zh}
                        onChange={(e) => {
                          if (!editingLessonDraft.culturalNote?.politeExpressions) return;
                          const updated = [...editingLessonDraft.culturalNote.politeExpressions];
                          updated[idx].zh = e.target.value;
                          setEditingLessonDraft({
                            ...editingLessonDraft,
                            culturalNote: { ...editingLessonDraft.culturalNote, politeExpressions: updated },
                          });
                        }}
                        className="px-2 py-1 rounded border border-[#E5DEC9] text-xs font-bold font-serif"
                      />
                      <input
                        type="text"
                        value={pe.py}
                        onChange={(e) => {
                          if (!editingLessonDraft.culturalNote?.politeExpressions) return;
                          const updated = [...editingLessonDraft.culturalNote.politeExpressions];
                          updated[idx].py = e.target.value;
                          setEditingLessonDraft({
                            ...editingLessonDraft,
                            culturalNote: { ...editingLessonDraft.culturalNote, politeExpressions: updated },
                          });
                        }}
                        className="px-2 py-1 rounded border border-[#E5DEC9] text-xs italic"
                      />
                      <input
                        type="text"
                        value={pe.vi}
                        onChange={(e) => {
                          if (!editingLessonDraft.culturalNote?.politeExpressions) return;
                          const updated = [...editingLessonDraft.culturalNote.politeExpressions];
                          updated[idx].vi = e.target.value;
                          setEditingLessonDraft({
                            ...editingLessonDraft,
                            culturalNote: { ...editingLessonDraft.culturalNote, politeExpressions: updated },
                          });
                        }}
                        className="px-2 py-1 rounded border border-[#E5DEC9] text-xs"
                      />
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-white border border-red-200 space-y-2">
                  <p className="text-xs font-bold text-red-700">Nhóm 3: Lưu ý & Cấm kỵ văn hóa (3 lưu ý)</p>
                  {editingLessonDraft.culturalNote.cautionNotes?.map((note, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={note}
                      onChange={(e) => {
                        if (!editingLessonDraft.culturalNote?.cautionNotes) return;
                        const updated = [...editingLessonDraft.culturalNote.cautionNotes];
                        updated[idx] = e.target.value;
                        setEditingLessonDraft({
                          ...editingLessonDraft,
                          culturalNote: { ...editingLessonDraft.culturalNote, cautionNotes: updated },
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-red-200 text-xs text-red-900 bg-red-50/50"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetLessonDraft}
                className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition"
                title="Khôi phục về nội dung học liệu gốc mặc định"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục dữ liệu gốc</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveLessonDraft}
                  className="px-5 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#183629] flex items-center gap-1.5 shadow-md transition"
                >
                  <Check className="w-3.5 h-3.5 text-[#BC9B6B]" />
                  <span>Lưu thay đổi bài học</span>
                </button>
              </div>
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
