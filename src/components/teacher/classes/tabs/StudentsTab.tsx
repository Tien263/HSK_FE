"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  UserPlus,
  Trash2,
  CheckCircle2,
  MoreVertical,
  Key,
} from "lucide-react";
import { ClassDetailItem, StudentRowItem } from "../types";

interface StudentsTabProps {
  currentClass: ClassDetailItem;
  studentsList: StudentRowItem[];
  loadingStudents: boolean;
  selectedStudentIds: string[];
  setSelectedStudentIds: (ids: string[]) => void;
  onRemoveStudent: (student: StudentRowItem) => void;
  onBulkRemoveStudents: () => void;
  onOpenManualStudentModal: () => void;
  onSelectStudentDetail?: (student: StudentRowItem) => void;
}

export default function StudentsTab({
  currentClass,
  studentsList,
  loadingStudents,
  selectedStudentIds,
  setSelectedStudentIds,
  onRemoveStudent,
  onBulkRemoveStudents,
  onOpenManualStudentModal,
  onSelectStudentDetail,
}: StudentsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LEARNING" | "COMPLETED">("ALL");

  const filteredStudents = useMemo(() => {
    return studentsList.filter((st) => {
      if (statusFilter === "LEARNING" && st.status !== "LEARNING") return false;
      if (statusFilter === "COMPLETED" && st.status !== "COMPLETED") return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        st.name.toLowerCase().includes(q) ||
        st.username.toLowerCase().includes(q) ||
        (st.email && st.email.toLowerCase().includes(q))
      );
    });
  }, [studentsList, statusFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search & Actions Toolbar */}
      <div className="rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-serif font-bold text-[#17382F] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1F513F]" />
              <span>Danh sách học sinh ({studentsList.length})</span>
            </h3>
            <p className="text-xs text-[#6B766D] mt-0.5">
              Theo dõi tiến độ, bài nộp và quản lý học sinh trong lớp {currentClass.name}.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenManualStudentModal}
            className="px-4 py-2 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm học sinh vào lớp</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E5DFD0]/60">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#6B766D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, tài khoản hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E5DFD0] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#17382F] focus:outline-hidden shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F7F5EE] p-1 rounded-xl border border-[#E5DFD0] text-xs">
            {[
              { id: "ALL", label: `Tất cả (${studentsList.length})` },
              { id: "LEARNING", label: "Đang học" },
              { id: "COMPLETED", label: "Hoàn thành" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1 rounded-lg transition font-medium cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-white text-[#1F513F] shadow-2xs font-bold"
                    : "text-[#6B766D] hover:text-[#17382F]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedStudentIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
          <div className="text-xs font-bold text-amber-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-700" />
            <span>Đã chọn {selectedStudentIds.length} học viên</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedStudentIds([])}
              className="px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              onClick={onBulkRemoveStudents}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa khỏi lớp ({selectedStudentIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Student Table or Empty State */}
      {loadingStudents ? (
        <div className="p-12 text-center text-xs text-[#6B766D] rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0]">
          <div className="w-6 h-6 border-2 border-[#1F513F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p>Đang tải danh sách học viên...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-[#E5DFD0] bg-[#FFFCF7] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F7F5EE] text-[#1F513F] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="font-serif font-bold text-sm text-[#17382F]">
            Lớp học chưa có học sinh nào
          </h4>
          <p className="text-xs text-[#6B766D] max-w-md mx-auto">
            Hãy chia sẻ mã lớp <strong>{currentClass.code}</strong> cho học viên tham gia hoặc nhấn <strong>"Thêm học sinh vào lớp"</strong> để cấp tài khoản.
          </p>
          <button
            type="button"
            onClick={onOpenManualStudentModal}
            className="px-4 py-2 rounded-xl bg-[#1F513F] text-white text-xs font-semibold hover:bg-[#17382F] inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Thêm học sinh ngay</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-[#E5DFD0] bg-[#FFFCF7] shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5DFD0] bg-[#F7F5EE]/70 text-[#6B766D] font-semibold text-[11px]">
                <th className="py-3 px-3.5 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedStudentIds.length === filteredStudents.length &&
                      filteredStudents.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedStudentIds(filteredStudents.map((s) => s.id));
                      else setSelectedStudentIds([]);
                    }}
                    className="rounded border-[#E5DFD0] accent-[#1F513F] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Học sinh</th>
                <th className="py-3 px-3">Tài khoản</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-3">Tiến độ bài học</th>
                <th className="py-3 px-3">Bài tập đã nộp</th>
                <th className="py-3 px-3">Ngày vào lớp</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD0]/60">
              {filteredStudents.map((st) => {
                const isChecked = selectedStudentIds.includes(st.id);
                return (
                  <tr key={st.id} className="hover:bg-[#F7F5EE]/50 transition">
                    <td className="py-3 px-3.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked)
                            setSelectedStudentIds([...selectedStudentIds, st.id]);
                          else
                            setSelectedStudentIds(
                              selectedStudentIds.filter((id) => id !== st.id)
                            );
                        }}
                        className="rounded border-[#E5DFD0] accent-[#1F513F] cursor-pointer"
                      />
                    </td>

                    {/* Avatar & Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0 border border-[#E5DFD0]">
                          <Image
                            src={st.avatar || "/theme/avatar-teacher.jpg"}
                            alt={st.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-[#17382F] block">
                            {st.name}
                          </span>
                          {st.email && (
                            <span className="text-[10px] text-[#6B766D] block">
                              {st.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="py-3 px-3 font-mono text-[11px] text-[#6B766D]">
                      @{st.username}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {st.statusText || (st.status === "COMPLETED" ? "Hoàn thành" : "Đang học")}
                      </span>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-[#E5DFD0] overflow-hidden">
                          <div
                            className="h-full bg-[#1F513F] rounded-full"
                            style={{ width: `${st.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-[#1F513F]">
                          {st.progressPercent}%
                        </span>
                      </div>
                    </td>

                    {/* Assignments */}
                    <td className="py-3 px-3 font-semibold text-[#17382F] text-[11px]">
                      {st.submittedAssignments} bài
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-[#6B766D] text-[11px]">
                      {st.joinedDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onRemoveStudent(st)}
                          title="Xóa khỏi lớp học này"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
