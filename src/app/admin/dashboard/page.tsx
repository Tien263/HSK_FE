"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import CurriculumBuilderWorkspace from "@/components/admin/CurriculumBuilderWorkspace";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Search,
  Filter,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  Mail,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Settings,
  LogOut,
  ExternalLink,
  ChevronDown,
  X,
  Sparkles,
  Server,
  Info,
  HelpCircle,
  Copy,
  Check,
  Upload,
  BarChart3,
  BookOpen,
  FileCheck2,
  Bot,
  Menu,
} from "lucide-react";

interface UserItem {
  id: string;
  username: string;
  email: string | null;
  name: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  status: "ACTIVE" | "LOCKED" | "INACTIVE";
  currentHskLevel: number;
  totalXp: number;
  streakDays: number;
  createdAt: string;
  enrolledCount?: number;
  taughtCount?: number;
  attemptCount?: number;
}

interface Stats {
  totalUsers: number;
  studentCount: number;
  teacherCount: number;
  adminCount: number;
  activeCount: number;
  lockedCount: number;
  totalClasses?: number;
  totalAssignments?: number;
  totalAttempts?: number;
}

interface OtpLog {
  id: string;
  email: string;
  otp: string;
  purpose: string;
  createdAt: string;
  expiresAt: string;
  status: "SENT" | "VERIFIED" | "EXPIRED";
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "ai" | "otp" | "smtp" | "curriculum"
  >("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function selectAdminTab(tab: typeof activeTab) {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    const url = new URL(window.location.href);
    url.hash = tab;
    window.history.replaceState(null, "", url);
  }
  useEffect(() => {
    const sync = () => { const tab = window.location.hash.slice(1); if (["overview","users","ai","otp","smtp","curriculum"].includes(tab)) setActiveTab(tab as typeof activeTab); };
    const timer = setTimeout(sync, 0); window.addEventListener("hashchange", sync);
    return () => { clearTimeout(timer); window.removeEventListener("hashchange", sync); };
  }, []);

  // AI Engine State
  const [activeAiProvider, setActiveAiProvider] = useState<"QWEN" | "GROQ" | "GEMINI" | "OPENROUTER">("QWEN");
  const [aiTesting, setAiTesting] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{
    success: boolean;
    message: string;
    latency?: number;
    question?: any;
  } | null>(null);

