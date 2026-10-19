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
  User,
  Search,
  Bell,
  Check,
  ChevronRight,
  Clock,
  Sparkles,
  Flame,
  Award,
  ArrowRight,
  PenTool,
  Calendar,
  LogOut,
  Target,
  GraduationCap,
  Layers,
  CheckCircle2,
  X,
  AlertCircle,
  HelpCircle,
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
  const [activeNav, setActiveNav] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("student");
  const [studentName, setStudentName] = useState("Minh Thảo");
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
      }

      const profileStored = localStorage.getItem("hanyu_study_profile");
      if (profileStored) {
        setStudyProfile(JSON.parse(profileStored));
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

  const handleStartAssignment = async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/v1/assignments/${assignmentId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const result = await res.json();
      if (result.success && result.attemptId) {
        router.push(`/s/attempts/${result.attemptId}`);
      } else {
        alert("Lỗi: " + (result.message || "Vui lòng thử lại"));
      }
    } catch {
      alert("Không thể kết nối đến máy chủ.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  // Check code in join modal
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
      const data = await res.json();
      if (!res.ok || !data.success) {
        setJoinClassError(data.message || "Không tìm thấy lớp học với mã này.");
        setCheckingJoinCode(false);
        return;
      }
      setVerifiedJoinClass(data.classInfo);
      setCheckingJoinCode(false);
    } catch {
      setJoinClassError("Lỗi kết nối máy chủ.");
      setCheckingJoinCode(false);
    }
  };

  // Confirm join class
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

      // Cập nhật profile ở local
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

      // Reload summary data
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5ED] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#204434] text-[#FFFCF6] flex items-center justify-center font-serif text-2xl font-bold shadow-md mb-4 animate-pulse">
          宁
        </div>
        <p className="text-sm font-semibold text-[#204434]">Đang chuẩn bị không gian học Hanyu của bạn...</p>
      </div>
    );
  }

  const currentLevel = data?.student?.currentHskLevel || 1;
  const isClassMode = studyProfile?.learningMode === "CLASS" || !!studyProfile?.classInfo;
  const targetTrackName =
    studyProfile?.mainTrack === "topic"
      ? "Tiếng Trung theo chủ đề"
      : studyProfile?.mainTrack === "major"
      ? `Đại học & Chuyên ngành (${studyProfile.major?.toUpperCase() || ""})`
      : "HSK 3.0 Chuẩn quốc tế";

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#204434] flex font-sans antialiased selection:bg-[#204434] selection:text-[#FFFCF6]">
      
      {/* ===================== SIDEBAR ===================== */}
      <aside className="w-64 bg-[#FFFCF6] border-r border-[#BC9B6B]/25 flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-40 hidden lg:flex shadow-xs">
        <div>
          {/* Logo Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-[#BC9B6B]/20">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#9D493E] text-[#FFFCF6] flex items-center justify-center font-serif text-base font-bold shadow-xs">
                <span>宁</span>
              </div>
              <div>
                <span className="font-serif font-bold text-xl text-[#204434] tracking-tight block">
                  Hanyu
                </span>
                <span className="text-[10px] text-[#315E48] tracking-widest block uppercase font-medium">
                  Học tiếng Trung
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveNav("home")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer font-bold ${
                activeNav === "home"
                  ? "bg-[#204434] text-[#FFFCF6] shadow-sm shadow-[#204434]/20"
                  : "text-[#315E48] hover:bg-[#F8F5ED] hover:text-[#204434]"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Trang chủ bàn học</span>
            </button>

            {[
              { id: "roadmap", label: "Lộ trình của tôi", icon: Compass, href: "#roadmap" },
              { id: "today", label: "Kế hoạch hôm nay", icon: Calendar, href: "#today" },
              { id: "lessons", label: "Bài học đang học", icon: BookOpen, href: "#lessons" },
              { id: "classes", label: "Lớp học của tôi", icon: Users, href: "#classes" },
              { id: "practice", label: "Phòng luyện tập", icon: Dumbbell, href: "#practice" },
              { id: "wrong", label: "Sổ câu hỏi sai", icon: AlertTriangle, href: "/s/practice/wrong" },
              { id: "vocab", label: "Từ vựng Flashcard", icon: RotateCw, href: "/s/review" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-[#315E48] hover:bg-[#F8F5ED] hover:text-[#204434]"
                >
                  <Icon className="w-4 h-4 stroke-[1.8]" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card */}
        <div className="p-4 border-t border-[#BC9B6B]/20 bg-[#F8F5ED]/40">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#204434] text-[#FFFCF6] flex items-center justify-center font-bold text-xs">
                {studentName.charAt(0)}
              </div>
              <div className="leading-tight">
                <span className="font-bold text-xs text-[#204434] block truncate max-w-[110px]">{studentName}</span>
                <span className="text-[10px] text-[#315E48] block">HSK {currentLevel} · {data?.student?.totalXp || 50} XP</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-[#315E48] hover:text-[#9D493E] p-1.5 transition cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Navbar */}
        <header className="h-20 bg-[#FFFCF6]/85 backdrop-blur-md border-b border-[#BC9B6B]/25 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#204434]/10 border border-[#204434]/20 relative shrink-0">
              <Image
                src="/theme/avatar-student.jpg"
                alt="Avatar"
                fill
                className="object-cover object-top"
              />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[#204434] flex items-center gap-1.5 leading-snug">
                <span>Xin chào, {studentName}</span>
                <span className="text-xs">🍃</span>
              </h2>
              <p className="text-[11px] text-[#315E48]">
                {targetTrackName} · {studyProfile?.dailyTime || 30} phút/ngày
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#315E48] hover:text-[#204434] bg-[#F8F5ED] hover:bg-white px-3 py-1.5 rounded-full border border-[#BC9B6B]/30 transition shadow-xs"
            >
              <Target className="w-3.5 h-3.5 text-[#BC9B6B]" />
              <span>Đổi mục tiêu học</span>
            </Link>

            <button
              type="button"
              className="w-9 h-9 rounded-xl bg-[#F8F5ED] text-[#315E48] hover:text-[#204434] flex items-center justify-center transition border border-[#BC9B6B]/30 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ===================== DASHBOARD BODY (6 SPEC SECTIONS) ===================== */}
        <main className="p-6 lg:p-8 space-y-8 max-w-6xl w-full mx-auto">
          
          {/* ========================================================================= */}
          {/* KHU VỰC 1: BANNER CHÀO ĐÓN HỌC VIÊN */}
          {/* ========================================================================= */}
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#204434] via-[#285340] to-[#315E48] text-[#FFFCF6] p-7 sm:p-9 shadow-xl shadow-[#204434]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#FFFCF6]">
                <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
                <span>Không gian học tập cá nhân hóa Hanyu</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#FFFCF6] leading-snug">
                Chào mừng trở lại, {studentName}!
              </h1>

              {/* Chinese Motto */}
              <div className="p-3 rounded-2xl bg-black/15 backdrop-blur-xs border border-white/10 max-w-lg">
                <div className="font-serif text-base font-bold text-[#FFFCF6] tracking-wide">
                  “千里之行，始于足下”
                </div>
                <div className="text-[11px] text-[#BC9B6B] font-mono mt-0.5">
                  Qiān lǐ zhī xíng, shǐ yú zú xià
                </div>
                <div className="text-xs text-[#FFFCF6]/85 font-light mt-0.5">
                  Hành trình vạn dặm bắt đầu từ một bước chân. Kiên trì từng ngày sẽ vươn tới thành công.
                </div>
              </div>

              {/* Quick stats pills */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="px-3 py-1.5 rounded-xl bg-white/15 text-xs font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#BC9B6B]" />
                  <span>Trình độ: HSK {currentLevel}</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/15 text-xs font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Chuỗi {data?.student?.streakDays || 1} ngày liên tục</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/15 text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>{data?.student?.totalXp || 50} Điểm XP</span>
                </span>
              </div>
            </div>

            {/* Classical Chinese Pavilion Landscape */}
            <div className="relative w-72 h-44 rounded-2xl overflow-hidden border border-white/20 shadow-lg hidden md:block shrink-0 bg-[#12281e]">
              <Image
                src="/theme/landing-moon-desk.jpg"
                alt="Classical scholar study desk"
                fill
                className="object-cover object-center filter saturate-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#204434]/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <span className="text-[11px] font-serif text-[#FFFCF6] tracking-widest uppercase">
                  静以修身 · 俭以养德
                </span>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* KHU VỰC 2 & KHU VỰC 3: LỘ TRÌNH CỦA TÔI & KẾ HOẠCH HÔM NAY */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* KHU VỰC 2: LỘ TRÌNH CỦA TÔI */}
            <section id="roadmap" className="lg:col-span-7 bg-[#FFFCF6] rounded-3xl p-6 sm:p-7 border border-[#BC9B6B]/30 shadow-md shadow-[#204434]/5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#204434]">Lộ trình của tôi</h3>
                    <p className="text-[11px] text-[#315E48]">{targetTrackName}</p>
                  </div>
                </div>
                <Link
                  href="/onboarding"
                  className="text-xs font-semibold text-[#315E48] hover:text-[#204434] flex items-center gap-1"
                >
                  <span>Chỉnh sửa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Progress Summary */}
              <div className="p-4 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/25 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#BC9B6B] uppercase tracking-wider block">
                    Chặng hiện tại: Giai đoạn 1 / 4
                  </span>
                  <div className="font-serif font-bold text-base text-[#204434] mt-0.5">
                    {studyProfile?.mainTrack === "topic"
                      ? "Phát âm & Giao tiếp mở đầu"
                      : studyProfile?.mainTrack === "major"
                      ? "Thuật ngữ & Ngữ pháp chuyên ngành nền tảng"
                      : "Khởi động & Ngữ âm chuẩn Pinyin"}
                  </div>
                  <div className="text-xs text-[#315E48] mt-1">
                    Bài tiếp theo: <strong>Bài 4: 家庭 (Gia đình & Xưng hô)</strong>
                  </div>
                </div>

                <Link
                  href="/s/review"
                  className="px-4 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] text-xs font-semibold transition shrink-0 shadow-xs flex items-center gap-1.5"
                >
                  <span>Tiếp tục học ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 4 Phases Timeline */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                {[
                  { step: "Giai đoạn 1", name: "Ngữ âm", status: "current" },
                  { step: "Giai đoạn 2", name: "Từ vựng", status: "next" },
                  { step: "Giai đoạn 3", name: "Kỹ năng", status: "pending" },
                  { step: "Giai đoạn 4", name: "Thực chiến", status: "pending" },
                ].map((ph, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                        ph.status === "current"
                          ? "bg-[#204434] text-[#FFFCF6] ring-4 ring-[#204434]/15"
                          : "bg-[#F8F5ED] text-[#315E48] border border-[#BC9B6B]/30"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-xs font-bold text-[#204434]">{ph.step}</span>
                    <span className="text-[10px] text-[#315E48]">{ph.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* KHU VỰC 3: KẾ HOẠCH HỌC HÔM NAY */}
            <section id="today" className="lg:col-span-5 bg-[#FFFCF6] rounded-3xl p-6 sm:p-7 border border-[#BC9B6B]/30 shadow-md shadow-[#204434]/5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#BC9B6B]/15 text-[#204434] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#204434]">Kế hoạch hôm nay</h3>
                    <p className="text-[11px] text-[#315E48]">Mục tiêu {studyProfile?.dailyTime || 30} phút / ngày</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#204434] bg-[#F8F5ED] px-2.5 py-1 rounded-full border border-[#BC9B6B]/30">
                  {Object.values(taskDone).filter(Boolean).length}/3 xong
                </span>
              </div>

              {/* Tasks Checklist */}
              <div className="space-y-2.5">
                {/* Task 1 */}
                <div
                  onClick={() => setTaskDone((prev) => ({ ...prev, task1: !prev.task1 }))}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    taskDone.task1
                      ? "bg-[#204434]/5 border-[#204434]/30 line-through text-[#315E48]"
                      : "bg-[#F8F5ED] border-[#BC9B6B]/25 hover:border-[#204434]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                        taskDone.task1
                          ? "bg-[#204434] border-[#204434] text-white"
                          : "border-[#BC9B6B] bg-white"
                      }`}
                    >
                      {taskDone.task1 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#204434]">
                        1. Ôn 10 từ vựng Leitner
                      </div>
                      <div className="text-[11px] text-[#315E48]">10 phút · Ghi nhớ ngắt quãng</div>
                    </div>
                  </div>
                  <Link
                    href="/s/review"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-[#204434] hover:underline shrink-0"
                  >
                    Ôn ngay →
                  </Link>
                </div>

                {/* Task 2 */}
                <div
                  onClick={() => setTaskDone((prev) => ({ ...prev, task2: !prev.task2 }))}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    taskDone.task2
                      ? "bg-[#204434]/5 border-[#204434]/30 line-through text-[#315E48]"
                      : "bg-[#F8F5ED] border-[#BC9B6B]/25 hover:border-[#204434]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                        taskDone.task2
                          ? "bg-[#204434] border-[#204434] text-white"
                          : "border-[#BC9B6B] bg-white"
                      }`}
                    >
                      {taskDone.task2 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#204434]">
                        2. Học bài mới: Mua sắm (购物)
                      </div>
                      <div className="text-[11px] text-[#315E48]">12 phút · Ngữ pháp & Mẫu câu</div>
                    </div>
                  </div>
                  <Link
                    href="#lessons"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-[#204434] hover:underline shrink-0"
                  >
                    Vào bài →
                  </Link>
                </div>

                {/* Task 3 */}
                <div
                  onClick={() => setTaskDone((prev) => ({ ...prev, task3: !prev.task3 }))}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    taskDone.task3
                      ? "bg-[#204434]/5 border-[#204434]/30 line-through text-[#315E48]"
                      : "bg-[#F8F5ED] border-[#BC9B6B]/25 hover:border-[#204434]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                        taskDone.task3
                          ? "bg-[#204434] border-[#204434] text-white"
                          : "border-[#BC9B6B] bg-white"
                      }`}
                    >
                      {taskDone.task3 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#204434]">
                        3. Luyện 5 câu hỏi trắc nghiệm
                      </div>
                      <div className="text-[11px] text-[#315E48]">8 phút · Củng cố phản xạ</div>
                    </div>
                  </div>
                  <Link
                    href="/s/games"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-[#204434] hover:underline shrink-0"
                  >
                    Luyện tập →
                  </Link>
                </div>
              </div>
            </section>

          </div>

          {/* ========================================================================= */}
          {/* KHU VỰC 4: BÀI HỌC ĐANG HỌC */}
          {/* ========================================================================= */}
          <section id="lessons" className="bg-[#FFFCF6] rounded-3xl p-6 sm:p-7 border border-[#BC9B6B]/30 shadow-md shadow-[#204434]/5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#204434]">Bài học đang học</h3>
                  <p className="text-[11px] text-[#315E48]">Tiếp tục những nội dung bạn đang hoàn thành dở dang</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ongoing Lesson 1 */}
              <div className="p-4 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/25 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#204434] text-[#FFFCF6] text-[10px] font-bold">
                      Bài 4 · Gia đình
                    </span>
                    <span className="text-xs font-bold text-[#204434]">70% hoàn thành</span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#204434]">
                    Bài 4: 家庭 (Gia đình & Xưng hô xã hội)
                  </h4>
                  <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                    12 từ vựng mới, điểm ngữ pháp câu vị ngữ hình dung từ và cấu trúc xưng hô.
                  </p>
                  <div className="w-full bg-[#BC9B6B]/25 h-1.5 rounded-full overflow-hidden my-3">
                    <div className="bg-[#204434] h-full rounded-full" style={{ width: "70%" }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#BC9B6B]/15">
                  <span className="text-[11px] text-[#315E48]">Còn 2 bài tập nhỏ</span>
                  <Link
                    href="/s/review"
                    className="px-3.5 py-1.5 rounded-xl bg-[#204434] text-white text-xs font-semibold hover:bg-[#183629] transition flex items-center gap-1"
                  >
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Ongoing Lesson 2 */}
              <div className="p-4 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/25 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#BC9B6B] text-white text-[10px] font-bold">
                      Bài 5 · Mua sắm
                    </span>
                    <span className="text-xs font-bold text-[#204434]">35% hoàn thành</span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#204434]">
                    Bài 5: 购物 (Mua sắm & Hỏi giá thường nhật)
                  </h4>
                  <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                    Mẫu câu hỏi giá多少钱, số đếm tiền tệ Nhân dân tệ và phương thức thanh toán.
                  </p>
                  <div className="w-full bg-[#BC9B6B]/25 h-1.5 rounded-full overflow-hidden my-3">
                    <div className="bg-[#BC9B6B] h-full rounded-full" style={{ width: "35%" }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#BC9B6B]/15">
                  <span className="text-[11px] text-[#315E48]">Còn 5 bài tập nhỏ</span>
                  <Link
                    href="/s/review"
                    className="px-3.5 py-1.5 rounded-xl bg-[#204434] text-white text-xs font-semibold hover:bg-[#183629] transition flex items-center gap-1"
                  >
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* KHU VỰC 5: LỚP HỌC CỦA TÔI */}
          {/* ========================================================================= */}
          <section id="classes" className="bg-[#FFFCF6] rounded-3xl p-6 sm:p-7 border border-[#BC9B6B]/30 shadow-md shadow-[#204434]/5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#9D493E]/10 text-[#9D493E] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#204434]">Lớp học của tôi</h3>
                  <p className="text-[11px] text-[#315E48]">
                    {isClassMode
                      ? "Lớp học chính thức có giáo viên hướng dẫn & chấm bài"
                      : "Không gian tự học độc lập (Có thể tham gia lớp bất cứ lúc nào)"}
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

            {/* Trạng thái 1: ĐÃ THAM GIA LỚP */}
            {isClassMode ? (
              <div className="space-y-4">
                {/* Class Info Card */}
                <div className="p-4 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#9D493E] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
                      宁
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-base text-[#204434]">
                          {studyProfile?.classInfo?.name || "Lớp HSK 3 Chuẩn Quốc Tế (HANYU3A)"}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-[#204434] text-white text-[10px] font-bold">
                          HSK {studyProfile?.classInfo?.level || 3}
                        </span>
                      </div>
                      <p className="text-xs text-[#315E48] mt-0.5">
                        Giáo viên phụ trách: <strong>{studyProfile?.classInfo?.teacherName || "Nguyễn Thảo (Cô Ning Ning)"}</strong> · Mã lớp: <span className="font-mono font-bold text-[#9D493E]">{studyProfile?.classInfo?.code || "HANYU3A"}</span>
                      </p>
                    </div>
                  </div>

                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold self-start sm:self-auto">
                    ● Đang hoạt động
                  </span>
                </div>

                {/* Assignments List in Class */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#204434] uppercase tracking-wider">
                    Bài tập được giao từ giáo viên:
                  </div>

                  {data?.assignments && data.assignments.length > 0 ? (
                    data.assignments.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/25 hover:border-[#204434] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#9D493E]/10 text-[#9D493E] flex items-center justify-center shrink-0 mt-0.5">
                            <FileCheck2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-bold text-sm text-[#204434]">{item.title}</h5>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#315E48] mt-0.5">
                              <span>Khóa: {item.className}</span>
                              <span>•</span>
                              <span>Hạn nộp: <strong className="text-[#9D493E]">{new Date(item.dueAt).toLocaleDateString("vi-VN")}</strong></span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStartAssignment(item.id)}
                          className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#183629] transition shadow-xs shrink-0 self-end sm:self-auto cursor-pointer"
                        >
                          Làm bài ngay
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/20 text-xs text-[#315E48] text-center">
                      Hiện tại không có bài tập mới cần làm. Bạn hãy chủ động ôn từ vựng và luyện tập thêm nhé!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Trạng thái 2: CHƯA THAM GIA LỚP */
              <div className="p-6 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#204434]/10 text-[#204434] flex items-center justify-center shrink-0">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#204434]">
                      Bạn đang tự học chủ động độc lập
                    </h4>
                    <p className="text-xs text-[#315E48] mt-0.5 leading-relaxed">
                      Bạn có thể nhập mã lớp từ giáo viên bất kỳ lúc nào để nhận thêm bài tập. Tiến độ tự học của bạn sẽ được giữ nguyên 100%.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold transition shrink-0 cursor-pointer shadow-xs"
                >
                  Nhập mã lớp ngay
                </button>
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* KHU VỰC 6: PHÒNG LUYỆN TẬP */}
          {/* ========================================================================= */}
          <section id="practice" className="bg-[#FFFCF6] rounded-3xl p-6 sm:p-7 border border-[#BC9B6B]/30 shadow-md shadow-[#204434]/5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#204434]">Phòng luyện tập</h3>
                  <p className="text-[11px] text-[#315E48]">Đa dạng hình thức rèn luyện phản xạ tiếng Trung</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Feature 1: Flashcard */}
              <Link
                href="/s/review"
                className="p-5 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/25 hover:border-[#204434] hover:bg-white transition group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <RotateCw className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#204434]">Luyện từ vựng</h4>
                  <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                    Flashcards ngắt quãng Leitner giúp ghi nhớ sâu từng nét chữ Hán.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#BC9B6B]/20 flex items-center justify-between text-xs font-semibold text-[#204434]">
                  <span>Vào luyện</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Feature 2: Ngữ pháp */}
              <Link
                href="/s/games"
                className="p-5 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/25 hover:border-[#204434] hover:bg-white transition group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#BC9B6B]/20 text-[#204434] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#204434]">Luyện ngữ pháp</h4>
                  <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                    Ghép câu, phân tích trật tự từ và các mẫu câu HSK trọng tâm.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#BC9B6B]/20 flex items-center justify-between text-xs font-semibold text-[#204434]">
                  <span>Vào luyện</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Feature 3: Sổ câu hỏi sai */}
              <Link
                href="/s/practice/wrong"
                className="p-5 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/25 hover:border-[#9D493E] hover:bg-white transition group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#9D493E]/10 text-[#9D493E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#204434]">Sổ câu hỏi sai</h4>
                  <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                    Tập trung rà soát các câu làm sai để không lặp lại lỗi cũ trong kỳ thi.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#BC9B6B]/20 flex items-center justify-between text-xs font-semibold text-[#9D493E]">
                  <span>Ôn lại lỗi</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Feature 4: Game HSK */}
              <Link
                href="/s/games"
                className="p-5 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/25 hover:border-[#204434] hover:bg-white transition group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#204434]">Đấu trường Game</h4>
                  <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                    Tranh tài tốc độ, ghép từ nhanh và tích lũy điểm XP thăng hạng.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#BC9B6B]/20 flex items-center justify-between text-xs font-semibold text-[#204434]">
                  <span>Chơi ngay</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="w-full px-6 lg:px-10 py-5 text-center text-xs text-[#315E48]/80 border-t border-[#BC9B6B]/20 mt-auto bg-[#FFFCF6]">
          © 2026 Hanyu · Nền tảng học tiếng Trung và Luyện thi HSK 3.0 · Phong cách Thủy Mặc Tối Giản
        </footer>
      </div>

      {/* ===================== MODAL THAM GIA LỚP HỌC ===================== */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => {
                setShowJoinModal(false);
                setVerifiedJoinClass(null);
                setJoinClassError("");
              }}
              className="absolute top-5 right-5 text-[#315E48] hover:text-[#204434] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#9D493E]/10 text-[#9D493E] flex items-center justify-center mb-2.5">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#204434]">Tham gia lớp học mới</h3>
              <p className="text-xs text-[#315E48] mt-1">
                Nhập mã lớp từ giáo viên của bạn để tham gia lớp và nhận bài tập được giao.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#204434] mb-1.5">
                  Mã lớp học:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinClassCode}
                    onChange={(e) => {
                      setJoinClassCode(e.target.value.toUpperCase());
                      setJoinClassError("");
                    }}
                    placeholder="Ví dụ: HANYU3A"
                    className="flex-1 bg-[#F8F5ED] border border-[#BC9B6B]/35 focus:border-[#204434] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider text-[#204434] uppercase outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyJoinCode}
                    disabled={checkingJoinCode}
                    className="px-4 py-2.5 rounded-xl bg-[#204434] text-white text-xs font-semibold hover:bg-[#183629] transition disabled:opacity-60 cursor-pointer"
                  >
                    {checkingJoinCode ? "Đang tìm..." : "Kiểm tra"}
                  </button>
                </div>
              </div>

              {joinClassError && (
                <div className="p-3 rounded-xl bg-[#9D493E]/10 border border-[#9D493E]/30 text-xs text-[#9D493E] font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{joinClassError}</span>
                </div>
              )}

              {verifiedJoinClass && (
                <div className="p-4 rounded-2xl bg-[#204434]/5 border border-[#204434]/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#204434] uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#315E48]" />
                      <span>Tìm thấy lớp học:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#204434] text-white text-[10px] font-bold">
                      HSK {verifiedJoinClass.level}
                    </span>
                  </div>
                  <div className="font-serif font-bold text-sm text-[#204434]">
                    {verifiedJoinClass.name}
                  </div>
                  <div className="text-xs text-[#315E48]">
                    Giáo viên: <strong className="text-[#204434]">{verifiedJoinClass.teacherName}</strong>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#BC9B6B]/30 text-xs font-semibold text-[#315E48] hover:text-[#204434] transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={!verifiedJoinClass || enrolling}
                  onClick={handleConfirmEnroll}
                  className="flex-1 py-2.5 rounded-xl bg-[#9D493E] hover:bg-[#833d34] text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {enrolling ? "Đang ghi danh..." : "Xác nhận tham gia"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
