import React, { useState } from "react";
import { X, Send, Calendar, Clock, Layers, AlertCircle } from "lucide-react";
import { ClassOption, ExamPackageItem } from "./types";

interface AssignExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  classesList: ClassOption[];
  examPackages: ExamPackageItem[];
  preselectedClassId?: string;
  preselectedExamId?: string;
  onConfirmAssign: (values: {
    examId: string;
    classId: string;
    title: string;
    openDate: string;
    dueDate: string;
    durationMin: number;
    maxAttempts: number;
    scorePolicy: "AFTER_SUBMIT" | "AFTER_PUBLISH" | "NEVER";
    allowLate: boolean;
  }) => Promise<void> | void;
}

export default function AssignExamModal({
  isOpen,
  onClose,
  classesList,
  examPackages,
  preselectedClassId,
  preselectedExamId,
  onConfirmAssign,
}: AssignExamModalProps) {
  const readyExamPackages = examPackages.filter((p) => p.status === "READY");
  const draftExamPackages = examPackages.filter((p) => p.status === "DRAFT");

  const [selectedClassId, setSelectedClassId] = useState(
    preselectedClassId || classesList[0]?.id || ""
  );
  const [selectedExamId, setSelectedExamId] = useState(
    preselectedExamId || readyExamPackages[0]?.id || ""
  );

  React.useEffect(() => {
    if (preselectedExamId) {
      setSelectedExamId(preselectedExamId);
    } else if (readyExamPackages.length > 0 && !selectedExamId) {
      setSelectedExamId(readyExamPackages[0].id);
    }
  }, [preselectedExamId, readyExamPackages]);
  const [customTitle, setCustomTitle] = useState("");
  const [openDate, setOpenDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [durationMin, setDurationMin] = useState(45);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [scorePolicy, setScorePolicy] = useState<"AFTER_SUBMIT" | "AFTER_PUBLISH" | "NEVER">("AFTER_PUBLISH");
  const [allowLate, setAllowLate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentExam = examPackages.find((p) => p.id === selectedExamId) || examPackages[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      alert("Vui lòng chọn lớp học áp dụng.");
      return;
    }
    const finalTitle = customTitle.trim() || currentExam?.title || "Bài kiểm tra";
    setIsSubmitting(true);
    try {
      await onConfirmAssign({
        examId: selectedExamId,
        classId: selectedClassId,
        title: finalTitle,
        openDate,
        dueDate,
        durationMin,
        maxAttempts,
        scorePolicy,
        allowLate,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#204434] text-white flex items-center justify-center shadow-xs">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#204434]">Giao bài cho lớp học</h3>
              <p className="text-xs text-[#315E48]/70">Thiết lập thời hạn và phân phối đề thi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          {/* Cảnh báo nếu chưa có đề hoàn thiện */}
          {readyExamPackages.length === 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Chưa có đề thi nào ở trạng thái Hoàn thiện</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Bạn hiện có <strong>{draftExamPackages.length} đề nháp</strong>. Theo quy trình, câu hỏi thêm vào đề sẽ nằm trong <em>Đề nháp kho</em>. Bạn vui lòng vào tab <strong>&quot;Đề nháp kho&quot;</strong> và bấm <strong>&quot;Hoàn thiện đề&quot;</strong> trước khi giao cho học sinh.
              </p>
            </div>
          )}

          {/* 1. Chọn Đề thi */}
          <div className="space-y-1">
            <label className="font-bold text-[#204434] block">Đề thi đã hoàn thiện trong kho</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E5DEC9] rounded-xl text-[#204434] focus:outline-none focus:border-[#204434]"
            >
              {readyExamPackages.length > 0 ? (
                readyExamPackages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (HSK {p.hskLevel} • {p.questionCount || p.questions?.length || 0} câu • {p.totalPoints || 100}đ)
                  </option>
                ))
              ) : (
                <option value="">(Chưa có đề hoàn thiện - vui lòng hoàn thiện đề nháp trước)</option>
              )}
            </select>
          </div>

          {/* 2. Tiêu đề hiển thị cho học sinh */}
          <div className="space-y-1">
            <label className="font-bold text-[#204434] block">
              Tiêu đề bài giao (Tùy chọn)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={currentExam?.title || "Nhập tên bài tập..."}
              className="w-full px-3 py-2 bg-white border border-[#E5DEC9] rounded-xl text-[#204434] focus:outline-none focus:border-[#204434]"
            />
          </div>

          {/* 3. Chọn Lớp áp dụng */}
          <div className="space-y-1">
            <label className="font-bold text-[#204434] block">Lớp áp dụng</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E5DEC9] rounded-xl text-[#204434] focus:outline-none focus:border-[#204434]"
            >
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.code ? `(${c.code})` : ""} - {c.studentCount || 0} học sinh
                </option>
              ))}
            </select>
          </div>

          {/* 4. Thời gian mở & Hạn nộp */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#204434] block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#BC9B6B]" />
                Ngày mở đề
              </label>
              <input
                type="date"
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#E5DEC9] rounded-xl text-[#204434]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[#204434] block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#BC9B6B]" />
                Hạn chót nộp bài
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#E5DEC9] rounded-xl text-[#204434]"
              />
            </div>
          </div>

          {/* 5. Thời lượng & Số lần làm */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#204434] block flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#BC9B6B]" />
                Thời lượng (phút)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-[#E5DEC9] rounded-xl text-[#204434]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[#204434] block">Số lần làm tối đa</label>
              <select
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-[#E5DEC9] rounded-xl text-[#204434]"
              >
                <option value={1}>1 lần duy nhất</option>
                <option value={2}>2 lần</option>
                <option value={3}>3 lần</option>
                <option value={999}>Không giới hạn</option>
              </select>
            </div>
          </div>

          {/* 6. Chính sách xem điểm */}
          <div className="space-y-1">
            <label className="font-bold text-[#204434] block">Công bố điểm số</label>
            <select
              value={scorePolicy}
              onChange={(e) => setScorePolicy(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-white border border-[#E5DEC9] rounded-xl text-[#204434]"
            >
              <option value="AFTER_PUBLISH">Sau khi giáo viên chấm & công bố</option>
              <option value="AFTER_SUBMIT">Hiển thị ngay sau khi học sinh nộp</option>
              <option value="NEVER">Không công bố điểm</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5DEC9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E5DEC9] text-[#315E48] rounded-xl font-medium hover:bg-[#F3EFE6] transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedExamId || readyExamPackages.length === 0}
              className="px-5 py-2 bg-[#204434] hover:bg-[#163024] text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "Đang giao..." : "Xác nhận giao bài"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
