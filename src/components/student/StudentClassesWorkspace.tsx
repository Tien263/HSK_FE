"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Search,
  LayoutGrid,
  List,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  FileCheck2,
  ChevronRight,
  Plus,
  X,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { getClassArtwork } from "@/lib/class-helper";

export interface StudentClassItem {
  id: string;
  name: string;
  level: number;
  description: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "PAUSED" | "UPCOMING" | "ENDED";
  statusText: string;
  track: "HSK" | "TOPIC" | "MAJOR";
  totalStudents: number;
  totalAssignments: number;
  submittedAssignments: number;
  progressPercent: number | null; // null if 0 assignments (CLASS-002)
  code: string;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  teacherAvatar?: string;
  artwork?: string;
}

interface StudentClassesWorkspaceProps {
  currentUser: any;
  onOpenJoinModal?: () => void;
}

export default function StudentClassesWorkspace({
  currentUser,
  onOpenJoinModal,
}: StudentClassesWorkspaceProps) {
  const [classes, setClasses] = useState<StudentClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "PAUSED" | "UPCOMING" | "ENDED"
  >("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selected Class Modal
  const [selectedClass, setSelectedClass] = useState<StudentClassItem | null>(null);
  const [classDetailLoading, setClassDetailLoading] = useState(false);
  const [classDetailData, setClassDetailData] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch real enrolled classes for logged in student
  const fetchClasses = async () => {
    if (!currentUser?.id && !currentUser?.username) return;
    setLoading(true);
    try {
      const studentId = currentUser?.id || "";
      const res = await fetch(`/api/v1/classes?studentId=${encodeURIComponent(studentId)}`, {
        cache: "no-store",
        headers: {
          "x-user-id": studentId,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        const mapped = data.items.map((c: any, idx: number) => ({
          ...c,
          artwork: getClassArtwork(c.track || "HSK", c.level || 1, idx, c.name),
        }));
        setClasses(mapped);
      }
    } catch (err) {
      console.error("Lỗi tải lớp học của học viên:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [currentUser?.id]);

  // Load detailed class info on click
  const handleOpenDetail = async (cl: StudentClassItem) => {
    setSelectedClass(cl);
    setClassDetailLoading(true);
    try {
      const res = await fetch(`/api/v1/classes/${cl.id}`);
      const data = await res.json();
      if (data.success && data.class) {
        setClassDetailData(data.class);
      }
    } catch (err) {
      console.error("Lỗi tải chi tiết lớp:", err);
    } finally {
      setClassDetailLoading(false);
    }
  };

  // Filter calculations
  const totalCount = classes.length;
  const activeCount = classes.filter((c) => c.status === "ACTIVE").length;
  const pausedCount = classes.filter((c) => c.status === "PAUSED").length;
  const upcomingCount = classes.filter((c) => c.status === "UPCOMING").length;
  const endedCount = classes.filter((c) => c.status === "ENDED").length;

  const filteredClasses = classes.filter((cl) => {
    // Status Filter (Lỗi 1)
    if (statusFilter !== "ALL" && cl.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = cl.name.toLowerCase().includes(q);
      const matchTeacher = cl.teacherName.toLowerCase().includes(q);
      const matchCode = cl.code.toLowerCase().includes(q);
      if (!matchName && !matchTeacher && !matchCode) return false;
    }

    return true;
  });

  const getStatusBadge = (status: string, statusText: string) => {
    switch (status) {
      case "ACTIVE":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          dot: "bg-emerald-500",
          label: "Đang học",
        };
      case "PAUSED":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200/80",
          dot: "bg-amber-500",
          label: "Tạm dừng",
        };
      case "UPCOMING":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200/80",
          dot: "bg-blue-500",
          label: "Sắp bắt đầu",
        };
      case "ENDED":
      default:
        return {
          bg: "bg-stone-100 text-stone-600 border-stone-200",
          dot: "bg-stone-400",
          label: "Đã kết thúc",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#FFFCF6] rounded-3xl p-6 sm:p-7 border border-[#E5DEC9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#204434] text-[#FFFCF6] flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-[#BC9B6B]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-[#204434]">
                Lớp Học Của Tôi
              </h2>
              <p className="text-xs text-[#315E48]">
                Xem tiến độ bài tập, lịch học và tài liệu giảng dạy từ giáo viên
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenJoinModal}
          className="bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#204434]/15 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tham gia lớp học mới</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#FFFCF6] p-4 rounded-2xl border border-[#E5DEC9] shadow-2xs space-y-3">
        {/* Lỗi 1: Tabs bộ lọc đầy đủ gồm Tạm dừng và số đếm chính xác */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: "ALL", label: `Tất cả (${totalCount})` },
              { key: "ACTIVE", label: `Đang học (${activeCount})` },
              { key: "PAUSED", label: `Tạm dừng (${pausedCount})` },
              { key: "UPCOMING", label: `Sắp bắt đầu (${upcomingCount})` },
              { key: "ENDED", label: `Đã kết thúc (${endedCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-[#204434] text-[#FFFCF6] shadow-2xs"
                    : "bg-[#F8F5ED] text-[#315E48] hover:bg-[#204434]/10 border border-[#E5DEC9]/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 self-end md:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              title="Dạng lưới"
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#204434] text-[#FFFCF6] border-[#204434]"
                  : "bg-[#F8F5ED] text-[#315E48] border-[#E5DEC9] hover:bg-[#204434]/10"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="Dạng danh sách"
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#204434] text-[#FFFCF6] border-[#204434]"
                  : "bg-[#F8F5ED] text-[#315E48] border-[#E5DEC9] hover:bg-[#204434]/10"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#315E48] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm lớp học theo tên lớp, mã lớp hoặc tên giáo viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F8F5ED]/70 border border-[#E5DEC9] text-xs text-[#204434] focus:outline-hidden focus:border-[#204434] transition"
          />
        </div>
      </div>

      {/* Class List Render */}
      {loading ? (
        <div className="bg-[#FFFCF6] rounded-3xl p-12 text-center border border-[#E5DEC9] shadow-xs">
          <div className="w-8 h-8 border-3 border-[#204434]/20 border-t-[#204434] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#315E48] font-medium">Đang tải danh sách lớp học của bạn...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        /* Empty State */
        <div className="bg-[#FFFCF6] rounded-3xl p-12 text-center border border-[#E5DEC9] shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#204434]/10 text-[#204434] flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 opacity-75" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base text-[#204434]">
              {classes.length === 0
                ? "Bạn chưa tham gia lớp học nào"
                : "Không tìm thấy lớp học phù hợp với bộ lọc"}
            </h3>
            <p className="text-xs text-[#315E48] max-w-md mx-auto">
              {classes.length === 0
                ? "Nhập mã lớp học do giáo viên cung cấp để tham gia lớp và bắt đầu nhận bài tập ôn luyện."
                : "Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc trạng thái khác."}
            </p>
          </div>
          {classes.length === 0 && (
            <button
              onClick={onOpenJoinModal}
              className="bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] px-5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer shadow-md shadow-[#204434]/15"
            >
              + Nhập mã tham gia lớp học ngay
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* CLASS-003: Responsive 1, 2, 3, 4 columns gap-4 ensuring dates don't wrap or lose year */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClasses.map((cl) => {
            const statusInfo = getStatusBadge(cl.status, cl.statusText);
            return (
              <div
                key={cl.id}
                onClick={() => handleOpenDetail(cl)}
                className="bg-[#FFFCF6] rounded-2xl border border-[#E5DEC9] hover:border-[#204434] transition-all duration-200 shadow-2xs hover:shadow-md overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Card Artwork Header (Lỗi 4: Không trùng lặp tranh) */}
                  <div className="relative h-32 w-full overflow-hidden bg-[#204434]/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cl.artwork || "/theme/card-hsk-scroll.webp"}
                      alt={cl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Status Badge (CLASS-001) */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-xs ${statusInfo.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>

                    {/* Track Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/40 text-[#FFFCF6] backdrop-blur-md border border-white/20">
                        {cl.track} · HSK {cl.level}
                      </span>
                    </div>

                    {/* Class Name */}
                    <div className="absolute bottom-2.5 left-3 right-3 text-[#FFFCF6]">
                      <h4 className="font-serif font-bold text-sm truncate drop-shadow-md">
                        {cl.name}
                      </h4>
                      <p className="text-[11px] text-white/90 truncate flex items-center gap-1 drop-shadow-xs">
                        <span>GV: {cl.teacherName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 space-y-3">
                    {/* CLASS-003: Full dates DD/MM/YYYY – DD/MM/YYYY */}
                    <div className="flex items-center justify-between text-[11px] text-[#315E48]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#BC9B6B] shrink-0" />
                        <span className="font-medium whitespace-nowrap">
                          {cl.startDate} – {cl.endDate}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono bg-[#F8F5ED] px-1.5 py-0.5 rounded border border-[#E5DEC9] text-[#204434]">
                        {cl.code}
                      </span>
                    </div>

                    {/* CLASS-002: Progress Percent or "Chưa có dữ liệu tiến độ" */}
                    <div className="space-y-1.5 bg-[#F8F5ED]/70 p-2.5 rounded-xl border border-[#E5DEC9]/60">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#315E48] font-medium">Tiến độ bài tập:</span>
                        <span
                          className={`font-bold ${
                            cl.progressPercent === null
                              ? "text-[#315E48]/70 italic text-[10px]"
                              : "text-[#204434]"
                          }`}
                        >
                          {cl.progressPercent === null || cl.totalAssignments === 0
                            ? "Chưa có dữ liệu tiến độ"
                            : `${cl.progressPercent}% (${cl.submittedAssignments}/${cl.totalAssignments})`}
                        </span>
                      </div>

                      {cl.progressPercent !== null && cl.totalAssignments > 0 ? (
                        <div className="w-full h-1.5 bg-[#204434]/15 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#204434] rounded-full transition-all duration-300"
                            style={{ width: `${cl.progressPercent}%` }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-1 bg-[#BC9B6B]/20 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-3 pt-0">
                  <button
                    type="button"
                    className="w-full py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] text-xs font-semibold transition flex items-center justify-center gap-1 shadow-2xs group-hover:scale-[1.01]"
                  >
                    <span>Vào lớp học</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#FFFCF6] rounded-2xl border border-[#E5DEC9] overflow-hidden shadow-xs divide-y divide-[#E5DEC9]/60">
          {filteredClasses.map((cl) => {
            const statusInfo = getStatusBadge(cl.status, cl.statusText);
            return (
              <div
                key={cl.id}
                onClick={() => handleOpenDetail(cl)}
                className="p-4 hover:bg-[#F8F5ED]/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#204434]/10 shrink-0 border border-[#E5DEC9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cl.artwork || "/theme/card-hsk-scroll.webp"}
                      alt={cl.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#204434]">{cl.name}</h4>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>
                    <div className="text-xs text-[#315E48] flex items-center gap-3">
                      <span>Giáo viên: {cl.teacherName}</span>
                      <span>•</span>
                      {/* CLASS-003: Full dates DD/MM/YYYY */}
                      <span>
                        Thời gian: {cl.startDate} – {cl.endDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-auto">
                  {/* CLASS-002: Progress text */}
                  <div className="text-right">
                    <div className="text-[11px] text-[#315E48]">Tiến độ:</div>
                    <div className="text-xs font-bold text-[#204434]">
                      {cl.progressPercent === null || cl.totalAssignments === 0
                        ? "Chưa có dữ liệu tiến độ"
                        : `${cl.progressPercent}% (${cl.submittedAssignments}/${cl.totalAssignments})`}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] text-xs font-semibold transition flex items-center gap-1 shadow-2xs"
                  >
                    <span>Vào lớp</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CHI TIẾT LỚP HỌC KHI HỌC VIÊN NHẤP VÀO LỚP */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 bg-[#204434]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] w-full max-w-xl rounded-3xl border border-[#BC9B6B]/40 shadow-2xl p-6 sm:p-7 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedClass(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-[#315E48] hover:bg-[#204434]/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 border-b border-[#BC9B6B]/20 pb-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-[#BC9B6B]/30 bg-[#204434]/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedClass.artwork || "/theme/card-hsk-scroll.webp"}
                  alt={selectedClass.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-lg text-[#204434] truncate">
                    {selectedClass.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      getStatusBadge(selectedClass.status, selectedClass.statusText).bg
                    }`}
                  >
                    {getStatusBadge(selectedClass.status, selectedClass.statusText).label}
                  </span>
                </div>
                <p className="text-xs text-[#315E48]">
                  Giáo viên phụ trách: <span className="font-semibold text-[#204434]">{selectedClass.teacherName}</span>
                </p>
                <div className="flex items-center gap-3 text-[11px] text-[#315E48]">
                  <span>Mã lớp: <strong className="font-mono text-[#204434]">{selectedClass.code}</strong></span>
                  <span>•</span>
                  <span>Thời gian: {selectedClass.startDate} – {selectedClass.endDate}</span>
                </div>
              </div>
            </div>

            {/* Class Description */}
            {selectedClass.description && (
              <div className="bg-[#F8F5ED]/80 p-3.5 rounded-2xl border border-[#BC9B6B]/25 text-xs text-[#204434] leading-relaxed">
                {selectedClass.description}
              </div>
            )}

            {/* Class Assignments / Lessons */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#204434] flex items-center justify-between">
                <span>Bài tập & Nhiệm vụ ({classDetailData?.assignments?.length || selectedClass.totalAssignments || 0})</span>
                <span className="text-xs text-[#315E48] font-normal">
                  {selectedClass.progressPercent === null
                    ? "Chưa có dữ liệu tiến độ"
                    : `Hoàn thành: ${selectedClass.progressPercent}%`}
                </span>
              </h4>

              {classDetailLoading ? (
                <div className="py-6 text-center text-xs text-[#315E48]">
                  <div className="w-5 h-5 border-2 border-[#204434]/20 border-t-[#204434] rounded-full animate-spin mx-auto mb-1.5" />
                  Đang tải danh sách bài tập...
                </div>
              ) : classDetailData?.assignments && classDetailData.assignments.length > 0 ? (
                <div className="space-y-2">
                  {classDetailData.assignments.map((asg: any) => (
                    <div
                      key={asg.id}
                      className="p-3 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/20 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-[#204434]">{asg.title}</div>
                        <div className="text-[11px] text-[#315E48]">
                          Thời gian: {asg.durationMin} phút • Hạn nộp: {new Date(asg.dueAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                      <Link
                        href={`/s/attempts/${asg.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] text-xs font-semibold transition shrink-0"
                      >
                        Làm bài
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#F8F5ED]/50 border border-dashed border-[#BC9B6B]/30 text-center text-xs text-[#315E48]">
                  Lớp học này hiện chưa có bài tập nào được giao.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#BC9B6B]/15">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedClass.code);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="text-xs text-[#315E48] hover:text-[#204434] flex items-center gap-1 font-medium cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Đã sao chép mã!" : "Sao chép mã lớp"}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] text-xs font-semibold transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
