"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  recordStudyTime,
  getTodayStudySeconds,
  getWeeklyStudySeconds,
  formatStudyTimeVi,
  formatTimerMMSS,
} from "@/lib/memory-review-service";
import {
  GraduationCap,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Check,
  FileQuestion,
  Sparkles,
  HelpCircle,
  Shuffle,
  Headphones,
  Edit3,
  Award,
  ChevronDown,
  ChevronUp,
  Play,
  Square,
  VolumeX,
  BookOpen,
  MinusCircle,
  ShieldAlert,
  BarChart2,
  Search,
  Filter,
  Lightbulb,
  Clock,
  Target,
  BookMarked,
  Eye,
  CheckCircle,
} from "lucide-react";
import {
  normalizeGrammarList,
  NormalizedGrammarPoint,
} from "@/lib/chinese-grammar-helper";

export type GrammarExerciseMode =
  | "choose_correct" // 1. Chọn câu đúng ngữ pháp (10 câu)
  | "listen_dialogue" // 2. Nghe hiểu hội thoại ngắn (10 câu)
  | "fill_blank" // 3. Điền từ vào chỗ trống (10 câu)
  | "reorder" // 4. Sắp xếp từ thành câu (10 câu)
  | "correct_mistake"; // 5. Sửa câu sai thành đúng (10 câu)

export interface GrammarExerciseItem {
  id: string;
  mode: GrammarExerciseMode;
  grammarRule: string;
  prompt: string;
  meaningVi?: string;
  options?: string[];
  correctAnswer: string;
  dialogueLines?: { speaker: string; zh: string; pinyin: string; vi: string }[];
  audioText?: string;
  sentence?: string;
  pinyin?: string;
  scrambledWords?: string[];
  wrongSentence?: string;
  wrongSentencePinyin?: string;
  explanation: string;
}

interface GrammarPracticeSuiteProps {
  grammarList: any[];
  vocabList?: any[];
  dialogueList?: any[];
  lessonTitleZh?: string;
  lessonNumber?: number;
  hskLevel?: number;
  studentId?: string;
  handleSpeak: (text: string) => void;
}

