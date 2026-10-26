"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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

  const fetchExams = useCallback(async (level: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/mock-exams?level=${level}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.officialExams)) {
        setExams(data.officialExams);
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

  // Xuất bản đề thi thử HSK mới tự động từ Ngữ liệu chuẩn HSK 3.0
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#204434] flex items-center gap-2">
            <Award className="w-7 h-7 text-[#BC9B6B]" />
            <span>Quản lý Đề Thi Thử Mô Phỏng HSK</span>
          </h1>
          <p className="text-xs text-[#315E48] mt-1">
            Biên soạn, xuất bản và cập nhật các bộ đề thi thử HSK 3.0 (Cấp 1 - 9) cho toàn trường hoặc từng lớp học.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/s/mock-exam"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-[#204434]/40 hover:bg-[#FAF7F0] text-[#204434] shadow-2xs text-xs font-bold transition cursor-pointer"
            title="Mở giao diện phòng thi thử thực tế của học sinh"
          >
            <ExternalLink className="w-4 h-4 text-[#BC9B6B]" />
            <span>Phòng thi học sinh</span>
          </Link>

          <button
            onClick={handlePublishNewMockExam}
            disabled={isPublishing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white shadow-md text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4 text-[#BC9B6B]" />
            <span>
              {isPublishing
                ? "Đang xuất bản đề thi..."
                : `+ Xuất bản đề thi HSK ${selectedLevel} mới`}
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

          <button
            onClick={handlePublishNewMockExam}
            disabled={isPublishing}
            className="text-xs font-bold text-[#204434] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>+ Tạo thêm đề thi tự động</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
              Thầy/Cô hãy bấm nút bên dưới để hệ thống tự động tổng hợp câu hỏi chuẩn 3 kỹ năng Nghe - Đọc - Viết và xuất bản ngay một đề thi mới cho học sinh làm nhé!
            </p>
            <button
              onClick={handlePublishNewMockExam}
              disabled={isPublishing}
              className="px-6 py-2.5 bg-[#204434] hover:bg-[#183629] text-white rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              {isPublishing ? "Đang tạo..." : `+ Xuất bản ngay đề thi HSK ${selectedLevel} đầu tiên`}
            </button>
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
                  <span>🎧 {exam.skillsCount?.listening || 10} nghe</span>
                  <span>📖 {exam.skillsCount?.reading || 10} đọc</span>
                  <span>✍️ {exam.skillsCount?.writing || 5} viết</span>
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
