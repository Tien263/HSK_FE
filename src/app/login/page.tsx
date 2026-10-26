"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Check,
  AlertCircle,
  Home,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (overrideUser?: string, overridePass?: string) => {
    setError("");

    const u = (overrideUser !== undefined ? overrideUser : identifier).trim();
    const p = (overridePass !== undefined ? overridePass : password).trim();

    if (!u) {
      setError("Vui lòng nhập email hoặc tên đăng nhập.");
      return;
    }
    if (!p) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Thông tin đăng nhập không hợp lệ.");
        setLoading(false);
        return;
      }

      // Lưu phiên đăng nhập
      localStorage.removeItem("currentUser");
      sessionStorage.removeItem("currentUser");
      if (rememberMe) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
      } else {
        sessionStorage.setItem("currentUser", JSON.stringify(data.user));
      }

      // Điều hướng theo vai trò và trạng thái thiết lập
      if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (data.user.role === "TEACHER") {
        router.push("/t/dashboard");
      } else {
        // Kiểm tra xem học viên đã hoàn thành thiết lập mục tiêu chưa
        const onboardingDone = localStorage.getItem(`hanyu_onboarding_${data.user.id}`) ||
                               localStorage.getItem("hanyu_onboarding_completed");
        
        if (onboardingDone) {
          router.push("/s/home");
        } else {
          // Chưa thiết lập -> chuyển đến onboarding
          router.push("/onboarding");
        }
      }
    } catch (err) {
      setError("Mất kết nối internet hoặc máy chủ không phản hồi. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const quickDemoLogin = (type: "student" | "teacher" | "admin") => {
    if (type === "student") {
      setIdentifier("student");
      setPassword("student123");
      handleLogin("student", "student123");
    } else if (type === "teacher") {
      setIdentifier("teacher");
      setPassword("teacher123");
      handleLogin("teacher", "teacher123");
    } else if (type === "admin") {
      setIdentifier("admin");
      setPassword("admin123");
      handleLogin("admin", "admin123");
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between bg-[#F8F5ED] text-[#204434] font-sans selection:bg-[#204434] selection:text-[#FFFCF6] relative overflow-y-auto lg:overflow-hidden">
      
      {/* ===================== FULL-BLEED ARTWORK BACKGROUND ===================== */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/theme/bg-auth-master.jpg"
          alt="Sơn thủy trà xanh Hanyu"
          fill
          priority
          className="object-cover object-center filter saturate-100"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8F5ED]/35 via-transparent to-[#F8F5ED]/65" />
      </div>

      {/* Top Bar */}
      <header className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 2xl:px-16 py-3 2xl:py-5 flex items-center justify-between z-10 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 2xl:gap-3 group">
          <div className="w-8 h-8 2xl:w-9 2xl:h-9 rounded-xl bg-[#9D493E] text-[#FFFCF6] flex items-center justify-center font-serif text-base 2xl:text-lg font-bold shadow-md group-hover:scale-105 transition-transform">
            <span>宁</span>
          </div>
          <div>
            <div className="font-serif font-bold text-lg 2xl:text-xl text-[#204434] tracking-tight drop-shadow-xs">Hanyu</div>
            <div className="text-[10px] 2xl:text-[11px] text-[#315E48] tracking-widest uppercase font-semibold">Tiếng Trung & HSK 3.0</div>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#204434] hover:text-[#183629] bg-[#FFFCF6]/85 hover:bg-[#FFFCF6] px-3.5 2xl:px-4 py-1.5 2xl:py-2 rounded-full border border-[#BC9B6B]/40 transition-all shadow-sm backdrop-blur-sm"
        >
          <Home className="w-3.5 h-3.5 text-[#315E48]" />
          <span>Về trang chủ</span>
        </Link>
      </header>

      {/* Main 2-Column Section: Scaled for 1366x768 laptops through 1920x1080 and 4K */}
      <main className="w-full max-w-5xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 2xl:px-12 my-auto relative z-10 py-2 2xl:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-12 items-center">
          
          {/* Left Column (Desktop Only): Classical Poetry & Scholar Badge */}
          <div className="lg:col-span-6 hidden lg:flex flex-col justify-center pr-2 2xl:pr-6">
            <div className="p-5 2xl:p-8 rounded-3xl bg-[#FFFCF6]/80 backdrop-blur-md border border-[#BC9B6B]/35 shadow-xl shadow-[#204434]/10 space-y-3 2xl:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#204434]/10 text-[11px] 2xl:text-xs font-semibold text-[#204434]">
                <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
                <span>Không gian học tập truyền thống & bài bản</span>
              </div>

              <h2 className="font-serif text-2xl 2xl:text-4xl font-bold tracking-tight text-[#204434] leading-snug">
                “千里之行，始于足下”
              </h2>
              
              <p className="text-[11px] 2xl:text-xs text-[#315E48] font-mono">
                Qiān lǐ zhī xíng, shǐ yú zú xià
              </p>

              <p className="text-xs 2xl:text-sm text-[#315E48] leading-relaxed">
                Hành trình vạn dặm bắt đầu từ một bước chân. Học tiếng Trung bài bản, kiên trì mỗi ngày cùng phương pháp chuẩn HSK 3.0.
              </p>

              <div className="pt-2 border-t border-[#BC9B6B]/25 flex items-center justify-between text-[11px] 2xl:text-xs text-[#315E48]">
                <span>博学笃行 · 沉潜致远</span>
                <span className="font-serif font-bold text-[#9D493E]">宁 Ning Ning</span>
              </div>
            </div>

            {/* Quick Demo Switcher for fast test */}
            <div className="mt-3 2xl:mt-4 p-3 2xl:p-3.5 rounded-2xl bg-[#FFFCF6]/85 border border-[#BC9B6B]/30 backdrop-blur-md flex items-center justify-between text-xs shadow-sm">
              <span className="text-[#315E48] font-semibold flex items-center gap-1.5 text-[11px] 2xl:text-xs">
                <span className="w-2 h-2 rounded-full bg-[#BC9B6B]" />
                Đăng nhập mẫu:
              </span>
              <div className="flex gap-1.5 2xl:gap-2">
                <button
                  type="button"
                  onClick={() => quickDemoLogin("student")}
                  className="px-2 2xl:px-2.5 py-1 2xl:py-1.5 rounded-xl bg-[#204434]/10 hover:bg-[#204434] text-[#204434] hover:text-[#FFFCF6] font-semibold text-[11px] 2xl:text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Học viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickDemoLogin("teacher")}
                  className="px-2 2xl:px-2.5 py-1 2xl:py-1.5 rounded-xl bg-[#9D493E]/10 hover:bg-[#9D493E] text-[#9D493E] hover:text-[#FFFCF6] font-semibold text-[11px] 2xl:text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Giáo viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickDemoLogin("admin")}
                  className="px-2 2xl:px-2.5 py-1 2xl:py-1.5 rounded-xl bg-[#BC9B6B]/20 hover:bg-[#BC9B6B] text-[#7A5B2E] hover:text-[#FFFCF6] font-semibold text-[11px] 2xl:text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Ivory Form Card */}
          <div className="lg:col-span-6 w-full max-w-sm 2xl:max-w-md mx-auto">
            <div className="bg-[#FFFCF6]/95 backdrop-blur-md border border-[#BC9B6B]/35 rounded-3xl p-5 sm:p-6 2xl:p-9 shadow-2xl shadow-[#204434]/10">
              
              {/* Header */}
              <div className="mb-4 2xl:mb-6">
                <div className="w-7 2xl:w-8 h-1 bg-[#204434] rounded-full mb-2 2xl:mb-3" />
                <h1 className="font-serif text-2xl 2xl:text-3xl font-bold text-[#204434] tracking-tight">
                  Đăng nhập
                </h1>
                <p className="text-xs 2xl:text-sm text-[#315E48] mt-1">
                  Tiếp tục hành trình học tiếng Trung cùng Hanyu.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-3 2xl:mb-4 p-3 rounded-xl bg-[#9D493E]/10 border border-[#9D493E]/30 text-xs text-[#9D493E] font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="space-y-3 2xl:space-y-4"
              >
                {/* Username / Email */}
                <div>
                  <label className="block text-[11px] 2xl:text-xs font-semibold text-[#204434] mb-1">
                    Email hoặc tên đăng nhập
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-[#315E48]/70 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="student@hanyu.edu.vn hoặc student"
                      className="w-full bg-[#F8F5ED]/80 border border-[#BC9B6B]/35 focus:border-[#204434] focus:bg-[#FFFCF6] focus:ring-2 focus:ring-[#204434]/15 rounded-xl pl-10 pr-4 py-2 2xl:py-2.5 text-xs 2xl:text-sm text-[#204434] placeholder-[#315E48]/50 outline-none transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] 2xl:text-xs font-semibold text-[#204434] mb-1">
                    Mật khẩu
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#315E48]/70 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="w-full bg-[#F8F5ED]/80 border border-[#BC9B6B]/35 focus:border-[#204434] focus:bg-[#FFFCF6] focus:ring-2 focus:ring-[#204434]/15 rounded-xl pl-10 pr-11 py-2 2xl:py-2.5 text-xs 2xl:text-sm text-[#204434] placeholder-[#315E48]/50 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      className="absolute right-3.5 text-[#315E48]/70 hover:text-[#204434] transition p-0.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-[11px] 2xl:text-xs pt-0.5">
                  <label className="flex items-center gap-1.5 2xl:gap-2 cursor-pointer select-none text-[#315E48] hover:text-[#204434] transition font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#BC9B6B] text-[#204434] focus:ring-[#204434] w-3.5 h-3.5 cursor-pointer accent-[#204434]"
                    />
                    <span>Ghi nhớ</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setError("Để lấy lại mật khẩu tài khoản học tập nội bộ, vui lòng liên hệ trực tiếp giáo viên phụ trách hoặc quản trị viên hệ thống.");
                    }}
                    className="text-[#315E48] hover:text-[#204434] hover:underline font-medium cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] font-semibold py-2.5 2xl:py-3 rounded-xl transition duration-200 shadow-md shadow-[#204434]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-1.5 2xl:mt-2 text-xs 2xl:text-sm"
                >
                  {loading ? (
                    <div className="w-4 h-4 2xl:w-5 2xl:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Create Account Divider */}
                <div className="relative my-2.5 2xl:my-3 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#BC9B6B]/20" />
                  </div>
                  <span className="relative bg-[#FFFCF6] px-2.5 text-[10px] 2xl:text-[11px] text-[#315E48]/70 uppercase tracking-wider font-semibold">
                    Hoặc
                  </span>
                </div>

                {/* Create Account Button */}
                <Link
                  href="/register"
                  className="w-full block text-center py-2 2xl:py-2.5 rounded-xl border border-[#204434]/40 hover:border-[#204434] bg-transparent hover:bg-[#204434]/5 text-[#204434] font-semibold text-xs 2xl:text-sm transition"
                >
                  Tạo tài khoản mới
                </Link>
              </form>

              {/* Mobile Quick Switcher */}
              <div className="mt-4 pt-3 border-t border-[#BC9B6B]/20 lg:hidden flex items-center justify-between text-xs">
                <span className="text-[#315E48] font-medium text-[11px]">Mẫu thử:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => quickDemoLogin("student")}
                    className="px-2 py-0.5 rounded-lg bg-[#204434]/10 text-[#204434] font-semibold text-[11px]"
                  >
                    Học viên
                  </button>
                  <button
                    type="button"
                    onClick={() => quickDemoLogin("teacher")}
                    className="px-2 py-0.5 rounded-lg bg-[#9D493E]/10 text-[#9D493E] font-semibold text-[11px]"
                  >
                    Giáo viên
                  </button>
                  <button
                    type="button"
                    onClick={() => quickDemoLogin("admin")}
                    className="px-2 py-0.5 rounded-lg bg-[#BC9B6B]/20 text-[#7A5B2E] font-semibold text-[11px]"
                  >
                    Admin
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 py-2.5 2xl:py-4 text-center text-[11px] 2xl:text-xs text-[#204434] font-medium z-10 drop-shadow-xs shrink-0">
        © 2026 Hanyu · Nền tảng học tiếng Trung và Luyện thi HSK 3.0 · Phong cách Thủy Mặc Tối Giản
      </footer>
    </div>
  );
}