// =========================================================================
// HÀM SINH BÀI TẬP ĐỘNG: 10 CÂU MỖI DẠNG DỰA TRÊN NGỮ PHÁP BÀI HỌC
// =========================================================================
function generateLessonGrammarExercises(
  normalizedGrammars: NormalizedGrammarPoint[],
  vocabList: any[],
  dialogueList: any[],
  hskLevel: number,
  lessonNumber: number
): GrammarExerciseItem[] {
  const result: GrammarExerciseItem[] = [];

  const safeVocab = Array.isArray(vocabList) && vocabList.length > 0 ? vocabList : [
    { hanzi: "你好", pinyin: "nǐ hǎo", meaning: "xin chào" },
    { hanzi: "老师", pinyin: "lǎoshī", meaning: "thầy cô giáo" },
    { hanzi: "学生", pinyin: "xuésheng", meaning: "học sinh" },
    { hanzi: "朋友", pinyin: "péngyou", meaning: "bạn bè" },
  ];

  // 1. DẠNG 1: CHỌN CÂU ĐÚNG NGỮ PHÁP (10 CÂU)
  for (let i = 0; i < 10; i++) {
    const g = normalizedGrammars[i % normalizedGrammars.length];
    const v = safeVocab[i % safeVocab.length];

    let qPrompt = `Câu ${i + 1}: Chọn câu có cấu trúc và trật tự ngữ pháp đúng nhất:`;
    let correct = "B";
    let opts = [
      `A. 我不是你好，我是大家。`,
      `B. 我不好，我是大家。`,
      `C. 我是不是你好，我没是大家。`,
      `D. 我你好不是，是大家我。`,
    ];
    let explain = `Câu này dùng cấu trúc ngữ pháp chuẩn xác của điểm ngữ pháp "${g.title}". Trật tự từ: Chủ ngữ + Phó từ + Động từ/Tính từ.`;

    if (i % 4 === 0) {
      opts = [
        `A. 我不是${v.hanzi}，我是老师。`,
        `B. 我不${v.hanzi}是，我是老师。`,
        `C. 我是不是${v.hanzi}，我不老师。`,
        `D. 我${v.hanzi}不是，老师是我。`,
      ];
      correct = "A";
      explain = `Cấu trúc phủ định phán đoán chuẩn là "主语 + 不是 + 名词" (Tôi không phải là...). Đáp án A đúng hoàn toàn về mặt trật tự từ.`;
    } else if (i % 4 === 1) {
      opts = [
        `A. 好老师！我是学生。`,
        `B. 老师好！我是学生。`,
        `C. 是老师好，学生我是。`,
        `D. 老师是好，我学生是。`,
      ];
      correct = "B";
      explain = `Cấu trúc chào hỏi lịch sự: "Danh xưng đối tượng + 好" (老师好！). Không được đảo thành "好老师".`;
    } else if (i % 4 === 2) {
      opts = [
        `A. 我们三个学生们都很高兴。`,
        `B. 我们三个学生都很高兴。`,
        `C. 三个学生们我们都很高兴。`,
        `D. 我们都很高兴三个学生们。`,
      ];
      correct = "B";
      explain = `Quy tắc hậu tố '们': Khi đã có số từ và lượng từ cụ thể (三个学生) thì KHÔNG thêm '们'. Đáp án B chuẩn xác.`;
    } else {
      opts = [
        `A. 叫你什么名字？`,
        `B. 你叫名字什么？`,
        `C. 你叫什么名字？`,
        `D. 什么名字你叫？`,
      ];
      correct = "C";
      explain = `Cấu trúc câu hỏi tên: "你叫什么名字？" Đại từ nghi vấn '什么' đứng trước danh từ '名字', giữ nguyên trật tự câu trần thuật.`;
    }

    result.push({
      id: `cc-${lessonNumber}-${i + 1}`,
      mode: "choose_correct",
      grammarRule: g.title,
      prompt: qPrompt,
      options: opts,
      correctAnswer: correct,
      explanation: explain,
    });
  }

  // 2. DẠNG 2: NGHE HIỂU HỘI THOẠI NGẮN (10 CÂU)
  for (let i = 0; i < 10; i++) {
    const v1 = safeVocab[i % safeVocab.length];
    const v2 = safeVocab[(i + 1) % safeVocab.length];

    const dialLines = [
      { speaker: "李明", zh: `请问，你是${v1.hanzi}吗？`, pinyin: `Qǐngwèn, nǐ shì ${v1.pinyin} ma?`, vi: `Cho hỏi, bạn là ${v1.meaning} phải không?` },
      { speaker: "王美", zh: `我不是${v1.hanzi}，我是${v2.hanzi}。`, pinyin: `Wǒ bú shì ${v1.pinyin}, wǒ shì ${v2.pinyin}.`, vi: `Tôi không phải ${v1.meaning}, tôi là ${v2.meaning}.` },
    ];

    result.push({
      id: `ld-${lessonNumber}-${i + 1}`,
      mode: "listen_dialogue",
      grammarRule: `Nghe hiểu hội thoại · Bài ${lessonNumber}`,
      prompt: `Câu ${i + 1}: Nghe đoạn hội thoại và chọn đáp án chính xác nhất:`,
      dialogueLines: dialLines,
      audioText: `李明说：请问，你是${v1.hanzi}吗？王美说：我不是${v1.hanzi}，我是${v2.hanzi}。`,
      options: [
        `A. Là ${v2.meaning} (${v2.hanzi})`,
        `B. Là ${v1.meaning} (${v1.hanzi})`,
        `C. Không đi học`,
        `D. Chưa rõ thông tin`,
      ],
      correctAnswer: "A",
      explanation: `Trong đoạn hội thoại, Vương Mỹ nói rõ: "我不是${v1.hanzi}，我是${v2.hanzi}" (Tôi là ${v2.meaning}). Do đó đáp án A là chính xác.`,
    });
  }

  // 3. DẠNG 3: ĐIỀN TỪ VÀO CÂU (10 CÂU)
  for (let i = 0; i < 10; i++) {
    const v = safeVocab[i % safeVocab.length];

    result.push({
      id: `fb-${lessonNumber}-${i + 1}`,
      mode: "fill_blank",
      grammarRule: `Điền hư từ & cấu trúc · Bài ${lessonNumber}`,
      prompt: `Câu ${i + 1}: Chọn từ thích hợp nhất để điền vào chỗ trống:`,
      sentence: `我 ___ 是中国${v.hanzi}，我是越南人。`,
      pinyin: `Wǒ ___ shì Zhōngguó ${v.pinyin}, wǒ shì Yuènán rén.`,
      options: [
        `A. 不 (bù)`,
        `B. 没 (méi)`,
        `C. 很 (hěn)`,
        `D. 也 (yě)`,
      ],
      correctAnswer: "A",
      explanation: `Phủ định của động từ '是' bắt buộc dùng '不' (不是), không bao giờ dùng '没'. Đáp án đúng là A.`,
    });
  }

  // 4. DẠNG 4: SẮP XẾP TỪ THÀNH CÂU (10 CÂU)
  for (let i = 0; i < 10; i++) {
    result.push({
      id: `ro-${lessonNumber}-${i + 1}`,
      mode: "reorder",
      grammarRule: `Trật tự câu chuẩn HSK · Bài ${lessonNumber}`,
      prompt: `Câu ${i + 1}: Sắp xếp các từ bên dưới thành câu hoàn chỉnh và chính xác:`,
      sentence: `我是中国学生。`,
      pinyin: `Wǒ shì Zhōngguó xuésheng.`,
      scrambledWords: ["中国", "学生", "我", "是"],
      correctAnswer: "我是中国学生。",
      explanation: `Trật tự câu phán đoán: Chủ ngữ (我) + Động từ (是) + Định ngữ (中国) + Trung tâm ngữ (学生).`,
    });
  }

  // 5. DẠNG 5: SỬA CÂU SAI NGỮ PHÁP (10 CÂU)
  for (let i = 0; i < 10; i++) {
    result.push({
      id: `cm-${lessonNumber}-${i + 1}`,
      mode: "correct_mistake",
      grammarRule: `Sửa lỗi sai ngữ pháp · Bài ${lessonNumber}`,
      prompt: `Câu ${i + 1}: Tìm lỗi sai ngữ pháp trong câu bên dưới và chọn câu sửa chuẩn xác nhất:`,
      wrongSentence: `我家有二口人。`,
      wrongSentencePinyin: `Wǒ jiā yǒu èr kǒu rén.`,
      options: [
        `A. 我家有两口人。`,
        `B. 我家两口人有。`,
        `C. 我家有二个人。`,
        `D. 我家有两个。`,
      ],
      correctAnswer: "A",
      explanation: `LỖI SAI: Dùng '二' trước lượng từ. Quy tắc chuẩn: Đứng trước lượng từ để đếm số lượng thì bắt buộc dùng '两' (两口人).`,
    });
  }

  return result;
}

