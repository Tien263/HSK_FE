"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Eye,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  BookOpen,
  Send,
  Save,
  Check,
  X,
  Volume2,
  Edit3,
  Maximize2,
  RotateCcw,
  Users,
  Award,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  UploadCloud,
} from "lucide-react";
import {
  OFFICIAL_12_QUESTION_TYPES,
  QuestionType,
  ExamQuestionItem,
  GUIDED_QUESTION_TEMPLATES,
  UNIFIED_QUESTION_BANK,
  MOCK_WAITING_SUBMISSIONS,
  StudentSubmissionItem,
} from "@/lib/assignment-data";
import { CulturalSelectionItem } from "@/lib/lesson-data";

interface ClassOption {
  id: string;
  name: string;
  code?: string;
  studentCount?: number;
}

interface AssignmentsWorkspaceProps {
  currentUser?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  classesList?: ClassOption[];
  onBackToDashboard?: () => void;
  initialNewAssignmentPayload?: {
    lessonTitle: string;
    classId: string;
    vocabList?: { id: string; hanzi: string; pinyin: string; meaningVi: string; exampleZh?: string }[];
    grammarList?: { id: string; title: string; structure?: string; explanation?: string }[];
    culturalList?: CulturalSelectionItem[];
  };
}

export function AssignmentsWorkspace({
  currentUser,
  classesList = [],
  onBackToDashboard,
  initialNewAssignmentPayload,
}: AssignmentsWorkspaceProps) {
  // Main view modes: "LIST" | "COMPOSER" | "GRADING_MODAL"
  const [viewMode, setViewMode] = useState<"LIST" | "COMPOSER">("LIST");

  // Filter tab in List view
  const [activeTab, setActiveTab] = useState<
    "ALL" | "ACTIVE" | "WAITING_GRADE" | "DRAFT" | "CLOSED"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Existing assignments list
  const [assignments, setAssignments] = useState([
    {
      id: "ass-1",
      title: "Bài tập củng cố: Bài 5 - 今天我休息",
      className: classesList[0]?.name || "HSK1-K24 Sơ cấp",
      classId: classesList[0]?.id || "c1",
      dueAt: "25/10/2026 23:59",
      durationMin: 45,
      submittedCount: 18,
      totalStudents: 22,
      status: "ACTIVE",
      waitingGradeCount: 2,
      totalQuestions: 6,
      totalPoints: 50,
    },
    {
      id: "ass-2",
      title: "Kiểm tra giữa kỳ: HSK 1 Tiêu chuẩn (Đề 01)",
      className: classesList[0]?.name || "HSK1-K24 Sơ cấp",
      classId: classesList[0]?.id || "c1",
      dueAt: "28/10/2026 18:00",
      durationMin: 60,
      submittedCount: 22,
      totalStudents: 22,
      status: "ACTIVE",
      waitingGradeCount: 1,
      totalQuestions: 12,
      totalPoints: 100,
    },
    {
      id: "ass-3",
      title: "Luyện viết chữ Hán và nộp ảnh tuần 2",
      className: classesList[1]?.name || "HSK2-K18 Cấp tốc",
      classId: classesList[1]?.id || "c2",
      dueAt: "19/10/2026 23:59",
      durationMin: 30,
      submittedCount: 15,
      totalStudents: 15,
      status: "CLOSED",
      waitingGradeCount: 0,
      totalQuestions: 4,
      totalPoints: 40,
    },
  ]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // =========================================================================
  // EXAM COMPOSER STATE (Ghép đề & Thiết lập giao đề)
  // =========================================================================
  const [examTitle, setExamTitle] = useState(
    initialNewAssignmentPayload?.lessonTitle
      ? `Bài tập củng cố: ${initialNewAssignmentPayload.lessonTitle}`
      : "Đề bài tập tổng hợp: HSK 1 - Tuần 3"
  );
  const [examDescription, setExamDescription] = useState(
    "Bài tập kiểm tra 12 dạng củng cố từ vựng, ngữ pháp, dịch câu và chép chữ Hán."
  );
  const [examCurriculum, setExamCurriculum] = useState("HSK 3.0");
  const [examLevel, setExamLevel] = useState(1);

  // Selected questions in current draft exam
  const [draftQuestions, setDraftQuestions] = useState<ExamQuestionItem[]>([
    GUIDED_QUESTION_TEMPLATES[0], // MCQ
    GUIDED_QUESTION_TEMPLATES[1], // Matching
    GUIDED_QUESTION_TEMPLATES[3], // Fill blank
    GUIDED_QUESTION_TEMPLATES[6], // Handwriting
    GUIDED_QUESTION_TEMPLATES[8], // Translation
  ]);

  // Auto-switch to Composer if incoming payload transferred from Lesson Library
  useEffect(() => {
    if (initialNewAssignmentPayload) {
      setViewMode("COMPOSER");
      setComposerStep(1);
      if (initialNewAssignmentPayload.lessonTitle) {
        setExamTitle(`Bài tập củng cố: ${initialNewAssignmentPayload.lessonTitle}`);
      }
      if (initialNewAssignmentPayload.classId) {
        setTargetClassId(initialNewAssignmentPayload.classId);
      }
      if (
        (initialNewAssignmentPayload.vocabList && initialNewAssignmentPayload.vocabList.length > 0) ||
        (initialNewAssignmentPayload.grammarList && initialNewAssignmentPayload.grammarList.length > 0) ||
        (initialNewAssignmentPayload.culturalList && initialNewAssignmentPayload.culturalList.length > 0)
      ) {
        setIsAddQuestionChoiceOpen(true);
        setActiveFlow("FLOW_B");
      }
    }
  }, [initialNewAssignmentPayload]);

  // Step in composer: 1 = Chọn câu & Ghép đề, 2 = Thiết lập giao cho lớp
  const [composerStep, setComposerStep] = useState<1 | 2>(1);

  // Assignment settings (Step 2)
  const [targetClassId, setTargetClassId] = useState(
    initialNewAssignmentPayload?.classId || classesList[0]?.id || "c1"
  );
  const [openDate, setOpenDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [durationMin, setDurationMin] = useState(45);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [scorePolicy, setScorePolicy] = useState<"BEST" | "LATEST">("BEST");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [answerPolicy, setAnswerPolicy] = useState<"AFTER_SUBMIT" | "AFTER_DUE" | "NEVER">(
    "AFTER_DUE"
  );
  const [allowLateSubmission, setAllowLateSubmission] = useState(true);

  // =========================================================================
  // 3-FLOW QUESTION ADDITION MODAL STATE
  // =========================================================================
  const [isAddQuestionChoiceOpen, setIsAddQuestionChoiceOpen] = useState(false);
  const [activeFlow, setActiveFlow] = useState<"CHOICE" | "FLOW_A" | "FLOW_B" | "FLOW_C">("CHOICE");

  // FLOW A: Unified Bank Selector
  const [bankTab, setBankTab] = useState<"ALL" | "ADMIN" | "MINE">("ALL");
  const [bankTypeFilter, setBankTypeFilter] = useState<string>("ALL");
  const [bankSearch, setBankSearch] = useState("");
  const [previewQuestionModal, setPreviewQuestionModal] = useState<ExamQuestionItem | null>(null);

  // FLOW B: Manual Question Editor
  const [editorType, setEditorType] = useState<QuestionType>("multiple_choice");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorPinyin, setEditorPinyin] = useState("");
  const [editorPoints, setEditorPoints] = useState(5);
  const [editorDifficulty, setEditorDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [editorExplanation, setEditorExplanation] = useState("");
  const [editorRubric, setEditorRubric] = useState("");
  const [editorOptions, setEditorOptions] = useState<string[]>([
    "Phương án A",
    "Phương án B",
    "Phương án C",
    "Phương án D",
  ]);
  const [editorCorrectAnswer, setEditorCorrectAnswer] = useState("A");
  const [editorSampleAnswer, setEditorSampleAnswer] = useState("");

  // FLOW C: Guided Templates
  const [templatePreview, setTemplatePreview] = useState<ExamQuestionItem | null>(null);

  // =========================================================================
  // MANUAL GRADING (Chờ chấm) STATE
  // =========================================================================
  const [waitingSubmissions, setWaitingSubmissions] =
    useState<StudentSubmissionItem[]>(MOCK_WAITING_SUBMISSIONS);
  const [gradingSubmission, setGradingSubmission] = useState<StudentSubmissionItem | null>(null);
  const [gradingScores, setGradingScores] = useState<Record<string, number>>({});
  const [gradingComments, setGradingComments] = useState<Record<string, string>>({});
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  // Calculated totals
  const totalExamPoints = useMemo(() => {
    return draftQuestions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  }, [draftQuestions]);

  // Audio Speech synthesis
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Helper to reorder questions in draft exam
  const moveQuestion = (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= draftQuestions.length) return;
    const updated = [...draftQuestions];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setDraftQuestions(updated);
  };

  const removeQuestionFromDraft = (index: number) => {
    setDraftQuestions(draftQuestions.filter((_, idx) => idx !== index));
    showToast("Đã xóa câu hỏi khỏi đề");
  };

  // FLOW A: Add from Bank
  const handleAddQuestionFromBank = (q: ExamQuestionItem) => {
    const isAlreadyInDraft = draftQuestions.some((item) => item.id === q.id);
    if (isAlreadyInDraft) {
      showToast("Câu hỏi này đã có trong đề thi!");
      return;
    }
    setDraftQuestions([...draftQuestions, q]);
    showToast(`Đã thêm câu hỏi "${q.title}" vào đề thi!`);
  };

  // FLOW B: Save & Add to Draft
  const handleSaveManualQuestion = (addToDraft = true) => {
    if (!editorContent.trim()) {
      showToast("Vui lòng nhập nội dung câu hỏi!");
      return;
    }

    const newQuestion: ExamQuestionItem = {
      id: `mine-custom-${Date.now()}`,
      source: "MINE",
      sourceId: `teacher-${currentUser?.id || "custom"}`,
      type: editorType,
      title: editorTitle.trim() || `[Tự tạo] ${editorContent.slice(0, 30)}...`,
      content: editorContent.trim(),
      pinyin: editorPinyin.trim(),
      points: Number(editorPoints) || 5,
      difficulty: editorDifficulty,
      hskLevel: examLevel,
      curriculum: examCurriculum,
      explanation: editorExplanation.trim(),
      rubric: editorRubric.trim(),
      options: editorType === "multiple_choice" ? editorOptions : undefined,
      correctAnswer: editorCorrectAnswer,
      sampleAnswer: editorSampleAnswer.trim(),
    };

    if (addToDraft) {
      setDraftQuestions([...draftQuestions, newQuestion]);
      showToast("Đã lưu vào Kho của tôi và thêm vào đề thi thành công!");
    } else {
      showToast("Đã lưu câu hỏi vào Kho của tôi!");
    }

    // Reset flow
    setIsAddQuestionChoiceOpen(false);
    setActiveFlow("CHOICE");
  };

  // FLOW C: Load template into editor for customization
  const handleLoadTemplateIntoEditor = (tpl: ExamQuestionItem) => {
    setEditorType(tpl.type);
    setEditorTitle(`[Tùy chỉnh từ mẫu] ${tpl.title}`);
    setEditorContent(tpl.content);
    setEditorPinyin(tpl.pinyin || "");
    setEditorPoints(tpl.points);
    setEditorDifficulty(tpl.difficulty);
    setEditorExplanation(tpl.explanation || "");
    setEditorRubric(tpl.rubric || "");
    setEditorOptions(tpl.options || ["Phương án A", "Phương án B", "Phương án C", "Phương án D"]);
    setEditorCorrectAnswer(typeof tpl.correctAnswer === "string" ? tpl.correctAnswer : "A");
    setEditorSampleAnswer(tpl.sampleAnswer || "");

    // Switch to editor
    setActiveFlow("FLOW_B");
    showToast("Đã nạp bản sao mẫu vào trình soạn. Hãy tùy chỉnh nội dung và bấm Lưu!");
  };

  // Confirm Final Assignment Delivery
  const handleConfirmAssignmentPublish = async () => {
    if (draftQuestions.length === 0) {
      showToast("Đề thi chưa có câu hỏi nào. Vui lòng thêm câu hỏi!");
      return;
    }
    if (!targetClassId) {
      showToast("Vui lòng chọn lớp tiếp nhận bài tập!");
      return;
    }
    if (dueDate < openDate) {
      showToast("Hạn nộp bài phải sau hoặc bằng ngày mở bài!");
      return;
    }

    const selectedClass = classesList.find((c) => c.id === targetClassId);
    const newAss = {
      id: `ass-${Date.now()}`,
      title: examTitle.trim() || "Bài tập mới",
      className: selectedClass?.name || "Lớp học",
      classId: targetClassId,
      dueAt: `${dueDate} 23:59`,
      durationMin: Number(durationMin) || 45,
      submittedCount: 0,
      totalStudents: selectedClass?.studentCount || 20,
      status: "ACTIVE",
      waitingGradeCount: 0,
      totalQuestions: draftQuestions.length,
      totalPoints: totalExamPoints,
    };

    // Try posting to API
    try {
      await fetch("/api/v1/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAss.title,
          classId: targetClassId,
          dueAt: `${dueDate}T23:59:00.000Z`,
          durationMin: newAss.durationMin,
          mode: "EXAM",
        }),
      });
    } catch {
      // Fallback local persistence
    }

    setAssignments([newAss, ...assignments]);
    showToast(`Đã giao đề "${newAss.title}" thành công cho lớp ${newAss.className}!`);
    setViewMode("LIST");
    setComposerStep(1);
  };

  // Submit manual grading
  const handleCompleteGrading = (action: "SAVE_DRAFT" | "SUBMIT_GRADE" | "REQUEST_RESUBMIT") => {
    if (!gradingSubmission) return;

    if (action === "REQUEST_RESUBMIT") {
      showToast(`Đã gửi yêu cầu nộp lại bài cho học viên ${gradingSubmission.studentName}!`);
      setGradingSubmission(null);
      return;
    }

    // Calculate final score
    const manualTotal = Object.values(gradingScores).reduce((a, b) => a + (Number(b) || 0), 0);
    const finalScore = gradingSubmission.autoScore + manualTotal;

    showToast(
      action === "SUBMIT_GRADE"
        ? `Đã trả bài cho học viên ${gradingSubmission.studentName} với tổng điểm ${finalScore}đ!`
        : `Đã lưu nháp chấm điểm!`
    );

    // Remove from waiting list if published
    if (action === "SUBMIT_GRADE") {
      setWaitingSubmissions(waitingSubmissions.filter((s) => s.id !== gradingSubmission.id));
    }
    setGradingSubmission(null);
  };

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.className.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (activeTab === "ACTIVE") return a.status === "ACTIVE";
      if (activeTab === "WAITING_GRADE") return a.waitingGradeCount > 0;
      if (activeTab === "CLOSED") return a.status === "CLOSED";
      return true;
    });
  }, [assignments, activeTab, searchQuery]);

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] text-[#204434] pb-16 font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#204434] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-[#BC9B6B]/40 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#BC9B6B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-6">
        {/* =================================================================== */}
        {/* VIEW 1: ASSIGNMENTS LIST VIEW */}
        {/* =================================================================== */}
        {viewMode === "LIST" && (
          <div className="space-y-6">
            {/* Header with Stats & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5DEC9] pb-4">
              <div className="flex items-center gap-3">
                {onBackToDashboard && (
                  <button
                    onClick={onBackToDashboard}
                    className="p-2 rounded-xl border border-[#E5DEC9] bg-[#FFFCF6] hover:bg-[#F3EEDD] text-[#204434] transition flex items-center gap-1 text-xs font-semibold shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay lại</span>
                  </button>
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#204434] flex items-center gap-2">
                    <span>Bài tập & Kiểm tra</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] font-sans font-semibold border border-[#204434]/20">
                      Chuẩn v2.0
                    </span>
                  </h1>
                  <p className="text-xs text-[#315E48]">
                    Giao đề, thu bài, tự động chấm và chấm tay 12 dạng bài tập
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setViewMode("COMPOSER");
                    setComposerStep(1);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4 text-[#BC9B6B]" />
                  <span>+ Tạo đề thi / Bài tập mới</span>
                </button>
              </div>
            </div>

            {/* Metrics Row (Spec Section 3.1) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] space-y-1 shadow-2xs">
                <span className="text-[11px] text-[#315E48] font-medium">Tổng số đề bài</span>
                <p className="text-2xl font-serif font-bold text-[#204434]">{assignments.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] space-y-1 shadow-2xs">
                <span className="text-[11px] text-[#315E48] font-medium">Đang mở cho học viên</span>
                <p className="text-2xl font-serif font-bold text-emerald-700">
                  {assignments.filter((a) => a.status === "ACTIVE").length}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/60 space-y-1 shadow-2xs bg-gradient-to-br from-[#FFFCF6] to-[#FBF7EE]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#8F6D3B] font-bold">Chờ chấm thủ công</span>
                  <span className="w-2 h-2 rounded-full bg-[#BC9B6B] animate-pulse" />
                </div>
                <p className="text-2xl font-serif font-bold text-[#8F6D3B]">
                  {waitingSubmissions.length} bài
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] space-y-1 shadow-2xs">
                <span className="text-[11px] text-[#315E48] font-medium">Đã đóng hạn nộp</span>
                <p className="text-2xl font-serif font-bold text-gray-600">
                  {assignments.filter((a) => a.status === "CLOSED").length}
                </p>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "ALL", label: "Tất cả đề" },
                  { id: "ACTIVE", label: "Đang mở" },
                  {
                    id: "WAITING_GRADE",
                    label: `Chờ chấm (${waitingSubmissions.length})`,
                    highlight: waitingSubmissions.length > 0,
                  },
                  { id: "CLOSED", label: "Đã đóng" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      activeTab === t.id
                        ? "bg-[#204434] text-white shadow-xs"
                        : t.highlight
                        ? "bg-[#BC9B6B]/20 text-[#8F6D3B] border border-[#BC9B6B]/40 hover:bg-[#BC9B6B]/30"
                        : "bg-[#FFFCF6] text-[#204434] border border-[#E5DEC9] hover:bg-[#F3EEDD]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#315E48]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên đề hoặc lớp..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FFFCF6] border border-[#E5DEC9] text-xs text-[#204434] placeholder-[#315E48]/60 focus:outline-none focus:ring-1 focus:ring-[#204434] shadow-2xs"
                />
              </div>
            </div>

            {/* If tab is WAITING_GRADE, show submissions queue directly */}
            {activeTab === "WAITING_GRADE" ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-[#8F6D3B]" />
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#204434]">
                        Danh sách bài nộp cần giáo viên chấm điểm
                      </h4>
                      <p className="text-xs text-[#315E48]">
                        Bao gồm các dạng: Tự luận, Dịch câu, Tìm lỗi sai, Chép từ nộp ảnh
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {waitingSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-xs space-y-3.5 hover:border-[#BC9B6B] transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={sub.studentAvatar}
                            alt={sub.studentName}
                            className="w-10 h-10 rounded-full object-cover border border-[#E5DEC9]"
                          />
                          <div>
                            <h4 className="font-serif font-bold text-sm text-[#204434]">
                              {sub.studentName}
                            </h4>
                            <p className="text-xs text-[#315E48]">{sub.className}</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Chờ chấm {sub.manualQuestions.length} câu
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1 text-xs">
                        <p className="font-semibold text-[#204434]">{sub.assignmentTitle}</p>
                        <div className="flex items-center justify-between text-[11px] text-[#315E48]">
                          <span>Nộp lúc: {sub.submittedAt}</span>
                          <span className="font-bold text-emerald-800">
                            Điểm tự động: {sub.autoScore}đ
                          </span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setGradingSubmission(sub);
                            setGradingScores({});
                            setGradingComments({});
                          }}
                          className="w-full py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#BC9B6B]" />
                          <span>Chấm bài cho học viên ngay</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Assignments Table */
              <div className="rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5DEC9] bg-[#FAF7F0] text-[#315E48] font-bold text-[11px]">
                      <th className="py-3 px-4">Tên đề bài / Bài tập</th>
                      <th className="py-3 px-4">Lớp nhận</th>
                      <th className="py-3 px-4">Cấu trúc đề</th>
                      <th className="py-3 px-4">Đã nộp / Tổng số</th>
                      <th className="py-3 px-4">Hạn nộp</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DEC9]/50">
                    {filteredAssignments.map((a) => (
                      <tr key={a.id} className="hover:bg-[#FAF7F0]/60 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#204434] text-xs">{a.title}</p>
                          <span className="text-[10px] text-[#8F6D3B]">Thời lượng: {a.durationMin} phút</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#315E48]">{a.className}</td>
                        <td className="py-3.5 px-4 text-[#315E48]">
                          <span className="font-bold text-[#204434]">{a.totalQuestions} câu</span> ·{" "}
                          <span>{a.totalPoints}đ</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#204434]">
                              {a.submittedCount}/{a.totalStudents}
                            </span>
                            <span className="text-[10px] text-[#315E48]">
                              ({Math.round((a.submittedCount / (a.totalStudents || 1)) * 100)}%)
                            </span>
                          </div>
                          {a.waitingGradeCount > 0 && (
                            <span className="text-[10px] text-amber-700 font-bold block">
                              • Chờ chấm: {a.waitingGradeCount} bài
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#315E48] font-mono">{a.dueAt}</td>
                        <td className="py-3.5 px-4">
                          {a.status === "ACTIVE" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Đang mở
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                              Đã đóng
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {a.waitingGradeCount > 0 && (
                            <button
                              onClick={() => {
                                setActiveTab("WAITING_GRADE");
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-[#BC9B6B]/20 text-[#8F6D3B] font-bold text-xs hover:bg-[#BC9B6B]/30 transition border border-[#BC9B6B]/40"
                            >
                              Chấm bài
                            </button>
                          )}
                          <button
                            onClick={() =>
                              showToast(`Đang tải báo cáo phổ điểm cho: ${a.title}`)
                            }
                            className="px-3 py-1.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-xs shadow-2xs transition"
                          >
                            Xem kết quả
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 2: EXAM COMPOSER (TRÌNH SOẠN ĐỀ & GHÉP ĐỀ THEO ĐẶC TẢ V2.0) */}
        {/* =================================================================== */}
        {viewMode === "COMPOSER" && (
          <div className="space-y-6">
            {/* Top Breadcrumb & Step Indicators */}
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-4">
              <button
                onClick={() => setViewMode("LIST")}
                className="p-2 rounded-xl border border-[#E5DEC9] bg-[#FFFCF6] hover:bg-[#F3EEDD] text-[#204434] transition flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay lại danh sách</span>
              </button>

              <div className="flex items-center gap-3 text-xs">
                <button
                  onClick={() => setComposerStep(1)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition ${
                    composerStep === 1
                      ? "bg-[#204434] text-white shadow-xs"
                      : "bg-[#FFFCF6] text-[#315E48] border border-[#E5DEC9]"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Ghép đề câu hỏi</span>
                </button>
                <span>→</span>
                <button
                  onClick={() => {
                    if (draftQuestions.length === 0) {
                      showToast("Vui lòng thêm ít nhất 1 câu hỏi vào đề!");
                      return;
                    }
                    setComposerStep(2);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition ${
                    composerStep === 2
                      ? "bg-[#204434] text-white shadow-xs"
                      : "bg-[#FFFCF6] text-[#315E48] border border-[#E5DEC9]"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Thiết lập giao cho lớp</span>
                </button>
              </div>
            </div>

            {/* STEP 1: GHÉP ĐỀ VÀ THÊM CÂU HỎI */}
            {composerStep === 1 && (
              <div className="space-y-6">
                {/* Exam Title & Overview Box */}
                <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-xs space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-[#204434] block">
                        Tên đề thi / Bài tập:
                      </label>
                      <input
                        type="text"
                        value={examTitle}
                        onChange={(e) => setExamTitle(e.target.value)}
                        placeholder="Nhập tiêu đề đề kiểm tra..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5DEC9] text-sm font-serif font-bold text-[#204434] focus:outline-none focus:ring-1 focus:ring-[#204434]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#204434] block">
                        Chương trình đào tạo:
                      </label>
                      <select
                        value={examCurriculum}
                        onChange={(e) => setExamCurriculum(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E5DEC9] text-xs text-[#204434] focus:outline-none focus:ring-1 focus:ring-[#204434]"
                      >
                        <option value="HSK 3.0">HSK 3.0 Tiêu chuẩn</option>
                        <option value="Theo chủ đề">Giao tiếp theo chủ đề</option>
                        <option value="Đại học & Ngành">Đại học & Kinh tế</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary Counters Bar */}
                  <div className="pt-2 border-t border-[#E5DEC9]/70 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-3 py-1 rounded-full bg-[#204434] text-white font-bold">
                        {draftQuestions.length} câu hỏi
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-bold border border-[#BC9B6B]/30">
                        Tổng cộng: {totalExamPoints} điểm
                      </span>
                    </div>

                    {/* PRIMARY ACTION: + THÊM CÂU HỎI (Replaced old "Thêm câu mẫu") */}
                    <button
                      onClick={() => {
                        setActiveFlow("CHOICE");
                        setIsAddQuestionChoiceOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition"
                    >
                      <Plus className="w-4 h-4 text-[#BC9B6B]" />
                      <span>+ Thêm câu hỏi (3 luồng)</span>
                    </button>
                  </div>
                </div>

                {/* List of Questions in Draft Exam */}
                <div className="space-y-3">
                  <h3 className="text-sm font-serif font-bold text-[#204434] flex items-center justify-between">
                    <span>Danh sách câu hỏi trong đề ({draftQuestions.length})</span>
                    <span className="text-xs font-normal text-[#315E48]">
                      Có thể đổi thứ tự, điểm số hoặc xóa câu hỏi
                    </span>
                  </h3>

                  {draftQuestions.length === 0 ? (
                    <div className="p-12 rounded-3xl border border-dashed border-[#E5DEC9] bg-[#FFFCF6] text-center space-y-3">
                      <BookOpen className="w-10 h-10 mx-auto text-[#BC9B6B]" />
                      <p className="font-serif font-bold text-sm text-[#204434]">
                        Chưa có câu hỏi nào trong đề thi
                      </p>
                      <p className="text-xs text-[#315E48] max-w-md mx-auto">
                        Hãy nhấn nút <strong>"+ Thêm câu hỏi"</strong> để chọn từ kho, tự soạn hoặc dùng
                        câu mẫu hướng dẫn.
                      </p>
                      <button
                        onClick={() => {
                          setActiveFlow("CHOICE");
                          setIsAddQuestionChoiceOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Thêm câu hỏi ngay</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {draftQuestions.map((q, idx) => (
                        <div
                          key={`${q.id}-${idx}`}
                          className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-3 hover:border-[#BC9B6B] transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-[#204434] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]">
                                    {
                                      OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === q.type)?.name ||
                                      q.type
                                    }
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#BC9B6B]/20 text-[#8F6D3B]">
                                    {q.source === "ADMIN"
                                      ? "Nguồn: Admin"
                                      : q.source === "TEMPLATE"
                                      ? "Từ câu mẫu"
                                      : "Kho của tôi"}
                                  </span>
                                  <span className="text-[10px] text-[#315E48]">
                                    Độ khó: {q.difficulty}
                                  </span>
                                </div>
                                <h4 className="font-serif font-bold text-sm text-[#204434] mt-1.5">
                                  {q.content}
                                </h4>
                                {q.pinyin && (
                                  <p className="text-xs text-[#8F6D3B] mt-0.5">{q.pinyin}</p>
                                )}
                              </div>
                            </div>

                            {/* Question Points & Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center gap-1 bg-white border border-[#E5DEC9] rounded-xl px-2.5 py-1">
                                <span className="text-[11px] text-[#315E48]">Điểm:</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={q.points}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...draftQuestions];
                                    updated[idx].points = val;
                                    setDraftQuestions(updated);
                                  }}
                                  className="w-10 text-center font-bold text-xs text-[#204434] focus:outline-none"
                                />
                              </div>

                              <button
                                onClick={() => moveQuestion(idx, "UP")}
                                disabled={idx === 0}
                                className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white text-[#204434] hover:bg-[#F3EEDD] disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Di chuyển lên"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveQuestion(idx, "DOWN")}
                                disabled={idx === draftQuestions.length - 1}
                                className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white text-[#204434] hover:bg-[#F3EEDD] disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Di chuyển xuống"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => removeQuestionFromDraft(idx)}
                                className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                                title="Xóa khỏi đề"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Options or Answer preview (Teacher View) */}
                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                              {q.options.map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`p-2 rounded-xl border flex items-center gap-2 ${
                                    String.fromCharCode(65 + oIdx) === q.correctAnswer
                                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                                      : "bg-white border-[#E5DEC9] text-[#315E48]"
                                  }`}
                                >
                                  <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {q.explanation && (
                            <div className="bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E5DEC9]/70 text-[11px] text-[#315E48]">
                              <strong>Giải thích / Lời giải:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Step 1 Action */}
                <div className="pt-4 border-t border-[#E5DEC9] flex items-center justify-between">
                  <span className="text-xs text-[#315E48]">
                    Tổng cộng: <strong>{draftQuestions.length} câu</strong> · <strong>{totalExamPoints} điểm</strong>
                  </span>
                  <button
                    onClick={() => {
                      if (draftQuestions.length === 0) {
                        showToast("Vui lòng thêm ít nhất 1 câu hỏi vào đề!");
                        return;
                      }
                      setComposerStep(2);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-2"
                  >
                    <span>Tiếp tục: Thiết lập giao cho lớp</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: THIẾT LẬP GIAO BÀI CHO LỚP (SPEC SECTION 9) */}
            {composerStep === 2 && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-xs space-y-5">
                  <div className="border-b border-[#E5DEC9] pb-3">
                    <h3 className="font-serif font-bold text-lg text-[#204434]">
                      Thiết lập giao đề cho lớp học
                    </h3>
                    <p className="text-xs text-[#315E48]">
                      Cấu hình lịch mở bài, thời lượng, số lượt làm và chính sách đáp án
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Class Selection */}
                    <div>
                      <label className="font-bold text-[#204434] block mb-1">
                        Lớp học tiếp nhận: <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={targetClassId}
                        onChange={(e) => setTargetClassId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] focus:ring-1 focus:ring-[#204434]"
                      >
                        {classesList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.code ? `(${c.code})` : ""} · {c.studentCount || 0} học viên
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Timeline: Open Date & Due Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="font-bold text-[#204434] block mb-1">Ngày mở bài:</label>
                        <input
                          type="date"
                          value={openDate}
                          onChange={(e) => setOpenDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#204434] block mb-1">
                          Hạn nộp bài (≥ ngày mở): <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                        />
                      </div>
                    </div>

                    {/* Duration & Attempts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="font-bold text-[#204434] block mb-1">
                          Thời lượng làm bài (phút):
                        </label>
                        <input
                          type="number"
                          min={5}
                          max={180}
                          value={durationMin}
                          onChange={(e) => setDurationMin(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#204434] block mb-1">
                          Số lượt làm bài tối đa:
                        </label>
                        <select
                          value={maxAttempts}
                          onChange={(e) => setMaxAttempts(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                        >
                          <option value={1}>1 lượt duy nhất</option>
                          <option value={2}>2 lượt làm</option>
                          <option value={3}>3 lượt làm</option>
                          <option value={99}>Không giới hạn (Luyện tập)</option>
                        </select>
                      </div>
                    </div>

                    {/* Scoring & Answers policy */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="font-bold text-[#204434] block mb-1">
                          Quy tắc tính điểm:
                        </label>
                        <select
                          value={scorePolicy}
                          onChange={(e) => setScorePolicy(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                        >
                          <option value="BEST">Lấy điểm cao nhất trong các lượt</option>
                          <option value="LATEST">Lấy điểm của lượt nộp cuối cùng</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-[#204434] block mb-1">
                          Thời điểm công bố đáp án:
                        </label>
                        <select
                          value={answerPolicy}
                          onChange={(e) => setAnswerPolicy(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                        >
                          <option value="AFTER_DUE">Chỉ hiện sau khi hết hạn nộp đề</option>
                          <option value="AFTER_SUBMIT">Hiện ngay sau khi nộp bài</option>
                          <option value="NEVER">Không công bố đáp án chi tiết</option>
                        </select>
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="pt-2 border-t border-[#E5DEC9] space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-[#204434]">
                        <input
                          type="checkbox"
                          checked={shuffleQuestions}
                          onChange={(e) => setShuffleQuestions(e.target.checked)}
                          className="rounded text-[#204434] focus:ring-[#204434]"
                        />
                        <span>Xáo trộn thứ tự các câu hỏi cho từng học viên</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-[#204434]">
                        <input
                          type="checkbox"
                          checked={allowLateSubmission}
                          onChange={(e) => setAllowLateSubmission(e.target.checked)}
                          className="rounded text-[#204434] focus:ring-[#204434]"
                        />
                        <span>Cho phép nộp muộn (đánh dấu trễ hạn để giáo viên xem xét)</span>
                      </label>
                    </div>

                    {/* Final Summary Card */}
                    <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-2 text-xs">
                      <h4 className="font-serif font-bold text-[#204434]">Tổng kết trước khi giao:</h4>
                      <p className="text-[#315E48]">
                        Đề bài: <strong>{examTitle}</strong>
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8F6D3B]">
                        <span>Số lượng câu: {draftQuestions.length} câu</span>
                        <span>Tổng điểm: {totalExamPoints} điểm</span>
                        <span>Thời lượng: {durationMin} phút</span>
                        <span>Hạn nộp: {dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E5DEC9] flex items-center justify-between">
                    <button
                      onClick={() => setComposerStep(1)}
                      className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-[#315E48] font-semibold text-xs hover:bg-[#FAF7F0]"
                    >
                      ← Quay lại sửa câu hỏi
                    </button>
                    <button
                      onClick={handleConfirmAssignmentPublish}
                      className="px-6 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-2"
                    >
                      <Send className="w-4 h-4 text-[#BC9B6B]" />
                      <span>Xác nhận giao đề cho lớp</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL: 3-FLOW QUESTION ADDITION SELECTOR (SPEC SECTION 3.2) */}
        {/* =================================================================== */}
        {isAddQuestionChoiceOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
              {/* Modal Top */}
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#204434] text-[#BC9B6B]">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#204434]">
                      {activeFlow === "CHOICE" && "Thêm câu hỏi vào đề kiểm tra"}
                      {activeFlow === "FLOW_A" && "Luồng A: Chọn câu hỏi từ Kho câu hỏi"}
                      {activeFlow === "FLOW_B" && "Luồng B: Trình soạn câu hỏi mới"}
                      {activeFlow === "FLOW_C" && "Luồng C: Xem câu mẫu hướng dẫn & tùy chỉnh"}
                    </h3>
                    <p className="text-xs text-[#315E48]">
                      Theo quy chuẩn 3 luồng và 12 dạng bài tập chính thức
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeFlow !== "CHOICE" && (
                    <button
                      onClick={() => setActiveFlow("CHOICE")}
                      className="px-2.5 py-1 rounded-lg border border-[#E5DEC9] text-xs font-semibold text-[#204434] hover:bg-[#FAF7F0]"
                    >
                      ← Đổi luồng khác
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsAddQuestionChoiceOpen(false);
                      setActiveFlow("CHOICE");
                    }}
                    className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#F3EEDD] text-[#315E48]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* CHOICE SCREEN: 3 BIG CARDS */}
              {/* ------------------------------------------------------------- */}
              {activeFlow === "CHOICE" && (
                <div className="space-y-4 py-2">
                  <p className="text-xs text-[#315E48]">
                    Vui lòng chọn 1 trong 3 phương thức thêm câu hỏi dưới đây:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Choice 1: Chọn từ kho */}
                    <div
                      onClick={() => setActiveFlow("FLOW_A")}
                      className="p-5 rounded-3xl bg-white border border-[#E5DEC9] hover:border-[#204434] shadow-xs cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md transition group"
                    >
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#204434] text-white flex items-center justify-center font-bold text-sm shadow-2xs group-hover:scale-105 transition">
                          A
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#204434]">
                          Chọn từ Kho câu hỏi
                        </h4>
                        <p className="text-xs text-[#315E48] leading-relaxed">
                          Duyệt kho hợp nhất gồm câu hỏi của Admin và câu hỏi cá nhân của tôi. Tìm
                          kiếm, lọc theo 12 dạng và thêm ngay vào đề.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-[#E5DEC9]/60">
                        <span className="text-xs font-bold text-[#204434] group-hover:underline flex items-center gap-1">
                          Mở kho câu hỏi <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Choice 2: Tự tạo câu hỏi mới */}
                    <div
                      onClick={() => setActiveFlow("FLOW_B")}
                      className="p-5 rounded-3xl bg-white border border-[#E5DEC9] hover:border-[#204434] shadow-xs cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md transition group"
                    >
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#BC9B6B] text-white flex items-center justify-center font-bold text-sm shadow-2xs group-hover:scale-105 transition">
                          B
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#204434]">
                          Tự tạo câu hỏi mới
                        </h4>
                        <p className="text-xs text-[#315E48] leading-relaxed">
                          Trình soạn câu hỏi linh hoạt chuyển form theo 12 dạng bài tập. Cho phép lưu
                          vào kho cá nhân và thêm trực tiếp vào đề.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-[#E5DEC9]/60">
                        <span className="text-xs font-bold text-[#204434] group-hover:underline flex items-center gap-1">
                          Mở trình soạn <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Choice 3: Xem câu mẫu hướng dẫn */}
                    <div
                      onClick={() => setActiveFlow("FLOW_C")}
                      className="p-5 rounded-3xl bg-white border border-[#E5DEC9] hover:border-[#204434] shadow-xs cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md transition group"
                    >
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs group-hover:scale-105 transition">
                          C
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#204434]">
                          Câu mẫu hướng dẫn
                        </h4>
                        <p className="text-xs text-[#315E48] leading-relaxed">
                          12 mẫu câu chuẩn mực kèm mô tả quy tắc chấm. Bấm "Dùng mẫu để chỉnh sửa"
                          để nạp vào form và tùy biến mà không ghi đè câu mẫu.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-[#E5DEC9]/60">
                        <span className="text-xs font-bold text-[#204434] group-hover:underline flex items-center gap-1">
                          Xem 12 mẫu hướng dẫn <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* LUỒNG A: CHỌN TỪ KHO CÂU HỎI (HỢP NHẤT ADMIN + CÁ NHÂN) */}
              {/* ------------------------------------------------------------- */}
              {activeFlow === "FLOW_A" && (
                <div className="space-y-4">
                  {/* Filters Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F0] p-3 rounded-2xl border border-[#E5DEC9]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBankTab("ALL")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                          bankTab === "ALL"
                            ? "bg-[#204434] text-white"
                            : "bg-white text-[#204434] border border-[#E5DEC9]"
                        }`}
                      >
                        Tất cả nguồn
                      </button>
                      <button
                        onClick={() => setBankTab("ADMIN")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                          bankTab === "ADMIN"
                            ? "bg-[#204434] text-white"
                            : "bg-white text-[#204434] border border-[#E5DEC9]"
                        }`}
                      >
                        Kho Admin (Chuẩn)
                      </button>
                      <button
                        onClick={() => setBankTab("MINE")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                          bankTab === "MINE"
                            ? "bg-[#204434] text-white"
                            : "bg-white text-[#204434] border border-[#E5DEC9]"
                        }`}
                      >
                        Kho của tôi
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={bankTypeFilter}
                        onChange={(e) => setBankTypeFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-xs text-[#204434]"
                      >
                        <option value="ALL">Tất cả 12 dạng</option>
                        {OFFICIAL_12_QUESTION_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.number}. {t.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        placeholder="Tìm chữ Hán, từ khóa..."
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-xs text-[#204434] w-48"
                      />
                    </div>
                  </div>

                  {/* List of Questions in Bank */}
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {UNIFIED_QUESTION_BANK.filter((q) => {
                      if (bankTab === "ADMIN" && q.source !== "ADMIN") return false;
                      if (bankTab === "MINE" && q.source !== "MINE") return false;
                      if (bankTypeFilter !== "ALL" && q.type !== bankTypeFilter) return false;
                      if (
                        bankSearch &&
                        !q.content.toLowerCase().includes(bankSearch.toLowerCase()) &&
                        !q.title.toLowerCase().includes(bankSearch.toLowerCase())
                      ) {
                        return false;
                      }
                      return true;
                    }).map((q) => {
                      const isAdded = draftQuestions.some((item) => item.id === q.id);
                      return (
                        <div
                          key={q.id}
                          className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] flex items-center justify-between gap-4 hover:border-[#BC9B6B] transition shadow-2xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  q.source === "ADMIN"
                                    ? "bg-[#204434] text-white"
                                    : "bg-[#BC9B6B] text-white"
                                }`}
                              >
                                {q.source === "ADMIN" ? "Admin" : "Cá nhân"}
                              </span>
                              <span className="text-[10px] text-[#315E48] font-bold">
                                {
                                  OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === q.type)?.name ||
                                  q.type
                                }
                              </span>
                              <span className="text-[10px] text-[#8F6D3B]">· {q.points} điểm</span>
                            </div>
                            <h4 className="font-serif font-bold text-sm text-[#204434]">
                              {q.content}
                            </h4>
                            {q.pinyin && <p className="text-xs text-[#8F6D3B]">{q.pinyin}</p>}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setPreviewQuestionModal(q)}
                              className="px-3 py-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-xs font-semibold text-[#204434] flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem trước</span>
                            </button>
                            <button
                              onClick={() => handleAddQuestionFromBank(q)}
                              disabled={isAdded}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                                isAdded
                                  ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
                                  : "bg-[#204434] hover:bg-[#183629] text-white shadow-2xs"
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Đã thêm</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5 text-[#BC9B6B]" />
                                  <span>Thêm vào đề</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* LUỒNG B: TRÌNH SOẠN CÂU HỎI MỚI (12 DẠNG BIỂU MẪU) */}
              {/* ------------------------------------------------------------- */}
              {activeFlow === "FLOW_B" && (
                <div className="space-y-4 text-xs">
                  {/* KHU VỰC A: NỘI DUNG NGUỒN ĐÃ CHỌN (NẾU ĐƯỢC CHUYỂN TỪ KHO BÀI HỌC) */}
                  {initialNewAssignmentPayload?.vocabList && initialNewAssignmentPayload.vocabList.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#204434] flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#8F6D3B]" />
                          <span>Khu vực A: Nội dung nguồn đã chọn từ bài học:</span>
                        </span>
                        <span className="text-[10px] text-[#8F6D3B] italic">
                          Bấm vào từ vựng/ngữ pháp bên dưới để điền nhanh vào form
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {initialNewAssignmentPayload.vocabList.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              if (editorType === "multiple_choice") {
                                setEditorContent(`“${v.hanzi}” (${v.pinyin}) có nghĩa là gì?`);
                                setEditorPinyin(v.pinyin);
                                setEditorOptions(["Nấu ăn", v.meaningVi, "Đi làm", "Ngày mai"]);
                                setEditorCorrectAnswer("B");
                                setEditorExplanation(`“${v.hanzi}” có nghĩa là “${v.meaningVi}”.`);
                              } else if (editorType === "matching") {
                                setEditorContent("Nối từ tiếng Trung với nghĩa tiếng Việt tương ứng:");
                                setEditorSampleAnswer(`${v.hanzi} ↔ ${v.meaningVi}`);
                              } else if (editorType === "flashcard") {
                                setEditorContent(v.hanzi);
                                setEditorPinyin(v.pinyin);
                                setEditorSampleAnswer(`${v.pinyin} – ${v.meaningVi}`);
                              } else if (editorType === "fill_blank") {
                                setEditorContent(`他身体不舒服，所以今天在宿舍______。(Anh ấy trong người không khỏe, nên hôm nay ở ký túc xá nghỉ ngơi).`);
                                setEditorCorrectAnswer(v.hanzi);
                              } else if (editorType === "handwriting_photo") {
                                setEditorContent(`Hãy chép từ sau 5 lần vào vở: ${v.hanzi}`);
                                setEditorRubric("Đủ 5 lần (4đ), đúng quy tắc bút thuận (3đ), chữ ngay ngắn (3đ).");
                              } else if (editorType === "translation") {
                                setEditorContent(`Dịch câu sau sang tiếng Việt: 我今天${v.hanzi}。`);
                                setEditorSampleAnswer(`Hôm nay tôi ${v.meaningVi.toLowerCase()}.`);
                              } else {
                                setEditorContent(v.hanzi);
                                setEditorPinyin(v.pinyin);
                                setEditorSampleAnswer(v.meaningVi);
                              }
                              showToast(`Đã điền từ vựng "${v.hanzi}" vào form!`);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] hover:border-[#204434] text-[#204434] font-medium text-xs shadow-2xs hover:bg-[#F3EEDD] transition flex items-center gap-1.5"
                          >
                            <span className="font-serif font-bold">{v.hanzi}</span>
                            <span className="text-[10px] text-[#8F6D3B]">({v.pinyin})</span>
                            <span className="text-[10px] text-[#315E48]">: {v.meaningVi}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NỘI DUNG VĂN HÓA GIAO TIẾP ĐÃ CHUYỂN TỪ BÀI HỌC */}
                  {initialNewAssignmentPayload?.culturalList && initialNewAssignmentPayload.culturalList.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FAF7F0] to-[#F5EEDB] border border-[#BC9B6B]/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#8F6D3B] flex items-center gap-1.5">
                          <span>🏮</span>
                          <span>Nội dung Văn hóa giao tiếp đã chuyển ({initialNewAssignmentPayload.culturalList.length} mục):</span>
                        </span>
                        <span className="text-[10px] text-[#8F6D3B] italic">
                          Bấm vào mục văn hóa để điền nhanh câu hỏi thực tế vào form
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {initialNewAssignmentPayload.culturalList.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (item.zh) {
                                setEditorContent(`Chọn bối cảnh sử dụng hoặc giải nghĩa chính xác của: “${item.zh}” (${item.py || ""})`);
                                setEditorPinyin(item.py || "");
                                setEditorOptions([
                                  item.vi || "Cách diễn đạt khuyên dùng",
                                  "Cách nói thô lỗ, cấm kỵ",
                                  "Nói chuyện phiếm hàng ngày",
                                  "Từ chối thẳng thừng",
                                ]);
                                setEditorCorrectAnswer("A");
                                setEditorExplanation(`“${item.zh}” mang ý nghĩa: ${item.vi || ""}. ${item.note ? `Lưu ý: ${item.note}` : ""}`);
                              } else {
                                setEditorContent(`Câu hỏi tình huống văn hóa: ${item.content || ""}`);
                                setEditorExplanation(item.content || "");
                              }
                              showToast(`Đã điền nội dung văn hóa vào biểu mẫu câu hỏi!`);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-white border border-[#BC9B6B]/50 hover:border-[#204434] text-[#204434] font-medium text-xs shadow-2xs hover:bg-[#F3EEDD] transition flex items-center gap-1.5"
                          >
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#BC9B6B]/20 text-[#8F6D3B] font-bold">
                              {item.categoryLabel}
                            </span>
                            {item.zh ? (
                              <>
                                <span className="font-serif font-bold text-[#204434]">{item.zh}</span>
                                <span className="text-[10px] text-[#8F6D3B]">({item.py})</span>
                              </>
                            ) : (
                              <span className="truncate max-w-[200px] text-[11px] text-[#315E48]">{item.content}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* KHU VỰC B: FORM SOẠN THẢO 12 DẠNG BÀI TẬP */}
                  <div className="bg-[#FAF7F0] p-3.5 rounded-2xl border border-[#E5DEC9] space-y-2">
                    <label className="font-bold text-[#204434] block">
                      Khu vực B: Chọn 1 trong 12 dạng bài tập: <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editorType}
                      onChange={(e) => setEditorType(e.target.value as QuestionType)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs font-bold text-[#204434]"
                    >
                      {OFFICIAL_12_QUESTION_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.number}. {t.name} ({t.category === "AUTO" ? "Tự chấm" : "Chấm tay"})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-[#315E48]">
                      {OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === editorType)?.desc}
                    </p>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-7 space-y-3">
                      <div>
                        <label className="font-bold text-[#204434] block mb-1">
                          Tiêu đề / Ghi chú câu hỏi:
                        </label>
                        <input
                          type="text"
                          value={editorTitle}
                          onChange={(e) => setEditorTitle(e.target.value)}
                          placeholder="Ví dụ: Phân biệt từ vựng Bài 5..."
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#204434] block mb-1">
                          Đề bài câu hỏi (Chữ Hán / Tiếng Việt): <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={editorContent}
                          onChange={(e) => setEditorContent(e.target.value)}
                          rows={3}
                          placeholder="Nhập nội dung câu hỏi..."
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-[#204434] block mb-1">Gợi ý Pinyin:</label>
                          <input
                            type="text"
                            value={editorPinyin}
                            onChange={(e) => setEditorPinyin(e.target.value)}
                            placeholder="Ví dụ: Jīntiān wǒ xiūxi..."
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-[#204434] block mb-1">Điểm tối đa:</label>
                          <input
                            type="number"
                            min={0}
                            value={editorPoints}
                            onChange={(e) => setEditorPoints(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                          />
                        </div>
                      </div>

                      {/* Dynamic type fields */}
                      {editorType === "multiple_choice" && (
                        <div className="space-y-2 bg-[#FAF7F0] p-3 rounded-2xl border border-[#E5DEC9]">
                          <label className="font-bold text-[#204434] block">
                            Các phương án trắc nghiệm:
                          </label>
                          {editorOptions.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="mcq_correct"
                                checked={editorCorrectAnswer === String.fromCharCode(65 + oIdx)}
                                onChange={() =>
                                  setEditorCorrectAnswer(String.fromCharCode(65 + oIdx))
                                }
                                className="text-[#204434] focus:ring-[#204434]"
                              />
                              <span className="font-bold text-[#204434] w-4">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const next = [...editorOptions];
                                  next[oIdx] = e.target.value;
                                  setEditorOptions(next);
                                }}
                                className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {editorType === "fill_blank" && (
                        <div className="space-y-2 bg-[#FAF7F0] p-3 rounded-2xl border border-[#E5DEC9]">
                          <label className="font-bold text-[#204434] block">
                            Từ hoặc Pinyin cần điền vào chỗ trống:
                          </label>
                          <input
                            type="text"
                            value={typeof editorCorrectAnswer === "string" ? editorCorrectAnswer : ""}
                            onChange={(e) => setEditorCorrectAnswer(e.target.value)}
                            placeholder="Ví dụ: 休息 hoặc xiuxi"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-bold"
                          />
                        </div>
                      )}

                      {(editorType === "essay" ||
                        editorType === "translation" ||
                        editorType === "find_error" ||
                        editorType === "handwriting_photo") && (
                        <div className="space-y-2 bg-[#FAF7F0] p-3 rounded-2xl border border-[#E5DEC9]">
                          <label className="font-bold text-[#204434] block">
                            Đáp án tham khảo / Rubric chấm tay của giáo viên:
                          </label>
                          <textarea
                            value={editorSampleAnswer}
                            onChange={(e) => setEditorSampleAnswer(e.target.value)}
                            rows={2}
                            placeholder="Nhập câu mẫu hoặc tiêu chí cho điểm..."
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                          />
                        </div>
                      )}

                      <div>
                        <label className="font-bold text-[#204434] block mb-1">
                          Lời giải / Giải thích chi tiết:
                        </label>
                        <textarea
                          value={editorExplanation}
                          onChange={(e) => setEditorExplanation(e.target.value)}
                          rows={2}
                          placeholder="Giải thích vì sao chọn đáp án này..."
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                        />
                      </div>
                    </div>

                    {/* KHU VỰC C: XEM TRƯỚC HỌC VIÊN TƯƠNG TÁC TRỰC TIẾP */}
                    <div className="md:col-span-5 bg-white p-4 rounded-2xl border border-[#E5DEC9] space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2">
                        <span className="font-bold text-[#204434] flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-[#BC9B6B]" />
                          <span>Khu vực C: Xem trước học viên</span>
                        </span>
                        <span className="text-[10px] text-[#8F6D3B] font-bold">
                          {editorPoints} điểm
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#204434]/10 text-[#204434]">
                          {OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === editorType)?.name}
                        </span>
                        <p className="font-serif font-bold text-sm text-[#204434]">
                          {editorContent || "Nội dung câu hỏi sẽ hiển thị ở đây..."}
                        </p>
                        {editorPinyin && <p className="text-xs text-[#8F6D3B]">{editorPinyin}</p>}

                        {/* Interactive simulation */}
                        {editorType === "multiple_choice" && (
                          <div className="space-y-1.5 pt-1">
                            {editorOptions.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-xl border flex items-center gap-2 ${
                                  String.fromCharCode(65 + oIdx) === editorCorrectAnswer
                                    ? "bg-emerald-50 border-emerald-300 font-semibold text-emerald-900"
                                    : "border-[#E5DEC9] text-[#315E48]"
                                }`}
                              >
                                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {editorType === "fill_blank" && (
                          <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-dashed border-[#E5DEC9] text-center text-xs text-[#315E48]">
                            [ Ô nhập chữ Hán của học viên ]
                          </div>
                        )}

                        {editorType === "handwriting_photo" && (
                          <div className="p-3 rounded-xl bg-[#FAF7F0] border border-dashed border-[#E5DEC9] text-center text-xs text-[#315E48] space-y-1">
                            <UploadCloud className="w-6 h-6 mx-auto text-[#8F6D3B]" />
                            <p>Khu vực chụp ảnh / Tải lên ảnh bài viết tay</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* KHU VỰC D: THANH THAO TÁC 4 NÚT HÀNH ĐỘNG */}
                  <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] text-[#315E48]">
                      Khu vực D: Chọn thao tác lưu trữ
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          showToast("Đã lưu bản nháp câu hỏi!");
                          setIsAddQuestionChoiceOpen(false);
                        }}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] text-[#315E48] hover:bg-[#FAF7F0] font-semibold text-xs"
                      >
                        Lưu nháp
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveManualQuestion(false)}
                        className="px-3.5 py-2 rounded-xl border border-[#BC9B6B] bg-[#FFFCF6] hover:bg-[#FAF7F0] text-[#8F6D3B] font-bold text-xs"
                      >
                        Lưu vào Kho của tôi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleSaveManualQuestion(true);
                          setEditorContent("");
                          setEditorTitle("");
                          showToast("Đã thêm câu vào đề! Mời tiếp tục soạn câu tiếp theo.");
                        }}
                        className="px-4 py-2 rounded-xl bg-[#FAF7F0] border border-[#204434] text-[#204434] font-bold text-xs hover:bg-[#F3EEDD]"
                      >
                        Lưu & Tạo câu tiếp theo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveManualQuestion(true)}
                        className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5 text-[#BC9B6B]" />
                        <span>Lưu vào kho & Thêm vào đề</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* LUỒNG C: CÂU MẪU HƯỚNG DẪN (12 THẺ TƯƠNG ỨNG 12 DẠNG) */}
              {/* ------------------------------------------------------------- */}
              {activeFlow === "FLOW_C" && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 text-xs text-[#315E48]">
                    💡 <strong>Nguyên tắc:</strong> Nút "Dùng mẫu để chỉnh sửa" chỉ nạp nội dung mẫu lên
                    trình soạn. Giáo viên kiểm tra, tùy chỉnh rồi mới lưu thành câu hỏi của mình.
                    Không tự ý thêm câu mẫu thô chưa sửa vào đề thi thật.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[55vh] overflow-y-auto pr-1">
                    {GUIDED_QUESTION_TEMPLATES.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3 flex flex-col justify-between hover:border-[#BC9B6B] transition"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#204434]/10 text-[#204434]">
                              {
                                OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === tpl.type)?.name ||
                                tpl.type
                              }
                            </span>
                            <span className="text-[10px] text-[#8F6D3B] font-bold">
                              {tpl.points} điểm · {tpl.difficulty}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-sm text-[#204434] line-clamp-1">
                            {tpl.title}
                          </h4>
                          <p className="text-xs text-[#315E48] font-medium line-clamp-2">
                            {tpl.content}
                          </p>
                          {tpl.explanation && (
                            <p className="text-[11px] text-[#8F6D3B] italic line-clamp-1">
                              {tpl.explanation}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#E5DEC9]/60 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setTemplatePreview(tpl)}
                            className="px-3 py-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-xs font-semibold text-[#204434]"
                          >
                            Xem mẫu
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadTemplateIntoEditor(tpl)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-2xs flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#BC9B6B]" />
                            <span>Dùng mẫu để chỉnh sửa</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL: READ-ONLY PREVIEW MODAL (CHO LUỒNG A & C) */}
        {/* =================================================================== */}
        {(previewQuestionModal || templatePreview) && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#204434]" />
                  <h3 className="font-serif font-bold text-base text-[#204434]">
                    Xem trước chi tiết câu hỏi
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setPreviewQuestionModal(null);
                    setTemplatePreview(null);
                  }}
                  className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#F3EEDD] text-[#315E48]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {(() => {
                const q = previewQuestionModal || templatePreview;
                if (!q) return null;
                return (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#204434] text-white font-bold text-[10px]">
                        {OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === q.type)?.name}
                      </span>
                      <span className="text-[#8F6D3B] font-bold">
                        {q.points} điểm · HSK {q.hskLevel}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] space-y-1">
                      <p className="text-sm font-serif font-bold text-[#204434]">{q.content}</p>
                      {q.pinyin && <p className="text-xs text-[#8F6D3B]">{q.pinyin}</p>}
                    </div>

                    {q.options && (
                      <div className="space-y-1.5">
                        <span className="font-bold text-[#204434]">Các phương án lựa chọn:</span>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded-xl border ${
                                String.fromCharCode(65 + idx) === q.correctAnswer
                                  ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-900"
                                  : "bg-white border-[#E5DEC9]"
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {q.explanation && (
                      <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48]">
                        <strong>Giải thích:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setPreviewQuestionModal(null);
                    setTemplatePreview(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold"
                >
                  Đóng xem trước
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL: CHẤM BÀI THỦ CÔNG (MANUAL GRADING MODAL) */}
        {/* =================================================================== */}
        {gradingSubmission && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
              {/* Grading Header */}
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={gradingSubmission.studentAvatar}
                    alt={gradingSubmission.studentName}
                    className="w-10 h-10 rounded-full object-cover border border-[#E5DEC9]"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#204434]">
                      Chấm bài: {gradingSubmission.studentName}
                    </h3>
                    <p className="text-xs text-[#315E48]">
                      Lớp: {gradingSubmission.className} · Nộp: {gradingSubmission.submittedAt}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setGradingSubmission(null)}
                  className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#F3EEDD] text-[#315E48]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Questions to Grade */}
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-between text-xs">
                  <span className="text-[#315E48]">
                    Điểm trắc nghiệm (tự chấm):{" "}
                    <strong className="text-emerald-800">{gradingSubmission.autoScore} điểm</strong>
                  </span>
                  <span className="text-[#8F6D3B] font-bold">
                    Cần chấm tay {gradingSubmission.manualQuestions.length} câu
                  </span>
                </div>

                {gradingSubmission.manualQuestions.map((mq, mqIdx) => (
                  <div
                    key={mq.questionId}
                    className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-[#204434]">
                        Câu {mqIdx + 1}: {mq.questionTitle}
                      </span>
                      <span className="text-xs font-bold text-[#8F6D3B]">
                        Tối đa: {mq.maxPoints} điểm
                      </span>
                    </div>

                    {/* Handwriting Photo zoomable */}
                    {mq.type === "handwriting_photo" && mq.studentPhotoUrl && (
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-[#315E48]">
                          Ảnh bài chép chữ Hán nộp bởi học viên:
                        </span>
                        <div className="relative rounded-2xl overflow-hidden border border-[#E5DEC9] max-h-72 bg-black/5 flex items-center justify-center">
                          <img
                            src={mq.studentPhotoUrl}
                            alt="Bài viết tay"
                            className={`object-contain transition-all duration-300 ${
                              isPhotoZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
                            }`}
                            onClick={() => setIsPhotoZoomed(!isPhotoZoomed)}
                          />
                          <button
                            onClick={() => setIsPhotoZoomed(!isPhotoZoomed)}
                            className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>{isPhotoZoomed ? "Thu nhỏ" : "Phóng to xem nét chữ"}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Text essay / translation response */}
                    {mq.studentResponseText && (
                      <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1">
                        <span className="text-[11px] font-bold text-[#315E48]">
                          Bài làm của học viên:
                        </span>
                        <p className="text-sm font-serif text-[#204434] leading-relaxed">
                          {mq.studentResponseText}
                        </p>
                      </div>
                    )}

                    {mq.rubric && (
                      <div className="text-[11px] text-[#8F6D3B] bg-[#FDFBF7] p-2.5 rounded-xl border border-[#E5DEC9]">
                        <strong>Thang chấm Rubric:</strong> {mq.rubric}
                      </div>
                    )}

                    {/* Teacher grading input */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E5DEC9]/60 text-xs">
                      <div>
                        <label className="font-bold text-[#204434] block mb-1">
                          Điểm cho câu này (0 - {mq.maxPoints}):
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={mq.maxPoints}
                          value={gradingScores[mq.questionId] ?? ""}
                          onChange={(e) => {
                            const val = Math.min(mq.maxPoints, Math.max(0, Number(e.target.value)));
                            setGradingScores({ ...gradingScores, [mq.questionId]: val });
                          }}
                          placeholder={`0 - ${mq.maxPoints}`}
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-bold text-center"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="font-bold text-[#204434] block mb-1">
                          Nhận xét chi tiết cho học viên:
                        </label>
                        <input
                          type="text"
                          value={gradingComments[mq.questionId] ?? ""}
                          onChange={(e) =>
                            setGradingComments({
                              ...gradingComments,
                              [mq.questionId]: e.target.value,
                            })
                          }
                          placeholder="Ví dụ: Nét chữ rất đều, chú ý thêm bút thuận..."
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 3 Grading Actions (Spec Section 11) */}
              <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleCompleteGrading("REQUEST_RESUBMIT")}
                  className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Yêu cầu nộp lại bài</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCompleteGrading("SAVE_DRAFT")}
                    className="px-4 py-2 rounded-xl border border-[#BC9B6B] bg-[#FFFCF6] hover:bg-[#FAF7F0] text-[#8F6D3B] font-bold"
                  >
                    Lưu nháp chấm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCompleteGrading("SUBMIT_GRADE")}
                    className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#BC9B6B]" />
                    <span>Trả bài cho học viên</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
