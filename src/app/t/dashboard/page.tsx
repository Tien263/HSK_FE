"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Home,
  Users,
  BookOpen,
  HelpCircle,
  FileCheck2,
  BarChart3,
  Calendar,
  Settings,
  Search,
  Bell,
  Plus,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle2,
  X,
  AlertCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Clock,
  Sparkles,
  Trash2,
  Edit3,
  Filter,
  Download,
  LogOut,
  UserPlus,
  FolderArchive,
  FileText,
  Layers,
  Award,
  Flame,
  ShieldCheck,
  RefreshCw,
  Send,
  Menu,
} from "lucide-react";
import ClassesWorkspace from "@/components/teacher/ClassesWorkspace";
import { LessonLibraryWorkspace } from "@/components/teacher/LessonLibraryWorkspace";
import { AssignmentsWorkspace } from "@/components/teacher/AssignmentsWorkspace";
import QuestionBankWorkspace from "@/components/teacher/QuestionBankWorkspace";
import AppleScheduleCalendar, { ScheduleEvent } from "@/components/teacher/AppleScheduleCalendar";
import ClassReportWorkspace from "@/components/teacher/ClassReportWorkspace";
import { getClassArtwork } from "@/lib/class-helper";

// ============================================================================
// TYPES & MOCK DATA DEFINITIONS
// ============================================================================

interface ClassItem {
  id: string;
  name: string;
  track: "HSK" | "TOPIC" | "MAJOR";
  levelText: string;
  studentCount: number;
  completedLessons: number;
  totalLessons: number;
  submissionRate: number; // percentage
  status: "ACTIVE" | "ARCHIVED";
  artwork: string;
  code: string;
  description: string;
}

interface AssignmentItem {
  id: string;
  title: string;
  classId: string;
  className: string;
  submittedCount: number;
  totalStudents: number;
  dueAt: string;
  status: "ACTIVE" | "EXPIRING_SOON" | "CLOSED" | "DRAFT";
  durationMin: number;
}

interface ScheduleSession {
  id: string;
  timeRange: string;
  className: string;
  mode: "ONLINE" | "OFFLINE";
  location: string;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED";
  actionType: "JOIN" | "PREPARE";
}

interface DueAssignment {
  id: string;
  title: string;
  className: string;
  dueText: string;
  urgency: "warning" | "danger" | "normal"; // danger: <24h, warning: <48h, normal: >48h
  submittedText: string;
}

interface StudentInNeed {
  id: string;
  name: string;
  avatar: string;
  className: string;
  classId: string;
  reason: string;
  ruleType: "OVERDUE" | "GRAMMAR_MISTAKE" | "LOW_SCORE";
  detail: string;
  recommendedPractice: string;
}

interface QuestionItem {
  id: string;
  content: string;
  type: "MULTIPLE_CHOICE" | "FILL_BLANK" | "REORDER";
  hskLevel: number;
  skill: "VOCABULARY" | "GRAMMAR" | "READING" | "LISTENING";
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export default function TeacherDashboard() {
  const router = useRouter();

  // Authentication & Logged-in Teacher Profile
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    username: string;
    email?: string;
    avatar?: string;
    role: string;
  } | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Overview stats fetched dynamically from API
  const [overviewStats, setOverviewStats] = useState<{
    totalClasses: number;
    totalStudents: number;
    activeAssignments: number;
    completionRate: number;
  } | null>(null);

