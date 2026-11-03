"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Flame,
  Shield,
  Bell,
  CheckCircle2,
  Sparkles,
  Award,
  Clock,
  Zap,
} from "lucide-react";

interface StreakGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  userXp: number;
  studentId?: string;
  onXpChange?: (newXp: number) => void;
}

export default function StreakGuardianModal({
  isOpen,
  onClose,
  currentStreak,
  userXp,
  studentId = "student",
  onXpChange,
}: StreakGuardianModalProps) {
  const [freezeActive, setFreezeActive] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notifSuccessMsg, setNotifSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    // Kiểm tra trạng thái khiên bảo vệ
    const storedFreeze = localStorage.getItem(`hsk_streak_freeze_${studentId}`);
    if (storedFreeze) {
      setFreezeActive(true);
    } else {
      setFreezeActive(false);
    }

    // Kiểm tra quyền thông báo
    if ("Notification" in window) {
      setNotificationEnabled(Notification.permission === "granted");
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  // 1. Kích hoạt Khiên bảo vệ chuỗi
  const handleActivateFreeze = () => {
    if (freezeActive) return;

    if (userXp < 50) {
      alert("Bạn cần tối thiểu 50 XP để đổi Khiên bảo vệ chuỗi.");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(`hsk_streak_freeze_${studentId}`, Date.now().toString());
      setFreezeActive(true);
      const remainingXp = Math.max(0, userXp - 50);
      onXpChange?.(remainingXp);
    }
  };

  // 2. Bật thông báo nhắc học hàng ngày
  const handleToggleNotification = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("Trình duyệt này chưa hỗ trợ tính năng thông báo Notification.");
      return;
    }

    if (Notification.permission === "granted") {
      setNotifSuccessMsg("Thông báo nhắc học lúc 20:00 hàng ngày đã được bật sẵn!");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationEnabled(true);
      setNotifSuccessMsg("Tuyệt vời! Hệ thống sẽ nhắc bạn học tiếng Trung vào 20:00 mỗi tối.");

      // Gửi thông báo thử nghiệm
      try {
        new Notification("Hanyu · Nhắc nhở học tập 🔥", {
          body: "Đã bật thông báo thành công! Cùng duy trì chuỗi học tập mỗi ngày nhé.",
          icon: "/brand/app-icon-192.png",
        });
      } catch {}
    } else {
      alert("Quyền thông báo chưa được cấp. Bạn hãy kiểm tra lại cài đặt trình duyệt nhé.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#204434]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFDF7] w-full max-w-md rounded-3xl border border-[#BC9B6B]/40 shadow-2xl p-6 space-y-5 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-[#315E48] hover:bg-[#204434]/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-orange-500 text-orange-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Chuỗi học tập &amp; Khiên bảo vệ
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-xs text-[#315E48]">
              Duy trì thói quen học tập để biến tiếng Trung thành phản xạ
            </p>
          </div>
        </div>

        {/* Current Streak Hero */}
        <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/15 to-orange-500/10 p-5 rounded-2xl border border-orange-400/30 text-center space-y-1.5">
          <div className="text-4xl font-extrabold text-orange-600 flex items-center justify-center gap-2">
            <span>🔥</span>
            <span>{currentStreak || 1}</span>
            <span className="text-xl font-bold text-[#204434]">ngày</span>
          </div>
          <p className="text-xs font-semibold text-[#204434]">
            Chuỗi ngày học liên tục của bạn
          </p>
          <p className="text-[11px] text-[#526C50]">
            Chỉ cần hoàn thành 1 bài luyện ngắn hoặc 15 phút học mỗi ngày để tăng chuỗi!
          </p>
        </div>

        {/* Feature 1: Khiên bảo vệ chuỗi (Streak Freeze) */}
        <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#BC9B6B]/30 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 fill-blue-600 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#204434]">
                  Khiên bảo vệ chuỗi (Streak Freeze)
                </h4>
                <p className="text-[11px] text-[#526C50]">
                  Bảo toàn chuỗi nếu một ngày bạn quá bận không kịp vào học.
                </p>
              </div>
            </div>

            {freezeActive ? (
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold shrink-0">
                🛡️ Đang bảo vệ
              </span>
            ) : (
              <button
                type="button"
                onClick={handleActivateFreeze}
                className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition cursor-pointer shrink-0 shadow-2xs"
              >
                Đổi (50 XP)
              </button>
            )}
          </div>

          <div className="text-[11px] text-[#7A5B2E] border-t border-[#BC9B6B]/20 pt-2 flex items-center justify-between">
            <span>XP hiện tại của bạn: <strong>{userXp} XP</strong></span>
            {freezeActive && <span className="text-blue-700 font-semibold">Đã được bảo vệ an toàn</span>}
          </div>
        </div>

        {/* Feature 2: Thông báo nhắc học hàng ngày */}
        <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#BC9B6B]/30 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#204434]">
                  Nhắc nhở học tập (20:00 tối)
                </h4>
                <p className="text-[11px] text-[#526C50]">
                  Gửi thông báo nhẹ nhàng nhắc bạn giữ vững chuỗi học trước khi hết ngày.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleNotification}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                notificationEnabled
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-[#204434] hover:bg-[#183629] text-white"
              }`}
            >
              {notificationEnabled ? "✓ Đã bật" : "Bật nhắc nhở"}
            </button>
          </div>

          {notifSuccessMsg && (
            <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              {notifSuccessMsg}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFDF7] text-xs font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
