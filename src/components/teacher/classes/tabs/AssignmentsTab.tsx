"use client";

import React from "react";
import { FileCheck2, Clock, Calendar, ChevronRight, Plus } from "lucide-react";
import { ClassDetailItem } from "../types";

interface AssignmentsTabProps {
  currentClass: ClassDetailItem;
  assignments: any[];
  studentsCount: number;
  onAssignNew: (classId: string) => void;
  onGradeAssignment?: (assignmentId: string, title: string) => void;
}

export default function AssignmentsTab({
  currentClass,
  assignments,
  studentsCount,
  onAssignNew,
  onGradeAssignment,
}: AssignmentsTabProps) {
  return (
    <div className="rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-6 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DFD0]">
        <div>
          <h3 className="text-base font-serif font-bold text-[#17382F] flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#1F513F]" />
            <span>Bài tập & Đề thi lớp {currentClass.name}</span>
          </h3>
          <p className="text-xs text-[#6B766D] mt-0.5">
            Danh sách đề thi, bài tập và bài kiểm tra định kỳ được giao riêng cho học sinh lớp này.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onAssignNew(currentClass.id)}
          className="px-4 py-2 rounded-xl bg-[#1F513F] hover:bg-[#163c2f] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Giao bài tập mới</span>
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#6B766D] border border-dashed border-[#E5DFD0] rounded-2xl bg-[#F7F5EE]/40 space-y-3">
          <FileCheck2 className="w-8 h-8 text-[#BC9B6B] mx-auto" />
          <p className="font-bold text-[#17382F] text-sm">
            Chưa có bài tập nào được giao riêng cho lớp này.
          </p>
          <p className="max-w-md mx-auto">
            Nhấn nút <strong>"+ Giao bài tập mới"</strong> để chọn đề thi từ kho và phân phối đến học viên trong lớp.
          </p>
          <button
            type="button"
            onClick={() => onAssignNew(currentClass.id)}
            className="px-4 py-2 rounded-xl bg-[#1F513F] text-white text-xs font-semibold hover:bg-[#17382F] shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Giao bài tập ngay</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#E5DFD0] border border-[#E5DFD0] rounded-2xl bg-white overflow-hidden shadow-2xs">
          {assignments.map((asg: any) => (
            <div
              key={asg.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FDFBF7] transition"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#17382F]">
                  {asg.title}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6B766D]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#BC9B6B]" />
                    <span>Thời lượng: {asg.durationMin || 45} phút</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      Hạn nộp:{" "}
                      {asg.dueAt
                        ? new Date(asg.dueAt).toLocaleDateString("vi-VN")
                        : "Không giới hạn"}
                    </span>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {asg.submittedCount || asg.submissionsCount || 0}/{studentsCount} đã nộp
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onGradeAssignment) {
                    onGradeAssignment(asg.id, asg.title);
                  } else {
                    onAssignNew(currentClass.id);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl border border-[#E5DFD0] text-[#17382F] hover:bg-[#F7F5EE] text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
              >
                <span>Chấm bài & Quản lý</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
