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
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return UNIFIED_QUESTION_BANK;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hanyu_custom_question_bank", JSON.stringify(questionBank));
      } catch (e) {}
    }
  }, [questionBank]);

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
  const [saveStatus, setSaveStatus] = useState<"UNSAVED" | "SAVING" | "SAVED">("UNSAVED");
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
  const handleSwitchEditorType = (newType: QuestionType) => {
    setEditorType(newType);
    setSaveStatus("UNSAVED");

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
    }, 250);
  };

  // NÚT 3: LƯU VÀO KHO & TẠO CÂU TIẾP THEO (Ready: saves current, opens clean editor for next question)
  const handleSaveAndCreateNext = () => {
    const check = validateQuestionByType();
    if (!check.valid) {
      showToast(`Chưa thể tạo câu tiếp: ${check.error}`);
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

      // Prepare fresh editor for next question
      setEditingQuestionId(null);
      setSaveStatus("UNSAVED");
      handleSwitchEditorType(editorType);
      showToast("Đã lưu câu hiện tại vào kho! Mở biểu mẫu mới để tiếp tục tạo câu.");
    }, 250);
  };

  // NÚT 4: LƯU VÀO KHO & THÊM VÀO ĐỀ (Ready: saves to Bank AND adds to current draft exam)
  const handleSaveAndAddToExam = () => {
    const check = validateQuestionByType();
    if (!check.valid) {
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

      // 3. Reset and return to composer
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
                          saveStatus === "SAVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : saveStatus === "SAVING"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {saveStatus === "SAVED" && "✅ Đã lưu vào hệ thống"}
                        {saveStatus === "SAVING" && "⏳ Đang lưu dữ liệu..."}
                        {saveStatus === "UNSAVED" && "● Chưa lưu thay đổi"}
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
