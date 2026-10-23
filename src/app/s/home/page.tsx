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
  ChevronDown,
  Clock,
  Sparkles,
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
  Flame,
  FileText,
  HelpCircle,
  BarChart3,
  Award,
} from "lucide-react";
import StudentClassesWorkspace from "@/components/student/StudentClassesWorkspace";
import StudentAssignmentsWorkspace from "@/components/student/StudentAssignmentsWorkspace";
import StudentRoadmapWorkspace from "@/components/student/StudentRoadmapWorkspace";
import StudentLessonsWorkspace from "@/components/student/StudentLessonsWorkspace";
import StudentPracticeWorkspace from "@/components/student/StudentPracticeWorkspace";
import StudentReportsWorkspace from "@/components/student/StudentReportsWorkspace";
import { getClassArtwork } from "@/lib/class-helper";

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
  const [activeNav, setActiveNav] = useState("home");
  const [username, setUsername] = useState("student");
  const [studentName, setStudentName] = useState("Học viên");
  const [studyProfile, setStudyProfile] = useState<StudyProfile | null>(null);

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

  // Settings & Notification State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myClasses, setMyClasses] = useState<any[]>([]);

  const fetchMyClasses = async (studentId: string) => {
    if (!studentId) return;
    try {
      const res = await fetch(`/api/v1/classes?studentId=${encodeURIComponent(studentId)}`, {
        cache: "no-store",
        headers: { "x-user-id": studentId },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.items)) {
        const mapped = json.items.map((c: any, idx: number) => ({
          ...c,
          artwork: getClassArtwork(c.track || "HSK", c.level || 1, idx, c.name),
        }));
        setMyClasses(mapped);
      }
    } catch (err) {
      console.error("Lỗi tải lớp học của học viên:", err);
    }
  };

  useEffect(() => {
    let currentU = "student";
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const u = JSON.parse(stored);
        setCurrentUser(u);
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
        if (u.id) {
          fetchMyClasses(u.id);
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
      }

      // Check URL query param for tab
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get("tab");
        if (tab && ["home", "roadmap", "lessons", "classes", "assignments", "practice", "results"].includes(tab)) {
          setActiveNav(tab);
        }
      }
    } catch {}

    fetch(`/api/v1/my/summary?username=${currentU}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
          if (json.data.student?.name) {
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
      if (currentUser?.id) fetchMyClasses(currentUser.id);

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
    setShowGoalModal(false);
  };

  // Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5ED] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#204434] text-[#FFFCF6] flex items-center justify-center font-serif text-2xl font-bold shadow-md mb-4 animate-pulse">
          宁
        </div>
        <p className="text-sm font-semibold text-[#204434]">Đang tải không gian học tập Hanyu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#204434] font-sans selection:bg-[#204434] selection:text-[#FFFCF6] flex">
      {/* ========================================================================= */}
      {/* 1. SIDEBAR TRÁI (CÓ PHONG CẢNH THỦY MẶC DƯỚI THANH MENU) */}
      {/* ========================================================================= */}
      <aside className="fixed inset-y-0 left-0 w-60 bg-[#F8F5ED] border-r border-[#E5DEC9] z-40 hidden lg:flex flex-col justify-between shadow-xs overflow-hidden">
        {/* Background Image: phong_cảnh_thủy_mặc_giữa_sương_mờ.png spanning full sidebar */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none z-0 bg-bottom bg-no-repeat bg-cover opacity-85 mix-blend-multiply transition-opacity duration-300"
          style={{ backgroundImage: `url('/theme/dashboard/sidebar-bg.webp')` }}
        />

        {/* Content Container (z-10 ensures no text or buttons are covered) */}
        <div className="relative z-10 flex flex-col flex-1">
          {/* Logo Brand Header */}
          <div className="h-16 px-5 flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#204434] text-[#FFFCF6] flex items-center justify-center font-serif text-base font-bold shadow-xs group-hover:scale-105 transition-transform">
                <span>宁</span>
              </div>
              <div className="leading-tight">
                <div className="font-serif font-bold text-lg text-[#204434] tracking-tight">Hanyu</div>
                <div className="text-[9px] text-[#315E48] font-bold tracking-[0.16em] uppercase">
                  HỌC TIẾNG TRUNG
                </div>
              </div>
            </Link>
          </div>

          {/* Nav List */}
          <nav className="px-3 py-2 space-y-0.5 text-xs font-medium">
            {/* 1. Trang chủ */}
            <button
              type="button"
              onClick={() => setActiveNav("home")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition cursor-pointer text-left ${
                activeNav === "home"
                  ? "bg-[#204434] text-[#FFFCF6] font-semibold shadow-xs"
                  : "text-[#315E48] hover:bg-[#204434]/10 hover:text-[#204434]"
              }`}
            >
              <Home className="w-4 h-4 stroke-[1.9]" />
              <span>Trang chủ</span>
            </button>

            {/* 2. Lộ trình của tôi */}
            <button
              type="button"
              onClick={() => setActiveNav("roadmap")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition cursor-pointer text-left ${
                activeNav === "roadmap"
                  ? "bg-[#204434] text-[#FFFCF6] font-semibold shadow-xs"
                  : "text-[#315E48] hover:bg-[#204434]/10 hover:text-[#204434]"
              }`}
            >
              <Compass className="w-4 h-4 stroke-[1.8]" />
              <span>Lộ trình của tôi</span>
            </button>

            {/* 3. Kho bài học & Khám phá */}
            <button
              type="button"
              onClick={() => setActiveNav("lessons")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition cursor-pointer text-left ${
                activeNav === "lessons"
                  ? "bg-[#204434] text-[#FFFCF6] font-semibold shadow-xs"
                  : "text-[#315E48] hover:bg-[#204434]/10 hover:text-[#204434]"
              }`}
            >
              <BookOpen className="w-4 h-4 stroke-[1.8]" />
              <span>Kho bài học & Khám phá</span>
            </button>

            {/* 4. Lớp học của tôi */}
            <button
              type="button"
              onClick={() => setActiveNav("classes")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition cursor-pointer text-left ${
                activeNav === "classes"
                  ? "bg-[#204434] text-[#FFFCF6] font-semibold shadow-xs"
                  : "text-[#315E48] hover:bg-[#204434]/10 hover:text-[#204434]"
              }`}
            >
              <Users className="w-4 h-4 stroke-[1.8]" />
              <span>Lớp học của tôi</span>
            </button>

            {/* 5. Bài tập & Phòng thi */}
            <button
              type="button"
              onClick={() => setActiveNav("assignments")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer text-left ${
                activeNav === "assignments"
                  ? "bg-[#204434] text-[#FFFCF6] font-semibold shadow-xs"
                  : "text-[#315E48] hover:bg-[#204434]/10 hover:text-[#204434]"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-4 h-4 stroke-[1.8]" />
                <span>Bài tập & Phòng thi</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#9D493E]" />
            </button>

            {/* 6. Phòng luyện tập (Dropdown menu) */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setActiveNav("practice")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer text-left ${
                  activeNav === "practice"
                    ? "bg-[#204434] text-[#FFFCF6] font-semibold shadow-xs"
                    : "text-[#315E48] hover:bg-[#204434]/10 hover:text-[#204434]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Dumbbell className="w-4 h-4 stroke-[1.8]" />
                  <span>Phòng luyện tập</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Sub-items */}
              <div className="pl-9 pr-2 py-0.5 space-y-1 text-[11px] text-[#315E48]/85 font-normal">
                <Link
                  href="/s/review"
                  className="block py-1 hover:text-[#204434] transition hover:translate-x-0.5"
                >
                  Luyện từ vựng
                </Link>
                <Link
                  href="/s/review"
                  className="block py-1 hover:text-[#204434] transition hover:translate-x-0.5"
                >
                  Luyện ngữ pháp
                </Link>
                <Link
                  href="/s/games"
                  className="block py-1 hover:text-[#204434] transition hover:translate-x-0.5"
                >
                  Game phản xạ HSK
                </Link>
                <Link
                  href="/s/practice/wrong"
                  className="block py-1 hover:text-[#204434] transition hover:translate-x-0.5"
                >
                  Sổ câu hỏi sai
                </Link>
              </div>
            </div>

            {/* 7. Kết quả & Báo cáo */}
            <button
              type="button"
              onClick={() => setActiveNav("results")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition cursor-pointer text-left ${
                activeNav === "results"
                  ? "bg-[#204434] text-[#FFFCF6] font-semibold shadow-xs"
                  : "text-[#315E48] hover:bg-[#204434]/10 hover:text-[#204434]"
              }`}
            >
              <RotateCw className="w-4 h-4 stroke-[1.8]" />
              <span>Kết quả học tập</span>
            </button>

            {/* 8. Hồ sơ & Cài đặt */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#315E48] hover:bg-[#204434]/10 hover:text-[#204434] transition cursor-pointer text-left"
            >
              <Settings className="w-4 h-4 stroke-[1.8]" />
              <span>Hồ sơ & Cài đặt</span>
            </button>
          </nav>
        </div>

        {/* User Card & Logout (Bottom) */}
        <div className="relative z-10 p-3 pt-0">
          <div className="p-2 rounded-2xl bg-[#FFFCF6]/95 border border-[#E5DEC9] shadow-xs flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#204434]/10 border border-[#BC9B6B]/30 relative shrink-0">
                <Image
                  src="/theme/avatar-student.jpg"
                  alt="ning"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="leading-tight truncate">
                <span className="font-bold text-xs text-[#204434] block truncate">
                  {studentName}
                </span>
                <span className="text-[10px] text-[#315E48] block">
                  HSK 1 · 50 XP
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="text-[#315E48] hover:text-[#204434] p-1 cursor-pointer"
              title="Xem thông tin"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-[#315E48] hover:text-[#9D493E] hover:bg-white/60 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. KHU VỰC NỘI DUNG CHÍNH (MAIN VIEWPORT) */}
      {/* ========================================================================= */}
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 bg-[#F8F5ED]/90 backdrop-blur-md border-b border-[#E5DEC9]">
          {/* Search bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-[#315E48] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm bài học, từ vựng, chủ đề..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] text-xs text-[#204434] placeholder:text-[#315E48]/60 focus:outline-hidden focus:border-[#204434] transition shadow-2xs"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 ml-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setHasUnreadNotification(false);
                }}
                className="w-9 h-9 rounded-full bg-[#FFFCF6] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center relative transition cursor-pointer shadow-2xs"
                title="Thông báo hệ thống"
              >
                <Bell className="w-4 h-4" />
                {hasUnreadNotification && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9D493E] absolute top-2 right-2 border-2 border-[#FFFCF6] animate-pulse" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xl p-4 z-50 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#E5DEC9]">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-[#8F6D3B]" />
                      <h4 className="font-serif font-bold text-sm text-[#204434]">Thông báo mới</h4>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-[#315E48] hover:underline cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto divide-y divide-[#E5DEC9]/50">
                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveNav("assignments");
                      }}
                      className="pt-2 first:pt-0 p-2 rounded-xl hover:bg-[#FAF7F0] transition cursor-pointer flex items-start gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-[#204434]">Cô Vương Lệ vừa giao bài tập mới</p>
                        <p className="text-[11px] text-[#315E48] mt-0.5">Bài tập 5: Ôn từ vựng & phản xạ Mua sắm (HSK 1)</p>
                        <span className="text-[10px] text-[#8F6D3B] font-mono mt-1 block">15 phút trước</span>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveNav("assignments");
                      }}
                      className="pt-2 p-2 rounded-xl hover:bg-[#FAF7F0] transition cursor-pointer flex items-start gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-[#204434]">Đã công bố điểm bài kiểm tra</p>
                        <p className="text-[11px] text-[#315E48] mt-0.5">Điểm số của bạn: 8.5/10 · Xếp hạng 3 toàn lớp</p>
                        <span className="text-[10px] text-[#8F6D3B] font-mono mt-1 block">2 giờ trước</span>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveNav("classes");
                      }}
                      className="pt-2 p-2 rounded-xl hover:bg-[#FAF7F0] transition cursor-pointer flex items-start gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-[#204434]">Nhắc nhở ca học trực tuyến tối nay</p>
                        <p className="text-[11px] text-[#315E48] mt-0.5">19:30 – 21:00: Ca học Google Meet cùng cô Vương Lệ</p>
                        <span className="text-[10px] text-[#8F6D3B] font-mono mt-1 block">Hôm nay</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5DEC9] text-center">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveNav("assignments");
                      }}
                      className="text-xs text-[#204434] font-bold hover:underline"
                    >
                      Xem toàn bộ bài tập & phòng thi &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Student User Pill */}
            <button
              type="button"
              onClick={() => setShowGoalModal(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#FFFCF6] border border-[#E5DEC9] hover:border-[#204434]/40 transition shadow-2xs cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-[#204434]/10 border border-[#BC9B6B]/30 relative shrink-0">
                <Image
                  src="/theme/avatar-student.jpg"
                  alt="Avatar"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="leading-tight hidden sm:block">
                <div className="text-xs font-bold text-[#204434]">
                  Xin chào, {studentName}
                </div>
                <div className="text-[10px] text-[#315E48]">
                  HSK 3.0 · {studyProfile?.dailyTime || 30} phút/ngày
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#315E48]" />
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* DASHBOARD BODY (WORKSPACE BRANCHING) */}
        {/* ========================================================================= */}
        <main className="p-4 sm:p-7 space-y-6 max-w-[1780px] w-full mx-auto">
          {activeNav === "classes" ? (
            <StudentClassesWorkspace
              currentUser={currentUser}
              onOpenJoinModal={() => setShowJoinModal(true)}
            />
          ) : activeNav === "assignments" ? (
            <StudentAssignmentsWorkspace
              currentUser={currentUser}
              onNavigateToTab={(tab) => setActiveNav(tab)}
              classesCount={myClasses.length}
              onOpenJoinModal={() => setShowJoinModal(true)}
            />
          ) : activeNav === "roadmap" ? (
            <StudentRoadmapWorkspace
              currentUser={currentUser}
              onNavigateToTab={(tab) => setActiveNav(tab)}
              classesCount={myClasses.length}
              onOpenJoinModal={() => setShowJoinModal(true)}
            />
          ) : activeNav === "lessons" ? (
            <StudentLessonsWorkspace
              currentUser={currentUser}
              onNavigateToTab={(tab) => setActiveNav(tab)}
              classesCount={myClasses.length}
              onOpenJoinModal={() => setShowJoinModal(true)}
            />
          ) : activeNav === "practice" ? (
            <StudentPracticeWorkspace
              currentUser={currentUser}
              onNavigateToTab={(tab) => setActiveNav(tab)}
              classesCount={myClasses.length}
              onOpenJoinModal={() => setShowJoinModal(true)}
            />
          ) : activeNav === "results" ? (
            <StudentReportsWorkspace
              currentUser={currentUser}
              onNavigateToTab={(tab) => setActiveNav(tab)}
              classesCount={myClasses.length}
              onOpenJoinModal={() => setShowJoinModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* --------------------------------------------------------------------- */}
            {/* CỘT TRÁI (~70% WIDTH) */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-8 space-y-6">
              {/* 2. BANNER CHÀO MỪNG */}
              <section
                className="relative rounded-3xl border border-[#E5DEC9] shadow-xs overflow-hidden min-h-[220px] sm:min-h-[240px] flex items-center bg-[#F8F5ED]"
                style={{
                  backgroundImage: `url('/theme/dashboard/banner-bg.webp')`,
                  backgroundPosition: "right center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              >
                {/* Soft left gradient overlay to guarantee text readability without hiding illustration */}
                <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-center bg-gradient-to-r from-[#F8F5ED]/95 via-[#F8F5ED]/85 to-transparent sm:max-w-2xl">
                  {/* Date line */}
                  <div className="text-xs text-[#315E48] font-medium mb-1.5 flex items-center gap-1.5">
                    <span className="capitalize">
                      {new Date().toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Greeting */}
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A3D2F] tracking-tight">
                    Chào mừng trở lại, {studentName}!
                  </h1>

                  {/* Motto */}
                  <div className="mt-2 space-y-1">
                    <div className="font-serif font-bold text-sm text-[#204434]">
                      “千里之行，始于足下”
                    </div>
                    <p className="text-xs text-[#315E48] leading-relaxed max-w-lg">
                      Hành trình vạn dặm bắt đầu từ một bước chân. Kiên trì từng ngày sẽ vươn tới thành công.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center gap-3 flex-wrap">
                    {myClasses.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => setShowJoinModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] text-xs font-semibold shadow-md shadow-[#204434]/15 transition cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
                        <span>Tham gia lớp học bằng mã ngay</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveNav("classes")}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] text-xs font-semibold shadow-md shadow-[#204434]/15 transition cursor-pointer"
                        >
                          <span>Vào lớp học của tôi</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveNav("assignments")}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-[#BC9B6B] text-[#8F6D3B] text-xs font-bold shadow-2xs transition cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>Xem bài tập & phòng thi</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* 4 THẺ METRIC STATS TRỰC TIẾP DƯỚI BANNER */}
              <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Trình độ hiện tại */}
                <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#204434]/10 text-[#204434] flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#315E48]">Trình độ hiện tại</div>
                    <div className="text-sm font-bold text-[#204434]">
                      {myClasses.length > 0
                        ? `${myClasses[0]?.track || "HSK"} ${myClasses[0]?.level || 1}`
                        : "Chưa vào lớp"}
                    </div>
                  </div>
                </div>

                {/* 2. Mục tiêu học tập */}
                <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#9D493E]/10 text-[#9D493E] flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#315E48]">Mục tiêu học tập</div>
                    <div className="text-sm font-bold text-[#204434] truncate">
                      {myClasses.length > 0 ? `Lớp ${myClasses[0]?.name}` : "Chờ ghi danh lớp"}
                    </div>
                  </div>
                </div>

                {/* 3. Thời gian học mỗi ngày */}
                <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#315E48]/10 text-[#315E48] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#315E48]">Thời gian học mỗi ngày</div>
                    <div className="text-sm font-bold text-[#204434]">
                      {myClasses.length > 0
                        ? `${studyProfile?.dailyTime || 30} phút`
                        : "Chưa thiết lập"}
                    </div>
                  </div>
                </div>

                {/* 4. Chuỗi học tập */}
                <div className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#315E48]">Chuỗi học tập</div>
                    <div className="text-sm font-bold text-[#204434]">
                      {data?.student?.streakDays || currentUser?.streakDays || 0} ngày liên tục
                    </div>
                  </div>
                </div>
              </section>

              {/* PHÂN NHÁNH GIAO DIỆN CHÍNH: CHƯA VÀO LỚP VS ĐÃ VÀO LỚP */}
              {myClasses.length === 0 ? (
                /* ========================================================================= */
                /* TRẠNG THÁI CHƯA VÀO LỚP: HƯỚNG DẪN GHI DANH & MỞ KHÓA TOÀN BỘ CHỨC NĂNG  */
                /* ========================================================================= */
                <div className="space-y-6 animate-fadeIn">
                  {/* Hero Box: Kích hoạt hệ sinh thái học tập */}
                  <div className="bg-[#FFFCF6] border-2 border-[#BC9B6B]/60 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#BC9B6B]/20 pb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#204434] text-[#BC9B6B] flex items-center justify-center shrink-0 shadow-xs">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-serif font-bold text-[#204434]">
                            Bạn hiện chưa tham gia lớp học nào
                          </h2>
                          <p className="text-xs text-[#315E48] mt-0.5">
                            Nhập mã lớp từ giáo viên hoặc trung tâm để mở khóa lộ trình học tập, kho bài học và bài tập.
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        Chờ ghi danh lớp
                      </span>
                    </div>

                    {/* Quick Join Class Input */}
                    <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-3">
                      <label className="block text-xs font-bold text-[#204434]">
                        Ghi danh nhanh bằng mã lớp học (Class Code):
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={joinClassCode}
                            onChange={(e) => setJoinClassCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleVerifyJoinCode();
                            }}
                            placeholder="Nhập mã lớp học (VD: HSK1A-2026, HSK2-EXP...)"
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#BC9B6B]/60 text-xs font-mono uppercase tracking-wider text-[#204434] focus:outline-none focus:ring-2 focus:ring-[#204434]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyJoinCode}
                          disabled={checkingJoinCode || !joinClassCode.trim()}
                          className="px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                        >
                          {checkingJoinCode ? (
                            <>
                              <RotateCw className="w-4 h-4 animate-spin" />
                              <span>Đang kiểm tra...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
                              <span>Tham gia lớp ngay</span>
                            </>
                          )}
                        </button>
                      </div>
                      {joinClassError && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{joinClassError}</span>
                        </p>
                      )}
                    </div>

                    {/* 4 Trụ Cột Sẽ Tự Động Kích Hoạt */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#315E48]">
                        Các tính năng sẽ tự động mở khóa sau khi vào lớp:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-1.5">
                          <div className="flex items-center gap-2 text-[#204434]">
                            <Compass className="w-4 h-4 text-[#8F6D3B]" />
                            <h5 className="font-bold text-xs">1. Lộ trình của tôi</h5>
                          </div>
                          <p className="text-[11px] text-[#315E48] leading-relaxed">
                            Cây tiến trình bám sát theo giáo trình chuẩn HSK 3.0 và mục tiêu của lớp.
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-1.5">
                          <div className="flex items-center gap-2 text-[#204434]">
                            <BookOpen className="w-4 h-4 text-[#8F6D3B]" />
                            <h5 className="font-bold text-xs">2. Kho bài học & Khám phá</h5>
                          </div>
                          <p className="text-[11px] text-[#315E48] leading-relaxed">
                            Từ vựng, ngữ pháp, audio hội thoại Bắc Kinh và slide bài giảng của từng buổi.
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-1.5">
                          <div className="flex items-center gap-2 text-[#204434]">
                            <FileCheck2 className="w-4 h-4 text-[#8F6D3B]" />
                            <h5 className="font-bold text-xs">3. Bài tập & Phòng thi</h5>
                          </div>
                          <p className="text-[11px] text-[#315E48] leading-relaxed">
                            Bài tập về nhà, đề kiểm tra định kỳ và phòng thi trực tuyến do giáo viên giao.
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-1.5">
                          <div className="flex items-center gap-2 text-[#204434]">
                            <Dumbbell className="w-4 h-4 text-[#8F6D3B]" />
                            <h5 className="font-bold text-xs">4. Phòng luyện & Sổ lỗi sai</h5>
                          </div>
                          <p className="text-[11px] text-[#315E48] leading-relaxed">
                            Thuật toán Spaced Repetition tự động gom các câu bạn làm sai để luyện lại.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================================= */
                /* KHI ĐÃ CÓ LỚP HỌC: HIỂN THỊ NỘI DUNG HỌC TẬP THỰC TẾ                      */
                /* ========================================================================= */
                <div className="space-y-6">
                  {/* HÀNG GIỮA: 2 CARD SONG SONG (LỚP HỌC HIỆN TẠI + KẾ HOẠCH HÔM NAY) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CARD 1: LỚP HỌC ĐANG THEO HỌC */}
                    <section
                      id="current-lesson"
                      className="bg-[#FFFCF6] rounded-3xl p-5 border border-[#E5DEC9] shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/60">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[#204434]" />
                            <h3 className="font-bold text-sm text-[#204434]">Lớp học của bạn</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveNav("classes")}
                            className="text-xs text-[#315E48] hover:text-[#204434] flex items-center gap-1 font-medium cursor-pointer"
                          >
                            <span>Chi tiết lớp</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Class Content */}
                        <div className="mt-3.5 flex gap-3.5">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#204434]/10 border border-[#BC9B6B]/30 relative shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={myClasses[0]?.artwork || "/theme/card-hsk-scroll.webp"}
                              alt={myClasses[0]?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-[#BC9B6B]/20 text-[#7A5B2E] text-[10px] font-bold mb-1">
                              {myClasses[0]?.track} · Cấp {myClasses[0]?.level || 1}
                            </span>
                            <h4 className="font-serif font-bold text-sm text-[#204434] truncate">
                              {myClasses[0]?.name}
                            </h4>
                            <p className="text-[11px] text-[#315E48] mt-0.5 line-clamp-2 leading-relaxed">
                              GV: {myClasses[0]?.teacherName} · Mã lớp: {myClasses[0]?.code}
                            </p>
                          </div>
                        </div>

                        {/* Class info */}
                        <div className="mt-4 p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9]/60 text-xs text-[#315E48] flex items-center justify-between">
                          <span>Thời gian học:</span>
                          <span className="font-bold text-[#204434]">
                            {myClasses[0]?.startDate} – {myClasses[0]?.endDate}
                          </span>
                        </div>
                      </div>

                      {/* Footer Action */}
                      <div className="pt-4 mt-4 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                        <span className="text-xs text-[#315E48]">
                          {data?.assignments ? `${data.assignments.length} bài tập đã giao` : "Đang cập nhật"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveNav("classes")}
                          className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <span>Xem lịch học</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </section>

                    {/* CARD 2: KẾ HOẠCH HÔM NAY */}
                    <section className="bg-[#FFFCF6] rounded-3xl p-5 border border-[#E5DEC9] shadow-2xs flex flex-col justify-between">
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/60">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#204434]" />
                            <h3 className="font-bold text-sm text-[#204434]">Kế hoạch hôm nay</h3>
                          </div>
                          <span className="text-xs font-semibold text-[#315E48]">
                            {data?.counts?.pendingAssignments || 0} bài cần làm
                          </span>
                        </div>

                        {/* Task List */}
                        <div className="mt-3 space-y-2.5">
                          {data?.assignments && data.assignments.filter((a) => !a.hasAttempted).length > 0 ? (
                            data.assignments
                              .filter((a) => !a.hasAttempted)
                              .slice(0, 3)
                              .map((asg) => (
                                <div
                                  key={asg.id}
                                  className="flex items-center justify-between p-2 rounded-xl bg-[#F8F5ED] border border-[#E5DEC9]/60 text-xs"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Clock className="w-3.5 h-3.5 text-[#9D493E] shrink-0" />
                                    <div className="leading-tight truncate">
                                      <span className="font-semibold block truncate text-xs text-[#204434]">
                                        {asg.title}
                                      </span>
                                      <span className="text-[10px] text-[#315E48]">
                                        {asg.className} · {asg.durationMin} phút
                                      </span>
                                    </div>
                                  </div>
                                  <Link
                                    href={`/s/attempts/${asg.id}`}
                                    className="px-2.5 py-1 rounded-lg bg-[#204434] text-white text-[11px] font-semibold hover:bg-[#183629] transition shrink-0 ml-2"
                                  >
                                    Làm bài
                                  </Link>
                                </div>
                              ))
                          ) : (
                            <div className="p-4 text-center text-xs text-[#315E48] space-y-2">
                              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                              <p>Tuyệt vời! Bạn không có bài tập nào cần làm gấp hôm nay.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setActiveNav("assignments")}
                          className="text-xs text-[#204434] font-bold hover:underline cursor-pointer"
                        >
                          Xem tất cả bài tập &rarr;
                        </button>
                      </div>
                    </section>
                  </div>

                  {/* KHÁM PHÁ BÀI HỌC */}
                  <section id="explore" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#204434]" />
                        <h3 className="font-bold text-sm text-[#204434]">Kho bài học của lớp</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveNav("lessons")}
                        className="text-xs text-[#315E48] hover:text-[#204434] flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>Mở kho bài học</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div
                        onClick={() => setActiveNav("lessons")}
                        className="p-5 rounded-3xl border border-[#E5DEC9] shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[145px] group hover:border-[#204434]/50 transition bg-[#FFFCF6] cursor-pointer"
                        style={{
                          backgroundImage: `url('/theme/dashboard/card-hsk.webp')`,
                          backgroundPosition: "right bottom",
                          backgroundSize: "contain",
                          backgroundRepeat: "no-repeat",
                        }}
                      >
                        <div className="relative z-10 max-w-[65%]">
                          <h4 className="font-serif font-bold text-base text-[#204434]">
                            HSK 3.0
                          </h4>
                          <div className="text-xs font-semibold text-[#315E48] mt-0.5">
                            Cấp độ {myClasses[0]?.level || 1}
                          </div>
                          <p className="text-[11px] text-[#315E48]/80 mt-1 leading-snug">
                            Giáo trình và bài giảng chuẩn hóa của lớp
                          </p>
                        </div>
                        <div className="relative z-10 pt-3">
                          <div className="w-7 h-7 rounded-full bg-white/90 border border-[#E5DEC9] flex items-center justify-center text-[#204434] group-hover:bg-[#204434] group-hover:text-white transition shadow-2xs">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => setActiveNav("practice")}
                        className="p-5 rounded-3xl border border-[#E5DEC9] shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[145px] group hover:border-[#204434]/50 transition bg-[#FFFCF6] cursor-pointer"
                        style={{
                          backgroundImage: `url('/theme/dashboard/card-topic.webp')`,
                          backgroundPosition: "right bottom",
                          backgroundSize: "contain",
                          backgroundRepeat: "no-repeat",
                        }}
                      >
                        <div className="relative z-10 max-w-[65%]">
                          <h4 className="font-serif font-bold text-base text-[#204434]">
                            Phòng luyện tập
                          </h4>
                          <div className="text-xs font-semibold text-[#315E48] mt-0.5">
                            AI Spaced Repetition
                          </div>
                          <p className="text-[11px] text-[#315E48]/80 mt-1 leading-snug">
                            Ôn từ vựng, flashcard & câu sai
                          </p>
                        </div>
                        <div className="relative z-10 pt-3">
                          <div className="w-7 h-7 rounded-full bg-white/90 border border-[#E5DEC9] flex items-center justify-center text-[#204434] group-hover:bg-[#204434] group-hover:text-white transition shadow-2xs">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => setActiveNav("roadmap")}
                        className="p-5 rounded-3xl border border-[#E5DEC9] shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[145px] group hover:border-[#204434]/50 transition bg-[#FFFCF6] cursor-pointer"
                        style={{
                          backgroundImage: `url('/theme/dashboard/card-major.webp')`,
                          backgroundPosition: "right bottom",
                          backgroundSize: "contain",
                          backgroundRepeat: "no-repeat",
                        }}
                      >
                        <div className="relative z-10 max-w-[65%]">
                          <h4 className="font-serif font-bold text-base text-[#204434]">
                            Lộ trình của tôi
                          </h4>
                          <div className="text-xs font-semibold text-[#315E48] mt-0.5">
                            Cây kỹ năng HSK
                          </div>
                          <p className="text-[11px] text-[#315E48]/80 mt-1 leading-snug">
                            Theo dõi mục tiêu từng chặng học
                          </p>
                        </div>
                        <div className="relative z-10 pt-3">
                          <div className="w-7 h-7 rounded-full bg-white/90 border border-[#E5DEC9] flex items-center justify-center text-[#204434] group-hover:bg-[#204434] group-hover:text-white transition shadow-2xs">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* CỘT PHẢI (~30% WIDTH) */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-4 space-y-5">
              {/* CARD 1: TIẾN ĐỘ TỔNG QUAN */}
              <section className="bg-[#FFFCF6] rounded-3xl p-5 border border-[#E5DEC9] shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/60">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#204434]" />
                    <h3 className="font-bold text-sm text-[#204434]">Tiến độ tổng quan</h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#315E48]" />
                </div>

                <div className="flex items-center justify-between gap-4">
                  {/* Circular Progress Gauge */}
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <path
                        className="text-[#E5DEC9]"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Active progress */}
                      <path
                        className="text-[#204434]"
                        strokeDasharray="40, 100"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center leading-none">
                      <span className="text-lg font-bold text-[#204434]">
                        {myClasses.length === 0 ? "0%" : "40%"}
                      </span>
                      <span className="block text-[8.5px] text-[#315E48] mt-0.5">
                        Hoàn thành<br />mục tiêu
                      </span>
                    </div>
                  </div>

                  {/* 3 Metrics list */}
                  <div className="space-y-2 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#315E48]">Bài đã hoàn thành</span>
                      <span className="font-bold text-[#204434]">
                        {data?.assignments?.filter((a: any) => a.hasAttempted)?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#315E48]">Tỷ lệ trả lời đúng</span>
                      <span className="font-bold text-[#204434]">
                        {myClasses.length > 0 ? "85%" : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#315E48]">Câu sai cần ôn</span>
                      <span className="font-bold text-[#9D493E]">
                        {data?.counts?.wrongQuestions || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* CARD 2: BÀI SẮP ĐẾN HẠN */}
              <section
                id="assignments"
                className="bg-[#FFFCF6] rounded-3xl p-5 border border-[#E5DEC9] shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/60">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#9D493E]" />
                    <h3 className="font-bold text-sm text-[#204434]">Bài sắp đến hạn</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNav("assignments")}
                    className="text-xs text-[#315E48] hover:text-[#204434] flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <span>Xem tất cả</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {data?.assignments && data.assignments.filter((a) => !a.hasAttempted).length > 0 ? (
                    data.assignments
                      .filter((a) => !a.hasAttempted)
                      .slice(0, 3)
                      .map((item) => (
                        <Link
                          key={item.id}
                          href={`/s/attempts/${item.id}`}
                          className="p-3 rounded-2xl bg-[#F8F5ED] hover:bg-[#FAF7F0] border border-[#E5DEC9]/60 flex items-center justify-between text-xs transition cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center shrink-0 font-bold font-serif">
                              考
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-xs text-[#204434] group-hover:text-[#8F6D3B] transition truncate">
                                {item.title}
                              </div>
                              <div className="text-[10px] text-[#315E48]">
                                {item.className} · Hạn: {item.dueAt ? new Date(item.dueAt).toLocaleDateString("vi-VN") : "Hôm nay"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="px-3 py-1 rounded-xl bg-[#204434] text-white text-[11px] font-bold group-hover:bg-[#183629] transition shadow-2xs flex items-center gap-1">
                              <span>Làm bài</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </Link>
                      ))
                  ) : (
                    <div className="p-5 text-center bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9]/60 space-y-2">
                      <p className="text-xs text-[#315E48]">
                        {myClasses.length === 0
                          ? "Bạn chưa tham gia lớp học nào nên chưa có bài tập."
                          : "Tuyệt vời! Bạn không có bài tập nào sắp đến hạn."}
                      </p>
                      {myClasses.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => setShowJoinModal(true)}
                          className="px-3 py-1.5 rounded-xl bg-[#204434] text-white text-[11px] font-semibold hover:bg-[#183629] transition cursor-pointer"
                        >
                          Tham gia lớp học ngay
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveNav("practice")}
                          className="text-xs text-[#204434] font-bold hover:underline cursor-pointer"
                        >
                          Vào phòng luyện tập tự do &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* CARD 3: LỚP HỌC CỦA TÔI */}
              <section
                id="classes"
                className="bg-[#FFFCF6] rounded-3xl p-5 border border-[#E5DEC9] shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/60">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#204434]" />
                    <h3 className="font-bold text-sm text-[#204434]">Lớp học của tôi</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNav("classes")}
                    className="text-xs text-[#315E48] hover:text-[#204434] flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <span>Xem tất cả ({myClasses.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Danh sách lớp học thực tế từ Neon PostgreSQL */}
                {myClasses.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-[#F8F5ED] border border-[#E5DEC9]/60 text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center mx-auto">
                      <Users className="w-5 h-5 opacity-75" />
                    </div>
                    <h4 className="font-bold text-xs text-[#204434]">Bạn chưa tham gia lớp học nào</h4>
                    <p className="text-[11px] text-[#315E48] max-w-xs mx-auto">
                      Nhập mã lớp từ giáo viên để cùng tham gia làm bài tập và theo dõi tiến độ học tập.
                    </p>
                  </div>
                ) : (
                  myClasses.slice(0, 2).map((cl) => {
                    const isUpcoming = cl.status === "UPCOMING";
                    const isPaused = cl.status === "PAUSED";
                    const isEnded = cl.status === "ENDED";
                    const statusBg = isPaused
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : isUpcoming
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : isEnded
                      ? "bg-neutral-100 text-neutral-600 border-neutral-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200";

                    return (
                      <div
                        key={cl.id}
                        onClick={() => setActiveNav("classes")}
                        className="p-3.5 rounded-2xl bg-[#F8F5ED] border border-[#E5DEC9]/70 space-y-3 hover:border-[#204434]/50 transition cursor-pointer relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Artwork icon */}
                            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[#BC9B6B]/30 relative shadow-2xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={cl.artwork || "/theme/card-hsk-scroll.webp"}
                                alt={cl.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#204434]/10 text-[#204434]">
                                  {cl.track} · Cấp {cl.level || 1}
                                </span>
                                <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-medium border ${statusBg}`}>
                                  {cl.statusText || (isPaused ? "Tạm dừng" : isUpcoming ? "Sắp bắt đầu" : isEnded ? "Đã kết thúc" : "Đang học")}
                                </span>
                              </div>
                              <h4 className="font-bold text-xs text-[#204434] truncate mt-0.5">{cl.name}</h4>
                              <div className="text-[10px] text-[#315E48]">GV: {cl.teacherName}</div>
                              {/* CLASS-003: Full dates DD/MM/YYYY – DD/MM/YYYY */}
                              <div className="text-[10px] text-[#315E48]/80 whitespace-nowrap">
                                {cl.startDate} – {cl.endDate}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveNav("classes");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold transition shadow-2xs shrink-0 cursor-pointer"
                          >
                            Vào lớp
                          </button>
                        </div>

                        {/* CLASS-002: Tiến độ bài tập */}
                        <div className="pt-2 border-t border-[#E5DEC9]/50 flex items-center justify-between text-[10px]">
                          <span className="text-[#315E48]">Tiến độ bài tập:</span>
                          <span className={`font-bold ${cl.progressPercent === null ? "text-[#315E48]/70 italic" : "text-[#204434]"}`}>
                            {cl.progressPercent === null || cl.totalAssignments === 0
                              ? "Chưa có dữ liệu tiến độ"
                              : `${cl.progressPercent}% (${cl.submittedAssignments || 0}/${cl.totalAssignments})`}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Join new class button */}
                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="w-full py-2.5 rounded-2xl border border-dashed border-[#BC9B6B]/40 hover:border-[#204434] text-xs font-semibold text-[#315E48] hover:text-[#204434] bg-[#FFFCF6] hover:bg-[#204434]/5 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>+ Nhập mã lớp / Tham gia lớp học mới</span>
                </button>
              </section>

              {/* CARD 4: KẾT QUẢ HỌC TẬP */}
              <section
                id="results"
                className="bg-[#FFFCF6] rounded-3xl p-5 border border-[#E5DEC9] shadow-2xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/60">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#204434]" />
                    <h3 className="font-bold text-sm text-[#204434]">Kết quả học tập</h3>
                  </div>
                  <Link
                    href="#results"
                    className="text-xs text-[#315E48] hover:text-[#204434] flex items-center gap-1 font-medium"
                  >
                    <span>Xem chi tiết</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="flex items-end justify-between gap-4">
                  {/* 7 Days Bar Chart */}
                  <div className="flex items-end gap-1.5 h-24 flex-1">
                    {[
                      { day: "T2", h: "45%", active: true },
                      { day: "T3", h: "75%", active: true },
                      { day: "T4", h: "30%", active: true },
                      { day: "T5", h: "90%", active: true },
                      { day: "T6", h: "60%", active: true },
                      { day: "T7", h: "80%", active: true },
                      { day: "CN", h: "40%", active: true },
                    ].map((col, idx) => (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                      >
                        <div
                          className="w-full bg-[#204434] rounded-t-md transition-all hover:bg-[#183629]"
                          style={{ height: col.h }}
                        />
                        <span className="text-[9.5px] text-[#315E48] font-medium">
                          {col.day}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Details */}
                  <div className="space-y-1.5 text-xs shrink-0 border-l border-[#E5DEC9]/60 pl-3">
                    <div className="text-[11px] font-bold text-[#204434] mb-1">Tuần này</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#315E48]">
                      <Clock className="w-3 h-3 text-[#315E48]" />
                      <span>Thời gian:</span>
                      <strong className="text-[#204434]">2h 30p</strong>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#315E48]">
                      <CheckCircle2 className="w-3 h-3 text-[#315E48]" />
                      <span>Bài xong:</span>
                      <strong className="text-[#204434]">8</strong>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#315E48]">
                      <Target className="w-3 h-3 text-[#315E48]" />
                      <span>Tỷ lệ đúng:</span>
                      <strong className="text-[#204434]">86%</strong>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ĐỔI MỤC TIÊU HỌC TẬP */}
      {/* ========================================================================= */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowGoalModal(false)}
              className="absolute top-5 right-5 text-[#315E48] hover:text-[#204434] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#204434]">Thiết lập mục tiêu học tập</h3>
                <p className="text-xs text-[#315E48]">
                  Cập nhật lộ trình theo nhu cầu của bạn (Tiến độ học tập trước đó luôn được bảo toàn)
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Chọn hướng học */}
              <div>
                <label className="block font-bold text-[#204434] mb-1.5">Hướng học trọng tâm:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "hsk", label: "HSK 3.0", desc: "Theo 6 cấp độ" },
                    { key: "topic", label: "Theo chủ đề", desc: "Giao tiếp thực tế" },
                    { key: "major", label: "Chuyên ngành", desc: "Đại học / Kinh tế" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setEditingTrack(t.key as any)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        editingTrack === t.key
                          ? "bg-[#204434] text-white border-[#204434]"
                          : "bg-[#F8F5ED] text-[#204434] border-[#E5DEC9] hover:border-[#204434]/40"
                      }`}
                    >
                      <div className="font-bold text-xs">{t.label}</div>
                      <div className={`text-[10px] mt-0.5 ${editingTrack === t.key ? "text-white/80" : "text-[#315E48]"}`}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nếu chọn chuyên ngành */}
              {editingTrack === "major" && (
                <div>
                  <label className="block font-bold text-[#204434] mb-1.5">Ngành học chuyên sâu:</label>
                  <select
                    value={editingMajor}
                    onChange={(e) => setEditingMajor(e.target.value)}
                    className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs text-[#204434] outline-none"
                  >
                    <option value="Kinh tế & Quản trị">Kinh tế & Quản trị</option>
                    <option value="Thương mại quốc tế">Thương mại quốc tế</option>
                    <option value="Du lịch & Khách sạn">Du lịch & Khách sạn</option>
                    <option value="Kỹ thuật & Công nghệ">Kỹ thuật & Công nghệ</option>
                    <option value="Y học & Dược học">Y học & Dược học</option>
                  </select>
                </div>
              )}

              {/* Thời gian mỗi ngày */}
              <div>
                <label className="block font-bold text-[#204434] mb-1.5">Thời gian học cam kết mỗi ngày:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEditingDailyTime(mins as any)}
                      className={`py-2 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                        editingDailyTime === mins
                          ? "bg-[#204434] text-white border-[#204434]"
                          : "bg-[#F8F5ED] text-[#204434] border-[#E5DEC9]"
                      }`}
                    >
                      {mins} phút / ngày
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E5DEC9] font-semibold text-[#315E48] hover:bg-[#F8F5ED] transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveGoal}
                  className="flex-1 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-semibold transition cursor-pointer shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: THAM GIA LỚP HỌC MỚI BẰNG MÃ */}
      {/* ========================================================================= */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-5 right-5 text-[#315E48] hover:text-[#204434] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#9D493E]/10 text-[#9D493E] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#204434]">Tham gia lớp học mới</h3>
                <p className="text-xs text-[#315E48]">Nhập mã lớp do giáo viên cung cấp</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#204434] mb-1.5">Mã lớp học:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinClassCode}
                    onChange={(e) => {
                      setJoinClassCode(e.target.value.toUpperCase());
                      setJoinClassError("");
                    }}
                    placeholder="Ví dụ: HANYU3A"
                    className="flex-1 bg-[#F8F5ED] border border-[#E5DEC9] focus:border-[#204434] focus:bg-white rounded-xl px-3.5 py-2 font-mono font-bold tracking-wider text-[#204434] uppercase outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyJoinCode}
                    disabled={checkingJoinCode}
                    className="px-4 py-2 rounded-xl bg-[#204434] text-white font-semibold hover:bg-[#183629] transition disabled:opacity-60 cursor-pointer"
                  >
                    {checkingJoinCode ? "Đang tìm..." : "Kiểm tra"}
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
                <div className="p-3.5 rounded-2xl bg-[#204434]/5 border border-[#204434]/25 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#204434] uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#315E48]" />
                      <span>Xác minh hợp lệ:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#204434] text-white text-[10px] font-bold">
                      HSK {verifiedJoinClass.level}
                    </span>
                  </div>
                  <div className="font-serif font-bold text-sm text-[#204434]">
                    {verifiedJoinClass.name}
                  </div>
                  <div className="text-[11px] text-[#315E48]">
                    Giáo viên: <strong className="text-[#204434]">{verifiedJoinClass.teacherName}</strong>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E5DEC9] font-semibold text-[#315E48] hover:bg-[#F8F5ED] transition"
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
      {/* MODAL 3: HỒ SƠ & CÀI ĐẶT */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-5 right-5 text-[#315E48] hover:text-[#204434] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#204434]">Hồ sơ & Cài đặt</h3>
                <p className="text-xs text-[#315E48]">Quản lý thông tin tài khoản cá nhân</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F8F5ED] border border-[#E5DEC9] space-y-1">
                <div className="text-[11px] text-[#315E48]">Họ và tên:</div>
                <div className="font-bold text-[#204434] text-sm">{studentName}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8F5ED] border border-[#E5DEC9] space-y-1">
                <div className="text-[11px] text-[#315E48]">Tên đăng nhập (username):</div>
                <div className="font-mono font-bold text-[#204434]">@{username}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8F5ED] border border-[#E5DEC9] space-y-1">
                <div className="text-[11px] text-[#315E48]">Địa chỉ email:</div>
                <div className="font-mono text-[#204434]">{userEmail || "Chưa liên kết email"}</div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-[#9D493E]/10 hover:bg-[#9D493E] text-[#9D493E] hover:text-white font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#204434] text-white font-semibold hover:bg-[#183629] transition"
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
