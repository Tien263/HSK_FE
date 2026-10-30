"use client";

import { useEffect, useState, useMemo } from "react";
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
  User,
  Phone,
  Mail,
  Shield,
  Key,
  Menu,
  PenTool,
  Camera,
  Moon,
} from "lucide-react";
import CloudinaryUpload from "@/components/common/CloudinaryUploadButton";
import AvatarUpload from "@/components/common/AvatarUpload";
import StudentClassesWorkspace from "@/components/student/StudentClassesWorkspace";
import StudentAssignmentsWorkspace from "@/components/student/StudentAssignmentsWorkspace";
import StudentRoadmapWorkspace from "@/components/student/StudentRoadmapWorkspace";
import StudentLessonsWorkspace from "@/components/student/StudentLessonsWorkspace";
import StudentPracticeWorkspace from "@/components/student/StudentPracticeWorkspace";
import StudentReportsWorkspace from "@/components/student/StudentReportsWorkspace";
import DailyQuestsModal from "@/components/student/DailyQuestsModal";
import VocabNotebookModal from "@/components/student/VocabNotebookModal";
import MistakeNotebookModal from "@/components/student/MistakeNotebookModal";
import HskRadarAnalyticsModal from "@/components/student/HskRadarAnalyticsModal";
import AncientScrollPathway from "@/components/student/AncientScrollPathway";
import AncientStationeryNotesModal from "@/components/student/AncientStationeryNotesModal";
import VirtualStudyRoomModal from "@/components/student/VirtualStudyRoomModal";
import { getLessonsByHskLevel } from "@/lib/hsk-lessons-resolver";
import { getClassArtwork } from "@/lib/class-helper";
import {
  getWeeklyStudySeconds,
  getTodayStudyMinutes,
  getWeeklyStudyBarStats,
  formatStudyTimeVi,
} from "@/lib/memory-review-service";

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
  currentHskLevel?: number;
  dailyTime: 15 | 30 | 60;
}

