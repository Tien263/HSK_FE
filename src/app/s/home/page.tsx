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

export default function StudentHomePage() {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("student");
  const [studentName, setStudentName] = useState("Thảo");

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
          setStudentName(u.name.split(" ").pop() || u.name);
        }
      }
    } catch {}

    fetch(`/api/v1/my/summary?username=${currentU}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
          if (json.data.student?.name) {
            setStudentName(json.data.student.name.split(" ").pop() || json.data.student.name);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-xl bg-[#b91c1c] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md mb-4 animate-pulse">
          汉语
        </div>
        <p className="text-sm font-semibold text-[#1a3d2f]">Đang chuẩn bị bàn học Hanyu của em...</p>
      </div>
    );
  }

  const currentLevel = data?.student?.currentHskLevel || 1;

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1e2e22] flex font-sans antialiased selection:bg-[#1a3d2f] selection:text-white">
      {/* ===================== SIDEBAR HANYU (Matching Mockup 1) ===================== */}
      <aside className="w-60 bg-[#fbf9f4] border-r border-[#e6decb] flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-40 hidden lg:flex">
        <div>
          {/* Logo Brand Header */}
          <div className="h-20 px-6 flex items-center gap-3 border-b border-[#eee8dc]">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="font-serif font-black text-2xl text-[#1a3d2f] tracking-tight">
                Hanyu
              </span>
              <div className="w-6 h-6 rounded-md bg-[#b91c1c] text-white flex items-center justify-center text-[10px] font-serif font-bold shadow-2xs">
                汉语
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1 text-[13px] font-medium">
            <button
              onClick={() => setActiveNav("home")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer font-bold ${
                activeNav === "home"
                  ? "bg-[#1a3d2f] text-white shadow-sm"
                  : "text-[#5c7363] hover:bg-[#eee8dc] hover:text-[#1a3d2f]"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Trang chủ</span>
            </button>

            {[
              { id: "roadmap", label: "Lộ trình học", icon: Compass, href: "#roadmap" },
              { id: "courses", label: "Khóa học của tôi", icon: BookOpen, href: "#courses" },
              { id: "assignments", label: "Bài được giao", icon: FileCheck2, href: "#assignments" },
              { id: "practice", label: "Luyện tập", icon: Dumbbell, href: "/s/games" },
              { id: "wrong", label: "Sổ tay lỗi sai", icon: AlertTriangle, href: "/s/practice/wrong" },
              { id: "vocab", label: "Từ vựng", icon: RotateCw, href: "/s/review" },
              { id: "class", label: "Lớp học của tôi", icon: Users, href: "#class" },
              { id: "profile", label: "Tài khoản", icon: User, href: "#profile" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer text-[#5c7363] hover:bg-[#eee8dc] hover:text-[#1a3d2f]"
                >
                  <Icon className="w-4 h-4 stroke-[1.75]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Quick Card */}
        <div className="p-3.5 border-t border-[#eee8dc]">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f4eee4] border border-[#e2dac9]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1a3d2f] text-white flex items-center justify-center font-bold text-xs">
                {studentName.charAt(0)}
              </div>
              <div className="leading-tight">
                <span className="font-bold text-xs text-[#1e2e22] block">{studentName}</span>
                <span className="text-[10px] text-[#6b8271] block">HSK {currentLevel} · {data?.student?.totalXp || 0} XP</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-[#64796a] hover:text-red-700 p-1"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-[#fbf9f4]/80 backdrop-blur-md border-b border-[#e6decb] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30">
          {/* Left Greeting */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 border border-[#bfe4ca] relative shrink-0">
              <Image
                src="/theme/avatar-student.jpg"
                alt="Avatar"
                fill
                className="object-cover object-top"
              />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[#1a3d2f] flex items-center gap-1.5 leading-snug">
                <span>Xin chào, {studentName}</span>
                <span className="text-sm">🍃</span>
              </h2>
              <p className="text-[11px] text-[#6b8271] hidden sm:block">
                Kiên trì mỗi ngày, bạn sẽ tiến xa hơn hôm qua.
              </p>
            </div>
          </div>

          {/* Right Header Search & Controls */}
          <div className="flex items-center gap-4">
            <div className="relative w-64 lg:w-80 hidden md:block">
              <Search className="w-4 h-4 text-[#8ea394] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm khóa học, bài học, từ vựng..."
                className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-[#1e2e22] placeholder-[#8ea394] outline-none transition"
              />
            </div>

            <button
              type="button"
              className="w-9 h-9 rounded-xl bg-[#f4eee4] text-[#5c7363] hover:text-[#1a3d2f] flex items-center justify-center transition border border-[#e2dac9]"
            >
              <Bell className="w-4 h-4" />
            </button>

            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#e2dac9] relative shrink-0">
              <Image
                src="/theme/sample-student.jpg"
                alt="Profile"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* ===================== HERO BANNER (With Scenic Pavilion) ===================== */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#efeae0] via-[#f5f0e6] to-[#e8efe9] border border-[#e2dac9] p-7 sm:p-10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-md z-10">
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#1a3d2f] tracking-tight mb-2">
                Hôm nay, cùng học nhé!
              </h1>
              <p className="text-xs sm:text-sm text-[#5c7363] leading-relaxed mb-6 font-normal">
                Hoàn thành kế hoạch hôm nay để tiến gần hơn đến mục tiêu của bạn.
              </p>

              <Link
                href="/s/review"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1a3d2f] text-white font-bold text-xs hover:bg-[#132e23] transition shadow-md shadow-emerald-950/15"
              >
                <span>Bắt đầu học →</span>
              </Link>
            </div>

            {/* Classical Chinese Landscape Art in Banner */}
            <div className="relative w-72 h-36 rounded-2xl overflow-hidden border border-white/60 shadow-sm hidden md:block shrink-0">
              <Image
                src="/theme/hero-student-pavilion.jpg"
                alt="Classical Chinese pavilion landscape"
                fill
                className="object-cover object-center filter saturate-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a3d2f]/20 to-transparent" />
            </div>
          </div>

          {/* ===================== ROW 1: LỘ TRÌNH TỰ HỌC & BÀI GIÁO VIÊN GIAO ===================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Lộ trình tự học (60% Progress) */}
            <div id="roadmap" className="lg:col-span-6 bg-[#fcfaf7] rounded-3xl p-6 border border-[#e6decb] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#1a3d2f]" />
                    <h3 className="font-bold text-sm text-[#1a3d2f]">Lộ trình tự học</h3>
                  </div>
                  <button
                    onClick={() => alert("Xem chi tiết toàn bộ lộ trình HSK 1 - HSK 9")}
                    className="text-xs text-[#64796a] hover:text-[#1a3d2f] font-semibold flex items-center gap-1"
                  >
                    <span>Xem chi tiết</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Main Card HSK 3 */}
                <div className="p-4 rounded-2xl bg-[#f4eee4] border border-[#e2dac9] mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1a3d2f] text-white flex items-center justify-center font-serif text-sm font-bold shadow-2xs">
                      HSK {currentLevel}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1e2e22]">HSK {currentLevel}</h4>
                      <p className="text-xs text-[#64796a]">Lộ trình chinh phục HSK {currentLevel} chuẩn 3.0</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8ea394]" />
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-[#5c7363]">Tiến độ tổng thể</span>
                    <span className="text-[#1a3d2f]">60%</span>
                  </div>
                  <div className="w-full bg-[#e6decb] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#1a3d2f] h-full rounded-full transition-all duration-500" style={{ width: "60%" }} />
                  </div>
                </div>

                {/* 4 Steps timeline: HSK 1 -> HSK 4 */}
                <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-[#eee8dc]">
                  {[
                    { level: "HSK 1", sub: "(Đã xong)", done: true },
                    { level: "HSK 2", sub: "(Đã xong)", done: true },
                    { level: `HSK 3`, sub: "(Đang học)", current: true },
                    { level: "HSK 4", sub: "(Tiếp theo)", pending: true },
                  ].map((s, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 shadow-2xs ${
                          s.done
                            ? "bg-[#1a3d2f] text-white"
                            : s.current
                            ? "bg-[#1a3d2f] text-white ring-2 ring-[#1a3d2f]/30"
                            : "bg-[#e5ded0] text-[#788a7d]"
                        }`}
                      >
                        {s.done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                      </div>
                      <span className="text-xs font-bold text-[#1e2e22]">{s.level}</span>
                      <span className="text-[10px] text-[#788a7d]">{s.sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Bài giáo viên giao */}
            <div id="assignments" className="lg:col-span-6 bg-[#fcfaf7] rounded-3xl p-6 border border-[#e6decb] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#1a3d2f]" />
                    <h3 className="font-bold text-sm text-[#1a3d2f]">Bài giáo viên giao</h3>
                  </div>
                  <button
                    onClick={() => alert("Xem tất cả các bài tập đã giao")}
                    className="text-xs text-[#64796a] hover:text-[#1a3d2f] font-semibold flex items-center gap-1"
                  >
                    <span>Xem tất cả</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Assignment List */}
                <div className="space-y-3">
                  {data?.assignments && data.assignments.length > 0 ? (
                    data.assignments.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[#f8f5ee] border border-[#e2dac9] hover:border-[#1a3d2f] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-red-100 text-[#b91c1c] flex items-center justify-center shrink-0 mt-0.5">
                            <FileCheck2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-[#1e2e22] mb-0.5">{item.title}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64796a]">
                              <span>Khóa: {item.className}</span>
                              <span>•</span>
                              <span>Giáo viên: Cô Ning Ning</span>
                              <span>•</span>
                              <span className="text-orange-700 font-medium">Hạn: {new Date(item.dueAt).toLocaleDateString("vi-VN")}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStartAssignment(item.id)}
                          className="px-4 py-2 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#132e23] transition shadow-xs shrink-0 self-end sm:self-auto cursor-pointer"
                        >
                          Làm bài
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-[#64796a]">
                      Không có bài tập mới cần làm. Em hãy chăm chỉ ôn từ vựng nhé!
                    </div>
                  )}

                  {/* Sample supplementary assignments matching mockup */}
                  <div className="p-4 rounded-2xl bg-[#f8f5ee] border border-[#e2dac9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <PenTool className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#1e2e22] mb-0.5">Viết đoạn văn: Giới thiệu bản thân</h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#64796a]">
                          <span>HSK 1 · Cô Ning Ning</span>
                          <span>•</span>
                          <span className="text-orange-700">Hạn: 22/10/2026</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => alert("Bài tập viết tự do sẽ nộp trong phòng học.")}
                      className="px-4 py-2 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#132e23] transition shrink-0 self-end sm:self-auto"
                    >
                      Làm bài
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== ROW 2: 3 QUICK ACTION CARDS ===================== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Card 1: Từ vựng */}
            <Link
              href="/s/review"
              className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] hover:border-[#1a3d2f] hover:shadow-md transition group flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#eaf4ed] text-[#1a3d2f] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6 stroke-[1.75]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1a3d2f]">Từ vựng</h4>
                  <p className="text-xs text-[#64796a]">Học từ mới, ôn theo chủ đề</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8ea394] group-hover:text-[#1a3d2f] transition" />
            </Link>

            {/* Card 2: Sổ tay lỗi sai */}
            <Link
              href="/s/practice/wrong"
              className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] hover:border-orange-400 hover:shadow-md transition group flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#fff2eb] text-[#ea580c] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-6 h-6 stroke-[1.75]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1a3d2f]">Sổ tay lỗi sai</h4>
                  <p className="text-xs text-[#64796a]">Xem lại các lỗi thường gặp</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8ea394] group-hover:text-orange-500 transition" />
            </Link>

            {/* Card 3: Luyện tập */}
            <Link
              href="/s/games"
              className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] hover:border-[#1a3d2f] hover:shadow-md transition group flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#eef6ff] text-[#2563eb] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <PenTool className="w-6 h-6 stroke-[1.75]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1a3d2f]">Luyện tập</h4>
                  <p className="text-xs text-[#64796a]">Làm bài tập, luyện đề HSK</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8ea394] group-hover:text-[#1a3d2f] transition" />
            </Link>
          </div>

          {/* ===================== ROW 3: TIẾN ĐỘ HỌC TẬP & MỤC TIÊU ===================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Tiến độ học tập */}
            <div className="lg:col-span-8 bg-[#fcfaf7] rounded-3xl p-6 border border-[#e6decb] shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#eee8dc]">
                <h3 className="font-bold text-sm text-[#1a3d2f] flex items-center gap-2">
                  <span>📊 Tiến độ học tập</span>
                </h3>
                <span className="text-xs text-[#64796a] bg-[#f4eee4] px-2.5 py-1 rounded-lg border border-[#e2dac9]">
                  7 ngày gần đây
                </span>
              </div>

              {/* 4 Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#f8f5ee] border border-[#e2dac9]">
                  <div className="flex items-center gap-2 text-xs text-[#64796a] mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#1a3d2f]" />
                    <span>Số bài đã học</span>
                  </div>
                  <div className="text-xl font-black text-[#1a3d2f] mb-2">28 / 40</div>
                  <div className="w-full bg-[#e2dac9] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#1a3d2f] h-full rounded-full" style={{ width: "70%" }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f8f5ee] border border-[#e2dac9]">
                  <div className="flex items-center gap-2 text-xs text-[#64796a] mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#2563eb]" />
                    <span>Thời gian học</span>
                  </div>
                  <div className="text-xl font-black text-[#1a3d2f] mb-2">12.5 giờ</div>
                  <div className="w-full bg-[#e2dac9] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#2563eb] h-full rounded-full" style={{ width: "80%" }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f8f5ee] border border-[#e2dac9]">
                  <div className="flex items-center gap-2 text-xs text-[#64796a] mb-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>Tỷ lệ hoàn thành</span>
                  </div>
                  <div className="text-xl font-black text-[#1a3d2f] mb-2">75%</div>
                  <div className="w-full bg-[#e2dac9] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f8f5ee] border border-[#e2dac9]">
                  <div className="flex items-center gap-2 text-xs text-[#64796a] mb-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span>Số ngày học liên tục</span>
                  </div>
                  <div className="text-xl font-black text-[#1a3d2f] mb-2">{data?.student?.streakDays || 7} ngày</div>
                  <div className="w-full bg-[#e2dac9] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Mục tiêu của tôi */}
            <div className="lg:col-span-4 bg-[#fcfaf7] rounded-3xl p-6 border border-[#e6decb] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#eee8dc]">
                  <h3 className="font-bold text-sm text-[#1a3d2f] flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#b91c1c]" />
                    <span>Mục tiêu của tôi</span>
                  </h3>
                  <button
                    onClick={() => router.push("/onboarding")}
                    className="text-xs text-[#64796a] hover:text-[#1a3d2f] font-semibold"
                  >
                    Chỉnh sửa →
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#f4eee4] border border-[#e2dac9] mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚩</span>
                      <div>
                        <h4 className="font-bold text-sm text-[#1a3d2f]">Đạt HSK 3</h4>
                        <span className="text-[10px] text-[#64796a]">Dự kiến: Tháng 12/2026</span>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-[#1a3d2f]">60%</span>
                  </div>
                  <div className="w-full bg-[#e2dac9] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#1a3d2f] h-full rounded-full" style={{ width: "60%" }} />
                  </div>
                </div>

                {/* Motivational Quote */}
                <p className="text-xs text-[#5c7363] italic leading-relaxed pt-2">
                  “Hôm nay tốt hơn hôm qua một chút chính là tiến bộ.”
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
