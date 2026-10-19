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

      // Chuyển sang Màn hình 3: Xác minh email
      router.push(`/verify-email?email=${encodeURIComponent(cleanEmail)}`);
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#204434] font-sans flex flex-col justify-between selection:bg-[#204434] selection:text-[#FFFCF6]">
      {/* Top Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#9D493E] text-[#FFFCF6] flex items-center justify-center font-serif text-lg font-bold shadow-sm group-hover:scale-105 transition-transform">
            <span>宁</span>
          </div>
          <div>
            <div className="font-serif font-bold text-xl text-[#204434] tracking-tight">Hanyu</div>
            <div className="text-[11px] text-[#315E48] tracking-widest uppercase font-medium">Tiếng Trung & HSK 3.0</div>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#315E48] hover:text-[#204434] bg-white/70 hover:bg-white px-3.5 py-1.5 rounded-full border border-[#BC9B6B]/30 transition-all shadow-xs"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Về trang chủ</span>
        </Link>
      </header>

      {/* Main 2-Column Section */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-8 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (Desktop Only): Classical Chinese Ink Window */}
          <div className="lg:col-span-6 hidden lg:flex flex-col">
            <div className="relative rounded-3xl overflow-hidden border border-[#BC9B6B]/35 shadow-2xl shadow-[#204434]/10 aspect-[4/3] bg-[#EFE8DC]">
              <Image
                src="/theme/landing-moon-desk.jpg"
                alt="Khung cảnh học tiếng Trung thanh tịnh"
                fill
                priority
                className="object-cover object-center filter saturate-95 hover:scale-102 transition duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#204434]/70 via-[#204434]/20 to-transparent" />
              
              {/* Overlay Poem & Seal */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-medium text-[#FFFCF6] mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
                  <span>Một tài khoản duy nhất · Học trọn đời</span>
                </div>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-[#FFFCF6] leading-snug">
                  “学而时习之，不亦说乎”
                </h3>
                <p className="text-xs text-[#FFFCF6]/85 font-light mt-1">
                  Học tập và thường xuyên rèn luyện, há chẳng vui mừng lắm sao?
                </p>
              </div>
            </div>

            {/* Value Highlights */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-white/70 border border-[#BC9B6B]/20 text-center">
                <span className="block font-serif text-sm font-bold text-[#204434]">Tự học tự do</span>
                <span className="text-[11px] text-[#315E48]">Lộ trình riêng biệt</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/70 border border-[#BC9B6B]/20 text-center">
                <span className="block font-serif text-sm font-bold text-[#204434]">Lớp giáo viên</span>
                <span className="text-[11px] text-[#315E48]">Giao & chấm bài</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/70 border border-[#BC9B6B]/20 text-center">
                <span className="block font-serif text-sm font-bold text-[#204434]">Không mất điểm</span>
                <span className="text-[11px] text-[#315E48]">Tiến độ đồng bộ</span>
              </div>
            </div>
          </div>

          {/* Right Column: Ivory Form Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-[#FFFCF6] border border-[#BC9B6B]/30 rounded-3xl p-7 sm:p-9 shadow-xl shadow-[#204434]/5">
              
              {/* Header */}
              <div className="mb-6">
                <div className="w-8 h-1 bg-[#204434] rounded-full mb-3" />
                <h1 className="font-serif text-3xl font-bold text-[#204434] tracking-tight">
                  Tạo tài khoản Hanyu
                </h1>
                <p className="text-sm text-[#315E48] mt-1.5">
                  Bắt đầu hành trình học tiếng Trung của bạn.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-[#9D493E]/10 border border-[#9D493E]/30 text-xs text-[#9D493E] font-medium flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#204434] mb-1">
                    Họ và tên
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-[#315E48]/70 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Minh Thảo"
                      className="w-full bg-[#F8F5ED] border border-[#BC9B6B]/30 focus:border-[#204434] focus:bg-[#FFFCF6] focus:ring-2 focus:ring-[#204434]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#204434] placeholder-[#315E48]/50 outline-none transition"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#204434] mb-1">
                    Địa chỉ Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-[#315E48]/70 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ban@example.com"
                      className="w-full bg-[#F8F5ED] border border-[#BC9B6B]/30 focus:border-[#204434] focus:bg-[#FFFCF6] focus:ring-2 focus:ring-[#204434]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#204434] placeholder-[#315E48]/50 outline-none transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#204434] mb-1">
                    Mật khẩu
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#315E48]/70 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full bg-[#F8F5ED] border border-[#BC9B6B]/30 focus:border-[#204434] focus:bg-[#FFFCF6] focus:ring-2 focus:ring-[#204434]/15 rounded-xl pl-10 pr-11 py-2.5 text-sm text-[#204434] placeholder-[#315E48]/50 outline-none transition"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#204434] mb-1">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#315E48]/70 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full bg-[#F8F5ED] border border-[#BC9B6B]/30 focus:border-[#204434] focus:bg-[#FFFCF6] focus:ring-2 focus:ring-[#204434]/15 rounded-xl pl-10 pr-11 py-2.5 text-sm text-[#204434] placeholder-[#315E48]/50 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      className="absolute right-3.5 text-[#315E48]/70 hover:text-[#204434] transition p-0.5 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms agreement checkbox */}
                <div className="pt-1.5">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#315E48] leading-relaxed">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-[#BC9B6B] text-[#204434] focus:ring-[#204434] w-3.5 h-3.5 cursor-pointer accent-[#204434]"
                    />
                    <span>
                      Tôi đồng ý với{" "}
                      <span className="text-[#204434] font-semibold underline underline-offset-2">
                        Điều khoản sử dụng
                      </span>{" "}
                      và{" "}
                      <span className="text-[#204434] font-semibold underline underline-offset-2">
                        Chính sách bảo mật
                      </span>{" "}
                      của Hanyu.
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] font-semibold py-3 rounded-xl transition duration-200 shadow-md shadow-[#204434]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Tạo tài khoản</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Already have account link */}
                <div className="text-center pt-2">
                  <span className="text-xs text-[#315E48]">Đã có tài khoản? </span>
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-[#204434] hover:underline"
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
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 text-center text-xs text-[#315E48]/80 z-10">
        © 2026 Hanyu · Nền tảng học tiếng Trung và Luyện thi HSK 3.0 · Phong cách Thủy Mặc Tối Giản
      </footer>
    </div>
  );
}
