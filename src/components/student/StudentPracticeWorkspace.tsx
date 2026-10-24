"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  Check,
  X,
  FileQuestion,
  HelpCircle,
  Zap,
  BookmarkCheck,
  ChevronRight,
  RefreshCw,
  Award,
} from "lucide-react";
import { getLessonsByHskLevel } from "@/lib/hsk-lessons-resolver";
import VocabPracticeSuite from "./practice/VocabPracticeSuite";
import GrammarPracticeSuite from "./practice/GrammarPracticeSuite";

export type PracticeSubMode = "vocab" | "grammar" | "game" | "wrong";

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
  const activeClass = myClasses[0] || null;
  const currentHskLevel = activeHskLevel || activeClass?.level || 1;

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
  const officialLessons = useMemo(() => {
    return getLessonsByHskLevel(currentHskLevel);
  }, [currentHskLevel]);

  const [selectedPracticeLesson, setSelectedPracticeLesson] = useState<number>(1);

  // ==========================================
  // STATE CHO MODE 1: LUYỆN TỪ VỰNG (FLASHCARD)
  // ==========================================
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [showCardMeaning, setShowCardMeaning] = useState<boolean>(false);
  const [vocabQuizMode, setVocabQuizMode] = useState<boolean>(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizIsAnswered, setQuizIsAnswered] = useState<boolean>(false);

  // ==========================================
  // STATE CHO MODE 3: GAME PHẢN XẠ HSK (10s)
  // ==========================================
  const [gameState, setGameState] = useState<"READY" | "PLAYING" | "ENDED">("READY");
  const [gameQuestionIdx, setGameQuestionIdx] = useState<number>(0);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameCombo, setGameCombo] = useState<number>(0);
  const [gameTimer, setGameTimer] = useState<number>(10);
  const [gameSelectedAnswer, setGameSelectedAnswer] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================
  // STATE CHO MODE 4: SỔ CÂU HỎI SAI
  // ==========================================
  const [wrongQuestions, setWrongQuestions] = useState<any[]>([]);
  const [loadingWrongQuestions, setLoadingWrongQuestions] = useState<boolean>(false);

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

  const streak = currentUser?.streakDays || 1;
  const xp = currentUser?.totalXp || 50;

  // Resolved Lesson Content for Selected Lesson
  const currentOfficialLesson = useMemo(() => {
    return officialLessons.find((l) => l.number === selectedPracticeLesson) || officialLessons[0];
  }, [officialLessons, selectedPracticeLesson]);

  const currentDbLesson = useMemo(() => {
    return dbLessons.find((l) => l.lessonNumber === selectedPracticeLesson);
  }, [dbLessons, selectedPracticeLesson]);

  // Danh sách từ vựng: Ưu tiên từ vựng cô giáo đã tùy biến cho bài học này, nếu chưa có thì lấy từ vựng chuẩn của bài
  const vocabList = useMemo(() => {
    if (currentDbLesson?.selectedVocabs && Array.isArray(currentDbLesson.selectedVocabs) && currentDbLesson.selectedVocabs.length > 0) {
      return currentDbLesson.selectedVocabs;
    }
    return currentOfficialLesson?.vocabList || (currentOfficialLesson as any)?.vocabularies || [];
  }, [currentDbLesson, currentOfficialLesson]);

  // Danh sách ngữ pháp: Ưu tiên điểm ngữ pháp cô giáo đã chọn cho bài học này
  const grammarList = useMemo(() => {
    if (currentDbLesson?.selectedGrammars && Array.isArray(currentDbLesson.selectedGrammars) && currentDbLesson.selectedGrammars.length > 0) {
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
  };

  const handleGameAnswer = (answer: string, correctAnswer: string) => {
    if (gameSelectedAnswer) return; // Đã trả lời
    setGameSelectedAnswer(answer);
    const isCorrect = answer === correctAnswer;
    if (isCorrect) {
      setGameScore((prev) => prev + 10 + gameCombo * 2);
      setGameCombo((prev) => prev + 1);
    } else {
      setGameCombo(0);
    }

    setTimeout(() => {
      handleGameNextQuestion(isCorrect);
    }, 1200);
  };

  const handleGameNextQuestion = (prevCorrect: boolean) => {
    if (gameQuestionIdx + 1 >= Math.min(vocabList.length, 10)) {
      setGameState("ENDED");
    } else {
      setGameQuestionIdx((prev) => prev + 1);
      setGameTimer(10);
      setGameSelectedAnswer(null);
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
              const isPub = dbLessons.some((dl) => dl.lessonNumber === ls.number);
              return (
                <option key={ls.number} value={ls.number}>
                  Bài {String(ls.number).padStart(2, "0")}: {ls.titleZh} ({ls.titleVi}) {isPub ? "✓ Đã mở" : ""}
                </option>
              );
            })}
          </select>
        </div>

        {/* 4 Chế độ theo đúng mockup Sidebar học sinh */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F0] p-1 rounded-xl border border-[#E5DEC9] overflow-x-auto">
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
            <span>Luyện từ vựng</span>
            <span className="text-[10px] opacity-80">({vocabList.length})</span>
          </button>

          <button
            onClick={() => setActiveMode("grammar")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeMode === "grammar"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434] hover:bg-[#FAF7F0]"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Luyện ngữ pháp</span>
            <span className="text-[10px] opacity-80">({grammarList.length})</span>
          </button>

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
            <span>Game phản xạ HSK</span>
          </button>

          <button
            onClick={() => setActiveMode("wrong")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeMode === "wrong"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434] hover:bg-[#FAF7F0]"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Sổ câu hỏi sai</span>
            <span className="text-[10px] opacity-80">({wrongQuestions.length})</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. CHẾ ĐỘ 1: LUYỆN TỪ VỰNG CHUYÊN SÂU (6 DẠNG BÀI TẬP TƯƠNG TÁC)   */}
      {/* =================================================================== */}
      {activeMode === "vocab" && (
        <VocabPracticeSuite
          vocabList={vocabList}
          lessonTitleZh={currentOfficialLesson?.titleZh}
          lessonNumber={selectedPracticeLesson}
          handleSpeak={handleSpeak}
        />
      )}

      {/* =================================================================== */}
      {/* 2. CHẾ ĐỘ 2: LUYỆN NGỮ PHÁP (LÝ THUYẾT + BÀI TẬP 5 DẠNG TƯƠNG TÁC)   */}
      {/* =================================================================== */}
      {activeMode === "grammar" && (
        <GrammarPracticeSuite
          grammarList={grammarList}
          lessonTitleZh={currentOfficialLesson?.titleZh}
          lessonNumber={selectedPracticeLesson}
          hskLevel={currentHskLevel}
          handleSpeak={handleSpeak}
        />
      )}

      {/* =================================================================== */}
      {/* 3. CHẾ ĐỘ 3: GAME PHẢN XẠ HSK (SPEED REFLEX CHALLENGE)             */}
      {/* =================================================================== */}
      {activeMode === "game" && (
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
      {/* 4. CHẾ ĐỘ 4: SỔ CÂU HỎI SAI (WRONG QUESTIONS NOTEBOOK)               */}
      {/* =================================================================== */}
      {activeMode === "wrong" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#204434] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Sổ câu hỏi sai & Cần ôn tập</span>
              </h3>
              <p className="text-xs text-[#315E48] mt-0.5">
                Tổng hợp các câu hỏi bạn từng làm sai để luyện lại cho đến khi trả lời đúng 3 lần liên tiếp.
              </p>
            </div>
            <button
              onClick={fetchWrongQuestions}
              className="p-2 rounded-xl border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] transition text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
          </div>

          {loadingWrongQuestions ? (
            <div className="py-12 text-center text-xs text-[#315E48]">Đang tải danh sách câu hỏi sai...</div>
          ) : wrongQuestions.length > 0 ? (
            <div className="space-y-3">
              {wrongQuestions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#FFFCF6] border border-amber-200/80 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                      Câu #{idx + 1} · Sai {item.wrongCount || 1} lần
                    </span>
                    <span className="text-[#6B766D] font-mono text-[11px]">
                      Chuỗi đúng hiện tại: {item.consecutiveRight || 0}/3
                    </span>
                  </div>

                  <p className="font-medium text-sm text-[#204434]">{item.content}</p>

                  {item.explanation && (
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-950 space-y-1">
                      <span className="font-bold text-amber-900 block">Lời giải chi tiết:</span>
                      <p>{item.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#E5DEC9] space-y-2 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              </div>
              <h4 className="font-serif font-bold text-base text-[#204434]">
                Sổ câu hỏi sai đang trống!
              </h4>
              <p className="text-xs text-[#315E48] leading-relaxed max-w-sm mx-auto">
                Tuyệt vời! Hiện tại bạn không có câu hỏi nào bị sai hoặc tất cả các câu sai trước đây đã được bạn vượt qua xuất sắc!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
