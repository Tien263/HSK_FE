import React from "react";
import Image from "next/image";
import {
  FileCheck2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
} from "lucide-react";
import { StudentSubmissionItem } from "./types";

interface SubmissionsListTableProps {
  submissions: StudentSubmissionItem[];
  onOpenGradingModal: (submission: StudentSubmissionItem) => void;
}

export default function SubmissionsListTable({
  submissions,
  onOpenGradingModal,
}: SubmissionsListTableProps) {
  if (submissions.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#E5DEC9] space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#F3EFE6] flex items-center justify-center mx-auto text-[#315E48]">
          <FileCheck2 className="w-6 h-6 opacity-60" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#204434]">
            Chưa có bài nộp nào cần xử lý.
          </p>
          <p className="text-xs text-[#315E48]/70 max-w-sm mx-auto">
            Khi học sinh hoàn thành bài kiểm tra và nộp bài, danh sách bài nộp và trạng thái chấm sẽ xuất hiện tại đây.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5DEC9] overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF7F0] border-b border-[#E5DEC9] text-[#315E48] font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Học sinh</th>
              <th className="py-3 px-4">Lớp học</th>
              <th className="py-3 px-4">Đề kiểm tra</th>
              <th className="py-3 px-4">Thời gian nộp</th>
              <th className="py-3 px-4">Điểm số</th>
              <th className="py-3 px-4">Trạng thái chấm</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DEC9]/60 text-[#204434]">
            {submissions.map((sub) => {
              const isWaiting =
                sub.gradingStatus === "WAITING_MANUAL" && sub.submissionStatus === "SUBMITTED";

              return (
                <tr key={sub.id} className="hover:bg-[#FFFCF6] transition">
                  {/* Học sinh */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#E5DEC9] shrink-0 border border-[#BC9B6B]/40">
                        {sub.studentAvatar ? (
                          <Image
                            src={sub.studentAvatar}
                            alt={sub.studentName}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#204434] font-bold text-xs">
                            {sub.studentName.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-[#204434] block">{sub.studentName}</span>
                        {sub.studentUsername && (
                          <span className="text-[10px] text-[#315E48]/70">@{sub.studentUsername}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Lớp */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-lg bg-[#F3EFE6] text-[#204434] font-medium text-xs">
                      {sub.className}
                    </span>
                  </td>

                  {/* Đề */}
                  <td className="py-3.5 px-4 font-medium text-[#204434]">
                    {sub.assignmentTitle}
                  </td>

                  {/* Thời gian */}
                  <td className="py-3.5 px-4 text-[11px] text-[#315E48]/70">
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString("vi-VN") : "Chưa nộp"}
                  </td>

                  {/* Điểm số */}
                  <td className="py-3.5 px-4">
                    {sub.score !== null ? (
                      <span className="font-bold text-sm text-[#204434]">
                        {sub.score}/{sub.maxScore || 100}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">--</span>
                    )}
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3.5 px-4">
                    {isWaiting ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Chờ chấm
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Đã chấm
                      </span>
                    )}
                  </td>

                  {/* Nút hành động */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onOpenGradingModal(sub)}
                      className="px-3 py-1.5 rounded-xl bg-[#204434] hover:bg-[#163024] text-white font-bold text-xs transition shadow-2xs"
                    >
                      {isWaiting ? "Chấm ngay" : "Xem chi tiết"}
                    </button>
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
