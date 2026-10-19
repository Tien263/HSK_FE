"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Compass,
  BookOpen,
  FileCheck2,
  Dumbbell,
  AlertTriangle,
  RotateCw,
  Users,
  Search,
  Bell,
  Check,
  ChevronRight,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  Calendar,
  LogOut,
  Target,
  GraduationCap,
  Layers,
  CheckCircle2,
  X,
  AlertCircle,
  Settings,
  Filter,
  BarChart3,
  Bookmark,
  ExternalLink,
} from "lucide-react";

interface SummaryData {
  student: {
    id: string;
    name: string;
    username: string;
    currentHskLevel: number;
    totalXp: number;
    streakDays: number;
  };
  counts: {
    pendingAssignments: number;
    dueVocabs: number;
    wrongQuestions: number;
  };
  assignments: Array<{
    id: string;
    title: string;
    className: string;
    durationMin: number;
    dueAt: string;
    totalQuestions: number;
    hasAttempted: boolean;
    latestScore: number | null;
  }>;
}

interface StudyProfile {
  learningMode: "SELF" | "CLASS";
  classCode?: string;
  classInfo?: {
    id: string;
    name: string;
    level: number;
    teacherName: string;
    code: string;
  };
  mainTrack: "hsk" | "topic" | "major";
  major?: string;
  currentLevel: "beginner" | "intermediate" | "advanced";
  dailyTime: 15 | 30 | 60;
}

