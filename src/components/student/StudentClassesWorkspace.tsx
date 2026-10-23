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
  Volume2,
  Eye,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getClassArtwork } from "@/lib/class-helper";
import { AssignedLessonToClass, INITIAL_ASSIGNED_LESSONS } from "@/lib/lesson-data";

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
  const [activeSubTab, setActiveSubTab] = useState<"CLASSES" | "SCHEDULE">("CLASSES");

  // Selected Class Modal
  const [selectedClass, setSelectedClass] = useState<StudentClassItem | null>(null);
  const [classDetailLoading, setClassDetailLoading] = useState(false);
  const [classDetailData, setClassDetailData] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modal Sub-tabs: "ASSIGNMENTS" | "ASSIGNED_LESSONS"
  const [modalTab, setModalTab] = useState<"ASSIGNMENTS" | "ASSIGNED_LESSONS">("ASSIGNMENTS");
  const [showCulturalPinyin, setShowCulturalPinyin] = useState(true);
  const [showCulturalVi, setShowCulturalVi] = useState(true);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  // Chinese TTS for Student
  const speakChinese = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speakingText === text) {
      setSpeakingText(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.85;
    utterance.onend = () => setSpeakingText(null);
    utterance.onerror = () => setSpeakingText(null);
    setSpeakingText(text);
    window.speechSynthesis.speak(utterance);
  };

  // Assigned Lessons from localStorage / initial data
  const [assignedLessonsList] = useState<AssignedLessonToClass[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_assigned_lessons");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const classAssignedLessons = React.useMemo(() => {
    if (!selectedClass) return [];
    return assignedLessonsList.filter((asg) => {
      return (
        asg.classIds?.includes(selectedClass.id) ||
        asg.classIds?.includes(selectedClass.code) ||
        asg.classNames?.some((cn) => cn.toLowerCase().includes(selectedClass.name.toLowerCase()))
      );
    });
  }, [selectedClass, assignedLessonsList]);

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

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-2xl border border-[#E5DEC9]">
            <button
              onClick={() => setActiveSubTab("CLASSES")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeSubTab === "CLASSES"
                  ? "bg-[#204434] text-white shadow-xs"
                  : "text-[#315E48] hover:text-[#204434]"
              }`}
            >
              Danh sách lớp ({classes.length})
            </button>
            <button
              onClick={() => setActiveSubTab("SCHEDULE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "SCHEDULE"
                  ? "bg-[#204434] text-white shadow-xs"
                  : "text-[#315E48] hover:text-[#204434]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#BC9B6B]" />
              <span>Lịch ca học tuần này</span>
            </button>
          </div>

          <button
            onClick={onOpenJoinModal}
            className="bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#204434]/15 transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tham gia lớp học mới</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      {activeSubTab === "CLASSES" ? (
        <>
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
      </>
      ) : classes.length === 0 ? (
        /* Empty state khi học sinh chưa tham gia lớp nào */
        <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F0] text-[#315E48] flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="font-serif font-bold text-base text-[#204434]">Chưa có lịch ca học nào</h4>
          <p className="text-xs text-[#315E48] max-w-sm mx-auto leading-relaxed">
            Bạn chưa tham gia lớp học nào nên chưa có thời khóa biểu và link phòng học trực tiếp Google Meet. Hãy tham gia lớp học để cập nhật lịch nhé!
          </p>
          <button
            onClick={onOpenJoinModal}
            className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tham gia lớp học ngay</span>
          </button>
        </div>
      ) : (
        /* ================================================================= */
        /* CHẾ ĐỘ: LỊCH HỌC & CA HỌC APPLE CALENDAR STYLE DÀNH CHO HỌC SINH */
        /* ================================================================= */
        <div className="space-y-5 animate-fadeIn">
          {/* Thẻ ca học tiếp theo (Next upcoming live session) */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFFCF6] to-[#FFF9EE] border-2 border-[#BC9B6B]/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#204434] text-[#FFFCF6] flex flex-col items-center justify-center font-bold shrink-0 shadow-xs">
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">Thứ 4</span>
                <span className="text-xl font-serif">28</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Sắp diễn ra hôm nay</span>
                  </span>
                  <span className="text-xs font-semibold text-[#8F6D3B]">
                    19:30 – 21:00 (90 phút)
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[#204434]">
                  Bài 5: Ôn từ vựng & Phản xạ giao tiếp mua sắm HSK 1
                </h3>
                <p className="text-xs text-[#315E48]">
                  Lớp HSK 1A Tiêu chuẩn · Giảng viên: Cô Vương Lệ (Wang Li)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:self-center shrink-0 flex-wrap">
              <a
                href="https://meet.google.com/new"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-md shadow-[#204434]/15 flex items-center gap-2 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
                <span>Vào lớp Google Meet ngay</span>
              </a>
              <button
                onClick={() => alert("Đang tải tài liệu chuẩn bị trước buổi học...")}
                className="px-4 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                Tài liệu trước buổi học
              </button>
            </div>
          </div>

          {/* Lịch tuần Apple Calendar Grid */}
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/70">
              <div>
                <h4 className="font-serif font-bold text-base text-[#204434]">
                  Thời khóa biểu học tập tuần này
                </h4>
                <p className="text-xs text-[#315E48]">Các ca học trực tiếp và lịch nộp bài tập đã lên lịch</p>
              </div>
              <span className="text-xs font-semibold text-[#8F6D3B] bg-[#FFFBF0] px-3 py-1 rounded-full border border-[#BC9B6B]/40">
                Tháng 10, 2026
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
              {[
                { day: "Thứ 2", date: "26/10", hasClass: true, time: "19:30 - 21:00", subject: "Lớp HSK 1A", room: "Meet", done: true },
                { day: "Thứ 3", date: "27/10", hasClass: false, note: "Tự học Flashcard" },
                { day: "Thứ 4", date: "28/10", hasClass: true, time: "19:30 - 21:00", subject: "Lớp HSK 1A", room: "Meet", isToday: true },
                { day: "Thứ 5", date: "29/10", hasClass: false, note: "Hạn nộp Bài tập 5" },
                { day: "Thứ 6", date: "30/10", hasClass: true, time: "19:30 - 21:00", subject: "Luyện phát âm", room: "Zoom" },
                { day: "Thứ 7", date: "31/10", hasClass: false, note: "Game ghép từ" },
                { day: "Chủ nhật", date: "01/11", hasClass: true, time: "09:00 - 10:30", subject: "Thi thử HSK 1", room: "Phòng thi" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-xs space-y-2 flex flex-col justify-between transition ${
                    item.isToday
                      ? "bg-[#FFFBF0] border-[#BC9B6B] ring-2 ring-[#BC9B6B]/25"
                      : item.hasClass
                      ? "bg-[#FAF7F0] border-[#E5DEC9]"
                      : "bg-[#F8F5ED]/50 border-[#E5DEC9]/60 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#204434]">{item.day}</span>
                    <span className="text-[10px] text-[#315E48] font-mono">{item.date}</span>
                  </div>

                  {item.hasClass ? (
                    <div className="p-2 rounded-xl bg-white border border-[#E5DEC9]/80 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 block">
                        {item.time}
                      </span>
                      <p className="font-bold text-[#204434] text-[11px] truncate">
                        {item.subject}
                      </p>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-[#204434]/10 text-[#204434]">
                        {item.room}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 text-[11px] text-[#315E48] italic">
                      {item.note}
                    </div>
                  )}

                  {item.isToday && (
                    <span className="text-[9px] font-bold text-[#8F6D3B] text-center block bg-[#BC9B6B]/15 py-0.5 rounded-md">
                      Hôm nay
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHI TIẾT LỚP HỌC KHI HỌC VIÊN NHẤP VÀO LỚP */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 bg-[#204434]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] w-full max-w-2xl rounded-3xl border border-[#BC9B6B]/40 shadow-2xl p-6 sm:p-7 space-y-5 relative max-h-[90vh] overflow-y-auto">
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

            {/* Modal Sub-tabs: Assignments vs Assigned Lessons */}
            <div className="flex items-center gap-2 border-b border-[#BC9B6B]/20 pb-2">
              <button
                type="button"
                onClick={() => setModalTab("ASSIGNMENTS")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  modalTab === "ASSIGNMENTS"
                    ? "bg-[#204434] text-white shadow-2xs"
                    : "bg-[#F8F5ED] text-[#315E48] hover:bg-[#204434]/10"
                }`}
              >
                Bài tập & Nhiệm vụ ({classDetailData?.assignments?.length || selectedClass.totalAssignments || 0})
              </button>
              <button
                type="button"
                onClick={() => setModalTab("ASSIGNED_LESSONS")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  modalTab === "ASSIGNED_LESSONS"
                    ? "bg-[#204434] text-white shadow-2xs"
                    : "bg-[#F8F5ED] text-[#8F6D3B] hover:bg-[#204434]/10"
                }`}
              >
                <span>🏮 Bài học được giao ({classAssignedLessons.length})</span>
              </button>
            </div>

            {/* SUB-TAB 1: BÀI TẬP & NHIỆM VỤ */}
            {modalTab === "ASSIGNMENTS" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#315E48]">
                  <span className="font-semibold text-[#204434]">Danh sách bài tập cần hoàn thành:</span>
                  <span>
                    {selectedClass.progressPercent === null
                      ? "Chưa có tiến độ"
                      : `Hoàn thành: ${selectedClass.progressPercent}%`}
                  </span>
                </div>

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
            )}

            {/* SUB-TAB 2: BÀI HỌC ĐƯỢC GIAO (VĂN HÓA GIAO TIẾP THEO ĐẶC TẢ) */}
            {modalTab === "ASSIGNED_LESSONS" && (
              <div className="space-y-4">
                {/* Control bar for Pinyin & Translation */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF7F0] border border-[#BC9B6B]/30 text-xs">
                  <span className="text-[#8F6D3B] font-semibold flex items-center gap-1.5">
                    <span>🏮</span>
                    <span>Học liệu Văn hóa giao tiếp do giáo viên chọn giao:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCulturalPinyin(!showCulturalPinyin)}
                      className="px-2.5 py-1 rounded-lg border border-[#E5DEC9] bg-white font-semibold text-[#8F6D3B] text-[11px] hover:bg-[#F3EEDD]"
                    >
                      {showCulturalPinyin ? "Ẩn Pinyin" : "Hiện Pinyin"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCulturalVi(!showCulturalVi)}
                      className="px-2.5 py-1 rounded-lg border border-[#E5DEC9] bg-white font-semibold text-[#315E48] text-[11px] hover:bg-[#F3EEDD]"
                    >
                      {showCulturalVi ? "Ẩn Bản dịch" : "Hiện Bản dịch"}
                    </button>
                  </div>
                </div>

                {classAssignedLessons.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#315E48] bg-[#FAF7F0] rounded-2xl border border-dashed border-[#BC9B6B]/40">
                    Chưa có bài học nào được giao cho lớp này.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {classAssignedLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="p-4 rounded-2xl bg-white border border-[#BC9B6B]/40 shadow-2xs space-y-3.5"
                      >
                        {/* Header bài học */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DEC9] pb-3">
                          <div>
                            <h4 className="font-serif font-bold text-base text-[#204434]">
                              {lesson.titleZh}
                            </h4>
                            <p className="text-xs text-[#8F6D3B] font-medium">{lesson.titleVi}</p>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] font-semibold">
                              Hạn: {lesson.dueDate}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-bold">
                              🏮 {lesson.selectedCulturalItems?.length || lesson.culturalCount || 0} mục văn hóa
                            </span>
                          </div>
                        </div>

                        {/* Teacher Note */}
                        {lesson.teacherNote && (
                          <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#BC9B6B]/30 text-xs text-[#204434] italic">
                            <strong>Lời dặn của giáo viên:</strong> {lesson.teacherNote}
                          </div>
                        )}

                        {/* Cultural items display */}
                        {lesson.selectedCulturalItems && lesson.selectedCulturalItems.length > 0 ? (
                          <div className="space-y-3 pt-1">
                            <h5 className="font-bold text-xs text-[#204434] flex items-center gap-1.5">
                              <span>🏮</span>
                              <span>Văn hóa giao tiếp & Ứng dụng thực tế:</span>
                            </h5>

                            <div className="space-y-2.5">
                              {lesson.selectedCulturalItems.map((item) => (
                                <div
                                  key={item.id}
                                  className={`p-3 rounded-xl border transition ${
                                    item.type === "CAUTION"
                                      ? "bg-red-50/80 border-red-200"
                                      : item.type === "PHRASE" || item.type === "POLITE"
                                      ? "bg-[#FAF7F0] border-[#BC9B6B]/40"
                                      : "bg-white border-[#E5DEC9]"
                                  }`}
                                >
                                  {/* Badge label */}
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                        item.type === "CAUTION"
                                          ? "bg-red-200/70 text-red-800"
                                          : "bg-[#BC9B6B]/20 text-[#8F6D3B]"
                                      }`}
                                    >
                                      {item.categoryLabel}
                                    </span>

                                    {item.zh && (
                                      <button
                                        type="button"
                                        onClick={() => speakChinese(item.zh!)}
                                        className={`p-1.5 rounded-lg border transition ${
                                          speakingText === item.zh
                                            ? "bg-[#204434] text-white border-[#204434]"
                                            : "bg-white text-gray-500 border-[#E5DEC9] hover:text-[#204434] hover:bg-[#F3EEDD]"
                                        }`}
                                        title="Phát âm"
                                      >
                                        <Volume2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Item content */}
                                  {item.zh ? (
                                    <div className="space-y-0.5">
                                      <p className="font-serif font-bold text-base text-[#204434]">
                                        {item.zh}
                                      </p>
                                      {showCulturalPinyin && item.py && (
                                        <p className="text-xs text-[#8F6D3B] italic">{item.py}</p>
                                      )}
                                      {showCulturalVi && item.vi && (
                                        <p className="text-xs text-[#315E48] font-medium pt-0.5">
                                          {item.vi}
                                        </p>
                                      )}
                                      {item.note && (
                                        <p className="text-[11px] text-[#8F6D3B] italic pt-0.5">
                                          • {item.note}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <p
                                      className={`text-xs leading-relaxed ${
                                        item.type === "CAUTION" ? "text-red-900" : "text-[#204434]"
                                      }`}
                                    >
                                      {item.content}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 text-center text-xs text-[#315E48] bg-[#FAF7F0] rounded-xl border border-dashed border-[#E5DEC9]">
                            Bài học này không có mục Văn hóa giao tiếp nào được giáo viên chọn giao.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
