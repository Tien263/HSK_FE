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
  Search,
  Bell,
  Plus,
  Send,
  Calendar as CalendarIcon,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  X,
  CheckCircle2,
  Award,
  UserPlus,
  ArrowLeft,
  Copy,
  BookMarked,
  Clock,
  Sparkles,
} from "lucide-react";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [classFilter, setClassFilter] = useState("Tuần này");
  const [searchQuery, setSearchQuery] = useState("");

  // Global modals
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  // Class Management Workspace states
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassData, setSelectedClassData] = useState<any | null>(null);
  const [classSubTab, setClassSubTab] = useState<"students" | "assignments" | "materials">("students");
  const [loadingClassDetail, setLoadingClassDetail] = useState(false);

  // Form states: Create Class
  const [newClassName, setNewClassName] = useState("");
  const [newClassLevel, setNewClassLevel] = useState(1);
  const [newClassDesc, setNewClassDesc] = useState("");

  // Form states: Add Student
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentUsername, setNewStudentUsername] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("123456");
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [justCreatedStudent, setJustCreatedStudent] = useState<any | null>(null);

  // Form states: Create Lesson & Assignment
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonHsk, setNewLessonHsk] = useState(1);
  const [newAssignTitle, setNewAssignTitle] = useState("");
  const [newAssignClassId, setNewAssignClassId] = useState("");

  // Data states from DB
  const [overviewData, setOverviewData] = useState<any>(null);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [assignmentsList, setAssignmentsList] = useState<any[]>([]);
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [questionSkill, setQuestionSkill] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [resOverview, resClasses, resLessons, resAssignments] = await Promise.all([
        fetch("/api/v1/reports/overview").then((r) => r.json()),
        fetch("/api/v1/classes").then((r) => r.json()),
        fetch("/api/v1/lessons").then((r) => r.json()),
        fetch("/api/v1/assignments").then((r) => r.json()),
      ]);

      if (resOverview.success) setOverviewData(resOverview.data);
      if (resClasses.success) {
        setClassesList(resClasses.items);
        if (resClasses.items.length > 0 && !newAssignClassId) {
          setNewAssignClassId(resClasses.items[0].id);
        }
      }
      if (resLessons.success) setLessonsList(resLessons.items);
      if (resAssignments.success) setAssignmentsList(resAssignments.items);

      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch tab-specific data when tab changes
  useEffect(() => {
    if (activeTab === "questions") {
      fetch(`/api/v1/questions?skill=${questionSkill}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setQuestionsList(data.items);
        });
    } else if (activeTab === "students") {
      fetch("/api/v1/students")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setStudentsList(data.items);
        });
    }
  }, [activeTab, questionSkill]);

  // Open class detail workspace
  const handleOpenClass = async (classId: string) => {
    setSelectedClassId(classId);
    setLoadingClassDetail(true);
    setClassSubTab("students");
    setJustCreatedStudent(null);
    try {
      const res = await fetch(`/api/v1/classes/${classId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedClassData(data.class);
      }
      setLoadingClassDetail(false);
    } catch {
      setLoadingClassDetail(false);
    }
  };

  const handleBackToClassesList = () => {
    setSelectedClassId(null);
    setSelectedClassData(null);
    setJustCreatedStudent(null);
  };

  // Create class handler
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClassName,
          level: Number(newClassLevel),
          description: newClassDesc,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateClassModalOpen(false);
        setNewClassName("");
        setNewClassDesc("");
        // Reload list and immediately open this new class workspace
        const cRes = await fetch("/api/v1/classes").then((r) => r.json());
        if (cRes.success) {
          setClassesList(cRes.items);
        }
        handleOpenClass(data.item.id);
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch {
      alert("Lỗi kết nối khi tạo lớp học.");
    }
  };

  // Add student handler
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;

    try {
      const res = await fetch(`/api/v1/classes/${selectedClassId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStudentName,
          username: newStudentUsername,
          password: newStudentPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setJustCreatedStudent(data.student);
        setIsAddStudentModalOpen(false);
        setNewStudentName("");
        setNewStudentUsername("");
        setNewStudentPassword("123456");

        // Refresh current class details
        const clRes = await fetch(`/api/v1/classes/${selectedClassId}`).then((r) => r.json());
        if (clRes.success) setSelectedClassData(clRes.class);

        // Refresh global classes count
        const allClRes = await fetch("/api/v1/classes").then((r) => r.json());
        if (allClRes.success) setClassesList(allClRes.items);
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch {
      alert("Lỗi kết nối khi cấp tài khoản học sinh.");
    }
  };

  // Copy credentials helper
  const handleCopyCredentials = (s: any) => {
    const text = `🎉 Chào em ${s.name}! Cô Ning Ning gửi em thông tin tài khoản đăng nhập vào lớp tiếng Trung:\n🔗 Link đăng nhập: http://localhost:3000/login\n👤 Tên đăng nhập: ${s.username}\n🔑 Mật khẩu: ${s.password || "123456"}\nChúc em học tập thật tốt cùng cô nhé! 加油!💪`;
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newLessonTitle,
          hskLevel: Number(newLessonHsk),
          lessonNumber: lessonsList.length + 1,
        }),
      });
      if (res.ok) {
        setIsLessonModalOpen(false);
        setNewLessonTitle("");
        const lRes = await fetch("/api/v1/lessons").then((r) => r.json());
        if (lRes.success) setLessonsList(lRes.items);
      }
    } catch {
      setIsLessonModalOpen(false);
    }
  };

  const handleCreateAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetClass = selectedClassId || newAssignClassId || (classesList[0] && classesList[0].id);
      const res = await fetch("/api/v1/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAssignTitle,
          classId: targetClass,
          durationMin: 30,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAssignModalOpen(false);
        setNewAssignTitle("");
        const aRes = await fetch("/api/v1/assignments").then((r) => r.json());
        if (aRes.success) setAssignmentsList(aRes.items);

        if (selectedClassId) {
          const clRes = await fetch(`/api/v1/classes/${selectedClassId}`).then((r) => r.json());
          if (clRes.success) setSelectedClassData(clRes.class);
        }
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch {
      alert("Lỗi kết nối máy chủ.");
    }
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
                  Cô Ning Ning · Dashboard
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-sm font-medium">
            <button
              onClick={() => {
                setActiveTab("overview");
                setSelectedClassId(null);
              }}
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
              { id: "lessons", label: "Kho bài học", icon: BookOpen },
              { id: "assignments", label: "Bài tập cô giao", icon: FileCheck2 },
              { id: "questions", label: "Ngân hàng câu hỏi", icon: HelpCircle },
              { id: "students", label: "Học sinh", icon: GraduationCap },
              { id: "reports", label: "Báo cáo tiến độ", icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id !== "classes") setSelectedClassId(null);
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

            <Link
              href="/s/games"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition cursor-pointer text-[13px] text-[#526857] hover:bg-[#f0f6f2] hover:text-[#1b4d2a]"
            >
              <Gamepad2 className="w-4 h-4 stroke-[1.75]" />
              <span>Chơi Game Center 🎮</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Journey Banner */}
        <div className="p-4">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#dcf0e2] to-[#bfe4ca] p-4 text-[#1a4d2e] shadow-sm border border-[#c4e3cf]">
            <div className="relative z-10">
              <span className="text-[11px] text-[#2d6e42] font-semibold block uppercase tracking-wider mb-1">
                Lớp tiếng Trung
              </span>
              <h5 className="font-bold text-sm leading-tight mb-3">
                Không gian học tập <br /> <span className="text-base font-black">Cô Ning Ning</span>
              </h5>
              <Link
                href="/"
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
            <Link
              href="/"
              className="text-xs text-[#4d6353] hover:text-[#256f3a] font-medium px-2 py-1 transition hidden sm:inline"
            >
              Về Trang chủ
            </Link>

            {/* Notification bell */}
            <div className="relative w-10 h-10 rounded-xl bg-[#f3f7f4] text-[#4d6353] flex items-center justify-center">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                1
              </span>
            </div>

            {/* Teacher Profile */}
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-[#e3ece5]">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 border border-[#bfe4ca] relative shrink-0 flex items-center justify-center text-lg">
                🐼
              </div>
              <div className="leading-tight hidden md:block">
                <span className="font-bold text-xs text-[#1e2e22] block">
                  Cô Ning Ning
                </span>
                <span className="text-[11px] text-[#6b8271] block">
                  宁宁老师 (Giáo viên)
                </span>
              </div>
              <Link
                href="/login"
                className="text-[11px] font-bold text-red-600 hover:underline ml-2"
                title="Đăng xuất"
              >
                Thoát
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-6 lg:p-10 space-y-8 max-w-[1580px] w-full mx-auto">
          {/* Welcome Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#e6f4ea] via-[#edf7f0] to-[#f7fbf8] border border-[#d6e8db] p-8 lg:p-10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl z-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#154625] tracking-tight mb-2 flex items-center gap-2">
                <span>Chào mừng cô Ning Ning!</span>
                <span className="text-xl">🌱</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#48634f] leading-relaxed mb-6 font-normal">
                Không gian theo dõi lớp học, bài tập và tiến độ của từng học sinh theo chuẩn HSK 3.0.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsCreateClassModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#256f3a] text-white text-xs font-bold hover:bg-[#1c552b] transition flex items-center gap-1.5 shadow-md shadow-emerald-950/10 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Tạo lớp học mới</span>
                </button>

                <button
                  onClick={() => setIsLessonModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#bedac5] text-[#256f3a] text-xs font-semibold hover:bg-[#f2f8f4] transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Tạo bài học</span>
                </button>

                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#bedac5] text-[#256f3a] text-xs font-semibold hover:bg-[#f2f8f4] transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Giao bài tập</span>
                </button>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4 z-10">
              <div className="relative w-44 h-32 rounded-2xl bg-[#1b4329] p-3 text-white border-4 border-[#8c6747] shadow-lg flex flex-col justify-between">
                <div className="text-[11px] font-mono tracking-widest text-center text-emerald-200">
                  好好学习
                  <br />
                  天天向上 ♡
                </div>
                <div className="bg-white/10 rounded px-2 py-1 text-[10px] text-center text-emerald-100">
                  Lớp cô Ning Ning 🐼
                </div>
              </div>
            </div>
          </div>

          {/* ===================== TAB VIEW 1: OVERVIEW ===================== */}
          {activeTab === "overview" && (
            <>
              {/* 4 Key Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#eaf7ee] text-[#256f3a] flex items-center justify-center shrink-0">
                    <Users className="w-7 h-7 stroke-[1.75]" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#154625] leading-none mb-1.5">
                      {classesList.length || 1}
                    </div>
                    <div className="text-xs font-bold text-[#445b4a]">Lớp học phụ trách</div>
                    <div className="text-[11px] text-[#256f3a] font-medium mt-1">Đang hoạt động</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#fff2eb] text-[#ea580c] flex items-center justify-center shrink-0">
                    <GraduationCap className="w-7 h-7 stroke-[1.75]" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#154625] leading-none mb-1.5">
                      {overviewData?.summary?.totalStudents || 1}
                    </div>
                    <div className="text-xs font-bold text-[#445b4a]">Học sinh đã cấp tài khoản</div>
                    <div className="text-[11px] text-[#ea580c] font-medium mt-1">Học sinh nội bộ</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#eef6ff] text-[#2563eb] flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-7 h-7 stroke-[1.75]" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#154625] leading-none mb-1.5">
                      {assignmentsList.length}
                    </div>
                    <div className="text-xs font-bold text-[#445b4a]">Bài tập đã giao</div>
                    <div className="text-[11px] text-[#2563eb] font-medium mt-1">
                      {assignmentsList.length} bài đang mở
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#faf5ff] text-[#9333ea] flex items-center justify-center shrink-0">
                    <TrendingUp className="w-7 h-7 stroke-[1.75]" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#154625] leading-none mb-1.5">
                      {overviewData?.summary?.completionRate || 85}%
                    </div>
                    <div className="text-xs font-bold text-[#445b4a]">Tỷ lệ hoàn thành</div>
                    <div className="text-[11px] text-[#9333ea] font-medium mt-1">
                      Tiến độ rất tích cực
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress & Recent Assignments */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-[#154625]">Tiến độ học tập của các lớp</h3>
                    <button
                      onClick={() => {
                        setActiveTab("classes");
                        setSelectedClassId(null);
                      }}
                      className="text-xs text-[#256f3a] font-bold hover:underline"
                    >
                      Quản lý lớp →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {classesList.map((cls) => (
                      <div
                        key={cls.id}
                        onClick={() => {
                          setActiveTab("classes");
                          handleOpenClass(cls.id);
                        }}
                        className="p-4 rounded-xl bg-[#f8faf8] border border-[#e2ece5] hover:border-[#256f3a] cursor-pointer transition"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-[#1e2e22]">{cls.name}</span>
                          <span className="text-xs font-bold text-[#256f3a]">Vào lớp →</span>
                        </div>
                        <div className="w-full bg-[#e2e8f0] h-2.5 rounded-full overflow-hidden flex">
                          <div style={{ width: "85%" }} className="bg-[#256f3a] h-full" />
                          <div style={{ width: "10%" }} className="bg-[#f59e0b] h-full" />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-[11px] text-[#64748b]">
                          <span>{cls.totalStudents} học sinh</span>
                          <span>{cls.totalAssignments} bài tập</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#e3ece5] shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-[#154625]">Bài tập gần đây</h3>
                    <button
                      onClick={() => setActiveTab("assignments")}
                      className="text-xs text-[#256f3a] font-bold hover:underline"
                    >
                      Xem tất cả →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {assignmentsList.map((a) => (
                      <div key={a.id} className="p-4 rounded-xl border border-[#e3ece5] flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-[#1e2e22]">{a.title}</h4>
                          <span className="text-[11px] text-[#64748b]">{a.className} · {a.durationMin} phút</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-md bg-[#eaf4ed] text-[#256f3a] font-bold text-[11px]">
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===================== TAB VIEW 2: CLASSES (HIERARCHICAL LMS WORKSPACE) ===================== */}
          {activeTab === "classes" && (
            <div>
              {/* IF NO CLASS IS SELECTED: LIST OF CLASSES */}
              {!selectedClassId && (
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#e3ece5] shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#f0f4f1]">
                    <div>
                      <h3 className="text-xl font-bold text-[#154625]">Danh sách Lớp học phụ trách</h3>
                      <p className="text-xs text-[#64748b] mt-0.5">Chọn một lớp học để cấp tài khoản học sinh, giao bài tập hoặc thêm tài liệu</p>
                    </div>

                    <button
                      onClick={() => setIsCreateClassModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-[#256f3a] text-white text-xs font-bold hover:bg-[#1e5a2e] transition shadow-md shadow-[#256f3a]/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tạo lớp học mới</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classesList.map((cls) => (
                      <div
                        key={cls.id}
                        className="p-6 rounded-2xl bg-[#f8faf8] border border-[#e2ece5] hover:border-[#256f3a] hover:shadow-md transition duration-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-3 py-1 rounded-full bg-[#eaf4ed] text-[#256f3a] font-bold text-xs font-mono">
                              HSK {cls.level}
                            </span>
                            <span className="text-xs text-[#64748b] font-medium">Đang hoạt động</span>
                          </div>

                          <h4 className="text-xl font-bold text-[#1e2e22] mb-1.5">{cls.name}</h4>
                          <p className="text-xs text-[#64748b] mb-6 line-clamp-2">
                            {cls.description || "Lớp tiếng Trung HSK chuẩn cô Ning Ning trực tiếp giảng dạy"}
                          </p>
                        </div>

                        <div>
                          <div className="pt-4 border-t border-[#e2ece5] flex items-center justify-between text-xs font-medium text-[#475569] mb-4">
                            <span>👥 {cls.totalStudents} học sinh</span>
                            <span>📝 {cls.totalAssignments} bài tập</span>
                          </div>

                          <button
                            onClick={() => handleOpenClass(cls.id)}
                            className="w-full py-2.5 rounded-xl bg-[#256f3a] text-white text-xs font-bold hover:bg-[#1e5a2e] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <span>Vào quản lý lớp</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IF A CLASS IS SELECTED: CLASS WORKSPACE HIERARCHY */}
              {selectedClassId && (
                <div className="space-y-6">
                  {/* Top Breadcrumbs & Back Button */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleBackToClassesList}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#64748b] hover:text-[#256f3a] transition px-3 py-1.5 rounded-xl bg-white border border-[#dce8e0] shadow-2xs"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Về danh sách lớp</span>
                    </button>

                    <div className="flex items-center gap-2 text-xs text-[#64748b]">
                      <span>Quản lý lớp học</span>
                      <span>/</span>
                      <strong className="text-[#256f3a]">{selectedClassData?.name || "Đang tải lớp..."}</strong>
                    </div>
                  </div>

                  {/* Class Main Card */}
                  <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#e3ece5] shadow-xs">
                    {/* Header info of this class */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#f0f4f1]">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span className="px-3 py-1 rounded-full bg-[#eaf4ed] text-[#256f3a] font-bold text-xs font-mono">
                            HSK {selectedClassData?.level}
                          </span>
                          <h2 className="text-2xl font-black text-[#154625]">{selectedClassData?.name}</h2>
                        </div>
                        <p className="text-xs text-[#64748b]">
                          {selectedClassData?.description || "Lớp tiếng Trung HSK chuẩn cô Ning Ning trực tiếp giảng dạy"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => {
                            setJustCreatedStudent(null);
                            setIsAddStudentModalOpen(true);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#256f3a] text-white text-xs font-bold hover:bg-[#1e5a2e] transition shadow-md shadow-[#256f3a]/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>+ Cấp tài khoản học sinh</span>
                        </button>

                        <button
                          onClick={() => {
                            setNewAssignClassId(selectedClassId);
                            setIsAssignModalOpen(true);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-white border border-[#bedac5] text-[#256f3a] text-xs font-bold hover:bg-[#f2f8f4] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Giao bài cho lớp này</span>
                        </button>
                      </div>
                    </div>

                    {/* Recently Created Student Notification Box with 1-Click Copy */}
                    {justCreatedStudent && (
                      <div className="my-6 p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-bold text-[#065f46] mb-1">
                            <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                            <span>Đã cấp tài khoản thành công cho em {justCreatedStudent.name}!</span>
                          </div>
                          <div className="text-xs text-[#047857] flex flex-wrap items-center gap-3 font-mono">
                            <span>Tên đăng nhập: <strong>{justCreatedStudent.username}</strong></span>
                            <span>•</span>
                            <span>Mật khẩu: <strong>{justCreatedStudent.password || "123456"}</strong></span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopyCredentials(justCreatedStudent)}
                          className="px-4 py-2 rounded-xl bg-white border border-[#a7f3d0] text-xs font-bold text-[#065f46] hover:bg-[#d1fae5] transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedNotice ? "✓ Đã sao chép!" : "Sao chép gửi Zalo/Phụ huynh"}</span>
                        </button>
                      </div>
                    )}

                    {/* 3 Class Subtabs Navigation */}
                    <div className="flex items-center gap-2 pt-6 mb-6 border-b border-[#f0f4f1]">
                      {[
                        { id: "students", label: `Học sinh của lớp (${selectedClassData?.students?.length || 0})`, icon: Users },
                        { id: "assignments", label: `Bài tập & Đề thi (${selectedClassData?.assignments?.length || 0})`, icon: FileCheck2 },
                        { id: "materials", label: `Tài liệu & Bài học HSK (${selectedClassData?.lessons?.length || 0})`, icon: BookMarked },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = classSubTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setClassSubTab(tab.id as any)}
                            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                              isActive
                                ? "border-[#256f3a] text-[#256f3a]"
                                : "border-transparent text-[#64748b] hover:text-[#1e2e22]"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* SUBTAB 1: STUDENTS OF THIS CLASS */}
                    {classSubTab === "students" && (
                      <div className="space-y-4">
                        {selectedClassData?.students?.length === 0 ? (
                          <div className="text-center py-12 bg-[#f8faf8] rounded-2xl border border-dashed border-[#dce8e0]">
                            <div className="text-4xl mb-2">👤</div>
                            <h4 className="text-sm font-bold text-[#1e2e22] mb-1">Chưa có học sinh nào trong lớp này</h4>
                            <p className="text-xs text-[#64748b] mb-4">Cô Ning Ning hãy bấm nút dưới đây để tạo và cấp tài khoản cho học sinh</p>
                            <button
                              onClick={() => setIsAddStudentModalOpen(true)}
                              className="px-5 py-2.5 rounded-xl bg-[#256f3a] text-white text-xs font-bold hover:bg-[#1e5a2e] transition shadow-sm inline-flex items-center gap-1.5"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span>Cấp tài khoản học sinh đầu tiên</span>
                            </button>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#f8faf8] text-[#64748b] font-bold uppercase tracking-wider text-[11px] border-b border-[#e2ece5]">
                                <tr>
                                  <th className="py-3 px-4">Họ và tên</th>
                                  <th className="py-3 px-4">Tên đăng nhập (Username)</th>
                                  <th className="py-3 px-4">Điểm kinh nghiệm (XP)</th>
                                  <th className="py-3 px-4">Chuỗi học</th>
                                  <th className="py-3 px-4">Câu sai cần ôn</th>
                                  <th className="py-3 px-4 text-right">Thao tác</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#f0f4f1]">
                                {selectedClassData?.students?.map((s: any) => (
                                  <tr key={s.id} className="hover:bg-[#f8faf8] transition">
                                    <td className="py-3.5 px-4 font-bold text-[#1e2e22] flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#256f3a] flex items-center justify-center font-bold text-xs shrink-0">
                                        {s.name.charAt(0)}
                                      </div>
                                      <span>{s.name}</span>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-medium text-[#475569]">
                                      {s.username}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span className="font-bold text-[#256f3a] bg-[#eaf4ed] px-2.5 py-1 rounded-md">
                                        {s.totalXp} XP
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-orange-600 font-semibold">
                                      🔥 {s.streakDays} ngày
                                    </td>
                                    <td className="py-3.5 px-4">
                                      {s.wrongCount > 0 ? (
                                        <span className="text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-bold">
                                          {s.wrongCount} câu
                                        </span>
                                      ) : (
                                        <span className="text-emerald-700 font-medium">0 câu (Rất tốt)</span>
                                      )}
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                      <button
                                        onClick={() => handleCopyCredentials(s)}
                                        className="text-[#256f3a] font-bold hover:underline inline-flex items-center gap-1"
                                        title="Sao chép thông tin tài khoản"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Gửi thông tin</span>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUBTAB 2: ASSIGNMENTS OF THIS CLASS */}
                    {classSubTab === "assignments" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2">
                          <span className="text-xs text-[#64748b]">Danh sách bài tập và đề kiểm tra đã giao riêng cho lớp này</span>
                          <button
                            onClick={() => {
                              setNewAssignClassId(selectedClassId);
                              setIsAssignModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#256f3a] text-white text-xs font-bold hover:bg-[#1e5a2e] transition shadow-xs flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Giao bài mới</span>
                          </button>
                        </div>

                        {selectedClassData?.assignments?.length === 0 ? (
                          <div className="text-center py-10 bg-[#f8faf8] rounded-2xl border border-dashed border-[#dce8e0] text-xs text-[#64748b]">
                            Chưa có bài tập nào giao cho lớp này. Hãy bấm "Giao bài mới" ở trên để giao bài cho học sinh.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {selectedClassData?.assignments?.map((a: any) => (
                              <div key={a.id} className="p-4 rounded-xl border border-[#e3ece5] flex items-center justify-between hover:border-[#256f3a] transition">
                                <div>
                                  <h4 className="font-bold text-sm text-[#1e2e22] mb-0.5">{a.title}</h4>
                                  <div className="flex items-center gap-3 text-xs text-[#64748b]">
                                    <span>Thời gian: {a.durationMin} phút</span>
                                    <span>•</span>
                                    <span>Hạn nộp: {new Date(a.dueAt).toLocaleDateString("vi-VN")}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-[#256f3a] bg-[#eaf4ed] px-3 py-1.5 rounded-lg">
                                    {a.submittedCount} em đã nộp bài
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUBTAB 3: MATERIALS & LESSONS */}
                    {classSubTab === "materials" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2">
                          <span className="text-xs text-[#64748b]">Giáo trình và bài học số hóa chuẩn HSK {selectedClassData?.level} của lớp</span>
                          <button
                            onClick={() => {
                              setNewLessonHsk(selectedClassData?.level || 1);
                              setIsLessonModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#256f3a] text-white text-xs font-bold hover:bg-[#1e5a2e] transition shadow-xs flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm bài học</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedClassData?.lessons?.map((l: any) => (
                            <div key={l.id} className="p-4 rounded-2xl bg-[#f8faf8] border border-[#e2ece5] flex items-center justify-between">
                              <div>
                                <span className="text-[11px] font-bold text-[#256f3a] bg-white px-2 py-0.5 rounded border border-[#dae6dc]">
                                  Bài {l.lessonNumber}
                                </span>
                                <h4 className="font-bold text-sm text-[#1e2e22] mt-1">{l.title}</h4>
                                <span className="text-xs text-[#64748b]">{l.vocabCount} từ vựng · {l.grammarCount} ngữ pháp</span>
                              </div>

                              <Link
                                href="/s/review"
                                className="px-3 py-1.5 rounded-lg bg-white border border-[#bedac5] text-[#256f3a] font-bold text-xs hover:bg-[#eaf4ed] transition"
                              >
                                Xem trước
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB VIEW 3: LESSONS ===================== */}
          {activeTab === "lessons" && (
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#e3ece5] shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#f0f4f1]">
                <div>
                  <h3 className="text-xl font-bold text-[#154625]">Kho bài học giáo trình</h3>
                  <p className="text-xs text-[#64748b] mt-0.5">Toàn bộ bài giảng, từ vựng và ngữ pháp đã được số hóa</p>
                </div>
                <button
                  onClick={() => setIsLessonModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#256f3a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo bài học mới</span>
                </button>
              </div>

              <div className="space-y-4">
                {lessonsList.map((l) => (
                  <div key={l.id} className="p-5 rounded-2xl border border-[#e3ece5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#256f3a] transition">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#256f3a] bg-[#eaf4ed] px-2 py-0.5 rounded">
                          HSK {l.hskLevel}
                        </span>
                        <h4 className="text-base font-bold text-[#1e2e22]">{l.title}</h4>
                      </div>
                      <p className="text-xs text-[#64748b]">{l.description || "Từ vựng trọng tâm & mẫu câu giao tiếp đời sống"}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-[#475569]">
                      <span>{l.vocabCount || 5} từ vựng</span>
                      <span>{l.grammarCount || 1} ngữ pháp</span>
                      <span className="px-2.5 py-1 rounded bg-[#ecfdf5] text-[#047857]">{l.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB VIEW 4: ASSIGNMENTS ===================== */}
          {activeTab === "assignments" && (
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#e3ece5] shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#f0f4f1]">
                <div>
                  <h3 className="text-xl font-bold text-[#154625]">Bài tập & Kiểm tra đã giao</h3>
                  <p className="text-xs text-[#64748b] mt-0.5">Theo dõi hạn nộp, tỷ lệ làm bài và chấm điểm học sinh</p>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#256f3a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Giao bài tập mới</span>
                </button>
              </div>

              <div className="space-y-4">
                {assignmentsList.map((a) => (
                  <div key={a.id} className="p-5 rounded-2xl border border-[#e3ece5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#256f3a] transition">
                    <div>
                      <h4 className="text-base font-bold text-[#1e2e22] mb-1">{a.title}</h4>
                      <p className="text-xs text-[#64748b]">Lớp: <strong>{a.className}</strong> · Thời lượng: {a.durationMin} phút · Hạn nộp: {new Date(a.dueAt).toLocaleDateString("vi-VN")}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-[#256f3a] bg-[#eaf4ed] px-3 py-1.5 rounded-lg">
                        {a.submittedCount || 1} học sinh đã nộp
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB VIEW 5: QUESTIONS ===================== */}
          {activeTab === "questions" && (
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#e3ece5] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#f0f4f1]">
                <div>
                  <h3 className="text-xl font-bold text-[#154625]">Ngân hàng câu hỏi HSK 3.0</h3>
                  <p className="text-xs text-[#64748b] mt-0.5">Bộ câu hỏi trắc nghiệm, điền từ và phản xạ từ vựng trong cơ sở dữ liệu</p>
                </div>

                <div className="flex items-center gap-2">
                  {["ALL", "VOCABULARY", "GRAMMAR", "READING"].map((sk) => (
                    <button
                      key={sk}
                      onClick={() => setQuestionSkill(sk)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        questionSkill === sk
                          ? "bg-[#256f3a] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {sk === "ALL" ? "Tất cả" : sk === "VOCABULARY" ? "Từ vựng" : sk === "GRAMMAR" ? "Ngữ pháp" : "Đọc hiểu"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {questionsList.map((q, idx) => (
                  <div key={q.id} className="p-5 rounded-2xl border border-[#e3ece5] bg-[#f8faf8] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#256f3a] bg-white px-2.5 py-0.5 rounded border border-[#dae6dc]">
                        Câu {idx + 1} · {q.skill}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#154625]">
                        Đáp án đúng: <strong className="text-emerald-700 font-black">{q.correctAnswer}</strong>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#1e2e22]">{q.content}</h4>
                    {q.pinyinPrompt && <p className="text-xs font-mono text-[#64748b]">{q.pinyinPrompt}</p>}

                    <div className="pt-2 text-xs text-[#065f46] bg-[#ecfdf5] p-2.5 rounded-xl border border-[#a7f3d0]">
                      <strong>Giải thích:</strong> {q.explanation || "Không có giải thích thêm"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB VIEW 6: STUDENTS ===================== */}
          {activeTab === "students" && (
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#e3ece5] shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#f0f4f1]">
                <div>
                  <h3 className="text-xl font-bold text-[#154625]">Danh sách toàn bộ Học sinh</h3>
                  <p className="text-xs text-[#64748b] mt-0.5">Theo dõi điểm tích lũy XP, chuỗi học và các câu sai cần cô hỗ trợ</p>
                </div>
              </div>

              <div className="space-y-4">
                {studentsList.map((st) => (
                  <div key={st.id} className="p-5 rounded-2xl border border-[#e3ece5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#256f3a] transition">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#256f3a] flex items-center justify-center font-bold text-base">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#1e2e22]">{st.name} ({st.username})</h4>
                        <p className="text-xs text-[#64748b]">Lớp: <strong>{st.className}</strong> · HSK {st.currentHskLevel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="text-[#256f3a] bg-[#eaf4ed] px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        {st.totalXp} XP
                      </span>
                      <span className="text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg">
                        🔥 Chuỗi {st.streakDays} ngày
                      </span>
                      <span className="text-red-700 bg-red-50 px-3 py-1.5 rounded-lg">
                        {st.wrongQuestionsCount} câu sai trong sổ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB VIEW 7: REPORTS ===================== */}
          {activeTab === "reports" && (
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#e3ece5] shadow-xs space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#154625]">Báo cáo & Phân tích lớp học</h3>
                <p className="text-xs text-[#64748b] mt-0.5">Số liệu tổng hợp giúp cô Ning Ning giảng giải đúng điểm yếu của học sinh</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#f8faf8] border border-[#e2ece5]">
                  <h4 className="font-bold text-sm text-[#1e2e22] mb-3">Các câu hỏi học sinh làm sai nhiều</h4>
                  <div className="space-y-3">
                    {overviewData?.atRiskStudents?.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-[#e2ece5] text-xs">
                        <span className="font-bold text-[#c2410c]">{item.name} ({item.className})</span>
                        <p className="text-[#64748b] mt-0.5">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#f8faf8] border border-[#e2ece5]">
                  <h4 className="font-bold text-sm text-[#1e2e22] mb-3">Đánh giá kỹ năng lớp HSK 1A</h4>
                  <div className="space-y-3">
                    {overviewData?.skillRadar?.map((sk: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>{sk.skill}</span>
                          <span className="text-[#256f3a]">{sk.score}%</span>
                        </div>
                        <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                          <div style={{ width: `${sk.score}%` }} className="bg-[#256f3a] h-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================== MODAL: TẠO LỚP HỌC MỚI ===================== */}
      {isCreateClassModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#d6e8db]">
            <div className="flex items-center justify-between pb-4 border-b border-[#edf3ee] mb-5">
              <div>
                <h3 className="font-bold text-base text-[#154625]">Tạo Lớp học mới</h3>
                <p className="text-xs text-[#64748b]">Tạo không gian lớp học để cấp tài khoản và giao bài</p>
              </div>
              <button
                onClick={() => setIsCreateClassModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f3f7f4] flex items-center justify-center text-[#556959] hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">Tên lớp học</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ví dụ: HSK 1B, HSK 2A, Lớp Cấp Tốc T3-T5..."
                  className="w-full bg-[#f8faf8] border border-[#dae6dc] focus:border-[#256f3a] rounded-xl px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">Cấp độ HSK 3.0</label>
                <select
                  value={newClassLevel}
                  onChange={(e) => setNewClassLevel(Number(e.target.value))}
                  className="w-full bg-[#f8faf8] border border-[#dae6dc] focus:border-[#256f3a] rounded-xl px-4 py-2.5 text-xs outline-none"
                >
                  <option value={1}>HSK 1 (Sơ cấp - 500 từ)</option>
                  <option value={2}>HSK 2 (Sơ cấp - 1.272 từ)</option>
                  <option value={3}>HSK 3 (Sơ cấp - 2.245 từ)</option>
                  <option value={4}>HSK 4 (Trung cấp - 3.245 từ)</option>
                  <option value={5}>HSK 5 (Trung cấp - 4.316 từ)</option>
                  <option value={6}>HSK 6 (Trung cấp - 5.456 từ)</option>
                  <option value={7}>HSK 7-9 (Cao cấp - 11.092 từ)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">Mô tả / Lịch học</label>
                <input
                  type="text"
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="Ví dụ: Lớp tối Thứ 3 và Thứ 5 hàng tuần (19h30 - 21h00)"
                  className="w-full bg-[#f8faf8] border border-[#dae6dc] focus:border-[#256f3a] rounded-xl px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateClassModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#dae6dc] text-xs font-semibold text-[#556959]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#256f3a] text-white text-xs font-semibold shadow-md"
                >
                  Tạo lớp ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CẤP TÀI KHOẢN HỌC SINH MỚI ===================== */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#d6e8db]">
            <div className="flex items-center justify-between pb-4 border-b border-[#edf3ee] mb-5">
              <div>
                <h3 className="font-bold text-base text-[#154625]">Cấp tài khoản học sinh</h3>
                <p className="text-xs text-[#64748b]">Tạo tài khoản và ghi danh em vào lớp {selectedClassData?.name}</p>
              </div>
              <button
                onClick={() => setIsAddStudentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f3f7f4] flex items-center justify-center text-[#556959] hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">Họ và tên học sinh</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => {
                    setNewStudentName(e.target.value);
                    // Tự động gợi ý username không dấu
                    if (!newStudentUsername) {
                      const slug = e.target.value
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]/g, "");
                      if (slug) setNewStudentUsername(slug);
                    }
                  }}
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  className="w-full bg-[#f8faf8] border border-[#dae6dc] focus:border-[#256f3a] rounded-xl px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">Tên đăng nhập (Username)</label>
                <input
                  type="text"
                  required
                  value={newStudentUsername}
                  onChange={(e) => setNewStudentUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="Ví dụ: minhanh_hsk1"
                  className="w-full bg-[#f8faf8] border border-[#dae6dc] focus:border-[#256f3a] rounded-xl px-4 py-2.5 text-xs outline-none font-mono"
                />
                <p className="text-[10px] text-[#64748b] mt-1">Viết liền không dấu để học sinh đăng nhập dễ dàng</p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">Mật khẩu cấp cho em</label>
                <input
                  type="text"
                  required
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  placeholder="Mặc định: 123456"
                  className="w-full bg-[#f8faf8] border border-[#dae6dc] focus:border-[#256f3a] rounded-xl px-4 py-2.5 text-xs outline-none font-mono"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#dae6dc] text-xs font-semibold text-[#556959]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#256f3a] text-white text-xs font-bold shadow-md"
                >
                  Tạo & Cấp tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">Tên bài học</label>
                <input
                  type="text"
                  required
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Ví dụ: Bài 6 · 点菜 (Gọi món ăn)"
                  className="w-full bg-[#f8faf8] border border-[#dae6dc] focus:border-[#256f3a] rounded-xl px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">Cấp độ HSK 3.0</label>
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
                  Lưu vào SQLite
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
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">Tên bài tập</label>
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
                <label className="text-xs font-bold text-[#445b4a] block mb-1.5">Chọn lớp học</label>
                <select
                  value={newAssignClassId}
                  onChange={(e) => setNewAssignClassId(e.target.value)}
                  className="w-full bg-[#f8faf8] border border-[#dae6dc] focus:border-[#256f3a] rounded-xl px-4 py-2.5 text-xs outline-none"
                >
                  {classesList.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} (HSK {cls.level})
                    </option>
                  ))}
                </select>
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
