"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import CloudinaryUpload from "@/components/common/CloudinaryUploadButton";
import {
  Award,
  PlusCircle,
  Sparkles,
  BookOpen,
  Clock,
  CheckCircle2,
  Trash2,
  Eye,
  GraduationCap,
  Layers,
  ArrowRight,
  ExternalLink,
  Users,
  Search,
  Upload,
  Download,
  FileText,
  X,
  AlertCircle,
  Music,
  Headphones,
  Copy,
  Check,
} from "lucide-react";

interface TeacherMockExamsWorkspaceProps {
  currentUser?: any;
  onNavigateToAssignments?: (payload?: any) => void;
  showToast?: (msg: string) => void;
}

export default function TeacherMockExamsWorkspace({
  currentUser,
  onNavigateToAssignments,
  showToast,
}: TeacherMockExamsWorkspaceProps) {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // State hỗ trợ Thầy/Cô tự Upload đề thi riêng (.JSON)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedExamPreview, setUploadedExamPreview] = useState<any | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // State Modal Upload Audio bài nghe Cloudinary CDN (hsk_mock_exams)
  const [showAudioUploadModal, setShowAudioUploadModal] = useState(false);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState("");
  const [copiedAudioUrl, setCopiedAudioUrl] = useState(false);

  const fetchExams = useCallback(async (level: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/mock-exams?level=${level}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.officialMockExams)) {
        setExams(data.officialMockExams);
      } else {
        setExams([]);
      }
    } catch (e) {
      console.warn("fetchExams error:", e);
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams(selectedLevel);
  }, [selectedLevel, fetchExams]);

  // 1. TẢI VỀ FILE TEMPLATE ĐỀ THI HSK CHUẨN CỦA GIÁO VIÊN (.JSON)
  const handleDownloadExamTemplate = () => {
    const sampleTemplate = {
      title: `Đề thi thử HSK ${selectedLevel} Chuẩn Quốc Tế - Đề của Thầy/Cô`,
      description: `Đề thi thử mô phỏng do Thầy/Cô tự biên soạn gồm đầy đủ 3 kỹ năng Nghe hiểu, Đọc hiểu và Viết.`,
      hskLevel: selectedLevel,
      totalScore: selectedLevel <= 2 ? 200 : 300,
      durationMin: selectedLevel === 1 ? 35 : selectedLevel === 2 ? 50 : selectedLevel === 3 ? 85 : selectedLevel === 4 ? 100 : 120,
      instructions: "Thầy/Cô có thể chỉnh sửa các câu hỏi trong mảng 'questions'. Mỗi câu hỏi gồm: content (đề bài), pinyinPrompt (chữ Hán/phiên âm/audioUrl), options (danh sách lựa chọn), correctAnswer (đáp án đúng), explanation (giải thích chi tiết), skill (LISTENING | READING | WRITING).",
      questions: [
        {
          skill: "LISTENING",
          content: "Nghe đoạn phát âm và chọn nghĩa tiếng Việt chính xác nhất:",
          pinyinPrompt: "Nǐ hǎo",
          options: ["Xin chào", "Cảm ơn", "Tạm biệt", "Không có chi"],
          correctAnswer: "Xin chào",
          explanation: "'你好' (Nǐ hǎo) là lời chào hỏi thông dụng nhất trong tiếng Hán, có nghĩa là Xin chào."
        },
        {
          skill: "LISTENING",
          content: "Nghe câu nói sau và chọn bức tranh/ý nghĩa phù hợp:",
          pinyinPrompt: "Wǒ ài hē chá",
          options: ["Tôi thích uống trà", "Tôi thích ăn cơm", "Tôi đi mua sách", "Tôi là học sinh"],
          correctAnswer: "Tôi thích uống trà",
          explanation: "'我爱喝茶' (Wǒ ài hē chá) nghĩa là Tôi thích uống trà."
        },
        {
          skill: "READING",
          content: "Chọn phiên âm Pinyin chuẩn cho chữ Hán: '谢谢'",
          pinyinPrompt: "谢谢",
          options: ["xièxie", "nǐhǎo", "zàijiàn", "duìbuqǐ"],
          correctAnswer: "xièxie",
          explanation: "Chữ '谢谢' có phiên âm chuẩn là 'xièxie', nghĩa là cảm ơn."
        },
        {
          skill: "READING",
          content: "Điền từ thích hợp vào câu: '他是我的____。'",
          pinyinPrompt: "Tā shì wǒ de ____.",
          options: ["老师", "吗", "很", "什么"],
          correctAnswer: "老师",
          explanation: "'老师' (lǎoshī) là danh từ chỉ người (thầy giáo), phù hợp với đại từ sở hữu '我的' (của tôi)."
        },
        {
          skill: "WRITING",
          content: "Chọn câu có cấu trúc ngữ pháp đúng trật tự nhất:",
          pinyinPrompt: "王老师 / 您好 / ！",
          options: [
            "王老师，您好！",
            "好王老师！",
            "王老师，你好们！",
            "您好王老师是！"
          ],
          correctAnswer: "王老师，您好！",
          explanation: "Quy tắc xưng hô lịch sự với giáo viên: Danh xưng + 您好！"
        }
      ]
    };

    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleTemplate, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `HSK${selectedLevel}_Mock_Exam_Template.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (showToast) showToast(`Đã tải file template đề thi HSK ${selectedLevel} (.JSON)`);
  };

  // 2. KÍCH HOẠT CHỌN FILE ĐỀ THI
  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // 3. ĐỌC FILE JSON ĐỀ THI DO GIÁO VIÊN TẢI LÊN
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
          setUploadError("File JSON không hợp lệ hoặc không có danh sách câu hỏi trong trường 'questions'. Thầy/Cô vui lòng tải template mẫu để xem định dạng chuẩn nhé!");
          return;
        }

        // Đếm kỹ năng
        const listening = parsed.questions.filter((q: any) => q.skill === "LISTENING").length;
        const reading = parsed.questions.filter((q: any) => q.skill === "READING").length;
        const writing = parsed.questions.filter((q: any) => q.skill === "WRITING").length;

        setUploadedExamPreview({
          ...parsed,
          hskLevel: parsed.hskLevel || selectedLevel,
          title: parsed.title || `Đề thi thử HSK ${parsed.hskLevel || selectedLevel} do Thầy/Cô biên soạn`,
          description: parsed.description || "Đề thi thử do Giáo viên biên soạn theo chuẩn HSK 3.0.",
          skillsCount: { listening, reading, writing },
          fileName: file.name,
        });
      } catch (err: any) {
        setUploadError("Lỗi đọc file: File không đúng định dạng JSON chuẩn. Chi tiết: " + (err?.message || ""));
      }
    };
    reader.readAsText(file);
  };

  // 4. XÁC NHẬN XUẤT BẢN ĐỀ THI ĐÃ UPLOAD
  const handleConfirmPublishUploadedExam = async () => {
    if (!uploadedExamPreview) return;
    setIsPublishing(true);
    setUploadError(null);

    try {
      const res = await fetch("/api/v1/mock-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadedExamPreview.title,
          description: uploadedExamPreview.description,
          hskLevel: uploadedExamPreview.hskLevel || selectedLevel,
          totalScore: uploadedExamPreview.totalScore || (selectedLevel <= 2 ? 200 : 300),
          teacherId: currentUser?.id || "",
          autoGenerate: false,
          questions: uploadedExamPreview.questions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPublishSuccessMsg(
          `🎉 Đã xuất bản thành công Đề thi '${uploadedExamPreview.title}' (${uploadedExamPreview.questions.length} câu) vào Phòng thi thử HSK cho học sinh!`
        );
        if (showToast) showToast("Xuất bản đề thi của Thầy/Cô thành công!");
        setUploadedExamPreview(null);
        await fetchExams(selectedLevel);
        setTimeout(() => setPublishSuccessMsg(null), 6000);
      } else {
        setUploadError(data.error || "Không thể xuất bản đề thi");
      }
    } catch (e: any) {
      setUploadError("Lỗi kết nối máy chủ khi xuất bản đề thi: " + (e?.message || ""));
    } finally {
      setIsPublishing(false);
    }
  };

  // 5. TỰ ĐỘNG XUẤT BẢN ĐỀ THI MẪU (TÙY CHỌN DỰ PHÒNG)
  const handlePublishNewMockExam = async () => {
    setIsPublishing(true);
    setPublishSuccessMsg(null);
    try {
      const res = await fetch("/api/v1/mock-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hskLevel: selectedLevel,
          title: `Đề thi thử HSK ${selectedLevel} Chuẩn Quốc Tế - Đề số 0${exams.length + 1}`,
          description: `Đề thi thử chính thức do Thầy/Cô biên soạn theo chuẩn Hanban CTI HSK 3.0, phân bổ kỹ năng Nghe hiểu, Đọc hiểu và Viết.`,
          autoGenerate: true,
          teacherId: currentUser?.id || "",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPublishSuccessMsg(
          `🎉 Đã xuất bản thành công Đề thi thử HSK ${selectedLevel} mới vào Phòng thi thử cho học sinh!`
        );
        if (showToast) showToast("Đã xuất bản đề thi thử HSK thành công.");
        await fetchExams(selectedLevel);
        setTimeout(() => setPublishSuccessMsg(null), 5000);
      } else {
        alert(data.error || "Không thể xuất bản đề thi");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối khi xuất bản đề thi");
    } finally {
      setIsPublishing(false);
    }
  };

  // Xóa đề thi thử
  const handleDeleteExam = async (examId: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đề thi "${title}" khỏi hệ thống?`)) return;
    try {
      const res = await fetch(`/api/v1/exams/${examId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast("Đã xóa đề thi khỏi hệ thống.");
        setExams((prev) => prev.filter((e) => e.id !== examId));
      } else {
        alert(data.message || "Không thể xóa đề thi này.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Ẩn input file để cô giáo chọn file đề thi */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#204434] flex items-center gap-2">
            <Award className="w-7 h-7 text-[#BC9B6B]" />
            <span>Quản lý Đề Thi Thử Mô Phỏng HSK</span>
          </h1>
          <p className="text-xs text-[#315E48] mt-1">
            Thầy/Cô có thể tải template, upload đề thi riêng của mình (.JSON) hoặc xuất bản bộ đề thi HSK chuẩn 3 kỹ năng cho học sinh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/s/mock-exam"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-[#204434]/40 hover:bg-[#FAF7F0] text-[#204434] shadow-2xs text-xs font-bold transition cursor-pointer"
            title="Mở giao diện phòng thi thử thực tế của học sinh"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#BC9B6B]" />
            <span>Phòng thi học sinh</span>
          </Link>

          {/* Nút 1: Tải template đề thi JSON */}
          <button
            onClick={handleDownloadExamTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 shadow-2xs text-xs font-bold transition cursor-pointer"
            title="Tải file JSON mẫu cấu trúc đề thi HSK chuẩn"
          >
            <Download className="w-3.5 h-3.5 text-amber-700" />
            <span>📥 Template đề thi (.JSON)</span>
          </button>

          {/* Nút 2: Tải lên đề thi của Thầy/Cô */}
          <button
            onClick={handleTriggerFileInput}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#BC9B6B] hover:bg-[#a88755] text-white shadow-xs text-xs font-bold transition cursor-pointer"
            title="Tải file JSON đề thi của Thầy/Cô lên hệ thống"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>📤 Upload đề thi của Cô (.JSON)</span>
          </button>

          {/* Nút 2.5: Upload Audio bài nghe lên Cloudinary CDN */}
          <button
            onClick={() => setShowAudioUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 shadow-2xs text-xs font-bold transition cursor-pointer"
            title="Tải file nghe MP3 lên Cloudinary CDN để lấy link dán vào đề thi nghe"
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-700" />
            <span>🎧 Upload Audio đề thi</span>
          </button>

          {/* Nút 3: Tự động sinh đề */}
          <button
            onClick={handlePublishNewMockExam}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white shadow-md text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#BC9B6B]" />
            <span>
              {isPublishing
                ? "Đang xử lý..."
                : `+ Tạo đề HSK ${selectedLevel} tự động`}
            </span>
          </button>
        </div>
      </div>

      {publishSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{publishSuccessMsg}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-rose-700 hover:text-rose-900 text-xs underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* MODAL XEM TRƯỚC ĐỀ THI DO GIÁO VIÊN VỪA UPLOAD */}
      {uploadedExamPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E5DEC9] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#FAF7F0] to-[#F4EFE6] border-b border-[#E5DEC9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#204434] text-white flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5 text-[#BC9B6B]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#204434]">
                    Xác nhận đề thi của Thầy/Cô vừa tải lên
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    File: {uploadedExamPreview.fileName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUploadedExamPreview(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Thông số chính */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9]">
                  <span className="text-[10px] text-slate-500 block">Cấp độ HSK</span>
                  <strong className="text-sm text-[#204434]">HSK {uploadedExamPreview.hskLevel}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9]">
                  <span className="text-[10px] text-slate-500 block">Tổng số câu</span>
                  <strong className="text-sm text-[#204434]">{uploadedExamPreview.questions.length} câu</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9]">
                  <span className="text-[10px] text-slate-500 block">Thời gian thi</span>
                  <strong className="text-sm text-[#204434]">{uploadedExamPreview.durationMin || 35} phút</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9]">
                  <span className="text-[10px] text-slate-500 block">Tổng thang điểm</span>
                  <strong className="text-sm text-[#204434]">{uploadedExamPreview.totalScore || 200} điểm</strong>
                </div>
              </div>

              {/* Thông tin đề */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1.5">
                <span className="font-bold text-[#204434] block text-sm">
                  {uploadedExamPreview.title}
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {uploadedExamPreview.description}
                </p>
                <div className="pt-2 flex items-center gap-3 text-[11px] font-semibold text-[#8F6D3B]">
                  <span>🎧 Nghe: <strong>{uploadedExamPreview.skillsCount?.listening || 0} câu</strong></span>
                  <span>📖 Đọc: <strong>{uploadedExamPreview.skillsCount?.reading || 0} câu</strong></span>
                  <span>✍️ Viết: <strong>{uploadedExamPreview.skillsCount?.writing || 0} câu</strong></span>
                </div>
              </div>

              {/* Xem trước một số câu hỏi mẫu */}
              <div className="space-y-2">
                <span className="font-bold text-[#204434] block">
                  Xem trước các câu hỏi đầu tiên:
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {uploadedExamPreview.questions.slice(0, 4).map((q: any, qi: number) => (
                    <div
                      key={qi}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#204434]">
                          Câu {qi + 1} ({q.skill || "READING"})
                        </span>
                        <span className="text-emerald-700 font-bold font-mono">
                          Đáp án: {q.correctAnswer}
                        </span>
                      </div>
                      <p className="text-[#204434] font-medium">
                        {q.content} {q.pinyinPrompt ? `(${q.pinyinPrompt})` : ""}
                      </p>
                      {Array.isArray(q.options) && (
                        <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-slate-600">
                          {q.options.map((opt: string, oi: number) => (
                            <span key={oi} className="px-2 py-0.5 rounded bg-white border border-slate-200">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {uploadedExamPreview.questions.length > 4 && (
                    <p className="text-[11px] text-center text-slate-400 italic py-1">
                      ... và {uploadedExamPreview.questions.length - 4} câu hỏi khác
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF7F0] border-t border-[#E5DEC9] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setUploadedExamPreview(null)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] bg-white text-slate-600 text-xs font-bold hover:bg-[#FAF7F0] transition cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmPublishUploadedExam}
                disabled={isPublishing}
                className="px-6 py-2.5 rounded-xl bg-[#204434] hover:bg-[#17382F] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-[#BC9B6B]" />
                <span>
                  {isPublishing
                    ? "Đang xuất bản vào phòng thi..."
                    : "🚀 Xác nhận & Xuất bản vào Phòng thi ảo"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UPLOAD AUDIO BÀI NGHE LÊN CLOUDINARY CDN (HSK_MOCK_EXAMS) */}
      {showAudioUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E5DEC9] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-[#FAF7F0] to-[#F4EFE6] border-b border-[#E5DEC9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#204434] text-white flex items-center justify-center font-bold">
                  <Headphones className="w-5 h-5 text-[#BC9B6B]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#204434]">
                    Tải Audio Bài Nghe Đề Thi HSK
                  </h3>
                  <p className="text-xs text-[#6B766D]">
                    Lưu trữ trên Đám mây Cloudinary CDN (thư mục hsk_mock_exams)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAudioUploadModal(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/30 space-y-3">
                <label className="block font-bold text-[#204434]">
                  Chọn file âm thanh đề thi (.mp3, .wav, .m4a):
                </label>
                <CloudinaryUpload
                  value={uploadedAudioUrl}
                  onChange={(url) => setUploadedAudioUrl(url)}
                  folder="hsk_mock_exams"
                  accept="audio/*"
                  placeholder="Kéo thả hoặc nhấp để tải file nghe đề thi lên..."
                  showPreview={true}
                />
              </div>

              {uploadedAudioUrl && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Đã tải lên Cloudinary thành công!</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(uploadedAudioUrl);
                        setCopiedAudioUrl(true);
                        setTimeout(() => setCopiedAudioUrl(false), 2000);
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-2xs"
                    >
                      {copiedAudioUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAudioUrl ? "Đã sao chép" : "Sao chép link"}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={uploadedAudioUrl}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-[11px] font-mono text-emerald-900 outline-hidden select-all"
                  />
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    💡 <strong>Hướng dẫn:</strong> Thầy/Cô sao chép đường dẫn này và dán vào trường <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold text-[#204434]">pinyinPrompt</code> hoặc <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold text-[#204434]">audioUrl</code> của câu hỏi dạng Nghe hiểu (LISTENING) trong file JSON đề thi.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#FAF7F0] border-t border-[#E5DEC9] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowAudioUploadModal(false)}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cấp độ HSK Tabs */}
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#8F6D3B]" />
            <span className="text-xs font-bold text-[#204434]">Chọn cấp độ HSK cần quản lý đề:</span>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm tên đề thi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white rounded-xl border border-[#E5DEC9] text-xs focus:outline-none focus:border-[#204434]"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`py-2 rounded-2xl border text-center font-bold text-xs transition cursor-pointer ${
                selectedLevel === lvl
                  ? "bg-[#204434] text-white border-[#204434] shadow-xs scale-105"
                  : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#FAF7F0]"
              }`}
            >
              HSK {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách đề thi */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-[#204434] flex items-center gap-2">
            <span>Danh sách đề thi HSK {selectedLevel} đang mở</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-mono font-bold">
              {filteredExams.length} bộ đề
            </span>
          </h2>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerFileInput}
              className="text-xs font-bold text-[#8F6D3B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload đề thi của Thầy/Cô</span>
            </button>
            <button
              onClick={handlePublishNewMockExam}
              disabled={isPublishing}
              className="text-xs font-bold text-[#204434] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>+ Tạo thêm đề thi tự động</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 bg-white rounded-3xl border border-[#E5DEC9]">
            <div className="animate-spin text-3xl mb-2">⏳</div>
            <p className="text-xs font-medium">Đang tải danh sách đề thi HSK {selectedLevel}...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#E5DEC9] p-8 space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="text-5xl">📄</div>
            <h3 className="text-base font-bold text-[#204434]">
              Chưa có đề thi mô phỏng nào cho HSK {selectedLevel}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thầy/Cô có thể tải lên đề thi riêng (.JSON) do mình soạn hoặc bấm tạo đề tự động để xuất bản vào Phòng thi cho học sinh nhé!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleTriggerFileInput}
                className="px-5 py-2.5 bg-[#BC9B6B] hover:bg-[#a88755] text-white rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload đề thi của Thầy/Cô (.JSON)</span>
              </button>
              <button
                onClick={handlePublishNewMockExam}
                disabled={isPublishing}
                className="px-5 py-2.5 bg-[#204434] hover:bg-[#183629] text-white rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                {isPublishing ? "Đang tạo..." : `+ Tạo đề HSK ${selectedLevel} tự động`}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-3xl border border-[#E5DEC9] hover:border-[#BC9B6B] p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B]">
                      HSK {exam.hskLevel} · {exam.durationMin} phút
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Người tạo: <strong>{exam.teacherName}</strong>
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#204434] line-clamp-1">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {exam.description || "Đề thi thử HSK chuẩn hóa quốc tế."}
                  </p>
                </div>

                {/* Question breakdown stats */}
                <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9]/80 text-[11px] flex items-center justify-between text-[#315E48]">
                  <span>Tổng: <strong>{exam.questionsCount || 25} câu</strong></span>
                  <span>🎧 {exam.skillsCount?.listening || 0} nghe</span>
                  <span>📖 {exam.skillsCount?.reading || 0} đọc</span>
                  <span>✍️ {exam.skillsCount?.writing || 0} viết</span>
                </div>

                {/* Action buttons */}
                <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between gap-2 text-xs">
                  <Link
                    href={`/s/mock-exam`}
                    target="_blank"
                    className="flex-1 py-2 text-center rounded-xl bg-slate-50 hover:bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434] font-bold transition flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Làm thử</span>
                  </Link>

                  {onNavigateToAssignments && (
                    <button
                      onClick={() => onNavigateToAssignments({ examId: exam.id, title: exam.title })}
                      className="flex-1 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Giao đề này cho lớp học"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Giao lớp</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteExam(exam.id, exam.title)}
                    className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition cursor-pointer"
                    title="Xóa đề thi này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
