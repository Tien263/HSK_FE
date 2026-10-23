"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import {
  ExamQuestionItem,
  QuestionType,
  OFFICIAL_12_QUESTION_TYPES,
  UNIFIED_QUESTION_BANK,
} from "@/lib/assignment-data";

interface QuestionBankWorkspaceProps {
  onNavigateToAssignments?: (examId?: string) => void;
  showToast: (msg: string) => void;
}

export default function QuestionBankWorkspace({
  onNavigateToAssignments,
  showToast,
}: QuestionBankWorkspaceProps) {
  // =========================================================================
  // 1. STATE & PERSISTENCE
  // =========================================================================
  const [questions, setQuestions] = useState<ExamQuestionItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hanyu_custom_question_bank");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error("Failed to parse cached questions", e);
        }
      }
    }
    return UNIFIED_QUESTION_BANK;
  });

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hanyu_custom_question_bank", JSON.stringify(questions));
    }
  }, [questions]);

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

  // Modal B: Add to Exam
  const [targetQuestionForExam, setTargetQuestionForExam] = useState<ExamQuestionItem | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string>("ex-1");

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

  // Available Exams List (Mockup section 7.2)
  const [availableExams, setAvailableExams] = useState([
    { id: "ex-1", title: "Ôn tập HSK 1 – Bài 5", tag: "Đang soạn", count: 4, points: 25 },
    { id: "ex-2", title: "Kiểm tra giữa kỳ", tag: "Bản nháp", count: 12, points: 60 },
    { id: "ex-3", title: "Bài tập tuần 3", tag: "Bản nháp", count: 8, points: 40 },
    { id: "ex-new", title: "Tạo đề mới...", tag: "Tạo mới", count: 0, points: 0 },
  ]);

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
  const handleOpenCreateNew = () => {
    setEditingQuestion(null);
    setEType("multiple_choice");
    setETitle("“休息” có nghĩa là gì?");
    setESubtitle("Chọn 1 đáp án đúng");
    setEContent("“休息” có nghĩa là gì?");
    setEPinyin("xiūxi");
    setEPoints(5);
    setEDifficulty("EASY");
    setESourceLesson("HSK 1 – Bài 5");
    setEOptions(["Hôm nay", "Nghỉ ngơi", "Ngày mai", "Bị bệnh"]);
    setECorrectSingle("B");
    setEExplanation("“休息” (xiūxi) có nghĩa là nghỉ ngơi.");
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
    if (q.options && q.options.length > 0) setEOptions(q.options);
    if (typeof q.correctAnswer === "string") setECorrectSingle(q.correctAnswer);
    if (q.matchingPairs && q.matchingPairs.length > 0) setEMatchingPairs(q.matchingPairs);
    if (q.tokens && q.tokens.length > 0) setETokens(q.tokens);
    if (q.flashcard) setEFlashcard(q.flashcard);
    if (q.handwritingCount) setEHwRepeat(q.handwritingCount);
    if (q.blanks && q.blanks.length > 0) setEBlanksAnswer(q.blanks[0].answer);
    else if (typeof q.correctAnswer === "string") setEBlanksAnswer(q.correctAnswer);

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
      correctAnswer: eType === "fill_blank" ? eBlanksAnswer : eCorrectSingle,
      matchingPairs: eMatchingPairs,
      tokens: eTokens,
      flashcard: eFlashcard,
      handwritingCount: eHwRepeat,
      rubric: eRubric,
      sampleAnswer: eContent,
      blanks: [{ id: "b1", answer: eBlanksAnswer }],
      usedInExamCount: editingQuestion?.usedInExamCount || 0,
      usedInExams: editingQuestion?.usedInExams || [],
      createdAt: editingQuestion?.createdAt || formattedDate,
      updatedAt: formattedDate,
    };
  };

  // Save Handlers for the 4 Buttons
  const handleSaveDraft = () => {
    setEditorSaveStatus("SAVING");
    setTimeout(() => {
      const draftQ = buildCurrentEditorQuestion("DRAFT");
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

  const handleConfirmDelete = () => {
    if (!deleteTargetQuestion) return;
    setQuestions(questions.filter((q) => q.id !== deleteTargetQuestion.id));
    showToast(`Đã xóa câu hỏi "${deleteTargetQuestion.title}" khỏi Kho câu hỏi của tôi!`);
    setDeleteTargetQuestion(null);
    setOpenActionMenuId(null);
  };

  const handleConfirmAddToExam = () => {
    if (!targetQuestionForExam) return;
    const exam = availableExams.find((e) => e.id === selectedExamId);
    const examTitle = exam ? exam.title : "Đề kiểm tra mới";

    // Update question's usage count and exams list
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === targetQuestionForExam.id) {
          const currentExams = q.usedInExams || [];
          const exists = currentExams.some((e) => e.id === selectedExamId);
          const updatedExams = exists
            ? currentExams
            : [
                ...currentExams,
                {
                  id: selectedExamId,
                  title: examTitle,
                  status: exam?.tag || "Đang soạn",
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

    showToast(`Đã thêm câu hỏi vào đề "${examTitle}" thành công!`);
    setTargetQuestionForExam(null);
    setOpenActionMenuId(null);
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

        <button
          onClick={handleOpenCreateNew}
          className="px-4 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4 text-[#BC9B6B]" />
          <span>+ Tạo câu hỏi mới</span>
        </button>
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
                    <div className="space-y-2">
                      <HelpCircle className="w-8 h-8 mx-auto text-[#BC9B6B]" />
                      <p className="font-serif font-bold text-sm text-[#204434]">
                        Không tìm thấy câu hỏi phù hợp
                      </p>
                      <p className="text-xs text-[#315E48]">
                        Hãy thử thay đổi từ khóa tìm kiếm hoặc bấm "Xóa bộ lọc" để xem toàn bộ kho câu hỏi.
                      </p>
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
                                onClick={() => setViewQuestion(q)}
                                className="px-2 py-1 rounded-lg border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-[11px] font-bold text-[#204434] flex items-center gap-1 transition"
                                title="Xem chi tiết câu hỏi"
                              >
                                <Eye className="w-3 h-3 text-[#BC9B6B]" />
                                <span>Xem</span>
                              </button>

                              <button
                                onClick={() => setTargetQuestionForExam(q)}
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
                              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-[#E5DEC9] shadow-lg py-1.5 z-20 text-xs font-semibold text-[#204434] space-y-0.5">
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
      {/* 8. MODAL B: CHỌN ĐỀ KIỂM TRA ĐỂ THÊM CÂU HỎI (Mockup Bên Phải Dưới) */}
      {/* =================================================================== */}
      {targetQuestionForExam && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Chọn đề kiểm tra để thêm câu hỏi
              </h3>
              <button
                onClick={() => setTargetQuestionForExam(null)}
                className="p-1 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0]"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <p className="text-xs text-[#315E48]">
              Câu hỏi: <strong>{targetQuestionForExam.title}</strong> ({targetQuestionForExam.points} điểm)
            </p>

            <div className="space-y-2 text-xs">
              {availableExams.map((exam) => {
                const isSelected = selectedExamId === exam.id;
                return (
                  <label
                    key={exam.id}
                    onClick={() => setSelectedExamId(exam.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? "bg-emerald-50/70 border-emerald-400 font-bold text-emerald-900"
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
                      <span>{exam.title}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        exam.tag === "Đang soạn"
                          ? "bg-emerald-200 text-emerald-900"
                          : exam.tag === "Tạo mới"
                          ? "bg-[#204434] text-white"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {exam.tag}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setTargetQuestionForExam(null)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] bg-white text-[#315E48] hover:bg-[#FAF7F0]"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAddToExam}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white shadow-xs flex items-center gap-1.5"
              >
                <span>Thêm vào đề</span>
              </button>
            </div>
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
                onChange={(e) => setEType(e.target.value as QuestionType)}
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

            {/* Specialized Form Fields according to eType */}
            {eType === "multiple_choice" && (
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] space-y-3">
                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Đề bài câu hỏi (Chữ Hán):
                  </label>
                  <textarea
                    value={eContent}
                    onChange={(e) => setEContent(e.target.value)}
                    rows={2}
                    placeholder="Ví dụ: “休息” (xiūxi) có nghĩa là gì?"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#204434] block">
                    Các phương án (Bấm chữ cái để đặt làm đáp án đúng):
                  </label>
                  {eOptions.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isCorrect = eCorrectSingle === letter;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setECorrectSingle(letter)}
                          className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 ${
                            isCorrect
                              ? "bg-emerald-600 text-white"
                              : "bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48]"
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
                          }}
                          className="flex-1 px-3 py-1 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {eType === "fill_blank" && (
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] space-y-3">
                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Đoạn văn có chỗ trống [_____]:
                  </label>
                  <textarea
                    value={eContent}
                    onChange={(e) => setEContent(e.target.value)}
                    rows={2}
                    placeholder="Ví dụ: 我是______咖啡。"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Từ chính xác cần điền vào ô trống:
                  </label>
                  <input
                    type="text"
                    value={eBlanksAnswer}
                    onChange={(e) => setEBlanksAnswer(e.target.value)}
                    placeholder="Ví dụ: 喝"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-bold"
                  />
                </div>
              </div>
            )}

            {eType === "sentence_order" && (
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] space-y-3">
                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Câu tiếng Trung chuẩn:
                  </label>
                  <input
                    type="text"
                    value={eContent}
                    onChange={(e) => {
                      setEContent(e.target.value);
                      const parts = e.target.value.split(/([，。？！、\s]+)/).filter(Boolean);
                      setETokens(parts);
                    }}
                    placeholder="我今天休息"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#204434] block">Các thẻ từ:</label>
                  <div className="flex flex-wrap gap-2">
                    {eTokens.map((tok, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#204434]/10 text-[#204434] font-serif font-bold"
                      >
                        {tok}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
    </div>
  );
}
