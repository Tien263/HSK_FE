"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import {
  FileCheck2,
  ExternalLink,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Volume2,
  ShieldAlert,
  Headphones,
  BookOpen,
  PlusCircle,
  GraduationCap,
  Layers,
  Eye,
  Edit3,
  Download,
  Upload,
  Save,
  Plus,
  X,
  Copy,
  Image as ImageIcon,
  Music,
  Check,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import CloudinaryUpload from "@/components/common/CloudinaryUploadButton";

interface ExamQuestionItem {
  id?: string;
  orderIndex: number;
  points: number;
  skill: "LISTENING" | "READING" | "WRITING" | "SPEAKING";
  type: string;
  content: string;
  pinyinPrompt?: string;
  audioUrl?: string;
  imageUrl?: string;
  options: Array<{ id: string; text: string; imageUrl?: string }>;
  correctAnswer: string;
  explanation?: string;
}

interface ExamDetail {
  id?: string;
  title: string;
  description: string;
  hskLevel: number;
  durationMin: number;
  passScore: number;
  totalScore: number;
  proctorEnabled: boolean;
  audioUrl?: string;
  questions: ExamQuestionItem[];
}

interface ExamItem {
  id: string;
  title: string;
  description: string | null;
  hskLevel: number;
  status: string;
  mode: string;
  totalScore: number;
  createdAt: string;
  totalQuestions: number;
  listeningCount: number;
  readingCount: number;
  writingCount: number;
  sampleAudio: string;
  durationMin: number;
  passScore: number;
  approved: boolean;
  proctorEnabled?: boolean;
}

interface AttemptItem {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  paperTitle: string;
  level: number;
  status: string;
  score: number | null;
  maxScore: number;
  startedAt: string;
  submittedAt: string | null;
  timedOut: boolean;
}

const emptyQuestion = (orderIndex: number, skill: "LISTENING" | "READING" | "WRITING" | "SPEAKING" = "LISTENING"): ExamQuestionItem => ({
  orderIndex,
  points: 5,
  skill,
  type: skill === "LISTENING" ? "listening_choice" : "multiple_choice",
  content: `Câu ${orderIndex}: `,
  pinyinPrompt: "",
  audioUrl: "",
  imageUrl: "",
  options: [
    { id: "A", text: "Lựa chọn A", imageUrl: "" },
    { id: "B", text: "Lựa chọn B", imageUrl: "" },
    { id: "C", text: "Lựa chọn C", imageUrl: "" },
  ],
  correctAnswer: "A",
  explanation: "",
});

