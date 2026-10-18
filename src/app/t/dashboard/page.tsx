"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileCheck2,
  HelpCircle,
  GraduationCap,
  BarChart3,
  Gamepad2,
  FolderOpen,
  MessageSquare,
  Settings,
  Search,
  Gift,
  Bell,
  Sun,
  ChevronDown,
  Plus,
  Send,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  ChevronLeft,
  X,
  CheckCircle2,
} from "lucide-react";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [classFilter, setClassFilter] = useState("Tuần này");
  const [skillClassFilter, setSkillClassFilter] = useState("HSK 2A");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Form states
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonHsk, setNewLessonHsk] = useState(1);
  const [newAssignTitle, setNewAssignTitle] = useState("");
  const [newAssignClass, setNewAssignClass] = useState("HSK 1B");

  // Notifications state
  const [notificationCount, setNotificationCount] = useState(3);

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newLessonTitle,
          hskLevel: Number(newLessonHsk),
          lessonNumber: 7,
        }),
      });
      if (res.ok) {
        alert("✅ Đã tạo bài học mới thành công!");
        setIsLessonModalOpen(false);
        setNewLessonTitle("");
      }
    } catch {
      alert("Đã ghi nhận bài học mới!");
      setIsLessonModalOpen(false);
    }
  };

  const handleCreateAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    alert(`✅ Đã giao bài tập "${newAssignTitle}" cho lớp ${newAssignClass}! Học sinh sẽ nhận được thông báo.`);
    setIsAssignModalOpen(false);
    setNewAssignTitle("");
  };

  return (
    <div className="min-h-screen bg-[#f2f7f3] text-[#1e2e22] flex font-sans antialiased">
      {/* ===================== SIDEBAR ===================== */}
      <aside className="w-64 bg-white border-r border-[#e3ece5] flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-40 hidden lg:flex">
        <div>
          {/* Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-[#f0f4f1]">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#eaf4ed] flex items-center justify-center text-2xl shadow-sm">
                🐼
              </div>
              <div className="leading-tight">
                <span className="font-bold text-[#1a4d2e] text-lg tracking-tight block">Hanyu</span>
                <span className="text-[11px] text-[#6b8271] tracking-wider block font-medium">
                  HSK Learning
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#256f3a] text-white shadow-md shadow-emerald-950/10 font-semibold"
                  : "text-[#4d6353] hover:bg-[#ebf4ee] hover:text-[#1b4d2a]"
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 stroke-[2]" />
                <span>Tổng quan</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-75" />
            </button>

            {[
              { id: "classes", label: "Quản lý lớp học", icon: Users },
              { id: "lessons", label: "Bài học", icon: BookOpen },
              { id: "assignments", label: "Bài tập & Kiểm tra", icon: FileCheck2 },
              { id: "questions", label: "Ngân hàng câu hỏi", icon: HelpCircle },
              { id: "students", label: "Học sinh", icon: GraduationCap },
              { id: "reports", label: "Thống kê", icon: BarChart3 },
              { id: "games", label: "Game Center", icon: Gamepad2 },
              { id: "materials", label: "Tài liệu", icon: FolderOpen },
              { id: "messages", label: "Tin nhắn", icon: MessageSquare },
              { id: "settings", label: "Cài đặt", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id !== "overview") {
                      alert(`Khu vực "${item.label}" sẵn sàng kết nối dữ liệu!`);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition cursor-pointer text-[13px] ${
                    activeTab === item.id
                      ? "bg-[#ebf4ee] text-[#1b4d2a] font-semibold"
                      : "text-[#526857] hover:bg-[#f0f6f2] hover:text-[#1b4d2a]"
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[1.75]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Journey Banner (Matching uploaded image) */}
        <div className="p-4">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#dcf0e2] to-[#bfe4ca] p-4 text-[#1a4d2e] shadow-sm border border-[#c4e3cf]">
            <div className="relative z-10">
              <span className="text-[11px] text-[#2d6e42] font-semibold block uppercase tracking-wider mb-1">
                Lớp cô Ning Ning
              </span>
              <h5 className="font-bold text-sm leading-tight mb-3">
                Hành trình <br /> <span className="text-base font-black">HSK 3.0</span> cùng bạn
              </h5>
              <button
                onClick={() => alert("Chương trình lộ trình HSK 3.0 chuẩn Hanban đang áp dụng cho 8 lớp học!")}
                className="w-8 h-8 rounded-full bg-[#256f3a] text-white flex items-center justify-center hover:bg-[#1a552b] transition shadow-md cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#e3ece5] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          {/* Search Bar with Ctrl+K */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 text-[#7b9381] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm lớp, học sinh, bài học, từ vựng..."
              className="w-full bg-[#f3f7f4] border border-transparent focus:border-[#256f3a] focus:bg-white rounded-xl pl-10 pr-20 py-2.5 text-xs text-[#1e2e22] placeholder-[#7b9381] outline-none transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#7b9381] bg-white px-2 py-0.5 rounded border border-[#dae6dc]">
              Ctrl K
            </span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {/* Back to Home Link */}
            <Link
              href="/"
              className="text-xs text-[#4d6353] hover:text-[#256f3a] font-medium px-2 py-1 transition hidden sm:inline"
            >
              Về Trang chủ
            </Link>

            {/* Gift icon button */}
            <button
              onClick={() => alert("Hộp quà thưởng động viên học viên tích cực trong tuần!")}
              className="w-10 h-10 rounded-xl bg-[#f3f7f4] text-[#4d6353] hover:text-[#256f3a] hover:bg-[#eaf4ed] flex items-center justify-center transition cursor-pointer"
              aria-label="Quà thưởng"
            >
              <Gift className="w-4 h-4" />
            </button>

            {/* Notification bell */}
            <button
              onClick={() => {
                alert("Bạn có 3 thông báo mới: 2 bài tập đã nộp, 1 câu hỏi cần giải đáp.");
                setNotificationCount(0);
              }}
              className="relative w-10 h-10 rounded-xl bg-[#f3f7f4] text-[#4d6353] hover:text-[#256f3a] hover:bg-[#eaf4ed] flex items-center justify-center transition cursor-pointer"
              aria-label="Thông báo"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-[#e3ece5]">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 border border-[#bfe4ca] relative shrink-0">
                <Image
                  src="/hsk-images/guide-hanzi.jpg"
                  alt="Cô Ning Ning"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="leading-tight hidden md:block">
                <span className="font-bold text-xs text-[#1e2e22] block">
                  Nguyễn Thảo
                </span>
                <span className="text-[11px] text-[#6b8271] block">
                  Cô Ning Ning (Giáo viên)
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#7b9381] hidden md:block" />
            </div>

            {/* Light/Dark Mode */}
            <button
              onClick={() => alert("Đang ở giao diện sáng tiêu chuẩn của cô giáo")}
              className="w-10 h-10 rounded-xl bg-[#f3f7f4] text-[#4d6353] hover:text-[#256f3a] flex items-center justify-center transition cursor-pointer ml-1"
              aria-label="Toggle theme"
            >
              <Sun className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-6 lg:p-10 space-y-8 max-w-[1580px] w-full mx-auto">
          {/* ===================== WELCOME BANNER ===================== */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#e6f4ea] via-[#edf7f0] to-[#f7fbf8] border border-[#d6e8db] p-8 lg:p-10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl z-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#154625] tracking-tight mb-2 flex items-center gap-2">
                <span>Chào mừng trở lại, cô Thảo!</span>
                <span className="text-xl">🌱</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#48634f] leading-relaxed mb-6 font-normal">
                Hôm nay là một ngày tuyệt vời để cùng học sinh tiến bộ hơn!
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {/* Date Pill */}
                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-[#cee2d3] px-3.5 py-2 rounded-xl text-xs font-medium text-[#2d5c39] shadow-xs">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#256f3a]" />
                  <span>Thứ Ba, 15 tháng 10, 2024</span>
                </div>

                {/* Create Lesson Button */}
                <button
                  onClick={() => setIsLessonModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#256f3a] text-white text-xs font-semibold hover:bg-[#1c552b] transition flex items-center gap-1.5 shadow-md shadow-emerald-950/10 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Tạo bài học</span>
                </button>

                {/* Assign Homework Button */}
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#bedac5] text-[#256f3a] text-xs font-semibold hover:bg-[#f2f8f4] transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Giao bài tập</span>
                </button>
              </div>
            </div>

            {/* Illustration Graphic on Right (Matching uploaded chalkboard image) */}
            <div className="hidden md:flex items-center gap-4 z-10">
              <div className="relative w-44 h-32 rounded-2xl bg-[#1b4329] p-3 text-white border-4 border-[#8c6747] shadow-lg flex flex-col justify-between">
                <div className="text-[11px] font-mono tracking-widest text-center text-emerald-200">
                  好好学习
                  <br />
                  天天向上 ♡
                </div>
                <div className="bg-white/10 rounded px-2 py-1 text-[10px] text-center text-emerald-100">
                  Cùng học tốt hơn mỗi ngày! 💚
                </div>
              </div>
              <div className="text-5xl">🐼</div>
            </div>
          </div>

          {/* ===================== 4 KEY METRIC CARDS ===================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Lớp học */}
            <div className="bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs flex items-center gap-5 hover:border-[#bfe4ca] transition">
              <div className="w-14 h-14 rounded-2xl bg-[#eaf7ee] text-[#256f3a] flex items-center justify-center shrink-0">
                <Users className="w-7 h-7 stroke-[1.75]" />
              </div>
              <div>
                <div className="text-3xl font-black text-[#154625] leading-none mb-1.5">8</div>
                <div className="text-xs font-bold text-[#445b4a]">Lớp học</div>
                <div className="text-[11px] text-[#256f3a] font-medium mt-1">↑ +1 lớp mới</div>
              </div>
            </div>

            {/* Card 2: Học sinh */}
            <div className="bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs flex items-center gap-5 hover:border-[#fed7aa] transition">
              <div className="w-14 h-14 rounded-2xl bg-[#fff2eb] text-[#ea580c] flex items-center justify-center shrink-0">
                <GraduationCap className="w-7 h-7 stroke-[1.75]" />
              </div>
              <div>
                <div className="text-3xl font-black text-[#154625] leading-none mb-1.5">126</div>
                <div className="text-xs font-bold text-[#445b4a]">Học sinh</div>
                <div className="text-[11px] text-[#ea580c] font-medium mt-1">↑ +5 học sinh</div>
              </div>
            </div>

            {/* Card 3: Bài tập đang giao */}
            <div className="bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs flex items-center gap-5 hover:border-[#bfdbfe] transition">
              <div className="w-14 h-14 rounded-2xl bg-[#eef6ff] text-[#2563eb] flex items-center justify-center shrink-0">
                <FileCheck2 className="w-7 h-7 stroke-[1.75]" />
              </div>
              <div>
                <div className="text-3xl font-black text-[#154625] leading-none mb-1.5">12</div>
                <div className="text-xs font-bold text-[#445b4a]">Bài tập đang giao</div>
                <div className="text-[11px] text-[#2563eb] font-medium mt-1">5 sắp đến hạn</div>
              </div>
            </div>

            {/* Card 4: Tỷ lệ hoàn thành */}
            <div className="bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs flex items-center gap-5 hover:border-[#e9d5ff] transition">
              <div className="w-14 h-14 rounded-2xl bg-[#faf5ff] text-[#9333ea] flex items-center justify-center shrink-0">
                <TrendingUp className="w-7 h-7 stroke-[1.75]" />
              </div>
              <div>
                <div className="text-3xl font-black text-[#154625] leading-none mb-1.5">85%</div>
                <div className="text-xs font-bold text-[#445b4a]">Tỷ lệ hoàn thành</div>
                <div className="text-[11px] text-[#9333ea] font-medium mt-1">
                  +8% so với tuần trước
                </div>
              </div>
            </div>
          </div>

          {/* ===================== MIDDLE ROW (3 WIDGETS) ===================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Widget 1: Tiến độ học tập của các lớp (Width ~ 38%) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-sm text-[#154625]">Tiến độ học tập của các lớp</h3>
                <div className="relative">
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="bg-[#f3f7f4] border border-[#dae6dc] text-[#3e5644] text-xs font-medium rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="Tuần này">Tuần này</option>
                    <option value="Tháng này">Tháng này</option>
                    <option value="Tất cả">Tất cả</option>
                  </select>
                </div>
              </div>

              {/* Progress Legend */}
              <div className="flex items-center gap-4 text-[11px] text-[#657d6b] mb-6">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#256f3a]" />
                  <span>Hoàn thành</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span>Đang làm</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
                  <span>Chưa làm</span>
                </span>
              </div>

              {/* Segmented Bars */}
              <div className="space-y-4">
                {[
                  { name: "HSK 1A", count: "32/36", total: 89, done: 89, doing: 7, un: 4 },
                  { name: "HSK 1B", count: "28/30", total: 93, done: 93, doing: 5, un: 2 },
                  { name: "HSK 2A", count: "20/28", total: 71, done: 71, doing: 18, un: 11 },
                  { name: "HSK 3A", count: "18/25", total: 72, done: 72, doing: 16, un: 12 },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-16 shrink-0 leading-tight">
                      <div className="text-xs font-bold text-[#1b4329]">{row.name}</div>
                      <div className="text-[10px] text-[#7b9381]">{row.count}</div>
                    </div>
                    {/* Multi-color bar */}
                    <div className="flex-1 h-3 rounded-full overflow-hidden bg-[#e2e8f0] flex">
                      <div style={{ width: `${row.done}%` }} className="bg-[#256f3a] h-full" />
                      <div style={{ width: `${row.doing}%` }} className="bg-[#f59e0b] h-full" />
                    </div>
                    <div className="w-9 text-right text-xs font-bold text-[#1b4329]">
                      {row.total}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: Bài tập gần đây (Width ~ 34%) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-sm text-[#154625]">Bài tập gần đây</h3>
                <button
                  onClick={() => alert("Xem toàn bộ danh sách 12 bài tập đang giao")}
                  className="text-xs text-[#256f3a] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Assignment Items */}
              <div className="space-y-4">
                {[
                  {
                    title: "Bài 5 · 购物 (Từ vựng)",
                    cls: "Lớp HSK 1B",
                    due: "16/10",
                    done: "24/28",
                    iconBg: "bg-amber-100 text-amber-700",
                    icon: BookOpen,
                  },
                  {
                    title: "Ngữ pháp · 把字句",
                    cls: "Lớp HSK 3A",
                    due: "15/10",
                    done: "18/25",
                    iconBg: "bg-orange-100 text-orange-700",
                    icon: FileCheck2,
                  },
                  {
                    title: "Bài 4 · 家庭 (Nghe hiểu)",
                    cls: "Lớp HSK 1A",
                    due: "14/10",
                    done: "32/36",
                    iconBg: "bg-emerald-100 text-emerald-700",
                    icon: HelpCircle,
                  },
                  {
                    title: "Bài 6 · 旅行 (Đọc hiểu)",
                    cls: "Lớp HSK 2A",
                    due: "20/10",
                    done: "12/28",
                    iconBg: "bg-red-100 text-red-700",
                    icon: BookOpen,
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#f8faf8] border border-[#eaf0eb] flex items-center justify-between gap-3 hover:bg-[#f1f6f2] transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}
                        >
                          <Icon className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#1b4329] leading-tight">
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-[#657d6b]">{item.cls}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-mono font-bold block mb-1">
                          Hạn: {item.due}
                        </span>
                        <span className="text-[11px] font-bold text-[#256f3a]">
                          {item.done} đã nộp
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Widget 3: Lịch dạy & hạn nộp bài (Width ~ 28%) */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-[#154625]">Lịch dạy & hạn nộp bài</h3>
                <div className="flex items-center gap-1 text-xs text-[#657d6b]">
                  <ChevronLeft className="w-4 h-4 cursor-pointer hover:text-black" />
                  <ChevronRight className="w-4 h-4 cursor-pointer hover:text-black" />
                </div>
              </div>

              {/* Month Mini Header */}
              <div className="text-xs font-semibold text-[#256f3a] mb-3 flex items-center justify-between">
                <span>Tháng 10, 2024</span>
              </div>

              {/* Mini Calendar 7 Days Row */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-[#7b9381] mb-2">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>CN</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-5">
                {[14, 15, 16, 17, 18, 19, 20].map((d) => (
                  <button
                    key={d}
                    className={`py-1 rounded-lg font-medium cursor-pointer transition ${
                      d === 15
                        ? "bg-[#256f3a] text-white font-bold shadow-xs"
                        : "text-[#3e5644] hover:bg-[#ebf4ee]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Schedule for Today */}
              <div className="border-t border-[#edf3ee] pt-4">
                <div className="text-xs font-bold text-[#1b4329] mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#256f3a]" />
                  <span>Hôm nay (15/10)</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#256f3a] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-mono text-[#256f3a] font-bold block">
                        10:00 - 11:30
                      </span>
                      <strong className="text-xs text-[#154625] block">Lớp HSK 2A</strong>
                      <span className="text-[11px] text-[#556959]">Dạy bài 6 · 旅行</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-2.5">
                    <BookOpen className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-mono text-orange-600 font-bold block">
                        14:00 - 15:30
                      </span>
                      <strong className="text-xs text-[#154625] block">Lớp HSK 1B</strong>
                      <span className="text-[11px] text-[#556959]">Dạy bài 4 · 家庭</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-mono text-red-600 font-bold block">
                        23:59
                      </span>
                      <strong className="text-xs text-red-800 block">Hạn nộp: Bài tập từ vựng</strong>
                      <span className="text-[11px] text-[#556959]">Lớp HSK 1A, 1B</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== BOTTOM ROW (3 WIDGETS) ===================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Widget 1: Kết quả bài kiểm tra gần đây (Width ~ 38%) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-sm text-[#154625]">Kết quả bài kiểm tra gần đây</h3>
                <button
                  onClick={() => alert("Xem toàn bộ báo cáo điểm bài kiểm tra")}
                  className="text-xs text-[#256f3a] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[#657d6b] border-b border-[#edf3ee] pb-2 font-medium">
                      <th className="pb-2 font-semibold">Tên bài kiểm tra</th>
                      <th className="pb-2 font-semibold">Lớp</th>
                      <th className="pb-2 font-semibold text-center">Điểm TB</th>
                      <th className="pb-2 font-semibold text-right">Độ hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f4f1]">
                    {[
                      { name: "Bài 4 · 家庭", cls: "HSK 1A", score: 8.4, rate: 91, color: "bg-[#256f3a]" },
                      { name: "Bài 5 · 购物", cls: "HSK 1B", score: 7.8, rate: 82, color: "bg-[#256f3a]" },
                      { name: "Ngữ pháp tổng hợp", cls: "HSK 2A", score: 7.1, rate: 68, color: "bg-[#f59e0b]" },
                      { name: "Đọc hiểu 1", cls: "HSK 3A", score: 8.0, rate: 76, color: "bg-[#256f3a]" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#f9fbf9] transition">
                        <td className="py-3 font-bold text-[#1b4329]">{row.name}</td>
                        <td className="py-3 text-[#556959]">{row.cls}</td>
                        <td className="py-3 text-center font-bold text-[#154625]">{row.score}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden flex">
                              <div
                                style={{ width: `${row.rate}%` }}
                                className={`h-full ${row.color}`}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-bold text-[#154625]">
                              {row.rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Widget 2: Phân tích kết quả theo kỹ năng (Width ~ 34%) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-[#154625]">Phân tích kết quả theo kỹ năng</h3>
                <select
                  value={skillClassFilter}
                  onChange={(e) => setSkillClassFilter(e.target.value)}
                  className="bg-[#f3f7f4] border border-[#dae6dc] text-[#3e5644] text-xs font-medium rounded-lg px-2.5 py-1 outline-none cursor-pointer"
                >
                  <option value="HSK 2A">HSK 2A</option>
                  <option value="HSK 1A">HSK 1A</option>
                  <option value="HSK 1B">HSK 1B</option>
                  <option value="HSK 3A">HSK 3A</option>
                </select>
              </div>

              {/* Radar Chart SVG Visual */}
              <div className="relative h-56 flex items-center justify-center my-2">
                <svg viewBox="0 0 240 220" className="w-full h-full max-w-[260px]">
                  {/* Pentagonal web grid */}
                  <polygon
                    points="120,20 210,80 180,180 60,180 30,80"
                    fill="none"
                    stroke="#e2ebe4"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="120,50 175,90 155,160 85,160 65,90"
                    fill="none"
                    stroke="#e8efe9"
                    strokeWidth="1"
                  />
                  <polygon
                    points="120,80 145,100 135,140 105,140 95,100"
                    fill="none"
                    stroke="#edf3ee"
                    strokeWidth="1"
                  />

                  {/* Polygon value shape for skills:
                      Top: Tu vung (82%) -> 120, 32
                      Right: Ngu phap (68%) -> 180, 92
                      Bottom-Right: Nghe hieu (55%) -> 150, 160
                      Bottom-Left: Doc hieu (72%) -> 80, 165
                      Left: Viet (61%) -> 55, 95
                  */}
                  <polygon
                    points="120,32 180,92 150,160 80,165 55,95"
                    fill="rgba(37, 111, 58, 0.18)"
                    stroke="#256f3a"
                    strokeWidth="2"
                  />

                  {/* Points */}
                  <circle cx="120" cy="32" r="3.5" fill="#256f3a" />
                  <circle cx="180" cy="92" r="3.5" fill="#256f3a" />
                  <circle cx="150" cy="160" r="3.5" fill="#256f3a" />
                  <circle cx="80" cy="165" r="3.5" fill="#256f3a" />
                  <circle cx="55" cy="95" r="3.5" fill="#256f3a" />

                  {/* Labels */}
                  <text x="120" y="14" textAnchor="middle" className="text-[10px] font-bold fill-[#154625]">
                    Từ vựng 82%
                  </text>
                  <text x="215" y="85" textAnchor="start" className="text-[10px] font-bold fill-[#154625]">
                    Ngữ pháp 68%
                  </text>
                  <text x="160" y="200" textAnchor="middle" className="text-[10px] font-bold fill-[#154625]">
                    Nghe hiểu 55%
                  </text>
                  <text x="75" y="200" textAnchor="middle" className="text-[10px] font-bold fill-[#154625]">
                    Đọc hiểu 72%
                  </text>
                  <text x="20" y="85" textAnchor="end" className="text-[10px] font-bold fill-[#154625]">
                    Viết 61%
                  </text>
                </svg>
              </div>

              <div className="text-center text-[11px] text-[#657d6b] pt-2 border-t border-[#edf3ee]">
                Kỹ năng <strong className="text-[#256f3a]">Từ vựng (82%)</strong> tiến bộ vượt bậc so với tuần trước.
              </div>
            </div>

            {/* Widget 3: Học sinh cần hỗ trợ (Width ~ 28%) */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-sm text-[#154625]">Học sinh cần hỗ trợ</h3>
                <button
                  onClick={() => alert("Xem toàn bộ danh sách học sinh cần hỗ trợ")}
                  className="text-xs text-[#256f3a] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Student List */}
              <div className="space-y-3.5">
                {[
                  {
                    name: "Trần Minh Khang",
                    cls: "HSK 1B",
                    reason: "Thường sai từ vựng 3 bài gần đây",
                    avatarBg: "bg-orange-100 text-orange-700",
                    avatarInitial: "K",
                  },
                  {
                    name: "Lê Gia Hân",
                    cls: "HSK 2A",
                    reason: "Nghe hiểu dưới 50% 2 bài liên tiếp",
                    avatarBg: "bg-purple-100 text-purple-700",
                    avatarInitial: "H",
                  },
                  {
                    name: "Nguyễn Tuấn Kiệt",
                    cls: "HSK 3A",
                    reason: "Chưa nộp 2 bài tập quá hạn",
                    avatarBg: "bg-amber-100 text-amber-700",
                    avatarInitial: "K",
                  },
                  {
                    name: "Phạm Mai Linh",
                    cls: "HSK 1A",
                    reason: "Cần ôn lại ngữ pháp 把字句",
                    avatarBg: "bg-emerald-100 text-emerald-700",
                    avatarInitial: "L",
                  },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => alert(`Xem chi tiết tiến trình học của em ${s.name} (${s.cls})`)}
                    className="p-3 rounded-xl bg-[#f8faf8] border border-[#eaf0eb] hover:bg-[#f0f6f2] hover:border-[#bfe4ca] transition flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${s.avatarBg} font-bold text-xs flex items-center justify-center shrink-0`}
                      >
                        {s.avatarInitial}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#1b4329] group-hover:text-[#256f3a] transition">
                            {s.name}
                          </h4>
                          <span className="text-[10px] text-[#657d6b] bg-white border border-[#dae6dc] px-1.5 py-0.2 rounded font-mono">
                            {s.cls}
                          </span>
                        </div>
                        <p className="text-[11px] text-red-600 font-medium leading-tight mt-0.5">
                          {s.reason}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8ea797] group-hover:text-[#256f3a] transition shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ===================== MODAL: TẠO BÀI HỌC ===================== */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#d6e8db]">
            <div className="flex items-center justify-between pb-4 border-b border-[#edf3ee] mb-5">
              <h3 className="font-bold text-base text-[#154625]">Tạo bài học mới</h3>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f3f7f4] flex items-center justify-center text-[#556959] hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">
                  Tên bài học
                </label>
                <input
                  type="text"
                  required
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Ví dụ: Bài 7 · 点菜 (Gọi món ăn)"
                  className="w-full bg-[#f8faf8] border border-[#dae6dc] focus:border-[#256f3a] rounded-xl px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">
                  Cấp độ HSK 3.0
                </label>
                <select
                  value={newLessonHsk}
                  onChange={(e) => setNewLessonHsk(Number(e.target.value))}
                  className="w-full bg-[#f8faf8] border border-[#dae6dc] focus:border-[#256f3a] rounded-xl px-4 py-2.5 text-xs outline-none"
                >
                  <option value={1}>HSK 1 (Sơ cấp)</option>
                  <option value={2}>HSK 2 (Sơ cấp)</option>
                  <option value={3}>HSK 3 (Sơ cấp)</option>
                  <option value={4}>HSK 4 (Trung cấp)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#dae6dc] text-xs font-semibold text-[#556959]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#256f3a] text-white text-xs font-semibold shadow-md"
                >
                  Tạo bài học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: GIAO BÀI TẬP ===================== */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#d6e8db]">
            <div className="flex items-center justify-between pb-4 border-b border-[#edf3ee] mb-5">
              <h3 className="font-bold text-base text-[#154625]">Giao bài tập cho học sinh</h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f3f7f4] flex items-center justify-center text-[#556959] hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssign} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">
                  Tên bài tập / Bài kiểm tra
                </label>
                <input
                  type="text"
                  required
                  value={newAssignTitle}
                  onChange={(e) => setNewAssignTitle(e.target.value)}
                  placeholder="Ví dụ: Ôn tập từ vựng & Điền chữ Hán Bài 5"
                  className="w-full bg-[#f8faf8] border border-[#dae6dc] focus:border-[#256f3a] rounded-xl px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">
                  Chọn lớp học
                </label>
                <select
                  value={newAssignClass}
                  onChange={(e) => setNewAssignClass(e.target.value)}
                  className="w-full bg-[#f8faf8] border border-[#dae6dc] focus:border-[#256f3a] rounded-xl px-4 py-2.5 text-xs outline-none"
                >
                  <option value="HSK 1A">HSK 1A (36 học sinh)</option>
                  <option value="HSK 1B">HSK 1B (30 học sinh)</option>
                  <option value="HSK 2A">HSK 2A (28 học sinh)</option>
                  <option value="HSK 3A">HSK 3A (25 học sinh)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">
                  Hạn nộp bài
                </label>
                <input
                  type="date"
                  defaultValue="2024-10-20"
                  className="w-full bg-[#f8faf8] border border-[#dae6dc] focus:border-[#256f3a] rounded-xl px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#dae6dc] text-xs font-semibold text-[#556959]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#256f3a] text-white text-xs font-semibold shadow-md"
                >
                  Giao bài ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
