"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, User, Lock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (overrideUser?: string, overridePass?: string) => {
    setLoading(true);
    setError("");

    const u = overrideUser || username;
    const p = overridePass || password;

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
        setLoading(false);
        return;
      }

      // Lưu thông tin phiên đăng nhập vào localStorage
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      // Phân quyền chuyển hướng
      if (data.user.role === "STUDENT") {
        router.push("/s/home");
      } else if (data.user.role === "TEACHER") {
        router.push("/t/dashboard");
      } else {
        router.push("/t/dashboard");
      }
    } catch {
      setError("Không thể kết nối đến máy chủ.");
      setLoading(false);
    }
  };

  const quickLogin = (role: "student" | "teacher" | "admin") => {
    if (role === "student") {
      setUsername("student");
      setPassword("student123");
      handleLogin("student", "student123");
    } else if (role === "teacher") {
      setUsername("teacher");
      setPassword("teacher123");
      handleLogin("teacher", "teacher123");
    } else {
      setUsername("admin");
      setPassword("admin123");
      handleLogin("admin", "admin123");
    }
  };

  return (
    <div className="min-h-screen bg-[#061609] text-white flex flex-col justify-between p-6">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-[#0d2816] flex items-center justify-center text-[#c3dc4e] font-black text-xl">
            宁
          </div>
          <div>
            <span className="font-bold text-white text-sm block">宁宁老师中文课堂</span>
            <span className="text-[11px] text-[#9cb396] block">Lớp tiếng Trung cô Ning Ning</span>
          </div>
        </Link>
        <Link
          href="/"
          className="text-xs text-[#9cb396] hover:text-white transition flex items-center gap-1"
        >
          <span>Về trang chủ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8 bg-[#0a2012] border border-[#234a29] rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c3dc4e]/10 border border-[#c3dc4e]/30 text-xs font-semibold text-[#c3dc4e] mb-3">
            <Sparkles className="w-3 h-3" />
            <span>Cổng đăng nhập nội bộ</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Đăng nhập lớp học</h2>
          <p className="text-xs text-[#9cb396]">
            Sử dụng tài khoản cô đã cấp để vào phòng luyện tập và làm bài
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-bold text-[#9cb396] block mb-1.5">Tên đăng nhập</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#9cb396] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: student, teacher, admin"
                className="w-full bg-[#061609] border border-[#234a29] focus:border-[#c3dc4e] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#9cb396] block mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9cb396] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full bg-[#061609] border border-[#234a29] focus:border-[#c3dc4e] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#c3dc4e] text-[#061609] font-bold text-sm hover:bg-[#b3cb40] transition shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4 stroke-[2.5]" />
            <span>{loading ? "Đang xử lý..." : "Đăng nhập ngay"}</span>
          </button>
        </form>

        {/* Quick Test Login Buttons for the 3 roles */}
        <div className="mt-8 pt-6 border-t border-[#234a29]/80">
          <div className="text-[11px] text-center font-bold text-[#9cb396] uppercase tracking-wider mb-3">
            ⚡ ĐĂNG NHẬP NHANH 1-CLICK ĐỂ TEST:
          </div>
          <div className="space-y-2">
            <button
              onClick={() => quickLogin("student")}
              className="w-full py-2.5 px-4 rounded-xl bg-[#122e1b] hover:bg-[#1a4427] border border-[#2d5c39] text-xs font-semibold text-white flex items-center justify-between transition cursor-pointer"
            >
              <span>🎓 1. Học sinh: Trần Minh Khang</span>
              <span className="font-mono text-[#c3dc4e] text-[11px]">student / student123 →</span>
            </button>

            <button
              onClick={() => quickLogin("teacher")}
              className="w-full py-2.5 px-4 rounded-xl bg-[#122e1b] hover:bg-[#1a4427] border border-[#2d5c39] text-xs font-semibold text-white flex items-center justify-between transition cursor-pointer"
            >
              <span>👩‍🏫 2. Giáo viên: Cô Ning Ning</span>
              <span className="font-mono text-[#c3dc4e] text-[11px]">teacher / teacher123 →</span>
            </button>

            <button
              onClick={() => quickLogin("admin")}
              className="w-full py-2.5 px-4 rounded-xl bg-[#122e1b] hover:bg-[#1a4427] border border-[#2d5c39] text-xs font-semibold text-white flex items-center justify-between transition cursor-pointer"
            >
              <span>🛡️ 3. Quản trị viên: Admin</span>
              <span className="font-mono text-[#c3dc4e] text-[11px]">admin / admin123 →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <div className="text-center text-xs text-[#9cb396]/60">
        © 2026 Lớp tiếng Trung cô Ning Ning · Hệ thống học tập nội bộ
      </div>
    </div>
  );
}
