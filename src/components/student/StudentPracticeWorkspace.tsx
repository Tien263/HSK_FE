"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  User,
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
  Check,
  X,
  FileQuestion,
  HelpCircle,
  Zap,
  BookmarkCheck,
  ChevronRight,
  RefreshCw,
  Award,
  Headphones,
  PenTool,
  Compass,
  Unlock,
} from "lucide-react";
import { useCurriculumLessons } from "@/lib/use-curriculum";
import {
  getSavedKnowledge,
  removeSavedVocab,
  removeSavedGrammar,
  removeSavedQuestion,
  SavedKnowledgeStore,
  SavedVocabItem,
  SavedGrammarItem,
  SavedQuestionItem,
} from "@/lib/saved-knowledge-service";
import VocabPracticeSuite from "./practice/VocabPracticeSuite";
import GrammarPracticeSuite from "./practice/GrammarPracticeSuite";
import ComprehensivePracticeSuite from "./practice/ComprehensivePracticeSuite";
import ClassLeaderboardModal from "./ClassLeaderboardModal";
import AiDialogueRoleplayModal from "./AiDialogueRoleplayModal";
import AiWritingCheckerModal from "./AiWritingCheckerModal";
import VocabNotebookModal from "./VocabNotebookModal";
import MistakeNotebookModal from "./MistakeNotebookModal";
import DailyQuestsModal from "./DailyQuestsModal";
import HskRadarAnalyticsModal from "./HskRadarAnalyticsModal";
import AncientScrollPathway from "./AncientScrollPathway";
import AncientStationeryNotesModal from "./AncientStationeryNotesModal";
import VirtualStudyRoomModal from "./VirtualStudyRoomModal";
import {
  getMemoryStats,
  getWeeklyStudyMinutes,
  recordWeeklyStudyTime,
  recordStudyTime,
  getTodayStudySeconds,
  getWeeklyStudySeconds,
  formatStudyTimeVi,
  saveMemoryRecord,
  MemoryStatus,
} from "@/lib/memory-review-service";
import {
  Calendar,
  Target,
  BrainCircuit,
  ListOrdered,
  Clock3,
  TrendingUp,
} from "lucide-react";

export type PracticeSubMode = "vocab" | "grammar" | "comprehensive" | "game" | "saved" | "wrong";

interface StudentPracticeWorkspaceProps {
  currentUser?: any;
  onNavigateToTab?: (tab: string) => void;
  classesCount?: number;
  myClasses?: any[];
  onOpenJoinModal?: () => void;
  activeHskLevel?: number;
  initialPracticeMode?: PracticeSubMode;
}

