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
  EyeOff,
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
  Shuffle,
  Music,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  Archive,
  FileCheck,
  CheckSquare,
  Copy,
  FileText,
  ShieldCheck,
  QrCode,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";
import {
  OFFICIAL_12_QUESTION_TYPES,
  QuestionType,
  ExamQuestionItem,
  GUIDED_QUESTION_TEMPLATES,
  UNIFIED_QUESTION_BANK,
  StudentSubmissionItem,
  ManualQuestionItem,
  ExamPackageItem,
  TeacherAssignmentRecord,
} from "@/lib/assignment-data";
import { CulturalSelectionItem } from "@/lib/lesson-data";

interface ClassOption {
  id: string;
  name: string;
  code?: string;
  studentCount?: number;
}

export type AssignmentTabType =
  | "ALL"
  | "OPEN"
  | "SUBMISSIONS"
  | "CLOSED"
  | "DRAFT_EXAMS"
  | "READY_EXAMS"
  | "ARCHIVED";

interface AssignmentsWorkspaceProps {
  currentUser?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  classesList?: ClassOption[];
  onBackToDashboard?: () => void;
  initialExamId?: string | null;
  initialTab?: AssignmentTabType;
  initialNewAssignmentPayload?: {
    lessonTitle: string;
    classId: string;
    vocabList?: { id: string; hanzi: string; pinyin: string; meaningVi: string; exampleZh?: string }[];
    grammarList?: { id: string; title: string; structure?: string; explanation?: string }[];
    culturalList?: CulturalSelectionItem[];
  };
  onNavigateToQuestionBank?: (tab?: "ALL" | "DRAFT" | "READY" | "USED") => void;
}

