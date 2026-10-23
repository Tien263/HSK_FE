"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Send,
  AlertCircle,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
} from "lucide-react";

interface QuestionItem {
  id: string;
  orderIndex: number;
  type: string;
  content: string;
  pinyinPrompt: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  options: any;
  points: number;
}

const BENCHMARK_12_QUESTIONS: QuestionItem[] = [
  {
    id: "bm-01",
    orderIndex: 1,
    type: "multiple_choice",
    content: "“休息” (xiūxi) có nghĩa là gì?",
    pinyinPrompt: "xiūxi",
    options: [
      { id: "A", text: "Hôm nay" },
      { id: "B", text: "Nghỉ ngơi" },
      { id: "C", text: "Ngày mai" },
      { id: "D", text: "Bị bệnh" },
    ],
    points: 5,
  },
  {
    id: "bm-02",
    orderIndex: 2,
    type: "matching",
    content: "Nối từ tiếng Trung tương ứng với ý nghĩa tiếng Việt:",
    pinyinPrompt: null,
    options: {
      pairs: [
        { left: "今天 (jīntiān)", right: "Hôm nay" },
        { left: "明天 (míngtiān)", right: "Ngày mai" },
        { left: "昨天 (zuótiān)", right: "Hôm qua" },
        { left: "医院 (yīyuàn)", right: "Bệnh viện" },
      ],
    },
    points: 10,
  },
  {
    id: "bm-03",
    orderIndex: 3,
    type: "flashcard",
    content: "医院",
    pinyinPrompt: "yīyuàn",
    options: {
      front: "医院",
      backPinyin: "yīyuàn",
      backVi: "Bệnh viện",
      exampleZh: "他去医院看病了。(Anh ấy đi bệnh viện khám bệnh.)",
    },
    points: 0,
  },
  {
    id: "bm-04",
    orderIndex: 4,
    type: "fill_blank",
    content: "我想 [_____] 一杯热咖啡。",
    pinyinPrompt: "Wǒ xiǎng [_____] yì bēi rè kāfēi.",
    options: [],
    points: 5,
  },
  {
    id: "bm-05",
    orderIndex: 5,
    type: "sentence_order",
    content: "Sắp xếp các thẻ từ sau thành câu hoàn chỉnh:",
    pinyinPrompt: "Wǒ jīntiān zài jiā xiūxi.",
    options: {
      tokens: ["我", "今天", "在家", "休息"],
    },
    points: 10,
  },
  {
    id: "bm-06",
    orderIndex: 6,
    type: "true_false",
    content: "“明天下雨，所以我们不去公园。” Câu này diễn tả mối quan hệ nguyên nhân - kết quả.",
    pinyinPrompt: "Míngtiān xiàyǔ, suǒyǐ wǒmen bù qù gōngyuán.",
    options: [],
    points: 5,
  },
  {
    id: "bm-07",
    orderIndex: 7,
    type: "handwriting_photo",
    content: "Tập viết chữ “汉字” (hànzì) ra vở 5 lần và chụp ảnh bài làm gửi lên:",
    pinyinPrompt: "hànzì (Hán tự)",
    options: [],
    points: 10,
  },
  {
    id: "bm-08",
    orderIndex: 8,
    type: "essay",
    content: "请写一段话介绍你的家庭 (约50-80字)。",
    pinyinPrompt: "Qǐng xiě yí duàn huà jièshào nǐ de jiātíng.",
    options: [],
    points: 15,
  },
  {
    id: "bm-09",
    orderIndex: 9,
    type: "translation",
    content: "Dịch câu sau sang tiếng Việt: “我打算下个星期去上海出差。”",
    pinyinPrompt: "Wǒ dǎsuàn xià gè xīngqī qù Shànghǎi chūchāi.",
    options: [],
    points: 10,
  },
  {
    id: "bm-10",
    orderIndex: 10,
    type: "find_error",
    content: "Tìm lỗi sai ngữ pháp trong câu sau và viết lại câu đúng: “我很高兴认识你了。”",
    pinyinPrompt: "Wǒ hěn gāoxìng rènshi nǐ le.",
    options: [],
    points: 10,
  },
  {
    id: "bm-11",
    orderIndex: 11,
    type: "listening_choice",
    content: "Nghe đoạn hội thoại và chọn đáp án đúng: Người nữ muốn đi đâu vào ngày mai?",
    pinyinPrompt: "Nǚ: Míngtiān wǒ xiǎng qù gùgōng kànkan.",
    options: [
      { id: "A", text: "Đi siêu thị" },
      { id: "B", text: "Đi Cố Cung (故宫)" },
      { id: "C", text: "Đi thư viện" },
      { id: "D", text: "Ở nhà nghỉ ngơi" },
    ],
    points: 10,
  },
  {
    id: "bm-12",
    orderIndex: 12,
    type: "listening_fill",
    content: "Nghe đoạn phát âm và điền chữ còn thiếu: “他每天早上七点 [_____] 床。”",
    pinyinPrompt: "Tā měitiān zǎoshang qī diǎn [_____] chuáng.",
    options: [],
    points: 5,
  },
];