export default function StudentPracticeWorkspace({
  currentUser,
  onNavigateToTab,
  classesCount = 0,
  myClasses = [],
  onOpenJoinModal,
  activeHskLevel,
  initialPracticeMode = "vocab",
}: StudentPracticeWorkspaceProps) {
  // 1. Quản lý Chế độ học: "CLASS" (Theo Lớp của Cô) hoặc "SELF_STUDY" (Lộ trình Tự học HSK độc lập)
  const [learningTrack, setLearningTrack] = useState<"CLASS" | "SELF_STUDY">(() => {
    return myClasses.length > 0 ? "CLASS" : "SELF_STUDY";
  });

  // 2. Cấp độ HSK khi tự học độc lập (HSK 1 đến HSK 7-9)
  const [selfStudyHskLevel, setSelfStudyHskLevel] = useState<number>(activeHskLevel || 1);

  useEffect(() => {
    if (activeHskLevel) {
      setSelfStudyHskLevel(activeHskLevel);
    }
  }, [activeHskLevel]);

  // 3. Quản lý lớp học được chọn khi ở chế độ CLASS
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return myClasses[0]?.id || "";
  });

  useEffect(() => {
    if (myClasses.length > 0 && (!selectedClassId || !myClasses.some((c) => c.id === selectedClassId))) {
      setSelectedClassId(myClasses[0].id);
    }
  }, [myClasses, selectedClassId]);

  const activeClass = useMemo(() => {
    if (learningTrack === "SELF_STUDY") return null;
    return myClasses.find((c) => c.id === selectedClassId) || myClasses[0] || null;
  }, [learningTrack, myClasses, selectedClassId]);

  const currentHskLevel = useMemo(() => {
    if (learningTrack === "SELF_STUDY") return selfStudyHskLevel;
    return activeClass?.level || activeHskLevel || 1;
  }, [learningTrack, selfStudyHskLevel, activeClass, activeHskLevel]);

  // Active sub-mode: "vocab" | "grammar" | "game" | "wrong"
  const [activeMode, setActiveMode] = useState<PracticeSubMode>(initialPracticeMode);

  useEffect(() => {
    if (initialPracticeMode) {
      setActiveMode(initialPracticeMode);
    }
  }, [initialPracticeMode]);

  // DB published lessons for active class
  const [dbLessons, setDbLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Official fallback curriculum lessons
  const { lessons: officialLessons } = useCurriculumLessons(currentHskLevel);

  const [selectedPracticeLesson, setSelectedPracticeLesson] = useState<number>(1);

  // 4. Tiến trình mở khóa tự học (Self-Study Progression)
  const [selfUnlockedLessons, setSelfUnlockedLessons] = useState<number[]>([1]);

  // Đọc danh sách bài đã mở khóa từ LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const key = `hsk_self_unlocked_lvl_${currentHskLevel}_${currentUser?.id || "guest"}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelfUnlockedLessons(parsed);
            return;
          }
        }
        setSelfUnlockedLessons([1]);
        localStorage.setItem(key, JSON.stringify([1]));
      } catch (e) {
        setSelfUnlockedLessons([1]);
      }
    }
  }, [currentHskLevel, currentUser?.id]);

  // Hàm mở khóa bài tiếp theo trong Tự học
  const handleUnlockNextLesson = (nextLessonNumber: number) => {
    if (typeof window !== "undefined") {
      const key = `hsk_self_unlocked_lvl_${currentHskLevel}_${currentUser?.id || "guest"}`;
      const updated = Array.from(new Set([...selfUnlockedLessons, nextLessonNumber])).sort((a, b) => a - b);
      setSelfUnlockedLessons(updated);
      try {
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {}

      setCurrentXpVal((prev) => prev + 25);
      setSelectedPracticeLesson(nextLessonNumber);
      setActiveCardIndex(0);
      setShowCardMeaning(false);
      setQuizSelectedOption(null);
      setQuizIsAnswered(false);
    }
  };

  // Mở toàn bộ bài của cấp HSK này
  const handleUnlockAllLessons = () => {
    if (typeof window !== "undefined" && officialLessons.length > 0) {
      const allNumbers = officialLessons.map((l) => l.number);
      setSelfUnlockedLessons(allNumbers);
      const key = `hsk_self_unlocked_lvl_${currentHskLevel}_${currentUser?.id || "guest"}`;
      try {
        localStorage.setItem(key, JSON.stringify(allNumbers));
      } catch (e) {}
    }
  };

  // State Quản lý Mức độ Ghi nhớ & Thống kê học tập
  const [memoryStats, setMemoryStats] = useState(() => getMemoryStats(currentUser?.id));
  const [weeklyMinutes, setWeeklyMinutes] = useState(() => getWeeklyStudyMinutes(currentUser?.id));
  const [currentStreakVal, setCurrentStreakVal] = useState<number>(currentUser?.streakDays || 1);
  const [currentXpVal, setCurrentXpVal] = useState<number>(currentUser?.totalXp || 50);

  // Đồng bộ streak và XP realtime từ CSDL
  useEffect(() => {
    async function syncStreak() {
      try {
        const res = await fetch("/api/v1/my/summary");
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.student?.streakDays) {
            setCurrentStreakVal(json.data.student.streakDays);
          }
          if (json?.data?.student?.totalXp !== undefined) {
            setCurrentXpVal(json.data.student.totalXp);
          }
        }
      } catch (err) {}
    }
    syncStreak();
  }, [currentUser?.id]);

  // Thời gian học thực tế hôm nay & tuần này (tính theo giây, hiển thị phút/giờ động)
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [todayStudySec, setTodayStudySec] = useState<number>(0);
  const [weeklyStudySec, setWeeklyStudySec] = useState<number>(0);

  const refreshMemoryStats = useCallback(() => {
    setMemoryStats(getMemoryStats(currentUser?.id));
    setWeeklyMinutes(getWeeklyStudyMinutes(currentUser?.id));
    setTodayStudySec(getTodayStudySeconds(currentUser?.id));
    setWeeklyStudySec(getWeeklyStudySeconds(currentUser?.id));
  }, [currentUser?.id]);

  // Ghi nhận thời gian luyện tập thực tế mỗi 3 giây và cập nhật realtime
  useEffect(() => {
    setIsMounted(true);
    setTodayStudySec(getTodayStudySeconds(currentUser?.id));
    setWeeklyStudySec(getWeeklyStudySeconds(currentUser?.id));

    const timer = setInterval(() => {
      recordStudyTime(3, currentUser?.id);
      setTodayStudySec(getTodayStudySeconds(currentUser?.id));
      setWeeklyStudySec(getWeeklyStudySeconds(currentUser?.id));
      setWeeklyMinutes(getWeeklyStudyMinutes(currentUser?.id));
    }, 3000);
    return () => clearInterval(timer);
  }, [currentUser?.id]);

  // ==========================================
  // STATE CHO MODE 1: LUYỆN TỪ VỰNG (FLASHCARD)
  // ==========================================
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [showCardMeaning, setShowCardMeaning] = useState<boolean>(false);
  const [vocabQuizMode, setVocabQuizMode] = useState<boolean>(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizIsAnswered, setQuizIsAnswered] = useState<boolean>(false);
  const [vocabFilterState, setVocabFilterState] = useState<"ALL" | MemoryStatus>("ALL");

  // ==========================================
  // STATE CHO MODE 3: GAME PHẢN XẠ HSK (10s)
  // ==========================================
  const [gameState, setGameState] = useState<"READY" | "PLAYING" | "ENDED">("READY");
  const [gameQuestionIdx, setGameQuestionIdx] = useState<number>(0);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameCombo, setGameCombo] = useState<number>(0);
  const [gameTimer, setGameTimer] = useState<number>(10);
  const [gameSelectedAnswer, setGameSelectedAnswer] = useState<string | null>(null);
  const [gameEarnedXp, setGameEarnedXp] = useState<number | null>(null);
  const [savingGameResult, setSavingGameResult] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================
    // ==========================================
  // STATE CHO MODE 5: KIẾN THỨC ĐÃ LƯU (TỪ VỰNG, NGỮ PHÁP, CÂU HỎI)
  // ==========================================
  const [savedStore, setSavedStore] = useState<SavedKnowledgeStore>({ vocabs: [], grammars: [], questions: [] });
  const [savedSubTab, setSavedSubTab] = useState<"vocabs" | "grammars" | "questions">("vocabs");
  const [selectedSavedVocabIds, setSelectedSavedVocabIds] = useState<string[]>([]);
  const [selectedSavedGrammarIds, setSelectedSavedGrammarIds] = useState<string[]>([]);
  const [selectedSavedQuestionIds, setSelectedSavedQuestionIds] = useState<string[]>([]);
  const [isReviewingSelected, setIsReviewingSelected] = useState<boolean>(false);
  const [reviewCurrentIndex, setReviewCurrentIndex] = useState<number>(0);
  const [reviewShowAnswer, setReviewShowAnswer] = useState<boolean>(false);
  const [reviewQuizSelected, setReviewQuizSelected] = useState<string | null>(null);

  const reloadSavedKnowledge = useCallback(() => {
    setSavedStore(getSavedKnowledge(currentUser?.id));
  }, [currentUser?.id]);

  useEffect(() => {
    reloadSavedKnowledge();
    const handleUpdate = () => reloadSavedKnowledge();
    window.addEventListener("saved_knowledge_updated", handleUpdate);
    return () => window.removeEventListener("saved_knowledge_updated", handleUpdate);
  }, [reloadSavedKnowledge]);

  // STATE CHO MODE 4: SỔ CÂU HỎI SAI & LUYỆN LẠI
  // ==========================================
  const [wrongQuestions, setWrongQuestions] = useState<any[]>([]);
  const [loadingWrongQuestions, setLoadingWrongQuestions] = useState<boolean>(false);
  const [retrySelectedAnswer, setRetrySelectedAnswer] = useState<Record<string, string>>({});
  const [retryResult, setRetryResult] = useState<Record<string, "CORRECT" | "INCORRECT">>({});
  const [submittingRetry, setSubmittingRetry] = useState<Record<string, boolean>>({});
  const [retrySuccessMsg, setRetrySuccessMsg] = useState<Record<string, string>>({});
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showAiDialogueModal, setShowAiDialogueModal] = useState<boolean>(false);
  const [showAiWritingModal, setShowAiWritingModal] = useState<boolean>(false);
  const [showVocabNotebookModal, setShowVocabNotebookModal] = useState<boolean>(false);
  const [showMistakeNotebookModal, setShowMistakeNotebookModal] = useState<boolean>(false);
  const [showDailyQuestsModal, setShowDailyQuestsModal] = useState<boolean>(false);
  const [showHskRadarModal, setShowHskRadarModal] = useState<boolean>(false);
  const [showStationeryNotesModal, setShowStationeryNotesModal] = useState<boolean>(false);
  const [showVirtualStudyRoomModal, setShowVirtualStudyRoomModal] = useState<boolean>(false);

  // Fetch Class Lessons
  const fetchLessons = useCallback(async () => {
    if (!activeClass?.id) {
      setDbLessons([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const studentId = currentUser?.id || "";
      const res = await fetch(`/api/v1/classes/${activeClass.id}/lessons?studentId=${studentId}`, {
        headers: studentId ? { "x-user-id": studentId } : {},
      });
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
  }, [activeClass?.id, currentUser?.id]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Fetch Wrong Questions
  const fetchWrongQuestions = useCallback(async () => {
    if (!currentUser?.id && !currentUser?.username) return;
    try {
      setLoadingWrongQuestions(true);
      const res = await fetch(
        `/api/v1/my/wrong-questions?userId=${currentUser?.id || ""}&username=${currentUser?.username || ""}`,
        {
          headers: currentUser?.id ? { "x-user-id": currentUser.id } : {},
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setWrongQuestions(data.items);
        }
      }
    } catch (e) {
      console.warn("fetchWrongQuestions error:", e);
    } finally {
      setLoadingWrongQuestions(false);
    }
  }, [currentUser?.id, currentUser?.username]);

  useEffect(() => {
    if (activeMode === "wrong") {
      fetchWrongQuestions();
    }
  }, [activeMode, fetchWrongQuestions]);

  const streak = currentStreakVal || currentUser?.streakDays || 1;
  const xp = currentXpVal || currentUser?.totalXp || 50;

  // Resolved Lesson Content for Selected Lesson
  const currentOfficialLesson = useMemo(() => {
    return officialLessons.find((l) => l.number === selectedPracticeLesson) || officialLessons[0];
  }, [officialLessons, selectedPracticeLesson]);

  const currentDbLesson = useMemo(() => {
    return dbLessons.find((l) => l.lessonNumber === selectedPracticeLesson);
  }, [dbLessons, selectedPracticeLesson]);

  // Quyền truy cập bài học:
  // - Ở chế độ Tự học: Mở khóa theo tiến trình cuốn chiếu của học sinh
  // - Ở chế độ Lớp học: Kiểm tra theo danh sách bài Giáo viên đã xuất bản (PUBLISHED)
  const isLessonUnlocked = useMemo(() => {
    if (learningTrack === "SELF_STUDY") {
      return selfUnlockedLessons.includes(selectedPracticeLesson);
    }
    if (!activeClass) return true;
    return dbLessons.some((l) => l.lessonNumber === selectedPracticeLesson);
  }, [learningTrack, selfUnlockedLessons, selectedPracticeLesson, activeClass, dbLessons]);

  // Danh sách từ vựng: Ưu tiên từ vựng cô giáo đã tùy biến cho bài học này, nếu chưa có thì lấy từ vựng chuẩn của bài
  const vocabList = useMemo(() => {
    if (currentDbLesson?.selectedVocabs && Array.isArray(currentDbLesson.selectedVocabs)) {
      return currentDbLesson.selectedVocabs;
    }
    return currentOfficialLesson?.vocabList || (currentOfficialLesson as any)?.vocabularies || [];
  }, [currentDbLesson, currentOfficialLesson]);

  // Danh sách ngữ pháp: Ưu tiên điểm ngữ pháp cô giáo đã chọn cho bài học này
  const grammarList = useMemo(() => {
    if (currentDbLesson?.selectedGrammars && Array.isArray(currentDbLesson.selectedGrammars)) {
      return currentDbLesson.selectedGrammars;
    }
    return currentOfficialLesson?.grammarList || (currentOfficialLesson as any)?.grammarPoints || [];
  }, [currentDbLesson, currentOfficialLesson]);

  const currentVocab = vocabList[activeCardIndex] || vocabList[0];

  // Phát âm chữ Hán
  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Tạo câu hỏi trắc nghiệm kiểm tra nhanh cho thẻ từ vựng hiện tại
  const vocabQuizOptions = useMemo(() => {
    if (!currentVocab || vocabList.length < 2) return [];
    const correctMeaning = currentVocab.meaningVi || currentVocab.meaning;
    const others = vocabList
      .filter((v: any) => (v.meaningVi || v.meaning) !== correctMeaning)
      .map((v: any) => v.meaningVi || v.meaning);

    // Xáo trộn 3 đáp án nhiễu
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    const all = [correctMeaning, ...shuffledOthers].sort(() => 0.5 - Math.random());
    return all;
  }, [currentVocab, vocabList]);

  // Xử lý đếm ngược Game Phản Xạ 10s
  useEffect(() => {
    if (gameState === "PLAYING") {
      if (gameTimer > 0) {
        timerRef.current = setTimeout(() => {
          setGameTimer((prev) => prev - 1);
        }, 1000);
      } else {
        // Hết giờ -> Chuyển câu kế tiếp
        handleGameNextQuestion(false);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, gameTimer]);

  const handleStartGame = () => {
    setGameState("PLAYING");
    setGameQuestionIdx(0);
    setGameScore(0);
    setGameCombo(0);
    setGameTimer(10);
    setGameSelectedAnswer(null);
    setGameEarnedXp(null);
  };

  const finishGame = async (finalScore: number, maxComboVal: number) => {
    setGameState("ENDED");
    if (!currentUser?.username) return;
    try {
      setSavingGameResult(true);
      const res = await fetch("/api/v1/my/games/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser.username,
          score: finalScore,
          maxCombo: Math.max(1, maxComboVal),
          gameType: "SPEED_REFLEX",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.earnedXp) {
          setGameEarnedXp(data.earnedXp);
        }
      }
    } catch (e) {
      console.warn("finishGame error:", e);
    } finally {
      setSavingGameResult(false);
    }
  };

  const handleGameAnswer = (answer: string, correctAnswer: string) => {
    if (gameSelectedAnswer) return; // Đã trả lời
    setGameSelectedAnswer(answer);
    const isCorrect = answer === correctAnswer;
    let newScore = gameScore;
    let newCombo = gameCombo;

    if (isCorrect) {
      newScore = gameScore + 10 + gameCombo * 2;
      newCombo = gameCombo + 1;
      setGameScore(newScore);
      setGameCombo(newCombo);
    } else {
      setGameCombo(0);
      newCombo = 0;
      // Tự động lưu từ bị sai vào danh sách yếu để học sinh ôn lại
      const curQ = vocabList[gameQuestionIdx];
      if (curQ) {
        saveMemoryRecord(
          {
            hanzi: curQ.hanzi,
            pinyin: curQ.pinyin,
            meaningVi: curQ.meaningVi || curQ.meaning || "",
            lessonNumber: selectedPracticeLesson,
            hskLevel: currentHskLevel,
          },
          "NOT_REMEMBERED",
          currentUser?.id
        );
        refreshMemoryStats();
      }
    }

    setTimeout(() => {
      handleGameNextQuestion(isCorrect, newScore, newCombo);
    }, 1200);
  };

  const handleGameNextQuestion = (
    prevCorrect: boolean,
    currentTotalScore = gameScore,
    currentMaxCombo = gameCombo
  ) => {
    // Nếu hết giờ mà chưa chọn thì cũng lưu từ yếu
    if (!prevCorrect && !gameSelectedAnswer) {
      const curQ = vocabList[gameQuestionIdx];
      if (curQ) {
        saveMemoryRecord(
          {
            hanzi: curQ.hanzi,
            pinyin: curQ.pinyin,
            meaningVi: curQ.meaningVi || curQ.meaning || "",
            lessonNumber: selectedPracticeLesson,
            hskLevel: currentHskLevel,
          },
          "NOT_REMEMBERED",
          currentUser?.id
        );
        refreshMemoryStats();
      }
    }

    const totalQuestions = Math.min(vocabList.length, 10);
    if (gameQuestionIdx + 1 >= totalQuestions) {
      finishGame(currentTotalScore, currentMaxCombo);
    } else {
      setGameQuestionIdx((prev) => prev + 1);
      setGameTimer(10);
      setGameSelectedAnswer(null);
    }
  };

  // Xử lý Luyện lại câu hỏi sai (Interactive Retry)
  const handleRetryAnswer = async (item: any, selectedOption: string) => {
    if (retrySelectedAnswer[item.id] || submittingRetry[item.id]) return;
    const isCorrect = selectedOption.trim() === String(item.correctAnswer || "").trim();

    setRetrySelectedAnswer((prev) => ({ ...prev, [item.id]: selectedOption }));
    setRetryResult((prev) => ({ ...prev, [item.id]: isCorrect ? "CORRECT" : "INCORRECT" }));
    setSubmittingRetry((prev) => ({ ...prev, [item.id]: true }));

    try {
      const res = await fetch("/api/v1/my/wrong-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wrongQuestionId: item.id,
          isCorrect,
          username: currentUser?.username || "student",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isMastered) {
          setRetrySuccessMsg((prev) => ({
            ...prev,
            [item.id]: "🎉 Xuất sắc! Bạn đã đúng liên tiếp 3/3 lần và hoàn thành câu này (+20 XP).",
          }));
          setTimeout(() => {
            setWrongQuestions((prev) => prev.filter((w) => w.id !== item.id));
          }, 2000);
        } else if (data.item) {
          setWrongQuestions((prev) =>
            prev.map((w) =>
              w.id === item.id
                ? {
                    ...w,
                    consecutiveRight: data.item.consecutiveRight,
                    wrongCount: data.item.wrongCount,
                  }
                : w
            )
          );
        }
      }
    } catch (e) {
      console.warn("handleRetryAnswer error:", e);
    } finally {
      setSubmittingRetry((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  // 1. Trạng thái rỗng: Học sinh chưa tham gia lớp nào
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

  // 2. Trạng thái chờ duyệt
  const isPendingApproval =
    activeClass?.isPendingApproval === true ||
    activeClass?.enrollmentStatus === "PENDING" ||
    activeClass?.statusText === "Chờ duyệt";

  if (isPendingApproval) {
    return (
      <div className="bg-[#FFFCF6] border border-amber-200/80 rounded-3xl p-10 sm:p-14 text-center shadow-2xs space-y-4 max-w-2xl mx-auto my-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center mx-auto shadow-2xs">
          <Clock className="w-8 h-8 text-amber-700 animate-pulse" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold">
            Đang chờ duyệt vào lớp
          </span>
          <h3 className="font-serif font-bold text-xl text-[#17382F] mt-2">
            Phòng luyện tập sẽ mở khóa khi cô giáo duyệt
          </h3>
          <p className="text-xs text-[#6B766D] leading-relaxed max-w-md mx-auto">
            Bạn đã gửi yêu cầu tham gia lớp <strong>{activeClass.name}</strong>. Sau khi cô giáo phê duyệt, toàn bộ từ vựng, ngữ pháp và game phản xạ của lớp sẽ tự động mở khóa nhé!
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => onNavigateToTab?.("classes")}
            className="px-6 py-2.5 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Xem danh sách lớp của tôi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DEC9]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#204434] flex items-center gap-2">
            <span>Phòng luyện tập HSK</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-semibold border border-[#BC9B6B]/40 font-sans">
              HSK {currentHskLevel}.0 · {activeClass.name}
            </span>
          </h1>
          <p className="text-xs text-[#315E48] mt-1">
            Luyện phản xạ từ vựng, nắm chắc ngữ pháp và làm bài tập củng cố theo từng bài học trong lớp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Nhóm 1: Luyện AI & Thi thử (Chủ lực) */}
          <div className="inline-flex items-center rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/35 p-1 shadow-2xs">
            <button
              onClick={() => setShowAiDialogueModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#204434] text-xs font-semibold transition cursor-pointer"
              title="Luyện khẩu ngữ hội thoại 2 chiều và trò chuyện tự do có Từ Điển chấm điểm"
            >
              <Headphones className="w-3.5 h-3.5 text-[#BC9B6B]" />
              <span>Khẩu ngữ AI</span>
            </button>
            <div className="w-px h-4 bg-[#E5DEC9]" />
            <button
              onClick={() => setShowAiWritingModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#204434] text-xs font-semibold transition cursor-pointer"
              title="Sửa lỗi ngữ pháp, trật tự từ và chấm đoạn văn tiếng Trung kết nối Từ Điển"
            >
              <PenTool className="w-3.5 h-3.5 text-[#8F6D3B]" />
              <span>Sửa viết AI</span>
            </button>
            <div className="w-px h-4 bg-[#E5DEC9]" />
            <Link
              href="/s/mock-exam"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#204434] text-xs font-semibold transition cursor-pointer"
              title="Vào phòng thi thử mô phỏng HSK chuẩn quốc tế"
            >
              <Award className="w-3.5 h-3.5 text-[#8F6D3B]" />
              <span>Thi thử HSK</span>
            </Link>
          </div>

          {/* Nhóm 2: Sổ tay & Đánh giá năng lực */}
          <div className="inline-flex items-center rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/35 p-1 shadow-2xs">
            <button
              onClick={() => setShowVocabNotebookModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#204434] text-xs font-semibold transition cursor-pointer"
              title="Mở Sổ tay từ vựng cá nhân & Thẻ Flashcard SRS Leitner 5 hộp"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#204434]" />
              <span>Sổ từ vựng</span>
            </button>
            <div className="w-px h-4 bg-[#E5DEC9]" />
            <button
              onClick={() => setShowMistakeNotebookModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#9D493E] text-xs font-semibold transition cursor-pointer"
              title="Xem các câu hỏi đã làm sai và chế độ luyện phục hồi"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#9D493E]" />
              <span>Sổ câu sai</span>
            </button>
            <div className="w-px h-4 bg-[#E5DEC9]" />
            <button
              onClick={() => setShowHskRadarModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#204434] text-xs font-semibold transition cursor-pointer"
              title="Biểu đồ đa giác Radar 5 kỹ năng và dự đoán tỷ lệ đỗ HSK"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#315E48]" />
              <span>Radar HSK</span>
            </button>
            <div className="w-px h-4 bg-[#E5DEC9]" />
            <button
              onClick={() => setShowStationeryNotesModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#8F6D3B] text-xs font-semibold transition cursor-pointer"
              title="Mở Thư phòng Take Note: Viết bằng 4 loại giấy cổ & mực thư pháp"
            >
              <PenTool className="w-3.5 h-3.5 text-[#8F6D3B]" />
              <span>Bút giấy Cổ</span>
            </button>
            <div className="w-px h-4 bg-[#E5DEC9]" />
            <button
              onClick={() => setShowVirtualStudyRoomModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#204434] text-xs font-semibold transition cursor-pointer"
              title="Vào Vân Tự Tập Thất: Phòng tự học ảo cổ phong Pomodoro 25p cùng đồng môn"
            >
              <span className="text-sm">🏮</span>
              <span>Vân Tự Tập Thất</span>
            </button>
          </div>

          {/* Nhóm 3: Chuỗi Streak & Bảng vàng */}
          <div className="inline-flex items-center rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/35 p-1 shadow-2xs">
            <button
              onClick={() => setShowDailyQuestsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#204434] text-[#FFFCF6] text-xs font-semibold hover:bg-[#183629] transition cursor-pointer shadow-2xs"
              title="Xem nhiệm vụ hàng ngày và chuỗi ngày học Streak"
            >
              <Flame className="w-3.5 h-3.5 text-[#BC9B6B] fill-[#BC9B6B]" />
              <span>{streak} ngày liên tục</span>
            </button>
            <div className="w-px h-4 bg-[#E5DEC9]" />
            <button
              onClick={() => setShowLeaderboard(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#8F6D3B] text-xs font-semibold transition cursor-pointer"
              title="Xem Bảng Vàng Thi Đua"
            >
              <Trophy className="w-3.5 h-3.5 text-[#BC9B6B]" />
              <span>+{xp.toLocaleString()} XP</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* PHẦN 1: THỐNG KÊ HỌC TẬP (5 CHỈ SỐ QUAN TRỌNG)                      */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Chỉ số 1: Bài đã học */}
        <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8F6D3B]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Bài đã học</span>
            <BookOpen className="w-4 h-4 text-[#8F6D3B]" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#204434]">
              {dbLessons.length > 0 ? dbLessons.length : 1}
            </div>
            <p className="text-[10px] text-[#315E48]">Bài học HSK trong lớp</p>
          </div>
        </div>

        {/* Chỉ số 2: Cần ôn hôm nay */}
        <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-amber-300/80 shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cần ôn hôm nay</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-amber-800">
              {memoryStats.dueTodayCount}
            </div>
            <p className="text-[10px] text-amber-900/80">Kiến thức đến hạn ôn lại</p>
          </div>
        </div>

        {/* Chỉ số 3: Chuỗi học tập */}
        <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-orange-200 shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-orange-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Chuỗi học tập</span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#204434]">
              {streak} <span className="text-xs font-sans font-normal text-[#315E48]">ngày</span>
            </div>
            <p className="text-[10px] text-orange-700 font-semibold">Học liên tục mỗi ngày</p>
          </div>
        </div>

        {/* Chỉ số 4: Tỷ lệ đúng */}
        <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-emerald-300/80 shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tỷ lệ đúng</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-emerald-800">
              {memoryStats.masteryPercentage > 0 ? memoryStats.masteryPercentage : 85}%
            </div>
            <p className="text-[10px] text-emerald-900/80">Mức độ trả lời chuẩn xác</p>
          </div>
        </div>

        {/* Chỉ số 5: Thời gian học (Hôm nay & Tuần này động 100%) */}
        <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-2xs space-y-1.5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[#8F6D3B]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Thời gian học</span>
            <Clock3 className="w-4 h-4 text-[#8F6D3B]" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#204434]">
              {isMounted ? formatStudyTimeVi(todayStudySec) : "0 phút"}
            </div>
            <p className="text-[10px] text-[#315E48]">
              Hôm nay • Tuần này: <span className="font-semibold">{isMounted ? formatStudyTimeVi(weeklyStudySec) : "0 phút"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* BỘ CHUYỂN ĐỔI CHẾ ĐỘ: HỌC THEO LỚP HOẶC TỰ HỌC ĐỘC LẬP */}
      <div className="bg-[#FFFCF6] border border-[#BC9B6B]/60 rounded-3xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#8F6D3B]" />
              <span>Phương thức học tập:</span>
            </span>
            <div className="inline-flex rounded-xl bg-[#FAF7F0] p-1 border border-[#E5DEC9]">
              {myClasses && myClasses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLearningTrack("CLASS")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    learningTrack === "CLASS"
                      ? "bg-[#204434] text-white shadow-xs"
                      : "text-[#315E48] hover:text-[#204434]"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Học theo Lớp ({myClasses.length})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setLearningTrack("SELF_STUDY")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  learningTrack === "SELF_STUDY"
                    ? "bg-[#204434] text-white shadow-xs"
                    : "text-[#315E48] hover:text-[#204434]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
                <span>🌿 Lộ trình Tự học HSK</span>
              </button>
            </div>
          </div>

          {/* Nút hành động phụ */}
          <div className="flex items-center gap-2">
            {learningTrack === "CLASS" && onOpenJoinModal && (
              <button
                type="button"
                onClick={onOpenJoinModal}
                className="px-3 py-1 rounded-xl bg-[#FAF7F0] hover:bg-[#E5DEC9] border border-[#BC9B6B] text-[11px] font-bold text-[#8F6D3B] transition cursor-pointer"
              >
                + Vào lớp mới
              </button>
            )}
            {learningTrack === "SELF_STUDY" && (
              <button
                type="button"
                onClick={handleUnlockAllLessons}
                className="px-3 py-1 rounded-xl bg-[#FAF7F0] hover:bg-[#E5DEC9] border border-[#BC9B6B] text-[11px] font-bold text-[#8F6D3B] transition cursor-pointer flex items-center gap-1"
                title="Bấm nếu bạn đã có nền tảng và muốn tự do mở toàn bộ bài học của cấp HSK này"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Mở toàn bộ bài</span>
              </button>
            )}
          </div>
        </div>

        {/* PHÂN VÙNG 1: KHI Ở CHẾ ĐỘ HỌC THEO LỚP CỦA THẦY CÔ */}
        {learningTrack === "CLASS" && myClasses.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#204434]">Chọn lớp học cần luyện:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#BC9B6B] text-xs font-bold text-[#204434] cursor-pointer shadow-2xs focus:outline-hidden"
              >
                {myClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} (HSK {cls.level || 1}) {cls.teacher?.name ? `· GV: ${cls.teacher.name}` : ""}
                  </option>
                ))}
              </select>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#204434] text-white font-bold">
                HSK {currentHskLevel}
              </span>
            </div>
            <span className="text-slate-500">
              Tiến độ lớp: <strong className="text-[#204434]">{dbLessons.length} bài đã mở</strong> / {officialLessons.length} bài
            </span>
          </div>
        )}

        {/* PHÂN VÙNG 2: KHI Ở CHẾ ĐỘ TỰ HỌC HSK ĐỘC LẬP (TỰ DO VƯỢT ẢI) */}
        {learningTrack === "SELF_STUDY" && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
                <span>Chọn cấp độ HSK muốn tự học:</span>
              </span>
              <div className="text-[11px] text-[#8F6D3B] font-bold">
                Đã chinh phục: {selfUnlockedLessons.length} / {officialLessons.length} bài (
                {Math.round((selfUnlockedLessons.length / Math.max(officialLessons.length, 1)) * 100)}%)
              </div>
            </div>

            {/* 7 Tabs Cấp độ HSK 1 - HSK 7-9 */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {[
                { lvl: 1, label: "HSK 1" },
                { lvl: 2, label: "HSK 2" },
                { lvl: 3, label: "HSK 3" },
                { lvl: 4, label: "HSK 4" },
                { lvl: 5, label: "HSK 5" },
                { lvl: 6, label: "HSK 6" },
                { lvl: 7, label: "HSK 7–9" },
              ].map(({ lvl, label }) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setSelfStudyHskLevel(lvl);
                    setSelectedPracticeLesson(1);
                    setActiveCardIndex(0);
                    setShowCardMeaning(false);
                  }}
                  className={`py-2 rounded-xl text-center text-xs font-bold transition cursor-pointer border ${
                    selfStudyHskLevel === lvl
                      ? "bg-[#204434] text-white border-[#204434] shadow-xs scale-102"
                      : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#FAF7F0]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* BĂNG THƯ CUỘN CHIẾU CHỈ VƯỢT ẢI (IMPERIAL SCROLL PATHWAY) */}
            <AncientScrollPathway
              lessons={officialLessons}
              selectedLesson={selectedPracticeLesson}
              unlockedLessons={selfUnlockedLessons}
              onSelectLesson={(num) => {
                setSelectedPracticeLesson(num);
                setActiveCardIndex(0);
                setShowCardMeaning(false);
              }}
              hskLevel={currentHskLevel}
            />
          </div>
        )}
      </div>

      {/* Selector chọn bài học trong lớp & Tab chế độ luyện tập */}
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Bộ chọn bài học (Lesson Selector) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs font-bold text-[#204434] flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-[#8F6D3B]" />
            <span>Bài luyện tập:</span>
          </span>
          <select
            value={selectedPracticeLesson}
            onChange={(e) => {
              setSelectedPracticeLesson(Number(e.target.value));
              setActiveCardIndex(0);
              setShowCardMeaning(false);
              setQuizSelectedOption(null);
              setQuizIsAnswered(false);
              setGameState("READY");
            }}
            className="bg-[#FAF7F0] border border-[#BC9B6B]/50 rounded-xl px-3 py-1.5 text-xs font-bold text-[#204434] focus:outline-hidden cursor-pointer"
          >
            {officialLessons.map((ls) => {
              const isPub =
                learningTrack === "SELF_STUDY"
                  ? selfUnlockedLessons.includes(ls.number)
                  : dbLessons.some((dl) => dl.lessonNumber === ls.number);
              return (
                <option key={ls.number} value={ls.number}>
                  Bài {String(ls.number).padStart(2, "0")}: {ls.titleZh} ({ls.titleVi}) {isPub ? "✓ Đã mở" : "🔒 Chưa mở"}
                </option>
              );
            })}
          </select>
        </div>

        {/* PHẦN 2: NĂM TAB LUYỆN TẬP CHUYÊN SÂU */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F0] p-1 rounded-xl border border-[#E5DEC9] overflow-x-auto">
          {/* Tab 1: Luyện từ vựng */}
          <button
            onClick={() => {
              setActiveMode("vocab");
              setShowCardMeaning(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeMode === "vocab"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434] hover:bg-[#FAF7F0]"
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>1. Luyện từ vựng</span>
            <span className="text-[10px] opacity-80">({vocabList.length})</span>
          </button>

          {/* Tab 2: Luyện ngữ pháp */}
          <button
            onClick={() => setActiveMode("grammar")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeMode === "grammar"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434] hover:bg-[#FAF7F0]"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>2. Luyện ngữ pháp</span>
            <span className="text-[10px] opacity-80">({grammarList.length})</span>
          </button>

          {/* Tab 3: Ôn tập tổng hợp */}
          <button
            onClick={() => setActiveMode("comprehensive")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeMode === "comprehensive"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434] hover:bg-[#FAF7F0]"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-[#BC9B6B]" />
            <span>3. Ôn tập tổng hợp</span>
          </button>

          {/* Tab 4: Phản xạ nhanh (10s) */}
          <button
            onClick={() => {
              setActiveMode("game");
              setGameState("READY");
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeMode === "game"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434] hover:bg-[#FAF7F0]"
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>4. Phản xạ nhanh</span>
          </button>

          {/* Tab 5: Kiến thức đã lưu (thay thế Sổ câu hỏi sai theo yêu cầu người dùng) */}
          <button
            onClick={() => {
              setActiveMode("saved");
              setIsReviewingSelected(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeMode === "saved" || activeMode === "wrong"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434] hover:bg-[#FAF7F0]"
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>5. Kiến thức đã lưu</span>
            <span className="text-[10px] opacity-80">
              ({savedStore.vocabs.length + savedStore.grammars.length + savedStore.questions.length})
            </span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* THÔNG BÁO BÀI HỌC CHƯA ĐƯỢC MỞ QUYỀN (THEO LỚP HOẶC TỰ HỌC)         */}
      {/* =================================================================== */}
      {!isLessonUnlocked && (activeMode === "vocab" || activeMode === "grammar" || activeMode === "comprehensive" || activeMode === "game") && (
        <div className="py-14 px-6 text-center bg-[#FFFCF6] rounded-3xl border-2 border-dashed border-[#BC9B6B] max-w-lg mx-auto shadow-sm space-y-4 animate-fadeIn my-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-3xl border border-amber-200 shadow-inner">
            🔒
          </div>
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-xl text-[#204434]">
              Bài {selectedPracticeLesson} chưa được mở khóa
            </h3>
            {learningTrack === "SELF_STUDY" ? (
              <p className="text-xs text-[#315E48] leading-relaxed max-w-md mx-auto">
                Trong lộ trình Tự học HSK, các bài học sẽ tự động mở khóa theo nguyên tắc cuốn chiếu khi bạn hoàn thành bài học trước đó. Hoặc bạn có thể bấm &quot;Mở toàn bộ bài&quot; ở trên để tự do học nhé!
              </p>
            ) : (
              <p className="text-xs text-[#315E48] leading-relaxed max-w-md mx-auto">
                Lớp <strong>{activeClass?.name}</strong> (HSK {currentHskLevel}) hiện chỉ mở quyền luyện tập cho <strong>{dbLessons.length} bài</strong> đã được Thầy/Cô xuất bản. Các bài còn lại sẽ được Thầy/Cô mở dần theo tiến độ học trên lớp.
              </p>
            )}
          </div>

          {/* Danh sách các bài đã mở để bấm học ngay */}
          <div className="pt-2 flex flex-col items-center gap-2">
            <span className="text-xs text-[#8F6D3B] font-bold">Các bài bạn có thể luyện tập ngay:</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {(learningTrack === "SELF_STUDY"
                ? selfUnlockedLessons
                : dbLessons.map((l) => l.lessonNumber)
              ).map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setSelectedPracticeLesson(num);
                    setActiveCardIndex(0);
                    setShowCardMeaning(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  Bài {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. CHẾ ĐỘ 1: LUYỆN TỪ VỰNG CHUYÊN SÂU (6 DẠNG BÀI TẬP TƯƠNG TÁC)   */}
      {/* =================================================================== */}
      {isLessonUnlocked && activeMode === "vocab" && (
        <VocabPracticeSuite
          vocabList={vocabList}
          lessonTitleZh={currentOfficialLesson?.titleZh}
          lessonNumber={selectedPracticeLesson}
          hskLevel={currentHskLevel}
          studentId={currentUser?.id}
          handleSpeak={handleSpeak}
          onMemoryUpdated={refreshMemoryStats}
          initialFilter={vocabFilterState}
        />
      )}

      {/* =================================================================== */}
      {/* 3. CHẾ ĐỘ 3: ÔN TẬP TỔNG HỢP (TRỘN TỪ VỰNG & NGỮ PHÁP)             */}
      {/* =================================================================== */}
      {isLessonUnlocked && activeMode === "comprehensive" && (
        <ComprehensivePracticeSuite
          vocabList={vocabList}
          grammarList={grammarList}
          lessonTitleZh={currentOfficialLesson?.titleZh}
          lessonNumber={selectedPracticeLesson}
          handleSpeak={handleSpeak}
          studentId={currentUser?.id}
        />
      )}

      {/* =================================================================== */}
      {/* 2. CHẾ ĐỘ 2: LUYỆN NGỮ PHÁP (LÝ THUYẾT + BÀI TẬP 5 DẠNG TƯƠNG TÁC)   */}
      {/* =================================================================== */}
      {isLessonUnlocked && activeMode === "grammar" && (
        <GrammarPracticeSuite
          grammarList={grammarList}
          vocabList={vocabList}
          dialogueList={currentOfficialLesson?.dialogue || []}
          lessonTitleZh={currentOfficialLesson?.titleZh}
          lessonNumber={selectedPracticeLesson}
          hskLevel={currentHskLevel}
          studentId={currentUser?.id}
          handleSpeak={handleSpeak}
          customExercises={currentOfficialLesson?.grammarExercises}
        />
      )}

      {/* =================================================================== */}
      {/* 3. CHẾ ĐỘ 3: GAME PHẢN XẠ HSK (SPEED REFLEX CHALLENGE)             */}
      {/* =================================================================== */}
      {isLessonUnlocked && activeMode === "game" && (
        <div className="p-6 sm:p-10 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/50 shadow-sm space-y-6 max-w-2xl mx-auto text-center">
          {gameState === "READY" && (
            <div className="space-y-4 py-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-[#204434] text-white flex items-center justify-center mx-auto shadow-md">
                <Gamepad2 className="w-8 h-8 text-[#BC9B6B]" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-2xl text-[#204434]">
                  Game Phản Xạ Từ Vựng Siêu Tốc
                </h3>
                <p className="text-xs text-[#315E48] leading-relaxed max-w-md mx-auto">
                  Bạn có <strong>10 giây</strong> cho mỗi từ vựng của Bài {String(selectedPracticeLesson).padStart(2, "0")}. Chọn đúng càng nhanh, combo điểm và XP nhận được càng cao!
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleStartGame}
                  className="px-8 py-3.5 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-sm shadow-md inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Bắt đầu chơi ngay!</span>
                </button>
              </div>
            </div>
          )}

          {gameState === "PLAYING" && vocabList[gameQuestionIdx] && (
            <div className="space-y-5 animate-fadeIn">
              {/* Header game: Điểm, Combo, Đồng hồ 10s */}
              <div className="flex items-center justify-between text-xs font-bold text-[#204434] pb-3 border-b border-[#E5DEC9]">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B]">
                    Câu {gameQuestionIdx + 1} / {Math.min(vocabList.length, 10)}
                  </span>
                  {gameCombo > 1 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-extrabold animate-bounce">
                      Combo x{gameCombo}!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#BC9B6B]" />
                  <span>{gameScore} điểm</span>
                </div>
              </div>

              {/* Progress bar đếm ngược 10 giây */}
              <div className="w-full h-2 rounded-full bg-[#FAF7F0] overflow-hidden border border-[#E5DEC9]">
                <div
                  className="h-full bg-emerald-600 transition-all duration-1000 ease-linear"
                  style={{ width: `${(gameTimer / 10) * 100}%` }}
                />
              </div>

              {/* Chữ Hán câu hỏi */}
              <div className="py-6 space-y-2">
                <div className="font-serif font-bold text-5xl text-[#204434] tracking-wide">
                  {vocabList[gameQuestionIdx].hanzi}
                </div>
                <div className="text-sm font-mono font-bold text-[#8F6D3B]">
                  {vocabList[gameQuestionIdx].pinyin}
                </div>
              </div>

              {/* 4 Lựa chọn trả lời */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                {(() => {
                  const currentQ = vocabList[gameQuestionIdx];
                  const correct = currentQ.meaningVi || currentQ.meaning;
                  const others = vocabList
                    .filter((v: any) => (v.meaningVi || v.meaning) !== correct)
                    .map((v: any) => v.meaningVi || v.meaning);
                  const shuffled = [correct, ...others.slice(0, 3)].sort();

                  return shuffled.map((opt: string, idx: number) => {
                    const isSelected = gameSelectedAnswer === opt;
                    const isCorrect = opt === correct;
                    let style = "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]";
                    if (gameSelectedAnswer) {
                      if (isCorrect) style = "bg-emerald-600 text-white border-emerald-600";
                      else if (isSelected) style = "bg-rose-500 text-white border-rose-500";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={!!gameSelectedAnswer}
                        onClick={() => handleGameAnswer(opt, correct)}
                        className={`p-3.5 rounded-xl border text-center transition cursor-pointer shadow-2xs ${style}`}
                      >
                        {opt}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {gameState === "ENDED" && (
            <div className="space-y-4 py-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center mx-auto shadow-md">
                <Trophy className="w-8 h-8 text-emerald-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-2xl text-[#204434]">
                  Hoàn thành Thử Thách Phản Xạ!
                </h3>
                <p className="text-sm font-semibold text-[#8F6D3B]">
                  Tổng điểm phản xạ đạt được: <strong>{gameScore} điểm</strong>
                </p>
                {gameEarnedXp && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Đã nhận +{gameEarnedXp} XP vào hồ sơ học tập!</span>
                  </div>
                )}
                <p className="text-xs text-[#315E48]">
                  Chúc mừng bạn! Phản xạ từ vựng của bạn cho Bài {selectedPracticeLesson} đang tiến bộ rất nhanh.
                </p>
              </div>
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleStartGame}
                  className="px-6 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-xs shadow-xs inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Chơi lại bài này</span>
                </button>
                <button
                  onClick={() => setActiveMode("vocab")}
                  className="px-5 py-2.5 rounded-xl border border-[#E5DEC9] bg-white text-[#204434] font-bold text-xs hover:bg-[#FAF7F0] transition cursor-pointer"
                >
                  Quay lại lật thẻ từ vựng
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. CHẾ ĐỘ 5: KIẾN THỨC ĐÃ LƯU (SAVED KNOWLEDGE - 3 PHÂN MỤC)        */}
      {/* =================================================================== */}
      {(activeMode === "saved" || activeMode === "wrong") && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header vùng kiến thức đã lưu */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E5DEC9]">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#204434] flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-amber-600" />
                <span>Kho Kiến Thức Đã Lưu Của Bạn</span>
              </h3>
              <p className="text-xs text-[#315E48] mt-0.5">
                Xem lại từ vựng, ngữ pháp và các câu hỏi bạn đã đánh dấu lưu trong quá trình học. Chọn các mục để ôn tập tổng hợp.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={reloadSavedKnowledge}
                className="p-2 rounded-xl border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Làm mới danh sách"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* 3 PHÂN MỤC TABS: TỪ VỰNG - NGỮ PHÁP - CÂU HỎI */}
          <div className="flex items-center gap-2 border-b border-[#E5DEC9] pb-2 overflow-x-auto">
            <button
              onClick={() => {
                setSavedSubTab("vocabs");
                setIsReviewingSelected(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                savedSubTab === "vocabs"
                  ? "bg-[#204434] text-white shadow-xs"
                  : "bg-white border border-[#E5DEC9] text-[#315E48] hover:bg-[#FAF7F0]"
              }`}
            >
              <span>📚 Từ vựng đã lưu</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20">
                {savedStore.vocabs.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSavedSubTab("grammars");
                setIsReviewingSelected(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                savedSubTab === "grammars"
                  ? "bg-[#204434] text-white shadow-xs"
                  : "bg-white border border-[#E5DEC9] text-[#315E48] hover:bg-[#FAF7F0]"
              }`}
            >
              <span>📐 Ngữ pháp đã lưu</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20">
                {savedStore.grammars.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSavedSubTab("questions");
                setIsReviewingSelected(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                savedSubTab === "questions"
                  ? "bg-[#204434] text-white shadow-xs"
                  : "bg-white border border-[#E5DEC9] text-[#315E48] hover:bg-[#FAF7F0]"
              }`}
            >
              <span>❓ Câu hỏi luyện tập</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20">
                {savedStore.questions.length}
              </span>
            </button>
          </div>

          {/* ================================================================= */}
          {/* PHÂN MỤC 1: TỪ VỰNG ĐÃ LƯU                                         */}
          {/* ================================================================= */}
          {savedSubTab === "vocabs" && (
            <div className="space-y-4">
              {savedStore.vocabs.length === 0 ? (
                <div className="py-16 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#BC9B6B]/40 space-y-3">
                  <BookmarkCheck className="w-12 h-12 text-[#8F6D3B]/40 mx-auto" />
                  <p className="text-sm font-bold text-[#204434]">Chưa có từ vựng nào được lưu</p>
                  <p className="text-xs text-[#315E48]">
                    Trong lúc học từ vựng hoặc luyện Flashcard, bạn có thể bấm nút &quot;Lưu từ vựng&quot; để lưu lại các từ cần ghi nhớ.
                  </p>
                </div>
              ) : (
                <>
                  {/* Thanh công cụ chọn & ôn tập */}
                  <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (selectedSavedVocabIds.length === savedStore.vocabs.length) {
                            setSelectedSavedVocabIds([]);
                          } else {
                            setSelectedSavedVocabIds(savedStore.vocabs.map((v) => v.id));
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-[#204434] font-bold hover:bg-[#FAF7F0] cursor-pointer"
                      >
                        {selectedSavedVocabIds.length === savedStore.vocabs.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                      </button>
                      <span className="text-[#315E48]">
                        Đã chọn: <strong>{selectedSavedVocabIds.length}</strong> / {savedStore.vocabs.length} từ
                      </span>
                    </div>

                    {selectedSavedVocabIds.length > 0 && (
                      <button
                        onClick={() => {
                          setIsReviewingSelected(true);
                          setReviewCurrentIndex(0);
                          setReviewShowAnswer(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#204434] text-white font-bold hover:bg-[#17382F] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>🚀 Ôn tập tổng hợp ({selectedSavedVocabIds.length} từ)</span>
                      </button>
                    )}
                  </div>

                  {/* CHẾ ĐỘ ÔN TẬP TỔNG HỢP CÁC TỪ ĐÃ CHỌN */}
                  {isReviewingSelected && selectedSavedVocabIds.length > 0 && (
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FAF7F0] to-[#FFFCF6] border-2 border-[#BC9B6B] shadow-md space-y-4 animate-fadeIn text-center">
                      <div className="flex items-center justify-between text-xs text-[#8F6D3B] font-bold border-b border-[#E5DEC9] pb-2">
                        <span>Đang ôn tập từ đã lưu ({reviewCurrentIndex + 1}/{selectedSavedVocabIds.length})</span>
                        <button
                          onClick={() => setIsReviewingSelected(false)}
                          className="text-red-500 hover:underline cursor-pointer"
                        >
                          Đóng ôn tập
                        </button>
                      </div>

                      {(() => {
                        const targetVocab = savedStore.vocabs.find(
                          (v) => v.id === selectedSavedVocabIds[reviewCurrentIndex]
                        );
                        if (!targetVocab) return null;

                        return (
                          <div className="space-y-4 py-4 max-w-md mx-auto">
                            <span className="font-serif text-5xl font-bold text-[#204434] block">
                              {targetVocab.hanzi}
                            </span>
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-mono text-base font-semibold text-[#8F6D3B]">
                                {targetVocab.pinyin}
                              </span>
                              <button
                                onClick={() => handleSpeak(targetVocab.hanzi)}
                                className="p-1 rounded-full text-[#8F6D3B] hover:text-[#204434] cursor-pointer"
                              >
                                <Volume2 className="w-5 h-5" />
                              </button>
                            </div>

                            {reviewShowAnswer ? (
                              <div className="space-y-2 animate-fadeIn">
                                <p className="text-xl font-bold text-[#204434]">
                                  {targetVocab.meaning}
                                </p>
                                {targetVocab.exampleZh && (
                                  <p className="text-xs text-[#315E48] italic">
                                    Ví dụ: {targetVocab.exampleZh} ({targetVocab.exampleVi})
                                  </p>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => setReviewShowAnswer(true)}
                                className="px-5 py-2.5 rounded-2xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 cursor-pointer transition shadow-xs"
                              >
                                Xem nghĩa tiếng Việt
                              </button>
                            )}

                            <div className="pt-4 flex items-center justify-center gap-3">
                              <button
                                disabled={reviewCurrentIndex === 0}
                                onClick={() => {
                                  setReviewCurrentIndex((i) => Math.max(0, i - 1));
                                  setReviewShowAnswer(false);
                                }}
                                className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs font-bold text-[#204434] disabled:opacity-40 cursor-pointer"
                              >
                                Từ trước
                              </button>
                              <button
                                disabled={reviewCurrentIndex >= selectedSavedVocabIds.length - 1}
                                onClick={() => {
                                  setReviewCurrentIndex((i) => i + 1);
                                  setReviewShowAnswer(false);
                                }}
                                className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                              >
                                Từ tiếp theo
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Danh sách các từ vựng */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {savedStore.vocabs.map((v) => {
                      const isChecked = selectedSavedVocabIds.includes(v.id);
                      return (
                        <div
                          key={v.id}
                          className={`p-4 rounded-2xl border transition shadow-2xs space-y-3 ${
                            isChecked ? "bg-amber-50/50 border-amber-300" : "bg-[#FFFCF6] border-[#BC9B6B]/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSavedVocabIds((prev) => [...prev, v.id]);
                                  } else {
                                    setSelectedSavedVocabIds((prev) => prev.filter((id) => id !== v.id));
                                  }
                                }}
                                className="w-4 h-4 rounded text-[#204434] cursor-pointer"
                              />
                              <span className="text-[11px] font-bold text-[#8F6D3B]">
                                HSK {v.hskLevel || 1} · Bài {v.lessonNumber || 1}
                              </span>
                            </label>

                            <button
                              onClick={() => {
                                removeSavedVocab(currentUser?.id, v.id);
                                reloadSavedKnowledge();
                              }}
                              className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                              title="Bỏ lưu từ này"
                            >
                              Bỏ lưu
                            </button>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-2xl text-[#204434]">{v.hanzi}</span>
                              <span className="font-mono text-xs font-semibold text-[#8F6D3B]">{v.pinyin}</span>
                              <button
                                onClick={() => handleSpeak(v.hanzi)}
                                className="p-1 rounded-full text-[#8F6D3B] hover:text-[#204434] cursor-pointer"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs font-bold text-[#315E48] mt-1">{v.meaning}</p>
                            {v.exampleZh && (
                              <p className="text-[11px] text-slate-600 italic mt-1">
                                {v.exampleZh} ({v.exampleVi})
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">
                              Lưu lúc: {new Date(v.savedAt).toLocaleDateString("vi-VN")}
                            </span>
                            <button
                              onClick={() => {
                                if (v.lessonNumber) {
                                  setSelectedPracticeLesson(v.lessonNumber);
                                  setActiveMode("vocab");
                                }
                              }}
                              className="font-bold text-[#204434] hover:underline cursor-pointer"
                            >
                              Xem bài học nguồn →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* PHÂN MỤC 2: NGỮ PHÁP ĐÃ LƯU                                       */}
          {/* ================================================================= */}
          {savedSubTab === "grammars" && (
            <div className="space-y-4">
              {savedStore.grammars.length === 0 ? (
                <div className="py-16 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#BC9B6B]/40 space-y-3">
                  <BookmarkCheck className="w-12 h-12 text-[#8F6D3B]/40 mx-auto" />
                  <p className="text-sm font-bold text-[#204434]">Chưa có điểm ngữ pháp nào được lưu</p>
                  <p className="text-xs text-[#315E48]">
                    Khi học trong phòng Luyện ngữ pháp, bạn có thể bấm nút &quot;Lưu ngữ pháp&quot; để lưu lại các cấu trúc quan trọng.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (selectedSavedGrammarIds.length === savedStore.grammars.length) {
                            setSelectedSavedGrammarIds([]);
                          } else {
                            setSelectedSavedGrammarIds(savedStore.grammars.map((g) => g.id));
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-[#204434] font-bold hover:bg-[#FAF7F0] cursor-pointer"
                      >
                        {selectedSavedGrammarIds.length === savedStore.grammars.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                      </button>
                      <span className="text-[#315E48]">
                        Đã chọn: <strong>{selectedSavedGrammarIds.length}</strong> / {savedStore.grammars.length} điểm ngữ pháp
                      </span>
                    </div>

                    {selectedSavedGrammarIds.length > 0 && (
                      <button
                        onClick={() => {
                          setIsReviewingSelected(true);
                          setReviewCurrentIndex(0);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#204434] text-white font-bold hover:bg-[#17382F] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>🚀 Ôn tập tổng hợp ({selectedSavedGrammarIds.length} ngữ pháp)</span>
                      </button>
                    )}
                  </div>

                  {/* Chế độ ôn tập ngữ pháp */}
                  {isReviewingSelected && selectedSavedGrammarIds.length > 0 && (
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FAF7F0] to-[#FFFCF6] border-2 border-[#BC9B6B] shadow-md space-y-4 animate-fadeIn max-w-xl mx-auto">
                      <div className="flex items-center justify-between text-xs text-[#8F6D3B] font-bold border-b border-[#E5DEC9] pb-2">
                        <span>Ôn tập ngữ pháp ({reviewCurrentIndex + 1}/{selectedSavedGrammarIds.length})</span>
                        <button
                          onClick={() => setIsReviewingSelected(false)}
                          className="text-red-500 hover:underline cursor-pointer"
                        >
                          Đóng ôn tập
                        </button>
                      </div>

                      {(() => {
                        const targetGrammar = savedStore.grammars.find(
                          (g) => g.id === selectedSavedGrammarIds[reviewCurrentIndex]
                        );
                        if (!targetGrammar) return null;

                        return (
                          <div className="space-y-3 py-2">
                            <h4 className="font-serif font-bold text-lg text-[#204434]">
                              {targetGrammar.title}
                            </h4>
                            <div className="p-3 rounded-xl bg-white border border-[#E5DEC9] font-mono text-xs text-[#8F6D3B] font-bold">
                              Công thức: {targetGrammar.structure}
                            </div>
                            <p className="text-xs text-[#315E48] leading-relaxed">
                              <strong>Ví dụ:</strong> {targetGrammar.example}
                            </p>
                            {targetGrammar.explanation && (
                              <p className="text-xs text-slate-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                                💡 {targetGrammar.explanation}
                              </p>
                            )}

                            <div className="pt-4 flex items-center justify-between">
                              <button
                                disabled={reviewCurrentIndex === 0}
                                onClick={() => setReviewCurrentIndex((i) => Math.max(0, i - 1))}
                                className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs font-bold text-[#204434] disabled:opacity-40 cursor-pointer"
                              >
                                Ngữ pháp trước
                              </button>
                              <button
                                disabled={reviewCurrentIndex >= selectedSavedGrammarIds.length - 1}
                                onClick={() => setReviewCurrentIndex((i) => i + 1)}
                                className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                              >
                                Ngữ pháp tiếp theo
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Danh sách card ngữ pháp */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedStore.grammars.map((g) => {
                      const isChecked = selectedSavedGrammarIds.includes(g.id);
                      return (
                        <div
                          key={g.id}
                          className={`p-4 sm:p-5 rounded-2xl border transition shadow-2xs space-y-3 ${
                            isChecked ? "bg-amber-50/50 border-amber-300" : "bg-[#FFFCF6] border-[#BC9B6B]/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSavedGrammarIds((prev) => [...prev, g.id]);
                                  } else {
                                    setSelectedSavedGrammarIds((prev) => prev.filter((id) => id !== g.id));
                                  }
                                }}
                                className="w-4 h-4 rounded text-[#204434] cursor-pointer"
                              />
                              <span className="text-[11px] font-bold text-[#8F6D3B]">
                                HSK {g.hskLevel || 1} · Bài {g.lessonNumber || 1}
                              </span>
                            </label>

                            <button
                              onClick={() => {
                                removeSavedGrammar(currentUser?.id, g.id);
                                reloadSavedKnowledge();
                              }}
                              className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                              title="Bỏ lưu ngữ pháp này"
                            >
                              Bỏ lưu
                            </button>
                          </div>

                          <div>
                            <h4 className="font-serif font-bold text-base text-[#204434]">{g.title}</h4>
                            <div className="p-2.5 rounded-xl bg-white border border-[#E5DEC9] font-mono text-xs text-[#8F6D3B] font-bold mt-1.5">
                              {g.structure}
                            </div>
                            <p className="text-xs text-[#315E48] mt-2 italic">Ví dụ: {g.example}</p>
                            {g.explanation && (
                              <p className="text-[11px] text-slate-700 mt-1 line-clamp-2">{g.explanation}</p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">
                              Lưu lúc: {new Date(g.savedAt).toLocaleDateString("vi-VN")}
                            </span>
                            <button
                              onClick={() => {
                                if (g.lessonNumber) {
                                  setSelectedPracticeLesson(g.lessonNumber);
                                  setActiveMode("grammar");
                                }
                              }}
                              className="font-bold text-[#204434] hover:underline cursor-pointer"
                            >
                              Xem bài học nguồn →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* PHÂN MỤC 3: CÂU HỎI LUYỆN TẬP ĐÃ LƯU                              */}
          {/* ================================================================= */}
          {savedSubTab === "questions" && (
            <div className="space-y-4">
              {savedStore.questions.length === 0 ? (
                <div className="py-16 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#BC9B6B]/40 space-y-3">
                  <BookmarkCheck className="w-12 h-12 text-[#8F6D3B]/40 mx-auto" />
                  <p className="text-sm font-bold text-[#204434]">Chưa có câu hỏi luyện tập nào được lưu</p>
                  <p className="text-xs text-[#315E48]">
                    Khi làm bài tập trắc nghiệm ngữ pháp, bạn có thể bấm nút &quot;Lưu câu hỏi&quot; để lưu lại những câu cần luyện lại.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (selectedSavedQuestionIds.length === savedStore.questions.length) {
                            setSelectedSavedQuestionIds([]);
                          } else {
                            setSelectedSavedQuestionIds(savedStore.questions.map((q) => q.id));
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-[#204434] font-bold hover:bg-[#FAF7F0] cursor-pointer"
                      >
                        {selectedSavedQuestionIds.length === savedStore.questions.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                      </button>
                      <span className="text-[#315E48]">
                        Đã chọn: <strong>{selectedSavedQuestionIds.length}</strong> / {savedStore.questions.length} câu hỏi
                      </span>
                    </div>

                    {selectedSavedQuestionIds.length > 0 && (
                      <button
                        onClick={() => {
                          setIsReviewingSelected(true);
                          setReviewCurrentIndex(0);
                          setReviewQuizSelected(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#204434] text-white font-bold hover:bg-[#17382F] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>🎯 Làm lại bài tập ({selectedSavedQuestionIds.length} câu)</span>
                      </button>
                    )}
                  </div>

                  {/* Chế độ làm lại câu hỏi trắc nghiệm trực tiếp */}
                  {isReviewingSelected && selectedSavedQuestionIds.length > 0 && (
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FAF7F0] to-[#FFFCF6] border-2 border-[#BC9B6B] shadow-md space-y-4 animate-fadeIn max-w-xl mx-auto">
                      <div className="flex items-center justify-between text-xs text-[#8F6D3B] font-bold border-b border-[#E5DEC9] pb-2">
                        <span>Làm lại câu hỏi ({reviewCurrentIndex + 1}/{selectedSavedQuestionIds.length})</span>
                        <button
                          onClick={() => setIsReviewingSelected(false)}
                          className="text-red-500 hover:underline cursor-pointer"
                        >
                          Đóng làm bài
                        </button>
                      </div>

                      {(() => {
                        const targetQuestion = savedStore.questions.find(
                          (q) => q.id === selectedSavedQuestionIds[reviewCurrentIndex]
                        );
                        if (!targetQuestion) return null;

                        return (
                          <div className="space-y-4 py-2">
                            <p className="font-serif font-bold text-base text-[#204434]">
                              {targetQuestion.prompt}
                            </p>

                            {/* Lựa chọn trắc nghiệm */}
                            {Array.isArray(targetQuestion.options) && targetQuestion.options.length > 0 && (
                              <div className="space-y-2">
                                {targetQuestion.options.map((opt, oi) => {
                                  const isSelected = reviewQuizSelected === opt;
                                  const isCorrect = opt.trim().startsWith(targetQuestion.correctAnswer) || opt.includes(targetQuestion.correctAnswer);

                                  let style = "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]";
                                  if (reviewQuizSelected) {
                                    if (isCorrect) style = "bg-emerald-600 text-white font-bold border-emerald-600";
                                    else if (isSelected) style = "bg-rose-500 text-white font-bold border-rose-500";
                                  }

                                  return (
                                    <button
                                      key={oi}
                                      onClick={() => setReviewQuizSelected(opt)}
                                      className={`w-full p-3 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer ${style}`}
                                    >
                                      <span>{opt}</span>
                                      {reviewQuizSelected && isCorrect && <Check className="w-4 h-4 text-white" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {reviewQuizSelected && targetQuestion.explanation && (
                              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed animate-fadeIn">
                                💡 <strong>Giải thích:</strong> {targetQuestion.explanation}
                              </div>
                            )}

                            <div className="pt-3 flex items-center justify-between">
                              <button
                                disabled={reviewCurrentIndex === 0}
                                onClick={() => {
                                  setReviewCurrentIndex((i) => Math.max(0, i - 1));
                                  setReviewQuizSelected(null);
                                }}
                                className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs font-bold text-[#204434] disabled:opacity-40 cursor-pointer"
                              >
                                Câu trước
                              </button>
                              <button
                                disabled={reviewCurrentIndex >= selectedSavedQuestionIds.length - 1}
                                onClick={() => {
                                  setReviewCurrentIndex((i) => i + 1);
                                  setReviewQuizSelected(null);
                                }}
                                className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                              >
                                Câu tiếp theo
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Danh sách câu hỏi */}
                  <div className="space-y-3">
                    {savedStore.questions.map((q) => {
                      const isChecked = selectedSavedQuestionIds.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          className={`p-4 sm:p-5 rounded-2xl border transition shadow-2xs space-y-3 ${
                            isChecked ? "bg-amber-50/50 border-amber-300" : "bg-[#FFFCF6] border-[#BC9B6B]/30"
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSavedQuestionIds((prev) => [...prev, q.id]);
                                  } else {
                                    setSelectedSavedQuestionIds((prev) => prev.filter((id) => id !== q.id));
                                  }
                                }}
                                className="w-4 h-4 rounded text-[#204434] cursor-pointer"
                              />
                              <span className="text-[11px] font-bold text-[#8F6D3B]">
                                HSK {q.hskLevel || 1} · Bài {q.lessonNumber || 1} · {q.grammarRule || "Ngữ pháp"}
                              </span>
                            </label>

                            <button
                              onClick={() => {
                                removeSavedQuestion(currentUser?.id, q.id);
                                reloadSavedKnowledge();
                              }}
                              className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                              title="Bỏ lưu câu hỏi này"
                            >
                              Bỏ lưu
                            </button>
                          </div>

                          <p className="font-serif font-bold text-sm text-[#204434]">{q.prompt}</p>

                          {Array.isArray(q.options) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {q.options.map((opt, oi) => {
                                const isCorrect = opt.trim().startsWith(q.correctAnswer) || opt.includes(q.correctAnswer);
                                return (
                                  <div
                                    key={oi}
                                    className={`p-2 rounded-xl border text-[11px] ${
                                      isCorrect ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-900" : "bg-white border-[#E5DEC9]"
                                    }`}
                                  >
                                    {opt} {isCorrect && "✓"}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {q.explanation && (
                            <p className="text-[11px] text-amber-900 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
                              💡 <strong>Giải thích:</strong> {q.explanation}
                            </p>
                          )}

                          <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">
                              Lưu lúc: {new Date(q.savedAt).toLocaleDateString("vi-VN")}
                            </span>
                            <button
                              onClick={() => {
                                if (q.lessonNumber) {
                                  setSelectedPracticeLesson(q.lessonNumber);
                                  setActiveMode("grammar");
                                }
                              }}
                              className="font-bold text-[#204434] hover:underline cursor-pointer"
                            >
                              Xem bài học nguồn →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* BĂNG REWARD VƯỢT ẢI MỞ KHÓA CHO CHẾ ĐỘ TỰ HỌC                       */}
      {/* =================================================================== */}
      {learningTrack === "SELF_STUDY" && isLessonUnlocked && (
        <div className="bg-gradient-to-r from-[#204434] via-[#17382F] to-[#204434] text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#BC9B6B]/20 text-[#BC9B6B] flex items-center justify-center text-2xl shrink-0 border border-[#BC9B6B]/40">
              🏆
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-[#BC9B6B] font-bold">
                Tiến trình tự học · Bài {selectedPracticeLesson} / {officialLessons.length}
              </div>
              <h4 className="font-serif font-bold text-base text-white">
                {selectedPracticeLesson < officialLessons.length
                  ? `Chinh phục xong Bài ${selectedPracticeLesson}?`
                  : `Xuất sắc! Bạn đã hoàn thành toàn bộ ${officialLessons.length} bài của HSK ${currentHskLevel}!`}
              </h4>
              <p className="text-xs text-[#FAF7F0]/80">
                {selectedPracticeLesson < officialLessons.length
                  ? `Bấm để ghi nhận hoàn thành bài học và mở khóa Bài ${selectedPracticeLesson + 1} tiếp theo (+25 XP).`
                  : `Bạn có thể thử sức với Đề thi thử HSK ${currentHskLevel} để nhận chứng chỉ mô phỏng nhé!`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedPracticeLesson < officialLessons.length ? (
              <button
                type="button"
                onClick={() => handleUnlockNextLesson(selectedPracticeLesson + 1)}
                className="px-5 py-2.5 rounded-2xl bg-[#BC9B6B] hover:bg-[#a88755] text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Mở khóa Bài {selectedPracticeLesson + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/s/mock-exam"
                className="px-5 py-2.5 rounded-2xl bg-[#BC9B6B] hover:bg-[#a88755] text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Làm đề thi thử HSK {currentHskLevel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* PHẦN 3: CHỨC NĂNG HỖ TRỢ & THEO DÕI NẮM VỮNG KIẾN THỨC             */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4">
        {/* 1. Gợi ý luyện tập hôm nay */}
        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-2xs space-y-3.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
                <span>Gợi ý luyện tập hôm nay</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                Tự động đề xuất
              </span>
            </div>
            <p className="text-xs text-[#315E48] leading-relaxed">
              Hệ thống AI tự động phát hiện kiến thức bạn còn yếu hoặc chưa nhớ để giúp bạn ôn lại hiệu quả:
            </p>
          </div>

          <div className="space-y-2">
            {memoryStats.records.filter((r) => r.status === "NOT_REMEMBERED" || r.status === "REVIEW_NEEDED").length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-none">
                {memoryStats.records
                  .filter((r) => r.status === "NOT_REMEMBERED" || r.status === "REVIEW_NEEDED")
                  .slice(0, 8)
                  .map((r, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] text-xs font-bold text-[#204434] shadow-2xs flex items-center gap-1"
                    >
                      <span className="font-serif">{r.hanzi}</span>
                      <span className="text-[10px] text-[#8F6D3B] font-mono">({r.pinyin})</span>
                    </span>
                  ))}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-white border border-dashed border-[#E5DEC9] text-center text-xs text-[#315E48]">
                🎉 Tuyệt vời! Bạn không có từ nào bị yếu hôm nay. Hãy duy trì phong độ!
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setVocabFilterState("NOT_REMEMBERED");
              setActiveMode("vocab");
            }}
            className="w-full py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Bắt đầu ôn tập kiến thức yếu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Mức độ nắm vững kiến thức */}
        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#8F6D3B]" />
              <span>Mức độ nắm vững</span>
            </span>
            <span className="text-xs font-serif font-bold text-[#204434]">
              {memoryStats.totalEvaluated} từ đã đánh giá
            </span>
          </div>

          {/* Thanh phân chia tỷ lệ 3 màu */}
          <div className="space-y-1.5">
            {memoryStats.totalEvaluated > 0 ? (
              <div className="w-full h-3 rounded-full bg-[#FAF7F0] overflow-hidden flex border border-[#E5DEC9]">
                <div
                  title="Đã nhớ"
                  className="bg-emerald-600 h-full transition-all duration-500"
                  style={{
                    width: `${(memoryStats.masteredCount / memoryStats.totalEvaluated) * 100}%`,
                  }}
                />
                <div
                  title="Cần ôn lại"
                  className="bg-amber-500 h-full transition-all duration-500"
                  style={{
                    width: `${(memoryStats.reviewNeededCount / memoryStats.totalEvaluated) * 100}%`,
                  }}
                />
                <div
                  title="Chưa nắm vững"
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{
                    width: `${(memoryStats.notRememberedCount / memoryStats.totalEvaluated) * 100}%`,
                  }}
                />
              </div>
            ) : (
              <div
                className="w-full h-3 rounded-full bg-stone-200/80 border border-stone-300"
                title="Chưa có dữ liệu đánh giá"
              />
            )}

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="flex items-center gap-1 text-emerald-800 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                Đã nhớ: {memoryStats.masteredCount}
              </span>
              <span className="flex items-center gap-1 text-amber-800 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Cần ôn: {memoryStats.reviewNeededCount}
              </span>
              <span className="flex items-center gap-1 text-rose-800 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                Chưa nhớ: {memoryStats.notRememberedCount}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#315E48] leading-relaxed pt-1 border-t border-[#E5DEC9]/60">
            {memoryStats.totalEvaluated > 0
              ? "Tỷ lệ nắm vững cập nhật tự động dựa trên mức độ đánh giá nhớ / chưa nhớ của bạn."
              : "Hãy lật thẻ và đánh giá 'Đã thuộc' hoặc 'Chưa nhớ' để hệ thống theo dõi mức độ tiến bộ của bạn."}
          </p>
        </div>

        {/* 3. Các bài học đã học & Chọn cấp HSK */}
        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-[#8F6D3B]" />
                <span>Các bài học đã học</span>
              </span>
              <span className="text-[11px] font-bold text-[#8F6D3B]">
                HSK {currentHskLevel}.0
              </span>
            </div>
            <p className="text-xs text-[#315E48]">
              Chọn bài bất kỳ để mở lại toàn bộ từ vựng, ngữ pháp và bài tập tương ứng:
            </p>
          </div>

          <div className="grid grid-cols-5 gap-1.5 max-h-28 overflow-y-auto pr-1">
            {officialLessons.slice(0, 15).map((ls) => {
              const isPub =
                learningTrack === "SELF_STUDY"
                  ? selfUnlockedLessons.includes(ls.number)
                  : dbLessons.some((dl) => dl.lessonNumber === ls.number);
              return (
                <button
                  key={ls.number}
                  onClick={() => {
                    setSelectedPracticeLesson(ls.number);
                    setActiveCardIndex(0);
                    setShowCardMeaning(false);
                  }}
                  className={`p-1.5 rounded-xl border text-center transition cursor-pointer text-xs font-bold flex items-center justify-center gap-0.5 ${
                    selectedPracticeLesson === ls.number
                      ? "bg-[#204434] text-white border-[#204434] shadow-xs"
                      : isPub
                      ? "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#FAF7F0]"
                      : "bg-slate-50 text-slate-400 border-dashed border-slate-200"
                  }`}
                  title={isPub ? `Bài ${ls.number} (Đã mở)` : `Bài ${ls.number} (Chưa mở quyền)`}
                >
                  <span>B{ls.number}</span>
                  {!isPub && <span className="text-[9px]">🔒</span>}
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-[#8F6D3B] text-center font-semibold">
            Đang chọn: Bài {String(selectedPracticeLesson).padStart(2, "0")} · {currentOfficialLesson?.titleZh}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* PHẦN 4: LỊCH ÔN TẬP THEO CHU KỲ NGẮT QUÃNG (SPACED REPETITION)       */}
      {/* =================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF7F0] border border-[#E5DEC9] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-[#8F6D3B]" />
              <span>Lịch ôn tập ngắt quãng thông minh</span>
            </h4>
            <p className="text-xs text-[#315E48]">
              Lộ trình lặp lại ngắt quãng (Spaced Repetition) giúp biến trí nhớ ngắn hạn thành trí nhớ dài hạn vĩnh viễn.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#204434] border border-[#E5DEC9]">
            Chu kỳ: 1 - 3 - 7 - 14 - 30 ngày
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Hôm nay */}
          <div className="p-3.5 rounded-2xl bg-white border border-amber-300 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-amber-800 font-bold">
              <span>Hôm nay</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[10px]">
                {memoryStats.dueTodayCount} mục
              </span>
            </div>
            <p className="text-[#315E48] text-[11px] leading-relaxed">
              Các từ vựng và câu hỏi sai cần ôn tập ngay hôm nay để không bị gián đoạn trí nhớ.
            </p>
          </div>

          {/* Ngày mai */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-[#204434] font-bold">
              <span>Ngày mai</span>
              <span className="px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#8F6D3B] text-[10px] font-bold">
                {memoryStats.dueTomorrowCount || 0} mục đến hạn
              </span>
            </div>
            <p className="text-[#315E48] text-[11px] leading-relaxed">
              Củng cố lại các từ vừa học và các điểm ngữ pháp mới của Bài {selectedPracticeLesson}.
            </p>
          </div>

          {/* Trong tuần tới */}
          <div className="p-3.5 rounded-2xl bg-white border border-emerald-300 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-emerald-800 font-bold">
              <span>3 - 7 ngày tới</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {memoryStats.dueUpcomingWeekCount || 0} mục ôn dài hạn
              </span>
            </div>
            <p className="text-[#315E48] text-[11px] leading-relaxed">
              Kiểm tra phản xạ định kỳ các từ đã thuộc để đảm bảo không bao giờ bị quên khi đi thi HSK.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Bảng Vàng Thi Đua Lớp & Toàn Trường */}
      <ClassLeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        classId={activeClass?.id}
        className={activeClass?.name}
        currentUserId={currentUser?.id}
      />

      {/* Modal Luyện Khẩu Ngữ & Hội Thoại AI (Nói AI kiểm tra & kết nối kho từ điển) */}
      <AiDialogueRoleplayModal
        isOpen={showAiDialogueModal}
        onClose={() => setShowAiDialogueModal(false)}
        initialDialogue={currentOfficialLesson?.dialogue || []}
        lessonTitle={currentOfficialLesson?.titleZh || "Bài học HSK"}
        lessonNumber={selectedPracticeLesson}
        hskLevel={currentHskLevel}
        studentId={currentUser?.id}
      />

      {/* Modal Sửa Lỗi Ngữ Pháp & Chấm Đoạn Văn AI (Viết AI kiểm tra & đối chiếu kho từ điển) */}
      <AiWritingCheckerModal
        isOpen={showAiWritingModal}
        onClose={() => setShowAiWritingModal(false)}
        lessonTitle={currentOfficialLesson?.titleZh || "Bài học HSK"}
        lessonNumber={selectedPracticeLesson}
        hskLevel={currentHskLevel}
      />

      {/* Modal Sổ Tay Từ Vựng SRS 5 Hộp Leitner */}
      <VocabNotebookModal
        isOpen={showVocabNotebookModal}
        onClose={() => setShowVocabNotebookModal(false)}
        studentId={currentUser?.id}
        studentUsername={currentUser?.username}
      />

      {/* Modal Sổ Tay Câu Sai & Luyện Khắc Phục Điểm Yếu */}
      <MistakeNotebookModal
        isOpen={showMistakeNotebookModal}
        onClose={() => setShowMistakeNotebookModal(false)}
        studentId={currentUser?.id}
        studentUsername={currentUser?.username}
      />

      {/* Modal Nhiệm Vụ Hàng Ngày & Chuỗi Streak Ngày Học */}
      <DailyQuestsModal
        isOpen={showDailyQuestsModal}
        onClose={() => setShowDailyQuestsModal(false)}
        studentId={currentUser?.id}
        studentUsername={currentUser?.username}
        onXpClaimed={() => refreshMemoryStats()}
      />

      {/* Modal Radar Năng Lực 5 Kỹ Năng & Dự Đoán Tỷ Lệ Đỗ HSK */}
      <HskRadarAnalyticsModal
        isOpen={showHskRadarModal}
        onClose={() => setShowHskRadarModal(false)}
        studentId={currentUser?.id}
        studentUsername={currentUser?.username}
        onOpenSpeaking={() => setShowAiDialogueModal(true)}
        onOpenWriting={() => setShowAiWritingModal(true)}
        onOpenVocab={() => setShowVocabNotebookModal(true)}
        onOpenMistakes={() => setShowMistakeNotebookModal(true)}
      />

      {/* Modal Thư Phòng Take Note Bút Giấy Cổ Phong Trung Hoa */}
      <AncientStationeryNotesModal
        isOpen={showStationeryNotesModal}
        onClose={() => setShowStationeryNotesModal(false)}
        lessonNumber={selectedPracticeLesson}
        hskLevel={currentHskLevel}
        studentId={currentUser?.id}
      />

      {/* Modal Vân Tự Tập Thất - Phòng Tự Học Ảo Cổ Phong (Pomodoro & Tiếng Mưa Trúc) */}
      <VirtualStudyRoomModal
        isOpen={showVirtualStudyRoomModal}
        onClose={() => setShowVirtualStudyRoomModal(false)}
        studentName={currentUser?.name || "Bạn"}
      />
    </div>
  );
}
