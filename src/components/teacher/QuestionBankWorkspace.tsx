"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Copy,
  Trash2,
  FileText,
  Check,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Layers,
  FileCheck2,
  AlertCircle,
  Save,
  Sparkles,
  ArrowRight,
  UploadCloud,
  FolderPlus,
  RefreshCw,
  ExternalLink,
  Mic,
  MicOff,
  Download,
  FileSpreadsheet,
  Play,
  Volume2,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import {
  ExamQuestionItem,
  QuestionType,
  OFFICIAL_12_QUESTION_TYPES,
  UNIFIED_QUESTION_BANK,
  ExamPackageItem,
} from "@/lib/assignment-data";

interface QuestionBankWorkspaceProps {
  onNavigateToAssignments?: (examId?: string) => void;
  showToast: (msg: string) => void;
  currentUser?: {
    id: string;
    name: string;
    username?: string;
    email?: string;
    role?: string;
  } | null;
}

export default function QuestionBankWorkspace({
  onNavigateToAssignments,
  showToast,
  currentUser,
}: QuestionBankWorkspaceProps) {
  // =========================================================================
  // 1. STATE & PERSISTENCE (Partitioned by teacherId)
  // =========================================================================
  const storageKeyQuestions = currentUser?.id
    ? `hanyu_custom_question_bank_${currentUser.id}`
    : "hanyu_custom_question_bank";
  const storageKeyExams = currentUser?.id
    ? `hanyu_exam_packages_${currentUser.id}`
    : "hanyu_exam_packages";

  const [questions, setQuestions] = useState<ExamQuestionItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved =
        (currentUser?.id && localStorage.getItem(`hanyu_custom_question_bank_${currentUser.id}`)) ||
        localStorage.getItem("hanyu_custom_question_bank");
      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error("Failed to parse cached questions", e);
        }
      }
    }
    return [];
  });

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKeyQuestions, JSON.stringify(questions));
    }
  }, [questions, storageKeyQuestions]);

  // Selected row IDs for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Highlight newly added or updated question
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Active Tab: "ALL" (24) | "DRAFT" (5) | "READY" (19) | "USED" (8)
  const [activeTab, setActiveTab] = useState<"ALL" | "DRAFT" | "READY" | "USED">("ALL");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterCurriculum, setFilterCurriculum] = useState<string>("ALL");
  const [filterHskLevel, setFilterHskLevel] = useState<string>("ALL");
  const [filterTopic, setFilterTopic] = useState<string>("ALL");
  const [filterDateOrder, setFilterDateOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");

  // Pagination
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Menu action row ID
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // =========================================================================
  // 2. MODALS STATE
  // =========================================================================
  // Modal A: View Details
  const [viewQuestion, setViewQuestion] = useState<ExamQuestionItem | null>(null);

  // Modal B: Add to Exam (Spec Section 4)
  const [targetQuestionForExam, setTargetQuestionForExam] = useState<ExamQuestionItem | null>(null);
  const [targetBulkQuestionsForExam, setTargetBulkQuestionsForExam] = useState<ExamQuestionItem[] | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [draftExamsList, setDraftExamsList] = useState<ExamPackageItem[]>([]);
  const [examSearchTerm, setExamSearchTerm] = useState("");
  const [isCreatingNewExamInPopup, setIsCreatingNewExamInPopup] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState("");
  const [newExamCurriculum, setNewExamCurriculum] = useState("HSK 3.0");
  const [newExamLevel, setNewExamLevel] = useState(1);
  const [addedSuccessResult, setAddedSuccessResult] = useState<{
    examId: string;
    examTitle: string;
    count: number;
    totalPoints: number;
  } | null>(null);

  // Load questions from DB for this teacher
  useEffect(() => {
    async function loadDbQuestions() {
      try {
        const teacherParam = currentUser?.id ? `?teacherId=${currentUser.id}` : "";
        const res = await fetch(`/api/v1/questions${teacherParam}`, {
          headers: currentUser?.id ? { "x-user-id": currentUser.id } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.items) && data.items.length > 0) {
            setQuestions(data.items);
          }
        }
      } catch (e) {
        console.warn("loadDbQuestions error:", e);
      }
    }
    loadDbQuestions();
  }, [currentUser?.id]);

  // Load / Refresh real draft exams from DB / localStorage
  const refreshDraftExamsList = async () => {
    try {
      const teacherParam = currentUser?.id ? `?teacherId=${currentUser.id}` : "";
      const res = await fetch(`/api/v1/exams${teacherParam}`, {
        headers: currentUser?.id ? { "x-user-id": currentUser.id } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setDraftExamsList(data.items);
          if (data.items.length > 0 && !selectedExamId) {
            setSelectedExamId(data.items[0].id);
          }
          return data.items;
        }
      }
    } catch (e) {
      console.warn("refreshDraftExamsList db error:", e);
    }

    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKeyExams) || localStorage.getItem("hanyu_exam_packages");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setDraftExamsList(parsed);
            if (parsed.length > 0 && !selectedExamId) {
              setSelectedExamId(parsed[0].id);
            }
            return parsed;
          }
        }
      } catch (e) {}
    }
    setDraftExamsList([]);
    return [];
  };

  // Modal C: View Exam Usages
  const [usageQuestion, setUsageQuestion] = useState<ExamQuestionItem | null>(null);

  // Modal D: Delete confirmation
  const [deleteTargetQuestion, setDeleteTargetQuestion] = useState<ExamQuestionItem | null>(null);

  // Modal E: Specialized Editor (12 Forms)
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestionItem | null>(null);
  const [editorSaveStatus, setEditorSaveStatus] = useState<"UNSAVED" | "SAVING" | "SAVED">("UNSAVED");

  // Editor Form Fields
  const [eType, setEType] = useState<QuestionType>("multiple_choice");
  const [eTitle, setETitle] = useState("");
  const [eSubtitle, setESubtitle] = useState("");
  const [eContent, setEContent] = useState("");
  const [ePinyin, setEPinyin] = useState("");
  const [ePoints, setEPoints] = useState(5);
  const [eDifficulty, setEDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [eSourceLesson, setESourceLesson] = useState("HSK 1 – Bài 5");
  const [eExplanation, setEExplanation] = useState("");
  const [eRubric, setERubric] = useState("");
  const [eOptions, setEOptions] = useState<string[]>(["Hôm nay", "Nghỉ ngơi", "Ngày mai", "Bị bệnh"]);
  const [eCorrectSingle, setECorrectSingle] = useState("B");
  const [eMatchingPairs, setEMatchingPairs] = useState<{ id?: string; left: string; right: string }[]>([
    { id: "p1", left: "今天 (jīntiān)", right: "Hôm nay" },
    { id: "p2", left: "明天 (míngtiān)", right: "Ngày mai" },
  ]);
  const [eTokens, setETokens] = useState<string[]>(["我", "今天", "休息"]);
  const [eBlanksAnswer, setEBlanksAnswer] = useState("喝");
  const [eFlashcard, setEFlashcard] = useState<{
    front: string;
    backPinyin: string;
    backVi: string;
    exampleZh?: string;
  }>({
    front: "医院",
    backPinyin: "yīyuàn",
    backVi: "Bệnh viện",
    exampleZh: "他去医院看病了。",
  });
  const [eHwRepeat, setEHwRepeat] = useState(5);
  const [eTransDirection, setETransDirection] = useState<"ZH_VI" | "VI_ZH">("ZH_VI");
  const [eFindErrorWord, setEFindErrorWord] = useState<string>("");
  const [eSampleAnswer, setESampleAnswer] = useState<string>("");
  const [eNewTokenInput, setENewTokenInput] = useState<string>("");

  // Quick Test Modal state (Góc nhìn học viên để test câu hỏi trực tiếp)
  const [testQuestionModal, setTestQuestionModal] = useState<ExamQuestionItem | null>(null);
  const [testSelectedOption, setTestSelectedOption] = useState<string>("");
  const [testMatchedPairs, setTestMatchedPairs] = useState<Record<string, string>>({});
  const [testSelectedLeft, setTestSelectedLeft] = useState<string | null>(null);
  const [testOrderingTokens, setTestOrderingTokens] = useState<string[]>([]);
  const [testInputText, setTestInputText] = useState<string>("");
  const [testFlashcardFlipped, setTestFlashcardFlipped] = useState(false);
  const [testFeedbackResult, setTestFeedbackResult] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Audio recording state for listening questions
  const [eAudioUrl, setEAudioUrl] = useState("");
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // File import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreviewQuestions, setImportPreviewQuestions] = useState<ExamQuestionItem[]>([]);
  const [importFileName, setImportFileName] = useState("");

  // AI Assistant Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("Gia đình & Đời sống hàng ngày");
  const [aiLevel, setAiLevel] = useState(1);
  const [aiCount, setAiCount] = useState(3);
  const [aiType, setAiType] = useState<QuestionType>("multiple_choice");
  const [aiContextText, setAiContextText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiWarningMessage, setAiWarningMessage] = useState("");
  const [aiGeneratedResults, setAiGeneratedResults] = useState<ExamQuestionItem[]>([]);

  // Dirty State Navigation Guard (Spec Section 3.1)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditorOpen && editorSaveStatus === "UNSAVED") {
        e.preventDefault();
        e.returnValue = "Bạn đang soạn dở câu hỏi. Bạn có chắc muốn rời đi?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditorOpen, editorSaveStatus]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setEAudioUrl(audioUrl);
        setEditorSaveStatus("UNSAVED");
        showToast("Đã thu âm xong đoạn phát âm tiếng Trung!");
      };
      mediaRecorderRef.current.start();
      setIsRecordingAudio(true);
    } catch (err) {
      showToast("Không thể kích hoạt Micro. Vui lòng cấp quyền micro cho trình duyệt!");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  // Download sample CSV template with UTF-8 BOM
  const handleDownloadSampleTemplate = () => {
    const csvContent =
      "\uFEFF" +
      "Loại câu,Đề bài,Pinyin,Lựa chọn A,Lựa chọn B,Lựa chọn C,Lựa chọn D,Đáp án đúng,Điểm,Giải thích\n" +
      'multiple_choice,"“休息” có nghĩa là gì?",xiūxi,Hôm nay,Nghỉ ngơi,Ngày mai,Bị bệnh,B,5,"“休息” nghĩa là nghỉ ngơi"\n' +
      'true_false,"明天是星期天。",míngtiān shì xīngqītiān,Đúng,Sai,,,A,5,"Đúng"\n' +
      'fill_blank,"我 ___ 去学校。",wǒ ___ qù xuéxiào,,,,,yào,5,"Điền từ yào (muốn)"\n' +
      'sentence_ordering,"我 在 北京 学习 汉语",wǒ zài Běijīng xuéxí Hànyǔ,,,,,我 在 北京 学习 汉语,10,"Sắp xếp câu chuẩn"\n';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mau_cau_hoi_HSK.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse uploaded CSV/file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
      if (lines.length <= 1) {
        showToast("File không có dữ liệu câu hỏi!");
        return;
      }

      const parsedItems: ExamQuestionItem[] = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || row.split(",");
        const cleanCols = cols.map((c) => c.replace(/^"|"$/g, "").trim());

        if (cleanCols.length >= 2) {
          const type = (cleanCols[0] || "multiple_choice") as QuestionType;
          const content = cleanCols[1] || "Câu hỏi mẫu";
          const pinyin = cleanCols[2] || "";
          const optA = cleanCols[3] || "";
          const optB = cleanCols[4] || "";
          const optC = cleanCols[5] || "";
          const optD = cleanCols[6] || "";
          const correct = cleanCols[7] || "A";
          const points = Number(cleanCols[8]) || 5;
          const explanation = cleanCols[9] || "";

          const optionsList = [optA, optB, optC, optD].filter((o) => o !== "");

          parsedItems.push({
            id: `q-import-${Date.now()}-${i}`,
            source: "MINE",
            sourceId: "import-file",
            sourceLesson: "Nhập từ file",
            subtitle: "Nhập từ file Excel/CSV",
            status: "READY",
            type,
            title: content.slice(0, 30),
            content,
            pinyin,
            options: optionsList.length > 0 ? optionsList : ["A", "B", "C", "D"],
            correctAnswer: correct,
            points,
            explanation,
            difficulty: "MEDIUM",
            hskLevel: 1,
            curriculum: "HSK 3.0",
            createdAt: new Date().toLocaleDateString("vi-VN"),
            usedInExamCount: 0,
            usedInExams: [],
          });
        }
      }

      setImportPreviewQuestions(parsedItems);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleConfirmImport = () => {
    if (importPreviewQuestions.length === 0) {
      showToast("Không có câu hỏi nào để nạp!");
      return;
    }

    setQuestions((prev) => [...importPreviewQuestions, ...prev]);
    setIsImportModalOpen(false);
    showToast(`Đã nhập thành công ${importPreviewQuestions.length} câu hỏi mới vào kho!`);
    setImportPreviewQuestions([]);
    setImportFileName("");
  };

  // AI Generation Handler
  const handleGenerateQuestionsWithAI = async () => {
    setIsAiLoading(true);
    setAiWarningMessage("");
    setAiGeneratedResults([]);

    try {
      const res = await fetch("/api/v1/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic,
          hskLevel: aiLevel,
          count: aiCount,
          type: aiType,
          contextText: aiContextText,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        if (data.warning) {
          setAiWarningMessage(data.warning);
        }

        const formatted: ExamQuestionItem[] = data.items.map((item: any, idx: number) => {
          let opts: any = item.options;
          if (Array.isArray(item.options)) {
            opts = item.options.map((o: any) => (typeof o === "string" ? o : o.text || o.value || o));
          }

          return {
            id: `q-ai-${Date.now()}-${idx}`,
            source: "MINE" as const,
            sourceId: "ai-assistant",
            sourceLesson: `AI: ${aiTopic}`,
            subtitle: `Sinh tự động bởi AI (HSK ${aiLevel})`,
            status: "READY" as const,
            type: (item.type || aiType) as QuestionType,
            title: (item.content || "").slice(0, 30),
            content: item.content || "",
            pinyin: item.pinyinPrompt || "",
            options: opts,
            tokens: item.options?.tokens || undefined,
            correctAnswer: item.correctAnswer || "A",
            points: item.points || 5,
            explanation: item.explanation || "",
            difficulty: "MEDIUM" as const,
            hskLevel: aiLevel,
            curriculum: "HSK 3.0",
            createdAt: new Date().toLocaleDateString("vi-VN"),
            usedInExamCount: 0,
            usedInExams: [],
          };
        });

        setAiGeneratedResults(formatted);
      } else {
        showToast(data.message || "Không thể sinh câu hỏi bằng AI");
      }
    } catch (err) {
      showToast("Lỗi kết nối máy chủ");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleConfirmAddAiQuestions = () => {
    if (aiGeneratedResults.length === 0) return;
    setQuestions((prev) => [...aiGeneratedResults, ...prev]);
    setIsAiModalOpen(false);
    showToast(`Đã thêm thành công ${aiGeneratedResults.length} câu hỏi AI vào Ngân hàng câu hỏi!`);
    setAiGeneratedResults([]);
  };

  // =========================================================================
  // 3. KPI COUNTERS (All = Draft + Ready | Used is subset of Ready)
  // =========================================================================
  const stats = useMemo(() => {
    const total = questions.length;
    const drafts = questions.filter((q) => q.status === "DRAFT").length;
    const ready = questions.filter((q) => q.status === "READY").length;
    const used = questions.filter((q) => (q.usedInExamCount || 0) > 0).length;
    return { total, drafts, ready, used };
  }, [questions]);

  // =========================================================================
  // 4. FILTERING & SEARCH
  // =========================================================================
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Tab filter
      if (activeTab === "DRAFT" && q.status !== "DRAFT") return false;
      if (activeTab === "READY" && q.status !== "READY") return false;
      if (activeTab === "USED" && (q.usedInExamCount || 0) <= 0) return false;

      // Type filter
      if (filterType !== "ALL" && q.type !== filterType) return false;

      // Curriculum filter
      if (filterCurriculum !== "ALL" && q.curriculum !== filterCurriculum) return false;

      // HSK Level filter
      if (filterHskLevel !== "ALL" && String(q.hskLevel) !== filterHskLevel) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = q.title?.toLowerCase().includes(query);
        const matchContent = q.content?.toLowerCase().includes(query);
        const matchPinyin = q.pinyin?.toLowerCase().includes(query);
        const matchSource = q.sourceLesson?.toLowerCase().includes(query);
        const matchExplanation = q.explanation?.toLowerCase().includes(query);
        if (!matchTitle && !matchContent && !matchPinyin && !matchSource && !matchExplanation) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filterDateOrder === "OLDEST") {
        return (a.createdAt || a.id).localeCompare(b.createdAt || b.id);
      }
      return (b.createdAt || b.id).localeCompare(a.createdAt || a.id);
    });
  }, [questions, activeTab, filterType, filterCurriculum, filterHskLevel, searchQuery, filterDateOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage, pageSize]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterType, filterCurriculum, filterHskLevel, searchQuery, pageSize]);

  // =========================================================================
  // 5. EDITOR OPEN & POPULATE
  // =========================================================================
  const handleOpenCreateNew = (typeToCreate?: any) => {
    const t = (typeof typeToCreate === "string" ? typeToCreate : "multiple_choice") as QuestionType;
    const meta = OFFICIAL_12_QUESTION_TYPES.find((item) => item.id === t);
    setEditingQuestion(null);
    setEType(t);
    setETitle(meta ? `${meta.name}: Câu hỏi HSK` : "Câu hỏi mới");
    setESubtitle(meta?.desc || "Soạn thảo nội dung câu hỏi");
    setEContent("");
    setEPinyin("");
    setEPoints(meta?.defaultPoints || 5);
    setEDifficulty("EASY");
    setESourceLesson("HSK 1 – Bài 5");
    setEOptions(["Phương án A", "Phương án B", "Phương án C", "Phương án D"]);
    setECorrectSingle("A");
    setEMatchingPairs([
      { id: "p1", left: "今天", right: "Hôm nay" },
      { id: "p2", left: "明天", right: "Ngày mai" },
      { id: "p3", left: "昨天", right: "Hôm qua" },
    ]);
    setETokens(["我", "在", "北京", "学习", "汉语"]);
    setEBlanksAnswer("喝");
    setEFlashcard({
      front: "医院",
      backPinyin: "yīyuàn",
      backVi: "Bệnh viện",
      exampleZh: "他去医院看病了。",
    });
    setEHwRepeat(5);
    setEAudioUrl("");
    setEExplanation("");
    setERubric("");
    setESampleAnswer("");
    setEFindErrorWord("");
    setENewTokenInput("");
    setEditorSaveStatus("UNSAVED");
    setIsEditorOpen(true);
  };

  const handleOpenEditOrDraft = (q: ExamQuestionItem) => {
    setEditingQuestion(q);
    setEType(q.type);
    setETitle(q.title || "");
    setESubtitle(q.subtitle || "");
    setEContent(q.content || "");
    setEPinyin(q.pinyin || "");
    setEPoints(q.points || 5);
    setEDifficulty(q.difficulty || "EASY");
    setESourceLesson(q.sourceLesson || "HSK 1 – Bài 5");
    setEExplanation(q.explanation || "");
    setERubric(q.rubric || "");
    setEAudioUrl(q.audioUrl || "");
    if (q.options && q.options.length > 0) setEOptions(q.options);
    if (typeof q.correctAnswer === "string") setECorrectSingle(q.correctAnswer);
    if (q.matchingPairs && q.matchingPairs.length > 0) setEMatchingPairs(q.matchingPairs);
    if (q.tokens && q.tokens.length > 0) setETokens(q.tokens);
    if (q.flashcard) setEFlashcard(q.flashcard);
    if (q.handwritingCount) setEHwRepeat(q.handwritingCount);
    if (q.blanks && q.blanks.length > 0) setEBlanksAnswer(q.blanks[0].answer);
    else if (typeof q.correctAnswer === "string") setEBlanksAnswer(q.correctAnswer);
    setESampleAnswer(q.sampleAnswer || (typeof q.correctAnswer === "string" ? q.correctAnswer : ""));
    setEFindErrorWord("");
    setENewTokenInput("");

    setEditorSaveStatus("UNSAVED");
    setIsEditorOpen(true);
  };

  // Build current question from editor state
  const buildCurrentEditorQuestion = (status: "DRAFT" | "READY"): ExamQuestionItem => {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const qId = editingQuestion ? editingQuestion.id : `q-custom-${Date.now()}`;
    return {
      id: qId,
      source: "MINE",
      sourceId: "teacher-current",
      sourceLesson: eSourceLesson || "HSK 1 – Bài 5",
      subtitle: eSubtitle || (status === "READY" ? "Đã kiểm duyệt hoàn chỉnh" : "Bản nháp đang soạn"),
      status,
      type: eType,
      title: eTitle || eContent.slice(0, 30),
      content: eContent || eTitle,
      pinyin: ePinyin,
      points: Number(ePoints) || 5,
      difficulty: eDifficulty,
      hskLevel: 1,
      curriculum: "HSK 3.0",
      explanation: eExplanation,
      options: eOptions,
      correctAnswer:
        eType === "fill_blank" || eType === "listening_fill" || eType === "find_error" || eType === "translation"
          ? eBlanksAnswer || eSampleAnswer
          : eCorrectSingle,
      matchingPairs: eMatchingPairs,
      tokens: eTokens,
      flashcard: eFlashcard,
      handwritingCount: eHwRepeat,
      rubric: eRubric,
      sampleAnswer: eSampleAnswer || eBlanksAnswer || eContent,
      audioUrl: eAudioUrl,
      blanks: [{ id: "b1", answer: eBlanksAnswer }],
      usedInExamCount: editingQuestion?.usedInExamCount || 0,
      usedInExams: editingQuestion?.usedInExams || [],
      createdAt: editingQuestion?.createdAt || formattedDate,
      updatedAt: formattedDate,
    };
  };

  const syncQuestionToDb = async (q: ExamQuestionItem) => {
    try {
      const anyQ = q as any;
      await fetch("/api/v1/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentUser?.id ? { "x-user-id": currentUser.id } : {}),
        },
        body: JSON.stringify({
          content: q.content || q.title || "Câu hỏi",
          pinyinPrompt: q.pinyin || null,
          type: q.type,
          skill: anyQ.skill || "VOCABULARY",
          difficulty: q.difficulty || "MEDIUM",
          level: q.hskLevel || 1,
          options: q.options || anyQ.matchingPairs || anyQ.orderingTokens || null,
          correctAnswer: q.correctAnswer || "A",
          explanation: q.explanation || null,
          tags: anyQ.topic || "custom",
          teacherId: currentUser?.id,
        }),
      });
    } catch (err) {
      console.warn("syncQuestionToDb error:", err);
    }
  };

  // Save Handlers for the 4 Buttons
  const handleSaveDraft = () => {
    setEditorSaveStatus("SAVING");
    setTimeout(() => {
      const draftQ = buildCurrentEditorQuestion("DRAFT");
      syncQuestionToDb(draftQ);
      setQuestions((prev) => {
        const idx = prev.findIndex((item) => item.id === draftQ.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = draftQ;
          return next;
        }
        return [draftQ, ...prev];
      });
      setHighlightedId(draftQ.id);
      setEditorSaveStatus("SAVED");
      showToast("Đã lưu bản nháp vào Kho câu hỏi của tôi! Bạn có thể tiếp tục chỉnh sửa.");
    }, 200);
  };

  const handleSaveToBank = () => {
    if (!eContent.trim() && !eTitle.trim()) {
      showToast("Vui lòng nhập nội dung hoặc đề bài câu hỏi!");
      return;
    }
    setEditorSaveStatus("SAVING");
    setTimeout(() => {
      const readyQ = buildCurrentEditorQuestion("READY");
      syncQuestionToDb(readyQ);
      setQuestions((prev) => {
        const idx = prev.findIndex((item) => item.id === readyQ.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = readyQ;
          return next;
        }
        return [readyQ, ...prev];
      });

      setHighlightedId(readyQ.id);
      setEditorSaveStatus("SAVED");
      setIsEditorOpen(false);
      // Auto navigate to READY tab per Section 04 specification
      setActiveTab("READY");
      showToast(`Đã lưu câu hỏi "${readyQ.title}" vào mục Đã hoàn thiện!`);
    }, 200);
  };

  const handleSaveAndCreateNext = () => {
    if (!eContent.trim() && !eTitle.trim()) {
      showToast("Vui lòng nhập nội dung câu hỏi!");
      return;
    }
    setEditorSaveStatus("SAVING");
    setTimeout(() => {
      const readyQ = buildCurrentEditorQuestion("READY");
      setQuestions((prev) => {
        const idx = prev.findIndex((item) => item.id === readyQ.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = readyQ;
          return next;
        }
        return [readyQ, ...prev];
      });

      // Clear editor fields for next question while preserving sourceLesson and type
      setEditingQuestion(null);
      setETitle("");
      setESubtitle("");
      setEContent("");
      setEPinyin("");
      setEExplanation("");
      setEditorSaveStatus("UNSAVED");
      showToast("Đã lưu câu hỏi! Đã mở form mới để tiếp tục tạo câu.");
    }, 200);
  };

  const handleSaveAndAddToExam = () => {
    if (!eContent.trim() && !eTitle.trim()) {
      showToast("Vui lòng nhập nội dung câu hỏi!");
      return;
    }
    const readyQ = buildCurrentEditorQuestion("READY");
    setQuestions((prev) => {
      const idx = prev.findIndex((item) => item.id === readyQ.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = readyQ;
        return next;
      }
      return [readyQ, ...prev];
    });

    setIsEditorOpen(false);
    // Open target exam selector popup
    setTargetQuestionForExam(readyQ);
  };

  // =========================================================================
  // 6. ACTION HANDLERS (Duplicate, Delete, Add to Exam)
  // =========================================================================
  const handleDuplicateQuestion = (q: ExamQuestionItem) => {
    const clone: ExamQuestionItem = {
      ...q,
      id: `q-clone-${Date.now()}`,
      title: `${q.title} (Bản sao)`,
      status: "DRAFT", // New clone is default DRAFT per spec 3.4
      usedInExamCount: 0,
      usedInExams: [],
      createdAt: new Date().toLocaleDateString("vi-VN"),
      updatedAt: new Date().toLocaleDateString("vi-VN"),
    };
    setQuestions([clone, ...questions]);
    setHighlightedId(clone.id);
    setOpenActionMenuId(null);
    showToast(`Đã nhân bản câu hỏi thành bản nháp mới: "${clone.title}"`);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetQuestion) return;
    const targetId = deleteTargetQuestion.id;

    // Xóa vĩnh viễn khỏi CSDL PostgreSQL để khi F5 không bị xuất hiện lại
    try {
      await fetch(`/api/v1/questions?id=${targetId}`, {
        method: "DELETE",
        headers: currentUser?.id ? { "x-user-id": currentUser.id } : {},
      });
    } catch (e) {
      console.warn("Delete question API error:", e);
    }

    setQuestions((prev) => prev.filter((q) => q.id !== targetId));
    showToast(`Đã xóa vĩnh viễn câu hỏi khỏi Kho câu hỏi!`);
    setDeleteTargetQuestion(null);
    setOpenActionMenuId(null);
  };

  const handleConfirmAddToExam = async () => {
    const questionsToAdd: ExamQuestionItem[] =
      targetBulkQuestionsForExam && targetBulkQuestionsForExam.length > 0
        ? targetBulkQuestionsForExam
        : targetQuestionForExam
        ? [targetQuestionForExam]
        : [];

    if (questionsToAdd.length === 0) {
      showToast("Không có câu hỏi nào để thêm vào đề!");
      return;
    }

    // Chặn câu chưa READY (Spec Section 4.5)
    const draftQuestionsFound = questionsToAdd.filter((q) => q.status === "DRAFT");
    if (draftQuestionsFound.length > 0) {
      showToast(
        `Có ${draftQuestionsFound.length} câu hỏi đang ở trạng thái bản nháp. Vui lòng hoàn thiện câu hỏi trước khi thêm vào đề!`
      );
      return;
    }

    let allPackages: ExamPackageItem[] = [];
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_exam_packages");
        if (saved) allPackages = JSON.parse(saved);
      } catch (e) {}
    }
    if (allPackages.length === 0) {
      allPackages = [];
    }

    const nowFormatted =
      new Date().toLocaleDateString("vi-VN") +
      " " +
      new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    let targetExamId = selectedExamId;
    let targetExamTitle = "";
    let finalCount = 0;
    let finalPoints = 0;

    if (isCreatingNewExamInPopup) {
      if (!newExamTitle.trim()) {
        showToast("Vui lòng nhập tên đề kiểm tra mới!");
        return;
      }
      targetExamId = `exam-draft-${Date.now()}`;
      targetExamTitle = newExamTitle.trim();
      finalCount = questionsToAdd.length;
      finalPoints = questionsToAdd.reduce((sum, q) => sum + (q.points || 5), 0);

      const newDraftPkg: ExamPackageItem = {
        id: targetExamId,
        title: targetExamTitle,
        description: "Bộ đề tạo từ Kho câu hỏi của tôi",
        curriculum: newExamCurriculum,
        hskLevel: newExamLevel,
        status: "DRAFT",
        questionsCount: finalCount,
        totalPoints: finalPoints,
        createdAt: nowFormatted,
        updatedAt: nowFormatted,
        questions: [...questionsToAdd],
      };

      allPackages = [newDraftPkg, ...allPackages];
    } else {
      const pkgIdx = allPackages.findIndex((p) => p.id === targetExamId);
      if (pkgIdx === -1) {
        showToast("Vui lòng chọn một đề nháp hợp lệ!");
        return;
      }
      const existingPkg = allPackages[pkgIdx];
      targetExamTitle = existingPkg.title;
      const existingQuestions = existingPkg.questions || [];

      // Add questions (Spec Section 4.3)
      const updatedQuestions = [...existingQuestions, ...questionsToAdd];
      finalCount = updatedQuestions.length;
      finalPoints = updatedQuestions.reduce((sum, q) => sum + (q.points || 5), 0);

      allPackages[pkgIdx] = {
        ...existingPkg,
        questions: updatedQuestions,
        questionsCount: finalCount,
        totalPoints: finalPoints,
        updatedAt: nowFormatted,
      };
    }

    // Đồng bộ đề thi lên cơ sở dữ liệu PostgreSQL để hiển thị ngay trong danh sách Bài tập
    try {
      const examRes = await fetch("/api/v1/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentUser?.id ? { "x-user-id": currentUser.id } : {}),
        },
        body: JSON.stringify({
          title: targetExamTitle,
          description: "Bộ đề tạo từ Kho câu hỏi của tôi",
          curriculum: newExamCurriculum,
          hskLevel: newExamLevel,
          status: "READY",
          mode: "EXAM",
          totalScore: finalPoints,
          teacherId: currentUser?.id,
          questions: questionsToAdd,
        }),
      });
      const examJson = await examRes.json();
      if (examJson.success && examJson.exam?.id) {
        targetExamId = examJson.exam.id;
        if (allPackages.length > 0 && allPackages[0].title === targetExamTitle) {
          allPackages[0].id = targetExamId;
        }
      }
    } catch (apiErr) {
      console.warn("Could not sync exam to DB:", apiErr);
    }

    // Save to localStorage (Spec Section 4.3 & 7.3)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKeyExams, JSON.stringify(allPackages));
        localStorage.setItem("hanyu_exam_packages", JSON.stringify(allPackages));
      } catch (e) {}
    }

    // Update question's usage count and exams list in local question bank
    const questionIdsAdded = new Set(questionsToAdd.map((q) => q.id));
    setQuestions((prev) =>
      prev.map((q) => {
        if (questionIdsAdded.has(q.id)) {
          const currentExams = q.usedInExams || [];
          const exists = currentExams.some((e) => e.id === targetExamId);
          const updatedExams = exists
            ? currentExams
            : [
                ...currentExams,
                {
                  id: targetExamId,
                  title: targetExamTitle,
                  status: "Đang soạn",
                  className: "Lớp phụ trách",
                  updatedAt: new Date().toLocaleDateString("vi-VN"),
                },
              ];
          return {
            ...q,
            usedInExamCount: updatedExams.length,
            usedInExams: updatedExams,
          };
        }
        return q;
      })
    );

    // Refresh draft exams list
    setDraftExamsList(allPackages.filter((p) => p.status === "DRAFT"));

    // Show success view (Spec Section 4.2)
    setAddedSuccessResult({
      examId: targetExamId,
      examTitle: targetExamTitle,
      count: finalCount,
      totalPoints: finalPoints,
    });
    showToast(`Đã thêm ${questionsToAdd.length} câu hỏi vào đề "${targetExamTitle}" thành công!`);
  };

  // Toggle select row
  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedQuestions.map((q) => q.id));
    }
  };

  return (
    <div className="space-y-6 text-[#204434]">
      {/* =================================================================== */}
      {/* 1. HEADER: Title, Description & Main Action Button */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#204434]">Kho câu hỏi của tôi</h1>
          <p className="text-xs text-[#315E48] mt-1">
            Quản lý câu hỏi tự biên soạn, bản nháp và tái sử dụng trong các đề kiểm tra, bài tập.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-[#8F6D3B] text-xs font-bold shadow-2xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>✨ Tạo bằng AI</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-[#315E48] text-xs font-bold shadow-2xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-[#8F6D3B]" />
            <span>Nhập từ file</span>
          </button>

          <a
            href="/s/attempts/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-850 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
            title="Mở phòng thi học viên để làm thử 12 dạng câu hỏi trên giao diện thực tế"
          >
            <Play className="w-3.5 h-3.5 text-emerald-700" />
            <span>Làm thử (Phòng thi 12 dạng)</span>
            <ExternalLink className="w-3 h-3 text-emerald-700 ml-0.5 opacity-70" />
          </a>

          {questions.length > 0 && (
            <button
              onClick={async () => {
                if (window.confirm("Bạn có chắc muốn xóa tất cả câu hỏi trong ngân hàng để tự soạn lại từ đầu không?")) {
                  try {
                    await fetch("/api/v1/questions?all=true", {
                      method: "DELETE",
                      headers: currentUser?.id ? { "x-user-id": currentUser.id } : {},
                    });
                  } catch (e) {
                    console.warn("Delete all questions error:", e);
                  }
                  setQuestions([]);
                  setSelectedIds([]);
                  if (typeof window !== "undefined") {
                    localStorage.setItem(storageKeyQuestions, JSON.stringify([]));
                    localStorage.setItem("hanyu_custom_question_bank", JSON.stringify([]));
                  }
                  showToast("Đã xóa vĩnh viễn toàn bộ ngân hàng câu hỏi khỏi cơ sở dữ liệu!");
                }
              }}
              className="px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              title="Xóa tất cả câu hỏi để bắt đầu tự làm lại từ đầu"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Xóa tất cả</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateNew}
            className="px-4 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#BC9B6B]" />
            <span>+ Tạo câu hỏi mới</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. 4 KPI STAT CARDS (Mockup Hình 1 & 2) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Tất cả câu hỏi */}
        <div
          onClick={() => setActiveTab("ALL")}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition shadow-2xs hover:border-[#BC9B6B] flex items-center gap-3.5 ${
            activeTab === "ALL" ? "border-[#204434] ring-1 ring-[#204434]/20" : "border-[#E5DEC9]"
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#8F6D3B] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#204434]">{stats.total}</div>
            <div className="text-xs text-[#315E48] font-medium">Tất cả câu hỏi</div>
          </div>
        </div>

        {/* Card 2: Bản nháp */}
        <div
          onClick={() => setActiveTab("DRAFT")}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition shadow-2xs hover:border-[#BC9B6B] flex items-center gap-3.5 ${
            activeTab === "DRAFT" ? "border-[#204434] ring-1 ring-[#204434]/20" : "border-[#E5DEC9]"
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200/80 flex items-center justify-center text-red-600 shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#204434]">{stats.drafts}</div>
            <div className="text-xs text-[#315E48] font-medium">Bản nháp</div>
          </div>
        </div>

        {/* Card 3: Đã hoàn thiện */}
        <div
          onClick={() => setActiveTab("READY")}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition shadow-2xs hover:border-[#BC9B6B] flex items-center gap-3.5 ${
            activeTab === "READY" ? "border-[#204434] ring-1 ring-[#204434]/20" : "border-[#E5DEC9]"
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#204434]">{stats.ready}</div>
            <div className="text-xs text-[#315E48] font-medium">Đã hoàn thiện</div>
          </div>
        </div>

        {/* Card 4: Đã sử dụng trong đề */}
        <div
          onClick={() => setActiveTab("USED")}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition shadow-2xs hover:border-[#BC9B6B] flex items-center gap-3.5 ${
            activeTab === "USED" ? "border-[#204434] ring-1 ring-[#204434]/20" : "border-[#E5DEC9]"
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-700 shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#204434]">{stats.used}</div>
            <div className="text-xs text-[#315E48] font-medium">Đã sử dụng trong đề</div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. 4 TABS NAVIGATION */}
      {/* =================================================================== */}
      <div className="flex items-center gap-2 border-b border-[#E5DEC9] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "ALL"
              ? "bg-[#204434] text-white shadow-2xs"
              : "bg-white text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
          }`}
        >
          Tất cả câu hỏi ({stats.total})
        </button>

        <button
          onClick={() => setActiveTab("DRAFT")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "DRAFT"
              ? "bg-[#204434] text-white shadow-2xs"
              : "bg-white text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
          }`}
        >
          Bản nháp ({stats.drafts})
        </button>

        <button
          onClick={() => setActiveTab("READY")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "READY"
              ? "bg-[#204434] text-white shadow-2xs"
              : "bg-white text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
          }`}
        >
          Đã hoàn thiện ({stats.ready})
        </button>

        <button
          onClick={() => setActiveTab("USED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "USED"
              ? "bg-[#204434] text-white shadow-2xs"
              : "bg-white text-[#204434] border border-[#E5DEC9] hover:bg-[#FAF7F0]"
          }`}
        >
          Đã sử dụng trong đề ({stats.used})
        </button>
      </div>

      {/* =================================================================== */}
      {/* 4. SEARCH & FILTER CONTROLS BAR (Mockup Hình 2) */}
      {/* =================================================================== */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3">
        {/* Full-width Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8F6D3B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo nội dung câu hỏi, chữ Hán, pinyin, nghĩa tiếng Việt..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-xs text-[#204434] focus:outline-none focus:border-[#204434]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* 1. Dạng bài */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-medium"
          >
            <option value="ALL">Dạng bài (Tất cả)</option>
            {OFFICIAL_12_QUESTION_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* 2. Chương trình */}
          <select
            value={filterCurriculum}
            onChange={(e) => setFilterCurriculum(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-medium"
          >
            <option value="ALL">Chương trình (Tất cả)</option>
            <option value="HSK 3.0">HSK 3.0</option>
            <option value="Theo chủ đề">Theo chủ đề</option>
            <option value="Đại học & Ngành">Đại học & Ngành</option>
          </select>

          {/* 3. HSK / Cấp độ */}
          <select
            value={filterHskLevel}
            onChange={(e) => setFilterHskLevel(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-medium"
          >
            <option value="ALL">HSK / Cấp độ (Tất cả)</option>
            <option value="1">HSK 1</option>
            <option value="2">HSK 2</option>
            <option value="3">HSK 3</option>
            <option value="4">HSK 4</option>
            <option value="5">HSK 5</option>
            <option value="6">HSK 6</option>
          </select>

          {/* 4. Chủ đề */}
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-medium"
          >
            <option value="ALL">Chủ đề (Tất cả)</option>
            <option value="daily">Cuộc sống hàng ngày</option>
            <option value="work">Học tập & Công việc</option>
            <option value="travel">Du lịch & Giao thông</option>
            <option value="economy">Thương mại & Kinh tế</option>
          </select>

          {/* 5. Ngày cập nhật */}
          <select
            value={filterDateOrder}
            onChange={(e) => setFilterDateOrder(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-medium"
          >
            <option value="NEWEST">Ngày cập nhật (Mới nhất)</option>
            <option value="OLDEST">Ngày cập nhật (Cũ nhất)</option>
          </select>

          {/* 6. Xóa bộ lọc */}
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterType("ALL");
              setFilterCurriculum("ALL");
              setFilterHskLevel("ALL");
              setFilterTopic("ALL");
              setFilterDateOrder("NEWEST");
            }}
            className="px-2.5 py-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48] font-bold text-center flex items-center justify-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Xóa bộ lọc</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5. DATA TABLE (Mockup Hình 1 & 3) */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-[#E5DEC9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#E5DEC9] text-[#8F6D3B] font-bold">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedQuestions.length > 0 &&
                      selectedIds.length === paginatedQuestions.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded text-[#204434] focus:ring-[#204434]"
                  />
                </th>
                <th className="py-3 px-2 w-8 text-center">#</th>
                <th className="py-3 px-3 min-w-[240px]">Nội dung câu hỏi</th>
                <th className="py-3 px-3 min-w-[100px]">Dạng bài</th>
                <th className="py-3 px-3 min-w-[110px]">Nguồn</th>
                <th className="py-3 px-3 w-14 text-center">Điểm</th>
                <th className="py-3 px-3 min-w-[110px]">Trạng thái</th>
                <th className="py-3 px-3 min-w-[120px]">Ngày cập nhật</th>
                <th className="py-3 px-3 min-w-[120px]">Đã dùng trong đề</th>
                <th className="py-3 px-3 min-w-[170px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DEC9]">
              {paginatedQuestions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500">
                    <div className="space-y-3">
                      <HelpCircle className="w-10 h-10 mx-auto text-[#BC9B6B]" />
                      <p className="font-serif font-bold text-sm text-[#204434]">
                        {questions.length === 0
                          ? "Chưa có câu hỏi nào trong ngân hàng"
                          : "Không tìm thấy câu hỏi phù hợp"}
                      </p>
                      <p className="text-xs text-[#315E48] max-w-sm mx-auto">
                        {questions.length === 0
                          ? "Ngân hàng câu hỏi của bạn đang trống. Bạn có thể tự soạn câu hỏi mới hoặc tạo tự động bằng AI."
                          : "Hãy thử thay đổi từ khóa tìm kiếm hoặc bấm \"Xóa bộ lọc\" để xem toàn bộ kho câu hỏi."}
                      </p>
                      {questions.length === 0 && (
                        <div className="pt-2 flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleOpenCreateNew()}
                            className="px-4 py-2 rounded-xl bg-[#204434] text-[#FFFCF6] text-xs font-semibold hover:bg-[#183629] transition shadow-xs cursor-pointer"
                          >
                            + Soạn câu hỏi mới
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAiModalOpen(true)}
                            className="px-4 py-2 rounded-xl bg-[#FAF7F0] border border-[#BC9B6B] text-[#8C6D3B] text-xs font-semibold hover:bg-[#F3EEDF] transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Tạo bằng AI
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedQuestions.map((q, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  const isChecked = selectedIds.includes(q.id);
                  const isHighlighted = highlightedId === q.id;

                  const typeObj = OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === q.type);
                  const typeName = typeObj?.name || q.type;

                  return (
                    <tr
                      key={q.id}
                      className={`hover:bg-[#FAF7F0]/60 transition ${
                        isHighlighted ? "bg-amber-50/70" : isChecked ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      {/* 1. Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(q.id)}
                          className="rounded text-[#204434] focus:ring-[#204434]"
                        />
                      </td>

                      {/* 2. Number */}
                      <td className="py-3 px-2 text-center font-bold text-[#8F6D3B]">
                        {globalIdx}
                      </td>

                      {/* 3. Nội dung câu hỏi */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <h4 className="font-serif font-bold text-xs text-[#204434] line-clamp-1">
                            {q.title || q.content}
                          </h4>
                          <p className="text-[11px] text-[#8F6D3B] line-clamp-1">
                            {q.subtitle || (q.options ? "Chọn 1 đáp án đúng" : q.content)}
                          </p>
                        </div>
                      </td>

                      {/* 4. Dạng bài Badge */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#204434]/10 text-[#204434]">
                          {typeName}
                        </span>
                      </td>

                      {/* 5. Nguồn */}
                      <td className="py-3 px-3 text-[11px] font-semibold text-[#315E48]">
                        {q.sourceLesson || "HSK 1 – Bài 5"}
                      </td>

                      {/* 6. Điểm */}
                      <td className="py-3 px-3 text-center font-bold text-[#204434]">
                        {q.points}
                      </td>

                      {/* 7. Trạng thái */}
                      <td className="py-3 px-3">
                        {q.status === "READY" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>Đã hoàn thiện</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            <span>Bản nháp</span>
                          </span>
                        )}
                      </td>

                      {/* 8. Ngày cập nhật */}
                      <td className="py-3 px-3 text-[11px] text-[#315E48] whitespace-nowrap">
                        {q.updatedAt || "23/05/2025 10:24"}
                      </td>

                      {/* 9. Đã dùng trong đề */}
                      <td className="py-3 px-3">
                        {(q.usedInExamCount || 0) > 0 ? (
                          <button
                            onClick={() => setUsageQuestion(q)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] text-[11px] font-semibold hover:border-[#BC9B6B] transition"
                            title="Bấm để xem các đề liên kết"
                          >
                            <FileText className="w-3 h-3 text-[#BC9B6B]" />
                            <span>{q.usedInExamCount} đề</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 pl-2">0</span>
                        )}
                      </td>

                      {/* 10. Thao tác */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 relative">
                          {q.status === "READY" ? (
                            <>
                              <button
                                onClick={() => {
                                  setTestQuestionModal(q);
                                  setTestSelectedOption("");
                                  setTestMatchedPairs({});
                                  setTestSelectedLeft(null);
                                  setTestOrderingTokens([]);
                                  setTestInputText("");
                                  setTestFlashcardFlipped(false);
                                  setTestFeedbackResult(null);
                                }}
                                className="px-2 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-bold text-emerald-800 flex items-center gap-1 transition cursor-pointer"
                                title="Làm thử câu hỏi này (Góc nhìn học viên)"
                              >
                                <Play className="w-3 h-3 text-emerald-700" />
                                <span>Làm thử</span>
                              </button>

                              <button
                                onClick={() => setViewQuestion(q)}
                                className="px-2 py-1 rounded-lg border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-[11px] font-bold text-[#204434] flex items-center gap-1 transition"
                                title="Xem chi tiết câu hỏi"
                              >
                                <Eye className="w-3 h-3 text-[#BC9B6B]" />
                                <span>Xem</span>
                              </button>

                              <button
                                onClick={() => {
                                  refreshDraftExamsList();
                                  setTargetQuestionForExam(q);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-[#204434] bg-white hover:bg-[#FAF7F0] text-[11px] font-bold text-[#204434] flex items-center gap-1 transition"
                                title="Thêm câu hỏi vào đề kiểm tra"
                              >
                                <Plus className="w-3 h-3 text-[#204434]" />
                                <span>Thêm vào đề</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenEditOrDraft(q)}
                              className="px-3 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[11px] font-bold text-amber-900 flex items-center gap-1 transition"
                              title="Tiếp tục hoàn thiện bản nháp này"
                            >
                              <Edit3 className="w-3 h-3 text-amber-700" />
                              <span>Tiếp tục soạn</span>
                            </button>
                          )}

                          {/* 3-dots Menu Button */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenActionMenuId(openActionMenuId === q.id ? null : q.id)
                              }
                              className="p-1 rounded-lg border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-[#315E48]"
                              title="Tùy chọn thao tác"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu */}
                            {openActionMenuId === q.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-[#E5DEC9] shadow-lg py-1.5 z-20 text-xs font-semibold text-[#204434] space-y-0.5">
                                <button
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    setTestQuestionModal(q);
                                    setTestSelectedOption("");
                                    setTestMatchedPairs({});
                                    setTestSelectedLeft(null);
                                    setTestOrderingTokens([]);
                                    setTestInputText("");
                                    setTestFlashcardFlipped(false);
                                    setTestFeedbackResult(null);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-emerald-50 text-emerald-800 flex items-center gap-2 text-left font-bold"
                                >
                                  <Play className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Làm thử (Học viên)</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    handleOpenEditOrDraft(q);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-[#FAF7F0] flex items-center gap-2 text-left"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#315E48]" />
                                  <span>Chỉnh sửa</span>
                                </button>

                                <button
                                  onClick={() => handleDuplicateQuestion(q)}
                                  className="w-full px-3 py-1.5 hover:bg-[#FAF7F0] flex items-center gap-2 text-left"
                                >
                                  <Copy className="w-3.5 h-3.5 text-[#315E48]" />
                                  <span>Nhân bản</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    if (q.status === "DRAFT") {
                                      showToast("Câu hỏi này đang là bản nháp chưa hoàn thiện. Vui lòng hoàn thiện câu hỏi trước khi thêm vào đề!");
                                      handleOpenEditOrDraft(q);
                                      return;
                                    }
                                    refreshDraftExamsList();
                                    setTargetQuestionForExam(q);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-[#FAF7F0] flex items-center gap-2 text-left"
                                >
                                  <Plus className="w-3.5 h-3.5 text-[#204434]" />
                                  <span>Thêm vào đề</span>
                                </button>

                                {(q.usedInExamCount || 0) > 0 && (
                                  <button
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      setUsageQuestion(q);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-[#FAF7F0] flex items-center gap-2 text-left"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-[#8F6D3B]" />
                                    <span>Xem đề đã sử dụng</span>
                                  </button>
                                )}

                                <div className="border-t border-[#E5DEC9] my-1" />

                                <button
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    setDeleteTargetQuestion(q);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 text-left"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Xóa</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================================== */}
        {/* 6. PAGINATION FOOTER (Mockup Hình 1 & 3) */}
        {/* =================================================================== */}
        <div className="p-3.5 bg-[#FAF7F0] border-t border-[#E5DEC9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-[#315E48]">Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 rounded-lg bg-white border border-[#E5DEC9] text-[#204434] font-bold"
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
            </select>
          </div>

          {/* Page buttons */}
          <div className="flex items-center gap-1 justify-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#204434]" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                  currentPage === page
                    ? "bg-[#204434] text-white shadow-2xs"
                    : "bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#204434]" />
            </button>
          </div>

          {/* Total Count */}
          <div className="text-right text-[#8F6D3B] font-bold">
            Tổng {filteredQuestions.length} câu hỏi
          </div>
        </div>
      </div>

      {/* FLOATING BULK ACTIONS BAR (SPEC SECTION 4.1) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#204434] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 text-xs font-medium border border-[#BC9B6B]/40 animate-fade-in">
          <span>
            Đã chọn <strong>{selectedIds.length} câu hỏi</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const picked = questions.filter((q) => selectedIds.includes(q.id));
                const draftPicked = picked.filter((q) => q.status === "DRAFT");
                if (draftPicked.length > 0) {
                  showToast(
                    `Có ${draftPicked.length} câu hỏi chưa hoàn thiện (DRAFT). Chỉ có thể thêm câu hỏi đã hoàn thiện vào đề!`
                  );
                  return;
                }
                refreshDraftExamsList();
                setTargetBulkQuestionsForExam(picked);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#BC9B6B] hover:bg-[#A88755] text-white font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm vào đề nháp</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. MODAL A: XEM CHI TIẾT CÂU HỎI (Mockup Chi Tiết Bên Trái Dưới) */}
      {/* =================================================================== */}
      {viewQuestion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#204434]/10 text-[#204434]">
                  {OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === viewQuestion.type)?.name ||
                    viewQuestion.type}
                </span>
                <span className="text-xs text-[#8F6D3B]">· {viewQuestion.points} điểm</span>
              </div>
              <button
                onClick={() => setViewQuestion(null)}
                className="p-1 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0]"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <h3 className="font-serif font-bold text-lg text-[#204434]">
              {viewQuestion.title || viewQuestion.content}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Left Column Meta */}
              <div className="p-3.5 bg-white rounded-2xl border border-[#E5DEC9] space-y-2">
                <div>
                  <span className="font-bold text-[#8F6D3B]">Nguồn:</span>{" "}
                  <span className="text-[#204434]">{viewQuestion.sourceLesson || "HSK 1 – Bài 5"}</span>
                </div>
                <div>
                  <span className="font-bold text-[#8F6D3B]">Điểm mặc định:</span>{" "}
                  <span className="text-[#204434]">{viewQuestion.points} điểm</span>
                </div>
                <div>
                  <span className="font-bold text-[#8F6D3B]">Độ khó:</span>{" "}
                  <span className="text-[#204434]">{viewQuestion.difficulty || "EASY"}</span>
                </div>
                {viewQuestion.explanation && (
                  <div className="pt-2 border-t border-[#E5DEC9]/60">
                    <span className="font-bold text-[#8F6D3B]">Gợi ý / Lời giải:</span>
                    <p className="text-[#315E48] mt-0.5 leading-relaxed">
                      {viewQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Options & Answers */}
              <div className="p-3.5 bg-white rounded-2xl border border-[#E5DEC9] space-y-2">
                <span className="font-bold text-[#204434] block mb-1">Phương án trả lời:</span>
                {viewQuestion.options && viewQuestion.options.length > 0 ? (
                  <div className="space-y-1.5">
                    {viewQuestion.options.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isCorrect = viewQuestion.correctAnswer === letter;
                      return (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl border flex items-center justify-between ${
                            isCorrect
                              ? "bg-emerald-50 border-emerald-400 font-bold text-emerald-900"
                              : "border-[#E5DEC9] text-[#204434]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                              {letter}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isCorrect && (
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : viewQuestion.matchingPairs ? (
                  <div className="space-y-1">
                    {viewQuestion.matchingPairs.map((pair, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex justify-between"
                      >
                        <span className="font-serif font-bold">{pair.left}</span>
                        <span>↔</span>
                        <span>{pair.right}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48]">
                    <strong>Đáp án chính xác:</strong>{" "}
                    {typeof viewQuestion.correctAnswer === "string"
                      ? viewQuestion.correctAnswer
                      : viewQuestion.sampleAnswer || "Chưa có"}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const q = viewQuestion;
                  setViewQuestion(null);
                  setTestQuestionModal(q);
                  setTestSelectedOption("");
                  setTestMatchedPairs({});
                  setTestSelectedLeft(null);
                  setTestOrderingTokens([]);
                  setTestInputText("");
                  setTestFlashcardFlipped(false);
                  setTestFeedbackResult(null);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-850 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Play className="w-3.5 h-3.5 text-emerald-700" />
                <span>Làm thử câu này (Góc nhìn học viên)</span>
              </button>
              <button
                onClick={() => {
                  const q = viewQuestion;
                  setViewQuestion(null);
                  handleOpenEditOrDraft(q);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-xs font-semibold text-[#204434]"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => {
                  const q = viewQuestion;
                  setViewQuestion(null);
                  setTargetQuestionForExam(q);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#204434] text-white hover:bg-[#183629] text-xs font-bold"
              >
                Thêm vào đề
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 8. MODAL B: CHỌN ĐỀ NHÁP ĐỂ THÊM CÂU HỎI (SPEC SECTION 4) */}
      {/* =================================================================== */}
      {(targetQuestionForExam || (targetBulkQuestionsForExam && targetBulkQuestionsForExam.length > 0)) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#8F6D3B]" />
                <h3 className="font-serif font-bold text-base text-[#204434]">
                  {addedSuccessResult ? "Thêm vào đề thành công" : "Chọn đề nháp để thêm câu hỏi"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setTargetQuestionForExam(null);
                  setTargetBulkQuestionsForExam(null);
                  setAddedSuccessResult(null);
                  setIsCreatingNewExamInPopup(false);
                }}
                className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48]"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* MÀN HÌNH SAU THÀNH CÔNG (SPEC SECTION 4.2: THÔNG BÁO + MỞ ĐỀ VỪA CẬP NHẬT) */}
            {addedSuccessResult ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <Check className="w-5 h-5 text-emerald-700" />
                    <span>Đã thêm câu hỏi vào đề kiểm tra thành công!</span>
                  </div>
                  <p className="text-xs text-emerald-900">
                    Đề bài: <strong>{addedSuccessResult.examTitle}</strong>
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-300">
                      Tổng số câu hiện tại: {addedSuccessResult.count} câu
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-300">
                      Tổng điểm: {addedSuccessResult.totalPoints} điểm
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-2 text-xs font-bold">
                  <button
                    onClick={() => {
                      setTargetQuestionForExam(null);
                      setTargetBulkQuestionsForExam(null);
                      setAddedSuccessResult(null);
                      setIsCreatingNewExamInPopup(false);
                      setSelectedIds([]);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-[#E5DEC9] bg-white text-[#315E48] hover:bg-[#FAF7F0]"
                  >
                    Ở lại Kho câu hỏi
                  </button>
                  <button
                    onClick={() => {
                      const examId = addedSuccessResult.examId;
                      setTargetQuestionForExam(null);
                      setTargetBulkQuestionsForExam(null);
                      setAddedSuccessResult(null);
                      setIsCreatingNewExamInPopup(false);
                      setSelectedIds([]);
                      onNavigateToAssignments?.(examId);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white shadow-xs flex items-center gap-1.5"
                  >
                    <span>Mở đề vừa cập nhật</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#BC9B6B]" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Thông tin câu đã chọn (Spec Section 4.2) */}
                <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1 text-xs">
                  {targetBulkQuestionsForExam && targetBulkQuestionsForExam.length > 0 ? (
                    <div>
                      <p className="font-bold text-[#204434]">
                        Đang chọn hàng loạt: <strong>{targetBulkQuestionsForExam.length} câu hỏi</strong>
                      </p>
                      <p className="text-[11px] text-[#8F6D3B]">
                        Tổng điểm dự kiến thêm vào đề:{" "}
                        <strong>
                          {targetBulkQuestionsForExam.reduce((sum, q) => sum + (q.points || 5), 0)} điểm
                        </strong>
                      </p>
                    </div>
                  ) : targetQuestionForExam ? (
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#204434] line-clamp-1">{targetQuestionForExam.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#204434]/10 text-[#204434] shrink-0">
                          {OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === targetQuestionForExam.type)?.name ||
                            targetQuestionForExam.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#315E48]">
                        Điểm: <strong>{targetQuestionForExam.points}đ</strong> · Nguồn:{" "}
                        {targetQuestionForExam.sourceLesson || "HSK 1 - Bài 5"}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Form Tạo đề mới ngay trong Popup (Spec Section 4.2 & 4.4) */}
                <div className="border border-[#E5DEC9] rounded-2xl p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-[#BC9B6B]" />
                      <span>Tạo một đề nháp mới</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNewExamInPopup(!isCreatingNewExamInPopup);
                        if (!isCreatingNewExamInPopup && !newExamTitle) {
                          setNewExamTitle(`Đề nháp mới (${new Date().toLocaleDateString("vi-VN")})`);
                        }
                      }}
                      className="text-[11px] font-bold text-[#8F6D3B] hover:underline"
                    >
                      {isCreatingNewExamInPopup ? "Hủy tạo mới" : "+ Tạo đề mới"}
                    </button>
                  </div>

                  {isCreatingNewExamInPopup && (
                    <div className="pt-2 border-t border-[#E5DEC9]/60 space-y-2 text-xs animate-fade-in">
                      <div>
                        <label className="font-semibold text-[#204434] block mb-1">
                          Tên đề kiểm tra <span className="text-red-500">*</span>:
                        </label>
                        <input
                          type="text"
                          value={newExamTitle}
                          onChange={(e) => setNewExamTitle(e.target.value)}
                          placeholder="Ví dụ: Ôn tập ngữ pháp & từ vựng tuần 3..."
                          className="w-full px-3 py-1.5 rounded-xl border border-[#E5DEC9] text-xs font-bold text-[#204434] focus:outline-none focus:ring-1 focus:ring-[#204434]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-[#315E48] block mb-1">Chương trình:</label>
                          <select
                            value={newExamCurriculum}
                            onChange={(e) => setNewExamCurriculum(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5DEC9] text-xs text-[#204434]"
                          >
                            <option value="HSK 3.0">HSK 3.0 Tiêu chuẩn</option>
                            <option value="Theo chủ đề">Giao tiếp theo chủ đề</option>
                            <option value="Đại học & Ngành">Đại học & Ngành</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-[#315E48] block mb-1">Cấp độ HSK:</label>
                          <select
                            value={newExamLevel}
                            onChange={(e) => setNewExamLevel(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5DEC9] text-xs text-[#204434]"
                          >
                            {[1, 2, 3, 4, 5, 6].map((lvl) => (
                              <option key={lvl} value={lvl}>
                                HSK {lvl}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chọn đề nháp có sẵn (Spec Section 4.2 & 4.3) */}
                {!isCreatingNewExamInPopup && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#204434] block">
                        Hoặc chọn đề nháp hiện có:
                      </label>
                      <button
                        type="button"
                        onClick={() => refreshDraftExamsList()}
                        className="text-[11px] text-[#315E48] hover:text-[#204434] flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Làm mới</span>
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#315E48]" />
                      <input
                        type="text"
                        value={examSearchTerm}
                        onChange={(e) => setExamSearchTerm(e.target.value)}
                        placeholder="Tìm đề nháp theo tên..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E5DEC9] text-xs bg-white text-[#204434]"
                      />
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {draftExamsList
                        .filter((p) =>
                          examSearchTerm.trim() === ""
                            ? true
                            : p.title.toLowerCase().includes(examSearchTerm.toLowerCase())
                        )
                        .map((exam) => {
                          const isSelected = selectedExamId === exam.id;
                          return (
                            <label
                              key={exam.id}
                              onClick={() => setSelectedExamId(exam.id)}
                              className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition text-xs ${
                                isSelected
                                  ? "bg-emerald-50/80 border-emerald-400 font-bold text-emerald-950"
                                  : "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="radio"
                                  name="exam_target"
                                  checked={isSelected}
                                  onChange={() => setSelectedExamId(exam.id)}
                                  className="text-[#204434] focus:ring-[#204434]"
                                />
                                <div>
                                  <p className="font-bold text-[#204434]">{exam.title}</p>
                                  <p className="text-[10px] text-[#315E48]">
                                    HSK {exam.hskLevel} ({exam.curriculum}) · {exam.questionsCount || 0} câu · {exam.totalPoints || 0}đ
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                Đang soạn
                              </span>
                            </label>
                          );
                        })}

                      {draftExamsList.length === 0 && (
                        <div className="p-4 rounded-xl border border-dashed border-[#E5DEC9] text-center text-xs text-[#315E48]">
                          Chưa có đề nháp nào. Hãy chọn tùy chọn <strong>"+ Tạo đề mới"</strong> ở trên.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-2 text-xs font-bold">
                  <button
                    onClick={() => {
                      setTargetQuestionForExam(null);
                      setTargetBulkQuestionsForExam(null);
                      setIsCreatingNewExamInPopup(false);
                    }}
                    className="px-4 py-2 rounded-xl border border-[#E5DEC9] bg-white text-[#315E48] hover:bg-[#FAF7F0]"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmAddToExam}
                    className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white shadow-xs flex items-center gap-1.5"
                  >
                    <span>{isCreatingNewExamInPopup ? "Tạo đề & Thêm câu" : "Xác nhận thêm vào đề"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 9. MODAL C: XEM DANH SÁCH ĐỀ ĐÃ SỬ DỤNG CÂU HỎI NÀY */}
      {/* =================================================================== */}
      {usageQuestion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Các đề kiểm tra đang sử dụng câu hỏi
              </h3>
              <button
                onClick={() => setUsageQuestion(null)}
                className="p-1 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0]"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <p className="text-xs text-[#315E48]">
              Câu hỏi: <strong>{usageQuestion.title}</strong>
            </p>

            <div className="space-y-2 text-xs">
              {(usageQuestion.usedInExams && usageQuestion.usedInExams.length > 0) ? (
                usageQuestion.usedInExams.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3 bg-white rounded-xl border border-[#E5DEC9] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-[#204434]">{ex.title}</p>
                      <p className="text-[10px] text-[#8F6D3B]">
                        {ex.className || "Lớp học"} · Cập nhật: {ex.updatedAt}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]">
                      {ex.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic text-center py-4">
                  Chưa có đề nào sử dụng câu hỏi này.
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-[#E5DEC9] flex justify-end">
              <button
                onClick={() => setUsageQuestion(null)}
                className="px-4 py-1.5 rounded-xl bg-[#204434] text-white text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 10. MODAL D: XÁC NHẬN XÓA CÂU HỎI */}
      {/* =================================================================== */}
      {deleteTargetQuestion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Xóa câu hỏi khỏi Kho?
              </h3>
              <p className="text-xs text-[#315E48]">
                Bạn có chắc chắn muốn xóa câu hỏi: <strong>{deleteTargetQuestion.title}</strong>?
              </p>
              {(deleteTargetQuestion.usedInExamCount || 0) > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] text-left mt-2">
                  ⚠️ Câu hỏi này đang được sử dụng trong {deleteTargetQuestion.usedInExamCount} đề thi. Việc xóa sẽ không làm hỏng dữ liệu các đề đã giao.
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold pt-2">
              <button
                onClick={() => setDeleteTargetQuestion(null)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] bg-white text-[#315E48] hover:bg-[#FAF7F0]"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 11. MODAL E: TRÌNH SOẠN THẢO 12 DẠNG VỚI 4 NÚT LƯU (EXAM-006) */}
      {/* =================================================================== */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-[#204434]">
                  {editingQuestion ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
                </h3>
                <p className="text-[11px] text-[#315E48]">
                  Soạn thảo chuẩn mực 12 dạng câu hỏi và lưu vào Kho câu hỏi của tôi
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0]"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Question Type Selector */}
            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] space-y-1.5">
              <label className="font-bold text-[#204434] block">
                Chọn dạng bài tập trong 12 dạng:
              </label>
              <select
                value={eType}
                onChange={(e) => {
                  const newType = e.target.value as QuestionType;
                  setEType(newType);
                  const meta = OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === newType);
                  if (meta) {
                    setEPoints(meta.defaultPoints);
                  }
                  setEditorSaveStatus("UNSAVED");
                }}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs font-bold text-[#204434]"
              >
                {OFFICIAL_12_QUESTION_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.number}. {t.name} ({t.category === "AUTO" ? "Tự chấm" : "Chấm tay"})
                  </option>
                ))}
              </select>
            </div>

            {/* General Fields */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3.5 rounded-2xl border border-[#E5DEC9]">
              <div className="md:col-span-6">
                <label className="font-bold text-[#204434] block mb-1">Tiêu đề câu hỏi:</label>
                <input
                  type="text"
                  value={eTitle}
                  onChange={(e) => setETitle(e.target.value)}
                  placeholder="Ví dụ: “休息” có nghĩa là gì?"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                />
              </div>
              <div className="md:col-span-3">
                <label className="font-bold text-[#204434] block mb-1">Nguồn bài học:</label>
                <input
                  type="text"
                  value={eSourceLesson}
                  onChange={(e) => setESourceLesson(e.target.value)}
                  placeholder="HSK 1 – Bài 5"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                />
              </div>
              <div className="md:col-span-3">
                <label className="font-bold text-[#204434] block mb-1">Điểm mặc định:</label>
                <input
                  type="number"
                  min={1}
                  value={ePoints}
                  onChange={(e) => setEPoints(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-bold"
                />
              </div>
            </div>

            {/* Specialized Form Fields according to eType (Full 12 Official Types) */}
            
            {/* 1. TRẮC NGHIỆM (multiple_choice) */}
            {eType === "multiple_choice" && (
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                  <span className="font-bold text-xs text-[#204434] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#204434] text-white flex items-center justify-center text-[10px]">01</span>
                    Dạng 1: Trắc nghiệm (Hệ thống tự động chấm)
                  </span>
                  <span className="text-[11px] text-[#8F6D3B]">Bấm vào chữ cái để chọn làm đáp án đúng</span>
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Đề bài câu hỏi (Chữ Hán): <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={eContent}
                    onChange={(e) => {
                      setEContent(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    rows={2}
                    placeholder="Ví dụ: “休息” (xiūxi) có nghĩa là gì?"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">Phiên âm Pinyin (nếu có):</label>
                  <input
                    type="text"
                    value={ePinyin}
                    onChange={(e) => {
                      setEPinyin(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    placeholder="Ví dụ: xiūxi"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#204434] block">
                      Các phương án lựa chọn:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEOptions([...eOptions, `Phương án ${String.fromCharCode(65 + eOptions.length)}`]);
                        setEditorSaveStatus("UNSAVED");
                      }}
                      className="text-xs font-bold text-[#204434] hover:text-[#183629] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm phương án</span>
                    </button>
                  </div>

                  {eOptions.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isCorrect = eCorrectSingle === letter;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setECorrectSingle(letter);
                            setEditorSaveStatus("UNSAVED");
                          }}
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer transition ${
                            isCorrect
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:bg-[#FAF7F0]/80"
                          }`}
                          title={`Bấm để đặt ${letter} làm đáp án đúng`}
                        >
                          {letter}
                        </button>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const next = [...eOptions];
                            next[idx] = e.target.value;
                            setEOptions(next);
                            setEditorSaveStatus("UNSAVED");
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                        />
                        {eOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = eOptions.filter((_, i) => i !== idx);
                              setEOptions(next);
                              if (eCorrectSingle === letter && next.length > 0) {
                                setECorrectSingle("A");
                              }
                              setEditorSaveStatus("UNSAVED");
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                            title="Xóa phương án này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. NỐI TỪ (matching) */}
            {eType === "matching" && (
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                  <span className="font-bold text-xs text-[#204434] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#204434] text-white flex items-center justify-center text-[10px]">02</span>
                    Dạng 2: Nối từ 2 cột (Học viên nối chữ Hán với Nghĩa)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEMatchingPairs([
                        ...eMatchingPairs,
                        { id: `p${Date.now()}`, left: "Từ mới", right: "Nghĩa tiếng Việt" },
                      ]);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    className="text-xs font-bold text-[#204434] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm cặp từ mới</span>
                  </button>
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">Hướng dẫn đề bài:</label>
                  <input
                    type="text"
                    value={eContent}
                    onChange={(e) => {
                      setEContent(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    placeholder="Ví dụ: Nối từ tiếng Trung với ý nghĩa tiếng Việt tương ứng"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-[#204434] block">
                    Danh sách các cặp nối chuẩn:
                  </label>
                  {eMatchingPairs.map((pair, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center gap-2">
                      <span className="text-xs font-bold text-[#8F6D3B] w-5 text-center">{idx + 1}</span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={pair.left}
                          onChange={(e) => {
                            const next = [...eMatchingPairs];
                            next[idx] = { ...next[idx], left: e.target.value };
                            setEMatchingPairs(next);
                            setEditorSaveStatus("UNSAVED");
                          }}
                          placeholder="Cột A: Chữ Hán / Pinyin"
                          className="w-full px-3 py-1 rounded-lg bg-white border border-[#E5DEC9] text-xs font-serif font-bold text-[#204434]"
                        />
                      </div>
                      <span className="text-[#8F6D3B] font-bold text-xs">↔</span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={pair.right}
                          onChange={(e) => {
                            const next = [...eMatchingPairs];
                            next[idx] = { ...next[idx], right: e.target.value };
                            setEMatchingPairs(next);
                            setEditorSaveStatus("UNSAVED");
                          }}
                          placeholder="Cột B: Nghĩa tiếng Việt"
                          className="w-full px-3 py-1 rounded-lg bg-white border border-[#E5DEC9] text-xs text-[#204434]"
                        />
                      </div>
                      {eMatchingPairs.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setEMatchingPairs(eMatchingPairs.filter((_, i) => i !== idx));
                            setEditorSaveStatus("UNSAVED");
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                          title="Xóa cặp từ này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. FLASHCARD (flashcard) */}
            {eType === "flashcard" && (
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                  <span className="font-bold text-xs text-[#204434] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#204434] text-white flex items-center justify-center text-[10px]">03</span>
                    Dạng 3: Thẻ Flashcard học từ vựng (Tương tác lật 2 mặt)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E5DEC9] space-y-2">
                    <span className="font-bold text-xs text-[#204434] block">Mặt trước thẻ (Hán tự):</span>
                    <input
                      type="text"
                      value={eFlashcard.front}
                      onChange={(e) => {
                        setEFlashcard({ ...eFlashcard, front: e.target.value });
                        setEditorSaveStatus("UNSAVED");
                      }}
                      placeholder="Ví dụ: 医院"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5DEC9] text-lg font-serif font-bold text-center text-[#204434]"
                    />
                  </div>

                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E5DEC9] space-y-2">
                    <span className="font-bold text-xs text-[#204434] block">Mặt sau: Phiên âm Pinyin:</span>
                    <input
                      type="text"
                      value={eFlashcard.backPinyin}
                      onChange={(e) => {
                        setEFlashcard({ ...eFlashcard, backPinyin: e.target.value });
                        setEditorSaveStatus("UNSAVED");
                      }}
                      placeholder="Ví dụ: yīyuàn"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5DEC9] text-sm font-mono font-bold text-center text-[#3d7b56]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">Mặt sau: Ý nghĩa tiếng Việt:</label>
                  <input
                    type="text"
                    value={eFlashcard.backVi}
                    onChange={(e) => {
                      setEFlashcard({ ...eFlashcard, backVi: e.target.value });
                      setEditorSaveStatus("UNSAVED");
                    }}
                    placeholder="Ví dụ: Bệnh viện"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">Câu ví dụ tiếng Trung minh họa:</label>
                  <textarea
                    value={eFlashcard.exampleZh || ""}
                    onChange={(e) => {
                      setEFlashcard({ ...eFlashcard, exampleZh: e.target.value });
                      setEditorSaveStatus("UNSAVED");
                    }}
                    rows={2}
                    placeholder="Ví dụ: 他去医院看病了。(Anh ấy đã đến bệnh viện khám bệnh.)"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif"
                  />
                </div>
              </div>
            )}

            {/* 4. ĐIỀN TỪ (fill_blank) */}
            {eType === "fill_blank" && (
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                  <span className="font-bold text-xs text-[#204434] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#204434] text-white flex items-center justify-center text-[10px]">04</span>
                    Dạng 4: Điền từ vào chỗ trống (Tự động chấm)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEContent((prev) => prev + " [_____] ");
                      setEditorSaveStatus("UNSAVED");
                    }}
                    className="text-xs font-bold text-[#8F6D3B] hover:underline cursor-pointer"
                  >
                    + Chèn ô trống [_____]
                  </button>
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Đoạn văn có chỗ trống [_____]: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={eContent}
                    onChange={(e) => {
                      setEContent(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    rows={2}
                    placeholder="Ví dụ: 我想 [_____] 一杯热咖啡。"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">Phiên âm Pinyin gợi ý (nếu có):</label>
                  <input
                    type="text"
                    value={ePinyin}
                    onChange={(e) => {
                      setEPinyin(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    placeholder="Ví dụ: Wǒ xiǎng [_____] yì bēi rè kāfēi."
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Từ chính xác cần điền vào ô trống: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={eBlanksAnswer}
                    onChange={(e) => {
                      setEBlanksAnswer(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    placeholder="Ví dụ: 喝"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif font-bold"
                  />
                </div>
              </div>
            )}

            {/* 5. SẮP XẾP CÂU (sentence_order) */}
            {eType === "sentence_order" && (
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                  <span className="font-bold text-xs text-[#204434] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#204434] text-white flex items-center justify-center text-[10px]">05</span>
                    Dạng 5: Sắp xếp câu xáo trộn (Tự động chấm)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const parts = eContent.split(/([，。？！、\s]+)/).filter((s) => s.trim() && !/^[，。？！、\s]+$/.test(s));
                      if (parts.length > 0) {
                        setETokens(parts);
                        setEditorSaveStatus("UNSAVED");
                        showToast(`Đã tách thành ${parts.length} thẻ từ!`);
                      }
                    }}
                    className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md hover:bg-emerald-200 cursor-pointer"
                  >
                    ⚡ Tách thẻ từ tự động
                  </button>
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Câu tiếng Trung chuẩn hoàn chỉnh: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={eContent}
                    onChange={(e) => {
                      setEContent(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    placeholder="Ví dụ: 我今天在家休息。"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">Phiên âm Pinyin câu chuẩn:</label>
                  <input
                    type="text"
                    value={ePinyin}
                    onChange={(e) => {
                      setEPinyin(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    placeholder="Ví dụ: Wǒ jīntiān zài jiā xiūxi."
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-[#204434] block">
                    Danh sách các thẻ từ học viên sẽ nhận được:
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 bg-[#FAF7F0] rounded-xl border border-[#E5DEC9] min-h-12 items-center">
                    {eTokens.map((tok, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-white border border-[#E5DEC9] text-[#204434] font-serif font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>{tok}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setETokens(eTokens.filter((_, i) => i !== idx));
                            setEditorSaveStatus("UNSAVED");
                          }}
                          className="text-gray-400 hover:text-red-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {eTokens.length === 0 && (
                      <span className="text-xs text-[#8c9a8f] italic">
                        Chưa có thẻ từ. Hãy bấm "Tách thẻ từ tự động" hoặc gõ từ bên dưới.
                      </span>
                    )}
                  </div>

                  {/* Add manual token */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={eNewTokenInput}
                      onChange={(e) => setENewTokenInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && eNewTokenInput.trim()) {
                          e.preventDefault();
                          setETokens([...eTokens, eNewTokenInput.trim()]);
                          setENewTokenInput("");
                          setEditorSaveStatus("UNSAVED");
                        }
                      }}
                      placeholder="Nhập thẻ từ lẻ..."
                      className="px-3 py-1 rounded-lg bg-white border border-[#E5DEC9] text-xs font-serif text-[#204434] max-w-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (eNewTokenInput.trim()) {
                          setETokens([...eTokens, eNewTokenInput.trim()]);
                          setENewTokenInput("");
                          setEditorSaveStatus("UNSAVED");
                        }
                      }}
                      className="px-3 py-1 rounded-lg bg-[#204434] text-white font-bold text-xs cursor-pointer hover:bg-[#183629]"
                    >
                      + Thêm thẻ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. ĐÚNG / SAI (true_false) */}
            {eType === "true_false" && (
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                  <span className="font-bold text-xs text-[#204434] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#204434] text-white flex items-center justify-center text-[10px]">06</span>
                    Dạng 6: Đúng / Sai (True / False)
                  </span>
                  <span className="text-[11px] text-[#8F6D3B]">Hệ thống tự động chấm theo nhận định</span>
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Nhận định / Phát biểu tiếng Trung: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={eContent}
                    onChange={(e) => {
                      setEContent(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    rows={2}
                    placeholder="Ví dụ: “明天下雨，所以我们不去公园。” Câu này diễn tả nguyên nhân và kết quả."
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">Phiên âm Pinyin (nếu có):</label>
                  <input
                    type="text"
                    value={ePinyin}
                    onChange={(e) => {
                      setEPinyin(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    placeholder="Phiên âm Pinyin..."
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#204434] block">
                    Đáp án chính xác của câu phát biểu:
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setECorrectSingle("TRUE");
                        setEditorSaveStatus("UNSAVED");
                      }}
                      className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition ${
                        eCorrectSingle === "TRUE" || eCorrectSingle === "Đúng" || eCorrectSingle === "A"
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                          : "bg-[#FAF7F0] border-[#E5DEC9] text-[#315E48] hover:bg-emerald-50"
                      }`}
                    >
                      ✓ ĐÚNG (True / 对)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setECorrectSingle("FALSE");
                        setEditorSaveStatus("UNSAVED");
                      }}
                      className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition ${
                        eCorrectSingle === "FALSE" || eCorrectSingle === "Sai" || eCorrectSingle === "B"
                          ? "bg-red-600 text-white border-red-700 shadow-xs"
                          : "bg-[#FAF7F0] border-[#E5DEC9] text-[#315E48] hover:bg-red-50"
                      }`}
                    >
                      ✕ SAI (False / 错)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7. CHÉP TỪ - NỘP ẢNH (handwriting_photo) */}
            {eType === "handwriting_photo" && (
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                  <span className="font-bold text-xs text-[#204434] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#204434] text-white flex items-center justify-center text-[10px]">07</span>
                    Dạng 7: Chép từ – Nộp ảnh viết tay (Giáo viên chấm tay)
                  </span>
                  <span className="text-[11px] text-[#8F6D3B]">Yêu cầu chép ra vở và chụp ảnh gửi</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#204434] block mb-1">
                      Chữ Hán / Câu cần luyện viết: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={eContent}
                      onChange={(e) => {
                        setEContent(e.target.value);
                        setEditorSaveStatus("UNSAVED");
                      }}
                      placeholder="Ví dụ: 汉字, 漂亮"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-xl font-serif font-bold text-[#204434]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#204434] block mb-1">Phiên âm Pinyin & Âm Hán Việt:</label>
                    <input
                      type="text"
                      value={ePinyin}
                      onChange={(e) => {
                        setEPinyin(e.target.value);
                        setEditorSaveStatus("UNSAVED");
                      }}
                      placeholder="Ví dụ: hànzì (Hán tự)"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-sm text-[#204434]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">Số lần yêu cầu chép ra vở:</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={eHwRepeat}
                    onChange={(e) => {
                      setEHwRepeat(Number(e.target.value));
                      setEditorSaveStatus("UNSAVED");
                    }}
                    className="w-32 px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] font-bold text-[#204434]"
                  />
                  <span className="text-xs text-[#8c9a8f] ml-2">dòng / lần</span>
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Tiêu chí chấm Rubric (độ nét, nét bút thuận):
                  </label>
                  <textarea
                    value={eRubric}
                    onChange={(e) => {
                      setERubric(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    rows={2}
                    placeholder="Ví dụ: Nét chữ ngay ngắn cân đối (4đ), Viết đúng thứ tự nét (4đ), Chụp ảnh đủ sáng rõ nét (2đ)"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                  />
                </div>
              </div>
            )}

            {/* 8. TỰ LUẬN (essay) */}
            {eType === "essay" && (
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                  <span className="font-bold text-xs text-[#204434] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#204434] text-white flex items-center justify-center text-[10px]">08</span>
                    Dạng 8: Tự luận viết văn (Giáo viên chấm theo thang Rubric)
                  </span>
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Đề tài bài viết tự luận tiếng Trung: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={eContent}
                    onChange={(e) => {
                      setEContent(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    rows={3}
                    placeholder="Ví dụ: 请写一段话介绍你的周末安排 (约60-80字)。"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">Dàn ý gợi ý & Từ vựng tham khảo:</label>
                  <textarea
                    value={eSampleAnswer}
                    onChange={(e) => {
                      setESampleAnswer(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    rows={2}
                    placeholder="Gợi ý: Dùng các từ 起床, 学习, 看电影, 休息... để lập dàn ý"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">Thang điểm chấm Rubric:</label>
                  <textarea
                    value={eRubric}
                    onChange={(e) => {
                      setERubric(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    rows={2}
                    placeholder="Ví dụ: Đúng chủ đề (5đ), Ngữ pháp và chữ Hán chính xác (5đ), Đủ số lượng từ tối thiểu (5đ)"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                  />
                </div>
              </div>
            )}

            {/* 9. DỊCH CÂU (translation) */}
            {eType === "translation" && (
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                  <span className="font-bold text-xs text-[#204434] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#204434] text-white flex items-center justify-center text-[10px]">09</span>
                    Dạng 9: Dịch câu (Trung ↔ Việt)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setETransDirection("ZH_VI");
                        setEditorSaveStatus("UNSAVED");
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                        eTransDirection === "ZH_VI"
                          ? "bg-[#204434] text-white"
                          : "bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48]"
                      }`}
                    >
                      Trung ➔ Việt
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setETransDirection("VI_ZH");
                        setEditorSaveStatus("UNSAVED");
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                        eTransDirection === "VI_ZH"
                          ? "bg-[#204434] text-white"
                          : "bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48]"
                      }`}
                    >
                      Việt ➔ Trung
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Câu gốc cần dịch: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={eContent}
                    onChange={(e) => {
                      setEContent(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    rows={2}
                    placeholder={
                      eTransDirection === "ZH_VI"
                        ? "Ví dụ: 我打算下个星期去上海出差。"
                        : "Ví dụ: Tôi dự định tuần sau sẽ đi Thượng Hải công tác."
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Bản dịch tham khảo / Đáp án chuẩn: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={eSampleAnswer}
                    onChange={(e) => {
                      setESampleAnswer(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    rows={2}
                    placeholder="Bản dịch chuẩn để giáo viên đối chiếu chấm điểm..."
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                  />
                </div>
              </div>
            )}

            {/* 10. TÌM LỖI SAI (find_error) */}
            {eType === "find_error" && (
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                  <span className="font-bold text-xs text-[#204434] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#204434] text-white flex items-center justify-center text-[10px]">10</span>
                    Dạng 10: Tìm lỗi sai ngữ pháp / dùng từ
                  </span>
                  <span className="text-[11px] text-[#8F6D3B]">Học viên phát hiện lỗi và sửa lại câu</span>
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Câu tiếng Trung chứa lỗi sai: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={eContent}
                    onChange={(e) => {
                      setEContent(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    placeholder="Ví dụ: 我很高兴认识你了。"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#204434] block mb-1">
                      Từ / Cụm từ bị sai: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={eFindErrorWord}
                      onChange={(e) => {
                        setEFindErrorWord(e.target.value);
                        setEditorSaveStatus("UNSAVED");
                      }}
                      placeholder="Ví dụ: 了"
                      className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-red-600 font-serif font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#204434] block mb-1">
                      Câu viết lại chính xác sau khi sửa: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={eSampleAnswer}
                      onChange={(e) => {
                        setESampleAnswer(e.target.value);
                        setEditorSaveStatus("UNSAVED");
                      }}
                      placeholder="Ví dụ: 我很高兴认识你。"
                      className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-emerald-800 font-serif font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 11. NGHE CHỌN (listening_choice) */}
            {eType === "listening_choice" && (
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                  <span className="font-bold text-xs text-[#204434] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#204434] text-white flex items-center justify-center text-[10px]">11</span>
                    Dạng 11: Nghe chọn đáp án A/B/C/D
                  </span>
                  <span className="text-[11px] text-[#8F6D3B]">Tích hợp file âm thanh / ghi âm</span>
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Lời thoại / Transcript đoạn nghe (Chữ Hán): <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={eContent}
                    onChange={(e) => {
                      setEContent(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    rows={2}
                    placeholder="Ví dụ: 男：明天你想去哪里玩？ 女：我想去故宫看看。"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-[#204434] block">
                    Các phương án lựa chọn (Bấm chữ cái để đặt đáp án đúng):
                  </label>
                  {eOptions.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isCorrect = eCorrectSingle === letter;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setECorrectSingle(letter);
                            setEditorSaveStatus("UNSAVED");
                          }}
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer ${
                            isCorrect ? "bg-emerald-600 text-white" : "bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48]"
                          }`}
                        >
                          {letter}
                        </button>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const next = [...eOptions];
                            next[idx] = e.target.value;
                            setEOptions(next);
                            setEditorSaveStatus("UNSAVED");
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 12. NGHE ĐIỀN (listening_fill) */}
            {eType === "listening_fill" && (
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                  <span className="font-bold text-xs text-[#204434] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#204434] text-white flex items-center justify-center text-[10px]">12</span>
                    Dạng 12: Nghe điền từ còn thiếu vào chỗ trống
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEContent((prev) => prev + " [_____] ");
                      setEditorSaveStatus("UNSAVED");
                    }}
                    className="text-xs font-bold text-[#8F6D3B] hover:underline cursor-pointer"
                  >
                    + Chèn [_____]
                  </button>
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Đoạn nghe có chỗ trống [_____]: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={eContent}
                    onChange={(e) => {
                      setEContent(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    rows={2}
                    placeholder="Ví dụ: 他每天早上七点 [_____] 床。"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Từ chính xác cần điền khi nghe: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={eBlanksAnswer}
                    onChange={(e) => {
                      setEBlanksAnswer(e.target.value);
                      setEditorSaveStatus("UNSAVED");
                    }}
                    placeholder="Ví dụ: 起"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif font-bold"
                  />
                </div>
              </div>
            )}

            {/* Audio Recording / URL input */}
            <div className="p-3.5 rounded-2xl bg-[#FFFBF0] border border-[#BC9B6B]/40 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#8F6D3B] text-xs flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-[#8F6D3B]" />
                  <span>Âm thanh phát âm / File nghe:</span>
                </label>
                {isRecordingAudio ? (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="px-3 py-1 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1 animate-pulse cursor-pointer shadow-xs"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Dừng ghi âm</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="px-3 py-1 rounded-xl bg-[#204434] text-white font-bold text-xs flex items-center gap-1 hover:bg-[#183629] cursor-pointer shadow-xs"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Bấm để ghi âm Micro</span>
                  </button>
                )}
              </div>

              {eAudioUrl && (
                <div className="flex items-center gap-3 pt-1">
                  <audio src={eAudioUrl} controls className="h-8 max-w-sm" />
                  <button
                    type="button"
                    onClick={() => {
                      setEAudioUrl("");
                      setEditorSaveStatus("UNSAVED");
                    }}
                    className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Xóa âm thanh
                  </button>
                </div>
              )}
            </div>

            {/* Explanation / Solution */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] space-y-1">
              <label className="font-bold text-[#204434] block">
                Gợi ý / Lời giải sư phạm:
              </label>
              <textarea
                value={eExplanation}
                onChange={(e) => setEExplanation(e.target.value)}
                rows={2}
                placeholder="Giải thích chi tiết nghĩa hoặc ngữ pháp của câu..."
                className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
              />
            </div>

            {/* 4 Standardized Save Buttons (EXAM-006) */}
            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between flex-wrap gap-2 bg-[#FAF7F0] p-3 rounded-2xl">
              <span className="text-[11px] font-bold text-[#8F6D3B]">
                {editorSaveStatus === "SAVED" && "✅ Đã lưu vào hệ thống"}
                {editorSaveStatus === "SAVING" && "⏳ Đang lưu dữ liệu..."}
                {editorSaveStatus === "UNSAVED" && "● Chưa lưu thay đổi"}
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-white text-[#315E48] hover:bg-[#FAF7F0] font-bold text-xs"
                >
                  Lưu nháp
                </button>
                <button
                  type="button"
                  onClick={handleSaveToBank}
                  className="px-3.5 py-2 rounded-xl border border-[#BC9B6B] bg-[#FFFCF6] hover:bg-[#FAF7F0] text-[#8F6D3B] font-bold text-xs"
                >
                  Lưu vào Kho của tôi
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndCreateNext}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#204434] text-[#204434] font-bold text-xs hover:bg-[#FAF7F0]"
                >
                  Lưu & Tạo câu tiếp theo
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndAddToExam}
                  className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-xs shadow-xs"
                >
                  Lưu vào kho & Thêm vào đề
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL F: NHẬP CÂU HỎI TỪ FILE EXCEL / CSV */}
      {/* =================================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-[#8F6D3B]" />
                <h3 className="font-serif font-bold text-lg text-[#204434]">
                  Nhập câu hỏi từ file Excel / CSV
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportPreviewQuestions([]);
                  setImportFileName("");
                }}
                className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Tải file mẫu */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#204434]">Chưa có mẫu file nhập chuẩn?</p>
                  <p className="text-[11px] text-[#315E48]">
                    Tải mẫu file Excel/CSV chuẩn hỗ trợ đầy đủ 12 dạng câu hỏi và tiếng Trung UTF-8.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="px-3.5 py-2 rounded-xl border border-[#BC9B6B] bg-white text-[#8F6D3B] hover:bg-[#FAF7F0] font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file mẫu CSV</span>
                </button>
              </div>

              {/* Upload file input */}
              <div className="border-2 border-dashed border-[#BC9B6B]/60 rounded-2xl p-6 bg-white text-center space-y-2">
                <UploadCloud className="w-8 h-8 text-[#8F6D3B] mx-auto" />
                <p className="font-bold text-[#204434]">Kéo thả file vào đây hoặc bấm để chọn file</p>
                <p className="text-[11px] text-[#315E48]">Hỗ trợ file định dạng .csv hoặc .txt (UTF-8)</p>
                <label className="inline-block mt-2 px-4 py-2 rounded-xl bg-[#204434] text-white font-bold cursor-pointer hover:bg-[#183629] shadow-xs">
                  <span>Chọn file từ máy tính</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {importFileName && (
                  <p className="text-xs font-bold text-emerald-800 pt-1">
                    Đã chọn: {importFileName} ({importPreviewQuestions.length} câu hỏi hợp lệ)
                  </p>
                )}
              </div>

              {/* Xem trước câu hỏi đã parse */}
              {importPreviewQuestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#204434]">
                      Xem trước ({importPreviewQuestions.length} câu hỏi):
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                      Sẵn sàng nhập
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-[#E5DEC9] rounded-2xl divide-y divide-[#E5DEC9] bg-white">
                    {importPreviewQuestions.map((q, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-[11px]">
                        <div className="space-y-0.5 max-w-md truncate">
                          <p className="font-bold text-[#204434] truncate">
                            {idx + 1}. {q.content}
                          </p>
                          <p className="text-[10px] text-[#315E48]">
                            {q.pinyin && `[${q.pinyin}] `}Loại: {q.type} · Đáp án: {q.correctAnswer} · Điểm: {q.points}đ
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Hợp lệ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportPreviewQuestions([]);
                  setImportFileName("");
                }}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48] hover:bg-[#FAF7F0] font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={importPreviewQuestions.length === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold shadow-xs disabled:opacity-40 cursor-pointer"
              >
                Xác nhận nạp {importPreviewQuestions.length} câu vào kho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL G: TRỢ LÝ AI SINH CÂU HỎI TỰ ĐỘNG */}
      {/* =================================================================== */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#204434]">
                    Trợ lý AI sinh câu hỏi HSK tự động
                  </h3>
                  <p className="text-[11px] text-[#315E48]">
                    Tự động tạo câu hỏi chuẩn kỳ thi HSK theo chủ đề, cấp độ và dạng câu
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAiModalOpen(false);
                  setAiGeneratedResults([]);
                  setAiWarningMessage("");
                }}
                className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quota warning alert if triggered */}
            {aiWarningMessage && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Thông báo từ hệ thống AI</span>
                </div>
                <p className="text-[11px] leading-relaxed">{aiWarningMessage}</p>
              </div>
            )}

            {/* Input Form */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Chủ đề */}
                <div>
                  <label className="font-bold text-[#204434] block mb-1">Chủ đề bài học / Từ vựng:</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Ví dụ: Mua sắm, Gia đình, Đi du lịch..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-medium"
                  />
                </div>

                {/* Cấp độ HSK */}
                <div>
                  <label className="font-bold text-[#204434] block mb-1">Cấp độ chuẩn HSK:</label>
                  <select
                    value={aiLevel}
                    onChange={(e) => setAiLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-semibold"
                  >
                    {[1, 2, 3, 4, 5, 6].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        HSK {lvl} (Chuẩn 3.0)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Dạng câu hỏi */}
                <div>
                  <label className="font-bold text-[#204434] block mb-1">Dạng câu hỏi mong muốn:</label>
                  <select
                    value={aiType}
                    onChange={(e) => setAiType(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-semibold"
                  >
                    <option value="multiple_choice">Trắc nghiệm chọn 1 đáp án</option>
                    <option value="sentence_ordering">Sắp xếp từ thành câu</option>
                    <option value="fill_blank">Điền từ vào chỗ trống</option>
                    <option value="true_false">Đúng / Sai (Phán đoán ngữ nghĩa)</option>
                  </select>
                </div>

                {/* Số lượng câu */}
                <div>
                  <label className="font-bold text-[#204434] block mb-1">Số lượng câu cần sinh:</label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-semibold"
                  >
                    <option value={1}>1 câu hỏi</option>
                    <option value={3}>3 câu hỏi</option>
                    <option value={5}>5 câu hỏi</option>
                  </select>
                </div>
              </div>

              {/* Ngữ cảnh / Đoạn văn tham khảo */}
              <div>
                <label className="font-bold text-[#204434] block mb-1">
                  Đoạn văn ngữ cảnh / Bài khóa (Tùy chọn):
                </label>
                <textarea
                  value={aiContextText}
                  onChange={(e) => setAiContextText(e.target.value)}
                  placeholder="Dán văn bản tiếng Trung hoặc nội dung bài giảng để AI bóc tách từ vựng và tạo câu hỏi tương ứng..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                />
              </div>

              {/* Nút bấm sinh câu hỏi */}
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={handleGenerateQuestionsWithAI}
                  className="px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 text-[#BC9B6B] ${isAiLoading ? "animate-spin" : ""}`} />
                  <span>{isAiLoading ? "Đang nhờ AI sinh câu hỏi..." : "Bắt đầu sinh câu hỏi"}</span>
                </button>
              </div>

              {/* Kết quả xem trước câu hỏi AI sinh ra */}
              {aiGeneratedResults.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-[#E5DEC9]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#204434] text-xs">
                      Kết quả AI sinh được ({aiGeneratedResults.length} câu hỏi):
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      Sẵn sàng nạp vào kho
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {aiGeneratedResults.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white border border-[#E5DEC9] space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-serif font-bold text-sm text-[#204434]">
                              {idx + 1}. {q.content}
                            </span>
                            {q.pinyin && (
                              <span className="block text-[11px] font-mono text-[#315E48]">
                                [{q.pinyin}]
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-900 shrink-0">
                            +{q.points}đ
                          </span>
                        </div>

                        {/* Options preview */}
                        {Array.isArray(q.options) && q.options.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {q.options.map((opt: any, oIdx: number) => {
                              const optText = typeof opt === "string" ? opt : opt.text || opt;
                              const isCorrect =
                                q.correctAnswer === String.fromCharCode(65 + oIdx) ||
                                q.correctAnswer === optText;
                              return (
                                <span
                                  key={oIdx}
                                  className={`text-[10px] px-2 py-1 rounded-lg border ${
                                    isCorrect
                                      ? "bg-emerald-50 border-emerald-400 font-bold text-emerald-900"
                                      : "bg-[#FAF7F0] border-[#E5DEC9] text-[#526056]"
                                  }`}
                                >
                                  {String.fromCharCode(65 + oIdx)}. {optText}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Tokens preview if sentence ordering */}
                        {q.tokens && q.tokens.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {q.tokens.map((token: string, tIdx: number) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 rounded-md bg-[#204434] text-white text-[11px] font-bold"
                              >
                                {token}
                              </span>
                            ))}
                          </div>
                        )}

                        {q.explanation && (
                          <p className="text-[10px] text-[#8F6D3B] italic pt-1">
                            💡 Lời giải: {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsAiModalOpen(false);
                  setAiGeneratedResults([]);
                  setAiWarningMessage("");
                }}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48] hover:bg-[#FAF7F0] font-semibold"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={aiGeneratedResults.length === 0}
                onClick={handleConfirmAddAiQuestions}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold shadow-xs disabled:opacity-40 cursor-pointer"
              >
                Xác nhận nạp {aiGeneratedResults.length} câu vào Ngân hàng câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL G: LÀM THỬ CÂU HỎI THEO GÓC NHÌN HỌC VIÊN (LIVE STUDENT TEST) */}
      {/* =================================================================== */}
      {testQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#204434]">
                    Làm thử câu hỏi · Góc nhìn học viên
                  </h3>
                  <p className="text-[11px] text-[#315E48]">
                    Kiểm tra trực quan cách học sinh tương tác và trải nghiệm dạng bài tập này
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTestQuestionModal(null)}
                className="p-1 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Question Meta Badge */}
            <div className="flex items-center justify-between bg-[#FAF7F0] p-3 rounded-2xl border border-[#E5DEC9]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#204434] text-white font-bold text-[11px]">
                  {OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === testQuestionModal.type)?.name ||
                    testQuestionModal.type}
                </span>
                <span className="text-[11px] font-bold text-[#8F6D3B]">
                  +{testQuestionModal.points} điểm · Nguồn: {testQuestionModal.sourceLesson || "HSK"}
                </span>
              </div>
              <a
                href="/s/attempts/preview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <span>Mở toàn màn hình</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Question Prompt */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-2">
              {testQuestionModal.pinyin && (
                <p className="font-mono text-emerald-700 text-xs font-semibold">
                  {testQuestionModal.pinyin}
                </p>
              )}
              <h4 className="font-serif font-bold text-base text-[#204434] leading-relaxed">
                {testQuestionModal.content}
              </h4>
              {testQuestionModal.audioUrl && (
                <div className="pt-2">
                  <audio src={testQuestionModal.audioUrl} controls className="h-8 max-w-sm" />
                </div>
              )}
            </div>

            {/* Dynamic Interactive Student Playground according to type */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3">
              {/* Type 1: MCQ & Type 11: Listening Choice */}
              {(testQuestionModal.type === "multiple_choice" ||
                testQuestionModal.type === "listening_choice") && (
                <div className="space-y-2">
                  <label className="font-bold text-[#204434] block text-xs">
                    Chọn phương án trả lời:
                  </label>
                  {(testQuestionModal.options || []).map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = testSelectedOption === letter;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTestSelectedOption(letter);
                          setTestFeedbackResult(null);
                        }}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-500 font-bold text-emerald-950 shadow-xs"
                            : "bg-[#FAF7F0] border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]/80"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-emerald-600 text-white"
                              : "bg-white border border-[#E5DEC9] text-[#315E48]"
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Type 2: Matching Pairs */}
              {testQuestionModal.type === "matching" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-[#8F6D3B] font-semibold">
                    👉 Bấm 1 từ ở Cột A, sau đó bấm nghĩa tương ứng ở Cột B để nối cặp:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <span className="font-bold text-[#204434] block text-[11px]">Cột A:</span>
                      {(testQuestionModal.matchingPairs || []).map((p, idx) => {
                        const isMatched = !!testMatchedPairs[p.left];
                        const isSelected = testSelectedLeft === p.left;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setTestSelectedLeft(p.left)}
                            className={`w-full p-2.5 rounded-xl border text-left text-xs font-serif font-bold transition cursor-pointer ${
                              isSelected
                                ? "bg-amber-100 border-amber-400 text-amber-900"
                                : isMatched
                                ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                                : "bg-[#FAF7F0] border-[#E5DEC9] text-[#204434]"
                            }`}
                          >
                            <span>{p.left}</span>
                            {isMatched && (
                              <span className="text-[10px] text-emerald-800 ml-1.5 font-sans font-normal">
                                ➔ {testMatchedPairs[p.left]}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="space-y-2">
                      <span className="font-bold text-[#204434] block text-[11px]">Cột B:</span>
                      {(testQuestionModal.matchingPairs || []).map((p, idx) => {
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (testSelectedLeft) {
                                setTestMatchedPairs({
                                  ...testMatchedPairs,
                                  [testSelectedLeft]: p.right,
                                });
                                setTestSelectedLeft(null);
                                setTestFeedbackResult(null);
                              }
                            }}
                            className="w-full p-2.5 rounded-xl border text-left text-xs bg-[#FAF7F0] border-[#E5DEC9] text-[#204434] hover:bg-emerald-50 cursor-pointer transition"
                          >
                            <span>{p.right}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {Object.keys(testMatchedPairs).length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTestMatchedPairs({});
                        setTestSelectedLeft(null);
                        setTestFeedbackResult(null);
                      }}
                      className="text-[11px] text-red-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Xóa kết quả nối và làm lại</span>
                    </button>
                  )}
                </div>
              )}

              {/* Type 3: Flashcard */}
              {testQuestionModal.type === "flashcard" && (
                <div className="space-y-3 text-center py-2">
                  <div
                    onClick={() => setTestFlashcardFlipped(!testFlashcardFlipped)}
                    className="p-8 rounded-2xl border-2 border-dashed border-[#BC9B6B] bg-[#FFFBF0] hover:bg-[#FFF7E6] cursor-pointer transition transform hover:scale-[1.01] shadow-xs space-y-2"
                  >
                    {!testFlashcardFlipped ? (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8F6D3B] tracking-wider block mb-2">
                          MẶT TRƯỚC (BẤM ĐỂ LẬT THẺ)
                        </span>
                        <div className="text-3xl font-serif font-bold text-[#204434]">
                          {testQuestionModal.flashcard?.front || testQuestionModal.content}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block mb-1">
                          MẶT SAU (LỜI GIẢI CHI TIẾT)
                        </span>
                        <div className="text-base font-mono font-bold text-emerald-800">
                          {testQuestionModal.flashcard?.backPinyin || testQuestionModal.pinyin}
                        </div>
                        <div className="text-lg font-bold text-[#204434]">
                          {testQuestionModal.flashcard?.backVi}
                        </div>
                        {testQuestionModal.flashcard?.exampleZh && (
                          <div className="text-xs text-[#315E48] font-serif pt-2 border-t border-[#E5DEC9]">
                            {testQuestionModal.flashcard?.exampleZh}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8c9a8f] italic">
                    Bấm vào thẻ ở trên để kiểm tra hiệu ứng lật thẻ flashcard!
                  </p>
                </div>
              )}

              {/* Type 5: Sentence Order */}
              {testQuestionModal.type === "sentence_order" && (
                <div className="space-y-3">
                  <label className="font-bold text-[#204434] block text-xs">
                    Ghép câu hoàn chỉnh bằng cách bấm các thẻ từ:
                  </label>
                  {/* Result Box */}
                  <div className="min-h-12 p-3 rounded-xl bg-[#FAF7F0] border-2 border-dashed border-[#204434] flex flex-wrap gap-1.5 items-center">
                    {testOrderingTokens.map((tok, idx) => (
                      <span
                        key={idx}
                        onClick={() => {
                          setTestOrderingTokens(testOrderingTokens.filter((_, i) => i !== idx));
                          setTestFeedbackResult(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#204434] text-white font-serif font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-red-700"
                        title="Bấm để bỏ từ này"
                      >
                        <span>{tok}</span>
                        <X className="w-3 h-3 opacity-70" />
                      </span>
                    ))}
                    {testOrderingTokens.length === 0 && (
                      <span className="text-xs text-[#8c9a8f] italic">
                        Chưa chọn từ nào. Hãy bấm các thẻ từ vựng bên dưới.
                      </span>
                    )}
                  </div>
                  {/* Available tokens */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(testQuestionModal.tokens || []).map((tok, idx) => {
                      const usedCount = testOrderingTokens.filter((t) => t === tok).length;
                      const totalCount = (testQuestionModal.tokens || []).filter((t) => t === tok).length;
                      const isExhausted = usedCount >= totalCount;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isExhausted}
                          onClick={() => {
                            setTestOrderingTokens([...testOrderingTokens, tok]);
                            setTestFeedbackResult(null);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-serif font-bold text-xs cursor-pointer transition ${
                            isExhausted
                              ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-40"
                              : "bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] shadow-2xs"
                          }`}
                        >
                          {tok}
                        </button>
                      );
                    })}
                  </div>
                  {testOrderingTokens.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTestOrderingTokens([]);
                        setTestFeedbackResult(null);
                      }}
                      className="text-[11px] text-red-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Xếp lại từ đầu</span>
                    </button>
                  )}
                </div>
              )}

              {/* Type 6: True / False */}
              {testQuestionModal.type === "true_false" && (
                <div className="space-y-3">
                  <label className="font-bold text-[#204434] block text-xs">
                    Theo bạn nhận định trên là Đúng hay Sai?
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setTestSelectedOption("TRUE");
                        setTestFeedbackResult(null);
                      }}
                      className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition ${
                        testSelectedOption === "TRUE"
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                          : "bg-[#FAF7F0] border-[#E5DEC9] text-[#315E48] hover:bg-emerald-50"
                      }`}
                    >
                      ✓ ĐÚNG (True / 对)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTestSelectedOption("FALSE");
                        setTestFeedbackResult(null);
                      }}
                      className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition ${
                        testSelectedOption === "FALSE"
                          ? "bg-red-600 text-white border-red-700 shadow-xs"
                          : "bg-[#FAF7F0] border-[#E5DEC9] text-[#315E48] hover:bg-red-50"
                      }`}
                    >
                      ✕ SAI (False / 错)
                    </button>
                  </div>
                </div>
              )}

              {/* Type 4, 12, 7, 8, 9, 10: Input / Text answers */}
              {testQuestionModal.type !== "multiple_choice" &&
                testQuestionModal.type !== "listening_choice" &&
                testQuestionModal.type !== "matching" &&
                testQuestionModal.type !== "flashcard" &&
                testQuestionModal.type !== "sentence_order" &&
                testQuestionModal.type !== "true_false" && (
                  <div className="space-y-2">
                    <label className="font-bold text-[#204434] block text-xs">
                      Nhập câu trả lời học viên:
                    </label>
                    {testQuestionModal.type === "essay" || testQuestionModal.type === "translation" ? (
                      <textarea
                        value={testInputText}
                        onChange={(e) => {
                          setTestInputText(e.target.value);
                          setTestFeedbackResult(null);
                        }}
                        rows={3}
                        placeholder="Học viên gõ bài làm tiếng Trung..."
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif"
                      />
                    ) : (
                      <input
                        type="text"
                        value={testInputText}
                        onChange={(e) => {
                          setTestInputText(e.target.value);
                          setTestFeedbackResult(null);
                        }}
                        placeholder="Học viên gõ chữ Hán, Pinyin hoặc đáp án..."
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-sm text-[#204434] font-serif font-bold"
                      />
                    )}
                  </div>
                )}

              {/* Check Answer Button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    let isCorrect = false;
                    const q = testQuestionModal;
                    if (q.type === "multiple_choice" || q.type === "listening_choice") {
                      isCorrect = testSelectedOption === q.correctAnswer;
                    } else if (q.type === "true_false") {
                      isCorrect =
                        testSelectedOption === q.correctAnswer ||
                        (testSelectedOption === "TRUE" && q.correctAnswer === "A") ||
                        (testSelectedOption === "FALSE" && q.correctAnswer === "B");
                    } else if (q.type === "sentence_order") {
                      const assembled = testOrderingTokens.join("");
                      const targetClean = (q.content || "").replace(/[，。？！、\s]/g, "");
                      isCorrect = assembled === targetClean;
                    } else if (q.type === "fill_blank" || q.type === "listening_fill") {
                      isCorrect =
                        testInputText.trim().toLowerCase() ===
                        (typeof q.correctAnswer === "string" ? q.correctAnswer.trim().toLowerCase() : "");
                    } else {
                      isCorrect = testInputText.trim().length > 0;
                    }

                    setTestFeedbackResult({
                      isCorrect,
                      message: isCorrect
                        ? `🎉 Trả lời chính xác! Bạn nhận được trọn vẹn ${q.points} điểm.`
                        : `Chưa chính xác. Đáp án chuẩn: ${typeof q.correctAnswer === "string" ? q.correctAnswer : q.sampleAnswer || "Xem lời giải"}`,
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kiểm tra đáp án</span>
                </button>
              </div>

              {/* Feedback Result Banner */}
              {testFeedbackResult && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 animate-fade-in ${
                    testFeedbackResult.isCorrect
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                      : "bg-amber-50 border-amber-300 text-amber-950"
                  }`}
                >
                  <p className="font-bold">{testFeedbackResult.message}</p>
                  {testQuestionModal.explanation && (
                    <p className="text-[11px] opacity-90">
                      💡 <strong>Lời giải sư phạm:</strong> {testQuestionModal.explanation}
                    </p>
                  )}
                  {testQuestionModal.rubric && (
                    <p className="text-[11px] opacity-90">
                      📋 <strong>Tiêu chí chấm Rubric:</strong> {testQuestionModal.rubric}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  const q = testQuestionModal;
                  setTestQuestionModal(null);
                  handleOpenEditOrDraft(q);
                }}
                className="px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-white text-[#315E48] hover:bg-[#FAF7F0] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa câu hỏi này</span>
              </button>

              <button
                type="button"
                onClick={() => setTestQuestionModal(null)}
                className="px-5 py-2 rounded-xl bg-[#204434] text-white font-bold shadow-xs hover:bg-[#183629] cursor-pointer"
              >
                Đóng làm thử
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