export default function StudentHomePage() {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("overview");
  const [username, setUsername] = useState("student");
  const [studentName, setStudentName] = useState("Học viên Hanyu");
  const [studyProfile, setStudyProfile] = useState<StudyProfile | null>(null);

  // Filters
  const [learnTrackFilter, setLearnTrackFilter] = useState<"hsk" | "topic" | "major">("hsk");
  const [resultsFilter, setResultsFilter] = useState<"all" | "self" | "class">("all");

  // Today's checklist status
  const [taskDone, setTaskDone] = useState<Record<string, boolean>>({
    task1: false,
    task2: false,
    task3: false,
  });

  // Join Class Modal State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinClassCode, setJoinClassCode] = useState("");
  const [checkingJoinCode, setCheckingJoinCode] = useState(false);
  const [joinClassError, setJoinClassError] = useState("");
  const [verifiedJoinClass, setVerifiedJoinClass] = useState<any>(null);
  const [enrolling, setEnrolling] = useState(false);

  // Goal Setting Modal State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState<"hsk" | "topic" | "major">("hsk");
  const [editingMajor, setEditingMajor] = useState("Kinh tế & Quản trị");
  const [editingLevel, setEditingLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [editingDailyTime, setEditingDailyTime] = useState<15 | 30 | 60>(30);

  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let currentU = "student";
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.username) {
          currentU = u.username;
          setUsername(u.username);
        }
        if (u.name) {
          setStudentName(u.name);
        }
        if (u.email) {
          setUserEmail(u.email);
        }
      }

      const profileStored = localStorage.getItem("hanyu_study_profile");
      if (profileStored) {
        const parsed = JSON.parse(profileStored);
        setStudyProfile(parsed);
        setEditingTrack(parsed.mainTrack || "hsk");
        setEditingMajor(parsed.major || "Kinh tế & Quản trị");
        setEditingLevel(parsed.currentLevel || "beginner");
        setEditingDailyTime(parsed.dailyTime || 30);
        setLearnTrackFilter(parsed.mainTrack || "hsk");
      }
    } catch {}

    fetch(`/api/v1/my/summary?username=${currentU}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
          if (json.data.student?.name && json.data.student.name !== "Trần Minh Khang") {
            setStudentName(json.data.student.name);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Xác minh mã lớp
  const handleVerifyJoinCode = async () => {
    const code = joinClassCode.trim();
    if (!code) {
      setJoinClassError("Vui lòng nhập mã lớp học.");
      return;
    }
    setCheckingJoinCode(true);
    setJoinClassError("");
    setVerifiedJoinClass(null);

    try {
      const res = await fetch(`/api/v1/classes/verify?code=${encodeURIComponent(code)}`);
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setJoinClassError(resData.message || "Không tìm thấy lớp học với mã này.");
        setCheckingJoinCode(false);
        return;
      }
      setVerifiedJoinClass(resData.classInfo);
      setCheckingJoinCode(false);
    } catch {
      setJoinClassError("Lỗi kết nối máy chủ.");
      setCheckingJoinCode(false);
    }
  };

  // Xác nhận tham gia lớp
  const handleConfirmEnroll = async () => {
    if (!verifiedJoinClass) return;
    setEnrolling(true);

    try {
      await fetch("/api/v1/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          classCode: verifiedJoinClass.code,
          learningMode: "CLASS",
          mainTrack: studyProfile?.mainTrack || "hsk",
          dailyTime: studyProfile?.dailyTime || 30,
        }),
      });

      const updatedProfile: StudyProfile = {
        ...(studyProfile || {
          mainTrack: "hsk",
          currentLevel: "beginner",
          dailyTime: 30,
        }),
        learningMode: "CLASS",
        classCode: verifiedJoinClass.code,
        classInfo: verifiedJoinClass,
      };

      setStudyProfile(updatedProfile);
      localStorage.setItem("hanyu_study_profile", JSON.stringify(updatedProfile));

      // Tải lại summary
      fetch(`/api/v1/my/summary?username=${username}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.success && j.data) setData(j.data);
        });

      setEnrolling(false);
      setShowJoinModal(false);
      setVerifiedJoinClass(null);
      setJoinClassCode("");
    } catch (e) {
      setEnrolling(false);
      alert("Không thể ghi danh vào lớp. Vui lòng thử lại.");
    }
  };

  // Lưu đổi mục tiêu học tập (không xóa lịch sử)
  const handleSaveGoal = () => {
    const updated: StudyProfile = {
      learningMode: studyProfile?.learningMode || "SELF",
      classCode: studyProfile?.classCode,
      classInfo: studyProfile?.classInfo,
      mainTrack: editingTrack,
      major: editingTrack === "major" ? editingMajor : undefined,
      currentLevel: editingLevel,
      dailyTime: editingDailyTime,
    };
    setStudyProfile(updated);
    localStorage.setItem("hanyu_study_profile", JSON.stringify(updated));
    setLearnTrackFilter(editingTrack);
    setShowGoalModal(false);
  };

  // Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    router.push("/login");
  };

  const isClassMode = studyProfile?.learningMode === "CLASS";

  // Tên hiển thị hướng học
  const targetTrackName =
    studyProfile?.mainTrack === "topic"
      ? "Tiếng Trung Giao Tiếp Theo Chủ Đề"
      : studyProfile?.mainTrack === "major"
      ? `Tiếng Trung Đại Học · ${studyProfile.major || "Kinh tế"}`
      : "Khung Chuẩn HSK 3.0";

  // Trình độ học viên hiển thị cụ thể
  const studentLevelDisplay =
    studyProfile?.currentLevel === "advanced"
      ? "HSK 4+"
      : studyProfile?.currentLevel === "intermediate"
      ? "HSK 2 - 3"
      : "HSK 1 (Sơ cấp)";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F4EB] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#214A38] text-[#FFFCF6] flex items-center justify-center font-serif text-2xl font-bold shadow-md mb-4 animate-pulse">
          宁
        </div>
        <p className="text-sm font-semibold text-[#214A38]">Đang chuẩn bị không gian học Hanyu của bạn...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EB] text-[#214A38] font-sans selection:bg-[#214A38] selection:text-[#FFFCF6] flex flex-col">
      
      {/* ========================================================================= */}
      {/* SIDEBAR TRÁI KHUYẾN NGHỊ (THEO MỤC 1.2 BẢN ĐẶC TẢ) */}
      {/* ========================================================================= */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#FFFCF6] border-r border-[#BC9B6B]/25 z-40 hidden lg:flex flex-col justify-between shadow-xs">
        <div>
          {/* Brand Logo */}
          <div className="h-16 2xl:h-20 px-6 flex items-center gap-3 border-b border-[#BC9B6B]/20">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#214A38] text-[#FFFCF6] flex items-center justify-center font-serif text-lg font-bold shadow-md group-hover:scale-105 transition-transform">
                <span>宁</span>
              </div>
              <div>
                <div className="font-serif font-bold text-lg text-[#214A38] tracking-tight">Hanyu</div>
                <div className="text-[10px] text-[#315E48] tracking-widest uppercase font-semibold">
                  Dashboard Học Viên
                </div>
              </div>
            </Link>
          </div>

          {/* Nav Links (8 mục theo đặc tả 1.2) */}
          <nav className="p-3.5 space-y-1 text-xs font-semibold">
            {[
              { id: "overview", label: "Tổng quan", icon: Home, href: "#overview" },
              { id: "roadmap", label: "Lộ trình của tôi", icon: Compass, href: "#roadmap" },
              { id: "learn", label: "Khám phá bài học", icon: BookOpen, href: "#learn" },
              { id: "classes", label: "Lớp học của tôi", icon: Users, href: "#classes" },
              {
                id: "assignments",
                label: "Bài được giao",
                icon: FileCheck2,
                href: "#assignments",
                badge: isClassMode ? data?.assignments?.length : undefined,
              },
              { id: "practice", label: "Phòng luyện tập", icon: Dumbbell, href: "#practice" },
              { id: "results", label: "Kết quả học tập", icon: BarChart3, href: "#results" },
              { id: "settings", label: "Hồ sơ & Cài đặt", icon: Settings, action: () => setShowSettingsModal(true) },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return item.action ? (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer text-left ${
                    isActive
                      ? "bg-[#214A38] text-[#FFFCF6] shadow-xs"
                      : "text-[#315E48] hover:bg-[#F7F4EB] hover:text-[#214A38]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 stroke-[1.8]" />
                    <span>{item.label}</span>
                  </div>
                </button>
              ) : (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-[#214A38] text-[#FFFCF6] shadow-xs"
                      : "text-[#315E48] hover:bg-[#F7F4EB] hover:text-[#214A38]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 stroke-[1.8]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-md bg-[#9D493E] text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-3.5 border-t border-[#BC9B6B]/20 bg-[#F7F4EB]/40">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/25">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#214A38] text-[#FFFCF6] flex items-center justify-center font-bold text-xs shrink-0">
                {studentName ? studentName.charAt(0).toUpperCase() : "H"}
              </div>
              <div className="leading-tight truncate">
                <span className="font-bold text-xs text-[#214A38] block truncate">{studentName}</span>
                <span className="text-[10px] text-[#315E48] block truncate">{studentLevelDisplay}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-[#315E48] hover:text-[#9D493E] p-1.5 transition cursor-pointer shrink-0"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* NỘI DUNG CHÍNH (WRAPPER) */}
      {/* ========================================================================= */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Header (Mục 2.A) */}
        <header className="h-16 2xl:h-20 bg-[#FFFCF6]/90 backdrop-blur-md border-b border-[#BC9B6B]/25 px-4 sm:px-6 2xl:px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 2xl:w-10 2xl:h-10 rounded-xl overflow-hidden bg-[#214A38]/10 border border-[#214A38]/20 relative shrink-0">
              <Image
                src="/theme/avatar-student.jpg"
                alt="Avatar"
                fill
                className="object-cover object-top"
              />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[#214A38] flex items-center gap-1.5 leading-snug">
                <span>Xin chào, {studentName}</span>
                <span className="text-xs">🍃</span>
              </h2>
              <p className="text-[11px] text-[#315E48]">
                {targetTrackName} · {studyProfile?.dailyTime || 30} phút/ngày
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowGoalModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#315E48] hover:text-[#214A38] bg-[#F7F4EB] hover:bg-white px-3 py-1.5 rounded-full border border-[#BC9B6B]/30 transition shadow-xs cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-[#BC9B6B]" />
              <span>Đổi mục tiêu</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="w-9 h-9 rounded-xl bg-[#F7F4EB] text-[#315E48] hover:text-[#214A38] flex items-center justify-center transition border border-[#BC9B6B]/30 cursor-pointer"
              title="Cài đặt tài khoản"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-4 sm:p-6 2xl:p-8 space-y-6 max-w-6xl 2xl:max-w-7xl w-full mx-auto">
          
          {/* ========================================================================= */}
          {/* THÀNH PHẦN A: BANNER ĐẦU TRANG */}
          {/* ========================================================================= */}
          <section id="overview" className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#214A38] via-[#285340] to-[#315E48] text-[#FFFCF6] p-6 sm:p-8 shadow-xl shadow-[#214A38]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#FFFCF6]">
                <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
                <span>Không gian học tập cá nhân hóa Hanyu</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#FFFCF6] leading-snug">
                Chào mừng trở lại, {studentName}!
              </h1>

              {/* Motto Trung Hoa tối giản */}
              <div className="p-3 rounded-2xl bg-black/15 backdrop-blur-xs border border-white/10 max-w-lg">
                <div className="font-serif text-sm font-bold text-[#FFFCF6] tracking-wide">
                  “千里之行，始于足下”
                </div>
                <div className="text-[11px] text-[#BC9B6B] font-mono mt-0.5">
                  Qiān lǐ zhī xíng, shǐ yú zú xià
                </div>
                <div className="text-xs text-[#FFFCF6]/85 font-light mt-0.5">
                  Hành trình vạn dặm bắt đầu từ một bước chân. Kiên trì từng ngày sẽ vươn tới thành công.
                </div>
              </div>

              {/* Mục tiêu & CTA Học tiếp */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="px-3 py-1.5 rounded-xl bg-white/15 text-xs font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#BC9B6B]" />
                  <span>Trình độ: {studentLevelDisplay}</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/15 text-xs font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#DCE8D9]" />
                  <span>{studyProfile?.dailyTime || 30} phút/ngày</span>
                </span>
                
                <Link
                  href="#roadmap"
                  className="px-4 py-1.5 rounded-xl bg-[#BC9B6B] hover:bg-[#a98757] text-[#FFFCF6] text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <span>Học tiếp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Tranh minh họa nhỏ gọn */}
            <div className="relative w-64 h-40 rounded-2xl overflow-hidden border border-white/20 shadow-lg hidden md:block shrink-0 bg-[#12281e]">
              <Image
                src="/theme/landing-moon-desk.jpg"
                alt="Bàn học thư phòng Trung Hoa"
                fill
                className="object-cover object-center filter saturate-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#214A38]/80 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 text-center">
                <span className="text-[10px] font-serif text-[#FFFCF6] tracking-widest uppercase">
                  静以修身 · 俭以养德
                </span>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* CỘT CHÍNH & CỘT PHỤ (MỤC 2.B & 2.C) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* THÀNH PHẦN B: LỘ TRÌNH CỦA TÔI (4 CHẶNG THEO MỤC 4.2) */}
            <section id="roadmap" className="lg:col-span-7 bg-[#FFFCF6] rounded-3xl p-6 sm:p-7 border border-[#BC9B6B]/30 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#214A38]/10 text-[#214A38] flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#214A38]">Lộ trình của tôi</h3>
                    <p className="text-[11px] text-[#315E48]">
                      {targetTrackName} · <span className="italic">Đề xuất theo mục tiêu tự khai báo</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoalModal(true)}
                  className="text-xs font-semibold text-[#315E48] hover:text-[#214A38] flex items-center gap-1 cursor-pointer"
                >
                  <span>Chỉnh sửa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chặng hiện tại & CTA Tiếp tục */}
              <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-[#BC9B6B] uppercase tracking-wider block">
                    Chặng hiện tại: Giai đoạn 1 / 4
                  </span>
                  <div className="font-serif font-bold text-base text-[#214A38] mt-0.5">
                    {studyProfile?.mainTrack === "topic"
                      ? "1. Củng cố giao tiếp & phản xạ nền tảng"
                      : studyProfile?.mainTrack === "major"
                      ? "1. Ngữ âm & Thuật ngữ cơ sở chuyên ngành"
                      : "1. Củng cố nền tảng ngữ âm Pinyin & Từ vựng cốt lõi"}
                  </div>
                  <div className="text-xs text-[#315E48] mt-1">
                    Bài tiếp theo: <strong>Bài 1: Chào hỏi & Làm quen (你好)</strong>
                  </div>
                </div>

                <Link
                  href="/s/review"
                  className="px-4 py-2.5 rounded-xl bg-[#214A38] hover:bg-[#183629] text-[#FFFCF6] text-xs font-semibold transition shrink-0 shadow-xs flex items-center gap-1.5 self-end sm:self-auto"
                >
                  <span>Học tiếp bài này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 4 Chặng chuẩn theo đặc tả 4.2 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
                {[
                  {
                    step: "Chặng 1",
                    title: "Củng cố nền tảng",
                    desc: "Pinyin & từ vựng lõi",
                    status: "current",
                  },
                  {
                    step: "Chặng 2",
                    title: "Đời sống & Tình huống",
                    desc: "Giao tiếp giảng đường/thực tế",
                    status: "next",
                  },
                  {
                    step: "Chặng 3",
                    title: "Thuật ngữ chuyên ngành",
                    desc: "Từ vựng chuyên sâu",
                    status: "pending",
                  },
                  {
                    step: "Chặng 4",
                    title: "Đọc & Nghe học thuật",
                    desc: "Giáo trình & thực chiến",
                    status: "pending",
                  },
                ].map((ph, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-between transition ${
                      ph.status === "current"
                        ? "bg-[#214A38]/5 border-[#214A38]/40 ring-2 ring-[#214A38]/10"
                        : "bg-[#F7F4EB]/70 border-[#BC9B6B]/20"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                        ph.status === "current"
                          ? "bg-[#214A38] text-[#FFFCF6]"
                          : "bg-[#BC9B6B]/20 text-[#315E48]"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-xs font-bold text-[#214A38] leading-tight mt-1">{ph.title}</span>
                    <span className="text-[10px] text-[#315E48] mt-0.5 leading-snug">{ph.desc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* THÀNH PHẦN C: KẾ HOẠCH HÔM NAY (15/30/60 PHÚT THEO MỤC 2.C) */}
            <section id="today" className="lg:col-span-5 bg-[#FFFCF6] rounded-3xl p-6 sm:p-7 border border-[#BC9B6B]/30 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#BC9B6B]/15 text-[#214A38] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#214A38]">Kế hoạch hôm nay</h3>
                    <p className="text-[11px] text-[#315E48]">Mục tiêu {studyProfile?.dailyTime || 30} phút / ngày</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#214A38] bg-[#F7F4EB] px-2.5 py-1 rounded-full border border-[#BC9B6B]/30">
                  {Object.values(taskDone).filter(Boolean).length}/3 xong
                </span>
              </div>

              {/* Tasks Checklist */}
              <div className="space-y-2.5">
                {/* Nhiệm vụ 1: Ôn bài / Ôn lỗi sai */}
                <div
                  onClick={() => setTaskDone((prev) => ({ ...prev, task1: !prev.task1 }))}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    taskDone.task1
                      ? "bg-[#214A38]/5 border-[#214A38]/30 line-through text-[#315E48]"
                      : "bg-[#F7F4EB] border-[#BC9B6B]/25 hover:border-[#214A38]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                        taskDone.task1
                          ? "bg-[#214A38] border-[#214A38] text-white"
                          : "border-[#BC9B6B] bg-white"
                      }`}
                    >
                      {taskDone.task1 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#214A38]">
                        1. Ôn từ vựng / Lỗi sai
                      </div>
                      <div className="text-[11px] text-[#315E48]">10 phút · Ghi nhớ ngắt quãng</div>
                    </div>
                  </div>
                  <Link
                    href="/s/review"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-[#214A38] hover:underline shrink-0"
                  >
                    Ôn ngay →
                  </Link>
                </div>

                {/* Nhiệm vụ 2: Học bài mới */}
                <div
                  onClick={() => setTaskDone((prev) => ({ ...prev, task2: !prev.task2 }))}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    taskDone.task2
                      ? "bg-[#214A38]/5 border-[#214A38]/30 line-through text-[#315E48]"
                      : "bg-[#F7F4EB] border-[#BC9B6B]/25 hover:border-[#214A38]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                        taskDone.task2
                          ? "bg-[#214A38] border-[#214A38] text-white"
                          : "border-[#BC9B6B] bg-white"
                      }`}
                    >
                      {taskDone.task2 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#214A38]">
                        2. Học bài mới theo lộ trình
                      </div>
                      <div className="text-[11px] text-[#315E48]">12 phút · Ngữ pháp & Mẫu câu</div>
                    </div>
                  </div>
                  <a
                    href="#learn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNav("learn");
                    }}
                    className="text-xs font-semibold text-[#214A38] hover:underline shrink-0"
                  >
                    Vào bài →
                  </a>
                </div>

                {/* Nhiệm vụ 3: Luyện tập phản xạ */}
                <div
                  onClick={() => setTaskDone((prev) => ({ ...prev, task3: !prev.task3 }))}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    taskDone.task3
                      ? "bg-[#214A38]/5 border-[#214A38]/30 line-through text-[#315E48]"
                      : "bg-[#F7F4EB] border-[#BC9B6B]/25 hover:border-[#214A38]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                        taskDone.task3
                          ? "bg-[#214A38] border-[#214A38] text-white"
                          : "border-[#BC9B6B] bg-white"
                      }`}
                    >
                      {taskDone.task3 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#214A38]">
                        3. Luyện câu hỏi củng cố
                      </div>
                      <div className="text-[11px] text-[#315E48]">8 phút · Củng cố kiến thức</div>
                    </div>
                  </div>
                  <a
                    href="#practice"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNav("practice");
                    }}
                    className="text-xs font-semibold text-[#214A38] hover:underline shrink-0"
                  >
                    Luyện tập →
                  </a>
                </div>
              </div>
            </section>

          </div>

          {/* ========================================================================= */}
          {/* THÀNH PHẦN D: BÀI ĐANG HỌC (TỐI ĐA 2 BÀI, THEO MỤC 2.D) */}
          {/* ========================================================================= */}
          <section id="lessons" className="bg-[#FFFCF6] rounded-3xl p-6 sm:p-7 border border-[#BC9B6B]/30 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#214A38]/10 text-[#214A38] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#214A38]">Bài đang học</h3>
                  <p className="text-[11px] text-[#315E48]">Nội dung đang dang dở gần đây nhất</p>
                </div>
              </div>
              <a
                href="#learn"
                onClick={() => setActiveNav("learn")}
                className="text-xs font-semibold text-[#315E48] hover:text-[#214A38] flex items-center gap-1"
              >
                <span>Xem tất cả bài</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bài 1 */}
              <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/25 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#214A38] text-[#FFFCF6] text-[10px] font-bold">
                      Bài 1 · Chào hỏi
                    </span>
                    <span className="text-[11px] font-medium text-[#315E48]">Khởi đầu</span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#214A38]">
                    Bài 1: 你好 (Xin chào & Chào hỏi cơ bản)
                  </h4>
                  <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                    Hệ thống thanh mẫu, vận mẫu Pinyin căn bản và các mẫu câu xưng hô chào hỏi đầu tiên.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#BC9B6B]/15">
                  <span className="text-[11px] text-[#315E48]">10 từ vựng cốt lõi</span>
                  <Link
                    href="/s/review"
                    className="px-3.5 py-1.5 rounded-xl bg-[#214A38] text-white text-xs font-semibold hover:bg-[#183629] transition flex items-center gap-1"
                  >
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Bài 2 */}
              <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/25 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#BC9B6B] text-white text-[10px] font-bold">
                      Bài 2 · Cảm ơn & Tạm biệt
                    </span>
                    <span className="text-[11px] font-medium text-[#315E48]">Tiếp theo</span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#214A38]">
                    Bài 2: 谢谢 (Cảm ơn, xin lỗi & Tạm biệt)
                  </h4>
                  <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                    Các biến điệu thanh điệu quan trọng, đại từ nhân xưng và quy tắc đối thoại lịch sự.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#BC9B6B]/15">
                  <span className="text-[11px] text-[#315E48]">12 từ vựng mới</span>
                  <Link
                    href="/s/review"
                    className="px-3.5 py-1.5 rounded-xl bg-[#214A38] text-white text-xs font-semibold hover:bg-[#183629] transition flex items-center gap-1"
                  >
                    <span>Học bài này</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* THÀNH PHẦN E: LỚP HỌC & BÀI ĐƯỢC GIAO (2 CHẾ ĐỘ RÕ RÀNG THEO MỤC 03) */}
          {/* ========================================================================= */}
          <section id="classes" className="bg-[#FFFCF6] rounded-3xl p-6 sm:p-7 border border-[#BC9B6B]/30 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#9D493E]/10 text-[#9D493E] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#214A38]">Lớp học & Bài được giao</h3>
                  <p className="text-[11px] text-[#315E48]">
                    {isClassMode
                      ? "Lớp học có giáo viên phụ trách giao bài và theo dõi tiến độ"
                      : "Chế độ tự học độc lập (Không hiển thị bài tập giả khi chưa vào lớp)"}
                  </p>
                </div>
              </div>

              {!isClassMode && (
                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#9D493E] hover:bg-[#833d34] text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Tham gia lớp học</span>
                </button>
              )}
            </div>

            {/* CHẾ ĐỘ 1: ĐÃ THAM GIA LỚP */}
            {isClassMode ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#9D493E] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
                      宁
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-base text-[#214A38]">
                          {studyProfile?.classInfo?.name || "Lớp HSK 3 Chuẩn Quốc Tế"}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-[#214A38] text-white text-[10px] font-bold">
                          HSK {studyProfile?.classInfo?.level || 3}
                        </span>
                      </div>
                      <p className="text-xs text-[#315E48] mt-0.5">
                        Giáo viên: <strong>{studyProfile?.classInfo?.teacherName || "Nguyễn Thảo (Cô Ning Ning)"}</strong> · Mã lớp: <span className="font-mono font-bold text-[#9D493E]">{studyProfile?.classInfo?.code || "HANYU3A"}</span>
                      </p>
                    </div>
                  </div>

                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold self-start sm:self-auto">
                    ● Đang tham gia
                  </span>
                </div>

                {/* Danh sách bài tập giáo viên giao */}
                <div id="assignments" className="space-y-2.5">
                  <div className="text-xs font-bold text-[#214A38] uppercase tracking-wider">
                    Bài tập được giao gần hạn:
                  </div>

                  {data?.assignments && data.assignments.length > 0 ? (
                    data.assignments.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/25 hover:border-[#214A38] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#9D493E]/10 text-[#9D493E] flex items-center justify-center shrink-0 mt-0.5">
                            <FileCheck2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-bold text-sm text-[#214A38]">{item.title}</h5>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#315E48] mt-0.5">
                              <span>Khóa: {item.className}</span>
                              <span>•</span>
                              <span>Hạn nộp: <strong className="text-[#9D493E]">{new Date(item.dueAt).toLocaleDateString("vi-VN")}</strong></span>
                              <span>•</span>
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                                {item.hasAttempted ? "Đã làm" : "Chưa làm"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link
                          href={`/s/attempts/${item.id}`}
                          className="px-4 py-2 rounded-xl bg-[#214A38] text-white text-xs font-bold hover:bg-[#183629] transition shadow-xs shrink-0 self-end sm:self-auto cursor-pointer"
                        >
                          Làm bài ngay
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20 text-xs text-[#315E48] text-center">
                      Hiện chưa có bài tập mới được giao. Tiến độ tự học của bạn vẫn được giữ nguyên đầy đủ!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* CHẾ ĐỘ 2: CHỈ TỰ HỌC (KHÔNG BỊA BÀI GIAO GIẢ) */
              <div className="p-5 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/25 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#214A38]/10 text-[#214A38] flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#214A38]">
                      Bạn đang tự học chủ động độc lập
                    </h4>
                    <p className="text-xs text-[#315E48] mt-0.5 leading-relaxed">
                      Bạn có thể nhập mã lớp từ giáo viên để nhận thêm bài tập. Khi vào lớp, tiến trình tự học cá nhân của bạn hoàn toàn không bị mất.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#214A38] hover:bg-[#183629] text-white text-xs font-semibold transition shrink-0 cursor-pointer shadow-xs"
                >
                  Nhập mã lớp
                </button>
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* KHÁM PHÁ BÀI HỌC (THEO MỤC 1.2 & 5.1 BẢN ĐẶC TẢ) */}
          {/* ========================================================================= */}
          <section id="learn" className="bg-[#FFFCF6] rounded-3xl p-6 sm:p-7 border border-[#BC9B6B]/30 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BC9B6B]/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#214A38]/10 text-[#214A38] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#214A38]">Khám phá bài học</h3>
                  <p className="text-[11px] text-[#315E48]">Tra cứu toàn bộ chương trình bài học theo 3 hướng học</p>
                </div>
              </div>

              {/* Bộ lọc 3 hướng theo đặc tả */}
              <div className="flex items-center gap-1.5 p-1 bg-[#F7F4EB] rounded-2xl border border-[#BC9B6B]/20 self-start sm:self-auto">
                {[
                  { key: "hsk", label: "Khung HSK 3.0" },
                  { key: "topic", label: "Theo chủ đề" },
                  { key: "major", label: "Đại học & Chuyên ngành" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setLearnTrackFilter(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      learnTrackFilter === tab.key
                        ? "bg-[#214A38] text-[#FFFCF6] shadow-xs"
                        : "text-[#315E48] hover:text-[#214A38]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {learnTrackFilter === "hsk" && (
                <>
                  <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-[#214A38] text-white text-[10px] font-bold">HSK 1</span>
                    <h4 className="font-serif font-bold text-sm text-[#214A38]">Bài 1: 你好 (Xin chào)</h4>
                    <p className="text-xs text-[#315E48]">Pinyin, chào hỏi, từ vựng cơ bản.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-[#214A38] text-white text-[10px] font-bold">HSK 1</span>
                    <h4 className="font-serif font-bold text-sm text-[#214A38]">Bài 2: 谢谢 (Cảm ơn)</h4>
                    <p className="text-xs text-[#315E48]">Cảm ơn, xin lỗi, xưng hô.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-[#214A38] text-white text-[10px] font-bold">HSK 1</span>
                    <h4 className="font-serif font-bold text-sm text-[#214A38]">Bài 3: 你叫什么名字</h4>
                    <p className="text-xs text-[#315E48]">Hỏi tên, quốc tịch, tuổi tác.</p>
                  </div>
                </>
              )}

              {learnTrackFilter === "topic" && (
                <>
                  <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-[#BC9B6B] text-white text-[10px] font-bold">Du lịch</span>
                    <h4 className="font-serif font-bold text-sm text-[#214A38]">Chủ đề 1: Sân bay & Khách sạn</h4>
                    <p className="text-xs text-[#315E48]">Hỏi đường, làm thủ tục check-in.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-[#BC9B6B] text-white text-[10px] font-bold">Đời sống</span>
                    <h4 className="font-serif font-bold text-sm text-[#214A38]">Chủ đề 2: Gọi món & Ẩm thực</h4>
                    <p className="text-xs text-[#315E48]">Gọi món tại nhà hàng, thanh toán tiền.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-[#BC9B6B] text-white text-[10px] font-bold">Mua sắm</span>
                    <h4 className="font-serif font-bold text-sm text-[#214A38]">Chủ đề 3: Mua sắm & Trả giá</h4>
                    <p className="text-xs text-[#315E48]">Hỏi giá, phương thức thanh toán ví điện tử.</p>
                  </div>
                </>
              )}

              {learnTrackFilter === "major" && (
                <>
                  <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-[#9D493E] text-white text-[10px] font-bold">Kinh tế</span>
                    <h4 className="font-serif font-bold text-sm text-[#214A38]">Bài 1: Thuật ngữ Thương mại cơ bản</h4>
                    <p className="text-xs text-[#315E48]">Thị trường, hợp đồng, giao dịch ngoại thương.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-[#9D493E] text-white text-[10px] font-bold">Tài chính</span>
                    <h4 className="font-serif font-bold text-sm text-[#214A38]">Bài 2: Ngân hàng & Tỷ giá hối đoái</h4>
                    <p className="text-xs text-[#315E48]">Tỷ giá, lãi suất, chuyển khoản quốc tế.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-[#9D493E] text-white text-[10px] font-bold">Giảng đường</span>
                    <h4 className="font-serif font-bold text-sm text-[#214A38]">Bài 3: Giao tiếp Thư viện & Thảo luận nhóm</h4>
                    <p className="text-xs text-[#315E48]">Tra cứu tài liệu, thuyết trình chuyên đề.</p>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* THÀNH PHẦN F: PHÒNG LUYỆN TẬP (MỤC 2.F & ĐIỀU CHỈNH 5.1) */}
          {/* ========================================================================= */}
          <section id="practice" className="bg-[#FFFCF6] rounded-3xl p-6 sm:p-7 border border-[#BC9B6B]/30 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#214A38]/10 text-[#214A38] flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#214A38]">Phòng luyện tập</h3>
                  <p className="text-[11px] text-[#315E48]">Công cụ rèn luyện phản xạ ngôn ngữ</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Luyện từ vựng */}
              <Link
                href="/s/review"
                className="p-5 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/25 hover:border-[#214A38] hover:bg-white transition group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#214A38]/10 text-[#214A38] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <RotateCw className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#214A38]">Luyện từ vựng</h4>
                  <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                    Flashcards ngắt quãng Leitner giúp khắc sâu từng mặt chữ Hán và Pinyin.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#BC9B6B]/20 flex items-center justify-between text-xs font-semibold text-[#214A38]">
                  <span>Vào luyện</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Luyện ngữ pháp */}
              <Link
                href="/s/games"
                className="p-5 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/25 hover:border-[#214A38] hover:bg-white transition group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#BC9B6B]/20 text-[#214A38] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#214A38]">Luyện ngữ pháp</h4>
                  <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                    Trật tự từ, câu chữ 把, chữ 被 và các cấu trúc ngữ pháp HSK trọng tâm.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#BC9B6B]/20 flex items-center justify-between text-xs font-semibold text-[#214A38]">
                  <span>Vào luyện</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Sổ câu hỏi sai */}
              <Link
                href="/s/practice/wrong"
                className="p-5 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/25 hover:border-[#9D493E] hover:bg-white transition group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#9D493E]/10 text-[#9D493E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#214A38]">Sổ câu hỏi sai</h4>
                  <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                    Lưu vết các câu từng làm sai trong quá trình làm bài để ôn lại đúng điểm yếu.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#BC9B6B]/20 flex items-center justify-between text-xs font-semibold text-[#9D493E]">
                  <span>Ôn lại lỗi</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Bài luyện đề xuất (Thay thế Game Center theo mục 5.1) */}
              <Link
                href="/s/games"
                className="p-5 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/25 hover:border-[#214A38] hover:bg-white transition group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#214A38]/10 text-[#214A38] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#214A38]">Bài luyện đề xuất</h4>
                  <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                    Bài tập trắc nghiệm tổng hợp được hệ thống chọn lọc phù hợp cấp độ hiện tại.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#BC9B6B]/20 flex items-center justify-between text-xs font-semibold text-[#214A38]">
                  <span>Luyện ngay</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* THÀNH PHẦN G: KẾT QUẢ HỌC TẬP & TIẾN BỘ THỰC TẾ (THEO MỤC 2.G) */}
          {/* ========================================================================= */}
          <section id="results" className="bg-[#FFFCF6] rounded-3xl p-6 sm:p-7 border border-[#BC9B6B]/30 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BC9B6B]/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#214A38]/10 text-[#214A38] flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#214A38]">Kết quả học tập & Tiến bộ</h3>
                  <p className="text-[11px] text-[#315E48]">Số liệu ghi nhận trung thực theo quá trình học thực tế</p>
                </div>
              </div>

              {/* Bộ lọc nguồn: Tự học vs Theo lớp (Mục 2.G) */}
              <div className="flex items-center gap-1.5 p-1 bg-[#F7F4EB] rounded-2xl border border-[#BC9B6B]/20 self-start sm:self-auto text-xs">
                {[
                  { key: "all", label: "Tất cả" },
                  { key: "self", label: "Tự học cá nhân" },
                  { key: "class", label: "Bài theo lớp" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setResultsFilter(f.key as any)}
                    className={`px-3 py-1 rounded-xl font-semibold transition cursor-pointer ${
                      resultsFilter === f.key
                        ? "bg-[#214A38] text-[#FFFCF6]"
                        : "text-[#315E48] hover:text-[#214A38]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thống kê trung thực, không bịa số liệu ảo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20">
                <div className="text-xs text-[#315E48] font-medium">Số bài đã hoàn thành</div>
                <div className="text-2xl font-serif font-bold text-[#214A38] mt-1.5">
                  0 <span className="text-xs font-sans font-normal text-[#315E48]">bài</span>
                </div>
                <div className="text-[11px] text-[#315E48]/80 mt-1">Đang ở bước khởi đầu lộ trình</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20">
                <div className="text-xs text-[#315E48] font-medium">Tỷ lệ trả lời đúng</div>
                <div className="text-xl font-serif font-bold text-[#315E48] mt-1.5">
                  Chưa có dữ liệu
                </div>
                <div className="text-[11px] text-[#315E48]/80 mt-1">Sẽ tính sau khi bạn hoàn thành bài đầu tiên</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20">
                <div className="text-xs text-[#315E48] font-medium">Số câu cần ôn lại</div>
                <div className="text-2xl font-serif font-bold text-[#9D493E] mt-1.5">
                  0 <span className="text-xs font-sans font-normal text-[#315E48]">câu</span>
                </div>
                <div className="text-[11px] text-[#315E48]/80 mt-1">Chưa ghi nhận lỗi sai nào</div>
              </div>
            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="w-full px-6 lg:px-10 py-5 text-center text-xs text-[#315E48]/80 border-t border-[#BC9B6B]/20 mt-auto bg-[#FFFCF6]">
          © 2026 Hanyu · Nền tảng học tiếng Trung và Luyện thi HSK 3.0 · Phong cách Thủy Mặc Tối Giản
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ĐỔI MỤC TIÊU HỌC TẬP (MỤC 2.A) */}
      {/* ========================================================================= */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowGoalModal(false)}
              className="absolute top-5 right-5 text-[#315E48] hover:text-[#214A38] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#214A38]/10 text-[#214A38] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#214A38]">Thiết lập lại mục tiêu học tập</h3>
                <p className="text-xs text-[#315E48]">
                  Cập nhật lộ trình gợi ý mới (Lịch sử học và điểm số cũ của bạn luôn được giữ nguyên)
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Chọn hướng học */}
              <div>
                <label className="block font-bold text-[#214A38] mb-1.5">Hướng học chính:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "hsk", label: "HSK 3.0" },
                    { key: "topic", label: "Theo chủ đề" },
                    { key: "major", label: "Đại học & Ngành" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setEditingTrack(t.key as any)}
                      className={`p-2.5 rounded-xl border font-semibold transition cursor-pointer text-center ${
                        editingTrack === t.key
                          ? "bg-[#214A38] text-white border-[#214A38]"
                          : "bg-[#F7F4EB] text-[#315E48] border-[#BC9B6B]/30 hover:bg-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nếu chọn đại học thì chọn ngành */}
              {editingTrack === "major" && (
                <div>
                  <label className="block font-bold text-[#214A38] mb-1">Ngành học quan tâm:</label>
                  <select
                    value={editingMajor}
                    onChange={(e) => setEditingMajor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F4EB] border border-[#BC9B6B]/35 text-[#214A38] font-medium"
                  >
                    <option value="Kinh tế & Quản trị">Kinh tế & Quản trị kinh doanh</option>
                    <option value="Kế toán & Tài chính">Kế toán & Tài chính ngân hàng</option>
                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                    <option value="Du lịch & Khách sạn">Du lịch & Khách sạn</option>
                    <option value="Chưa xác định">Ngành khác / Chưa xác định</option>
                  </select>
                </div>
              )}

              {/* Trình độ hiện tại */}
              <div>
                <label className="block font-bold text-[#214A38] mb-1.5">Trình độ tự khai báo:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "beginner", label: "Mới bắt đầu" },
                    { key: "intermediate", label: "HSK 1 - 3" },
                    { key: "advanced", label: "HSK 4 trở lên" },
                  ].map((l) => (
                    <button
                      key={l.key}
                      type="button"
                      onClick={() => setEditingLevel(l.key as any)}
                      className={`p-2.5 rounded-xl border font-semibold transition cursor-pointer text-center ${
                        editingLevel === l.key
                          ? "bg-[#214A38] text-white border-[#214A38]"
                          : "bg-[#F7F4EB] text-[#315E48] border-[#BC9B6B]/30 hover:bg-white"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thời gian học mỗi ngày */}
              <div>
                <label className="block font-bold text-[#214A38] mb-1.5">Thời gian học mỗi ngày:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 15, label: "15 phút / ngày" },
                    { val: 30, label: "30 phút / ngày" },
                    { val: 60, label: "60 phút / ngày" },
                  ].map((tm) => (
                    <button
                      key={tm.val}
                      type="button"
                      onClick={() => setEditingDailyTime(tm.val as any)}
                      className={`p-2.5 rounded-xl border font-semibold transition cursor-pointer text-center ${
                        editingDailyTime === tm.val
                          ? "bg-[#214A38] text-white border-[#214A38]"
                          : "bg-[#F7F4EB] text-[#315E48] border-[#BC9B6B]/30 hover:bg-white"
                      }`}
                    >
                      {tm.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#BC9B6B]/30 font-semibold text-[#315E48] hover:bg-[#F7F4EB] transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveGoal}
                  className="flex-1 py-2.5 rounded-xl bg-[#214A38] hover:bg-[#183629] text-white font-semibold transition shadow-xs cursor-pointer"
                >
                  Lưu & Cập nhật lộ trình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: THAM GIA LỚP HỌC (THEO MỤC 3.3) */}
      {/* ========================================================================= */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setShowJoinModal(false);
                setVerifiedJoinClass(null);
                setJoinClassError("");
              }}
              className="absolute top-5 right-5 text-[#315E48] hover:text-[#214A38] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#9D493E]/10 text-[#9D493E] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#214A38]">Tham gia lớp học mới</h3>
                <p className="text-xs text-[#315E48]">Nhập mã lớp được giáo viên của bạn cung cấp</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#214A38] mb-1.5">Mã lớp học:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinClassCode}
                    onChange={(e) => {
                      setJoinClassCode(e.target.value.toUpperCase());
                      setJoinClassError("");
                    }}
                    placeholder="Ví dụ: HANYU3A"
                    className="flex-1 bg-[#F7F4EB] border border-[#BC9B6B]/35 focus:border-[#214A38] focus:bg-white rounded-xl px-3.5 py-2.5 font-mono font-bold tracking-wider text-[#214A38] uppercase outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyJoinCode}
                    disabled={checkingJoinCode}
                    className="px-4 py-2.5 rounded-xl bg-[#214A38] text-white font-semibold hover:bg-[#183629] transition disabled:opacity-60 cursor-pointer"
                  >
                    {checkingJoinCode ? "Đang tìm..." : "Kiểm tra mã"}
                  </button>
                </div>
              </div>

              {joinClassError && (
                <div className="p-3 rounded-xl bg-[#9D493E]/10 border border-[#9D493E]/30 text-[#9D493E] font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{joinClassError}</span>
                </div>
              )}

              {verifiedJoinClass && (
                <div className="p-3.5 rounded-2xl bg-[#214A38]/5 border border-[#214A38]/25 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#214A38] uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#315E48]" />
                      <span>Xác minh hợp lệ:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#214A38] text-white text-[10px] font-bold">
                      HSK {verifiedJoinClass.level}
                    </span>
                  </div>
                  <div className="font-serif font-bold text-sm text-[#214A38]">
                    {verifiedJoinClass.name}
                  </div>
                  <div className="text-[11px] text-[#315E48]">
                    Giáo viên: <strong className="text-[#214A38]">{verifiedJoinClass.teacherName}</strong>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#BC9B6B]/30 font-semibold text-[#315E48] hover:bg-[#F7F4EB] transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={!verifiedJoinClass || enrolling}
                  onClick={handleConfirmEnroll}
                  className="flex-1 py-2.5 rounded-xl bg-[#9D493E] hover:bg-[#833d34] text-white font-semibold transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {enrolling ? "Đang ghi danh..." : "Xác nhận vào lớp"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: HỒ SƠ & CÀI ĐẶT (MỤC 1.2) */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-5 right-5 text-[#315E48] hover:text-[#214A38] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#214A38]/10 text-[#214A38] flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#214A38]">Hồ sơ & Cài đặt</h3>
                <p className="text-xs text-[#315E48]">Quản lý thông tin tài khoản cá nhân</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20 space-y-1">
                <div className="text-[11px] text-[#315E48]">Họ và tên:</div>
                <div className="font-bold text-[#214A38] text-sm">{studentName}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20 space-y-1">
                <div className="text-[11px] text-[#315E48]">Tên đăng nhập (username):</div>
                <div className="font-mono font-bold text-[#214A38]">@{username}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/20 space-y-1">
                <div className="text-[11px] text-[#315E48]">Địa chỉ email:</div>
                <div className="font-mono text-[#214A38]">{userEmail || "Chưa liên kết email"}</div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-[#9D493E]/10 hover:bg-[#9D493E] text-[#9D493E] hover:text-white font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất tài khoản</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#214A38] text-white font-semibold hover:bg-[#183629] transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