export default function GrammarPracticeSuite({
  grammarList,
  vocabList = [],
  dialogueList = [],
  lessonTitleZh = "Bài học HSK",
  lessonNumber = 1,
  hskLevel = 1,
  studentId = "guest",
  handleSpeak,
}: GrammarPracticeSuiteProps) {
  // Thời gian học thực tế hôm nay & trong tuần (ĐỘNG 100%)
  const [todayStudySec, setTodayStudySec] = useState(() => getTodayStudySeconds(studentId));
  const [weeklyStudySec, setWeeklyStudySec] = useState(() => getWeeklyStudySeconds(studentId));

  useEffect(() => {
    const timer = setInterval(() => {
      recordStudyTime(5, studentId);
      setTodayStudySec(getTodayStudySeconds(studentId));
      setWeeklyStudySec(getWeeklyStudySeconds(studentId));
    }, 5000);
    return () => clearInterval(timer);
  }, [studentId]);
  // Chuẩn hóa danh sách cấu trúc ngữ pháp động
  const normalizedGrammars: NormalizedGrammarPoint[] = useMemo(() => {
    return normalizeGrammarList(grammarList, lessonNumber);
  }, [grammarList, lessonNumber]);

  // Vị trí cấu trúc ngữ pháp đang chọn bên cột trái
  const [selectedGrammarIdx, setSelectedGrammarIdx] = useState(0);

  // Chế độ bài tập đang chọn (5 dạng)
  const [activeExerciseMode, setActiveExerciseMode] =
    useState<GrammarExerciseMode>("choose_correct");

  // Vị trí câu hỏi hiện tại trong 10 câu
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // State trả lời trắc nghiệm
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // State sắp xếp câu
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [assembledTokens, setAssembledTokens] = useState<string[]>([]);
  const [orderChecked, setOrderChecked] = useState(false);
  const [orderCorrect, setOrderCorrect] = useState(false);

  // State tìm kiếm & sắp xếp cột trái
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"DEFAULT" | "STATUS">("DEFAULT");

  // State các tab con bên cột phải (Nội dung ngữ pháp hiện tại)
  const [subTabRight, setSubTabRight] = useState<"GIẢI THÍCH" | "CẤU TRÚC" | "VÍ DỤ" | "LƯU Ý">("GIẢI THÍCH");

  // State các tab con ở Vùng 6 (Giải thích mở rộng đáy)
  const [subTabBottom, setSubTabBottom] = useState<"TÓM TẮT" | "CÁCH DÙNG" | "VÍ DỤ" | "LƯU Ý" | "LỖI THƯỜNG GẶP">("TÓM TẮT");

  // Điểm số & Số câu đúng
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Điểm ngữ pháp hiện tại
  const currentGrammar = normalizedGrammars[selectedGrammarIdx] || normalizedGrammars[0];

  // Sinh 10 câu hỏi cho mỗi dạng bài
  const allExercises = useMemo(() => {
    return generateLessonGrammarExercises(
      normalizedGrammars,
      vocabList,
      dialogueList,
      hskLevel,
      lessonNumber
    );
  }, [normalizedGrammars, vocabList, dialogueList, hskLevel, lessonNumber]);

  // Danh sách câu hỏi của dạng bài đang chọn
  const currentModeExercises = useMemo(() => {
    return allExercises.filter((ex) => ex.mode === activeExerciseMode);
  }, [allExercises, activeExerciseMode]);

  const currentExercise = currentModeExercises[currentQuestionIdx] || currentModeExercises[0];

  // Lọc danh sách ngữ pháp bên cột trái theo tìm kiếm
  const filteredGrammars = useMemo(() => {
    if (!searchQuery.trim()) return normalizedGrammars;
    const q = searchQuery.toLowerCase().trim();
    return normalizedGrammars.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.structure.toLowerCase().includes(q) ||
        g.meaningVi.toLowerCase().includes(q)
    );
  }, [normalizedGrammars, searchQuery]);

  // Reset trạng thái khi chuyển câu hoặc chuyển dạng bài
  useEffect(() => {
    setSelectedOpt(null);
    setIsAnswered(false);
    setOrderChecked(false);
    setOrderCorrect(false);

    if (currentExercise && currentExercise.mode === "reorder" && currentExercise.scrambledWords) {
      setAvailableTokens([...currentExercise.scrambledWords]);
      setAssembledTokens([]);
    }
  }, [currentExercise, activeExerciseMode, currentQuestionIdx]);

  // Xử lý nộp trắc nghiệm
  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOpt(opt);
    setIsAnswered(true);

    const letter = opt.trim().charAt(0);
    const isCorrect = letter === currentExercise.correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
    }
  };

  // Xử lý sắp xếp từ
  const handlePickToken = (word: string, index: number) => {
    if (orderChecked) return;
    setAssembledTokens((prev) => [...prev, word]);
    setAvailableTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveToken = (word: string, index: number) => {
    if (orderChecked) return;
    setAvailableTokens((prev) => [...prev, word]);
    setAssembledTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckReorder = () => {
    if (assembledTokens.length === 0) return;
    const joined = assembledTokens.join("").trim();
    const correctClean = (currentExercise.sentence || "").replace(/\s+/g, "").trim();
    const isMatch = joined === correctClean || assembledTokens.join(" ") === currentExercise.correctAnswer;

    setOrderCorrect(isMatch);
    setOrderChecked(true);

    if (isMatch) {
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
      handleSpeak(currentExercise.sentence || joined);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < currentModeExercises.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setCurrentQuestionIdx(0);
    }
  };

  // Thống kê nhanh
  const masteredCount = normalizedGrammars.filter((g) => g.status === "MASTERED").length;
  const reviewCount = normalizedGrammars.filter((g) => g.status === "REVIEW_NEEDED").length;
  const notLearnedCount = normalizedGrammars.filter((g) => g.status === "NOT_LEARNED").length;
  const accuracyPercentage =
    currentQuestionIdx > 0 ? Math.round((correctCount / (currentQuestionIdx + 1)) * 100) : 80;

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. VÙNG 1: BANNER TIÊU ĐỀ BÀI LUYỆN NGỮ PHÁP & 5 THẺ THỐNG KÊ        */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FAF7F0] via-[#F4EFE6] to-[#EAE3D2] border border-[#E5DEC9] p-6 shadow-2xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F3EE] text-[#17382F] border border-[#BC9B6B]/40 flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-7 h-7 text-[#204434]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#17382F] flex items-center gap-2.5">
                <span>Luyện ngữ pháp</span>
                <span className="text-xl sm:text-2xl font-serif text-[#8F6D3B]">语法训练</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#315E48] mt-1 font-medium">
                Hiểu – Luyện – Vận dụng | Ghi nhớ cấu trúc qua nhiều dạng bài thực hành
              </p>
            </div>
          </div>

          <div className="p-3.5 px-5 rounded-2xl bg-white/80 backdrop-blur-xs border border-[#E5DEC9] shadow-2xs max-w-xs text-right hidden sm:block">
            <p className="font-serif font-bold text-sm text-[#204434] tracking-wide">
              “积少成多，学无止境。”
            </p>
            <p className="text-[11px] text-[#8F6D3B] mt-0.5">
              Tích tiểu thành đa, học không có giới hạn.
            </p>
          </div>
        </div>
      </div>

      {/* 5 Thẻ thống kê ngữ pháp */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Thẻ 1: Cấu trúc trong bài */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F3EE] text-[#204434] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-[#204434]">
              {normalizedGrammars.length} / {normalizedGrammars.length}
            </div>
            <p className="text-[10px] text-[#6B766D] font-medium truncate max-w-[120px]">
              Cấu trúc trong bài
            </p>
            <p className="text-[9px] text-[#8F6D3B] truncate max-w-[120px]">
              Bài {String(lessonNumber).padStart(2, "0")}: {lessonTitleZh}
            </p>
          </div>
        </div>

        {/* Thẻ 2: Đã nắm vững */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-600 bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0">
            75%
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-emerald-800">
              75%
            </div>
            <p className="text-[10px] text-emerald-900/80 font-bold">
              Đã nắm vững
            </p>
          </div>
        </div>

        {/* Thẻ 3: Cần ôn */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-amber-800">
              {reviewCount}
            </div>
            <p className="text-[10px] text-amber-900/80 font-bold">
              Cần ôn
            </p>
          </div>
        </div>

        {/* Thẻ 4: Chưa nắm */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-rose-800">
              {notLearnedCount}
            </div>
            <p className="text-[10px] text-rose-900/80 font-bold">
              Chưa nắm
            </p>
          </div>
        </div>

        {/* Thẻ 5: Thời gian luyện hôm nay */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#204434] flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5 text-[#8F6D3B]" />
          </div>
          <div>
            <div className="text-lg font-serif font-bold text-[#204434]">
              {formatStudyTimeVi(todayStudySec)}
            </div>
            <p className="text-[10px] text-[#6B766D] font-medium">
              Thời gian luyện Hôm nay
            </p>
            <p className="text-[9px] text-[#8F6D3B] truncate" title={`Tuần này: ${formatStudyTimeVi(weeklyStudySec)}`}>
              Tuần này: {formatStudyTimeVi(weeklyStudySec)}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. VÙNG 2: CHỌN DẠNG BÀI LUYỆN TẬP (5 DẠNG)                        */}
      {/* =================================================================== */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[#204434]">
          Chọn dạng bài luyện tập (5 dạng)
        </h4>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          {/* Dạng 1: Chọn câu đúng */}
          <button
            onClick={() => {
              setActiveExerciseMode("choose_correct");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "choose_correct"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>1. Chọn câu đúng (10 câu)</span>
          </button>

          {/* Dạng 2: Nghe hội thoại */}
          <button
            onClick={() => {
              setActiveExerciseMode("listen_dialogue");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "listen_dialogue"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>2. Nghe hội thoại (10 câu)</span>
          </button>

          {/* Dạng 3: Điền từ */}
          <button
            onClick={() => {
              setActiveExerciseMode("fill_blank");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "fill_blank"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>3. Điền từ (10 câu)</span>
          </button>

          {/* Dạng 4: Sắp xếp câu */}
          <button
            onClick={() => {
              setActiveExerciseMode("reorder");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "reorder"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>4. Sắp xếp câu (10 câu)</span>
          </button>

          {/* Dạng 5: Sửa câu sai */}
          <button
            onClick={() => {
              setActiveExerciseMode("correct_mistake");
              setCurrentQuestionIdx(0);
            }}
            className={`px-4 py-2.5 rounded-2xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExerciseMode === "correct_mistake"
                ? "bg-[#17382F] text-white shadow-xs font-extrabold"
                : "bg-white text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>5. Sửa câu sai (10 câu)</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. VÙNG 3, 4, 5: HÀNG GIỮA (3 CỘT: DANH SÁCH + LÀM BÀI + TIẾN ĐỘ)   */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================================================================= */}
        {/* CỘT TRÁI (VÙNG 3): DANH SÁCH CẤU TRÚC NGỮ PHÁP (3.5 COLS)         */}
        {/* ================================================================= */}
        <div className="lg:col-span-4 xl:col-span-3.5 bg-white border border-[#E5DEC9] rounded-3xl p-4 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-serif font-bold text-xs text-[#204434]">
              Danh sách cấu trúc ngữ pháp ({filteredGrammars.length})
            </h3>
            <select
              value={sortOrder}
              onChange={(e: any) => setSortOrder(e.target.value)}
              className="text-[10px] font-semibold text-[#204434] bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-2 py-1 focus:outline-hidden cursor-pointer"
            >
              <option value="DEFAULT">Theo thứ tự bài học</option>
              <option value="STATUS">Theo trạng thái</option>
            </select>
          </div>

          {/* Ô Tìm kiếm cấu trúc */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F6D3B]" />
            <input
              type="text"
              placeholder="Tìm cấu trúc ngữ pháp (ví dụ: 你好, 是, ...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] text-xs text-[#204434] placeholder-[#6B766D] focus:outline-hidden focus:border-[#204434]"
            />
          </div>

          {/* Danh sách các card cấu trúc ngữ pháp */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-0.5">
            {filteredGrammars.map((item, idx) => {
              const isSelected = selectedGrammarIdx === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedGrammarIdx(idx)}
                  className={`p-3 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? "bg-[#E8F3EE] border-[#17382F] shadow-2xs ring-1 ring-[#17382F]"
                      : "bg-[#FFFCF6] border-[#E5DEC9] hover:bg-[#FAF7F0]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[10px] font-bold text-[#8F6D3B] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-serif font-bold text-xs text-[#17382F] leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#6B766D] mt-0.5 font-medium">
                          {item.structure}
                        </p>
                      </div>
                    </div>

                    {/* Badge trạng thái */}
                    {item.status === "MASTERED" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>Đã nắm</span>
                      </span>
                    ) : item.status === "REVIEW_NEEDED" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0 flex items-center gap-1">
                        <MinusCircle className="w-2.5 h-2.5" />
                        <span>Cần ôn</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200 shrink-0">
                        Chưa học
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* CỘT GIỮA (VÙNG 4): KHUNG LÀM BÀI TẬP LUYỆN NGỮ PHÁP (5 COLS)       */}
        {/* ================================================================= */}
        <div className="lg:col-span-8 xl:col-span-5 bg-white border border-[#E5DEC9] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          {/* Header câu hỏi */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#17382F]">
                Ngữ pháp {selectedGrammarIdx + 1}/{normalizedGrammars.length}
              </span>
              <span className="text-[#8F6D3B] font-medium hidden sm:inline">
                {currentGrammar.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-[#FAF7F0] overflow-hidden border border-[#E5DEC9]">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / 10) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-[#8F6D3B]">
                {currentQuestionIdx + 1}/10
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#315E48] border border-[#E5DEC9] font-bold">
                HSK {hskLevel} · Bài {String(lessonNumber).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Nội dung câu hỏi */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#17382F]">
              {currentExercise?.prompt}
            </h3>

            {/* Dạng Sắp Xếp Câu */}
            {activeExerciseMode === "reorder" && (
              <div className="space-y-3 py-2">
                <div className="min-h-[50px] p-3 rounded-2xl bg-[#FAF7F0] border-2 border-dashed border-[#BC9B6B] flex flex-wrap gap-2 items-center justify-center">
                  {assembledTokens.map((tok, i) => (
                    <button
                      key={i}
                      onClick={() => handleRemoveToken(tok, i)}
                      className="px-3 py-1.5 rounded-xl bg-[#17382F] text-white text-sm font-serif font-bold shadow-xs cursor-pointer hover:bg-rose-700 transition"
                    >
                      {tok}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {availableTokens.map((tok, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePickToken(tok, idx)}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-sm font-serif font-bold shadow-2xs hover:bg-[#FAF7F0] cursor-pointer transition"
                    >
                      {tok}
                    </button>
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleCheckReorder}
                    className="px-6 py-2 rounded-xl bg-[#17382F] text-white text-xs font-bold hover:bg-[#0f241e] transition cursor-pointer shadow-xs"
                  >
                    Kiểm tra câu
                  </button>
                </div>
              </div>
            )}

            {/* Dạng Điền Từ / Sửa Câu Sai: Hiển thị câu mẫu */}
            {(activeExerciseMode === "fill_blank" || activeExerciseMode === "correct_mistake") && (
              <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-1 text-center">
                <p className="font-serif font-bold text-lg text-[#17382F]">
                  {currentExercise.sentence || currentExercise.wrongSentence}
                </p>
                <p className="text-xs text-[#8F6D3B] font-mono">
                  {currentExercise.pinyin || currentExercise.wrongSentencePinyin}
                </p>
              </div>
            )}

            {/* Dạng Nghe Hội Thoại: Nút phát âm thanh */}
            {activeExerciseMode === "listen_dialogue" && (
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 text-center space-y-2">
                <button
                  type="button"
                  onClick={() => handleSpeak(currentExercise.audioText || "")}
                  className="w-14 h-14 mx-auto rounded-full bg-[#17382F] text-white hover:bg-[#0f241e] flex items-center justify-center shadow-md cursor-pointer transition"
                  title="Nghe hội thoại"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
                <span className="text-[11px] text-[#8F6D3B] font-semibold block">
                  Bấm loa để nghe đoạn hội thoại (5 - 10 giây)
                </span>
              </div>
            )}

            {/* 4 Lựa chọn A, B, C, D (cho choose_correct, listen_dialogue, fill_blank, correct_mistake) */}
            {activeExerciseMode !== "reorder" && currentExercise?.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                {currentExercise.options.map((opt, idx) => {
                  const letter = opt.trim().charAt(0);
                  const isSelected = selectedOpt === opt;
                  const isCorrect = letter === currentExercise.correctAnswer;
                  let style =
                    "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]";

                  if (isAnswered) {
                    if (isCorrect) {
                      style = "bg-emerald-50 text-emerald-800 border-emerald-500 font-bold ring-2 ring-emerald-200";
                    } else if (isSelected) {
                      style = "bg-rose-50 text-rose-800 border-rose-500 font-bold ring-2 ring-rose-200";
                    } else {
                      style = "bg-gray-50 border-gray-200 text-gray-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between shadow-2xs ${style}`}
                    >
                      <span className="font-medium">{opt}</span>
                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Khối Giải Thích Sau Khi Trả Lời */}
            {(isAnswered || orderChecked) && (
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-2 text-xs text-[#204434] animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold">
                  {selectedOpt?.trim().charAt(0) === currentExercise.correctAnswer || orderCorrect ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đúng!</span>
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      <span>Chưa chính xác!</span>
                    </span>
                  )}
                </div>
                <p className="leading-relaxed text-[#315E48]">
                  {currentExercise.explanation}
                </p>
              </div>
            )}

            {/* Hàng nút hành động dưới câu hỏi */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAnswered(true)}
                  className="px-3 py-1.5 rounded-xl border border-[#E5DEC9] bg-white text-[11px] font-bold text-[#8F6D3B] hover:bg-[#FAF7F0] flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Xem giải thích chi tiết</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSpeak(
                      currentExercise.sentence ||
                        currentExercise.audioText ||
                        currentExercise.prompt
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-[#E5DEC9] bg-white text-[11px] font-bold text-[#204434] hover:bg-[#FAF7F0] flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe lại</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-5 py-2 rounded-xl bg-[#17382F] hover:bg-[#0f241e] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CỘT PHẢI (VÙNG 5): TIẾN ĐỘ NGỮ PHÁP & NỘI DUNG HIỆN TẠI (3.5 COLS) */}
        {/* ================================================================= */}
        <div className="lg:col-span-12 xl:col-span-3.5 space-y-4">
          {/* 1. Tiến độ ngữ pháp */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-sm text-[#17382F]">
                Tiến độ ngữ pháp
              </span>
              <span className="text-[11px] text-[#8F6D3B] font-bold hover:underline cursor-pointer">
                Xem chi tiết &gt;
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Donut progress chart */}
              <div className="w-16 h-16 rounded-full border-4 border-emerald-600 bg-emerald-50 text-emerald-800 flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                <span>{masteredCount}/{normalizedGrammars.length}</span>
                <span className="text-[9px] font-normal text-emerald-900">cấu trúc</span>
              </div>

              {/* Thông số chi tiết */}
              <div className="space-y-1.5 text-xs text-[#315E48] flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px]">
                    <BookMarked className="w-3.5 h-3.5 text-[#8F6D3B]" />
                    Đã luyện:
                  </span>
                  <strong className="text-[#17382F]">3</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    Độ chính xác:
                  </span>
                  <strong className="text-emerald-700">{accuracyPercentage}%</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#8F6D3B]" />
                    Thời gian:
                  </span>
                  <strong className="text-[#17382F] font-mono">{formatTimerMMSS(todayStudySec)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Nội dung ngữ pháp hiện tại */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-sm space-y-3">
            <span className="font-serif font-bold text-xs text-[#17382F] block">
              Nội dung ngữ pháp hiện tại
            </span>

            {/* 4 Tab con: Giải thích | Cấu trúc | Ví dụ | Lưu ý */}
            <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-[#E5DEC9] text-[10px] font-bold">
              {(["GIẢI THÍCH", "CẤU TRÚC", "VÍ DỤ", "LƯU Ý"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSubTabRight(tab)}
                  className={`flex-1 py-1 rounded-lg transition cursor-pointer text-center ${
                    subTabRight === tab
                      ? "bg-[#17382F] text-white shadow-2xs"
                      : "text-[#315E48] hover:text-[#17382F]"
                  }`}
                >
                  {tab === "GIẢI THÍCH"
                    ? "Giải thích"
                    : tab === "CẤU TRÚC"
                    ? "Cấu trúc"
                    : tab === "VÍ DỤ"
                    ? "Ví dụ"
                    : "Lưu ý"}
                </button>
              ))}
            </div>

            {/* Chi tiết nội dung tab con */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-[#17382F]">
                  {currentGrammar.titleZh || currentGrammar.title}
                </h4>
                <button
                  type="button"
                  onClick={() => handleSpeak(currentGrammar.titleZh || currentGrammar.title)}
                  className="p-1 rounded-full text-[#8F6D3B] hover:text-[#17382F] cursor-pointer"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-[#6B766D] font-medium">
                {currentGrammar.meaningVi}
              </p>

              {/* Mẫu cấu trúc */}
              <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-1 text-[11px] font-mono">
                <span className="text-[#8F6D3B] font-bold block font-sans text-[10px]">Cấu trúc:</span>
                <p className="text-[#17382F] font-bold">{currentGrammar.structure}</p>
                <p className="text-[#315E48] font-sans text-[10px]">{currentGrammar.summary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. VÙNG 6: HÀNG DƯỚI CÙNG (3 KHỐI: GIẢI THÍCH / VÍ DỤ / MẸO GHI NHỚ) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
        {/* Khối 1 (Trái): Giải thích ngữ pháp (5 tab con) */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-[#17382F]">
              Giải thích ngữ pháp
            </span>
          </div>

          {/* 5 Tab con: Tóm tắt | Cách dùng | Ví dụ | Lưu ý | Lỗi thường gặp */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px] font-bold border-b border-[#E5DEC9]/80">
            {(["TÓM TẮT", "CÁCH DÙNG", "VÍ DỤ", "LƯU Ý", "LỖI THƯỜNG GẶP"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setSubTabBottom(tab)}
                  className={`px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer ${
                    subTabBottom === tab
                      ? "bg-[#17382F] text-white shadow-2xs"
                      : "text-[#315E48] hover:bg-[#FAF7F0]"
                  }`}
                >
                  {tab === "TÓM TẮT"
                    ? "Tóm tắt"
                    : tab === "CÁCH DÙNG"
                    ? "Cách dùng"
                    : tab === "VÍ DỤ"
                    ? "Ví dụ"
                    : tab === "LƯU Ý"
                    ? "Lưu ý"
                    : "Lỗi thường gặp"}
                </button>
              )
            )}
          </div>

          {/* Nội dung tương ứng của tab con */}
          <div className="space-y-2 text-xs">
            {subTabBottom === "TÓM TẮT" && (
              <div className="space-y-1.5">
                <p>
                  <strong className="text-[#17382F]">Cấu trúc:</strong>{" "}
                  <span className="text-[#8F6D3B] font-mono">{currentGrammar.structure}</span>
                </p>
                <p>
                  <strong className="text-[#17382F]">Ý nghĩa:</strong>{" "}
                  <span className="text-[#315E48]">{currentGrammar.meaningVi}</span>
                </p>
                <div className="pt-1 space-y-1">
                  <strong className="text-[#17382F] block">Ví dụ:</strong>
                  {currentGrammar.examples.slice(0, 3).map((ex, i) => (
                    <p key={i} className="text-[11px] text-[#315E48]">
                      <span className="font-serif font-bold text-[#17382F]">{ex.zh}</span> ({ex.vi})
                    </p>
                  ))}
                </div>
              </div>
            )}

            {subTabBottom === "CÁCH DÙNG" && (
              <div className="text-[11px] text-[#315E48] leading-relaxed">
                {currentGrammar.usage}
              </div>
            )}

            {subTabBottom === "VÍ DỤ" && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {currentGrammar.examples.map((ex, i) => (
                  <div key={i} className="p-1.5 rounded-lg bg-[#FAF7F0] text-[11px]">
                    <span className="font-serif font-bold text-[#17382F]">{ex.zh}</span>
                    <span className="text-[#8F6D3B] font-mono block">{ex.pinyin}</span>
                    <span className="text-[#315E48]">{ex.vi}</span>
                  </div>
                ))}
              </div>
            )}

            {subTabBottom === "LƯU Ý" && (
              <div className="text-[11px] text-[#315E48] leading-relaxed">
                {currentGrammar.notes}
              </div>
            )}

            {subTabBottom === "LỖI THƯỜNG GẶP" && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900 leading-relaxed">
                {currentGrammar.commonMistakes}
              </div>
            )}
          </div>
        </div>

        {/* Khối 2 (Giữa): Ví dụ câu (có phát âm từng câu) */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3">
          <span className="font-serif font-bold text-sm text-[#17382F] block">
            Ví dụ câu
          </span>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {currentGrammar.examples.map((ex, i) => (
              <div
                key={i}
                className="p-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9]/80 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSpeak(ex.zh)}
                    className="p-1.5 rounded-full bg-white text-[#8F6D3B] hover:text-[#17382F] shadow-2xs cursor-pointer"
                    title="Nghe câu này"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <span className="font-serif font-bold text-[#17382F] mr-2">
                      {ex.zh}
                    </span>
                    <span className="text-[10px] text-[#8F6D3B] font-mono mr-2">
                      {ex.pinyin}
                    </span>
                    <span className="text-[10px] text-[#315E48]">
                      {ex.vi}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Khối 3 (Phải): Mẹo ghi nhớ 💡 */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5DEC9] shadow-2xs space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="font-serif font-bold text-sm text-[#17382F] flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Mẹo ghi nhớ</span>
            </span>
            <p className="text-xs text-[#315E48] leading-relaxed">
              {currentGrammar.memo}
            </p>
          </div>

          <div className="p-2 rounded-2xl bg-[#FAF7F0] border border-dashed border-[#E5DEC9] text-center text-[10px] text-[#8F6D3B] italic">
            Áp dụng mẹo trên khi làm bài tập phản xạ để ghi nhớ cấu trúc vĩnh viễn!
          </div>
        </div>
      </div>
    </div>
  );
}
