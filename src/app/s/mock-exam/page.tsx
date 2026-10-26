"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
}

export default function MockExamPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [examState, setExamState] = useState<"INTRO" | "EXAM" | "RESULT">("INTRO");

  // Thời gian làm bài (đếm ngược theo giây)
  const [timeLeft, setTimeLeft] = useState<number>(35 * 60); // 35 phút mặc định cho HSK 1
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Bộ câu hỏi thi thử
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

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

  // Tạo đề thi thử động từ dữ liệu giáo trình chuẩn HSK
  const generateMockExam = (level: number) => {
    const lessons = getLessonsByHskLevel(level);
    const mockList: MockQuestion[] = [];

    // Thu thập toàn bộ từ vựng và ngữ pháp của cấp HSK này
    const allVocabs: any[] = [];
    const allGrammars: any[] = [];

    lessons.forEach((ls) => {
      if (ls.vocabList) allVocabs.push(...ls.vocabList);
      if (ls.grammarList) allGrammars.push(...ls.grammarList);
    });

    const shuffledVocabs = [...allVocabs].sort(() => 0.5 - Math.random());

    // 1. PHẦN THI 1: NGHE HIỂU (LISTENING - 10 CÂU MÔ PHỎNG)
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
        subPrompt: `[Bấm nút loa để nghe phát thanh viên đọc câu hỏi]`,
        hanziToSpeak: v.hanzi,
        options: opts,
        correctAnswer: meaning,
        explanation: `Phát âm: "${v.hanzi}" (${v.pinyin}) có nghĩa là: "${meaning}".`,
      });
    });

    // 2. PHẦN THI 2: ĐỌC HIỂU (READING - 10 CÂU MÔ PHỎNG)
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
      });
    });

    // 3. PHẦN THI 3: VIẾT & NGỮ PHÁP (WRITING - 5 CÂU MÔ PHỎNG)
    const normalizedG = normalizeGrammarList(allGrammars.slice(0, 10), 1);
    normalizedG.slice(0, 5).forEach((g, idx) => {
      const promptText = `Cấu trúc ngữ pháp '${g.title}' được dùng đúng trong câu nào sau đây?`;
      const correctEx = g.examples?.[0]?.zh || "你好！";
      const opts = [
        correctEx,
        `不${correctEx}`,
        `${correctEx}吗不是`,
        `吗${correctEx}`,
      ].sort(() => 0.5 - Math.random());
      const explanation = `Cấu trúc chuẩn: ${g.structure}. Ý nghĩa: ${g.meaningVi}. Cách dùng: ${g.usage || g.summary}.`;

      mockList.push({
        id: `W_${idx + 1}`,
        section: "WRITING",
        prompt: promptText,
        subPrompt: `Cấu trúc: ${g.structure}`,
        options: opts,
        correctAnswer: correctEx,
        explanation,
      });
    });

    setQuestions(mockList);
    setCurrentQIndex(0);
    setUserAnswers({});
    setTimeLeft(level === 1 ? 35 * 60 : level === 2 ? 55 * 60 : 90 * 60);
  };

  const handleStartExam = () => {
    generateMockExam(selectedLevel);
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

  // Nộp bài và chấm điểm theo thang điểm 300 chuẩn quốc tế
  const handleAutoSubmit = () => {
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

    // Thang điểm 300 (hoặc 200 cho HSK 1-2):
    // HSK 1 - 2: Nghe 100đ, Đọc 100đ => Tổng 200đ, Đạt >= 120đ
    // HSK 3 - 6: Nghe 100đ, Đọc 100đ, Viết 100đ => Tổng 300đ, Đạt >= 180đ
    const isLevel12 = selectedLevel <= 2;
    const maxScore = isLevel12 ? 200 : 300;
    const passThreshold = isLevel12 ? 120 : 180;

    const listeningScore = Math.round((listeningCorrect / listeningTotal) * 100);
    const readingScore = Math.round((readingCorrect / readingTotal) * 100);
    const writingScore = isLevel12 ? 0 : Math.round((writingCorrect / writingTotal) * 100);

    const totalScore = isLevel12 ? listeningScore + readingScore : listeningScore + readingScore + writingScore;
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

    // Lưu kết quả và thưởng XP nếu đỗ
    if (isPassed) {
      try {
        const currentUserStr = localStorage.getItem("currentUser");
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
        if (currentUser?.username) {
          fetch("/api/v1/my/games/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: currentUser.username,
              score: 50,
              maxCombo: 1,
              gameType: "HSK_MOCK_EXAM",
            }),
          });
        }
      } catch (e) {
        console.warn("Save mock exam xp error:", e);
      }
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
            <p className="text-[11px] text-[#315E48]">Mô phỏng 100% đề thi máy CTI/Hanban tiêu chuẩn</p>
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
              Nộp bài
            </button>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* =================================================================== */}
        {/* MÀN HÌNH 1: HƯỚNG DẪN & CHỌN CẤP ĐỘ THI                             */}
        {/* =================================================================== */}
        {examState === "INTRO" && (
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/50 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 animate-fadeIn">
            <div className="text-center space-y-2 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#204434] text-[#BC9B6B] flex items-center justify-center mx-auto shadow-md">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="font-serif font-bold text-2xl text-[#204434]">
                Kỳ Thi Thử Năng Lực Hán Ngữ HSK
              </h2>
              <p className="text-xs text-[#315E48] leading-relaxed">
                Đánh giá toàn diện 3 kỹ năng Nghe hiểu, Đọc hiểu và Ngữ pháp/Viết. Điểm số được quy đổi theo thang điểm quốc tế của Bộ Giáo dục Trung Quốc.
              </p>
            </div>

            {/* Chọn Cấp HSK */}
            <div className="space-y-3 max-w-md mx-auto">
              <label className="text-xs font-bold text-[#204434] block text-center">
                Chọn cấp độ HSK bạn muốn thi thử:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer font-serif font-bold text-sm ${
                      selectedLevel === lvl
                        ? "bg-[#204434] text-white border-[#204434] shadow-xs"
                        : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#FAF7F0]"
                    }`}
                  >
                    HSK {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Thông tin cấu trúc bài thi */}
            <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] text-xs space-y-2 max-w-lg mx-auto">
              <span className="font-bold text-[#204434] block">Quy chế phòng thi:</span>
              <ul className="space-y-1.5 text-[#315E48] list-disc list-inside">
                <li>
                  Thời gian thi: <strong>{selectedLevel === 1 ? 35 : selectedLevel === 2 ? 55 : 90} phút</strong> (tự động thu bài khi hết giờ).
                </li>
                <li>
                  Thang điểm: <strong>{selectedLevel <= 2 ? "200 điểm (Đỗ từ 120 điểm)" : "300 điểm (Đỗ từ 180 điểm)"}</strong>.
                </li>
                <li>
                  Phần Nghe hiểu: Học sinh bấm nút loa để nghe giọng đọc người bản xứ.
                </li>
                <li>
                  Thưởng nóng: <strong>+50 XP</strong> vào tài khoản khi vượt qua bài thi!
                </li>
              </ul>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={handleStartExam}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#204434] to-[#183629] text-white font-bold text-sm shadow-md hover:scale-105 transition cursor-pointer inline-flex items-center gap-2"
              >
                <span>Vào phòng thi HSK {selectedLevel} ngay</span>
                <ArrowRight className="w-4 h-4" />
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

              {currentQIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQIndex((p) => Math.min(questions.length - 1, p + 1))}
                  className="px-6 py-2.5 rounded-2xl bg-[#204434] text-white text-xs font-bold hover:bg-[#183629] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Câu kế tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (confirm("Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?")) {
                      handleAutoSubmit();
                    }
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Hoàn thành & Nộp bài</span>
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Bảng chấm số câu (Question Palette) */}
            <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-2xl p-4 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-[#204434] block">
                Danh sách câu hỏi:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {questions.map((q, idx) => {
                  const answered = !!userAnswers[q.id];
                  const isCurrent = currentQIndex === idx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        isCurrent
                          ? "bg-[#204434] text-white border-[#204434]"
                          : answered
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : "bg-white text-[#6B766D] border-[#E5DEC9]"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MÀN HÌNH 3: BẢNG BÁO ĐIỂM HSK CHUẨN (SCORE REPORT)                  */}
        {/* =================================================================== */}
        {examState === "RESULT" && examResult && (
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/60 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6 animate-fadeIn text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold text-[#8F6D3B] tracking-wider block">
                Kết quả kỳ thi thử HSK {selectedLevel}.0
              </span>
              <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#204434]">
                {examResult.isPassed ? "合格 (ĐẠT CHUẨN)" : "未通过 (CHƯA ĐẠT)"}
              </h2>
              <p className="text-xs text-[#315E48]">
                {examResult.isPassed
                  ? "Chúc mừng bạn đã xuất sắc vượt qua điểm chuẩn kỳ thi! (+50 XP)"
                  : "Bạn chỉ còn thiếu một chút nữa thôi. Hãy xem lại lời giải chi tiết bên dưới để củng cố nhé!"}
              </p>
            </div>

            {/* Thẻ bảng điểm tổng hợp */}
            <div className="p-6 rounded-2xl bg-white border border-[#E5DEC9] shadow-sm max-w-lg mx-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
                <span className="text-xs font-bold text-[#6B766D]">Tổng điểm đạt được:</span>
                <span className="font-serif font-extrabold text-3xl text-[#204434]">
                  {examResult.totalScore} / {examResult.maxScore}đ
                </span>
              </div>

              {/* Chi tiết từng phần */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1">
                  <span className="text-[10px] text-[#6B766D] font-bold block">Nghe hiểu</span>
                  <div className="font-mono font-bold text-lg text-[#204434]">
                    {examResult.listeningScore}đ
                  </div>
                  <span className="text-[9.5px] text-[#8F6D3B]">
                    ({examResult.listeningCorrect}/{examResult.listeningTotal} câu)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1">
                  <span className="text-[10px] text-[#6B766D] font-bold block">Đọc hiểu</span>
                  <div className="font-mono font-bold text-lg text-[#204434]">
                    {examResult.readingScore}đ
                  </div>
                  <span className="text-[9.5px] text-[#8F6D3B]">
                    ({examResult.readingCorrect}/{examResult.readingTotal} câu)
                  </span>
                </div>

                {selectedLevel >= 3 && (
                  <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-[#6B766D] font-bold block">Viết / Ngữ pháp</span>
                    <div className="font-mono font-bold text-lg text-[#204434]">
                      {examResult.writingScore}đ
                    </div>
                    <span className="text-[9.5px] text-[#8F6D3B]">
                      ({examResult.writingCorrect}/{examResult.writingTotal} câu)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Các nút hành động */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleStartExam}
                className="px-6 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-xs shadow-xs inline-flex items-center gap-2 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Thi lại lần nữa</span>
              </button>
              <Link
                href="/s/home#practice"
                className="px-5 py-2.5 rounded-xl border border-[#E5DEC9] bg-white text-[#204434] font-bold text-xs hover:bg-[#FAF7F0] transition"
              >
                Quay về phòng luyện
              </Link>
            </div>

            {/* Chi tiết đáp án & Lời giải */}
            <div className="text-left pt-6 border-t border-[#E5DEC9] space-y-3">
              <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#8F6D3B]" />
                <span>Xem lại bài làm & Lời giải chi tiết:</span>
              </h3>

              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const userAns = userAnswers[q.id];
                  const isRight = userAns && userAns.trim() === q.correctAnswer.trim();

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        isRight
                          ? "bg-emerald-50/60 border-emerald-200"
                          : "bg-rose-50/60 border-rose-200"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#204434]">
                          Câu #{idx + 1} · {q.prompt}
                        </span>
                        <span className={isRight ? "text-emerald-700" : "text-rose-700"}>
                          {isRight ? "✓ Đúng" : "✕ Sai"}
                        </span>
                      </div>

                      {q.subPrompt && (
                        <div className="font-serif font-bold text-base text-[#204434]">
                          {q.subPrompt}
                        </div>
                      )}

                      <div className="text-[11px] space-y-0.5">
                        <div>
                          Câu trả lời của bạn:{" "}
                          <strong className={isRight ? "text-emerald-800" : "text-rose-800"}>
                            {userAns || "Chưa làm"}
                          </strong>
                        </div>
                        <div>
                          Đáp án chính xác: <strong className="text-[#204434]">{q.correctAnswer}</strong>
                        </div>
                      </div>

                      {q.explanation && (
                        <div className="p-2.5 rounded-xl bg-white/80 border border-[#E5DEC9] text-[#315E48] text-[11px] leading-relaxed">
                          <span className="font-bold text-[#204434] block">Giải thích:</span>
                          <p>{q.explanation}</p>
                        </div>
                      )}
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