export default function AttemptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f4ee] text-[#1a3d2f] flex items-center justify-center font-medium">
          Đang nạp đề kiểm tra...
        </div>
      }
    >
      <AttemptInner />
    </Suspense>
  );
}

function AttemptInner() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [secondsRemaining, setSecondsRemaining] = useState(20 * 60);
  const [submitting, setSubmitting] = useState(false);

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Matching widget state: current selected left key
  const [matchingSelectedLeft, setMatchingSelectedLeft] = useState<string | null>(null);

  // Sentence ordering widget state per question
  const [orderingAnswers, setOrderingAnswers] = useState<{ [qId: string]: string[] }>({});

  // Handwriting photo preview per question
  const [photoPreviews, setPhotoPreviews] = useState<{ [qId: string]: string }>({});

  // Flashcard flip state
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  useEffect(() => {
    if (!attemptId) return;

    if (attemptId === "preview" || attemptId.startsWith("demo")) {
      // Check if user has an active draft exam in localStorage
      if (typeof window !== "undefined") {
        try {
          const savedPackages = localStorage.getItem("hanyu_exam_packages");
          if (savedPackages) {
            const parsed = JSON.parse(savedPackages);
            const firstWithQuestions = parsed.find((p: any) => p.questions && p.questions.length > 0);
            if (firstWithQuestions) {
              setQuestions(
                firstWithQuestions.questions.map((q: any, idx: number) => ({
                  id: q.id,
                  orderIndex: idx + 1,
                  type: q.type,
                  content: q.content,
                  pinyinPrompt: q.pinyin || null,
                  audioUrl: q.audioUrl || null,
                  imageUrl: q.imageUrl || null,
                  options:
                    q.options && q.options.length > 0
                      ? q.options
                      : q.matchingPairs
                      ? { pairs: q.matchingPairs }
                      : q.tokens
                      ? { tokens: q.tokens }
                      : q.flashcard || [],
                  points: q.points || 5,
                }))
              );
              setAssignmentTitle(firstWithQuestions.title || "Làm thử đề kiểm tra");
              setLoading(false);
              return;
            }
          }
        } catch {
          // ignore
        }
      }
      setQuestions(BENCHMARK_12_QUESTIONS);
      setAssignmentTitle("Bài thi Chuẩn mực 12 dạng câu hỏi HSK (Bản làm thử)");
      setLoading(false);
      return;
    }

    fetch(`/api/v1/attempts/${attemptId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setAssignmentTitle(data.assignment?.title || "Bài tập kiểm tra HSK");
          setSecondsRemaining((data.assignment?.durationMin || 20) * 60);
          if (data.status === "GRADED" || data.status === "SUBMITTED") {
            router.push(`/s/attempts/${attemptId}/result`);
          }
        } else {
          setQuestions(BENCHMARK_12_QUESTIONS);
          setAssignmentTitle("Bài thi Chuẩn mực 12 dạng câu hỏi HSK (Bản làm thử)");
        }
        setLoading(false);
      })
      .catch(() => {
        setQuestions(BENCHMARK_12_QUESTIONS);
        setAssignmentTitle("Bài thi Chuẩn mực 12 dạng câu hỏi HSK (Bản làm thử)");
        setLoading(false);
      });
  }, [attemptId, router]);

  // Timer countdown
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  // Dirty state navigation guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(answers).length > 0 && !submitting) {
        e.preventDefault();
        e.returnValue = "Bạn đang làm bài thi dở dang. Các câu trả lời chưa nộp có thể bị mất!";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [answers, submitting]);

  const selectAnswer = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleAudioToggle = (url: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlayingAudio(false);
    } else if (audioRef.current.src !== url) {
      audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  };

  // Matching pair handler
  const handleMatchSelect = (questionId: string, leftKey: string, rightVal: string) => {
    // Current matches
    let currentMap: Record<string, string> = {};
    const existingStr = answers[questionId] || "";
    if (existingStr) {
      existingStr.split(";").forEach((pair) => {
        const [l, r] = pair.split(":");
        if (l && r) currentMap[l] = r;
      });
    }

    currentMap[leftKey] = rightVal;
    const newStr = Object.entries(currentMap)
      .map(([l, r]) => `${l}:${r}`)
      .join(";");

    setAnswers((prev) => ({ ...prev, [questionId]: newStr }));
    setMatchingSelectedLeft(null);
  };

  const handleRemoveMatch = (questionId: string, leftKey: string) => {
    let currentMap: Record<string, string> = {};
    const existingStr = answers[questionId] || "";
    if (existingStr) {
      existingStr.split(";").forEach((pair) => {
        const [l, r] = pair.split(":");
        if (l && r && l !== leftKey) currentMap[l] = r;
      });
    }
    const newStr = Object.entries(currentMap)
      .map(([l, r]) => `${l}:${r}`)
      .join(";");
    setAnswers((prev) => ({ ...prev, [questionId]: newStr }));
  };

  // Sentence ordering handler
  const handleAddTokenToOrder = (questionId: string, token: string, tokenIdx: number) => {
    const currentTokens = orderingAnswers[questionId] || [];
    const updated = [...currentTokens, token];
    setOrderingAnswers((prev) => ({ ...prev, [questionId]: updated }));
    setAnswers((prev) => ({ ...prev, [questionId]: updated.join(" ") }));
  };

  const handleRemoveTokenFromOrder = (questionId: string, indexToRemove: number) => {
    const currentTokens = orderingAnswers[questionId] || [];
    const updated = currentTokens.filter((_, idx) => idx !== indexToRemove);
    setOrderingAnswers((prev) => ({ ...prev, [questionId]: updated }));
    setAnswers((prev) => ({ ...prev, [questionId]: updated.join(" ") }));
  };

  const handleResetOrder = (questionId: string) => {
    setOrderingAnswers((prev) => ({ ...prev, [questionId]: [] }));
    setAnswers((prev) => ({ ...prev, [questionId]: "" }));
  };

  // Handwriting photo upload handler
  const handlePhotoUpload = (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPhotoPreviews((prev) => ({ ...prev, [questionId]: base64 }));
      setAnswers((prev) => ({
        ...prev,
        [questionId]: `[PHOTO_ATTACHED:${file.name}] ${answers[questionId] || ""}`,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (
      answeredCount < questions.length &&
      !confirm(
        `Bạn mới trả lời ${answeredCount}/${questions.length} câu. Bạn có chắc chắn muốn nộp bài sớm không?`
      )
    ) {
      return;
    }

    setSubmitting(true);

    if (attemptId === "preview" || attemptId.startsWith("demo")) {
      setTimeout(() => {
        alert(
          `🎉 Nộp bài làm thử thành công!\n\nBạn đã trả lời ${answeredCount}/${questions.length} câu hỏi thuộc 12 dạng đề thi HSK.\nHệ thống đã ghi nhận đầy đủ các câu trả lời của bạn!`
        );
        setSubmitting(false);
      }, 500);
      return;
    }

    try {
      const res = await fetch(`/api/v1/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          durationSec: 20 * 60 - secondsRemaining,
        }),
      });

      const result = await res.json();
      if (result.success) {
        router.push(`/s/attempts/${attemptId}/result`);
      } else {
        alert("Lỗi nộp bài: " + (result.message || "Vui lòng thử lại"));
        setSubmitting(false);
      }
    } catch {
      alert("Không thể kết nối đến máy chủ.");
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] text-[#1a3d2f] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-xl bg-[#991b1b] text-white flex items-center justify-center font-serif text-xl mb-3 animate-pulse">
          考
        </div>
        <p className="text-sm font-bold">Đang nạp đề bài thi...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const qType = (currentQ?.type || "single_choice").toLowerCase();

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1a3d2f] flex flex-col justify-between font-sans">
      {/* Top Header matching Hanyu design */}
      <header className="h-18 bg-[#fcfaf7] border-b border-[#e6decb] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/s/home" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#991b1b] text-white flex items-center justify-center font-serif text-sm font-bold shadow-xs">
              汉语
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8c9a8f] block">
                Phòng thi HSK 🍃
              </span>
              <h1 className="text-sm sm:text-base font-bold text-[#1a3d2f] truncate max-w-sm sm:max-w-md font-serif">
                {assignmentTitle}
              </h1>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-2 bg-[#f0eee6] border border-[#d8ceb9] px-3.5 py-1.5 rounded-xl text-sm font-mono font-bold text-[#1a3d2f]">
            <Clock className="w-4 h-4 text-[#3d7b56]" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-[#1a3d2f] text-white font-bold text-xs hover:bg-[#122b21] transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? "Đang nộp..." : "Nộp bài"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Question Nav Drawer */}
          <div className="md:col-span-4 bg-[#fcfaf7] border border-[#e6decb] rounded-2xl p-5 order-2 md:order-1 shadow-xs">
            <h3 className="text-xs font-bold text-[#8c9a8f] uppercase tracking-wider mb-4">
              Danh sách câu hỏi ({questions.length} câu)
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setMatchingSelectedLeft(null);
                    }}
                    className={`h-10 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? "bg-[#1a3d2f] text-white shadow-xs"
                        : isAnswered
                        ? "bg-[#e2ebe4] text-[#1a3d2f] border border-[#a4c5ae]"
                        : "bg-[#f7f4ee] text-[#526056] border border-[#e6decb] hover:bg-[#ede7da]"
                    }`}
                  >
                    <span>{idx + 1}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-[#e6decb] text-[11px] text-[#526056] space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-[#1a3d2f]" />
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-[#e2ebe4] border border-[#a4c5ae]" />
                <span>Đã làm ({Object.keys(answers).length}/{questions.length})</span>
              </div>
            </div>
          </div>

          {/* Question Body */}
          <div className="md:col-span-8 bg-[#fcfaf7] border border-[#e6decb] rounded-3xl p-6 sm:p-8 shadow-xs order-1 md:order-2">
            {currentQ && (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#e6decb] mb-6">
                  <span className="text-xs font-bold text-[#1a3d2f] bg-[#f0eee6] px-3 py-1 rounded-full border border-[#d8ceb9]">
                    CÂU {currentIndex + 1} / {questions.length} · {qType.toUpperCase()}
                  </span>
                  <span className="text-xs text-[#8c9a8f]">+{currentQ.points} điểm</span>
                </div>

                {/* Question Header & Content */}
                <div className="mb-6 space-y-2">
                  {currentQ.pinyinPrompt && (
                    <div className="text-sm font-mono text-[#3d7b56] font-semibold">
                      {currentQ.pinyinPrompt}
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-[#1a3d2f] leading-relaxed font-serif">
                    {currentQ.content}
                  </h2>

                  {/* Audio Player if present */}
                  {currentQ.audioUrl && (
                    <div className="p-3 bg-[#f0eee6] rounded-2xl border border-[#d8ceb9] flex items-center justify-between max-w-sm mt-3">
                      <div className="flex items-center gap-2.5 text-xs font-bold text-[#1a3d2f]">
                        <Volume2 className="w-4 h-4 text-[#3d7b56]" />
                        <span>Nghe đoạn ghi âm bài thi</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAudioToggle(currentQ.audioUrl!)}
                        className="px-3 py-1.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#122b21] transition cursor-pointer"
                      >
                        {isPlayingAudio ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Tạm dừng</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Phát âm thanh</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Image Attachment if present */}
                  {currentQ.imageUrl && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-[#d8ceb9] max-w-md bg-white p-2">
                      <img
                        src={currentQ.imageUrl}
                        alt="Hình ảnh bài thi"
                        className="w-full h-auto rounded-xl max-h-64 object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* ========================================================= */}
                {/* DẠNG 1: TRẮC NGHIỆM CHUẨN (SINGLE/MULTI/TRUE_FALSE) */}
                {/* ========================================================= */}
                {Array.isArray(currentQ.options) &&
                  currentQ.options.length > 0 &&
                  !qType.includes("matching") &&
                  !qType.includes("ordering") && (
                    <div className="space-y-3 mb-8">
                      {currentQ.options.map((opt: any) => {
                        const optId = opt.id || opt.key || opt;
                        const optText = opt.text || opt.value || opt;
                        const isSelected = answers[currentQ.id] === optId;
                        return (
                          <button
                            key={optId}
                            type="button"
                            onClick={() => selectAnswer(currentQ.id, optId)}
                            className={`w-full p-4 rounded-2xl border text-left text-sm transition cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-[#e2ebe4] border-[#1a3d2f] text-[#1a3d2f] font-semibold shadow-xs"
                                : "bg-[#f7f4ee] border-[#e6decb] text-[#526056] hover:bg-[#ede7da]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "bg-[#1a3d2f] text-white"
                                    : "bg-[#f0eee6] text-[#1a3d2f] border border-[#d8ceb9]"
                                }`}
                              >
                                {optId}
                              </span>
                              <span className="font-medium text-base">{optText}</span>
                            </div>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-[#3d7b56]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                {/* ========================================================= */}
                {/* DẠNG 2: NỐI TỪ 2 CỘT (MATCHING PAIRS) */}
                {/* ========================================================= */}
                {(qType.includes("matching") || currentQ.options?.pairs) && (
                  <div className="mb-8 space-y-4">
                    <p className="text-xs font-semibold text-[#8c9a8f]">
                      Hướng dẫn: Bấm chọn 1 từ ở cột trái, sau đó bấm chọn từ tương ứng ở cột phải để tạo cặp nối.
                    </p>

                    {(() => {
                      const leftItems =
                        currentQ.options?.pairs?.map((p: any) => p.left) ||
                        (Array.isArray(currentQ.options) ? currentQ.options.map((o: any) => o.left || o.id) : ["A", "B", "C", "D"]);
                      const rightItems =
                        currentQ.options?.pairs?.map((p: any) => p.right) ||
                        (Array.isArray(currentQ.options) ? currentQ.options.map((o: any) => o.right || o.text) : ["1", "2", "3", "4"]);

                      // Parse current matched pairs
                      const matchedMap: Record<string, string> = {};
                      if (answers[currentQ.id]) {
                        answers[currentQ.id].split(";").forEach((pair) => {
                          const [l, r] = pair.split(":");
                          if (l && r) matchedMap[l] = r;
                        });
                      }

                      return (
                        <div className="grid grid-cols-2 gap-4">
                          {/* Cột trái */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-[#1a3d2f] uppercase tracking-wider block">
                              Cột A (Từ vựng)
                            </span>
                            {leftItems.map((leftVal: string) => {
                              const isLinked = !!matchedMap[leftVal];
                              const isSelectedForLinking = matchingSelectedLeft === leftVal;
                              return (
                                <button
                                  key={leftVal}
                                  type="button"
                                  onClick={() => setMatchingSelectedLeft(leftVal)}
                                  className={`w-full p-3.5 rounded-xl border text-left text-sm transition cursor-pointer flex items-center justify-between ${
                                    isSelectedForLinking
                                      ? "bg-amber-100 border-amber-400 font-bold text-amber-900"
                                      : isLinked
                                      ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold"
                                      : "bg-[#f7f4ee] border-[#e6decb] text-[#1a3d2f] hover:bg-[#ede7da]"
                                  }`}
                                >
                                  <span>{leftVal}</span>
                                  {isLinked && (
                                    <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded-md font-bold">
                                      → {matchedMap[leftVal]}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Cột phải */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-[#1a3d2f] uppercase tracking-wider block">
                              Cột B (Nghĩa / Phiên âm)
                            </span>
                            {rightItems.map((rightVal: string) => {
                              const linkedLeft = Object.entries(matchedMap).find(([_, r]) => r === rightVal)?.[0];
                              return (
                                <button
                                  key={rightVal}
                                  type="button"
                                  onClick={() => {
                                    if (matchingSelectedLeft) {
                                      handleMatchSelect(currentQ.id, matchingSelectedLeft, rightVal);
                                    }
                                  }}
                                  className={`w-full p-3.5 rounded-xl border text-left text-sm transition cursor-pointer flex items-center justify-between ${
                                    linkedLeft
                                      ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold"
                                      : matchingSelectedLeft
                                      ? "bg-white border-dashed border-[#1a3d2f] hover:bg-emerald-50"
                                      : "bg-[#f7f4ee] border-[#e6decb] text-[#1a3d2f]"
                                  }`}
                                >
                                  <span>{rightVal}</span>
                                  {linkedLeft && (
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveMatch(currentQ.id, linkedLeft);
                                      }}
                                      className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold hover:bg-red-200 cursor-pointer"
                                    >
                                      Hủy nối
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ========================================================= */}
                {/* DẠNG 5: SẮP XẾP CÂU (SENTENCE ORDERING) */}
                {/* ========================================================= */}
                {(qType.includes("ordering") || currentQ.options?.tokens) && (
                  <div className="mb-8 space-y-4">
                    <p className="text-xs font-semibold text-[#8c9a8f]">
                      Hướng dẫn: Bấm vào các từ bên dưới để ghép thành câu hoàn chỉnh theo đúng thứ tự ngữ pháp.
                    </p>

                    {/* Vùng kết quả câu ghép */}
                    <div className="min-h-16 p-4 rounded-2xl bg-white border-2 border-dashed border-[#1a3d2f] flex flex-wrap items-center gap-2">
                      {(orderingAnswers[currentQ.id] || []).map((token, tIdx) => (
                        <span
                          key={tIdx}
                          onClick={() => handleRemoveTokenFromOrder(currentQ.id, tIdx)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#1a3d2f] text-white font-serif text-base font-bold shadow-xs cursor-pointer hover:bg-red-800 transition flex items-center gap-1.5"
                          title="Bấm để bỏ từ này"
                        >
                          <span>{token}</span>
                          <X className="w-3.5 h-3.5 opacity-70" />
                        </span>
                      ))}

                      {(!orderingAnswers[currentQ.id] || orderingAnswers[currentQ.id].length === 0) && (
                        <span className="text-xs text-[#8c9a8f] italic">
                          (Chưa chọn từ nào. Hãy bấm các thẻ từ vựng bên dưới)
                        </span>
                      )}
                    </div>

                    {/* Danh sách thẻ từ để chọn */}
                    {(() => {
                      const allTokens: string[] =
                        currentQ.options?.tokens ||
                        (Array.isArray(currentQ.options) ? currentQ.options.map((o: any) => o.text || o) : ["我", "在", "北京", "学习", "汉语"]);
                      const selectedTokens = orderingAnswers[currentQ.id] || [];

                      return (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2.5">
                            {allTokens.map((token, idx) => {
                              // Check if token was used
                              const usedCount = selectedTokens.filter((t) => t === token).length;
                              const availableCount = allTokens.filter((t) => t === token).length;
                              const isExhausted = usedCount >= availableCount;

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  disabled={isExhausted}
                                  onClick={() => handleAddTokenToOrder(currentQ.id, token, idx)}
                                  className={`px-4 py-2 rounded-xl text-base font-serif font-bold transition cursor-pointer ${
                                    isExhausted
                                      ? "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed opacity-50"
                                      : "bg-[#f7f4ee] border border-[#e6decb] text-[#1a3d2f] hover:bg-[#1a3d2f] hover:text-white shadow-xs"
                                  }`}
                                >
                                  {token}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleResetOrder(currentQ.id)}
                              className="text-xs text-[#8c9a8f] hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Xếp lại từ đầu</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ========================================================= */}
                {/* DẠNG 7: VIẾT TAY & CHỤP ẢNH NỘP BÀI (HANDWRITING / PHOTO) */}
                {/* ========================================================= */}
                {(qType.includes("handwriting") || qType.includes("photo")) && (
                  <div className="mb-8 space-y-4">
                    <p className="text-xs font-semibold text-[#8c9a8f]">
                      Hướng dẫn: Hãy viết bài ra vở/giấy tập viết chữ Hán, sau đó chụp ảnh rõ nét và tải lên đây.
                    </p>

                    <div className="border-2 border-dashed border-[#d8ceb9] rounded-2xl p-6 bg-white text-center space-y-3">
                      {photoPreviews[currentQ.id] ? (
                        <div className="space-y-3">
                          <img
                            src={photoPreviews[currentQ.id]}
                            alt="Ảnh bài làm"
                            className="max-h-64 mx-auto rounded-xl border border-[#e6decb] shadow-xs object-contain"
                          />
                          <p className="text-xs text-emerald-800 font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Đã đính kèm ảnh bài viết tay thành công!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 py-4">
                          <div className="w-12 h-12 rounded-full bg-[#f0eee6] text-[#1a3d2f] mx-auto flex items-center justify-center">
                            <Upload className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-[#1a3d2f]">
                            Chụp ảnh hoặc chọn file từ thiết bị
                          </p>
                          <p className="text-xs text-[#8c9a8f]">
                            Hỗ trợ định dạng JPG, PNG, WEBP (tối đa 10MB)
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition cursor-pointer shadow-xs">
                          <Upload className="w-4 h-4" />
                          <span>{photoPreviews[currentQ.id] ? "Thay đổi ảnh khác" : "Chọn ảnh nộp bài"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handlePhotoUpload(currentQ.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Ghi chú thêm bằng chữ nếu muốn */}
                    <div>
                      <label className="block text-xs font-bold text-[#1a3d2f] mb-1">
                        Ghi chú thêm cho giáo viên (tùy chọn):
                      </label>
                      <textarea
                        value={answers[currentQ.id]?.replace(/^\[PHOTO_ATTACHED:[^\]]+\]\s*/, "") || ""}
                        onChange={(e) => {
                          const photoTag = answers[currentQ.id]?.match(/^\[PHOTO_ATTACHED:[^\]]+\]/)?.[0] || "";
                          selectAnswer(currentQ.id, photoTag ? `${photoTag} ${e.target.value}` : e.target.value);
                        }}
                        placeholder="Nhập ghi chú hoặc bản dịch chữ Hán của bạn..."
                        className="w-full p-3 rounded-xl border border-[#e6decb] bg-white text-sm text-[#1a3d2f] focus:outline-none focus:border-[#1a3d2f]"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* DẠNG 3: FLASHCARD (FLASHCARD) */}
                {/* ========================================================= */}
                {qType.includes("flashcard") && (
                  <div className="space-y-4 mb-8">
                    <p className="text-xs font-semibold text-[#8c9a8f]">
                      Thẻ ghi nhớ từ vựng: Bấm vào thẻ để lật xem phiên âm và nghĩa tiếng Việt:
                    </p>
                    <div
                      onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                      className="p-8 rounded-3xl border-2 border-dashed border-[#d8ceb9] bg-white text-center cursor-pointer hover:shadow-md transition space-y-3"
                    >
                      {!flashcardFlipped ? (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#8c9a8f] tracking-wider block mb-2">
                            MẶT TRƯỚC (BẤM ĐỂ LẬT THẺ)
                          </span>
                          <div className="text-4xl font-serif font-bold text-[#1a3d2f]">
                            {currentQ.options?.front || currentQ.content}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block mb-1">
                            MẶT SAU (LỜI GIẢI CHI TIẾT)
                          </span>
                          <div className="text-lg font-mono font-bold text-[#3d7b56]">
                            {currentQ.options?.backPinyin || currentQ.pinyinPrompt}
                          </div>
                          <div className="text-xl font-bold text-[#1a3d2f]">
                            {currentQ.options?.backVi || currentQ.options?.meaning || "Nghĩa từ vựng"}
                          </div>
                          {currentQ.options?.exampleZh && (
                            <div className="text-xs text-[#526056] font-serif pt-2 border-t border-[#e6decb]">
                              {currentQ.options?.exampleZh}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => selectAnswer(currentQ.id, "REMEMBERED")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          answers[currentQ.id] === "REMEMBERED"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                        }`}
                      >
                        ✓ Đã ghi nhớ từ này
                      </button>
                      <button
                        type="button"
                        onClick={() => selectAnswer(currentQ.id, "NEED_REVIEW")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          answers[currentQ.id] === "NEED_REVIEW"
                            ? "bg-amber-600 text-white shadow-xs"
                            : "bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100"
                        }`}
                      >
                        ● Cần ôn tập lại
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* DẠNG 6: ĐÚNG / SAI (TRUE_FALSE) */}
                {/* ========================================================= */}
                {qType.includes("true_false") && (
                  <div className="space-y-3 mb-8">
                    <p className="text-xs font-semibold text-[#8c9a8f]">
                      Xác định nhận định trên là Đúng hay Sai:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => selectAnswer(currentQ.id, "TRUE")}
                        className={`p-5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          answers[currentQ.id] === "TRUE"
                            ? "bg-emerald-100 border-emerald-600 text-emerald-950 font-bold shadow-xs"
                            : "bg-[#f7f4ee] border-[#e6decb] text-[#1a3d2f] hover:bg-emerald-50"
                        }`}
                      >
                        <span className="text-xl">✓</span>
                        <span className="font-bold text-base">ĐÚNG (True / 对)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => selectAnswer(currentQ.id, "FALSE")}
                        className={`p-5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          answers[currentQ.id] === "FALSE"
                            ? "bg-red-100 border-red-600 text-red-950 font-bold shadow-xs"
                            : "bg-[#f7f4ee] border-[#e6decb] text-[#1a3d2f] hover:bg-red-50"
                        }`}
                      >
                        <span className="text-xl">✕</span>
                        <span className="font-bold text-base">SAI (False / 错)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* DẠNG TỰ LUẬN / DỊCH CÂU / TÌM LỖI SAI (ESSAY, TRANSLATION, FIND_ERROR) */}
                {/* ========================================================= */}
                {(qType.includes("essay") || qType.includes("translation") || qType.includes("find_error")) && (
                  <div className="mb-8 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#1a3d2f]">
                        {qType.includes("essay")
                          ? "Bài viết tự luận của bạn (tiếng Trung):"
                          : qType.includes("translation")
                          ? "Bản dịch của bạn:"
                          : "Viết lại câu sau khi sửa lỗi sai:"}
                      </label>
                      <span className="text-[11px] text-[#8c9a8f]">
                        {(answers[currentQ.id] || "").length} ký tự
                      </span>
                    </div>
                    <textarea
                      value={answers[currentQ.id] || ""}
                      onChange={(e) => selectAnswer(currentQ.id, e.target.value)}
                      placeholder={
                        qType.includes("essay")
                          ? "Gõ đoạn văn tự luận bằng chữ Hán..."
                          : qType.includes("translation")
                          ? "Gõ câu dịch hoàn chỉnh..."
                          : "Gõ câu đúng sau khi sửa lỗi..."
                      }
                      rows={4}
                      className="w-full p-4 rounded-2xl border border-[#e6decb] bg-white text-base font-serif text-[#1a3d2f] focus:outline-none focus:border-[#1a3d2f] shadow-xs"
                    />
                  </div>
                )}

                {/* ========================================================= */}
                {/* DẠNG ĐIỀN TỪ / NGHE ĐIỀN VÀO CHỖ TRỐNG (FILL BLANK, LISTENING FILL) */}
                {/* ========================================================= */}
                {(!Array.isArray(currentQ.options) || currentQ.options.length === 0) &&
                  !qType.includes("matching") &&
                  !qType.includes("ordering") &&
                  !qType.includes("handwriting") &&
                  !qType.includes("photo") &&
                  !qType.includes("flashcard") &&
                  !qType.includes("true_false") &&
                  !qType.includes("essay") &&
                  !qType.includes("translation") &&
                  !qType.includes("find_error") && (
                    <div className="mb-8 space-y-3">
                      <label className="block text-xs font-bold text-[#1a3d2f]">
                        Nhập câu trả lời của bạn:
                      </label>
                      <input
                        type="text"
                        value={answers[currentQ.id] || ""}
                        onChange={(e) => selectAnswer(currentQ.id, e.target.value)}
                        placeholder="Nhập chữ Hán, Pinyin hoặc câu trả lời..."
                        className="w-full p-4 rounded-2xl border border-[#e6decb] bg-white text-base font-medium text-[#1a3d2f] focus:outline-none focus:border-[#1a3d2f] shadow-xs"
                      />
                    </div>
                  )}

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-[#e6decb]">
                  <button
                    onClick={() => {
                      setCurrentIndex((prev) => Math.max(0, prev - 1));
                      setMatchingSelectedLeft(null);
                    }}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 rounded-xl border border-[#e6decb] text-xs font-semibold text-[#526056] hover:bg-[#ede7da] disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Câu trước</span>
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={() => {
                        setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
                        setMatchingSelectedLeft(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Câu tiếp theo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="px-5 py-2 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Nộp bài ngay</span>
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#8c9a8f] py-4 bg-[#fcfaf7] border-t border-[#e6decb]">
        Hệ thống phòng thi HSK trực tuyến · HSK Hanyu 🍃
      </footer>
    </div>
  );
}
