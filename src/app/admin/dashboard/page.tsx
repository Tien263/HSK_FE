"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const [activeTab, setActiveTab] = useState<"users" | "otp" | "smtp">("users");

  // Users data
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    studentCount: 0,
    teacherCount: 0,
    adminCount: 0,
    activeCount: 0,
    lockedCount: 0,
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

  // SMTP Settings State
  const [smtpConfig, setSmtpConfig] = useState({
    host: "smtp.gmail.com",
    port: "465",
    user: "",
    password: "",
    senderName: "Hanyu - Lớp Tiếng Trung Cô Ning Ning",
    encryption: "SSL",
  });
  const [smtpSaved, setSmtpSaved] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Tải cấu hình SMTP đã lưu
  const fetchSmtpConfig = async () => {
    try {
      const res = await fetch("/api/v1/admin/smtp");
      const data = await res.json();
      if (data.success && data.config) {
        setSmtpConfig({
          host: data.config.host || "smtp.gmail.com",
          port: String(data.config.port || 465),
          user: data.config.user || "",
          password: data.config.password || "",
          senderName: data.config.senderName || "Hanyu - Lớp Tiếng Trung Cô Ning Ning",
          encryption: Number(data.config.port) === 465 ? "SSL" : "TLS",
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

      const res = await fetch(`/api/v1/admin/users?${params.toString()}`);
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
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#204434] font-sans selection:bg-[#204434] selection:text-[#FFFCF6]">
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
          <div className="flex items-center gap-3.5">
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
                  Trung tâm Quản trị Tài khoản & Dịch vụ API Hệ thống
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
                ROOT ADMIN
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
      <main className="max-w-[1920px] mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* KPI Stats Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
              <span>Học viên</span>
              <GraduationCap className="w-4 h-4 text-[#315E48]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-[#315E48]">
                {stats.studentCount}
              </span>
              <span className="text-[11px] text-[#315E48]">người học</span>
            </div>
          </div>

          <div className="bg-[#FFFCF6] p-4 rounded-2xl border border-[#BC9B6B]/25 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#9D493E] font-medium">
              <span>Giáo viên</span>
              <Briefcase className="w-4 h-4 text-[#9D493E]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-[#9D493E]">
                {stats.teacherCount}
              </span>
              <span className="text-[11px] text-[#315E48]">giảng dạy</span>
            </div>
          </div>

          <div className="bg-[#FFFCF6] p-4 rounded-2xl border border-[#BC9B6B]/25 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#7A5B2E] font-medium">
              <span>Quản trị viên</span>
              <Shield className="w-4 h-4 text-[#BC9B6B]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-[#7A5B2E]">
                {stats.adminCount}
              </span>
              <span className="text-[11px] text-[#315E48]">admin</span>
            </div>
          </div>

          <div className="bg-[#FFFCF6] p-4 rounded-2xl border border-[#BC9B6B]/25 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#204434] font-medium">
              <span>Hoạt động</span>
              <CheckCircle2 className="w-4 h-4 text-[#315E48]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-[#204434]">
                {stats.activeCount}
              </span>
              <span className="text-[11px] text-[#315E48]">khả dụng</span>
            </div>
          </div>

          <div className="bg-[#FFFCF6] p-4 rounded-2xl border border-[#BC9B6B]/25 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#9D493E] font-medium">
              <span>Bị tạm khóa</span>
              <Lock className="w-4 h-4 text-[#9D493E]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-[#9D493E]">
                {stats.lockedCount}
              </span>
              <span className="text-[11px] text-[#315E48]">đã khóa</span>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-[#BC9B6B]/25 pb-2">
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                activeTab === "users"
                  ? "bg-[#204434] text-[#FFFCF6] shadow-md shadow-[#204434]/20"
                  : "bg-[#FFFCF6] text-[#315E48] hover:bg-[#204434]/10 border border-[#BC9B6B]/20"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Quản lý Tài khoản ({stats.totalUsers})</span>
            </button>

            <button
              onClick={() => setActiveTab("otp")}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                activeTab === "otp"
                  ? "bg-[#204434] text-[#FFFCF6] shadow-md shadow-[#204434]/20"
                  : "bg-[#FFFCF6] text-[#315E48] hover:bg-[#204434]/10 border border-[#BC9B6B]/20"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>API Gửi OTP qua Email</span>
            </button>

            <button
              onClick={() => setActiveTab("smtp")}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                activeTab === "smtp"
                  ? "bg-[#204434] text-[#FFFCF6] shadow-md shadow-[#204434]/20"
                  : "bg-[#FFFCF6] text-[#315E48] hover:bg-[#204434]/10 border border-[#BC9B6B]/20"
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Cấu hình SMTP Gateway</span>
            </button>
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

        {/* TAB 3: SMTP GATEWAY CONFIG */}
        {activeTab === "smtp" && (
          <div className="max-w-4xl mx-auto bg-[#FFFCF6] p-6 sm:p-8 rounded-2xl border border-[#BC9B6B]/25 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#BC9B6B]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center font-bold">
                  <Server className="w-5 h-5 text-[#204434]" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-[#204434]">
                    Cấu hình Máy chủ Gửi Email (SMTP Gateway)
                  </h2>
                  <p className="text-xs text-[#315E48]">
                    Thiết lập kết nối máy chủ gửi mail để kích hoạt gửi OTP thực tế đến hộp thư người dùng
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#315E48]/15 text-[#315E48] font-bold text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#315E48]" />
                {smtpConfig.user && smtpConfig.password ? "Đã có cấu hình" : "Chưa thiết lập"}
              </span>
            </div>

            {/* Quick Gmail Guide Banner */}
            <div className="p-4 rounded-2xl bg-[#F7F4EB] border border-[#BC9B6B]/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#204434] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
                  Hướng dẫn cấu hình gửi email qua Gmail:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSmtpConfig({
                      ...smtpConfig,
                      host: "smtp.gmail.com",
                      port: "465",
                      encryption: "SSL",
                    });
                    showToast("Đã chọn cấu hình chuẩn cho Gmail (smtp.gmail.com, port 465)", "success");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#204434] text-white text-[11px] font-bold hover:bg-[#183629] transition cursor-pointer"
                >
                  Áp dụng mẫu Gmail
                </button>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[#315E48] leading-relaxed">
                <li>Truy cập cài đặt bảo mật Google của bạn: <strong>Tài khoản Google → Bảo mật → Bật Xác minh 2 bước</strong>.</li>
                <li>Mở liên kết tạo mật khẩu ứng dụng: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-[#204434] underline font-bold">myaccount.google.com/apppasswords</a>.</li>
                <li>Tạo một tên ứng dụng (vd: <em>Hanyu Web</em>) rồi sao chép <strong>16 chữ số mật khẩu ứng dụng</strong> vào ô Mật khẩu bên dưới.</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block text-[#204434] font-semibold mb-1">
                  Máy chủ SMTP (Host)
                </label>
                <input
                  type="text"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                />
              </div>

              <div>
                <label className="block text-[#204434] font-semibold mb-1">
                  Cổng kết nối (Port)
                </label>
                <input
                  type="text"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                  placeholder="465 hoặc 587"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434]"
                />
              </div>

              <div>
                <label className="block text-[#204434] font-semibold mb-1">
                  Địa chỉ Gmail người gửi (User)
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
                  Mật khẩu ứng dụng Google (16 chữ số)
                </label>
                <input
                  type="password"
                  value={smtpConfig.password}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                  placeholder="Nhập 16 ký tự app password..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/35 text-[#204434] focus:outline-hidden focus:border-[#204434] font-mono"
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
                  <option value="SSL">SSL / TLS (Port 465 - Khuyên dùng cho Gmail)</option>
                  <option value="TLS">STARTTLS (Port 587)</option>
                  <option value="NONE">Không mã hóa (Local test)</option>
                </select>
              </div>
            </div>

            {/* Live Test Send Section */}
            <div className="p-4 rounded-2xl bg-[#204434]/5 border border-[#204434]/20 space-y-3 text-xs">
              <div className="font-bold text-[#204434] flex items-center gap-1.5">
                <Send className="w-4 h-4 text-[#BC9B6B]" />
                <span>Gửi thử 1 email kiểm tra kết nối trực tiếp đến hộp thư của bạn:</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Nhập email bạn muốn nhận thư test (vd: email-ca-nhan@gmail.com)..."
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#BC9B6B]/35 text-[#204434]"
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
                        showToast("Đã gửi thành công email test!", "success");
                      } else {
                        showToast(data.message || "Gửi email thất bại", "error");
                      }
                    } catch (err: any) {
                      setTestEmailResult({ success: false, message: "Lỗi kết nối máy chủ khi gửi thử email." });
                    } finally {
                      setTestingEmail(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
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
                  className={`p-3 rounded-xl border flex items-center gap-2 ${
                    testEmailResult.success
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  {testEmailResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{testEmailResult.message}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#BC9B6B]/20 flex items-center justify-between">
              <span className="text-xs text-[#315E48]">
                {smtpSaved ? "✓ Đã lưu cấu hình SMTP vào hệ thống" : "Cấu hình này sẽ được dùng để gửi toàn bộ mã OTP đăng ký"}
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
                      showToast(data.message || "Đã lưu cấu hình SMTP thành công!", "success");
                    } else {
                      showToast(data.message || "Không thể lưu cấu hình SMTP", "error");
                    }
                  } catch {
                    showToast("Lỗi kết nối khi lưu cấu hình SMTP", "error");
                  }
                }}
                className="bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer"
              >
                Lưu cấu hình SMTP
              </button>
            </div>
          </div>
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
    </div>
  );
}
