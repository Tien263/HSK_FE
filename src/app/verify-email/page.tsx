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
  Sparkles,
  ArrowLeft,
  Home,
  ShieldCheck,
} from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("hocvien@hanyu.edu.vn");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

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
            if (u.email) setEmail(u.email);
          }
        } catch {}
      }
    }
  }, [searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    setResendSuccess(true);
    setTimeout(() => setResendSuccess(false), 5000);
  };

  const handleConfirmVerification = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerifiedSuccess(true);
      localStorage.setItem("hanyu_email_verified", "true");
      setTimeout(() => {
        router.push("/onboarding");
      }, 1200);
    }, 800);
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
                <span>Xác thực an toàn & Bảo vệ tài khoản</span>
              </div>

              <h2 className="font-serif text-2xl 2xl:text-4xl font-bold tracking-tight text-[#204434] leading-snug">
                “温故而知新，可以为师矣”
              </h2>
              
              <p className="text-[11px] 2xl:text-xs text-[#315E48] font-mono">
                Wēn gù ér zhī xīn, kě yǐ wéi shī yǐ
              </p>

              <p className="text-xs 2xl:text-sm text-[#315E48] leading-relaxed">
                Ôn lại điều cũ, thấu hiểu điều mới. Kích hoạt tài khoản để bước vào lộ trình học tập được thiết kế riêng cho mục tiêu của bạn.
              </p>
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
                  ? "Tài khoản của bạn đã được kích hoạt. Đang chuyển tiếp sang thiết lập lộ trình học tập..."
                  : "Hanyu đã gửi một thư xác thực đến địa chỉ:"}
              </p>

              {/* Email Pill */}
              <div className="my-3 2xl:my-4 inline-block px-3.5 py-1.5 2xl:py-2 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/35 font-medium text-xs 2xl:text-sm text-[#204434]">
                {email}
              </div>

              {!verifiedSuccess ? (
                <>
                  <p className="text-[11px] 2xl:text-xs text-[#315E48]/80 leading-relaxed mb-4 2xl:mb-5">
                    Vui lòng kiểm tra hộp thư đến (bao gồm cả thư rác / Spam) và nhấn vào liên kết xác nhận để kích hoạt tài khoản.
                  </p>

                  {/* Resend success toast */}
                  {resendSuccess && (
                    <div className="mb-3 p-2.5 rounded-xl bg-[#315E48]/10 border border-[#315E48]/25 text-xs text-[#204434] font-medium flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#315E48]" />
                      <span>Đã gửi lại email xác minh thành công!</span>
                    </div>
                  )}

                  {/* One-click Verify & Proceed button */}
                  <button
                    type="button"
                    onClick={handleConfirmVerification}
                    disabled={verifying}
                    className="w-full bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] font-semibold py-2.5 2xl:py-3 rounded-xl transition duration-200 shadow-md shadow-[#204434]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mb-2.5 text-xs 2xl:text-sm"
                  >
                    {verifying ? (
                      <div className="w-4 h-4 2xl:w-5 2xl:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Xác nhận & Thiết lập học tập</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Resend button with cooldown */}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className="w-full py-2 2xl:py-2.5 rounded-xl border border-[#BC9B6B]/30 hover:border-[#204434] bg-transparent text-[11px] 2xl:text-xs font-semibold text-[#315E48] hover:text-[#204434] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? "animate-spin" : ""}`} />
                    <span>
                      {resendCooldown > 0
                        ? `Gửi lại sau (${resendCooldown}s)`
                        : "Gửi lại email xác minh"}
                    </span>
                  </button>

                  {/* Return to Login */}
                  <div className="mt-4 2xl:mt-5 pt-3 border-t border-[#BC9B6B]/20">
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
                <div className="py-4">
                  <div className="w-6 h-6 border-2 border-[#204434] border-t-transparent rounded-full animate-spin mx-auto" />
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
