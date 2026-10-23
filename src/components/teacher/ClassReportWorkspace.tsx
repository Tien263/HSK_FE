"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Target,
  BarChart3,
  BookOpen,
  Users,
  Calendar,
  Filter,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronDown,
  Download,
  Search,
  ArrowUpRight,
  ExternalLink,
  Eye,
  Plus,
  X,
  Printer,
  Sparkles,
  HelpCircle,
  FolderArchive,
  GraduationCap,
  FileCheck2,
  QrCode,
  Maximize2,
  Copy,
  Check,
  ShieldAlert,
  Shuffle,
  Lock,
  Radio,
  Share2,
} from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  studentCount?: number;
  levelText?: string;
  track?: string;
}

interface ClassReportWorkspaceProps {
  classes: ClassItem[];
  currentUser?: any;
  showToast?: (msg: string) => void;
  onNavigateToTab?: (tab: string, extra?: any) => void;
}

export default function ClassReportWorkspace({
  classes,
  currentUser,
  showToast = () => {},
  onNavigateToTab,
}: ClassReportWorkspaceProps) {
  // ============================================================================
  // 1. FILTER STATES (Khu vực A)
  // ============================================================================
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes.length > 0 ? classes[0].id : "all"
  );
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "semester">("30d");
  const [contentType, setContentType] = useState<"all" | "lessons" | "exercises" | "exams">("all");
  const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState<string>("all");

  // Tab navigation state (Khu vực C: 5 Tabs)
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "exams" | "knowledge" | "progress"
  >("overview");

  // Sub-filter inside Tab 1 (Line chart view mode & Bar chart mode)
  const [trendViewMode, setTrendViewMode] = useState<"week" | "exam">("week");
  const [scoreDistMode, setScoreDistMode] = useState<"all" | "exam1" | "exam2">("all");

  // Modals & Drawers
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<any | null>(null);
  const [selectedKnowledgeForModal, setSelectedKnowledgeForModal] = useState<any | null>(null);

  // QR Code & Live Exam Room Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrAssignment, setQrAssignment] = useState<any | null>(null);
  const [isQrFullscreen, setIsQrFullscreen] = useState(false);
  const [copiedQrLink, setCopiedQrLink] = useState(false);

  // Search input for Tab 2 (Students)
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentOverdueOnly, setStudentOverdueOnly] = useState(false);

  // Loading & Real Backend Data State
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [hasRealData, setHasRealData] = useState(true);

  // Dynamic state loaded from /api/v1/reports/class/[id]
  const [dynamicReportData, setDynamicReportData] = useState<any | null>(null);

  // ============================================================================
  // 2. FETCH REAL REPORT DATA FROM DATABASE
  // ============================================================================
  const fetchReportData = async (classId: string, time: string, type: string) => {
    setIsLoadingData(true);
    try {
      const res = await fetch(
        `/api/v1/reports/class/${classId}?timeRange=${time}&contentType=${type}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHasRealData(data.hasData !== false);
          setDynamicReportData(data);
          return;
        }
      }
    } catch (err) {
      console.error("Error loading class report data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchReportData(selectedClassId, timeRange, contentType);
  }, [selectedClassId, timeRange, contentType]);

  // Selected Class object
  const currentClass = useMemo(() => {
    if (selectedClassId === "all") {
      return {
        id: "all",
        name: "Toàn bộ lớp phụ trách",
        studentCount: classes.reduce((acc, c) => acc + (c.studentCount || 0), 0) || 22,
        levelText: "Tổng hợp",
      };
    }
    return classes.find((c) => c.id === selectedClassId) || {
      id: "c1",
      name: "Lớp HSK1 - K01",
      studentCount: 22,
      levelText: "HSK 1",
    };
  }, [classes, selectedClassId]);

  const totalStudents = dynamicReportData?.classInfo?.studentCount || currentClass.studentCount || 22;

  // KPI Metrics (Khu vực B) derived from real backend data
  const kpiData = useMemo(() => {
    if (dynamicReportData?.kpi) {
      return dynamicReportData.kpi;
    }
    return {
      completionRate: 84.3,
      completionGrowth: "+6.2%",
      averageScore: "8.1",
      examCount: 4,
      weakTopic: "Câu chữ 把 & Bổ ngữ kết quả",
      weakTopicPct: "28%",
      overdueStudentsCount: Math.min(7, totalStudents),
      totalStudents: totalStudents,
    };
  }, [dynamicReportData, totalStudents]);

  // Tab 1: Donut Chart Slices (Submission Status)
  const donutData = useMemo(() => {
    if (dynamicReportData?.donutData) {
      return dynamicReportData.donutData;
    }
    const submittedOnTime = Math.round(totalStudents * 0.68) || 15;
    const submittedLate = Math.round(totalStudents * 0.14) || 3;
    const inProgress = Math.round(totalStudents * 0.09) || 2;
    const unsubmitted = Math.max(0, totalStudents - submittedOnTime - submittedLate - inProgress);
    return {
      onTime: { count: submittedOnTime, pct: 68 },
      late: { count: submittedLate, pct: 14 },
      inProgress: { count: inProgress, pct: 9 },
      unsubmitted: { count: unsubmitted, pct: 9 },
    };
  }, [dynamicReportData, totalStudents]);

  // Tab 1: Bar Chart Distribution (Score Distribution)
  const scoreDistBars = useMemo(() => {
    const buckets = dynamicReportData?.distBuckets || { "0-2": 2, "2-4": 3, "4-6": 5, "6-8": 8, "8-10": 4 };
    return [
      { range: "0-2", count: buckets["0-2"] || 0, isPeak: false },
      { range: "2-4", count: buckets["2-4"] || 0, isPeak: false },
      { range: "4-6", count: buckets["4-6"] || 0, isPeak: false },
      { range: "6-8", count: buckets["6-8"] || 0, isPeak: true },
      { range: "8-10", count: buckets["8-10"] || 0, isPeak: false },
    ];
  }, [dynamicReportData]);

  // Tab 1: Top 5 Tiến bộ tốt nhất
  const topStudentsProgress = useMemo(() => {
    if (dynamicReportData?.topProgress && dynamicReportData.topProgress.length > 0) {
      return dynamicReportData.topProgress;
    }
    return [
      { id: "st-1", rank: 1, name: "Trần Minh Anh", avatar: "/theme/avatar-teacher.jpg", prevScore: 6.1, currScore: 8.8, diff: "+2.7" },
      { id: "st-2", rank: 2, name: "Lê Hoàng Nam", avatar: "/theme/avatar-teacher.jpg", prevScore: 5.9, currScore: 8.1, diff: "+2.2" },
      { id: "st-3", rank: 3, name: "Nguyễn Thu Hà", avatar: "/theme/avatar-teacher.jpg", prevScore: 6.5, currScore: 8.6, diff: "+2.1" },
      { id: "st-4", rank: 4, name: "Phạm Quang Huy", avatar: "/theme/avatar-teacher.jpg", prevScore: 6.0, currScore: 7.8, diff: "+1.8" },
      { id: "st-5", rank: 5, name: "Đỗ Mai Linh", avatar: "/theme/avatar-teacher.jpg", prevScore: 6.8, currScore: 8.5, diff: "+1.7" },
    ];
  }, [dynamicReportData]);

  // Tab 1: Top 5 Chủ điểm cần củng cố
  const topWeakTopics = useMemo(() => {
    if (dynamicReportData?.weakTopics && dynamicReportData.weakTopics.length > 0) {
      return dynamicReportData.weakTopics;
    }
    return [
      { id: "wt-1", rank: 1, title: "Câu chữ 把", errorRate: "31%", attemptsCount: 45, lessonSource: "HSK 1 - Bài 5: 语法专题", description: "Học sinh thường nhầm lẫn vị trí của phó từ chỉ mức độ và động từ mang tân ngữ nơi chốn." },
      { id: "wt-2", rank: 2, title: "Bổ ngữ kết quả", errorRate: "28%", attemptsCount: 40, lessonSource: "HSK 1 - Bài 6: 结果补语", description: "Nhầm lẫn giữa bổ ngữ kết quả '到', '见' và bổ ngữ trạng thái '得'." },
      { id: "wt-3", rank: 3, title: "Từ vựng chỉ thời gian", errorRate: "22%", attemptsCount: 55, lessonSource: "HSK 1 - Bài 3: 时间与日程", description: "Thứ tự sắp xếp từ lớn đến bé: Năm -> Tháng -> Ngày -> Buổi -> Giờ." },
      { id: "wt-4", rank: 4, title: "Cấu trúc 还有", errorRate: "18%", attemptsCount: 38, lessonSource: "HSK 1 - Bài 4: 还有与也", description: "Chưa phân biệt được cách bổ sung ý phụ trong câu liệt kê." },
      { id: "wt-5", rank: 5, title: "Phân biệt 在 / 再", errorRate: "16%", attemptsCount: 42, lessonSource: "HSK 1 - Bài 2: 在与再辨析", description: "Nhầm lẫn giữa phó từ lặp lại hành động trong tương lai (再) và giới từ chỉ vị trí (在)." },
    ];
  }, [dynamicReportData]);

  // Tab 1: Bài tập / Đề kiểm tra nổi bật
  const featuredAssignments = useMemo(() => {
    if (dynamicReportData?.featuredAssignments && dynamicReportData.featuredAssignments.length > 0) {
      return dynamicReportData.featuredAssignments;
    }
    return [
      { id: "fa-1", title: "Bài 5 – 今天我休息", submittedRatio: `18/${totalStudents}`, avgScore: 8.4, status: "COMPLETED", statusText: "Đã hoàn thành" },
      { id: "fa-2", title: "HSK1 Đề 01", submittedRatio: `${totalStudents}/${totalStudents}`, avgScore: 8.1, status: "COMPLETED", statusText: "Đã hoàn thành" },
      { id: "fa-3", title: "Luyện viết chữ Hán", submittedRatio: `15/${totalStudents}`, avgScore: 7.6, status: "PENDING", statusText: `Còn 7 chưa nộp` },
      { id: "fa-4", title: "Nghe hiểu – Bài 6", submittedRatio: `20/${totalStudents}`, avgScore: 8.7, status: "COMPLETED", statusText: "Đã hoàn thành" },
      { id: "fa-5", title: "Từ vựng – Bài 4", submittedRatio: `19/${totalStudents}`, avgScore: 7.9, status: "PENDING", statusText: `Còn 3 chưa nộp` },
    ];
  }, [dynamicReportData, totalStudents]);

  // Tab 2: Danh sách đầy đủ học viên
  const fullStudentsList = useMemo(() => {
    if (dynamicReportData?.students && dynamicReportData.students.length > 0) {
      return dynamicReportData.students;
    }
    return [
      { id: "s1", name: "Trần Minh Anh", assignedCount: 8, submittedCount: 8, overdueCount: 0, avgScore: "8.8", completionRate: 100, growth: "+2.7", supportStatus: "Tốt", email: "minhanh.tran@gmail.com" },
      { id: "s2", name: "Lê Hoàng Nam", assignedCount: 8, submittedCount: 7, overdueCount: 1, avgScore: "8.1", completionRate: 87.5, growth: "+2.2", supportStatus: "Cần nhắc nộp bài", email: "hoangnam.le@gmail.com" },
      { id: "s3", name: "Nguyễn Thu Hà", assignedCount: 8, submittedCount: 8, overdueCount: 0, avgScore: "8.6", completionRate: 100, growth: "+2.1", supportStatus: "Tốt", email: "thuha.nguyen@gmail.com" },
      { id: "s4", name: "Phạm Quang Huy", assignedCount: 8, submittedCount: 6, overdueCount: 2, avgScore: "7.8", completionRate: 75, growth: "+1.8", supportStatus: "Quá hạn 2 bài", email: "quanghuy.p@gmail.com" },
      { id: "s5", name: "Đỗ Mai Linh", assignedCount: 8, submittedCount: 8, overdueCount: 0, avgScore: "8.5", completionRate: 100, growth: "+1.7", supportStatus: "Tốt", email: "mailinh.do@gmail.com" },
      { id: "s6", name: "Hoàng Gia Bảo", assignedCount: 8, submittedCount: 5, overdueCount: 3, avgScore: "6.9", completionRate: 62.5, growth: "+0.5", supportStatus: "Cần hỗ trợ ngữ pháp", email: "giabao.hoang@gmail.com" },
      { id: "s7", name: "Vũ Phương Thảo", assignedCount: 8, submittedCount: 7, overdueCount: 1, avgScore: "8.0", completionRate: 87.5, growth: "+1.2", supportStatus: "Đang theo sát", email: "phuongthao.vu@gmail.com" },
    ];
  }, [dynamicReportData]);

  const filteredStudents = fullStudentsList.filter((s: any) => {
    if (studentSearchQuery && !s.name.toLowerCase().includes(studentSearchQuery.toLowerCase())) {
      return false;
    }
    if (studentOverdueOnly && s.overdueCount === 0) {
      return false;
    }
    return true;
  });

  // Helper copy QR link
  const handleCopyQrLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedQrLink(true);
    setTimeout(() => setCopiedQrLink(false), 2000);
    showToast("Đã sao chép liên kết phòng thi!");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* =================================================================== */}
      {/* KHU VỰC A: HEADER & NÚT XUẤT BÁO CÁO PDF */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-[#204434] tracking-tight">
              Báo cáo kết quả học tập theo lớp
            </h2>
            {isLoadingData && (
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" title="Đang đồng bộ..." />
            )}
          </div>
          <p className="text-xs text-[#315E48] mt-0.5">
            Tổng hợp tỷ lệ hoàn thành bài tập, điểm trung bình và phân tích lỗi sai phổ biến.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Nút Tạo mã QR Phòng Thi Nhanh */}
          <button
            onClick={() => {
              setQrAssignment({
                id: featuredAssignments[0]?.id || "exam-01",
                title: featuredAssignments[0]?.title || "Phòng thi chuẩn HSK 3.0",
                className: currentClass.name,
              });
              setIsQrModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer transition"
          >
            <QrCode className="w-4 h-4 text-[#BC9B6B]" />
            <span>Mã QR phòng thi</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo PDF</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* KHU VỰC B: BỐN THẺ KPI THỐNG KÊ ĐẦU TRANG */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Tỷ lệ hoàn thành trung bình */}
        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs relative flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#315E48] font-medium">Tỷ lệ hoàn thành trung bình</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold font-serif text-[#204434]">
              {kpiData.completionRate}%
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <span>↑ Tăng {kpiData.completionGrowth} so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Thẻ 2: Điểm kiểm tra trung bình */}
        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs relative flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#315E48] font-medium">Điểm kiểm tra trung bình</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold font-serif text-[#204434]">
              {kpiData.averageScore} <span className="text-lg font-normal text-[#315E48]">/ 10</span>
            </div>
            <div className="text-[11px] text-[#315E48] mt-1">
              Dựa trên {kpiData.examCount} bài kiểm tra gần nhất
            </div>
          </div>
        </div>

        {/* Thẻ 3: Chủ điểm ngữ pháp cần củng cố */}
        <div
          onClick={() => setActiveTab("knowledge")}
          className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs relative flex flex-col justify-between cursor-pointer hover:border-[#9D493E] transition group"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#315E48] font-medium">Chủ điểm ngữ pháp cần củng cố</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-bold text-[#9D493E] leading-snug line-clamp-1 group-hover:underline">
              {kpiData.weakTopic}
            </div>
            <div className="text-[11px] text-[#315E48] mt-1">
              {kpiData.weakTopicPct} học viên nhầm lẫn cấu trúc
            </div>
          </div>
        </div>

        {/* Thẻ 4: Học viên chưa nộp đủ */}
        <div
          onClick={() => {
            setActiveTab("students");
            setStudentOverdueOnly(true);
          }}
          className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs relative flex flex-col justify-between cursor-pointer hover:border-[#204434] transition group"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#315E48] font-medium">Học viên chưa nộp đủ</span>
            <div className="w-8 h-8 rounded-full bg-[#FAF7F0] text-gray-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold font-serif text-[#204434] group-hover:underline">
              {kpiData.overdueStudentsCount} <span className="text-lg font-normal text-[#315E48]">/ {kpiData.totalStudents}</span>
            </div>
            <div className="text-[11px] text-[#315E48] mt-1">
              Cần theo dõi và nhắc nhở
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* KHU VỰC BỘ LỌC (4 DROPDOWNS TRÊN MỘT HÀNG) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Bộ lọc 1: Lớp học */}
        <div>
          <label className="block text-xs font-semibold text-[#204434] mb-1">Lớp học</label>
          <div className="relative">
            <FolderArchive className="w-4 h-4 text-[#8ea394] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-[#FFFCF6] border border-[#E5DEC9] rounded-2xl pl-10 pr-8 py-2 text-xs font-medium text-[#204434] appearance-none cursor-pointer focus:outline-hidden focus:border-[#204434] shadow-2xs"
            >
              <option value="all">Toàn bộ lớp học ({classes.length} lớp)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.studentCount || 22} học viên)
                </option>
              ))}
              {classes.length === 0 && (
                <option value="c1">Lớp HSK1 - K01 (22 học viên)</option>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-[#8ea394] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Bộ lọc 2: Thời gian */}
        <div>
          <label className="block text-xs font-semibold text-[#204434] mb-1">Thời gian</label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-[#8ea394] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="w-full bg-[#FFFCF6] border border-[#E5DEC9] rounded-2xl pl-10 pr-8 py-2 text-xs font-medium text-[#204434] appearance-none cursor-pointer focus:outline-hidden focus:border-[#204434] shadow-2xs"
            >
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
              <option value="90d">90 ngày qua</option>
              <option value="semester">Học kỳ hiện tại</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#8ea394] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Bộ lọc 3: Loại nội dung */}
        <div>
          <label className="block text-xs font-semibold text-[#204434] mb-1">Loại nội dung</label>
          <div className="relative">
            <FileText className="w-4 h-4 text-[#8ea394] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as any)}
              className="w-full bg-[#FFFCF6] border border-[#E5DEC9] rounded-2xl pl-10 pr-8 py-2 text-xs font-medium text-[#204434] appearance-none cursor-pointer focus:outline-hidden focus:border-[#204434] shadow-2xs"
            >
              <option value="all">Tất cả</option>
              <option value="lessons">Bài học được giao</option>
              <option value="exercises">Bài tập</option>
              <option value="exams">Bài kiểm tra</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#8ea394] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Bộ lọc 4: Bài kiểm tra / Bài tập */}
        <div>
          <label className="block text-xs font-semibold text-[#204434] mb-1">Bài kiểm tra / Bài tập</label>
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-[#8ea394] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedAssignmentFilter}
              onChange={(e) => setSelectedAssignmentFilter(e.target.value)}
              className="w-full bg-[#FFFCF6] border border-[#E5DEC9] rounded-2xl pl-10 pr-8 py-2 text-xs font-medium text-[#204434] appearance-none cursor-pointer focus:outline-hidden focus:border-[#204434] shadow-2xs"
            >
              <option value="all">Tất cả</option>
              {featuredAssignments.map((fa: any) => (
                <option key={fa.id} value={fa.id}>
                  {fa.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#8ea394] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5 TABS ĐIỀU HƯỚNG BÁO CÁO (Khu vực C) */}
      {/* =================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E5DEC9]/80 text-xs">
        {[
          { key: "overview", label: "Tổng quan lớp học" },
          { key: "students", label: "Kết quả từng học viên" },
          { key: "exams", label: "Phân tích bài tập & kiểm tra" },
          { key: "knowledge", label: "Phân tích kiến thức & lỗi sai" },
          { key: "progress", label: "Tiến độ bài học & nộp bài" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-2xl font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-[#204434] text-white shadow-2xs"
                : "bg-[#FFFCF6] border border-[#E5DEC9] text-[#315E48] hover:bg-[#FAF7F0]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: TỔNG QUAN LỚP HỌC (LAYOUT THEO ĐÚNG MOCKUP ẢNH) */}
      {/* =================================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fadeIn">
          {/* HÀNG 1: 3 BIỂU ĐỒ (3 CARDS) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 1. Biểu đồ: Xu hướng điểm trung bình */}
            <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/50">
                <h4 className="font-serif font-bold text-sm text-[#204434]">Xu hướng điểm trung bình</h4>
                <div className="relative">
                  <select
                    value={trendViewMode}
                    onChange={(e) => setTrendViewMode(e.target.value as any)}
                    className="bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-2.5 py-1 text-[11px] font-semibold text-[#204434] appearance-none pr-6 cursor-pointer"
                  >
                    <option value="week">Theo tuần</option>
                    <option value="exam">Theo bài kiểm tra</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-[#8ea394] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Line Chart Canvas / SVG */}
              <div className="mt-4 relative h-48 w-full flex flex-col justify-end">
                <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible">
                  {[10, 8, 6, 4, 2, 0].map((val, idx) => {
                    const y = 20 + idx * 28;
                    return (
                      <g key={val}>
                        <text x="10" y={y + 4} fill="#8ea394" fontSize="10" fontFamily="sans-serif">
                          {val}
                        </text>
                        <line x1="30" y1={y} x2="390" y2={y} stroke="#E5DEC9" strokeDasharray="3 3" />
                      </g>
                    );
                  })}

                  <path
                    d="M 50 120 L 130 92 L 210 102 L 290 76 L 370 54"
                    fill="none"
                    stroke="#204434"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {[
                    { cx: 50, cy: 120, label: "Tuần 1", val: "6.0" },
                    { cx: 130, cy: 92, label: "Tuần 2", val: "7.4" },
                    { cx: 210, cy: 102, label: "Tuần 3", val: "7.0" },
                    { cx: 290, cy: 76, label: "Tuần 4", val: "8.1", highlight: true },
                    { cx: 370, cy: 54, label: "Tuần 5", val: "9.0" },
                  ].map((pt) => (
                    <g key={pt.label}>
                      <circle cx={pt.cx} cy={pt.cy} r={pt.highlight ? 5 : 4} fill="#204434" stroke="#FFF" strokeWidth="2" />
                      {pt.highlight && (
                        <g>
                          <rect x={pt.cx - 32} y={pt.cy - 34} width="64" height="26" rx="6" fill="#204434" />
                          <text x={pt.cx} y={pt.cy - 22} textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                            Tuần 4
                          </text>
                          <text x={pt.cx} y={pt.cy - 12} textAnchor="middle" fill="#A7F3D0" fontSize="9">
                            8.1 điểm
                          </text>
                          <polygon
                            points={`${pt.cx - 4},${pt.cy - 8} ${pt.cx + 4},${pt.cy - 8} ${pt.cx},${pt.cy - 4}`}
                            fill="#204434"
                          />
                        </g>
                      )}
                      <text x={pt.cx} y="175" textAnchor="middle" fill="#315E48" fontSize="10">
                        {pt.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* 2. Biểu đồ: Tình trạng nộp bài của học viên */}
            <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs flex flex-col justify-between">
              <div className="pb-3 border-b border-[#E5DEC9]/50">
                <h4 className="font-serif font-bold text-sm text-[#204434]">Tình trạng nộp bài của học viên</h4>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#FAF7F0" strokeWidth="16" />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#15803d"
                      strokeWidth="16"
                      strokeDasharray="162.3 238.76"
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#eab308"
                      strokeWidth="16"
                      strokeDasharray="33.4 238.76"
                      strokeDashoffset="-162.3"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="16"
                      strokeDasharray="21.5 238.76"
                      strokeDashoffset="-195.7"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="16"
                      strokeDasharray="21.5 238.76"
                      strokeDashoffset="-217.2"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-bold font-serif text-[#204434] leading-none">
                      {totalStudents}
                    </span>
                    <span className="text-[10px] text-[#315E48] mt-0.5">học viên</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#15803d]" />
                    <span className="text-[#315E48]">Đã nộp đúng hạn</span>
                    <span className="font-bold text-[#204434] ml-auto">
                      {donutData.onTime.count} ({donutData.onTime.pct}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#eab308]" />
                    <span className="text-[#315E48]">Nộp muộn</span>
                    <span className="font-bold text-[#204434] ml-auto">
                      {donutData.late.count} ({donutData.late.pct}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" />
                    <span className="text-[#315E48]">Đang làm</span>
                    <span className="font-bold text-[#204434] ml-auto">
                      {donutData.inProgress.count} ({donutData.inProgress.pct}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" />
                    <span className="text-[#315E48]">Chưa nộp</span>
                    <span className="font-bold text-[#204434] ml-auto">
                      {donutData.unsubmitted.count} ({donutData.unsubmitted.pct}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Biểu đồ: Phân bổ điểm học viên */}
            <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/50">
                <h4 className="font-serif font-bold text-sm text-[#204434]">Phân bổ điểm học viên</h4>
                <div className="relative">
                  <select
                    value={scoreDistMode}
                    onChange={(e) => setScoreDistMode(e.target.value as any)}
                    className="bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-2.5 py-1 text-[11px] font-semibold text-[#204434] appearance-none pr-6 cursor-pointer"
                  >
                    <option value="all">Tất cả bài</option>
                    <option value="exam1">Bài 5 - 今天我休息</option>
                    <option value="exam2">HSK1 Đề 01</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-[#8ea394] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="mt-4 relative h-48 w-full flex flex-col justify-end">
                <svg viewBox="0 0 350 180" className="w-full h-full overflow-visible">
                  {[10, 8, 6, 4, 2, 0].map((val, idx) => {
                    const y = 20 + idx * 24;
                    return (
                      <g key={val}>
                        <text x="5" y={y + 4} fill="#8ea394" fontSize="10" fontFamily="sans-serif">
                          {val}
                        </text>
                        <line x1="25" y1={y} x2="340" y2={y} stroke="#E5DEC9" strokeDasharray="3 3" />
                      </g>
                    );
                  })}

                  {scoreDistBars.map((bar, idx) => {
                    const x = 50 + idx * 60;
                    const barHeight = (bar.count / 10) * 120;
                    const y = 140 - barHeight;

                    return (
                      <g key={bar.range}>
                        <text
                          x={x + 16}
                          y={y - 6}
                          textAnchor="middle"
                          fill="#204434"
                          fontSize="11"
                          fontWeight="bold"
                        >
                          {bar.count}
                        </text>

                        <rect
                          x={x}
                          y={y}
                          width="32"
                          height={barHeight}
                          rx="4"
                          fill={bar.isPeak ? "#204434" : "#749B86"}
                          className="hover:opacity-90 transition cursor-pointer"
                        />

                        <text x={x + 16} y="158" textAnchor="middle" fill="#315E48" fontSize="10">
                          {bar.range}
                        </text>
                      </g>
                    );
                  })}

                  <text x="180" y="176" textAnchor="middle" fill="#8ea394" fontSize="10">
                    Khoảng điểm (thang 10)
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* HÀNG 2: 3 BẢNG PHÂN TÍCH (3 CARDS) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 1. Bảng: Top 5 học viên có tiến bộ tốt nhất */}
            <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#204434]">
                  Top 5 học viên có tiến bộ tốt nhất
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5DEC9] text-[#8ea394] font-semibold">
                      <th className="pb-2 w-6">#</th>
                      <th className="pb-2">Học viên</th>
                      <th className="pb-2 text-center leading-tight">Điểm TB<br />tháng trước</th>
                      <th className="pb-2 text-center leading-tight">Điểm TB<br />hiện tại</th>
                      <th className="pb-2 text-right">Tăng trưởng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DEC9]/40">
                    {topStudentsProgress.map((st: any) => (
                      <tr key={st.id} className="hover:bg-[#FAF7F0]/60 transition">
                        <td className="py-2.5 font-bold text-[#8ea394]">{st.rank}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-[#204434]/10 shrink-0 relative">
                              <Image src={st.avatar || "/theme/avatar-teacher.jpg"} alt={st.name} fill className="object-cover" />
                            </div>
                            <span className="font-bold text-[#204434] truncate">{st.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-center text-[#315E48]">{st.prevScore}</td>
                        <td className="py-2.5 text-center font-bold text-[#204434]">{st.currScore}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-700">
                          ↑ {st.diff}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Bảng: Top 5 chủ điểm cần củng cố */}
            <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#204434]">
                  Top 5 chủ điểm cần củng cố
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5DEC9] text-[#8ea394] font-semibold">
                      <th className="pb-2 w-6">#</th>
                      <th className="pb-2">Chủ điểm kiến thức</th>
                      <th className="pb-2 text-center">Tỷ lệ sai</th>
                      <th className="pb-2 text-center leading-tight">Số lượt<br />trả lời</th>
                      <th className="pb-2 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DEC9]/40">
                    {topWeakTopics.map((wt: any) => (
                      <tr key={wt.id} className="hover:bg-[#FAF7F0]/60 transition">
                        <td className="py-2.5 font-bold text-[#8ea394]">{wt.rank}</td>
                        <td className="py-2.5 font-bold text-[#204434]">{wt.title}</td>
                        <td className="py-2.5 text-center font-bold text-red-600">{wt.errorRate}</td>
                        <td className="py-2.5 text-center text-[#315E48]">{wt.attemptsCount}</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => setSelectedKnowledgeForModal(wt)}
                            className="px-2.5 py-1 rounded-lg border border-[#E5DEC9] bg-white text-[#204434] text-[11px] font-semibold hover:bg-[#FAF7F0] transition cursor-pointer"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Bảng: Bài tập / Đề kiểm tra nổi bật */}
            <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1">
                <h4 className="font-serif font-bold text-sm text-[#204434]">
                  Bài tập / Đề kiểm tra nổi bật
                </h4>
                <button
                  onClick={() => onNavigateToTab?.("assignments")}
                  className="text-xs text-[#204434] hover:underline font-semibold flex items-center gap-0.5"
                >
                  <span>Xem tất cả</span>
                  <span>&rarr;</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5DEC9] text-[#8ea394] font-semibold">
                      <th className="pb-2">Tên bài / Đề</th>
                      <th className="pb-2 text-center">Đã nộp / Tổng</th>
                      <th className="pb-2 text-center">Điểm TB</th>
                      <th className="pb-2 text-right">Mã QR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DEC9]/40">
                    {featuredAssignments.map((fa: any) => (
                      <tr key={fa.id} className="hover:bg-[#FAF7F0]/60 transition">
                        <td className="py-2.5 font-bold text-[#204434] truncate max-w-[120px]" title={fa.title}>
                          {fa.title}
                        </td>
                        <td className="py-2.5 text-center text-[#315E48]">{fa.submittedRatio}</td>
                        <td className="py-2.5 text-center font-bold text-[#204434]">{fa.avgScore}</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => {
                              setQrAssignment(fa);
                              setIsQrModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#204434]/10 hover:bg-[#204434] text-[#204434] hover:text-white transition font-semibold text-[10px] cursor-pointer"
                            title="Tạo mã QR thi trực tiếp"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Mã QR</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* HÀNG 3: NHỮNG VẤN ĐỀ CẦN LƯU Ý (3 CARDS NGANG) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h4 className="font-serif font-bold text-sm text-[#204434]">Những vấn đề cần lưu ý</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => {
                  setActiveTab("students");
                  setStudentOverdueOnly(true);
                }}
                className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#9D493E] transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#204434] group-hover:text-red-700 transition">
                      {kpiData.overdueStudentsCount || 4} học viên chưa nộp bài tập
                    </h5>
                    <p className="text-[11px] text-red-600 mt-0.5">Đã quá hạn 3 ngày</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8ea394] group-hover:translate-x-1 transition-transform" />
              </div>

              <div
                onClick={() => onNavigateToTab?.("assignments")}
                className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-amber-600 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#204434] group-hover:text-amber-800 transition">
                      2 bài đang chờ chấm tay
                    </h5>
                    <p className="text-[11px] text-[#315E48] mt-0.5">Cần chấm điểm để cập nhật kết quả</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8ea394] group-hover:translate-x-1 transition-transform" />
              </div>

              <div
                onClick={() => setActiveTab("exams")}
                className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#204434] transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#204434] group-hover:text-sky-800 transition">
                      Câu 3 – Đề HSK1 Đề 01
                    </h5>
                    <p className="text-[11px] text-[#315E48] mt-0.5">Tỷ lệ sai cao (46%)</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8ea394] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: KẾT QUẢ TỪNG HỌC VIÊN */}
      {/* =================================================================== */}
      {activeTab === "students" && (
        <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-6 shadow-2xs space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5DEC9]/80">
            <div>
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Danh sách kết quả học tập ({filteredStudents.length} học viên)
              </h3>
              <p className="text-xs text-[#315E48]">Chi tiết tỷ lệ hoàn thành, điểm trung bình và bài quá hạn.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8ea394] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm học viên..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#204434] focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => setStudentOverdueOnly(!studentOverdueOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  studentOverdueOnly
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "bg-[#FAF7F0] border-[#E5DEC9] text-[#315E48]"
                }`}
              >
                {studentOverdueOnly ? "Đang lọc: Quá hạn" : "Lọc quá hạn"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F0] text-[#315E48] font-bold border-b border-[#E5DEC9]">
                  <th className="py-3 px-3">Học viên</th>
                  <th className="py-3 px-3 text-center">Bài được giao</th>
                  <th className="py-3 px-3 text-center">Đã nộp</th>
                  <th className="py-3 px-3 text-center">Quá hạn chưa nộp</th>
                  <th className="py-3 px-3 text-center">Điểm TB (thang 10)</th>
                  <th className="py-3 px-3 text-center">Tỷ lệ hoàn thành</th>
                  <th className="py-3 px-3 text-center">Thay đổi</th>
                  <th className="py-3 px-3 text-left">Trạng thái hỗ trợ</th>
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DEC9]/50">
                {filteredStudents.map((st: any) => (
                  <tr key={st.id} className="hover:bg-[#FAF7F0]/60 transition">
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-bold text-[#204434] block">{st.name}</span>
                        <span className="text-[10px] text-[#8ea394]">{st.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-[#315E48]">{st.assignedCount}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-800">{st.submittedCount}</td>
                    <td className="py-3 px-3 text-center font-bold text-red-600">{st.overdueCount}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#204434]">{st.avgScore}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 bg-white h-2 rounded-full overflow-hidden border border-[#E5DEC9]">
                          <div className="bg-[#204434] h-full" style={{ width: `${st.completionRate}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-[#204434]">{st.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700">↑ {st.growth}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        st.overdueCount > 0 ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {st.supportStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedStudentForDrawer(st)}
                        className="px-2.5 py-1 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#204434] hover:text-white transition font-semibold text-[11px] cursor-pointer"
                      >
                        Xem hồ sơ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: PHÂN TÍCH BÀI TẬP & KIỂM TRA */}
      {/* =================================================================== */}
      {activeTab === "exams" && (
        <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-6 shadow-2xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#204434]">
                Phân tích chi tiết đề kiểm tra: HSK1 Đề 01
              </h3>
              <p className="text-xs text-[#315E48]">Thống kê tỷ lệ đúng sai từng câu, dạng câu hỏi và trạng thái chấm.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#204434]">Chọn đề:</span>
              <select className="bg-white border border-[#E5DEC9] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#204434]">
                <option value="e1">HSK1 Đề 01 (Luyện thi tổng hợp)</option>
                <option value="e2">Bài 5 – 今天我休息</option>
                <option value="e3">Luyện viết chữ Hán cơ bản</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] text-center">
              <span className="text-[11px] text-[#315E48]">Được giao</span>
              <div className="text-xl font-bold font-serif text-[#204434] mt-0.5">{totalStudents}</div>
            </div>
            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] text-center">
              <span className="text-[11px] text-[#315E48]">Đã nộp</span>
              <div className="text-xl font-bold font-serif text-emerald-800 mt-0.5">{totalStudents}</div>
            </div>
            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] text-center">
              <span className="text-[11px] text-[#315E48]">Chờ chấm tay</span>
              <div className="text-xl font-bold font-serif text-amber-700 mt-0.5">2</div>
            </div>
            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] text-center">
              <span className="text-[11px] text-[#315E48]">Điểm TB</span>
              <div className="text-xl font-bold font-serif text-[#204434] mt-0.5">8.1</div>
            </div>
            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] text-center">
              <span className="text-[11px] text-[#315E48]">Cao nhất</span>
              <div className="text-xl font-bold font-serif text-emerald-800 mt-0.5">10.0</div>
            </div>
            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] text-center">
              <span className="text-[11px] text-[#315E48]">Thấp nhất</span>
              <div className="text-xl font-bold font-serif text-red-600 mt-0.5">6.2</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#204434]">Phân tích kết quả theo từng câu hỏi</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F0] text-[#315E48] font-bold border-b border-[#E5DEC9]">
                    <th className="py-2.5 px-3">STT</th>
                    <th className="py-2.5 px-3">Dạng câu hỏi</th>
                    <th className="py-2.5 px-3">Chủ điểm kiến thức</th>
                    <th className="py-2.5 px-3 text-center">Lượt làm</th>
                    <th className="py-2.5 px-3 text-center">Đúng</th>
                    <th className="py-2.5 px-3 text-center">Sai</th>
                    <th className="py-2.5 px-3 text-center">Tỷ lệ đúng</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DEC9]/50">
                  {[
                    { qNum: 1, type: "Trắc nghiệm 4 lựa chọn", topic: "Từ vựng nghề nghiệp", count: 22, correct: 20, wrong: 2, rate: "91%" },
                    { qNum: 2, type: "Điền từ vào chỗ trống", topic: "Giới từ 在 / 从", count: 22, correct: 18, wrong: 4, rate: "82%" },
                    { qNum: 3, type: "Sắp xếp câu hoàn chỉnh", topic: "Câu chữ 把", count: 22, correct: 12, wrong: 10, rate: "54%", isAlert: true },
                    { qNum: 4, type: "Nối từ / Cụm từ", topic: "Thành ngữ & Lượng từ", count: 22, correct: 19, wrong: 3, rate: "86%" },
                    { qNum: 5, type: "Viết chữ Hán (Ảnh chụp)", topic: "Quy tắc nét bút", count: 20, correct: 15, wrong: 5, rate: "75%" },
                  ].map((q) => (
                    <tr key={q.qNum} className={q.isAlert ? "bg-red-50/50" : "hover:bg-[#FAF7F0]/60"}>
                      <td className="py-2.5 px-3 font-bold text-[#204434]">Câu {q.qNum}</td>
                      <td className="py-2.5 px-3 text-[#315E48]">{q.type}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#204434]">{q.topic}</td>
                      <td className="py-2.5 px-3 text-center">{q.count}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{q.correct}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-red-600">{q.wrong}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`font-bold ${q.isAlert ? "text-red-700" : "text-emerald-800"}`}>
                          {q.rate}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => showToast(`Đã mở chi tiết bài làm câu số ${q.qNum}`)}
                          className="px-2.5 py-1 rounded-lg border border-[#E5DEC9] bg-white text-[#204434] font-semibold text-[11px] hover:bg-[#FAF7F0] cursor-pointer"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: PHÂN TÍCH KIẾN THỨC & LỖI SAI */}
      {/* =================================================================== */}
      {activeTab === "knowledge" && (
        <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-6 shadow-2xs space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#204434]">
              Phân tích kiến thức & Lập kế hoạch củng cố
            </h3>
            <p className="text-xs text-[#315E48]">
              Xác định nội dung học viên nhầm lẫn nhiều nhất, kết nối với Kho bài học và tạo đề luyện tập củng cố.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topWeakTopics.map((wt: any) => (
              <div
                key={wt.id}
                className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                      Tỷ lệ làm sai: {wt.errorRate} ({wt.attemptsCount} lượt làm)
                    </span>
                    <span className="text-[11px] text-[#8ea394] font-medium">{wt.lessonSource}</span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#204434] mt-2">{wt.title}</h4>
                  <p className="text-xs text-[#315E48] mt-1">{wt.description}</p>
                </div>

                <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigateToTab?.("lessons")}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] cursor-pointer transition flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Xem bài học nguồn</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast(`Đã điều hướng sang Bài tập & Kiểm tra để tạo đề củng cố: ${wt.title}`);
                      onNavigateToTab?.("assignments");
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-2xs cursor-pointer transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tạo bài củng cố</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: TIẾN ĐỘ BÀI HỌC & NỘP BÀI */}
      {/* =================================================================== */}
      {activeTab === "progress" && (
        <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-6 shadow-2xs space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#204434]">
              Theo dõi tiến độ học lý thuyết & Nộp bài tập
            </h3>
            <p className="text-xs text-[#315E48]">
              Phân định rõ bài học lý thuyết được giao từ Kho bài học và các bài tập thực hành.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#204434] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#204434]" />
                <span>Tiến độ bài học lý thuyết</span>
              </h4>

              <div className="space-y-2">
                {[
                  { title: "Bài 1: Chào hỏi & Thanh điệu cơ bản", completed: totalStudents, pct: 100 },
                  { title: "Bài 2: Gia đình & Đại từ nhân xưng", completed: Math.max(1, totalStudents - 2), pct: 90 },
                  { title: "Bài 3: Hỏi giờ và lịch trình hàng ngày", completed: Math.max(1, totalStudents - 4), pct: 81 },
                  { title: "Bài 4: Mua sắm và đếm số tiền", completed: Math.max(1, totalStudents - 7), pct: 68 },
                  { title: "Bài 5: 今天我休息 (Ngữ pháp 把)", completed: Math.max(1, totalStudents - 10), pct: 54 },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#204434]">{item.title}</span>
                      <span className="font-bold text-emerald-800">{item.completed}/{totalStudents} học sinh</span>
                    </div>
                    <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#E5DEC9]">
                      <div className="bg-[#204434] h-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#204434] flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#204434]" />
                <span>Tình trạng nộp bài tập</span>
              </h4>

              <div className="space-y-2">
                {featuredAssignments.map((item: any) => (
                  <div key={item.id} className="p-3.5 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-[#204434]">{item.title}</h5>
                      <p className="text-[11px] text-[#315E48] mt-0.5">Đã nộp: {item.submittedRatio} học sinh · Điểm TB: {item.avgScore}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {item.statusText}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: MÃ QR PHÒNG THI & GIÁM SÁT TRỰC TUYẾN */}
      {/* =================================================================== */}
      {isQrModalOpen && qrAssignment && (() => {
        const pinCode = `HSK-${(qrAssignment.id || "6892").slice(-4).toUpperCase()}`;
        const examUrl = typeof window !== "undefined"
          ? `${window.location.origin}/s/attempts/preview?assignmentId=${qrAssignment.id}&mode=live`
          : `https://hanyu.edu.vn/s/attempts/preview?assignmentId=${qrAssignment.id}`;
        const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(examUrl)}`;

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className={`bg-[#FFFCF6] border border-[#E5DEC9] w-full ${isQrFullscreen ? "max-w-4xl h-[90vh]" : "max-w-lg"} rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4 animate-scaleUp overflow-y-auto`}>
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#204434]/10 text-[#204434] flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#204434]">
                      Mã QR Phòng Thi Trực Tiếp
                    </h3>
                    <p className="text-[11px] text-[#315E48]">
                      {qrAssignment.title} · {currentClass.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsQrFullscreen(!isQrFullscreen)}
                    className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer"
                    title={isQrFullscreen ? "Thu nhỏ" : "Chiếu máy chiếu (Toàn màn hình)"}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsQrModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* QR Display Card */}
              <div className="flex flex-col items-center justify-center text-center p-5 bg-white rounded-3xl border border-[#E5DEC9] space-y-3">
                <span className="text-[11px] font-semibold text-[#8F6D3B] bg-[#FFFBF0] px-3 py-1 rounded-full border border-[#BC9B6B]/40">
                  📱 Học sinh mở Camera Zalo / Trình duyệt quét mã để vào thi ngay
                </span>

                {/* QR Image */}
                <div className="p-3 bg-white rounded-2xl border-2 border-[#204434]/20 shadow-inner relative">
                  <img
                    src={qrImageSrc}
                    alt="Mã QR Phòng Thi"
                    className={`${isQrFullscreen ? "w-64 h-64" : "w-48 h-48"} object-contain`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-10 h-10 rounded-xl bg-white border border-[#204434]/40 flex items-center justify-center shadow-xs">
                      <GraduationCap className="w-5 h-5 text-[#204434]" />
                    </span>
                  </div>
                </div>

                {/* PIN Code Codebox */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#315E48] uppercase tracking-wider font-semibold">
                    Mã PIN phòng thi (Nếu nhập thủ công):
                  </span>
                  <div className="text-2xl font-mono font-bold text-[#204434] tracking-widest bg-[#FAF7F0] px-4 py-1.5 rounded-xl border border-[#E5DEC9]">
                    {pinCode}
                  </div>
                </div>

                {/* Direct Link Input */}
                <div className="w-full flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    readOnly
                    value={examUrl}
                    className="w-full text-xs bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-3 py-2 text-[#204434] font-mono select-all truncate"
                  />
                  <button
                    onClick={() => handleCopyQrLink(examUrl)}
                    className="px-3.5 py-2 rounded-xl bg-[#204434] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#183629] shrink-0 cursor-pointer shadow-2xs"
                  >
                    {copiedQrLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQrLink ? "Đã chép" : "Chép link"}</span>
                  </button>
                </div>
              </div>

              {/* Đề xuất tính năng phòng thi cao cấp (Spec Đề Xuất) */}
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-2 text-xs">
                <span className="font-bold text-[#204434] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Đề xuất tính năng phòng thi trực tuyến cao cấp:</span>
                </span>
                <ul className="text-[11px] text-[#315E48] space-y-1.5 list-disc list-inside">
                  <li><strong>Giám sát chống gian lận (Tab Switch):</strong> Tự động cảnh báo đỏ nếu học sinh chuyển tab sang từ điển hoặc Google Dịch.</li>
                  <li><strong>Khóa phòng thi & Thu bài đồng loạt:</strong> Giáo viên có thể bấm "Thu bài ngay" khi hết giờ để khóa quyền làm bài.</li>
                  <li><strong>Xáo trộn câu hỏi & phương án:</strong> Đảo ngẫu nhiên trật tự đáp án A, B, C, D tránh nhìn bài nhau.</li>
                  <li><strong>Chấm điểm AI tức thì:</strong> Tự động chấm điểm cả 12 dạng câu hỏi và gửi phản hồi ngay sau khi nộp.</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E5DEC9]">
                <button
                  onClick={() => {
                    const win = window.open(examUrl, "_blank");
                    win?.focus();
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Vào phòng thi với tư cách học sinh</span>
                </button>

                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-[#204434] text-white text-xs font-semibold shadow-xs hover:bg-[#183629] cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =================================================================== */}
      {/* MODAL: XUẤT BÁO CÁO PDF (Khu vực F) */}
      {/* =================================================================== */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#204434]">Thiết lập xuất báo cáo PDF</h3>
                  <p className="text-[11px] text-[#315E48]">Tải file PDF chuẩn sư phạm Hanyu để gửi phụ huynh hoặc lưu trữ</p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F0] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#204434] mb-1">Lớp học xuất báo cáo</label>
                <input
                  type="text"
                  disabled
                  value={`${currentClass.name} (${totalStudents} học viên)`}
                  className="w-full bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-3 py-2 text-[#204434] font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#204434] mb-1">Khoảng thời gian</label>
                <input
                  type="text"
                  disabled
                  value={timeRange === "30d" ? "30 ngày gần nhất" : "Toàn bộ học kỳ"}
                  className="w-full bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-3 py-2 text-[#204434]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#204434] mb-1">Các phần đưa vào file PDF</label>
                <div className="space-y-1.5 p-3 bg-[#FAF7F0] rounded-xl border border-[#E5DEC9]/70">
                  <label className="flex items-center gap-2 text-[#204434] cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#204434]" />
                    <span>4 Thẻ thống kê KPI tổng quan (Hoàn thành, Điểm TB, Chủ điểm, Quá hạn)</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#204434] cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#204434]" />
                    <span>3 Biểu đồ trực quan (Xu hướng điểm, Nộp bài donut, Phân bổ điểm)</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#204434] cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#204434]" />
                    <span>Bảng Top 5 tiến bộ & Top 5 chủ điểm cần củng cố</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#204434] cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#204434]" />
                    <span>Danh sách chi tiết kết quả từng học viên</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                ℹ️ File PDF được định dạng chuẩn in A4, giữ đúng màu sắc nhận diện Hanyu, font chữ Hán rõ nét và có đầy đủ chữ ký giáo viên phụ trách.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DEC9]">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") window.print();
                }}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] font-semibold text-xs hover:bg-[#FAF7F0] cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>In trực tiếp</span>
              </button>

              <button
                onClick={() => {
                  setIsExportModalOpen(false);
                  showToast("Đang xuất file PDF báo cáo lớp học HSK... Vui lòng kiểm tra thư mục Tải về!");
                }}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Tải xuống file PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* DRAWER: CHI TIẾT HỒ SƠ HỌC VIÊN */}
      {/* =================================================================== */}
      {selectedStudentForDrawer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-end animate-fadeIn">
          <div className="bg-[#FFFCF6] border-l border-[#E5DEC9] w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideLeft">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
                <h3 className="font-serif font-bold text-lg text-[#204434]">Hồ sơ học tập học viên</h3>
                <button
                  onClick={() => setSelectedStudentForDrawer(null)}
                  className="w-8 h-8 rounded-full bg-[#FAF7F0] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Student Header */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9]">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#204434]/10 relative shrink-0">
                  <Image src="/theme/avatar-teacher.jpg" alt="Avatar" fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#204434]">{selectedStudentForDrawer.name}</h4>
                  <p className="text-xs text-[#315E48]">{selectedStudentForDrawer.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#204434] text-white">
                    {currentClass.name}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-white rounded-xl border border-[#E5DEC9]">
                  <span className="text-[11px] text-[#315E48]">Điểm TB hiện tại</span>
                  <div className="text-2xl font-bold font-serif text-[#204434] mt-0.5">
                    {selectedStudentForDrawer.avgScore}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#E5DEC9]">
                  <span className="text-[11px] text-[#315E48]">Tỷ lệ hoàn thành</span>
                  <div className="text-2xl font-bold font-serif text-emerald-700 mt-0.5">
                    {selectedStudentForDrawer.completionRate}%
                  </div>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E5DEC9]/60">
                  <span className="text-[#315E48]">Tổng bài được giao:</span>
                  <span className="font-bold text-[#204434]">{selectedStudentForDrawer.assignedCount} bài</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E5DEC9]/60">
                  <span className="text-[#315E48]">Số bài đã nộp:</span>
                  <span className="font-bold text-emerald-800">{selectedStudentForDrawer.submittedCount} bài</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E5DEC9]/60">
                  <span className="text-[#315E48]">Bài quá hạn chưa nộp:</span>
                  <span className="font-bold text-red-600">{selectedStudentForDrawer.overdueCount} bài</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E5DEC9]/60">
                  <span className="text-[#315E48]">Mức tăng trưởng:</span>
                  <span className="font-bold text-emerald-700">↑ {selectedStudentForDrawer.growth}</span>
                </div>
              </div>

              {/* Teacher Note */}
              <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E5DEC9] space-y-1">
                <span className="text-[11px] font-bold text-[#204434] block">Ghi chú của giáo viên:</span>
                <p className="text-xs text-[#315E48]">
                  {selectedStudentForDrawer.overdueCount > 0
                    ? "Cần gửi tin nhắn nhắc nhở hoàn thành bài tập trước ca học tiếp theo."
                    : "Học tập rất tích cực, tiến bộ rõ rệt trong kỹ năng nhận diện chữ Hán."}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5DEC9] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedStudentForDrawer(null)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-xs font-semibold text-[#315E48] hover:bg-[#FAF7F0]"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setSelectedStudentForDrawer(null);
                  onNavigateToTab?.("assignments");
                }}
                className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-semibold shadow-xs hover:bg-[#183629]"
              >
                Xem các bài làm &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: CHI TIẾT CHỦ ĐIỂM CẦN CỦNG CỐ */}
      {/* =================================================================== */}
      {selectedKnowledgeForModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div>
                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                  Tỷ lệ làm sai: {selectedKnowledgeForModal.errorRate}
                </span>
                <h3 className="font-serif font-bold text-lg text-[#204434] mt-1">
                  {selectedKnowledgeForModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedKnowledgeForModal(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F0] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E5DEC9] space-y-1">
                <span className="font-bold text-[#204434] block">Nguồn bài học:</span>
                <p className="text-[#315E48]">{selectedKnowledgeForModal.lessonSource}</p>
              </div>

              <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E5DEC9] space-y-1">
                <span className="font-bold text-[#204434] block">Phân tích lỗi sai điển hình:</span>
                <p className="text-[#315E48] leading-relaxed">{selectedKnowledgeForModal.description}</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px]">
                💡 Đề xuất sư phạm: Giáo viên có thể bấm "Tạo bài củng cố" bên dưới để hệ thống chuyển sang giao diện Bài tập & Kiểm tra và gợi ý các câu hỏi luyện tập chuyên sâu cho chủ điểm này.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DEC9]">
              <button
                onClick={() => setSelectedKnowledgeForModal(null)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-xs font-semibold text-[#315E48] hover:bg-[#FAF7F0]"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setSelectedKnowledgeForModal(null);
                  onNavigateToTab?.("lessons");
                }}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Mở bài giảng</span>
              </button>
              <button
                onClick={() => {
                  setSelectedKnowledgeForModal(null);
                  onNavigateToTab?.("assignments");
                }}
                className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo bài củng cố</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
