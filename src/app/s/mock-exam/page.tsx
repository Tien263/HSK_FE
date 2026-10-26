"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Clock,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
  AlertCircle,
  HelpCircle,
  Headphones,
  FileText,
  PenTool,
  Check,
  PlusCircle,
  GraduationCap,
  Calendar,
  Layers,
  Flame,
} from "lucide-react";
import { getLessonsByHskLevel } from "@/lib/hsk-lessons-resolver";
import { normalizeGrammarList } from "@/lib/chinese-grammar-helper";

interface MockQuestion {
  id: string;
  section: "LISTENING" | "READING" | "WRITING";
  prompt: string;
  subPrompt?: string;
  hanziToSpeak?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
  points?: number;
}

interface OfficialExamItem {
  id: string;
  title: string;
  description: string;
  hskLevel: number;
  teacherName: string;
  teacherRole: string;
  totalScore: number;
  durationMin: number;
  questionsCount: number;
  skillsCount: {
    listening: number;
    reading: number;
    writing: number;
  };
  questions: MockQuestion[];
  studentBestScore?: number | null;
  isPassed?: boolean | null;
}

export default function MockExamPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [examState, setExamState] = useState<"INTRO" | "EXAM" | "RESULT">("INTRO");

  // Danh sách đề thi từ Thầy Cô & Nhà Trường tải từ CSDL
  const [officialExams, setOfficialExams] = useState<OfficialExamItem[]>([]);
  const [loadingExams, setLoadingExams] = useState<boolean>(true);
  const [selectedExamTitle, setSelectedExamTitle] = useState<string>("");
  const [currentQuizSetId, setCurrentQuizSetId] = useState<string | null>(null);

  // Thời gian làm bài (đếm ngược theo giây)
  const [timeLeft, setTimeLeft] = useState<number>(35 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Bộ câu hỏi thi thử
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Giáo viên publish đề mới
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);

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

  // Tải danh sách đề thi thử chính thức do Giáo viên / Admin biên soạn từ CSDL
  const fetchMockExams = useCallback(async (level: number) => {
    setLoadingExams(true);
    try {
      let studentId = "";
      if (typeof window !== "undefined") {
        const currentUserStr = localStorage.getItem("currentUser");
        if (currentUserStr) {
          try {
            const parsed = JSON.parse(currentUserStr);
            studentId = parsed.id || parsed.username || "";
          } catch {}
        }
      }

      const res = await fetch(`/api/v1/mock-exams?level=${level}${studentId ? `&studentId=${studentId}` : ""}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.officialMockExams)) {
        setOfficialExams(data.officialMockExams);
      } else {
        setOfficialExams([]);
      }
    } catch (e) {
      console.warn("fetchMockExams error:", e);
      setOfficialExams([]);
    } finally {
      setLoadingExams(false);
    }
  }, []);

  useEffect(() => {
    fetchMockExams(selectedLevel);
  }, [selectedLevel, fetchMockExams]);

  // Giáo viên hoặc Admin tự động xuất bản 1 đề thi thử HSK cấp độ này vào phòng thi
  const handleTeacherPublishMockExam = async () => {
    setIsPublishing(true);
    setPublishSuccessMsg(null);
    try {
      let teacherId = "";
      if (typeof window !== "undefined") {
        const currentUserStr = localStorage.getItem("currentUser");
        if (currentUserStr) {
          try {
            const parsed = JSON.parse(currentUserStr);
            teacherId = parsed.id || "";
          } catch {}
        }
      }

      const res = await fetch("/api/v1/mock-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hskLevel: selectedLevel,
          title: `Đề thi thử HSK ${selectedLevel} Chuẩn Quốc Tế - Đề số 0${officialExams.length + 1}`,
          description: `Đề thi thử chính thức biên soạn theo cấu trúc CTI HSK 3.0, phân bổ chuẩn Nghe hiểu, Đọc hiểu và Viết.`,
          autoGenerate: true,
          teacherId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPublishSuccessMsg("🎉 Đã xuất bản thành công đề thi thử mới vào phòng thi!");
        await fetchMockExams(selectedLevel);
        setTimeout(() => setPublishSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.warn("handleTeacherPublishMockExam error:", e);
    } finally {
      setIsPublishing(false);
    }
  };

  // Tạo đề thi thử tự động từ dữ liệu giáo trình chuẩn HSK (Fallback hoặc lựa chọn thi tự do)
  const generateMockExam = (level: number) => {
    const lessons = getLessonsByHskLevel(level);
    const mockList: MockQuestion[] = [];

    const allVocabs: any[] = [];
    const allGrammars: any[] = [];

    lessons.forEach((ls) => {
      if (ls.vocabList) allVocabs.push(...ls.vocabList);
      if (ls.grammarList) allGrammars.push(...ls.grammarList);
    });

    const shuffledVocabs = [...allVocabs].sort(() => 0.5 - Math.random());

    // 1. PHẦN THI 1: NGHE HIỂU (10 CÂU)
    shuffledVocabs.slice(0, 10).forEach((v, idx) => {
      const meaning = v.meaningVi || v.meaning || "";
      const others = shuffledVocabs
        .filter((item) => (item.meaningVi || item.meaning) !== meaning)
        .map((item) => item.meaningVi || item.meaning);
      const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
      const opts = [meaning, ...shuffledOthers].sort(() => 0.5 - Math.random());

      mockList.push({
        id: `L_${idx + 1}`,
        section: "LISTENING",
        prompt: `Nghe phát âm và chọn nghĩa tiếng Việt chính xác:`,
        subPrompt: `[Bấm nút loa để nghe phát thanh viên đọc]`,
        hanziToSpeak: v.hanzi,
        options: opts,
        correctAnswer: meaning,
        explanation: `Phát âm: "${v.hanzi}" (${v.pinyin}) có nghĩa là: "${meaning}".`,
        points: 10,
      });
    });

    // 2. PHẦN THI 2: ĐỌC HIỂU (10 CÂU)
    shuffledVocabs.slice(10, 20).forEach((v, idx) => {
      const correctPinyin = v.pinyin || "";
      const others = shuffledVocabs
        .filter((item) => item.pinyin !== correctPinyin)
        .map((item) => item.pinyin);
      const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
      const opts = [correctPinyin, ...shuffledOthers].sort(() => 0.5 - Math.random());

      mockList.push({
        id: `R_${idx + 1}`,
        section: "READING",
        prompt: `Chọn phiên âm Pinyin đúng cho chữ Hán sau:`,
        subPrompt: v.hanzi,
        hanziToSpeak: v.hanzi,
        options: opts,
        correctAnswer: correctPinyin,
        explanation: `Chữ Hán "${v.hanzi}" đọc là "${correctPinyin}", nghĩa là "${v.meaningVi || v.meaning}".`,
        points: 10,
      });
    });

    // 3. PHẦN THI 3: VIẾT & NGỮ PHÁP (5 CÂU)
    const normalizedG = normalizeGrammarList(allGrammars.slice(0, 10), level);
    normalizedG.slice(0, 5).forEach((g, idx) => {
      const promptText = `Cấu trúc ngữ pháp '${g.title}' được dùng đúng trong câu nào sau đây?`;
      const correctEx = g.examples?.[0]?.zh || "你好！";
      const opts = [
        correctEx,
        `不${correctEx}`,
        `${correctEx}吗不是`,
        `吗${correctEx}`,
      ].sort(() => 0.5 - Math.random());
      const explanation = `Cấu trúc chuẩn: ${g.structure}. Ý nghĩa: ${g.meaningVi}.`;

      mockList.push({
        id: `W_${idx + 1}`,
        section: "WRITING",
        prompt: promptText,
        subPrompt: `Cấu trúc: ${g.structure}`,
        options: opts,
        correctAnswer: correctEx,
        explanation,
        points: 10,
      });
    });

    return mockList;
  };

  // Bắt đầu làm bài thi (hỗ trợ đề thi từ Giáo viên hoặc đề chuẩn hóa)
  const handleStartExam = (officialExam?: OfficialExamItem) => {
    if (officialExam && officialExam.questions && officialExam.questions.length > 0) {
      setQuestions(officialExam.questions);
      setSelectedExamTitle(officialExam.title);
      setCurrentQuizSetId(officialExam.id);
      setTimeLeft(officialExam.durationMin * 60);
    } else {
      const generated = generateMockExam(selectedLevel);
      setQuestions(generated);
      setSelectedExamTitle(`Đề thi thử HSK ${selectedLevel} Chuẩn Hóa Hệ Thống`);
      setCurrentQuizSetId(null);
      setTimeLeft(selectedLevel === 1 ? 35 * 60 : selectedLevel === 2 ? 55 * 60 : 90 * 60);
    }

    setCurrentQIndex(0);
    setUserAnswers({});
    setExamResult(null);
    setExamState("EXAM");
    setIsTimerRunning(true);
  };

  // Đồng hồ đếm ngược
  useEffect(() => {
    if (examState === "EXAM" && isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examState, isTimerRunning]);

  const handleSelectAnswer = (qId: string, ans: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: ans }));
  };

  // Nộp bài thi và lưu vào CSDL kết nối Thầy Cô & Học sinh
  const handleAutoSubmit = async () => {
    setSubmitting(true);
    setIsTimerRunning(false);

    let listeningCorrect = 0;
    let readingCorrect = 0;
    let writingCorrect = 0;

    const listeningTotal = questions.filter((q) => q.section === "LISTENING").length || 1;
    const readingTotal = questions.filter((q) => q.section === "READING").length || 1;
    const writingTotal = questions.filter((q) => q.section === "WRITING").length || 1;

    questions.forEach((q) => {
      const userAns = userAnswers[q.id];
      const isRight = userAns && userAns.trim() === q.correctAnswer.trim();
      if (isRight) {
        if (q.section === "LISTENING") listeningCorrect += 1;
        else if (q.section === "READING") readingCorrect += 1;
        else if (q.section === "WRITING") writingCorrect += 1;
      }
    });

    const isLevel12 = selectedLevel <= 2;
    const maxScore = isLevel12 ? 200 : 300;
    const passThreshold = isLevel12 ? 120 : 180;

    const listeningScore = Math.round((listeningCorrect / listeningTotal) * 100);
    const readingScore = Math.round((readingCorrect / readingTotal) * 100);
    const writingScore = isLevel12 ? 0 : Math.round((writingCorrect / writingTotal) * 100);

    const totalScore = isLevel12
      ? listeningScore + readingScore
      : listeningScore + readingScore + writingScore;
    const isPassed = totalScore >= passThreshold;

    setExamResult({
      totalScore,
      maxScore,
      passThreshold,
      isPassed,
      listeningScore,
      readingScore,
      writingScore,
      listeningCorrect,
      listeningTotal,
      readingCorrect,
      readingTotal,
      writingCorrect,
      writingTotal,
      totalAnswered: Object.keys(userAnswers).length,
      totalQuestions: questions.length,
    });

    setExamState("RESULT");
    setSubmitting(false);

    // Gửi điểm và bài làm lên CSDL (/api/v1/mock-exams/submit)
    try {
      let studentId = "";
      if (typeof window !== "undefined") {
        const currentUserStr = localStorage.getItem("currentUser");
        if (currentUserStr) {
          try {
            const parsed = JSON.parse(currentUserStr);
            studentId = parsed.id || parsed.username || "";
          } catch {}
        }
      }

      await fetch("/api/v1/mock-exams/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizSetId: currentQuizSetId,
          studentId,
          hskLevel: selectedLevel,
          totalScore: maxScore,
          score: totalScore,
          listeningScore,
          readingScore,
          writingScore,
          timeSpentSec: (selectedLevel === 1 ? 35 * 60 : 55 * 60) - timeLeft,
          answers: userAnswers,
          questions,
        }),
      });

      // Tải lại danh sách đề thi để cập nhật điểm mới nhất
      fetchMockExams(selectedLevel);
    } catch (e) {
      console.warn("Submit mock exam to DB error:", e);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const currentQ = questions[currentQIndex];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#204434] pb-16">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#FFFCF6]/95 backdrop-blur-md border-b border-[#E5DEC9] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/s/home#practice"
            className="p-2 rounded-xl border border-[#E5DEC9] bg-white text-[#204434] hover:bg-[#FAF7F0] transition shadow-2xs"
            title="Quay lại phòng luyện"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif font-bold text-base sm:text-lg text-[#204434] flex items-center gap-2">
              <span>Phòng thi thử HSK Quốc tế</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-mono font-bold">
                HSK {selectedLevel}.0
              </span>
            </h1>
            <p className="text-[11px] text-[#315E48]">
              {selectedExamTitle || "Mô phỏng 100% đề thi máy CTI/Hanban chuẩn quốc tế"}
            </p>
          </div>
        </div>

        {examState === "EXAM" && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-mono font-bold text-sm shadow-2xs animate-pulse">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
            <button
              onClick={() => {
                if (confirm("Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?")) {
                  handleAutoSubmit();
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Nộp bài thi
            </button>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* =================================================================== */}
        {/* MÀN HÌNH 1: CHỌN CẤP ĐỘ & DANH SÁCH ĐỀ THI TỪ THẦY CÔ              */}
        {/* =================================================================== */}
        {examState === "INTRO" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Banner giới thiệu */}
            <div className="bg-[#FFFCF6] border border-[#BC9B6B]/50 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-[#204434] text-[#BC9B6B] flex items-center justify-center mx-auto shadow-md">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-lg mx-auto">
                <h2 className="font-serif font-bold text-2xl text-[#204434]">
                  Kỳ Thi Thử Năng Lực Hán Ngữ HSK
                </h2>
                <p className="text-xs text-[#315E48] leading-relaxed">
                  Đánh giá toàn diện 3 kỹ năng Nghe hiểu, Đọc hiểu và Viết. Đề thi được kết nối trực tiếp với Thầy Cô biên soạn và CSDL khảo thí của nhà trường.
                </p>
              </div>

              {/* Bộ chọn cấp độ HSK 1 - 6 */}
              <div className="space-y-2 max-w-md mx-auto pt-2">
                <span className="text-xs font-bold text-[#204434] block">
                  Chọn cấp độ HSK bạn muốn làm đề thi thử:
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedLevel(lvl)}
                      className={`py-2.5 rounded-2xl border text-center transition cursor-pointer font-serif font-bold text-sm ${
                        selectedLevel === lvl
                          ? "bg-[#204434] text-white border-[#204434] shadow-xs scale-105"
                          : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#FAF7F0]"
                      }`}
                    >
                      HSK {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nút tác vụ cho Giáo viên/Admin: Xuất bản đề thi thử */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleTeacherPublishMockExam}
                  disabled={isPublishing}
                  className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
                  title="Giáo viên bấm để tự động biên soạn và đưa thêm 1 đề thi thử mới vào phòng thi"
                >
                  <PlusCircle className="w-4 h-4 text-amber-700" />
                  <span>
                    {isPublishing
                      ? "Đang xuất bản đề thi..."
                      : `Tổ Giáo viên: Xuất bản đề thi thử HSK ${selectedLevel} mới`}
                  </span>
                </button>
              </div>

              {publishSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl animate-fadeIn font-semibold max-w-md mx-auto">
                  {publishSuccessMsg}
                </div>
              )}
            </div>

            {/* DANH SÁCH 1: ĐỀ THI DO THẦY CÔ & NHÀ TRƯỜNG BIÊN SOẠN */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#8F6D3B]" />
                  <span>Đề thi thử từ Thầy Cô & Nhà Trường (HSK {selectedLevel})</span>
                </h3>
                <span className="text-xs text-[#315E48] font-mono">
                  {officialExams.length} bộ đề sẵn sàng
                </span>
              </div>

              {loadingExams ? (
                <div className="p-8 text-center text-xs text-[#315E48] bg-white rounded-3xl border border-[#E5DEC9]">
                  Đang tải danh sách đề thi từ CSDL...
                </div>
              ) : officialExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {officialExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="bg-white border border-[#E5DEC9] hover:border-[#BC9B6B] rounded-3xl p-5 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-bold">
                            HSK {exam.hskLevel} · {exam.durationMin} phút
                          </span>
                          <span className="text-[11px] text-[#315E48] font-medium flex items-center gap-1">
                            <span>Biên soạn:</span>
                            <strong className="text-[#204434]">{exam.teacherName}</strong>
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-base text-[#204434] leading-snug">
                          {exam.title}
                        </h4>

                        <p className="text-xs text-[#315E48] line-clamp-2 leading-relaxed">
                          {exam.description}
                        </p>

                        {/* Thống kê câu theo kỹ năng */}
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-[#315E48]">
                          <span className="flex items-center gap-1">
                            <Headphones className="w-3.5 h-3.5 text-[#BC9B6B]" />
                            <span>Nghe: {exam.skillsCount.listening} câu</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-[#BC9B6B]" />
                            <span>Đọc: {exam.skillsCount.reading} câu</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <PenTool className="w-3.5 h-3.5 text-[#BC9B6B]" />
                            <span>Viết: {exam.skillsCount.writing} câu</span>
                          </span>
                        </div>
                      </div>

                      {/* Footer của đề thi */}
                      <div className="pt-3 border-t border-[#FAF7F0] flex items-center justify-between">
                        {exam.studentBestScore !== null && exam.studentBestScore !== undefined ? (
                          <div className="text-xs">
                            <span className="text-[#315E48] block text-[10px]">Điểm cao nhất của bạn:</span>
                            <span
                              className={`font-bold ${
                                exam.isPassed ? "text-emerald-700" : "text-amber-700"
                              }`}
                            >
                              {exam.studentBestScore}/{exam.totalScore}đ ({exam.isPassed ? "ĐÃ ĐẠT" : "CHƯA ĐẠT"})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#8F6D3B] font-semibold">Chưa làm bài</span>
                        )}

                        <button
                          onClick={() => handleStartExam(exam)}
                          className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <span>Vào thi đề này</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-[#FAF7F0] rounded-3xl border border-[#E5DEC9] text-center space-y-3">
                  <p className="text-xs text-[#315E48]">
                    Chưa có đề thi thử riêng do Thầy Cô đăng tải cho HSK {selectedLevel}.
                  </p>
                  <button
                    onClick={handleTeacherPublishMockExam}
                    className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#183629] shadow-xs cursor-pointer transition inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Xuất bản ngay đề thi thử HSK {selectedLevel} đầu tiên</span>
                  </button>
                </div>
              )}
            </div>

            {/* DANH SÁCH 2: ĐỀ THI TỰ ĐỘNG CHUẨN HÓA GIÁO TRÌNH */}
            <div className="p-5 bg-white rounded-3xl border border-[#E5DEC9] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <h4 className="font-serif font-bold text-sm text-[#204434]">
                    Luyện thi tự do: Đề Chuẩn Hóa Giáo Trình HSK 3.0
                  </h4>
                </div>
                <p className="text-xs text-[#315E48]">
                  Hệ thống tự động tổng hợp từ vựng và ngữ pháp của cấp HSK {selectedLevel} để tạo ngẫu nhiên đề thi 25 câu.
                </p>
              </div>

              <button
                onClick={() => handleStartExam()}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-[#FAF7F0] border border-[#204434] text-[#204434] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
              >
                <span>Thi thử tự do</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MÀN HÌNH 2: GIAO DIỆN LÀM BÀI THI MÔ PHỎNG                           */}
        {/* =================================================================== */}
        {examState === "EXAM" && currentQ && (
          <div className="space-y-6 animate-fadeIn">
            {/* Phân đoạn kỹ năng & Thanh số câu */}
            <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#204434] text-white">
                  {currentQ.section === "LISTENING" && <Headphones className="w-4 h-4" />}
                  {currentQ.section === "READING" && <FileText className="w-4 h-4" />}
                  {currentQ.section === "WRITING" && <PenTool className="w-4 h-4" />}
                </span>
                <div>
                  <span className="text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wider block">
                    Phần thi:
                  </span>
                  <span className="font-bold text-sm text-[#204434]">
                    {currentQ.section === "LISTENING"
                      ? "1. Nghe hiểu (Listening)"
                      : currentQ.section === "READING"
                      ? "2. Đọc hiểu (Reading)"
                      : "3. Viết & Ngữ pháp (Writing)"}
                  </span>
                </div>
              </div>

              {/* Progress counter */}
              <span className="text-xs font-mono font-bold text-[#8F6D3B]">
                Câu {currentQIndex + 1} / {questions.length} (Đã làm: {Object.keys(userAnswers).length})
              </span>
            </div>

            {/* Nội dung câu hỏi */}
            <div className="bg-white border border-[#E5DEC9] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
              <div className="space-y-3">
                <p className="text-xs text-[#315E48] font-semibold">{currentQ.prompt}</p>

                {/* SubPrompt hoặc Hanzi to speak */}
                {currentQ.subPrompt && (
                  <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] text-center font-serif font-bold text-3xl sm:text-4xl text-[#204434]">
                    {currentQ.subPrompt}
                  </div>
                )}

                {/* Nút Audio phần nghe */}
                {currentQ.hanziToSpeak && (
                  <div className="flex items-center justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => handleSpeak(currentQ.hanziToSpeak!)}
                      className="px-5 py-2.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs shadow-2xs transition flex items-center gap-2 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-amber-700" />
                      <span>Bấm để nghe phát âm</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Danh sách lựa chọn đáp án */}
              {currentQ.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[currentQ.id] === opt;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectAnswer(currentQ.id, opt)}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between text-xs font-semibold shadow-2xs ${
                          isSelected
                            ? "bg-[#204434] text-white border-[#204434] shadow-sm font-bold"
                            : "bg-[#FFFCF6] border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Thanh chuyển câu Previous / Next */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((p) => Math.max(0, p - 1))}
                className="px-5 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] text-xs font-bold text-[#204434] hover:bg-[#FAF7F0] disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              {/* Danh sách số câu để nhảy nhanh */}
              <div className="hidden sm:flex items-center gap-1 overflow-x-auto max-w-sm px-2">
                {questions.map((q, idx) => {
                  const isAnswered = !!userAnswers[q.id];
                  const isCurrent = currentQIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                        isCurrent
                          ? "bg-[#204434] text-white ring-2 ring-[#BC9B6B]"
                          : isAnswered
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-white border border-[#E5DEC9] text-[#315E48]"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {currentQIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQIndex((p) => Math.min(questions.length - 1, p + 1))}
                  className="px-6 py-2.5 rounded-2xl bg-[#204434] text-white text-xs font-bold hover:bg-[#183629] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Câu kế tiếp</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (confirm("Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?")) {
                      handleAutoSubmit();
                    }
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-900 text-white text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Hoàn thành & Nộp bài</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MÀN HÌNH 3: BÁO CÁO KẾT QUẢ & CHỨNG CHỈ HSK                          */}
        {/* =================================================================== */}
        {examState === "RESULT" && examResult && (
          <div className="space-y-6 animate-fadeIn">
            {/* Phiếu báo điểm chính thức */}
            <div className="bg-[#FFFCF6] border-2 border-[#BC9B6B] rounded-3xl p-6 sm:p-10 shadow-lg space-y-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-32 h-32 bg-[#BC9B6B]/10 rounded-full pointer-events-none" />

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest font-bold text-[#8F6D3B]">
                  Báo Cáo Kết Quả Thi Thử HSK Quốc Tế
                </span>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#204434]">
                  {selectedExamTitle}
                </h2>
                <p className="text-xs text-[#315E48]">
                  Thang điểm chuẩn CTI · Thời gian hoàn thành: {new Date().toLocaleDateString("vi-VN")}
                </p>
              </div>

              {/* Tổng điểm và Huy hiệu Đạt / Không đạt */}
              <div className="p-6 bg-white rounded-2xl border border-[#E5DEC9] max-w-sm mx-auto shadow-inner space-y-2">
                <span className="text-xs text-[#315E48] font-bold">TỔNG ĐIỂM ĐẠT ĐƯỢC:</span>
                <div className="font-serif font-bold text-5xl text-[#204434]">
                  {examResult.totalScore}
                  <span className="text-xl text-[#8F6D3B] font-mono"> / {examResult.maxScore}đ</span>
                </div>
                <div>
                  {examResult.isPassed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>ĐẠT CHUẨN (Đỗ HSK {selectedLevel})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>CHƯA ĐẠT (Cần từ {examResult.passThreshold}đ để đỗ)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Chi tiết từng phần thi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 bg-white rounded-2xl border border-[#E5DEC9] space-y-1">
                  <span className="text-[11px] font-bold text-[#315E48] block">Phần 1: Nghe hiểu</span>
                  <span className="text-xl font-serif font-bold text-[#204434]">
                    {examResult.listeningScore}/100đ
                  </span>
                  <span className="text-[10px] text-[#8F6D3B] block">
                    Đúng {examResult.listeningCorrect}/{examResult.listeningTotal} câu
                  </span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E5DEC9] space-y-1">
                  <span className="text-[11px] font-bold text-[#315E48] block">Phần 2: Đọc hiểu</span>
                  <span className="text-xl font-serif font-bold text-[#204434]">
                    {examResult.readingScore}/100đ
                  </span>
                  <span className="text-[10px] text-[#8F6D3B] block">
                    Đúng {examResult.readingCorrect}/{examResult.readingTotal} câu
                  </span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E5DEC9] space-y-1">
                  <span className="text-[11px] font-bold text-[#315E48] block">Phần 3: Viết & Ngữ pháp</span>
                  <span className="text-xl font-serif font-bold text-[#204434]">
                    {selectedLevel <= 2 ? "Miễn thi viết" : `${examResult.writingScore}/100đ`}
                  </span>
                  <span className="text-[10px] text-[#8F6D3B] block">
                    {selectedLevel <= 2 ? "HSK 1-2 không có phần viết" : `Đúng ${examResult.writingCorrect}/${examResult.writingTotal} câu`}
                  </span>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setExamState("INTRO")}
                  className="px-6 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] text-xs font-bold text-[#204434] hover:bg-[#FAF7F0] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chọn đề thi khác</span>
                </button>

                <Link
                  href="/s/home"
                  className="px-6 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#183629] text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs"
                >
                  <span>Quay lại trang chủ học tập</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Xem lại đáp án và lời giải chi tiết */}
            <div className="bg-white border border-[#E5DEC9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#8F6D3B]" />
                <span>Xem lại bài làm và lời giải chi tiết ({questions.length} câu)</span>
              </h3>

              <div className="space-y-3 pt-2">
                {questions.map((q, idx) => {
                  const userAns = userAnswers[q.id];
                  const isRight = userAns && userAns.trim() === q.correctAnswer.trim();
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        isRight ? "bg-emerald-50/50 border-emerald-200" : "bg-red-50/50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#204434]">
                          Câu {idx + 1} ({q.section}):
                        </span>
                        {isRight ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đúng (+10đ)
                          </span>
                        ) : (
                          <span className="text-red-700 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Chưa đúng
                          </span>
                        )}
                      </div>

                      <p className="text-[#315E48] font-medium">{q.prompt}</p>
                      {q.subPrompt && <p className="font-serif font-bold text-sm text-[#204434]">{q.subPrompt}</p>}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-[#8F6D3B] font-semibold">Bạn chọn: </span>
                          <strong className={isRight ? "text-emerald-800" : "text-red-800"}>
                            {userAns || "(Chưa chọn đáp án)"}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#8F6D3B] font-semibold">Đáp án đúng: </span>
                          <strong className="text-emerald-800">{q.correctAnswer}</strong>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/80 border border-[#E5DEC9] text-[11px] text-[#315E48] leading-relaxed">
                        <strong>Giải thích:</strong> {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
