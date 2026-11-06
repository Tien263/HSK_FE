"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Download, X, Share, PlusSquare, Sparkles } from "lucide-react";

export default function PwaInstallBanner() {
  const pathname = usePathname();
  const isAdminPage = pathname === "/admin" || pathname?.startsWith("/admin/");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (isAdminPage) return;

    // Kiểm tra xem đã chạy trong chế độ PWA (Standalone) hay chưa
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      return;
    }

    // Kiểm tra xem người dùng đã đóng banner gần đây chưa (7 ngày)
    const dismissedAt = localStorage.getItem("hanyu_pwa_dismissed_at");
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Kiểm tra hệ điều hành iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Lắng nghe sự kiện cài đặt trên Android / Chrome
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Nếu là thiết bị di động (kể cả iOS) thì hiển thị banner sau 3 giây vào trang
    const timer = setTimeout(() => {
      const isMobile = isIosDevice || /android|mobile/.test(userAgent);
      if (isMobile) {
        setShowBanner(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      clearTimeout(timer);
    };
  }, [isAdminPage]);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      setShowIosGuide(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIosGuide(false);
    try {
      localStorage.setItem("hanyu_pwa_dismissed_at", Date.now().toString());
    } catch {}
  };

  if (isAdminPage || !showBanner) return null;

  return (
    <>
      {/* Banner ghim đáy tinh tế cho mobile */}
      <div className="fixed bottom-20 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-96 z-40 bg-[#FFFDF7] border border-[#BC9B6B]/40 rounded-2xl shadow-xl p-3.5 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#204434] p-1.5 flex items-center justify-center shrink-0 shadow-sm border border-[#D9B472]/30">
            <span className="text-[#FCEFD2] font-serif font-bold text-lg">汉</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Ứng dụng Hanyu HSK</span>
            </div>
            <p className="text-xs font-semibold text-[#204434] leading-snug mt-0.5">
              Cài đặt ra Màn hình chính
            </p>
            <p className="text-[11px] text-[#526C50] leading-tight mt-0.5">
              Mở toàn màn hình, học mượt &amp; không có thanh trình duyệt.
            </p>

            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 rounded-lg bg-[#204434] hover:bg-[#183629] text-[#FFFDF7] text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#D9B472]" />
                <span>Cài đặt ngay</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-[11px] font-medium text-[#526C50] hover:text-[#204434] px-2 py-1 transition cursor-pointer"
              >
                Để sau
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full text-[#526C50] hover:bg-[#204434]/10 transition cursor-pointer -mr-1 -mt-1"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal hướng dẫn cho iOS Safari */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF7] w-full max-w-sm rounded-3xl border border-[#BC9B6B]/40 shadow-2xl p-5 space-y-4 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-[#526C50] hover:bg-[#204434]/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1 pt-1">
              <div className="w-14 h-14 rounded-2xl bg-[#204434] text-[#FCEFD2] font-serif font-bold text-2xl mx-auto flex items-center justify-center shadow-md border border-[#D9B472]/40">
                汉
              </div>
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Cài đặt Hanyu trên iPhone / iPad
              </h3>
              <p className="text-xs text-[#526C50]">
                Chỉ mất 5 giây để đưa Hanyu ra màn hình chính:
              </p>
            </div>

            <div className="bg-[#F8F5ED] rounded-2xl p-3.5 space-y-2.5 text-xs text-[#204434] border border-[#BC9B6B]/20">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#204434] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  1
                </span>
                <span>
                  Bấm nút <strong>Chia sẻ (Share)</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-emerald-800" /> ở thanh dưới trình duyệt Safari.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#204434] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  2
                </span>
                <span>
                  Kéo xuống chọn <strong>Thêm vào MH chính</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-800" /> (Add to Home Screen).
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#204434] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  3
                </span>
                <span>
                  Bấm <strong>Thêm (Add)</strong> ở góc trên bên phải màn hình.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFDF7] font-bold text-xs transition cursor-pointer"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
}
