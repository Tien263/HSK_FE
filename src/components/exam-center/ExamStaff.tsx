"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Headphones,
  Image as ImageIcon,
  Layers,
  Mic,
  Music,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import type { publicationCandidates, gradingQueue } from "@/lib/exam-center-service";
import { EXAM_LEVELS, levelGroup, levelLabel, PICTURE_CODES, pictureSlots, pictureGroupIssues, sampleExamAudio, snapshotQuestion, publicExamQuestion } from "@/lib/exam-center-core";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { examApi, skillNames, typeNames } from "./exam-client";
import ExamRulesLobby from "./ExamRulesLobby";
import ExamPlayer from "./ExamPlayer";
import {
  getSampleQuestionsForLevel,
  type ImportedQuestion,
  type ExamSectionGroup,
  type QuestionItem,
  type QuestionOption,
  buildDefaultGroups,
  flattenGroups,
  unflattenToGroups,
} from "./hsk-sample-templates";
import examBlueprint from "@/config/exam_blueprint.json";
import s from "./ExamCenter.module.css";

export const groupAudioForLevel = sampleExamAudio;

export const HSK_GROUP_TEMPLATES = [
  {
    name: "🎧 Nghe tranh Đúng / Sai (True / False)",
    skill: "LISTENING" as const,
    type: "true_false",
    samplePrompt: "请听录音并判断正误 (对 / 错)。",
    instruction: "Nghe ghi âm và phán đoán xem câu nói có khớp với bức tranh hay không (Đúng hoặc Sai).",
    options: [{ id: "true", text: "Đúng (对)" }, { id: "false", text: "Sai (错)" }],
    correctAnswer: "true",
    points: 2.5,
  },
  {
    name: "🎧 Nhóm nghe – Ghép tranh A–F (Tải 6 tranh dùng chung)",
    skill: "LISTENING" as const,
    groupType: "matching_images" as const,
    type: "matching",
    samplePrompt: "请听对话并选择对应的图片 (A-F)。",
    instruction: "Nghe đoạn hội thoại và chọn bức tranh A - F tương ứng.",
    groupImages: ["A", "B", "C", "D", "E", "F"].map((l) => ({ id: l, label: `Tranh ${l}`, imageUrl: "" })),
    options: ["A", "B", "C", "D", "E", "F"].map((l) => ({ id: l, text: `Tranh ${l}` })),
    correctAnswer: "A",
    points: 2.5,
  },
  {
    name: "🎧 Nhóm nghe câu hỏi – Chọn câu trả lời A/B/C (Ẩn kịch bản với HS)",
    skill: "LISTENING" as const,
    groupType: "listening_choice_abc" as const,
    type: "listening_choice",
    samplePrompt: "请听录音并选择正确答案 (A, B, C)。",
    instruction: "Nghe câu hỏi hoặc đoạn hội thoại và chọn câu trả lời chính xác nhất (A, B hoặc C).",
    options: [
      { id: "A", text: "吃饭", pinyin: "chī fàn" },
      { id: "B", text: "喝茶", pinyin: "hē chá" },
      { id: "C", text: "看书", pinyin: "kàn shū" },
    ],
    correctAnswer: "A",
    points: 2.5,
  },
  {
    name: "🎧 Nghe đánh giá Đúng / Sai / Không đề cập (√ / × / 〇)",
    skill: "LISTENING" as const,
    groupType: "eval_true_false_na" as const,
    type: "true_false_na",
    samplePrompt: "请听录音并对各陈述进行判断（√ / × / 〇）。",
    instruction: "Nghe ghi âm và đánh giá từng phát biểu: √ (Đúng), × (Sai), hoặc 〇 (Không đề cập).",
    options: [
      { id: "true", text: "√ Đúng (对)" },
      { id: "false", text: "× Sai (错)" },
      { id: "not_mentioned", text: "〇 Không đề cập (没提及)" },
    ],
    correctAnswer: "true",
    points: 2,
  },
  {
    name: "🎧 Nghe và điền đáp án (Chỗ trống / Chấm tự động & Chuẩn hóa)",
    skill: "LISTENING" as const,
    groupType: "listening_fill_blank" as const,
    type: "listening_fill",
    samplePrompt: "请听录音并在空格处填入正确的词语。",
    instruction: "Nghe ghi âm và nhập từ ngữ chính xác vào chỗ trống.",
    correctAnswer: "",
    acceptedAnswers: "",
    requiresManualReview: false,
    options: [],
    points: 2,
  },
  {
    name: "🎧 Nghe chọn tranh A, B, C (Trắc nghiệm hình ảnh)",
    skill: "LISTENING" as const,
    type: "multiple_choice",
    samplePrompt: "请听录音并选择正确的图片 (A, B, C)。",
    instruction: "Nghe từng câu ngắn và chọn bức tranh A, B hoặc C phù hợp nhất.",
    options: [{ id: "A", text: "Tranh A" }, { id: "B", text: "Tranh B" }, { id: "C", text: "Tranh C" }],
    correctAnswer: "A",
    points: 2.5,
  },
  {
    name: "🎧 Nghe đối thoại / bài nói chọn A, B, C, D (Trắc nghiệm)",
    skill: "LISTENING" as const,
    type: "multiple_choice",
    samplePrompt: "请听录音并选择正确答案 (A, B, C, D)。",
    instruction: "Nghe đoạn ghi âm và chọn đáp án chính xác nhất (A, B, C, D).",
    options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Đáp án ${l}` })),
    correctAnswer: "A",
    points: 2,
  },
  {
    name: "📖 Đọc nhìn tranh & từ ngữ phán đoán Đúng / Sai",
    skill: "READING" as const,
    type: "true_false",
    samplePrompt: "看图判断词语是否正确 (对 / 错)。",
    instruction: "Xem bức tranh và từ ngữ chữ Hán đi kèm, phán đoán xem có khớp nhau không (Đúng / Sai).",
    options: [{ id: "true", text: "Đúng (对)" }, { id: "false", text: "Sai (错)" }],
    correctAnswer: "true",
    points: 2.5,
  },
  {
    name: "📖 Đọc câu ghép tranh A–F",
    skill: "READING" as const,
    groupType: "matching_images" as const,
    type: "matching",
    samplePrompt: "阅读句子并选择对应的图片 (A-F)。",
    instruction: "Đọc từng câu và chọn bức tranh A - F tương ứng.",
    options: ["A", "B", "C", "D", "E", "F"].map((l) => ({ id: l, text: `Tranh ${l}` })),
    correctAnswer: "A",
    points: 2,
  },
  {
    name: "📖 Đọc nối câu hỏi với câu trả lời (A - F)",
    skill: "READING" as const,
    type: "matching",
    samplePrompt: "选择最佳的应答句子 (A-F)。",
    instruction: "Đọc câu hỏi bên dưới và chọn câu trả lời A - F tương ứng.",
    options: ["A", "B", "C", "D", "E", "F"].map((l) => ({ id: l, text: `Câu ${l}` })),
    correctAnswer: "A",
    points: 2,
  },
  {
    name: "📖 Đọc chọn từ điền vào chỗ trống (Fill Blanks)",
    skill: "READING" as const,
    type: "fill_blank",
    samplePrompt: "选词填空 (请选择 A-F)。",
    instruction: "Chọn từ thích hợp trong khung (A - F) để điền vào chỗ trống hoàn thành câu.",
    options: ["A", "B", "C", "D", "E", "F"].map((l) => ({ id: l, text: `Từ ${l}` })),
    correctAnswer: "A",
    points: 2,
  },
  {
    name: "📖 Đọc hiểu đoạn văn (Passage chung + Trắc nghiệm A, B, C, D)",
    skill: "READING" as const,
    type: "multiple_choice",
    samplePrompt: "根据上文，下列哪项是正确的？",
    instruction: "Đọc đoạn văn bản bên dưới và chọn câu trả lời chính xác nhất.",
    passage: "【Đoạn văn đọc hiểu】：Nhập nội dung bài đọc chung cho nhóm câu hỏi tại đây...",
    options: ["A", "B", "C", "D"].map((l) => ({ id: l, text: `Lựa chọn ${l}` })),
    correctAnswer: "A",
    points: 2.5,
  },
  {
    name: "✍️ Sắp xếp các từ thành câu hoàn chỉnh (Sentence Order)",
    skill: "WRITING" as const,
    type: "sentence_order",
    samplePrompt: "请将给出的词语组合成一句完整通顺的句子。",
    instruction: "Sắp xếp các từ ngữ cho sẵn thành một câu hoàn chỉnh, đúng quy tắc ngữ pháp.",
    options: [],
    correctAnswer: "词语一 词语二 词语三。",
    points: 5,
  },
  {
    name: "✍️ Nhìn pinyin viết chữ Hán đúng (Điền từ Hán tự)",
    skill: "WRITING" as const,
    type: "fill_blank",
    samplePrompt: "根据拼音写汉字：听说这些鸟是从北（ fāng ）飞过来的。",
    instruction: "Căn cứ vào phiên âm pinyin trong ngoặc, viết chữ Hán chính xác vào chỗ trống.",
    options: [],
    correctAnswer: "方",
    points: 4,
  },
  {
    name: "✍️ Nhìn tranh và dùng từ cho trước viết câu",
    skill: "WRITING" as const,
    type: "writing",
    samplePrompt: "看图并使用词语写出一个完整句子。",
    instruction: "Quan sát bức tranh và sử dụng từ ngữ cho sẵn để viết một câu hoàn chỉnh miêu tả tranh.",
    options: [],
    correctAnswer: "参考答案：语法正确，用词恰当。",
    points: 10,
  },
  {
    name: "✍️ Viết đoạn văn tự luận (Essay Writing ~80-400 chữ)",
    skill: "WRITING" as const,
    type: "essay",
    samplePrompt: "请结合下列词语或图片，写一篇短文。",
    instruction: "Viết bài văn ngắn theo yêu cầu đề bài hoặc tóm tắt nội dung văn bản.",
    options: [],
    correctAnswer: "参考范文：主题明确，表达流畅。",
    points: 30,
  },
  {
    name: "🔍 Tìm câu có lỗi sai ngữ pháp (HSK 6 Find Error)",
    skill: "READING" as const,
    type: "find_error",
    samplePrompt: "下列 4 个句子中，存在病句（语病）的是哪一项？",
    instruction: "Trong 4 câu A, B, C, D, hãy chọn ra câu có lỗi sai về ngữ pháp hoặc cách dùng từ.",
    options: [
      { id: "A", text: "Câu A: Ngữ pháp chuẩn xác." },
      { id: "B", text: "Câu B: Có lỗi sai trật tự từ hoặc dùng từ sai." },
      { id: "C", text: "Câu C: Ngữ pháp chuẩn xác." },
      { id: "D", text: "Câu D: Ngữ pháp chuẩn xác." },
    ],
    correctAnswer: "B",
    points: 2.5,
  },
];

type Candidate = Awaited<ReturnType<typeof publicationCandidates>>[number];
type Queue = Awaited<ReturnType<typeof gradingQueue>>;

export default function ExamStaff({
  role,
  view,
  onNavigate,
  onChanged,
}: {
  role: string;
  view: string;
  onNavigate?: (view: string) => void;
  onChanged: () => void;
}) {
  const [papers, setPapers] = useState<Candidate[]>([]);
  const [queue, setQueue] = useState<Queue>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [publishedLink, setPublishedLink] = useState("");
  const [busy, setBusy] = useState(false);

  // Authoring state
  const [authorLevel, setAuthorLevel] = useState<number>(1);
  const [authorTitle, setAuthorTitle] = useState("Đề thi thử chuẩn HSK 1 (CTI Hanban 样卷)");
  const [authorDesc, setAuthorDesc] = useState("Đề thi mô phỏng chuẩn cấu trúc đề thật HSK 3.0 Cấp 1 (CTI / Hanban).");
  const [authorDuration, setAuthorDuration] = useState<number>(40);
  const [authorPass, setAuthorPass] = useState<number | string>("");

  // Mode: "grouped" (visual group editor - recommended) or "raw" (JSON editor)
  const [authorMode, setAuthorMode] = useState<"grouped" | "raw">("grouped");
  const [groups, setGroups] = useState<ExamSectionGroup[]>(() => buildDefaultGroups(1));
  const [activeGroupId, setActiveGroupId] = useState<string>("group_1");
  const [jsonInput, setJsonInput] = useState("");

  const [previewPaper, setPreviewPaper] = useState<any | null>(null);
  const [previewAttemptView, setPreviewAttemptView] = useState<any | null>(null);
  const [previewStep, setPreviewStep] = useState<"lobby" | "player">("lobby");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Toggle collapsible audio script / explanation in authoring
  const [openQuestionScripts, setOpenQuestionScripts] = useState<Record<string, boolean>>({});
  const toggleQuestionScript = (qId: string) => {
    setOpenQuestionScripts((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const [pendingMedia, setPendingMedia] = useState<Record<string, boolean>>({});
  const [mediaErrors, setMediaErrors] = useState<Record<string, string>>({});
  const mediaUploading = Object.values(pendingMedia).some(Boolean);

  const handleUpdateGroupImage = (groupId: string, imgId: string, url: string) => {
    setGroups(prev => prev.map(group => group.id === groupId ? {
      ...group,
      groupImages: pictureSlots(group.groupImages).map(image => image.id === imgId ? { ...image, imageUrl: url } : image),
    } : group));
  };

  const uploadGroupMedia = async (key: string, file: File, kind: "image" | "video", update: (url: string) => void) => {
    setPendingMedia(prev => ({ ...prev, [key]: true }));
    setMediaErrors(prev => ({ ...prev, [key]: "" }));
    try {
      const result = await uploadToCloudinary(file, { folder: "hsk_exam_media", resourceType: kind });
      if (!result.secureUrl) throw new Error("Dịch vụ tải tệp chưa trả về đường dẫn.");
      update(result.secureUrl);
    } catch (error) {
      setMediaErrors(prev => ({ ...prev, [key]: `Tải tệp thất bại. ${(error as Error).message}` }));
    } finally {
      setPendingMedia(prev => ({ ...prev, [key]: false }));
    }
  };

  const mediaActions = (key: string, value: string, label: string, kind: "image" | "video", update: (url: string) => void) => (
    <>
      <div className={s.examMediaActions}>
        <label className={s.secondary}>
          {pendingMedia[key] ? "Đang tải…" : value ? `Thay ${label}` : `Tải ${label}`}
          <input
            className={s.examMediaInput}
            aria-label={value ? `Thay ${label}` : `Tải ${label}`}
            type="file"
            accept={kind === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "audio/*,.mp3,.wav,.m4a,.ogg"}
            disabled={pendingMedia[key] || busy}
            onChange={event => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) void uploadGroupMedia(key, file, kind, update);
            }}
          />
        </label>
        {value && <button type="button" className={s.secondary} disabled={pendingMedia[key] || busy} onClick={() => {
          setMediaErrors(prev => ({ ...prev, [key]: "" }));
          update("");
        }}>Xóa {label}</button>}
      </div>
      {mediaErrors[key] && <p className={s.error} role="alert">{mediaErrors[key]}</p>}
    </>
  );

  const groupAudioEditor = (group: ExamSectionGroup, heading: string) => (
    <div className={s.examGroupCard}>
      <strong>{heading}</strong>
      {mediaActions(`${group.id}_audio`, group.audioUrl || "", "audio", "video", audioUrl => handleUpdateGroup(group.id, { audioUrl }))}
      {group.audioUrl ? <audio key={group.audioUrl} controls preload="metadata" src={group.audioUrl} style={{ width: "100%" }} /> :
        <p className={s.error}>Tải tệp audio chung cho nhóm.</p>}
      <p>Thứ tự câu trong audio · {group.questions.map((q, index) => q.questionNo || index + 1).join(" → ")}</p>
    </div>
  );

  // Sync blueprint when level changes
  useEffect(() => {
    const bp = examBlueprint.levels.find((l) => l.level === authorLevel);
    if (bp) {
      setAuthorDuration(bp.durationMin);
      setAuthorPass("");
      setAuthorTitle(`Đề thi thử chuẩn ${levelLabel(authorLevel)} (CTI Hanban 样卷)`);
    }
  }, [authorLevel]);

  const load = useCallback(() => {
    if (role !== "ADMIN" && role !== "TEACHER") return;
    if (view === "grading") {
      void examApi<Queue>("grading").then(setQueue).catch((e) => setError(e.message));
    } else if (view === "publications") {
      void examApi<Candidate[]>("publications").then(setPapers).catch((e) => setError(e.message));
    }
  }, [role, view]);

  useEffect(() => {
    load();
  }, [load]);

  if (role !== "ADMIN" && role !== "TEACHER") {
    return <p role="alert" className={s.error}>Chỉ Giáo viên và Quản trị viên có quyền truy cập mục này.</p>;
  }

  // Load official HSK 3.0 sample template from HSK3.0 directory
  const loadSampleTemplate = (lvl: number) => {
    if (mediaUploading) return;
    const bp = examBlueprint.levels.find((l) => l.level === lvl);
    const defGroups = buildDefaultGroups(lvl);
    const flat = flattenGroups(defGroups);

    setAuthorLevel(lvl);
    setAuthorTitle(`Đề thi mẫu chuẩn ${levelLabel(lvl)} (CTI Hanban 样卷)`);
    setAuthorDesc(`Đề thi mô phỏng chuẩn cấu trúc đề thật HSK 3.0 Cấp ${lvl} (CTI / Hanban).`);
    setAuthorDuration(bp?.durationMin || (lvl === 1 ? 40 : lvl === 2 ? 60 : 83));
    setAuthorPass("");
    setGroups(defGroups);
    setActiveGroupId(defGroups[0]?.id || "group_1");
    setJsonInput(JSON.stringify(flat, null, 2));
    setMessage(`Đã nạp ${flat.length} câu hỏi chuẩn HSK ${lvl} chia thành ${defGroups.length} nhóm bài chuẩn. Bấm "Xem trước" để kiểm tra giao diện học sinh.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mediaUploading) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error("Tệp JSON phải chứa một danh sách các câu hỏi [ ... ].");
        }
        setJsonInput(JSON.stringify(parsed, null, 2));
        const importedGroups = unflattenToGroups(parsed, authorLevel);
        setGroups(importedGroups);
        if (importedGroups.length > 0) setActiveGroupId(importedGroups[0].id);
        setMessage(`Đã nạp thành công ${parsed.length} câu hỏi từ tệp "${file.name}". Bấm "Xem trước" để kiểm tra.`);
        setError("");
      } catch (err) {
        setError(`Lỗi khi đọc tệp JSON: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDownloadTemplate = () => {
    try {
      const flat = authorMode === "grouped" ? flattenGroups(groups) : (jsonInput ? JSON.parse(jsonInput) : getSampleQuestionsForLevel(authorLevel));
      const blob = new Blob([JSON.stringify(flat, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hsk${authorLevel}_sample_exam_template.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Không thể tải tệp mẫu.");
    }
  };

  // Xóa toàn bộ đề thi cũ an toàn (fix triệt để lỗi "Yêu cầu không hợp lệ")
  const handlePurgeOld = async () => {
    if (
      !window.confirm(
        "BẠN CÓ CHẮC CHẮN MUỐN XÓA TOÀN BỘ CÁC ĐỀ THI MÔ PHỎNG CŨ VÀ DỌN SẠCH DỮ LIỆU KHÔNG?\n\n- Toàn bộ đề thi mô phỏng cũ sẽ bị xóa.\n- Tất cả lượt thi thử nghiệm cũ sẽ được làm sạch.\n\nSau khi xóa, bạn có thể nạp các bộ đề chuẩn HSK 3.0 mới nhất."
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await examApi<{ success: boolean; deletedSets: number; deletedLogs: number }>("purgeOldMockExams", {});
      setMessage(`Đã dọn sạch kho đề! Đã xóa ${res.deletedSets} bộ đề cũ và ${res.deletedLogs} bản ghi lịch sử.`);
      onChanged();
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Xóa 1 đề thi cụ thể (Xóa đơn)
  const handleDeletePaper = async (paperId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đề thi này không? Toàn bộ câu hỏi của đề sẽ bị xóa.")) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await examApi("deletePaper", { paperId });
      setMessage("Đã xóa vĩnh viễn đề thi thành công!");
      onChanged();
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Thêm nhóm bài mới (có thể theo khuôn mẫu dạng bài HSK)
  const handleAddGroup = (template?: typeof HSK_GROUP_TEMPLATES[number]) => {
    const newId = `group_${Date.now()}`;
    const defaultAudio = groupAudioForLevel(authorLevel);
    let newGroup: ExamSectionGroup;

    if (template) {
      const gType = ("groupType" in template ? template.groupType : undefined) || "standard";
      const initialImages = (template as any).groupImages
        ? (template as any).groupImages.map((img: any) => ({ ...img }))
        : gType === "matching_images"
        ? ["A", "B", "C", "D", "E", "F"].map((id) => ({ id, label: `Tranh ${id}`, imageUrl: "" }))
        : undefined;

      const questionsCount = (gType === "matching_images" || gType === "eval_true_false_na") ? 5 : 1;
      const initialQuestions: QuestionItem[] = [];
      for (let i = 1; i <= questionsCount; i++) {
        initialQuestions.push({
          id: `q_${Date.now()}_${i}`,
          questionNo: i,
          type: template.type,
          content: gType === "matching_images" && template.skill === "READING" ? "" : `第 ${i} 题：${template.samplePrompt || "请选择正确答案。"}`,
          points: template.points,
          correctAnswer: gType === "matching_images" ? "" : template.correctAnswer,
          acceptedAnswers: (template as any).acceptedAnswers || "",
          requiresManualReview: !!(template as any).requiresManualReview,
          options: Array.isArray(template.options) ? template.options.map((opt) => ({ ...opt })) : [],
        });
      }

      newGroup = {
        id: newId,
        title: `Nhóm ${groups.length + 1}: ${template.name}`,
        skill: template.skill,
        instruction: template.instruction,
        audioUrl: template.skill === "LISTENING" && gType !== "matching_images" && gType !== "listening_choice_abc" ? defaultAudio : "",
        passage: template.passage || "",
        groupType: gType,
        groupImages: initialImages,
        questions: initialQuestions,
      };
    } else {
      newGroup = {
        id: newId,
        title: `Nhóm ${groups.length + 1}: Phần câu hỏi mới`,
        skill: "READING",
        instruction: "Đọc câu hỏi và chọn đáp án chính xác.",
        groupType: "standard",
        questions: [
          {
            id: `q_${Date.now()}_1`,
            questionNo: 1,
            type: "multiple_choice",
            content: "第 1 题：请选择正确答案。",
            points: 2.5,
            correctAnswer: "A",
            options: [
              { id: "A", text: "Lựa chọn A" },
              { id: "B", text: "Lựa chọn B" },
              { id: "C", text: "Lựa chọn C" },
              { id: "D", text: "Lựa chọn D" },
            ],
          },
        ],
      };
    }
    setGroups([...groups, newGroup]);
    setActiveGroupId(newId);
  };

  // Sao chép câu hỏi
  const handleDuplicateQuestion = (groupId: string, qId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const qIndex = g.questions.findIndex((q) => q.id === qId);
        if (qIndex === -1) return g;
        const source = g.questions[qIndex];
        const nextQNo = source.questionNo && !isNaN(Number(source.questionNo))
          ? Number(source.questionNo) + 1
          : g.questions.length + 1;
        const cloned: QuestionItem = {
          ...source,
          id: `q_${Date.now()}_copy`,
          questionNo: nextQNo,
          content: `${source.content} (Bản sao)`,
          options: source.options.map((opt) => ({ ...opt })),
        };
        const nextQuestions = [...g.questions];
        nextQuestions.splice(qIndex + 1, 0, cloned);
        return { ...g, questions: nextQuestions };
      })
    );
  };

  // Xóa nhóm bài
  const handleDeleteGroup = (groupId: string) => {
    if (groups.length <= 1) {
      setError("Đề thi phải có ít nhất 1 nhóm bài.");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ nhóm bài này và các câu hỏi bên trong?")) return;
    const next = groups.filter((g) => g.id !== groupId);
    setGroups(next);
    if (activeGroupId === groupId) {
      setActiveGroupId(next[0]?.id || "");
    }
  };

  // Cập nhật thông tin nhóm bài
  const handleUpdateGroup = (groupId: string, patch: Partial<ExamSectionGroup>) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, ...patch } : g))
    );
  };

  // Thêm câu hỏi vào nhóm (tự động kế thừa dạng câu hỏi của nhóm)
  const handleAddQuestionToGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const totalInGroup = g.questions.length + 1;
        const lastQ = g.questions[g.questions.length - 1];
        const nextQNo = lastQ?.questionNo && !isNaN(Number(lastQ.questionNo))
          ? Number(lastQ.questionNo) + 1
          : totalInGroup;

        const targetType = g.groupType === "matching_images" ? "matching" : lastQ ? lastQ.type : g.skill === "LISTENING" ? "listening_choice" : "multiple_choice";
        let initialOptions: QuestionOption[] = [
          { id: "A", text: "Lựa chọn A" },
          { id: "B", text: "Lựa chọn B" },
          { id: "C", text: "Lựa chọn C" },
          { id: "D", text: "Lựa chọn D" },
        ];
        let initialAnswer = "A";

        if (g.groupType === "matching_images" || targetType === "matching") {
          if (g.groupType === "matching_images") initialAnswer = "";
          initialOptions = ["A", "B", "C", "D", "E", "F"].map((l) => ({ id: l, text: `Tranh ${l}` }));
        } else if (g.groupType === "listening_choice_abc") {
          initialOptions = [
            { id: "A", text: "吃饭", pinyin: "chī fàn" },
            { id: "B", text: "喝茶", pinyin: "hē chá" },
            { id: "C", text: "看书", pinyin: "kàn shū" },
          ];
        } else if (g.groupType === "eval_true_false_na" || targetType === "true_false_na") {
          initialOptions = [
            { id: "true", text: "√ Đúng (对)" },
            { id: "false", text: "× Sai (错)" },
            { id: "not_mentioned", text: "〇 Không đề cập (没提及)" },
          ];
          initialAnswer = "true";
        } else if (g.groupType === "listening_fill_blank" || targetType === "listening_fill") {
          initialOptions = [];
          initialAnswer = "";
        } else if (targetType === "true_false") {
          initialOptions = [
            { id: "true", text: "Đúng (对)" },
            { id: "false", text: "Sai (错)" },
          ];
          initialAnswer = "true";
        } else if (lastQ && Array.isArray(lastQ.options) && lastQ.options.length) {
          initialOptions = lastQ.options.map((opt) => ({ id: opt.id, text: opt.text || `Lựa chọn ${opt.id}`, pinyin: opt.pinyin || "" }));
        }

        const newQ: QuestionItem = {
          id: `q_${Date.now()}_${totalInGroup}`,
          questionNo: nextQNo,
          type: targetType,
          content: g.groupType === "matching_images" && g.skill === "READING" ? "" : `第 ${nextQNo} 题：请根据题目选择正确答案。`,
          points: lastQ?.points ?? 2.5,
          correctAnswer: initialAnswer,
          acceptedAnswers: lastQ?.acceptedAnswers || "",
          requiresManualReview: !!lastQ?.requiresManualReview,
          options: initialOptions,
        };
        return { ...g, questions: [...g.questions, newQ] };
      })
    );
  };

  // Xóa câu hỏi trong nhóm
  const handleDeleteQuestion = (groupId: string, qId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        if (g.questions.length <= 1) {
          setError("Mỗi nhóm bài phải có ít nhất 1 câu hỏi.");
          return g;
        }
        return { ...g, questions: g.questions.filter((q) => q.id !== qId) };
      })
    );
  };

  // Cập nhật câu hỏi trong nhóm
  const handleUpdateQuestion = (groupId: string, qId: string, patch: Partial<QuestionItem>) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          questions: g.questions.map((q) => (q.id === qId ? { ...q, ...patch } : q)),
        };
      })
    );
  };

  // Upload ảnh cho câu hỏi
  const handleUploadQuestionImage = (groupId: string, qId: string, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      handleUpdateQuestion(groupId, qId, { imageUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  // Upload ảnh cho lựa chọn đáp án
  const handleUploadOptionImage = (groupId: string, qId: string, optId: string, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id !== groupId) return g;
          return {
            ...g,
            questions: g.questions.map((q) => {
              if (q.id !== qId) return q;
              return {
                ...q,
                options: q.options.map((opt) => (opt.id === optId ? { ...opt, imageUrl: dataUrl } : opt)),
              };
            }),
          };
        })
      );
    };
    reader.readAsDataURL(file);
  };

  // Đổi chế độ Soạn bài
  const handleSwitchMode = (targetMode: "grouped" | "raw") => {
    if (mediaUploading) return;
    if (targetMode === "raw") {
      const flat = flattenGroups(groups);
      setJsonInput(JSON.stringify(flat, null, 2));
      setAuthorMode("raw");
    } else {
      try {
        if (jsonInput.trim()) {
          const parsed = JSON.parse(jsonInput);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const imported = unflattenToGroups(parsed, authorLevel);
            setGroups(imported);
            if (imported.length > 0) setActiveGroupId(imported[0].id);
          }
        }
      } catch {
        setError("JSON chưa đúng định dạng. Đã giữ nguyên cấu trúc nhóm bài cũ.");
      }
      setAuthorMode("grouped");
    }
  };

  // Preview giao diện học sinh
  const handlePreview = () => {
    let parsed: ImportedQuestion[] = [];
    if (authorMode === "grouped") {
      parsed = flattenGroups(groups);
    } else {
      try {
        parsed = jsonInput.trim() ? JSON.parse(jsonInput) : [];
      } catch {
        setError("Cấu trúc JSON câu hỏi chưa đúng định dạng. Hãy kiểm tra lại dấu phẩy hoặc ngoặc kép.");
        return;
      }
    }
    if (!parsed.length) {
      setError("Vui lòng nhập ít nhất 1 câu hỏi hoặc bấm nút nạp mẫu đề HSK 3.0 trước khi xem trước.");
      return;
    }

    const bp = examBlueprint.levels.find((l) => l.level === authorLevel);
    const maxScore = parsed.reduce((sum, q) => sum + Number(q.points ?? 1), 0) || bp?.maxScore || 300;
    const mockPaper = {
      id: "preview_paper_id",
      title: authorTitle,
      description: authorDesc,
      level: authorLevel,
      source: "OFFICIAL" as const,
      durationMin: authorDuration,
      maxScore,
      passScore: authorPass ? Number(authorPass) : null,
      questionsCount: parsed.length,
      skills: bp?.skills || ["LISTENING", "READING", "WRITING"],
      mode: "EXAM" as const,
      available: true,
      questions: parsed,
    };

    const mockAttempt = {
      id: "preview_attempt_id",
      paperId: "preview_paper_id",
      paper: mockPaper,
      title: authorTitle,
      level: authorLevel,
      source: "OFFICIAL",
      durationMin: authorDuration,
      maxScore,
      passScore: authorPass ? Number(authorPass) : null,
      questionsCount: parsed.length,
      skills: mockPaper.skills,
      mode: "EXAM",
      status: "IN_PROGRESS",
      startedAt: new Date().toISOString(),
      submittedAt: null,
      score: null,
      revision: 1,
      progress: 0,
      answered: 0,
      result: "UNSET",
      remainingSec: authorDuration * 60,
      expiresAt: new Date(Date.now() + authorDuration * 60000).toISOString(),
      answers: {},
      serverNow: new Date().toISOString(),
      questions: parsed.map((q, idx) => {
        const question = snapshotQuestion({ ...q, id: `preview_${idx}`, level: authorLevel }, Number(q.points ?? 1));
        const audioUrl = q.groupId ? parsed.find(item => item.groupId === q.groupId && item.audioUrl)?.audioUrl : undefined;
        const publicQuestion = publicExamQuestion(question, audioUrl ? { audioUrl } : undefined);
        return question.skill === "LISTENING" ? { ...publicQuestion, content: "", pinyin: "" } : publicQuestion;
      }),
    };

    setPreviewPaper(mockPaper);
    setPreviewAttemptView(mockAttempt);
    setPreviewStep("lobby");
    setError("");
  };

  // Lưu & Xuất bản đề thi
  const handleSaveImport = async () => {
    if (mediaUploading) return;
    setPublishedLink("");
    setBusy(true);
    setError("");
    setMessage("");
    try {
      let parsed: ImportedQuestion[] = [];
      if (authorMode === "grouped") {
        parsed = flattenGroups(groups);
      } else {
        if (jsonInput.trim()) {
          parsed = JSON.parse(jsonInput);
        }
      }
      if (!parsed.length) {
        throw new Error("Vui lòng nhập ít nhất 1 câu hỏi hoặc bấm 'Nạp mẫu đề từ thư mục HSK3.0' trước khi lưu.");
      }

      const { paperId } = await examApi<{ paperId: string }>("importPaper", {
        level: authorLevel,
        title: authorTitle,
        description: authorDesc,
        durationMin: authorDuration,
        passScore: authorPass === "" ? null : Number(authorPass),
        questions: parsed,
      });

      setPublishedLink(`/s/mock-exam?${new URLSearchParams({ view: "intro", id: paperId, level: String(levelGroup(authorLevel)) })}`);
      setMessage(`Đã xuất bản đề “${authorTitle}” (${parsed.length} câu). Học sinh có thể mở đề trong phòng thi.`);
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const totalQuestionsCount = authorMode === "grouped"
    ? groups.reduce((sum, g) => sum + g.questions.length, 0)
    : 0;

  const totalPointsSum = authorMode === "grouped"
    ? groups.reduce((sum, g) => sum + g.questions.reduce((qSum, q) => qSum + (Number(q.points) || 0), 0), 0)
    : 0;

  return (
    <section className={s.panel} aria-label="Khu vực quản lý khảo thí">
      {/* Navigation Sub-Tabs */}
      <div className={s.filters} style={{ marginBottom: 20 }}>
        <button
          aria-pressed={view === "authoring"}
          onClick={() => onNavigate?.("authoring")}
        >
          <FileText size={16} /> Nhập & Soạn đề HSK 3.0
        </button>
        <button
          aria-pressed={view === "publications"}
          onClick={() => onNavigate?.("publications")}
        >
          <FileCheck2 size={16} /> Duyệt & cấu hình đề
        </button>
        <button
          aria-pressed={view === "grading"}
          onClick={() => onNavigate?.("grading")}
        >
          <BookOpen size={16} /> Chấm bài tự luận
        </button>
      </div>

      <h1>
        {view === "authoring"
          ? "Soạn đề & Quản lý đề thi chuẩn HSK 3.0"
          : view === "grading"
          ? "Chấm bài tự luận"
          : "Duyệt & cấu hình đề chính thức"}
      </h1>

      <p>
        {view === "authoring"
          ? "Admin soạn đề thi trực quan theo từng Nhóm bài (Câu 1-5, Câu 6-10, bài đọc chung, audio bài nghe, ảnh đề & ảnh đáp án). Có chế độ xem trước đúng 100% giao diện học sinh."
          : view === "grading"
          ? "Điểm các câu tự luận được cộng với phần chấm tự động sau khi lưu."
          : "Duyệt nội dung sẵn sàng, xóa đề lỗi/đề thử nghiệm, đặt thời gian và ngưỡng đạt trước khi mở cho học sinh."}
      </p>

      {error && <p className={s.error} role="alert">{error}</p>}
      {message && <p className={s.notice} role="status">{message}{view === "authoring" && publishedLink && (
        <> <Link className={s.publishedExamLink} href={publishedLink} target="_blank" rel="noreferrer">Mở liên kết đề thi cho học sinh</Link></>
      )}</p>}

      {/* VIEW: AUTHORING WORKSPACE */}
      {view === "authoring" && (
        <div style={{ display: "grid", gap: 24, marginTop: 20 }}>
          {/* Action Toolbar */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, background: "#f8f9f4", padding: "12px 16px", borderRadius: 12, border: "1px solid #dce4cb" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#375531" }}>
                <Sparkles size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                Nạp mẫu khung chuẩn:
              </span>
              {EXAM_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={authorLevel === lvl ? s.primary : s.secondary}
                  style={{ fontSize: 12, padding: "5px 12px", minHeight: 30 }}
                  onClick={() => loadSampleTemplate(lvl)}
                >
                  {levelLabel(lvl)}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                className={s.secondary}
                style={{ fontSize: 12, padding: "6px 12px", minHeight: 32, display: "inline-flex", alignItems: "center", gap: 5 }}
                onClick={handleDownloadTemplate}
                title="Tải tệp mẫu JSON về máy tính để sao lưu"
              >
                <Download size={14} /> Tải tệp JSON cấp {authorLevel}
              </button>

              <button
                type="button"
                className={s.secondary}
                style={{ fontSize: 12, padding: "6px 12px", minHeight: 32, display: "inline-flex", alignItems: "center", gap: 5 }}
                onClick={() => fileInputRef.current?.click()}
                title="Tải tệp .json từ máy tính lên hệ thống"
              >
                <Upload size={14} /> Nạp tệp JSON từ máy
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />

              <button
                type="button"
                style={{
                  fontSize: 12,
                  padding: "6px 12px",
                  minHeight: 32,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#fee2e2",
                  color: "#991b1b",
                  border: "1px solid #f87171",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                onClick={handlePurgeOld}
                title="Xóa toàn bộ đề thi thử cũ và dọn sạch dữ liệu"
              >
                <Trash2 size={14} /> Xóa tất cả đề cũ
              </button>
            </div>
          </div>

          {/* Form Configuration Metadata */}
          <div style={{ background: "#ffffff", padding: 20, borderRadius: 14, border: "1px solid #e0e7d5" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#223824", display: "flex", alignItems: "center", gap: 8 }}>
              <FileCheck2 size={18} color="#3e6234" />
              Thông tin chung bộ đề thi
            </h3>
            <div className={s.formColumns}>
              <label>
                Cấp độ HSK *
                <select
                  value={authorLevel}
                  onChange={(e) => setAuthorLevel(Number(e.target.value))}
                >
                  {EXAM_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {levelLabel(lvl)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Tên đề thi *
                <input
                  required
                  value={authorTitle}
                  onChange={(e) => setAuthorTitle(e.target.value)}
                  placeholder="Ví dụ: Đề thi thử chuẩn HSK 1 · Đề số 01"
                />
              </label>
            </div>

            <div className={s.formColumns} style={{ marginTop: 12 }}>
              <label>
                Thời gian làm bài (phút) *
                <input
                  required
                  type="number"
                  min={1}
                  max={600}
                  value={authorDuration}
                  onChange={(e) => setAuthorDuration(Number(e.target.value))}
                />
              </label>

              <label>
                Mốc điểm đạt (Mục tiêu)
                <input
                  type="number"
                  placeholder="Để trống để dùng mốc theo thang điểm HSK"
                  min={0}
                  step="any"
                  value={authorPass}
                  onChange={(e) => setAuthorPass(e.target.value)}
                />
              </label>
            </div>

            <label style={{ marginTop: 12, display: "block" }}>
              Mô tả đề thi
              <input
                value={authorDesc}
                onChange={(e) => setAuthorDesc(e.target.value)}
                placeholder="Ví dụ: Đề thi chuẩn HSK 3.0 Hanban mô phỏng cấu trúc đề thi thật..."
              />
            </label>
          </div>

          {/* Mode Switcher: Form Nhóm Bài trực quan vs JSON nâng cao */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div className={s.filters} style={{ margin: 0 }}>
              <button
                type="button"
                aria-pressed={authorMode === "grouped"}
                onClick={() => handleSwitchMode("grouped")}
                style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Layers size={15} /> Soạn theo nhóm bài (Trực quan - Khuyên dùng)
              </button>
              <button
                type="button"
                aria-pressed={authorMode === "raw"}
                onClick={() => handleSwitchMode("raw")}
                style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <FileText size={15} /> Nhập mã JSON (Nâng cao)
              </button>
            </div>

            {authorMode === "grouped" && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#3e5b38" }}>
                <span>Tổng cộng: <strong>{totalQuestionsCount} câu hỏi</strong></span>
                <span>•</span>
                <span>Tổng điểm: <strong>{totalPointsSum.toFixed(1)} điểm</strong></span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleAddGroup()}
                  style={{
                    background: "#2f5231",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Plus size={14} /> Thêm nhóm bài mới
                </button>
              </div>
            )}
          </div>

          {/* MODE 1: SOẠN THEO NHÓM BÀI (GROUPED FORM EDITOR) */}
          {authorMode === "grouped" && (
            <div style={{ display: "grid", gap: 20 }}>
              {groups.map((group, gIdx) => {
                const isExpanded = activeGroupId === group.id;
                return (
                  <div
                    key={group.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: 14,
                      border: isExpanded ? "2px solid #5a8a50" : "1px solid #dbe4ce",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      transition: "border 0.2s ease",
                    }}
                  >
                    {/* Group Header */}
                    <div
                      style={{
                        padding: "14px 18px",
                        background: isExpanded ? "#f2f7ec" : "#fafbf7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        borderBottom: isExpanded ? "1px solid #d8e3ca" : "none",
                      }}
                      onClick={() => setActiveGroupId(isExpanded ? "" : group.id)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: group.skill === "LISTENING" ? "#dcfce7" : group.skill === "READING" ? "#e0e7ff" : "#fef3c7",
                            color: group.skill === "LISTENING" ? "#166534" : group.skill === "READING" ? "#3730a3" : "#92400e",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {group.skill === "LISTENING" ? <Headphones size={18} /> : group.skill === "READING" ? <BookOpen size={18} /> : <FileText size={18} />}
                        </div>
                        <div>
                          <strong style={{ fontSize: 15, color: "#1e3321" }}>
                            {group.title || `Nhóm bài ${gIdx + 1}`}
                          </strong>
                          <div style={{ fontSize: 12, color: "#617d5c", marginTop: 2 }}>
                            {skillNames[group.skill] || group.skill} • {group.questions.length} câu hỏi • Tổng {group.questions.reduce((s, q) => s + (Number(q.points) || 0), 0)} điểm
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleAddQuestionToGroup(group.id)}
                          style={{
                            padding: "5px 10px",
                            borderRadius: 6,
                            background: "#e4ecdb",
                            color: "#2a4727",
                            border: "none",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                          title="Thêm câu hỏi vào nhóm này"
                        >
                          <Plus size={13} /> Thêm câu
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGroup(group.id)}
                          style={{
                            padding: "5px 8px",
                            borderRadius: 6,
                            background: "#fee2e2",
                            color: "#991b1b",
                            border: "none",
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                          title="Xóa nhóm bài này"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveGroupId(isExpanded ? "" : group.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#54744f",
                            cursor: "pointer",
                            padding: 4,
                          }}
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Group Details (if expanded) */}
                    {isExpanded && (
                      <div style={{ padding: 20 }}>
                        {/* Group Configuration Fields */}
                        <div style={{ background: "#fdfdf9", padding: 16, borderRadius: 12, border: "1px solid #e5ecd9", marginBottom: 20 }}>
                          <div className={s.formColumns}>
                            <label>
                              Tiêu đề nhóm bài *
                              <input
                                value={group.title}
                                onChange={(e) => handleUpdateGroup(group.id, { title: e.target.value })}
                                placeholder="Ví dụ: Phần 1 Nghe: Phán đoán tranh Đúng / Sai (Câu 1 - 5)"
                              />
                            </label>

                            <label>
                              Kỹ năng *
                              <select
                                value={group.skill}
                                onChange={(e) => handleUpdateGroup(group.id, { skill: e.target.value as any })}
                              >
                                <option value="LISTENING">🎧 Nghe (LISTENING)</option>
                                <option value="READING">📖 Đọc (READING)</option>
                                <option value="WRITING">✍️ Viết (WRITING)</option>
                                <option value="SPEAKING">🗣️ Nói (SPEAKING)</option>
                              </select>
                            </label>

                            <label>
                              Định dạng cấu trúc nhóm:
                              <select
                                value={group.groupType || "standard"}
                                onChange={(e) => {
                                  const gType = e.target.value as any;
                                  const patch: Partial<ExamSectionGroup> = { groupType: gType };
                                  if (gType === "matching_images" && (!group.groupImages || !group.groupImages.length)) {
                                    patch.groupImages = ["A", "B", "C", "D", "E", "F"].map((id) => ({ id, label: `Tranh ${id}`, imageUrl: "" }));
                                  }
                                  handleUpdateGroup(group.id, patch);
                                }}
                              >
                                <option value="standard">Tiêu chuẩn (Trắc nghiệm / Tự luận từng câu)</option>
                                <option value="matching_images">🖼️ {group.skill === "READING" ? "Đọc câu ghép tranh A–F" : "Ghép tranh A–F"}</option>
                                <option value="listening_choice_abc">🎧 Nghe câu hỏi – Chọn đáp án A/B/C (Ẩn kịch bản với HS)</option>
                                <option value="eval_true_false_na">✅ Nghe đánh giá Đúng / Sai / Không đề cập (√ / × / 〇)</option>
                                <option value="listening_fill_blank">⌨️ Nghe và điền đáp án (Chỗ trống / Dùng chung Audio)</option>
                              </select>
                            </label>
                          </div>

                          <label style={{ marginTop: 12, display: "block" }}>
                            Hướng dẫn làm bài cho nhóm
                            <input
                              value={group.instruction || ""}
                              onChange={(e) => handleUpdateGroup(group.id, { instruction: e.target.value })}
                              placeholder="Ví dụ: Nghe ghi âm và phán đoán câu nói có khớp với bức tranh hay không."
                            />
                          </label>

                          {/* File bài nghe chung của nhóm (cho phần Nghe tiêu chuẩn) */}
                          {group.skill === "LISTENING" && group.groupType !== "matching_images" && group.groupType !== "listening_choice_abc" && group.groupType !== "eval_true_false_na" && group.groupType !== "listening_fill_blank" && (
                            <div style={{ marginTop: 14, padding: 12, background: "#f2f8eb", borderRadius: 10, border: "1px solid #d4e3cb" }}>
                              <label style={{ fontSize: 13, fontWeight: 600, color: "#254422", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                <Music size={16} /> File bài nghe âm thanh (.mp3) chung cho nhóm này:
                              </label>
                              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                <select
                                  style={{ minWidth: 260, fontSize: 12, padding: "7px 10px", borderRadius: 8, border: "1px solid #c8d7bf", background: "#fff" }}
                                  onChange={(e) => {
                                    if (e.target.value) handleUpdateGroup(group.id, { audioUrl: e.target.value });
                                  }}
                                  value={
                                    [
                                      "/audio/hsk1_exam.mp3",
                                      "/audio/hsk2_exam.mp3",
                                      "/audio/hsk3_exam.mp3",
                                      "/audio/hsk4_exam.mp3",
                                      "/audio/hsk5_exam.mp3",
                                      "/audio/hsk6_exam.mp3",
                                      "/audio/hsk7_exam.mp3",
                                    ].includes(group.audioUrl || "")
                                      ? group.audioUrl
                                      : ""
                                  }
                                >
                                  <option value="">-- Chọn file audio mẫu có sẵn --</option>
                                  <option value="/audio/hsk1_exam.mp3">🎵 HSK 1: HSK（一级）样卷.mp3</option>
                                  <option value="/audio/hsk2_exam.mp3">🎵 HSK 2: HSK（二级）样卷.mp3</option>
                                  <option value="/audio/hsk3_exam.mp3">🎵 HSK 3: HSK（三级）样卷.mp3</option>
                                  <option value="/audio/hsk4_exam.mp3">🎵 HSK 4: HSK（四级）样卷.mp3</option>
                                  <option value="/audio/hsk5_exam.mp3">🎵 HSK 5: HSK（五级）样卷.mp3</option>
                                  <option value="/audio/hsk6_exam.mp3">🎵 HSK 6: HSK（六级）样卷.mp3</option>
                                  <option value="/audio/hsk7_exam.mp3">🎵 HSK 7-9: HSK（七—九级）听力.mp3</option>
                                </select>
                                <input
                                  style={{ flex: 1, minWidth: 220 }}
                                  value={group.audioUrl || ""}
                                  onChange={(e) => handleUpdateGroup(group.id, { audioUrl: e.target.value })}
                                  placeholder="Hoặc dán link audio MP3..."
                                />
                                <label style={{ cursor: "pointer", background: "#e0ebdb", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#254422", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  <Upload size={14} /> Tải MP3 từ máy
                                  <input
                                    type="file"
                                    accept="audio/*"
                                    style={{ display: "none" }}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const r = new FileReader();
                                        r.onload = () => handleUpdateGroup(group.id, { audioUrl: String(r.result) });
                                        r.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                              {group.audioUrl && (
                                <div style={{ marginTop: 8 }}>
                                  <audio controls src={group.audioUrl} style={{ width: "100%", height: 36 }} />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Đoạn văn đọc hiểu chung (cho phần Đọc) */}
                          {group.skill === "READING" && group.groupType !== "matching_images" && (
                            <div style={{ marginTop: 14 }}>
                              <label style={{ fontSize: 13, fontWeight: 600, color: "#254422", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                <BookOpen size={16} /> Đoạn văn đọc hiểu chung (nếu các câu hỏi bên dưới cùng đọc 1 bài):
                              </label>
                              <textarea
                                rows={4}
                                value={group.passage || ""}
                                onChange={(e) => handleUpdateGroup(group.id, { passage: e.target.value })}
                                placeholder="Nếu đây là dạng bài đọc hiểu (ví dụ Câu 26-30 cùng đọc đoạn văn này), hãy dán nội dung đoạn văn vào đây..."
                                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d5dfc3", fontSize: 13, lineHeight: 1.6 }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Danh sách câu hỏi trong nhóm - Xử lý theo từng loại groupType */}
                        {group.groupType === "matching_images" ? (
                          <div style={{ display: "grid", gap: 16 }}>
                            <div className={s.examGroupCard}>
                              <strong>Bước 1. Tải sáu hình ảnh dùng chung</strong>
                              <div className={s.examPictureGrid}>
                                {pictureSlots(group.groupImages).map(img => (
                                  <div key={img.id} className={s.examPictureSlot}>
                                    <div className={s.examPicturePreview}>
                                      {img.imageUrl ? <img src={img.imageUrl} alt={img.label} /> : <ImageIcon size={28} aria-hidden="true" />}
                                    </div>
                                    <strong>{img.label}</strong>
                                    {mediaActions(`${group.id}_${img.id}`, img.imageUrl, `ảnh ${img.id}`, "image", url => handleUpdateGroupImage(group.id, img.id, url))}
                                  </div>
                                ))}
                              </div>
                              {pictureGroupIssues(group.groupImages || [], group.questions, group.skill === "READING").map(issue => (
                                <p key={issue} className={s.error}>{issue}</p>
                              ))}
                            </div>

                            {group.skill === "LISTENING" && groupAudioEditor(group, "Bước 2. Tải một tệp audio cho cả nhóm")}

                            {/* Bước 3: Cài đáp án cho các câu */}
                            <div style={{ background: "#ffffff", border: "1px solid #dce4cb", borderRadius: 12, padding: 16 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#254422" }}>
                                  {group.skill === "READING" ? "Bước 2. Nhập 5 câu đọc" : `Bước 3. Cài đáp án cho ${group.questions.length} câu`}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleAddQuestionToGroup(group.id)}
                                  style={{
                                    background: "#41683d",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "4px 10px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <Plus size={13} /> Thêm câu
                                </button>
                              </div>
                              <div style={{ display: "grid", gap: 10 }}>
                                {group.questions.map((q, qIdx) => {
                                  const isScriptOpen = openQuestionScripts[q.id];
                                  return (
                                    <div key={q.id} style={{ border: "1px solid #e2ebd5", borderRadius: 8, padding: 10, background: "#fcfdfb" }}>
                                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                          <input
                                            value={q.questionNo || `Câu ${qIdx + 1}`}
                                            onChange={(e) => handleUpdateQuestion(group.id, q.id, { questionNo: e.target.value })}
                                            style={{ width: 85, fontWeight: 700, fontSize: 12, padding: "4px 6px", borderRadius: 6, border: "1px solid #cbd5e1" }}
                                            placeholder="Mã câu"
                                            aria-label="Mã câu hỏi"
                                            title="Sửa mã câu hỏi"
                                          />
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                          <label style={{ fontSize: 12, color: "#375531", display: "flex", alignItems: "center", gap: 4, margin: 0 }}>
                                            Điểm:
                                            <input
                                              type="number"
                                              step="0.5"
                                              min={0}
                                              value={q.points}
                                              onChange={(e) => handleUpdateQuestion(group.id, q.id, { points: Number(e.target.value) })}
                                              style={{ width: 55, padding: "2px 4px", fontSize: 12 }}
                                            />
                                          </label>

                                          <button
                                            type="button"
                                            onClick={() => toggleQuestionScript(q.id)}
                                            style={{
                                              background: isScriptOpen ? "#dcfce7" : "#f1f5f9",
                                              color: isScriptOpen ? "#166534" : "#475569",
                                              border: "1px solid #cbd5e1",
                                              borderRadius: 6,
                                              padding: "4px 8px",
                                              fontSize: 11,
                                              fontWeight: 600,
                                              cursor: "pointer",
                                              display: "inline-flex",
                                              alignItems: "center",
                                              gap: 4,
                                            }}
                                          >
                                            {isScriptOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                            {group.skill === "READING" ? "Lời giải" : "Kịch bản và lời giải"}
                                          </button>

                                          {group.questions.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteQuestion(group.id, q.id)}
                                              style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}
                                              title="Xóa câu hỏi này"
                                            >
                                              <Trash2 size={13} />
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {group.skill === "READING" && (
                                        <div className={s.examReadingFields}>
                                          <label>Câu chữ Hán
                                            <input lang="zh" value={q.content} onChange={event => handleUpdateQuestion(group.id, q.id, { content: event.target.value })} />
                                          </label>
                                          <label>Pinyin (tùy chọn)
                                            <input value={q.pinyin || ""} onChange={event => handleUpdateQuestion(group.id, q.id, { pinyin: event.target.value })} />
                                          </label>
                                        </div>
                                      )}

                                      <div className={s.examPictureAnswers} role="group" aria-label="Chọn tranh đúng">
                                        <span>Tranh đúng</span>
                                        {PICTURE_CODES.map((optId) => {
                                          const isChecked = q.correctAnswer === optId;
                                          return (
                                            <label key={optId} style={{ display: "inline-flex", alignItems: "center", gap: 3, cursor: "pointer", fontSize: 13, fontWeight: isChecked ? 700 : 500, color: isChecked ? "#15803d" : "#334155" }}>
                                              <input
                                                type="radio"
                                                name={`correct_matching_${group.id}_${q.id}`}
                                                checked={isChecked}
                                                disabled={group.skill === "READING" && !isChecked && group.questions.some(other => other.id !== q.id && other.correctAnswer === optId)}
                                                onChange={() => handleUpdateQuestion(group.id, q.id, { correctAnswer: optId })}
                                                style={{ cursor: "pointer", width: 15, height: 15 }}
                                              />
                                              {optId}
                                            </label>
                                          );
                                        })}
                                      </div>

                                      {isScriptOpen && (
                                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #d5dfc3", display: "grid", gap: 8 }}>
                                          {group.skill !== "READING" && (
                                            <label style={{ fontSize: 12, margin: 0 }}>
                                              Kịch bản hội thoại câu này (Audio Script - chỉ hiện sau khi nộp bài)
                                              <textarea
                                                rows={2}
                                                value={q.content}
                                                onChange={(e) => handleUpdateQuestion(group.id, q.id, { content: e.target.value })}
                                                placeholder="Ví dụ: 男：你想喝点儿什么？ 女：茶，谢谢。"
                                                style={{ width: "100%", fontSize: 12, marginTop: 4 }}
                                              />
                                            </label>
                                          )}
                                          <label style={{ fontSize: 12, margin: 0 }}>
                                            Giải thích đáp án
                                            <input
                                              value={q.explanation || ""}
                                              onChange={(e) => handleUpdateQuestion(group.id, q.id, { explanation: e.target.value })}
                                              placeholder="Vì sao câu này khớp với tranh đã chọn?"
                                              style={{ width: "100%", fontSize: 12, marginTop: 4 }}
                                            />
                                          </label>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div style={{ marginTop: 12, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                                {group.questions.filter((q) => q.correctAnswer).length}/{group.questions.length} câu đã chọn đáp án.
                              </div>
                            </div>
                          </div>
                        ) : group.groupType === "listening_choice_abc" ? (
                          <div style={{ display: "grid", gap: 16 }}>
                            {groupAudioEditor(group, "Tải một tệp audio cho cả nhóm")}

                            {/* Danh sách các câu hỏi nghe chọn A / B / C */}
                            <div style={{ display: "grid", gap: 14 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <strong style={{ fontSize: 14, color: "#2b4828" }}>
                                  Danh sách câu hỏi trong nhóm ({group.questions.length} câu):
                                </strong>
                                <button
                                  type="button"
                                  onClick={() => handleAddQuestionToGroup(group.id)}
                                  style={{
                                    background: "#41683d",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "5px 12px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <Plus size={13} /> Thêm câu hỏi
                                </button>
                              </div>

                              {group.questions.map((q, qIndex) => {
                                const currentOptions = q.options && q.options.length > 0 ? q.options : [
                                  { id: "A", text: "", pinyin: "" },
                                  { id: "B", text: "", pinyin: "" },
                                  { id: "C", text: "", pinyin: "" },
                                ];
                                return (
                                  <div
                                    key={q.id}
                                    style={{
                                      background: "#fbfcf8",
                                      border: "1px solid #dce4cb",
                                      borderRadius: 12,
                                      padding: 16,
                                      display: "grid",
                                      gap: 12,
                                    }}
                                  >
                                    {/* Top Row: questionNo, Points, Actions */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <input
                                          value={q.questionNo || `Câu ${qIndex + 1}`}
                                          onChange={(e) => handleUpdateQuestion(group.id, q.id, { questionNo: e.target.value })}
                                          style={{ width: 100, fontWeight: 700, fontSize: 13, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1" }}
                                          placeholder="Số câu"
                                          title="Tự điền số thứ tự câu trong đề thi"
                                        />
                                        <span style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                                          (Nghe chọn A, B, C)
                                        </span>
                                      </div>

                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <label style={{ fontSize: 12, color: "#375531", display: "flex", alignItems: "center", gap: 4, margin: 0 }}>
                                          Điểm:
                                          <input
                                            type="number"
                                            step="0.5"
                                            min={0}
                                            value={q.points}
                                            onChange={(e) => handleUpdateQuestion(group.id, q.id, { points: Number(e.target.value) })}
                                            style={{ width: 64, padding: "3px 6px", fontSize: 12 }}
                                          />
                                        </label>

                                        <button
                                          type="button"
                                          onClick={() => handleDuplicateQuestion(group.id, q.id)}
                                          style={{ background: "#e2ede0", color: "#254422", border: "1px solid #c5d9bf", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600 }}
                                          title="Nhân bản câu này"
                                        >
                                          <Copy size={13} /> Nhân bản
                                        </button>

                                        {group.questions.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteQuestion(group.id, q.id)}
                                            style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}
                                            title="Xóa câu này"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Kịch bản câu hỏi / Audio Script */}
                                    <div style={{ background: "#f1f5f9", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                                        Kịch bản câu hỏi / hội thoại (Ẩn trong phòng thi, chỉ hiện sau khi nộp bài):
                                      </div>
                                      <div className={s.formColumns}>
                                        <label style={{ margin: 0 }}>
                                          Kịch bản (Chữ Hán) *
                                          <input
                                            value={q.content}
                                            onChange={(e) => handleUpdateQuestion(group.id, q.id, { content: e.target.value })}
                                            placeholder="Ví dụ: 女：下午去商店吗？ 男：不去，我要睡觉。 问：男的下午做什么？"
                                          />
                                        </label>
                                        <label style={{ margin: 0 }}>
                                          Pinyin kịch bản (tùy chọn)
                                          <input
                                            value={q.pinyin || ""}
                                            onChange={(e) => handleUpdateQuestion(group.id, q.id, { pinyin: e.target.value })}
                                            placeholder="Ví dụ: Xiàwǔ qù shāngdiàn ma?..."
                                          />
                                        </label>
                                      </div>
                                    </div>

                                    {/* Các lựa chọn A, B, C */}
                                    <div style={{ background: "#f8faf5", padding: 12, borderRadius: 8, border: "1px solid #e0ebd3" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "#2b4a27" }}>
                                          3 Lựa chọn đáp án A, B, C (Tích nút tròn để chọn đáp án đúng):
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextLetter = String.fromCharCode(65 + currentOptions.length);
                                            const nextOpts = [...currentOptions, { id: nextLetter, text: "", pinyin: "" }];
                                            handleUpdateQuestion(group.id, q.id, { options: nextOpts });
                                          }}
                                          style={{ background: "#e0ebdb", border: "none", borderRadius: 4, padding: "3px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer", color: "#254422" }}
                                        >
                                          + Thêm lựa chọn
                                        </button>
                                      </div>

                                      <div style={{ display: "grid", gap: 8 }}>
                                        {currentOptions.map((opt) => {
                                          const isCorrect = q.correctAnswer === opt.id;
                                          return (
                                            <div
                                              key={opt.id}
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                padding: "6px 10px",
                                                borderRadius: 8,
                                                background: isCorrect ? "#ecfdf5" : "#fff",
                                                border: isCorrect ? "2px solid #10b981" : "1px solid #e2e8f0",
                                              }}
                                            >
                                              <input
                                                type="radio"
                                                name={`correct_choice_${group.id}_${q.id}`}
                                                checked={isCorrect}
                                                onChange={() => handleUpdateQuestion(group.id, q.id, { correctAnswer: opt.id })}
                                                title="Đặt làm đáp án đúng"
                                                style={{ cursor: "pointer", width: 16, height: 16 }}
                                              />
                                              <span style={{ fontWeight: 700, fontSize: 13, width: 22, color: "#1e293b" }}>
                                                {opt.id}.
                                              </span>
                                              <input
                                                style={{ flex: 1.2, fontSize: 13, padding: "4px 8px", fontWeight: 600 }}
                                                value={opt.text || ""}
                                                onChange={(e) => {
                                                  const newOpts = currentOptions.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o));
                                                  handleUpdateQuestion(group.id, q.id, { options: newOpts });
                                                }}
                                                placeholder={`Chữ Hán phương án ${opt.id} (vd: 睡觉)`}
                                              />
                                              <input
                                                style={{ flex: 1, fontSize: 12, padding: "4px 8px", color: "#64748b" }}
                                                value={opt.pinyin || ""}
                                                onChange={(e) => {
                                                  const newOpts = currentOptions.map((o) => (o.id === opt.id ? { ...o, pinyin: e.target.value } : o));
                                                  handleUpdateQuestion(group.id, q.id, { options: newOpts });
                                                }}
                                                placeholder={`Pinyin ${opt.id} (vd: shuìjiào)`}
                                              />
                                              {currentOptions.length > 3 && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const newOpts = currentOptions.filter((o) => o.id !== opt.id);
                                                    handleUpdateQuestion(group.id, q.id, { options: newOpts });
                                                  }}
                                                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: 2 }}
                                                  title="Xóa lựa chọn"
                                                >
                                                  <Trash2 size={13} />
                                                </button>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Giải thích đáp án */}
                                    <label style={{ margin: 0, fontSize: 12 }}>
                                      Giải thích đáp án (tùy chọn)
                                      <input
                                        value={q.explanation || ""}
                                        onChange={(e) => handleUpdateQuestion(group.id, q.id, { explanation: e.target.value })}
                                        placeholder="Ví dụ: Người nam nói '我要睡觉' (tôi muốn đi ngủ) nên chọn C."
                                        style={{ fontSize: 12 }}
                                      />
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : group.groupType === "eval_true_false_na" ? (
                          <div style={{ display: "grid", gap: 16 }}>
                            {/* File audio cho toàn bộ nhóm và sơ đồ thứ tự */}
                            <div style={{ background: "#ffffff", border: "1px solid #dce4cb", borderRadius: 12, padding: 16 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: "#254422", marginBottom: 10 }}>
                                File audio chung cho nhóm đánh giá ({group.questions.length} phát biểu)
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: "#f8faf5", padding: 10, borderRadius: 8, border: "1px solid #e0ebd3" }}>
                                <Music size={18} color="#254422" />
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#254422" }}>
                                  {group.audioUrl ? (group.audioUrl.split("/").pop() || "Audio nhóm") : "Chưa chọn file audio"}
                                </span>
                                <span style={{ fontSize: 12, color: "#64748b" }}>
                                  (Chứa phát biểu từ câu {group.questions[0]?.questionNo || 1} đến câu {group.questions[group.questions.length - 1]?.questionNo || group.questions.length})
                                </span>
                                <span style={{ marginLeft: "auto", background: "#e2e8f0", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, color: "#475569" }}>MP3</span>
                              </div>
                              <div style={{ marginTop: 12 }}>
                                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>Thứ tự phát audio:</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                  {group.questions.map((q, qIdx) => (
                                    <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f1f5f9", border: "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#334155" }}>
                                          {qIdx + 1}
                                        </div>
                                        <span style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{q.questionNo || `Câu ${qIdx + 1}`}</span>
                                      </div>
                                      {qIdx < group.questions.length - 1 && <ArrowRight size={14} color="#94a3b8" />}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Danh sách các phát biểu Đánh giá Đúng / Sai / Không đề cập */}
                            <div style={{ background: "#ffffff", border: "1px solid #dce4cb", borderRadius: 12, padding: 16 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#254422" }}>
                                  Cài đặt đáp án cho {group.questions.length} phát biểu (√ Đúng / × Sai / 〇 Không đề cập)
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleAddQuestionToGroup(group.id)}
                                  style={{
                                    background: "#41683d",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "4px 10px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <Plus size={13} /> Thêm phát biểu
                                </button>
                              </div>

                              <div style={{ display: "grid", gap: 12 }}>
                                {group.questions.map((q, qIdx) => {
                                  const isScriptOpen = openQuestionScripts[q.id];
                                  return (
                                    <div key={q.id} style={{ border: "1px solid #e2ebd5", borderRadius: 10, padding: 12, background: "#fcfdfb" }}>
                                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                          <input
                                            value={q.questionNo || `Câu ${qIdx + 1}`}
                                            onChange={(e) => handleUpdateQuestion(group.id, q.id, { questionNo: e.target.value })}
                                            style={{ width: 85, fontWeight: 700, fontSize: 12, padding: "4px 6px", borderRadius: 6, border: "1px solid #cbd5e1" }}
                                            placeholder="Số câu"
                                            title="Số thứ tự câu"
                                          />
                                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            {[
                                              { id: "true", label: "√ Đúng (对)", activeBg: "#dcfce7", activeBorder: "#16a34a", activeText: "#15803d" },
                                              { id: "false", label: "× Sai (错)", activeBg: "#fee2e2", activeBorder: "#dc2626", activeText: "#b91c1c" },
                                              { id: "not_mentioned", label: "〇 Không đề cập (没提及)", activeBg: "#fef3c7", activeBorder: "#d97706", activeText: "#b45309" },
                                            ].map((btn) => {
                                              const isChecked = q.correctAnswer === btn.id;
                                              return (
                                                <button
                                                  key={btn.id}
                                                  type="button"
                                                  onClick={() => handleUpdateQuestion(group.id, q.id, { correctAnswer: btn.id })}
                                                  style={{
                                                    padding: "4px 10px",
                                                    borderRadius: 6,
                                                    fontSize: 12,
                                                    fontWeight: isChecked ? 700 : 500,
                                                    cursor: "pointer",
                                                    border: isChecked ? `2px solid ${btn.activeBorder}` : "1px solid #cbd5e1",
                                                    background: isChecked ? btn.activeBg : "#ffffff",
                                                    color: isChecked ? btn.activeText : "#475569",
                                                  }}
                                                >
                                                  {btn.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                          <label style={{ fontSize: 12, color: "#375531", display: "flex", alignItems: "center", gap: 4, margin: 0 }}>
                                            Điểm:
                                            <input
                                              type="number"
                                              step="0.5"
                                              min={0}
                                              value={q.points}
                                              onChange={(e) => handleUpdateQuestion(group.id, q.id, { points: Number(e.target.value) })}
                                              style={{ width: 55, padding: "2px 4px", fontSize: 12 }}
                                            />
                                          </label>

                                          <button
                                            type="button"
                                            onClick={() => toggleQuestionScript(q.id)}
                                            style={{
                                              background: isScriptOpen ? "#dcfce7" : "#f1f5f9",
                                              color: isScriptOpen ? "#166534" : "#475569",
                                              border: "1px solid #cbd5e1",
                                              borderRadius: 6,
                                              padding: "4px 8px",
                                              fontSize: 11,
                                              fontWeight: 600,
                                              cursor: "pointer",
                                              display: "inline-flex",
                                              alignItems: "center",
                                              gap: 4,
                                            }}
                                          >
                                            {isScriptOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                            Kịch bản & Lời giải
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleDuplicateQuestion(group.id, q.id)}
                                            style={{ background: "#e2ede0", color: "#254422", border: "1px solid #c5d9bf", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600 }}
                                            title="Nhân bản"
                                          >
                                            <Copy size={13} />
                                          </button>

                                          {group.questions.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteQuestion(group.id, q.id)}
                                              style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}
                                              title="Xóa phát biểu này"
                                            >
                                              <Trash2 size={13} />
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Nội dung phát biểu */}
                                      <div className={s.formColumns}>
                                        <label style={{ margin: 0 }}>
                                          Nội dung phát biểu (Chữ Hán) *
                                          <input
                                            value={q.content}
                                            onChange={(e) => handleUpdateQuestion(group.id, q.id, { content: e.target.value })}
                                            placeholder="Ví dụ: 小张打算下个月结婚。"
                                          />
                                        </label>
                                        <label style={{ margin: 0 }}>
                                          Pinyin phát biểu (tùy chọn)
                                          <input
                                            value={q.pinyin || ""}
                                            onChange={(e) => handleUpdateQuestion(group.id, q.id, { pinyin: e.target.value })}
                                            placeholder="Ví dụ: Xiǎo Zhāng dǎsuàn xià ge yuè jiéhūn."
                                          />
                                        </label>
                                      </div>

                                      {isScriptOpen && (
                                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #d5dfc3", display: "grid", gap: 8 }}>
                                          <label style={{ fontSize: 12, margin: 0 }}>
                                            Kịch bản hội thoại / bài nói (Ẩn trong phòng thi, chỉ hiện sau khi nộp bài)
                                            <textarea
                                              rows={2}
                                              value={(q as any).audioScript || ""}
                                              onChange={(e) => handleUpdateQuestion(group.id, q.id, { audioScript: e.target.value } as any)}
                                              placeholder="Ví dụ: 男：听说小张下个月要结婚了？ 女：没有的事，他连女朋友都没有呢。"
                                              style={{ width: "100%", fontSize: 12, marginTop: 4 }}
                                            />
                                          </label>
                                          <label style={{ fontSize: 12, margin: 0 }}>
                                            Giải thích đáp án
                                            <input
                                              value={q.explanation || ""}
                                              onChange={(e) => handleUpdateQuestion(group.id, q.id, { explanation: e.target.value })}
                                              placeholder="Ví dụ: Người nữ đính chính Tiểu Trương chưa có bạn gái nên phát biểu là Sai (×)..."
                                              style={{ width: "100%", fontSize: 12, marginTop: 4 }}
                                            />
                                          </label>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div style={{ marginTop: 12, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                                {group.questions.filter((q) => q.correctAnswer).length}/{group.questions.length} phát biểu đã chọn đáp án.
                              </div>
                            </div>
                          </div>
                        ) : group.groupType === "listening_fill_blank" ? (
                          <div style={{ display: "grid", gap: 16 }}>
                            {/* File audio cho toàn bộ nhóm và sơ đồ thứ tự */}
                            <div style={{ background: "#ffffff", border: "1px solid #dce4cb", borderRadius: 12, padding: 16 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: "#254422", marginBottom: 10 }}>
                                File audio chung cho nhóm điền từ ({group.questions.length} câu)
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: "#f8faf5", padding: 10, borderRadius: 8, border: "1px solid #e0ebd3" }}>
                                <Music size={18} color="#254422" />
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#254422" }}>
                                  {group.audioUrl ? (group.audioUrl.split("/").pop() || "Audio nhóm") : "Chưa chọn file audio"}
                                </span>
                                <span style={{ fontSize: 12, color: "#64748b" }}>
                                  (Chứa bài nghe từ câu {group.questions[0]?.questionNo || 1} đến câu {group.questions[group.questions.length - 1]?.questionNo || group.questions.length})
                                </span>
                                <span style={{ marginLeft: "auto", background: "#e2e8f0", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, color: "#475569" }}>MP3</span>
                              </div>
                              <div style={{ marginTop: 12 }}>
                                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>Thứ tự phát audio:</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                  {group.questions.map((q, qIdx) => (
                                    <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f1f5f9", border: "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#334155" }}>
                                          {qIdx + 1}
                                        </div>
                                        <span style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{q.questionNo || `Câu ${qIdx + 1}`}</span>
                                      </div>
                                      {qIdx < group.questions.length - 1 && <ArrowRight size={14} color="#94a3b8" />}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Danh sách các câu hỏi điền từ */}
                            <div style={{ background: "#ffffff", border: "1px solid #dce4cb", borderRadius: 12, padding: 16 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#254422" }}>
                                  Danh sách câu hỏi điền từ ({group.questions.length} câu)
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleAddQuestionToGroup(group.id)}
                                  style={{
                                    background: "#41683d",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "4px 10px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <Plus size={13} /> Thêm câu hỏi
                                </button>
                              </div>

                              <div style={{ display: "grid", gap: 14 }}>
                                {group.questions.map((q, qIdx) => (
                                  <div key={q.id} style={{ border: "1px solid #e2ebd5", borderRadius: 10, padding: 14, background: "#fcfdfb", display: "grid", gap: 10 }}>
                                    {/* Top row */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <input
                                          value={q.questionNo || `Câu ${qIdx + 1}`}
                                          onChange={(e) => handleUpdateQuestion(group.id, q.id, { questionNo: e.target.value })}
                                          style={{ width: 85, fontWeight: 700, fontSize: 12, padding: "4px 6px", borderRadius: 6, border: "1px solid #cbd5e1" }}
                                          placeholder="Số câu"
                                        />
                                        <span style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                                          (Nghe và điền từ vào chỗ trống)
                                        </span>
                                      </div>

                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <label style={{ fontSize: 12, color: "#375531", display: "flex", alignItems: "center", gap: 4, margin: 0 }}>
                                          Điểm:
                                          <input
                                            type="number"
                                            step="0.5"
                                            min={0}
                                            value={q.points}
                                            onChange={(e) => handleUpdateQuestion(group.id, q.id, { points: Number(e.target.value) })}
                                            style={{ width: 55, padding: "2px 4px", fontSize: 12 }}
                                          />
                                        </label>

                                        <button
                                          type="button"
                                          onClick={() => handleDuplicateQuestion(group.id, q.id)}
                                          style={{ background: "#e2ede0", color: "#254422", border: "1px solid #c5d9bf", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600 }}
                                          title="Nhân bản"
                                        >
                                          <Copy size={13} />
                                        </button>

                                        {group.questions.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteQuestion(group.id, q.id)}
                                            style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}
                                            title="Xóa câu này"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Câu văn chứa chỗ trống */}
                                    <div className={s.formColumns}>
                                      <label style={{ margin: 0 }}>
                                        Nội dung câu có chỗ trống (Chữ Hán) *
                                        <input
                                          value={q.content}
                                          onChange={(e) => handleUpdateQuestion(group.id, q.id, { content: e.target.value })}
                                          placeholder="Ví dụ: 王老师每天早上___去学校。"
                                        />
                                      </label>
                                      <label style={{ margin: 0 }}>
                                        Pinyin câu hỏi (tùy chọn)
                                        <input
                                          value={q.pinyin || ""}
                                          onChange={(e) => handleUpdateQuestion(group.id, q.id, { pinyin: e.target.value })}
                                          placeholder="Ví dụ: Wáng lǎoshī měitiān zǎoshang ___ qù xuéxiào."
                                        />
                                      </label>
                                    </div>

                                    {/* Đáp án chuẩn & biến thể */}
                                    <div style={{ background: "#f8faf5", padding: 12, borderRadius: 8, border: "1px solid #e0ebd3", display: "grid", gap: 10 }}>
                                      <div className={s.formColumns}>
                                        <label style={{ margin: 0 }}>
                                          Đáp án chuẩn (chính xác) *
                                          <input
                                            value={q.correctAnswer}
                                            onChange={(e) => handleUpdateQuestion(group.id, q.id, { correctAnswer: e.target.value })}
                                            placeholder="Ví dụ: 骑自行车"
                                          />
                                        </label>
                                        <label style={{ margin: 0 }}>
                                          Các biến thể được chấp nhận (phân cách bằng / hoặc phẩy)
                                          <input
                                            value={q.acceptedAnswers || ""}
                                            onChange={(e) => handleUpdateQuestion(group.id, q.id, { acceptedAnswers: e.target.value })}
                                            placeholder="Ví dụ: 骑车 / 骑单车 / 自行车"
                                          />
                                        </label>
                                      </div>

                                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#2b4a27", cursor: "pointer", margin: 0 }}>
                                        <input
                                          type="checkbox"
                                          checked={!!q.requiresManualReview}
                                          onChange={(e) => handleUpdateQuestion(group.id, q.id, { requiresManualReview: e.target.checked })}
                                          style={{ width: 16, height: 16 }}
                                        />
                                        <span>Cần giáo viên kiểm tra / chấm tay nếu học sinh điền khác các biến thể trên</span>
                                      </label>
                                    </div>

                                    {/* Giải thích đáp án */}
                                    <label style={{ margin: 0, fontSize: 12 }}>
                                      Giải thích đáp án (tùy chọn)
                                      <input
                                        value={q.explanation || ""}
                                        onChange={(e) => handleUpdateQuestion(group.id, q.id, { explanation: e.target.value })}
                                        placeholder="Ví dụ: Theo đoạn nghe, thầy Vương đi xe đạp đến trường..."
                                        style={{ fontSize: 12 }}
                                      />
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Dạng chuẩn (Mặc định cho các loại bài tập khác) */
                          <div style={{ display: "grid", gap: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <strong style={{ fontSize: 14, color: "#2b4828" }}>
                                Danh sách câu hỏi trong nhóm ({group.questions.length} câu):
                              </strong>
                              <button
                                type="button"
                                onClick={() => handleAddQuestionToGroup(group.id)}
                                style={{
                                  background: "#41683d",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 6,
                                  padding: "5px 12px",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Plus size={13} /> Thêm câu hỏi
                              </button>
                            </div>

                            {group.questions.map((q, qIndex) => (
                              <div
                                key={q.id}
                                style={{
                                  background: "#fbfcf8",
                                  border: "1px solid #dce4cb",
                                  borderRadius: 12,
                                  padding: 16,
                                  display: "grid",
                                  gap: 12,
                                }}
                              >
                                {/* Question Top Row */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                      value={q.questionNo || `Câu ${qIndex + 1}`}
                                      onChange={(e) => handleUpdateQuestion(group.id, q.id, { questionNo: e.target.value })}
                                      style={{ width: 85, fontWeight: 700, fontSize: 12, padding: "4px 6px", borderRadius: 6, border: "1px solid #cbd5e1" }}
                                      placeholder="Số câu"
                                      title="Sửa số thứ tự câu trong đề thi"
                                    />
                                    <select
                                      value={q.type}
                                      onChange={(e) => handleUpdateQuestion(group.id, q.id, { type: e.target.value })}
                                      style={{ fontSize: 12, padding: "4px 8px" }}
                                    >
                                      <option value="multiple_choice">Trắc nghiệm (A, B, C, D...)</option>
                                      <option value="listening_choice">Nghe chọn đáp án</option>
                                      <option value="true_false">Phán đoán Đúng / Sai (对 / 错)</option>
                                      <option value="true_false_na">Đánh giá Đúng / Sai / Không đề cập (√ / × / 〇)</option>
                                      <option value="listening_fill">Nghe và điền từ vào chỗ trống</option>
                                      <option value="matching">Ghép nối tranh / từ (A-F)</option>
                                      <option value="fill_blank">Điền từ vào chỗ trống</option>
                                      <option value="sentence_order">Sắp xếp các từ thành câu (HSK 3-5)</option>
                                      <option value="find_error">Tìm câu có lỗi sai ngữ pháp (HSK 6)</option>
                                      <option value="essay">Tự luận / Viết bài văn (HSK 5-6)</option>
                                      <option value="writing">Viết câu theo tranh / Pinyin</option>
                                    </select>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <label style={{ fontSize: 12, color: "#375531", display: "flex", alignItems: "center", gap: 4, margin: 0 }}>
                                      Điểm:
                                      <input
                                        type="number"
                                        step="0.5"
                                        min={0}
                                        value={q.points}
                                        onChange={(e) => handleUpdateQuestion(group.id, q.id, { points: Number(e.target.value) })}
                                        style={{ width: 64, padding: "3px 6px", fontSize: 12 }}
                                      />
                                    </label>

                                    <button
                                      type="button"
                                      onClick={() => handleDuplicateQuestion(group.id, q.id)}
                                      style={{ background: "#e2ede0", color: "#254422", border: "1px solid #c5d9bf", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600 }}
                                      title="Nhân bản (sao chép) câu hỏi này"
                                    >
                                      <Copy size={13} /> Nhân bản
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteQuestion(group.id, q.id)}
                                      style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}
                                      title="Xóa câu hỏi này"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>

                                {/* Question Content & Pinyin */}
                                <div className={s.formColumns}>
                                  <label style={{ margin: 0 }}>
                                    Nội dung câu hỏi (chữ Hán) *
                                    <input
                                      value={q.content}
                                      onChange={(e) => handleUpdateQuestion(group.id, q.id, { content: e.target.value })}
                                      placeholder="Ví dụ: 第 1 题：请听录音并判断正误。"
                                    />
                                  </label>
                                  <label style={{ margin: 0 }}>
                                    Pinyin (phiên âm nếu có)
                                    <input
                                      value={q.pinyin || ""}
                                      onChange={(e) => handleUpdateQuestion(group.id, q.id, { pinyin: e.target.value })}
                                      placeholder="Ví dụ: Nǐ hǎo"
                                    />
                                  </label>
                                </div>

                                {/* Question Image (Ảnh đề bài câu hỏi) */}
                                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", background: "#f2f7ed", padding: 10, borderRadius: 8 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#254422" }}>
                                    <ImageIcon size={15} />
                                    Ảnh đề bài {q.questionNo || `câu ${qIndex + 1}`}:
                                  </div>
                                  <input
                                    style={{ flex: 1, minWidth: 200, fontSize: 12, padding: "4px 8px" }}
                                    value={q.imageUrl || ""}
                                    onChange={(e) => handleUpdateQuestion(group.id, q.id, { imageUrl: e.target.value })}
                                    placeholder="Dán link ảnh hoặc chọn file từ máy bên cạnh..."
                                  />
                                  <label style={{ cursor: "pointer", background: "#e0ebdb", padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#254422", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                    <Upload size={13} /> Tải ảnh từ máy
                                    <input
                                      type="file"
                                      accept="image/*"
                                      style={{ display: "none" }}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadQuestionImage(group.id, q.id, file);
                                      }}
                                    />
                                  </label>
                                  {q.imageUrl && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateQuestion(group.id, q.id, { imageUrl: "" })}
                                      style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 11, cursor: "pointer" }}
                                    >
                                      Xóa ảnh
                                    </button>
                                  )}
                                </div>
                                {q.imageUrl && (
                                  <div style={{ textAlign: "center", margin: "4px 0" }}>
                                    <img
                                      src={q.imageUrl}
                                      alt={`Ảnh ${q.questionNo || `câu ${qIndex + 1}`}`}
                                      style={{ maxWidth: 240, maxHeight: 150, objectFit: "contain", borderRadius: 8, border: "1px solid #d4dfc7" }}
                                    />
                                  </div>
                                )}

                                {/* Options & Correct Answer Editor */}
                                {q.type === "true_false_na" ? (
                                  <div style={{ background: "#f8faf5", padding: 12, borderRadius: 8, border: "1px solid #e0ebd3" }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#2b4a27", display: "block", marginBottom: 8 }}>
                                      Chọn đáp án đúng cho phát biểu này:
                                    </span>
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateQuestion(group.id, q.id, { correctAnswer: "true" })}
                                        style={{
                                          padding: "8px 18px",
                                          borderRadius: 8,
                                          fontWeight: 700,
                                          fontSize: 13,
                                          cursor: "pointer",
                                          border: q.correctAnswer === "true" ? "2px solid #16a34a" : "1px solid #cbd5e1",
                                          background: q.correctAnswer === "true" ? "#dcfce7" : "#fff",
                                          color: q.correctAnswer === "true" ? "#15803d" : "#475569",
                                        }}
                                      >
                                        ✔ Đúng (√ 对)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateQuestion(group.id, q.id, { correctAnswer: "false" })}
                                        style={{
                                          padding: "8px 18px",
                                          borderRadius: 8,
                                          fontWeight: 700,
                                          fontSize: 13,
                                          cursor: "pointer",
                                          border: q.correctAnswer === "false" ? "2px solid #dc2626" : "1px solid #cbd5e1",
                                          background: q.correctAnswer === "false" ? "#fee2e2" : "#fff",
                                          color: q.correctAnswer === "false" ? "#b91c1c" : "#475569",
                                        }}
                                      >
                                        ✖ Sai (× 错)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateQuestion(group.id, q.id, { correctAnswer: "not_mentioned" })}
                                        style={{
                                          padding: "8px 18px",
                                          borderRadius: 8,
                                          fontWeight: 700,
                                          fontSize: 13,
                                          cursor: "pointer",
                                          border: q.correctAnswer === "not_mentioned" ? "2px solid #d97706" : "1px solid #cbd5e1",
                                          background: q.correctAnswer === "not_mentioned" ? "#fef3c7" : "#fff",
                                          color: q.correctAnswer === "not_mentioned" ? "#b45309" : "#475569",
                                        }}
                                      >
                                        〇 Không đề cập (没提及)
                                      </button>
                                    </div>
                                  </div>
                                ) : q.type === "listening_fill" ? (
                                  <div style={{ background: "#f8faf5", padding: 12, borderRadius: 8, border: "1px solid #e0ebd3", display: "grid", gap: 10 }}>
                                    <div className={s.formColumns}>
                                      <label style={{ margin: 0 }}>
                                        Đáp án chuẩn (chính xác) *
                                        <input
                                          value={q.correctAnswer}
                                          onChange={(e) => handleUpdateQuestion(group.id, q.id, { correctAnswer: e.target.value })}
                                          placeholder="Ví dụ: 骑自行车"
                                        />
                                      </label>
                                      <label style={{ margin: 0 }}>
                                        Các biến thể được chấp nhận (phân cách bằng / hoặc dấu phẩy)
                                        <input
                                          value={q.acceptedAnswers || ""}
                                          onChange={(e) => handleUpdateQuestion(group.id, q.id, { acceptedAnswers: e.target.value })}
                                          placeholder="Ví dụ: 骑车 / 骑单车 / 自行车"
                                        />
                                      </label>
                                    </div>
                                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#2b4a27", cursor: "pointer", margin: 0 }}>
                                      <input
                                        type="checkbox"
                                        checked={!!q.requiresManualReview}
                                        onChange={(e) => handleUpdateQuestion(group.id, q.id, { requiresManualReview: e.target.checked })}
                                        style={{ width: 16, height: 16 }}
                                      />
                                      <span>Cần giáo viên kiểm tra / chấm tay nếu học sinh điền khác các biến thể trên</span>
                                    </label>
                                  </div>
                                ) : q.type === "true_false" ? (
                                  <div style={{ background: "#f8faf5", padding: 12, borderRadius: 8, border: "1px solid #e0ebd3" }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#2b4a27", display: "block", marginBottom: 8 }}>
                                      Chọn đáp án đúng cho câu này:
                                    </span>
                                    <div style={{ display: "flex", gap: 12 }}>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateQuestion(group.id, q.id, { correctAnswer: "true" })}
                                        style={{
                                          padding: "8px 20px",
                                          borderRadius: 8,
                                          fontWeight: 700,
                                          fontSize: 13,
                                          cursor: "pointer",
                                          border: q.correctAnswer === "true" ? "2px solid #16a34a" : "1px solid #cbd5e1",
                                          background: q.correctAnswer === "true" ? "#dcfce7" : "#fff",
                                          color: q.correctAnswer === "true" ? "#15803d" : "#475569",
                                        }}
                                      >
                                        ✔ Đúng (对 - True)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateQuestion(group.id, q.id, { correctAnswer: "false" })}
                                        style={{
                                          padding: "8px 20px",
                                          borderRadius: 8,
                                          fontWeight: 700,
                                          fontSize: 13,
                                          cursor: "pointer",
                                          border: q.correctAnswer === "false" ? "2px solid #dc2626" : "1px solid #cbd5e1",
                                          background: q.correctAnswer === "false" ? "#fee2e2" : "#fff",
                                          color: q.correctAnswer === "false" ? "#b91c1c" : "#475569",
                                        }}
                                      >
                                        ✖ Sai (错 - False)
                                      </button>
                                    </div>
                                  </div>
                                ) : q.type === "essay" ? (
                                  <div style={{ background: "#f8faf5", padding: 12, borderRadius: 8, border: "1px solid #e0ebd3" }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "#2b4a27", margin: 0, display: "block" }}>
                                      Yêu cầu đề bài / Đáp án mẫu & Thang điểm chấm tự luận:
                                      <textarea
                                        rows={4}
                                        value={q.correctAnswer}
                                        onChange={(e) => handleUpdateQuestion(group.id, q.id, { correctAnswer: e.target.value })}
                                        placeholder="Ví dụ: Bài văn thu gọn ~400 chữ, cần nêu được 3 ý chính: 1)... 2)... 3)... Giữ nguyên ngôi kể và văn phong."
                                        style={{ marginTop: 4, width: "100%", fontSize: 12, lineHeight: 1.5 }}
                                      />
                                    </label>
                                  </div>
                                ) : q.type === "fill_blank" || q.type === "sentence_order" || q.type === "writing" ? (
                                  <div style={{ background: "#f8faf5", padding: 12, borderRadius: 8, border: "1px solid #e0ebd3" }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "#2b4a27", margin: 0 }}>
                                      Đáp án chuẩn / Từ cần điền:
                                      <input
                                        value={q.correctAnswer}
                                        onChange={(e) => handleUpdateQuestion(group.id, q.id, { correctAnswer: e.target.value })}
                                        placeholder="Ví dụ: 老师 hoặc 他 / 是 / 老师"
                                        style={{ marginTop: 4 }}
                                      />
                                    </label>
                                  </div>
                                ) : (
                                  /* Multiple choice / matching options */
                                  <div style={{ background: "#f8faf5", padding: 12, borderRadius: 8, border: "1px solid #e0ebd3" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: "#2b4a27" }}>
                                        Các lựa chọn đáp án (Click nút tròn để chọn đáp án đúng):
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextLetter = String.fromCharCode(65 + q.options.length);
                                          const nextOpts = [...q.options, { id: nextLetter, text: `Lựa chọn ${nextLetter}`, pinyin: "" }];
                                          handleUpdateQuestion(group.id, q.id, { options: nextOpts });
                                        }}
                                        style={{ background: "#e0ebdb", border: "none", borderRadius: 4, padding: "3px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer", color: "#254422" }}
                                      >
                                        + Thêm lựa chọn
                                      </button>
                                    </div>

                                    <div style={{ display: "grid", gap: 8 }}>
                                      {q.options.map((opt) => {
                                        const isCorrect = q.correctAnswer === opt.id;
                                        return (
                                          <div
                                            key={opt.id}
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 8,
                                              padding: "6px 10px",
                                              borderRadius: 8,
                                              background: isCorrect ? "#ecfdf5" : "#fff",
                                              border: isCorrect ? "2px solid #10b981" : "1px solid #e2e8f0",
                                            }}
                                          >
                                            <input
                                              type="radio"
                                              name={`correct_${group.id}_${q.id}`}
                                              checked={isCorrect}
                                              onChange={() => handleUpdateQuestion(group.id, q.id, { correctAnswer: opt.id })}
                                              title="Đặt làm đáp án đúng"
                                              style={{ cursor: "pointer", width: 16, height: 16 }}
                                            />
                                            <span style={{ fontWeight: 700, fontSize: 13, width: 20, color: "#1e293b" }}>
                                              {opt.id}.
                                            </span>
                                            <input
                                              style={{ flex: 1.2, fontSize: 12, padding: "4px 8px" }}
                                              value={opt.text || ""}
                                              onChange={(e) => {
                                                const newOpts = q.options.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o));
                                                handleUpdateQuestion(group.id, q.id, { options: newOpts });
                                              }}
                                              placeholder={`Chữ Hán lựa chọn ${opt.id}...`}
                                            />
                                            <input
                                              style={{ flex: 1, fontSize: 12, padding: "4px 8px", color: "#64748b" }}
                                              value={opt.pinyin || ""}
                                              onChange={(e) => {
                                                const newOpts = q.options.map((o) => (o.id === opt.id ? { ...o, pinyin: e.target.value } : o));
                                                handleUpdateQuestion(group.id, q.id, { options: newOpts });
                                              }}
                                              placeholder={`Pinyin (tùy chọn)`}
                                            />

                                            {/* Mini Image Upload for option */}
                                            <label
                                              style={{
                                                cursor: "pointer",
                                                background: opt.imageUrl ? "#dcfce7" : "#f1f5f9",
                                                border: "1px solid #cbd5e1",
                                                borderRadius: 6,
                                                padding: "3px 8px",
                                                fontSize: 11,
                                                color: "#334155",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 4,
                                              }}
                                              title="Tải ảnh cho lựa chọn này (ví dụ tranh A, tranh B...)"
                                            >
                                              <ImageIcon size={12} /> {opt.imageUrl ? "Có ảnh" : "+ Ảnh"}
                                              <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: "none" }}
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) handleUploadOptionImage(group.id, q.id, opt.id, file);
                                                }}
                                              />
                                            </label>

                                            {opt.imageUrl && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newOpts = q.options.map((o) => (o.id === opt.id ? { ...o, imageUrl: "" } : o));
                                                  handleUpdateQuestion(group.id, q.id, { options: newOpts });
                                                }}
                                                style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: 2 }}
                                                title="Xóa ảnh lựa chọn"
                                              >
                                                <X size={14} />
                                              </button>
                                            )}

                                            {q.options.length > 2 && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newOpts = q.options.filter((o) => o.id !== opt.id);
                                                  handleUpdateQuestion(group.id, q.id, { options: newOpts });
                                                }}
                                                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: 2 }}
                                                title="Xóa lựa chọn này"
                                              >
                                                <Trash2 size={13} />
                                              </button>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Explanation */}
                                <label style={{ margin: 0, fontSize: 12 }}>
                                  Giải thích đáp án (tùy chọn)
                                  <input
                                    value={q.explanation || ""}
                                    onChange={(e) => handleUpdateQuestion(group.id, q.id, { explanation: e.target.value })}
                                    placeholder="Ví dụ: Theo đoạn ghi âm, câu này miêu tả đúng bức tranh..."
                                    style={{ fontSize: 12 }}
                                  />
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div
                style={{
                  background: "#f7faf3",
                  border: "2px dashed #92b888",
                  borderRadius: 14,
                  padding: "18px 20px",
                  display: "grid",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#254422", fontWeight: 700, fontSize: 14 }}>
                    <Plus size={18} /> Thêm nhóm bài mới (Part / Section):
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddGroup()}
                    style={{
                      background: "#e4ecdb",
                      color: "#254422",
                      border: "1px solid #c8d9be",
                      borderRadius: 8,
                      padding: "6px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    + Nhóm tùy chỉnh trống
                  </button>
                </div>

                <div style={{ fontSize: 12, color: "#506d48" }}>
                  💡 Hoặc bấm chọn nhanh 1 trong 14 dạng bài thi chuẩn CTI / Hanban (khớp đề thi thực tế HSK 1 - 6):
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
                  {HSK_GROUP_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddGroup(tmpl)}
                      style={{
                        background: "#fff",
                        border: "1px solid #d3e1cb",
                        borderRadius: 8,
                        padding: "8px 12px",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#41683d";
                        e.currentTarget.style.background = "#f0f7ec";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d3e1cb";
                        e.currentTarget.style.background = "#fff";
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#254422" }}>
                        {tmpl.name}
                      </span>
                      <Plus size={14} color="#41683d" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: NHẬP MÃ JSON (RAW JSON EDITOR) */}
          {authorMode === "raw" && (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#254422" }}>
                  Mã nguồn câu hỏi JSON chuẩn HSK 3.0:
                </span>
                <small style={{ color: "#4f6e3c" }}>
                  💡 File âm thanh có sẵn tại: <code>/HSK3.0/HSK/音频/HSK（{authorLevel === 1 ? "一" : authorLevel === 2 ? "二" : authorLevel === 3 ? "三" : authorLevel === 4 ? "四" : authorLevel === 5 ? "五" : authorLevel === 6 ? "六" : "七—九"}级）样卷.mp3</code>
                </small>
              </div>
              <textarea
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  lineHeight: 1.5,
                  minHeight: 350,
                  width: "100%",
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #d5dfc3",
                  background: "#fffef8",
                }}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Dán mảng JSON danh sách câu hỏi tại đây..."
              />
            </div>
          )}

          {/* Bottom Action Buttons */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
            <button
              type="button"
              className={s.secondary}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px" }}
              disabled={mediaUploading}
              onClick={handlePreview}
            >
              <Eye size={17} /> Xem trước đúng giao diện học sinh
            </button>

            <button
              type="button"
              className={s.primary}
              disabled={busy || mediaUploading}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 22px" }}
              onClick={() => void handleSaveImport()}
            >
              <Upload size={17} /> {busy ? "Đang xuất bản..." : "Lưu & Xuất bản đề thi vào hệ thống"}
            </button>
          </div>

          {/* LIVE PREVIEW MODAL */}
          {previewPaper && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                background: "rgba(22, 38, 24, 0.75)",
                backdropFilter: "blur(8px)",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                padding: "24px 20px",
              }}
            >
              <div
                style={{
                  maxWidth: 1280,
                  width: "100%",
                  margin: "auto",
                  background: "#f6f7f2",
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                  position: "relative",
                  backgroundImage: "url('/theme/exam-shanshui-depth.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "top center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #dce4cb",
                    paddingBottom: 14,
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        background: "#3e6234",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      CHẾ ĐỘ XEM TRƯỚC ADMIN
                    </span>
                    <strong style={{ fontSize: 16, color: "#223824" }}>
                      {previewStep === "lobby"
                        ? "1. Giao diện Quy chế thi & Thiết bị (Lobby)"
                        : "2. Giao diện Màn hình làm bài thi (ExamPlayer)"}
                    </strong>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className={s.filters} style={{ margin: 0 }}>
                      <button
                        type="button"
                        aria-pressed={previewStep === "lobby"}
                        onClick={() => setPreviewStep("lobby")}
                        style={{ fontSize: 13, padding: "6px 14px" }}
                      >
                        Quy chế thi
                      </button>
                      <button
                        type="button"
                        aria-pressed={previewStep === "player"}
                        onClick={() => setPreviewStep("player")}
                        style={{ fontSize: 13, padding: "6px 14px" }}
                      >
                        Làm bài thực tế
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewPaper(null)}
                      title="Đóng chế độ xem trước"
                      style={{
                        border: "none",
                        background: "#e4ecdb",
                        borderRadius: "50%",
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#304d2b",
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Render either ExamRulesLobby or ExamPlayer inside Preview */}
                {previewStep === "lobby" ? (
                  <ExamRulesLobby
                    paper={previewPaper}
                    blueprint={examBlueprint.levels.find((b) => b.level === authorLevel)}
                    onStart={() => setPreviewStep("player")}
                    onBack={() => setPreviewPaper(null)}
                    busy={false}
                  />
                ) : (
                  <div style={{ background: "#ffffff", borderRadius: 16, overflow: "hidden", padding: 12 }}>
                    <ExamPlayer
                      previewAttempt={previewAttemptView}
                      onBack={() => setPreviewStep("lobby")}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: GRADING QUEUE */}
      {view === "grading" && (
        <>
          {queue.map((attempt) => (
            <ManualCard
              key={attempt.id}
              attempt={attempt}
              busy={busy}
              onSave={async (marks) => {
                setBusy(true);
                try {
                  await examApi("grade", { id: attempt.id, marks });
                  setMessage("Đã lưu điểm chấm tay.");
                  setError("");
                  load();
                  onChanged();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          ))}
          {!queue.length && <p className={s.empty}>Chưa có bài chờ chấm tay.</p>}
        </>
      )}

      {/* VIEW: PUBLICATIONS APPROVAL & MANAGEMENT */}
      {view === "publications" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontSize: 16, color: "#223824", margin: 0 }}>
              Danh sách đề thi đang có trong hệ thống ({papers.length} bộ đề)
            </h2>
            <button
              type="button"
              onClick={handlePurgeOld}
              style={{
                fontSize: 12,
                padding: "6px 14px",
                minHeight: 32,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#fee2e2",
                color: "#991b1b",
                border: "1px solid #f87171",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <Trash2 size={14} /> Xóa tất cả đề cũ
            </button>
          </div>

          {papers.map((paper) => (
            <PublicationCard
              key={paper.id}
              paper={paper}
              busy={busy}
              onDelete={() => handleDeletePaper(paper.id)}
              onSave={async (durationMin, passScore, approved) => {
                setBusy(true);
                try {
                  await examApi("publication", {
                    paperId: paper.id,
                    durationMin,
                    passScore,
                    approved,
                  });
                  setMessage(approved ? "Đã duyệt và cấu hình đề." : "Đã ẩn đề khỏi trung tâm thi.");
                  setError("");
                  onChanged();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          ))}
          {!papers.length && <p className={s.empty}>Chưa có bộ đề nào trong hệ thống.</p>}
        </>
      )}
    </section>
  );
}

function PublicationCard({
  paper,
  busy,
  onSave,
  onDelete,
}: {
  paper: Candidate;
  busy: boolean;
  onSave: (duration: number, pass: number | null, approved: boolean) => void;
  onDelete: () => void;
}) {
  const [duration, setDuration] = useState(
    paper.durationMin === null ? "" : String(paper.durationMin)
  );
  const [pass, setPass] = useState(paper.passScore === null ? "" : String(paper.passScore));

  return (
    <article className={s.staffCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2>{paper.title}</h2>
          <p>
            HSK {paper.level} · {paper.author} · {paper.questions.length} câu · {paper.maxScore} điểm ·{" "}
            {paper.published ? "Đang xuất bản" : "Chưa được duyệt"}
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #f87171",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
          title="Xóa vĩnh viễn đề thi này"
        >
          <Trash2 size={13} /> Xóa đề
        </button>
      </div>

      <details>
        <summary>Kiểm tra nội dung trước khi duyệt ({paper.questions.length} câu)</summary>
        {paper.questions.map((q, index) => (
          <div className={s.reviewQuestion} key={q.id}>
            <strong>
              {index + 1}. {q.content}
            </strong>
            <p>
              {skillNames[q.skill]} · {typeNames[q.type] || q.type} · {q.points} điểm trọng số
            </p>
            {q.audioUrl && (
              <p>
                <audio controls src={q.audioUrl} style={{ maxWidth: "100%" }} />
              </p>
            )}
            {q.imageUrl && (
              <p>
                <Image
                  unoptimized
                  width={360}
                  height={240}
                  src={q.imageUrl}
                  alt="Ảnh câu hỏi"
                  style={{ borderRadius: 8, objectFit: "contain" }}
                />
              </p>
            )}
            <p>Đáp án: {q.correctAnswer}</p>
            <p>{q.explanation}</p>
          </div>
        ))}
      </details>
      <form
        className={s.formColumns}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(Number(duration), pass === "" ? null : Number(pass), true);
        }}
      >
        <label>
          Thời gian (phút)
          <input
            required
            type="number"
            min={1}
            max={600}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </label>
        <label>
          Điểm đạt (để trống nếu chưa đặt)
          <input
            type="number"
            min={0}
            max={paper.maxScore}
            step="0.01"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </label>
        <button className={s.primary} disabled={busy} type="submit">
          Duyệt & lưu cấu hình
        </button>
        <button
          className={s.secondary}
          disabled={busy || !duration}
          type="button"
          onClick={() => onSave(Number(duration), pass === "" ? null : Number(pass), false)}
        >
          Ẩn đề
        </button>
      </form>
    </article>
  );
}

function ManualCard({
  attempt,
  busy,
  onSave,
}: {
  attempt: Queue[number];
  busy: boolean;
  onSave: (marks: Record<string, number>) => void;
}) {
  const [marks, setMarks] = useState<Record<string, number>>({});

  return (
    <article className={s.staffCard}>
      <h2>
        {(attempt as any).paperTitle || attempt.title} · {attempt.studentName}
      </h2>
      <p>
        HSK {attempt.level} · Mã bài thi: <code>{attempt.id}</code>
      </p>
      {attempt.manualQuestions.map((q) => (
        <div className={s.reviewQuestion} key={q.id}>
          <strong>{q.content}</strong>
          <p>
            {skillNames[q.skill]} · {typeNames[q.type] || q.type} · Tối đa {q.points} điểm
          </p>
          <div className={s.studentAnswer}>
            {q.answer.startsWith("data:audio/") ? (
              <audio controls src={q.answer} />
            ) : q.answer.startsWith("data:image/") ? (
              <Image
                unoptimized
                width={400}
                height={260}
                src={q.answer}
                alt="Bài làm ảnh"
                style={{ borderRadius: 8, objectFit: "contain" }}
              />
            ) : (
              <p>{q.answer || "Chưa có câu trả lời."}</p>
            )}
          </div>
          <label>
            Cho điểm (0 – {q.points})
            <input
              type="number"
              min={0}
              max={q.points}
              step="0.01"
              value={marks[q.id] ?? ""}
              onChange={(e) =>
                setMarks({
                  ...marks,
                  [q.id]: Math.min(q.points, Math.max(0, Number(e.target.value) || 0)),
                })
              }
            />
          </label>
        </div>
      ))}
      <button
        className={s.primary}
        disabled={busy}
        type="button"
        onClick={() => onSave(marks)}
      >
        Lưu điểm chấm
      </button>
    </article>
  );
}