  // Navigation state (Spec Section 3: 8 menus)
  const [activeTab, setActiveTab] = useState<
    "overview" | "classes" | "lessons" | "assignments" | "questions" | "reports" | "schedule" | "settings"
  >("overview");
  const [targetExamToOpen, setTargetExamToOpen] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
      sessionStorage.removeItem("currentUser");
    }
    router.push("/login");
  };

  const fetchTeacherData = async (user: { id: string; name: string }) => {
    try {
      // 1. Lấy danh sách lớp của riêng giáo viên này
      const resClasses = await fetch(`/api/v1/classes?teacherId=${user.id}`, {
        headers: { "x-user-id": user.id },
      });
      if (resClasses.ok) {
        const data = await resClasses.json();
        if (data.success && Array.isArray(data.items)) {
          const loadedClasses: ClassItem[] = data.items.map((c: any, index: number) => {
            const trackType = c.track || (c.level <= 3 ? "HSK" : c.level === 4 ? "TOPIC" : "MAJOR");
            const art = getClassArtwork(trackType, c.level, index, c.name);
            return {
              id: c.id,
              name: c.name,
              track: trackType,
              levelText: `HSK ${c.level} · Quản lý bởi ${c.teacherName || user.name}`,
              studentCount: c.totalStudents || 0,
              completedLessons: 0,
              totalLessons: 10,
              submissionRate: 0,
              status: c.status === "PAUSED" ? "ACTIVE" : c.isActive ? "ACTIVE" : "ARCHIVED",
              artwork: art,
              code: c.code || c.id.slice(-6).toUpperCase(),
              description: c.description || "",
            };
          });
          setClassesList(loadedClasses);
        }
      }

      // 2. Lấy thống kê tổng quan của riêng giáo viên này
      const resReports = await fetch(`/api/v1/reports/overview?teacherId=${user.id}`, {
        headers: { "x-user-id": user.id },
      });
      if (resReports.ok) {
        const data = await resReports.json();
        if (data.success && data.data?.summary) {
          setOverviewStats({
            totalClasses: data.data.summary.totalClasses,
            totalStudents: data.data.summary.totalStudents,
            activeAssignments: data.data.summary.activeAssignments,
            completionRate: data.data.summary.completionRate,
          });
        }
      }
    } catch (err) {
      console.error("Error loading teacher dashboard data:", err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
      if (!stored) {
        router.push("/login");
        return;
      }
      try {
        const user = JSON.parse(stored);
        if (user.role !== "TEACHER" && user.role !== "ADMIN") {
          router.push("/login");
          return;
        }
        setCurrentUser(user);
        fetchTeacherData(user);
      } catch (err) {
        router.push("/login");
        return;
      } finally {
        setIsLoadingAuth(false);
      }

      const tab = new URLSearchParams(window.location.search).get("tab");
      if (tab && ["overview", "classes", "lessons", "assignments", "questions", "reports", "schedule", "settings"].includes(tab)) {
        setActiveTab(tab as any);
      }
    }
  }, [router]);

  // Global search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [questionBankCount, setQuestionBankCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hanyu_custom_question_bank");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setQuestionBankCount(parsed.length);
        } catch (e) {}
      } else {
        setQuestionBankCount(0);
      }

      const savedSchedules = localStorage.getItem("hanyu_teacher_schedules");
      if (savedSchedules) {
        try {
          const parsed = JSON.parse(savedSchedules);
          if (Array.isArray(parsed)) setDynamicSchedules(parsed);
        } catch (e) {}
      } else {
        setDynamicSchedules([]);
      }
    }
  }, [activeTab]);

  // Testing & Simulation Toggles (Unhappycase & Edgecase Verification)
  const [simulateNoSchedule, setSimulateNoSchedule] = useState(false);
  const [simulateNoStudentsInNeed, setSimulateNoStudentsInNeed] = useState(false);
  const [simulateEmptyClasses, setSimulateEmptyClasses] = useState(false);
  const [simulateEmptyAssignments, setSimulateEmptyAssignments] = useState(false);
  const [showTestToolbar, setShowTestToolbar] = useState(false);

  // Apple Schedule Calendar State
  const [dynamicSchedules, setDynamicSchedules] = useState<ScheduleEvent[]>([]);

  // Reports Filter State
  const [reportSelectedClassId, setReportSelectedClassId] = useState<string>("ALL");

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    desc: string;
    time: string;
    read: boolean;
  }>>([]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ============================================================================
  // CORE DATA STATES (Loaded dynamically according to the authenticated teacher)
  // ============================================================================

  // 1. Classes List (Scoped to the authenticated teacher)
  const [classesList, setClassesList] = useState<ClassItem[]>([]);

  // 2. Assignments List (Scoped to the authenticated teacher)
  const [assignmentsList, setAssignmentsList] = useState<AssignmentItem[]>([]);

  // 3. Schedule Sessions
  const [scheduleList, setScheduleList] = useState<ScheduleSession[]>([]);

  // 4. Due Assignments (Cột phải - Bài tập sắp đến hạn)
  const dueAssignments: DueAssignment[] = classesList.length === 0 ? [] : [];

  // 5. Students in need of pedagogical support (Spec Section 11)
  const [studentsInNeedList, setStudentsInNeedList] = useState<StudentInNeed[]>([]);

  // Sync dynamic notifications when schedules or student needs change
  useEffect(() => {
    if (dynamicSchedules.length > 0) {
      const todayStr = new Date().toISOString().split("T")[0];
      const todaySessions = dynamicSchedules.filter((s) => s.date === todayStr);

      const generatedNotifs: Array<{
        id: string;
        title: string;
        desc: string;
        time: string;
        read: boolean;
      }> = [];

      todaySessions.forEach((s, idx) => {
        generatedNotifs.push({
          id: `notif-sched-${idx}-${s.id}`,
          title: "Ca dạy hôm nay",
          desc: `${s.className} (${s.mode === "ONLINE" ? "Trực tuyến Google Meet" : "Tại phòng"}) lúc ${s.startTime}`,
          time: "Hôm nay",
          read: false,
        });
      });

      if (assignmentsList.length > 0) {
        const firstActive = assignmentsList[0];
        generatedNotifs.push({
          id: `notif-assign-${firstActive.id}`,
          title: "Học sinh nộp bài tập",
          desc: `${firstActive.submittedCount}/${firstActive.totalStudents} học sinh đã nộp bài '${firstActive.title}'`,
          time: "Gần đây",
          read: false,
        });
      }

      if (studentsInNeedList.length > 0) {
        const st = studentsInNeedList[0];
        generatedNotifs.push({
          id: `notif-student-${st.id}`,
          title: "Học sinh cần trợ giúp",
          desc: `${st.name} (${st.className}) cần bổ trợ: ${st.detail}`,
          time: "1 giờ trước",
          read: false,
        });
      }

      if (generatedNotifs.length > 0) {
        setNotifications(generatedNotifs);
      }
    }
  }, [dynamicSchedules, assignmentsList, studentsInNeedList]);

  // 6. Question Bank (Kho câu hỏi)
  const [questionsList, setQuestionsList] = useState<QuestionItem[]>([
    {
      id: "q1",
      content: "请把这封信_____经理的办公室。(Hãy mang bức thư này đến văn phòng giám đốc)",
      type: "MULTIPLE_CHOICE",
      hskLevel: 3,
      skill: "GRAMMAR",
      options: ["A. 送到", "B. 看了", "C. 听见", "D. 知道"],
      correctAnswer: "A",
      explanation: "Cấu trúc 把 + tân ngữ + động từ + 到/在: biểu thị sự di chuyển của vật.",
    },
    {
      id: "q2",
      content: "我昨天买的苹果比今天的_____。(Táo hôm qua tôi mua ngọt hơn hôm nay)",
      type: "MULTIPLE_CHOICE",
      hskLevel: 3,
      skill: "GRAMMAR",
      options: ["A. 甜", "B. 很大", "C. 非常好", "D. 不太"],
      correctAnswer: "A",
      explanation: "Trong câu so sánh chữ 比, không dùng các phó từ chỉ mức độ như 很, 非常 trước tính từ.",
    },
    {
      id: "q3",
      content: "经过双方友好协商，我们终于_____了这项重要合同。(Qua đàm phán, chúng tôi đã ký hợp đồng)",
      type: "FILL_BLANK",
      hskLevel: 4,
      skill: "VOCABULARY",
      correctAnswer: "签署 (hoặc 签)",
      explanation: "签署合同: ký kết hợp đồng thương mại.",
    },
  ]);

  // ============================================================================
  // MODALS STATE MANAGEMENT
  // ============================================================================

  // Modal 1: Create Lesson
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonTrack, setLessonTrack] = useState<"HSK" | "TOPIC" | "MAJOR">("HSK");
  const [lessonHskLevel, setLessonHskLevel] = useState(3);
  const [lessonVocabInput, setLessonVocabInput] = useState("");
  const [lessonGrammarInput, setLessonGrammarInput] = useState("");
  const [lessonErrors, setLessonErrors] = useState<Record<string, string>>({});

  // Modal 2: Create Assignment
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [transferredAssignmentPayload, setTransferredAssignmentPayload] = useState<{
    lessonTitle: string;
    classId: string;
    vocabList?: any[];
    grammarList?: any[];
    culturalList?: any[];
  } | null>(null);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignClassId, setAssignClassId] = useState("c1");
  const [assignDuration, setAssignDuration] = useState(30);
  const [assignDueDate, setAssignDueDate] = useState("2026-10-25T23:59");
  const [assignErrors, setAssignErrors] = useState<Record<string, string>>({});

  // Modal 3: Create Class
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassTrack, setNewClassTrack] = useState<"HSK" | "TOPIC" | "MAJOR">("HSK");
  const [newClassLevel, setNewClassLevel] = useState(3);
  const [newClassDesc, setNewClassDesc] = useState("");
  const [classErrors, setClassErrors] = useState<Record<string, string>>({});

  // Modal 4: Issue Student Account (Cấp tài khoản học viên)
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [targetClassForStudent, setTargetClassForStudent] = useState("c1");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentUsername, setNewStudentUsername] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("Hanyu123@");
  const [studentFormErrors, setStudentFormErrors] = useState<Record<string, string>>({});
  const [issuedStudentSuccess, setIssuedStudentSuccess] = useState<any | null>(null);

  // Modal 5: View Assignment Submissions
  const [selectedAssignmentForView, setSelectedAssignmentForView] = useState<AssignmentItem | null>(null);

  // Modal 6: Student Support Diagnostic & Tailored Homework
  const [selectedStudentForSupport, setSelectedStudentForSupport] = useState<StudentInNeed | null>(null);
  const [assignedRemedialNotice, setAssignedRemedialNotice] = useState(false);

  // Modal 7: Create Question
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [newQContent, setNewQContent] = useState("");
  const [newQType, setNewQType] = useState<"MULTIPLE_CHOICE" | "FILL_BLANK" | "REORDER">("MULTIPLE_CHOICE");
  const [newQHsk, setNewQHsk] = useState(3);
  const [newQSkill, setNewQSkill] = useState<"VOCABULARY" | "GRAMMAR" | "READING" | "LISTENING">("GRAMMAR");
  const [newQCorrect, setNewQCorrect] = useState("");
  const [newQExpl, setNewQExpl] = useState("");
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});

  // Active Class Detail Workspace (when clicked a class card)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classSubTab, setClassSubTab] = useState<"students" | "assignments" | "materials">("students");

  // ============================================================================
  // FORM HANDLERS & VALIDATIONS (HAPPY CASE & UNHAPPY CASE)
  // ============================================================================

  // 1. Submit New Lesson
  const handleSaveLesson = (isDraft: boolean) => {
    const errors: Record<string, string> = {};
    if (!lessonTitle.trim()) {
      errors.title = "Vui lòng nhập tiêu đề bài học.";
    }
    if (lessonTitle.trim().length > 0 && lessonTitle.trim().length < 5) {
      errors.title = "Tiêu đề bài học quá ngắn (tối thiểu 5 ký tự).";
    }

    if (Object.keys(errors).length > 0) {
      setLessonErrors(errors);
      return;
    }

    // Happy Case
    setLessonErrors({});
    setIsLessonModalOpen(false);
    showToast(
      isDraft
        ? `📝 Đã lưu nháp bài học: "${lessonTitle}"`
        : `🎉 Đã xuất bản bài học mới: "${lessonTitle}" cho hệ thống!`
    );
    setLessonTitle("");
    setLessonVocabInput("");
    setLessonGrammarInput("");
  };

  // 2. Submit New Assignment
  const handleSaveAssignment = () => {
    const errors: Record<string, string> = {};
    if (!assignTitle.trim()) {
      errors.title = "Vui lòng nhập tên bài tập / đề kiểm tra.";
    }
    if (!assignClassId) {
      errors.classId = "Vui lòng chọn lớp học tiếp nhận.";
    }
    if (!assignDueDate) {
      errors.dueDate = "Vui lòng thiết lập hạn nộp bài.";
    }

    if (Object.keys(errors).length > 0) {
      setAssignErrors(errors);
      return;
    }

    const targetClass = classesList.find((c) => c.id === assignClassId);
    const newAss: AssignmentItem = {
      id: `a-${Date.now()}`,
      title: assignTitle.trim(),
      classId: assignClassId,
      className: targetClass ? targetClass.name : "Lớp học",
      submittedCount: 0,
      totalStudents: targetClass ? targetClass.studentCount : 25,
      dueAt: assignDueDate.replace("T", " "),
      status: "ACTIVE",
      durationMin: Number(assignDuration) || 30,
    };

    setAssignmentsList([newAss, ...assignmentsList]);
    setAssignErrors({});
    setIsAssignModalOpen(false);
    setAssignTitle("");
    showToast(`✅ Đã giao bài tập "${newAss.title}" cho lớp ${newAss.className}!`);
  };

  // 3. Submit New Class (Strict Backend Persistence - No temporary fake state)
  const handleSaveClass = async () => {
    const errors: Record<string, string> = {};
    if (!newClassName.trim()) {
      errors.name = "Vui lòng nhập tên lớp học.";
    }
    if (classesList.some((c) => c.name.toLowerCase() === newClassName.trim().toLowerCase())) {
      errors.name = "Tên lớp này đã tồn tại trong danh sách lớp của thầy/cô.";
    }

    if (Object.keys(errors).length > 0) {
      setClassErrors(errors);
      return;
    }

    if (!currentUser?.id) {
      showToast("Vui lòng đăng nhập lại để tạo lớp học.");
      return;
    }

    try {
      const res = await fetch("/api/v1/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({
          name: newClassName.trim(),
          level: Number(newClassLevel) || 1,
          track: newClassTrack,
          description: newClassDesc.trim(),
          teacherId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`🎉 Đã tạo lớp "${newClassName.trim()}" thành công!`);
        setClassErrors({});
        setIsCreateClassModalOpen(false);
        setNewClassName("");
        setNewClassDesc("");
        await fetchTeacherData(currentUser);
      } else {
        showToast(data.message || "Lỗi tạo lớp học trên máy chủ.");
      }
    } catch (e) {
      console.error("Save class error:", e);
      showToast("Lỗi kết nối máy chủ khi tạo lớp. Vui lòng thử lại.");
    }
  };

  // 4. Issue Student Account
  const handleIssueStudent = async () => {
    const errors: Record<string, string> = {};
    if (!newStudentName.trim()) {
      errors.name = "Vui lòng nhập họ và tên học viên.";
    }
    if (!newStudentUsername.trim()) {
      errors.username = "Vui lòng nhập tên đăng nhập (username).";
    } else if (/\s/.test(newStudentUsername.trim())) {
      errors.username = "Tên đăng nhập không được chứa khoảng trắng.";
    }
    if (!newStudentPassword || newStudentPassword.length < 6) {
      errors.password = "Mật khẩu tối thiểu 6 ký tự.";
    }

    if (Object.keys(errors).length > 0) {
      setStudentFormErrors(errors);
      return;
    }

    try {
      if (currentUser?.id && targetClassForStudent) {
        const res = await fetch(`/api/v1/classes/${targetClassForStudent}/students`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser.id,
          },
          body: JSON.stringify({
            name: newStudentName.trim(),
            username: newStudentUsername.trim().toLowerCase(),
            password: newStudentPassword,
          }),
        });
        const data = await res.json();
        if (data.success) {
          const targetClass = classesList.find((c) => c.id === targetClassForStudent);
          const issued = {
            name: newStudentName.trim(),
            username: newStudentUsername.trim().toLowerCase(),
            password: newStudentPassword,
            className: targetClass?.name || "Lớp học",
            classCode: targetClass?.code || targetClassForStudent.slice(-6).toUpperCase(),
            createdAt: new Date().toLocaleDateString("vi-VN"),
          };
          setStudentFormErrors({});
          setIssuedStudentSuccess(issued);
          setNewStudentName("");
          setNewStudentUsername("");
          showToast(`Cấp tài khoản cho học viên ${issued.name} thành công!`);
          fetchTeacherData(currentUser);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    const targetClass = classesList.find((c) => c.id === targetClassForStudent);
    const issued = {
      name: newStudentName.trim(),
      username: newStudentUsername.trim().toLowerCase(),
      password: newStudentPassword,
      className: targetClass?.name || "Lớp HSK",
      classCode: targetClass?.code || "HSK3-2026",
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };

    // Increase student count in that class
    setClassesList((prev) =>
      prev.map((c) => (c.id === targetClassForStudent ? { ...c, studentCount: c.studentCount + 1 } : c))
    );

    setStudentFormErrors({});
    setIssuedStudentSuccess(issued);
    setNewStudentName("");
    setNewStudentUsername("");
    showToast(`✅ Cấp tài khoản cho học viên ${issued.name} thành công!`);
  };

  // 5. Submit New Question
  const handleSaveQuestion = () => {
    const errors: Record<string, string> = {};
    if (!newQContent.trim()) {
      errors.content = "Nội dung câu hỏi không được để trống.";
    }
    if (!newQCorrect.trim()) {
      errors.correct = "Vui lòng chỉ định đáp án chính xác.";
    }

    if (Object.keys(errors).length > 0) {
      setQuestionErrors(errors);
      return;
    }

    const qItem: QuestionItem = {
      id: `q-${Date.now()}`,
      content: newQContent.trim(),
      type: newQType,
      hskLevel: newQHsk,
      skill: newQSkill,
      correctAnswer: newQCorrect.trim(),
      explanation: newQExpl.trim() || "Chưa có lời giải thích chi tiết.",
    };

    setQuestionsList([qItem, ...questionsList]);
    setQuestionErrors({});
    setIsQuestionModalOpen(false);
    setNewQContent("");
    setNewQCorrect("");
    setNewQExpl("");
    showToast("🎉 Đã thêm câu hỏi vào Kho câu hỏi của tôi!");
  };

  // Copy helper
  const copyToClipboard = (text: string, noticeText: string) => {
    navigator.clipboard.writeText(text);
    showToast(noticeText);
  };

  // Filtered lists for search
  const visibleClasses = simulateEmptyClasses
    ? []
    : classesList.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const visibleAssignments = simulateEmptyAssignments
    ? []
    : assignmentsList.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.className.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const visibleSchedule = simulateNoSchedule ? [] : scheduleList;
  const visibleStudentsInNeed = simulateNoStudentsInNeed ? [] : studentsInNeedList;

  // Selected Class Object
  const currentSelectedClass = classesList.find((c) => c.id === selectedClassId);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#204434] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#315E48]">Đang tải không gian giảng viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#204434] font-sans selection:bg-[#204434] selection:text-[#FFFCF6] flex">
      {/* ========================================================================= */}
      {/* 1. SIDEBAR TRÁI: DÙNG PHONG CẢNH THỦY MẶC DƯỚI MENU (GIỐNG HỌC SINH & SPEC) */}
      {/* ========================================================================= */}
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs animate-fade-in"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#F8F5ED] border-r border-[#E5DEC9] z-50 flex flex-col justify-between shadow-xs overflow-hidden transition-transform duration-300 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Background Artwork: phong_cảnh_thủy_mặc_giữa_sương_mờ.png spanning full sidebar */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none z-0 bg-bottom bg-no-repeat bg-cover opacity-85 mix-blend-multiply transition-opacity duration-300"
          style={{ backgroundImage: `url('/theme/dashboard/sidebar-bg.webp')` }}
        />

        {/* Content Container (z-10 ensures no text/buttons are obscured) */}
        <div className="relative z-10 flex flex-col flex-1">
          {/* Logo Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-[#E5DEC9]/60">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#204434] text-[#FFFCF6] flex items-center justify-center font-serif text-lg font-bold shadow-xs group-hover:scale-105 transition-transform">
                <span>宁</span>
              </div>
              <div className="leading-tight">
                <div className="font-serif font-bold text-lg text-[#204434] tracking-tight">Hanyu Teacher</div>
                <div className="text-[9px] text-[#315E48] font-bold tracking-[0.16em] uppercase">
                  KHÔNG GIAN GIÁO VIÊN
                </div>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl border border-[#E5DEC9] text-[#315E48] hover:bg-[#FAF7F0]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav List (Spec Section 3: 8 menus) */}
          <nav className="p-3.5 space-y-1 text-xs font-medium">
            {[
              { id: "overview", label: "Tổng quan", icon: Home },
              { id: "classes", label: "Lớp học", icon: Users, badge: classesList.length },
              { id: "lessons", label: "Kho bài học", icon: BookOpen },
              { id: "assignments", label: "Bài tập & Kiểm tra", icon: FileCheck2, badge: assignmentsList.length },
              { id: "questions", label: "Ngân hàng câu hỏi", icon: HelpCircle, badge: questionBankCount },
              { id: "reports", label: "Báo cáo học tập", icon: BarChart3 },
              { id: "schedule", label: "Lịch dạy & Hạn nộp", icon: Calendar, badge: dynamicSchedules.length },
              { id: "settings", label: "Hồ sơ & Cài đặt", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id && !selectedClassId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSelectedClassId(null);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer text-left ${
                    isSelected
                      ? "bg-[#204434] text-[#FFFCF6] font-semibold shadow-xs"
                      : "text-[#315E48] hover:bg-[#204434]/10 hover:text-[#204434]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 stroke-[1.9]" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-[#204434]/10 text-[#204434]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Privacy Notice for Teacher (Spec Section 1 & 13) */}
          <div className="mx-3.5 mt-2 p-3 rounded-2xl bg-white/70 border border-[#E5DEC9] text-[10px] text-[#315E48] leading-relaxed shadow-2xs backdrop-blur-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#204434] mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#204434]" />
              <span>Quyền riêng tư lớp học</span>
            </div>
            Giáo viên chỉ quản lý kết quả học tập thuộc lớp mình phụ trách; không xem hoạt động tự học riêng của học viên.
          </div>
        </div>

        {/* User Card & Logout (Bottom of Sidebar) */}
        <div className="relative z-10 p-3.5 pt-0">
          <div className="p-2.5 rounded-2xl bg-[#FFFCF6]/95 border border-[#E5DEC9] shadow-xs flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-[#204434]/10 border border-[#BC9B6B]/40 relative shrink-0">
                <Image
                  src={currentUser?.avatar || "/theme/avatar-teacher.jpg"}
                  alt={currentUser?.name || "Teacher"}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="leading-tight truncate">
                <span className="font-bold text-xs text-[#204434] block truncate">
                  {currentUser?.name || "Giáo viên"}
                </span>
                <span className="text-[10px] text-[#315E48] block truncate">
                  {currentUser?.email || currentUser?.username || "Giáo viên · Hanyu"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("settings")}
              className="text-[#315E48] hover:text-[#204434] p-1 cursor-pointer"
              title="Cài đặt tài khoản"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#9D493E] hover:bg-white/80 transition cursor-pointer border border-transparent hover:border-[#E5DEC9]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất khỏi hệ thống</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header (Spec Section 4: Search, Bell, Profile) */}
        <header className="h-20 bg-[#F8F5ED]/90 backdrop-blur-md border-b border-[#E5DEC9] px-4 sm:px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile & small screens */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[#E5DEC9] bg-[#FFFCF6] text-[#204434] hover:bg-[#FAF7F0] cursor-pointer shadow-2xs"
              title="Mở menu danh mục"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search bar with permission scope */}
            <div className="relative w-60 sm:w-80 lg:w-[360px]">
              <Search className="w-4 h-4 text-[#315E48] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Tìm lớp học, bài học, câu hỏi..."
                className="w-full bg-[#FFFCF6] border border-[#E5DEC9] focus:border-[#204434] focus:ring-1 focus:ring-[#204434] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#204434] placeholder-[#8ea394] outline-none transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Center Quick Navigation Shortcuts */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("questions");
                setSelectedClassId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "questions"
                  ? "bg-[#204434] text-white shadow-2xs"
                  : "bg-amber-50/80 border border-amber-300/80 text-[#8F6D3B] hover:bg-amber-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Ngân hàng câu hỏi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("assignments");
                setSelectedClassId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "assignments"
                  ? "bg-[#204434] text-white shadow-2xs"
                  : "bg-[#FFFCF6] border border-[#E5DEC9] text-[#315E48] hover:bg-[#FAF7F0]"
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Bài tập & Kiểm tra</span>
            </button>
          </div>

          {/* Right Header: Notification Bell & Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Testing Bar Trigger (Hidden in production, active only with ?debug=1) */}
            {typeof window !== "undefined" && window.location.search.includes("debug=1") && (
              <button
                onClick={() => setShowTestToolbar(!showTestToolbar)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E5DEC9]/50 hover:bg-[#E5DEC9] text-[#204434] text-[11px] font-semibold transition"
                title="Mở thanh kiểm thử Happycase & Unhappycase"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
                <span>Kiểm thử Cases</span>
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center relative transition cursor-pointer shadow-2xs"
                title="Thông báo"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.read) && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9D493E] absolute top-2.5 right-2.5 border-2 border-[#FFFCF6]" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-lg p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]">
                    <span className="font-bold text-xs text-[#204434]">Thông báo mới ({notifications.length})</span>
                    <button
                      onClick={() =>
                        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                      }
                      className="text-[10px] text-[#315E48] hover:underline"
                    >
                      Đánh dấu đã đọc
                    </button>
                  </div>
                  <div className="divide-y divide-[#E5DEC9]/50 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-2.5 px-1 hover:bg-[#F8F5ED] rounded-lg transition">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-xs text-[#204434]">{n.title}</span>
                          <span className="text-[10px] text-[#8ea394]">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#315E48]">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Teacher Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#E5DEC9]">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#BC9B6B]/40 relative shrink-0">
                <Image
                  src={currentUser?.avatar || "/theme/avatar-teacher.jpg"}
                  alt={currentUser?.name || "Teacher"}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="leading-tight hidden sm:block">
                <span className="font-bold text-xs text-[#204434] block">
                  {currentUser?.name || "Giáo viên"}
                </span>
                <span className="text-[10px] text-[#315E48] block">
                  {currentUser?.role === "ADMIN" ? "Quản trị viên" : "Giáo viên phụ trách"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Test Toolbar (Simulation for Happy & Unhappy Cases) */}
        {showTestToolbar && (
          <div className="bg-[#204434] text-white px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-inner animate-fadeIn">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
              <span>Bảng công cụ Test Happycase & Unhappycase:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSimulateNoSchedule(!simulateNoSchedule)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  simulateNoSchedule ? "bg-[#9D493E] text-white" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {simulateNoSchedule ? "❌ Bỏ mô phỏng: Không có lịch dạy" : "Mô phỏng: Không có lịch dạy"}
              </button>
              <button
                onClick={() => setSimulateNoStudentsInNeed(!simulateNoStudentsInNeed)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  simulateNoStudentsInNeed ? "bg-[#9D493E] text-white" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {simulateNoStudentsInNeed ? "❌ Bỏ mô phỏng: Mọi HS đều tốt" : "Mô phỏng: Mọi HS đều tốt"}
              </button>
              <button
                onClick={() => setSimulateEmptyClasses(!simulateEmptyClasses)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  simulateEmptyClasses ? "bg-[#9D493E] text-white" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {simulateEmptyClasses ? "❌ Bỏ mô phỏng: Lớp trống" : "Mô phỏng: Lớp trống"}
              </button>
              <button
                onClick={() => setSimulateEmptyAssignments(!simulateEmptyAssignments)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  simulateEmptyAssignments ? "bg-[#9D493E] text-white" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {simulateEmptyAssignments ? "❌ Bỏ mô phỏng: Bài tập trống" : "Mô phỏng: Bài tập trống"}
              </button>
            </div>
            <button
              onClick={() => setShowTestToolbar(false)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#204434] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-slideUp">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* DASHBOARD BODY */}
        {/* ===================================================================== */}
        <main className="p-6 lg:p-8 space-y-6 max-w-[1780px] w-full mx-auto">
          {/* =================================================================== */}
          {/* TAB 1: OVERVIEW (LƯỚI 12 CỘT: 8 CỘT TRÁI | 4 CỘT PHẢI - SPEC SEC 2) */}
          {/* =================================================================== */}
          {activeTab === "overview" && !selectedClassId && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* --------------------------------------------------------------- */}
              {/* CỘT TRÁI (~70% WIDTH - 8 COLS) */}
              {/* --------------------------------------------------------------- */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. BANNER CHÀO MỪNG (SỬ DỤNG phong_cảnh_thủy_mặc_bên_hồ_sương_sớm.png) */}
                <section
                  className="relative rounded-3xl border border-[#E5DEC9] shadow-xs overflow-hidden min-h-[220px] sm:min-h-[240px] flex items-center bg-[#F8F5ED]"
                  style={{
                    backgroundImage: `url('/theme/dashboard/banner-bg.webp')`,
                    backgroundPosition: "right center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {/* Soft gradient overlay on left for high contrast & readability */}
                  <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-center bg-gradient-to-r from-[#F8F5ED]/95 via-[#F8F5ED]/85 to-transparent sm:max-w-2xl">
                    <div className="text-xs text-[#315E48] font-medium mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Thứ hai, 20 tháng 10 · Kỳ học 2026</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A3D2F] tracking-tight">
                      Chào mừng trở lại, {currentUser?.name || "thầy/cô"}! 🌱
                    </h1>

                    <p className="text-xs sm:text-sm text-[#315E48] leading-relaxed mt-2 max-w-lg">
                      Hôm nay thầy/cô có{" "}
                      <span className="font-bold text-[#204434]">
                        {overviewStats ? overviewStats.totalClasses : classesList.length} lớp học
                      </span>{" "}
                      và{" "}
                      <span className="font-bold text-[#204434]">
                        {overviewStats ? overviewStats.activeAssignments : 0} bài tập
                      </span>{" "}
                      đang diễn ra. Chúc thầy/cô một ngày giảng dạy tràn đầy năng lượng!
                    </p>

                    {/* 2 Main Action Buttons (Spec Section 5) */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setLessonErrors({});
                          setIsLessonModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] text-xs font-semibold shadow-md shadow-[#204434]/15 transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tạo bài học mới</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAssignErrors({});
                          setIsAssignModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 hover:bg-white text-[#204434] text-xs font-semibold border border-[#E5DEC9] shadow-2xs transition cursor-pointer"
                      >
                        <FileCheck2 className="w-4 h-4" />
                        <span>Tạo bài tập</span>
                      </button>
                    </div>
                  </div>
                </section>

                {/* 2. BỐN THẺ THỐNG KÊ NHANH (SPEC SECTION 6) */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {/* Thẻ 1: Lớp đang quản lý */}
                  <div
                    onClick={() => setActiveTab("classes")}
                    className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#204434] transition cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[11px] text-[#315E48] font-medium block">Lớp đang quản lý</span>
                      <div className="text-2xl font-bold font-serif text-[#204434] mt-1">
                        {overviewStats ? overviewStats.totalClasses : visibleClasses.length}{" "}
                        <span className="text-xs font-normal text-[#315E48]">lớp</span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Thẻ 2: Tổng học sinh */}
                  <div
                    onClick={() => {
                      setActiveTab("classes");
                      if (classesList.length > 0) setSelectedClassId(classesList[0].id);
                    }}
                    className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#204434] transition cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[11px] text-[#315E48] font-medium block">Tổng học sinh</span>
                      <div className="text-2xl font-bold font-serif text-[#204434] mt-1">
                        {overviewStats
                          ? overviewStats.totalStudents
                          : visibleClasses.reduce((acc, c) => acc + c.studentCount, 0)}{" "}
                        <span className="text-xs font-normal text-[#315E48]">học viên</span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <UserPlus className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Thẻ 3: Bài tập đang giao */}
                  <div
                    onClick={() => setActiveTab("assignments")}
                    className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#204434] transition cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[11px] text-[#315E48] font-medium block">Bài tập đang giao</span>
                      <div className="text-2xl font-bold font-serif text-[#204434] mt-1">
                        {overviewStats ? overviewStats.activeAssignments : visibleAssignments.length}{" "}
                        <span className="text-xs font-normal text-[#315E48]">bài</span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#BC9B6B]/20 text-[#854d0e] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Thẻ 4: Tỷ lệ hoàn thành */}
                  <div
                    onClick={() => setActiveTab("reports")}
                    className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#204434] transition cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[11px] text-[#315E48] font-medium block">Tỷ lệ hoàn thành</span>
                      <div className="text-2xl font-bold font-serif text-[#204434] mt-1">
                        {overviewStats ? overviewStats.completionRate : 0}%
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {overviewStats ? overviewStats.completionRate : 0}%
                    </div>
                  </div>
                </section>

                {/* 3. LỚP HỌC CỦA TÔI (3 CARDS VỚI 3 ẢNH THỦY MẶC - SPEC SECTION 7) */}
                <section className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#204434]" />
                      <h3 className="font-bold text-sm text-[#204434]">Lớp học của tôi</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setClassErrors({});
                          setIsCreateClassModalOpen(true);
                        }}
                        className="text-xs text-[#204434] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tạo lớp</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("classes")}
                        className="text-xs text-[#315E48] hover:text-[#204434] font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>Xem tất cả ({classesList.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Empty state (Unhappy Case) */}
                  {visibleClasses.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#204434]/10 text-[#204434] flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-[#204434]">Bạn chưa có lớp học nào</h4>
                      <p className="text-xs text-[#315E48] max-w-sm mx-auto">
                        Thầy/Cô chưa có lớp học nào do mình phụ trách. Hãy nhấn nút bên dưới để tạo lớp học đầu tiên nhé!
                      </p>
                      <button
                        onClick={() => {
                          setClassErrors({});
                          setIsCreateClassModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-semibold shadow-xs hover:bg-[#183629] transition"
                      >
                        + Tạo lớp học mới
                      </button>
                    </div>
                  ) : (
                    /* 3 Cards displaying the 3 Chinese Watercolor Artworks */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {visibleClasses.slice(0, 3).map((cl) => (
                        <div
                          key={cl.id}
                          onClick={() => {
                            setSelectedClassId(cl.id);
                            setActiveTab("classes");
                          }}
                          className="p-5 rounded-3xl border border-[#E5DEC9] shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[160px] group hover:border-[#204434]/60 transition cursor-pointer bg-[#FFFCF6]"
                          style={{
                            backgroundImage: `url('${cl.artwork}')`,
                            backgroundPosition: "right bottom",
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                          }}
                        >
                          {/* Content on the left */}
                          <div className="relative z-10 max-w-[65%] space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-[#204434]/10 text-[#204434] text-[10px] font-bold">
                              {cl.track === "HSK" ? "HSK 3.0" : cl.track === "TOPIC" ? "Theo chủ đề" : "Chuyên ngành"}
                            </span>
                            <h4 className="font-serif font-bold text-sm text-[#204434] leading-tight group-hover:text-[#183629] transition">
                              {cl.name}
                            </h4>
                            <p className="text-[11px] text-[#315E48]">
                              {cl.studentCount} học viên · {cl.completedLessons}/{cl.totalLessons} bài học
                            </p>
                          </div>

                          {/* Bottom info */}
                          <div className="relative z-10 pt-4 flex items-center justify-between text-xs text-[#315E48] font-medium">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-[#315E48]">Tỷ lệ nộp bài:</span>
                              <span className="font-bold text-[#204434] text-xs">{cl.submissionRate}%</span>
                            </div>
                            <span className="text-xs font-semibold text-[#204434] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                              Vào lớp <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* 4. BẢNG BÀI TẬP GẦN ĐÂY (SPEC SECTION 8) */}
                <section className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-[#204434]" />
                      <h3 className="font-bold text-sm text-[#204434]">Bài tập gần đây</h3>
                    </div>
                    <button
                      onClick={() => {
                        setAssignErrors({});
                        setIsAssignModalOpen(true);
                      }}
                      className="text-xs text-[#204434] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Giao bài tập</span>
                    </button>
                  </div>

                  {visibleAssignments.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] text-center space-y-2">
                      <FileCheck2 className="w-8 h-8 text-[#315E48] mx-auto opacity-60" />
                      <p className="text-xs text-[#315E48]">Hiện chưa có bài tập nào đang diễn ra.</p>
                    </div>
                  ) : (
                    <div className="rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-[#E5DEC9] bg-[#F8F5ED]/60 text-[#315E48] font-semibold text-[11px]">
                              <th className="py-3 px-4">Tên bài tập</th>
                              <th className="py-3 px-4">Lớp tiếp nhận</th>
                              <th className="py-3 px-4">Đã nộp</th>
                              <th className="py-3 px-4">Hạn nộp</th>
                              <th className="py-3 px-4">Trạng thái</th>
                              <th className="py-3 px-4 text-right">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5DEC9]/50">
                            {visibleAssignments.map((a) => (
                              <tr key={a.id} className="hover:bg-[#F8F5ED]/40 transition">
                                <td className="py-3.5 px-4 font-bold text-[#204434]">{a.title}</td>
                                <td className="py-3.5 px-4 text-[#315E48]">{a.className}</td>
                                <td className="py-3.5 px-4">
                                  <span className="font-bold text-[#204434]">
                                    {a.submittedCount}/{a.totalStudents}
                                  </span>
                                  <span className="text-[10px] text-[#315E48] ml-1">
                                    ({Math.round((a.submittedCount / a.totalStudents) * 100)}%)
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-[#315E48]">{a.dueAt}</td>
                                <td className="py-3.5 px-4">
                                  {a.status === "ACTIVE" && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      Đang diễn ra
                                    </span>
                                  )}
                                  {a.status === "EXPIRING_SOON" && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                      Sắp hết hạn
                                    </span>
                                  )}
                                  {a.status === "CLOSED" && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                                      Đã đóng
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    onClick={() => setSelectedAssignmentForView(a)}
                                    className="px-3 py-1.5 rounded-xl bg-[#204434]/10 hover:bg-[#204434] text-[#204434] hover:text-white font-semibold text-xs transition cursor-pointer"
                                  >
                                    Xem kết quả
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* --------------------------------------------------------------- */}
              {/* CỘT PHẢI (~30% WIDTH - 4 COLS - SPEC SEC 9, 10, 11) */}
              {/* --------------------------------------------------------------- */}
              <div className="lg:col-span-4 space-y-6">
                {/* 1. LỊCH DẠY HÔM NAY (SPEC SECTION 9) */}
                <section className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#204434]" />
                      <h3 className="font-bold text-sm text-[#204434]">Lịch dạy hôm nay</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("schedule")}
                      className="text-xs text-[#315E48] hover:text-[#204434] font-medium"
                    >
                      Xem lịch
                    </button>
                  </div>

                  {(() => {
                    const todayStr = new Date().toISOString().split("T")[0];
                    const todayEvents = dynamicSchedules.filter((s) => s.date === todayStr);

                    if (todayEvents.length === 0) {
                      return (
                        <div className="py-6 text-center space-y-2.5">
                          <Calendar className="w-8 h-8 text-[#315E48]/50 mx-auto" />
                          <p className="text-xs text-[#315E48]">Hôm nay chưa có lịch dạy. Thư giãn hoặc chuẩn bị giáo án nhé! 🌱</p>
                          <button
                            onClick={() => setActiveTab("schedule")}
                            className="px-3 py-1.5 rounded-xl bg-[#204434] text-white text-[11px] font-semibold hover:bg-[#183629] transition cursor-pointer"
                          >
                            + Xem & Lên lịch Apple Calendar
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {todayEvents.map((s) => (
                          <div
                            key={s.id}
                            className="p-3 rounded-2xl bg-[#F8F5ED] border border-[#E5DEC9]/70 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 text-[10px] text-[#315E48] font-semibold">
                                <span>{s.startTime} - {s.endTime}</span>
                                <span className="w-1 h-1 rounded-full bg-[#BC9B6B]" />
                                <span className={s.mode === "ONLINE" ? "text-emerald-700" : "text-amber-700"}>
                                  {s.mode}
                                </span>
                              </div>
                              <h4 className="font-bold text-xs text-[#204434] truncate mt-0.5">{s.className}</h4>
                              <p className="text-[10px] text-[#8ea394] truncate">{s.location}</p>
                            </div>

                            {s.mode === "ONLINE" ? (
                              <a
                                href={s.meetUrl || "https://meet.google.com/new"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition bg-[#204434] hover:bg-[#183629] text-white shadow-2xs"
                              >
                                Vào lớp
                              </a>
                            ) : (
                              <button
                                onClick={() => setActiveTab("schedule")}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#204434] hover:text-white"
                              >
                                Chi tiết
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </section>

                {/* 2. BÀI TẬP SẮP ĐẾN HẠN (SPEC SECTION 10) */}
                <section className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#BC9B6B]" />
                      <h3 className="font-bold text-sm text-[#204434]">Bài tập sắp đến hạn</h3>
                    </div>
                    <span className="text-xs text-[#315E48] font-medium">{dueAssignments.length} bài</span>
                  </div>

                  <div className="space-y-2.5">
                    {dueAssignments.map((da) => (
                      <div
                        key={da.id}
                        onClick={() => {
                          const target = assignmentsList.find((a) => a.id === da.id);
                          if (target) setSelectedAssignmentForView(target);
                        }}
                        className="p-3 rounded-2xl bg-[#F8F5ED] border border-[#E5DEC9]/70 hover:border-[#204434] transition cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-[#204434] truncate max-w-[200px]">
                            {da.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              da.urgency === "warning"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {da.dueText}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#315E48]">
                          <span>{da.className}</span>
                          <span className="font-semibold text-[#204434]">{da.submittedText}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3. HỌC SINH CẦN HỖ TRỢ (SPEC SECTION 11) */}
                <section className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#9D493E]" />
                      <h3 className="font-bold text-sm text-[#204434]">Học sinh cần hỗ trợ</h3>
                    </div>
                    <span className="text-[10px] text-[#9D493E] bg-[#9D493E]/10 px-2 py-0.5 rounded-full font-bold">
                      {visibleStudentsInNeed.length} học viên
                    </span>
                  </div>

                  {visibleStudentsInNeed.length === 0 ? (
                    <div className="py-6 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="text-xs text-[#315E48]">Tất cả học sinh đều đang theo kịp tiến độ học tập! Tuyệt vời 🌱</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visibleStudentsInNeed.map((st) => (
                        <div
                          key={st.id}
                          className="p-3 rounded-2xl bg-[#F8F5ED] border border-[#E5DEC9]/70 flex items-center justify-between gap-2.5"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-white border border-[#BC9B6B]/40 relative shrink-0">
                              <Image
                                src={st.avatar}
                                alt={st.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 leading-tight">
                              <span className="font-bold text-xs text-[#204434] block truncate">{st.name}</span>
                              <span className="text-[10px] text-[#9D493E] font-medium block truncate mt-0.5">
                                {st.reason}
                              </span>
                              <span className="text-[9px] text-[#8ea394] block truncate">{st.className}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedStudentForSupport(st);
                              setAssignedRemedialNotice(false);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#204434] text-[#204434] hover:text-white border border-[#E5DEC9] text-xs font-semibold shrink-0 transition cursor-pointer shadow-2xs"
                          >
                            Xem
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 2: CLASSES (QUẢN LÝ LỚP HỌC & CLASS DETAIL WORKSPACE) */}
          {/* =================================================================== */}
          {activeTab === "classes" && (
            <ClassesWorkspace
              currentUser={currentUser}
              onClassCountChange={() => {
                if (currentUser) fetchTeacherData(currentUser);
              }}
              onAssignNew={(classId) => {
                setAssignClassId(classId);
                setActiveTab("assignments");
              }}
            />
          )}

          {/* =================================================================== */}
          {/* TAB 3: LESSONS (KHO BÀI HỌC) */}
          {/* =================================================================== */}
          {activeTab === "lessons" && (
            <LessonLibraryWorkspace
              currentUser={currentUser || undefined}
              classesList={classesList.map((c) => ({
                id: c.id,
                name: c.name,
                code: c.code,
                studentCount: c.studentCount,
              }))}
              onNavigateToAssignments={(payload) => {
                const countParts: string[] = [];
                if (payload.vocabList?.length) countParts.push(`${payload.vocabList.length} từ vựng`);
                if (payload.grammarList?.length) countParts.push(`${payload.grammarList.length} điểm ngữ pháp`);
                if (payload.culturalList?.length) countParts.push(`${payload.culturalList.length} mục văn hóa`);
                showToast(`Đã chuyển ${countParts.join(", ") || "nội dung"} sang module Bài tập!`);
                setTransferredAssignmentPayload(payload);
                setAssignTitle(`Bài tập củng cố: ${payload.lessonTitle}`);
                if (payload.classId) {
                  setAssignClassId(payload.classId);
                }
                setActiveTab("assignments");
              }}
              onBackToDashboard={() => setActiveTab("overview")}
            />
          )}

          {/* =================================================================== */}
          {/* TAB 4: ASSIGNMENTS (BÀI TẬP & KIỂM TRA - ĐẶC TẢ V2.0) */}
          {/* =================================================================== */}
          {activeTab === "assignments" && (
            <AssignmentsWorkspace
              currentUser={currentUser || undefined}
              classesList={classesList.map((c) => ({
                id: c.id,
                name: c.name,
                code: c.code,
                studentCount: c.studentCount,
              }))}
              onBackToDashboard={() => setActiveTab("overview")}
              onNavigateToQuestionBank={(tab) => {
                setActiveTab("questions");
              }}
              initialExamId={targetExamToOpen}
              initialNewAssignmentPayload={
                transferredAssignmentPayload ||
                (assignTitle
                  ? {
                      lessonTitle: assignTitle,
                      classId: assignClassId,
                    }
                  : undefined)
              }
            />
          )}

          {/* =================================================================== */}
          {/* TAB 5: QUESTIONS (KHO CÂU HỎI CỦA TÔI - THEO MOCKUP & ĐẶC TẢ) */}
          {/* =================================================================== */}
          {activeTab === "questions" && (
            <QuestionBankWorkspace
              showToast={showToast}
              onNavigateToAssignments={(examId) => {
                setTargetExamToOpen(examId || null);
                setActiveTab("assignments");
              }}
            />
          )}

          {/* =================================================================== */}
          {/* TAB 6: REPORTS (BÁO CÁO HỌC TẬP THEO ĐẶC TẢ & GIAO DIỆN MOCKUP) */}
          {/* =================================================================== */}
          {activeTab === "reports" && (
            <ClassReportWorkspace
              classes={classesList}
              currentUser={currentUser}
              showToast={showToast}
              onNavigateToTab={(tab) => {
                if (["overview", "classes", "lessons", "assignments", "questions", "reports", "schedule", "settings"].includes(tab)) {
                  setActiveTab(tab as any);
                }
              }}
            />
          )}

          {/* =================================================================== */}
          {/* TAB 7: SCHEDULE (LỊCH DẠY APPLE CALENDAR THEO YÊU CẦU NGƯỜI DÙNG) */}
          {/* =================================================================== */}
          {activeTab === "schedule" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#204434]">Lịch dạy & Ca học (Apple Calendar)</h2>
                <p className="text-xs text-[#315E48]">
                  Giao diện lịch giảng dạy trực quan theo chuẩn Apple Calendar: xem theo Tháng, Tuần, Danh sách, thêm ca học và vào lớp trực tuyến Meet chỉ với 1 click.
                </p>
              </div>

              <AppleScheduleCalendar
                classes={classesList}
                onScheduleChange={(updated) => setDynamicSchedules(updated)}
              />
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 8: SETTINGS (HỒ SƠ & CÀI ĐẶT) */}
          {/* =================================================================== */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#204434]">Hồ sơ & Cài đặt giảng dạy</h2>
                <p className="text-xs text-[#315E48]">Cập nhật thông tin giảng viên, mật khẩu và thông báo hệ thống.</p>
              </div>

              <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#BC9B6B]/40 relative shrink-0">
                    <Image
                      src={currentUser?.avatar || "/theme/avatar-teacher.jpg"}
                      alt="Avatar"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#204434]">
                      {currentUser?.name || "Giáo viên"}
                    </h3>
                    <p className="text-xs text-[#315E48]">
                      {currentUser?.role === "ADMIN" ? "Quản trị viên" : "Giảng viên Tiếng Trung & Luyện thi HSK chuẩn"}
                    </p>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                      Tài khoản hoạt động chính thức
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#E5DEC9]">
                  <div>
                    <label className="block text-xs font-semibold text-[#204434] mb-1">Email giảng viên</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser?.email || currentUser?.username || "teacher@hanyu.edu.vn"}
                      className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl px-3.5 py-2 text-xs text-gray-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#204434] mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      placeholder="Nhập mật khẩu mới nếu muốn đổi..."
                      className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3.5 py-2 text-xs text-[#204434] outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => showToast("Đã lưu cập nhật cài đặt thành công!")}
                    className="px-5 py-2 rounded-xl bg-[#204434] text-white text-xs font-semibold shadow-2xs hover:bg-[#183629]"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================================= */}
      {/* MODAL 1: TẠO BÀI HỌC MỚI (HAPPY CASE & UNHAPPY CASE VALIDATION) */}
      {/* ======================================================================= */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#204434]" />
                <h3 className="font-serif font-bold text-base text-[#204434]">Tạo bài học mới</h3>
              </div>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Track Selector */}
              <div>
                <label className="block font-semibold text-[#204434] mb-1">Chương trình đào tạo</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "HSK", label: "HSK 3.0" },
                    { id: "TOPIC", label: "Theo chủ đề" },
                    { id: "MAJOR", label: "Chuyên ngành" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setLessonTrack(t.id as any)}
                      className={`py-2 rounded-xl text-xs font-semibold transition ${
                        lessonTrack === t.id
                          ? "bg-[#204434] text-white"
                          : "bg-[#F8F5ED] text-[#315E48] hover:bg-[#E5DEC9]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input with unhappycase error */}
              <div>
                <label className="block font-semibold text-[#204434] mb-1">
                  Tiêu đề bài học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => {
                    setLessonTitle(e.target.value);
                    if (lessonErrors.title) setLessonErrors({});
                  }}
                  placeholder="Ví dụ: Bài 6: Đặt món ăn tại nhà hàng Trung Hoa (点菜)"
                  className={`w-full bg-[#F8F5ED] border rounded-xl px-3.5 py-2.5 outline-none transition ${
                    lessonErrors.title ? "border-red-500 bg-red-50/30" : "border-[#E5DEC9] focus:border-[#204434]"
                  }`}
                />
                {lessonErrors.title && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{lessonErrors.title}</span>
                  </p>
                )}
              </div>

              {/* Vocabularies */}
              <div>
                <label className="block font-semibold text-[#204434] mb-1">Từ vựng trọng tâm (cách nhau bởi dấu phẩy)</label>
                <input
                  type="text"
                  value={lessonVocabInput}
                  onChange={(e) => setLessonVocabInput(e.target.value)}
                  placeholder="Ví dụ: 菜单 (thực đơn), 买单 (thanh toán), 好吃 (ngon)..."
                  className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl px-3.5 py-2 outline-none focus:border-[#204434]"
                />
              </div>

              {/* Grammar rules */}
              <div>
                <label className="block font-semibold text-[#204434] mb-1">Điểm ngữ pháp & mẫu câu chính</label>
                <textarea
                  rows={3}
                  value={lessonGrammarInput}
                  onChange={(e) => setLessonGrammarInput(e.target.value)}
                  placeholder="Ví dụ: Cấu trúc câu chữ 把: Chủ ngữ + 把 + Tân ngữ + Động từ + Thành phần khác..."
                  className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl p-3 outline-none focus:border-[#204434]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => handleSaveLesson(true)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] text-xs font-semibold cursor-pointer"
              >
                Lưu bản nháp
              </button>
              <button
                type="button"
                onClick={() => handleSaveLesson(false)}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Xuất bản bài học
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 2: TẠO BÀI TẬP (HAPPY CASE & UNHAPPY CASE VALIDATION) */}
      {/* ======================================================================= */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#204434]" />
                <h3 className="font-serif font-bold text-base text-[#204434]">Tạo bài tập & Kiểm tra</h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#204434] mb-1">
                  Tên bài tập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={assignTitle}
                  onChange={(e) => {
                    setAssignTitle(e.target.value);
                    if (assignErrors.title) setAssignErrors({});
                  }}
                  placeholder="Ví dụ: Ôn tập Từ vựng & Ngữ pháp HSK 3 - Đề số 2"
                  className={`w-full bg-[#F8F5ED] border rounded-xl px-3.5 py-2.5 outline-none transition ${
                    assignErrors.title ? "border-red-500 bg-red-50/30" : "border-[#E5DEC9] focus:border-[#204434]"
                  }`}
                />
                {assignErrors.title && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{assignErrors.title}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#204434] mb-1">Lớp học nhận bài</label>
                <select
                  value={assignClassId}
                  onChange={(e) => setAssignClassId(e.target.value)}
                  className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#204434]"
                >
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.studentCount} học viên)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#204434] mb-1">Thời lượng (phút)</label>
                  <input
                    type="number"
                    value={assignDuration}
                    onChange={(e) => setAssignDuration(Number(e.target.value))}
                    className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl px-3.5 py-2 outline-none focus:border-[#204434]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#204434] mb-1">Hạn nộp</label>
                  <input
                    type="datetime-local"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl px-3.5 py-2 outline-none focus:border-[#204434]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48] text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveAssignment}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Giao bài cho lớp ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 3: TẠO LỚP HỌC MỚI (VỚI TỰ SINH MÃ LỚP DUY NHẤT) */}
      {/* ======================================================================= */}
      {isCreateClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#204434]" />
                <h3 className="font-serif font-bold text-base text-[#204434]">Tạo lớp học mới</h3>
              </div>
              <button
                onClick={() => setIsCreateClassModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#204434] mb-1">
                  Tên lớp học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => {
                    setNewClassName(e.target.value);
                    if (classErrors.name) setClassErrors({});
                  }}
                  placeholder="Ví dụ: HSK 3 Bứt phá điểm số - Khóa 2026"
                  className={`w-full bg-[#F8F5ED] border rounded-xl px-3.5 py-2.5 outline-none transition ${
                    classErrors.name ? "border-red-500 bg-red-50/30" : "border-[#E5DEC9] focus:border-[#204434]"
                  }`}
                />
                {classErrors.name && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{classErrors.name}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#204434] mb-1">Chương trình</label>
                  <select
                    value={newClassTrack}
                    onChange={(e) => setNewClassTrack(e.target.value as any)}
                    className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl px-3.5 py-2 outline-none focus:border-[#204434]"
                  >
                    <option value="HSK">HSK 3.0</option>
                    <option value="TOPIC">Theo chủ đề</option>
                    <option value="MAJOR">Chuyên ngành kinh tế</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#204434] mb-1">Cấp độ HSK</label>
                  <select
                    value={newClassLevel}
                    onChange={(e) => setNewClassLevel(Number(e.target.value))}
                    className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl px-3.5 py-2 outline-none focus:border-[#204434]"
                  >
                    <option value={1}>HSK 1</option>
                    <option value={2}>HSK 2</option>
                    <option value={3}>HSK 3</option>
                    <option value={4}>HSK 4</option>
                    <option value={5}>HSK 5</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#204434] mb-1">Mô tả mục tiêu lớp</label>
                <textarea
                  rows={2}
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="Mô tả ngắn gọn về đối tượng học viên và mục tiêu đầu ra..."
                  className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl p-3 outline-none focus:border-[#204434]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreateClassModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48] text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveClass}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Khởi tạo lớp & Sinh mã
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 4: CẤP TÀI KHOẢN HỌC VIÊN (SPEC SECTION 7 & 13) */}
      {/* ======================================================================= */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#204434]" />
                <h3 className="font-serif font-bold text-base text-[#204434]">Cấp tài khoản học viên mới</h3>
              </div>
              <button
                onClick={() => {
                  setIsAddStudentModalOpen(false);
                  setIssuedStudentSuccess(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {issuedStudentSuccess ? (
              /* Success card with 1-click copy */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Đã tạo tài khoản thành công!</span>
                  </div>
                  <p className="text-emerald-800">
                    Học viên <strong>{issuedStudentSuccess.name}</strong> đã được thêm vào lớp{" "}
                    <strong>{issuedStudentSuccess.className}</strong>.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1 font-mono text-[11px] text-[#204434]">
                    <div>👤 Tên đăng nhập: <strong>{issuedStudentSuccess.username}</strong></div>
                    <div>🔑 Mật khẩu tạm: <strong>{issuedStudentSuccess.password}</strong></div>
                    <div>🏷️ Mã lớp học: <strong>{issuedStudentSuccess.classCode}</strong></div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      const teacherGreeting = currentUser?.name || "Giáo viên";
                      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
                      const msg = `🎉 Chào em ${issuedStudentSuccess.name}! ${teacherGreeting} gửi em tài khoản vào lớp ${issuedStudentSuccess.className}:\n🔗 Web: ${origin}/login\n👤 Tên đăng nhập: ${issuedStudentSuccess.username}\n🔑 Mật khẩu: ${issuedStudentSuccess.password}\nChúc em học tốt nhé! 加油!💪`;
                      copyToClipboard(msg, "Đã sao chép tin nhắn gửi học viên!");
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#204434] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Sao chép tin nhắn gửi học viên</span>
                  </button>
                  <button
                    onClick={() => setIssuedStudentSuccess(null)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#E5DEC9] text-xs font-semibold text-[#315E48]"
                  >
                    Thêm em khác
                  </button>
                </div>
              </div>
            ) : (
              /* Form */
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-[#204434] mb-1">Lớp tiếp nhận</label>
                  <select
                    value={targetClassForStudent}
                    onChange={(e) => setTargetClassForStudent(e.target.value)}
                    className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl px-3.5 py-2 outline-none focus:border-[#204434]"
                  >
                    {classesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#204434] mb-1">
                    Họ và tên học viên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => {
                      setNewStudentName(e.target.value);
                      if (studentFormErrors.name) setStudentFormErrors({});
                    }}
                    placeholder="Ví dụ: Trần Minh Khang"
                    className={`w-full bg-[#F8F5ED] border rounded-xl px-3.5 py-2.5 outline-none transition ${
                      studentFormErrors.name ? "border-red-500 bg-red-50/30" : "border-[#E5DEC9] focus:border-[#204434]"
                    }`}
                  />
                  {studentFormErrors.name && (
                    <p className="text-[11px] text-red-600 mt-1">{studentFormErrors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#204434] mb-1">
                      Tên đăng nhập <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newStudentUsername}
                      onChange={(e) => {
                        setNewStudentUsername(e.target.value);
                        if (studentFormErrors.username) setStudentFormErrors({});
                      }}
                      placeholder="minhkhang2026"
                      className={`w-full bg-[#F8F5ED] border rounded-xl px-3.5 py-2 outline-none transition ${
                        studentFormErrors.username
                          ? "border-red-500 bg-red-50/30"
                          : "border-[#E5DEC9] focus:border-[#204434]"
                      }`}
                    />
                    {studentFormErrors.username && (
                      <p className="text-[11px] text-red-600 mt-1">{studentFormErrors.username}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold text-[#204434] mb-1">Mật khẩu tạm</label>
                    <input
                      type="text"
                      value={newStudentPassword}
                      onChange={(e) => setNewStudentPassword(e.target.value)}
                      className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl px-3.5 py-2 outline-none focus:border-[#204434]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddStudentModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48] text-xs font-semibold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleIssueStudent}
                    className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-2xs cursor-pointer"
                  >
                    Tạo tài khoản & Cấp quyền
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 5: XEM KẾT QUẢ BÀI TẬP (SPEC SECTION 8) */}
      {/* ======================================================================= */}
      {selectedAssignmentForView && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div>
                <span className="text-[10px] text-[#BC9B6B] font-bold uppercase">{selectedAssignmentForView.className}</span>
                <h3 className="font-serif font-bold text-base text-[#204434]">
                  Kết quả bài tập: {selectedAssignmentForView.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssignmentForView(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-[#315E48] bg-[#F8F5ED] p-3 rounded-2xl border border-[#E5DEC9]">
              <span>📊 Đã nộp: <strong>{selectedAssignmentForView.submittedCount}/{selectedAssignmentForView.totalStudents} học sinh</strong></span>
              <span>⏰ Hạn nộp: <strong>{selectedAssignmentForView.dueAt}</strong></span>
              <button
                onClick={() => showToast("Đã gia hạn thêm 48 giờ cho học sinh chưa nộp!")}
                className="px-2.5 py-1 rounded-lg bg-[#204434] text-white text-[11px] font-semibold"
              >
                Gia hạn bài
              </button>
            </div>

            {/* Submissions Table */}
            <div className="max-h-72 overflow-y-auto rounded-2xl border border-[#E5DEC9]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8F5ED] text-[#315E48] font-semibold text-[11px] sticky top-0">
                    <th className="py-2.5 px-3">Học sinh</th>
                    <th className="py-2.5 px-3">Thời gian nộp</th>
                    <th className="py-2.5 px-3">Điểm số</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DEC9]/60">
                  {[
                    { name: "Trần Minh Khang", time: "20/10 14:20", score: "9.5 / 10", status: "Đúng hạn" },
                    { name: "Nguyễn Lê Bảo Hân", time: "20/10 15:10", score: "8.5 / 10", status: "Đúng hạn" },
                    { name: "Hoàng Gia Huy", time: "20/10 16:45", score: "9.0 / 10", status: "Đúng hạn" },
                    { name: "Lê Hoàng Nam", time: "20/10 18:02", score: "6.0 / 10", status: "Nộp muộn" },
                    { name: "Trần Minh Anh", time: "Chưa nộp", score: "—", status: "Chưa nộp" },
                  ].map((sub, idx) => (
                    <tr key={idx} className="hover:bg-[#F8F5ED]/40 transition">
                      <td className="py-2.5 px-3 font-semibold text-[#204434]">{sub.name}</td>
                      <td className="py-2.5 px-3 text-[#315E48]">{sub.time}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-800">{sub.score}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.status === "Chưa nộp"
                              ? "bg-red-100 text-red-800"
                              : sub.status === "Nộp muộn"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAssignmentForView(null)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-xs font-semibold text-[#204434]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 6: HỌC SINH CẦN HỖ TRỢ & GIAO BÀI ÔN BỔ TRỢ (SPEC SECTION 11) */}
      {/* ======================================================================= */}
      {selectedStudentForSupport && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#9D493E]" />
                <h3 className="font-serif font-bold text-base text-[#204434]">Chẩn đoán sư phạm học sinh</h3>
              </div>
              <button
                onClick={() => setSelectedStudentForSupport(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8F5ED] border border-[#E5DEC9]">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-[#BC9B6B]/40 relative shrink-0">
                  <Image
                    src={selectedStudentForSupport.avatar}
                    alt={selectedStudentForSupport.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#204434]">{selectedStudentForSupport.name}</h4>
                  <span className="text-[11px] text-[#315E48]">{selectedStudentForSupport.className}</span>
                  <div className="text-[10px] text-[#9D493E] font-bold mt-0.5">
                    ⚠️ {selectedStudentForSupport.reason}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#204434] mb-1">Chi tiết phân tích lỗi sai:</label>
                <p className="p-3 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48] leading-relaxed">
                  {selectedStudentForSupport.detail}
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#204434] mb-1">Đề xuất bài ôn bổ trợ riêng:</label>
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-900 leading-relaxed font-medium">
                  {selectedStudentForSupport.recommendedPractice}
                </div>
              </div>

              {assignedRemedialNotice && (
                <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Đã giao bài ôn bổ trợ thành công đến hòm thư học viên!</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedStudentForSupport(null)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48] text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setAssignedRemedialNotice(true);
                  showToast(`Đã giao bài ôn bổ trợ riêng cho em ${selectedStudentForSupport.name}!`);
                  setTimeout(() => {
                    setSelectedStudentForSupport(null);
                  }, 1800);
                }}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Giao bài ôn bổ trợ riêng</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 7: TẠO CÂU HỎI MỚI VÀO KHO */}
      {/* ======================================================================= */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#204434]" />
                <h3 className="font-serif font-bold text-base text-[#204434]">Soạn câu hỏi mới vào kho</h3>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-[#204434] mb-1">Dạng câu hỏi</label>
                  <select
                    value={newQType}
                    onChange={(e) => setNewQType(e.target.value as any)}
                    className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl px-2.5 py-2 outline-none"
                  >
                    <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                    <option value="FILL_BLANK">Điền từ</option>
                    <option value="REORDER">Sắp xếp câu</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#204434] mb-1">Cấp độ HSK</label>
                  <select
                    value={newQHsk}
                    onChange={(e) => setNewQHsk(Number(e.target.value))}
                    className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl px-2.5 py-2 outline-none"
                  >
                    <option value={1}>HSK 1</option>
                    <option value={2}>HSK 2</option>
                    <option value={3}>HSK 3</option>
                    <option value={4}>HSK 4</option>
                    <option value={5}>HSK 5</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#204434] mb-1">Kỹ năng</label>
                  <select
                    value={newQSkill}
                    onChange={(e) => setNewQSkill(e.target.value as any)}
                    className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl px-2.5 py-2 outline-none"
                  >
                    <option value="GRAMMAR">Ngữ pháp</option>
                    <option value="VOCABULARY">Từ vựng</option>
                    <option value="READING">Đọc hiểu</option>
                    <option value="LISTENING">Nghe hiểu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#204434] mb-1">
                  Nội dung câu hỏi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={newQContent}
                  onChange={(e) => {
                    setNewQContent(e.target.value);
                    if (questionErrors.content) setQuestionErrors({});
                  }}
                  placeholder="Ví dụ: 请把这本中文书_____到图书馆。(Hãy mang cuốn sách tiếng Trung này đến thư viện)"
                  className={`w-full bg-[#F8F5ED] border rounded-xl p-3 outline-none ${
                    questionErrors.content ? "border-red-500 bg-red-50/30" : "border-[#E5DEC9] focus:border-[#204434]"
                  }`}
                />
                {questionErrors.content && (
                  <p className="text-[11px] text-red-600 mt-1">{questionErrors.content}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#204434] mb-1">
                  Đáp án chính xác <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newQCorrect}
                  onChange={(e) => {
                    setNewQCorrect(e.target.value);
                    if (questionErrors.correct) setQuestionErrors({});
                  }}
                  placeholder="Ví dụ: 送 / 还 (hoặc A nếu trắc nghiệm)"
                  className={`w-full bg-[#F8F5ED] border rounded-xl px-3.5 py-2 outline-none ${
                    questionErrors.correct ? "border-red-500 bg-red-50/30" : "border-[#E5DEC9] focus:border-[#204434]"
                  }`}
                />
                {questionErrors.correct && (
                  <p className="text-[11px] text-red-600 mt-1">{questionErrors.correct}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#204434] mb-1">Giải thích đáp án</label>
                <textarea
                  rows={2}
                  value={newQExpl}
                  onChange={(e) => setNewQExpl(e.target.value)}
                  placeholder="Giải thích vì sao chọn đáp án này để học viên xem sau khi nộp bài..."
                  className="w-full bg-[#F8F5ED] border border-[#E5DEC9] rounded-xl p-2.5 outline-none focus:border-[#204434]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48] text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Lưu vào kho câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
