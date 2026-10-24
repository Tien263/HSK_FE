import React from "react";
import {
  FileCheck2,
  Calendar,
  Clock,
  QrCode,
  Users,
  Eye,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AssignmentItem } from "./types";

interface AssignmentListTableProps {
  assignments: AssignmentItem[];
  onOpenQrModal: (assignment: AssignmentItem) => void;
  onGradeAssignment: (assignment: AssignmentItem) => void;
  onToggleStatus?: (assignment: AssignmentItem) => void;
  onDeleteAssignment?: (assignment: AssignmentItem) => void;
  onAssignExamToClass?: () => void;
}

export default function AssignmentListTable({
  assignments,
  onOpenQrModal,
  onGradeAssignment,
  onToggleStatus,
  onDeleteAssignment,
  onAssignExamToClass,
}: AssignmentListTableProps) {
  if (assignments.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#E5DEC9] space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#F3EFE6] flex items-center justify-center mx-auto text-[#315E48]">
          <FileCheck2 className="w-6 h-6 opacity-60" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#204434]">
            Lớp học hiện chưa có bài tập nào được giao.
          </p>
          <p className="text-xs text-[#315E48]/70 max-w-sm mx-auto">
            Hệ thống không tự động sinh đề mẫu. Bạn có thể chọn đề từ kho và giao cho lớp học bất kỳ lúc nào.
          </p>
        </div>
        {onAssignExamToClass && (
          <button
            onClick={onAssignExamToClass}
            className="px-4 py-2 bg-[#204434] text-white rounded-xl text-xs font-bold hover:bg-[#163024] transition shadow-xs"
          >
            + Giao bài tập ngay
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5DEC9] overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF7F0] border-b border-[#E5DEC9] text-[#315E48] font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Tên bài tập & Đề thi</th>
              <th className="py-3 px-4">Lớp áp dụng</th>
              <th className="py-3 px-4">Thời hạn & Thời lượng</th>
              <th className="py-3 px-4">Tiến độ nộp</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DEC9]/60 text-[#204434]">
            {assignments.map((asg) => {
              const isOpen = asg.status === "OPEN" || asg.status === "ACTIVE";
              const percent =
                asg.totalStudents > 0
                  ? Math.round((asg.submittedCount / asg.totalStudents) * 100)
                  : 0;

              return (
                <tr key={asg.id} className="hover:bg-[#FFFCF6] transition">
                  {/* Tên & Cấp độ */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#204434]">{asg.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E5DEC9] text-[#204434]">
                          HSK {asg.hskLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#315E48]/70">
                        <span>{asg.totalQuestions || 0} câu hỏi</span>
                        <span>•</span>
                        <span>{asg.totalPoints || 100} điểm</span>
                        <span>•</span>
                        <span>Tối đa {asg.maxAttempts || 1} lần làm</span>
                      </div>
                    </div>
                  </td>

                  {/* Lớp */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F3EFE6] text-[#204434] font-medium text-xs">
                      {asg.className}
                    </span>
                  </td>

                  {/* Thời hạn */}
                  <td className="py-3.5 px-4 text-[11px] space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[#315E48]">
                      <Calendar className="w-3.5 h-3.5 text-[#BC9B6B]" />
                      <span>Hạn: {asg.dueDate || "Không giới hạn"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#315E48]/70">
                      <Clock className="w-3.5 h-3.5 text-[#BC9B6B]" />
                      <span>{asg.durationMin || 45} phút</span>
                    </div>
                  </td>

                  {/* Tiến độ nộp */}
                  <td className="py-3.5 px-4">
                    <div className="w-36 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#315E48]">Đã nộp:</span>
                        <span className="font-bold text-[#204434]">
                          {asg.submittedCount}/{asg.totalStudents} ({percent}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E5DEC9] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3.5 px-4">
                    {isOpen ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Đang mở
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
                        <AlertCircle className="w-3 h-3 text-gray-500" />
                        Đã đóng
                      </span>
                    )}
                  </td>

                  {/* Thao tác */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenQrModal(asg)}
                        title="Mã QR & Link phòng thi"
                        className="p-1.5 rounded-lg border border-[#E5DEC9] hover:bg-[#F3EFE6] text-[#315E48] transition"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onGradeAssignment(asg)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#204434] hover:bg-[#163024] text-white font-bold text-xs transition shadow-2xs"
                      >
                        Chấm ({asg.submittedCount})
                      </button>
                      {onToggleStatus && (
                        <button
                          onClick={() => onToggleStatus(asg)}
                          title={isOpen ? "Khóa nhận bài" : "Mở lại"}
                          className="p-1.5 rounded-lg border border-[#E5DEC9] hover:bg-[#F3EFE6] text-[#315E48] transition"
                        >
                          {isOpen ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      {onDeleteAssignment && (
                        <button
                          onClick={() => onDeleteAssignment(asg)}
                          title="Xóa bài tập"
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
