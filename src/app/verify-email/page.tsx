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
          
          {/* Left Column (Desktop Only): Ink Art Moon Window */}
          <div className="lg:col-span-6 hidden lg:flex flex-col">
            <div className="relative rounded-3xl overflow-hidden border border-[#BC9B6B]/35 shadow-2xl shadow-[#204434]/10 aspect-[4/3] bg-[#EFE8DC]">
              <Image
                src="/theme/landing-moon-desk.jpg"
                alt="Khung cửa sổ trà đạo và góc học tập thanh tịnh"
                fill
                priority
                className="object-cover object-center filter saturate-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#204434]/70 via-[#204434]/20 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-medium text-[#FFFCF6] mb-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#BC9B6B]" />
                  <span>Xác thực an toàn & Bảo vệ quyền riêng tư</span>
                </div>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-[#FFFCF6] leading-snug">
                  “温故而知新，可以为师矣”
                </h3>
                <p className="text-xs text-[#FFFCF6]/85 font-light mt-1">
                  Ôn lại điều cũ, thấu hiểu điều mới — từng bước vững vàng trên hành trình HSK.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Verification Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-[#FFFCF6] border border-[#BC9B6B]/30 rounded-3xl p-7 sm:p-9 shadow-xl shadow-[#204434]/5 text-center">
              
              {/* Mail Icon Badge */}
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#204434]/10 border border-[#204434]/20 flex items-center justify-center text-[#204434] mb-5 shadow-xs">
                {verifiedSuccess ? (
                  <CheckCircle2 className="w-8 h-8 text-[#315E48]" />
                ) : (
                  <Mail className="w-8 h-8 text-[#204434]" />
                )}
              </div>

              {/* Title & Description */}
              <h1 className="font-serif text-3xl font-bold text-[#204434] tracking-tight">
                {verifiedSuccess ? "Xác minh thành công!" : "Xác minh email"}
              </h1>
              
              <p className="text-sm text-[#315E48] mt-2 leading-relaxed">
                {verifiedSuccess
                  ? "Tài khoản của bạn đã được kích hoạt. Đang chuyển tiếp sang thiết lập lộ trình học tập..."
                  : "Hanyu đã gửi một thư xác thực đến địa chỉ:"}
              </p>

              {/* Email Pill */}
              <div className="my-4 inline-block px-4 py-2 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/30 font-medium text-sm text-[#204434]">
                {email}
              </div>

              {!verifiedSuccess ? (
                <>
                  <p className="text-xs text-[#315E48]/80 leading-relaxed mb-6">
                    Vui lòng kiểm tra hộp thư đến (bao gồm cả thư rác / Spam) và nhấn vào liên kết xác nhận để kích hoạt tài khoản.
                  </p>

                  {/* Resend success toast */}
                  {resendSuccess && (
                    <div className="mb-4 p-3 rounded-xl bg-[#315E48]/10 border border-[#315E48]/25 text-xs text-[#204434] font-medium flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#315E48]" />
                      <span>Đã gửi lại email xác minh thành công!</span>
                    </div>
                  )}

                  {/* One-click Verify & Proceed button (local test simulator) */}
                  <button
                    type="button"
                    onClick={handleConfirmVerification}
                    disabled={verifying}
                    className="w-full bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] font-semibold py-3 rounded-xl transition duration-200 shadow-md shadow-[#204434]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mb-3"
                  >
                    {verifying ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                    className="w-full py-2.5 rounded-xl border border-[#BC9B6B]/30 hover:border-[#204434] bg-transparent text-xs font-semibold text-[#315E48] hover:text-[#204434] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? "animate-spin" : ""}`} />
                    <span>
                      {resendCooldown > 0
                        ? `Gửi lại sau (${resendCooldown}s)`
                        : "Gửi lại email xác minh"}
                    </span>
                  </button>

                  {/* Return to Login */}
                  <div className="mt-6 pt-4 border-t border-[#BC9B6B]/20">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 text-xs text-[#315E48] hover:text-[#204434] font-medium transition"
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
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 text-center text-xs text-[#315E48]/80 z-10">
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
