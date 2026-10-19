"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Home,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Inbox,
} from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("hocvien@hanyu.edu.vn");
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Tải email từ URL param hoặc sessionStorage
  useEffect(() => {
    const qEmail = searchParams.get("email");
    if (qEmail) {
      setEmail(qEmail);
    } else {
      const stored = sessionStorage.getItem("registeredEmail");
      if (stored) {
        setEmail(stored);
      } else {
        try {
          const userStored = localStorage.getItem("currentUser");
          if (userStored) {
            const u = JSON.parse(userStored);
            if (u.email) {
              setEmail(u.email);
            }
          }
        } catch {}
      }
    }
  }, [searchParams]);

  // Bộ đếm ngược gửi lại OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Gửi lại mã OTP qua email
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "RESEND" }),
      });
      const data = await res.json();
      if (data.success) {
        setResendCooldown(60);
        setSuccessMsg(data.message || `Mã OTP mới đã được gửi lại vào email ${email}! Vui lòng kiểm tra hộp thư.`);
      } else {
        setError(data.message || "Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
      }
    } catch {
      setError("Lỗi kết nối máy chủ khi gửi lại mã OTP.");
    }
  };

  // Xác nhận mã OTP do người dùng nhập từ email
  const handleConfirmVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanOtp = otpCode.trim();
    if (!cleanOtp) {
      setError("Vui lòng nhập mã OTP gồm 6 chữ số đã gửi về email của bạn.");
      return;
    }

    if (cleanOtp.length < 6) {
      setError("Mã OTP phải có đủ 6 chữ số.");
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: cleanOtp }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Mã OTP không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại email.");
        setVerifying(false);
        return;
      }

      setVerifying(false);
      setVerifiedSuccess(true);
      localStorage.setItem("hanyu_email_verified", "true");

      if (data.user) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
      }

      // Tự động chuyển tiếp sau 1.2s sang Màn hình Thiết lập học tập
      setTimeout(() => {
        router.push("/onboarding");
      }, 1200);
    } catch {
      setError("Lỗi kết nối máy chủ khi xác thực OTP.");
      setVerifying(false);
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
          
          {/* Left Column (Desktop Only): Security & Trust */}
          <div className="lg:col-span-6 hidden lg:flex flex-col justify-center pr-2 2xl:pr-6">
            <div className="p-5 2xl:p-8 rounded-3xl bg-[#FFFCF6]/80 backdrop-blur-md border border-[#BC9B6B]/35 shadow-xl shadow-[#204434]/10 space-y-3 2xl:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#204434]/10 text-[11px] 2xl:text-xs font-semibold text-[#204434]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#BC9B6B]" />
                <span>Bảo mật tài khoản qua mã OTP Email</span>
              </div>

              <h2 className="font-serif text-2xl 2xl:text-4xl font-bold tracking-tight text-[#204434] leading-snug">
                “温故而知新，可以为师矣”
              </h2>
              
              <p className="text-[11px] 2xl:text-xs text-[#315E48] font-mono">
                Wēn gù ér zhī xīn, kě yǐ wéi shī yǐ
              </p>

              <p className="text-xs 2xl:text-sm text-[#315E48] leading-relaxed">
                Để đảm bảo an toàn cho tài khoản và tiến trình học tập của bạn, Hanyu đã gửi một mã xác thực 6 chữ số về email đăng ký. Hãy mở hộp thư để lấy mã và tiếp tục hành trình.
              </p>

              <div className="pt-2 border-t border-[#BC9B6B]/25 flex items-center justify-between text-[11px] 2xl:text-xs text-[#315E48]">
                <span>Xác thực an toàn & Chuẩn hóa</span>
                <span className="font-serif font-bold text-[#9D493E]">Hanyu Security</span>
              </div>
            </div>
          </div>

          {/* Right Column: Verification Card */}
          <div className="lg:col-span-6 w-full max-w-sm 2xl:max-w-md mx-auto">
            <div className="bg-[#FFFCF6]/95 backdrop-blur-md border border-[#BC9B6B]/35 rounded-3xl p-5 sm:p-6 2xl:p-8 shadow-2xl shadow-[#204434]/10 text-center">
              
              {/* Mail Icon Badge */}
              <div className="w-12 h-12 2xl:w-16 2xl:h-16 mx-auto rounded-2xl bg-[#204434]/10 border border-[#204434]/20 flex items-center justify-center text-[#204434] mb-3 2xl:mb-4 shadow-xs">
                {verifiedSuccess ? (
                  <CheckCircle2 className="w-6 h-6 2xl:w-8 2xl:h-8 text-[#315E48]" />
                ) : (
                  <Mail className="w-6 h-6 2xl:w-8 2xl:h-8 text-[#204434]" />
                )}
              </div>

              {/* Title & Description */}
              <h1 className="font-serif text-2xl 2xl:text-3xl font-bold text-[#204434] tracking-tight">
                {verifiedSuccess ? "Xác minh thành công!" : "Xác minh email"}
              </h1>
              
              <p className="text-xs 2xl:text-sm text-[#315E48] mt-1.5 leading-relaxed">
                {verifiedSuccess
                  ? "Tài khoản của bạn đã được kích hoạt thành công. Đang chuyển tiếp sang thiết lập lộ trình học tập..."
                  : "Mã xác thực OTP đã được gửi về địa chỉ:"}
              </p>

              {/* Email Pill */}
              <div className="my-2.5 2xl:my-3 inline-block px-3.5 py-1.5 2xl:py-2 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/35 font-mono text-xs 2xl:text-sm font-semibold text-[#204434]">
                {email}
              </div>

              {!verifiedSuccess ? (
                <>
                  <div className="p-2.5 rounded-xl bg-[#F8F5ED]/80 border border-[#BC9B6B]/25 text-[11px] 2xl:text-xs text-[#315E48] text-left flex items-start gap-2 mb-3">
                    <Inbox className="w-4 h-4 text-[#BC9B6B] shrink-0 mt-0.5" />
                    <span>
                      Vui lòng mở hộp thư email của bạn (kiểm tra cả mục <strong>Thư rác / Spam</strong> nếu chưa thấy), sao chép mã 6 chữ số và nhập vào ô bên dưới.
                    </span>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <div className="mb-3 p-2.5 rounded-xl bg-[#9D493E]/10 border border-[#9D493E]/30 text-[#9D493E] text-xs flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Success Toast */}
                  {successMsg && (
                    <div className="mb-3 p-2.5 rounded-xl bg-[#315E48]/10 border border-[#315E48]/25 text-xs text-[#204434] font-medium flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#315E48] shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* OTP Form */}
                  <form onSubmit={handleConfirmVerification} className="space-y-3">
                    <div>
                      <label className="block text-left text-[#204434] font-semibold text-xs mb-1.5">
                        Nhập mã xác thực 6 số (OTP):
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-[#315E48] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="••••••"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/40 focus:outline-hidden focus:border-[#204434] font-mono text-center tracking-[0.5em] text-lg font-bold text-[#204434]"
                        />
                      </div>
                      <p className="text-[10px] text-[#315E48]/70 mt-1 text-right">
                        Mã có hiệu lực trong vòng 5 phút
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={verifying || otpCode.trim().length !== 6}
                      className="w-full bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] font-semibold py-2.5 2xl:py-3 rounded-xl transition duration-200 shadow-md shadow-[#204434]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs 2xl:text-sm"
                    >
                      {verifying ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Xác nhận mã OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Resend button with cooldown */}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className="w-full mt-2.5 py-2 rounded-xl border border-[#BC9B6B]/30 hover:border-[#204434] bg-transparent text-[11px] 2xl:text-xs font-semibold text-[#315E48] hover:text-[#204434] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? "animate-spin" : ""}`} />
                    <span>
                      {resendCooldown > 0
                        ? `Gửi lại sau (${resendCooldown}s)`
                        : "Chưa nhận được email? Gửi lại mã OTP"}
                    </span>
                  </button>

                  {/* Return to Login */}
                  <div className="mt-3.5 pt-3 border-t border-[#BC9B6B]/20">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 text-[11px] 2xl:text-xs text-[#315E48] hover:text-[#204434] font-medium transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay về trang đăng nhập</span>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-6 space-y-3">
                  <div className="w-8 h-8 border-3 border-[#204434] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-[#315E48] font-medium">
                    Đang kích hoạt tài khoản và chuyển tới không gian học tập...
                  </p>
                </div>
              )}

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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F5ED] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#204434] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
