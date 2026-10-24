import React, { useState } from "react";
import { X, Award, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { StudentSubmissionItem } from "./types";

interface GradingModalProps {
  submission: StudentSubmissionItem | null;
  onClose: () => void;
  onSaveGrading: (submissionId: string, score: number, feedback: string) => Promise<void> | void;
}

export default function GradingModal({
  submission,
  onClose,
  onSaveGrading,
}: GradingModalProps) {
  const [score, setScore] = useState<number>(
    submission?.score !== null && submission?.score !== undefined ? submission.score : 0
  );
  const [feedback, setFeedback] = useState<string>(submission?.feedback || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!submission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveGrading(submission.id, Number(score), feedback);
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
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#204434]">Chấm bài kiểm tra</h3>
              <p className="text-xs text-[#315E48]/70">
                Học sinh: <span className="font-bold text-[#204434]">{submission.studentName}</span> ({submission.className})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div className="p-3 rounded-2xl bg-white border border-[#E5DEC9] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#315E48]/70">Bài kiểm tra:</span>
              <span className="font-bold text-[#204434]">{submission.assignmentTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#315E48]/70">Thời điểm nộp:</span>
              <span className="text-[#204434]">
                {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString("vi-VN") : "Hôm nay"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#315E48]/70">Lần làm thứ:</span>
              <span className="text-[#204434]">{submission.attemptNumber || 1}</span>
            </div>
          </div>

          {/* Điểm số */}
          <div className="space-y-1">
            <label className="font-bold text-[#204434] block">Điểm số tổng kết (Thang điểm {submission.maxScore || 100})</label>
            <input
              type="number"
              min={0}
              max={submission.maxScore || 100}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              required
              className="w-full px-3 py-2 text-base font-bold text-[#204434] bg-white border border-[#E5DEC9] rounded-xl focus:outline-none focus:border-[#204434]"
            />
          </div>

          {/* Nhận xét giáo viên */}
          <div className="space-y-1">
            <label className="font-bold text-[#204434] block flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#BC9B6B]" />
              Lời nhận xét & Góp ý cho học sinh
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="VD: Em phát âm tốt, nhớ chú ý thanh 3 và thứ tự nét viết chữ Hán..."
              className="w-full px-3 py-2 bg-white border border-[#E5DEC9] rounded-xl text-[#204434] focus:outline-none focus:border-[#204434]"
            />
          </div>

          {/* Buttons */}
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
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#204434] hover:bg-[#163024] text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isSubmitting ? "Đang lưu..." : "Lưu & Công bố điểm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
