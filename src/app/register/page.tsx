"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, UserCheck, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
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

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!agreeTerms) {
      setError("Vui lòng đồng ý với Điều khoản sử dụng.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username: identifier,
          email: identifier.includes("@") ? identifier : null,
          password,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Đăng ký không thành công.");
        setLoading(false);
        return;
      }

      // Lưu phiên đăng nhập
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      // Nếu là học sinh -> Chuyển sang bước Khảo sát mục tiêu (Onboarding)
      // Nếu là giáo viên -> Vào thẳng Dashboard
      if (role === "STUDENT") {
        router.push("/onboarding");
      } else {
        router.push("/t/dashboard");
      }
    } catch {
      setError("Không thể kết nối đến máy chủ.");
      setLoading(false);
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
          href="/login"
          className="text-xs font-semibold text-[#5c7363] hover:text-[#1a3d2f] transition flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-[#e2dac9]"
        >
          <span>Đã có tài khoản? Đăng nhập</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl mx-auto w-full my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Branding */}
        <div className="lg:col-span-6 hidden lg:flex flex-col justify-center pr-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-[#e2dac9] text-xs font-semibold text-[#1a3d2f] mb-6 backdrop-blur-sm shadow-2xs self-start">
            <Sparkles className="w-3.5 h-3.5 text-[#b91c1c]" />
            <span>Đăng ký thành viên mới</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#b91c1c] text-white flex items-center justify-center font-serif text-2xl font-black shadow-md">
              <span>汉语</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-[#1a3d2f] tracking-tight">
              Hanyu
            </h1>
          </div>

          <h2 className="text-2xl lg:text-3xl font-serif text-[#2a4537] italic font-normal mb-6 leading-snug">
            Học tiếng Trung <br />
            một cách đơn giản hơn.
          </h2>

          <p className="text-[#64796a] text-sm leading-relaxed max-w-md font-sans">
            Tạo tài khoản để tham gia vào lớp học của cô Ning Ning, làm bài kiểm tra HSK 3.0, sửa lỗi sai trong sổ tay và tích lũy điểm kinh nghiệm mỗi ngày.
          </p>
        </div>

        {/* Right Register Card */}
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
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#8ea394] absolute left-4" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Họ và tên"
                    className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#1e2e22] placeholder-[#8ea394] outline-none transition"
                  />
                </div>
              </div>

              {/* Email or Phone / Username */}
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

              {/* Password */}
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

              {/* Confirm Password */}
              <div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#8ea394] absolute left-4" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu"
                    className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] focus:bg-white rounded-2xl pl-11 pr-11 py-3 text-xs sm:text-sm text-[#1e2e22] placeholder-[#8ea394] outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 text-[#8ea394] hover:text-[#1a3d2f] transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-[#5c7363]">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 accent-[#1a3d2f] rounded cursor-pointer shrink-0 mt-0.5"
                  />
                  <span>
                    Tôi đồng ý với{" "}
                    <span className="font-semibold text-[#1a3d2f] underline">Điều khoản sử dụng</span>{" "}
                    và{" "}
                    <span className="font-semibold text-[#1a3d2f] underline">Chính sách bảo mật</span>
                  </span>
                </label>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#1a3d2f] text-white font-bold text-sm hover:bg-[#132e23] transition shadow-lg shadow-emerald-950/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-3"
              >
                <span>{loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}</span>
              </button>
            </form>

            {/* Bottom Login Switch Link */}
            <div className="text-center pt-5 mt-5 border-t border-[#eee8dc] text-xs text-[#64796a]">
              <span>Đã có tài khoản? </span>
              <Link
                href="/login"
                className="font-bold text-[#1a3d2f] hover:underline"
              >
                Đăng nhập
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
