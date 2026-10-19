"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Compass,
  FileCheck2,
  BookOpen,
  AlertTriangle,
  RotateCw,
  Gamepad2,
  TrendingUp,
  Search,
  Bell,
  Flame,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Target,
  GraduationCap,
  Briefcase,
  Layers,
  LogOut,
  Calendar,
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

export default function StudentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  // Kế hoạch 30 phút hôm nay (Checklist state)
  const [todayTasks, setTodayTasks] = useState([
    {
      id: "task-1",
      min: "10 phút",
      title: "Ôn kiến thức yếu / câu sai",
      desc: "Ưu tiên câu phân biệt 买/卖 trong bài kiểm tra gần nhất",
      done: false,
      href: "/s/practice/wrong",
      tag: "Sổ tay câu sai",
      tagBg: "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
      id: "task-2",
      min: "10 phút",
      title: "Học bài mới theo chặng",
      desc: "Bài 5 · 购物 (Mua sắm) - 5 từ vựng mới & mẫu câu hỏi giá",
      done: true,
      href: "/s/review",
      tag: "Từ vựng Leitner",
      tagBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "task-3",
      min: "10 phút",
      title: "Luyện tập củng cố",
      desc: "Làm bài tập cô Ning Ning giao để kiểm tra độ hiểu bài",
      done: false,
      href: "#assignments-section",
      tag: "Bài tập cô giao",
      tagBg: "bg-blue-50 text-blue-700 border-blue-200",
    },
  ]);

  useEffect(() => {
    fetch("/api/v1/my/summary?username=student")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleToggleTask = (id: string) => {
    setTodayTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleStartAssignment = async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/v1/assignments/${assignmentId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "student" }),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f7f3] text-[#1e2e22] flex items-center justify-center text-sm font-medium">
        Đang nạp bàn học Hanyu của em...
      </div>
    );
  }

  const completedTasksCount = todayTasks.filter((t) => t.done).length;

  return (
    <div className="min-h-screen bg-[#f2f7f3] text-[#1e2e22] flex font-sans antialiased">
      {/* ===================== SIDEBAR HANYU (STUDENT EDITION) ===================== */}
      <aside className="w-64 bg-white border-r border-[#e3ece5] flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-40 hidden lg:flex">
        <div>
          {/* Brand Header (Consistent with Teacher Dashboard) */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-[#f0f4f1]">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#eaf4ed] flex items-center justify-center text-2xl shadow-sm">
                🐼
              </div>
              <div className="leading-tight">
                <span className="font-bold text-[#1a4d2e] text-lg tracking-tight block">Hanyu</span>
                <span className="text-[11px] text-[#6b8271] tracking-wider block font-medium">
                  Bàn học sinh HSK 3.0
                </span>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1 text-sm font-medium">
            <button
              onClick={() => setActiveNav("home")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition cursor-pointer ${
                activeNav === "home"
                  ? "bg-[#256f3a] text-white shadow-md shadow-emerald-950/10 font-semibold"
                  : "text-[#4d6353] hover:bg-[#ebf4ee] hover:text-[#1b4d2a]"
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 stroke-[2]" />
                <span>Bàn học của em</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-75" />
            </button>

            {[
              { id: "roadmap", label: "Lộ trình học tập", icon: Compass, href: "#roadmap-section" },
              { id: "assignments", label: "Bài tập cô giao", icon: FileCheck2, href: "#assignments-section" },
              { id: "review", label: "Ôn từ vựng Leitner", icon: RotateCw, href: "/s/review" },
              { id: "wrong", label: "Sổ tay câu sai", icon: AlertTriangle, href: "/s/practice/wrong" },
              { id: "games", label: "Game Center", icon: Gamepad2, href: "/s/games" },
              { id: "library", label: "Kho bài học 3 hướng", icon: BookOpen, href: "#directions-section" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition cursor-pointer text-[13px] text-[#526857] hover:bg-[#f0f6f2] hover:text-[#1b4d2a]"
                >
                  <Icon className="w-4 h-4 stroke-[1.75]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Student Journey Banner (Consistent with Teacher Dashboard) */}
        <div className="p-4">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#dcf0e2] to-[#bfe4ca] p-4 text-[#1a4d2e] shadow-sm border border-[#c4e3cf]">
            <div className="relative z-10">
              <span className="text-[10px] text-[#2d6e42] font-bold block uppercase tracking-wider mb-1">
                Lớp cô Ning Ning
              </span>
              <h5 className="font-bold text-sm leading-tight mb-2">
                Mục tiêu: <br />
                <span className="text-base font-black">HSK 1 → HSK 3</span>
              </h5>
              <div className="text-[11px] text-[#346d48] mb-3">
                30 phút/ngày · Tiến độ đều đặn
              </div>
              <Link
                href="/s/review"
                className="w-8 h-8 rounded-full bg-[#256f3a] text-white flex items-center justify-center hover:bg-[#1a552b] transition shadow-md"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header (Matching Teacher Dashboard Header) */}
        <header className="h-20 bg-white border-b border-[#e3ece5] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          {/* Search bar with Ctrl K */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 text-[#7b9381] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bài học, từ vựng, ngữ pháp... (Ctrl K)"
              className="w-full bg-[#f3f7f4] border border-transparent focus:border-[#256f3a] focus:bg-white rounded-xl pl-10 pr-20 py-2.5 text-xs text-[#1e2e22] placeholder-[#7b9381] outline-none transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#7b9381] bg-white px-2 py-0.5 rounded border border-[#dae6dc]">
              Ctrl K
            </span>
          </div>

          {/* Right Controls: Streak, XP, Notifications, Profile */}
          <div className="flex items-center gap-3 sm:gap-5 ml-auto">
            {/* Streak Counter Pill */}
            <div className="flex items-center gap-1.5 bg-[#fff7ed] border border-[#ffedd5] px-3.5 py-1.5 rounded-xl text-xs font-bold text-orange-600 shadow-xs">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>{data?.student.streakDays || 4} ngày liên tiếp</span>
            </div>

            {/* XP Counter Pill */}
            <div className="flex items-center gap-1.5 bg-[#f0fdf4] border border-[#dcfce7] px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#256f3a] shadow-xs">
              <Award className="w-4 h-4 text-[#256f3a]" />
              <span>{data?.student.totalXp || 180} XP</span>
            </div>

            {/* Notification bell */}
            <button
              onClick={() => alert("Thông báo: Cô Ning Ning vừa giao bài tập mới Bài 5 · 购物")}
              className="relative w-10 h-10 rounded-xl bg-[#f3f7f4] text-[#4d6353] hover:text-[#256f3a] hover:bg-[#eaf4ed] flex items-center justify-center transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Student Profile Dropdown */}
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-[#e3ece5]">
              <div className="w-10 h-10 rounded-full bg-[#eaf4ed] border border-[#bfe4ca] flex items-center justify-center text-sm font-bold text-[#256f3a] shrink-0">
                K
              </div>
              <div className="leading-tight hidden md:block">
                <span className="font-bold text-xs text-[#1e2e22] block">
                  {data?.student.name || "Trần Minh Khang"}
                </span>
                <span className="text-[11px] text-[#6b8271] block">
                  Học sinh · Lớp HSK 1A
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl bg-[#f3f7f4] text-[#7b9381] hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-6 lg:p-10 space-y-8 max-w-[1580px] w-full mx-auto">
          {/* ===================== WELCOME HERO BANNER (MATCHING TEACHER DASHBOARD VIBE) ===================== */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#e6f4ea] via-[#edf7f0] to-[#f7fbf8] border border-[#d6e8db] p-8 lg:p-10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl z-10">
              <div className="inline-flex items-center gap-2 bg-white/90 border border-[#cee2d3] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#256f3a] shadow-xs mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mục tiêu: Học đại học bằng tiếng Trung · HSK 1–3 · 30 phút/ngày</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#154625] tracking-tight mb-2">
                Chào em, {data?.student.name || "Minh Khang"}! 🌱
              </h2>
              <p className="text-xs sm:text-sm text-[#48634f] leading-relaxed mb-6 font-normal">
                Hôm nay em có 1 bài tập cô giao và 5 từ vựng cần ôn tập. Hãy dành 30 phút để hoàn thành
                kế hoạch ngày nhé!
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/s/review"
                  className="px-5 py-2.5 rounded-xl bg-[#256f3a] text-white text-xs font-semibold hover:bg-[#1c552b] transition flex items-center gap-2 shadow-md shadow-emerald-950/10"
                >
                  <span>Tiếp tục học ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href="#assignments-section"
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#bedac5] text-[#256f3a] text-xs font-semibold hover:bg-[#f2f8f4] transition shadow-xs"
                >
                  Xem bài được giao ({data?.assignments.length || 1})
                </a>
              </div>
            </div>

            {/* Cute Panda Mascot Box on Right (Consistent with Teacher Dashboard) */}
            <div className="hidden md:flex items-center gap-4 z-10 shrink-0">
              <div className="relative w-44 h-32 rounded-2xl bg-[#1b4329] p-3 text-white border-4 border-[#8c6747] shadow-lg flex flex-col justify-between">
                <div className="text-[11px] font-mono tracking-widest text-center text-emerald-200">
                  天天向上
                  <br />
                  加油学习! 🐼
                </div>
                <div className="bg-white/10 rounded px-2 py-1 text-[10px] text-center text-emerald-100">
                  Chuỗi học: {data?.student.streakDays || 4} ngày liên tiếp 🔥
                </div>
              </div>
              <div className="text-5xl">🐼</div>
            </div>
          </div>

          {/* ===================== 4 KEY METRIC CARDS (MATCHING TEACHER DASHBOARD) ===================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Kế hoạch hôm nay */}
            <div className="bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs flex items-center gap-5 hover:border-[#bfe4ca] transition">
              <div className="w-14 h-14 rounded-2xl bg-[#eaf7ee] text-[#256f3a] flex items-center justify-center shrink-0">
                <Target className="w-7 h-7 stroke-[1.75]" />
              </div>
              <div>
                <div className="text-3xl font-black text-[#154625] leading-none mb-1.5">
                  {completedTasksCount}/3
                </div>
                <div className="text-xs font-bold text-[#445b4a]">Nhiệm vụ hôm nay</div>
                <div className="text-[11px] text-[#256f3a] font-medium mt-1">
                  Mục tiêu 30 phút/ngày
                </div>
              </div>
            </div>

            {/* Card 2: Bài tập cô giao */}
            <div className="bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs flex items-center gap-5 hover:border-[#bfdbfe] transition">
              <div className="w-14 h-14 rounded-2xl bg-[#eef6ff] text-[#2563eb] flex items-center justify-center shrink-0">
                <FileCheck2 className="w-7 h-7 stroke-[1.75]" />
              </div>
              <div>
                <div className="text-3xl font-black text-[#154625] leading-none mb-1.5">
                  {data?.assignments.length || 1}
                </div>
                <div className="text-xs font-bold text-[#445b4a]">Bài tập cô giao</div>
                <div className="text-[11px] text-[#2563eb] font-medium mt-1">
                  1 bài cần làm ngay
                </div>
              </div>
            </div>

            {/* Card 3: Từ vựng cần ôn (Leitner) */}
            <div className="bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs flex items-center gap-5 hover:border-[#fed7aa] transition">
              <div className="w-14 h-14 rounded-2xl bg-[#fff2eb] text-[#ea580c] flex items-center justify-center shrink-0">
                <RotateCw className="w-7 h-7 stroke-[1.75]" />
              </div>
              <div>
                <div className="text-3xl font-black text-[#154625] leading-none mb-1.5">
                  {data?.counts.dueVocabs || 5}
                </div>
                <div className="text-xs font-bold text-[#445b4a]">Từ vựng cần ôn</div>
                <div className="text-[11px] text-[#ea580c] font-medium mt-1">
                  Hộp Leitner cấp 1
                </div>
              </div>
            </div>

            {/* Card 4: Sổ tay câu sai */}
            <div className="bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs flex items-center gap-5 hover:border-[#e9d5ff] transition">
              <div className="w-14 h-14 rounded-2xl bg-[#faf5ff] text-[#9333ea] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-7 h-7 stroke-[1.75]" />
              </div>
              <div>
                <div className="text-3xl font-black text-[#154625] leading-none mb-1.5">
                  {data?.counts.wrongQuestions || 1}
                </div>
                <div className="text-xs font-bold text-[#445b4a]">Sổ tay câu sai</div>
                <div className="text-[11px] text-[#9333ea] font-medium mt-1">
                  Cần luyện lại cho chắc
                </div>
              </div>
            </div>
          </div>

          {/* ===================== MIDDLE ROW: KẾ HOẠCH 30 PHÚT & BÀI TẬP CÔ GIAO ===================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Widget 1: Kế hoạch học 30 phút/ngày (Section 05-C - Width ~ 50%) */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-[#154625] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#256f3a]" />
                    <span>Kế hoạch học 30 phút hôm nay</span>
                  </h3>
                  <p className="text-xs text-[#657d6b] mt-0.5">
                    Mỗi ngày 3 việc tinh gọn: Ôn sai → Bài mới → Luyện tập
                  </p>
                </div>
                <span className="text-xs font-bold text-[#256f3a] bg-[#eaf7ee] px-2.5 py-1 rounded-lg">
                  {Math.round((completedTasksCount / 3) * 100)}% xong
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[#e2e8f0] overflow-hidden mb-5">
                <div
                  style={{ width: `${(completedTasksCount / 3) * 100}%` }}
                  className="h-full bg-[#256f3a] transition-all duration-500 rounded-full"
                />
              </div>

              {/* Task List */}
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border transition flex items-start gap-3.5 ${
                      task.done
                        ? "bg-[#f8faf8] border-[#e2ece4] opacity-80"
                        : "bg-white border-[#dce8df] hover:border-[#256f3a]"
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition ${
                        task.done
                          ? "bg-[#256f3a] border-[#256f3a] text-white"
                          : "border-[#b0c7b6] hover:border-[#256f3a]"
                      }`}
                    >
                      {task.done && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-bold text-[#256f3a] bg-[#eaf7ee] px-2 py-0.5 rounded">
                          {task.min}
                        </span>
                        <h4
                          className={`text-xs font-bold ${
                            task.done ? "line-through text-[#7b9381]" : "text-[#154625]"
                          }`}
                        >
                          {task.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#657d6b] leading-relaxed mb-2">
                        {task.desc}
                      </p>
                      <Link
                        href={task.href}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#256f3a] hover:underline"
                      >
                        <span>Thực hiện ngay</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <span className={`text-[10px] font-medium border px-2 py-0.5 rounded ${task.tagBg}`}>
                      {task.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: Bài tập cô giao (Section 04 - Width ~ 50%) */}
            <div id="assignments-section" className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-[#154625] flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#256f3a]" />
                    <span>Bài tập cô Ning Ning giao</span>
                  </h3>
                  <p className="text-xs text-[#657d6b] mt-0.5">
                    Bài tập lớp HSK 1A · Hệ thống chấm điểm tự động
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg">
                  Ưu tiên số 1
                </span>
              </div>

              {/* Assignment Items */}
              <div className="space-y-4">
                {data?.assignments.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#f8faf8] border border-[#e2ece4] hover:border-[#256f3a] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#eef6ff] text-[#2563eb] flex items-center justify-center shrink-0 mt-0.5">
                        <FileCheck2 className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#154625] mb-1">
                          {item.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#657d6b]">
                          <span>{item.className}</span>
                          <span>•</span>
                          <span>{item.durationMin} phút ({item.totalQuestions} câu)</span>
                          <span>•</span>
                          <span className="text-orange-700 font-medium">Hạn: sau 3 ngày</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto text-right">
                      {item.hasAttempted ? (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs font-bold text-[#256f3a]">
                            Điểm: {item.latestScore}đ
                          </span>
                          <button
                            onClick={() => handleStartAssignment(item.id)}
                            className="px-3.5 py-1.5 rounded-lg border border-[#c4e3cf] text-xs font-semibold text-[#256f3a] hover:bg-[#eaf4ed] cursor-pointer"
                          >
                            Làm lại
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartAssignment(item.id)}
                          className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#256f3a] text-white text-xs font-bold hover:bg-[#1a552b] transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Làm bài ngay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sổ tay câu sai nhanh */}
              <div className="mt-5 pt-4 border-t border-[#edf3ee] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                    !
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#154625]">Sổ tay câu sai</h5>
                    <p className="text-[11px] text-[#657d6b]">
                      Em có {data?.counts.wrongQuestions || 1} câu cần ôn lại
                    </p>
                  </div>
                </div>
                <Link
                  href="/s/practice/wrong"
                  className="px-3.5 py-1.5 rounded-lg bg-[#fff7ed] border border-[#fed7aa] text-xs font-bold text-orange-700 hover:bg-orange-100 transition"
                >
                  Luyện câu sai →
                </Link>
              </div>
            </div>
          </div>

          {/* ===================== LỘ TRÌNH ĐƯỢC ĐỀ XUẤT (SECTION 05-B) ===================== */}
          <div id="roadmap-section" className="bg-white rounded-2xl p-6 lg:p-8 border border-[#e3ece5] shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#edf3ee]">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#256f3a] uppercase tracking-wider block mb-1">
                  ĐỀ XUẤT LỘ TRÌNH DỰA TRÊN MỤC TIÊU CỦA EM
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#154625]">
                  Lộ trình học tập 4 chặng Hanyu
                </h3>
              </div>
              <div className="text-xs text-[#657d6b]">
                Chặng hiện tại: <strong className="text-[#256f3a]">Chặng 1 (Hoàn thành 65%)</strong>
              </div>
            </div>

            {/* 4 Stages Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  step: "Chặng 1",
                  title: "Củng cố nền HSK 1–3",
                  desc: "Ôn cấu trúc cơ bản, từ vựng, nghe và đọc đoạn ngắn.",
                  status: "Đang học (65%)",
                  statusBg: "bg-emerald-100 text-[#1a552b] border-emerald-300",
                  active: true,
                },
                {
                  step: "Chặng 2",
                  title: "Tiếng Trung đại học",
                  desc: "Giao tiếp với giảng viên, bạn học, thư viện, thủ tục.",
                  status: "Tiếp theo",
                  statusBg: "bg-blue-100 text-blue-700 border-blue-200",
                  active: false,
                },
                {
                  step: "Chặng 3",
                  title: "Thuật ngữ chuyên ngành",
                  desc: "Từ vựng học thuật & một môn theo ngành (Kinh tế / Quản trị).",
                  status: "Sắp mở",
                  statusBg: "bg-slate-100 text-slate-600 border-slate-200",
                  active: false,
                },
                {
                  step: "Chặng 4",
                  title: "Đọc giáo trình & bài giảng",
                  desc: "Đọc đoạn học thuật, nghe giải thích, ghi chú môn học.",
                  status: "Mục tiêu dài hạn",
                  statusBg: "bg-purple-100 text-purple-700 border-purple-200",
                  active: false,
                },
              ].map((stage, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                    stage.active
                      ? "bg-[#f4faf5] border-[#256f3a] shadow-xs"
                      : "bg-[#fcfdfc] border-[#e8efe9]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-[#657d6b]">
                        {stage.step}
                      </span>
                      <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded ${stage.statusBg}`}>
                        {stage.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#154625] mb-1.5 leading-snug">
                      {stage.title}
                    </h4>
                    <p className="text-[11px] text-[#657d6b] leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>

                  {stage.active && (
                    <div className="mt-4 pt-3 border-t border-[#d8e8dc]">
                      <div className="w-full h-1.5 rounded-full bg-[#dce8df] overflow-hidden mb-1.5">
                        <div className="w-[65%] h-full bg-[#256f3a] rounded-full" />
                      </div>
                      <span className="text-[10px] text-[#256f3a] font-bold">
                        65% hoàn thành chặng 1
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ===================== BA HƯỚNG NỘI DUNG (SECTION 01 & 03) ===================== */}
          <div id="directions-section" className="bg-white rounded-2xl p-6 lg:p-8 border border-[#e3ece5] shadow-xs">
            <div className="max-w-2xl mb-6">
              <span className="text-[11px] font-mono font-bold text-[#256f3a] uppercase tracking-wider block mb-1">
                KHO HỌC LIỆU DÙNG CHUNG CỦA HANYU
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#154625]">
                Ba hướng học – Một bộ máy dùng chung
              </h3>
              <p className="text-xs text-[#657d6b] mt-1">
                Tất cả bài học, câu hỏi và bài luyện đều dùng chung hệ thống chấm điểm và sổ tay lỗi sai
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Direction 1: HSK 3.0 */}
              <div className="p-5 rounded-2xl bg-[#f8faf8] border border-[#e2ece4] flex flex-col justify-between hover:border-[#256f3a] transition">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#eaf7ee] text-[#256f3a] flex items-center justify-center mb-3">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#256f3a] uppercase block mb-1">
                    HƯỚNG 1
                  </span>
                  <h4 className="text-sm font-bold text-[#154625] mb-1.5">
                    HSK 3.0 (Cấp 1 đến 9)
                  </h4>
                  <p className="text-xs text-[#657d6b] leading-relaxed mb-4">
                    Theo cấu trúc Cấp độ → Bài học → Từ vựng / Ngữ pháp. Trọng tâm đạt chuẩn kỳ thi quốc tế.
                  </p>
                </div>
                <Link
                  href="/s/review"
                  className="text-xs font-bold text-[#256f3a] flex items-center gap-1 hover:underline"
                >
                  <span>Học Bài 5 · 购物</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Direction 2: Theo chủ đề */}
              <div className="p-5 rounded-2xl bg-[#f8faf8] border border-[#e2ece4] flex flex-col justify-between hover:border-[#256f3a] transition">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#eef6ff] text-[#2563eb] flex items-center justify-center mb-3">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#2563eb] uppercase block mb-1">
                    HƯỚNG 2
                  </span>
                  <h4 className="text-sm font-bold text-[#154625] mb-1.5">
                    Học theo chủ đề thực tế
                  </h4>
                  <p className="text-xs text-[#657d6b] leading-relaxed mb-4">
                    Nhóm chủ đề → Tình huống → Bài học. Ví dụ: Đời sống, mua sắm, hỏi đường, gọi món.
                  </p>
                </div>
                <Link
                  href="/s/games"
                  className="text-xs font-bold text-[#2563eb] flex items-center gap-1 hover:underline"
                >
                  <span>Chơi game ghép từ</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Direction 3: Đại học & Chuyên ngành */}
              <div className="p-5 rounded-2xl bg-[#f8faf8] border border-[#e2ece4] flex flex-col justify-between hover:border-[#256f3a] transition">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center mb-3">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#ea580c] uppercase block mb-1">
                    HƯỚNG 3
                  </span>
                  <h4 className="text-sm font-bold text-[#154625] mb-1.5">
                    Đại học & Chuyên ngành
                  </h4>
                  <p className="text-xs text-[#657d6b] leading-relaxed mb-4">
                    Ngành → Môn học → Chương. Ví dụ: Kinh tế / Quản trị (现代管理学) thuật ngữ học thuật.
                  </p>
                </div>
                <button
                  onClick={() => alert("Chương trình chuyên ngành Kinh tế / Quản trị sẽ mở ở Chặng 3!")}
                  className="text-xs font-bold text-[#ea580c] flex items-center gap-1 hover:underline text-left cursor-pointer"
                >
                  <span>Xem tài liệu mẫu</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
