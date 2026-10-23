"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileCheck2,
  Clock,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  QrCode,
  Key,
  ExternalLink,
  ChevronRight,
  Award,
  BookOpen,
  Filter,
} from "lucide-react";

export interface StudentAssignmentItem {
  id: string;
  title: string;
  className: string;
  classId?: string;
  durationMin: number;
  dueAt: string;
  totalQuestions: number;
  totalPoints?: number;
  hasAttempted: boolean;
  latestScore: number | null;
  status: "OPEN" | "SUBMITTED" | "OVERDUE" | "GRADED";
  submittedAt?: string;
  attemptId?: string;
}

interface StudentAssignmentsWorkspaceProps {
  currentUser?: any;
  onNavigateToTab?: (tab: string) => void;
  classesCount?: number;
  myClasses?: any[];
  onOpenJoinModal?: () => void;
}

export default function StudentAssignmentsWorkspace({
  currentUser,
  onNavigateToTab,
  classesCount = 0,
  myClasses = [],
  onOpenJoinModal,
}: StudentAssignmentsWorkspaceProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "OPEN" | "SUBMITTED" | "GRADED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [roomPinInput, setRoomPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Load real assignments from API for this specific student
  useEffect(() => {
    async function fetchAssignments() {
      try {
        setLoading(true);
        const studentId = currentUser?.id;

        // Collect class IDs and class names the student belongs to
        const studentClassIds: string[] = [];
        const studentClassNames: string[] = [];
        if (Array.isArray(myClasses) && myClasses.length > 0) {
          myClasses.forEach((c: any) => {
            if (c.id) studentClassIds.push(c.id);
            if (c.code) studentClassIds.push(c.code);
            if (c.name) studentClassNames.push(c.name);
          });
        }

        // Also check study profile in localStorage
        if (typeof window !== "undefined") {
          try {
            const profRaw = localStorage.getItem("hanyu_study_profile");
            if (profRaw) {
              const prof = JSON.parse(profRaw);
              if (prof.classInfo?.id) studentClassIds.push(prof.classInfo.id);
              if (prof.classInfo?.code) studentClassIds.push(prof.classInfo.code);
              if (prof.classInfo?.name) studentClassNames.push(prof.classInfo.name);
            }
          } catch (e) {}
        }

        const uniqueClassIds = Array.from(new Set(studentClassIds));
        const classIdsParam = uniqueClassIds.length > 0 ? `&classIds=${encodeURIComponent(uniqueClassIds.join(","))}` : "";
        const url = studentId
          ? `/api/v1/assignments?studentId=${encodeURIComponent(studentId)}${classIdsParam}`
          : `/api/v1/assignments?${classIdsParam}`;

        let apiAssignments: StudentAssignmentItem[] = [];
        try {
          const res = await fetch(url, {
            headers: studentId ? { "x-user-id": studentId } : {},
          });

          if (res.ok) {
            const json = await res.json();
            const list = json.items || json.data;
            if (json.success && Array.isArray(list)) {
              apiAssignments = list.map((a: any) => ({
                id: a.id,
                title: a.title,
                className: a.className || a.class?.name || "Lớp học",
                classId: a.classId,
                durationMin: a.durationMin || 45,
                dueAt: a.dueAt ? new Date(a.dueAt).toLocaleDateString("vi-VN") : "Chưa có hạn",
                totalQuestions: a.totalQuestions || a._count?.questions || 10,
                totalPoints: a.totalPoints || 100,
                hasAttempted: a.hasAttempted || false,
                latestScore: a.latestScore ?? null,
                status: a.hasAttempted ? "GRADED" : "OPEN",
                attemptId: a.attemptId || a.id,
              }));
            }
          }
        } catch (apiErr) {
          console.error("API fetch assignments error:", apiErr);
        }

        // Merge assignments from shared & teacher storage
        const localAssignments: StudentAssignmentItem[] = [];
        if (typeof window !== "undefined") {
          try {
            const sharedRaw = localStorage.getItem("hanyu_shared_assignments");
            const teacherRaw = localStorage.getItem("hanyu_teacher_assignments");
            const allTeacher = [
              ...(sharedRaw ? JSON.parse(sharedRaw) : []),
              ...(teacherRaw ? JSON.parse(teacherRaw) : []),
            ];

            for (const tAss of allTeacher) {
              const matchesClass =
                uniqueClassIds.length === 0 ||
                uniqueClassIds.includes(tAss.classId) ||
                studentClassNames.some(
                  (cn) =>
                    (tAss.className || "").toLowerCase().includes(cn.toLowerCase()) ||
                    cn.toLowerCase().includes((tAss.className || "").toLowerCase())
                );

              if (matchesClass && !apiAssignments.some((a) => a.title === tAss.title || a.id === tAss.id)) {
                localAssignments.push({
                  id: tAss.id,
                  title: tAss.title,
                  className: tAss.className || (myClasses[0]?.name || "Lớp học"),
                  classId: tAss.classId,
                  durationMin: tAss.durationMin || 45,
                  dueAt: tAss.dueAt || "28/10/2026 23:59",
                  totalQuestions: tAss.totalQuestions || 10,
                  totalPoints: tAss.totalPoints || 100,
                  hasAttempted: false,
                  latestScore: null,
                  status: "OPEN",
                  attemptId: tAss.id,
                });
              }
            }
          } catch (e) {}
        }

        const combined = [...apiAssignments, ...localAssignments];
        setAssignments(combined);
      } catch (err) {
        console.error("Failed to fetch assignments:", err);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, [currentUser, myClasses]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      // Tab filter
      if (activeTab === "OPEN" && a.status !== "OPEN") return false;
      if (activeTab === "SUBMITTED" && a.status !== "SUBMITTED") return false;
      if (activeTab === "GRADED" && a.status !== "GRADED") return false;

      // Class filter
      if (classFilter !== "ALL" && a.className !== classFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(query) ||
          a.className.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [assignments, activeTab, classFilter, searchQuery]);

  // Unique class names
  const classNames = useMemo(() => {
    const set = new Set<string>();
    assignments.forEach((a) => set.add(a.className));
    return Array.from(set);
  }, [assignments]);

  // KPI stats
  const stats = useMemo(() => {
    const total = assignments.length;
    const open = assignments.filter((a) => a.status === "OPEN").length;
    const graded = assignments.filter((a) => a.status === "GRADED").length;
    const scores = assignments
      .filter((a) => a.latestScore !== null)
      .map((a) => a.latestScore as number);
    const avgScore = scores.length
      ? (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1)
      : "—";

    return { total, open, graded, avgScore };
  }, [assignments]);

  // Handle Room PIN submission
  const handleJoinByPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    const cleanPin = roomPinInput.trim().toUpperCase();
    if (!cleanPin) {
      setPinError("Vui lòng nhập mã PIN hoặc dán link phòng thi");
      return;
    }

    // Direct url pasted
    if (cleanPin.includes("/s/attempts/")) {
      router.push(cleanPin);
      return;
    }

    // Match assignment by pin or id
    const found = assignments.find(
      (a) =>
        a.id.toUpperCase().includes(cleanPin) ||
        cleanPin.includes(a.id.slice(-4).toUpperCase())
    );

    if (found) {
      router.push(`/s/attempts/${found.id}`);
    } else {
      // Navigate to generic attempt preview
      router.push(`/s/attempts/preview?pin=${encodeURIComponent(cleanPin)}`);
    }
  };

  if (!loading && classesCount === 0 && assignments.length === 0) {
    return (
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-10 sm:p-14 text-center shadow-2xs space-y-4 max-w-2xl mx-auto my-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-[#FAF7F0] text-[#315E48] border border-[#E5DEC9] flex items-center justify-center mx-auto shadow-2xs">
          <FileCheck2 className="w-8 h-8 text-[#204434]" />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-xl text-[#204434]">
            Chưa có bài tập & phòng thi
          </h3>
          <p className="text-xs text-[#315E48] leading-relaxed max-w-md mx-auto">
            Bạn chưa tham gia lớp học nào nên chưa có bài tập, bài thi trắc nghiệm hay đề kiểm tra định kỳ được giao. Hãy nhập mã mời của lớp để nhận bài tập từ giáo viên!
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => (onOpenJoinModal ? onOpenJoinModal() : onNavigateToTab?.("classes"))}
            className="px-6 py-3 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-md shadow-[#204434]/15 inline-flex items-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
            <span>Tham gia lớp học ngay</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* =================================================================== */}
      {/* 1. HEADER & KHỐI NHẬP MÃ PIN PHÒNG THI NHANH */}
      {/* =================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#204434]">
              Bài tập & Phòng thi trực tuyến
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] text-xs font-semibold border border-[#204434]/20">
              {stats.open} bài cần làm
            </span>
          </div>
          <p className="text-xs text-[#315E48] mt-1">
            Làm bài tập thầy cô giao, thi trực tuyến qua mã PIN và xem lại kết quả chi tiết kèm lời giải.
          </p>
        </div>

        {/* Form nhập Mã PIN phòng thi trực tiếp */}
        <form
          onSubmit={handleJoinByPin}
          className="flex items-center gap-2 bg-[#FFFCF6] border border-[#BC9B6B]/60 p-1.5 rounded-2xl shadow-2xs w-full lg:w-auto"
        >
          <div className="flex items-center gap-2 pl-2">
            <Key className="w-4 h-4 text-[#8F6D3B]" />
            <input
              type="text"
              placeholder="Nhập mã PIN (VD: HSK-6892)..."
              value={roomPinInput}
              onChange={(e) => {
                setRoomPinInput(e.target.value);
                setPinError("");
              }}
              className="bg-transparent text-xs text-[#204434] font-mono font-bold placeholder-[#315E48]/50 focus:outline-hidden w-44 sm:w-56 uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-[#BC9B6B]" />
            <span>Vào thi ngay</span>
          </button>
        </form>
      </div>

      {pinError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{pinError}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. 4 THẺ THỐNG KÊ KPI BÀI TẬP */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-1">
          <span className="text-xs text-[#315E48] font-medium block">Tổng số bài tập</span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#204434]">
            {stats.total}
          </div>
          <span className="text-[11px] text-[#315E48]">Được giao trong kỳ</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#FFFCF6] border border-amber-200 shadow-2xs space-y-1">
          <span className="text-xs text-amber-800 font-medium block">Cần nộp ngay</span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#8F6D3B]">
            {stats.open}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Chưa hoàn thành</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#FFFCF6] border border-emerald-200 shadow-2xs space-y-1">
          <span className="text-xs text-emerald-800 font-medium block">Đã có điểm</span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">
            {stats.graded}
          </div>
          <span className="text-[11px] text-emerald-700">Đã chấm & xem lời giải</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-1">
          <span className="text-xs text-[#315E48] font-medium block">Điểm trung bình</span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#204434]">
            {stats.avgScore} <span className="text-base font-normal text-[#315E48]">/ 10</span>
          </div>
          <span className="text-[11px] text-[#315E48]">Tất cả bài đã chấm</span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. THANH TÌM KIẾM, LỌC LỚP & TABS PHÂN LOẠI */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "ALL", label: `Tất cả (${assignments.length})` },
            { id: "OPEN", label: `Cần làm (${stats.open})` },
            { id: "GRADED", label: `Đã có điểm (${stats.graded})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? "bg-[#204434] text-white shadow-xs"
                  : "bg-[#FFFCF6] text-[#315E48] border border-[#E5DEC9] hover:bg-[#FAF7F0] hover:text-[#204434]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Class Filter */}
        <div className="flex items-center gap-2">
          {classNames.length > 1 && (
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs text-[#204434] focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Tất cả lớp học</option>
              {classNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8ea394] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên bài tập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-xl pl-9 pr-3 py-2 text-xs text-[#204434] focus:outline-hidden w-48 sm:w-60 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. DANH SÁCH BÀI TẬP & ĐỀ THI */}
      {/* =================================================================== */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#315E48] bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9]">
          <div className="inline-block w-6 h-6 border-2 border-[#204434] border-t-transparent rounded-full animate-spin mb-2" />
          <p>Đang tải danh sách bài tập từ lớp học...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFCF6] rounded-3xl border border-[#E5DEC9] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F0] text-[#315E48] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="font-serif font-bold text-base text-[#204434]">
            Chưa có bài tập nào được giao
          </h4>
          <p className="text-xs text-[#315E48] max-w-md mx-auto leading-relaxed">
            Bạn hiện chưa tham gia lớp học nào hoặc giáo viên phụ trách chưa giao bài tập mới. Hãy vào mục &quot;Lớp học của tôi&quot; để tham gia lớp hoặc nhập mã PIN phòng thi ở trên để vào thi ngay!
          </p>
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <button
              onClick={() => onNavigateToTab?.("classes")}
              className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-semibold shadow-xs hover:bg-[#183629] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Vào xem lớp học & tham gia lớp</span>
            </button>
            <button
              onClick={() => onNavigateToTab?.("practice")}
              className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
              <span>Phòng tự luyện tập tự do</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((assignment) => {
            const isOpen = assignment.status === "OPEN";
            const isGraded = assignment.status === "GRADED";

            return (
              <div
                key={assignment.id}
                className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#204434] transition flex flex-col justify-between space-y-4 group"
              >
                {/* Header Card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#8F6D3B] bg-[#FFFBF0] px-2.5 py-0.5 rounded-full border border-[#BC9B6B]/40">
                      {assignment.className}
                    </span>

                    {isOpen ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Hạn: {assignment.dueAt}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Đã có điểm</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#204434] group-hover:text-[#183629] leading-snug line-clamp-2">
                    {assignment.title}
                  </h3>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs text-[#315E48] pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#8ea394]" />
                      <span>{assignment.durationMin} phút</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#8ea394]" />
                      <span>{assignment.totalQuestions} câu</span>
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-[#8F6D3B]">
                      {assignment.totalPoints}đ
                    </span>
                  </div>
                </div>

                {/* Bottom Result / Action */}
                <div className="pt-3 border-t border-[#E5DEC9]/70 flex items-center justify-between gap-2">
                  {isGraded ? (
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-serif font-bold text-base">
                        {assignment.latestScore}
                      </div>
                      <div className="text-[11px] text-[#315E48]">
                        <span className="block font-bold text-[#204434]">Điểm bài thi</span>
                        <span>Đã lưu vào học bạ</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#315E48]">
                      <span className="block font-bold text-amber-800">Chưa nộp bài</span>
                      <span>Hãy hoàn thành trước hạn</span>
                    </div>
                  )}

                  {isOpen ? (
                    <Link
                      href={`/s/attempts/${assignment.id}`}
                      className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                    >
                      <span>Làm bài</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href={`/s/attempts/${assignment.attemptId || assignment.id}/result`}
                      className="px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#204434] text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#BC9B6B]" />
                      <span>Xem lại</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