export function AssignmentsWorkspace({
  currentUser,
  classesList = [],
  onBackToDashboard,
  initialExamId,
  initialTab,
  initialNewAssignmentPayload,
  onNavigateToQuestionBank,
}: AssignmentsWorkspaceProps) {
  // Main view modes: "LIST" | "COMPOSER" | "GRADING_MODAL"
  const [viewMode, setViewMode] = useState<"LIST" | "COMPOSER">("LIST");

  // Tabs theo Đặc tả V2.0 & Đặc tả bổ sung Đề nháp (23/10/2026):
  // Tất cả đề | Đang mở | Chờ chấm | Đã đóng | Đề nháp | Đề đã hoàn thiện | Lưu trữ
  const [activeTab, setActiveTab] = useState<AssignmentTabType>(initialTab || "ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Quản lý trạng thái Đề nháp đang biên soạn (Spec Section 3.1 & 3.2)
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [examSaveStatus, setExamSaveStatus] = useState<
    "CLEAN" | "UNSAVED" | "SAVING" | "SAVED" | "FAILED"
  >("CLEAN");
  const [deleteConfirmPackage, setDeleteConfirmPackage] = useState<ExamPackageItem | null>(null);

  // Exam Packages state (persisted to localStorage)
  const [examPackages, setExamPackages] = useState<ExamPackageItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_exam_packages");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hanyu_exam_packages", JSON.stringify(examPackages));
      } catch (e) {}
    }
  }, [examPackages]);

  // Existing assignments list (persisted to localStorage)
  const [assignments, setAssignments] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_teacher_assignments");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hanyu_teacher_assignments", JSON.stringify(assignments));
      } catch (e) {}
    }
  }, [assignments]);

  // Student Submissions state (persisted to localStorage)
  const [submissions, setSubmissions] = useState<StudentSubmissionItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_student_submissions");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hanyu_student_submissions", JSON.stringify(submissions));
      } catch (e) {}
    }
  }, [submissions]);

  // Submissions Filters
  const [subFilterClass, setSubFilterClass] = useState("ALL");
  const [subFilterExam, setSubFilterExam] = useState("ALL");
  const [subFilterSubmissionStatus, setSubFilterSubmissionStatus] = useState("ALL");
  const [subFilterGradingStatus, setSubFilterGradingStatus] = useState("ALL");
  const [subSearchQuery, setSubSearchQuery] = useState("");

  // Assign Modal state (Section C)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningExam, setAssigningExam] = useState<ExamPackageItem | null>(null);
  const [assignClassId, setAssignClassId] = useState(classesList[0]?.id || "c1");
  const [assignClassIds, setAssignClassIds] = useState<string[]>([classesList[0]?.id || "c1"]);
  const [assignOpenDate, setAssignOpenDate] = useState(new Date().toISOString().split("T")[0]);
  const [assignDueDate, setAssignDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [assignDurationMin, setAssignDurationMin] = useState(45);
  const [assignMaxAttempts, setAssignMaxAttempts] = useState(1);
  const [assignScorePolicy, setAssignScorePolicy] = useState<"AFTER_SUBMIT" | "AFTER_PUBLISH" | "NEVER">("AFTER_PUBLISH");
  const [assignAllowLate, setAssignAllowLate] = useState(true);

  // Exam preview modal
  const [previewingExam, setPreviewingExam] = useState<ExamPackageItem | null>(null);

  // Resubmission modal state
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [resubmitTargetSub, setResubmitTargetSub] = useState<StudentSubmissionItem | null>(null);
  const [resubmitReasonText, setResubmitReasonText] = useState("");

  // Photo zoom lightbox state
  const [zoomedPhotoUrl, setZoomedPhotoUrl] = useState<string | null>(null);
  const [photoRotation, setPhotoRotation] = useState(0);

  // Live Exam Room QR Modal state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrAssignment, setQrAssignment] = useState<{ id: string; title: string; className?: string } | null>(null);
  const [isQrFullscreen, setIsQrFullscreen] = useState(false);
  const [copiedQrLink, setCopiedQrLink] = useState(false);

  const handleCopyQrLink = (url: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedQrLink(true);
      setTimeout(() => setCopiedQrLink(false), 2000);
    }
  };

  // Dynamic KPI Metrics according to Spec Section 2.1 & E1
  const kpiMetrics = useMemo(() => {
    // 1. Tổng số đề bài: Tất cả bài đã giao + đề hoàn thiện trong kho
    const totalExams =
      assignments.filter((a) => a.status !== "ARCHIVED").length +
      examPackages.filter((p) => p.status === "READY").length;
    // 2. Đang mở cho học viên
    const totalOpen = assignments.filter((a) => a.status === "ACTIVE" || a.status === "OPEN").length;
    // 3. Chờ chấm thủ công
    const totalWaitingGrade = submissions.filter(
      (s) =>
        s.gradingStatus === "WAITING_MANUAL" ||
        s.status === "WAITING_GRADE"
    ).length;
    // 4. Đã đóng hạn nộp
    const totalClosed = assignments.filter((a) => a.status === "CLOSED").length;
    // 5. Đề nháp
    const totalDrafts = examPackages.filter((p) => p.status === "DRAFT").length;
    const totalReady = examPackages.filter((p) => p.status === "READY").length;
    const totalAssigned = assignments.filter((a) => a.status !== "ARCHIVED").length;
    const totalSubmitted = submissions.filter((s) => s.submissionStatus !== "NOT_STARTED").length;
    const totalUnsubmitted = submissions.filter((s) => s.submissionStatus === "NOT_STARTED").length;
    const totalGraded = submissions.filter(
      (s) => s.gradingStatus === "GRADED" || s.gradingStatus === "PUBLISHED"
    ).length;
    const totalResubmit = submissions.filter((s) => s.submissionStatus === "RESUBMISSION_REQUIRED").length;
    const totalPublished = submissions.filter((s) => s.isPublished).length;

    return {
      totalExams,
      totalOpen,
      totalWaitingGrade,
      totalClosed,
      totalDrafts,
      totalReady,
      totalAssigned,
      totalSubmitted,
      totalUnsubmitted,
      totalGraded,
      totalResubmit,
      totalPublished,
    };
  }, [assignments, submissions, examPackages]);

  // Effect to load initialExamId into Composer Step 1
  useEffect(() => {
    if (initialExamId) {
      const found = examPackages.find((p) => p.id === initialExamId);
      if (found) {
        setCurrentExamId(found.id);
        setExamTitle(found.title);
        setExamDescription(found.description);
        setExamCurriculum(found.curriculum || "HSK 3.0");
        setExamLevel(found.hskLevel || 1);
        if (found.questions && found.questions.length > 0) {
          setDraftQuestions(found.questions);
        }
        setViewMode("COMPOSER");
        setComposerStep(1);
        setExamSaveStatus("CLEAN");
        showToast(`Đã mở đề nháp "${found.title}" vào trình ghép đề!`);
      } else {
        setActiveTab("DRAFT_EXAMS");
      }
    }
  }, [initialExamId, examPackages]);

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

  // Selected questions in current draft exam (with localStorage persistence)
  const [draftQuestions, setDraftQuestions] = useState<ExamQuestionItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_draft_exam_questions");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      GUIDED_QUESTION_TEMPLATES[0], // MCQ
      GUIDED_QUESTION_TEMPLATES[1], // Matching
      GUIDED_QUESTION_TEMPLATES[3], // Fill blank
      GUIDED_QUESTION_TEMPLATES[4], // Ordering
      GUIDED_QUESTION_TEMPLATES[6], // Handwriting
    ];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hanyu_draft_exam_questions", JSON.stringify(draftQuestions));
      } catch (e) {}
    }
  }, [draftQuestions]);

  // Unified Question Bank (persisted to localStorage)
  const [questionBank, setQuestionBank] = useState<ExamQuestionItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_custom_question_bank");
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hanyu_custom_question_bank", JSON.stringify(questionBank));
      } catch (e) {}
    }
  }, [questionBank]);

  // Dirty State Navigation Guard (Spec Section 3.1)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (examSaveStatus === "UNSAVED" && draftQuestions.length > 0) {
        e.preventDefault();
        e.returnValue = "Bạn có thay đổi trong đề thi chưa lưu. Bạn có chắc muốn rời đi?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [examSaveStatus, draftQuestions]);

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

  // FLOW B: Manual Question Editor (12 Forms Specialized State)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"CLEAN" | "UNSAVED" | "SAVING" | "SAVED" | "FAILED">("CLEAN");
  const [previewRole, setPreviewRole] = useState<"STUDENT" | "TEACHER">("STUDENT");

  // General fields
  const [editorType, setEditorType] = useState<QuestionType>("multiple_choice");
  const [editorTitle, setEditorTitle] = useState("Nhận biết từ vựng: 休息");
  const [editorContent, setEditorContent] = useState("“休息” (xiūxi) có nghĩa là gì?");
  const [editorPinyin, setEditorPinyin] = useState("xiūxi");
  const [editorPoints, setEditorPoints] = useState(5);
  const [editorDifficulty, setEditorDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [editorExplanation, setEditorExplanation] = useState("“休息” là động từ chỉ hành động nghỉ ngơi, ngừng làm việc hoặc học tập để lấy lại sức.");
  const [editorRubric, setEditorRubric] = useState("");

  // 1. Multiple Choice Specific State
  const [mcqSelectionMode, setMcqSelectionMode] = useState<"SINGLE" | "MULTIPLE">("SINGLE");
  const [mcqOptions, setMcqOptions] = useState<string[]>([
    "Nghỉ ngơi",
    "Đi làm việc",
    "Ngày mai",
    "Bị bệnh"
  ]);
  const [mcqCorrectSingle, setMcqCorrectSingle] = useState<string>("A");
  const [mcqCorrectMultiple, setMcqCorrectMultiple] = useState<string[]>(["A"]);
  const [mcqStudentPicked, setMcqStudentPicked] = useState<string[]>([]);

  // 2. Matching Specific State
  const [matchingPairs, setMatchingPairs] = useState<{ id: string; left: string; right: string }[]>([
    { id: "pair-1", left: "今天 (jīntiān)", right: "Hôm nay" },
    { id: "pair-2", left: "明天 (míngtiān)", right: "Ngày mai" },
    { id: "pair-3", left: "休息 (xiūxi)", right: "Nghỉ ngơi" },
    { id: "pair-4", left: "生病 (shēngbìng)", right: "Bị bệnh, bị ốm" },
  ]);
  const [matchingShuffleB, setMatchingShuffleB] = useState<boolean>(true);
  const [matchingSelectedA, setMatchingSelectedA] = useState<string | null>(null);
  const [matchingConnected, setMatchingConnected] = useState<Record<string, string>>({});

  // 3. Flashcard Specific State
  const [flashcardsList, setFlashcardsList] = useState<{ id: string; front: string; backPy: string; backVi: string; exampleZh?: string }[]>([
    {
      id: "fc-1",
      front: "休息",
      backPy: "xiūxi",
      backVi: "Nghỉ ngơi",
      exampleZh: "我今天在宿舍休息。(Hôm nay tôi ở ký túc xá nghỉ ngơi).",
    },
    {
      id: "fc-2",
      front: "医院",
      backPy: "yīyuàn",
      backVi: "Bệnh viện",
      exampleZh: "他去医院看病了。(Anh ấy đi bệnh viện khám bệnh rồi).",
    }
  ]);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [flashcardMemorized, setFlashcardMemorized] = useState<Record<string, boolean>>({});

  // 4. Fill in the Blank Specific State
  const [blankSentence, setBlankSentence] = useState("他身体不舒服，所以今天在宿舍 [_____] 。");
  const [blankAnswers, setBlankAnswers] = useState<{ id: string; answer: string; alternatives: string }[]>([
    { id: "blank-1", answer: "休息", alternatives: "xiuxi, xiūxi" }
  ]);
  const [blankStudentInputs, setBlankStudentInputs] = useState<Record<string, string>>({});

  // 5. Sentence Ordering Specific State (Sắp xếp câu)
  const [orderingSentence, setOrderingSentence] = useState("他今天在宿舍休息。");
  const [orderingTokens, setOrderingTokens] = useState<{ id: string; text: string }[]>([
    { id: "ord-1", text: "他" },
    { id: "ord-2", text: "今天" },
    { id: "ord-3", text: "在宿舍" },
    { id: "ord-4", text: "休息。" },
  ]);
  const [orderingStudentTokens, setOrderingStudentTokens] = useState<string[]>([]);

  // 6. True / False Specific State
  const [tfStatement, setTfStatement] = useState("Trong câu '他生病了', trợ từ '了' biểu thị hành động đang tiếp diễn ở hiện tại.");
  const [tfAnswer, setTfAnswer] = useState<"TRUE" | "FALSE">("FALSE");
  const [tfStudentChoice, setTfStudentChoice] = useState<"TRUE" | "FALSE" | null>(null);

  // 7. Handwriting Photo Specific State (Chép từ nộp ảnh)
  const [hwWordsList, setHwWordsList] = useState("今天、明天、休息、生病");
  const [hwRepeatCount, setHwRepeatCount] = useState<number>(5);
  const [hwRubric, setHwRubric] = useState("Viết đúng chữ Hán (4đ), Đủ 5 lần chép (2đ), Đúng bút thuận (2đ), Ngay ngắn sạch đẹp (2đ).");
  const [hwUploadedPhotos, setHwUploadedPhotos] = useState<string[]>([]);

  // 8. Essay Specific State (Tự luận)
  const [essayPrompt, setEssayPrompt] = useState("Dùng tiếng Trung viết đoạn văn từ 50-80 chữ giới thiệu về một ngày nghỉ của bạn. Gợi ý: Buổi sáng làm gì? Buổi chiều làm gì? Cảm thấy thế nào?");
  const [essayMinWords, setEssayMinWords] = useState<number>(50);
  const [essayMaxWords, setEssayMaxWords] = useState<number>(80);
  const [essaySample, setEssaySample] = useState("今天我休息。早上我在宿舍看书，听音乐。下午我和朋友一起去公园散步。虽然生活很简单，但是我觉得非常开心。");
  const [essayStudentText, setEssayStudentText] = useState("");

  // 9. Translation Specific State (Dịch câu)
  const [transDirection, setTransDirection] = useState<"ZH_TO_VI" | "VI_TO_ZH">("ZH_TO_VI");
  const [transSource, setTransSource] = useState("王老师，我今天身体有点不舒服，想请假一天。");
  const [transReference, setTransReference] = useState("Thầy Vương, hôm nay em hơi không khỏe, muốn xin nghỉ một ngày ạ.");
  const [transAlternatives, setTransAlternatives] = useState("Thầy Vương, hôm nay trong người em không được khỏe, em muốn xin nghỉ học một ngày.");
  const [transStudentInput, setTransStudentInput] = useState("");

  // 10. Error Correction Specific State (Tìm lỗi sai)
  const [errorMode, setErrorMode] = useState<"CLICK_ERROR" | "REWRITE">("CLICK_ERROR");
  const [errorSentenceTokens, setErrorSentenceTokens] = useState<{ id: string; text: string; isError: boolean }[]>([
    { id: "err-1", text: "我", isError: false },
    { id: "err-2", text: "明天", isError: true },
    { id: "err-3", text: "昨天", isError: true },
    { id: "err-4", text: "休息。", isError: false },
  ]);
  const [errorCorrectSentence, setErrorCorrectSentence] = useState("我明天休息。 / 我昨天休息。");
  const [errorStudentSelectedId, setErrorStudentSelectedId] = useState<string | null>(null);
  const [errorStudentRewrite, setErrorStudentRewrite] = useState("");

  // 11. Listening Choice Specific State (Nghe chọn)
  const [listenAudioUrl, setListenAudioUrl] = useState("/sample-audio/hsk1-b5-dialogue.mp3");
  const [listenTranscript, setListenTranscript] = useState("A: 你明天去上班吗？ B: 我明天休息，在宿舍看书。");
  const [listenQuestion, setListenQuestion] = useState("Người nói ngày mai dự định làm gì?");
  const [listenOptions, setListenOptions] = useState<string[]>([
    "Đi làm tăng ca",
    "Ở nhà nghỉ ngơi đọc sách",
    "Đi công viên tập thể dục",
    "Đến bệnh viện thăm bạn"
  ]);
  const [listenCorrect, setListenCorrect] = useState("B");
  const [listenMaxPlays, setListenMaxPlays] = useState<number>(2);
  const [listenAudioPlaysRemaining, setListenAudioPlaysRemaining] = useState<number>(2);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // 12. Listening Fill Specific State (Nghe điền)
  const [listenFillAudioUrl, setListenFillAudioUrl] = useState("/sample-audio/hsk1-b5-dialogue.mp3");
  const [listenFillTranscript, setListenFillTranscript] = useState("王老师，我发烧了，正在宿舍 [_____] 。");
  const [listenFillAnswer, setListenFillAnswer] = useState("休息");
  const [listenFillStudentInput, setListenFillStudentInput] = useState("");

  // FLOW C: Guided Templates
  const [templatePreview, setTemplatePreview] = useState<ExamQuestionItem | null>(null);

  // =========================================================================
  // SWITCH QUESTION TYPE FUNCTION (Clean state, no cross-type leakage)
  // =========================================================================
  // RESET EDITOR TO CLEAN STATE (PHẦN A: Dọn sạch form, ID mới, không copy phương án/đáp án cũ)
  const resetEditorForCleanState = (newType: QuestionType) => {
    setEditingQuestionId(null);
    setEditorType(newType);
    setSaveStatus("CLEAN");

    const tpl = GUIDED_QUESTION_TEMPLATES.find((t) => t.type === newType);
    const typeMeta = OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === newType);
    setEditorTitle(`Câu hỏi mới: ${typeMeta?.name || "Luyện tập"}`);
    setEditorPoints(tpl?.points || 10);
    setEditorDifficulty("MEDIUM");
    setEditorExplanation("");
    setEditorRubric(tpl?.rubric || "");

    // Đặt lại các trường dữ liệu sạch sẽ, không giữ đáp án cũ
    if (newType === "multiple_choice") {
      setEditorContent("");
      setEditorPinyin("");
      setMcqOptions(["", "", "", ""]);
      setMcqCorrectSingle("A");
      setMcqSelectionMode("SINGLE");
      setMcqStudentPicked([]);
    } else if (newType === "matching") {
      setEditorContent("Nối các từ ngữ tương ứng");
      setMatchingPairs([
        { id: `pair-${Date.now()}-1`, left: "", right: "" },
        { id: `pair-${Date.now()}-2`, left: "", right: "" },
      ]);
      setMatchingConnected({});
    } else if (newType === "flashcard") {
      setFlashcardsList([
        { id: `fc-${Date.now()}-1`, front: "", backPy: "", backVi: "" },
      ]);
      setActiveFlashcardIndex(0);
      setIsFlashcardFlipped(false);
    } else if (newType === "fill_blank") {
      setBlankSentence("");
      setBlankAnswers([{ id: `blank-${Date.now()}-1`, answer: "", alternatives: "" }]);
      setBlankStudentInputs({});
    } else if (newType === "sentence_order") {
      setOrderingSentence("");
      setOrderingTokens([]);
      setOrderingStudentTokens([]);
    } else if (newType === "true_false") {
      setTfStatement("");
      setTfAnswer("TRUE");
      setTfStudentChoice(null);
    } else if (newType === "handwriting_photo") {
      setHwWordsList("");
      setHwRepeatCount(5);
      setHwRubric("Viết đúng chữ Hán (4đ), Đủ 5 lần chép (2đ), Nét chữ rõ đẹp (2đ), Trình bày sạch (2đ).");
      setHwUploadedPhotos([]);
    } else if (newType === "essay") {
      setEssayPrompt("");
      setEssayMinWords(30);
      setEssayMaxWords(60);
      setEssaySample("");
      setEssayStudentText("");
    } else if (newType === "translation") {
      setTransSource("");
      setTransReference("");
      setTransAlternatives("");
      setTransStudentInput("");
    } else if (newType === "find_error") {
      setErrorSentenceTokens([]);
      setErrorCorrectSentence("");
      setErrorStudentSelectedId(null);
      setErrorStudentRewrite("");
    } else if (newType === "listening_choice") {
      setListenAudioUrl("");
      setListenOptions(["", "", "", ""]);
      setListenCorrect("A");
    } else if (newType === "listening_fill") {
      setListenFillAudioUrl("");
      setListenFillTranscript("");
      setListenFillAnswer("");
    }
  };

  const handleSwitchEditorType = (newType: QuestionType) => {
    setEditorType(newType);
    setSaveStatus("CLEAN");

    // Load type-specific initial template data
    const tpl = GUIDED_QUESTION_TEMPLATES.find((t) => t.type === newType);
    if (tpl) {
      setEditorTitle(tpl.title);
      setEditorPoints(tpl.points);
      setEditorDifficulty(tpl.difficulty);
      setEditorExplanation(tpl.explanation || "");
      setEditorRubric(tpl.rubric || "");

      if (newType === "multiple_choice") {
        setEditorContent(tpl.content);
        setEditorPinyin(tpl.pinyin || "");
        setMcqOptions(tpl.options || ["Nghỉ ngơi", "Đi làm việc", "Ngày mai", "Bị bệnh"]);
        setMcqCorrectSingle(typeof tpl.correctAnswer === "string" ? tpl.correctAnswer : "A");
        setMcqSelectionMode("SINGLE");
        setMcqStudentPicked([]);
      } else if (newType === "matching") {
        setEditorContent(tpl.content);
        setMatchingPairs(
          tpl.matchingPairs?.map((p, i) => ({ id: `pair-${i}`, left: p.left, right: p.right })) || [
            { id: "pair-1", left: "今天 (jīntiān)", right: "Hôm nay" },
            { id: "pair-2", left: "明天 (míngtiān)", right: "Ngày mai" },
            { id: "pair-3", left: "休息 (xiūxi)", right: "Nghỉ ngơi" },
            { id: "pair-4", left: "生病 (shēngbìng)", right: "Bị bệnh" },
          ]
        );
        setMatchingConnected({});
        setMatchingSelectedA(null);
      } else if (newType === "flashcard") {
        setEditorContent(tpl.content);
        setFlashcardsList([
          {
            id: "fc-1",
            front: tpl.flashcard?.front || "休息",
            backPy: tpl.flashcard?.backPinyin || "xiūxi",
            backVi: tpl.flashcard?.backVi || "Nghỉ ngơi",
            exampleZh: "我今天在宿舍休息。(Hôm nay tôi ở ký túc xá nghỉ ngơi).",
          },
        ]);
        setActiveFlashcardIndex(0);
        setIsFlashcardFlipped(false);
      } else if (newType === "fill_blank") {
        setBlankSentence(tpl.content);
        setBlankAnswers([
          { id: "blank-1", answer: typeof tpl.correctAnswer === "string" ? tpl.correctAnswer : "不", alternatives: "bù" }
        ]);
        setBlankStudentInputs({});
      } else if (newType === "sentence_order") {
        setOrderingSentence("你明天休息吗？");
        setOrderingTokens([
          { id: "ord-1", text: "你" },
          { id: "ord-2", text: "明天" },
          { id: "ord-3", text: "休息" },
          { id: "ord-4", text: "吗" },
          { id: "ord-5", text: "？" },
        ]);
        setOrderingStudentTokens([]);
      } else if (newType === "true_false") {
        setTfStatement(tpl.content);
        setTfAnswer(tpl.correctAnswer === "DUNG" ? "TRUE" : "FALSE");
        setTfStudentChoice(null);
      } else if (newType === "handwriting_photo") {
        setHwWordsList("今天、明天、休息、生病");
        setHwRepeatCount(5);
        setHwRubric(tpl.rubric || "Viết đúng chữ Hán (4đ), Đủ 5 lần (2đ), Bút thuận (2đ), Ngay ngắn sạch đẹp (2đ).");
        setHwUploadedPhotos([]);
      } else if (newType === "essay") {
        setEssayPrompt(tpl.content);
        setEssayMinWords(50);
        setEssayMaxWords(80);
        setEssaySample(tpl.sampleAnswer || "");
        setEssayStudentText("");
      } else if (newType === "translation") {
        setTransDirection("ZH_TO_VI");
        setTransSource("王老师，我今天身体有点不舒服，想请假一天。");
        setTransReference("Thầy Vương, hôm nay em hơi không khỏe, muốn xin nghỉ một ngày ạ.");
        setTransAlternatives("Thầy Vương, hôm nay em không được khỏe, em muốn xin nghỉ học một ngày.");
        setTransStudentInput("");
      } else if (newType === "find_error") {
        setErrorMode("CLICK_ERROR");
        setErrorSentenceTokens([
          { id: "err-1", text: "我", isError: false },
          { id: "err-2", text: "明天", isError: true },
          { id: "err-3", text: "昨天", isError: true },
          { id: "err-4", text: "休息。", isError: false },
        ]);
        setErrorCorrectSentence("我明天休息。 / 我昨天休息。");
        setErrorStudentSelectedId(null);
        setErrorStudentRewrite("");
      } else if (newType === "listening_choice") {
        setListenAudioUrl("/sample-audio/hsk1-b5-dialogue.mp3");
        setListenTranscript("A: 你明天去上班吗？ B: 我明天休息，在宿舍看书。");
        setListenQuestion(tpl.content);
        setListenOptions(tpl.options || ["Đi làm tăng ca", "Ở nhà nghỉ ngơi đọc sách", "Đi công viên", "Đến bệnh viện"]);
        setListenCorrect(typeof tpl.correctAnswer === "string" ? tpl.correctAnswer : "B");
        setListenMaxPlays(2);
        setListenAudioPlaysRemaining(2);
      } else if (newType === "listening_fill") {
        setListenFillAudioUrl("/sample-audio/hsk1-b5-dialogue.mp3");
        setListenFillTranscript("王老师，我发烧了，正在宿舍 [_____] 。");
        setListenFillAnswer(typeof tpl.correctAnswer === "string" ? tpl.correctAnswer : "休息");
        setListenFillStudentInput("");
      }
    }
  };

  // =========================================================================
  // TYPE-SPECIFIC VALIDATOR
  // =========================================================================
  const validateQuestionByType = (): { valid: boolean; error?: string } => {
    if (editorType === "multiple_choice") {
      if (!editorContent.trim()) return { valid: false, error: "Vui lòng nhập câu hỏi trắc nghiệm!" };
      if (mcqOptions.filter((o) => o.trim()).length < 2) return { valid: false, error: "Cần ít nhất 2 phương án trắc nghiệm!" };
      if (mcqSelectionMode === "SINGLE" && !mcqCorrectSingle) return { valid: false, error: "Vui lòng chọn 1 đáp án đúng!" };
      if (mcqSelectionMode === "MULTIPLE" && mcqCorrectMultiple.length < 2) return { valid: false, error: "Dạng nhiều đáp án cần chọn ít nhất 2 đáp án đúng!" };
    } else if (editorType === "matching") {
      if (matchingPairs.length < 2) return { valid: false, error: "Cần ít nhất 2 cặp nối hoàn chỉnh!" };
      if (matchingPairs.some((p) => !p.left.trim() || !p.right.trim())) return { valid: false, error: "Không được để trống vế nối ở cột A hoặc cột B!" };
    } else if (editorType === "flashcard") {
      if (flashcardsList.length === 0) return { valid: false, error: "Cần ít nhất 1 thẻ flashcard!" };
      if (flashcardsList.some((fc) => !fc.front.trim() || !fc.backVi.trim())) return { valid: false, error: "Mặt trước và mặt sau của thẻ không được để trống!" };
    } else if (editorType === "fill_blank") {
      if (!blankSentence.trim()) return { valid: false, error: "Vui lòng nhập câu có chỗ trống [_____]!" };
      if (blankAnswers.some((b) => !b.answer.trim())) return { valid: false, error: "Vui lòng nhập đáp án cho các ô trống!" };
    } else if (editorType === "sentence_order") {
      if (orderingTokens.length < 2) return { valid: false, error: "Cần ít nhất 2 thẻ từ để sắp xếp câu!" };
      if (orderingTokens.some((t) => !t.text.trim())) return { valid: false, error: "Các thẻ từ không được để trống nội dung!" };
    } else if (editorType === "true_false") {
      if (!tfStatement.trim()) return { valid: false, error: "Vui lòng nhập câu nhận định Đúng/Sai!" };
    } else if (editorType === "handwriting_photo") {
      if (!hwWordsList.trim()) return { valid: false, error: "Vui lòng nhập danh sách từ cần luyện viết!" };
      if (hwRepeatCount <= 0) return { valid: false, error: "Số lần chép phải lớn hơn 0!" };
    } else if (editorType === "essay") {
      if (!essayPrompt.trim()) return { valid: false, error: "Vui lòng nhập đề bài tự luận!" };
    } else if (editorType === "translation") {
      if (!transSource.trim()) return { valid: false, error: "Vui lòng nhập câu nguồn cần dịch!" };
    } else if (editorType === "find_error") {
      if (errorSentenceTokens.length < 2) return { valid: false, error: "Cần ít nhất 2 cụm từ trong câu tìm lỗi sai!" };
      if (!errorSentenceTokens.some((t) => t.isError)) return { valid: false, error: "Vui lòng đánh dấu ít nhất 1 từ/cụm từ sai trong câu!" };
    } else if (editorType === "listening_choice") {
      if (!listenQuestion.trim()) return { valid: false, error: "Vui lòng nhập câu hỏi nghe hiểu!" };
      if (listenOptions.filter((o) => o.trim()).length < 2) return { valid: false, error: "Cần ít nhất 2 phương án lựa chọn!" };
    } else if (editorType === "listening_fill") {
      if (!listenFillTranscript.trim()) return { valid: false, error: "Vui lòng nhập transcript bài nghe!" };
      if (!listenFillAnswer.trim()) return { valid: false, error: "Vui lòng nhập đáp án cần điền!" };
    }
    return { valid: true };
  };

  // =========================================================================
  // BUILD QUESTION OBJECT FOR SAVING
  // =========================================================================
  const buildQuestionObject = (status: "DRAFT" | "READY"): ExamQuestionItem => {
    const qId = editingQuestionId || `q-${editorType}-${Date.now()}`;
    const base: ExamQuestionItem = {
      id: qId,
      source: "MINE",
      sourceId: `teacher-${currentUser?.id || "custom"}`,
      status,
      type: editorType,
      title: editorTitle.trim() || `[${OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === editorType)?.name}] ${editorContent.slice(0, 30)}`,
      content: editorContent.trim(),
      pinyin: editorPinyin.trim() || undefined,
      points: Number(editorPoints) || 5,
      difficulty: editorDifficulty,
      hskLevel: examLevel,
      curriculum: examCurriculum,
      explanation: editorExplanation.trim() || undefined,
      rubric: editorRubric.trim() || undefined,
      createdAt: new Date().toLocaleDateString("vi-VN"),
      updatedAt: new Date().toLocaleDateString("vi-VN"),
    };

    if (editorType === "multiple_choice") {
      base.content = editorContent;
      base.selectionMode = mcqSelectionMode;
      base.options = mcqOptions;
      base.correctAnswer = mcqSelectionMode === "SINGLE" ? mcqCorrectSingle : mcqCorrectMultiple;
    } else if (editorType === "matching") {
      base.content = editorContent || "Nối các từ ở cột A với nội dung đúng tương ứng ở cột B:";
      base.matchingPairs = matchingPairs;
    } else if (editorType === "flashcard") {
      base.content = editorContent || "Thẻ flashcard ôn tập từ vựng:";
      base.flashcard = {
        front: flashcardsList[0]?.front || "休息",
        backPinyin: flashcardsList[0]?.backPy || "xiūxi",
        backVi: flashcardsList[0]?.backVi || "Nghỉ ngơi",
        exampleZh: flashcardsList[0]?.exampleZh,
      };
    } else if (editorType === "fill_blank") {
      base.content = blankSentence;
      base.correctAnswer = blankAnswers[0]?.answer || "";
      base.blanks = blankAnswers;
    } else if (editorType === "sentence_order") {
      base.content = "Sắp xếp các thẻ từ sau thành câu tiếng Trung hoàn chỉnh:";
      base.tokens = orderingTokens.map((t) => t.text);
      base.correctOrder = orderingTokens.map((t) => t.text);
      base.sampleAnswer = orderingSentence;
    } else if (editorType === "true_false") {
      base.content = tfStatement;
      base.correctAnswer = tfAnswer === "TRUE" ? "DUNG" : "SAI";
    } else if (editorType === "handwriting_photo") {
      base.content = `Chép mỗi từ sau ${hwRepeatCount} lần vào vở ô mễ: ${hwWordsList}. Sau đó chụp ảnh trang viết rõ nét và tải lên.`;
      base.handwritingCount = hwRepeatCount;
      base.rubric = hwRubric;
      base.sampleAnswer = hwWordsList;
    } else if (editorType === "essay") {
      base.content = essayPrompt;
      base.sampleAnswer = essaySample;
      base.rubric = editorRubric || "Đúng chủ đề (5đ), Ngữ pháp chính xác (5đ), Diễn đạt mạch lạc (5đ).";
    } else if (editorType === "translation") {
      base.content = transSource;
      base.translationDirection = transDirection;
      base.sampleAnswer = transReference;
      base.explanation = transAlternatives ? `Bản dịch khác: ${transAlternatives}` : undefined;
    } else if (editorType === "find_error") {
      base.content = errorSentenceTokens.map((t) => t.text).join(" ");
      base.errorTokens = errorSentenceTokens;
      base.sampleAnswer = errorCorrectSentence;
    } else if (editorType === "listening_choice") {
      base.content = listenQuestion;
      base.audioUrl = listenAudioUrl;
      base.options = listenOptions;
      base.correctAnswer = listenCorrect;
      base.sampleAnswer = listenTranscript;
      base.maxAudioPlays = listenMaxPlays;
    } else if (editorType === "listening_fill") {
      base.content = listenFillTranscript;
      base.audioUrl = listenFillAudioUrl;
      base.correctAnswer = listenFillAnswer;
      base.sampleAnswer = listenFillTranscript;
    }

    return base;
  };

  // =========================================================================
  // 4 STANDARDIZED SAVE ACTIONS (EXAM-006 SPECIFICATION)
  // =========================================================================
  // NÚT 1: LƯU NHÁP (Draft: can be incomplete, saved to Bank as DRAFT, NOT in exam)
  const handleSaveDraft = () => {
    setSaveStatus("SAVING");
    setTimeout(() => {
      const draftQ = buildQuestionObject("DRAFT");
      setQuestionBank((prev) => {
        const idx = prev.findIndex((q) => q.id === draftQ.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = draftQ;
          return next;
        }
        return [draftQ, ...prev];
      });
      setEditingQuestionId(draftQ.id);
      setSaveStatus("SAVED");
      showToast("Đã lưu bản nháp vào Kho câu hỏi của tôi! Bạn có thể tiếp tục chỉnh sửa.");
    }, 250);
  };

  // NÚT 2: LƯU VÀO KHO CỦA TÔI (Ready: validated, saved to Bank as READY, NOT in exam)
  const handleSaveToBank = () => {
    const check = validateQuestionByType();
    if (!check.valid) {
      setSaveStatus("FAILED");
      showToast(`Chưa thể lưu: ${check.error}`);
      return;
    }
    setSaveStatus("SAVING");
    setTimeout(() => {
      const readyQ = buildQuestionObject("READY");
      setQuestionBank((prev) => {
        const idx = prev.findIndex((q) => q.id === readyQ.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = readyQ;
          return next;
        }
        return [readyQ, ...prev];
      });
      setEditingQuestionId(readyQ.id);
      setSaveStatus("SAVED");
      showToast("Đã lưu câu hỏi hoàn thiện vào Kho câu hỏi của tôi!");
      if (onNavigateToQuestionBank) {
        setIsAddQuestionChoiceOpen(false);
        onNavigateToQuestionBank("READY");
      }
    }, 250);
  };

  // NÚT 3: LƯU VÀO KHO & TẠO CÂU TIẾP THEO (PHẦN A SPECIFICATION)
  const handleSaveAndCreateNext = () => {
    // 1. Kiểm tra câu hỏi theo form tương ứng trong 12 dạng
    const check = validateQuestionByType();
    // 2. Nếu chưa hợp lệ, hiển thị lỗi và không mở câu mới
    if (!check.valid) {
      setSaveStatus("FAILED");
      showToast(`Chưa thể tạo câu tiếp: ${check.error}`);
      return;
    }

    // 3. Nếu hợp lệ, gửi yêu cầu lưu
    setSaveStatus("SAVING");
    setTimeout(() => {
      // 5. Lưu câu hỏi vào Kho câu hỏi của tôi với trạng thái READY
      const readyQ = buildQuestionObject("READY");
      // 6. Giữ đúng ID câu hỏi vừa lưu để không bị tạo trùng
      setQuestionBank((prev) => {
        const idx = prev.findIndex((q) => q.id === readyQ.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = readyQ;
          return next;
        }
        return [readyQ, ...prev];
      });

      // 7. Hiển thị thông báo đã lưu thành công
      showToast(`Đã lưu câu hỏi "${readyQ.title}" vào Kho của tôi! Mở phiên soạn câu mới.`);

      // 8. Tạo phiên soạn câu mới, không copy nội dung/đáp án cũ, trạng thái CLEAN
      resetEditorForCleanState(editorType);
    }, 250);
  };

  // NÚT 4: LƯU VÀO KHO & THÊM VÀO ĐỀ (Ready: saves to Bank AND adds to current draft exam)
  const handleSaveAndAddToExam = () => {
    const check = validateQuestionByType();
    if (!check.valid) {
      setSaveStatus("FAILED");
      showToast(`Lỗi: ${check.error}`);
      return;
    }
    setSaveStatus("SAVING");
    setTimeout(() => {
      const readyQ = buildQuestionObject("READY");
      // 1. Save to Bank
      setQuestionBank((prev) => {
        const idx = prev.findIndex((q) => q.id === readyQ.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = readyQ;
          return next;
        }
        return [readyQ, ...prev];
      });

      // 2. Add to Exam
      setDraftQuestions((prev) => {
        const exists = prev.some((item) => item.id === readyQ.id);
        if (exists) {
          return prev.map((item) => (item.id === readyQ.id ? readyQ : item));
        }
        return [...prev, readyQ];
      });

      setEditingQuestionId(null);
      setSaveStatus("SAVED");
      setIsAddQuestionChoiceOpen(false);
      setActiveFlow("CHOICE");
      showToast(`Đã lưu vào kho và thêm câu hỏi vào đề kiểm tra thành công!`);
    }, 250);
  };

  // FLOW C: Load template into editor for customization (DOES NOT add to exam or bank directly)
  const handleLoadTemplateIntoEditor = (tpl: ExamQuestionItem) => {
    handleSwitchEditorType(tpl.type);
    setEditorTitle(`[Tùy chỉnh từ mẫu] ${tpl.title}`);
    setActiveFlow("FLOW_B");
    showToast(`Đã nạp bản sao mẫu "${tpl.title}" vào trình soạn. Hãy tùy chỉnh nội dung và bấm Lưu!`);
  };

  // =========================================================================
  // MANUAL GRADING (Chờ chấm) STATE
  // =========================================================================
  const [waitingSubmissions, setWaitingSubmissions] = useState<StudentSubmissionItem[]>(() => {
    return submissions.filter((s) => s.gradingStatus === "WAITING_MANUAL" || s.gradingStatus === "GRADING");
  });

  useEffect(() => {
    setWaitingSubmissions(
      submissions.filter((s) => s.gradingStatus === "WAITING_MANUAL" || s.gradingStatus === "GRADING")
    );
  }, [submissions]);
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

  // Backward compatibility alias
  const handleSaveManualQuestion = (addToDraft = true) => {
    if (addToDraft) {
      handleSaveAndAddToExam();
    } else {
      handleSaveToBank();
    }
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
      assignedAt: new Date().toLocaleDateString("vi-VN"),
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

  // =========================================================================
  // SUBMISSION, ASSIGNMENT & GRADING WORKFLOW HANDLERS (SECTIONS C, E, F, G, H)
  // =========================================================================

  // Filtered Submissions (Section E2)
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      if (subFilterClass !== "ALL" && s.classId !== subFilterClass) return false;
      if (subFilterExam !== "ALL" && s.assignmentTitle !== subFilterExam) return false;
      if (subFilterSubmissionStatus !== "ALL" && s.submissionStatus !== subFilterSubmissionStatus) return false;
      if (subFilterGradingStatus !== "ALL" && s.gradingStatus !== subFilterGradingStatus) return false;
      if (
        subSearchQuery.trim() !== "" &&
        !s.studentName.toLowerCase().includes(subSearchQuery.toLowerCase()) &&
        !s.className.toLowerCase().includes(subSearchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [submissions, subFilterClass, subFilterExam, subFilterSubmissionStatus, subFilterGradingStatus, subSearchQuery]);

  // Submit manual grading (Section F & H)
  const handleCompleteGrading = (action: "SAVE_DRAFT" | "SUBMIT_GRADE" | "REQUEST_RESUBMIT" | "PUBLISH") => {
    if (!gradingSubmission) return;

    if (action === "REQUEST_RESUBMIT") {
      setResubmitTargetSub(gradingSubmission);
      setIsResubmitModalOpen(true);
      return;
    }

    // Calculate manual total score
    const manualTotal = Object.values(gradingScores).reduce((a, b) => a + (Number(b) || 0), 0);
    const finalScore = Math.min(gradingSubmission.maxScore, gradingSubmission.autoScore + manualTotal);

    // Update submission record
    const updatedSub: StudentSubmissionItem = {
      ...gradingSubmission,
      manualScore: manualTotal,
      totalScore: finalScore,
      gradingStatus: action === "PUBLISH" ? "PUBLISHED" : action === "SUBMIT_GRADE" ? "GRADED" : "GRADING",
      status: action === "PUBLISH" ? "PUBLISHED" : action === "SUBMIT_GRADE" ? "GRADED" : "WAITING_GRADE",
      isPublished: action === "PUBLISH" ? true : gradingSubmission.isPublished,
      publishedAt: action === "PUBLISH" ? new Date().toLocaleDateString("vi-VN") : gradingSubmission.publishedAt,
      gradedAt: new Date().toLocaleDateString("vi-VN"),
      gradedBy: currentUser?.name || "Giáo viên Hanyu",
      manualQuestions: gradingSubmission.manualQuestions.map((mq) => ({
        ...mq,
        awardedPoints: gradingScores[mq.questionId] ?? mq.awardedPoints ?? 0,
        teacherComment: gradingComments[mq.questionId] ?? mq.teacherComment ?? "",
      })),
    };

    setSubmissions((prev) => prev.map((s) => (s.id === updatedSub.id ? updatedSub : s)));

    // Update corresponding assignment counter if present
    if (action === "SUBMIT_GRADE" || action === "PUBLISH") {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === updatedSub.assignmentId
            ? { ...a, waitingGradeCount: Math.max(0, a.waitingGradeCount - 1) }
            : a
        )
      );
    }

    if (action === "PUBLISH") {
      showToast(`Đã công bố điểm cho học viên ${gradingSubmission.studentName} (Tổng: ${finalScore}/${gradingSubmission.maxScore}đ)!`);
      setGradingSubmission(null);
    } else if (action === "SUBMIT_GRADE") {
      showToast(`Đã hoàn tất chấm điểm bài nộp của học viên ${gradingSubmission.studentName}!`);
      setGradingSubmission(null);
    } else {
      showToast("Đã lưu nháp tiến trình chấm điểm thành công!");
    }
  };

  // Confirm resubmission request
  const handleConfirmResubmit = () => {
    if (!resubmitTargetSub) return;
    const reason = resubmitReasonText.trim() || "Yêu cầu nộp lại bài do cần bổ sung hoặc chỉnh sửa.";

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === resubmitTargetSub.id
          ? {
              ...s,
              submissionStatus: "RESUBMISSION_REQUIRED",
              status: "REQUEST_RESUBMIT",
              resubmitReason: reason,
            }
          : s
      )
    );

    showToast(`Đã gửi yêu cầu nộp lại bài cho học viên ${resubmitTargetSub.studentName}!`);
    setIsResubmitModalOpen(false);
    setResubmitTargetSub(null);
    setResubmitReasonText("");
    if (gradingSubmission?.id === resubmitTargetSub.id) {
      setGradingSubmission(null);
    }
  };

  // Bulk Publish Submissions (Section H1)
  const handleBulkPublishSubmissions = () => {
    const readyToPublish = submissions.filter((s) => s.gradingStatus === "GRADED" && !s.isPublished);
    if (readyToPublish.length === 0) {
      showToast("Không có bài nộp nào đang ở trạng thái 'Đã chấm' chờ công bố!");
      return;
    }

    setSubmissions((prev) =>
      prev.map((s) =>
        s.gradingStatus === "GRADED"
          ? {
              ...s,
              isPublished: true,
              gradingStatus: "PUBLISHED",
              status: "PUBLISHED",
              publishedAt: new Date().toLocaleDateString("vi-VN"),
            }
          : s
      )
    );

    showToast(`Đã công bố kết quả hàng loạt thành công cho ${readyToPublish.length} bài nộp!`);
  };

  // Single Publish (Section H1)
  const handleSinglePublish = (subId: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === subId
          ? {
              ...s,
              isPublished: true,
              gradingStatus: "PUBLISHED",
              status: "PUBLISHED",
              publishedAt: new Date().toLocaleDateString("vi-VN"),
            }
          : s
      )
    );
    showToast("Đã công bố kết quả bài làm cho học viên!");
  };

  // Navigate next / prev student in grading modal (Section F1)
  const handleNavigateStudent = (direction: "PREV" | "NEXT") => {
    if (!gradingSubmission || filteredSubmissions.length <= 1) return;
    const currentIdx = filteredSubmissions.findIndex((s) => s.id === gradingSubmission.id);
    let nextIdx = direction === "NEXT" ? currentIdx + 1 : currentIdx - 1;
    if (nextIdx < 0) nextIdx = filteredSubmissions.length - 1;
    if (nextIdx >= filteredSubmissions.length) nextIdx = 0;

    const nextStudent = filteredSubmissions[nextIdx];
    setGradingSubmission(nextStudent);
    // Pre-populate scores and comments
    const initialScores: Record<string, number> = {};
    const initialComments: Record<string, string> = {};
    nextStudent.manualQuestions.forEach((mq) => {
      if (mq.awardedPoints !== undefined) initialScores[mq.questionId] = mq.awardedPoints;
      if (mq.teacherComment) initialComments[mq.questionId] = mq.teacherComment;
    });
    setGradingScores(initialScores);
    setGradingComments(initialComments);
  };

  // Start grading a specific student
  const handleStartGrading = (sub: StudentSubmissionItem) => {
    setGradingSubmission(sub);
    const initialScores: Record<string, number> = {};
    const initialComments: Record<string, string> = {};
    sub.manualQuestions.forEach((mq) => {
      if (mq.awardedPoints !== undefined) {
        initialScores[mq.questionId] = mq.awardedPoints;
      }
      if (mq.teacherComment) {
        initialComments[mq.questionId] = mq.teacherComment;
      }
    });
    setGradingScores(initialScores);
    setGradingComments(initialComments);
  };

  // OPEN ASSIGN MODAL (Section C1)
  const handleOpenAssignModal = (pkg?: ExamPackageItem) => {
    if (pkg) {
      setAssigningExam(pkg);
    } else {
      setAssigningExam(null);
    }
    setAssignClassId(classesList[0]?.id || "c1");
    setAssignOpenDate(new Date().toISOString().split("T")[0]);
    setAssignDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setAssignDurationMin(45);
    setIsAssignModalOpen(true);
  };

  // CONFIRM ASSIGN EXAM (Section C2)
  const handleConfirmAssignExam = () => {
    if (assignDueDate < assignOpenDate) {
      showToast("Hạn nộp bài phải sau hoặc bằng ngày mở bài!");
      return;
    }

    const targetClasses = classesList.filter((c) =>
      assignClassIds.length > 0 ? assignClassIds.includes(c.id) : c.id === assignClassId
    );

    if (targetClasses.length === 0) {
      showToast("Vui lòng chọn ít nhất một lớp học để giao đề!");
      return;
    }

    const examName = assigningExam ? assigningExam.title : examTitle.trim() || "Bài tập mới";
    const totalQ = assigningExam ? assigningExam.questionsCount : draftQuestions.length;
    const totalPts = assigningExam ? assigningExam.totalPoints : totalExamPoints;
    const isScheduled = assignOpenDate > new Date().toISOString().split("T")[0];

    const newAssignmentItems = targetClasses.map((cls, idx) => ({
      id: `ass-${Date.now()}-${idx}`,
      title: examName,
      className: cls.name || "Lớp học",
      classId: cls.id,
      assignedAt: new Date().toLocaleDateString("vi-VN"),
      dueAt: `${assignDueDate} 23:59`,
      durationMin: Number(assignDurationMin) || 45,
      submittedCount: 0,
      totalStudents: cls.studentCount || 20,
      status: isScheduled ? "SCHEDULED" : "ACTIVE",
      waitingGradeCount: 0,
      totalQuestions: totalQ,
      totalPoints: totalPts,
    }));

    setAssignments([...newAssignmentItems, ...assignments]);

    // Update questions usages in question bank
    const questionsToMark = assigningExam ? assigningExam.questions : draftQuestions;
    if (questionsToMark && questionsToMark.length > 0) {
      const qIds = new Set(questionsToMark.map((q) => q.id));
      setQuestionBank((prev) =>
        prev.map((q) => {
          if (qIds.has(q.id)) {
            return {
              ...q,
              usedInExamCount: (q.usedInExamCount || 0) + newAssignmentItems.length,
              usedInExams: [
                ...(q.usedInExams || []),
                ...newAssignmentItems.map((item) => ({
                  id: item.id,
                  title: item.title,
                  status: "ACTIVE" as const,
                  className: item.className,
                  updatedAt: new Date().toLocaleDateString("vi-VN"),
                })),
              ],
            };
          }
          return q;
        })
      );
    }

    setIsAssignModalOpen(false);
    setActiveTab("ALL");
    showToast(
      `Đã giao đề "${examName}" thành công cho ${newAssignmentItems.length} lớp học (${targetClasses
        .map((c) => c.name)
        .join(", ")})!`
    );
  };

  // 1. Lưu đề nháp (Spec Section 3.1 & 3.2)
  const handleSaveDraftExam = () => {
    setExamSaveStatus("SAVING");
    setTimeout(() => {
      const examId = currentExamId || `exam-draft-${Date.now()}`;
      const title = examTitle.trim() || `Đề nháp mới (${new Date().toLocaleDateString("vi-VN")})`;
      const nowFormatted =
        new Date().toLocaleDateString("vi-VN") +
        " " +
        new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

      const updatedPkg: ExamPackageItem = {
        id: examId,
        title,
        description: examDescription.trim() || "Bộ đề biên soạn từ kho câu hỏi",
        curriculum: examCurriculum,
        hskLevel: examLevel,
        status: "DRAFT",
        questionsCount: draftQuestions.length,
        totalPoints: totalExamPoints,
        createdAt: examPackages.find((p) => p.id === examId)?.createdAt || nowFormatted,
        updatedAt: nowFormatted,
        questions: [...draftQuestions],
      };

      setCurrentExamId(examId);
      setExamPackages((prev) => {
        const idx = prev.findIndex((p) => p.id === examId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedPkg;
          return next;
        }
        return [updatedPkg, ...prev];
      });

      // Background sync to backend API
      try {
        fetch("/api/v1/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: updatedPkg.title,
            description: updatedPkg.description,
            curriculum: updatedPkg.curriculum,
            hskLevel: updatedPkg.hskLevel,
            totalScore: updatedPkg.totalPoints,
            status: "DRAFT",
            questions: updatedPkg.questions,
          }),
        }).catch(() => {});
      } catch (e) {}

      setExamSaveStatus("SAVED");
      showToast(`Đã lưu đề nháp "${title}" thành công! Có thể xem trong Tab Đề nháp.`);
    }, 200);
  };

  // 2. Hoàn thiện đề (Chuyển sang READY và mở giao bài)
  const handleFinalizeExam = (targetPkg?: ExamPackageItem) => {
    const questionsToFinalize = targetPkg ? targetPkg.questions || [] : draftQuestions;
    if (questionsToFinalize.length === 0) {
      showToast("Vui lòng thêm ít nhất 1 câu hỏi vào đề trước khi hoàn thiện/giao lớp!");
      return;
    }
    const examId = targetPkg ? targetPkg.id : currentExamId || `exam-ready-${Date.now()}`;
    const title = targetPkg ? targetPkg.title : examTitle.trim() || `Đề hoàn thiện HSK ${examLevel}`;
    const nowFormatted =
      new Date().toLocaleDateString("vi-VN") +
      " " +
      new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    const readyPkg: ExamPackageItem = {
      id: examId,
      title,
      description: targetPkg ? targetPkg.description : examDescription.trim() || "Bộ đề đã hoàn thiện",
      curriculum: targetPkg ? targetPkg.curriculum : examCurriculum,
      hskLevel: targetPkg ? targetPkg.hskLevel : examLevel,
      status: "READY",
      questionsCount: questionsToFinalize.length,
      totalPoints: questionsToFinalize.reduce((sum, q) => sum + (q.points || 5), 0),
      createdAt: targetPkg?.createdAt || nowFormatted,
      updatedAt: nowFormatted,
      questions: [...questionsToFinalize],
    };

    setExamPackages((prev) => {
      const filtered = prev.filter((p) => p.id !== examId);
      return [readyPkg, ...filtered];
    });

    showToast(`Đã hoàn thiện đề "${title}"! Sẵn sàng giao cho lớp.`);
    handleOpenAssignModal(readyPkg);
  };

  // 3. Tiếp tục soạn đề nháp
  const handleResumeDraft = (pkg: ExamPackageItem) => {
    setCurrentExamId(pkg.id);
    setExamTitle(pkg.title);
    setExamDescription(pkg.description);
    setExamCurriculum(pkg.curriculum || "HSK 3.0");
    setExamLevel(pkg.hskLevel || 1);
    setDraftQuestions(pkg.questions || []);
    setViewMode("COMPOSER");
    setComposerStep(1);
    setExamSaveStatus("CLEAN");
    showToast(`Đã mở đề nháp "${pkg.title}" vào trình ghép đề!`);
  };

  // Clone Exam Package
  const handleCloneExamPackage = (pkg: ExamPackageItem) => {
    const clone: ExamPackageItem = {
      ...pkg,
      id: `pkg-${Date.now()}`,
      title: `[Bản sao] ${pkg.title}`,
      status: "DRAFT",
      createdAt: new Date().toLocaleDateString("vi-VN"),
      updatedAt: new Date().toLocaleDateString("vi-VN"),
    };
    setExamPackages([clone, ...examPackages]);
    showToast(`Đã nhân bản đề "${pkg.title}" thành công!`);
  };

  // Delete Exam Package
  const handleDeleteExamPackage = (pkgId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa đề này không? Các câu hỏi trong kho vẫn được giữ nguyên.")) {
      setExamPackages(examPackages.filter((p) => p.id !== pkgId));
      showToast("Đã xóa đề thành công!");
    }
  };

  // Archive / Restore Exam Package
  const handleToggleArchivePackage = (pkgId: string, archive: boolean) => {
    setExamPackages(
      examPackages.map((p) => (p.id === pkgId ? { ...p, status: archive ? "ARCHIVED" : "READY" } : p))
    );
    showToast(archive ? "Đã chuyển đề vào mục Lưu trữ!" : "Đã khôi phục đề về danh sách hoàn thiện!");
  };

  // Archive / Restore Assignment
  const handleToggleArchiveAssignment = (assId: string, archive: boolean) => {
    setAssignments(
      assignments.map((a) => (a.id === assId ? { ...a, status: archive ? "ARCHIVED" : "ACTIVE" } : a))
    );
    showToast(
      archive
        ? "Đã lưu trữ lần giao bài! Toàn bộ lịch sử điểm và bài nộp học viên vẫn được giữ nguyên."
        : "Đã khôi phục bài đã giao về trạng thái hoạt động!"
    );
  };

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
                      Chuẩn P1 V2.0
                    </span>
                  </h1>
                  <p className="text-xs text-[#315E48]">
                    Quản lý đề thi, giao bài cho lớp, theo dõi bài nộp và chấm điểm 12 dạng câu hỏi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const target = assignments.find((a) => a.status === "ACTIVE" || a.status === "OPEN") || assignments[0];
                    setQrAssignment({
                      id: target?.id || "exam-01",
                      title: target?.title || "Phòng thi chuẩn HSK 3.0",
                      className: target?.className || "Lớp HSK1 - K01",
                    });
                    setIsQrModalOpen(true);
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] bg-[#FFFCF6] hover:bg-[#FAF7F0] text-[#204434] text-xs font-bold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-[#BC9B6B]" />
                  <span>Mã QR phòng thi</span>
                </button>
                <button
                  onClick={() => handleOpenAssignModal()}
                  className="px-3.5 py-2.5 rounded-xl border border-[#BC9B6B] bg-[#FFFCF6] hover:bg-[#FAF7F0] text-[#8F6D3B] text-xs font-bold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#8F6D3B]" />
                  <span>Giao đề cho lớp</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode("COMPOSER");
                    setComposerStep(1);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4 text-[#BC9B6B]" />
                  <span>+ Soạn đề bài mới</span>
                </button>
              </div>
            </div>

            {/* BỘ ĐẾM THỐNG KÊ CHUẨN (SPEC SECTION 2.1) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] space-y-1 shadow-2xs">
                <span className="text-[11px] text-[#315E48] font-medium block">Tổng số đề bài</span>
                <p className="text-2xl font-serif font-bold text-[#204434]">{kpiMetrics.totalExams}</p>
                <span className="text-[10px] text-[#315E48]/70">Đang quản lý</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] space-y-1 shadow-2xs">
                <span className="text-[11px] text-[#315E48] font-medium block">Đang mở cho học viên</span>
                <p className="text-2xl font-serif font-bold text-emerald-700">{kpiMetrics.totalOpen}</p>
                <span className="text-[10px] text-emerald-700 font-medium">Đang nhận bài</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFFCF6] to-[#FFF9EE] border border-[#BC9B6B]/60 space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#8F6D3B] font-bold block">Chờ chấm thủ công</span>
                  <span className="w-2 h-2 rounded-full bg-[#BC9B6B] animate-pulse" />
                </div>
                <p className="text-2xl font-serif font-bold text-[#8F6D3B]">{kpiMetrics.totalWaitingGrade}</p>
                <span className="text-[10px] text-[#8F6D3B]">Tự luận, chép từ nộp ảnh</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] space-y-1 shadow-2xs">
                <span className="text-[11px] text-[#315E48] font-medium block">Đã đóng hạn nộp</span>
                <p className="text-2xl font-serif font-bold text-gray-600">{kpiMetrics.totalClosed}</p>
                <span className="text-[10px] text-gray-500">Đã khóa bài nộp</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-amber-200 space-y-1 shadow-2xs">
                <span className="text-[11px] text-amber-800 font-medium block">Đề nháp (Đang soạn)</span>
                <p className="text-2xl font-serif font-bold text-amber-700">{kpiMetrics.totalDrafts}</p>
                <span className="text-[10px] text-amber-700">Chưa giao lớp</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-emerald-200 space-y-1 shadow-2xs">
                <span className="text-[11px] text-emerald-800 font-medium block">Đã chấm & Công bố</span>
                <p className="text-2xl font-serif font-bold text-[#204434]">{kpiMetrics.totalPublished}</p>
                <span className="text-[10px] text-emerald-700">Học viên đã xem</span>
              </div>
            </div>

            {/* THANH TAB CHUẨN THEO ĐẶC TẢ SECTION 2.1 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  {
                    id: "ALL",
                    label: `Tất cả đề (${assignments.filter((a) => a.status !== "ARCHIVED").length})`,
                  },
                  {
                    id: "OPEN",
                    label: `Đang mở (${assignments.filter((a) => a.status === "ACTIVE" || a.status === "OPEN").length})`,
                  },
                  {
                    id: "SUBMISSIONS",
                    label: `Chờ chấm (${kpiMetrics.totalWaitingGrade})`,
                    highlight: kpiMetrics.totalWaitingGrade > 0,
                  },
                  {
                    id: "CLOSED",
                    label: `Đã đóng (${assignments.filter((a) => a.status === "CLOSED").length})`,
                  },
                  {
                    id: "DRAFT_EXAMS",
                    label: `Đề nháp (${kpiMetrics.totalDrafts})`,
                    isDraftTab: true,
                  },
                  {
                    id: "READY_EXAMS",
                    label: `Đề đã hoàn thiện (${kpiMetrics.totalReady})`,
                  },
                  {
                    id: "ARCHIVED",
                    label: `Lưu trữ (${assignments.filter((a) => a.status === "ARCHIVED").length + examPackages.filter((p) => p.status === "ARCHIVED").length})`,
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                      activeTab === t.id
                        ? "bg-[#204434] text-white shadow-xs"
                        : t.highlight
                        ? "bg-[#BC9B6B]/20 text-[#8F6D3B] border border-[#BC9B6B]/40 hover:bg-[#BC9B6B]/30"
                        : t.isDraftTab
                        ? "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                        : "bg-[#FFFCF6] text-[#204434] border border-[#E5DEC9] hover:bg-[#F3EEDD]"
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {activeTab !== "SUBMISSIONS" && (
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
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* TAB: BẢN NHÁP ĐỀ (DRAFT_EXAMS) - BẢNG ĐẶC TẢ SECTION 2.1 & 2.2 */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "DRAFT_EXAMS" && (
              <div className="space-y-4">
                <div className="rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E5DEC9] bg-[#FAF7F0] text-[#315E48] font-bold text-[11px]">
                        <th className="py-3.5 px-4">Tên đề bài / Mô tả</th>
                        <th className="py-3.5 px-4">Chương trình</th>
                        <th className="py-3.5 px-4">Số câu / Tổng điểm</th>
                        <th className="py-3.5 px-4">Cập nhật</th>
                        <th className="py-3.5 px-4">Trạng thái</th>
                        <th className="py-3.5 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DEC9]/50">
                      {examPackages
                        .filter((p) => p.status === "DRAFT")
                        .filter((p) =>
                          searchQuery.trim() === ""
                            ? true
                            : p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.description.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((pkg) => (
                          <tr key={pkg.id} className="hover:bg-[#FAF7F0]/60 transition">
                            <td className="py-3.5 px-4 max-w-xs">
                              <p className="font-bold text-[#204434] text-xs">{pkg.title}</p>
                              <p className="text-[11px] text-[#315E48] line-clamp-1">{pkg.description}</p>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-[#8F6D3B]">
                              HSK {pkg.hskLevel} ({pkg.curriculum})
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-[#204434]">{pkg.questionsCount} câu</span>
                              <span className="text-[#315E48]"> · {pkg.totalPoints}đ</span>
                            </td>
                            <td className="py-3.5 px-4 text-[#315E48] text-[11px]">{pkg.updatedAt}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                                <span>Đang soạn</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleResumeDraft(pkg)}
                                  className="px-3 py-1.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-xs shadow-2xs flex items-center gap-1 transition"
                                  title="Tiếp tục chỉnh sửa câu hỏi trong đề nháp này"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#BC9B6B]" />
                                  <span>Tiếp tục soạn</span>
                                </button>
                                <button
                                  onClick={() => setPreviewingExam(pkg)}
                                  className="p-1.5 rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-[#315E48]"
                                  title="Xem trước đề thi"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (pkg.questionsCount === 0) {
                                      showToast("Đề chưa có câu hỏi nào! Hãy bấm 'Tiếp tục soạn' để thêm câu hỏi trước.");
                                      return;
                                    }
                                    handleOpenAssignModal(pkg);
                                  }}
                                  className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1 transition ${
                                    pkg.questionsCount > 0
                                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                                      : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                  }`}
                                  title={pkg.questionsCount > 0 ? "Hoàn thiện và Giao cho lớp" : "Cần có ít nhất 1 câu hỏi để giao"}
                                >
                                  <Send className="w-3 h-3 text-emerald-700" />
                                  <span>Giao lớp</span>
                                </button>
                                <button
                                  onClick={() => handleCloneExamPackage(pkg)}
                                  className="p-1.5 rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-[#315E48]"
                                  title="Nhân bản thành đề nháp mới"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmPackage(pkg)}
                                  className="p-1.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600"
                                  title="Xóa đề nháp an toàn (không xóa câu gốc trong kho)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {examPackages.filter((p) => p.status === "DRAFT").length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-xs text-[#8ea394]">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-[#8ea394]/50" />
                            <p className="font-semibold text-[#315E48]">Chưa có đề nháp nào đang soạn</p>
                            <p className="text-[11px] text-[#8ea394] mt-0.5">Hãy tạo đề kiểm tra mới hoặc lưu nháp từ Ngân hàng câu hỏi</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {examPackages.filter((p) => p.status === "DRAFT").length === 0 && (
                    <div className="p-12 text-center space-y-3">
                      <FileText className="w-10 h-10 mx-auto text-[#BC9B6B]" />
                      <p className="font-serif font-bold text-sm text-[#204434]">Bạn chưa có đề nháp nào</p>
                      <p className="text-xs text-[#315E48] max-w-md mx-auto">
                        Đề nháp được tự động lưu khi bạn bấm "+ Soạn đề bài mới" hoặc chọn "Thêm vào đề" từ Kho câu hỏi của tôi.
                      </p>
                      <button
                        onClick={() => {
                          setCurrentExamId(null);
                          setExamTitle("");
                          setExamDescription("");
                          setDraftQuestions([]);
                          setViewMode("COMPOSER");
                          setComposerStep(1);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 hover:bg-[#183629]"
                      >
                        <Plus className="w-4 h-4 text-[#BC9B6B]" />
                        <span>+ Tạo đề mới</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: ĐỀ ĐÃ HOÀN THIỆN (READY_EXAMS) */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "READY_EXAMS" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {examPackages
                    .filter((p) => p.status === "READY")
                    .map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-3 hover:border-[#204434] transition flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Sẵn sàng giao
                            </span>
                            <span className="text-[11px] text-[#315E48]">Cập nhật: {pkg.updatedAt}</span>
                          </div>
                          <h4 className="font-serif font-bold text-base text-[#204434]">{pkg.title}</h4>
                          <p className="text-xs text-[#315E48] line-clamp-2">{pkg.description}</p>
                          <div className="flex items-center gap-3 text-xs text-[#315E48] font-medium pt-1">
                            <span className="font-bold text-[#204434]">HSK {pkg.hskLevel}</span>
                            <span>•</span>
                            <span>{pkg.questionsCount} câu</span>
                            <span>•</span>
                            <span className="font-bold text-[#8F6D3B]">{pkg.totalPoints} điểm</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setPreviewingExam(pkg)}
                              className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48]"
                              title="Xem đề"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setExamTitle(pkg.title);
                                setExamDescription(pkg.description);
                                setViewMode("COMPOSER");
                                setComposerStep(1);
                              }}
                              className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48]"
                              title="Chỉnh sửa đề"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCloneExamPackage(pkg)}
                              className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48]"
                              title="Nhân bản đề"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleArchivePackage(pkg.id, true)}
                              className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48]"
                              title="Lưu trữ đề"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleOpenAssignModal(pkg)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-xs shadow-2xs transition flex items-center gap-1"
                          >
                            <Send className="w-3 h-3 text-[#BC9B6B]" />
                            <span>Giao cho lớp</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {examPackages.filter((p) => p.status === "READY").length === 0 && (
                      <div className="col-span-full py-12 text-center text-xs text-[#8ea394] bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-[#8ea394]/50" />
                        <p className="font-semibold text-[#315E48]">Chưa có đề thi nào đã hoàn thiện</p>
                        <p className="text-[11px] text-[#8ea394] mt-0.5">Sau khi biên soạn đề nháp xong, bấm "Đánh dấu hoàn thiện" để lưu vào đây</p>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB BÀI ĐÃ GIAO (ALL / OPEN / CLOSED) */}
            {/* ------------------------------------------------------------- */}
            {(activeTab === "ALL" || activeTab === "OPEN" || activeTab === "CLOSED") && (
              <div className="rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5DEC9] bg-[#FAF7F0] text-[#315E48] font-bold text-[11px]">
                      <th className="py-3 px-4">Tên đề bài / Bài tập</th>
                      <th className="py-3 px-4">Lớp nhận</th>
                      <th className="py-3 px-4">Ngày giao</th>
                      <th className="py-3 px-4">Hạn nộp</th>
                      <th className="py-3 px-4">Được giao</th>
                      <th className="py-3 px-4">Đã nộp / Chưa nộp</th>
                      <th className="py-3 px-4">Chờ chấm</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DEC9]/50">
                    {assignments
                      .filter((a) => a.status !== "ARCHIVED")
                      .filter((a) => {
                        if (activeTab === "OPEN") return a.status === "ACTIVE" || a.status === "OPEN";
                        if (activeTab === "CLOSED") return a.status === "CLOSED";
                        return true;
                      })
                      .filter((a) =>
                        searchQuery.trim() === ""
                          ? true
                          : a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            a.className.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((a) => {
                        const unsubmitted = Math.max(0, a.totalStudents - a.submittedCount);
                        return (
                          <tr key={a.id} className="hover:bg-[#FAF7F0]/60 transition">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-[#204434] text-xs">{a.title}</p>
                              <span className="text-[10px] text-[#8F6D3B]">
                                {a.totalQuestions} câu · {a.totalPoints}đ · {a.durationMin} phút
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-[#204434]">{a.className}</td>
                            <td className="py-3.5 px-4 text-[#315E48] font-mono">{a.assignedAt || "20/10/2026"}</td>
                            <td className="py-3.5 px-4 text-[#315E48] font-mono">{a.dueAt}</td>
                            <td className="py-3.5 px-4 font-medium text-[#204434]">
                              {a.totalStudents} học viên
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-emerald-800">{a.submittedCount}</span>
                                <span className="text-[#315E48]">/</span>
                                <span className="text-gray-500 font-medium">{unsubmitted}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              {a.waitingGradeCount > 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  {a.waitingGradeCount} bài
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[11px]">—</span>
                              )}
                            </td>
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
                            <td className="py-3.5 px-4 text-right space-x-1.5">
                              <button
                                onClick={() => {
                                  setQrAssignment({
                                    id: a.id,
                                    title: a.title,
                                    className: a.className,
                                  });
                                  setIsQrModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-[#204434] font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                                title="Mã QR phòng thi & Giám sát"
                              >
                                <QrCode className="w-3.5 h-3.5 text-[#BC9B6B]" />
                                <span>Mã QR</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveTab("SUBMISSIONS");
                                  setSubFilterExam(a.title);
                                  setSubFilterClass(a.classId);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                              >
                                Xem bài nộp
                              </button>
                              <button
                                onClick={() =>
                                  showToast(`Phổ điểm: Đã có ${a.submittedCount} bài nộp, tỷ lệ hoàn thành ${Math.round((a.submittedCount / a.totalStudents) * 100)}%.`)
                                }
                                className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48] font-bold text-xs transition"
                              >
                                Xem kết quả
                              </button>
                              <button
                                onClick={() => handleToggleArchiveAssignment(a.id, true)}
                                className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48]"
                                title="Lưu trữ lần giao này"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    {assignments
                      .filter((a) => a.status !== "ARCHIVED")
                      .filter((a) => {
                        if (activeTab === "OPEN") return a.status === "ACTIVE" || a.status === "OPEN";
                        if (activeTab === "CLOSED") return a.status === "CLOSED";
                        return true;
                      })
                      .filter((a) =>
                        searchQuery.trim() === ""
                          ? true
                          : a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            a.className.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-xs text-[#8ea394]">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-[#8ea394]/50" />
                            <p className="font-semibold text-[#315E48]">Chưa có bài tập nào trong mục này</p>
                            <p className="text-[11px] text-[#8ea394] mt-0.5">Bấm "Tạo bài tập mới" để giao bài cho học sinh</p>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 4: BÀI NỘP & CHẤM ĐIỂM (SUBMISSIONS - SPEC SECTION E & F) */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "SUBMISSIONS" && (
              <div className="space-y-4">
                {/* TOOLBAR BỘ LỌC ĐA TIÊU CHÍ (SPEC SECTION E2) */}
                <div className="p-4 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    {/* Bộ lọc lớp */}
                    <div>
                      <label className="font-bold text-[#204434] block mb-1">Lớp học:</label>
                      <select
                        value={subFilterClass}
                        onChange={(e) => setSubFilterClass(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-medium"
                      >
                        <option value="ALL">Tất cả lớp học</option>
                        {classesList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bộ lọc đề */}
                    <div>
                      <label className="font-bold text-[#204434] block mb-1">Đề kiểm tra:</label>
                      <select
                        value={subFilterExam}
                        onChange={(e) => setSubFilterExam(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-medium truncate"
                      >
                        <option value="ALL">Tất cả đề bài</option>
                        {Array.from(new Set(submissions.map((s) => s.assignmentTitle))).map((title) => (
                          <option key={title} value={title}>
                            {title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Trạng thái nộp */}
                    <div>
                      <label className="font-bold text-[#204434] block mb-1">Trạng thái nộp:</label>
                      <select
                        value={subFilterSubmissionStatus}
                        onChange={(e) => setSubFilterSubmissionStatus(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-medium"
                      >
                        <option value="ALL">Tất cả nộp</option>
                        <option value="SUBMITTED">Đã nộp đúng hạn</option>
                        <option value="LATE_SUBMITTED">Đã nộp muộn</option>
                        <option value="RESUBMISSION_REQUIRED">Yêu cầu nộp lại</option>
                        <option value="NOT_STARTED">Chưa làm / Hết hạn</option>
                      </select>
                    </div>

                    {/* Trạng thái chấm */}
                    <div>
                      <label className="font-bold text-[#204434] block mb-1">Trạng thái chấm:</label>
                      <select
                        value={subFilterGradingStatus}
                        onChange={(e) => setSubFilterGradingStatus(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-medium"
                      >
                        <option value="ALL">Tất cả chấm</option>
                        <option value="WAITING_MANUAL">Chờ chấm thủ công</option>
                        <option value="GRADING">Đang chấm dở</option>
                        <option value="GRADED">Đã chấm xong</option>
                        <option value="PUBLISHED">Đã công bố điểm</option>
                      </select>
                    </div>

                    {/* Tìm học viên */}
                    <div>
                      <label className="font-bold text-[#204434] block mb-1">Tìm học viên:</label>
                      <input
                        type="text"
                        value={subSearchQuery}
                        onChange={(e) => setSubSearchQuery(e.target.value)}
                        placeholder="Tên học viên..."
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] placeholder-[#315E48]/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E5DEC9]/60 flex-wrap gap-2 text-xs">
                    <span className="text-[#315E48] font-medium">
                      Tìm thấy <strong className="text-[#204434]">{filteredSubmissions.length}</strong> bài nộp
                      phù hợp
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSubFilterClass("ALL");
                          setSubFilterExam("ALL");
                          setSubFilterSubmissionStatus("ALL");
                          setSubFilterGradingStatus("ALL");
                          setSubSearchQuery("");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-[#E5DEC9]/50 text-[#315E48] font-semibold"
                      >
                        Đặt lại bộ lọc
                      </button>
                      <button
                        onClick={handleBulkPublishSubmissions}
                        className="px-3.5 py-1.5 rounded-xl bg-[#BC9B6B] hover:bg-[#A88858] text-white font-bold flex items-center gap-1.5 shadow-2xs transition"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Công bố kết quả hàng loạt</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* BẢNG 11 CỘT DANH SÁCH BÀI NỘP (SPEC SECTION E3) */}
                <div className="rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E5DEC9] bg-[#FAF7F0] text-[#315E48] font-bold text-[11px]">
                        <th className="py-3 px-3">Học viên</th>
                        <th className="py-3 px-3">Lớp</th>
                        <th className="py-3 px-3">Tên đề</th>
                        <th className="py-3 px-2 text-center">Lần nộp</th>
                        <th className="py-3 px-3">Thời điểm nộp</th>
                        <th className="py-3 px-2 text-center">Số câu</th>
                        <th className="py-3 px-2 text-center">Tự chấm</th>
                        <th className="py-3 px-3">Chấm tay</th>
                        <th className="py-3 px-3 text-center">Tổng điểm</th>
                        <th className="py-3 px-3">Công bố</th>
                        <th className="py-3 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DEC9]/50">
                      {filteredSubmissions.map((sub) => {
                        const needsManualGrade =
                          sub.manualQuestions &&
                          sub.manualQuestions.length > 0 &&
                          (sub.gradingStatus === "WAITING_MANUAL" || sub.gradingStatus === "GRADING");
                        const isGraded = sub.gradingStatus === "GRADED" || sub.gradingStatus === "PUBLISHED";
                        const totalScoreDisplay =
                          sub.totalScore !== undefined
                            ? `${sub.totalScore}/${sub.maxScore}đ`
                            : `${sub.autoScore}/${sub.maxScore}đ (Tạm)`;

                        return (
                          <tr key={sub.id} className="hover:bg-[#FAF7F0]/60 transition">
                            {/* 1. Học viên */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={sub.studentAvatar}
                                  alt={sub.studentName}
                                  className="w-8 h-8 rounded-full object-cover border border-[#E5DEC9]"
                                />
                                <div>
                                  <p className="font-bold text-[#204434] leading-tight">{sub.studentName}</p>
                                  <span className="text-[10px] text-[#315E48]/80">{sub.studentId || "std"}</span>
                                </div>
                              </div>
                            </td>

                            {/* 2. Lớp */}
                            <td className="py-3 px-3 font-medium text-[#315E48]">{sub.className}</td>

                            {/* 3. Tên đề */}
                            <td className="py-3 px-3">
                              <p className="font-semibold text-[#204434] line-clamp-1 max-w-[180px]" title={sub.assignmentTitle}>
                                {sub.assignmentTitle}
                              </p>
                            </td>

                            {/* 4. Lần làm bài */}
                            <td className="py-3 px-2 text-center font-mono">
                              {sub.attemptNumber > 0 ? `Lần ${sub.attemptNumber}` : "—"}
                            </td>

                            {/* 5. Thời điểm nộp */}
                            <td className="py-3 px-3 font-mono text-[11px] text-[#315E48]">
                              <div>{sub.submittedAt}</div>
                              {sub.submissionStatus === "LATE_SUBMITTED" && (
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                                  Nộp muộn
                                </span>
                              )}
                              {sub.submissionStatus === "RESUBMISSION_REQUIRED" && (
                                <span className="text-[9px] font-bold text-red-700 bg-red-100 px-1.5 py-0.2 rounded">
                                  Yêu cầu nộp lại
                                </span>
                              )}
                            </td>

                            {/* 6. Số câu đã trả lời */}
                            <td className="py-3 px-2 text-center text-[#315E48]">
                              <span className="font-bold text-[#204434]">{sub.answeredQuestionsCount}</span>/
                              {sub.totalQuestionsCount}
                            </td>

                            {/* 7. Điểm tự chấm */}
                            <td className="py-3 px-2 text-center font-bold text-emerald-800">
                              {sub.autoScore}đ
                            </td>

                            {/* 8. Trạng thái chấm tay */}
                            <td className="py-3 px-3">
                              {needsManualGrade ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  Chờ chấm {sub.manualQuestions.length} câu
                                </span>
                              ) : isGraded ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Đã chấm tay
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[11px]">Tự động 100%</span>
                              )}
                            </td>

                            {/* 9. Tổng điểm */}
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`font-serif font-bold text-sm ${
                                  isGraded ? "text-[#204434]" : "text-amber-800"
                                }`}
                              >
                                {totalScoreDisplay}
                              </span>
                            </td>

                            {/* 10. Trạng thái công bố */}
                            <td className="py-3 px-3">
                              {sub.isPublished ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                  Đã công bố
                                </span>
                              ) : isGraded ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                                  Chưa công bố
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[10px]">Đang chờ chấm</span>
                              )}
                            </td>

                            {/* 11. Thao tác */}
                            <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                              {needsManualGrade ? (
                                <button
                                  onClick={() => handleStartGrading(sub)}
                                  className="px-2.5 py-1 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-xs shadow-2xs transition"
                                >
                                  Chấm bài
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStartGrading(sub)}
                                  className="px-2 py-1 rounded-xl bg-white border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48] font-bold text-xs transition"
                                >
                                  Xem bài
                                </button>
                              )}

                              {!sub.isPublished && isGraded && (
                                <button
                                  onClick={() => handleSinglePublish(sub.id)}
                                  className="px-2 py-1 rounded-xl bg-[#BC9B6B] hover:bg-[#A88858] text-white font-bold text-xs transition"
                                  title="Công bố kết quả cho học viên"
                                >
                                  Công bố
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setResubmitTargetSub(sub);
                                  setIsResubmitModalOpen(true);
                                }}
                                className="p-1 rounded-lg border border-red-200 hover:bg-red-50 text-red-600"
                                title="Yêu cầu học viên nộp lại"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredSubmissions.length === 0 && (
                    <div className="p-8 text-center text-xs text-[#315E48] bg-white">
                      Không có bài nộp nào phù hợp với bộ lọc hiện tại.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 5: LƯU TRỮ (ARCHIVED - SPEC SECTION B1) */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "ARCHIVED" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] text-xs text-[#315E48]">
                  <strong>Ghi chú an toàn dữ liệu:</strong> Toàn bộ lịch sử làm bài, điểm số và bài nộp của học
                  viên được bảo lưu an toàn 100% khi đề hoặc bài giao chuyển vào mục Lưu trữ.
                </div>

                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-sm text-[#204434]">Đề thi đã lưu trữ:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {examPackages
                      .filter((p) => p.status === "ARCHIVED")
                      .map((pkg) => (
                        <div
                          key={pkg.id}
                          className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs flex items-center justify-between"
                        >
                          <div>
                            <h5 className="font-bold text-[#204434] text-xs">{pkg.title}</h5>
                            <span className="text-[11px] text-[#315E48]">
                              {pkg.questionsCount} câu · {pkg.totalPoints}đ
                            </span>
                          </div>
                          <button
                            onClick={() => handleToggleArchivePackage(pkg.id, false)}
                            className="px-3 py-1.5 rounded-xl border border-[#204434] text-[#204434] hover:bg-[#FAF7F0] font-bold text-xs"
                          >
                            Khôi phục
                          </button>
                        </div>
                      ))}
                    {examPackages.filter((p) => p.status === "ARCHIVED").length === 0 && (
                      <p className="text-xs text-[#315E48] italic">Chưa có đề thi nào trong mục lưu trữ.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-serif font-bold text-sm text-[#204434]">Các lần giao đề đã lưu trữ:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignments
                      .filter((a) => a.status === "ARCHIVED")
                      .map((a) => (
                        <div
                          key={a.id}
                          className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs flex items-center justify-between"
                        >
                          <div>
                            <h5 className="font-bold text-[#204434] text-xs">{a.title}</h5>
                            <span className="text-[11px] text-[#315E48]">
                              Lớp {a.className} · Hạn {a.dueAt}
                            </span>
                          </div>
                          <button
                            onClick={() => handleToggleArchiveAssignment(a.id, false)}
                            className="px-3 py-1.5 rounded-xl border border-[#204434] text-[#204434] hover:bg-[#FAF7F0] font-bold text-xs"
                          >
                            Khôi phục
                          </button>
                        </div>
                      ))}
                    {assignments.filter((a) => a.status === "ARCHIVED").length === 0 && (
                      <p className="text-xs text-[#315E48] italic">Chưa có lần giao nào trong mục lưu trữ.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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

                    {/* PRIMARY ACTIONS: LƯU ĐỀ NHÁP & + THÊM CÂU HỎI */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveDraftExam}
                        disabled={examSaveStatus === "SAVING"}
                        className="px-3.5 py-2.5 rounded-xl border border-[#BC9B6B] bg-[#FFFCF6] hover:bg-[#FAF7F0] text-[#8F6D3B] text-xs font-bold shadow-2xs flex items-center gap-1.5 transition"
                      >
                        <Save className="w-4 h-4 text-[#8F6D3B]" />
                        <span>{examSaveStatus === "SAVING" ? "Đang lưu..." : "Lưu đề nháp"}</span>
                        {examSaveStatus === "SAVED" && <span className="text-emerald-700 font-bold ml-1">✓ Đã lưu</span>}
                        {examSaveStatus === "UNSAVED" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-0.5" />}
                      </button>

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

                          {q.matchingPairs && q.matchingPairs.length > 0 && (
                            <div className="flex flex-wrap gap-2 text-xs pt-1">
                              {q.matchingPairs.map((pair, pIdx) => (
                                <span
                                  key={pIdx}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-medium"
                                >
                                  {pair.left} ↔ {pair.right}
                                </span>
                              ))}
                            </div>
                          )}

                          {q.tokens && q.tokens.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {q.tokens.map((tok, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 rounded-md bg-[#204434]/10 text-[#204434] font-serif font-bold text-xs"
                                >
                                  {tok}
                                </span>
                              ))}
                            </div>
                          )}

                          {q.rubric && (
                            <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/70 text-[11px] text-amber-900">
                              <strong>Rubric chấm tay:</strong> {q.rubric}
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
                <div className="pt-4 border-t border-[#E5DEC9] flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#315E48]">
                      Tổng cộng: <strong>{draftQuestions.length} câu</strong> · <strong>{totalExamPoints} điểm</strong>
                    </span>
                    {currentExamId && (
                      <span className="text-[10px] text-[#8F6D3B] bg-[#BC9B6B]/15 px-2 py-0.5 rounded-md font-mono font-medium">
                        Mã đề: {currentExamId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveDraftExam}
                      disabled={examSaveStatus === "SAVING"}
                      className="px-4 py-2.5 rounded-xl border border-[#BC9B6B] bg-white hover:bg-[#FAF7F0] text-[#8F6D3B] text-xs font-bold shadow-2xs flex items-center gap-1.5 transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>{examSaveStatus === "SAVING" ? "Đang lưu..." : "Lưu đề nháp"}</span>
                      {examSaveStatus === "SAVED" && <span className="text-emerald-700 font-bold ml-1">✓ Đã lưu</span>}
                    </button>

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
                      <ArrowRight className="w-4 h-4 text-[#BC9B6B]" />
                    </button>
                  </div>
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
                    {questionBank.filter((q) => {
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
                                setMcqOptions(["Nấu ăn", v.meaningVi, "Đi làm", "Ngày mai"]);
                                setMcqCorrectSingle("B");
                                setEditorExplanation(`“${v.hanzi}” có nghĩa là “${v.meaningVi}”.`);
                              } else if (editorType === "matching") {
                                setEditorContent("Nối từ tiếng Trung với nghĩa tiếng Việt tương ứng:");
                                setMatchingPairs([
                                  { id: "pair-1", left: `${v.hanzi} (${v.pinyin})`, right: v.meaningVi },
                                  { id: "pair-2", left: "明天 (míngtiān)", right: "Ngày mai" },
                                  { id: "pair-3", left: "今天 (jīntiān)", right: "Hôm nay" },
                                ]);
                              } else if (editorType === "flashcard") {
                                setEditorContent(v.hanzi);
                                setEditorPinyin(v.pinyin);
                                setFlashcardsList([
                                  {
                                    id: "fc-1",
                                    front: v.hanzi,
                                    backPy: v.pinyin,
                                    backVi: v.meaningVi,
                                    exampleZh: `我今天在宿舍${v.hanzi}。(Hôm nay tôi ở ký túc xá ${v.meaningVi.toLowerCase()}).`,
                                  },
                                ]);
                              } else if (editorType === "fill_blank") {
                                setBlankSentence(`他身体不舒服，所以今天在宿舍 [_____] 。(Anh ấy trong người không khỏe, nên hôm nay ở ký túc xá nghỉ ngơi).`);
                                setBlankAnswers([{ id: "blank-1", answer: v.hanzi, alternatives: v.pinyin }]);
                              } else if (editorType === "handwriting_photo") {
                                setHwWordsList(v.hanzi);
                                setHwRepeatCount(5);
                                setHwRubric("Viết đúng chữ Hán (4đ), Đủ 5 lần (2đ), Bút thuận đúng (2đ), Ngay ngắn sạch đẹp (2đ).");
                              } else if (editorType === "translation") {
                                setTransDirection("ZH_TO_VI");
                                setTransSource(`我今天${v.hanzi}。`);
                                setTransReference(`Hôm nay tôi ${v.meaningVi.toLowerCase()}.`);
                              } else {
                                setEditorContent(v.hanzi);
                                setEditorPinyin(v.pinyin);
                              }
                              setSaveStatus("UNSAVED");
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
                                setMcqOptions([
                                  item.vi || "Cách diễn đạt khuyên dùng",
                                  "Cách nói thô lỗ, cấm kỵ",
                                  "Nói chuyện phiếm hàng ngày",
                                  "Từ chối thẳng thừng",
                                ]);
                                setMcqCorrectSingle("A");
                                setEditorExplanation(`“${item.zh}” mang ý nghĩa: ${item.vi || ""}. ${item.note ? `Lưu ý: ${item.note}` : ""}`);
                              } else {
                                setEditorContent(`Câu hỏi tình huống văn hóa: ${item.content || ""}`);
                                setEditorExplanation(item.content || "");
                              }
                              setSaveStatus("UNSAVED");
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

                  {/* KHU VỰC B: CHỌN DẠNG BÀI TẬP VÀ FORM SOẠN THẢO CHUYÊN BIỆT */}
                  <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#E5DEC9] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="font-bold text-[#204434] block">
                        Chọn 1 trong 12 dạng bài tập chuẩn mực: <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#204434]/10 text-[#204434]">
                        {OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === editorType)?.category === "AUTO"
                          ? "⚡ Hệ thống tự chấm điểm"
                          : "✍️ Giáo viên chấm tay / Rubric"}
                      </span>
                    </div>

                    <select
                      value={editorType}
                      onChange={(e) => handleSwitchEditorType(e.target.value as QuestionType)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs font-bold text-[#204434] focus:outline-none focus:border-[#204434]"
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

                  {/* THÔNG TIN CHUNG CÂU HỎI */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3.5 rounded-2xl border border-[#E5DEC9]">
                    <div className="md:col-span-6">
                      <label className="font-bold text-[#204434] block mb-1">
                        Tiêu đề / Ghi chú câu hỏi:
                      </label>
                      <input
                        type="text"
                        value={editorTitle}
                        onChange={(e) => {
                          setEditorTitle(e.target.value);
                          setSaveStatus("UNSAVED");
                        }}
                        placeholder="Ví dụ: Phân biệt từ vựng Bài 5..."
                        className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] text-xs font-medium"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="font-bold text-[#204434] block mb-1">Độ khó:</label>
                      <select
                        value={editorDifficulty}
                        onChange={(e) => {
                          setEditorDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD");
                          setSaveStatus("UNSAVED");
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] text-xs font-medium"
                      >
                        <option value="EASY">Dễ (Nhận biết)</option>
                        <option value="MEDIUM">Trung bình (Thông hiểu)</option>
                        <option value="HARD">Khó (Vận dụng cao)</option>
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="font-bold text-[#204434] block mb-1">Điểm tối đa:</label>
                      <input
                        type="number"
                        min={1}
                        value={editorPoints}
                        onChange={(e) => {
                          setEditorPoints(Number(e.target.value));
                          setSaveStatus("UNSAVED");
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* KHU VỰC C: FORM BIỂU MẪU CHUYÊN BIỆT & XEM TRƯỚC HỌC VIÊN */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* CỘT TRÁI (7 CỘT): BIỂU MẪU CHI TIẾT THEO TỪNG DẠNG TRONG 12 DẠNG */}
                    <div className="lg:col-span-7 space-y-3.5">
                      {/* ========================================================= */}
                      {/* DẠNG 1: TRẮC NGHIỆM (multiple_choice) */}
                      {/* ========================================================= */}
                      {editorType === "multiple_choice" && (
                        <div className="space-y-3 bg-[#FAF7F0]/60 p-3.5 rounded-2xl border border-[#E5DEC9]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#204434]">Cấu hình Trắc nghiệm:</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setMcqSelectionMode("SINGLE");
                                  setSaveStatus("UNSAVED");
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                  mcqSelectionMode === "SINGLE"
                                    ? "bg-[#204434] text-white"
                                    : "bg-white text-[#204434] border border-[#E5DEC9]"
                                }`}
                              >
                                1 đáp án đúng
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMcqSelectionMode("MULTIPLE");
                                  setSaveStatus("UNSAVED");
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                  mcqSelectionMode === "MULTIPLE"
                                    ? "bg-[#204434] text-white"
                                    : "bg-white text-[#204434] border border-[#E5DEC9]"
                                }`}
                              >
                                Nhiều đáp án đúng
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">
                              Đề bài câu hỏi: <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={editorContent}
                              onChange={(e) => {
                                setEditorContent(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              rows={2}
                              placeholder="Ví dụ: “休息” (xiūxi) có nghĩa là gì?"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif text-sm"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">Gợi ý Pinyin (nếu có):</label>
                            <input
                              type="text"
                              value={editorPinyin}
                              onChange={(e) => {
                                setEditorPinyin(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              placeholder="Ví dụ: xiūxi"
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="font-bold text-[#204434] block">
                              Danh sách phương án lựa chọn: (Đánh dấu phương án đúng)
                            </label>
                            {mcqOptions.map((opt, idx) => {
                              const letter = String.fromCharCode(65 + idx);
                              const isCorrect =
                                mcqSelectionMode === "SINGLE"
                                  ? mcqCorrectSingle === letter
                                  : mcqCorrectMultiple.includes(letter);
                              return (
                                <div key={idx} className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (mcqSelectionMode === "SINGLE") {
                                        setMcqCorrectSingle(letter);
                                      } else {
                                        if (mcqCorrectMultiple.includes(letter)) {
                                          setMcqCorrectMultiple(mcqCorrectMultiple.filter((l) => l !== letter));
                                        } else {
                                          setMcqCorrectMultiple([...mcqCorrectMultiple, letter]);
                                        }
                                      }
                                      setSaveStatus("UNSAVED");
                                    }}
                                    className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 transition ${
                                      isCorrect
                                        ? "bg-emerald-600 text-white shadow-2xs"
                                        : "bg-white border border-[#E5DEC9] text-[#315E48]"
                                    }`}
                                    title="Bấm để đặt làm đáp án đúng"
                                  >
                                    {letter}
                                  </button>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const next = [...mcqOptions];
                                      next[idx] = e.target.value;
                                      setMcqOptions(next);
                                      setSaveStatus("UNSAVED");
                                    }}
                                    placeholder={`Phương án ${letter}...`}
                                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                                  />
                                  {mcqOptions.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = mcqOptions.filter((_, i) => i !== idx);
                                        setMcqOptions(next);
                                        setSaveStatus("UNSAVED");
                                      }}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                      title="Xóa phương án"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}

                            {mcqOptions.length < 6 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMcqOptions([...mcqOptions, ""]);
                                  setSaveStatus("UNSAVED");
                                }}
                                className="px-3 py-1.5 rounded-xl border border-dashed border-[#204434] text-[#204434] hover:bg-[#FAF7F0] font-bold text-xs flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Thêm phương án</span>
                              </button>
                            )}
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">Lời giải / Giải thích chi tiết:</label>
                            <textarea
                              value={editorExplanation}
                              onChange={(e) => {
                                setEditorExplanation(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              rows={2}
                              placeholder="Giải thích vì sao chọn đáp án này..."
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                            />
                          </div>
                        </div>
                      )}

                      {/* ========================================================= */}
                      {/* DẠNG 2: NỐI TỪ (matching) */}
                      {/* ========================================================= */}
                      {editorType === "matching" && (
                        <div className="space-y-3 bg-[#FAF7F0]/60 p-3.5 rounded-2xl border border-[#E5DEC9]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#204434]">Bảng cặp nối (Cột A ↔ Cột B):</span>
                            <label className="flex items-center gap-1.5 text-xs text-[#315E48] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={matchingShuffleB}
                                onChange={(e) => {
                                  setMatchingShuffleB(e.target.checked);
                                  setSaveStatus("UNSAVED");
                                }}
                                className="rounded text-[#204434] focus:ring-[#204434]"
                              />
                              <span>Xáo trộn Cột B khi làm bài</span>
                            </label>
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">Đề bài hướng dẫn:</label>
                            <input
                              type="text"
                              value={editorContent}
                              onChange={(e) => {
                                setEditorContent(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              placeholder="Nối từ tiếng Trung ở cột A với nghĩa tiếng Việt tương ứng ở cột B:"
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-[#8F6D3B] px-1">
                              <div className="col-span-5">CỘT A (Chữ Hán / Phiên âm)</div>
                              <div className="col-span-1 text-center">↔</div>
                              <div className="col-span-5">CỘT B (Nghĩa tiếng Việt)</div>
                              <div className="col-span-1"></div>
                            </div>

                            {matchingPairs.map((pair, pIdx) => (
                              <div key={pair.id} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-5">
                                  <input
                                    type="text"
                                    value={pair.left}
                                    onChange={(e) => {
                                      const next = [...matchingPairs];
                                      next[pIdx] = { ...next[pIdx], left: e.target.value };
                                      setMatchingPairs(next);
                                      setSaveStatus("UNSAVED");
                                    }}
                                    placeholder="Ví dụ: 休息 (xiūxi)"
                                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif"
                                  />
                                </div>
                                <div className="col-span-1 text-center font-bold text-[#BC9B6B]">↔</div>
                                <div className="col-span-5">
                                  <input
                                    type="text"
                                    value={pair.right}
                                    onChange={(e) => {
                                      const next = [...matchingPairs];
                                      next[pIdx] = { ...next[pIdx], right: e.target.value };
                                      setMatchingPairs(next);
                                      setSaveStatus("UNSAVED");
                                    }}
                                    placeholder="Ví dụ: Nghỉ ngơi"
                                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                                  />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                  {matchingPairs.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMatchingPairs(matchingPairs.filter((_, i) => i !== pIdx));
                                        setSaveStatus("UNSAVED");
                                      }}
                                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => {
                                setMatchingPairs([
                                  ...matchingPairs,
                                  { id: `pair-${Date.now()}`, left: "", right: "" },
                                ]);
                                setSaveStatus("UNSAVED");
                              }}
                              className="px-3 py-1.5 rounded-xl border border-dashed border-[#204434] text-[#204434] hover:bg-[#FAF7F0] font-bold text-xs flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Thêm cặp nối mới</span>
                            </button>
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">Ghi chú / Lời giải:</label>
                            <textarea
                              value={editorExplanation}
                              onChange={(e) => {
                                setEditorExplanation(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              rows={2}
                              placeholder="Ghi chú thêm về từ vựng ghép đôi..."
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                            />
                          </div>
                        </div>
                      )}

                      {/* ========================================================= */}
                      {/* DẠNG 3: FLASHCARD (flashcard) */}
                      {/* ========================================================= */}
                      {editorType === "flashcard" && (
                        <div className="space-y-3 bg-[#FAF7F0]/60 p-3.5 rounded-2xl border border-[#E5DEC9]">
                          <span className="font-bold text-[#204434] block">Nội dung thẻ Flashcard:</span>

                          <div className="p-3 bg-white rounded-2xl border border-[#E5DEC9] space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-bold text-[#204434] block mb-1">
                                  Mặt trước: Chữ Hán <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={flashcardsList[0]?.front || ""}
                                  onChange={(e) => {
                                    const next = [...flashcardsList];
                                    next[0] = { ...next[0], front: e.target.value };
                                    setFlashcardsList(next);
                                    setEditorContent(e.target.value);
                                    setSaveStatus("UNSAVED");
                                  }}
                                  placeholder="Ví dụ: 休息"
                                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-serif text-lg font-bold"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-[#204434] block mb-1">
                                  Mặt sau: Phiên âm Pinyin
                                </label>
                                <input
                                  type="text"
                                  value={flashcardsList[0]?.backPy || ""}
                                  onChange={(e) => {
                                    const next = [...flashcardsList];
                                    next[0] = { ...next[0], backPy: e.target.value };
                                    setFlashcardsList(next);
                                    setEditorPinyin(e.target.value);
                                    setSaveStatus("UNSAVED");
                                  }}
                                  placeholder="Ví dụ: xiūxi"
                                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#8F6D3B] font-semibold"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="font-bold text-[#204434] block mb-1">
                                Mặt sau: Nghĩa tiếng Việt <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={flashcardsList[0]?.backVi || ""}
                                onChange={(e) => {
                                  const next = [...flashcardsList];
                                  next[0] = { ...next[0], backVi: e.target.value };
                                  setFlashcardsList(next);
                                  setSaveStatus("UNSAVED");
                                }}
                                placeholder="Ví dụ: Nghỉ ngơi, ngừng làm việc để lấy lại sức"
                                className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-[#204434] block mb-1">
                                Ví dụ minh họa và dịch nghĩa:
                              </label>
                              <textarea
                                value={flashcardsList[0]?.exampleZh || ""}
                                onChange={(e) => {
                                  const next = [...flashcardsList];
                                  next[0] = { ...next[0], exampleZh: e.target.value };
                                  setFlashcardsList(next);
                                  setSaveStatus("UNSAVED");
                                }}
                                rows={2}
                                placeholder="Ví dụ: 我今天在宿舍休息。(Hôm nay tôi ở ký túc xá nghỉ ngơi)."
                                className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">Mẹo nhớ / Chú thích ngữ cảnh:</label>
                            <input
                              type="text"
                              value={editorExplanation}
                              onChange={(e) => {
                                setEditorExplanation(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              placeholder="Gợi ý cấu tạo chữ hoặc ngữ cảnh sử dụng..."
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                            />
                          </div>
                        </div>
                      )}

                      {/* ========================================================= */}
                      {/* DẠNG 4: ĐIỀN TỪ VÀO CHỖ TRỐNG (fill_blank) */}
                      {/* ========================================================= */}
                      {editorType === "fill_blank" && (
                        <div className="space-y-3 bg-[#FAF7F0]/60 p-3.5 rounded-2xl border border-[#E5DEC9]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#204434]">Đoạn văn câu hỏi:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setBlankSentence((prev) => prev + " [_____] ");
                                setSaveStatus("UNSAVED");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#204434] text-white text-xs font-bold hover:bg-[#183629] flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#BC9B6B]" />
                              <span>Chèn ô trống [_____]</span>
                            </button>
                          </div>

                          <textarea
                            value={blankSentence}
                            onChange={(e) => {
                              setBlankSentence(e.target.value);
                              setEditorContent(e.target.value);
                              setSaveStatus("UNSAVED");
                            }}
                            rows={3}
                            placeholder="Nhập câu tiếng Trung có chứa ô trống [_____]..."
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif text-sm"
                          />

                          <div className="space-y-2">
                            <label className="font-bold text-[#204434] block">
                              Đáp án cho các ô trống cần điền:
                            </label>
                            {blankAnswers.map((ba, bIdx) => (
                              <div key={ba.id} className="p-3 bg-white rounded-xl border border-[#E5DEC9] space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-[#8F6D3B]">Ô trống #{bIdx + 1}</span>
                                  {blankAnswers.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setBlankAnswers(blankAnswers.filter((_, i) => i !== bIdx));
                                        setSaveStatus("UNSAVED");
                                      }}
                                      className="text-red-500 hover:underline text-xs"
                                    >
                                      Xóa ô này
                                    </button>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[11px] font-bold text-[#204434] block mb-1">
                                      Đáp án chính xác: <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={ba.answer}
                                      onChange={(e) => {
                                        const next = [...blankAnswers];
                                        next[bIdx] = { ...next[bIdx], answer: e.target.value };
                                        setBlankAnswers(next);
                                        setSaveStatus("UNSAVED");
                                      }}
                                      placeholder="Ví dụ: 休息"
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-bold text-[#204434] block mb-1">
                                      Đáp án chấp nhận khác (cách nhau dấu phẩy):
                                    </label>
                                    <input
                                      type="text"
                                      value={ba.alternatives}
                                      onChange={(e) => {
                                        const next = [...blankAnswers];
                                        next[bIdx] = { ...next[bIdx], alternatives: e.target.value };
                                        setBlankAnswers(next);
                                        setSaveStatus("UNSAVED");
                                      }}
                                      placeholder="Ví dụ: xiuxi, xiūxi"
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48]"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => {
                                setBlankAnswers([
                                  ...blankAnswers,
                                  { id: `blank-${Date.now()}`, answer: "", alternatives: "" },
                                ]);
                                setSaveStatus("UNSAVED");
                              }}
                              className="px-3 py-1.5 rounded-xl border border-dashed border-[#204434] text-[#204434] hover:bg-[#FAF7F0] font-bold text-xs flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Thêm ô trống đáp án</span>
                            </button>
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">Giải thích chi tiết:</label>
                            <textarea
                              value={editorExplanation}
                              onChange={(e) => {
                                setEditorExplanation(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              rows={2}
                              placeholder="Giải thích ngữ pháp hoặc từ loại cần điền..."
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                            />
                          </div>
                        </div>
                      )}

                      {/* ========================================================= */}
                      {/* DẠNG 5: SẮP XẾP CÂU (sentence_order) - FIX TRIỆT ĐỂ KHÔNG BỊ LẪN ____ HOẶC TIÊU CHÍ ẢNH */}
                      {/* ========================================================= */}
                      {editorType === "sentence_order" && (
                        <div className="space-y-3 bg-[#FAF7F0]/60 p-3.5 rounded-2xl border border-[#E5DEC9]">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold text-[#204434]">
                                Câu tiếng Trung hoàn chỉnh chuẩn: <span className="text-red-500">*</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!orderingSentence.trim()) {
                                    showToast("Vui lòng nhập câu tiếng Trung trước!");
                                    return;
                                  }
                                  const parts = orderingSentence
                                    .split(/([，。？！、\s]+)/)
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  setOrderingTokens(
                                    parts.map((p, idx) => ({ id: `ord-${idx}-${Date.now()}`, text: p }))
                                  );
                                  setSaveStatus("UNSAVED");
                                  showToast("Đã tự động tách câu thành các thẻ từ!");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#BC9B6B] hover:bg-[#8F6D3B] text-white text-xs font-bold transition flex items-center gap-1"
                              >
                                <span>⚡ Tự động tách thành các thẻ từ</span>
                              </button>
                            </div>
                            <input
                              type="text"
                              value={orderingSentence}
                              onChange={(e) => {
                                setOrderingSentence(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              placeholder="Ví dụ: 你明天休息吗？"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif text-sm font-bold"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="font-bold text-[#204434]">
                                Các thẻ từ sẽ hiển thị xáo trộn cho học viên:
                              </label>
                              <span className="text-[10px] text-[#8F6D3B] italic">
                                Học viên sẽ bấm chọn các thẻ này để xếp thành câu đúng
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {orderingTokens.map((t, tIdx) => (
                                <div key={t.id} className="flex items-center gap-2">
                                  <span className="w-5 text-center text-xs font-bold text-[#8F6D3B]">
                                    #{tIdx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={t.text}
                                    onChange={(e) => {
                                      const next = [...orderingTokens];
                                      next[tIdx] = { ...next[tIdx], text: e.target.value };
                                      setOrderingTokens(next);
                                      setSaveStatus("UNSAVED");
                                    }}
                                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif text-sm font-bold"
                                  />
                                  <button
                                    type="button"
                                    disabled={tIdx === 0}
                                    onClick={() => {
                                      if (tIdx === 0) return;
                                      const next = [...orderingTokens];
                                      const temp = next[tIdx];
                                      next[tIdx] = next[tIdx - 1];
                                      next[tIdx - 1] = temp;
                                      setOrderingTokens(next);
                                      setSaveStatus("UNSAVED");
                                    }}
                                    className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] disabled:opacity-30"
                                    title="Di chuyển lên trước"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    disabled={tIdx === orderingTokens.length - 1}
                                    onClick={() => {
                                      if (tIdx === orderingTokens.length - 1) return;
                                      const next = [...orderingTokens];
                                      const temp = next[tIdx];
                                      next[tIdx] = next[tIdx + 1];
                                      next[tIdx + 1] = temp;
                                      setOrderingTokens(next);
                                      setSaveStatus("UNSAVED");
                                    }}
                                    className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] disabled:opacity-30"
                                    title="Di chuyển xuống sau"
                                  >
                                    ↓
                                  </button>
                                  {orderingTokens.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOrderingTokens(orderingTokens.filter((_, i) => i !== tIdx));
                                        setSaveStatus("UNSAVED");
                                      }}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                      title="Xóa thẻ"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setOrderingTokens([
                                  ...orderingTokens,
                                  { id: `ord-${Date.now()}`, text: "" },
                                ]);
                                setSaveStatus("UNSAVED");
                              }}
                              className="px-3 py-1.5 rounded-xl border border-dashed border-[#204434] text-[#204434] hover:bg-[#FAF7F0] font-bold text-xs flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Thêm thẻ từ</span>
                            </button>
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">Dịch nghĩa câu / Gợi ý cấu trúc:</label>
                            <input
                              type="text"
                              value={editorExplanation}
                              onChange={(e) => {
                                setEditorExplanation(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              placeholder="Ví dụ: Ngày mai bạn có nghỉ không? (Cấu trúc câu hỏi đuôi với 吗)"
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                            />
                          </div>
                        </div>
                      )}

                      {/* ========================================================= */}
                      {/* DẠNG 6: ĐÚNG / SAI (true_false) */}
                      {/* ========================================================= */}
                      {editorType === "true_false" && (
                        <div className="space-y-3 bg-[#FAF7F0]/60 p-3.5 rounded-2xl border border-[#E5DEC9]">
                          <div>
                            <label className="font-bold text-[#204434] block mb-1">
                              Câu nhận định / phát biểu cần kiểm tra: <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={tfStatement}
                              onChange={(e) => {
                                setTfStatement(e.target.value);
                                setEditorContent(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              rows={3}
                              placeholder="Ví dụ: Trong câu '他生病了', trợ từ '了' biểu thị hành động đang tiếp diễn ở hiện tại."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-sm"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1.5">
                              Đáp án chuẩn: <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setTfAnswer("TRUE");
                                  setSaveStatus("UNSAVED");
                                }}
                                className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition ${
                                  tfAnswer === "TRUE"
                                    ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                                    : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#FAF7F0]"
                                }`}
                              >
                                <Check className="w-4 h-4" />
                                <span>ĐÚNG (正确)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setTfAnswer("FALSE");
                                  setSaveStatus("UNSAVED");
                                }}
                                className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition ${
                                  tfAnswer === "FALSE"
                                    ? "bg-red-600 text-white border-red-700 shadow-xs"
                                    : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#FAF7F0]"
                                }`}
                              >
                                <X className="w-4 h-4" />
                                <span>SAI (错误)</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">
                              Giải thích tại sao Đúng hoặc Sai:
                            </label>
                            <textarea
                              value={editorExplanation}
                              onChange={(e) => {
                                setEditorExplanation(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              rows={2}
                              placeholder="Giải thích chi tiết căn cứ ngữ pháp để học viên hiểu bản chất..."
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                            />
                          </div>
                        </div>
                      )}

                      {/* ========================================================= */}
                      {/* DẠNG 7: CHÉP TỪ – NỘP ẢNH VIẾT TAY (handwriting_photo) */}
                      {/* ========================================================= */}
                      {editorType === "handwriting_photo" && (
                        <div className="space-y-3 bg-[#FAF7F0]/60 p-3.5 rounded-2xl border border-[#E5DEC9]">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-8">
                              <label className="font-bold text-[#204434] block mb-1">
                                Danh sách các từ cần luyện chép: <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={hwWordsList}
                                onChange={(e) => {
                                  setHwWordsList(e.target.value);
                                  setSaveStatus("UNSAVED");
                                }}
                                placeholder="Ví dụ: 今天、明天、休息、生病"
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif text-sm font-bold"
                              />
                            </div>
                            <div className="md:col-span-4">
                              <label className="font-bold text-[#204434] block mb-1">
                                Số lần chép mỗi từ:
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={1}
                                  max={20}
                                  value={hwRepeatCount}
                                  onChange={(e) => {
                                    setHwRepeatCount(Number(e.target.value));
                                    setSaveStatus("UNSAVED");
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-bold text-center"
                                />
                                <span className="text-xs text-[#315E48] font-bold shrink-0">lần/từ</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-[#204434] block">
                              Rubric chấm tay của giáo viên (4 tiêu chí):
                            </label>
                            <textarea
                              value={hwRubric}
                              onChange={(e) => {
                                setHwRubric(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              rows={3}
                              placeholder="Tiêu chí chấm điểm: Viết đúng chữ Hán (4đ), Đủ số lần chép (2đ), Bút thuận đúng (2đ), Ngay ngắn sạch đẹp (2đ)."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs leading-relaxed"
                            />
                          </div>

                          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
                            <p className="font-bold">📸 Quy định tải ảnh cho học viên:</p>
                            <p className="text-[11px] leading-relaxed">
                              Học viên viết ra vở kẻ ô mễ / ô vuông, chụp ảnh rõ nét không bị lóa sáng, hỗ trợ định dạng JPG, PNG, tối đa 10MB/ảnh.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ========================================================= */}
                      {/* DẠNG 8: TỰ LUẬN (essay) */}
                      {/* ========================================================= */}
                      {editorType === "essay" && (
                        <div className="space-y-3 bg-[#FAF7F0]/60 p-3.5 rounded-2xl border border-[#E5DEC9]">
                          <div>
                            <label className="font-bold text-[#204434] block mb-1">
                              Đề bài tự luận / Yêu cầu viết: <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={essayPrompt}
                              onChange={(e) => {
                                setEssayPrompt(e.target.value);
                                setEditorContent(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              rows={3}
                              placeholder="Nhập đề bài yêu cầu học viên viết đoạn văn hoặc bài luận..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="font-bold text-[#204434] block mb-1">Số chữ tối thiểu:</label>
                              <input
                                type="number"
                                min={10}
                                value={essayMinWords}
                                onChange={(e) => {
                                  setEssayMinWords(Number(e.target.value));
                                  setSaveStatus("UNSAVED");
                                }}
                                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-[#204434] block mb-1">Số chữ tối đa:</label>
                              <input
                                type="number"
                                min={20}
                                value={essayMaxWords}
                                onChange={(e) => {
                                  setEssayMaxWords(Number(e.target.value));
                                  setSaveStatus("UNSAVED");
                                }}
                                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">Bài viết mẫu tham khảo:</label>
                            <textarea
                              value={essaySample}
                              onChange={(e) => {
                                setEssaySample(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              rows={3}
                              placeholder="Đoạn văn mẫu tiếng Trung chuẩn mực..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">Rubric / Tiêu chí chấm điểm:</label>
                            <input
                              type="text"
                              value={editorRubric}
                              onChange={(e) => {
                                setEditorRubric(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              placeholder="Ví dụ: Đúng chủ đề (4đ), Ngữ pháp chuẩn xác (3đ), Từ vựng phong phú (3đ)"
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                            />
                          </div>
                        </div>
                      )}

                      {/* ========================================================= */}
                      {/* DẠNG 9: DỊCH CÂU (translation) */}
                      {/* ========================================================= */}
                      {editorType === "translation" && (
                        <div className="space-y-3 bg-[#FAF7F0]/60 p-3.5 rounded-2xl border border-[#E5DEC9]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#204434]">Chiều dịch:</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setTransDirection("ZH_TO_VI");
                                  setSaveStatus("UNSAVED");
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                  transDirection === "ZH_TO_VI"
                                    ? "bg-[#204434] text-white"
                                    : "bg-white text-[#204434] border border-[#E5DEC9]"
                                }`}
                              >
                                🇨🇳 Trung → 🇻🇳 Việt
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setTransDirection("VI_TO_ZH");
                                  setSaveStatus("UNSAVED");
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                  transDirection === "VI_TO_ZH"
                                    ? "bg-[#204434] text-white"
                                    : "bg-white text-[#204434] border border-[#E5DEC9]"
                                }`}
                              >
                                🇻🇳 Việt → 🇨🇳 Trung
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">
                              Câu gốc cần dịch: <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={transSource}
                              onChange={(e) => {
                                setTransSource(e.target.value);
                                setEditorContent(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              rows={2}
                              placeholder={
                                transDirection === "ZH_TO_VI"
                                  ? "Ví dụ: 王老师，我今天身体有点不舒服，想请假一天。"
                                  : "Ví dụ: Thầy Vương, hôm nay trong người em không khỏe, em muốn xin nghỉ một ngày."
                              }
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif text-sm"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">
                              Bản dịch chuẩn tham khảo: <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={transReference}
                              onChange={(e) => {
                                setTransReference(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              placeholder="Bản dịch chính xác nhất..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-medium"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">
                              Các cách dịch tương đương được chấp nhận (cách nhau dấu phẩy):
                            </label>
                            <input
                              type="text"
                              value={transAlternatives}
                              onChange={(e) => {
                                setTransAlternatives(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              placeholder="Các cách diễn đạt khác cũng được tính điểm trọn vẹn..."
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48]"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">Ghi chú ngữ pháp & cụm từ cốt lõi:</label>
                            <input
                              type="text"
                              value={editorExplanation}
                              onChange={(e) => {
                                setEditorExplanation(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              placeholder="Ví dụ: Chú ý cụm 有点不舒服 và động từ li hợp 请假..."
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                            />
                          </div>
                        </div>
                      )}

                      {/* ========================================================= */}
                      {/* DẠNG 10: TÌM LỖI SAI (find_error) */}
                      {/* ========================================================= */}
                      {editorType === "find_error" && (
                        <div className="space-y-3 bg-[#FAF7F0]/60 p-3.5 rounded-2xl border border-[#E5DEC9]">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold text-[#204434]">
                                Các cụm từ trong câu: (Bấm vào cụm từ để đánh dấu là vị trí bị sai)
                              </label>
                              <span className="text-[10px] text-red-600 font-bold">
                                * Màu đỏ là cụm từ chứa lỗi sai
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 p-3 bg-white rounded-xl border border-[#E5DEC9]">
                              {errorSentenceTokens.map((tok, idx) => (
                                <button
                                  key={tok.id}
                                  type="button"
                                  onClick={() => {
                                    const next = [...errorSentenceTokens];
                                    next[idx] = { ...next[idx], isError: !next[idx].isError };
                                    setErrorSentenceTokens(next);
                                    setSaveStatus("UNSAVED");
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-serif font-bold transition flex items-center gap-1.5 ${
                                    tok.isError
                                      ? "bg-red-500 text-white shadow-xs"
                                      : "bg-[#FAF7F0] text-[#204434] border border-[#E5DEC9] hover:border-[#BC9B6B]"
                                  }`}
                                >
                                  <span>{tok.text}</span>
                                  {tok.isError && <span className="text-xs">⚠️</span>}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-[#204434] block">
                              Chỉnh sửa từng cụm từ:
                            </label>
                            {errorSentenceTokens.map((tok, idx) => (
                              <div key={tok.id} className="flex items-center gap-2">
                                <span className="w-5 text-xs text-[#8F6D3B] font-bold">#{idx + 1}</span>
                                <input
                                  type="text"
                                  value={tok.text}
                                  onChange={(e) => {
                                    const next = [...errorSentenceTokens];
                                    next[idx] = { ...next[idx], text: e.target.value };
                                    setErrorSentenceTokens(next);
                                    setSaveStatus("UNSAVED");
                                  }}
                                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...errorSentenceTokens];
                                    next[idx] = { ...next[idx], isError: !next[idx].isError };
                                    setErrorSentenceTokens(next);
                                    setSaveStatus("UNSAVED");
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                    tok.isError ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {tok.isError ? "Là từ sai" : "Bình thường"}
                                </button>
                                {errorSentenceTokens.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setErrorSentenceTokens(errorSentenceTokens.filter((_, i) => i !== idx));
                                      setSaveStatus("UNSAVED");
                                    }}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => {
                                setErrorSentenceTokens([
                                  ...errorSentenceTokens,
                                  { id: `err-${Date.now()}`, text: "", isError: false },
                                ]);
                                setSaveStatus("UNSAVED");
                              }}
                              className="px-3 py-1.5 rounded-xl border border-dashed border-[#204434] text-[#204434] hover:bg-[#FAF7F0] font-bold text-xs flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Thêm cụm từ vào câu</span>
                            </button>
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">
                              Câu viết lại chuẩn xác sau khi sửa: <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={errorCorrectSentence}
                              onChange={(e) => {
                                setErrorCorrectSentence(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              placeholder="Ví dụ: 我明天休息。 hoặc 我昨天休息。"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif font-bold"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">Phân tích lỗi sai & giải thích:</label>
                            <textarea
                              value={editorExplanation}
                              onChange={(e) => {
                                setEditorExplanation(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              rows={2}
                              placeholder="Giải thích vì sao từ này bị sai ngữ pháp hoặc logic thời gian..."
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                            />
                          </div>
                        </div>
                      )}

                      {/* ========================================================= */}
                      {/* DẠNG 11: NGHE CHỌN (listening_choice) */}
                      {/* ========================================================= */}
                      {editorType === "listening_choice" && (
                        <div className="space-y-3 bg-[#FAF7F0]/60 p-3.5 rounded-2xl border border-[#E5DEC9]">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-8">
                              <label className="font-bold text-[#204434] block mb-1">
                                File âm thanh / URL Audio:
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={listenAudioUrl}
                                  onChange={(e) => {
                                    setListenAudioUrl(e.target.value);
                                    setSaveStatus("UNSAVED");
                                  }}
                                  placeholder="/sample-audio/hsk1-b5.mp3"
                                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => showToast("Đã chọn file âm thanh chuẩn phát âm bản xứ!")}
                                  className="px-3 py-1.5 rounded-xl bg-[#204434] text-white text-xs font-bold shrink-0 hover:bg-[#183629]"
                                >
                                  Tải file
                                </button>
                              </div>
                            </div>
                            <div className="md:col-span-4">
                              <label className="font-bold text-[#204434] block mb-1">Số lần nghe:</label>
                              <select
                                value={listenMaxPlays}
                                onChange={(e) => {
                                  setListenMaxPlays(Number(e.target.value));
                                  setSaveStatus("UNSAVED");
                                }}
                                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-bold"
                              >
                                <option value={1}>1 lần</option>
                                <option value={2}>2 lần (Chuẩn thi HSK)</option>
                                <option value={3}>3 lần</option>
                                <option value={999}>Không giới hạn</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">
                              Lời thoại bài nghe (Transcript - ẩn với học viên):
                            </label>
                            <textarea
                              value={listenTranscript}
                              onChange={(e) => {
                                setListenTranscript(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              rows={2}
                              placeholder="A: 你明天去上班吗？ B: 我明天休息，在宿舍看书。"
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">
                              Câu hỏi nghe hiểu: <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={listenQuestion}
                              onChange={(e) => {
                                setListenQuestion(e.target.value);
                                setEditorContent(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              placeholder="Ví dụ: Người nói ngày mai dự định làm gì?"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-bold"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="font-bold text-[#204434] block">
                              4 Phương án lựa chọn A, B, C, D: (Bấm chữ cái để chọn đáp án đúng)
                            </label>
                            {listenOptions.map((opt, oIdx) => {
                              const letter = String.fromCharCode(65 + oIdx);
                              const isCorrect = listenCorrect === letter;
                              return (
                                <div key={oIdx} className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setListenCorrect(letter);
                                      setSaveStatus("UNSAVED");
                                    }}
                                    className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 transition ${
                                      isCorrect
                                        ? "bg-emerald-600 text-white shadow-2xs"
                                        : "bg-white border border-[#E5DEC9] text-[#315E48]"
                                    }`}
                                  >
                                    {letter}
                                  </button>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const next = [...listenOptions];
                                      next[oIdx] = e.target.value;
                                      setListenOptions(next);
                                      setSaveStatus("UNSAVED");
                                    }}
                                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                                  />
                                </div>
                              );
                            })}
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">Giải thích chi tiết:</label>
                            <input
                              type="text"
                              value={editorExplanation}
                              onChange={(e) => {
                                setEditorExplanation(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              placeholder="Trong đoạn đối thoại B nói rõ '在宿舍看书'..."
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                            />
                          </div>
                        </div>
                      )}

                      {/* ========================================================= */}
                      {/* DẠNG 12: NGHE ĐIỀN (listening_fill) */}
                      {/* ========================================================= */}
                      {editorType === "listening_fill" && (
                        <div className="space-y-3 bg-[#FAF7F0]/60 p-3.5 rounded-2xl border border-[#E5DEC9]">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-8">
                              <label className="font-bold text-[#204434] block mb-1">
                                File âm thanh / URL Audio:
                              </label>
                              <input
                                type="text"
                                value={listenFillAudioUrl}
                                onChange={(e) => {
                                  setListenFillAudioUrl(e.target.value);
                                  setSaveStatus("UNSAVED");
                                }}
                                placeholder="/sample-audio/hsk1-b5-fill.mp3"
                                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-mono"
                              />
                            </div>
                            <div className="md:col-span-4">
                              <label className="font-bold text-[#204434] block mb-1">Số lần nghe:</label>
                              <select
                                value={listenMaxPlays}
                                onChange={(e) => {
                                  setListenMaxPlays(Number(e.target.value));
                                  setSaveStatus("UNSAVED");
                                }}
                                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-bold"
                              >
                                <option value={2}>2 lần (Chuẩn)</option>
                                <option value={3}>3 lần</option>
                                <option value={999}>Không giới hạn</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold text-[#204434]">
                                Đoạn văn nghe có chỗ trống [_____]: <span className="text-red-500">*</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setListenFillTranscript((prev) => prev + " [_____] ");
                                  setSaveStatus("UNSAVED");
                                }}
                                className="px-2 py-0.5 rounded bg-[#204434] text-white text-[11px] font-bold"
                              >
                                + Chèn [_____]
                              </button>
                            </div>
                            <textarea
                              value={listenFillTranscript}
                              onChange={(e) => {
                                setListenFillTranscript(e.target.value);
                                setEditorContent(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              rows={2}
                              placeholder="Ví dụ: 王老师，我发烧了，正在宿舍 [_____] 。"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif text-sm"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">
                              Từ chính xác cần điền vào chỗ trống: <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={listenFillAnswer}
                              onChange={(e) => {
                                setListenFillAnswer(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              placeholder="Ví dụ: 休息"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif font-bold text-base"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-[#204434] block mb-1">Transcript đầy đủ & Dịch nghĩa:</label>
                            <textarea
                              value={editorExplanation}
                              onChange={(e) => {
                                setEditorExplanation(e.target.value);
                                setSaveStatus("UNSAVED");
                              }}
                              rows={2}
                              placeholder="Thầy Vương, em bị sốt rồi, đang ở ký túc xá nghỉ ngơi ạ..."
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CỘT PHẢI (5 CỘT): KHU VỰC XEM TRƯỚC HỌC VIÊN TƯƠNG TÁC (INTERACTIVE PREVIEW) */}
                    <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-[#E5DEC9] space-y-3.5 shadow-2xs flex flex-col justify-between">
                      <div className="space-y-3">
                        {/* Header: Role toggle */}
                        <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2.5">
                          <span className="font-bold text-[#204434] flex items-center gap-1.5 text-xs">
                            <Eye className="w-4 h-4 text-[#BC9B6B]" />
                            <span>Mô phỏng trải nghiệm</span>
                          </span>

                          <div className="flex items-center gap-1 bg-[#FAF7F0] p-0.5 rounded-xl border border-[#E5DEC9]">
                            <button
                              type="button"
                              onClick={() => setPreviewRole("STUDENT")}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                                previewRole === "STUDENT"
                                  ? "bg-[#204434] text-white shadow-2xs"
                                  : "text-[#315E48] hover:text-[#204434]"
                              }`}
                            >
                              <span>🎓 Học viên</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewRole("TEACHER")}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                                previewRole === "TEACHER"
                                  ? "bg-[#BC9B6B] text-white shadow-2xs"
                                  : "text-[#315E48] hover:text-[#204434]"
                              }`}
                            >
                              <span>👨‍🏫 Giáo viên</span>
                            </button>
                          </div>
                        </div>

                        {/* Question Title & Points badge */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2 py-0.5 rounded-md font-bold bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]">
                            {OFFICIAL_12_QUESTION_TYPES.find((t) => t.id === editorType)?.name}
                          </span>
                          <span className="font-bold text-[#8F6D3B]">
                            {editorPoints} điểm · {editorDifficulty === "EASY" ? "Dễ" : editorDifficulty === "MEDIUM" ? "TB" : "Khó"}
                          </span>
                        </div>

                        {/* Interactive Preview Canvas */}
                        <div className="p-3.5 rounded-2xl bg-[#FAF7F0]/70 border border-[#E5DEC9] space-y-3">
                          {/* ================= PREVIEW 1: MULTIPLE CHOICE ================= */}
                          {editorType === "multiple_choice" && (
                            <div className="space-y-2.5">
                              <p className="font-serif font-bold text-sm text-[#204434]">
                                {editorContent || "Nội dung câu hỏi..."}
                              </p>
                              {editorPinyin && <p className="text-xs text-[#8F6D3B]">{editorPinyin}</p>}
                              <div className="space-y-1.5 pt-1">
                                {mcqOptions.map((opt, idx) => {
                                  const letter = String.fromCharCode(65 + idx);
                                  const isTeacherCorrect =
                                    mcqSelectionMode === "SINGLE"
                                      ? mcqCorrectSingle === letter
                                      : mcqCorrectMultiple.includes(letter);
                                  const isStudentPicked = mcqStudentPicked.includes(letter);

                                  return (
                                    <div
                                      key={idx}
                                      onClick={() => {
                                        if (previewRole === "STUDENT") {
                                          if (mcqSelectionMode === "SINGLE") {
                                            setMcqStudentPicked([letter]);
                                          } else {
                                            if (mcqStudentPicked.includes(letter)) {
                                              setMcqStudentPicked(mcqStudentPicked.filter((l) => l !== letter));
                                            } else {
                                              setMcqStudentPicked([...mcqStudentPicked, letter]);
                                            }
                                          }
                                        }
                                      }}
                                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition text-xs ${
                                        previewRole === "TEACHER" && isTeacherCorrect
                                          ? "bg-emerald-50 border-emerald-400 font-bold text-emerald-900"
                                          : isStudentPicked
                                          ? "bg-[#204434]/10 border-[#204434] font-bold text-[#204434]"
                                          : "bg-white border-[#E5DEC9] text-[#204434] hover:border-[#BC9B6B]"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                                            previewRole === "TEACHER" && isTeacherCorrect
                                              ? "bg-emerald-600 text-white"
                                              : isStudentPicked
                                              ? "bg-[#204434] text-white"
                                              : "border border-[#BC9B6B] text-[#204434]"
                                          }`}
                                        >
                                          {letter}
                                        </span>
                                        <span>{opt || `Phương án ${letter}`}</span>
                                      </div>
                                      {previewRole === "TEACHER" && isTeacherCorrect && (
                                        <span className="text-[10px] text-emerald-700 font-bold">✓ Đáp án đúng</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* ================= PREVIEW 2: MATCHING ================= */}
                          {editorType === "matching" && (
                            <div className="space-y-3">
                              <p className="font-bold text-xs text-[#204434]">
                                {editorContent || "Nối từ ở cột A với nghĩa tương ứng ở cột B:"}
                              </p>

                              {previewRole === "TEACHER" ? (
                                <div className="space-y-1.5">
                                  {matchingPairs.map((p) => (
                                    <div
                                      key={p.id}
                                      className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs"
                                    >
                                      <span className="font-serif font-bold text-[#204434]">{p.left}</span>
                                      <span className="text-emerald-700 font-bold">↔</span>
                                      <span className="text-emerald-900 font-medium">{p.right}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="space-y-1.5">
                                      <p className="text-[10px] font-bold text-[#8F6D3B] text-center">CỘT A</p>
                                      {matchingPairs.map((p) => {
                                        const isSelected = matchingSelectedA === p.id;
                                        const isPaired = Boolean(matchingConnected[p.id]);
                                        return (
                                          <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setMatchingSelectedA(p.id)}
                                            className={`w-full p-2 rounded-xl border text-left font-serif font-bold transition text-xs ${
                                              isSelected
                                                ? "bg-[#204434] text-white border-[#204434]"
                                                : isPaired
                                                ? "bg-amber-50 text-amber-900 border-amber-300"
                                                : "bg-white text-[#204434] border-[#E5DEC9]"
                                            }`}
                                          >
                                            {p.left || "Vế A"}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <div className="space-y-1.5">
                                      <p className="text-[10px] font-bold text-[#8F6D3B] text-center">CỘT B</p>
                                      {matchingPairs.map((p) => {
                                        return (
                                          <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => {
                                              if (matchingSelectedA) {
                                                setMatchingConnected({
                                                  ...matchingConnected,
                                                  [matchingSelectedA]: p.id,
                                                });
                                                setMatchingSelectedA(null);
                                              }
                                            }}
                                            className="w-full p-2 rounded-xl border bg-white hover:bg-emerald-50 text-[#204434] border-[#E5DEC9] text-left text-xs transition"
                                          >
                                            {p.right || "Vế B"}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  {Object.keys(matchingConnected).length > 0 && (
                                    <p className="text-[10px] text-emerald-700 italic text-center">
                                      ✓ Đã nối {Object.keys(matchingConnected).length} cặp
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* ================= PREVIEW 3: FLASHCARD ================= */}
                          {editorType === "flashcard" && (
                            <div className="space-y-3">
                              <p className="text-[11px] text-[#8F6D3B] text-center italic">
                                Bấm vào thẻ để lật xem mặt trước / mặt sau
                              </p>
                              <div
                                onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                                className="w-full min-h-[140px] p-4 rounded-2xl bg-gradient-to-br from-white to-[#FAF7F0] border-2 border-[#BC9B6B]/40 shadow-xs flex flex-col items-center justify-center cursor-pointer hover:border-[#204434] transition text-center"
                              >
                                {!isFlashcardFlipped ? (
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wider">
                                      MẶT TRƯỚC
                                    </span>
                                    <h3 className="font-serif text-3xl font-bold text-[#204434]">
                                      {flashcardsList[0]?.front || "休息"}
                                    </h3>
                                    <p className="text-[10px] text-gray-400">Bấm để lật</p>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                      MẶT SAU
                                    </span>
                                    <p className="font-bold text-base text-[#8F6D3B]">
                                      {flashcardsList[0]?.backPy || "xiūxi"}
                                    </p>
                                    <p className="font-serif font-bold text-sm text-[#204434]">
                                      {flashcardsList[0]?.backVi || "Nghỉ ngơi"}
                                    </p>
                                    {flashcardsList[0]?.exampleZh && (
                                      <p className="text-[11px] text-[#315E48] italic max-w-[260px] mx-auto">
                                        {flashcardsList[0]?.exampleZh}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* ================= PREVIEW 4: FILL IN THE BLANK ================= */}
                          {editorType === "fill_blank" && (
                            <div className="space-y-3">
                              <p className="text-xs font-bold text-[#204434] leading-relaxed">
                                {blankSentence.split(/(\[_____\])/).map((part, pIdx) => {
                                  if (part === "[_____]") {
                                    return (
                                      <input
                                        key={pIdx}
                                        type="text"
                                        placeholder={previewRole === "TEACHER" ? blankAnswers[0]?.answer || "休息" : "Điền từ..."}
                                        className={`inline-block mx-1 px-2 py-0.5 rounded-lg border text-xs font-bold w-24 text-center ${
                                          previewRole === "TEACHER"
                                            ? "bg-emerald-100 border-emerald-400 text-emerald-900"
                                            : "bg-white border-[#BC9B6B] text-[#204434]"
                                        }`}
                                      />
                                    );
                                  }
                                  return <span key={pIdx}>{part}</span>;
                                })}
                              </p>
                              {previewRole === "TEACHER" && (
                                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                                  <strong>Đáp án:</strong> {blankAnswers.map((b) => b.answer).join(", ")}
                                  {blankAnswers[0]?.alternatives && (
                                    <span className="text-[11px] text-emerald-700 block">
                                      (Chấp nhận: {blankAnswers[0].alternatives})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* ================= PREVIEW 5: SENTENCE ORDERING ================= */}
                          {editorType === "sentence_order" && (
                            <div className="space-y-3">
                              <p className="text-xs font-bold text-[#204434]">
                                Sắp xếp các thẻ từ sau thành câu hoàn chỉnh:
                              </p>

                              {previewRole === "TEACHER" ? (
                                <div className="space-y-2">
                                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                                    <p className="font-bold">✓ Trật tự chuẩn mực:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {orderingTokens.map((t) => (
                                        <span
                                          key={t.id}
                                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-serif font-bold text-xs"
                                        >
                                          {t.text}
                                        </span>
                                      ))}
                                    </div>
                                    <p className="text-xs font-serif pt-1 text-[#204434]">{orderingSentence}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  {/* Answer Drop Area */}
                                  <div className="min-h-[46px] p-2 rounded-xl bg-white border border-dashed border-[#BC9B6B] flex flex-wrap gap-1.5 items-center">
                                    {orderingStudentTokens.length === 0 ? (
                                      <span className="text-xs text-gray-400 italic">
                                        Bấm các thẻ từ bên dưới để ghép vào đây...
                                      </span>
                                    ) : (
                                      orderingStudentTokens.map((tok, i) => (
                                        <button
                                          key={i}
                                          type="button"
                                          onClick={() => {
                                            setOrderingStudentTokens(
                                              orderingStudentTokens.filter((_, idx) => idx !== i)
                                            );
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-[#204434] text-white font-serif font-bold text-xs flex items-center gap-1 hover:bg-red-700 transition"
                                          title="Bấm để bỏ thẻ này"
                                        >
                                          <span>{tok}</span>
                                          <span className="text-[10px] opacity-70">✕</span>
                                        </button>
                                      ))
                                    )}
                                  </div>

                                  {/* Bank Chips */}
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {orderingTokens
                                      .filter((t) => !orderingStudentTokens.includes(t.text))
                                      .map((t) => (
                                        <button
                                          key={t.id}
                                          type="button"
                                          onClick={() => {
                                            setOrderingStudentTokens([...orderingStudentTokens, t.text]);
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-white border border-[#E5DEC9] hover:border-[#204434] font-serif font-bold text-xs text-[#204434] shadow-2xs"
                                        >
                                          {t.text}
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ================= PREVIEW 6: TRUE / FALSE ================= */}
                          {editorType === "true_false" && (
                            <div className="space-y-3">
                              <p className="font-serif font-bold text-sm text-[#204434] leading-relaxed">
                                {tfStatement || "Câu nhận định Đúng/Sai..."}
                              </p>

                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (previewRole === "STUDENT") setTfStudentChoice("TRUE");
                                  }}
                                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition ${
                                    previewRole === "TEACHER" && tfAnswer === "TRUE"
                                      ? "bg-emerald-100 border-emerald-500 text-emerald-900 font-bold"
                                      : tfStudentChoice === "TRUE"
                                      ? "bg-[#204434] text-white"
                                      : "bg-white border-[#E5DEC9] text-[#204434]"
                                  }`}
                                >
                                  ĐÚNG (正确)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (previewRole === "STUDENT") setTfStudentChoice("FALSE");
                                  }}
                                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition ${
                                    previewRole === "TEACHER" && tfAnswer === "FALSE"
                                      ? "bg-emerald-100 border-emerald-500 text-emerald-900 font-bold"
                                      : tfStudentChoice === "FALSE"
                                      ? "bg-[#204434] text-white"
                                      : "bg-white border-[#E5DEC9] text-[#204434]"
                                  }`}
                                >
                                  SAI (错误)
                                </button>
                              </div>
                            </div>
                          )}

                          {/* ================= PREVIEW 7: HANDWRITING PHOTO ================= */}
                          {editorType === "handwriting_photo" && (
                            <div className="space-y-3">
                              <div className="p-3 bg-white rounded-xl border border-[#E5DEC9] space-y-1">
                                <p className="font-bold text-xs text-[#204434]">Từ cần chép ({hwRepeatCount} lần):</p>
                                <p className="font-serif font-bold text-lg text-[#BC9B6B]">{hwWordsList}</p>
                              </div>

                              {previewRole === "STUDENT" ? (
                                <div className="p-4 rounded-xl border-2 border-dashed border-[#BC9B6B]/60 bg-white text-center space-y-2">
                                  <UploadCloud className="w-8 h-8 mx-auto text-[#BC9B6B]" />
                                  <p className="text-xs font-bold text-[#204434]">Kéo thả ảnh hoặc Chụp ảnh bài viết</p>
                                  <p className="text-[10px] text-[#8F6D3B]">Hỗ trợ ảnh JPG, PNG (tối đa 10MB)</p>
                                </div>
                              ) : (
                                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                                  <p className="font-bold">Tiêu chí chấm của giáo viên:</p>
                                  <p className="text-[11px] leading-relaxed">{hwRubric}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ================= PREVIEW 8: ESSAY ================= */}
                          {editorType === "essay" && (
                            <div className="space-y-3">
                              <p className="font-serif font-bold text-xs text-[#204434] leading-relaxed">
                                {essayPrompt}
                              </p>
                              <div className="flex items-center justify-between text-[11px] text-[#8F6D3B]">
                                <span>Yêu cầu: {essayMinWords} - {essayMaxWords} chữ</span>
                                <span>Đã viết: {essayStudentText.length} chữ</span>
                              </div>
                              <textarea
                                value={previewRole === "TEACHER" ? essaySample : essayStudentText}
                                onChange={(e) => setEssayStudentText(e.target.value)}
                                rows={4}
                                placeholder="Học viên gõ bài viết tiếng Trung tại đây..."
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-serif text-xs"
                              />
                            </div>
                          )}

                          {/* ================= PREVIEW 9: TRANSLATION ================= */}
                          {editorType === "translation" && (
                            <div className="space-y-3">
                              <div className="p-2.5 rounded-xl bg-white border border-[#E5DEC9] space-y-1">
                                <span className="text-[10px] font-bold text-[#8F6D3B]">
                                  {transDirection === "ZH_TO_VI" ? "CÂU TIẾNG TRUNG:" : "CÂU TIẾNG VIỆT:"}
                                </span>
                                <p className="font-serif font-bold text-sm text-[#204434]">{transSource}</p>
                              </div>

                              <input
                                type="text"
                                value={previewRole === "TEACHER" ? transReference : transStudentInput}
                                onChange={(e) => setTransStudentInput(e.target.value)}
                                placeholder="Học viên nhập bản dịch tại đây..."
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#BC9B6B] text-[#204434] text-xs font-medium"
                              />
                              {previewRole === "TEACHER" && transAlternatives && (
                                <p className="text-[10px] text-emerald-700 italic">
                                  Bản dịch chấp nhận khác: {transAlternatives}
                                </p>
                              )}
                            </div>
                          )}

                          {/* ================= PREVIEW 10: FIND ERROR ================= */}
                          {editorType === "find_error" && (
                            <div className="space-y-3">
                              <p className="text-xs font-bold text-[#204434]">
                                Bấm vào cụm từ bị sai trong câu:
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {errorSentenceTokens.map((tok) => {
                                  const isSelected = errorStudentSelectedId === tok.id;
                                  const isActuallyError = tok.isError;
                                  return (
                                    <button
                                      key={tok.id}
                                      type="button"
                                      onClick={() => {
                                        if (previewRole === "STUDENT") setErrorStudentSelectedId(tok.id);
                                      }}
                                      className={`px-3 py-1.5 rounded-xl font-serif font-bold text-xs border transition ${
                                        previewRole === "TEACHER" && isActuallyError
                                          ? "bg-red-500 text-white border-red-600 font-bold"
                                          : isSelected
                                          ? "bg-[#204434] text-white border-[#204434]"
                                          : "bg-white text-[#204434] border-[#E5DEC9]"
                                      }`}
                                    >
                                      {tok.text}
                                    </button>
                                  );
                                })}
                              </div>

                              {previewRole === "TEACHER" && (
                                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                                  <strong>Câu sửa đúng:</strong> {errorCorrectSentence}
                                </div>
                              )}
                            </div>
                          )}

                          {/* ================= PREVIEW 11: LISTENING CHOICE ================= */}
                          {editorType === "listening_choice" && (
                            <div className="space-y-3">
                              {/* Audio Player Bar */}
                              <div className="p-3 bg-white rounded-xl border border-[#E5DEC9] flex items-center justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (listenAudioPlaysRemaining > 0) {
                                      setIsAudioPlaying(!isAudioPlaying);
                                      if (!isAudioPlaying) {
                                        setListenAudioPlaysRemaining((p) => Math.max(0, p - 1));
                                      }
                                    }
                                  }}
                                  className="w-8 h-8 rounded-full bg-[#204434] text-white flex items-center justify-center shrink-0 hover:bg-[#183629]"
                                >
                                  {isAudioPlaying ? "⏸" : "▶"}
                                </button>
                                <div className="flex-1 space-y-1">
                                  <div className="h-1.5 bg-[#FAF7F0] rounded-full overflow-hidden border border-[#E5DEC9]">
                                    <div
                                      className={`h-full bg-[#BC9B6B] transition-all duration-300 ${
                                        isAudioPlaying ? "w-2/3" : "w-0"
                                      }`}
                                    />
                                  </div>
                                  <p className="text-[10px] text-[#8F6D3B] flex justify-between">
                                    <span>HSK1_Listening_Dialogue.mp3</span>
                                    <span>Còn {listenAudioPlaysRemaining} lượt nghe</span>
                                  </p>
                                </div>
                              </div>

                              <p className="font-bold text-xs text-[#204434]">{listenQuestion}</p>

                              <div className="space-y-1.5">
                                {listenOptions.map((opt, oIdx) => {
                                  const letter = String.fromCharCode(65 + oIdx);
                                  const isCorrect = listenCorrect === letter;
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`p-2 rounded-xl border flex items-center gap-2 text-xs ${
                                        previewRole === "TEACHER" && isCorrect
                                          ? "bg-emerald-50 border-emerald-400 font-bold text-emerald-900"
                                          : "bg-white border-[#E5DEC9] text-[#204434]"
                                      }`}
                                    >
                                      <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
                                        {letter}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              {previewRole === "TEACHER" && (
                                <p className="text-[11px] text-[#8F6D3B] italic">
                                  <strong>Transcript:</strong> {listenTranscript}
                                </p>
                              )}
                            </div>
                          )}

                          {/* ================= PREVIEW 12: LISTENING FILL ================= */}
                          {editorType === "listening_fill" && (
                            <div className="space-y-3">
                              {/* Audio Player Bar */}
                              <div className="p-3 bg-white rounded-xl border border-[#E5DEC9] flex items-center justify-between gap-3">
                                <button
                                  type="button"
                                  className="w-8 h-8 rounded-full bg-[#204434] text-white flex items-center justify-center shrink-0"
                                >
                                  ▶
                                </button>
                                <div className="flex-1 space-y-1">
                                  <div className="h-1.5 bg-[#FAF7F0] rounded-full overflow-hidden border border-[#E5DEC9]">
                                    <div className="h-full bg-[#BC9B6B] w-1/3" />
                                  </div>
                                  <p className="text-[10px] text-[#8F6D3B] flex justify-between">
                                    <span>Nghe và điền từ thích hợp vào chỗ trống</span>
                                    <span>Còn 2 lượt nghe</span>
                                  </p>
                                </div>
                              </div>

                              <p className="font-serif font-bold text-sm text-[#204434] leading-relaxed">
                                {listenFillTranscript.split(/(\[_____\])/).map((part, pIdx) => {
                                  if (part === "[_____]") {
                                    return (
                                      <input
                                        key={pIdx}
                                        type="text"
                                        placeholder={previewRole === "TEACHER" ? listenFillAnswer : "Gõ từ..."}
                                        className={`inline-block mx-1 px-2 py-0.5 rounded-lg border text-xs font-bold w-20 text-center ${
                                          previewRole === "TEACHER"
                                            ? "bg-emerald-100 border-emerald-400 text-emerald-900"
                                            : "bg-white border-[#BC9B6B] text-[#204434]"
                                        }`}
                                      />
                                    );
                                  }
                                  return <span key={pIdx}>{part}</span>;
                                })}
                              </p>

                              {previewRole === "TEACHER" && (
                                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                                  <strong>Đáp án:</strong> {listenFillAnswer}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Lời giải hiển thị cho Giáo viên */}
                      {previewRole === "TEACHER" && editorExplanation && (
                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 space-y-0.5">
                          <p className="font-bold flex items-center gap-1">
                            <span>💡</span>
                            <span>Lời giải / Ghi chú sư phạm:</span>
                          </p>
                          <p className="text-[11px] leading-relaxed text-[#315E48]">{editorExplanation}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KHU VỰC D: THANH THAO TÁC 4 NÚT HÀNH ĐỘNG CHUẨN HÓA (EXAM-006) */}
                  <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between flex-wrap gap-3 bg-[#FAF7F0] p-3.5 rounded-2xl">
                    {/* Trạng thái lưu */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#204434]">Khu vực D: Lưu trữ</span>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                          saveStatus === "CLEAN"
                            ? "bg-gray-100 text-gray-700 border border-gray-200"
                            : saveStatus === "SAVED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : saveStatus === "SAVING"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : saveStatus === "FAILED"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {saveStatus === "CLEAN" && "● Chưa có thay đổi"}
                        {saveStatus === "UNSAVED" && "● Chưa lưu thay đổi"}
                        {saveStatus === "SAVING" && "⏳ Đang lưu dữ liệu..."}
                        {saveStatus === "SAVED" && "✅ Đã lưu vào hệ thống"}
                        {saveStatus === "FAILED" && "❌ Lưu thất bại"}
                      </span>
                    </div>

                    {/* 4 Nút hành động */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* NÚT 1: LƯU NHÁP */}
                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-white text-[#315E48] hover:bg-[#FAF7F0] font-bold text-xs transition"
                        title="Lưu bản nháp vào kho của tôi (chưa hoàn thiện, không thêm vào đề)"
                      >
                        Lưu nháp
                      </button>

                      {/* NÚT 2: LƯU VÀO KHO CỦA TÔI */}
                      <button
                        type="button"
                        onClick={handleSaveToBank}
                        className="px-3.5 py-2 rounded-xl border border-[#BC9B6B] bg-[#FFFCF6] hover:bg-[#FAF7F0] text-[#8F6D3B] font-bold text-xs transition"
                        title="Kiểm tra hợp lệ và lưu vào Kho câu hỏi cá nhân"
                      >
                        Lưu vào Kho của tôi
                      </button>

                      {/* NÚT 3: LƯU VÀO KHO & TẠO CÂU TIẾP */}
                      <button
                        type="button"
                        onClick={handleSaveAndCreateNext}
                        className="px-4 py-2 rounded-xl bg-white border border-[#204434] text-[#204434] font-bold text-xs hover:bg-[#FAF7F0] transition flex items-center gap-1"
                        title="Lưu câu hiện tại vào kho và mở form mới để soạn tiếp"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#204434]" />
                        <span>Lưu & Tạo câu tiếp theo</span>
                      </button>

                      {/* NÚT 4: LƯU VÀO KHO & THÊM VÀO ĐỀ */}
                      <button
                        type="button"
                        onClick={handleSaveAndAddToExam}
                        className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition"
                        title="Lưu vào kho câu hỏi và chèn vào bài kiểm tra này"
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
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
            <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-6xl w-full h-[94vh] flex flex-col shadow-2xl overflow-hidden">
              {/* TOP HEADER: THÔNG TIN HỌC VIÊN & ĐIỀU HƯỚNG (SPEC SECTION F1) */}
              <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#FAF7F0] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={gradingSubmission.studentAvatar}
                    alt={gradingSubmission.studentName}
                    className="w-10 h-10 rounded-full object-cover border border-[#E5DEC9] shadow-2xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-base text-[#204434]">
                        Chấm bài: {gradingSubmission.studentName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#204434]/10 text-[#204434]">
                        {gradingSubmission.studentId || "std"}
                      </span>
                    </div>
                    <p className="text-xs text-[#315E48]">
                      Lớp: <strong className="text-[#204434]">{gradingSubmission.className}</strong> · Đề:{" "}
                      <span className="font-semibold text-[#8F6D3B]">{gradingSubmission.assignmentTitle}</span> · Nộp lúc:{" "}
                      <span className="font-mono">{gradingSubmission.submittedAt}</span> (Lần {gradingSubmission.attemptNumber || 1})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* NÚT CHUYỂN HỌC VIÊN TRƯỚC / TIẾP THEO (SPEC SECTION F1) */}
                  <div className="flex items-center gap-1 bg-white border border-[#E5DEC9] p-1 rounded-xl shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleNavigateStudent("PREV")}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#315E48] hover:bg-[#FAF7F0] flex items-center gap-1 transition"
                      title="Chuyển sang học viên trước đó"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Trước</span>
                    </button>
                    <span className="text-[#E5DEC9]">|</span>
                    <button
                      type="button"
                      onClick={() => handleNavigateStudent("NEXT")}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#315E48] hover:bg-[#FAF7F0] flex items-center gap-1 transition"
                      title="Chuyển sang học viên tiếp theo"
                    >
                      <span>Tiếp</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setGradingSubmission(null)}
                    className="p-2 rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#F3EEDD] text-[#315E48] shadow-2xs transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* BỐ CỤC 2 KHU VỰC CHIA ĐÔI MÀN HÌNH (SPEC SECTION F1) */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[#E5DEC9]">
                {/* ----------------------------------------------------------- */}
                {/* CỘT TRÁI (7/12): BÀI LÀM HỌC VIÊN & CÂU HỎI */}
                {/* ----------------------------------------------------------- */}
                <div className="lg:col-span-7 overflow-y-auto p-5 space-y-4 bg-white/60">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#204434]">Tiến trình nộp bài:</span>
                      <span className="text-[#315E48]">
                        Đã làm {gradingSubmission.answeredQuestionsCount}/{gradingSubmission.totalQuestionsCount} câu
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#315E48]">Điểm tự chấm:</span>
                      <strong className="text-emerald-800 text-sm font-serif">{gradingSubmission.autoScore}đ</strong>
                    </div>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#204434] flex items-center gap-1.5 pt-1">
                    <span>Nội dung bài làm các câu cần chấm thủ công:</span>
                    <span className="text-xs font-sans font-normal text-[#8F6D3B]">
                      ({gradingSubmission.manualQuestions.length} câu)
                    </span>
                  </h4>

                  {gradingSubmission.manualQuestions.map((mq, mqIdx) => (
                    <div
                      key={mq.questionId}
                      className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-sm text-[#204434]">
                          Câu {mqIdx + 1}: {mq.questionTitle}
                        </span>
                        <span className="text-xs font-bold text-[#8F6D3B] px-2 py-0.5 rounded-lg bg-[#FAF7F0] border border-[#E5DEC9]">
                          Tối đa: {mq.maxPoints} điểm
                        </span>
                      </div>

                      {/* CÂU DẠNG 7: CHÉP TỪ – NỘP ẢNH (SPEC SECTION G) */}
                      {mq.type === "handwriting_photo" && (
                        <div className="space-y-3 p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9]">
                          <div className="space-y-1 text-xs text-[#315E48]">
                            <p>
                              <strong>Từ cần chép:</strong>{" "}
                              <span className="font-serif font-bold text-[#204434] text-sm">
                                {mq.handwritingWords?.join("、") || "今天、明天、休息、生病"}
                              </span>
                            </p>
                            <p>
                              <strong>Yêu cầu:</strong> Chép đủ {mq.requiredRepeats || 5} lần mỗi từ vào vở
                              ô ly, chụp ảnh rõ nét và nộp.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <span className="text-xs font-bold text-[#204434] block">
                              Ảnh bài viết tay học viên tải lên:
                            </span>

                            <div className="grid grid-cols-2 gap-3">
                              {(mq.studentPhotoUrls || (mq.studentPhotoUrl ? [mq.studentPhotoUrl] : [])).map(
                                (url, photoIdx) => (
                                  <div
                                    key={photoIdx}
                                    className="group relative rounded-xl overflow-hidden border border-[#E5DEC9] bg-black/5 aspect-4/3 flex items-center justify-center cursor-pointer"
                                    onClick={() => {
                                      setZoomedPhotoUrl(url);
                                      setPhotoRotation(0);
                                    }}
                                  >
                                    <img
                                      src={url}
                                      alt={`Bài viết tay ${photoIdx + 1}`}
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                                      <Maximize2 className="w-4 h-4" />
                                      <span>Phóng to xem nét chữ</span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CÂU DẠNG TỰ LUẬN / DỊCH CÂU (SPEC SECTION F2) */}
                      {mq.studentResponseText && (
                        <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1.5">
                          <span className="text-[11px] font-bold text-[#315E48] block">
                            Bài làm do học viên soạn thảo:
                          </span>
                          <p className="text-sm font-serif text-[#204434] leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-lg border border-[#E5DEC9]">
                            {mq.studentResponseText}
                          </p>
                        </div>
                      )}

                      {/* RUBRIC HƯỚNG DẪN CÂU NÀY */}
                      {mq.rubric && (
                        <div className="text-[11px] text-[#8F6D3B] bg-[#FFFBF0] p-2.5 rounded-xl border border-[#BC9B6B]/40">
                          <strong>Tiêu chí Rubric:</strong> {mq.rubric}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* PHẦN TỔNG HỢP CÂU TỰ CHẤM (THAM KHẢO) */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-2">
                    <span className="text-xs font-bold text-[#204434] block">
                      Các câu trắc nghiệm & tự động chấm:
                    </span>
                    <p className="text-xs text-[#315E48]">
                      Học viên đã làm đúng các câu trắc nghiệm nhận diện từ vựng và sắp xếp câu, hệ thống đã
                      tự động tính điểm <strong className="text-emerald-800">{gradingSubmission.autoScore} điểm</strong>.
                    </p>
                  </div>
                </div>

                {/* ----------------------------------------------------------- */}
                {/* CỘT PHẢI (5/12): KHUNG CHẤM ĐIỂM, RUBRIC & NHẬN XÉT */}
                {/* ----------------------------------------------------------- */}
                <div className="lg:col-span-5 overflow-y-auto p-5 space-y-4 bg-[#FFFCF6] flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* BẢNG TỔNG KẾT ĐIỂM THỜI GIAN THỰC */}
                    <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/60 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#315E48]">Điểm tự động:</span>
                        <span className="font-bold text-emerald-800">{gradingSubmission.autoScore}đ</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#315E48]">Điểm chấm tay hiện tại:</span>
                        <span className="font-bold text-[#8F6D3B]">
                          +{Object.values(gradingScores).reduce((a, b) => a + (Number(b) || 0), 0)}đ
                        </span>
                      </div>
                      <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#204434] text-xs block">TỔNG ĐIỂM BÀI NỘP:</span>
                          <span className="text-[10px] text-amber-700 font-semibold">
                            {Object.keys(gradingScores).length < gradingSubmission.manualQuestions.length
                              ? "[Điểm tạm thời]"
                              : "[Điểm hoàn tất]"}
                          </span>
                        </div>
                        <span className="text-2xl font-serif font-bold text-[#204434]">
                          {Math.min(
                            gradingSubmission.maxScore,
                            gradingSubmission.autoScore +
                              Object.values(gradingScores).reduce((a, b) => a + (Number(b) || 0), 0)
                          )}
                          <span className="text-sm font-sans font-normal text-[#315E48]">
                            /{gradingSubmission.maxScore}đ
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* CHẤM TỪNG CÂU VỚI RUBRIC CHI TIẾT (SPEC SECTION G3 & F2) */}
                    <div className="space-y-4">
                      {gradingSubmission.manualQuestions.map((mq, mqIdx) => {
                        const currentScore = gradingScores[mq.questionId] ?? mq.awardedPoints ?? "";
                        return (
                          <div
                            key={mq.questionId}
                            className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] space-y-3 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#204434]">
                                Câu {mqIdx + 1}: Điểm chấm tay
                              </span>
                              <span className="text-xs text-[#8F6D3B] font-medium">Tối đa {mq.maxPoints}đ</span>
                            </div>

                            {/* RUBRIC TƯƠNG TÁC (ĐẶC BIỆT DÀNH CHO CHÉP TỪ - SECTION G3) */}
                            {mq.type === "handwriting_photo" ? (
                              <div className="space-y-2 p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[11px]">
                                <span className="font-bold text-[#204434] block">Rubric mẫu 10 điểm (Mục G3):</span>
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span>• Viết đúng chữ Hán (Tối đa 4đ):</span>
                                    <div className="flex gap-1">
                                      {[4, 3, 2, 1].map((pts) => (
                                        <button
                                          key={pts}
                                          type="button"
                                          onClick={() => {
                                            const base = Number(gradingScores[mq.questionId]) || 0;
                                            setGradingScores({
                                              ...gradingScores,
                                              [mq.questionId]: Math.min(mq.maxPoints, pts + 5),
                                            });
                                          }}
                                          className="px-1.5 py-0.5 rounded bg-white border border-[#E5DEC9] hover:bg-[#204434] hover:text-white font-mono text-[10px]"
                                        >
                                          {pts}đ
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>• Đủ số lần chép (Tối đa 2đ):</span>
                                    <div className="flex gap-1">
                                      {[2, 1].map((pts) => (
                                        <button
                                          key={pts}
                                          type="button"
                                          className="px-1.5 py-0.5 rounded bg-white border border-[#E5DEC9] hover:bg-[#204434] hover:text-white font-mono text-[10px]"
                                        >
                                          {pts}đ
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>• Nét chữ rõ, đẹp (Tối đa 2đ):</span>
                                    <div className="flex gap-1">
                                      {[2, 1].map((pts) => (
                                        <button
                                          key={pts}
                                          type="button"
                                          className="px-1.5 py-0.5 rounded bg-white border border-[#E5DEC9] hover:bg-[#204434] hover:text-white font-mono text-[10px]"
                                        >
                                          {pts}đ
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>• Trình bày sạch sẽ (Tối đa 2đ):</span>
                                    <div className="flex gap-1">
                                      {[2, 1].map((pts) => (
                                        <button
                                          key={pts}
                                          type="button"
                                          className="px-1.5 py-0.5 rounded bg-white border border-[#E5DEC9] hover:bg-[#204434] hover:text-white font-mono text-[10px]"
                                        >
                                          {pts}đ
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* Rubric tự luận / dịch */
                              <div className="p-2 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-[11px] text-[#315E48]">
                                Tiêu chí: Đúng ngữ pháp (50%), từ vựng phong phú (30%), bố cục văn bản (20%).
                              </div>
                            )}

                            {/* Ô nhập điểm trực tiếp */}
                            <div className="grid grid-cols-3 gap-2 items-center pt-1 text-xs">
                              <label className="col-span-2 font-bold text-[#204434]">
                                Nhập điểm câu {mqIdx + 1} (0 - {mq.maxPoints}):
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={mq.maxPoints}
                                value={currentScore}
                                onChange={(e) => {
                                  const val = Math.min(mq.maxPoints, Math.max(0, Number(e.target.value)));
                                  setGradingScores({ ...gradingScores, [mq.questionId]: val });
                                }}
                                placeholder={`0 - ${mq.maxPoints}`}
                                className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#204434] font-bold text-[#204434] text-center"
                              />
                            </div>

                            {/* Nhận xét riêng cho câu này */}
                            <div className="space-y-1 text-xs">
                              <label className="font-medium text-[#315E48]">Nhận xét câu này:</label>
                              <input
                                type="text"
                                value={gradingComments[mq.questionId] ?? mq.teacherComment ?? ""}
                                onChange={(e) =>
                                  setGradingComments({
                                    ...gradingComments,
                                    [mq.questionId]: e.target.value,
                                  })
                                }
                                placeholder="Ghi chú nhận xét riêng cho câu hỏi này..."
                                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* NHẬN XÉT TỔNG THỂ CẢ BÀI CHO HỌC VIÊN */}
                    <div className="space-y-1.5 text-xs">
                      <label className="font-bold text-[#204434] block">
                        Nhận xét chung gửi học viên:
                      </label>
                      <textarea
                        rows={3}
                        defaultValue={gradingSubmission.teacherOverallFeedback || ""}
                        placeholder="Lời khích lệ, nhắc nhở hoặc hướng dẫn học tập cho học viên..."
                        className="w-full p-3 rounded-2xl bg-white border border-[#E5DEC9] text-[#204434] text-xs focus:outline-none focus:border-[#204434]"
                      />
                    </div>
                  </div>

                  {/* 4 NÚT THAO TÁC CHẤM & CÔNG BỐ (SPEC SECTION F1 & H1) */}
                  <div className="pt-3 border-t border-[#E5DEC9] space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleCompleteGrading("REQUEST_RESUBMIT")}
                        className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold transition flex items-center gap-1"
                        title="Yêu cầu học viên nộp lại bài nếu ảnh mờ hoặc thiếu bài"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Yêu cầu nộp lại</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCompleteGrading("SAVE_DRAFT")}
                        className="px-3.5 py-2 rounded-xl border border-[#BC9B6B] bg-[#FFFCF6] hover:bg-[#FAF7F0] text-[#8F6D3B] font-bold transition"
                      >
                        Lưu chấm nháp
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleCompleteGrading("SUBMIT_GRADE")}
                        className="w-full py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold shadow-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#BC9B6B]" />
                        <span>Hoàn tất chấm</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCompleteGrading("PUBLISH")}
                        className="w-full py-2.5 rounded-xl bg-[#BC9B6B] hover:bg-[#A88858] text-white font-bold shadow-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <Award className="w-3.5 h-3.5 text-white" />
                        <span>Công bố điểm</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL 1: LIGHTBOX ZOOM ẢNH CHÉP TỪ (SPEC SECTION G2) */}
        {/* =================================================================== */}
        {zoomedPhotoUrl && (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-4xl flex items-center justify-between text-white pb-3 border-b border-white/20">
              <span className="text-xs font-bold flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[#BC9B6B]" />
                <span>Soi chi tiết nét chữ Hán (Chế độ Phóng to cao độ)</span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPhotoRotation((prev) => (prev + 90) % 360)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Xoay 90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setZoomedPhotoUrl(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full flex items-center justify-center overflow-auto p-4">
              <img
                src={zoomedPhotoUrl}
                alt="Ảnh phóng to"
                style={{ transform: `rotate(${photoRotation}deg)` }}
                className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl transition duration-300"
              />
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL 2: GIAO ĐỀ CHO LỚP (SPEC PHẦN C) */}
        {/* =================================================================== */}
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-xl w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
                <div className="flex items-center gap-2.5">
                  <Send className="w-5 h-5 text-[#8F6D3B]" />
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#204434]">
                      Giao đề cho lớp học
                    </h3>
                    <p className="text-xs text-[#315E48]">
                      {assigningExam ? assigningExam.title : examTitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Chọn lớp thuộc quyền (Hỗ trợ giao cùng lúc nhiều lớp) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#204434]">
                      Chọn lớp học nhận đề ({assignClassIds.length}/{classesList.length} lớp):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (assignClassIds.length === classesList.length) {
                          setAssignClassIds([]);
                        } else {
                          setAssignClassIds(classesList.map((c) => c.id));
                        }
                      }}
                      className="text-[11px] font-bold text-[#8F6D3B] hover:underline cursor-pointer"
                    >
                      {assignClassIds.length === classesList.length ? "Bỏ chọn tất cả" : "Chọn tất cả các lớp"}
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {classesList.map((c) => {
                      const isChecked = assignClassIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            isChecked
                              ? "bg-emerald-50/80 border-emerald-400 text-emerald-950 font-bold"
                              : "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setAssignClassIds(assignClassIds.filter((id) => id !== c.id));
                                } else {
                                  setAssignClassIds([...assignClassIds, c.id]);
                                }
                              }}
                              className="w-4 h-4 rounded text-[#204434] accent-[#204434]"
                            />
                            <span>{c.name}</span>
                          </div>
                          <span className="text-[10px] text-[#315E48]">
                            HSK {(c as any).level || 1} · {c.studentCount || 20} học viên
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Thời gian mở bài & Hạn nộp */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#204434] block mb-1">Ngày mở đề:</label>
                    <input
                      type="date"
                      value={assignOpenDate}
                      onChange={(e) => setAssignOpenDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#204434] block mb-1">Hạn nộp bài:</label>
                    <input
                      type="date"
                      value={assignDueDate}
                      onChange={(e) => setAssignDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                    />
                  </div>
                </div>

                {/* Thời gian làm bài & Số lần nộp */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#204434] block mb-1">
                      Thời lượng làm bài (phút):
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={180}
                      value={assignDurationMin}
                      onChange={(e) => setAssignDurationMin(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#204434] block mb-1">Số lần được làm:</label>
                    <select
                      value={assignMaxAttempts}
                      onChange={(e) => setAssignMaxAttempts(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                    >
                      <option value={1}>1 lần duy nhất</option>
                      <option value={2}>2 lần (tính điểm cao nhất)</option>
                      <option value={3}>3 lần</option>
                      <option value={999}>Không giới hạn</option>
                    </select>
                  </div>
                </div>

                {/* Cấu hình xem điểm và bài nộp muộn */}
                <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-2.5">
                  <div>
                    <label className="font-bold text-[#204434] block mb-1">
                      Cấu hình xem điểm & đáp án:
                    </label>
                    <select
                      value={assignScorePolicy}
                      onChange={(e) => setAssignScorePolicy(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434]"
                    >
                      <option value="AFTER_PUBLISH">Chỉ xem sau khi giáo viên công bố kết quả</option>
                      <option value="AFTER_SUBMIT">Xem ngay sau khi nộp bài</option>
                      <option value="NEVER">Không hiển thị đáp án</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={assignAllowLate}
                      onChange={(e) => setAssignAllowLate(e.target.checked)}
                      className="w-4 h-4 rounded text-[#204434] accent-[#204434]"
                    />
                    <span className="text-[#315E48]">Cho phép nộp muộn (được gắn nhãn Nộp muộn)</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48] hover:bg-[#FAF7F0] font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAssignExam}
                  className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#BC9B6B]" />
                  <span>Xác nhận giao đề ngay</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL 3: XEM TRƯỚC ĐỀ THI (SPEC SECTION B1) */}
        {/* =================================================================== */}
        {previewingExam && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#204434]">
                    Xem trước đề: {previewingExam.title}
                  </h3>
                  <p className="text-xs text-[#315E48]">
                    HSK {previewingExam.hskLevel} ({previewingExam.curriculum}) · {previewingExam.questionsCount} câu · {previewingExam.totalPoints}đ
                  </p>
                </div>
                <button
                  onClick={() => setPreviewingExam(null)}
                  className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#315E48]">{previewingExam.description}</p>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-[#204434] block">
                  Cấu trúc các dạng câu hỏi có trong đề:
                </span>
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-2 text-xs">
                  <p>• Trắc nghiệm nhận diện chữ Hán & từ vựng (5đ)</p>
                  <p>• Nối từ chữ Hán sang Pinyin & nghĩa tiếng Việt (10đ)</p>
                  <p>• Điền từ vào chỗ trống theo ngữ cảnh (5đ)</p>
                  <p>• Sắp xếp các thành phần tạo câu đúng ngữ pháp (10đ)</p>
                  <p>• Chép chữ Hán nộp ảnh chụp bài viết tay (10đ - Chấm tay)</p>
                  <p>• Dịch câu tiếng Trung sang tiếng Việt (10đ - Chấm tay)</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => setPreviewingExam(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48] font-bold"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    const exam = previewingExam;
                    setPreviewingExam(null);
                    handleOpenAssignModal(exam);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#204434] text-white font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#BC9B6B]" />
                  <span>Giao đề này</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL 4: YÊU CẦU NỘP LẠI BÀI (SPEC SECTION E3 & F1) */}
        {/* =================================================================== */}
        {isResubmitModalOpen && resubmitTargetSub && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
                <h3 className="font-serif font-bold text-base text-red-700 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>Yêu cầu nộp lại bài</span>
                </h3>
                <button
                  onClick={() => setIsResubmitModalOpen(false)}
                  className="p-1 rounded-lg border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-[#315E48]">
                  Gửi yêu cầu nộp lại cho học viên{" "}
                  <strong className="text-[#204434]">{resubmitTargetSub.studentName}</strong>:
                </p>

                <div>
                  <label className="font-bold text-[#204434] block mb-1">
                    Lý do yêu cầu nộp lại (học viên sẽ nhìn thấy):
                  </label>
                  <textarea
                    rows={3}
                    value={resubmitReasonText}
                    onChange={(e) => setResubmitReasonText(e.target.value)}
                    placeholder="Ví dụ: Ảnh chụp bài viết tay bị mờ/lóa sáng, đề nghị em chụp lại rõ nét từng trang và nộp lại..."
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsResubmitModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48] font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResubmit}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xác nhận yêu cầu nộp lại</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL XÁC NHẬN XÓA ĐỀ NHÁP (SPEC SECTION 2.2) */}
        {deleteConfirmPackage && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
                <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span>Xóa bản nháp đề</span>
                </div>
                <button
                  onClick={() => setDeleteConfirmPackage(null)}
                  className="p-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-[#315E48]">
                <p>
                  Bạn có chắc chắn muốn xóa bộ đề nháp:{" "}
                  <strong className="text-[#204434]">{deleteConfirmPackage.title}</strong>?
                </p>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Quy tắc bảo vệ dữ liệu gốc:</span>
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Tất cả các câu hỏi thuộc đề này trong <strong>Kho câu hỏi của tôi</strong> và các bài tập đã giao hoàn toàn được bảo toàn nguyên vẹn, không bị xóa hay ảnh hưởng.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => setDeleteConfirmPackage(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48] font-semibold hover:bg-[#FAF7F0]"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => {
                    setExamPackages(examPackages.filter((p) => p.id !== deleteConfirmPackage.id));
                    showToast(`Đã xóa đề nháp "${deleteConfirmPackage.title}" an toàn!`);
                    setDeleteConfirmPackage(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xác nhận xóa đề nháp</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* MODAL: MÃ QR PHÒNG THI & GIÁM THỊ THÔNG MINH */}
        {isQrModalOpen && qrAssignment && (() => {
          const pinCode = `HSK-${(qrAssignment.id || "6892").slice(-4).toUpperCase()}`;
          const examUrl = typeof window !== "undefined"
            ? `${window.location.origin}/s/attempts/preview?assignmentId=${qrAssignment.id}&mode=live`
            : `https://hanyu.edu.vn/s/attempts/preview?assignmentId=${qrAssignment.id}`;
          const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(examUrl)}`;

          return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className={`bg-[#FFFCF6] border border-[#E5DEC9] w-full ${isQrFullscreen ? "max-w-4xl h-[90vh]" : "max-w-lg"} rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4 animate-scaleUp overflow-y-auto`}>
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#204434]/10 text-[#204434] flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-[#204434]" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#204434]">
                        Mã QR Phòng Thi Trực Tiếp
                      </h3>
                      <p className="text-[11px] text-[#315E48]">
                        {qrAssignment.title} {qrAssignment.className ? `· ${qrAssignment.className}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsQrFullscreen(!isQrFullscreen)}
                      className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer"
                      title={isQrFullscreen ? "Thu nhỏ" : "Chiếu máy chiếu (Toàn màn hình)"}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsQrModalOpen(false)}
                      className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* QR Display Card */}
                <div className="flex flex-col items-center justify-center text-center p-5 bg-white rounded-3xl border border-[#E5DEC9] space-y-3">
                  <span className="text-[11px] font-semibold text-[#8F6D3B] bg-[#FFFBF0] px-3 py-1 rounded-full border border-[#BC9B6B]/40">
                    📱 Học sinh mở Camera Zalo / Trình duyệt quét mã để vào thi ngay
                  </span>

                  {/* QR Image */}
                  <div className="p-3 bg-white rounded-2xl border-2 border-[#204434]/20 shadow-inner relative">
                    <img
                      src={qrImageSrc}
                      alt="Mã QR Phòng Thi"
                      className={`${isQrFullscreen ? "w-64 h-64" : "w-48 h-48"} object-contain`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="w-10 h-10 rounded-xl bg-white border border-[#204434]/40 flex items-center justify-center shadow-xs">
                        <GraduationCap className="w-5 h-5 text-[#204434]" />
                      </span>
                    </div>
                  </div>

                  {/* PIN Code Codebox */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#315E48] uppercase tracking-wider font-semibold">
                      Mã PIN phòng thi (Nếu nhập thủ công):
                    </span>
                    <div className="text-2xl font-mono font-bold text-[#204434] tracking-widest bg-[#FAF7F0] px-4 py-1.5 rounded-xl border border-[#E5DEC9]">
                      {pinCode}
                    </div>
                  </div>

                  {/* Direct Link Input */}
                  <div className="w-full flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      readOnly
                      value={examUrl}
                      className="w-full text-xs bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-3 py-2 text-[#204434] font-mono select-all truncate"
                    />
                    <button
                      onClick={() => handleCopyQrLink(examUrl)}
                      className="px-3.5 py-2 rounded-xl bg-[#204434] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#183629] shrink-0 cursor-pointer shadow-2xs"
                    >
                      {copiedQrLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedQrLink ? "Đã chép" : "Chép link"}</span>
                    </button>
                  </div>
                </div>

                {/* Đề xuất tính năng phòng thi cao cấp (Spec Đề Xuất Giám Thị Thông Minh) */}
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-2 text-xs">
                  <span className="font-bold text-[#204434] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Đề xuất tính năng phòng thi trực tuyến cao cấp (Giám thị thông minh):</span>
                  </span>
                  <ul className="text-[11px] text-[#315E48] space-y-1.5 list-disc list-inside">
                    <li><strong>Giám sát chống gian lận (Tab Switch Alert):</strong> Tự động phát hiện và cảnh báo đỏ nếu học sinh chuyển tab sang Google Dịch / từ điển.</li>
                    <li><strong>Khóa phòng thi & Thu bài đồng loạt:</strong> Giáo viên chủ động bấm "Thu bài ngay" từ xa khi hết giờ để khóa quyền nộp tiếp.</li>
                    <li><strong>Xáo trộn câu hỏi & phương án:</strong> Đảo ngẫu nhiên trật tự đáp án A, B, C, D tránh tình trạng nhìn bài nhau.</li>
                    <li><strong>Chấm điểm AI tức thì:</strong> Tự động nhận diện chữ viết, phát âm và chấm điểm tự luận theo chuẩn HSK 3.0.</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E5DEC9]">
                  <button
                    onClick={() => {
                      const win = window.open(examUrl, "_blank");
                      win?.focus();
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Vào phòng thi với tư cách học sinh</span>
                  </button>

                  <button
                    onClick={() => setIsQrModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-[#204434] text-white text-xs font-semibold shadow-xs hover:bg-[#183629] cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
