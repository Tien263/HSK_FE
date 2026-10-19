"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, GraduationCap, UserCheck, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (overrideUser?: string, overridePass?: string, overrideRole?: "STUDENT" | "TEACHER") => {
    setLoading(true);
    setError("");

    const u = overrideUser || identifier;
    const p = overridePass || password;
    const targetRole = overrideRole || role;

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Tên đăng nhập hoặc mật khẩu không chính xác.");
        setLoading(false);
        return;
      }

      // Lưu thông tin phiên đăng nhập
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      // Phân quyền chuyển hướng
      if (data.user.role === "TEACHER" || targetRole === "TEACHER") {
        router.push("/t/dashboard");
      } else {
        router.push("/s/home");
      }
    } catch {
      setError("Không thể kết nối đến máy chủ.");
      setLoading(false);
    }
  };

  const quickLogin = (type: "student" | "teacher") => {
    if (type === "student") {
      setRole("STUDENT");
      setIdentifier("student");
      setPassword("student123");
      handleLogin("student", "student123", "STUDENT");
    } else {
      setRole("TEACHER");
      setIdentifier("teacher");
      setPassword("teacher123");
      handleLogin("teacher", "teacher123", "TEACHER");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] relative overflow-hidden flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#1a3d2f] selection:text-white">
      {/* Traditional Ink Painting Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
        <Image
          src="/theme/bg-auth-landscape.jpg"
          alt="Classical Chinese Shanshui landscape"
          fill
          className="object-cover object-center filter saturate-95 contrast-100"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7f4ee]/85 via-[#f7f4ee]/40 to-[#f7f4ee]/85" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#b91c1c] text-white flex items-center justify-center font-serif text-sm font-bold shadow-sm group-hover:scale-105 transition-transform">
            <span>宁</span>
          </div>
          <div className="leading-tight">
            <span className="font-serif font-bold text-xl text-[#1a3d2f] tracking-tight block">
              Hanyu
            </span>
            <span className="text-[10px] text-[#6b8271] tracking-wider block font-sans">
              Lớp cô Ning Ning
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-[#5c7363] hover:text-[#1a3d2f] transition flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-[#e2dac9]"
        >
          <span>Về trang chủ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Container: Split Brand & Login Card */}
      <main className="relative z-10 max-w-6xl mx-auto w-full my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Branding Column (Classical Ink Typography) */}
        <div className="lg:col-span-6 hidden lg:flex flex-col justify-center pr-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-[#e2dac9] text-xs font-semibold text-[#1a3d2f] mb-6 backdrop-blur-sm shadow-2xs self-start">
            <Sparkles className="w-3.5 h-3.5 text-[#b91c1c]" />
            <span>Hệ thống học tập HSK 3.0 nội bộ</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#b91c1c] text-white flex items-center justify-center font-serif text-2xl font-black shadow-md">
              <span>汉语</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-[#1a3d2f] tracking-tight">
              Hanyu
            </h1>
          </div>

          <h2 className="text-2xl lg:text-3xl font-serif text-[#1a3d2f] font-semibold mb-6 leading-snug">
            Hành trình chinh phục <br />
            tiếng Trung, bắt đầu từ đây.
          </h2>

          <p className="text-[#64796a] text-sm leading-relaxed max-w-md font-sans">
            Không gian học tập chuẩn mực: cô giao bài, em làm bài, hệ thống ghi nhớ từ vựng ngắt quãng Leitner và sửa lỗi sai thông minh.
          </p>

          {/* Quick Demo Test Bar */}
          <div className="mt-8 p-4 rounded-2xl bg-white/70 border border-[#e2dac9] backdrop-blur-sm max-w-md">
            <span className="text-[11px] font-bold text-[#5c7363] uppercase tracking-wider block mb-2">
              🧪 Đăng nhập nhanh kiểm thử (1-chạm):
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => quickLogin("student")}
                className="flex-1 py-2 px-3 rounded-xl bg-[#eaf4ed] hover:bg-[#d5ebd9] text-[#1a3d2f] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <GraduationCap className="w-4 h-4 text-[#1a3d2f]" />
                <span>Học sinh (student)</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin("teacher")}
                className="flex-1 py-2 px-3 rounded-xl bg-[#f5ede4] hover:bg-[#ebdccc] text-[#854d0e] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <UserCheck className="w-4 h-4 text-[#854d0e]" />
                <span>Cô giáo (teacher)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Classical Card (Matching Mockup exactly) */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-[#fcfaf7] border border-[#e6decb] rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-900/5 backdrop-blur-md">
            {/* Role Toggle Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#eee8dc] mb-6">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  role === "STUDENT"
                    ? "bg-[#1a3d2f] text-white shadow-sm"
                    : "text-[#5c7363] hover:text-[#1a3d2f]"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Tôi là học viên</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("TEACHER")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  role === "TEACHER"
                    ? "bg-[#1a3d2f] text-white shadow-sm"
                    : "text-[#5c7363] hover:text-[#1a3d2f]"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Tôi là giáo viên</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-4"
            >
              {/* Input: Email or Username */}
              <div>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#8ea394] absolute left-4" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email hoặc số điện thoại"
                    className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#1e2e22] placeholder-[#8ea394] outline-none transition"
                  />
                </div>
              </div>

              {/* Input: Password */}
              <div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#8ea394] absolute left-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] focus:bg-white rounded-2xl pl-11 pr-11 py-3 text-xs sm:text-sm text-[#1e2e22] placeholder-[#8ea394] outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[#8ea394] hover:text-[#1a3d2f] transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#5c7363]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-[#1a3d2f] rounded cursor-pointer"
                  />
                  <span>Ghi nhớ tôi</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert("Vui lòng liên hệ cô Ning Ning để được cấp lại mật khẩu mới.")}
                  className="font-medium text-[#1a3d2f] hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#1a3d2f] text-white font-bold text-sm hover:bg-[#132e23] transition shadow-lg shadow-emerald-950/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                <span>{loading ? "Đang xử lý..." : "Đăng nhập →"}</span>
              </button>
            </form>

            {/* Social Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e6decb]" />
              </div>
              <span className="relative px-3 bg-[#fcfaf7] text-[11px] text-[#8ea394] uppercase tracking-wider font-medium">
                Hoặc đăng nhập bằng
              </span>
            </div>

            {/* Social Buttons */}
            <div className="flex items-center justify-center gap-3">
              {[
                { name: "WeChat", icon: "💬", bg: "hover:border-[#07c160] hover:text-[#07c160]" },
                { name: "Facebook", icon: "f", font: "font-serif font-black", bg: "hover:border-[#1877f2] hover:text-[#1877f2]" },
                { name: "Google", icon: "G", font: "font-bold", bg: "hover:border-[#ea4335] hover:text-[#ea4335]" },
                { name: "Apple", icon: "🍎", bg: "hover:border-black hover:text-black" },
              ].map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => alert(`Tính năng đăng nhập với ${s.name} đang mở!`)}
                  className={`w-11 h-11 rounded-full bg-white border border-[#e2dac9] text-sm text-[#4a5e52] flex items-center justify-center transition shadow-2xs cursor-pointer ${s.bg} ${s.font || ""}`}
                  title={`Đăng nhập qua ${s.name}`}
                >
                  {s.icon}
                </button>
              ))}
            </div>

            {/* Bottom Register Switch Link */}
            <div className="text-center pt-6 mt-6 border-t border-[#eee8dc] text-xs text-[#64796a]">
              <span>Chưa có tài khoản? </span>
              <Link
                href="/register"
                className="font-bold text-[#1a3d2f] hover:underline"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full py-2 text-center text-[11px] text-[#7d9385]">
        © 2026 Hanyu · Lớp tiếng Trung cô Ning Ning · Bảo lưu mọi quyền
      </footer>
    </div>
  );
}