export default function StudentHomePage() {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [activeNav, setActiveNav] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [practiceSubMode, setPracticeSubMode] = useState<"vocab" | "grammar" | "game" | "saved" | "wrong">("vocab");
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
  const [showDailyQuestsModal, setShowDailyQuestsModal] = useState(false);
  const [showVocabNotebookModal, setShowVocabNotebookModal] = useState(false);
  const [showMistakeNotebookModal, setShowMistakeNotebookModal] = useState(false);
  const [showHskRadarModal, setShowHskRadarModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const activeClass = useMemo(() => {
    return myClasses.find((c) => c.id === selectedClassId) || myClasses[0] || null;
  }, [myClasses, selectedClassId]);
  const activeHskLevel = activeClass
    ? activeClass.level || 1
    : studyProfile?.currentHskLevel || currentUser?.currentHskLevel || 1;

  // Trạng thái Lộ trình Tự học Cổ Phong & Modals
  const [selfStudyHskLevel, setSelfStudyHskLevel] = useState<number>(1);
  const [selectedScrollLesson, setSelectedScrollLesson] = useState<number>(1);
  const [selfUnlockedLessons, setSelfUnlockedLessons] = useState<number[]>([1, 2]);
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [showStudyRoomModal, setShowStudyRoomModal] = useState<boolean>(false);

  // Đồng bộ cấp độ HSK tự học từ profile hoặc activeHskLevel
  useEffect(() => {
    if (activeHskLevel) {
      setSelfStudyHskLevel(activeHskLevel);
    }
  }, [activeHskLevel]);

  // Load danh sách bài tự học đã mở khóa từ storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`hsk_self_unlocked_lvl_${selfStudyHskLevel}_${currentUser?.id || "guest"}`);
        if (stored) {
          setSelfUnlockedLessons(JSON.parse(stored));
        } else {
          setSelfUnlockedLessons([1, 2]);
        }
      } catch {}
    }
  }, [selfStudyHskLevel, currentUser?.id]);

  const selfStudyLessons = useMemo(() => {
    return getLessonsByHskLevel(selfStudyHskLevel);
  }, [selfStudyHskLevel]);

  const currentSelfStudyLesson = useMemo(() => {
    return (
      selfStudyLessons.find((l) => l.number === selectedScrollLesson) ||
      selfStudyLessons[0] || {
        id: "hsk1-l1",
        number: 1,
        titleZh: "你好",
        pinyin: "nǐ hǎo",
        titleVi: "Xin chào",
      }
    );
  }, [selfStudyLessons, selectedScrollLesson]);

  const [todayStudyMins, setTodayStudyMins] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const notifRaw = localStorage.getItem("hanyu_student_notifications");
        if (notifRaw) {
          const list = JSON.parse(notifRaw);
          if (Array.isArray(list) && list.length > 0) {
            setNotifications(list);
            setHasUnreadNotification(true);
            return;
          }
        }
      } catch (e) {}
    }
    setNotifications([]);
    setHasUnreadNotification(false);
  }, []);

  // Detailed Profile & Settings State
  const [settingsTab, setSettingsTab] = useState<"profile" | "learning" | "security">("profile");
  const [profileForm, setProfileForm] = useState({
    name: "",
    chineseName: "",
    avatar: "",
    phone: "",
    email: "",
    birthday: "",
    gender: "female",
    bio: "",
    targetHsk: 1,
    dailyTime: 30,
    notificationEnabled: true,
  });
  const [securityForm, setSecurityForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [saveErrorMsg, setSaveErrorMsg] = useState("");

  const handleOpenSettings = () => {
    setProfileForm({
      name: currentUser?.name || studentName || "",
      chineseName: currentUser?.chineseName || "李小雨 (Lý Tiểu Vũ)",
      avatar: currentUser?.avatar || "/theme/avatar-student.jpg",
      phone: currentUser?.phone || "0987654321",
      email: currentUser?.email || userEmail || "student@hanyu.edu.vn",
      birthday: currentUser?.birthday || "2002-05-18",
      gender: currentUser?.gender || "female",
      bio: currentUser?.bio || "Học viên HSK 1 - Quyết tâm thi đỗ HSK 3 trong 6 tháng tới!",
      targetHsk: currentUser?.targetHsk || 1,
      dailyTime: editingDailyTime || 30,
      notificationEnabled: currentUser?.notificationEnabled ?? true,
    });
    setSecurityForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setSaveSuccessMsg("");
    setShowSettingsModal(true);
  };

  const handleSaveProfile = async () => {
    const updated = {
      ...currentUser,
      name: profileForm.name,
      chineseName: profileForm.chineseName,
      avatar: profileForm.avatar,
      phone: profileForm.phone,
      email: profileForm.email,
      birthday: profileForm.birthday,
      gender: profileForm.gender,
      bio: profileForm.bio,
      targetHsk: profileForm.targetHsk,
      notificationEnabled: profileForm.notificationEnabled,
    };
    setCurrentUser(updated);
    setStudentName(profileForm.name);
    setUserEmail(profileForm.email);
    setEditingDailyTime(profileForm.dailyTime as any);

    // Lưu vào máy chủ nếu có kết nối
    try {
      await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email,
          avatar: profileForm.avatar,
        }),
      });
    } catch (err) {
      console.warn("Save remote profile note:", err);
    }

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("currentUser", JSON.stringify(updated));
        const prof = localStorage.getItem("hanyu_study_profile");
        const profObj = prof ? JSON.parse(prof) : {};
        profObj.dailyTime = profileForm.dailyTime;
        profObj.targetHsk = profileForm.targetHsk;
        profObj.avatar = profileForm.avatar;
        localStorage.setItem("hanyu_study_profile", JSON.stringify(profObj));
      }
    } catch (e) {
      console.error(e);
    }
    setSaveSuccessMsg("Đã lưu hồ sơ và cài đặt thành công!");
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveErrorMsg("");
    setSaveSuccessMsg("");
    if (!securityForm.newPassword || securityForm.newPassword.length < 6) {
      setSaveErrorMsg("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSaveErrorMsg("Mật khẩu xác nhận không khớp!");
      return;
    }
    setSaveSuccessMsg("Đổi mật khẩu thành công!");
    setSecurityForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

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
    let currentU = "";
    const load=async()=>{try{const response=await fetch("/api/v1/auth/session",{cache:"no-store"});const session=await response.json();if(!response.ok||session.user?.role!=="STUDENT"){router.replace("/login");return;}const u=session.user;currentU=u.username;setCurrentUser(u);setUsername(u.username);setStudentName(u.name);localStorage.setItem("currentUser",JSON.stringify(u));await fetchMyClasses(u.id);
      const profileStored = localStorage.getItem("hanyu_study_profile");
      if (profileStored) {
        try {
          const parsed = JSON.parse(profileStored);
          setStudyProfile(parsed);
          setEditingTrack(parsed.mainTrack || "hsk");
          setEditingMajor(parsed.major || "Kinh tế & Quản trị");
          setEditingLevel(parsed.currentLevel || "beginner");
          setEditingDailyTime(parsed.dailyTime || 30);
        } catch {}
      } else {
        const fallbackProfile: StudyProfile = {
          learningMode: "SELF",
          mainTrack: "hsk",
          currentLevel: "beginner",
          dailyTime: 30,
        };
        setStudyProfile(fallbackProfile);
        localStorage.setItem("hanyu_study_profile", JSON.stringify(fallbackProfile));
      }

      // Check URL query param for tab & practice mode
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get("tab");
        if (tab && ["home", "roadmap", "lessons", "classes", "assignments", "practice", "results"].includes(tab)) {
          setActiveNav(tab);
        }
        const mode = urlParams.get("mode");
        if (mode && ["vocab", "grammar", "game", "saved", "wrong"].includes(mode)) {
          setPracticeSubMode(mode as any);
        }
        const hskParam = urlParams.get("hsk");
        if (hskParam) {
          const lvl = parseInt(hskParam, 10);
          if (lvl >= 1 && lvl <= 6) {
            setStudyProfile((prev) => (prev ? { ...prev, currentHskLevel: lvl } : null));
          }
        }
        setTodayStudyMins(getTodayStudyMinutes(currentU));
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
    };void load();
  }, []);

  // Real-time polling (10s) to keep class enrollments, progress, and assignments updated live
  useEffect(() => {
    if (!currentUser?.id && !username) return;
    const interval = setInterval(() => {
      if (currentUser?.id) {
        fetchMyClasses(currentUser.id);
      }
      const uName = currentUser?.username || username || "student";
      fetch(`/api/v1/my/summary?username=${encodeURIComponent(uName)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setData(json.data);
          }
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [currentUser?.id, currentUser?.username, username]);

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
      const enrollResponse=await fetch("/api/v1/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          username: currentUser?.username || username || "student",
          classCode: verifiedJoinClass.code,
          classId: verifiedJoinClass.id,
          learningMode: "CLASS",
          mainTrack: studyProfile?.mainTrack || "hsk",
          dailyTime: studyProfile?.dailyTime || 30,
        }),
      });

      const enrollData=await enrollResponse.json();if(!enrollResponse.ok||!enrollData.success)throw new Error(enrollData.message||"Không thể tham gia lớp.");
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

      // Tải lại danh sách lớp thực tế từ cơ sở dữ liệu
      if (currentUser?.id) {
        await fetchMyClasses(currentUser.id);
      }

      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          hasEnrolledClasses: true,
          currentHskLevel: verifiedJoinClass.level || 1,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      }


      if (currentUser?.id) fetchMyClasses(currentUser.id);

      fetch(`/api/v1/my/summary?username=${username}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.success && j.data) setData(j.data);
        });

      setEnrolling(false);
      setShowJoinModal(false);
      alert(`Đã gửi yêu cầu tham gia lớp "${verifiedJoinClass.name}" tới cô giáo! Vui lòng chờ cô duyệt nhé.`);
      setVerifiedJoinClass(null);
      setJoinClassCode("");
    } catch (e) {
      setEnrolling(false);
      setJoinClassError("Không thể ghi danh vào lớp. Vui lòng thử lại.");
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
  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout",{method:"POST"});
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
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-xs lg:hidden cursor-pointer"
          aria-label="Đóng menu"
        />
      )}

      {/* ========================================================================= */}
      {/* 1. SIDEBAR TRÁI (CÓ PHONG CẢNH THỦY MẶC DƯỚI THANH MENU) */}
      {/* ========================================================================= */}
      <aside
        data-dictionary-exclusion="sidebar"
        className={`fixed inset-y-0 left-0 w-60 bg-[#F8F5ED] border-r border-[#E5DEC9] z-50 flex flex-col justify-between shadow-xl lg:shadow-xs overflow-hidden transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Background Image: phong_cảnh_thủy_mặc_giữa_sương_mờ.png spanning full sidebar */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none z-0 bg-bottom bg-no-repeat bg-cover opacity-85 mix-blend-multiply transition-opacity duration-300"
          style={{ backgroundImage: `url('/theme/dashboard/sidebar-bg.webp')` }}
        />

        {/* Content Container (z-10 ensures no text or buttons are covered) */}
        <div className="relative z-10 flex flex-col flex-1">
          {/* Logo Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between">
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

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-xl hover:bg-black/5 text-[#315E48] cursor-pointer"
              aria-label="Đóng menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="px-3 py-2 space-y-0.5 text-xs font-medium">
            {/* 1. Trang chủ */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("home");
                setMobileMenuOpen(false);
              }}
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
              onClick={() => {
                setActiveNav("roadmap");
                setMobileMenuOpen(false);
              }}
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
              onClick={() => {
                setActiveNav("lessons");
                setMobileMenuOpen(false);
              }}
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
              onClick={() => {
                setActiveNav("classes");
                setMobileMenuOpen(false);
              }}
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
              onClick={() => {
                setActiveNav("assignments");
                setMobileMenuOpen(false);
              }}
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
                onClick={() => {
                  setActiveNav("practice");
                  setMobileMenuOpen(false);
                }}
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
                <button
                  type="button"
                  onClick={() => {
                    setActiveNav("practice");
                    setPracticeSubMode("vocab");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left block py-1 transition hover:translate-x-0.5 cursor-pointer ${
                    activeNav === "practice" && practiceSubMode === "vocab"
                      ? "text-[#204434] font-bold"
                      : "hover:text-[#204434]"
                  }`}
                >
                  Luyện từ vựng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveNav("practice");
                    setPracticeSubMode("grammar");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left block py-1 transition hover:translate-x-0.5 cursor-pointer ${
                    activeNav === "practice" && practiceSubMode === "grammar"
                      ? "text-[#204434] font-bold"
                      : "hover:text-[#204434]"
                  }`}
                >
                  Luyện ngữ pháp
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveNav("practice");
                    setPracticeSubMode("game");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left block py-1 transition hover:translate-x-0.5 cursor-pointer ${
                    activeNav === "practice" && practiceSubMode === "game"
                      ? "text-[#204434] font-bold"
                      : "hover:text-[#204434]"
                  }`}
                >
                  Game phản xạ HSK
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveNav("practice");
                    setPracticeSubMode("saved");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left block py-1 transition hover:translate-x-0.5 cursor-pointer ${
                    activeNav === "practice" && (practiceSubMode === "saved" || practiceSubMode === "wrong")
                      ? "text-[#204434] font-bold"
                      : "hover:text-[#204434]"
                  }`}
                >
                  Kiến thức đã lưu
                </button>
              </div>
            </div>

            {/* 7. Kết quả & Báo cáo */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("results");
                setMobileMenuOpen(false);
              }}
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
              onClick={() => {
                handleOpenSettings();
                setMobileMenuOpen(false);
              }}
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser?.avatar || profileForm.avatar || "/theme/avatar-student.jpg"}
                  alt="avatar"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="leading-tight truncate">
                <span className="font-bold text-xs text-[#204434] block truncate">
                  {studentName}
                </span>
                <span className="text-[10px] text-[#315E48] block">
                  HSK {data?.student?.currentHskLevel ?? currentUser?.currentHskLevel ?? "—"} · {data?.student?.totalXp ?? "—"} XP
                </span>
              </div>
            </div>
            <button
              onClick={handleOpenSettings}
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
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 bg-[#F8F5ED]/90 backdrop-blur-md border-b border-[#E5DEC9]">
          {/* Hamburger button on mobile + Search bar */}
          <div className="flex items-center gap-2.5 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] lg:hidden transition shrink-0 cursor-pointer shadow-2xs"
              aria-label="Mở menu danh mục"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#315E48] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm bài học, từ vựng, chủ đề..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] text-xs text-[#204434] placeholder:text-[#315E48]/60 focus:outline-hidden focus:border-[#204434] transition shadow-2xs"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 ml-4">
            {/* Vân Tự Tập Thất Button */}
            <button
              type="button"
              onClick={() => setShowStudyRoomModal(true)}
              className="px-3 py-1.5 rounded-full bg-[#204434] hover:bg-[#183629] text-[#BC9B6B] text-xs font-bold shadow-2xs flex items-center gap-1.5 transition cursor-pointer border border-[#BC9B6B]/40"
              title="Vân Tự Tập Thất - Phòng tự học ảo cổ phong Pomodoro 25p"
            >
              <Moon className="w-3.5 h-3.5 text-[#BC9B6B]" />
              <span className="hidden md:inline">🏮 Vân Tự Tập Thất</span>
              <span className="md:hidden">🏮</span>
            </button>

            {/* Bút Giấy Cổ Button */}
            <button
              type="button"
              onClick={() => setShowNotesModal(true)}
              className="px-3 py-1.5 rounded-full bg-[#FAF7F0] hover:bg-white text-[#204434] text-xs font-bold shadow-2xs flex items-center gap-1.5 transition cursor-pointer border border-[#BC9B6B]"
              title="Thư phòng ghi chú 4 loại giấy & bút lông cổ phong"
            >
              <PenTool className="w-3.5 h-3.5 text-[#8F6D3B]" />
              <span className="hidden md:inline">📜 Bút Giấy Cổ</span>
              <span className="md:hidden">📜</span>
            </button>

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
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#8ea394]">
                        <Bell className="w-7 h-7 mx-auto mb-2 text-[#8ea394]/40" />
                        <p className="font-semibold text-[#315E48]">Chưa có thông báo mới nào</p>
                        <p className="text-[11px] text-[#8ea394] mt-0.5">
                          Khi giáo viên giao bài tập hoặc có lịch học mới, thông báo sẽ hiển thị tại đây.
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setShowNotifications(false);
                            setActiveNav(n.type === "CLASS" ? "classes" : "assignments");
                          }}
                          className="pt-2 first:pt-0 p-2 rounded-xl hover:bg-[#FAF7F0] transition cursor-pointer flex items-start gap-2.5"
                        >
                          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                            {n.type === "CLASS" ? (
                              <Clock className="w-4 h-4" />
                            ) : n.type === "GRADE" ? (
                              <Award className="w-4 h-4" />
                            ) : (
                              <FileCheck2 className="w-4 h-4" />
                            )}
                          </div>
                          <div className="text-xs">
                            <p className="font-bold text-[#204434]">{n.title}</p>
                            <p className="text-[11px] text-[#315E48] mt-0.5">{n.content}</p>
                            <span className="text-[10px] text-[#8F6D3B] font-mono mt-1 block">
                              {n.time || "Vừa xong"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
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

            {/* Multi-Class Switcher (Đặc tả V2 Phần III & IV) */}
            {myClasses.length > 1 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs">
                <span className="text-[11px] font-medium text-[#315E48] hidden md:inline">Lớp đang học:</span>
                <select
                  value={selectedClassId || activeClass?.id || ""}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#204434] focus:outline-hidden cursor-pointer"
                >
                  {myClasses.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name} (HSK {cl.level || 1})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Student User Pill */}
            <button
              type="button"
              onClick={() => setShowGoalModal(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#FFFCF6] border border-[#E5DEC9] hover:border-[#204434]/40 transition shadow-2xs cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-[#204434]/10 border border-[#BC9B6B]/30 relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser?.avatar || profileForm.avatar || "/theme/avatar-student.jpg"}
                  alt="Avatar"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="leading-tight hidden sm:block">
                <div className="text-xs font-bold text-[#204434]">
                  Xin chào, {studentName}
                </div>
                <div className="text-[10px] text-[#315E48]">
                  HSK {activeHskLevel} · {studyProfile?.dailyTime || 30} phút/ngày
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
              onNavigateToTab={(tab) => setActiveNav(tab)}
            />
          ) : activeNav === "assignments" ? (
            <StudentAssignmentsWorkspace
              currentUser={currentUser}
              onNavigateToTab={(tab) => setActiveNav(tab)}
              classesCount={myClasses.length}
              myClasses={myClasses}
              onOpenJoinModal={() => setShowJoinModal(true)}
            />
          ) : activeNav === "roadmap" ? (
            <StudentRoadmapWorkspace
              currentUser={currentUser}
              onNavigateToTab={(tab) => setActiveNav(tab)}
              classesCount={myClasses.length}
              myClasses={myClasses}
              onOpenJoinModal={() => setShowJoinModal(true)}
              activeHskLevel={activeHskLevel}
            />
          ) : activeNav === "lessons" ? (
            <StudentLessonsWorkspace
              currentUser={currentUser}
              onNavigateToTab={(tab) => setActiveNav(tab)}
              classesCount={myClasses.length}
              myClasses={myClasses}
              onOpenJoinModal={() => setShowJoinModal(true)}
              activeHskLevel={activeHskLevel}
            />
          ) : activeNav === "practice" ? (
            <StudentPracticeWorkspace
              currentUser={currentUser}
              onNavigateToTab={(tab) => setActiveNav(tab)}
              classesCount={myClasses.length}
              myClasses={myClasses}
              onOpenJoinModal={() => setShowJoinModal(true)}
              activeHskLevel={activeHskLevel}
              initialPracticeMode={practiceSubMode}
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
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setActiveNav("lessons")}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] text-xs font-semibold shadow-md shadow-[#204434]/15 transition cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4 text-[#BC9B6B]" />
                          <span>Vào học ngay Bài {selectedScrollLesson} →</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveNav("practice")}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF7F0] hover:bg-white text-[#204434] border border-[#BC9B6B]/60 text-xs font-semibold shadow-2xs transition cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-[#8F6D3B]" />
                          <span>Luyện phản xạ HSK</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowJoinModal(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-[#315E48] hover:text-[#204434] hover:underline text-xs font-medium cursor-pointer"
                        >
                          <span>+ Nhập mã lớp (nếu có)</span>
                        </button>
                      </div>
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
                        : `Tự học HSK ${activeHskLevel}`}
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
                      {myClasses.length > 0 ? `Lớp ${myClasses[0]?.name}` : `Chinh phục HSK ${activeHskLevel}`}
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
                      {studyProfile?.dailyTime || 30} phút / ngày
                    </div>
                  </div>
                </div>

                {/* 4. Chuỗi học tập */}
                <div
                  onClick={() => setShowDailyQuestsModal(true)}
                  className="p-3.5 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs flex items-center gap-3 cursor-pointer hover:border-orange-400 transition"
                  title="Bấm để xem nhiệm vụ nhận XP hôm nay"
                >
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

              {/* ĐÁNH GIÁ, KHEN NGỢI & CẢNH BÁO THỜI GIAN HỌC MỖI NGÀY */}
              {(() => {
                const targetMins = studyProfile?.dailyTime || 30;
                const isGoalMet = todayStudyMins >= targetMins;
                const remaining = Math.max(0, targetMins - todayStudyMins);

                return isGoalMet ? (
                  <section className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#204434]/10 via-[#BC9B6B]/15 to-[#204434]/10 border border-[#BC9B6B]/45 shadow-xs flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#204434] text-[#FFFCF6] flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                        🌟
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif font-bold text-sm text-[#204434]">
                            Vinh danh: Đã hoàn thành xuất sắc mục tiêu hôm nay!
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#204434] text-[#FFFCF6] text-[10px] font-bold">
                            {todayStudyMins} / {targetMins} phút · +50 XP
                          </span>
                        </div>
                        <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                          Tuyệt vời! Bạn đã giữ trọn kỷ luật học tập hôm nay, kiến thức được củng cố vào trí nhớ dài hạn.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveNav("practice")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      <span>Vào phòng luyện tập thêm</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </section>
                ) : (
                  <section className="p-4 sm:p-5 rounded-3xl bg-[#FAF7F0] border border-[#BC9B6B]/35 shadow-xs flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#9D493E]/10 text-[#9D493E] flex items-center justify-center font-bold text-xl shrink-0">
                        ⏰
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif font-bold text-sm text-[#204434]">
                            Nhắc nhở học tập: Bạn đã học {todayStudyMins} / {targetMins} phút hôm nay
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#9D493E]/15 text-[#9D493E] text-[10px] font-bold">
                            Còn thiếu {remaining} phút
                          </span>
                        </div>
                        <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                          Hãy dành thêm {remaining} phút nữa để đạt chỉ tiêu chuyên cần ngày hôm nay và bảo toàn ngọn lửa chuỗi học tập nhé!
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveNav("practice")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
                      <span>Học ngay để đạt mục tiêu &rarr;</span>
                    </button>
                  </section>
                );
              })()}

              {/* QUICK ACTIONS BAR: NHIỆM VỤ, SỔ TỪ VỰNG SRS, SỔ CÂU SAI, RADAR NĂNG LỰC */}
              <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setShowDailyQuestsModal(true)}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 hover:border-amber-500 hover:shadow-sm text-left transition group cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                      <span>🔥 Nhiệm vụ & Streak</span>
                    </div>
                    <div className="text-xs text-amber-900 font-semibold mt-0.5">Nhận XP hàng ngày</div>
                  </div>
                  <span className="text-base group-hover:scale-110 transition">🎁</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowVocabNotebookModal(true)}
                  className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-300 hover:border-teal-500 hover:shadow-sm text-left transition group cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-[11px] font-bold text-teal-800 flex items-center gap-1">
                      <span>📖 Sổ từ vựng SRS</span>
                    </div>
                    <div className="text-xs text-teal-900 font-semibold mt-0.5">Leitner 5 Hộp nhớ lâu</div>
                  </div>
                  <span className="text-base group-hover:scale-110 transition">🗂️</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMistakeNotebookModal(true)}
                  className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-300 hover:border-rose-500 hover:shadow-sm text-left transition group cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
                      <span>🎯 Sổ câu sai</span>
                    </div>
                    <div className="text-xs text-rose-900 font-semibold mt-0.5">Gỡ điểm yếu thi cử</div>
                  </div>
                  <span className="text-base group-hover:scale-110 transition">⚡</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowHskRadarModal(true)}
                  className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-300 hover:border-indigo-500 hover:shadow-sm text-left transition group cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-[11px] font-bold text-indigo-800 flex items-center gap-1">
                      <span>📊 Radar 5 Kỹ năng</span>
                    </div>
                    <div className="text-xs text-indigo-900 font-semibold mt-0.5">Dự đoán tỷ lệ đỗ HSK</div>
                  </div>
                  <span className="text-base group-hover:scale-110 transition">📈</span>
                </button>
              </section>

              {/* PHÂN NHÁNH GIAO DIỆN CHÍNH: TỰ HỌC CHỦ ĐỘNG (CHƯA VÀO LỚP) VS ĐÃ VÀO LỚP */}
              {myClasses.length === 0 ? (
                /* ========================================================================= */
                /* LỘ TRÌNH TỰ HỌC CHỦ ĐỘNG HSK 3.0 CỔ PHONG (100% MỞ TỰ DO, KHÔNG CẦN LỚP) */
                /* ========================================================================= */
                <div className="space-y-6 animate-fadeIn">
                  {/* 1. THANH CHỌN CẤP ĐỘ HSK 1 - 6 */}
                  <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-[#8F6D3B]" />
                        <span>Cấp độ HSK tự học:</span>
                      </span>
                      {[1, 2, 3, 4, 5, 6].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => {
                            setSelfStudyHskLevel(lvl);
                            setSelectedScrollLesson(1);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            selfStudyHskLevel === lvl
                              ? "bg-[#204434] text-white shadow-xs"
                              : "bg-[#FAF7F0] hover:bg-[#F0EBE1] text-[#315E48]"
                          }`}
                        >
                          HSK {lvl}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#8F6D3B] bg-[#BC9B6B]/15 px-3 py-1 rounded-full">
                        {selfStudyLessons.length} bài học chuẩn Hanban CTI
                      </span>
                    </div>
                  </div>

                  {/* 2. BĂNG THƯ CUỘN CHIẾU CHỈ SƠN HÀ (IMPERIAL SCROLL PATHWAY) */}
                  <AncientScrollPathway
                    lessons={selfStudyLessons}
                    selectedLesson={selectedScrollLesson}
                    unlockedLessons={selfUnlockedLessons}
                    onSelectLesson={(num) => {
                      setSelectedScrollLesson(num);
                    }}
                    hskLevel={selfStudyHskLevel}
                  />

                  {/* 3. CARD SONG SONG: BÀI HỌC ĐANG HỌC + KẾ HOẠCH TỰ HỌC HÔM NAY */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CARD 1: BÀI HỌC TỰ HỌC HIỆN TẠI */}
                    <section className="bg-[#FFFCF6] rounded-3xl p-5 border border-[#BC9B6B]/60 shadow-2xs flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#204434] text-[#BC9B6B]">
                            HSK {selfStudyHskLevel} · Bài {currentSelfStudyLesson.number}
                          </span>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            Mở tự do
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl font-serif font-bold text-[#204434]">
                            {currentSelfStudyLesson.titleVi || currentSelfStudyLesson.titleZh}
                          </h3>
                          <p className="text-xs font-mono text-[#8F6D3B] mt-0.5 font-semibold">
                            {currentSelfStudyLesson.pinyin}
                          </p>
                          <p className="text-xs text-[#315E48] mt-2 leading-relaxed">
                            Bao gồm: Từ vựng chuẩn Hanban CTI, cấu trúc ngữ pháp trọng điểm, audio hội thoại Bắc Kinh, ngữ âm và văn hóa.
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#E5DEC9] flex items-center justify-between gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setActiveNav("lessons")}
                          className="px-4 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4 text-[#BC9B6B]" />
                          <span>Vào học ngay bài này →</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowNotesModal(true)}
                            className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-white text-[#204434] border border-[#BC9B6B] text-xs font-semibold shadow-2xs transition cursor-pointer"
                            title="Ghi chú bài học"
                          >
                            <PenTool className="w-4 h-4 text-[#8F6D3B]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveNav("practice")}
                            className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-white text-[#204434] border border-[#BC9B6B] text-xs font-semibold shadow-2xs transition cursor-pointer"
                            title="Luyện phản xạ bài này"
                          >
                            <Sparkles className="w-4 h-4 text-[#204434]" />
                          </button>
                        </div>
                      </div>
                    </section>

                    {/* CARD 2: KẾ HOẠCH HÔM NAY */}
                    <section className="bg-[#FFFCF6] rounded-3xl p-5 border border-[#E5DEC9] shadow-2xs flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#204434]" />
                            <h3 className="font-bold text-sm text-[#204434]">Kế hoạch tự học hôm nay</h3>
                          </div>
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            Mục tiêu: {studyProfile?.dailyTime || 30} phút / ngày
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-xs">
                            <span className="text-[#315E48]">Thời gian đã học hôm nay:</span>
                            <span className="font-bold text-[#204434]">{todayStudyMins} phút</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-xs">
                            <span className="text-[#315E48]">Chuỗi ngày chăm chỉ (Streak):</span>
                            <span className="font-bold text-amber-700">🔥 {currentUser?.streakDays || 1} ngày liên tục</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] text-xs">
                            <span className="text-[#315E48]">Trạng thái mục tiêu:</span>
                            <span className="font-semibold text-emerald-700">
                              {todayStudyMins >= (studyProfile?.dailyTime || 30) ? "Đã đạt chỉ tiêu ngày 🎉" : `Cần thêm ${Math.max(0, (studyProfile?.dailyTime || 30) - todayStudyMins)} phút`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#E5DEC9] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setActiveNav("practice")}
                          className="text-xs text-[#204434] font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>Vào phòng luyện phản xạ &rarr;</span>
                        </button>
                      </div>
                    </section>
                  </div>

                  {/* 4. KHÁM PHÁ BÀI HỌC & HỆ SINH THÁI TỰ HỌC */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#204434]" />
                        <h3 className="font-bold text-sm text-[#204434]">Kho tài nguyên học tập HSK</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveNav("lessons")}
                        className="text-xs text-[#315E48] hover:text-[#204434] flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>Xem toàn bộ 15 bài</span>
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
                            Cấp độ {selfStudyHskLevel}
                          </div>
                          <p className="text-[11px] text-[#315E48]/80 mt-1 leading-snug">
                            15 bài học chuẩn Hanban CTI với audio giọng đọc Bắc Kinh
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
                            Ôn từ vựng, flashcard, sắp xếp câu và điểm yếu
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
                            Cây kỹ năng HSK {selfStudyHskLevel}
                          </div>
                          <p className="text-[11px] text-[#315E48]/80 mt-1 leading-snug">
                            Hành trình từng bài học vượt ải thông quan
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

                  {/* 5. GHI DANH LỚP HỌC (TÙY CHỌN, KHÔNG BẮT BUỘC) */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-[#8F6D3B] shrink-0" />
                      <span className="text-[#315E48]">
                        Bạn có mã lớp từ Thầy/Cô hoặc trung tâm? Nhập mã để đồng bộ bài tập và theo dõi điểm số cùng lớp học.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowJoinModal(true)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-[#F0EBE1] text-[#204434] border border-[#BC9B6B] font-bold shrink-0 transition cursor-pointer shadow-2xs"
                    >
                      + Nhập mã tham gia lớp
                    </button>
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
                              src={activeClass?.artwork || myClasses[0]?.artwork || "/theme/card-hsk-scroll.webp"}
                              alt={activeClass?.name || myClasses[0]?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-[#BC9B6B]/20 text-[#7A5B2E] text-[10px] font-bold mb-1">
                              {activeClass?.track || myClasses[0]?.track || "HSK"} · Cấp {activeClass?.level || myClasses[0]?.level || 1}
                            </span>
                            <h4 className="font-serif font-bold text-sm text-[#204434] truncate">
                              {activeClass?.name || myClasses[0]?.name}
                            </h4>
                            <p className="text-[11px] text-[#315E48] mt-0.5 line-clamp-2 leading-relaxed">
                              GV: {activeClass?.teacherName || myClasses[0]?.teacherName} · Mã lớp: {activeClass?.code || myClasses[0]?.code}
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
                        className="text-[#204434] transition-all duration-700"
                        strokeDasharray={`${myClasses.length === 0 ? 0 : (data?.assignments?.length ? Math.round(((data?.assignments?.filter((a: any) => a.hasAttempted)?.length || 0) / data.assignments.length) * 100) : 0)}, 100`}
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center leading-none">
                      <span className="text-lg font-bold text-[#204434]">
                        {myClasses.length === 0
                          ? "0%"
                          : data?.assignments?.length
                          ? `${Math.round(((data?.assignments?.filter((a: any) => a.hasAttempted)?.length || 0) / data.assignments.length) * 100)}%`
                          : "0%"}
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
                        {myClasses.length === 0
                          ? "—"
                          : (data?.assignments?.filter((a: any) => a.hasAttempted)?.length || 0) > 0
                          ? (() => {
                              const attempted = (data?.assignments || []).filter((a: any) => a.hasAttempted && a.latestScore !== null);
                              if (attempted.length === 0) return (data?.student as any)?.accuracyRate ? `${(data?.student as any).accuracyRate}%` : "100%";
                              const avg = Math.round((attempted.reduce((s: number, a: any) => s + (a.latestScore || 0), 0) / attempted.length) * 10);
                              return `${avg}%`;
                            })()
                          : "Chưa có"}
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
                          ? "Bạn đang ở Chế độ Tự học HSK độc lập. Hãy vào phòng Luyện tập hàng ngày hoặc nhập mã lớp nếu có giáo viên."
                          : "Tuyệt vời! Bạn không có bài tập nào sắp đến hạn."}
                      </p>
                      {myClasses.length === 0 ? (
                        <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                          <button
                            type="button"
                            onClick={() => setActiveNav("practice")}
                            className="px-3.5 py-1.5 rounded-xl bg-[#204434] text-white text-[11px] font-semibold hover:bg-[#183629] transition cursor-pointer"
                          >
                            Luyện tập Tự học hôm nay &rarr;
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowJoinModal(true)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-[#BC9B6B]/40 text-[#204434] text-[11px] font-semibold hover:bg-[#F8F5ED] transition cursor-pointer"
                          >
                            Nhập mã lớp nếu có
                          </button>
                        </div>
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

                {myClasses.length === 0 && (
                  <p className="text-[11px] text-[#315E48] px-1 text-center">
                    Bạn đang ở Chế độ Tự học HSK độc lập. Nếu được giáo viên cấp mã lớp, bạn có thể tham gia bất cứ lúc nào bên dưới:
                  </p>
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

                {(() => {
                  const attemptedList = (data?.assignments || []).filter((a: any) => a.hasAttempted);
                  const completedCount = attemptedList.length;
                  
                  // Tính thời gian thực tế đã học trong tuần (động 100%)
                  const actualWeeklySec = getWeeklyStudySeconds(currentUser?.id);
                  const timeText = isMounted ? formatStudyTimeVi(actualWeeklySec) : "0 phút";

                  const scoredList = attemptedList.filter((a: any) => a.latestScore !== null).map((a: any) => a.latestScore as number);
                  const avgAccuracyText = scoredList.length > 0
                    ? `${Math.round((scoredList.reduce((acc: number, s: number) => acc + s, 0) / scoredList.length) * 10)}%`
                    : "—";

                  // Thống kê 7 ngày thực tế trong tuần (T2 -> CN)
                  const dayBars = isMounted ? getWeeklyStudyBarStats(currentUser?.id) : [
                    { day: "T2", seconds: 0, height: "4px" },
                    { day: "T3", seconds: 0, height: "4px" },
                    { day: "T4", seconds: 0, height: "4px" },
                    { day: "T5", seconds: 0, height: "4px" },
                    { day: "T6", seconds: 0, height: "4px" },
                    { day: "T7", seconds: 0, height: "4px" },
                    { day: "CN", seconds: 0, height: "4px" },
                  ];

                  return (
                    <div className="flex items-end justify-between gap-4">
                      {/* 7 Days Bar Chart */}
                      <div className="flex items-end gap-1.5 h-24 flex-1">
                        {dayBars.map((col, idx) => (
                          <div
                            key={idx}
                            className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                          >
                            <div
                              className={`w-full rounded-t-md transition-all ${col.seconds > 0 || completedCount > 0 ? "bg-[#204434] hover:bg-[#183629]" : "bg-[#E5DEC9]"}`}
                              style={{ height: col.height }}
                              title={`${col.day}: ${formatStudyTimeVi(col.seconds)}`}
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
                          <strong className="text-[#204434]">{timeText}</strong>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#315E48]">
                          <CheckCircle2 className="w-3 h-3 text-[#315E48]" />
                          <span>Bài xong:</span>
                          <strong className="text-[#204434]">{completedCount}</strong>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#315E48]">
                          <Target className="w-3 h-3 text-[#315E48]" />
                          <span>Tỷ lệ đúng:</span>
                          <strong className="text-[#204434]">{avgAccuracyText}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })()}
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
      {/* MODAL 3: HỒ SƠ & CÀI ĐẶT TOÀN DIỆN */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/50 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl relative space-y-4 max-h-[92vh] overflow-y-auto animate-scaleUp">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-5 right-5 text-[#315E48] hover:text-[#204434] p-1.5 rounded-full hover:bg-[#FAF7F0] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 pb-2 border-b border-[#E5DEC9]">
              <div className="w-10 h-10 rounded-2xl bg-[#204434] text-white flex items-center justify-center shadow-xs">
                <Settings className="w-5 h-5 text-[#BC9B6B]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#204434]">
                  Hồ sơ học viên & Cài đặt
                </h3>
                <p className="text-xs text-[#315E48]">
                  Cập nhật thông tin cá nhân, mục tiêu HSK và bảo mật tài khoản
                </p>
              </div>
            </div>

            {/* Success Alert Banner */}
            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Error Alert Banner */}
            {saveErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{saveErrorMsg}</span>
              </div>
            )}

            {/* 3 Tabs */}
            <div className="flex items-center gap-1.5 border-b border-[#E5DEC9] pb-2">
              {[
                { id: "profile", label: "Thông tin cá nhân", icon: User },
                { id: "learning", label: "Mục tiêu học tập", icon: Target },
                { id: "security", label: "Bảo mật tài khoản", icon: Shield },
              ].map((t) => {
                const TabIcon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSettingsTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      settingsTab === t.id
                        ? "bg-[#204434] text-white shadow-xs"
                        : "text-[#315E48] hover:bg-[#FAF7F0] hover:text-[#204434]"
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: THÔNG TIN CÁ NHÂN */}
            {settingsTab === "profile" && (
              <div className="space-y-4 text-xs">
                {/* 1. KHỐI ẢNH ĐẠI DIỆN HỌC VIÊN */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-2">
                  <AvatarUpload
                    value={profileForm.avatar}
                    onChange={(url) => setProfileForm({ ...profileForm, avatar: url })}
                    folder="hsk_avatars"
                    fallbackUrl="/theme/avatar-student.jpg"
                    size="md"
                    label="Ảnh đại diện (Avatar)"
                    subtext="Nhấp vào ảnh để chọn ảnh chân dung mới từ máy tính (PNG, JPG, WebP)."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#204434] mb-1">
                      Họ và tên học viên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs text-[#204434] focus:outline-hidden focus:border-[#204434]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#204434] mb-1">
                      Tên tiếng Trung (中文名)
                    </label>
                    <input
                      type="text"
                      value={profileForm.chineseName}
                      onChange={(e) => setProfileForm({ ...profileForm, chineseName: e.target.value })}
                      placeholder="李小雨 (Lǐ Xiǎoyǔ)"
                      className="w-full bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs text-[#204434] focus:outline-hidden focus:border-[#204434]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#204434] mb-1">
                      Tên đăng nhập (Username)
                    </label>
                    <input
                      type="text"
                      value={`@${username}`}
                      disabled
                      className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-xl px-3 py-2 text-xs font-mono cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#204434] mb-1">
                      Địa chỉ Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="student@example.com"
                      className="w-full bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs text-[#204434] focus:outline-hidden focus:border-[#204434]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#204434] mb-1">
                      Số điện thoại liên lạc
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="0987654321"
                      className="w-full bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs text-[#204434] focus:outline-hidden focus:border-[#204434]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#204434] mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={profileForm.birthday}
                      onChange={(e) => setProfileForm({ ...profileForm, birthday: e.target.value })}
                      className="w-full bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs text-[#204434] focus:outline-hidden focus:border-[#204434]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#204434] mb-1">
                    Giới tính
                  </label>
                  <div className="flex items-center gap-4 pt-1">
                    {[
                      { id: "female", label: "Nữ" },
                      { id: "male", label: "Nam" },
                      { id: "other", label: "Khác" },
                    ].map((g) => (
                      <label key={g.id} className="flex items-center gap-1.5 cursor-pointer text-xs text-[#315E48]">
                        <input
                          type="radio"
                          name="gender"
                          checked={profileForm.gender === g.id}
                          onChange={() => setProfileForm({ ...profileForm, gender: g.id })}
                          className="accent-[#204434]"
                        />
                        <span>{g.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#204434] mb-1">
                    Giới thiệu bản thân & Quyết tâm học tiếng Trung
                  </label>
                  <textarea
                    rows={2}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Mục tiêu của mình là đạt HSK 3 trong 6 tháng tới..."
                    className="w-full bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl p-2.5 text-xs text-[#204434] focus:outline-hidden focus:border-[#204434]"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: MỤC TIÊU HỌC TẬP */}
            {settingsTab === "learning" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#204434] mb-1.5">
                    Mục tiêu cấp độ HSK muốn đạt
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, targetHsk: lvl })}
                        className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          profileForm.targetHsk === lvl
                            ? "bg-[#204434] text-white border-[#204434]"
                            : "bg-[#FAF7F0] border-[#E5DEC9] text-[#315E48] hover:bg-white"
                        }`}
                      >
                        HSK {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#204434] mb-1.5">
                    Thời lượng học cam kết mỗi ngày
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { min: 15, label: "15 phút / ngày", desc: "Duy trì thói quen" },
                      { min: 30, label: "30 phút / ngày", desc: "Khuyên dùng chuẩn" },
                      { min: 60, label: "60 phút / ngày", desc: "Tăng tốc thi lấy bằng" },
                    ].map((item) => (
                      <div
                        key={item.min}
                        onClick={() => setProfileForm({ ...profileForm, dailyTime: item.min })}
                        className={`p-3 rounded-2xl border text-center cursor-pointer transition ${
                          profileForm.dailyTime === item.min
                            ? "bg-[#204434] text-white border-[#204434] shadow-xs"
                            : "bg-[#FAF7F0] border-[#E5DEC9] text-[#204434] hover:bg-white"
                        }`}
                      >
                        <div className="font-bold text-xs">{item.label}</div>
                        <div className={`text-[10px] mt-0.5 ${profileForm.dailyTime === item.min ? "text-emerald-200" : "text-[#315E48]"}`}>
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#204434] block">Nhận thông báo nhắc nhở</span>
                    <span className="text-[11px] text-[#315E48]">Nhắc giờ học hàng ngày và thông báo khi giáo viên giao bài tập mới</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileForm.notificationEnabled}
                    onChange={(e) => setProfileForm({ ...profileForm, notificationEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[#204434] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: BẢO MẬT & ĐỔI MẬT KHẨU */}
            {settingsTab === "security" && (
              <form onSubmit={handleSavePassword} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#204434] mb-1">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={securityForm.oldPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, oldPassword: e.target.value })}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs text-[#204434] focus:outline-hidden focus:border-[#204434]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#204434] mb-1">
                    Mật khẩu mới (tối thiểu 6 ký tự)
                  </label>
                  <input
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs text-[#204434] focus:outline-hidden focus:border-[#204434]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#204434] mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs text-[#204434] focus:outline-hidden focus:border-[#204434]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5 text-[#BC9B6B]" />
                    <span>Cập nhật mật khẩu mới</span>
                  </button>
                </div>
              </form>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-[#9D493E]/10 hover:bg-[#9D493E] text-[#9D493E] hover:text-white font-semibold transition cursor-pointer flex items-center gap-1.5 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#315E48] font-semibold hover:bg-[#FAF7F0] transition text-xs cursor-pointer"
                >
                  Đóng
                </button>

                {settingsTab !== "security" && (
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-5 py-2 rounded-xl bg-[#204434] text-white font-bold hover:bg-[#183629] transition text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
                    <span>Lưu thay đổi</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thanh điều hướng đáy màn hình dành cho Mobile (Phong cách Thủy Mặc Hanyu) */}
      <nav
        aria-label="Điều hướng nhanh trên điện thoại"
        className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-[#FAF7F0]/95 backdrop-blur-md border-t border-[#BC9B6B]/30 px-3 py-1.5 flex items-center justify-around shadow-[0_-4px_16px_rgba(32,68,52,0.06)]"
      >
        <button
          type="button"
          onClick={() => {
            setActiveNav("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition cursor-pointer ${
            activeNav === "home"
              ? "bg-[#204434] text-[#FFFCF6] font-serif shadow-xs"
              : "text-[#315E48] hover:text-[#204434]"
          }`}
        >
          <Home className="w-4.5 h-4.5 stroke-[1.9]" />
          <span className="text-[10px] mt-0.5">Trang chủ</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveNav("lessons");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition cursor-pointer ${
            activeNav === "lessons"
              ? "bg-[#204434] text-[#FFFCF6] font-serif shadow-xs"
              : "text-[#315E48] hover:text-[#204434]"
          }`}
        >
          <BookOpen className="w-4.5 h-4.5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5">Bài học</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveNav("practice");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition cursor-pointer ${
            activeNav === "practice"
              ? "bg-[#204434] text-[#FFFCF6] font-serif shadow-xs"
              : "text-[#315E48] hover:text-[#204434]"
          }`}
        >
          <PenTool className="w-4.5 h-4.5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5">Luyện tập</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveNav("assignments");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition cursor-pointer ${
            activeNav === "assignments"
              ? "bg-[#204434] text-[#FFFCF6] font-serif shadow-xs"
              : "text-[#315E48] hover:text-[#204434]"
          }`}
        >
          <FileText className="w-4.5 h-4.5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5">Bài tập</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-[#315E48] hover:text-[#204434] transition cursor-pointer"
        >
          <Menu className="w-4.5 h-4.5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5">Danh mục</span>
        </button>
      </nav>

      {/* Modal Sổ Tay Từ Vựng SRS 5 Hộp Leitner */}
      <VocabNotebookModal
        isOpen={showVocabNotebookModal}
        onClose={() => setShowVocabNotebookModal(false)}
        studentId={currentUser?.id}
        studentUsername={currentUser?.username}
      />

      {/* Modal Sổ Tay Câu Sai & Luyện Khắc Phục Điểm Yếu */}
      <MistakeNotebookModal
        isOpen={showMistakeNotebookModal}
        onClose={() => setShowMistakeNotebookModal(false)}
        studentId={currentUser?.id}
        studentUsername={currentUser?.username}
      />

      {/* Modal Nhiệm Vụ Hàng Ngày & Chuỗi Streak Ngày Học */}
      <DailyQuestsModal
        isOpen={showDailyQuestsModal}
        onClose={() => setShowDailyQuestsModal(false)}
        studentId={currentUser?.id}
        studentUsername={currentUser?.username}
        onXpClaimed={(newXp) => {
          if (currentUser) {
            setCurrentUser({ ...currentUser, totalXp: newXp });
          }
        }}
      />

      {/* Modal Radar Năng Lực 5 Kỹ Năng & Dự Đoán Tỷ Lệ Đỗ HSK */}
      <HskRadarAnalyticsModal
        isOpen={showHskRadarModal}
        onClose={() => setShowHskRadarModal(false)}
        studentId={currentUser?.id}
        studentUsername={currentUser?.username}
        onOpenSpeaking={() => {
          setActiveNav("practice");
        }}
        onOpenWriting={() => {
          setActiveNav("practice");
        }}
        onOpenVocab={() => setShowVocabNotebookModal(true)}
        onOpenMistakes={() => setShowMistakeNotebookModal(true)}
      />

      {/* Modal Bút Giấy Cổ Phong */}
      <AncientStationeryNotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        lessonNumber={selectedScrollLesson || 1}
        hskLevel={selfStudyHskLevel || 1}
        studentId={currentUser?.id}
      />

      {/* Modal Vân Tự Tập Thất */}
      <VirtualStudyRoomModal
        isOpen={showStudyRoomModal}
        onClose={() => setShowStudyRoomModal(false)}
        studentName={studentName || currentUser?.name || "Bạn"}
      />
    </div>
  );
}