  const handleTestAiConnection = async () => {
    setAiTesting(true);
    setAiTestResult(null);
    const start = performance.now();
    try {
      const res = await fetch("/api/v1/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: "Kiểm tra kết nối hệ thống AI HSK",
          hskLevel: 1,
          count: 1,
          type: "multiple_choice",
        }),
      });
      const latency = Math.round(performance.now() - start);
      const data = await res.json();
      if (res.ok && data.success) {
        setAiTestResult({
          success: true,
          message: `Kết nối AI thành công (${latency}ms) · Model phản hồi câu hỏi HSK chuẩn xác!`,
          latency,
          question: data.questions?.[0],
        });
      } else {
        setAiTestResult({
          success: false,
          message: data.message || `Lỗi phản hồi từ AI (${latency}ms)`,
          latency,
        });
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - start);
      setAiTestResult({
        success: false,
        message: `Lỗi kết nối máy chủ AI: ${err.message}`,
        latency,
      });
    } finally {
      setAiTesting(false);
    }
  };

  // Users data
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    studentCount: 0,
    teacherCount: 0,
    adminCount: 0,
    activeCount: 0,
    lockedCount: 0,
    totalClasses: 0,
    totalAssignments: 0,
    totalAttempts: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "STUDENT" as "STUDENT" | "TEACHER" | "ADMIN",
  });
  const [creatingUser, setCreatingUser] = useState(false);

  // Reset Password Modal
  const [resetTargetUser, setResetTargetUser] = useState<UserItem | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  // OTP Tool State
  const [otpEmail, setOtpEmail] = useState("");
  const [otpLength, setOtpLength] = useState<4 | 6>(6);
  const [otpPurpose, setOtpPurpose] = useState("Kích hoạt tài khoản học viên");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [lastGeneratedOtp, setLastGeneratedOtp] = useState<any>(null);
  const [otpLogs, setOtpLogs] = useState<OtpLog[]>([]);
  const [loadingOtpLogs, setLoadingOtpLogs] = useState(false);

  // SMTP / Google OAuth 2.0 Settings State
  const [smtpConfig, setSmtpConfig] = useState({
    authType: "OAUTH2" as "OAUTH2" | "PASSWORD" | "CUSTOM",
    host: "smtp.gmail.com",
    port: "465",
    user: "",
    password: "",
    senderName: "Hanyu - Lớp Tiếng Trung Cô Ning Ning",
    encryption: "SSL",
    clientId: "",
    clientSecret: "",
    refreshToken: "",
  });
  const [showOauthGuide, setShowOauthGuide] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [smtpSaved, setSmtpSaved] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Tải cấu hình SMTP / OAuth đã lưu
  const fetchSmtpConfig = async () => {
    try {
      const res = await fetch("/api/v1/admin/smtp");
      const data = await res.json();
      if (data.success && data.config) {
        const detectedAuthType =
          (data.config.authType as "OAUTH2" | "PASSWORD" | "CUSTOM") ||
          (data.config.clientId ? "OAUTH2" : "PASSWORD");
        setSmtpConfig({
          authType: detectedAuthType,
          host: data.config.host || "smtp.gmail.com",
          port: String(data.config.port || 465),
          user: data.config.user || "",
          password: data.config.password || "",
          senderName: data.config.senderName || "Hanyu - Lớp Tiếng Trung Cô Ning Ning",
          encryption: Number(data.config.port) === 465 ? "SSL" : "TLS",
          clientId: data.config.clientId || "",
          clientSecret: data.config.clientSecret || "",
          refreshToken: data.config.refreshToken || "",
        });
        if (data.config.user) setTestEmailRecipient(data.config.user);
      }
    } catch {}
  };

  // Kiểm tra phiên đăng nhập admin
  useEffect(() => {
    fetchSmtpConfig();
    const stored = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
      } catch (e) {}
    }
  }, []);

  // Tải danh sách người dùng
  const fetchUsers = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      params.set("_t", Date.now().toString());

      const res = await fetch(`/api/v1/admin/users?${params.toString()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        if (data.stats) setStats(data.stats);
      } else if (!isBackground) {
        showToast(data.message || "Không thể tải danh sách tài khoản", "error");
      }
    } catch (err) {
      if (!isBackground) showToast("Lỗi kết nối tới máy chủ khi tải tài khoản", "error");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Tải danh sách OTP Logs
  const fetchOtpLogs = async (isBackground = false) => {
    if (!isBackground) setLoadingOtpLogs(true);
    try {
      const res = await fetch("/api/v1/admin/otp/send");
      const data = await res.json();
      if (data.success) {
        setOtpLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Lỗi tải OTP logs:", err);
    } finally {
      if (!isBackground) setLoadingOtpLogs(false);
    }
  };

  // Tự động làm mới khi đổi bộ lọc hoặc khi quay lại tab và định kỳ mỗi 6 giây
  useEffect(() => {
    fetchUsers(false);

    const interval = setInterval(() => {
      fetchUsers(true);
      fetchOtpLogs(true);
    }, 6000);

    const onFocus = () => {
      fetchUsers(true);
      fetchOtpLogs(true);
    };

    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [roleFilter]);

  useEffect(() => {
    if (activeTab === "otp") {
      fetchOtpLogs(false);
    }
  }, [activeTab]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Khóa / Mở khóa tài khoản
  const handleToggleStatus = async (user: UserItem) => {
    if (user.username === "admin") {
      showToast("Không thể khóa tài khoản Quản trị viên gốc!", "error");
      return;
    }

    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "TOGGLE_STATUS",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchUsers();
      } else {
        showToast(data.message || "Cập nhật trạng thái thất bại", "error");
      }
    } catch (err) {
      showToast("Lỗi kết nối khi cập nhật tài khoản", "error");
    }
  };

  // Đổi vai trò tài khoản
  const handleChangeRole = async (user: UserItem, nextRole: "STUDENT" | "TEACHER" | "ADMIN") => {
    if (user.username === "admin") {
      showToast("Không thể đổi vai trò tài khoản Quản trị viên gốc!", "error");
      return;
    }

    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "CHANGE_ROLE",
          newRole: nextRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchUsers();
      } else {
        showToast(data.message || "Cập nhật vai trò thất bại", "error");
      }
    } catch (err) {
      showToast("Lỗi kết nối khi cập nhật vai trò", "error");
    }
  };

  // Đặt lại mật khẩu
  const handleResetPassword = async () => {
    if (!resetTargetUser) return;
    if (!newPasswordInput || newPasswordInput.trim().length < 6) {
      showToast("Mật khẩu mới tối thiểu phải từ 6 ký tự", "error");
      return;
    }

    setResettingPassword(true);
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: resetTargetUser.id,
          action: "RESET_PASSWORD",
          newPassword: newPasswordInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setResetTargetUser(null);
        setNewPasswordInput("");
      } else {
        showToast(data.message || "Đặt lại mật khẩu thất bại", "error");
      }
    } catch (err) {
      showToast("Lỗi máy chủ khi đặt lại mật khẩu", "error");
    } finally {
      setResettingPassword(false);
    }
  };

  // Xóa tài khoản
  const handleDeleteUser = async (user: UserItem) => {
    if (user.username === "admin") {
      showToast("Không thể xóa tài khoản Quản trị viên gốc!", "error");
      return;
    }

    const confirmed = confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${user.name}" (${user.username}) không?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/users?id=${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchUsers();
      } else {
        showToast(data.message || "Xóa tài khoản thất bại", "error");
      }
    } catch (err) {
      showToast("Lỗi máy chủ khi xóa tài khoản", "error");
    }
  };

  // Cấp tài khoản mới
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name.trim() || !newUserData.username.trim() || !newUserData.password.trim()) {
      showToast("Vui lòng nhập đầy đủ các trường bắt buộc", "error");
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setShowCreateModal(false);
        setRoleFilter("ALL");
        setSearchQuery("");
        setNewUserData({
          name: "",
          username: "",
          email: "",
          password: "",
          role: "STUDENT",
        });
        fetchUsers();
      } else {
        showToast(data.message || "Cấp tài khoản thất bại", "error");
      }
    } catch (err) {
      showToast("Lỗi máy chủ khi tạo tài khoản", "error");
    } finally {
      setCreatingUser(false);
    }
  };

  // Gửi OTP Test
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail.trim() || !otpEmail.includes("@")) {
      showToast("Vui lòng nhập địa chỉ email hợp lệ để nhận OTP", "error");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch("/api/v1/admin/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpEmail.trim(),
          length: otpLength,
          purpose: otpPurpose,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setLastGeneratedOtp(data.otpData);
        fetchOtpLogs();
      } else {
        showToast(data.message || "Gửi OTP thất bại", "error");
      }
    } catch (err) {
      showToast("Lỗi khi kết nối API phát OTP", "error");
    } finally {
      setSendingOtp(false);
    }
  };

  // Đăng xuất
  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#204434] font-sans selection:bg-[#204434] selection:text-[#FFFCF6] lg:pl-64 pb-16 lg:pb-0">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          role="presentation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 lg:hidden transition-opacity"
        />
      )}

      {/* Admin Sidebar Navigation */}
      <aside
        data-dictionary-exclusion="sidebar"
        aria-label="Điều hướng quản trị"
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-[#E5DEC9] bg-[#F8F5ED] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-bottom opacity-70"
          style={{ backgroundImage: "url('/theme/dashboard/sidebar-bg.webp')" }}
        />
        <div className="relative flex items-center justify-between px-6 pb-6 pt-7">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#204434] font-serif text-xl text-[#FFFCF6]">
              宁
            </span>
            <span>
              <strong className="block font-serif text-xl">Hanyu</strong>
              <small className="text-[9px] font-bold uppercase tracking-[.18em] text-[#64755d]">
                Không gian quản trị
              </small>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-xl hover:bg-black/5 text-[#526c50] cursor-pointer"
            aria-label="Đóng menu"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="relative flex-1 space-y-2 px-4 overflow-y-auto">
          {(
            [
              { id: "overview", label: "Tổng quan", icon: BarChart3 },
              { id: "curriculum", label: "Kho giáo trình HSK", icon: BookOpen },
              { id: "users", label: "Tài khoản & phân quyền", icon: Users },
              { id: "ai", label: "Trợ lý AI", icon: Sparkles },
              { id: "otp", label: "Xác thực OTP", icon: Mail },
              { id: "smtp", label: "Cấu hình email", icon: Server },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => selectAdminTab(id)}
              aria-current={activeTab === id ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-semibold transition cursor-pointer ${
                activeTab === id
                  ? "bg-[#204434] text-white shadow-sm"
                  : "text-[#526c50] hover:bg-[#204434]/5"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
          <div className="my-5 border-t border-[#D7C9AB]/60" />
          <Link
            href="/admin/dictionary"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold text-[#526c50] hover:bg-[#204434]/5 transition"
          >
            <BookOpen size={17} />
            Duyệt từ điển
          </Link>
          <Link
            href="/admin/media"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold text-[#526c50] hover:bg-[#204434]/5 transition"
          >
            <Upload size={17} />
            Thư viện media
          </Link>
        </nav>
        <div className="relative m-4 rounded-2xl border border-[#E5DEC9] bg-[#FFFCF6]/90 p-4">
          <p className="flex items-center gap-2 text-xs font-bold">
            <ShieldCheck size={16} />
            {currentUser?.name || "Quản trị viên"}
          </p>
          <p className="mt-2 text-[10px] text-[#7e8b71]">
            Chăm chút học liệu · Nuôi dưỡng tri thức
          </p>
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 text-xs text-[#9D493E] hover:underline cursor-pointer"
          >
            <LogOut size={13} />
            Đăng xuất
          </button>
        </div>
      </aside>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 transition-all transform duration-300 ${
            toast.type === "success"
              ? "bg-[#FFFCF6] border-[#315E48]/30 text-[#204434]"
              : "bg-[#FFFCF6] border-[#9D493E]/40 text-[#9D493E]"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[#315E48] shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-[#9D493E] shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#FFFCF6]/90 backdrop-blur-md border-b border-[#BC9B6B]/25 shadow-xs">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-[#204434]/5 border border-[#BC9B6B]/25 text-[#204434] hover:bg-[#204434]/10 lg:hidden cursor-pointer shrink-0 transition"
              aria-label="Mở menu quản trị"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#204434] text-[#FFFCF6] flex items-center justify-center font-serif text-lg font-bold shadow-md group-hover:scale-105 transition-transform">
                <span>宁</span>
              </div>
              <div>
                <div className="font-serif font-bold text-lg text-[#204434] tracking-tight flex items-center gap-2">
                  <span>Hanyu</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#BC9B6B]/20 text-[#7A5B2E] text-[10px] font-bold tracking-wider uppercase">
                    Admin Portal
                  </span>
                </div>
                <div className="text-[10px] text-[#315E48] font-medium tracking-wide">
                  Quản lý học liệu, lớp học và nhà trường
                </div>
              </div>
            </Link>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#204434]/5 border border-[#BC9B6B]/20 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#BC9B6B]" />
              <span className="font-semibold text-[#204434]">
                {currentUser?.name || "Quản trị viên Hệ thống"}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#204434] text-[#FFFCF6] text-[10px] font-bold">
                QUẢN TRỊ VIÊN
              </span>
            </div>

            <Link
              href="/s/home"
              target="_blank"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#BC9B6B]/30 bg-[#FFFCF6] hover:bg-[#204434]/5 text-[#315E48] text-xs font-semibold transition"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Xem App Học viên</span>
              <ExternalLink className="w-3 h-3 text-[#BC9B6B]" />
            </Link>

            <Link
              href="/t/dashboard"
              target="_blank"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#BC9B6B]/30 bg-[#FFFCF6] hover:bg-[#204434]/5 text-[#315E48] text-xs font-semibold transition"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Xem App Giáo viên</span>
              <ExternalLink className="w-3 h-3 text-[#BC9B6B]" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#9D493E]/10 hover:bg-[#9D493E] text-[#9D493E] hover:text-[#FFFCF6] text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-[1520px] mx-auto px-4 sm:px-7 py-6 space-y-6">
        <section className="relative isolate overflow-hidden rounded-3xl border border-[#E5DEC9] bg-[#F4EEDC] px-6 py-6 sm:px-8 sm:py-7">
          <Image src="/theme/dashboard/banner-bg.webp" alt="" fill sizes="(max-width: 1024px) 100vw, 1180px" className="-z-20 object-cover object-center" priority />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#F8F5ED]/95 via-[#F8F5ED]/65 to-transparent" />
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#8F6D3B]">Hanyu · Đồng hành cùng lớp học</p><h1 className="max-w-xl font-serif text-2xl font-bold leading-snug text-[#1A3D2F] sm:text-3xl">{activeTab === "curriculum" ? "Chăm chút từng bài học." : activeTab === "users" ? "Kết nối người dạy, người học." : "Một không gian, vạn tri thức."}</h1><p className="mt-3 max-w-lg text-xs leading-6 text-[#526c50]">{activeTab === "curriculum" ? "Biên soạn, nhập học liệu và quản lý giáo trình theo từng cấp HSK. Tất cả thay đổi được lưu trong kho chung." : "Quản lý học liệu, tài khoản và hoạt động của nhà trường trong một không gian học tập an nhiên."}</p><div className="mt-5 flex flex-wrap gap-3">{activeTab !== "curriculum" && <button onClick={()=>selectAdminTab("curriculum")} className="flex items-center gap-2 rounded-xl bg-[#204434] px-4 py-2.5 text-xs font-bold text-white"><BookOpen size={15}/>Quản lý giáo trình</button>}{activeTab === "users" && <button onClick={()=>setShowCreateModal(true)} className="rounded-xl border border-[#BC9B6B] bg-[#FFFCF6] px-4 py-2.5 text-xs font-bold">Cấp tài khoản mới</button>}<Link href="/admin/dictionary" className="flex items-center gap-2 rounded-xl border border-[#BC9B6B]/50 bg-[#FFFCF6]/90 px-4 py-2.5 text-xs font-semibold"><BookOpen size={14}/>Duyệt từ điển</Link></div>
        </section>

        {/* KPI Stats Grid */}
        <section className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 ${activeTab === "curriculum" ? "hidden" : ""}`}>
          <div className="bg-[#FFFCF6] p-4 rounded-2xl border border-[#BC9B6B]/25 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#315E48] font-medium">
              <span>Tổng tài khoản</span>
              <Users className="w-4 h-4 text-[#204434]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-[#204434]">
                {stats.totalUsers}
              </span>
              <span className="text-[11px] text-[#315E48]">tài khoản</span>
            </div>
          </div>

          <div className="bg-[#FFFCF6] p-4 rounded-2xl border border-[#BC9B6B]/25 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#315E48] font-medium">
              <span>Học viên / Giáo viên</span>
              <GraduationCap className="w-4 h-4 text-[#315E48]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-[#315E48]">
                {stats.studentCount}
              </span>
              <span className="text-[11px] text-[#315E48]">HV / {stats.teacherCount} GV</span>
            </div>
          </div>

          <div className="bg-[#FFFCF6] p-4 rounded-2xl border border-[#BC9B6B]/25 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#204434] font-medium">
              <span>Tổng lớp học HSK</span>
              <BookOpen className="w-4 h-4 text-[#204434]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-[#204434]">
                {stats.totalClasses || 0}
              </span>
              <span className="text-[11px] text-[#315E48]">lớp đang mở</span>
            </div>
          </div>

          <div className="bg-[#FFFCF6] p-4 rounded-2xl border border-[#BC9B6B]/25 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#7A5B2E] font-medium">
              <span>Đề thi & Bài tập</span>
              <FileCheck2 className="w-4 h-4 text-[#BC9B6B]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-[#7A5B2E]">
                {stats.totalAssignments || 0}
              </span>
              <span className="text-[11px] text-[#315E48]">bài được giao</span>
            </div>
          </div>

          <div className="bg-[#FFFCF6] p-4 rounded-2xl border border-[#BC9B6B]/25 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
              <span>Lượt làm bài / nộp bài</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-emerald-800">
                {stats.totalAttempts || 0}
              </span>
              <span className="text-[11px] text-[#315E48]">lượt nộp bài</span>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-[#BC9B6B]/25 pb-2 gap-3 lg:hidden">
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            <button
              onClick={() => selectAdminTab("overview")}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#204434] text-[#FFFCF6] shadow-md shadow-[#204434]/20"
                  : "bg-[#FFFCF6] text-[#315E48] hover:bg-[#204434]/10 border border-[#BC9B6B]/20"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tổng quan KPIs</span>
            </button>

            <button
              onClick={() => selectAdminTab("users")}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "users"
                  ? "bg-[#204434] text-[#FFFCF6] shadow-md shadow-[#204434]/20"
                  : "bg-[#FFFCF6] text-[#315E48] hover:bg-[#204434]/10 border border-[#BC9B6B]/20"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Tài khoản ({stats.totalUsers})</span>
            </button>

            <button
              onClick={() => selectAdminTab("ai")}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "ai"
                  ? "bg-[#204434] text-[#FFFCF6] shadow-md shadow-[#204434]/20"
                  : "bg-[#FFFCF6] text-[#315E48] hover:bg-[#204434]/10 border border-[#BC9B6B]/20"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Cấu hình AI Engine</span>
            </button>

            <button
              onClick={() => selectAdminTab("otp")}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "otp"
                  ? "bg-[#204434] text-[#FFFCF6] shadow-md shadow-[#204434]/20"
                  : "bg-[#FFFCF6] text-[#315E48] hover:bg-[#204434]/10 border border-[#BC9B6B]/20"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Gửi OTP</span>
            </button>

            <button
              onClick={() => selectAdminTab("smtp")}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "smtp"
                  ? "bg-[#204434] text-[#FFFCF6] shadow-md shadow-[#204434]/20"
                  : "bg-[#FFFCF6] text-[#315E48] hover:bg-[#204434]/10 border border-[#BC9B6B]/20"
              }`}
            >
              <Server className="w-4 h-4" />
              <span>SMTP Gateway</span>
            </button>

            <button
              onClick={() => selectAdminTab("curriculum")}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "curriculum"
                  ? "bg-[#204434] text-[#FFFCF6] shadow-md shadow-[#204434]/20"
                  : "bg-[#FFFCF6] text-[#315E48] hover:bg-[#204434]/10 border border-[#BC9B6B]/20"
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#BC9B6B]" />
              <span>Kho bài học & Giáo trình HSK</span>
            </button>

            <Link
              href="/admin/dictionary"
              className="px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 bg-[#FFFCF6] text-[#315E48] border border-[#BC9B6B]/20"
            >
              <BookOpen className="w-4 h-4 text-[#BC9B6B]" />
              <span>Duyệt từ điển</span>
            </Link>
            <Link
              href="/admin/media"
              className="px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer bg-[#FFFCF6] text-[#315E48] hover:bg-[#204434]/10 border border-[#BC9B6B]/20"
            >
              <Upload className="w-4 h-4 text-[#BC9B6B]" />
              <span>Cloudinary Media</span>
            </Link>
          </div>

          {activeTab === "users" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#315E48] hover:bg-[#204434] text-[#FFFCF6] px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#315E48]/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Cấp tài khoản mới</span>
              <span className="sm:hidden">Thêm mới</span>
            </button>
          )}
        </div>

        {/* =================================================================== */}
        {/* TAB 0: OVERVIEW & SYSTEM KPIS */}
        {/* =================================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* System Health Status Banner */}
            <div className="bg-[#FFFCF6] border border-[#BC9B6B]/25 rounded-3xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BC9B6B]/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#204434]">
                      Dữ liệu & dịch vụ nhà trường
                    </h3>
                    <p className="text-xs text-[#315E48]">Truy cập các công cụ quản lý học liệu, AI, email và thư viện media.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-800">Quản lý tập trung</span>
                </div>
              </div>

              {/* Service Status Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/20 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#204434]">PostgreSQL Database</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Kho chung</span>
                  </div>
                  <p className="text-[11px] text-[#315E48]">Tài khoản, giáo trình và lịch sử học tập</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/20 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#204434]">AI Engine (Qwen / Groq)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Cấu hình</span>
                  </div>
                  <p className="text-[11px] text-[#315E48]">Hỗ trợ sinh tự động 12 dạng câu hỏi HSK</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/20 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#204434]">Email Gateway (SMTP)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Cấu hình</span>
                  </div>
                  <p className="text-[11px] text-[#315E48]">Gmail OAuth 2.0 / SSL Port 465</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/20 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#204434]">Cloudinary Media</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Cấu hình</span>
                  </div>
                  <p className="text-[11px] text-[#315E48]">Lưu trữ file nghe MP3 & ảnh đề thi HSK</p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Short Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => selectAdminTab("users")}
                className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/25 hover:border-[#204434] shadow-2xs transition cursor-pointer group space-y-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#204434]/10 text-[#204434] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#204434]">Quản lý Tài khoản & Phân quyền</h4>
                <p className="text-xs text-[#315E48]">
                  Thêm mới học viên, phê duyệt tài khoản giáo viên, khóa/mở tài khoản và đặt lại mật khẩu nhanh.
                </p>
                <span className="text-xs text-[#204434] font-semibold flex items-center gap-1 group-hover:underline pt-1 block">
                  Xem danh sách {stats.totalUsers} tài khoản &rarr;
                </span>
              </div>

              <div
                onClick={() => selectAdminTab("ai")}
                className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/25 hover:border-[#204434] shadow-2xs transition cursor-pointer group space-y-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#204434]">Cấu hình AI Engine & Model</h4>
                <p className="text-xs text-[#315E48]">
                  Quản lý kết nối Qwen 2.5, Groq Cloud Llama 3.3, Google Gemini và kiểm tra khả năng sinh câu hỏi trực tiếp.
                </p>
                <span className="text-xs text-[#204434] font-semibold flex items-center gap-1 group-hover:underline pt-1 block">
                  Cấu hình AI & Test kết nối &rarr;
                </span>
              </div>

              <div
                onClick={() => selectAdminTab("smtp")}
                className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/25 hover:border-[#204434] shadow-2xs transition cursor-pointer group space-y-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5 text-sky-700" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#204434]">Dịch vụ Email OTP & Thông báo</h4>
                <p className="text-xs text-[#315E48]">
                  Cấu hình máy chủ gửi email xác thực tài khoản, nhắc nhở nộp bài tập và lịch dạy cho giáo viên.
                </p>
                <span className="text-xs text-[#204434] font-semibold flex items-center gap-1 group-hover:underline pt-1 block">
                  Thiết lập SMTP Gateway &rarr;
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB AI: AI ENGINE CONFIGURATION & DIRECT CONNECTION TEST */}
        {/* =================================================================== */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div className="bg-[#FFFCF6] border border-[#BC9B6B]/25 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BC9B6B]/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#204434]">
                      Trung tâm Cấu hình AI Engine (HSK 3.0 Standard)
                    </h3>
                    <p className="text-xs text-[#315E48]">
                      Quản lý nhà cung cấp trí tuệ nhân tạo, thiết lập model ưu tiên và kiểm tra độ trễ phản hồi thực tế.
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Chuẩn HSK 3.0 · 12 Dạng câu hỏi
                </span>
              </div>

              {/* Providers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Alibaba Qwen */}
                <div
                  onClick={() => setActiveAiProvider("QWEN")}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    activeAiProvider === "QWEN"
                      ? "bg-[#FFFBF0] border-[#BC9B6B] shadow-xs ring-2 ring-[#BC9B6B]/40"
                      : "bg-white border-[#E5DEC9] hover:bg-[#FAF7F0]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#204434]">Alibaba Cloud Qwen</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Khuyên dùng
                    </span>
                  </div>
                  <p className="text-xs text-[#315E48] mt-1 font-medium">Model: Qwen 2.5 72B / Qwen-Turbo</p>
                  <p className="text-[11px] text-[#8ea394] mt-1">
                    Tối ưu xuất sắc nhất cho tiếng Trung, ngữ pháp HSK, thanh điệu pinyin và viết chữ Hán.
                  </p>
                </div>

                {/* 2. Groq Cloud */}
                <div
                  onClick={() => setActiveAiProvider("GROQ")}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    activeAiProvider === "GROQ"
                      ? "bg-[#FFFBF0] border-[#BC9B6B] shadow-xs ring-2 ring-[#BC9B6B]/40"
                      : "bg-white border-[#E5DEC9] hover:bg-[#FAF7F0]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#204434]">Groq Cloud</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Siêu tốc
                    </span>
                  </div>
                  <p className="text-xs text-[#315E48] mt-1 font-medium">Model: Llama 3.3 70B Versatile</p>
                  <p className="text-[11px] text-[#8ea394] mt-1">
                    Tốc độ xử lý cực đại ~500 tokens/giây, sinh trắc nghiệm và dịch nghĩa gần như tức thì.
                  </p>
                </div>

                {/* 3. Google Gemini */}
                <div
                  onClick={() => setActiveAiProvider("GEMINI")}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    activeAiProvider === "GEMINI"
                      ? "bg-[#FFFBF0] border-[#BC9B6B] shadow-xs ring-2 ring-[#BC9B6B]/40"
                      : "bg-white border-[#E5DEC9] hover:bg-[#FAF7F0]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#204434]">Google Gemini</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Đa ngữ
                    </span>
                  </div>
                  <p className="text-xs text-[#315E48] mt-1 font-medium">Model: Gemini 2.5 Flash</p>
                  <p className="text-[11px] text-[#8ea394] mt-1">
                    Phân tích ngữ cảnh văn hóa sâu rộng, giải thích cặn kẽ ngữ pháp cho học viên Việt Nam.
                  </p>
                </div>
              </div>

              {/* Live Test Panel */}
              <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#204434]">
                      Kiểm tra kết nối và khả năng sinh câu hỏi AI
                    </h4>
                    <p className="text-xs text-[#315E48]">
                      Gửi một yêu cầu kiểm tra thực tế tới máy chủ AI để xác minh API Key và độ trễ.
                    </p>
                  </div>

                  <button
                    onClick={handleTestAiConnection}
                    disabled={aiTesting}
                    className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${aiTesting ? "animate-spin" : ""}`} />
                    <span>{aiTesting ? "Đang gửi yêu cầu test..." : "Kiểm tra kết nối AI Trực tiếp"}</span>
                  </button>
                </div>

                {aiTestResult && (
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-2 animate-fadeIn ${
                      aiTestResult.success
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                        : "bg-red-50 border-red-300 text-red-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {aiTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>{aiTestResult.message}</span>
                    </div>

                    {aiTestResult.question && (
                      <div className="mt-2 p-3 bg-white rounded-lg border border-emerald-200 text-[#204434] space-y-1">
                        <div className="font-bold text-[11px] text-[#315E48] uppercase">
                          Câu hỏi mẫu do AI phản hồi:
                        </div>
                        <p className="font-semibold">{aiTestResult.question.content}</p>
                        {aiTestResult.question.pinyinPrompt && (
                          <p className="text-[11px] text-[#8F6D3B]">Pinyin: {aiTestResult.question.pinyinPrompt}</p>
                        )}
                        <p className="text-[11px] text-[#315E48]">
                          Giải thích: {aiTestResult.question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: USERS MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-[#FFFCF6] p-3.5 sm:p-4 rounded-2xl border border-[#BC9B6B]/25 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#315E48] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo họ tên, username hoặc địa chỉ email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                  className="w-full pl-10 pr-24 py-2 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/30 focus:outline-hidden focus:border-[#204434] text-xs sm:text-sm text-[#204434]"
                />
                <button
                  onClick={() => fetchUsers(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-[#204434] text-[#FFFCF6] text-xs font-semibold hover:bg-[#183629] transition"
                >
                  Tìm kiếm
                </button>
              </div>

              {/* Role filter buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs text-[#315E48] font-medium mr-1 flex items-center gap-1 shrink-0">
                  <Filter className="w-3.5 h-3.5" /> Lọc:
                </span>
                {[
                  { key: "ALL", label: "Tất cả" },
                  { key: "STUDENT", label: "Học viên" },
                  { key: "TEACHER", label: "Giáo viên" },
                  { key: "ADMIN", label: "Admin" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setRoleFilter(item.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      roleFilter === item.key
                        ? "bg-[#204434] text-[#FFFCF6]"
                        : "bg-[#F8F5ED] text-[#315E48] hover:bg-[#204434]/10 border border-[#BC9B6B]/20"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                <button
                  onClick={() => fetchUsers(false)}
                  title="Làm mới danh sách"
                  className="p-1.5 rounded-xl bg-[#F8F5ED] hover:bg-[#204434]/10 border border-[#BC9B6B]/20 text-[#315E48] transition cursor-pointer ml-1"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#FFFCF6] rounded-2xl border border-[#BC9B6B]/25 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#204434]/5 border-b border-[#BC9B6B]/20 text-[11px] sm:text-xs text-[#315E48] font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Tài khoản & Họ tên</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Vai trò</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Thông tin học/dạy</th>
                      <th className="py-3 px-4">Ngày tạo</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BC9B6B]/15 text-xs sm:text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[#315E48]">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-6 h-6 border-2 border-[#204434]/20 border-t-[#204434] rounded-full animate-spin" />
                            <span>Đang tải danh sách tài khoản...</span>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[#315E48]">
                          Không tìm thấy tài khoản nào phù hợp với điều kiện tìm kiếm.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => {
                        const isSuperAdmin = u.username === "admin";
                        return (
                          <tr key={u.id} className="hover:bg-[#204434]/5 transition">
                            {/* Avatar & Name */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-[#FFFCF6] shrink-0 ${
                                    u.role === "ADMIN"
                                      ? "bg-[#BC9B6B]"
                                      : u.role === "TEACHER"
                                      ? "bg-[#9D493E]"
                                      : "bg-[#204434]"
                                  }`}
                                >
                                  {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div>
                                  <div className="font-semibold text-[#204434] flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {isSuperAdmin && (
                                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#BC9B6B]/30 text-[#7A5B2E] font-bold">
                                        Root
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-[#315E48] font-mono">@{u.username}</div>
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="py-3.5 px-4 font-mono text-xs text-[#315E48]">
                              {u.email || <span className="text-[#315E48]/40 italic">Chưa liên kết</span>}
                            </td>

                            {/* Role */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  u.role === "ADMIN"
                                    ? "bg-[#BC9B6B]/20 text-[#7A5B2E]"
                                    : u.role === "TEACHER"
                                    ? "bg-[#9D493E]/15 text-[#9D493E]"
                                    : "bg-[#204434]/15 text-[#204434]"
                                }`}
                              >
                                {u.role === "ADMIN" && <Shield className="w-3 h-3" />}
                                {u.role === "TEACHER" && <Briefcase className="w-3 h-3" />}
                                {u.role === "STUDENT" && <GraduationCap className="w-3 h-3" />}
                                <span>
                                  {u.role === "ADMIN"
                                    ? "Quản trị viên"
                                    : u.role === "TEACHER"
                                    ? "Giáo viên"
                                    : "Học viên"}
                                </span>
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                  u.status === "ACTIVE"
                                    ? "bg-[#315E48]/15 text-[#204434]"
                                    : "bg-[#9D493E]/20 text-[#9D493E]"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    u.status === "ACTIVE" ? "bg-[#315E48]" : "bg-[#9D493E]"
                                  }`}
                                />
                                {u.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                              </span>
                            </td>

                            {/* Info */}
                            <td className="py-3.5 px-4 text-xs text-[#315E48]">
                              {u.role === "STUDENT" && (
                                <div className="space-y-0.5">
                                  <div>
                                    HSK {u.currentHskLevel || 1} · {u.totalXp} XP
                                  </div>
                                  <div className="text-[11px] text-[#315E48]/80">
                                    Lớp: {u.enrolledCount || 0} · Luyện tập: {u.attemptCount || 0}
                                  </div>
                                </div>
                              )}
                              {u.role === "TEACHER" && (
                                <div>Lớp phụ trách: {u.taughtCount || 0} lớp</div>
                              )}
                              {u.role === "ADMIN" && (
                                <div className="text-[11px] text-[#7A5B2E] font-medium">Toàn quyền hệ thống</div>
                              )}
                            </td>

                            {/* Created Date */}
                            <td className="py-3.5 px-4 text-xs text-[#315E48]">
                              {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                {/* Reset Password */}
                                <button
                                  onClick={() => {
                                    setResetTargetUser(u);
                                    setNewPasswordInput("");
                                  }}
                                  title="Đặt lại mật khẩu"
                                  className="p-1.5 rounded-lg bg-[#204434]/10 hover:bg-[#204434] text-[#204434] hover:text-[#FFFCF6] transition cursor-pointer"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                </button>

                                {/* Toggle Active / Lock */}
                                {!isSuperAdmin && (
                                  <button
                                    onClick={() => handleToggleStatus(u)}
                                    title={u.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                                      u.status === "ACTIVE"
                                        ? "bg-[#9D493E]/10 hover:bg-[#9D493E] text-[#9D493E] hover:text-[#FFFCF6]"
                                        : "bg-[#315E48]/10 hover:bg-[#315E48] text-[#315E48] hover:text-[#FFFCF6]"
                                    }`}
                                  >
                                    {u.status === "ACTIVE" ? (
                                      <Lock className="w-3.5 h-3.5" />
                                    ) : (
                                      <Unlock className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}

                                {/* Delete User */}
                                {!isSuperAdmin && (
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    title="Xóa tài khoản"
                                    className="p-1.5 rounded-lg bg-red-100 hover:bg-red-600 text-red-600 hover:text-white transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EMAIL OTP API TOOL */}
        {activeTab === "otp" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Direct OTP Generator & Sender */}
            <div className="lg:col-span-5 bg-[#FFFCF6] p-5 sm:p-6 rounded-2xl border border-[#BC9B6B]/25 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-[#BC9B6B]/20 pb-3">
                <div className="w-8 h-8 rounded-lg bg-[#204434]/10 text-[#204434] flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4 text-[#204434]" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-[#204434]">
                    Kiểm thử Phát & Gửi OTP qua Email
                  </h2>
                  <p className="text-xs text-[#315E48]">
                    API endpoint: <code className="font-mono text-[#9D493E]">POST /api/v1/admin/otp/send</code>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-[#204434] font-semibold mb-1">
                    Email người nhận <span className="text-[#9D493E]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vd: student@hanyu.edu.vn hoặc email cá nhân..."
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                  />
                  <div className="flex gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setOtpEmail("student@hanyu.edu.vn")}
                      className="text-[11px] text-[#315E48] hover:underline cursor-pointer"
                    >
                      + Học viên mẫu
                    </button>
                    <span className="text-[#315E48]/40">·</span>
                    <button
                      type="button"
                      onClick={() => setOtpEmail("teacher@hanyu.edu.vn")}
                      className="text-[11px] text-[#315E48] hover:underline cursor-pointer"
                    >
                      + Giáo viên mẫu
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#204434] font-semibold mb-1">Độ dài mã OTP</label>
                    <select
                      value={otpLength}
                      onChange={(e) => setOtpLength(Number(e.target.value) as 4 | 6)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                    >
                      <option value={6}>6 chữ số (Chuẩn bảo mật)</option>
                      <option value={4}>4 chữ số (Đơn giản)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#204434] font-semibold mb-1">Thời hạn hiệu lực</label>
                    <div className="px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/40 border border-[#BC9B6B]/25 text-[#315E48] font-medium">
                      5 phút
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[#204434] font-semibold mb-1">Mục đích gửi mã</label>
                  <select
                    value={otpPurpose}
                    onChange={(e) => setOtpPurpose(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                  >
                    <option value="Kích hoạt tài khoản học viên">Kích hoạt tài khoản học viên mới</option>
                    <option value="Xác thực 2 bước đăng nhập">Xác thực 2 bước (2FA)</option>
                    <option value="Đặt lại mật khẩu">Đặt lại mật khẩu đã quên</option>
                    <option value="Xác nhận tham gia lớp học">Xác nhận tham gia lớp học</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={sendingOtp}
                  className="w-full bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] font-semibold py-3 rounded-xl transition shadow-md shadow-[#204434]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {sendingOtp ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Phát & Gửi OTP Thử Nghiệm</span>
                    </>
                  )}
                </button>
              </form>

              {/* Last Generated OTP Preview Box */}
              {lastGeneratedOtp && (
                <div className="p-4 rounded-xl bg-[#315E48]/10 border border-[#315E48]/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#204434]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
                      Mã OTP vừa được sinh:
                    </span>
                    <span className="text-[11px] text-[#315E48]">Hết hạn sau 5 phút</span>
                  </div>
                  <div className="text-center py-2 bg-[#FFFCF6] rounded-lg border border-[#BC9B6B]/30 font-mono text-2xl font-bold tracking-widest text-[#204434]">
                    {lastGeneratedOtp.otp}
                  </div>
                  <div className="text-[11px] text-[#315E48] text-center">
                    Gửi tới: <span className="font-semibold">{lastGeneratedOtp.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: OTP Audit Trail Log */}
            <div className="lg:col-span-7 bg-[#FFFCF6] p-5 sm:p-6 rounded-2xl border border-[#BC9B6B]/25 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#BC9B6B]/20 pb-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#204434]">
                    Nhật ký Mã OTP Đã Phát (OTP Audit Trail)
                  </h3>
                  <p className="text-xs text-[#315E48]">
                    Theo dõi các mã xác thực gửi ra toàn hệ thống
                  </p>
                </div>
                <button
                  onClick={() => fetchOtpLogs(false)}
                  className="p-1.5 rounded-lg bg-[#204434]/10 hover:bg-[#204434] text-[#204434] hover:text-[#FFFCF6] transition"
                  title="Làm mới nhật ký"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingOtpLogs ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#204434]/5 border-b border-[#BC9B6B]/20 text-[11px] text-[#315E48] font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Email nhận</th>
                      <th className="py-2.5 px-3">Mã OTP</th>
                      <th className="py-2.5 px-3">Mục đích</th>
                      <th className="py-2.5 px-3">Thời gian tạo</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BC9B6B]/15">
                    {otpLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#315E48]">
                          Chưa có mã OTP nào được phát trong phiên hiện tại.
                        </td>
                      </tr>
                    ) : (
                      otpLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#204434]/5 transition">
                          <td className="py-2.5 px-3 font-mono font-medium text-[#204434]">
                            {log.email}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#9D493E] tracking-wider">
                            {log.otp}
                          </td>
                          <td className="py-2.5 px-3 text-[#315E48]">{log.purpose}</td>
                          <td className="py-2.5 px-3 text-[#315E48]/80 text-[11px]">
                            {new Date(log.createdAt).toLocaleTimeString("vi-VN")}{" "}
                            {new Date(log.createdAt).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.status === "VERIFIED"
                                  ? "bg-green-100 text-green-700"
                                  : log.status === "SENT"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {log.status === "SENT"
                                ? "ĐÃ GỬI"
                                : log.status === "VERIFIED"
                                ? "ĐÃ XÁC MINH"
                                : "HẾT HẠN"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SMTP & GOOGLE OAUTH 2.0 GATEWAY CONFIG */}
        {activeTab === "smtp" && (
          <div className="max-w-4xl mx-auto bg-[#FFFCF6] p-6 sm:p-8 rounded-3xl border border-[#BC9B6B]/25 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#BC9B6B]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#204434] text-[#FFFCF6] flex items-center justify-center font-bold shadow-md shadow-[#204434]/15">
                  <Mail className="w-5 h-5 text-[#BC9B6B]" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-[#204434]">
                    Cấu hình Gửi Email & Google OAuth 2.0
                  </h2>
                  <p className="text-xs text-[#315E48]">
                    Tự động gửi mã OTP xác thực email trực tiếp vào hòm thư học viên khi đăng ký tài khoản
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center">
                {smtpConfig.authType === "OAUTH2" && smtpConfig.user && smtpConfig.clientId && smtpConfig.refreshToken ? (
                  <span className="px-3 py-1.5 rounded-full bg-[#315E48]/15 border border-[#315E48]/30 text-[#204434] font-bold text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#315E48] animate-pulse" />
                    ✓ Đã sẵn sàng Google OAuth 2.0
                  </span>
                ) : smtpConfig.authType === "PASSWORD" && smtpConfig.user && smtpConfig.password ? (
                  <span className="px-3 py-1.5 rounded-full bg-[#315E48]/15 border border-[#315E48]/30 text-[#204434] font-bold text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#315E48]" />
                    ✓ Đã kết nối App Password
                  </span>
                ) : smtpConfig.authType === "CUSTOM" && smtpConfig.host && smtpConfig.user ? (
                  <span className="px-3 py-1.5 rounded-full bg-[#315E48]/15 border border-[#315E48]/30 text-[#204434] font-bold text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#315E48]" />
                    ✓ Đã cấu hình Custom SMTP
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-full bg-[#9D493E]/10 border border-[#9D493E]/30 text-[#9D493E] font-bold text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#9D493E]" />
                    Chưa kết nối gửi email
                  </span>
                )}
              </div>
            </div>

            {/* Authentication Mode Switcher */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#204434] uppercase tracking-wider">
                Chọn phương thức kết nối gửi email:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Mode 1: OAuth 2.0 */}
                <button
                  type="button"
                  onClick={() => setSmtpConfig({ ...smtpConfig, authType: "OAUTH2", host: "smtp.gmail.com", port: "465" })}
                  className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                    smtpConfig.authType === "OAUTH2"
                      ? "bg-[#204434] text-[#FFFCF6] border-[#204434] shadow-md shadow-[#204434]/15"
                      : "bg-[#FFFCF6] text-[#204434] border-[#BC9B6B]/30 hover:border-[#204434]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Sparkles className={`w-3.5 h-3.5 ${smtpConfig.authType === "OAUTH2" ? "text-[#BC9B6B]" : "text-[#7A5B2E]"}`} />
                      <span>Google OAuth 2.0</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        smtpConfig.authType === "OAUTH2"
                          ? "bg-[#BC9B6B] text-[#204434]"
                          : "bg-[#BC9B6B]/20 text-[#7A5B2E]"
                      }`}
                    >
                      Khuyên dùng
                    </span>
                  </div>
                  <div className={`text-[11px] leading-tight ${smtpConfig.authType === "OAUTH2" ? "text-[#FFFCF6]/85" : "text-[#315E48]"}`}>
                    Chuẩn bảo mật Google Cloud, không bao giờ bị Google chặn gửi mail.
                  </div>
                </button>

                {/* Mode 2: App Password */}
                <button
                  type="button"
                  onClick={() => setSmtpConfig({ ...smtpConfig, authType: "PASSWORD", host: "smtp.gmail.com", port: "465" })}
                  className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                    smtpConfig.authType === "PASSWORD"
                      ? "bg-[#204434] text-[#FFFCF6] border-[#204434] shadow-md shadow-[#204434]/15"
                      : "bg-[#FFFCF6] text-[#204434] border-[#BC9B6B]/30 hover:border-[#204434]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <KeyRound className={`w-3.5 h-3.5 ${smtpConfig.authType === "PASSWORD" ? "text-[#BC9B6B]" : "text-[#7A5B2E]"}`} />
                      <span>Mật khẩu Ứng dụng</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        smtpConfig.authType === "PASSWORD"
                          ? "bg-[#FFFCF6]/20 text-[#FFFCF6]"
                          : "bg-[#204434]/10 text-[#204434]"
                      }`}
                    >
                      30 giây
                    </span>
                  </div>
                  <div className={`text-[11px] leading-tight ${smtpConfig.authType === "PASSWORD" ? "text-[#FFFCF6]/85" : "text-[#315E48]"}`}>
                    Tạo App Password 16 số tại trang bảo mật tài khoản Google.
                  </div>
                </button>

                {/* Mode 3: Custom SMTP */}
                <button
                  type="button"
                  onClick={() => setSmtpConfig({ ...smtpConfig, authType: "CUSTOM" })}
                  className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                    smtpConfig.authType === "CUSTOM"
                      ? "bg-[#204434] text-[#FFFCF6] border-[#204434] shadow-md shadow-[#204434]/15"
                      : "bg-[#FFFCF6] text-[#204434] border-[#BC9B6B]/30 hover:border-[#204434]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Server className={`w-3.5 h-3.5 ${smtpConfig.authType === "CUSTOM" ? "text-[#BC9B6B]" : "text-[#7A5B2E]"}`} />
                      <span>Custom SMTP</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        smtpConfig.authType === "CUSTOM"
                          ? "bg-[#FFFCF6]/20 text-[#FFFCF6]"
                          : "bg-[#204434]/10 text-[#204434]"
                      }`}
                    >
                      Tùy chọn
                    </span>
                  </div>
                  <div className={`text-[11px] leading-tight ${smtpConfig.authType === "CUSTOM" ? "text-[#FFFCF6]/85" : "text-[#315E48]"}`}>
                    Sử dụng SendGrid, Mailgun, Amazon SES hoặc SMTP riêng.
                  </div>
                </button>
              </div>
            </div>

            {/* FORM 1: GOOGLE OAUTH 2.0 */}
            {smtpConfig.authType === "OAUTH2" && (
              <div className="space-y-4">
                {/* Guide Accordion */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/30 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#204434] flex items-center gap-1.5 text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
                      Hướng dẫn lấy 3 thông số Google OAuth 2.0 (Chỉ mất 2 phút):
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOauthGuide(!showOauthGuide)}
                      className="text-[11px] font-bold text-[#315E48] hover:text-[#204434] underline cursor-pointer"
                    >
                      {showOauthGuide ? "Thu gọn hướng dẫn" : "Xem chi tiết từng bước"}
                    </button>
                  </div>

                  {showOauthGuide && (
                    <div className="space-y-3 pt-2 border-t border-[#BC9B6B]/20 text-[#315E48] leading-relaxed">
                      {/* Step 1 */}
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#204434] text-[#FFFCF6] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </span>
                        <div className="space-y-1">
                          <p>
                            Truy cập{" "}
                            <a
                              href="https://console.cloud.google.com/apis/credentials"
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-[#204434] underline hover:text-[#9D493E] inline-flex items-center gap-0.5"
                            >
                              Google Cloud Console Credentials <ExternalLink className="w-3 h-3" />
                            </a>{" "}
                            → Bật thư viện <strong>Gmail API</strong>.
                          </p>
                          <p className="text-[11px] text-[#315E48]/80">
                            Bấm <strong>Create Credentials</strong> → chọn <strong>OAuth client ID</strong> → Loại ứng dụng: <strong>Web application</strong>.
                          </p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-[11px] font-semibold">Thêm mục Authorized redirect URIs:</span>
                            <code className="px-2 py-0.5 rounded bg-[#FFFCF6] border border-[#BC9B6B]/30 font-mono text-[10px] text-[#9D493E]">
                              https://developers.google.com/oauthplayground
                            </code>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText("https://developers.google.com/oauthplayground");
                                setCopiedKey("uri");
                                setTimeout(() => setCopiedKey(null), 2000);
                              }}
                              className="px-2 py-0.5 rounded bg-[#204434]/10 hover:bg-[#204434] text-[#204434] hover:text-[#FFFCF6] text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
                            >
                              {copiedKey === "uri" ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey === "uri" ? "Đã chép" : "Sao chép"}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#204434] text-[#FFFCF6] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </span>
                        <div>
                          <p>
                            Sao chép <strong>Client ID</strong> và <strong>Client Secret</strong> từ cửa sổ vừa tạo dán vào 2 ô tương ứng bên dưới.
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#204434] text-[#FFFCF6] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </span>
                        <div className="space-y-1">
                          <p>
                            Mở{" "}
                            <a
                              href="https://developers.google.com/oauthplayground"
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-[#204434] underline hover:text-[#9D493E] inline-flex items-center gap-0.5"
                            >
                              Google OAuth 2.0 Playground <ExternalLink className="w-3 h-3" />
                            </a>{" "}
                            để lấy <strong>Refresh Token</strong>:
                          </p>
                          <ul className="list-disc list-inside text-[11px] space-y-0.5 text-[#315E48]/90">
                            <li>Bấm biểu tượng bánh răng ⚙️ ở góc trên bên phải → Tích chọn <strong>Use your own OAuth credentials</strong> → Dán Client ID & Client Secret vừa lấy.</li>
                            <li>Ở cột trái (Step 1), cuộn xuống mục <strong>Gmail API v1</strong> → Tích chọn <code className="font-mono text-[#9D493E]">https://mail.google.com/</code>.</li>
                            <li>Bấm <strong>Authorize APIs</strong> → Đăng nhập tài khoản Gmail gửi OTP và bấm Cho phép.</li>
                            <li>Tại Step 2, bấm nút xanh <strong>Exchange authorization code for tokens</strong> → Sao chép chuỗi <strong>Refresh token</strong> dán vào ô bên dưới.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* OAuth Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-[#204434] font-semibold mb-1">
                      Địa chỉ Gmail người gửi (User Email) <span className="text-[#9D493E]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={smtpConfig.user}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                      placeholder="vd: vuthuthuy05052006@gmail.com hoặc email trung tâm..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#204434] font-semibold mb-1">
                      Tên hiển thị người gửi (Sender Name)
                    </label>
                    <input
                      type="text"
                      value={smtpConfig.senderName}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, senderName: e.target.value })}
                      placeholder="Hanyu - Lớp Tiếng Trung Cô Ning Ning"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[#204434] font-semibold mb-1">
                      Google Client ID <span className="text-[#9D493E]">*</span>
                    </label>
                    <input
                      type="text"
                      value={smtpConfig.clientId}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, clientId: e.target.value })}
                      placeholder="xxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] font-mono text-xs focus:outline-hidden focus:border-[#204434]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#204434] font-semibold mb-1">
                      Google Client Secret <span className="text-[#9D493E]">*</span>
                    </label>
                    <input
                      type="password"
                      value={smtpConfig.clientSecret}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, clientSecret: e.target.value })}
                      placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] font-mono text-xs focus:outline-hidden focus:border-[#204434]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#204434] font-semibold mb-1">
                      Google Refresh Token <span className="text-[#9D493E]">*</span>
                    </label>
                    <input
                      type="password"
                      value={smtpConfig.refreshToken}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, refreshToken: e.target.value })}
                      placeholder="1//04xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] font-mono text-xs focus:outline-hidden focus:border-[#204434]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FORM 2: APP PASSWORD */}
            {smtpConfig.authType === "PASSWORD" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/30 space-y-2 text-xs">
                  <div className="font-bold text-[#204434] flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#BC9B6B]" />
                    <span>Cách lấy Mật khẩu ứng dụng Google (App Password 16 chữ số):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[#315E48] leading-relaxed">
                    <li>
                      Bật <strong>Xác minh 2 bước</strong> trong{" "}
                      <a
                        href="https://myaccount.google.com/security"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#204434] underline font-bold"
                      >
                        Tài khoản Google → Bảo mật
                      </a>
                      .
                    </li>
                    <li>
                      Mở trang:{" "}
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#204434] underline font-bold"
                      >
                        myaccount.google.com/apppasswords
                      </a>
                      .
                    </li>
                    <li>
                      Đặt tên ứng dụng (vd: <em>Hanyu OTP</em>) rồi sao chép <strong>16 chữ số mật khẩu ứng dụng</strong> dán vào ô bên dưới.
                    </li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-[#204434] font-semibold mb-1">
                      Địa chỉ Gmail người gửi (User) <span className="text-[#9D493E]">*</span>
                    </label>
                    <input
                      type="email"
                      value={smtpConfig.user}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                      placeholder="email-cua-ban@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#204434] font-semibold mb-1">
                      Mật khẩu ứng dụng Google (16 ký tự) <span className="text-[#9D493E]">*</span>
                    </label>
                    <input
                      type="password"
                      value={smtpConfig.password}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                      placeholder="abcd efgh ijkl mnop"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] font-mono focus:outline-hidden focus:border-[#204434]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#204434] font-semibold mb-1">
                      Tên hiển thị người gửi (Sender Name)
                    </label>
                    <input
                      type="text"
                      value={smtpConfig.senderName}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, senderName: e.target.value })}
                      placeholder="Hanyu - Lớp Tiếng Trung Cô Ning Ning"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#204434] font-semibold mb-1">Cổng kết nối Gmail</label>
                    <div className="px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/40 border border-[#BC9B6B]/25 text-[#315E48] font-mono text-xs">
                      smtp.gmail.com:465 (Mã hóa SSL)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FORM 3: CUSTOM SMTP */}
            {smtpConfig.authType === "CUSTOM" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-[#204434] font-semibold mb-1">
                    Máy chủ SMTP (Host) <span className="text-[#9D493E]">*</span>
                  </label>
                  <input
                    type="text"
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                    placeholder="vd: smtp.sendgrid.net, smtp.mailgun.org..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                  />
                </div>

                <div>
                  <label className="block text-[#204434] font-semibold mb-1">
                    Cổng kết nối (Port) <span className="text-[#9D493E]">*</span>
                  </label>
                  <input
                    type="text"
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                    placeholder="465 (SSL) hoặc 587 (TLS)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                  />
                </div>

                <div>
                  <label className="block text-[#204434] font-semibold mb-1">
                    Tài khoản gửi (User / API Key) <span className="text-[#9D493E]">*</span>
                  </label>
                  <input
                    type="text"
                    value={smtpConfig.user}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                    placeholder="apikey hoặc email đăng nhập SMTP..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                  />
                </div>

                <div>
                  <label className="block text-[#204434] font-semibold mb-1">
                    Mật khẩu / Secret Key <span className="text-[#9D493E]">*</span>
                  </label>
                  <input
                    type="password"
                    value={smtpConfig.password}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                    placeholder="Nhập mật khẩu SMTP..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] font-mono focus:outline-hidden focus:border-[#204434]"
                  />
                </div>

                <div>
                  <label className="block text-[#204434] font-semibold mb-1">
                    Tên hiển thị người gửi (Sender Name)
                  </label>
                  <input
                    type="text"
                    value={smtpConfig.senderName}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, senderName: e.target.value })}
                    placeholder="Hanyu - Lớp Tiếng Trung Cô Ning Ning"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                  />
                </div>

                <div>
                  <label className="block text-[#204434] font-semibold mb-1">Phương thức mã hóa</label>
                  <select
                    value={smtpConfig.encryption}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, encryption: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                  >
                    <option value="SSL">SSL / TLS (Port 465)</option>
                    <option value="TLS">STARTTLS (Port 587)</option>
                    <option value="NONE">Không mã hóa (Local test)</option>
                  </select>
                </div>
              </div>
            )}

            {/* LIVE TEST SEND SECTION */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#204434]/5 border border-[#204434]/20 space-y-3 text-xs">
              <div className="font-bold text-[#204434] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-[#BC9B6B]" />
                  <span>Kiểm thử kết nối: Gửi 1 email OTP thực tế đến hộp thư của bạn</span>
                </span>
                <span className="text-[11px] text-[#315E48]">Kiểm tra tức thì</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email cá nhân để nhận thư test (vd: hop-thu-cua-ban@gmail.com)..."
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                />
                <button
                  type="button"
                  disabled={testingEmail || !testEmailRecipient.trim()}
                  onClick={async () => {
                    setTestingEmail(true);
                    setTestEmailResult(null);
                    try {
                      const res = await fetch("/api/v1/admin/smtp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          ...smtpConfig,
                          action: "TEST_CONNECTION",
                          testRecipient: testEmailRecipient.trim(),
                        }),
                      });
                      const data = await res.json();
                      setTestEmailResult({ success: data.success, message: data.message });
                      if (data.success) {
                        showToast("Đã gửi thành công email OTP kiểm thử! Vui lòng mở hòm thư.", "success");
                      } else {
                        showToast(data.message || "Gửi email thất bại", "error");
                      }
                    } catch (err: any) {
                      setTestEmailResult({ success: false, message: "Lỗi kết nối máy chủ khi gửi thử email." });
                    } finally {
                      setTestingEmail(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-sm"
                >
                  {testingEmail ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi thử nghiệm ngay</span>
                    </>
                  )}
                </button>
              </div>

              {testEmailResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                    testEmailResult.success
                      ? "bg-green-50 border-green-200 text-green-900"
                      : "bg-red-50 border-red-200 text-red-900"
                  }`}
                >
                  {testEmailResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{testEmailResult.message}</span>
                </div>
              )}
            </div>

            {/* Save Buttons & Status */}
            <div className="pt-3 border-t border-[#BC9B6B]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-[#315E48]">
                {smtpSaved
                  ? "✓ Đã lưu cấu hình máy chủ gửi mail vào hệ thống Hanyu"
                  : "Mọi học viên khi đăng ký tài khoản sẽ tự động nhận OTP qua kết nối này."}
              </span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/v1/admin/smtp", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(smtpConfig),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setSmtpSaved(true);
                      showToast(data.message || "Đã lưu cấu hình thành công!", "success");
                    } else {
                      showToast(data.message || "Không thể lưu cấu hình", "error");
                    }
                  } catch {
                    showToast("Lỗi kết nối khi lưu cấu hình", "error");
                  }
                }}
                className="bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shadow-md shadow-[#204434]/15 flex items-center justify-center gap-1.5"
              >
                <Server className="w-4 h-4" />
                <span>Lưu cấu hình gửi mail</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: CURRICULUM & LESSON BUILDER */}
        {activeTab === "curriculum" && (
          <CurriculumBuilderWorkspace showToast={showToast} />
        )}
      </main>

      {/* MODAL 1: CẤP TÀI KHOẢN MỚI */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#204434]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] w-full max-w-md rounded-3xl border border-[#BC9B6B]/40 shadow-2xl p-6 sm:p-7 space-y-4 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-[#315E48] hover:bg-[#204434]/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#204434] text-[#FFFCF6] flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#204434]">Cấp tài khoản mới</h3>
                <p className="text-xs text-[#315E48]">Thêm người dùng trực tiếp vào hệ cơ sở dữ liệu</p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs sm:text-sm pt-2">
              <div>
                <label className="block text-[#204434] font-semibold mb-1">
                  Họ và tên <span className="text-[#9D493E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="vd: Nguyễn Văn An"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                />
              </div>

              <div>
                <label className="block text-[#204434] font-semibold mb-1">
                  Tên đăng nhập (username) <span className="text-[#9D493E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="vd: nguyenvana (viết liền không dấu)"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[#204434] font-semibold mb-1">Địa chỉ Email</label>
                <input
                  type="email"
                  placeholder="vd: nguyenvana@gmail.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                />
              </div>

              <div>
                <label className="block text-[#204434] font-semibold mb-1">
                  Mật khẩu ban đầu <span className="text-[#9D493E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[#204434] font-semibold mb-1">Vai trò cấp quyền</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { role: "STUDENT", label: "Học viên" },
                    { role: "TEACHER", label: "Giáo viên" },
                    { role: "ADMIN", label: "Quản trị" },
                  ].map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() =>
                        setNewUserData({ ...newUserData, role: r.role as any })
                      }
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        newUserData.role === r.role
                          ? "bg-[#204434] text-[#FFFCF6] border-[#204434]"
                          : "bg-[#F8F5ED] text-[#315E48] border-[#BC9B6B]/25 hover:bg-[#204434]/10"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#BC9B6B]/30 text-[#315E48] hover:bg-[#204434]/5 font-semibold text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] font-semibold text-xs transition shadow-md shadow-[#204434]/20 cursor-pointer disabled:opacity-70"
                >
                  {creatingUser ? "Đang tạo..." : "Xác nhận cấp tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ĐẶT LẠI MẬT KHẨU */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 bg-[#204434]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] w-full max-w-sm rounded-3xl border border-[#BC9B6B]/40 shadow-2xl p-6 space-y-4 relative">
            <button
              onClick={() => setResetTargetUser(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-[#315E48] hover:bg-[#204434]/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#204434]">Đặt lại mật khẩu</h3>
                <p className="text-xs text-[#315E48]">
                  Tài khoản: <span className="font-semibold text-[#204434]">{resetTargetUser.name}</span> (@{resetTargetUser.username})
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs sm:text-sm">
              <div>
                <label className="block text-[#204434] font-semibold mb-1">Mật khẩu mới</label>
                <input
                  type="text"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434] font-mono text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewPasswordInput("hanyu2026")}
                  className="text-[11px] text-[#315E48] hover:underline cursor-pointer"
                >
                  + Đặt mặc định "hanyu2026"
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-4 py-2 rounded-xl border border-[#BC9B6B]/30 text-[#315E48] hover:bg-[#204434]/5 font-semibold text-xs"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={resettingPassword}
                  onClick={handleResetPassword}
                  className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] font-semibold text-xs transition shadow-md shadow-[#204434]/20 cursor-pointer disabled:opacity-70"
                >
                  {resettingPassword ? "Đang lưu..." : "Lưu mật khẩu mới"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Bottom Navigation Bar cho Admin (Phong cách Thủy Mặc Hanyu) */}
      <nav
        aria-label="Điều hướng nhanh quản trị trên điện thoại"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#FAF7F0]/95 backdrop-blur-md border-t border-[#BC9B6B]/30 px-3 py-1.5 flex items-center justify-around shadow-[0_-4px_16px_rgba(32,68,52,0.06)]"
      >
        <button
          type="button"
          onClick={() => selectAdminTab("overview")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition cursor-pointer ${
            activeTab === "overview"
              ? "bg-[#204434] text-[#FFFCF6] font-serif shadow-xs"
              : "text-[#526c50] hover:text-[#204434]"
          }`}
        >
          <BarChart3 className="w-4.5 h-4.5 stroke-[1.9]" />
          <span className="text-[10px] mt-0.5">Tổng quan</span>
        </button>

        <button
          type="button"
          onClick={() => selectAdminTab("curriculum")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition cursor-pointer ${
            activeTab === "curriculum"
              ? "bg-[#204434] text-[#FFFCF6] font-serif shadow-xs"
              : "text-[#526c50] hover:text-[#204434]"
          }`}
        >
          <BookOpen className="w-4.5 h-4.5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5">Giáo trình</span>
        </button>

        <button
          type="button"
          onClick={() => selectAdminTab("users")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition cursor-pointer ${
            activeTab === "users"
              ? "bg-[#204434] text-[#FFFCF6] font-serif shadow-xs"
              : "text-[#526c50] hover:text-[#204434]"
          }`}
        >
          <Users className="w-4.5 h-4.5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5">Tài khoản</span>
        </button>

        <button
          type="button"
          onClick={() => selectAdminTab("ai")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition cursor-pointer ${
            activeTab === "ai"
              ? "bg-[#204434] text-[#FFFCF6] font-serif shadow-xs"
              : "text-[#526c50] hover:text-[#204434]"
          }`}
        >
          <Sparkles className="w-4.5 h-4.5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5">Trợ lý AI</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-[#526c50] hover:text-[#204434] transition cursor-pointer"
        >
          <Menu className="w-4.5 h-4.5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5">Danh mục</span>
        </button>
      </nav>
    </div>
  );
}
