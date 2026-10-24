"use client";

import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Send,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Edit3,
  Undo2,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { ExamPackageItem } from "./types";

interface ExamPackagesTableProps {
  mode: "DRAFT" | "READY";
  examPackages: ExamPackageItem[];
  searchQuery: string;
  onFinalizeExam: (pkg: ExamPackageItem) => Promise<void> | void;
  onRevertToDraft: (pkg: ExamPackageItem) => Promise<void> | void;
  onDeleteExam: (pkg: ExamPackageItem) => Promise<void> | void;
  onAssignExamToClass: (pkg: ExamPackageItem) => void;
  onNavigateToQuestionBank?: () => void;
  onSwitchToDraftTab?: () => void;
}

export default function ExamPackagesTable({
  mode,
  examPackages,
  searchQuery,
  onFinalizeExam,
  onRevertToDraft,
  onDeleteExam,
  onAssignExamToClass,
  onNavigateToQuestionBank,
  onSwitchToDraftTab,
}: ExamPackagesTableProps) {
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  // Filter by mode and search query
  const filteredList = examPackages
    .filter((pkg) => (mode === "DRAFT" ? pkg.status === "DRAFT" : pkg.status === "READY"))
    .filter((pkg) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        pkg.title.toLowerCase().includes(q) ||
        (pkg.description && pkg.description.toLowerCase().includes(q))
      );
    });

  const toggleExpand = (id: string) => {
    setExpandedExamId((prev) => (prev === id ? null : id));
  };

  const handleFinalize = async (pkg: ExamPackageItem) => {
    setLoadingActionId(pkg.id);
    try {
      await onFinalizeExam(pkg);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleRevert = async (pkg: ExamPackageItem) => {
    setLoadingActionId(pkg.id);
    try {
      await onRevertToDraft(pkg);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleDelete = async (pkg: ExamPackageItem) => {
    setLoadingActionId(pkg.id);
    try {
      await onDeleteExam(pkg);
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Workflow Guidance Banner */}
      {mode === "DRAFT" ? (
        <div className="p-4 rounded-2xl bg-[#FFF9E6] border border-[#E5DEC9] flex items-start gap-3 text-xs text-[#6B5620]">
          <AlertCircle className="w-5 h-5 text-[#BC9B6B] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#204434] text-sm block">
              Quy trình biên soạn: Đề nháp trong kho
            </span>
            <p className="leading-relaxed">
              Các câu hỏi thêm từ Ngân hàng câu hỏi sẽ được tập hợp vào <strong>Đề nháp kho</strong> để bạn kiểm tra, điều chỉnh số điểm và thứ tự. Sau khi hoàn tất, hãy bấm <strong>&quot;Hoàn thiện đề&quot;</strong> để chuyển chính thức sang <strong>Đề hoàn thiện</strong> trước khi giao cho học sinh làm bài.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-3 text-xs text-[#166534]">
          <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#14532D] text-sm block">
              Đề thi đã hoàn thiện (Sẵn sàng giao cho lớp)
            </span>
            <p className="leading-relaxed">
              Toàn bộ đề thi trong mục này đã đạt tiêu chuẩn và sẵn sàng phân phối. Bấm <strong>&quot;Giao bài cho lớp&quot;</strong> để cài đặt hạn nộp, thời gian thi và gửi tới học sinh.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredList.length === 0 && (
        <div className="py-14 text-center rounded-3xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-center text-[#BC9B6B]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="font-serif font-bold text-base text-[#204434]">
            {mode === "DRAFT" ? "Chưa có đề nháp nào trong kho" : "Chưa có đề hoàn thiện nào"}
          </h4>
          <p className="text-xs text-[#315E48]/80 max-w-md mx-auto">
            {mode === "DRAFT"
              ? "Vào Ngân hàng câu hỏi, chọn các câu hỏi phù hợp và bấm \"Thêm vào đề nháp\" để bắt đầu tạo đề mới."
              : "Hãy kiểm tra các đề trong mục Đề nháp kho và bấm \"Hoàn thiện đề\" để đề xuất hiện tại đây."}
          </p>
          <div className="pt-2">
            {mode === "DRAFT" ? (
              onNavigateToQuestionBank && (
                <button
                  type="button"
                  onClick={onNavigateToQuestionBank}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#163024] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <span>Mở Ngân hàng câu hỏi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )
            ) : (
              onSwitchToDraftTab && (
                <button
                  type="button"
                  onClick={onSwitchToDraftTab}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#163024] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <span>Xem Đề nháp kho</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* List of Exam Packages */}
      {filteredList.length > 0 && (
        <div className="space-y-3">
          {filteredList.map((pkg) => {
            const isExpanded = expandedExamId === pkg.id;
            const qCount = pkg.questionCount || pkg.questions?.length || 0;
            const isLoadingThis = loadingActionId === pkg.id;

            return (
              <div
                key={pkg.id}
                className="rounded-2xl bg-white border border-[#E5DEC9] p-4 sm:p-5 shadow-2xs hover:border-[#BC9B6B]/60 transition space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#204434] text-sm sm:text-base">
                        {pkg.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F0] text-[#315E48] border border-[#E5DEC9]">
                        HSK {pkg.hskLevel}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F0] text-[#315E48] border border-[#E5DEC9]">
                        {pkg.curriculum || "HSK 3.0"}
                      </span>
                      {pkg.status === "DRAFT" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Đề nháp kho
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          Đã hoàn thiện
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#315E48]/80 line-clamp-1">
                      {pkg.description || "Bộ đề biên soạn từ Ngân hàng câu hỏi"}
                    </p>
                  </div>

                  {/* Right metadata & Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right hidden sm:block pr-3 border-r border-[#E5DEC9] text-xs">
                      <span className="font-bold text-[#204434] block">
                        {qCount} câu hỏi
                      </span>
                      <span className="text-[10px] text-[#315E48]/80">
                        {pkg.totalPoints || 100} điểm
                      </span>
                    </div>

                    {mode === "DRAFT" ? (
                      <button
                        type="button"
                        disabled={isLoadingThis || qCount === 0}
                        onClick={() => handleFinalize(pkg)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                          qCount === 0
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-[#204434] hover:bg-[#163024] text-white"
                        }`}
                        title={qCount === 0 ? "Đề chưa có câu hỏi nào" : "Chuyển thành Đề hoàn thiện để giao cho lớp"}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
                        <span>Hoàn thiện đề</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isLoadingThis}
                        onClick={() => onAssignExamToClass(pkg)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#163024] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Giao bài cho lớp</span>
                      </button>
                    )}

                    {mode === "READY" && (
                      <button
                        type="button"
                        disabled={isLoadingThis}
                        onClick={() => handleRevert(pkg)}
                        className="p-2 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48] transition cursor-pointer"
                        title="Chuyển về đề nháp để chỉnh sửa thêm"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isLoadingThis}
                      onClick={() => handleDelete(pkg)}
                      className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition cursor-pointer"
                      title="Xóa đề này khỏi kho"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(pkg.id)}
                      className="p-2 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#315E48] transition cursor-pointer"
                      title="Xem danh sách câu hỏi"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile metadata summary */}
                <div className="sm:hidden flex items-center justify-between text-xs pt-1 border-t border-[#E5DEC9]/50 text-[#315E48]">
                  <span>{qCount} câu hỏi • {pkg.totalPoints || 100} điểm</span>
                  <span>Cập nhật: {pkg.updatedAt || "Gần đây"}</span>
                </div>

                {/* Expanded questions list */}
                {isExpanded && (
                  <div className="pt-3 border-t border-[#E5DEC9] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#204434]">
                        Danh sách câu hỏi trong đề ({qCount} câu):
                      </span>
                    </div>

                    {pkg.questions && pkg.questions.length > 0 ? (
                      <div className="divide-y divide-[#E5DEC9]/60 border border-[#E5DEC9] rounded-xl overflow-hidden bg-[#FAF7F0]/40 text-xs">
                        {pkg.questions.map((q: any, idx: number) => (
                          <div key={q.id || idx} className="p-3 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-[#204434]">
                                Câu {idx + 1}: {q.content || q.title || "Nội dung câu hỏi"}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-white border border-[#E5DEC9] text-[10px] text-[#315E48] font-bold shrink-0">
                                {q.points || 10}đ
                              </span>
                            </div>
                            {q.pinyinPrompt && (
                              <p className="text-[11px] text-[#8F6D3B]">{q.pinyinPrompt}</p>
                            )}
                            <div className="flex items-center gap-2 text-[10px] text-[#315E48]/80">
                              <span>Dạng: {q.type || "Trắc nghiệm"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-500 bg-[#FAF7F0] rounded-xl">
                        Chưa có câu hỏi nào được gán vào đề này.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
