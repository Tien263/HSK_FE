"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Users,
  BookOpen,
  HelpCircle,
  PenTool,
  FileCheck2,
  Send,
  BarChart3,
  Bell,
  User,
  Search,
  Plus,
  ArrowRight,
  ChevronRight,
  X,
  CheckCircle2,
  Copy,
  UserPlus,
  BookMarked,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Award,
  MoreVertical,
  FolderArchive,
  FileText,
  UploadCloud,
  Download,
  Trash2,
  FileSpreadsheet,
  Presentation,
  Music,
  File,
  Layers,
} from "lucide-react";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isUploadMatModalOpen, setIsUploadMatModalOpen] = useState(false);

  // Materials Library states
  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [materialsStats, setMaterialsStats] = useState<any>({
    total: 0,
    vocabulary: 0,
    grammar: 0,
    slide: 0,
    textbook: 0,
    audio: 0,
  });
  const [selectedMatType, setSelectedMatType] = useState("ALL");
  const [selectedMatHsk, setSelectedMatHsk] = useState("ALL");
  const [matSearch, setMatSearch] = useState("");
  const [uploadingMat, setUploadingMat] = useState(false);

  // Form states: Upload Material
  const [newMatTitle, setNewMatTitle] = useState("");
  const [newMatType, setNewMatType] = useState<"VOCABULARY" | "GRAMMAR" | "SLIDE" | "TEXTBOOK" | "AUDIO" | "OTHER">("VOCABULARY");
  const [newMatHsk, setNewMatHsk] = useState(1);
  const [newMatClassId, setNewMatClassId] = useState("");
  const [newMatFileName, setNewMatFileName] = useState("");
  const [newMatFileSize, setNewMatFileSize] = useState("5.2 MB");
  const [newMatDesc, setNewMatDesc] = useState("");

  // Class Management Workspace states
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassData, setSelectedClassData] = useState<any | null>(null);
  const [classSubTab, setClassSubTab] = useState<"students" | "assignments" | "materials">("students");

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

  // Form states: Create Lesson & Assignment & Question
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonHsk, setNewLessonHsk] = useState(1);
  const [newAssignTitle, setNewAssignTitle] = useState("");
  const [newAssignClassId, setNewAssignClassId] = useState("");
  const [newQContent, setNewQContent] = useState("");
  const [newQCorrect, setNewQCorrect] = useState("A");
  const [newQSkill, setNewQSkill] = useState("VOCABULARY");

  // Data states from DB
  const [overviewData, setOverviewData] = useState<any>(null);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [assignmentsList, setAssignmentsList] = useState<any[]>([]);
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
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

  const fetchMaterials = async () => {
    try {
      const q = new URLSearchParams();
      if (selectedMatType !== "ALL") q.set("type", selectedMatType);
      if (selectedMatHsk !== "ALL") q.set("hskLevel", selectedMatHsk);
      if (matSearch) q.set("search", matSearch);

      const res = await fetch(`/api/v1/materials?${q.toString()}`).then((r) => r.json());
      if (res.success) {
        setMaterialsList(res.items);
        if (res.stats) setMaterialsStats(res.stats);
      }
    } catch (e) {
      console.error("fetchMaterials error:", e);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMaterials();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [selectedMatType, selectedMatHsk, matSearch, activeTab]);

  // Fetch tab-specific data when tab changes
  useEffect(() => {
    if (activeTab === "questions" || activeTab === "create-question") {
      fetch("/api/v1/questions")
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
  }, [activeTab]);

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingMat(true);
    try {
      const res = await fetch("/api/v1/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newMatTitle,
          type: newMatType,
          hskLevel: newMatHsk,
          classId: newMatClassId || null,
          fileName: newMatFileName || `${newMatTitle.replace(/\s+/g, "_")}.${newMatType === "SLIDE" ? "pptx" : newMatType === "VOCABULARY" ? "xlsx" : newMatType === "AUDIO" ? "mp3" : "pdf"}`,
          fileSize: newMatFileSize || "5.2 MB",
          description: newMatDesc,
          uploadedBy: "Cô Ning Ning",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsUploadMatModalOpen(false);
        setNewMatTitle("");
        setNewMatDesc("");
        setNewMatFileName("");
        fetchMaterials();
        alert("🎉 Đã lưu tài liệu thành công vào Kho thư viện!");
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch {
      alert("Lỗi kết nối khi tải lên tài liệu.");
    } finally {
      setUploadingMat(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này khỏi thư viện?")) return;
    try {
      const res = await fetch(`/api/v1/materials/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchMaterials();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open class detail workspace
  const handleOpenClass = async (classId: string) => {
    setSelectedClassId(classId);
    setClassSubTab("students");
    setJustCreatedStudent(null);
    try {
      const res = await fetch(`/api/v1/classes/${classId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedClassData(data.class);
      }
    } catch {}
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
        const cRes = await fetch("/api/v1/classes").then((r) => r.json());
        if (cRes.success) setClassesList(cRes.items);
        handleOpenClass(data.item.id);
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

        const clRes = await fetch(`/api/v1/classes/${selectedClassId}`).then((r) => r.json());
        if (clRes.success) setSelectedClassData(clRes.class);

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
    <div className="min-h-screen bg-[#f7f4ee] text-[#1e2e22] flex font-sans antialiased selection:bg-[#1a3d2f] selection:text-white">
      {/* ===================== SIDEBAR (Matching Mockup 2) ===================== */}
      <aside className="w-64 bg-[#fbf9f4] border-r border-[#e6decb] flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-40 hidden lg:flex">
        <div>
          {/* Logo Brand Header */}
          <div className="h-24 px-6 flex flex-col justify-center border-b border-[#eee8dc]">
            <Link href="/" className="flex items-center gap-2 mb-1">
              <span className="font-serif font-black text-2xl text-[#1a3d2f] tracking-tight">
                Hanyu
              </span>
              <div className="w-6 h-6 rounded-md bg-[#b91c1c] text-white flex items-center justify-center text-[10px] font-serif font-bold shadow-2xs">
                汉语
              </div>
            </Link>
            <span className="text-[11px] text-[#6b8271] block font-sans">
              Tiếng Trung dễ hơn với phương pháp hiện đại
            </span>
          </div>

          {/* Navigation Links (Matching Mockup 2 Menu Items) */}
          <nav className="p-3.5 space-y-1 text-[13px] font-medium">
            <button
              onClick={() => {
                setActiveTab("overview");
                setSelectedClassId(null);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer font-bold ${
                activeTab === "overview" && !selectedClassId
                  ? "bg-[#1a3d2f] text-white shadow-sm"
                  : "text-[#5c7363] hover:bg-[#eee8dc] hover:text-[#1a3d2f]"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Trang chủ</span>
            </button>

            {[
              { id: "classes", label: "Lớp học", icon: Users },
              { id: "materials", label: "Thư viện tài liệu", icon: FolderArchive, badge: materialsStats.total },
              { id: "lessons", label: "Kho bài học", icon: BookOpen },
              { id: "questions", label: "Ngân hàng câu hỏi", icon: HelpCircle },
              { id: "create-question", label: "Tự tạo câu hỏi", icon: PenTool },
              { id: "assignments", label: "Bài tập & kiểm tra", icon: FileCheck2 },
              { id: "assign-quick", label: "Giao bài", icon: Send },
              { id: "reports", label: "Kết quả học tập", icon: BarChart3 },
              { id: "notifications", label: "Thông báo", icon: Bell, badge: 3 },
              { id: "account", label: "Tài khoản", icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "assign-quick") {
                      setIsAssignModalOpen(true);
                    } else if (item.id === "create-question") {
                      setIsQuestionModalOpen(true);
                    } else {
                      setActiveTab(item.id);
                      if (item.id !== "classes") setSelectedClassId(null);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition cursor-pointer ${
                    isSelected
                      ? "bg-[#1a3d2f] text-white font-bold shadow-sm"
                      : "text-[#5c7363] hover:bg-[#eee8dc] hover:text-[#1a3d2f]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 stroke-[1.75]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Info */}
        <div className="p-4 border-t border-[#eee8dc]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-100 border border-[#bfe4ca] relative shrink-0">
                <Image
                  src="/theme/avatar-teacher.jpg"
                  alt="Cô Lan"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-xs text-[#1e2e22] block">Cô Ning Ning</span>
                <span className="text-[10px] text-[#6b8271] block">Giáo viên phụ trách</span>
              </div>
            </div>
            <Link
              href="/login"
              className="text-xs font-semibold text-red-700 hover:underline"
              title="Đăng xuất"
            >
              Thoát
            </Link>
          </div>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-[#fbf9f4]/80 backdrop-blur-md border-b border-[#e6decb] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30">
          {/* Search bar */}
          <div className="relative w-72 lg:w-96 hidden sm:block">
            <Search className="w-4 h-4 text-[#8ea394] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm lớp học, bài học, học viên..."
              className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-[#1e2e22] placeholder-[#8ea394] outline-none transition"
            />
          </div>

          {/* Right Header User Avatar */}
          <div className="flex items-center gap-4 ml-auto">
            <Link
              href="/"
              className="text-xs text-[#5c7363] hover:text-[#1a3d2f] font-semibold px-2 py-1 transition hidden sm:inline"
            >
              Về Trang chủ
            </Link>

            <button
              type="button"
              className="relative w-9 h-9 rounded-xl bg-[#f4eee4] text-[#5c7363] hover:text-[#1a3d2f] flex items-center justify-center transition border border-[#e2dac9]"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600" />
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-[#e2dac9]">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#bfe4ca] relative shrink-0">
                <Image
                  src="/theme/avatar-teacher.jpg"
                  alt="Teacher"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="leading-tight hidden sm:block">
                <span className="font-bold text-xs text-[#1e2e22] block">Cô Ning Ning</span>
                <span className="text-[10px] text-[#6b8271] block">Giáo viên</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB: OVERVIEW (Matching Mockup 2 exactly) */}
          {activeTab === "overview" && !selectedClassId && (
            <>
              {/* Greeting Banner */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#efeae0] via-[#f5f0e6] to-[#e8efe9] border border-[#e2dac9] p-7 sm:p-9 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="max-w-xl z-10">
                  <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#1a3d2f] tracking-tight mb-2">
                    Xin chào, cô Ning Ning 🍃
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5c7363] leading-relaxed">
                    Hôm nay là một ngày tuyệt vời để truyền cảm hứng học tập.
                  </p>
                </div>

                <div className="relative w-64 h-28 rounded-2xl overflow-hidden border border-white/60 shadow-sm hidden md:block shrink-0">
                  <Image
                    src="/theme/bg-tea-study.jpg"
                    alt="Classical scholar study desk"
                    fill
                    className="object-cover object-center filter saturate-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a3d2f]/20 to-transparent" />
                </div>
              </div>

              {/* Row 1: 4 Key Metric Cards (Matching Mockup 2) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Stat 1 */}
                <div
                  onClick={() => setActiveTab("classes")}
                  className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs hover:border-[#1a3d2f] transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#eaf4ed] text-[#1a3d2f] flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64796a] font-medium block">Lớp đang quản lý</span>
                      <div className="text-2xl font-black text-[#1a3d2f] leading-none mt-1">
                        {classesList.length || 5} <span className="text-xs font-normal text-[#64796a]">lớp</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8ea394]" />
                </div>

                {/* Stat 2 */}
                <div
                  onClick={() => setActiveTab("students")}
                  className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs hover:border-[#1a3d2f] transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#eaf4ed] text-[#1a3d2f] flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64796a] font-medium block">Số học viên</span>
                      <div className="text-2xl font-black text-[#1a3d2f] leading-none mt-1">
                        {overviewData?.summary?.totalStudents || 68} <span className="text-xs font-normal text-[#64796a]">học viên</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8ea394]" />
                </div>

                {/* Stat 3 */}
                <div
                  onClick={() => setActiveTab("assignments")}
                  className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs hover:border-[#1a3d2f] transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#f5ede4] text-[#854d0e] flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64796a] font-medium block">Bài tập chờ nộp</span>
                      <div className="text-2xl font-black text-[#1a3d2f] leading-none mt-1">
                        {assignmentsList.length || 12} <span className="text-xs font-normal text-[#64796a]">bài</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8ea394]" />
                </div>

                {/* Stat 4 */}
                <div className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-11 h-11 flex items-center justify-center shrink-0 font-bold text-xs text-[#1a3d2f]">
                      <span className="text-sm font-black">85%</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64796a] font-medium block">Tỷ lệ hoàn thành</span>
                      <div className="text-xs font-bold text-[#1a3d2f] mt-1">
                        Cao hơn 12% <span className="font-normal text-[10px] text-[#64796a]">so với tuần trước</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8ea394]" />
                </div>
              </div>

              {/* Row 2: 3 Main Action Cards (Matching Mockup 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div
                  onClick={() => setIsLessonModalOpen(true)}
                  className="p-6 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] hover:border-[#1a3d2f] hover:shadow-md transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#eaf4ed] text-[#1a3d2f] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1a3d2f] mb-1">Tạo bài học</h3>
                      <p className="text-xs text-[#64796a] leading-relaxed">
                        Thiết kế bài học theo chủ đề, thêm nội dung, hình ảnh, bài tập.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8ea394] group-hover:text-[#1a3d2f] transition shrink-0 ml-2" />
                </div>

                <div
                  onClick={() => setIsQuestionModalOpen(true)}
                  className="p-6 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] hover:border-[#1a3d2f] hover:shadow-md transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#f5ede4] text-[#854d0e] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <PenTool className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1a3d2f] mb-1">Tự tạo câu hỏi</h3>
                      <p className="text-xs text-[#64796a] leading-relaxed">
                        Soạn câu hỏi theo nhu cầu, đa dạng dạng bài và mức độ.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8ea394] group-hover:text-[#854d0e] transition shrink-0 ml-2" />
                </div>

                <div
                  onClick={() => setIsAssignModalOpen(true)}
                  className="p-6 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] hover:border-[#1a3d2f] hover:shadow-md transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#eaf4ed] text-[#1a3d2f] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileCheck2 className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1a3d2f] mb-1">Giao bài kiểm tra</h3>
                      <p className="text-xs text-[#64796a] leading-relaxed">
                        Giao bài tập, kiểm tra cho lớp một cách nhanh chóng.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8ea394] group-hover:text-[#1a3d2f] transition shrink-0 ml-2" />
                </div>
              </div>

              {/* Row 3: 4-Step Pedagogical Workflow Tracker */}
              <div className="bg-[#fcfaf7] rounded-3xl p-6 border border-[#e6decb] shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      num: 1,
                      title: "Tạo nội dung giảng dạy",
                      desc: "Tạo bài học với văn bản, hình ảnh, âm thanh, bài tập và sắp xếp theo chủ đề.",
                    },
                    {
                      num: 2,
                      title: "Soạn câu hỏi riêng",
                      desc: "Tự tạo câu hỏi theo mục tiêu giảng dạy, chọn dạng bài và mức độ phù hợp.",
                    },
                    {
                      num: 3,
                      title: "Giao bài cho lớp",
                      desc: "Chọn lớp, thiết lập thời hạn, giao bài tập hoặc bài kiểm tra chỉ với vài thao tác.",
                    },
                    {
                      num: 4,
                      title: "Theo dõi kết quả",
                      desc: "Xem thống kê, chi tiết làm bài và tiến độ học tập của từng học viên.",
                    },
                  ].map((st) => (
                    <div key={st.num} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#1a3d2f] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {st.num}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#1e2e22] mb-1">{st.title}</h4>
                        <p className="text-[11px] text-[#64796a] leading-relaxed">{st.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: Bài tập gần đây & Tiến độ học tập của học viên */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Bài tập gần đây */}
                <div className="lg:col-span-7 bg-[#fcfaf7] rounded-3xl p-6 border border-[#e6decb] shadow-xs">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#eee8dc]">
                    <h3 className="font-bold text-sm text-[#1a3d2f]">Bài tập gần đây</h3>
                    <button
                      onClick={() => setActiveTab("assignments")}
                      className="text-xs text-[#64796a] hover:text-[#1a3d2f] font-semibold flex items-center gap-1"
                    >
                      <span>Xem tất cả</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8f5ee] text-[#64796a] font-bold text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3 rounded-l-xl">Tên bài tập</th>
                          <th className="py-2.5 px-3">Lớp</th>
                          <th className="py-2.5 px-3">Hạn nộp</th>
                          <th className="py-2.5 px-3">Đã nộp</th>
                          <th className="py-2.5 px-3 rounded-r-xl">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eee8dc]">
                        {[
                          { title: "Bài tập từ vựng HSK 3", cls: "Lớp B1", due: "2026-10-25", submitted: "28/32", status: "Đang diễn ra", isLive: true },
                          { title: "Kiểm tra ngữ pháp (Bài 5)", cls: "Lớp A2", due: "2026-10-22", submitted: "30/30", status: "Đã đóng", isLive: false },
                          { title: "Luyện đọc hiểu", cls: "Lớp B2", due: "2026-10-20", submitted: "24/28", status: "Đang diễn ra", isLive: true },
                          { title: "Bài tập nghe HSK 4", cls: "Lớp C1", due: "2026-10-18", submitted: "22/25", status: "Đã đóng", isLive: false },
                          { title: "Viết đoạn văn", cls: "Lớp A1", due: "2026-10-15", submitted: "18/20", status: "Đã đóng", isLive: false },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#f8f5ee]/50 transition">
                            <td className="py-3 px-3 font-semibold text-[#1e2e22]">{row.title}</td>
                            <td className="py-3 px-3 text-[#64796a]">{row.cls}</td>
                            <td className="py-3 px-3 text-[#64796a] font-mono">{row.due}</td>
                            <td className="py-3 px-3 font-mono font-medium text-[#1a3d2f]">{row.submitted}</td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  row.isLive
                                    ? "bg-[#eaf4ed] text-[#1a3d2f]"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Tiến độ học tập của học viên */}
                <div className="lg:col-span-5 bg-[#fcfaf7] rounded-3xl p-6 border border-[#e6decb] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#eee8dc]">
                      <h3 className="font-bold text-sm text-[#1a3d2f]">Tiến độ học tập của học viên</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#64796a] bg-[#f4eee4] px-2 py-0.5 rounded border border-[#e2dac9]">
                          Lớp B1
                        </span>
                        <span className="text-[10px] text-[#64796a] bg-[#f4eee4] px-2 py-0.5 rounded border border-[#e2dac9]">
                          30 ngày qua
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-[#5c7363] mb-2 flex items-center justify-between">
                      <span>Tỷ lệ hoàn thành bài tập (%)</span>
                      <span className="text-sm font-black text-[#1a3d2f]">85%</span>
                    </div>

                    {/* Stylized Bar Chart */}
                    <div className="h-28 flex items-end gap-1.5 pt-2 pb-2 border-b border-[#eee8dc]">
                      {[40, 50, 65, 80, 55, 70, 85, 75, 90, 85, 60, 78, 85, 92].map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                          <div
                            style={{ height: `${val}%` }}
                            className={`w-full rounded-t-sm transition-all duration-300 ${
                              i === 12 ? "bg-[#1a3d2f] shadow-sm" : "bg-[#8ea394]/60 group-hover:bg-[#1a3d2f]"
                            }`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Bottom 4 Indicators */}
                    <div className="grid grid-cols-4 gap-2 pt-4 text-center">
                      <div>
                        <div className="text-sm font-black text-[#1a3d2f]">68</div>
                        <div className="text-[10px] text-[#64796a]">Tổng học viên</div>
                      </div>
                      <div>
                        <div className="text-sm font-black text-emerald-700">58</div>
                        <div className="text-[10px] text-[#64796a]">Hoàn thành</div>
                      </div>
                      <div>
                        <div className="text-sm font-black text-orange-600">7</div>
                        <div className="text-[10px] text-[#64796a]">Đang làm</div>
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-500">3</div>
                        <div className="text-[10px] text-[#64796a]">Chưa bắt đầu</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB: LỚP HỌC (HIERARCHICAL CLASS WORKSPACE) */}
          {activeTab === "classes" && (
            <div>
              {!selectedClassId ? (
                <div className="bg-[#fcfaf7] rounded-3xl p-6 lg:p-8 border border-[#e6decb] shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#eee8dc]">
                    <div>
                      <h3 className="text-xl font-bold text-[#1a3d2f]">Danh sách Lớp học phụ trách</h3>
                      <p className="text-xs text-[#64796a] mt-0.5">Chọn một lớp học để cấp tài khoản học sinh, giao bài tập hoặc thêm tài liệu</p>
                    </div>

                    <button
                      onClick={() => setIsCreateClassModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#132e23] transition shadow-md shadow-emerald-950/15 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tạo lớp học mới</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classesList.map((cls) => (
                      <div
                        key={cls.id}
                        className="p-6 rounded-3xl bg-[#f8f5ee] border border-[#e2dac9] hover:border-[#1a3d2f] hover:shadow-md transition duration-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-3 py-1 rounded-full bg-[#eaf4ed] text-[#1a3d2f] font-bold text-xs font-mono">
                              HSK {cls.level}
                            </span>
                            <span className="text-xs text-[#64796a] font-medium">Đang hoạt động</span>
                          </div>

                          <h4 className="text-xl font-bold text-[#1e2e22] mb-1.5">{cls.name}</h4>
                          <p className="text-xs text-[#64796a] mb-6 line-clamp-2">
                            {cls.description || "Lớp tiếng Trung HSK chuẩn cô Ning Ning trực tiếp giảng dạy"}
                          </p>
                        </div>

                        <div>
                          <div className="pt-4 border-t border-[#e2dac9] flex items-center justify-between text-xs font-medium text-[#475569] mb-4">
                            <span>👥 {cls.totalStudents} học sinh</span>
                            <span>📝 {cls.totalAssignments} bài tập</span>
                          </div>

                          <button
                            onClick={() => handleOpenClass(cls.id)}
                            className="w-full py-2.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#132e23] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <span>Vào quản lý lớp</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Breadcrumb */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleBackToClassesList}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#5c7363] hover:text-[#1a3d2f] transition px-3 py-1.5 rounded-xl bg-[#fcfaf7] border border-[#e2dac9] shadow-2xs"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Về danh sách lớp</span>
                    </button>

                    <div className="flex items-center gap-2 text-xs text-[#64796a]">
                      <span>Quản lý lớp</span>
                      <span>/</span>
                      <strong className="text-[#1a3d2f]">{selectedClassData?.name || "Đang tải..."}</strong>
                    </div>
                  </div>

                  {/* Class Workspace Card */}
                  <div className="bg-[#fcfaf7] rounded-3xl p-6 lg:p-8 border border-[#e6decb] shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#eee8dc]">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span className="px-3 py-1 rounded-full bg-[#eaf4ed] text-[#1a3d2f] font-bold text-xs font-mono">
                            HSK {selectedClassData?.level}
                          </span>
                          <h2 className="text-2xl font-black text-[#1a3d2f]">{selectedClassData?.name}</h2>
                        </div>
                        <p className="text-xs text-[#64796a]">
                          {selectedClassData?.description || "Lớp tiếng Trung HSK chuẩn cô Ning Ning trực tiếp giảng dạy"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => {
                            setJustCreatedStudent(null);
                            setIsAddStudentModalOpen(true);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#132e23] transition shadow-md shadow-emerald-950/15 flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>+ Cấp tài khoản học sinh</span>
                        </button>

                        <button
                          onClick={() => {
                            setNewAssignClassId(selectedClassId);
                            setIsAssignModalOpen(true);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#f4eee4] border border-[#bedac5] text-[#1a3d2f] text-xs font-bold hover:bg-white transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Giao bài cho lớp này</span>
                        </button>
                      </div>
                    </div>

                    {/* Recently Created Student Credential Notification */}
                    {justCreatedStudent && (
                      <div className="my-6 p-4 rounded-2xl bg-[#eaf4ed] border border-[#a7f3d0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

                    {/* Subtabs */}
                    <div className="flex items-center gap-2 pt-6 mb-6 border-b border-[#eee8dc]">
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
                                ? "border-[#1a3d2f] text-[#1a3d2f]"
                                : "border-transparent text-[#64796a] hover:text-[#1e2e22]"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* SUBTAB 1: STUDENTS */}
                    {classSubTab === "students" && (
                      <div className="space-y-4">
                        {selectedClassData?.students?.length === 0 ? (
                          <div className="text-center py-12 bg-[#f8f5ee] rounded-2xl border border-dashed border-[#dce8e0]">
                            <div className="text-4xl mb-2">👤</div>
                            <h4 className="text-sm font-bold text-[#1e2e22] mb-1">Chưa có học sinh nào trong lớp này</h4>
                            <p className="text-xs text-[#64796a] mb-4">Cô Ning Ning hãy bấm nút dưới đây để tạo và cấp tài khoản cho học sinh</p>
                            <button
                              onClick={() => setIsAddStudentModalOpen(true)}
                              className="px-5 py-2.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#132e23] transition shadow-sm inline-flex items-center gap-1.5"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span>Cấp tài khoản học sinh đầu tiên</span>
                            </button>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#f8f5ee] text-[#64796a] font-bold text-[11px] border-b border-[#eee8dc]">
                                <tr>
                                  <th className="py-3 px-4">Họ và tên</th>
                                  <th className="py-3 px-4">Tên đăng nhập</th>
                                  <th className="py-3 px-4">Điểm tích lũy</th>
                                  <th className="py-3 px-4">Chuỗi học</th>
                                  <th className="py-3 px-4">Lỗi sai cần kèm</th>
                                  <th className="py-3 px-4 text-right">Thao tác</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#eee8dc]">
                                {selectedClassData?.students?.map((s: any) => (
                                  <tr key={s.id} className="hover:bg-[#f8f5ee]/50 transition">
                                    <td className="py-3 px-4 font-bold text-[#1e2e22] flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-full bg-[#1a3d2f] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                        {s.name.charAt(0)}
                                      </div>
                                      <span>{s.name}</span>
                                    </td>
                                    <td className="py-3 px-4 font-mono font-medium text-[#5c7363]">{s.username}</td>
                                    <td className="py-3 px-4">
                                      <span className="font-bold text-[#1a3d2f] bg-[#eaf4ed] px-2 py-0.5 rounded">
                                        {s.totalXp} XP
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-orange-600 font-semibold">🔥 {s.streakDays} ngày</td>
                                    <td className="py-3 px-4">
                                      {s.wrongCount > 0 ? (
                                        <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-bold">
                                          {s.wrongCount} câu
                                        </span>
                                      ) : (
                                        <span className="text-emerald-700 font-medium">0 câu</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <button
                                        onClick={() => handleCopyCredentials(s)}
                                        className="text-[#1a3d2f] font-bold hover:underline inline-flex items-center gap-1"
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

                    {/* SUBTAB 2: ASSIGNMENTS */}
                    {classSubTab === "assignments" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2">
                          <span className="text-xs text-[#64796a]">Bài tập đã giao riêng cho lớp này</span>
                          <button
                            onClick={() => {
                              setNewAssignClassId(selectedClassId);
                              setIsAssignModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#132e23] transition shadow-xs flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Giao bài mới</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {selectedClassData?.assignments?.map((a: any) => (
                            <div key={a.id} className="p-4 rounded-xl border border-[#e2dac9] bg-[#f8f5ee] flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-sm text-[#1e2e22]">{a.title}</h4>
                                <span className="text-xs text-[#64796a]">Thời lượng: {a.durationMin} phút · Hạn nộp: {new Date(a.dueAt).toLocaleDateString("vi-VN")}</span>
                              </div>
                              <span className="text-xs font-bold text-[#1a3d2f] bg-[#eaf4ed] px-3 py-1 rounded-lg">
                                {a.submittedCount} em đã nộp bài
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SUBTAB 3: MATERIALS (TỪ VỰNG, NGỮ PHÁP, SLIDE, SÁCH GIÁO KHOA) */}
                    {classSubTab === "materials" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-2 border-b border-[#e2dac9]">
                          <div>
                            <span className="font-bold text-xs text-[#1a3d2f] block">Tài liệu học tập của lớp {selectedClassData?.name}</span>
                            <span className="text-[11px] text-[#64796a]">Bao gồm Từ vựng, Ngữ pháp, Slide bài giảng và Sách giáo khoa HSK {selectedClassData?.level}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setNewMatClassId(selectedClassId || "");
                              setNewMatHsk(selectedClassData?.level || 1);
                              setIsUploadMatModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#132e23] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>+ Tải lên tài liệu cho lớp này</span>
                          </button>
                        </div>

                        {/* Uploaded Materials for this class / level */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {materialsList
                            .filter((m) => m.classId === selectedClassId || (!m.classId && m.hskLevel === selectedClassData?.level))
                            .map((m) => {
                              const typeConfig = {
                                VOCABULARY: { label: "Từ vựng", icon: FileSpreadsheet, badge: "bg-[#e2ebe4] text-[#3d7b56] border-[#a4c5ae]" },
                                GRAMMAR: { label: "Ngữ pháp", icon: FileText, badge: "bg-[#fef3c7] text-[#b45309] border-[#fde68a]" },
                                SLIDE: { label: "Slide bài giảng", icon: Presentation, badge: "bg-[#ffedd5] text-[#c2410c] border-[#fed7aa]" },
                                TEXTBOOK: { label: "Sách giáo khoa", icon: BookOpen, badge: "bg-[#dbeafe] text-[#1d4ed8] border-[#bfdbfe]" },
                                AUDIO: { label: "File Audio", icon: Music, badge: "bg-[#f3e8ff] text-[#7e22ce] border-[#e9d5ff]" },
                                OTHER: { label: "Tài liệu", icon: File, badge: "bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]" },
                              }[m.type as string] || { label: "Tài liệu", icon: File, badge: "bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]" };
                              const TypeIcon = typeConfig.icon;

                              return (
                                <div key={m.id} className="p-4 rounded-2xl bg-[#fcfaf7] border border-[#e6decb] flex items-center justify-between hover:border-[#1a3d2f] transition shadow-xs">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#f0eee6] flex items-center justify-center text-[#1a3d2f] shrink-0 border border-[#d8ceb9]">
                                      <TypeIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${typeConfig.badge}`}>
                                          {typeConfig.label}
                                        </span>
                                        <span className="text-[10px] text-[#8c9a8f]">{m.fileSize}</span>
                                      </div>
                                      <h4 className="font-bold text-xs text-[#1e2e22] line-clamp-1">{m.title}</h4>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => alert(`Tải xuống: ${m.fileName} (${m.fileSize})`)}
                                      className="p-1.5 rounded-lg bg-[#1a3d2f] text-white hover:bg-[#122b21] transition shadow-xs"
                                      title="Tải về"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMaterial(m.id)}
                                      className="p-1.5 rounded-lg bg-[#fef2f2] text-[#991b1b] hover:bg-[#fee2e2] transition border border-[#fecaca]"
                                      title="Xóa"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>

                        {/* Lessons breakdown */}
                        <div className="pt-4 border-t border-[#e2dac9]">
                          <span className="text-xs font-bold text-[#64796a] uppercase tracking-wider block mb-3">
                            Bài học giáo trình chuẩn (HSK {selectedClassData?.level})
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedClassData?.lessons?.map((l: any) => (
                              <div key={l.id} className="p-4 rounded-2xl bg-[#f8f5ee] border border-[#e2dac9] flex items-center justify-between">
                                <div>
                                  <span className="text-[11px] font-bold text-[#1a3d2f] bg-white px-2 py-0.5 rounded border border-[#dae6dc]">
                                    Bài {l.lessonNumber}
                                  </span>
                                  <h4 className="font-bold text-sm text-[#1e2e22] mt-1">{l.title}</h4>
                                  <span className="text-xs text-[#64796a]">{l.vocabCount} từ vựng · {l.grammarCount} ngữ pháp</span>
                                </div>
                                <Link
                                  href="/s/review"
                                  className="px-3 py-1.5 rounded-lg bg-white border border-[#bedac5] text-[#1a3d2f] font-bold text-xs hover:bg-[#eaf4ed] transition"
                                >
                                  Xem trước
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB: THƯ VIỆN TÀI LIỆU (TỪ VỰNG, NGỮ PHÁP, SLIDE, SÁCH GIÁO KHOA, AUDIO) ===================== */}
          {activeTab === "materials" && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#991b1b] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md shrink-0">
                    库
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#f0eee6] border border-[#d8ceb9] text-[11px] font-bold text-[#1a3d2f] mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#3d7b56]" />
                      <span>HỆ THỐNG KHO HỌC LIỆU SỐ HSK 3.0</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1a3d2f] font-serif">
                      Kho Thư Viện Tài Liệu Học Tập
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5c7363] mt-0.5">
                      Tải lên, quản lý và phân loại tài liệu Từ vựng, Ngữ pháp, Slide bài giảng, Sách giáo khoa & File nghe Audio.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsUploadMatModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>+ Tải lên tài liệu mới</span>
                </button>
              </div>

              {/* 6 Category Filter Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { id: "ALL", label: "Tất cả", count: materialsStats.total, icon: Layers, color: "text-[#1a3d2f]" },
                  { id: "VOCABULARY", label: "Từ vựng", count: materialsStats.vocabulary, icon: FileSpreadsheet, color: "text-[#3d7b56]" },
                  { id: "GRAMMAR", label: "Ngữ pháp", count: materialsStats.grammar, icon: FileText, color: "text-[#b45309]" },
                  { id: "SLIDE", label: "Slide bài giảng", count: materialsStats.slide, icon: Presentation, color: "text-[#c2410c]" },
                  { id: "TEXTBOOK", label: "Sách giáo khoa", count: materialsStats.textbook, icon: BookOpen, color: "text-[#1d4ed8]" },
                  { id: "AUDIO", label: "File Audio", count: materialsStats.audio, icon: Music, color: "text-[#7e22ce]" },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedMatType === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedMatType(cat.id)}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#1a3d2f] text-white border-[#1a3d2f] shadow-xs"
                          : "bg-[#fcfaf7] border-[#e6decb] text-[#5c7363] hover:border-[#1a3d2f] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-white" : cat.color}`} />
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-white/20 text-white" : "bg-[#f0eee6] text-[#1a3d2f]"}`}>
                          {cat.count}
                        </span>
                      </div>
                      <span className="text-xs font-bold truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search & HSK Level Filter Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#fcfaf7] border border-[#e6decb]">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#8c9a8f] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={matSearch}
                    onChange={(e) => setMatSearch(e.target.value)}
                    placeholder="Tìm theo tên tài liệu, ghi chú, định dạng file..."
                    className="w-full bg-[#f7f4ee] border border-[#e6decb] focus:border-[#1a3d2f] focus:bg-white rounded-xl pl-9 pr-4 py-2 text-xs text-[#1a3d2f] placeholder-[#8c9a8f] outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-[#64796a] font-medium shrink-0">Lọc HSK:</span>
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {["ALL", "1", "2", "3", "4", "5", "6"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSelectedMatHsk(lvl)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          selectedMatHsk === lvl
                            ? "bg-[#1a3d2f] text-white shadow-xs"
                            : "bg-[#f0eee6] text-[#5c7363] hover:bg-[#e4ded0]"
                        }`}
                      >
                        {lvl === "ALL" ? "Tất cả" : `HSK ${lvl}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Materials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {materialsList.length === 0 ? (
                  <div className="col-span-full text-center py-12 rounded-3xl bg-[#fcfaf7] border border-[#e6decb]">
                    <FolderArchive className="w-12 h-12 text-[#8c9a8f] mx-auto mb-3 stroke-[1.5]" />
                    <h3 className="text-base font-bold text-[#1a3d2f]">Chưa có tài liệu phù hợp</h3>
                    <p className="text-xs text-[#64796a] mt-1 mb-4">
                      Bạn có thể bấm tải lên tài liệu mới để bổ sung Từ vựng, Ngữ pháp, Slide hoặc Sách giáo khoa.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsUploadMatModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition shadow-xs"
                    >
                      + Tải lên ngay
                    </button>
                  </div>
                ) : (
                  materialsList.map((m) => {
                    const typeConfig = {
                      VOCABULARY: { label: "Từ vựng", icon: FileSpreadsheet, badge: "bg-[#e2ebe4] text-[#3d7b56] border-[#a4c5ae]" },
                      GRAMMAR: { label: "Ngữ pháp", icon: FileText, badge: "bg-[#fef3c7] text-[#b45309] border-[#fde68a]" },
                      SLIDE: { label: "Slide bài giảng", icon: Presentation, badge: "bg-[#ffedd5] text-[#c2410c] border-[#fed7aa]" },
                      TEXTBOOK: { label: "Sách giáo khoa", icon: BookOpen, badge: "bg-[#dbeafe] text-[#1d4ed8] border-[#bfdbfe]" },
                      AUDIO: { label: "File Audio", icon: Music, badge: "bg-[#f3e8ff] text-[#7e22ce] border-[#e9d5ff]" },
                      OTHER: { label: "Tài liệu", icon: File, badge: "bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]" },
                    }[m.type as string] || { label: "Tài liệu", icon: File, badge: "bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]" };

                    const TypeIcon = typeConfig.icon;

                    return (
                      <div
                        key={m.id}
                        className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs hover:border-[#1a3d2f] hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeConfig.badge}`}>
                              <TypeIcon className="w-3 h-3" />
                              <span>{typeConfig.label}</span>
                            </span>

                            <span className="text-[11px] font-bold text-[#1a3d2f] bg-[#f0eee6] border border-[#d8ceb9] px-2 py-0.5 rounded-md">
                              HSK {m.hskLevel}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="font-bold text-sm text-[#1a3d2f] mb-1.5 leading-snug line-clamp-2 font-serif group-hover:text-[#3d7b56] transition-colors">
                            {m.title}
                          </h4>

                          {/* Description */}
                          {m.description && (
                            <p className="text-xs text-[#64796a] line-clamp-2 mb-3 leading-relaxed">
                              {m.description}
                            </p>
                          )}

                          {/* File info */}
                          <div className="p-2.5 rounded-xl bg-[#f7f4ee] border border-[#e6decb] flex items-center justify-between text-[11px] text-[#5c7363] mb-4">
                            <span className="truncate max-w-[150px] font-mono">{m.fileName}</span>
                            <span className="font-bold text-[#1a3d2f]">{m.fileSize}</span>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-3 border-t border-[#e6decb] flex items-center justify-between">
                          <span className="text-[10px] text-[#8c9a8f]">
                            Bởi {m.uploadedBy}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Tải xuống tệp: ${m.fileName} (${m.fileSize})`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition shadow-xs flex items-center gap-1 cursor-pointer"
                              title="Tải về"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Tải về</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMaterial(m.id)}
                              className="w-8 h-8 rounded-xl bg-[#fef2f2] text-[#991b1b] hover:bg-[#fee2e2] transition flex items-center justify-center cursor-pointer border border-[#fecaca]"
                              title="Xóa tài liệu này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB: KHO BÀI HỌC */}
          {activeTab === "lessons" && (
            <div className="bg-[#fcfaf7] rounded-3xl p-6 lg:p-8 border border-[#e6decb] shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#eee8dc]">
                <div>
                  <h3 className="text-xl font-bold text-[#1a3d2f]">Kho bài học giáo trình</h3>
                  <p className="text-xs text-[#64796a]">Toàn bộ bài giảng, từ vựng và ngữ pháp đã được số hóa</p>
                </div>
                <button
                  onClick={() => setIsLessonModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo bài học mới</span>
                </button>
              </div>

              <div className="space-y-3">
                {lessonsList.map((l) => (
                  <div key={l.id} className="p-4 rounded-2xl border border-[#e2dac9] bg-[#f8f5ee] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#1a3d2f] bg-[#eaf4ed] px-2 py-0.5 rounded mr-2">
                        HSK {l.hskLevel}
                      </span>
                      <strong className="text-sm font-bold text-[#1e2e22]">{l.title}</strong>
                    </div>
                    <span className="text-xs text-[#64796a]">{l.vocabCount || 5} từ vựng · {l.grammarCount || 1} ngữ pháp</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: NGÂN HÀNG CÂU HỎI */}
          {(activeTab === "questions" || activeTab === "create-question") && (
            <div className="bg-[#fcfaf7] rounded-3xl p-6 lg:p-8 border border-[#e6decb] shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#eee8dc]">
                <div>
                  <h3 className="text-xl font-bold text-[#1a3d2f]">Ngân hàng câu hỏi HSK 3.0</h3>
                  <p className="text-xs text-[#64796a]">Kho câu hỏi trắc nghiệm, pinyin và phản xạ từ vựng</p>
                </div>
                <button
                  onClick={() => setIsQuestionModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tự tạo câu hỏi</span>
                </button>
              </div>

              <div className="space-y-3">
                {questionsList.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-2xl border border-[#e2dac9] bg-[#f8f5ee] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1a3d2f] bg-white px-2 py-0.5 rounded border border-[#dae6dc]">
                        Câu {idx + 1} · {q.skill}
                      </span>
                      <span className="font-mono font-bold text-[#1a3d2f]">Đáp án: {q.correctAnswer}</span>
                    </div>
                    <p className="text-sm font-bold text-[#1e2e22]">{q.content}</p>
                    {q.explanation && (
                      <p className="text-xs text-[#065f46] bg-[#eaf4ed] p-2 rounded-xl">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BÀI TẬP & KIỂM TRA */}
          {activeTab === "assignments" && (
            <div className="bg-[#fcfaf7] rounded-3xl p-6 lg:p-8 border border-[#e6decb] shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#eee8dc]">
                <div>
                  <h3 className="text-xl font-bold text-[#1a3d2f]">Bài tập & Kiểm tra đã giao</h3>
                  <p className="text-xs text-[#64796a]">Theo dõi hạn nộp và tỷ lệ làm bài của học sinh</p>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Giao bài tập mới</span>
                </button>
              </div>

              <div className="space-y-3">
                {assignmentsList.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl border border-[#e2dac9] bg-[#f8f5ee] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#1e2e22]">{a.title}</h4>
                      <p className="text-xs text-[#64796a]">Lớp: <strong>{a.className}</strong> · Hạn: {new Date(a.dueAt).toLocaleDateString("vi-VN")}</p>
                    </div>
                    <span className="text-xs font-bold text-[#1a3d2f] bg-[#eaf4ed] px-3 py-1 rounded-lg">
                      {a.submittedCount || 1} em đã nộp bài
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: KẾT QUẢ HỌC TẬP (REPORTS) */}
          {activeTab === "reports" && (
            <div className="bg-[#fcfaf7] rounded-3xl p-6 lg:p-8 border border-[#e6decb] shadow-xs space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#1a3d2f]">Báo cáo & Phân tích lớp học</h3>
                <p className="text-xs text-[#64796a]">Số liệu tổng hợp giúp cô Ning Ning giảng giải đúng điểm yếu của học sinh</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#f8f5ee] border border-[#e2dac9]">
                  <h4 className="font-bold text-sm text-[#1e2e22] mb-3">Các câu hỏi học sinh làm sai nhiều</h4>
                  <div className="space-y-3">
                    {overviewData?.atRiskStudents?.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-[#e2dac9] text-xs">
                        <span className="font-bold text-[#c2410c]">{item.name} ({item.className})</span>
                        <p className="text-[#64796a] mt-0.5">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#f8f5ee] border border-[#e2dac9]">
                  <h4 className="font-bold text-sm text-[#1e2e22] mb-3">Đánh giá kỹ năng lớp HSK 1A</h4>
                  <div className="space-y-3">
                    {overviewData?.skillRadar?.map((sk: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>{sk.skill}</span>
                          <span className="text-[#1a3d2f]">{sk.score}%</span>
                        </div>
                        <div className="w-full bg-[#e2dac9] h-2 rounded-full overflow-hidden">
                          <div style={{ width: `${sk.score}%` }} className="bg-[#1a3d2f] h-full" />
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
          <div className="bg-[#fcfaf7] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e6decb]">
            <div className="flex items-center justify-between pb-4 border-b border-[#eee8dc] mb-5">
              <div>
                <h3 className="font-bold text-base text-[#1a3d2f]">Tạo Lớp học mới</h3>
                <p className="text-xs text-[#64796a]">Tạo không gian lớp học để cấp tài khoản và giao bài</p>
              </div>
              <button
                onClick={() => setIsCreateClassModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f4eee4] flex items-center justify-center text-[#5c7363] hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1a3d2f] block mb-1.5">Tên lớp học</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ví dụ: HSK 1B, HSK 2A, Lớp Cấp Tốc T3-T5..."
                  className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] rounded-xl px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1a3d2f] block mb-1.5">Cấp độ HSK 3.0</label>
                <select
                  value={newClassLevel}
                  onChange={(e) => setNewClassLevel(Number(e.target.value))}
                  className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] rounded-xl px-4 py-2.5 text-xs outline-none"
                >
                  <option value={1}>HSK 1 (Sơ cấp - 500 từ)</option>
                  <option value={2}>HSK 2 (Sơ cấp - 1.272 từ)</option>
                  <option value={3}>HSK 3 (Sơ cấp - 2.245 từ)</option>
                  <option value={4}>HSK 4 (Trung cấp - 3.245 từ)</option>
                  <option value={5}>HSK 5 (Trung cấp - 4.316 từ)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1a3d2f] block mb-1.5">Mô tả / Lịch học</label>
                <input
                  type="text"
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="Ví dụ: Lớp tối Thứ 3 và Thứ 5 hàng tuần (19h30 - 21h00)"
                  className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] rounded-xl px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateClassModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#e2dac9] text-xs font-semibold text-[#5c7363]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-semibold shadow-md"
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
          <div className="bg-[#fcfaf7] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e6decb]">
            <div className="flex items-center justify-between pb-4 border-b border-[#eee8dc] mb-5">
              <div>
                <h3 className="font-bold text-base text-[#1a3d2f]">Cấp tài khoản học sinh</h3>
                <p className="text-xs text-[#64796a]">Tạo tài khoản và ghi danh em vào lớp {selectedClassData?.name}</p>
              </div>
              <button
                onClick={() => setIsAddStudentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f4eee4] flex items-center justify-center text-[#5c7363] hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1a3d2f] block mb-1.5">Họ và tên học sinh</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => {
                    setNewStudentName(e.target.value);
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
                  className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] rounded-xl px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1a3d2f] block mb-1.5">Tên đăng nhập (Username)</label>
                <input
                  type="text"
                  required
                  value={newStudentUsername}
                  onChange={(e) => setNewStudentUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="Ví dụ: minhanh_hsk1"
                  className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] rounded-xl px-4 py-2.5 text-xs outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1a3d2f] block mb-1.5">Mật khẩu cấp cho em</label>
                <input
                  type="text"
                  required
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  placeholder="Mặc định: 123456"
                  className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] rounded-xl px-4 py-2.5 text-xs outline-none font-mono"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#e2dac9] text-xs font-semibold text-[#5c7363]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold shadow-md"
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
          <div className="bg-[#fcfaf7] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e6decb]">
            <div className="flex items-center justify-between pb-4 border-b border-[#eee8dc] mb-5">
              <h3 className="font-bold text-base text-[#1a3d2f]">Tạo bài học mới</h3>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f4eee4] flex items-center justify-center text-[#5c7363] hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1a3d2f] block mb-1.5">Tên bài học</label>
                <input
                  type="text"
                  required
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Ví dụ: Bài 6 · 点菜 (Gọi món ăn)"
                  className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] rounded-xl px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1a3d2f] block mb-1.5">Cấp độ HSK 3.0</label>
                <select
                  value={newLessonHsk}
                  onChange={(e) => setNewLessonHsk(Number(e.target.value))}
                  className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] rounded-xl px-4 py-2.5 text-xs outline-none"
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
                  className="flex-1 py-2.5 rounded-xl border border-[#e2dac9] text-xs font-semibold text-[#5c7363]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-semibold shadow-md"
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
          <div className="bg-[#fcfaf7] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e6decb]">
            <div className="flex items-center justify-between pb-4 border-b border-[#eee8dc] mb-5">
              <h3 className="font-bold text-base text-[#1a3d2f]">Giao bài tập cho học sinh</h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f4eee4] flex items-center justify-center text-[#5c7363] hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssign} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1a3d2f] block mb-1.5">Tên bài tập</label>
                <input
                  type="text"
                  required
                  value={newAssignTitle}
                  onChange={(e) => setNewAssignTitle(e.target.value)}
                  placeholder="Ví dụ: Ôn tập từ vựng & Điền chữ Hán Bài 5"
                  className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] rounded-xl px-4 py-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1a3d2f] block mb-1.5">Chọn lớp học</label>
                <select
                  value={newAssignClassId}
                  onChange={(e) => setNewAssignClassId(e.target.value)}
                  className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] rounded-xl px-4 py-2.5 text-xs outline-none"
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
                  className="flex-1 py-2.5 rounded-xl border border-[#e2dac9] text-xs font-semibold text-[#5c7363]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-semibold shadow-md"
                >
                  Giao bài ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: TẢI LÊN TÀI LIỆU THƯ VIỆN ===================== */}
      {isUploadMatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fcfaf7] border border-[#e6decb] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsUploadMatModalOpen(false)}
              className="absolute top-5 right-5 text-[#8c9a8f] hover:text-[#1a3d2f] p-1 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#1a3d2f] text-white flex items-center justify-center font-bold">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1a3d2f] font-serif">
                  Tải lên tài liệu thư viện mới
                </h3>
                <p className="text-xs text-[#5c7363]">
                  Học sinh có thể tải về ôn tập hoặc cô gắn vào từng lớp học
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateMaterial} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#1a3d2f] block mb-1">
                  Tiêu đề tài liệu <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  placeholder="Ví dụ: Giáo trình Chuẩn HSK 1 (PDF), 150 Từ vựng HSK 1, Slide Ngữ pháp câu chữ 把..."
                  className="w-full bg-[#f7f4ee] border border-[#e6decb] focus:border-[#1a3d2f] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#1a3d2f] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1a3d2f] block mb-1">
                    Phân loại tài liệu <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={newMatType}
                    onChange={(e: any) => setNewMatType(e.target.value)}
                    className="w-full bg-[#f7f4ee] border border-[#e6decb] focus:border-[#1a3d2f] focus:bg-white rounded-xl px-3 py-2 text-xs text-[#1a3d2f] outline-none"
                  >
                    <option value="VOCABULARY">📝 Từ vựng (Excel / Word)</option>
                    <option value="GRAMMAR">💡 Ngữ pháp & Cấu trúc (PDF)</option>
                    <option value="SLIDE">🖥️ Slide bài giảng (PPTX / PDF)</option>
                    <option value="TEXTBOOK">📚 Sách giáo khoa & Bài tập</option>
                    <option value="AUDIO">🎧 File Audio luyện nghe (MP3)</option>
                    <option value="OTHER">📁 Tài liệu học tập khác</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1a3d2f] block mb-1">
                    Trình độ HSK
                  </label>
                  <select
                    value={newMatHsk}
                    onChange={(e) => setNewMatHsk(Number(e.target.value))}
                    className="w-full bg-[#f7f4ee] border border-[#e6decb] focus:border-[#1a3d2f] focus:bg-white rounded-xl px-3 py-2 text-xs text-[#1a3d2f] outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        HSK {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1a3d2f] block mb-1">
                  Áp dụng cho Lớp học
                </label>
                <select
                  value={newMatClassId}
                  onChange={(e) => setNewMatClassId(e.target.value)}
                  className="w-full bg-[#f7f4ee] border border-[#e6decb] focus:border-[#1a3d2f] focus:bg-white rounded-xl px-3 py-2 text-xs text-[#1a3d2f] outline-none"
                >
                  <option value="">🌐 Chung cho toàn bộ học sinh</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (HSK {c.level})
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Dropzone simulation */}
              <div>
                <label className="font-bold text-[#1a3d2f] block mb-1">
                  Tệp đính kèm (PDF, PPTX, XLSX, DOCX, MP3)
                </label>
                <div
                  onClick={() => {
                    const simulatedName = newMatTitle
                      ? `${newMatTitle.replace(/\s+/g, "_")}.${newMatType === "SLIDE" ? "pptx" : newMatType === "VOCABULARY" ? "xlsx" : newMatType === "AUDIO" ? "mp3" : "pdf"}`
                      : "Tai_Lieu_HSK_CoNingNing.pdf";
                    setNewMatFileName(simulatedName);
                  }}
                  className="p-4 rounded-2xl border-2 border-dashed border-[#d8ceb9] bg-[#f7f4ee] hover:bg-[#ede7da] text-center cursor-pointer transition"
                >
                  <UploadCloud className="w-6 h-6 text-[#1a3d2f] mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-[#1a3d2f]">
                    {newMatFileName ? `Đã chọn tệp: ${newMatFileName}` : "Nhấp để chọn tệp hoặc kéo thả file vào đây"}
                  </p>
                  <p className="text-[11px] text-[#8c9a8f] mt-0.5">
                    Hỗ trợ file PDF, PowerPoint, Excel, Word, Audio tối đa 100MB
                  </p>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1a3d2f] block mb-1">
                  Mô tả / Hướng dẫn học cho học viên
                </label>
                <textarea
                  rows={2}
                  value={newMatDesc}
                  onChange={(e) => setNewMatDesc(e.target.value)}
                  placeholder="Ghi chú thêm về nội dung, bài tập cần làm hoặc phần trọng tâm..."
                  className="w-full bg-[#f7f4ee] border border-[#e6decb] focus:border-[#1a3d2f] focus:bg-white rounded-xl p-3 text-xs text-[#1a3d2f] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e6decb]">
                <button
                  type="button"
                  onClick={() => setIsUploadMatModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#e6decb] text-xs font-bold text-[#5c7363] hover:bg-[#ede7da] transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploadingMat}
                  className="px-5 py-2 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{uploadingMat ? "Đang lưu..." : "Lưu vào kho tài liệu"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
