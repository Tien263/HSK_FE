"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Home,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const cleanEmail = email.trim();

    if (!trimmedName) {
      setError("Vui lòng nhập họ và tên của bạn.");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có độ dài tối thiểu 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không trùng khớp.");
      return;
    }

    if (!agreeTerms) {
      setError("Vui lòng đánh dấu đồng ý với Điều khoản sử dụng và Chính sách bảo mật.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Đăng ký không thành công. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      // Lưu thông tin người dùng vào session / localStorage
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      sessionStorage.setItem("registeredEmail", cleanEmail);
      if (data.otpData?.otp) {
        sessionStorage.setItem("lastAutoOtp", data.otpData.otp);
      }

      // Chuyển sang Màn hình 3: Xác minh email bằng mã OTP tự động
      router.push(`/verify-email?email=${encodeURIComponent(cleanEmail)}`);
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.");
      setLoading(false);
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

      {/* Main 2-Column Section */}
      <main className="w-full max-w-5xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 2xl:px-12 my-auto relative z-10 py-2 2xl:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-12 items-center">
          
          {/* Left Column (Desktop Only): Value Highlights floating on Landscape */}
          <div className="lg:col-span-6 hidden lg:flex flex-col justify-center pr-2 2xl:pr-6">
            <div className="p-5 2xl:p-8 rounded-3xl bg-[#FFFCF6]/80 backdrop-blur-md border border-[#BC9B6B]/35 shadow-xl shadow-[#204434]/10 space-y-3 2xl:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#204434]/10 text-[11px] 2xl:text-xs font-semibold text-[#204434]">
                <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
                <span>Một tài khoản duy nhất · Học trọn đời</span>
              </div>

              <h2 className="font-serif text-2xl 2xl:text-4xl font-bold tracking-tight text-[#204434] leading-snug">
                “学而时习之，不亦说乎”
              </h2>
              
              <p className="text-[11px] 2xl:text-xs text-[#315E48] font-mono">
                Xué ér shí xí zhī, bù yì yuè hū
              </p>

              <p className="text-xs 2xl:text-sm text-[#315E48] leading-relaxed">
                Học tập và thường xuyên rèn luyện, há chẳng vui mừng lắm sao? Hệ thống lưu giữ toàn bộ tiến trình học, điểm tích lũy và bài tập của bạn một cách liền mạch.
              </p>

              {/* 3 Pillars */}
              <div className="pt-2 2xl:pt-3 border-t border-[#BC9B6B]/25 grid grid-cols-3 gap-2 2xl:gap-2.5 text-center">
                <div className="p-2 2xl:p-2.5 rounded-xl bg-white/70 border border-[#BC9B6B]/20">
                  <span className="block font-serif text-xs font-bold text-[#204434]">Tự học tự do</span>
                  <span className="text-[10px] text-[#315E48]">Lộ trình riêng</span>
                </div>
                <div className="p-2 2xl:p-2.5 rounded-xl bg-white/70 border border-[#BC9B6B]/20">
                  <span className="block font-serif text-xs font-bold text-[#204434]">Lớp giáo viên</span>
                  <span className="text-[10px] text-[#315E48]">Chấm & giao bài</span>
                </div>
                <div className="p-2 2xl:p-2.5 rounded-xl bg-white/70 border border-[#BC9B6B]/20">
                  <span className="block font-serif text-xs font-bold text-[#204434]">Đồng bộ 100%</span>
                  <span className="text-[10px] text-[#315E48]">Không mất điểm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Ivory Form Card */}
          <div className="lg:col-span-6 w-full max-w-sm 2xl:max-w-md mx-auto">
            <div className="bg-[#FFFCF6]/95 backdrop-blur-md border border-[#BC9B6B]/35 rounded-3xl p-5 sm:p-6 2xl:p-8 shadow-2xl shadow-[#204434]/10">
              
              {/* Header */}
              <div className="mb-3 2xl:mb-4">
                <div className="w-7 2xl:w-8 h-1 bg-[#204434] rounded-full mb-1.5 2xl:mb-2.5" />
                <h1 className="font-serif text-2xl 2xl:text-3xl font-bold text-[#204434] tracking-tight">
                  Tạo tài khoản Hanyu
                </h1>
                <p className="text-xs 2xl:text-sm text-[#315E48] mt-0.5">
                  Bắt đầu hành trình học tiếng Trung của bạn.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-3 p-2.5 2xl:p-3 rounded-xl bg-[#9D493E]/10 border border-[#9D493E]/30 text-xs text-[#9D493E] font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleRegister} className="space-y-2.5 2xl:space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] 2xl:text-xs font-semibold text-[#204434] mb-0.5 2xl:mb-1">
                    Họ và tên
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-[#315E48]/70 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Minh Thảo"
                      className="w-full bg-[#F8F5ED]/80 border border-[#BC9B6B]/35 focus:border-[#204434] focus:bg-[#FFFCF6] focus:ring-2 focus:ring-[#204434]/15 rounded-xl pl-9 pr-3.5 py-1.5 2xl:py-2 text-xs 2xl:text-sm text-[#204434] placeholder-[#315E48]/50 outline-none transition"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] 2xl:text-xs font-semibold text-[#204434] mb-0.5 2xl:mb-1">
                    Địa chỉ Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-[#315E48]/70 absolute left-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ban@example.com"
                      className="w-full bg-[#F8F5ED]/80 border border-[#BC9B6B]/35 focus:border-[#204434] focus:bg-[#FFFCF6] focus:ring-2 focus:ring-[#204434]/15 rounded-xl pl-9 pr-3.5 py-1.5 2xl:py-2 text-xs 2xl:text-sm text-[#204434] placeholder-[#315E48]/50 outline-none transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] 2xl:text-xs font-semibold text-[#204434] mb-0.5 2xl:mb-1">
                    Mật khẩu
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#315E48]/70 absolute left-3 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full bg-[#F8F5ED]/80 border border-[#BC9B6B]/35 focus:border-[#204434] focus:bg-[#FFFCF6] focus:ring-2 focus:ring-[#204434]/15 rounded-xl pl-9 pr-10 py-1.5 2xl:py-2 text-xs 2xl:text-sm text-[#204434] placeholder-[#315E48]/50 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      className="absolute right-3 text-[#315E48]/70 hover:text-[#204434] transition p-0.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] 2xl:text-xs font-semibold text-[#204434] mb-0.5 2xl:mb-1">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#315E48]/70 absolute left-3 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full bg-[#F8F5ED]/80 border border-[#BC9B6B]/35 focus:border-[#204434] focus:bg-[#FFFCF6] focus:ring-2 focus:ring-[#204434]/15 rounded-xl pl-9 pr-10 py-1.5 2xl:py-2 text-xs 2xl:text-sm text-[#204434] placeholder-[#315E48]/50 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      className="absolute right-3 text-[#315E48]/70 hover:text-[#204434] transition p-0.5 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Terms agreement checkbox */}
                <div className="pt-0.5">
                  <label className="flex items-start gap-2 cursor-pointer select-none text-[11px] 2xl:text-xs text-[#315E48] leading-tight">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-[#BC9B6B] text-[#204434] focus:ring-[#204434] w-3.5 h-3.5 cursor-pointer accent-[#204434]"
                    />
                    <span>
                      Đồng ý với{" "}
                      <span className="text-[#204434] font-semibold underline underline-offset-2">
                        Điều khoản
                      </span>{" "}
                      &{" "}
                      <span className="text-[#204434] font-semibold underline underline-offset-2">
                        Chính sách
                      </span>
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] font-semibold py-2.5 2xl:py-3 rounded-xl transition duration-200 shadow-md shadow-[#204434]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-1.5 text-xs 2xl:text-sm"
                >
                  {loading ? (
                    <div className="w-4 h-4 2xl:w-5 2xl:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Tạo tài khoản</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Already have account link */}
                <div className="text-center pt-1.5">
                  <span className="text-[11px] 2xl:text-xs text-[#315E48]">Đã có tài khoản? </span>
                  <Link
                    href="/login"
                    className="text-[11px] 2xl:text-xs font-semibold text-[#204434] hover:underline"
                  >
                    Đăng nhập
                  </Link>
                </div>
              </form>

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