export default function AdminMockExamWorkspace({
  onSwitchToProctor,
}: {
  onSwitchToProctor?: () => void;
}) {
  // Navigation Tabs: catalog | editor | templates | attempts
  const [activeTab, setActiveTab] = useState<"catalog" | "editor" | "templates" | "attempts">("catalog");

  // Data State
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<AttemptItem[]>([]);
  const [stats, setStats] = useState({ totalExams: 0, totalAttempts: 0, levelsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [savingExam, setSavingExam] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Filters & Selection
  const [filterLevel, setFilterLevel] = useState<number | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);

  // Audio Preview State
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Editor State
  const [editingExam, setEditingExam] = useState<ExamDetail>({
    title: "",
    description: "",
    hskLevel: 1,
    durationMin: 40,
    passScore: 120,
    totalScore: 200,
    proctorEnabled: true,
    audioUrl: "",
    questions: [emptyQuestion(1, "LISTENING")],
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Import JSON State
  const [jsonImportText, setJsonImportText] = useState("");
  const [jsonImportError, setJsonImportError] = useState<string | null>(null);
  const [jsonImportPreview, setJsonImportPreview] = useState<ExamDetail | null>(null);

  // 1. Tải danh sách đề thi & kết quả
  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/mock-exams", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setExams(data.exams || []);
        setRecentAttempts(data.recentAttempts || []);
        setStats(data.stats || { totalExams: 0, totalAttempts: 0, levelsCount: 0 });
      } else {
        setMessage({ text: data.message || "Không thể tải danh sách đề thi", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi kết nối máy chủ", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // 2. Chuyển sang soạn đề mới
  const handleStartCreateExam = (level = 1) => {
    const durationMin = level === 1 ? 40 : level === 2 ? 60 : level === 3 ? 90 : level === 4 ? 105 : 125;
    const totalScore = level <= 2 ? 200 : 300;
    const passScore = level <= 2 ? 120 : 180;
    setEditingExam({
      title: `HSK ${level} · Đề thi thử mới`,
      description: `Đề thi khảo thí trực tuyến chuẩn HSK ${level}`,
      hskLevel: level,
      durationMin,
      passScore,
      totalScore,
      proctorEnabled: true,
      audioUrl: `/audio/hsk${level <= 6 ? level : 7}_exam.mp3`,
      questions: [
        emptyQuestion(1, "LISTENING"),
        emptyQuestion(2, "LISTENING"),
        emptyQuestion(3, "READING"),
      ],
    });
    setCurrentQuestionIndex(0);
    setActiveTab("editor");
  };

  // 3. Mở chỉnh sửa đề thi đã có
  const handleEditExam = async (examId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/admin/mock-exams?id=${examId}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.exam) {
        setEditingExam({
          id: data.exam.id,
          title: data.exam.title,
          description: data.exam.description || "",
          hskLevel: data.exam.hskLevel,
          durationMin: data.exam.durationMin,
          passScore: data.exam.passScore,
          totalScore: data.exam.totalScore,
          proctorEnabled: data.exam.proctorEnabled !== false,
          audioUrl: data.exam.audioUrl || "",
          questions: data.exam.questions.length > 0 ? data.exam.questions : [emptyQuestion(1, "LISTENING")],
        });
        setCurrentQuestionIndex(0);
        setActiveTab("editor");
      } else {
        setMessage({ text: data.message || "Không thể tải chi tiết đề thi", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi tải chi tiết đề thi", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // 4. Lưu đề thi từ Form Soạn Đề
  const handleSaveExam = async () => {
    if (!editingExam.title.trim()) {
      setMessage({ text: "Vui lòng nhập tiêu đề cho đề thi.", type: "error" });
      return;
    }
    if (editingExam.questions.length === 0) {
      setMessage({ text: "Đề thi cần có ít nhất một câu hỏi.", type: "error" });
      return;
    }

    try {
      setSavingExam(true);
      setMessage(null);
      const res = await fetch("/api/v1/admin/mock-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveExam",
          exam: editingExam,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message || "Đã lưu đề thi thành công!", type: "success" });
        await fetchExams();
        setActiveTab("catalog");
      } else {
        setMessage({ text: data.message || "Không thể lưu đề thi", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi khi lưu đề thi lên máy chủ", type: "error" });
    } finally {
      setSavingExam(false);
    }
  };

  // 5. Xóa đơn lẻ một đề thi
  const handleDeleteExam = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn đề thi: "${title}"?\nThao tác này sẽ xóa toàn bộ câu hỏi liên quan.`)) return;
    try {
      const res = await fetch("/api/v1/admin/mock-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteExam", id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message, type: "success" });
        setSelectedExamIds((prev) => prev.filter((item) => item !== id));
        await fetchExams();
      } else {
        setMessage({ text: data.message || "Không thể xóa đề thi", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi khi xóa đề thi", type: "error" });
    }
  };

  // 6. Xóa hàng loạt các đề thi đã chọn
  const handleBulkDeleteExams = async () => {
    if (selectedExamIds.length === 0) return;
    if (!confirm(`XÁC NHẬN XÓA HÀNG LOẠT:\nBạn có chắc chắn muốn xóa vĩnh viễn ${selectedExamIds.length} đề thi đã chọn không?`)) return;
    try {
      const res = await fetch("/api/v1/admin/mock-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteMultipleExams", ids: selectedExamIds }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message, type: "success" });
        setSelectedExamIds([]);
        await fetchExams();
      } else {
        setMessage({ text: data.message || "Lỗi xóa hàng loạt", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi kết nối khi xóa hàng loạt", type: "error" });
    }
  };

  // 7. Xóa sạch toàn bộ đề thi (Clear All)
  const handleClearAllExams = async () => {
    const lvlText = filterLevel === "ALL" ? "TOÀN BỘ CÁC CẤP ĐỘ" : `HSK ${filterLevel}`;
    const confirmation = prompt(
      `⚠️ CẢNH BÁO QUAN TRỌNG: Bạn sắp xóa sạch tất cả đề thi thử thuộc ${lvlText}!\nĐể xác nhận, vui lòng gõ đúng chữ "XOA HET" vào ô dưới đây:`
    );
    if (confirmation !== "XOA HET") {
      if (confirmation !== null) setMessage({ text: "Đã hủy thao tác xóa sạch do nhập sai từ xác nhận.", type: "error" });
      return;
    }

    try {
      const res = await fetch("/api/v1/admin/mock-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteAllExams",
          level: filterLevel === "ALL" ? null : filterLevel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message, type: "success" });
        setSelectedExamIds([]);
        await fetchExams();
      } else {
        setMessage({ text: data.message || "Lỗi xóa tất cả", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi khi gửi yêu cầu xóa tất cả", type: "error" });
    }
  };

  // 8. Bật/Tắt AI Proctor cho đề
  const handleToggleProctor = async (examId: string, currentVal: boolean) => {
    try {
      const res = await fetch("/api/v1/admin/mock-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleProctor", id: examId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message, type: "success" });
        setExams((prev) =>
          prev.map((e) => (e.id === examId ? { ...e, proctorEnabled: !currentVal } : e))
        );
      } else {
        setMessage({ text: data.message || "Không thể đổi trạng thái giám thị AI", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi kết nối máy chủ", type: "error" });
    }
  };

  // 9. Nạp đề chuẩn HSK 1 CTI
  const handleSeedHsk1 = async () => {
    try {
      setSeeding(true);
      setMessage(null);
      const res = await fetch("/api/v1/admin/mock-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seedHsk1" }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message, type: "success" });
        await fetchExams();
      } else {
        setMessage({ text: data.message || "Không thể nạp đề HSK 1", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi trong quá trình nạp đề", type: "error" });
    } finally {
      setSeeding(false);
    }
  };

  // 10. Xuất đề thi ra JSON
  const handleExportExamJson = async (examId: string, title: string) => {
    try {
      const res = await fetch(`/api/v1/admin/mock-exams?id=${examId}`);
      const data = await res.json();
      if (!data.success || !data.exam) throw new Error("Không thể tải chi tiết đề để xuất.");
      const blob = new Blob([JSON.stringify(data.exam, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `De_Thi_${data.exam.hskLevel}_${title.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, "_")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage({ text: "Đã xuất file JSON đề thi thành công!", type: "success" });
    } catch (err: any) {
      setMessage({ text: "Lỗi xuất đề: " + err.message, type: "error" });
    }
  };

  // 11. Nhập đề thi từ file JSON
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = String(event.target?.result || "");
        setJsonImportText(text);
        const parsed = JSON.parse(text);
        if (!parsed.title || !Array.isArray(parsed.questions)) {
          throw new Error("File JSON phải có trường 'title' và mảng 'questions'.");
        }
        setJsonImportPreview(parsed);
        setJsonImportError(null);
      } catch (err: any) {
        setJsonImportError(err.message || "Cú pháp JSON không hợp lệ");
        setJsonImportPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImportJson = async () => {
    if (!jsonImportPreview) return;
    try {
      setSavingExam(true);
      const res = await fetch("/api/v1/admin/mock-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "importExamJson",
          exam: jsonImportPreview,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message || "Đã nạp đề thi từ JSON thành công!", type: "success" });
        setJsonImportText("");
        setJsonImportPreview(null);
        await fetchExams();
        setActiveTab("catalog");
      } else {
        setMessage({ text: data.message || "Lỗi khi lưu đề từ JSON", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi kết nối khi nạp JSON", type: "error" });
    } finally {
      setSavingExam(false);
    }
  };

  // 12. Phát âm thanh thử
  const toggleAudio = (audioUrl: string) => {
    if (playingAudio === audioUrl) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setPlayingAudio(null);
      audio.play().catch(() => {});
      setPlayingAudio(audioUrl);
    }
  };

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const matchLevel = filterLevel === "ALL" ? true : filterLevel === 7 ? e.hskLevel >= 7 : e.hskLevel === filterLevel;
      const matchSearch = searchTerm.trim() === "" ? true : e.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchLevel && matchSearch;
    });
  }, [exams, filterLevel, searchTerm]);

  // Current editing question
  const currentQ = editingExam.questions[currentQuestionIndex] || editingExam.questions[0];

  const updateCurrentQuestion = (patch: Partial<ExamQuestionItem>) => {
    setEditingExam((prev) => {
      const updatedQs = [...prev.questions];
      if (updatedQs[currentQuestionIndex]) {
        updatedQs[currentQuestionIndex] = { ...updatedQs[currentQuestionIndex], ...patch };
      }
      return { ...prev, questions: updatedQs };
    });
  };

  const handleAddQuestion = () => {
    const nextIdx = editingExam.questions.length + 1;
    const lastSkill = editingExam.questions[editingExam.questions.length - 1]?.skill || "LISTENING";
    const newQ = emptyQuestion(nextIdx, lastSkill);
    setEditingExam((prev) => ({
      ...prev,
      questions: [...prev.questions, newQ],
    }));
    setCurrentQuestionIndex(editingExam.questions.length);
  };

  const handleDeleteQuestion = (indexToDelete: number) => {
    if (editingExam.questions.length <= 1) {
      alert("Đề thi cần có ít nhất một câu hỏi.");
      return;
    }
    const filtered = editingExam.questions
      .filter((_, idx) => idx !== indexToDelete)
      .map((q, idx) => ({ ...q, orderIndex: idx + 1 }));
    setEditingExam((prev) => ({ ...prev, questions: filtered }));
    setCurrentQuestionIndex((prev) => Math.min(prev, filtered.length - 1));
  };

  const handleDuplicateQuestion = (indexToDup: number) => {
    const target = editingExam.questions[indexToDup];
    if (!target) return;
    const duplicated: ExamQuestionItem = JSON.parse(JSON.stringify(target));
    delete duplicated.id;
    const newQs = [...editingExam.questions];
    newQs.splice(indexToDup + 1, 0, duplicated);
    const reindexed = newQs.map((q, idx) => ({ ...q, orderIndex: idx + 1 }));
    setEditingExam((prev) => ({ ...prev, questions: reindexed }));
    setCurrentQuestionIndex(indexToDup + 1);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {message && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-2xl border shadow-sm ${
            message.type === "success"
              ? "bg-[#204434]/10 border-[#204434]/30 text-[#163325]"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            {message.type === "success" ? (
              <CheckCircle2 size={16} className="text-[#204434]" />
            ) : (
              <AlertCircle size={16} className="text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs opacity-60 hover:opacity-100 font-bold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* 1. HERO BANNER: KẾT NỐI TRỰC TIẾP VÀO PHÒNG THI */}
      <div className="relative overflow-hidden rounded-3xl border border-[#BC9B6B]/40 bg-gradient-to-br from-[#163325] via-[#204434] to-[#2B543F] text-[#FAF7F0] p-6 sm:p-8 shadow-md">
        <div
          className="absolute right-0 top-0 w-96 h-full opacity-15 pointer-events-none bg-cover bg-right"
          style={{ backgroundImage: `url('/theme/exam-bamboo-depth.png')` }}
        />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FAF7F0]/15 px-3 py-1 text-[11px] font-semibold text-[#E5D7B7] backdrop-blur-md border border-[#FAF7F0]/20">
            <FileCheck2 size={14} className="text-[#BC9B6B]" />
            <span>Trung tâm Khảo thí & Soạn thảo Đề thi HSK (Chuẩn CTI Hanban 100%)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#FFFDF9]">
            Quản trị & Soạn đề Khảo thí HSK
          </h2>

          <p className="text-xs sm:text-sm text-[#FAF7F0]/85 leading-relaxed">
            Hỗ trợ upload ảnh đề bài, ảnh từng lựa chọn A-D, âm thanh nghe MP3, quản lý xóa đơn / xóa hàng loạt và cung cấp template JSON đề thi chuẩn 100%.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <Link
              href="/s/mock-exam"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FAF7F0] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#163325] shadow-lg hover:bg-[#FFFDF9] transition cursor-pointer"
            >
              <ExternalLink size={15} className="text-[#BC9B6B]" />
              <span>Vào Phòng Thi Học Viên</span>
            </Link>

            <button
              type="button"
              onClick={() => handleStartCreateExam(1)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#BC9B6B] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#A88857] transition cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>+ Soạn đề thi mới</span>
            </button>

            <button
              type="button"
              onClick={handleSeedHsk1}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FAF7F0]/15 border border-[#FAF7F0]/30 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#FAF7F0] hover:bg-[#FAF7F0]/25 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={seeding ? "animate-spin" : ""} />
              <span>{seeding ? "Đang nạp đề..." : "Nạp đề mẫu CTI HSK 1"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS (TRÌNH TỰ KHOA HỌC: KHO ĐỀ -> SOẠN ĐỀ -> MẪU & IMPORT -> LỊCH SỬ) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#BC9B6B]/30 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "catalog"
              ? "bg-[#204434] text-white shadow-sm"
              : "bg-white border border-[#BC9B6B]/30 text-[#163325] hover:bg-[#FAF7F0]"
          }`}
        >
          <BookOpen size={16} />
          <span>Kho Đề Thi ({exams.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!editingExam.title) handleStartCreateExam(1);
            setActiveTab("editor");
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "editor"
              ? "bg-[#204434] text-white shadow-sm"
              : "bg-white border border-[#BC9B6B]/30 text-[#163325] hover:bg-[#FAF7F0]"
          }`}
        >
          <Edit3 size={16} />
          <span>Form Soạn Đề {editingExam.title ? `(${editingExam.questions.length} câu)` : ""}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "templates"
              ? "bg-[#204434] text-white shadow-sm"
              : "bg-white border border-[#BC9B6B]/30 text-[#163325] hover:bg-[#FAF7F0]"
          }`}
        >
          <Sparkles size={16} />
          <span>Mẫu Template &amp; Nhập JSON</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("attempts")}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "attempts"
              ? "bg-[#204434] text-white shadow-sm"
              : "bg-white border border-[#BC9B6B]/30 text-[#163325] hover:bg-[#FAF7F0]"
          }`}
        >
          <GraduationCap size={16} />
          <span>Lịch Sử Thí Sinh ({recentAttempts.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: KHO ĐỀ THI & QUẢN LÝ XÓA ĐƠN / XÓA HÀNG LOẠT
         ========================================================================= */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {/* Filter Bar & Bulk Actions */}
          <div className="p-4 rounded-3xl bg-[#FFFDF9] border border-[#BC9B6B]/30 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Level Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-[#526c50] mr-1 flex items-center gap-1">
                  <Filter size={13} /> Cấp độ:
                </span>
                {(["ALL", 1, 2, 3, 4, 5, 6, 7] as const).map((lvl) => (
                  <button
                    key={String(lvl)}
                    type="button"
                    onClick={() => setFilterLevel(lvl as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      filterLevel === lvl
                        ? "bg-[#204434] text-white shadow-xs"
                        : "bg-[#FAF7F0] border border-[#E5DEC9] text-[#163325] hover:bg-[#E5DEC9]/40"
                    }`}
                  >
                    {lvl === "ALL" ? "Tất cả" : lvl === 7 ? "HSK 7-9" : `HSK ${lvl}`}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[220px]">
                <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tên đề thi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#BC9B6B]/30 text-xs bg-white focus:outline-[#204434]"
                />
              </div>
            </div>

            {/* Bulk Toolbar */}
            <div className="pt-2 border-t border-[#BC9B6B]/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="select-all-exams"
                  checked={filteredExams.length > 0 && selectedExamIds.length === filteredExams.length}
                  onChange={() => {
                    if (selectedExamIds.length === filteredExams.length) {
                      setSelectedExamIds([]);
                    } else {
                      setSelectedExamIds(filteredExams.map((e) => e.id));
                    }
                  }}
                  className="w-4 h-4 rounded text-[#204434] focus:ring-[#204434] cursor-pointer"
                />
                <label htmlFor="select-all-exams" className="text-xs font-bold text-[#163325] cursor-pointer select-none">
                  {selectedExamIds.length === 0
                    ? `Chọn tất cả (${filteredExams.length} đề)`
                    : `Đã chọn ${selectedExamIds.length} / ${filteredExams.length} đề`}
                </label>
              </div>

              <div className="flex items-center gap-2">
                {selectedExamIds.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedExamIds([])}
                      className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkDeleteExams}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Trash2 size={14} />
                      <span>Xóa {selectedExamIds.length} đề đã chọn</span>
                    </button>
                  </>
                )}

                {filteredExams.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllExams}
                    className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    title="Xóa toàn bộ đề thi thuộc bộ lọc hiện tại"
                  >
                    <Trash2 size={13} />
                    <span>Xóa toàn bộ đề {filterLevel !== "ALL" ? `HSK ${filterLevel}` : ""}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Danh sách đề thi */}
          {loading ? (
            <div className="py-16 text-center text-xs text-stone-500">Đang tải danh sách đề thi...</div>
          ) : filteredExams.length === 0 ? (
            <div className="py-16 text-center bg-[#FFFDF9] rounded-3xl border border-dashed border-[#BC9B6B]/30 space-y-3">
              <BookOpen className="w-10 h-10 text-[#8F6D3B]/40 mx-auto" />
              <p className="text-sm font-bold text-[#163325]">Chưa có đề thi nào phù hợp</p>
              <p className="text-xs text-[#526c50]">
                Hãy bấm &quot;+ Soạn đề thi mới&quot; hoặc &quot;Mẫu &amp; Nhập JSON&quot; để tạo đề thi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExams.map((exam) => {
                const isSelected = selectedExamIds.includes(exam.id);
                const isAudioPlaying = playingAudio === exam.sampleAudio;

                return (
                  <div
                    key={exam.id}
                    className={`p-5 rounded-3xl border transition shadow-2xs hover:shadow-md flex flex-col justify-between space-y-4 ${
                      isSelected ? "bg-amber-50/40 border-[#BC9B6B]" : "bg-[#FFFDF9] border-[#BC9B6B]/30 hover:border-[#204434]"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Header Card */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedExamIds((prev) =>
                                isSelected ? prev.filter((id) => id !== exam.id) : [...prev, exam.id]
                              );
                            }}
                            className="w-4 h-4 rounded text-[#204434] focus:ring-[#204434] cursor-pointer"
                          />
                          <span className="rounded-lg bg-[#204434] text-white px-2.5 py-0.5 text-xs font-bold font-serif">
                            HSK {exam.hskLevel}
                          </span>
                        </div>

                        {/* Proctor Badge Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleProctor(exam.id, exam.proctorEnabled !== false)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                            exam.proctorEnabled !== false
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-gray-100 text-gray-600 border-gray-300"
                          }`}
                          title="Bấm để Bật/Tắt Giám thị AI cho đề này"
                        >
                          <ShieldAlert size={12} className={exam.proctorEnabled !== false ? "text-emerald-600" : "text-gray-400"} />
                          <span>{exam.proctorEnabled !== false ? "AI: BẬT" : "AI: TẮT"}</span>
                        </button>
                      </div>

                      {/* Title & Desc */}
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#163325] leading-snug line-clamp-2">
                          {exam.title}
                        </h4>
                        <p className="text-xs text-[#526c50] mt-1 line-clamp-2">
                          {exam.description || "Đề thi khảo thí trực tuyến chuẩn HSK 3.0"}
                        </p>
                      </div>

                      {/* Badges Metadata */}
                      <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[#163325] font-semibold">
                          📝 {exam.totalQuestions} câu hỏi
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[#163325]">
                          🎧 {exam.listeningCount} Nghe
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[#163325]">
                          📖 {exam.readingCount} Đọc
                        </span>
                        {exam.writingCount > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[#163325]">
                            ✍️ {exam.writingCount} Viết
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[#163325]">
                          ⏱️ {exam.durationMin} phút
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-[#BC9B6B]/20 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* Go to Exam */}
                        <Link
                          href={`/s/mock-exam?view=overview&id=${exam.id}&level=${exam.hskLevel}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-xl bg-[#204434] hover:bg-[#163325] text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                        >
                          <Eye size={13} />
                          <span>Thi thử</span>
                        </Link>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleEditExam(exam.id)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#BC9B6B]/40 hover:bg-[#FAF7F0] text-[#163325] text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                          title="Chỉnh sửa câu hỏi và cấu hình đề thi"
                        >
                          <Edit3 size={13} className="text-[#BC9B6B]" />
                          <span>Sửa đề</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Audio Preview */}
                        <button
                          type="button"
                          onClick={() => toggleAudio(exam.sampleAudio)}
                          className={`p-1.5 rounded-xl border text-xs transition cursor-pointer ${
                            isAudioPlaying ? "bg-amber-100 border-amber-400 text-amber-900" : "bg-white border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]"
                          }`}
                          title="Nghe thử file âm thanh đề thi"
                        >
                          {isAudioPlaying ? <Pause size={14} className="text-amber-700" /> : <Volume2 size={14} className="text-[#BC9B6B]" />}
                        </button>

                        {/* Export JSON */}
                        <button
                          type="button"
                          onClick={() => handleExportExamJson(exam.id, exam.title)}
                          className="p-1.5 rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-stone-600 transition cursor-pointer"
                          title="Xuất đề thi ra file JSON"
                        >
                          <Download size={14} />
                        </button>

                        {/* Delete Single Exam */}
                        <button
                          type="button"
                          onClick={() => handleDeleteExam(exam.id, exam.title)}
                          className="p-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                          title="Xóa đề thi này khỏi hệ thống"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: FORM SOẠN ĐỀ & BIÊN TẬP CÂU HỎI (HỖ TRỢ UPLOAD ẢNH & AUDIO)
         ========================================================================= */}
      {activeTab === "editor" && (
        <div className="space-y-6">
          {/* Header Editor Toolbar */}
          <div className="p-4 rounded-3xl bg-[#FFFDF9] border border-[#BC9B6B]/30 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#163325]">
                {editingExam.id ? "✏️ Chỉnh Sửa Đề Thi" : "✍️ Soạn Thảo Đề Thi Mới"}
              </h3>
              <p className="text-xs text-[#526c50]">
                HSK {editingExam.hskLevel} · {editingExam.questions.length} câu hỏi · {editingExam.durationMin} phút
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("catalog")}
                className="px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-xs font-semibold text-stone-700 cursor-pointer"
              >
                Hủy &amp; Quay lại
              </button>

              <button
                type="button"
                disabled={savingExam}
                onClick={handleSaveExam}
                className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#163325] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                <span>{savingExam ? "Đang lưu lên máy chủ..." : "Lưu & Xuất Bản Đề Thi"}</span>
              </button>
            </div>
          </div>

          {/* Form Thông Tin Chung Đề Thi */}
          <div className="p-5 rounded-3xl bg-white border border-[#BC9B6B]/30 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#BC9B6B]">1. Cấu hình chung đề thi</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-[#163325]">Tên đề thi *</label>
                <input
                  type="text"
                  value={editingExam.title}
                  onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })}
                  placeholder="Ví dụ: HSK 1 · Đề thi thử số 02"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-medium focus:outline-[#204434]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#163325]">Cấp độ HSK</label>
                <select
                  value={editingExam.hskLevel}
                  onChange={(e) => {
                    const lvl = Number(e.target.value);
                    const dur = lvl === 1 ? 40 : lvl === 2 ? 60 : lvl === 3 ? 90 : lvl === 4 ? 105 : 125;
                    const tot = lvl <= 2 ? 200 : 300;
                    const pass = lvl <= 2 ? 120 : 180;
                    setEditingExam({
                      ...editingExam,
                      hskLevel: lvl,
                      durationMin: dur,
                      totalScore: tot,
                      passScore: pass,
                      audioUrl: `/audio/hsk${lvl <= 6 ? lvl : 7}_exam.mp3`,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-medium focus:outline-[#204434]"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl === 7 ? "HSK 7 - 9" : `HSK ${lvl}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#163325]">Thời gian thi (phút)</label>
                <input
                  type="number"
                  value={editingExam.durationMin}
                  onChange={(e) => setEditingExam({ ...editingExam, durationMin: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-medium focus:outline-[#204434]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-[#163325]">Mô tả đề thi</label>
                <input
                  type="text"
                  value={editingExam.description}
                  onChange={(e) => setEditingExam({ ...editingExam, description: e.target.value })}
                  placeholder="Ví dụ: Đề thi thử bám sát cấu trúc đề chính thức CTI"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-medium focus:outline-[#204434]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#163325]">Điểm tối đa</label>
                <input
                  type="number"
                  value={editingExam.totalScore}
                  onChange={(e) => setEditingExam({ ...editingExam, totalScore: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-medium focus:outline-[#204434]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#163325]">Điểm đạt (Pass score)</label>
                <input
                  type="number"
                  value={editingExam.passScore}
                  onChange={(e) => setEditingExam({ ...editingExam, passScore: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-medium focus:outline-[#204434]"
                />
              </div>

              {/* Audio đề thi chung & Giám thị AI */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#163325] flex items-center justify-between">
                  <span>File Audio tổng cho phần Nghe (.mp3 / Cloudinary)</span>
                  {editingExam.audioUrl && (
                    <button
                      type="button"
                      onClick={() => toggleAudio(editingExam.audioUrl!)}
                      className="text-[11px] text-[#BC9B6B] font-bold hover:underline cursor-pointer"
                    >
                      {playingAudio === editingExam.audioUrl ? "Tạm dừng" : "Nghe thử"}
                    </button>
                  )}
                </label>
                <CloudinaryUpload
                  value={editingExam.audioUrl || ""}
                  onChange={(url) => setEditingExam({ ...editingExam, audioUrl: url })}
                  accept="audio/*"
                  folder="hsk_exam_audios"
                  placeholder="Tải lên file âm thanh tổng hoặc dán link URL..."
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 pt-4">
                <label className="flex items-center gap-2 text-xs font-bold text-[#163325] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingExam.proctorEnabled}
                    onChange={(e) => setEditingExam({ ...editingExam, proctorEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-[#204434] focus:ring-[#204434] cursor-pointer"
                  />
                  <span>Bật chế độ Giám thị AI (Camera &amp; Micro) cho đề thi này</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Biên Tập Câu Hỏi: Cột Trái Cây Câu Hỏi - Cột Phải Chi Tiết Câu Hỏi */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột Trái: Cây câu hỏi (4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-4 rounded-3xl bg-[#FFFDF9] border border-[#BC9B6B]/30 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#BC9B6B]">
                    Danh sách câu hỏi ({editingExam.questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-2.5 py-1 rounded-xl bg-[#204434] hover:bg-[#163325] text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Thêm câu</span>
                  </button>
                </div>

                {/* Danh sách các câu hỏi theo skills */}
                <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
                  {editingExam.questions.map((q, idx) => {
                    const isCurrent = idx === currentQuestionIndex;
                    const skillColor =
                      q.skill === "LISTENING"
                        ? "text-blue-700 bg-blue-50 border-blue-200"
                        : q.skill === "READING"
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : "text-amber-700 bg-amber-50 border-amber-200";

                    return (
                      <div
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                          isCurrent
                            ? "bg-[#204434] text-white border-[#204434] shadow-xs"
                            : "bg-white border-[#E5DEC9] text-[#163325] hover:bg-[#FAF7F0]"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span
                            className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                              isCurrent ? "bg-white text-[#204434]" : "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold truncate">
                            {q.content.replace(/^第\s*\d+\s*题[：:]?\s*/, "") || `Câu ${idx + 1}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                              isCurrent ? "bg-white/20 text-white border-white/30" : skillColor
                            }`}
                          >
                            {q.skill === "LISTENING" ? "Nghe" : q.skill === "READING" ? "Đọc" : "Viết"}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateQuestion(idx);
                            }}
                            className={`p-1 rounded-md transition ${
                              isCurrent ? "hover:bg-white/20 text-white" : "hover:bg-stone-100 text-stone-500"
                            }`}
                            title="Nhân bản câu này"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuestion(idx);
                            }}
                            className={`p-1 rounded-md transition ${
                              isCurrent ? "hover:bg-red-500/40 text-red-200" : "hover:bg-red-50 text-red-500"
                            }`}
                            title="Xóa câu này"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cột Phải: Biên Tập Chi Tiết Câu Hỏi Được Chọn (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-5 rounded-3xl bg-white border border-[#BC9B6B]/30 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#204434] text-white font-bold text-xs flex items-center justify-center">
                      {currentQuestionIndex + 1}
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#163325]">
                      Biên soạn Câu {currentQuestionIndex + 1} / {editingExam.questions.length}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      className="px-2.5 py-1 rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-xs font-semibold text-stone-700 disabled:opacity-40 cursor-pointer"
                    >
                      &lt; Câu trước
                    </button>
                    <button
                      type="button"
                      disabled={currentQuestionIndex === editingExam.questions.length - 1}
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(editingExam.questions.length - 1, prev + 1))}
                      className="px-2.5 py-1 rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-xs font-semibold text-stone-700 disabled:opacity-40 cursor-pointer"
                    >
                      Câu tiếp &gt;
                    </button>
                  </div>
                </div>

                {/* Form Chi Tiết Câu Hỏi */}
                <div className="space-y-4">
                  {/* Skill & Question Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#163325]">Kỹ năng thi</label>
                      <select
                        value={currentQ.skill}
                        onChange={(e) => updateCurrentQuestion({ skill: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-medium focus:outline-[#204434]"
                      >
                        <option value="LISTENING">Nghe (听力 - LISTENING)</option>
                        <option value="READING">Đọc (阅读 - READING)</option>
                        <option value="WRITING">Viết (书写/写作 - WRITING)</option>
                        <option value="SPEAKING">Nói (口语 - SPEAKING)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#163325]">Dạng câu hỏi</label>
                      <select
                        value={currentQ.type}
                        onChange={(e) => updateCurrentQuestion({ type: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-medium focus:outline-[#204434]"
                      >
                        <option value="multiple_choice">Trắc nghiệm chữ (A, B, C, D)</option>
                        <option value="listening_choice">Trắc nghiệm nghe (Audio + Chữ/Tranh)</option>
                        <option value="true_false">Phán đoán Đúng / Sai (√ / ×)</option>
                        <option value="matching">Nối tranh / Nối cặp (A - F)</option>
                        <option value="sentence_order">Sắp xếp trật tự câu (Reorder)</option>
                        <option value="fill_blank">Điền từ vào chỗ trống</option>
                        <option value="writing">Viết câu / Viết theo tranh</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#163325]">Điểm số câu này</label>
                      <input
                        type="number"
                        value={currentQ.points}
                        onChange={(e) => updateCurrentQuestion({ points: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-medium focus:outline-[#204434]"
                      />
                    </div>
                  </div>

                  {/* Nội dung câu hỏi */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#163325]">Nội dung câu hỏi / Đề bài *</label>
                    <textarea
                      rows={2}
                      value={currentQ.content}
                      onChange={(e) => updateCurrentQuestion({ content: e.target.value })}
                      placeholder="Ví dụ: 第 1 题：请听录音并选择符合内容的图片。"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-medium focus:outline-[#204434]"
                    />
                  </div>

                  {/* Pinyin Prompt (nếu có) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#163325]">Phiên âm Pinyin đề bài (tùy chọn)</label>
                    <input
                      type="text"
                      value={currentQ.pinyinPrompt || ""}
                      onChange={(e) => updateCurrentQuestion({ pinyinPrompt: e.target.value })}
                      placeholder="Ví dụ: Nǐ de bēizi zài nǎr?"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-medium focus:outline-[#204434]"
                    />
                  </div>

                  {/* UPLOAD ÂM THANH CÂU HỎI & ẢNH MINH HỌA CÂU HỎI */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9]">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#163325] flex items-center gap-1.5">
                        <Music size={14} className="text-[#BC9B6B]" />
                        <span>File âm thanh câu hỏi (MP3 / Cloudinary)</span>
                      </label>
                      <CloudinaryUpload
                        value={currentQ.audioUrl || ""}
                        onChange={(url) => updateCurrentQuestion({ audioUrl: url })}
                        accept="audio/*"
                        folder="hsk_question_audios"
                        placeholder="Tải lên âm thanh câu hỏi hoặc để trống..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#163325] flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-[#BC9B6B]" />
                        <span>Ảnh minh họa đề bài (Cloudinary / URL)</span>
                      </label>
                      <CloudinaryUpload
                        value={currentQ.imageUrl || ""}
                        onChange={(url) => updateCurrentQuestion({ imageUrl: url })}
                        accept="image/*"
                        folder="hsk_question_images"
                        placeholder="Tải lên ảnh đề bài hoặc để trống..."
                      />
                    </div>
                  </div>

                  {/* CÁC LỰA CHỌN ĐÁP ÁN (A, B, C, D) KÈM UPLOAD ẢNH CHO TỪNG ĐÁP ÁN */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#163325]">
                        Các lựa chọn đáp án (A, B, C...) &amp; Tải ảnh cho đáp án tranh
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const nextId = String.fromCharCode(65 + currentQ.options.length);
                          updateCurrentQuestion({
                            options: [...currentQ.options, { id: nextId, text: `Lựa chọn ${nextId}`, imageUrl: "" }],
                          });
                        }}
                        className="text-xs font-bold text-[#204434] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={13} />
                        <span>Thêm lựa chọn</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {currentQ.options.map((opt, optIdx) => (
                        <div
                          key={opt.id || optIdx}
                          className="p-3 rounded-2xl border border-[#E5DEC9] bg-white space-y-2"
                        >
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="correct-choice"
                                checked={currentQ.correctAnswer === opt.id}
                                onChange={() => updateCurrentQuestion({ correctAnswer: opt.id })}
                                className="w-4 h-4 text-[#204434] focus:ring-[#204434] cursor-pointer"
                              />
                              <span className="w-6 h-6 rounded-lg bg-[#204434]/10 text-[#204434] font-bold text-xs flex items-center justify-center">
                                {opt.id}
                              </span>
                            </label>

                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const newOpts = [...currentQ.options];
                                newOpts[optIdx] = { ...newOpts[optIdx], text: e.target.value };
                                updateCurrentQuestion({ options: newOpts });
                              }}
                              placeholder={`Nội dung chữ cho lựa chọn ${opt.id}...`}
                              className="flex-1 px-3 py-1.5 rounded-xl border border-[#E5DEC9] text-xs font-medium focus:outline-[#204434]"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                const newOpts = currentQ.options.filter((_, i) => i !== optIdx);
                                updateCurrentQuestion({ options: newOpts });
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                              title="Xóa lựa chọn này"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* Upload ảnh cho lựa chọn này (Dành cho HSK 1, 2, 3 chọn ảnh A, B, C) */}
                          <div className="pl-9">
                            <CloudinaryUpload
                              value={opt.imageUrl || ""}
                              onChange={(url) => {
                                const newOpts = [...currentQ.options];
                                newOpts[optIdx] = { ...newOpts[optIdx], imageUrl: url };
                                updateCurrentQuestion({ options: newOpts });
                              }}
                              accept="image/*"
                              folder="hsk_choice_images"
                              placeholder={`Tải ảnh minh họa cho đáp án ${opt.id} (nếu có)...`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lời giải thích đáp án */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#163325]">Giải thích đáp án chi tiết</label>
                    <textarea
                      rows={2}
                      value={currentQ.explanation || ""}
                      onChange={(e) => updateCurrentQuestion({ explanation: e.target.value })}
                      placeholder="Giải thích ngữ pháp, từ vựng hoặc đoạn hội thoại dẫn chứng..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-medium focus:outline-[#204434]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MẪU TEMPLATE ĐỀ HSK & NHẬP / XUẤT FILE JSON
         ========================================================================= */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          {/* Card Tải Template Chuẩn */}
          <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#BC9B6B]/30 space-y-4 shadow-xs">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#163325] flex items-center gap-2">
                <Sparkles size={18} className="text-[#BC9B6B]" />
                <span>Mẫu Đề Thi Chuẩn HSK 3.0 Quốc Tế (JSON Template)</span>
              </h3>
              <p className="text-xs text-[#526c50] mt-1">
                Tải về các file cấu trúc mẫu chuẩn 100% để bạn hoặc giáo viên có thể soạn hàng chục đề thi một cách dễ dàng và đồng bộ.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <a
                href="/templates/De_Thi_Thu_HSK_Mau_Chuan.json"
                download="De_Thi_Thu_HSK_Mau_Chuan.json"
                className="p-4 rounded-2xl bg-white border border-[#BC9B6B]/40 hover:border-[#204434] transition shadow-2xs hover:shadow-md space-y-2 block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#204434]">Template Chuẩn Đầy Đủ</span>
                  <Download size={14} className="text-[#BC9B6B]" />
                </div>
                <p className="text-[11px] text-[#526c50]">
                  Gồm mẫu câu trắc nghiệm ảnh, đúng sai, ghép tranh A-E, audio MP3.
                </p>
                <span className="text-[10px] font-bold text-[#BC9B6B] block">Tải File JSON →</span>
              </a>

              <button
                type="button"
                onClick={handleSeedHsk1}
                disabled={seeding}
                className="p-4 rounded-2xl bg-white border border-[#BC9B6B]/40 hover:border-[#204434] transition shadow-2xs hover:shadow-md space-y-2 text-left cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#204434]">Đề Thi Chuẩn CTI HSK 1</span>
                  <RefreshCw size={14} className={`text-[#BC9B6B] ${seeding ? "animate-spin" : ""}`} />
                </div>
                <p className="text-[11px] text-[#526c50]">
                  Nạp 40 câu hỏi chính thức HSK 1 kèm audio gốc và ảnh minh họa CTI.
                </p>
                <span className="text-[10px] font-bold text-emerald-700 block">Nạp 1 Click Vào Hệ Thống →</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartCreateExam(2)}
                className="p-4 rounded-2xl bg-white border border-[#BC9B6B]/40 hover:border-[#204434] transition shadow-2xs hover:shadow-md space-y-2 text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#204434]">Khung Đề HSK 2 - HSK 6</span>
                  <PlusCircle size={14} className="text-[#BC9B6B]" />
                </div>
                <p className="text-[11px] text-[#526c50]">
                  Tự động thiết lập thời gian và điểm chuẩn theo Blueprint HSK 3.0.
                </p>
                <span className="text-[10px] font-bold text-[#204434] block">Tạo Khung Đề Ngay →</span>
              </button>
            </div>
          </div>

          {/* Card Nhập Đề Thi Từ File JSON */}
          <div className="p-6 rounded-3xl bg-white border border-[#BC9B6B]/30 space-y-4 shadow-xs">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#163325] flex items-center gap-2">
                <Upload size={18} className="text-[#BC9B6B]" />
                <span>Nhập Đề Thi Khảo Thí Từ File JSON</span>
              </h3>
              <p className="text-xs text-[#526c50] mt-0.5">
                Chọn file JSON từ máy tính hoặc dán mã JSON đề thi vào ô bên dưới để nạp thẳng vào CSDL.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-dashed border-[#BC9B6B]/40 text-center space-y-2">
              <Upload size={24} className="text-[#BC9B6B] mx-auto opacity-70" />
              <p className="text-xs font-bold text-[#163325]">Kéo thả file .json đề thi hoặc bấm để chọn tệp</p>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJsonFile}
                className="block mx-auto text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#204434] file:text-white hover:file:bg-[#163325] cursor-pointer"
              />
            </div>

            {/* JSON Error */}
            {jsonImportError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{jsonImportError}</span>
              </div>
            )}

            {/* JSON Import Preview */}
            {jsonImportPreview && (
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>File hợp lệ: {jsonImportPreview.title}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800">
                    HSK {jsonImportPreview.hskLevel} · {jsonImportPreview.questions.length} câu hỏi
                  </span>
                </div>

                <p className="text-xs text-emerald-800 line-clamp-2">
                  {jsonImportPreview.description || "Đề thi sẵn sàng nạp vào hệ thống khảo thí."}
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setJsonImportPreview(null);
                      setJsonImportText("");
                    }}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={savingExam}
                    onClick={handleConfirmImportJson}
                    className="px-4 py-1.5 rounded-xl bg-[#204434] hover:bg-[#163325] text-white text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>{savingExam ? "Đang nạp đề..." : "Xác nhận nạp đề này vào CSDL"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: LỊCH SỬ THÍ SINH & ĐIỂM THI
         ========================================================================= */}
      {activeTab === "attempts" && (
        <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#BC9B6B]/30 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#BC9B6B]/20 pb-3">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#163325] flex items-center gap-2">
                <GraduationCap size={18} className="text-[#BC9B6B]" />
                <span>Lịch Sử Thí Sinh Thi Thử Gần Đây</span>
              </h3>
              <p className="text-xs text-[#526c50] mt-0.5">
                Theo dõi kết quả điểm thi, thời gian nộp bài và nhật ký phòng thi của học viên
              </p>
            </div>
            <span className="text-xs font-bold text-[#8F6D3B]">
              {recentAttempts.length} lượt thi gần nhất
            </span>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#7B8B77]">
              Chưa có lượt thi thử nào được ghi nhận. Học viên có thể vào thi tại{" "}
              <Link href="/s/mock-exam" target="_blank" className="text-[#204434] font-bold underline">
                /s/mock-exam
              </Link>
              .
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#BC9B6B]/20">
              <table className="w-full text-left text-xs text-[#163325]">
                <thead className="bg-[#FAF7F0] text-[#526c50] uppercase text-[10px] font-bold border-b border-[#BC9B6B]/20">
                  <tr>
                    <th className="p-3">Học viên</th>
                    <th className="p-3">Đề thi</th>
                    <th className="p-3 text-center">Cấp độ</th>
                    <th className="p-3 text-center">Trạng thái</th>
                    <th className="p-3 text-center">Điểm số</th>
                    <th className="p-3 text-right">Thời điểm nộp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BC9B6B]/15 bg-white">
                  {recentAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-[#FAF7F0]/50 transition">
                      <td className="p-3 font-semibold">
                        <div>{att.userName}</div>
                        {att.userEmail && <div className="text-[10px] text-stone-400 font-normal">{att.userEmail}</div>}
                      </td>
                      <td className="p-3">{att.paperTitle}</td>
                      <td className="p-3 text-center font-bold">HSK {att.level}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            att.status === "GRADED"
                              ? "bg-emerald-100 text-emerald-800"
                              : att.status === "IN_PROGRESS"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {att.status === "GRADED" ? "Đã chấm điểm" : att.status === "IN_PROGRESS" ? "Đang làm bài" : att.status}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold font-mono">
                        {att.score !== null ? `${att.score} / ${att.maxScore}` : "--"}
                      </td>
                      <td className="p-3 text-right text-stone-500">
                        {att.submittedAt ? new Date(att.submittedAt).toLocaleString("vi-VN") : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
