"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  UserPlus,
  Trash2,
  CheckCircle2,
  Clock,
  Check,
  X,
  AlertCircle,
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
  onApproveStudent?: (studentId: string) => Promise<void>;
  onRejectStudent?: (studentId: string) => Promise<void>;
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
  onApproveStudent,
  onRejectStudent,
}: StudentsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LEARNING" | "PENDING" | "COMPLETED">("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Danh sách học sinh đang chờ duyệt
  const pendingStudents = useMemo(() => {
    return studentsList.filter((st) => st.enrollmentStatus === "PENDING" || st.status === "PENDING");
  }, [studentsList]);

  const approvedStudentsCount = useMemo(() => {
    return studentsList.filter((st) => st.enrollmentStatus !== "PENDING" && st.status !== "PENDING").length;
  }, [studentsList]);

  const filteredStudents = useMemo(() => {
    return studentsList.filter((st) => {
      const isPending = st.enrollmentStatus === "PENDING" || st.status === "PENDING";
      if (statusFilter === "PENDING" && !isPending) return false;
      if (statusFilter === "LEARNING" && (isPending || st.status !== "LEARNING")) return false;
      if (statusFilter === "COMPLETED" && (isPending || st.status !== "COMPLETED")) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        st.name.toLowerCase().includes(q) ||
        st.username.toLowerCase().includes(q) ||
        (st.email && st.email.toLowerCase().includes(q))
      );
    });
  }, [studentsList, statusFilter, searchQuery]);

  const handleApprove = async (studentId: string) => {
    if (!onApproveStudent) return;
    setProcessingId(studentId);
    try {
      await onApproveStudent(studentId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (studentId: string) => {
    if (!onRejectStudent) return;
    setProcessingId(studentId);
    try {
      await onRejectStudent(studentId);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. KHU VỰC THÔNG BÁO YÊU CẦU CHỜ DUYỆT (NẾU CÓ) */}
      {pendingStudents.length > 0 && (
        <div className="rounded-3xl bg-amber-50/80 border border-amber-200/80 p-5 shadow-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-amber-950">
                  Có {pendingStudents.length} học sinh vừa nhập mã xin vào lớp
                </h4>
                <p className="text-[11px] text-amber-800">
                  Cô giáo vui lòng kiểm tra danh tính và bấm duyệt để học sinh được bắt đầu học tập.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
              Chờ phê duyệt
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {pendingStudents.map((st) => (
              <div
                key={st.id}
                className="p-3 rounded-2xl bg-white border border-amber-200/70 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden relative shrink-0 border border-amber-200">
                    <Image
                      src={st.avatar || "/theme/avatar-student.jpg"}
                      alt={st.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-xs text-[#17382F] block truncate">
                      {st.name}
                    </span>
                    <span className="text-[10px] text-[#6B766D] font-mono block">
                      @{st.username} • Xin vào: {st.joinedDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={processingId === st.id}
                    onClick={() => handleApprove(st.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{processingId === st.id ? "Đang duyệt..." : "Duyệt"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={processingId === st.id}
                    onClick={() => handleReject(st.id)}
                    className="px-2.5 py-1.5 rounded-xl border border-gray-300 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-600 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Từ chối</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC */}
      <div className="rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-serif font-bold text-[#17382F] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1F513F]" />
              <span>Danh sách học sinh ({studentsList.length})</span>
            </h3>
            <p className="text-xs text-[#6B766D] mt-0.5">
              {approvedStudentsCount} học sinh chính thức • {pendingStudents.length} học sinh chờ duyệt.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenManualStudentModal}
            className="px-4 py-2 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm học sinh trực tiếp</span>
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
              { id: "LEARNING", label: `Đang học (${approvedStudentsCount})` },
              { id: "PENDING", label: `Chờ duyệt (${pendingStudents.length})` },
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

      {/* Bulk Action Bar */}
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
            {statusFilter === "PENDING"
              ? "Không có yêu cầu vào lớp nào đang chờ duyệt"
              : "Lớp học chưa có học sinh nào"}
          </h4>
          <p className="text-xs text-[#6B766D] max-w-md mx-auto">
            Hãy chia sẻ mã lớp <strong>{currentClass.code}</strong> cho học viên tham gia hoặc nhấn <strong>"Thêm học sinh trực tiếp"</strong> để cấp tài khoản.
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
                <th className="py-3 px-3">Ngày xin vào</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD0]/60">
              {filteredStudents.map((st) => {
                const isChecked = selectedStudentIds.includes(st.id);
                const isPending = st.enrollmentStatus === "PENDING" || st.status === "PENDING";

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
                            src={st.avatar || "/theme/avatar-student.jpg"}
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
                      {isPending ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 text-amber-700" />
                          <span>Chờ duyệt</span>
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {st.statusText || (st.status === "COMPLETED" ? "Hoàn thành" : "Đang học")}
                        </span>
                      )}
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-[#E5DFD0] overflow-hidden">
                          <div
                            className="h-full bg-[#1F513F] rounded-full"
                            style={{ width: `${st.progressPercent??0}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-[#1F513F]">
                          {st.progressPercent===null?"Chưa có bài tập":`${st.progressPercent}%`}
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
                      <div className="flex items-center justify-end gap-1.5">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              disabled={processingId === st.id}
                              onClick={() => handleApprove(st.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#1F513F] hover:bg-[#17382F] text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Duyệt vào lớp"
                            >
                              <Check className="w-3 h-3" />
                              <span>Duyệt</span>
                            </button>
                            <button
                              type="button"
                              disabled={processingId === st.id}
                              onClick={() => handleReject(st.id)}
                              className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
                              title="Từ chối yêu cầu"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onRemoveStudent(st)}
                            title="Xóa khỏi lớp học này"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
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
      )}
    </div>
  );
}
